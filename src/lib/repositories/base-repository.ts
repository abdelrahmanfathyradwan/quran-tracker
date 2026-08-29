import { IStorageProvider } from '../storage/storage-interface';
import { storageProvider } from '../storage/local-storage';

/**
 * Base repository providing generic CRUD operations.
 * All entity-specific repositories extend this.
 */
export class BaseRepository<T extends { id: string }> {
  protected storage: IStorageProvider;
  protected key: string;

  constructor(key: string, storage?: IStorageProvider) {
    this.key = key;
    this.storage = storage || storageProvider;
  }

  getAll(): T[] {
    return this.storage.get<T[]>(this.key) || [];
  }

  getById(id: string): T | undefined {
    const items = this.getAll();
    return items.find((item) => item.id === id);
  }

  create(item: T): T {
    const items = this.getAll();
    items.push(item);
    this.storage.set(this.key, items);
    return item;
  }

  update(id: string, updates: Partial<T>): T | undefined {
    const items = this.getAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return undefined;

    items[index] = { ...items[index], ...updates };
    this.storage.set(this.key, items);
    return items[index];
  }

  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;

    this.storage.set(this.key, filtered);
    return true;
  }

  deleteMany(ids: string[]): void {
    const items = this.getAll();
    const filtered = items.filter((item) => !ids.includes(item.id));
    this.storage.set(this.key, filtered);
  }

  setAll(items: T[]): void {
    this.storage.set(this.key, items);
  }

  clear(): void {
    this.storage.set(this.key, []);
  }
}
