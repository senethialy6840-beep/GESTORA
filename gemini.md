# Contexte et Instructions pour l'Intelligence Artificielle (Gemini / IA)

Ce document a pour but de fournir à tout modèle d'intelligence artificielle (notamment Gemini) le contexte complet du projet **Gestora**. Il doit être lu avant d'entreprendre des modifications complexes afin de comprendre l'architecture, les décisions passées et les fonctionnalités implémentées.

---

## 📌 1. Ce que fait l'application (Gestora)
GESTORA est un ERP SaaS (Enterprise Resource Planning) de nouvelle génération, conçu pour aider les entreprises à centraliser, automatiser et optimiser l'ensemble de leurs opérations depuis une plateforme unique, sécurisée et accessible en ligne.

Pensé pour les PME, commerces, supermarchés, pharmacies, boutiques, restaurants, distributeurs, grossistes et entreprises multisites, GESTORA permet de gérer efficacement les stocks, les ventes, les achats, la facturation, les clients, les fournisseurs, la trésorerie, les ressources humaines et les performances de l'entreprise.

Grâce à son architecture cloud et à son intelligence artificielle intégrée (GESTORA AI - YEYA AI), les dirigeants disposent d'une vision complète de leur activité en temps réel et peuvent prendre des décisions plus rapides, plus intelligentes et mieux informées.

## 🚀 2. Fonctionnalités Implémentées
- **Authentification** : Système de connexion (actuellement basé sur l'email) avec extraction automatique du prénom/nom pour personnaliser l'interface (initiales, salutations).
- **Dashboard (Tableau de Bord)** : Affichage de KPIs et de graphiques (Recharts) pour visualiser l'état de l'entreprise.
- **Gestion des Factures (`app/dashboard/invoices/`)** :
  - Création dynamique de factures avec ajout/suppression de lignes (quantité, prix unitaire).
  - Changement de statut (Brouillon, Créée, Payée, En retard).
  - Génération de PDF **côté client** depuis le DOM en utilisant `html-to-image` et `jsPDF`.
  - Design professionnel de la facture, optimisé pour l'impression A4 (Total Payé repoussé en bas, aucune icône parasite comme le bouton de téléchargement lors de l'aperçu).
  - Modale (pop-up) de succès après l'enregistrement d'une facture, proposant soit de télécharger le PDF, soit de retourner à la liste.
- **Paramètres de l'entreprise (`app/dashboard/settings/`)** : 
  - Modification des informations légales (NINEA, RC, email, adresse, etc.) et ajout d'un logo.
  - Fenêtre modale centrée (design moderne) pour confirmer la sauvegarde avec succès.

## 🏗 3. Structure des Fichiers (Architecture)
Le projet utilise le framework **Next.js (App Router)**.
```text
gestora/
├── app/
│   ├── api/                 # Backend API Routes (Auth, requêtes BDD)
│   ├── components/          # Composants UI partagés
│   ├── dashboard/           # Section privée (Layout avec Sidebar et Topbar)
│   │   ├── invoices/        # CRUD des factures et logique d'export PDF (Client Component)
│   │   ├── settings/        # Formulaire des paramètres avec upload de logo (Client Component)
│   │   ├── layout.tsx       # Gestion du layout du dashboard et récupération des données locales (localStorage/Profil)
│   │   └── page.tsx         # Page d'accueil du dashboard (Statistiques)
│   ├── login/               # Interface de connexion
│   ├── layout.tsx           # Layout racine (Thème clair/sombre via next-themes)
│   └── page.tsx             # Landing page publique
├── prisma/
│   └── schema.prisma        # Schéma de base de données (SQLite/LibSQL)
```

## 🛠 4. Technologies Utilisées
- **Core** : Next.js 16+ (App Router), React 19, TypeScript
- **Styling** : Tailwind CSS v4, Lucide React (Icônes), `next-themes` (Dark/Light mode)
- **Base de données** : Prisma ORM, LibSQL (SQLite local/edge)
- **Outils spécifiques** : 
  - `html-to-image` (v1.11+) + `jspdf` : Pour la conversion directe de l'interface HTML de la facture en PDF (meilleure fidélité que `html2canvas`).
  - `recharts` : Pour les graphiques du dashboard.

## 🎨 5. Décisions de Design et d'Architecture
- **Mobile-First & Premium** : Le design (Design System) repose sur des couleurs élégantes (fond `#0A1226` en dark mode, texte gris slate, bleu primaire `#2563EB`). Les bords sont très arrondis (`rounded-xl`, `rounded-2xl`).
- **Feedback Utilisateur (Modales vs Toasts)** : Privilégier les fenêtres modales centrées (`fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm`) avec icônes (ex: `Check` de Lucide) au lieu des petits "toasts" en bas d'écran, pour s'assurer que l'utilisateur lit les messages de succès.
- **CSR pour les PDF (Client-Side Rendering)** : Les PDF sont générés directement sur le navigateur de l'utilisateur pour éviter des dépendances Node.js lourdes et assurer que le rendu CSS/Tailwind (notamment les ombres et arrondis) soit parfait. On utilise `invoiceRef` pour cibler le conteneur HTML.

## 🤖 6. Instructions pour un futur modèle IA
Si tu es un modèle IA (comme Gemini) et que tu lis ce fichier pour prendre le contexte de ce projet, **respecte impérativement ces règles** :
1. **Design System** : Utilise toujours les classes Tailwind existantes. Ne crée pas de designs "basiques". Utilise des transitions (`transition-colors`), des ombres subtiles (`shadow-sm`) et gère toujours le support du mode sombre (`dark:bg-[#162032]`, etc.).
2. **Outils d'Édition** : Préfère `multi_replace_file_content` ou `replace_file_content` pour modifier des blocs spécifiques plutôt que de générer ou d'écraser des fichiers complets.
3. **Modales** : Lors de la création de messages de succès, utilise le pattern de la Modale centrée avec fond flouté (`backdrop-blur-sm`), comme implémenté dans `settings/page.tsx` et `invoices/page.tsx`.
4. **Export PDF** : Si tu dois modifier le design de la facture, vérifie toujours que tes changements ne cassent pas l'export avec `html-to-image`. Évite les CSS trop complexes (comme certains flex/grid imbriqués) qui pourraient mal être capturés.
5. **Composants Client vs Server** : N'oublie pas le `"use client"` en haut des fichiers qui utilisent des hooks React (`useState`, `useEffect`) ou des événements DOM.

---
*Ce fichier garantit la pérennité du code et la cohérence de l'interface pour toutes les itérations futures du projet Gestora.*
