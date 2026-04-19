
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const payrolls = await prisma.payroll.findMany({
    include: {
      teacher: { include: { user: true } },
      staff: { include: { user: true } },
    }
  });

  console.log('Total Payrolls:', payrolls.length);
  payrolls.forEach((p, i) => {
    console.log(`[${i}] ID: ${p.id}, is_archived: ${p.is_archived}, teacher: ${!!p.teacher}, staff: ${!!p.staff}, name: ${p.teacher?.user?.first_name || p.staff?.user?.first_name}`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
