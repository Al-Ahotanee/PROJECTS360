# Projects360 Deep Code Audit Report

**Audit scope:** Angular frontend, NestJS API, PostgreSQL/Neon schema, Render deployment configuration, route coverage, authentication, authorization, build integrity, and automated tests.

**Audit conclusion:** The codebase is now **buildable and partially hardened**, but it is **not functionally complete enough to claim that all original APIs, workflows, and product functionalities are working perfectly**. The highest-risk auth defect was corrected: order summaries are now JWT-protected and scoped to the authenticated subject. Signup, login, current-user lookup, API client foundations, and executable backend tests were also added. The product remains a partial refactor because many original workflows are still represented by static UI placeholders or have no backend endpoint.

## Verification summary

| Check | Result | Evidence |
|---|---:|---|
| Angular production build | PASS | `npm run build:web` completes successfully |
| NestJS production build | PASS | `npm run build:api` completes successfully |
| Full workspace build | PASS | `npm run build` completes successfully |
| API unit tests | PASS | 3 suites, 8 tests passed |
| Previous no-test failure | FIXED | Jest configuration and auth/order/guard tests added |
| Direct Angular route serving | PASS with SPA fallback | `/catalog` renders when hosted with the included SPA fallback server; Render rewrite is configured |
| Neon database connectivity | NOT EXECUTED | No live `DATABASE_URL` was supplied in the audit sandbox |
| Full HTTP API smoke test | NOT EXECUTED | Requires a live PostgreSQL database and seeded credentials |
| Payment/file/email workflows | NOT IMPLEMENTED | No provider adapters or endpoint handlers are present |
| Production dependency audit | FAIL / remediation required | `npm audit --omit=dev` reports 23 vulnerabilities: 8 moderate, 14 high, and 1 critical; several fixes require breaking NestJS/Angular upgrades |

## Endpoint inventory

The API global prefix is `/api` (`apps/api/src/main.ts`). The following endpoint contract is present in the current code:

| Endpoint | Method | Status | Notes |
|---|---|---|---|
| `/api/health` | GET | Implemented | Executes `select now()` against PostgreSQL and reports connection status |
| `/api/auth/login` | POST | Implemented and unit-tested | Validates credentials with bcrypt and returns a seven-day JWT |
| `/api/auth/signup` | POST | Implemented and unit-tested | Hashes passwords, inserts a student user, and maps duplicate email errors to HTTP 409 |
| `/api/auth/me` | GET | Implemented | Requires a bearer JWT and returns the current profile |
| `/api/projects` | GET | Implemented | Supports a `search` query and returns published topics |
| `/api/projects/featured` | GET | Implemented | Returns up to six published topics ordered by featured status |
| `/api/orders/summary` | GET | Implemented and unit-tested | Requires a bearer JWT and scopes rows to `request.user.sub` |
| `/api/faqs` | GET | Implemented | Returns published FAQs ordered by sort order |
| `/api/docs` | GET | Implemented | Swagger UI is registered, although individual bearer/security metadata is not yet annotated on every route |

## Security findings

> **Critical ownership issue corrected.** The previous order endpoint accepted `/summary/:userId` and did not verify the caller. It now accepts `/summary`, requires `JwtAuthGuard`, and derives the user ID from the verified token. The correction is covered by `orders.controller.spec.ts`.

The current authentication implementation is suitable as a foundation but still needs production hardening. A production dependency audit also reports 23 vulnerabilities in the installed dependency tree, including high-severity advisories in `js-yaml`, `lodash`, and `multer`, plus a critical `tar` advisory. The available automated remediation includes breaking upgrades to major NestJS/Angular packages in this dependency set, so these should be addressed in a dedicated dependency-upgrade branch with a fresh build, test, and deployment verification rather than applying `npm audit fix --force` blindly.

 There is no refresh-token or token-revocation mechanism, no rate limiting on login/signup, no email verification, no password-reset flow, and no role guard for administrative functionality. The JWT secret is correctly configured through environment variables, but the application should validate environment variables at startup rather than relying on `getOrThrow` only for selected settings.

