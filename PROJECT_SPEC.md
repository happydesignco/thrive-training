# Thrive Athletic Club — Training Platform

## Project Spec v1.0

**Last Updated:** 2026-02-27

---

## 1. Overview

A standalone web app for Thrive Athletic Club (~10 users) that unifies weekly training programming, 5/3/1 strength tracking, a conditioning workout library, and HYROX roulette into a single interface. Designed to be developed and iterated in Claude Code.

---

## 2. User Context

### Primary User: Adam Gronwald
- Age 36, 5'10.75", ~187 lbs
- Goals: 1,000 lb powerlifting total, hybrid athlete conditioning, longevity
- Current program: 5/3/1 two days/week + conditioning three days/week
- Recent injury: SI/lumbar irritation (recovering, needs movement pattern awareness)
- Body comp trend: Cutting phase → maintenance (187 lbs, 23% BF, trending down)

### Weekly Schedule (All Users)
| Day | Focus | Duration | Notes |
|-----|-------|----------|-------|
| Monday | Conditioning — Machine-heavy HYROX simulations | 40–50 min | Longest conditioning day. Row/ski/bike + stations. |
| Tuesday | 5/3/1 Lifting — Bench Press + Back Squat | 45–60 min | Main strength day A. |
| Wednesday | Conditioning — Rotating format | 25–35 min | Shorter. Rotates: intervals, roulette stations, compromised running, bodyweight metcons. |
| Thursday | Accessory / Auxiliary Day | 30–45 min | Supports 5/3/1 lifts. Track-dependent programming. |
| Friday | 5/3/1 Lifting — Deadlift + Overhead Press | 45–60 min | Main strength day B. |
| Sat/Sun | Off / Active Recovery | Variable | Snowboarding, pickleball, hiking, etc. |

