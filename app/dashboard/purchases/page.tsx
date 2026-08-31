"use client";

import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Edit, Trash2, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { PurchaseModal } from '../../../components/PurchaseModal';
import { useSession } from 'next-auth/react';
import { getPurchases, createPurchase, updatePurchaseStatus, deletePurchase, getSuppliers, createSupplier } from '@/app/actions/purchaseActions';
import { SkeletonList } from '../../../components/Skeletons';

export default function PurchasesPage() {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Load from DB on mount
  useEffect(() => {
    async function loadData() {
      if (session?.user?.companyId) {
        const res = await getPurchases(session.user.companyId);
        if (res.success && res.data) {
          setPurchases(res.data);
        }
        const suppRes = await getSuppliers(session.user.companyId);
        if (suppRes.success && suppRes.data) {
          setSuppliers(suppRes.data);
        }
      }
      setIsLoaded(true);
    }
    loadData();
  }, [session?.user?.companyId]);

  const handleSavePurchase = async (newItem: any) => {
    if (!session?.user?.companyId) return;

    // Handle Supplier creation if doesn't exist
    let supplierId = null;
    if (newItem.supplier) {
      const existing = suppliers.find(s => s.name.toLowerCase() === newItem.supplier.toLowerCase());
      if (existing) {
        supplierId = existing.id;
      } else {
        const newSupp = await createSupplier({
          name: newItem.supplier,
          email: "",
          phone: "",
          address: "",
          companyId: session.user.companyId
        });
        if (newSupp.success && newSupp.data) {
          supplierId = newSupp.data.id;
          setSuppliers(prev => [...prev, newSupp.data]);
        }
      }
    }

    if (editingItem && editingItem.id) {
      // Update (only status is supported in our current action, but we'll mock the UI update)
      const res = await updatePurchaseStatus(editingItem.id, newItem.status);
      if (res.success && res.data) {
        setPurchases(prev => prev.map(p => p.id === editingItem.id ? { ...p, ...newItem, supplierId } : p));
      }
    } else {
      // Create
      const res = await createPurchase({
        orderNo: newItem.orderNo,
        totalAmount: Number(newItem.totalAmount),
        status: newItem.status,
        companyId: session.user.companyId,
        supplierId: supplierId
      }, []);
      if (res.success && res.data) {
        setPurchases(prev => [res.data, ...prev]);
      }
    }
  };

  const handleDeletePurchase = async () => {
    if (itemToDelete) {
      const res = await deletePurchase(itemToDelete);
      if (res.success) {
        setPurchases(prev => prev.filter(p => p.id !== itemToDelete));
      }
      setItemToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Livré
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400">
            <XCircle className="w-3 h-3 mr-1" /> Annulé
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400">
            <Clock className="w-3 h-3 mr-1" /> En attente
          </span>
        );
    }
  };

  if (status === 'loading' || !isLoaded) return <div className="w-full max-w-7xl mx-auto space-y-6 pt-6"><SkeletonList count={5} /></div>;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Achats & Fournisseurs</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Gérez vos réapprovisionnements et fournisseurs</p>
        </div>
        <button 
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel achat
        </button>
      </div>

      {purchases.length === 0 ? (
        // Empty State
        <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 p-5 shadow-sm transition-colors duration-300">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
              <Truck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucun achat enregistré</h3>
            <p className="text-gray-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              Enregistrez vos achats auprès de vos fournisseurs pour garder une trace de vos dépenses.
            </p>
            <button 
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Ajouter une commande
            </button>
          </div>
        </div>
      ) : (
        // Purchases Table Area
        <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 shadow-sm transition-colors duration-300 overflow-hidden">
          
          {/* Table Controls */}
          <div className="p-5 border-b border-gray-200 dark:border-slate-700/50 flex justify-between items-center bg-gray-50/50 dark:bg-[#1E293B]/50">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Rechercher une commande..." 
                className="w-full bg-white dark:bg-[#0A1226] border border-gray-200 dark:border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-slate-200 placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Table (Desktop) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-slate-400">
              <thead className="text-xs text-gray-700 dark:text-slate-300 uppercase bg-gray-50 dark:bg-[#1E293B]/50 border-b border-gray-200 dark:border-slate-700/50">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">N° Commande</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Fournisseur</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Statut</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Date</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Montant</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((item) => (
                  <tr key={item.id} className="bg-white dark:bg-[#162032] border-b border-gray-100 dark:border-slate-800/60 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      {item.orderNo}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mr-3 uppercase font-bold text-xs">
                        {item.supplier?.name?.substring(0, 2) || "??"}
                      </div>
                      {item.supplier?.name || "Inconnu"}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                      {new Date(item.createdAt || item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                      {item.totalAmount.toLocaleString('fr-FR')} FCFA
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
                          onClick={() => setItemToDelete(item.id)}
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
            {purchases.map((item) => (
              <div key={item.id} className="p-4 bg-white dark:bg-[#162032] flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 pr-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 uppercase font-bold text-sm shrink-0">
                      {item.supplier?.name?.substring(0, 2) || "??"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{item.supplier?.name || "Fournisseur inconnu"}</h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        {item.orderNo} • {new Date(item.createdAt || item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
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
                      onClick={() => setItemToDelete(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-end mt-1">
                  <div>
                    {getStatusBadge(item.status)}
                  </div>
                  <span className="text-lg font-black text-gray-900 dark:text-white">
                    {item.totalAmount.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* The Modal */}
      <PurchaseModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }} 
        onSave={handleSavePurchase} 
        initialData={editingItem}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <>
          <div
            onClick={() => setItemToDelete(null)}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-[#162032] rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirmer la suppression</h3>
              <p className="text-gray-500 dark:text-slate-400 mb-6">
                Êtes-vous sûr de vouloir supprimer cette commande fournisseur ? Cette action est irréversible et effacera tous les articles liés.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="px-4 py-2 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeletePurchase}
                  className="px-4 py-2 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
