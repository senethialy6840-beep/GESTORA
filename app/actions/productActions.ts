'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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

export async function getProducts(companyId: string) {
  try {
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
