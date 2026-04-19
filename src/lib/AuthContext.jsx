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
    const redirectTo = encodeURIComponent(window.location.href);
    window.location.assign(`/login?redirect_to=${redirectTo}`);
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
      const normalized = normalizeError(error, 'Failed to load access context');
      const status = Number(normalized.status);
      if (status === 401 || status === 403) {
        throw normalized;
      }
      // RPC missing, RLS, or schema drift — still allow the session so the app can load
      setUser(sessionUser ?? null);
      setInstitutionUser(null);
      setInstitution(null);
      setLicenses([]);
      setIsAuthenticated(true);
      setAuthError(null);
      return;
    }

    const access = Array.isArray(data) ? data[0] : data;
    if (!access) {
      setUser(sessionUser ?? null);
      setInstitutionUser(null);
      setInstitution(null);
      setLicenses([]);
      setIsAuthenticated(true);
      setAuthError(null);
      return;
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
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Avoid racing duplicate `get_my_access` with `checkAppState()` on first paint;
      // that pair of concurrent calls can leave `isLoadingAuth` stuck or hang the UI.
      if (event === 'INITIAL_SESSION') {
        return;
      }

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
      window.location.assign('/login');
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
