import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout, { AuthButton } from '../components/AuthLayout';

// ============================================================
// EmailVerificationPage  (FE-03)
//
// Mendukung dua URL:
//
//   A) /email/verify?status=pending&email=<email>
//      → User baru selesai register, belum verifikasi
//      → Tampilkan layar "Cek email Anda" + tombol kirim ulang
//
//   B) /email/verify?id=<id>&hash=<hash>&expires=<ts>&signature=<sig>
//      → User klik link dari email
//      → Langsung proses verifikasi otomatis
//      → Sukses → redirect /dashboard (atau /onboarding) setelah 3 detik
//      → Gagal  → tampilkan layar gagal
//
// TODO: ganti simulasi dengan axios call ke backend
//   GET  /api/v1/auth/email/verify/{id}/{hash}?expires=...&signature=...
//   POST /api/v1/auth/email/resend
// ============================================================

const REDIRECT_DELAY = 3; // detik

// ── Spinner sederhana ─────────────────────────────────────────
function Spinner() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-primary)"
      strokeWidth="2.5"
      aria-hidden="true"
      style={{ animation: 'auth-spin 0.8s linear infinite' }}
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ── Layar: sedang memproses verifikasi ───────────────────────
function ProcessingScreen() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 20,
        animation: 'fadeSlideUp 0.6s ease both',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 0 12px color-mix(in srgb, var(--color-primary) 5%, transparent)',
        }}
      >
        <Spinner />
      </div>
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-display, inherit)',
            fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
            fontWeight: 800,
            color: 'var(--color-foreground)',
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}
        >
          Memverifikasi email...
        </h2>
        <p
          style={{
            fontSize: 'var(--text-sm, 0.875rem)',
            color: 'var(--color-muted-fg)',
            lineHeight: 1.6,
          }}
        >
          Mohon tunggu, kami sedang memproses verifikasi akun Anda.
        </p>
      </div>
    </div>
  );
}

// ── Layar: verifikasi sukses ──────────────────────────────────
function SuccessScreen({ countdown }) {
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
      {/* Ikon sukses */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'color-mix(in srgb, #22C55E 12%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 0 16px color-mix(in srgb, #22C55E 5%, transparent)',
          animation: 'successPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#22C55E"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
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
          Email berhasil diverifikasi!
        </h2>
        <p
          style={{
            fontSize: 'var(--text-sm, 0.875rem)',
            color: 'var(--color-muted-fg)',
            lineHeight: 1.7,
            maxWidth: 360,
          }}
        >
          Akun Anda sudah aktif. Anda akan diarahkan ke dasbor dalam{' '}
          <strong style={{ color: 'var(--color-primary)' }}>
            {countdown} detik
          </strong>
          .
        </p>
      </div>

      {/* Progress bar countdown */}
      <div
        style={{
          width: '100%',
          height: 4,
          background: 'var(--color-border)',
          borderRadius: 9999,
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <div
          style={{
            height: '100%',
            width: `${(countdown / REDIRECT_DELAY) * 100}%`,
            background: '#22C55E',
            borderRadius: 9999,
            transition: 'width 1s linear',
          }}
        />
      </div>

      <AuthButton variant="primary" to="/dashboard">
        Buka Dasbor
      </AuthButton>

      <style>{`
        @keyframes successPop {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Layar: verifikasi gagal ───────────────────────────────────
function FailureScreen({ onRetry, loading }) {
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
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'color-mix(in srgb, #EF4444 12%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 0 12px color-mix(in srgb, #EF4444 5%, transparent)',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#EF4444"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
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
          Verifikasi gagal
        </h2>
        <p
          style={{
            fontSize: 'var(--text-sm, 0.875rem)',
            color: 'var(--color-muted-fg)',
            lineHeight: 1.7,
            maxWidth: 360,
          }}
        >
          Link verifikasi sudah <strong style={{ color: 'var(--color-foreground)' }}>kadaluarsa</strong> atau{' '}
          <strong style={{ color: 'var(--color-foreground)' }}>tidak valid</strong>.
          Minta link verifikasi baru di bawah ini.
        </p>
      </div>

      <AuthButton
        type="button"
        variant="primary"
        onClick={onRetry}
        disabled={loading}
      >
        {loading ? (
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
            Mengirim...
          </>
        ) : (
          'Kirim ulang link verifikasi'
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

// ── Layar: tunggu verifikasi (belum klik link) ────────────────
function PendingScreen({ email, onResend, resendStatus }) {
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
      {/* Ikon amplop bergerak */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 0 16px color-mix(in srgb, var(--color-primary) 5%, transparent)',
          animation: 'envelopePulse 2s ease-in-out infinite',
        }}
      >
        <svg
          width="36"
          height="36"
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
          Verifikasi email Anda
        </h2>
        <p
          style={{
            fontSize: 'var(--text-sm, 0.875rem)',
            color: 'var(--color-muted-fg)',
            lineHeight: 1.7,
            maxWidth: 380,
          }}
        >
          Kami telah mengirimkan email konfirmasi ke{' '}
          <strong style={{ color: 'var(--color-foreground)', wordBreak: 'break-all' }}>
            {email || 'alamat email Anda'}
          </strong>
          . Klik link di dalam email untuk mengaktifkan akun.
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
          Belum menerima email?
        </p>
        <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <li>Periksa folder <em>Spam</em> atau <em>Promosi</em></li>
          <li>Pastikan alamat email yang didaftarkan sudah benar</li>
          <li>Tunggu 1–2 menit, kadang ada sedikit keterlambatan</li>
        </ul>
      </div>

      {/* Feedback kirim ulang */}
      {resendStatus === 'sent' && (
        <div
          role="status"
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'color-mix(in srgb, #22C55E 10%, transparent)',
            border: '1px solid color-mix(in srgb, #22C55E 25%, transparent)',
            borderRadius: 'var(--radius-md, 8px)',
            fontSize: 'var(--text-sm, 0.875rem)',
            color: '#22C55E',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Email verifikasi baru sudah dikirim!
        </div>
      )}

      {resendStatus === 'error' && (
        <div
          role="alert"
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'color-mix(in srgb, #EF4444 8%, transparent)',
            border: '1px solid color-mix(in srgb, #EF4444 25%, transparent)',
            borderRadius: 'var(--radius-md, 8px)',
            fontSize: 'var(--text-sm, 0.875rem)',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          Gagal mengirim ulang. Silakan coba lagi.
        </div>
      )}

      {/* Tombol kirim ulang */}
      <AuthButton
        type="button"
        variant="secondary"
        onClick={onResend}
        disabled={resendStatus === 'loading' || resendStatus === 'sent'}
      >
        {resendStatus === 'loading' ? (
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
        ) : resendStatus === 'sent' ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Email terkirim
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
            Kirim ulang email verifikasi
          </>
        )}
      </AuthButton>

      <p
        style={{
          fontSize: 'var(--text-sm, 0.875rem)',
          color: 'var(--color-muted-fg)',
        }}
      >
        Sudah akun aktif?{' '}
        <Link
          to="/login"
          style={{ color: 'var(--color-primary)', fontWeight: 700 }}
        >
          Masuk di sini
        </Link>
      </p>

      <style>{`
        @keyframes envelopePulse {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.05) translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

// ── Komponen utama ────────────────────────────────────────────
export default function EmailVerificationPage() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();

  // Deteksi mode: apakah ada id+hash (klik dari email) atau hanya status=pending
  const id        = searchParams.get('id')        ?? '';
  const hash      = searchParams.get('hash')      ?? '';
  const expires   = searchParams.get('expires')   ?? '';
  const signature = searchParams.get('signature') ?? '';
  const status    = searchParams.get('status')    ?? ''; // 'pending'
  const emailParam = searchParams.get('email')    ?? '';

  // screen: 'processing' | 'success' | 'failed' | 'pending'
  const isVerifyLink = !!(id && hash);
  const [screen, setScreen]         = useState(isVerifyLink ? 'processing' : 'pending');
  const [countdown, setCountdown]   = useState(REDIRECT_DELAY);
  const [resendStatus, setResendStatus] = useState('idle'); // 'idle' | 'loading' | 'sent' | 'error'

  // ── Auto-verifikasi jika ada id+hash ─────────────────────────
  useEffect(() => {
    if (!isVerifyLink) return;

    let cancelled = false;

    const verify = async () => {
      try {
        // TODO: ganti dengan axios call ke backend
        // await axios.get(`/api/v1/auth/email/verify/${id}/${hash}`, {
        //   params: { expires, signature },
        // });
        await new Promise((r) => setTimeout(r, 1200)); // simulasi
        if (!cancelled) setScreen('success');
      } catch {
        if (!cancelled) setScreen('failed');
      }
    };

    verify();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Countdown → redirect ke dashboard setelah sukses ─────────
  useEffect(() => {
    if (screen !== 'success') return;
    if (countdown <= 0) {
      // TODO: redirect ke /onboarding untuk user baru, /dashboard untuk user lama
      navigate('/dashboard', { replace: true });
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [screen, countdown, navigate]);

  // ── Kirim ulang email verifikasi ──────────────────────────────
  const handleResend = useCallback(async () => {
    setResendStatus('loading');
    try {
      // TODO: ganti dengan axios call ke backend
      // await axios.post('/api/v1/auth/email/resend');
      await new Promise((r) => setTimeout(r, 900));
      setResendStatus('sent');
    } catch {
      setResendStatus('error');
    }
  }, []);

  // ── Pilih screen yang ditampilkan ─────────────────────────────
  const renderContent = () => {
    switch (screen) {
      case 'processing':
        return <ProcessingScreen />;
      case 'success':
        return <SuccessScreen countdown={countdown} />;
      case 'failed':
        return (
          <FailureScreen
            onRetry={handleResend}
            loading={resendStatus === 'loading'}
          />
        );
      case 'pending':
      default:
        return (
          <PendingScreen
            email={emailParam}
            onResend={handleResend}
            resendStatus={resendStatus}
          />
        );
    }
  };

  return (
    <AuthLayout title="" subtitle="">
      {renderContent()}
    </AuthLayout>
  );
}
