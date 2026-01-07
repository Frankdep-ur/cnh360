const CACHE_VERSION = "v1";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

export const CACHE_KEYS = {
  QUESTOES_SIMULADO: `cnh360_questoes_${CACHE_VERSION}`,
  MODULOS_INFO: `cnh360_modulos_${CACHE_VERSION}`,
  DETRAN_INFO: `cnh360_detran_${CACHE_VERSION}`,
} as const;

export function getCachedData<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);

    // Check version
    if (entry.version !== CACHE_VERSION) {
      localStorage.removeItem(key);
      return null;
    }

    // Check expiration
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export function setCachedData<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    // Handle quota exceeded or other storage errors silently
    console.warn("Failed to cache data:", e);
  }
}

export function clearCache(): void {
  Object.values(CACHE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
