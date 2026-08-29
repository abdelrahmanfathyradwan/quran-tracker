import { BaseRepository } from './base-repository';
import { Session, SessionFormData } from '../types/session';

class SessionRepository extends BaseRepository<Session> {
  constructor() {
    super('sessions');
  }

  getByPlan(planId: string): Session[] {
    return this.getAll()
      .filter((s) => s.planId === planId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  getByStudent(studentId: string): Session[] {
    return this.getAll()
      .filter((s) => s.studentId === studentId)
      .sort((a, b) => b.date.localeCompare(a.date)); // newest first
  }

  getByDate(date: string): Session[] {
    return this.getAll().filter((s) => s.date === date);
  }

  getTodaySessions(): Session[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getByDate(today);
  }

  getCompletedByStudent(studentId: string): Session[] {
    return this.getAll()
      .filter((s) => s.studentId === studentId && s.completed)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  completeSession(id: string, data: SessionFormData): Session | undefined {
    return this.update(id, {
      newMemorization: data.newMemorization,
      recentRevision: data.recentRevision,
      distantRevision: data.distantRevision,
      overallRating: data.overallRating,
      notes: data.notes,
      completed: true,
      completedAt: new Date().toISOString(),
    });
  }

  updateSessionContent(
    id: string,
    updates: Partial<Pick<Session, 'newMemorization' | 'recentRevision' | 'distantRevision'>>
  ): Session | undefined {
    return this.update(id, updates);
  }

  getStudentSessionsByDateRange(
    studentId: string,
    startDate: string,
    endDate: string
  ): Session[] {
    return this.getAll()
      .filter(
        (s) =>
          s.studentId === studentId &&
          s.date >= startDate &&
          s.date <= endDate
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  getMissedSessions(studentId: string): Session[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getAll().filter(
      (s) => s.studentId === studentId && !s.completed && s.date < today
    );
  }
}

export const sessionRepository = new SessionRepository();
