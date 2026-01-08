import { create } from 'zustand';
import {
  CreditBalance,
  CreditTransaction,
  CreditPackage,
  Subscription,
  SubscriptionPlan,
  FamilyMember,
} from '../types';
import {
  getCreditBalance,
  getCreditTransactions,
  getCreditPackages,
  purchaseCredits,
  transferCredits,
  getSubscriptionPlans,
  getCurrentSubscription,
  subscribe,
  cancelSubscription,
  reactivateSubscription,
  changeSubscriptionPlan,
  getFamilyMembers,
  inviteFamilyMember,
  removeFamilyMember,
  updateFamilyMemberLimit,
  leaveFamily,
} from '../api/shm';

interface CreditsState {
  // Credits state
  balance: CreditBalance | null;
  transactions: CreditTransaction[];
  packages: CreditPackage[];

  // Subscription state
  subscription: Subscription | null;
  plans: SubscriptionPlan[];

  // Family state
  familyMembers: FamilyMember[];

  // Loading state
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;

  // Credits actions
  loadBalance: () => Promise<void>;
  loadTransactions: (type?: CreditTransaction['type']) => Promise<void>;
  loadPackages: () => Promise<void>;
  buyCredits: (params: {
    packageId: string;
    paymentMethod: 'card' | 'mir' | 'apple_pay' | 'google_pay';
    currency: 'EUR' | 'RUB' | 'AMD';
  }) => Promise<{ paymentUrl?: string }>;
  sendCredits: (toUserId: string, amount: number) => Promise<void>;

  // Subscription actions
  loadSubscription: () => Promise<void>;
  loadPlans: () => Promise<void>;
  subscribeToPlan: (params: {
    planId: string;
    paymentMethod: 'card' | 'mir' | 'apple_pay' | 'google_pay';
    currency: 'EUR' | 'RUB' | 'AMD';
  }) => Promise<{ paymentUrl?: string }>;
  cancelSub: () => Promise<void>;
  reactivateSub: () => Promise<void>;
  changePlan: (newPlanId: string) => Promise<void>;

