'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Check, Plus, Minus, ArrowLeft } from 'lucide-react';
import { sessionRepository } from '@/lib/repositories/session-repository';
import { studentRepository } from '@/lib/repositories/student-repository';
import { formatArabicDateWithDay } from '@/lib/utils/date-utils';
import { RATING_LABELS, STATUS_LABELS, RecitationStatus, SessionRating } from '@/lib/types/session';
import { useToast } from '@/components/shared';
import { Session } from '@/lib/types/session';

export default function RecitationSessionPage() {
  const { sessionId } = useParams() as { sessionId: string };
  const router = useRouter();
  const { showToast } = useToast();

  const [session, setSession] = useState<Session | null>(null);
  const [studentName, setStudentName] = useState('طالب');
  const [nextSessionId, setNextSessionId] = useState<string | null>(null);

  // Form states matching model components
  const [newStatus, setNewStatus] = useState<RecitationStatus>('not_piked');
  const [newMistakes, setNewMistakes] = useState(0);
  const [newNotes, setNewNotes] = useState('');

  const [recentStatus, setRecentStatus] = useState<RecitationStatus>('not_piked');
  const [recentMistakes, setRecentMistakes] = useState(0);
  const [recentNotes, setRecentNotes] = useState('');

  const [distantStatus, setDistantStatus] = useState<RecitationStatus>('not_piked');
  const [distantMistakes, setDistantMistakes] = useState(0);
  const [distantNotes, setDistantNotes] = useState('');

  const [rating, setRating] = useState<SessionRating>('very_good');
  const [sessionNotes, setSessionNotes] = useState('');

  useEffect(() => {
    const s = sessionRepository.getById(sessionId);
    if (!s) {
      router.push('/recitation');
      return;
    }
    setSession(s);

    const student = studentRepository.getById(s.studentId);
    if (student) {
      setStudentName(student.name);
    }

    // Set initial values
    setNewStatus(s.newMemorization.status);
    setNewMistakes(s.newMemorization.mistakes || 0);
    setNewNotes(s.newMemorization.notes || '');

    setRecentStatus(s.recentRevision.status);
    setRecentMistakes(s.recentRevision.mistakes || 0);
    setRecentNotes(s.recentRevision.notes || '');

    setDistantStatus(s.distantRevision.status);
    setDistantMistakes(s.distantRevision.mistakes || 0);
    setDistantNotes(s.distantRevision.notes || '');

    setRating(s.overallRating || 'very_good');
    setSessionNotes(s.notes || '');

    // Check for next student today
    const todaySessions = sessionRepository.getTodaySessions();
    const currentIdx = todaySessions.findIndex((ts) => ts.id === sessionId);
    if (currentIdx !== -1 && currentIdx < todaySessions.length - 1) {
      setNextSessionId(todaySessions[currentIdx + 1].id);
    } else {
      setNextSessionId(null);
    }
  }, [sessionId, router]);

  if (!session) return <div className="py-8 text-center">جاري التحميل...</div>;

  const handleSave = () => {
    sessionRepository.completeSession(sessionId, {
      newMemorization: {
        content: session.newMemorization.content,
        status: newStatus,
        mistakes: newMistakes,
        notes: newNotes,
      },
      recentRevision: {
        content: session.recentRevision.content,
        status: recentStatus,
        mistakes: recentMistakes,
        notes: recentNotes,
      },
      distantRevision: {
        content: session.distantRevision.content,
        status: distantStatus,
        mistakes: distantMistakes,
        notes: distantNotes,
      },
      overallRating: rating,
      notes: sessionNotes,
    });

    showToast('تم حفظ جلسة التسميع بنجاح', 'success');

    if (nextSessionId) {
      router.push(`/recitation/${nextSessionId}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-800 text-sm">
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </Link>
      </div>

      {/* Header Info */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
        <h1 className="text-xl font-bold text-stone-900">{studentName}</h1>
        <p className="text-stone-500 text-xs mt-1">
          جلسة {formatArabicDateWithDay(session.date)}
        </p>
      </div>

      {/* 1. New Memorization */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="font-bold text-stone-800 text-[15px]">1. الحفظ الجديد</h2>
          <span className="text-xs text-stone-500 font-semibold">{session.newMemorization.content || 'غير محدد'}</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">النتيجة</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(STATUS_LABELS) as RecitationStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setNewStatus(st)}
                  className={`py-2 text-xs font-semibold border rounded-lg transition-all ${
                    newStatus === st
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {STATUS_LABELS[st]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-stone-600">عدد الأخطاء</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNewMistakes(Math.max(0, newMistakes - 1))}
                className="w-8 h-8 flex items-center justify-center border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-bold text-stone-800 text-sm">{newMistakes}</span>
              <button
                type="button"
                onClick={() => setNewMistakes(newMistakes + 1)}
                className="w-8 h-8 flex items-center justify-center border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">ملاحظات التسميع</label>
            <input
              type="text"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="اكتب ملاحظة حول الأداء أو الحفظ"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Recent Revision */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="font-bold text-stone-800 text-[15px]">2. المراجعة القريبة</h2>
          <span className="text-xs text-stone-500 font-semibold">{session.recentRevision.content || 'غير محدد'}</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">النتيجة</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(STATUS_LABELS) as RecitationStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setRecentStatus(st)}
                  className={`py-2 text-xs font-semibold border rounded-lg transition-all ${
                    recentStatus === st
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {STATUS_LABELS[st]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-stone-600">عدد الأخطاء</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRecentMistakes(Math.max(0, recentMistakes - 1))}
                className="w-8 h-8 flex items-center justify-center border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-bold text-stone-800 text-sm">{recentMistakes}</span>
              <button
                type="button"
                onClick={() => setRecentMistakes(recentMistakes + 1)}
                className="w-8 h-8 flex items-center justify-center border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">ملاحظات المراجعة</label>
            <input
              type="text"
              value={recentNotes}
              onChange={(e) => setRecentNotes(e.target.value)}
              placeholder="اكتب ملاحظة حول الأداء أو المراجعة"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Distant Revision */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="font-bold text-stone-800 text-[15px]">3. المراجعة البعيدة</h2>
          <span className="text-xs text-stone-500 font-semibold">{session.distantRevision.content || 'غير محدد'}</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">النتيجة</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(STATUS_LABELS) as RecitationStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setDistantStatus(st)}
                  className={`py-2 text-xs font-semibold border rounded-lg transition-all ${
                    distantStatus === st
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {STATUS_LABELS[st]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-stone-600">عدد الأخطاء</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDistantMistakes(Math.max(0, distantMistakes - 1))}
                className="w-8 h-8 flex items-center justify-center border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-bold text-stone-800 text-sm">{distantMistakes}</span>
              <button
                type="button"
                onClick={() => setDistantMistakes(distantMistakes + 1)}
                className="w-8 h-8 flex items-center justify-center border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">ملاحظات البعيدة</label>
            <input
              type="text"
              value={distantNotes}
              onChange={(e) => setDistantNotes(e.target.value)}
              placeholder="اكتب ملاحظة حول الأداء أو المراجعة البعيدة"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Overall Session Rating */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="font-bold text-stone-800 text-[15px] border-b border-stone-100 pb-3">تقييم الجلسة العام</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">تقييم الشيخ لليوم</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(RATING_LABELS) as SessionRating[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRating(r)}
                  className={`py-2 text-xs font-semibold border rounded-lg transition-all ${
                    rating === r
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {RATING_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">توجيهات وملاحظات الشيخ الإجمالية</label>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="اكتب توجيهات عامة للطالب للمرة القادمة..."
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 h-20"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button
          onClick={handleSave}
          className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          {nextSessionId ? 'حفظ والذهاب للطالب التالي' : 'حفظ التسميع للجلسة'}
        </button>
      </div>
    </div>
  );
}
