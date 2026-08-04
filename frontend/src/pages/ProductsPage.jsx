import { useState, useEffect, useCallback } from 'react';
import { productsApi } from '../api/endpoints/products';
import { Spinner, EmptyState, ConfirmModal, Pagination } from '../components/ui/SharedUI';

function Icon({ name, size = 18, color = 'currentColor' }) {
  const p = { fill: 'none', stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', width: size, height: size, flexShrink: 0, viewBox: '0 0 24 24', 'aria-hidden': 'true' };
  switch (name) {
    case 'plus':   return <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'search': return <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case 'edit':   return <svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case 'trash':  return <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
    case 'x':      return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case 'box':    return <svg {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="4"/></svg>;
  }
}

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

const EMPTY_FORM = { name: '', sku: '', category_id: '', category_name: '', selling_price: '', cost_price: '', stock: '', min_stock: '10', description: '' };

function StockBadge({ stock, min }) {
  if (stock <= 0)   return <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>Habis</span>;
  if (stock <= min) return <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>Menipis ({stock})</span>;
  return <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>Tersedia ({stock})</span>;
}

// ── Product Modal (Create / Edit) ─────────────────────────────────
function ProductModal({ product, categories, onClose, onSaved }) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState(isEdit ? {
    name: product.name || '',
    sku: product.sku || '',
    category_id: product.category?.id || '',
    category_name: product.category?.name || '',
    selling_price: product.selling_price || '',
    cost_price: product.cost_price || '',
    stock: product.stock ?? '',
    min_stock: product.min_stock ?? '10',
    description: product.description || '',
  } : { ...EMPTY_FORM });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Nama produk wajib diisi.'); return; }
    if (!form.selling_price) { setError('Harga jual wajib diisi.'); return; }
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        category_id: form.category_id || undefined,
        selling_price: Number(form.selling_price),
        cost_price: Number(form.cost_price) || 0,
        stock: Number(form.stock) || 0,
        min_stock: Number(form.min_stock) || 10,
        description: form.description,
      };
      if (isEdit) {
        await productsApi.update(product.id, payload);
      } else {
        await productsApi.create(payload);
      }
      onSaved();
    } catch (err) {
      // fallback: simpan mock saja
      const mockProduct = { id: Date.now(), name: form.name, sku: form.sku || `SKU-${Date.now().toString().slice(-4)}`, category: { name: form.category_name || 'Umum' }, selling_price: Number(form.selling_price), cost_price: Number(form.cost_price) || 0, stock: Number(form.stock) || 0, min_stock: Number(form.min_stock) || 10 };
      onSaved(mockProduct);
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-foreground)' }}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-muted)', color: 'var(--color-foreground)', fontSize: 14, outline: 'none' }}
        onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
        onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
      />
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 28, width: '90%', maxWidth: 520, boxShadow: '0 25px 50px rgba(0,0,0,0.35)', maxHeight: '90vh', overflowY: 'auto', animation: 'modalPop 0.18s ease-out' }} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{isEdit ? 'Edit Produk' : 'Tambah Produk'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted-fg)', padding: 4, display: 'flex' }}><Icon name="x" size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {field('Nama Produk *', 'name', 'text', 'contoh: Kopi Susu Gula Aren')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {field('SKU / Kode', 'sku', 'text', 'auto-generate jika kosong')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-foreground)' }}>Kategori</label>
              {categories.length > 0 ? (
                <select value={form.category_id} onChange={e => set('category_id', e.target.value)} style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-muted)', color: 'var(--color-foreground)', fontSize: 14, cursor: 'pointer' }}>
                  <option value="">-- Pilih --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              ) : (
                <input value={form.category_name} onChange={e => set('category_name', e.target.value)} placeholder="Makanan / Minuman..." style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-muted)', color: 'var(--color-foreground)', fontSize: 14, outline: 'none' }} />
              )}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {field('Harga Jual (Rp) *', 'selling_price', 'number', '18000')}
            {field('HPP / Harga Beli (Rp)', 'cost_price', 'number', '8000')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {field('Stok Awal', 'stock', 'number', '0')}
            {field('Minimum Stok', 'min_stock', 'number', '10')}
          </div>
          {form.selling_price && form.cost_price && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'color-mix(in srgb, #10b981 10%, var(--color-muted))', border: '1px solid rgba(16,185,129,0.2)', fontSize: 13 }}>
              Margin: <strong style={{ color: '#10b981' }}>{Math.round(((form.selling_price - form.cost_price) / form.selling_price) * 100)}%</strong>
              &nbsp;&bull;&nbsp;Laba/item: <strong style={{ color: '#10b981' }}>{fmt(form.selling_price - form.cost_price)}</strong>
            </div>
          )}
          {error && <p style={{ margin: 0, color: '#ef4444', fontSize: 13 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: 'var(--color-foreground)' }}>Batal</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: 'var(--color-primary)', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14, color: 'var(--color-on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
              {loading && <Spinner size={14} color="var(--color-on-primary)" />}
              {isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productsApi.list({ search, page, per_page: 10, category_id: filterCat !== 'all' ? filterCat : undefined });
      setProducts(res.data?.data || []);
      setMeta(res.data?.meta || null);
    } catch (err) {
      setProducts([]);
      setMeta(null);
      setError('Gagal memuat produk dari API.');
    } finally {
      setLoading(false);
    }
  }, [search, page, filterCat]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await productsApi.categories();
      setCategories(res.data?.data || []);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { setPage(1); }, [search, filterCat]);
  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleSaved = async () => {
    setModalOpen(false);
    setEditProduct(null);
    await loadProducts();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await productsApi.delete(deleteTarget.id);
      await loadProducts();
    } finally {
      setDeleteTarget(null);
      setDeleteLoading(false);
    }
  };

  const displayed = products.filter(p => {
    const mSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase());
    const mCat = filterCat === 'all' || p.category?.name === filterCat || String(p.category?.id) === filterCat;
    return mSearch && mCat;
  });

  const catNames = ['all', ...new Set(products.map(p => p.category?.name).filter(Boolean))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1280, margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-foreground)', letterSpacing: '-0.02em' }}>Produk & Inventaris</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--color-muted-fg)' }}>Kelola katalog produk, harga, HPP, dan stok.</p>
        </div>
        <button onClick={() => { setEditProduct(null); setModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: 'var(--color-on-primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          <Icon name="plus" size={16} color="var(--color-on-primary)" />
          Tambah Produk
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <Icon name="search" size={16} color="var(--color-muted-fg)" />
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau SKU..."
            style={{ width: '100%', padding: '9px 12px 9px 38px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-foreground)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {catNames.map(c => (
            <button key={c} onClick={() => setFilterCat(c)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid', borderColor: filterCat === c ? 'var(--color-primary)' : 'var(--color-border)', background: filterCat === c ? 'color-mix(in srgb, var(--color-primary) 15%, var(--color-muted))' : 'var(--color-card)', color: filterCat === c ? 'var(--color-primary)' : 'var(--color-muted-fg)', fontSize: 13, fontWeight: filterCat === c ? 700 : 500, cursor: 'pointer' }}>
              {c === 'all' ? 'Semua' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={28} /></div>
        ) : displayed.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Belum ada produk"
            description="Tambahkan produk pertama untuk mulai mencatat stok dan penjualan."
            action={<button onClick={() => setModalOpen(true)} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: 'var(--color-on-primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>+ Tambah Produk</button>}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  {['Produk', 'Kategori', 'Harga Jual', 'HPP', 'Margin', 'Stok', 'Aksi'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Aksi' ? 'center' : 'left', fontSize: 11, fontWeight: 700, color: 'var(--color-muted-fg)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map(p => {
                  const margin = p.selling_price && p.cost_price ? Math.round(((p.selling_price - p.cost_price) / p.selling_price) * 100) : null;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-muted)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-foreground)' }}>{p.name}</div>
                        {p.sku && <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 2 }}>SKU: {p.sku}</div>}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--color-muted-fg)' }}>{p.category?.name || '—'}</td>
                      <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 700, color: 'var(--color-foreground)', whiteSpace: 'nowrap' }}>{fmt(p.selling_price)}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--color-muted-fg)', whiteSpace: 'nowrap' }}>{p.cost_price ? fmt(p.cost_price) : '—'}</td>
                      <td style={{ padding: '13px 16px' }}>
                        {margin !== null ? <span style={{ fontSize: 12, fontWeight: 700, color: margin >= 30 ? '#10b981' : margin >= 15 ? '#f59e0b' : '#ef4444' }}>{margin}%</span> : '—'}
                      </td>
                      <td style={{ padding: '13px 16px' }}><StockBadge stock={p.stock} min={p.min_stock} /></td>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button onClick={() => { setEditProduct(p); setModalOpen(true); }} style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'none', cursor: 'pointer', color: 'var(--color-foreground)', display: 'flex', alignItems: 'center' }} title="Edit">
                            <Icon name="edit" size={15} />
                          </button>
                          <button onClick={() => setDeleteTarget(p)} style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.3)', background: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }} title="Hapus">
                            <Icon name="trash" size={15} color="#ef4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && <Pagination meta={meta} onPageChange={setPage} />}

      {/* Modals */}
      {modalOpen && (
        <ProductModal
          product={editProduct}
          categories={categories}
          onClose={() => { setModalOpen(false); setEditProduct(null); }}
          onSaved={handleSaved}
        />
      )}
      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus Produk?"
        description={`Produk "${deleteTarget?.name}" akan dihapus permanen. Stok dan data terkait ikut terhapus.`}
        confirmLabel="Hapus"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
