# Hazal Muti Real Estate

Single-broker premium real estate platform.

## Repo layout

```
hazal-muti/
├── api/      NestJS backend     → api.hazalmuti.com    (port 3001)
├── web/      Next.js public     → hazalmuti.com        (port 3002)
└── admin/    Next.js admin      → admin.hazalmuti.com  (port 3003)
```

| App | Stack | Where it runs |
|---|---|---|
| **api** | NestJS 11, Prisma 6, Postgres 16, Redis 7, Socket.io, OpenAI, JWT+2FA+Google OAuth | `api.hazalmuti.com` (HTTPS via CyberPanel reverse proxy) |
| **web** | Next.js 16 + Tailwind v4 + shadcn/ui + Cormorant Garamond | `hazalmuti.com` — public marketing site (visitors) |
| **admin** | Next.js 16 + Tailwind v4 + shadcn/ui — compact, premium aesthetic | `admin.hazalmuti.com` — Hazal-only dashboard (auth-protected) |

## Local development

Postgres + Redis run in Docker (local only). Each app runs natively on the host.

```bash
# DB (terminal 1, kept running)
cd api
docker compose up -d
yarn install
yarn prisma:migrate
yarn prisma:seed
yarn dev                    # → http://localhost:3001 (Swagger /docs)

# Public site (terminal 2)
cd web
yarn install
yarn dev                    # → http://localhost:3002

# Admin panel (terminal 3)
cd admin
yarn install
yarn dev                    # → http://localhost:3003
```

> Production servers: **NO Docker**. Postgres/Redis are native services. Each Node app runs via `pm2`.

## Production

| Service | Port | URL | pm2 name |
|---|---|---|---|
| api    | 3001 | https://api.hazalmuti.com    | `hazal-api` |
| web    | 3002 | https://hazalmuti.com        | `hazal-web` |
| admin  | 3003 | https://admin.hazalmuti.com  | `hazal-admin` |

CyberPanel (OpenLiteSpeed) reverse-proxies each domain to its `localhost:<port>`. SSL via Let's Encrypt.

## Per-app docs

- API: [`api/README.md`](api/README.md)
- API keys checklist: [`api/API_KEYS_CHECKLIST.md`](api/API_KEYS_CHECKLIST.md)
