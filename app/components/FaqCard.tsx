"use client";

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Layers, ShieldCheck, MessageSquare } from 'lucide-react';

interface FaqItemData {
  id: number;
  question: string;
  answer: string;
}

const GENERAL_QUESTIONS: FaqItemData[] = [
  {
    id: 1,
    question: "1. Qu'est-ce que GESTORA ?",
    answer: "GESTORA est une plateforme ERP complète qui permet de gérer vos ventes, stocks, produits, clients, achats et finances depuis un seul endroit intuitif et sécurisé.",
  },
  {
    id: 2,
    question: "2. À qui s'adresse GESTORA ?",
    answer: "GESTORA est conçu pour les petits commerces, boutiques indépendantes, grossistes, PME et entreprises ayant un ou plusieurs points de vente.",
  },
  {
    id: 3,
    question: "3. Puis-je gérer plusieurs boutiques ?",
    answer: "Oui. L'offre Starter permet de gérer 1 boutique, Business jusqu'à 3 boutiques et Entreprise un nombre illimité de points de vente.",
  },
  {
    id: 4,
    question: "4. Puis-je accéder à GESTORA depuis mon téléphone ?",
    answer: "Oui. GESTORA est 100% responsive et fonctionne en toute fluidité sur ordinateur, tablette et smartphone.",
  },
  {
    id: 5,
    question: "5. Que se passe-t-il avec mes données si je change d'offre ?",
    answer: "Vos données restent totalement intactes et associées à votre entreprise. Le changement d'offre fait uniquement évoluer les fonctionnalités et quotas disponibles.",
  },
  {
    id: 6,
    question: "6. Comment commencer avec GESTORA ?",
    answer: "Créez votre compte en quelques secondes, configurez votre entreprise et choisissez la formule adaptée à vos besoins pour démarrer immédiatement.",
  },
];

const PRICING_QUESTIONS: FaqItemData[] = [
  {
    id: 7,
    question: "7. Mes données sont-elles sécurisées ?",
    answer: "Absolument. GESTORA applique un chiffrement des données, des sauvegardes régulières et un contrôle strict des accès utilisateurs pour protéger votre activité.",
  },
  {
    id: 8,
    question: "8. Puis-je changer d'offre à tout moment ?",
    answer: "Oui. Vous pouvez passer à une offre supérieure ou ajuster votre abonnement à tout moment selon l'évolution de vos besoins.",
  },
  {
    id: 9,
    question: "9. Que se passe-t-il si je dépasse les limites de mon offre ?",
    answer: "Vous recevrez une notification claire vous invitant à faire évoluer votre formule pour continuer à profiter de toutes les fonctionnalités sans interruption.",
  },
  {
    id: 10,
    question: "10. Puis-je résilier mon abonnement ?",
    answer: "Oui. Vous êtes totalement libre : la résiliation s'effectue sans engagement caché et votre accès reste actif jusqu'à la fin de la période facturée.",
  },
  {
    id: 11,
    question: "11. Quels moyens de paiement sont acceptés ?",
    answer: "Nous acceptons les moyens de paiement locaux les plus répandus (Wave, Orange Money) ainsi que les cartes bancaires sécurisées.",
  },
  {
    id: 12,
    question: "12. Puis-je obtenir de l'aide en cas de problème ?",
    answer: "Oui. Notre équipe d'assistance vous accompagne par WhatsApp, téléphone et email pour vous garantir une utilisation sereine au quotidien.",
  },
];

export default function FaqCard() {
  const [activeTab, setActiveTab] = useState<'general' | 'pricing'>('general');
  const [openId, setOpenId] = useState<number | null>(null);

  const currentQuestions = activeTab === 'general' ? GENERAL_QUESTIONS : PRICING_QUESTIONS;

  const toggleItem = (id: number) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <div className="bg-white dark:bg-[#162032] p-8 md:p-10 rounded-[2rem] border border-gray-100 dark:border-slate-700/50 shadow-sm flex flex-col justify-between h-full transition-colors duration-300">
      <div>
        {/* EN-TÊTE DE LA CARTE FAQ */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-3">
            <HelpCircle className="w-3.5 h-3.5" /> Questions fréquentes
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
            Foire Aux Questions
          </h2>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium">
            Tout ce que vous devez savoir sur GESTORA avant de commencer.
          </p>
        </div>

        {/* ONGLETS DES CATÉGORIES (6 PAR ONGLET) */}
        <div className="flex p-1 bg-gray-100/80 dark:bg-slate-800/80 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => { setActiveTab('general'); setOpenId(null); }}
            className={`flex-1 py-2 px-3 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-white dark:bg-[#162032] text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Général & Boutique (6)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('pricing'); setOpenId(null); }}
            className={`flex-1 py-2 px-3 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'pricing'
                ? 'bg-white dark:bg-[#162032] text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tarifs & Sécurité (6)</span>
          </button>
        </div>

        {/* LISTE DES QUESTIONS */}
        <div className="space-y-3">
          {currentQuestions.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="border border-gray-100 dark:border-slate-800/80 rounded-xl bg-gray-50/50 dark:bg-slate-900/40 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full flex items-center justify-between p-3.5 md:p-4 text-left font-bold text-sm text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span className="pr-2">{item.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs md:text-sm text-gray-500 dark:text-slate-400 leading-relaxed border-t border-gray-100/60 dark:border-slate-800/60">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PIED DE CARTE FAQ */}
      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
          12 questions au total
        </span>
        <a
          href="#contact"
          className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Une question non listée ? Écrivez-nous →</span>
        </a>
      </div>
    </div>
  );
}
