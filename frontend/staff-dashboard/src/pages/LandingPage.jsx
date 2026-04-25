import { useEffect, useRef, useState } from "react";

// ── SCROLL HOOK ───────────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ── ANIMATED COUNTER ──────────────────────────────────────────────────────────
function Counter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(ease * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── TYPEWRITER ────────────────────────────────────────────────────────────────
function Typewriter({ words, speed = 80, pause = 2000 }) {
  const [displayed, setDisplayed] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplayed(current.slice(0, displayed.length + 1));
        if (displayed.length + 1 === current.length) {
          setTimeout(() => setDeleting(true), pause);
        }
      } else {
        setDisplayed(current.slice(0, displayed.length - 1));
        if (displayed.length === 0) {
          setDeleting(false);
          setWordIdx((i) => (i + 1) % words.length);
        }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIdx, words, speed, pause]);

  return (
    <span>
      {displayed}
      <span className="typewriter-cursor">|</span>
    </span>
  );
}

// ── MAIN LANDING PAGE ─────────────────────────────────────────────────────────
export default function LandingPage({ onGetStarted }) {
  useScrollReveal();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navOpacity = Math.min(scrollY / 100, 1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,300&family=JetBrains+Mono:wght@400;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --red:      #e81c1c;
          --red-dark: #a01010;
          --red-glow: rgba(232,28,28,0.35);
          --bg:       #050508;
          --bg-2:     #080810;
          --surface:  #0e0e18;
          --border:   rgba(255,255,255,0.07);
          --text:     #e8e8f0;
          --muted:    #5a5a7a;
          --accent:   #00d4ff;
        }

        html { scroll-behavior: smooth; }

        body {
          background-image: 
            linear-gradient(to bottom, 
              rgba(5,5,8,0.8) 0%, 
              rgba(5,5,8,0.95) 100%
            ),
            url('/images/hotel-corridor-2.jpg');
          background-size: cover;
          background-attachment: fixed;
          background-position: center;
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        /* NAV */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 20px 48px;
          display: flex; align-items: center; justify-content: space-between;
          backdrop-filter: blur(20px);
          border-bottom: 1px solid transparent;
          transition: all 0.3s;
        }
        .nav.scrolled {
          background: rgba(5,5,8,0.92);
          border-bottom-color: var(--border);
        }
        .nav-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px; letter-spacing: 4px;
          color: var(--text);
          display: flex; align-items: center; gap: 10px;
        }
        .nav-logo span { color: var(--red); }
        .nav-links { display: flex; gap: 32px; }
        .nav-links a {
          color: var(--muted); font-size: 14px; font-weight: 500;
          text-decoration: none; letter-spacing: 0.5px;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--text); }
        .nav-cta {
          background: var(--red); color: #fff;
          border: none; padding: 10px 24px;
          border-radius: 6px; font-family: 'DM Sans', sans-serif;
          font-weight: 700; font-size: 14px; cursor: pointer;
          letter-spacing: 0.5px; transition: all 0.2s;
        }
        .nav-cta:hover {
          background: #ff2a2a;
          box-shadow: 0 0 24px var(--red-glow);
        }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; padding: 120px 48px 80px;
          position: relative; overflow: hidden;
          background-image: 
            linear-gradient(to bottom, 
              rgba(5,5,8,0.7) 0%, 
              rgba(5,5,8,0.95) 100%
            ),
            url('/images/hero-corridor.jpg');
          background-size: cover;
          background-position: center;
        }
        .hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(232,28,28,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,28,28,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 50%,
            black 40%, transparent 100%);
        }
        .hero-glow {
          position: absolute; top: 20%; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 400px;
          background: radial-gradient(ellipse,
            rgba(232,28,28,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(232,28,28,0.1);
          border: 1px solid rgba(232,28,28,0.3);
          color: #ff6b6b; font-size: 12px; font-weight: 600;
          letter-spacing: 2px; text-transform: uppercase;
          padding: 6px 166px; border-radius: 100px;
          margin-bottom: 32px;
          font-family: 'JetBrains Mono', monospace;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--red);
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(80px, 12vw, 160px);
          line-height: 0.9; letter-spacing: 8px;
          color: var(--text); margin-bottom: 8px;
          position: relative;
        }
        .hero-title .red { color: var(--red); }
        .hero-subtitle-large {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(16px, 2vw, 22px);
          font-weight: 300; color: var(--muted);
          letter-spacing: 3px; text-transform: uppercase;
          margin-bottom: 24px;
        }
        .hero-tagline {
          font-size: clamp(16px, 2vw, 20px);
          font-weight: 400; color: #8888aa;
          max-width: 580px; line-height: 1.6;
          margin-bottom: 48px;
        }
        .hero-tagline em { color: var(--text); font-style: normal; }
        .hero-ctas {
          display: flex; gap: 16px; align-items: center;
          margin-bottom: 80px;
        }
        .btn-primary {
          background: var(--red); color: #fff;
          border: none; padding: 16px 40px;
          border-radius: 6px; font-family: 'DM Sans', sans-serif;
          font-weight: 700; font-size: 16px; cursor: pointer;
          letter-spacing: 0.5px;
          transition: all 0.25s;
          box-shadow: 0 0 0 var(--red-glow);
        }
        .btn-primary:hover {
          background: #ff2a2a;
          box-shadow: 0 0 40px var(--red-glow);
          transform: translateY(-2px);
        }
        .btn-secondary {
          background: transparent; color: var(--text);
          border: 1px solid var(--border); padding: 16px 40px;
          border-radius: 6px; font-family: 'DM Sans', sans-serif;
          font-weight: 500; font-size: 16px; cursor: pointer;
          letter-spacing: 0.5px; transition: all 0.25s;
        }
        .btn-secondary:hover {
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.04);
        }
        .hero-stats {
          display: flex; gap: 64px;
          padding-top: 48px;
          border-top: 1px solid var(--border);
        }
        .hero-stat-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 48px; color: var(--text);
          line-height: 1;
        }
        .hero-stat-value .unit { color: var(--red); }
        .hero-stat-label {
          font-size: 12px; color: var(--muted);
          letter-spacing: 2px; text-transform: uppercase;
          margin-top: 4px;
        }

        /* PROBLEM SECTION */
        .section {
          padding: 120px 48px;
          max-width: 1200px; margin: 0 auto;
        }
        .section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: var(--red);
          letter-spacing: 3px; text-transform: uppercase;
          margin-bottom: 16px;
        }
        .section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 6vw, 80px);
          line-height: 0.95; letter-spacing: 2px;
          color: var(--text); margin-bottom: 24px;
        }
        .section-body {
          font-size: 18px; color: var(--muted);
          line-height: 1.8; max-width: 560px;
        }

        /* INCIDENT TICKER */
        .incident-ticker {
          background: rgba(14,14,24,0.6);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-left: 3px solid var(--red);
          border-radius: 8px; padding: 20px 24px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px; color: var(--muted);
          margin: 48px 0;
        }
        .incident-ticker .label {
          color: var(--red); font-size: 10px;
          letter-spacing: 2px; text-transform: uppercase;
          margin-bottom: 12px;
        }
        .ticker-item {
          display: flex; gap: 16px; padding: 6px 0;
          border-bottom: 1px solid var(--border);
          animation: fadeInUp 0.4s ease both;
        }
        .ticker-item:last-child { border-bottom: none; }
        .ticker-time { color: var(--red); min-width: 70px; }
        .ticker-event { color: var(--text); }
        .ticker-loc { color: var(--muted); margin-left: auto; }

        /* HOW IT WORKS */
        #how {
          position: relative;
          background-image: 
            linear-gradient(to bottom, 
                rgba(5,5,8,0.95) 0%, 
                rgba(5,5,8,0.8) 50%,
                rgba(5,5,8,0.95) 100%
            ),
            url('/images/security-ops.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          margin-top: 80px;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .timeline {
          position: relative;
          padding-left: 40px;
          margin-top: 64px;
        }
        .timeline::before {
          content: '';
          position: absolute; left: 12px; top: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom,
            var(--red), rgba(232,28,28,0.1));
        }
        .timeline-item {
          position: relative; margin-bottom: 48px;
          opacity: 0; transform: translateX(-20px);
          transition: all 0.6s ease;
        }
        .timeline-item.revealed {
          opacity: 1; transform: translateX(0);
        }
        .timeline-dot {
          position: absolute; left: -34px; top: 4px;
          width: 12px; height: 12px; border-radius: 50%;
          background: var(--red);
          box-shadow: 0 0 16px var(--red-glow);
        }
        .timeline-time {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; color: var(--red);
          letter-spacing: 1px; margin-bottom: 6px;
        }
        .timeline-title {
          font-size: 20px; font-weight: 700;
          color: var(--text); margin-bottom: 6px;
        }
        .timeline-desc {
          font-size: 15px; color: var(--muted); line-height: 1.6;
        }

        /* FEATURES GRID */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px; margin-top: 64px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 12px; overflow: hidden;
        }
        .feature-card {
          background: rgba(14,14,24,0.7);
          backdrop-filter: blur(10px);
          padding: 40px 32px;
          opacity: 0; transform: translateY(20px);
          transition: all 0.5s ease;
        }
        .feature-card.revealed {
          opacity: 1; transform: translateY(0);
        }
        .feature-card:hover {
          background: rgba(232,28,28,0.04);
        }
        .feature-icon {
          font-size: 32px; margin-bottom: 16px;
          display: block;
        }
        .feature-title {
          font-size: 18px; font-weight: 700;
          color: var(--text); margin-bottom: 8px;
        }
        .feature-desc {
          font-size: 14px; color: var(--muted); line-height: 1.6;
        }
        .feature-tag {
          display: inline-block; margin-top: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: var(--red);
          letter-spacing: 1.5px; text-transform: uppercase;
        }

        /* TECH STACK */
        .tech-pills {
          display: flex; flex-wrap: wrap; gap: 10px;
          margin-top: 32px;
        }
        .tech-pill {
          background: rgba(14,14,24,0.6);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          color: var(--muted); font-size: 13px;
          padding: 8px 16px; border-radius: 100px;
          font-family: 'JetBrains Mono', monospace;
          transition: all 0.2s;
          cursor: default;
        }
        .tech-pill:hover {
          border-color: rgba(232,28,28,0.4);
          color: var(--text);
          background: rgba(232,28,28,0.06);
        }

        /* COMPARISON */
        .comparison {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 2px; margin-top: 64px;
          border: 1px solid var(--border);
          border-radius: 12px; overflow: hidden;
        }
        .comp-col { padding: 40px; background: rgba(14,14,24,0.7); backdrop-filter: blur(10px); }
        .comp-col.bad { background: rgba(232,28,28,0.04); }
        .comp-col.good { background: rgba(0,212,255,0.04); }
        .comp-header {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px; letter-spacing: 2px;
          margin-bottom: 24px;
        }
        .comp-header.bad { color: #ff6b6b; }
        .comp-header.good { color: var(--accent); }
        .comp-item {
          display: flex; gap: 12px;
          padding: 10px 0; font-size: 15px;
          border-bottom: 1px solid var(--border);
          color: var(--muted);
        }
        .comp-item:last-child { border-bottom: none; }
        .comp-icon { font-size: 16px; flex-shrink: 0; }

        /* BIG QUOTE */
        .big-quote {
          text-align: center; padding: 120px 48px;
          position: relative; overflow: hidden;
        }
        .big-quote-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 50% 50%,
            rgba(232,28,28,0.06) 0%, transparent 70%);
        }
        .big-quote-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 6vw, 72px);
          letter-spacing: 2px; line-height: 1.1;
          color: var(--text); max-width: 900px;
          margin: 0 auto 32px;
          position: relative;
        }
        .big-quote-text .highlight { color: var(--red); }
        .big-quote-sub {
          font-size: 18px; color: var(--muted);
          position: relative;
        }

        /* CTA SECTION */
        .cta-section {
          padding: 80px 48px 120px;
          text-align: center;
        }
        .cta-box {
          background: rgba(14,14,24,0.8);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 16px; padding: 80px 48px;
          max-width: 700px; margin: 0 auto;
          position: relative; overflow: hidden;
        }
        .cta-box::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent, var(--red), transparent);
        }
        .cta-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 56px; letter-spacing: 3px;
          color: var(--text); margin-bottom: 16px;
        }
        .cta-sub {
          font-size: 17px; color: var(--muted);
          line-height: 1.6; margin-bottom: 40px;
        }
        .cta-btns {
          display: flex; gap: 12px;
          justify-content: center;
        }

        /* FOOTER */
        .footer {
          padding: 40px 48px;
          border-top: 1px solid var(--border);
          display: flex; justify-content: space-between;
          align-items: center;
        }
        .footer-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px; letter-spacing: 4px;
          color: var(--muted);
        }
        .footer-note {
          font-size: 13px; color: var(--muted);
          font-family: 'JetBrains Mono', monospace;
        }

        /* REVEAL ANIMATIONS */
        [data-reveal] {
          opacity: 0; transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        [data-reveal].revealed {
          opacity: 1; transform: translateY(0);
        }
        [data-reveal="left"] {
          transform: translateX(-30px);
        }
        [data-reveal="left"].revealed {
          transform: translateX(0);
        }

        /* TYPEWRITER */
        .typewriter-cursor {
          animation: blink 1s step-end infinite;
          color: var(--red);
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* SCROLLING MARQUEE */
        .marquee-track {
          overflow: hidden; padding: 24px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: var(--surface);
        }
        .marquee-inner {
          display: flex; gap: 48px;
          animation: marquee 20s linear infinite;
          width: max-content;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-item {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px; color: var(--muted);
          letter-spacing: 2px; text-transform: uppercase;
          white-space: nowrap; display: flex;
          align-items: center; gap: 12px;
        }
        .marquee-dot { color: var(--red); }

        @media (max-width: 768px) {
          .nav { padding: 16px 24px; }
          .nav-links { display: none; }
          .hero { padding: 100px 24px 60px; }
          .hero-stats { gap: 32px; flex-wrap: wrap; }
          .section { padding: 80px 24px; }
          .features-grid { grid-template-columns: 1fr; }
          .comparison { grid-template-columns: 1fr; }
          .footer { flex-direction: column; gap: 16px; }
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav className={`nav ${scrollY > 50 ? "scrolled" : ""}`}>
        <div className="nav-logo">
          ⚡ <span>AEGIS</span>
        </div>
        <div className="nav-links">
          <a href="#how">How It Works</a>
          <a href="#features">Features</a>
          <a href="#tech">Technology</a>
        </div>
        <button className="nav-cta" onClick={() => onGetStarted("register")}>
          Deploy AEGIS →
        </button>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-glow" />

        <div className="hero-badge">
          <span className="badge-dot" />
          AI-Powered Crisis Response
        </div>

        <h1 className="hero-title">
          <span className="red">A</span>EGIS
        </h1>

        <p className="hero-subtitle-large">
          Autonomous Emergency Guardian & Incident Synchronization
        </p>

        <p className="hero-tagline">
          When seconds matter, <em>AI that never sleeps</em> watches your venue —
          detecting threats, routing guests, and coordinating responders
          before humans even react.
        </p>

            <div className="hero-ctas" data-reveal="up" style={{ transitionDelay: '0.4s' }}>
              <button className="btn-primary" onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}>
                Protect Your Venue →
              </button>
            </div>

        <div className="hero-stats">
          {[
            { value: 15, suffix: "s", label: "Autonomous Response" },
            { value: 6,  suffix: "+", label: "Camera Zones" },
            { value: 500, suffix: "+", label: "SMS Alerts / Incident" },
            { value: 100, suffix: "%", label: "No Human Input" },
          ].map((s, i) => (
            <div key={i}>
              <div className="hero-stat-value">
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE ─────────────────────────────────────────────── */}
      <div className="marquee-track">
        <div className="marquee-inner">
          {[
            "YOLOv8 Person Detection",
            "Gemini 2.0 Threat Intelligence",
            "BFS Evacuation Routing",
            "Twilio SMS Dispatch",
            "Real-Time WebSocket",
            "RTSP CCTV Integration",
            "Web Speech PA System",
            "Google Maps Responders",
            "IoT Smart Lighting",
            "Progressive Web App",
            "YOLOv8 Person Detection",
            "Gemini 2.0 Threat Intelligence",
            "BFS Evacuation Routing",
            "Twilio SMS Dispatch",
            "Real-Time WebSocket",
            "RTSP CCTV Integration",
            "Web Speech PA System",
            "Google Maps Responders",
            "IoT Smart Lighting",
            "Progressive Web App",
          ].map((item, i) => (
            <span key={i} className="marquee-item">
              <span className="marquee-dot">◆</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── PROBLEM ─────────────────────────────────────────────── */}
      <section className="section" id="problem">
        <div data-reveal>
          <div className="section-label">// The Problem</div>
          <h2 className="section-title">
            EVERY VENUE<br/>USES A 1970s<br/>
            <span style={{ color: "var(--red)" }}>FIRE ALARM</span>
          </h2>
          <p className="section-body">
            Hotels. Malls. Stadiums. When a real emergency strikes, staff
            have no coordination, guests have no guidance, and first
            responders arrive <em style={{ color: "var(--text)", fontStyle: "normal" }}>completely blind.</em>
            <br /><br />
            The current solution is a beeping alarm and a laminated map
            on the wall. We built what should have existed for 30 years.
          </p>
        </div>

        <div className="incident-ticker" data-reveal>
          <div className="label">⬤ &nbsp;Live incident simulation log</div>
          {[
            { time: "00:00:00", event: "Normal operations. All zones monitored.", loc: "Grand Meridian Hotel" },
            { time: "00:00:12", event: "🔥 Fire signature detected — Restaurant Zone", loc: "CAM-03" },
            { time: "00:00:14", event: "Threat confirmed across 10 frames. P1 escalated.", loc: "Fusion Engine" },
            { time: "00:00:17", event: "Gemini analyzing 28 occupants across 6 zones...", loc: "Gemini 2.0" },
            { time: "00:00:19", event: "BFS: Safe routes calculated for all zones.", loc: "Routing Engine" },
            { time: "00:00:21", event: "📱 SMS delivered to 3 staff members.", loc: "Twilio API" },
            { time: "00:00:22", event: "🔊 PA: ATTENTION ALL GUESTS. FIRE CONFIRMED...", loc: "PA System" },
            { time: "00:00:23", event: "🗺️ First responders located: 0.5km ETA 2min", loc: "Google Maps" },
          ].map((item, i) => (
            <div key={i} className="ticker-item"
              style={{ animationDelay: `${i * 0.08}s` }}>
              <span className="ticker-time">{item.time}</span>
              <span className="ticker-event">{item.event}</span>
              <span className="ticker-loc">{item.loc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="section" id="how">
        <div data-reveal>
          <div className="section-label">// How It Works</div>
          <h2 className="section-title">
            FIVE PHASES.<br/>
            <span style={{ color: "var(--red)" }}>ZERO</span> HUMAN<br/>
            DECISIONS.
          </h2>
        </div>

        <div className="timeline">
          {[
            {
              time: "T + 0s",
              title: "System Standby — Always Watching",
              desc: "6 parallel camera threads analyze live feeds at 30FPS. YOLOv8 tracks every person in every zone. HSV fire model scans for thermal signatures. Nothing escapes.",
            },
            {
              time: "T + 2s → T + 12s",
              title: "Multimodal Threat Detection",
              desc: "Visual fire detection + acoustic analysis (screams, gunshots, glass break) run simultaneously. Sticky 10-frame confirmation eliminates false alarms before any alert fires.",
            },
            {
              time: "T + 13s",
              title: "Gemini AI — Threat Intelligence",
              desc: "A live venue snapshot (who is where, what is burning, what's adjacent) is sent to Gemini 2.0. It reasons about spread patterns, predicts safe windows, and generates role-specific staff instructions.",
            },
            {
              time: "T + 15s",
              title: "Tactical Dispatch — All Stakeholders",
              desc: "BFS calculates personalized evacuation routes. Twilio SMS fires to all staff with Gemini-written instructions. Google Maps locates nearest hospitals and fire stations. Guest PWAs go red.",
            },
            {
              time: "T + Resolution",
              title: "Post-Incident Intelligence",
              desc: "AEGIS auto-generates a legally-compliant incident report: timeline, person counts per zone, SMS delivery receipts, evacuation routes used, and Gemini's full analysis. Insurance-ready in seconds.",
            },
          ].map((item, i) => (
            <div key={i} className="timeline-item" data-reveal>
              <div className="timeline-dot" />
              <div className="timeline-time">{item.time}</div>
              <div className="timeline-title">{item.title}</div>
              <div className="timeline-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BEFORE / AFTER ──────────────────────────────────────── */}
      <section className="section">
        <div data-reveal>
          <div className="section-label">// The Difference</div>
          <h2 className="section-title">
            BEFORE<br/>
            <span style={{ color: "var(--red)" }}>VS</span> AFTER
          </h2>
        </div>

        <div className="comparison" data-reveal>
          <div className="comp-col bad">
            <div className="comp-header bad">Without AEGIS</div>
            {[
              ["❌", "Fire alarm beeps. Nobody knows where."],
              ["❌", "Staff call each other on phones."],
              ["❌", "Guests panic. Wrong exits chosen."],
              ["❌", "First responders arrive blind."],
              ["❌", "No record of who evacuated where."],
              ["❌", "Response time: 8-15 minutes."],
            ].map(([icon, text], i) => (
              <div key={i} className="comp-item">
                <span className="comp-icon">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
          <div className="comp-col good">
            <div className="comp-header good">With AEGIS</div>
            {[
              ["✅", "Fire detected in under 12 seconds autonomously."],
              ["✅", "All staff receive personalized SMS instantly."],
              ["✅", "Guests see green exit routes on their phones."],
              ["✅", "Responders get live venue map + person counts."],
              ["✅", "Full audit trail generated automatically."],
              ["✅", "Complete autonomous response: under 15 seconds."],
            ].map(([icon, text], i) => (
              <div key={i} className="comp-item">
                <span className="comp-icon">{icon}</span>
                <span style={{ color: "var(--text)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section className="section" id="features">
        <div data-reveal>
          <div className="section-label">// Capabilities</div>
          <h2 className="section-title">
            BUILT FOR<br/>
            <Typewriter
              words={["HOTELS", "MALLS", "STADIUMS", "AIRPORTS", "HOSPITALS"]}
              speed={90}
            />
          </h2>
        </div>

        <div className="features-grid">
          {[
            {
              icon: "👁️",
              title: "Computer Vision",
              desc: "YOLOv8 person detection + custom HSV fire model running simultaneously at 30FPS across all camera zones.",
              tag: "YOLOv8 + OpenCV",
            },
            {
              icon: "🧠",
              title: "Gemini AI Reasoning",
              desc: "Live venue snapshot sent to Gemini 2.0. Real AI reasoning with actual person counts, not template responses.",
              tag: "Gemini 2.0 Flash",
            },
            {
              icon: "🗺️",
              title: "BFS Evacuation Routing",
              desc: "Breadth-first search calculates the shortest safe path to every exit for every zone, updating as threat evolves.",
              tag: "Dynamic Pathfinding",
            },
            {
              icon: "📱",
              title: "Multi-Stakeholder Alerts",
              desc: "Staff SMS, guest PWA, first responder maps — all dispatched simultaneously within seconds of detection.",
              tag: "Twilio + PWA",
            },
            {
              icon: "🔊",
              title: "PA System Integration",
              desc: "Automated voice announcements broadcast through venue speakers the moment threat is confirmed.",
              tag: "Web Speech API",
            },
            {
              icon: "🚒",
              title: "First Responder Mapping",
              desc: "Nearest hospitals, fire stations, and police located automatically with live distance and ETA.",
              tag: "Google Maps API",
            },
            {
              icon: "🔊",
              title: "Audio Threat Detection",
              desc: "Gunshots, screams, and glass breaking detected from camera audio feeds using spectral analysis.",
              tag: "librosa + MFCC",
            },
            {
              icon: "📋",
              title: "Auto Incident Reports",
              desc: "Legally-compliant post-incident documentation generated automatically. Insurance and compliance ready.",
              tag: "Compliance Ready",
            },
            {
              icon: "🏗️",
              title: "Hardware Integration Ready",
              desc: "RTSP CCTV, Philips Hue lighting, MQTT IoT nodes, DALI protocol — full production APIs written and ready.",
              tag: "Production Ready",
            },
          ].map((f, i) => (
            <div key={i} className="feature-card" data-reveal>
              <span className="feature-icon">{f.icon}</span>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
              <div className="feature-tag">{f.tag}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TECH ────────────────────────────────────────────────── */}
      <section className="section" id="tech">
        <div data-reveal>
          <div className="section-label">// Technology</div>
          <h2 className="section-title">
            ENTERPRISE STACK.<br/>
            <span style={{ color: "var(--red)" }}>ZERO</span><br/>
            NEW HARDWARE.
          </h2>
          <p className="section-body">
            AEGIS works with your existing CCTV infrastructure.
            Connect any IP camera via RTSP in under 5 minutes.
            No rewiring. No contractors. No downtime.
          </p>
        </div>

        <div className="tech-pills" data-reveal>
          {[
            "Python 3.12", "FastAPI", "WebSocket",
            "YOLOv8", "OpenCV", "MediaPipe",
            "Gemini 2.0 Flash", "Google Maps API",
            "Twilio SMS", "React 18", "Recharts",
            "Docker", "RTSP Protocol", "MQTT",
            "Philips Hue API", "DALI Protocol",
            "Web Speech API", "Progressive Web App",
            "BFS Pathfinding", "librosa",
          ].map((tech, i) => (
            <span key={i} className="tech-pill">{tech}</span>
          ))}
        </div>
      </section>

      {/* ── QUOTE ───────────────────────────────────────────────── */}
      <div className="big-quote">
        <div className="big-quote-bg" />
        <h2 className="big-quote-text" data-reveal>
          WE DIDN'T BUILD A SMARTER{" "}
          <span className="highlight">FIRE ALARM.</span>
          <br />
          WE BUILT THE{" "}
          <span className="highlight">NERVOUS SYSTEM</span>
          <br />
          FOR ANY BUILDING.
        </h2>
        <p className="big-quote-sub" data-reveal>
          Sight. Sound. Intelligence. Action. All in under 15 seconds.
        </p>
      </div>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="cta-section" id="cta">
        <div className="cta-box" data-reveal>
          <div className="cta-title">READY TO DEPLOY?</div>
          <p className="cta-sub">
            Set up AEGIS for your venue in under 5 minutes.
            Works with your existing cameras.
            No hardware changes required.
          </p>
          <div className="cta-btns">
            <button className="btn-primary"
              onClick={() => onGetStarted("register")}>
              Get Started Free →
            </button>
            <button className="btn-secondary"
              onClick={() => onGetStarted("login")}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-logo">⚡ AEGIS</div>
        <div className="footer-note">
          Autonomous Emergency Guardian & Incident Synchronization
        </div>
        <div className="footer-note" style={{ color: "var(--red)" }}>
          Powered by Gemini AI
        </div>
      </footer>
    </>
  );
}
