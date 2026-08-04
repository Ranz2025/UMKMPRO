import { useState, useEffect, useRef } from 'react';
import { salesApi } from '../api/endpoints/sales';
import { productsApi } from '../api/endpoints/products';
import { Spinner } from '../components/ui/SharedUI';
import { useToast } from '../context/ToastContext';

// ── Icons ──────────────────────────────────────────────────────
function Icon({ name, size = 18, color = 'currentColor' }) {
  const p = { fill: 'none', stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', width: size, height: size, flexShrink: 0, viewBox: '0 0 24 24', 'aria-hidden': 'true' };
  switch (name) {
    case 'search':  return <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case 'plus':    return <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'minus':   return <svg {...p}><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'trash':   return <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
    case 'check':   return <svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
    case 'printer': return <svg {...p}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
    case 'x':       return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case 'receipt': return <svg {...p}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></svg>;
    case 'list':    return <svg {...p}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
    case 'cart':    return <svg {...p}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="4"/></svg>;
  }
}

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

const PAYMENT_METHODS = [
  { id: 'Tunai', label: 'Tunai', color: '#10b981' },
  { id: 'QRIS', label: 'QRIS', color: '#6366f1' },
  { id: 'Transfer', label: 'Transfer', color: '#f59e0b' },
];

// ── Struk Modal ────────────────────────────────────────────────
function ReceiptModal({ tx, onClose }) {
  const receiptRef = useRef(null);
  if (!tx) return null;
  const time = new Date(tx.created_at || tx.sold_at || Date.now()).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

  const handlePrint = () => {
    const content = receiptRef.current?.innerHTML;
    const w = window.open('', '_blank', 'width=380,height=600');
    w.document.write(`<html><head><title>Struk</title><style>body{font-family:monospace;font-size:13px;padding:16px;max-width:320px;margin:0 auto}hr{border:1px dashed #aaa}.row{display:flex;justify-content:space-between;margin:3px 0}.total{font-weight:bold;font-size:15px}.center{text-align:center}</style></head><body>${content}</body></html>`);
    w.document.close();
    w.print();
    w.close();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 28, width: '90%', maxWidth: 380, boxShadow: '0 25px 50px rgba(0,0,0,0.35)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Struk Digital</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted-fg)', display: 'flex' }}><Icon name="x" size={18} /></button>
        </div>

        <div ref={receiptRef} style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.7 }}>
          <p style={{ textAlign: 'center', fontWeight: 700, margin: '0 0 4px' }}>UMKMPRO</p>
          <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 11, color: 'var(--color-muted-fg)' }}>Struk Penjualan</p>
          <hr style={{ border: 'none', borderTop: '1px dashed var(--color-border)', margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>No</span><span>{tx.invoice_number || tx.id}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Waktu</span><span>{time}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pembayaran</span><span>{tx.payment_method || 'Tunai'}</span></div>
          {tx.customer_name && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pelanggan</span><span>{tx.customer_name}</span></div>}
          <hr style={{ border: 'none', borderTop: '1px dashed var(--color-border)', margin: '8px 0' }} />
          {(tx.items || []).map((item, i) => (
            <div key={i} style={{ marginBottom: 4 }}>
              <div style={{ fontWeight: 600 }}>{item.name || item.product_name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 8, color: 'var(--color-muted-fg)', fontSize: 12 }}>
                <span>{item.qty || item.quantity} x {fmt(item.price || item.unit_price)}</span>
                <span>{fmt((item.qty || item.quantity) * (item.price || item.unit_price))}</span>
              </div>
            </div>
          ))}
          <hr style={{ border: 'none', borderTop: '1px dashed var(--color-border)', margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 15 }}><span>TOTAL</span><span>{fmt(tx.grand_total || tx.total_amount)}</span></div>
          {tx.cash_received && tx.cash_received > (tx.grand_total || tx.total_amount) && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}><span>Tunai</span><span>{fmt(tx.cash_received)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Kembalian</span><span>{fmt(tx.cash_received - (tx.grand_total || tx.total_amount))}</span></div>
            </>
          )}
          <p style={{ textAlign: 'center', margin: '12px 0 0', fontSize: 11, color: 'var(--color-muted-fg)' }}>Terima kasih atas kunjungan Anda!</p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: 'var(--color-foreground)' }}>Tutup</button>
          <button onClick={handlePrint} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'var(--color-primary)', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'var(--color-on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="printer" size={16} color="var(--color-on-primary)" /> Cetak
          </button>
        </div>
      </div>
    </div>
  );
}

