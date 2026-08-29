export type StudentStatus = 'active' | 'inactive';

export type CommitmentLevel = 'excellent' | 'good' | 'needs_attention' | 'behind';

export interface Student {
  id: string;
  name: string;
  startDate: string; // ISO date string
  currentMemorization: string; // e.g., "5 أجزاء و 12 صفحة"
  currentPosition: string; // e.g., "سورة النساء — الآية 35"
  notes?: string;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFormData {
  name: string;
  startDate: string;
  currentMemorization: string;
  currentPosition: string;
  notes?: string;
}
