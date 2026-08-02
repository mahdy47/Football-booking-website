# Sports Academy / Gym — Booking Website Template

> **White-label, client-ready booking website.** Rebrand, deploy, deliver.

A premium, mobile-first booking website for sports academies and gyms. Visitors browse services, meet the coaches, view plans and **book a training session online** in seconds — no server, account, or build step required.

This is a **commercial white-label product**: one codebase, rebranded per client from a single config file. The same project can be sold to gyms, football academies, dance studios, clinics and any appointment-based business.

**Live demo:** https://booking-template-demo.vercel.app

---

## Screenshots

| | |
| --- | --- |
| **Hero** | **Services & Coaches** |
| ![Hero](screenshots/01-hero.png) | ![Services & Coaches](screenshots/02-services-coaches.png) |
| **Booking flow** | **Schedule management** |
| ![Booking flow](screenshots/03-booking-slots.png) | ![Schedule management](screenshots/04-schedule.png) |
| **Mobile view** | **Full page** |
| ![Mobile view](screenshots/05-mobile.png) | ![Full page](screenshots/06-full-page.png) |

---

## Features

- **Landing page sections** — hero, services, coaches, pricing, booking and contact in one page.
- **Premium design system** — typography scale, spacing scale, layered shadows, smooth reveal-on-scroll and micro-interactions that respect `prefers-reduced-motion`.
- **Online booking flow** — service → coach (optional) → date → time slot → contact details → confirm.
- **Smart schedule** — slots generated from opening hours; past and already-booked slots are disabled automatically, with a visual legend (available / selected / booked).
- **Schedule management** — all bookings listed in the Schedule panel, cancellable by the owner.
- **Form validation** — required fields, phone and email format checks, friendly error messages.
- **Zero build step** — plain HTML, CSS and JavaScript. Open the folder and it works.
- **Theme via CSS variables** — brand colors applied automatically from the config.
- **Optional Supabase sync** — a shared schedule across visitors with a free Supabase project (see below).
- **Accessible & responsive** — keyboard-friendly, mobile-first, no overflow at 375 / 768 / desktop widths.

## Technologies Used

- **HTML5, CSS3** — flexbox, grid, CSS custom properties (design tokens).
- **Vanilla JavaScript (ES6)** — no frameworks, no dependencies.
- **Persistence** — `localStorage` by default; optional **Supabase** via REST API (no client library).
- **Fonts** — Sora (display) and Inter (body) from Google Fonts, with local fallbacks.
- **Hosting** — deployable to any static host (Vercel, Netlify, GitHub Pages); a `vercel.json` is included.

## Project Structure

```
booking-template/
├── index.html              # Single-page site
├── vercel.json             # Vercel static site config
├── README.md               # This file
├── screenshots/            # Marketing screenshots
└── assets/
    ├── css/main.css        # Design system + all section styles
    └── js/
        ├── config.js       # ALL client customization lives here
        ├── storage.js      # Persistence layer (localStorage + optional Supabase)
        ├── booking.js      # Booking engine (slots, validation, schedule)
        └── main.js         # Branding/theme application + section rendering
```

## Customization Through `config.js`

**Everything a client needs to change lives in one file:** `assets/js/config.js`.

| Setting | Config key | Notes |
| --- | --- | --- |
| Business name | `business.name` | Also used as the browser tab title and footer |
| Tagline | `business.tagline` | Shown near the logo and hero |
| Logo | `business.logo` | `type: "text"` (name as logo) or `"image"` with a file path |
| Brand colors | `business.primaryColor` / `secondaryColor` / `accentColor` | Applied as CSS variables across the site |
| Hero text & buttons | `hero.*` | Headline, subtext and CTA labels |
| Contact details | `contact.phone` / `whatsapp` / `email` / `address` / `hours` | Cards render only for filled values |
| Services | `services[]` | Title, description and icon name |
| Coaches | `coaches[]` | Name, role, bio, initials (avatar circle) — set `[]` to hide |
| Pricing plans | `packages[]` | `price: 0` shows "Contact Us"; `highlight: true` features a card |
| Opening hours / slots | `booking.*` | Daily open/close time, slot length, working days (also shown as hero pills) |
| Storage | `database.provider` | `"local"` or `"supabase"` |

