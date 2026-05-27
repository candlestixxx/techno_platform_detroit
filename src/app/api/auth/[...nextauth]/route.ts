import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock_google_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock_google_secret",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "mock_github_id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "mock_github_secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "dj@underground.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          // If the user doesn't exist, create a new profile with the hashed password
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              password: hashedPassword,
              role: "USER" // Defaulting to USER for now
            }
          });
          return newUser;
        }

        // Verify the password if the user exists and has a password set
        if (!user.password) return null;

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return user;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin', // We will build a custom sign in page eventually
  },
  secret: process.env.NEXTAUTH_SECRET || "default_mock_secret_for_local_dev",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
