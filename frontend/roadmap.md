# UMKMPro Landing Page — Roadmap Implementasi hingga Deployment

**Status Saat Ini:** Code freeze selesai (2026-08-02)  
**Target Deployment:** 2026-08-09  
**Total Sprint:** 7 hari (1 minggu)

---

## 📋 PHASE 1: FINAL POLISH & TESTING (2026-08-02 hingga 2026-08-04)

### 1.1 Visual Testing & Browser Compatibility
**Durasi:** 1 hari | **Owner:** QA/Dev  
**Deliverables:**
- [ ] Test desktop (Chrome, Firefox, Safari, Edge)
- [ ] Test tablet (iPad 10", iPad Pro 12.9")
- [ ] Test mobile (iPhone 12/14/15, Pixel 6/7, Samsung S21)
- [ ] Verify dark/light theme toggle di semua device
- [ ] Screenshot audit: Hero, Features, Benefits, Pricing, Testimonials, CTA, Footer
- [ ] Cek alignment, spacing, typography di breakpoints: 320px, 768px, 1024px, 1440px

**Success Criteria:**
- ✅ Semua section render tanpa overflow
- ✅ Metrics (12K+, 94%, 4.9) centered di mobile/tablet/desktop
- ✅ CTA heading readable dan rapi di semua ukuran
- ✅ No visual glitches atau broken layout
- ✅ Dark mode contrast AA/AAA di semua text

---

### 1.2 Performance Audit
**Durasi:** 0.5 hari | **Owner:** Dev  
**Deliverables:**
- [ ] Lighthouse audit (desktop & mobile)
- [ ] Core Web Vitals check: LCP, FID, CLS
- [ ] Bundle size analysis (gzip)
- [ ] Image optimization check
- [ ] CSS/JS minification verification

**Target Metrics:**
- Performance score: ≥90
- LCP: <2.5s
- FID: <100ms
- CLS: <0.1

**If below target:**
- [ ] Optimize canvas particle effect
- [ ] Lazy load testimonials carousel
- [ ] Minify index.css
- [ ] Check unused CSS removal

---

### 1.3 Accessibility Audit
**Durasi:** 0.5 hari | **Owner:** QA  
**Deliverables:**
- [ ] axe DevTools scan — 0 violations
- [ ] WAVE browser extension scan
- [ ] Keyboard navigation test (Tab, Enter, Esc, Arrow keys)
- [ ] Screen reader test (NVDA/JAWS — Windows; VoiceOver — macOS)
- [ ] Color contrast ratio verification (WCAG AA minimum)
- [ ] Form accessibility: labels, error messages, success states

**Success Criteria:**
- ✅ 0 critical/serious accessibility issues
- ✅ All interactive elements keyboard accessible
- ✅ Screen reader announces headings, buttons, form fields correctly
- ✅ No color-only information conveyance

---

### 1.4 Content Review & Copywriting
**Durasi:** 0.5 hari | **Owner:** Product/Marketing  
**Deliverables:**
- [ ] Typo check: Hero, Features, Benefits, Pricing, Testimonials, CTA, Footer
- [ ] Grammar & tone consistency (Indonesian formal/professional)
- [ ] Call-to-action clarity: "Coba Gratis 14 Hari", "Mulai Gratis", etc.
- [ ] Legal compliance: Privacy Policy, Terms & Conditions links functional
- [ ] Contact info & social links verified

**Changes Required:**
- [ ] If typos found: patch + rebuild + test
- [ ] If links broken: update + test navigation

---

## 📋 PHASE 2: STAGING DEPLOYMENT & UAT (2026-08-05)

### 2.1 Staging Build & Deployment
**Durasi:** 1 hari | **Owner:** DevOps/Dev  
**Deliverables:**
- [ ] Build production bundle: `npm run build`
- [ ] Verify dist/ folder: index.html, CSS, JS, assets present
- [ ] Deploy to staging server (e.g., staging.umkmpro.id)
- [ ] Verify build process logs: 0 errors
- [ ] Smoke test staging: Homepage loads, dark/light toggle works
- [ ] DNS/CDN cache: Staging domain resolves correctly

