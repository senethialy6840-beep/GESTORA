"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { resetPassword } from '@/app/actions/authActions';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Jeton de réinitialisation manquant.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }

    setIsLoading(true);
    const res = await resetPassword(token, password);
    setIsLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } else {
      setError(res.error || 'Une erreur est survenue.');
    }
  };

  if (!token) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
        Le lien de réinitialisation est invalide ou manquant.
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-emerald-50 text-emerald-600 p-6 rounded-xl border border-emerald-200 text-center">
        <h3 className="font-bold text-xl mb-2">Mot de passe modifié !</h3>
        <p>Votre mot de passe a été mis à jour avec succès. Redirection vers la page de connexion...</p>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Nouveau mot de passe</label>
        <input 
          type="password" 
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all bg-gray-50 dark:bg-[#162032] text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Confirmer le mot de passe</label>
        <input 
          type="password" 
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all bg-gray-50 dark:bg-[#162032] text-gray-900 dark:text-white"
        />
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full flex items-center justify-center py-3.5 px-4 bg-[#0A1226] dark:bg-[#2563EB] hover:bg-slate-800 dark:hover:bg-blue-600 text-white font-bold rounded-xl shadow-sm transition-all hover:shadow-md disabled:opacity-70"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
        Réinitialiser mon mot de passe
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A1226] flex items-center justify-center p-4">
      <div className="max-w-md w-full relative bg-white dark:bg-[#162032] p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800">
        <Link href="/login" className="absolute top-8 left-8 flex items-center text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
        </Link>
        
        <div className="text-center mb-8 pt-6">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Nouveau mot de passe</h1>
          <p className="text-gray-500 dark:text-slate-400">Veuillez entrer votre nouveau mot de passe ci-dessous.</p>
        </div>

        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
