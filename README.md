# WeatherAI

WeatherAI is an Android weather assistant built with React Native, Expo, Expo Router, and TypeScript.

The first milestone is a focused weather MVP with automatic and manual location selection, Open-Meteo current conditions, today's forecast, a seven-day forecast, caching, and resilient loading and error states.

## Requirements

- Node.js 22.13 or newer
- npm
- Expo Go on an Android device, or an Android emulator

## Development

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm start
```

Open directly on Android when an emulator or connected device is available:

```bash
npm run android
```

Run static checks:

```bash
npm run lint
npx tsc --noEmit
```

## Project guidance

- Read `plan.md` for product scope and delivery phases.
- Read `rules.md` and `AGENTS.md` before changing the project.
- Keep external API calls behind typed services and adapters.
- Never place private API keys in the mobile application.

## Platform scope

WeatherAI targets Android only. iOS deployment, TestFlight, and App Store release work are outside the project scope.
