import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import TrendChart from '../components/TrendChart';
import DonutChart from '../components/DonutChart';
import TopBar from '../components/TopBar';

export default function StudentDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    client
      .get(`/dashboard/student/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load'));
  }, [id]);

  if (error) return (
    <div>
      <TopBar />
      <div style={{ padding: 40, color: 'var(--danger)' }}>{error}</div>
    </div>
  );
  if (!data) return (
    <div>
      <TopBar />
      <div style={{ padding: 40, color: 'var(--ink-soft)' }}>Loading…</div>
    </div>
  );

  const hours = Math.floor(data.total_time_minutes / 60);
  const mins = data.total_time_minutes % 60;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <TopBar />
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 24px 60px' }}>
        <Link to="/mentor" style={{ fontSize: 13, color: 'var(--indigo)', fontWeight: 600, textDecoration: 'none' }}>
          ← Back to students
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '10px 0 24px' }}>{data.student.name}</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          <StatCard label="Lessons completed" value={data.completed_lessons} />
          <StatCard label="Time invested" value={`${hours}h ${mins}m`} />
          <StatCard label="Courses enrolled" value={data.progress_per_course.length} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
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
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow)' }}>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--indigo)' }}>{value}</div>
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
