'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Trash2, Edit2, User } from 'lucide-react';
import { useStudents } from '@/lib/hooks';
import { studentService } from '@/lib/services';
import { PageHeader, StatusBadge, EmptyState, ConfirmDialog } from '@/components/shared';
import { Student } from '@/lib/types/student';

export default function StudentsPage() {
  const { students, addStudent, deleteStudent, searchStudents, refresh } = useStudents();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMemorization, setCurrentMemorization] = useState('');
  const [currentPosition, setCurrentPosition] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setFilteredStudents(searchStudents(searchQuery));
  }, [searchQuery, students, searchStudents]);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addStudent({
      name,
      startDate,
      currentMemorization,
      currentPosition,
      notes,
    });

    // Reset Form
    setName('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setCurrentMemorization('');
    setCurrentPosition('');
    setNotes('');
    setShowAddModal(false);
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteStudent(deleteConfirmId);
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

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3.5 top-3 w-4.5 h-4.5 text-stone-400" />
        <input
          type="text"
          placeholder="ابحث باسم الطالب أو السورة الحالية..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-10 pl-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
        />
      </div>

      {/* Student List Table */}
      {filteredStudents.length === 0 ? (
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
                  <th className="px-6 py-4">اسم الطالب</th>
                  <th className="px-6 py-4">مقدار المحفوظ</th>
                  <th className="px-6 py-4">الموضع الحالي</th>
                  <th className="px-6 py-4">تاريخ المتابعة</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
                {filteredStudents.map((student) => {
                  const progress = studentService.getPlanProgress(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-stone-900">
                        <Link href={`/students/${student.id}`} className="hover:text-emerald-600 transition-colors">
                          {student.name}
                        </Link>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/35 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-stone-900 mb-4">إضافة طالب جديد</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">اسم الطالب *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">تاريخ بداية المتابعة</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">مقدار المحفوظ الحالي</label>
                  <input
                    type="text"
                    placeholder="مثال: 5 أجزاء"
                    value={currentMemorization}
                    onChange={(e) => setCurrentMemorization(e.target.value)}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">آخر موضع وصل إليه</label>
                <input
                  type="text"
                  placeholder="مثال: سورة النساء - الآية 35"
                  value={currentPosition}
                  onChange={(e) => setCurrentPosition(e.target.value)}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">ملاحظات إضافية</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 h-24"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-200 rounded-lg text-sm text-stone-600 hover:bg-stone-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold"
                >
                  حفظ الطالب
                </button>
              </div>
            </form>
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
