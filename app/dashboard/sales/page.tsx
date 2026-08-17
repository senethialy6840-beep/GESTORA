"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Filter, Eye, Trash2, CheckCircle2, ShoppingCart, X, Receipt
} from 'lucide-react';
import { getSales, deleteSale } from '../../actions/saleActions';

const fmt = (num: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(num);

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', 
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(d);
};
import { useSession } from 'next-auth/react';

export default function SalesPage() {
  const { data: session } = useSession();
  const [sales, setSales] = useState<any[]>([]);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  // States for actions
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      if (session?.user?.companyId) {
        const res = await getSales(session.user.companyId);
        if (res.data) {
          setSales(res.data);
        }
      }
    };
    fetchSales();
  }, [session?.user?.companyId]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);


  const toggleMenu = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleViewDetails = (sale: any) => {
    setSelectedSale(sale);
    setActiveMenu(null);
  };

  const confirmDelete = async () => {
    if (saleToDelete) {
      const res = await deleteSale(saleToDelete);
      if (res.success) {
        setSales(prev => prev.filter(s => s.id !== saleToDelete));
        setToastMessage("Vente supprimée avec succès.");
      }
      setSaleToDelete(null);
    }
  };



  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Ventes</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Consultez et gérez toutes vos transactions</p>
        </div>
        
        <Link 
          href="/dashboard/pos"
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm shadow-blue-500/20 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle Vente
        </Link>
      </div>


      {/* TABLE */}
      <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-800/60 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
        {/* Table (Desktop) */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/20 border-b border-gray-200 dark:border-slate-800/60">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Référence</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Produit(s)</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800/60" onClick={() => setActiveMenu(null)}>
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  
                  {/* Reference */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">{sale.invoiceNo}</div>
                  </td>
                  
                  {/* Products */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-700 dark:text-slate-300 truncate max-w-[200px]">
                      {sale.items ? sale.items.map((i:any) => i.description).join(', ') : 'Aucun produit'}
                    </div>
                  </td>
                  
                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      {formatDate(sale.createdAt)}
                    </div>
                  </td>
                  
                  {/* Total */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="font-bold text-sm text-blue-600 dark:text-blue-400">
                      {fmt(sale.totalAmount)}
                    </div>
                  </td>
                  

                  {/* Action */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleViewDetails(sale); }}
                        className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSaleToDelete(sale.id); }}
                        className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Supprimer"
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
        <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-slate-800/60">
          {sales.map((sale: any) => (
            <div key={sale.id} className="p-4 bg-white dark:bg-[#162032] flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">{sale.invoiceNo}</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{formatDate(sale.createdAt)}</p>
                </div>
                <span className="font-black text-blue-600 dark:text-blue-400 text-sm">
                  {fmt(sale.totalAmount)}
                </span>
              </div>
              
              <div className="flex items-center mt-1">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  <span className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider mr-2">Produit(s):</span>
                  {sale.items ? sale.items.map((i:any) => i.description).join(', ') : 'Aucun'}
                </span>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleViewDetails(sale); }}
                  className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Voir les détails"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSaleToDelete(sale.id); }}
                  className="p-2 text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

          {sales.length === 0 && (
            <div className="p-12 text-center">
              <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Aucune vente trouvée</h3>
              <p className="text-gray-500 dark:text-slate-400">Vous n'avez pas encore effectué de vente.</p>
            </div>
          )}
        </div>


      {/* MODAL: VOIR LES DÉTAILS */}
      <AnimatePresence>
        {selectedSale && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSale(null)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-[#162032] rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-0 border-none bg-transparent">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative">
                  <button onClick={() => setSelectedSale(null)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-md">
                    <X className="w-5 h-5 text-white" />
                  </button>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                      <Receipt className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black">Détails de la vente</h2>
                      <p className="text-blue-100 mt-1 font-medium text-sm">Réf : {selectedSale.invoiceNo}</p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-center mb-8 bg-gray-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                    <div>
                      <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Produit(s)</p>
                      <p className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 truncate max-w-[250px]" title={selectedSale.items ? selectedSale.items.map((i:any) => i.description).join(', ') : ''}>
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                        <span className="truncate">{selectedSale.items ? selectedSale.items.map((i:any) => i.description).join(', ') : 'Aucun produit'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Date d'achat</p>
                      <p className="font-semibold text-gray-700 dark:text-slate-300">{formatDate(selectedSale.createdAt)}</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-3 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-gray-400" />
                      Produits achetés
                    </h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {selectedSale.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-white dark:bg-[#162032] p-4 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-blue-500/30 transition-colors shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                              {item.qty || item.quantity}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{item.description}</p>
                              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{fmt(item.price)} l'unité</p>
                            </div>
                          </div>
                          <span className="font-black text-gray-900 dark:text-white">{fmt(item.price * (item.qty || item.quantity))}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-900 dark:bg-black rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                    <div className="flex justify-between items-end relative z-10">
                      <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">Montant total encaissé</p>
                        <p className="text-3xl font-black text-white">{fmt(selectedSale.totalAmount)}</p>
                      </div>
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {saleToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSaleToDelete(null)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-[#162032] rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirmer la suppression</h3>
                <p className="text-gray-500 dark:text-slate-400 mb-6">
                  Êtes-vous sûr de vouloir supprimer cette vente ? Cette action est irréversible.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setSaleToDelete(null)}
                    className="px-4 py-2 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 font-medium text-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-500" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
