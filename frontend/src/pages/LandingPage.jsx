import { useEffect, useRef, useState, useCallback } from 'react';

// ============================================================
// ANIMATION & TIMING CONSTANTS
// ============================================================
const ANIMATION_DURATION_COUNTER = 1600; // Counter animation in ms
const FORM_SUBMISSION_DELAY = 900; // Form success state delay in ms
const SCROLL_REVEAL_THRESHOLD = 0.1;
const SCROLL_REVEAL_MARGIN = '-40px';
const NAV_SCROLL_THRESHOLD = 48; // Navbar scroll detection threshold

// ============================================================
// KOMPONEN & UTILITY STYLES
// Catatan perbaikan audit:
// - Semua design token (warna, spacing, shadow, radius) SEKARANG
//   hanya didefinisikan sekali di index.css (Single Source of Truth).
//   Blok ini HANYA berisi class komponen (button, card, badge, dll)
//   yang sebelumnya duplikat/berbenturan dengan index.css.
// - .btn-primary sekarang memakai var(--color-on-primary) — bukan
//   var(--color-on-accent) — supaya kontras teks tombol utama
//   konsisten dan lolos WCAG AA di kedua tema (dark & light).
// - .flex-grid-3 diganti nama menjadi .card-row (nama sebelumnya
//   menyesatkan karena implementasinya flexbox, bukan CSS grid).
// - Semua shadow berwarna sekarang pakai color-mix() lewat inline
//   style di komponen (lihat FeatureCard & Testimonials) — bukan
//   string concat "${color}40" yang menghasilkan CSS tidak valid.
// ============================================================
function ComponentStyles() {
  return (
    <style>{`
      section[id] { scroll-margin-top: 88px; }

      .skip-link {
        position: fixed;
        top: -60px; left: 16px; z-index: var(--z-skip, 960);
        background: var(--color-primary);
        color: var(--color-on-primary);
        padding: 12px 20px; border-radius: var(--radius-sm);
        font-weight: 700; font-size: var(--text-sm, 0.875rem);
        transition: top 150ms ease;
      }
      .skip-link:focus { top: 16px; }

      .sr-only {
        position: absolute; width: 1px; height: 1px;
        padding: 0; margin: -1px; overflow: hidden;
        clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
      }

      /* ---- Type scale (dipakai lewat var(--text-*), bukan literal px/rem) ---- */
      :root {
        --text-2xs: 0.70rem;
        --text-xs: 0.75rem;
        --text-sm: 0.875rem;
        --text-base: 1rem;
        --text-lg: 1.125rem;
        --text-xl: 1.375rem;
        --text-2xl: clamp(1.75rem, 3.4vw, 2.25rem);
        --text-3xl: clamp(2rem, 4vw, 3rem);
        --text-4xl: clamp(2.4rem, 5vw, 4rem);
        --leading-tight: 1.1;
        --leading-snug: 1.35;
        --leading-relaxed: 1.7;
        --shadow-glow: 0 0 60px color-mix(in srgb, var(--color-primary) 15%, transparent);
        --shadow-glow-strong: 0 0 80px color-mix(in srgb, var(--color-primary) 25%, transparent);
        --z-nav: 900;
        --z-skip: 960;
        --glass-bg: rgba(255,255,255,0.03);
        --glass-border: rgba(255,255,255,0.06);
      }
      [data-theme="light"] {
        --glass-bg: rgba(255,255,255,0.5);
        --glass-border: rgba(255,255,255,0.2);
      }

      .badge {
        max-width: 100%;
        backdrop-filter: blur(4px);
        transition: all 0.3s ease;
      }
      .badge:hover {
        background: color-mix(in srgb, var(--color-primary) 15%, transparent);
        border-color: var(--color-primary);
        transform: translateY(-1px);
      }

      .heading-highlight {
        color: var(--color-foreground);
        position: relative;
        display: inline;
      }
      .heading-highlight::after {
        content: '';
        position: absolute;
        left: -0.02em; right: -0.02em; bottom: 0.06em;
        height: 0.24em;
        background: color-mix(in srgb, var(--color-primary) 45%, transparent);
        border-radius: 2px;
        z-index: -1;
        transition: height 0.3s ease, background 0.3s ease;
      }
      .heading-highlight:hover::after {
        height: 0.35em;
        background: color-mix(in srgb, var(--color-primary) 60%, transparent);
      }

      .hover-card {
        box-shadow: var(--shadow-sm);
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                    border-color 0.3s ease,
                    box-shadow 0.3s ease,
                    background 0.3s ease;
        will-change: transform;
      }
      .hover-card:hover, .hover-card:focus-within {
        transform: translateY(-6px) scale(1.005);
        border-color: color-mix(in srgb, var(--color-primary) 40%, transparent);
        box-shadow: var(--shadow-lg);
        background: var(--color-card-hover, var(--color-muted));
      }
      .hover-card--primary:hover, .hover-card--primary:focus-within {
        border-color: var(--color-primary);
        box-shadow: var(--shadow-glow), var(--shadow-lg);
      }

      .glass-card {
        background: var(--glass-bg);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--glass-border);
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      }

      .btn {
        display: inline-flex; align-items: center; justify-content: center;
        gap: 8px; border-radius: 9999px; cursor: pointer;
        font-weight: 600; text-decoration: none; white-space: nowrap;
        border: 1px solid transparent; box-sizing: border-box;
        font-family: var(--font-body);
        min-height: 44px;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                    box-shadow 0.3s ease,
                    filter 0.3s ease,
                    background 0.3s ease,
                    opacity 0.3s ease;
        position: relative;
        overflow: hidden;
        will-change: transform;
      }
      .btn::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.15), transparent 60%);
        opacity: 0;
        transition: opacity 0.4s ease;
        pointer-events: none;
      }
      .btn:hover::after { opacity: 1; }
      .btn:hover { transform: translateY(-2px) scale(1.02); }
      .btn:active { transform: translateY(0) scale(0.98); }
      .btn:disabled, .btn[aria-disabled="true"] {
        opacity: 0.6; cursor: not-allowed; transform: none; filter: none;
      }

      .btn-sm { padding: 10px 20px; font-size: var(--text-sm); min-height: 44px; }
      .btn-md { padding: 12px 28px; font-size: var(--text-sm); min-height: 48px; }
      .btn-lg { padding: 14px 36px; font-size: var(--text-base); min-height: 52px; }

      /* FIX: teks tombol primary pakai --color-on-primary (bukan
         --color-on-accent) supaya kontras terjamin di dark & light theme */
      .btn-primary {
        background: linear-gradient(180deg,
          color-mix(in srgb, var(--color-primary) 85%, white) 0%,
          var(--color-primary) 55%,
          color-mix(in srgb, var(--color-primary) 80%, black) 100%);
        color: var(--color-on-primary);
        box-shadow: 0 12px 28px color-mix(in srgb, var(--color-primary) 35%, transparent),
                    inset 0 1px 0 rgba(255,255,255,0.25);
      }
      .btn-primary:hover, .btn-primary:focus-visible {
        filter: brightness(1.08);
        box-shadow: 0 16px 40px color-mix(in srgb, var(--color-primary) 50%, transparent),
                    inset 0 1px 0 rgba(255,255,255,0.25);
      }

      .btn-secondary {
        background: var(--color-card);
        border-color: var(--color-border);
        color: var(--color-foreground);
        box-shadow: var(--shadow-sm);
      }
      .btn-secondary:hover, .btn-secondary:focus-visible {
        box-shadow: var(--shadow-md);
        border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
        background: var(--color-card-hover, var(--color-muted));
      }

      .btn-ghost {
        background: transparent;
        border-color: var(--color-border);
        color: var(--color-muted-fg);
        box-shadow: none;
      }
      .btn-ghost:hover, .btn-ghost:focus-visible {
        color: var(--color-foreground);
        border-color: var(--color-foreground);
        background: color-mix(in srgb, var(--color-foreground) 5%, transparent);
        box-shadow: none;
      }

      .btn-block { width: 100%; }

      .section-heading {
        font-family: var(--font-display);
        font-weight: 800;
        font-size: var(--text-3xl);
        color: var(--color-foreground);
        margin-top: 8px; margin-bottom: 16px;
        line-height: var(--leading-tight);
      }
      .section-eyebrow-wrap { text-align: center; margin-bottom: 56px; padding: 0 var(--space-sm); }
      .section-sub {
        color: var(--color-muted-fg); font-size: var(--text-lg);
        max-width: 480px; margin: 0 auto;
        font-family: var(--font-body);
      }

      /* Renamed dari .flex-grid-3 -> .card-row: implementasinya
         flexbox, bukan CSS grid, jadi nama class disamakan dengan
         teknologi yang sebenarnya dipakai. */
      .card-row {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        justify-content: center;
      }
      .card-row > * {
        flex: 1 1 calc(33.333% - 24px);
        min-width: 260px;
        max-width: 100%;
      }
      @media (max-width: 1023px) {
        .card-row > * { flex: 1 1 calc(50% - 24px); }
      }
      @media (max-width: 639px) {
        .card-row > * { flex: 1 1 100%; }
      }

      @keyframes barGrow {
        from { transform: scaleY(0); }
        to { transform: scaleY(1); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }

      .reveal {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.7s cubic-bezier(0.34, 1.56, 0.64, 1),
                    transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .reveal.visible {
        opacity: 1;
        transform: translateY(0);
      }

      @media (prefers-reduced-motion: reduce) {
        .hero-card > div { animation: none !important; }
        [class*="float"], [class*="pulse"], [class*="bounce"], [class*="shimmer"] {
          animation: none !important;
        }
        .btn-shimmer { background: none !important; }
      }
    `}</style>
  );
}

