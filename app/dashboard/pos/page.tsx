"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, CheckCircle2, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createSale } from '../../actions/saleActions';
import { getProducts } from '../../actions/productActions';
import { useSession } from 'next-auth/react';

export default function POSPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<{ id: string, name: string, price: number, qty: number }[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (session?.user?.companyId) {
        const res = await getProducts(session.user.companyId);
        if (res.data) {
          setProducts(res.data);
        }
      }
    };
    fetchProducts();
  }, [session?.user?.companyId]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const total = subTotal;

  const handleAcheter = async () => {
    if (cart.length === 0 || !session?.user?.companyId) return;
    
    // Enregistrer la vente dans la base de données
    const saleData = {
      invoiceNo: `VTE-${Date.now()}`,
      totalAmount: total,
      companyId: session.user.companyId,
      items: cart.map(item => ({ description: item.name, quantity: item.qty, price: item.price }))
    };
    await createSale(saleData);

    setShowSuccess(true);
    setCart([]);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-100px)]">
      {/* Partie Caisse (Gauche) */}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-2 pb-10 lg:pb-0">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-6">Caisse</h1>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#162032] rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
            <Package className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucun produit disponible</h3>
            <p className="text-gray-500 dark:text-slate-400">Ajoutez d'abord des produits dans l'onglet Produits & Stock.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between h-[140px] bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-4 text-left overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-500/10 dark:to-transparent rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none"></div>
                
                <div className="relative z-10">
                  <h3 className="font-bold text-[14px] text-gray-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </div>
                
                <div className="relative z-10 flex flex-col gap-2 mt-auto">
                  <p className="text-blue-600 dark:text-blue-400 font-black text-lg leading-none">
                    {new Intl.NumberFormat('fr-FR').format(product.price).replace(/\u202f/g, ' ')}
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 ml-1">FCFA</span>
                  </p>
                  <button 
                    onClick={() => addToCart(product)}
                    className="flex items-center justify-center gap-1.5 w-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-500/10 dark:hover:bg-blue-500 dark:text-blue-400 dark:hover:text-white py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Ajouter au panier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Partie Panier (Droite) - Uniquement si y'a des articles */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
            className="w-full lg:w-[380px] bg-white dark:bg-[#162032] rounded-xl border border-gray-200 dark:border-slate-700 flex flex-col h-[500px] lg:h-full shadow-sm shrink-0"
          >

        {/* En-tête du panier */}
        <div className="p-5 flex justify-between items-center border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-gray-700 dark:text-slate-300" />
            <h2 className="font-bold text-gray-900 dark:text-white text-[15px]">Panier</h2>
          </div>
          <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs">
            {cart.reduce((acc, item) => acc + item.qty, 0)}
          </span>
        </div>

        {/* Liste des articles */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-800 last:border-0">
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-[13px] mb-1">{item.name}</p>
                <p className="text-[12px] text-gray-500 dark:text-slate-400">{new Intl.NumberFormat('fr-FR').format(item.price).replace(/\u202f/g, ' ')} F CFA</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg h-8">
                  <button onClick={() => updateQty(item.id, -1)} className="px-2.5 h-full hover:bg-gray-50 dark:hover:bg-slate-600 rounded-l-lg transition-colors flex items-center justify-center">
                    <Minus className="w-3 h-3 text-gray-600 dark:text-slate-300" />
                  </button>
                  <span className="w-6 text-center text-[13px] font-medium">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="px-2.5 h-full hover:bg-gray-50 dark:hover:bg-slate-600 rounded-r-lg transition-colors flex items-center justify-center">
                    <Plus className="w-3 h-3 text-gray-600 dark:text-slate-300" />
                  </button>
                </div>
                <button onClick={() => removeItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Totaux */}
        <div className="p-5 border-t border-gray-100 dark:border-slate-800">
          <div className="space-y-1.5 mb-5 text-[13px]">
            <div className="flex justify-between text-gray-500 dark:text-slate-400">
              <span>Sous-total</span>
              <span>{new Intl.NumberFormat('fr-FR').format(subTotal).replace(/\u202f/g, ' ')} F CFA</span>
            </div>
            <div className="flex justify-between font-bold text-[15px] text-gray-900 dark:text-white pt-2.5 mt-2.5 border-t border-gray-100 dark:border-slate-700">
              <span>Total</span>
              <span>{new Intl.NumberFormat('fr-FR').format(total).replace(/\u202f/g, ' ')} FCFA</span>
            </div>
          </div>

          <button
            onClick={handleAcheter}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[14px] py-2.5 rounded-lg transition-colors"
          >
            Acheter
          </button>
        </div>
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
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold text-sm">Vente encaissée avec succès !</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
