'use client';

import { useState, useCallback, useEffect } from 'react';
import { studentRepository } from '../repositories/student-repository';
import { Student, StudentFormData } from '../types/student';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setStudents(studentRepository.getAll());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addStudent = useCallback(
    (data: StudentFormData) => {
      const student = studentRepository.createStudent(data);
      refresh();
      return student;
    },
    [refresh]
  );

  const updateStudent = useCallback(
    (id: string, data: Partial<StudentFormData>) => {
      const student = studentRepository.updateStudent(id, data);
      refresh();
      return student;
    },
    [refresh]
  );

  const deleteStudent = useCallback(
    (id: string) => {
      studentRepository.delete(id);
      refresh();
    },
    [refresh]
  );

  const searchStudents = useCallback((query: string) => {
    return studentRepository.search(query);
  }, []);

  return {
    students,
    loading,
    addStudent,
    updateStudent,
    deleteStudent,
    searchStudents,
    refresh,
  };
}
