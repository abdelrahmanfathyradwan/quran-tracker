'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { studentService } from '@/lib/services';
import { sessionRepository } from '@/lib/repositories';
import { formatArabicDate, isToday } from '@/lib/utils/date-utils';
import { getCommitmentColor, getCommitmentLabel } from '@/lib/utils/format-utils';
import { loadSeedData } from '@/lib/seed-data';
import { Session } from '@/lib/types/session';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    todaySessions: 0,
    regularStudents: 0,
    needsAttention: 0,
  });
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load statistics
    const dashboardStats = studentService.getDashboardStats();
    setStats(dashboardStats);

    // Get today's recitation sessions
    const sessions = sessionRepository.getTodaySessions();
    setTodaySessions(sessions);

    // Get student names for lookup
    const students = studentService.getDashboardStats(); // to trigger check, but let's grab directly
    const allStudents = require('@/lib/repositories/student-repository').studentRepository.getAll();
    const nameMap: Record<string, string> = {};
    allStudents.forEach((s: any) => {
      nameMap[s.id] = s.name;
    });
    setStudentNames(nameMap);
    setLoading(false);
  }, []);

  const arabicDate = formatArabicDate(new Date());

  if (loading) {
    return <div className="py-8 text-center text-stone-500">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
      <div className="flex flex-row justify-between">
         <h1 className="text-2xl font-bold text-green-700">اللهم صلي و سلم و بارك علي سيدنا محمد</h1>
         <h4 className="text-xl font-bold text-green-700">طلاب / عبدالحمن</h4>
      </div>
        <p className="text-stone-500 text-sm">{arabicDate}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200/80">
          <div className="flex items-center justify-between">
            <span className="text-stone-500 text-sm font-medium">إجمالي الطلاب</span>
            <Users className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-2xl font-bold text-stone-800 mt-2">{stats.totalStudents}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200/80">
          <div className="flex items-center justify-between">
            <span className="text-stone-500 text-sm font-medium">تسميع اليوم</span>
            <BookOpen className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-2xl font-bold text-stone-800 mt-2">{stats.todaySessions}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200/80">
          <div className="flex items-center justify-between">
            <span className="text-stone-500 text-sm font-medium">الطلاب المنتظمون</span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{stats.regularStudents}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200/80">
          <div className="flex items-center justify-between">
            <span className="text-stone-500 text-sm font-medium">يحتاج متابعة</span>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{stats.needsAttention}</p>
        </div>
      </div>

      {/* Today's Recitations */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-stone-900">تسميع اليوم</h2>
        
        {todaySessions.length === 0 ? (
          <div className="bg-white border border-stone-200/80 rounded-xl p-8 text-center text-stone-500">
            لا توجد جلسات تسميع مجدولة لليوم.
          </div>
        ) : (
          <div className="bg-white border border-stone-200/80 rounded-xl overflow-hidden">
            <div className="divide-y divide-stone-100">
              {todaySessions.map((session) => (
                <div key={session.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-stone-800 text-[15px]">
                      {studentNames[session.studentId] || 'طالب'}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
                      <span>
                        <strong className="text-stone-700">الجديد:</strong> {session.newMemorization.content || 'غير محدد'}
                      </span>
                      <span>
                        <strong className="text-stone-700">المراجعة القريبة:</strong> {session.recentRevision.content || 'غير محدد'}
                      </span>
                      <span>
                        <strong className="text-stone-700">البعيدة:</strong> {session.distantRevision.content || 'غير محدد'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {session.completed ? (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        تم الحفظ
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                        مجدول
                      </span>
                    )}

                    <Link
                      href={`/recitation/${session.id}`}
                      className="px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors"
                    >
                      {session.completed ? 'عرض التسميع' : 'بدء التسميع'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