// ── POS Panel ──────────────────────────────────────────────────
function POSPanel({ products, loadingProducts, refreshProducts }) {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [payMethod, setPayMethod] = useState('Tunai');
  const [cashReceived, setCashReceived] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [receiptTx, setReceiptTx] = useState(null);
  const { addToast } = useToast();

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const total = cart.reduce((s, i) => s + (Number(i.selling_price) || 0) * i.qty, 0);
  const change = payMethod === 'Tunai' && Number(cashReceived) > total ? Number(cashReceived) - total : 0;

  const addToCart = (prod) => {
    const unitPrice = Number(prod.selling_price) || 0;
    setCart(prev => {
      const ex = prev.find(i => i.id === prod.id);
      if (ex) return prev.map(i => i.id === prod.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...prod, selling_price: unitPrice, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const clearCart = () => { setCart([]); setCashReceived(''); setCustomerName(''); };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);

    const payload = {
      payment_method: payMethod,
      items: cart.map(i => ({
        product_id: i.id,
        quantity: i.qty,
        unit_price: Number(i.selling_price) || 0,
      })),
      notes: customerName ? `Pelanggan: ${customerName}` : undefined,
    };

    try {
      const res = await salesApi.create(payload);
      const createdTx = res.data?.data || res.data || {};
      addToast('Transaksi penjualan berhasil!', 'success');

      const tx = {
        id: createdTx.invoice_number || createdTx.id || `INV-${Date.now().toString().slice(-8)}`,
        created_at: new Date().toISOString(),
        payment_method: payMethod,
        total_amount: total,
        cash_received: payMethod === 'Tunai' ? Number(cashReceived) || total : undefined,
        customer_name: customerName || 'Pelanggan Umum',
        items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.selling_price })),
      };

      setReceiptTx(tx);
      clearCart();
      if (refreshProducts) refreshProducts();
    } catch (err) {
      console.error('Checkout error:', err);
      addToast(err.response?.data?.message || 'Gagal memproses transaksi di server', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 16, height: 'calc(100vh - 140px)', minHeight: 560 }}>
      {/* Katalog Produk */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
              <Icon name="search" size={15} color="var(--color-muted-fg)" />
            </span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..." style={{ width: '100%', padding: '8px 10px 8px 34px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-muted)', color: 'var(--color-foreground)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {loadingProducts ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner size={24} /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
              {filtered.map(prod => (
                <button key={prod.id} onClick={() => addToCart(prod)} disabled={prod.stock <= 0}
                  style={{ padding: '12px 10px', borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-muted)', cursor: prod.stock <= 0 ? 'not-allowed' : 'pointer', textAlign: 'left', transition: 'all 0.15s ease', opacity: prod.stock <= 0 ? 0.5 : 1 }}
                  onMouseEnter={e => { if (prod.stock > 0) { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 8%, var(--color-muted))'; } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-muted)'; }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'color-mix(in srgb, var(--color-accent) 20%, var(--color-border))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <Icon name="cart" size={14} color="var(--color-accent)" />
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: 'var(--color-foreground)', lineHeight: 1.3 }}>{prod.name}</p>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>{fmt(prod.selling_price)}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: prod.stock <= 5 ? '#f59e0b' : 'var(--color-muted-fg)' }}>Stok: {prod.stock}</p>
                </button>
              ))}
              {filtered.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-muted-fg)', padding: '24px 0', fontSize: 14 }}>Produk tidak ditemukan</p>}
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-foreground)' }}>Keranjang ({cart.length} item)</span>
          {cart.length > 0 && <button onClick={clearCart} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 12, fontWeight: 600 }}>Kosongkan</button>}
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, color: 'var(--color-muted-fg)' }}>
              <Icon name="cart" size={32} color="var(--color-border)" />
              <p style={{ margin: 0, fontSize: 13 }}>Belum ada produk dipilih</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--color-muted)' }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--color-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--color-primary)', fontWeight: 700 }}>{fmt(item.selling_price * item.qty)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="minus" size={12} />
                    </button>
                    <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="plus" size={12} />
                    </button>
                    <button onClick={() => updateQty(item.id, -item.qty)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="trash" size={12} color="#ef4444" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Area */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nama pelanggan (opsional)" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-muted)', color: 'var(--color-foreground)', fontSize: 13, outline: 'none' }} />

          <div style={{ display: 'flex', gap: 6 }}>
            {PAYMENT_METHODS.map(m => (
              <button key={m.id} onClick={() => setPayMethod(m.id)} style={{ flex: 1, padding: '7px 4px', borderRadius: 8, border: '1.5px solid', borderColor: payMethod === m.id ? m.color : 'var(--color-border)', background: payMethod === m.id ? `color-mix(in srgb, ${m.color} 15%, var(--color-muted))` : 'var(--color-muted)', color: payMethod === m.id ? m.color : 'var(--color-muted-fg)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {m.label}
              </button>
            ))}
          </div>

          {payMethod === 'Tunai' && (
            <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} placeholder="Uang diterima (Rp)" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-muted)', color: 'var(--color-foreground)', fontSize: 13, outline: 'none' }} />
          )}

          <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: 'var(--color-muted-fg)' }}>{cart.reduce((s, i) => s + i.qty, 0)} item</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-foreground)' }}>{fmt(total)}</span>
            </div>
            {change > 0 && <p style={{ margin: '0 0 8px', fontSize: 13, color: '#10b981', fontWeight: 600 }}>Kembalian: {fmt(change)}</p>}
          </div>

          <button onClick={handleCheckout} disabled={cart.length === 0 || checkoutLoading}
            style={{ padding: '13px', borderRadius: 12, border: 'none', background: cart.length === 0 ? 'var(--color-border)' : 'var(--color-primary)', color: cart.length === 0 ? 'var(--color-muted-fg)' : 'var(--color-on-primary)', fontWeight: 800, fontSize: 15, cursor: cart.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s ease' }}>
            {checkoutLoading ? <Spinner size={18} color="var(--color-on-primary)" /> : <Icon name="check" size={18} color="var(--color-on-primary)" />}
            {checkoutLoading ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        </div>
      </div>

      {receiptTx && <ReceiptModal tx={receiptTx} onClose={() => setReceiptTx(null)} />}
    </div>
  );
}

// ── History Panel ─────────────────────────────────────────────
function HistoryPanel() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receiptTx, setReceiptTx] = useState(null);
  const { addToast } = useToast();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await salesApi.list({ per_page: 50 });
      const items = res.data?.data || res.data || [];
      setHistory(items);
    } catch (err) {
      console.error('Failed to fetch sales history:', err);
      addToast('Gagal memuat riwayat penjualan dari server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const totalToday = history.filter(t => (t.status || 'paid') === 'paid').reduce((s, t) => s + (Number(t.grand_total || t.total_amount) || 0), 0);
  const METHOD_COLOR = { Tunai: '#10b981', QRIS: '#6366f1', Transfer: '#f59e0b', Cash: '#10b981' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Penjualan Hari Ini', value: fmt(totalToday), color: 'var(--color-primary)' },
          { label: 'Jumlah Transaksi', value: `${history.length} transaksi`, color: '#3b82f6' },
          { label: 'Rata-rata / Transaksi', value: fmt(history.length ? Math.round(totalToday / history.length) : 0), color: '#10b981' },
        ].map((s, i) => (
          <div key={i} style={{ flex: '1 1 160px', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--color-muted-fg)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
            <p style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-foreground)' }}>Riwayat Transaksi Penjualan</h3>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner size={24} /></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  {['No. Invoice', 'Waktu', 'Pelanggan', 'Item', 'Metode', 'Total', 'Struk'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--color-muted-fg)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--color-muted-fg)' }}>
                      Belum ada riwayat transaksi penjualan
                    </td>
                  </tr>
                ) : history.map(tx => {
                  const dateVal = tx.created_at || tx.sold_at || Date.now();
                  const time = new Date(dateVal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                  const mc = METHOD_COLOR[tx.payment_method] || '#94a3b8';
                  const totalAmt = Number(tx.grand_total || tx.total_amount) || 0;
                  const invoiceNo = tx.invoice_number || `INV-${tx.id}`;
                  const itemCount = tx.items_count || (tx.items ? tx.items.length : 1);

                  return (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--color-border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-muted)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: 'var(--color-foreground)', fontFamily: 'var(--font-mono)' }}>{invoiceNo}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--color-muted-fg)' }}>{time}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--color-foreground)' }}>{tx.customer?.name || 'Pelanggan Umum'}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--color-muted-fg)' }}>{itemCount} item</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: `color-mix(in srgb, ${mc} 15%, transparent)`, color: mc }}>{tx.payment_method || 'Tunai'}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 700, color: 'var(--color-foreground)', whiteSpace: 'nowrap' }}>{fmt(totalAmt)}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <button onClick={() => setReceiptTx({ ...tx, customer_name: tx.customer?.name })} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'none', cursor: 'pointer', color: 'var(--color-foreground)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                          <Icon name="receipt" size={13} /> Lihat
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {receiptTx && <ReceiptModal tx={receiptTx} onClose={() => setReceiptTx(null)} />}
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────
export default function SalesPage() {
  const [tab, setTab] = useState('pos');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const { addToast } = useToast();

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await productsApi.list({ per_page: 100 });
      const items = res.data?.data || res.data || [];
      setProducts(items);
    } catch (err) {
      console.error('Failed to fetch products for POS:', err);
      addToast('Gagal memuat katalog produk', 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-foreground)', letterSpacing: '-0.02em' }}>Penjualan &amp; Kasir</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--color-muted-fg)' }}>Catat transaksi baru atau lihat riwayat penjualan hari ini.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ id: 'pos', label: 'Kasir / POS', icon: 'cart' }, { id: 'history', label: 'Riwayat', icon: 'list' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, border: '1px solid', borderColor: tab === t.id ? 'var(--color-primary)' : 'var(--color-border)', background: tab === t.id ? 'color-mix(in srgb, var(--color-primary) 12%, var(--color-muted))' : 'var(--color-card)', color: tab === t.id ? 'var(--color-primary)' : 'var(--color-muted-fg)', fontWeight: tab === t.id ? 700 : 500, fontSize: 14, cursor: 'pointer' }}>
              <Icon name={t.icon} size={15} color={tab === t.id ? 'var(--color-primary)' : 'var(--color-muted-fg)'} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'pos' ? (
        <POSPanel products={products} loadingProducts={loadingProducts} refreshProducts={fetchProducts} />
      ) : (
        <HistoryPanel />
      )}
    </div>
  );
}
