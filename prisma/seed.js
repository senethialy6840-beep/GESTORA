require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.split('?')[0],
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(`Start seeding ...`);
  
  // 1. Create a Company
  const company = await prisma.company.create({
    data: {
      name: "Gestora Solutions",
      domain: "gestora.local",
      email: "contact@gestora.local",
      address: "123 Rue de la République, Dakar",
      phone: "+221 77 123 45 67"
    }
  });
  console.log(`Created company with id: ${company.id}`);

  // 2. Create an Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const user = await prisma.user.create({
    data: {
      email: "admin@gestora.local",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "Gestora",
      role: "ADMIN",
      companyId: company.id
    }
  });
  console.log(`Created admin user: ${user.email} with password: admin123`);
  
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
