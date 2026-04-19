import { PrismaClient } from './prisma/generated-client';
const prisma = new PrismaClient();

async function main() {
  try {
    const branches = await prisma.branch.findMany({
       select: { id: true, name: true }
    });
    console.log("Branches:", branches);
    const cashboxes = await prisma.cashbox.findMany({
       include: { branch: true }
    });
    console.log("Cashboxes:", cashboxes.map(c => ({ name: c.name, branch: c.branch?.name })));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
