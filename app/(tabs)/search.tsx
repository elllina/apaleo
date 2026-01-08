import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHotels, useSearch } from '../../src/hooks/useBooking';
import { HotelCard } from '../../src/components/HotelCard';
import { RoomCard } from '../../src/components/RoomCard';
import { SearchParams } from '../../src/types';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../src/utils/constants';
import { getTomorrow, getDateFromNow, calculateNights } from '../../src/utils/helpers';

export default function SearchScreen() {
  const router = useRouter();
  const { hotels, selectedHotel, selectHotel } = useHotels();
  const { rooms, isSearching, searchRooms, selectRoom, clearSearch } = useSearch();

  // Search form state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [arrival, setArrival] = useState(getTomorrow());
  const [departure, setDeparture] = useState(getDateFromNow(3));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!selectedPropertyId) {
      // Search all properties (show hotels list)
      setShowResults(false);
      return;
    }

    const params: SearchParams = {
      propertyId: selectedPropertyId,
      arrival,
      departure,
      adults,
      childrenAges: children > 0 ? Array(children).fill(10) : undefined, // Default age 10
    };

    await searchRooms(params);
    setShowResults(true);
  }, [selectedPropertyId, arrival, departure, adults, children, searchRooms]);

  const handleSelectHotel = useCallback(
    async (hotelId: string) => {
      setSelectedPropertyId(hotelId);
      await selectHotel(hotelId);
    },
    [selectHotel]
  );

  const handleSelectRoom = useCallback(
    (offer: typeof rooms[0]) => {
      selectRoom(offer);
      router.push(`/booking/${offer.unitGroup.id}?arrival=${arrival}&departure=${departure}&adults=${adults}`);
    },
    [selectRoom, router, arrival, departure, adults]
  );

  const handleClearSearch = useCallback(() => {
    setSelectedPropertyId(null);
    setShowResults(false);
    clearSearch();
  }, [clearSearch]);

  const nights = calculateNights(arrival, departure);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Search Form */}
        <View style={styles.searchForm}>
          {/* Property Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Hotel</Text>
            <TouchableOpacity
              style={styles.select}
              onPress={() => {
                if (selectedPropertyId) {
                  handleClearSearch();
                }
              }}
            >
              <Text style={selectedPropertyId ? styles.selectText : styles.selectPlaceholder}>
                {selectedHotel?.name['en'] || selectedHotel?.code || 'Select a hotel'}
              </Text>
              {selectedPropertyId && <Text style={styles.clearIcon}>✕</Text>}
            </TouchableOpacity>
          </View>

          {/* Date Inputs */}
          <View style={styles.dateRow}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.inputLabel}>Check-in</Text>
              <TextInput
                style={styles.input}
                value={arrival}
                onChangeText={setArrival}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.text.disabled}
              />
            </View>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.inputLabel}>Check-out</Text>
              <TextInput
                style={styles.input}
                value={departure}
                onChangeText={setDeparture}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.text.disabled}
              />
            </View>
          </View>

          {/* Guests */}
          <View style={styles.guestsRow}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.inputLabel}>Adults</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => setAdults(Math.max(1, adults - 1))}
                >
                  <Text style={styles.stepperButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{adults}</Text>
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => setAdults(Math.min(10, adults + 1))}
                >
                  <Text style={styles.stepperButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.inputLabel}>Children</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => setChildren(Math.max(0, children - 1))}
                >
                  <Text style={styles.stepperButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{children}</Text>
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => setChildren(Math.min(6, children + 1))}
                >
                  <Text style={styles.stepperButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Search Button */}
          <TouchableOpacity
            style={[styles.searchButton, !selectedPropertyId && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={!selectedPropertyId || isSearching}
          >
            {isSearching ? (
              <ActivityIndicator color={COLORS.text.inverse} />
            ) : (
              <Text style={styles.searchButtonText}>
                Search Rooms ({nights} {nights === 1 ? 'night' : 'nights'})
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Results */}
        {showResults && rooms.length > 0 && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>
              {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} available
            </Text>
            {rooms.map((offer, index) => (
              <RoomCard
                key={`${offer.unitGroup.id}-${index}`}
                offer={offer}
                nights={nights}
                onSelect={() => handleSelectRoom(offer)}
              />
            ))}
          </View>
        )}

        {showResults && rooms.length === 0 && !isSearching && (
          <View style={styles.noResults}>
            <Text style={styles.noResultsIcon}>🔍</Text>
            <Text style={styles.noResultsTitle}>No rooms available</Text>
            <Text style={styles.noResultsSubtitle}>
              Try different dates or a different hotel
            </Text>
          </View>
        )}

        {/* Hotels List (when no property selected) */}
        {!selectedPropertyId && (
          <View style={styles.hotelsList}>
            <Text style={styles.hotelsTitle}>Select a Hotel</Text>
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onPress={() => handleSelectHotel(hotel.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: SPACING['3xl'],
  },
  searchForm: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  selectText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
  },
  selectPlaceholder: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.disabled,
  },
  clearIcon: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  dateRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  guestsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  flex1: {
    flex: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  stepperButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  stepperButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.text.inverse,
  },
  stepperValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  searchButtonDisabled: {
    backgroundColor: COLORS.primary + '60',
  },
  searchButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
  },
  results: {
    paddingHorizontal: SPACING.lg,
  },
  resultsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: SPACING['4xl'],
    paddingHorizontal: SPACING.lg,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  noResultsTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  noResultsSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  hotelsList: {
    paddingHorizontal: SPACING.lg,
  },
  hotelsTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
});
