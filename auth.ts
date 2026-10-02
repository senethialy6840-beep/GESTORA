import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authRateLimit } from "@/lib/rateLimit";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();

        // Rate Limiting : Max 5 tentatives par minute par email
        const { isRateLimited } = authRateLimit.check(5, email);
        if (isRateLimited) {
          throw new Error("Trop de tentatives de connexion. Veuillez patienter.");
        }

        const user = await prisma.user.findUnique({
          where: {
            email
          },
          include: {
            company: true
          }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        let currentStatus = user.company?.subscriptionStatus || "ACTIVE";

        if (user.company?.subscriptionExpiresAt) {
          const expiresAt = new Date(user.company.subscriptionExpiresAt);
          if (new Date() > expiresAt && currentStatus === "ACTIVE") {
            currentStatus = "EXPIRED";
            // Update the DB so it persists
            prisma.company.update({
              where: { id: user.companyId },
              data: { subscriptionStatus: "EXPIRED", isActive: false }
            }).catch(console.error);
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          companyId: user.companyId,
          role: user.role,
          subscriptionStatus: currentStatus,
          plan: user.company?.plan || "FREE"
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.companyId = (user as any).companyId;
        token.role = (user as any).role;
        token.subscriptionStatus = (user as any).subscriptionStatus;
        token.plan = (user as any).plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).companyId = token.companyId as string;
        (session.user as any).role = token.role as string;
        if (token.companyId) {
          const company = await prisma.company.findUnique({
            where: { id: token.companyId as string },
            select: { subscriptionStatus: true, plan: true, subscriptionExpiresAt: true },
          });
          if (company) {
            let subscriptionStatus = company.subscriptionStatus;
            if (company.subscriptionExpiresAt && company.subscriptionExpiresAt < new Date() && subscriptionStatus === "ACTIVE") {
              subscriptionStatus = "EXPIRED";
            }
            (session.user as any).subscriptionStatus = subscriptionStatus;
            (session.user as any).plan = company.plan;
            return session;
          }
        }
        (session.user as any).subscriptionStatus = token.subscriptionStatus as string;
        (session.user as any).plan = token.plan as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

export const auth = () => getServerSession(authOptions);
