"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, DollarSign, LogOut, Link as LinkIcon, Share2 } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export default function CommercialLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const getLinkClass = (path: string) => {
    const baseClass = "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200";
    return isActive(path)
      ? `${baseClass} bg-[#2563EB] text-white shadow-md`
      : `${baseClass} text-slate-400 hover:text-white hover:bg-slate-800/50`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A1226] flex transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A1226] border-r border-slate-800/60 flex flex-col shrink-0 h-screen fixed hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-slate-800/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">
              G
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-black tracking-wide text-white leading-none">GESTORA</span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Partenaire</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <Link href="/commercial/dashboard" className={getLinkClass('/commercial/dashboard')}>
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Tableau de bord
          </Link>
          <Link href="/commercial/clients" className={getLinkClass('/commercial/clients')}>
            <Users className="w-5 h-5 mr-3" />
            Mes Clients
          </Link>
          <Link href="/commercial/commissions" className={getLinkClass('/commercial/commissions')}>
            <DollarSign className="w-5 h-5 mr-3" />
            Mes Commissions
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800/60">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-20 bg-white/80 dark:bg-[#0A1226]/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800/60 flex items-center justify-between px-8 sticky top-0 z-20">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
            {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
          </h1>
          <div className="flex items-center">
             <div className="flex items-center space-x-3 bg-gray-100 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-700">
               <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                 {session?.user?.name?.[0] || 'U'}
               </div>
               <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                 {session?.user?.name || 'Commercial'}
               </span>
             </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
