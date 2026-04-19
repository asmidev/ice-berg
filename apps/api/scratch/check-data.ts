import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const groups = await prisma.group.findMany({
    select: { id: true, name: true, branch_id: true, tenant_id: true }
  });
  console.log('--- GROUPS ---');
  console.table(groups);

  const students = await prisma.student.findMany({
     include: { user: true }
  });
  console.log('--- STUDENTS ---');
  console.table(students.map(s => ({
    id: s.id,
    name: `${s.user.first_name} ${s.user.last_name}`,
    branch_id: s.branch_id,
    tenant_id: s.tenant_id,
    is_archived: s.is_archived
  })));
}

main().catch(console.error);
