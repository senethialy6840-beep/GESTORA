import { NextResponse } from 'next/server';
import { verifyMobileAuth } from '@/lib/mobileAuth';
import { prisma } from '@/lib/prisma';

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
    const sales = await prisma.sale.findMany({
      where: { companyId },
      include: {
        items: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 for mobile performance
    });

    return NextResponse.json({
      success: true,
      data: sales
    });
  } catch (error) {
    console.error('Erreur API Ventes History:', error);
    return NextResponse.json({ success: false, message: 'Erreur lors de la récupération des ventes' }, { status: 500 });
  }
}
