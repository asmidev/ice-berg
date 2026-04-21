import { PrismaClient } from './prisma/generated-client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function checkSchedule() {
  try {
    const groupId = 'a0269e84-c257-4d5f-bd3b-ff4c7733f0b0';
    console.log(`Checking schedule for group ID: ${groupId}...`);

    const schedules = await prisma.schedule.findMany({
      where: { group_id: groupId }
    });

    console.log(`Found ${schedules.length} schedule records:`);
    schedules.forEach(s => {
        console.log(`- Day of Week: ${s.day_of_week} | Start: ${s.start_time} | End: ${s.end_time}`);
    });

    // 0 = Sunday, 1 = Monday, 2 = Tuesday
    const targetDate = new Date('2026-04-21');
    console.log(`\nTarget date 2026-04-21 is day of week: ${targetDate.getDay()}`);

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkSchedule();
