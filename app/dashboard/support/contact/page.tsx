"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ContactForm from '@/app/components/ContactForm';

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
          <p className="text-gray-500 dark:text-slate-400 mt-1">Avez-vous des questions ou besoin d&apos;aide ? Nous sommes juste à un message.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#162032] p-8 rounded-[2rem] border border-gray-100 dark:border-slate-700/50 shadow-sm">
        <ContactForm variant="dashboard" />
      </div>
    </div>
  );
}
