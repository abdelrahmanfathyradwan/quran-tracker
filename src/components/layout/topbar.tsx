'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, User } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  username: string;
  role?: 'teacher' | 'admin';
}

interface TopbarProps {
  onMenuToggle: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    const loadTeacher = () => {
      const teacherData = localStorage.getItem('teacher');
      if (teacherData) {
        setTeacher(JSON.parse(teacherData));
      } else {
        setTeacher(null);
      }
    };

    loadTeacher();

    // Listen for storage changes (from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'teacher') {
        loadTeacher();
      }
    };

    // Reload teacher data when window gains focus (after navigation)
    const handleFocus = () => {
      loadTeacher();
    };

    // Listen for custom login event
    const handleLoginEvent = () => {
      loadTeacher();
    };

    // Listen for custom logout event
    const handleLogoutEvent = () => {
      setTeacher(null);
    };

    // Poll localStorage every 500ms to catch changes
    const intervalId = setInterval(loadTeacher, 500);

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('teacher-login', handleLoginEvent);
    window.addEventListener('teacher-logout', handleLogoutEvent);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('teacher-login', handleLoginEvent);
      window.removeEventListener('teacher-logout', handleLogoutEvent);
    };
  }, []);

  const handleLogout = async () => {
    // Check out attendance (only for teachers, not admins)
    if (teacher && teacher.role !== 'admin') {
      try {
        const { attendanceRepository } = await import('@/lib/repositories/attendance-repository');
        await attendanceRepository.checkOut(teacher.id);
      } catch (error) {
        console.error('Failed to check out attendance:', error);
      }
    }

    localStorage.removeItem('teacher');
    setTeacher(null); // Update state immediately
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('teacher-logout'));
    router.push('/login');
  };

  // Handle tab close
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (teacher && teacher.role !== 'admin') {
        try {
          const { attendanceRepository } = await import('@/lib/repositories/attendance-repository');
          await attendanceRepository.checkOut(teacher.id);
        } catch (error) {
          console.error('Failed to check out attendance:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [teacher]);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-30">
      <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Empty spacer for desktop (sidebar handles branding) */}
        <div className="hidden lg:block" />

        {/* Teacher info and logout */}
        {teacher && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">{teacher.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
              aria-label="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4 rotate-180 cursor-pointer" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
