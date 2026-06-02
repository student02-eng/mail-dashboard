import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/spreadsheets.readonly",
        },
      },
    }),
  ],
  callbacks: {
    jwt({ token, account }) {
      // 최초 로그인 시 access_token 저장
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any).accessToken = token.accessToken;
      return session;
    },
    signIn({ profile }) {
      const allowed = (process.env.ALLOWED_HOSTED_DOMAINS ?? "")
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);
      if (allowed.length === 0) return true;
      const email = profile?.email ?? "";
      return allowed.some((domain) => email.endsWith(`@${domain}`));
    },
  },
});
