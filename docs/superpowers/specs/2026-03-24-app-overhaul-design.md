# Hyrox Prep Plan — App Overhaul Design Spec

**Date:** 2026-03-24
**Status:** Review
**Scope:** Single-file HTML training tracker — personal use, lightweight, no server

## Context

The app is a 6-week Hyrox preparation training tracker. It currently supports week/day navigation, set-level exercise logging with type-aware inputs (weight, reps, holds, distance, time), Wendler e1RM on AMRAP sets, session notes, and localStorage persistence. The visual design follows the "Gradient Mesh" aesthetic (dark backgrounds, ambient gradients, rainbow top-border accents on cards).

This overhaul addresses three categories: visual refinement, historical/progress features, and quality-of-life additions.

---

## 1. Colour Darkening

Shift the base palette darker for a more premium feel.

| Token | Current | New |
|-------|---------|-----|
| `--bg` | `#0f0f17` | `#0a0a10` |
| `--surface` | `#16161f` | `#111119` |
| `--surface2` | `#1c1c28` | `#161620` |
| `--border` | `#1e1e2a` | `#1a1a24` |
| `--text` | `#e8e8ed` | `#d8d8e0` |

Gradient accent colours unchanged. Ambient radial gradient opacities reduced ~30% (e.g. `rgba(252,61,94,.1)` becomes `rgba(252,61,94,.07)`).

---

## 2. e1RM on All Weighted Exercises

Extend the Epley e1RM calculation (`weight * (1 + reps/30)`) from Wendler AMRAP sets only to **all exercises with weight + reps inputs**:

- All Wendler working sets (Set 1, 2, 3 — not just AMRAP)
- Romanian Deadlift
- Leg Press

**Implementation note:** In the PLAN data, each Wendler set is a separate exercise entry (e.g. "Set 1: 65kg x 5" is its own exercise with `parseEx` returning `{type:'wendler', n:1, ...}`). Extending e1RM means showing the badge on any exercise where `p.type === 'wendler'` or `p.type === 'weighted'`, not just where `p.amrap === true`.

Display: same gold gradient badge beneath the set rows, shown whenever both weight and reps fields have values. Updates live on input (no re-render needed).

---

## 3. Previous Performance Inline Hints

For every exercise with input fields, show the logged values from the **same exercise (by name) in the previous week**.

