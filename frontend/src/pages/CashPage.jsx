import { useEffect, useMemo, useState } from 'react';
import { cashApi } from '../api/endpoints/cash';
import { useToast } from '../context/ToastContext';
import { Btn, Badge, Spinner } from '../components/ui/SharedUI';

// ============================================================
// CashPage — ALIGNED VERSION (Matching CustomersPage Design)
// Design Features:
// - Direct alignment with CustomersPage layout, typography, and card tokens
// - Stat Cards with hover-card effect and semantic border-left accents
// - Account Cards with brand-derived colors, clean badges, and progress bars
// - Mutasi Transaksi Table with search filter, status badges, and table-wrap
// - SharedUI <Btn>, <Badge>, <Spinner> components for modal & action buttons
// ============================================================

function Icon({ name, size = 18, color = 'currentColor' }) {
  const s = { width: size, height: size, flexShrink: 0 };
  const p = { fill: 'none', stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', ...s, viewBox: '0 0 24 24', 'aria-hidden': 'true' };
  switch (name) {
    case 'wallet':          return <svg {...p}><path d="M20 12V22H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"/><path d="M20 12a2 2 0 0 0-2-2H4"/><circle cx="18" cy="12" r="2"/></svg>;
    case 'plus':            return <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'x':               return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case 'search':          return <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case 'arrow-up-right':  return <svg {...p}><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>;
    case 'arrow-down-right':return <svg {...p}><line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/></svg>;
    case 'arrow-right-left':return <svg {...p}><path d="M16 3l4 4-4 4"/><path d="M20 7H4"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h16"/></svg>;
    case 'bank':            return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    default:                return <svg {...p}><circle cx="12" cy="12" r="4"/></svg>;
  }
}

const fmt = (n) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Number(n || 0));
const dateFmt = (v) => new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

const CATEGORIES = ['Operasional', 'Penjualan', 'Bahan Baku', 'Gaji & SDM', 'Sewa', 'Modal', 'Transfer', 'Lainnya'];

const ACC_COLORS = [
  'var(--color-primary)',
  'var(--color-accent)',
  'var(--color-success)',
  'var(--color-warning, #FBBF24)',
];

