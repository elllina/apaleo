import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ApaleoBooking } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../utils/constants';
import {
  getLocalizedText,
  formatDateRange,
  calculateNights,
  formatMoney,
  getStatusDisplay,
} from '../utils/helpers';

interface BookingCardProps {
  booking: ApaleoBooking;
  onPress: () => void;
  language?: string;
}

export function BookingCard({ booking, onPress, language = 'en' }: BookingCardProps) {
  const roomName = getLocalizedText(booking.unitGroup.name, language);
  const nights = calculateNights(booking.arrival, booking.departure);
  const statusDisplay = getStatusDisplay(booking.status);

  const canCheckIn = booking.actions?.find(a => a.action === 'CheckIn')?.isAllowed;
  const canCheckOut = booking.actions?.find(a => a.action === 'CheckOut')?.isAllowed;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.bookingId}>#{booking.bookingId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusDisplay.color }]}>
            <Text style={styles.statusText}>{statusDisplay.label}</Text>
          </View>
        </View>
        {(canCheckIn || canCheckOut) && (
          <View style={styles.actionBadge}>
            <Text style={styles.actionText}>
              {canCheckIn ? 'Check-in available' : 'Check-out available'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.roomName} numberOfLines={1}>
          {roomName || booking.unitGroup.code}
        </Text>

        <View style={styles.dateRow}>
          <Text style={styles.dateIcon}>📅</Text>
          <Text style={styles.dateText}>
            {formatDateRange(booking.arrival, booking.departure)}
          </Text>
          <Text style={styles.nightsText}>
            ({nights} {nights === 1 ? 'night' : 'nights'})
          </Text>
        </View>

        <View style={styles.guestsRow}>
          <Text style={styles.guestsIcon}>👥</Text>
          <Text style={styles.guestsText}>
            {booking.adults} {booking.adults === 1 ? 'adult' : 'adults'}
            {booking.childrenAges && booking.childrenAges.length > 0 && (
              `, ${booking.childrenAges.length} ${booking.childrenAges.length === 1 ? 'child' : 'children'}`
            )}
          </Text>
        </View>

        {booking.unit && (
          <View style={styles.unitRow}>
            <Text style={styles.unitIcon}>🚪</Text>
            <Text style={styles.unitText}>Room: {booking.unit.name}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.priceAmount}>{formatMoney(booking.totalGrossAmount)}</Text>
        </View>

        {booking.balance.amount !== 0 && (
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text
              style={[
                styles.balanceAmount,
                { color: booking.balance.amount > 0 ? COLORS.error : COLORS.success },
              ]}
            >
              {formatMoney(booking.balance)}
            </Text>
          </View>
        )}
      </View>

      {booking.primaryGuest && (
        <View style={styles.guestInfo}>
          <Text style={styles.guestLabel}>Guest:</Text>
          <Text style={styles.guestName}>
            {booking.primaryGuest.firstName} {booking.primaryGuest.lastName}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

interface BookingCardCompactProps {
  booking: ApaleoBooking;
  onPress: () => void;
  language?: string;
}

export function BookingCardCompact({ booking, onPress, language = 'en' }: BookingCardCompactProps) {
  const roomName = getLocalizedText(booking.unitGroup.name, language);
  const statusDisplay = getStatusDisplay(booking.status);

  return (
    <TouchableOpacity
      style={styles.compactContainer}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={[styles.statusIndicator, { backgroundColor: statusDisplay.color }]} />
      <View style={styles.compactContent}>
        <Text style={styles.compactRoomName} numberOfLines={1}>
          {roomName || booking.unitGroup.code}
        </Text>
        <Text style={styles.compactDate}>
          {formatDateRange(booking.arrival, booking.departure)}
        </Text>
      </View>
      <View style={styles.compactPrice}>
        <Text style={styles.compactPriceAmount}>
          {formatMoney(booking.totalGrossAmount)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingId: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
  },
  actionBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  actionText: {
    color: COLORS.success,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '500',
  },
  content: {
    marginBottom: SPACING.md,
  },
  roomName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dateIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginRight: SPACING.xs,
  },
  dateText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
  },
  nightsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  guestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  guestsIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginRight: SPACING.xs,
  },
  guestsText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginRight: SPACING.xs,
  },
  unitText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  priceAmount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  balanceAmount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  guestLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginRight: SPACING.xs,
  },
  guestName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  statusIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: SPACING.md,
  },
  compactContent: {
    flex: 1,
  },
  compactRoomName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  compactDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  compactPrice: {
    marginLeft: SPACING.md,
  },
  compactPriceAmount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
});
