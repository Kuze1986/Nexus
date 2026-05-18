import { useEffect, useMemo, useState } from 'react';
import { supabase, isConfigured } from '@/api/supabaseClient';
import { getRedirectTarget, redirectWithSession } from '@/lib/redirect';

export default function Login() {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode]       = useState('password'); // 'password' | 'magic'
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [error, setError]     = useState('');
  const [magicSent, setMagicSent] = useState(false);

  // target is null when no redirect_to param AND no VITE_DEFAULT_APP_URL —
  // we just show the login form instead of redirecting to ourselves.
  const target = useMemo(() => getRedirectTarget(), []);

  useEffect(() => {
    if (!isConfigured) {
      setIsCheckingSession(false);
      return;
    }

    let mounted = true;

    // Check whether the user already has a valid session.
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;
      if (!sessionError && data?.session) {
        if (target) {
          redirectWithSession(target, data.session);
          return; // keep spinner while navigating away
        }
        // No safe redirect target — already logged in, show a message instead of looping.
      }
      setIsCheckingSession(false);
    });

    // Handle magic-link OTP callback arriving via the URL hash.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session && target) {
        redirectWithSession(target, session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe(); // ← was missing; caused duplicate subscriptions
    };
  }, [target]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMagicSent(false);
    setIsLoading(true);

    try {
      if (mode === 'magic') {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: target ?? window.location.origin },
        });
        if (otpError) throw otpError;
        setMagicSent(true);
      } else {
        const { data: pwData, error: pwError } = await supabase.auth.signInWithPassword({ email, password });
        if (pwError) throw pwError;
        if (target) {
          redirectWithSession(target, pwData.session);
        } else {
          // Signed in but nowhere to go — show a success state
          setMagicSent(true); // re-use the "check your email" slot with a different message
          setError('');
        }
      }
    } catch (err) {
      setError(err?.message ?? 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Error states ─────────────────────────────────────────────────────────

  if (!isConfigured) {
    return (
      <main className="min-h-screen bg-[#080C14] flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-red-300 text-sm">
            Supabase is not configured. Set{' '}
            <code className="text-white">VITE_SUPABASE_URL</code> and{' '}
            <code className="text-white">VITE_SUPABASE_ANON_KEY</code> in Railway
            and redeploy.
          </p>
        </div>
      </main>
    );
  }

  if (isCheckingSession) {
    return (
      <main className="min-h-screen bg-[#080C14] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </main>
    );
  }

  // ── Login form ────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[#080C14] text-white flex items-center justify-center px-6">
      <section className="max-w-md w-full">
        {/* Brand mark */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-white/20 mb-5">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
              <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50 mb-2">BioLoop Holdings</p>
          <h1 className="text-2xl font-semibold text-white">Sign in</h1>
          <p className="text-slate-400 text-sm mt-1">Access your BioLoop workspace</p>
        </header>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm text-white/80 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
              />
            </div>

            {mode === 'password' && (
              <div>
                <label htmlFor="password" className="block text-sm text-white/80 mb-1.5">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={mode === 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                />
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            {magicSent && (
              <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm">
                {mode === 'magic'
                  ? 'Magic link sent — check your email to continue.'
                  : 'Signed in successfully.'}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-white text-[#080C14] font-semibold py-2.5 text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Please wait…' : mode === 'magic' ? 'Send magic link' : 'Sign in'}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => { setMode(m => m === 'magic' ? 'password' : 'magic'); setError(''); setMagicSent(false); }}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              {mode === 'magic' ? 'Use password instead' : 'Use magic link instead'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-8">BioLoop Holdings — Confidential</p>
      </section>
    </main>
  );
}
