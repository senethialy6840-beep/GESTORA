import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation | GESTORA",
  description: "Lisez nos Conditions Générales d'Utilisation avant de vous abonner à la plateforme GESTORA."
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A1226]">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <Link href="/" className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">GESTORA</Link>
          <h1 className="mt-4 text-3xl font-black text-gray-900 dark:text-white">Conditions Générales d'Utilisation</h1>
          <p className="mt-2 text-gray-500 dark:text-slate-400">Dernière mise à jour : Septembre 2026</p>
        </div>

        <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 shadow-sm p-8 space-y-8 text-gray-700 dark:text-slate-300">
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Objet</h2>
            <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme GESTORA, un logiciel de gestion de caisse, de stocks et de ressources humaines accessible via le Web. En souscrivant à un abonnement, l'Utilisateur accepte sans réserve les présentes CGU.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Description du Service</h2>
            <p>GESTORA est une solution SaaS (Software as a Service) permettant à des entreprises et commerces d'accéder à des outils de gestion incluant la gestion de produits, les ventes en caisse, les achats fournisseurs, la gestion des employés, la comptabilité et le reporting analytique.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Accès au Service et Abonnements</h2>
            <p className="mb-2">L'accès à GESTORA est conditionné à la création d'un compte et au paiement d'un abonnement. Les offres disponibles sont les suivantes :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Startup</strong> : Accès aux fonctionnalités de base (Caisse, Produits, Ventes).</li>
              <li><strong>Business</strong> : Accès complet incluant rapports, achats, facturation et comptabilité.</li>
              <li><strong>Enterprise</strong> : Toutes les fonctionnalités, intelligence artificielle et support prioritaire.</li>
            </ul>
            <p className="mt-2">Les abonnements sont payés d'avance. L'accès est suspendu en cas de non-paiement à l'échéance.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Obligations de l'Utilisateur</h2>
            <p>L'Utilisateur s'engage à :</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Fournir des informations exactes et à les maintenir à jour.</li>
              <li>Garder ses identifiants de connexion confidentiels.</li>
              <li>Ne pas utiliser le service à des fins illicites ou non autorisées.</li>
              <li>Ne pas tenter d'accéder aux données d'autres entreprises utilisatrices.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Données et Confidentialité</h2>
            <p>GESTORA s'engage à protéger la confidentialité des données de ses utilisateurs. Les données de chaque entreprise sont isolées de façon stricte (architecture multi-tenant). Pour en savoir plus, consultez notre <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Politique de Confidentialité</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Disponibilité du Service</h2>
            <p>GESTORA s'efforce d'assurer une disponibilité maximale de la plateforme. Cependant, des interruptions de service peuvent survenir pour des raisons de maintenance ou de force majeure. GESTORA ne pourra être tenu responsable des pertes de données ou manques à gagner causés par des interruptions de service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Résiliation</h2>
            <p>L'Utilisateur peut résilier son compte à tout moment en contactant notre support. GESTORA se réserve le droit de suspendre ou de résilier tout compte en cas de violation des présentes CGU.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Contact</h2>
            <p>Pour toute question relative aux présentes CGU, vous pouvez nous contacter à l'adresse : <a href="mailto:gestorame112@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">gestorame112@gmail.com</a>.</p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">← Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}
