"use client";

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Box, LayoutDashboard, LineChart, ShoppingCart, Eye, EyeOff, Loader2 } from 'lucide-react';
import { registerUser, getCommercialByRef, isGoogleAuthConfigured } from '../actions/authActions';
import { signIn } from 'next-auth/react';

function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [commercialName, setCommercialName] = useState<string | null>(null);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentLink = searchParams.get('paymentLink');
  const plan = searchParams.get('plan');
  const billingCycle = searchParams.get('billingCycle');

  const refParam = searchParams.get('ref');

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'OAuthSignin' || error === 'OAuthCallback') {
      setErrorMsg("Impossible de s'inscrire avec Google. Veuillez réessayer ou utiliser le formulaire ci-dessous.");
    }
  }, [searchParams]);

  useEffect(() => {
    const ref = refParam || localStorage.getItem('gestora_ref');
    if (ref) {
      if (refParam) {
        localStorage.setItem('gestora_ref', refParam);
        document.cookie = `gestora_ref=${refParam}; path=/; max-age=604800; SameSite=Lax`;
      }
      getCommercialByRef(ref).then(res => {
        if (res.success && res.name) {
          setCommercialName(res.name);
        }
      });
    }
  }, [refParam]);

  const handleGoogleSignUp = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);
    try {
      const isConfigured = await isGoogleAuthConfigured();
      if (!isConfigured) {
        setErrorMsg("L'inscription avec Google n'est pas encore configurée : les identifiants Google OAuth doivent être renseignés dans les variables d'environnement. Veuillez remplir le formulaire ci-dessous pour créer votre compte.");
        setIsGoogleLoading(false);
        return;
      }
      const ref = refParam || (typeof window !== 'undefined' ? localStorage.getItem('gestora_ref') : null);
      if (ref) {
        document.cookie = `gestora_ref=${ref}; path=/; max-age=604800; SameSite=Lax`;
      }
      await signIn("google", { callbackUrl: "/register/plans" });
    } catch (err: any) {
      setErrorMsg("Une erreur est survenue lors de l'inscription Google.");
      setIsGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const referralCode = refParam || localStorage.getItem('gestora_ref') || undefined;
      const res = await registerUser({ prenom, nom, entreprise, email, motDePasse, referralCode });
      
      if (res.error || !res.companyId) {
        setErrorMsg(res.error || "Une erreur est survenue.");
        setIsLoading(false);
        return;
      }

      // Log the user in after registration (in background)
      await signIn("credentials", {
        email,
        password: motDePasse,
        redirect: false
      });

      // Redirect to the plans selection page
      router.push('/register/plans');
      
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

          {commercialName && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-xl text-sm font-medium flex items-center">
              <span className="mr-2">🤝</span>
              Vous avez été invité par <strong className="ml-1">{commercialName}</strong>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {/* Bouton Google Inscription */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading || isLoading}
            className="w-full py-3.5 px-4 bg-white dark:bg-[#162032] hover:bg-gray-50 dark:hover:bg-slate-800/80 text-gray-700 dark:text-slate-200 font-bold rounded-xl border border-gray-200 dark:border-slate-700/60 shadow-sm transition-all hover:shadow flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mb-6 cursor-pointer"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin text-[#2563EB]" />
                Inscription avec Google...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                S'inscrire avec Google
              </>
            )}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#0A1226] px-3 text-gray-500 dark:text-slate-400 font-semibold tracking-wider">
                ou inscription par email
              </span>
            </div>
          </div>

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
