# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Stack

React Native, Expo SDK 57, Expo Router, and TypeScript.

## Users

The primary users are everyday Android users in the Philippines checking weather before commuting, traveling, working, exercising, or spending time outdoors.

## Product Purpose

WeatherAI helps users understand current conditions, what will happen next, and what those conditions mean for their plans. The Weather MVP succeeds when users can quickly identify current weather, today's important changes, and the seven-day outlook using reliable provider data.

## Positioning

WeatherAI combines factual provider-backed forecasts with Kai, a friendly weather companion who makes conditions easier to understand without obscuring or inventing weather data.

## Operating Context

The app is used on Android phones, often during quick daily checks, commutes, travel preparation, outdoor planning, and changing weather. Philippine weather context and official PAGASA guidance are important for safety-critical conditions.

## Capabilities and Constraints

- Android-only application.
- The first milestone includes automatic and manual location, Open-Meteo current conditions, today's forecast, a seven-day forecast, caching, loading states, and error states.
- AI, news, notifications, accounts, and production distribution follow only after the Weather MVP is stable.
- Weather facts must come from an approved provider and pass through normalized application models.
- Private API keys must never be bundled in the mobile application.
- The interface must remain readable and useful with poor connectivity, denied permissions, unavailable services, and stale cached data.

## Brand Commitments

- Product name: WeatherAI.
- Kai is the approved human chibi weather companion and should be prominent on the Home screen as a guide while factual weather data remains the primary content.
- Kai's approved reference is `assets/characters/kai-weatherai-concept-v1.png`.
- Kai wears an original red, black, and white WeatherAI basketball-inspired jersey with number 24 and weather-specific accessories.
- The brand may draw on energetic 1990s sports-manga qualities but must not copy protected characters, uniforms, logos, or a living artist's exact style.

## Evidence on Hand

- Product scope and roadmap: `plan.md`.
- Development constraints: `rules.md` and `AGENTS.md`.
- Approved Kai character sheet: `assets/characters/kai-weatherai-concept-v1.png`.
- No production weather data, testimonials, or commercial claims are currently available and none should be fabricated.

## Product Principles

- Put trustworthy weather facts first.
- Explain what the forecast means without inventing data.
- Make daily weather checks fast and glanceable.
- Use Kai to add clarity and personality, not distraction.
- Design resiliently for Android, accessibility, and unreliable networks.

## Accessibility & Inclusion

Support readable text, sufficient contrast, screen readers, reduced motion, meaningful accessibility labels, and adequate touch targets. Never communicate safety information through color alone. Represent Filipino users respectfully without stereotypes.
