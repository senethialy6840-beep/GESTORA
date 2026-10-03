"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getOwnedBoutiques() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Non autorisé" };
    const userId = session.user.id;

    // Récupérer le user et ses boutiques owned
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true, // Boutique active
        ownedCompanies: true,
      }
    });

    if (!user) return { success: false, error: "Utilisateur introuvable" };

    // S'assurer que la boutique active fait partie des boutiques owned, ou la traiter séparément
    // Pour des raisons de compatibilité, si le user n'a pas de ownerId sur sa première boutique, on l'ajoute.
    if (user.company && !user.company.ownerId && user.role === "ADMIN") {
      await prisma.company.update({
        where: { id: user.company.id },
        data: { ownerId: userId }
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
        ownedCompanies: true,
      }
    });

    return { success: true, activeCompany: updatedUser?.company, ownedCompanies: updatedUser?.ownedCompanies };
  } catch (error) {
    console.error("Erreur getOwnedBoutiques:", error);
    return { success: false, error: "Erreur lors de la récupération des boutiques." };
  }
}

export async function createBoutique(name: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Non autorisé" };
    const userId = session.user.id;

    // Vérifier les limites selon l'abonnement de la boutique principale (ou de l'utilisateur)
    // On prend la boutique actuelle pour vérifier l'abonnement
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true, ownedCompanies: true }
    });

    if (!user) return { success: false, error: "Utilisateur non trouvé" };
    
    // Si l'utilisateur a créé son compte, il a probablement le rôle ADMIN
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Seul l'administrateur peut créer des boutiques." };
    }

    const activePlan = user.company?.plan || "FREE";
    const currentBoutiqueCount = user.ownedCompanies.length;
    
    // Limites de boutiques
    let maxBoutiques = 1;
    if (activePlan === "BUSINESS") maxBoutiques = 3;
    else if (activePlan === "ENTERPRISE") maxBoutiques = 9999;
    else maxBoutiques = 1; // FREE ou STARTUP = 1 seule boutique (ou peut-être 2 pour test, limitons à 1 par défaut, ou on peut lire la logique de pricing)

    // Permettre 1 boutique supplémentaire max pour BUSINESS
    if (currentBoutiqueCount >= maxBoutiques) {
      return { success: false, error: `Limite atteinte. Votre forfait ${activePlan} permet un maximum de ${maxBoutiques} boutique(s).` };
    }

    const newCompany = await prisma.company.create({
      data: {
        name,
        ownerId: userId,
        plan: activePlan, // Hérite du plan ou retombe sur FREE ? Pour simplifier on dit FREE, ou on hérite
      }
    });

    // Optionnel: Basculer directement sur la nouvelle boutique
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { companyId: newCompany.id }
    // });

    revalidatePath("/dashboard/settings");
    return { success: true, data: newCompany };
  } catch (error) {
    console.error("Erreur createBoutique:", error);
    return { success: false, error: "Erreur lors de la création de la boutique." };
  }
}

export async function switchBoutique(companyId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Non autorisé" };
    const userId = session.user.id;

    // Vérifier si l'utilisateur possède bien cette boutique
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return { success: false, error: "Boutique introuvable." };
    
    // Si l'utilisateur est bien le owner ou s'il fait partie de cette entreprise
    if (company.ownerId !== userId) {
      // Autoriser le switch uniquement s'il est owner. (Pour les employés simples, ils ne changent pas de boutique ainsi)
      return { success: false, error: "Vous n'avez pas l'autorisation d'accéder à cette boutique." };
    }

    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { id: userId },
      data: { companyId }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erreur switchBoutique:", error);
    return { success: false, error: "Erreur lors du basculement." };
  }
}
