// ============================================
// Authentication Types
// ============================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  preferredLanguage: 'en' | 'ru' | 'hy';
  createdAt: string;
}

// ============================================
// Apaleo Types
// ============================================

export interface ApaleoProperty {
  id: string;
  code: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  companyName: string;
  location: PropertyLocation;
  currencyCode: string;
  timeZone: string;
  status: 'Test' | 'Live';
  rating?: number;
  images?: PropertyImage[];
  amenities?: string[];
}

export interface PropertyLocation {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  countryCode: string;
  regionCode?: string;
}

export interface PropertyImage {
  url: string;
  isMainImage: boolean;
}

export interface ApaleoOffer {
  arrival: string;
  departure: string;
  unitGroup: UnitGroup;
  minGuaranteeType: string;
  availableUnits: number;
  totalGrossAmount: MonetaryValue;
  cancellationFee: CancellationFee;
  noShowFee: Fee;
  timeSlices: TimeSlice[];
  services?: ServiceOffer[];
  fees?: Fee[];
  taxDetails?: TaxDetail[];
  validationMessages?: ValidationMessage[];
  companyId?: string;
  corporateCode?: string;
  isCorporate: boolean;
  prePaymentAmount?: MonetaryValue;
  cityTax?: MonetaryValue;
}

export interface UnitGroup {
  id: string;
  code: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  maxPersons: number;
  type: 'Room' | 'BedRoom' | 'MeetingRoom' | 'EventSpace' | 'ParkingLot';
  images?: PropertyImage[];
  amenities?: string[];
}

export interface MonetaryValue {
  amount: number;
  currency: string;
}

export interface CancellationFee {
  code: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  dueDateTime?: string;
  fee?: Fee;
}

export interface Fee {
  code: string;
  name: Record<string, string>;
  amount: MonetaryValue;
}

export interface TimeSlice {
  from: string;
  to: string;
  ratePlan: RatePlan;
  baseAmount: MonetaryValue;
  totalGrossAmount: MonetaryValue;
  includedServices?: IncludedService[];
}

export interface RatePlan {
  id: string;
  code: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  isSubjectToCityTax: boolean;
}

export interface IncludedService {
  code: string;
  name: Record<string, string>;
  pricingMode: 'Included' | 'Additional';
  amount: MonetaryValue;
}

export interface ServiceOffer {
  service: {
    id: string;
    code: string;
    name: Record<string, string>;
    description?: Record<string, string>;
  };
  count: number;
  totalAmount: MonetaryValue;
  prePaymentAmount: MonetaryValue;
  dates?: string[];
}

export interface TaxDetail {
  vatType: string;
  vatPercent: number;
  net: MonetaryValue;
  tax: MonetaryValue;
}

export interface ValidationMessage {
  category: 'OfferNotAvailable' | 'AutoUnitAssignment';
  code: string;
  message: string;
}

// ============================================
// Booking Types
// ============================================

export interface ApaleoBooking {
  id: string;
  bookingId: string;
  propertyId: string;
  ratePlan: RatePlan;
  unitGroup: UnitGroup;
  unit?: {
    id: string;
    name: string;
    description?: Record<string, string>;
  };
  arrival: string;
  departure: string;
  status: ReservationStatus;
  checkInTime?: string;
  checkOutTime?: string;
  cancellationTime?: string;
  noShowTime?: string;
  adults: number;
  childrenAges?: number[];
  totalGrossAmount: MonetaryValue;
  balance: MonetaryValue;
  guestComment?: string;
  primaryGuest?: Guest;
  additionalGuests?: Guest[];
  booker?: Booker;
  paymentAccount?: PaymentAccount;
  actions?: ReservationAction[];
  company?: {
    id: string;
    code?: string;
    name?: string;
  };
  corporateCode?: string;
  created: string;
  modified: string;
}

export type ReservationStatus =
  | 'Confirmed'
  | 'InHouse'
  | 'CheckedOut'
  | 'Canceled'
  | 'NoShow';

export interface Guest {
  title?: string;
  firstName: string;
  middleInitial?: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: GuestAddress;
  nationalityCountryCode?: string;
  identificationNumber?: string;
  identificationType?: string;
  birthDate?: string;
  birthPlace?: string;
}

export interface GuestAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  countryCode?: string;
  regionCode?: string;
}

export interface Booker {
  title?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: GuestAddress;
  comment?: string;
}

export interface PaymentAccount {
  accountNumber: string;
  accountHolder: string;
  expiryMonth: string;
  expiryYear: string;
  paymentMethod: string;
  payerEmail?: string;
  payerReference?: string;
  isVirtual: boolean;
  inactiveReason?: string;
}

export interface ReservationAction {
  action: 'CheckIn' | 'CheckOut' | 'Cancel' | 'NoShow' | 'AmendTimeSlices' | 'AmendArrival' | 'AmendDeparture';
  isAllowed: boolean;
  reasons?: ActionNotAllowedReason[];
}

export interface ActionNotAllowedReason {
  code: string;
  message: string;
}

export interface CreateBookingRequest {
  propertyId: string;
  arrival: string;
  departure: string;
  adults: number;
  childrenAges?: number[];
  comment?: string;
  guestComment?: string;
  channelCode?: string;
  primaryGuest?: Guest;
  booker?: Booker;
  paymentAccount?: {
    accountNumber: string;
    accountHolder: string;
    expiryMonth: string;
    expiryYear: string;
    paymentMethod: string;
    payerEmail?: string;
  };
  timeSlices: {
    ratePlanId: string;
    totalAmount?: MonetaryValue;
  }[];
  services?: {
    serviceId: string;
    count?: number;
    amount?: MonetaryValue;
    dates?: string[];
  }[];
  guaranteeType?: string;
}

// ============================================
// Search Types
// ============================================

export interface SearchParams {
  propertyId?: string;
  arrival: string;
  departure: string;
  adults: number;
  childrenAges?: number[];
  channelCode?: string;
  promoCode?: string;
}

export interface SearchFilters {
  priceMin?: number;
  priceMax?: number;
  roomTypes?: string[];
  amenities?: string[];
  rating?: number;
}

// ============================================
// Credits & Subscription Types
// ============================================

export interface CreditBalance {
  userId: string;
  balance: number;
  pendingCredits: number;
  lastUpdated: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'spend' | 'refund' | 'transfer' | 'bonus';
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  referenceType?: 'booking' | 'subscription' | 'transfer';
  createdAt: string;
}

export interface CreditPackage {
  id: string;
  name: Record<string, string>;
  credits: number;
  priceEur: number;
  priceRub: number;
  priceAmd: number;
  bonusCredits: number;
  isPopular: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'expired' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'basic' | 'premium' | 'family';
  monthlyCredits: number;
  priceEur: number;
  priceRub: number;
  priceAmd: number;
  features: string[];
  maxFamilyMembers: number;
}

export interface FamilyMember {
  id: string;
  userId: string;
  memberUserId: string;
  memberEmail: string;
  memberName: string;
  role: 'owner' | 'member';
  sharedCreditsLimit?: number;
  status: 'active' | 'pending' | 'removed';
  createdAt: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// ============================================
// Navigation Types
// ============================================

export type RootStackParamList = {
  '(auth)/login': undefined;
  '(auth)/register': undefined;
  '(tabs)': undefined;
  'hotel/[id]': { id: string };
  'booking/[id]': { id: string; offerId?: string };
  'booking/confirm': { bookingId: string };
};
