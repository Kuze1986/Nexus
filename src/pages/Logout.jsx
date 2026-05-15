import { useEffect, useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { getRedirectTarget, redirectTo } from '@/lib/redirect';

export default function Logout() {
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.signOut().then(({ error: signOutError }) => {
      if (signOutError) {
        setError(signOutError.message);
        return;
      }
      // After sign-out, redirect to the default landing (or redirect_to if provided)
      const target = getRedirectTarget();
      redirectTo(target);
    });
  }, []);

  if (error) {
    return (
      <main className="min-h-screen bg-[#080C14] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.assign('/')}
            className="text-xs text-slate-400 hover:text-white transition-colors underline"
          >
            Return to sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080C14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Signing out…</p>
      </div>
    </main>
  );
}
