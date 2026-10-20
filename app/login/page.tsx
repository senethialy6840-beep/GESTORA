"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Box, LayoutDashboard, LineChart, ShoppingCart, Eye, EyeOff, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'OAuthSignin' || error === 'OAuthCallback') {
      setErrorMsg("Impossible de se connecter avec Google. Veuillez vérifier vos identifiants ou réessayer.");
    } else if (error) {
      setErrorMsg("Erreur d'authentification. Veuillez réessayer.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
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
    } catch (err: any) {
      setErrorMsg(err.message || "Une erreur est survenue.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err: any) {
      setErrorMsg("Une erreur est survenue lors de la connexion Google.");
      setIsGoogleLoading(false);
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

          {/* Bouton Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="w-full py-3.5 px-4 bg-white dark:bg-[#162032] hover:bg-gray-50 dark:hover:bg-slate-800/80 text-gray-700 dark:text-slate-200 font-bold rounded-xl border border-gray-200 dark:border-slate-700/60 shadow-sm transition-all hover:shadow flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mb-6 cursor-pointer"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin text-[#2563EB]" />
                Connexion avec Google...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continuer avec Google
              </>
            )}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#0A1226] px-3 text-gray-500 dark:text-slate-400 font-semibold tracking-wider">
                ou par email
              </span>
            </div>
          </div>

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
              disabled={isLoading || isGoogleLoading}
              className="w-full py-3.5 px-4 bg-[#0A1226] dark:bg-[#2563EB] hover:bg-slate-800 dark:hover:bg-blue-600 text-white font-bold rounded-xl shadow-sm transition-all hover:shadow-md flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-[#0A1226] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
