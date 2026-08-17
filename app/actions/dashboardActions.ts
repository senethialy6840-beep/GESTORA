'use server';

import { prisma } from '@/lib/prisma';
import { subDays, startOfMonth, subMonths, endOfDay, startOfDay, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export type DashboardStats = {
  revenue: number;
  pending: number;
  overdue: number;
  newCustomers: number;
  areaData: any[];
  pieData: any[];
  barData: any[];
  topClientsData: any[];
};

export async function getDashboardStats(companyId: string, startDate?: string, endDate?: string): Promise<{ success: boolean; data?: DashboardStats; error?: string }> {
  try {
    const end = endDate ? endOfDay(new Date(endDate)) : endOfDay(new Date());
    let start = startDate ? startOfDay(new Date(startDate)) : startOfMonth(end);
    
    // For AreaChart: past 7 months including current
    const sevenMonthsAgo = startOfMonth(subMonths(end, 6));

    // 1. Chiffre d'affaires
    const revenueAggr = await prisma.sale.aggregate({
      where: {
        companyId,
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end }
      },
      _sum: { totalAmount: true }
    });
    const revenue = revenueAggr._sum.totalAmount || 0;

    // 2. Factures en attente
    const pendingAggr = await prisma.sale.aggregate({
      where: {
        companyId,
        status: 'PENDING',
        createdAt: { gte: start, lte: end }
      },
      _sum: { totalAmount: true }
    });
    const pending = pendingAggr._sum.totalAmount || 0;

    // 3. En retard (Assuming status OVERDUE exists, otherwise 0)
    const overdueAggr = await prisma.sale.aggregate({
      where: {
        companyId,
        status: 'OVERDUE',
        createdAt: { gte: start, lte: end }
      },
      _sum: { totalAmount: true }
    });
    const overdue = overdueAggr._sum.totalAmount || 0;

    // 4. Nouveaux clients
    const newCustomers = await prisma.customer.count({
      where: {
        companyId,
        createdAt: { gte: start, lte: end }
      }
    });

    // 5. AreaChart Data (7 derniers mois)
    const salesOverTime = await prisma.sale.findMany({
      where: {
        companyId,
        status: 'COMPLETED',
        createdAt: { gte: sevenMonthsAgo, lte: end }
      },
      select: { totalAmount: true, createdAt: true }
    });

    const monthsMap = new Map();
    for (let i = 6; i >= 0; i--) {
      const d = subMonths(end, i);
      const monthName = format(d, 'MMM', { locale: fr });
      monthsMap.set(monthName, { name: monthName.charAt(0).toUpperCase() + monthName.slice(1), ventes: 0, benefices: 0 });
    }

    salesOverTime.forEach(sale => {
      const m = format(new Date(sale.createdAt), 'MMM', { locale: fr });
      if (monthsMap.has(m)) {
        const entry = monthsMap.get(m);
        entry.ventes += sale.totalAmount;
        // Approximation du bénéfice à 30% pour l'exemple visuel
        entry.benefices += sale.totalAmount * 0.3;
      }
    });
    const areaData = Array.from(monthsMap.values());

    // 6. Pie Chart Data
    const pieData = [
      { name: 'Direct', value: revenue * 0.6 || 60 },
      { name: 'En Ligne', value: revenue * 0.3 || 30 },
      { name: 'Partenaires', value: revenue * 0.1 || 10 },
    ];

    // 7. Bar Chart Data
    const saleItems = await prisma.saleItem.findMany({
      where: {
        sale: { companyId, createdAt: { gte: start, lte: end } }
      },
      select: { description: true, quantity: true }
    });
    
    const productSales = new Map();
    saleItems.forEach(item => {
      const current = productSales.get(item.description) || 0;
      productSales.set(item.description, current + item.quantity);
    });

    const sortedProducts = Array.from(productSales.entries())
      .map(([name, ventes]) => ({ name, ventes }))
      .sort((a, b) => b.ventes - a.ventes)
      .slice(0, 4);

    // 8. Top Clients
    const customersWithSales = await prisma.customer.findMany({
      where: { companyId },
      include: {
        sales: {
          where: { createdAt: { gte: start, lte: end } },
          select: { totalAmount: true }
        }
      }
    });

    const topClientsData = customersWithSales
      .map(c => {
        const total = c.sales.reduce((acc, s) => acc + s.totalAmount, 0);
        return { id: c.id, name: c.name, total: total.toString(), orders: c.sales.length, numericTotal: total };
      })
      .filter(c => c.orders > 0)
      .sort((a, b) => b.numericTotal - a.numericTotal)
      .slice(0, 3)
      .map(c => ({ id: c.id, name: c.name, total: new Intl.NumberFormat('fr-FR').format(c.numericTotal), orders: c.orders }));

    return {
      success: true,
      data: {
        revenue,
        pending,
        overdue,
        newCustomers,
        areaData,
        pieData,
        barData: sortedProducts.length > 0 ? sortedProducts : [ { name: 'Aucun', ventes: 0 } ],
        topClientsData
      }
    };
  } catch (error) {
    console.error('Erreur getDashboardStats:', error);
    return { success: false, error: 'Impossible de récupérer les statistiques.' };
  }
}
