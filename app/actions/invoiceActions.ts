'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { SaleSchema } from '@/lib/validations';
import { auth } from '@/auth';

// Type pour la création d'une facture
export type CreateInvoiceData = {
  invoiceNo: string;
  totalAmount: number;
  status?: string;
  companyId: string;
  customerId?: string;
};

// Ajouter une nouvelle facture
export async function createInvoice(data: CreateInvoiceData) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    data.companyId = session.user.companyId as string;
    
    const validated = SaleSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Données de facture invalides." };
    }
    data = validated.data as CreateInvoiceData;
    const invoice = await prisma.sale.create({
      data: {
        invoiceNo: data.invoiceNo,
        totalAmount: data.totalAmount,
        status: data.status || 'COMPLETED',
        companyId: data.companyId,
        customerId: data.customerId,
      },
    });

    revalidatePath('/dashboard/invoices');
    return { success: true, data: invoice };
  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    return { success: false, error: 'Impossible de créer la facture.' };
  }
}

// Récupérer toutes les factures d'une entreprise
export async function getInvoices(_companyId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    const companyId = session.user.companyId as string;
    
    const invoices = await prisma.sale.findMany({
      where: { companyId },
      include: {
        customer: true, // Inclure les infos du client lié
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: invoices };
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    return { success: false, error: 'Impossible de charger les factures.' };
  }
}
