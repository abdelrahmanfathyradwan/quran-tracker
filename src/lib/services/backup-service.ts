import { apiClient } from '../api-client';
import { studentRepository } from '../repositories/student-repository';
import { planRepository } from '../repositories/plan-repository';
import { sessionRepository } from '../repositories/session-repository';
import { settingsRepository } from '../repositories/settings-repository';
import { AppData, CURRENT_DATA_VERSION } from '../types/settings';

class BackupService {
  /**
   * Export all application data as a JSON object.
   */
  async exportData(): Promise<AppData> {
    const students = await studentRepository.getAll();
    const plans = await planRepository.getAll();
    const sessions = await sessionRepository.getAll();
    const settings = await settingsRepository.get();

    return {
      version: CURRENT_DATA_VERSION,
      students,
      plans,
      sessions,
      settings,
    };
  }

  /**
   * Export data and trigger a file download.
   */
  async downloadBackup(): Promise<void> {
    const data = await this.exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const today = new Date().toISOString().split('T')[0];
    const filename = `quran-center-backup-${today}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Validate imported data structure.
   */
  validateImport(data: unknown): { valid: boolean; error?: string } {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'البيانات غير صالحة' };
    }

    const d = data as Record<string, unknown>;

    if (typeof d.version !== 'number') {
      return { valid: false, error: 'إصدار البيانات غير موجود' };
    }

    if (!Array.isArray(d.students)) {
      return { valid: false, error: 'بيانات الطلاب غير صالحة' };
    }

    if (!Array.isArray(d.plans)) {
      return { valid: false, error: 'بيانات الخطط غير صالحة' };
    }

    if (!Array.isArray(d.sessions)) {
      return { valid: false, error: 'بيانات الجلسات غير صالحة' };
    }

    return { valid: true };
  }

  /**
   * Import data from a JSON object, replacing all existing data.
   */
  async importData(data: AppData): Promise<{ success: boolean; error?: string }> {
    const validation = this.validateImport(data);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      await studentRepository.setAll(data.students);
      await planRepository.setAll(data.plans);
      await sessionRepository.setAll(data.sessions);
      if (data.settings) {
        await settingsRepository.update(data.settings);
      }
      return { success: true };
    } catch (error) {
      console.error('Error importing data:', error);
      return { success: false, error: 'حدث خطأ أثناء استيراد البيانات' };
    }
  }

  /**
   * Clear all application data.
   */
  async clearAllData(): Promise<void> {
    await apiClient.clear('students');
    await apiClient.clear('plans');
    await apiClient.clear('sessions');
    await apiClient.clear('settings');
  }
}

export const backupService = new BackupService();
