const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

function assertCanView(req, studentId) {
  if (req.user.role === 'student') {
    return req.user.id === Number(studentId);
  }
  if (req.user.role === 'mentor') {
    const link = db
      .prepare('SELECT 1 FROM mentor_students WHERE mentor_id = ? AND student_id = ?')
      .get(req.user.id, studentId);
    return !!link;
  }
  return false;
}

// GET /api/dashboard/student/:id -> full dashboard payload for one student
router.get('/student/:id', (req, res) => {
  const studentId = req.params.id;

  if (!assertCanView(req, studentId)) {
    return res.status(403).json({ error: 'Not authorized to view this student\'s dashboard' });
  }

  const student = db.prepare('SELECT id, name, email FROM users WHERE id = ? AND role = ?').get(studentId, 'student');
  if (!student) return res.status(404).json({ error: 'Student not found' });

  // Completed lessons count + total time spent (all-time)
  const totals = db
    .prepare(
      `SELECT
         COUNT(DISTINCT CASE WHEN event_type = 'completed' THEN lesson_id END) as completed_lessons,
         COALESCE(SUM(time_spent_minutes), 0) as total_time_minutes
       FROM activity_events WHERE student_id = ?`
    )
    .get(studentId);

  // Progress per enrolled course: completed lessons / total lessons in course
  const progressPerCourse = db
    .prepare(
      `SELECT c.id as course_id, c.title,
              c.total_lessons,
              COUNT(DISTINCT CASE WHEN ae.event_type = 'completed' THEN ae.lesson_id END) as completed_lessons
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN lessons l ON l.course_id = c.id
       LEFT JOIN activity_events ae ON ae.lesson_id = l.id AND ae.student_id = e.student_id
       WHERE e.student_id = ?
       GROUP BY c.id`
    )
    .all(studentId)
    .map((row) => ({
      ...row,
      progress_percent: row.total_lessons > 0
        ? Math.round((row.completed_lessons / row.total_lessons) * 100)
        : 0,
    }));

  // Time-series: minutes spent per day, last 30 days
  const trend = db
    .prepare(
      `SELECT event_date as date, SUM(time_spent_minutes) as minutes
       FROM activity_events
       WHERE student_id = ? AND event_date >= date('now', '-30 days')
       GROUP BY event_date
       ORDER BY event_date ASC`
    )
    .all(studentId);

  // Completion distribution across all enrolled lessons (donut): completed / in_progress / not_started
  const allLessonIds = db
    .prepare(
      `SELECT l.id FROM lessons l
       JOIN enrollments e ON e.course_id = l.course_id AND e.student_id = ?`
    )
    .all(studentId)
    .map((r) => r.id);

  let completed = 0, inProgress = 0, notStarted = 0;
  if (allLessonIds.length > 0) {
    const placeholders = allLessonIds.map(() => '?').join(',');
    const statuses = db
      .prepare(
        `SELECT lesson_id,
                MAX(CASE WHEN event_type = 'completed' THEN 1 ELSE 0 END) as is_completed,
                MAX(CASE WHEN event_type = 'started' THEN 1 ELSE 0 END) as is_started
         FROM activity_events
         WHERE student_id = ? AND lesson_id IN (${placeholders})
         GROUP BY lesson_id`
      )
      .all(studentId, ...allLessonIds);
    const statusMap = new Map(statuses.map((s) => [s.lesson_id, s]));
    for (const id of allLessonIds) {
      const s = statusMap.get(id);
      if (s && s.is_completed) completed++;
      else if (s && s.is_started) inProgress++;
      else notStarted++;
    }
  }

  res.json({
    student,
    completed_lessons: totals.completed_lessons,
    total_time_minutes: totals.total_time_minutes,
    progress_per_course: progressPerCourse,
    trend,
    completion_distribution: { completed, in_progress: inProgress, not_started: notStarted },
  });
});

// GET /api/dashboard/mentor -> list of students under this mentor with a quick summary
router.get('/mentor', requireRole('mentor'), (req, res) => {
  const students = db
    .prepare(
      `SELECT u.id, u.name, u.email
       FROM mentor_students ms
       JOIN users u ON u.id = ms.student_id
       WHERE ms.mentor_id = ?`
    )
    .all(req.user.id);

  const summaries = students.map((s) => {
    const totals = db
      .prepare(
        `SELECT
           COUNT(DISTINCT CASE WHEN event_type = 'completed' THEN lesson_id END) as completed_lessons,
           COALESCE(SUM(time_spent_minutes), 0) as total_time_minutes
         FROM activity_events WHERE student_id = ?`
      )
      .get(s.id);
    return { ...s, ...totals };
  });

  res.json(summaries);
});

module.exports = router;
