import { prisma } from './prisma';

// Cache for application settings to avoid repeated database queries (raw string values)
let settingsCache: Map<string, string> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60000; // Cache for 60 seconds

// Default fallback values (same as original constants)
const DEFAULTS = {
  HOURLY_RATE: 20,
  MEMBERSHIP_BASE_AMOUNT: 120,
  HOURS_REQUIRED: 6,
  TIME_ZONE: 'Pacific/Honolulu',
};

/**
 * Fetches application settings from the database with caching
 */
async function fetchSettings(): Promise<Map<string, string>> {
  const now = Date.now();
  
  // Return cached settings if still valid
  if (settingsCache && (now - cacheTimestamp) < CACHE_TTL) {
    return settingsCache;
  }

  try {
    // Cast to any to avoid type mismatch if Prisma client types are stale
    const rows: Array<{ key: string; value: string }> = await (prisma as any).applicationSettings.findMany();
    const map = new Map<string, string>();

    rows.forEach((setting: { key: string; value: string }) => {
      map.set(setting.key, setting.value);
    });

    // Use defaults for any missing settings
    Object.entries(DEFAULTS).forEach(([key, value]) => {
      if (!map.has(key)) {
        map.set(key, String(value));
      }
    });

    settingsCache = map;
    cacheTimestamp = now;
    return map;
  } catch (error) {
    console.error('Error fetching application settings, using defaults:', error);
    // Return defaults if database is unavailable
    return new Map(Object.entries(DEFAULTS).map(([k, v]) => [k, String(v)]));
  }
}

/**
 * Get a specific setting value
 */
async function getSettingNumber(key: 'HOURLY_RATE' | 'MEMBERSHIP_BASE_AMOUNT' | 'HOURS_REQUIRED'): Promise<number> {
  const settings = await fetchSettings();
  const raw = settings.get(key);
  const parsed = raw != null ? parseFloat(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : DEFAULTS[key];
}

async function getSettingString(key: 'TIME_ZONE'): Promise<string> {
  const settings = await fetchSettings();
  return settings.get(key) ?? DEFAULTS[key];
}

/**
 * Get all application settings at once
 */
export async function getApplicationSettings() {
  const settings = await fetchSettings();
  return {
    HOURLY_RATE: Number.parseFloat(settings.get('HOURLY_RATE') || '') || DEFAULTS.HOURLY_RATE,
    MEMBERSHIP_BASE_AMOUNT:
      Number.parseFloat(settings.get('MEMBERSHIP_BASE_AMOUNT') || '') || DEFAULTS.MEMBERSHIP_BASE_AMOUNT,
    HOURS_REQUIRED: Number.parseFloat(settings.get('HOURS_REQUIRED') || '') || DEFAULTS.HOURS_REQUIRED,
    TIME_ZONE: settings.get('TIME_ZONE') ?? DEFAULTS.TIME_ZONE,
  };
}

/**
 * Fetch application settings without using cache.
 * Useful for server pages that must reflect updates immediately.
 */
export async function getApplicationSettingsNoCache() {
  try {
    const rows: Array<{ key: string; value: string }> = await (prisma as any).applicationSettings.findMany();
    const map = new Map<string, string>();
    rows.forEach((r) => {
      map.set(r.key, r.value);
    });
    return {
      HOURLY_RATE: Number.parseFloat(map.get('HOURLY_RATE') || '') || DEFAULTS.HOURLY_RATE,
      MEMBERSHIP_BASE_AMOUNT:
        Number.parseFloat(map.get('MEMBERSHIP_BASE_AMOUNT') || '') || DEFAULTS.MEMBERSHIP_BASE_AMOUNT,
      HOURS_REQUIRED: Number.parseFloat(map.get('HOURS_REQUIRED') || '') || DEFAULTS.HOURS_REQUIRED,
      TIME_ZONE: map.get('TIME_ZONE') ?? DEFAULTS.TIME_ZONE,
    };
  } catch (error) {
    console.error('getApplicationSettingsNoCache error:', error);
    return { ...DEFAULTS };
  }
}

/**
 * Invalidate the settings cache (useful after updating settings)
 */
export function invalidateSettingsCache() {
  settingsCache = null;
  cacheTimestamp = 0;
}

// Export individual getters for convenience
export const getHourlyRate = () => getSettingNumber('HOURLY_RATE');
export const getMembershipBaseAmount = () => getSettingNumber('MEMBERSHIP_BASE_AMOUNT');
export const getHoursRequired = () => getSettingNumber('HOURS_REQUIRED');
export const getTimeZone = () => getSettingString('TIME_ZONE');

// For backwards compatibility, export synchronous constants with default values
// These should only be used in client components where async is not possible
export const { HOURLY_RATE, MEMBERSHIP_BASE_AMOUNT, HOURS_REQUIRED, TIME_ZONE } = DEFAULTS;
