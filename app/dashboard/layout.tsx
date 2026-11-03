"use client";

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, BarChart3, Sparkles, Monitor, ShoppingCart, 
  Users, Package, Box, Truck, Calculator, FileText, Users2, 
  Search, Menu, PanelLeftClose, PanelLeftOpen, Settings, User, 
  LogOut, HelpCircle, X, CreditCard, Shield, Lock, ArrowUpRight, ShieldAlert
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useSession, signOut } from 'next-auth/react';
import { hasPlanAccess, getFeatureDetailsForPath, PLAN_DISPLAY_NAMES } from '@/lib/planAccess';
import { PlanLockedFeature } from '../../components/PlanLockedFeature';

function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());
      router.push(`/dashboard/search?${params.toString()}`);
    } else {
      router.push('/dashboard/search');
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-xs sm:max-w-md group">
      <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 group-focus-within:text-blue-500 hover:text-blue-600 transition-colors">
        <Search className="w-4 h-4" />
      </button>
      <input 
        type="text" 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Rechercher..." 
        className="w-full bg-gray-100 dark:bg-[#162032] border border-transparent dark:border-slate-700/50 rounded-lg pl-9 pr-9 py-2 text-sm text-gray-900 dark:text-slate-200 placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
      />
      {searchQuery && (
        <button 
          type="button"
          onClick={() => {
            setSearchQuery('');
            router.push('/dashboard/search');
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userEmail, setUserEmail] = useState('utilisateur@gestora.sn');
  const [userProfile, setUserProfile] = useState<any>({ prenom: 'Utilisateur', nom: '' });
  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (session?.user) {
      setUserEmail(session.user.email || 'utilisateur@gestora.sn');
      const nameParts = session.user.name?.split(' ') || [];
      setUserProfile({ 
        prenom: nameParts[0] || 'Utilisateur', 
        nom: nameParts[1] || '' 
      });
    }
  }, [session]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // La page d'abonnement est autonome : elle ne doit pas afficher le shell du dashboard.
  if (pathname === '/dashboard/subscription') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A1226] font-sans text-gray-700 dark:text-slate-300 selection:bg-[#2563EB]/30 transition-colors duration-300 p-6">
        {children}
      </div>
    );
  }

  const isActive = (path: string) => pathname === path;

  const getLinkClass = (path: string, isLocked: boolean = false) => {
    const baseClass = `flex items-center py-2 text-sm font-medium rounded-lg transition-colors duration-200 group relative ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'}`;
    if (isActive(path)) {
      return `${baseClass} bg-[#1E293B]/80 text-white`;
    }
    if (isLocked) {
      return `${baseClass} text-slate-400 hover:text-white hover:bg-slate-800/40`;
    }
    return `${baseClass} text-slate-400 hover:text-white hover:bg-slate-800/50`;
  };

  const userRole = (session?.user as any)?.role || 'USER';
  const userPlan = (session?.user as any)?.plan || 'FREE';
  const sessionEmail = (session?.user as any)?.email || '';

  const isPlatformOwner = sessionEmail.trim().toLowerCase() === 'gestorame112@gmail.com' || userRole === 'SUPER_ADMIN';

  const hasAccess = (requiredPlan: string) => {
    return hasPlanAccess(userPlan, requiredPlan, isPlatformOwner);
  };

  // --- PROTECTION STRICTE PAR URL ---
  let requiredPlanForCurrentRoute: string | null = null;
  
  // 1. Restriction Vendeur (SELLER) - on bloque ces URLs pour eux
  const sellerRestrictedPaths = ['/dashboard/settings', '/dashboard/accounting', '/dashboard/hr', '/dashboard/purchases', '/dashboard/clients'];
  const isSellerRestricted = userRole === 'SELLER' && sellerRestrictedPaths.some(p => pathname.startsWith(p));

  // 2. Restriction par Forfait (PLAN)
  if (pathname.startsWith('/dashboard/accounting') || pathname.startsWith('/dashboard/hr') || pathname.startsWith('/dashboard/ai')) {
    requiredPlanForCurrentRoute = 'ENTERPRISE';
  } else if (pathname.startsWith('/dashboard/inventory') || pathname.startsWith('/dashboard/reports') || pathname.startsWith('/dashboard/purchases') || pathname.startsWith('/dashboard/invoices')) {
    requiredPlanForCurrentRoute = 'BUSINESS';
  }

  const isPlanRestricted = !isPlatformOwner && requiredPlanForCurrentRoute !== null && !hasAccess(requiredPlanForCurrentRoute);
  const lockedFeatureDetails = isPlanRestricted ? getFeatureDetailsForPath(pathname) : null;

  // Les utilisateurs doivent avoir un abonnement actif avant d'accéder au dashboard.
  const subStatus = (session?.user as any)?.subscriptionStatus;
  const isSubscriptionBlocked = subStatus === 'PENDING' || subStatus === 'EXPIRED' || subStatus === 'CANCELLED';

  if (session?.user && isSubscriptionBlocked && !isPlatformOwner) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A1226] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#162032] p-8 rounded-2xl shadow-xl text-center border border-gray-200 dark:border-slate-700/50">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Abonnement Requis</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-8">
            {subStatus === 'EXPIRED' 
              ? "Votre abonnement a expiré. Veuillez renouveler votre forfait pour continuer." 
              : "Pour accéder à votre tableau de bord, vous devez d'abord activer votre abonnement."}
          </p>
          <a 
            href="/dashboard/subscription"
            className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-center rounded-xl transition-colors"
          >
            Choisir mon forfait
          </a>
          <button 
            onClick={handleLogout} 
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-slate-300"
          >
            Me déconnecter
          </button>
        </div>
      </div>
    );
  }

  // Navigation Items: Toutes les fonctionnalités sont déclarées ici
  const navItems = [
    {
      name: 'Tableau de bord',
      path: '/dashboard',
      icon: LayoutDashboard,
      requiredPlan: 'STARTUP',
      sellerAllowed: true,
    },
    {
      name: 'Caisse (POS)',
      path: '/dashboard/pos',
      icon: Monitor,
      requiredPlan: 'STARTUP',
      sellerAllowed: true,
    },
    {
      name: 'Catalogue Produits',
      path: '/dashboard/products',
      icon: Package,
      requiredPlan: 'STARTUP',
      sellerAllowed: true,
    },
    {
      name: 'Ventes',
      path: '/dashboard/sales',
      icon: ShoppingCart,
      requiredPlan: 'STARTUP',
      sellerAllowed: true,
    },
    {
      name: 'Clients',
      path: '/dashboard/clients',
      icon: Users,
      requiredPlan: 'STARTUP',
      sellerAllowed: false,
    },
    {
      name: 'Stock Avancé',
      path: '/dashboard/inventory',
      icon: Box,
      requiredPlan: 'BUSINESS',
      sellerAllowed: true,
    },
    {
      name: 'Factures & Devis',
      path: '/dashboard/invoices',
      icon: FileText,
      requiredPlan: 'BUSINESS',
      sellerAllowed: true,
    },
    {
      name: 'Achats & Fournisseurs',
      path: '/dashboard/purchases',
      icon: Truck,
      requiredPlan: 'BUSINESS',
      sellerAllowed: false,
    },
    {
      name: 'Rapports & Analyses',
      path: '/dashboard/reports',
      icon: BarChart3,
      requiredPlan: 'BUSINESS',
      sellerAllowed: true,
    },
    {
      name: 'Comptabilité',
      path: '/dashboard/accounting',
      icon: Calculator,
      requiredPlan: 'ENTERPRISE',
      sellerAllowed: false,
    },
    {
      name: 'Ressources Humaines',
      path: '/dashboard/hr',
      icon: Users2,
      requiredPlan: 'ENTERPRISE',
      sellerAllowed: false,
    },
    {
      name: 'Gestora AI',
      path: '/dashboard/ai',
      icon: Sparkles,
      requiredPlan: 'ENTERPRISE',
      sellerAllowed: true,
    },
    {
      name: 'Paramètres',
      path: '/dashboard/settings',
      icon: Settings,
      requiredPlan: 'STARTUP',
      sellerAllowed: false,
    },
    {
      name: 'Aide et assistance',
      path: '/dashboard/support',
      icon: HelpCircle,
      requiredPlan: 'STARTUP',
      sellerAllowed: true,
    },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (userRole === 'SELLER' && !item.sellerAllowed) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A1226] flex font-sans text-gray-700 dark:text-slate-300 selection:bg-[#2563EB]/30 transition-colors duration-300">
      
      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`bg-[#0A1226] text-slate-300 border-r border-slate-800/60 flex flex-col shrink-0 h-screen overflow-hidden transition-all duration-300 z-50 fixed md:sticky top-0 left-0 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        {/* LOGO */}
        <div className={`h-16 flex items-center border-b border-slate-800/60 shrink-0 sticky top-0 z-20 bg-[#0A1226] ${isSidebarCollapsed ? 'justify-center px-0' : 'px-6'}`}>
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 shrink-0 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-lg flex items-center justify-center text-white font-black text-xl">
              G
            </div>
            {!isSidebarCollapsed && <span className="text-xl font-display font-black tracking-wide text-white">GESTORA</span>}
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 py-4 flex flex-col overflow-hidden">
          
          <div className={`flex-1 min-h-0 overflow-y-auto scrollbar-hide pb-2 ${isSidebarCollapsed ? 'px-2' : 'px-3'}`}>
            <ul className="space-y-0.5">
              {visibleNavItems.map((item) => {
                const isLocked = !hasAccess(item.requiredPlan);
                const isEnt = item.requiredPlan === 'ENTERPRISE';

                return (
                  <li key={item.path}>
                    <Link 
                      href={item.path} 
                      className={getLinkClass(item.path, isLocked)} 
                      title={isLocked ? `${item.name} (Forfait ${PLAN_DISPLAY_NAMES[item.requiredPlan] || item.requiredPlan} requis)` : item.name}
                    >
                      {isActive(item.path) && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
                      )}

                      {isSidebarCollapsed ? (
                        <div className="relative flex items-center justify-center">
                          <item.icon className={`w-5 h-5 shrink-0 ${isActive(item.path) ? 'text-blue-400' : ''}`} />
                          {isLocked && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center shadow-sm">
                              <Lock className="w-2 h-2 text-white" />
                            </span>
                          )}
                        </div>
                      ) : (
                        <>
                          <item.icon className={`w-5 h-5 shrink-0 mr-3 ${isActive(item.path) ? 'text-blue-400' : ''}`} />
                          <span className="truncate flex-1">{item.name}</span>
                          {isLocked && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0 ${
                              isEnt 
                                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' 
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              <Lock className="w-2.5 h-2.5" />
                              {isEnt ? 'ENT' : 'PRO'}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}

              {isPlatformOwner && (
                <li>
                  <Link href="/dashboard/super-admin" className={getLinkClass('/dashboard/super-admin')} title="Super Admin">
                    {isActive('/dashboard/super-admin') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-500 rounded-r-full"></div>}
                    <Shield className={`w-5 h-5 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive('/dashboard/super-admin') ? 'text-purple-400' : 'text-purple-400/70'}`} />
                    {!isSidebarCollapsed && <span className="truncate text-purple-400">Super Admin</span>}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Sidebar Bottom Profile & Logout */}
          <div className={`p-4 border-t border-slate-800/60 mt-auto flex flex-col gap-2 shrink-0 ${isSidebarCollapsed ? 'px-2' : 'px-3'}`}>
            
            {/* Plan Status Widget */}
            {!isSidebarCollapsed ? (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Forfait</span>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    userPlan === 'ENTERPRISE' 
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                      : userPlan === 'BUSINESS' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {PLAN_DISPLAY_NAMES[userPlan?.toUpperCase()] || userPlan}
                  </span>
                </div>
                {userPlan !== 'ENTERPRISE' && !isPlatformOwner && (
                  <Link 
                    href="/dashboard/subscription" 
                    className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center justify-between group pt-1 transition-colors"
                  >
                    <span>Changer de forfait</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                )}
              </div>
            ) : (
              <Link
                href="/dashboard/subscription"
                title={`Forfait : ${PLAN_DISPLAY_NAMES[userPlan?.toUpperCase()] || userPlan} - Mettre à niveau`}
                className="flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 mb-1 transition-colors"
              >
                <CreditCard className="w-5 h-5 text-blue-400" />
              </Link>
            )}

            <button 
              onClick={handleLogout} 
              title="Déconnexion"
              className={`flex items-center w-full py-2 text-sm font-medium rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'}`}
            >
              <LogOut className={`w-5 h-5 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span className="truncate">Déconnexion</span>}
            </button>
          </div>

        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-white dark:bg-[#0A1226] border-b border-gray-200 dark:border-slate-800/60 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 transition-colors duration-300 gap-2">
          
          <div className="flex items-center flex-1 min-w-0">
            <button 
              className="text-gray-400 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white mr-2 sm:mr-4 md:hidden shrink-0"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-gray-400 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white mr-4 sm:mr-6 hidden md:block shrink-0 transition-transform"
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
            
            <Suspense fallback={<div className="w-full max-w-xs sm:max-w-md h-9 bg-gray-100 dark:bg-[#162032] rounded-lg animate-pulse" />}>
              <SearchInput />
            </Suspense>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-5 shrink-0 relative">
            <ThemeToggle />

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <div 
                onClick={() => setShowProfile(!showProfile)}
                className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center cursor-pointer hover:ring-2 ring-blue-500/50 transition-all uppercase"
              >
                {userProfile?.prenom && userProfile.prenom !== 'Utilisateur' ? `${userProfile.prenom[0]}${userProfile.nom?.[0] || ''}` : 'U'}
              </div>
              
              {showProfile && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700/50">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Bonjour {userProfile?.prenom ? userProfile.prenom : 'Utilisateur'}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{userEmail}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/dashboard/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <User className="w-4 h-4 mr-3" /> Mon profil
                    </Link>
                    <Link href="/dashboard/subscription" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <CreditCard className="w-4 h-4 mr-3 text-blue-500" /> Mon abonnement ({PLAN_DISPLAY_NAMES[userPlan?.toUpperCase()] || userPlan})
                    </Link>
                  </div>
                  <div className="py-1 border-t border-gray-200 dark:border-slate-700/50">
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 text-left">
                      <LogOut className="w-4 h-4 mr-3" /> Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-[#0A1226] p-6 transition-colors duration-300">
          {isSellerRestricted ? (
            <div className="w-full max-w-xl mx-auto my-12 bg-white dark:bg-[#162032] p-8 rounded-2xl shadow-sm text-center border border-gray-200 dark:border-slate-700/50">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Accès Restreint</h2>
              <p className="text-gray-500 dark:text-slate-400 mb-6">
                Votre profil Vendeur ne dispose pas des autorisations nécessaires pour accéder à cette section. Veuillez contacter votre administrateur.
              </p>
              <Link 
                href="/dashboard"
                className="inline-block py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
              >
                Retour au tableau de bord
              </Link>
            </div>
          ) : isPlanRestricted && lockedFeatureDetails ? (
            <PlanLockedFeature feature={lockedFeatureDetails} currentPlan={userPlan} />
          ) : (
            children
          )}
        </main>
      </div>

    </div>
  );
}
