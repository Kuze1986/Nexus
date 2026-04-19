import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase, normalizeError } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [institutionUser, setInstitutionUser] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  const navigateToLogin = useCallback(() => {
    const authUrl = import.meta.env.VITE_NEXUS_AUTH_URL;
    if (!authUrl) {
      return;
    }

    const redirectTo = encodeURIComponent(window.location.href);
    const separator = authUrl.includes('?') ? '&' : '?';
    window.location.assign(`${authUrl}${separator}redirect_to=${redirectTo}`);
  }, []);

  const applyAuthRequired = useCallback(() => {
    setUser(null);
    setInstitutionUser(null);
    setInstitution(null);
    setLicenses([]);
    setIsAuthenticated(false);
    setAuthError({
      type: 'auth_required',
      message: 'Authentication required',
    });
  }, []);

  const hydrateAccess = useCallback(async (sessionUser) => {
    const { data, error } = await supabase.schema('nexus').rpc('get_my_access');
    if (error) {
      throw normalizeError(error, 'Failed to load access context');
    }

    const access = Array.isArray(data) ? data[0] : data;
    if (!access) {
      throw normalizeError(null, 'Access context unavailable', 403);
    }

    setUser(access.user ?? sessionUser ?? null);
    setInstitutionUser(access.institution_user ?? access.institutionUser ?? null);
    setInstitution(access.institution ?? null);
    setLicenses(access.licenses ?? []);
    setIsAuthenticated(true);
    setAuthError(null);
  }, []);

  const checkAppState = useCallback(async () => {
    try {
      setIsLoadingAuth(true);
      setIsLoadingPublicSettings(true);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        throw normalizeError(sessionError, 'Failed to read session');
      }

      const session = sessionData?.session;
      if (!session?.user) {
        applyAuthRequired();
        return;
      }

      await hydrateAccess(session.user);
    } catch (error) {
      const normalized = normalizeError(error, 'An unexpected error occurred');
      if (normalized.status === 401 || normalized.status === 403) {
        applyAuthRequired();
        return;
      }

      setAuthError({
        type: 'unknown',
        message: normalized.message,
      });
      setIsAuthenticated(false);
    } finally {
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  }, [applyAuthRequired, hydrateAccess]);

  useEffect(() => {
    checkAppState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoadingAuth(true);

      if (!session?.user) {
        applyAuthRequired();
        setIsLoadingAuth(false);
        return;
      }

      try {
        await hydrateAccess(session.user);
      } catch (error) {
        const normalized = normalizeError(error, 'Failed to refresh authenticated user');
        if (normalized.status === 401 || normalized.status === 403) {
          applyAuthRequired();
        } else {
          setAuthError({
            type: 'unknown',
            message: normalized.message,
          });
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoadingAuth(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [applyAuthRequired, checkAppState, hydrateAccess]);

  const logout = async (shouldRedirect = true) => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw normalizeError(error, 'Failed to sign out');
    }

    applyAuthRequired();

    if (shouldRedirect) {
      const authUrl = import.meta.env.VITE_NEXUS_AUTH_URL;
      if (authUrl) {
        window.location.assign(authUrl);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      institutionUser,
      institution,
      licenses,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
