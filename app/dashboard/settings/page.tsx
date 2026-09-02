"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Settings, Save, Building2, Globe, FileText, Users, UploadCloud, Image as ImageIcon, Loader2, Check, X, Phone, Mail, MapPin } from 'lucide-react';
import { getSettings, saveSettings } from '../../actions/settingsActions';
import { SkeletonForm } from '../../../components/Skeletons';
import { useSession } from 'next-auth/react';
import { EmployeeModal } from '../../../components/EmployeeModal';
import { getEmployees, createEmployee, updateEmployee } from '@/app/actions/hrActions';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('profil');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    companyName: '',
    companyId: '',
    address: '',
    email: '',
    phone: '',
    logo: null as string | null
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [employees, setEmployees] = useState<any[]>([]);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  useEffect(() => {
    async function load() {
      if (session?.user?.companyId) {
        const res = await getSettings(session.user.companyId);
        if (res.success && res.settings) {
          const fetchedSettings = res.settings;
          // Clear default seeded values so the user sees the placeholders
          if (fetchedSettings.companyName === 'Coscas') {
            fetchedSettings.companyName = '';
            fetchedSettings.email = '';
            fetchedSettings.phone = '';
            fetchedSettings.address = '';
            fetchedSettings.companyId = '';
          }
          setFormData(fetchedSettings);
          if (fetchedSettings.logo) setLogoPreview(fetchedSettings.logo);
        }
        
        const empRes = await getEmployees(session.user.companyId);
        if (empRes.success && empRes.data) {
          setEmployees(empRes.data);
        }
      }
      setIsLoading(false);
    }
    load();
  }, [session?.user?.companyId]);

  const handleSaveEmployee = async (newItem: any) => {
    if (!session?.user?.companyId) return;

    if (editingEmployee && editingEmployee.id) {
      const res = await updateEmployee(editingEmployee.id, {
        firstName: newItem.firstName,
        lastName: newItem.lastName,
        email: newItem.email,
        phone: newItem.phone,
        role: newItem.role,
        status: newItem.status,
        department: newItem.department,
        salary: Number(newItem.salary),
      });
      if (res.success && res.data) {
        setEmployees(prev => prev.map(p => p.id === editingEmployee.id ? res.data : p));
      }
    } else {
      const res = await createEmployee({
        firstName: newItem.firstName,
        lastName: newItem.lastName,
        email: newItem.email,
        phone: newItem.phone,
        role: newItem.role,
        status: newItem.status,
        department: newItem.department || "Général",
        salary: Number(newItem.salary) || 0,
        companyId: session.user.companyId,
        joinDate: new Date(),
      });
      if (res.success && res.data) {
        setEmployees(prev => [res.data, ...prev]);
      }
    }
  };

  const tabs = [
    { id: 'profil', label: 'Profil de l\'entreprise', icon: Building2 },
    { id: 'regional', label: 'Régional & Devise', icon: Globe },
    { id: 'facturation', label: 'Modèles de facturation', icon: FileText },
    { id: 'equipe', label: 'Équipe & Accès', icon: Users },
  ];

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        setFormData(prev => ({ ...prev, logo: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if (name === 'companyId') {
      value = value.toUpperCase();
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!session?.user?.companyId) return;
    setIsSaving(true);
    const res = await saveSettings(session.user.companyId, formData);
    if (res.success) {
      setShowSuccess(true);
    }
    setIsSaving(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Paramètres</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Gérez les configurations générales de votre espace de travail.</p>
        </div>
      </div>
      
      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#162032] rounded-2xl w-full max-w-[400px] p-8 shadow-2xl relative text-center flex flex-col items-center border border-gray-200 dark:border-slate-700/50">
            {/* Close X */}
            <button 
              onClick={() => setShowSuccess(false)}
              className="absolute top-4 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
              <Check className="w-7 h-7" strokeWidth={3} />
            </div>
            
            {/* Text */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Paramètres mis à jour</h3>
            <p className="text-[15px] text-gray-500 dark:text-slate-400 mb-8 leading-relaxed px-2">
              Vos nouvelles informations d&apos;entreprise ont bien été enregistrées. Elles apparaîtront sur vos prochaines factures.
            </p>
            
            {/* Button */}
            <button 
              onClick={() => setShowSuccess(false)}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors shadow-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-gray-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/30 hover:text-gray-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {(status === 'loading' || isLoading) ? (
            <SkeletonForm />
          ) : (
            <>
              {activeTab === 'profil' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
              
              {/* Logo Section */}
              <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 p-5 shadow-sm transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/10 shrink-0">
                      <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Logo de l&apos;entreprise</h2>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Importez le logo de votre boutique. Il sera utilisé sur vos factures et documents officiels.</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 mt-6">
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#0A1226] flex items-center justify-center overflow-hidden shrink-0">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400 dark:text-slate-500" />
                    )}
                  </div>
                  <div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleLogoChange}
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <UploadCloud className="w-4 h-4" />
                      Importer un logo
                    </button>
                    <p className="text-xs text-gray-500 mt-2">Format recommandé : PNG ou JPG, fond transparent. Max 2MB.</p>
                  </div>
                </div>
              </div>

              {/* Identité de l'entreprise */}
              <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 p-5 shadow-sm transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/10 shrink-0">
                      <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Identité de l&apos;entreprise</h2>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Les informations officielles de votre société.</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-5 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Nom légal</label>
                      <input 
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="Ex: Gestora SARL"
                        className="w-full bg-gray-50 dark:bg-[#0A1226] border border-gray-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">NINEA ou RC</label>
                      <input 
                        type="text" 
                        name="companyId"
                        value={formData.companyId || ''}
                        onChange={handleInputChange}
                        placeholder="Ex: NINEA: 000000000 - RC: SN-DKR-2026"
                        className="w-full bg-gray-50 dark:bg-[#0A1226] border border-gray-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Adresse du siège social</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Ex: Plateau, Dakar, Sénégal"
                        className="w-full bg-gray-50 dark:bg-[#0A1226] border border-gray-200 dark:border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Coordonnées de contact */}
              <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 p-5 shadow-sm transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/10 shrink-0">
                      <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Coordonnées de contact</h2>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Visibles publiquement sur vos documents.</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Email de facturation</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Ex: facturation@gestora.sn"
                        className="w-full bg-gray-50 dark:bg-[#0A1226] border border-gray-200 dark:border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Téléphone pro</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Ex: +221 77 000 00 00"
                        className="w-full bg-gray-50 dark:bg-[#0A1226] border border-gray-200 dark:border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'regional' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
              <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 p-5 shadow-sm transition-colors">
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/10 shrink-0">
                    <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Régional & Devise</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Configurez votre zone géographique et devise principale.</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Devise principale</label>
                    <select className="w-full bg-gray-50 dark:bg-[#0A1226] border border-gray-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                      <option value="XOF">Franc CFA (XOF)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">Dollar US ($)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Fuseau horaire</label>
                      <select className="w-full bg-gray-50 dark:bg-[#0A1226] border border-gray-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                        <option value="GMT">GMT (Dakar)</option>
                        <option value="CET">CET (Paris)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Format de date</label>
                      <select className="w-full bg-gray-50 dark:bg-[#0A1226] border border-gray-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                        <option value="DD/MM/YYYY">JJ/MM/AAAA (31/12/2026)</option>
                        <option value="MM/DD/YYYY">MM/JJ/AAAA (12/31/2026)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'facturation' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
              <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 p-5 shadow-sm transition-colors">
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/10 shrink-0">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Modèles de facturation</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Personnalisez l'apparence de vos factures.</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Préfixe de numérotation</label>
                    <input 
                      type="text" 
                      defaultValue="FAC-"
                      className="w-full bg-gray-50 dark:bg-[#0A1226] border border-gray-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Les factures seront générées sous la forme: FAC-2026-001</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Notes de pied de page par défaut</label>
                    <textarea 
                      rows={3}
                      defaultValue="Merci de votre confiance. Le paiement est attendu sous 30 jours."
                      className="w-full bg-gray-50 dark:bg-[#0A1226] border border-gray-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'equipe' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
              <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 p-5 shadow-sm transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/10 shrink-0">
                      <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Équipe & Accès</h2>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Gérez les membres qui ont accès à votre espace.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingEmployee(null);
                      setIsEmployeeModalOpen(true);
                    }}
                    className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    + Inviter
                  </button>
                </div>
                
                <div className="border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Membre</th>
                        <th className="px-4 py-3 font-medium">Rôle</th>
                        <th className="px-4 py-3 font-medium text-right">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                      <tr className="bg-white dark:bg-[#162032]">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-white">Administrateur Principal</div>
                          <div className="text-xs text-gray-500">{session?.user?.email || 'admin@gestora.sn'}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-slate-300">Propriétaire</td>
                        <td className="px-4 py-3 text-right">
                          <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 rounded-full text-xs font-medium">Actif</span>
                        </td>
                      </tr>
                      {employees.map(emp => (
                        <tr key={emp.id} className="bg-white dark:bg-[#162032] hover:bg-gray-50 dark:hover:bg-slate-800/30 cursor-pointer" onClick={() => { setEditingEmployee(emp); setIsEmployeeModalOpen(true); }}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900 dark:text-white">{emp.firstName} {emp.lastName}</div>
                            <div className="text-xs text-gray-500">{emp.email}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                            {emp.role === 'ADMIN' ? 'Administrateur' : emp.role === 'MANAGER' ? 'Manager' : emp.role === 'SALES' ? 'Commercial' : 'Caissier(e)'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${emp.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                              {emp.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Employee Modal */}
          <EmployeeModal 
            isOpen={isEmployeeModalOpen} 
            onClose={() => {
              setIsEmployeeModalOpen(false);
              setEditingEmployee(null);
            }} 
            onSave={handleSaveEmployee} 
            initialData={editingEmployee}
          />

          {/* Action Footer */}
          <div className="pt-6 mt-6 border-t border-gray-200 dark:border-slate-700/50 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all shadow-sm disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              Enregistrer les modifications
            </button>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
