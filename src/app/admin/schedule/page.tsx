'use client';

import { Clock, Calendar, Users } from 'lucide-react';

interface ScheduleItem {
  day: string;
  sessions: {
    time: string;
    teachers: string[];
    type?: string;
  }[];
}

export default function AdminSchedulePage() {
  const schedule: ScheduleItem[] = [
    {
      day: 'السبت',
      sessions: [
        { time: 'الظهر - العصر', teachers: ['ش بلال سليمان'] },
      ],
    },
    {
      day: 'الأحد',
      sessions: [
        { time: 'الظهر - العصر', teachers: ['عبدالرحمن فتحي', 'ش أحمد حمادة'] },
      ],
    },
    {
      day: 'الاثنين',
      sessions: [
        { time: 'الظهر - العصر', teachers: ['ش بلال سليمان'] },
        { time: 'العصر - المغرب', teachers: ['د/محمد عبدالرحيم'] },
      ],
    },
    {
      day: 'الثلاثاء',
      sessions: [
        { time: 'الظهر - العصر', teachers: ['عبدالرحمن فتحي', 'ش أحمد حمادة'] },
      ],
    },
    {
      day: 'الأربعاء',
      sessions: [
        { time: 'الظهر - العصر', teachers: ['ش بلال سليمان'] },
      ],
    },
    {
      day: 'الخميس',
      sessions: [
        { time: 'الظهر - العصر', teachers: ['عبدالرحمن فتحي', 'ش أحمد حمادة'] },
        { time: 'العصر - المغرب', teachers: ['د/محمد عبدالرحيم'] },
      ],
    },
    {
      day: 'الجمعة',
      sessions: [
        { time: 'بعد العصر', teachers: [], type: 'مجلس إعدادي وثانوي "شباب المسلمي"' },
        { time: 'بعد المغرب', teachers: [], type: 'مجلس الكبار (الكلية فما فوق)' },
      ],
    },
  ];

  const totalSessions = schedule.reduce((sum, day) => sum + day.sessions.length, 0);
  const hasSpecialSessions = schedule.some(day => day.sessions.some(s => s.type));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">جدول العمل الأسبوعي</h1>
          <p className="text-gray-500">ساعات عمل المركز والمجالس على مدار الأسبوع</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">7</div>
                <div className="text-sm text-gray-500">أيام العمل</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{totalSessions}</div>
                <div className="text-sm text-gray-500">جلسات أسبوعياً</div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedule.map((item) => (
            <div
              key={item.day}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Day Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xl">{item.day}</h3>
                    <p className="text-emerald-100 text-sm">{item.sessions.length} جلسة</p>
                  </div>
                </div>
              </div>

              {/* Sessions */}
              <div className="p-5 space-y-4">
                {item.sessions.map((session, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-3 font-bold">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>{session.time}</span>
                    </div>
                    
                    {session.type ? (
                      <div className="text-sm text-gray-700 font-medium bg-purple-100 px-4 py-3 rounded-lg border border-purple-200">
                        {session.type}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {session.teachers.map((teacher, tIdx) => (
                          <div key={tIdx} className="flex items-center gap-3 text-sm bg-white px-4 py-3 rounded-lg shadow-sm border border-slate-200">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-gray-700 font-medium">{teacher}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
