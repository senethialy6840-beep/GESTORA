import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

type SaveProductResult =
  | { success?: boolean; error?: string; data?: any }
  | void;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: any) => Promise<SaveProductResult> | SaveProductResult;
  initialData?: any;
}

export function ProductModal({ isOpen, onClose, onSave, initialData }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    stock: '',
    price: '',
    cost: '',
    stockAlert: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setError('');
      setIsSubmitting(false);
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          stock: initialData.stock?.toString() || '',
          price: initialData.price ? new Intl.NumberFormat('fr-FR').format(initialData.price).replace(/\u202f/g, ' ') : '',
          cost: initialData.cost ? new Intl.NumberFormat('fr-FR').format(initialData.cost).replace(/\u202f/g, ' ') : '',
          stockAlert: initialData.stockAlert?.toString() || ''
        });
      } else {
        setFormData({
          name: '',
          stock: '',
          price: '',
          cost: '',
          stockAlert: ''
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const parseNumber = (value: string) => {
    const cleaned = value.replace(/\s+/g, '').replace(',', '.');
    const number = Number(cleaned);
    return Number.isFinite(number) ? number : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = formData.name.trim();
    const stock = Number(formData.stock);
    const price = parseNumber(formData.price);
    const cost = parseNumber(formData.cost);
    const stockAlert = Number(formData.stockAlert || 0);

    if (!name) {
      setError('Le nom du produit est requis.');
      return;
    }

    if (!Number.isFinite(stock) || stock < 0) {
      setError('Le stock est invalide.');
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError('Le prix de vente est invalide.');
      return;
    }

    if (!Number.isFinite(cost) || cost < 0) {
      setError('Le coût d\'achat est invalide.');
      return;
    }

    if (!Number.isFinite(stockAlert) || stockAlert < 0) {
      setError('L\'alerte de stock est invalide.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await Promise.resolve(onSave({
        id: initialData?.id || Date.now().toString(),
        name,
        stock,
        price,
        cost,
        stockAlert,
      }));

      if (result && typeof result === 'object' && result.success === false) {
        setError(result.error || 'Impossible d\'enregistrer ce produit.');
        return;
      }

      onClose();
    } catch (error) {
      setError('Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Remove all non-digits
    const rawValue = value.replace(/\D/g, '');
    // Format with spaces
    const formattedValue = rawValue ? new Intl.NumberFormat('fr-FR').format(parseInt(rawValue, 10)).replace(/\u202f/g, ' ') : '';
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
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
            {initialData ? "Modifier le produit" : "Nouveau produit"}
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
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Nom du produit *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: T-shirt en coton bio"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Nombre en stock *</label>
                <input
                  type="number"
                  name="stock"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="Ex: 50"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Alerte stock bas</label>
                <input
                  type="number"
                  name="stockAlert"
                  min="0"
                  value={formData.stockAlert}
                  onChange={handleChange}
                  placeholder="Ex: 10"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Prix de vente (FCFA) *</label>
                <input
                  type="text"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleNumberChange}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Coût d'achat (FCFA) *</label>
                <input
                  type="text"
                  name="cost"
                  required
                  value={formData.cost}
                  onChange={handleNumberChange}
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
            form="product-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>

      </div>
    </div>
  );
}
