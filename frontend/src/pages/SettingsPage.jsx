import { useState } from 'react';

function Icon({ name, size = 18, color = 'currentColor' }) {
  const s = { width: size, height: size, flexShrink: 0 };
  const props = { fill: 'none', stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', ...s, viewBox: '0 0 24 24', 'aria-hidden': 'true' };
  switch (name) {
    case 'settings': return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    case 'users': return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'credit-card': return <svg {...props}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
    case 'save': return <svg {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
    default: return <svg {...props}><circle cx="12" cy="12" r="4"/></svg>;
  }
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [businessName, setBusinessName] = useState('Toko Kopi Maju Jaya');
  const [phone, setPhone] = useState('08123456789');
  const [address, setAddress] = useState('Jl. Merdeka No. 45, Bandung');
  const [isSaved, setIsSaved] = useState(false);

  const teamMembers = [
    { id: 1, name: 'Budi Santoso', email: 'owner@umkmpro.id', role: 'Pemilik (Owner)' },
    { id: 2, name: 'Siti Rahma', email: 'kasir1@umkmpro.id', role: 'Kasir (Staff)' },
  ];

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 'var(--text-2xl, 1.5rem)', fontWeight: 800, color: 'var(--color-foreground)', letterSpacing: '-0.02em' }}>
          Pengaturan Toko & Akun
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-muted-fg)' }}>
          Kelola profil bisnis, subscription plan, dan hak akses anggota tim.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', gap: 16 }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '12px 16px', background: 'none', border: 'none',
            borderBottom: activeTab === 'profile' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'profile' ? 'var(--color-primary)' : 'var(--color-muted-fg)',
            fontWeight: activeTab === 'profile' ? 700 : 500, fontSize: 'var(--text-sm, 0.875rem)', cursor: 'pointer',
          }}
        >
          Profil Bisnis
        </button>
        <button
          onClick={() => setActiveTab('plan')}
          style={{
            padding: '12px 16px', background: 'none', border: 'none',
            borderBottom: activeTab === 'plan' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'plan' ? 'var(--color-primary)' : 'var(--color-muted-fg)',
            fontWeight: activeTab === 'plan' ? 700 : 500, fontSize: 'var(--text-sm, 0.875rem)', cursor: 'pointer',
          }}
        >
          Paket Langganan
        </button>
        <button
          onClick={() => setActiveTab('team')}
          style={{
            padding: '12px 16px', background: 'none', border: 'none',
            borderBottom: activeTab === 'team' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'team' ? 'var(--color-primary)' : 'var(--color-muted-fg)',
            fontWeight: activeTab === 'team' ? 700 : 500, fontSize: 'var(--text-sm, 0.875rem)', cursor: 'pointer',
          }}
        >
          Anggota Tim (RBAC)
        </button>
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
          {isSaved && (
            <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: 'var(--text-sm, 0.875rem)', fontWeight: 600 }}>
              ✓ Perubahan profil bisnis berhasil disimpan!
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Nama Bisnis / Toko</label>
            <input
              type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-foreground)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>No WhatsApp Operasional</label>
            <input
              type="text" value={phone} onChange={e => setPhone(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-foreground)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Alamat Toko</label>
            <input
              type="text" value={address} onChange={e => setAddress(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-foreground)' }}
            />
          </div>

          <button
            type="submit"
            style={{ width: 'fit-content', padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: 'var(--color-on-primary)', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8 }}
          >
            <Icon name="save" size={16} color="var(--color-on-primary)" /> Simpan Perubahan
          </button>
        </form>
      )}

      {activeTab === 'plan' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>Paket Saat Ini</span>
            <h3 style={{ margin: '12px 0 4px', fontSize: 'var(--text-xl, 1.25rem)', fontWeight: 800 }}>Free Tier</h3>
            <p style={{ margin: 0, fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-muted-fg)' }}>Cocok untuk UMKM pemula (maks 100 produk).</p>
          </div>

          <div style={{ background: 'var(--color-card)', border: '2px solid var(--color-primary)', borderRadius: 16, padding: 24, position: 'relative' }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>Rekomendasi</span>
            <h3 style={{ margin: '12px 0 4px', fontSize: 'var(--text-xl, 1.25rem)', fontWeight: 800 }}>Pro Tier — Rp 99.000/bln</h3>
            <p style={{ margin: '0 0 16px', fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-muted-fg)' }}>Produk tak terbatas, multi-cabang, & integrasi Midtrans.</p>
            <button
              onClick={() => alert('Mengarahkan ke Midtrans Payment Gateway...')}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: 'var(--color-on-primary)', fontWeight: 700, cursor: 'pointer' }}
            >
              Upgrade ke Pro Via Midtrans
            </button>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm, 0.875rem)' }}>
            <thead>
              <tr style={{ background: 'var(--color-muted)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted-fg)', fontSize: 'var(--text-xs, 0.75rem)', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px' }}>Nama Member</th>
                <th style={{ padding: '14px 20px' }}>Email</th>
                <th style={{ padding: '14px 20px' }}>Role / Hak Akses</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700 }}>{m.name}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--color-muted-fg)' }}>{m.email}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: 99, background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)', color: 'var(--color-primary)', fontSize: 11, fontWeight: 700 }}>
                      {m.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
