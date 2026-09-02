'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-8 py-20">
      <div className="bg-white dark:bg-[#162032] p-8 rounded-2xl shadow-sm w-full text-center border border-gray-200 dark:border-slate-700/50">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Impossible de charger cette page</h2>
        <p className="text-gray-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Un problème est survenu lors du chargement des données. Veuillez vérifier votre connexion ou réessayer.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => reset()}
            className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
          >
            Réessayer
          </button>
          <Link href="/dashboard" className="py-2 px-6 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-bold rounded-lg transition-all">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
