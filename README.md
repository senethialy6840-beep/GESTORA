# Gestora

Gestora est une application web SaaS moderne conçue pour simplifier la gestion de la facturation, le suivi des clients et l'administration des paramètres d'entreprise. Pensée pour les professionnels et les petites entreprises, Gestora offre une interface haut de gamme, fluide et intuitive, tout en garantissant une personnalisation poussée des documents commerciaux.

---

## 🚀 Fonctionnalités Principales

### 1. Authentification & Sécurité
- Connexion sécurisée via email.
- Gestion intelligente de la session : Les informations de l'utilisateur (nom, initiales) sont extraites automatiquement et persistées pour personnaliser l'interface (Dashboard, Menu profil).

### 2. Tableau de Bord (Dashboard)
- **Vue d'ensemble** : Affichage dynamique de l'activité avec salutation personnalisée ("Bonjour [Prénom]").
- **Indicateurs de performance (KPIs)** : Cartes statistiques pour un suivi rapide de la santé de l'entreprise.
- **Graphiques** : Visualisation des revenus et statistiques grâce à l'intégration de graphes modernes.

### 3. Gestion des Factures
- **Création & Modification** : Formulaire interactif et en temps réel permettant d'ajouter ou de retirer des lignes de facturation, de définir des quantités, et d'ajuster les prix unitaires.
- **Statuts Dynamiques** : Gestion des états de facturation (*Brouillon, Créée, Payée, En retard*) via une liste déroulante lors de l'édition, qui se transforme en badge de statut lors de la visualisation.
- **Génération PDF Native** : Export instantané et au pixel près des factures au format PDF, garantissant que le document imprimé soit strictement identique à la version écran.
- **Design Professionnel** : Modèle de facture repensé avec une esthétique luxueuse, une barre d'accentuation bleue, et une organisation spatiale optimisant la lisibilité (totaux déportés en bas, espace central maximisé).
- **Listing & Recherche** : Tableau récapitulatif filtrable par statut et barre de recherche rapide par nom de client ou référence.

### 4. Paramètres de l'Entreprise
- **Configuration** : Page dédiée pour gérer le profil de l'entreprise (Nom légal, NINEA/RC, adresse, e-mail, téléphone).
- **Personnalisation** : Importation et prévisualisation du logo de l'entreprise (immédiatement reflété sur les factures générées).
- **Expérience Utilisateur (UX)** : Sauvegarde fluide avec fenêtre modale (pop-up) de confirmation élégante bloquant le fond pour plus de clarté.

---

## 🛠 Technologies Utilisées

Ce projet repose sur une stack moderne, performante et robuste, centrée autour de l'écosystème React :

- **Framework Core** : [Next.js (App Router)](https://nextjs.org/) (v16+)
- **Bibliothèque UI** : [React](https://react.dev/) (v19)
- **Style & Design System** : [Tailwind CSS](https://tailwindcss.com/) (v4)
- **Base de données & ORM** : [Prisma](https://www.prisma.io/) avec connecteur LibSQL (SQLite optimisé)
- **Authentification** : NextAuth.js et bcryptjs
- **Génération de PDF** : `html-to-image` et `jsPDF` (pour le rendu côté client sans dépendance lourde)
- **Icônes** : [Lucide React](https://lucide.dev/)
- **Graphiques** : [Recharts](https://recharts.org/)
- **Thème** : `next-themes` (Gestion native du mode clair/sombre)

---

## 🏗 Architecture du Projet

Le projet suit la structure standard et recommandée du App Router de Next.js :

```text
gestora/
├── app/
│   ├── api/                 # Routes Backend (Authentification, appels base de données)
│   ├── components/          # Composants UI réutilisables (Boutons, Cartes, etc.)
│   ├── dashboard/           # Interface principale après connexion (Espace privé)
│   │   ├── invoices/        # Page de gestion et de création des factures
│   │   ├── settings/        # Page des paramètres de l'entreprise
│   │   ├── layout.tsx       # Structure commune du tableau de bord (Sidebar, Header)
│   │   └── page.tsx         # Accueil du tableau de bord (Statistiques)
│   ├── login/               # Page d'authentification
│   ├── layout.tsx           # Layout racine (Injection du thème, polices)
│   └── page.tsx             # Page d'accueil publique (Landing page)
├── prisma/
│   └── schema.prisma        # Modélisation de la base de données
├── public/                  # Assets statiques (images, polices locales)
└── package.json             # Dépendances et scripts du projet
```

---

## 🎨 Décisions de Design et d'Architecture

1. **Approche "Mobile-First" & Design Premium** :
   L'interface de Gestora a été pensée pour dégager un sentiment de confiance et de professionnalisme. L'utilisation du Design System défini (fonds légers, bordures subtiles `gray-200`, mode sombre natif en `#0A1226`, ombres douces `shadow-sm`) garantit une expérience haut de gamme. L'interface s'adapte parfaitement sur mobile comme sur desktop grâce au système de grille de Tailwind.

2. **Mode Sombre (Dark Mode) Intégral** :
   Chaque composant intègre des classes spécifiques `dark:` pour garantir une transition fluide. Le choix d'un fond bleu nuit/ardoise plutôt qu'un noir pur réduit la fatigue visuelle tout en conservant une identité forte.

3. **Génération PDF Côté Client (Client-side Rendering)** :
   Plutôt que d'utiliser des générateurs PDF côté serveur (souvent lourds à maintenir et limités en termes de CSS), Gestora exploite la bibliothèque `html-to-image` couplée à `jsPDF`. 
   - *Pourquoi ?* Cela permet de concevoir les factures avec HTML/Tailwind classique, assurant que "ce que voit l'utilisateur à l'écran est exactement ce qui s'imprime".
   - Le passage à `html-to-image` (à la place du vieillissant `html2canvas`) a résolu de nombreux problèmes de "canvas corrompus" et de rendus d'ombres portées.

4. **Micro-interactions et Feedbacks Utilisateur** :
   La gestion des états de chargement, les animations d'entrée (`animate-in fade-in`), et le remplacement des "Toasts" classiques par des modales centrées pour les actions importantes (comme la sauvegarde des paramètres ou l'enregistrement d'une facture) placent l'utilisateur au centre, en limitant les erreurs et la confusion.

5. **Séparation des Préoccupations (Separation of Concerns)** :
   La séparation claire entre les Server Components (pour le layout) et les Client Components (marqués `'use client'` pour l'interactivité comme la page des factures) optimise les performances de React 19 et Next.js 16.

---

*Gestora - Conçu pour l'excellence opérationnelle.*
