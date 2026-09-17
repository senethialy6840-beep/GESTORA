"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const plans = [
    {
      name: "Starter",
      planId: "STARTUP",
      monthlyPrice: "5 900 FCFA",
      annualPrice: "59 000 FCFA",
      period: billingCycle === 'monthly' ? "/ mois" : "/ an",
      description: "L'essentiel pour les petits commerces qui se lancent.",
      features: [
        "1 boutique",
        "1 utilisateur",
        "Caisse (POS)",
        "Ventes",
        "Catalogue de Produits",
        "Gestion des Clients",
        "Tableau de bord basique"
      ],
      buttonText: "Commencer",
      isPopular: false,
    },
    {
      name: "Business",
      planId: "BUSINESS",
      badge: "Le plus populaire",
      monthlyPrice: "10 900 FCFA",
      annualPrice: "109 000 FCFA",
      period: billingCycle === 'monthly' ? "/ mois" : "/ an",
      description: "La solution complète pour les PME en croissance.",
      features: [
        "3 boutiques",
        "5 utilisateurs",
        "Facturation",
        "Devis",
        "Achats",
        "Fournisseurs",
        "Gestion de stock avancée",
        "Rapports",
        "Analyses détaillées"
      ],
      buttonText: "Commencer",
      isPopular: true,
    },
    {
      name: "Enterprise",
      planId: "ENTERPRISE",
      monthlyPrice: "25 900 FCFA",
      annualPrice: "259 000 FCFA",
      period: billingCycle === 'monthly' ? "/ mois" : "/ an",
      description: "Pour les réseaux multi-sites et les besoins avancés.",
      features: [
        "Boutiques illimitées",
        "Utilisateurs illimités",
        "Module de Comptabilité",
        "Ressources Humaines (RH)",
        "Assistant Intelligent (IA)",
        "Support technique dédié 7j/7"
      ],
      buttonText: "Commencer",
      isPopular: false,
    }
  ];

  return (
    <section id="tarification" className="py-32 bg-white dark:bg-[#0A1226] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION TITLE & SUBTITLE */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight"
          >
            Des tarifs simples et transparents
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 dark:text-slate-400 font-medium mb-8"
          >
            Changez d'offre à tout moment, sans engagement.
          </motion.p>

          {/* TOGGLE MENSUEL / ANNUEL & ECONOMIE BADGE */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center space-y-4"
          >
            <div className="inline-flex items-center p-1.5 bg-gray-100 dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
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
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center space-x-2 ${
                  billingCycle === 'annually'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>Facturation Annuelle</span>
              </button>
            </div>

            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Économisez jusqu'à 17 % avec la facturation annuelle.</span>
            </div>
          </motion.div>
        </div>

        {/* PRICING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto mb-24 items-start">
          {plans.map((plan, index) => {
            const displayPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -12, transition: { duration: 0.2, ease: "easeOut" } }}
                className={`relative rounded-[2rem] p-[1px] bg-gray-200 dark:bg-gray-800 ${
                  plan.isPopular 
                    ? 'bg-gradient-to-b from-[#2563EB] to-cyan-400 shadow-[0_0_40px_rgba(79,130,246,0.3)] z-10 md:-mt-4' 
                    : ''
                }`}
              >
                <div className={`h-full bg-white dark:bg-[#162032] rounded-[calc(2rem-1px)] p-8 lg:p-10 flex flex-col ${plan.isPopular ? 'relative' : ''}`}>
                  
                  {plan.isPopular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#2563EB] to-cyan-400 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                      {plan.badge}
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{plan.name}</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-sm font-medium h-12">{plan.description}</p>
                  </div>
                  
                  <div className="mb-8 flex items-baseline whitespace-nowrap">
                    <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{displayPrice}</span>
                    <span className="text-base text-gray-500 dark:text-slate-400 font-medium ml-2">{plan.period}</span>
                  </div>
                  
                  <Link 
                    href={`/register?plan=${plan.planId}`}
                    className={`block w-full py-4 rounded-xl font-bold text-center transition-all duration-300 mb-10 ${
                      plan.isPopular
                        ? 'bg-[#2563EB] text-white hover:bg-blue-600 shadow-md hover:shadow-xl hover:-translate-y-1'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {plan.buttonText}
                  </Link>
                  
                  <div className="space-y-4 flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider">Fonctionnalités incluses</p>
                    {plan.features.map(feature => (
                      <div key={feature} className="flex items-start">
                        <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mr-3">
                          <Check className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                        </div>
                        <span className="text-gray-600 dark:text-slate-300 font-medium text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

