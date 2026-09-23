"use server";

import { prisma, ensureCompanyExists } from "@/lib/prisma";
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
    await ensureCompanyExists(data.companyId);
    
    const validated = StockMovementSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Données de mouvement de stock invalides." };
    }
    data = validated.data as any;
    const product = await prisma.product.findFirst({
      where: { id: data.productId, companyId: data.companyId },
      select: { id: true, stock: true },
    });
    if (!product) return { success: false, error: "Produit introuvable ou non autorisé." };
    if (data.type === 'OUT' && product.stock < data.quantity) {
      return { success: false, error: "Stock insuffisant pour cette sortie." };
    }

    const movement = await prisma.$transaction(async (transaction) => {
      const createdMovement = await transaction.stockMovement.create({
        data: {
          type: data.type,
          quantity: data.quantity,
          reason: data.reason,
          productId: data.productId,
          companyId: data.companyId,
        }
      });
      await transaction.product.update({
        where: { id: data.productId },
        data: { stock: data.type === 'IN' ? { increment: data.quantity } : { decrement: data.quantity } },
      });
      return createdMovement;
    });

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

    const movement = await prisma.$transaction(async (transaction) => {
      const deletedMovement = await transaction.stockMovement.delete({ where: { id } });
      await transaction.product.update({
        where: { id: deletedMovement.productId },
        data: deletedMovement.type === 'IN'
          ? { stock: { decrement: deletedMovement.quantity } }
          : { stock: { increment: deletedMovement.quantity } },
      });
      return deletedMovement;
    });

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
