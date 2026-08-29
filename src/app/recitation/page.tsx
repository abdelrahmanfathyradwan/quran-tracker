'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, CheckSquare } from 'lucide-react';
import { sessionRepository } from '@/lib/repositories/session-repository';
import { studentRepository } from '@/lib/repositories/student-repository';
import { PageHeader, EmptyState } from '@/components/shared';
import { formatArabicDateWithDay } from '@/lib/utils/date-utils';
import { Session } from '@/lib/types/session';

export default function RecitationPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load sessions scheduled for today
    const todaySessions = sessionRepository.getTodaySessions();
    setSessions(todaySessions);

    // Grab student names for lookup
    const allStudents = studentRepository.getAll();
    const nameMap: Record<string, string> = {};
    allStudents.forEach((s) => {
      nameMap[s.id] = s.name;
    });
    setStudentNames(nameMap);
    setLoading(false);
  }, []);

  if (loading) return <div className="py-8 text-center text-stone-500">جاري التحميل...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="جلسات التسميع اليومية"
        description="استعرض حلقات الطلاب لليوم وقم بتسجيل أداء التسميع الجديد والمراجعة"
      />

      {sessions.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="لا توجد جلسات اليوم"
          description="لا تتوفر جلسات مبرمجة لليوم في الخطط الحالية للطلاب."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-stone-800 text-[15px]">
                    {studentNames[session.studentId] || 'طالب'}
                  </h3>
                  <span className="text-stone-400 text-xs mt-1 block">
                    جلسة رقم {session.sessionNumber} — {formatArabicDateWithDay(session.date)}
                  </span>
                </div>
                {session.completed ? (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    مكتملة
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                    مجدولة اليوم
                  </span>
                )}
              </div>

              <div className="space-y-2 border-t border-stone-100 pt-3 text-sm text-stone-600">
                <div className="flex justify-between">
                  <span className="text-stone-400">الجديد:</span>
                  <span className="font-medium text-stone-800">{session.newMemorization.content || 'غير محدد'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">المراجعة القريبة:</span>
                  <span className="font-medium text-stone-800">{session.recentRevision.content || 'غير محدد'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">المراجعة البعيدة:</span>
                  <span className="font-medium text-stone-800">{session.distantRevision.content || 'غير محدد'}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/recitation/${session.id}`}
                  className="block text-center w-full py-2 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-800 transition-colors"
                >
                  {session.completed ? 'عرض التسميع والملاحظات' : 'تسميع الطالب الآن'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
