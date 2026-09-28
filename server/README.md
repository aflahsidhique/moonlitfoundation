# Moonlit Foundation — Admin API

Express + Prisma (PostgreSQL) backend for the admin panel at `/admin` and
the volunteer portal at `/portal`. Handles volunteer registrations, blood
requests, partner inquiries, contact messages, newsletter signups, and
event creation/registration — everything the public site's forms submit
to, and everything the admin panel manages.

## Setup

```bash
cd server
npm install
cp .env.example .env        # then edit DATABASE_URL / ADMIN_EMAIL / ADMIN_PASSWORD / JWT_SECRET / CLOUDINARY_*
npx prisma migrate deploy   # applies the existing migration history to your DATABASE_URL
npm run seed                 # creates the admin login + 2 sample events
npm run dev                   # http://localhost:4000
```

`DATABASE_URL` needs a real Postgres instance (Aiven/Render/Supabase/Neon
all have free tiers) — `prisma/schema.prisma` targets `postgresql`, not a
local file. If you're pointing local dev at the same database you deploy
with, use `migrate deploy` (applies existing migrations only) day-to-day;
only use `migrate dev --name ...` when you're intentionally adding a new
migration, since it can prompt to reset the database on drift.

`npm run seed` is idempotent — safe to re-run. It only creates the admin
account if one doesn't already exist for `ADMIN_EMAIL`, and only seeds
sample events if the events table is empty.

**Cloudinary** — the volunteer form's photo and ID document uploads are
streamed straight to Cloudinary (never written to local disk). Set
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`
in `.env` from your [Cloudinary console](https://cloudinary.com/console).
Only JPG/JPEG and PNG are accepted (enforced both client-side via the file
input's `accept` attribute and server-side via multer's `fileFilter`),
5MB max per file. Uploads land in the `moonlit/volunteer-photos` and
`moonlit/volunteer-ids` folders in your Cloudinary account.

**Change the seeded admin password** after your first login — there's no
"change password" endpoint yet, so for now: update `ADMIN_PASSWORD` in
`.env`, delete the admin row via `npx prisma studio`, and re-run
`npm run seed`.

## Volunteer approval → credentials → portal

The first time an admin approves a volunteer (in `/admin`), the server:
1. Assigns a permanent **Volunteer ID** — `MLF` + year + 5-digit number,
   e.g. `MLF202500001`, `MLF202500002` — the counter resets each year.
2. Generates a random password, hashes it (bcrypt) and stores the hash —
   the plaintext password is never saved anywhere, only used once to
   compose the notification.
3. Emails and texts the volunteer their Volunteer ID, password, and the
   portal link (`PORTAL_URL` in `.env`).

Volunteers log in at `/portal/index.html` with their Volunteer ID +
password to view their own profile and status (read-only for now).

**If email/SMS wasn't configured yet** (see below), approval still
succeeds — the admin panel's toast will say e.g. `email failed: not
configured`. Use the **Resend Credentials** button on an approved
volunteer's row to generate a fresh password and retry delivery once
you've set up Gmail/SMS Gate (the old password stops working the moment
you do this).

**Email (Gmail SMTP)** — set `GMAIL_USER` (full Gmail address) and
`GMAIL_APP_PASSWORD` (a 16-character [App Password](https://myaccount.google.com/apppasswords),
not your normal Gmail password — requires 2-Step Verification enabled on
the account). Leave blank to skip email sending.

**SMS ([SMS Gate](https://sms-gate.app))** — set `SMSGATE_BASE_URL`
(`https://api.sms-gate.app/3rdparty/v1` for their hosted cloud service, or
your own device's URL if self-hosting), `SMSGATE_USERNAME` and
`SMSGATE_PASSWORD` (Basic Auth credentials issued per-device when you
register with SMS Gate). Leave blank to skip SMS sending. Phone numbers
are normalized to E.164 assuming +91 (India) when no country code is
given, since that's what the registration form collects.

