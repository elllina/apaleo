import { useCallback, useEffect } from 'react';
import { useCreditsStore } from '../store/creditsStore';
import { CreditTransaction } from '../types';

export function useCreditBalance() {
  const {
    balance,
    isLoading,
    error,
    loadBalance,
    clearError,
  } = useCreditsStore();

  useEffect(() => {
    if (!balance) {
      loadBalance();
    }
  }, [balance, loadBalance]);

  const refresh = useCallback(async () => {
    await loadBalance();
  }, [loadBalance]);

  return {
    balance,
    credits: balance?.balance ?? 0,
    pendingCredits: balance?.pendingCredits ?? 0,
    isLoading,
    error,
    refresh,
    clearError,
  };
}

export function useCreditTransactions(type?: CreditTransaction['type']) {
  const {
    transactions,
    isLoading,
    error,
    loadTransactions,
    clearError,
  } = useCreditsStore();

  useEffect(() => {
    loadTransactions(type);
  }, [type, loadTransactions]);

  const refresh = useCallback(async () => {
    await loadTransactions(type);
  }, [type, loadTransactions]);

  return {
    transactions,
    isLoading,
    error,
    refresh,
    clearError,
  };
}

export function useCreditPackages() {
  const {
    packages,
    isLoading,
    isProcessing,
    error,
    loadPackages,
    buyCredits,
    clearError,
  } = useCreditsStore();

  useEffect(() => {
    if (packages.length === 0) {
      loadPackages();
    }
  }, [packages.length, loadPackages]);

  const purchase = useCallback(
    async (params: {
      packageId: string;
      paymentMethod: 'card' | 'mir' | 'apple_pay' | 'google_pay';
      currency: 'EUR' | 'RUB' | 'AMD';
    }) => {
      return await buyCredits(params);
    },
    [buyCredits]
  );

  return {
    packages,
    isLoading,
    isProcessing,
    error,
    purchase,
    clearError,
  };
}

export function useCreditTransfer() {
  const {
    isProcessing,
    error,
    sendCredits,
    clearError,
  } = useCreditsStore();

  const transfer = useCallback(
    async (toUserId: string, amount: number) => {
      await sendCredits(toUserId, amount);
    },
    [sendCredits]
  );

  return {
    isProcessing,
    error,
    transfer,
    clearError,
  };
}

export function useSubscription() {
  const {
    subscription,
    plans,
    isLoading,
    isProcessing,
    error,
    loadSubscription,
    loadPlans,
    subscribeToPlan,
    cancelSub,
    reactivateSub,
    changePlan,
    clearError,
  } = useCreditsStore();

  useEffect(() => {
    loadSubscription();
    if (plans.length === 0) {
      loadPlans();
    }
  }, [loadSubscription, loadPlans, plans.length]);

  const subscribe = useCallback(
    async (params: {
      planId: string;
      paymentMethod: 'card' | 'mir' | 'apple_pay' | 'google_pay';
      currency: 'EUR' | 'RUB' | 'AMD';
    }) => {
      return await subscribeToPlan(params);
    },
    [subscribeToPlan]
  );

  const cancel = useCallback(async () => {
    await cancelSub();
  }, [cancelSub]);

  const reactivate = useCallback(async () => {
    await reactivateSub();
  }, [reactivateSub]);

  const change = useCallback(
    async (newPlanId: string) => {
      await changePlan(newPlanId);
    },
    [changePlan]
  );

  return {
    subscription,
    plans,
    isLoading,
    isProcessing,
    error,
    subscribe,
    cancel,
    reactivate,
    changePlan: change,
    clearError,
    isSubscribed: !!subscription && subscription.status === 'active',
  };
}

export function useFamily() {
  const {
    familyMembers,
    isLoading,
    isProcessing,
    error,
    loadFamily,
    inviteMember,
    removeMember,
    updateMemberLimit,
    exitFamily,
    clearError,
  } = useCreditsStore();

  useEffect(() => {
    loadFamily();
  }, [loadFamily]);

  const invite = useCallback(
    async (email: string) => {
      await inviteMember(email);
    },
    [inviteMember]
  );

  const remove = useCallback(
    async (memberId: string) => {
      await removeMember(memberId);
    },
    [removeMember]
  );

  const updateLimit = useCallback(
    async (memberId: string, limit: number) => {
      await updateMemberLimit(memberId, limit);
    },
    [updateMemberLimit]
  );

  const leave = useCallback(async () => {
    await exitFamily();
  }, [exitFamily]);

  const owner = familyMembers.find((m) => m.role === 'owner');
  const members = familyMembers.filter((m) => m.role === 'member');

  return {
    familyMembers,
    owner,
    members,
    isLoading,
    isProcessing,
    error,
    invite,
    remove,
    updateLimit,
    leave,
    clearError,
    hasFamily: familyMembers.length > 0,
    isOwner: owner !== undefined,
  };
}
