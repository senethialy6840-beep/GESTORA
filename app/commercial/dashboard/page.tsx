import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CopyButton } from "./CopyButton"; // We will create this client component
import { Link as LinkIcon, Share2, Users, ShoppingCart, DollarSign, Clock, CheckCircle } from "lucide-react";

export default async function CommercialDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { commercial: true }
  });

  if (!user?.commercial) {
    // Si l'utilisateur n'est pas un commercial, rediriger vers le dashboard principal
    redirect("/dashboard");
  }

  const commercial = user.commercial;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gestora.shop";
  const refLink = `${baseUrl}/register?ref=${commercial.codeAffiliation}`;

  // Récupérer les stats
  const referrals = await prisma.referral.findMany({
    where: { commercialId: commercial.id }
  });

  const commissions = await prisma.commission.findMany({
    where: { commercialId: commercial.id }
  });

  const clientsApportes = referrals.length;
  const ventes = referrals.filter((r: any) => r.statut === "CONVERTED").length;
  
  const caGenere = commissions.reduce((acc: number, curr: any) => acc + curr.montantPaye, 0);
  const commissionTotale = commissions.reduce((acc: number, curr: any) => acc + curr.montantCommission, 0);
  const commissionEnAttente = commissions.filter((c: any) => c.statut === "PENDING").reduce((acc: number, curr: any) => acc + curr.montantCommission, 0);
  const commissionPayee = commissions.filter((c: any) => c.statut === "PAID").reduce((acc: number, curr: any) => acc + curr.montantCommission, 0);

  const whatsappMessage = `Bonjour 👋\n\nDécouvrez GESTORA, la solution pour gérer votre entreprise depuis une seule plateforme.\nStocks, ventes, caisse, clients, achats, factures et performances.\n\nCréez votre compte ici :\n${refLink}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="space-y-8">
      {/* MON LIEN */}
      <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <LinkIcon className="w-5 h-5 mr-2 text-blue-500" />
          MON LIEN D'AFFILIATION
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-gray-50 dark:bg-[#0A1226] p-4 rounded-xl border border-gray-200 dark:border-slate-700/50 flex items-center font-mono text-sm text-gray-700 dark:text-slate-300 overflow-hidden">
            <span className="truncate">{refLink}</span>
          </div>
          
          <div className="flex gap-3 shrink-0">
            <CopyButton text={refLink} />
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl transition-colors"
            >
              <Share2 className="w-5 h-5 mr-2" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* STATISTIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Clients apportés</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{clientsApportes}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Ventes (Abonnements)</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{ventes}</h3>
            </div>
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">CA Généré</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(caGenere)}
              </h3>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Commission Totale</p>
              <h3 className="text-2xl font-bold text-[#2563EB] mt-1">
                {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(commissionTotale)}
              </h3>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Commission en attente</p>
              <h3 className="text-2xl font-bold text-orange-500 mt-1">
                {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(commissionEnAttente)}
              </h3>
            </div>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Commission Payée</p>
              <h3 className="text-2xl font-bold text-emerald-500 mt-1">
                {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(commissionPayee)}
              </h3>
            </div>
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
