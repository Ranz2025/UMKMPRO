import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout, { AuthButton, AuthFormField, AuthAlert, AuthCheckbox } from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

function validate(fields) {
  const errors = {};
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
  return errors;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fields, setFields] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (field) => (e) => {
    setFields((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    if (serverError) setServerError('');
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
      const res = await login(fields.email, fields.password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setServerError(res.message || 'Email atau password salah. Silakan coba lagi.');
      }
    } catch (err) {
      setServerError(err?.response?.data?.message ?? 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Selamat datang kembali"
      subtitle="Masuk ke akun UMKMPro Anda untuk melanjutkan."
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <AuthAlert message={serverError} />

        <AuthFormField
          id="email"
          label="Email"
          type="email"
          placeholder="nama@bisnis.com"
          value={fields.email}
          onChange={handleChange('email')}
          error={errors.email}
          autoComplete="email"
        />

        <AuthFormField
          id="password"
          label="Password"
          type="password"
          placeholder="Min. 8 karakter"
          value={fields.password}
          onChange={handleChange('password')}
          error={errors.password}
          autoComplete="current-password"
          rightSlot={
            <Link
              to="/forgot-password"
              style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-primary)', fontWeight: 600 }}
            >
              Lupa password?
            </Link>
          }
        />

        <AuthCheckbox
          id="remember-me"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          label="Ingat saya selama 30 hari"
        />

        <AuthButton type="submit" variant="primary" disabled={loading}>
          {loading ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"
                style={{ animation: 'auth-spin 0.8s linear infinite' }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Masuk...
            </>
          ) : 'Masuk ke Akun'}
        </AuthButton>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          <span style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-muted-fg)' }}>atau</span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
        </div>

        <div style={{ position: 'relative' }}>
          <AuthButton type="button" variant="secondary" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Masuk dengan Google
          </AuthButton>
          <span
            style={{
              position: 'absolute',
              top: -9,
              right: 10,
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              padding: '2px 8px',
              borderRadius: 9999,
              background: 'var(--color-muted, #F1F5F9)',
              color: 'var(--color-muted-fg)',
              border: '1px solid var(--color-border)',
            }}
          >
            Segera Hadir
          </span>
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: 'var(--text-sm, 0.875rem)',
          color: 'var(--color-muted-fg)',
        }}>
          Belum punya akun?{' '}
          <Link
            to="/register"
            style={{ color: 'var(--color-primary)', fontWeight: 700 }}
          >
            Daftar gratis
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}