import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Politique de Confidentialité | GESTORA",
  description: "Politique de confidentialité et de protection des données personnelles de la plateforme GESTORA."
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A1226]">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <Link href="/" className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">GESTORA</Link>
          <h1 className="mt-4 text-3xl font-black text-gray-900 dark:text-white">Politique de Confidentialité</h1>
          <p className="mt-2 text-gray-500 dark:text-slate-400">Dernière mise à jour : Septembre 2026</p>
        </div>

        <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 shadow-sm p-8 space-y-8 text-gray-700 dark:text-slate-300">

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Qui sommes-nous ?</h2>
            <p>GESTORA est une plateforme de gestion d'entreprise (SaaS) proposée par l'équipe GESTORA, basée au Sénégal. Contact : <a href="mailto:gestorame112@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">gestorame112@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Données collectées</h2>
            <p className="mb-2">Lors de votre utilisation de GESTORA, nous collectons les informations suivantes :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Informations d'identification : nom, prénom, adresse email, nom de l'entreprise.</li>
              <li>Données métier : produits, ventes, achats, employés, factures saisis par vous-même dans l'application.</li>
              <li>Données de connexion : adresse IP, dates et heures de connexion (à des fins de sécurité uniquement).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Comment nous utilisons vos données</h2>
            <p>Vos données sont utilisées exclusivement pour :</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Fournir et améliorer les services de la plateforme GESTORA.</li>
              <li>Vous envoyer des notifications importantes liées à votre compte ou abonnement.</li>
              <li>Assurer la sécurité de la plateforme et prévenir les accès non autorisés.</li>
            </ul>
            <p className="mt-2 font-semibold text-gray-900 dark:text-white">Nous ne vendons JAMAIS vos données à des tiers.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Isolation et sécurité des données</h2>
            <p>GESTORA utilise une architecture multi-tenant stricte. Chaque entreprise inscrite dispose de son propre espace de données totalement isolé. Un utilisateur d'une boutique n'a <strong>aucun accès possible</strong> aux données d'une autre boutique. Vos données sont stockées sur des serveurs sécurisés (Supabase / PostgreSQL) avec chiffrement en transit (HTTPS/SSL).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Conservation des données</h2>
            <p>Vos données sont conservées pendant toute la durée de votre abonnement actif et pendant une période de 30 jours après la résiliation de votre compte, avant suppression définitive. Vous pouvez demander la suppression anticipée de vos données en nous contactant.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Vos droits</h2>
            <p>Conformément aux législations applicables, vous disposez d'un droit d'accès, de rectification, de portabilité et de suppression de vos données personnelles. Pour exercer ces droits, contactez-nous à : <a href="mailto:gestorame112@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">gestorame112@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Cookies</h2>
            <p>GESTORA utilise des cookies essentiels uniquement pour maintenir votre session de connexion sécurisée. Aucun cookie de traçage publicitaire n'est utilisé.</p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">← Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}
