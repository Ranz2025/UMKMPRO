# UMKMPro Backend & Database — Development Roadmap

**Frontend Status:** ✅ Complete (2026-08-02)  
**Backend Status:** ❌ Not started  
**Database Status:** ❌ Not started  
**Target:** Backend & Database ready by 2026-08-20

---

## 📋 PHASE 1: ARCHITECTURE & PLANNING (2026-08-02 hingga 2026-08-05)

### 1.1 Technology Stack Decision
**Durasi:** 1 hari | **Owner:** Tech Lead/Architect

**Frontend Stack (DONE):**
- Framework: React 18
- Build tool: Vite
- Styling: Inline CSS + CSS variables
- State management: React hooks (useState, useContext)
- Theme: Dark/Light toggle via ThemeContext
- Deployment: Static hosting (Rumahweb VPS)

**Backend Stack (TO DECIDE):**

**Option A: Laravel (Recommended for Indonesian ecosystem)**
- Framework: Laravel 11 (latest LTS)
- PHP: 8.2+
- ORM: Eloquent
- API: RESTful + JSON
- Authentication: Laravel Sanctum (JWT tokens)
- Database: MySQL 8.0
- Queue: Redis (for email/notifications)
- Deployment: Docker or traditional Nginx/PHP-FPM

**Option B: Node.js (Alternative)**
- Framework: Express.js or Fastify
- Runtime: Node 20 LTS
- ORM: Prisma or TypeORM
- API: RESTful + JSON
- Authentication: JWT (jsonwebtoken)
- Database: MySQL 8.0 or PostgreSQL
- Queue: Bull (Redis-backed)
- Deployment: PM2 or Docker

**Recommendation:** **Laravel** (better for Indonesian hosting, familiar with team, proven UMKM ecosystem)

**Decision:**
- [ ] Confirm tech stack with team
- [ ] Document decision in BACKEND_STACK.md

---

### 1.2 API Specification & Design
**Durasi:** 2 hari | **Owner:** Backend Lead + Product

**API Endpoints (MVP):**

#### Authentication
```
POST   /api/auth/register          — Daftar akun baru
POST   /api/auth/login             — Login
POST   /api/auth/logout            — Logout
POST   /api/auth/refresh-token     — Refresh JWT token
POST   /api/auth/forgot-password   — Reset password
POST   /api/auth/reset-password    — Konfirmasi reset password
```

#### User Management
```
GET    /api/users/profile          — Get user profile
PUT    /api/users/profile          — Update profile
PUT    /api/users/password         — Change password
DELETE /api/users/account          — Delete account
```

#### Pricing & Plans
```
GET    /api/plans                  — List pricing plans (public)
GET    /api/plans/{id}             — Get plan details
POST   /api/subscriptions          — Create subscription
GET    /api/subscriptions          — Get user's subscription
DELETE /api/subscriptions/{id}     — Cancel subscription
```

#### Contact/Lead Capture
```
POST   /api/leads                  — Capture lead (email from form)
GET    /api/leads                  — List leads (admin only)
```

#### Testimonials (Admin)
```
GET    /api/testimonials           — List testimonials (public, cached)
POST   /api/testimonials           — Create testimonial (admin)
PUT    /api/testimonials/{id}      — Update testimonial (admin)
DELETE /api/testimonials/{id}      — Delete testimonial (admin)
```

#### Email Verification
```
POST   /api/emails/verify-send     — Send verification email
POST   /api/emails/verify-confirm  — Confirm email verification
```

**Deliverables:**
- [ ] API specification document (OpenAPI/Swagger)
- [ ] Request/response examples (JSON)
- [ ] Authentication flow diagram
- [ ] Error handling spec (HTTP status codes, error messages)
- [ ] Rate limiting policy (e.g., 100 req/min per IP)
- [ ] CORS policy defined

---

### 1.3 Database Schema Design
**Durasi:** 1.5 hari | **Owner:** Database Architect

