"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft } from 'lucide-react';
import { PricingCards, PlanId } from '@/app/components/PricingCards';
import { generateSasPayLink } from '@/app/actions/paymentActions';

export default function SubscriptionPage() {
  const { data: session, update } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const initialStatus = (session?.user as any)?.subscriptionStatus;

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

  const userPlan = (session?.user as any)?.plan || 'FREE';
  const subStatus = (session?.user as any)?.subscriptionStatus;
  const isBlocked = subStatus === 'PENDING' || subStatus === 'EXPIRED' || subStatus === 'CANCELLED';

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
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {session?.user && !isBlocked && (
        <div className="flex items-center justify-between pb-2">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour au tableau de bord
          </Link>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
            Forfait actuel : <span className="font-bold">{userPlan}</span>
          </span>
        </div>
      )}

      <PricingCards 
        onSelectPlan={handleSubscribe} 
        loadingPlan={loadingPlan} 
        currentPlan={userPlan} 
      />
    </div>
  );
}