// ============================================================
// HOOKS
// ============================================================

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

function usePointerCapable() {
  const [capable, setCapable] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const handler = (e) => setCapable(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return capable;
}

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: SCROLL_REVEAL_THRESHOLD, rootMargin: `0px 0px ${SCROLL_REVEAL_MARGIN} 0px` }
    );

    const attach = () => {
      document.querySelectorAll('.reveal:not(.visible)').forEach((el) => observer.observe(el));
    };

    attach();
    const timeout = setTimeout(attach, 200);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);
}

function useMousePosition(ref) {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handler = (e) => {
      const rect = element.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setPosition({ x, y });
    };

    element.addEventListener('mousemove', handler);
    return () => element.removeEventListener('mousemove', handler);
  }, [ref]);

  return position;
}

/**
 * Deteksi posisi scroll untuk efek Navbar (background solid saat discroll).
 * BARU — mendukung Navbar yang sebelumnya tidak ada sama sekali.
 */
function useScrolled(threshold = NAV_SCROLL_THRESHOLD) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [threshold]);
  return scrolled;
}

// ============================================================
// TYPING EFFECT DAN COUNTER
// ============================================================

const PHRASES = ['Lebih Cerdas', 'Lebih Profesional', 'Tanpa Ribet'];
const TYPING_MAX_CYCLES = 2;

