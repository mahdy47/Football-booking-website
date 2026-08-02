# Sports Academy / Gym - Booking Website (White-Label Template)

A clean, fast, mobile-first booking website for a sports academy or gym. Customers can browse services, meet the coaches, view plans and **book a training session online** — no server or account needed.

This is a **white-label product**: every business detail (name, logo, colors, phone, email, services, coaches, pricing, opening hours) is configured from one file, so the same codebase can be resold and rebranded for each client.

## Features

- **Landing page sections**: hero, services, coaches, pricing, booking and contact.
- **Premium design system**: typography scale, spacing scale, layered shadows, smooth reveal-on-scroll and micro-interactions (respects `prefers-reduced-motion`).
- **Online booking flow**: choose a service -> coach (optional) -> date -> time slot -> contact details -> confirm.
- **Smart schedule**: time slots are generated from opening hours; past and already-booked slots are disabled automatically, with a visual legend (available / selected / booked).
- **Schedule management**: all bookings are listed in the Schedule panel and can be cancelled by the owner.
- **Form validation**: required fields, phone and email format checks, friendly error messages.
- **Zero build step**: plain HTML, CSS and JavaScript. Open the folder and it works.
- **Theme via CSS variables**: brand colors are applied automatically from the config.
- **Optional Supabase sync**: bookings can be shared across visitors with a free Supabase project (see below).
- **Accessible & responsive**: keyboard-friendly, mobile-first, reduced-motion support.

## Tech

- HTML5, CSS3 (flexbox, grid, CSS variables), vanilla JavaScript (ES6).
- Persistence: `localStorage` by default; optional Supabase (REST API, no client library).

## Project Structure

```
booking-template/
├── index.html              # Single-page site
├── vercel.json             # Vercel static site config
├── README.md               # This file
└── assets/
    ├── css/main.css        # Design system + all section styles
    └── js/
        ├── config.js       # ALL client customization lives here
        ├── storage.js      # Persistence layer (localStorage + optional Supabase)
        ├── booking.js      # Booking engine (slots, validation, schedule)
        └── main.js         # Branding/theme application + section rendering
```

## Quick Start

No installation or build step is required.

1. Open `index.html` in any modern browser (double-click the file), **or**
2. Run a local server:

```bash
cd booking-template
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Customizing for a Client

Everything a client needs to change is in **one file**: `assets/js/config.js`.

| Setting | Config key | Notes |
| --- | --- | --- |
| Business name | `business.name` | Also used as the browser tab title and footer |
| Tagline | `business.tagline` | Shown near the logo and hero |
| Logo | `business.logo` | `type: "text"` (name as logo) or `"image"` with a file path |
| Brand colors | `business.primaryColor` / `secondaryColor` / `accentColor` | Applied as CSS variables across the site |
| Hero text & buttons | `hero.*` | Headline, subtext and CTA labels |
| Contact details | `contact.phone` / `whatsapp` / `email` / `address` / `hours` | Cards render only for filled values |
| Services | `services[]` | Title, description and icon name |
| Coaches | `coaches[]` | Name, role, bio, initials (avatar circle) - set `[]` to hide |
| Pricing plans | `packages[]` | `price: 0` shows "Contact Us"; `highlight: true` features a card |
| Opening hours / slots | `booking.*` | Daily open/close time, slot length, working days (also shown as hero pills) |
| Storage | `database.provider` | `"local"` or `"supabase"` |

> Tip: all text is rendered as plain text (no HTML), so write normal sentences.

**Typography & layout** live in `assets/css/main.css` under `:root` — fonts (`--font-display`, `--font-body`), spacing scale (`--s1` … `--s20`), radii and shadows. Headings use the **Sora** Google font and body text uses **Inter**; to go fully offline or switch fonts, remove the two `<link>` font tags in `index.html` and change the font variables.

## Data Storage

### Default: browser-only (localStorage)

Bookings are saved in the visitor's browser under the key `booking-template.bookings`. This is the fastest way to demo or use the site for a single owner. Different visitors do **not** share the same schedule in this mode.

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

3. Open **Project Settings -> API** and copy the **Project URL** and **anon public key**.
4. In `assets/js/config.js`, set:

```js
database: {
  provider: "supabase",
  supabaseUrl: "https://YOUR-PROJECT.supabase.co",
  supabaseAnonKey: "YOUR-ANON-KEY",
  bookingsTable: "bookings"
}
```

That's it. Bookings are now read from and written to Supabase. The anon key is designed to be safe in the browser; security is enforced by the Row Level Security policies above.

## Deploying to Vercel

The site is 100% static, so deployment is free and instant.

### Option A - Vercel Dashboard (recommended)

1. Push this folder to a GitHub repository (or a new repo containing `booking-template/`).
2. Go to [vercel.com](https://vercel.com/new) and click **Import** next to the repository.
3. Framework preset: **Other**. Root directory: select `booking-template` (the folder with `index.html`).
4. Click **Deploy**. No build command is needed.

### Option B - Vercel CLI

```bash
cd booking-template
npx vercel deploy --prod
```

The site is served at `https://booking-template.vercel.app` (the project name comes from `vercel.json`). To connect a custom domain, add it in **Project Settings -> Domains**.

## Security Notes

- User and config text is inserted into the DOM as **text only** (never raw HTML), preventing XSS.
- Phone and email inputs are validated before saving.
- The Supabase anon key is safe to expose publicly because all access is gated by Row Level Security policies.
- In `local` mode no data leaves the browser.

## Notes for the Seller

- The repository root (`web project/`) contains the original Football Booking demo and is **not** part of this product.
- To resell: duplicate the `booking-template/` folder per client, edit `config.js`, and deploy each copy to its own Vercel project or domain.
