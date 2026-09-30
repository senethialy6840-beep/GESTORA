import { NextResponse } from 'next/server';
import { verifyMobileAuth } from '@/lib/mobileAuth';
import { prisma } from '@/lib/prisma';
import { subMonths, endOfDay, startOfDay, startOfMonth, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function GET(request: Request) {
  const authResult = await verifyMobileAuth(request);
  if (authResult.error || !authResult.user) {
    return NextResponse.json({ success: false, message: authResult.error }, { status: 401 });
  }

  const companyId = authResult.user.companyId;
  if (!companyId) {
    return NextResponse.json({ success: false, message: 'Company ID manquant' }, { status: 400 });
  }

  try {
    const end = endOfDay(new Date());
    const start = startOfMonth(end);
    const sevenMonthsAgo = startOfMonth(subMonths(end, 6));

    const revenueAggr = await prisma.sale.aggregate({
      where: { companyId, status: 'COMPLETED', createdAt: { gte: start, lte: end } },
      _sum: { totalAmount: true }
    });
    const revenue = revenueAggr._sum.totalAmount || 0;

    const expensesAggr = await prisma.accountingTransaction.aggregate({
      where: { companyId, type: 'EXPENSE', date: { gte: start, lte: end } },
      _sum: { amount: true }
    });
    const purchasesAggr = await prisma.purchase.aggregate({
      where: { companyId, createdAt: { gte: start, lte: end } },
      _sum: { totalAmount: true }
    });
    const expenses = (expensesAggr._sum.amount || 0) + (purchasesAggr._sum.totalAmount || 0);

    const netProfit = revenue - expenses;

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

    const salesOverTime = await prisma.sale.findMany({
      where: { companyId, status: 'COMPLETED', createdAt: { gte: sevenMonthsAgo, lte: end } },
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
        entry.benefices += sale.totalAmount * 0.3;
      }
    });
    const areaData = Array.from(monthsMap.values());

    const saleItems = await prisma.saleItem.findMany({
      where: { sale: { companyId, createdAt: { gte: start, lte: end } } },
      select: { description: true, quantity: true }
    });
    
    const productSales = new Map();
    saleItems.forEach(item => {
      const current = productSales.get(item.description) || 0;
      productSales.set(item.description, current + item.quantity);
    });

    const topSellingProducts = Array.from(productSales.entries())
      .map(([name, ventes]) => ({ name, ventes }))
      .sort((a, b) => b.ventes - a.ventes)
      .slice(0, 5);
      
    // Clients count
    const clientsCount = await prisma.customer.count({
      where: { companyId }
    });
    
    // Total sales count
    const salesCount = await prisma.sale.count({
      where: { companyId, createdAt: { gte: start, lte: end } }
    });

    return NextResponse.json({
      success: true,
      data: {
        revenue,
        expenses,
        netProfit,
        salesCount,
        clientsCount,
        areaData,
        topSellingProducts,
        lowStockProducts
      }
    });

  } catch (error) {
    console.error('Mobile Dashboard error:', error);
    return NextResponse.json({ success: false, message: 'Erreur lors du chargement du dashboard' }, { status: 500 });
  }
}
