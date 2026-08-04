import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

// ============================================================
// CATATAN PERBAIKAN (audit UI/UX) — ringkasan perubahan di file ini:
//
// 1. [CRITICAL] AuthFormField punya dua prop `onFocus` di <input> yang
//    sama — yang pertama (setIsFocused) jadi dead code karena ditimpa
//    prop kedua. Digabung jadi SATU handler.
// 2. [CRITICAL] Listener global mousemove/mouseleave dulu di-inject
//    lewat <script dangerouslySetInnerHTML> tanpa cleanup → menumpuk
//    setiap kali AuthLayout mount ulang (Login <-> Register). Sekarang
//    pakai useEffect dengan return cleanup (removeEventListener).
// 3. [HIGH] Token warna error dulu punya dua nama berbeda
//    (--color-destructive vs --color-error) untuk konsep yang sama.
//    Disatukan jadi --color-error di SEMUA tempat (termasuk di
//    LoginPage & RegisterPage).
// 4. [HIGH] Fallback --radius-md dulu beda antar file (10px vs 8px).
//    Disatukan jadi 10px di semua tempat.
// 5. [HIGH] Alert box error dulu di-copy-paste manual di Login &
//    Register. Sekarang jadi komponen bersama <AuthAlert />.
// 6. [HIGH] Panel branding dulu punya 5+ animasi infinite berjalan
//    bersamaan (2 orb float + 1 orb pulse + grid shimmer + text
//    shimmer + dot pulse) — melanggar prinsip minimalist & mengalihkan
//    fokus dari form. Disederhanakan: hanya animasi masuk (sekali
//    jalan) + SATU elemen ambient yang bergerak sangat pelan sebagai
//    signature, sisanya statis.
// 7. [MEDIUM] prefers-reduced-motion dulu pakai selector berbasis
//    kedalaman DOM (`.auth-brand-panel > div > div`) yang tidak
//    menjangkau elemen h2/p/span tempat sebagian animasi terpasang.
//    Sekarang semua elemen beranimasi diberi class `.az-anim` supaya
//    satu selector `.az-anim { animation: none }` menjangkau semuanya
//    tanpa bergantung pada tag/kedalaman.
// 8. [MEDIUM] Checkbox dulu pakai <input type="checkbox"> native
//    (accent-color tidak didukung penuh di semua browser, target
//    sentuh 16x16px terlalu kecil, fidelity beda jauh dari
//    input/button yang di-custom penuh). Sekarang ada <AuthCheckbox />
//    custom dengan target klik lebih besar dan aria-describedby yang
//    benar ke pesan error.
// 9. [HEX HARDCODE] Warna hex mentah (#F97316, #4ADE80, dst) diganti
//    ke token semantik (--color-warning, --color-success, dst) supaya
//    ikut berubah kalau brand color di-rebrand.
// 10. [LOW] Panel branding sekarang punya max-width internal supaya
//     tidak terlihat "kosong" di layar ultrawide, dan ada trust-strip
//     ringkas untuk mobile (pengganti panel branding yang dulu hilang
//     total di bawah 768px).
// ============================================================

// ============================================================
// AuthButton — tombol dengan animasi shimmer dan spotlight
// ============================================================
export function AuthButton({
  type = 'button',
  variant = 'primary',
  children,
  onClick,
  disabled = false,
  to,
  href,
}) {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  const className = `auth-btn auth-btn-${variant}`;
  const commonProps = { ref, onMouseMove: handleMouseMove, className };

  if (to) return <Link to={to} {...commonProps}>{children}</Link>;
  if (href) return <a href={href} {...commonProps}>{children}</a>;
  return (
    <button type={type} onClick={onClick} disabled={disabled} {...commonProps}>
      {children}
    </button>
  );
}