### Lookup logic
- **Primary match:** by exercise `text` field (name-based). Scan the same day index in the previous week, find the first exercise whose `text` matches exactly. This handles skill progressions where exercise order shifts between weeks.
- **Fallback:** if no name match is found, do not show a hint (don't fall back to positional matching — a wrong hint is worse than no hint).
- Pull from `state.sets` for that prior-week key.
- Week 1: no hint (no prior data). All other weeks reference the immediately preceding week.

### Display
- Positioned below the set rows, indented to align with them (left-padded under exercise name)
- Styled: `font-size: 10px`, `color: var(--text-dim)`, subtle `2px` left border in `var(--border)`
- Only rendered when prior data actually exists — no empty placeholders

### Format by type
- **Wendler / Weighted:** `prev: 87kg x 11` (or `prev: 87kg x 11 → e1RM 119.9kg` for AMRAP sets)
- **Reps:** `prev: 5 reps`
- **Hold:** `prev: 15s`
- **For-time:** `prev: 3:42`
- Multiple sets: show the **best** set from the previous week, not all of them. "Best" defined per type: highest weight for weighted, highest reps for reps, longest time for holds, fastest for for-time.

---

## 4. Bottom Navigation Bar

A fixed bottom nav with two tabs: **Train** and **Progress**.

### Structure
- Fixed to viewport bottom, full width
- Background: `var(--surface)`, top border: `1px solid var(--border)`
- Two equally-spaced items: icon + label
- Active tab: gradient text + 2px gradient bar above (matches Option C nav pattern)
- Inactive tab: `var(--text-dim)`
- Height: ~56px

### Behaviour
- Tap to switch views (show/hide via `display:none`, no page reload)
- Train view preserves scroll position and expanded day cards: save `window.scrollY` on switch-away, restore on switch-back. Expanded card state is naturally preserved since elements are hidden, not destroyed.
- Progress view recalculates from `state.sets` each time shown (always fresh data)
- Top header ("Hyrox Prep" branding) persists across both views
- Body content: `padding-bottom: 72px` to clear the nav bar

---

## 5. Progress Dashboard

Visible when the **Progress** tab is active. Four sections, vertically scrollable.

### 5a. Summary Stats Row

3-4 stat cards (same card style as existing countdown row — `var(--surface)` with gradient top borders):

| Stat | Source | Example |
|------|--------|---------|
| Sessions Done | Count of days where every set checkbox is checked (all exercises, all sets) | 12 / 30 |
| Current Streak | Consecutive completed training days backward from today | 4 days |
| Total Volume | Sum of `weight * reps` across all weighted/Wendler sets | 24,680 kg |
| Best e1RM | Highest Epley e1RM across all weighted exercises | 119.9kg (Bench) |

### 5b. e1RM Trend Charts

One inline SVG sparkline card per weighted exercise that has data across 2+ weeks.

**Exercise grouping for charts:**
- **Bench Press:** aggregate across all exercises in sections whose name contains "Wendler Bench" (exact substring match — current section names are "Wendler Bench - 5s Week", "Wendler Bench - 3s Week", "Wendler Bench - 1s Week", "Wendler Bench - Deload", "Wendler Bench - 5s Week (TM 107.5kg)", "Wendler Bench - Taper"). Each "Set N" line is a separate exercise — take the best e1RM from any of them per week.
- **OHP:** same logic, sections containing "Wendler OHP".
- **Romanian Deadlift:** match by exercise `text` field containing "Romanian Deadlift". Straightforward — same name every week.
- **Leg Press:** match by exercise `text` field containing "Leg Press".

**Chart rendering:**
- X-axis: weeks 1-6 (only points where data exists)
- Y-axis: best e1RM for that exercise/group that week
- Gradient-stroked line, dots at data points, most recent value labelled
- Card: `var(--surface)` background, gradient top border, title like "Bench e1RM Trend"

### 5c. Skill & Conditioning Trends

A card showing progression for bodyweight/skill exercises across weeks:
- Groups by **exact exercise `text` field match** across weeks (e.g. "Strict Pull-ups" in Week 1 matches "Strict Pull-ups" in Week 3). Exercises with slightly different names (e.g. "Chest-to-Bar Pull-up attempts (strict)") are treated as separate entries — this is correct since they represent different movements.
- Shows best rep count (or time for holds) per week as inline sparkline or arrow text: `3 → 4 → 5 → 5`
- Only shows exercises with data across 2+ weeks

### 5d. Session Feel Trends

A card showing before/after feel ratings across sessions (see Section 6). Displays as a dual sparkline (before line + after line) or a simple arrow progression per week.

---

## 6. Session Feel Logging

Two mood/energy selectors per day: **before** and **after** the session.

### UI
- "Before" selector: shown at the top of each day's expanded body, below the day header
- "After" selector: shown above the session notes textarea
- 5-point scale, horizontal tap targets: `Terrible · Low · Okay · Good · Great`
- Tap to select (highlights with gradient accent), tap again to deselect
- Compact: single row, ~28px height

### State
- Stored as: `state.feel["f-{weekId}-{dayIdx}-pre"] = 1..5`
- And: `state.feel["f-{weekId}-{dayIdx}-post"] = 1..5`
- `loadState()` must be updated to initialise `feel: {}` alongside `sets` and `notes`

### Progress integration
- The Progress dashboard "Session Feel Trends" card reads these values
- Shows whether energy/recovery is trending up, stable, or declining across the programme

---

## 7. Export / Import

### Export
- Small "Export" button in the app header (top right area, next to "6-Week Plan" text)
- Styled subtly: `font-size: 11px`, `var(--text-dim)`, border pill
- On click: serialises the full `state` object to JSON, triggers a file download
- Filename: `hyrox-prep-backup-YYYY-MM-DD.json`

### Import
- Small "Import" link at the bottom of the Progress tab (below all charts)
- Opens a file picker, reads JSON, validates: (a) it has at least `sets` and `notes` keys, (b) both are plain objects (not strings/arrays/null). Also accepts `feel` and `restTimer` if present.
- Merge strategy: **shallow-recursive merge** — recurse only when both sides are plain objects; otherwise the imported value overwrites. This prevents prototype pollution and handles type mismatches cleanly. Keys not present in the import are left untouched. Importing an older backup (without `feel`) won't delete your current feel data.
- Shows a brief confirmation ("Imported successfully") or error ("Invalid file")
- Intentionally low-visibility — backup restore, not a primary interaction

---

## 8. Customisable Rest Timer

A floating rest timer that appears contextually during training.

### Trigger
- After checking off any set, a small floating pill appears (bottom-right, above the nav bar)
- Shows the default rest duration (e.g. "90s") with a play icon
- Tap to start countdown

### Timer display
- Pill expands to show countdown: `1:23` ticking down
- Background: `var(--surface)` with gradient border accent
- Stays visible while counting — doesn't obscure exercise content

### Configuration
- Tap a small cog icon on the timer pill to show duration options (no long-press — simpler implementation, no custom touch event handling needed)
- Options: 30s / 60s / 90s / 120s / 150s / 180s
- Selection persists in `state.restTimer` (integer, seconds) in localStorage
- `loadState()` must initialise `restTimer: 90` as the default
- Default: 90s

### Completion
- On reaching 0: vibration (if `navigator.vibrate` available) and/or a brief colour flash on the pill
- Timer pill auto-hides after 3 seconds post-completion, or when the user checks off the next set
- Tap to dismiss at any time

---

## 9. Maintainable Exercise Data Structure

Architecture concern — no UI change. Ensures future code edits (adding/removing exercises) are safe.

### Principles
- The `PLAN` object remains the single source of truth
- Each exercise is `{text: string, detail: string, amrap?: boolean}` — no opaque type codes
- Exercise type classification is derived from `text` and `detail` via `parseEx()` — no positional magic
- Sections are plain arrays — add/remove by array manipulation

### State key stability
- Set-level state keys are positional: `{weekId}-{dayIdx}-{secIdx}-{exIdx}-{setIdx}`
- **Appending** exercises to the end of a section is always safe (doesn't shift existing keys)
- **Inserting or removing** mid-section shifts subsequent indices — existing logged data for shifted exercises becomes orphaned (harmless but disconnected)
- A clear comment block at the top of the `PLAN` object documents: how to add an exercise, how to remove one, what happens to state, and how to clear orphaned data if needed

### Guide comment format
```
// ─── EDITING THIS PLAN ─────────────────────────────────────────
// To ADD an exercise: push {text, detail, amrap?} to the end of
//   a section's exercises array. Existing state is unaffected.
// To REMOVE an exercise: splice it out. State for exercises after
//   the removed one in that section will be orphaned. Clear with:
//   localStorage.removeItem('hyrox-prep-v2') to reset all data.
// To RENAME: just change text/detail. Type detection is automatic.
// Exercise types are auto-detected from text + detail strings.
//   See parseEx() for the classification logic.
// ────────────────────────────────────────────────────────────────
```

---

## 10. localStorage Size

The full state (sets, notes, feel, restTimer) for a 6-week plan with ~900 set entries, 30 day notes, 60 feel ratings, and a timer config is estimated at ~50-100KB of JSON. Well within the typical 5-10MB localStorage limit. No size management needed.

---

## 11. Out of Scope

- Cloud sync or accounts
- Plan editing in the UI
- PWA / service worker / notifications
- RPE scale (session feel logging covers subjective state)
- Per-exercise notes (day-level notes are sufficient)
- Apple Health / Google Fit integration
