# MentorLagbe Backend — agent notes

Express 5 + MongoDB (Atlas) REST API, ESM (`"type": "module"`), plain JS. No TypeScript, no test/lint/typecheck tooling configured.

## Run

```
npm install
# create .env (no .env.example exists; see required vars below)
node index.js          # dev: node --watch index.js
```

**Important:** `npm start` and `npm run dev` are broken — they point to `src/server.js`, which does not exist. The real entrypoint is root `index.js`. Do not "fix" the scripts unless you also create `src/server.js`.

The app connects to MongoDB Atlas via `MONGODB_URI` (no local database to install). `src/config/db.js` runs `ensureIndexes()` on startup (unique email, unique application tuition+student, unique payment transactionId).

## Environment

`src/config/env.js` validates at import and `process.exit(1)` if any required var is missing:

```
MONGODB_URI, MONGODB_DB, JWT_SECRET, STRIPE_SECRET_KEY,
IMGBB_API_KEY, CORS_ALLOWED_ORIGIN, CLIENT_URL
```

`.env` and `.env.*` are gitignored and contain real test Stripe keys — never commit them. `PORT` defaults to 5000 if unset (not validated).

## Seed (optional, needs `.env` first)

```
npm run seed          # admin@mentorlagbe.com / admin123, tutor@ / tutor123, student@ / student123 + 12 tuitions
npm run seed:admin    # ensures admin@mentorlagbe.com (MentorAdmin@2026!)
```

README's "Copy .env.example to .env" is stale — no `.env.example` exists.

## Auth

JWT in `Authorization: Bearer <token>` (7d expiry). Middleware in `src/middleware/auth.middleware.js`: `verifyToken`, `verifyStudent`, `verifyTutor`, `verifyAdmin`. Roles: `student`, `tutor`, `admin`.

## Routes (mounted in index.js)

- `/api/auth` — register, login, sync (BetterAuth user sync → JWT), me
- `/api/users` — profile GET/PUT
- `/api/tuitions` — search/filter/pagination, create (tutor), by id, PUT/DELETE (tutor), mine, applicants, application PATCH
- `/api/applications` — create, mine, bookmark CRUD
- `/api/payments` — checkout, webhook, imgbb upload, revenue, stats
- `/api/admin` — users list, role change, tuition pending/approve/reject

## Quirks

- Stripe webhook (`/api/payments/webhook`) uses `express.raw()` **before** `express.json()` in `index.js` so the raw body is available for signature verification — do not reorder these body parsers.
- Raw MongoDB driver (`mongodb` package), no Mongoose; `src/models/` is empty.
- `src/utils/validation.js` holds Joi schemas used by routes.
- Deployment: Vercel (`vercel.json` routes all traffic to `index.js` via `@vercel/node`). `page.js` is a stale serverless shim importing missing `./server.js`.

## Verification

No test suite or `npm test` exists. Manual verification: start server, hit `GET /` → "MentorLagbe API running", then exercise endpoints from README with a bearer token from `/api/auth/login`.