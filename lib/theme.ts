// Centralised design tokens — mirrors the original globals.css CSS variables

export const colors = {
  gold: '#F5A623',
  sky: '#4AADE8',
  success: '#58CC02',
  warning: '#FF9600',
  danger: '#FF4B4B',
  navy: '#1A1A2E',
  cream: '#FDF8F0',
} as const;

export const chapterColors = {
  city: '#8B5CF6',
  park: '#10B981',
  farm: '#F59E0B',
  forest: '#3B82F6',
  jungle: '#22C55E',
} as const;

export const fonts = {
  display: 'Fredoka_400Regular',
  body: 'Nunito_700Bold',
  bodyBold: 'Nunito_800ExtraBold',
  bodyRegular: 'Nunito_400Regular',
} as const;

export const gradients = {
  sky: [colors.sky, colors.gold] as const,
  night: ['#0F0C29', '#302B63', '#24243E'] as const,
  city: ['#8B5CF6', '#4C1D95'] as const,
  park: ['#10B981', '#065F46'] as const,
  farm: ['#F59E0B', '#B45309'] as const,
  forest: ['#3B82F6', '#1E3A5F'] as const,
  jungle: ['#22C55E', '#14532D'] as const,
} as const;

export const shadows = {
  game: {
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  card: {
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  glowGold: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
} as const;
