"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Plus, Download, Save, ArrowLeft, Trash2, Search, MoreHorizontal } from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { useSession } from 'next-auth/react';
import { getSettings } from '../../actions/settingsActions';
import { getSales, createSale, updateSale, deleteSale } from '@/app/actions/saleActions';

const filters = ['Tous', 'Brouillon', 'Créée', 'Payée', 'En retard'];

export default function InvoicesPage() {
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      if (session?.user?.companyId) {
        const res = await getSettings(session.user.companyId);
        if (res.success) setSettings(res.settings);
      }
    }
    loadSettings();
  }, [session?.user?.companyId]);

  useEffect(() => {
    async function loadInvoices() {
      if (session?.user?.companyId) {
        const res = await getSales(session.user.companyId);
        if (res.success && res.data) {
          const formatted = res.data.map((sale: any) => ({
            dbId: sale.id,
            id: sale.invoiceNo,
            isoDate: new Date(sale.createdAt).toISOString().split('T')[0],
            client: sale.customer?.name || 'Client',
            clientAddress: '',
            clientEmail: '',
            clientPhone: '',
            items: sale.items && sale.items.length > 0 ? sale.items : [{ id: Date.now(), description: 'Total Facture', quantity: 1, price: sale.totalAmount }],
            date: new Date(sale.createdAt).toLocaleDateString('fr-FR'),
            due: '-',
            status: sale.status,
            amount: sale.totalAmount
          }));
          setInvoices(formatted);
        }
      }
      setIsLoading(false);
    }
    loadInvoices();
  }, [session?.user?.companyId]);
  
  const [invoiceData, setInvoiceData] = useState({
    dbId: '',
    number: `FAC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    clientPhone: '',
    status: 'BROUILLON',
    items: [{ id: Date.now(), description: 'Prestation / Produit', quantity: 1, price: 0 }] as any[],
  });

  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleAddItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { id: Date.now(), description: '', quantity: 1, price: 0 }]
    });
  };

  const handleRemoveItem = (id: number) => {
    if (invoiceData.items.length === 1) return; // Keep at least one item
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.filter(item => item.id !== id)
    });
  };

  const handleItemChange = (id: number, field: string, value: string | number) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    
    try {
      setIsDownloading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const dataUrl = await htmlToImage.toPng(invoiceRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: 794,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          margin: '0'
        }
      });
      
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (invoiceRef.current.offsetHeight * pdfWidth) / invoiceRef.current.offsetWidth;
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [pdfWidth, Math.max(297, pdfHeight)]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceData.number || 'Facture'}.pdf`);
    } catch (error: any) {
      console.error("Erreur lors de la génération du PDF :", error);
      alert(`Le téléchargement direct a échoué (${error?.message || String(error)}). Utilisez la fenêtre d'impression (Ctrl+P ou Cmd+P) et choisissez 'Enregistrer au format PDF'.`);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user?.companyId) return;
    
    const subtotal = calculateSubtotal();
    const total = subtotal;
    
    // Formatting the date
    const dateObj = new Date(invoiceData.date);
    const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');

    let res;
    if (invoiceData.dbId) {
      res = await updateSale(invoiceData.dbId, {
        totalAmount: total,
        status: invoiceData.status,
        items: invoiceData.items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0
        }))
      });
    } else {
      res = await createSale({
        invoiceNo: invoiceData.number,
        totalAmount: total,
        status: invoiceData.status,
        companyId: session.user.companyId,
        items: invoiceData.items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0
        }))
      });
    }

    if (res.success) {
      const newInvoice = {
        id: invoiceData.number,
        isoDate: invoiceData.date,
        client: invoiceData.clientName || 'Client Sans Nom',
        clientAddress: invoiceData.clientAddress,
        clientEmail: invoiceData.clientEmail,
        clientPhone: invoiceData.clientPhone,
        items: invoiceData.items,
        date: formattedDate,
        due: '-',
        status: invoiceData.status,
        amount: total
      };
      
      const existingIndex = invoices.findIndex(inv => inv.id === invoiceData.number);
      if (existingIndex >= 0) {
        const newInvoices = [...invoices];
        newInvoices[existingIndex] = newInvoice;
        setInvoices(newInvoices);
      } else {
        setInvoices([newInvoice, ...invoices]);
      }
      
      setShowSuccess(true);
    } else {
      alert("Erreur lors de l'enregistrement");
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case 'payée': return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400';
      case 'créée': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
      case 'en retard': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300';
    }
  };

  // Filter invoices based on search and active filter
  const filteredInvoices = invoices.filter(inv => {
    const matchesFilter = activeFilter === 'Tous' || inv.status.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch = inv.client.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isCreating || isViewing) {
    const subtotal = calculateSubtotal();
    const total = subtotal;

    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 relative">
        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-[#162032] rounded-3xl w-full max-w-[400px] p-8 shadow-2xl relative text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Facture enregistrée</h3>
              <p className="text-[15px] text-gray-500 dark:text-slate-400 mb-8 leading-relaxed px-2">
                La facture a été créée et enregistrée avec succès.
              </p>
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="w-full py-3.5 bg-[#2563EB] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center disabled:opacity-70"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {isDownloading ? 'Génération...' : 'Télécharger la facture'}
                </button>
                <button 
                  onClick={() => {
                    setShowSuccess(false);
                    setIsCreating(false);
                    setIsViewing(false);
                  }}
                  className="w-full py-3.5 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Retourner aux factures
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button 
            onClick={() => { setIsCreating(false); setIsViewing(false); setStatusDropdownOpen(false); }}
            className="flex items-center text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux factures
          </button>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isViewing ? (
              <>
                <div className="relative">
                  <button 
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className="flex items-center justify-center px-4 py-2 bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Changer de statut
                  </button>
                  {statusDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setStatusDropdownOpen(false)} />
                      <div className="absolute top-12 right-0 w-40 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-slate-700 rounded-xl shadow-lg py-2 z-50">
                        {['BROUILLON', 'CRÉÉE', 'PAYÉE', 'EN RETARD'].map(s => (
                          <button
                            key={s}
                            onClick={async () => {
                              const newStatus = s === 'CRÉÉE' ? 'Créée' : s === 'PAYÉE' ? 'Payée' : s === 'EN RETARD' ? 'En retard' : 'Brouillon';
                              setInvoiceData({...invoiceData, status: newStatus});
                              setInvoices(invoices.map(i => i.id === invoiceData.number ? { ...i, status: newStatus } : i));
                              setStatusDropdownOpen(false);
                              if (invoiceData.dbId) {
                                await updateSale(invoiceData.dbId, { status: newStatus });
                              }
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="flex items-center justify-center px-4 py-2 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? 'Génération...' : 'Télécharger PDF'}
                </button>
                <button 
                  onClick={() => { setIsViewing(false); setIsCreating(true); }}
                  className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg font-medium hover:bg-blue-100 transition-colors shadow-sm"
                >
                  Modifier
                </button>
                <button 
                  onClick={async () => {
                    if (confirm('Voulez-vous vraiment supprimer cette facture ?')) {
                      if (invoiceData.dbId) {
                        await deleteSale(invoiceData.dbId);
                      }
                      setInvoices(invoices.filter(i => i.id !== invoiceData.number));
                      setIsViewing(false);
                    }
                  }}
                  className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-100 transition-colors shadow-sm"
                >
                  Supprimer
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-70"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? 'Génération...' : 'Télécharger PDF'}
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4 mr-2 text-white/80" /> Enregistrer
                </button>
              </>
            )}
          </div>
        </div>

        {/* Invoice Container - Professional & Elegant */}
        <div className="bg-white rounded-2xl shadow-xl overflow-x-auto border border-gray-100 dark:border-none mx-auto print:shadow-none print:border-none font-sans custom-scrollbar">
          <div ref={invoiceRef} className="bg-white text-gray-900 flex flex-col relative shrink-0" style={{ minHeight: '1122px', width: '794px', margin: '0 auto' }}>
            {/* Top Accent Bar */}
            <div className="h-3 bg-[#2563EB] w-full"></div>

            <div className="p-12 sm:p-14 flex flex-col flex-grow">
              
              {/* Header: Logo & Invoice Info */}
              <div className="flex justify-between items-start mb-14">
                <div>
                  {settings?.logo ? (
                    <img src={settings.logo} alt="Logo" crossOrigin="anonymous" className="h-14 object-contain mb-6" />
                  ) : (
                    <h1 className="text-3xl font-black text-gray-900 mb-6">
                      <span className="text-[#2563EB]">GEST</span>ORA S.A.S
                    </h1>
                  )}
                  <p className="text-gray-900 font-bold text-lg mb-1">{settings?.companyName || 'Gestora SARL'}</p>
                  <p className="text-gray-500 text-sm mb-0.5">{settings?.address || '123 Avenue du Commerce, Dakar, SN'}</p>
                  <p className="text-gray-500 text-sm mb-0.5">{settings?.email || 'contact@gestora.sn'}</p>
                  <p className="text-gray-500 text-sm">{settings?.phone || '+221 77 123 45 67'}</p>
                </div>

                <div className="text-right flex flex-col items-end">
                  <h2 className="text-4xl font-black text-[#2563EB] tracking-widest uppercase mb-6">Facture</h2>
                  
                  <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 min-w-[200px]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Référence</span>
                      <input 
                        type="text" 
                        value={invoiceData.number}
                        onChange={(e) => setInvoiceData({...invoiceData, number: e.target.value})}
                        disabled={isViewing}
                        className="w-32 text-right border-b border-transparent hover:border-gray-300 focus:border-gray-300 focus:outline-none bg-transparent font-bold text-gray-900 disabled:opacity-100"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</span>
                      <input 
                        type="date" 
                        value={invoiceData.date}
                        onChange={(e) => setInvoiceData({...invoiceData, date: e.target.value})}
                        disabled={isViewing}
                        className="w-32 text-right border-b border-transparent hover:border-gray-300 focus:border-gray-300 focus:outline-none bg-transparent text-sm font-semibold text-gray-900 disabled:opacity-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Client & Status Block */}
              <div className="flex justify-between items-start mb-12">
                <div className="w-1/2 pr-8">
                  <h3 className="text-xs font-bold text-[#2563EB] uppercase tracking-widest mb-3 flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mr-2"></div>
                    Facturé à
                  </h3>
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Nom du client</span>
                      <input 
                        type="text" 
                        placeholder="Nom du client / Entreprise"
                        value={invoiceData.clientName}
                        onChange={(e) => setInvoiceData({...invoiceData, clientName: e.target.value})}
                        autoComplete="off"
                        disabled={isViewing}
                        className="w-full font-black text-gray-900 text-xl border-b border-transparent hover:border-gray-300 focus:border-gray-300 focus:outline-none bg-transparent placeholder-gray-300 disabled:opacity-100 pb-1"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Adresse</span>
                      <input 
                        type="text" 
                        placeholder="Adresse complète"
                        value={invoiceData.clientAddress}
                        onChange={(e) => setInvoiceData({...invoiceData, clientAddress: e.target.value})}
                        autoComplete="off"
                        disabled={isViewing}
                        className="w-full text-sm font-medium text-gray-600 border-b border-transparent hover:border-gray-300 focus:border-gray-300 focus:outline-none bg-transparent placeholder-gray-300 disabled:opacity-100 pb-1"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email</span>
                      <input 
                        type="email" 
                        placeholder="Email"
                        value={invoiceData.clientEmail}
                        onChange={(e) => setInvoiceData({...invoiceData, clientEmail: e.target.value})}
                        autoComplete="off"
                        disabled={isViewing}
                        className="w-full text-sm font-medium text-gray-600 border-b border-transparent hover:border-gray-300 focus:border-gray-300 focus:outline-none bg-transparent placeholder-gray-300 disabled:opacity-100 pb-1"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Téléphone</span>
                      <input 
                        type="tel" 
                        placeholder="Téléphone"
                        value={invoiceData.clientPhone}
                        onChange={(e) => setInvoiceData({...invoiceData, clientPhone: e.target.value})}
                        autoComplete="off"
                        disabled={isViewing}
                        className="w-full text-sm font-medium text-gray-600 border-b border-transparent hover:border-gray-300 focus:border-gray-300 focus:outline-none bg-transparent placeholder-gray-300 disabled:opacity-100 pb-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-1/3 text-right">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Statut de la facture</span>
                  <div className="flex justify-end" data-html2canvas-ignore="true">
                    {isViewing ? (
                      <span className={`px-4 py-2 text-sm font-bold rounded-xl border ${getStatusStyle(invoiceData.status)}`}>
                        {invoiceData.status}
                      </span>
                    ) : (
                      <select
                        value={invoiceData.status.toUpperCase()}
                        onChange={(e) => {
                          const s = e.target.value;
                          setInvoiceData({...invoiceData, status: s === 'CRÉÉE' ? 'Créée' : s === 'PAYÉE' ? 'Payée' : s === 'EN RETARD' ? 'En retard' : 'Brouillon'});
                        }}
                        className="bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-gray-300 focus:border-gray-300 block w-40 p-2.5 cursor-pointer hover:bg-gray-100 transition-colors shadow-sm ml-auto"
                      >
                        <option value="BROUILLON">Brouillon</option>
                        <option value="CRÉÉE">Créée</option>
                        <option value="PAYÉE">Payée</option>
                        <option value="EN RETARD">En retard</option>
                      </select>
                    )}
                  </div>
                  <div className="hidden print:block mt-2 text-right" style={{ display: 'none' }}>
                     <span className={`inline-block px-3 py-1 text-xs font-bold rounded-lg border ${getStatusStyle(invoiceData.status)}`}>
                       {invoiceData.status}
                     </span>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="flex-grow flex flex-col">
                <div className="flex text-xs font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-900 pb-3 mb-2 px-3">
                  <div className="w-1/2">Désignation</div>
                  <div className="w-1/6 text-center">Quantité</div>
                  <div className="w-1/6 text-right">Prix Unitaire</div>
                  <div className="w-1/6 text-right">Total</div>
                </div>

                <div className="space-y-0 relative">
                  {invoiceData.items.map((item, index) => (
                    <div key={item.id} className={`flex items-center p-3 border-b border-gray-100 group transition-colors relative ${index % 2 === 0 ? 'bg-transparent' : 'bg-gray-50/50'}`}>
                      <div className="w-1/2 pr-4">
                        <input 
                          type="text" 
                          placeholder="Description de l'article ou service"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          disabled={isViewing}
                          className="w-full text-sm font-medium text-gray-900 border-none focus:ring-0 bg-transparent placeholder-gray-400 disabled:opacity-100"
                        />
                      </div>
                      <div className="w-1/6 px-2">
                        <input 
                          type="number" 
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                          disabled={isViewing}
                          className="w-full text-sm font-semibold text-center border-none focus:ring-0 bg-transparent text-gray-700 disabled:opacity-100"
                        />
                      </div>
                      <div className="w-1/6 px-2 flex items-center justify-end text-sm">
                        <input 
                          type="number" 
                          min="0"
                          value={item.price}
                          onChange={(e) => handleItemChange(item.id, 'price', Number(e.target.value))}
                          disabled={isViewing}
                          className="w-24 text-right border-none focus:ring-0 bg-transparent font-semibold text-gray-700 disabled:opacity-100"
                        />
                        <span className="text-gray-500 ml-1">FCFA</span>
                      </div>
                      <div className="w-1/6 text-right text-sm font-black text-gray-900">
                        {(item.quantity * item.price).toLocaleString('fr-FR')} FCFA
                      </div>
                      {!isViewing && (
                        <div className="absolute -right-10 w-8">
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                            title="Supprimer la ligne"
                            data-html2canvas-ignore="true"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!isViewing && (
                  <button 
                    onClick={handleAddItem}
                    className="mt-6 flex items-center text-sm font-bold text-[#2563EB] hover:text-blue-800 transition-colors px-3 self-start"
                    data-html2canvas-ignore="true"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Ajouter une ligne
                  </button>
                )}
              </div>

              {/* Totals Section - Moved to Bottom */}
              <div className="flex justify-end mt-16 mb-4">
                <div className="w-full sm:w-1/2 lg:w-5/12">
                  <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Sous-total</span>
                    <span className="text-sm font-black text-gray-900">{subtotal.toLocaleString('fr-FR')} FCFA</span>
                  </div>

                  <div className="flex justify-between items-center bg-[#2563EB] rounded-lg p-3 mt-3 text-white shadow-sm">
                    <span className="text-sm font-bold uppercase tracking-wider">Total Payé</span>
                    <span className="text-xl font-black">{total.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="w-full bg-gray-50/80 px-12 py-6 border-t border-gray-200 mt-auto flex flex-col sm:flex-row justify-between items-center">
              <p className="text-xs font-semibold text-gray-500 text-center sm:text-left">
                {settings?.companyName || 'GESTORA S.A.S'}
              </p>
              <p className="text-xs font-medium text-gray-400 text-center sm:text-right mt-2 sm:mt-0">
                {settings?.companyId || 'NINEA: 000000000 - RC: SN-DKR-2026-B-0000'}
              </p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // --- INVOICES LIST VIEW ---
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Factures</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Gérez vos factures et suivez vos paiements.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Créer une facture
        </button>
      </div>

      {/* Toolbar: Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-2">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg leading-5 bg-white dark:bg-[#162032] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Rechercher par client ou n°..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                activeFilter === filter 
                  ? 'bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-[#162032] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table (Desktop) */}
      <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 shadow-sm transition-colors duration-300">
        <div className="hidden md:block overflow-x-auto pb-24 custom-scrollbar">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700/50">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">N° Facture</th>
                <th scope="col" className="px-6 py-4 font-semibold">Client</th>
                <th scope="col" className="px-6 py-4 font-semibold">Date</th>
                <th scope="col" className="px-6 py-4 font-semibold">Statut</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Montant</th>
                <th scope="col" className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {inv.id}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">
                      {inv.client}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                      {inv.date}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-right text-gray-900 dark:text-white">
                      {inv.amount.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === inv.id ? null : inv.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      {openDropdownId === inv.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }}
                          />
                          <div className="absolute right-8 top-10 w-56 bg-white dark:bg-[#1e293b] rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-50 flex flex-col overflow-hidden">
                            <button 
                              onClick={() => {
                                setInvoiceData({
                                  dbId: inv.dbId,
                                  number: inv.id,
                                  date: inv.isoDate || new Date().toISOString().split('T')[0],
                                  clientName: inv.client,
                                  clientAddress: inv.clientAddress || '',
                                  clientEmail: inv.clientEmail || '',
                                  clientPhone: inv.clientPhone || '',
                                  status: inv.status.toUpperCase(),
                                  items: inv.items && inv.items.length > 0 ? inv.items : [{ id: Date.now(), description: 'Prestation / Produit', quantity: 1, price: inv.amount }]
                                });
                                setIsViewing(true);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 text-left font-medium transition-colors border-b border-gray-100 dark:border-slate-700/50"
                            >
                              Voir le détail
                            </button>
                            <button 
                              onClick={() => {
                                setInvoiceData({
                                  dbId: inv.dbId,
                                  number: inv.id,
                                  date: inv.isoDate || new Date().toISOString().split('T')[0],
                                  clientName: inv.client,
                                  clientAddress: inv.clientAddress || '',
                                  clientEmail: inv.clientEmail || '',
                                  clientPhone: inv.clientPhone || '',
                                  status: inv.status.toUpperCase(),
                                  items: inv.items && inv.items.length > 0 ? inv.items : [{ id: Date.now(), description: 'Prestation / Produit', quantity: 1, price: inv.amount }]
                                });
                                setIsCreating(true);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-left font-medium transition-colors border-b border-gray-100 dark:border-slate-700/50"
                            >
                              Modifier
                            </button>
                            <button 
                              onClick={async () => {
                                if (confirm('Voulez-vous vraiment supprimer cette facture ?')) {
                                  await deleteSale(inv.dbId);
                                  setInvoices(invoices.filter(i => i.id !== inv.id));
                                }
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-left font-medium transition-colors"
                            >
                              Supprimer
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                    Aucune facture trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cards (Mobile) */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-slate-800/60 pb-10">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((inv) => (
              <div key={inv.id} className="p-4 bg-white dark:bg-[#162032] flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{inv.id}</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{inv.date}</p>
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${getStatusStyle(inv.status)}`}>
                    {inv.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center">
                    <span className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider mr-2">Client:</span>
                    {inv.client}
                  </span>
                  <span className="font-black text-gray-900 dark:text-white text-sm">
                    {inv.amount.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-slate-800/60">
                  <button 
                    onClick={() => {
                      setInvoiceData({
                        dbId: inv.dbId,
                        number: inv.id,
                        date: inv.isoDate || new Date().toISOString().split('T')[0],
                        clientName: inv.client,
                        clientAddress: inv.clientAddress || '',
                        clientEmail: inv.clientEmail || '',
                        clientPhone: inv.clientPhone || '',
                        status: inv.status.toUpperCase(),
                        items: inv.items && inv.items.length > 0 ? inv.items : [{ id: Date.now(), description: 'Prestation / Produit', quantity: 1, price: inv.amount }]
                      });
                      setIsCreating(true);
                    }}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors text-xs font-semibold flex items-center"
                  >
                    Modifier
                  </button>
                  <button 
                    onClick={async () => {
                      if (confirm('Voulez-vous vraiment supprimer cette facture ?')) {
                        await deleteSale(inv.dbId);
                        setInvoices(invoices.filter(i => i.id !== inv.id));
                      }
                    }}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
              Aucune facture trouvée.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
