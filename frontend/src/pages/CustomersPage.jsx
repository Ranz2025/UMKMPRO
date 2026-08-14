import { useState, useEffect } from 'react';
import { customersApi } from '../api/endpoints/contacts';
import { useToast } from '../context/ToastContext';
import { Btn, Badge, Spinner } from '../components/ui/SharedUI';

// ============================================================
// CustomersPage — ALIGNED VERSION
// Perbaikan konsistensi dengan landing page & dashboard lain:
// - Tombol "Tambah Pelanggan", "Batal", "Simpan" sekarang pakai <Btn>
//   (kelas .btn-primary/.btn-secondary sama persis dengan landing).
// - Tier badge ("VIP"/"Loyal"/"Regular") pakai <Badge tone="...">
//   dari SharedUI, bukan objek warna lokal.
// - Warna kartu statistik (indigo/hijau/amber hex) dipetakan ke token
//   semantik: primary/success/warning.
// - Avatar warna pelanggan tetap butuh variasi (untuk membedakan
//   banyak pelanggan sekaligus), jadi dibangun dari kombinasi token
//   (primary/accent/success/warning) + color-mix, bukan 7 hex bebas
//   yang tidak ada hubungannya dengan brand.
// - Semua radius numerik → var(--radius-*), shadow → var(--shadow-*),
//   heading & angka besar → var(--font-display).
// ============================================================

