"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SkeletonKPICard, SkeletonChart } from '../../../components/Skeletons';
import { useTheme } from "next-themes";
import { useSession } from 'next-auth/react';
import { getSales } from '../../actions/saleActions';
import { getPurchases } from '../../actions/purchaseActions';
import { Loader2 } from 'lucide-react';

export default function ReportsPage() {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState('Aujourd\'hui');
  const [sales, setSales] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.companyId) {
        setIsLoading(true);
        const [salesRes, purchasesRes] = await Promise.all([
          getSales(session.user.companyId),
          getPurchases(session.user.companyId)
        ]);
        if (salesRes.success) setSales(salesRes.data || []);
        if (purchasesRes.success) setPurchases(purchasesRes.data || []);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [session?.user?.companyId]);

  const isDark = mounted ? theme === 'dark' : true;
  
  const tooltipStyle = isDark 
    ? { backgroundColor: '#0A1226', borderColor: '#334155', borderRadius: '8px', color: '#fff' }
    : { backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a' };
    
  const axisColor = isDark ? "#475569" : "#94a3b8";
  const colorRevenus = "#2563EB"; 
  const colorDepenses = "#0A1226"; 

  // Filtrer les données en fonction de la période sélectionnée
  const now = new Date();
  const filterDate = (dateString: string) => {
    const d = new Date(dateString);
    if (timeRange === "Aujourd'hui") {
      return d.toDateString() === now.toDateString();
    }
    if (timeRange === "7 derniers jours") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo;
    }
    if (timeRange === "30 derniers jours") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return d >= monthAgo;
    }
    if (timeRange === "Ce mois-ci") {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (timeRange === "Cette année") {
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filteredSales = sales.filter(s => filterDate(s.createdAt));
  const filteredPurchases = purchases.filter(p => filterDate(p.createdAt));

  const totalRevenus = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalDepenses = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const margeNette = totalRevenus - totalDepenses;

  // Préparer les données pour le graphique (groupées par date)
  const chartDataMap: Record<string, { revenus: number; depenses: number }> = {};
  
  // Par défaut, si c'est aujourd'hui, on montre juste "Aujourd'hui"
  if (timeRange === "Aujourd'hui") {
    chartDataMap["Aujourd'hui"] = { revenus: totalRevenus, depenses: totalDepenses };
  } else {
    filteredSales.forEach(s => {
      const d = new Date(s.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      if (!chartDataMap[d]) chartDataMap[d] = { revenus: 0, depenses: 0 };
      chartDataMap[d].revenus += s.totalAmount;
    });
    filteredPurchases.forEach(p => {
      const d = new Date(p.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      if (!chartDataMap[d]) chartDataMap[d] = { revenus: 0, depenses: 0 };
      chartDataMap[d].depenses += p.totalAmount;
    });
  }

  const chartData = Object.keys(chartDataMap).map(k => ({
    name: k,
    revenus: chartDataMap[k].revenus,
    depenses: chartDataMap[k].depenses
  }));

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonKPICard />
          <SkeletonKPICard />
          <SkeletonKPICard />
        </div>
        <SkeletonChart className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Rapports</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            Analyse consolidée de votre activité sur la période sélectionnée.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer shadow-sm"
          >
            <option>Aujourd'hui</option>
            <option>7 derniers jours</option>
            <option>30 derniers jours</option>
            <option>Ce mois-ci</option>
            <option>Cette année</option>
          </select>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm transition-colors duration-300">
          <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium mb-4">Revenus</h3>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">+{totalRevenus.toLocaleString('fr-FR')} FCFA</p>
        </div>
        
        <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm transition-colors duration-300">
          <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium mb-4">Dépenses</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">-{totalDepenses.toLocaleString('fr-FR')} FCFA</p>
        </div>
        
        <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm transition-colors duration-300">
          <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium mb-4">Marge nette</h3>
          <p className={`text-2xl font-bold ${margeNette >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
            {margeNette.toLocaleString('fr-FR')} FCFA
          </p>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm mt-8 transition-colors duration-300">
        <h3 className="text-gray-900 dark:text-white font-bold mb-6">Revenus vs dépenses</h3>
        
        {chartData.length === 0 ? (
           <div className="h-[400px] flex items-center justify-center text-gray-500">Aucune donnée pour cette période.</div>
        ) : (
          <div className="w-full h-[400px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} tickCount={5} />
                  <Tooltip 
                    cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }}
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: isDark ? '#fff' : '#0f172a' }}
                    formatter={(value: any, name: any) => [`${value} F CFA`, name]}
                  />
                  <Legend iconType="square" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="revenus" fill={colorRevenus} barSize={40} />
                  <Bar dataKey="depenses" fill={colorDepenses} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
