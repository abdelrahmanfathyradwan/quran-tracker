'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Trash2, CalendarDays } from 'lucide-react';
import { studentRepository } from '@/lib/repositories/student-repository';
import { planRepository } from '@/lib/repositories/plan-repository';
import { PageHeader, EmptyState, ConfirmDialog } from '@/components/shared';
import { usePlans } from '@/lib/hooks';
import { Plan } from '@/lib/types/plan';
import { Student } from '@/lib/types/student';

const WEEKDAYS = [
  { value: 6, label: 'السبت' },
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الاثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
];

import { Suspense } from 'react';

function PlansContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentIdParam = searchParams.get('studentId') || '';

  const { plans, createPlan, deletePlan } = usePlans();
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [studentId, setStudentId] = useState(studentIdParam);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  useEffect(() => {
    setStudents(studentRepository.getAll());
    if (studentIdParam) {
      setStudentId(studentIdParam);
      setShowAddPlan(true);
    }
  }, [studentIdParam]);

  const handleDayToggle = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !name || !startDate || !endDate || selectedDays.length === 0) return;

    createPlan({
      studentId,
      name,
      startDate,
      endDate,
      recitationDays: selectedDays,
    });

    // Reset Form
    setName('');
    setStartDate('');
    setEndDate('');
    setSelectedDays([]);
    setShowAddPlan(false);
    router.push(`/students/${studentId}`);
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      deletePlan(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const getStudentName = (id: string) => {
    return students.find((s) => s.id === id)?.name || 'طالب';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="الخطط الدراسية"
        description="إنشاء وتوزيع جلسات الحفظ والمراجعة الأسبوعية للطلاب"
        action={
          <button
            onClick={() => setShowAddPlan(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            إنشاء خطة جديدة
          </button>
        }
      />

      {plans.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="لا توجد خطط دراسية نشطة"
          description="قم بإنشاء خطة مخصصة لتمكين الطالب من حفظ وتسميع السور والآيات ومتابعة أدائه"
          actionLabel="إنشاء خطة جديدة"
          onAction={() => setShowAddPlan(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-stone-800 text-base">{plan.name}</h3>
                  <p className="text-xs text-stone-500 mt-1">طالب: {getStudentName(plan.studentId)}</p>
                </div>
                <button
                  onClick={() => setDeleteConfirmId(plan.id)}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-stone-600 border-t border-stone-100 pt-3">
                <div>
                  <span className="text-stone-400 block mb-0.5">الفترة الزمنية</span>
                  <span className="font-semibold text-stone-800">{plan.startDate} إلى {plan.endDate}</span>
                </div>
                <div>
                  <span className="text-stone-400 block mb-0.5">عدد الحلقات بالخطة</span>
                  <span className="font-semibold text-stone-800">{plan.totalSessions} حلقة</span>
                </div>
                <div className="col-span-2">
                  <span className="text-stone-400 block mb-0.5">أيام التسميع المعتمدة</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {plan.recitationDays.map((dayNum) => (
                      <span key={dayNum} className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[11px] font-medium">
                        {WEEKDAYS.find((d) => d.value === dayNum)?.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Plan Modal */}
      {showAddPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/35 backdrop-blur-xs" onClick={() => setShowAddPlan(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 overflow-y-auto max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-stone-900 mb-4">إنشاء خطة جديدة</h3>
            
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">اختر الطالب *</label>
                <select
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">-- اختر طالبًا --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">اسم الخطة الدراسي *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: خطة سبتمبر 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">تاريخ البدء *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">تاريخ الانتهاء *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">حدد أيام التسميع الأسبوعية (اختر 3 أيام) *</label>
                <div className="grid grid-cols-4 gap-2 mt-1.5">
                  {WEEKDAYS.map((day) => {
                    const isChecked = selectedDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => handleDayToggle(day.value)}
                        className={`px-3 py-2 text-xs font-semibold border rounded-lg transition-all ${
                          isChecked
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                {selectedDays.length !== 3 && (
                  <p className="text-[11px] text-amber-600 mt-1.5">يرجى تحديد 3 أيام أسبوعية لتوزيع جدول التسميع.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlan(false)}
                  className="px-4 py-2 border border-stone-200 rounded-lg text-sm text-stone-600 hover:bg-stone-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={selectedDays.length !== 3}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  حفظ الخطة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmId !== null}
        title="هل أنت متأكد من حذف الخطة الدراسية؟"
        description="سيتم حذف الخطة والجدول الأسبوعي والتقييمات المسجلة بها نهائيًا."
        variant="danger"
        confirmLabel="حذف"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}

export default function PlansPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-stone-500">جاري تحميل الخطط الدراسية...</div>}>
      <PlansContent />
    </Suspense>
  );
}
