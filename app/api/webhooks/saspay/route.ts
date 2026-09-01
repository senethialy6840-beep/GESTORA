import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // SasPay typically sends a webhook payload that looks like:
    // { order_id: '...', status: 'SUCCESS' / 'FAILED', transaction_id: '...' }
    // Note: The exact structure depends on their API documentation.
    
    console.log("SasPay Webhook Received:", payload);
    
    const { order_id, status } = payload;
    
    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    if (status === "SUCCESS" || status === "COMPLETED") {
      // 1. Try to find and update a Sale first
      const sale = await prisma.sale.findUnique({
        where: { id: order_id }
      });
      
      if (sale) {
        await prisma.sale.update({
          where: { id: order_id },
          data: { status: "COMPLETED" }
        });
        
        // Optionally create an AccountingTransaction for the sale if not exists
        return NextResponse.json({ success: true, message: "Sale updated" });
      }

      // 2. If no Sale, try AccountingTransaction
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
      
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
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
