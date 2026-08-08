import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { AUTH_PROVIDER_ACCOUNT_ID_CLAIM, AUTH_PROVIDER_CLAIM } from "@/lib/auth-claims";

export const { handlers, auth, signIn, signOut } = NextAuth({
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
    jwt({ token, user, account }) {
      if (account?.provider && account.providerAccountId) {
        token[AUTH_PROVIDER_CLAIM] = account.provider;
        token[AUTH_PROVIDER_ACCOUNT_ID_CLAIM] = account.providerAccountId;
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Auth.js only provides user during sign-in.
      if (user?.email) {
        token.email = user.email;
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Auth.js only provides user during sign-in.
      if (user?.name) {
        token.name = user.name;
      }

      return token;
    },
    session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- session.user is present for authenticated sessions.
      if (session.user) {
        const providerAccountId = token[AUTH_PROVIDER_ACCOUNT_ID_CLAIM];

        if (typeof providerAccountId === "string") {
          session.user.id = providerAccountId;
        }

        if (typeof token.email === "string") {
          session.user.email = token.email;
        }

        if (typeof token.name === "string") {
          session.user.name = token.name;
        }
      }

      return session;
    },
  },
});
