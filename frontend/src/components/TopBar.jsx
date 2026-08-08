import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 24px', borderBottom: '1px solid var(--line)', background: 'var(--card)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: 'var(--indigo)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: 13, fontFamily: 'Space Grotesk, sans-serif',
        }}>
          L
        </div>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Learning Dashboard</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
          {user.name} <span style={{ textTransform: 'capitalize', color: 'var(--indigo)' }}>· {user.role}</span>
        </span>
        <button
          onClick={handleLogout}
          style={{
            fontSize: 13, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--line)',
            background: 'var(--paper)', color: 'var(--ink-soft)', fontWeight: 600,
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
