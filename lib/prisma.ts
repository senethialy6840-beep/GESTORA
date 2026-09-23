import 'server-only';
import { PrismaClient } from '@prisma/client';
import "@/lib/env";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || "postgres://dummy:dummy@localhost/dummy";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function ensureCompanyExists(companyId: string, companyName?: string) {
  if (!companyId) return null;
  try {
    const existing = await prisma.company.findUnique({ where: { id: companyId } });
    if (!existing) {
      const created = await prisma.company.create({
        data: {
          id: companyId,
          name: companyName || "Mon Entreprise",
          plan: "FREE",
          subscriptionStatus: "ACTIVE",
          isActive: true,
        },
      });
      return created;
    }
    return existing;
  } catch (error) {
    console.error("Error ensuring company exists:", error);
    return null;
  }
}

