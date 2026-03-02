import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ────────────── Font Loader & Global Styles ────────────── */
const FontLoader = () => (
  <style>{`
    @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,800,900&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    @keyframes pulseGlow {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    @keyframes slideInFromTop {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes scrollArrow {
      0%, 100% { opacity: 0.3; transform: translateY(0); }
      50% { opacity: 0.8; transform: translateY(6px); }
    }
    @keyframes scanline {
      0% { top: -2px; }
      100% { top: 100%; }
    }
    @keyframes rugFade {
      0% { text-shadow: 0 0 20px rgba(255,59,92,0.6), 0 0 40px rgba(255,59,92,0.3); }
      50% { text-shadow: 0 0 8px rgba(255,59,92,0.15), 0 0 16px rgba(255,59,92,0.08); }
      100% { text-shadow: 0 0 20px rgba(255,59,92,0.6), 0 0 40px rgba(255,59,92,0.3); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes floatCard {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    ${Array.from({ length: 25 }, (_, i) => `
    @keyframes topoFlow${i} {
      0% { stroke-dashoffset: ${1200 + i * 50}; }
      100% { stroke-dashoffset: 0; }
    }`).join('')}

    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      background: #06080d;
      color: #e8edf5;
      font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .font-heading { font-family: 'Satoshi', sans-serif; }

    .card-glass {
      background: #0c1018;
      border: 1px solid #1a2235;
      transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
    }
    .card-glass:hover {
      border-color: rgba(0, 240, 255, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(0, 240, 255, 0.06);
    }

    .btn-primary {
      background: #00f0ff;
      color: #06080d;
      border: none;
      font-weight: 700;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.3), inset 0 1px 0 rgba(255,255,255,0.1);
      transition: box-shadow 0.3s, transform 0.2s;
    }
    .btn-primary:hover {
      box-shadow: 0 0 30px rgba(0, 240, 255, 0.5), 0 0 60px rgba(0, 240, 255, 0.2);
      transform: translateY(-1px);
    }
    .btn-primary::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
      background-size: 200% 100%;
      animation: shimmer 3s ease infinite;
    }

    .btn-outline {
      background: transparent;
      color: #00f0ff;
      border: 1px solid rgba(0,240,255,0.4);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-outline:hover {
      background: rgba(0,240,255,0.1);
      border-color: rgba(0,240,255,0.7);
    }

    .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }
    .reveal-delay-4 { transition-delay: 0.4s; }
    .reveal-delay-5 { transition-delay: 0.5s; }

    .hiw-card {
      background: #0c1018;
      border: 1px solid #1a2235;
      border-radius: 16px;
      overflow: hidden;
      transition: transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease;
    }
    .hiw-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      border-color: rgba(0,240,255,0.2);
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #06080d; }
    ::-webkit-scrollbar-thumb { background: #1a2235; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #2a3a55; }

    @media (max-width: 768px) {
      .nav-links-desktop { display: none !important; }
      .mobile-menu-btn { display: block !important; }
      .connect-btn-desktop { display: none !important; }
    }
  `}</style>
);

