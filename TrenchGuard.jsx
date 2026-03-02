import React, { useState, useEffect, useRef } from 'react';

/* ───────────────────────── Font Loader & Global Styles ───────────────────────── */
const FontLoader = () => (
  <style>{`
    @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,800,900&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

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

    ${Array.from({ length: 25 }, (_, i) => `
    @keyframes topoFlow${i} {
      0% { stroke-dashoffset: ${800 + i * 40}; }
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
      background: rgba(12, 16, 24, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid #1a2235;
      transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
    }
    .card-glass:hover {
      border-color: rgba(0, 240, 255, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(0, 240, 255, 0.06);
    }

    .btn-glow {
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.3), inset 0 1px 0 rgba(255,255,255,0.1);
      transition: box-shadow 0.3s, transform 0.2s;
    }
    .btn-glow:hover {
      box-shadow: 0 0 30px rgba(0, 240, 255, 0.5), 0 0 60px rgba(0, 240, 255, 0.2);
      transform: translateY(-1px);
    }

    .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }
    .reveal-delay-4 { transition-delay: 0.4s; }
    .reveal-delay-5 { transition-delay: 0.5s; }

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

/* ───────────────────────── Topography SVG Background ───────────────────────── */
const TopographyBackground = () => {
  const paths = [
    'M-50,120 C200,100 400,180 600,140 S1000,100 1200,160 S1600,120 1950,150',
    'M-50,200 C150,220 350,160 550,210 S800,250 1050,190 S1400,230 1950,200',
    'M-50,300 C180,280 380,340 580,290 S900,260 1100,320 S1500,280 1950,310',
    'M-50,80 C250,60 450,120 650,70 S950,50 1150,100 S1450,80 1950,60',
    'M-50,400 C200,380 400,440 600,390 S900,420 1100,370 S1500,410 1950,390',
    'M-50,160 C300,140 500,200 700,150 S1000,180 1200,130 S1500,170 1950,140',
    'M-50,500 C150,520 350,470 550,510 S850,480 1050,530 S1400,490 1950,520',
    'M-50,240 C220,260 420,210 620,250 S920,230 1120,270 S1420,240 1950,260',
    'M-50,340 C280,320 480,370 680,330 S980,360 1180,310 S1480,350 1950,330',
    'M-50,440 C170,460 370,410 570,450 S870,430 1070,470 S1370,440 1950,460',
    'M-50,560 C240,540 440,590 640,550 S940,580 1140,530 S1440,570 1950,550',
    'M-50,50 C190,70 390,30 590,60 S890,40 1090,70 S1390,50 1950,40',
    'M-50,620 C210,640 410,600 610,630 S910,610 1110,650 S1410,620 1950,640',
    'M-50,700 C260,680 460,720 660,690 S960,710 1160,670 S1460,700 1950,690',
    'M-50,360 C230,340 430,390 630,350 S930,380 1130,340 S1430,370 1950,350',
    'M-50,180 C270,200 470,150 670,190 S970,170 1170,210 S1470,180 1950,200',
    'M-50,520 C160,500 360,550 560,510 S860,540 1060,500 S1360,530 1950,510',
    'M-50,660 C190,680 390,640 590,670 S890,650 1090,690 S1390,660 1950,680',
    'M-50,280 C250,300 450,260 650,290 S950,270 1150,300 S1450,280 1950,300',
    'M-50,750 C200,730 400,770 600,740 S900,760 1100,730 S1400,750 1950,740',
    'M-50,130 C210,150 410,110 610,140 S910,120 1110,150 S1410,130 1950,150',
    'M-50,420 C180,440 380,400 580,430 S880,410 1080,440 S1380,420 1950,440',
    'M-50,580 C230,560 430,610 630,570 S930,600 1130,560 S1430,590 1950,570',
    'M-50,30 C200,50 400,10 600,40 S900,20 1100,50 S1400,30 1950,20',
    'M-50,480 C160,500 360,460 560,490 S860,470 1060,500 S1360,480 1950,500',
  ];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
      <svg
        viewBox="0 0 1900 800"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%' }}
      >
        {paths.map((d, i) => {
          const opacity = 0.04 + (i % 5) * 0.01;
          const strokeWidth = 0.5 + (i % 4) * 0.3;
          const duration = 20 + (i % 7) * 3;
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={`rgba(0,240,255,${opacity})`}
              strokeWidth={strokeWidth}
              strokeDasharray="800"
              strokeDashoffset="800"
              style={{
                animation: `topoFlow${i} ${duration}s linear infinite`,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};

/* ───────────────────────── Intersection Observer Hook ───────────────────────── */
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

/* ───────────────────────── Animated Counter Hook ───────────────────────── */
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

/* ───────────────────────── Shield Logo SVG ───────────────────────── */
const ShieldLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M16 2L4 8v8c0 7.1 5.1 13.7 12 15.3C22.9 29.7 28 23.1 28 16V8L16 2z"
      fill="none" stroke="#00f0ff" strokeWidth="2" />
    <path d="M12 16l3 3 5-6" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ───────────────────────── Navbar ───────────────────────── */
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
          <span className="font-heading" style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5', letterSpacing: '-0.02em' }}>TrenchGuard</span>
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
          {connected ? '7fK3...a2dR Connected' : 'Connect Wallet'}
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
            {connected ? '7fK3...a2dR Connected' : 'Connect Wallet'}
          </button>
        </div>
      )}
    </nav>
  );
};

/* ───────────────────────── Hero Section ───────────────────────── */
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
          TrenchGuard uses MEV technology to detect whale dumps and dev sells before they hit — automatically protecting your position and alerting you to re-buy at the bottom. Built for the trenches.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          <button className="btn-glow" style={{
            background: '#00f0ff', color: '#06080d', border: 'none',
            padding: '14px 36px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}>Launch App</button>
          <button style={{
            background: 'transparent', color: '#00f0ff', border: '1px solid rgba(0,240,255,0.4)',
            padding: '14px 36px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.3s',
          }}
            onMouseEnter={e => { e.target.style.background = 'rgba(0,240,255,0.1)'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; }}
          >Read Docs</button>
        </div>

        <div className="font-mono" style={{
          display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap',
          fontSize: 13, color: '#4a5568',
        }}>
          <span ref={positionsCounter.ref}>
            <span ref={savedCounter.ref}>
              <span ref={responseCounter.ref}>
                <span style={{ color: '#8892a4' }}>{positionsCounter.val.toLocaleString()}</span> positions protected
                <span style={{ color: '#4a5568' }}> &middot; </span>
                <span style={{ color: '#8892a4' }}>${savedCounter.val}M</span> in value saved
                <span style={{ color: '#4a5568' }}> &middot; </span>
                <span style={{ color: '#8892a4' }}>{responseCounter.val}s</span> avg interception
              </span>
            </span>
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

/* ───────────────────────── How It Works ───────────────────────── */
const HowItWorksCard = ({ step: s, index: i }) => {
  const cardRef = useReveal();
  return (
    <div
      ref={cardRef}
      className={`reveal card-glass reveal-delay-${i + 1}`}
      style={{
        borderRadius: 14, padding: 32,
        borderTop: `2px solid ${s.color}`,
        boxShadow: `0 -4px 20px ${s.color}15`,
      }}
    >
      <div style={{ marginBottom: 20, opacity: 0.9 }}>{s.icon}</div>
      <h3 className="font-heading" style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: '#e8edf5' }}>{s.title}</h3>
      <p style={{ color: '#8892a4', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{s.desc}</p>
      <span className="font-mono" style={{
        fontSize: 11, color: s.color, padding: '4px 10px',
        border: `1px solid ${s.color}40`, borderRadius: 6,
        background: `${s.color}10`,
      }}>{s.tag}</span>
    </div>
  );
};

const HowItWorks = () => {
  const revealRef = useReveal();

  const steps = [
    {
      title: 'Detect', color: '#00f0ff',
      desc: 'TrenchGuard monitors every token in your portfolio across all Solana DEXs. We track dev wallets, whale positions, and liquidity changes in real-time — if something moves, we see it first.',
      tag: '< 400ms detection',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="14" cy="14" r="10" stroke="#00f0ff" strokeWidth="2" />
          <line x1="21" y1="21" x2="28" y2="28" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />
          <circle cx="14" cy="14" r="4" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      ),
    },
    {
      title: 'Intercept', color: '#7b61ff',
      desc: 'When a threatening sell is detected, TrenchGuard constructs a priority transaction via Jito bundles — exiting your position before the dump impacts the price.',
      tag: 'Jito Bundle Priority',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 3L5 9v8c0 7 4.5 13 11 14.5C22.5 30 27 24 27 17V9L16 3z" stroke="#7b61ff" strokeWidth="2" />
          <path d="M11 16l3.5 3.5L21 13" stroke="#7b61ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: 'Alert & Re-Entry', color: '#00ff88',
      desc: 'After interception, you receive an instant alert showing your protected position and the price drop %. This lets you re-buy at the new lower price — same bag, better entry.',
      tag: 'Instant Telegram Alert',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 4C12 4 9 7 9 11v6l-3 3v1h20v-1l-3-3v-6c0-4-3-7-7-7z" stroke="#00ff88" strokeWidth="2" strokeLinejoin="round" />
          <path d="M13 22c0 1.7 1.3 3 3 3s3-1.3 3-3" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" style={{ position: 'relative', zIndex: 1, padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div ref={revealRef} className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
        <h2 className="font-heading" style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
          How TrenchGuard Protects You
        </h2>
        <p style={{ color: '#8892a4', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
          Three layers of defense between you and the rug.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        {steps.map((s, i) => (
          <HowItWorksCard key={s.title} step={s} index={i} />
        ))}
      </div>
    </section>
  );
};

/* ───────────────────────── Live Protection Feed ───────────────────────── */
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

  useEffect(() => {
    const makeEntry = () => {
      const t = FEED_TEMPLATES[idRef.current % FEED_TEMPLATES.length];
      const now = new Date();
      const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      idRef.current++;
      return { ...t, ts, id: idRef.current };
    };

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
  }, []);

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
          background: 'rgba(8, 10, 16, 0.9)',
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

/* ───────────────────────── Features Grid ───────────────────────── */
const FEATURES = [
  {
    title: 'MEV Shield',
    desc: 'Proprietary MEV engine that turns sandwich attacks into your advantage. The same tech bots use against you — now protecting you.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 2L3 7.5v7c0 6.5 4.7 12.6 11 14 6.3-1.4 11-7.5 11-14v-7L14 2z" stroke="#00f0ff" strokeWidth="1.5" />
        <path d="M9 14l3.5 3.5L19 11" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Jito Integration',
    desc: 'Direct Jito bundle submission for maximum transaction priority. Your exit beats the dump, every time.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="6" width="22" height="16" rx="2" stroke="#7b61ff" strokeWidth="1.5" />
        <path d="M3 11h22" stroke="#7b61ff" strokeWidth="1.5" />
        <path d="M8 17h4" stroke="#7b61ff" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 17h4" stroke="#7b61ff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Smart Re-Entry',
    desc: 'Automated DCA re-buy after price impact. Set your parameters, TrenchGuard handles the rest.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4v14" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 14l6 6 6-6" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="6" y1="24" x2="22" y2="24" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Wallet Tracking',
    desc: "Monitor dev wallets, insider wallets, and whale wallets in real-time. Know what they're doing before it hits the chart.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="10" r="4" stroke="#00f0ff" strokeWidth="1.5" />
        <path d="M6 22c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="21" cy="7" r="3" stroke="#ffaa00" strokeWidth="1.5" />
        <path d="M20 7h2M21 6v2" stroke="#ffaa00" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Multi-Token Shield',
    desc: 'Protect your entire portfolio simultaneously. Set it and forget it — TrenchGuard watches every position.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="4" width="8" height="8" rx="2" stroke="#7b61ff" strokeWidth="1.5" />
        <rect x="16" y="4" width="8" height="8" rx="2" stroke="#7b61ff" strokeWidth="1.5" />
        <rect x="4" y="16" width="8" height="8" rx="2" stroke="#7b61ff" strokeWidth="1.5" />
        <rect x="16" y="16" width="8" height="8" rx="2" stroke="#7b61ff" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: 'Telegram Alerts',
    desc: 'Instant notifications for every detection, interception, and re-entry. Stay informed without watching charts.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M3 13.5L25 4l-3 20-8-5.5L25 4" stroke="#00f0ff" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M14 18.5V24l3-4" stroke="#00f0ff" strokeWidth="1.5" strokeLinejoin="round" />
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
      <h3 className="font-heading" style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
      <p style={{ color: '#8892a4', fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
    </div>
  );
};

const FeaturesGrid = () => {
  const revealRef = useReveal();

  return (
    <section id="features" style={{ position: 'relative', zIndex: 1, padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div ref={revealRef} className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 className="font-heading" style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Built for the Trenches
        </h2>
        <p style={{ color: '#8892a4', fontSize: 16 }}>Every feature designed for degen-speed trading</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} feature={f} index={i} />
        ))}
      </div>
    </section>
  );
};

/* ───────────────────────── Stats Bar ───────────────────────── */
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
      background: 'rgba(12,16,24,0.5)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, textAlign: 'center' }}>
        {stats.map(s => (
          <div key={s.label} ref={s.ref}>
            <div className="font-mono" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#e8edf5', marginBottom: 6 }}>{s.val}</div>
            <div style={{ color: '#4a5568', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ───────────────────────── CTA Section ───────────────────────── */
const CtaSection = () => {
  const revealRef = useReveal();

  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '100px 24px', maxWidth: 800, margin: '0 auto' }}>
      <div ref={revealRef} className="reveal"
        style={{
          borderRadius: 20, padding: 'clamp(32px, 5vw, 60px)',
          background: 'rgba(12,16,24,0.6)',
          backdropFilter: 'blur(16px)',
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
          fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900,
          letterSpacing: '-0.02em', marginBottom: 16,
        }}>
          Stop Getting Rugged.
        </h2>
        <p style={{ color: '#8892a4', fontSize: 16, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
          Connect your wallet and activate protection in under 30 seconds.
        </p>

        <button className="btn-glow" style={{
          background: '#00f0ff', color: '#06080d', border: 'none',
          padding: '16px 48px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer',
          marginBottom: 20,
        }}>Launch App</button>

        <p className="font-mono" style={{ color: '#4a5568', fontSize: 12 }}>
          No minimum deposit&nbsp;&nbsp;&middot;&nbsp;&nbsp;Cancel anytime&nbsp;&nbsp;&middot;&nbsp;&nbsp;0.5% protection fee
        </p>
      </div>
    </section>
  );
};

/* ───────────────────────── Footer ───────────────────────── */
const Footer = () => (
  <footer style={{ position: 'relative', zIndex: 1, padding: '32px 24px' }}>
    {/* Gradient top border */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 1,
      background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.2), transparent)',
    }} />

    <div style={{
      maxWidth: 1100, margin: '0 auto',
      display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ShieldLogo size={20} />
        <span style={{ color: '#4a5568', fontSize: 13 }}>&copy; 2025 TrenchGuard</span>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {['Docs', 'GitHub', 'Twitter', 'Discord', 'Telegram'].map(l => (
          <a key={l} href="#" style={{ color: '#8892a4', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#e8edf5'}
            onMouseLeave={e => e.target.style.color = '#8892a4'}
          >{l}</a>
        ))}
      </div>

      <span style={{ color: '#4a5568', fontSize: 12 }}>Built on Solana</span>
    </div>
  </footer>
);

/* ───────────────────────── App Root ───────────────────────── */
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
