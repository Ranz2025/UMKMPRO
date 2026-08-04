import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// ============================================================
// DashboardLayout  (FE-05)
// Sidebar + Header + main content area
// Responsive: sidebar collapse di layar < 768px (drawer mobile)
// ============================================================

// â”€â”€ Navigasi sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const NAV_ITEMS = [
  {
    group: 'Utama',
    items: [
      { to: '/dashboard',          label: 'Beranda',    icon: 'home' },
    ],
  },
  {
    group: 'Bisnis',
    items: [
      { to: '/dashboard/produk',   label: 'Produk',     icon: 'box' },
      { to: '/dashboard/penjualan',label: 'Penjualan',  icon: 'cart' },
      { to: '/dashboard/pembelian',label: 'Pembelian',  icon: 'purchase' },
      { to: '/dashboard/pelanggan',label: 'Pelanggan',  icon: 'users' },
      { to: '/dashboard/supplier', label: 'Supplier',   icon: 'truck' },
    ],
  },
  {
    group: 'Keuangan',
    items: [
      { to: '/dashboard/kas',      label: 'Kas & Bank', icon: 'wallet' },
      { to: '/dashboard/pengeluaran',label:'Pengeluaran',icon: 'expense' },
      { to: '/dashboard/laporan',  label: 'Laporan',    icon: 'chart' },
    ],
  },
  {
    group: 'Pengaturan',
    items: [
      { to: '/dashboard/pengaturan',label:'Pengaturan', icon: 'settings' },
    ],
  },
];

// â”€â”€ SVG icon helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function NavIcon({ name, size = 18 }) {
  const s = { width: size, height: size, flexShrink: 0 };
  const props = { fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', ...s, viewBox: '0 0 24 24', 'aria-hidden': 'true' };
  switch (name) {
    case 'home':     return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case 'box':      return <svg {...props}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
    case 'cart':     return <svg {...props}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
    case 'purchase': return <svg {...props}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
    case 'users':    return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'truck':    return <svg {...props}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
    case 'wallet':   return <svg {...props}><path d="M20 12V22H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"/><path d="M20 12a2 2 0 0 0-2-2H4"/><circle cx="18" cy="12" r="2"/></svg>;
    case 'expense':  return <svg {...props}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
    case 'chart':    return <svg {...props}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
    case 'settings': return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    default: return <svg {...props}><circle cx="12" cy="12" r="4"/></svg>;
  }
}

