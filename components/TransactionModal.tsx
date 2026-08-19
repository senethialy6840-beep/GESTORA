import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: any) => void;
  initialData?: any;
}

export function TransactionModal({ isOpen, onClose, onSave, initialData }: TransactionModalProps) {
  const [formData, setFormData] = useState({
    description: '',
    type: 'INCOME', // INCOME or EXPENSE
    amount: '',
  });

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          description: initialData.description || '',
          type: initialData.type || 'INCOME',
          amount: initialData.amount ? initialData.amount.toLocaleString('fr-FR').replace(/\u202f/g, ' ') : '',
        });
      } else {
        setFormData({
          description: '',
          type: 'INCOME',
          amount: '',
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id || Date.now().toString(),
      ...formData,
      amount: parseFloat(formData.amount.replace(/\s/g, '')) || 0,
      date: initialData?.date || new Date().toISOString()
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
            {initialData ? "Modifier la transaction" : "Nouvelle transaction"}
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
          <form id="transaction-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Description *</label>
              <input 
                type="text" 
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Ex: Paiement facture client A"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Type de flux *</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white"
                >
                  <option value="INCOME">Recette (+)</option>
                  <option value="EXPENSE">Dépense (-)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Montant (FCFA) *</label>
                <input 
                  type="text" 
                  name="amount"
                  required
                  value={formData.amount}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                    if (!rawValue) {
                      setFormData(prev => ({ ...prev, amount: '' }));
                      return;
                    }
                    const formatted = parseInt(rawValue, 10).toLocaleString('fr-FR').replace(/\u202f/g, ' '); 
                    setFormData(prev => ({ ...prev, amount: formatted }));
                  }}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                />
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
            form="transaction-form"
            className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
          >
            Enregistrer
          </button>
        </div>

      </div>
    </div>
  );
}
