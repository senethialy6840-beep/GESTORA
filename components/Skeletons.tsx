import React from 'react';

/**
 * Skeleton pour les cartes KPI (Chiffre d'affaires, Dépenses, etc.)
 */
export function SkeletonKPICard() {
  return (
    <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        {/* Titre */}
        <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
        {/* Icône */}
        <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse"></div>
      </div>
      {/* Montant */}
      <div className="h-8 w-32 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse mb-3"></div>
      {/* Sous-titre */}
      <div className="h-3 w-20 bg-gray-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
    </div>
  );
}

/**
 * Skeleton pour les grands graphiques ou blocs similaires
 */
export function SkeletonChart({ className = "h-64 md:h-72 lg:h-80" }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm flex flex-col ${className}`}>
      <div className="mb-6">
        {/* Titre */}
        <div className="h-5 w-48 bg-gray-200 dark:bg-slate-700 rounded-md animate-pulse mb-2"></div>
        {/* Sous-titre */}
        <div className="h-3 w-32 bg-gray-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
      </div>
      {/* Zone du graphique */}
      <div className="flex-1 w-full bg-gray-100 dark:bg-slate-800/50 rounded-xl animate-pulse"></div>
    </div>
  );
}

/**
 * Skeleton pour les listes (Factures, Clients, Achats)
 * Affiche plusieurs lignes simulant des cartes de liste
 */
export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar / Icône */}
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse shrink-0"></div>
            <div className="space-y-2">
              {/* Titre principal */}
              <div className="h-5 w-32 sm:w-48 bg-gray-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
              {/* Détails */}
              <div className="h-3 w-24 sm:w-32 bg-gray-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
            </div>
          </div>
          <div className="flex flex-col sm:items-end space-y-2">
            {/* Montant / Valeur principale à droite */}
            <div className="h-6 w-24 bg-gray-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
            {/* Badge / Statut */}
            <div className="h-5 w-16 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton pour les formulaires (Paramètres, Création)
 */
export function SkeletonForm() {
  return (
    <div className="space-y-6 w-full">
      {/* Header Form */}
      <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm">
        <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded-md animate-pulse mb-4"></div>
        <div className="h-3 w-full max-w-md bg-gray-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
      </div>
      
      {/* Inputs Grid */}
      <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
              <div className="h-11 w-full bg-gray-100 dark:bg-slate-800/50 rounded-xl animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
