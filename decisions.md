# Decision Log

## Current State Summary (Updated: 2026-08-31)
- Active task: App-wide UX readiness
- Status: Done in code
- Next action: Complete native Android interaction QA
- Blockers: No Android runtime is available locally
- Last completed: Codebase cleanup decision on 2026-08-31

---

## 2026-08-31 — Asset and Dependency Retention

**Decision:** Retain only assets with an active static import or Android configuration reference. Remove superseded visual variants and starter-template code, but preserve Expo runtime dependencies that SDK validation still expects. Import Poppins weights directly so unused font variants are excluded from the Android bundle.

## 2026-08-31 — Kai Outside Home

**Decision:** Use a compact contextual shortcut for Kai on task-focused screens. Keep the larger expressive launcher exclusive to Home; Forecast and Location receive one shared, tappable row that opens Ask Kai and uses a mood relevant to the screen.

## 2026-08-31 — Kai Expression Motion

**Decision:** Use a restrained 260 ms opacity-and-scale transition for portrait changes: a faster 90 ms exit followed by a 170 ms arrival. Avoid bounce, rotation, or sliding, and switch immediately when reduced motion is enabled.

## 2026-08-31 — Kai Portrait Edge Treatment

**Decision:** End Kai’s bust with a clean curved silhouette and normal edge anti-aliasing. Do not use a painted white fade, background halo, or extended torso to disguise the crop.

## 2026-08-31 — WeatherAI-native 3D Portrait Treatment

**Decision:** Keep the five semantic expressions but render every active launcher portrait in the same soft 3D material, cyan/magenta rim lighting, square bust framing, transparent background, and jersey identity as WeatherAI’s illustration system.

## 2026-08-31 — Five-state Kai Portrait System

**Decision:** Use the user-approved 2D upper-body expression language for the Home launcher: neutral while idle, thinking during generation, happy for chat and clear-weather thoughts, focused for routine advice, and alert for rain or storms. This fully replaces the former small full-body launcher in active code.

## 2026-08-31 — Kai Expression States

**Decision:** Treat Kai's expression as part of the weather-thought state: use an attentive concerned expression for rain or storms, a warm speaking expression for other conditions, and return to the neutral asset when the thought fades. Chat invitations retain neutral Kai so weather interpretation and navigation prompts remain visually distinct.

## 2026-08-31 — Kai v2 Visual System

**Decision:** Preserve Kai’s core identity—warm Filipino appearance, black hair with cyan forelock, red original basketball-inspired jersey, number 24, and weather pouch—while replacing sharp 2D anime rendering with the app’s soft rounded 3D material, purple-pink rim lighting, and weather-semantic accents. Every weather state uses the same underlying character model.

---

## 2026-08-31 — Native Press-Feedback Implementation

**Decision:** Implement reusable 0.97 press feedback with React Native `Animated` and the native driver so it remains compiler-compatible and does not delay navigation. Retain explicit refresh controls when pull-to-refresh is added later for accessibility and discoverability.

---

## 2026-08-30 — Stable-Interface Motion Decision

**Decision:** Keep routine weather screens visually stable and immediate. Use motion only to preserve tab continuity, acknowledge new Kai messages, and give the primary weather illustration subtle ambient life. Forecast lists and static content do not animate. System reduced-motion removes ambient movement and minimizes transitions.

---

## 2026-08-30 — Calm Motion-System Decision

**Decision:** Replace the quick pop system with 380 ms in-flow section reveals using 40–400 ms route-specific staging, minimal 10 px travel, and 0.99–1 scale. Dynamic Kai messages use a 320 ms reveal, while tab feedback uses a softer 190–280 ms response. All motion respects the system reduced-motion preference.

---

## 2026-08-30 — In-flow Stagger Decision

**Decision:** Animate a maximum of four meaningful component groups per route with delays capped at 145 ms. Use shared-value styles on containers that remain in document flow; reserve entering/exiting layout animation for self-contained dynamic chat messages.

---

## 2026-08-30 — Screen Motion Architecture

**Decision:** Disable navigator scene animation and animate each route inside a permanent dark shell. This preserves layout, eliminates white flashes, replays on tab focus, and keeps reduced-motion behavior centralized.

---

## 2026-08-30 — Structural Motion Boundary

**Decision:** Never apply entering/exiting layout wrappers around structural page sections. Animate the navigator scene and self-contained dynamic items so motion cannot alter document flow.

---

## 2026-08-30 — Unified Pop Motion Decision

**Decision:** Use one non-bouncing pop language across the app: 200 ms scale `0.96 → 1` plus fade for entry, and 130 ms scale `1 → 0.98` plus fade for exit. Remove ambient loops, directional movement, and staggered arrivals.

