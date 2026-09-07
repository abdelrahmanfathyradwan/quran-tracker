'use client';

import { useState, useEffect } from 'react';
import { History, ArrowRight, Calendar, DollarSign, User, CheckCircle } from 'lucide-react';
import { handoverRepository } from '@/lib/repositories/handover-repository';

export default function HandoverHistoryPage() {
  const [handovers, setHandovers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const handoversData = await handoverRepository.getAllHandovers();
        setHandovers(handoversData.reverse()); // Show newest first
      } catch (error) {
        console.error('Failed to load handovers:', error);
      }
      setLoading(false);
    }
    loadData();
  }, []);

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">سجل التسليمات</h1>
          <p className="text-gray-500 text-lg">سجل تسليم الاشتراكات للمدير</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                <History className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{handovers.length}</div>
                <div className="text-sm text-gray-500">إجمالي التسليمات</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {handovers.reduce((sum, h) => sum + h.totalAmount, 0)}
                </div>
                <div className="text-sm text-gray-500">إجمالي المبالغ (ج)</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {handovers.reduce((sum, h) => sum + h.paymentCount, 0)}
                </div>
                <div className="text-sm text-gray-500">إجمالي الدفعات</div>
              </div>
            </div>
          </div>
        </div>

        {/* Handovers Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">سجل العمليات</h2>
                <p className="text-amber-100 text-sm">{handovers.length} عملية تسليم</p>
              </div>
            </div>
          </div>

          {handovers.length === 0 ? (
            <div className="p-12 text-center">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد عمليات تسليم مسجلة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">التاريخ</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المُسلم</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المستلم</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المبلغ</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">عدد الدفعات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {handovers.map((handover) => (
                    <tr key={handover.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{handover.handoverDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-900">{handover.fromTeacherName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-emerald-500" />
                          <span className="text-gray-900">{handover.toAdminName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-amber-500" />
                          <span className="font-semibold text-gray-900">{handover.totalAmount} ج</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="text-gray-900">{handover.paymentCount}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
