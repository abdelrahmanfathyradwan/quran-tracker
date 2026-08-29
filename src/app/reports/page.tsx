'use client';

import { useState, useEffect } from 'react';
import { studentRepository } from '@/lib/repositories/student-repository';
import { studentService } from '@/lib/services';
import { PageHeader, ProgressBar } from '@/components/shared';
import { getCommitmentLabel } from '@/lib/utils/format-utils';
import { Student } from '@/lib/types/student';

interface StudentReportRow {
  student: Student;
  totalSessions: number;
  completedSessions: number;
  percentage: number;
  statusLabel: string;
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<StudentReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const students = studentRepository.getAll();
    const rows = students.map((student) => {
      const prog = studentService.getPlanProgress(student.id);
      return {
        student,
        totalSessions: prog?.totalSessions || 0,
        completedSessions: prog?.completedSessions || 0,
        percentage: prog?.percentage || 0,
        statusLabel: getCommitmentLabel(prog?.status || 'good'),
      };
    });
    setReportData(rows);
    setLoading(false);
  }, []);

  if (loading) return <div className="py-8 text-center text-stone-500">جاري التحميل...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="تقارير الإنجاز"
        description="متابعة نسبة إنجاز الخطط المقررة ومستويات التزام الطلاب بالحلقة"
      />

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100 text-xs font-semibold text-stone-500">
                <th className="px-6 py-4">اسم الطالب</th>
                <th className="px-6 py-4">الحلقات المنجزة</th>
                <th className="px-6 py-4">نسبة تنفيذ الخطة</th>
                <th className="px-6 py-4">مستوى الالتزام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
              {reportData.map(({ student, totalSessions, completedSessions, percentage, statusLabel }) => (
                <tr key={student.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-stone-900">{student.name}</td>
                  <td className="px-6 py-4">{completedSessions} / {totalSessions}</td>
                  <td className="px-6 py-4 min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <ProgressBar value={percentage} size="sm" className="max-w-[120px]" />
                      <span className="text-xs font-medium text-stone-600">{percentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 font-medium">
                      {statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
              {reportData.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-stone-500">
                    لا تتوفر بيانات لعرض التقارير حاليًا.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
