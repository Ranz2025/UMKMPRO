import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout, { AuthButton, AuthFormField } from '../components/AuthLayout';

// ============================================================
// ForgotPasswordPage  (FE-01)
//
// Flow:
//   1. User masukkan email → submit
//   2. Simulasi POST /api/v1/auth/forgot-password
//   3. Tampilkan halaman sukses "cek email Anda"
//
// TODO: ganti simulasi dengan axios call ke backend
// ============================================================

function validateEmail(email) {
  if (!email.trim()) return 'Email wajib diisi.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Format email tidak valid.';
  return '';
}

// ── Layar konfirmasi ─────────────────────────────────────────
function SuccessScreen({ email, onResend, resending }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 24,
        animation: 'fadeSlideUp 0.6s ease both',
      }}
    >
      {/* Ikon amplop */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 0 12px color-mix(in srgb, var(--color-primary) 6%, transparent)',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      </div>

      <div>
        <h2
          style={{
            fontFamily: 'var(--font-display, inherit)',
            fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
            fontWeight: 800,
            color: 'var(--color-foreground)',
            letterSpacing: '-0.02em',
            marginBottom: 10,
          }}
        >
          Cek email Anda
        </h2>
        <p
          style={{
            fontSize: 'var(--text-sm, 0.875rem)',
            color: 'var(--color-muted-fg)',
            lineHeight: 1.7,
            maxWidth: 360,
          }}
        >
          Kami telah mengirimkan link reset password ke{' '}
          <strong style={{ color: 'var(--color-foreground)', wordBreak: 'break-all' }}>
            {email}
          </strong>
          . Link berlaku selama <strong style={{ color: 'var(--color-foreground)' }}>60 menit</strong>.
        </p>
      </div>

      {/* Tips */}
      <div
        style={{
          width: '100%',
          padding: '14px 18px',
          background: 'color-mix(in srgb, var(--color-primary) 6%, transparent)',
          border: '1px solid color-mix(in srgb, var(--color-primary) 18%, transparent)',
          borderRadius: 'var(--radius-md, 10px)',
          fontSize: 'var(--text-xs, 0.75rem)',
          color: 'var(--color-muted-fg)',
          lineHeight: 1.6,
          textAlign: 'left',
        }}
      >
        <p style={{ fontWeight: 700, color: 'var(--color-foreground)', marginBottom: 6 }}>
          Tidak menerima email?
        </p>
        <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <li>Periksa folder <em>Spam</em> atau <em>Promosi</em></li>
          <li>Pastikan alamat email yang dimasukkan sudah benar</li>
          <li>Tunggu beberapa menit, kadang ada sedikit keterlambatan</li>
        </ul>
      </div>

      {/* Tombol kirim ulang */}
      <AuthButton
        type="button"
        variant="secondary"
        onClick={onResend}
        disabled={resending}
      >
        {resending ? (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
              style={{ animation: 'auth-spin 0.8s linear infinite' }}
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Mengirim ulang...
          </>
        ) : (
          <>
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
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
            </svg>
            Kirim ulang email
          </>
        )}
      </AuthButton>

      <Link
        to="/login"
        style={{
          fontSize: 'var(--text-sm, 0.875rem)',
          color: 'var(--color-primary)',
          fontWeight: 700,
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
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
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Kembali ke halaman masuk
      </Link>
    </div>
  );
}

// ── Komponen utama ────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const [email, setEmail]           = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading]       = useState(false);
  const [resending, setResending]   = useState(false);
  const [serverError, setServerError] = useState('');
  const [submitted, setSubmitted]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      document.getElementById('forgot-email')?.focus();
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      // TODO: ganti dengan axios call ke backend
      // await axios.post('/api/v1/auth/forgot-password', { email });
      await new Promise((r) => setTimeout(r, 900));
      setSubmitted(true);
    } catch (err) {
      setServerError(
        err?.response?.data?.message ?? 'Gagal mengirim email. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      // TODO: ganti dengan axios call ke backend
      await new Promise((r) => setTimeout(r, 800));
    } finally {
      setResending(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        title=""
        subtitle=""
      >
        <SuccessScreen
          email={email}
          onResend={handleResend}
          resending={resending}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Lupa password?"
      subtitle="Masukkan email terdaftar Anda. Kami akan mengirimkan link untuk membuat password baru."
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        {serverError && (
          <div
            role="alert"
            style={{
              padding: '12px 16px',
              background: 'color-mix(in srgb, var(--color-destructive, #EF4444) 8%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-destructive, #EF4444) 25%, transparent)',
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: 'var(--text-sm, 0.875rem)',
              color: 'var(--color-destructive, #EF4444)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              style={{ flexShrink: 0, marginTop: 1 }}
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {serverError}
          </div>
        )}

        <AuthFormField
          id="forgot-email"
          label="Alamat email"
          type="email"
          placeholder="nama@bisnis.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError('');
            if (serverError) setServerError('');
          }}
          error={emailError}
          autoComplete="email"
        />

        <AuthButton type="submit" variant="primary" disabled={loading}>
          {loading ? (
            <>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
                style={{ animation: 'auth-spin 0.8s linear infinite' }}
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Mengirim...
            </>
          ) : (
            <>
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
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Kirim Link Reset
            </>
          )}
        </AuthButton>

        <Link
          to="/login"
          style={{
            textAlign: 'center',
            fontSize: 'var(--text-sm, 0.875rem)',
            color: 'var(--color-primary)',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginTop: 4,
          }}
        >
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
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Kembali ke halaman masuk
        </Link>
      </form>
    </AuthLayout>
  );
}
