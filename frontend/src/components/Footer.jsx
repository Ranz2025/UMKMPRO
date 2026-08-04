import { useState } from 'react';

const FOOTER_LINKS = {
  Produk: [
    { label: 'Fitur', href: '#features' },
    { label: 'Manfaat', href: '#benefits' },
    { label: 'Harga', href: '#pricing' },
    { label: 'Testimoni', href: '#testimonials' },
    { label: 'Coba Gratis', href: '#cta' },
  ],
  Perusahaan: [
    { label: 'Tentang Kami', href: '#' },
    { label: 'Karir', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Press Kit', href: '#' },
  ],
  Dukungan: [
    { label: 'Pusat Bantuan', href: '#' },
    { label: 'Dokumentasi', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Status Sistem', href: '#' },
  ],
};

const SOCIALS = [
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96C1 8.12 1 12 1 12s0 3.88.46 5.58a2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95C23 15.88 23 12 23 12s0-3.88-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: '#',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: '#',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.01a8.17 8.17 0 004.78 1.52V7.08a4.85 4.85 0 01-1.01-.39z" />
      </svg>
    ),
  },
];

// Placeholder handler
function handlePlaceholderClick(e) {
  e.preventDefault();
  alert('Halaman ini sedang dalam pengembangan.');
}

function FooterLogo() {
  const [hover, setHover] = useState(false);
  return (
    <a
      href="#hero"
      aria-label="UMKMPro — kembali ke atas"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 12, width: 'fit-content', textDecoration: 'none' }}
    >
      <div
        style={{
          width: 40, height: 40, borderRadius: 'var(--radius-sm)',
          background: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: hover ? '0 12px 28px rgba(245,158,11,0.35)' : '0 8px 20px rgba(245,158,11,0.25)',
          transform: hover ? 'translateY(-2px)' : 'none',
          transition: 'transform 200ms ease, box-shadow 200ms ease',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M3 14V8l6-5 6 5v6H11v-4H7v4H3z" fill="var(--color-background)" />
        </svg>
      </div>
      <div>
        <span
          style={{ fontFamily: 'var(--font-display, inherit)', fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--color-foreground)', display: 'block', lineHeight: 1.1 }}
        >
          UMKMPro
        </span>
        <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-muted-fg)', letterSpacing: '0.06em' }}>
          Platform #1 UMKM Indonesia
        </span>
      </div>
    </a>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        position: 'relative',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border-subtle)',
      }}
      aria-label="Footer UMKMPro"
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 160,
          background: 'linear-gradient(to bottom, var(--color-muted), transparent)',
          pointerEvents: 'none',
          opacity: 0.5,
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.018,
          backgroundImage:
            'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
        }}
      />

      <div
        style={{
          position: 'relative',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '48px var(--space-lg, 24px) 40px',
        }}
      >
        <div className="footer-link-grid">
          <div className="footer-brand-col">
            <FooterLogo />

            <p
              style={{
                marginTop: 16, marginBottom: 20,
                maxWidth: 300,
                fontSize: 'var(--text-sm)',
                lineHeight: 'var(--leading-relaxed)',
                color: 'var(--color-muted-fg)',
              }}
            >
              Platform SaaS all-in-one untuk UMKM Indonesia — kelola keuangan, stok,
              dan pelanggan dalam satu dasbor yang sederhana dan powerful.
            </p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SOCIALS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  onClick={handlePlaceholderClick}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center',
                    width: 44, height: 44,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-card)',
                    color: 'var(--color-muted-fg)',
                    transition: 'border-color 200ms ease, color 200ms ease, transform 200ms ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.color = 'var(--color-primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.color = 'var(--color-muted-fg)';
                    e.currentTarget.style.transform = '';
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h3
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display, inherit)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--color-foreground)',
                  marginBottom: 18,
                }}
              >
                {group}
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {links.map(({ label, href }) => {
                  const isPlaceholder = href === '#';
                  return (
                    <li key={label}>
                      <a
                        href={href}
                        onClick={isPlaceholder ? handlePlaceholderClick : undefined}
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-muted-fg)',
                          transition: 'color 150ms ease',
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '4px 0',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted-fg)'; }}
                      >
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: '40px',
            paddingTop: '24px',
            borderTop: '1px solid var(--color-border-subtle, var(--color-border))',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignItems: 'center',
            textAlign: 'center',
          }}
          className="footer-bottom"
        >
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle, var(--color-muted-fg))' }}>
            © {year} UMKMPro · Dibuat dengan{' '}
            <span aria-label="cinta" style={{ color: 'var(--color-primary)' }}>♥</span>{' '}
            untuk UMKM Indonesia
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 20px' }}>
            {[
              { label: 'Kebijakan Privasi', href: '#' },
              { label: 'Syarat & Ketentuan', href: '#' },
              { label: 'Keamanan Data', href: '#' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={handlePlaceholderClick}
                style={{
                  fontSize: 'var(--text-2xs)',
                  color: 'var(--color-text-subtle, var(--color-muted-fg))',
                  transition: 'color 150ms ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 0',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-muted-fg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-subtle, var(--color-muted-fg))'; }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .footer-link-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
        }
        @media (min-width: 640px) {
          .footer-link-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .footer-link-grid {
            grid-template-columns: 1fr 1fr 1fr;
            gap: 36px;
          }
          .footer-brand-col {
            grid-column: 1 / -1;
            max-width: 480px;
          }
        }
        @media (min-width: 1024px) {
          .footer-link-grid {
            grid-template-columns: 1.3fr 0.9fr 0.9fr 0.9fr;
            gap: 56px;
          }
        }
        @media (min-width: 640px) {
          .footer-bottom {
            flex-direction: row !important;
            justify-content: space-between;
            text-align: left !important;
          }
        }
      `}</style>
    </footer>
  );
}