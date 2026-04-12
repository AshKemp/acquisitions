# Acquisitions Docker Setup (Neon Local + Neon Cloud)
This project uses two Docker Compose setups:
- `docker-compose.dev.yml`: local development with Neon Local proxy and ephemeral branches
- `docker-compose.prod.yml`: production runtime using Neon Cloud (`DATABASE_URL`) without Neon Local

## Files Added
- `Dockerfile`
- `docker-compose.dev.yml`
- `docker-compose.prod.yml`
- `.env.development`
- `.env.production`
- `.dockerignore`

## 1) Development: Run App + Neon Local
Development compose starts:
- `app` container (Express app)
- `neon-local` container (`neondatabase/neon_local:latest`)

The app connects to:
- `DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb`

Neon Local creates ephemeral branches by default when no `BRANCH_ID` is set. You can optionally set `PARENT_BRANCH_ID` to choose which branch to branch from.

### Prepare `.env.development`
Set these values in `.env.development`:
- `NEON_API_KEY`
- `NEON_PROJECT_ID`
- optional `PARENT_BRANCH_ID`
- `JWT_SECRET`

### Start development
```bash
docker compose --env-file .env.development -f docker-compose.dev.yml up --build
```

### Stop development
```bash
docker compose --env-file .env.development -f docker-compose.dev.yml down
```

## 2) Production: Run App + Neon Cloud DB
Production compose starts only the app container and connects directly to Neon Cloud through `DATABASE_URL` from `.env.production`.

No Neon Local proxy is used in production.

### Prepare `.env.production`
Set these values in `.env.production`:
- `DATABASE_URL` (your Neon cloud connection string)
- `JWT_SECRET`
- `ARCJET_KEY` (if used)

### Start production
```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
```

### Stop production
```bash
docker compose --env-file .env.production -f docker-compose.prod.yml down
```

## Environment Switching Summary
- Development uses Neon Local:
  - `DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb`
  - `NEON_LOCAL=true`
- Production uses Neon Cloud:
  - `DATABASE_URL=postgresql://...neon.tech...`
  - `NEON_LOCAL=false`

The app’s database config (`src/config/database.js`) automatically switches Neon serverless driver settings based on `NEON_LOCAL`.
