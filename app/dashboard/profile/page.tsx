import React from 'react';
import { 
  User, Building2, Shield,
  Package, ReceiptText, Users2, Wallet, Store, Calendar, Mail, Phone, CheckCircle2
} from "lucide-react";
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getDashboardStats } from '@/app/actions/dashboardActions';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user?.id || !session?.user?.companyId) {
    return <div className="p-8 text-center text-gray-500">Veuillez vous reconnecter pour voir votre profil.</div>;
  }

  const userId = session.user.id;
  const companyId = session.user.companyId;

  // Fetch real user & company info
  const userProfile = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true }
  });

  if (!userProfile) return null;

  // Fetch stats using existing actions
  const statsRes = await getDashboardStats(companyId);
  
  // Custom counts
  const productsCount = await prisma.product.count({ where: { companyId } });
  const customersCount = await prisma.customer.count({ where: { companyId } });
  const shopsCount = await prisma.warehouse.count({ where: { companyId } });

  const firstName = userProfile.firstName || 'Utilisateur';
  const fullName = `${userProfile.firstName} ${userProfile.lastName}`;
  const roleDisplay = userProfile.role === "SUPER_ADMIN" ? "Super Administrateur" : userProfile.role === "ADMIN" ? "Administrateur" : userProfile.role;
  const joinedDate = userProfile.createdAt ? format(new Date(userProfile.createdAt), "MMMM yyyy", { locale: fr }) : "Inconnu";
  
  // Capitalize first letter of month
  const joinedDateCapitalized = joinedDate.charAt(0).toUpperCase() + joinedDate.slice(1);

  // Sales this month
  const startOfCurrentMonth = new Date();
  startOfCurrentMonth.setDate(1);
  startOfCurrentMonth.setHours(0, 0, 0, 0);
  const salesThisMonthCount = await prisma.sale.count({
    where: {
      companyId,
      status: 'COMPLETED',
      createdAt: { gte: startOfCurrentMonth }
    }
  });

  const revenue = statsRes.data?.revenue || 0;
  
  // Formatting
  const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* HEADER */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-[#0F172A] rounded-2xl border border-blue-200 dark:border-slate-800 overflow-hidden relative shadow-lg dark:shadow-2xl transition-colors duration-300">
        <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 p-32 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="p-8 md:p-10 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Bonjour, {firstName} 👋</h1>
          <p className="text-gray-600 dark:text-slate-400 max-w-2xl text-lg leading-relaxed">
            Bienvenue sur GESTORA. Pilotez votre entreprise en toute confiance grâce à une plateforme unique qui centralise vos stocks, vos ventes, vos achats, vos clients et vos finances.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* INFORMATIONS DU COMPTE */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 md:p-8 relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 right-0 p-16 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <User className="w-5 h-5 mr-3 text-blue-500 dark:text-blue-400" />
            Informations du compte
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative z-10">
            <InfoItem icon={<User />} label="Nom" value={fullName} />
            <InfoItem icon={<Building2 />} label="Entreprise" value={userProfile.company?.name || 'Non définie'} />
            <InfoItem icon={<Shield />} label="Rôle" value={roleDisplay} />
            <InfoItem icon={<Mail />} label="Adresse e-mail" value={userProfile.email} />
            <InfoItem icon={<Phone />} label="Téléphone" value={userProfile.company?.phone || 'Non renseigné'} />
            <InfoItem icon={<Calendar />} label="Membre depuis" value={joinedDateCapitalized} />
            <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-slate-800/30 rounded-xl border border-gray-100 dark:border-slate-700/30 md:col-span-2">
              <div className="mt-0.5 text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 p-2 rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium mb-1">Statut</p>
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                  {userProfile.isActive ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-2 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)] dark:shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                      Compte actif
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 mr-2 shadow-[0_0_8px_rgba(239,68,68,0.8)] dark:shadow-[0_0_8px_rgba(248,113,113,0.8)]"></span>
                      Compte inactif
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RÉSUMÉ ACTIVITÉ */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 md:p-8 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Résumé de votre activité</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard icon={<Package className="text-indigo-500 dark:text-indigo-400" />} label="Produits" value={formatNumber(productsCount)} />
            <StatCard icon={<ReceiptText className="text-pink-500 dark:text-pink-400" />} label="Ventes ce mois" value={formatNumber(salesThisMonthCount)} />
            <StatCard icon={<Users2 className="text-orange-500 dark:text-orange-400" />} label="Clients" value={formatNumber(customersCount)} />
            <StatCard className="col-span-2 md:col-span-2" icon={<Wallet className="text-emerald-500 dark:text-emerald-400" />} label="Chiffre d'affaires" value={formatNumber(revenue)} suffix="FCFA" />
            <StatCard icon={<Store className="text-blue-500 dark:text-blue-400" />} label="Boutiques" value={formatNumber(shopsCount || 1)} />
          </div>
        </div>

      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-slate-800/30 rounded-xl border border-gray-100 dark:border-slate-700/30 hover:border-gray-200 dark:hover:border-slate-600/50 hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-all duration-300 group">
      <div className="mt-0.5 text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 p-2 rounded-lg group-hover:text-blue-600 dark:group-hover:text-white shadow-sm dark:shadow-none dark:group-hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all">
        {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" } as any)}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-slate-400 font-medium mb-1">{label}</p>
        <p className="text-gray-900 dark:text-slate-100 font-semibold">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, suffix, className = '' }: { icon: React.ReactNode, label: string, value: string, suffix?: string, className?: string }) {
  return (
    <div className={`p-5 bg-gray-50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800/60 hover:border-gray-200 dark:hover:border-slate-600/50 transition-all cursor-pointer group shadow-sm hover:shadow-md flex flex-col justify-between ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm dark:shadow-none group-hover:scale-110 group-hover:shadow-lg transition-transform duration-300">
          {React.cloneElement(icon as React.ReactElement, { className: `w-5 h-5 ${(icon as any).props.className || ''}` } as any)}
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{label}</p>
      </div>
      <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
        {value} {suffix && <span className="text-sm font-medium text-gray-400 dark:text-slate-500 ml-1">{suffix}</span>}
      </p>
    </div>
  );
}