function useTyping(reducedMotion) {
  const [text, setText] = useState(() => (reducedMotion ? PHRASES[0] : ''));
  const [blink, setBlink] = useState(true);
  const [done, setDone] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion || done) return;
    const id = setInterval(() => setBlink((v) => !v), 530);
    return () => clearInterval(id);
  }, [reducedMotion, done]);

  useEffect(() => {
    if (reducedMotion) return;

    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let cycles = 0;
    let timer;

    const tick = () => {
      const word = PHRASES[phraseIdx];
      setText(deleting ? word.slice(0, charIdx - 1) : word.slice(0, charIdx + 1));

      if (deleting) {
        charIdx--;
      } else {
        charIdx++;
      }

      let delay = deleting ? 40 : 75;

      if (!deleting && charIdx === word.length) {
        deleting = true;
        delay = 1500;
      } else if (deleting && charIdx === 0) {
        deleting = false;
        phraseIdx += 1;
        if (phraseIdx >= PHRASES.length) {
          phraseIdx = 0;
          cycles += 1;
          if (cycles >= TYPING_MAX_CYCLES) {
            setText(PHRASES[PHRASES.length - 1]);
            setBlink(false);
            setDone(true);
            return;
          }
        }
        delay = 400;
      }

      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, 700);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  return { text, blink: reducedMotion || done ? false : blink, done: reducedMotion || done };
}

function useCounter(target, suffix = '', started = false, reducedMotion = false) {
  const [val, setVal] = useState(() => (reducedMotion ? target : 0));

  useEffect(() => {
    if (!started || reducedMotion) return;

    let startTime;
    const duration = ANIMATION_DURATION_COUNTER;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(eased * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [started, target, reducedMotion]);

  return val + suffix;
}

// ============================================================
// COMPONENTS
// ============================================================

function Btn({ href, variant = 'primary', size = 'md', children, onClick, icon, type = 'button', block = false, className = '', disabled = false, target, rel }) {
  const btnRef = useRef(null);
  const pos = useMousePosition(btnRef);

  const cls = `btn btn-${variant} btn-${size} ${block ? 'btn-block' : ''} ${className}`.trim();
  const style = variant !== 'ghost' ? {
    '--mouse-x': pos.x + '%',
    '--mouse-y': pos.y + '%',
  } : {};

  if (href) {
    return (
      <a
        ref={btnRef}
        href={disabled ? undefined : href}
        className={cls}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        style={style}
        target={target}
        rel={rel}
      >
        {icon && <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>}
        {children}
      </a>
    );
  }

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={onClick}
      className={cls}
      disabled={disabled}
      style={style}
    >
      {icon && <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>}
      {children}
    </button>
  );
}

function Label({ children }) {
  return (
    <span className="badge">
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
        <circle cx="4" cy="4" r="4" fill="var(--color-primary)" />
      </svg>
      {children}
    </span>
  );
}

// Catatan konsistensi ikon: seluruh ikon garis (outline) di halaman ini
// memakai strokeWidth={2}. StarIcon sengaja dikecualikan (strokeWidth
// lebih tipis) karena bentuknya kecil (14–18px) dan mayoritas terisi
// warna (fill), bukan ikon garis murni — bukan inkonsistensi yang lolos
// tanpa sadar, tapi keputusan sadar untuk ukuran sekecil itu.
function StarIcon({ filled = true, size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill={filled ? 'var(--color-warning, #FBBF24)' : 'none'}
      stroke="var(--color-warning, #FBBF24)"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      <path d="M7 1l1.8 3.6L13 5.3l-3 2.9.7 4.1L7 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7L7 1z" />
    </svg>
  );
}

// ============================================================
// NAVBAR — BARU
// Perbaikan temuan kritis #1: sebelumnya tidak ada navigasi sama
// sekali. Navbar ini sticky, berubah background saat discroll
// (memakai token --nav-bg-scrolled & --nav-border-scrolled yang
// sebelumnya sudah didefinisikan di index.css tapi tidak pernah
// dipakai), dan punya menu mobile yang bisa diakses keyboard.
// ============================================================
const NAV_LINKS = [
  { href: '#features', label: 'Fitur' },
  { href: '#pricing', label: 'Harga' },
  { href: '#testimonials', label: 'Testimoni' },
];

function Navbar({ activeSection }) {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 900, // var(--z-nav)
        background: scrolled ? 'var(--nav-bg-scrolled)' : 'transparent',
        borderBottom: `1px solid ${scrolled ? 'var(--nav-border-scrolled)' : 'transparent'}`,
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(10px)' : 'none',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      <nav
        aria-label="Navigasi utama"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '14px var(--space-lg, 24px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <a
          href="#hero"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '1.15rem',
            color: 'var(--color-foreground)',
            flexShrink: 0,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark, #D97706))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-on-primary)', fontWeight: 800, fontSize: '0.95rem',
            }}
          >
            U
          </span>
          UMKMPro
        </a>

        <div
          className="nav-links-desktop"
          style={{ display: 'none', alignItems: 'center', gap: 28 }}
        >
          {NAV_LINKS.map((l) => {
            const isActive = activeSection === l.href.replace('#', '');
            return (
              <a
                key={l.href}
                href={l.href}
                aria-current={isActive ? 'true' : undefined}
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-muted-fg)',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--color-foreground)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--color-muted-fg)'; }}
              >
                {l.label}
              </a>
            );
          })}
        </div>

        <div className="nav-actions-desktop" style={{ display: 'none', alignItems: 'center', gap: 12 }}>
          <Btn href="#cta" variant="ghost" size="sm">Masuk</Btn>
          <Btn href="#cta" variant="primary" size="sm">Coba Gratis</Btn>
        </div>

        <button
          type="button"
          className="nav-menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-card)',
            color: 'var(--color-foreground)',
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div
          id="mobile-menu"
          style={{
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-background)',
            padding: 'var(--space-md, 16px) var(--space-lg, 24px) var(--space-lg, 24px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '12px 8px',
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                color: 'var(--color-foreground)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <Btn href="#cta" variant="secondary" size="sm" block onClick={() => setMenuOpen(false)}>Masuk</Btn>
            <Btn href="#cta" variant="primary" size="sm" block onClick={() => setMenuOpen(false)}>Coba Gratis</Btn>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .nav-links-desktop { display: flex !important; }
          .nav-actions-desktop { display: flex !important; }
          .nav-menu-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}

