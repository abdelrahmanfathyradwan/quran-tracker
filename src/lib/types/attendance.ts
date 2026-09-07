export interface AttendanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  checkInTime: string; // ISO timestamp
  checkOutTime?: string; // ISO timestamp
  date: string; // YYYY-MM-DD
  duration?: number; // in minutes
  createdAt: string;
}
