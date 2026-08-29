'use client';

import { useState, useEffect } from 'react';
import { KeyRound } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // We use sessionStorage so that they have to enter it every time they open the website/tab fresh
  useEffect(() => {
    const authStatus = sessionStorage.getItem('quran_tracker_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '0174') {
      sessionStorage.setItem('quran_tracker_auth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.');
      setPassword('');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 dir-rtl">
      <div className="bg-white border border-stone-200 p-6 sm:p-8 rounded-xl shadow-md max-w-sm w-full text-center space-y-6 animate-fade-in">
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
          <KeyRound className="w-6 h-6" />
        </div>
        
        <div className="space-y-1.5">
          <h1 className="text-lg font-bold text-stone-900">نظام متابعة الحفظ</h1>
          <p className="text-xs text-stone-500">يرجى إدخال كلمة المرور للوصول إلى لوحة التحكم</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 text-right">
            <input
              type="password"
              placeholder="••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-center tracking-widest px-3 py-2.5 border border-stone-200 rounded-lg text-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
              required
              autoFocus
            />
            {error && (
              <p className="text-[11px] text-red-600 mt-1 text-center font-medium">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            دخول
          </button>
        </form>
      </div>
    </div>
  );
}