### Three Tracks
1. **Strength-Focused** — Heavier accessories on Thursday, conditioning is lighter/shorter
2. **Conditioning-Focused** — Thursday is circuit/metabolic work, conditioning days are higher volume
3. **Hybrid** (Adam's track) — Balanced accessories + conditioning, most variety

---

## 3. Architecture

### Tech Stack
- **Framework:** React (Vite scaffold)
- **Styling:** Tailwind CSS + custom CSS variables for Thrive design system
- **State:** React context + localStorage (per-device persistence)
- **Multi-user:** Simple user selector (no auth), each user's data namespaced in localStorage
- **Deployment:** Static build, deployable to any host (Vercel, Netlify, or WordPress page embed)
- **Future:** Migrate to Supabase/Firebase if cross-device sync needed

### Design System (from existing templates)
```css
:root {
  --color1: #FF00FF;  /* magenta */
  --color2: #00FFFF;  /* cyan */
  --color3: #39FF14;  /* neon green */
  --color4: #FFFF00;  /* yellow */
  --color5: #FF4500;  /* orange */
  --bg: #000000;
  --card-bg: #252525;
  --input-bg: #151515;
  --font: "DM Mono", monospace;
}
```
- Black background, white text, neon accents
- Monospace typography throughout
- Cards with subtle borders, hover states
- Section color rotation (5-color cycle)
- Uppercase labels with letter-spacing for section headers
- Minimal, utilitarian aesthetic — gym terminal feel

### App Structure
```
/src
  /components
    Layout.jsx          — Shell, nav tabs, user selector
    WeekView.jsx        — Mon–Fri at a glance
    WorkoutCard.jsx     — Single workout display (reuses existing card design)
    FiveThreeOne.jsx    — 5/3/1 calculator (port from page-template-531.php)
    WorkoutLibrary.jsx  — Browse/filter all workouts
    Roulette.jsx        — HYROX roulette (port from page-template-roulette.php)
    SessionLog.jsx      — Mark complete, log weights/times/notes
    ThursdayBuilder.jsx — Track-dependent accessory day generator
  /data
    workouts.json       — Full workout library
    thursday.json       — Thursday accessory templates
    tracks.json         — Track definitions and rules
  /hooks
    useUser.js          — User state management
    useWeekPlan.js      — Weekly plan generation and persistence
    useProgression.js   — 5/3/1 training max tracking
  /utils
    planner.js          — Smart workout assignment logic
    rounding.js         — Weight rounding helpers
  App.jsx
  main.jsx
```

### Navigation Tabs
1. **My Week** — Weekly plan view (default landing)
2. **5/3/1** — Calculator + progression tracking
3. **Library** — Browse all workouts with filters
4. **Roulette** — HYROX station randomizer

---

## 4. Workout JSON Schema

Every workout in the library follows this schema:

```jsonc
{
  "id": "mon-001",                          // Unique ID: {day_slot}-{number}
  "name": "Thanos",                         // Display name (superhero theme continues)
  "title": "Row/Ski Ladder + Sled Push + Farmer Carry",  // Descriptive subtitle
  "day_slot": "monday",                     // monday | wednesday | thursday
  "track": ["hybrid", "conditioning"],      // Which tracks can use this workout
  "format": "hyrox_sim",                    // See format taxonomy below
  "energy_system": "glycolytic",            // aerobic | glycolytic | alactic | mixed
  "movement_patterns": ["hinge", "carry", "machine"],  // Patterns loaded
  "equipment": ["rower", "ski_erg", "sled", "kettlebells"],
  "duration_minutes": 45,                   // Estimated total session time
  "intensity": "moderate",                  // low | moderate | high
  "sections": {                             // Ordered workout sections
    "A": {
      "type": "WARM UP",
      "description": ["..."]
    },
    "B": {
      "type": "FOR TIME",
      "title": "Row/Ski Ladder + Sled Push",
      "description": ["..."],
      "alternatives": ["..."]               // Optional equipment substitutions
    },
    "C": {
      "type": "AEROBIC",
      "title": "Farmer Carry Finisher",
      "description": ["..."]
    }
  },
  "scaling": {                              // Optional per-track scaling notes
    "strength": "Heavier sled, shorter distances",
    "conditioning": "Lighter sled, add a round",
    "hybrid": "As written"
  },
  "avoid_after": ["deadlift", "heavy_squat"],  // Don't program if this was done yesterday
  "notes": "Good benchmark workout — track total time."
}
```

### Format Taxonomy
| Format | Description | Typical Day |
|--------|-------------|-------------|
| `hyrox_sim` | Machine intervals + HYROX stations (sled, carry, wall balls, etc.) | Monday |
| `amrap` | As many rounds as possible in a time cap | Monday, Wednesday |
| `for_time` | Complete prescribed work as fast as possible | Monday, Wednesday |
| `emom` | Every minute on the minute intervals | Wednesday |
| `tabata` | 20s work / 10s rest intervals | Wednesday |
| `intervals` | Bike/ski/row sprints with programmed rest | Wednesday |
| `compromised_run` | Running interspersed with movements | Wednesday |
| `roulette` | Random HYROX station (use roulette tool) | Wednesday |
| `accessory` | Supplemental strength work supporting 5/3/1 | Thursday |
| `circuit` | Lighter station-based metabolic work | Thursday (conditioning track) |
| `mobility` | Dedicated mobility and movement quality | Thursday (all tracks, every 3rd week) |

---

## 5. Workout Library Requirements

### Monday — Machine-Heavy HYROX Simulations (10–12 workouts)

**Design principles:**
- Always include at least 2 different machines (row, ski, bike, or assault bike)
- Always include at least 1 HYROX station (sled push, sled pull, burpee broad jump, farmer carry, sandbag lunges, wall balls)
- Duration: 40–50 minutes including warm-up
- Intensity: Moderate to high
- Avoid heavy squatting and pressing (Tuesday is bench + squat day)
- Posterior chain loading is OK (48+ hours since Friday deadlifts)
- Format: Primarily `hyrox_sim`, `for_time`, or `amrap`
- Every workout should have equipment alternatives for sled movements

**Structure template:**
```
A. Warm Up (5–8 min) — Bike/row + dynamic mobility
B. Main Block (20–30 min) — Machine + station work
C. Finisher (5–10 min) — Optional carry, run, or station burnout
```

### Wednesday — Rotating Format (10–12 workouts)

**Design principles:**
- Shorter and more varied than Monday
- Duration: 25–35 minutes including warm-up
- Rotates through 4 sub-formats:
  1. **Short & spicy intervals** (3 workouts) — Bike/ski sprints, tabata, EMOM
  2. **Roulette-style station work** (3 workouts) — Semi-random station pairings
  3. **Compromised running** (3 workouts) — Run + movement combos
  4. **Bodyweight / light DB metcons** (3 workouts) — Minimal equipment
- Intensity: Moderate to high
- Avoids heavy hinge patterns (Friday is deadlift day)
- Avoids heavy pressing (Tuesday was bench day)
- Should be fatiguing but not systemically crushing

### Thursday — Accessory Day (10–12 workouts)

**Design principles:**
- Track-dependent (each workout has scaling for all 3 tracks)
- Duration: 30–45 minutes
- Every 3rd Thursday = dedicated mobility session (all tracks)
- Strength track: Heavier compound accessories (3–4 sets of 6–10 reps)
- Conditioning track: Lighter circuit-style work (higher reps, shorter rest)
- Hybrid track: Mix of both

**Rotation themes (3-week cycle, repeated):**
1. **Posterior chain** — RDLs, hip thrusts, rows, hamstring curls, glute work
2. **Pressing volume + core** — DB press, dips, push-ups, tricep work, planks, carries
3. **Mobility + single-leg** — 90/90s, pistol progressions, step-ups, balance work, stretching

**Thursday must support the 5/3/1 lifts:**
- Week after heavy squat progression: Posterior chain (supports next deadlift cycle)
- Week after heavy deadlift progression: Pressing volume (supports next bench cycle)
- Deload weeks: Mobility focus

---

## 6. Weekly Planner Logic

### Assignment Rules
1. Monday always pulls from monday pool
2. Wednesday always pulls from wednesday pool
3. Thursday always pulls from thursday pool, respecting 3-week rotation
4. Never assign a workout that loads the same primary pattern as the day before
   - e.g., if Tuesday was heavy squat + bench, Monday's workout should not include heavy squatting
   - e.g., if Friday is heavy deadlift + OHP, Thursday should not include heavy hinge work
5. Track filter: Only show workouts tagged for the user's track
6. No repeat within 4 weeks (or until pool is exhausted)
7. Wednesday sub-format rotation: intervals → roulette → compromised run → metcon → repeat

### Week Generation
- Auto-generated on Sunday night (or on first app load of the week)
- User can swap any workout for another from the same pool
- Swapped workouts go back in the available pool

---

## 7. 5/3/1 Integration

Port the existing calculator logic from page-template-531.php. Add:
- Per-user training max storage
- Auto-progression: +5 lbs upper body, +10 lbs lower body after each 3-week cycle
- Deload week programming (every 4th week: 40/50/60% x 5)
- BBB toggle (already exists)
- Training max history (track over time)

---

## 8. Roulette Integration

Port from page-template-roulette.php. Add:
- Integration as a Wednesday workout option ("Roulette Day")
- When selected, the weekly view shows the roulette widget inline
- Session log captures which stations were hit and total time

---

## 9. Session Logging (Phase 4)

Each completed workout captures:
- Date and workout ID
- Completion status (full / partial / skipped)
- Actual weights used (for strength/accessory work)
- Time to complete (for timed workouts)
- RPE (1–10 scale)
- Free-text notes
- Stored per-user in localStorage

---

## 10. Persistence Model

```javascript
// localStorage key structure
`thrive:users`                          // Array of user objects [{id, name, track}]
`thrive:user:{id}:531`                  // {squat_tm, bench_tm, deadlift_tm, press_tm, bbb, round}
`thrive:user:{id}:531:history`          // Array of TM snapshots over time
`thrive:user:{id}:week:{yyyy-Www}`      // Weekly plan: {mon, wed, thu} workout IDs + completion
`thrive:user:{id}:log:{workout_id}`     // Session log entries
`thrive:user:{id}:preferences`          // UI preferences
```

---

## 11. Build Phases

### Phase 1 — Workout Library + JSON Schema ← YOU ARE HERE
- Define complete JSON schema
- Write all 30–36 workouts (10–12 per day slot)
- Validate: every Monday has machine + station, every Wednesday fits its sub-format, every Thursday has 3-track scaling

### Phase 2 — Unified App Shell
- Vite + React scaffold
- Port 5/3/1 calculator
- Port workout library browser
- Port roulette
- Implement design system (DM Mono, neon colors, black bg)
- User selector (no auth)

### Phase 3 — Weekly Planner
- Implement assignment rules
- Weekly view component
- Workout swapping
- Track-based filtering

### Phase 4 — Session Logging + Progression
- Completion tracking
- Weight/time logging
- 5/3/1 auto-progression
- Training max history

---

## 12. Open Questions (Need Input)

1. **Adam's current 5/3/1 training maxes** — Needed for Thursday accessory calibration and 531 defaults
2. **Equipment reliability** — Are sleds, ski ergs, rowers, assault bikes all consistently available? Any equipment that's frequently occupied or broken?
3. **Other users' profiles** — Do any of the ~10 users have specific limitations, injuries, or strong preferences that should be tracked?
4. **Warm-up standardization** — Should all workouts use the same warm-up template, or vary by session type? (Current library has slight variations)
5. **Naming convention** — Continue superhero names for new workouts? Or new theme for the expanded library?

---

End of Spec
