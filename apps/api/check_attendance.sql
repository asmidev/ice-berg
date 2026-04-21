SELECT a.status, a.score, a.date, u.first_name 
FROM "Attendance" a
JOIN "Enrollment" e ON a.enrollment_id = e.id
JOIN "Student" s ON e.student_id = s.id
JOIN "User" u ON s.user_id = u.id
JOIN "Group" g ON e.group_id = g.id
WHERE g.name = 'cycyu' 
AND a.date::date >= '2026-04-20'::date;
