# Progressive Student Dashboard

A full-stack web app that tracks student learning progress across courses, with role-based dashboards for students and mentors, time-series activity trends, and completion visualizations.

Built for the **Full-Stack Developer Challenge 1** assignment.

---

## Tech Stack

| Layer      | Choice                                   |
|------------|-------------------------------------------|
| Frontend   | React 18 (Vite), React Router, Recharts   |
| Backend    | Node.js, Express                          |
| Database   | SQLite (via `better-sqlite3`)             |
| Auth       | JWT (jsonwebtoken) + bcrypt password hashing |

See `ASSIGNMENT_NOTES.docx` (in the parent deliverable) for the full reasoning behind these choices.

---

## Project Structure

```
student-dashboard/
├── backend/
│   ├── db/
│   │   ├── schema.sql       # table definitions
│   │   ├── index.js         # DB connection, runs schema on boot
│   │   └── seed.js          # sample data generator
│   ├── middleware/
│   │   └── auth.js          # JWT verification + role guard
│   ├── routes/
│   │   ├── auth.js          # register / login
│   │   ├── courses.js       # course + lesson listing
│   │   ├── dashboard.js     # aggregation endpoints (the core feature)
│   │   └── activity.js      # log a lesson activity event
│   └── server.js
└── frontend/
    └── src/
        ├── api/client.js          # axios instance with auth interceptor
        ├── context/AuthContext.jsx
        ├── components/            # TopBar, TrendChart, DonutChart
        └── pages/                 # Login, Dashboard, MentorDashboard, StudentDetail
```

---

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
node db/seed.js      # creates dashboard.db and inserts sample data
node server.js        # runs on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
# .env already points VITE_API_URL to http://localhost:4000/api
npm run dev            # runs on http://localhost:5173
```

### 3. Log in with demo accounts

Password for all demo accounts: `password123`

| Role    | Email                |
|---------|------------------------|
| Student | ravi@example.com       |
| Student | priya@example.com      |
| Mentor  | mentor@example.com     |

Or register a brand new account from the Login screen (choose Student or Mentor).

---

## API Reference

All routes except `/api/auth/*` and `/api/health` require an `Authorization: Bearer <token>` header.

### Auth

**POST `/api/auth/register`**
```json
{ "name": "Ravi Kumar", "email": "ravi@example.com", "password": "secret123", "role": "student" }
```
→ `201` `{ "token": "...", "user": { "id", "name", "email", "role" } }`

**POST `/api/auth/login`**
```json
{ "email": "ravi@example.com", "password": "secret123" }
```
→ `200` `{ "token": "...", "user": {...} }`

### Courses

**GET `/api/courses`** → list of courses with lesson counts

**GET `/api/courses/:id/lessons`** → lessons for a course, ordered by sequence

### Dashboard (core feature)

**GET `/api/dashboard/student/:id`**
Returns everything the student dashboard needs in one call:
- `completed_lessons`, `total_time_minutes` (all-time totals)
- `progress_per_course` — per-course completed/total lessons + percentage
- `trend` — `{ date, minutes }[]` for the last 30 days (feeds the line chart)
- `completion_distribution` — `{ completed, in_progress, not_started }` (feeds the donut chart)

Access rule: a student can only view their own `:id`. A mentor can only view students explicitly linked to them via `mentor_students`.

**GET `/api/dashboard/mentor`**
Returns the mentor's linked students with a quick summary (`completed_lessons`, `total_time_minutes`) each — powers the mentor's student list.

### Activity

**POST `/api/activity`**
```json
{ "lesson_id": 3, "event_type": "completed", "time_spent_minutes": 25 }
```
Students log their own `started` / `completed` events here. Every dashboard number is derived from these rows — nothing is stored pre-aggregated, so the data is always consistent with the event log.

---

## Seed Data

`backend/db/seed.js` creates:
- 1 mentor (linked to both students below)
- 2 students with realistic, staggered activity over the last ~20 days
- 2 courses (6 and 5 lessons) with enrollments
- Activity events mixing `started` and `completed`, so the completion donut shows all three states (completed / in progress / not started)

Re-run `node db/seed.js` any time to reset to a clean demo state (it clears and re-inserts).
