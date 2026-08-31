---
name: WeatherAI
description: A vivid, friendly weather companion built for fast Android weather checks.
colors:
  night-canvas: "#090F18"
  atmospheric-plum: "#26142F"
  raised-navy: "#1B2637"
  dock-purple: "#5C42A8"
  electric-violet: "#A421E8"
  weather-pink: "#FF217B"
  sunrise-orange: "#FF8A3D"
  rain-cyan: "#77D8FF"
  sunlight: "#FFD85B"
  cloud-white: "#FFFFFF"
  mist-text: "#AAB2C1"
typography:
  display:
    fontFamily: "Poppins"
    fontSize: "76sp"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Poppins"
    fontSize: "28sp"
    fontWeight: 800
    lineHeight: 1.2
  title:
    fontFamily: "Poppins"
    fontSize: "18sp"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Poppins"
    fontSize: "16sp"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Poppins"
    fontSize: "12sp"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  control: "22dp"
  card: "24dp"
  hero: "30dp"
  dock: "30dp"
  round: "999dp"
spacing:
  xs: "4dp"
  sm: "8dp"
  md: "12dp"
  lg: "16dp"
  xl: "24dp"
  section: "32dp"
components:
  weather-hero:
    backgroundColor: "{colors.weather-pink}"
    textColor: "{colors.cloud-white}"
    rounded: "{rounded.hero}"
    padding: "24dp"
  forecast-card:
    backgroundColor: "{colors.raised-navy}"
    textColor: "{colors.cloud-white}"
    rounded: "{rounded.card}"
    padding: "16dp"
  floating-dock:
    backgroundColor: "{colors.dock-purple}"
    textColor: "{colors.cloud-white}"
    rounded: "{rounded.dock}"
    height: "68dp"
---

# Design System: WeatherAI

## Overview

**Creative North Star: “Neon Weather Companion”**

WeatherAI combines the immediacy of a night-time weather dashboard with the warmth of a playful companion. The system is dark-first, vivid, dimensional, and optimistic: trustworthy weather facts remain fast to scan while saturated gradients, soft 3D weather art, and Kai add personality.

The interface should feel energetic without becoming noisy. Large numerical weather data leads; illustration supports it; Kai interprets it only in dedicated advice surfaces. Android interaction conventions, accessibility, and safe-area behavior remain structural requirements.

**Key Characteristics:** dark atmospheric canvas, purple-pink-orange energy, soft 3D weather art, Poppins typography, floating purple navigation, generous rounded surfaces, and concise factual copy.

## Colors

The palette is built from a near-black navy foundation with one vivid warm gradient and cool weather-semantic accents.

- **Night Canvas** (`#090F18`): primary page background.
- **Atmospheric Plum** (`#26142F`): subtle upper-page atmosphere; never a full text surface.
- **Raised Navy** (`#1B2637`): cards, inputs, and elevated containers.
- **Dock Purple** (`#5C42A8`): navigation and secondary brand surfaces.
- **Electric Violet → Weather Pink → Sunrise Orange** (`#A421E8 → #FF217B → #FF8A3D`): signature current-weather gradient and rare emphasis.
- **Cloud White** (`#FFFFFF`): primary text and selected icons.
- **Mist Text** (`#AAB2C1`): secondary text; do not reduce opacity further.
- **Rain Cyan** (`#77D8FF`) and **Sunlight** (`#FFD85B`): semantic weather accents.

**The Gradient Rationing Rule.** Use the signature warm gradient once per screen for the most important weather or action surface. Supporting cards use tonal navy or purple gradients.

## Typography

**Display and Body Font:** Poppins, loaded through `@expo-google-fonts/poppins`.

Poppins supplies the friendly geometry of the interface without making weather measurements feel childish. Use tabular numerals for temperatures and measurements.

- **Display:** 76–96sp, Bold, tight tracking; current temperature only.
- **Headline:** 28–38sp, ExtraBold; location and page titles.
- **Title:** 17–20sp, Bold; condition, section, and card titles.
- **Body:** 14–16sp, Regular; explanations and Kai advice.
- **Label:** 10–13sp, SemiBold; time, precipitation, metadata, and navigation.

**The Weight Ceiling Rule.** Reserve ExtraBold/Black for short titles and tiny uppercase labels. Body copy never exceeds SemiBold.

## Layout

Use a 4dp base rhythm with 16–18dp compact-phone gutters, 24dp card padding, and at least 24–32dp between major sections. Primary screens scroll vertically; forecast strips scroll horizontally with the next card visibly peeking in. Cap readable content at 720dp on larger devices and increase gutters rather than stretching cards indefinitely.

All interactive controls are at least 48×48dp. Fixed navigation respects bottom insets, and scroll views reserve at least 112dp below content so the floating dock never obscures information.

## Elevation & Depth

Depth is a hybrid of tonal layering and soft downward shadows. Large brand surfaces may carry a colored ambient shadow, while ordinary cards rely on a lighter surface tone and a subtle 1dp translucent outline. Do not combine a strong border and a strong shadow on the same component.

- **Card lift:** Android elevation 4; subtle tonal separation.
- **Selected forecast:** elevation 9 with restrained violet ambient shadow.
- **Floating dock:** elevation 16; deep navy-purple shadow.
- **Center action:** elevation 20; soft pink ambient shadow.

## Shapes

Controls use 22dp radii, forecast and advice cards use 24dp, hero surfaces use 30dp, and the floating dock uses 30dp. Full pills are reserved for search, compact chips, and round icon actions. Organic weather visuals come from approved raster assets, never improvised geometric substitutes.

## Components

### Search Field

Near-black filled pill, 52dp high, 18dp horizontal padding, muted leading search icon, and Poppins Regular placeholder text. It expands to available header width; Kai does not appear inside the header.

### Current Weather Hero

The sole warm signature gradient on Home. Location and date establish context; current temperature is the dominant text; the matching soft 3D weather asset supports the reading. Refresh is a 48dp translucent round control.

### Forecast Cards

Landscape 204×142dp cards with 24dp corners. Weather art occupies the left, temperature/time the right, and state plus precipitation sit along the bottom. The current card uses a violet tonal gradient, visible status dot, and elevated outline.

### Kai Advice

Kai appears as a large half-body weather-responsive character beside one concise interpretation. Never use a tiny Kai avatar in headers or navigation. Weather facts and official warnings remain visually separate from Kai’s advice.

### Floating Navigation

Purple gradient dock with four equal destination slots and a raised pink center action for adding/changing location. Every destination includes an icon and short label. The dock respects the Android bottom safe area.

### Weather Icons

Use the approved soft 3D family for conditions. Maintain consistent camera angle, lighting, and scale. Platform vector symbols are reserved for interface actions and temporary conditions without an approved raster asset.

## Do's and Don'ts

### Do:

- **Do** put current conditions and important forecast changes before personality content.
- **Do** use semantic tokens from `src/constants/theme.ts` instead of introducing new hex values.
- **Do** keep Poppins, 3D weather art, and interface icons consistent across every route.
- **Do** provide loading, error, permission-denied, offline, and stale-data states in the same visual system.
- **Do** keep Kai large enough for expression and change his appearance with the weather.

### Don't:

- **Don't** add a second competing warm gradient on the same screen.
- **Don't** return to the older white-and-light-blue card system.
- **Don't** use tiny full-body Kai figures, emoji weather icons, or mixed icon families.
- **Don't** communicate severe weather only through color or let Kai’s advice resemble an official warning.
- **Don't** reduce normal text below accessible contrast or controls below 48dp.
