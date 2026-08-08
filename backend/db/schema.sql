-- Users: students + mentors
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('student','mentor')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  total_lessons INTEGER NOT NULL DEFAULT 0
);

-- Lessons belong to a course
CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id),
  title TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30
);

-- Mentor <-> Student mapping
CREATE TABLE IF NOT EXISTS mentor_students (
  mentor_id INTEGER NOT NULL REFERENCES users(id),
  student_id INTEGER NOT NULL REFERENCES users(id),
  PRIMARY KEY (mentor_id, student_id)
);

-- Student enrollment in a course
CREATE TABLE IF NOT EXISTS enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES users(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  enrolled_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id)
);

-- Activity events: one row per lesson-activity, used to derive all aggregates
CREATE TABLE IF NOT EXISTS activity_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES users(id),
  lesson_id INTEGER NOT NULL REFERENCES lessons(id),
  event_type TEXT NOT NULL CHECK(event_type IN ('started','completed')),
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  event_date TEXT NOT NULL -- YYYY-MM-DD, used for time-series aggregation
);

CREATE INDEX IF NOT EXISTS idx_activity_student ON activity_events(student_id);
CREATE INDEX IF NOT EXISTS idx_activity_date ON activity_events(event_date);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
