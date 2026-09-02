'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A1226] flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-[#162032] p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100 dark:border-slate-800">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Une erreur inattendue est survenue</h1>
        <p className="text-gray-500 dark:text-slate-400 mb-8">
          Nous sommes désolés, l'application a rencontré un problème technique.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
          >
            Réessayer
          </button>
          <Link href="/" className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-bold rounded-xl transition-all flex items-center justify-center">
            <Home className="w-4 h-4 mr-2" /> Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
