# Thrive Athletic Club — Training Platform

## Quick Start (Claude Code)

This project is designed to be built iteratively in Claude Code. Start here.

### Project Structure
```
thrive-app/
├── PROJECT_SPEC.md          ← Full technical spec (read this first)
├── README.md                ← You are here
├── data/
│   ├── monday.json          ← 12 Monday workouts (HYROX simulations)
│   ├── wednesday.json       ← 12 Wednesday workouts (rotating format)
│   └── thursday.json        ← 12 Thursday workouts (accessory, 3-week rotation)
└── src/                     ← React app (to be scaffolded in Phase 2)
```

### Build Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1. Workout Library | ✅ DONE | 36 workouts across 3 day slots with full tagging |
| 2. App Shell | 🔲 NEXT | Vite + React, port existing tools, design system |
| 3. Weekly Planner | 🔲 | Smart assignment, track filtering, swap UI |
| 4. Logging + Progression | 🔲 | Session logs, 5/3/1 auto-progression |

### Phase 2 — What to Build Next

Scaffold a Vite + React app with:
1. **Design system** — DM Mono font, black bg, neon color vars, card components
2. **Tab navigation** — My Week / 5/3/1 / Library / Roulette
3. **User selector** — Simple dropdown, no auth, stores in localStorage
4. **Port 5/3/1 calculator** from `page-template-531.php` (logic is in the inline `<script>`)
5. **Port workout library browser** from `page-template-hyrox.php` (cards + filter)
6. **Port HYROX roulette** from `page-template-roulette.php`
7. **Load workout data** from the JSON files in `/data`

### Design System Reference

```css
/* Colors */
--color1: #FF00FF   /* magenta */
--color2: #00FFFF   /* cyan */
--color3: #39FF14   /* neon green */
--color4: #FFFF00   /* yellow */
--color5: #FF4500   /* orange */
--bg: #000000
--card-bg: #252525
--input-bg: #151515

/* Typography */
Font: "DM Mono", monospace
Labels: uppercase, letter-spacing: 0.1em
Body: 12px base

/* Components */
Cards: #252525 bg, 1px solid black border, hover → 1px solid white
Buttons: black bg, white border, uppercase, letter-spacing 0.1em
Inputs: #151515 bg, 1px solid #333 border, 6px border-radius
Checkboxes: Custom 22px, magenta when checked
```

### Naming Convention — Mythology
- **Monday (Greek):** Ares, Poseidon, Anubis*, Hephaestus, Osiris*, Odin*, Horus*, Kali*, Hermes, Sobek*, Athena, Apollo
- **Wednesday (Norse):** Fenrir, Jormungandr, Huginn, Norns, Valkyrie, Bifrost, Tyr, Skadi, Freya, Baldur, Heimdall, Ragnarok
- **Thursday (Japanese):** Susanoo, Tsukuyomi, Raijin, Fujin, Amaterasu, Izanagi, Bishamonten, Inari, Ryujin, Kagutsuchi, Izanami, Benzaiten

*Some Monday names cross pantheons for flavor — Egyptian (Anubis, Osiris, Horus, Sobek, Ra) and Hindu (Kali) mixed with Greek.

### Equipment Available
- **Machines:** Concept2 Rower, Ski Erg, Assault/Echo Bike (NO Bike Erg)
- **Sleds:** Multiple available (push + pull capable), occasional sharing needed
- **Stations:** Wall balls (14/9lb+), Sandbags (20/10kg+), Kettlebells (up to 32kg), Dumbbells (up to 50lb+)
- **Other:** Pull-up bars, benches, barbells, cable machines, bands, boxes

### Workout Library Stats

| Day | Count | Formats | Tracks |
|-----|-------|---------|--------|
| Monday | 12 | hyrox_sim, for_time, amrap, emom | hybrid, conditioning, strength |
| Wednesday | 12 | tabata, intervals, emom, roulette, compromised_run, amrap, for_time | hybrid, conditioning, strength |
| Thursday | 12 | accessory, mobility | hybrid, strength, conditioning |
| **Total** | **36** | | |

### Thursday Rotation Schedule
- Week 1: Posterior Chain — Susanoo, Tsukuyomi, Raijin, Fujin
- Week 2: Pressing Volume + Core — Amaterasu, Izanagi, Bishamonten, Inari
- Week 3: Mobility + Single-Leg — Ryujin, Kagutsuchi, Izanami, Benzaiten
- Week 4: Repeat cycle

### Wednesday Sub-Format Rotation
- Week 1: Intervals — Fenrir, Jormungandr, Huginn
- Week 2: Roulette — Norns, Valkyrie, Bifrost
- Week 3: Compromised Running — Tyr, Skadi, Freya
- Week 4: Bodyweight / Light DB Metcon — Baldur, Heimdall, Ragnarok
- Week 5: Repeat cycle

### Open Items
- [ ] Other users' track assignments (strength / conditioning / hybrid)
- [ ] Any additional equipment constraints per user
