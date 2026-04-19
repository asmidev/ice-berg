const { PrismaClient } = require('../prisma/generated-client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config({ path: './apps/api/.env' });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- ROLES ---');
  const roles = await prisma.role.findMany({
    select: { name: true, slug: true }
  });
  console.table(roles);

  console.log('\n--- LEAD SOURCES ---');
  const leadSources = await prisma.leadSource.findMany({
    select: { name: true, slug: true }
  });
  console.table(leadSources);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
