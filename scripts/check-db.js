const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.csfcmxydtqisalyzuwod:Gestora2026Secure@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=30',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const client = await pool.connect();
    
    // Lister toutes les tables
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    console.log('=== Tables dans la DB ===');
    tables.rows.forEach(r => console.log('  -', r.table_name));
    
    // Compter les enregistrements dans chaque table importante
    const tableNames = ['Company', 'User', 'Product', 'Customer', 'Sale', 'Purchase', 'Employee', 'AccountingTransaction'];
    console.log('\n=== Nombre d\'enregistrements ===');
    for (const t of tableNames) {
      try {
        const count = await client.query(`SELECT COUNT(*) FROM "${t}"`);
        console.log(`  ${t}: ${count.rows[0].count}`);
      } catch(e) {
        console.log(`  ${t}: ERREUR - ${e.message}`);
      }
    }
    
    client.release();
    await pool.end();
  } catch(err) {
    console.error('Erreur connexion:', err.message);
    process.exit(1);
  }
}

check();
