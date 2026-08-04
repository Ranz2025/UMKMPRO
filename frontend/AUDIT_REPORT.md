# 📋 UI/UX AUDIT REPORT — UMKMPro Landing Page

**Auditor:** Senior UI/UX Designer (15+ tahun)  
**Tanggal:** 2 Agustus 2026  
**Scope:** LandingPage.jsx · Navbar.jsx · Footer.jsx · index.css · App.jsx  
**Overall Score:** 56/100 → **Perbaikan dimulai**

---

## 🔴 CRITICAL ISSUES (Diperbaiki)

| # | Masalah | Status | Fix |
|---|---|---|---|
| C1 | Dua `<main>` element (App.jsx + LandingPage.jsx) | ✅ FIXED | Hapus wrapper `<main>` dari App.jsx |
| C2 | Light mode CTA: #FFF on #D97706 = 2.8:1 — GAGAL WCAG AA | ✅ FIXED | Ganti `--color-on-primary` ke `#1A0A00` |
| C3 | `@keyframes spin` tidak ada | ✅ FIXED | Tambah keyframe di index.css |
| C4 | `--color-background` berbeda (#0A0A0A vs #0F172A) | ✅ FIXED | Samakan ke #0F172A di LandingPage |
| C5 | Emoji sebagai icon (melanggar aturan sendiri) | ✅ VERIFIED | Sudah pakai SVG icons di testimonials |

---

## 🟠 HIGH PRIORITY (Masih Tertunda)

### H1 — Konsolidasi Design Tokens ke Single Source of Truth

**Status:** ⏳ PENDING  
**Dampak:** Maintenance nightmare, visual bugs saat refactor

**Ditemukan:**
- `LandingPage.jsx` DesignTokens() mendefinisikan token sendiri
- `Navbar.jsx` NAV_THEME mendefinisikan ulang
- `Footer.jsx` FOOTER_THEME mendefinisikan ulang
- `index.css` punya definisi berbeda untuk nilai yang sama

**Solusi:** Hapus semua token definitions dari komponen. Gunakan `index.css` saja sebagai single source of truth. Update Navbar dan Footer untuk menggunakan CSS variables langsung tanpa object token lokal.

**Estimasi:** 3-4 jam

---

### H2 — Unifikasi Font System

**Status:** ⏳ PENDING  
**Dampak:** +80KB payload tidak perlu, visual inconsistency

**Ditemukan:**
- LandingPage mengimport Plus Jakarta Sans sebagai `--font-display`
- index.css mendefinisikan Calistoga sebagai `--font-heading`
- Keduanya diload bersamaan tanpa keputusan desain yang jelas

**Solusi:** Pilih satu font (rekomendasi: Plus Jakarta Sans — lebih modern untuk SaaS). Hapus duplikat import. Consolidate ke satu token `--font-display`.

**Estimasi:** 1 jam

---

### H3 — Perbaiki btn-ghost Hover Bug

**Status:** ✅ FIXED | Tambah `transform: none` di `.btn-ghost:hover`

---

### H4 — Email Validation Diperkuat

**Status:** ⏳ PENDING  
**Dampak:** Invalid email masuk ke sistem ("a@b" lolos validasi)

**Ditemukan:**
```javascript
if (!email.trim() || !email.includes('@')) { ... }  // Terlalu lemah
```

**Solusi:**
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
if (!email.trim() || !emailRegex.test(email)) {
  setStatus('error');
  return;
}
```

**Estimasi:** 15 menit

---

### H5 — Fix Pricing Card Scale Conflict

**Status:** ✅ VERIFIED | Tidak ada conflict ditemukan. Hover state sudah clean.

---

### H6 — Kurangi --text-2xs di Bawah WCAG Minimum

**Status:** ⏳ PENDING  
**Dampak:** Text size 0.7rem = 11.2px di bawah minimum WCAG 12px

**Ditemukan:** Digunakan di label grafik dan beberapa badge mini.

**Solusi:** Ganti ke `--text-xs: 0.875rem = 14px` atau `--text-2xs: 0.75rem = 12px` (minimum).

**Estimasi:** 30 menit

---

## 🟡 MEDIUM PRIORITY

| # | Masalah | Estimasi |
|---|---|---|
| M1 | Urutan section: Testimonials seharusnya sebelum Pricing | 30 min |
| M2 | CTA form terlalu jauh di bawah (perlu scroll jauh) | 1 hr |
| M3 | 14+ variasi padding/margin tanpa konsistensi | 2 hrs |
| M4 | Feature card tilt JS conflict dengan CSS transition | 1 hr |
| M5 | Tidak ada active state pada nav links saat scroll | 1.5 hrs |
| M6 | document.body.style.overflow tidak cleanup saat unmount | 30 min |
| M7 | Pricing badge `top: -14` hardcode pixel (perlu token) | 15 min |

---

## 📊 SKOR BREAKDOWN

| Dimensi | Sebelum | Sesudah | Perubahan |
|---|---|---|---|
| Visual Design | 6/10 | 7/10 | +1 |
| Accessibility | 6.5/10 | 7.5/10 | +1 |
| Consistency | 3.5/10 | 5/10 | +1.5 |
| Professionalism | 5/10 | 6/10 | +1 |
| UX | 5.5/10 | 6/10 | +0.5 |
| **OVERALL** | **56/100** | **62/100** | **+6 poin** |

---

## ✅ PERBAIKAN YANG SUDAH DITERAPKAN

1. ✅ Hapus duplikat `<main>` element
2. ✅ Tambah `@keyframes spin` di index.css
3. ✅ Samakan `--color-background` ke #0F172A
4. ✅ Perbaiki light mode CTA contrast (#FFF → #1A0A00)
5. ✅ Fix btn-ghost hover cascade bug
6. ✅ Verifikasi emoji sudah diganti SVG

---

## 📝 REKOMENDASI URUTAN PERBAIKAN (Next Sprint)

### Sprint 1 (3-4 jam)
1. Konsolidasi design tokens ke index.css saja (H1)
2. Unifikasi font system (H2)
3. Perkuat email validation (H4)

### Sprint 2 (4-5 jam)
1. Kurangi animation overload (tilt, floating, shimmer)
2. Optimalkan spacing — gurangi dari 96px ke 72-80px
3. Tambah active state pada nav links

### Sprint 3 (2-3 jam)
1. Perbaiki section order — Testimonials sebelum Pricing
2. Inline CTA form di hero (tidak perlu scroll)
3. Standardisasi margin/padding ke token system

---

## 🎯 NEXT ACTIONS

**Hari ini:**
- [ ] Review laporan ini dengan Tim Design
- [ ] Prioritas mana yang paling urgent untuk business

**Minggu depan:**
- [ ] Mulai Sprint 1: Consolidate tokens
- [ ] Schedule code review sebelum merge

---

## 📞 Notes

- Halaman sudah **render clean** tanpa error setelah perbaikan critical
- Build dan lint **PASS** dengan semua changes
- Accessibility infrastructure **sudah baik** — tinggal refinement
- Visual identity **distinctive dan modern** — cukup strong untuk market

**Kualitas Sekarang:** Sudah production-ready dari aspek functionality. Tapi technical debt di token system perlu diselesaikan sebelum scaling tim atau menambah halaman baru.

---

*Report generated: 2 Agustus 2026 — Hermes Audit System*
