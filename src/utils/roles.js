/**
 * Role and permission utilities for BengkelOS Multi-Tenant Platform
 */

export const SUPERADMIN_EMAILS = [
  'aliepcahyo@gmail.com',
  'allepcahyo@gmail.com',
  'superadmin@gpsmotor.id',
  'admin@gpsmotor.id'
];

/**
 * Checks whether an email address qualifies for Superadmin access.
 * @param {string} email
 * @returns {boolean}
 */
export function isSuperadmin(email = '') {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.toLowerCase().trim();
  if (normalized.includes('superadmin')) return true;
  return SUPERADMIN_EMAILS.includes(normalized);
}
