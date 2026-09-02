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
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Une question ? Nous avons la réponse.</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Tout ce que vous devez savoir sur les offres et fonctionnalités de GESTORA avant de commencer.</p>
        </div>
      </div>

      <div className="space-y-4">
        <FaqItem 
          question="1. Qu'est-ce que GESTORA ?" 
          answer="GESTORA est une plateforme ERP qui permet de gérer vos ventes, stocks, produits, clients, achats et autres opérations depuis un seul endroit." 
        />
        <FaqItem 
          question="2. À qui s'adresse GESTORA ?" 
          answer="GESTORA est conçu pour les petits commerces, boutiques, PME et entreprises ayant plusieurs points de vente." 
        />
        <FaqItem 
          question="3. Puis-je essayer GESTORA avant de m'abonner ?" 
          answer="Oui, vous pouvez créer un compte et découvrir la plateforme avant de choisir l'offre adaptée à votre entreprise." 
        />
        <FaqItem 
          question="4. Puis-je changer d'offre à tout moment ?" 
          answer="Oui. Vous pouvez passer à une offre supérieure ou modifier votre abonnement selon l'évolution de vos besoins." 
        />
        <FaqItem 
          question="5. Puis-je gérer plusieurs boutiques ?" 
          answer="Oui. L'offre Starter permet de gérer 1 boutique, Business jusqu'à 3 boutiques et Entreprise un nombre illimité de boutiques." 
        />
        <FaqItem 
          question="6. Combien d'utilisateurs puis-je ajouter ?" 
          answer="Cela dépend de votre offre : Starter (1 utilisateur), Business (jusqu'à 5 utilisateurs), Entreprise (utilisateurs illimités)." 
        />
        <FaqItem 
          question="7. Mes données sont-elles sécurisées ?" 
          answer="GESTORA met en place des mesures de sécurité pour protéger les données de votre entreprise et contrôler les accès des utilisateurs." 
        />
        <FaqItem 
          question="8. Puis-je accéder à GESTORA depuis mon téléphone ?" 
          answer="Oui. GESTORA est conçu pour fonctionner sur ordinateur, tablette et smartphone." 
        />
        <FaqItem 
          question="9. Que se passe-t-il si je dépasse les limites de mon offre ?" 
          answer="Vous serez invité à passer à une offre supérieure afin de continuer à utiliser les fonctionnalités ou capacités supplémentaires." 
        />
        <FaqItem 
          question="10. Puis-je résilier mon abonnement ?" 
          answer="Oui. Vous pouvez demander l'arrêt ou la modification de votre abonnement selon les conditions applicables à votre formule." 
        />
        <FaqItem 
          question="11. Quels moyens de paiement sont acceptés ?" 
          answer="Les moyens de paiement disponibles sont affichés au moment du paiement et peuvent varier selon votre pays et votre mode d'abonnement." 
        />
        <FaqItem 
          question="12. L'intelligence artificielle est-elle disponible pour toutes les offres ?" 
          answer="L'assistant intelligent YEYA AI est inclus dans l'offre Entreprise." 
        />
        <FaqItem 
          question="13. Puis-je obtenir de l'aide en cas de problème ?" 
          answer="Oui. GESTORA propose une assistance pour accompagner les utilisateurs dans l'utilisation de la plateforme." 
        />
        <FaqItem 
          question="14. Que se passe-t-il avec mes données si je change d'offre ?" 
          answer="Vos données restent associées à votre entreprise. Le changement d'offre modifie principalement les fonctionnalités et limites disponibles." 
        />
        <FaqItem 
          question="15. Comment commencer avec GESTORA ?" 
          answer="Créez votre compte, configurez votre entreprise et choisissez l'offre adaptée à vos besoins pour commencer à gérer votre activité." 
        />
      </div>
    </div>
  );
}
