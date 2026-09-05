import { apiClient } from '../api-client';

/**
 * Base repository providing generic async CRUD operations via API routes.
 * All entity-specific repositories extend this.
 */
export class BaseRepository<T extends { id: string }> {
  protected collection: string;

  constructor(collection: string) {
    this.collection = collection;
  }

  async getAll(): Promise<T[]> {
    return apiClient.getAll<T>(this.collection);
  }

  async getById(id: string): Promise<T | undefined> {
    const item = await apiClient.getById<T>(this.collection, id);
    return item ?? undefined;
  }

  async create(item: T): Promise<T> {
    return apiClient.create<T>(this.collection, item);
  }

  async update(id: string, updates: Partial<T>): Promise<T | undefined> {
    const item = await apiClient.update<T>(this.collection, id, updates);
    return item ?? undefined;
  }

  async delete(id: string): Promise<boolean> {
    return apiClient.remove(this.collection, id);
  }

  async deleteMany(ids: string[]): Promise<void> {
    return apiClient.deleteMany(this.collection, ids);
  }

  async setAll(items: T[]): Promise<void> {
    return apiClient.setAll(this.collection, items);
  }

  async clear(): Promise<void> {
    return apiClient.clear(this.collection);
  }
}
