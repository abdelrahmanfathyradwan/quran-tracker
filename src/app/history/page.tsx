'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BookOpen,
  Users,
  Star,
  XCircle,
  FileText,
  Timer,
} from 'lucide-react';
import { sessionRepository } from '@/lib/repositories/session-repository';
import { studentRepository } from '@/lib/repositories/student-repository';
import {
  formatArabicDate,
  formatArabicDateWithDay,
  getTodayString,
} from '@/lib/utils/date-utils';
import {
  STATUS_LABELS,
  RATING_LABELS,
  RecitationStatus,
  SessionRating,
  Session,
} from '@/lib/types/session';

interface DaySummary {
  date: string;
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  students: {
    id: string;
    name: string;
    session: Session;
  }[];
  ratingBreakdown: Record<SessionRating, number>;
  statusBreakdown: {
    newMemorization: Record<RecitationStatus, number>;
    recentRevision: Record<RecitationStatus, number>;
    distantRevision: Record<RecitationStatus, number>;
  };
  totalMistakes: number;
}

function getStatusColor(status: RecitationStatus): string {
  const colors: Record<RecitationStatus, string> = {
    excellent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    very_good: 'text-blue-700 bg-blue-50 border-blue-200',
    good: 'text-amber-600 bg-amber-50 border-amber-200',
    retry: 'text-red-700 bg-red-50 border-red-200',
  };
  return colors[status];
}

function getRatingColor(rating: SessionRating): string {
  const colors: Record<SessionRating, string> = {
    excellent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    very_good: 'text-blue-700 bg-blue-50 border-blue-200',
    good: 'text-amber-600 bg-amber-50 border-amber-200',
    needs_attention: 'text-red-700 bg-red-50 border-red-200',
  };
  return colors[rating];
}

