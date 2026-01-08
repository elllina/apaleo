import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useCreditBalance, useCreditTransactions, useCreditPackages, useSubscription } from '../../src/hooks/useCredits';
import { CreditBalance } from '../../src/components/CreditBalance';
import { CreditTransaction, CreditPackage } from '../../src/types';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, SUBSCRIPTION_PLANS } from '../../src/utils/constants';
import { formatDate, formatCredits } from '../../src/utils/helpers';

type TabType = 'buy' | 'history' | 'subscription';

export default function WalletScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { balance, isLoading: balanceLoading, refresh: refreshBalance } = useCreditBalance();
  const { transactions, isLoading: transactionsLoading, refresh: refreshTransactions } = useCreditTransactions();
  const { packages, isProcessing, purchase } = useCreditPackages();
  const { subscription, plans, isSubscribed } = useSubscription();

  const [activeTab, setActiveTab] = useState<TabType>('buy');

  const handleRefresh = async () => {
    await Promise.all([refreshBalance(), refreshTransactions()]);
  };

  const handlePurchase = async (pkg: CreditPackage) => {
    try {
      const result = await purchase({
        packageId: pkg.id,
        paymentMethod: 'card',
        currency: 'EUR',
      });
      if (result.paymentUrl) {
        // Handle payment URL (open in browser)
        console.log('Payment URL:', result.paymentUrl);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const getTransactionIcon = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'purchase': return '💳';
      case 'spend': return '🏨';
      case 'refund': return '↩️';
      case 'transfer': return '👥';
      case 'bonus': return '🎁';
      default: return '💰';
    }
  };

  const getTransactionColor = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'purchase':
      case 'refund':
      case 'bonus':
        return COLORS.success;
      case 'spend':
      case 'transfer':
        return COLORS.error;
      default:
        return COLORS.text.primary;
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.notAuthContainer}>
          <Text style={styles.notAuthIcon}>💳</Text>
          <Text style={styles.notAuthTitle}>Sign in to manage credits</Text>
          <Text style={styles.notAuthSubtitle}>
            Buy credits, view transactions, and manage subscriptions
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={balanceLoading || transactionsLoading}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Balance Card */}
        <View style={styles.balanceSection}>
          <CreditBalance balance={balance} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['buy', 'history', 'subscription'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'buy' ? 'Buy Credits' : tab === 'history' ? 'History' : 'Plan'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'buy' && (
          <View style={styles.packagesContainer}>
            <Text style={styles.sectionTitle}>Credit Packages</Text>
            {packages.length === 0 ? (
              // Demo packages when API not connected
              <>
                {[
                  { id: '1', credits: 50, priceEur: 50, bonusCredits: 0, isPopular: false },
                  { id: '2', credits: 100, priceEur: 95, bonusCredits: 5, isPopular: true },
                  { id: '3', credits: 250, priceEur: 225, bonusCredits: 25, isPopular: false },
                  { id: '4', credits: 500, priceEur: 425, bonusCredits: 75, isPopular: false },
                ].map((pkg) => (
                  <TouchableOpacity
                    key={pkg.id}
                    style={[styles.packageCard, pkg.isPopular && styles.packageCardPopular]}
                    onPress={() => handlePurchase(pkg as CreditPackage)}
                    disabled={isProcessing}
                  >
                    {pkg.isPopular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>Popular</Text>
                      </View>
                    )}
                    <View style={styles.packageInfo}>
                      <Text style={styles.packageCredits}>{pkg.credits} credits</Text>
                      {pkg.bonusCredits > 0 && (
                        <Text style={styles.packageBonus}>+{pkg.bonusCredits} bonus</Text>
                      )}
                    </View>
                    <Text style={styles.packagePrice}>€{pkg.priceEur}</Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              packages.map((pkg) => (
                <TouchableOpacity
                  key={pkg.id}
                  style={[styles.packageCard, pkg.isPopular && styles.packageCardPopular]}
                  onPress={() => handlePurchase(pkg)}
                  disabled={isProcessing}
                >
                  {pkg.isPopular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>Popular</Text>
                    </View>
                  )}
                  <View style={styles.packageInfo}>
                    <Text style={styles.packageCredits}>{pkg.credits} credits</Text>
                    {pkg.bonusCredits > 0 && (
                      <Text style={styles.packageBonus}>+{pkg.bonusCredits} bonus</Text>
                    )}
                  </View>
                  <Text style={styles.packagePrice}>€{pkg.priceEur}</Text>
                </TouchableOpacity>
              ))
            )}
            <Text style={styles.paymentNote}>
              💳 We accept Visa, Mastercard, and MIR cards
            </Text>
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.historyContainer}>
            {transactions.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyText}>No transactions yet</Text>
              </View>
            ) : (
              transactions.map((tx) => (
                <View key={tx.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <Text style={styles.transactionIcon}>{getTransactionIcon(tx.type)}</Text>
                    <View>
                      <Text style={styles.transactionDescription}>{tx.description}</Text>
                      <Text style={styles.transactionDate}>{formatDate(tx.createdAt)}</Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      { color: getTransactionColor(tx.type) },
                    ]}
                  >
                    {tx.type === 'spend' || tx.type === 'transfer' ? '-' : '+'}
                    {formatCredits(tx.amount)}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'subscription' && (
          <View style={styles.subscriptionContainer}>
            {isSubscribed && subscription ? (
              <View style={styles.currentPlan}>
                <Text style={styles.currentPlanLabel}>Current Plan</Text>
                <Text style={styles.currentPlanName}>{subscription.plan.name}</Text>
                <Text style={styles.currentPlanCredits}>
                  {subscription.plan.monthlyCredits} credits/month
                </Text>
                <Text style={styles.currentPlanRenewal}>
                  Renews on {formatDate(subscription.currentPeriodEnd)}
                </Text>
              </View>
            ) : (
              <View style={styles.noSubscription}>
                <Text style={styles.noSubIcon}>⭐</Text>
                <Text style={styles.noSubTitle}>No active subscription</Text>
                <Text style={styles.noSubText}>Subscribe to get monthly credits and benefits</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Available Plans</Text>
            {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  subscription?.plan.tier === plan.id && styles.planCardActive,
                ]}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPrice}>€{plan.priceEur}/mo</Text>
                </View>
                <Text style={styles.planCredits}>{plan.monthlyCredits} credits/month</Text>
                <View style={styles.planFeatures}>
                  {plan.features.map((feature, index) => (
                    <Text key={index} style={styles.planFeature}>✓ {feature}</Text>
                  ))}
                </View>
                {subscription?.plan.tier !== plan.id && (
                  <TouchableOpacity style={styles.subscribePlanButton}>
                    <Text style={styles.subscribePlanText}>
                      {isSubscribed ? 'Switch Plan' : 'Subscribe'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
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
  balanceSection: {
    padding: SPACING.lg,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.text.inverse,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  packagesContainer: {
    paddingHorizontal: SPACING.lg,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  packageCardPopular: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  popularText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
  },
  packageInfo: {
    flex: 1,
  },
  packageCredits: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  packageBonus: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
    marginTop: SPACING.xs,
  },
  packagePrice: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  paymentNote: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
  },
  historyContainer: {
    paddingHorizontal: SPACING.lg,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    marginRight: SPACING.md,
  },
  transactionDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  transactionAmount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
  },
  subscriptionContainer: {
    paddingHorizontal: SPACING.lg,
  },
  currentPlan: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  currentPlanLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.xs,
  },
  currentPlanName: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.text.inverse,
    marginBottom: SPACING.sm,
  },
  currentPlanCredits: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.inverse,
    marginBottom: SPACING.xs,
  },
  currentPlanRenewal: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  noSubscription: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  noSubIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  noSubTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  noSubText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  planCardActive: {
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  planName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  planPrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.primary,
  },
  planCredits: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  planFeatures: {
    marginBottom: SPACING.md,
  },
  planFeature: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  subscribePlanButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  subscribePlanText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
  },
  notAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  notAuthIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
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
