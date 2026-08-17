import Link from 'next/link';
import { MobileMenu } from './components/MobileMenu';
import { ThemeToggle } from './components/ThemeToggle';
import { PricingSection } from './components/PricingSection';
import { CheckCircle2, ArrowRight, LayoutDashboard, Calculator, ShoppingCart, Package, Users, BarChart3, ChevronDown, Mail, Phone, MapPin, Box, FileText, Truck, Settings, Users2, LineChart, DollarSign, Clock, MessageCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A1226] text-gray-900 dark:text-gray-100 font-sans selection:bg-brand/20 selection:text-brand transition-colors duration-300">
      {/* -------------------- NAVBAR -------------------- */}
      <header className="fixed top-0 w-full bg-white/90 dark:bg-[#0A1226]/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800/60 z-50 transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-6 h-20 lg:h-24 flex items-center justify-between">
          <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <span className="text-3xl font-display font-black tracking-tight text-[#2563EB]">GEST</span>
            <span className="text-3xl font-display font-black tracking-tight text-gray-900 dark:text-white">ORA.</span>
          </a>
          
          <div className="flex items-center space-x-4 lg:space-x-8">
            <nav className="hidden lg:flex items-center space-x-6 text-[15px] font-medium text-gray-600 dark:text-gray-300">
              <Link href="#fonctionnalites" className="hover:text-[#2563EB] transition-colors">Fonctionnalités</Link>
              <Link href="#tarification" className="hover:text-[#2563EB] transition-colors">Tarification</Link>
              <Link href="#faq" className="hover:text-[#2563EB] transition-colors">FAQ</Link>
              <ThemeToggle />
            </nav>
            <div className="hidden lg:flex items-center space-x-6">
              <Link href="#support" className="px-5 py-2.5 bg-[#0A1226] dark:bg-[#2563EB] text-white rounded-full font-bold text-sm lg:text-base hover:bg-slate-800 dark:hover:bg-blue-600 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">Contactez-nous</Link>
            </div>
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* -------------------- HERO SECTION -------------------- */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-[#FAFBFF] dark:bg-[#050B14] transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="relative z-10 max-w-xl">
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] leading-tight lg:leading-[1.1] font-extrabold text-[#1A1F2C] dark:text-white tracking-tight mb-4">
                Gestion complète de votre boutique<br/>
                <span className="text-[#2563EB]">Simplifiez votre gestion. Accélérez votre réussite.</span>
              </h1>
              
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                Optimisez votre inventaire, boostez vos ventes et gérez votre équipe avec notre plateforme de gestion de magasin tout-en-un.
              </p>



              {/* Colorful Icons Row */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100/50"><Box className="w-6 h-6" /></div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shadow-sm border border-purple-100/50"><ShoppingCart className="w-6 h-6" /></div>
                <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 shadow-sm border border-pink-100/50"><FileText className="w-6 h-6" /></div>
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm border border-orange-100/50"><Truck className="w-6 h-6" /></div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100/50"><BarChart3 className="w-6 h-6" /></div>
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-700 shadow-sm border border-gray-100/50"><Settings className="w-6 h-6" /></div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm border border-amber-100/50"><Users2 className="w-6 h-6" /></div>
              </div>

              <Link href="/login" className="inline-flex px-8 py-3.5 bg-[#0A1226] dark:bg-[#2563EB] hover:bg-slate-800 dark:hover:bg-blue-600 text-white text-[15px] font-medium rounded-full transition-all shadow-md hover:shadow-xl hover:scale-105">
                Se connecter
              </Link>
            </div>

            {/* Right Content - Mockup Floating Cards */}
            <div className="relative z-10 lg:h-[600px] w-full flex items-center justify-center">
              <div className="relative w-full max-w-[600px] aspect-square">
                
                {/* Background Card */}
                <div className="absolute inset-0 bg-white dark:bg-[#162032] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-200 dark:border-slate-700/50 p-6 overflow-x-auto scrollbar-hide transition-colors duration-300">
                   <div className="min-w-[450px]">
                   
                   {/* Top filters */}
                   <div className="flex space-x-2 mb-6">
                      <div className="px-4 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300">Tous les mois</div>
                      <div className="px-4 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300">Toutes les années ▾</div>
                      <div className="px-4 py-1.5 bg-[#2563EB] rounded-full text-xs font-semibold text-white">Filtrer</div>
                   </div>

                   <div className="flex gap-4 mb-6">
                      {/* Main blue card */}
                      <div className="flex-1 bg-gradient-to-r from-blue-400 to-blue-300 rounded-2xl p-5 text-white relative overflow-hidden">
                        <h3 className="font-bold text-lg mb-1">Bienvenue Franck</h3>
                        <p className="text-xs text-blue-100 mb-4">Voici les statiques du mois actuel</p>
                        <div className="flex space-x-6">
                          <div>
                            <p className="font-bold text-lg">805 000 FCFA</p>
                            <p className="text-[10px] text-blue-100">Nouveaux Prospects</p>
                          </div>
                          <div>
                            <p className="font-bold text-lg">2.322.896 FCFA</p>
                            <p className="text-[10px] text-blue-100">Valeur totale du stock</p>
                          </div>
                        </div>
                        {/* Illustration placeholder */}
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/20 rounded-tl-full blur-xl"></div>
                      </div>

                      {/* Small pink card */}
                      <div className="w-24 bg-pink-100 dark:bg-pink-900/30 rounded-2xl p-4 flex flex-col justify-center">
                         <div className="w-8 h-8 rounded-full bg-pink-200 dark:bg-pink-900/60 text-pink-500 dark:text-pink-400 flex items-center justify-center mb-2"><LineChart className="w-4 h-4" /></div>
                         <p className="font-bold text-sm text-gray-800 dark:text-white">0 / 7 <span className="text-[10px] text-pink-500 dark:text-pink-400">-100%</span></p>
                         <p className="text-[10px] text-gray-500 dark:text-gray-400">Ventes</p>
                      </div>

                      {/* Small blue card */}
                      <div className="w-24 bg-blue-100 dark:bg-blue-900/30 rounded-2xl p-4 flex flex-col justify-center">
                         <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-900/60 text-blue-500 dark:text-blue-400 flex items-center justify-center mb-2"><ShoppingCart className="w-4 h-4" /></div>
                         <p className="font-bold text-sm text-gray-800 dark:text-white">0 / 0 <span className="text-[10px] text-gray-500 dark:text-gray-400">%</span></p>
                         <p className="text-[10px] text-gray-500 dark:text-gray-400">Remboursements</p>
                      </div>
                      
                      {/* Small green card */}
                      <div className="w-24 bg-green-100 dark:bg-emerald-900/30 rounded-2xl p-4 flex flex-col justify-center">
                         <div className="w-8 h-8 rounded-full bg-green-200 dark:bg-emerald-900/60 text-green-500 dark:text-emerald-400 flex items-center justify-center mb-2"><DollarSign className="w-4 h-4" /></div>
                         <p className="font-bold text-sm text-gray-800 dark:text-white">0 FCFA <span className="text-[10px] text-gray-500 dark:text-gray-400">-100%</span></p>
                         <p className="text-[10px] text-gray-500 dark:text-gray-400">Revenus</p>
                      </div>
                   </div>

                   <div className="flex gap-4">
                     {/* Graph card */}
                     <div className="flex-1 bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Graphique des ventes</h4>
                        {/* Fake graph lines */}
                        <div className="w-full h-32 border-b border-l border-gray-100 dark:border-slate-800/60 relative">
                           <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                             <polyline points="0,90 20,70 40,80 60,30 80,40 100,10" fill="none" stroke="#2563EB" strokeWidth="2" />
                           </svg>
                        </div>
                     </div>
                     {/* Bar chart card */}
                     <div className="flex-1 bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Produits en ...</h4>
                        <div className="flex items-end justify-between h-32">
                           <div className="w-8 h-[80%] bg-[#2563EB] rounded-t-sm"></div>
                           <div className="w-8 h-[60%] bg-[#2563EB] rounded-t-sm"></div>
                           <div className="w-8 h-[90%] bg-[#2563EB] rounded-t-sm"></div>
                           <div className="w-8 h-[40%] bg-[#2563EB] rounded-t-sm"></div>
                           <div className="w-8 h-[70%] bg-[#2563EB] rounded-t-sm"></div>
                        </div>
                     </div>
                   </div>

                </div>
                </div>


                {/* Floating purple stats card */}
                <div className="hidden md:block absolute top-1/2 -left-4 lg:left-10 -translate-y-1/2">
                  <div className="animate-bounce-slow">
                    <div className="bg-purple-100 dark:bg-purple-900/80 rounded-3xl p-6 shadow-xl w-48 border border-purple-200/50 dark:border-purple-800 transform -rotate-6">
                       <div className="w-12 h-12 bg-purple-500 rounded-full text-white flex items-center justify-center mb-4 mx-auto shadow-md">
                         <LayoutDashboard className="w-5 h-5" />
                       </div>
                       <div className="text-center">
                         <p className="text-2xl font-black text-gray-800 dark:text-white">434 <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">-12%</span></p>
                         <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Remboursements</p>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Floating green earnings card */}
                <div className="hidden md:block absolute top-1/3 -right-6">
                  <div className="animate-bounce-slow" style={{ animationDelay: '1.5s' }}>
                    <div className="bg-emerald-100 dark:bg-emerald-900/80 rounded-3xl p-6 shadow-xl w-48 border border-emerald-200/50 dark:border-emerald-800 transform rotate-3">
                       <div className="w-10 h-10 bg-emerald-500 rounded-full text-white flex items-center justify-center mb-6 shadow-md">
                         <DollarSign className="w-5 h-5" />
                       </div>
                       <p className="text-3xl font-black text-gray-800 dark:text-white mb-1">160M FCFA <span className="text-xs bg-white dark:bg-emerald-950 text-emerald-500 dark:text-emerald-400 px-2 py-0.5 rounded-full">+8%</span></p>
                       <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Revenus</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------- PROBLEMES & DEFIS SECTION -------------------- */}
      <section className="py-24 bg-white dark:bg-[#0A1226] border-t border-gray-100 dark:border-slate-800 relative overflow-hidden transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
              Les petites erreurs d'aujourd'hui peuvent <span className="text-red-500">coûter cher</span> demain.
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              Une mauvaise gestion des stocks, des ventes et des opérations entraîne des pertes invisibles qui s'accumulent au fil du temps. Sans une vision claire de votre activité, il devient difficile de prendre les bonnes décisions et de développer votre entreprise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Defi 1 */}
            <div className="bg-white dark:bg-[#162032] p-8 rounded-3xl border border-gray-200 dark:border-slate-700/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Stocks imprécis & ruptures</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Perdez des ventes à cause de produits indisponibles ou d'un inventaire mal maîtrisé.</p>
            </div>
            
            {/* Defi 2 */}
            <div className="bg-white dark:bg-[#162032] p-8 rounded-3xl border border-gray-200 dark:border-slate-700/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Suivi manuel des ventes</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Les saisies manuelles augmentent les risques d'erreurs et ralentissent vos opérations.</p>
            </div>
            
            {/* Defi 3 */}
            <div className="bg-white dark:bg-[#162032] p-8 rounded-3xl border border-gray-200 dark:border-slate-700/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Manque de visibilité</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Accédez difficilement à vos ventes, vos bénéfices et vos performances en temps réel.</p>
            </div>
            
            {/* Defi 4 */}
            <div className="bg-white dark:bg-[#162032] p-8 rounded-3xl border border-gray-200 dark:border-slate-700/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-purple-100 text-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Tâches répétitives</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Passez moins de temps à rechercher des informations et plus de temps à développer votre entreprise.</p>
            </div>

            {/* Defi 5 */}
            <div className="bg-white dark:bg-[#162032] p-8 rounded-3xl border border-gray-200 dark:border-slate-700/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-pink-100 text-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Gestion complexe des équipes</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Contrôlez les accès, suivez les actions de vos collaborateurs et sécurisez vos données.</p>
            </div>

            {/* Solution Transition */}
            <div className="bg-[#2563EB] p-8 rounded-3xl text-white shadow-xl flex flex-col justify-center relative overflow-hidden group md:col-span-2 lg:col-span-1">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="text-2xl font-bold mb-3 relative z-10 flex items-start">
                 <CheckCircle2 className="w-7 h-7 mr-3 text-blue-200 shrink-0 mt-0.5" />
                 Avec GESTORA, tout est centralisé.
              </h3>
              <p className="text-blue-100 font-medium leading-relaxed relative z-10 text-sm">
                Suivez vos stocks, vos ventes, vos achats, vos clients et vos finances depuis une seule plateforme intelligente, conçue pour vous aider à gagner du temps, réduire les erreurs et prendre de meilleures décisions.
              </p>
              <div className="mt-6 relative z-10">
                 <Link href="#fonctionnalites" className="inline-flex items-center text-sm font-bold bg-[#0A1226] hover:bg-slate-800 text-white px-5 py-2.5 rounded-full transition-all shadow-sm">
                   Découvrir la solution <ArrowRight className="w-4 h-4 ml-2" />
                 </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- GESTION INTELLIGENTE SECTION -------------------- */}
      <section className="py-24 bg-white dark:bg-[#0A1226] relative overflow-hidden transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="order-2 lg:order-1 text-gray-900 dark:text-white">
              
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
                Gestion intelligente <br/>
                <span className="text-[#2563EB]">des stocks</span>
              </h2>
              
              <p className="text-[17px] text-gray-500 dark:text-gray-300 mb-10 leading-relaxed font-medium max-w-lg">
                Optimisez la gestion de vos produits avec un système intelligent et automatisé.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-[#2563EB] rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-blue-900/20 dark:shadow-blue-900/50">
                    <LineChart className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-1">Suivi en temps réel des stocks</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Visualisez vos niveaux de stock instantanément.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-[#F5A623] rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-orange-900/20 dark:shadow-orange-900/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-1">Stocks faibles</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Soyez alerté automatiquement avant la rupture de stock.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-[#10B981] rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-green-900/20 dark:shadow-green-900/50">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-1">Gestion par position</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Gérez vos stocks par position (en boutique, en entrepôt, etc.).</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-[#8B5CF6] rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-purple-900/20 dark:shadow-purple-900/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-1">Historique complet</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Consultez l'historique complet des mouvements de stock.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-[#06B6D4] rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-cyan-900/20 dark:shadow-cyan-900/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-1">Support multi-magasins</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Gérez plusieurs magasins depuis une plateforme centralisée.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image (CSS Cropped) */}
            <div className="order-1 lg:order-2 h-full flex items-center">
              <div className="relative w-full rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
                <img 
                  src="/images/gestion_stocks_full.jpg" 
                  alt="Gestion intelligente des stocks Dashboard" 
                  className="absolute inset-0 w-full h-full object-cover lg:max-w-[200%] lg:w-[190%] lg:object-right lg:-ml-[90%] top-0"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------- ANALYSE AVANCEE SECTION -------------------- */}
      <section className="py-24 bg-[#FAFBFF] dark:bg-[#050B14] relative overflow-hidden transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Image */}
            <div className="order-1">
              <div className="bg-white dark:bg-[#162032] p-4 rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700/50 transform hover:-translate-y-2 transition-all duration-500">
                <img 
                  src="/images/sales_analytics.png" 
                  alt="Analyse avancée des ventes" 
                  className="w-full h-auto rounded-2xl"
                />
              </div>
            </div>

            {/* Right Content */}
            <div className="order-2">
              <div className="w-16 h-16 bg-[#E6F4EA] dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-8 shadow-sm transition-colors">
                <LineChart className="w-8 h-8 text-[#10B981]" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1F2C] dark:text-white mb-4 tracking-tight">
                Analyse avancée des ventes
              </h2>
              
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 leading-relaxed font-medium">
                Visualisez les performances de votre boutique avec des indicateurs clairs et précis.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-center text-gray-600 dark:text-gray-300 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mr-4"></div>
                  Tableau de bord de ventes par période et canal.
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mr-4"></div>
                  Comparaison entre périodes, produits ou employés.
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mr-4"></div>
                  Analyse des retours et annulations.
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mr-4"></div>
                  Chiffre d'affaires net vs brut.
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mr-4"></div>
                  Prévisions basées sur les tendances passées.
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------- ANIMATED FEATURES MARQUEE -------------------- */}
      <section className="py-20 bg-white dark:bg-[#0A1226] overflow-hidden border-t border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <div className="relative w-full flex flex-col space-y-6">
          
          {/* Fading Edges */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-[#0A1226] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-[#0A1226] to-transparent z-10 pointer-events-none"></div>

          {/* Row 1 (Scrolling Left) */}
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            <div className="flex space-x-6 px-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex space-x-6">
                  <div className="flex items-center space-x-2 px-6 py-3 bg-[#78AAFA] text-white rounded-2xl font-bold whitespace-nowrap shadow-sm">
                    <Box className="w-5 h-5" /><span>Gestion du Stock</span>
                  </div>
                  <div className="flex items-center space-x-2 px-6 py-3 bg-[#EFEBF7] text-[#7654C4] rounded-2xl font-bold whitespace-nowrap shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                    <span>Alerte Stock Faible</span>
                  </div>
                  <div className="flex items-center space-x-2 px-6 py-3 bg-[#FBE8EE] text-[#E36384] rounded-2xl font-bold whitespace-nowrap shadow-sm">
                    <MapPin className="w-5 h-5" /><span>Gestion multi-entrepôts</span>
                  </div>
                  <div className="flex items-center space-x-2 px-6 py-3 bg-[#D4F7ED] text-[#1C9F7C] rounded-2xl font-bold whitespace-nowrap shadow-sm">
                    <ShoppingCart className="w-5 h-5" /><span>Gestion des ventes</span>
                  </div>
                  <div className="flex items-center space-x-2 px-6 py-3 bg-[#E4F6FA] text-[#1D99B5] rounded-2xl font-bold whitespace-nowrap shadow-sm">
                    <BarChart3 className="w-5 h-5" /><span>Tableau de bord analytique</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 (Scrolling Right) */}
          <div className="flex w-max animate-marquee-reverse hover:[animation-play-state:paused]">
            <div className="flex space-x-6 px-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex space-x-6">
                  <div className="flex items-center space-x-2 px-6 py-3 bg-[#74A9FA] text-white rounded-2xl font-bold whitespace-nowrap shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>
                    <span>Lecture de codes-barres</span>
                  </div>
                  <div className="flex items-center space-x-2 px-6 py-3 bg-[#E2F6F9] text-[#2BA3B8] rounded-2xl font-bold whitespace-nowrap shadow-sm">
                    <CheckCircle2 className="w-5 h-5" /><span>Inventaire automatique</span>
                  </div>
                  <div className="flex items-center space-x-2 px-6 py-3 bg-[#DCF7EC] text-[#1B9B78] rounded-2xl font-bold whitespace-nowrap shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>Historique des mouvements</span>
                  </div>
                  <div className="flex items-center space-x-2 px-6 py-3 bg-[#FEF0D2] text-[#F29D1F] rounded-2xl font-bold whitespace-nowrap shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    <span>Gestion des variantes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3 (Scrolling Left) */}
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            <div className="flex space-x-6 px-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex space-x-6">
                  <div className="flex items-center space-x-2 px-6 py-3 bg-[#75A9FA] text-white rounded-2xl font-bold whitespace-nowrap shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                    <span>Notifications intelligentes</span>
                  </div>
                  <div className="flex items-center space-x-2 px-6 py-3 bg-[#E2F5F8] text-[#309BB3] rounded-2xl font-bold whitespace-nowrap shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 7l4-4m-4 4l4 4m-4-4h14a4 4 0 0 1 4 4v8"/></svg>
                    <span>Gestion des retours</span>
                  </div>
                  <div className="flex items-center space-x-2 px-6 py-3 bg-[#E0F6EC] text-[#239772] rounded-2xl font-bold whitespace-nowrap shadow-sm">
                    <FileText className="w-5 h-5" /><span>Export Excel/PDF</span>
                  </div>
                  <div className="flex items-center space-x-2 px-6 py-3 bg-[#FDF0CD] text-[#F29D1D] rounded-2xl font-bold whitespace-nowrap shadow-sm">
                    <ShoppingCart className="w-5 h-5" /><span>Commande en ligne</span>
                  </div>
                  <div className="flex items-center space-x-2 px-6 py-3 bg-[#F9E4EE] text-[#E15881] rounded-2xl font-bold whitespace-nowrap shadow-sm">
                    <Truck className="w-5 h-5" /><span>Bons de livraison</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </section>

      {/* -------------------- FEATURES SECTION -------------------- */}
      <section id="fonctionnalites" className="py-24 bg-white dark:bg-[#0A1226] border-t border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Gérer votre entreprise n'a jamais été aussi facile</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Découvrez tous les outils intégrés pour automatiser et développer votre activité.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Package className="text-[#2563EB] w-6 h-6" />}
              title="Stock en direct"
              description="Sachez exactement ce qu'il vous reste en rayon. Recevez une alerte avant qu'un produit ne soit épuisé."
            />
            <FeatureCard 
              icon={<ShoppingCart className="text-[#2563EB] w-6 h-6" />}
              title="Caisse facile et rapide"
              description="Encaissez vos clients en quelques clics. Scannez vos articles facilement, comme au supermarché."
            />
            <FeatureCard 
              icon={<Calculator className="text-[#2563EB] w-6 h-6" />}
              title="Factures en 1 clic"
              description="Créez de jolies factures avec votre logo en un instant et envoyez-les directement à vos clients."
            />
            <FeatureCard 
              icon={<Users className="text-[#2563EB] w-6 h-6" />}
              title="Carnet de clients"
              description="Gardez le contact avec vos acheteurs. Enregistrez leurs habitudes pour les faire revenir plus souvent."
            />
            <FeatureCard 
              icon={<BarChart3 className="text-[#2563EB] w-6 h-6" />}
              title="Suivi de vos bénéfices"
              description="Voyez clairement combien vous gagnez. Des graphiques simples vous montrent vos ventes du jour ou du mois."
            />
            <FeatureCard 
              icon={<LayoutDashboard className="text-[#2563EB] w-6 h-6" />}
              title="Plusieurs magasins"
              description="Vous avez plusieurs boutiques ou dépôts ? Contrôlez-les tous depuis le même endroit, très simplement."
            />
          </div>
        </div>
      </section>

      {/* -------------------- TESTIMONIALS SECTION -------------------- */}
      <section className="py-24 bg-[#FAFBFF] dark:bg-[#050B14] border-t border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1F2C] dark:text-white mb-4">Ils développent leur entreprise avec GESTORA</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Des commerçants, PME et entreprises font confiance à GESTORA pour gérer leurs ventes, leurs stocks, leurs achats et leurs finances à partir d'une plateforme unique.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-[1400px] mx-auto">
            {/* Card 1 */}
            <div className="bg-white dark:bg-[#162032] p-6 rounded-3xl border border-gray-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
              <div className="flex items-center pb-4 border-b border-gray-100 dark:border-slate-800/60 mb-6">
                <img src="/avatars/mamadou.png" alt="Mamadou Diop" className="w-10 h-10 rounded-full object-cover mr-3" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs">Mamadou Diop</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Dakar Tech Distribution</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed font-medium flex-1">
                « GESTORA nous fait gagner un temps précieux grâce à une gestion simple et un suivi en temps réel. »
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-[#162032] p-6 rounded-3xl border border-gray-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
              <div className="flex items-center pb-4 border-b border-gray-100 dark:border-slate-800/60 mb-6">
                <img src="/avatars/aissatou.png" alt="Aïssatou Ndiaye" className="w-10 h-10 rounded-full object-cover mr-3" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs">Aïssatou Ndiaye</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Boutique Élégance Mode</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed font-medium flex-1">
                « Une plateforme intuitive qui centralise toutes nos opérations au quotidien. »
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-[#162032] p-6 rounded-3xl border border-gray-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
              <div className="flex items-center pb-4 border-b border-gray-100 dark:border-slate-800/60 mb-6">
                <img src="/avatars/ibrahima.png" alt="Ibrahima Ba" className="w-10 h-10 rounded-full object-cover mr-3" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs">Ibrahima Ba</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Supermarché Horizon</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed font-medium flex-1">
                « Les analyses et les rapports nous permettent de prendre de meilleures décisions. »
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white dark:bg-[#162032] p-6 rounded-3xl border border-gray-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
              <div className="flex items-center pb-4 border-b border-gray-100 dark:border-slate-800/60 mb-6">
                <img src="/avatars/fatou.png" alt="Fatou Sow" className="w-10 h-10 rounded-full object-cover mr-3" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs">Fatou Sow</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Pharmacie Santé Plus</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed font-medium flex-1">
                « Une solution fiable pour gérer les stocks, les ventes et les fournisseurs sans difficulté. »
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white dark:bg-[#162032] p-6 rounded-3xl border border-gray-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
              <div className="flex items-center pb-4 border-b border-gray-100 dark:border-slate-800/60 mb-6">
                <img src="/avatars/cheikh.png" alt="Cheikh Fall" className="w-10 h-10 rounded-full object-cover mr-3" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs">Cheikh Fall</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">CF Business Group</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed font-medium flex-1">
                « GESTORA est devenu un outil indispensable pour piloter efficacement notre entreprise. »
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- CTA BANNER -------------------- */}
      <section className="bg-white dark:bg-[#0A1226] border-t border-gray-100 dark:border-slate-800 py-24 relative overflow-hidden transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-6 text-center relative z-10">
          <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-8">
            Gérez votre entreprise en toute confiance, depuis une seule plateforme.
          </h3>
          <p className="text-gray-500 dark:text-gray-300 text-lg mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
            Simplifiez la gestion de vos stocks, ventes, achats et finances grâce à un ERP moderne, sécurisé et intelligent. GESTORA automatise vos tâches quotidiennes, vous offre une visibilité en temps réel sur votre activité et vous aide à prendre de meilleures décisions pour développer votre entreprise.
          </p>
          <Link href="/register" className="inline-block px-10 py-4 bg-[#2563EB] text-white hover:bg-blue-600 font-extrabold rounded-full transition-all shadow-xl hover:scale-105">
            Commencer gratuitement
          </Link>
        </div>
      </section>



      {/* -------------------- PRICING SECTION -------------------- */}
      <PricingSection />

      {/* -------------------- FOOTER -------------------- */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <a href="https://wa.me/221777042509?text=Bonjour%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20GESTORA" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 bg-[#2563EB] hover:bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-1">
              <Phone className="w-4 h-4" />
              <span>Appeler / WhatsApp GESTORA</span>
            </a>
          </div>
          <p className="text-sm font-medium">&copy; 2026 GESTORA. Tous droits réservés.</p>
          <div className="space-x-6 mt-4 md:mt-0 text-sm font-medium">
            <Link href="#" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="#" className="hover:text-white transition-colors">Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Subcomponents
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900/50 transition-all group">
      <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{description}</p>
    </div>
  );
}


function FaqItem({ question, answer }: { question: string, answer: string }) {
  return (
    <details className="group bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl open:shadow-md transition-all">
      <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-gray-900 dark:text-white">
        {question}
        <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
      </summary>
      <div className="px-6 pb-6 text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
        {answer}
      </div>
    </details>
  );
}
