const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('Searching for student with most activity via SQL...');

    // 1. Find the student with the most payments
    // We join User and Student to get the phone number and user_id
    const findQuery = `
      SELECT u.id as user_id, u.phone, u.first_name, u.last_name, 
             (SELECT count(*) FROM "Payment" p WHERE p.student_id = s.id) as payment_count,
             (SELECT count(*) FROM "Enrollment" e WHERE e.student_id = s.id) as enrollment_count
      FROM "Student" s
      JOIN "User" u ON s.user_id = u.id
      ORDER BY payment_count DESC, enrollment_count DESC
      LIMIT 1;
    `;

    const res = await client.query(findQuery);
    
    if (res.rows.length === 0) {
      console.log('No students found.');
      return;
    }

    const student = res.rows[0];
    console.log(`Found student: ${student.first_name} ${student.last_name} (${student.phone})`);
    console.log(`Activity: ${student.payment_count} payments, ${student.enrollment_count} enrollments.`);

    // 2. Hash new password
    const newPassword = 'admin123';
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // 3. Update password_hash
    await client.query(
      'UPDATE "User" SET password_hash = $1 WHERE id = $2',
      [passwordHash, student.user_id]
    );

    console.log('--- SUCCESS ---');
    console.log(`Phone: ${student.phone}`);
    console.log(`Password: ${newPassword}`);
    console.log(`Context: Has ${student.payment_count} payments and ${student.enrollment_count} enrollments.`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
