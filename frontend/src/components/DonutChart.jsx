import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = { Completed: '#0f9d8f', 'In progress': '#e08e0b', 'Not started': '#b9bfd4' };

export default function DonutChart({ completed, inProgress, notStarted }) {
  const data = [
    { name: 'Completed', value: completed },
    { name: 'In progress', value: inProgress },
    { name: 'Not started', value: notStarted },
  ].filter((d) => d.value > 0);

  const total = completed + inProgress + notStarted;

  if (total === 0) {
    return <div style={{ color: 'var(--ink-soft)', fontSize: 13, padding: '40px 0', textAlign: 'center' }}>No enrolled lessons yet.</div>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e5f0', fontSize: 12 }} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ fontSize: 12, color: '#4a5578' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={centerStyle}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{Math.round((completed / total) * 100)}%</div>
        <div style={{ fontSize: 10, color: 'var(--ink-soft)' }}>done</div>
      </div>
    </div>
  );
}

const centerStyle = {
  position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)',
  textAlign: 'center', pointerEvents: 'none',
};
