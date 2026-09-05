'use client';

import { useState, useCallback, useEffect } from 'react';
import { studentRepository } from '../repositories/student-repository';
import { Student, StudentFormData } from '../types/student';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentRepository.getAll();
      setStudents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addStudent = useCallback(
    async (data: StudentFormData) => {
      const student = await studentRepository.createStudent(data);
      await refresh();
      return student;
    },
    [refresh]
  );

  const updateStudent = useCallback(
    async (id: string, data: Partial<StudentFormData>) => {
      const student = await studentRepository.updateStudent(id, data);
      await refresh();
      return student;
    },
    [refresh]
  );

  const deleteStudent = useCallback(
    async (id: string) => {
      await studentRepository.delete(id);
      await refresh();
    },
    [refresh]
  );

  const searchStudents = useCallback(async (query: string) => {
    return await studentRepository.search(query);
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

