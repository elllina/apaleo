import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHotels, useSearch } from '../../src/hooks/useBooking';
import { RoomCard } from '../../src/components/RoomCard';
import { SearchParams } from '../../src/types';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../src/utils/constants';
import { getLocalizedText, getTomorrow, getDateFromNow, calculateNights } from '../../src/utils/helpers';

const { width } = Dimensions.get('window');

export default function HotelDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { selectedHotel, selectHotel, isLoading: hotelLoading } = useHotels();
  const { rooms, isSearching, searchRooms, selectRoom } = useSearch();

  // Search params state
  const [arrival] = useState(getTomorrow());
  const [departure] = useState(getDateFromNow(3));
  const [adults] = useState(2);

  const nights = calculateNights(arrival, departure);

  useEffect(() => {
    if (id) {
      selectHotel(id);
    }
  }, [id, selectHotel]);

  useEffect(() => {
    if (selectedHotel?.id === id) {
      // Auto-search rooms when hotel is loaded
      const params: SearchParams = {
        propertyId: id,
        arrival,
        departure,
        adults,
      };
      searchRooms(params);
    }
  }, [selectedHotel?.id, id, arrival, departure, adults, searchRooms]);

  const handleSelectRoom = (offer: typeof rooms[0]) => {
    selectRoom(offer);
    router.push(`/booking/${offer.unitGroup.id}?arrival=${arrival}&departure=${departure}&adults=${adults}&hotelId=${id}`);
  };

  if (hotelLoading || !selectedHotel) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const mainImage = selectedHotel.images?.find((img) => img.isMainImage) || selectedHotel.images?.[0];
  const hotelName = getLocalizedText(selectedHotel.name, 'en');
  const hotelDescription = getLocalizedText(selectedHotel.description, 'en');

  return (
    <>
      <Stack.Screen
        options={{
          title: hotelName || selectedHotel.code,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Hotel Images */}
        <View style={styles.imageContainer}>
          {mainImage ? (
            <Image
              source={{ uri: mainImage.url }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>🏨</Text>
            </View>
          )}
          {selectedHotel.rating && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {selectedHotel.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {/* Hotel Info */}
        <View style={styles.infoSection}>
          <Text style={styles.hotelName}>{hotelName || selectedHotel.code}</Text>

          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>
              {selectedHotel.location.addressLine1}, {selectedHotel.location.city}, {selectedHotel.location.countryCode}
            </Text>
          </View>

          {hotelDescription && (
            <Text style={styles.description}>{hotelDescription}</Text>
          )}
        </View>

        {/* Amenities */}
        {selectedHotel.amenities && selectedHotel.amenities.length > 0 && (
          <View style={styles.amenitiesSection}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {selectedHotel.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Text style={styles.amenityIcon}>✓</Text>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Available Rooms */}
        <View style={styles.roomsSection}>
          <View style={styles.roomsHeader}>
            <Text style={styles.sectionTitle}>Available Rooms</Text>
            <Text style={styles.searchInfo}>
              {nights} {nights === 1 ? 'night' : 'nights'} • {adults} {adults === 1 ? 'adult' : 'adults'}
            </Text>
          </View>

          {isSearching ? (
            <View style={styles.roomsLoading}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.loadingText}>Searching rooms...</Text>
            </View>
          ) : rooms.length === 0 ? (
            <View style={styles.noRooms}>
              <Text style={styles.noRoomsIcon}>🔍</Text>
              <Text style={styles.noRoomsText}>No rooms available</Text>
              <Text style={styles.noRoomsSubtext}>Try different dates</Text>
            </View>
          ) : (
            rooms.map((offer, index) => (
              <RoomCard
                key={`${offer.unitGroup.id}-${index}`}
                offer={offer}
                nights={nights}
                onSelect={() => handleSelectRoom(offer)}
              />
            ))
          )}
        </View>

        {/* Hotel Policies */}
        <View style={styles.policiesSection}>
          <Text style={styles.sectionTitle}>Policies</Text>
          <View style={styles.policyItem}>
            <Text style={styles.policyIcon}>🕐</Text>
            <View style={styles.policyContent}>
              <Text style={styles.policyTitle}>Check-in</Text>
              <Text style={styles.policyText}>From 15:00</Text>
            </View>
          </View>
          <View style={styles.policyItem}>
            <Text style={styles.policyIcon}>🕐</Text>
            <View style={styles.policyContent}>
              <Text style={styles.policyTitle}>Check-out</Text>
              <Text style={styles.policyText}>Until 11:00</Text>
            </View>
          </View>
          <View style={styles.policyItem}>
            <Text style={styles.policyIcon}>🚭</Text>
            <View style={styles.policyContent}>
              <Text style={styles.policyTitle}>Smoking</Text>
              <Text style={styles.policyText}>Non-smoking property</Text>
            </View>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Text style={styles.contactText}>{selectedHotel.companyName}</Text>
          <Text style={styles.contactText}>
            {selectedHotel.location.addressLine1}
          </Text>
          <Text style={styles.contactText}>
            {selectedHotel.location.postalCode} {selectedHotel.location.city}
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: SPACING['3xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 64,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  infoSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  hotelName: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  locationIcon: {
    fontSize: TYPOGRAPHY.fontSize.md,
    marginRight: SPACING.xs,
  },
  locationText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    lineHeight: TYPOGRAPHY.fontSize.md * TYPOGRAPHY.lineHeight.normal,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    lineHeight: TYPOGRAPHY.fontSize.md * TYPOGRAPHY.lineHeight.relaxed,
  },
  amenitiesSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: SPACING.sm,
  },
  amenityIcon: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.success,
    marginRight: SPACING.sm,
  },
  amenityText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  roomsSection: {
    padding: SPACING.lg,
  },
  roomsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  searchInfo: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  roomsLoading: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  noRooms: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
  },
  noRoomsIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  noRoomsText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  noRoomsSubtext: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  policiesSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  policyIcon: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    marginRight: SPACING.md,
  },
  policyContent: {
    flex: 1,
  },
  policyTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  policyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  contactSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
  },
  contactText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
});
