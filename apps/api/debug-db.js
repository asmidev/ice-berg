
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- DATABASE DEEP ANALYSIS START ---');
  
  // 1. Search for the group 'cycyu'
  const groupName = 'cycyu';
  const group = await prisma.group.findFirst({
    where: { name: { contains: groupName, mode: 'insensitive' } },
    include: {
      enrollments: {
        include: {
          student: {
            include: { user: true }
          }
        }
      }
    }
  });

  if (!group) {
    console.log(`ERROR: Group with name like "${groupName}" NOT FOUND.`);
    // Try to list last 5 groups to see what names they have
    const lastGroups = await prisma.group.findMany({ take: 5, orderBy: { created_at: 'desc' } });
    console.log('Last 5 groups in DB:', lastGroups.map(g => ({ id: g.id, name: g.name })));
    return;
  }

  console.log('GROUP FOUND:');
  console.log(JSON.stringify({
    id: group.id,
    name: group.name,
    tenant_id: group.tenant_id,
    status: group.status,
    is_archived: group.is_archived,
    start_date: group.start_date
  }, null, 2));

  console.log(`\nENROLLMENTS (${group.enrollments.length}):`);
  group.enrollments.forEach((e, idx) => {
    console.log(`${idx + 1}. Student: ${e.student.user.first_name} ${e.student.user.last_name}`);
    console.log(`   Enrollment ID: ${e.id}`);
    console.log(`   Status: ${e.status}`);
    console.log(`   Student Status: ${e.student.status}`);
  });

  console.log('\n--- DATABASE DEEP ANALYSIS END ---');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
