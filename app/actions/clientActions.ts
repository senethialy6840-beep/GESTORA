'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { CustomerSchema } from '@/lib/validations';
import { auth } from '@/auth';

// Type pour la création d'un client
export type CreateCustomerData = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  mensualite?: number;
  balance?: number;
  companyId: string;
};

// Ajouter un nouveau client
export async function createCustomer(data: CreateCustomerData) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    data.companyId = session.user.companyId as string;
    
    const validated = CustomerSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Données du client invalides." };
    }
    data = validated.data as CreateCustomerData;
    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        mensualite: data.mensualite || 0,
        balance: data.balance || 0,
        companyId: data.companyId,
      },
    });

    revalidatePath('/dashboard/clients');
    return { success: true, data: customer };
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    return { success: false, error: 'Impossible de créer le client.' };
  }
}

// Récupérer tous les clients d'une entreprise
export async function getCustomers(_companyId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    const companyId = session.user.companyId as string;
    
    const customers = await prisma.customer.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: customers };
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    return { success: false, error: 'Impossible de charger les clients.' };
  }
}

export async function updateCustomer(id: string, data: Partial<CreateCustomerData>) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    // Sécurité: Vérifier que le client appartient bien à l'entreprise
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.user.companyId) {
      return { success: false, error: "Non autorisé" };
    }

    if (data.companyId) data.companyId = session.user.companyId as string;
    
    const validated = CustomerSchema.partial().safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Données invalides." };
    }
    data = validated.data as Partial<CreateCustomerData>;
    const customer = await prisma.customer.update({
      where: { id },
      data,
    });
    revalidatePath('/dashboard/clients');
    return { success: true, data: customer };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    return { success: false, error: 'Impossible de mettre à jour le client.' };
  }
}

export async function deleteCustomer(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    
    // Sécurité: Vérifier que le client appartient bien à l'entreprise
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.user.companyId) {
      return { success: false, error: "Non autorisé" };
    }

    await prisma.customer.delete({ where: { id } });
    revalidatePath('/dashboard/clients');
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error);
    return { success: false, error: 'Impossible de supprimer le client.' };
  }
}
