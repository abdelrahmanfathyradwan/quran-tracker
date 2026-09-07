'use client';

import { useState, useEffect } from 'react';
import { Users, Calendar, Clock, Building2 } from 'lucide-react';
import { studentRepository } from '@/lib/repositories/student-repository';
import { attendanceRepository } from '@/lib/repositories/attendance-repository';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 4,
    todayAttendance: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const students = await studentRepository.getAll();
        const attendance = await attendanceRepository.getAll();

        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = attendance.filter(a => a.date === today).length;

        setStats({
          totalStudents: students.length,
          totalTeachers: 4,
          todayAttendance,
        });
      } catch (error) {
        console.error('Failed to load admin data:', error);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-gray-600 text-lg">جاري تحميل البيانات...</div>
      </div>
    );
  }

  const schedule = [
    { day: 'السبت', hours: 'الظهر - العصر', teachers: 'ش بلال سليمان' },
    { day: 'الأحد', hours: 'الظهر - العصر', teachers: 'عبدالرحمن فتحي، ش أحمد حمادة' },
    { day: 'الاثنين', hours: 'الظهر - العصر، العصر - المغرب', teachers: 'ش بلال سليمان، د/محمد عبدالرحيم' },
    { day: 'الثلاثاء', hours: 'الظهر - العصر', teachers: 'عبدالرحمن فتحي، ش أحمد حمادة' },
    { day: 'الأربعاء', hours: 'الظهر - العصر', teachers: 'ش بلال سليمان' },
    { day: 'الخميس', hours: 'الظهر - العصر، العصر - المغرب', teachers: 'عبدالرحمن فتحي، ش أحمد حمادة، د/محمد عبدالرحيم' },
    { day: 'الجمعة', hours: 'بعد العصر، بعد المغرب', teachers: 'مجالس خاصة' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">نظرة عامة على المركز</h1>
          <p className="text-gray-500 text-lg">إحصائيات ومعلومات عن المركز</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900">{stats.totalStudents}</div>
                <div className="text-gray-500 mt-1">عدد الطلاب</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900">{stats.totalTeachers}</div>
                <div className="text-gray-500 mt-1">عدد المعلمين</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900">{stats.todayAttendance}</div>
                <div className="text-gray-500 mt-1">حضور اليوم</div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">ساعات عمل المركز</h2>
                <p className="text-emerald-100 text-sm">جدول العمل الأسبوعي</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedule.map((item) => (
                <div
                  key={item.day}
                  className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-lg">{item.day}</h3>
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2 font-medium">{item.hours}</div>
                  <div className="text-xs text-gray-500 bg-white px-3 py-2 rounded-lg border border-slate-200">
                    {item.teachers}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