**Infrastructure Requirements:**
- Staging server (Rumahweb VPS or similar)
- SSL certificate (Let's Encrypt valid)
- Nginx/HTTP server configured
- Static file caching headers set (max-age: 86400 for assets)

**Commands:**
```bash
npm run build
# Verify dist/ output
ls -lh dist/
# Test local build
npm run preview
```

---

### 2.2 User Acceptance Testing (UAT)
**Durasi:** 1 hari | **Owner:** Product/QA/Stakeholders  
**Test Scenarios:**
- [ ] Open staging.umkmpro.id on desktop → loads within 3s
- [ ] Open on mobile → responsive layout, readable text
- [ ] Click all CTA buttons: "Coba Gratis 14 Hari", "Mulai Gratis", "Pilih Paket Pro", etc.
- [ ] Fill signup form: valid email → submit → success message appears
- [ ] Invalid email → error message appears
- [ ] Dark/light toggle → theme persists on refresh
- [ ] Click all navigation links: scroll to section works
- [ ] Testimonials section: scroll/carousel functional
- [ ] Pricing cards: hover effects smooth (if applicable)
- [ ] Footer links: navigate to correct pages

**Approval Sign-off:**
- [ ] Product Owner: ✅ Content & CTA approved
- [ ] Design: ✅ Visual alignment approved
- [ ] QA: ✅ Functionality approved
- [ ] Client/Stakeholder: ✅ Overall sign-off

---

### 2.3 Security Audit (Final)
**Durasi:** 0.5 hari | **Owner:** Security/Dev  
**Deliverables:**
- [ ] Check for XSS vulnerabilities (form inputs sanitized)
- [ ] Check for CSRF tokens (if applicable)
- [ ] Verify SSL/TLS configuration (A+ rating via SSL Labs)
- [ ] Check Security Headers: CSP, X-Frame-Options, X-Content-Type-Options
- [ ] No hardcoded API keys, secrets in codebase
- [ ] No console errors in prod build

**Security Headers to Verify:**
```
Content-Security-Policy: default-src 'self'
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
```

---

## 📋 PHASE 3: PRODUCTION DEPLOYMENT (2026-08-06 hingga 2026-08-07)

### 3.1 Pre-Deployment Checklist
**Durasi:** 0.5 hari | **Owner:** DevOps  
**Deliverables:**
- [ ] Backup current production (if applicable)
- [ ] Database migrations (none for static site, but verify if needed)
- [ ] Environment variables configured (.env.production)
- [ ] CDN/cache purge plan ready
- [ ] Rollback plan documented (revert to previous build if issues)
- [ ] Deployment window scheduled (off-peak hours recommended)

**Deployment Window:**
- Recommended: 2026-08-07 22:00 WIB (late evening, low traffic)
- Duration: 15-30 minutes
- Maintenance window: Brief (if applicable)

---

### 3.2 Production Deployment
**Durasi:** 0.5 hari | **Owner:** DevOps  
**Steps:**
1. [ ] SSH into production server
2. [ ] Pull latest code: `git pull origin main`
3. [ ] Install dependencies: `npm install`
4. [ ] Build: `npm run build`
5. [ ] Verify build: `ls -lh dist/`
6. [ ] Copy dist to web root:
   ```bash
   cp -r dist/* /var/www/umkmpro/
   ```
7. [ ] Restart web server (Nginx):
   ```bash
   sudo systemctl restart nginx
   ```
8. [ ] Verify service running:
   ```bash
   sudo systemctl status nginx
   ```
9. [ ] Clear CDN cache (if applicable)
10. [ ] Smoke test: https://umkmpro.id — loads, no errors

**Commands Checklist:**
```bash
# On production server
cd /home/deploy/umkmpro/frontend
git pull origin main
npm install --production
npm run build
sudo cp -r dist/* /var/www/umkmpro/
sudo systemctl restart nginx
sudo systemctl status nginx
curl https://umkmpro.id 2>/dev/null | head -20
```

---

### 3.3 Post-Deployment Verification
**Durasi:** 0.5 hari | **Owner:** QA/DevOps  
**Deliverables:**
- [ ] Production URL loads (https://umkmpro.id)
- [ ] Lighthouse score check (target ≥90)
- [ ] Browser compatibility spot check (Chrome, Firefox, Safari)
- [ ] Mobile responsive test
- [ ] Dark/light theme toggle works
- [ ] CTA buttons functional: email capture form submits
- [ ] Analytics integration working (if applicable)
- [ ] SSL certificate valid (check via SSL Labs)
- [ ] No 404 errors in console
- [ ] Response time <2.5s

**Monitoring Setup:**
- [ ] Error tracking enabled (e.g., Sentry, LogRocket)
- [ ] Performance monitoring active (e.g., New Relic, DataDog)
- [ ] Uptime monitoring active (e.g., Pingdom, Uptime Robot)
- [ ] Alerts configured for downtime/errors

---

### 3.4 Stakeholder Notification
**Durasi:** 0.25 hari | **Owner:** Product  
**Deliverables:**
- [ ] Send launch announcement to team/stakeholders
- [ ] Share live URL: https://umkmpro.id
- [ ] Include performance metrics & UAT sign-off
- [ ] Document deployment date/time (2026-08-07, WIB timezone)
- [ ] Thank all contributors

---

## 📋 PHASE 4: POST-LAUNCH MONITORING (2026-08-08 hingga 2026-08-09)

### 4.1 Real-Time Monitoring (24/7 first 48 hours)
**Durasi:** 2 hari | **Owner:** DevOps/QA  
**Metrics to Watch:**
- [ ] Server uptime (target: 99.9%)
- [ ] Page load time (target: <2.5s)
- [ ] Error rate (target: <0.1%)
- [ ] User traffic & engagement (Google Analytics)
- [ ] Mobile vs Desktop traffic split
- [ ] Geographic traffic distribution
- [ ] Form submission success rate
- [ ] CTA click-through rate

**Daily Check-in:**
- Morning (08:00 WIB): Review overnight metrics
- Afternoon (14:00 WIB): Spot-check functionality
- Evening (20:00 WIB): Verify no critical issues

---

### 4.2 Bug Triage & Hotfix Protocol
**Trigger:** Any critical issue detected during monitoring  
**Response Time:** <1 hour for critical, <4 hours for high

**Critical Issues (P0):**
- Site down/not loading
- CTA form not working
- XSS/security vulnerability
- Database errors

**High Issues (P1):**
- Broken layout on specific device
- Missing content/images
- Performance degradation (LCP >5s)

**Medium Issues (P2):**
- Typos, color misalignment
- Minor accessibility issue
- Dark mode bug

**Process:**
1. Log issue in bug tracker
2. Triage severity
3. Create hotfix branch: `git checkout -b hotfix/issue-name`
4. Fix code
5. Test locally
6. Create PR, get review
7. Merge to main
8. Deploy to production
9. Verify fix live
10. Close issue

---

### 4.3 User Feedback Collection
**Durasi:** Ongoing | **Owner:** Product  
**Deliverables:**
- [ ] Setup contact form responses monitoring
- [ ] Monitor email feedback from signup forms
- [ ] Track Google Analytics user behavior
- [ ] Watch social media mentions (@UMKMPro)
- [ ] Document feature requests for next phase

---

## 📋 PHASE 5: DOCUMENTATION & HANDOVER (2026-08-09)

### 5.1 Deployment Documentation
**Deliverables:**
- [ ] Deployment guide: step-by-step instructions for future deploys
- [ ] Runbook: troubleshooting common issues
- [ ] Infrastructure diagram: server, CDN, DNS setup
- [ ] Environment variables documented (.env template)
- [ ] Database schema (if applicable for future phases)
- [ ] API endpoints (if backend exists)

**Files to Create:**
- `DEPLOYMENT.md` — deployment procedures
- `RUNBOOK.md` — troubleshooting guide
- `INFRASTRUCTURE.md` — server setup details
- `.env.example` — environment template

---

### 5.2 Code Repository Cleanup
**Deliverables:**
- [ ] Remove debug logs/console.log statements
- [ ] Clean up unused branches: `git branch -D`
- [ ] Tag production release: `git tag -a v1.0.0 -m "Production launch 2026-08-07"`
- [ ] Push tags: `git push origin v1.0.0`
- [ ] Archive old branches to keep history clean
- [ ] Update README.md with live URL & setup instructions

---

### 5.3 Performance Baseline Capture
**Deliverables:**
- [ ] Screenshot Lighthouse report (desktop & mobile)
- [ ] Core Web Vitals baseline metrics
- [ ] Page load time baseline (real user monitoring)
- [ ] Error rate baseline
- [ ] Store baseline in `METRICS_BASELINE.md` for future comparison

---

### 5.4 Team Handover & Knowledge Transfer
**Deliverables:**
- [ ] Conduct handover meeting (30 min)
  - Deploy process demo
  - Monitoring dashboard walk-through
  - Escalation procedure review
- [ ] Share Slack/Telegram group for incidents
- [ ] Assign on-call rotation (if applicable)
- [ ] Document contact list for each role (DevOps, QA, Product, Designer)

---

## 📊 SUMMARY TIMELINE

| Date | Phase | Key Milestone |
|------|-------|---------------|
| 2026-08-02 | 1.1-1.4 | Code freeze, final testing |
| 2026-08-03 | 1.2-1.3 | Performance & accessibility audit |
| 2026-08-04 | 1.4 | Content review, UAT prep |
| 2026-08-05 | 2.1-2.2 | Staging deployment, UAT sign-off |
| 2026-08-06 | 2.3 | Security audit final |
| 2026-08-07 | 3.1-3.2 | **PRODUCTION DEPLOY** (22:00 WIB) |
| 2026-08-08 | 3.3-4.1 | Post-launch monitoring (24h) |
| 2026-08-09 | 4.2-5.4 | Bug triage, documentation, handover |

---

## 🎯 SUCCESS CRITERIA (LAUNCH)

**Functional:**
- ✅ Site loads <2.5s (LCP)
- ✅ All CTAs functional (form submit, links work)
- ✅ Dark/light theme toggle persistent
- ✅ Mobile responsive (320px-2560px)
- ✅ No 404 errors or missing assets

**Performance:**
- ✅ Lighthouse score ≥90 (desktop & mobile)
- ✅ Core Web Vitals all green
- ✅ Gzip size <100KB for bundle

**Accessibility:**
- ✅ WCAG AA compliant (axe DevTools 0 violations)
- ✅ Keyboard navigable
- ✅ Screen reader compatible

**Security:**
- ✅ SSL/TLS A+ rating
- ✅ Security headers present
- ✅ No XSS/CSRF vulnerabilities
- ✅ No hardcoded secrets

**Approval:**
- ✅ Product Owner sign-off
- ✅ Design sign-off
- ✅ QA sign-off
- ✅ Stakeholder approval

---

## 📝 NOTES & RISKS

### Risks:
1. **Browser compatibility issue** → Mitigation: Early cross-browser testing (Phase 1.1)
2. **Performance degradation in prod** → Mitigation: CDN caching, image optimization (Phase 2.1)
3. **Deployment downtime** → Mitigation: Deploy during low-traffic window, rollback plan ready (Phase 3.1)
4. **Form not capturing emails** → Mitigation: Test form before deploy, monitoring active (Phase 3.3)

### Rollback Plan:
If critical issue detected post-deployment:
1. SSH to production
2. Revert to previous build: `git revert HEAD` or restore backup
3. Run build: `npm run build`
4. Copy to web root: `cp -r dist/* /var/www/umkmpro/`
5. Restart Nginx: `sudo systemctl restart nginx`
6. Verify rollback success
7. Document incident

---

## 🔗 REFERENCES

- **Live URL:** https://umkmpro.id
- **Repository:** git@github.com:...frontend.git
- **Deployment Server:** Rumahweb VPS (202.10.36.35)
- **Monitoring Dashboard:** [Link to monitoring tool]
- **CI/CD Pipeline:** [Link to GitHub Actions or similar]

---

**Document Created:** 2026-08-02  
**Last Updated:** 2026-08-02  
**Owner:** Development Team  
**Status:** Ready for approval
