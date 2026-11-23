# MentorLagbe — Backend API

Express.js REST API for the MentorLagbe tuition platform. It connects to MongoDB Atlas, issues JWT access tokens, enforces role-based authorization, and integrates Stripe and ImgBB.

![Express](https://img.shields.io/badge/Express-5-green)
![Node.js](https://img.shields.io/badge/Node.js-ESM-yellow)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Stripe](https://img.shields.io/badge/Stripe-Checkout-blue)

**Live API:** [https://mentorlagbe-sepia.vercel.app](https://mentorlagbe-sepia.vercel.app)

## Overview

This service exposes the `/api/auth`, `/api/users`, `/api/tuitions`, `/api/applications`, `/api/payments` and `/api/admin` route groups. It shares the `mentorlagbe` MongoDB database with the [Next.js frontend](https://github.com/nomaanrayhannoyon/mentorlagbe-frontend), which hosts its own API route handlers. Authentication here is JWT-based with `Authorization: Bearer <token>` headers.

## Technologies & Packages

| Layer | Package |
|-------|---------|
| Server | `express` 5, `serverless-http` (Vercel handler) |
| Database | `mongodb` 7 (native driver), MongoDB Atlas |
| Authentication | `jsonwebtoken`, `bcryptjs`, `better-auth` (user-sync service) |
| Validation | `joi`, `zod` |
| Security | `helmet`, `express-rate-limit`, `cors` |
| Payments | `stripe` 16 |
| Image upload | `node-fetch` → ImgBB API |
| Logging | `pino` (optional pretty transport in development) |
| Configuration | `dotenv` |
| Fixtures | `@faker-js/faker` |

## API Endpoints

All paths below are relative to the live API URL. JSON bodies unless stated otherwise.

### Health

| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/` | public | Plain text `MentorLagbe API running` |

### Authentication — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | public | Register with name, email, password and optional role; returns a JWT and user |
| POST | `/login` | public | Email/password login; returns a JWT and user |
| POST | `/sync` | public | Sync a Better Auth user into this service and return a JWT |
| GET | `/me` | Bearer | Return the current user document |

### Users — `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/profile` | Bearer | Read the authenticated user's profile |
| PUT | `/profile` | Bearer | Update the authenticated user's profile fields |

### Tuitions — `/api/tuitions`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | public | List approved tuitions; supports `subject`, `location`, `minBudget`, `maxBudget`, `search`, `page`, `limit` |
| GET | `/:id` | public | Tuition detail |
| GET | `/mine` | Bearer, tutor | The authenticated tutor's tuitions |
| POST | `/` | Bearer, tutor | Create a tuition (starts as `pending`) |
| PUT | `/:id` | Bearer, tutor | Update an own tuition |
| DELETE | `/:id` | Bearer, tutor | Delete an own tuition |
| GET | `/:id/applicants` | Bearer, tutor | Applicants for a tuition |
| PATCH | `/applications/:appId` | Bearer, tutor | Set an application's `status` |

### Applications & bookmarks — `/api/applications`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Bearer, student | Apply to a tuition |
| GET | `/mine` | Bearer, student | The student's applications |
| POST | `/bookmark` | Bearer, student | Add a tuition to `savedTuitions` |
| DELETE | `/bookmark/:id` | Bearer, student | Remove a bookmark |
| GET | `/bookmarks` | Bearer, student | List bookmarked tuition IDs |

### Payments — `/api/payments`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/checkout` | Bearer | Create a Stripe subscription Checkout Session |
| POST | `/webhook` | Stripe signature | Verify and process Stripe events |
| POST | `/imgbb` | Bearer | Upload a base64 image to ImgBB |
| GET | `/revenue` | Bearer | Aggregate paid revenue and count |
| GET | `/stats` | Bearer | Platform user/tuition/paid-payment counts |

### Admin — `/api/admin`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users` | Admin role | List user documents |
| PATCH | `/users/:id/role` | Admin role | Change a user's role |
| GET | `/tuitions/pending` | Admin role | Tuitions awaiting moderation |
| PATCH | `/tuitions/:id/approve` | Admin role | Approve a tuition |
| PATCH | `/tuitions/:id/reject` | Admin role | Reject a tuition |

## Authentication & Authorization

`src/utils/auth.js` signs JWTs with `JWT_SECRET` (7-day expiry) and hashes passwords with `bcryptjs`. `verifyToken` in `src/middleware/auth.middleware.js` reads the `Authorization: Bearer …` header, verifies the token and attaches `req.user`. Role guards `verifyStudent`, `verifyTutor` and `verifyAdmin` (plus `requireRole`, `requireAdmin`, `requireTutor`, `requireStudent`) enforce role membership.

| Role | Intended access |
|------|-----------------|
| `student` | Apply to tuitions, manage applications and bookmarks |
| `tutor` | Create and manage tuitions, review applicants |
| `admin` | Moderation, user management, revenue and platform statistics |

Credentials are never stored in plain text; only bcrypt hashes are written to the `users` collection.

## Database Collections & Schema

Four domain collections are used in the shared `mentorlagbe` database. Better Auth (frontend) separately manages its own framework collections.

| Collection | Fields written by this service |
|------------|-------------------------------|
| `users` | `name`, `email`, `password` (bcrypt hash), `role`, `plan`, `createdAt`, plus bookmark fields (`bookmarks` / `savedTuitions`) |
| `tuitions` | `subject`, `classLevel`, `mode`, `location`, `monthlyFee`, `description`, `tutorId`, `approvalStatus`, `isActive`, `bannerImage`, `createdAt`, `updatedAt` |
| `applications` | `tuitionId`, `studentId`, `studentPhone`, `preferredSchedule`, `studentNote`, `status`, `createdAt`, `updatedAt` |
| `payments` | `userId`, `stripeSessionId`, `paymentStatus`, `transactionId`, `amount`, `createdAt` |

Enumerations:

- Roles: `student`, `tutor`, `admin`
- Plans: `free`, `pro`
- Tuition approval: `pending`, `approved`, `rejected`
- Application status: `pending`, `accepted`, `rejected`
- Payment status: `pending`, `paid`, `failed`, `refunded`

The frontend writes additional denormalized fields to these same collections (`title`, `tutorName`, `tuitionTitle`, `userEmail`, `paidAt`, and others); see the frontend repository for the full canonical shape. Indexes are created on connect in `src/config/db.js`, including a unique email index and a unique `(tuitionId, studentId)` application index.

## Tuition, Application & Payment Workflows

- Tuition creation is tutor-only, starts as `pending`, accepts an optional base64 image which is uploaded to ImgBB, and enforces a 2-post limit for free-plan tutors
- Public listing returns only `approvalStatus: "approved"` tuitions with filters and pagination
- Application creation is student-only and rejects duplicate applications for the same tuition
- Tutors review applicants on their own tuitions; admins moderate pending tuitions
- Checkout creates a Stripe subscription session, records a `pending` payment, and returns a hosted URL
- The webhook verifies the `stripe-signature` header against `STRIPE_WEBHOOK_SECRET`, skips already-paid records (idempotency), marks payments `paid` and upgrades the user to `pro` only after a confirmed `checkout.session.completed` event

## Validation & Error Handling

Joi schemas in `src/utils/validation.js` validate registration, login, tuition creation, applications and user sync; invalid input returns HTTP 400 with the validation messages. Controller errors are forwarded to the central error handler in `index.js`, which logs through Pino and returns `{ "error": "<message>" }` with the appropriate status code.

## Installation & Local Setup

```bash
npm install
cp .env.example .env
# fill in the values in .env
npm run dev
```

The server listens on `PORT` (default `5000`) and connects to MongoDB on startup.

## Environment Variables

Names only — never commit their values. Placeholders are in `.env.example`.

| Variable | Required | Purpose |
|----------|:--------:|---------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `MONGODB_DB` | Yes | Database name (`mentorlagbe`) |
| `JWT_SECRET` | Yes | Signs access tokens |
| `CLIENT_URL` | Yes | Frontend origin used for Stripe success/cancel redirects |
| `CORS_ALLOWED_ORIGIN` | Yes | Allowed origin (validated at startup) |
| `PORT` | No | Listen port; defaults to `5000` |
| `IMGBB_API_KEY` | Yes | ImgBB uploads |
| `STRIPE_SECRET_KEY` | Yes | Stripe SDK initialization |
| `STRIPE_PRICE_PRO` | Yes | Stripe price ID used by checkout |
| `STRIPE_WEBHOOK_SECRET` | Yes | Verifies webhook signatures |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Publishable key (client-side use) |

`src/config/env.js` aborts startup when `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `IMGBB_API_KEY`, `CORS_ALLOWED_ORIGIN` or `CLIENT_URL` is missing; the Stripe price and webhook variables are required for checkout and webhook processing respectively. Environment files are gitignored.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the server (`node src/server.js`) |
| `npm run dev` | Start with file watching |
| `npm run seed` | Seed sample tutor/student users and 12 approved tuitions |
| `npm run seed:admin` | Guard script — prints guidance; the primary admin is managed by Better Auth on the frontend |

## Deployment

Deployed on Vercel. `vercel.json` builds `index.js` with `@vercel/node` and routes all requests to it; `page.js` provides a `serverless-http` handler export. Set the environment variables in the Vercel project settings and redeploy after changes. Live API: [https://mentorlagbe-sepia.vercel.app](https://mentorlagbe-sepia.vercel.app).

## Repository

[github.com/nomaanrayhannoyon/mentorlagbe-backend](https://github.com/nomaanrayhannoyon/mentorlagbe-backend)
