import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
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
