import { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

export const authOptions : NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email as string }
        })

        if (!user || !user.password) return null
        
        const isValid = await bcrypt.compare(
          credentials?.password as string,
          user.password
        )

        return isValid ? user : null
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any}) {
      if (user) {
        token.id = user.id
        token.name = user.username
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          name: token.name
        }
      }
    }
  },
  pages: {
    signIn: "auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET
}