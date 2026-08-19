"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Search as SearchIcon, Users, FileText, Package, ArrowRight, 
  ShoppingCart, Briefcase, Calculator
} from 'lucide-react';
import { globalSearch } from '@/app/actions/searchActions';
import { useSession } from 'next-auth/react';

function SearchResults() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(true);

  useEffect(() => {
    if (!query.trim() || !session?.user?.companyId) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      const q = query.trim();
      let foundResults: any[] = [];

      const addResult = (id: string, type: string, title: string, description: string, icon: any, link: string) => {
        foundResults.push({ id, type, title, description, icon, link });
      };

      try {
        const res = await globalSearch(q, session.user.companyId);
        if (res.success && res.data) {
          const d = res.data;
          
          // Clients
          d.customers?.forEach((c: any) => {
            addResult(`client-${c.id}`, 'Client', c.name, `Tél: ${c.phone || 'N/A'} | Email: ${c.email || 'N/A'}`, <Users className="w-5 h-5 text-blue-500" />, '/dashboard/clients');
          });

          // Invoices / Sales
          d.sales?.forEach((s: any) => {
            addResult(`inv-${s.id}`, 'Facture', s.invoiceNo, `Client: ${s.customer?.name || 'Inconnu'} | Montant: ${s.totalAmount} FCFA`, <FileText className="w-5 h-5 text-emerald-500" />, '/dashboard/invoices');
          });

          // Products
          d.products?.forEach((p: any) => {
            addResult(`prod-${p.id}`, 'Produit', p.name, `Prix: ${p.price} FCFA | Stock: ${p.stock}`, <Package className="w-5 h-5 text-indigo-500" />, '/dashboard/products');
          });

          // Stock Movements
          d.movements?.forEach((m: any) => {
            addResult(`mov-${m.id}`, 'Mouvement Stock', m.product?.name || 'Produit inconnu', `${m.type === 'IN' ? '+' : '-'}${m.quantity} | ${m.reason || 'Aucun motif'}`, <Package className="w-5 h-5 text-purple-500" />, '/dashboard/inventory');
          });

          // HR / Employees
          d.employees?.forEach((emp: any) => {
            addResult(`hr-${emp.id}`, 'Employé', `${emp.firstName} ${emp.lastName}`, `Poste: ${emp.role}`, <Briefcase className="w-5 h-5 text-teal-500" />, '/dashboard/hr');
          });

          // Accounting
          d.accounting?.forEach((trx: any) => {
            addResult(`acc-${trx.id}`, 'Comptabilité', trx.description, `Catégorie: ${trx.category} | ${trx.amount} FCFA`, <Calculator className="w-5 h-5 text-red-500" />, '/dashboard/accounting');
          });
        }
      } catch (err) {
        console.error("Search error", err);
      }

      setResults(foundResults);
      setIsSearching(false);
    };

    performSearch();
  }, [query, session?.user?.companyId]);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Résultats de recherche</h1>
        {query ? (
          <p className="text-gray-500 dark:text-slate-400 mt-2">
            Affichage des résultats pour la requête <span className="font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">"{query}"</span>
          </p>
        ) : (
          <p className="text-gray-500 dark:text-slate-400 mt-2">
            Veuillez entrer un terme dans la barre de recherche ci-dessus pour lancer une recherche globale.
          </p>
        )}
      </div>

      {isSearching ? (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full shadow-md"></div>
        </div>
      ) : query && results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result) => (
            <Link 
              key={result.id} 
              href={result.link}
              className="bg-white dark:bg-[#162032] p-6 rounded-2xl border border-gray-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl group-hover:scale-110 transition-transform">
                  {result.icon}
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-lg">
                  {result.type}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                {result.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 flex-1">
                {result.description}
              </p>
              <div className="flex items-center text-sm font-bold text-blue-600 dark:text-blue-400">
                Accéder au module <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      ) : query && results.length === 0 ? (
        <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800/80 text-gray-400 dark:text-slate-500 rounded-full flex items-center justify-center mb-6">
            <SearchIcon className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Aucun résultat trouvé pour "{query}"</h3>
          <p className="text-gray-500 dark:text-slate-400 max-w-md">
            Essayez avec d'autres mots-clés ou vérifiez l'orthographe. GESTORA a cherché dans toute la base de données.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800/80 text-gray-400 dark:text-slate-500 rounded-full flex items-center justify-center mb-6">
            <SearchIcon className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Prêt à rechercher</h3>
          <p className="text-gray-500 dark:text-slate-400 max-w-md">
            Utilisez la barre de recherche située en haut de l'écran pour trouver instantanément des données à travers tout le système.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <Suspense fallback={
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full shadow-md"></div>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
}
