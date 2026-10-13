import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * Résout intelligemment la boutique (warehouse) active pour n'importe quel utilisateur :
 * 1. Vérifie le cookie `activeBoutiqueId` du navigateur si présent et valide
 * 2. Si non trouvé ou utilisateur invité, cherche la boutique attribuée à l'employé dans la base
 * 3. Si non trouvé, cherche la boutique par défaut de l'entreprise
 * 4. Si une seule boutique existe, l'utilise
 * 5. Sinon renvoie null (mode global de l'entreprise)
 */
export async function getActiveWarehouseId(companyId: string, userEmail?: string | null): Promise<string | null> {
  if (!companyId) return null;

  try {
    // 1. Cookie du navigateur
    const cookieStore = await cookies();
    const cookieWarehouseId = cookieStore.get('activeBoutiqueId')?.value;
    if (cookieWarehouseId) {
      const wh = await prisma.warehouse.findFirst({
        where: { id: cookieWarehouseId, companyId },
        select: { id: true }
      });
      if (wh) return wh.id;
    }

    // 2. Si c'est un collaborateur / invité, trouver sa boutique assignée
    if (userEmail) {
      const employee = await prisma.employee.findFirst({
        where: { companyId, email: userEmail },
        select: { warehouseId: true }
      });
      if (employee?.warehouseId) {
        return employee.warehouseId;
      }
    }

    // 3. Boutique par défaut de l'entreprise
    const defaultWh = await prisma.warehouse.findFirst({
      where: { companyId, isDefault: true },
      select: { id: true }
    });
    if (defaultWh) return defaultWh.id;

    // 4. Si une seule boutique existe pour cette entreprise
    const warehouses = await prisma.warehouse.findMany({
      where: { companyId },
      select: { id: true },
      take: 2
    });
    if (warehouses.length === 1) {
      return warehouses[0].id;
    }

    return null;
  } catch (error) {
    console.error('Erreur getActiveWarehouseId:', error);
    return null;
  }
}

/**
 * Crée le filtre Prisma approprié :
 * Si une boutique est active, retourne les produits de cette boutique + les produits généraux (sans boutique spécifique).
 * Si aucune boutique n'est ciblée, ne filtre pas sur warehouseId afin d'inclure tous les produits de l'entreprise !
 */
export function getWarehouseFilter(warehouseId: string | null) {
  if (!warehouseId) {
    return {};
  }
  return {
    OR: [
      { warehouseId },
      { warehouseId: null }
    ]
  };
}
