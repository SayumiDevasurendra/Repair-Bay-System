import { useState } from 'react';
import { Link } from 'react-router-dom';

function TemperatureDashboard() {
  const [loaded, setLoaded] = useState(false);

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

      {!loaded && (
        <div style={{
          position: 'absolute',
          top: '44px',
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          color: '#64748b',
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="#334155" strokeWidth="2" />
            <rect x="20" y="8" width="8" height="24" rx="4" stroke="#475569" strokeWidth="2.5" />
            <circle cx="24" cy="34" r="6" stroke="#475569" strokeWidth="2.5" />
            <rect x="22" y="18" width="4" height="14" rx="2" fill="#475569" opacity="0.3" />
          </svg>
          <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0 }}>Temperature module server is not running</p>
          <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>Start the full system with:</p>
          <code style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '12px',
            color: '#7dd3fc',
          }}>
            npm run dev
          </code>
          <button
            onClick={() => { setLoaded(false); window.location.reload(); }}
            style={{
              marginTop: '8px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '8px 20px',
              color: '#94a3b8',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      <iframe
        src="http://localhost:4359"
        title="Temperature & Fire Risk Monitoring"
        onLoad={() => setLoaded(true)}
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          opacity: loaded ? 1 : 0,
        }}
      />
    </div>
  );
}

export default TemperatureDashboard;
