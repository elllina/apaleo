import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useHotels, useMyBookings } from '../../src/hooks/useBooking';
import { useCreditBalance } from '../../src/hooks/useCredits';
import { HotelCard } from '../../src/components/HotelCard';
import { BookingCardCompact } from '../../src/components/BookingCard';
import { CreditBalance } from '../../src/components/CreditBalance';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../src/utils/constants';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { hotels, isLoading: hotelsLoading, loadHotels } = useHotels();
  const { bookings, isLoading: bookingsLoading, refresh: refreshBookings } = useMyBookings();
  const { balance, isLoading: balanceLoading, refresh: refreshBalance } = useCreditBalance();

  const upcomingBookings = bookings
    .filter((b) => b.status === 'Confirmed' || b.status === 'InHouse')
    .slice(0, 3);

  const featuredHotels = hotels.slice(0, 5);

  const handleRefresh = async () => {
    await Promise.all([loadHotels(), refreshBookings(), refreshBalance()]);
  };

  const isRefreshing = hotelsLoading || bookingsLoading || balanceLoading;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {user ? `Hello, ${user.firstName}!` : 'Welcome to SHM'}
            </Text>
            <Text style={styles.subtitle}>Find your perfect stay</Text>
          </View>
          {!isAuthenticated && (
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Credits Balance */}
        {isAuthenticated && (
          <View style={styles.section}>
            <CreditBalance
              balance={balance}
              onAddCredits={() => router.push('/(tabs)/wallet')}
            />
          </View>
        )}

        {/* Quick Search */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.8}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Where are you going?</Text>
        </TouchableOpacity>

        {/* Upcoming Bookings */}
        {isAuthenticated && upcomingBookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Stays</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/bookings')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {upcomingBookings.map((booking) => (
              <BookingCardCompact
                key={booking.id}
                booking={booking}
                onPress={() => router.push(`/booking/${booking.id}`)}
              />
            ))}
          </View>
        )}

        {/* Featured Hotels */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Hotels</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {featuredHotels.length === 0 && !hotelsLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏨</Text>
              <Text style={styles.emptyText}>No hotels available</Text>
              <Text style={styles.emptySubtext}>
                Check back later for new properties
              </Text>
            </View>
          ) : (
            featuredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onPress={() => router.push(`/hotel/${hotel.id}`)}
              />
            ))
          )}
        </View>

        {/* Destinations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Destinations</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.destinationsContainer}
          >
            {['Yerevan', 'Tbilisi', 'Moscow', 'Batumi', 'Sochi'].map((city) => (
              <TouchableOpacity
                key={city}
                style={styles.destinationCard}
                onPress={() => {
                  // Navigate to search with city filter
                  router.push('/(tabs)/search');
                }}
              >
                <View style={styles.destinationImage}>
                  <Text style={styles.destinationEmoji}>
                    {city === 'Yerevan' ? '🇦🇲' :
                     city === 'Tbilisi' || city === 'Batumi' ? '🇬🇪' : '🇷🇺'}
                  </Text>
                </View>
                <Text style={styles.destinationName}>{city}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  signInButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  signInText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: SPACING['2xl'],
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  seeAll: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING['2xl'],
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    marginRight: SPACING.md,
  },
  searchPlaceholder: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  destinationsContainer: {
    paddingTop: SPACING.md,
    gap: SPACING.md,
  },
  destinationCard: {
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  destinationImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  destinationEmoji: {
    fontSize: 36,
  },
  destinationName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
});
