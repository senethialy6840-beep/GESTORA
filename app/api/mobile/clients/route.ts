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
    const clients = await prisma.client.findMany({
      where: { companyId },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('Erreur API Clients:', error);
    return NextResponse.json({ success: false, message: 'Erreur lors de la récupération des clients' }, { status: 500 });
  }
}
