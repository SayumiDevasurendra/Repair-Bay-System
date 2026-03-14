import { useState } from 'react';
import { Link } from 'react-router-dom';

function NoiseDashboard() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f172a' }}>
      {/* Breadcrumb */}
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
        <span style={{ color: '#94a3b8', fontSize: '13px' }}>Noise Exposure Monitoring</span>
      </div>

      {/* Fallback shown until iframe loads */}
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
            <path d="M12 20V28H18L26 34V14L18 20H12Z" stroke="#475569" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M31 18C32.5 19.5 33.5 21.5 33.5 24C33.5 26.5 32.5 28.5 31 30" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0 }}>Noise module server is not running</p>
          <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>Start it with:</p>
          <code style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '12px',
            color: '#7dd3fc',
          }}>
            cd IT22101310/noiseguard-dashboard-main &amp;&amp; npm run dev
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
        src="http://localhost:8080"
        title="Noise Exposure Monitoring"
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

export default NoiseDashboard;
