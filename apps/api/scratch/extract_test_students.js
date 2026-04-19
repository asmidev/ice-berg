const { PrismaClient } = require('../prisma/generated-client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  try {
    const students = await prisma.user.findMany({
      where: {
        role: {
          slug: 'student'
        }
      },
      take: 5,
      select: {
        phone: true,
        first_name: true,
        last_name: true,
      }
    });

    console.log('--- FOUND STUDENTS ---');
    console.log(JSON.stringify(students, null, 2));
  } catch (err) {
    console.error('Error fetching students:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
