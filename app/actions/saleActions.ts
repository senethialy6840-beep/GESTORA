'use server';

import { prisma, ensureCompanyExists } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { SaleSchema } from '@/lib/validations';
import { auth } from '@/auth';
import { sendLowStockAlert } from '@/lib/mailer';

export type CreateSaleData = {
  invoiceNo: string;
  totalAmount: number;
  status?: string;
  customerId?: string;
  companyId: string;
  items?: { description: string; quantity: number; price: number; productId?: string }[];
};

export async function createSale(data: CreateSaleData) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    data.companyId = session.user.companyId as string;
    await ensureCompanyExists(data.companyId);
    
    const validated = SaleSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Données de vente invalides." };
    }
    data = validated.data as CreateSaleData;
    if (data.customerId) {
      const customer = await prisma.customer.findFirst({
        where: { id: data.customerId, companyId: data.companyId },
        select: { id: true },
      });
      if (!customer) return { success: false, error: "Client introuvable ou non autorisé." };
    }

    const products = new Map<string, { quantity: number; name: string; stock: number; stockAlert: number }>();
    for (const item of data.items || []) {
      if (!item.productId) continue;
      const current = products.get(item.productId);
      if (current) {
        current.quantity += item.quantity;
        continue;
      }
      const product = await prisma.product.findFirst({
        where: { id: item.productId, companyId: data.companyId },
        select: { id: true, name: true, stock: true, stockAlert: true },
      });
      if (!product) return { success: false, error: "Produit introuvable ou non autorisé." };
      products.set(product.id, { quantity: item.quantity, name: product.name, stock: product.stock, stockAlert: product.stockAlert });
    }
    for (const product of products.values()) {
      if (product.stock < product.quantity) return { success: false, error: `Stock insuffisant pour ${product.name}.` };
    }

    const sale = await prisma.$transaction(async (transaction) => {
      const createdSale = await transaction.sale.create({
        data: {
          invoiceNo: data.invoiceNo,
          totalAmount: data.totalAmount,
          status: data.status || 'COMPLETED',
          customerId: data.customerId,
          companyId: data.companyId,
          items: data.items ? {
            create: data.items.map(i => ({ description: i.description, quantity: i.quantity, price: i.price }))
          } : undefined,
        },
        include: { items: true },
      });
      for (const [productId, product] of products) {
        await transaction.product.update({ where: { id: productId }, data: { stock: { decrement: product.quantity } } });
      }
      return createdSale;
    });

    for (const product of products.values()) {
      const remainingStock = product.stock - product.quantity;
      if (remainingStock <= product.stockAlert) {
        sendLowStockAlert(product.name, remainingStock, data.companyId).catch(console.error);
      }
    }

    revalidatePath('/dashboard/invoices');
    revalidatePath('/dashboard/sales');
    revalidatePath('/dashboard/pos');
    revalidatePath('/dashboard/products');
    return { success: true, data: sale };
  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    return { success: false, error: 'Impossible de créer la facture.' };
  }
}

export async function updateSale(id: string, data: Partial<CreateSaleData>) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    // Sécurité: Vérifier
    const existing = await prisma.sale.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.user.companyId) {
      return { success: false, error: "Non autorisé" };
    }

    if (data.companyId) data.companyId = session.user.companyId as string;
    
    const validated = SaleSchema.partial().safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Données de vente invalides." };
    }
    data = validated.data as Partial<CreateSaleData>;
    // If items are provided, delete existing and recreate (simplest way to handle updates for items)
    if (data.items) {
      await prisma.saleItem.deleteMany({ where: { saleId: id } });
    }
    
    const sale = await prisma.sale.update({
      where: { id }, 
      data: {
        totalAmount: data.totalAmount,
        status: data.status,
        items: data.items ? {
          create: data.items.map(i => ({
            description: i.description,
            quantity: i.quantity,
            price: i.price,
          }))
        } : undefined
      },
      include: { items: true }
    });
    revalidatePath('/dashboard/invoices');
    revalidatePath('/dashboard/sales');
    return { success: true, data: sale };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la facture:', error);
    return { success: false, error: 'Impossible de mettre à jour.' };
  }
}

export async function getSales(_companyId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    const companyId = session.user.companyId as string;
    
    const sales = await prisma.sale.findMany({
      where: { companyId },
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: sales };
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    return { success: false, error: 'Impossible de charger les factures.' };
  }
}

export async function deleteSale(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    // Sécurité: Vérifier
    const existing = await prisma.sale.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.user.companyId) {
      return { success: false, error: "Non autorisé" };
    }

    await prisma.sale.delete({
      where: { id },
    });
    revalidatePath('/dashboard/invoices');
    revalidatePath('/dashboard/sales');
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de la vente:', error);
    return { success: false, error: 'Impossible de supprimer.' };
  }
}
