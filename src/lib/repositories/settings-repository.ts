import { storageProvider } from '../storage';
import { AppSettings, DEFAULT_SETTINGS } from '../types/settings';

class SettingsRepository {
  private key = 'settings';

  get(): AppSettings {
    return storageProvider.get<AppSettings>(this.key) || { ...DEFAULT_SETTINGS };
  }

  update(settings: Partial<AppSettings>): AppSettings {
    const current = this.get();
    const updated = { ...current, ...settings };
    storageProvider.set(this.key, updated);
    return updated;
  }

  reset(): void {
    storageProvider.set(this.key, { ...DEFAULT_SETTINGS });
  }
}

export const settingsRepository = new SettingsRepository();
