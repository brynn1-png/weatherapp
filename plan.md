WeatherAI — AI-Powered Weather Assistant

1. Project Overview

WeatherAI is a mobile-first weather application built with React Native and Expo.

The goal is to create more than a traditional weather app. It should combine:

Current weather

Hourly forecast

Multi-day forecast

Location-based weather

AI-generated weather summaries

AI weather questions and recommendations

Weather-related news

AI news summaries

Weather alerts and notifications

A clean, modern, mobile-first interface

The application targets Android only. iOS support and deployment are outside the project scope.

2. Core Technology Stack

Mobile

React Native

Expo

TypeScript

Expo Router

Styling

Recommended:

NativeWind / Tailwind CSS

React Native StyleSheet where native behavior is preferable

Reanimated for advanced animations

Do not overuse third-party UI libraries. Prefer a small, consistent design system.

Weather

Primary weather provider:

Open-Meteo

The weather provider is responsible for factual weather data. The AI must NOT invent weather conditions.

AI

AI provider:

OpenAI API or another compatible LLM provider

AI should interpret structured weather/news data rather than independently generating weather forecasts.

Backend

Recommended:

Supabase

PostgreSQL

Supabase Edge Functions or a small Node.js backend

The backend should protect private API keys and provide a controlled interface between the mobile application and external AI/news services.

Notifications

Expo Notifications

Weather alert provider/data source

Optional PAGASA alert integration for Philippine weather information

Build / Deployment

Expo EAS Build

Android APK for personal testing and direct sharing

Android AAB for Google Play

3. Main Features

3.1 Current Weather

Display:

Current temperature

Feels-like temperature

Weather condition

Weather icon

Humidity

Wind speed

Wind direction

Precipitation probability

UV index where available

Visibility where available

Sunrise

Sunset

Example:

Santa Cruz

28°C
Partly Cloudy

Feels like 31°C

Rain       40%
Humidity   78%
Wind       14 km/h

4. Today's Forecast

The home screen should provide an understandable summary of today's weather.

Show:

Morning

Afternoon

Evening

Night

Temperature range

Rain probability

Important weather changes

Example:

TODAY

Morning
27°C   Partly cloudy
Rain: 20%

Afternoon
31°C   Cloudy
Rain: 60%

Evening
28°C   Rain
Rain: 70%

5. Multi-Day Forecast

Initial target:

7-day forecast

Each day should show:

Date

Weather condition

High temperature

Low temperature

Rain probability

Weather icon

Example:

MON   ☀️   31° / 25°   20%
TUE   🌦️   30° / 25°   50%
WED   🌧️   29° / 24°   70%
THU   🌧️   28° / 24°   80%
FRI   ⛅   30° / 25°   40%
SAT   ☀️   31° / 25°   20%
SUN   🌦️   30° / 25°   50%

6. Location System

Support two modes.

Automatic Location

User can choose:

Use my current location

Use device location through Expo Location.

Manual Location

User can search for a city/location.

Example:

Search location

[ Manila                  🔍 ]

Recent locations:
- Santa Cruz
- Manila
- Tagaytay
- Quezon City

The weather system should always know which location the forecast belongs to.

7. AI Weather Summary

This is one of the main differentiating features.

The AI receives structured weather data and produces a human-readable summary.

Example:

Today's Weather

Rain is possible this afternoon, with temperatures
reaching around 31°C. Conditions should be more
comfortable during the morning.

If you're going outside this afternoon, bring an
umbrella and expect humid conditions.

Important Rule

The AI must never invent weather data.

Correct architecture:

Weather API
    ↓
Structured Weather Data
    ↓
AI
    ↓
Human-readable explanation

Not:

AI
 ↓
Invented weather forecast

8. AI Weather Assistant

Create an AI chat screen.

Users can ask:

"Will it rain tomorrow?"

"Should I bring an umbrella?"

"Is it a good day to jog?"

"What time should I go outside?"

"What will the weather be like this weekend?"

"Is it safe to travel today?"

"What should I wear?"

"Will the rain continue tonight?"

The AI should answer based on actual weather data available to the application.

Example:

USER:
Should I go jogging this afternoon?

AI:
It may not be the best time. Rain probability
is higher this afternoon and humidity is expected
to remain high.

Early morning would be a better option.

The assistant should clearly distinguish between:

Weather facts

AI interpretation

General advice

For safety-critical situations, direct users to official weather authorities.

9. Weather News

Create a dedicated News screen.

Possible categories:

Local weather

Tropical cyclones

Heavy rainfall

Flooding

Landslides

Extreme heat

