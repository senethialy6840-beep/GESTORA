import { NextResponse } from 'next/server';
import { verifyMobileAuth } from '@/lib/mobileAuth';
import { analyzeQueryAction } from '@/app/actions/aiActions';

export async function POST(request: Request) {
  const authResult = await verifyMobileAuth(request);
  if (authResult.error || !authResult.user) {
    return NextResponse.json({ success: false, message: authResult.error }, { status: 401 });
  }

  const companyId = authResult.user.companyId;
  const userName = authResult.user.firstName || authResult.user.email;
  
  if (!companyId) {
    return NextResponse.json({ success: false, message: 'Company ID manquant' }, { status: 400 });
  }

  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ success: false, message: 'Requête manquante' }, { status: 400 });
    }

    const responseText = await analyzeQueryAction(query, companyId, userName);

    return NextResponse.json({
      success: true,
      text: responseText
    });
  } catch (error) {
    console.error('Erreur API YEYA:', error);
    return NextResponse.json({ success: false, message: 'Erreur lors de la communication avec YEYA AI' }, { status: 500 });
  }
}