  // Family actions
  loadFamily: () => Promise<void>;
  inviteMember: (email: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateMemberLimit: (memberId: string, limit: number) => Promise<void>;
  exitFamily: () => Promise<void>;

  // Utils
  refreshAll: () => Promise<void>;
  clearError: () => void;
}

export const useCreditsStore = create<CreditsState>((set, get) => ({
  // Initial state
  balance: null,
  transactions: [],
  packages: [],
  subscription: null,
  plans: [],
  familyMembers: [],
  isLoading: false,
  isProcessing: false,
  error: null,

  // Load credit balance
  loadBalance: async () => {
    try {
      set({ isLoading: true, error: null });
      const balance = await getCreditBalance();
      set({ balance, isLoading: false });
    } catch (error) {
      console.error('Error loading balance:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load balance',
      });
    }
  },

  // Load transaction history
  loadTransactions: async (type?: CreditTransaction['type']) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getCreditTransactions({ type, pageSize: 50 });
      set({ transactions: response.items, isLoading: false });
    } catch (error) {
      console.error('Error loading transactions:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load transactions',
      });
    }
  },

  // Load credit packages
  loadPackages: async () => {
    try {
      set({ isLoading: true, error: null });
      const packages = await getCreditPackages();
      set({ packages, isLoading: false });
    } catch (error) {
      console.error('Error loading packages:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load packages',
      });
    }
  },

  // Purchase credits
  buyCredits: async ({ packageId, paymentMethod, currency }) => {
    try {
      set({ isProcessing: true, error: null });
      const result = await purchaseCredits({ packageId, paymentMethod, currency });

      // Refresh balance after purchase
      await get().loadBalance();

      set({ isProcessing: false });
      return { paymentUrl: result.paymentUrl };
    } catch (error) {
      console.error('Error purchasing credits:', error);
      set({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Purchase failed',
      });
      throw error;
    }
  },

  // Transfer credits
  sendCredits: async (toUserId: string, amount: number) => {
    try {
      set({ isProcessing: true, error: null });
      await transferCredits({ toUserId, amount });

      // Refresh balance and transactions
      await Promise.all([get().loadBalance(), get().loadTransactions()]);

      set({ isProcessing: false });
    } catch (error) {
      console.error('Error transferring credits:', error);
      set({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Transfer failed',
      });
      throw error;
    }
  },

  // Load current subscription
  loadSubscription: async () => {
    try {
      set({ isLoading: true, error: null });
      const subscription = await getCurrentSubscription();
      set({ subscription, isLoading: false });
    } catch (error) {
      console.error('Error loading subscription:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load subscription',
      });
    }
  },

  // Load subscription plans
  loadPlans: async () => {
    try {
      set({ isLoading: true, error: null });
      const plans = await getSubscriptionPlans();
      set({ plans, isLoading: false });
    } catch (error) {
      console.error('Error loading plans:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load plans',
      });
    }
  },

  // Subscribe to a plan
  subscribeToPlan: async ({ planId, paymentMethod, currency }) => {
    try {
      set({ isProcessing: true, error: null });
      const result = await subscribe({ planId, paymentMethod, currency });

      // Refresh subscription
      await get().loadSubscription();

      set({ isProcessing: false });
      return { paymentUrl: result.paymentUrl };
    } catch (error) {
      console.error('Error subscribing:', error);
      set({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Subscription failed',
      });
      throw error;
    }
  },

  // Cancel subscription
  cancelSub: async () => {
    try {
      set({ isProcessing: true, error: null });
      await cancelSubscription();
      await get().loadSubscription();
      set({ isProcessing: false });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      set({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Cancellation failed',
      });
      throw error;
    }
  },

  // Reactivate subscription
  reactivateSub: async () => {
    try {
      set({ isProcessing: true, error: null });
      const subscription = await reactivateSubscription();
      set({ subscription, isProcessing: false });
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      set({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Reactivation failed',
      });
      throw error;
    }
  },

  // Change subscription plan
  changePlan: async (newPlanId: string) => {
    try {
      set({ isProcessing: true, error: null });
      const subscription = await changeSubscriptionPlan(newPlanId);
      set({ subscription, isProcessing: false });
    } catch (error) {
      console.error('Error changing plan:', error);
      set({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Plan change failed',
      });
      throw error;
    }
  },

  // Load family members
  loadFamily: async () => {
    try {
      set({ isLoading: true, error: null });
      const familyMembers = await getFamilyMembers();
      set({ familyMembers, isLoading: false });
    } catch (error) {
      console.error('Error loading family:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load family',
      });
    }
  },

  // Invite family member
  inviteMember: async (email: string) => {
    try {
      set({ isProcessing: true, error: null });
      await inviteFamilyMember(email);
      await get().loadFamily();
      set({ isProcessing: false });
    } catch (error) {
      console.error('Error inviting member:', error);
      set({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Invitation failed',
      });
      throw error;
    }
  },

  // Remove family member
  removeMember: async (memberId: string) => {
    try {
      set({ isProcessing: true, error: null });
      await removeFamilyMember(memberId);
      await get().loadFamily();
      set({ isProcessing: false });
    } catch (error) {
      console.error('Error removing member:', error);
      set({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Removal failed',
      });
      throw error;
    }
  },

  // Update family member's credit limit
  updateMemberLimit: async (memberId: string, limit: number) => {
    try {
      set({ isProcessing: true, error: null });
      await updateFamilyMemberLimit(memberId, limit);
      await get().loadFamily();
      set({ isProcessing: false });
    } catch (error) {
      console.error('Error updating limit:', error);
      set({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Update failed',
      });
      throw error;
    }
  },

  // Leave family (as a member)
  exitFamily: async () => {
    try {
      set({ isProcessing: true, error: null });
      await leaveFamily();
      set({ familyMembers: [], isProcessing: false });
    } catch (error) {
      console.error('Error leaving family:', error);
      set({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Leave failed',
      });
      throw error;
    }
  },

  // Refresh all data
  refreshAll: async () => {
    await Promise.all([
      get().loadBalance(),
      get().loadTransactions(),
      get().loadSubscription(),
      get().loadFamily(),
    ]);
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