Severe weather

Weather science

For Philippine users, prioritize official sources such as PAGASA for warnings/advisories where appropriate.

News should include:

Headline

Source

Published date

Image where legally/technically appropriate

Short summary

Open article action

10. AI News Summaries

The AI can summarize long weather articles.

Example:

ARTICLE

Heavy rainfall expected in several areas...

AI SUMMARY

What you need to know:

Heavy rainfall may affect several areas.
Residents in flood-prone locations should monitor
official advisories and prepare for possible flooding.

Do not present AI summaries as official statements.

Always show the original source.

11. Weather Alerts

Later versions should support push notifications.

Potential alerts:

Heavy rain

Thunderstorms

Tropical cyclone

Flood warning

Landslide warning

Extreme heat

Strong winds

Official government weather warnings

Example:

🚨 WEATHER ALERT

Heavy rainfall expected in your area.

Tap to view details.

For Philippine alerts, use official PAGASA information where possible.

12. Navigation

Recommended Expo Router structure:

app/
├── _layout.tsx
├── index.tsx
├── forecast.tsx
├── news.tsx
├── ai.tsx
├── settings.tsx
├── location.tsx
└── weather/
    └── [location].tsx

Possible navigation:

Home
Forecast
News
AI
Settings

Use a bottom tab/navigation pattern appropriate for mobile.

13. Recommended Project Architecture

A scalable structure:

src/
├── app/
├── components/
│   ├── weather/
│   ├── forecast/
│   ├── news/
│   ├── ai/
│   └── common/
│
├── services/
│   ├── weather/
│   ├── news/
│   ├── ai/
│   └── location/
│
├── hooks/
│
├── store/
│
├── types/
│
├── utils/
│
├── constants/
│
└── config/

Keep external API calls out of UI components.

Prefer:

Screen
 ↓
Hook / State
 ↓
Service
 ↓
API

Instead of:

Screen
 ↓
Direct API calls everywhere

14. Data Flow

Weather

User Location
     ↓
Location Service
     ↓
Coordinates
     ↓
Open-Meteo
     ↓
Weather Service
     ↓
Normalized Weather Model
     ↓
UI

AI

Weather Service
     ↓
Normalized Weather Data
     ↓
Backend
     ↓
AI API
     ↓
AI Response
     ↓
Mobile UI

News

News Source/API
     ↓
News Service
     ↓
Article Data
     ↓
AI Summary (optional)
     ↓
News UI

15. Data Models

Use normalized application-level types.

Example:

type CurrentWeather = {
  temperature: number;
  apparentTemperature?: number;
  weatherCode: number;
  humidity?: number;
  windSpeed?: number;
  windDirection?: number;
  precipitationProbability?: number;
};

type DailyForecast = {
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbability?: number;
};

