"use client";

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PricingCards, PlanId } from '@/app/components/PricingCards';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { generateSasPayLink } from '@/app/actions/paymentActions';

function PlansContent() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();

  const handleSelectPlan = async (planId: PlanId, billingCycle: 'monthly' | 'annually', amount: number) => {
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
        setLoadingPlan(null);
      }
    } catch (error) {
      console.error(error);
      alert("Erreur de connexion.");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A1226] flex flex-col py-12 px-4 transition-colors duration-300">
      <Link href="/dashboard" className="absolute top-8 left-8 flex items-center text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Aller au tableau de bord (sans forfait)
      </Link>
      <div className="mt-8">
        <PricingCards onSelectPlan={handleSelectPlan} loadingPlan={loadingPlan} />
      </div>
    </div>
  );
}

export default function PlansPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-[#0A1226] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <PlansContent />
    </Suspense>
  );
}
