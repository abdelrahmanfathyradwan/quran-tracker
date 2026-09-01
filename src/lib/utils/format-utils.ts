import { CommitmentLevel } from '../types/student';
import { SessionRating, RecitationStatus } from '../types/session';

/**
 * Get Arabic label for commitment level.
 */
export function getCommitmentLabel(level: CommitmentLevel): string {
  const labels: Record<CommitmentLevel, string> = {
    excellent: 'ممتاز',
    good: 'منتظم',
    needs_attention: 'يحتاج متابعة',
    behind: 'متأخر',
  };
  return labels[level];
}

/**
 * Get color class for commitment level.
 */
export function getCommitmentColor(level: CommitmentLevel): string {
  const colors: Record<CommitmentLevel, string> = {
    excellent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    good: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    needs_attention: 'text-amber-700 bg-amber-50 border-amber-200',
    behind: 'text-red-700 bg-red-50 border-red-200',
  };
  return colors[level];
}

/**
 * Get dot color class for commitment level.
 */
export function getCommitmentDot(level: CommitmentLevel): string {
  const colors: Record<CommitmentLevel, string> = {
    excellent: 'bg-emerald-500',
    good: 'bg-emerald-400',
    needs_attention: 'bg-amber-500',
    behind: 'bg-red-500',
  };
  return colors[level];
}

/**
 * Get Arabic label for session rating.
 */
export function getRatingLabel(rating: SessionRating): string {
  const labels: Record<SessionRating, string> = {
    excellent: 'ممتاز',
    very_good: 'جيد جدًا',
    good: 'جيد',
    needs_attention: 'يحتاج متابعة',
  };
  return labels[rating];
}

/**
 * Get color for session rating.
 */
export function getRatingColor(rating: SessionRating): string {
  const colors: Record<SessionRating, string> = {
    excellent: 'text-emerald-700 bg-emerald-50',
    very_good: 'text-emerald-600 bg-emerald-50',
    good: 'text-blue-700 bg-blue-50',
    needs_attention: 'text-amber-700 bg-amber-50',
  };
  return colors[rating];
}

/**
 * Get Arabic label for recitation status.
 */
export function getRecitationStatusLabel(status: RecitationStatus): string {
  const labels: Record<RecitationStatus, string> = {
    excellent: 'ممتاز',
    very_good: 'جيد جدًا',
    good: 'جيد',
    retry: 'إعادة',
  };
  return labels[status];
}

/**
 * Get color for recitation status.
 */
export function getRecitationStatusColor(status: RecitationStatus): string {
  const colors: Record<RecitationStatus, string> = {
    excellent: 'text-emerald-700 bg-emerald-50',
    very_good: 'text-blue-700 bg-blue-50',
    good: 'text-amber-600 bg-amber-50',
    retry: 'text-red-700 bg-red-50',
  };
  return colors[status];
}
