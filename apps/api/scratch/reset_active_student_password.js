const { PrismaClient } = require('../prisma/generated-client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Searching for students with the most activity...');

    // 1. Find students with many payments and enrollments
    const studentsWithActivity = await prisma.student.findMany({
      select: {
        id: true,
        user_id: true,
        user: {
          select: {
            phone: true,
            first_name: true,
            last_name: true
          }
        },
        _count: {
          select: {
            payments: true,
            enrollments: true,
            grades: true
          }
        }
      },
      orderBy: {
        payments: {
          _count: 'desc'
        }
      },
      take: 1
    });

    if (studentsWithActivity.length === 0) {
      console.log('No students found in the database.');
      return;
    }

    const student = studentsWithActivity[0];
    const phone = student.user.phone;
    const name = `${student.user.first_name} ${student.user.last_name}`;
    const activityCount = student._count.payments + student._count.enrollments;

    console.log(`Found student: ${name} (${phone})`);
    console.log(`Activity: ${student._count.payments} payments, ${student._count.enrollments} enrollments.`);

    // 2. Hash the new password
    const newPassword = 'admin123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // 3. Update the password
    await prisma.user.update({
      where: { id: student.user_id },
      data: { password_hash: passwordHash }
    });

    console.log(`--- SUCCESS ---`);
    console.log(`Account Reset:`);
    console.log(`Phone: ${phone}`);
    console.log(`Password: ${newPassword}`);
    console.log(`User: ${name}`);
    console.log(`Context: Has ${student._count.payments} payments and ${student._count.enrollments} enrollments.`);

  } catch (err) {
    console.error('Error during password reset:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
