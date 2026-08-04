import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthButton } from '../components/AuthLayout';

// ============================================================
// OnboardingPage  (FE-04)
// 3 langkah: Nama Bisnis → Pilih Plan → Selamat Datang
// TODO: hubungkan ke API setelah backend tersedia
// ============================================================

const PLANS = [
  {
    id: 'free',
    name: 'Gratis',
    price: 'Rp 0',
    period: '/bulan',
    badge: null,
    color: 'var(--color-border)',
    features: ['1 pengguna', '100 produk', 'Laporan dasar', 'Support komunitas'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'Rp 99.000',
    period: '/bulan',
    badge: 'Populer',
    color: 'var(--color-primary)',
    features: ['5 pengguna', 'Produk tak terbatas', 'Laporan lengkap', 'Support prioritas', 'Multi-cabang'],
  },
];

const BUSINESS_TYPES = [
  { id: 'retail', label: 'Retail / Toko', icon: 'store' },
  { id: 'food', label: 'Kuliner / F&B', icon: 'coffee' },
  { id: 'service', label: 'Jasa / Servis', icon: 'wrench' },
  { id: 'online', label: 'Online Shop', icon: 'cart' },
  { id: 'wholesale', label: 'Grosir', icon: 'box' },
  { id: 'other', label: 'Lainnya', icon: 'briefcase' },
];

function BusinessTypeIcon({ name, color = 'currentColor', size = 22 }) {
  const s = { width: size, height: size, flexShrink: 0 };
  const props = { fill: 'none', stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', ...s, viewBox: '0 0 24 24', 'aria-hidden': 'true' };
  switch (name) {
    case 'store': return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case 'coffee': return <svg {...props}><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
    case 'wrench': return <svg {...props}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
    case 'cart': return <svg {...props}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
    case 'box': return <svg {...props}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
    case 'briefcase': return <svg {...props}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
    default: return <svg {...props}><circle cx="12" cy="12" r="4"/></svg>;
  }
}

// ── Step indicator ────────────────────────────────────────────
function StepIndicator({ current, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: active ? 32 : 24,
              height: 24,
              borderRadius: 99,
              background: done
                ? 'var(--color-primary)'
                : active
                  ? 'var(--color-primary)'
                  : 'var(--color-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              flexShrink: 0,
            }}>
              {done ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-on-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 700, color: active ? 'var(--color-on-primary)' : 'var(--color-muted-fg)' }}>
                  {i + 1}
                </span>
              )}
            </div>
            {i < total - 1 && (
              <div style={{
                width: 32,
                height: 2,
                borderRadius: 99,
                background: done ? 'var(--color-primary)' : 'var(--color-border)',
                transition: 'background 0.3s ease',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Nama & Jenis Bisnis ───────────────────────────────
function Step1({ data, onChange, onNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.businessName.trim()) e.businessName = 'Nama bisnis wajib diisi.';
    else if (data.businessName.trim().length < 2) e.businessName = 'Nama bisnis minimal 2 karakter.';
    if (!data.businessType) e.businessType = 'Pilih jenis bisnis Anda.';
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onNext();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{
          fontFamily: 'var(--font-display, inherit)',
          fontSize: 'clamp(1.4rem, 2.8vw, 1.8rem)',
          fontWeight: 800,
          color: 'var(--color-foreground)',
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>
          Ceritakan tentang bisnis Anda
        </h2>
        <p style={{ fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-muted-fg)', lineHeight: 1.6 }}>
          Informasi ini membantu kami menyesuaikan pengalaman untuk bisnis Anda.
        </p>
      </div>

      {/* Nama Bisnis */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="businessName" style={{ fontSize: 'var(--text-sm, 0.875rem)', fontWeight: 600, color: 'var(--color-foreground)' }}>
          Nama Bisnis
        </label>
        <input
          id="businessName"
          type="text"
          placeholder="contoh: Toko Maju Jaya"
          value={data.businessName}
          onChange={(e) => { onChange('businessName', e.target.value); if (errors.businessName) setErrors(p => ({ ...p, businessName: '' })); }}
          aria-invalid={!!errors.businessName}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '14px 16px',
            fontSize: 'var(--text-sm, 0.875rem)',
            color: 'var(--color-foreground)',
            background: 'var(--color-card)',
            border: `1.5px solid ${errors.businessName ? 'var(--color-destructive)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md, 10px)',
            outline: 'none',
            minHeight: 50,
            transition: 'border-color 200ms ease',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 4px color-mix(in srgb, var(--color-primary) 12%, transparent)'; }}
          onBlur={e => { e.target.style.borderColor = errors.businessName ? 'var(--color-destructive)' : 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
        />
        {errors.businessName && (
          <p role="alert" style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-destructive)', display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            {errors.businessName}
          </p>
        )}
      </div>

      {/* Jenis Bisnis */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 'var(--text-sm, 0.875rem)', fontWeight: 600, color: 'var(--color-foreground)' }}>
          Jenis Bisnis
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {BUSINESS_TYPES.map(({ id, label, icon }) => {
            const selected = data.businessType === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => { onChange('businessType', id); if (errors.businessType) setErrors(p => ({ ...p, businessType: '' })); }}
                style={{
                  padding: '12px 8px',
                  borderRadius: 'var(--radius-md, 10px)',
                  border: `1.5px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: selected ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)' : 'var(--color-card)',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s ease',
                  transform: selected ? 'scale(1.03)' : 'scale(1)',
                }}
              >
                <div style={{
                  padding: 8,
                  borderRadius: 8,
                  background: selected ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)' : 'var(--color-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <BusinessTypeIcon name={icon} color={selected ? 'var(--color-primary)' : 'var(--color-foreground)'} />
                </div>
                <span style={{ fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, color: selected ? 'var(--color-primary)' : 'var(--color-foreground)', lineHeight: 1.3 }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
        {errors.businessType && (
          <p role="alert" style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-destructive)', display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            {errors.businessType}
          </p>
        )}
      </div>

      <AuthButton type="button" variant="primary" onClick={handleNext}>
        Lanjut
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </AuthButton>
    </div>
  );
}


// ── Step 2: Pilih Plan ────────────────────────────────────────
function Step2({ data, onChange, onNext, onBack }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{
          fontFamily: 'var(--font-display, inherit)',
          fontSize: 'clamp(1.4rem, 2.8vw, 1.8rem)',
          fontWeight: 800,
          color: 'var(--color-foreground)',
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>
          Pilih paket yang sesuai
        </h2>
        <p style={{ fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-muted-fg)', lineHeight: 1.6 }}>
          Mulai gratis, upgrade kapan saja. Tidak perlu kartu kredit.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {PLANS.map((plan) => {
          const selected = data.plan === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onChange('plan', plan.id)}
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-md, 12px)',
                border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: selected ? 'color-mix(in srgb, var(--color-primary) 8%, var(--color-card))' : 'var(--color-card)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              {plan.badge && (
                <span style={{
                  position: 'absolute', top: -10, right: 16,
                  background: 'var(--color-primary)', color: 'var(--color-on-primary)',
                  fontSize: 11, fontWeight: 700, padding: '2px 10px',
                  borderRadius: 99, letterSpacing: '0.05em',
                }}>
                  {plan.badge}
                </span>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Radio indicator */}
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: selected ? 'var(--color-primary)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s ease', flexShrink: 0,
                    }}>
                      {selected && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-on-primary)' }} />}
                    </div>
                    <span style={{ fontFamily: 'var(--font-display, inherit)', fontSize: '1rem', fontWeight: 800, color: 'var(--color-foreground)' }}>
                      {plan.name}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--font-display, inherit)', fontSize: '1.2rem', fontWeight: 800, color: selected ? 'var(--color-primary)' : 'var(--color-foreground)' }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-muted-fg)' }}>
                    {plan.period}
                  </span>
                </div>
              </div>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-muted-fg)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={selected ? 'var(--color-primary)' : 'var(--color-muted-fg)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            flex: '0 0 auto',
            padding: '14px 20px',
            borderRadius: 99,
            border: '1.5px solid var(--color-border)',
            background: 'var(--color-card)',
            color: 'var(--color-foreground)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 'var(--text-sm, 0.875rem)',
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-foreground)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Kembali
        </button>
        <div style={{ flex: 1 }}>
          <AuthButton type="button" variant="primary" onClick={onNext}>
            Mulai Sekarang
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </AuthButton>
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Selamat Datang ────────────────────────────────────
function Step3({ data, onFinish, loading }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 28 }}>
      {/* Ilustrasi sukses */}
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 0 20px color-mix(in srgb, var(--color-primary) 5%, transparent)',
        animation: 'successPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>

      <div>
        <h2 style={{
          fontFamily: 'var(--font-display, inherit)',
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          fontWeight: 800,
          color: 'var(--color-foreground)',
          letterSpacing: '-0.02em',
          marginBottom: 12,
        }}>
          Selamat datang di UMKMPro!
        </h2>
        <p style={{ fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-muted-fg)', lineHeight: 1.7, maxWidth: 360 }}>
          Bisnis <strong style={{ color: 'var(--color-foreground)' }}>"{data.businessName}"</strong> sudah siap.
          Paket <strong style={{ color: 'var(--color-primary)' }}>
            {PLANS.find(p => p.id === data.plan)?.name}
          </strong> aktif.
        </p>
      </div>

      {/* Quick start checklist */}
      <div style={{
        width: '100%',
        padding: '20px',
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md, 12px)',
        textAlign: 'left',
      }}>
        <p style={{ fontSize: 'var(--text-sm, 0.875rem)', fontWeight: 700, color: 'var(--color-foreground)', marginBottom: 14 }}>
          Langkah berikutnya:
        </p>
        {[
          'Tambah produk pertama Anda',
          'Catat transaksi penjualan',
          'Undang anggota tim',
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 2 ? 10 : 0 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-primary)' }}>{i + 1}</span>
            </div>
            <span style={{ fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-muted-fg)' }}>{item}</span>
          </div>
        ))}
      </div>

      <AuthButton type="button" variant="primary" onClick={onFinish} disabled={loading}>
        {loading ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ animation: 'auth-spin 0.8s linear infinite' }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            Mempersiapkan dasbor...
          </>
        ) : (
          <>
            Buka Dasbor
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </>
        )}
      </AuthButton>

      <style>{`
        @keyframes successPop {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes auth-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}


// ── Komponen utama ────────────────────────────────────────────
export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    businessName: '',
    businessType: '',
    plan: 'free',
  });

  const onChange = (field, value) => setData(p => ({ ...p, [field]: value }));

  const handleFinish = async () => {
    setLoading(true);
    try {
      // TODO: POST /api/v1/onboarding { business_name, business_type, plan }
      await new Promise(r => setTimeout(r, 900));
      navigate('/dashboard', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ['Bisnis', 'Plan', 'Selamat Datang'];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      fontFamily: 'var(--font-body, system-ui, sans-serif)',
    }}>
      {/* Logo */}
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 14V8l6-5 6 5v6H11v-4H7v4H3z" fill="var(--color-on-primary)"/>
          </svg>
        </div>
        <span style={{ fontFamily: 'var(--font-display, inherit)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-foreground)', letterSpacing: '-0.02em' }}>
          UMKMPro
        </span>
      </a>

      {/* Card container */}
      <div style={{
        width: '100%',
        maxWidth: 520,
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg, 16px)',
        padding: 'clamp(24px, 5vw, 40px)',
        boxShadow: 'var(--shadow-xl)',
        animation: 'fadeSlideUp 0.5s ease both',
      }}>
        <StepIndicator current={step} total={STEPS.length} />

        {step === 0 && <Step1 data={data} onChange={onChange} onNext={() => setStep(1)} />}
        {step === 1 && <Step2 data={data} onChange={onChange} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
        {step === 2 && <Step3 data={data} onFinish={handleFinish} loading={loading} />}
      </div>

      <p style={{ marginTop: 24, fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-muted-fg)' }}>
        Langkah {step + 1} dari {STEPS.length} — {STEPS[step]}
      </p>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
