export interface AppSettings {
  teacherName: string;
  centerName: string;
  theme: 'light'; // only light for MVP
}

export interface AppData {
  version: number;
  students: import('./student').Student[];
  plans: import('./plan').Plan[];
  sessions: import('./session').Session[];
  settings: AppSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  teacherName: 'الشيخ',
  centerName: 'حلقة القرآن الكريم',
  theme: 'light',
};

export const CURRENT_DATA_VERSION = 1;
