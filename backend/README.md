# Hazal Mutin Real Estate — Backend

NestJS + Prisma + PostgreSQL backend for the Hazal Mutin real estate site.

Single-broker design (one admin user — Hazal). Multilingual content (TR / EN). Built for a Next.js frontend that the design team will own.

---

## Requirements

- **Node.js ≥ 20** (developed on Node 22)
- **Yarn 1.x** (Classic) — `yarn install` is the package manager of record
- **Docker + Docker Compose** — **local only**, runs Postgres & Redis for development
- Production server runs **native** Postgres / Redis (not in Docker)

---

## Local development setup

```bash
# 1. Clone & install
cd backend
yarn install

# 2. Start local Postgres + Redis under the "hazal" Docker Compose project
docker compose up -d
# Containers: hazal-postgres (host port 5434), hazal-redis (host port 6381)
# Custom host ports avoid clashing with other projects already on 5432/5433/6379/6380.
# In Docker Desktop they appear grouped under the "hazal" name.

# 3. Copy env file
cp .env.example .env
# default values already point at the docker-compose services

# 4. Run DB migration + seed (creates admin user from .env)
yarn prisma:migrate     # creates tables
yarn prisma:seed        # creates admin + default site settings

# 5. Start API (runs on the host, NOT in Docker)
yarn dev                # = yarn start:dev (watch mode)
```

Useful Docker commands for the `hazal` group:

```bash
docker compose ps              # status of hazal-postgres / hazal-redis
docker compose logs -f         # follow logs
docker compose stop            # pause both services (keeps data)
docker compose down            # stop + remove containers (keeps data via named volumes)
docker compose down -v         # ⚠️ also wipes the postgres + redis volumes
```

API → `http://localhost:3001`
Swagger docs → `http://localhost:3001/docs`
Static uploads → `http://localhost:3001/uploads/<filename>`

---

## Environment files

| File | Where | Status |
|---|---|---|
| `.env`                    | Local dev      | gitignored, kept on each developer machine |
| `.env.example`            | Local template | committed |
| `.env.production`         | Production server | gitignored, lives only on the server |
| `.env.production.example` | Prod template  | committed |

**Never commit `.env` or `.env.production`.** They're already in `.gitignore`.

### Required variables

```
PORT, NODE_ENV, PUBLIC_URL, CORS_ORIGINS
DATABASE_URL          # postgres connection
REDIS_URL             # redis connection (reserved for future use)
JWT_SECRET            # generate with: openssl rand -hex 64
JWT_EXPIRES_IN        # e.g. 7d
ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME   # used only by `prisma:seed`
UPLOAD_DIR            # e.g. ./uploads (dev), /var/lib/hazal-muti/uploads (prod)
MAX_FILE_SIZE_MB
```

---

## Docker policy

