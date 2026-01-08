import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { AuthTokens, User } from '../types';
import { APALEO_AUTH_URL, APALEO_CLIENT_ID, APALEO_REDIRECT_URI, STORAGE_KEYS } from '../utils/constants';

// Enable web browser for OAuth
WebBrowser.maybeCompleteAuthSession();

// Apaleo OAuth discovery document
const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: `${APALEO_AUTH_URL}/connect/authorize`,
  tokenEndpoint: `${APALEO_AUTH_URL}/connect/token`,
  revocationEndpoint: `${APALEO_AUTH_URL}/connect/revocation`,
  userInfoEndpoint: `${APALEO_AUTH_URL}/connect/userinfo`,
};

// OAuth scopes required for the app
const SCOPES = [
  'openid',
  'profile',
  'email',
  'offline_access',
  'reservations.read',
  'reservations.manage',
  'offers.read',
  'availability.read',
  'properties.read',
  'rateplans.read',
  'services.read',
  'folios.read',
  'folios.manage',
];

/**
 * Create the OAuth request for Apaleo
 */
export function useApaleoAuthRequest() {
  return AuthSession.useAuthRequest(
    {
      clientId: APALEO_CLIENT_ID,
      scopes: SCOPES,
      redirectUri: APALEO_REDIRECT_URI,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<AuthTokens> {
  const tokenResponse = await AuthSession.exchangeCodeAsync(
    {
      clientId: APALEO_CLIENT_ID,
      code,
      redirectUri: APALEO_REDIRECT_URI,
      extraParams: {
        code_verifier: codeVerifier,
      },
    },
    discovery
  );

  const tokens: AuthTokens = {
    accessToken: tokenResponse.accessToken,
    refreshToken: tokenResponse.refreshToken ?? '',
    expiresAt: tokenResponse.expiresIn
      ? Date.now() + tokenResponse.expiresIn * 1000
      : Date.now() + 3600 * 1000,
    tokenType: tokenResponse.tokenType ?? 'Bearer',
  };

  await saveTokens(tokens);
  return tokens;
}

/**
 * Refresh the access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  const tokenResponse = await AuthSession.refreshAsync(
    {
      clientId: APALEO_CLIENT_ID,
      refreshToken,
    },
    discovery
  );

  const tokens: AuthTokens = {
    accessToken: tokenResponse.accessToken,
    refreshToken: tokenResponse.refreshToken ?? refreshToken,
    expiresAt: tokenResponse.expiresIn
      ? Date.now() + tokenResponse.expiresIn * 1000
      : Date.now() + 3600 * 1000,
    tokenType: tokenResponse.tokenType ?? 'Bearer',
  };

  await saveTokens(tokens);
  return tokens;
}

/**
 * Revoke tokens (logout)
 */
export async function revokeTokens(token: string): Promise<void> {
  try {
    await AuthSession.revokeAsync(
      {
        clientId: APALEO_CLIENT_ID,
        token,
      },
      discovery
    );
  } catch (error) {
    console.error('Failed to revoke token:', error);
  }
  await clearTokens();
}

/**
 * Save tokens to secure storage
 */
export async function saveTokens(tokens: AuthTokens): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(tokens));
}

/**
 * Load tokens from secure storage
 */
export async function loadTokens(): Promise<AuthTokens | null> {
  const tokensStr = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKENS);
  if (!tokensStr) return null;

  try {
    return JSON.parse(tokensStr) as AuthTokens;
  } catch {
    return null;
  }
}

/**
 * Clear tokens from secure storage
 */
export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKENS);
}

/**
 * Check if tokens are valid and not expired
 */
export function isTokenValid(tokens: AuthTokens | null): boolean {
  if (!tokens) return false;
  // Add 60 second buffer before expiry
  return tokens.expiresAt > Date.now() + 60000;
}

/**
 * Get a valid access token (refresh if needed)
 */
export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await loadTokens();

  if (!tokens) return null;

  if (isTokenValid(tokens)) {
    return tokens.accessToken;
  }

  // Try to refresh
  if (tokens.refreshToken) {
    try {
      const newTokens = await refreshAccessToken(tokens.refreshToken);
      return newTokens.accessToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await clearTokens();
      return null;
    }
  }

  return null;
}

/**
 * Save user data to secure storage
 */
export async function saveUser(user: User): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
}

/**
 * Load user data from secure storage
 */
export async function loadUser(): Promise<User | null> {
  const userStr = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

/**
 * Clear user data from secure storage
 */
export async function clearUser(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
}

/**
 * Fetch user info from Apaleo
 */
export async function fetchUserInfo(accessToken: string): Promise<Partial<User>> {
  const response = await fetch(discovery.userInfoEndpoint!, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  const data = await response.json();

  return {
    id: data.sub,
    email: data.email,
    firstName: data.given_name ?? '',
    lastName: data.family_name ?? '',
  };
}

/**
 * Complete logout process
 */
export async function logout(): Promise<void> {
  const tokens = await loadTokens();
  if (tokens?.accessToken) {
    await revokeTokens(tokens.accessToken);
  }
  await clearTokens();
  await clearUser();
}
