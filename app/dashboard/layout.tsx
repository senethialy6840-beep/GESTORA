"use client";

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, BarChart3, Sparkles, Monitor, ShoppingCart, 
  Users, Package, Box, Truck, Calculator, FileText, Users2, 
  Building, Search, Menu, PanelLeftClose, PanelLeftOpen, Settings, User, LogOut, HelpCircle, X
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useSession, signOut } from 'next-auth/react';

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

  const isActive = (path: string) => pathname === path;

  const getLinkClass = (path: string) => {
    const baseClass = `flex items-center py-2 text-sm font-medium rounded-lg transition-colors duration-200 group relative ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'}`;
    return isActive(path)
      ? `${baseClass} bg-[#1E293B]/80 text-white`
      : `${baseClass} text-slate-400 hover:text-white hover:bg-slate-800/50`;
  };

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
        <nav className={`flex-1 py-4 flex flex-col overflow-hidden`}>
          
          <div className={`flex-1 min-h-0 overflow-y-auto scrollbar-hide pb-2 ${isSidebarCollapsed ? 'px-2' : 'px-3'}`}>
            <ul className="space-y-0.5">
              <li>
                <Link href="/dashboard" className={getLinkClass('/dashboard')} title="Tableau de bord">
                  {isActive('/dashboard') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"></div>}
                  <LayoutDashboard className={`w-5 h-5 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive('/dashboard') ? 'text-blue-400' : ''}`} />
                  {!isSidebarCollapsed && <span className="truncate">Tableau de bord</span>}
                </Link>
              </li>

              <li>
                <Link href="/dashboard/pos" className={getLinkClass('/dashboard/pos')} title="Caisse (POS)">
                  {isActive('/dashboard/pos') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"></div>}
                  <Monitor className={`w-5 h-5 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive('/dashboard/pos') ? 'text-blue-400' : ''}`} />
                  {!isSidebarCollapsed && <span className="truncate">Caisse (POS)</span>}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/products" className={getLinkClass('/dashboard/products')} title="Catalogue Produits">
                  {isActive('/dashboard/products') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"></div>}
                  <Package className={`w-5 h-5 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive('/dashboard/products') ? 'text-blue-400' : ''}`} />
                  {!isSidebarCollapsed && <span className="truncate">Catalogue Produits</span>}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/inventory" className={getLinkClass('/dashboard/inventory')} title="Stock Avancé">
                  {isActive('/dashboard/inventory') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"></div>}
                  <Box className={`w-5 h-5 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive('/dashboard/inventory') ? 'text-blue-400' : ''}`} />
                  {!isSidebarCollapsed && <span className="truncate">Stock Avancé</span>}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/sales" className={getLinkClass('/dashboard/sales')} title="Ventes">
                  {isActive('/dashboard/sales') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"></div>}
                  <ShoppingCart className={`w-5 h-5 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive('/dashboard/sales') ? 'text-blue-400' : ''}`} />
                  {!isSidebarCollapsed && <span className="truncate">Ventes</span>}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/reports" className={getLinkClass('/dashboard/reports')} title="Rapports & Analyses">
                  {isActive('/dashboard/reports') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"></div>}
                  <BarChart3 className={`w-5 h-5 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive('/dashboard/reports') ? 'text-blue-400' : ''}`} />
                  {!isSidebarCollapsed && <span className="truncate">Rapports & Analyses</span>}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/purchases" className={getLinkClass('/dashboard/purchases')} title="Achats & Fournisseurs">
                  {isActive('/dashboard/purchases') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"></div>}
                  <Truck className={`w-5 h-5 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive('/dashboard/purchases') ? 'text-blue-400' : ''}`} />
                  {!isSidebarCollapsed && <span className="truncate">Achats & Fournisseurs</span>}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/clients" className={getLinkClass('/dashboard/clients')} title="Clients">
                  {isActive('/dashboard/clients') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"></div>}
                  <Users className={`w-5 h-5 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive('/dashboard/clients') ? 'text-blue-400' : ''}`} />
                  {!isSidebarCollapsed && <span className="truncate">Clients</span>}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/invoices" className={getLinkClass('/dashboard/invoices')} title="Factures & Devis">
                  {isActive('/dashboard/invoices') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"></div>}
                  <FileText className={`w-5 h-5 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive('/dashboard/invoices') ? 'text-blue-400' : ''}`} />
                  {!isSidebarCollapsed && <span className="truncate">Factures & Devis</span>}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/accounting" className={getLinkClass('/dashboard/accounting')} title="Comptabilité">
                  {isActive('/dashboard/accounting') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"></div>}
                  <Calculator className={`w-5 h-5 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive('/dashboard/accounting') ? 'text-blue-400' : ''}`} />
                  {!isSidebarCollapsed && <span className="truncate">Comptabilité</span>}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/hr" className={getLinkClass('/dashboard/hr')} title="Ressources Humaines">
                  {isActive('/dashboard/hr') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"></div>}
                  <Users2 className={`w-5 h-5 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive('/dashboard/hr') ? 'text-blue-400' : ''}`} />
                  {!isSidebarCollapsed && <span className="truncate">Ressources Humaines</span>}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/ai" className={getLinkClass('/dashboard/ai')} title="Gestora AI">
                  {isActive('/dashboard/ai') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"></div>}
                  <Sparkles className={`w-5 h-5 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive('/dashboard/ai') ? 'text-blue-400' : ''}`} />
                  {!isSidebarCollapsed && <span className="truncate">Gestora AI</span>}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings" className={getLinkClass('/dashboard/settings')} title="Paramètres">
                  {isActive('/dashboard/settings') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"></div>}
                  <Settings className={`w-5 h-5 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive('/dashboard/settings') ? 'text-blue-400' : ''}`} />
                  {!isSidebarCollapsed && <span className="truncate">Paramètres</span>}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/support" className={getLinkClass('/dashboard/support')} title="Aide et assistance">
                  {isActive('/dashboard/support') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"></div>}
                  <HelpCircle className={`w-5 h-5 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive('/dashboard/support') ? 'text-blue-400' : ''}`} />
                  {!isSidebarCollapsed && <span className="truncate">Aide et assistance</span>}
                </Link>
              </li>
            </ul>
          </div>

          {/* Sidebar Bottom Profile & Logout */}
          <div className={`p-4 border-t border-slate-800/60 mt-auto flex flex-col gap-2 shrink-0 ${isSidebarCollapsed ? 'px-2' : 'px-3'}`}>
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
          {children}
        </main>
      </div>

    </div>
  );
}
