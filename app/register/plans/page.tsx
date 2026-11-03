"use client";

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PricingCards, PlanId } from '@/app/components/PricingCards';
import { Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { generateSasPayLink } from '@/app/actions/paymentActions';

function PlansContent() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, update } = useSession();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const initialStatus = (session?.user as any)?.subscriptionStatus;

    if (initialStatus === 'ACTIVE') {
      router.push('/dashboard');
      return;
    }

    const checkStatus = async () => {
      const newSession = await update();
      const newStatus = (newSession?.user as any)?.subscriptionStatus;
      if (newStatus === 'ACTIVE') {
        router.push('/dashboard');
      }
    };

    if (session?.user && initialStatus !== 'ACTIVE') {
      interval = setInterval(checkStatus, 4000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session, update, router]);

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
        Retour
      </Link>

      <div className="max-w-4xl mx-auto text-center mt-6 mb-8 px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3 border border-blue-200 dark:border-blue-500/20">
          <ShieldCheck className="w-4 h-4" />
          Étape finale : activation de votre compte
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
          Choisissez votre forfait
        </h1>
        <p className="text-gray-500 dark:text-slate-400 text-base max-w-xl mx-auto font-medium">
          Activez votre abonnement pour débloquer l'accès immédiat à l'ensemble de votre tableau de bord Gestora.
        </p>
      </div>

      <div className="w-full">
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
