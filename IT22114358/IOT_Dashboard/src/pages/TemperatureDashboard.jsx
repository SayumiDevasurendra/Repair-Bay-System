import { Link } from 'react-router-dom';

function TemperatureDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f172a' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        borderBottom: '1px solid #1e293b',
        background: '#0f172a',
        flexShrink: 0,
      }}>
        <Link
          to="/"
          style={{
            color: '#64748b',
            textDecoration: 'none',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Dashboard
        </Link>
        <span style={{ color: '#334155', fontSize: '13px' }}>/</span>
        <span style={{ color: '#94a3b8', fontSize: '13px' }}>Temperature & Fire Risk Monitoring</span>
      </div>

      <iframe
        src="http://localhost:8099"
        title="Temperature & Fire Risk Monitoring"
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
        }}
      />
    </div>
  );
}

export default TemperatureDashboard;
