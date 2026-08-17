"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from "next-themes";

const data = [
  { name: '25 juil.', revenus: 0, depenses: 0 },
  { name: '29 juil.', revenus: 0, depenses: 0 },
];

export default function ReportsPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? theme === 'dark' : true;
  
  const tooltipStyle = isDark 
    ? { backgroundColor: '#0A1226', borderColor: '#334155', borderRadius: '8px', color: '#fff' }
    : { backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a' };
    
  const axisColor = isDark ? "#475569" : "#94a3b8";
  const colorRevenus = "#2563EB"; // Couleur bleue de l'icône de profil (blue-600)
  const colorDepenses = "#0A1226"; // Couleur de fond du mode sombre

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
          <select className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer shadow-sm">
            <option>30 derniers jours</option>
            <option>7 derniers jours</option>
            <option>Ce mois-ci</option>
            <option>Cette année</option>
          </select>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm transition-colors duration-300">
          <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium mb-4">Revenus</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">0 FCFA</p>
        </div>
        
        <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm transition-colors duration-300">
          <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium mb-4">Dépenses</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">0 FCFA</p>
        </div>
        
        <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm transition-colors duration-300">
          <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium mb-4">Marge nette</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">0 FCFA</p>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm mt-8 transition-colors duration-300">
        <h3 className="text-gray-900 dark:text-white font-bold mb-6">Revenus vs dépenses</h3>
        
        <div className="w-full h-[400px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} domain={[0, 4]} tickCount={5} />
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
      </div>

    </div>
  );
}
