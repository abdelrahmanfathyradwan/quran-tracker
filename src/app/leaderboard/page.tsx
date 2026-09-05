'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Crown,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Medal,
  Star,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { sessionRepository } from '@/lib/repositories/session-repository';
import { studentRepository } from '@/lib/repositories/student-repository';
import {
  formatArabicDate,
  getTodayString,
} from '@/lib/utils/date-utils';
import { Session } from '@/lib/types/session';
import { calculateStudentScore, rankStudents, StudentScore } from '@/lib/scoring';

// ─── Component ───────────────────────────────────────────────────
export default function LeaderboardPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [rankedStudents, setRankedStudents] = useState<(StudentScore & { rank: number })[] | null>(null);

  useEffect(() => {
    async function loadData() {
      const students = await studentRepository.getAll();
      const studentMap: Record<string, any> = {};
      students.forEach((s) => {
        studentMap[s.id] = s;
      });

      const sessions = await sessionRepository.getByDate(selectedDate);
      const completedSessions = sessions.filter((s) => s.completed);

      // Calculate scores for each student
      const scores = completedSessions.map((session) => {
        const student = studentMap[session.studentId];
        if (!student) return null;
        return calculateStudentScore(session, student);
      }).filter(Boolean) as StudentScore[];

      // Rank students
      const ranked = rankStudents(scores);
      setRankedStudents(ranked);
    }
    loadData();
  }, [selectedDate]);

  const navigateDate = (direction: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + direction);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  if (!rankedStudents) return <div className="py-8 text-center text-stone-500">جاري التحميل...</div>;

  const knight = rankedStudents.length > 0 ? rankedStudents[0] : null;

  return (
    <div className="max-w-4xl mx-auto pb-16 animate-fade-in" id="leaderboard-page">
      
      {/* ─── Refined Header & Date Picker ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-stone-200/60 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            فارس الحلقة
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            سجل التفوق والمنافسة اليومية للطلاب
          </p>
        </div>

        <div className="flex items-center bg-white rounded-full border border-stone-200 shadow-sm overflow-hidden p-1">
          <button
            onClick={() => navigateDate(1)}
            className="p-1.5 rounded-full hover:bg-stone-50 text-stone-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-3 relative min-w-[140px] justify-center">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-stone-700 text-[13px]">
              {formatArabicDate(new Date(selectedDate))}
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <button
            onClick={() => navigateDate(-1)}
            className="p-1.5 rounded-full hover:bg-stone-50 text-stone-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ─── No Data ─── */}
      {rankedStudents.length === 0 ? (
        <div className="bg-white border border-stone-100 rounded-2xl p-16 text-center shadow-sm">
          <Trophy className="w-12 h-12 text-stone-200 mx-auto mb-4" />
          <h3 className="font-semibold text-stone-700">
            لا يوجد سجل للتسميع في هذا اليوم
          </h3>
          <p className="text-stone-400 text-sm mt-2">
            عُد إلى صفحة التسميع لإضافة الجلسات، أو اختر تاريخاً آخر.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* ─── Elegant Champion Banner ─── */}
          {knight && (
            <div className="relative mx-auto max-w-4xl">
              {/* Main Card */}
              <div className="relative overflow-hidden rounded-[2.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)]">
                
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700" />
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-amber-500/10 to-orange-600/20" />
                
                {/* Spotlights */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-300/30 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-400/30 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '1s'}} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-300/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '0.5s'}} />
                
                {/* Radial Spotlight from Center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-yellow-200/30 via-transparent to-transparent rounded-full" />
                
                {/* Floating Stars */}
                <div className="absolute top-12 left-20 animate-bounce" style={{animationDuration: '3s'}}>
                  <Star className="w-8 h-8 text-yellow-200 drop-shadow-[0_0_20px_rgba(253,224,71,0.9)]" />
                </div>
                <div className="absolute top-24 right-24 animate-bounce" style={{animationDuration: '2.5s', animationDelay: '0.5s'}}>
                  <Star className="w-6 h-6 text-yellow-100 drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]" />
                </div>
                <div className="absolute bottom-20 left-32 animate-bounce" style={{animationDuration: '3.5s', animationDelay: '1s'}}>
                  <Star className="w-7 h-7 text-amber-200 drop-shadow-[0_0_18px_rgba(253,224,71,0.85)]" />
                </div>
                <div className="absolute bottom-32 right-16 animate-bounce" style={{animationDuration: '2.8s', animationDelay: '1.5s'}}>
                  <Star className="w-5 h-5 text-yellow-100 drop-shadow-[0_0_12px_rgba(253,224,71,0.75)]" />
                </div>
                
                {/* Content */}
                <div className="relative z-10 py-16 px-8">
                  
                  {/* Crown Badge */}
                  <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-3 bg-white/25 backdrop-blur-md px-6 py-3 rounded-full border-2 border-white/40 shadow-2xl">
                      <Crown className="w-6 h-6 text-yellow-200 animate-bounce" style={{animationDuration: '2s'}} />
                      <span className="text-white font-bold text-lg tracking-wider">
                        فارس الحلقة اليوم
                      </span>
                    </div>
                  </div>
                  
                  {/* Student Image - Centered & Large */}
                  <div className="flex justify-center mb-8">
                    <div className="relative">
                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/50 to-amber-500/50 blur-3xl rounded-full animate-pulse" />
                      
                      {/* Image Container */}
                      <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-6 border-white/50 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] bg-white/10 backdrop-blur-sm">
                        {knight.imageUrl ? (
                          <img
                            src={knight.imageUrl}
                            alt={knight.studentName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-200 to-amber-400">
                            <span className="text-6xl md:text-7xl font-bold text-amber-900">
                              {knight.studentName.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Floating Crown */}
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(253,224,71,0.9)] border-4 border-white animate-bounce">
                        <Crown className="w-8 h-8 text-amber-900" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Student Name - Large & Centered */}
                  <div className="text-center mb-8">
                    <h2 className="text-5xl md:text-7xl font-black text-white mb-2 drop-shadow-[0_6px_30px_rgba(0,0,0,0.4)]">
                      {knight.studentName}
                    </h2>
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1 w-32 bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="flex flex-wrap items-center justify-center gap-6">
                    {/* Score Card */}
                    <div className="bg-white/25 backdrop-blur-md px-8 py-4 rounded-2xl border-2 border-white/40 shadow-2xl min-w-[140px]">
                      <div className="flex flex-col items-center">
                        <Sparkles className="w-8 h-8 text-yellow-200 mb-2" />
                        <span className="text-white/80 text-sm mb-1">النقاط</span>
                        <span className="text-4xl font-black text-white">{knight.totalScore}</span>
                      </div>
                    </div>
                    
                    {/* Fajr Prayer Card */}
                    {knight.prayedFajr && (
                      <div className="bg-emerald-500/30 backdrop-blur-md px-8 py-4 rounded-2xl border-2 border-emerald-400/60 shadow-2xl min-w-[140px]">
                        <div className="flex flex-col items-center">
                          <Sun className="w-8 h-8 text-emerald-200 mb-2" />
                          <span className="text-white/80 text-sm mb-1">صلاة الفجر</span>
                          <span className="text-3xl font-bold text-white">+10</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Mistakes Card */}
                    <div className="bg-white/25 backdrop-blur-md px-8 py-4 rounded-2xl border-2 border-white/40 shadow-2xl min-w-[140px]">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center mb-2">
                          <span className="text-white text-lg">!</span>
                        </div>
                        <span className="text-white/80 text-sm mb-1">الأخطاء</span>
                        <span className="text-4xl font-black text-white">{knight.totalMistakes}</span>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          )}

          {/* ─── Clean Leaderboard List ─── */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">

            {/* List Header */}
            <div className="grid grid-cols-12 gap-4 border-b border-stone-100 bg-stone-50/50 px-6 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wide">
              <div className="col-span-1 text-center">المركز</div>
              <div className="col-span-5 text-right pl-4">اسم الطالب</div>
              <div className="col-span-3 text-center">النقاط</div>
              <div className="col-span-3 text-center">الفجر</div>
            </div>

            {/* List Items */}
            <div className="divide-y divide-stone-100">
              {rankedStudents.map((student, idx) => {
                const isChampion = student.rank === 1;

                return (
                  <div
                    key={student.studentId}
                    className={`grid grid-cols-12 gap-4 items-center px-6 py-4 transition-colors hover:bg-stone-50/50 ${isChampion ? 'bg-amber-50/10' : ''}`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 flex justify-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isChampion
                          ? 'bg-amber-100 text-amber-700 ring-4 ring-amber-50'
                          : student.rank === 2
                            ? 'bg-slate-100 text-slate-700'
                            : student.rank === 3
                              ? 'bg-orange-100 text-orange-700'
                              : 'text-stone-400'
                      }`}>
                        {student.rank}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="col-span-5 flex items-center gap-3">
                      {student.imageUrl ? (
                        <img
                          src={student.imageUrl}
                          alt={student.studentName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-stone-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 border-2 border-emerald-300 flex items-center justify-center text-sm font-bold text-emerald-700">
                          {student.studentName.charAt(0)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className={`font-medium ${isChampion ? 'text-amber-900' : 'text-stone-700'}`}>
                          {student.studentName}
                        </span>
                        <span className="text-xs text-stone-400">{student.totalMistakes} خطأ</span>
                      </div>
                    </div>

                    {/* Total Score */}
                    <div className="col-span-3 flex justify-center">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-lg font-bold text-stone-800">{student.totalScore}</span>
                      </div>
                    </div>

                    {/* Fajr Prayer */}
                    <div className="col-span-3 flex justify-center">
                      {student.prayedFajr ? (
                        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                          <Sun className="w-4 h-4" />
                          <span className="text-xs font-semibold">صلى</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
                          <Moon className="w-4 h-4" />
                          <span className="text-xs">-</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
