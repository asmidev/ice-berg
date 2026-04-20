import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing Cron Job Logic...');

  // 1. Fetch valid references
  const branch = await prisma.branch.findFirst();
  const teacher = await prisma.teacher.findFirst();
  const course = await prisma.course.findFirst();
  const student = await prisma.student.findFirst();

  if (!branch || !teacher || !course || !student) {
    console.log('Missing basic records in DB. Please ensure tenant, branch, teacher, course, and student exist.');
    return;
  }

  // 2. Create a Mock Group simulating an ended stage
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mockGroup = await prisma.group.create({
    data: {
      tenant_id: branch.tenant_id,
      branch_id: branch.id,
      course_id: course.id,
      teacher_id: teacher.id,
      name: 'TEST CRON GROUP - 1',
      capacity: 10,
      start_date: new Date('2026-03-01'), // started last month
      end_date: yesterday, // Ended yesterday! Should trigger the cron logic.
      price: 200000,
      status: 'ACTIVE',
      is_archived: false,
    }
  });

  console.log('Created Mock Group:', mockGroup.id);

  // 3. Add an Enrollment (student joined)
  await prisma.enrollment.create({
    data: {
      tenant_id: mockGroup.tenant_id,
      group_id: mockGroup.id,
      student_id: student.id,
      status: 'ACTIVE',
      enrolled_at: new Date('2026-03-01'),
      balance: 0,
      discount_value: 0
    }
  });

  console.log('Created Mock Enrollment for Student:', student.id);

  // 4. Create an Invoice simulating the student was billed
  await prisma.invoice.create({
    data: {
      tenant_id: mockGroup.tenant_id,
      branch_id: mockGroup.branch_id,
      student_id: student.id,
      group_id: mockGroup.id,
      type: 'COURSE',
      amount: 200000,
      period: '2026-03',
      status: 'PAID', // or PENDING
      month: '2026-03',
    }
  });

  console.log('Created Mock Course Invoice for student.');
  
  console.log('TEST DATA READY! Now we can manually trigger the Finance Service Cron logic or test it via API.');
}

main().finally(() => prisma.$disconnect());
