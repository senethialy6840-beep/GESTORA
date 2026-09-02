"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Building2, Users, CheckCircle, XCircle, Clock, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getAllCompanies, updateCompanySubscription, deleteCompany } from '@/app/actions/superAdminActions';

const PLATFORM_OWNER_EMAIL = 'gestorame112@gmail.com';

const PLANS = ['FREE', 'STARTUP', 'BUSINESS', 'ENTERPRISE'];
const STATUSES = ['ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED'];

export default function SuperAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (session?.user?.email !== PLATFORM_OWNER_EMAIL) {
      router.push('/dashboard');
      return;
    }
    loadCompanies();
  }, [session, status]);

  async function loadCompanies() {
    setIsLoading(true);
    const res = await getAllCompanies();
    if (res.success && res.data) setCompanies(res.data);
    setIsLoading(false);
  }

  async function handleUpdate(companyId: string, plan: string, subscriptionStatus: string) {
    setUpdating(companyId);
    await updateCompanySubscription(companyId, plan, subscriptionStatus);
    await loadCompanies();
    setUpdating(null);
  }

  async function handleDelete(companyId: string, name: string) {
    if (!confirm(`⚠️ Supprimer définitivement "${name}" et TOUTES ses données ? Cette action est irréversible.`)) return;
    setUpdating(companyId);
    await deleteCompany(companyId);
    await loadCompanies();
    setUpdating(null);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"><CheckCircle className="w-3 h-3" /> Actif</span>;
      case 'PENDING':
        return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"><Clock className="w-3 h-3" /> En attente</span>;
      case 'EXPIRED':
        return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"><XCircle className="w-3 h-3" /> Expiré</span>;
      default:
        return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400"><XCircle className="w-3 h-3" /> Annulé</span>;
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto py-12 flex justify-center items-center">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (session?.user?.email !== PLATFORM_OWNER_EMAIL) return null;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin</h1>
          </div>
          <p className="text-gray-500 dark:text-slate-400">Gérez tous les comptes et abonnements de la plateforme GESTORA</p>
        </div>
        <button onClick={loadCompanies} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Boutiques', value: companies.length, color: 'blue' },
          { label: 'Abonnements Actifs', value: companies.filter(c => c.subscriptionStatus === 'ACTIVE').length, color: 'emerald' },
          { label: 'En attente paiement', value: companies.filter(c => c.subscriptionStatus === 'PENDING').length, color: 'amber' },
          { label: 'Expirés / Annulés', value: companies.filter(c => ['EXPIRED', 'CANCELLED'].includes(c.subscriptionStatus)).length, color: 'red' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-[#162032] rounded-2xl p-5 border border-gray-200 dark:border-slate-700/50 shadow-sm">
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-1">{kpi.label}</p>
            <p className={`text-3xl font-black text-${kpi.color}-600 dark:text-${kpi.color}-400`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Companies Table */}
      <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700/50 flex items-center gap-3 bg-gray-50/50 dark:bg-[#1E293B]/50">
          <Building2 className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          <h2 className="font-bold text-gray-900 dark:text-white">Boutiques Inscrites ({companies.length})</h2>
        </div>

        {companies.length === 0 ? (
          <div className="py-16 text-center text-gray-500 dark:text-slate-400">Aucune boutique inscrite pour le moment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-slate-400 uppercase bg-gray-50 dark:bg-[#1E293B]/50 border-b border-gray-200 dark:border-slate-700/50">
                <tr>
                  <th className="px-5 py-3 font-semibold">Boutique</th>
                  <th className="px-5 py-3 font-semibold">Admin</th>
                  <th className="px-5 py-3 font-semibold">Statut</th>
                  <th className="px-5 py-3 font-semibold">Plan</th>
                  <th className="px-5 py-3 font-semibold">Modifier Abonnement</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(company => {
                  const [localPlan, setLocalPlan] = useState(company.plan);
                  const [localStatus, setLocalStatus] = useState(company.subscriptionStatus);
                  return (
                    <tr key={company.id} className="border-b border-gray-100 dark:border-slate-800/60 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900 dark:text-white">{company.name}</div>
                        <div className="text-xs text-gray-400 dark:text-slate-500">
                          {new Date(company.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-slate-300">
                        {company.users?.[0] ? (
                          <div>
                            <div className="font-medium">{company.users[0].firstName} {company.users[0].lastName}</div>
                            <div className="text-xs text-gray-400">{company.users[0].email}</div>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-4">{getStatusBadge(company.subscriptionStatus)}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded-full text-xs font-bold">{company.plan}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={localPlan}
                            onChange={e => setLocalPlan(e.target.value)}
                            className="text-xs border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-[#0A1226] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                          <select
                            value={localStatus}
                            onChange={e => setLocalStatus(e.target.value)}
                            className="text-xs border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-[#0A1226] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button
                            onClick={() => handleUpdate(company.id, localPlan, localStatus)}
                            disabled={updating === company.id}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                          >
                            {updating === company.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                            Enregistrer
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDelete(company.id, company.name)}
                          disabled={updating === company.id}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Supprimer cette boutique"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
