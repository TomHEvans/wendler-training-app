# Hyrox Training Prep

Personal training app for Hyrox race prep. Mobile-first, cloud-synced, fully traceable.

## Features

- **Today view** - Daily training plan with exercise checkboxes and progress tracking
- **Week view** - Full week overview with drill-down into each day
- **Plan editor** - Sunday weekly update: paste gym plan, physio notes, edit exercises
- **Changelog** - Full traceability of every plan change and exercise completion
- **Physio tracking** - Shoulder prehab and knee rehab frequency tracking (3-4x/week)
- **Hyrox stations** - All 8 stations tracked with practice sessions

## Physio Constraints

- No Olympic lifts
- No running or squatting weight without a box
- No high-weight explosive knee extensions
- Shoulder prehab circuit always before upper body work
- Shoulder prehab + knee rehab 3-4x per week

## Tech Stack

- React 18 + Vite
- Supabase (cloud database) with localStorage fallback
- Deployed on Vercel

## Setup

### 1. Deploy to Vercel

Connect this repo to Vercel for automatic deployments.

### 2. Set up Supabase (for cloud sync)

1. Create a free project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor
3. Add these environment variables in Vercel:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

Without Supabase, the app works with localStorage (per-device, shown as "Local" badge).

### 3. Add to Phone Home Screen

Open the deployed URL on your phone and use "Add to Home Screen" for an app-like experience.

## Weekly Update Workflow

Each Sunday:
1. Go to the **Plan** tab
2. Paste your gym plan for the week
3. Add any physio updates/notes
4. Edit individual days - add/remove exercises, swap sessions for classes
5. Hit **Save** - changes are logged to the changelog

## Local Development

```bash
npm install
npm run dev
```
