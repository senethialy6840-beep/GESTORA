const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users in DB:", users.map(u => u.email));

  // Test SMTP connection
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || 'gestorame112@gmail.com',
      pass: process.env.SMTP_PASS || 'rprq qdze bwgp yfax',
    },
  });

  try {
    await transporter.verify();
    console.log("SMTP connection verified successfully");
  } catch (err) {
    console.error("SMTP verification failed:", err);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
