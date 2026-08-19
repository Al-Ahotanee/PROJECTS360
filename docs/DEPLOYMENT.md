# Projects360 deployment guide

This guide deploys the repository as a small GitHub monorepo: an Angular static site on Render, a NestJS web service on Render, and PostgreSQL on Neon. Render static sites are served through a global CDN and can automatically redeploy from a linked Git branch [1]. Render web services use the repository build and start commands you define and redeploy on future pushes [2]. Neon supplies a standard PostgreSQL connection string, with pooled endpoints recommended for higher concurrency and SSL/TLS required for connections [3].

## 1. Push the repository to GitHub

Create a new GitHub repository, then from the project root run:

```bash
git init
git add .
git commit -m "Refactor Projects360 to Angular and NestJS"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/projects360-platform.git
git push -u origin main
```

Do not commit `.env` files or provider secrets. The supplied `.gitignore` excludes local environment files and build output.

## 2. Create the Neon database

Create a Neon project and open the **Connect** dialog. Select the production branch, database, role, and pooled connection option. Copy the resulting `DATABASE_URL`, which should resemble:

```text
postgresql://role:password@ep-example-pooler.region.aws.neon.tech/dbname?sslmode=require&channel_binding=require
```

Run `database/001_initial_schema.sql` in the Neon SQL Editor. The script creates the core tables and seed topics/FAQs. The original Supabase migrations are retained only as historical reference in the source archive; the new NestJS API uses the consolidated PostgreSQL schema.

## 3. Deploy the NestJS API on Render

In the Render Dashboard choose **New → Web Service**, connect the GitHub repository, and use the following configuration:

| Setting | Value |
|---|---|
| Root directory | `.` |
| Runtime | Node |
| Build command | `npm ci && npm run build:api` |
| Start command | `npm run start:prod --workspace apps/api` |
| Health check path | `/api/health` |
| Plan | Free for initial testing |

Add these environment variables:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | The pooled Neon connection string |
| `JWT_SECRET` | A long random secret; Render can generate one |
| `WEB_ORIGIN` | The final Angular Render URL |
| `PORT` | Leave unset so Render can provide it, or use `3000` locally |
| `PAYSTACK_SECRET_KEY` | Optional server-side payment key when payment integration is enabled |

The API is then available at `https://projects360-api.onrender.com`. Verify it with `https://projects360-api.onrender.com/api/health` and inspect Swagger at `/api/docs`.

## 4. Deploy the Angular site on Render

Choose **New → Static Site**, connect the same repository, and use:

| Setting | Value |
|---|---|
| Root directory | `.` |
| Build command | `npm ci && npm run build:web` |
| Publish directory | `apps/web/dist/projects360-web/browser` |
| Plan | Free |

Add a rewrite from `/*` to `/index.html`. This is required because Angular uses client-side routes such as `/catalog` and `/dashboard`. Set `API_BASE_URL` to the API URL if a later environment-specific API configuration is added; local development uses the included `proxy.conf.json`.

Once the static site URL exists, return to the API service and set `WEB_ORIGIN` to that exact URL. A redeploy applies the CORS policy.

## 5. Local development

```bash
npm install
cp apps/api/.env.example apps/api/.env
# Set DATABASE_URL and JWT_SECRET in apps/api/.env
npm run dev:api
# In a second terminal
npm run dev:web
```

The Angular application runs at `http://localhost:4200`, while the API runs at `http://localhost:3000`. The browser calls `/api`, and the Angular dev server proxies those calls to NestJS.

## 6. Production checks

After both services deploy, confirm the API health endpoint responds with `status: ok` and `database: connected`. Open the Angular site, test direct navigation to `/catalog` and `/dashboard`, confirm the Render rewrite prevents 404 responses, and verify the browser’s network requests target the API service rather than localhost. For payment, file storage, or email providers, keep keys server-side and add provider-specific adapters before enabling those production flows.

## 7. Free-tier considerations

Free hosted services can sleep when idle and have limited compute, bandwidth, and build minutes. Keep the API connection pool small, use Neon’s pooled connection string, avoid storing uploads on the ephemeral Render filesystem, and use an object-storage adapter for production files. If the product grows, move long-running work such as invoice generation, email, and file processing into a queue or scheduled worker.

## References

[1]: https://render.com/docs/static-sites "Render Static Sites documentation"
[2]: https://render.com/docs/deploy-node-express-app "Render Node deployment quickstart"
[3]: https://neon.com/docs/connect/connect-from-any-app "Neon: Connect from any application"
[4]: https://docs.nestjs.com/deployment "NestJS deployment guidance"

## 8. Workflow migration and API verification

After applying `database/001_initial_schema.sql`, apply `database/002_workflows.sql` against the same Neon database. The second migration is forward-only and adds project briefs, order events, service requests, reviews, payment state, profile metadata, notification indexes, and workflow indexes.

The expanded API is available under the `/api` prefix. Authenticated workflow groups include `POST /api/orders`, `GET /api/orders/:id`, `PUT /api/orders/:id/brief`, `POST /api/orders/:id/pay`, `POST /api/orders/:id/cancel`, `POST /api/orders/:id/review`, `GET/PATCH /api/profile`, `GET/POST /api/services`, `GET/POST /api/files`, `GET/POST /api/referrals`, `GET /api/ambassador/mine`, `GET/POST /api/notifications`, and the admin-only `/api/admin/*` routes. Public onboarding includes `POST /api/ambassador/apply`.

The payment route currently exercises the configured payment boundary by recording a payment reference and updating the order state. It is intentionally not a live payment processor integration. Replace that adapter behavior with the chosen provider’s checkout and webhook verification before accepting real money in production.

For a production smoke test, create a student through `/api/auth/signup`, use the returned bearer token to call `/api/projects`, create an order with `POST /api/orders`, submit a brief, verify the payment-adapter response, retrieve `/api/orders/:id`, add a file metadata record, submit a review, and confirm the corresponding notification. Verify admin routes with a user whose database role is `admin`.

## 9. Render build fix for missing Nest CLI

The repository now includes a root `.npmrc` with `include=dev`, and the Render blueprint explicitly uses `npm ci --include=dev` for both services. This is required because `@nestjs/cli` and `@angular/cli` are build-time `devDependencies`; when Render runs the build with production dependency omission enabled, `npm ci` can install the packages needed at runtime while omitting the CLI binaries required by the build commands. The previous `nest: not found` error was caused by that omission, not by a TypeScript or NestJS source error.

If configuring Render manually rather than using `render.yaml`, set the API build command to `npm ci --include=dev && npm run build:api` and the static-site build command to `npm ci --include=dev && npm run build:web`. Commit the `.npmrc` and `render.yaml` changes, push them to GitHub, then trigger a fresh deploy.
