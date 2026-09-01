"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StockMovementSchema } from "@/lib/validations";
import { auth } from "@/auth";

export async function getStockMovements(_companyId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    const companyId = session.user.companyId as string;
    
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
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    data.companyId = session.user.companyId as string;
    
    const validated = StockMovementSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Données de mouvement de stock invalides." };
    }
    data = validated.data as any;
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
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    // Sécurité: Vérifier que le mouvement appartient bien à l'entreprise
    const existing = await prisma.stockMovement.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.user.companyId) {
      return { success: false, error: "Non autorisé" };
    }

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