// ============================================================
// SECTION: HERO
// Perbaikan: (1) delay animasi dipercepat (0.1/0.2/0.3/0.4s, dari
// 0.15/0.3/0.45/0.6s) supaya terasa lebih snappy; (2) mockup dashboard
// disederhanakan — grid mini-stat 3 kolom di bagian bawah dihapus
// supaya tidak lagi bersaing secara visual dengan headline (mockup
// sekarang berhenti di grafik 6 bulan, tetap informatif tapi lebih
// ringan); (3) ditambahkan disclaimer kecil bahwa data di mockup
// adalah ilustrasi, bukan data riil — penting untuk konteks pitch ke
// investor supaya tidak disalahartikan.
// ============================================================
function Hero() {
  const sectionRef = useRef(null);
  const [started, setStarted] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const { text, blink } = useTyping(reducedMotion);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const s1 = useCounter(5000, '+', started, reducedMotion);
  const s2 = useCounter(94, '%', started, reducedMotion);
  const s3 = started ? '4.9' : '0';

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="hero-section"
      style={{
        background: 'var(--color-background)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        isolation: 'isolate',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
          background: `
            radial-gradient(ellipse 900px 600px at 15% 20%, color-mix(in srgb, var(--color-primary) 10%, transparent), transparent 65%),
            radial-gradient(ellipse 600px 400px at 85% 80%, color-mix(in srgb, var(--color-secondary) 8%, transparent), transparent 60%)
          `,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: 'var(--space-3xl, 64px) var(--space-lg, 24px)',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'var(--space-2xl, 48px)',
          alignItems: 'center',
        }}
        className="hero-grid"
      >
        <div style={{ textAlign: 'center', minWidth: 0 }} className="hero-text">
          <div
            className="hero-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 'var(--space-lg, 24px)',
              animation: reducedMotion ? 'none' : 'fadeInUp 0.6s ease both',
            }}
          >
            <Label>Platform #1 UMKM Indonesia</Label>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'var(--text-4xl)',
              lineHeight: 'var(--leading-tight)',
              color: 'var(--color-foreground)',
              marginBottom: 'var(--space-lg, 20px)',
              whiteSpace: 'pre-line',
              minHeight: '2.35em',
              animation: reducedMotion ? 'none' : 'fadeInUp 0.7s ease 0.1s both',
            }}
          >
            {'Kelola UMKM\n'}
            <span aria-hidden="true" style={{ color: 'var(--color-primary)' }}>{text}</span>
            <span
              aria-hidden="true"
              style={{
                display: 'inline-block',
                width: 3,
                height: '0.75em',
                marginLeft: 2,
                background: 'var(--color-primary)',
                verticalAlign: 'middle',
                borderRadius: 2,
                opacity: blink ? 1 : 0,
                transition: 'opacity 0.08s',
              }}
            />
            <span className="sr-only">Lebih Cerdas, Lebih Profesional, Tanpa Ribet</span>
          </h1>

          <p
            style={{
              color: 'var(--color-muted-fg)',
              fontSize: 'var(--text-lg)',
              maxWidth: 480,
              marginBottom: 'var(--space-xl, 32px)',
              margin: '0 auto var(--space-xl, 32px)',
              fontFamily: 'var(--font-body)',
              animation: reducedMotion ? 'none' : 'fadeInUp 0.7s ease 0.2s both',
            }}
          >
            Platform all-in-one untuk UMKM Indonesia. Kelola keuangan, stok, dan pelanggan
            dalam satu dasbor — mudah, cepat, tanpa ribet.
          </p>

          <div
            className="hero-actions"
            style={{ animation: reducedMotion ? 'none' : 'fadeInUp 0.7s ease 0.3s both' }}
          >
            <Btn href="#cta" variant="primary" size="md">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Coba Gratis 14 Hari
            </Btn>
            <Btn href="#features" variant="ghost" size="md">
              Pelajari Lebih Lanjut
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Btn>
          </div>

          <div
            className="hero-stats"
            role="list"
            style={{ animation: reducedMotion ? 'none' : 'fadeInUp 0.7s ease 0.4s both' }}
          >
            {[
              { val: s1, label: 'UMKM Aktif' },
              { val: s2, label: 'Kepuasan' },
              { val: s3, label: 'Rating', withStar: true },
            ].map(({ val, label, withStar }) => (
              <div
                key={label}
                className="stat-item"
                role="listitem"
                style={{ textAlign: 'center' }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 'var(--text-3xl)',
                    color: 'var(--color-foreground)',
                    lineHeight: 1,
                  }}
                >
                  {val}
                  {withStar && <StarIcon size={18} />}
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-muted-fg)',
                    marginTop: 6,
                    fontWeight: 500,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Card — static, disederhanakan */}
        <div style={{ display: 'flex', justifyContent: 'center', minWidth: 0 }} className="hero-card">
          <div style={{ width: '100%', maxWidth: 460 }}>
            <div
              className="glass-card"
              style={{
                padding: 'var(--space-lg, 24px) var(--space-lg, 24px) var(--space-md, 16px)',
                borderRadius: 'var(--radius-xl)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                  borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  marginBottom: 'var(--space-md, 16px)',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm, 12px)', minWidth: 0 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 70%, black))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 4px 16px color-mix(in srgb, var(--color-primary) 40%, transparent)',
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-label="Ikon dashboard"
                    >
                      <rect x="1" y="1" width="6" height="6" rx="2" fill="var(--color-background)" />
                      <rect x="9" y="1" width="6" height="6" rx="2" fill="var(--color-background)" opacity="0.6" />
                      <rect x="1" y="9" width="6" height="6" rx="2" fill="var(--color-background)" opacity="0.6" />
                      <rect x="9" y="9" width="6" height="6" rx="2" fill="var(--color-background)" />
                    </svg>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 700,
                        color: 'var(--color-foreground)',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      Dashboard UMKMPro
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-fg)' }}>
                      Agustus 2026
                    </div>
                  </div>
                </div>
                <span
                  className="badge"
                  style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-xs) var(--space-sm)', flexShrink: 0 }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--color-success)',
                      display: 'inline-block',
                      marginRight: 4,
                    }}
                  />
                  Live
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-sm, 12px)',
                  marginBottom: 'var(--space-sm, 12px)',
                }}
              >
                {[
                  {
                    label: 'Total Pendapatan',
                    val: 'Rp 28,4 Jt',
                    delta: '+18%',
                    up: true,
                    icon: (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        <polyline points="17 6 23 6 23 12" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Laba Bersih',
                    val: 'Rp 16,2 Jt',
                    delta: '+31%',
                    up: true,
                    icon: (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                      </svg>
                    ),
                  },
                ].map(({ label, val, delta, up, icon }) => (
                  <div
                    key={label}
                    style={{
                      background: 'var(--color-background)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-sm, 12px) var(--space-md, 16px)',
                      border: '1px solid var(--color-border)',
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'var(--text-2xs)',
                        color: 'var(--color-muted-fg)',
                        marginBottom: 4,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>
                      {label}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-foreground)',
                        lineHeight: 1.2,
                      }}
                    >
                      {val}
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--text-2xs)',
                        fontWeight: 600,
                        marginTop: 4,
                        color: up ? 'var(--color-success)' : 'var(--color-destructive, #EF4444)',
                      }}
                    >
                      {delta}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: 'var(--color-background)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-sm, 12px) var(--space-md, 16px)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-sm, 12px)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      color: 'var(--color-foreground)',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    Pendapatan 6 Bulan
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-success)',
                      fontWeight: 700,
                    }}
                  >
                    ↑ +78%
                  </span>
                </div>
                <div
                  role="img"
                  aria-label="Grafik batang pendapatan 6 bulan terakhir: Maret 35%, April 52%, Mei 48%, Juni 68%, Juli 75%, Agustus 92% dari puncak"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 'var(--space-sm, 8px)',
                    height: 64,
                  }}
                >
                  {[35, 52, 48, 68, 75, 92].map((h, i) => (
                    <div
                      key={i}
                      aria-hidden="true"
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        height: '100%',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: `${h}%`,
                          borderRadius: '6px 6px 0 0',
                          transformOrigin: 'bottom',
                          background:
                            i === 5
                              ? 'linear-gradient(180deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 70%, black))'
                              : i === 4
                              ? 'linear-gradient(180deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 70%, black))'
                              : 'var(--color-border)',
                          transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          boxShadow:
                            i === 5
                              ? '0 4px 12px color-mix(in srgb, var(--color-primary) 30%, transparent)'
                              : 'none',
                        }}
                      />
                      <span
                        style={{
                          fontSize: 'var(--text-2xs)',
                          color: 'var(--color-muted-fg)',
                          fontWeight: 500,
                        }}
                      >
                        {['Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BARU: disclaimer — mencegah data ilustratif disalahartikan sebagai data riil */}
            <p
              style={{
                fontSize: 'var(--text-2xs)',
                color: 'var(--color-text-subtle)',
                textAlign: 'center',
                marginTop: 10,
                fontStyle: 'italic',
              }}
            >
              *Data pada dashboard adalah ilustrasi untuk keperluan demo.
            </p>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          opacity: 0.4,
        }}
        className="hero-scroll-hint"
      >
        <span
          style={{
            fontSize: 'var(--text-2xs)',
            color: 'var(--color-muted-fg)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
          }}
        >
          Scroll
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 16 16"
          fill="none"
          stroke="var(--color-muted-fg)"
          strokeWidth="2"
          style={{ animation: reducedMotion ? 'none' : 'float 2s ease-in-out infinite' }}
        >
          <path d="M3 6l5 5 5-5" />
        </svg>
      </div>

      <style>{`
        .hero-section { min-height: 100vh; padding-top: env(safe-area-inset-top, 0px); }
        @supports (min-height: 100svh) { .hero-section { min-height: 100svh; } }
        @media (max-width: 480px) { .hero-section { min-height: 100%; } }
        .hero-actions { display: flex; gap: 16px; justify-content: center; align-items: center; flex-wrap: wrap; margin-bottom: var(--space-2xl, 40px); width: 100%; }
        .hero-actions .btn-primary { flex: 1 1 220px; max-width: 320px; }
        .hero-stats { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-xl, 32px); padding-top: var(--space-xl, 32px); border-top: 1px solid var(--color-border); }
        .stat-item { transition: transform 0.3s ease; }
        .stat-item:hover { transform: translateY(-2px); }
        @media (min-width: 768px) {
          .hero-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-text { text-align: left !important; }
          .hero-text p { margin-left: 0 !important; margin-right: 0 !important; }
          .hero-badge { justify-content: flex-start !important; }
          .hero-actions { justify-content: flex-start !important; }
          .hero-actions .btn-primary { flex: 0 1 auto; }
          .hero-stats { justify-content: flex-start !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .hero-card { margin-top: var(--space-lg, 24px); }
          .hero-card > div { max-width: 400px !important; }
        }
        @media (max-width: 480px) {
          .hero-actions .btn-primary { flex-basis: 100%; }
          .hero-stats { gap: var(--space-md, 16px); }
        }
        @media (max-height: 700px) {
          .hero-scroll-hint { display: none; }
        }
      `}</style>
    </section>
  );
}

