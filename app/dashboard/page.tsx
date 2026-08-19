"use client";

import { TrendingUp, Wallet, Receipt, Package, ArrowUpRight, ArrowDownRight, AlertTriangle, Users, Calendar, Loader2 } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { getDashboardStats } from "../actions/dashboardActions";
import { SkeletonKPICard, SkeletonChart } from "../../../components/Skeletons";

const COLORS = ['#2563EB', '#06B6D4', '#F5A623'];

export default function DashboardPage() {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState("votre");
  const [dateFilter, setDateFilter] = useState("30days");
  
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    revenue: 0,
    pending: 0,
    overdue: 0,
    newCustomers: 0,
    areaData: [],
    pieData: [],
    barData: [],
    topSellingProducts: []
  });

  useEffect(() => {
    setMounted(true);
    if (session?.user?.name) {
      const parts = session.user.name.split(' ');
      setUserName(`l'activité de ${parts[0]}`);
    }
  }, [session]);

  const dateRange = useMemo(() => {
    const end = new Date();
    let start = new Date();
    switch (dateFilter) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case '7days':
        start.setDate(end.getDate() - 7);
        break;
      case 'thisMonth':
        start.setDate(1);
        break;
      case '30days':
        start.setDate(end.getDate() - 30);
        break;
      case 'thisYear':
        start.setMonth(0, 1);
        break;
      case 'all':
        start = new Date('2000-01-01');
        break;
    }
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }, [dateFilter]);

  useEffect(() => {
    const fetchStats = async () => {
      if (session?.user?.companyId) {
        setIsLoading(true);
        const res = await getDashboardStats(
          session.user.companyId, 
          dateFilter !== 'all' ? dateRange.startDate : undefined, 
          dateRange.endDate
        );
        if (res.success && res.data) {
          setStats(res.data);
        }
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [session?.user?.companyId, dateRange, dateFilter]);

  const isDark = mounted ? theme === 'dark' : true; 
  
  const tooltipStyle = isDark 
    ? { backgroundColor: '#0A1226', borderColor: '#334155', borderRadius: '8px', color: '#fff' }
    : { backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a' };
    
  const axisColor = isDark ? "#475569" : "#94a3b8";
  
  const formatMoney = (val: number) => new Intl.NumberFormat('fr-FR').format(val) + ' F';

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-1">Tableau de bord</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">Aperçu de {userName} — Votre plateforme est prête</p>
        </div>
        <div className="relative">
          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="appearance-none bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 py-2.5 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium cursor-pointer min-w-[160px]"
          >
            <option value="today">Aujourd'hui</option>
            <option value="7days">7 derniers jours</option>
            <option value="thisMonth">Ce mois</option>
            <option value="30days">30 derniers jours</option>
            <option value="thisYear">Cette année</option>
            <option value="all">Historique complet</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-slate-400">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="w-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonKPICard />
            <SkeletonKPICard />
            <SkeletonKPICard />
          </div>
          <SkeletonChart />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SkeletonChart className="h-[300px]" />
            <SkeletonChart className="h-[300px]" />
            <SkeletonChart className="h-[300px]" />
          </div>
        </div>
      ) : (
        <>
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* KPI 1 */}
            <div className="group bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-default">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium">Chiffre d&apos;affaires</h3>
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{formatMoney(stats.revenue)}</p>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
                 Données réelles
              </p>
            </div>

            {/* KPI 2 */}
            <div className="group bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-default">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium">Dépenses Totales</h3>
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{formatMoney(stats.expenses)}</p>
              <p className="text-xs font-medium text-gray-400 dark:text-slate-500 flex items-center">
                Achats et frais
              </p>
            </div>

            {/* KPI 3 */}
            <div className="group bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-default">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium">Bénéfice Net</h3>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{formatMoney(stats.netProfit)}</p>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
                Marge générée
              </p>
            </div>

          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 gap-4 lg:h-[400px]">
            
            {/* AREA CHART */}
            <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm flex flex-col h-[300px] lg:h-auto transition-colors duration-300">
              <div className="mb-4">
                <h3 className="text-gray-900 dark:text-white font-bold mb-1">Évolution des ventes et bénéfices</h3>
                <p className="text-gray-500 dark:text-slate-400 text-xs">Données des 7 derniers mois</p>
              </div>
              <div className="flex-1 w-full min-h-0 [&_.recharts-wrapper]:outline-none">
                {mounted && stats.areaData.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%" className="focus:outline-none">
                    <AreaChart data={stats.areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorBenef" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={axisColor} opacity={0.15} />
                      <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => formatMoney(value)} />
                      <Area type="monotone" dataKey="ventes" name="Ventes" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorVentes)" />
                      <Area type="monotone" dataKey="benefices" name="Bénéfices (est.)" stroke="#06B6D4" strokeWidth={3} fillOpacity={1} fill="url(#colorBenef)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
                {stats.areaData.length === 0 && (
                   <div className="w-full h-full flex items-center justify-center text-gray-400">Aucune donnée</div>
                )}
              </div>
            </div>

          </div>

          {/* NEW SECTION: POPULAR PRODUCTS, LOW STOCK, TOP CLIENTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* PRODUITS POPULAIRES */}
            <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm transition-colors duration-300 flex flex-col h-[300px]">
              <div className="mb-4">
                <h3 className="text-gray-900 dark:text-white font-bold mb-1">Produits populaires</h3>
                <p className="text-gray-500 dark:text-slate-400 text-xs">Unités vendues sur la période</p>
              </div>
              <div className="flex-1 w-full min-h-0 [&_.recharts-wrapper]:outline-none">
                {mounted && stats.barData.length > 0 && stats.barData[0].name !== 'Aucun' ? (
                  <ResponsiveContainer width="100%" height="100%" className="focus:outline-none">
                    <BarChart data={stats.barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={axisColor} opacity={0.1} />
                      <XAxis type="number" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} width={80} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{fill: isDark ? '#1e293b' : '#f1f5f9'}} />
                      <Bar dataKey="ventes" name="Vendus" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-400">Aucune vente</div>
                )}
              </div>
            </div>

            {/* STOCKS FAIBLES */}
            <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm transition-colors duration-300 flex flex-col h-[300px] overflow-hidden">
              <div className="mb-4 shrink-0">
                <h3 className="text-gray-900 dark:text-white font-bold mb-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                  Stocks faibles
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-xs">À réapprovisionner</p>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                  stats.lowStockProducts.map((product: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{product.name}</p>
                      </div>
                      <div className="px-2.5 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-black">
                        {product.stock}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 dark:text-slate-500 text-sm text-center">
                    Aucun produit en stock critique
                  </div>
                )}
              </div>
            </div>

            {/* PRODUITS LES MIEUX VENDUS (Replaces MEILLEURS CLIENTS) */}
            <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm transition-colors duration-300 flex flex-col h-[300px] overflow-hidden">
              <div className="mb-4 shrink-0">
                <h3 className="text-gray-900 dark:text-white font-bold mb-1 flex items-center">
                  <Package className="w-4 h-4 mr-2 text-blue-500" />
                  Produits les mieux vendus
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-xs">Articles les plus demandés</p>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                {stats.topSellingProducts && stats.topSellingProducts.length > 0 ? stats.topSellingProducts.map((product: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-slate-800/30 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-blue-500'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{product.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{product.ventes} vendus</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-gray-500 py-10">Aucun produit vendu</div>
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
