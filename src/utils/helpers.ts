import { MonetaryValue } from '../types';
import { CREDITS } from './constants';

/**
 * Format a monetary value for display
 */
export function formatMoney(value: MonetaryValue): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: value.currency,
    minimumFractionDigits: 2,
  }).format(value.amount);
}

/**
 * Convert EUR amount to credits
 */
export function eurToCredits(amount: number): number {
  return Math.round(amount * CREDITS.EUR_TO_CREDITS);
}

/**
 * Convert credits to EUR amount
 */
export function creditsToEur(credits: number): number {
  return credits / CREDITS.EUR_TO_CREDITS;
}

/**
 * Format credits for display
 */
export function formatCredits(credits: number): string {
  return `${credits.toLocaleString()} credits`;
}

/**
 * Format a date string for display
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

/**
 * Format a date range (arrival - departure)
 */
export function formatDateRange(arrival: string, departure: string): string {
  const arrDate = new Date(arrival);
  const depDate = new Date(departure);

  const arrMonth = arrDate.toLocaleDateString('en-US', { month: 'short' });
  const depMonth = depDate.toLocaleDateString('en-US', { month: 'short' });

  if (arrMonth === depMonth) {
    return `${arrMonth} ${arrDate.getDate()} - ${depDate.getDate()}, ${depDate.getFullYear()}`;
  }

  return `${arrMonth} ${arrDate.getDate()} - ${depMonth} ${depDate.getDate()}, ${depDate.getFullYear()}`;
}

/**
 * Calculate the number of nights between two dates
 */
export function calculateNights(arrival: string, departure: string): number {
  const arrDate = new Date(arrival);
  const depDate = new Date(departure);
  const diffTime = depDate.getTime() - arrDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format guest count (adults + children)
 */
export function formatGuestCount(adults: number, childrenAges?: number[]): string {
  const childrenCount = childrenAges?.length ?? 0;
  const parts: string[] = [];

  parts.push(`${adults} adult${adults !== 1 ? 's' : ''}`);

  if (childrenCount > 0) {
    parts.push(`${childrenCount} child${childrenCount !== 1 ? 'ren' : ''}`);
  }

  return parts.join(', ');
}

/**
 * Get localized text from Apaleo's multi-language object
 */
export function getLocalizedText(
  texts: Record<string, string> | undefined,
  preferredLanguage = 'en'
): string {
  if (!texts) return '';

  // Try preferred language first
  if (texts[preferredLanguage]) {
    return texts[preferredLanguage];
  }

  // Fallback to English
  if (texts['en']) {
    return texts['en'];
  }

  // Return first available language
  const firstKey = Object.keys(texts)[0];
  return firstKey ? texts[firstKey] : '';
}

/**
 * Generate a random booking reference
 */
export function generateBookingReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'SHM';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string): string {
  // Remove all non-digits except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned;
}

/**
 * Get reservation status display info
 */
export function getStatusDisplay(status: string): { label: string; color: string } {
  const statusMap: Record<string, { label: string; color: string }> = {
    Confirmed: { label: 'Confirmed', color: '#388E3C' },
    InHouse: { label: 'In House', color: '#1976D2' },
    CheckedOut: { label: 'Checked Out', color: '#757575' },
    Canceled: { label: 'Canceled', color: '#D32F2F' },
    NoShow: { label: 'No Show', color: '#FF9800' },
  };

  return statusMap[status] ?? { label: status, color: '#757575' };
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Check if a date is in the past
 */
export function isPastDate(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Check if a date is today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Get tomorrow's date as ISO string
 */
export function getTomorrow(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

/**
 * Get a date N days from now as ISO string
 */
export function getDateFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}