export default function CashPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Forms state
  const [txFormData, setTxFormData] = useState({
    bank_account_id: '',
    to_bank_account_id: '',
    type: 'in', // in, out, transfer
    amount: '',
    category: 'Operasional',
    description: '',
    transaction_date: new Date().toISOString().slice(0, 10),
  });

  const [accountFormData, setAccountFormData] = useState({
    name: '',
    bank_name: 'BCA',
    account_number: '',
    type: 'bank', // cash, bank, e-wallet
    opening_balance: '0',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [resAccounts, resTx] = await Promise.all([
        cashApi.getAccounts().catch(() => ({ data: { data: [] } })),
        cashApi.getTransactions().catch(() => ({ data: { data: [] } })),
      ]);

      const apiAccounts = resAccounts.data?.data || resAccounts.data || [];
      const apiTxList = resTx.data?.data?.data || resTx.data?.data || resTx.data || [];

      setAccounts(apiAccounts.map((a, i) => ({
        id: a.id,
        name: a.name,
        bank_name: a.bank_name || 'Kas',
        type: a.type === 'cash' ? 'Kas Tunai' : (a.type === 'bank' ? 'Bank' : 'E-Wallet'),
        raw_type: a.type,
        balance: Number(a.current_balance ?? a.balance ?? 0),
        account_number: a.account_number || '-',
        color: ACC_COLORS[i % ACC_COLORS.length],
      })));

      setTransactions(apiTxList.map((t) => {
        const fromAcc = t.bank_account?.name || t.bankAccount?.name || 'Kas Utama';
        const toAcc = t.to_bank_account?.name || t.toBankAccount?.name || '';
        return {
          id: t.id,
          date: t.transaction_date ? dateFmt(t.transaction_date) : '-',
          desc: t.notes || t.category || 'Transaksi Kas',
          category: t.category || 'Operasional',
          account: t.type === 'transfer' ? `${fromAcc} ➔ ${toAcc}` : fromAcc,
          type: t.type, // in, out, transfer
          amount: Number(t.amount) || 0,
        };
      }));

      if (apiAccounts.length > 0 && !txFormData.bank_account_id) {
        setTxFormData(p => ({ ...p, bank_account_id: String(apiAccounts[0].id) }));
      }
    } catch (e) {
      console.error('Failed to load cash data:', e);
      addToast('Gagal memuat data kas dari server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const totalLiquidity = useMemo(() => accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0), [accounts]);
  const todayIncome = useMemo(() => transactions.filter((t) => t.type === 'in').reduce((s, t) => s + Number(t.amount || 0), 0), [transactions]);
  const todayExpense = useMemo(() => transactions.filter((t) => t.type === 'out').reduce((s, t) => s + Number(t.amount || 0), 0), [transactions]);

  const filteredTx = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(t =>
      (t.desc || '').toLowerCase().includes(q) ||
      (t.category || '').toLowerCase().includes(q) ||
      (t.account || '').toLowerCase().includes(q)
    );
  }, [transactions, search]);

  const handleSaveTx = async (e) => {
    e.preventDefault();
    if (!txFormData.bank_account_id || !txFormData.amount || !txFormData.description) {
      addToast('Harap lengkapi formulir transaksi kas', 'error');
      return;
    }
    if (txFormData.type === 'transfer' && (!txFormData.to_bank_account_id || txFormData.bank_account_id === txFormData.to_bank_account_id)) {
      addToast('Silakan pilih rekening tujuan transfer yang berbeda', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await cashApi.createTransaction({
        bank_account_id: Number(txFormData.bank_account_id),
        to_bank_account_id: txFormData.type === 'transfer' ? Number(txFormData.to_bank_account_id) : undefined,
        type: txFormData.type,
        amount: Number(txFormData.amount),
        category: txFormData.category,
        notes: txFormData.description,
        transaction_date: txFormData.transaction_date,
      });
      addToast('Transaksi kas berhasil dicatat!', 'success');
      setIsTxModalOpen(false);
      setTxFormData(p => ({ ...p, amount: '', description: '', transaction_date: new Date().toISOString().slice(0, 10) }));
      await loadData();
    } catch (err) {
      console.error('Create cash transaction error:', err);
      addToast(err?.response?.data?.message || 'Gagal mencatat transaksi kas.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    if (!accountFormData.name) {
      addToast('Silakan isi nama akun kas / rekening', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await cashApi.createAccount({
        name: accountFormData.name,
        bank_name: accountFormData.bank_name,
        account_number: accountFormData.account_number,
        type: accountFormData.type,
        opening_balance: Number(accountFormData.opening_balance) || 0,
      });
      addToast('Akun kas / rekening baru berhasil ditambahkan!', 'success');
      setIsAccountModalOpen(false);
      setAccountFormData({ name: '', bank_name: 'BCA', account_number: '', type: 'bank', opening_balance: '0' });
      await loadData();
    } catch (err) {
      console.error('Create account error:', err);
      addToast(err?.response?.data?.message || 'Gagal membuat akun kas baru.', 'error');
    } finally {
      setSubmitting(false);
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
    { label: 'Total Likuiditas Toko', value: loading ? '...' : `Rp ${fmt(totalLiquidity)}`, sub: `${accounts.length} rekening terhubung`, tone: 'primary' },
    { label: 'Total Pemasukan Kas', value: loading ? '...' : `Rp ${fmt(todayIncome)}`, sub: 'akumulasi mutasi masuk', tone: 'success' },
    { label: 'Total Pengeluaran Kas', value: loading ? '...' : `Rp ${fmt(todayExpense)}`, sub: 'akumulasi mutasi keluar', tone: 'warning' },
  ];
  const TONE_VAR = {
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning, #FBBF24)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
      {/* Header — Matched with CustomersPage style */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl, 1.5rem)', fontWeight: 800, color: 'var(--color-foreground)', letterSpacing: '-0.02em' }}>
            Kas &amp; Rekening Bank
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-muted-fg)' }}>
            Kelola saldo likuiditas tunai, rekening bank, mutasi kas, dan transfer antar akun.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Btn onClick={() => setIsAccountModalOpen(true)} variant="secondary" size="md" icon={<Icon name="plus" size={16} />}>
            Rekening Baru
          </Btn>
          <Btn onClick={() => setIsTxModalOpen(true)} variant="primary" size="md" icon={<Icon name="plus" size={17} color="var(--color-on-primary)" />}>
            Catat Transaksi
          </Btn>
        </div>
      </div>

      {/* Stat Cards — Matched with CustomersPage style */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
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
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{card.value}</div>
              <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 4 }}>{card.sub}</div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-muted-fg)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <Spinner size={20} />
          <span>Memuat data Kas &amp; Rekening dari server...</span>
        </div>
      ) : (
        <>
          {/* Account Cards Grid */}
          <div>
            <div style={{ fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 'var(--text-base, 1rem)', color: 'var(--color-foreground)', marginBottom: 12 }}>
              Daftar Rekening &amp; Kas Aktif
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {accounts.map((acc) => {
                const pct = totalLiquidity > 0 ? Math.round((Number(acc.balance || 0) / totalLiquidity) * 100) : 0;
                return (
                  <div
                    key={acc.id}
                    className="hover-card"
                    style={{
                      background: 'var(--color-card)', border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)', padding: 20, display: 'flex', flexDirection: 'column', gap: 16,
                      boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.03))',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm, 0.875rem)', fontWeight: 800, color: 'var(--color-foreground)' }}>{acc.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <Badge tone={acc.raw_type === 'cash' ? 'success' : (acc.raw_type === 'bank' ? 'primary' : 'accent')}>
                            {acc.bank_name} • {acc.type}
                          </Badge>
                          <span style={{ fontSize: 11, color: 'var(--color-muted-fg)', fontFamily: 'var(--font-mono)' }}>{acc.account_number}</span>
                        </div>
                      </div>
                      <div style={{
                        width: 38, height: 38, borderRadius: 'var(--radius-md)',
                        background: `color-mix(in srgb, ${acc.color} 15%, transparent)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid color-mix(in srgb, ${acc.color} 25%, transparent)`,
                      }}>
                        <Icon name={acc.raw_type === 'bank' ? 'bank' : 'wallet'} size={18} color={acc.color} />
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 10, color: 'var(--color-muted-fg)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 4 }}>Saldo Aktif</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-foreground)', fontVariantNumeric: 'tabular-nums' }}>Rp {fmt(acc.balance)}</div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>Porsi dari total</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: acc.color }}>{pct}%</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--color-muted)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: acc.color, borderRadius: 99 }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search — Matched with CustomersPage search input */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <Icon name="search" size={15} color="var(--color-muted-fg)" />
            </div>
            <input
              type="text"
              placeholder="Cari mutasi berdasarkan keterangan, kategori, atau rekening..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Cari mutasi transaksi"
              style={{ ...inputStyle, paddingLeft: 40, borderRadius: 'var(--radius-md)' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          {/* Transactions Table — Matched with CustomersPage table style */}
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.03))' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-base, 1rem)', color: 'var(--color-foreground)' }}>
                Mutasi Transaksi Kas
              </div>
              <span style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-muted-fg)' }}>
                {filteredTx.length} entri mutasi
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm, 0.875rem)' }}>
                <thead>
                  <tr style={{ background: 'var(--color-muted)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted-fg)', fontSize: 'var(--text-xs, 0.75rem)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Tanggal</th>
                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Keterangan</th>
                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Kategori</th>
                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Rekening</th>
                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Jenis Mutasi</th>
                    <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 48, textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                          <Icon name="wallet" size={36} color="var(--color-muted-fg)" />
                          <div style={{ fontWeight: 600, color: 'var(--color-muted-fg)' }}>Tidak ada mutasi transaksi yang ditemukan</div>
                          <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', opacity: 0.7 }}>Coba kata kunci lain atau catat transaksi baru</div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTx.map((tx) => {
                    const isTransfer = tx.type === 'transfer';
                    const isIn = tx.type === 'in';
                    const badgeTone = isTransfer ? 'accent' : (isIn ? 'success' : 'destructive');
                    const iconName = isTransfer ? 'arrow-right-left' : (isIn ? 'arrow-up-right' : 'arrow-down-right');

                    return (
                      <tr key={tx.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s ease' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-muted)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '13px 20px', color: 'var(--color-muted-fg)', fontSize: 'var(--text-xs, 0.75rem)' }}>{tx.date}</td>
                        <td style={{ padding: '13px 20px', fontWeight: 600, color: 'var(--color-foreground)' }}>{tx.desc}</td>
                        <td style={{ padding: '13px 20px' }}>
                          <span style={{ padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>{tx.category}</span>
                        </td>
                        <td style={{ padding: '13px 20px', color: 'var(--color-muted-fg)', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 500 }}>{tx.account}</td>
                        <td style={{ padding: '13px 20px' }}>
                          <Badge tone={badgeTone}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Icon name={iconName} size={11} />
                              {isTransfer ? 'Transfer' : (isIn ? 'Pemasukan' : 'Pengeluaran')}
                            </span>
                          </Badge>
                        </td>
                        <td style={{ padding: '13px 20px', fontWeight: 800, textAlign: 'right', color: isIn ? 'var(--color-success)' : (tx.type === 'out' ? 'var(--color-destructive)' : 'var(--color-accent)'), fontVariantNumeric: 'tabular-nums' }}>
                          {isIn ? '+' : (tx.type === 'out' ? '-' : '')}Rp {fmt(tx.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal: Catat Transaksi — Matched with CustomersPage modal design */}
      {isTxModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Catat transaksi kas"
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsTxModalOpen(false); }}
        >
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 460, padding: 'var(--space-xl, 28px)', boxShadow: 'var(--shadow-lg, 0 24px 48px -12px rgba(0,0,0,0.3))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg, 1.125rem)', fontWeight: 800, color: 'var(--color-foreground)' }}>
                Catat Transaksi Kas Baru
              </h2>
              <button onClick={() => setIsTxModalOpen(false)} aria-label="Tutup" style={{ background: 'var(--color-muted)', border: 'none', borderRadius: 'var(--radius-sm)', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="x" size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveTx} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 8, color: 'var(--color-foreground)' }}>
                  Jenis Transaksi <span style={{ color: 'var(--color-destructive)' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                  {[
                    ['in', 'Masuk', 'var(--color-success)'],
                    ['out', 'Keluar', 'var(--color-destructive)'],
                    ['transfer', 'Transfer', 'var(--color-accent)'],
                  ].map(([val, label, color]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTxFormData({ ...txFormData, type: val })}
                      style={{
                        padding: '9px 4px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        border: `1.5px solid ${txFormData.type === val ? color : 'var(--color-border)'}`,
                        background: txFormData.type === val ? `color-mix(in srgb, ${color} 12%, transparent)` : 'transparent',
                        color: txFormData.type === val ? color : 'var(--color-muted-fg)',
                        fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon name={val === 'in' ? 'arrow-up-right' : (val === 'out' ? 'arrow-down-right' : 'arrow-right-left')} size={13} color={txFormData.type === val ? color : 'var(--color-muted-fg)'} /> {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: txFormData.type === 'transfer' ? '1fr 1fr' : '1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6, color: 'var(--color-foreground)' }}>
                    {txFormData.type === 'transfer' ? 'Dari Rekening' : 'Akun Kas / Bank'} <span style={{ color: 'var(--color-destructive)' }}>*</span>
                  </label>
                  <select value={txFormData.bank_account_id} onChange={(e) => setTxFormData({ ...txFormData, bank_account_id: e.target.value })} style={{ ...inputStyle, borderRadius: 'var(--radius-md)' }}>
                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} (Rp {fmt(a.balance)})</option>)}
                  </select>
                </div>
                {txFormData.type === 'transfer' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6, color: 'var(--color-foreground)' }}>
                      Ke Rekening <span style={{ color: 'var(--color-destructive)' }}>*</span>
                    </label>
                    <select value={txFormData.to_bank_account_id} onChange={(e) => setTxFormData({ ...txFormData, to_bank_account_id: e.target.value })} style={{ ...inputStyle, borderRadius: 'var(--radius-md)' }}>
                      <option value="">-- Pilih Rekening --</option>
                      {accounts.filter(a => String(a.id) !== String(txFormData.bank_account_id)).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6, color: 'var(--color-foreground)' }}>
                    Jumlah (Rp) <span style={{ color: 'var(--color-destructive)' }}>*</span>
                  </label>
                  <input type="number" required min="1" placeholder="100000" value={txFormData.amount} onChange={(e) => setTxFormData({ ...txFormData, amount: e.target.value })} style={{ ...inputStyle, borderRadius: 'var(--radius-md)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6, color: 'var(--color-foreground)' }}>Kategori</label>
                  <select value={txFormData.category} onChange={(e) => setTxFormData({ ...txFormData, category: e.target.value })} style={{ ...inputStyle, borderRadius: 'var(--radius-md)' }}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6, color: 'var(--color-foreground)' }}>
                  Keterangan <span style={{ color: 'var(--color-destructive)' }}>*</span>
                </label>
                <input type="text" required placeholder="contoh: Penjualan Sesi Pagi / Setor Bank" value={txFormData.description} onChange={(e) => setTxFormData({ ...txFormData, description: e.target.value })} style={{ ...inputStyle, borderRadius: 'var(--radius-md)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6, color: 'var(--color-foreground)' }}>Tanggal</label>
                <input type="date" value={txFormData.transaction_date} onChange={(e) => setTxFormData({ ...txFormData, transaction_date: e.target.value })} style={{ ...inputStyle, borderRadius: 'var(--radius-md)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <Btn type="button" variant="secondary" size="md" onClick={() => setIsTxModalOpen(false)}>Batal</Btn>
                <Btn type="submit" variant="primary" size="md" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Rekening / Akun Kas Baru — Matched with CustomersPage modal design */}
      {isAccountModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tambah rekening baru"
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsAccountModalOpen(false); }}
        >
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 460, padding: 'var(--space-xl, 28px)', boxShadow: 'var(--shadow-lg, 0 24px 48px -12px rgba(0,0,0,0.3))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg, 1.125rem)', fontWeight: 800, color: 'var(--color-foreground)' }}>
                Tambah Rekening / Akun Kas
              </h2>
              <button onClick={() => setIsAccountModalOpen(false)} aria-label="Tutup" style={{ background: 'var(--color-muted)', border: 'none', borderRadius: 'var(--radius-sm)', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="x" size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveAccount} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6, color: 'var(--color-foreground)' }}>
                  Nama Akun Kas / Bank <span style={{ color: 'var(--color-destructive)' }}>*</span>
                </label>
                <input type="text" required placeholder="contoh: Bank Mandiri Utama / Kasir 2" value={accountFormData.name} onChange={(e) => setAccountFormData({ ...accountFormData, name: e.target.value })} style={{ ...inputStyle, borderRadius: 'var(--radius-md)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6, color: 'var(--color-foreground)' }}>Tipe Akun</label>
                  <select value={accountFormData.type} onChange={(e) => setAccountFormData({ ...accountFormData, type: e.target.value })} style={{ ...inputStyle, borderRadius: 'var(--radius-md)' }}>
                    <option value="cash">Kas Tunai</option>
                    <option value="bank">Bank</option>
                    <option value="e-wallet">E-Wallet / Gateway</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6, color: 'var(--color-foreground)' }}>Nama Bank / Institusi</label>
                  <input type="text" placeholder="BCA, Mandiri, Cash, GoPay" value={accountFormData.bank_name} onChange={(e) => setAccountFormData({ ...accountFormData, bank_name: e.target.value })} style={{ ...inputStyle, borderRadius: 'var(--radius-md)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6, color: 'var(--color-foreground)' }}>Nomor Rekening (Opsional)</label>
                <input type="text" placeholder="1234567890" value={accountFormData.account_number} onChange={(e) => setAccountFormData({ ...accountFormData, account_number: e.target.value })} style={{ ...inputStyle, borderRadius: 'var(--radius-md)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6, color: 'var(--color-foreground)' }}>Saldo Awal (Rp)</label>
                <input type="number" min="0" placeholder="0" value={accountFormData.opening_balance} onChange={(e) => setAccountFormData({ ...accountFormData, opening_balance: e.target.value })} style={{ ...inputStyle, borderRadius: 'var(--radius-md)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <Btn type="button" variant="secondary" size="md" onClick={() => setIsAccountModalOpen(false)}>Batal</Btn>
                <Btn type="submit" variant="primary" size="md" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Rekening'}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
