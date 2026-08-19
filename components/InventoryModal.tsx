import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inventory: any) => void;
  initialData?: any;
  products: any[];
}

export function InventoryModal({ isOpen, onClose, onSave, initialData, products }: InventoryModalProps) {
  const [formData, setFormData] = useState({
    productId: '',
    type: 'IN', // IN or OUT
    quantity: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          productId: initialData.productId || (products.length > 0 ? products[0].id : ''),
          type: initialData.type || 'IN',
          quantity: initialData.quantity?.toString() || '',
          reason: initialData.reason || ''
        });
      } else {
        setFormData({
          productId: products.length > 0 ? products[0].id : '',
          type: 'IN',
          quantity: '',
          reason: ''
        });
      }
      setIsSubmitting(false);
    }
  }, [isOpen, initialData, products]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        id: initialData?.id,
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
        date: initialData?.date || new Date().toISOString()
      });
      onClose();
    } catch (error) {
      console.error("Error saving inventory", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
            {initialData ? "Modifier le mouvement" : "Nouveau mouvement de stock"}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form body */}
        <form id="inventory-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="p-6 space-y-6 flex-1">
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Produit *</label>
              <select 
                name="productId"
                required
                value={formData.productId}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white"
              >
                <option value="" disabled>Sélectionnez un produit...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Type de mouvement *</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white"
                >
                  <option value="IN">Entrée (Ajout au stock)</option>
                  <option value="OUT">Sortie (Retrait du stock)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Quantité *</label>
                <input 
                  type="number" 
                  name="quantity"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Ex: 50"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Motif / Commentaire</label>
              <textarea 
                name="reason"
                rows={3}
                value={formData.reason}
                onChange={handleChange}
                placeholder="Ex: Réapprovisionnement mensuel..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700/50 bg-gray-50/50 dark:bg-[#1E293B]/50 flex justify-end space-x-3 mt-auto">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-700 dark:text-slate-300 bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              Annuler
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

