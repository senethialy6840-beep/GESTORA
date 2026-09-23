"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { PricingCards, PlanId } from '@/app/components/PricingCards';

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: PlanId, monthlyLink: string, annualLink: string, billingCycle: 'monthly' | 'annually') => {
    setLoadingPlan(planId);
    try {
      const companyId = (session?.user as any)?.companyId;
      const selectedLink = billingCycle === 'annually' ? annualLink : monthlyLink;
      if (selectedLink) {
        const url = new URL(selectedLink);
        if (companyId) {
          url.searchParams.set('client_reference', companyId);
          url.searchParams.set('metadata[companyId]', companyId);
        }
        url.searchParams.set('metadata[plan]', planId);
        url.searchParams.set('metadata[billingCycle]', billingCycle);
        window.location.href = url.toString();
        return;
      }
      alert("Le lien de paiement n'est pas configuré pour ce plan.");
    } catch (error) {
      console.error('Erreur de génération SasPay:', error);
      alert("Une erreur est survenue lors de la préparation du paiement.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <PricingCards onSelectPlan={handleSubscribe} loadingPlan={loadingPlan} />
  );
}
