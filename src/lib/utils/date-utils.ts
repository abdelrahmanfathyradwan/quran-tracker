const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const ARABIC_DAYS = [
  'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء',
  'الخميس', 'الجمعة', 'السبت',
];

/**
 * Format a date as a full Arabic date string.
 * Example: "السبت، 29 أغسطس 2026"
 */
export function formatArabicDate(date: Date): string {
  const dayName = ARABIC_DAYS[date.getDay()];
  const day = date.getDate();
  const month = ARABIC_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}، ${day} ${month} ${year}`;
}

/**
 * Format a date string (YYYY-MM-DD) to a short Arabic format.
 * Example: "29 أغسطس"
 */
export function formatShortArabicDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = ARABIC_MONTHS[date.getMonth()];
  return `${day} ${month}`;
}

/**
 * Format a date string (YYYY-MM-DD) to Arabic with day name.
 * Example: "السبت 29 أغسطس"
 */
export function formatArabicDateWithDay(dateStr: string): string {
  const date = new Date(dateStr);
  const dayName = ARABIC_DAYS[date.getDay()];
  const day = date.getDate();
  const month = ARABIC_MONTHS[date.getMonth()];
  return `${dayName} ${day} ${month}`;
}

/**
 * Get Arabic day name from day number (0-6).
 */
export function getArabicDayName(dayNum: number): string {
  return ARABIC_DAYS[dayNum] || '';
}

/**
 * Get Arabic month name from month number (0-11).
 */
export function getArabicMonthName(monthNum: number): string {
  return ARABIC_MONTHS[monthNum] || '';
}

/**
 * Check if a date string is today.
 */
export function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

/**
 * Check if a date is in the past.
 */
export function isPast(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr < today;
}

/**
 * Get today's date as YYYY-MM-DD.
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get relative date description in Arabic.
 */
export function getRelativeDateArabic(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'اليوم';
  if (diffDays === 1) return 'أمس';
  if (diffDays === 2) return 'قبل يومين';
  if (diffDays <= 7) return `قبل ${diffDays} أيام`;
  if (diffDays <= 30) return `قبل ${Math.floor(diffDays / 7)} أسابيع`;
  return formatShortArabicDate(dateStr);
}

/**
 * Get all days in a month as an array of Date objects.
 */
export function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

/**
 * Get the starting day offset for the calendar grid.
 * Returns the day of week (0=Sun) of the first day of month.
 */
export function getMonthStartDay(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}
