import { BaseRepository } from './base-repository';

export interface SubscriptionPayment {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  month: string;
  amount: number;
  paymentDate: string;
  handedOver: boolean;
  handoverId?: string;
  createdAt: string;
}

export class SubscriptionRepository extends BaseRepository<SubscriptionPayment> {
  constructor() {
    super('subscription-payments');
  }

  async recordPayment(payment: Omit<SubscriptionPayment, 'id' | 'createdAt' | 'handedOver' | 'handoverId'>): Promise<SubscriptionPayment> {
    const newPayment: SubscriptionPayment = {
      ...payment,
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      handedOver: false,
      createdAt: new Date().toISOString(),
    };
    return this.create(newPayment);
  }

  async markAsHandedOver(paymentIds: string[], handoverId: string): Promise<void> {
    const allPayments = await this.getAll();
    const updatedPayments = allPayments.map(payment => {
      if (paymentIds.includes(payment.id)) {
        return { ...payment, handedOver: true, handoverId };
      }
      return payment;
    });
    await this.setAll(updatedPayments);
  }

  async getActivePayments(): Promise<SubscriptionPayment[]> {
    const allPayments = await this.getAll();
    return allPayments.filter(p => !p.handedOver);
  }

  async getPaymentsByStudent(studentId: string): Promise<SubscriptionPayment[]> {
    const allPayments = await this.getAll();
    return allPayments.filter(p => p.studentId === studentId);
  }

  async getPaymentsByMonth(month: string): Promise<SubscriptionPayment[]> {
    const allPayments = await this.getAll();
    return allPayments.filter(p => p.month === month);
  }

  async getPaymentsByTeacher(teacherId: string): Promise<SubscriptionPayment[]> {
    const allPayments = await this.getAll();
    return allPayments.filter(p => p.teacherId === teacherId);
  }

  async getStudentPaymentForMonth(studentId: string, month: string): Promise<SubscriptionPayment | undefined> {
    const allPayments = await this.getAll();
    return allPayments.find(p => p.studentId === studentId && p.month === month);
  }
}

export const subscriptionRepository = new SubscriptionRepository();
