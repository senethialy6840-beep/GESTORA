'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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

export async function updateCompany(companyId: string, data: UpdateCompanyData) {
  try {
    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: data.name,
        domain: data.domain,
        address: data.address,
        phone: data.phone,
        email: data.email,
        taxNumber: data.taxNumber,
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
