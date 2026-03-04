import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(
      `NextAuth: ${name} is not set. Add it in Vercel → Settings → Environment Variables (and in Google Cloud for client ID/secret).`
    );
  }
  return value;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: requireEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            GSC_SCOPE,
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session as { accessToken?: string }).accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: requireEnv("NEXTAUTH_SECRET"),
};
