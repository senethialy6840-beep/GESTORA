import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default async function CommercialClients() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { commercial: true }
  });

  if (!user?.commercial) {
    redirect("/dashboard");
  }

  const commercialId = user.commercial.id;

  // Récupérer les clients apportés (referrals) avec les infos de l'entreprise et la commission générée
  const referrals = await prisma.referral.findMany({
    where: { commercialId },
    include: {
      customer: {
        include: {
          users: true // To get the name of the client
        }
      },
      commissions: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Mes Clients</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700/50">
                <th className="pb-3 px-4 text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Client / Entreprise</th>
                <th className="pb-3 px-4 text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Téléphone</th>
                <th className="pb-3 px-4 text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Plan</th>
                <th className="pb-3 px-4 text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Statut Abonnement</th>
                <th className="pb-3 px-4 text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Date Inscription</th>
                <th className="pb-3 px-4 text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Commission Générée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700/50">
              {referrals.map((referral: any) => {
                const company = referral.customer;
                const clientUser = company.users[0];
                const nomClient = clientUser ? `${clientUser.firstName} ${clientUser.lastName}` : 'N/A';
                
                const totalCommission = referral.commissions.reduce((acc: number, curr: any) => acc + curr.montantCommission, 0);

                return (
                  <tr key={referral.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900 dark:text-white">{nomClient}</div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">{company.name}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-slate-300">
                      {company.phone || '-'}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
                        {company.plan}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {company.subscriptionStatus === 'ACTIVE' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300">
                          {company.subscriptionStatus}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-slate-300">
                      {format(new Date(referral.dateAttribution), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-[#2563EB]">
                      {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(totalCommission)}
                    </td>
                  </tr>
                );
              })}
              {referrals.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-slate-400">
                    Vous n'avez pas encore de clients.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
