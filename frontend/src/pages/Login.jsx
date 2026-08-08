import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = mode === 'login'
        ? await login(email, password)
        : await register(name, email, password, role);
      navigate(user.role === 'mentor' ? '/mentor' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.badge}>01 — Sign in</div>
        <h1 style={styles.title}>Learning Dashboard</h1>
        <p style={styles.subtitle}>Track progress. See it add up.</p>

        <div style={styles.tabs}>
          <button
            onClick={() => setMode('login')}
            style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}
          >
            Log in
          </button>
          <button
            onClick={() => setMode('register')}
            style={{ ...styles.tab, ...(mode === 'register' ? styles.tabActive : {}) }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'register' && (
            <input
              style={styles.input}
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {mode === 'register' && (
            <div style={styles.roleRow}>
              {['student', 'mentor'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  style={{ ...styles.roleBtn, ...(role === r ? styles.roleBtnActive : {}) }}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} style={styles.submit}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <div style={styles.hint}>
          <div style={styles.hintTitle}>Demo accounts</div>
          <div className="mono" style={styles.hintRow}>ravi@example.com · student</div>
          <div className="mono" style={styles.hintRow}>priya@example.com · student</div>
          <div className="mono" style={styles.hintRow}>mentor@example.com · mentor</div>
          <div className="mono" style={styles.hintRow}>password123</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, #f6f7fb 0%, #eef0fd 100%)',
    padding: 24,
  },
  card: {
    width: 400,
    maxWidth: '100%',
    background: 'var(--card)',
    borderRadius: 18,
    padding: '36px 32px',
    boxShadow: 'var(--shadow)',
    border: '1px solid var(--line)',
  },
  badge: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 12,
    color: 'var(--indigo)',
    fontWeight: 500,
    marginBottom: 10,
  },
  title: { fontSize: 26, fontWeight: 700 },
  subtitle: { color: 'var(--ink-soft)', marginTop: 6, marginBottom: 24, fontSize: 14 },
  tabs: { display: 'flex', gap: 4, background: 'var(--paper)', padding: 4, borderRadius: 10, marginBottom: 20 },
  tab: {
    flex: 1, border: 'none', background: 'transparent', padding: '9px 0',
    borderRadius: 8, fontSize: 14, fontWeight: 600, color: 'var(--ink-soft)',
  },
  tabActive: { background: 'var(--card)', color: 'var(--indigo)', boxShadow: '0 1px 3px rgba(20,33,61,0.1)' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: {
    padding: '12px 14px', borderRadius: 10, border: '1px solid var(--line)',
    fontSize: 14, outline: 'none', background: 'var(--paper)',
  },
  roleRow: { display: 'flex', gap: 8 },
  roleBtn: {
    flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid var(--line)',
    background: 'var(--paper)', color: 'var(--ink-soft)', fontSize: 13, fontWeight: 600,
    textTransform: 'capitalize',
  },
  roleBtnActive: { background: 'var(--indigo-soft)', color: 'var(--indigo)', borderColor: 'var(--indigo)' },
  error: { color: 'var(--danger)', fontSize: 13, background: '#fbe9e7', padding: '8px 12px', borderRadius: 8 },
  submit: {
    marginTop: 6, padding: '13px 0', borderRadius: 10, border: 'none',
    background: 'var(--indigo)', color: 'white', fontWeight: 600, fontSize: 14,
  },
  hint: { marginTop: 24, paddingTop: 20, borderTop: '1px dashed var(--line)' },
  hintTitle: { fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 },
  hintRow: { fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.8 },
};