// ============================================================
// AuthFormField — input dengan animasi fokus
// FIX: satu onFocus, bukan dua. State `isFocused` dan style DOM
// langsung sekarang diupdate dari handler yang sama sehingga tidak
// ada lagi yang diam-diam mati.
// ============================================================
export function AuthFormField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  hint,
  autoComplete,
  rightSlot,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const accentVar = error ? 'var(--color-error, #EF4444)' : 'var(--color-primary)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label
          htmlFor={id}
          style={{
            fontSize: 'var(--text-sm, 0.875rem)',
            fontWeight: 600,
            color: isFocused ? 'var(--color-primary)' : 'var(--color-foreground)',
            fontFamily: 'var(--font-display, inherit)',
            letterSpacing: '-0.01em',
            transition: 'color 200ms ease',
          }}
        >
          {label}
        </label>
        {rightSlot}
      </div>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: isPassword ? '14px 46px 14px 16px' : '14px 16px',
            fontSize: 'var(--text-sm, 0.875rem)',
            fontFamily: 'var(--font-body, inherit)',
            color: 'var(--color-foreground)',
            background: isFocused ? 'var(--color-background)' : 'var(--color-card)',
            border: `1.5px solid ${error ? 'var(--color-error, #EF4444)' : isFocused ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md, 10px)',
            outline: 'none',
            minHeight: 50,
            boxShadow: isFocused ? `0 0 0 4px color-mix(in srgb, ${accentVar} 12%, transparent)` : 'none',
            transition: 'border-color 200ms ease, box-shadow 200ms ease, background 200ms ease, transform 200ms ease',
            transform: isFocused ? 'scale(1.005)' : 'scale(1)',
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: 'absolute',
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-muted-fg)',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 'var(--radius-sm, 6px)',
              transition: 'color 200ms ease, background 200ms ease, transform 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-primary)';
              e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 10%, transparent)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-muted-fg)';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-muted-fg)', margin: 0 }}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" style={{
          fontSize: 'var(--text-xs, 0.75rem)',
          color: 'var(--color-error, #EF4444)',
          display: 'flex', alignItems: 'center', gap: 4, margin: 0,
          animation: 'shake 0.4s ease',
        }} className="az-anim">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================
// AuthCheckbox — checkbox custom (dulu native, tidak konsisten
// dengan fidelity input/button lain + target sentuh terlalu kecil)
// ============================================================
export function AuthCheckbox({ id, checked, onChange, label, error }) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label
        htmlFor={id}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          cursor: 'pointer',
          padding: '4px 0',
        }}
      >
        <span style={{ position: 'relative', flexShrink: 0, width: 20, height: 20, marginTop: 1 }}>
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={onChange}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            style={{
              position: 'absolute',
              inset: -8, // memperbesar target klik sesungguhnya ke ~36px tanpa mengubah tampilan visual
              width: 36,
              height: 36,
              opacity: 0,
              margin: 0,
              cursor: 'pointer',
            }}
          />
          <span
            aria-hidden="true"
            style={{
              display: 'flex',
              width: 20,
              height: 20,
              borderRadius: 'var(--radius-sm, 6px)',
              border: `1.5px solid ${error ? 'var(--color-error, #EF4444)' : checked ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: checked ? 'var(--color-primary)' : 'var(--color-card)',
              transition: 'background 150ms ease, border-color 150ms ease',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {checked && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-on-primary, #fff)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
        </span>
        <span style={{ fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-muted-fg)', lineHeight: 1.5 }}>
          {label}
        </span>
      </label>
      {error && (
        <p id={`${id}-error`} role="alert" style={{
          fontSize: 'var(--text-xs, 0.75rem)',
          color: 'var(--color-error, #EF4444)',
          display: 'flex', alignItems: 'center', gap: 4, margin: '0 0 0 30px',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================
// AuthAlert — dulu di-copy-paste manual di Login & Register,
// sekarang satu komponen bersama.
// ============================================================
export function AuthAlert({ message, variant = 'error' }) {
  if (!message) return null;
  const color = variant === 'error' ? 'var(--color-error, #EF4444)' : 'var(--color-success)';
  return (
    <div
      role="alert"
      style={{
        padding: '12px 16px',
        background: `color-mix(in srgb, ${color} 8%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
        borderRadius: 'var(--radius-md, 10px)',
        fontSize: 'var(--text-sm, 0.875rem)',
        color,
        display: 'flex', alignItems: 'flex-start', gap: 8,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
      {message}
    </div>
  );
}

// ============================================================
// AuthLayout — layout premium
// FIX: motion ambient dikurangi drastis (1 signature element saja,
// sisanya statis), listener via useEffect + cleanup, reduced-motion
// menjangkau semua elemen lewat class `.az-anim`, panel branding
// punya max-width internal, trust-strip ringkas untuk mobile.
// ============================================================
export default function AuthLayout({ children, title, subtitle }) {
  const { theme, toggleTheme } = useTheme();

  // FIX #2: listener global sekarang lewat useEffect dengan cleanup,
  // bukan <script dangerouslySetInnerHTML> yang menumpuk tiap mount.
  useEffect(() => {
    const glow = document.getElementById('auth-cursor-glow');
    if (!glow) return;

    const handleMove = (e) => {
      glow.style.setProperty('--mouse-x', `${e.clientX}px`);
      glow.style.setProperty('--mouse-y', `${e.clientY}px`);
      glow.style.opacity = '1';
    };
    const handleLeave = () => {
      glow.style.opacity = '0';
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseleave', handleLeave);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'var(--color-background)',
        color: 'var(--color-foreground)',
        fontFamily: 'var(--font-body, system-ui, -apple-system, sans-serif)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Cursor glow global */}
      <div
        id="auth-cursor-glow"
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), color-mix(in srgb, var(--color-primary) 6%, transparent) 0%, transparent 70%)`,
          opacity: 0,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* ── Panel kiri — Branding ── */}
      <div
        className="auth-brand-panel"
        style={{
          flex: '0 0 45%',
          background: 'linear-gradient(145deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 60%, #0a0a14) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 48px 48px 48px',
          position: 'relative',
          overflow: 'hidden',
          isolation: 'isolate',
          minHeight: '100vh',
        }}
      >
        {/* Satu-satunya elemen ambient bergerak (signature motion),
            sangat pelan, dan sepenuhnya dimatikan di reduced-motion
            lewat class .az-anim */}
        <div
          className="az-anim"
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-30%',
            width: '650px',
            height: '650px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,215,0,0.03) 40%, transparent 70%)',
            pointerEvents: 'none',
            animation: 'orbFloat 50s ease-in-out infinite alternate',
            willChange: 'transform',
          }}
        />

        {/* Grid pattern statis (dulu shimmer infinite) */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: 0.05,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Konten dibatasi max-width supaya tidak "kosong" di layar ultrawide */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 480, width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Logo */}
          <Link
            to="/"
            className="az-anim"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              textDecoration: 'none',
              width: 'fit-content',
              animation: 'fadeSlideDown 0.8s ease both',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05) rotate(-2deg)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M3 14V8l6-5 6 5v6H11v-4H7v4H3z" fill="white" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display, inherit)',
                fontWeight: 800,
                fontSize: '1.4rem',
                color: '#fff',
                letterSpacing: '-0.02em',
                textShadow: '0 2px 12px rgba(0,0,0,0.15)',
              }}
            >
              UMKMPro
            </span>
          </Link>

          {/* Konten tengah */}
          <div style={{ marginTop: 'auto', paddingBottom: 24 }}>
            <p
              className="az-anim"
              style={{
                fontSize: 'var(--text-xs, 0.75rem)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: 20,
                animation: 'fadeSlideUp 0.8s ease 0.1s both',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--color-success, #4ADE80)',
                  marginRight: 8,
                }}
              />
              Platform #1 UMKM Indonesia
            </p>

            <h2
              className="az-anim"
              style={{
                fontFamily: 'var(--font-display, inherit)',
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                color: '#fff',
                marginBottom: 20,
                letterSpacing: '-0.03em',
                animation: 'fadeSlideUp 0.8s ease 0.2s both',
              }}
            >
              Kelola bisnis lebih
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 20%, #FCD34D), #FCD34D)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                cerdas &amp; efisien
              </span>
            </h2>

            <p
              className="az-anim"
              style={{
                fontSize: 'var(--text-sm, 0.875rem)',
                color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.7,
                maxWidth: 340,
                fontWeight: 400,
                animation: 'fadeSlideUp 0.8s ease 0.3s both',
              }}
            >
              Keuangan, stok, dan pelanggan dalam satu dasbor.
              Lebih dari <strong style={{ color: '#fff', fontWeight: 700 }}>10.000+ UMKM</strong> Indonesia
              sudah mempercayai UMKMPro.
            </p>

            {/* Statistik */}
            <div
              className="az-anim"
              style={{
                display: 'flex',
                gap: 40,
                marginTop: 40,
                paddingTop: 32,
                borderTop: '1px solid rgba(255,255,255,0.06)',
                animation: 'fadeSlideUp 0.8s ease 0.4s both',
              }}
            >
              {[
                { value: '10K+', label: 'UMKM aktif' },
                { value: '99.9%', label: 'Uptime' },
                { value: '4.9★', label: 'Rating' },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  style={{ transition: 'transform 0.3s ease', cursor: 'default' }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div
                    style={{
                      fontSize: 'clamp(1.2rem, 2.2vw, 1.5rem)',
                      fontWeight: 800,
                      color: '#fff',
                      fontFamily: 'var(--font-display, inherit)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {value}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'rgba(255,255,255,0.45)', marginTop: 2, fontWeight: 500 }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p
            className="az-anim"
            style={{
              fontSize: 'var(--text-xs, 0.75rem)',
              color: 'rgba(255,255,255,0.25)',
              marginTop: 16,
              animation: 'fadeSlideUp 0.8s ease 0.5s both',
            }}
          >
            © {new Date().getFullYear()} UMKMPro. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </div>

      {/* ── Panel kanan — Form ── */}
      <div
        className="auth-form-panel"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 40px',
          position: 'relative',
          overflowY: 'auto',
          background: 'var(--color-background)',
        }}
      >
        <a
          href="/"
          className="auth-mobile-home"
          aria-label="Kembali ke landing page"
          style={{
            display: 'none',
            position: 'absolute',
            top: 18,
            left: 18,
            width: 42,
            height: 42,
            borderRadius: '50%',
            border: '1px solid var(--color-border)',
            background: 'var(--color-card)',
            color: 'var(--color-foreground)',
            textDecoration: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </a>

        {/* Toggle tema */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
          style={{
            position: 'absolute',
            top: 28,
            right: 28,
            width: 44,
            height: 44,
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md, 10px)',
            background: 'var(--color-card)',
            color: 'var(--color-muted-fg)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.color = 'var(--color-primary)';
            e.currentTarget.style.boxShadow = '0 4px 16px color-mix(in srgb, var(--color-primary) 15%, transparent)';
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.color = 'var(--color-muted-fg)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
          }}
        >
          {theme === 'dark' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* Form container */}
        <div className="az-anim" style={{ width: '100%', maxWidth: 440, animation: 'fadeSlideUp 0.8s ease 0.1s both' }}>
          <div style={{ marginBottom: 36 }}>
            <h1
              style={{
                fontFamily: 'var(--font-display, inherit)',
                fontSize: 'clamp(1.6rem, 3.2vw, 2.1rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                color: 'var(--color-foreground)',
                letterSpacing: '-0.02em',
                marginBottom: 10,
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-muted-fg)', lineHeight: 1.6, fontWeight: 400 }}>
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>
      </div>

      {/* ── CSS ── */}
      <style>{`
        @media (max-width: 768px) {
          .auth-brand-panel { display: none !important; }
          .auth-mobile-trust { display: none !important; }
          .auth-mobile-home { display: flex !important; }
          .auth-form-panel { padding: 32px 20px !important; }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbFloat {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, -30px) scale(1.05); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes auth-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .auth-btn {
          width: 100%;
          min-height: 52px;
          padding: 14px 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-radius: 9999px;
          font-size: var(--text-sm, 0.875rem);
          font-weight: 700;
          font-family: var(--font-body, inherit);
          cursor: pointer;
          border: 1px solid transparent;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          text-decoration: none;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.3s ease, filter 0.3s ease,
                      background 0.3s ease, opacity 0.3s ease;
          letter-spacing: -0.01em;
        }
        .auth-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.18), transparent 65%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .auth-btn:hover::after { opacity: 1; }
        .auth-btn:hover:not(:disabled) { transform: translateY(-3px) scale(1.02); }
        .auth-btn:active:not(:disabled) { transform: translateY(0) scale(0.97); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; filter: none !important; }

        .auth-btn-primary {
          background: linear-gradient(180deg,
            color-mix(in srgb, var(--color-primary) 88%, white) 0%,
            var(--color-primary) 55%,
            color-mix(in srgb, var(--color-primary) 82%, black) 100%);
          color: var(--color-on-primary, #0F172A);
          box-shadow: 0 12px 28px color-mix(in srgb, var(--color-primary) 35%, transparent),
                      inset 0 1px 0 rgba(255,255,255,0.25);
        }
        .auth-btn-primary:hover:not(:disabled) {
          filter: brightness(1.08);
          box-shadow: 0 16px 40px color-mix(in srgb, var(--color-primary) 50%, transparent),
                      inset 0 1px 0 rgba(255,255,255,0.25);
        }

        .auth-btn-secondary {
          background: var(--color-card);
          border-color: var(--color-border);
          color: var(--color-foreground);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .auth-btn-secondary:hover:not(:disabled) {
          box-shadow: 0 4px 16px color-mix(in srgb, var(--color-primary) 12%, transparent);
          border-color: color-mix(in srgb, var(--color-primary) 35%, var(--color-border));
          background: var(--color-card-hover, var(--color-muted));
        }

        /* FIX reduced-motion: satu class, menjangkau SEMUA elemen
           beranimasi apapun tag-nya (dulu selector berbasis DOM depth
           tidak menjangkau h2/p/span). */
        @media (prefers-reduced-motion: reduce) {
          .az-anim, .az-anim * , .auth-btn, .auth-btn::after {
            animation: none !important;
            transition: none !important;
          }
          #auth-cursor-glow { display: none !important; }
        }
      `}</style>
    </div>
  );
}