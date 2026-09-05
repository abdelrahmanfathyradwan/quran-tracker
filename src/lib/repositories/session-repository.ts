import { BaseRepository } from './base-repository';
import { Session, SessionFormData } from '../types/session';

class SessionRepository extends BaseRepository<Session> {
  constructor() {
    super('sessions');
  }

  async getByPlan(planId: string): Promise<Session[]> {
    const all = await this.getAll();
    return all
      .filter((s) => s.planId === planId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getByStudent(studentId: string): Promise<Session[]> {
    const all = await this.getAll();
    return all
      .filter((s) => s.studentId === studentId)
      .sort((a, b) => b.date.localeCompare(a.date)); // newest first
  }

  async getByDate(date: string): Promise<Session[]> {
    const all = await this.getAll();
    return all.filter((s) => s.date === date);
  }

  async getTodaySessions(): Promise<Session[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getByDate(today);
  }

  async getCompletedByStudent(studentId: string): Promise<Session[]> {
    const all = await this.getAll();
    return all
      .filter((s) => s.studentId === studentId && s.completed)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async completeSession(id: string, data: SessionFormData): Promise<Session | undefined> {
    return this.update(id, {
      newMemorization: data.newMemorization,
      recentRevision: data.recentRevision,
      distantRevision: data.distantRevision,
      overallRating: data.overallRating,
      notes: data.notes,
      durationSeconds: data.durationSeconds,
      teacherName: data.teacherName,
      completed: true,
      completedAt: new Date().toISOString(),
    });
  }

  async startSession(id: string): Promise<Session | undefined> {
    const session = await this.getById(id);
    if (session && !session.startedAt) {
      return this.update(id, { startedAt: new Date().toISOString() });
    }
    return session;
  }

  async updateSessionContent(
    id: string,
    updates: Partial<Pick<Session, 'newMemorization' | 'recentRevision' | 'distantRevision'>>
  ): Promise<Session | undefined> {
    return this.update(id, updates);
  }

  async getStudentSessionsByDateRange(
    studentId: string,
    startDate: string,
    endDate: string
  ): Promise<Session[]> {
    const all = await this.getAll();
    return all
      .filter(
        (s) =>
          s.studentId === studentId &&
          s.date >= startDate &&
          s.date <= endDate
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getMissedSessions(studentId: string): Promise<Session[]> {
    const today = new Date().toISOString().split('T')[0];
    const all = await this.getAll();
    return all.filter(
      (s) => s.studentId === studentId && !s.completed && s.date < today
    );
  }
}

export const sessionRepository = new SessionRepository();
