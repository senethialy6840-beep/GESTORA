const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.csfcmxydtqisalyzuwod:Gestora2026Secure@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=30',
  ssl: { rejectUnauthorized: false }
});

async function fix() {
  try {
    const client = await pool.connect();
    
    // Voir l'état actuel
    const before = await client.query('SELECT id, name, plan, "subscriptionStatus" FROM "Company" LIMIT 20');
    console.log('=== État actuel des entreprises ===');
    before.rows.forEach(r => console.log(`  - ${r.name} | plan: ${r.plan} | status: ${r.subscriptionStatus}`));
    
    // Mettre à jour les entreprises PENDING en ACTIVE
    const update = await client.query("UPDATE \"Company\" SET \"subscriptionStatus\" = 'ACTIVE' WHERE \"subscriptionStatus\" = 'PENDING'");
    console.log('\n✅ Entreprises mises à jour (PENDING -> ACTIVE):', update.rowCount);
    
    // Vérification après mise à jour
    const after = await client.query('SELECT id, name, plan, "subscriptionStatus" FROM "Company" LIMIT 20');
    console.log('\n=== Après correction ===');
    after.rows.forEach(r => console.log(`  - ${r.name} | plan: ${r.plan} | status: ${r.subscriptionStatus}`));
    
    client.release();
    await pool.end();
    console.log('\nDone!');
  } catch(err) {
    console.error('Erreur:', err.message);
    process.exit(1);
  }
}

fix();
