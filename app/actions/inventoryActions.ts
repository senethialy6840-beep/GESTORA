"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getStockMovements(companyId: string) {
  try {
    const movements = await prisma.stockMovement.findMany({
      where: { companyId },
      include: { product: true },
      orderBy: { date: 'desc' }
    });
    return { success: true, data: movements };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createStockMovement(data: {
  type: string;
  quantity: number;
  reason?: string;
  productId: string;
  companyId: string;
}) {
  try {
    const movement = await prisma.stockMovement.create({
      data: {
        type: data.type,
        quantity: data.quantity,
        reason: data.reason,
        productId: data.productId,
        companyId: data.companyId,
      }
    });

    // Automatically update product stock
    if (data.type === 'IN') {
      await prisma.product.update({
        where: { id: data.productId },
        data: { stock: { increment: data.quantity } }
      });
    } else if (data.type === 'OUT') {
      await prisma.product.update({
        where: { id: data.productId },
        data: { stock: { decrement: data.quantity } }
      });
    }

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/products");
    return { success: true, data: movement };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteStockMovement(id: string) {
  try {
    const movement = await prisma.stockMovement.delete({
      where: { id }
    });
    
    // Revert the stock
    if (movement.type === 'IN') {
      await prisma.product.update({
        where: { id: movement.productId },
        data: { stock: { decrement: movement.quantity } }
      });
    } else if (movement.type === 'OUT') {
      await prisma.product.update({
        where: { id: movement.productId },
        data: { stock: { increment: movement.quantity } }
      });
    }

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
