"use client";

import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Search, Edit, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { TransactionModal } from '../../../components/TransactionModal';
import { useSession } from 'next-auth/react';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '@/app/actions/accountingActions';
import { SkeletonList } from '../../../components/Skeletons';

export default function AccountingPage() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from DB on mount
  useEffect(() => {
    async function loadData() {
      if (session?.user?.companyId) {
        const res = await getTransactions(session.user.companyId);
        if (res.success && res.data) {
          setTransactions(res.data);
        }
      }
      setIsLoaded(true);
    }
    loadData();
  }, [session?.user?.companyId]);

  const handleSaveTransaction = async (newItem: any) => {
    if (!session?.user?.companyId) return;

    if (editingItem && editingItem.id) {
      // Update
      const res = await updateTransaction(editingItem.id, {
        date: new Date(newItem.date),
        description: newItem.description,
        type: newItem.type,
        category: newItem.category || "Général",
        amount: Number(newItem.amount),
      });
      if (res.success && res.data) {
        setTransactions(prev => prev.map(p => p.id === editingItem.id ? res.data : p));
      }
    } else {
      // Create
      const res = await createTransaction({
        date: new Date(newItem.date),
        description: newItem.description,
        type: newItem.type,
        category: newItem.category || "Général",
        amount: Number(newItem.amount),
        status: "COMPLETED",
        companyId: session.user.companyId,
      });
      if (res.success && res.data) {
        setTransactions(prev => [res.data, ...prev]);
      }
    }
    
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteTransaction = async (id: string) => {
    const res = await deleteTransaction(id);
    if (res.success) {
      setTransactions(prev => prev.filter(p => p.id !== id));
    }
  };

  if (!isLoaded) return <div className="w-full max-w-7xl mx-auto space-y-6 pt-6"><SkeletonList count={5} /></div>;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Comptabilité</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Suivez vos flux financiers et votre trésorerie</p>
        </div>
        <button 
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle transaction
        </button>
      </div>

      {transactions.length === 0 ? (
        // Empty State
        <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 p-5 shadow-sm transition-colors duration-300">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
              <Calculator className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucune donnée comptable</h3>
            <p className="text-gray-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              Votre journal comptable est vide. Enregistrez manuellement votre première transaction.
            </p>
            <button 
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Ajouter une transaction
            </button>
          </div>
        </div>
      ) : (
        // Transactions Table Area
        <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 shadow-sm transition-colors duration-300 overflow-hidden">
          
          {/* Table Controls */}
          <div className="p-5 border-b border-gray-200 dark:border-slate-700/50 flex justify-between items-center bg-gray-50/50 dark:bg-[#1E293B]/50">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Rechercher une transaction..." 
                className="w-full bg-white dark:bg-[#0A1226] border border-gray-200 dark:border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-slate-200 placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Table (Desktop) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-slate-400">
              <thead className="text-xs text-gray-700 dark:text-slate-300 uppercase bg-gray-50 dark:bg-[#1E293B]/50 border-b border-gray-200 dark:border-slate-700/50">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Date</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Description</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Type</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Montant</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item) => (
                  <tr key={item.id} className="bg-white dark:bg-[#162032] border-b border-gray-100 dark:border-slate-800/60 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                      {new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {item.description}
                    </td>
                    <td className="px-6 py-4">
                      {item.type === 'INCOME' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
                          <ArrowDownRight className="w-3 h-3 mr-1" /> Recette
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400">
                          <ArrowUpRight className="w-3 h-3 mr-1" /> Dépense
                        </span>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${item.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                      {item.type === 'INCOME' ? '+' : '-'}{item.amount.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTransaction(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards (Mobile) */}
          <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-slate-800/60 pb-4">
            {transactions.map((item) => (
              <div key={item.id} className="p-4 bg-white dark:bg-[#162032] flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="pr-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{item.description}</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      {new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex space-x-1 shrink-0">
                    <button 
                      onClick={() => {
                        setEditingItem(item);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTransaction(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-end mt-1">
                  <div>
                    {item.type === 'INCOME' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <ArrowDownRight className="w-3 h-3 mr-1" /> Recette
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400">
                        <ArrowUpRight className="w-3 h-3 mr-1" /> Dépense
                      </span>
                    )}
                  </div>
                  <span className={`text-lg font-black ${item.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                    {item.type === 'INCOME' ? '+' : '-'}{item.amount.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* The Modal */}
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }} 
        onSave={handleSaveTransaction} 
        initialData={editingItem}
      />
    </div>
  );
}
