const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAttendance() {
  const groupId = 'a0269e84-c257-4d5f-bd3b-ff4c7733f0b0';
  const targetDateStr = '2026-04-21';
  const targetDate = new Date(targetDateStr + 'T00:00:00Z');

  console.log(`Checking attendance for Group: cycyu (${groupId})`);
  console.log(`Target Date (UTC): ${targetDate.toISOString()}`);

  try {
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
      console.log('No attendance found for this exact date.');
      
      const any = await prisma.attendance.findMany({
          where: { enrollment: { group_id: groupId } },
          orderBy: { date: 'desc' },
          take: 10
      });
      console.log(`\nLast 10 attendance records for this group:`);
      any.forEach(a => console.log(`Date: ${a.date.toISOString()}, Status: ${a.status}, Score: ${a.score}`));
    } else {
      console.log(`\n✅ Found ${attendances.length} attendance records for ${targetDateStr}:`);
      attendances.forEach(a => {
        console.log(`- ${a.enrollment.student.user.first_name}: ${a.status}, Score: ${a.score}`);
      });
    }
  } catch (err) {
    console.error('Error during DB check:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkAttendance();
