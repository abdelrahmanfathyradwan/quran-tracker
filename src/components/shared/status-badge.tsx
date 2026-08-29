import { CommitmentLevel } from '@/lib/types/student';
import { getCommitmentLabel, getCommitmentColor, getCommitmentDot } from '@/lib/utils/format-utils';

interface StatusBadgeProps {
  level: CommitmentLevel;
}

export function StatusBadge({ level }: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
        ${getCommitmentColor(level)}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getCommitmentDot(level)}`} />
      {getCommitmentLabel(level)}
    </span>
  );
}