- **Local:** Use `docker compose up -d` to start Postgres + Redis only. They run under the **`hazal`** Compose project (you'll see the group in Docker Desktop). The Node/NestJS app itself runs on the host with `yarn dev` — never in Docker. The frontend (Next.js, separate repo) is the same: `yarn dev` on the host.
- **Production:** No Docker at all. Postgres + Redis run as native services on the server. The Node app runs via `pm2`, `systemd`, or similar. See "Production deployment notes" below.

---

## Yarn scripts

```bash
yarn dev             # alias: yarn start:dev — watch mode
yarn start           # one-off start
yarn start:prod      # serve compiled dist/
yarn build           # nest build → dist/

yarn prisma:generate # regenerate Prisma client (after schema changes)
yarn prisma:migrate  # create + apply a new migration in dev
yarn prisma:deploy   # apply pending migrations on prod (no prompts)
yarn prisma:studio   # open Prisma Studio GUI
yarn prisma:seed     # run prisma/seed.ts (admin + default settings)
yarn db:reset        # ⚠️ drop everything and re-seed
```

> Add a top-level `dev` script alias if you want; current `package.json` exposes `start:dev`.

---

## Architecture

```
src/
├── main.ts                 # bootstrap, CORS, helmet, swagger, static /uploads
├── app.module.ts
├── prisma/                 # PrismaService (global)
├── auth/                   # JWT login, /api/auth/{login,me,change-password}
├── listings/               # public GET + admin CRUD + image management
├── inquiries/              # public POST + admin inbox/CRM
├── chat/                   # WebSocket gateway (Socket.io) + admin REST
├── settings/               # singleton site settings (TR/EN content, brand, contact)
├── uploads/                # multer disk storage → returns public URL
└── common/dto/             # shared DTOs (pagination)
```

---

## Public API (no auth)

All endpoints prefixed with `/api`.

| Method | Path | Notes |
|---|---|---|
| `GET`  | `/listings`               | List active listings; supports `type, category, city, district, q, minPrice, maxPrice, currency, minBedrooms, featured, sort, page, pageSize` |
| `GET`  | `/listings/featured`      | Top featured active listings (max 6) |
| `GET`  | `/listings/:slug`         | Listing detail (increments `views`) |
| `POST` | `/inquiries`              | Submit a contact / lead form |
| `GET`  | `/chat/history?visitorId=…` | Pull visitor's chat history before opening WS |
| `GET`  | `/settings/public`        | Brand, contact, hero copy, social links, default locale/currency |

## Admin API (Bearer JWT)

Login with `POST /api/auth/login`. Use the returned `accessToken` in `Authorization: Bearer <token>` headers.

### Login flow (with optional 2FA)

```
POST /api/auth/login
  body: { email, password }
  → if 2FA OFF: { accessToken, admin }
  → if 2FA ON:  { requires2fa: true, ticketToken, admin: { id, email, name } }

  (if requires2fa)
  POST /api/auth/2fa/verify
    body: { ticketToken, code: "123456" }
    → { accessToken, admin }
```

After `password.changed`, `2fa.enabled`, or `2fa.disabled` the **tokenVersion** bumps and ALL existing JWTs are invalidated. The user must log in again. Account locks for **15 min** after **5** consecutive failed login attempts.

### Endpoints

| Method | Path | Notes |
|---|---|---|
| `POST`  | `/auth/login` | `{ email, password }` |
| `POST`  | `/auth/2fa/verify` | `{ ticketToken, code }` (only when 2FA on) |
| `GET`   | `/auth/me` | Current admin (no secrets) |
| `PATCH` | `/auth/profile` | `{ name?, phone?, avatarUrl? }` |
| `POST`  | `/auth/change-password` | `{ currentPassword, newPassword }` |
| `GET`   | `/auth/2fa/status` | `{ enabled, pending }` |
| `POST`  | `/auth/2fa/setup` | Generates secret → `{ secret, otpauthUrl, qrCodeDataUri }` |
| `POST`  | `/auth/2fa/enable` | `{ code }` confirms setup, activates 2FA |
| `POST`  | `/auth/2fa/disable` | `{ password }` requires re-auth |
| `GET`   | `/auth/audit-log` | All security events (paginated) |
| `GET`   | `/auth/google/status` | `{ configured: bool }` |
| `GET`   | `/auth/google` | (browser) start Google OAuth |
| `GET`   | `/auth/google/callback` | (Google redirects here) → redirects to FRONTEND_URL/auth/callback#token=... |
| `GET`   | `/admin/listings` | All listings (any status) |
| `GET`   | `/admin/listings/stats` | Dashboard counts + top-viewed |
| `GET`   | `/admin/listings/:id` | One listing |
| `POST`  | `/admin/listings` | Create |
| `PATCH` | `/admin/listings/:id` | Update |
| `DELETE`| `/admin/listings/:id` | Delete |
| `POST`  | `/admin/uploads/listings/:id/images` | Multipart upload (field name `files`, up to 20) — saves and attaches |
| `POST`  | `/admin/uploads` | Generic multipart upload — returns URLs |
| `POST`  | `/admin/listings/:id/images` | Attach already-uploaded image URLs |
| `DELETE`| `/admin/listings/:id/images/:imageId` | Detach an image |
| `PATCH` | `/admin/listings/:id/images/reorder` | `{ imageIds: [...] }` — first becomes primary |
| `GET`   | `/admin/inquiries` | Inbox (filter by `status`, `q`, `listingId`) |
| `PATCH` | `/admin/inquiries/:id` | Update status / notes |
| `DELETE`| `/admin/inquiries/:id` | Remove |
| `GET`   | `/admin/chat/sessions` | All chat sessions with last message + unread count |
| `GET`   | `/admin/chat/sessions/:id` | Full message history |
| `GET`   | `/admin/chat/unread-count` | Total unread |
| `POST`  | `/admin/chat/sessions/:id/read` | Mark visitor messages as read |
| `PATCH` | `/admin/chat/sessions/:id/close` | Close a chat session |
| `GET`   | `/admin/settings` | Full site settings |
| `PATCH` | `/admin/settings` | Update site settings |
| `GET`   | `/admin/ai/status` | `{ enabled, model }` — is OpenAI configured? |
| `POST`  | `/admin/ai/generate-description` | `{ title, bullets, type, category, ... }` → `{ titleTr, titleEn, descriptionTr, descriptionEn }` |
| `POST`  | `/admin/ai/translate` | `{ text, source, target }` (tr/en) |
| `POST`  | `/admin/ai/suggest-reply` | `{ inquiryId, locale?, tone? }` → drafted reply text |

---

## Live chat (WebSocket)

Socket.io namespace: **`/chat`**

### Visitor

```js
const socket = io(`${API_URL}/chat`, {
  query: { visitorId: localStorage.getItem('visitorId') /* uuid */ },
});

socket.on('visitor:connected', ({ sessionId }) => { /* ... */ });

// optional: identify visitor
socket.emit('visitor:start', { visitorId, visitorName: 'Ali', visitorEmail: 'ali@x.com' });

socket.emit('visitor:message', { visitorId, content: 'Merhaba' });

socket.on('chat:message', ({ sessionId, message }) => { /* render */ });
socket.on('chat:typing',  ({ sender, typing }) => { /* indicator */ });
```

### Admin

```js
const socket = io(`${API_URL}/chat`, {
  auth: { token: accessToken },
});

socket.on('admin:connected', ({ adminId }) => { /* ... */ });
socket.on('admin:new-message',     ({ sessionId, message }) => { /* notification */ });
socket.on('admin:session-updated', (session) => { /* refresh sidebar */ });

socket.emit('admin:join-session', { sessionId });   // also marks read
socket.emit('admin:reply', { sessionId, content: 'Hello!' });
```

---

## Production deployment notes

1. Provision a server (Ubuntu/Debian recommended) with:
   - **Node 20+** (use [`fnm`](https://github.com/Schniz/fnm) or `nvm`)
   - **Postgres 16** native install (`apt install postgresql-16`)
   - **Redis 7** native install (`apt install redis-server`)
   - **Nginx** reverse proxy + Let's Encrypt
   - Process manager — `pm2` or a systemd unit
2. `git clone` → `yarn install --frozen-lockfile`
3. `cp .env.production.example .env.production` → fill in real values → `chmod 600 .env.production`
4. `yarn build`
5. `NODE_ENV=production yarn prisma:deploy`
6. First-time only: `NODE_ENV=production yarn prisma:seed` (creates admin)
7. Start with `pm2 start dist/main.js --name hazal-muti-api --env production`
8. Nginx reverse proxy: `proxy_pass http://127.0.0.1:3001;` plus `proxy_http_version 1.1` and the `Upgrade` / `Connection` headers for WebSockets

---

## Frontend integration (for the design team)

- **Stack expected:** Next.js 15 (App Router) + TypeScript + `next-intl` for TR/EN
- All API calls hit `/api/...`, base URL from `NEXT_PUBLIC_API_URL`
- Socket.io: `const socket = io(`${NEXT_PUBLIC_API_URL}/chat`, ...)`
- Login flow: store `accessToken` in an httpOnly cookie via a Next.js route handler, or in memory for SPA-style admin
- Image URLs returned by upload endpoints are absolute (`PUBLIC_URL` + `/uploads/...`) — usable directly in `<Image src=...>`

---

## 🔑 Third-party credentials checklist

| # | Service | Purpose | Status | Cost | Where to get it |
|---|---|---|---|---|---|
| 1 | **Google OAuth (Client ID + Secret)** | Login with Google for Hazal | **REQUIRED** | Free | [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) — create OAuth client (Web app) → set redirect URI to `http://localhost:3001/api/auth/google/callback` (dev) and `https://api.hazalmuti.com/api/auth/google/callback` (prod) |
| 2 | **OpenAI API key** | AI listing descriptions, translation, reply drafts | Optional but useful | ~$5–20/month | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) — pick `gpt-4o-mini` for cheap, `gpt-4o` for quality |
| 3 | **Mapbox access token** | Map on listing detail + filter | Recommended | Free up to 50k loads/mo | [account.mapbox.com/access-tokens](https://account.mapbox.com/access-tokens) — public token (frontend uses it) |
| 4 | **Cloudflare R2** *or* **AWS S3** | Production file storage (replace local disk) | Required for prod | R2: free up to 10GB | R2: [dash.cloudflare.com](https://dash.cloudflare.com/) → R2 → API token. S3: AWS console |
| 5 | **SMTP credentials** (SendGrid / Resend / Postmark) | Email notifications (new inquiry, password reset later) | Recommended | Free tier exists | [resend.com](https://resend.com) (3K/mo free) or [sendgrid.com](https://sendgrid.com) |
| 6 | **Domain DNS** (`hazalmuti.com`) | Production hosting | Required | Already owned | Point A record to your VPS, CNAME `api` to API server, set MX if email. Cloudflare front recommended |
| 7 | **SSL** (Let's Encrypt via Certbot) | HTTPS in production | Required | Free | Configure with Nginx + Certbot |
| 8 | **Google Analytics 4** (Measurement ID) | Visitor analytics | Optional | Free | [analytics.google.com](https://analytics.google.com) — frontend reads `gaId` from `/settings/public` |
| 9 | **Google Search Console** verification | SEO indexing | Optional | Free | [search.google.com/search-console](https://search.google.com/search-console) |
| 10 | **Server / VPS** | Production hosting | Required | $5–20/mo | Hetzner, DigitalOcean, AWS Lightsail |
| 11 | **(future)** WhatsApp Business API | Direct WhatsApp inbox | Optional | Paid | Meta Business |

> **Currently the backend works without ANY of these — it'll just disable the corresponding features (Google login → 503, AI endpoints → 503). Add them when ready.**

### What you need to give me first

1. **Google OAuth Client ID + Secret** (most urgent — you said this was a requirement)
2. **OpenAI API key** (you said you'll get it from ChatGPT — `platform.openai.com/api-keys`)

Drop them in `.env` like:

```bash
GOOGLE_CLIENT_ID=12345-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxx
```

Then restart the API. Both features become live, no code change needed.

---

## Default admin (after seed)

```
email:    hazalmuti@hotmail.com
password: (whatever was in .env ADMIN_PASSWORD)
```

> **Production:** Change the password immediately after first login via `POST /api/auth/change-password`.

---

## Useful local commands

```bash
# Reset everything (dev only — wipes the hazal-postgres + hazal-redis volumes)
docker compose down -v && docker compose up -d
yarn db:reset
yarn prisma:seed

# Inspect data
yarn prisma:studio

# Check API contract
open http://localhost:3001/docs
```
