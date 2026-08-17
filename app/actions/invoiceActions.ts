'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
export async function getInvoices(companyId: string) {
  try {
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
