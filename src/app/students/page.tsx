'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Trash2, Edit2, User, Loader2 } from 'lucide-react';
import { useStudents } from '@/lib/hooks';
import { studentService } from '@/lib/services';
import { PageHeader, StatusBadge, EmptyState, ConfirmDialog, TableSkeleton } from '@/components/shared';
import { Student, SchoolGrade, GRADE_LABELS, CommitmentLevel } from '@/lib/types/student';

export default function StudentsPage() {
  const { students, loading, addStudent, deleteStudent, searchStudents, refresh } = useStudents();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isFiltering, setIsFiltering] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter States
  const [gradeFilter, setGradeFilter] = useState<SchoolGrade | ''>('');
  const [statusFilter, setStatusFilter] = useState<CommitmentLevel | ''>('');
  
  // Form State
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<SchoolGrade | ''>('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMemorization, setCurrentMemorization] = useState('');
  const [currentPosition, setCurrentPosition] = useState('');
  const [notes, setNotes] = useState('');

  const [studentProgressMap, setStudentProgressMap] = useState<Record<string, any>>({});

  useEffect(() => {
    async function filter() {
      setIsFiltering(true);
      let results = await searchStudents(searchQuery);

      // Apply grade filter
      if (gradeFilter) {
        results = results.filter(s => s.grade === gradeFilter);
      }

      // Apply status filter
      if (statusFilter) {
        const progressMap: Record<string, any> = {};
        for (const student of results) {
          progressMap[student.id] = await studentService.getPlanProgress(student.id);
        }
        results = results.filter(s => progressMap[s.id]?.status === statusFilter);
        setStudentProgressMap(progressMap);
      } else {
        const progressMap: Record<string, any> = {};
        for (const student of results) {
          progressMap[student.id] = await studentService.getPlanProgress(student.id);
        }
        setStudentProgressMap(progressMap);
      }

      setFilteredStudents(results);
      setIsFiltering(false);
    }
    filter();
  }, [searchQuery, gradeFilter, statusFilter, students, searchStudents]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    await addStudent({
      name,
      grade: grade || undefined,
      startDate,
      currentMemorization,
      currentPosition,
      notes,
    });

    // Reset Form
    setName('');
    setGrade('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setCurrentMemorization('');
    setCurrentPosition('');
    setNotes('');
    setIsSubmitting(false);
    setShowAddModal(false);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteStudent(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="الطلاب"
        description="إدارة شؤون الطلاب المسجلين بالحلقة ومتابعة خطط حفظهم"
        action={
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة طالب جديد
          </button>
        }
      />

      {/* Search Bar & Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-3 w-4.5 h-4.5 text-stone-400" />
          <input
            type="text"
            placeholder="ابحث باسم الطالب أو السورة الحالية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow"
          />
        </div>

        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value as SchoolGrade | '')}
          className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 min-w-[140px]"
        >
          <option value="">كل الصفوف</option>
          {(Object.keys(GRADE_LABELS) as SchoolGrade[]).map((g) => (
            <option key={g} value={g}>{GRADE_LABELS[g]}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CommitmentLevel | '')}
          className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 min-w-[140px]"
        >
          <option value="">كل الحالات</option>
          <option value="excellent">ممتاز</option>
          <option value="good">جيد</option>
          <option value="needs_attention">يحتاج انتباه</option>
          <option value="behind">متأخر</option>
        </select>
      </div>

      {/* Student List Table */}
      {isFiltering || loading ? (
        <div className="mt-8">
          <TableSkeleton rows={5} columns={7} />
        </div>
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={User}
          title="لم نجد أي طالب"
          description={searchQuery ? "جرّب البحث بكلمة أخرى" : "ابدأ بإضافة أول طالب للحلقة لتبدأ متابعته"}
          actionLabel={!searchQuery ? "إضافة طالب جديد" : undefined}
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-xs font-semibold text-stone-500">
                  <th className="px-6 py-4">الطالب</th>
                  <th className="px-6 py-4">الصف الدراسي</th>
                  <th className="px-6 py-4">مقدار المحفوظ</th>
                  <th className="px-6 py-4">الموضع الحالي</th>
                  <th className="px-6 py-4">تاريخ المتابعة</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
                {filteredStudents.map((student) => {
                  const progress = studentProgressMap[student.id];
                  return (
                    <tr key={student.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {student.imageUrl ? (
                            <img
                              src={student.imageUrl}
                              alt={student.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-stone-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 border-2 border-emerald-300 flex items-center justify-center text-sm font-bold text-emerald-700">
                              {student.name.charAt(0)}
                            </div>
                          )}
                          <Link href={`/students/${student.id}`} className="font-medium text-stone-900 hover:text-emerald-600 transition-colors">
                            {student.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {student.grade ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                            {GRADE_LABELS[student.grade]}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4">{student.currentMemorization || '—'}</td>
                      <td className="px-6 py-4 text-stone-600">{student.currentPosition || '—'}</td>
                      <td className="px-6 py-4 text-xs text-stone-500">{student.startDate}</td>
                      <td className="px-6 py-4">
                        <StatusBadge level={progress ? progress.status : 'good'} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/students/${student.id}`}
                            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-100 transition-colors"
                          >
                            <User className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirmId(student.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-stone-100 bg-gradient-to-r from-emerald-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">إضافة طالب جديد</h3>
                  <p className="text-xs text-stone-500">أدخل بيانات الطالب الجديد</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAddStudent} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">اسم الطالب *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="أدخل اسم الطالب"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">الصف الدراسي</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as SchoolGrade | '')}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                >
                  <option value="">— اختر الصف الدراسي —</option>
                  {(Object.keys(GRADE_LABELS) as SchoolGrade[]).map((g) => (
                    <option key={g} value={g}>{GRADE_LABELS[g]}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">تاريخ البداية</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">المحفوظ الحالي</label>
                  <input
                    type="text"
                    placeholder="مثال: 5 أجزاء"
                    value={currentMemorization}
                    onChange={(e) => setCurrentMemorization(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">الموضع الحالي</label>
                <input
                  type="text"
                  placeholder="مثال: سورة النساء - الآية 35"
                  value={currentPosition}
                  onChange={(e) => setCurrentPosition(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">ملاحظات</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all h-24 resize-none"
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-100 transition-all shadow-sm"
              >
                إلغاء
              </button>
              <button
                type="submit"
                onClick={handleAddStudent}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ الطالب'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmId !== null}
        title="هل أنت متأكد من حذف الطالب؟"
        description="سيتم حذف هذا الطالب وجميع الخطط الدراسية وجلسات التسميع المرتبطة به نهائيًا."
        variant="danger"
        confirmLabel="حذف"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
