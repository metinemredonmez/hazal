# Hazal Muti — Real Estate

Single-broker premium real estate website for Hazal Mutin.

## Repo layout

```
hazal-muti/
├── backend/      NestJS + Prisma + PostgreSQL — REST API + Socket.io chat + AI + Auth (2FA, Google OAuth)
└── frontend/     Next.js 15 + Tailwind + shadcn/ui  (coming next)
```

## Quickstart

See [`backend/README.md`](backend/README.md) for the API setup, env vars, and deploy notes.
See [`backend/API_KEYS_CHECKLIST.md`](backend/API_KEYS_CHECKLIST.md) for the third-party credentials checklist.

## Stack

| Layer | Tech |
|---|---|
| Backend API | NestJS 11, Prisma 6, Postgres 16, Redis 7, Socket.io |
| Auth | JWT + TOTP 2FA + Google OAuth |
| AI | OpenAI (gpt-4o-mini) — listing description, translation, reply suggestions |
| Storage | Local disk (dev), Cloudflare R2 (prod) |
| Frontend (planned) | Next.js 15, TypeScript, Tailwind, shadcn/ui, next-intl (TR/EN) |
| Hosting | VPS (Ubuntu 24.04) + CyberPanel + native Postgres/Redis |
