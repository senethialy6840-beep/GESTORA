"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Employee } from "@prisma/client";
import { EmployeeSchema } from "@/lib/validations";
import { auth } from "@/auth";

export async function getEmployees(_companyId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    const companyId = session.user.companyId as string;
    
    const employees = await prisma.employee.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: employees };
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

export async function createEmployee(data: Omit<Employee, "id" | "createdAt" | "updatedAt">) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    data.companyId = session.user.companyId as string;
    
    const validated = EmployeeSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Données de l'employé invalides." };
    }
    data = validated.data as any;
    const employee = await prisma.employee.create({
      data,
    });
    revalidatePath("/dashboard/hr");
    return { success: true, data: employee };
  } catch (error) {
    console.error("Erreur lors de la création de l'employé:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

export async function updateEmployee(id: string, data: Partial<Employee>) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    // Sécurité: Vérifier que l'employé appartient bien à l'entreprise
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.user.companyId) {
      return { success: false, error: "Non autorisé" };
    }

    if (data.companyId) data.companyId = session.user.companyId as string;
    
    const validated = EmployeeSchema.partial().safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Données de l'employé invalides." };
    }
    data = validated.data as Partial<Employee>;
    const employee = await prisma.employee.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/hr");
    return { success: true, data: employee };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'employé:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

export async function deleteEmployee(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    // Sécurité: Vérifier que l'employé appartient bien à l'entreprise
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.user.companyId) {
      return { success: false, error: "Non autorisé" };
    }

    await prisma.employee.delete({
      where: { id },
    });
    revalidatePath("/dashboard/hr");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de l'employé:", error);
    return { success: false, error: "Erreur serveur" };
  }
}
