import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { CreditBalance as CreditBalanceType } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../utils/constants';
import { formatCredits } from '../utils/helpers';

interface CreditBalanceProps {
  balance: CreditBalanceType | null;
  onAddCredits?: () => void;
  compact?: boolean;
}

export function CreditBalance({
  balance,
  onAddCredits,
  compact = false,
}: CreditBalanceProps) {
  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onAddCredits}
        activeOpacity={0.8}
      >
        <Text style={styles.compactIcon}>💳</Text>
        <Text style={styles.compactBalance}>
          {balance ? balance.balance.toLocaleString() : '---'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Credits Balance</Text>
        {onAddCredits && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddCredits}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.currencyIcon}>💳</Text>
        <Text style={styles.balanceAmount}>
          {balance ? balance.balance.toLocaleString() : '---'}
        </Text>
        <Text style={styles.balanceLabel}>credits</Text>
      </View>

      {balance && balance.pendingCredits > 0 && (
        <View style={styles.pendingContainer}>
          <Text style={styles.pendingText}>
            + {formatCredits(balance.pendingCredits)} pending
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          1 credit = 1 EUR
        </Text>
      </View>
    </View>
  );
}

interface CreditDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function CreditDisplay({
  amount,
  size = 'md',
  showIcon = true,
}: CreditDisplayProps) {
  const fontSize = {
    sm: TYPOGRAPHY.fontSize.sm,
    md: TYPOGRAPHY.fontSize.md,
    lg: TYPOGRAPHY.fontSize.xl,
  }[size];

  return (
    <View style={styles.creditDisplay}>
      {showIcon && <Text style={[styles.creditIcon, { fontSize }]}>💳</Text>}
      <Text style={[styles.creditAmount, { fontSize }]}>
        {amount.toLocaleString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  addButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
  },
  currencyIcon: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    marginRight: SPACING.sm,
  },
  balanceAmount: {
    fontSize: TYPOGRAPHY.fontSize['5xl'],
    fontWeight: '700',
    color: COLORS.text.inverse,
  },
  balanceLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: SPACING.sm,
  },
  pendingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  pendingText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: SPACING.md,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  compactIcon: {
    fontSize: TYPOGRAPHY.fontSize.md,
    marginRight: SPACING.xs,
  },
  compactBalance: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
  },
  // Credit Display styles
  creditDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creditIcon: {
    marginRight: SPACING.xs,
  },
  creditAmount: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
