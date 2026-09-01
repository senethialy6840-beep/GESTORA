'use server';

import { prisma } from '@/lib/prisma';
import { subDays, startOfMonth, subMonths, endOfDay, startOfDay, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { auth } from '@/auth';

export type DashboardStats = {
  revenue: number;
  expenses: number;
  netProfit: number;
  newCustomers: number;
  areaData: any[];
  pieData: any[];
  barData: any[];
  topSellingProducts: any[];
  lowStockProducts: any[];
};

export async function getDashboardStats(_companyId: string, startDate?: string, endDate?: string): Promise<{ success: boolean; data?: DashboardStats; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return { success: false, error: "Non autorisé" };
    const companyId = session.user.companyId as string;
    
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

    // 2. Dépenses totales
    const expensesAggr = await prisma.accountingTransaction.aggregate({
      where: {
        companyId,
        type: 'EXPENSE',
        date: { gte: start, lte: end }
      },
      _sum: { amount: true }
    });
    const purchasesAggr = await prisma.purchase.aggregate({
      where: {
        companyId,
        createdAt: { gte: start, lte: end }
      },
      _sum: { totalAmount: true }
    });
    const expenses = (expensesAggr._sum.amount || 0) + (purchasesAggr._sum.totalAmount || 0);

    // 3. Bénéfice net
    const netProfit = revenue - expenses;

    // 4. Stocks faibles
    const allProducts = await prisma.product.findMany({
      where: { companyId },
      select: { id: true, name: true, stock: true, stockAlert: true }
    });
    
    const lowStockProducts = allProducts
      .filter(p => p.stock <= (p.stockAlert || 0))
      .map(p => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        alert: p.stockAlert || 0
      }))
      .slice(0, 5);

    // Removed newCustomers as per user request

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

    // 8. Top Selling Products (replaces Top Clients)
    const topSellingProducts = Array.from(productSales.entries())
      .map(([name, ventes]) => ({ name, ventes }))
      .sort((a, b) => b.ventes - a.ventes)
      .slice(0, 5);

    return {
      success: true,
      data: {
        revenue,
        expenses,
        netProfit,
        newCustomers: 0,
        areaData,
        pieData,
        barData: sortedProducts.length > 0 ? sortedProducts : [ { name: 'Aucun', ventes: 0 } ],
        topSellingProducts,
        lowStockProducts
      }
    };
  } catch (error) {
    console.error('Erreur getDashboardStats:', error);
    return { success: false, error: 'Impossible de récupérer les statistiques.' };
  }
}
