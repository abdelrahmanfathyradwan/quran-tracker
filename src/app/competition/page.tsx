'use client';

import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { sessionRepository } from '@/lib/repositories/session-repository';
import { studentRepository } from '@/lib/repositories/student-repository';

interface StudentProgress {
  studentId: string;
  studentName: string;
  imageUrl?: string;
  progress: number; // 0-100
  rank: number;
}

export default function CompetitionPage() {
  const [studentsProgress, setStudentsProgress] = useState<StudentProgress[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const students = await studentRepository.getAll();
      const sessions = await sessionRepository.getAll();
      
      // Calculate progress for each student based on sessions
      const progressData: StudentProgress[] = students.map((student) => {
        const studentSessions = sessions.filter(s => s.studentId === student.id && s.completed);
        
        if (studentSessions.length === 0) {
          return {
            studentId: student.id,
            studentName: student.name,
            imageUrl: student.imageUrl || undefined,
            progress: 0,
            rank: 0,
          };
        }

        // Calculate progress based on completed sessions
        const totalSessions = 30; // Baseline
        const completedSessions = studentSessions.length;
        const progress = Math.min((completedSessions / totalSessions) * 100, 100);
        
        return {
          studentId: student.id,
          studentName: student.name,
          imageUrl: student.imageUrl || undefined,
          progress,
          rank: 0,
        };
      });

      // Sort by progress and assign ranks
      const sorted = progressData.sort((a, b) => b.progress - a.progress);
      sorted.forEach((student, index) => {
        student.rank = index + 1;
      });

      setStudentsProgress(sorted);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 text-lg">جاري تحضير السباق...</div>
      </div>
    );
  }

  if (!studentsProgress || studentsProgress.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 text-center">
          <h2 className="text-xl font-bold mb-2">لا يوجد طلاب</h2>
          <p className="text-gray-500">أضف الطلاب لبدء السباق</p>
        </div>
      </div>
    );
  }

  const firstName = (name: string) => name.split(' ')[0];

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">رحلة التقدم</h1>
            <Zap className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-gray-500 text-sm">كل خطوة تقربك من هدفك</p>
        </div>

        {/* Track Labels */}
        <div className="flex justify-between mb-2 px-4">
          <div className="text-gray-500 text-sm font-medium">البداية</div>
          <div className="text-gray-500 text-sm font-medium">الهدف 🏆</div>
        </div>

        {/* Race Track */}
        <div className="space-y-4">
          {studentsProgress.map((student, index) => {
            const isCompleted = student.progress >= 100;
            
            return (
              <div key={student.studentId} className="relative">
                {/* Lane */}
                <div className="relative h-16 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  
                  {/* Track Lines */}
                  <div className="absolute inset-0 flex">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="flex-1 border-r border-gray-200" />
                    ))}
                  </div>

                  {/* Start Line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300" />
                  
                  {/* Finish Line */}
                  <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-amber-400" />

                  {/* Student Avatar on Track */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
                    style={{ left: `${Math.max(student.progress * 0.85, 5)}%` }}
                  >
                    <div className="flex items-center gap-2">
                      {/* Avatar */}
                      {student.imageUrl ? (
                        <img
                          src={student.imageUrl}
                          alt={student.studentName}
                          className={`w-10 h-10 rounded-full object-cover border-2 ${
                            isCompleted ? 'border-emerald-500' : 'border-gray-400'
                          }`}
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border-2 ${
                          isCompleted ? 'bg-emerald-500 border-emerald-500' : 'bg-gray-400 border-gray-400'
                        }`}>
                          {student.studentName.charAt(0)}
                        </div>
                      )}
                      
                      {/* Name & Progress */}
                      <div className="flex flex-col">
                        <div className="text-gray-900 font-semibold text-sm">
                          {firstName(student.studentName)}
                        </div>
                        <div className={`text-xs font-medium ${
                          isCompleted ? 'text-emerald-600' : 'text-gray-500'
                        }`}>
                          {student.progress.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
