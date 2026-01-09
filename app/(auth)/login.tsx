import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApaleoAuth } from '../../src/hooks/useApaleo';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../src/utils/constants';

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isReady, error, signIn, signInDemo } = useApaleoAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.back();
    }
  }, [isAuthenticated, router]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🏨</Text>
          <Text style={styles.appName}>SHM</Text>
          <Text style={styles.appTagline}>Smart Hotel Management</Text>
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSubtitle}>
            Sign in to access your bookings, credits, and more
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Sign In Button */}
        <TouchableOpacity
          style={[styles.signInButton, (!isReady || isLoading) && styles.signInButtonDisabled]}
          onPress={signIn}
          disabled={!isReady || isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.text.inverse} />
          ) : (
            <>
              <Text style={styles.signInIcon}>🔐</Text>
              <Text style={styles.signInText}>Sign in with Apaleo</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Demo Login Button */}
        <TouchableOpacity
          style={[styles.demoButton, isLoading && styles.demoButtonDisabled]}
          onPress={signInDemo}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <>
              <Text style={styles.demoIcon}>🧪</Text>
              <Text style={styles.demoText}>Continue with Demo Account</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.demoNote}>
          Use demo mode to explore the app with test data
        </Text>

        {/* Terms */}
        <Text style={styles.termsText}>
          By signing in, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>

      {/* Skip for now */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => router.back()}
      >
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING['2xl'],
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  },
  logo: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  appTagline: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  welcomeTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  welcomeSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.md * TYPOGRAPHY.lineHeight.relaxed,
  },
  errorContainer: {
    backgroundColor: COLORS.error + '15',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center',
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  signInButtonDisabled: {
    backgroundColor: COLORS.primary + '80',
  },
  signInIcon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    marginRight: SPACING.sm,
  },
  signInText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginHorizontal: SPACING.md,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: SPACING.md,
  },
  demoButtonDisabled: {
    opacity: 0.6,
  },
  demoIcon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    marginRight: SPACING.sm,
  },
  demoText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
  },
  demoNote: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.disabled,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  termsText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.xs * TYPOGRAPHY.lineHeight.relaxed,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  skipButton: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
});
