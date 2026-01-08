import { create } from 'zustand';
import {
  ApaleoProperty,
  ApaleoOffer,
  ApaleoBooking,
  SearchParams,
  CreateBookingRequest,
  Guest,
} from '../types';
import {
  getProperties,
  getProperty,
  searchOffers,
  createBooking,
  getReservations,
  getReservation,
  cancelReservation,
  checkIn,
  checkOut,
} from '../api/apaleo';
import { spendCredits, syncBooking } from '../api/shm';
import { eurToCredits } from '../utils/helpers';

interface BookingState {
  // Search state
  properties: ApaleoProperty[];
  selectedProperty: ApaleoProperty | null;
  offers: ApaleoOffer[];
  selectedOffer: ApaleoOffer | null;
  searchParams: SearchParams | null;
  isSearching: boolean;

  // Booking state
  currentBooking: ApaleoBooking | null;
  myBookings: ApaleoBooking[];
  isBooking: boolean;

  // Loading/Error state
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProperties: () => Promise<void>;
  selectProperty: (propertyId: string) => Promise<void>;
  search: (params: SearchParams) => Promise<void>;
  selectOffer: (offer: ApaleoOffer) => void;
  clearSelectedOffer: () => void;

  // Booking actions
  book: (params: {
    guestInfo: Guest;
    useCredits: boolean;
  }) => Promise<ApaleoBooking>;
  loadMyBookings: () => Promise<void>;
  loadBooking: (bookingId: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  performCheckIn: (bookingId: string) => Promise<void>;
  performCheckOut: (bookingId: string) => Promise<void>;

  // Utils
  clearSearch: () => void;
  clearError: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  // Initial state
  properties: [],
  selectedProperty: null,
  offers: [],
  selectedOffer: null,
  searchParams: null,
  isSearching: false,
  currentBooking: null,
  myBookings: [],
  isBooking: false,
  isLoading: false,
  error: null,

  // Load available properties (hotels)
  loadProperties: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await getProperties({ status: 'Live' });
      set({ properties: response.items, isLoading: false });
    } catch (error) {
      console.error('Error loading properties:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load hotels',
      });
    }
  },

  // Select a property and load its details
  selectProperty: async (propertyId: string) => {
    try {
      set({ isLoading: true, error: null });
      const property = await getProperty(propertyId);
      set({ selectedProperty: property, isLoading: false });
    } catch (error) {
      console.error('Error loading property:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load hotel details',
      });
    }
  },

  // Search for available rooms
  search: async (params: SearchParams) => {
    try {
      set({ isSearching: true, error: null, searchParams: params });
      const offers = await searchOffers(params);
      set({ offers, isSearching: false });
    } catch (error) {
      console.error('Error searching offers:', error);
      set({
        isSearching: false,
        error: error instanceof Error ? error.message : 'Search failed',
      });
    }
  },

  // Select an offer for booking
  selectOffer: (offer: ApaleoOffer) => {
    set({ selectedOffer: offer });
  },

  // Clear selected offer
  clearSelectedOffer: () => {
    set({ selectedOffer: null });
  },

  // Create a booking
  book: async ({ guestInfo, useCredits }) => {
    const { selectedOffer, searchParams, selectedProperty } = get();

    if (!selectedOffer || !searchParams || !selectedProperty) {
      throw new Error('Missing booking information');
    }

    try {
      set({ isBooking: true, error: null });

      const totalAmount = selectedOffer.totalGrossAmount.amount;
      const creditsNeeded = eurToCredits(totalAmount);

      // If using credits, spend them first
      if (useCredits) {
        await spendCredits({
          amount: creditsNeeded,
          bookingId: '', // Will be updated after booking
          description: `Booking at ${selectedProperty.name['en'] || selectedProperty.code}`,
        });
      }

      // Create booking request
      const bookingRequest: CreateBookingRequest = {
        propertyId: selectedProperty.id,
        arrival: searchParams.arrival,
        departure: searchParams.departure,
        adults: searchParams.adults,
        childrenAges: searchParams.childrenAges,
        primaryGuest: guestInfo,
        booker: {
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          email: guestInfo.email,
          phone: guestInfo.phone,
        },
        timeSlices: selectedOffer.timeSlices.map((ts) => ({
          ratePlanId: ts.ratePlan.id,
          totalAmount: ts.totalGrossAmount,
        })),
        guaranteeType: useCredits ? 'Prepayment' : 'CreditCard',
      };

      // Create the booking in Apaleo
      const booking = await createBooking(bookingRequest);

      // Sync booking with SHM backend
      await syncBooking({
        apaleoBookingId: booking.id,
        propertyId: selectedProperty.id,
        creditsUsed: useCredits ? creditsNeeded : 0,
        totalAmount,
        currency: selectedOffer.totalGrossAmount.currency,
      });

      set({
        currentBooking: booking,
        isBooking: false,
        selectedOffer: null,
      });

      // Refresh my bookings
      get().loadMyBookings();

      return booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      set({
        isBooking: false,
        error: error instanceof Error ? error.message : 'Booking failed',
      });
      throw error;
    }
  },

  // Load user's bookings
  loadMyBookings: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await getReservations();
      set({ myBookings: response.items, isLoading: false });
    } catch (error) {
      console.error('Error loading bookings:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load bookings',
      });
    }
  },

  // Load a specific booking
  loadBooking: async (bookingId: string) => {
    try {
      set({ isLoading: true, error: null });
      const booking = await getReservation(bookingId);
      set({ currentBooking: booking, isLoading: false });
    } catch (error) {
      console.error('Error loading booking:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load booking',
      });
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId: string) => {
    try {
      set({ isLoading: true, error: null });
      await cancelReservation(bookingId);

      // Refresh bookings
      await get().loadMyBookings();

      // Update current booking if it's the one being canceled
      const { currentBooking } = get();
      if (currentBooking?.id === bookingId) {
        await get().loadBooking(bookingId);
      }

      set({ isLoading: false });
    } catch (error) {
      console.error('Error canceling booking:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to cancel booking',
      });
      throw error;
    }
  },

  // Perform check-in
  performCheckIn: async (bookingId: string) => {
    try {
      set({ isLoading: true, error: null });
      await checkIn(bookingId);
      await get().loadBooking(bookingId);
      await get().loadMyBookings();
      set({ isLoading: false });
    } catch (error) {
      console.error('Error checking in:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Check-in failed',
      });
      throw error;
    }
  },

  // Perform check-out
  performCheckOut: async (bookingId: string) => {
    try {
      set({ isLoading: true, error: null });
      await checkOut(bookingId);
      await get().loadBooking(bookingId);
      await get().loadMyBookings();
      set({ isLoading: false });
    } catch (error) {
      console.error('Error checking out:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Check-out failed',
      });
      throw error;
    }
  },

  // Clear search state
  clearSearch: () => {
    set({
      offers: [],
      selectedOffer: null,
      searchParams: null,
    });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
