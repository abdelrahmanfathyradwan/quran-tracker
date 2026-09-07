// Run this script in the browser console on http://localhost:3000
// This will clear all subscription and handover data

localStorage.removeItem('subscription-payments');
localStorage.removeItem('handovers');
console.log('تم تصفير بيانات الاشتراكات والتسليمات بنجاح!');
console.log('يرجى تحديث الصفحة لرؤية التغييرات.');
