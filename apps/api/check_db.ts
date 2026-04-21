import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAttendance() {
  const groupId = 'a0269e84-c257-4d5f-bd3b-ff4c7733f0b0';
  const targetDateStr = '2026-04-21';
  const targetDate = new Date(targetDateStr);
  targetDate.setHours(0, 0, 0, 0);

  console.log(`Checking attendance for Group: cycyu (${groupId})`);
  console.log(`Target Date: ${targetDate.toISOString()}`);

  const attendances = await prisma.attendance.findMany({
    where: {
      enrollment: { group_id: groupId },
      date: targetDate
    },
    include: {
      enrollment: {
        include: {
          student: { include: { user: true } }
        }
      }
    }
  });

  if (attendances.length === 0) {
    console.log('No attendance found for this date.');
    
    // Check if there's ANY attendance for this group at all
    const any = await prisma.attendance.findMany({
        where: { enrollment: { group_id: groupId } },
        orderBy: { date: 'desc' },
        take: 5
    });
    console.log(`Total group attendances found: ${any.length}`);
    any.forEach(a => console.log(`Date: ${a.date.toISOString()}, Status: ${a.status}, Score: ${a.score}`));
  } else {
    console.log(`✅ Found ${attendances.length} attendance records:`);
    attendances.forEach(a => {
      console.log(`- ${a.enrollment.student.user.first_name}: ${a.status}, Score: ${a.score}`);
    });
  }

  await prisma.$disconnect();
}

checkAttendance();
