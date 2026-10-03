"use client";

import React, { useState, useEffect } from "react";
import { getOwnedBoutiques, createBoutique, switchBoutique } from "@/app/actions/boutiqueActions";
import { Store, Plus, CheckCircle2 } from "lucide-react";

export default function BoutiquesPage() {
  const [activeCompany, setActiveCompany] = useState<any>(null);
  const [ownedCompanies, setOwnedCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newBoutiqueName, setNewBoutiqueName] = useState("");

  const loadBoutiques = async () => {
    setLoading(true);
    const res = await getOwnedBoutiques();
    if (res.success) {
      setActiveCompany(res.activeCompany);
      setOwnedCompanies(res.ownedCompanies || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBoutiques();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoutiqueName.trim()) return;

    setIsCreating(true);
    const res = await createBoutique(newBoutiqueName);
    setIsCreating(false);

    if (res.success) {
      setNewBoutiqueName("");
      alert("Boutique créée avec succès !");
      loadBoutiques();
    } else {
      alert(res.error || "Erreur lors de la création de la boutique.");
    }
  };

  const handleSwitch = async (companyId: string) => {
    if (companyId === activeCompany?.id) return;
    
    if (confirm("Voulez-vous basculer sur cette boutique ?")) {
      const res = await switchBoutique(companyId);
      if (res.success) {
        alert("Boutique changée avec succès. La page va se recharger.");
        window.location.href = "/dashboard";
      } else {
        alert(res.error || "Erreur lors du basculement.");
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement des boutiques...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes Boutiques</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Gérez vos différentes entreprises et points de vente.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Créer une nouvelle boutique</h2>
        <form onSubmit={handleCreate} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Nom de la boutique</label>
            <input 
              type="text" 
              value={newBoutiqueName}
              onChange={(e) => setNewBoutiqueName(e.target.value)}
              placeholder="Ex: Boutique Dakar" 
              className="w-full bg-gray-50 dark:bg-[#0A1226] border border-gray-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isCreating}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-70 flex items-center shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isCreating ? "Création..." : "Ajouter"}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ownedCompanies.map((company) => {
          const isActive = company.id === activeCompany?.id;
          return (
            <div 
              key={company.id}
              className={`p-5 rounded-2xl border ${isActive ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10' : 'border-gray-200 dark:border-slate-700/50 bg-white dark:bg-[#162032]'} transition-all`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'}`}>
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{company.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Forfait: {company.plan || 'FREE'}</p>
                  </div>
                </div>
                {isActive && (
                  <span className="inline-flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active
                  </span>
                )}
              </div>
              
              {!isActive && (
                <button 
                  onClick={() => handleSwitch(company.id)}
                  className="w-full py-2 px-4 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-slate-300"
                >
                  Basculer vers cette boutique
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
