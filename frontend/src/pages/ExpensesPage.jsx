import { useState, useEffect } from 'react';
import { expensesApi } from '../api/endpoints/expenses';
import { useToast } from '../context/ToastContext';

function Icon({ name, size = 18, color = 'currentColor' }) {
  const s = { width: size, height: size, flexShrink: 0 };
  const p = { fill: 'none', stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', ...s, viewBox: '0 0 24 24', 'aria-hidden': 'true' };
  switch (name) {
    case 'plus':    return <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'x':       return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case 'receipt': return <svg {...p}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/></svg>;
    case 'trash':   return <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
    case 'spin':    return <svg {...p} style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12"/></svg>;
    default:        return <svg {...p}><circle cx="12" cy="12" r="4"/></svg>;
  }
}

const CATEGORIES = ['Semua', 'Listrik & Air', 'Gaji & SDM', 'Sewa', 'Bahan Baku', 'Lainnya'];

const CAT_COLORS = {
  'Listrik & Air': { color: 'var(--color-accent)',      bg: 'color-mix(in srgb, var(--color-accent) 12%, transparent)' },
  'Gaji & SDM':    { color: 'var(--color-accent)',      bg: 'color-mix(in srgb, var(--color-accent) 12%, transparent)' },
  'Sewa':          { color: 'var(--color-primary)',     bg: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' },
  'Bahan Baku':    { color: 'var(--color-success)',     bg: 'color-mix(in srgb, var(--color-success) 12%, transparent)' },
  'Lainnya':       { color: 'var(--color-muted-fg)',    bg: 'var(--color-muted)' },
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formData, setFormData] = useState({
    category: 'Listrik & Air', desc: '', amount: '', method: 'Transfer',
    date: new Date().toISOString().split('T')[0],
  });
  const { addToast } = useToast();

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await expensesApi.list();
      const items = res.data?.data || res.data || [];
      setExpenses(items);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      addToast('Gagal memuat data pengeluaran dari server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filtered = activeFilter === 'Semua' ? expenses : expenses.filter(e => e.category === activeFilter);
  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const avgDaily = Math.round(totalExpenses / 30);

  // Top 3 categories for bar viz
  const byCategory = CATEGORIES.slice(1).map(cat => ({
    cat, total: expenses.filter(e => (e.category || 'Lainnya') === cat).reduce((s, e) => s + (Number(e.amount) || 0), 0),
  })).sort((a, b) => b.total - a.total).slice(0, 3);
  const maxCat = byCategory[0]?.total || 1;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.desc || !formData.amount) return;

    setSubmitting(true);
    try {
      const payload = {
        category: formData.category,
        description: formData.desc,
        amount: Number(formData.amount),
        payment_method: formData.method,
        expense_date: formData.date,
      };
      await expensesApi.create(payload);
      addToast('Pengeluaran baru berhasil dicatat', 'success');
      setIsModalOpen(false);
      setFormData({ category: 'Listrik & Air', desc: '', amount: '', method: 'Transfer', date: new Date().toISOString().split('T')[0] });
      await fetchExpenses();
    } catch (err) {
      console.error('Save expense error:', err);
      addToast(err.response?.data?.message || 'Gagal menyimpan pengeluaran', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await expensesApi.delete(id);
      addToast('Pengeluaran berhasil dihapus', 'success');
      setConfirmDelete(null);
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (err) {
      console.error('Delete expense error:', err);
      addToast('Gagal menghapus pengeluaran', 'error');
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 8,
    border: '1px solid var(--color-border)', background: 'var(--color-background)',
    color: 'var(--color-foreground)', fontSize: 'var(--text-sm, 0.875rem)', outline: 'none', transition: 'border-color 0.15s ease',
  };

  const biggestCategory = byCategory[0]?.cat || '-';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-2xl, 1.5rem)', fontWeight: 800, color: 'var(--color-foreground)', letterSpacing: '-0.02em' }}>
            Pengeluaran Operasional
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-muted-fg)' }}>
            Catat dan pantau semua beban operasional harian toko Anda secara terstruktur.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          aria-label="Catat pengeluaran baru"
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
          Catat Pengeluaran
        </button>
      </div>

      {/* Stat Cards + Bar Viz */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 18, borderLeft: '3px solid var(--color-destructive)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-muted-fg)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Total Pengeluaran</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-destructive)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {loading ? '...' : `Rp ${totalExpenses.toLocaleString('id-ID')}`}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 6 }}>{expenses.length} entri pengeluaran</div>
        </div>
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 18, borderLeft: '3px solid var(--color-primary)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-muted-fg)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Pengeluaran Terbesar</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>{biggestCategory}</div>
          <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 6 }}>
            {loading ? '...' : `Rp ${(byCategory[0]?.total || 0).toLocaleString('id-ID')}`}
          </div>
        </div>
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 18, borderLeft: '3px solid var(--color-accent)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-muted-fg)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Rata-rata Harian</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-accent)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {loading ? '...' : `Rp ${avgDaily.toLocaleString('id-ID')}`}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 6 }}>estimasi 30 hari terakhir</div>
        </div>

        {/* Category Bar Chart */}
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 18, boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-muted-fg)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Kategori</div>
          {byCategory.map(({ cat, total }) => {
            const cs = CAT_COLORS[cat] || CAT_COLORS['Lainnya'];
            const pct = Math.round((total / maxCat) * 100);
            return (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-foreground)' }}>{cat}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: cs.color, fontVariantNumeric: 'tabular-nums' }}>Rp {total.toLocaleString('id-ID')}</span>
                </div>
                <div style={{ height: 6, background: 'var(--color-muted)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: cs.color, borderRadius: 99, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => {
          const active = activeFilter === cat;
          const cs = cat !== 'Semua' ? (CAT_COLORS[cat] || CAT_COLORS['Lainnya']) : { color: 'var(--color-primary)', bg: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' };
          return (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              aria-pressed={active}
              style={{
                padding: '7px 14px', borderRadius: 99, border: `1px solid ${active ? cs.color : 'var(--color-border)'}`,
                background: active ? cs.bg : 'transparent',
                color: active ? cs.color : 'var(--color-muted-fg)',
                fontWeight: active ? 700 : 500, fontSize: 'var(--text-xs, 0.75rem)', cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
              {cat !== 'Semua' && (
                <span style={{ marginLeft: 6, fontSize: 10, fontVariantNumeric: 'tabular-nums' }}>
                  ({expenses.filter(e => (e.category || 'Lainnya') === cat).length})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Expenses Table */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm, 0.875rem)' }}>
            <thead>
              <tr style={{ background: 'var(--color-muted)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted-fg)', fontSize: 'var(--text-xs, 0.75rem)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Tanggal</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Kategori</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Keterangan</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Metode Bayar</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}>Jumlah</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, color: 'var(--color-muted-fg)' }}>
                      <Icon name="spin" size={20} color="var(--color-primary)" />
                      <span>Memuat data pengeluaran dari API...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <Icon name="receipt" size={34} color="var(--color-muted-fg)" />
                      <div style={{ fontWeight: 600, color: 'var(--color-muted-fg)' }}>Belum ada pengeluaran untuk kategori ini</div>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(exp => {
                const category = exp.category || 'Lainnya';
                const cs = CAT_COLORS[category] || CAT_COLORS['Lainnya'];
                const amount = Number(exp.amount) || 0;
                const dateStr = exp.expense_date || exp.date || '-';
                return (
                  <tr key={exp.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s ease' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-muted)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 20px', color: 'var(--color-muted-fg)', fontSize: 'var(--text-xs, 0.75rem)' }}>{dateStr}</td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: cs.bg, color: cs.color }}>{category}</span>
                    </td>
                    <td style={{ padding: '13px 20px', fontWeight: 600, color: 'var(--color-foreground)' }}>{exp.description || exp.desc || '-'}</td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>{exp.payment_method || exp.method || 'Transfer'}</span>
                    </td>
                    <td style={{ padding: '13px 20px', fontWeight: 800, color: 'var(--color-destructive)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      −Rp {amount.toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '13px 20px', textAlign: 'center' }}>
                      <button
                        onClick={() => confirmDelete === exp.id ? handleDelete(exp.id) : setConfirmDelete(exp.id)}
                        onBlur={() => setConfirmDelete(null)}
                        aria-label="Hapus pengeluaran"
                        style={{ border: 'none', borderRadius: 'var(--radius-sm)', width: 30, height: 30, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: confirmDelete === exp.id ? 'var(--color-destructive)' : 'var(--color-muted)' }}
                      >
                        <Icon name="trash" size={13} color={confirmDelete === exp.id ? 'var(--color-on-primary)' : 'var(--color-destructive)'} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div
          role="dialog" aria-modal="true" aria-label="Catat pengeluaran baru"
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 20, width: '100%', maxWidth: 480, padding: 28, boxShadow: '0 24px 48px -12px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 'var(--text-lg, 1.125rem)', fontWeight: 800, color: 'var(--color-foreground)' }}>Catat Pengeluaran Baru</h2>
              <button onClick={() => setIsModalOpen(false)} aria-label="Tutup" style={{ background: 'var(--color-muted)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="x" size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label htmlFor="exp-cat" style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Kategori <span style={{ color: '#ef4444' }}>*</span></label>
                  <select id="exp-cat" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={inputStyle}>
                    {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="exp-method" style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Metode Bayar</label>
                  <select id="exp-method" value={formData.method} onChange={e => setFormData({ ...formData, method: e.target.value })} style={inputStyle}>
                    <option>Transfer</option><option>Tunai</option><option>QRIS</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="exp-desc" style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Keterangan <span style={{ color: '#ef4444' }}>*</span></label>
                <input id="exp-desc" type="text" required placeholder="contoh: Tagihan Listrik PLN Agustus" value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--color-primary)'} onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label htmlFor="exp-amount" style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Jumlah (Rp) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input id="exp-amount" type="number" required min="0" placeholder="450000" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--color-primary)'} onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
                </div>
                <div>
                  <label htmlFor="exp-date" style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Tanggal</label>
                  <input id="exp-date" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '11px 18px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--color-foreground)', transition: 'all 0.15s ease' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-muted)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >Batal</button>
                <button type="submit" disabled={submitting} style={{ padding: '11px 22px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.15s ease', opacity: submitting ? 0.7 : 1 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
