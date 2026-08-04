import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout, { AuthButton, AuthFormField, AuthAlert, AuthCheckbox } from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

function PasswordStrength({ password }) {
  if (!password) return null;

  const checks = [
    { label: 'Min. 8 karakter', pass: password.length >= 8 },
    { label: 'Huruf besar', pass: /[A-Z]/.test(password) },
    { label: 'Huruf kecil', pass: /[a-z]/.test(password) },
    { label: 'Angka', pass: /[0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = [
    'var(--color-error, #EF4444)',
    'var(--color-warning, #F97316)',
    'var(--color-warning, #FBBF24)',
    'var(--color-success, #22C55E)',
  ];
  const labels = ['Sangat lemah', 'Lemah', 'Sedang', 'Kuat'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 99,
            background: i < score ? colors[score - 1] : 'var(--color-border)',
            transition: 'background 200ms ease',
          }} />
        ))}
      </div>
      <p style={{ fontSize: 'var(--text-xs, 0.75rem)', color: score >= 3 ? 'var(--color-success, #22C55E)' : 'var(--color-muted-fg)', margin: 0 }}>
        Kekuatan: <strong>{labels[score - 1] ?? 'Sangat lemah'}</strong>
        {score < 4 && (
          <span style={{ color: 'var(--color-muted-fg)', fontWeight: 400 }}>
            {' '}— {checks.find(c => !c.pass)?.label && `Tambahkan ${checks.find(c => !c.pass).label.toLowerCase()}`}
          </span>
        )}
      </p>
    </div>
  );
}

function validate(fields) {
  const errors = {};
  if (!fields.name.trim()) {
    errors.name = 'Nama lengkap wajib diisi.';
  } else if (fields.name.trim().length < 2) {
    errors.name = 'Nama minimal 2 karakter.';
  }
  if (!fields.email.trim()) {
    errors.email = 'Email wajib diisi.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = 'Format email tidak valid.';
  }
  if (!fields.password) {
    errors.password = 'Password wajib diisi.';
  } else if (fields.password.length < 8) {
    errors.password = 'Password minimal 8 karakter.';
  }
  if (!fields.confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password wajib diisi.';
  } else if (fields.password !== fields.confirmPassword) {
    errors.confirmPassword = 'Password tidak cocok.';
  }
  if (!fields.agreed) {
    errors.agreed = 'Anda harus menyetujui syarat & ketentuan.';
  }
  return errors;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fields, setFields] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreed: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFields(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (serverError) setServerError('');
  };

  const handleConfirmPasswordBlur = () => {
    if (fields.confirmPassword && fields.password !== fields.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Password tidak cocok.' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = Object.keys(validationErrors)[0];
      document.getElementById(firstError)?.focus();
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const res = await register(fields);
      if (res.success) {
        setSuccess(true);
      } else {
        if (res.errors) {
          const formatted = {};
          Object.keys(res.errors).forEach((key) => {
            formatted[key] = res.errors[key][0];
          });
          setErrors((prev) => ({ ...prev, ...formatted }));
        }
        setServerError(res.message || 'Gagal mendaftar. Silakan periksa kembali data Anda.');
      }
    } catch (err) {
      setServerError('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Cek email Anda"
        subtitle="Kami sudah mengirim link verifikasi."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'color-mix(in srgb, var(--color-success, #22C55E) 12%, transparent)',
            border: '2px solid color-mix(in srgb, var(--color-success, #22C55E) 30%, transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-success, #22C55E)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-muted-fg)', lineHeight: 1.7 }}>
              Link verifikasi dikirim ke{' '}
              <strong style={{ color: 'var(--color-foreground)' }}>{fields.email}</strong>.
              Klik link di email untuk mengaktifkan akun Anda.
            </p>
          </div>
          <AuthButton to="/login" variant="primary">
            Ke halaman masuk
          </AuthButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Buat akun gratis"
      subtitle="Daftar sekarang. Tidak perlu kartu kredit."
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <AuthAlert message={serverError} />

        <AuthFormField
          id="name"
          label="Nama Lengkap"
          placeholder="Budi Santoso"
          value={fields.name}
          onChange={handleChange('name')}
          error={errors.name}
          autoComplete="name"
        />

        <AuthFormField
          id="email"
          label="Email"
          type="email"
          placeholder="budi@bisnis.com"
          value={fields.email}
          onChange={handleChange('email')}
          error={errors.email}
          autoComplete="email"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <AuthFormField
            id="password"
            label="Password"
            type="password"
            placeholder="Min. 8 karakter"
            value={fields.password}
            onChange={handleChange('password')}
            error={errors.password}
            autoComplete="new-password"
          />
          <PasswordStrength password={fields.password} />
        </div>

        <AuthFormField
          id="confirmPassword"
          label="Konfirmasi Password"
          type="password"
          placeholder="Ulangi password"
          value={fields.confirmPassword}
          onChange={handleChange('confirmPassword')}
          onBlur={handleConfirmPasswordBlur}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <AuthCheckbox
          id="agreed"
          checked={fields.agreed}
          onChange={handleChange('agreed')}
          error={errors.agreed}
          label={
            <>
              Saya menyetujui{' '}
              <Link to="/terms" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Syarat &amp; Ketentuan</Link>
              {' '}dan{' '}
              <Link to="/privacy" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Kebijakan Privasi</Link>
            </>
          }
        />

        <AuthButton type="submit" variant="primary" disabled={loading}>
          {loading ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"
                style={{ animation: 'auth-spin 0.8s linear infinite' }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Membuat akun...
            </>
          ) : 'Buat Akun Gratis'}
        </AuthButton>

        <p style={{
          textAlign: 'center',
          fontSize: 'var(--text-sm, 0.875rem)',
          color: 'var(--color-muted-fg)',
        }}>
          Sudah punya akun?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
            Masuk
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}