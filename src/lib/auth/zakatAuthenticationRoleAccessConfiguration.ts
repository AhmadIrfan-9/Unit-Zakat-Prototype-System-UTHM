// src/lib/auth/zakatAuthenticationRoleAccessConfiguration.ts

import NextAuth, { type DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { z } from "zod";

// This declaration block extends the standard Auth.js User, Session, and JWT interfaces to recognize staff roles and numbers.
declare module "next-auth" {
  interface User {
    id?: string;
    noPekerja?: string | null;
    noKP?: string | null;
    gajiSemasa?: number | null;
    role?: "USER_STAFF" | "MANAGEMENT_STAFF";
  }
  interface Session {
    user: {
      id: string;
      noPekerja?: string | null;
      noKP?: string | null;
      gajiSemasa?: number | null;
      role?: "USER_STAFF" | "MANAGEMENT_STAFF";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    noPekerja?: string | null;
    noKP?: string | null;
    gajiSemasa?: number | null;
    role?: "USER_STAFF" | "MANAGEMENT_STAFF";
  }
}

// This credentials schema ensures login parameters are validated prior to querying database resources.
const credentialsSchema = z.object({
  noPekerja: z.string().min(3, "No. Pekerja minimum 3 aksara"),
  password: z.string().min(6, "Kata laluan minimum 6 aksara"),
});

// This authentication config monitors user credentials and embeds explicit user roles into server sessions to secure system route boundaries.
export const { auth, handlers, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    // This provider maps staff worker IDs and credentials to authenticate portal logins.
    Credentials({
      name: "Credentials",
      credentials: {
        noPekerja: { label: "No. Pekerja", type: "text" },
        password: { label: "Kata Laluan", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { noPekerja, password } = parsed.data;

        // Perform a database lookup to retrieve user details by worker number.
        const user = await prisma.user.findUnique({
          where: { noPekerja },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        // Compare the submitted password with the saved bcrypt hash value.
        const isValid = await compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          noPekerja: user.noPekerja,
          noKP: user.noKP,
          gajiSemasa: user.gajiSemasa ? Number(user.gajiSemasa) : null,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // This callback looks up the active user record on each JWT generation to sync roles directly at the network edge.
    async jwt({ token, user }) {
      const targetId = token.sub || user?.id;
      if (targetId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: targetId },
          select: {
            id: true,
            noPekerja: true,
            noKP: true,
            gajiSemasa: true,
            role: true,
          },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.noPekerja = dbUser.noPekerja;
          token.noKP = dbUser.noKP;
          token.gajiSemasa = dbUser.gajiSemasa ? Number(dbUser.gajiSemasa) : null;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    // This callback exposes database roles and worker attributes within client-accessible session tokens.
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.noPekerja = token.noPekerja;
        session.user.noKP = token.noKP;
        session.user.gajiSemasa = token.gajiSemasa;
        session.user.role = token.role;
      }
      return session;
    },
    // This callback acts as an edge router guard restricting access to management sub-directories based on roles.
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isManagement = nextUrl.pathname.startsWith("/dashboard/pengurusan");

      if (isDashboard) {
        if (!isLoggedIn) {
          return false;
        }
        if (isManagement && auth.user?.role !== "MANAGEMENT_STAFF") {
          return Response.redirect(new URL("/dashboard/zakat", nextUrl));
        }
        return true;
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
