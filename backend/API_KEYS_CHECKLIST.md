# API Keys & 3rd-Party Service Checklist

Backend without any of these still runs — features just stay off. Tick them as you obtain them.

## 🔥 Required for full launch

- [ ] **Google OAuth — Client ID & Secret**
  Where: https://console.cloud.google.com/apis/credentials → OAuth client ID → Web application
  Redirect URIs:
    - `http://localhost:3001/api/auth/google/callback` (dev)
    - `https://api.hazalmuti.com/api/auth/google/callback` (prod)
  Env: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`

- [ ] **Domain + DNS** — `hazalmuti.com` (already owned)
  - A record `@` → VPS IP
  - CNAME `api` → VPS or `@`
  - CNAME `www` → `hazalmuti.com`

- [ ] **Production VPS** (Hetzner / DigitalOcean / Lightsail)
  - Ubuntu 22+ recommended
  - Postgres 16 + Redis 7 native install
  - Node 20+ + pm2

- [ ] **SSL via Let's Encrypt** (`certbot --nginx`)

## ⭐ Strongly recommended

- [ ] **OpenAI API Key**
  Where: https://platform.openai.com/api-keys
  Cost: ~$5–20/month (gpt-4o-mini default)
  Env: `OPENAI_API_KEY`, `OPENAI_MODEL`

- [ ] **Mapbox Access Token** (public, used by frontend)
  Where: https://account.mapbox.com/access-tokens
  Cost: Free up to 50K loads/mo
  Goes into: site settings → `mapboxToken` (saved via admin UI, not env)

- [ ] **Cloudflare R2 OR AWS S3** (production object storage)
  R2: https://dash.cloudflare.com → R2 → "Manage R2 API tokens"
  S3: AWS console → IAM user → access key
  Why: local disk uploads work in dev, but production needs durable + CDN-friendly storage
  Env (added later): `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`

- [ ] **SMTP / Email Provider** (for inquiry notifications, password reset later)
  Easiest: https://resend.com (3K free emails/mo)
  Alternatives: SendGrid, Postmark, Mailgun
  Env (added later): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`

## 🔍 Marketing / SEO

- [ ] **Google Analytics 4** — Measurement ID (G-XXXXXX)
  Where: https://analytics.google.com
  Saved in site settings → `gaId`

- [ ] **Google Search Console** — site verification
  Where: https://search.google.com/search-console
  Add the verification HTML/DNS record once site is up

- [ ] **Google My Business** profile (Hazal as a real estate agent)
  Free, very high SEO impact for "İstanbul emlak" type searches

## 📲 Optional / Future

- [ ] **WhatsApp Business** number (frontend "Chat on WhatsApp" link)
  Saved in site settings → `whatsapp` (e.g. `+905325127628`)

- [ ] **Sentry** (error monitoring)
  Where: https://sentry.io
  Optional but very useful in production

- [ ] **Cloudflare** in front of the site (CDN + DDoS + analytics)

## 🛡️ Security secrets to GENERATE (not buy)

- [ ] **JWT_SECRET** — generate with `openssl rand -hex 64` and put in `.env.production`. Different per environment.

- [ ] Production **postgres password** (use a long random string in `DATABASE_URL`)

- [ ] **Admin password** — change immediately after first login via `POST /api/auth/change-password`

## ✅ Already configured / built-in

- [x] **PostgreSQL** (local: docker `hazal-postgres`, prod: native install)
- [x] **Redis** (local: docker `hazal-redis`, prod: native install)
- [x] **bcrypt** for password hashing
- [x] **TOTP 2FA** (Google Authenticator / Authy compatible) — no service needed
- [x] **Audit log** — built-in to the DB
- [x] **Account lockout** (5 fails → 15 min lock) — built-in
- [x] **Token versioning** (revoke all tokens on password/2FA change) — built-in
