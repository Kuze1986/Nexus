import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.');
}

const ENTITY_TABLE_OVERRIDES = {
  InstitutionUser: 'institution_users',
  Institution: 'institutions',
  LicenseRecord: 'license_records',
  SeatAllocation: 'seat_allocations',
  Announcement: 'announcements',
  SupportTicket: 'support_tickets',
  AuditLog: 'audit_log',
  PortalReport: 'portal_reports',
  ComplianceSnapshot: 'compliance_snapshots',
  UsageSummary: 'usage_summaries',
};

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const toSnakeCase = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();

const getTableName = (entityName) => ENTITY_TABLE_OVERRIDES[entityName] ?? toSnakeCase(entityName);

const normalizeError = (error, fallbackMessage = 'Request failed', fallbackStatus = 500) => {
  if (!error) {
    return {
      type: 'supabase_error',
      message: fallbackMessage,
      status: fallbackStatus,
      code: 'UNKNOWN_ERROR',
      data: null,
      details: null,
    };
  }

  return {
    type: 'supabase_error',
    message: error.message ?? fallbackMessage,
    status: error.status ?? fallbackStatus,
    code: error.code ?? 'SUPABASE_ERROR',
    data: error.data ?? null,
    details: error.details ?? error.hint ?? null,
  };
};

const throwIfError = (error, fallbackMessage, fallbackStatus) => {
  if (error) {
    throw normalizeError(error, fallbackMessage, fallbackStatus);
  }
};

const createEntityApi = (entityName) => {
  const table = getTableName(entityName);

  return {
    async list() {
      const { data, error } = await supabase.schema('nexus').from(table).select('*');
      throwIfError(error, `Failed to list ${entityName}`);
      return data ?? [];
    },

    async filter(filters = {}) {
      let query = supabase.schema('nexus').from(table).select('*');

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;
      throwIfError(error, `Failed to filter ${entityName}`);
      return data ?? [];
    },

    async create(payload) {
      const { data, error } = await supabase
        .schema('nexus')
        .from(table)
        .insert(payload)
        .select('*')
        .single();
      throwIfError(error, `Failed to create ${entityName}`);
      return data;
    },

    async update(id, payload) {
      const { data, error } = await supabase
        .schema('nexus')
        .from(table)
        .update(payload)
        .eq('id', id)
        .select('*')
        .single();
      throwIfError(error, `Failed to update ${entityName}`);
      return data;
    },

    async delete(id) {
      const { data, error } = await supabase
        .schema('nexus')
        .from(table)
        .delete()
        .eq('id', id)
        .select('*')
        .maybeSingle();
      throwIfError(error, `Failed to delete ${entityName}`);
      return data;
    },
  };
};

const resolveRedirectTarget = (redirectUrl) => {
  if (redirectUrl) {
    return redirectUrl;
  }

  if (typeof window !== 'undefined') {
    return window.location.href;
  }

  return null;
};

const navigateTo = (url) => {
  if (typeof window !== 'undefined' && url) {
    window.location.assign(url);
  }
};

const entitiesProxy = new Proxy(
  {},
  {
    get(_, entityName) {
      if (typeof entityName !== 'string') {
        return undefined;
      }

      return createEntityApi(entityName);
    },
  }
);

export const nexusClient = {
  auth: {
    async me() {
      const { data, error } = await supabase.auth.getUser();
      throwIfError(error, 'Failed to get authenticated user', 401);

      if (!data?.user) {
        throw normalizeError(null, 'Authentication required', 401);
      }

      return data.user;
    },

    async logout(redirectUrl) {
      const { error } = await supabase.auth.signOut();
      throwIfError(error, 'Failed to sign out');

      const target = resolveRedirectTarget(redirectUrl);
      navigateTo(target);
    },

    redirectToLogin(returnUrl) {
      const authUrl = import.meta.env.VITE_NEXUS_AUTH_URL;
      if (!authUrl) {
        throw normalizeError(null, 'Missing VITE_NEXUS_AUTH_URL', 500);
      }

      const redirectTo = encodeURIComponent(resolveRedirectTarget(returnUrl) ?? '');
      const separator = authUrl.includes('?') ? '&' : '?';
      navigateTo(`${authUrl}${separator}redirect_to=${redirectTo}`);
    },

    async signIn(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      throwIfError(error, 'Failed to sign in', 401);
      return data;
    },

    async signInWithMagicLink(email) {
      const { data, error } = await supabase.auth.signInWithOtp({ email });
      throwIfError(error, 'Failed to send magic link', 400);
      return data;
    },
  },
  entities: entitiesProxy,
};

export { supabase, normalizeError };
