import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/api/supabaseClient';
import { Lock } from 'lucide-react';

function resolveRedirectTarget() {
  const raw = new URLSearchParams(window.location.search).get('redirect_to');
  if (!raw) {
    return `${window.location.origin}/`;
  }
  let decoded;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return `${window.location.origin}/`;
  }
  if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
    return decoded;
  }
  if (decoded.startsWith('/')) {
    return `${window.location.origin}${decoded}`;
  }
  return `${window.location.origin}/${decoded}`;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkMode, setMagicLinkMode] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const redirectAfterAuth = useMemo(() => resolveRedirectTarget(), []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (cancelled) {
        return;
      }
      if (sessionError) {
        setError(sessionError.message ?? 'Could not verify session');
        setCheckingSession(false);
        return;
      }
      if (data?.session) {
        window.location.assign(redirectAfterAuth);
        return;
      }
      setCheckingSession(false);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [redirectAfterAuth]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMagicSent(false);
    setLoading(true);

    try {
      if (magicLinkMode) {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectAfterAuth,
          },
        });
        if (otpError) {
          throw otpError;
        }
        setMagicSent(true);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          throw signInError;
        }
        window.location.assign(redirectAfterAuth);
      }
    } catch (err) {
      setError(err?.message ?? 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#080C14] flex items-center justify-center px-6">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080C14] flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">NEXUS</h1>
          <p className="text-gray-400">Sign in to continue</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          <div className="flex rounded-lg border border-white/10 p-0.5 mb-6">
            <button
              type="button"
              onClick={() => {
                setMagicLinkMode(false);
                setError('');
                setMagicSent(false);
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                !magicLinkMode ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setMagicLinkMode(true);
                setError('');
                setMagicSent(false);
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                magicLinkMode ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Magic link
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-white mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                placeholder="you@institution.com"
                required
              />
            </div>

            {!magicLinkMode && (
              <div>
                <Label htmlFor="password" className="text-white mb-2 block">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="••••••••"
                  required={!magicLinkMode}
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {magicSent && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-200 text-sm">
                Check your email for a sign-in link.
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-lg bg-white text-gray-900 hover:bg-gray-100"
            >
              {loading
                ? 'Please wait...'
                : magicLinkMode
                  ? 'Send magic link'
                  : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
