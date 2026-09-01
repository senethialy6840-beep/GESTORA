'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function getCompany(companyId: string) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    return { success: true, data: company };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'entreprise:', error);
    return { success: false, error: 'Impossible de charger les informations de l\'entreprise.' };
  }
}

export type UpdateCompanyData = {
  name: string;
  domain?: string;
  address?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
};

const CompanyUpdateSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  domain: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.literal(""), z.string().email()]).optional(),
  taxNumber: z.string().optional(),
});

export async function updateCompany(companyId: string, data: UpdateCompanyData) {
  try {
    const validated = CompanyUpdateSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Données de l'entreprise invalides." };
    }
    const safeData = validated.data;
    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: safeData.name,
        domain: safeData.domain,
        address: safeData.address,
        phone: safeData.phone,
        email: safeData.email,
        taxNumber: safeData.taxNumber,
      },
    });

    revalidatePath('/dashboard/company');
    revalidatePath('/dashboard/settings');
    return { success: true, data: company };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'entreprise:', error);
    return { success: false, error: 'Impossible de mettre à jour l\'entreprise.' };
  }
}
