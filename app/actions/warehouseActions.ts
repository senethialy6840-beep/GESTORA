"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getWarehouses() {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    const companyId = session.user.companyId as string;
    
    const warehouses = await prisma.warehouse.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: warehouses };
  } catch (error: any) {
    console.error("Erreur getWarehouses:", error);
    return { success: false, error: "Erreur serveur" };
  }
}
