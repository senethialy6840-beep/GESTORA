import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authRateLimit } from "@/lib/rateLimit";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID_PLACEHOLDER",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "GOOGLE_CLIENT_SECRET_PLACEHOLDER",
      allowDangerousEmailAccountLinking: true,
    }),
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
          plan: user.company?.plan || "STARTUP"
        } as any;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const email = user.email?.trim().toLowerCase();
          if (!email) {
            console.error("[GOOGLE AUTH] Email introuvable");
            return false;
          }

          // 1. Vérifier si l'utilisateur existe déjà
          let dbUser = await prisma.user.findUnique({
            where: { email },
            include: { company: true },
          });

          // 2. Si l'utilisateur n'existe pas, créer automatiquement l'entreprise et l'utilisateur
          if (!dbUser) {
            const fullName = (user.name || "Utilisateur").trim();
            const nameParts = fullName.split(" ");
            const firstName = nameParts[0] || "Utilisateur";
            const lastName = nameParts.slice(1).join(" ") || "Gestora";
            const companyName = fullName ? `Entreprise ${fullName}` : "Mon Entreprise";

            // Création de l'entreprise avec statut d'abonnement PENDING
            const newCompany = await prisma.company.create({
              data: {
                name: companyName,
                plan: "STARTUP",
                subscriptionStatus: "PENDING",
              },
            });

            // Création de l'entrepôt par défaut
            await prisma.warehouse.create({
              data: {
                name: companyName,
                isDefault: true,
                companyId: newCompany.id,
              },
            });

            // Création de l'utilisateur avec rôle ADMIN
            dbUser = await prisma.user.create({
              data: {
                email,
                firstName,
                lastName,
                avatarUrl: user.image || null,
                companyId: newCompany.id,
                role: "ADMIN",
              },
              include: { company: true },
            });

            // Vérifier s'il y a un code parrainage
            try {
              const cookieStore = await cookies();
              const referralCode = cookieStore.get("gestora_ref")?.value;
              if (referralCode) {
                const commercial = await prisma.commercial.findUnique({
                  where: { codeAffiliation: referralCode },
                });
                if (commercial) {
                  await prisma.referral.create({
                    data: {
                      commercialId: commercial.id,
                      customerId: newCompany.id,
                      codeAffiliation: referralCode,
                    },
                  });
                }
              }
            } catch (refErr) {
              console.warn("[GOOGLE AUTH] Impossible de lire le cookie d'affiliation:", refErr);
            }
          } else if (!dbUser.avatarUrl && user.image) {
            // Mettre à jour l'avatar si disponible
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { avatarUrl: user.image },
            }).catch(console.error);
          }

          // Associer les données DB au user pour le callback jwt
          (user as any).id = dbUser.id;
          (user as any).companyId = dbUser.companyId;
          (user as any).role = dbUser.role;
          (user as any).subscriptionStatus = dbUser.company?.subscriptionStatus || "PENDING";
          (user as any).plan = dbUser.company?.plan || "STARTUP";

          return true;
        } catch (error) {
          console.error("[GOOGLE AUTH ERROR]", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.companyId = (user as any).companyId;
        token.role = (user as any).role;
        token.subscriptionStatus = (user as any).subscriptionStatus;
        token.plan = (user as any).plan;
      }

      // Sécurité supplémentaire : s'assurer que companyId est toujours présent
      if (!token.companyId && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: (token.email as string).toLowerCase() },
            include: { company: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.companyId = dbUser.companyId;
            token.role = dbUser.role;
            token.subscriptionStatus = dbUser.company?.subscriptionStatus || "PENDING";
            token.plan = dbUser.company?.plan || "STARTUP";
          }
        } catch (e) {
          console.error("[JWT CALLBACK ERROR]", e);
        }
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
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

export const auth = () => getServerSession(authOptions);
