/** WeatherAI brand primitives. New UI should consume these semantic roles. */
export const BrandColors = {
  canvas: '#090F18',
  canvasAtmosphere: '#26142F',
  surface: '#111925',
  surfaceRaised: '#1B2637',
  surfaceDeep: '#080B13',
  dockPurple: '#5C42A8',
  dockPurpleDeep: '#3A286F',
  violet: '#A421E8',
  pink: '#FF217B',
  pinkSoft: '#FF78C8',
  orange: '#FF8A3D',
  text: '#FFFFFF',
  textMuted: '#AAB2C1',
  textSubtle: '#817B87',
  iconMuted: '#B6A6D8',
  rain: '#77D8FF',
  sun: '#FFD85B',
  divider: '#FFFFFF19',
  outline: '#FFFFFF20',
  pressed: '#FFFFFF18',
} as const;

export const BrandGradients = {
  page: ['#26142F', '#090F18', '#07141D'] as const,
  weatherHero: ['#A421E8', '#FF217B', '#FF8A3D'] as const,
  dock: ['#5C42A8', '#3A286F'] as const,
  action: ['#FF78C8', '#F13B94'] as const,
  cardActive: ['#6D4EA0', '#26334C'] as const,
  card: ['#34425B', '#151F2D'] as const,
} as const;

export const BrandTypography = {
  regular: 'Poppins_400Regular',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  extrabold: 'Poppins_800ExtraBold',
  black: 'Poppins_900Black',
} as const;

export const BrandRadius = { control: 22, card: 24, hero: 30, dock: 30, round: 999 } as const;

export const Spacing = { half: 2, one: 4, two: 8, three: 12, four: 16, five: 24, six: 32, seven: 48 } as const;
