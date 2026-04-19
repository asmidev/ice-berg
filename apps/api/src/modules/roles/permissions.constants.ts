export interface Permission {
  slug: string;
  name: string;
  category: string;
}

export const PERMISSIONS: Permission[] = [
  // --- DASHBOARD & ANALYTICS ---
  { slug: 'dashboard.view', name: 'Dashboard ko\'rish', category: 'Dashboard & Statistika' },
  { slug: 'analytics.financial', name: 'Moliya hisobotlarini ko\'rish', category: 'Dashboard & Statistika' },
  { slug: 'analytics.academic', name: 'Akademik hisobotlarni ko\'rish', category: 'Dashboard & Statistika' },
  { slug: 'analytics.crm', name: 'CRM (Lidlar) hisobotlarini ko\'rish', category: 'Dashboard & Statistika' },

  // --- LMS (KURSLAR, GURUHLAR, XONALAR) ---
  { slug: 'courses.view', name: 'Yo\'nalishlarni ko\'rish', category: 'Kurslar va Guruhlar' },
  { slug: 'courses.manage', name: 'Yo\'nalishlarni boshqarish (Qo\'shish/Tahrir/O\'chirish)', category: 'Kurslar va Guruhlar' },
  { slug: 'groups.view', name: 'Guruhlarni ko\'rish', category: 'Kurslar va Guruhlar' },
  { slug: 'groups.manage', name: 'Guruhlarni boshqarish (Qo\'shish/Tahrir/O\'chirish)', category: 'Kurslar va Guruhlar' },
  { slug: 'groups.attendance', name: 'Davomatni belgilash', category: 'Kurslar va Guruhlar' },
  { slug: 'groups.schedule', name: 'Dars jadvalini boshqarish', category: 'Kurslar va Guruhlar' },
  { slug: 'groups.next_stage', name: 'Guruhni keyingi bosqichga o\'tkazish', category: 'Kurslar va Guruhlar' },
  { slug: 'rooms.manage', name: 'Dars xonalarini boshqarish', category: 'Kurslar va Guruhlar' },

  // --- CRM & TALABALAR ---
  { slug: 'leads.view', name: 'Lidlar (CRM) ko\'rish', category: 'Talabalar va CRM' },
  { slug: 'leads.manage', name: 'Lidlarni boshqarish', category: 'Talabalar va CRM' },
  { slug: 'leads.convert', name: 'Lidni o\'quvchiga aylantirish', category: 'Talabalar va CRM' },
  { slug: 'students.view', name: 'O\'quvchilarni ko\'rish', category: 'Talabalar va CRM' },
  { slug: 'students.manage', name: 'O\'quvchilarni boshqarish (Qo\'shish/Tahrir)', category: 'Talabalar va CRM' },
  { slug: 'students.delete', name: 'O\'quvchini tizimdan o\'chirish', category: 'Talabalar va CRM' },
  { slug: 'students.archive', name: 'O\'quvchilarni arxivlash/qaytarish', category: 'Talabalar va CRM' },

  // --- MOLIYA ---
  { slug: 'payments.view', name: 'To\'lovlar ro\'yxatni ko\'rish', category: 'Moliya' },
  { slug: 'payments.create', name: 'To\'lov qabul qilish', category: 'Moliya' },
  { slug: 'payments.delete', name: 'To\'lovni o\'chirish', category: 'Moliya' },
  { slug: 'incomes.manage', name: 'Qo\'shimcha daromadlarni boshqarish', category: 'Moliya' },
  { slug: 'expenses.view', name: 'Xarajatlarni ko\'rish', category: 'Moliya' },
  { slug: 'expenses.manage', name: 'Xarajatlarni boshqarish (Qo\'shish/O\'chirish)', category: 'Moliya' },
  { slug: 'cashbox.view', name: 'Kassa holatini ko\'rish', category: 'Moliya' },
  { slug: 'cashbox.transfer', name: 'Kassalararo pul o\'tkazmalari', category: 'Moliya' },
  { slug: 'salaries.view', name: 'Xodimlar oyliklarini ko\'rish', category: 'Moliya' },
  { slug: 'salaries.manage', name: 'Oylik hisoblash va to\'lash', category: 'Moliya' },

  // --- XODIMLAR VA ROLLAR ---
  { slug: 'staff.view', name: 'Xodimlarni ko\'rish', category: 'Xodimlar va Lavozimlar' },
  { slug: 'staff.manage', name: 'Xodimlarni boshqarish (Qo\'shish/Tahrir)', category: 'Xodimlar va Lavozimlar' },
  { slug: 'staff.delete', name: 'Xodimni o\'chirish/bloklash', category: 'Xodimlar va Lavozimlar' },
  { slug: 'teachers.view', name: 'O\'qituvchilarni ko\'rish', category: 'Xodimlar va Lavozimlar' },
  { slug: 'teachers.manage', name: 'O\'qituvchilarni boshqarish', category: 'Xodimlar va Lavozimlar' },
  { slug: 'roles.manage', name: 'Lavozimlar va huquqlarni boshqarish', category: 'Xodimlar va Lavozimlar' },

  // --- SMS VA ALOQA ---
  { slug: 'sms.send', name: 'SMS yuborish (qo\'lda)', category: 'SMS va Aloqa' },
  { slug: 'sms.templates', name: 'SMS shablonlarini boshqarish', category: 'SMS va Aloqa' },
  { slug: 'sms.logs', name: 'SMS yuborish tarixini ko\'rish', category: 'SMS va Aloqa' },

  // --- SOZLAMALAR ---
  { slug: 'settings.integrations', name: 'Tashqi integratsiyalarni sozlash', category: 'Tizim Sozlamalari' },
  { slug: 'settings.branches', name: 'Filiallarni boshqarish', category: 'Tizim Sozlamalari' },
  { slug: 'settings.office', name: 'Ofis sozlamalari (Check, Xonalar va h.k.)', category: 'Tizim Sozlamalari' },
];
