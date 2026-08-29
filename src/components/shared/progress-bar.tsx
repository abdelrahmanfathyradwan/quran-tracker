interface ProgressBarProps {
  value: number; // 0–100
  className?: string;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, className = '', size = 'md' }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';

  let barColor = 'bg-emerald-500';
  if (clampedValue < 50) barColor = 'bg-red-400';
  else if (clampedValue < 75) barColor = 'bg-amber-400';

  return (
    <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${height} ${className}`}>
      <div
        className={`${height} ${barColor} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
