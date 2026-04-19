import { useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';

const ACTIVE_LICENSE_STATUSES = new Set(['active', 'trial']);
const BUNDLE_PRODUCT_SLUGS = new Set(['meridian_scripta', 'full_suite']);

const isActiveLicense = (license) => ACTIVE_LICENSE_STATUSES.has((license?.status ?? '').toLowerCase());

const matchesProductSlug = (license, productSlug) => {
  const normalizedSlug = (productSlug ?? '').toLowerCase();
  if (!normalizedSlug) {
    return false;
  }

  const licenseSlug = (license?.product_slug ?? license?.slug ?? '').toLowerCase();
  if (licenseSlug === normalizedSlug) {
    return true;
  }

  if (BUNDLE_PRODUCT_SLUGS.has(licenseSlug)) {
    return true;
  }

  const bundleProducts = Array.isArray(license?.bundle_products) ? license.bundle_products : [];
  return bundleProducts.some((slug) => (slug ?? '').toLowerCase() === normalizedSlug);
};

export const useNexusAuth = () => {
  const auth = useAuth();

  return useMemo(() => {
    const role = auth?.institutionUser?.role ?? null;
    const activeLicenses = (auth?.licenses ?? []).filter(isActiveLicense);

    const hasProduct = (productSlug) =>
      activeLicenses.some((license) => matchesProductSlug(license, productSlug));

    return {
      ...auth,
      isSuperAdmin: role === 'nexus_super_admin',
      isAdmin: role === 'admin',
      hasProduct,
      isLicensed: activeLicenses.length > 0,
      myInstitutionId: auth?.institutionUser?.institution_id ?? null,
    };
  }, [auth]);
};
