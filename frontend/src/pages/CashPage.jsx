import { useEffect, useMemo, useState } from 'react';
import { cashApi } from '../api/endpoints/cash';
import { useToast } from '../context/ToastContext';

function Icon({ name, size = 18, color = 'currentColor' }) {
  const s = { width: size, height: size, flexShrink: 0 };
  const p = { fill: 'none', stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', ...s, viewBox: '0 0 24 24', 'aria-hidden': 'true' };
  switch (name) {
    case 'wallet': return <svg {...p}><path d="M20 12V22H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"/><path d="M20 12a2 2 0 0 0-2-2H4"/><circle cx="18" cy="12" r="2"/></svg>;
    case 'plus': return <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'x': return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case 'arrow-up-right': return <svg {...p}><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>;
    case 'arrow-down-right': return <svg {...p}><line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/></svg>;
    case 'arrow-right-left': return <svg {...p}><path d="M16 3l4 4-4 4"/><path d="M20 7H4"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h16"/></svg>;
    case 'bank': return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case 'spin': return <svg {...p} style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12"/></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="4"/></svg>;
  }
}

const fmt = (n) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Number(n || 0));
const dateFmt = (v) => new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

const CATEGORIES = ['Operasional', 'Penjualan', 'Bahan Baku', 'Gaji & SDM', 'Sewa', 'Modal', 'Transfer', 'Lainnya'];

