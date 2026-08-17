"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';

function FaqItem({ question, answer }: { question: string, answer: string }) {
  return (
    <details className="group bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl open:shadow-md transition-all">
      <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-gray-900 dark:text-white">
        {question}
        <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
      </summary>
      <div className="px-6 pb-6 text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
        {answer}
      </div>
    </details>
  );
}

export default function FAQPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/support"
          className="p-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Foire Aux Questions</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Trouvez rapidement des réponses à vos questions.</p>
        </div>
      </div>

      <div className="space-y-4">
        <FaqItem 
          question="À qui s'adresse GESTORA ?"
          answer="GESTORA est conçu pour les PME, commerces, supermarchés, pharmacies, restaurants, boutiques, distributeurs, quincailleries et toute entreprise souhaitant centraliser sa gestion."
        />
        <FaqItem 
          question="Puis-je utiliser GESTORA sur plusieurs appareils ?"
          answer="Oui. GESTORA est accessible depuis un ordinateur, une tablette ou un smartphone, avec une interface entièrement responsive."
        />
        <FaqItem 
          question="Mes données sont-elles sécurisées ?"
          answer="Oui. Toutes vos données sont protégées par un chiffrement avancé, des sauvegardes automatiques et un système de gestion des rôles et permissions."
        />
        <FaqItem 
          question="GESTORA permet-il de gérer plusieurs boutiques ?"
          answer="Oui. Vous pouvez gérer plusieurs boutiques, magasins ou entrepôts depuis un seul compte et suivre leurs performances en temps réel."
        />
        <FaqItem 
          question="L'assistance est-elle incluse ?"
          answer="Oui. Notre équipe vous accompagne lors de la prise en main et reste disponible pour répondre à vos questions via différents canaux de support."
        />
      </div>
    </div>
  );
}
