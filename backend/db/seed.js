const bcrypt = require('bcryptjs');
const db = require('./index');

console.log('Seeding database...');

// Clear existing data (idempotent re-seed)
db.exec(`
  DELETE FROM activity_events;
  DELETE FROM enrollments;
  DELETE FROM mentor_students;
  DELETE FROM lessons;
  DELETE FROM courses;
  DELETE FROM users;
`);

const passwordHash = bcrypt.hashSync('password123', 10);

const insertUser = db.prepare(
  'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
);
const mentor = insertUser.run('Tanya Mentor', 'mentor@example.com', passwordHash, 'mentor');
const student1 = insertUser.run('Ravi Kumar', 'ravi@example.com', passwordHash, 'student');
const student2 = insertUser.run('Priya Sharma', 'priya@example.com', passwordHash, 'student');

db.prepare('INSERT INTO mentor_students (mentor_id, student_id) VALUES (?, ?)').run(mentor.lastInsertRowid, student1.lastInsertRowid);
db.prepare('INSERT INTO mentor_students (mentor_id, student_id) VALUES (?, ?)').run(mentor.lastInsertRowid, student2.lastInsertRowid);

const insertCourse = db.prepare(
  'INSERT INTO courses (title, description, total_lessons) VALUES (?, ?, ?)'
);
const course1 = insertCourse.run('Web Development Fundamentals', 'HTML, CSS, JS basics to build real websites', 6);
const course2 = insertCourse.run('Data Structures & Algorithms', 'Core CS concepts for problem solving', 5);

const insertLesson = db.prepare(
  'INSERT INTO lessons (course_id, title, sequence, duration_minutes) VALUES (?, ?, ?, ?)'
);
const c1Lessons = [
  'Intro to HTML', 'CSS Layouts', 'JavaScript Basics', 'DOM Manipulation', 'Forms & Events', 'Mini Project'
].map((title, i) => insertLesson.run(course1.lastInsertRowid, title, i + 1, 30 + i * 5).lastInsertRowid);

const c2Lessons = [
  'Arrays & Strings', 'Linked Lists', 'Stacks & Queues', 'Trees', 'Sorting Algorithms'
].map((title, i) => insertLesson.run(course2.lastInsertRowid, title, i + 1, 40).lastInsertRowid);

const insertEnrollment = db.prepare(
  'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)'
);
insertEnrollment.run(student1.lastInsertRowid, course1.lastInsertRowid);
insertEnrollment.run(student1.lastInsertRowid, course2.lastInsertRowid);
insertEnrollment.run(student2.lastInsertRowid, course1.lastInsertRowid);

const insertEvent = db.prepare(
  `INSERT INTO activity_events (student_id, lesson_id, event_type, time_spent_minutes, event_date)
   VALUES (?, ?, ?, ?, ?)`
);

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// Ravi: good progress on course 1 (4/6 completed), started course 2
c1Lessons.forEach((lessonId, i) => {
  const day = daysAgo(20 - i * 3);
  insertEvent.run(student1.lastInsertRowid, lessonId, 'started', 10, day);
  if (i < 4) {
    insertEvent.run(student1.lastInsertRowid, lessonId, 'completed', 25 + i * 5, day);
  }
});
insertEvent.run(student1.lastInsertRowid, c2Lessons[0], 'started', 15, daysAgo(2));
insertEvent.run(student1.lastInsertRowid, c2Lessons[0], 'completed', 35, daysAgo(1));

// Priya: slower, steady pace on course 1 only (2/6 completed)
c1Lessons.slice(0, 3).forEach((lessonId, i) => {
  const day = daysAgo(15 - i * 5);
  insertEvent.run(student2.lastInsertRowid, lessonId, 'started', 10, day);
  if (i < 2) {
    insertEvent.run(student2.lastInsertRowid, lessonId, 'completed', 30, day);
  }
});

console.log('Seed complete.');
console.log('Login credentials (password: password123):');
console.log('  Mentor:  mentor@example.com');
console.log('  Student: ravi@example.com');
console.log('  Student: priya@example.com');
