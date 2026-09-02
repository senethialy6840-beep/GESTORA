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
