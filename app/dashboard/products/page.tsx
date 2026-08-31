"use client";

import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductModal } from '../../../components/ProductModal';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../actions/productActions';
import { useSession } from 'next-auth/react';
import { SkeletonList } from '../../../components/Skeletons';

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);


  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Fetch from SQLite database on mount
  useEffect(() => {
    const fetchProducts = async () => {
      if (session?.user?.companyId) {
        const res = await getProducts(session.user.companyId);
        if (res.data) {
          setProducts(res.data);
        }
      }
      setIsLoaded(true);
    };
    fetchProducts();
  }, [session?.user?.companyId]);

  const handleSaveProduct = async (newProduct: any) => {
    if (!session?.user?.companyId) return;
    const productWithCompany = { ...newProduct, companyId: session.user.companyId };

    if (editingProduct) {
      const res = await updateProduct(editingProduct.id, productWithCompany);
      if (res.success && res.data) {
        setProducts(prev => prev.map(p => p.id === res.data.id ? res.data : p));
        setToastMessage("Produit modifié avec succès !");
      } else {
        setToastMessage(res.error || "Erreur lors de la modification");
      }
    } else {
      const res = await createProduct(productWithCompany);
      if (res.success && res.data) {
        setProducts(prev => [res.data, ...prev]);
        setToastMessage("Produit enregistré avec succès !");
      } else {
        setToastMessage(res.error || "Erreur lors de la création");
      }
    }
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      const res = await deleteProduct(productToDelete);
      if (res.success) {
        setProducts(prev => prev.filter(p => p.id !== productToDelete));
        setToastMessage("Produit supprimé avec succès !");
      }
      setProductToDelete(null);
    }
  };

  if (status === 'loading' || !isLoaded) return <div className="w-full max-w-7xl mx-auto space-y-6 pt-6"><SkeletonList count={5} /></div>;


  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Produits & Stock</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Gérez votre catalogue de produits</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau produit
        </button>
      </div>

      {products.length === 0 ? (
        // Empty State
        <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 p-5 shadow-sm transition-colors duration-300">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucun produit</h3>
            <p className="text-gray-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              Vous n'avez pas encore ajouté de produit à votre catalogue. Commencez par créer votre premier produit.
            </p>
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Ajouter un produit
            </button>
          </div>
        </div>
      ) : (
        // Products Table Area
        <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 shadow-sm transition-colors duration-300 overflow-hidden">


          {/* Table (Desktop) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-slate-400">
              <thead className="text-xs text-gray-700 dark:text-slate-300 uppercase bg-gray-50 dark:bg-[#1E293B]/50 border-b border-gray-200 dark:border-slate-700/50">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Produit</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Prix d'achat</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Prix de vente</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Stock</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="bg-white dark:bg-[#162032] border-b border-gray-100 dark:border-slate-800/60 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center">
                      <div>
                        <p className="font-bold">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-slate-300">
                      {new Intl.NumberFormat('fr-FR').format(product.cost || 0).replace(/\u202f/g, ' ')} FCFA
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600 dark:text-blue-400">
                      {new Intl.NumberFormat('fr-FR').format(product.price).replace(/\u202f/g, ' ')} FCFA
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stock <= (product.stockAlert || 0)
                          ? 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400'
                      }`}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards (Mobile) */}
          <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-slate-800/60">
            {products.map((product) => (
              <div key={product.id} className="p-4 bg-white dark:bg-[#162032] flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">{product.name}</h3>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        product.stock <= (product.stockAlert || 0)
                          ? 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400'
                      }`}>
                    Stock: {product.stock || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mt-1">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Achat</p>
                    <p className="font-semibold text-gray-700 dark:text-slate-300 text-sm">
                      {new Intl.NumberFormat('fr-FR').format(product.cost || 0).replace(/\u202f/g, ' ')} FCFA
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Vente</p>
                    <p className="font-black text-blue-600 dark:text-blue-400 text-sm">
                      {new Intl.NumberFormat('fr-FR').format(product.price).replace(/\u202f/g, ' ')} FCFA
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                    className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setProductToDelete(product.id)}
                    className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* The Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        initialData={editingProduct}
      />

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 font-semibold text-sm"
          >
            <CheckCircle2 className="w-5 h-5" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {productToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-[#162032] rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirmer la suppression</h3>
                <p className="text-gray-500 dark:text-slate-400 mb-6">
                  Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setProductToDelete(null)}
                    className="px-4 py-2 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
