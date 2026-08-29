'use client';

import { Menu } from 'lucide-react';

interface TopbarProps {
  onMenuToggle: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
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

        {/* Right side placeholder for future use */}
        <div />
      </div>
    </header>
  );
}
