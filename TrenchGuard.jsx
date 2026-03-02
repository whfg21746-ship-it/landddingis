import React, { useState, useEffect, useRef, useMemo } from 'react';

/* ───────────────────────── Font Loader ───────────────────────── */
const FontLoader = () => (
  <style>{`
    @import url('https://api.fontshare.com/v2/css?f[]=satoshi@700,800,900&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

    @keyframes pulseGlow {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    @keyframes slideInFromTop {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOutBottom {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(10px); }
    }
    @keyframes floatBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    @keyframes scrollArrow {
      0%, 100% { opacity: 0.3; transform: translateY(0); }
      50% { opacity: 0.8; transform: translateY(6px); }
    }
    @keyframes flowDot {
      0% { stroke-dashoffset: 20; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes strikeReveal {
      from { width: 0; }
      to { width: 100%; }
    }

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

    .glow-cyan { text-shadow: 0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.2); }
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
  `}</style>
);

/* ───────────────────────── Particle Canvas ───────────────────────── */
const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const isMobile = w < 768;
    const PARTICLE_COUNT = isMobile ? 50 : 100;
    const CONNECT_DIST = 150;
    const MOUSE_DIST = 200;

    class Particle {
      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.baseAlpha = 0.4 + Math.random() * 0.3;
        this.alpha = this.baseAlpha;
        this.r = 1 + Math.random() * 1.2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
        const dx = this.x - mouseRef.current.x;
        const dy = this.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.alpha = dist < MOUSE_DIST
          ? this.baseAlpha + (1 - this.baseAlpha) * (1 - dist / MOUSE_DIST)
          : this.baseAlpha;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
        ctx.fill();
      }
    }

    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
    particlesRef.current = particles;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const midX = (particles[i].x + particles[j].x) / 2;
            const midY = (particles[i].y + particles[j].y) / 2;
            const mouseDist = Math.sqrt((midX - mx) ** 2 + (midY - my) ** 2);
            const baseOpacity = 0.06;
            const opacity = mouseDist < MOUSE_DIST
              ? baseOpacity + 0.12 * (1 - mouseDist / MOUSE_DIST)
              : baseOpacity;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${opacity * (1 - dist / CONNECT_DIST)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    const onMouse = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onMouseLeave = () => { mouseRef.current = { x: -1000, y: -1000 }; };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
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
const useCounter = (end, duration = 2000, suffix = '') => {
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
            setVal(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);

  return { ref, val: val.toLocaleString() + suffix };
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
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? 'rgba(6,8,13,0.8)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,240,255,0.08)' : '1px solid transparent',
        transition: 'all 0.3s',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <ShieldLogo />
          <span className="font-heading" style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5', letterSpacing: '-0.02em' }}>TrenchGuard</span>
        </div>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: 32 }} className="nav-links-desktop">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              style={{ color: '#8892a4', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500 }}
              onMouseEnter={e => e.target.style.color = '#e8edf5'}
              onMouseLeave={e => e.target.style.color = '#8892a4'}
            >{l}</a>
          ))}
        </div>

        {/* Mobile menu button */}
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
          className="connect-btn"
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
          {connected ? '0x7f...3a2d Connected' : 'Connect Wallet'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="mobile-nav" style={{
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
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .connect-btn { display: none; }
        }
      `}</style>
    </nav>
  );
};

/* ───────────────────────── Hero Section ───────────────────────── */
const Hero = () => {
  const revealRef = useReveal();
  const [strikeVisible, setStrikeVisible] = useState(false);
  const rugsCounter = useCounter(14847, 2200);
  const savedCounter = useCounter(124, 2000);
  const responseVal = useCounter(3, 1800);

  useEffect(() => {
    const t = setTimeout(() => setStrikeVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="hero" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, padding: '120px 24px 60px' }}>
      <div ref={revealRef} className="reveal" style={{ textAlign: 'center', maxWidth: 800 }}>
        <h1 className="font-heading" style={{ fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24 }}>
          <span>Front-Run The{' '}</span>
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <span style={{ color: '#ff3b5c' }}>Rugs</span>
            <span style={{
              position: 'absolute', left: 0, top: '52%', height: 3,
              background: 'linear-gradient(90deg, #ff3b5c, transparent)',
              width: strikeVisible ? '100%' : 0,
              transition: 'width 0.8s ease 0.8s',
            }} />
          </span>
          <span>.</span>
          <br />
          <span>Not The{' '}</span>
          <span className="glow-cyan" style={{ color: '#00f0ff' }}>Traders</span>
          <span>.</span>
        </h1>

        <p style={{ color: '#8892a4', fontSize: 'clamp(15px, 2vw, 18px)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 40px' }}>
          TrenchGuard uses MEV technology to detect whale dumps and dev sells before they hit the market — automatically selling your position first and letting you re-buy at the bottom. Built for the trenches.
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

        <div ref={rugsCounter.ref} className="font-mono" style={{
          display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap',
          fontSize: 13, color: '#8892a4',
        }}>
          <span ref={savedCounter.ref}>
            <span ref={responseVal.ref}>
              🛡️ <span style={{ color: '#e8edf5' }}>{rugsCounter.val}</span> rugs intercepted
            </span>
          </span>
          <span style={{ color: '#4a5568' }}>•</span>
          <span>💰 <span style={{ color: '#e8edf5' }}>${savedCounter.val}M</span> saved</span>
          <span style={{ color: '#4a5568' }}>•</span>
          <span>⚡ <span style={{ color: '#e8edf5' }}>0.{responseVal.val}s</span> avg response</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: 32, animation: 'scrollArrow 2s ease infinite' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
};

/* ───────────────────────── Live Protection Feed ───────────────────────── */
const FEED_TEMPLATES = [
  { type: 'Whale dump detected', token: '$ARC', amount: '14K SOL', status: 'BLOCKED', icon: '✅', color: '#00ff88' },
  { type: 'Dev sell intercepted', token: '$OEOE', amount: '89K SOL', status: 'PROTECTED', icon: '🛡️', color: '#00ff88' },
  { type: 'LP removal detected', token: '$WIF', amount: '234K SOL', status: 'BLOCKED', icon: '✅', color: '#00ff88' },
  { type: 'Rug attempt blocked', token: '$SLERF', amount: '67K SOL', status: 'PROTECTED', icon: '🛡️', color: '#00ff88' },
  { type: 'Large sell detected', token: '$POPCAT', amount: '178K SOL', status: 'MONITORING', icon: '👁️', color: '#ffaa00' },
  { type: 'Dev wallet movement', token: '$BONK', amount: '45K SOL', status: 'BLOCKED', icon: '✅', color: '#00ff88' },
  { type: 'Whale dump detected', token: '$BOME', amount: '312K SOL', status: 'PROTECTED', icon: '🛡️', color: '#00ff88' },
  { type: 'LP removal detected', token: '$MYRO', amount: '56K SOL', status: 'BLOCKED', icon: '✅', color: '#00ff88' },
  { type: 'Insider sell detected', token: '$MEW', amount: '91K SOL', status: 'PROTECTED', icon: '🛡️', color: '#00ff88' },
  { type: 'Large sell detected', token: '$SAMO', amount: '23K SOL', status: 'MONITORING', icon: '👁️', color: '#ffaa00' },
];

const LiveFeed = () => {
  const revealRef = useReveal();
  const [entries, setEntries] = useState([]);
  const idRef = useRef(0);

  useEffect(() => {
    const makeEntry = () => {
      const t = FEED_TEMPLATES[Math.floor(Math.random() * FEED_TEMPLATES.length)];
      const now = new Date();
      const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      return { ...t, ts, id: idRef.current++ };
    };

    // Seed initial entries
    const initial = [];
    for (let i = 0; i < 5; i++) initial.push(makeEntry());
    setEntries(initial);

    const interval = setInterval(() => {
      setEntries(prev => {
        const next = [makeEntry(), ...prev];
        return next.slice(0, 6);
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="live-feed" style={{ position: 'relative', zIndex: 1, padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
      <div ref={revealRef} className="reveal">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <h2 className="font-heading" style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Live Protection Feed
          </h2>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: '#00ff88',
            animation: 'pulseGlow 2s ease infinite', display: 'inline-block',
            boxShadow: '0 0 8px #00ff88',
          }} />
        </div>

        <div className="card-glass" style={{ borderRadius: 12, overflow: 'hidden' }}>
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

          <div style={{ padding: 16 }}>
            {entries.map((entry, i) => (
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
                  opacity: i >= 5 ? 0.3 : 1 - i * 0.08,
                  transition: 'opacity 0.5s',
                }}
              >
                <span style={{ color: '#4a5568' }}>[{entry.ts}]</span>
                <span style={{ color: '#8892a4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.type}</span>
                <span style={{ color: '#00f0ff', fontWeight: 600 }}>{entry.token}</span>
                <span style={{ color: '#8892a4' }}>{entry.amount}</span>
                <span style={{
                  color: entry.color, fontWeight: 600,
                  padding: '2px 8px', borderRadius: 4,
                  background: `${entry.color}15`,
                  fontSize: 11, whiteSpace: 'nowrap',
                }}>→ {entry.status} {entry.icon}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ───────────────────────── How It Works ───────────────────────── */
const HowItWorks = () => {
  const revealRef = useReveal();

  const steps = [
    {
      title: 'Detect', color: '#00f0ff',
      desc: 'Our MEV engine monitors every Solana block in real-time. We analyze dev wallets, whale movements, and liquidity patterns to detect dumps before they execute.',
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
      desc: 'When a threatening transaction is detected, TrenchGuard constructs a priority transaction via Jito bundles — selling your position before the dump impacts the price.',
      tag: 'Jito Bundle Priority',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 3L5 9v8c0 7 4.5 13 11 14.5C22.5 30 27 24 27 17V9L16 3z" stroke="#7b61ff" strokeWidth="2" />
          <path d="M11 16l3.5 3.5L21 13" stroke="#7b61ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: 'Re-Entry', color: '#00ff88',
      desc: 'After the dump crashes the price, TrenchGuard automatically re-buys your position at the new lower price — you keep your bag, just cheaper.',
      tag: 'Auto DCA Re-buy',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 4v18" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" />
          <path d="M10 16l6 6 6-6" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="8" y1="28" x2="24" y2="28" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" />
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

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24,
        position: 'relative',
      }}>
        {steps.map((s, i) => {
          const cardRef = useReveal();
          return (
            <div
              key={s.title}
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
        })}
      </div>
    </section>
  );
};

/* ───────────────────────── Mini Price Chart SVG ───────────────────────── */
const MiniChart = ({ seed = 0 }) => {
  const points = useMemo(() => {
    const rng = (s) => { s = Math.sin(s) * 10000; return s - Math.floor(s); };
    const pts = [];
    // Rising portion
    for (let i = 0; i < 12; i++) {
      pts.push({ x: i * 8, y: 60 - i * 3.5 - rng(seed + i) * 8 });
    }
    // Peak
    pts.push({ x: 96, y: 14 + rng(seed + 20) * 6 });
    // Crash
    pts.push({ x: 104, y: 18 });
    pts.push({ x: 112, y: 55 });
    pts.push({ x: 120, y: 62 });
    // Bottom
    pts.push({ x: 128, y: 64 });
    pts.push({ x: 140, y: 60 });
    return pts;
  }, [seed]);

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const sellIdx = 11;
  const rebuyIdx = points.length - 2;

  return (
    <svg viewBox="0 0 150 80" style={{ width: '100%', height: 60 }}>
      {/* Chart line */}
      <path d={line} fill="none" stroke="#4a5568" strokeWidth="1.5" />
      {/* Sell point */}
      <circle cx={points[sellIdx].x} cy={points[sellIdx].y} r="3" fill="#00ff88" />
      <text x={points[sellIdx].x} y={points[sellIdx].y - 7} fill="#00ff88" fontSize="5" textAnchor="middle" fontFamily="JetBrains Mono, monospace">SOLD</text>
      {/* Re-buy point */}
      <circle cx={points[rebuyIdx].x} cy={points[rebuyIdx].y} r="3" fill="#00ff88" />
      <text x={points[rebuyIdx].x} y={points[rebuyIdx].y - 7} fill="#00ff88" fontSize="5" textAnchor="middle" fontFamily="JetBrains Mono, monospace">RE-BUY</text>
      {/* Crash zone */}
      <path d={`M${points[13].x},${points[13].y} L${points[14].x},${points[14].y} L${points[15].x},${points[15].y}`} fill="none" stroke="#ff3b5c" strokeWidth="1.5" />
    </svg>
  );
};

/* ───────────────────────── Recent Saves ───────────────────────── */
const TOKENS = [
  { name: 'DOGE420', ticker: '$DOGE420', color: '#f59e0b', threat: 'Dev Dump', threatColor: '#ff3b5c', saved: '47.2K', holders: 847, response: '0.2s' },
  { name: 'CATGPT', ticker: '$CATGPT', color: '#8b5cf6', threat: 'Whale Exit', threatColor: '#ffaa00', saved: '23.8K', holders: 412, response: '0.3s' },
  { name: 'SOLAPE', ticker: '$SOLAPE', color: '#10b981', threat: 'LP Drain', threatColor: '#ff3b5c', saved: '89.1K', holders: 1203, response: '0.1s' },
  { name: 'TRENCHY', ticker: '$TRENCHY', color: '#00f0ff', threat: 'Dev Dump', threatColor: '#ff3b5c', saved: '31.5K', holders: 556, response: '0.4s' },
  { name: 'WAGMI', ticker: '$WAGMI', color: '#f472b6', threat: 'Whale Exit', threatColor: '#ffaa00', saved: '62.7K', holders: 934, response: '0.2s' },
  { name: 'NGMI', ticker: '$NGMI', color: '#ef4444', threat: 'LP Drain', threatColor: '#ff3b5c', saved: '15.3K', holders: 289, response: '0.3s' },
];

const RecentSaves = () => {
  const revealRef = useReveal();

  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div ref={revealRef} className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 className="font-heading" style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Recent Saves
        </h2>
        <p style={{ color: '#8892a4', fontSize: 16 }}>Tokens where TrenchGuard protected holders today</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {TOKENS.map((t, i) => {
          const cardRef = useReveal();
          return (
            <div key={t.name} ref={cardRef} className={`reveal card-glass reveal-delay-${(i % 3) + 1}`}
              style={{ borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: t.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#06080d',
                  }}>
                    {t.name.slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.ticker}</div>
                  </div>
                </div>
                <span className="font-mono" style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 4,
                  background: `${t.threatColor}18`, color: t.threatColor,
                  fontWeight: 600,
                }}>{t.threat}</span>
              </div>

              <MiniChart seed={i * 37 + 7} />

              <div className="font-mono" style={{
                display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 10,
                color: '#8892a4',
              }}>
                <span>Saved: <span style={{ color: '#00ff88', fontWeight: 600 }}>${t.saved}</span></span>
                <span>{t.holders} holders</span>
                <span>{t.response}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

/* ───────────────────────── Features Grid ───────────────────────── */
const FEATURES = [
  {
    title: 'MEV Shield',
    desc: 'Proprietary MEV engine that turns sandwich attacks into your advantage. We use the same technology that bots use against you — but for protection.',
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
        <rect x="3" y="8" width="22" height="14" rx="2" stroke="#7b61ff" strokeWidth="1.5" />
        <path d="M3 12h22" stroke="#7b61ff" strokeWidth="1.5" />
        <circle cx="7" cy="18" r="1.5" fill="#7b61ff" />
      </svg>
    ),
  },
  {
    title: 'Smart Re-Entry',
    desc: 'Automated DCA re-buy after price impact. Set your re-entry parameters and let TrenchGuard handle the rest.',
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
    desc: 'Monitor dev wallets, insider wallets, and whale wallets in real-time. Know what they\'re doing before it hits the chart.',
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
    desc: 'Instant notifications for every threat detection, interception, and re-entry. Stay informed in the trenches.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M3 13.5L25 4l-3 20-8-5.5L25 4" stroke="#00f0ff" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M14 18.5V24l3-4" stroke="#00f0ff" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const FeaturesGrid = () => {
  const revealRef = useReveal();

  return (
    <section id="features" style={{ position: 'relative', zIndex: 1, padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div ref={revealRef} className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 className="font-heading" style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Built for the Trenches
        </h2>
        <p style={{ color: '#8892a4', fontSize: 16 }}>Every feature designed for degen-speed meme coin trading</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {FEATURES.map((f, i) => {
          const cardRef = useReveal();
          return (
            <div key={f.title} ref={cardRef} className={`reveal card-glass reveal-delay-${(i % 3) + 1}`}
              style={{ borderRadius: 12, padding: 28 }}>
              <div style={{ marginBottom: 16 }}>{f.icon}</div>
              <h3 className="font-heading" style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: '#8892a4', fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

/* ───────────────────────── Stats Bar ───────────────────────── */
const StatsBar = () => {
  const rugs = useCounter(14847, 2500);
  const value = useCounter(124, 2000);
  const shields = useCounter(2891, 2200);
  const response = useCounter(3, 1500);

  const stats = [
    {
      label: 'Rugs Intercepted', val: rugs.val, ref: rugs.ref,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6.5v5.5c0 5.25 3.4 10.15 8 11.5 4.6-1.35 8-6.25 8-11.5V6.5L12 2z" stroke="#00f0ff" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      label: 'Value Saved', val: `$${value.val}M`, ref: value.ref,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#00ff88" strokeWidth="1.5" />
          <path d="M12 7v10M9 9.5c0-1 1.3-2 3-2s3 .8 3 2-1.3 2-3 2-3 .8-3 2 1.3 2 3 2 3-1 3-2" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'Active Shields', val: shields.val, ref: shields.ref,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="8" r="3" stroke="#7b61ff" strokeWidth="1.5" />
          <path d="M3 20c0-3.3 2.7-6 6-6" stroke="#7b61ff" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="17" cy="8" r="3" stroke="#7b61ff" strokeWidth="1.5" />
          <path d="M21 20c0-3.3-2.7-6-6-6" stroke="#7b61ff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'Avg Response Time', val: `0.${response.val}s`, ref: response.ref,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L4 14h8l-1 8 9-12h-8l1-8z" stroke="#ffaa00" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
    },
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
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>{s.icon}</div>
            <div className="font-mono" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#e8edf5', marginBottom: 4 }}>{s.val}</div>
            <div style={{ color: '#8892a4', fontSize: 13, fontWeight: 500 }}>{s.label}</div>
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
          Ready to Stop Getting Rugged?
        </h2>
        <p style={{ color: '#8892a4', fontSize: 16, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
          Connect your wallet and activate TrenchGuard in under 30 seconds.
        </p>

        <button className="btn-glow" style={{
          background: '#00f0ff', color: '#06080d', border: 'none',
          padding: '16px 48px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer',
          marginBottom: 20,
        }}>Launch App</button>

        <p className="font-mono" style={{ color: '#4a5568', fontSize: 12 }}>
          No minimum deposit&nbsp;&nbsp;•&nbsp;&nbsp;Cancel anytime&nbsp;&nbsp;•&nbsp;&nbsp;0.5% protection fee
        </p>
      </div>
    </section>
  );
};

/* ───────────────────────── Footer ───────────────────────── */
const Footer = () => (
  <footer style={{
    position: 'relative', zIndex: 1, padding: '32px 24px',
    borderTop: '1px solid #1a2235',
  }}>
    <div style={{
      maxWidth: 1100, margin: '0 auto',
      display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ShieldLogo size={20} />
        <span style={{ color: '#4a5568', fontSize: 13 }}>© 2025 TrenchGuard. All rights reserved.</span>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {['Docs', 'GitHub', 'Twitter', 'Discord', 'Telegram'].map(l => (
          <a key={l} href="#" style={{ color: '#8892a4', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#e8edf5'}
            onMouseLeave={e => e.target.style.color = '#8892a4'}
          >{l}</a>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <linearGradient id="sol" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#7b61ff" />
          </linearGradient>
          <circle cx="12" cy="12" r="10" stroke="url(#sol)" strokeWidth="1.5" />
          <path d="M7 14.5h10L14.5 17H7l2.5-2.5z" fill="url(#sol)" opacity="0.6" />
          <path d="M7 9.5h10L14.5 7H7l2.5 2.5z" fill="url(#sol)" opacity="0.6" />
          <path d="M7 12h10" stroke="url(#sol)" strokeWidth="1" />
        </svg>
        <span style={{ color: '#4a5568', fontSize: 12 }}>Built on Solana</span>
      </div>
    </div>
  </footer>
);

/* ───────────────────────── App Root ───────────────────────── */
export default function TrenchGuard() {
  return (
    <>
      <FontLoader />
      <ParticleBackground />
      <Navbar />
      <Hero />
      <LiveFeed />
      <HowItWorks />
      <RecentSaves />
      <FeaturesGrid />
      <StatsBar />
      <CtaSection />
      <Footer />
    </>
  );
}
