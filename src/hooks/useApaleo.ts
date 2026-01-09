import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useApaleoAuthRequest, loginWithClientCredentials } from '../api/auth';

export function useApaleoAuth() {
  const { isAuthenticated, isLoading, error, login, loginDemo, logout, initialize } = useAuthStore();
  const [request, response, promptAsync] = useApaleoAuthRequest();
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Handle OAuth response
  useEffect(() => {
    const handleResponse = async () => {
      if (response?.type === 'success' && response.params.code) {
        setIsProcessing(true);
        try {
          const codeVerifier = request?.codeVerifier;
          if (codeVerifier) {
            await login(response.params.code, codeVerifier);
          }
        } catch (err) {
          console.error('OAuth error:', err);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    handleResponse();
  }, [response, request?.codeVerifier, login]);

  const signIn = useCallback(async () => {
    if (!request) {
      console.error('OAuth request not ready');
      return;
    }
    await promptAsync();
  }, [request, promptAsync]);

  // Demo login using client credentials (for testing)
  const signInDemo = useCallback(async () => {
    setIsProcessing(true);
    try {
      await loginDemo();
    } catch (err) {
      console.error('Demo login error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [loginDemo]);

  const signOut = useCallback(async () => {
    await logout();
  }, [logout]);

  return {
    isAuthenticated,
    isLoading: isLoading || isProcessing,
    isReady: !!request,
    error,
    signIn,
    signInDemo,
    signOut,
  };
}

export function useAuthSession() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
  };
}
