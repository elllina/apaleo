import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ApaleoOffer } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../utils/constants';
import { getLocalizedText, formatMoney, eurToCredits, formatCredits } from '../utils/helpers';

interface RoomCardProps {
  offer: ApaleoOffer;
  onSelect: () => void;
  nights: number;
  language?: string;
  showCredits?: boolean;
}

export function RoomCard({
  offer,
  onSelect,
  nights,
  language = 'en',
  showCredits = true,
}: RoomCardProps) {
  const roomName = getLocalizedText(offer.unitGroup.name, language);
  const roomDescription = getLocalizedText(offer.unitGroup.description, language);
  const mainImage = offer.unitGroup.images?.find((img) => img.isMainImage) || offer.unitGroup.images?.[0];

  const totalPrice = offer.totalGrossAmount;
  const pricePerNight = totalPrice.amount / nights;
  const creditsNeeded = eurToCredits(totalPrice.amount);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onSelect}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {mainImage ? (
          <Image
            source={{ uri: mainImage.url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>🛏️</Text>
          </View>
        )}
        {offer.availableUnits <= 3 && (
          <View style={styles.limitedBadge}>
            <Text style={styles.limitedText}>
              {offer.availableUnits === 1
                ? 'Last room!'
                : `Only ${offer.availableUnits} left`}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.roomName} numberOfLines={1}>
              {roomName || offer.unitGroup.code}
            </Text>
            <View style={styles.guestsRow}>
              <Text style={styles.guestsIcon}>👥</Text>
              <Text style={styles.guestsText}>
                Up to {offer.unitGroup.maxPersons} guests
              </Text>
            </View>
          </View>
        </View>

        {roomDescription && (
          <Text style={styles.description} numberOfLines={2}>
            {roomDescription}
          </Text>
        )}

        {offer.unitGroup.amenities && offer.unitGroup.amenities.length > 0 && (
          <View style={styles.amenities}>
            {offer.unitGroup.amenities.slice(0, 4).map((amenity, index) => (
              <View key={index} style={styles.amenityBadge}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.priceSection}>
          <View style={styles.priceInfo}>
            <Text style={styles.pricePerNight}>
              {formatMoney({ amount: pricePerNight, currency: totalPrice.currency })}
              <Text style={styles.perNightText}> / night</Text>
            </Text>
            <Text style={styles.totalPrice}>
              {formatMoney(totalPrice)} total for {nights} {nights === 1 ? 'night' : 'nights'}
            </Text>
            {showCredits && (
              <Text style={styles.creditsPrice}>
                or {formatCredits(creditsNeeded)}
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.selectButton} onPress={onSelect}>
            <Text style={styles.selectButtonText}>Select</Text>
          </TouchableOpacity>
        </View>

        {/* Rate Plan Info */}
        {offer.timeSlices[0]?.ratePlan && (
          <View style={styles.ratePlanInfo}>
            <Text style={styles.ratePlanName}>
              {getLocalizedText(offer.timeSlices[0].ratePlan.name, language)}
            </Text>
          </View>
        )}

        {/* Cancellation Info */}
        {offer.cancellationFee && (
          <View style={styles.cancellationInfo}>
            <Text style={styles.cancellationText}>
              {getLocalizedText(offer.cancellationFee.name, language)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 150,
  },
  image: {
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
    fontSize: 48,
  },
  limitedBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  limitedText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flex: 1,
  },
  roomName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  guestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestsIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginRight: SPACING.xs,
  },
  guestsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    lineHeight: TYPOGRAPHY.fontSize.md * TYPOGRAPHY.lineHeight.normal,
    marginBottom: SPACING.md,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  amenityBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  amenityText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  priceInfo: {
    flex: 1,
  },
  pricePerNight: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  perNightText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '400',
    color: COLORS.text.secondary,
  },
  totalPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  creditsPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: SPACING.xs,
  },
  selectButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  selectButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
  },
  ratePlanInfo: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
  },
  ratePlanName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  cancellationInfo: {
    marginTop: SPACING.xs,
  },
  cancellationText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success,
  },
});
