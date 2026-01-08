import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useApaleoAuth } from '../../src/hooks/useApaleo';
import { useCreditBalance, useSubscription } from '../../src/hooks/useCredits';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, LANGUAGES } from '../../src/utils/constants';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const { signOut, isLoading } = useApaleoAuth();
  const { credits } = useCreditBalance();
  const { isSubscribed, subscription } = useSubscription();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  const handleLanguageChange = (lang: 'en' | 'ru' | 'hy') => {
    updateUser({ preferredLanguage: lang });
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.notAuthContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <Text style={styles.notAuthTitle}>Sign in to your account</Text>
          <Text style={styles.notAuthSubtitle}>
            Access your profile, manage settings, and view your booking history
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{credits}</Text>
            <Text style={styles.statLabel}>Credits</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {isSubscribed ? subscription?.plan.name : 'None'}
            </Text>
            <Text style={styles.statLabel}>Plan</Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>👤</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Edit Profile</Text>
              <Text style={styles.menuItemSubtitle}>Update your personal information</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/wallet')}
          >
            <Text style={styles.menuItemIcon}>💳</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Credits & Subscription</Text>
              <Text style={styles.menuItemSubtitle}>Manage your credits and plan</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>👥</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Family Sharing</Text>
              <Text style={styles.menuItemSubtitle}>Manage family members</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Preferences</Text>

          <View style={styles.languageSection}>
            <Text style={styles.menuItemIcon}>🌐</Text>
            <View style={styles.languageContent}>
              <Text style={styles.menuItemTitle}>Language</Text>
              <View style={styles.languageOptions}>
                {(Object.keys(LANGUAGES) as Array<keyof typeof LANGUAGES>).map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.languageOption,
                      user?.preferredLanguage === lang && styles.languageOptionActive,
                    ]}
                    onPress={() => handleLanguageChange(lang)}
                  >
                    <Text
                      style={[
                        styles.languageOptionText,
                        user?.preferredLanguage === lang && styles.languageOptionTextActive,
                      ]}
                    >
                      {LANGUAGES[lang].nativeName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>🔔</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Notifications</Text>
              <Text style={styles.menuItemSubtitle}>Configure push notifications</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>🔒</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Privacy & Security</Text>
              <Text style={styles.menuItemSubtitle}>Manage your data</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Support</Text>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>❓</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Help Center</Text>
              <Text style={styles.menuItemSubtitle}>FAQ and support</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>💬</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Contact Us</Text>
              <Text style={styles.menuItemSubtitle}>Get in touch</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>📄</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Terms & Privacy</Text>
              <Text style={styles.menuItemSubtitle}>Legal information</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.surface,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    color: COLORS.text.inverse,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginTop: 1,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  menuSection: {
    backgroundColor: COLORS.surface,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  menuSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  menuItemIcon: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    width: 40,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  menuItemSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  menuItemArrow: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.text.disabled,
  },
  languageSection: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  languageContent: {
    flex: 1,
  },
  languageOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  languageOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  languageOptionActive: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  languageOptionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  languageOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  signOutButton: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.error,
  },
  versionText: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.disabled,
    marginTop: SPACING.xl,
  },
  notAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarIcon: {
    fontSize: 48,
  },
  notAuthTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  notAuthSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  signInButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  signInButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
  },
});
