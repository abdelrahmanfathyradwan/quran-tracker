import { BaseRepository } from './base-repository';
import { Plan, PlanFormData } from '../types/plan';
import { Session, RecitationItem } from '../types/session';
import { sessionRepository } from './session-repository';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Get all dates within a range that fall on the specified weekdays.
 */
function getRecitationDates(
  startDate: string,
  endDate: string,
  recitationDays: number[]
): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    if (recitationDays.includes(current.getDay())) {
      dates.push(current.toISOString().split('T')[0]);
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

class PlanRepository extends BaseRepository<Plan> {
  constructor() {
    super('plans');
  }

  async createPlan(data: PlanFormData): Promise<{ plan: Plan; sessions: Session[] }> {
    const now = new Date().toISOString();
    const recitationDates = getRecitationDates(
      data.startDate,
      data.endDate,
      data.recitationDays
    );

    const planId = generateId();

    const plan: Plan = {
      id: planId,
      studentId: data.studentId,
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      recitationDays: data.recitationDays,
      totalSessions: recitationDates.length,
      createdAt: now,
      updatedAt: now,
    };

    // Create empty sessions for each recitation date
    const emptyItem: RecitationItem = {
      content: '',
      status: 'excellent',
      mistakes: 0,
      notes: '',
    };

    const sessions: Session[] = recitationDates.map((date, index) => ({
      id: generateId() + '_' + index,
      planId: planId,
      studentId: data.studentId,
      date: date,
      sessionNumber: index + 1,
      newMemorization: { ...emptyItem },
      recentRevision: { ...emptyItem },
      distantRevision: { ...emptyItem },
      completed: false,
    }));

    await this.create(plan);
    for (const s of sessions) {
      await sessionRepository.create(s);
    }

    return { plan, sessions };
  }

  async getPlansByStudent(studentId: string): Promise<Plan[]> {
    const all = await this.getAll();
    return all.filter((p) => p.studentId === studentId);
  }

  async getActivePlan(studentId: string): Promise<Plan | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const plans = await this.getPlansByStudent(studentId);
    return plans.find((p) => p.startDate <= today && p.endDate >= today);
  }

  async deletePlanWithSessions(planId: string): Promise<void> {
    // Delete all sessions for this plan
    const sessions = await sessionRepository.getByPlan(planId);
    await sessionRepository.deleteMany(sessions.map((s) => s.id));
    // Delete the plan
    await this.delete(planId);
  }
}

export const planRepository = new PlanRepository();
