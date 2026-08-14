import { useState, useEffect } from 'react';
import { purchasesApi } from '../api/endpoints/purchases';
import { suppliersApi } from '../api/endpoints/contacts';
import { productsApi } from '../api/endpoints/products';
import { useToast } from '../context/ToastContext';

function Icon({ name, size = 18, color = 'currentColor' }) {
  const s = { width: size, height: size, flexShrink: 0 };
  const p = { fill: 'none', stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', ...s, viewBox: '0 0 24 24', 'aria-hidden': 'true' };
  switch (name) {
    case 'plus':     return <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'minus':    return <svg {...p}><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'x':        return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case 'truck':    return <svg {...p}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
    case 'file':     return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case 'list':     return <svg {...p}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
    case 'check':    return <svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
    case 'trash':    return <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
    case 'spin':     return <svg {...p} style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12"/></svg>;
    default:         return <svg {...p}><circle cx="12" cy="12" r="4"/></svg>;
  }
}

const STATUS_STYLE = {
  received:  { label: 'Diterima', color: 'var(--color-success)', bg: 'color-mix(in srgb, var(--color-success) 12%, transparent)' },
  pending:   { label: 'Menunggu', color: 'var(--color-primary)', bg: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' },
  ordered:   { label: 'Diproses', color: 'var(--color-accent)', bg: 'color-mix(in srgb, var(--color-accent) 12%, transparent)' },
};

const EMPTY_ITEM = { product_id: '', quantity: 1, unit_cost: '' };

export default function PurchasesPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [poList, setPoList] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [formData, setFormData] = useState({ supplier_id: '', purchased_at: new Date().toISOString().split('T')[0], note: '' });
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [resPurchases, resSuppliers, resProducts] = await Promise.all([
        purchasesApi.list().catch(() => ({ data: { data: [] } })),
        suppliersApi.list().catch(() => ({ data: { data: [] } })),
        productsApi.list().catch(() => ({ data: { data: [] } })),
      ]);

      const fetchedPurchases = resPurchases.data?.data || resPurchases.data || [];
      const fetchedSuppliers = resSuppliers.data?.data || resSuppliers.data || [];
      const fetchedProducts = resProducts.data?.data || resProducts.data || [];

      setPoList(fetchedPurchases);
      setSuppliers(fetchedSuppliers);
      setProducts(fetchedProducts);

      if (fetchedSuppliers.length > 0 && !formData.supplier_id) {
        setFormData(prev => ({ ...prev, supplier_id: fetchedSuppliers[0].id }));
      }
    } catch (err) {
      console.error('Failed to load purchases page data:', err);
      addToast('Gagal memuat data dari server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalPO = poList.reduce((s, p) => s + (Number(p.grand_total || p.total) || 0), 0);
  const pendingPO = poList.filter(p => p.status === 'pending').reduce((s, p) => s + (Number(p.grand_total || p.total) || 0), 0);

  const addItem = () => setItems([...items, { ...EMPTY_ITEM }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx, field, val) => setItems(items.map((it, i) => i === idx ? { ...it, [field]: val } : it));

  const grandTotal = items.reduce((s, it) => s + (Number(it.quantity) * Number(it.unit_cost) || 0), 0);

  const handleSubmitPO = async (e) => {
    e.preventDefault();
    if (!formData.supplier_id && suppliers.length > 0) {
      addToast('Silakan pilih supplier terlebih dahulu', 'error');
      return;
    }
    if (!items[0].product_id || !items[0].unit_cost) {
      addToast('Silakan isi minimal 1 item produk dengan harga', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        supplier_id: Number(formData.supplier_id) || (suppliers[0]?.id || null),
        purchased_at: formData.purchased_at,
        notes: formData.note,
        items: items.map(it => ({
          product_id: Number(it.product_id),
          quantity: Number(it.quantity),
          unit_cost: Number(it.unit_cost),
        })),
      };

      await purchasesApi.create(payload);
      addToast('Purchase Order berhasil dibuat!', 'success');
      setItems([{ ...EMPTY_ITEM }]);
      setActiveTab('list');
      await loadData();
    } catch (err) {
      console.error('Create purchase error:', err);
      addToast(err.response?.data?.message || 'Gagal membuat Purchase Order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await purchasesApi.delete(id);
      addToast('Purchase order berhasil dibatalkan/dihapus', 'success');
      setConfirmDelete(null);
      setPoList(poList.filter(p => p.id !== id));
    } catch (err) {
      console.error('Delete purchase error:', err);
      addToast('Gagal menghapus purchase order', 'error');
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8,
    border: '1px solid var(--color-border)', background: 'var(--color-background)',
    color: 'var(--color-foreground)', fontSize: 'var(--text-sm, 0.875rem)', outline: 'none', transition: 'border-color 0.15s ease',
  };

  const tabBtn = (tab, icon, label) => {
    const active = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        aria-pressed={active}
        style={{
          padding: '9px 18px', borderRadius: 8, border: 'none',
          background: active ? 'var(--color-card)' : 'transparent',
          color: active ? 'var(--color-foreground)' : 'var(--color-muted-fg)',
          fontWeight: active ? 700 : 500, fontSize: 'var(--text-xs, 0.75rem)', cursor: 'pointer',
          boxShadow: active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
          display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.15s ease',
        }}
      >
        <Icon name={icon} size={14} color={active ? 'var(--color-primary)' : 'var(--color-muted-fg)'} />
        {label}
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-2xl, 1.5rem)', fontWeight: 800, color: 'var(--color-foreground)', letterSpacing: '-0.02em' }}>
            Pembelian &amp; Restock Supplier
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-muted-fg)' }}>
            Kelola purchase order, restock bahan baku, dan pantau pembayaran ke supplier.
          </p>
        </div>
        <div style={{ display: 'flex', background: 'var(--color-muted)', padding: 4, borderRadius: 12, gap: 2 }}>
          {tabBtn('list', 'list', 'Daftar PO')}
          {tabBtn('create', 'file', 'Buat PO Baru')}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total PO', value: loading ? '...' : poList.length, suffix: 'purchase order terdaftar', color: '#6366f1' },
          { label: 'Pending / Menunggu', value: loading ? '...' : `Rp ${pendingPO.toLocaleString('id-ID')}`, suffix: `${poList.filter(p => p.status === 'pending').length} PO belum lunas`, color: '#f59e0b' },
          { label: 'Total Nilai Pembelian', value: loading ? '...' : `Rp ${totalPO.toLocaleString('id-ID')}`, suffix: 'akumulasi pembelian', color: '#10b981' },
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
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: card.color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{card.value}</div>
            <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 6 }}>{card.suffix}</div>
          </div>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'list' ? (
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm, 0.875rem)' }}>
              <thead>
                <tr style={{ background: 'var(--color-muted)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted-fg)', fontSize: 'var(--text-xs, 0.75rem)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>No. PO</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Tanggal</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Supplier</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 48, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, color: 'var(--color-muted-fg)' }}>
                        <Icon name="spin" size={20} color="var(--color-primary)" />
                        <span>Memuat data purchase order dari API...</span>
                      </div>
                    </td>
                  </tr>
                ) : poList.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 48, textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <Icon name="file" size={36} color="var(--color-muted-fg)" />
                        <div style={{ fontWeight: 600, color: 'var(--color-muted-fg)' }}>Belum ada Purchase Order</div>
                        <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', opacity: 0.7 }}>Klik "Buat PO Baru" untuk mencatat restock supplier</div>
                      </div>
                    </td>
                  </tr>
                ) : poList.map(po => {
                  const statusKey = po.status || 'received';
                  const st = STATUS_STYLE[statusKey] || STATUS_STYLE.received;
                  const supplierName = po.supplier?.name || po.supplier?.company || po.supplier_name || 'Supplier';
                  const totalVal = Number(po.grand_total || po.total) || 0;
                  const dateStr = po.purchased_at || po.date || '-';
                  return (
                    <tr key={po.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s ease' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-muted)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--color-foreground)', fontVariantNumeric: 'tabular-nums' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ padding: 6, borderRadius: 7, background: 'var(--color-muted)' }}>
                            <Icon name="file" size={13} color="var(--color-muted-fg)" />
                          </div>
                          {po.invoice_number || `PO-${po.id}`}
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--color-muted-fg)', fontSize: 'var(--text-xs, 0.75rem)' }}>{dateStr}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Icon name="truck" size={14} color="var(--color-muted-fg)" />
                          <span style={{ fontWeight: 600 }}>{supplierName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 800, color: 'var(--color-foreground)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        Rp {totalVal.toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <button
                          onClick={() => confirmDelete === po.id ? handleDelete(po.id) : setConfirmDelete(po.id)}
                          onBlur={() => setConfirmDelete(null)}
                          aria-label="Hapus purchase order"
                          style={{ border: 'none', borderRadius: 7, width: 30, height: 30, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: confirmDelete === po.id ? '#ef4444' : 'var(--color-muted)' }}
                        >
                          <Icon name="trash" size={13} color={confirmDelete === po.id ? '#fff' : '#ef4444'} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Create PO Form */
        <form onSubmit={handleSubmitPO} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ margin: 0, fontSize: 'var(--text-base, 1rem)', fontWeight: 800, color: 'var(--color-foreground)' }}>Informasi Purchase Order</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              <div>
                <label htmlFor="po-supplier" style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Supplier <span style={{ color: '#ef4444' }}>*</span></label>
                <select id="po-supplier" value={formData.supplier_id} onChange={e => setFormData({ ...formData, supplier_id: e.target.value })} style={inputStyle}>
                  <option value="">-- Pilih Supplier --</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name || s.company}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="po-date" style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Tanggal PO</label>
                <input id="po-date" type="date" value={formData.purchased_at} onChange={e => setFormData({ ...formData, purchased_at: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="po-note" style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Catatan (Opsional)</label>
                <input id="po-note" type="text" placeholder="catatan tambahan..." value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--color-primary)'} onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--text-base, 1rem)', fontWeight: 800, color: 'var(--color-foreground)' }}>Item yang Dibeli</h3>
              <button type="button" onClick={addItem} style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700, fontSize: 'var(--text-xs, 0.75rem)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Icon name="plus" size={14} color="var(--color-primary)" /> Tambah Baris
              </button>
            </div>

            {/* Header Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 140px 120px 36px', gap: 8, padding: '0 4px' }}>
              {['Pilih Produk', 'Qty', 'Harga Satuan (Rp)', 'Subtotal', ''].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-muted-fg)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</div>
              ))}
            </div>

            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 140px 120px 36px', gap: 8, alignItems: 'center' }}>
                <select
                  required
                  value={item.product_id}
                  onChange={e => {
                    const prodId = e.target.value;
                    const found = products.find(p => p.id === Number(prodId));
                    updateItem(idx, 'product_id', prodId);
                    if (found && found.cost_price) {
                      updateItem(idx, 'unit_cost', found.cost_price);
                    }
                  }}
                  style={inputStyle}
                >
                  <option value="">-- Pilih Produk --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>
                  ))}
                </select>
                <input type="number" min="1" required value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} style={inputStyle} />
                <input type="number" min="0" required placeholder="150000" value={item.unit_cost} onChange={e => updateItem(idx, 'unit_cost', e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--color-primary)'} onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
                <div style={{ fontWeight: 800, fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-primary)', fontVariantNumeric: 'tabular-nums', padding: '10px 12px', background: 'var(--color-muted)', borderRadius: 8 }}>
                  Rp {(Number(item.quantity) * Number(item.unit_cost) || 0).toLocaleString('id-ID')}
                </div>
                <button type="button" onClick={() => removeItem(idx)} disabled={items.length === 1} aria-label="Hapus baris" style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: items.length === 1 ? 'transparent' : 'rgba(239,68,68,0.08)', cursor: items.length === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s ease' }}>
                  <Icon name="trash" size={14} color={items.length === 1 ? 'var(--color-border)' : '#ef4444'} />
                </button>
              </div>
            ))}

            <div style={{ borderTop: '2px dashed var(--color-border)', paddingTop: 14, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
              <span style={{ fontWeight: 700, color: 'var(--color-muted-fg)' }}>Grand Total:</span>
              <span style={{ fontWeight: 900, fontSize: 'var(--text-xl, 1.25rem)', color: 'var(--color-primary)', fontVariantNumeric: 'tabular-nums' }}>
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={() => setActiveTab('list')} style={{ padding: '12px 20px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--color-foreground)', transition: 'background 0.15s ease' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-muted)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >Batal</button>
            <button type="submit" disabled={submitting} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: 'var(--color-on-primary)', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(16,185,129,0.25)', transition: 'all 0.15s ease', opacity: submitting ? 0.7 : 1 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Icon name="check" size={16} color="var(--color-on-primary)" />
              {submitting ? 'Menyimpan PO...' : 'Buat Purchase Order'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
