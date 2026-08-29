export interface Plan {
  id: string;
  studentId: string;
  name: string; // e.g., "خطة سبتمبر 2026"
  startDate: string; // ISO date YYYY-MM-DD
  endDate: string; // ISO date YYYY-MM-DD
  recitationDays: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  totalSessions: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanFormData {
  studentId: string;
  name: string;
  startDate: string;
  endDate: string;
  recitationDays: number[];
}

export const DAY_LABELS: Record<number, string> = {
  0: 'الأحد',
  1: 'الاثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
  6: 'السبت',
};
