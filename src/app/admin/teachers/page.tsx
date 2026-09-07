'use client';

import { useState, useEffect } from 'react';
import { UserCheck, Clock, Calendar, MapPin, Users, CheckCircle, XCircle } from 'lucide-react';
import { attendanceRepository } from '@/lib/repositories/attendance-repository';

interface Teacher {
  id: string;
  name: string;
  username: string;
  schedule: string[];
}

const TEACHERS: Teacher[] = [
  { 
    id: '1', 
    name: 'عبدالرحمن فتحي', 
    username: 'عبدالرحمن',
    schedule: ['الأحد (الظهر - العصر)', 'الثلاثاء (الظهر - العصر)', 'الخميس (الظهر - العصر)']
  },
  { 
    id: '2', 
    name: 'ش/أحمد حمادة', 
    username: 'أحمد',
    schedule: ['الأحد (الظهر - العصر)', 'الثلاثاء (الظهر - العصر)', 'الخميس (الظهر - العصر)']
  },
  { 
    id: '3', 
    name: 'ش/بلال سليمان', 
    username: 'بلال',
    schedule: ['السبت (الظهر - العصر)', 'الاثنين (الظهر - العصر)', 'الأربعاء (الظهر - العصر)']
  },
  {
    id: 'admin',
    name: 'د/محمد عبدالرحيم',
    username: 'admin',
    schedule: ['الاثنين (العصر - المغرب)', 'الخميس (العصر - المغرب)']
  },
];

export default function AdminTeachersPage() {
  const [loading, setLoading] = useState(true);
  const [teacherAttendance, setTeacherAttendance] = useState<Record<string, any>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const attendance = await attendanceRepository.getAll();
        const today = new Date().toISOString().split('T')[0];
        
        const attendanceMap: Record<string, any> = {};
        
        for (const teacher of TEACHERS) {
          const todayRecord = attendance.find(a => a.teacherId === teacher.id && a.date === today);
          const weekRecords = attendance.filter(a => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return a.teacherId === teacher.id && a.date >= weekAgo.toISOString().split('T')[0];
          });
          
          attendanceMap[teacher.id] = {
            todayRecord,
            weeklyRecords: weekRecords.length,
            totalDuration: weekRecords.reduce((sum, r) => sum + (r.duration || 0), 0),
          };
        }
        
        setTeacherAttendance(attendanceMap);
      } catch (error) {
        console.error('Failed to load teacher attendance:', error);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">فريق المعلمين</h1>
          <p className="text-gray-500">نظرة عامة على المعلمين ومواعيد عملهم</p>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEACHERS.map((teacher) => {
            return (
              <div key={teacher.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <UserCheck className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{teacher.name}</h3>
                    <p className="text-sm text-gray-500">@{teacher.username}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-700">مواعيد العمل</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {teacher.schedule.map((day, idx) => (
                      <div key={idx} className="bg-white px-3 py-2 rounded-lg text-xs text-slate-700 font-medium shadow-sm">
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
