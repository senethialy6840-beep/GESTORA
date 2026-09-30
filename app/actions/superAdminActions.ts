'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

const PLATFORM_OWNER_EMAIL = 'gestorame112@gmail.com';

/**
 * Récupère toutes les entreprises (réservé au propriétaire de la plateforme).
 */
export async function getAllCompanies() {
  const session = await auth();
  if (session?.user?.email !== PLATFORM_OWNER_EMAIL) {
    return { success: false, error: 'Accès interdit.' };
  }

  const companies = await prisma.company.findMany({
    where: {
      users: {
        none: {
          role: 'COMMERCIAL'
        }
      }
    },
    include: {
      users: {
        select: { email: true, firstName: true, lastName: true, role: true },
        take: 1,
        orderBy: { createdAt: 'asc' }
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return { success: true, data: companies };
}

/**
 * Met à jour le plan et le statut d'abonnement d'une entreprise.
 */
export async function updateCompanySubscription(
  companyId: string,
  plan: string,
  subscriptionStatus: string
) {
  const session = await auth();
  if (session?.user?.email !== PLATFORM_OWNER_EMAIL) {
    return { success: false, error: 'Accès interdit.' };
  }

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: { plan, subscriptionStatus, isActive: subscriptionStatus === 'ACTIVE' },
  });

  revalidatePath('/dashboard/super-admin');
  return { success: true, data: updated };
}

/**
 * Supprime une entreprise (et toutes ses données) de la plateforme.
 */
export async function deleteCompany(companyId: string) {
  const session = await auth();
  if (session?.user?.email !== PLATFORM_OWNER_EMAIL) {
    return { success: false, error: 'Accès interdit.' };
  }

  await prisma.company.delete({ where: { id: companyId } });
  revalidatePath('/dashboard/super-admin');
  return { success: true };
}

import bcrypt from "bcryptjs";

export async function getAllCommercials() {
  const session = await auth();
  if (session?.user?.email !== PLATFORM_OWNER_EMAIL) {
    return { success: false, error: 'Accès interdit.' };
  }

  const commercials = await prisma.commercial.findMany({
    include: {
      referrals: {
        include: {
          commissions: true
        }
      },
      commissions: true,
      payouts: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return { success: true, data: commercials };
}

export async function createCommercial(data: { prenom: string, nom: string, email: string, telephone: string, codeAffiliation: string }) {
  const session = await auth();
  if (session?.user?.email !== PLATFORM_OWNER_EMAIL) {
    return { success: false, error: 'Accès interdit.' };
  }

  const { prenom, nom, email, telephone, codeAffiliation } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return { success: false, error: 'Cet email est déjà utilisé.' };

  const existingCode = await prisma.commercial.findUnique({ where: { codeAffiliation } });
  if (existingCode) return { success: false, error: 'Ce code d\'affiliation est déjà utilisé.' };

  const hashedPassword = await bcrypt.hash("password123", 10);

  const newCompany = await prisma.company.create({
    data: { name: `Commercial - ${prenom} ${nom}`, plan: "FREE" }
  });

  const newUser = await prisma.user.create({
    data: {
      firstName: prenom,
      lastName: nom,
      email,
      password: hashedPassword,
      companyId: newCompany.id,
      role: "COMMERCIAL"
    }
  });

  const commercial = await prisma.commercial.create({
    data: {
      userId: newUser.id,
      prenom,
      nom,
      email,
      telephone,
      codeAffiliation,
      lienAffiliation: `https://gestora.shop/register?ref=${codeAffiliation}`,
      tauxCommission: 20
    }
  });

  revalidatePath('/dashboard/super-admin/commercials');
  return { success: true, data: commercial };
}

export async function payCommission(commercialId: string, montant: number, methode: string, reference: string) {
  const session = await auth();
  if (session?.user?.email !== PLATFORM_OWNER_EMAIL) {
    return { success: false, error: 'Accès interdit.' };
  }

  // Créer le paiement de commission
  const payout = await prisma.commissionPayout.create({
    data: {
      commercialId,
      montant,
      methode,
      reference
    }
  });

  // Mettre à jour les commissions en attente
  await prisma.commission.updateMany({
    where: { commercialId, statut: 'PENDING' },
    data: { statut: 'PAID', payoutId: payout.id }
  });

  revalidatePath('/dashboard/super-admin/commercials');
  return { success: true, data: payout };
}

export async function deleteCommercial(commercialId: string) {
  const session = await auth();
  if (session?.user?.email !== PLATFORM_OWNER_EMAIL) {
    return { success: false, error: 'Accès interdit.' };
  }

  // Find the commercial to get the userId and companyId
  const commercial = await prisma.commercial.findUnique({
    where: { id: commercialId },
    include: { user: true }
  });

  if (!commercial) return { success: false, error: 'Commercial introuvable.' };

  // Delete the company associated with the commercial (this will cascade delete the user and commercial)
  if (commercial.user?.companyId) {
    await prisma.company.delete({
      where: { id: commercial.user.companyId }
    });
  }

  revalidatePath('/dashboard/super-admin/commercials');
  return { success: true };
}
