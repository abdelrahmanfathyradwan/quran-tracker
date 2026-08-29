export type RecitationStatus = 'not_piked' | 'completed' | 'needs_retry';

export type SessionRating = 'excellent' | 'very_good' | 'good' | 'needs_attention';

export interface RecitationItem {
  content: string; // e.g., "سورة النساء الآيات 35–45"
  status: RecitationStatus;
  mistakes: number;
  notes?: string;
}

export interface Session {
  id: string;
  planId: string;
  studentId: string;
  date: string; // ISO date string YYYY-MM-DD
  sessionNumber: number; // e.g., session 4 of the plan

  newMemorization: RecitationItem;
  recentRevision: RecitationItem;
  distantRevision: RecitationItem;

  overallRating?: SessionRating;
  notes?: string;

  completed: boolean;
  completedAt?: string;
}

export interface SessionFormData {
  newMemorization: RecitationItem;
  recentRevision: RecitationItem;
  distantRevision: RecitationItem;
  overallRating?: SessionRating;
  notes?: string;
}

export const RATING_LABELS: Record<SessionRating, string> = {
  excellent: 'ممتاز',
  very_good: 'جيد جدًا',
  good: 'جيد',
  needs_attention: 'يحتاج متابعة',
};

export const STATUS_LABELS: Record<RecitationStatus, string> = {
  not_piked: 'لم يسمع',
  completed: 'تم الإتقان',
  needs_retry: 'يحتاج إعادة',
};
