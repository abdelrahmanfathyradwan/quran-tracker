'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface Teacher {
  id: string;
  name: string;
  username: string;
}

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/login') {
      setIsAuthenticated(true);
      return;
    }

    const teacherData = localStorage.getItem('teacher');
    if (teacherData) {
      const parsed = JSON.parse(teacherData);
      setTeacher(parsed);
      setIsAuthenticated(true);
    } else {
      router.push('/login');
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem('teacher');
    router.push('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {children}
    </>
  );
}