**Core Tables:**

#### users
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  company_name VARCHAR(255),
  industry VARCHAR(100),
  verified_at TIMESTAMP NULL,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL, -- soft delete
  INDEX (email),
  INDEX (created_at)
);
```

#### subscriptions
```sql
CREATE TABLE subscriptions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL REFERENCES users(id),
  plan_id INT NOT NULL,
  status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
  started_at TIMESTAMP,
  expires_at TIMESTAMP,
  trial_ends_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (user_id),
  INDEX (status),
  INDEX (expires_at)
);
```

#### plans
```sql
CREATE TABLE plans (
  id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL, -- 'Starter', 'Pro', 'Enterprise'
  price_monthly INT, -- in rupiah, NULL for free
  price_yearly INT,
  description TEXT,
  max_businesses INT,
  max_transactions INT,
  features JSON, -- list of features
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### leads
```sql
CREATE TABLE leads (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  source VARCHAR(100), -- 'landing_page', 'cta_form', etc.
  status ENUM('new', 'contacted', 'converted', 'lost') DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (email),
  INDEX (status),
  INDEX (created_at)
);
```

#### testimonials
```sql
CREATE TABLE testimonials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT REFERENCES users(id),
  content TEXT NOT NULL,
  author_name VARCHAR(255),
  author_title VARCHAR(255),
  rating INT, -- 1-5
  active BOOLEAN DEFAULT TRUE,
  display_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (active),
  INDEX (display_order)
);
```

#### email_verifications
```sql
CREATE TABLE email_verifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL REFERENCES users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (token),
  INDEX (expires_at)
);
```

**Deliverables:**
- [ ] Database diagram (ER diagram)
- [ ] SQL migration files (using Laravel migrations or Flyway)
- [ ] Indexes defined for query performance
- [ ] Soft deletes configured
- [ ] Timestamps (created_at, updated_at) on all tables
- [ ] Foreign key constraints documented

---

### 1.4 Infrastructure Setup
**Durasi:** 1 day | **Owner:** DevOps

**Deployment Target:**
- Server: Rumahweb VPS (202.10.36.35) or similar
- OS: Ubuntu 22.04 LTS
- Web Server: Nginx
- PHP/Node runtime: PHP 8.2 (if Laravel) or Node 20 LTS (if Node.js)
- Database: MySQL 8.0 (existing or new)
- Queue: Redis 7 (existing per LAPNESIA notes)
- SSL: Let's Encrypt (free)

**Infrastructure Checklist:**
- [ ] VPS provisioned (if new)
- [ ] SSH access configured
- [ ] Firewall rules: allow 80, 443, 3306 (MySQL, internal only)
- [ ] Docker or traditional stack installed
- [ ] MySQL 8.0 installed (or verify existing)
- [ ] Redis 7 installed (or verify existing)
- [ ] Git repository set up
- [ ] Environment variables (.env) template created
- [ ] Nginx config for API domain (e.g., api.umkmpro.id)
- [ ] SSL certificate obtained (Let's Encrypt)

**Domains:**
- Frontend: umkmpro.id (existing)
- API: api.umkmpro.id (new)
- Admin: admin.umkmpro.id (future phase)

---

## 📋 PHASE 2: BACKEND DEVELOPMENT (2026-08-06 hingga 2026-08-15)

### 2.1 Project Setup
**Durasi:** 1 day | **Owner:** Backend Dev

**For Laravel:**
```bash
# Create new Laravel project
composer create-project laravel/laravel umkmpro-api --prefer-dist

# Install required packages
composer require laravel/sanctum
composer require laravel/tinker
composer require spatie/laravel-permission
composer require spatie/laravel-query-builder
```

**For Node.js (Express):**
```bash
# Create new project
npm init -y
npm install express dotenv cors helmet bcryptjs jsonwebtoken mysql2 prisma @prisma/client

# Setup Prisma
npx prisma init
```

**Deliverables:**
- [ ] Project initialized
- [ ] .env template created (.env.example)
- [ ] Database config verified
- [ ] Git repository initialized
- [ ] .gitignore configured
- [ ] README.md with setup instructions

---

### 2.2 Authentication System
**Durasi:** 2 days | **Owner:** Backend Dev

**Features:**
- [ ] User registration (email + password)
- [ ] Email verification (send OTP/link)
- [ ] Login with JWT token
- [ ] Password reset flow
- [ ] Token refresh mechanism
- [ ] Logout (invalidate token)
- [ ] Rate limiting (brute force protection)
- [ ] Password hashing (bcrypt)

**Deliverables:**
- [ ] Auth controller/handler
- [ ] JWT token generation & validation
- [ ] Email service (send verification emails)
- [ ] Tests: auth endpoints (unit + integration)
- [ ] Security audit: password policies, token expiry, etc.

---

### 2.3 User Management
**Durasi:** 1.5 days | **Owner:** Backend Dev

**Features:**
- [ ] Get user profile
- [ ] Update profile (name, phone, company, industry)
- [ ] Change password
- [ ] Delete account (soft delete)
- [ ] Profile picture upload (optional for MVP)

**Deliverables:**
- [ ] User controller/handler
- [ ] Profile update endpoints
- [ ] Validation rules
- [ ] Tests: profile endpoints

---

### 2.4 Pricing & Subscription
**Durasi:** 2 days | **Owner:** Backend Dev

**Features:**
- [ ] List pricing plans (public endpoint)
- [ ] Create subscription (free trial or paid)
- [ ] Get user's subscription
- [ ] Cancel subscription
- [ ] Upgrade/downgrade plan
- [ ] Trial period logic (14 days default)
- [ ] Subscription expiry check

**Integration (Future):**
- Payment gateway: Midtrans or Xendit (for paid tier)
- Webhook handling for payment confirmation

**Deliverables:**
- [ ] Subscription controller/handler
- [ ] Plan seeding (Starter/Pro/Enterprise)
- [ ] Subscription status logic
- [ ] Tests: subscription endpoints

---

### 2.5 Lead Capture & Email
**Durasi:** 1 day | **Owner:** Backend Dev

**Features:**
- [ ] POST /api/leads — capture email from landing page form
- [ ] Email validation (prevent duplicates)
- [ ] Store lead in database
- [ ] Send confirmation email
- [ ] Admin list leads (with filters: status, date)

**Deliverables:**
- [ ] Lead controller/handler
- [ ] Email queue job
- [ ] Email templates (HTML)
- [ ] Tests: lead capture endpoint

---

### 2.6 Admin Panel API
**Durasi:** 1.5 days | **Owner:** Backend Dev

**Features (MVP):**
- [ ] GET /api/admin/stats — dashboard stats (users, subscriptions, revenue)
- [ ] GET /api/admin/users — list all users
- [ ] GET /api/admin/leads — list all leads with filters
- [ ] GET /api/admin/subscriptions — list all subscriptions
- [ ] POST /api/admin/testimonials — create testimonial
- [ ] PUT /api/admin/testimonials/{id} — edit testimonial
- [ ] DELETE /api/admin/testimonials/{id} — delete testimonial
- [ ] Admin role middleware (protect endpoints)

**Deliverables:**
- [ ] Admin controller/handler
- [ ] Role-based access control (RBAC)
- [ ] Tests: admin endpoints

---

### 2.7 Testing & Documentation
**Durasi:** 1 day | **Owner:** Backend Dev + QA

**Testing:**
- [ ] Unit tests: auth, user, subscription logic (target: >80% coverage)
- [ ] Integration tests: all API endpoints
- [ ] Test database: separate test DB with seeding
- [ ] Run: `npm test` or `php artisan test`

**Documentation:**
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Setup guide: local development
- [ ] Deployment guide: production
- [ ] Troubleshooting guide

**Deliverables:**
- [ ] Test suite with >80% coverage
- [ ] Swagger/OpenAPI spec (auto-generated or manual)
- [ ] README.md with setup instructions

---

## 📋 PHASE 3: DATABASE SETUP & MIGRATION (2026-08-08 hingga 2026-08-12)

### 3.1 Database Initialization
**Durasi:** 0.5 day | **Owner:** DBA/DevOps

**Tasks:**
- [ ] Create database: `CREATE DATABASE umkmpro_db;`
- [ ] Create user with permissions:
  ```sql
  CREATE USER 'umkmpro'@'localhost' IDENTIFIED BY 'strong_password';
  GRANT ALL PRIVILEGES ON umkmpro_db.* TO 'umkmpro'@'localhost';
  FLUSH PRIVILEGES;
  ```
- [ ] Run migrations: `php artisan migrate` or `npx prisma migrate dev`
- [ ] Seed initial data: plans, admin user, sample testimonials
- [ ] Verify tables created: `SHOW TABLES;`

**Deliverables:**
- [ ] Database created with schema
- [ ] User/password configured (.env)
- [ ] Migrations executed successfully
- [ ] Data seeded (plans, initial data)

---

### 3.2 Backup & Recovery Setup
**Durasi:** 0.5 day | **Owner:** DevOps

**Tasks:**
- [ ] Configure automated backups (daily at 02:00 WIB)
- [ ] Backup location: /home/backups/ or S3
- [ ] Retention policy: 30 days minimum
- [ ] Test restore process
- [ ] Document backup procedure

**Backup Script Example (Bash):**
```bash
#!/bin/bash
BACKUP_DIR="/home/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mysqldump -u umkmpro -p'password' umkmpro_db > $BACKUP_DIR/umkmpro_$TIMESTAMP.sql
gzip $BACKUP_DIR/umkmpro_$TIMESTAMP.sql
echo "Backup completed: umkmpro_$TIMESTAMP.sql.gz"
```

**Deliverables:**
- [ ] Backup automation script
- [ ] Recovery documentation
- [ ] Tested restore process

---

### 3.3 Database Optimization
**Durasi:** 0.5 day | **Owner:** DBA

**Tasks:**
- [ ] Add indexes for frequently queried columns (email, status, created_at)
- [ ] Set up query log for performance analysis
- [ ] Configure slow query threshold (>1 second)
- [ ] Analyze table structure: `ANALYZE TABLE users;`
- [ ] Run EXPLAIN on critical queries

**Deliverables:**
- [ ] Indexes optimized
- [ ] Query performance verified
- [ ] Slow query log configured

---

## 📋 PHASE 4: FRONTEND-BACKEND INTEGRATION (2026-08-12 hingga 2026-08-16)

### 4.1 API Integration in Frontend
**Durasi:** 2 days | **Owner:** Frontend Dev

**Tasks:**
- [ ] Create API service layer (fetch/axios)
- [ ] Integrate signup form → POST /api/auth/register
- [ ] Integrate login → POST /api/auth/login
- [ ] Store JWT token in localStorage
- [ ] Add Authorization header to requests
- [ ] Handle API errors (401, 403, 500, etc.)
- [ ] Add loading states during API calls
- [ ] Test all integrations locally

**Deliverables:**
- [ ] API service (utils/api.js or services/)
- [ ] Auth context integration
- [ ] Error handling & user feedback
- [ ] Tests: API integration

---

### 4.2 Form Submissions
**Durasi:** 1 day | **Owner:** Frontend Dev

**Tasks:**
- [ ] CTA form "Coba Gratis" → captures email → POST /api/leads
- [ ] Pricing "Mulai Gratis" button → POST /api/subscriptions (create free plan)
- [ ] Add form validation (client-side)
- [ ] Success/error messages
- [ ] Email verification link (if applicable)

**Deliverables:**
- [ ] Working form submissions
- [ ] Success notifications
- [ ] Error handling

---

### 4.3 End-to-End Testing
**Durasi:** 1 day | **Owner:** QA

**Test Scenarios:**
- [ ] Register new user → verify email sent → confirm email → login
- [ ] Login with invalid credentials → error message
- [ ] Create subscription (free tier) → verify in database
- [ ] Capture lead → verify email sent → verify in admin dashboard
- [ ] User profile update → verify changes saved
- [ ] Password reset → verify email → reset successful

**Deliverables:**
- [ ] End-to-end test cases documented
- [ ] All tests passing
- [ ] Bug log (if any issues found)

---

## 📋 PHASE 5: STAGING & UAT (2026-08-17 hingga 2026-08-18)

### 5.1 Staging Deployment
**Durasi:** 1 day | **Owner:** DevOps

**Tasks:**
- [ ] Deploy backend to staging server
- [ ] Deploy frontend to staging server
- [ ] Configure staging .env (database, API URL, etc.)
- [ ] Run migrations on staging DB
- [ ] Verify API endpoints respond
- [ ] Verify frontend connects to staging API
- [ ] SSL certificates for staging domain

**Staging URLs:**
- API: https://api-staging.umkmpro.id
- Frontend: https://staging.umkmpro.id

**Deliverables:**
- [ ] Staging environment live
- [ ] All systems communicating
- [ ] Smoke test passed

---

### 5.2 UAT (User Acceptance Testing)
**Durasi:** 1 day | **Owner:** Product/QA/Stakeholders

**Test Scenarios:**
- [ ] Full user journey: visit landing → signup → verify email → login → view dashboard stub
- [ ] Lead capture form works
- [ ] Pricing plans display correctly
- [ ] Subscription creation works
- [ ] Admin can view leads & users (admin panel)
- [ ] Performance acceptable (response time <2s)
- [ ] No errors in browser console or server logs

**Approval:**
- [ ] Product Owner sign-off
- [ ] QA sign-off
- [ ] Stakeholder approval

**Deliverables:**
- [ ] UAT report with sign-off
- [ ] Bug list (if any)
- [ ] Go/No-Go decision

---

## 📋 PHASE 6: PRODUCTION DEPLOYMENT (2026-08-19 hingga 2026-08-20)

### 6.1 Production Database Migration
**Durasi:** 0.5 day | **Owner:** DBA/DevOps

**Tasks:**
- [ ] Create production database: umkmpro_prod
- [ ] Create production user with limited permissions
- [ ] Run migrations on production DB
- [ ] Verify schema matches staging
- [ ] Seed production data (plans, admin user)
- [ ] Backup production DB (pre-deployment)

**Deliverables:**
- [ ] Production DB ready
- [ ] Backup verified

---

### 6.2 Production Backend Deployment
**Durasi:** 0.5 day | **Owner:** DevOps

**Tasks:**
- [ ] Pull latest code: `git pull origin main`
- [ ] Install dependencies: `composer install` (Laravel) or `npm install` (Node)
- [ ] Build: `php artisan optimize` or `npm run build`
- [ ] Run migrations: `php artisan migrate --force`
- [ ] Restart web server: `sudo systemctl restart nginx php-fpm`
- [ ] Verify API endpoints respond
- [ ] Monitor error logs

**Production URLs:**
- API: https://api.umkmpro.id
- Frontend: https://umkmpro.id (already deployed)

**Deliverables:**
- [ ] Backend live in production
- [ ] API endpoints verified
- [ ] Error logs monitored

---

### 6.3 Production Frontend Deployment
**Durasi:** 0.25 day | **Owner:** DevOps

**Tasks:**
- [ ] Frontend already deployed (Phase 3 of frontend roadmap)
- [ ] Verify frontend connects to production API (api.umkmpro.id)
- [ ] Test full user flow in production
- [ ] Verify SSL certificates valid
- [ ] Monitor performance

**Deliverables:**
- [ ] Frontend-backend integration live
- [ ] Full system operational

---

### 6.4 Post-Launch Monitoring
**Durasi:** 2 days | **Owner:** DevOps/QA

**Monitoring Checklist:**
- [ ] Server uptime (target: 99.9%)
- [ ] API response time (target: <500ms)
- [ ] Database query performance
- [ ] Error rate (target: <0.5%)
- [ ] User signups & subscriptions tracking
- [ ] Lead capture rate
- [ ] Email delivery rate
- [ ] Scheduled backups running

**Tools:**
- Application monitoring: New Relic, DataDog
- Error tracking: Sentry, LogRocket
- Uptime monitoring: Pingdom, Uptime Robot
- Log aggregation: ELK Stack or CloudWatch

**Deliverables:**
- [ ] Monitoring dashboards set up
- [ ] Alerts configured
- [ ] 48-hour monitoring log

---

## 📊 TIMELINE SUMMARY

| Phase | Duration | Start | End | Status |
|-------|----------|-------|-----|--------|
| 1. Architecture & Planning | 4 days | Aug 2 | Aug 5 | ⏳ |
| 2. Backend Development | 10 days | Aug 6 | Aug 15 | ⏳ |
| 3. Database Setup | 4 days | Aug 8 | Aug 12 | ⏳ |
| 4. Frontend-Backend Integration | 3 days | Aug 12 | Aug 15 | ⏳ |
| 5. Staging & UAT | 2 days | Aug 16 | Aug 18 | ⏳ |
| 6. Production Deployment | 2 days | Aug 19 | Aug 20 | ⏳ |
| **TOTAL** | **25 days** | **Aug 2** | **Aug 20** | **⏳** |

---

## 🎯 SUCCESS CRITERIA

**Backend:**
- ✅ All API endpoints functional
- ✅ Authentication secure (JWT tokens, password hashing)
- ✅ Error handling comprehensive (400, 401, 403, 500, etc.)
- ✅ Rate limiting active (prevent abuse)
- ✅ Tests: >80% code coverage
- ✅ API documentation complete (Swagger)

**Database:**
- ✅ Schema matches design
- ✅ All migrations successful
- ✅ Indexes optimized
- ✅ Backups automated & tested
- ✅ Data integrity constraints in place
- ✅ Performance acceptable (query time <1s)

**Integration:**
- ✅ Frontend connects to backend without errors
- ✅ Form submissions work end-to-end
- ✅ Authentication flow complete (signup → email → login)
- ✅ Subscription creation functional
- ✅ Admin panel operational

**Deployment:**
- ✅ Production environment live
- ✅ SSL/TLS configured (A+ rating)
- ✅ Monitoring active
- ✅ Backups running
- ✅ Performance acceptable
- ✅ 99.9% uptime target

---

## 📝 ESTIMATED TEAM COMPOSITION

| Role | Time (%) | Responsibility |
|------|----------|-----------------|
| Backend Dev (Lead) | 100% | Architecture, auth, APIs |
| Backend Dev (Junior) | 80% | Endpoints, tests, integration |
| DBA/DevOps | 50% | Infrastructure, backups, deployment |
| Frontend Dev | 30% | API integration, testing |
| QA | 40% | Testing, UAT, monitoring |
| Product Manager | 20% | Requirements, sign-offs |

**Total: ~5 FTE for 25 days**

---

## 🔗 REFERENCES

- **Frontend Roadmap:** D:\UMKM\frontend\roadmap.md
- **Frontend Code:** D:\UMKM\frontend\
- **API Docs (to be created):** docs/API.md
- **Database Docs (to be created):** docs/DATABASE.md
- **Deployment Guide (to be created):** docs/DEPLOYMENT.md
- **Staging URL:** https://api-staging.umkmpro.id (pending)
- **Production URL:** https://api.umkmpro.id (pending)

---

**Document Created:** 2026-08-02  
**Last Updated:** 2026-08-02  
**Owner:** Development Team  
**Status:** Ready for tech stack approval
