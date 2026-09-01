import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // SasPay typically sends a webhook payload that looks like:
    // { order_id: '...', status: 'SUCCESS' / 'FAILED', transaction_id: '...', custom_data: { type: 'subscription', companyId: '...', plan: 'STARTUP' } }
    
    console.log("SasPay Webhook Received:", payload);
    
    const { order_id, status, custom_data, client_reference } = payload;
    
    // Vérification du statut de la transaction
    if (status === "SUCCESS" || status === "COMPLETED") {
      
      // 1. GESTION DES ABONNEMENTS SAAS (Nouvelle fonctionnalité)
      // Si on reçoit un webhook pour un abonnement (détecté via client_reference ou custom_data)
      const companyId = client_reference || custom_data?.companyId;
      const plan = custom_data?.plan || "BUSINESS"; // Par défaut ou via payload

      if (companyId && (custom_data?.type === 'subscription' || order_id?.startsWith('sub_'))) {
        await prisma.company.update({
          where: { id: companyId },
          data: { 
            plan: plan,
            subscriptionStatus: "ACTIVE"
          }
        });
        
        return NextResponse.json({ success: true, message: "Abonnement mis à jour" });
      }

      // 2. GESTION DES FACTURES ET VENTES (Fonctionnalité existante)
      if (order_id) {
        // Try to find and update a Sale first
        const sale = await prisma.sale.findUnique({
          where: { id: order_id }
        });
        
        if (sale) {
          await prisma.sale.update({
            where: { id: order_id },
            data: { status: "COMPLETED" }
          });
          return NextResponse.json({ success: true, message: "Sale updated" });
        }

        // If no Sale, try AccountingTransaction
        const transaction = await prisma.accountingTransaction.findUnique({
          where: { id: order_id }
        });
        
        if (transaction) {
          await prisma.accountingTransaction.update({
            where: { id: order_id },
            data: { status: "COMPLETED" }
          });
          return NextResponse.json({ success: true, message: "Transaction updated" });
        }
      }
      
      return NextResponse.json({ error: "Order/Entity not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Webhook processed but status is not SUCCESS" });

  } catch (error: any) {
    console.error("SasPay Webhook Error:", error);
    return NextResponse.json(
      { error: "Webhook Error", details: error.message },
      { status: 500 }
    );
  }
}

