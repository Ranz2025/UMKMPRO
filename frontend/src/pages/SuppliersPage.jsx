import { useState, useEffect } from 'react';
import { suppliersApi } from '../api/endpoints/contacts';
import { useToast } from '../context/ToastContext';

function Icon({ name, size = 18, color = 'currentColor' }) {
  const s = { width: size, height: size, flexShrink: 0 };
  const p = { fill: 'none', stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', ...s, viewBox: '0 0 24 24', 'aria-hidden': 'true' };
  switch (name) {
    case 'plus':    return <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'truck':   return <svg {...p}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
    case 'edit':    return <svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case 'trash':   return <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
    case 'x':       return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case 'check':   return <svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
    case 'phone':   return <svg {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
    case 'spin':    return <svg {...p} style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12"/></svg>;
    default:        return <svg {...p}><circle cx="12" cy="12" r="4"/></svg>;
  }
}

const CATEGORY_COLORS = {
  'Bahan Baku': { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  'Kemasan':    { color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  'Peralatan':  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  'Lainnya':    { color: '#6b7280', bg: 'var(--color-muted)' },
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '', contact_person: '', phone: '', email: '', category: 'Bahan Baku', payment_terms: 'COD', address: '',
  });
  const { addToast } = useToast();

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await suppliersApi.list();
      const items = res.data?.data || res.data || [];
      setSuppliers(items);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
      addToast('Gagal memuat data supplier dari server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: '', contact_person: '', phone: '', email: '', category: 'Bahan Baku', payment_terms: 'COD', address: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingId(sup.id);
    setFormData({
      name: sup.name || sup.company || '',
      contact_person: sup.contact_person || sup.contact || '',
      phone: sup.phone || '',
      email: sup.email || '',
      category: sup.category || 'Bahan Baku',
      payment_terms: sup.payment_terms || sup.terms || 'COD',
      address: sup.address || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await suppliersApi.update(editingId, formData);
        addToast('Data supplier berhasil diperbarui', 'success');
      } else {
        await suppliersApi.create(formData);
        addToast('Supplier baru berhasil ditambahkan', 'success');
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', contact_person: '', phone: '', email: '', category: 'Bahan Baku', payment_terms: 'COD', address: '' });
      await fetchSuppliers();
    } catch (err) {
      console.error('Save supplier error:', err);
      addToast(err.response?.data?.message || 'Gagal menyimpan data supplier', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await suppliersApi.delete(id);
      addToast('Supplier berhasil dihapus', 'success');
      setConfirmDelete(null);
      setSuppliers(suppliers.filter(s => s.id !== id));
    } catch (err) {
      console.error('Delete supplier error:', err);
      addToast('Gagal menghapus supplier', 'error');
    }
  };

  const totalBuyAll = suppliers.reduce((s, v) => s + (Number(v.total_purchases || v.totalBuy) || 0), 0);

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 8,
    border: '1px solid var(--color-border)', background: 'var(--color-background)',
    color: 'var(--color-foreground)', fontSize: 'var(--text-sm, 0.875rem)', outline: 'none', transition: 'border-color 0.15s ease',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-2xl, 1.5rem)', fontWeight: 800, color: 'var(--color-foreground)', letterSpacing: '-0.02em' }}>
            Data Pemasok &amp; Vendor
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-muted-fg)' }}>
            Kelola data supplier, kontak vendor, syarat pembayaran, dan total pembelian.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          aria-label="Tambah supplier baru"
          style={{
            background: 'var(--color-primary)', color: 'var(--color-on-primary)',
            border: 'none', borderRadius: 10, padding: '11px 20px', fontWeight: 700,
            fontSize: 'var(--text-sm, 0.875rem)', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 14px rgba(16,185,129,0.25)', transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Icon name="plus" size={17} color="var(--color-on-primary)" />
          Tambah Supplier
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Supplier', value: loading ? '...' : suppliers.length, sub: 'vendor terdaftar', color: '#6366f1', bottom: `${suppliers.length} terhubung` },
          { label: 'Total Pembelian', value: loading ? '...' : `Rp ${totalBuyAll.toLocaleString('id-ID')}`, sub: 'akumulasi transaksi vendor', color: '#10b981', bottom: 'real-time' },
          { label: 'Hutang Dagang', value: 'Rp 0', sub: 'belum dibayar', color: '#f59e0b', bottom: 'tidak ada outstanding' },
        ].map(card => (
          <div key={card.label} style={{
            background: 'var(--color-card)', border: '1px solid var(--color-border)',
            borderRadius: 14, padding: 18, borderLeft: `3px solid ${card.color}`,
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)', transition: 'box-shadow 0.2s ease',
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 20px -4px ${card.color}25`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)'}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-muted-fg)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{card.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: card.color, lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 6 }}>{card.sub} &bull; {card.bottom}</div>
          </div>
        ))}
      </div>

      {/* Supplier Table */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm, 0.875rem)' }}>
            <thead>
              <tr style={{ background: 'var(--color-muted)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted-fg)', fontSize: 'var(--text-xs, 0.75rem)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Perusahaan / Vendor</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Kontak</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Kategori</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Terms Bayar</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Total Pembelian</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, color: 'var(--color-muted-fg)' }}>
                      <Icon name="spin" size={20} color="var(--color-primary)" />
                      <span>Memuat data supplier dari API...</span>
                    </div>
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <Icon name="truck" size={36} color="var(--color-muted-fg)" />
                      <div style={{ fontWeight: 600, color: 'var(--color-muted-fg)' }}>Belum ada supplier terdaftar</div>
                      <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', opacity: 0.7 }}>Klik "Tambah Supplier" untuk memasukkan data vendor pertama</div>
                    </div>
                  </td>
                </tr>
              ) : suppliers.map(s => {
                const category = s.category || 'Bahan Baku';
                const catStyle = CATEGORY_COLORS[category] || CATEGORY_COLORS['Lainnya'];
                const totalBuy = Number(s.total_purchases || s.totalBuy) || 0;
                return (
                  <tr
                    key={s.id}
                    style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s ease' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-muted)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon name="truck" size={16} color="var(--color-primary)" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--color-foreground)' }}>{s.name || s.company}</div>
                          {s.address && <div style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>{s.address}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-foreground)' }}>{s.contact_person || s.contact || '-'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 2 }}>
                        <Icon name="phone" size={10} color="var(--color-muted-fg)" /> {s.phone || '-'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: catStyle.bg, color: catStyle.color }}>{category}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>{s.payment_terms || s.terms || 'COD'}</span>
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 800, color: 'var(--color-foreground)', fontVariantNumeric: 'tabular-nums' }}>
                      Rp {totalBuy.toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                        background: 'rgba(16,185,129,0.12)', color: '#10b981',
                      }}>
                        <Icon name="check" size={10} color="#10b981" />
                        Aktif
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          aria-label={`Edit ${s.name || s.company}`}
                          style={{ background: 'var(--color-muted)', border: 'none', borderRadius: 7, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s ease' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-border)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--color-muted)'}
                        >
                          <Icon name="edit" size={14} />
                        </button>
                        <button
                          onClick={() => confirmDelete === s.id ? handleDelete(s.id) : setConfirmDelete(s.id)}
                          onBlur={() => setConfirmDelete(null)}
                          aria-label={`Hapus ${s.name || s.company}`}
                          style={{ border: 'none', borderRadius: 7, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease', background: confirmDelete === s.id ? '#ef4444' : 'var(--color-muted)' }}
                        >
                          <Icon name="trash" size={14} color={confirmDelete === s.id ? '#fff' : '#ef4444'} />
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

      {/* Add/Edit Supplier Modal */}
      {isModalOpen && (
        <div
          role="dialog" aria-modal="true" aria-label={editingId ? "Edit supplier" : "Tambah supplier"}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 20, width: '100%', maxWidth: 500, padding: 28, boxShadow: '0 24px 48px -12px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 'var(--text-lg, 1.125rem)', fontWeight: 800, color: 'var(--color-foreground)' }}>
                {editingId ? "Edit Supplier" : "Tambah Supplier Baru"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} aria-label="Tutup" style={{ background: 'var(--color-muted)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="x" size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label htmlFor="s-name" style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Nama Perusahaan / Vendor <span style={{ color: '#ef4444' }}>*</span></label>
                <input id="s-name" type="text" required placeholder="CV. Bintang Agro" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--color-primary)'} onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label htmlFor="s-contact" style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Contact Person</label>
                  <input id="s-contact" type="text" placeholder="Pak Hendra" value={formData.contact_person} onChange={e => setFormData({ ...formData, contact_person: e.target.value })} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--color-primary)'} onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
                </div>
                <div>
                  <label htmlFor="s-phone" style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>No. Telepon</label>
                  <input id="s-phone" type="tel" placeholder="081122334455" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--color-primary)'} onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label htmlFor="s-category" style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Kategori Produk</label>
                  <select id="s-category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={inputStyle}>
                    <option>Bahan Baku</option><option>Kemasan</option><option>Peralatan</option><option>Lainnya</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="s-terms" style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Terms Pembayaran</label>
                  <select id="s-terms" value={formData.payment_terms} onChange={e => setFormData({ ...formData, payment_terms: e.target.value })} style={inputStyle}>
                    <option>COD</option><option>Net 7</option><option>Net 14</option><option>Net 30</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="s-address" style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Alamat Alamat</label>
                <input id="s-address" type="text" placeholder="Jl. Industri No. 5, Jakarta" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--color-primary)'} onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '11px 18px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--color-foreground)', transition: 'all 0.15s ease' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-muted)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >Batal</button>
                <button type="submit" disabled={submitting} style={{ padding: '11px 22px', borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: 'var(--color-on-primary)', fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.15s ease', opacity: submitting ? 0.7 : 1 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {submitting ? (editingId ? 'Menyimpan...' : 'Menambahkan...') : (editingId ? 'Simpan Perubahan' : 'Simpan Supplier')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
