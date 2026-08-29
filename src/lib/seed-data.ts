import { Student } from './types/student';
import { Plan } from './types/plan';
import { Session, RecitationItem } from './types/session';
import { studentRepository } from './repositories/student-repository';
import { planRepository } from './repositories/plan-repository';
import { sessionRepository } from './repositories/session-repository';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function createRecitationItem(
  content: string,
  status: 'not_piked' | 'completed' | 'needs_retry' = 'not_piked',
  mistakes = 0
): RecitationItem {
  return { content, status, mistakes, notes: '' };
}

export function loadSeedData(): void {
  // Check if data already exists
  if (studentRepository.getAll().length > 0) return;

  const now = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];

  // ── Students ──────────────────────────────────────────
  const students: Student[] = [
    {
      id: 'student_1',
      name: 'خالد محمد فتحي',
      startDate: '2026-06-01',
      currentMemorization: '5 أجزاء و 12 صفحة',
      currentPosition: 'سورة النساء — الآية 35',
      notes: 'طالب مجتهد ومنتظم في الحضور',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'student_2',
      name: 'أحمد عبدالله السيد',
      startDate: '2026-05-15',
      currentMemorization: '3 أجزاء',
      currentPosition: 'سورة آل عمران — الآية 120',
      notes: '',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'student_3',
      name: 'يوسف إبراهيم حسن',
      startDate: '2026-07-01',
      currentMemorization: '8 أجزاء و 5 صفحات',
      currentPosition: 'سورة الأنعام — الآية 90',
      notes: 'يحتاج مراجعة أكثر للأجزاء القديمة',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'student_4',
      name: 'عمر حسين عبدالرحمن',
      startDate: '2026-08-01',
      currentMemorization: 'جزء واحد و 8 صفحات',
      currentPosition: 'سورة البقرة — الآية 200',
      notes: 'طالب جديد، بداية ممتازة',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'student_5',
      name: 'محمد علي الشريف',
      startDate: '2026-04-01',
      currentMemorization: '10 أجزاء',
      currentPosition: 'سورة هود — الآية 50',
      notes: 'متأخر في المراجعة، يحتاج متابعة خاصة',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'student_6',
      name: 'عبدالرحمن سعيد',
      startDate: '2026-03-15',
      currentMemorization: '12 جزء',
      currentPosition: 'سورة يوسف — الآية 80',
      notes: '',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'student_7',
      name: 'إسماعيل فاروق',
      startDate: '2026-08-20',
      currentMemorization: 'صفحتان',
      currentPosition: 'سورة الفاتحة + سورة البقرة — الآية 10',
      notes: 'طالب جديد تمامًا',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
  ];

  students.forEach((s) => studentRepository.create(s));

  // ── Plans ──────────────────────────────────────────
  // Plan for student_1 (excellent student) — current month
  const planId1 = 'plan_1';
  const plan1: Plan = {
    id: planId1,
    studentId: 'student_1',
    name: 'خطة أغسطس 2026',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    recitationDays: [6, 1, 3], // Saturday, Monday, Wednesday
    totalSessions: 13,
    createdAt: now,
    updatedAt: now,
  };

  const planId2 = 'plan_2';
  const plan2: Plan = {
    id: planId2,
    studentId: 'student_2',
    name: 'خطة أغسطس 2026',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    recitationDays: [6, 1, 3],
    totalSessions: 13,
    createdAt: now,
    updatedAt: now,
  };

  const planId3 = 'plan_3';
  const plan3: Plan = {
    id: planId3,
    studentId: 'student_3',
    name: 'خطة أغسطس 2026',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    recitationDays: [0, 2, 4], // Sunday, Tuesday, Thursday
    totalSessions: 13,
    createdAt: now,
    updatedAt: now,
  };

  const planId5 = 'plan_5';
  const plan5: Plan = {
    id: planId5,
    studentId: 'student_5',
    name: 'خطة أغسطس 2026',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    recitationDays: [6, 1, 3],
    totalSessions: 13,
    createdAt: now,
    updatedAt: now,
  };

  planRepository.create(plan1);
  planRepository.create(plan2);
  planRepository.create(plan3);
  planRepository.create(plan5);

  // ── Sessions for plan_1 (excellent student) ──────────
  const plan1Dates = getRecitationDatesForSeed('2026-08-01', '2026-08-31', [6, 1, 3]);
  const plan1Sessions: Session[] = plan1Dates.map((date, i) => {
    const isPastDate = date < today;
    const isToday = date === today;
    return {
      id: `session_1_${i}`,
      planId: planId1,
      studentId: 'student_1',
      date,
      sessionNumber: i + 1,
      newMemorization: createRecitationItem(
        `سورة النساء الآيات ${35 + i * 10}–${44 + i * 10}`,
        isPastDate ? 'completed' : 'not_piked',
        isPastDate ? Math.floor(Math.random() * 3) : 0
      ),
      recentRevision: createRecitationItem(
        `سورة النساء الآيات ${25 + i * 10}–${34 + i * 10}`,
        isPastDate ? 'completed' : 'not_piked',
        isPastDate ? Math.floor(Math.random() * 2) : 0
      ),
      distantRevision: createRecitationItem(
        i % 2 === 0 ? 'سورة الملك كاملة' : 'سورة الرحمن كاملة',
        isPastDate ? 'completed' : 'not_piked',
        isPastDate ? Math.floor(Math.random() * 2) : 0
      ),
      overallRating: isPastDate ? 'excellent' : undefined,
      completed: isPastDate,
      completedAt: isPastDate ? now : undefined,
      notes: isPastDate && i === 0 ? 'ماشاء الله، أداء ممتاز' : '',
    };
  });

  // ── Sessions for plan_2 ──────────
  const plan2Dates = getRecitationDatesForSeed('2026-08-01', '2026-08-31', [6, 1, 3]);
  const plan2Sessions: Session[] = plan2Dates.map((date, i) => {
    const isPastDate = date < today;
    return {
      id: `session_2_${i}`,
      planId: planId2,
      studentId: 'student_2',
      date,
      sessionNumber: i + 1,
      newMemorization: createRecitationItem(
        `سورة آل عمران الآيات ${120 + i * 8}–${127 + i * 8}`,
        isPastDate ? (i % 3 === 0 ? 'needs_retry' : 'completed') : 'not_piked',
        isPastDate ? Math.floor(Math.random() * 5) : 0
      ),
      recentRevision: createRecitationItem(
        `سورة آل عمران الآيات ${112 + i * 8}–${119 + i * 8}`,
        isPastDate ? 'completed' : 'not_piked'
      ),
      distantRevision: createRecitationItem(
        'سورة البقرة الآيات 255–265',
        isPastDate ? 'completed' : 'not_piked'
      ),
      overallRating: isPastDate ? (i % 3 === 0 ? 'good' : 'very_good') : undefined,
      completed: isPastDate,
      completedAt: isPastDate ? now : undefined,
    };
  });

  // ── Sessions for plan_3 (needs attention student) ──────────
  const plan3Dates = getRecitationDatesForSeed('2026-08-01', '2026-08-31', [0, 2, 4]);
  const plan3Sessions: Session[] = plan3Dates.map((date, i) => {
    const isPastDate = date < today;
    // This student misses some sessions
    const didAttend = isPastDate ? i % 3 !== 2 : false;
    return {
      id: `session_3_${i}`,
      planId: planId3,
      studentId: 'student_3',
      date,
      sessionNumber: i + 1,
      newMemorization: createRecitationItem(
        `سورة الأنعام الآيات ${90 + i * 7}–${96 + i * 7}`,
        didAttend ? 'completed' : 'not_piked',
        didAttend ? Math.floor(Math.random() * 6) : 0
      ),
      recentRevision: createRecitationItem(
        `سورة الأنعام الآيات ${83 + i * 7}–${89 + i * 7}`,
        didAttend ? 'completed' : 'not_piked'
      ),
      distantRevision: createRecitationItem(
        'سورة المائدة الآيات 1–20',
        didAttend ? 'needs_retry' : 'not_piked'
      ),
      overallRating: didAttend ? 'needs_attention' : undefined,
      completed: didAttend,
      completedAt: didAttend ? now : undefined,
      notes: didAttend && i === 1 ? 'يحتاج تكرار المراجعة البعيدة' : '',
    };
  });

  // ── Sessions for plan_5 (behind student) ──────────
  const plan5Dates = getRecitationDatesForSeed('2026-08-01', '2026-08-31', [6, 1, 3]);
  const plan5Sessions: Session[] = plan5Dates.map((date, i) => {
    const isPastDate = date < today;
    // This student misses many sessions
    const didAttend = isPastDate ? i % 2 === 0 : false;
    return {
      id: `session_5_${i}`,
      planId: planId5,
      studentId: 'student_5',
      date,
      sessionNumber: i + 1,
      newMemorization: createRecitationItem(
        `سورة هود الآيات ${50 + i * 5}–${54 + i * 5}`,
        didAttend ? 'needs_retry' : 'not_piked',
        didAttend ? Math.floor(Math.random() * 8) : 0
      ),
      recentRevision: createRecitationItem(
        `سورة هود الآيات ${45 + i * 5}–${49 + i * 5}`,
        didAttend ? 'completed' : 'not_piked'
      ),
      distantRevision: createRecitationItem(
        'سورة يونس الآيات 1–15',
        didAttend ? 'needs_retry' : 'not_piked'
      ),
      overallRating: didAttend ? 'needs_attention' : undefined,
      completed: didAttend,
      completedAt: didAttend ? now : undefined,
    };
  });

  // Save all sessions
  [...plan1Sessions, ...plan2Sessions, ...plan3Sessions, ...plan5Sessions].forEach(
    (s) => sessionRepository.create(s)
  );
}

function getRecitationDatesForSeed(
  startDate: string,
  endDate: string,
  recitationDays: number[]
): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    if (recitationDays.includes(current.getDay())) {
      dates.push(current.toISOString().split('T')[0]);
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function clearSeedData(): void {
  studentRepository.clear();
  planRepository.clear();
  sessionRepository.clear();
}
