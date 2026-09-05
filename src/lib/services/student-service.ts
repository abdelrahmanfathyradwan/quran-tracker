import { studentRepository } from '../repositories/student-repository';
import { planRepository } from '../repositories/plan-repository';
import { sessionRepository } from '../repositories/session-repository';
import { CommitmentLevel } from '../types/student';

class StudentService {
  /**
   * Calculate a student's commitment level based on their session history.
   */
  async getCommitmentLevel(studentId: string): Promise<CommitmentLevel> {
    const activePlan = await planRepository.getActivePlan(studentId);
    if (!activePlan) return 'good';

    const sessions = await sessionRepository.getByPlan(activePlan.id);
    const today = new Date().toISOString().split('T')[0];

    const pastSessions = sessions.filter((s) => s.date <= today);
    if (pastSessions.length === 0) return 'good';

    const completedCount = pastSessions.filter((s) => s.completed).length;
    const completionRate = completedCount / pastSessions.length;

    if (completionRate >= 0.9) return 'excellent';
    if (completionRate >= 0.7) return 'good';
    if (completionRate >= 0.5) return 'needs_attention';
    return 'behind';
  }

  /**
   * Get plan progress for a student.
   */
  async getPlanProgress(studentId: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    percentage: number;
    status: CommitmentLevel;
  } | null> {
    const activePlan = await planRepository.getActivePlan(studentId);
    if (!activePlan) return null;

    const sessions = await sessionRepository.getByPlan(activePlan.id);
    const completedSessions = sessions.filter((s) => s.completed).length;
    const percentage =
      sessions.length > 0
        ? Math.round((completedSessions / sessions.length) * 100)
        : 0;

    const status = await this.getCommitmentLevel(studentId);

    return {
      totalSessions: sessions.length,
      completedSessions,
      percentage,
      status,
    };
  }

  /**
   * Get the last session date for a student.
   */
  async getLastSessionDate(studentId: string): Promise<string | null> {
    const completed = await sessionRepository.getCompletedByStudent(studentId);
    if (completed.length === 0) return null;
    return completed[0].date;
  }

  /**
   * Delete a student and all their related data.
   */
  async deleteStudentWithData(studentId: string): Promise<void> {
    // Delete all plans and their sessions
    const plans = await planRepository.getPlansByStudent(studentId);
    for (const plan of plans) {
      await planRepository.deletePlanWithSessions(plan.id);
    }
    // Delete the student
    await studentRepository.delete(studentId);
  }

  /**
   * Get dashboard summary statistics.
   */
  async getDashboardStats(): Promise<{
    totalStudents: number;
    todaySessions: number;
    regularStudents: number;
    needsAttention: number;
  }> {
    const students = await studentRepository.getActiveStudents();
    const todaySessions = await sessionRepository.getTodaySessions();

    let regularCount = 0;
    let attentionCount = 0;

    // Use for...of to properly await getCommitmentLevel in a loop
    for (const student of students) {
      const level = await this.getCommitmentLevel(student.id);
      if (level === 'excellent' || level === 'good') {
        regularCount++;
      } else {
        attentionCount++;
      }
    }

    return {
      totalStudents: students.length,
      todaySessions: todaySessions.length,
      regularStudents: regularCount,
      needsAttention: attentionCount,
    };
  }
}

export const studentService = new StudentService();
