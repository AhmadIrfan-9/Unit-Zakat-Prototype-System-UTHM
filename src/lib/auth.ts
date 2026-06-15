// src/lib/auth.ts
//
// Auth.js v5 (next-auth@5 beta) — unified config pattern.
// This file exports four named helpers used across the app:
//   auth()    → read the session in Server Components / Server Actions
//   handlers  → spread into the API route catch-all (GET, POST)
//   signIn()  → call from Server Actions or client to initiate login
//   signOut() → call from Server Actions or client to log out

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { z } from "zod";

// Narrow Zod schema — validated BEFORE any DB query so bad input never reaches Prisma
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { auth, handlers, signIn, signOut } = NextAuth({
  // PrismaAdapter maps Auth.js's User/Account/Session/VerificationToken
  // directly to the Prisma models defined in schema.prisma.
  adapter: PrismaAdapter(prisma),

  // JWT sessions avoid a DB roundtrip on every request to validate the session.
  // Preferred on Vercel where serverless cold-starts make DB connections expensive.
  session: { strategy: "jwt" },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      // `authorize` must return a User object or null — never throw DB errors to client.
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            // passwordHash field — add this column to User in schema.prisma if using credentials
            // passwordHash: true,
          },
        });

        // Uncomment when you add password auth:
        // if (!user?.passwordHash) return null;
        // const isValid = await compare(parsed.data.password, user.passwordHash);
        // if (!isValid) return null;

        return user ? { id: user.id, email: user.email, name: user.name, image: user.image } : null;
      },
    }),
  ],

  callbacks: {
    // Embed the DB user.id into the JWT so Server Components can access
    // session.user.id without an extra DB roundtrip per request.
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },

    // Expose token.id in the session object — accessible in RSC and client components.
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",   // Redirect unauthenticated users here
    error: "/login",    // Auth errors (e.g. OAuthAccountNotLinked) redirect here
  },
});
