import { BaseRepository } from './base-repository';
import { AttendanceRecord } from '../types/attendance';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

class AttendanceRepository extends BaseRepository<AttendanceRecord> {
  constructor() {
    super('attendance');
  }

  async getByTeacherId(teacherId: string): Promise<AttendanceRecord[]> {
    const all = await this.getAll();
    return all.filter(record => record.teacherId === teacherId);
  }

  async getByDate(date: string): Promise<AttendanceRecord[]> {
    const all = await this.getAll();
    return all.filter(record => record.date === date);
  }

  async getByTeacherAndDate(teacherId: string, date: string): Promise<AttendanceRecord | null> {
    const all = await this.getAll();
    return all.find(record => record.teacherId === teacherId && record.date === date) || null;
  }

  async checkIn(teacherId: string, teacherName: string): Promise<AttendanceRecord> {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    
    // Check if already checked in today
    const existing = await this.getByTeacherAndDate(teacherId, date);
    if (existing) {
      return existing;
    }

    const record: AttendanceRecord = {
      id: generateId(),
      teacherId,
      teacherName,
      checkInTime: now.toISOString(),
      date,
      createdAt: now.toISOString(),
    };

    return this.create(record);
  }

  async checkOut(teacherId: string): Promise<AttendanceRecord | null> {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    
    const record = await this.getByTeacherAndDate(teacherId, date);
    if (!record || record.checkOutTime) {
      return null;
    }

    const checkInTime = new Date(record.checkInTime);
    const duration = Math.round((now.getTime() - checkInTime.getTime()) / (1000 * 60)); // in minutes

    const updated = await this.update(record.id, {
      checkOutTime: now.toISOString(),
      duration,
    });

    return updated || null;
  }
}

export const attendanceRepository = new AttendanceRepository();
