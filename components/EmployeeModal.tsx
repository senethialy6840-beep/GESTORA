import React, { useState, useEffect } from 'react';
import { X, Shield, Store } from 'lucide-react';
import { getWarehouses } from '@/app/actions/warehouseActions';

const AVAILABLE_PERMISSIONS = [
  { id: 'POS', label: 'Caisse' },
  { id: 'SALES', label: 'Ventes' },
  { id: 'PRODUCTS', label: 'Produits' },
  { id: 'INVENTORY', label: 'Stocks' },
  { id: 'CUSTOMERS', label: 'Clients' },
  { id: 'PURCHASES', label: 'Achats' },
  { id: 'SUPPLIERS', label: 'Fournisseurs' },
  { id: 'INVOICES', label: 'Factures' },
  { id: 'REPORTS', label: 'Rapports' },
];

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: any) => void;
  initialData?: any;
}

export function EmployeeModal({ isOpen, onClose, onSave, initialData }: EmployeeModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'CASHIER', // MANAGER, CASHIER, ADMIN, SALES
    status: 'ACTIVE', // ACTIVE, INACTIVE
    accessAllWarehouses: false,
    warehouseIds: [] as string[],
    permissions: [] as string[]
  });

  const [warehouses, setWarehouses] = useState<any[]>([]);

  useEffect(() => {
    async function fetchWarehouses() {
      const res = await getWarehouses();
      if (res.success && res.data) {
        setWarehouses(res.data);
      }
    }
    if (isOpen) {
      fetchWarehouses();
    }
  }, [isOpen]);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          firstName: initialData.firstName || '',
          lastName: initialData.lastName || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          role: initialData.role || 'CASHIER',
          status: initialData.status || 'ACTIVE',
          accessAllWarehouses: initialData.accessAllWarehouses || false,
          warehouseIds: initialData.warehouseIds || [],
          permissions: initialData.permissions || []
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          role: 'CASHIER',
          status: 'ACTIVE',
          accessAllWarehouses: false,
          warehouseIds: [],
          permissions: []
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id,
      ...formData,
      department: initialData?.department || 'Général',
      salary: initialData?.salary || 0,
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleWarehouse = (id: string) => {
    setFormData(prev => {
      const current = prev.warehouseIds;
      if (current.includes(id)) {
        return { ...prev, warehouseIds: current.filter(wId => wId !== id) };
      }
      return { ...prev, warehouseIds: [...current, id] };
    });
  };

  const togglePermission = (id: string) => {
    setFormData(prev => {
      const current = prev.permissions;
      if (current.includes(id)) {
        return { ...prev, permissions: current.filter(pId => pId !== id) };
      }
      return { ...prev, permissions: [...current, id] };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#162032] rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700/50 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700/50 flex justify-between items-center bg-gray-50/50 dark:bg-[#1E293B]/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? "Modifier l'employé" : "Ajouter un employé"}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="employee-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Prénom *</label>
                <input 
                  type="text" 
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Ex: Amadou"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Nom *</label>
                <input 
                  type="text" 
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Ex: Diallo"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Téléphone</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ex: +221 77 123 45 67"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Email *</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ex: amadou@gestora.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Rôle *</label>
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white"
                >
                  <option value="ADMIN">Administrateur</option>
                  <option value="MANAGER">Gérant</option>
                  <option value="CASHIER">Caissier(e)</option>
                  <option value="EMPLOYEE">Employé(e)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Statut *</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white"
                >
                  <option value="ACTIVE">Actif</option>
                  <option value="INACTIVE">Inactif (Suspendu)</option>
                </select>
              </div>
            </div>

            {/* RBAC Settings */}
            <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-slate-700/50">
              
              {/* Warehouses */}
              <div>
                <h3 className="flex items-center text-lg font-bold text-gray-900 dark:text-white mb-4">
                  <Store className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Accès aux Boutiques
                </h3>
                <div className="mb-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="accessAllWarehouses"
                      checked={formData.accessAllWarehouses}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Toutes les boutiques
                    </span>
                  </label>
                </div>
                {!formData.accessAllWarehouses && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {warehouses.map(w => (
                      <label key={w.id} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${formData.warehouseIds.includes(w.id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/30'}`}>
                        <input 
                          type="checkbox" 
                          checked={formData.warehouseIds.includes(w.id)}
                          onChange={() => toggleWarehouse(w.id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
                        />
                        <span className="text-sm font-medium text-gray-800 dark:text-slate-200">{w.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Permissions */}
              <div className="pt-4 border-t border-gray-200 dark:border-slate-700/50">
                <h3 className="flex items-center text-lg font-bold text-gray-900 dark:text-white mb-4">
                  <Shield className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                  Fonctionnalités Autorisées
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {AVAILABLE_PERMISSIONS.map(p => (
                    <label key={p.id} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${formData.permissions.includes(p.id) ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/30'}`}>
                      <input 
                        type="checkbox" 
                        checked={formData.permissions.includes(p.id)}
                        onChange={() => togglePermission(p.id)}
                        className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 mr-3"
                      />
                      <span className="text-sm font-medium text-gray-800 dark:text-slate-200">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700/50 bg-gray-50/50 dark:bg-[#1E293B]/50 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-gray-700 dark:text-slate-300 bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            Annuler
          </button>
          <button 
            type="submit"
            form="employee-form"
            className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
          >
            Enregistrer
          </button>
        </div>

      </div>
    </div>
  );
}
