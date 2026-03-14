import { Link } from 'react-router-dom';
import './HomePage.css';

const modules = [
  {
    id: 'gas',
    title: 'Gas Leak Safety',
    subtitle: 'Monitoring & Risk Analytics',
    description: 'Real-time gas concentration tracking, leak detection alerts, and risk level analysis for repair bay safety.',
    path: '/gas-monitoring',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="module-icon-svg">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <path d="M24 8C24 8 32 18 32 26C32 30.4183 28.4183 34 24 34C19.5817 34 16 30.4183 16 26C16 18 24 8 24 8Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 28C24 28 27 24 27 22C27 20.3431 25.6569 19 24 19C22.3431 19 21 20.3431 21 22C21 24 24 28 24 28Z" fill="currentColor" opacity="0.3" />
        <circle cx="24" cy="38" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="20" cy="40" r="1.5" fill="currentColor" opacity="0.3" />
        <circle cx="28" cy="40" r="1.5" fill="currentColor" opacity="0.3" />
      </svg>
    ),
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)',
    bgGlow: 'rgba(239, 68, 68, 0.08)',
    status: 'Active',
  },
  {
    id: 'temperature',
    title: 'Temperature & Fire Risk',
    subtitle: 'Monitoring Analytics',
    description: 'Continuous temperature surveillance, fire hazard detection, and thermal risk assessment across work zones.',
    path: '/temperature-monitoring',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="module-icon-svg">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <rect x="20" y="8" width="8" height="24" rx="4" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="24" cy="34" r="6" stroke="currentColor" strokeWidth="2.5" />
        <rect x="22" y="18" width="4" height="14" rx="2" fill="currentColor" opacity="0.3" />
        <circle cx="24" cy="34" r="3" fill="currentColor" opacity="0.4" />
        <line x1="30" y1="14" x2="34" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="18" x2="33" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="22" x2="34" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    bgGlow: 'rgba(245, 158, 11, 0.08)',
    status: 'Active',
  },
  {
    id: 'noise',
    title: 'Noise Exposure',
    subtitle: 'Monitoring & Compliance',
    description: 'Decibel-level monitoring, exposure duration tracking, and OSHA compliance reporting for worker safety.',
    path: '/noise-monitoring',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="module-icon-svg">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <path d="M12 20V28H18L26 34V14L18 20H12Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M12 20V28H18L26 34V14L18 20H12Z" fill="currentColor" opacity="0.15" />
        <path d="M31 18C32.5 19.5 33.5 21.5 33.5 24C33.5 26.5 32.5 28.5 31 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M34 14C36.5 16.5 38 20 38 24C38 28 36.5 31.5 34 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    bgGlow: 'rgba(139, 92, 246, 0.08)',
    status: 'Active',
  },
  {
    id: 'vehicle-lift',
    title: 'Vehicle Lift Safety',
    subtitle: 'Monitoring & Alignment',
    description: 'Lift position tracking, load balance verification, and alignment analytics for safe vehicle servicing.',
    path: '/vehicle-lift-monitoring',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="module-icon-svg">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <rect x="10" y="28" width="28" height="4" rx="2" stroke="currentColor" strokeWidth="2.5" />
        <rect x="10" y="28" width="28" height="4" rx="2" fill="currentColor" opacity="0.15" />
        <rect x="14" y="18" width="4" height="10" rx="1" stroke="currentColor" strokeWidth="2" />
        <rect x="30" y="18" width="4" height="10" rx="1" stroke="currentColor" strokeWidth="2" />
        <rect x="18" y="14" width="12" height="6" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="18" y="14" width="12" height="6" rx="2" fill="currentColor" opacity="0.1" />
        <line x1="16" y1="36" x2="16" y2="34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="36" x2="32" y2="34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="12" y1="36" x2="36" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    bgGlow: 'rgba(6, 182, 212, 0.08)',
    status: 'Active',
  },
];

function HomePage() {
  return (
    <div className="home">
      {/* Header */}
      <header className="home-header">
        <div className="home-header-content">
          <div className="home-header-left">
            <div className="home-logo">
              <svg viewBox="0 0 36 36" fill="none" className="home-logo-svg">
                <rect width="36" height="36" rx="8" fill="url(#logoGrad)" />
                <path d="M10 18L16 12L26 22L20 28L10 18Z" fill="white" opacity="0.9" />
                <path d="M18 10L26 18L20 24L12 16L18 10Z" fill="white" opacity="0.5" />
                <defs>
                  <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36">
                    <stop stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="home-header-text">
              <h1>Smart Automotive Repair Bay</h1>
              <p>Safety Monitoring System</p>
            </div>
          </div>
          <div className="home-header-right">
            <div className="home-badge">
              <span className="home-badge-dot"></span>
              System Online
            </div>
            <div className="home-group-tag">Group 2026_21</div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-content">
          <h2 className="home-hero-title">Safety Monitoring Dashboard</h2>
          <p className="home-hero-subtitle">
            Real-time IoT monitoring and analytics for automotive repair bay safety.
            Select a module below to access its dedicated monitoring dashboard.
          </p>
        </div>
      </section>

      {/* Module Cards */}
      <main className="home-main">
        <div className="modules-grid">
          {modules.map((mod) => (
            <Link to={mod.path} key={mod.id} className="module-card" style={{ '--module-color': mod.color, '--module-glow': mod.bgGlow }}>
              <div className="module-card-inner">
                {/* Status indicator */}
                <div className="module-status">
                  <span className="module-status-dot"></span>
                  {mod.status}
                </div>

                {/* Icon */}
                <div className="module-icon" style={{ background: mod.gradient }}>
                  {mod.icon}
                </div>

                {/* Text */}
                <div className="module-text">
                  <h3 className="module-title">{mod.title}</h3>
                  <p className="module-subtitle">{mod.subtitle}</p>
                  <p className="module-description">{mod.description}</p>
                </div>

                {/* Action */}
                <div className="module-action">
                  <span className="module-action-text">Open Dashboard</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <p>IT4021 - Smart Automotive Repair Bay Safety System | Group 2026_21</p>
        <p className="home-footer-sub">IoT-Based Real-Time Safety Monitoring & Analytics Platform</p>
      </footer>
    </div>
  );
}

export default HomePage;