## Serving the static site alongside it

The frontend (the `.html` files one level up, plus `/admin`) is still a
plain static site with no build step. Don't open it via `file://` —
serve it so `fetch()` calls behave consistently across browsers:

```bash
# from the project root, in a separate terminal
npx serve -l 5500
```

Then add whatever origin you're serving from to `CORS_ORIGINS` in `.env`
(defaults already include `http://localhost:5500`).

## API surface

All routes are prefixed `/api`. Public routes need no auth. Admin routes
require `Authorization: Bearer <token>` from `POST /api/auth/login`.
Volunteer-portal routes require a *separate* token from
`POST /api/volunteer-auth/login` — the two token types carry different
`role` claims and are rejected on each other's routes (an admin token gets
`403` on `/volunteer-auth/me`, and vice versa).

| Resource | Public | Admin |
|---|---|---|
| Auth | `POST /auth/login` | `GET /auth/me` |
| Volunteers | `POST /volunteers` | `GET /volunteers`, `PATCH /volunteers/:id`, `DELETE /volunteers/:id`, `POST /volunteers/:id/resend-credentials` |
| Volunteer portal | `POST /volunteer-auth/login` | *(volunteer auth)* `GET /volunteer-auth/me` |
| Blood requests | `POST /blood-requests` | `GET /blood-requests`, `PATCH /blood-requests/:id`, `DELETE /blood-requests/:id` |
| Partner inquiries | `POST /partners` | `GET /partners`, `PATCH /partners/:id`, `DELETE /partners/:id` |
| Contact messages | `POST /contact` | `GET /contact`, `PATCH /contact/:id`, `DELETE /contact/:id` |
| Newsletter | `POST /newsletter` | `GET /newsletter`, `DELETE /newsletter/:id` |
| Events | `GET /events` (published only) | `GET /events/admin` (all), `POST /events`, `PUT /events/:id`, `PATCH /events/:id/status`, `DELETE /events/:id` |
| Event registrations | `POST /events/:id/register` | `GET /events/:id/registrations`, `GET /event-registrations` (all events), `PATCH /event-registrations/:id`, `DELETE /event-registrations/:id` |

Status values (enforced in route handlers, since SQLite has no native enum
support in Prisma):
- Volunteers / Partners: `pending | approved | rejected`
- Blood requests: `pending | in_progress | fulfilled | closed`
- Contact messages: `unread | read | replied`
- Events: `draft | published`
- Event registrations: `pending | confirmed | cancelled`

## Deploying to Render

`datasource db` in `prisma/schema.prisma` is set to `postgresql` (SQLite
is dev-only — Render's disk is ephemeral, so a file-based DB gets wiped on
every redeploy). `render.yaml` at the repo root defines two services:

- **`moonlit-website-api`** — this Express app (`rootDir: server`). Build
  command runs `npm install`, generates the Prisma client, applies pending
  migrations (`prisma migrate deploy`), and re-runs the idempotent seed.
- **`moonlit-website`** — the React/Vite SPA (`client/`), built with
  `npm run build` and served from `client/dist` with an SPA-fallback
  rewrite (`/* → /index.html`) so client-side routes resolve on refresh.

