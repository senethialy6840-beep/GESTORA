const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const envPath = path.join(__dirname, '..', '.env.vercel');
if (!fs.existsSync(envPath)) {
  console.error("Fichier .env.vercel introuvable.");
  process.exit(1);
}

const lines = fs.readFileSync(envPath, 'utf8').split('\n');

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) continue;
  
  const key = trimmed.substring(0, eqIndex).trim();
  let val = trimmed.substring(eqIndex + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.substring(1, val.length - 1);
  }
  
  console.log(`Ajout de la variable Vercel: ${key}...`);
  try {
    execSync(`npx vercel env add ${key} production`, {
      input: val,
      stdio: ['pipe', 'inherit', 'inherit']
    });
    console.log(`✅ ${key} ajoutée.`);
  } catch (err) {
    console.error(`❌ Échec pour ${key}:`, err.message);
  }
}
