import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
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
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
