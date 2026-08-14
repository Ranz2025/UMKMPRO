// ────────────────────────────────────────────────────────────────────
// Shared UI Components — UMKMPro
// ALIGNED VERSION: dipadankan dengan design system landing page
// (Home.jsx). Semua warna sekarang lewat CSS custom property
// (--color-primary, --color-accent, --color-success, --color-warning,
// --color-destructive) alih-alih hex mentah, radius & spacing lewat
// var(--radius-*) / var(--space-*), heading pakai var(--font-display).
// BARU: <Btn> — dipindah dari landing page supaya dashboard & landing
// pakai satu komponen tombol yang sama persis (bentuk pill, hover
// glow, style .btn-primary/.btn-secondary/.btn-ghost).
// ────────────────────────────────────────────────────────────────────
import { useRef, useState, useEffect } from 'react';

// ── Mouse-tracking hook (dipakai Btn untuk efek glow saat hover) ──────
function useMousePosition(ref) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const handler = (e) => {
      const rect = element.getBoundingClientRect();
      setPosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };
    element.addEventListener('mousemove', handler);
    return () => element.removeEventListener('mousemove', handler);
  }, [ref]);
  return position;
}

// ── Btn — identik dengan tombol di landing page ────────────────────────
// variant: 'primary' | 'secondary' | 'ghost'
// size: 'sm' | 'md' | 'lg'
export function Btn({
  href, variant = 'primary', size = 'md', children, onClick, icon,
  type = 'button', block = false, className = '', disabled = false,
  target, rel,
}) {
  const btnRef = useRef(null);
  const pos = useMousePosition(btnRef);
  const cls = `btn btn-${variant} btn-${size} ${block ? 'btn-block' : ''} ${className}`.trim();
  const style = variant !== 'ghost' ? { '--mouse-x': pos.x + '%', '--mouse-y': pos.y + '%' } : {};

  if (href) {
    return (
      <a ref={btnRef} href={disabled ? undefined : href} className={cls} aria-disabled={disabled}
         tabIndex={disabled ? -1 : undefined} style={style} target={target} rel={rel}>
        {icon && <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>}
        {children}
      </a>
    );
  }
  return (
    <button ref={btnRef} type={type} onClick={onClick} className={cls} disabled={disabled} style={style}>
      {icon && <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>}
      {children}
    </button>
  );
}

// ── Skeleton Loader ──────────────────────────────────────────────────
export function Skeleton({ width = '100%', height = 20, borderRadius, style = {} }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius: borderRadius ?? 'var(--radius-sm)',
        background: 'linear-gradient(90deg, var(--color-border) 25%, var(--color-card) 50%, var(--color-border) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonShimmer 1.4s ease-in-out infinite',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

// ── Card Skeleton ─────────────────────────────────────────────────────
export function SkeletonCard({ rows = 3 }) {
  return (
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg, 20px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton height={14} width="40%" />
      <Skeleton height={28} width="60%" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={12} width={i % 2 === 0 ? '80%' : '55%'} />
      ))}
    </div>
  );
}

// ── Table Skeleton ────────────────────────────────────────────────────
export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, padding: '12px var(--space-md, 16px)', borderBottom: '2px solid var(--color-border)' }}>
        {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} height={11} width="70%" />)}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, padding: '14px var(--space-md, 16px)', borderBottom: '1px solid var(--color-border)' }}>
          {Array.from({ length: cols }).map((_, c) => <Skeleton key={c} height={13} width={c === 0 ? '90%' : '60%'} />)}
        </div>
      ))}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = 'var(--color-primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"
         strokeLinecap="round" aria-hidden="true" style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }}>
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

