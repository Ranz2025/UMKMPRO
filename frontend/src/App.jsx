import { Component, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import SalesPage from './pages/SalesPage';
import PurchasesPage from './pages/PurchasesPage';
import CustomersPage from './pages/CustomersPage';
import SuppliersPage from './pages/SuppliersPage';
import CashPage from './pages/CashPage';
import ExpensesPage from './pages/ExpensesPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import './index.css';

// ── Error Boundary ─────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace' }}>
          <h2 style={{ color: '#ef4444' }}>Terjadi kesalahan</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>
            {String(this.state.error?.stack || this.state.error)}
          </pre>
          <button onClick={() => window.location.reload()}>Muat Ulang</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Page Transition ────────────────────────────────────────────────
function PageTransition({ children }) {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/email/verify'].some(
    (r) => location.pathname === r || location.pathname.startsWith(r + '/')
  );
  return (
    <div key={location.pathname} className={isAuthPage ? 'page-transition page-transition--auth' : 'page-transition'}>
      {children}
    </div>
  );
}

// ── Cursor Glow ────────────────────────────────────────────────────
function CursorGlow() {
  useEffect(() => {
    const el = document.getElementById('cursor-glow');
    if (!el) return;
    const onMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
      document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
      el.classList.add('active');
    };
    const onLeave = () => el.classList.remove('active');
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);
  return <div id="cursor-glow" aria-hidden="true" />;
}

// ── Protected Route ───────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated, initialized } = useAuth();
  if (!initialized) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary,#16a34a)" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.7s linear infinite' }}>
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ── Guest Route (redirect ke dashboard jika sudah login) ──────────
function GuestRoute({ children }) {
  const { isAuthenticated, initialized } = useAuth();
  if (!initialized) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

// ── Halaman yang tidak pakai Navbar landing ────────────────────────
const NO_NAV_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/email/verify', '/onboarding', '/dashboard'];

function AppLayout() {
  const location = useLocation();
  const isNoNavPage = NO_NAV_ROUTES.some(
    (r) => location.pathname === r || location.pathname.startsWith(r + '/')
  );
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    if (isNoNavPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { threshold: 0.3 }
    );
    document.querySelectorAll('section[id]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isNoNavPage, location.pathname]);

  return (
    <>
      <CursorGlow />
      {!isNoNavPage && <Navbar activeSection={activeSection} />}
      <ErrorBoundary>
        <PageTransition>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />

            {/* Guest only */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/email/verify" element={<EmailVerificationPage />} />

            {/* Protected */}
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DashboardPage />} />
              <Route path="produk" element={<ProductsPage />} />
              <Route path="penjualan" element={<SalesPage />} />
              <Route path="pembelian" element={<PurchasesPage />} />
              <Route path="pelanggan" element={<CustomersPage />} />
              <Route path="supplier" element={<SuppliersPage />} />
              <Route path="kas" element={<CashPage />} />
              <Route path="pengeluaran" element={<ExpensesPage />} />
              <Route path="laporan" element={<ReportsPage />} />
              <Route path="pengaturan" element={<SettingsPage />} />
              <Route path="*" element={<DashboardPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransition>
      </ErrorBoundary>
      {!isNoNavPage && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppLayout />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
