const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// POST /api/activity -> record a lesson activity event (student logs their own progress)
router.post('/', (req, res) => {
  const { lesson_id, event_type, time_spent_minutes } = req.body;
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can log activity' });
  }
  if (!lesson_id || !event_type || !['started', 'completed'].includes(event_type)) {
    return res.status(400).json({ error: 'lesson_id and valid event_type are required' });
  }
  const today = new Date().toISOString().slice(0, 10);
  const info = db
    .prepare(
      `INSERT INTO activity_events (student_id, lesson_id, event_type, time_spent_minutes, event_date)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(req.user.id, lesson_id, event_type, time_spent_minutes || 0, today);
  res.status(201).json({ id: info.lastInsertRowid });
});

module.exports = router;