The PostgreSQL pool is small and free-tier friendly, but there is no graceful shutdown hook to close the pool, no query timeout, and no centralized database exception mapping. These are operational hardening items rather than compile blockers.

## Frontend integration findings

The Angular API client now exists at `apps/web/src/app/core/api.client.ts`, and login is connected to `/api/auth/login`; a successful response stores `p360_token` and navigates to `/dashboard`. The HTTP interceptor attaches that token to subsequent calls.

However, the catalog, dashboard, FAQ, orders, services, profile, and landing pages still use in-memory or hard-coded presentation data. The API client methods for projects, FAQs, current user, and order summary are available but are not yet consumed by those pages. Consequently, a user can navigate the UI without a database, but the UI does not yet reflect live Neon records across all primary workflows.

The sign-in screen currently has no visible inline error binding even though the component stores an `error` message. The signup link still routes to the dashboard rather than a dedicated account-creation form, despite the new backend signup endpoint. These are confirmed UX integration gaps.

## Missing product functionality

The refactor does not yet implement the full original product surface. The following areas require additional API modules, Angular screens, database operations, or provider integrations before they can be described as functional:

| Area | Current state |
|---|---|
| Project detail/brief creation | Catalog cards are display-only; no project detail endpoint or order creation flow |
| Payments and invoices | No payment initiation, webhook, verification, invoice generation, or payment status endpoint |
| File uploads and deliverables | Schema exists, but no upload/storage adapter or file endpoints |
| Reviews and ratings | Not present in the new schema or API |
| Referrals and ambassador operations | Tables exist, but no controllers/services/forms are implemented |
| Admin dashboard and moderation | No role guard, admin module, or admin endpoints |
| Messaging, corrections, installments, notifications | Not implemented as API workflows |
| Profile update | UI is currently local state only; no PATCH profile endpoint |
| Live dashboard metrics | Dashboard values are hard-coded; no metrics endpoint |

## Deployment assessment

The Render blueprint is structurally suitable for a GitHub monorepo with one Node web service and one static site. The Angular build passes and produces `apps/web/dist/projects360-web/browser`. The SPA rewrite is present in `render.yaml`. The API requires a valid Neon `DATABASE_URL` and `JWT_SECRET` before it can start; this was not tested against a live database in the sandbox.

Before production deployment, run `database/001_initial_schema.sql` against Neon, add the API environment variables, deploy the API first, set the Angular site’s origin in `WEB_ORIGIN`, and then verify `/api/health`, `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`, `/api/projects`, `/api/projects/featured`, `/api/faqs`, and `/api/orders/summary` with a real token.

## Go/no-go recommendation

**Go for UI review and API foundation testing. No-go for claiming full production feature completeness.** The stack compiles, the core auth/order security regression is covered, and the deployment shape is sound. The next engineering milestone should be live API integration for catalog/dashboard/FAQ/orders followed by order creation and payment workflows. Until those are implemented and exercised against Neon, the product should be treated as a polished functional prototype rather than a complete replacement for the original system.

## References

[1]: `apps/api/src/main.ts` — API prefix, CORS, validation, Swagger, and bootstrap.
[2]: `apps/api/src/auth/auth.module.ts` — signup, login, current-user contract, password hashing, and JWT issuance.
[3]: `apps/api/src/auth/jwt-auth.guard.ts` — bearer verification and request user hydration.
[4]: `apps/api/src/orders/orders.module.ts` — JWT-scoped order summary query.
[5]: `apps/web/src/app/core/api.client.ts` — Angular API client foundation.
[6]: `apps/web/src/app/core/auth.interceptor.ts` — browser token attachment.
[7]: `database/001_initial_schema.sql` — Neon-compatible relational schema and seed data.
[8]: `render.yaml` — Render service and SPA rewrite configuration.
[9]: `apps/api/src/**/*.spec.ts` — executable authentication, guard, and order tests.
