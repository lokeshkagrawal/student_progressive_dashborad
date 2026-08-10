const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// List all courses (with lesson count)
router.get('/', (req, res) => {
  const courses = db
    .prepare(
      `SELECT c.id, c.title, c.description, c.total_lessons,
              COUNT(l.id) as lesson_count
       FROM courses c
       LEFT JOIN lessons l ON l.course_id = c.id
       GROUP BY c.id`
    )
    .all();
  res.json(courses);
});

// Lessons for a course
router.get('/:id/lessons', (req, res) => {
  const lessons = db
    .prepare('SELECT * FROM lessons WHERE course_id = ? ORDER BY sequence ASC')
    .all(req.params.id);
  res.json(lessons);
});

// Enroll the logged-in student in a course
router.post('/:id/enroll', (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can enroll in courses' });
  }

  const courseId = req.params.id;
  const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const existing = db
    .prepare('SELECT 1 FROM enrollments WHERE student_id = ? AND course_id = ?')
    .get(req.user.id, courseId);
  if (existing) {
    return res.status(409).json({ error: 'Already enrolled in this course' });
  }

  db.prepare('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)').run(req.user.id, courseId);
  res.status(201).json({ message: 'Enrolled successfully', course_id: Number(courseId) });
});


module.exports = router;
