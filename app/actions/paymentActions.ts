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
    const session = await auth();
    const companyId = session?.user?.companyId as string | undefined;
    if (!companyId) {
      return { success: false, error: "Votre entreprise n'est pas identifiée. Veuillez vous reconnecter." };
    }

    const plan = data.plan?.toUpperCase();
    const billingCycle = data.billingCycle || "monthly";
    const linkByPlan: Record<string, string | undefined> = billingCycle === "annually"
      ? {
          STARTUP: process.env.NEXT_PUBLIC_SASPAY_STARTUP_ANNUAL_LINK,
          BUSINESS: process.env.NEXT_PUBLIC_SASPAY_BUSINESS_ANNUAL_LINK,
          ENTERPRISE: process.env.NEXT_PUBLIC_SASPAY_ENTERPRISE_ANNUAL_LINK,
        }
      : {
          STARTUP: process.env.NEXT_PUBLIC_SASPAY_STARTUP_LINK,
          BUSINESS: process.env.NEXT_PUBLIC_SASPAY_BUSINESS_LINK,
          ENTERPRISE: process.env.NEXT_PUBLIC_SASPAY_ENTERPRISE_LINK,
        };

    const configuredLink = plan ? linkByPlan[plan] : undefined;
    if (!plan || !configuredLink) {
      return { success: false, error: "Le lien SasPay de ce forfait n'est pas configuré." };
    }

    const paymentUrl = new URL(configuredLink);
    paymentUrl.searchParams.set("client_reference", companyId);
    paymentUrl.searchParams.set("metadata[companyId]", companyId);
    paymentUrl.searchParams.set("metadata[plan]", plan);
    paymentUrl.searchParams.set("metadata[billingCycle]", billingCycle);
    paymentUrl.searchParams.set("metadata[reference]", data.reference);

    return { success: true, paymentUrl: paymentUrl.toString() };
  } catch (error: any) {
    console.error("Payment generation error:", error);
    return { success: false, error: error.message || "Une erreur est survenue" };
  }
}
