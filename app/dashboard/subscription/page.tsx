"use client";

import React, { useState } from 'react';
import { Check, CreditCard, Rocket, Building2, Briefcase, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const plans = [
    {
      id: 'STARTUP',
      name: 'Starter',
      icon: <Rocket className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      monthlyPrice: '5 900 FCFA',
      annualPrice: '59 000 FCFA',
      period: billingCycle === 'monthly' ? '/mois' : '/an',
      description: 'L\'essentiel pour les petits commerces qui se lancent.',
      features: [
        '1 boutique',
        '1 utilisateur',
        'Caisse (POS)',
        'Ventes',
        'Catalogue de Produits',
        'Gestion des Clients',
        'Tableau de bord basique'
      ],
      link: process.env.NEXT_PUBLIC_SASPAY_STARTUP_LINK || "https://link.saspay.me/dzhdwsevbca",
      annualLink: process.env.NEXT_PUBLIC_SASPAY_STARTUP_ANNUAL_LINK || "https://link.saspay.me/gqymsozxixo",
      color: 'blue'
    },
    {
      id: 'BUSINESS',
      name: 'Business',
      icon: <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      monthlyPrice: '10 900 FCFA',
      annualPrice: '109 000 FCFA',
      period: billingCycle === 'monthly' ? '/mois' : '/an',
      description: 'La solution complète pour les PME en croissance.',
      features: [
        '3 boutiques',
        '5 utilisateurs',
        'Facturation',
        'Devis',
        'Achats',
        'Fournisseurs',
        'Gestion de stock avancée',
        'Rapports',
        'Analyses détaillées'
      ],
      link: process.env.NEXT_PUBLIC_SASPAY_BUSINESS_LINK || "https://link.saspay.me/x9qdadsktnm",
      annualLink: process.env.NEXT_PUBLIC_SASPAY_BUSINESS_ANNUAL_LINK || "https://link.saspay.me/jji9l4_m6vq",
      color: 'emerald',
      popular: true
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      icon: <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      monthlyPrice: '25 900 FCFA',
      annualPrice: '259 000 FCFA',
      period: billingCycle === 'monthly' ? '/mois' : '/an',
      description: 'Pour les réseaux multi-sites et les besoins avancés.',
      features: [
        'Boutiques illimitées',
        'Utilisateurs illimités',
        'Module de Comptabilité',
        'Ressources Humaines (RH)',
        'Assistant Intelligent (IA)',
        'Support technique dédié 7j/7'
      ],
      link: process.env.NEXT_PUBLIC_SASPAY_ENTERPRISE_LINK || "https://link.saspay.me/dveyilduqy0",
      annualLink: process.env.NEXT_PUBLIC_SASPAY_ENTERPRISE_ANNUAL_LINK || "https://link.saspay.me/lbss48r_f2q",
      color: 'purple'
    }
  ];

  const handleSubscribe = (planId: string, link: string, annualLink: string) => {
    const selectedLink = billingCycle === 'annually' ? annualLink : link;
    if (!selectedLink || selectedLink === '#') {
      alert("Le lien de paiement n'est pas configuré pour ce plan.");
      return;
    }
    
    setLoadingPlan(planId);
    const companyId = (session?.user as any)?.companyId;
    let finalLink = selectedLink;

    if (companyId) {
      const url = new URL(selectedLink);
      url.searchParams.set('client_reference', companyId);
      url.searchParams.set('metadata[plan]', planId);
      url.searchParams.set('metadata[billingCycle]', billingCycle);
      url.searchParams.set('metadata[companyId]', companyId);
      finalLink = url.toString();
    }

    window.location.href = finalLink;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Abonnements & Tarification</h1>
        <p className="text-lg text-gray-500 dark:text-slate-400">
          Choisissez le plan qui correspond le mieux à la taille et aux besoins de votre entreprise. 
          Passez à la vitesse supérieure avec Gestora.
        </p>

        {/* Toggle Mensuel / Annuel */}
        <div className="flex flex-col items-center justify-center space-y-4 pt-2">
          <div className="inline-flex items-center p-1.5 bg-gray-100 dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Facturation Mensuelle
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annually')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                billingCycle === 'annually'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Facturation Annuelle
            </button>
          </div>

          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Économisez jusqu'à 17 % avec la facturation annuelle.</span>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const displayPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
          return (
            <div 
              key={plan.id}
              className={`relative flex flex-col bg-white dark:bg-[#162032] rounded-2xl border ${plan.popular ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-gray-200 dark:border-slate-700/50'} p-8 transition-all hover:shadow-xl hover:-translate-y-1`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                    Le plus populaire
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${plan.color}-100 dark:bg-${plan.color}-500/10`}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{displayPrice}</span>
                  <span className="text-gray-500 dark:text-slate-400 ml-1 font-medium">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 h-10">{plan.description}</p>
              </div>

              <div className="flex-1">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className={`w-5 h-5 mr-3 flex-shrink-0 text-${plan.color}-500`} />
                      <span className="text-gray-700 dark:text-slate-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe(plan.id, plan.link, plan.annualLink)}
                disabled={loadingPlan === plan.id}
                className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-sm flex items-center justify-center space-x-2 
                  ${plan.popular 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : plan.id === 'ENTERPRISE' 
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Redirection...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>S'abonner</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

