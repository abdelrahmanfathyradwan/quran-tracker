/**
 * Storage interface abstraction.
 * This can be replaced with Supabase, PostgreSQL, or API implementation later.
 */
export interface IStorageProvider {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}
