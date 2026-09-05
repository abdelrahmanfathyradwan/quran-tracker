import { RecitationStatus, SessionRating, Session } from './types/session';
import { Student } from './types/student';

/**
 * نظام حساب النقاط لفارس الحلقة
 * يعتمد على التقييمات والأخطاء وصلاة الفجر
 */

// نقاط كل تقييم
const STATUS_POINTS: Record<RecitationStatus, number> = {
  excellent: 10,
  very_good: 8,
  good: 6,
  retry: 2,
};

const RATING_POINTS: Record<SessionRating, number> = {
  excellent: 10,
  very_good: 8,
  good: 6,
  needs_attention: 3,
};

// خصم النقاط لكل خطأ
const MISTAKE_PENALTY = 1;

// مكافأة صلاة الفجر
const FAJR_PRAYER_BONUS = 10;

export interface StudentScore {
  rank?: number;
  studentId: string;
  studentName: string;
  imageUrl?: string;
  prayedFajr?: boolean;
  totalScore: number;
  totalMistakes: number;
  breakdown: {
    newMemorization: number;
    recentRevision: number;
    distantRevision: number;
    overallRating: number;
    mistakes: number;
    fajrBonus: number;
  };
  session: Session;
}

/**
 * حساب نقاط طالب واحد بناءً على الجلسة
 */
export function calculateStudentScore(
  session: Session,
  student: Student
): StudentScore {
  // حساب نقاط التقييمات
  const newMemPoints = STATUS_POINTS[session.newMemorization.status];
  const recentRevPoints = STATUS_POINTS[session.recentRevision.status];
  const distantRevPoints = STATUS_POINTS[session.distantRevision.status];
  const overallRatingPoints = session.overallRating
    ? RATING_POINTS[session.overallRating]
    : 0;

  // حساب إجمالي الأخطاء
  const totalMistakes =
    (session.newMemorization.mistakes || 0) +
    (session.recentRevision.mistakes || 0) +
    (session.distantRevision.mistakes || 0);

  // خصم النقاط للأخطاء
  const mistakesPenalty = totalMistakes * MISTAKE_PENALTY;

  // مكافأة صلاة الفجر
  const fajrBonus = student.prayedFajr ? FAJR_PRAYER_BONUS : 0;

  // حساب النقاط الإجمالية
  const totalScore =
    newMemPoints +
    recentRevPoints +
    distantRevPoints +
    overallRatingPoints -
    mistakesPenalty +
    fajrBonus;

  return {
    studentId: session.studentId,
    studentName: student.name,
    imageUrl: student.imageUrl,
    prayedFajr: student.prayedFajr,
    totalScore: Math.max(0, totalScore), // لا تقل عن صفر
    totalMistakes,
    breakdown: {
      newMemorization: newMemPoints,
      recentRevision: recentRevPoints,
      distantRevision: distantRevPoints,
      overallRating: overallRatingPoints,
      mistakes: -mistakesPenalty,
      fajrBonus,
    },
    session,
  };
}

/**
 * ترتيب الطلاب بناءً على النقاط
 */
export function rankStudents(scores: StudentScore[]): (StudentScore & { rank: number })[] {
  const sorted = [...scores].sort((a, b) => b.totalScore - a.totalScore);

  // إضافة الترتيب
  let currentRank = 1;
  return sorted.map((score, index) => {
    if (index > 0 && score.totalScore < sorted[index - 1].totalScore) {
      currentRank = index + 1;
    }
    return { ...score, rank: currentRank };
  });
}
