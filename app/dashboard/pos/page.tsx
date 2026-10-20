"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Package, 
  Search, 
  Receipt, 
  Clock, 
  Banknote, 
  CreditCard, 
  Smartphone, 
  Coins, 
  User, 
  X, 
  ArrowRight, 
  Printer, 
  Download, 
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createSale, getSales } from '../../actions/saleActions';
import { getProducts } from '../../actions/productActions';
import { getSettings } from '../../actions/settingsActions';
import { getCustomers } from '../../actions/clientActions';
import { useSession } from 'next-auth/react';
import ReceiptModal from '@/components/ReceiptModal';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  stock: number;
}

export default function POSPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings & Customers
  const [settings, setSettings] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // Payment & Checkout State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Espèces' | 'Wave' | 'Orange Money' | 'Carte' | 'Virement'>('Espèces');
  const [amountReceived, setAmountReceived] = useState<string>('');

  // Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptSaleData, setReceiptSaleData] = useState<any>(null);

  // Recent Sales & History
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [showRecentModal, setShowRecentModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Currency helper
  const currency = settings?.currency || 'FCFA';
  const fmt = (num: number) => {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0
    }).format(num).replace(/\u202f/g, ' ') + ` ${currency}`;
  };

  // Fetch initial data
  const loadInitialData = async () => {
    if (!session?.user?.companyId) return;
    setIsLoading(true);
    try {
      const [prodRes, settRes, custRes, salesRes] = await Promise.all([
        getProducts(session.user.companyId),
        getSettings(session.user.companyId),
        getCustomers(session.user.companyId),
        getSales(session.user.companyId)
      ]);

      if (prodRes?.data) setProducts(prodRes.data);
      if (settRes?.settings) setSettings(settRes.settings);
      if (custRes?.data) setCustomers(custRes.data);
      if (salesRes?.data) setRecentSales(salesRes.data.slice(0, 15));
    } catch (err) {
      console.error('Erreur chargement données POS:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [session?.user?.companyId]);

  // Cart logic
  const addToCart = (product: any) => {
    if (product.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev; // Limite atteinte
        return prev.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        qty: 1,
        stock: product.stock
      }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (newQty <= 0) return item;
        if (newQty > item.stock) return item;
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const total = subTotal;
  const totalItemsCount = cart.reduce((acc, item) => acc + item.qty, 0);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.barcode && product.barcode.includes(searchQuery));

      if (!matchesSearch) return false;

      // Stock filter
      if (stockFilter === 'IN_STOCK') return product.stock > 0;
      if (stockFilter === 'LOW_STOCK') return product.stock > 0 && product.stock <= (product.stockAlert || 5);
      return true;
    });
  }, [products, searchQuery, stockFilter]);

  // Handle open checkout
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setAmountReceived(total.toString());
    setShowCheckoutModal(true);
  };

  // Tender quick amount helper
  const parsedReceived = Number(amountReceived) || 0;
  const changeDue = Math.max(0, parsedReceived - total);

  // Quick cash buttons
  const cashQuickAmounts = useMemo(() => {
    const list = [total];
    const steps = [1000, 2000, 5000, 10000, 20000, 50000];
    steps.forEach(step => {
      if (step > total && !list.includes(step)) {
        list.push(step);
      }
    });
    return list.slice(0, 5);
  }, [total]);

  // Confirm Sale & Generate Receipt
  const handleConfirmSale = async () => {
    if (cart.length === 0 || !session?.user?.companyId || isSubmitting) return;

    if (paymentMethod === 'Espèces' && parsedReceived < total) {
      setErrorMessage("Le montant reçu en espèces est inférieur au total de la vente.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
      const generatedInvoiceNo = `VTE-${Date.now().toString().slice(-8)}`;

      const saleData = {
        invoiceNo: generatedInvoiceNo,
        totalAmount: total,
        status: 'COMPLETED',
        customerId: selectedCustomerId || undefined,
        companyId: session.user.companyId,
        items: cart.map(item => ({
          description: item.name,
          quantity: item.qty,
          price: item.price,
          productId: item.id
        }))
      };

      const res = await createSale(saleData);

      if (!res.success) {
        setErrorMessage(res.error || "Une erreur est survenue lors de l'enregistrement de la vente.");
        setIsSubmitting(false);
        return;
      }

      // Préparer les données pour le ticket de caisse
      const completedReceiptData = {
        invoiceNo: generatedInvoiceNo,
        totalAmount: total,
        subTotal: subTotal,
        createdAt: new Date(),
        items: cart.map(item => ({
          description: item.name,
          quantity: item.qty,
          price: item.price
        })),
        customer: selectedCustomer || { name: 'Client Comptant' },
        paymentMethod: paymentMethod,
        amountReceived: paymentMethod === 'Espèces' ? parsedReceived : total,
        changeDue: paymentMethod === 'Espèces' ? changeDue : 0,
        cashierName: session.user.name || 'Caisse',
      };

      // Mettre à jour l'historique récent
      setRecentSales(prev => [
        {
          id: res.data?.id || `sale-${Date.now()}`,
          invoiceNo: generatedInvoiceNo,
          totalAmount: total,
          createdAt: new Date().toISOString(),
          customer: selectedCustomer,
          items: completedReceiptData.items,
          paymentMethod: paymentMethod,
          amountReceived: completedReceiptData.amountReceived,
          changeDue: completedReceiptData.changeDue
        },
        ...prev.slice(0, 14)
      ]);

      // Mettre à jour les stocks locaux
      setProducts(prev => prev.map(p => {
        const cartItem = cart.find(ci => ci.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
        }
        return p;
      }));

      // Réinitialiser le panier et fermer le modal de paiement
      setCart([]);
      setShowCheckoutModal(false);

      // Ouvrir automatiquement le ticket de caisse !
      setReceiptSaleData(completedReceiptData);
      setShowReceiptModal(true);

      // Notification toast
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err: any) {
      console.error("Erreur finalisation vente:", err);
      setErrorMessage(err.message || "Erreur inconnue lors de l'encaissement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open receipt for a past sale
  const handleOpenPastReceipt = (sale: any) => {
    setReceiptSaleData({
      invoiceNo: sale.invoiceNo,
      totalAmount: sale.totalAmount,
      subTotal: sale.totalAmount,
      createdAt: sale.createdAt,
      items: sale.items?.map((i: any) => ({
        description: i.description,
        quantity: i.quantity || i.qty || 1,
        price: i.price
      })) || [],
      customer: sale.customer || { name: 'Client' },
      paymentMethod: sale.paymentMethod || 'Espèces',
      amountReceived: sale.amountReceived || sale.totalAmount,
      changeDue: sale.changeDue || 0,
      cashierName: session?.user?.name || 'Caisse'
    });
    setShowRecentModal(false);
    setShowReceiptModal(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-7xl mx-auto space-y-4">
      
      {/* BARRE SUPÉRIEURE : TITRE, HISTORIQUE & STATUT */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Caisse (POS)
            </h1>
            <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-500/20">
              {settings?.companyName || 'Boutique'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Sélectionnez les articles, encaissez et générez instantanément les tickets de caisse.
          </p>
        </div>

        {/* Boutons d'accès rapide aux tickets */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {recentSales.length > 0 && (
            <button
              onClick={() => handleOpenPastReceipt(recentSales[0])}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200/80 dark:border-slate-700 transition-colors"
              title="Réimprimer le tout dernier ticket de caisse"
            >
              <Receipt className="w-4 h-4 text-blue-500" />
              <span>Dernier ticket</span>
            </button>
          )}

          <button
            onClick={() => setShowRecentModal(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200/80 dark:border-slate-700 transition-colors"
            title="Consulter les dernières transactions du jour"
          >
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>Historique ({recentSales.length})</span>
          </button>
        </div>
      </div>

      {/* CONTENU PRINCIPAL : CATALOGUE À GAUCHE & PANIER À DROITE */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0">
        
        {/* SECTION GAUCHE : RECHERCHE & PRODUITS */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm overflow-hidden">
          
          {/* Barre de Recherche & Filtres rapides */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4 shrink-0">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit (nom, code-barres)..."
                className="w-full pl-10 pr-9 py-2 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filtres d'état de stock */}
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800/60 p-1 rounded-xl border border-gray-200/80 dark:border-slate-700 shrink-0">
              <button
                onClick={() => setStockFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  stockFilter === 'ALL'
                    ? 'bg-white dark:bg-[#162032] text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Tous ({products.length})
              </button>
              <button
                onClick={() => setStockFilter('IN_STOCK')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  stockFilter === 'IN_STOCK'
                    ? 'bg-white dark:bg-[#162032] text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                En stock
              </button>
              <button
                onClick={() => setStockFilter('LOW_STOCK')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  stockFilter === 'LOW_STOCK'
                    ? 'bg-white dark:bg-[#162032] text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Faible
              </button>
            </div>
          </div>

          {/* Grille des Produits */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                <p className="text-xs">Chargement du catalogue...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 dark:border-slate-700/80 rounded-2xl">
                <Package className="w-10 h-10 text-gray-300 dark:text-slate-600 mb-3" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  Aucun produit trouvé
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm">
                  {searchQuery
                    ? `Aucun résultat pour "${searchQuery}". Essayez un autre terme.`
                    : "Ajoutez d'abord des produits dans l'onglet Produits & Stocks."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredProducts.map(product => {
                  const cartItem = cart.find(ci => ci.id === product.id);
                  const isOutOfStock = product.stock <= 0;
                  const isMaxInCart = cartItem && cartItem.qty >= product.stock;
                  const isLowStock = product.stock > 0 && product.stock <= (product.stockAlert || 5);

                  return (
                    <div
                      key={product.id}
                      className={`group relative flex flex-col justify-between bg-white dark:bg-[#121b2d] border rounded-2xl p-3.5 transition-all duration-200 ${
                        isOutOfStock
                          ? 'border-gray-200/50 dark:border-slate-800 opacity-60'
                          : 'border-gray-200/80 dark:border-slate-700/60 hover:border-blue-500/50 hover:shadow-md hover:shadow-blue-500/5'
                      }`}
                    >
                      {/* Badge de stock */}
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOutOfStock
                              ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                              : isLowStock
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                          }`}
                        >
                          {isOutOfStock
                            ? 'Épuisé'
                            : isLowStock
                            ? `Faible (${product.stock})`
                            : `Stock : ${product.stock}`}
                        </span>

                        {cartItem && (
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shadow-sm">
                            {cartItem.qty}
                          </span>
                        )}
                      </div>

                      {/* Nom du produit */}
                      <div className="flex-1 min-h-[38px] mb-2">
                        <h3 className="font-bold text-xs sm:text-[13px] text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {product.name}
                        </h3>
                        {product.sku && (
                          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                            Réf: {product.sku}
                          </p>
                        )}
                      </div>

                      {/* Prix & Bouton d'ajout */}
                      <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-2">
                        <p className="text-blue-600 dark:text-blue-400 font-black text-sm sm:text-base leading-none">
                          {fmt(product.price)}
                        </p>

                        <button
                          onClick={() => addToCart(product)}
                          disabled={isOutOfStock || isMaxInCart}
                          className={`flex items-center justify-center gap-1.5 w-full py-1.5 px-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            isOutOfStock
                              ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                              : isMaxInCart
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50 cursor-not-allowed'
                              : 'bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-500/10 dark:hover:bg-blue-500 dark:text-blue-400 dark:hover:text-white active:scale-95'
                          }`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>{isMaxInCart ? 'Stock max' : 'Ajouter'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SECTION DROITE : PANIER DE VENTE */}
        <div className="w-full lg:w-[380px] bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl flex flex-col shadow-sm shrink-0 overflow-hidden">
          
          {/* En-tête du panier */}
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-gray-900 dark:text-white">Panier en cours</h2>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">
                  {totalItemsCount} article{totalItemsCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] font-semibold text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-500/10 px-2 py-1 rounded-lg transition-colors"
                title="Vider le panier"
              >
                <Trash2 className="w-3 h-3" />
                <span>Vider</span>
              </button>
            )}
          </div>

          {/* Liste des articles dans le panier */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center text-gray-400 dark:text-slate-500">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800/50 flex items-center justify-center mb-2">
                  <ShoppingCart className="w-6 h-6 text-gray-300 dark:text-slate-600" />
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Le panier est vide
                </p>
                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5 max-w-[200px]">
                  Cliquez sur un produit du catalogue pour commencer une vente.
                </p>
              </div>
            ) : (
              cart.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50/70 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-xl"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-bold text-xs text-gray-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                      {fmt(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Contrôleur quantité */}
                    <div className="flex items-center bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg h-7">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="px-2 h-full hover:bg-gray-100 dark:hover:bg-slate-600 rounded-l-lg transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3 text-gray-600 dark:text-slate-300" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        disabled={item.qty >= item.stock}
                        className="px-2 h-full hover:bg-gray-100 dark:hover:bg-slate-600 rounded-r-lg transition-colors flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3 text-gray-600 dark:text-slate-300" />
                      </button>
                    </div>

                    {/* Supprimer article */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Retirer l'article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Section Totaux & Bouton d'encaissement */}
          <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-[#162032] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500 dark:text-slate-400">
                <span>Sous-total</span>
                <span>{fmt(subTotal)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-slate-800">
                <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                  Total à encaisser
                </span>
                <span className="font-black text-lg text-blue-600 dark:text-blue-400">
                  {fmt(total)}
                </span>
              </div>
            </div>

            <button
              onClick={handleOpenCheckout}
              disabled={cart.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 active:scale-[0.98]"
            >
              <Banknote className="w-4 h-4" />
              <span>Encaisser & Émettre le ticket</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* MODAL 1 : ENCAISSEMENT & RÈGLEMENT (CHECKOUT) */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckoutModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">
                      Encaissement de la vente
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Finalisez le règlement et générez le ticket de caisse
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                
                {/* Total Box */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Montant net à payer
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-0.5">
                      {fmt(total)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 font-bold text-xs px-3 py-1.5 rounded-full shadow-sm">
                      {totalItemsCount} article{totalItemsCount > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Mode de règlement */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Mode de règlement
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'Espèces', label: 'Espèces', icon: Coins },
                      { id: 'Wave', label: 'Wave', icon: Smartphone },
                      { id: 'Orange Money', label: 'Orange M.', icon: Smartphone },
                      { id: 'Carte', label: 'Carte', icon: CreditCard },
                      { id: 'Virement', label: 'Virement', icon: Banknote },
                    ].map(mode => {
                      const Icon = mode.icon;
                      const isSelected = paymentMethod === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setPaymentMethod(mode.id as any)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-[1.02]'
                              : 'bg-white dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-blue-400'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                          <span className="truncate w-full text-center">{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Si Espèces : Calcul Monnaie à rendre */}
                {paymentMethod === 'Espèces' && (
                  <div className="bg-gray-50 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                        Espèces reçues du client ({currency})
                      </label>
                      <button
                        type="button"
                        onClick={() => setAmountReceived(total.toString())}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Montant exact
                      </button>
                    </div>

                    <input
                      type="number"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl font-mono text-lg font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />

                    {/* Raccourcis billets */}
                    <div className="flex flex-wrap gap-1.5">
                      {cashQuickAmounts.map((amt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAmountReceived(amt.toString())}
                          className="bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:text-blue-600 text-xs font-bold py-1 px-2.5 rounded-lg transition-colors"
                        >
                          {new Intl.NumberFormat('fr-FR').format(amt).replace(/\u202f/g, ' ')}
                        </button>
                      ))}
                    </div>

                    {/* Rendu de Monnaie */}
                    {parsedReceived >= total ? (
                      <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-3 flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          Monnaie à rendre :
                        </span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          {fmt(changeDue)}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 flex justify-between items-center text-xs text-amber-800 dark:text-amber-300 font-semibold">
                        <span>Montant insuffisant. Reste :</span>
                        <span className="font-bold text-amber-700 dark:text-amber-400">
                          {fmt(total - parsedReceived)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Client (Optionnel) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Client attribué
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Client Comptant (Anonyme)</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.phone ? `(${c.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message d'erreur éventuel */}
                {errorMessage && (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={handleConfirmSale}
                  disabled={isSubmitting || (paymentMethod === 'Espèces' && parsedReceived < total)}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Encaissement...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Valider & Émettre le ticket</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODAL 2 : HISTORIQUE RÉCENT DES TRANSACTIONS */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showRecentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRecentModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[85vh] flex flex-col"
            >
              <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                    Dernières transactions de caisse
                  </h3>
                </div>
                <button
                  onClick={() => setShowRecentModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-2">
                {recentSales.length === 0 ? (
                  <p className="text-center py-8 text-xs text-gray-400 dark:text-slate-500">
                    Aucune vente récente enregistrée pour le moment.
                  </p>
                ) : (
                  recentSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="p-3 bg-gray-50/60 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-blue-500/30 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-900 dark:text-white">
                            {sale.invoiceNo}
                          </span>
                          <span className="text-[10px] text-gray-500 dark:text-slate-400">
                            {new Date(sale.createdAt).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate max-w-[200px] mt-0.5">
                          {sale.items?.map((i: any) => i.description).join(', ') || 'Articles divers'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="font-black text-xs text-blue-600 dark:text-blue-400">
                          {fmt(sale.totalAmount)}
                        </span>
                        <button
                          onClick={() => handleOpenPastReceipt(sale)}
                          className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-500/10 dark:hover:bg-blue-500 dark:text-blue-400 dark:hover:text-white p-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                          title="Imprimer ou télécharger le ticket"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Ticket</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODAL 3 : TICKET DE CAISSE (PRÉVISUALISATION, PRINT & PDF) */}
      {/* ============================================================ */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        sale={receiptSaleData}
        companyInfo={settings}
        onNewSale={() => {
          setShowReceiptModal(false);
          setCart([]);
        }}
      />

      {/* TOAST SUCCÈS */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 z-50 text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Vente enregistrée & Ticket généré avec succès !</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
