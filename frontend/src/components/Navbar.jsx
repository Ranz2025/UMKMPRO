import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const NAV_LINKS = [
  { href: '#features', label: 'Fitur' },
  { href: '#benefits', label: 'Manfaat' },
  { href: '#pricing', label: 'Harga' },
  { href: '#testimonials', label: 'Testimoni' },
];

// Placeholder handler untuk link yang belum siap
function handlePlaceholderClick(e) {
  e.preventDefault();
  alert('Halaman ini sedang dalam pengembangan.');
}

function NavbarStyles() {
  return (
    <style>{`
      .nav-links-desktop, .nav-cta-desktop { display: none; }
      .hamburger-btn { display: flex; }
      @media (min-width: 768px) {
        .nav-links-desktop { display: flex !important; }
        .nav-cta-desktop { display: flex !important; }
        .hamburger-btn { display: none !important; }
      }
      .nav-link {
        display: block; padding: 8px 14px; border-radius: 8px;
        text-decoration: none; font-size: 14px; font-weight: 500;
        font-family: var(--font-body, inherit);
        color: var(--color-muted-fg);
        background: transparent;
        transition: color 0.15s ease, background 0.15s ease;
        min-height: 44px; /* WCAG */
      }
      .nav-link:hover, .nav-link:focus-visible {
        color: var(--color-primary);
        background: var(--color-muted);
      }
      .nav-cta-btn {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 9px 22px; border-radius: 9999px;
        background: var(--color-primary);
        color: var(--color-on-accent, #1A1200);
        font-size: 14px; font-weight: 600; text-decoration: none;
        font-family: var(--font-body, inherit);
        min-height: 44px;
        box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary) 35%, transparent);
        transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
      }
      .nav-cta-btn:hover, .nav-cta-btn:focus-visible {
        transform: translateY(-1px);
        filter: brightness(1.08);
        box-shadow: 0 6px 18px color-mix(in srgb, var(--color-primary) 45%, transparent);
      }
      .mobile-drawer { width: min(320px, 86vw); }
    `}</style>
  );
}

function ThemeToggleBtn() {
  const { theme, toggleTheme } = useTheme();
  const [hover, setHover] = useState(false);
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      title={isDark ? 'Mode Terang' : 'Mode Gelap'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 44, height: 44,
        borderRadius: 10,
        border: '1px solid var(--color-border)',
        background: hover ? 'var(--color-muted)' : 'transparent',
        color: 'var(--color-muted-fg)',
        cursor: 'pointer',
        transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
        flexShrink: 0,
      }}
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}

