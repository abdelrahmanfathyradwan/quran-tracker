import { BaseRepository } from './base-repository';
import { Student, StudentFormData } from '../types/student';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

class StudentRepository extends BaseRepository<Student> {
  constructor() {
    super('students');
  }

  async createStudent(data: StudentFormData): Promise<Student> {
    const now = new Date().toISOString();
    const student: Student = {
      id: generateId(),
      name: data.name,
      imageUrl: data.imageUrl,
      grade: data.grade,
      startDate: data.startDate,
      currentMemorization: data.currentMemorization,
      currentPosition: data.currentPosition,
      notes: data.notes,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    return this.create(student);
  }

  async updateStudent(id: string, data: Partial<StudentFormData>): Promise<Student | undefined> {
    return this.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  async search(query: string): Promise<Student[]> {
    const students = await this.getAll();
    if (!query.trim()) return students;

    const normalizedQuery = query.trim().toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(normalizedQuery) ||
        s.currentPosition.toLowerCase().includes(normalizedQuery)
    );
  }

  async getActiveStudents(): Promise<Student[]> {
    const all = await this.getAll();
    return all.filter((s) => s.status === 'active');
  }
}

export const studentRepository = new StudentRepository();