// ============================================================
// SECTION: FEATURES
// ============================================================
const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
    title: 'Keuangan Digital',
    desc: 'Catat pemasukan & pengeluaran otomatis. Laporan laba-rugi siap dalam hitungan detik.',
    color: 'var(--color-primary)',
    gradient: 'linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 70%, black))',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
        <path d="M16 3H8l-2 4h12l-2-4z" />
      </svg>
    ),
    title: 'Manajemen Stok',
    desc: 'Pantau inventaris real-time. Notifikasi otomatis saat stok hampir habis.',
    color: 'var(--color-accent)',
    gradient: 'linear-gradient(135deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 70%, black))',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: 'CRM Pelanggan',
    desc: 'Kelola data pelanggan, kirim promosi tepat sasaran, dan bangun loyalitas jangka panjang.',
    color: 'var(--color-accent)',
    gradient: 'linear-gradient(135deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 70%, black))',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'Analitik & Laporan',
    desc: 'Dashboard visual dengan insight bisnis yang mudah dipahami kapan saja.',
    color: 'var(--color-success)',
    gradient: 'linear-gradient(135deg, var(--color-success), color-mix(in srgb, var(--color-success) 70%, black))',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
    title: 'Akses Mobile',
    desc: 'Pantau bisnis dari mana saja lewat smartphone — iOS maupun Android.',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Keamanan Data',
    desc: 'Enkripsi end-to-end dan backup otomatis harian. Data bisnis Anda selalu aman.',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
  },
];

