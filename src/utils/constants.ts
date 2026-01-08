// API Configuration
export const APALEO_API_URL = 'https://api.apaleo.com';
export const APALEO_AUTH_URL = 'https://identity.apaleo.com';
export const APALEO_CLIENT_ID = process.env.EXPO_PUBLIC_APALEO_CLIENT_ID || '';
export const APALEO_REDIRECT_URI = 'shm://auth/callback';

// SHM Backend API (for credits, subscriptions)
export const SHM_API_URL = process.env.EXPO_PUBLIC_SHM_API_URL || 'https://api.shm-hotel.com';

// Design System Colors
export const COLORS = {
  primary: '#1976D2',
  primaryLight: '#42A5F5',
  primaryDark: '#1565C0',

  secondary: '#FF9800',
  secondaryLight: '#FFB74D',
  secondaryDark: '#F57C00',

  success: '#388E3C',
  successLight: '#66BB6A',

  error: '#D32F2F',
  errorLight: '#EF5350',

  warning: '#FFA000',
  warningLight: '#FFB300',

  info: '#0288D1',
  infoLight: '#29B6F6',

  background: '#F5F5F5',
  surface: '#FFFFFF',

  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#9E9E9E',
    inverse: '#FFFFFF',
  },

  border: '#E0E0E0',
  divider: '#EEEEEE',

  // Status colors
  confirmed: '#388E3C',
  inHouse: '#1976D2',
  checkedOut: '#757575',
  canceled: '#D32F2F',
  noShow: '#FF9800',
} as const;

// Typography
export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Spacing & Layout
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Shadows
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// Credit System
export const CREDITS = {
  EUR_TO_CREDITS: 1, // 1 EUR = 1 credit
  MIN_PURCHASE: 10,
  MAX_PURCHASE: 10000,
} as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    monthlyCredits: 50,
    priceEur: 9.99,
    priceRub: 999,
    priceAmd: 3990,
    features: ['50 credits/month', 'Standard support', 'Basic booking features'],
    maxFamilyMembers: 0,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    monthlyCredits: 150,
    priceEur: 24.99,
    priceRub: 2499,
    priceAmd: 9990,
    features: ['150 credits/month', 'Priority support', 'Early check-in', 'Late check-out', 'Free cancellation'],
    maxFamilyMembers: 0,
  },
  family: {
    id: 'family',
    name: 'Family',
    monthlyCredits: 300,
    priceEur: 39.99,
    priceRub: 3999,
    priceAmd: 15990,
    features: ['300 credits/month', 'Up to 5 family members', 'Shared wallet', 'VIP support', 'All Premium features'],
    maxFamilyMembers: 5,
  },
} as const;

// Supported Languages
export const LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  ru: { name: 'Russian', nativeName: 'Русский' },
  hy: { name: 'Armenian', nativeName: 'Հայերdelays' },
} as const;

// Date Formats
export const DATE_FORMATS = {
  display: 'MMM DD, YYYY',
  displayShort: 'MMM DD',
  api: 'YYYY-MM-DD',
  time: 'HH:mm',
  dateTime: 'MMM DD, YYYY HH:mm',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKENS: 'shm_auth_tokens',
  USER: 'shm_user',
  LANGUAGE: 'shm_language',
  SEARCH_HISTORY: 'shm_search_history',
  ONBOARDING_COMPLETE: 'shm_onboarding_complete',
} as const;

// Amenity Icons (using common names)
export const AMENITY_ICONS: Record<string, string> = {
  wifi: 'wifi',
  parking: 'car',
  pool: 'water',
  gym: 'dumbbell',
  spa: 'sparkles',
  restaurant: 'utensils',
  bar: 'glass-martini',
  roomService: 'concierge-bell',
  airConditioning: 'snowflake',
  heating: 'fire',
  tv: 'tv',
  minibar: 'glass-whiskey',
  safe: 'shield-alt',
  balcony: 'door-open',
  oceanView: 'water',
  mountainView: 'mountain',
  pets: 'paw',
  familyFriendly: 'users',
  businessCenter: 'briefcase',
  laundry: 'tshirt',
} as const;
