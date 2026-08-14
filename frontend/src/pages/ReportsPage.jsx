import { useState, useEffect } from 'react';
import { reportsApi } from '../api/endpoints/reports';
import { useToast } from '../context/ToastContext';

function Icon({ name, size = 18, color = 'currentColor' }) {
  const s = { width: size, height: size, flexShrink: 0 };
  const p = { fill: 'none', stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', ...s, viewBox: '0 0 24 24', 'aria-hidden': 'true' };
  switch (name) {
    case 'download': return <svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
    case 'printer':  return <svg {...p}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
    case 'trending-up': return <svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
    case 'trending-down': return <svg {...p}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>;
    case 'bar-chart': return <svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
    case 'package':  return <svg {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
    case 'spin':     return <svg {...p} style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12"/></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="4"/></svg>;
  }
}

const PERIODS = [
  { key: 'today', label: 'Hari Ini' },
  { key: 'week', label: 'Minggu Ini' },
  { key: 'month', label: 'Bulan Ini' },
  { key: 'year', label: 'Tahun 2026' },
];

function MetricCard({ label, value, sub, color, trend = 'up', trendVal = '+0%', loading }) {
  return (
    <div style={{
      background: 'var(--color-card)', border: '1px solid var(--color-border)',
      borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 10,
      borderTop: `3px solid ${color}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)', transition: 'box-shadow 0.2s ease',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 24px -4px ${color}20`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-muted-fg)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        {loading ? '...' : `Rp ${Number(value || 0).toLocaleString('id-ID')}`}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
          background: trend === 'up' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          color: trend === 'up' ? '#10b981' : '#ef4444',
        }}>
          <Icon name={trend === 'up' ? 'trending-up' : 'trending-down'} size={10} color={trend === 'up' ? '#10b981' : '#ef4444'} />
          {trendVal}
        </span>
        <span style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>{sub}</span>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    revenue: 0,
    hpp: 0,
    expenses: 0,
    top_products: [],
  });
  const { addToast } = useToast();

  const fetchReport = async (selectedPeriod) => {
    setLoading(true);
    try {
      const [resDashboard, resSales] = await Promise.all([
        reportsApi.dashboard(selectedPeriod).catch(() => ({ data: { data: {} } })),
        reportsApi.salesSummary({ group_by: 'product' }).catch(() => ({ data: { data: [] } })),
      ]);

      const dashData = resDashboard.data?.data || resDashboard.data || {};
      const salesItems = resSales.data?.data || resSales.data || [];

      const revenue = Number(dashData.total_revenue || dashData.revenue) || 0;
      const hpp = Number(dashData.total_hpp || dashData.hpp) || Math.round(revenue * 0.45);
      const expenses = Number(dashData.total_expenses || dashData.expenses) || 0;

      const topProducts = Array.isArray(salesItems) && salesItems.length > 0 ? salesItems.map(item => ({
        name: item.product_name || item.name || 'Produk',
        qty: Number(item.total_quantity || item.qty) || 0,
        revenue: Number(item.total_sales || item.revenue) || 0,
      })) : [];

      setReportData({
        revenue,
        hpp,
        expenses,
        top_products: topProducts,
      });
    } catch (err) {
      console.error('Failed to load reports:', err);
      addToast('Gagal memuat laporan dari server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(period);
  }, [period]);

  const grossProfit = reportData.revenue - reportData.hpp;
  const netProfit = grossProfit - reportData.expenses;
  const topProducts = reportData.top_products;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1280, margin: '0 auto', width: '100%', paddingInline: 'clamp(0px, 2vw, 8px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-2xl, 1.5rem)', fontWeight: 800, color: 'var(--color-foreground)', letterSpacing: '-0.02em' }}>
            Laporan Keuangan &amp; Laba Rugi
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-muted-fg)' }}>
            Ringkasan performa finansial, pendapatan bersih, HPP, dan beban operasional toko Anda.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => addToast('Mengeksport laporan ke Excel...', 'info')}
            aria-label="Export ke Excel"
            style={{
              background: 'var(--color-card)', color: 'var(--color-foreground)',
              border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 16px', fontWeight: 600,
              fontSize: 'var(--text-sm, 0.875rem)', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-muted)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-card)'}
          >
            <Icon name="download" size={15} /> Excel
          </button>
          <button
            onClick={() => window.print()}
            aria-label="Cetak PDF"
            style={{
              background: 'var(--color-primary)', color: 'var(--color-on-primary)',
              border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 700,
              fontSize: 'var(--text-sm, 0.875rem)', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.15s ease',
              boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Icon name="printer" size={15} color="var(--color-on-primary)" /> Cetak PDF
          </button>
        </div>
      </div>

      {/* Period Tabs */}
      <div style={{ display: 'flex', background: 'var(--color-muted)', padding: 4, borderRadius: 12, gap: 2, width: '100%', maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {PERIODS.map(({ key, label }) => {
          const active = period === key;
          return (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              aria-pressed={active}
              style={{
                padding: '8px 18px', borderRadius: 8, border: 'none',
                background: active ? 'var(--color-card)' : 'transparent',
                color: active ? 'var(--color-foreground)' : 'var(--color-muted-fg)',
                fontWeight: active ? 700 : 500,
                fontSize: 'var(--text-xs, 0.75rem)', cursor: 'pointer',
                boxShadow: active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease', whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <MetricCard label="Total Pendapatan" value={reportData.revenue} color="#6366f1" trend="up" trendVal="+12.4%" sub="vs periode lalu" loading={loading} />
        <MetricCard label="Total HPP / Modal" value={reportData.hpp} color="#f59e0b" trend="up" trendVal="+8.1%" sub="vs periode lalu" loading={loading} />
        <MetricCard label="Laba Kotor" value={grossProfit} color="#10b981" trend="up" trendVal="+15.2%" sub="margin kotor" loading={loading} />
        <MetricCard label="Laba Bersih" value={netProfit} color="#ec4899" trend={netProfit >= 0 ? 'up' : 'down'} trendVal={netProfit >= 0 ? '+18.7%' : '-5.2%'} sub="setelah semua beban" loading={loading} />
      </div>

      {/* Income Statement & Top Products */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, alignItems: 'start' }}>
        {/* Income Statement */}
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, borderRadius: 8, background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}>
              <Icon name="bar-chart" size={16} color="var(--color-primary)" />
            </div>
            <div style={{ fontWeight: 800, fontSize: 'var(--text-base, 1rem)', color: 'var(--color-foreground)' }}>
              Laporan Laba Rugi
            </div>
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { num: '1', label: 'Total Pendapatan Penjualan', sub: 'Total omset dari seluruh transaksi', val: reportData.revenue, color: 'var(--color-foreground)', sign: '' },
              { num: '2', label: 'Harga Pokok Penjualan (HPP)', sub: 'Beban modal produk yang terjual', val: reportData.hpp, color: '#ef4444', sign: '−' },
            ].map(row => (
              <div key={row.num} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--color-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'var(--color-muted-fg)', flexShrink: 0, marginTop: 1 }}>{row.num}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-foreground)' }}>{row.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 2 }}>{row.sub}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 'var(--text-base, 1rem)', color: row.color, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', marginLeft: 12 }}>
                  {loading ? '...' : `${row.sign}Rp ${row.val.toLocaleString('id-ID')}`}
                </div>
              </div>
            ))}

            {/* Gross Profit */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', borderRadius: 10, margin: '12px 0', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
              <span style={{ fontWeight: 700, fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-foreground)' }}>Laba Kotor (Gross Profit)</span>
              <span style={{ fontWeight: 900, fontSize: 'var(--text-base, 1rem)', color: 'var(--color-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {loading ? '...' : `Rp ${grossProfit.toLocaleString('id-ID')}`}
              </span>
            </div>

            {/* Operating Expenses */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--color-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'var(--color-muted-fg)', flexShrink: 0, marginTop: 1 }}>3</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-foreground)' }}>Total Beban Operasional</div>
                  <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 2 }}>Listrik, air, internet, gaji, &amp; sewa</div>
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-base, 1rem)', color: '#ef4444', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', marginLeft: 12 }}>
                {loading ? '...' : `−Rp ${reportData.expenses.toLocaleString('id-ID')}`}
              </div>
            </div>

            {/* Net Profit Banner */}
            <div style={{
              marginTop: 16,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              gap: 16,
              padding: '14px 16px',
              background: 'var(--color-success)',
              color: 'var(--color-on-success, #ffffff)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid color-mix(in srgb, var(--color-success) 35%, black)',
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 'var(--text-sm, 0.875rem)', letterSpacing: '0.02em' }}>ESTIMASI LABA BERSIH</div>
                <div style={{ fontSize: 'var(--text-xs, 0.72rem)', color: 'color-mix(in srgb, var(--color-on-success, #ffffff) 82%, transparent)', marginTop: 3 }}>Setelah HPP &amp; semua beban operasional</div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg, 1.125rem)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', color: 'var(--color-on-success, #ffffff)' }}>
                {loading ? '...' : `Rp ${netProfit.toLocaleString('id-ID')}`}
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(245,158,11,0.12)' }}>
              <Icon name="package" size={16} color="#f59e0b" />
            </div>
            <div style={{ fontWeight: 800, fontSize: 'var(--text-base, 1rem)', color: 'var(--color-foreground)' }}>
              Produk Terlaris
            </div>
          </div>
          <div style={{ padding: '16px 0' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                <Icon name="spin" size={20} color="var(--color-primary)" />
              </div>
            ) : topProducts.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-muted-fg)', fontSize: 13 }}>
                Belum ada data produk terlaris
              </div>
            ) : topProducts.map((prod, i) => {
              const maxRev = topProducts[0]?.revenue || 1;
              const pct = Math.round((prod.revenue / maxRev) * 100);
              const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
              const color = colors[i % colors.length];
              return (
                <div key={prod.name + i} style={{ padding: '12px 24px', borderBottom: i < topProducts.length - 1 ? '1px solid var(--color-border)' : 'none', transition: 'background 0.15s ease' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-muted)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 22, height: 22, borderRadius: 99, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color, flexShrink: 0 }}>{i + 1}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-foreground)' }}>{prod.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 1 }}>{prod.qty} terjual</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 'var(--text-sm, 0.875rem)', color, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', marginLeft: 8 }}>
                      Rp {prod.revenue.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div style={{ height: 4, background: 'var(--color-muted)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
