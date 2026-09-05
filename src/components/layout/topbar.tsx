'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, User } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  username: string;
}

interface TopbarProps {
  onMenuToggle: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    const teacherData = localStorage.getItem('teacher');
    if (teacherData) {
      setTeacher(JSON.parse(teacherData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('teacher');
    router.push('/login');
  };

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
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
