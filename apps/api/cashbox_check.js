const { PrismaClient } = require('./prisma/generated-client');
const prisma = new PrismaClient();

async function main() {
  try {
    const cashboxes = await prisma.cashbox.findMany();
    console.log("All Cashboxes:", JSON.stringify(cashboxes, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