function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [allStudents, setAllStudents] = useState<Record<string, string>>({});

  useEffect(() => {
    const students = studentRepository.getAll();
    const nameMap: Record<string, string> = {};
    students.forEach((s) => {
      nameMap[s.id] = s.name;
    });
    setAllStudents(nameMap);
  }, []);

  const summary: DaySummary = useMemo(() => {
    const sessions = sessionRepository.getByDate(selectedDate);

    const ratingBreakdown: Record<SessionRating, number> = {
      excellent: 0,
      very_good: 0,
      good: 0,
      needs_attention: 0,
    };

    const statusBreakdown = {
      newMemorization: { excellent: 0, very_good: 0, good: 0, retry: 0 } as Record<RecitationStatus, number>,
      recentRevision: { excellent: 0, very_good: 0, good: 0, retry: 0 } as Record<RecitationStatus, number>,
      distantRevision: { excellent: 0, very_good: 0, good: 0, retry: 0 } as Record<RecitationStatus, number>,
    };

    let totalMistakes = 0;
    const completedSessions = sessions.filter((s) => s.completed);

    completedSessions.forEach((s) => {
      if (s.overallRating) {
        ratingBreakdown[s.overallRating]++;
      }

      statusBreakdown.newMemorization[s.newMemorization.status]++;
      statusBreakdown.recentRevision[s.recentRevision.status]++;
      statusBreakdown.distantRevision[s.distantRevision.status]++;

      totalMistakes +=
        (s.newMemorization.mistakes || 0) +
        (s.recentRevision.mistakes || 0) +
        (s.distantRevision.mistakes || 0);
    });

    return {
      date: selectedDate,
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      pendingSessions: sessions.length - completedSessions.length,
      students: sessions.map((s) => ({
        id: s.studentId,
        name: allStudents[s.studentId] || 'طالب',
        session: s,
      })),
      ratingBreakdown,
      statusBreakdown,
      totalMistakes,
    };
  }, [selectedDate, allStudents]);

  const navigateDate = (direction: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + direction);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === getTodayString();

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          سجل الأيام
        </h1>
        <p className="text-stone-500 text-sm">
          استعراض موجز أحداث وإحصائيات كل يوم
        </p>
      </div>

      {/* Date Navigator */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDate(1)}
            className="p-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
            title="اليوم التالي"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <Calendar className="w-4.5 h-4.5 text-emerald-600" />
            <div className="text-center">
              <h2 className="font-bold text-stone-900 text-[15px]">
                {formatArabicDate(new Date(selectedDate))}
              </h2>
              {isToday && (
                <span className="text-[11px] text-emerald-600 font-semibold">
                  اليوم
                </span>
              )}
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-5 h-5 opacity-0 absolute"
              id="date-picker"
            />
            <label
              htmlFor="date-picker"
              className="p-1.5 rounded-md hover:bg-stone-100 text-stone-400 cursor-pointer transition-colors"
              title="اختيار تاريخ"
            >
              <Calendar className="w-4 h-4" />
            </label>
          </div>

          <button
            onClick={() => navigateDate(-1)}
            className="p-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
            title="اليوم السابق"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Quick jump buttons */}
        <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-stone-100">
          <button
            onClick={() => setSelectedDate(getTodayString())}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
              isToday
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            اليوم
          </button>
          <button
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="px-3 py-1 text-xs font-semibold rounded-lg border bg-white text-stone-600 border-stone-200 hover:bg-stone-50 transition-all"
          >
            أمس
          </button>
          <button
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 2);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="px-3 py-1 text-xs font-semibold rounded-lg border bg-white text-stone-600 border-stone-200 hover:bg-stone-50 transition-all"
          >
            قبل يومين
          </button>
        </div>
      </div>

      {/* No Data State */}
      {summary.totalSessions === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-10 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-7 h-7 text-stone-400" />
          </div>
          <h3 className="font-semibold text-stone-700 text-[15px]">
            لا توجد جلسات في هذا اليوم
          </h3>
          <p className="text-stone-500 text-xs mt-1">
            جرب اختيار تاريخ آخر لاستعراض السجل
          </p>
        </div>
      ) : (
        <>
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-500 text-[11px] font-medium">إجمالي الجلسات</span>
                <BookOpen className="w-4 h-4 text-stone-400" />
              </div>
              <p className="text-xl font-bold text-stone-800">{summary.totalSessions}</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-500 text-[11px] font-medium">تم التسميع</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl font-bold text-emerald-600">{summary.completedSessions}</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-500 text-[11px] font-medium">لم يُسمّع</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl font-bold text-amber-600">{summary.pendingSessions}</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-500 text-[11px] font-medium">إجمالي الأخطاء</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-xl font-bold text-red-600">{summary.totalMistakes}</p>
            </div>
          </div>

          {/* Overall Ratings Distribution */}
          {summary.completedSessions > 0 && (
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-stone-800 text-[15px] flex items-center gap-2 border-b border-stone-100 pb-3">
                <Star className="w-4 h-4 text-amber-500" />
                توزيع التقييمات العامة
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(RATING_LABELS) as SessionRating[]).map((r) => (
                  <div
                    key={r}
                    className={`rounded-lg border p-3 text-center ${getRatingColor(r)}`}
                  >
                    <p className="text-lg font-bold">{summary.ratingBreakdown[r]}</p>
                    <p className="text-[11px] font-semibold mt-0.5">{RATING_LABELS[r]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Per-Student Breakdown */}
          <div className="space-y-3">
            <h3 className="font-bold text-stone-800 text-[15px] flex items-center gap-2">
              <Users className="w-4 h-4 text-stone-500" />
              تفاصيل الطلاب ({summary.students.length})
            </h3>

            <div className="space-y-3">
              {summary.students.map(({ id, name, session }) => (
                <div
                  key={session.id}
                  className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Student Header */}
                  <div className="flex items-center justify-between p-4 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${session.completed ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                      <h4 className="font-semibold text-stone-800 text-sm">{name}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.completed ? (
                        <>
                          {session.durationSeconds != null && session.durationSeconds > 0 && (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-stone-500 bg-stone-50 px-2 py-0.5 rounded-full border border-stone-200">
                              <Timer className="w-3 h-3" />
                              <span dir="ltr" className="font-mono">{formatDuration(session.durationSeconds)}</span>
                            </span>
                          )}
                          {session.overallRating && (
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getRatingColor(
                                session.overallRating
                              )}`}
                            >
                              {RATING_LABELS[session.overallRating]}
                            </span>
                          )}
                          <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            تم التسميع
                          </span>
                        </>
                      ) : (
                        <span className="text-[11px] font-medium text-stone-500 bg-stone-50 px-2 py-0.5 rounded-full border border-stone-200">
                          لم يُسمّع
                        </span>
                      )}
                      <Link
                        href={`/recitation/${session.id}`}
                        className="text-[11px] font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 px-2 py-0.5 rounded-lg transition-colors"
                      >
                        عرض ←
                      </Link>
                    </div>
                  </div>

                  {/* Session Details — only if completed */}
                  {session.completed && (
                    <div className="p-4 space-y-3">
                      {/* Three sections grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* New Memorization */}
                        <div className="bg-stone-50/50 rounded-lg p-3 border border-stone-100 space-y-2">
                          <p className="text-[11px] font-bold text-stone-600">الحفظ الجديد</p>
                          <p className="text-[11px] text-stone-500 leading-relaxed">
                            {session.newMemorization.content || '—'}
                          </p>
                          {session.newMemorization.amount && (
                            <p className="text-[10px] text-stone-400">
                              المقدار: {session.newMemorization.amount}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-1">
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getStatusColor(
                                session.newMemorization.status
                              )}`}
                            >
                              {STATUS_LABELS[session.newMemorization.status]}
                            </span>
                            {session.newMemorization.mistakes > 0 && (
                              <span className="text-[10px] text-red-500 font-medium">
                                {session.newMemorization.mistakes} أخطاء
                              </span>
                            )}
                          </div>
                          {session.newMemorization.notes && (
                            <p className="text-[10px] text-stone-400 italic">
                              {session.newMemorization.notes}
                            </p>
                          )}
                        </div>

                        {/* Recent Revision */}
                        <div className="bg-stone-50/50 rounded-lg p-3 border border-stone-100 space-y-2">
                          <p className="text-[11px] font-bold text-stone-600">المراجعة القريبة</p>
                          <p className="text-[11px] text-stone-500 leading-relaxed">
                            {session.recentRevision.content || '—'}
                          </p>
                          {session.recentRevision.amount && (
                            <p className="text-[10px] text-stone-400">
                              المقدار: {session.recentRevision.amount}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-1">
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getStatusColor(
                                session.recentRevision.status
                              )}`}
                            >
                              {STATUS_LABELS[session.recentRevision.status]}
                            </span>
                            {session.recentRevision.mistakes > 0 && (
                              <span className="text-[10px] text-red-500 font-medium">
                                {session.recentRevision.mistakes} أخطاء
                              </span>
                            )}
                          </div>
                          {session.recentRevision.notes && (
                            <p className="text-[10px] text-stone-400 italic">
                              {session.recentRevision.notes}
                            </p>
                          )}
                        </div>

                        {/* Distant Revision */}
                        <div className="bg-stone-50/50 rounded-lg p-3 border border-stone-100 space-y-2">
                          <p className="text-[11px] font-bold text-stone-600">المراجعة البعيدة</p>
                          <p className="text-[11px] text-stone-500 leading-relaxed">
                            {session.distantRevision.content || '—'}
                          </p>
                          {session.distantRevision.amount && (
                            <p className="text-[10px] text-stone-400">
                              المقدار: {session.distantRevision.amount}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-1">
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getStatusColor(
                                session.distantRevision.status
                              )}`}
                            >
                              {STATUS_LABELS[session.distantRevision.status]}
                            </span>
                            {session.distantRevision.mistakes > 0 && (
                              <span className="text-[10px] text-red-500 font-medium">
                                {session.distantRevision.mistakes} أخطاء
                              </span>
                            )}
                          </div>
                          {session.distantRevision.notes && (
                            <p className="text-[10px] text-stone-400 italic">
                              {session.distantRevision.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Session Notes */}
                      {session.notes && (
                        <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3">
                          <p className="text-[11px] font-semibold text-amber-700 mb-1">ملاحظات الشيخ:</p>
                          <p className="text-[11px] text-amber-600 leading-relaxed">{session.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