export default function CashPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

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
        color: ['#10b981', '#6366f1', '#f59e0b', '#ec4899'][i % 4],
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
    width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 8,
    border: '1px solid var(--color-border)', background: 'var(--color-background)',
    color: 'var(--color-foreground)', fontSize: 'var(--text-sm, 0.875rem)', outline: 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-2xl, 1.5rem)', fontWeight: 800, color: 'var(--color-foreground)', letterSpacing: '-0.02em' }}>
            Kas &amp; Rekening Bank
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-muted-fg)' }}>
            Kelola saldo likuiditas tunai, rekening bank, mutasi kas, dan transfer antar akun.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setIsAccountModalOpen(true)}
            style={{
              background: 'var(--color-card)', color: 'var(--color-foreground)',
              border: '1px solid var(--color-border)', borderRadius: 10, padding: '11px 16px', fontWeight: 600,
              fontSize: 'var(--text-sm, 0.875rem)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            <Icon name="plus" size={16} /> + Rekening Baru
          </button>
          <button
            onClick={() => setIsTxModalOpen(true)}
            style={{
              background: 'var(--color-primary)', color: 'var(--color-on-primary)',
              border: 'none', borderRadius: 10, padding: '11px 20px', fontWeight: 700,
              fontSize: 'var(--text-sm, 0.875rem)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
            }}
          >
            <Icon name="plus" size={17} color="var(--color-on-primary)" /> Catat Transaksi
          </button>
        </div>
      </div>

      {/* Liquidity Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', borderRadius: 16, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, color: '#fff', boxShadow: '0 10px 25px -5px rgba(2,132,199,0.3)' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85 }}>Total Saldo Likuiditas Toko</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, marginTop: 6, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>Rp {fmt(totalLiquidity)}</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 8 }}>{accounts.length} rekening terhubung • Synchronized Live</div>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600, textTransform: 'uppercase' }}>Pemasukan Kas</div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', marginTop: 2, color: '#a7f3d0' }}>+Rp {fmt(todayIncome)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600, textTransform: 'uppercase' }}>Pengeluaran Kas</div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', marginTop: 2, color: '#fecaca' }}>-Rp {fmt(todayExpense)}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-muted-fg)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <Icon name="spin" size={20} color="var(--color-primary)" />
          <span>Memuat data Kas &amp; Rekening dari server...</span>
        </div>
      ) : (
        <>
          {/* Account Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {accounts.map((acc) => {
              const pct = totalLiquidity > 0 ? Math.round((Number(acc.balance || 0) / totalLiquidity) * 100) : 0;
              return (
                <div key={acc.id} style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 'var(--text-sm, 0.875rem)', fontWeight: 800, color: 'var(--color-foreground)' }}>{acc.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: `${acc.color}18`, color: acc.color }}>{acc.bank_name} • {acc.type}</span>
                        <span style={{ fontSize: 11, color: 'var(--color-muted-fg)', fontFamily: 'var(--font-mono)' }}>{acc.account_number}</span>
                      </div>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${acc.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={acc.raw_type === 'bank' ? 'bank' : 'wallet'} size={20} color={acc.color} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--color-muted-fg)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 4 }}>Saldo Aktif</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-foreground)', fontVariantNumeric: 'tabular-nums' }}>Rp {fmt(acc.balance)}</div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>Porsi dari total</span><span style={{ fontSize: 11, fontWeight: 700, color: acc.color }}>{pct}%</span></div>
                    <div style={{ height: 6, background: 'var(--color-muted)', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: acc.color, borderRadius: 99 }} /></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transactions Table */}
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-base, 1rem)', color: 'var(--color-foreground)' }}>Mutasi Transaksi Kas</div>
              <span style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-muted-fg)' }}>{transactions.length} entri mutasi</span>
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
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--color-muted-fg)' }}>
                        Belum ada mutasi transaksi kas
                      </td>
                    </tr>
                  ) : transactions.map((tx) => {
                    const isTransfer = tx.type === 'transfer';
                    const isIn = tx.type === 'in';
                    const badgeBg = isTransfer ? 'rgba(99,102,241,0.12)' : (isIn ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)');
                    const badgeColor = isTransfer ? '#6366f1' : (isIn ? '#10b981' : '#ef4444');
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
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: badgeBg, color: badgeColor }}>
                            <Icon name={iconName} size={11} color={badgeColor} />
                            {isTransfer ? 'Transfer' : (isIn ? 'Pemasukan' : 'Pengeluaran')}
                          </span>
                        </td>
                        <td style={{ padding: '13px 20px', fontWeight: 800, textAlign: 'right', color: badgeColor, fontVariantNumeric: 'tabular-nums' }}>
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

      {/* Modal: Catat Transaksi */}
      {isTxModalOpen && (
        <div role="dialog" aria-modal="true" aria-label="Catat transaksi kas" style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={(e) => { if (e.target === e.currentTarget) setIsTxModalOpen(false); }}>
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 20, width: '100%', maxWidth: 480, padding: 28, boxShadow: '0 24px 48px -12px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 'var(--text-lg, 1.125rem)', fontWeight: 800, color: 'var(--color-foreground)' }}>Catat Transaksi Kas Baru</h2>
              <button onClick={() => setIsTxModalOpen(false)} aria-label="Tutup" style={{ background: 'var(--color-muted)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={16} /></button>
            </div>
            <form onSubmit={handleSaveTx} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 8 }}>Jenis Transaksi <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                  {[
                    ['in', 'Masuk', '#10b981'],
                    ['out', 'Keluar', '#ef4444'],
                    ['transfer', 'Transfer', '#6366f1'],
                  ].map(([val, label, color]) => (
                    <button key={val} type="button" onClick={() => setTxFormData({ ...txFormData, type: val })} style={{ padding: '9px 4px', borderRadius: 8, cursor: 'pointer', border: `1.5px solid ${txFormData.type === val ? color : 'var(--color-border)'}`, background: txFormData.type === val ? `${color}15` : 'transparent', color: txFormData.type === val ? color : 'var(--color-muted-fg)', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <Icon name={val === 'in' ? 'arrow-up-right' : (val === 'out' ? 'arrow-down-right' : 'arrow-right-left')} size={13} color={txFormData.type === val ? color : 'var(--color-muted-fg)'} /> {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: txFormData.type === 'transfer' ? '1fr 1fr' : '1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>
                    {txFormData.type === 'transfer' ? 'Dari Rekening' : 'Akun Kas / Bank'} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select value={txFormData.bank_account_id} onChange={(e) => setTxFormData({ ...txFormData, bank_account_id: e.target.value })} style={inputStyle}>
                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} (Rp {fmt(a.balance)})</option>)}
                  </select>
                </div>
                {txFormData.type === 'transfer' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Ke Rekening <span style={{ color: '#ef4444' }}>*</span></label>
                    <select value={txFormData.to_bank_account_id} onChange={(e) => setTxFormData({ ...txFormData, to_bank_account_id: e.target.value })} style={inputStyle}>
                      <option value="">-- Pilih Rekening --</option>
                      {accounts.filter(a => String(a.id) !== String(txFormData.bank_account_id)).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Jumlah (Rp) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="number" required min="1" placeholder="100000" value={txFormData.amount} onChange={(e) => setTxFormData({ ...txFormData, amount: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Kategori</label>
                  <select value={txFormData.category} onChange={(e) => setTxFormData({ ...txFormData, category: e.target.value })} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Keterangan <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" required placeholder="contoh: Penjualan Sesi Pagi / Setor Bank" value={txFormData.description} onChange={(e) => setTxFormData({ ...txFormData, description: e.target.value })} style={inputStyle} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Tanggal</label>
                <input type="date" value={txFormData.transaction_date} onChange={(e) => setTxFormData({ ...txFormData, transaction_date: e.target.value })} style={inputStyle} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setIsTxModalOpen(false)} style={{ padding: '11px 18px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--color-foreground)' }}>Batal</button>
                <button type="submit" disabled={submitting} style={{ padding: '11px 22px', borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: 'var(--color-on-primary)', fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Rekening / Akun Kas Baru */}
      {isAccountModalOpen && (
        <div role="dialog" aria-modal="true" aria-label="Tambah rekening baru" style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={(e) => { if (e.target === e.currentTarget) setIsAccountModalOpen(false); }}>
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 20, width: '100%', maxWidth: 440, padding: 28, boxShadow: '0 24px 48px -12px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 'var(--text-lg, 1.125rem)', fontWeight: 800, color: 'var(--color-foreground)' }}>Tambah Rekening / Akun Kas</h2>
              <button onClick={() => setIsAccountModalOpen(false)} aria-label="Tutup" style={{ background: 'var(--color-muted)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={16} /></button>
            </div>
            <form onSubmit={handleSaveAccount} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Nama Akun Kas / Bank <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" required placeholder="contoh: Bank Mandiri Utama / Kasir 2" value={accountFormData.name} onChange={(e) => setAccountFormData({ ...accountFormData, name: e.target.value })} style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Tipe Akun</label>
                  <select value={accountFormData.type} onChange={(e) => setAccountFormData({ ...accountFormData, type: e.target.value })} style={inputStyle}>
                    <option value="cash">Kas Tunai</option>
                    <option value="bank">Bank</option>
                    <option value="e-wallet">E-Wallet / Gateway</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Nama Bank / Institusi</label>
                  <input type="text" placeholder="BCA, Mandiri, Cash, GoPay" value={accountFormData.bank_name} onChange={(e) => setAccountFormData({ ...accountFormData, bank_name: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Nomor Rekening (Opsional)</label>
                <input type="text" placeholder="1234567890" value={accountFormData.account_number} onChange={(e) => setAccountFormData({ ...accountFormData, account_number: e.target.value })} style={inputStyle} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, marginBottom: 6 }}>Saldo Awal (Rp)</label>
                <input type="number" min="0" placeholder="0" value={accountFormData.opening_balance} onChange={(e) => setAccountFormData({ ...accountFormData, opening_balance: e.target.value })} style={inputStyle} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setIsAccountModalOpen(false)} style={{ padding: '11px 18px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--color-foreground)' }}>Batal</button>
                <button type="submit" disabled={submitting} style={{ padding: '11px 22px', borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: 'var(--color-on-primary)', fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Menyimpan...' : 'Simpan Rekening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