To deploy:
1. Push this repo to GitHub (already done if you're reading this on Render).
2. In the Render dashboard: **New → Blueprint**, point it at the repo. It
   reads `render.yaml` and creates both services.
3. Render will prompt for every env var marked `sync: false` in
   `render.yaml` — paste in your real values (`DATABASE_URL` from your
   Postgres provider, `JWT_SECRET`, `ADMIN_EMAIL`/`ADMIN_PASSWORD`,
   `CLOUDINARY_*`, `GMAIL_*`, `SMSGATE_*`, `VAPID_*`). These are never
   committed to the repo.
4. If you rename either service, update the cross-references: the API's
   `CORS_ORIGINS`/`PORTAL_URL` env vars point at the static site's URL, and
   `client/src/lib/api.js`'s `PROD_API_BASE` points at the API's URL.
5. `client/src/lib/api.js` auto-detects `localhost` vs deployed and picks
   the right API base — no per-environment file to swap.

Since `prisma` (the CLI) needs to run at build time, it's a regular
`dependency`, not a `devDependency` — some hosts skip installing
devDependencies in production builds.

## Notes for production

### Website content and gallery

The admin now includes draft/publish page editing and a gallery/image library. New uploads are converted to WebP before storage in Cloudinary. Apply the additive migration with `npm run prisma:deploy` and regenerate Prisma before starting the updated API. See [the content management guide](../WEBSITE-CONTENT.md) for usage, endpoints, cache behavior and verification commands.

### Event images and email invitations

No database migration is required: event covers use the existing `Event.imageUrl` field. Restart/redeploy the API alongside the updated frontend to enable these admin-only endpoints:

| Endpoint | Purpose |
|---|---|
| `POST /api/events/image` | Multipart upload with one `image` field. JPG, PNG or WebP, maximum 5 MB. Returns `{ imageUrl }`. |
| `GET /api/events/:id/email-preview?audience=volunteers` | Returns recipient count, invalid-address count and whether SMTP is configured. Also accepts `audience=registrations`. |
| `POST /api/events/:id/share` | Emails a published event. JSON: `{ audience, subject?, message?, requestId }`; returns `{ delivery: { status, total, sent, failed, skipped } }`. |

Uploads use the existing `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`, stored in the `moonlit/events` folder. Both MIME type and file signatures are checked before Cloudinary validates the image content. Credentials remain on the server. See [Cloudinary’s Node upload documentation](https://cloudinary.com/documentation/node_image_and_video_upload).

Email uses the existing `GMAIL_USER` / `GMAIL_APP_PASSWORD` configuration. Set `SITE_URL` to the public website origin for invitation links; if omitted, the origin of `PORTAL_URL` is used. Each email contains the event image, title, description, date/time, location, optional personal message and a link directly to the event on the website. Templates escape user-supplied content and accept only HTTP(S) image links.

The `volunteers` audience includes approved volunteers. The `registrations` audience includes pending and confirmed registrations for this event, excluding cancellations. Soft-deleted records are filtered by the existing Prisma middleware. Addresses are normalized and deduplicated; each person receives a separate envelope, and recipient addresses are not exposed to other recipients or returned by the preview endpoint.

Sending is synchronous with at most three SMTP deliveries in progress. `sent` means accepted by the SMTP provider, not guaranteed inbox delivery. Partial failures are counted and displayed. Keep the composer open until results appear. The same `requestId` and message reuse the result for 30 minutes within the current server process; a concurrent announcement for the same event is rejected. These guards are not a durable queue and do not span server restarts or multiple instances. After an interrupted request, check the sender’s sent mail before sending a new announcement. Large campaigns should use a persistent job queue and an appropriate email service. [Nodemailer SMTP options](https://nodemailer.com/smtp) describe the configured transport and timeouts.

Creating an event and emailing it are separate requests. An email failure leaves the saved event intact. The frontend’s opt-in creation checkbox sends the invitation immediately after a successful save; the Share button sends later with a custom audience/message. Editing an event never implicitly sends email.

Verification covered authorization, upload limits/signatures, image persistence, recipient privacy, duplicate request handling, HTML escaping, partial delivery and missing SMTP configuration using mocked database, Cloudinary and SMTP services. The temporary test scripts were removed after verification.

### General deployment settings

- Tighten `CORS_ORIGINS` to your real domain only (already done via
  `render.yaml` if you used the Blueprint above).
- Put the API behind HTTPS (Render does this automatically) and set a
  long, unique `JWT_SECRET`.
- Add rate-limiting to the public POST endpoints (volunteer/blood/contact
  forms are unauthenticated and open to spam as-is).
