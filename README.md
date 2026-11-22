# MentorLagbe Backend

Express.js + MongoDB backend.

## Setup
1. npm install
2. Copy .env.example to .env and fill values.
3. npm run seed
4. npm start

## Env
PORT, MONGODB_URI, MONGODB_DB, JWT_SECRET, CLIENT_URL, CORS_ALLOWED_ORIGIN, IMGBB_API_KEY, STRIPE_SECRET_KEY, STRIPE_PRICE_PRO, STRIPE_WEBHOOK_SECRET

## Collections
users, tuitions, applications, payments

## Auth
POST /api/auth/register, /api/auth/login, /api/auth/sync (BetterAuth user sync -> returns JWT), GET /api/auth/me

## Tuitions
GET /api/tuitions (search/filter/pagination), POST /api/tuitions (tutor), GET /api/tuitions/:id, PUT/DELETE (tutor), GET /api/tuitions/mine, GET /api/tuitions/:id/applicants, PATCH /api/tuitions/applications/:appId

## Applications
POST /api/applications, GET /api/applications/mine, POST /api/applications/bookmark, DELETE /api/applications/bookmark/:id, GET /api/applications/bookmarks

## Payments
POST /api/payments/checkout, POST /api/payments/webhook, POST /api/payments/imgbb, GET /api/payments/revenue, GET /api/payments/stats

## Users
GET /api/users/profile, PUT /api/users/profile

## Admin
GET /api/admin/users, PATCH /api/admin/users/:id/role, GET /api/admin/tuitions/pending, PATCH /api/admin/tuitions/:id/approve, PATCH /api/admin/tuitions/:id/reject
