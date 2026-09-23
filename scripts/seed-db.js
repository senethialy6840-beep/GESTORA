const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: 'postgresql://postgres.csfcmxydtqisalyzuwod:Gestora2026Secure@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=30',
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  try {
    const client = await pool.connect();

    // Vérifier si la table User a des données
    const userCount = await client.query('SELECT COUNT(*) FROM "User"');
    console.log('Utilisateurs existants:', userCount.rows[0].count);

    if (parseInt(userCount.rows[0].count) > 0) {
      console.log('\n⚠️  Des utilisateurs existent déjà. Affichage de ceux existants:');
      const users = await client.query('SELECT u.email, u.role, u."firstName", u."lastName", c.name as company, c."subscriptionStatus", c.plan FROM "User" u JOIN "Company" c ON u."companyId" = c.id');
      users.rows.forEach(u => {
        console.log(`  - ${u.email} | ${u.firstName} ${u.lastName} | ${u.company} | plan: ${u.plan} | status: ${u.subscriptionStatus}`);
      });

      // Mettre à jour le statut de toutes les entreprises en ACTIVE
      const updateResult = await client.query("UPDATE \"Company\" SET \"subscriptionStatus\" = 'ACTIVE', plan = 'ENTERPRISE' WHERE \"subscriptionStatus\" != 'ACTIVE' OR plan = 'FREE'");
      console.log('\n✅ Mise à jour plan ENTERPRISE + status ACTIVE:', updateResult.rowCount, 'entreprises');

      // Vérifier après mise à jour
      const after = await client.query('SELECT email, c.name, c."subscriptionStatus", c.plan FROM "User" u JOIN "Company" c ON u."companyId" = c.id');
      console.log('\nAprès mise à jour:');
      after.rows.forEach(u => console.log(`  - ${u.email} | ${u.name} | plan: ${u.plan} | status: ${u.subscriptionStatus}`));

      client.release();
      await pool.end();
      return;
    }

    // Créer une entreprise de démonstration
    const companyId = uuidv4();
    await client.query(
      `INSERT INTO "Company" (id, name, plan, "subscriptionStatus", "isActive", "createdAt", "updatedAt") 
       VALUES ($1, $2, 'ENTERPRISE', 'ACTIVE', true, NOW(), NOW())`,
      [companyId, 'Mon Entreprise']
    );
    console.log('✅ Entreprise créée:', companyId);

    // Créer un utilisateur admin
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash('Admin2026!', 10);
    await client.query(
      `INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "isActive", "companyId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, 'ADMIN', true, $6, NOW(), NOW())`,
      [userId, 'admin@gestora.sn', hashedPassword, 'Admin', 'Gestora', companyId]
    );
    console.log('✅ Utilisateur créé: admin@gestora.sn');

    // Créer le propriétaire de la plateforme
    const ownerId = uuidv4();
    const ownerCompanyId = uuidv4();
    await client.query(
      `INSERT INTO "Company" (id, name, plan, "subscriptionStatus", "isActive", "createdAt", "updatedAt") 
       VALUES ($1, $2, 'ENTERPRISE', 'ACTIVE', true, NOW(), NOW())`,
      [ownerCompanyId, 'Gestora Platform']
    );
    const ownerPassword = await bcrypt.hash('GestoraOwner2026!', 10);
    await client.query(
      `INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "isActive", "companyId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, 'SUPER_ADMIN', true, $6, NOW(), NOW())`,
      [ownerId, 'gestorame112@gmail.com', ownerPassword, 'Fatou', 'SENE', ownerCompanyId]
    );
    console.log('✅ Propriétaire créé: gestorame112@gmail.com');

    console.log('\n=================================================');
    console.log('🎉 Base de données initialisée avec succès!');
    console.log('=================================================');
    console.log('\n📧 Compte Admin:');
    console.log('   Email: admin@gestora.sn');
    console.log('   Mot de passe: Admin2026!');
    console.log('\n📧 Compte Propriétaire:');
    console.log('   Email: gestorame112@gmail.com');
    console.log('   Mot de passe: GestoraOwner2026!');
    console.log('=================================================\n');

    client.release();
    await pool.end();
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

seed();
