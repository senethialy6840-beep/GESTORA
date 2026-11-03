import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default async function CommercialCommissions() {
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

  const commissions = await prisma.commission.findMany({
    where: { commercialId },
    include: {
      referral: {
        include: {
          customer: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Historique des Commissions</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700/50">
                <th className="pb-3 px-4 text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="pb-3 px-4 text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
                <th className="pb-3 px-4 text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Plan</th>
                <th className="pb-3 px-4 text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Montant Payé</th>
                <th className="pb-3 px-4 text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Commission</th>
                <th className="pb-3 px-4 text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700/50">
              {commissions.map((commission: any) => {
                const company = commission.referral.customer;

                return (
                  <tr key={commission.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 text-gray-700 dark:text-slate-300 whitespace-nowrap">
                      {format(new Date(commission.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">
                      {company.name}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
                        {commission.plan}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-gray-700 dark:text-slate-300">
                      {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(commission.montantPaye)}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-[#2563EB]">
                      {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(commission.montantCommission)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {commission.statut === 'PENDING' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300">
                          En attente
                        </span>
                      )}
                      {commission.statut === 'PAID' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                          Payée
                        </span>
                      )}
                      {commission.statut === 'CANCELLED' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300">
                          Annulée
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {commissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-slate-400">
                    Vous n'avez pas encore de commissions.
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
