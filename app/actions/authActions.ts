"use server";

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function registerUser(formData: {
  prenom: string;
  nom: string;
  entreprise: string;
  email: string;
  motDePasse: string;
}) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: formData.email }
    });

    if (existingUser) {
      return { error: "Cet email est déjà utilisé." };
    }

    const hashedPassword = await bcrypt.hash(formData.motDePasse, 10);

    const user = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: formData.entreprise,
        }
      });

      const newUser = await tx.user.create({
        data: {
          email: formData.email,
          password: hashedPassword,
          firstName: formData.prenom,
          lastName: formData.nom,
          role: 'ADMIN',
          companyId: company.id,
        }
      });

      return newUser;
    });

    return { success: true, userId: user.id };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { error: "Une erreur est survenue lors de l'inscription." };
  }
}
