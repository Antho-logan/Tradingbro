import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
// import Facebook from "next-auth/providers/facebook"; // if you use it

// Only include providers if credentials are available
const providers = [];

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  );
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Add Facebook provider if credentials are available
// if (process.env.FACEBOOK_ID && process.env.FACEBOOK_SECRET) {
//   providers.push(
//     Facebook({
//       clientId: process.env.FACEBOOK_ID,
//       clientSecret: process.env.FACEBOOK_SECRET!
//     })
//   );
// }

const authOptions = {
  providers,
  pages: {
    signIn: "/auth/signin",
  },
  // callbacks/session/etc — keep yours here if you already have them
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };