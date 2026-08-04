import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout, { AuthButton, AuthFormField } from '../components/AuthLayout';

// ============================================================
// ResetPasswordPage  (FE-02)
//
// URL yang diharapkan:
//   /reset-password?token=<token>&email=<email>
//
// Flow:
//   1. Baca token & email dari query params
//   2. Jika token tidak ada → tampilkan InvalidTokenScreen
//   3. User isi password baru + konfirmasi → submit
//   4. Simulasi POST /api/v1/auth/reset-password
//   5. Tampilkan SuccessScreen lalu redirect /login setelah 3 detik
//
// TODO: ganti simulasi dengan axios call ke backend
// ============================================================

// ── Password strength helper (sama persis dengan RegisterPage) ──
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  const checks = {
    length:     password.length >= 8,
    uppercase:  /[A-Z]/.test(password),
    lowercase:  /[a-z]/.test(password),
    number:     /[0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const map = [
    { label: '',              color: '' },
    { label: 'Sangat lemah',  color: '#EF4444' },
    { label: 'Lemah',         color: '#F97316' },
    { label: 'Sedang',        color: '#EAB308' },
    { label: 'Kuat',          color: '#22C55E' },
  ];
  return { score, ...map[score] };
}

// ── Layar token tidak valid ───────────────────────────────────
function InvalidTokenScreen() {
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
      {/* Ikon peringatan */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'color-mix(in srgb, #EF4444 12%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 0 12px color-mix(in srgb, #EF4444 6%, transparent)',
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
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
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
          Link tidak valid
        </h2>
        <p
          style={{
            fontSize: 'var(--text-sm, 0.875rem)',
            color: 'var(--color-muted-fg)',
            lineHeight: 1.7,
            maxWidth: 360,
          }}
        >
          Link reset password yang Anda gunakan sudah <strong style={{ color: 'var(--color-foreground)' }}>kadaluarsa</strong> atau{' '}
          <strong style={{ color: 'var(--color-foreground)' }}>tidak valid</strong>.
          Link hanya berlaku selama 60 menit setelah dikirim.
        </p>
      </div>

      <AuthButton variant="primary" to="/forgot-password">
        Minta link baru
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

// ── Layar sukses ──────────────────────────────────────────────
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
      {/* Ikon centang */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'color-mix(in srgb, #22C55E 12%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 0 12px color-mix(in srgb, #22C55E 6%, transparent)',
        }}
      >
        <svg
          width="32"
          height="32"
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
          Password berhasil diubah!
        </h2>
        <p
          style={{
            fontSize: 'var(--text-sm, 0.875rem)',
            color: 'var(--color-muted-fg)',
            lineHeight: 1.7,
          }}
        >
          Password baru Anda sudah aktif. Anda akan diarahkan ke halaman masuk
          dalam{' '}
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
      >
        <div
          style={{
            height: '100%',
            width: `${(countdown / 3) * 100}%`,
            background: 'var(--color-primary)',
            borderRadius: 9999,
            transition: 'width 1s linear',
          }}
        />
      </div>

      <AuthButton variant="primary" to="/login">
        Masuk sekarang
      </AuthButton>
    </div>
  );
}

