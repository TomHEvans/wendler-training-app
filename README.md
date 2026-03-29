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
- Firebase Firestore (cloud database) with localStorage fallback
- Deployed on Vercel

## Setup

### 1. Deploy to Vercel

Connect this repo to Vercel for automatic deployments.

### 2. Set up Firebase (for cloud sync)

1. Go to [Firebase Console](https://console.firebase.google.com) and create a project
2. Add a Web app (Project Settings > General > Your apps > Add app)
3. Enable Firestore Database (Build > Firestore > Create database > Start in test mode)
4. Copy the Firebase config and add these environment variables in Vercel:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

Without Firebase, the app works with localStorage (per-device, shown as "Local" badge).

**Note:** Firestore in test mode expires after 30 days. For long-term use, update the security rules to allow read/write (this is a personal app with no auth).

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
