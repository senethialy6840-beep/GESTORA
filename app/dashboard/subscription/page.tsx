"use client";

import React, { useState } from 'react';
import { Check, CreditCard, Rocket, Building2, Briefcase } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'STARTUP',
      name: 'Startup',
      icon: <Rocket className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      price: '15 000 FCFA',
      period: '/mois',
      description: 'Idéal pour les petites équipes et les jeunes entreprises.',
      features: [
        'Jusqu\'à 5 utilisateurs',
        'Gestion des ventes et factures',
        'Suivi de base des stocks',
        'Support par email'
      ],
      link: process.env.NEXT_PUBLIC_SASPAY_STARTUP_LINK || '#',
      color: 'blue'
    },
    {
      id: 'BUSINESS',
      name: 'Business',
      icon: <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      price: '35 000 FCFA',
      period: '/mois',
      description: 'Pour les PME en pleine croissance nécessitant plus d\'outils.',
      features: [
        'Jusqu\'à 15 utilisateurs',
        'Toutes les fonctionnalités Startup',
        'Gestion multi-entrepôts',
        'Rapports analytiques avancés',
        'Support prioritaire'
      ],
      link: process.env.NEXT_PUBLIC_SASPAY_BUSINESS_LINK || '#',
      color: 'emerald',
      popular: true
    },
    {
      id: 'ENTERPRISE',
      name: 'Entreprise',
      icon: <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      price: 'Sur devis',
      period: '',
      description: 'Une solution complète pour les grandes structures.',
      features: [
        'Utilisateurs illimités',
        'Toutes les fonctionnalités Business',
        'API & Intégrations personnalisées',
        'Account manager dédié',
        'Formation sur site'
      ],
      link: process.env.NEXT_PUBLIC_SASPAY_ENTERPRISE_LINK || '#',
      color: 'purple'
    }
  ];

  const handleSubscribe = (planId: string, link: string) => {
    if (!link || link === '#') {
      alert("Le lien de paiement n'est pas configuré pour ce plan.");
      return;
    }
    
    setLoadingPlan(planId);
    
    // Si on veut passer l'ID de l'entreprise au lien SasPay :
    // const companyId = session?.user?.companyId;
    // const finalLink = companyId ? `${link}?client_reference=${companyId}` : link;
    
    // Redirection
    window.location.href = link;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Abonnements & Tarification</h1>
        <p className="text-lg text-gray-500 dark:text-slate-400">
          Choisissez le plan qui correspond le mieux à la taille et aux besoins de votre entreprise. 
          Passez à la vitesse supérieure avec Gestora.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
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
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
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
              onClick={() => handleSubscribe(plan.id, plan.link)}
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
        ))}
      </div>
    </div>
  );
}
