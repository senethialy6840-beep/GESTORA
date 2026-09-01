"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AccountingTransaction } from "@prisma/client";
import { TransactionSchema } from "@/lib/validations";
import { auth } from "@/auth";

export async function getTransactions(_companyId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    const companyId = session.user.companyId as string;
    
    const transactions = await prisma.accountingTransaction.findMany({
      where: { companyId },
      orderBy: { date: "desc" },
    });
    return { success: true, data: transactions };
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

export async function createTransaction(data: Omit<AccountingTransaction, "id" | "createdAt" | "updatedAt">) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    data.companyId = session.user.companyId as string;
    
    const validated = TransactionSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Données de transaction invalides." };
    }
    data = validated.data as any;
    const transaction = await prisma.accountingTransaction.create({
      data,
    });
    revalidatePath("/dashboard/accounting");
    return { success: true, data: transaction };
  } catch (error) {
    console.error("Erreur lors de la création de la transaction:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

export async function updateTransaction(id: string, data: Partial<AccountingTransaction>) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    // Sécurité: Vérifier que la transaction appartient bien à l'entreprise
    const existing = await prisma.accountingTransaction.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.user.companyId) {
      return { success: false, error: "Non autorisé" };
    }

    if (data.companyId) data.companyId = session.user.companyId as string;
    
    const validated = TransactionSchema.partial().safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Données de transaction invalides." };
    }
    data = validated.data as Partial<AccountingTransaction>;
    const transaction = await prisma.accountingTransaction.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/accounting");
    return { success: true, data: transaction };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la transaction:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

export async function deleteTransaction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    // Sécurité: Vérifier que la transaction appartient bien à l'entreprise
    const existing = await prisma.accountingTransaction.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.user.companyId) {
      return { success: false, error: "Non autorisé" };
    }

    await prisma.accountingTransaction.delete({
      where: { id },
    });
    revalidatePath("/dashboard/accounting");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de la transaction:", error);
    return { success: false, error: "Erreur serveur" };
  }
}
