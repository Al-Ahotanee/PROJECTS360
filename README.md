# Projects360 Platform

Projects360 is a professional academic project marketplace for discovering curated project topics, requesting delivery services, tracking orders, and managing student and ambassador operations. This repository is a complete stack refactor from the original React/Supabase implementation into an Angular + Angular Material frontend and NestJS + PostgreSQL backend.

The product is organized as a small monorepo. `apps/web` contains the Angular client and `apps/api` contains the NestJS REST API. The API owns authentication, validation, business rules, and database access. PostgreSQL is designed for Neon, while Render hosts the Angular static site and NestJS web service.

## Local development

Use Node.js 20 or newer. Copy `apps/api/.env.example` to `apps/api/.env`, set a local or Neon `DATABASE_URL`, then install dependencies from the repository root with `npm install`. Start the API with `npm run dev:api` and the Angular client with `npm run dev:web`. The client defaults to `http://localhost:4200` and proxies `/api` to `http://localhost:3000`.

The API exposes a health endpoint at `/api/health`. Database setup is provided in `database/001_initial_schema.sql`; it is intentionally idempotent enough for a new Neon project and can be run in the Neon SQL Editor or through the included migration command.

## Production shape

Deploy `apps/web` as a Render Static Site with build command `npm ci && npm run build:web` and publish directory `apps/web/dist/projects360-web/browser`. Deploy `apps/api` as a Render Web Service with build command `npm ci && npm run build:api` and start command `npm run start:prod --workspace apps/api`. Set `DATABASE_URL` to the pooled Neon connection string and configure `WEB_ORIGIN` to the public Angular URL.

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the complete GitHub, Neon, Render, environment, migration, and troubleshooting procedure.

## Expanded workflow surface

The updated refactor includes project-topic detail pages, authenticated order creation and detail workspaces, brief submission, payment-state confirmation through a replaceable adapter boundary, cancellation, reviews, live profile editing, service requests, file metadata records, referrals, ambassador applications, notifications, and admin order/user views. Apply `database/001_initial_schema.sql` followed by `database/002_workflows.sql` before exercising these routes against Neon.

The Angular routes include `/projects/:id`, `/orders`, `/orders/:id`, `/services`, `/profile`, `/ambassador`, and `/notifications`. The API contract and live smoke-test sequence are documented in `docs/DEPLOYMENT.md`.
