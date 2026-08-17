"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LayoutDashboard, LineChart } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A1226] flex transition-colors duration-300">
      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex flex-col px-8 sm:px-16 md:px-24 py-12 justify-center relative bg-white dark:bg-[#0A1226] transition-colors duration-300">
        <Link href="/login" className="absolute top-8 left-8 sm:left-12 flex items-center text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la connexion
        </Link>

        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center space-x-1 mb-10">
            <span className="text-3xl font-display font-black tracking-tight text-[#2563EB]">GEST</span>
            <span className="text-3xl font-display font-black tracking-tight text-gray-900 dark:text-white">ORA.</span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Mot de passe oublié ? 🔒</h1>
          <p className="text-gray-500 dark:text-slate-400 mb-8 font-medium">Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>

          {isSubmitted ? (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-6 rounded-xl border border-emerald-100 dark:border-emerald-500/20 mb-6">
              <h3 className="font-bold mb-2">Email envoyé !</h3>
              <p className="text-sm">Si un compte existe avec cette adresse, vous recevrez un email contenant les instructions de réinitialisation d'ici quelques minutes.</p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Adresse email</label>
                <input 
                  type="email" 
                  required
                  placeholder="vous@entreprise.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all bg-gray-50 dark:bg-[#162032] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                />
              </div>

              <button type="submit" className="w-full py-3.5 px-4 bg-[#0A1226] dark:bg-[#2563EB] hover:bg-slate-800 dark:hover:bg-blue-600 text-white font-bold rounded-xl shadow-sm transition-all hover:shadow-md">
                Envoyer le lien de réinitialisation
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-slate-400 font-medium">
            Vous vous souvenez de votre mot de passe ?{' '}
            <Link href="/login" className="font-bold text-[#2563EB] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Connectez-vous</Link>
          </p>
        </div>
      </div>

      {/* Right Column: Visual */}
      <div className="hidden lg:flex w-1/2 bg-[#0A1226] relative overflow-hidden flex-col justify-center items-center p-12">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        
        <div className="relative z-10 w-full max-w-lg">
          <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
            Pas de panique, <br />
            <span className="text-[#2563EB]">ça arrive à tout le monde.</span>
          </h2>
          <p className="text-lg text-gray-400 mb-12">
            Récupérez l'accès à votre ERP en quelques clics et reprenez le pilotage de votre entreprise.
          </p>

          {/* Decorative Mockup Elements */}
          <div className="relative w-full aspect-video bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex space-x-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="h-24 bg-white/10 rounded-xl flex items-center p-4">
                 <div className="w-10 h-10 bg-[#2563EB] rounded-lg flex items-center justify-center mr-4">
                   <LayoutDashboard className="w-5 h-5 text-white" />
                 </div>
                 <div>
                   <div className="h-2 w-16 bg-white/20 rounded-full mb-2"></div>
                   <div className="h-4 w-24 bg-white/40 rounded-full"></div>
                 </div>
               </div>
               <div className="h-24 bg-white/10 rounded-xl flex items-center p-4">
                 <div className="w-10 h-10 bg-[#10B981] rounded-lg flex items-center justify-center mr-4">
                   <LineChart className="w-5 h-5 text-white" />
                 </div>
                 <div>
                   <div className="h-2 w-16 bg-white/20 rounded-full mb-2"></div>
                   <div className="h-4 w-24 bg-white/40 rounded-full"></div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
