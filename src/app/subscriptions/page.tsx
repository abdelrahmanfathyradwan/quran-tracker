'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Calendar, User, CheckCircle, XCircle, Search, DollarSign, TrendingUp, ArrowRight, History } from 'lucide-react';
import { studentRepository } from '@/lib/repositories/student-repository';
import { subscriptionRepository, SubscriptionPayment } from '@/lib/repositories/subscription-repository';
import { handoverRepository } from '@/lib/repositories/handover-repository';

export default function SubscriptionsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverAdmin, setHandoverAdmin] = useState('');
  const [handoverDate, setHandoverDate] = useState(new Date().toISOString().split('T')[0]);
  const [showStudentHistory, setShowStudentHistory] = useState(false);
  const [selectedStudentHistory, setSelectedStudentHistory] = useState<any | null>(null);
  const [studentHistoryPayments, setStudentHistoryPayments] = useState<SubscriptionPayment[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Payment form state
  const [paymentMonth, setPaymentMonth] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(100);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function loadData() {
      try {
        const [studentsData, paymentsData] = await Promise.all([
          studentRepository.getAll(),
          subscriptionRepository.getActivePayments(),
        ]);
        setStudents(studentsData);
        setPayments(paymentsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!filterMonth) return matchesSearch;
    
    const hasPaidForMonth = payments.some(
      p => p.studentId === student.id && p.month === filterMonth
    );
    
    if (filterStatus === 'paid') {
      return matchesSearch && hasPaidForMonth;
    } else if (filterStatus === 'unpaid') {
      return matchesSearch && !hasPaidForMonth;
    }
    
    return matchesSearch;
  });

  const getStudentPayments = (studentId: string) => {
    return payments.filter(p => p.studentId === studentId);
  };

  const getAllStudentPayments = async (studentId: string) => {
    return subscriptionRepository.getPaymentsByStudent(studentId);
  };

  const getTotalPayments = () => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const teacherData = localStorage.getItem('teacher');
    if (!teacherData) return;

    const teacher = JSON.parse(teacherData);

    // Check if student already paid for this month
    const existingPayment = payments.find(
      p => p.studentId === selectedStudent.id && p.month === paymentMonth
    );

    if (existingPayment) {
      setPaymentError(`هذا الطالب قد دفع بالفعل لشهر ${paymentMonth}`);
      return;
    }

    setPaymentError('');

    try {
      await subscriptionRepository.recordPayment({
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        teacherId: teacher.id,
        teacherName: teacher.name,
        month: paymentMonth,
        amount: paymentAmount,
        paymentDate,
      });

      // Refresh payments
      const updatedPayments = await subscriptionRepository.getAll();
      setPayments(updatedPayments);

      // Reset form
      setShowPaymentModal(false);
      setSelectedStudent(null);
      setPaymentMonth('');
      setPaymentAmount(100);
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentError('');
    } catch (error) {
      console.error('Failed to record payment:', error);
    }
  };

  const handleHandoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const teacherData = localStorage.getItem('teacher');
    if (!teacherData) return;

    const teacher = JSON.parse(teacherData);

    if (!handoverAdmin.trim()) {
      alert('يرجى إدخال اسم المستلم');
      return;
    }

    if (payments.length === 0) {
      alert('لا توجد دفعات لتسليمها');
      return;
    }

    const totalAmount = getTotalPayments();

    if (!confirm(`هل أنت متأكد من تسليم ${totalAmount} جنيه (${payments.length} دفعات) إلى ${handoverAdmin}؟`)) {
      return;
    }

    try {
      // Record handover
      const handover = await handoverRepository.recordHandover({
        fromTeacherId: teacher.id,
        fromTeacherName: teacher.name,
        toAdminId: 'admin',
        toAdminName: handoverAdmin,
        totalAmount,
        paymentCount: payments.length,
        handoverDate,
      });

      // Mark payments as handed over
      const paymentIds = payments.map(p => p.id);
      await subscriptionRepository.markAsHandedOver(paymentIds, handover.id);

      // Refresh payments (only active ones)
      const updatedPayments = await subscriptionRepository.getActivePayments();
      setPayments(updatedPayments);

      // Reset form
      setShowHandoverModal(false);
      setHandoverAdmin('');
      setHandoverDate(new Date().toISOString().split('T')[0]);

      alert('تم تسليم الاشتراكات بنجاح!');
    } catch (error) {
      console.error('Failed to record handover:', error);
      alert('حدث خطأ أثناء التسليم');
    }
  };

  const handleClearAllData = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع بيانات الاشتراكات والتسليمات؟\n\nهذا الإجراء لا يمكن التراجع عنه.')) {
      return;
    }

    try {
      await subscriptionRepository.clear();
      await handoverRepository.clear();
      setPayments([]);
      setShowClearConfirm(false);
      alert('تم حذف جميع البيانات بنجاح!');
    } catch (error) {
      console.error('Failed to clear data:', error);
      alert('حدث خطأ أثناء حذف البيانات');
    }
  };

  const getCurrentMonth = () => {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const now = new Date();
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  const getAvailableMonths = () => {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const currentYear = new Date().getFullYear();
    return months.map(month => `${month} ${currentYear}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-gray-600 text-lg">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">سداد الاشتراكات</h1>
          <p className="text-gray-500 text-lg">تسجيل ومتابعة اشتراكات الطلاب</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{students.length}</div>
                <div className="text-sm text-gray-500">عدد الطلاب</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{payments.length}</div>
                <div className="text-sm text-gray-500">إجمالي الدفعات</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{getTotalPayments()}</div>
                <div className="text-sm text-gray-500">إجمالي المجموع (ج)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Handover Button */}
        {payments.length > 0 && (
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => setShowHandoverModal(true)}
              className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl font-semibold transition-all flex items-center justify-center gap-3 shadow-lg shadow-amber-200"
            >
              <ArrowRight className="w-5 h-5" />
              <span>تسليم الاشتراكات للمدير</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{getTotalPayments()} ج</span>
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200"
              title="حذف جميع البيانات"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">تصفية بالشهر</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">كل الأشهر</option>
                {getAvailableMonths().map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">حالة الدفع</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'paid' | 'unpaid')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                disabled={!filterMonth}
              >
                <option value="all">الكل</option>
                <option value="paid">مدفوع</option>
                <option value="unpaid">غير مدفوع</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">بحث</label>
              <div className="relative">
                <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث عن طالب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">قائمة الطلاب</h2>
                <p className="text-emerald-100 text-sm">{filteredStudents.length} طالب</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الطالب</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">عدد الدفعات</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">آخر دفع</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const studentPayments = getStudentPayments(student.id);
                  const lastPayment = studentPayments[studentPayments.length - 1];
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{student.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-emerald-600" />
                          </div>
                          <span className="text-gray-700 font-medium">{studentPayments.length}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {lastPayment ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{lastPayment.month}</div>
                            <div className="text-gray-500">{lastPayment.amount}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setPaymentMonth(getCurrentMonth());
                              setPaymentError('');
                              setShowPaymentModal(true);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                          >
                            <CreditCard className="w-4 h-4" />
                            تسجيل دفع
                          </button>
                          <button
                            onClick={async () => {
                              setSelectedStudentHistory(student);
                              const allPayments = await getAllStudentPayments(student.id);
                              setStudentHistoryPayments(allPayments);
                              setShowStudentHistory(true);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                          >
                            <History className="w-4 h-4" />
                            السجل
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

        {/* Payment Modal */}
        {showPaymentModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">تسجيل دفع اشتراك</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{selectedStudent.name}</div>
                  </div>
                </div>
              </div>

              {paymentError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {paymentError}
                </div>
              )}

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      الشهر
                    </div>
                  </label>
                  <select
                    value={paymentMonth}
                    onChange={(e) => setPaymentMonth(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    required
                  >
                    <option value="">اختر الشهر</option>
                    {getAvailableMonths().map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      المبلغ (جنيه)
                    </div>
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    تاريخ الاستلام
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all"
                >
                  تأكيد الدفع
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Student History Modal */}
        {showStudentHistory && selectedStudentHistory && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">سجل دفعات الطالب</h2>
                <button
                  onClick={() => setShowStudentHistory(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{selectedStudentHistory.name}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {studentHistoryPayments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد دفعات مسجلة لهذا الطالب
                  </div>
                ) : (
                  studentHistoryPayments.reverse().map((payment) => (
                    <div key={payment.id} className={`rounded-xl p-4 border ${payment.handedOver ? 'bg-gray-50 border-gray-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{payment.month}</span>
                          {payment.handedOver && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">تم التسليم</span>
                          )}
                        </div>
                        <span className="text-lg font-bold text-emerald-600">{payment.amount} ج</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{payment.paymentDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>الشيخ: {payment.teacherName}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Clear Data Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">تأكيد حذف البيانات</h2>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="text-red-600 font-semibold mb-2">⚠️ تحذير</p>
                <p className="text-red-600 text-sm">
                  سيتم حذف جميع بيانات الاشتراكات والتسليمات من قاعدة البيانات. هذا الإجراء لا يمكن التراجع عنه.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleClearAllData}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all"
                >
                  حذف الكل
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Handover Modal */}
        {showHandoverModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">تسليم الاشتراكات للمدير</h2>
                <button
                  onClick={() => setShowHandoverModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">إجمالي المبلغ:</span>
                  <span className="text-2xl font-bold text-amber-600">{getTotalPayments()} ج</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">عدد الدفعات:</span>
                  <span className="text-lg font-semibold text-gray-900">{payments.length}</span>
                </div>
              </div>

              <form onSubmit={handleHandoverSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    اسم المستلم (المدير)
                  </label>
                  <input
                    type="text"
                    value={handoverAdmin}
                    onChange={(e) => setHandoverAdmin(e.target.value)}
                    placeholder="أدخل اسم المدير"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    تاريخ التسليم
                  </label>
                  <input
                    type="date"
                    value={handoverDate}
                    onChange={(e) => setHandoverDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                  <p className="text-sm text-amber-600">
                    ℹ️ معلومة: سيتم تحديد هذه الدفعات كـ "تم التسليم" وستظهر في سجل الطالب
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-semibold transition-all"
                >
                  تأكيد التسليم
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
