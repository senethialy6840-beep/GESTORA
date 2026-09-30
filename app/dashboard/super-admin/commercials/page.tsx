"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, DollarSign, Briefcase, RefreshCw, X, Link as LinkIcon, CheckCircle, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getAllCommercials, createCommercial, payCommission, deleteCommercial } from '@/app/actions/superAdminActions';

const PLATFORM_OWNER_EMAIL = 'gestorame112@gmail.com';

function AddCommercialModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: () => void }) {
  const [prenom, setPrenom] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('add_comm_prenom') || '' : '');
  const [nom, setNom] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('add_comm_nom') || '' : '');
  const [email, setEmail] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('add_comm_email') || '' : '');
  const [telephone, setTelephone] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('add_comm_tel') || '' : '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('add_comm_prenom', prenom);
    localStorage.setItem('add_comm_nom', nom);
    localStorage.setItem('add_comm_email', email);
    localStorage.setItem('add_comm_tel', telephone);
  }, [prenom, nom, email, telephone]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const codeAffiliation = `${prenom.trim().toUpperCase()}${nom.trim().toUpperCase().slice(0,2)}${Math.floor(Math.random() * 99)}`;

    const res = await createCommercial({ prenom, nom, email, telephone, codeAffiliation });
    
    if (res.success) {
      setPrenom('');
      setNom('');
      setEmail('');
      setTelephone('');
      localStorage.removeItem('add_comm_prenom');
      localStorage.removeItem('add_comm_nom');
      localStorage.removeItem('add_comm_email');
      localStorage.removeItem('add_comm_tel');
      onAdd();
      onClose();
    } else {
      setError(res.error || 'Erreur lors de la création du commercial');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#162032] rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700/50 flex justify-between items-center bg-gray-50 dark:bg-[#1E293B]">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center">
            <UserPlus className="w-5 h-5 mr-2 text-blue-500" />
            Nouveau Commercial
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Prénom</label>
              <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} required className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg dark:bg-[#0A1226]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nom</label>
              <input type="text" value={nom} onChange={e => setNom(e.target.value)} required className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg dark:bg-[#0A1226]" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg dark:bg-[#0A1226]" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Téléphone</label>
            <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} required className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg dark:bg-[#0A1226]" />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-slate-700/50 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-slate-300 font-medium">Annuler</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? 'Création...' : 'Créer le compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PayCommissionModal({ commercial, isOpen, onClose, onPaid }: { commercial: any, isOpen: boolean; onClose: () => void; onPaid: () => void }) {
  const [methode, setMethode] = useState('Wave');
  const [reference, setReference] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  if (!isOpen || !commercial) return null;

  const commissionEnAttente = commercial.commissions.filter((c: any) => c.statut === "PENDING").reduce((acc: number, curr: any) => acc + curr.montantCommission, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await payCommission(commercial.id, commissionEnAttente, methode, reference);
    
    if (res.success) {
      onPaid();
      onClose();
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#162032] rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700/50 flex justify-between items-center bg-gray-50 dark:bg-[#1E293B]">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-blue-500" />
            Payer une commission
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Montant à payer</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(commissionEnAttente)}
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-400/70 mt-1">Commercial: {commercial.prenom} {commercial.nom}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Méthode de paiement</label>
            <select value={methode} onChange={e => setMethode(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg dark:bg-[#0A1226]">
              <option value="Wave">Wave</option>
              <option value="Orange Money">Orange Money</option>
              <option value="Virement Bancaire">Virement Bancaire</option>
              <option value="Espèces">Espèces</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Référence de transaction</label>
            <input type="text" value={reference} onChange={e => setReference(e.target.value)} required placeholder="Ex: WAVE-12345" className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg dark:bg-[#0A1226]" />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-slate-700/50 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-slate-300 font-medium">Annuler</button>
            <button type="submit" disabled={isLoading || commissionEnAttente <= 0} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? 'Validation...' : 'Valider le paiement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CommercialsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [commercials, setCommercials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [payCommercial, setPayCommercial] = useState<any>(null);

  const loadCommercials = useCallback(async () => {
    setIsLoading(true);
    const res = await getAllCommercials();
    if (res.success && res.data) setCommercials(res.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (session?.user?.email !== PLATFORM_OWNER_EMAIL) {
      router.push('/dashboard');
      return;
    }
    loadCommercials();
  }, [session, status, loadCommercials, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto py-20 flex justify-center items-center">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (session?.user?.email !== PLATFORM_OWNER_EMAIL) return null;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Réseau de Commerciaux</h1>
          </div>
          <p className="text-gray-500 dark:text-slate-400">Gérez les affiliés et leurs commissions</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          <UserPlus className="w-4 h-4" /> Ajouter un commercial
        </button>
      </div>

      <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 dark:text-slate-400 uppercase bg-gray-50 dark:bg-[#1E293B]/50 border-b border-gray-200 dark:border-slate-700/50">
              <tr>
                <th className="px-5 py-4 font-semibold">Commercial</th>
                <th className="px-5 py-4 font-semibold">Code / Lien</th>
                <th className="px-5 py-4 font-semibold text-center">Clients Apportés</th>
                <th className="px-5 py-4 font-semibold text-center">Ventes</th>
                <th className="px-5 py-4 font-semibold text-right">Commission Totale</th>
                <th className="px-5 py-4 font-semibold text-right">En Attente</th>
                <th className="px-5 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700/50">
              {commercials.map(commercial => {
                const clientsApportes = commercial.referrals.length;
                const ventes = commercial.referrals.filter((r: any) => r.statut === "CONVERTED").length;
                const commissionTotale = commercial.commissions.reduce((acc: number, curr: any) => acc + curr.montantCommission, 0);
                const commissionEnAttente = commercial.commissions.filter((c: any) => c.statut === "PENDING").reduce((acc: number, curr: any) => acc + curr.montantCommission, 0);

                return (
                  <tr key={commercial.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">{commercial.prenom} {commercial.nom}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">{commercial.telephone}</div>
                      <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-1">Identifiants de connexion :</div>
                      <div className="text-xs text-gray-600 dark:text-slate-400">Email: {commercial.email}</div>
                      <div className="text-xs text-gray-600 dark:text-slate-400">Pass: password123</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        <div className="font-mono text-sm text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded inline-block">
                          {commercial.codeAffiliation}
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(commercial.lienAffiliation);
                            alert('Lien copié !');
                          }}
                          className="text-xs flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <LinkIcon className="w-3 h-3 mr-1" /> Copier le lien
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center font-bold">{clientsApportes}</td>
                    <td className="px-5 py-4 text-center font-bold">{ventes}</td>
                    <td className="px-5 py-4 text-right font-bold text-[#2563EB]">
                      {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(commissionTotale)}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-orange-500">
                      {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(commissionEnAttente)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => setPayCommercial(commercial)}
                          disabled={commissionEnAttente <= 0}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                          Payer
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Voulez-vous vraiment supprimer ce commercial ?')) {
                              await deleteCommercial(commercial.id);
                              loadCommercials();
                            }
                          }}
                          className="p-1.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          title="Supprimer le commercial"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {commercials.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-500 dark:text-slate-400">Aucun commercial trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddCommercialModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={loadCommercials}
      />
      
      <PayCommissionModal 
        commercial={payCommercial}
        isOpen={!!payCommercial}
        onClose={() => setPayCommercial(null)}
        onPaid={loadCommercials}
      />
    </div>
  );
}
