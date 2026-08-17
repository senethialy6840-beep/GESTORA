"use client";

import React, { useState, useEffect } from 'react';
import { Users2, Plus, Search, Edit, Trash2, Shield, UserCog, UserCheck, UserX } from 'lucide-react';
import { EmployeeModal } from '../../../components/EmployeeModal';

export default function HrPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gestora_hr');
    if (saved) {
      try {
        setEmployees(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing hr from local storage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever employees changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('gestora_hr', JSON.stringify(employees));
    }
  }, [employees, isLoaded]);

  const handleSaveEmployee = (newItem: any) => {
    if (editingItem) {
      setEmployees(prev => prev.map(p => p.id === newItem.id ? newItem : p));
    } else {
      setEmployees(prev => [newItem, ...prev]);
    }
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(p => p.id !== id));
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400">
            <Shield className="w-3 h-3 mr-1" /> Admin
          </span>
        );
      case 'MANAGER':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400">
            <UserCog className="w-3 h-3 mr-1" /> Manager
          </span>
        );
      case 'SALES':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
            Commercial
          </span>
        );
      case 'CASHIER':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300">
            Caissier(e)
          </span>
        );
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ressources Humaines</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Gérez votre équipe et leurs accès</p>
        </div>
        <button 
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un employé
        </button>
      </div>

      {employees.length === 0 ? (
        // Empty State
        <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 p-5 shadow-sm transition-colors duration-300">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
              <Users2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucun employé ajouté</h3>
            <p className="text-gray-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              Invitez vos collaborateurs et gérez leurs permissions depuis cet espace centralisé.
            </p>
            <button 
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Ajouter un collaborateur
            </button>
          </div>
        </div>
      ) : (
        // Employees Table Area
        <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 shadow-sm transition-colors duration-300 overflow-hidden">
          
          {/* Table Controls */}
          <div className="p-5 border-b border-gray-200 dark:border-slate-700/50 flex justify-between items-center bg-gray-50/50 dark:bg-[#1E293B]/50">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Rechercher un employé..." 
                className="w-full bg-white dark:bg-[#0A1226] border border-gray-200 dark:border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-slate-200 placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-slate-400">
              <thead className="text-xs text-gray-700 dark:text-slate-300 uppercase bg-gray-50 dark:bg-[#1E293B]/50 border-b border-gray-200 dark:border-slate-700/50">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Employé</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Rôle</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Date d'ajout</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Statut</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((item) => (
                  <tr key={item.id} className="bg-white dark:bg-[#162032] border-b border-gray-100 dark:border-slate-800/60 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3 uppercase font-bold text-sm">
                        {item.name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold">{item.name}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 font-normal">{item.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(item.role)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                      {new Date(item.dateJoined).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      {item.status === 'ACTIVE' ? (
                        <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                          <UserCheck className="w-4 h-4 mr-1" /> Actif
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600 dark:text-red-400 text-xs font-medium">
                          <UserX className="w-4 h-4 mr-1" /> Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEmployee(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* The Modal */}
      <EmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }} 
        onSave={handleSaveEmployee} 
        initialData={editingItem}
      />
    </div>
  );
}
