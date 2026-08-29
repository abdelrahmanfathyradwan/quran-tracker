'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, Upload, Trash2, RefreshCw } from 'lucide-react';
import { backupService } from '@/lib/services';
import { settingsRepository } from '@/lib/repositories';
import { PageHeader, ConfirmDialog, useToast } from '@/components/shared';
import { loadSeedData } from '@/lib/seed-data';

export default function SettingsPage() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [teacherName, setTeacherName] = useState('');
  const [centerName, setCenterName] = useState('');
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);

  useEffect(() => {
    const settings = settingsRepository.get();
    setTeacherName(settings.teacherName);
    setCenterName(settings.centerName);
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    settingsRepository.update({
      teacherName,
      centerName,
    });
    showToast('تم حفظ الإعدادات بنجاح', 'success');
  };

  const handleExport = () => {
    backupService.downloadBackup();
    showToast('تم تصدير البيانات بنجاح', 'success');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = backupService.importData(json);
        if (res.success) {
          showToast('تم استيراد البيانات بنجاح', 'success');
          // Refresh settings page fields
          const settings = settingsRepository.get();
          setTeacherName(settings.teacherName);
          setCenterName(settings.centerName);
        } else {
          showToast(res.error || 'فشل استيراد الملف', 'error');
        }
      } catch (err) {
        showToast('ملف النسخة الاحتياطية غير صالح', 'error');
      }
    };
    reader.readAsText(file);
    // Clear input
    e.target.value = '';
  };

  const handleClearAll = () => {
    backupService.clearAllData();
    setTeacherName('');
    setCenterName('');
    showToast('تم حذف جميع البيانات بنجاح', 'success');
    setShowClearConfirm(false);
  };

  const handleLoadSeeds = () => {
    loadSeedData();
    const settings = settingsRepository.get();
    setTeacherName(settings.teacherName);
    setCenterName(settings.centerName);
    showToast('تم تحميل البيانات التجريبية بنجاح', 'success');
    setShowSeedConfirm(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <PageHeader
        title="الإعدادات والنسخ الاحتياطي"
        description="إعداد بيانات حلقة التحفيظ وإدارة استيراد وتصدير بيانات الطلاب"
      />

      {/* Basic Settings Form */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-stone-800 text-[15px]">بيانات الشيخ والحلقة</h3>
        
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">اسم المعلم (الشيخ)</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">اسم الحلقة / المركز</label>
              <input
                type="text"
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors"
            >
              حفظ التغييرات
            </button>
          </div>
        </form>
      </div>

      {/* Backup Section */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-stone-800 text-[15px]">النسخ الاحتياطي ونقل البيانات</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 p-3 border border-stone-200 rounded-lg text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            تصدير البيانات (ملف JSON)
          </button>

          <button
            onClick={handleImportClick}
            className="flex items-center justify-center gap-2 p-3 border border-stone-200 rounded-lg text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            استيراد نسخة احتياطية
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Reset & Seeds Section */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-red-600 text-[15px]">خيارات الصيانة</h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowSeedConfirm(true)}
            className="flex-1 flex items-center justify-center gap-2 p-3 border border-stone-200 rounded-lg text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            تعبئة بيانات تجريبية (مجموعة طلاب)
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex-1 flex items-center justify-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            حذف كافة البيانات
          </button>
        </div>
      </div>

      {/* Clear Confirmation */}
      <ConfirmDialog
        open={showClearConfirm}
        title="هل أنت متأكد من حذف كافة البيانات؟"
        description="سيؤدي هذا الإجراء إلى مسح جميع السجلات والطلاب والخطط وجلسات التسميع بشكل نهائي وغير قابل للاسترجاع."
        variant="danger"
        confirmLabel="حذف الكل"
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />

      {/* Load Seeds Confirmation */}
      <ConfirmDialog
        open={showSeedConfirm}
        title="تعبئة البيانات التجريبية"
        description="سيتم إدراج مجموعة من الطلاب الوهميين وخططهم الدراسية وجلسات التسميع لغرض التجربة والتدريب."
        confirmLabel="تأكيد التحميل"
        onConfirm={handleLoadSeeds}
        onCancel={() => setShowSeedConfirm(false)}
      />
    </div>
  );
}
