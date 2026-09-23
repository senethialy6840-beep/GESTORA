"use server";

import { revalidatePath } from "next/cache";
import { auth } from '@/auth';

interface SasPayPaymentRequest {
  amount: number;
  currency?: string;
  description: string;
  reference: string;
  customer_email?: string;
  plan?: string;
  billingCycle?: "monthly" | "annually";
}

export async function generateSasPayLink(data: SasPayPaymentRequest) {
  try {
    const SASPAY_SECRET_KEY = process.env.SASPAY_SECRET_KEY;
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

    if (!SASPAY_SECRET_KEY) {
      throw new Error("La clé secrète SasPay n'est pas configurée.");
    }

    // Prepare payload based on typical SasPay requirements
    // Attach the current user's companyId as client_reference so the webhook
    // can identify and activate the company automatically after payment.
    const session = await auth();
    const companyId = session?.user?.companyId as string | undefined;

    const payload: any = {
      amount: data.amount,
      currency: data.currency || "XOF",
      description: data.description,
      order_id: data.reference,
      customer_email: data.customer_email || "contact@gestora.app",
      return_url: `${APP_URL}/dashboard/subscription?payment=return`,
      cancel_url: `${APP_URL}/dashboard/subscription?payment=cancelled`,
      webhook_url: `${APP_URL}/api/webhooks/saspay`,
    };

    if (companyId) {
      payload.client_reference = companyId;
      payload.metadata = {
        companyId,
      };
      if (data.plan) payload.metadata.plan = data.plan;
      if (data.billingCycle) payload.metadata.billingCycle = data.billingCycle;
    }

    const response = await fetch("https://api.saspay.me/api/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SASPAY_SECRET_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("SasPay API Error:", result);
      throw new Error(result.message || "Erreur lors de la génération du lien de paiement");
    }

    // Return the payment URL (assuming 'payment_url' or 'url' in response)
    const paymentUrl = result.data?.payment_url || result.data?.url || result.payment_url || result.url;
    if (!paymentUrl) {
      console.error("SasPay API response missing payment URL:", result);
      return { success: false, error: "SasPay n'a pas retourné de lien de paiement." };
    }

    return { success: true, paymentUrl };
  } catch (error: any) {
    console.error("Payment generation error:", error);
    return { success: false, error: error.message || "Une erreur est survenue" };
  }
}
