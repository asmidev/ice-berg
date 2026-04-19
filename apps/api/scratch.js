const { PrismaClient } = require('./prisma/generated-client');
const prisma = new PrismaClient();
prisma.cashbox.findMany().then(cache => console.log(cache)).finally(() => prisma.$disconnect());
