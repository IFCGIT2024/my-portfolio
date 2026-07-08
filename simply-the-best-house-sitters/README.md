# Simply the Best House-Sitters — website

Boutique in-home pet & property care marketing site, plus a light admin panel
for reading quote submissions and editing key copy.

Self-contained: **completely separate** from any other project on this machine
or on the shared server. Own folder, own port, own data, own admin password.

---

## Stack

- **Node.js 18+**
- **Express 4** for routing and static file serving
- **Vanilla JS SPA** on the client — no build step, no framework
- **JSON files** as the content and quote-request store (`data/*.json`)
- **PM2 + nginx** on the server (identical pattern to the Kesalul site, but a
  separate PM2 process, separate nginx server block, separate directory)

## Local development

```powershell
cd "c:\Users\Owner\Desktop\Simply the Best House Sitters"
npm install
npm start
```

Then:

- Public site → http://localhost:3200
- Admin panel → http://localhost:3200/admin  
  Password comes from `.env` → `ADMIN_PASSWORD` (default local value: `StayLocal!42`).

Update `.env` before running for real. Do not commit it.

## Project structure

```
Simply the Best House Sitters/
├── server.js                  # Express server + all API routes
├── package.json
├── .env                       # local secrets (git-ignored)
├── .env.example               # template
├── data/
│   ├── siteContent.json       # all site copy (edited via admin or by hand)
│   └── quotes.json            # append-only quote-request submissions
└── public/
    ├── index.html             # SPA shell
    ├── styles.css             # design system (Poppins + Inter, navy/green/gold)
    ├── script.js              # client renderer + router + quote form
    ├── admin.html             # admin panel shell
    ├── admin.css              # admin-only styles
    ├── admin.js               # admin logic (quote inbox + copy editor)
    ├── favicon.svg
    └── images/                # local media
```

## HTTP endpoints

Public:

| Method | Path                | Purpose                                   |
| ------ | ------------------- | ----------------------------------------- |
| GET    | `/`  … `/*`         | SPA shell (all page URLs render here)     |
| GET    | `/api/content`      | Site copy JSON — driving the SPA          |
| POST   | `/api/quote`        | Submit a quote-request form               |

Admin (bearer token from `/api/admin/login`):

| Method | Path                     | Purpose                              |
| ------ | ------------------------ | ------------------------------------ |
| POST   | `/api/admin/login`       | Password-in, signed bearer token out |
| POST   | `/api/content`           | Save edited site content JSON        |
| GET    | `/api/quotes`            | List all quote submissions           |
| PATCH  | `/api/quotes/:id`        | Update status (`new`/`read`/`archived`) |
| DELETE | `/api/quotes/:id`        | Permanently delete a submission      |
| POST   | `/api/upload`            | Upload an image → `/images/uploads/` |

## Pages

Rendered client-side by `public/script.js`:

- `/` — Home
- `/services`
- `/pricing`
- `/is-this-right-for-you`
- `/about`
- `/reviews`
- `/faq`
- `/careers`
- `/contact`
- `/request-a-quote`
- `/privacy`, `/terms` (placeholder legal pages)

Everything not matched shows a soft 404.

## Editing copy

Two options — pick whichever is easier for the change you're making:

1. **Admin panel** (`/admin`): fastest for headlines, tagline, contact details,
   the hero on each page, and the quote-form success message.
2. **Directly edit `data/siteContent.json`** and restart the server (or refresh
   the page if the server is already running). This is easier for structural
   things — the services list, pricing tables, FAQ entries, testimonials, and
   the "Is this right for you?" long-form sections. The JSON is intentionally
   readable.

Every save creates a `.bak` snapshot of the previous version next to the file.

## Quote submissions

Every submission is appended to `data/quotes.json` as an object with:

- `id` — internal id
- `receivedAt` — ISO timestamp
- `status` — `new` | `read` | `archived`
- `payload` — the sanitised form fields

They show up in the admin panel under **Quote requests**. From there you can
reply directly by email, mark read, archive, or delete.

Bots are silently dropped via a honeypot field (`website`).

## Deploying (later)

When ready to go live at `simplythebesthousesitters.com` (**not now**):

1. `scp` the whole folder to `/var/www/simplythebesthousesitters/` on the
   droplet (excluding `node_modules/` and `.env`).
2. Create a fresh `.env` on the server with a strong `ADMIN_PASSWORD` and
   `ADMIN_SECRET`, and `PORT=3200`.
3. `npm install --omit=dev` in that folder.
4. `pm2 start server.js --name simplythebesthousesitters` and `pm2 save`.
5. Add a new nginx server block for `simplythebesthousesitters.com` and
   `www.simplythebesthousesitters.com` that proxies to `127.0.0.1:3200`.
6. Issue a Let's Encrypt certificate for both hostnames.

Details will be added here when we actually deploy.

## Notes

- Content Security Policy is strict — no third-party scripts, no inline JS.
  Google Fonts CSS is the only external asset.
- Ports and process names are deliberately different from the Stone of Kindness
  site so both can safely run on the same droplet.
- No shared modules, no shared data, no shared secrets between projects.
