import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  ApaleoProperty,
  ApaleoOffer,
  ApaleoBooking,
  CreateBookingRequest,
  PaginatedResponse,
  SearchParams,
  Guest,
} from '../types';
import { APALEO_API_URL } from '../utils/constants';
import { getValidAccessToken, refreshAccessToken, loadTokens } from './auth';

// Create Axios instance for Apaleo API
const apaleoClient: AxiosInstance = axios.create({
  baseURL: APALEO_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apaleoClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getValidAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apaleoClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried, try refreshing token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = await loadTokens();
        if (tokens?.refreshToken) {
          const newTokens = await refreshAccessToken(tokens.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return apaleoClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, user needs to re-authenticate
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// Property / Inventory API
// ============================================

/**
 * Get list of properties (hotels)
 */
export async function getProperties(params?: {
  pageNumber?: number;
  pageSize?: number;
  status?: 'Test' | 'Live';
}): Promise<PaginatedResponse<ApaleoProperty>> {
  const response = await apaleoClient.get('/inventory/v1/properties', {
    params: {
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 20,
      status: params?.status ?? 'Live',
    },
  });

  return {
    items: response.data.properties,
    count: response.data.properties.length,
    totalCount: response.data.count,
    pageNumber: params?.pageNumber ?? 1,
    pageSize: params?.pageSize ?? 20,
  };
}

/**
 * Get single property by ID
 */
export async function getProperty(propertyId: string): Promise<ApaleoProperty> {
  const response = await apaleoClient.get(`/inventory/v1/properties/${propertyId}`, {
    params: {
      languages: 'en,ru,hy',
    },
  });
  return response.data;
}

/**
 * Get unit groups (room types) for a property
 */
export async function getUnitGroups(propertyId: string): Promise<PaginatedResponse<ApaleoOffer['unitGroup']>> {
  const response = await apaleoClient.get('/inventory/v1/unit-groups', {
    params: {
      propertyId,
      pageSize: 100,
    },
  });

  return {
    items: response.data.unitGroups,
    count: response.data.unitGroups.length,
    totalCount: response.data.count,
    pageNumber: 1,
    pageSize: 100,
  };
}

// ============================================
// Booking / Offers API
// ============================================

/**
 * Search for available offers (rooms)
 */
export async function searchOffers(params: SearchParams): Promise<ApaleoOffer[]> {
  const response = await apaleoClient.get('/booking/v1/offers', {
    params: {
      propertyId: params.propertyId,
      arrival: params.arrival,
      departure: params.departure,
      adults: params.adults,
      childrenAges: params.childrenAges?.join(','),
      channelCode: params.channelCode ?? 'Direct',
      promoCode: params.promoCode,
      timeSliceTemplate: 'RatePlan',
      includeUnavailable: false,
    },
  });

  return response.data.offers ?? [];
}

/**
 * Get a specific offer by time slice definition
 */
export async function getOffer(params: {
  propertyId: string;
  arrival: string;
  departure: string;
  adults: number;
  childrenAges?: number[];
  ratePlanId: string;
  unitGroupId: string;
}): Promise<ApaleoOffer | null> {
  const offers = await searchOffers({
    propertyId: params.propertyId,
    arrival: params.arrival,
    departure: params.departure,
    adults: params.adults,
    childrenAges: params.childrenAges,
  });

  return offers.find(
    (offer) =>
      offer.unitGroup.id === params.unitGroupId &&
      offer.timeSlices.some((ts) => ts.ratePlan.id === params.ratePlanId)
  ) ?? null;
}

/**
 * Create a new booking
 */
export async function createBooking(request: CreateBookingRequest): Promise<ApaleoBooking> {
  const response = await apaleoClient.post('/booking/v1/bookings', {
    propertyId: request.propertyId,
    reservations: [
      {
        arrival: request.arrival,
        departure: request.departure,
        adults: request.adults,
        childrenAges: request.childrenAges,
        comment: request.comment,
        guestComment: request.guestComment,
        channelCode: request.channelCode ?? 'Direct',
        primaryGuest: request.primaryGuest,
        guaranteeType: request.guaranteeType ?? 'CreditCard',
        timeSlices: request.timeSlices,
        services: request.services,
      },
    ],
    booker: request.booker,
    paymentAccount: request.paymentAccount,
  });

  return response.data.reservations[0];
}

// ============================================
// Reservations API
// ============================================

/**
 * Get list of reservations for the current user
 */
export async function getReservations(params?: {
  propertyId?: string;
  status?: string[];
  from?: string;
  to?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<ApaleoBooking>> {
  const response = await apaleoClient.get('/booking/v1/reservations', {
    params: {
      propertyId: params?.propertyId,
      status: params?.status?.join(','),
      from: params?.from,
      to: params?.to,
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 20,
      expand: 'unit,primaryGuest,actions',
    },
  });

  return {
    items: response.data.reservations,
    count: response.data.reservations.length,
    totalCount: response.data.count,
    pageNumber: params?.pageNumber ?? 1,
    pageSize: params?.pageSize ?? 20,
  };
}

/**
 * Get a single reservation by ID
 */
export async function getReservation(reservationId: string): Promise<ApaleoBooking> {
  const response = await apaleoClient.get(`/booking/v1/reservations/${reservationId}`, {
    params: {
      expand: 'unit,primaryGuest,additionalGuests,booker,actions,company,paymentAccount',
    },
  });
  return response.data;
}

/**
 * Cancel a reservation
 */
export async function cancelReservation(reservationId: string): Promise<void> {
  await apaleoClient.put(`/booking/v1/reservation-actions/${reservationId}/cancel`);
}

/**
 * Perform mobile check-in
 */
export async function checkIn(reservationId: string): Promise<void> {
  await apaleoClient.put(`/booking/v1/reservation-actions/${reservationId}/check-in`);
}

/**
 * Perform check-out
 */
export async function checkOut(reservationId: string): Promise<void> {
  await apaleoClient.put(`/booking/v1/reservation-actions/${reservationId}/check-out`);
}

/**
 * Update guest information on a reservation
 */
export async function updateGuest(
  reservationId: string,
  guest: Guest
): Promise<void> {
  await apaleoClient.put(`/booking/v1/reservations/${reservationId}/primary-guest`, guest);
}

/**
 * Add additional guest to reservation
 */
export async function addGuest(
  reservationId: string,
  guest: Guest
): Promise<void> {
  await apaleoClient.post(`/booking/v1/reservations/${reservationId}/additional-guests`, guest);
}

// ============================================
// Finance / Folio API
// ============================================

/**
 * Get folio for a reservation
 */
export async function getFolio(reservationId: string): Promise<{
  id: string;
  balance: { amount: number; currency: string };
  charges: Array<{
    id: string;
    name: string;
    amount: { gross: { amount: number; currency: string } };
    createdAt: string;
  }>;
}> {
  // First get the folio ID from the reservation
  const response = await apaleoClient.get(`/finance/v1/folios`, {
    params: {
      reservationId,
      pageSize: 1,
    },
  });

  if (!response.data.folios || response.data.folios.length === 0) {
    throw new Error('No folio found for reservation');
  }

  const folioId = response.data.folios[0].id;

  // Get folio details
  const folioResponse = await apaleoClient.get(`/finance/v1/folios/${folioId}`, {
    params: {
      expand: 'charges',
    },
  });

  return folioResponse.data;
}

/**
 * Add a charge to a folio
 */
export async function addCharge(
  folioId: string,
  charge: {
    serviceType: string;
    name: string;
    amount: { amount: number; currency: string };
    receipt?: string;
  }
): Promise<void> {
  await apaleoClient.post(`/finance/v1/folios/${folioId}/charges`, charge);
}

// ============================================
// Rate Plans API
// ============================================

/**
 * Get rate plans for a property
 */
export async function getRatePlans(propertyId: string): Promise<PaginatedResponse<{
  id: string;
  code: string;
  name: Record<string, string>;
  description?: Record<string, string>;
}>> {
  const response = await apaleoClient.get('/rateplan/v1/rate-plans', {
    params: {
      propertyId,
      pageSize: 100,
    },
  });

  return {
    items: response.data.ratePlans,
    count: response.data.ratePlans.length,
    totalCount: response.data.count,
    pageNumber: 1,
    pageSize: 100,
  };
}

// Export the client for custom requests
export { apaleoClient };
