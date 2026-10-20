"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Printer, 
  Download, 
  X, 
  Receipt, 
  CheckCircle2, 
  PlusCircle, 
  ShoppingBag,
  Loader2 
} from "lucide-react";
import { 
  ReceiptData, 
  generateReceiptPDF, 
  printReceipt 
} from "@/lib/receiptGenerator";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: {
    invoiceNo: string;
    totalAmount: number;
    subTotal?: number;
    createdAt?: string | Date;
    items?: { description: string; quantity: number; price: number }[];
    customer?: { name?: string; phone?: string; address?: string; email?: string } | null;
    paymentMethod?: string;
    amountReceived?: number;
    changeDue?: number;
    cashierName?: string;
  } | null;
  companyInfo?: {
    companyName?: string;
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    taxNumber?: string;
    currency?: string;
    invoiceFooter?: string;
    logo?: string | null;
  } | null;
  onNewSale?: () => void;
}

export default function ReceiptModal({
  isOpen,
  onClose,
  sale,
  companyInfo,
  onNewSale,
}: ReceiptModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !sale) return null;

  const currency = companyInfo?.currency || "FCFA";
  const companyName =
    companyInfo?.companyName ||
    companyInfo?.name ||
    "GESTORA BOUTIQUE";
  const companyAddress = companyInfo?.address || "";
  const companyPhone = companyInfo?.phone || "";
  const cashierName = sale.cashierName || "Caisse";
  const clientName = sale.customer?.name || "Client Comptant";
  const paymentMethod = sale.paymentMethod || "Espèces";

  const items = sale.items && sale.items.length > 0
    ? sale.items
    : [{ description: "Article", quantity: 1, price: sale.totalAmount }];

  const totalQuantity = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 1),
    0
  );
  const subTotal = sale.subTotal || sale.totalAmount;
  const changeDue =
    sale.changeDue ??
    (sale.amountReceived ? Math.max(0, sale.amountReceived - sale.totalAmount) : 0);

  const receiptData: ReceiptData = {
    invoiceNo: sale.invoiceNo,
    totalAmount: sale.totalAmount,
    subTotal: subTotal,
    createdAt: sale.createdAt || new Date(),
    items: items,
    customer: sale.customer,
    paymentMethod: paymentMethod,
    amountReceived: sale.amountReceived,
    changeDue: changeDue,
    cashierName: cashierName,
    companyInfo: companyInfo || undefined,
  };

  const handlePrint = () => {
    setIsPrinting(true);
    printReceipt(receiptData);
    setTimeout(() => {
      setIsPrinting(false);
    }, 1000);
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    generateReceiptPDF(receiptData);
    setTimeout(() => {
      setIsDownloading(false);
    }, 800);
  };

  const fmt = (amount: number) => {
    return (
      new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 0,
      })
        .format(amount)
        .replace(/\u202f/g, " ") + ` ${currency}`
    );
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return new Date().toLocaleString("fr-FR");
    try {
      return new Date(date).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return new Date().toLocaleString("fr-FR");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto z-10 max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                  Ticket de Caisse
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">
                  Réf : {sale.invoiceNo}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body (Scrollable Receipt Paper Preview) */}
          <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 bg-gray-100/60 dark:bg-[#0A1226]/60 flex justify-center">
            {/* Thermal Paper Simulation */}
            <div className="w-full max-w-[340px] bg-white dark:bg-[#121b2d] border border-gray-200/80 dark:border-slate-700/80 shadow-md rounded-xl p-5 text-gray-900 dark:text-gray-100 font-mono text-xs transition-colors">
              {/* Header de la Boutique */}
              <div className="text-center space-y-1">
                <div className="flex justify-center mb-1">
                  <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white">
                  {companyName}
                </h4>
                {companyAddress && (
                  <p className="text-[11px] text-gray-600 dark:text-slate-400 leading-tight">
                    {companyAddress}
                  </p>
                )}
                {companyPhone && (
                  <p className="text-[11px] text-gray-600 dark:text-slate-400">
                    Tél : {companyPhone}
                  </p>
                )}
                {companyInfo?.taxNumber && (
                  <p className="text-[10px] text-gray-500 dark:text-slate-500">
                    NINEA/RCCM : {companyInfo.taxNumber}
                  </p>
                )}
              </div>

              {/* Séparateur pointillé */}
              <div className="border-t border-dashed border-gray-300 dark:border-slate-700 my-3.5" />

              {/* Titre & Métadonnées */}
              <div className="text-center font-bold text-xs uppercase tracking-widest text-gray-800 dark:text-gray-200 mb-2">
                Ticket de Caisse
              </div>

              <div className="space-y-1 text-[11px] text-gray-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Ticket N° :</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {sale.invoiceNo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Date :</span>
                  <span className="text-gray-800 dark:text-slate-300">
                    {formatDate(sale.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Caissier :</span>
                  <span className="text-gray-800 dark:text-slate-300">
                    {cashierName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Client :</span>
                  <span className="text-gray-800 dark:text-slate-300 truncate max-w-[170px]">
                    {clientName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Règlement :</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {paymentMethod}
                  </span>
                </div>
              </div>

              {/* Séparateur pointillé */}
              <div className="border-t border-dashed border-gray-300 dark:border-slate-700 my-3.5" />

              {/* En-tête Articles */}
              <div className="flex justify-between text-[11px] font-bold text-gray-700 dark:text-slate-300 pb-1.5 uppercase tracking-wide">
                <span>Désignation</span>
                <span>Total</span>
              </div>

              {/* Liste des articles */}
              <div className="space-y-2 py-1 text-[11px]">
                {items.map((item, idx) => {
                  const lineTotal =
                    (Number(item.quantity) || 1) * (Number(item.price) || 0);
                  return (
                    <div key={idx} className="flex flex-col">
                      <div className="flex justify-between items-start font-medium text-gray-900 dark:text-white">
                        <span className="truncate pr-2">{item.description}</span>
                        <span className="font-bold shrink-0">{fmt(lineTotal)}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-slate-400">
                        {item.quantity} x {fmt(item.price)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Séparateur pointillé */}
              <div className="border-t border-dashed border-gray-300 dark:border-slate-700 my-3.5" />

              {/* Totaux */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-gray-600 dark:text-slate-400">
                  <span>Sous-total :</span>
                  <span>{fmt(subTotal)}</span>
                </div>

                <div className="flex justify-between items-center text-sm font-extrabold text-gray-900 dark:text-white pt-1">
                  <span>TOTAL :</span>
                  <span className="text-blue-600 dark:text-blue-400 text-base">
                    {fmt(sale.totalAmount)}
                  </span>
                </div>

                {sale.amountReceived && sale.amountReceived >= sale.totalAmount && (
                  <>
                    <div className="flex justify-between text-gray-600 dark:text-slate-400 pt-1">
                      <span>Montant reçu :</span>
                      <span>{fmt(sale.amountReceived)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                      <span>Monnaie rendue :</span>
                      <span>{fmt(changeDue)}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between text-[10px] text-gray-500 dark:text-slate-500 pt-1">
                  <span>Nombre d'articles :</span>
                  <span>{totalQuantity}</span>
                </div>
              </div>

              {/* Séparateur pointillé */}
              <div className="border-t border-dashed border-gray-300 dark:border-slate-700 my-3.5" />

              {/* Faux Code-barres Thermique */}
              <div className="flex flex-col items-center justify-center my-2">
                <div className="flex items-center justify-center gap-0.5 h-7 w-48 opacity-80 dark:opacity-70">
                  {[3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 4, 2].map(
                    (w, i) => (
                      <div
                        key={i}
                        className={`h-full bg-gray-900 dark:bg-gray-100 ${
                          i % 2 === 0 ? "visible" : "invisible"
                        }`}
                        style={{ width: `${w * 1.5}px` }}
                      />
                    )
                  )}
                </div>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1 tracking-widest">
                  * {sale.invoiceNo} *
                </p>
              </div>

              {/* Pied de page */}
              <div className="text-center space-y-1 pt-1">
                <p className="font-bold text-xs text-gray-900 dark:text-white">
                  Merci de votre visite !
                </p>
                <p className="text-[10px] text-gray-500 dark:text-slate-400">
                  À bientôt chez nous
                </p>
                <p className="text-[9.5px] text-gray-400 dark:text-slate-500 italic pt-1">
                  {companyInfo?.invoiceFooter ||
                    "Les articles vendus ne sont ni repris ni échangés."}
                </p>
                <p className="text-[8px] text-gray-400 dark:text-slate-600 pt-1">
                  GESTORA POS • Caisse
                </p>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-[#162032] flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm shadow-blue-500/20 active:scale-[0.98]"
            >
              {isPrinting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              <span>Imprimer le ticket</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-gray-200/50 dark:border-slate-700/50 active:scale-[0.98]"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Télécharger (PDF 80mm)</span>
            </button>

            {onNewSale && (
              <button
                onClick={() => {
                  onClose();
                  onNewSale();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Nouvelle vente</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
