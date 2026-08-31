import type { ImageSource } from 'expo-image';

export type KaiPortraitMood = 'neutral' | 'happy' | 'focused' | 'alert' | 'thinking';

const kaiPortraitAssets: Record<KaiPortraitMood, ImageSource> = {
  neutral: require('@/assets/characters/kai-portrait-neutral-v3.png'),
  happy: require('@/assets/characters/kai-portrait-happy-v3.png'),
  focused: require('@/assets/characters/kai-portrait-focused-v4.png'),
  alert: require('@/assets/characters/kai-portrait-alert-v3.png'),
  thinking: require('@/assets/characters/kai-portrait-thinking-v3.png'),
};

export function getKaiPortrait(mood: KaiPortraitMood): ImageSource {
  return kaiPortraitAssets[mood];
}

export function getKaiThoughtMood(condition: string): KaiPortraitMood {
  const normalized = condition.toLowerCase();
  if (normalized.includes('thunder') || normalized.includes('storm') || normalized.includes('rain') || normalized.includes('shower')) return 'alert';
  if (normalized.includes('clear') || normalized.includes('sun')) return 'happy';
  return 'focused';
}

/** Compatibility helper for older development bundles during Fast Refresh. */
export function getKaiForWeather(condition: string): ImageSource {
  return getKaiPortrait(getKaiThoughtMood(condition));
}