// ── Error Banner ──────────────────────────────────────────────────────
export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div style={{
      background: 'color-mix(in srgb, var(--color-destructive, #EF4444) 8%, transparent)',
      border: '1px solid color-mix(in srgb, var(--color-destructive, #EF4444) 25%, transparent)',
      borderRadius: 'var(--radius-md)', padding: '12px var(--space-md, 16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <span style={{ color: 'var(--color-destructive, #EF4444)', fontSize: 'var(--text-sm, 14px)', fontWeight: 500 }}>⚠ {message}</span>
      {onRetry && (
        <Btn type="button" variant="ghost" size="sm" onClick={onRetry}
             className="error-retry-btn">
          Coba Lagi
        </Btn>
      )}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title = 'Belum ada data', description, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-2xl, 48px) var(--space-lg, 24px)', gap: 12, textAlign: 'center' }}>
      <span style={{ fontSize: 48, lineHeight: 1 }} role="img" aria-hidden="true">{icon}</span>
      <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg, 16px)', fontWeight: 700, color: 'var(--color-foreground)' }}>{title}</h3>
      {description && <p style={{ margin: 0, fontSize: 'var(--text-sm, 14px)', color: 'var(--color-muted-fg)', maxWidth: 320 }}>{description}</p>}
      {action}
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────
export function ConfirmModal({ open, title, description, confirmLabel = 'Hapus', destructive = true, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        className="glass-card"
        style={{ background: 'var(--color-card)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl, 28px)', maxWidth: 420, width: '90%', boxShadow: 'var(--shadow-lg, 0 25px 50px rgba(0,0,0,0.3))', animation: 'modalPop 0.18s ease-out' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-labelledby="confirm-title"
      >
        <h2 id="confirm-title" style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg, 18px)', fontWeight: 800, color: 'var(--color-foreground)' }}>{title}</h2>
        {description && <p style={{ margin: '0 0 24px', fontSize: 'var(--text-sm, 14px)', color: 'var(--color-muted-fg)', lineHeight: 1.6 }}>{description}</p>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn type="button" variant="secondary" size="sm" onClick={onCancel} disabled={loading}>Batal</Btn>
          <Btn
            type="button"
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className={destructive ? 'btn-destructive' : ''}
          >
            {loading && <Spinner size={14} color="var(--color-on-primary)" />}
            {confirmLabel}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────
export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;
  const { current_page, last_page, total, per_page } = meta;
  const from = (current_page - 1) * per_page + 1;
  const to = Math.min(current_page * per_page, total);

  const pages = [];
  const delta = 2;
  for (let i = 1; i <= last_page; i++) {
    if (i === 1 || i === last_page || (i >= current_page - delta && i <= current_page + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  const btnStyle = (active) => ({
    minWidth: 36, height: 36, borderRadius: 'var(--radius-sm)',
    border: active ? 'none' : '1px solid var(--color-border)',
    background: active ? 'var(--color-primary)' : 'var(--color-card)',
    color: active ? 'var(--color-on-primary)' : 'var(--color-foreground)',
    cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 500,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s ease', fontFamily: 'var(--font-body)',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '12px 0' }}>
      <span style={{ fontSize: 'var(--text-sm, 13px)', color: 'var(--color-muted-fg)' }}>
        Menampilkan {from}–{to} dari {total} data
      </span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button style={btnStyle(false)} onClick={() => onPageChange(current_page - 1)} disabled={current_page === 1} aria-label="Halaman sebelumnya">‹</button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--color-muted-fg)', fontSize: 13 }}>…</span>
          ) : (
            <button key={p} style={btnStyle(p === current_page)} onClick={() => onPageChange(p)}>{p}</button>
          )
        )}
        <button style={btnStyle(false)} onClick={() => onPageChange(current_page + 1)} disabled={current_page === last_page} aria-label="Halaman berikutnya">›</button>
      </div>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────
// tone: 'primary' | 'accent' | 'success' | 'warning' | 'destructive' | 'muted'
const TONE_VAR = {
  primary: 'var(--color-primary)',
  accent: 'var(--color-accent)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning, #FBBF24)',
  destructive: 'var(--color-destructive, #EF4444)',
  muted: 'var(--color-muted-fg)',
};

export function Badge({ children, tone = 'muted' }) {
  const color = TONE_VAR[tone] || tone;
  return (
    <span style={{
      padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      background: `color-mix(in srgb, ${color} 15%, transparent)`,
      color, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center',
      fontFamily: 'var(--font-body)',
    }}>
      {children}
    </span>
  );
}

// ── Keyframes + .btn class injection ───────────────────────────────────
// Kelas .btn / .btn-primary / .btn-secondary / .btn-ghost di sini SENGAJA
// dibuat identik dengan versi di landing page (Home.jsx) supaya tombol
// di dashboard dan tombol di landing terlihat sebagai satu produk yang
// sama, bukan dua sistem desain berbeda.
if (typeof document !== 'undefined') {
  const styleEl = document.getElementById('umkm-shared-ui-styles');
  if (!styleEl) {
    const s = document.createElement('style');
    s.id = 'umkm-shared-ui-styles';
    s.textContent = `
      @keyframes skeletonShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes modalPop { from { opacity: 0; transform: scale(0.94) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }

      .btn {
        display: inline-flex; align-items: center; justify-content: center;
        gap: 8px; border-radius: 9999px; cursor: pointer;
        font-weight: 600; text-decoration: none; white-space: nowrap;
        border: 1px solid transparent; box-sizing: border-box;
        font-family: var(--font-body);
        transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, filter 0.3s ease, background 0.3s ease, opacity 0.3s ease;
        position: relative; overflow: hidden; will-change: transform;
      }
      .btn::after {
        content: ''; position: absolute; inset: 0;
        background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.15), transparent 60%);
        opacity: 0; transition: opacity 0.4s ease; pointer-events: none;
      }
      .btn:hover::after { opacity: 1; }
      .btn:hover { transform: translateY(-2px) scale(1.02); }
      .btn:active { transform: translateY(0) scale(0.98); }
      .btn:disabled, .btn[aria-disabled="true"] { opacity: 0.6; cursor: not-allowed; transform: none; filter: none; }

      .btn-sm { padding: 8px 18px; font-size: var(--text-sm, 0.875rem); min-height: 38px; }
      .btn-md { padding: 11px 24px; font-size: var(--text-sm, 0.875rem); min-height: 44px; }
      .btn-lg { padding: 13px 32px; font-size: var(--text-base, 1rem); min-height: 48px; }

      .btn-primary {
        background: linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 85%, white) 0%, var(--color-primary) 55%, color-mix(in srgb, var(--color-primary) 80%, black) 100%);
        color: var(--color-on-primary);
        box-shadow: 0 10px 22px color-mix(in srgb, var(--color-primary) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.25);
      }
      .btn-primary:hover, .btn-primary:focus-visible {
        filter: brightness(1.08);
        box-shadow: 0 14px 32px color-mix(in srgb, var(--color-primary) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.25);
      }
      .btn-primary.btn-destructive {
        background: linear-gradient(180deg, color-mix(in srgb, var(--color-destructive, #EF4444) 85%, white) 0%, var(--color-destructive, #EF4444) 55%, color-mix(in srgb, var(--color-destructive, #EF4444) 80%, black) 100%);
        box-shadow: 0 10px 22px color-mix(in srgb, var(--color-destructive, #EF4444) 30%, transparent);
      }

      .btn-secondary {
        background: var(--color-card);
        border-color: var(--color-border);
        color: var(--color-foreground);
        box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
      }
      .btn-secondary:hover, .btn-secondary:focus-visible {
        border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
        background: var(--color-muted);
      }

      .btn-ghost { background: transparent; border-color: var(--color-border); color: var(--color-muted-fg); box-shadow: none; }
      .btn-ghost:hover, .btn-ghost:focus-visible { color: var(--color-foreground); border-color: var(--color-foreground); background: color-mix(in srgb, var(--color-foreground) 5%, transparent); }

      .btn-block { width: 100%; }
      .error-retry-btn.btn-ghost { border-color: color-mix(in srgb, var(--color-destructive, #EF4444) 40%, transparent); color: var(--color-destructive, #EF4444); }
    `;
    document.head.appendChild(s);
  }
}