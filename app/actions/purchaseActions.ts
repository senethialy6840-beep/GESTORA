"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Purchase, Supplier, PurchaseItem } from "@prisma/client";
import { PurchaseSchema, SupplierSchema } from "@/lib/validations";
import { auth } from "@/auth";

// --- Suppliers ---

export async function getSuppliers(_companyId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    const companyId = session.user.companyId as string;
    
    const suppliers = await prisma.supplier.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });
    return { success: true, data: suppliers };
  } catch (error) {
    console.error("Erreur lors de la récupération des fournisseurs:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

export async function createSupplier(data: Omit<Supplier, "id" | "createdAt" | "updatedAt">) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    data.companyId = session.user.companyId as string;
    
    const validated = SupplierSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Données fournisseur invalides." };
    }
    data = validated.data as any;
    const supplier = await prisma.supplier.create({
      data,
    });
    revalidatePath("/dashboard/purchases");
    return { success: true, data: supplier };
  } catch (error) {
    console.error("Erreur lors de la création du fournisseur:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

export async function updateSupplier(id: string, data: Partial<Supplier>) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    // Sécurité: Vérifier que le fournisseur appartient bien à l'entreprise
    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.user.companyId) {
      return { success: false, error: "Non autorisé" };
    }

    if (data.companyId) data.companyId = session.user.companyId as string;
    
    const validated = SupplierSchema.partial().safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Données fournisseur invalides." };
    }
    data = validated.data as Partial<Supplier>;
    const supplier = await prisma.supplier.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/purchases");
    return { success: true, data: supplier };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du fournisseur:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

export async function deleteSupplier(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    // Sécurité: Vérifier que le fournisseur appartient bien à l'entreprise
    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.user.companyId) {
      return { success: false, error: "Non autorisé" };
    }

    await prisma.supplier.delete({
      where: { id },
    });
    revalidatePath("/dashboard/purchases");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du fournisseur:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

// --- Purchases ---

export async function getPurchases(_companyId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    const companyId = session.user.companyId as string;
    
    const purchases = await prisma.purchase.findMany({
      where: { companyId },
      include: {
        supplier: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: purchases };
  } catch (error) {
    console.error("Erreur lors de la récupération des achats:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

export async function createPurchase(
  data: Omit<Purchase, "id" | "createdAt" | "updatedAt">,
  items: Omit<PurchaseItem, "id" | "purchaseId">[]
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    data.companyId = session.user.companyId as string;
    
    const validated = PurchaseSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Données d'achat invalides." };
    }
    data = validated.data as any;
    const purchase = await prisma.purchase.create({
      data: {
        ...data,
        items: {
          create: items,
        },
      },
      include: {
        supplier: true,
        items: true,
      },
    });
    revalidatePath("/dashboard/purchases");
    return { success: true, data: purchase };
  } catch (error) {
    console.error("Erreur lors de la création de l'achat:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

export async function updatePurchaseStatus(id: string, status: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    // Sécurité: Vérifier
    const existing = await prisma.purchase.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.user.companyId) {
      return { success: false, error: "Non autorisé" };
    }

    const purchase = await prisma.purchase.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/dashboard/purchases");
    return { success: true, data: purchase };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

export async function deletePurchase(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    // Sécurité: Vérifier
    const existing = await prisma.purchase.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.user.companyId) {
      return { success: false, error: "Non autorisé" };
    }

    await prisma.purchase.delete({
      where: { id },
    });
    revalidatePath("/dashboard/purchases");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de l'achat:", error);
    return { success: false, error: "Erreur serveur" };
  }
}
