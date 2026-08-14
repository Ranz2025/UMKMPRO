import { useMemo, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Btn, Badge, Spinner, EmptyState } from '../components/ui/SharedUI';
import client from '../api/client';

const FILE_TEMPLATES = [
  {
    type: 'products',
    title: 'Import Produk',
    desc: 'Upload CSV/XLSX untuk menambah atau memperbarui produk berdasarkan SKU.',
    columns: ['name', 'sku', 'category_name', 'barcode', 'description', 'cost_price', 'selling_price', 'stock', 'min_stock', 'is_active'],
    sample: 'name,sku,category_name,barcode,description,cost_price,selling_price,stock,min_stock,is_active',
  },
  {
    type: 'customers',
    title: 'Import Customer',
    desc: 'Upload CSV/XLSX untuk menambah atau memperbarui customer berdasarkan email/phone.',
    columns: ['name', 'phone', 'email', 'address'],
    sample: 'name,phone,email,address',
  },
];

function SectionCard({ title, desc, children }) {
  return (
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm, 0 2px 10px rgba(0,0,0,0.04))', overflow: 'hidden' }}>
      <div style={{ padding: '20px 20px 0' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-foreground)' }}>{title}</h2>
        <p style={{ margin: '6px 0 0', color: 'var(--color-muted-fg)', fontSize: '0.875rem', lineHeight: 1.55 }}>{desc}</p>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function FileHint({ columns, sample }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {columns.map((col) => <Badge key={col} tone="muted">{col}</Badge>)}
      </div>
      <div style={{ padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-muted-fg)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Header contoh</div>
        <code style={{ fontSize: 13, color: 'var(--color-foreground)', wordBreak: 'break-all' }}>{sample}</code>
      </div>
    </div>
  );
}

export default function ImportPage() {
  const { addToast } = useToast();
  const [type, setType] = useState('products');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null);

  const template = useMemo(() => FILE_TEMPLATES.find((t) => t.type === type), [type]);

  const handleUpload = async (commit = false) => {
    if (!file) {
      addToast('Pilih file CSV/XLSX dulu.', 'error');
      return;
    }
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);
    if (commit) formData.append('commit', '1');

    setBusy(true);
    try {
      const res = await client.post('/v1/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreview(res.data?.data || null);
      addToast(commit ? 'Import berhasil diproses.' : 'Preview import berhasil dibuat.', 'success');
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal memproses import.';
      addToast(message, 'error');
      setPreview(err.response?.data?.data || null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
      <div style={{
        padding: 24,
        borderRadius: 'var(--radius-xl)',
        border: '1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border))',
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 10%, transparent), color-mix(in srgb, var(--color-accent) 8%, transparent))',
        boxShadow: 'var(--shadow-lg, 0 24px 50px rgba(0,0,0,0.06))',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Badge tone="primary">Import</Badge>
            <Badge tone="muted">CSV</Badge>
            <Badge tone="muted">XLSX</Badge>
            <Badge tone="success">Produk</Badge>
            <Badge tone="accent">Customer</Badge>
          </div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 900, color: 'var(--color-foreground)' }}>
            Upload data produk dan customer secara cepat.
          </h1>
          <p style={{ margin: 0, maxWidth: 760, color: 'var(--color-muted-fg)', fontSize: '1rem', lineHeight: 1.65 }}>
            Gunakan satu file CSV atau XLSX, lihat preview error/valid row terlebih dahulu, lalu commit ke database hanya jika datanya sudah benar.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {FILE_TEMPLATES.map((item) => (
          <SectionCard key={item.type} title={item.title} desc={item.desc}>
            <FileHint columns={item.columns} sample={item.sample} />
          </SectionCard>
        ))}
      </div>

      <SectionCard title="Upload File" desc="Pilih tipe import, unggah file, lalu preview hasil sebelum commit.">
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-muted-fg)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tipe Import</span>
              <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-foreground)' }}>
                <option value="products">Produk</option>
                <option value="customers">Customer</option>
              </select>
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-muted-fg)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>File CSV / XLSX</span>
              <input type="file" accept=".csv,.txt,.xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ padding: '11px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-foreground)' }} />
            </label>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Btn type="button" variant="secondary" onClick={() => handleUpload(false)} disabled={busy} icon={busy ? <Spinner size={14} /> : null}>
              Preview
            </Btn>
            <Btn type="button" variant="primary" onClick={() => handleUpload(true)} disabled={busy} icon={busy ? <Spinner size={14} color="var(--color-on-primary)" /> : null}>
              Commit ke Database
            </Btn>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Hasil Preview" desc="Baris valid akan ditulis ke database saat commit. Baris error ditampilkan di sini.">
        {preview ? (
          <div style={{ display: 'grid', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              {[
                ['Total Row', preview.total_rows ?? 0],
                ['Valid', preview.valid_count ?? 0],
                ['Error', preview.error_count ?? 0],
              ].map(([label, value]) => (
                <div key={label} style={{ padding: 16, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', background: 'var(--color-muted)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-muted-fg)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-foreground)' }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800 }}>Baris error</h3>
              {preview.errors?.length ? preview.errors.map((err) => (
                <div key={`${err.row}-${err.errors.join(',')}`} style={{ padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid color-mix(in srgb, var(--color-destructive, #EF4444) 20%, var(--color-border))', background: 'color-mix(in srgb, var(--color-destructive, #EF4444) 6%, transparent)' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <Badge tone="destructive">Baris {err.row}</Badge>
                    <span style={{ fontSize: 13, color: 'var(--color-muted-fg)' }}>{err.errors.join(' • ')}</span>
                  </div>
                  <pre style={{ margin: 0, padding: 12, borderRadius: 'var(--radius-sm)', background: 'var(--color-background)', border: '1px solid var(--color-border)', overflowX: 'auto', fontSize: 12, color: 'var(--color-muted-fg)' }}>
                    {JSON.stringify(err.data, null, 2)}
                  </pre>
                </div>
              )) : <EmptyState title="Tidak ada error" description="Semua baris valid dan siap di-commit." icon="✅" />}
            </div>
          </div>
        ) : (
          <EmptyState
            title="Belum ada preview"
            description="Upload file lalu klik Preview untuk melihat validasi baris dan memastikan data aman sebelum commit."
            icon="📄"
          />
        )}
      </SectionCard>
    </div>
  );
}
