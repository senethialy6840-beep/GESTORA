"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  Search, Plus, MoreVertical, Trash2, Edit,
  Users, Mail, Phone, MapPin, CheckCircle2, X
} from 'lucide-react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/app/actions/clientActions';

// Helper to format currency
const fmt = (num: number) => {
  return new Intl.NumberFormat('fr-FR').format(num) + ' F CFA';
};

export default function ClientsPage() {
  const { data: session } = useSession();
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load clients from DB
  useEffect(() => {
    async function loadClients() {
      if (session?.user?.companyId) {
        const res = await getCustomers(session.user.companyId);
        if (res.success && res.data) {
          setClients(res.data);
        }
      }
      setIsLoading(false);
    }
    loadClients();
  }, [session?.user?.companyId]);

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.companyId) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      mensualite: Number(formData.get('mensualite')) || 0,
      companyId: session.user.companyId,
    };

    if (editingClient) {
      const res = await updateCustomer(editingClient.id, data);
      if (res.success && res.data) {
        setClients(clients.map(c => c.id === editingClient.id ? res.data : c));
      }
    } else {
      const res = await createCustomer(data);
      if (res.success && res.data) {
        setClients([res.data, ...clients]);
      }
    }
    setIsModalOpen(false);
    setEditingClient(null);
  };

  // Filtered clients
  const filteredClients = clients.filter(client => 
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      const res = await deleteCustomer(id);
      if (res.success) {
        setClients(clients.filter(c => c.id !== id));
      }
      setActiveMenu(null);
    }
  };

  if (isLoading) return null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Clients & Abonnés</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Gérez les inscriptions à l&apos;application et leurs soldes mensuels</p>
        </div>
        <button 
          onClick={() => { setEditingClient(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Nouveau Client
        </button>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white dark:bg-[#162032] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-96 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, téléphone, email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all"
          />
        </div>
      </div>

      {/* CLIENTS TABLE */}
      <div className="bg-white dark:bg-[#162032] rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/60 overflow-hidden">
        {/* Table (Desktop) */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Téléphone</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">E-mail</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Mensualité</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Solde mensuel</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{client.name}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {client.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {client.phone}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {client.email}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 font-bold">
                      {fmt(client.mensualite || 0)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg inline-block">
                      {fmt(client.balance)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2 relative">
                      <button 
                        onClick={() => { setEditingClient(client); setIsModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Éditer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(client.id)}
                        className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 dark:text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    Aucun client ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cards (Mobile) */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-slate-800/60">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <div key={client.id} className="p-4 bg-white dark:bg-[#162032] flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">{client.name}</h3>
                      <div className="text-xs text-gray-500 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {client.address}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5 mt-2 bg-gray-50 dark:bg-slate-800/30 p-3 rounded-xl border border-gray-100 dark:border-slate-800/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Téléphone
                    </span>
                    <span className="font-medium text-gray-700 dark:text-slate-300">{client.phone}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Email
                    </span>
                    <span className="text-gray-700 dark:text-slate-300 truncate max-w-[150px]">{client.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-1.5 border-t border-gray-200 dark:border-slate-700 mt-1.5">
                    <span className="text-gray-500 dark:text-slate-400 font-bold">Mensualité</span>
                    <span className="font-bold text-gray-700 dark:text-slate-300">
                      {fmt(client.mensualite || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-1.5 border-t border-gray-200 dark:border-slate-700 mt-1.5">
                    <span className="text-gray-500 dark:text-slate-400 font-bold">Solde mensuel</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">
                      {fmt(client.balance)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-1">
                  <button 
                    onClick={() => { setEditingClient(client); setIsModalOpen(true); }}
                    className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(client.id)}
                    className="p-2 text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-500 dark:text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              Aucun client ne correspond.
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="relative w-full max-w-lg bg-white dark:bg-[#162032] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-700/50"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800/60">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingClient ? 'Modifier le client' : 'Nouveau client'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveClient} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                    Nom du client
                  </label>
                  <input 
                    name="name" 
                    required
                    defaultValue={editingClient?.name}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all"
                    placeholder="Ex: Entreprise SARL ou Jean Dupont"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Téléphone
                    </label>
                    <input 
                      name="phone" 
                      required
                      defaultValue={editingClient?.phone}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all"
                      placeholder="Ex: 77 000 00 00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      E-mail
                    </label>
                    <input 
                      name="email" 
                      type="email"
                      defaultValue={editingClient?.email}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all"
                      placeholder="Ex: contact@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Adresse
                    </label>
                    <input 
                      name="address" 
                      defaultValue={editingClient?.address}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all"
                      placeholder="Ex: Dakar, SN"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Mensualité (F CFA)
                    </label>
                    <input 
                      name="mensualite" 
                      type="number"
                      defaultValue={editingClient?.mensualite}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all"
                      placeholder="Ex: 15000"
                    />
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-slate-800/60">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-gray-600 dark:text-slate-300 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
