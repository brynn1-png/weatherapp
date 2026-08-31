# WeatherAI — AI Assistant Working Rules

These rules apply to every coding agent working on WeatherAI. `plan.md` is the product and scope source of truth. If these rules and the plan conflict, stop and ask the user which document should be updated.

## 1. Project Scope

- Build an Android-only weather application with React Native, Expo, and TypeScript.
- Do not add iOS deployment, TestFlight, App Store, or iOS-specific requirements.
- Complete the Weather MVP before adding AI, news, notifications, accounts, or other later-phase features.
- Prefer the smallest working implementation that leaves a clean foundation for future phases.
- Do not expand the task beyond what the user requested.

## 2. Start With Current Context

Before modifying the project:

1. Read `plan.md` and this file.
2. Check for an `AGENTS.md` file and follow any applicable instructions.
3. Inspect the existing files, configuration, dependencies, and relevant code.
4. Search for the actual implementation or pattern before assuming how it works.
5. Check `progress.md`, `decisions.md`, and `results.md` if they exist and are relevant.

For large log files, read the Current State Summary and the latest five entries. Always read unresolved blocked or partial entries. Do not create log files merely to answer a question or make a trivial documentation correction.

## 3. Plan in Proportion to the Task

For meaningful implementation work, briefly state:

- the problem being solved;
- the proposed solution;
- the files or systems likely to change;
- important risks or tradeoffs; and
- how the result will be verified.

Proceed without waiting for approval when the task is clear, safe, reversible, and within the requested scope. Ask for approval before:

- destructive or difficult-to-reverse actions;
- major architecture changes;
- adding a paid service or a dependency with significant maintenance impact;
- changing product scope or behavior beyond the request;
- publishing, deploying, or modifying external services; or
- choosing between materially different outcomes that the user must decide.

## 4. Architecture Rules

Use this dependency flow:

```text
Screen or component
        ↓
Hook or state layer
        ↓
Service
        ↓
API or device capability
```

- Keep network requests and provider response shapes out of UI components.
- Define normalized application-level TypeScript models.
- Map Open-Meteo responses through an adapter before data reaches the UI.
- Keep provider-specific code isolated so a provider can be replaced later.
- Keep components focused, reusable where useful, and easy to test.
- Avoid premature abstractions and duplicate components.
- Prefer Expo-compatible packages and current stable Expo APIs.
- Avoid unnecessary dependencies and large UI libraries.

## 5. Weather Data and AI Safety

- Open-Meteo or another approved weather provider is the factual source for weather data.
- Never invent, interpolate, or silently alter weather conditions.
- Clearly distinguish measured or forecast facts from interpretation and general advice.
- AI features must receive structured weather data through a backend endpoint.
- Never place OpenAI keys or other private secrets in the mobile application, repository, logs, screenshots, or responses.
- For safety-critical weather, travel, flooding, storms, or similar conditions, direct users to official authorities such as PAGASA.
- AI summaries and recommendations must not be presented as official warnings.

## 6. Android and Expo Rules

- Optimize and test for common Android screen sizes and interaction patterns.
- Use Expo Router for navigation.
- Use Expo-supported libraries for location, notifications, builds, and device capabilities.
- Use EAS Build for APK and AAB generation when deployment work is requested.
- Do not make Google Play publication a requirement for the MVP.
- Request only the device permissions required by the current feature and handle denial gracefully.
- Verify behavior on a real Android device or suitable emulator when practical.

## 7. UI, Accessibility, and Performance

- Keep the interface mobile-first, readable, fast, and weather-aware.
- Prioritize current conditions, today's important changes, and forecasts over secondary details.
- Avoid overloading the home screen with cards.
- Use design tokens for color, typography, spacing, radius, and semantic weather states.
- Support readable text, sufficient contrast, screen readers, reduced motion, meaningful labels, and adequate touch targets.
- Never communicate warnings through color alone.
- Respect safe areas and keyboard behavior.
- Cache weather data, debounce location search, and avoid unnecessary requests and re-renders.
- Use efficient lists for long content and keep animations subtle and inexpensive.

## 8. Loading, Error, and Offline States

Every data-driven feature must account for:

- initial loading;
- refresh loading;
- empty or invalid results;
- no internet;
- permission denial;
- provider or server failure;
- rate limiting where applicable; and
- stale cached data.

Never leave a blank screen. When possible, show the last known data, clearly label it as stale, and provide a retry action.

## 9. Change Discipline

- Preserve existing user changes and unrelated work.
- Do not overwrite, delete, reset, or reformat unrelated files.
- Make the smallest coherent change that fulfills the task.
- Match existing project conventions unless they conflict with these rules or the plan.
- Explain any important architectural decision or deviation.
- Flag discovered risks promptly, but continue safe in-scope work when the risk does not block progress.
- Update documentation when setup, behavior, architecture, or developer workflow changes.

## 10. Verification

After changing files:

1. Re-read the changed sections to confirm the intended content is present.
2. Run the narrowest relevant checks first.
3. Run available TypeScript, lint, and test commands for code changes.
4. Start or export the Expo app when relevant to catch configuration and bundling errors.
5. Verify affected UI flows and Android layouts when practical.
6. Report exactly what was verified and disclose anything that could not be tested.

Never claim a check passed unless it was actually run successfully. Documentation-only changes normally require content and consistency checks, not application builds.

## 11. Dependencies and Documentation

- Inspect `package.json` before adding a package.
- Prefer built-in React Native or Expo capabilities when they meet the requirement.
- Confirm compatibility with the project's Expo SDK before installation.
- Use official Expo, React Native, Open-Meteo, Supabase, and OpenAI documentation for implementation-critical guidance.
- Do not introduce Supabase until a feature actually requires persistence, accounts, preferences, or protected backend behavior.
- Record required environment variables in an example environment file without real secrets.

## 12. Project Logs

Use project logs for substantial implementation sessions, architecture decisions, completed milestones, unresolved blockers, and meaningful test results. Do not update all logs for trivial questions, typo fixes, or small documentation edits.

Write to `progress.md`, `decisions.md`, and `results.md` only at the end of the work session, after all requested tasks, implementation, and verification are finished. Do not create or update these files during a task or between tasks in the same session. Collect the relevant information while working, then make one final logging update before the completion report.

If the session ends because work is blocked or incomplete, update the logs at that point with the current status, completed work, blocker, and next action.

If logging is warranted and the files do not exist, create:

- `progress.md` — current work, status, blockers, and next action;
- `decisions.md` — durable decisions, rationale, and rejected alternatives; and
- `results.md` — implemented outcomes and verification evidence.

Keep a concise Current State Summary at the top of each log. Append dated entries rather than rewriting history. Never store secrets, raw credentials, or sensitive user data in logs.

Suggested summary format:

```markdown
## Current State Summary (Updated: YYYY-MM-DD)
- Active task: [task or none]
- Status: [in progress, done, or blocked]
- Next action: [next concrete step]
- Blockers: [none or description]
- Last completed: [task and date]
```

## 13. Completion Report

At the end of a task, report:

- what changed;
- the important files involved;
- checks performed and their outcomes;
- known limitations or remaining risks; and
- the next logical step, when useful.

Do not describe planned work as completed. A task is done only when the requested outcome is implemented and verified in proportion to its risk.
