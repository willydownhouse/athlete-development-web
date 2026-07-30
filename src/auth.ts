import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
    }),
  ],
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      // NextAuth only provides user during sign-in even though the callback type is narrower here.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (user) {
        token.sub = user.id;
      }

      return token;
    },
    session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
});
