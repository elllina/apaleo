import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  CreditBalance,
  CreditTransaction,
  CreditPackage,
  Subscription,
  SubscriptionPlan,
  FamilyMember,
  ApiResponse,
  PaginatedResponse,
  User,
} from '../types';
import { SHM_API_URL } from '../utils/constants';
import { getValidAccessToken } from './auth';

// Create Axios instance for SHM Backend API
const shmClient: AxiosInstance = axios.create({
  baseURL: SHM_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
shmClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getValidAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// ============================================
// User API
// ============================================

/**
 * Get or create SHM user profile
 */
export async function getOrCreateUser(userData: {
  apaleoId: string;
  email: string;
  firstName: string;
  lastName: string;
}): Promise<User> {
  const response = await shmClient.post<ApiResponse<User>>('/users/sync', userData);
  return response.data.data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(updates: Partial<User>): Promise<User> {
  const response = await shmClient.patch<ApiResponse<User>>('/users/me', updates);
  return response.data.data;
}

/**
 * Update user language preference
 */
export async function updateLanguage(language: 'en' | 'ru' | 'hy'): Promise<void> {
  await shmClient.patch('/users/me/language', { language });
}

// ============================================
// Credits API
// ============================================

/**
 * Get current user's credit balance
 */
export async function getCreditBalance(): Promise<CreditBalance> {
  const response = await shmClient.get<ApiResponse<CreditBalance>>('/credits/balance');
  return response.data.data;
}

/**
 * Get credit transaction history
 */
export async function getCreditTransactions(params?: {
  type?: CreditTransaction['type'];
  pageNumber?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<CreditTransaction>> {
  const response = await shmClient.get<PaginatedResponse<CreditTransaction>>('/credits/transactions', {
    params: {
      type: params?.type,
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 20,
    },
  });
  return response.data;
}

/**
 * Get available credit packages
 */
export async function getCreditPackages(): Promise<CreditPackage[]> {
  const response = await shmClient.get<ApiResponse<CreditPackage[]>>('/credits/packages');
  return response.data.data;
}

/**
 * Purchase credits
 */
export async function purchaseCredits(params: {
  packageId: string;
  paymentMethod: 'card' | 'mir' | 'apple_pay' | 'google_pay';
  currency: 'EUR' | 'RUB' | 'AMD';
}): Promise<{
  transactionId: string;
  paymentUrl?: string;
  credits: number;
}> {
  const response = await shmClient.post('/credits/purchase', params);
  return response.data.data;
}

/**
 * Spend credits (for booking)
 */
export async function spendCredits(params: {
  amount: number;
  bookingId: string;
  description: string;
}): Promise<CreditTransaction> {
  const response = await shmClient.post<ApiResponse<CreditTransaction>>('/credits/spend', params);
  return response.data.data;
}

/**
 * Transfer credits to family member
 */
export async function transferCredits(params: {
  toUserId: string;
  amount: number;
}): Promise<CreditTransaction> {
  const response = await shmClient.post<ApiResponse<CreditTransaction>>('/credits/transfer', params);
  return response.data.data;
}

// ============================================
// Subscription API
// ============================================

/**
 * Get available subscription plans
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const response = await shmClient.get<ApiResponse<SubscriptionPlan[]>>('/subscriptions/plans');
  return response.data.data;
}

/**
 * Get current user's subscription
 */
export async function getCurrentSubscription(): Promise<Subscription | null> {
  try {
    const response = await shmClient.get<ApiResponse<Subscription>>('/subscriptions/current');
    return response.data.data;
  } catch {
    return null;
  }
}

/**
 * Subscribe to a plan
 */
export async function subscribe(params: {
  planId: string;
  paymentMethod: 'card' | 'mir' | 'apple_pay' | 'google_pay';
  currency: 'EUR' | 'RUB' | 'AMD';
}): Promise<{
  subscriptionId: string;
  paymentUrl?: string;
}> {
  const response = await shmClient.post('/subscriptions/subscribe', params);
  return response.data.data;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(): Promise<void> {
  await shmClient.post('/subscriptions/cancel');
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateSubscription(): Promise<Subscription> {
  const response = await shmClient.post<ApiResponse<Subscription>>('/subscriptions/reactivate');
  return response.data.data;
}

/**
 * Change subscription plan
 */
export async function changeSubscriptionPlan(newPlanId: string): Promise<Subscription> {
  const response = await shmClient.post<ApiResponse<Subscription>>('/subscriptions/change-plan', {
    planId: newPlanId,
  });
  return response.data.data;
}

// ============================================
// Family Sharing API
// ============================================

/**
 * Get family members
 */
export async function getFamilyMembers(): Promise<FamilyMember[]> {
  const response = await shmClient.get<ApiResponse<FamilyMember[]>>('/family/members');
  return response.data.data;
}

/**
 * Invite family member
 */
export async function inviteFamilyMember(email: string): Promise<FamilyMember> {
  const response = await shmClient.post<ApiResponse<FamilyMember>>('/family/invite', { email });
  return response.data.data;
}

/**
 * Accept family invitation
 */
export async function acceptFamilyInvitation(invitationId: string): Promise<FamilyMember> {
  const response = await shmClient.post<ApiResponse<FamilyMember>>(`/family/accept/${invitationId}`);
  return response.data.data;
}

/**
 * Remove family member
 */
export async function removeFamilyMember(memberId: string): Promise<void> {
  await shmClient.delete(`/family/members/${memberId}`);
}

/**
 * Update family member's credit limit
 */
export async function updateFamilyMemberLimit(
  memberId: string,
  creditLimit: number
): Promise<FamilyMember> {
  const response = await shmClient.patch<ApiResponse<FamilyMember>>(`/family/members/${memberId}`, {
    sharedCreditsLimit: creditLimit,
  });
  return response.data.data;
}

/**
 * Leave family (as a member)
 */
export async function leaveFamily(): Promise<void> {
  await shmClient.post('/family/leave');
}

// ============================================
// Booking Sync API
// ============================================

/**
 * Sync a booking from Apaleo to SHM
 */
export async function syncBooking(params: {
  apaleoBookingId: string;
  propertyId: string;
  creditsUsed: number;
  totalAmount: number;
  currency: string;
}): Promise<{
  shmBookingId: string;
  status: string;
}> {
  const response = await shmClient.post('/bookings/sync', params);
  return response.data.data;
}

/**
 * Get SHM booking by Apaleo booking ID
 */
export async function getShmBooking(apaleoBookingId: string): Promise<{
  shmBookingId: string;
  apaleoBookingId: string;
  creditsUsed: number;
  status: string;
  createdAt: string;
} | null> {
  try {
    const response = await shmClient.get(`/bookings/by-apaleo/${apaleoBookingId}`);
    return response.data.data;
  } catch {
    return null;
  }
}

// Export the client for custom requests
export { shmClient };
