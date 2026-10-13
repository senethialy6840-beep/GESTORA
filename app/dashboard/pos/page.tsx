"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, CheckCircle2, Package, Search, X, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createSale } from '../../actions/saleActions';
import { getProducts } from '../../actions/productActions';
import { useSession } from 'next-auth/react';

export default function POSPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number; stock: number }[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (session?.user?.companyId) {
        setIsLoadingProducts(true);
        const res = await getProducts(session.user.companyId);
        if (res.data) {
          setProducts(res.data);
        }
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [session?.user?.companyId]);

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => setToastNotification(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name?.toLowerCase().includes(q) || 
      p.sku?.toLowerCase().includes(q) || 
      p.barcode?.includes(q)
    );
  }, [products, searchQuery]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        qty: 1, 
        stock: product.stock ?? 0 
      }];
    });

    setToastNotification(`"${product.name}" ajouté au panier`);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (newQty <= 0) return item;
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.qty), 0), [cart]);
  const total = subTotal;
  const totalItemsCount = useMemo(() => cart.reduce((acc, item) => acc + item.qty, 0), [cart]);

  const handleAcheter = async () => {
    if (cart.length === 0 || !session?.user?.companyId || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const saleData = {
      invoiceNo: `VTE-${Date.now()}`,
      totalAmount: total,
      companyId: session.user.companyId,
      items: cart.map(item => ({ 
        description: item.name, 
        quantity: item.qty, 
        price: item.price,
        productId: item.id
      }))
    };

    try {
      const res = await createSale(saleData);
      setIsSubmitting(false);

      if (res?.success) {
        setShowSuccess(true);
        setCart([]);
        setIsMobileCartOpen(false);

        // Recharger immédiatement les produits pour mettre à jour les stocks
        if (session?.user?.companyId) {
          const refreshed = await getProducts(session.user.companyId);
          if (refreshed.data) {
            setProducts(refreshed.data);
          }
        }

        setTimeout(() => {
          setShowSuccess(false);
        }, 3500);
      } else {
        setErrorMessage(res?.error || "Erreur lors de l'encaissement de la vente.");
      }
    } catch (e: any) {
      setIsSubmitting(false);
      setErrorMessage(e?.message || "Une erreur inattendue est survenue.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-100px)] relative">
      
      {/* Partie Produits (Gauche) */}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-1 pb-24 lg:pb-0 space-y-4">
        
        {/* En-tête avec Recherche */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Caisse</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Enregistrez et encaissez vos ventes rapidement</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-xl pl-9 pr-9 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Liste des produits */}
        {isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Chargement des produits...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#162032] rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 p-8">
            <Package className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {searchQuery ? "Aucun produit correspondant" : "Aucun produit disponible"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm">
              {searchQuery 
                ? `Aucun article ne correspond à "${searchQuery}".` 
                : "Ajoutez d'abord des produits dans l'onglet Catalogue Produits pour commencer à encaisser."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map(product => {
              const currentStock = product.stock ?? 0;
              const inStock = currentStock > 0;

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col justify-between bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-4 text-left overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-500/10 dark:to-transparent rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none"></div>
                  
                  {/* Titre & Stock Badge */}
                  <div className="relative z-10 space-y-1 mb-3">
                    <h3 className="font-bold text-[14px] text-gray-900 dark:text-white leading-tight line-clamp-2" title={product.name}>
                      {product.name}
                    </h3>
                    <div>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inStock 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                      }`}>
                        {inStock ? `${currentStock} en stock` : 'Stock : 0'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Prix & Bouton Ajouter */}
                  <div className="relative z-10 flex flex-col gap-2 mt-auto">
                    <p className="text-blue-600 dark:text-blue-400 font-black text-base sm:text-lg leading-none">
                      {new Intl.NumberFormat('fr-FR').format(product.price).replace(/\u202f/g, ' ')}
                      <span className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 ml-1">FCFA</span>
                    </p>
                    <button 
                      type="button"
                      onClick={() => addToCart(product)}
                      className="flex items-center justify-center gap-1.5 w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Ajouter au panier
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Partie Panier Desktop (Droite) */}
      <div className="hidden lg:flex w-[380px] shrink-0">
        <div className="w-full bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 flex flex-col h-full shadow-sm overflow-hidden">
          
          {/* En-tête du panier */}
          <div className="p-5 flex justify-between items-center border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="font-bold text-gray-900 dark:text-white text-[15px]">Panier</h2>
            </div>
            <span className="bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-2.5 py-0.5 rounded-full text-xs">
              {totalItemsCount} article{totalItemsCount > 1 ? 's' : ''}
            </span>
          </div>

          {/* Liste des articles du panier */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 dark:text-slate-500">
                <ShoppingCart className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm font-semibold">Le panier est vide</p>
                <p className="text-xs mt-1 text-gray-400 dark:text-slate-500">Cliquez sur « Ajouter au panier » pour ajouter un produit.</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50/60 dark:bg-slate-800/40 rounded-xl border border-gray-100 dark:border-slate-800/60">
                  <div className="pr-2 flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-xs truncate mb-1">{item.name}</p>
                    <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                      {new Intl.NumberFormat('fr-FR').format(item.price).replace(/\u202f/g, ' ')} FCFA
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700 rounded-lg h-7">
                      <button 
                        type="button"
                        onClick={() => updateQty(item.id, -1)} 
                        className="px-2 h-full hover:bg-gray-100 dark:hover:bg-slate-700 rounded-l-lg transition-colors flex items-center justify-center text-gray-600 dark:text-slate-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-gray-900 dark:text-white">{item.qty}</span>
                      <button 
                        type="button"
                        onClick={() => updateQty(item.id, 1)} 
                        className="px-2 h-full hover:bg-gray-100 dark:hover:bg-slate-700 rounded-r-lg transition-colors flex items-center justify-center text-gray-600 dark:text-slate-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeItem(item.id)} 
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Retirer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Pied du panier avec Totaux et Bouton Encaisser */}
          <div className="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/20">
            <div className="space-y-1.5 mb-4 text-xs">
              <div className="flex justify-between text-gray-500 dark:text-slate-400">
                <span>Sous-total</span>
                <span>{new Intl.NumberFormat('fr-FR').format(subTotal).replace(/\u202f/g, ' ')} FCFA</span>
              </div>
              <div className="flex justify-between font-extrabold text-base text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-slate-700">
                <span>Total à payer</span>
                <span className="text-blue-600 dark:text-blue-400">{new Intl.NumberFormat('fr-FR').format(total).replace(/\u202f/g, ' ')} FCFA</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAcheter}
              disabled={cart.length === 0 || isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-98 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Encaissement en cours...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Encaisser la vente ({new Intl.NumberFormat('fr-FR').format(total).replace(/\u202f/g, ' ')} FCFA)
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Barre flottante Panier sur Mobile */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <button
            type="button"
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-blue-600/30 font-bold text-sm transition-transform active:scale-95"
          >
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-5 h-5" />
              <span>Panier ({totalItemsCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-2.5 py-0.5 rounded-lg text-xs">
                {new Intl.NumberFormat('fr-FR').format(total).replace(/\u202f/g, ' ')} FCFA
              </span>
              <span>→</span>
            </div>
          </button>
        </div>
      )}

      {/* Tiroir Modal Panier sur Mobile */}
      <AnimatePresence>
        {isMobileCartOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-h-[85vh] bg-white dark:bg-[#162032] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">Votre Panier</h3>
                  <span className="text-xs bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full">
                    {totalItemsCount}
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsMobileCartOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-gray-100 dark:border-slate-800">
                    <div className="pr-2 flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-xs truncate">{item.name}</p>
                      <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                        {new Intl.NumberFormat('fr-FR').format(item.price).replace(/\u202f/g, ' ')} FCFA
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700 rounded-lg h-8">
                        <button onClick={() => updateQty(item.id, -1)} className="px-2.5 h-full text-gray-600 dark:text-slate-300">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-gray-900 dark:text-white">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="px-2.5 h-full text-gray-600 dark:text-slate-300">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-2 text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
                <div className="flex justify-between font-extrabold text-base text-gray-900 dark:text-white mb-4">
                  <span>Total à payer</span>
                  <span className="text-blue-600 dark:text-blue-400">{new Intl.NumberFormat('fr-FR').format(total).replace(/\u202f/g, ' ')} FCFA</span>
                </div>
                <button
                  type="button"
                  onClick={handleAcheter}
                  disabled={cart.length === 0 || isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-blue-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Encaissement...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Encaisser la vente
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification Ajout au Panier */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 lg:bottom-6 right-6 bg-gray-900/95 dark:bg-slate-800/95 text-white backdrop-blur-md px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 z-50 border border-slate-700/50 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Message d'erreur */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 bg-red-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50 text-sm font-semibold"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Message de Succès */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-sm">Vente encaissée avec succès !</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
