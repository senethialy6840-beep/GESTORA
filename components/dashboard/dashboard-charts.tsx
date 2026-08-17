"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const barData = [
  { name: 'J1', ventes: 45 },
  { name: 'J2', ventes: 62 },
  { name: 'J3', ventes: 55 },
  { name: 'J4', ventes: 75 },
  { name: 'J5', ventes: 80 },
  { name: 'J6', ventes: 90 },
  { name: 'J7', ventes: 70 },
];

const pieData = [
  { name: 'Catégorie A', value: 400, color: '#4338CA' },
  { name: 'Catégorie B', value: 300, color: '#10B981' },
  { name: 'Catégorie C', value: 300, color: '#F5A623' },
  { name: 'Catégorie D', value: 200, color: '#F97066' },
];

export function VentesBarChart() {
  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Bar dataKey="ventes" radius={[4, 4, 0, 0]}>
            {barData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4338CA' : '#10B981'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RepartitionPieChart() {
  return (
    <div className="h-64 w-full mt-4 flex items-center justify-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold text-foreground">82%</span>
        <span className="text-xs text-success font-medium">+11% cette semaine</span>
      </div>
    </div>
  );
}
