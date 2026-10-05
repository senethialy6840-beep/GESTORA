"use server";

import { prisma, ensureCompanyExists } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StockMovementSchema } from "@/lib/validations";
import { auth } from "@/auth";

export async function getStockMovements(_companyId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisÃ©" };
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
    if (!session?.user?.companyId) return { success: false, error: "Non autorisÃ©" };
    
    data.companyId = session.user.companyId as string;
    await ensureCompanyExists(data.companyId);
    
    const validated = StockMovementSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: "DonnÃ©es de mouvement de stock invalides." };
    }
    data = validated.data as any;
    const product = await prisma.product.findFirst({
      where: { id: data.productId, companyId: data.companyId },
      select: { id: true, stock: true },
    });
    if (!product) return { success: false, error: "Produit introuvable ou non autorisÃ©." };
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
    if (!session?.user?.companyId) return { success: false, error: "Non autorisÃ©" };
    
    // SÃ©curitÃ©: VÃ©rifier que le mouvement appartient bien Ã  l'entreprise
    const existing = await prisma.stockMovement.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.user.companyId) {
      return { success: false, error: "Non autorisÃ©" };
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

export async function createWarehouse(data: { name: string, location?: string }) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisÃ©" };
    
    const companyId = session.user.companyId as string;
    await ensureCompanyExists(companyId);
    
    // VÃ©rification des limites selon le forfait
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { plan: true, _count: { select: { warehouses: true } } }
    });
    
    if (company) {
      const plan = company.plan || 'FREE';
      const warehouseCount = company._count.warehouses;
      
      let maxWarehouses = 1;
      if (plan === 'BUSINESS') maxWarehouses = 3;
      else if (plan === 'ENTERPRISE') maxWarehouses = 9999;
      
      if (warehouseCount >= maxWarehouses) {
        return { success: false, error: `Limite atteinte. Votre forfait ${plan} permet un maximum de ${maxWarehouses} boutique(s).` };
      }
    }
    
    const warehouse = await prisma.warehouse.create({
      data: {
        name: data.name,
        location: data.location,
        companyId
      }
    });
    
    revalidatePath("/dashboard/settings");
    return { success: true, data: warehouse };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getWarehouses(_companyId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisÃ©" };
    const companyId = session.user.companyId as string;
    
    const warehouses = await prisma.warehouse.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' }
    });
    return { success: true, data: warehouses };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateWarehouse(id: string, data: { name: string, location?: string }) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    // Check ownership
    const existing = await prisma.warehouse.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.user.companyId) {
      return { success: false, error: "Non autorisé" };
    }
    
    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: { name: data.name, location: data.location }
    });
    
    revalidatePath("/dashboard/boutiques");
    revalidatePath("/dashboard/settings");
    return { success: true, data: warehouse };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteWarehouse(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    // Check ownership
    const existing = await prisma.warehouse.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.user.companyId) {
      return { success: false, error: "Non autorisé" };
    }
    
    await prisma.warehouse.delete({ where: { id } });
    
    revalidatePath("/dashboard/boutiques");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