type WeatherLocation = {
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

Do not spread provider-specific response shapes throughout the UI.

Create a mapping layer:

Open-Meteo Response
        ↓
Weather Adapter
        ↓
Application Weather Model
        ↓
UI

This makes it easier to change weather providers later.

16. Design Direction

The application should feel:

Modern

Clean

Mobile-first

Fast

Easy to understand

Visually weather-aware

Native-feeling

Accessible

Avoid turning the home screen into a dashboard overloaded with cards.

Prioritize:

Current weather

Today's important information

AI summary

Forecast

Additional details

Use progressive disclosure for advanced information.

17. Weather Visual System

The UI can respond visually to weather conditions.

Examples:

Sunny       → bright / warm atmosphere
Cloudy      → muted atmosphere
Rain        → cool / rainy atmosphere
Storm       → darker / dramatic atmosphere
Night       → dark night mode

Animations should remain subtle.

Do not sacrifice readability or battery life for visual effects.

18. Accessibility

The application must support:

Large readable text

Sufficient contrast

Screen readers

Accessible buttons

Touch targets large enough for mobile

Reduced motion preferences

Meaningful accessibility labels

Do not communicate important information through color alone.

Example:

Bad:

Red = danger

Better:

⚠️ Heavy rain warning

19. Performance Rules

Avoid unnecessary API requests

Cache weather data

Debounce location searches

Avoid excessive re-renders

Use FlatList for long lists

Lazy-load screens/data where useful

Compress images

Avoid expensive animations

Prefer server-side AI calls

Handle offline states gracefully

The app should show cached data while refreshing when appropriate.

20. Error Handling

Always handle:

No internet
Location denied
Weather API unavailable
AI unavailable
News unavailable
Invalid location
API rate limit
Server error

Example:

Unable to update weather.

Showing the last available forecast.

[ Try Again ]

Never leave the user staring at a blank screen.

21. Security

Never put private API keys directly inside the React Native application.

Do NOT do:

const OPENAI_API_KEY = "secret-key";

inside the mobile application.

Instead:

Mobile App
    ↓
Your Backend
    ↓
AI Provider

Use environment variables/secrets on the backend.

Public configuration such as non-secret API endpoints may remain in the app when appropriate.

22. Database

A database is NOT required for the first weather prototype.

Add Supabase when implementing:

User accounts

Favorite locations

User preferences

AI conversation history

Saved articles

Notification preferences

Weather history

Analytics

Suggested tables later:

profiles
favorite_locations
weather_preferences
ai_conversations
ai_messages
saved_articles
notification_preferences

23. Development Phases

Phase 0 — Project Setup

Create Expo project

Configure TypeScript

Configure Expo Router

Configure styling

Install Expo Skills

Configure Codex

Configure Expo MCP

Establish project rules

Create README and documentation

Phase 1 — Weather MVP

Location permission

Manual location search

Open-Meteo integration

Current weather

Today's forecast

7-day forecast

Loading states

Error states

Basic caching

Phase 2 — UI/UX

Design system

Weather icons

Responsive layouts

Animations

Dark mode

Accessibility

Empty states

Skeleton loading

Polish navigation

Phase 3 — AI

Backend AI endpoint

Weather summary

AI weather questions

Weather recommendations

Prompt/version management

AI error handling

Phase 4 — News

News provider

News screen

Source attribution

AI article summaries

Article details

Phase 5 — Notifications

Expo Notifications

Weather alerts

User notification preferences

Location-aware notifications

Phase 6 — Production

App icon

Splash screen

App metadata

Android APK

Android AAB

EAS Build

Testing

Crash/error monitoring

Google Play preparation

24. Android Deployment

Development

Use Expo Go for early development.

npx expo start

Personal APK

Use EAS Build to create an installable Android APK.

The APK can then be transferred to your Android phone and installed directly.

Google Play

Create an Android production build/AAB and submit it through Google Play Console.

Do not make Play Store publishing a requirement for the first milestone.

25. Platform Scope

WeatherAI is an Android-only application.

Do not include iOS-specific deployment, testing, configuration, or release requirements.

26. AI Agent / Codex Development Strategy

Codex is the primary coding agent for this project.

Do not ask the agent to build the entire application in one prompt.

Use incremental tasks.

Recommended workflow:

Plan
 ↓
Implement one feature
 ↓
Run
 ↓
Test
 ↓
Inspect
 ↓
Fix
 ↓
Commit
 ↓
Next feature

Codex should be instructed to:

Read project documentation first

Follow AGENTS.md

Use official Expo documentation

Prefer Expo-compatible packages

Avoid unnecessary dependencies

Test changes

Explain architectural decisions

Never expose secrets

Keep components maintainable

Verify mobile behavior

27. Recommended Codex Prompt Style

Instead of:

Build the whole weather app.

Use:

Read AGENTS.md and the project documentation first.

Implement Phase 1, Task 1 only:
Set up the weather service architecture and
Open-Meteo integration.

Requirements:
- TypeScript
- Separate API/service layer
- Normalized weather types
- Loading/error states
- No API secrets in the client
- Follow current Expo SDK recommendations

Before modifying files:
1. Inspect the existing project.
2. Explain the files you plan to change.
3. Implement the smallest clean solution.
4. Run the relevant checks.
5. Report what changed and any remaining issues.

28. AI Agent Skills / Plugins

28.1 Official Expo Plugin — HIGHLY RECOMMENDED

Expo now provides official AI-agent skills for Expo and React Native.

For Codex:

codex plugin add expo@openai-curated

Then authenticate Expo MCP:

codex mcp login expo

The Expo plugin provides Expo-specific skills and registers the Expo MCP Server.

Useful capabilities include:

Expo SDK guidance

Project structure

Expo Router

Native UI

Animations

Tailwind setup

EAS builds

SDK upgrades

Expo examples

This should be the first agent integration installed for this project.

29. Expo MCP

Expo MCP gives Codex access to current Expo/EAS information and tools.

It can help with:

Current Expo documentation

Dependency installation

Expo-compatible package versions

EAS builds

Build logs

EAS workflows

Development tooling

Visual verification

For Codex, the official setup is:

codex plugin add expo@openai-curated
codex mcp login expo

If the plugin is not used, the MCP server can be added manually:

codex mcp add expo --url https://mcp.expo.dev/mcp

30. Agent Device Testing

Consider using agent-device from Callstack.

It allows an AI coding agent to:

Inspect a running mobile app

Interact with the app

Find UI elements

Tap elements

Capture screenshots

Verify flows

Help debug UI behavior

Install:

npm install -g agent-device@latest

Then:

agent-device doctor

Optional skill:

npx skills add callstack/agent-device

This is especially useful once the UI becomes complex.

31. Figma / Design Workflow

Use Figma when designing the app before implementation.

Recommended workflow:

Idea
 ↓
Figma
 ↓
Design System
 ↓
Mobile Screens
 ↓
Codex
 ↓
React Native implementation
 ↓
Agent-device verification
 ↓
Figma/implementation refinement

Design the following screens first:

Home

Forecast

News

AI Assistant

Location Search

Settings

Weather Alert

Article Details

Create reusable Figma components for:

Weather cards

Forecast rows

Navigation

Buttons

Chips

Alert cards

AI messages

News cards

Loading states

Error states

32. Suggested Design System

Define these before implementing many screens:

Typography
Spacing
Border radius
Elevation/shadows
Icon sizes
Touch targets
Weather states
Dark/light themes
Semantic colors

Example semantic states:

weather.sunny
weather.cloudy
weather.rain
weather.storm
weather.warning
weather.info

Do not hardcode random colors throughout components.

33. Suggested Figma-to-Codex Workflow

When a Figma screen is ready:

Give Codex the screen/design context.

Tell Codex to inspect the existing design system.

Implement the screen using existing components.

Avoid creating duplicate components.

Run the app.

Use agent-device for visual verification.

Compare the result against the design.

Fix spacing, typography, layout and interaction.

Repeat.

The goal is not simply:

Figma → code

It is:

Figma
 ↓
Design system
 ↓
Reusable components
 ↓
Code
 ↓
Real-device verification

34. Recommended Agent Tooling Stack

For this specific project:

                    CODEx
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
     Expo Skills   Expo MCP   Figma workflow
          │           │           │
          └───────────┼───────────┘
                      ▼
              React Native + Expo
                      │
                      ▼
                 agent-device
                      │
                      ▼
             Real device testing
                      │
                      ▼
                  EAS Build
                      │
              ┌───────┴───────┐
              ▼               ▼
             APK             AAB

35. Suggested First Milestone

Do NOT implement AI, news, notifications and authentication immediately.

The first milestone should be:

Weather MVP

✓ Expo project
✓ TypeScript
✓ Expo Router
✓ Location permission
✓ Manual location search
✓ Open-Meteo
✓ Current weather
✓ Today's forecast
✓ 7-day forecast
✓ Loading states
✓ Error states
✓ Clean mobile UI
✓ Android testing

Only after this is stable:

→ AI
→ News
→ Notifications
→ Accounts
→ Production deployment

36. Definition of Done — MVP

The MVP is complete when:

App launches successfully on Android

User can grant location permission

User can manually search for a location

Current weather is displayed

Today's forecast is displayed

7-day forecast is displayed

Weather data refreshes correctly

Loading states work

Errors are handled

App works with poor/no network conditions gracefully

UI works on common Android screen sizes

No private API keys are bundled into the application

No major console/runtime errors remain

APK can be generated through EAS

37. Long-Term Roadmap

Future versions can add:

Multiple saved locations

Weather widgets

Lock-screen/live weather information

Home-screen widgets

Severe weather alerts

PAGASA integration

Weather radar/maps

Historical weather

AI personalized recommendations

AI travel planning

Weather-based activity recommendations

Voice weather assistant

Wearable support

Android widgets

Offline weather cache

Personalized notification schedules

38. Final Product Vision

WeatherAI should answer three questions immediately:

1. What is the weather?

Current conditions and measurements.

2. What will happen next?

Hourly and 7-day forecasts.

3. What does it mean for me?

AI interpretation, recommendations, alerts and weather news.

The application should feel like:

                 WEATHER DATA
                      │
             ┌────────┴────────┐
             ▼                 ▼
         FORECAST             NEWS
             │                 │
             └────────┬────────┘
                      ▼
                  AI ENGINE
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       SUMMARY      ADVICE      ALERTS
          │           │           │
          └───────────┼───────────┘
                      ▼
               USER EXPERIENCE

39. Build Principle

Build the smallest working version first.

Do not optimize for feature count.

Optimize for:

Correct weather data

Excellent mobile UX

Reliable architecture

Clear AI responses

Fast performance

Easy maintenance

Safe API architecture

Real-device testing

Simple deployment

The application should be designed so that new features can be added without rewriting the foundation.
