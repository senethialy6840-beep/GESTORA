Déploiement & Connexions externes
================================

Ce fichier explique comment connecter le dépôt à GitHub Actions, Vercel et Supabase.

Variables / Secrets à ajouter (GitHub Actions secrets, Vercel environment variables, Supabase project):

- `DATABASE_URL` (ex: URL Postgres utilisé par Prisma)
- `DIRECT_URL` (si utilisé pour accès direct)
- `NEXTAUTH_SECRET`
- `AUTH_SECRET`
- `SASPAY_SECRET_KEY` et `SASPAY_WEBHOOK_SECRET` (paiements)
- `NEXT_PUBLIC_SUPABASE_URL` (client)
- `NEXT_PUBLIC_APP_URL`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID` (optionnel)
- `VERCEL_PROJECT_ID` (optionnel)

Procédure rapide:

1. Sur GitHub -> Settings -> Secrets and variables -> Actions -> New repository secret, ajoutez au moins `DATABASE_URL`, `NEXTAUTH_SECRET`, et `VERCEL_TOKEN`.
2. Sur Vercel -> Project Settings -> Environment Variables, ajoutez les mêmes variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_APP_URL`, etc.).
3. Poussez vos modifications sur la branche `main` (ou `master`). Le workflow `.github/workflows/ci-cd.yml` déclenchera la build, appliquera les migrations et déploiera sur Vercel.

Notes de sécurité:
- Ne commitez JAMAIS de fichiers `.env` contenant des secrets.
- Les valeurs présentes localement dans `gestora/.env` sont utilisées pour le développement local uniquement. Copiez-les dans les secrets GitHub / variables Vercel au besoin.

Script d'automatisation
-----------------------

Un script utilitaire est ajouté dans `scripts/setup-secrets.sh` pour automatiser l'ajout des secrets via `gh` et `vercel` CLI. Exemple d'utilisation locale :

```bash
# Exportez la variable indiquant votre repo GitHub
export GITHUB_REPO=senethialy6840-beep/GESTORA

# Exportez les secrets locaux (ou laissez vides et ajoutez manuellement)
export DATABASE_URL="postgresql://..."
export NEXTAUTH_SECRET="votre-secret"
export NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
export VERCEL_TOKEN="vx_xxx"

# Puis exécutez
bash scripts/setup-secrets.sh
```

Le script utilise `gh secret set` pour GitHub et `vercel env add` pour Vercel (nécessite les CLI `gh` et `vercel` installés et authentifiés).

