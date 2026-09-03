"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    planId: "STARTUP",
    price: "5 900 FCFA",
    period: "/ mois",
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
    price: "14 900 FCFA",
    period: "/ mois",
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
    name: "Entreprise",
    planId: "ENTERPRISE",
    price: "25 000 FCFA",
    period: "/ mois",
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

export function PricingSection() {
  return (
    <section id="tarification" className="py-32 bg-white dark:bg-[#0A1226] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION TITLE & SUBTITLE */}
        <div className="text-center max-w-4xl mx-auto mb-20">
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
            className="text-xl text-gray-500 dark:text-gray-400 font-medium"
          >
            Changez d'offre à tout moment, sans engagement.
          </motion.p>
        </div>

        {/* PRICING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto mb-24 items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -12, transition: { duration: 0.2, ease: "easeOut" } }}
              className={`relative rounded-[2rem] p-[1px] bg-gray-200 dark:bg-gray-800 ${
                plan.isPopular 
                  ? 'bg-gradient-to-b from-[#2563EB] to-cyan-400 shadow-[0_0_40px_rgba(79,130,246,0.3)] z-10 md:-mt-8' 
                  : ''
              }`}
            >
              <div className={`h-full bg-white dark:bg-[#121212] rounded-[calc(2rem-1px)] p-8 lg:p-10 flex flex-col ${plan.isPopular ? 'relative' : ''}`}>
                
                {plan.isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#2563EB] to-cyan-400 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                    {plan.badge}
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{plan.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium h-12">{plan.description}</p>
                </div>
                
                <div className="mb-8 flex items-baseline whitespace-nowrap">
                  <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{plan.price}</span>
                  {plan.period && <span className="text-base text-gray-500 dark:text-gray-400 font-medium ml-2">{plan.period}</span>}
                </div>
                
                <Link 
                  href={`/register?plan=${plan.planId}`}
                  className={`block w-full py-4 rounded-xl font-bold text-center transition-all duration-300 mb-10 ${
                    plan.isPopular
                      ? 'bg-[#2563EB] text-white hover:bg-blue-600 shadow-md hover:shadow-xl hover:-translate-y-1'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
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
                      <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>



      </div>
    </section>
  );
}
