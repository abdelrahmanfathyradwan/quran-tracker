/**
 * API client helper for calling the backend API routes.
 * This replaces the localStorage-based IStorageProvider.
 */

import { cache } from './cache';

const API_BASE = '/api';

export const apiClient = {
  async getAll<T>(collection: string): Promise<T[]> {
    const cacheKey = `getAll:${collection}`;
    const cached = cache.get<T[]>(cacheKey);
    if (cached) return cached;

    const res = await fetch(`${API_BASE}/${collection}`);
    if (!res.ok) throw new Error(`Failed to fetch ${collection}`);
    const data = await res.json();
    cache.set(cacheKey, data, 30000); // Cache for 30 seconds
    return data;
  },

  async getById<T>(collection: string, id: string): Promise<T | null> {
    const cacheKey = `getById:${collection}:${id}`;
    const cached = cache.get<T>(cacheKey);
    if (cached) return cached;

    const res = await fetch(`${API_BASE}/${collection}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch ${collection}/${id}`);
    const data = await res.json();
    cache.set(cacheKey, data, 30000); // Cache for 30 seconds
    return data;
  },

  async create<T>(collection: string, item: T): Promise<T> {
    const res = await fetch(`${API_BASE}/${collection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error(`Failed to create in ${collection}`);
    const data = await res.json();
    cache.invalidatePattern(collection); // Invalidate cache for this collection
    return data;
  },

  async update<T>(collection: string, id: string, updates: Partial<T>): Promise<T | null> {
    const res = await fetch(`${API_BASE}/${collection}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to update ${collection}/${id}`);
    const data = await res.json();
    cache.invalidatePattern(collection); // Invalidate cache for this collection
    return data;
  },

  async remove(collection: string, id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/${collection}/${id}`, {
      method: 'DELETE',
    });
    if (res.status === 404) return false;
    if (!res.ok) throw new Error(`Failed to delete ${collection}/${id}`);
    cache.invalidatePattern(collection); // Invalidate cache for this collection
    return true;
  },

  async deleteMany(collection: string, ids: string[]): Promise<void> {
    const res = await fetch(`${API_BASE}/${collection}/delete-many`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error(`Failed to delete many in ${collection}`);
    cache.invalidatePattern(collection); // Invalidate cache for this collection
  },

  async setAll<T>(collection: string, items: T[]): Promise<void> {
    const res = await fetch(`${API_BASE}/${collection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _bulk: true, items }),
    });
    if (!res.ok) throw new Error(`Failed to set all in ${collection}`);
    cache.invalidatePattern(collection); // Invalidate cache for this collection
  },

  async clear(collection: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${collection}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to clear ${collection}`);
    cache.invalidatePattern(collection); // Invalidate cache for this collection
  },

  // Settings-specific
  async getSettings<T>(): Promise<T | null> {
    const cacheKey = 'settings';
    const cached = cache.get<T>(cacheKey);
    if (cached) return cached;

    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    const data = await res.json();
    cache.set(cacheKey, data, 60000); // Cache for 1 minute
    return data;
  },

  async setSettings<T>(settings: T): Promise<void> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to save settings');
    cache.invalidate('settings'); // Invalidate settings cache
  },
};
