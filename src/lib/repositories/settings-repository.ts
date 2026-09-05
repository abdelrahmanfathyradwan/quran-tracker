import { apiClient } from '../api-client';
import { AppSettings, DEFAULT_SETTINGS } from '../types/settings';

class SettingsRepository {
  private collection = 'settings';

  async get(): Promise<AppSettings> {
    const settings = await apiClient.getSettings<AppSettings>();
    return settings || { ...DEFAULT_SETTINGS };
  }

  async update(settings: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.get();
    const updated = { ...current, ...settings };
    await apiClient.setSettings(updated);
    return updated;
  }

  async reset(): Promise<void> {
    await apiClient.setSettings({ ...DEFAULT_SETTINGS });
  }
}

export const settingsRepository = new SettingsRepository();