/* ────────────── Topography SVG Background ────────────── */
const TopographyBackground = () => {
  const paths = [];
  for (let i = 0; i < 28; i++) {
    const y = 20 + (i * 30) + (i % 3) * 15;
    const c1y = y + (i % 2 === 0 ? -30 : 30) + (i % 5) * 6;
    const c2y = y + (i % 2 === 0 ? 25 : -25) - (i % 4) * 5;
    const c3y = y + (i % 3 === 0 ? -20 : 20) + (i % 7) * 3;
    const c4y = y + (i % 2 === 0 ? 15 : -15) - (i % 3) * 8;
    paths.push(
      `M-60,${y} C${150 + i * 10},${c1y} ${350 + i * 5},${c2y} ${550 + i * 8},${c3y} S${850 + i * 6},${c4y} ${1100 + i * 4},${c1y + 10} S${1450 + i * 3},${c2y - 5} 1960,${y + (i % 6) * 4}`
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
      <svg
        viewBox="0 0 1900 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%' }}
      >
        {paths.map((d, i) => {
          const opacity = 0.03 + (i % 6) * 0.01;
          const strokeWidth = 0.4 + (i % 5) * 0.25;
          const duration = 22 + (i % 9) * 2.5;
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={`rgba(0,240,255,${opacity})`}
              strokeWidth={strokeWidth}
              strokeDasharray="1200"
              strokeDashoffset="1200"
              style={{
                animation: `topoFlow${i % 25} ${duration}s linear infinite`,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};

/* ────────────── Intersection Observer Hook ────────────── */
const useReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
};

/* ────────────── Animated Counter Hook ────────────── */
const useCounter = (end, duration = 2000, decimals = 0) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            if (decimals > 0) {
              setVal(parseFloat((eased * end).toFixed(decimals)));
            } else {
              setVal(Math.floor(eased * end));
            }
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration, decimals]);

  return { ref, val };
};

/* ────────────── Shield Logo SVG ────────────── */
const ShieldLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Outer shield shape - angular/geometric */}
    <path
      d="M32 4L8 16v16c0 14 10 26 24 28 14-2 24-14 24-28V16L32 4z"
      fill="none"
      stroke="#00f0ff"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Inner geometric facets */}
    <path d="M32 4L32 32" stroke="rgba(0,240,255,0.25)" strokeWidth="1" />
    <path d="M8 16L32 32" stroke="rgba(0,240,255,0.15)" strokeWidth="1" />
    <path d="M56 16L32 32" stroke="rgba(0,240,255,0.15)" strokeWidth="1" />
    {/* Center checkmark */}
    <path
      d="M22 32l7 7 13-16"
      stroke="#00f0ff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Top accent line */}
    <path
      d="M32 4L8 16"
      stroke="#00f0ff"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M32 4L56 16"
      stroke="#00f0ff"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

/* ────────────── Navbar ────────────── */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [connected, setConnected] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = ['How It Works', 'Live Feed', 'Features', 'Stats'];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? 'rgba(6,8,13,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(0,240,255,0.08)' : '1px solid transparent',
      transition: 'all 0.3s',
    }}>
      {scrolled && (
        <div style={{
          position: 'absolute', bottom: -1, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.15), transparent)',
        }} />
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <ShieldLogo />
          <span className="font-heading" style={{ fontSize: 18, fontWeight: 700, color: '#e8edf5', letterSpacing: '-0.02em' }}>TrenchGuard</span>
        </div>

        <div style={{ display: 'flex', gap: 32 }} className="nav-links-desktop">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              style={{ color: '#8892a4', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500 }}
              onMouseEnter={e => e.target.style.color = '#e8edf5'}
              onMouseLeave={e => e.target.style.color = '#8892a4'}
            >{l}</a>
          ))}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-menu-btn"
          style={{ display: 'none', background: 'none', border: 'none', color: '#e8edf5', cursor: 'pointer', padding: 4 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen
              ? <path d="M6 6l12 12M6 18L18 6" />
              : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
          </svg>
        </button>

        <button
          onClick={() => setConnected(!connected)}
          className="connect-btn-desktop"
          style={{
            background: connected ? 'rgba(0,240,255,0.1)' : 'transparent',
            border: '1px solid rgba(0,240,255,0.5)',
            color: connected ? '#00f0ff' : '#e8edf5',
            padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 0 12px rgba(0,240,255,0.15)',
            transition: 'all 0.3s',
            fontFamily: connected ? "'JetBrains Mono', monospace" : 'inherit',
          }}
        >
          {connected ? '7fK3...a2dR' : 'Connect Wallet'}
        </button>
      </div>

      {mobileOpen && (
        <div style={{
          background: 'rgba(6,8,13,0.95)', backdropFilter: 'blur(16px)',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16,
          borderBottom: '1px solid #1a2235'
        }}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              onClick={() => setMobileOpen(false)}
              style={{ color: '#8892a4', fontSize: 15, textDecoration: 'none', fontWeight: 500 }}
            >{l}</a>
          ))}
          <button
            onClick={() => { setConnected(!connected); setMobileOpen(false); }}
            style={{
              background: connected ? 'rgba(0,240,255,0.1)' : 'transparent',
              border: '1px solid rgba(0,240,255,0.5)',
              color: connected ? '#00f0ff' : '#e8edf5',
              padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: connected ? "'JetBrains Mono', monospace" : 'inherit',
              textAlign: 'left',
            }}
          >
            {connected ? '7fK3...a2dR' : 'Connect Wallet'}
          </button>
        </div>
      )}
    </nav>
  );
};

