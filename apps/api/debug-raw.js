
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- RAW DB DUMP (NO EXTENSIONS) ---');
  
  // Find group by name
  const group = await prisma.group.findFirst({
    where: { name: { contains: 'cycyu', mode: 'insensitive' } },
  });

  if (!group) {
    console.log('Group cycyu not found');
    return;
  }

  console.log('Group Data:', group);

  // Find enrollments for this group
  const enrollments = await prisma.enrollment.findMany({
    where: { group_id: group.id },
    include: {
        student: { include: { user: true } }
    }
  });

  console.log('Enrollments count:', enrollments.length);
  enrollments.forEach(e => {
    console.log(`- ${e.student.user.first_name} ${e.student.user.last_name} (Status: ${e.status})`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
