# Football Booking Website

**Kick Near** — a client-side web app for organising casual football matches. Players create a match with their team, location, date and time, and other players join it as the opposing team — no server or account required. Matches are saved in the browser using `localStorage`.

## Features

- **Create a match** — set the match name, your team, location, date & time, number of players, and a contact phone number.
- **Join a match** — pick any open match from the dropdown and join it as the opposing team.
- **One opponent per match** — a match stays joinable until a second team takes the slot; duplicates are rejected.
- **Upcoming Matches board** — every match is rendered as a card showing the teams, date/time, location, and player count.
- **Local persistence** — matches survive page reloads, stored in the browser via `localStorage`.
- **Input validation** — all required fields are checked before a match is created or joined, with clear alerts.
- **Safe rendering** — user input is inserted into the DOM as text nodes, not raw HTML.
- **Responsive design** — single-column layout on mobile, two-column match grid on wider screens.

## Technologies Used

- **HTML5** — semantic structure and typed form inputs
- **CSS3** — flexbox, CSS grid, media queries, gradient theme
- **Vanilla JavaScript (ES6)** — DOM handling and application logic
- **Web Storage API (`localStorage`)** — client-side persistence

## How to Run Locally

No build step or package installation required.

**Option 1 — open directly**

Open `web project/project.html` in any modern browser.

**Option 2 — local server**

```bash
cd "web project"
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

**Option 3 — VS Code**

Right-click `web project/project.html` → **Open with Live Server**.

> **Note:** Matches are stored in the browser you use. Clearing site data or switching browsers resets the match list.

## Usage

1. Fill in the **Create Match** form with the match name, your team, location, date & time, number of players, and phone number, then click **Create Match**.
2. The match appears as a card in the **Upcoming Matches** section.
3. To join an open match, select it from the **Join an Existing Match** dropdown, enter your team name, and click **Join Selected Match**.
4. The card now shows both teams (e.g. `Green FC vs Blue United`), and the match is removed from the join dropdown.

## Project Structure

```
Football-booking-website/
└── web project/
    ├── project.html   # Main page: create/join form and matches board
    ├── project.css    # Styling and responsive layout
    └── project.js     # Application logic and localStorage persistence
```

## Screenshots

| | |
| --- | --- |
| **Hero** | **How it works & Matchboard** |
| ![Hero](booking-template/screenshots/01-hero.png) | ![How it works & Matchboard](booking-template/screenshots/02-steps-matches.png) |
| **Create a match** | **Join as Team B** |
| ![Create a match](booking-template/screenshots/03-create-match.png) | ![Join as Team B](booking-template/screenshots/04-join-match.png) |
| **Mobile view** | **Full page** |
| ![Mobile view](booking-template/screenshots/05-mobile.png) | ![Full page](booking-template/screenshots/06-full-page.png) |

**Live demo:** https://booking-template-demo.vercel.app
