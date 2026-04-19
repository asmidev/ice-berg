import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugEnrollment(groupId: string, tenantId: string) {
  console.log('--- DEBUG ENROLLMENT ---');
  console.log('Target Group ID:', groupId);
  console.log('Tenant ID:', tenantId);

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true, name: true, branch_id: true, tenant_id: true }
  });

  if (!group) {
    console.log('ERROR: Group not found');
    return;
  }

  console.log('Group Data:', JSON.stringify(group, null, 2));

  const allActiveStudents = await prisma.student.findMany({
    where: { 
      tenant_id: tenantId,
      is_archived: false
    },
    include: { user: true }
  });

  console.log('All Active Students in Tenant:', allActiveStudents.length);
  allActiveStudents.forEach(s => {
    console.log(`Student: ${s.user.first_name} ${s.user.last_name} | ID: ${s.id} | Branch: ${s.branch_id} | Tenant: ${s.tenant_id}`);
  });

  // Re-run the actual query logic
  const where: any = {
    tenant_id: tenantId,
    is_archived: false,
    enrollments: { none: { group_id: groupId } }
  };

  if (group.branch_id) {
    where.branch_id = group.branch_id;
  }

  const results = await prisma.student.findMany({ where });
  console.log('Query Results (getAvailableStudents logic):', results.length);
}

// Extracting bits from context... the user is in Birlashgan Branch. 
// I'll look for any group first.
async function main() {
  const groups = await prisma.group.findMany({ take: 5 });
  if (groups.length > 0) {
    await debugEnrollment(groups[0].id, groups[0].tenant_id);
  } else {
    console.log('No groups found to debug');
  }
}

main().catch(console.error);
