"use client";

import React, { useState, useEffect } from 'react';
import { Store, Plus, MapPin, Trash2, Edit2, ChevronRight, X, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getWarehouses, createWarehouse, deleteWarehouse, updateWarehouse } from '@/app/actions/inventoryActions';
import { SkeletonForm } from '@/components/Skeletons';
import Cookies from 'js-cookie';

export default function BoutiquesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentWarehouseId, setCurrentWarehouseId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    location: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (session?.user?.companyId) {
        const whRes = await getWarehouses(session.user.companyId);
        if (whRes.success && whRes.data) {
          setWarehouses(whRes.data);
        }
      }
      setIsLoading(false);
    }
    load();
  }, [session?.user?.companyId]);

  const handleOpenModal = (warehouse?: any) => {
    if (warehouse) {
      setIsEditing(true);
      setCurrentWarehouseId(warehouse.id);
      setFormData({
        name: warehouse.name,
        location: warehouse.location || ''
      });
    } else {
      setIsEditing(false);
      setCurrentWarehouseId(null);
      setFormData({ name: '', location: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', location: '' });
    setCurrentWarehouseId(null);
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setIsSaving(true);
    
    try {
      if (isEditing && currentWarehouseId) {
        const res = await updateWarehouse(currentWarehouseId, formData);
        if (res.success && res.data) {
          setWarehouses(prev => prev.map(w => w.id === currentWarehouseId ? res.data : w));
          handleCloseModal();
        } else {
          alert(res.error || "Erreur lors de la modification.");
        }
      } else {
        const res = await createWarehouse(formData);
        if (res.success && res.data) {
          setWarehouses(prev => [...prev, res.data]);
          handleCloseModal();
        } else {
          alert(res.error || "Erreur lors de la création.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Voulez-vous vraiment supprimer la boutique "${name}" ?`)) {
      const res = await deleteWarehouse(id);
      if (res.success) {
        setWarehouses(prev => prev.filter(w => w.id !== id));
      } else {
        alert(res.error || "Erreur lors de la suppression.");
      }
    }
  };

  const handleEnterBoutique = (id: string) => {
    Cookies.set('activeBoutiqueId', id, { expires: 7 });
    router.push('/dashboard');
  };

  if (status === 'loading' || isLoading) return <div className="p-6"><SkeletonForm /></div>;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <Store className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Mes Boutiques
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Gérez vos points de vente et accédez à leurs fonctionnalités.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter une boutique
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => (
          <div 
            key={warehouse.id}
            onClick={() => handleEnterBoutique(warehouse.id)}
            className="group relative bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 p-6 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden flex flex-col"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Store className="w-6 h-6" />
              </div>
              
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => handleOpenModal(warehouse)}
                  className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => handleDelete(e, warehouse.id, warehouse.name)}
                  className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {warehouse.name}
                {warehouse.isDefault && (
                  <span className="ml-3 px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs uppercase font-bold rounded-full align-middle">
                    Principale
                  </span>
                )}
              </h3>
              
              <div className="flex items-center text-gray-500 dark:text-slate-400 text-sm mt-3">
                <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
                <span className="truncate">{warehouse.location || "Aucune adresse renseignée"}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800/60 flex items-center justify-between text-blue-600 dark:text-blue-400 font-medium text-sm">
              <span>Accéder à la boutique</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
        
        {warehouses.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50">
            <Store className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Aucune boutique</h3>
            <p className="text-gray-500 dark:text-slate-400 mt-2">Vous n'avez pas encore ajouté de boutique.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#162032] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700/50 flex justify-between items-center bg-gray-50/50 dark:bg-[#1E293B]/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Modifier la boutique' : 'Nouvelle Boutique'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Nom de la boutique *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full bg-gray-50 dark:bg-[#0A1226] border border-gray-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" 
                  placeholder="Ex: GESTORA Point E" 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Localisation (Optionnel)</label>
                <input 
                  type="text" 
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})} 
                  className="w-full bg-gray-50 dark:bg-[#0A1226] border border-gray-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" 
                  placeholder="Ex: Point E, Rue de Thiès" 
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-800/60 mt-6 pt-6">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="px-5 py-2.5 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isEditing ? 'Enregistrer' : 'Créer la boutique'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
