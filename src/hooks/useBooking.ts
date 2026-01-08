import { useCallback, useEffect } from 'react';
import { useBookingStore } from '../store/bookingStore';
import { SearchParams, Guest, ApaleoOffer, ApaleoBooking } from '../types';

export function useHotels() {
  const {
    properties,
    selectedProperty,
    isLoading,
    error,
    loadProperties,
    selectProperty,
    clearError,
  } = useBookingStore();

  useEffect(() => {
    if (properties.length === 0) {
      loadProperties();
    }
  }, [properties.length, loadProperties]);

  return {
    hotels: properties,
    selectedHotel: selectedProperty,
    isLoading,
    error,
    loadHotels: loadProperties,
    selectHotel: selectProperty,
    clearError,
  };
}

export function useSearch() {
  const {
    offers,
    selectedOffer,
    searchParams,
    isSearching,
    error,
    search,
    selectOffer,
    clearSelectedOffer,
    clearSearch,
    clearError,
  } = useBookingStore();

  const searchRooms = useCallback(
    async (params: SearchParams) => {
      await search(params);
    },
    [search]
  );

  const selectRoom = useCallback(
    (offer: ApaleoOffer) => {
      selectOffer(offer);
    },
    [selectOffer]
  );

  return {
    rooms: offers,
    selectedRoom: selectedOffer,
    searchParams,
    isSearching,
    error,
    searchRooms,
    selectRoom,
    clearSelectedRoom: clearSelectedOffer,
    clearSearch,
    clearError,
  };
}

export function useBooking() {
  const {
    currentBooking,
    isBooking,
    error,
    book,
    loadBooking,
    clearError,
  } = useBookingStore();

  const createBooking = useCallback(
    async (guestInfo: Guest, useCredits: boolean = true): Promise<ApaleoBooking> => {
      return await book({ guestInfo, useCredits });
    },
    [book]
  );

  return {
    booking: currentBooking,
    isBooking,
    error,
    createBooking,
    loadBooking,
    clearError,
  };
}

export function useMyBookings() {
  const {
    myBookings,
    isLoading,
    error,
    loadMyBookings,
    cancelBooking,
    performCheckIn,
    performCheckOut,
    clearError,
  } = useBookingStore();

  useEffect(() => {
    if (myBookings.length === 0) {
      loadMyBookings();
    }
  }, [myBookings.length, loadMyBookings]);

  const refresh = useCallback(async () => {
    await loadMyBookings();
  }, [loadMyBookings]);

  const checkIn = useCallback(
    async (bookingId: string) => {
      await performCheckIn(bookingId);
    },
    [performCheckIn]
  );

  const checkOut = useCallback(
    async (bookingId: string) => {
      await performCheckOut(bookingId);
    },
    [performCheckOut]
  );

  const cancel = useCallback(
    async (bookingId: string) => {
      await cancelBooking(bookingId);
    },
    [cancelBooking]
  );

  return {
    bookings: myBookings,
    isLoading,
    error,
    refresh,
    checkIn,
    checkOut,
    cancel,
    clearError,
  };
}

export function useBookingDetails(bookingId: string) {
  const {
    currentBooking,
    isLoading,
    error,
    loadBooking,
    cancelBooking,
    performCheckIn,
    performCheckOut,
    clearError,
  } = useBookingStore();

  useEffect(() => {
    if (bookingId && currentBooking?.id !== bookingId) {
      loadBooking(bookingId);
    }
  }, [bookingId, currentBooking?.id, loadBooking]);

  const checkIn = useCallback(async () => {
    await performCheckIn(bookingId);
  }, [bookingId, performCheckIn]);

  const checkOut = useCallback(async () => {
    await performCheckOut(bookingId);
  }, [bookingId, performCheckOut]);

  const cancel = useCallback(async () => {
    await cancelBooking(bookingId);
  }, [bookingId, cancelBooking]);

  const canCheckIn = currentBooking?.actions?.find(a => a.action === 'CheckIn')?.isAllowed ?? false;
  const canCheckOut = currentBooking?.actions?.find(a => a.action === 'CheckOut')?.isAllowed ?? false;
  const canCancel = currentBooking?.actions?.find(a => a.action === 'Cancel')?.isAllowed ?? false;

  return {
    booking: currentBooking,
    isLoading,
    error,
    refresh: () => loadBooking(bookingId),
    checkIn,
    checkOut,
    cancel,
    canCheckIn,
    canCheckOut,
    canCancel,
    clearError,
  };
}