function Icon({ name, size = 18, color = 'currentColor' }) {
  const s = { width: size, height: size, flexShrink: 0 };
  const p = { fill: 'none', stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', ...s, viewBox: '0 0 24 24', 'aria-hidden': 'true' };
  switch (name) {
    case 'plus':   return <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'search': return <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case 'edit':   return <svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case 'trash':  return <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
    case 'phone':  return <svg {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
    case 'mail':   return <svg {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
    case 'x':      return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case 'users':  return <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'star':   return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    default:       return <svg {...p}><circle cx="12" cy="12" r="4"/></svg>;
  }
}

// Palet avatar — turunan dari token brand (primary/accent/success/warning)
// dicampur dengan color-mix supaya tiap pelanggan tetap mudah dibedakan
// tanpa memakai warna acak yang lepas dari identitas UMKMPro.
const AVATAR_COLORS = [
  'var(--color-primary)',
  'var(--color-accent)',
  'var(--color-success)',
  'var(--color-warning, #FBBF24)',
  'color-mix(in srgb, var(--color-primary) 55%, var(--color-accent))',
  'color-mix(in srgb, var(--color-accent) 55%, var(--color-success))',
  'color-mix(in srgb, var(--color-primary) 40%, black)',
];

function getInitials(name) {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}
function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}
function getTier(spend) {
  const val = Number(spend) || 0;
  if (val >= 1000000) return { label: 'VIP', tone: 'warning' };
  if (val >= 500000) return { label: 'Loyal', tone: 'primary' };
  return { label: 'Regular', tone: 'muted' };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });
  const { addToast } = useToast();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customersApi.list();
      const items = res.data?.data || res.data || [];
      setCustomers(items);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      addToast('Gagal memuat data pelanggan dari server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalSpendAll = customers.reduce((s, c) => s + (Number(c.total_spend || c.totalSpend) || 0), 0);
  const activeThisMonth = customers.filter(c => (Number(c.orders_count || c.orders) || 0) > 0).length;

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: '', phone: '', email: '', address: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cust) => {
    setEditingId(cust.id);
    setFormData({
      name: cust.name || '',
      phone: cust.phone || '',
      email: cust.email || '',
      address: cust.address || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await customersApi.update(editingId, formData);
        addToast('Data pelanggan berhasil diperbarui', 'success');
      } else {
        await customersApi.create(formData);
        addToast('Pelanggan baru berhasil ditambahkan', 'success');
      }
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', email: '', address: '' });
      setEditingId(null);
      await fetchCustomers();
    } catch (err) {
      console.error('Save customer error:', err);
      addToast(err.response?.data?.message || 'Gagal menyimpan data pelanggan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await customersApi.delete(id);
      addToast('Pelanggan berhasil dihapus', 'success');
      setConfirmDelete(null);
      setCustomers(customers.filter(c => c.id !== id));
    } catch (err) {
      console.error('Delete customer error:', err);
      addToast('Gagal menghapus pelanggan', 'error');
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '11px 12px',
    borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
    background: 'var(--color-background)', color: 'var(--color-foreground)',
    fontSize: 'var(--text-sm, 0.875rem)', outline: 'none', transition: 'border-color 0.15s ease',
    fontFamily: 'var(--font-body)',
  };

  const STAT_CARDS = [
    { label: 'Total Pelanggan', value: loading ? '...' : customers.length, sub: 'terdaftar', tone: 'primary', icon: 'users' },
    { label: 'Aktif Bulan Ini', value: loading ? '...' : activeThisMonth, sub: 'bertransaksi', tone: 'success', icon: 'star' },
    { label: 'Total Nilai Belanja', value: loading ? '...' : `Rp ${totalSpendAll.toLocaleString('id-ID')}`, sub: 'akumulasi transaksi', tone: 'warning', icon: 'star' },
  ];
  const TONE_VAR = {
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning, #FBBF24)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl, 1.5rem)', fontWeight: 800, color: 'var(--color-foreground)', letterSpacing: '-0.02em' }}>
            Manajemen Pelanggan (CRM)
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-muted-fg)' }}>
            Kelola data kontak, riwayat belanja, dan tingkatkan retensi pelanggan bisnis Anda.
          </p>
        </div>
        <Btn onClick={handleOpenCreate} variant="primary" size="md" icon={<Icon name="plus" size={17} color="var(--color-on-primary)" />}>
          Tambah Pelanggan
        </Btn>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {STAT_CARDS.map(card => {
          const color = TONE_VAR[card.tone];
          return (
            <div
              key={card.label}
              className="hover-card"
              style={{
                background: 'var(--color-card)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', padding: 'var(--space-md, 18px)',
                borderLeft: `3px solid ${color}`,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-muted-fg)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{card.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, color, lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 4 }}>{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <Icon name="search" size={15} color="var(--color-muted-fg)" />
        </div>
        <input
          type="text"
          placeholder="Cari pelanggan berdasarkan nama, telepon, atau email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Cari pelanggan"
          style={{ ...inputStyle, paddingLeft: 40, borderRadius: 'var(--radius-md)' }}
          onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.03))' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm, 0.875rem)' }}>
            <thead>
              <tr style={{ background: 'var(--color-muted)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted-fg)', fontSize: 'var(--text-xs, 0.75rem)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Pelanggan</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Kontak</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Tier</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Total Transaksi</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}>Total Belanja</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, color: 'var(--color-muted-fg)' }}>
                      <Spinner size={20} />
                      <span>Memuat data pelanggan dari API...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <Icon name="users" size={36} color="var(--color-muted-fg)" />
                      <div style={{ fontWeight: 600, color: 'var(--color-muted-fg)' }}>Tidak ada pelanggan yang ditemukan</div>
                      <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', opacity: 0.7 }}>Coba kata kunci lain atau tambah pelanggan baru</div>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(c => {
                const totalSpend = Number(c.total_spend || c.totalSpend) || 0;
                const ordersCount = Number(c.orders_count || c.orders) || 0;
                const tier = getTier(totalSpend);
                const avatarColor = getAvatarColor(c.name);
                return (
                  <tr
                    key={c.id}
                    style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s ease' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-muted)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                          background: `color-mix(in srgb, ${avatarColor} 15%, transparent)`, color: avatarColor,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-display)',
                          border: `2px solid color-mix(in srgb, ${avatarColor} 25%, transparent)`,
                        }}>
                          {getInitials(c.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--color-foreground)' }}>{c.name}</div>
                          {c.address && <div style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>{c.address}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-muted-fg)' }}>
                          <Icon name="phone" size={11} color="var(--color-muted-fg)" /> {c.phone || '-'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-muted-fg)' }}>
                          <Icon name="mail" size={11} color="var(--color-muted-fg)" /> {c.email || '-'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <Badge tone={tier.tone}>{tier.label}</Badge>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--color-muted-fg)', fontVariantNumeric: 'tabular-nums' }}>
                      {ordersCount} pesanan
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 800, color: 'var(--color-primary)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      Rp {totalSpend.toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          aria-label={`Edit ${c.name}`}
                          style={{ background: 'var(--color-muted)', border: 'none', borderRadius: 'var(--radius-sm)', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-border)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-muted)'; }}
                        >
                          <Icon name="edit" size={14} />
                        </button>
                        <button
                          onClick={() => confirmDelete === c.id ? handleDelete(c.id) : setConfirmDelete(c.id)}
                          onBlur={() => setConfirmDelete(null)}
                          aria-label={`Hapus ${c.name}`}
                          style={{
                            border: 'none', borderRadius: 'var(--radius-sm)', width: 32, height: 32, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease',
                            background: confirmDelete === c.id ? 'var(--color-destructive, #EF4444)' : 'var(--color-muted)',
                          }}
                        >
                          <Icon name="trash" size={14} color={confirmDelete === c.id ? 'var(--color-on-primary)' : 'var(--color-destructive, #EF4444)'} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={editingId ? "Edit data pelanggan" : "Tambah pelanggan baru"}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 460, padding: 'var(--space-xl, 28px)', boxShadow: 'var(--shadow-lg, 0 24px 48px -12px rgba(0,0,0,0.3))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg, 1.125rem)', fontWeight: 800, color: 'var(--color-foreground)' }}>
                {editingId ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} aria-label="Tutup" style={{ background: 'var(--color-muted)', border: 'none', borderRadius: 'var(--radius-sm)', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="x" size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { id: 'c-name', label: 'Nama Lengkap', placeholder: 'contoh: Budi Santoso', key: 'name', required: true, type: 'text' },
                { id: 'c-phone', label: 'No HP / WhatsApp', placeholder: '081234567890', key: 'phone', required: false, type: 'tel' },
                { id: 'c-email', label: 'Email', placeholder: 'budi@example.com', key: 'email', required: false, type: 'email' },
                { id: 'c-address', label: 'Alamat (Opsional)', placeholder: 'Jl. Merdeka No. 10, Bandung', key: 'address', required: false, type: 'text' },
              ].map(field => (
                <div key={field.id}>
                  <label htmlFor={field.id} style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6, color: 'var(--color-foreground)' }}>
                    {field.label} {field.required && <span style={{ color: 'var(--color-destructive, #EF4444)' }}>*</span>}
                  </label>
                  <input
                    id={field.id}
                    type={field.type}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={formData[field.key]}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    style={{ ...inputStyle, borderRadius: 'var(--radius-md)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <Btn type="button" variant="secondary" size="md" onClick={() => setIsModalOpen(false)}>Batal</Btn>
                <Btn type="submit" variant="primary" size="md" disabled={submitting}>
                  {submitting ? (editingId ? 'Menyimpan...' : 'Menambahkan...') : (editingId ? 'Simpan Perubahan' : 'Simpan Pelanggan')}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}