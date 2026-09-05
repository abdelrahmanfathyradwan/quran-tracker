'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Check, Plus, Minus, ArrowLeft, Timer, Loader2, Star, ThumbsUp, CheckCircle, AlertCircle } from 'lucide-react';
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
  const [teacherName, setTeacherName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states matching model components
  const [newStatus, setNewStatus] = useState<RecitationStatus>('excellent');
  const [newMistakes, setNewMistakes] = useState(0);
  const [newNotes, setNewNotes] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [showNewDetails, setShowNewDetails] = useState(false);

  const [recentStatus, setRecentStatus] = useState<RecitationStatus>('excellent');
  const [recentMistakes, setRecentMistakes] = useState(0);
  const [recentNotes, setRecentNotes] = useState('');
  const [recentAmount, setRecentAmount] = useState('');
  const [showRecentDetails, setShowRecentDetails] = useState(false);

  const [distantStatus, setDistantStatus] = useState<RecitationStatus>('excellent');
  const [distantMistakes, setDistantMistakes] = useState(0);
  const [distantNotes, setDistantNotes] = useState('');
  const [distantAmount, setDistantAmount] = useState('');
  const [showDistantDetails, setShowDistantDetails] = useState(false);

  const [rating, setRating] = useState<SessionRating>('very_good');
  const [sessionNotes, setSessionNotes] = useState('');
  const [showSessionNotes, setShowSessionNotes] = useState(false);

  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const formatDuration = useCallback((totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const s = await sessionRepository.getById(sessionId);
        if (!s) {
          router.push('/recitation');
          return;
        }

        if (!mounted) return;

        setSession(s);

        // Load student data in parallel
        const [studentData, teacherDataStr] = await Promise.all([
          studentRepository.getById(s.studentId),
          Promise.resolve(localStorage.getItem('teacher')),
        ]);

        if (mounted) {
          if (studentData) {
            setStudentName(studentData.name);
          }

          if (teacherDataStr) {
            const teacher = JSON.parse(teacherDataStr);
            setTeacherName(teacher.name);
          }
        }

        // Set initial values
        setNewStatus(s.newMemorization.status);
        setNewMistakes(s.newMemorization.mistakes || 0);
        setNewNotes(s.newMemorization.notes || '');
        setNewAmount(s.newMemorization.amount || '');

        setRecentStatus(s.recentRevision.status);
        setRecentMistakes(s.recentRevision.mistakes || 0);
        setRecentNotes(s.recentRevision.notes || '');
        setRecentAmount(s.recentRevision.amount || '');

        setDistantStatus(s.distantRevision.status);
        setDistantMistakes(s.distantRevision.mistakes || 0);
        setDistantNotes(s.distantRevision.notes || '');
        setDistantAmount(s.distantRevision.amount || '');

        setRating(s.overallRating || 'very_good');
        setSessionNotes(s.notes || '');

        // Timer: if session already completed, show saved duration
        if (s.completed && s.durationSeconds) {
          setElapsedSeconds(s.durationSeconds);
          setTimerRunning(false);
        } else if (!s.completed) {
          // Start or resume timer
          await sessionRepository.startSession(sessionId);
          const refreshed = await sessionRepository.getById(sessionId);
          if (mounted && refreshed?.startedAt) {
            const startMs = new Date(refreshed.startedAt).getTime();
            startTimeRef.current = startMs;
            const nowMs = Date.now();
            const initialElapsed = Math.floor((nowMs - startMs) / 1000);
            setElapsedSeconds(initialElapsed);
            setTimerRunning(true);
          }
        }

        // Check for next student today
        const todaySessions = await sessionRepository.getTodaySessions();
        if (mounted) {
          const currentIdx = todaySessions.findIndex((ts) => ts.id === sessionId);
          if (currentIdx !== -1 && currentIdx < todaySessions.length - 1) {
            setNextSessionId(todaySessions[currentIdx + 1].id);
          } else {
            setNextSessionId(null);
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [sessionId, router]);

  // Timer tick effect
  useEffect(() => {
    if (timerRunning && startTimeRef.current > 0) {
      timerRef.current = setInterval(() => {
        const nowMs = Date.now();
        setElapsedSeconds(Math.floor((nowMs - startTimeRef.current) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  if (!session) return <div className="py-8 text-center">جاري التحميل...</div>;

  const handleQuickExcellent = () => {
    // Set all to excellent with 0 mistakes
    setNewStatus('excellent');
    setNewMistakes(0);
    setNewNotes('');
    setNewAmount(session?.newMemorization.content || '');

    setRecentStatus('excellent');
    setRecentMistakes(0);
    setRecentNotes('');
    setRecentAmount(session?.recentRevision.content || '');

    setDistantStatus('excellent');
    setDistantMistakes(0);
    setDistantNotes('');
    setDistantAmount(session?.distantRevision.content || '');

    setRating('excellent');
    setSessionNotes('');
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    await sessionRepository.completeSession(sessionId, {
      newMemorization: {
        content: session.newMemorization.content,
        amount: newAmount,
        status: newStatus,
        mistakes: newMistakes,
        notes: newNotes,
      },
      recentRevision: {
        content: session.recentRevision.content,
        amount: recentAmount,
        status: recentStatus,
        mistakes: recentMistakes,
        notes: recentNotes,
      },
      distantRevision: {
        content: session.distantRevision.content,
        amount: distantAmount,
        status: distantStatus,
        mistakes: distantMistakes,
        notes: distantNotes,
      },
      overallRating: rating,
      notes: sessionNotes,
      durationSeconds: elapsedSeconds,
      teacherName: teacherName,
    });

    // Stop timer
    setTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    setIsSubmitting(false);
    showToast('تم حفظ جلسة التسميع بنجاح', 'success');

    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-600 text-sm mb-2">
              <ArrowRight className="w-4 h-4" />
              العودة
            </Link>
            <h1 className="text-2xl font-bold text-stone-900">{studentName}</h1>
            <p className="text-stone-400 text-sm">
              جلسة {formatArabicDateWithDay(session.date)}
              {session.teacherName && (
                <span className="mr-3">• الشيخ: {session.teacherName}</span>
              )}
            </p>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              session.completed
                ? 'bg-stone-100 text-stone-500'
                : 'bg-emerald-50 text-emerald-700'
            }`}>
              <Timer className="w-4 h-4" />
              <span className="font-mono font-bold text-lg tracking-wider" dir="ltr">
                {formatDuration(elapsedSeconds)}
              </span>
            </div>
          </div>
        </div>

        {!session.completed && (
          <button
            onClick={handleQuickExcellent}
            className="w-full mb-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            حفظ سريع (ممتاز)
          </button>
        )}

        {/* Simple Table */}
        <div className="border border-stone-200 rounded-lg overflow-hidden mb-6">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="text-right text-xs font-semibold text-stone-600 px-4 py-3">القسم</th>
                <th className="text-center text-xs font-semibold text-stone-600 px-4 py-3">النتيجة</th>
                <th className="text-center text-xs font-semibold text-stone-600 px-4 py-3">الأخطاء</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-stone-200">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-stone-800">الحفظ الجديد</div>
                  <div className="text-xs text-stone-400">{session.newMemorization.content || 'غير محدد'}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-center">
                    {(Object.keys(STATUS_LABELS) as RecitationStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setNewStatus(st)}
                        className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
                          newStatus === st
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {STATUS_LABELS[st]}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setNewMistakes(Math.max(0, newMistakes - 1))} className="w-7 h-7 flex items-center justify-center bg-stone-100 rounded hover:bg-stone-200 text-stone-600">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-stone-800">{newMistakes}</span>
                    <button onClick={() => setNewMistakes(newMistakes + 1)} className="w-7 h-7 flex items-center justify-center bg-stone-100 rounded hover:bg-stone-200 text-stone-600">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="border-t border-stone-200">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-stone-800">المراجعة القريبة</div>
                  <div className="text-xs text-stone-400">{session.recentRevision.content || 'غير محدد'}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-center">
                    {(Object.keys(STATUS_LABELS) as RecitationStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setRecentStatus(st)}
                        className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
                          recentStatus === st
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {STATUS_LABELS[st]}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setRecentMistakes(Math.max(0, recentMistakes - 1))} className="w-7 h-7 flex items-center justify-center bg-stone-100 rounded hover:bg-stone-200 text-stone-600">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-stone-800">{recentMistakes}</span>
                    <button onClick={() => setRecentMistakes(recentMistakes + 1)} className="w-7 h-7 flex items-center justify-center bg-stone-100 rounded hover:bg-stone-200 text-stone-600">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="border-t border-stone-200">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-stone-800">المراجعة البعيدة</div>
                  <div className="text-xs text-stone-400">{session.distantRevision.content || 'غير محدد'}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-center">
                    {(Object.keys(STATUS_LABELS) as RecitationStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setDistantStatus(st)}
                        className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
                          distantStatus === st
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {STATUS_LABELS[st]}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setDistantMistakes(Math.max(0, distantMistakes - 1))} className="w-7 h-7 flex items-center justify-center bg-stone-100 rounded hover:bg-stone-200 text-stone-600">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-stone-800">{distantMistakes}</span>
                    <button onClick={() => setDistantMistakes(distantMistakes + 1)} className="w-7 h-7 flex items-center justify-center bg-stone-100 rounded hover:bg-stone-200 text-stone-600">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Overall Rating & Save */}
        <div className="bg-gradient-to-r from-stone-50 to-white rounded-xl p-5 border border-stone-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-stone-700 mb-3">التقييم العام</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(RATING_LABELS) as SessionRating[]).map((r) => {
                  const getIcon = () => {
                    switch (r) {
                      case 'excellent':
                        return <Star className="w-4 h-4" />;
                      case 'very_good':
                        return <ThumbsUp className="w-4 h-4" />;
                      case 'good':
                        return <CheckCircle className="w-4 h-4" />;
                      case 'needs_attention':
                        return <AlertCircle className="w-4 h-4" />;
                    }
                  };
                  const getBgColor = () => {
                    switch (r) {
                      case 'excellent':
                        return rating === r ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100';
                      case 'very_good':
                        return rating === r ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100';
                      case 'good':
                        return rating === r ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100';
                      case 'needs_attention':
                        return rating === r ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100';
                    }
                  };
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRating(r)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-semibold rounded-xl transition-all ${getBgColor()}`}
                    >
                      {getIcon()}
                      {RATING_LABELS[r]}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-semibold text-stone-700 mb-3">&nbsp;</label>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 disabled:text-stone-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? 'جاري الحفظ...' : (nextSessionId ? 'حفظ والتالي' : 'حفظ')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
