/**
 * Role and permission utilities for BengkelOS Multi-Tenant Platform
 * 
 * Superadmin identification is resolved dynamically from:
 * 1. User object metadata / database role (user.role === 'superadmin', user.isSuperAdmin,
 *    or Supabase app_metadata/user_metadata role)
 * 2. Environment variables: VITE_SUPERADMIN_EMAILS, NEXT_PUBLIC_SUPERADMIN_EMAILS, SUPERADMIN_EMAIL
 * 3. System keyword detection (e.g. emails containing 'superadmin') for local dev / testing.
 * 
 * NO personal emails are hardcoded in source code.
 */

export const parseConfiguredSuperadmins = () => {
  const envVal = 
    (typeof import.meta !== 'undefined' && import.meta.env && (
      import.meta.env.VITE_SUPERADMIN_EMAILS ||
      import.meta.env.NEXT_PUBLIC_SUPERADMIN_EMAILS ||
      import.meta.env.VITE_SUPERADMIN_EMAIL ||
      import.meta.env.NEXT_PUBLIC_SUPERADMIN_EMAIL
    )) ||
    (typeof process !== 'undefined' && process.env && (
      process.env.SUPERADMIN_EMAILS ||
      process.env.SUPERADMIN_EMAIL
    )) ||
    '';

  return envVal
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
};

/**
 * Checks whether an email address or user object qualifies for Superadmin access.
 * @param {string|object} emailOrUser - Email string or User session object
 * @param {object} [userObj] - Optional user session object if first argument is string email
 * @returns {boolean}
 */
export function isSuperadmin(emailOrUser = '', userObj = null) {
  const user = typeof emailOrUser === 'object' && emailOrUser !== null ? emailOrUser : userObj;

  // 1. Check direct role properties on user object
  if (user) {
    if (user.isSuperAdmin === true || user.is_superadmin === true) return true;
    if (user.role === 'superadmin') return true;
    if (user.app_metadata?.role === 'superadmin' || user.user_metadata?.role === 'superadmin') return true;
    if (user.app_metadata?.is_superadmin === true || user.user_metadata?.is_superadmin === true) return true;
  }

  // 2. Extract and normalize email
  const email = (
    typeof emailOrUser === 'string' ? emailOrUser : (user?.email || '')
  ).toLowerCase().trim();

  if (!email) return false;

  // 3. System keyword (for testing/local development e.g. superadmin@...)
  if (email.includes('superadmin')) return true;

  // 4. Compare with configured environment variable list
  const configuredEmails = parseConfiguredSuperadmins();
  if (configuredEmails.includes(email)) return true;

  return false;
}
