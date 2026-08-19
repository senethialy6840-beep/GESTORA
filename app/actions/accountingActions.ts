"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AccountingTransaction } from "@prisma/client";

export async function getTransactions(companyId: string) {
  try {
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