function FeatureCard({ icon, title, desc, color, gradient, delayMs, reducedMotion, pointerCapable }) {
  const ref = useRef(null);
  const tiltDisabled = reducedMotion || !pointerCapable;

  const handleMouseMove = useCallback(
    (e) => {
      if (tiltDisabled) return;
      const card = ref.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${y * -6}deg) rotateY(${x * 6}deg) translateY(-6px)`;
      card.style.boxShadow = 'var(--shadow-lg)';
    },
    [tiltDisabled]
  );

  const handleMouseLeave = useCallback(() => {
    if (ref.current) {
      ref.current.style.transform = '';
      ref.current.style.boxShadow = '';
    }
  }, []);

  // FIX (bug kritis #4 di audit): sebelumnya `${color}40` menempelkan
  // string alpha hex di belakang var(--color-x), yang menghasilkan CSS
  // tidak valid ("var(--color-success)40") dan membuat shadow berwarna
  // di-drop diam-diam oleh browser. Sekarang pakai color-mix() supaya
  // shadow berwarna benar-benar tampil, konsisten dengan teknik yang
  // sudah dipakai di tempat lain pada file yang sama.
  const iconShadow = `0 8px 24px color-mix(in srgb, ${color} 40%, transparent)`;
  const iconShadowHover = `0 12px 32px color-mix(in srgb, ${color} 60%, transparent)`;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="reveal hover-card"
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg, 24px)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        transitionDelay: delayMs,
        willChange: 'transform',
        minWidth: 0,
        height: '100%',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = `color-mix(in srgb, ${color} 40%, var(--color-border))`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-lg, 20px)',
          background: gradient || color,
          color: '#fff',
          boxShadow: iconShadow,
          flexShrink: 0,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = iconShadowHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = iconShadow;
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'var(--text-xl)',
          color: 'var(--color-foreground)',
          marginBottom: 10,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: 'var(--color-muted-fg)',
          fontSize: 'var(--text-sm)',
          lineHeight: 'var(--leading-snug)',
        }}
      >
        {desc}
      </p>
    </div>
  );
}

function Features() {
  const reducedMotion = usePrefersReducedMotion();
  const pointerCapable = usePointerCapable();
  return (
    <section id="features" style={{ padding: 'var(--space-3xl, 96px) 0', background: 'var(--color-background)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 var(--space-lg, 24px)' }}>
        <div className="reveal section-eyebrow-wrap">
          <Label>Fitur Unggulan</Label>
          <h2 className="section-heading">Semua yang UMKM Butuhkan</h2>
          <p className="section-sub">Dari pencatatan hingga analitik — satu platform, semua beres.</p>
        </div>

        <div className="card-row">
          {FEATURES.map((f, i) => (
            <FeatureCard
              key={f.title}
              {...f}
              delayMs={`${(i % 3) * 0.1}s`}
              reducedMotion={reducedMotion}
              pointerCapable={pointerCapable}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SECTION: BENEFITS
// ============================================================
const BENEFITS = [
  {
    title: 'Hemat 60% Waktu Operasional',
    desc: 'Otomatisasi tugas rutin — catat, lapor, notifikasi. Fokus ke hal yang penting.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    title: 'Keputusan Berbasis Data',
    desc: 'Insight real-time yang mudah dibaca. Bukan feeling, tapi angka nyata.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    title: 'Skala Tanpa Batas',
    desc: 'Mulai dari warung kecil hingga puluhan cabang. Sistem tumbuh bersama bisnis Anda.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: 'Support 24/7',
    desc: 'Tim ahli siap membantu via WhatsApp, chat, dan telepon setiap saat.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

function Benefits() {
  const reducedMotion = usePrefersReducedMotion();
  return (
    <section id="benefits" style={{ padding: 'var(--space-3xl, 96px) 0', background: 'var(--color-surface)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 var(--space-lg, 24px)' }}>
        <div className="benefits-grid">
          <div style={{ minWidth: 0 }}>
            <div className="reveal">
              <Label>Mengapa UMKMPro?</Label>
              <h2 className="section-heading">
                Dirancang untuk <span className="heading-highlight">Bisnis Anda</span>
              </h2>
              <p style={{ color: 'var(--color-muted-fg)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-xl, 32px)' }}>
                Kami memahami tantangan UMKM Indonesia. Setiap fitur dibangun berdasarkan
                kebutuhan nyata pelaku usaha — bukan asumsi.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg, 20px)' }}>
              {BENEFITS.map((b, i) => (
                <div
                  key={b.title}
                  className="reveal"
                  style={{
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start',
                    transitionDelay: `${i * 0.1}s`,
                    padding: 'var(--space-sm, 12px)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'background 0.3s ease, transform 0.3s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-muted)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '';
                    e.currentTarget.style.transform = '';
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      marginTop: 2,
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-sm)',
                      background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-primary)',
                    }}
                  >
                    {b.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-foreground)', marginBottom: 4, fontSize: 'var(--text-lg)' }}>
                      {b.title}
                    </h4>
                    <p style={{ color: 'var(--color-muted-fg)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-snug)' }}>
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="reveal glass-card"
            style={{
              transitionDelay: '0.15s',
              borderRadius: 'var(--radius-lg)',
              padding: 0,
              overflow: 'hidden',
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: 'var(--space-md, 16px) var(--space-lg, 24px)',
                background: 'var(--color-background)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-destructive, #EF4444)', display: 'inline-block' }} />
              <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }} />
              <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }} />
              <span style={{ marginLeft: 12, fontSize: 'var(--text-xs)', color: 'var(--color-muted-fg)', fontFamily: 'var(--font-display)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                umkmpro.id/dashboard
              </span>
            </div>

            <div style={{ padding: 'var(--space-lg, 20px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-foreground)' }}>
                  Ringkasan Bulan Ini
                </span>
                <span className="badge" style={{ fontSize: 'var(--text-2xs)' }}>
                  Agustus 2026
                </span>
              </div>

              {[
                { label: 'Total Pendapatan', val: 'Rp 28.450.000', color: 'var(--color-success)', pct: 85 },
                { label: 'Pengeluaran', val: 'Rp 12.200.000', color: 'var(--color-destructive, #EF4444)', pct: 45 },
                { label: 'Laba Bersih', val: 'Rp 16.250.000', color: 'var(--color-primary)', pct: 62 },
                { label: 'Pelanggan Baru', val: '47 orang', color: 'var(--color-accent)', pct: 55 },
                { label: 'Produk Terjual', val: '312 unit', color: '#3B82F6', pct: 70 },
              ].map((row, idx) => (
                <div key={row.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 4, gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--color-muted-fg)' }}>{row.label}</span>
                    <span style={{ fontWeight: 600, color: row.color }}>{row.val}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--color-background)', borderRadius: 'var(--radius-md, 99px)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${row.pct}%`,
                        background: row.color,
                        borderRadius: 'var(--radius-md, 99px)',
                        transformOrigin: 'left',
                        animation: reducedMotion ? 'none' : `barGrow 1s ease ${0.2 + idx * 0.1}s both`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .benefits-grid { display: grid; grid-template-columns: 1fr; gap: 48px; align-items: center; }
        @media (min-width: 1024px) { .benefits-grid { grid-template-columns: 1fr 1fr; gap: 80px; } }
      `}</style>
    </section>
  );
}

// ============================================================
// SECTION: PRICING
// Perbaikan (temuan High #5): paket Enterprise sekarang punya jalur
// konversi berbeda dari Starter/Pro — "Hubungi Sales" (mailto),
// bukan form trial generik yang sama seperti paket gratis. Prospek
// skala besar biasanya butuh percakapan, bukan self-serve signup.
// ============================================================
const PLANS = [
  {
    name: 'Starter',
    tag: null,
    price: 'Rp0',
    sub: 'Uji Coba 14 Hari',
    color: 'var(--color-muted-fg)',
    isPrimary: false,
    features: ['1 pengguna', '50 transaksi', 'Laporan dasar', 'Support email'],
    cta: 'Mulai Uji Coba',
    ctaVariant: 'secondary',
    href: '#cta',
    footnote: 'Tanpa kartu kredit. Otomatis berakhir, tidak ditagih.',
  },
  {
    name: 'Pro',
    tag: 'Paling Populer',
    price: 'Rp149rb',
    sub: '/bulan',
    color: 'var(--color-primary)',
    isPrimary: true,
    features: ['5 pengguna', 'Transaksi tak terbatas', 'Laporan & analitik lanjutan', 'Integrasi marketplace', 'Support prioritas 24/7'],
    cta: 'Pilih Paket Pro',
    ctaVariant: 'primary',
    href: '#cta',
    footnote: null,
  },
  {
    name: 'Enterprise',
    tag: null,
    price: 'Rp499rb',
    sub: '/bulan',
    color: 'var(--color-accent)',
    isPrimary: false,
    features: ['Pengguna tak terbatas', 'Semua fitur Pro', 'Akses API penuh', 'Manajer akun khusus', 'Integrasi custom'],
    cta: 'Hubungi Sales',
    ctaVariant: 'secondary',
    href: 'mailto:sales@umkmpro.id?subject=Tanya%20Paket%20Enterprise%20UMKMPro',
    footnote: 'Butuh integrasi custom? Tim sales kami siap bantu diskusi kebutuhan Anda.',
  },
];

function Pricing() {
  return (
    <section id="pricing" style={{ padding: 'var(--space-3xl, 96px) 0', background: 'var(--color-background)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 var(--space-lg, 24px)' }}>
        <div className="reveal section-eyebrow-wrap">
          <Label>Harga Transparan</Label>
          <h2 className="section-heading">Mulai dari Uji Coba Gratis</h2>
          <p className="section-sub">Tidak ada biaya tersembunyi. Upgrade atau downgrade kapan saja.</p>
        </div>

        <div className="card-row" style={{ alignItems: 'stretch' }}>
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className={`reveal hover-card ${plan.isPrimary ? 'hover-card--primary' : ''}`}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--color-card)',
                border: `${plan.isPrimary ? '2px' : '1px'} solid ${plan.isPrimary ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-lg, 24px)',
                paddingTop: plan.tag ? 'calc(var(--space-lg, 24px) + var(--space-sm))' : 'var(--space-lg, 24px)',
                boxShadow: plan.isPrimary ? 'var(--shadow-glow-strong), var(--shadow-lg)' : 'var(--shadow-sm)',
                transitionDelay: `${i * 0.1}s`,
                outline: 'none',
                minWidth: 0,
              }}
            >
              {plan.tag && (
                <span
                  className="badge"
                  style={{
                    position: 'absolute',
                    top: -14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 'var(--text-2xs)',
                    padding: 'var(--space-xs) var(--space-sm)',
                    whiteSpace: 'nowrap',
                    background: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    borderColor: 'var(--color-primary)',
                  }}
                >
                  {plan.tag}
                </span>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)', color: plan.color, marginBottom: 6 }}>
                  {plan.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-3xl)', color: 'var(--color-foreground)' }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted-fg)' }}>{plan.sub}</span>
                </div>
              </div>

              <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 20 }} />

              <ul style={{ flex: 1, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, margin: '0 0 20px', padding: 0 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 'var(--text-sm)', color: 'var(--color-muted-fg)' }}>
                    <svg style={{ flexShrink: 0, marginTop: 2 }} width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <circle cx="7" cy="7" r="6" stroke="var(--color-primary)" strokeWidth="1.5" />
                      <path d="M4 7l2 2 4-4" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Btn href={plan.href} variant={plan.ctaVariant} size="md" block>
                {plan.cta}
              </Btn>

              {plan.footnote && (
                <p style={{ marginTop: 12, fontSize: 'var(--text-2xs)', color: 'var(--color-muted-fg)', textAlign: 'center' }}>
                  {plan.footnote}
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="reveal" style={{ textAlign: 'center', color: 'var(--color-muted-fg)', fontSize: 'var(--text-sm)', marginTop: 32 }}>
          Semua paket termasuk SSL gratis, backup harian, dan garansi uptime 99.9%.
        </p>
      </div>
    </section>
  );
}

