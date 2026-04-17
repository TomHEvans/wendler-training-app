# HyroxPrepPlan

## What This Is

Personal 5-week training tracker for Hyrox race preparation. Single-file web app with no dependencies - pure HTML/CSS/JS.

**Deployed to:** Vercel and Netlify (static hosting, no build step)
**Repo:** github.com/TomHEvans/wendler-training-app

## Tech Stack

- **Architecture:** Single `index.html` file (~2,000 lines) containing CSS + HTML + JS
- **State:** browser localStorage (key: `hyrox-prep-v2`)
- **Charts:** Hand-rolled inline SVG sparklines
- **Dependencies:** None. Zero. Vanilla everything.
- **Deployment:** Static file hosting (Vercel with `framework: null`, Netlify)

## Project Structure

```
index.html                    # The entire app
vercel.json                   # Deploy config (no build)
icon.svg / icon-180.png       # App icons
hybrid_training_plan.docx     # Reference training plan
docs/superpowers/
  plans/                      # Implementation plans
  specs/                      # Design specifications
```

## How It Works

- `PLAN` object in JS is the source of truth for training structure
- State stored as flat key-value: `{weekId}-{dayIdx}-{sectionIdx}-{exerciseIdx}-{setIdx}` — `weekId` is `PLAN.weeks[N].id` (1-indexed), NOT the array index N
- Exercise types auto-detected from text/detail fields via `parseEx()` (~lines 1060-1119)
- Types: `wendler`, `weighted`, `reps`, `hold`, `fortime`, `distance`, `check`, `cardio`, `warmup`
- Epley e1RM formula: `weight * (1 + reps/30)`

## Features

- Week/day navigation for 30+ training days
- Set-by-set logging (weight, reps, time, distance depending on type)
- e1RM calculations and sparkline trends
- Session feel ratings (before/after)
- Rest timer (30s-3m)
- Previous performance hints (name-based lookup)
- JSON export/import for data backup
- Progress dashboard with stats and charts

## Development

- Edit `index.html` directly, test in browser
- Theme uses CSS variables in `:root` - dark gradient mesh aesthetic
- Background: `#0c0c14`, Surface: `#151521`, Text: `#e2e2ea`, Accents: rainbow gradient
- Mobile-first (480px container), responsive at 520px+

## Important Notes

- Appending exercises to PLAN is safe; inserting, removing, OR reordering mid-array shifts indices and orphans/reassigns logged state keys
- To check which sessions have logged data before editing: ask user for a fresh Export JSON (button in-app), then grep for `{weekId}-` prefixes
- To convert a day to rest: mirror existing `type:"rest"` day pattern (see any Wed entry) - single section `{name:"Rest Day", exercises:[...]}`
- localStorage capacity well within limits (~50-100KB of 5MB limit)
- No backend, all data local to browser
