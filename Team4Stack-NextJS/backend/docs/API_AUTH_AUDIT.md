# API authentication audit (Team4Stack backend)

This document reflects route protection **after** the security hardening pass.

## Legend

- **Public**: no `Authorization` required (still subject to rate limits / CORS).
- **User JWT**: `Authorization: Bearer <Supabase access_token>` (3-part JWT).
- **Admin token**: `Authorization: Bearer <admin_api_token>` (2-part HMAC token from `POST /api/superadmin/admins/verify-password`).
- **Super admin**: admin in `admin_users` with `role === super_admin`.

## `/api/superadmin`

| Method | Path | Before | After |
|--------|------|--------|-------|
| GET | `/admins/check/:email` | Public | Public (student portal + admin login) |
| POST | `/admins/verify-password` | Public | Public (returns `apiToken` on success) |
| * | All other routes | Public | **Super admin only** (user JWT or admin token + `super_admin` role) |

## `/api/users`

| Method | Path | Before | After |
|--------|------|--------|-------|
| GET | `/*` (read) | Public | Public |
| POST | `/upsert` | Public | **Auth**: user JWT (`sub` = body.id) **or** courses admin token |
| PUT | `/:id` | Public | **Auth**: user JWT (`sub` = id) **or** courses admin / super_admin token |

## `/api/courses`

| Area | Before | After |
|------|--------|-------|
| GET courses/videos/quizzes (read) | Public | Public |
| GET `/admissions` (no `email`) | Public | **Courses admin** |
| GET `/admissions?email=` | Public | **User JWT** (email must match) **or** courses admin |
| POST `/admissions` | Public | Public (apply form) |
| PUT `/admissions/:id` | Public | **Courses admin** (full) **or** **user JWT** owning row (non-approval fields only) |
| DELETE `/admissions/:id` | Public | **Courses admin** |
| Course/video/quiz mutations | Public | **Courses admin** |
| `GET /progress`, `POST /progress` | Public | **Owner JWT** or **courses admin** |
| `GET /progress` (all) | Public | **Courses admin** |
| Student notifications | Query by email | **Email owner JWT** or **courses admin** |
| `POST /student-notifications` | Body `adminEmail` | **Courses admin token** + `adminEmail` must match token email |

## `/api/landing`

| Method | Mutations | Before | After |
|--------|-----------|--------|-------|
| POST/PUT/DELETE | reviews, projects, services | Public | **Landing panel** (`super_admin`, `landing_admin`, `admin`) |
| POST | `/settings` (single key) | Public | **Landing admin** *or* **public** if key matches `otp_*` / `delete_otp_*` (signup / delete-account OTP flows) |
| POST | `/settings/bulk` | Public | **Landing panel** |
| DELETE | `/settings` | Public | **Landing admin** *or* **public** if *all* keys are OTP-style |
| GET | `/support` | Public | **Landing panel** |
| POST | `/support` | Public | Public (contact form) |
| PUT | `/support/:id` | Public | **Landing panel** |

## `/api/stackstore`

| Method | Path pattern | Before | After |
|--------|------------|--------|-------|
| GET | catalog | Public | Public |
| POST/PUT/DELETE | products, categories, sellers | Public | **Stack admin** |
| GET | orders | Public | **Stack admin** |
| POST | orders | Public | Public (storefront checkout; abuse mitigated by rate limit) |
| PUT | orders | Public | **Stack admin** |

## `/api/team`

| Method | Mutations | Before | After |
|--------|-----------|--------|-------|
| POST/PUT/DELETE | members, mentors | Public | **Team admin** |

## `/api/public`

| Path | Purpose |
|------|---------|
| GET `/youtube/video` | Proxy YouTube Data API using **server-only** `YOUTUBE_API_KEY` |
