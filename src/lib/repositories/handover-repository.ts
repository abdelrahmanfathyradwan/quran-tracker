import { BaseRepository } from './base-repository';

export interface Handover {
  id: string;
  fromTeacherId: string;
  fromTeacherName: string;
  toAdminId: string;
  toAdminName: string;
  totalAmount: number;
  paymentCount: number;
  handoverDate: string;
  createdAt: string;
}

export class HandoverRepository extends BaseRepository<Handover> {
  constructor() {
    super('handovers');
  }

  async recordHandover(handover: Omit<Handover, 'id' | 'createdAt'>): Promise<Handover> {
    const newHandover: Handover = {
      ...handover,
      id: `handover_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    return this.create(newHandover);
  }

  async getAllHandovers(): Promise<Handover[]> {
    return this.getAll();
  }

  async getHandoversByTeacher(teacherId: string): Promise<Handover[]> {
    const allHandovers = await this.getAll();
    return allHandovers.filter(h => h.fromTeacherId === teacherId);
  }
}

export const handoverRepository = new HandoverRepository();
