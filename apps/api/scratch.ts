
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debug() {
  console.log('--- DEBUG START ---');
  
  // 1. Find the group named 'cycyu' or similar
  const group = await prisma.group.findFirst({
    where: { name: { contains: 'cycyu', mode: 'insensitive' } },
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
    console.log('Group not found');
    return;
  }

  console.log('Group:', {
    id: group.id,
    name: group.name,
    tenant_id: group.tenant_id,
    status: group.status,
    is_archived: group.is_archived
  });

  console.log('Enrollments count:', group.enrollments.length);
  group.enrollments.forEach(e => {
    console.log('Enrollment:', {
      id: e.id,
      status: e.status,
      studentName: `${e.student.user.first_name} ${e.student.user.last_name}`,
      studentStatus: e.student.status
    });
  });

  console.log('--- DEBUG END ---');
}

debug()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