// â”€â”€ Business Switcher Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function BusinessSwitcherModal({ onClose }) {
  const { user, activeBusiness, switchBusiness } = useAuth();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Retail');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const businesses = user?.businesses || [];

  const handleSwitch = (biz) => {
    switchBusiness(biz);
    onClose();
    // reload halaman agar data ter-refresh dengan bisnis baru
    window.location.reload();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { businessApi } = await import('../api/endpoints/business');
      const res = await businessApi.create({ name: newName.trim(), type: newType });
      const biz = res.data?.data;
      if (biz) {
        switchBusiness(biz);
        onClose();
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat bisnis.');
    } finally {
      setLoading(false);
    }
  };

  const TYPES = ['Retail', 'F&B', 'Jasa', 'Grosir', 'Online', 'Lainnya'];

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 28, width: '90%', maxWidth: 460, boxShadow: '0 25px 50px rgba(0,0,0,0.35)', animation: 'modalPop 0.18s ease-out' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Pilih bisnis"
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--color-foreground)' }}>Pilih Bisnis</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted-fg)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* List bisnis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, maxHeight: 260, overflowY: 'auto' }}>
          {businesses.length === 0 && (
            <p style={{ margin: 0, color: 'var(--color-muted-fg)', fontSize: 14, textAlign: 'center', padding: '16px 0' }}>
              Belum ada bisnis. Buat bisnis pertama Anda.
            </p>
          )}
          {businesses.map(biz => {
            const isActive = String(biz.id) === String(activeBusiness?.id);
            return (
              <button
                key={biz.id}
                onClick={() => handleSwitch(biz)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                  border: isActive ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: isActive ? 'color-mix(in srgb, var(--color-primary) 8%, var(--color-muted))' : 'var(--color-muted)',
                  transition: 'all 0.15s ease', textAlign: 'left',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: isActive ? 'var(--color-primary)' : 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: 14, color: isActive ? 'var(--color-on-primary)' : 'var(--color-muted-fg)' }}>
                  {biz.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--color-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{biz.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted-fg)' }}>{biz.type || 'Bisnis'}</p>
                </div>
                {isActive && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Aktif"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--color-border)', marginBottom: 16 }} />

        {/* Buat bisnis baru */}
        {!creating ? (
          <button
            onClick={() => setCreating(true)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 16px', borderRadius: 10, border: '1.5px dashed var(--color-border)', background: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700, fontSize: 14, transition: 'border-color 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Buat Bisnis Baru
          </button>
        ) : (
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--color-foreground)' }}>Buat Bisnis Baru</p>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nama bisnis (contoh: Warung Bu Sari)"
              autoFocus
              required
              style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-muted)', color: 'var(--color-foreground)', fontSize: 14, outline: 'none' }}
            />
            <select
              value={newType}
              onChange={e => setNewType(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-muted)', color: 'var(--color-foreground)', fontSize: 14, outline: 'none', cursor: 'pointer' }}
            >
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {error && <p style={{ margin: 0, color: '#ef4444', fontSize: 13 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setCreating(false)} style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'none', cursor: 'pointer', color: 'var(--color-foreground)', fontWeight: 600, fontSize: 14 }}>Batal</button>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none', background: 'var(--color-primary)', cursor: loading ? 'not-allowed' : 'pointer', color: 'var(--color-on-primary)', fontWeight: 700, fontSize: 14, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// â”€â”€ Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Sidebar({ collapsed, onClose, isMobile, user, activeBusiness, onSwitchBusiness }) {
  const location = useLocation();

  const isActive = (to) =>
    to === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(to);

  const sidebarWidth = collapsed && !isMobile ? 64 : 240;

  return (
    <>
      {/* Overlay mobile */}
      {isMobile && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside style={{
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        left: isMobile ? 0 : undefined,
        zIndex: isMobile ? 50 : 10,
        height: '100vh',
        width: sidebarWidth,
        minWidth: sidebarWidth,
        background: 'var(--color-card)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Logo area */}
        <div style={{
          height: 64, display: 'flex', alignItems: 'center',
          padding: collapsed && !isMobile ? '0 20px' : '0 20px',
          borderBottom: '1px solid var(--color-border)',
          gap: 10, flexShrink: 0,
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', overflow: 'hidden' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M3 14V8l6-5 6 5v6H11v-4H7v4H3z" fill="var(--color-on-primary)"/>
              </svg>
            </div>
            {(!collapsed || isMobile) && (
              <span style={{
                fontFamily: 'var(--font-display, inherit)',
                fontWeight: 800, fontSize: '1.05rem',
                color: 'var(--color-foreground)',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}>
                UMKMPro
              </span>
            )}
          </Link>
          {isMobile && (
            <button onClick={onClose} aria-label="Tutup sidebar" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-muted-fg)', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }} aria-label="Navigasi dasbor">
          {NAV_ITEMS.map(({ group, items }) => (
            <div key={group} style={{ marginBottom: 4 }}>
              {(!collapsed || isMobile) && (
                <p style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.1em', color: 'var(--color-muted-fg)',
                  padding: '8px 8px 4px',
                  margin: 0,
                }}>
                  {group}
                </p>
              )}
              {items.map(({ to, label, icon }) => {
                const active = isActive(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={isMobile ? onClose : undefined}
                    title={collapsed && !isMobile ? label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: collapsed && !isMobile ? '10px 0' : '9px 10px',
                      borderRadius: 8,
                      textDecoration: 'none',
                      color: active ? 'var(--color-primary)' : 'var(--color-muted-fg)',
                      background: active ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)' : 'transparent',
                      fontWeight: active ? 600 : 400,
                      fontSize: 'var(--text-sm, 0.875rem)',
                      transition: 'all 0.15s ease',
                      justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                      marginBottom: 2,
                      position: 'relative',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--color-muted)'; e.currentTarget.style.color = 'var(--color-foreground)'; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-muted-fg)'; } }}
                  >
                    {active && (
                      <span style={{
                        position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)',
                        width: 3, height: 18, borderRadius: '0 3px 3px 0',
                        background: 'var(--color-primary)',
                      }} />
                    )}
                    <NavIcon name={icon} />
                    {(!collapsed || isMobile) && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User info di bottom */}
        {(!collapsed || isMobile) && (
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', gap: 10,
            flexShrink: 0,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'color-mix(in srgb, var(--color-primary) 20%, var(--color-muted))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              fontWeight: 700, fontSize: 13, color: 'var(--color-primary)',
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ fontSize: 'var(--text-sm, 0.875rem)', fontWeight: 600, color: 'var(--color-foreground)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Pengguna'}
              </p>
              <p style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-muted-fg)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || ''}
              </p>
            </div>
            {onSwitchBusiness && (
              <button
                onClick={onSwitchBusiness}
                title="Ganti Bisnis"
                style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: 'var(--color-muted-fg)', display: 'flex', alignItems: 'center', flexShrink: 0 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [switchBizOpen, setSwitchBizOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, activeBusiness, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-background)', color: 'var(--color-foreground)' }}>
      {/* Desktop Sidebar */}
      <div className="hidden-mobile">
        <Sidebar
          collapsed={collapsed}
          isMobile={false}
          user={user}
          activeBusiness={activeBusiness}
          onSwitchBusiness={() => setSwitchBizOpen(true)}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <Sidebar
          collapsed={false}
          isMobile={true}
          onClose={() => setMobileOpen(false)}
          user={user}
          activeBusiness={activeBusiness}
          onSwitchBusiness={() => { setSwitchBizOpen(true); setMobileOpen(false); }}
        />
      )}

      {/* Business Switcher Modal */}
      {switchBizOpen && (
        <BusinessSwitcherModal onClose={() => setSwitchBizOpen(false)} />
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header style={{
          height: 64,
          background: 'var(--color-card)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Sidebar toggle button */}
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  setMobileOpen(!mobileOpen);
                } else {
                  setCollapsed(!collapsed);
                }
              }}
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '6px 10px',
                cursor: 'pointer',
                color: 'var(--color-foreground)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              aria-label="Toggle sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>

            {/* Active Business + Switch Button */}
            <button
              onClick={() => setSwitchBizOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'none', border: '1px solid var(--color-border)',
                borderRadius: 10, padding: '5px 12px', cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="11" height="11" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3 14V8l6-5 6 5v6H11v-4H7v4H3z" fill="var(--color-on-primary)"/>
                </svg>
              </div>
              <span style={{ fontSize: 'var(--text-sm, 0.875rem)', fontWeight: 600, color: 'var(--color-foreground)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeBusiness?.name || 'Pilih Bisnis'}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-fg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 8, padding: 8, cursor: 'pointer', color: 'var(--color-foreground)', display: 'flex', alignItems: 'center' }}
              aria-label="Toggle tema"
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>

            {/* User Dropdown */}
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 4, borderRadius: 8 }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary)', color: 'var(--color-on-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                  {initials}
                </div>
              </button>

              {userMenuOpen && (
                <div style={{ position: 'absolute', right: 0, top: '110%', width: 220, background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 12, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', padding: 8, zIndex: 100 }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: 4 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-foreground)' }}>{user?.name || 'Pengguna'}</p>
                    <p style={{ margin: 0, fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-muted-fg)' }}>{user?.email || ''}</p>
                  </div>
                  <button onClick={() => { setSwitchBizOpen(true); setUserMenuOpen(false); }} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-foreground)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    Ganti Bisnis
                  </button>
                  <button onClick={() => navigate('/dashboard/pengaturan')} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-foreground)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <NavIcon name="settings" size={16} />
                    Pengaturan
                  </button>
                  <div style={{ borderTop: '1px solid var(--color-border)', margin: '4px 0' }} />
                  <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 'var(--text-sm, 0.875rem)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
