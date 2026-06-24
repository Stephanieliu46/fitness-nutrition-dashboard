@AGENTS.md

# FitTrack — Fitness & Nutrition Dashboard

Next.js 16 (App Router) · TypeScript · Tailwind CSS · Playwright

## Project structure

```
app/                  Next.js App Router pages & API routes
  layout.tsx          Root layout with NavBar
  page.tsx            Dashboard home
  workout/page.tsx    Workout log page
  nutrition/page.tsx  Nutrition database page
  api/nutrition/      GET /api/nutrition?q=<query>
components/
  layout/             NavBar, StatsCard
  workout/            WorkoutSummary, WorkoutLogger
  nutrition/          NutritionSummary, NutritionTracker
lib/
  types.ts            Shared TypeScript interfaces
  nutrition.ts        getFoodDatabase, searchFoods, calcMacros
  useLocalStorage.ts  SSR-safe localStorage hook
data/
  uk-nutrition.json   Seeded UK food nutrition data (per 100 g)
scripts/
  scrape-nutrition.ts Playwright scraper — updates uk-nutrition.json
```

## Common commands

```bash
npm run dev        # start dev server at localhost:3000
npm run build      # production build
npm run lint       # ESLint
npm run scrape     # run Playwright nutrition scraper
```

## Scraper notes

Before running the scraper for the first time:

```bash
npx playwright install chromium
npm run scrape
```

The scraper merges results into `data/uk-nutrition.json` — existing entries
with the same name are overwritten; others are preserved. Add new target URLs
to the `TARGETS` array in `scripts/scrape-nutrition.ts`.