function LogoIcon() {
  return (
    <div style={{
      width: 34, height: 34, borderRadius: 10,
      background: 'var(--color-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M3 14V8l6-5 6 5v6H11v-4H7v4H3z" fill="var(--color-background)"/>
      </svg>
    </div>
  );
}

export default function Navbar({ activeSection = 'hero' }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const fn = (e) => {
      if (e.key === 'Escape') { setOpen(false); hamburgerRef.current?.focus(); }
    };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const main = document.getElementById('main-content');
    if (main) {
      if (open) main.setAttribute('inert', ''); else main.removeAttribute('inert');
    }
    return () => {
      document.body.style.overflow = '';
      if (main) main.removeAttribute('inert');
    };
  }, [open]);

  const close = () => setOpen(false);

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0,
    zIndex: 'var(--z-nav, 900)',
    padding: scrolled ? '10px 0' : '18px 0',
    background: scrolled ? 'var(--nav-bg-scrolled)' : 'transparent',
    backdropFilter: scrolled ? 'blur(16px)' : 'none',
    borderBottom: scrolled ? '1px solid var(--nav-border-scrolled)' : '1px solid transparent',
    transition: 'all 0.25s ease',
  };

  const containerStyle = {
    maxWidth: 1200, margin: '0 auto',
    padding: '0 clamp(16px, 4vw, 24px)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 16,
  };

  return (
    <>
      <NavbarStyles />
      <nav style={navStyle} aria-label="Navigasi utama">
        <div style={containerStyle}>
          <a
            href="#hero"
            aria-label="UMKMPro - Kembali ke atas halaman"
            style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}
          >
            <LogoIcon />
            <span style={{ fontFamily: 'var(--font-display, inherit)', fontWeight: 700, fontSize: 20, color: 'var(--color-foreground)' }}>
              UMKMPro
            </span>
          </a>

          <ul className="nav-links-desktop" style={{ alignItems: 'center', gap: 4, listStyle: 'none', margin: 0, padding: 0 }}>
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = activeSection === href.slice(1);
              return (
                <li key={href}>
                  <a 
                    href={href} 
                    onClick={close} 
                    className="nav-link"
                    style={{
                      color: isActive ? 'var(--color-primary)' : 'var(--color-muted-fg)',
                      fontWeight: isActive ? 600 : 500,
                      display: 'block',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontFamily: 'var(--font-body, inherit)',
                      background: isActive ? 'var(--color-muted)' : 'transparent',
                      transition: 'color 0.15s ease, background 0.15s ease',
                      minHeight: 44,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="nav-cta-desktop" style={{ alignItems: 'center', gap: 10 }}>
            <ThemeToggleBtn />
            <Link
              to="/login"
              style={{ fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-body, inherit)', textDecoration: 'none', color: 'var(--color-muted-fg)', padding: '6px 10px', borderRadius: 6, minHeight: 44, display: 'inline-flex', alignItems: 'center', transition: 'color 150ms ease' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-foreground)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted-fg)'; }}
            >
              Masuk
            </Link>
            <Link to="/register" className="nav-cta-btn">Daftar Gratis</Link>
          </div>

          <HamburgerBtn open={open} setOpen={setOpen} btnRef={hamburgerRef} />
        </div>
      </nav>

      <div
        aria-hidden="true"
        onClick={close}
        style={{
          position: 'fixed', inset: 0, zIndex: 'var(--z-overlay, 899)',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      <MobileDrawer menuRef={menuRef} open={open} close={close} />
    </>
  );
}

function HamburgerBtn({ open, setOpen, btnRef }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      ref={btnRef}
      className="hamburger-btn"
      onClick={() => setOpen(v => !v)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={open ? 'Tutup menu' : 'Buka menu'}
      aria-expanded={open}
      aria-controls="mobile-menu"
      style={{
        flexDirection: 'column', gap: 5,
        padding: '10px', borderRadius: 8, border: 'none',
        background: hover ? 'var(--color-muted)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.15s',
        minWidth: 44, minHeight: 44,
      }}
    >
      <span style={{
        display: 'block', width: 20, height: 2,
        background: 'var(--color-foreground)', borderRadius: 2,
        transform: open ? 'rotate(45deg) translate(5px, 5px)' : 'none',
        transition: 'transform 0.2s',
      }} />
      <span style={{
        display: 'block', width: 20, height: 2,
        background: 'var(--color-foreground)', borderRadius: 2,
        opacity: open ? 0 : 1,
        transition: 'opacity 0.2s',
      }} />
      <span style={{
        display: 'block', width: 20, height: 2,
        background: 'var(--color-foreground)', borderRadius: 2,
        transform: open ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
        transition: 'transform 0.2s',
      }} />
    </button>
  );
}

function MobileDrawer({ menuRef, open, close }) {
  return (
    <div
      id="mobile-menu"
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu mobile"
      className="mobile-drawer"
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        zIndex: 'var(--z-drawer, 950)',
        background: 'var(--color-card)',
        borderLeft: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoIcon />
          <span style={{ fontFamily: 'var(--font-display, inherit)', fontWeight: 700, fontSize: 18, color: 'var(--color-foreground)' }}>UMKMPro</span>
        </div>
        <CloseBtn onClick={close} />
      </div>

      <ul style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: 16, listStyle: 'none', overflowY: 'auto', margin: 0 }}>
        {NAV_LINKS.map(({ href, label }) => (
          <MobileNavItem key={href} href={href} label={label} close={close} />
        ))}
      </ul>

      <div style={{ padding: 16, borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: 10,
          border: '1px solid var(--color-border)',
          background: 'var(--color-muted)',
        }}>
          <span style={{ fontSize: 13, color: 'var(--color-muted-fg)', fontWeight: 500, fontFamily: 'var(--font-body, inherit)' }}>
            Tampilan
          </span>
          <ThemeToggleBtn />
        </div>
        {/* Login & Register */}
        <Link
          to="/login"
          onClick={close}
          style={{
            display: 'block', textAlign: 'center',
            padding: '11px 0', borderRadius: 10,
            border: '1px solid var(--color-border)',
            fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-body, inherit)', color: 'var(--color-muted-fg)',
            textDecoration: 'none',
            minHeight: 44,
          }}
        >
          Masuk
        </Link>
        <Link to="/register" onClick={close} className="nav-cta-btn" style={{ justifyContent: 'center', padding: '11px 0', minHeight: 44, textDecoration: 'none' }}>
          Daftar Gratis
        </Link>
      </div>
    </div>
  );
}

function CloseBtn({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label="Tutup menu"
      style={{
        padding: 12,
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border)',
        background: hover ? 'var(--color-muted)' : 'var(--color-card)',
        cursor: 'pointer',
        transition: 'background 0.15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 44, minHeight: 44,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--color-muted-fg)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M4 4l10 10M14 4L4 14"/>
      </svg>
    </button>
  );
}

function MobileNavItem({ href, label, close }) {
  const [hover, setHover] = useState(false);
  return (
    <li>
      <a
        href={href}
        onClick={close}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: 'flex', alignItems: 'center',
          padding: '12px 16px', borderRadius: 10,
          fontSize: 15, fontWeight: 500, fontFamily: 'var(--font-body, inherit)',
          color: hover ? 'var(--color-primary)' : 'var(--color-muted-fg)',
          background: hover ? 'var(--color-muted)' : 'transparent',
          textDecoration: 'none',
          transition: 'color 0.15s, background 0.15s',
          minHeight: 44,
        }}
      >
        {label}
      </a>
    </li>
  );
}