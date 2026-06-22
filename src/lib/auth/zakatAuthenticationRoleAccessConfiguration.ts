// This central configuration file registers authentication providers and maps custom user role parameters securely across token and session lifecycles.

import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { z } from "zod";

// This declaration block extends the Auth.js v5 User and Session interfaces to surface staff roles, employee numbers, and address data on every server and client session object.
declare module "next-auth" {
  interface User {
    id?: string;
    noPekerja?: string | null;
    noKP?: string | null;
    gajiSemasa?: number | null;
    alamatRumah?: string | null;
    role?: "USER_STAFF" | "MANAGEMENT_STAFF";
  }
  interface Session {
    user: {
      id: string;
      noPekerja?: string | null;
      noKP?: string | null;
      gajiSemasa?: number | null;
      alamatRumah?: string | null;
      role?: "USER_STAFF" | "MANAGEMENT_STAFF";
    } & DefaultSession["user"];
  }
}

// This credentials schema validates that the login payload meets minimum character constraints before any database query executes.
const credentialsSchema = z.object({
  noPekerja: z.string().min(3, "No. Pekerja minimum 3 aksara"),
  password:  z.string().min(6, "Kata laluan minimum 6 aksara"),
});

// This authentication configuration registers the Credentials provider and wires all custom token-to-session mapping callbacks.
export const { auth, handlers, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },

  // Harden session token cookies to prevent XSS exfiltration and cross-site request hijacking.
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  providers: [
    // This provider maps staff employee numbers and hashed passwords to authenticate portal sign-in requests.
    Credentials({
      name: "Credentials",
      credentials: {
        noPekerja: { label: "No. Pekerja", type: "text" },
        password:  { label: "Kata Laluan", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials) return null;

        // This schema parse step rejects malformed credentials before any database round-trip.
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { noPekerja, password } = parsed.data;

        // This query retrieves the unique user record matched by the submitted employee number.
        const user = await prisma.user.findUnique({
          where: { noPekerja },
          select: {
            id:             true,
            name:           true,
            email:          true,
            noPekerja:      true,
            noKP:           true,
            gajiSemasa:     true,
            alamatRumah:    true,
            role:           true,
            passwordHash:   true,
            // Security interceptor evaluating credential attempts and configuring a strict 15-minute runtime lockout window.
            failedAttempts: true,
            lockoutUntil:   true,
          },
        });

        if (!user || !user.passwordHash) return null;

        // 1. Semak sama ada akaun sedang berada di dalam tempoh sekatan amaran
        if (user.lockoutUntil && new Date() < new Date(user.lockoutUntil)) {
          const releaseTime = new Date(user.lockoutUntil).toLocaleTimeString("ms-MY", {
            hour: "2-digit",
            minute: "2-digit",
          });
          throw new Error(`Akaun anda dikunci sementara. Sila cuba semula selepas ${releaseTime}.`);
        }

        // 2. Senario: Kata laluan betul — sahkan dengan bcrypt hash
        const isValid = await compare(password, user.passwordHash);

        if (isValid) {
          // Set semula bilangan kegagalan kepada sifar jika berjaya masuk
          await prisma.user.update({
            where: { id: user.id },
            data: { failedAttempts: 0, lockoutUntil: null },
          });

          // This return object seeds the JWT on the first sign-in event with all required identity fields.
          return {
            id:          user.id,
            name:        user.name,
            email:       user.email,
            noPekerja:   user.noPekerja,
            noKP:        user.noKP,
            gajiSemasa:  user.gajiSemasa ? Number(user.gajiSemasa) : null,
            alamatRumah: user.alamatRumah ?? null,
            role:        user.role,
          };
        }

        // 3. Senario: Kata laluan salah — kemas kini pembilang dan kunci jika had dicapai
        const nextAttempts = (user.failedAttempts ?? 0) + 1;
        const MAX_ATTEMPTS = 5;
        const shouldLock = nextAttempts >= MAX_ATTEMPTS;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedAttempts: nextAttempts,
            // Kunci 15 minit jika had dicapai, kekalkan nilai lama jika belum
            lockoutUntil: shouldLock
              ? new Date(Date.now() + 15 * 60 * 1000)
              : user.lockoutUntil,
          },
        });

        throw new Error(
          shouldLock
            ? "Had cubaan log masuk tamat. Akaun dikunci selama 15 minit."
            : `Kata laluan salah. Baki cubaan: ${MAX_ATTEMPTS - nextAttempts} kali lagi.`
        );
      },
    }),
  ],

  callbacks: {
    // This jwt callback uses a two-phase strategy: on initial sign-in it seeds the token directly from the authorize return object; on subsequent refreshes it re-syncs from the database using the stable token.sub claim.
    async jwt({ token, user }) {
      // Phase 1: Initial sign-in — the `user` object exists only on this first invocation.
      if (user) {
        // This block copies all custom identity fields directly from the authorize payload into the JWT state.
        token.id          = user.id;
        token.noPekerja   = (user.noPekerja   as string | null | undefined) ?? null;
        token.noKP        = (user.noKP        as string | null | undefined) ?? null;
        token.gajiSemasa  = (user.gajiSemasa  as number | null | undefined) ?? null;
        token.alamatRumah = (user.alamatRumah as string | null | undefined) ?? null;
        token.role        = (user.role        as "USER_STAFF" | "MANAGEMENT_STAFF" | undefined) ?? "USER_STAFF";
        return token;
      }

      // Phase 2: Subsequent requests — re-sync custom fields from the database using the stable subject claim.
      const lookupId = (token.id as string | undefined) ?? token.sub;
      if (lookupId) {
        try {
          // This database query refreshes the JWT payload with the latest user profile values on every token rotation.
          const dbUser = await prisma.user.findUnique({
            where: { id: lookupId },
            select: {
              id:          true,
              noPekerja:   true,
              noKP:        true,
              gajiSemasa:  true,
              alamatRumah: true,
              role:        true,
            },
          });

          if (dbUser) {
            // This block updates the token with fresh database values to reflect any profile changes between sessions.
            token.id          = dbUser.id;
            token.noPekerja   = dbUser.noPekerja   ?? null;
            token.noKP        = dbUser.noKP         ?? null;
            token.gajiSemasa  = dbUser.gajiSemasa   ? Number(dbUser.gajiSemasa) : null;
            token.alamatRumah = dbUser.alamatRumah  ?? null;
            token.role        = dbUser.role;
          }
        } catch (refreshError) {
          // This catch block preserves the existing token payload when a transient database error occurs during refresh to avoid session invalidation.
          console.warn(
            "[auth.jwt] DB refresh skipped — preserving existing token payload:",
            refreshError
          );
        }
      }

      return token;
    },

    // This session callback injects all custom JWT fields into the exposed session.user object so every server component and client context reads a fully-populated identity record.
    async session({ session, token }) {
      if (token && session.user) {
        // This assignment block propagates id, noPekerja, noKP, gajiSemasa, alamatRumah, and role from the JWT into the session user object.
        session.user.id          = ((token.id as string | undefined) ?? token.sub ?? "") as string;
        session.user.noPekerja   = (token.noPekerja   as string | null | undefined) ?? null;
        session.user.noKP        = (token.noKP        as string | null | undefined) ?? null;
        session.user.gajiSemasa  = (token.gajiSemasa  as number | null | undefined) ?? null;
        (session.user as { alamatRumah?: string | null }).alamatRumah =
          (token.alamatRumah as string | null | undefined) ?? null;
        session.user.role        = (token.role as "USER_STAFF" | "MANAGEMENT_STAFF" | undefined) ?? "USER_STAFF";
      }
      return session;
    },

    // This authorized callback acts as an edge-layer route guard, blocking unauthenticated users from dashboard paths and redirecting non-management staff away from the executive portal.
    async authorized({ auth: sessionAuth, request: { nextUrl } }) {
      const isLoggedIn   = !!sessionAuth?.user;
      const isDashboard  = nextUrl.pathname.startsWith("/dashboard");
      const isManagement = nextUrl.pathname.startsWith("/dashboard/pengurusan");

      if (isDashboard) {
        if (!isLoggedIn) {
          // This redirect sends unauthenticated requests to the login page.
          return Response.redirect(new URL("/login", nextUrl));
        }
        if (isManagement && sessionAuth.user?.role !== "MANAGEMENT_STAFF") {
          // This redirect prevents non-management staff from accessing the executive dashboard.
          return Response.redirect(new URL("/dashboard/zakat", nextUrl));
        }
        return true;
      }
      return true;
    },
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },
});