> Tip: all text is rendered as plain text (no HTML), so write normal sentences.

Typography and layout tokens live in `assets/css/main.css` under `:root` — fonts (`--font-display`, `--font-body`), spacing scale (`--s1` … `--s20`), radii and shadows. To go fully offline or swap fonts, remove the two `<link>` font tags in `index.html` and edit the font variables.

## Quick Start

No installation or build step is required.

1. Open `index.html` in any modern browser (double-click the file), **or**
2. Run a local server:

```bash
cd booking-template
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

The site is 100% static, so deployment is free and instant.

### Option A — Vercel Dashboard (recommended)

1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com/new) and click **Import** next to the repository.
3. Framework preset: **Other**. Root directory: select `booking-template` (the folder with `index.html`).
4. Click **Deploy**. No build command is needed.

### Option B — Vercel CLI

```bash
cd booking-template
npx vercel deploy --prod
```

The site is served at `https://booking-template.vercel.app` (the project name comes from `vercel.json`). To connect a custom domain, add it in **Project Settings → Domains**.

### Option C — Any static host

Serve the folder as-is. `index.html` is the entry point.

## Data Storage

### Default: browser-only (localStorage)

Bookings are saved in the visitor's browser under the key `booking-template.bookings`. This is the fastest way to demo the site or use it for a single owner. Different visitors do **not** share the same schedule in this mode.

### Optional: Supabase (shared schedule)

To let all visitors see and block the same schedule, connect a free Supabase project:

1. Create a project at [supabase.com](https://supabase.com) and open the **SQL editor**.
2. Run this setup script:

```sql
create table if not exists bookings (
  id text primary key,
  service text not null,
  coach text,
  date date not null,
  start integer not null,
  "end" integer not null,
  time_label text not null,
  name text not null,
  phone text not null,
  email text not null,
  notes text,
  created_at timestamptz default now()
);

alter table bookings enable row level security;

-- anyone (with the anon key) can read the schedule
create policy "public read bookings"
  on bookings for select using (true);

-- the anon key can insert a new booking
create policy "public insert bookings"
  on bookings for insert with check (true);

-- anyone can delete a booking (used by the owner's cancel button)
create policy "public delete bookings"
  on bookings for delete using (true);
```

3. Open **Project Settings → API** and copy the **Project URL** and **anon public key**.
4. In `assets/js/config.js`, set:

```js
database: {
  provider: "supabase",
  supabaseUrl: "https://YOUR-PROJECT.supabase.co",
  supabaseAnonKey: "YOUR-ANON-KEY",
  bookingsTable: "bookings"
}
```

That's it. Bookings are now read from and written to Supabase. The anon key is designed to be safe in the browser; access is enforced by the Row Level Security policies above.

## Adapting for Different Businesses

The template is content-driven, so it fits any appointment- or session-based business with zero code changes:

- **Sports academies & football clubs** — the included services, coaches and packages map directly.
- **Gyms & fitness studios** — rename sections via `config.js`; slots become class times.
- **Dance, martial arts, tennis** — same booking flow, rebranded colors and content.
- **Clinics, salons, tutoring** — hide coaches with `coaches: []`, adjust pricing to your plans.

Because empty sections hide automatically and `price: 0` renders "Contact Us", a client can ship a complete site without inventing content.

## Security Notes

- User and config text is inserted into the DOM as **text only** (never raw HTML), preventing XSS.
- Phone and email inputs are validated before saving.
- The Supabase anon key is safe to expose publicly because all access is gated by Row Level Security policies.
- In `local` mode no data leaves the browser.

## Notes for the Seller

- The repository root (`web project/`) contains the original Football Booking demo and is **not** part of this product.
- To resell: duplicate the `booking-template/` folder per client, edit `config.js`, and deploy each copy to its own Vercel project or domain.
- This README is written to hand off as-is to a client or a buyer of the template.
