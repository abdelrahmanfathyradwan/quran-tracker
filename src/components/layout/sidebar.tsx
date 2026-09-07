'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BookOpen,
  BarChart3,
  Settings,
  X,
  BookOpenCheck,
  History,
  Trophy,
  Zap,
  Clock,
  UserCheck,
  RefreshCw,
  CreditCard,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const teacherNavItems = [
  { href: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/students', label: 'الطلاب', icon: Users },
  { href: '/subscriptions', label: 'سداد الاشتراكات', icon: CreditCard },
  { href: '/handover-history', label: 'سجل التسليمات', icon: History },
  { href: '/plans', label: 'الخطط', icon: CalendarDays },
  { href: '/recitation', label: 'التسميع', icon: BookOpen },
  { href: '/reports', label: 'التقارير', icon: BarChart3 },
  { href: '/history', label: 'السجل', icon: History },
  { href: '/leaderboard', label: 'فارس اليوم', icon: Trophy },
  { href: '/competition', label: 'ماراثون التنافس', icon: Zap },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
];

const adminNavItems = [
  { href: '/admin', label: 'لوحة المدير', icon: LayoutDashboard },
  { href: '/students', label: 'الطلاب', icon: Users },
  { href: '/admin/teachers', label: 'المعلمين', icon: UserCheck },
  { href: '/admin/schedule', label: 'الجدول', icon: Clock },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const salawatCount = useSalawatCount();
  
  // Get user role from localStorage
  const [navItems, setNavItems] = useState(teacherNavItems);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const teacherData = localStorage.getItem('teacher');
    if (teacherData) {
      const teacher = JSON.parse(teacherData);
      if (teacher.role === 'admin') {
        setNavItems(adminNavItems);
        setIsAdmin(true);
      } else {
        setNavItems(teacherNavItems);
        setIsAdmin(false);
      }
    }
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`
        fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-200/80
        z-50 transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Logo area */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
        <Link href={isAdmin ? '/admin' : '/'} className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <BookOpenCheck className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-[15px]">
            {isAdmin ? 'نظرة عامة على المركز' : 'متابعة الحفظ'}
          </span>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 mt-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150
                ${
                  active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon className={`w-[18px] h-[18px] ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Salawat Prayer Counter */}
      <div className="absolute bottom-14 left-4 right-4 p-4.5 bg-stone-50 border border-stone-200/80 rounded-xl space-y-3">
        <p className="text-[11px] font-bold text-stone-700 text-center leading-relaxed">
          اللهم صلِّ وسلِّم وبارك على سيدنا محمد
        </p>
        
        <div className="flex items-center justify-between gap-2.5">
          <button
            onClick={() => {
              const current = localStorage.getItem('quran_tracker_salawat');
              const nextVal = (current ? parseInt(current) : 0) + 1;
              localStorage.setItem('quran_tracker_salawat', nextVal.toString());
              window.dispatchEvent(new Event('salawat-changed'));
            }}
            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold rounded-lg text-xs transition-all shadow-sm"
          >
            صلِّ عليه
          </button>
          
          <div className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-800 font-sans min-w-[36px] text-center">
            {salawatCount}
          </div>

          <button
            onClick={() => {
              if (confirm('هل تريد إعادة تعيين عداد الصلاة على النبي؟')) {
                localStorage.setItem('quran_tracker_salawat', '0');
                window.dispatchEvent(new Event('salawat-changed'));
              }
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors"
            title="إعادة تعيين العداد"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100">
        <div className="text-[10px] text-gray-400 text-center">
          متابعة الحفظ — الإصدار ١.٠
        </div>
      </div>
    </aside>
  );
}

// Simple state listener hook for local storage events to keep the UI in sync

function useSalawatCount() {
  const [count, setCount] = useState('0');

  useEffect(() => {
    const updateCount = () => {
      setCount(localStorage.getItem('quran_tracker_salawat') || '0');
    };
    
    updateCount();
    window.addEventListener('salawat-changed', updateCount);
    return () => window.removeEventListener('salawat-changed', updateCount);
  }, []);

  return count;
}
