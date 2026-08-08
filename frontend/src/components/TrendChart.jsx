import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function TrendChart({ data }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
  }));

  if (formatted.length === 0) {
    return <div style={{ color: 'var(--ink-soft)', fontSize: 13, padding: '40px 0', textAlign: 'center' }}>No activity logged in the last 30 days.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatted} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3538cd" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#3538cd" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e5f0" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#4a5578' }} axisLine={{ stroke: '#e2e5f0' }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#4a5578' }} axisLine={false} tickLine={false} width={32} />
        <Tooltip
          formatter={(value) => [`${value} min`, 'Time spent']}
          contentStyle={{ borderRadius: 10, border: '1px solid #e2e5f0', fontSize: 12 }}
        />
        <Area type="monotone" dataKey="minutes" stroke="#3538cd" strokeWidth={2.5} fill="url(#trendFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
