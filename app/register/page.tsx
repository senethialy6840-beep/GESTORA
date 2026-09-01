"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Box, LayoutDashboard, LineChart, ShoppingCart, Eye, EyeOff, Loader2 } from 'lucide-react';
import { registerUser } from '../actions/authActions';
import { signIn } from 'next-auth/react';

function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await registerUser({ prenom, nom, entreprise, email, motDePasse });
      
      if (res.error) {
        setErrorMsg(res.error);
        setIsLoading(false);
        return;
      }

      // Log the user in after registration
      const signInRes = await signIn("credentials", {
        email,
        password: motDePasse,
        redirect: false
      });

      if (signInRes?.error) {
        setErrorMsg("Erreur de connexion automatique.");
        setIsLoading(false);
      } else {
        // Redirection logique en fonction du plan
        if (plan === 'STARTUP' && process.env.NEXT_PUBLIC_SASPAY_STARTUP_LINK) {
          window.location.href = process.env.NEXT_PUBLIC_SASPAY_STARTUP_LINK;
        } else if (plan === 'BUSINESS' && process.env.NEXT_PUBLIC_SASPAY_BUSINESS_LINK) {
          window.location.href = process.env.NEXT_PUBLIC_SASPAY_BUSINESS_LINK;
        } else if (plan === 'ENTERPRISE' && process.env.NEXT_PUBLIC_SASPAY_ENTERPRISE_LINK) {
          window.location.href = process.env.NEXT_PUBLIC_SASPAY_ENTERPRISE_LINK;
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch (err) {
      setErrorMsg("Une erreur inattendue est survenue.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A1226] flex transition-colors duration-300">
      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex flex-col px-8 sm:px-16 md:px-24 py-12 justify-center relative bg-white dark:bg-[#0A1226] transition-colors duration-300">
        <Link href="/" className="absolute top-8 left-8 sm:left-12 flex items-center text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Link>

        <div className="max-w-md w-full mx-auto mt-10">
          <div className="flex items-center mb-8">
            <span className="text-3xl font-display font-black tracking-tight text-[#2563EB]">GEST</span>
            <span className="text-3xl font-display font-black tracking-tight text-gray-900 dark:text-white">ORA.</span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Créer un compte 🚀</h1>
          <p className="text-gray-500 dark:text-slate-400 mb-6 font-medium">Rejoignez des milliers de commerçants qui utilisent GESTORA.</p>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Prénom</label>
                <input 
                  type="text" 
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Hamid"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all bg-gray-50 dark:bg-[#162032] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Nom</label>
                <input 
                  type="text" 
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Gueye"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all bg-gray-50 dark:bg-[#162032] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Nom de l'entreprise</label>
              <input 
                type="text" 
                value={entreprise}
                onChange={(e) => setEntreprise(e.target.value)}
                placeholder="Ma Boutique"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all bg-gray-50 dark:bg-[#162032] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Adresse email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@entreprise.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all bg-gray-50 dark:bg-[#162032] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Mot de passe</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all bg-gray-50 dark:bg-[#162032] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-[#0A1226] dark:bg-[#2563EB] hover:bg-slate-800 dark:hover:bg-blue-600 text-white font-bold rounded-xl shadow-sm transition-all hover:shadow-md mt-2 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-slate-400 font-medium">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="font-bold text-[#2563EB] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Connectez-vous</Link>
          </p>
        </div>
      </div>

      {/* Right Column: Visual */}
      <div className="hidden lg:flex w-1/2 bg-[#0A1226] relative overflow-hidden flex-col justify-center items-center p-12">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        
        <div className="relative z-10 w-full max-w-lg">
          <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
            Commencez à optimiser <br />
            <span className="text-[#10B981]">votre gestion aujourd'hui.</span>
          </h2>
          <p className="text-lg text-gray-400 mb-12">
            Rejoignez l'ERP nouvelle génération pour l'Afrique. 
            Sans carte de crédit, essai gratuit de 14 jours.
          </p>

          <div className="grid gap-4">
             <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center backdrop-blur-sm">
               <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mr-5">
                 <Box className="w-6 h-6" />
               </div>
               <div>
                 <h4 className="text-white font-bold mb-1">Gestion intelligente</h4>
                 <p className="text-sm text-gray-400">Automatisez vos stocks et vos ventes.</p>
               </div>
             </div>
             <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center backdrop-blur-sm">
               <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mr-5">
                 <LineChart className="w-6 h-6" />
               </div>
               <div>
                 <h4 className="text-white font-bold mb-1">Analyses en temps réel</h4>
                 <p className="text-sm text-gray-400">Suivez la rentabilité de votre activité.</p>
               </div>
             </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-[#0A1226] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