/* ────────────── Hero Section ────────────── */
const Hero = () => {
  const revealRef = useReveal();
  const positionsCounter = useCounter(14847, 2200);
  const savedCounter = useCounter(12.4, 2000, 1);
  const responseCounter = useCounter(0.3, 1800, 1);

  return (
    <section id="hero" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, padding: '120px 24px 60px' }}>
      <div ref={revealRef} className="reveal" style={{ textAlign: 'center', maxWidth: 800 }}>
        <h1 className="font-heading" style={{ fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24 }}>
          Front-Run The{' '}
          <span style={{ color: '#ff3b5c', animation: 'rugFade 4s ease infinite' }}>Rugs</span>.
        </h1>

        <p style={{ color: '#8892a4', fontSize: 'clamp(15px, 2vw, 18px)', lineHeight: 1.7, maxWidth: 620, margin: '0 auto 40px' }}>
          Your positions. Protected. When a dev or whale initiates a sell large enough to crash the price 30%+, TrenchGuard intercepts it — automatically exiting your position to SOL before the dump lands. You receive a real-time alert with full details and the optimal re-entry price. Stop watching charts. Start trading protected.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          <button className="btn-primary" style={{
            padding: '14px 36px', borderRadius: 10, fontSize: 15,
          }}>Launch App</button>
          <button className="btn-outline" style={{
            padding: '14px 36px', borderRadius: 10, fontSize: 15,
          }}>Read Docs</button>
        </div>

        <div className="font-mono" style={{
          display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap',
          fontSize: 13, color: '#4a5568',
        }}>
          <span ref={positionsCounter.ref}>
            <span style={{ color: '#8892a4' }}>{positionsCounter.val.toLocaleString()}</span> positions protected
          </span>
          <span style={{ color: '#4a5568' }}>&middot;</span>
          <span ref={savedCounter.ref}>
            <span style={{ color: '#8892a4' }}>${savedCounter.val}M</span> in value saved
          </span>
          <span style={{ color: '#4a5568' }}>&middot;</span>
          <span ref={responseCounter.ref}>
            <span style={{ color: '#8892a4' }}>{responseCounter.val}s</span> avg interception
          </span>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 32, animation: 'scrollArrow 2s ease infinite' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
};

/* ────────────── How It Works ────────────── */
const HowItWorksCard = ({ step: s, index: i }) => {
  const cardRef = useReveal();

  return (
    <div
      ref={cardRef}
      className={`reveal hiw-card reveal-delay-${i + 1}`}
    >
      {/* Top glow line */}
      <div style={{
        height: 2,
        background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
        opacity: 0.7,
      }} />

      {/* Image only */}
      <img
        src={s.image}
        alt={s.title}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
        }}
      />
    </div>
  );
};

