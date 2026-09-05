'use client';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({ message = 'جاري التحميل...', size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className={`relative ${sizeClasses[size]}`}>
        <div className={`absolute inset-0 rounded-full border-4 border-stone-200`}></div>
        <div className={`absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin`}></div>
      </div>
      <p className={`text-stone-500 font-medium ${textClasses[size]}`}>{message}</p>
    </div>
  );
}

export function LoadingPage({ message = 'جاري التحميل...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-stone-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-stone-500 font-medium text-lg">{message}</p>
      </div>
    </div>
  );
}
