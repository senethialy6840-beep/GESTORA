"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/support"
          className="p-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Contactez-nous</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Avez-vous des questions ou besoin d’aide ? Nous sommes juste à un message.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#162032] p-8 rounded-[2rem] border border-gray-100 dark:border-slate-700/50 shadow-sm">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Prénom *</label>
              <input type="text" className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none transition-all" placeholder="Votre prénom" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Nom *</label>
              <input type="text" className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none transition-all" placeholder="Votre nom" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Téléphone *</label>
              <input type="tel" className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none transition-all" placeholder="Votre numéro de téléphone" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Email *</label>
              <input type="email" className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none transition-all" placeholder="Adresse e-mail" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Sujet de la demande *</label>
            <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none transition-all appearance-none" required>
              <option>Demande générale</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Message</label>
            <textarea rows={6} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0A1226] text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none transition-all resize-none" placeholder="Votre message ici..." required></textarea>
          </div>
          <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-1 flex justify-center items-center gap-2">
            <Send className="w-5 h-5" />
            Envoyer le message
          </button>
        </form>
      </div>
    </div>
  );
}
