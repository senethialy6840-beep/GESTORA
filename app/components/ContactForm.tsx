"use client";

import React, { useState, FormEvent } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ContactFormProps {
  /** Variante de style selon le contexte */
  variant?: 'landing' | 'dashboard';
}

export default function ContactForm({ variant = 'landing' }: ContactFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    subject: 'Demande générale',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Une erreur est survenue.');
      }

      setStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        subject: 'Demande générale',
        message: '',
      });

      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const inputBg = variant === 'landing'
    ? 'bg-white dark:bg-[#0A1226]'
    : 'bg-gray-50 dark:bg-[#0A1226]';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {status === 'success' && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Message envoyé avec succès ! Un email de confirmation vous a été envoyé.
          </p>
        </div>
      )}

      {/* Error Message */}
      {status === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Prénom *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-4 py-3 ${inputBg} text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none transition-all`}
            placeholder="Votre prénom"
            required
            disabled={status === 'loading'}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Nom *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-4 py-3 ${inputBg} text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none transition-all`}
            placeholder="Votre nom"
            required
            disabled={status === 'loading'}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Téléphone *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-4 py-3 ${inputBg} text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none transition-all`}
            placeholder="Votre numéro de téléphone"
            required
            disabled={status === 'loading'}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 ${inputBg} text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none transition-all`}
            placeholder="Adresse e-mail"
            required
            disabled={status === 'loading'}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Sujet de la demande *</label>
        <select
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className={`w-full px-4 py-3 ${inputBg} text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none transition-all appearance-none`}
          required
          disabled={status === 'loading'}
        >
          <option>Demande générale</option>
          <option>Problème technique</option>
          <option>Question sur les tarifs</option>
          <option>Demande de fonctionnalité</option>
          <option>Partenariat</option>
          <option>Autre demande</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Message *</label>
        <textarea
          rows={6}
          name="message"
          value={formData.message}
          onChange={handleChange}
          className={`w-full px-4 py-3 ${inputBg} text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none transition-all resize-none`}
          placeholder="Votre message ici..."
          required
          disabled={status === 'loading'}
        />
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-1 disabled:hover:translate-y-0 disabled:hover:shadow-md flex justify-center items-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Envoyer le message
          </>
        )}
      </button>
    </form>
  );
}
