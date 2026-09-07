'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Trash2, CalendarDays, Loader2 } from 'lucide-react';
import { studentRepository } from '@/lib/repositories/student-repository';
import { planRepository } from '@/lib/repositories/plan-repository';
import { PageHeader, EmptyState, ConfirmDialog, CardSkeleton, LoadingPage } from '@/components/shared';
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

  const { plans, loading, createPlan, deletePlan } = usePlans();
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [studentId, setStudentId] = useState(studentIdParam);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  useEffect(() => {
    async function loadStudents() {
      const allStudents = await studentRepository.getAll();
      setStudents(allStudents);
    }
    loadStudents();

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

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !name || !startDate || !endDate || selectedDays.length === 0) return;

    setIsSubmitting(true);

    await createPlan({
      studentId,
      name,
      startDate,
      endDate,
      recitationDays: selectedDays,
    });

    // Reset and close
    setStudentId('');
    setName('');
    setStartDate('');
    setEndDate('');
    setSelectedDays([]);
    setIsSubmitting(false);
    setShowAddPlan(false);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deletePlan(deleteConfirmId);
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : plans.length === 0 ? (
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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowAddPlan(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-stone-100 bg-gradient-to-r from-emerald-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">إنشاء خطة جديدة</h3>
                  <p className="text-xs text-stone-500">حدد تفاصيل الخطة الدراسية</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePlan} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">اختر الطالب *</label>
                <select
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
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
                <label className="block text-sm font-semibold text-stone-700 mb-2">اسم الخطة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: خطة سبتمبر 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">تاريخ البدء *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">تاريخ الانتهاء *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">أيام التسميع الأسبوعية (اختر 3 أيام) *</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {WEEKDAYS.map((day) => {
                    const isChecked = selectedDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => handleDayToggle(day.value)}
                        className={`px-3 py-2 text-xs font-semibold border rounded-xl transition-all ${
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
                  <p className="text-xs text-amber-600 mt-2">يرجى تحديد 3 أيام أسبوعية لتوزيع جدول التسميع.</p>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 justify-end pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddPlan(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-100 transition-all shadow-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={selectedDays.length !== 3 || isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ الخطة'}
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
    <Suspense fallback={<LoadingPage message="جاري تحميل الخطط الدراسية..." />}>
      <PlansContent />
    </Suspense>
  );
}
