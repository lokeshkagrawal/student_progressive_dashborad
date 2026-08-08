import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import TrendChart from '../components/TrendChart';
import DonutChart from '../components/DonutChart';
import TopBar from '../components/TopBar';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    client
      .get(`/dashboard/student/${user.id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load dashboard'));
  }, [user.id]);

  if (error) return <div style={{ padding: 40 }}>{error}</div>;
  if (!data) return <div style={{ padding: 40, color: 'var(--ink-soft)' }}>Loading dashboard…</div>;

  const hours = Math.floor(data.total_time_minutes / 60);
  const mins = data.total_time_minutes % 60;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <TopBar />
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 24px 60px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--indigo)', marginBottom: 6 }}>
            Welcome back
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>{data.student.name}</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          <StatCard label="Lessons completed" value={data.completed_lessons} accent="indigo" />
          <StatCard label="Time invested" value={`${hours}h ${mins}m`} accent="teal" />
          <StatCard label="Courses enrolled" value={data.progress_per_course.length} accent="amber" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
          <Panel title="Activity trend" subtitle="Minutes spent per day, last 30 days">
            <TrendChart data={data.trend} />
          </Panel>
          <Panel title="Completion status" subtitle="Across all enrolled lessons">
            <DonutChart
              completed={data.completion_distribution.completed}
              inProgress={data.completion_distribution.in_progress}
              notStarted={data.completion_distribution.not_started}
            />
          </Panel>
        </div>

        <Panel title="Progress by course" subtitle="Completed lessons out of total">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }}>
            {data.progress_per_course.map((c) => (
              <div key={c.course_id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{c.title}</span>
                  <span style={{ color: 'var(--ink-soft)' }}>{c.completed_lessons}/{c.total_lessons} lessons</span>
                </div>
                <div style={{ height: 8, background: 'var(--line)', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${c.progress_percent}%`, height: '100%', background: 'var(--indigo)', borderRadius: 6, transition: 'width 0.4s' }} />
                </div>
              </div>
            ))}
            {data.progress_per_course.length === 0 && (
              <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Not enrolled in any course yet.</div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  const colors = {
    indigo: { bg: 'var(--indigo-soft)', fg: 'var(--indigo)' },
    teal: { bg: 'var(--teal-soft)', fg: 'var(--teal)' },
    amber: { bg: 'var(--amber-soft)', fg: 'var(--amber)' },
  }[accent];
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow)' }}>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: colors.fg }}>{value}</div>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 22, boxShadow: 'var(--shadow)' }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{subtitle}</div>
      </div>
      {children}
    </div>
  );
}
