"use client";

import React, { useState, useEffect } from 'react';
import { Building2, Save, MapPin, Phone, Mail, FileText, Camera } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getCompany, updateCompany } from '@/app/actions/companyActions';

export default function CompanyPage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    companyName: '',
    ninea: '',
    rccm: '',
    email: '',
    phone: '',
    address: '',
    description: ''
  });
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load from database on mount
  useEffect(() => {
    async function loadCompany() {
      if (session?.user?.companyId) {
        const res = await getCompany(session.user.companyId);
        if (res.success && res.data) {
          setFormData({
            companyName: res.data.name || '',
            ninea: res.data.taxNumber || '',
            rccm: '', // Not in schema directly, assuming taxNumber covers it or keep blank
            email: res.data.email || '',
            phone: res.data.phone || '',
            address: res.data.address || '',
            description: ''
          });
        }
      }
      setIsLoaded(true);
    }
    loadCompany();
  }, [session?.user?.companyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaveSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.companyId) return;

    setIsSaving(true);
    
    const res = await updateCompany(session.user.companyId, {
      name: formData.companyName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      taxNumber: formData.ninea, // mapping ninea to taxNumber
    });

    setIsSaving(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres de l'Entreprise</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Gérez les informations légales et publiques de votre société</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Logo & Quick Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 p-6 shadow-sm transition-colors duration-300">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Logo & Identité</h3>
            
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-slate-700/50 rounded-xl bg-gray-50 dark:bg-[#0A1226] mb-6">
              <div className="w-24 h-24 bg-white dark:bg-[#1E293B] rounded-full shadow-sm flex items-center justify-center mb-4 relative group cursor-pointer border border-gray-100 dark:border-slate-600">
                <Building2 className="w-10 h-10 text-gray-300 dark:text-slate-500" />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">Changer le logo</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">PNG, JPG jusqu'à 5MB</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                <Building2 className="w-4 h-4 mr-3 text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white truncate">
                  {formData.companyName || 'Nom de l\'entreprise non défini'}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                <span className="truncate">{formData.email || 'Aucun email défini'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 shadow-sm transition-colors duration-300 overflow-hidden">
            <form onSubmit={handleSave}>
              <div className="p-6 space-y-6">
                
                {/* Section 1: Informations Générales */}
                <div>
                  <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-slate-700/50 pb-2">Informations Générales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Nom de l'entreprise *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building2 className="h-4 w-4 text-gray-400" />
                        </div>
                        <input 
                          type="text" 
                          name="companyName"
                          required
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="Ex: Gestora SAS"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Email de contact</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="contact@gestora.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Informations Légales */}
                <div>
                  <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-slate-700/50 pb-2 mt-8">Informations Légales (Sénégal)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">NINEA</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileText className="h-4 w-4 text-gray-400" />
                        </div>
                        <input 
                          type="text" 
                          name="ninea"
                          value={formData.ninea}
                          onChange={handleChange}
                          placeholder="Ex: 001234567 2G2"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">RCCM</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileText className="h-4 w-4 text-gray-400" />
                        </div>
                        <input 
                          type="text" 
                          name="rccm"
                          value={formData.rccm}
                          onChange={handleChange}
                          placeholder="Ex: SN-DKR-2023-B-1234"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Coordonnées */}
                <div>
                  <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-slate-700/50 pb-2 mt-8">Coordonnées</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Téléphone</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <input 
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+221 77 000 00 00"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Adresse postale</label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                          <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                        <textarea 
                          name="address"
                          rows={3}
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Ex: 15 Avenue Pasteur, Dakar, Sénégal"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Footer / Actions */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700/50 bg-gray-50/50 dark:bg-[#1E293B]/50 flex justify-between items-center">
                <div>
                  {saveSuccess && (
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center animate-in fade-in slide-in-from-left-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                      Modifications enregistrées !
                    </span>
                  )}
                </div>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sauvegarde...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