---

## 2026-08-30 — Motion System Decisions

**Decision:** Use motion for navigation continuity, weather hierarchy, search-result arrival, and chat speaker direction only. Keep routine transitions below 500 ms, avoid bounce and loops, and use the operating system's reduced-motion preference.

---

## 2026-08-30 — UX Readiness Decisions

**Decision:** Keep one clear location-search entry point on Home; duplicate icons with the same destination add ambiguity without capability.

**Decision:** Present the hourly section as “Today’s outlook” with an explicit full-forecast action instead of a tab pattern where only one tab is interactive.

**Decision:** Hide settings that have no observable effect. The reduce-motion preference can return when the app ships meaningful motion to control.

**Decision:** Kai must identify AI interpretation versus offline fallback and always offer a recovery action after a connection failure.

---

## 2026-08-30 — Ollama Cloud Decisions

**Decision:** Use Ollama Cloud with `gpt-oss:20b` by default behind a WeatherAI-owned Node endpoint.

**Decision:** Never expose `OLLAMA_API_KEY` to Expo or the Android bundle. The mobile app receives only the public backend origin.

**Decision:** The backend independently fetches Open-Meteo data and supplies it to Kai. Deterministic weather logic remains the offline/provider-failure fallback, while safety-critical advice directs users to PAGASA and local authorities.

---

## 2026-08-30 — Phase 0 Foundation Decisions

**Decision:** Use the official Expo SDK 57 default template with Expo Router and strict TypeScript.

**Rationale:** The official template provides versions aligned with React Native 0.86 and the current Expo toolchain, reducing compatibility risk.

**Decision:** Keep WeatherAI Android-only.

**Rationale:** The product plan explicitly excludes iOS deployment and testing. iOS configuration and launch scripts were removed.

**Decision:** Do not run automatic forced audit fixes.

**Rationale:** Forced dependency changes could break Expo-managed compatibility. Expo's compatibility check is the authority for SDK package versions.

**Decision:** Defer NativeWind and the final visual system until the first application-shell task.

**Rationale:** Styling dependencies should be chosen alongside the actual interface rather than added speculatively during scaffolding.

---

## 2026-08-30 — Product and Design Workflow

**Decision:** Kai is a prominent Home-screen guide while factual weather data remains primary.

**Decision:** Use a comp-first workflow for new WeatherAI screens.

**Decision:** Use Polished Weather Standard as the binding visual direction. The user intentionally chose the familiar category-standard approach.

---

## 2026-08-30 — Home Implementation Decisions

**Decision:** Build directly from the selected comp without generating two additional composition variants, following the user's explicit instruction.

**Decision:** Keep all forecast values as clearly labeled sample data until the Open-Meteo service is implemented.

**Decision:** Keep weather text, icons, controls, lists, and navigation native; use a generated raster only for Kai.

**Decision:** Add `expo-linear-gradient` through Expo's compatible installer for the approved atmospheric hero.

---

## 2026-08-30 — Live Weather Architecture

**Decision:** Keep the dependency flow `screen → useWeather hook → WeatherAI services → Open-Meteo / Expo Location`.

**Decision:** Normalize every Open-Meteo response through `open-meteo-adapter.ts`; provider response shapes never enter UI components.

**Decision:** Request foreground location only. When permission is denied, show live Santa Cruz weather with an explicit explanation instead of blocking the app.

**Decision:** Cache the latest normalized snapshot for 30 minutes and use it as clearly labeled saved data when refresh fails.

**Decision:** Keep Kai's initial live-data note deterministic and factual (highest upcoming rain probability) until the protected backend AI phase exists.

---

## 2026-08-30 — Manual Location Decisions

**Decision:** Use Open-Meteo's public geocoding endpoint for manual search and persist only the normalized selected location.

**Decision:** Debounce location queries by 450 ms and cancel obsolete requests to reduce network traffic and prevent stale results.

**Decision:** Re-run the weather hook when Home regains focus and compare cached coordinates before reusing a fresh snapshot.

**Decision:** Keep device location as an explicit foreground-only action alongside manual search.

---

## 2026-08-31 — UX Trust and Accessibility Decisions

**Decision:** Never substitute bundled mock forecasts when provider or cached data is unavailable. Show an explicit loading or unavailable state instead.

**Decision:** Keep Kai's Home advice in the document flow so personality content cannot cover or intercept factual forecast content.

**Decision:** Treat Kai as the raised center tab consistently: label its selected state in the dock and remove modal-style back navigation from the Kai screen.

**Decision:** Prefer accurate Material Symbols over repurposed 3D artwork until matching approved condition assets exist.
