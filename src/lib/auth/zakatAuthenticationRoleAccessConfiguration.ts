// This central configuration file registers authentication providers and maps custom user role parameters securely across token and session lifecycles.

import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

// This declaration block extends the Auth.js v5 User and Session interfaces to surface staff roles, employee numbers, and address data on every server and client session object.
declare module "next-auth" {
  interface User {
    id?: string;
    noPekerja?: string | null;
    noKP?: string | null;
    gajiSemasa?: number | null;
    alamatRumah?: string | null;
    role?: "STAFF" | "ZAKAT_OFFICER" | "SUPER_ADMIN" | "USER" | "MANAGEMENT";
  }
  interface Session {
    user: {
      id: string;
      noPekerja?: string | null;
      noKP?: string | null;
      gajiSemasa?: number | null;
      alamatRumah?: string | null;
      role?: "STAFF" | "ZAKAT_OFFICER" | "SUPER_ADMIN" | "USER" | "MANAGEMENT";
    } & DefaultSession["user"];
  }
}

// This credentials schema validates that the login payload meets minimum character constraints before any database query executes.
const credentialsSchema = z.object({
  noPekerja: z.string().min(3, "No. Pekerja minimum 3 aksara"),
  password:  z.string().min(6, "Kata laluan minimum 6 aksara"),
});

// This authentication configuration registers the Credentials provider and wires all custom token-to-session mapping callbacks.
const useSecureCookies = process.env.NODE_ENV === "production";
const cookieName = useSecureCookies ? "__Secure-next-auth.session-token" : "next-auth.session-token";

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },

  // Harden session token cookies dynamically across development and production environments.
  cookies: {
    sessionToken: {
      name: cookieName,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: useSecureCookies,
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

        // Dynamically import database and cryptography dependencies to protect Vercel Edge Runtime environment
        const { prisma } = await import("@/lib/prisma");
        const { compare } = await import("bcryptjs");

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

        // SUNTIKAN FORENSIK: Rekodkan percubaan log masuk gagal ke jadual AuditLog
        const { createImmutableAuditLog } = await import("@/lib/audit");
        if (shouldLock) {
          await createImmutableAuditLog(
            "AKAUN_DIKUNCI",
            user.email || "UNKNOWN_USER",
            "Akaun Pengguna",
            JSON.stringify({
              noPekerja,
              reason: "Had 5 cubaan gagal dicapai. Akaun dikunci 15 minit.",
              failedAttempts: nextAttempts,
              userId: user.id,
            }),
            "system-auth-event"
          );
        } else {
          await createImmutableAuditLog(
            "LOG_MASUK_GAGAL",
            user.email || "UNKNOWN_USER",
            "Akaun Pengguna",
            JSON.stringify({
              noPekerja,
              reason: "Kata laluan salah",
              failedAttempts: nextAttempts,
              userId: user.id,
            }),
            "system-auth-event"
          );
        }

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
        token.role        = (user.role        as "STAFF" | "ZAKAT_OFFICER" | "SUPER_ADMIN" | "USER" | "MANAGEMENT" | undefined) ?? "STAFF";
        return token;
      }

      // Phase 2: Subsequent requests — re-sync custom fields from the database using the stable subject claim.
      // Bypass database lookup during Vercel Edge Runtime to prevent Prisma connection errors and speed up requests.
      const lookupId = (token.id as string | undefined) ?? token.sub;
      if (lookupId && process.env.NEXT_RUNTIME !== "edge") {
        try {
          const { prisma } = await import("@/lib/prisma");
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
        session.user.role        = (token.role as "STAFF" | "ZAKAT_OFFICER" | "SUPER_ADMIN" | undefined) ?? "STAFF";
      }
      return session;
    },

    // This authorized callback acts as an edge-layer route guard, blocking unauthenticated users from dashboard paths and redirecting non-management staff away from the executive portal.
    async authorized({ auth: sessionAuth, request: { nextUrl } }) {
      const isLoggedIn      = !!sessionAuth?.user;
      const isDashboard     = nextUrl.pathname.startsWith("/dashboard");
      const isManagement    = nextUrl.pathname.startsWith("/dashboard/pengurusan");
      const isAdmin         = nextUrl.pathname.startsWith("/dashboard/admin");
      const userRole        = sessionAuth?.user?.role;
      const isOfficialStaff = userRole === "ZAKAT_OFFICER" || userRole === "SUPER_ADMIN";
      const isSuperAdmin    = userRole === "SUPER_ADMIN";

      if (isDashboard) {
        if (!isLoggedIn) {
          // This redirect sends unauthenticated requests to the login page.
          return Response.redirect(new URL("/login", nextUrl));
        }
        if (isManagement && !isOfficialStaff) {
          // This redirect prevents STAFF from accessing the management dashboard.
          return Response.redirect(new URL("/dashboard/zakat", nextUrl));
        }
        if (isAdmin && !isSuperAdmin) {
          // This redirect prevents non-SUPER_ADMIN users from accessing the system dashboard.
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

  // SUNTIKAN KOD: Menangkap isyarat aktiviti keselamatan gred perusahaan
  // Hooks into identity provider lifecycle events to capture terminal forensics.
  events: {
    async signIn({ user }) {
      try {
        const { createImmutableAuditLog } = await import("@/lib/audit");
        await createImmutableAuditLog(
          "LOG_MASUK_BERJAYA",
          user.email ?? "ANONYMOUS",
          "Akaun Pengguna",
          JSON.stringify({
            name: user.name ?? "Kakitangan",
            role: (user as { role?: string }).role ?? "STAFF",
            userId: user.id ?? null,
          }),
          "system-auth-event"
        );
      } catch (err) {
        console.error("[auth.events.signIn] Gagal menulis audit log:", err);
      }
    },
    async signOut(message) {
      try {
        const { createImmutableAuditLog } = await import("@/lib/audit");
        const tokenData = "token" in message && message.token
          ? (message.token as { sub?: string; email?: string; name?: string })
          : null;
        await createImmutableAuditLog(
          "LOG_KELUAR_SISTEM",
          tokenData?.email ?? "ANONYMOUS",
          "Sesi Autentikasi",
          JSON.stringify({
            name: tokenData?.name ?? "Kakitangan",
            userId: tokenData?.sub ?? null,
          }),
          "system-auth-event"
        );
      } catch (err) {
        console.error("[auth.events.signOut] Gagal menulis audit log:", err);
      }
    },
  },
});
