---
version: 1
slug: "src-app-index-tsx"
primary_target: "src/app/index.tsx"
related_targets: ["src/components/app-tabs.tsx"]
---

Scope: Android Home screen and shared app shell. Mode: Operate.

Audience and job: Everyday Android users in the Philippines need a fast, trustworthy check of current conditions, today's important changes, and the seven-day outlook. Kai explains one useful implication without competing with factual weather data.

Chosen direction: Polished Weather Standard. Approved comp: `.impeccable/mocks/decision/polished-weather-standard.png`.

Composition: Safe-area location header; large weather hero; compact current-condition details; one Kai assistant surface; horizontally scrollable hourly forecast; simple seven-day rows; four-destination Material navigation. The memorable moment is Kai's concise umbrella advice directly below the current facts.

Component grammar: Light continuous page with a blue atmospheric hero, white elevated information surfaces, 14–16dp corners, soft downward shadows without simultaneous borders, 1dp neutral dividers, and one blue filled selection state. Type uses Android system sans with tabular numerals, display 88–104sp, headline 28–32sp, title 18–22sp, body 16sp, label 12–14sp. Sampled comp colors: page ground `#FCFDFE`; hero blue `#D1E6F9`; lower hero transition `#E9EDF4`; raised surface `#FCFDFF`; primary text `#0B2447`; action blue `#1976F3`; sun amber `#FFB000`.

Inventory:

| Ingredient | Commitment | Medium |
|---|---|---|
| Android navigation | Home, Forecast, Location, Settings with selected state and 48dp targets | Expo Router native tabs and vector icons |
| Weather hero | Location, 28°, condition, feels-like, high/low, blue sky field | Semantic React Native text/layout plus code-native gradient/shape treatment |
| Weather illustration | Sun and clouds supporting the current condition | Consistent vector icon family / code-native shapes |
| Detail surface | Rain, humidity, and wind in one horizontal group | Semantic React Native layout and vector icons |
| Kai assistant | Kai holding an umbrella on the left; advice on the right | Generated transparent raster at `assets/characters/kai-assistant-umbrella-v1.png`; text stays semantic |
| Hourly strip | Time, icon, temperature, and precipitation for eight periods | Horizontal FlatList and vector icons |
| Seven-day forecast | Seven compact rows with day, icon, condition, low/high range | FlatList, semantic text, vector icons, code-native range line |
| Sample status | Clearly labels all illustrative forecast values | Semantic badge text |

Constraints: Android only; sample data must be labeled; no live API calls in this task; no iOS chrome; Kai never obscures facts; respect system font scaling, reduced motion, safe areas, and 48dp touch targets.
