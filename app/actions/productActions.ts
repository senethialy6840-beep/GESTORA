'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ProductSchema } from '@/lib/validations';
import { auth } from '@/auth';

export type CreateProductData = {
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  price: number;
  cost: number;
  stock: number;
  stockAlert?: number;
  companyId: string;
};

export async function createProduct(data: CreateProductData) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    data.companyId = session.user.companyId as string;
    
    const validated = ProductSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Données du produit invalides." };
    }
    data = validated.data as CreateProductData;
    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        barcode: data.barcode,
        description: data.description,
        price: data.price,
        cost: data.cost,
        stock: data.stock,
        stockAlert: data.stockAlert || 0,
        companyId: data.companyId,
      },
    });

    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard/pos');
    revalidatePath('/dashboard/sales');
    return { success: true, data: product };
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    return { success: false, error: 'Impossible de créer le produit.' };
  }
}

export async function getProducts(_companyId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    const companyId = session.user.companyId as string;
    
    const products = await prisma.product.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: products };
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return { success: false, error: 'Impossible de charger les produits.' };
  }
}

export async function updateProduct(id: string, data: Partial<CreateProductData>) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    // Sécurité: Vérifier que le produit appartient bien à l'entreprise
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.user.companyId) {
      return { success: false, error: "Non autorisé" };
    }

    if (data.companyId) data.companyId = session.user.companyId as string;
    
    const validated = ProductSchema.partial().safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Données invalides." };
    }
    data = validated.data as Partial<CreateProductData>;
    const product = await prisma.product.update({
      where: { id },
      data,
    });
    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard/pos');
    revalidatePath('/dashboard/sales');
    return { success: true, data: product };
  } catch (error) {
    console.error('Erreur lors de la modification:', error);
    return { success: false, error: 'Impossible de modifier.' };
  }
}

export async function deleteProduct(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    // Sécurité: Vérifier que le produit appartient bien à l'entreprise
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.user.companyId) {
      return { success: false, error: "Non autorisé" };
    }

    await prisma.product.delete({
      where: { id },
    });
    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return { success: false, error: 'Impossible de supprimer.' };
  }
}
