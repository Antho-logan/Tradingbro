import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
// import Facebook from "next-auth/providers/facebook"; // if you use it

const authOptions = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Facebook({ clientId: process.env.FACEBOOK_ID!, clientSecret: process.env.FACEBOOK_SECRET! }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  // callbacks/session/etc — keep yours here if you already have them
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };