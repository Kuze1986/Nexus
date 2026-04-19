import { useEffect, useMemo, useState } from 'react';
import { supabase } from './api/supabaseClient';

const getRedirectTarget = () => {
  const params = new URLSearchParams(window.location.search);
  const redirectTo = params.get('redirect_to');

  return redirectTo || import.meta.env.VITE_DEFAULT_APP_URL || window.location.origin;
};

const redirectToTarget = () => {
  window.location.assign(getRedirectTarget());
};

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const redirectTarget = useMemo(() => getRedirectTarget(), []);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (sessionError) {
        setError(sessionError.message ?? 'Failed to check session');
        setIsCheckingSession(false);
        return;
      }

      if (data?.session) {
        redirectToTarget();
        return;
      }

      setIsCheckingSession(false);
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMagicLinkSent(false);
    setIsLoading(true);

    try {
      if (useMagicLink) {
        const { error: magicError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectTarget,
          },
        });

        if (magicError) {
          throw magicError;
        }

        setMagicLinkSent(true);
      } else {
        const { error: passwordError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (passwordError) {
          throw passwordError;
        }

        redirectToTarget();
      }
    } catch (authError) {
      setError(authError?.message ?? 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <main className="min-h-screen bg-[#080C14] text-white flex items-center justify-center px-6">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080C14] text-white flex items-center justify-center px-6">
      <section className="max-w-md w-full">
        <header className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60 mb-3">NEXUS</p>
          <h1 className="text-3xl font-semibold mb-2">Sign in to NEXUS</h1>
          <p className="text-slate-400 text-sm">Access your institution dashboard securely.</p>
        </header>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm text-white/90 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="you@institution.com"
                required
              />
            </div>

            {!useMagicLink && (
              <div>
                <label htmlFor="password" className="block text-sm text-white/90 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="••••••••"
                  required={!useMagicLink}
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setUseMagicLink((previous) => !previous);
                setError('');
                setMagicLinkSent(false);
              }}
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              {useMagicLink ? 'Use password instead' : 'Use magic link instead'}
            </button>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            {magicLinkSent && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-200 text-sm">
                Magic link sent. Check your email to continue.
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-white text-[#080C14] font-semibold py-2.5 hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Please wait...' : useMagicLink ? 'Send magic link' : 'Sign in'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default App;
