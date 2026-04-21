import { PrismaClient } from './prisma/generated-client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function check() {
  try {
    const groupId = 'a0269e84-c257-4d5f-bd3b-ff4c7733f0b0';
    const targetDate = new Date('2026-04-20T00:00:00Z');

    console.log(`Checking DB for group cycyu on 2026-04-20...`);

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
      console.log(`✅ SUCCESS: Found ${attendances.length} records in DB:`);
      attendances.forEach(a => {
        console.log(`- ${a.enrollment.student.user.first_name} | Date: ${a.date.toISOString()} | Status=${a.status}, Score=${a.score}`);
      });
    } else {
      console.log(`❌ No records found for 2026-04-21.`);
      
      const latest = await prisma.attendance.findMany({
        where: { enrollment: { group_id: groupId } },
        orderBy: { date: 'desc' },
        take: 3,
        include: { enrollment: { include: { student: { include: { user: true } } } } }
      });
      console.log(`\nLast 3 records for this group:`);
      latest.forEach(a => {
        console.log(`- Date: ${a.date.toISOString()}, User: ${a.enrollment.student.user.first_name}, Status: ${a.status}, Score: ${a.score}`);
      });
    }
  } catch (e) {
    console.error('Error during database check:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

check();
