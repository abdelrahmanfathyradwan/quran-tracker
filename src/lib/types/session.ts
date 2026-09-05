export type RecitationStatus = "excellent" | "very_good" | "good" | "retry";

export type SessionRating =
  | "excellent"
  | "very_good"
  | "good"
  | "needs_attention";

export interface RecitationItem {
  content: string; // e.g., "سورة النساء الآيات 35–45"
  amount?: string; // المقدار الفعلي الذي تم تسميعه — e.g., "صفحة ونصف" أو "5 آيات"
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

  teacherName?: string; // اسم الشيخ الذي قام بالتسميع

  completed: boolean;
  completedAt?: string;
  startedAt?: string; // ISO timestamp — when the teacher started the session
  durationSeconds?: number; // total elapsed seconds for the session
}

export interface SessionFormData {
  newMemorization: RecitationItem;
  recentRevision: RecitationItem;
  distantRevision: RecitationItem;
  overallRating?: SessionRating;
  notes?: string;
  durationSeconds?: number;
  teacherName?: string;
}

export const RATING_LABELS: Record<SessionRating, string> = {
  excellent: "ممتاز",
  very_good: "جيد جدًا",
  good: "جيد",
  needs_attention: "يحتاج متابعة",
};

export const STATUS_LABELS: Record<RecitationStatus, string> = {
  excellent: "ممتاز",
  very_good: "جيد جدًا",
  good: "جيد",
  retry: "إعادة",
};
