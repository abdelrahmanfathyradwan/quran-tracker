export type StudentStatus = 'active' | 'inactive';

export type CommitmentLevel = 'excellent' | 'good' | 'needs_attention' | 'behind';

export type SchoolGrade =
  | 'preschool'
  | 'grade_1' | 'grade_2' | 'grade_3' | 'grade_4' | 'grade_5' | 'grade_6'
  | 'grade_7' | 'grade_8' | 'grade_9'
  | 'grade_10' | 'grade_11' | 'grade_12'
  | 'university'
  | 'other';

export const GRADE_LABELS: Record<SchoolGrade, string> = {
  preschool: 'تمهيدي',
  grade_1: 'الصف الأول',
  grade_2: 'الصف الثاني',
  grade_3: 'الصف الثالث',
  grade_4: 'الصف الرابع',
  grade_5: 'الصف الخامس',
  grade_6: 'الصف السادس',
  grade_7: 'الصف الأول الإعدادي',
  grade_8: 'الصف الثاني الإعدادي',
  grade_9: 'الصف الثالث الإعدادي',
  grade_10: 'الصف الأول ثانوي',
  grade_11: 'الصف الثاني ثانوي',
  grade_12: 'الصف الثالث ثانوي',
  university: 'جامعي',
  other: 'أخرى',
};

export interface Student {
  id: string;
  name: string;
  imageUrl?: string; // صورة الطالب
  grade?: SchoolGrade; // الصف الدراسي
  startDate: string; // ISO date string
  currentMemorization: string; // e.g., "5 أجزاء و 12 صفحة"
  currentPosition: string; // e.g., "سورة النساء — الآية 35"
  notes?: string;
  status: StudentStatus;
  prayedFajr?: boolean; // هل صلى الفجر أم لا
  createdAt: string;
  updatedAt: string;
}

export interface StudentFormData {
  name: string;
  imageUrl?: string;
  grade?: SchoolGrade;
  startDate: string;
  currentMemorization: string;
  currentPosition: string;
  notes?: string;
}
