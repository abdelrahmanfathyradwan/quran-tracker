'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CalendarDays, BookOpen, Clock, FileText, ArrowRight, Pencil, Camera, X, Check } from 'lucide-react';
import { studentRepository } from '@/lib/repositories/student-repository';
import { planRepository } from '@/lib/repositories/plan-repository';
import { sessionRepository } from '@/lib/repositories/session-repository';
import { studentService } from '@/lib/services';
import { PageHeader, StatusBadge, ProgressBar, EmptyState } from '@/components/shared';
import { formatArabicDateWithDay } from '@/lib/utils/date-utils';
import { Student, StudentFormData, GRADE_LABELS } from '@/lib/types/student';
import { Plan } from '@/lib/types/plan';
import { Session } from '@/lib/types/session';

export default function StudentProfilePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'history' | 'notes'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<StudentFormData>>({});
  const [progress, setProgress] = useState<any>(null);
  const [lastSessionDate, setLastSessionDate] = useState<string | null>(null);

  const handleEditClick = () => {
    if (student) {
      setEditForm({
        name: student.name,
        grade: student.grade,
        startDate: student.startDate,
        currentMemorization: student.currentMemorization,
        currentPosition: student.currentPosition,
        notes: student.notes,
        imageUrl: student.imageUrl,
      });
      setIsEditing(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (student) {
      await studentRepository.updateStudent(student.id, editForm);
      setStudent({ ...student, ...editForm } as Student);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      const foundStudent = await studentRepository.getById(id);
      if (!foundStudent) {
        router.push('/students');
        return;
      }
      setStudent(foundStudent);

      const plan = await planRepository.getActivePlan(id) || null;
      setActivePlan(plan);

      if (plan) {
        setSessions(await sessionRepository.getByPlan(plan.id));
      } else {
        setSessions(await sessionRepository.getByStudent(id));
      }

      const p = await studentService.getPlanProgress(id);
      setProgress(p);

      const lsd = await studentService.getLastSessionDate(id);
      setLastSessionDate(lsd);
    }
    loadData();
  }, [id, router]);

  if (!student) return <div className="py-8 text-center">جاري التحميل...</div>;



  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <div>
        <Link href="/students" className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-800 text-sm">
          <ArrowRight className="w-4 h-4" />
          العودة لقائمة الطلاب
        </Link>
      </div>

      {/* Header Profile Section */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">تعديل بيانات الطالب</h2>
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100">
                  <X className="w-5 h-5" />
                </button>
                <button onClick={handleSave} className="p-2 text-emerald-600 hover:text-emerald-700 rounded-full hover:bg-emerald-50">
                  <Check className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-full border-2 border-stone-200 overflow-hidden bg-stone-50 flex items-center justify-center">
                  {editForm.imageUrl ? (
                    <img src={editForm.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-stone-300" />
                  )}
                </div>
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <div>
                  <label className="block text-xs text-stone-500 mb-1">الاسم</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">الصف الدراسي</label>
                  <select
                    value={editForm.grade || ''}
                    onChange={e => setEditForm({ ...editForm, grade: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                  >
                    <option value="">غير محدد</option>
                    {Object.entries(GRADE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">المحفوظ الحالي</label>
                  <input
                    type="text"
                    value={editForm.currentMemorization || ''}
                    onChange={e => setEditForm({ ...editForm, currentMemorization: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">الموضع الحالي</label>
                  <input
                    type="text"
                    value={editForm.currentPosition || ''}
                    onChange={e => setEditForm({ ...editForm, currentPosition: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border border-stone-200 overflow-hidden bg-stone-50 shrink-0">
                  {student.imageUrl ? (
                    <img src={student.imageUrl} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 font-bold text-xl">
                      {student.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-stone-900">{student.name}</h1>
                    {student.grade && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                        {GRADE_LABELS[student.grade]}
                      </span>
                    )}
                  </div>
                  <p className="text-stone-500 text-sm">تاريخ بداية المتابعة: {student.startDate}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleEditClick}
                  className="p-2 text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                  title="تعديل بيانات الطالب"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <StatusBadge level={progress ? progress.status : 'good'} />
                <Link
                  href={`/plans?studentId=${student.id}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  إعداد خطة جديدة
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-stone-100">
              <div>
                <span className="block text-stone-400 text-xs mb-1">المحفوظ الحالي</span>
                <span className="font-semibold text-stone-800 text-sm">{student.currentMemorization || 'غير محدد'}</span>
              </div>
              <div>
                <span className="block text-stone-400 text-xs mb-1">الموضع الحالي</span>
                <span className="font-semibold text-stone-800 text-sm">{student.currentPosition || 'غير محدد'}</span>
              </div>
              <div>
                <span className="block text-stone-400 text-xs mb-1">الخطة الحالية</span>
                <span className="font-semibold text-stone-800 text-sm">{activePlan ? activePlan.name : 'لا توجد خطة نشطة'}</span>
              </div>
              <div>
                <span className="block text-stone-400 text-xs mb-1">نسبة الإنجاز بالخطة</span>
                <span className="font-semibold text-emerald-600 text-sm">{progress ? `${progress.percentage}%` : '0%'}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200">
        <nav className="flex gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'overview' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            نظرة عامة
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'plan' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            الخطة وجلساتها
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'history' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            سجل التسميع
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'notes' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            ملاحظات الشيخ
          </button>
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="py-2">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Progress Section */}
            <div className="md:col-span-2 bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-stone-800 text-[15px]">تقدم تنفيذ الخطة</h3>
              {progress ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>المستهدف: {progress.totalSessions} جلسة</span>
                    <span>المنجز: {progress.completedSessions} جلسة ({progress.percentage}%)</span>
                  </div>
                  <ProgressBar value={progress.percentage} />
                </div>
              ) : (
                <p className="text-sm text-stone-500 py-2">لا توجد خطة دراسية نشطة حاليًا لمتابعة التقدم.</p>
              )}
            </div>

            {/* General Info */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="font-semibold text-stone-800 text-[15px]">تفاصيل سريعة</h3>
              <div className="space-y-2.5 text-sm text-stone-600">
                <div className="flex justify-between">
                  <span>آخر تسميع</span>
                  <span className="font-medium text-stone-800">
                    {lastSessionDate || 'لم يسمع بعد'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>تاريخ الالتحاق</span>
                  <span className="font-medium text-stone-800">{student.startDate}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
            {sessions.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="لا توجد خطة وجلسات"
                description="لم يتم إنشاء أي خطة لهذا الطالب أو لا توجد جلسات مجدولة له."
              />
            ) : (
              <div className="divide-y divide-stone-100">
                {sessions.map((session) => (
                  <div key={session.id} className="p-4 flex items-center justify-between gap-4 hover:bg-stone-50/40 transition-colors">
                    <div>
                      <h4 className="font-medium text-stone-800 text-sm">
                        الجلسة {session.sessionNumber} — {formatArabicDateWithDay(session.date)}
                      </h4>
                      <div className="flex flex-wrap gap-x-4 text-xs text-stone-500 mt-1">
                        <span>الجديد: {session.newMemorization.content || 'غير محدد'}</span>
                        <span>القريبة: {session.recentRevision.content || 'غير محدد'}</span>
                      </div>
                    </div>
                    <div>
                      <Link
                        href={`/recitation/${session.id}`}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          session.completed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {session.completed ? 'عرض التسميع' : 'ابدأ التسميع'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
            {sessions.filter((s) => s.completed).length === 0 ? (
              <EmptyState
                icon={Clock}
                title="سجل التسميع فارغ"
                description="لم يقم الطالب بتسجيل أي جلسة تسميع مكتملة بعد."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-100 text-xs font-semibold text-stone-500">
                      <th className="px-6 py-4">التاريخ</th>
                      <th className="px-6 py-4">الجديد</th>
                      <th className="px-6 py-4">المراجعة القريبة</th>
                      <th className="px-6 py-4">المراجعة البعيدة</th>
                      <th className="px-6 py-4 text-center">التقييم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
                    {sessions
                      .filter((s) => s.completed)
                      .map((session) => (
                        <tr key={session.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-stone-900">
                            {formatArabicDateWithDay(session.date)}
                          </td>
                          <td className="px-6 py-4">{session.newMemorization.content}</td>
                          <td className="px-6 py-4">{session.recentRevision.content}</td>
                          <td className="px-6 py-4">{session.distantRevision.content}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-block px-2.5 py-1 rounded bg-stone-100 text-stone-700 text-xs font-medium">
                              {session.overallRating ? session.overallRating : 'جيد'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-stone-800 text-[15px]">ملاحظات وتوجيهات الشيخ</h3>
            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
              {student.notes || 'لا توجد ملاحظات مسجلة لهذا الطالب.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
