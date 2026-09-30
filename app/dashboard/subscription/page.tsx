"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PricingCards, PlanId } from '@/app/components/PricingCards';
import { generateSasPayLink } from '@/app/actions/paymentActions';

export default function SubscriptionPage() {
  const { data: session, update } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let initialStatus = (session?.user as any)?.subscriptionStatus;

    const checkStatus = async () => {
      const newSession = await update();
      const newStatus = (newSession?.user as any)?.subscriptionStatus;
      
      if (initialStatus !== 'ACTIVE' && newStatus === 'ACTIVE') {
        router.push('/dashboard');
      }
    };
    
    // Si l'utilisateur est en attente ou expiré, on vérifie régulièrement
    if (session?.user && initialStatus !== 'ACTIVE') {
      interval = setInterval(checkStatus, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session, update, router]);

  const handleSubscribe = async (planId: PlanId, billingCycle: 'monthly' | 'annually', amount: number) => {
    setLoadingPlan(planId);
    try {
      const response = await generateSasPayLink({
        amount: amount,
        description: `Abonnement ${planId} (${billingCycle})`,
        reference: `sub_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        plan: planId,
        billingCycle: billingCycle
      });

      if (response.success && response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        alert(response.error || "Erreur lors de la génération du lien de paiement");
      }
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