const HowItWorks = () => {
  const revealRef = useReveal();

  const steps = [
    { title: 'Detect', color: '#00f0ff', image: 'https://i.imgur.com/ZolZcRd.jpeg' },
    { title: 'Intercept', color: '#7b61ff', image: 'https://i.imgur.com/Oe2UUrw.jpeg' },
    { title: 'Alert & Re-Entry', color: '#00ff88', image: 'https://i.imgur.com/uul8xRq.jpeg' },
  ];

  return (
    <section id="how-it-works" style={{ position: 'relative', zIndex: 1, padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div ref={revealRef} className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
        <h2 className="font-heading" style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>
          How TrenchGuard Protects You
        </h2>
        <p style={{ color: '#8892a4', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
          Three layers of defense between you and the rug.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {steps.map((s, i) => (
          <HowItWorksCard key={s.title} step={s} index={i} />
        ))}
      </div>
    </section>
  );
};

/* ────────────── Live Protection Feed ────────────── */
const FEED_TEMPLATES = [
  { type: 'Dev sell detected', token: '$PNUT', amount: '419 SOL', status: 'INTERCEPTED' },
  { type: 'Whale dump blocked', token: '$HAWKS', amount: '1,247 SOL', status: 'PROTECTED' },
  { type: 'LP removal detected', token: '$GIGA', amount: '873 SOL', status: 'INTERCEPTED' },
  { type: 'Dev sell detected', token: '$GROYPER', amount: '2,130 SOL', status: 'PROTECTED' },
  { type: 'Large sell blocked', token: '$MICHI', amount: '561 SOL', status: 'INTERCEPTED' },
  { type: 'Whale exit detected', token: '$FWOG', amount: '119 SOL', status: 'PROTECTED' },
  { type: 'Dev dump blocked', token: '$BUCK', amount: '1,890 SOL', status: 'INTERCEPTED' },
  { type: 'LP drain detected', token: '$SPX', amount: '3,420 SOL', status: 'PROTECTED' },
];

const LiveFeed = () => {
  const revealRef = useReveal();
  const [entries, setEntries] = useState([]);
  const idRef = useRef(0);

  const makeEntry = useCallback(() => {
    const t = FEED_TEMPLATES[idRef.current % FEED_TEMPLATES.length];
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    idRef.current++;
    return { ...t, ts, id: idRef.current };
  }, []);

  useEffect(() => {
    const initial = [];
    for (let i = 0; i < 6; i++) initial.push(makeEntry());
    setEntries(initial);

    const interval = setInterval(() => {
      setEntries(prev => {
        const next = [makeEntry(), ...prev];
        return next.slice(0, 6);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [makeEntry]);

  return (
    <section id="live-feed" style={{ position: 'relative', zIndex: 1, padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
      <div ref={revealRef} className="reveal">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <h2 className="font-heading" style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Live Protection Feed
          </h2>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: '#00ff88',
            animation: 'pulseGlow 2s ease infinite', display: 'inline-block',
            boxShadow: '0 0 8px #00ff88',
          }} />
        </div>

        <div style={{
          borderRadius: 12, overflow: 'hidden',
          background: 'rgba(12, 16, 24, 0.8)',
          border: '1px solid #1a2235',
          position: 'relative',
        }}>
          {/* Scanline grid overlay */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.012) 2px, rgba(0,240,255,0.012) 4px)',
            pointerEvents: 'none', zIndex: 2,
          }} />
          {/* Moving scanline */}
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.06), transparent)',
            animation: 'scanline 8s linear infinite',
            pointerEvents: 'none', zIndex: 3,
          }} />

          {/* Terminal header */}
          <div style={{
            padding: '10px 16px', borderBottom: '1px solid #1a2235',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff3b5c' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffaa00' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#00ff88' }} />
            <span className="font-mono" style={{ color: '#4a5568', fontSize: 11, marginLeft: 8 }}>trenchguard_monitor_v2.4.1</span>
          </div>

          <div style={{ padding: 16, position: 'relative', zIndex: 1 }}>
            {entries.map((entry, i) => {
              const isIntercepted = entry.status === 'INTERCEPTED';
              const statusColor = isIntercepted ? '#ff3b5c' : '#00ff88';
              const statusBg = isIntercepted ? 'rgba(255,59,92,0.08)' : 'rgba(0,255,136,0.08)';
              const statusBorder = isIntercepted ? 'rgba(255,59,92,0.2)' : 'rgba(0,255,136,0.2)';

              return (
                <div
                  key={entry.id}
                  className="font-mono"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto auto auto',
                    gap: '0 12px',
                    alignItems: 'center',
                    padding: '8px 8px',
                    borderRadius: 6,
                    fontSize: 'clamp(11px, 1.4vw, 13px)',
                    background: i === 0 ? 'rgba(0,240,255,0.03)' : 'transparent',
                    animation: i === 0 ? 'slideInFromTop 0.4s ease' : 'none',
                    opacity: 1 - i * 0.1,
                    transition: 'opacity 0.5s',
                  }}
                >
                  <span style={{ color: '#4a5568' }}>[{entry.ts}]</span>
                  <span style={{ color: '#8892a4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.type}</span>
                  <span style={{ color: '#00f0ff', fontWeight: 600 }}>{entry.token}</span>
                  <span style={{ color: '#8892a4' }}>{entry.amount}</span>
                  <span style={{
                    color: statusColor, fontWeight: 600,
                    padding: '2px 8px', borderRadius: 4,
                    background: statusBg,
                    border: `1px solid ${statusBorder}`,
                    fontSize: 11, whiteSpace: 'nowrap',
                  }}>{entry.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ────────────── Features Grid ────────────── */
const FEATURES = [
  {
    title: 'MEV Shield',
    desc: 'Proprietary MEV engine that turns sandwich attacks into your advantage. The same tech bots use against you, now protecting you.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 2L4 8v8c0 7.1 5.1 13.7 12 15.3C22.9 29.7 28 23.1 28 16V8L16 2z" stroke="#00f0ff" strokeWidth="1.5" />
        <path d="M11 16l3.5 3.5L21 12" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Jito Integration',
    desc: 'Direct Jito bundle submission for maximum transaction priority. Your exit beats the dump, every time.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="3" y="7" width="26" height="18" rx="2" stroke="#00f0ff" strokeWidth="1.5" />
        <path d="M3 12h26" stroke="#00f0ff" strokeWidth="1.5" />
        <path d="M8 19h5" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M19 19h5" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Smart Re-Entry',
    desc: 'Automated DCA re-buy after price impact. Set your parameters, TrenchGuard handles the rest.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 4v16" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 15l7 7 7-7" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="6" y1="28" x2="26" y2="28" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Wallet Tracking',
    desc: "Monitor dev wallets, insider wallets, and whale wallets in real-time. Know what they're doing before it hits the chart.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="11" r="5" stroke="#00f0ff" strokeWidth="1.5" />
        <path d="M6 26c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="8" r="3" stroke="#00f0ff" strokeWidth="1.5" />
        <path d="M23 8h2M24 7v2" stroke="#00f0ff" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Multi-Token Shield',
    desc: 'Protect your entire portfolio simultaneously. Set it and forget it, TrenchGuard watches every position.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="10" height="10" rx="2" stroke="#00f0ff" strokeWidth="1.5" />
        <rect x="18" y="4" width="10" height="10" rx="2" stroke="#00f0ff" strokeWidth="1.5" />
        <rect x="4" y="18" width="10" height="10" rx="2" stroke="#00f0ff" strokeWidth="1.5" />
        <rect x="18" y="18" width="10" height="10" rx="2" stroke="#00f0ff" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: 'Telegram Alerts',
    desc: 'Instant notifications for every detection, interception, and re-entry. Stay informed without watching charts.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M3 15L29 4l-3.5 23-9.5-6.5L29 4" stroke="#00f0ff" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M16 20.5V27l3.5-4.5" stroke="#00f0ff" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const FeatureCard = ({ feature: f, index: i }) => {
  const cardRef = useReveal();
  return (
    <div ref={cardRef} className={`reveal card-glass reveal-delay-${(i % 3) + 1}`}
      style={{ borderRadius: 12, padding: 28 }}>
      <div style={{ marginBottom: 16 }}>{f.icon}</div>
      <h3 className="font-heading" style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>{f.title}</h3>
      <p style={{ color: '#8892a4', fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
    </div>
  );
};

const FeaturesGrid = () => {
  const revealRef = useReveal();

  return (
    <section id="features" style={{ position: 'relative', zIndex: 1, padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div ref={revealRef} className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 className="font-heading" style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Built for the Trenches
        </h2>
        <p style={{ color: '#8892a4', fontSize: 16 }}>Every feature designed for degen-speed trading</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} feature={f} index={i} />
        ))}
      </div>
    </section>
  );
};

/* ────────────── Stats Bar ────────────── */
const StatsBar = () => {
  const positions = useCounter(14847, 2500);
  const value = useCounter(12.4, 2000, 1);
  const users = useCounter(2891, 2200);
  const response = useCounter(0.3, 1500, 1);

  const stats = [
    { label: 'Positions Protected', val: positions.val.toLocaleString(), ref: positions.ref },
    { label: 'Value Saved', val: `$${value.val}M`, ref: value.ref },
    { label: 'Active Users', val: users.val.toLocaleString(), ref: users.ref },
    { label: 'Avg Response', val: `${response.val}s`, ref: response.ref },
  ];

  return (
    <section id="stats" style={{
      position: 'relative', zIndex: 1, padding: '60px 24px',
      borderTop: '1px solid #1a2235', borderBottom: '1px solid #1a2235',
      background: 'rgba(6,8,13,0.6)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, textAlign: 'center' }}>
        {stats.map(s => (
          <div key={s.label} ref={s.ref}>
            <div className="font-mono" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#e8edf5', marginBottom: 6 }}>{s.val}</div>
            <div style={{ color: '#4a5568', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ────────────── CTA Section ────────────── */
const CtaSection = () => {
  const revealRef = useReveal();

  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '100px 24px', maxWidth: 700, margin: '0 auto' }}>
      <div ref={revealRef} className="reveal"
        style={{
          borderRadius: 20, padding: 'clamp(32px, 5vw, 60px)',
          background: '#0c1018',
          border: '1px solid transparent',
          backgroundClip: 'padding-box',
          position: 'relative',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Gradient border overlay */}
        <div style={{
          position: 'absolute', inset: -1, borderRadius: 20, padding: 1,
          background: 'linear-gradient(135deg, #00f0ff, #7b61ff, #00f0ff)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
        }} />

        <h2 className="font-heading" style={{
          fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700,
          letterSpacing: '-0.02em', marginBottom: 16,
        }}>
          Stop Getting Rugged.
        </h2>
        <p style={{ color: '#8892a4', fontSize: 16, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
          Connect your wallet and activate protection in under 30 seconds.
        </p>

        <button className="btn-primary" style={{
          padding: '16px 48px', borderRadius: 12, fontSize: 16,
          marginBottom: 20,
        }}>Launch App</button>

        <p className="font-mono" style={{ color: '#4a5568', fontSize: 13 }}>
          No minimum deposit&nbsp;&nbsp;&middot;&nbsp;&nbsp;Cancel anytime&nbsp;&nbsp;&middot;&nbsp;&nbsp;0.5% protection fee
        </p>
      </div>
    </section>
  );
};

/* ────────────── Footer ────────────── */
const Footer = () => (
  <footer style={{ position: 'relative', zIndex: 1, padding: '40px 24px' }}>
    {/* Gradient top border */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 1,
      background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.3), transparent)',
    }} />

    <div style={{
      maxWidth: 1100, margin: '0 auto',
      display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldLogo size={20} />
          <span className="font-heading" style={{ fontSize: 15, fontWeight: 700, color: '#e8edf5' }}>TrenchGuard</span>
        </div>
        <span style={{ color: '#4a5568', fontSize: 12 }}>2025 TrenchGuard</span>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {['Docs', 'GitHub', 'Twitter', 'Discord', 'Telegram'].map(l => (
          <a key={l} href="#" style={{ color: '#4a5568', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#e8edf5'}
            onMouseLeave={e => e.target.style.color = '#4a5568'}
          >{l}</a>
        ))}
      </div>

      <span style={{ color: '#4a5568', fontSize: 12 }}>Built on Solana</span>
    </div>
  </footer>
);

/* ────────────── App Root ────────────── */
export default function TrenchGuard() {
  return (
    <>
      <FontLoader />
      <TopographyBackground />
      <Navbar />
      <Hero />
      <HowItWorks />
      <LiveFeed />
      <FeaturesGrid />
      <StatsBar />
      <CtaSection />
      <Footer />
    </>
  );
}
