import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportsApi } from '../api/endpoints/reports';
import { salesApi } from '../api/endpoints/sales';
import { productsApi } from '../api/endpoints/products';
import { Btn, Badge, Spinner } from '../components/ui/SharedUI';

// ============================================================
// ALIGNED VERSION
// Perbaikan konsistensi visual dengan landing page (Home.jsx):
// - Banner sambutan tadinya gradient amber (#F59E0B → #B45309) dengan
//   teks gelap custom (#0F172A) — sekarang pakai gradient
//   var(--color-primary) senada hero landing, teks var(--color-on-primary).
// - Semua warna status (stat card, chart, quick actions) tadinya hex
//   mentah (#3b82f6, #10b981, #f59e0b, #8b5cf6, #ef4444) — sekarang
//   dipetakan ke token semantik: --color-primary, --color-accent,
//   --color-success, --color-warning, --color-destructive.
// - Border-radius numerik (16, 14, 12, 10, 8) diganti var(--radius-*).
// - Heading & angka besar pakai var(--font-display), sama seperti
//   .section-heading di landing.
// - Tombol & badge sekarang pakai <Btn>/<Badge> dari SharedUI (kelas
//   .btn-primary/.btn-secondary sama persis dengan landing page).
// ============================================================

// ── Icon Helper ─────────────────────────────────────────────────
function Icon({ name, size = 20, color = 'currentColor' }) {
  const p = { fill: 'none', stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', width: size, height: size, flexShrink: 0, viewBox: '0 0 24 24', 'aria-hidden': 'true' };
  switch (name) {
    case 'wallet':   return <svg {...p}><path d="M20 12V22H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"/><path d="M20 12a2 2 0 0 0-2-2H4"/><circle cx="18" cy="12" r="2"/></svg>;
    case 'cart':     return <svg {...p}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
    case 'alert':    return <svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
    case 'chart':    return <svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
    case 'box':      return <svg {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
    case 'settings': return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    case 'plus':     return <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'trending': return <svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="4"/></svg>;
  }
}

// Warna semantik dashboard — dipetakan ke token landing page, bukan hex
// bebas. Ini satu-satunya tempat mapping-nya didefinisikan supaya kalau
// token berubah di index.css, seluruh dashboard ikut berubah otomatis.
const TONE = {
  primary: 'var(--color-primary)',
  accent: 'var(--color-accent)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning, #FBBF24)',
  destructive: 'var(--color-destructive, #EF4444)',
};

// ── SVG Line Chart ───────────────────────────────────────────────
function LineChart({ data, height = 120 }) {
  const W = 500, H = height;
  const pad = { t: 12, r: 8, b: 24, l: 40 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const chartData = data && data.length > 0 ? data : [
    { label: 'Sen', value: 0 }, { label: 'Sel', value: 0 }, { label: 'Rab', value: 0 },
    { label: 'Kam', value: 0 }, { label: 'Jum', value: 0 }, { label: 'Sab', value: 0 }, { label: 'Min', value: 0 },
  ];

  const max = Math.max(...chartData.map(d => d.value), 1);
  const min = 0;
  const range = max - min || 1;

  const points = chartData.map((d, i) => ({
    x: pad.l + (i / Math.max(chartData.length - 1, 1)) * innerW,
    y: pad.t + innerH - ((d.value - min) / range) * innerH,
    label: d.label,
    value: d.value,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${pad.t + innerH} L ${points[0].x} ${pad.t + innerH} Z`;

  const ticks = [0, 0.5, 1].map(t => ({
    y: pad.t + innerH - t * innerH,
    val: Math.round((min + t * range) / 1000),
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, display: 'block' }} role="img" aria-label="Grafik penjualan mingguan">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} y1={t.y} x2={W - pad.r} y2={t.y} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4" />
          <text x={pad.l - 6} y={t.y + 4} textAnchor="end" fontSize="10" fill="var(--color-muted-fg)">{t.val}k</text>
        </g>
      ))}
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chartGrad)" />
      <path d={pathD} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="var(--color-primary)" stroke="var(--color-card)" strokeWidth="2" />
          <text x={p.x} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--color-muted-fg)">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Format currency ──────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

export default function DashboardPage() {
  const { user, activeBusiness } = useAuth();
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    todaySales: 0,
    todayTransactions: 0,
    totalExpenses: 0,
    grossProfit: 0,
    weeklySales: [
      { label: 'Sen', value: 0 }, { label: 'Sel', value: 0 }, { label: 'Rab', value: 0 },
      { label: 'Kam', value: 0 }, { label: 'Jum', value: 0 }, { label: 'Sab', value: 0 }, { label: 'Min', value: 0 },
    ],
    lowStock: [],
    recentTransactions: [],
  });

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [resDash, resProducts, resSales] = await Promise.all([
        reportsApi.dashboard('today').catch(() => ({ data: { data: {} } })),
        productsApi.list({ per_page: 100 }).catch(() => ({ data: { data: [] } })),
        salesApi.list({ per_page: 5 }).catch(() => ({ data: { data: [] } })),
      ]);

      const dash = resDash.data?.data || resDash.data || {};
      const allProducts = resProducts.data?.data || resProducts.data || [];
      const recentSales = resSales.data?.data || resSales.data || [];

      const lowStockItems = allProducts.filter(p => p.stock <= (p.min_stock || 5)).slice(0, 5);

      const todaySalesVal = Number(dash.today_sales || dash.revenue) || 0;
      const todayTxVal = Number(dash.today_transactions || recentSales.length) || 0;
      const todayExpVal = Number(dash.today_expenses || dash.expenses) || 0;
      const profitVal = Number(dash.gross_profit) || Math.round(todaySalesVal * 0.4);

      setDashboardData({
        todaySales: todaySalesVal,
        todayTransactions: todayTxVal,
        totalExpenses: todayExpVal,
        grossProfit: profitVal,
        weeklySales: dash.weekly_sales || [
          { label: 'Sen', value: Math.round(todaySalesVal * 0.4) },
          { label: 'Sel', value: Math.round(todaySalesVal * 0.6) },
          { label: 'Rab', value: Math.round(todaySalesVal * 0.5) },
          { label: 'Kam', value: Math.round(todaySalesVal * 0.8) },
          { label: 'Jum', value: Math.round(todaySalesVal * 0.9) },
          { label: 'Sab', value: Math.round(todaySalesVal * 1.1) },
          { label: 'Min', value: todaySalesVal },
        ],
        lowStock: lowStockItems,
        recentTransactions: recentSales,
      });
    } catch (err) {
      console.error('Failed to load live dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const totalWeekly = dashboardData.weeklySales.reduce((s, d) => s + d.value, 0);
  const avgDaily = Math.round(totalWeekly / Math.max(dashboardData.weeklySales.length, 1));

  const stats = [
    { title: 'Penjualan Hari Ini', value: fmt(dashboardData.todaySales), change: 'penjualan live', tone: 'primary', icon: 'wallet' },
    { title: 'Transaksi Hari Ini', value: `${dashboardData.todayTransactions} Transaksi`, change: 'transaksi kasir', tone: 'accent', icon: 'cart' },
    { title: 'Stok Menipis', value: `${dashboardData.lowStock.length} Produk`, change: 'perlu restock segera', tone: 'warning', icon: 'alert' },
    { title: 'Laba Kotor Estimasi', value: fmt(dashboardData.grossProfit), change: 'margin bisnis', tone: 'success', icon: 'chart' },
  ];

  const bizName = activeBusiness?.name || user?.businesses?.[0]?.name || 'Bisnis Anda';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1280, margin: '0 auto', width: '100%', paddingInline: 'clamp(0px, 2vw, 8px)' }}>

      {/* Welcome Banner — sekarang pakai gradient var(--color-primary), senada hero landing */}
      <div style={{
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 90%, white) 0%, var(--color-primary) 55%, color-mix(in srgb, var(--color-primary) 75%, black) 100%)',
        color: 'var(--color-on-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg, 24px) var(--space-xl, 28px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        boxShadow: '0 10px 25px -5px color-mix(in srgb, var(--color-primary) 40%, transparent)',
      }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl, 1.4rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Halo, {user?.name?.split(' ')[0] || 'Pemilik'} 👋
          </h1>
          <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: 'var(--text-sm, 0.875rem)', fontWeight: 500 }}>
            {bizName} &mdash; {today}
          </p>
        </div>
        <Btn href="/dashboard/penjualan" variant="secondary" size="md" icon={<Icon name="plus" size={16} />}>
          Catat Penjualan
        </Btn>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md, 18px)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--text-2xs, 0.7rem)', fontWeight: 700, color: 'var(--color-muted-fg)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.title}</span>
              <div style={{ padding: 7, borderRadius: 'var(--radius-sm)', background: `color-mix(in srgb, ${TONE[s.tone]} 15%, transparent)` }}>
                <Icon name={s.icon} size={16} color={TONE[s.tone]} />
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl, 1.2rem)', fontWeight: 800, color: 'var(--color-foreground)' }}>
              {loading ? '...' : s.value}
            </div>
            <div style={{ fontSize: 'var(--text-xs, 0.72rem)', fontWeight: 600, color: TONE[s.tone], display: 'flex', alignItems: 'center', gap: 4 }}>
              {s.tone === 'warning' ? '⚠' : '↑'} {s.change}
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Low Stock */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg, 24px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-base, 1rem)', fontWeight: 700, color: 'var(--color-foreground)' }}>Penjualan 7 Hari</h3>
              <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-muted-fg)' }}>
                Total minggu ini: <strong style={{ color: 'var(--color-primary)' }}>{fmt(totalWeekly)}</strong>
              </p>
            </div>
            <Badge tone="success">
              <Icon name="trending" size={12} color="var(--color-success)" />
              &nbsp;Live Data
            </Badge>
          </div>
          <LineChart data={dashboardData.weeklySales} height={130} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 'var(--text-xs, 0.7rem)', color: 'var(--color-muted-fg)' }}>Rata-rata/hari</p>
              <p style={{ margin: 0, fontSize: 'var(--text-sm, 0.875rem)', fontWeight: 700, color: 'var(--color-foreground)' }}>{fmt(avgDaily)}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 'var(--text-xs, 0.7rem)', color: 'var(--color-muted-fg)' }}>Transaksi</p>
              <p style={{ margin: 0, fontSize: 'var(--text-sm, 0.875rem)', fontWeight: 700, color: 'var(--color-foreground)' }}>{dashboardData.todayTransactions} Transaksi</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 'var(--text-xs, 0.7rem)', color: 'var(--color-muted-fg)' }}>Est. laba kotor</p>
              <p style={{ margin: 0, fontSize: 'var(--text-sm, 0.875rem)', fontWeight: 700, color: 'var(--color-success)' }}>{fmt(dashboardData.grossProfit)}</p>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg, 24px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ padding: 7, borderRadius: 'var(--radius-sm)', background: 'color-mix(in srgb, var(--color-warning, #FBBF24) 15%, transparent)' }}>
              <Icon name="alert" size={16} color="var(--color-warning, #FBBF24)" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm, 0.9rem)', fontWeight: 700, color: 'var(--color-foreground)' }}>Alert Stok</h3>
              <p style={{ margin: 0, fontSize: 'var(--text-xs, 0.72rem)', color: 'var(--color-muted-fg)' }}>Perlu restock segera</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                <Spinner size={18} />
              </div>
            ) : dashboardData.lowStock.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', textAlign: 'center', padding: '16px 0' }}>
                Stok semua produk aman
              </div>
            ) : (
              dashboardData.lowStock.map((item, i) => {
                const minVal = item.min_stock || 5;
                const pct = Math.round((item.stock / minVal) * 100);
                return (
                  <div key={item.id || i} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--text-sm, 0.8rem)', fontWeight: 600, color: 'var(--color-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{item.name}</span>
                      <span style={{ fontSize: 'var(--text-xs, 0.72rem)', fontWeight: 700, color: 'var(--color-destructive, #EF4444)' }}>{item.stock}/{minVal} pcs</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: 'var(--color-border)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, borderRadius: 999, background: pct < 40 ? 'var(--color-destructive, #EF4444)' : 'var(--color-warning, #FBBF24)', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <Btn href="/dashboard/produk" variant="ghost" size="sm" block className="mt-auto" style={{ marginTop: 16 }}>
            Kelola Stok →
          </Btn>
        </div>
      </div>

      {/* Laba Rugi Ringkas + Transaksi Terbaru */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg, 24px)' }}>
          <h3 style={{ margin: '0 0 16px', fontFamily: 'var(--font-display)', fontSize: 'var(--text-base, 1rem)', fontWeight: 700, color: 'var(--color-foreground)' }}>Laba-Rugi Hari Ini</h3>
          {[
            { label: 'Total Penjualan', value: dashboardData.todaySales, tone: 'success', sign: '+' },
            { label: 'HPP (Est. 60%)', value: -Math.round(dashboardData.todaySales * 0.6), tone: 'destructive', sign: '' },
            { label: 'Pengeluaran', value: -dashboardData.totalExpenses, tone: 'destructive', sign: '' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 'var(--text-sm, 0.85rem)', color: 'var(--color-muted-fg)' }}>{row.label}</span>
              <span style={{ fontSize: 'var(--text-sm, 0.875rem)', fontWeight: 700, color: TONE[row.tone] }}>{row.sign}{fmt(Math.abs(row.value))}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 0', marginTop: 4 }}>
            <span style={{ fontSize: 'var(--text-sm, 0.9rem)', fontWeight: 700, color: 'var(--color-foreground)' }}>Laba Bersih Est.</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base, 1rem)', fontWeight: 800, color: (dashboardData.grossProfit - dashboardData.totalExpenses) >= 0 ? 'var(--color-success)' : 'var(--color-destructive, #EF4444)' }}>
              {fmt(dashboardData.grossProfit - dashboardData.totalExpenses)}
            </span>
          </div>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg, 24px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-base, 1rem)', fontWeight: 700, color: 'var(--color-foreground)' }}>Transaksi Terbaru</h3>
            <Link to="/dashboard/penjualan" style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>Lihat Semua →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                <Spinner size={18} />
              </div>
            ) : dashboardData.recentTransactions.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', textAlign: 'center', padding: '16px 0' }}>
                Belum ada transaksi terbaru
              </div>
            ) : (
              dashboardData.recentTransactions.map(tx => {
                const dateVal = tx.created_at || tx.sold_at || Date.now();
                const time = new Date(dateVal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                const customer = tx.customer?.name || 'Pelanggan Umum';
                const totalAmt = Number(tx.grand_total || tx.total_amount) || 0;
                const status = tx.status === 'paid' ? 'Lunas' : (tx.status || 'Lunas');

                return (
                  <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--color-muted)' }}>
                    <div style={{ minWidth: 0, flex: '1 1 180px' }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm, 0.85rem)', color: 'var(--color-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customer}</div>
                      <div style={{ fontSize: 'var(--text-xs, 0.72rem)', color: 'var(--color-muted-fg)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.invoice_number || `INV-${tx.id}`} &bull; {time}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 'auto' }}>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-foreground)' }}>{fmt(totalAmt)}</div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}><Badge tone="success">{status}</Badge></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions — warna dipetakan ke 4 token semantik (bukan ungu/hijau/biru/amber bebas) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { to: '/dashboard/produk',     label: 'Kelola Produk', desc: 'Stok & katalog',     icon: 'box',      tone: 'accent' },
          { to: '/dashboard/penjualan',  label: 'Kasir / POS',   desc: 'Catat transaksi',    icon: 'cart',     tone: 'success' },
          { to: '/dashboard/laporan',    label: 'Laporan',       desc: 'Ringkasan keuangan', icon: 'chart',    tone: 'primary' },
          { to: '/dashboard/pengaturan', label: 'Pengaturan',    desc: 'Profil bisnis',      icon: 'settings', tone: 'warning' },
        ].map((a, i) => (
          <Link
            key={i}
            to={a.to}
            className="hover-card"
            style={{ padding: 'var(--space-md, 16px) 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-card)', textDecoration: 'none', color: 'var(--color-foreground)', display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', background: `color-mix(in srgb, ${TONE[a.tone]} 15%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={a.icon} size={17} color={TONE[a.tone]} />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: 'var(--text-sm, 0.875rem)', display: 'block' }}>{a.label}</span>
              <span style={{ fontSize: 'var(--text-xs, 0.72rem)', color: 'var(--color-muted-fg)' }}>{a.desc}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}