"use server";

import { revalidatePath } from "next/cache";
import { prisma, ensureCompanyExists } from "@/lib/prisma";
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
    
    // Fetch associated users for RBAC data
    const emails = employees.map(e => e.email).filter(Boolean) as string[];
    const users = await prisma.user.findMany({
      where: { email: { in: emails }, companyId },
      include: { warehouses: { select: { id: true } } }
    });
    
    const enrichedEmployees = employees.map(emp => {
      const user = users.find(u => u.email === emp.email);
      return {
        ...emp,
        permissions: user?.permissions || [],
        accessAllWarehouses: user?.accessAllWarehouses || false,
        warehouseIds: user?.warehouses?.map(w => w.id) || []
      };
    });

    return { success: true, data: enrichedEmployees };
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
    await ensureCompanyExists(data.companyId);
    
    // Vérification des limites selon le forfait
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
      select: { plan: true, _count: { select: { employees: true } } }
    });
    
    if (company) {
      const plan = company.plan || 'FREE';
      const employeeCount = company._count.employees;
      
      let maxEmployees = 0;
      if (plan === 'BUSINESS') maxEmployees = 5;
      else if (plan === 'ENTERPRISE') maxEmployees = 9999;
      else maxEmployees = 0; // STARTUP ou FREE n'ont droit qu'à l'admin (0 employé additionnel)
      
      if (employeeCount >= maxEmployees) {
        return { success: false, error: `Limite atteinte. Votre forfait ${plan} permet un maximum de ${maxEmployees} utilisateur(s) supplémentaire(s).` };
      }
    }
    
    const validated = EmployeeSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Données de l'employé invalides." };
    }
    data = validated.data as any;

    // Synchronisation avec la table User pour permettre la connexion
    if (data.email) {
      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser) {
        return { success: false, error: "Cet email est déjà utilisé par un autre compte." };
      }

      const { hash } = require("bcryptjs");
      const hashedPassword = await hash("Gestora2026", 10); // Mot de passe par défaut

      await prisma.user.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          password: hashedPassword,
          role: data.role,
          companyId: data.companyId,
          isActive: data.status === 'ACTIVE',
          permissions: (data as any).permissions || [],
          accessAllWarehouses: (data as any).accessAllWarehouses || false,
          warehouses: {
            connect: ((data as any).warehouseIds || []).map((id: string) => ({ id }))
          }
        }
      });
    }

    // Clean up non-employee fields before creating employee
    const { permissions, accessAllWarehouses, warehouseIds, ...employeeData } = data as any;

    const employee = await prisma.employee.create({
      data: employeeData,
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

    // Synchronisation avec la table User
    if (existing.email) {
      const user = await prisma.user.findUnique({ where: { email: existing.email } });
      if (user) {
        await prisma.user.update({
          where: { email: existing.email },
          data: {
            email: data.email || user.email,
            firstName: data.firstName || user.firstName,
            lastName: data.lastName || user.lastName,
            role: data.role || user.role,
            isActive: data.status ? data.status === 'ACTIVE' : user.isActive,
            permissions: (data as any).permissions !== undefined ? (data as any).permissions : user.permissions,
            accessAllWarehouses: (data as any).accessAllWarehouses !== undefined ? (data as any).accessAllWarehouses : user.accessAllWarehouses,
            warehouses: (data as any).warehouseIds ? { set: (data as any).warehouseIds.map((id: string) => ({ id })) } : undefined
          }
        });
      }
    }

    const { permissions, accessAllWarehouses, warehouseIds, ...employeeData } = data as any;

    const employee = await prisma.employee.update({
      where: { id },
      data: employeeData,
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

    // Supprimer aussi le User associé
    if (existing.email) {
      const user = await prisma.user.findUnique({ where: { email: existing.email } });
      if (user) {
        await prisma.user.delete({ where: { email: existing.email } });
      }
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