// ============================================================
// SECTION: TESTIMONIALS
// ============================================================
const TESTIMONIALS = [
  {
    initial: 'A',
    name: 'Ani Susanti',
    role: 'Pemilik Warung Nasi',
    stars: 5,
    quote: 'UMKMPro mengubah cara saya mengelola warung. Semua tercatat rapi dan saya bisa lihat keuntungan secara real-time. Omzet naik 35% dalam 2 bulan.',
    color: 'var(--color-primary)',
  },
  {
    initial: 'B',
    name: 'Budi Santoso',
    role: 'Pemilik Toko Kelontong',
    stars: 4,
    quote: 'Notifikasi stok menipis sangat membantu. Tidak ada lagi pelanggan kecewa karena barang habis. Fitur laporannya masih bisa lebih detail lagi ke depannya.',
    color: 'var(--color-accent)',
  },
  {
    initial: 'C',
    name: 'Citra Dewi',
    role: 'Pemilik Butik Fashion',
    stars: 5,
    quote: 'Fitur CRM-nya luar biasa. Saya bisa kirim promo ke pelanggan lama dan mereka balik lagi. Omzet naik 40% hanya dalam 3 bulan.',
    color: 'var(--color-accent)',
  },
];

function Testimonials() {
  return (
    <section id="testimonials" style={{ padding: 'var(--space-3xl, 96px) 0', background: 'var(--color-surface)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 var(--space-lg, 24px)' }}>
        <div className="reveal section-eyebrow-wrap">
          <Label>Testimoni</Label>
          <h2 className="section-heading">Dipercaya 5.000+ UMKM</h2>
          <p className="section-sub">Bergabung dengan ribuan pelaku usaha yang sudah merasakan manfaatnya.</p>
        </div>

        <div className="card-row">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className="reveal hover-card"
              style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-lg, 24px)',
                display: 'flex',
                flexDirection: 'column',
                transitionDelay: `${i * 0.1}s`,
                outline: 'none',
                position: 'relative',
                overflow: 'hidden',
                minWidth: 0,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: -20,
                  right: 10,
                  fontSize: 80,
                  color: 'var(--color-border)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  lineHeight: 1,
                  opacity: 0.6,
                  pointerEvents: 'none',
                }}
              >
                "
              </div>

              <div style={{ display: 'flex', gap: 3, marginBottom: 16, position: 'relative', zIndex: 1 }} aria-label={`Rating ${t.stars} dari 5 bintang`}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <StarIcon key={j} filled={j < t.stars} size={16} />
                ))}
              </div>

              <blockquote style={{ color: 'var(--color-foreground)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', flex: 1, marginBottom: 20, position: 'relative', zIndex: 1, margin: '0 0 20px' }}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1, minWidth: 0 }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: t.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-on-primary)',
                    flexShrink: 0,
                    // FIX (bug kritis #4): color-mix() menggantikan `${t.color}40`
                    // yang sebelumnya menghasilkan CSS tidak valid.
                    boxShadow: `0 4px 12px color-mix(in srgb, ${t.color} 40%, transparent)`,
                  }}
                >
                  {t.initial}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-foreground)' }}>{t.name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-fg)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="reveal"
          style={{
            marginTop: 56,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '32px 24px',
            maxWidth: 700,
            margin: '56px auto 0',
            width: '100%',
            padding: '0 var(--space-lg, 24px)',
          }}
        >
          {[
            { val: '12K+', label: 'UMKM Bergabung' },
            { val: '94%', label: 'Kepuasan Pelanggan' },
            { val: '4.9', label: 'Rating App', dot: true },
          ].map(({ val, label, dot }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.5rem, 6vw, 2.25rem)', color: 'var(--color-foreground)', lineHeight: 1 }}>
                {val}
                {dot && <span style={{ fontSize: '0.6em', marginLeft: '4px', color: 'var(--color-primary)' }}>●</span>}
              </div>
              <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: 'var(--color-muted-fg)', marginTop: 8, fontWeight: 500 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* BARU: disclaimer testimoni — sama seperti mockup dashboard,
            angka & kutipan di section ini bersifat ilustratif sampai
            diganti data pelanggan nyata sebelum rilis produksi. */}
        <p
          className="reveal"
          style={{
            textAlign: 'center',
            fontSize: 'var(--text-2xs)',
            color: 'var(--color-text-subtle)',
            marginTop: 24,
            fontStyle: 'italic',
          }}
        >
          *Testimoni & statistik di atas adalah contoh ilustratif, akan digantikan data pelanggan riil sebelum peluncuran.
        </p>
      </div>
    </section>
  );
}

// ============================================================
// SECTION: CTA
// Perbaikan (Medium #10): sebelumnya hanya ada validasi client-side +
// setTimeout palsu, tanpa pola penanganan kegagalan network/server.
// Sekarang submit dibungkus try/catch di sekitar pemanggilan API
// (disimulasikan lewat submitTrialSignup) dan ada state 'network-error'
// terpisah dari 'error' validasi, lengkap dengan tombol "Coba Lagi" —
// pola ini siap dipasangkan ke endpoint sungguhan tanpa restrukturisasi.
// ============================================================
function submitTrialSignup(email) {
  // Placeholder untuk pemanggilan API sungguhan, mis:
  // return fetch('/api/trial-signup', { method: 'POST', body: JSON.stringify({ email }) })
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ok: true }), FORM_SUBMISSION_DELAY);
  });
}

function CtaSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | error | loading | success | network-error
  const reducedMotion = usePrefersReducedMotion();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const handleBlur = () => {
    if (!email.trim()) return;
    setStatus((s) => (s === 'network-error' ? s : emailRegex.test(email) ? 'idle' : 'error'));
  };

  const submit = async () => {
    setStatus('loading');
    try {
      const res = await submitTrialSignup(email);
      if (!res.ok) throw new Error('signup-failed');
      setStatus('success');
    } catch (err) {
      setStatus('network-error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (status === 'loading') return;
    if (!email.trim() || !emailRegex.test(email)) {
      setStatus('error');
      return;
    }
    submit();
  };

  return (
    <section
      id="cta"
      style={{
        padding: 'var(--space-3xl, 96px) 0 var(--space-2xl, 80px)',
        background: 'var(--color-background)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 30%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 60%)',
        }}
      />

      <div
        className="reveal glass-card cta-box"
        style={{
          position: 'relative',
          maxWidth: 720,
          margin: '0 auto',
          textAlign: 'center',
          borderRadius: 'var(--radius-xl)',
          borderColor: 'var(--color-border)',
        }}
      >
        <Label>Mulai Sekarang</Label>
        <h2 className="section-heading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span>Coba UMKMPro</span>
          <span style={{ fontSize: 'clamp(1.5rem, 6vw, 2.5rem)', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>
            Gratis 14 Hari
          </span>
        </h2>
        <p style={{ color: 'var(--color-muted-fg)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-xl, 32px)' }}>
          Tanpa kartu kredit. Batalkan kapan saja. Aktifkan dasbor Anda dalam 2 menit.
        </p>

        {status === 'success' ? (
          <div
            role="status"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--color-success-bg)',
              border: '1px solid var(--color-success-border)',
              color: 'var(--color-success)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-md, 16px) var(--space-xl, 32px)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              animation: reducedMotion ? 'none' : 'scaleIn 0.5s ease',
              maxWidth: '100%',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Terima kasih! Cek email Anda untuk mengaktifkan akun.
          </div>
        ) : status === 'network-error' ? (
          <div
            role="alert"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              background: 'color-mix(in srgb, var(--color-destructive, #EF4444) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-destructive, #EF4444) 40%, transparent)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-lg, 24px)',
              maxWidth: 480,
              margin: '0 auto',
            }}
          >
            <p style={{ color: 'var(--color-destructive, #EF4444)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
              Gagal mendaftar. Server tidak merespons — bukan kesalahan Anda.
            </p>
            <Btn type="button" variant="secondary" size="sm" onClick={submit}>Coba Lagi</Btn>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="cta-form">
            <div style={{ flex: 1, textAlign: 'left', minWidth: 0, width: '100%' }}>
              <label htmlFor="cta-email" style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 'var(--text-sm)', color: 'var(--color-foreground)' }}>
                Alamat Email
              </label>
              <input
                id="cta-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nama@usaha-anda.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                onBlur={handleBlur}
                aria-invalid={status === 'error'}
                aria-describedby="cta-email-hint"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: 'var(--space-md, 14px) var(--space-lg, 18px)',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${status === 'error' ? 'var(--color-destructive, #EF4444)' : 'var(--color-border)'}`,
                  background: 'var(--color-card)',
                  color: 'var(--color-foreground)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-body)',
                  minHeight: 48,
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 4px color-mix(in srgb, var(--color-primary) 15%, transparent)';
                }}
              />
              <p id="cta-email-hint" style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-muted-fg)', marginTop: 4 }}>
                Kami akan kirim link aktivasi ke email ini
              </p>
            </div>
            <Btn type="submit" variant="primary" size="md" disabled={status === 'loading'} block className="cta-submit-btn">
              {status === 'loading' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: reducedMotion ? 'none' : 'spin 0.8s linear infinite' }} />
                  Memproses…
                </span>
              ) : (
                'Coba Gratis'
              )}
            </Btn>
          </form>
        )}

        {status === 'error' && (
          <p id="cta-email-error" role="alert" style={{ color: 'var(--color-destructive, #EF4444)', fontSize: 'var(--text-sm)', marginTop: 10 }}>
            Masukkan alamat email yang valid (contoh: nama@domain.com).
          </p>
        )}

        {status !== 'success' && status !== 'network-error' && (
          <p style={{ color: 'var(--color-muted-fg)', fontSize: 'var(--text-xs)', marginTop: 20 }}>
            Dengan mendaftar, Anda menyetujui{' '}
            <a href="#" style={{ color: 'var(--color-muted-fg)', textDecoration: 'underline', transition: 'color 0.3s ease' }}
               onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
               onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted-fg)')}>
              Syarat &amp; Ketentuan
            </a>{' '}
            dan{' '}
            <a href="#" style={{ color: 'var(--color-muted-fg)', textDecoration: 'underline', transition: 'color 0.3s ease' }}
               onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
               onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted-fg)')}>
              Kebijakan Privasi
            </a>{' '}
            kami.
          </p>
        )}
      </div>

      <style>{`
        .cta-box { padding: var(--space-xl, 32px) var(--space-lg, 20px); }
        @media (min-width: 640px) { .cta-box { padding: var(--space-2xl, 48px) var(--space-xl, 32px); } }
        .cta-form { display: flex; gap: 10px; max-width: 480px; margin: 0 auto; flex-direction: column; }
        @media (min-width: 480px) {
          .cta-form { flex-direction: row; align-items: flex-end; }
          .cta-form .cta-submit-btn.btn-block { width: auto; flex-shrink: 0; white-space: nowrap; }
        }
      `}</style>
    </section>
  );
}

// ============================================================
// PAGE: LandingPage
// Perbaikan (temuan kritis #1 & #2): Navbar dan Footer sekarang
// benar-benar dirender, bukan cuma tersedia sebagai token CSS yang
// tidak terpakai.
// ============================================================
export default function LandingPage() {
  const [activeSection, setActiveSection] = useState('hero');
  useScrollReveal();

  // Catatan perbaikan: di kode sebelumnya, `activeSection` dihitung
  // lewat IntersectionObserver tapi TIDAK PERNAH dipakai di mana pun
  // (state mati / dead code) karena tidak ada Navbar untuk
  // menampilkannya. Sekarang benar-benar dipakai untuk menyorot menu
  // aktif di Navbar saat pengguna scroll.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { threshold: 0.3 }
    );
    document.querySelectorAll('section[id]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <ComponentStyles />
      <a href="#main-content" className="skip-link">
        Lompat ke konten utama
      </a>
      <main id="main-content" tabIndex="-1" style={{ overflowX: 'hidden' }}>
        <Hero />
        <Features />
        <Benefits />
        <Pricing />
        <Testimonials />
        <CtaSection />
      </main>
    </>
  );
}