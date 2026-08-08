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

module.exports = router;
