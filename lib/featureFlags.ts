/**
 * Feature flags for Blue Carbon MRV & Registry (Phase 1).
 * Advanced features (registry balance, marketplace, buy/sell) only for:
 * - User role = ADMIN or super_admin (legacy) OR
 * - profile.marketplace_access = true OR
 * - User email in allowlist (NEXT_PUBLIC_FULL_ACCESS_EMAILS or hardcoded demo).
 */

export type AppRole = 'LANDOWNER' | 'BUYER' | 'ENTERPRISE' | 'GOVERNMENT' | 'ADMIN'

const ADVANCED_ROLES = ['ADMIN', 'super_admin', 'administrator']

/** Hardcoded allowlist for demo/testing (emails or user IDs). Not for production secrets. */
const DEMO_ALLOWLIST: string[] = [
  'admin@oceara.demo',
  'superadmin@oceara.demo',
].map((e) => e.trim().toLowerCase())

function getAllowlist(): string[] {
  if (typeof window === 'undefined') return []
  const raw = process.env.NEXT_PUBLIC_FULL_ACCESS_EMAILS || ''
  const envList = raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  return [...new Set([...DEMO_ALLOWLIST, ...envList])]
}

/** Normalize legacy role strings to AppRole or null. */
export function normalizeRole(role: string | null | undefined): AppRole | null {
  if (!role) return null
  const r = String(role).toUpperCase()
  if (r === 'LANDOWNER' || r === 'BUYER' || r === 'ENTERPRISE' || r === 'GOVERNMENT' || r === 'ADMIN') return r as AppRole
  if (role === 'super_admin' || role === 'administrator') return 'ADMIN'
  if (role === 'landowner') return 'LANDOWNER'
  if (role === 'buyer') return 'BUYER'
  return null
}

export function isSuperAdmin(role: string | null | undefined): boolean {
  return role === 'super_admin' || role === 'ADMIN' || role === 'administrator'
}

export function isInAdvancedAllowlist(emailOrId: string | null | undefined): boolean {
  if (!emailOrId) return false
  const allowlist = getAllowlist()
  if (allowlist.length === 0) return false
  return allowlist.includes(String(emailOrId).trim().toLowerCase())
}

/**
 * Returns true if the user can see advanced features (registry balance, marketplace, buy/sell).
 */
export function canSeeAdvancedFeatures(
  email: string | null | undefined,
  role?: string | null,
  marketplaceAccess?: boolean
): boolean {
  if (marketplaceAccess === true) return true
  if (role && ADVANCED_ROLES.includes(String(role))) return true
  return isInAdvancedAllowlist(email ?? undefined)
}
