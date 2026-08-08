import { useEffect, useState } from 'react';
import client from '../api/client';
import TopBar from '../components/TopBar';
import { useNavigate } from 'react-router-dom';

export default function MentorDashboard() {
  const [students, setStudents] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    client
      .get('/dashboard/mentor')
      .then((res) => setStudents(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load students'));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <TopBar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 60px' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--indigo)', marginBottom: 6 }}>
          Mentor view
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Your students</h1>

        {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}
        {!students && !error && <div style={{ color: 'var(--ink-soft)' }}>Loading…</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {students?.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(`/student/${s.id}`)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12,
                padding: '18px 20px', textAlign: 'left', boxShadow: 'var(--shadow)',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{s.email}</div>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <Metric label="Lessons done" value={s.completed_lessons} />
                <Metric label="Time spent" value={`${Math.floor(s.total_time_minutes / 60)}h ${s.total_time_minutes % 60}m`} />
                <span style={{ color: 'var(--indigo)', fontSize: 13, fontWeight: 600, alignSelf: 'center' }}>View →</span>
              </div>
            </button>
          ))}
          {students?.length === 0 && (
            <div style={{ color: 'var(--ink-soft)', fontSize: 13, padding: 20, textAlign: 'center' }}>
              No students assigned yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontWeight: 700, fontSize: 15 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{label}</div>
    </div>
  );
}
