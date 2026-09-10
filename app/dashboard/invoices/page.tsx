"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Plus, Download, Save, ArrowLeft, Trash2, Search, MoreHorizontal, Eye, Pencil } from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { useSession } from 'next-auth/react';
import { getSettings } from '../../actions/settingsActions';
import { getSales, createSale, updateSale, deleteSale } from '@/app/actions/saleActions';
import { SkeletonList, SkeletonForm } from "../../../components/Skeletons";
import { generateInvoicePDF } from '@/lib/pdfGenerator';


export default function InvoicesPage() {
  const { data: session, status } = useSession();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
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
          // Filtrer les ventes POS (qui commencent par VTE- ou qui sont de l'ancien format POS FAC-13chiffres)
          const invoiceOnly = res.data.filter((sale: any) => {
            const no = sale.invoiceNo || '';
            if (no.startsWith('VTE-')) return false;
            if (no.match(/^FAC-\d{13}$/)) return false;
            return true;
          });

          const formatted = invoiceOnly.map((sale: any) => ({
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
    number: `FAC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 100000)}`,
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    clientPhone: '',
    items: [{ id: Date.now(), description: 'Prestation / Produit', quantity: 1, price: 0 }] as any[],
  });

  const invoiceRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

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
    return invoiceData.items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.price) || 0)), 0);
  };

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    
    try {
      setIsDownloading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const dataUrl = await htmlToImage.toPng(pdfRef.current, {
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
      const pdfHeight = (pdfRef.current.offsetHeight * pdfWidth) / pdfRef.current.offsetWidth;
      
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
        status: "COMPLETED",
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
        status: "COMPLETED",
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
        status: "COMPLETED",
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
      await handleDownloadPDF();
      
      setIsCreating(false);
      setIsViewing(false);
    } else {
      alert("Erreur lors de l'enregistrement");
    }
  };



  // Filter invoices based on search and active filter
  const filteredInvoices = invoices;

  if (isCreating || isViewing) {
    const subtotal = calculateSubtotal();
    const total = subtotal;

    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 relative">


        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button 
            onClick={() => { setIsCreating(false); setIsViewing(false); }}
            className="flex items-center text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux factures
          </button>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isViewing ? (
              <>

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
                  onClick={async () => {
                    setIsDownloading(true);
                    await handleSave();
                  }}
                  disabled={isDownloading}
                  className="flex items-center justify-center px-5 py-2.5 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? 'Génération...' : 'Télécharger'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Invoice Container - Professional & Elegant */}
        {/* Invoice Container - Responsive Editor */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700/50 mx-auto font-sans w-full overflow-hidden">
          <div ref={invoiceRef} className="bg-white text-gray-900 flex flex-col relative w-full p-5 sm:p-8 md:p-12">
            {/* Top Accent Bar */}
            <div className="h-2 sm:h-3 bg-[#2563EB] w-full absolute top-0 left-0 right-0"></div>

            <div className="flex flex-col mt-4">
              
              {/* Header: Logo & Invoice Info */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                  {settings?.logo ? (
                    <img src={settings.logo} alt="Logo" crossOrigin="anonymous" className="h-10 sm:h-14 object-contain mb-4 sm:mb-6" />
                  ) : (
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 sm:mb-6">
                      <span className="text-[#2563EB]">{settings?.companyName ? settings.companyName.substring(0, 4).toUpperCase() : 'GEST'}</span>{settings?.companyName ? settings.companyName.substring(4) : 'ORA'}
                    </h1>
                  )}
                  {settings?.companyName && <p className="text-gray-900 font-bold text-base sm:text-lg mb-1">{settings.companyName}</p>}
                  {settings?.address && <p className="text-gray-500 text-xs sm:text-sm mb-0.5">{settings.address}</p>}
                  {settings?.email && <p className="text-gray-500 text-xs sm:text-sm mb-0.5">{settings.email}</p>}
                  {settings?.phone && <p className="text-gray-500 text-xs sm:text-sm">{settings.phone}</p>}
                </div>

                <div className="w-full md:w-auto text-left md:text-right flex flex-col items-start md:items-end">
                  <h2 className="text-3xl sm:text-4xl font-black text-[#2563EB] tracking-widest uppercase mb-4 sm:mb-6">Facture</h2>
                  
                  <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 w-full md:min-w-[200px]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-4">Référence</span>
                      <input 
                        type="text" 
                        value={invoiceData.number}
                        onChange={(e) => setInvoiceData({...invoiceData, number: e.target.value})}
                        disabled={isViewing}
                        className="w-full md:w-32 text-right border-b border-transparent hover:border-gray-300 focus:border-gray-300 focus:outline-none bg-transparent font-bold text-gray-900 disabled:opacity-100"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-4">Date</span>
                      <input 
                        type="date" 
                        value={invoiceData.date}
                        onChange={(e) => setInvoiceData({...invoiceData, date: e.target.value})}
                        disabled={isViewing}
                        className="w-full md:w-32 text-right border-b border-transparent hover:border-gray-300 focus:border-gray-300 focus:outline-none bg-transparent text-sm font-semibold text-gray-900 disabled:opacity-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Client & Status Block */}
              <div className="mb-10">
                <div className="w-full md:w-1/2">
                  <h3 className="text-xs font-bold text-[#2563EB] uppercase tracking-widest mb-3 flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mr-2"></div>
                    Facturé à
                  </h3>
                  <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Nom du client</span>
                      <input 
                        type="text" 
                        placeholder="Nom du client / Entreprise"
                        value={invoiceData.clientName}
                        onChange={(e) => setInvoiceData({...invoiceData, clientName: e.target.value})}
                        autoComplete="off"
                        disabled={isViewing}
                        className="w-full font-black text-gray-900 text-lg sm:text-xl border-b border-transparent hover:border-gray-300 focus:border-gray-300 focus:outline-none bg-transparent placeholder-gray-300 disabled:opacity-100 pb-1"
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
              </div>

              {/* Table (Responsive layout) */}
              <div className="flex-grow flex flex-col">
                {/* Desktop Header */}
                <div className="hidden md:flex text-xs font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-900 pb-3 mb-2 px-3">
                  <div className="w-1/2">Désignation</div>
                  <div className="w-1/6 text-center">Quantité</div>
                  <div className="w-1/6 text-right">Prix Unitaire</div>
                  <div className="w-1/6 text-right">Total</div>
                </div>

                <div className="space-y-4 md:space-y-0">
                  {invoiceData.items.map((item, index) => (
                    <div key={item.id} className={`flex flex-col md:flex-row items-start md:items-center p-4 md:p-3 rounded-xl md:rounded-none border border-gray-100 md:border-x-0 md:border-t-0 md:border-b group transition-colors relative ${index % 2 === 0 ? 'bg-transparent' : 'bg-gray-50/50'}`}>
                      
                      <div className="w-full md:w-1/2 md:pr-4 mb-3 md:mb-0">
                        <label className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Désignation</label>
                        <input 
                          type="text" 
                          placeholder="Description de l'article ou service"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          disabled={isViewing}
                          className="w-full text-sm font-bold md:font-medium text-gray-900 border-b md:border-none border-gray-200 focus:ring-0 bg-transparent placeholder-gray-400 disabled:opacity-100 pb-1 md:pb-0"
                        />
                      </div>
                      
                      <div className="w-full md:w-1/2 flex flex-row items-center justify-between md:justify-start">
                        <div className="w-1/3 md:w-1/3 md:px-2">
                          <label className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Qté</label>
                          <input 
                            type="text" 
                            value={item.quantity === '' ? '' : item.quantity}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              handleItemChange(item.id, 'quantity', val === '' ? '' : parseInt(val, 10));
                            }}
                            disabled={isViewing}
                            className="w-full text-sm font-semibold text-left md:text-center border-none focus:ring-0 bg-transparent text-gray-700 disabled:opacity-100 p-0"
                          />
                        </div>
                        <div className="w-1/3 md:w-1/3 md:px-2 flex flex-col md:flex-row items-start md:items-center justify-start md:justify-end text-sm">
                          <label className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Prix U.</label>
                          <input 
                            type="text" 
                            value={item.price === '' ? '' : Number(item.price).toLocaleString('fr-FR')}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                              handleItemChange(item.id, 'price', val === '' ? '' : parseInt(val, 10));
                            }}
                            disabled={isViewing}
                            className="w-full text-left md:text-right border-none focus:ring-0 bg-transparent font-semibold text-gray-700 disabled:opacity-100 p-0"
                          />
                        </div>
                        <div className="w-1/3 md:w-1/3 text-right text-sm flex flex-col items-end">
                          <label className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Total</label>
                          <span className="font-black text-[#2563EB] md:text-gray-900">
                            {((Number(item.quantity) || 0) * (Number(item.price) || 0)).toLocaleString('fr-FR')}
                          </span>
                        </div>
                      </div>

                      {!isViewing && (
                        <div className="absolute top-2 right-2 md:top-auto md:relative md:w-8">
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-gray-300 hover:text-red-600 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-2 bg-gray-50 md:bg-transparent rounded-lg"
                            title="Supprimer la ligne"
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
                    className="mt-6 flex items-center justify-center w-full md:w-auto text-sm font-bold text-[#2563EB] bg-blue-50 md:bg-transparent hover:bg-blue-100 md:hover:bg-transparent md:hover:text-blue-800 transition-colors py-3 md:py-0 px-3 rounded-xl md:rounded-none self-start"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Ajouter une ligne
                  </button>
                )}
              </div>

              {/* Totals Section */}
              <div className="flex justify-end mt-12 mb-4">
                <div className="w-full sm:w-1/2 lg:w-5/12">
                  <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Sous-total</span>
                    <span className="text-sm font-black text-gray-900">{subtotal.toLocaleString('fr-FR')}</span>
                  </div>

                  <div className="flex justify-between items-center bg-[#2563EB] rounded-xl p-4 mt-3 text-white shadow-sm">
                    <span className="text-sm font-bold uppercase tracking-wider">Total Payé</span>
                    <span className="text-xl font-black">{total.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden PDF Template (Fixed A4 Size) - Styles inline pour rendu parfait */}
        <div style={{ position: 'fixed', top: 0, left: '200vw', zIndex: -100 }}>
          <div
            ref={pdfRef}
            style={{
              width: '794px',
              minHeight: '1122px',
              backgroundColor: '#ffffff',
              color: '#111827',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'Arial, Helvetica, sans-serif',
              position: 'relative',
            }}
          >
            {/* Barre bleue en haut */}
            <div style={{ height: '12px', backgroundColor: '#2563EB', width: '100%', flexShrink: 0 }} />

            {/* Corps principal */}
            <div style={{ padding: '56px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>

              {/* En-tête : Entreprise + Titre Facture */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                {/* Infos entreprise */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '50%' }}>
                  {settings?.logo ? (
                    <img
                      src={settings.logo}
                      alt="Logo"
                      crossOrigin="anonymous"
                      style={{ height: '56px', objectFit: 'contain', marginBottom: '16px' }}
                    />
                  ) : (
                    <div style={{ fontSize: '28px', fontWeight: '900', marginBottom: '16px', color: '#111827' }}>
                      <span style={{ color: '#2563EB' }}>
                        {settings?.companyName ? settings.companyName.slice(0, 4).toUpperCase() : 'GEST'}
                      </span>
                      {settings?.companyName ? settings.companyName.slice(4) : 'ORA'}
                    </div>
                  )}
                  {settings?.companyName && (
                    <div style={{ fontWeight: '700', fontSize: '16px', color: '#111827' }}>{settings.companyName}</div>
                  )}
                  {settings?.address && (
                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{settings.address}</div>
                  )}
                  {settings?.email && (
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{settings.email}</div>
                  )}
                  {settings?.phone && (
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{settings.phone}</div>
                  )}
                  {settings?.companyId && (
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>NINEA/RC : {settings.companyId}</div>
                  )}
                </div>

                {/* Titre + Référence + Date */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                  <div style={{ fontSize: '36px', fontWeight: '900', color: '#2563EB', letterSpacing: '4px', textTransform: 'uppercase' }}>Facture</div>
                  <div style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #f3f4f6',
                    minWidth: '210px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Référence</span>
                      <span style={{ fontWeight: '700', color: '#111827', fontSize: '14px' }}>{invoiceData.number}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{invoiceData.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Client */}
              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '2px' }}>Facturé à</span>
                </div>
                <div style={{ backgroundColor: '#f9fafb', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#111827' }}>{invoiceData.clientName || '---'}</div>
                  {invoiceData.clientAddress && <div style={{ fontSize: '13px', color: '#6b7280' }}>{invoiceData.clientAddress}</div>}
                  {invoiceData.clientEmail && <div style={{ fontSize: '13px', color: '#6b7280' }}>{invoiceData.clientEmail}</div>}
                  {invoiceData.clientPhone && <div style={{ fontSize: '13px', color: '#6b7280' }}>{invoiceData.clientPhone}</div>}
                </div>
              </div>

              {/* Tableau des articles */}
              <div style={{ flexGrow: 1 }}>
                {/* En-tête tableau */}
                <div style={{
                  display: 'flex',
                  borderBottom: '2px solid #111827',
                  paddingBottom: '10px',
                  marginBottom: '4px',
                  paddingLeft: '12px',
                  paddingRight: '12px'
                }}>
                  <div style={{ width: '50%', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Désignation</div>
                  <div style={{ width: '16.66%', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>Qté</div>
                  <div style={{ width: '16.66%', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Prix Unit.</div>
                  <div style={{ width: '16.66%', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Total</div>
                </div>

                {/* Lignes articles */}
                {invoiceData.items.map((item: any, index: number) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderBottom: '1px solid #f3f4f6',
                      backgroundColor: index % 2 === 0 ? 'transparent' : '#f9fafb',
                    }}
                  >
                    <div style={{ width: '50%', paddingRight: '16px', fontSize: '13px', fontWeight: '500', color: '#111827' }}>{item.description}</div>
                    <div style={{ width: '16.66%', fontSize: '13px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>{item.quantity}</div>
                    <div style={{ width: '16.66%', fontSize: '13px', fontWeight: '600', color: '#374151', textAlign: 'right' }}>{Number(item.price || 0).toLocaleString('fr-FR')}</div>
                    <div style={{ width: '16.66%', fontSize: '13px', fontWeight: '900', color: '#111827', textAlign: 'right' }}>
                      {((Number(item.quantity) || 0) * (Number(item.price) || 0)).toLocaleString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '48px', marginBottom: '16px' }}>
                <div style={{ width: '41.66%' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 16px',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Sous-total</span>
                    <span style={{ fontSize: '13px', fontWeight: '900', color: '#111827' }}>{subtotal.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#2563EB',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    marginTop: '10px'
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px' }}>Total</span>
                    <span style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff' }}>{total.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>

            </div>{/* fin corps principal */}

            {/* Pied de page */}
            <div style={{
              width: '100%',
              backgroundColor: '#f9fafb',
              padding: '24px 56px',
              borderTop: '1px solid #e5e7eb',
              textAlign: 'center',
              flexShrink: 0
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                {settings?.companyName || ''}{settings?.companyId ? ` — ${settings.companyId}` : ''}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                {settings?.invoiceFooter || 'Merci de votre confiance. Le paiement est attendu sous 30 jours.'}
              </div>
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
          onClick={() => {
            const prefix = settings?.invoicePrefix || 'FAC-';
            setInvoiceData({
              ...invoiceData, 
              number: `${prefix}${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 10000)}`,
              dbId: '',
              clientName: '',
              clientAddress: '',
              clientEmail: '',
              clientPhone: '',
              items: [{ id: Date.now(), description: 'Prestation / Produit', quantity: 1, price: 0 }]
            });
            setIsCreating(true);
          }}
          className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Créer une facture
        </button>
      </div>


      {(status === 'loading' || isLoading) ? (
        <SkeletonList count={5} />
      ) : (
        <>
          {/* Table (Desktop) */}
          <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 shadow-sm transition-colors duration-300">
        <div className="hidden md:block overflow-x-auto pb-24 custom-scrollbar">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700/50">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">N° Facture</th>
                <th scope="col" className="px-6 py-4 font-semibold">Client</th>
                <th scope="col" className="px-6 py-4 font-semibold">Date</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Montant</th>
                <th scope="col" className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv, index) => (
                  <tr key={inv.dbId || `${inv.id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {inv.id}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">
                      {inv.client}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                      {inv.date}
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
                          <div className="absolute right-8 top-10 w-52 bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 py-1.5 z-50 flex flex-col overflow-hidden">
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
                                  items: inv.items && inv.items.length > 0 ? inv.items : [{ id: Date.now(), description: 'Prestation / Produit', quantity: 1, price: inv.amount }]
                                });
                                setIsViewing(true);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 text-left font-semibold transition-colors flex items-center gap-2.5 border-b border-gray-100 dark:border-slate-700/50"
                            >
                              <Eye className="w-4 h-4 text-gray-400" />
                              Voir le détail
                            </button>
                            <button 
                              onClick={() => {
                                generateInvoicePDF(
                                  { ...inv, invoiceNo: inv.id, totalAmount: inv.amount, createdAt: inv.isoDate || inv.date }, 
                                  settings, 
                                  { name: inv.client, address: inv.clientAddress, email: inv.clientEmail, phone: inv.clientPhone }
                                );
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-left font-semibold transition-colors flex items-center gap-2.5 border-b border-gray-100 dark:border-slate-700/50"
                            >
                              <Download className="w-4 h-4" />
                              Télécharger PDF
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
                                  items: inv.items && inv.items.length > 0 ? inv.items : [{ id: Date.now(), description: 'Prestation / Produit', quantity: 1, price: inv.amount }]
                                });
                                setIsCreating(true);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 text-left font-semibold transition-colors flex items-center gap-2.5 border-b border-gray-100 dark:border-slate-700/50"
                            >
                              <Pencil className="w-4 h-4 text-gray-400" />
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
                              className="w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-left font-semibold transition-colors flex items-center gap-2.5"
                            >
                              <Trash2 className="w-4 h-4" />
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
            filteredInvoices.map((inv, index) => (
              <div key={inv.dbId || `${inv.id}-${index}`} className="p-4 bg-white dark:bg-[#162032] flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{inv.id}</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{inv.date}</p>
                  </div>

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
        </>
      )}
    </div>
  );
}
