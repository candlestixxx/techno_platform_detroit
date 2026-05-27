import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
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

        // Mock password verification for scaffolding phase.
        // In production, we would use bcrypt.compare(credentials.password, user.passwordHash)
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          // If the user doesn't exist during this mock test phase, let's create a mock profile
          // so the developer can log in.
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              role: "USER" // Defaulting to USER for now
            }
          });
          return newUser;
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
