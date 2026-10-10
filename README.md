# Consifit

Mobile-first Progressive Web App for home pull-up bar and core workouts. Built with React, Vite, Tailwind CSS, and Lucide icons. All data stays in `localStorage` for offline-first use.

## Features

- Default pull & core exercises with full exercise manager (add / edit / delete)
- Thumb-friendly bottom-sheet logging with previous-session reference
- Bodyweight vs band-assisted set tagging with band level presets
- Live summary: today’s BW/band totals and delta vs last workout
- Rest timer with Wake Lock, Web Audio chime, +30s / pause / skip
- Progression charts (BW vs band lines) for the last 10 workouts
- PWA install support + JSON export/import backup

## Develop

```bash
npm install
npm run dev
```

## Build / preview

```bash
npm run build
npm run preview
```

Install from the browser “Add to Home Screen” prompt after opening the preview URL on your phone.
