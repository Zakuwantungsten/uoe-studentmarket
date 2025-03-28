import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { compare } from "bcrypt"
import prisma from "@/lib/prisma"
import { User as AppUser } from "@/lib/types"

// Create a specific type for NextAuth users to avoid conflicts with our app's User type
interface NextAuthUser {
  id: string
  name: string
  email: string
  role: "USER" | "PROVIDER" | "ADMIN"
  image?: string
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // Return only the fields needed for NextAuth
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // This is the NextAuthUser from the authorize function
      if (user) {
        // Use a type assertion to handle the custom properties
        const authUser = user as NextAuthUser;
        return {
          ...token,
          id: authUser.id,
          role: authUser.role,
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
        },
      }
    },
  },
}