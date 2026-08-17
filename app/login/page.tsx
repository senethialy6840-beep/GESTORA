"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Box, LayoutDashboard, LineChart, ShoppingCart, Eye, EyeOff, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (res?.error) {
        setErrorMsg("Identifiants incorrects.");
        setIsLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setErrorMsg("Une erreur est survenue.");
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

        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center mb-8">
            <span className="text-3xl font-display font-black tracking-tight text-[#2563EB]">GEST</span>
            <span className="text-3xl font-display font-black tracking-tight text-gray-900 dark:text-white">ORA.</span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Bon retour ! 👋</h1>
          <p className="text-gray-500 dark:text-slate-400 mb-6 font-medium">Connectez-vous pour accéder à votre tableau de bord.</p>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
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
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300">Mot de passe</label>
                <Link href="/forgot-password" className="text-sm font-semibold text-[#2563EB] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Mot de passe oublié ?</Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
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
              className="w-full py-3.5 px-4 bg-[#0A1226] dark:bg-[#2563EB] hover:bg-slate-800 dark:hover:bg-blue-600 text-white font-bold rounded-xl shadow-sm transition-all hover:shadow-md flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-slate-400 font-medium">
            Vous n'avez pas de compte ?{' '}
            <Link href="/register" className="font-bold text-[#2563EB] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Créer un compte</Link>
          </p>
        </div>
      </div>

      {/* Right Column: Visual */}
      <div className="hidden lg:flex w-1/2 bg-[#0A1226] relative overflow-hidden flex-col justify-center items-center p-12">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        
        <div className="relative z-10 w-full max-w-lg">
          <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
            Gérez tout, <br />
            <span className="text-[#2563EB]">depuis un seul endroit.</span>
          </h2>
          <p className="text-lg text-gray-400 mb-12">
            La solution ERP n°1 pour les PME et commerces modernes.
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
