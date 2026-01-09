import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { AuthTokens, User } from '../types';
import { APALEO_AUTH_URL, APALEO_CLIENT_ID, APALEO_CLIENT_SECRET, APALEO_REDIRECT_URI, STORAGE_KEYS } from '../utils/constants';

// Enable web browser for OAuth
WebBrowser.maybeCompleteAuthSession();

// Simple base64 encoding for credentials
function encodeBase64(str: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  for (let i = 0; i < str.length; i += 3) {
    const byte1 = str.charCodeAt(i);
    const byte2 = str.charCodeAt(i + 1);
    const byte3 = str.charCodeAt(i + 2);
    const enc1 = byte1 >> 2;
    const enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
    const enc3 = isNaN(byte2) ? 64 : ((byte2 & 15) << 2) | (byte3 >> 6);
    const enc4 = isNaN(byte3) ? 64 : byte3 & 63;
    output += chars.charAt(enc1) + chars.charAt(enc2) + chars.charAt(enc3) + chars.charAt(enc4);
  }
  return output;
}

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

/**
 * Get access token using Client Credentials flow (for server-to-server or testing)
 * This doesn't require user interaction but has limited access to user-specific data
 */
export async function getClientCredentialsToken(): Promise<AuthTokens> {
  const credentials = encodeBase64(`${APALEO_CLIENT_ID}:${APALEO_CLIENT_SECRET}`);

  const response = await fetch(`${APALEO_AUTH_URL}/connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get client credentials token: ${error}`);
  }

  const data = await response.json();

  const tokens: AuthTokens = {
    accessToken: data.access_token,
    refreshToken: '', // Client credentials don't have refresh tokens
    expiresAt: Date.now() + (data.expires_in * 1000),
    tokenType: data.token_type ?? 'Bearer',
  };

  await saveTokens(tokens);
  return tokens;
}

/**
 * Login with client credentials (for demo/testing without user OAuth)
 */
export async function loginWithClientCredentials(): Promise<AuthTokens> {
  const tokens = await getClientCredentialsToken();

  // Create a demo user since client credentials don't provide user info
  const demoUser: User = {
    id: 'demo-user',
    email: 'demo@shm-hotel.com',
    firstName: 'Demo',
    lastName: 'User',
    preferredLanguage: 'en',
    createdAt: new Date().toISOString(),
  };

  await saveUser(demoUser);
  return tokens;
}
