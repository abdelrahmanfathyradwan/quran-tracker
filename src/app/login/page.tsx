'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'teacher' | 'admin';
}

const TEACHERS: Teacher[] = [
  { id: '1', name: 'عبدالرحمن فتحي', username: 'عبدالرحمن', password: '123456', role: 'teacher' },
  { id: '2', name: 'ش/أحمد حمادة', username: 'أحمد', password: '12345', role: 'teacher' },
  { id: '3', name: 'ش/بلال سليمان', username: 'بلال', password: '1234', role: 'teacher' },
  { id: 'admin', name: 'د/محمد عبدالرحيم', username: 'admin', password: 'admin123', role: 'admin' },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already logged in
    const teacherData = localStorage.getItem('teacher');
    if (teacherData) {
      router.push('/');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const teacher = TEACHERS.find(t => t.username === username && t.password === password);

    if (teacher) {
      localStorage.setItem('teacher', JSON.stringify(teacher));
      
      // Check in attendance (only for teachers, not admins)
      if (teacher.role === 'teacher') {
        try {
          const { attendanceRepository } = await import('@/lib/repositories/attendance-repository');
          await attendanceRepository.checkIn(teacher.id, teacher.name);
        } catch (error) {
          console.error('Failed to check in attendance:', error);
        }
      }
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('teacher-login'));
      
      // Redirect based on role
      if (teacher.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-stone-900 mb-2">تسجيل الدخول</h1>
          <p className="text-stone-500 text-sm">مركز مدارج</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">اسم المستخدم</label>
            <div className="relative">
              <User className="absolute right-3 top-3 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 w-4 h-4 text-stone-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            تسجيل الدخول
          </button>
        </form>

      </div>
    </div>
  );
}
