import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Nexus is a cross-domain SSO gateway — PKCE cannot work here because the
// code_verifier is stored in Nexus's localStorage but OAuth callbacks may
// land on a different app's domain. Implicit flow returns tokens directly
// in the URL hash so no cross-domain storage lookup is needed.
export const supabase = createClient(
  SUPABASE_URL || 'https://not-configured.invalid',
  SUPABASE_ANON_KEY || 'placeholder',
  { auth: { flowType: 'implicit' } }
);
