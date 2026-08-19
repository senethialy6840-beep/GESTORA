"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, ArrowUpRight, ArrowDownRight, Search, Plus, 
  MoreVertical, Edit, Trash2, CheckCircle2, X 
} from 'lucide-react';
import { InventoryModal } from '../../../components/InventoryModal';
import { getInventoryMovements, createInventoryMovement, deleteInventoryMovement } from '../../actions/inventoryActions';
import { getProducts } from '../../actions/productActions';
import { SkeletonList } from '../../../components/Skeletons';
import { useSession } from 'next-auth/react';

export default function InventoryPage() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.companyId) {
        setIsLoading(true);
        const [invRes, prodRes] = await Promise.all([
          getInventoryMovements(session.user.companyId),
          getProducts(session.user.companyId)
        ]);
        
        if (invRes.success && invRes.data) {
          setInventory(invRes.data);
        }
        if (prodRes.success && prodRes.data) {
          setProducts(prodRes.data);
        }
        setIsLoading(false);
      }
      setIsLoaded(true);
    };
    fetchData();
  }, [session?.user?.companyId]);

  const handleSaveInventory = async (newItem: any) => {
    if (!session?.user?.companyId) return;
    setIsLoading(true);
    
    const data = {
      type: newItem.type,
      quantity: newItem.quantity,
      reason: newItem.reason,
      productId: newItem.productId,
      companyId: session.user.companyId
    };
    
    try {
      const res = await createInventoryMovement(data);
      if (res.success && res.data) {
        const invRes = await getInventoryMovements(session.user.companyId);
        if (invRes.success && invRes.data) {
          setInventory(invRes.data);
        }
      } else {
        alert("Erreur lors de l'enregistrement: " + res.error);
        throw new Error(res.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInventory = async () => {
    if (itemToDelete) {
      setIsLoading(true);
      const res = await deleteInventoryMovement(itemToDelete);
      if (res.success) {
        setInventory(prev => prev.filter(p => p.id !== itemToDelete));
      }
      setItemToDelete(null);
      setIsLoading(false);
    }
  };

  if (!isLoaded) return null;

  const filteredInventory = inventory.filter(item => 
    item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Stock</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Surveillez vos niveaux de stock en temps réel</p>
        </div>
        <button 
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          disabled={isLoading || products.length === 0}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
        >
          {isLoading ? <span className="animate-spin mr-2">⏳</span> : <Plus className="w-4 h-4 mr-2" />}
          Ajuster le stock
        </button>
      </div>

      {products.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-700/50 text-yellow-800 dark:text-yellow-400 p-4 rounded-xl font-medium mb-6">
          Veuillez d'abord ajouter des produits dans l'onglet "Produits & Stock" avant de pouvoir enregistrer des mouvements.
        </div>
      )}

      {isLoading ? (
        <SkeletonList count={5} />
      ) : inventory.length === 0 ? (
        <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 p-5 shadow-sm transition-colors duration-300">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
              <Box className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucun mouvement de stock</h3>
            <p className="text-gray-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              Vous pourrez visualiser et gérer les entrées/sorties de vos produits ici. Enregistrez votre premier mouvement.
            </p>
            <button 
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              disabled={products.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            >
              Ajouter un mouvement
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 shadow-sm transition-colors duration-300 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-slate-700/50 flex justify-between items-center bg-gray-50/50 dark:bg-[#1E293B]/50">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Rechercher un mouvement..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#0A1226] border border-gray-200 dark:border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-slate-200 placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-slate-400">
              <thead className="text-xs text-gray-700 dark:text-slate-300 uppercase bg-gray-50 dark:bg-[#1E293B]/50 border-b border-gray-200 dark:border-slate-700/50">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Produit</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Mouvement</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Quantité</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Date</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">
                      Aucun mouvement trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr key={item.id} className="bg-white dark:bg-[#162032] hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3 shrink-0">
                          <Box className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold line-clamp-1">{item.product?.name || 'Produit inconnu'}</p>
                          {item.reason && <p className="text-[11px] text-gray-500 dark:text-slate-500 font-normal truncate max-w-[200px] mt-0.5">{item.reason}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.type === 'IN' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <ArrowDownRight className="w-3 h-3 mr-1" /> Entrée
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400">
                            <ArrowUpRight className="w-3 h-3 mr-1" /> Sortie
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-white">
                        <span className={item.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                          {item.type === 'IN' ? '+' : '-'}{item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-slate-400 text-xs">
                        {new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => setItemToDelete(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-slate-800/60 pb-4">
            {filteredInventory.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-slate-400">
                Aucun mouvement trouvé.
              </div>
            ) : (
              filteredInventory.map((item) => (
                <div key={item.id} className="p-4 bg-white dark:bg-[#162032] flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 pr-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Box className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 text-sm">{item.product?.name || 'Produit inconnu'}</h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                          {new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setItemToDelete(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-end mt-1">
                    <div className="flex flex-col gap-1.5">
                      {item.type === 'IN' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 w-max">
                          <ArrowDownRight className="w-3 h-3 mr-1" /> Entrée
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400 w-max">
                          <ArrowUpRight className="w-3 h-3 mr-1" /> Sortie
                        </span>
                      )}
                      {item.reason && <p className="text-xs text-gray-500 dark:text-slate-500 font-normal line-clamp-1 max-w-[200px]">{item.reason}</p>}
                    </div>
                    <span className={`text-lg font-black ${item.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {item.type === 'IN' ? '+' : '-'}{item.quantity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* The Modal */}
      <InventoryModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }} 
        onSave={handleSaveInventory} 
        initialData={editingItem}
        products={products}
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
                Êtes-vous sûr de vouloir supprimer ce mouvement de stock ? La quantité correspondante sera restaurée pour le produit. Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="px-4 py-2 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteInventory}
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
