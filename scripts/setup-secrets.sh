#!/usr/bin/env bash
set -euo pipefail

# Usage: export GITHUB_REPO=owner/repo
# Then export variables below or run and follow prompts.

REPO=${GITHUB_REPO:-}
if [ -z "$REPO" ]; then
  echo "Définissez la variable d'environnement GITHUB_REPO (ex: senethialy6840-beep/GESTORA)"
  exit 1
fi

require_cli() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Le CLI '$1' est requis mais introuvable. Installez-le d'abord."
    exit 1
  fi
}

require_cli gh
require_cli vercel

set_secret_gh() {
  local name="$1" value="$2"
  if [ -z "$value" ]; then
    echo "Valeur pour $name non fournie, saut."
    return
  fi
  echo "Ajout du secret GitHub: $name"
  echo -n "$value" | gh secret set "$name" --repo "$REPO" --body -
}

set_env_vercel() {
  local name="$1" value="$2" target=${3:-production}
  if [ -z "$value" ]; then
    echo "Valeur pour $name non fournie, saut."
    return
  fi
  echo "Ajout de la variable Vercel: $name ($target)"
  printf "%s\n" "$value" | vercel env add "$name" "$target" --token "$VERCEL_TOKEN" --yes || true
}

echo "Lecture des variables d'environnement locales (si présentes)..."

# List of supported variables
vars=(
  DATABASE_URL
  DIRECT_URL
  NEXTAUTH_SECRET
  AUTH_SECRET
  SASPAY_SECRET_KEY
  SASPAY_WEBHOOK_SECRET
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_APP_URL
  VERCEL_TOKEN
)

# Export VERCEL_TOKEN from env if set, otherwise gh login required
VERCEL_TOKEN=${VERCEL_TOKEN:-}

for v in "${vars[@]}"; do
  eval val=\"\${$v:-}\"
  # shellcheck disable=SC2154
  case "$v" in
    VERCEL_TOKEN)
      ;;
    *)
      ;;
  esac
done

echo "--- Ajout des secrets sur GitHub (via gh) ---"
set_secret_gh DATABASE_URL "${DATABASE_URL:-}"
set_secret_gh DIRECT_URL "${DIRECT_URL:-}"
set_secret_gh NEXTAUTH_SECRET "${NEXTAUTH_SECRET:-}"
set_secret_gh AUTH_SECRET "${AUTH_SECRET:-}"
set_secret_gh SASPAY_SECRET_KEY "${SASPAY_SECRET_KEY:-}"
set_secret_gh SASPAY_WEBHOOK_SECRET "${SASPAY_WEBHOOK_SECRET:-}"

echo "--- Ajout des variables sur Vercel (via vercel) ---"
if [ -z "$VERCEL_TOKEN" ]; then
  echo "VERCEL_TOKEN non défini : utilisez 'export VERCEL_TOKEN=...' avant d'exécuter pour ajouter sur Vercel via CLI."
else
  set_env_vercel NEXT_PUBLIC_SUPABASE_URL "${NEXT_PUBLIC_SUPABASE_URL:-}" production
  set_env_vercel NEXT_PUBLIC_APP_URL "${NEXT_PUBLIC_APP_URL:-}" production
  set_env_vercel NEXTAUTH_SECRET "${NEXTAUTH_SECRET:-}" production
  set_env_vercel DATABASE_URL "${DATABASE_URL:-}" production
fi

echo "Terminé. Vérifiez GitHub (Settings → Secrets) et Vercel (Project → Environment Variables)."
