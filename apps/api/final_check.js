const { PrismaClient } = require('./prisma/generated-client');
require('dotenv').config();

async function check() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    const groupId = 'a0269e84-c257-4d5f-bd3b-ff4c7733f0b0';
    // Use the date from the user's request (21-aprel)
    const targetDate = new Date('2026-04-21T00:00:00.000Z');

    console.log(`Searching for attendance in group ID: ${groupId} on date: ${targetDate.toISOString()}`);

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

    if (attendances.length > 0) {
      console.log(`✅ SUCCESS: Found ${attendances.length} records!`);
      attendances.forEach(a => {
        console.log(`- ${a.enrollment.student.user.first_name}: ${a.status}, Score: ${a.score}`);
      });
    } else {
      console.log('❌ No attendance found for this exact date.');
      
      // Check last few records
      const latest = await prisma.attendance.findMany({
        where: { enrollment: { group_id: groupId } },
        orderBy: { date: 'desc' },
        take: 5,
        include: { enrollment: { include: { student: { include: { user: true } } } } }
      });
      console.log('\nLatest records for this group:');
      latest.forEach(a => {
        console.log(`- ${a.enrollment.student.user.first_name} | Date: ${a.date.toISOString()} | Status: ${a.status} | Score: ${a.score}`);
      });
    }
  } catch (e) {
    console.error('Query Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
