"use client";

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { PricingCards, PlanId } from '@/app/components/PricingCards';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function RegisterPricing() {
  const router = useRouter();

  const handleSelectPlan = (planId: PlanId, monthlyLink: string, annualLink: string, billingCycle: 'monthly' | 'annually') => {
    const selectedLink = billingCycle === 'annually' ? annualLink : monthlyLink;
    const params = new URLSearchParams();
    params.set('plan', planId);
    params.set('billingCycle', billingCycle);
    params.set('paymentLink', selectedLink);
    
    // Redirect to the actual registration form with selected plan
    router.push(`/register/form?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A1226] flex flex-col py-12 px-4 transition-colors duration-300">
      <Link href="/" className="absolute top-8 left-8 flex items-center text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour à l'accueil
      </Link>
      <div className="mt-8">
        <PricingCards onSelectPlan={handleSelectPlan} />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-[#0A1226] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <RegisterPricing />
    </Suspense>
  );
}
