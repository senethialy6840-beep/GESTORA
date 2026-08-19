"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Employee } from "@prisma/client";

export async function getEmployees(companyId: string) {
  try {
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
