import { NextResponse } from 'next/server';
import { verifyMobileAuth } from '@/lib/mobileAuth';
import { prisma } from '@/lib/prisma';
import { sendLowStockAlert } from '@/lib/mailer';

export async function POST(request: Request) {
  const authResult = await verifyMobileAuth(request);
  if (authResult.error || !authResult.user) {
    return NextResponse.json({ success: false, message: authResult.error }, { status: 401 });
  }

  const companyId = authResult.user.companyId;
  const userId = authResult.user.id;
  
  if (!companyId) {
    return NextResponse.json({ success: false, message: 'Company ID manquant' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { items, paymentMethod, amountPaid, clientId } = body;

    if (!items || !items.length) {
      return NextResponse.json({ success: false, message: 'Le panier est vide' }, { status: 400 });
    }

    // Calculer le total et préparer les items
    let totalAmount = 0;
    const saleItemsData: { description: string; quantity: number; price: number }[] = [];
    const itemsSnapshot: { name: string; stock: number; stockAlert: number; quantity: number }[] = [];
    
    // On fait tout dans une transaction pour éviter les incohérences de stock
    const result = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Produit introuvable: ${item.productId}`);
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuffisant pour ${product.name}`);
        }
        
        const lineTotal = item.quantity * item.price;
        totalAmount += lineTotal;
        
        saleItemsData.push({
          description: product.name,
          quantity: item.quantity,
          price: item.price
        });

        itemsSnapshot.push({
          name: product.name,
          stock: product.stock,
          stockAlert: product.stockAlert || 0,
          quantity: item.quantity,
        });

        // Décrémenter le stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // Créer la vente
      const sale = await tx.sale.create({
        data: {
          companyId,
          customerId: clientId || null,
          invoiceNo: `INV-${Date.now()}`,
          totalAmount,
          status: 'COMPLETED',
          items: {
            create: saleItemsData
          }
        }
      });

      // Enregistrer le paiement
      await tx.accountingTransaction.create({
        data: {
          date: new Date(),
          description: `Paiement Vente ${sale.invoiceNo}`,
          type: 'INCOME',
          category: 'SALES',
          amount: amountPaid || totalAmount,
          status: 'COMPLETED',
          companyId
        }
      });

      return { sale, itemsSnapshot };
    });

    // Envoyer les alertes stock bas si seuil atteint
    for (const snap of result.itemsSnapshot) {
      const remainingStock = snap.stock - snap.quantity;
      if (remainingStock <= (snap.stockAlert || 0)) {
        sendLowStockAlert(snap.name, remainingStock, companyId).catch(console.error);
      }
    }

    return NextResponse.json({
      success: true,
      data: result.sale,
      message: 'Vente enregistrée avec succès'
    });

  } catch (error: any) {
    console.error('Erreur POS:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Erreur lors de l\'enregistrement de la vente' 
    }, { status: 500 });
  }
}
