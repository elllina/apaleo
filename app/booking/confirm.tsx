import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../src/utils/constants';

export default function BookingConfirmScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Success Animation */}
          <View style={styles.successIcon}>
            <Text style={styles.successEmoji}>🎉</Text>
          </View>

          <Text style={styles.title}>Booking Confirmed!</Text>
          <Text style={styles.subtitle}>
            Your reservation has been successfully created
          </Text>

          {bookingId && (
            <View style={styles.bookingIdContainer}>
              <Text style={styles.bookingIdLabel}>Booking Reference</Text>
              <Text style={styles.bookingIdValue}>{bookingId}</Text>
            </View>
          )}

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📧</Text>
              <Text style={styles.infoText}>
                Confirmation email sent to your registered email address
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📱</Text>
              <Text style={styles.infoText}>
                Mobile check-in will be available 24 hours before arrival
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>💬</Text>
              <Text style={styles.infoText}>
                Contact the hotel directly for special requests
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(tabs)/bookings')}
            >
              <Text style={styles.primaryButtonText}>View My Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.secondaryButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footerText}>
          Thank you for booking with SHM! Have a great stay.
        </Text>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  successEmoji: {
    fontSize: 64,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  bookingIdContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  bookingIdLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  bookingIdValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    width: '100%',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  infoIcon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    marginRight: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    lineHeight: TYPOGRAPHY.fontSize.md * TYPOGRAPHY.lineHeight.normal,
  },
  actions: {
    width: '100%',
    gap: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  primaryButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '500',
  },
  footerText: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.disabled,
    paddingBottom: SPACING.xl,
  },
});
