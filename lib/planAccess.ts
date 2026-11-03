export type PlanType = 'FREE' | 'STARTUP' | 'BUSINESS' | 'ENTERPRISE';

export const PLAN_RANKS: Record<string, number> = {
  FREE: 0,
  STARTUP: 1,
  BUSINESS: 2,
  ENTERPRISE: 3,
};

export const PLAN_DISPLAY_NAMES: Record<string, string> = {
  FREE: 'Gratuit',
  STARTUP: 'Starter',
  BUSINESS: 'Business',
  ENTERPRISE: 'Enterprise',
};

export function hasPlanAccess(
  userPlan: string | undefined | null,
  requiredPlan: string,
  isPlatformOwner: boolean = false
): boolean {
  if (isPlatformOwner) return true;
  const currentRank = PLAN_RANKS[(userPlan || 'FREE').toUpperCase()] ?? 0;
  const requiredRank = PLAN_RANKS[requiredPlan.toUpperCase()] ?? 1;
  return currentRank >= requiredRank;
}

export interface LockedFeatureDetails {
  key: string;
  name: string;
  title: string;
  tagline: string;
  requiredPlan: 'BUSINESS' | 'ENTERPRISE';
  description: string;
  benefits: string[];
}

export const LOCKED_FEATURES: Record<string, LockedFeatureDetails> = {
  inventory: {
    key: 'inventory',
    name: 'Stock Avancé',
    title: 'Gestion de Stock Multi-Entrepôts & Avancée',
    tagline: 'Optimisez votre inventaire et éliminez les ruptures',
    requiredPlan: 'BUSINESS',
    description: 'Suivez vos stocks en temps réel sur plusieurs entrepôts, automatisez les seuils de réapprovisionnement et valorisez votre inventaire selon les normes comptables.',
    benefits: [
      'Gestion multi-entrepôts et suivi des transferts d’articles en temps réel',
      'Alertes intelligentes de stocks critiques et seuils de réapprovisionnement',
      'Traçabilité complète de l’historique des mouvements d’entrées et sorties',
      'Valorisation de stock précise (méthodes CUMP et FIFO)',
    ],
  },
  invoices: {
    key: 'invoices',
    name: 'Factures & Devis',
    title: 'Facturation Professionnelle & Gestion des Devis',
    tagline: 'Émettez des documents conformes et suivez vos créances',
    requiredPlan: 'BUSINESS',
    description: 'Créez des factures pro-forma et devis professionnels, suivez l’état des paiements clients et accélérez vos encaissements avec un suivi rigoureux.',
    benefits: [
      'Création et personnalisation de devis transformables en factures en 1 clic',
      'Suivi en direct des règlements partiels, soldes et relances des impayés',
      'Génération et export de fichiers PDF certifiés avec logo et mentions légales',
      'Historique complet des créances clients et échéanciers financiers',
    ],
  },
  purchases: {
    key: 'purchases',
    name: 'Achats & Fournisseurs',
    title: 'Achats & Gestion des Relations Fournisseurs',
    tagline: 'Maîtrisez vos approvisionnements et vos dépenses',
    requiredPlan: 'BUSINESS',
    description: 'Centralisez vos commandes d’achat, surveillez les réceptions de marchandises et contrôlez les dettes fournisseurs pour une gestion optimale des flux sortants.',
    benefits: [
      'Répertoire complet des fournisseurs et suivi des conditions négociées',
      'Émission de bons de commande et rapprochement des livraisons',
      'Mise à jour automatique des stocks à la réception des marchandises',
      'Échéancier de règlement des factures fournisseurs pour préserver votre trésorerie',
    ],
  },
  reports: {
    key: 'reports',
    name: 'Rapports & Analyses',
    title: 'Rapports Avancés & Analyses Décisionnelles',
    tagline: 'Pilotez votre croissance avec des données précises',
    requiredPlan: 'BUSINESS',
    description: 'Prenez les meilleures décisions grâce à des tableaux de bord analytiques détaillés, des calculs de marges nettes et des rapports visuels exportables.',
    benefits: [
      'Visualisation graphique des courbes d’évolution des ventes et bénéfices',
      'Palmarès des produits les plus vendus et analyse de rentabilité par rayon',
      'Indicateurs de performance par vendeur, point de vente et période',
      'Export des états financiers et rapports complets sous formats Excel et PDF',
    ],
  },
  accounting: {
    key: 'accounting',
    name: 'Comptabilité',
    title: 'Module Comptabilité Générale & SYSCOHADA',
    tagline: 'Automatisez la tenue comptable de votre entreprise',
    requiredPlan: 'ENTERPRISE',
    description: 'Une solution de comptabilité intégrée et automatisée : chaque vente et chaque dépense génère vos écritures comptables pour une visibilité financière parfaite.',
    benefits: [
      'Plan comptable général et écritures générées automatiquement',
      'Édition instantanée du Bilan et du Compte de Résultat certifiés',
      'Grand livre, balance générale des comptes et suivi de la trésorerie',
      'Clôtures d’exercice fluides et exports standardisés pour l’expert-comptable',
    ],
  },
  hr: {
    key: 'hr',
    name: 'Ressources Humaines',
    title: 'Gestion des Ressources Humaines (RH)',
    tagline: 'Gérez vos collaborateurs, paies et plannings',
    requiredPlan: 'ENTERPRISE',
    description: 'Unifiez la gestion de votre personnel : contrats, fiches de paie, gestion des congés et suivi de la masse salariale en toute simplicité.',
    benefits: [
      'Fiches employés complètes avec historique de poste et contrats',
      'Calcul et émission des bulletins de paie avec gestion des primes',
      'Suivi des congés payés, absences et plannings d’équipes',
      'Tableaux de bord d’évolution de la masse salariale et de la productivité',
    ],
  },
  ai: {
    key: 'ai',
    name: 'Gestora AI',
    title: 'Intelligence Artificielle Gestora AI',
    tagline: 'Votre copilote intelligent d’entreprise 24h/24',
    requiredPlan: 'ENTERPRISE',
    description: 'Profitez de la puissance de l’IA générative pour analyser vos performances, prédire les tendances d’achat et recevoir des recommandations stratégiques personnalisées.',
    benefits: [
      'Assistant décisionnel conversationnel pour analyser vos métriques à la demande',
      'Prédictions de ventes et détection proactive des risques de rupture ou surstock',
      'Recommandations automatiques pour maximiser vos marges et votre trésorerie',
      'Synthèses exécutives hebdomadaires de santé financière prêtes à l’emploi',
    ],
  },
};

export function getFeatureDetailsForPath(pathname: string): LockedFeatureDetails | null {
  if (pathname.startsWith('/dashboard/accounting')) return LOCKED_FEATURES.accounting;
  if (pathname.startsWith('/dashboard/hr')) return LOCKED_FEATURES.hr;
  if (pathname.startsWith('/dashboard/ai')) return LOCKED_FEATURES.ai;
  if (pathname.startsWith('/dashboard/inventory')) return LOCKED_FEATURES.inventory;
  if (pathname.startsWith('/dashboard/reports')) return LOCKED_FEATURES.reports;
  if (pathname.startsWith('/dashboard/purchases')) return LOCKED_FEATURES.purchases;
  if (pathname.startsWith('/dashboard/invoices')) return LOCKED_FEATURES.invoices;
  return null;
}

