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
} from 'lucide-react';
import { sessionRepository } from '@/lib/repositories/session-repository';
import { studentRepository } from '@/lib/repositories/student-repository';
import {
  formatArabicDate,
  getTodayString,
} from '@/lib/utils/date-utils';
import { Session } from '@/lib/types/session';

// ─── Types ───────────────────────────────────────────────────────
interface RankedStudent {
  rank: number;
  studentId: string;
  studentName: string;
  totalMistakes: number;
  session: Session;
  newMemMistakes: number;
  recentRevMistakes: number;
  distantRevMistakes: number;
}

// ─── Component ───────────────────────────────────────────────────
export default function LeaderboardPage() {
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

  const rankedStudents: RankedStudent[] = useMemo(() => {
    const sessions = sessionRepository.getByDate(selectedDate);
    const completedSessions = sessions.filter((s) => s.completed);

    const ranked = completedSessions.map((session) => {
      const newMemMistakes = session.newMemorization.mistakes || 0;
      const recentRevMistakes = session.recentRevision.mistakes || 0;
      const distantRevMistakes = session.distantRevision.mistakes || 0;
      const totalMistakes = newMemMistakes + recentRevMistakes + distantRevMistakes;

      return {
        rank: 0,
        studentId: session.studentId,
        studentName: allStudents[session.studentId] || 'طالب',
        totalMistakes,
        session,
        newMemMistakes,
        recentRevMistakes,
        distantRevMistakes,
      };
    });

    // Sort by fewest mistakes
    ranked.sort((a, b) => a.totalMistakes - b.totalMistakes);

    // Assign ranks
    let currentRank = 1;
    for (let i = 0; i < ranked.length; i++) {
      if (i > 0 && ranked[i].totalMistakes > ranked[i - 1].totalMistakes) {
        currentRank = i + 1;
      }
      ranked[i].rank = currentRank;
    }

    return ranked;
  }, [selectedDate, allStudents]);

  const navigateDate = (direction: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + direction);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

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
            <div className="animate-glow rounded-3xl border border-indigo-400/60 overflow-hidden flex items-center p-6 gap-6 relative bg-gradient-to-br from-indigo-600 via-blue-800 to-indigo-950 shadow-[0_15px_40px_-5px_rgba(79,70,229,0.5)]">
              
              {/* Shimmer Overlay */}
              <div className="absolute inset-0 animate-shimmer opacity-20 z-0 pointer-events-none mix-blend-overlay" />
              
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/20 rounded-full z-0 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full z-0 blur-3xl pointer-events-none" />
              
              {/* Floating Sparkles (Golden) */}
              <Star className="absolute top-4 left-6 w-6 h-6 text-yellow-300 animate-sparkle z-0 drop-shadow-[0_0_12px_rgba(253,224,71,0.9)]" style={{animationDelay: '0s'}} />
              <Star className="absolute top-14 left-20 w-4 h-4 text-yellow-100 animate-sparkle z-0 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]" style={{animationDelay: '0.7s'}} />
              <Star className="absolute bottom-6 left-12 w-5 h-5 text-amber-200 animate-sparkle z-0 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]" style={{animationDelay: '1.4s'}} />
              <Star className="absolute top-5 right-1/4 w-5 h-5 text-yellow-300 animate-sparkle z-0 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]" style={{animationDelay: '0.3s'}} />
              
              <div className="shrink-0 relative z-10 animate-float">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-200 via-amber-300 to-yellow-500 flex items-center justify-center border-2 border-yellow-100 relative shadow-[0_0_25px_rgba(253,224,71,0.6)]">
                  <Crown className="w-10 h-10 text-amber-900 animate-bounce-slow drop-shadow-sm" />
                </div>
              </div>
              
              <div className="grow z-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-black text-indigo-950 bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 px-4 py-1.5 rounded-full uppercase tracking-widest animate-pulse border border-yellow-100 shadow-[0_0_20px_rgba(253,224,71,0.6)]">
                    👑 فارس اليوم
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-300 to-amber-400 drop-shadow-[0_4px_15px_rgba(253,224,71,0.4)] bg-[length:200%_auto] animate-[shimmerSweep_3s_infinite_linear]">
                  {knight.studentName}
                </h2>
                <div className="text-base text-blue-100 mt-2 font-medium drop-shadow-sm flex items-center gap-2">
                  ✨ أتم التسميع اليوم {knight.totalMistakes === 0 ? (
                    <span className="text-indigo-950 font-bold bg-yellow-300 px-3 py-1 rounded-md border border-yellow-200 shadow-sm">بإتقان تام (بدون أي أخطاء)</span>
                  ) : (
                    <span className="text-blue-50">بمجموع <b className="text-yellow-400 text-xl mx-1.5">{knight.totalMistakes}</b> خطأ فقط</span>
                  )}
                </div>
              </div>

              {knight.totalMistakes === 0 && (
                <div className="hidden sm:flex shrink-0 items-center justify-center z-10 animate-float" style={{animationDelay: '1s'}}>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200 to-amber-400 border-2 border-yellow-100 flex items-center justify-center shadow-[0_0_35px_rgba(253,224,71,0.8)]">
                    <span className="text-3xl drop-shadow-sm">💎</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Clean Leaderboard List ─── */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
            
            {/* List Header */}
            <div className="grid grid-cols-12 gap-4 border-b border-stone-100 bg-stone-50/50 px-6 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wide">
              <div className="col-span-1 text-center">المركز</div>
              <div className="col-span-5 text-right pl-4">اسم الطالب</div>
              <div className="col-span-2 text-center text-[10px]">الجديد</div>
              <div className="col-span-2 text-center text-[10px]">القريبة</div>
              <div className="col-span-2 text-center text-[10px]">البعيدة</div>
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
                      <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-500">
                        {student.studentName.charAt(0)}
                      </div>
                      <span className={`font-medium ${isChampion ? 'text-amber-900' : 'text-stone-700'}`}>
                        {student.studentName}
                      </span>
                    </div>

                    {/* New Mem Mistakes */}
                    <div className="col-span-2 flex justify-center">
                      <MistakePill count={student.newMemMistakes} />
                    </div>

                    {/* Recent Rev Mistakes */}
                    <div className="col-span-2 flex justify-center">
                      <MistakePill count={student.recentRevMistakes} />
                    </div>

                    {/* Distant Rev Mistakes */}
                    <div className="col-span-2 flex justify-center">
                      <MistakePill count={student.distantRevMistakes} />
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

// ─── Shared Pill Component ───
function MistakePill({ count }: { count: number }) {
  if (count === 0) {
    return (
      <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/50">
        -
      </span>
    );
  }
  return (
    <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-semibold border ${
      count <= 3 
        ? 'bg-amber-50 text-amber-600 border-amber-100/50' 
        : 'bg-red-50 text-red-600 border-red-100/50'
    }`}>
      {count}
    </span>
  );
}
