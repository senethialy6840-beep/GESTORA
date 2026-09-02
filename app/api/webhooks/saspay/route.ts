import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import crypto from "crypto";

/**
 * Webhook SasPay — Activé automatiquement dès qu'un paiement est confirmé.
 * URL à configurer dans le dashboard SasPay :
 * https://gest-three.vercel.app/api/webhooks/saspay
 *
 * SasPay envoie typiquement un header "x-saspay-signature" ou "x-webhook-signature"
 * contenant un HMAC-SHA256 du body signé avec votre SASPAY_WEBHOOK_SECRET.
 */

function verifySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  // Support "sha256=..." prefix
  const clean = signature.startsWith("sha256=") ? signature.slice(7) : signature;
  try {
    return crypto.timingSafeEqual(Buffer.from(clean, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

const PLAN_MAP: Record<string, string> = {
  startup: "STARTUP",
  business: "BUSINESS",
  enterprise: "ENTERPRISE",
  STARTUP: "STARTUP",
  BUSINESS: "BUSINESS",
  ENTERPRISE: "ENTERPRISE",
};

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const headersList = await headers();

    // ─── 1. VÉRIFICATION DE LA SIGNATURE (sécurité) ───────────────────────────
    const WEBHOOK_SECRET = process.env.SASPAY_WEBHOOK_SECRET;
    const signature =
      headersList.get("x-saspay-signature") ||
      headersList.get("x-webhook-signature") ||
      headersList.get("x-signature");

    if (WEBHOOK_SECRET) {
      const isValid = verifySignature(rawBody, signature, WEBHOOK_SECRET);
      if (!isValid) {
        console.error("[SasPay Webhook] Signature invalide :", signature);
        return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
      }
    } else {
      // En développement sans secret configuré, on log un avertissement
      console.warn("[SasPay Webhook] SASPAY_WEBHOOK_SECRET non configuré — vérification ignorée.");
    }

    // ─── 2. PARSING DU PAYLOAD ─────────────────────────────────────────────────
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Payload JSON invalide" }, { status: 400 });
    }

    console.log("[SasPay Webhook] Payload reçu:", JSON.stringify(payload, null, 2));

    const { status, order_id, metadata, custom_data, client_reference } = payload;

    // ─── 3. PAIEMENT RÉUSSI ────────────────────────────────────────────────────
    const isSuccess = ["SUCCESS", "COMPLETED", "PAID", "success", "completed", "paid"].includes(status);

    if (!isSuccess) {
      return NextResponse.json({ success: true, message: `Statut ignoré: ${status}` });
    }

    // ─── 4. ACTIVATION ABONNEMENT ──────────────────────────────────────────────
    // On cherche le companyId dans différents endroits possibles du payload SasPay
    const companyId =
      client_reference ||
      metadata?.companyId ||
      custom_data?.companyId ||
      payload.companyId;

    const rawPlan =
      metadata?.plan ||
      custom_data?.plan ||
      payload.plan ||
      (order_id?.startsWith("sub_") ? order_id.split("_")[1] : null);

    const plan = rawPlan ? (PLAN_MAP[String(rawPlan).toUpperCase()] ?? "STARTUP") : "STARTUP";

    if (companyId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });

      if (!company) {
        console.warn(`[SasPay Webhook] ⚠️ Entreprise introuvable pour l'ID: ${companyId}. Webhook ignoré.`);
        return NextResponse.json({ success: true, message: "Company introuvable, webhook ignoré." });
      }

      // Calculer la date d'expiration (30 jours)
      // On prolonge l'abonnement à partir de la date d'expiration actuelle si elle est dans le futur
      const now = new Date();
      let currentExpiry = company.subscriptionExpiresAt;

      if (!currentExpiry || currentExpiry < now) {
        currentExpiry = now;
      }

      const subscriptionExpiresAt = new Date(currentExpiry);
      subscriptionExpiresAt.setDate(subscriptionExpiresAt.getDate() + 30);

      await prisma.company.update({
        where: { id: companyId },
        data: {
          plan,
          subscriptionStatus: "ACTIVE",
          isActive: true,
          subscriptionExpiresAt,
        },
      });

      console.log(`[SasPay Webhook] ✅ Abonnement activé: Company ${companyId} → Plan ${plan}`);
      return NextResponse.json({
        success: true,
        message: `Abonnement ${plan} activé pour l'entreprise ${companyId}`,
      });
    }

    // ─── 5. MISE À JOUR FACTURE / VENTE ────────────────────────────────────────
    if (order_id) {
      const sale = await prisma.sale.findFirst({
        where: { OR: [{ id: order_id }, { invoiceNo: order_id }] },
      });

      if (sale) {
        await prisma.sale.update({ where: { id: sale.id }, data: { status: "COMPLETED" } });
        return NextResponse.json({ success: true, message: "Facture mise à jour" });
      }

      const transaction = await prisma.accountingTransaction.findFirst({
        where: { id: order_id },
      });

      if (transaction) {
        await prisma.accountingTransaction.update({
          where: { id: transaction.id },
          data: { status: "COMPLETED" },
        });
        return NextResponse.json({ success: true, message: "Transaction mise à jour" });
      }
    }

    console.warn("[SasPay Webhook] Aucun companyId ni order_id exploitable dans le payload.");
    return NextResponse.json({ success: true, message: "Webhook reçu mais rien à mettre à jour" });
  } catch (error: any) {
    console.error("[SasPay Webhook] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur", details: error.message }, { status: 500 });
  }
}