// ── Komponen utama ────────────────────────────────────────────
export default function ResetPasswordPage() {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();

  // Baca token & email dari URL query params
  const token = searchParams.get('token') ?? '';
  const emailFromUrl = searchParams.get('email') ?? '';

  const [fields, setFields]       = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess]     = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Countdown → redirect setelah sukses
  useEffect(() => {
    if (!success) return;
    if (countdown <= 0) {
      navigate('/login', { replace: true });
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [success, countdown, navigate]);

  const strength = getPasswordStrength(fields.password);

  const validate = () => {
    const errs = {};
    if (!fields.password) {
      errs.password = 'Password baru wajib diisi.';
    } else if (fields.password.length < 8) {
      errs.password = 'Password minimal 8 karakter.';
    } else if (strength.score < 2) {
      errs.password = 'Password terlalu lemah. Tambahkan huruf besar, angka, atau karakter khusus.';
    }
    if (!fields.confirmPassword) {
      errs.confirmPassword = 'Konfirmasi password wajib diisi.';
    } else if (fields.password !== fields.confirmPassword) {
      errs.confirmPassword = 'Password tidak cocok.';
    }
    return errs;
  };

  const handleChange = (field) => (e) => {
    setFields((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.getElementById(firstKey)?.focus();
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      // TODO: ganti dengan axios call ke backend
      // await axios.post('/api/v1/auth/reset-password', {
      //   token,
      //   email: emailFromUrl,
      //   password: fields.password,
      //   password_confirmation: fields.confirmPassword,
      // });
      await new Promise((r) => setTimeout(r, 900));
      setSuccess(true);
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 422) {
        // Token kadaluarsa / tidak valid dari backend
        setServerError(msg ?? 'Link reset sudah kadaluarsa. Silakan minta link baru.');
      } else {
        setServerError(msg ?? 'Gagal mengubah password. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Token tidak ada di URL → tampilkan screen invalid
  if (!token) {
    return (
      <AuthLayout title="" subtitle="">
        <InvalidTokenScreen />
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout title="" subtitle="">
        <SuccessScreen countdown={countdown} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Buat password baru"
      subtitle="Masukkan password baru untuk akun Anda. Pastikan mudah diingat namun sulit ditebak."
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        {/* Email readonly (konteks untuk user) */}
        {emailFromUrl && (
          <div
            style={{
              padding: '10px 14px',
              background: 'var(--color-muted)',
              borderRadius: 'var(--radius-md, 10px)',
              fontSize: 'var(--text-sm, 0.875rem)',
              color: 'var(--color-muted-fg)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>
              Reset untuk:{' '}
              <strong style={{ color: 'var(--color-foreground)', wordBreak: 'break-all' }}>
                {emailFromUrl}
              </strong>
            </span>
          </div>
        )}

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
            <span>
              {serverError}{' '}
              {serverError.includes('kadaluarsa') && (
                <Link
                  to="/forgot-password"
                  style={{ color: 'inherit', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Minta link baru →
                </Link>
              )}
            </span>
          </div>
        )}

        {/* Field password baru */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AuthFormField
            id="password"
            label="Password baru"
            type="password"
            placeholder="Min. 8 karakter"
            value={fields.password}
            onChange={handleChange('password')}
            error={errors.password}
            autoComplete="new-password"
          />

          {/* Password strength bar */}
          {fields.password && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div
                style={{
                  display: 'flex',
                  gap: 4,
                }}
                aria-hidden="true"
              >
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 9999,
                      background: strength.score >= level ? strength.color : 'var(--color-border)',
                      transition: 'background 0.3s ease',
                    }}
                  />
                ))}
              </div>
              <p
                style={{
                  fontSize: 'var(--text-xs, 0.75rem)',
                  color: strength.color || 'var(--color-muted-fg)',
                  fontWeight: 600,
                  margin: 0,
                }}
                aria-live="polite"
              >
                Kekuatan: {strength.label || '—'}
              </p>
              {/* Checklist kriteria */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '4px 12px',
                }}
              >
                {[
                  { check: fields.password.length >= 8,    label: 'Min. 8 karakter' },
                  { check: /[A-Z]/.test(fields.password),  label: 'Huruf besar (A-Z)' },
                  { check: /[a-z]/.test(fields.password),  label: 'Huruf kecil (a-z)' },
                  { check: /[0-9]/.test(fields.password),  label: 'Angka (0-9)' },
                ].map(({ check, label }) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 'var(--text-xs, 0.75rem)',
                      color: check ? '#22C55E' : 'var(--color-muted-fg)',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {check ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    )}
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Field konfirmasi password */}
        <AuthFormField
          id="confirmPassword"
          label="Konfirmasi password baru"
          type="password"
          placeholder="Ulangi password baru"
          value={fields.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
          autoComplete="new-password"
          hint={
            fields.confirmPassword && !errors.confirmPassword && fields.password === fields.confirmPassword
              ? '✓ Password cocok'
              : undefined
          }
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
              Menyimpan...
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
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Simpan Password Baru
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
