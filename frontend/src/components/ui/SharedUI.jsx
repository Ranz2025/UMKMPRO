// ────────────────────────────────────────────────────────────────────
// Shared UI Components — UMKMPro
// UI/UX Pro Max: skeleton loader, confirm modal, pagination, empty state
// ────────────────────────────────────────────────────────────────────

// ── Skeleton Loader ──────────────────────────────────────────────────
export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style = {} }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--color-border, #e2e8f0) 25%, var(--color-card, #f8fafc) 50%, var(--color-border, #e2e8f0) 75%)',
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
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
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
      {/* header */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, padding: '12px 16px', borderBottom: '2px solid var(--color-border)' }}>
        {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} height={11} width="70%" />)}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          {Array.from({ length: cols }).map((_, c) => <Skeleton key={c} height={13} width={c === 0 ? '90%' : '60%'} />)}
        </div>
      ))}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = 'var(--color-primary, #16a34a)' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
      style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }}
    >
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

// ── Error Banner ──────────────────────────────────────────────────────
export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ color: '#ef4444', fontSize: 14, fontWeight: 500 }}>⚠ {message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, padding: '4px 12px', fontSize: 13, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title = 'Belum ada data', description, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 12, textAlign: 'center' }}>
      <span style={{ fontSize: 48, lineHeight: 1 }} role="img" aria-hidden="true">{icon}</span>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-foreground)' }}>{title}</h3>
      {description && <p style={{ margin: 0, fontSize: 14, color: 'var(--color-muted-fg)', maxWidth: 320 }}>{description}</p>}
      {action}
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────
export function ConfirmModal({ open, title, description, confirmLabel = 'Hapus', confirmColor = '#ef4444', onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 32, maxWidth: 420, width: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', animation: 'modalPop 0.18s ease-out' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <h2 id="confirm-title" style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: 'var(--color-foreground)' }}>{title}</h2>
        {description && <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--color-muted-fg)', lineHeight: 1.6 }}>{description}</p>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', color: 'var(--color-foreground)', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{ background: confirmColor, border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}
          >
            {loading && <Spinner size={14} color="#fff" />}
            {confirmLabel}
          </button>
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
    minWidth: 36,
    height: 36,
    borderRadius: 8,
    border: active ? 'none' : '1px solid var(--color-border)',
    background: active ? 'var(--color-primary)' : 'var(--color-card)',
    color: active ? '#fff' : 'var(--color-foreground)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '12px 0' }}>
      <span style={{ fontSize: 13, color: 'var(--color-muted-fg)' }}>
        Menampilkan {from}–{to} dari {total} data
      </span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          style={btnStyle(false)}
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
          aria-label="Halaman sebelumnya"
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--color-muted-fg)', fontSize: 13 }}>…</span>
          ) : (
            <button key={p} style={btnStyle(p === current_page)} onClick={() => onPageChange(p)}>
              {p}
            </button>
          )
        )}
        <button
          style={btnStyle(false)}
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
          aria-label="Halaman berikutnya"
        >
          ›
        </button>
      </div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────
export function Badge({ children, color = '#6b7280', bg }) {
  const bgColor = bg || `${color}18`;
  return (
    <span style={{ padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: bgColor, color, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
      {children}
    </span>
  );
}

// ── Keyframes injection ───────────────────────────────────────────────
if (typeof document !== 'undefined') {
  const styleEl = document.getElementById('umkm-shared-ui-styles');
  if (!styleEl) {
    const s = document.createElement('style');
    s.id = 'umkm-shared-ui-styles';
    s.textContent = `
      @keyframes skeletonShimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes modalPop {
        from { opacity: 0; transform: scale(0.94) translateY(8px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
    `;
    document.head.appendChild(s);
  }
}
