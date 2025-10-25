import { config } from './config';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

/**
 * Simple in-memory cache manager
 */
export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheEntry<any>>;
  private readonly config: { enabled: boolean; ttl: number; maxSize: number };

  private constructor() {
    this.cache = new Map();
    this.config = config.getCacheConfig();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Set a value in cache
   */
  public set<T>(key: string, value: T, ttl?: number): void {
    if (!this.config.enabled) {
      return;
    }

    // Enforce max size
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
    });
  }

  /**
   * Get a value from cache
   */
  public get<T>(key: string): T | null {
    if (!this.config.enabled) {
      return null;
    }

    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if expired
    const age = (Date.now() - entry.timestamp) / 1000;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Check if key exists in cache
   */
  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Invalidate a cache entry
   */
  public invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  public getStats(): { size: number; enabled: boolean; ttl: number } {
    return {
      size: this.cache.size,
      enabled: this.config.enabled,
      ttl: this.config.ttl,
    };
  }

  /**
   * Clean expired entries
   */
  public cleanExpired(): number {
    let removed = 0;
    const now = Date.now();

    this.cache.forEach((entry, key) => {
      const age = (now - entry.timestamp) / 1000;
      if (age > entry.ttl) {
        this.cache.delete(key);
        removed++;
      }
    });

    return removed;
  }
}

/**
 * Export singleton instance
 */
export const cache = CacheManager.getInstance();
