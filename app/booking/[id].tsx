import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useSearch, useBooking, useBookingDetails } from '../../src/hooks/useBooking';
import { useCreditBalance } from '../../src/hooks/useCredits';
import { Guest } from '../../src/types';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../src/utils/constants';
import {
  getLocalizedText,
  formatMoney,
  formatDateRange,
  calculateNights,
  eurToCredits,
  formatCredits,
  isValidEmail,
} from '../../src/utils/helpers';

export default function BookingScreen() {
  const { id, arrival, departure, adults, hotelId } = useLocalSearchParams<{
    id: string;
    arrival: string;
    departure: string;
    adults: string;
    hotelId?: string;
  }>();
  const router = useRouter();

  const { user, isAuthenticated } = useAuthStore();
  const { selectedRoom } = useSearch();
  const { createBooking, isBooking, error: bookingError } = useBooking();
  const { booking, loadBooking } = useBookingDetails(id);
  const { credits, refresh: refreshCredits } = useCreditBalance();

  // Check if viewing existing booking or creating new
  const isExistingBooking = !arrival || !departure;

  // Guest form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [useCredits, setUseCredits] = useState(true);

  useEffect(() => {
    if (isExistingBooking && id) {
      loadBooking(id);
    }
  }, [isExistingBooking, id, loadBooking]);

  // Calculate pricing
  const nights = arrival && departure ? calculateNights(arrival, departure) : 0;
  const totalAmount = selectedRoom?.totalGrossAmount.amount || 0;
  const creditsNeeded = eurToCredits(totalAmount);
  const hasEnoughCredits = credits >= creditsNeeded;

  const handleBooking = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }

    if (!firstName || !lastName || !email) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (useCredits && !hasEnoughCredits) {
      Alert.alert(
        'Insufficient Credits',
        `You need ${formatCredits(creditsNeeded)} but only have ${formatCredits(credits)}. Would you like to buy more credits?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Buy Credits', onPress: () => router.push('/(tabs)/wallet') },
        ]
      );
      return;
    }

    const guestInfo: Guest = {
      firstName,
      lastName,
      email,
      phone: phone || undefined,
    };

    try {
      const newBooking = await createBooking(guestInfo, useCredits);
      await refreshCredits();
      router.replace(`/booking/confirm?bookingId=${newBooking.id}`);
    } catch (error) {
      Alert.alert('Booking Failed', bookingError || 'Something went wrong. Please try again.');
    }
  };

  // Render existing booking details
  if (isExistingBooking && booking) {
    const bookingNights = calculateNights(booking.arrival, booking.departure);
    return (
      <>
        <Stack.Screen options={{ title: `Booking #${booking.bookingId}` }} />
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.bookingDetails}>
            <Text style={styles.roomName}>
              {getLocalizedText(booking.unitGroup.name, 'en')}
            </Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📅</Text>
              <Text style={styles.detailText}>
                {formatDateRange(booking.arrival, booking.departure)} ({bookingNights} nights)
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>👥</Text>
              <Text style={styles.detailText}>
                {booking.adults} {booking.adults === 1 ? 'adult' : 'adults'}
                {booking.childrenAges && booking.childrenAges.length > 0 &&
                  `, ${booking.childrenAges.length} children`}
              </Text>
            </View>

            {booking.unit && (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>🚪</Text>
                <Text style={styles.detailText}>Room: {booking.unit.name}</Text>
              </View>
            )}

            <View style={styles.priceSummary}>
              <Text style={styles.priceLabel}>Total</Text>
              <Text style={styles.priceValue}>{formatMoney(booking.totalGrossAmount)}</Text>
            </View>
          </View>

          {booking.primaryGuest && (
            <View style={styles.guestSection}>
              <Text style={styles.sectionTitle}>Guest Information</Text>
              <Text style={styles.guestName}>
                {booking.primaryGuest.firstName} {booking.primaryGuest.lastName}
              </Text>
              {booking.primaryGuest.email && (
                <Text style={styles.guestDetail}>{booking.primaryGuest.email}</Text>
              )}
              {booking.primaryGuest.phone && (
                <Text style={styles.guestDetail}>{booking.primaryGuest.phone}</Text>
              )}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsSection}>
            {booking.actions?.find((a) => a.action === 'CheckIn')?.isAllowed && (
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Check In</Text>
              </TouchableOpacity>
            )}
            {booking.actions?.find((a) => a.action === 'Cancel')?.isAllowed && (
              <TouchableOpacity style={styles.dangerButton}>
                <Text style={styles.dangerButtonText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </>
    );
  }

  // Render new booking form
  if (!selectedRoom) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading room details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Complete Booking' }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {/* Booking Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <Text style={styles.roomName}>
              {getLocalizedText(selectedRoom.unitGroup.name, 'en')}
            </Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📅</Text>
              <Text style={styles.detailText}>
                {formatDateRange(arrival!, departure!)} ({nights} nights)
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>👥</Text>
              <Text style={styles.detailText}>
                {adults} {parseInt(adults!) === 1 ? 'adult' : 'adults'}
              </Text>
            </View>
          </View>

          {/* Guest Information Form */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Guest Information</Text>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.inputLabel}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="John"
                  placeholderTextColor={COLORS.text.disabled}
                />
              </View>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.inputLabel}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Doe"
                  placeholderTextColor={COLORS.text.disabled}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="john@example.com"
                placeholderTextColor={COLORS.text.disabled}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 234 567 8900"
                placeholderTextColor={COLORS.text.disabled}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Payment Method</Text>

            <TouchableOpacity
              style={[styles.paymentOption, useCredits && styles.paymentOptionSelected]}
              onPress={() => setUseCredits(true)}
            >
              <View style={styles.paymentOptionLeft}>
                <Text style={styles.paymentIcon}>💳</Text>
                <View>
                  <Text style={styles.paymentTitle}>Pay with Credits</Text>
                  <Text style={styles.paymentSubtitle}>
                    Balance: {formatCredits(credits)}
                  </Text>
                </View>
              </View>
              <View style={[styles.radioOuter, useCredits && styles.radioOuterSelected]}>
                {useCredits && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            {useCredits && !hasEnoughCredits && (
              <View style={styles.insufficientCredits}>
                <Text style={styles.insufficientText}>
                  You need {formatCredits(creditsNeeded - credits)} more credits
                </Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/wallet')}>
                  <Text style={styles.buyCreditsLink}>Buy Credits</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.paymentOption, !useCredits && styles.paymentOptionSelected]}
              onPress={() => setUseCredits(false)}
            >
              <View style={styles.paymentOptionLeft}>
                <Text style={styles.paymentIcon}>💰</Text>
                <View>
                  <Text style={styles.paymentTitle}>Pay at Hotel</Text>
                  <Text style={styles.paymentSubtitle}>
                    Credit card required for guarantee
                  </Text>
                </View>
              </View>
              <View style={[styles.radioOuter, !useCredits && styles.radioOuterSelected]}>
                {!useCredits && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          </View>

          {/* Price Summary */}
          <View style={styles.priceSummarySection}>
            <View style={styles.priceRow}>
              <Text style={styles.priceRowLabel}>
                {nights} {nights === 1 ? 'night' : 'nights'}
              </Text>
              <Text style={styles.priceRowValue}>
                {formatMoney(selectedRoom.totalGrossAmount)}
              </Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <View style={styles.totalValues}>
                <Text style={styles.totalValue}>
                  {formatMoney(selectedRoom.totalGrossAmount)}
                </Text>
                {useCredits && (
                  <Text style={styles.totalCredits}>
                    ({formatCredits(creditsNeeded)})
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Book Button */}
          <TouchableOpacity
            style={[
              styles.bookButton,
              (isBooking || (useCredits && !hasEnoughCredits)) && styles.bookButtonDisabled,
            ]}
            onPress={handleBooking}
            disabled={isBooking || (useCredits && !hasEnoughCredits)}
          >
            {isBooking ? (
              <ActivityIndicator color={COLORS.text.inverse} />
            ) : (
              <Text style={styles.bookButtonText}>
                {!isAuthenticated
                  ? 'Sign in to Book'
                  : useCredits
                  ? `Pay ${formatCredits(creditsNeeded)}`
                  : 'Confirm Booking'}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By booking, you agree to our Terms & Conditions and Cancellation Policy
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  roomName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailIcon: {
    fontSize: TYPOGRAPHY.fontSize.md,
    marginRight: SPACING.sm,
  },
  detailText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  bookingDetails: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  guestSection: {
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
  guestName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  guestDetail: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  actionsSection: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  dangerButtonText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
  },
  formSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  flex1: {
    flex: 1,
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
  paymentSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    marginRight: SPACING.md,
  },
  paymentTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  paymentSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  insufficientCredits: {
    backgroundColor: COLORS.error + '10',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insufficientText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
  },
  buyCreditsLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  priceSummarySection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  priceRowLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  priceRowValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
  },
  priceDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  totalValues: {
    alignItems: 'flex-end',
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  totalCredits: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  bookButtonDisabled: {
    backgroundColor: COLORS.primary + '60',
  },
  bookButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
  },
  termsText: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.disabled,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
});
