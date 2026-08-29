import { BaseRepository } from './base-repository';
import { Student, StudentFormData } from '../types/student';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

class StudentRepository extends BaseRepository<Student> {
  constructor() {
    super('students');
  }

  createStudent(data: StudentFormData): Student {
    const now = new Date().toISOString();
    const student: Student = {
      id: generateId(),
      name: data.name,
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

  updateStudent(id: string, data: Partial<StudentFormData>): Student | undefined {
    return this.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  search(query: string): Student[] {
    const students = this.getAll();
    if (!query.trim()) return students;

    const normalizedQuery = query.trim().toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(normalizedQuery) ||
        s.currentPosition.toLowerCase().includes(normalizedQuery)
    );
  }

  getActiveStudents(): Student[] {
    return this.getAll().filter((s) => s.status === 'active');
  }
}

export const studentRepository = new StudentRepository();
