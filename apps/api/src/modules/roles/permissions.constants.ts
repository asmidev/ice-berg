export interface Permission {
  slug: string;
  name: string;
  category: string;
}

export const PERMISSIONS: Permission[] = [
  // --- DASHBOARD VA ANALITIKA ---
  { slug: 'dashboard.view', name: "Dashboard statistikasini ko'rish", category: "Dashboard va Analitika" },
  { slug: 'analytics.financial', name: "Moliya hisobotlarini ko'rish", category: "Dashboard va Analitika" },
  { slug: 'analytics.academic', name: "Akademik hisobotlarni ko'rish", category: "Dashboard va Analitika" },
  { slug: 'analytics.crm', name: "CRM (Lidlar) hisobotlarini ko'rish", category: "Dashboard va Analitika" },

  // --- YO'NALISHLAR (KURSLAR) ---
  { slug: 'courses.view', name: "Yo'nalishlarni ko'rish", category: "Yo'nalishlar (Kurslar)" },
  { slug: 'courses.create', name: "Yangi yo'nalish yaratish (qo'shish)", category: "Yo'nalishlar (Kurslar)" },
  { slug: 'courses.update', name: "Yo'nalish ma'lumotlarini tahrirlash", category: "Yo'nalishlar (Kurslar)" },
  { slug: 'courses.delete', name: "Yo'nalishni o'chirish", category: "Yo'nalishlar (Kurslar)" },

  // --- GURUHLAR ---
  { slug: 'groups.view', name: "Guruhlarni ko'rish", category: "Guruhlar" },
  { slug: 'groups.create', name: "Yangi guruh yaratish (qo'shish)", category: "Guruhlar" },
  { slug: 'groups.update', name: "Guruh ma'lumotlarini tahrirlash", category: "Guruhlar" },
  { slug: 'groups.delete', name: "Guruhni o'chirish", category: "Guruhlar" },
  { slug: 'groups.attendance', name: "Guruh davomatini belgilash", category: "Guruhlar" },
  { slug: 'groups.schedule', name: "Dars jadvalini boshqarish", category: "Guruhlar" },
  { slug: 'groups.next_stage', name: "Guruhni keyingi o'quv bosqichiga o'tkazish", category: "Guruhlar" },

  // --- DARS XONALARI ---
  { slug: 'rooms.view', name: "Dars xonalarini ko'rish", category: "Dars xonalari" },
  { slug: 'rooms.create', name: "Yangi dars xonasini qo'shish", category: "Dars xonalari" },
  { slug: 'rooms.update', name: "Dars xonasini tahrirlash", category: "Dars xonalari" },
  { slug: 'rooms.delete', name: "Dars xonasini o'chirish", category: "Dars xonalari" },

  // --- CRM VA LIDLAR ---
  { slug: 'leads.view', name: "Lidlar (murojaatlar) ro'yxatini ko'rish", category: "CRM va Lidlar" },
  { slug: 'leads.create', name: "Yangi lid qo'shish", category: "CRM va Lidlar" },
  { slug: 'leads.update', name: "Lid ma'lumotlarini tahrirlash", category: "CRM va Lidlar" },
  { slug: 'leads.delete', name: "Lidni o'chirish", category: "CRM va Lidlar" },
  { slug: 'leads.convert', name: "Lidni o'quvchiga aylantirish", category: "CRM va Lidlar" },

  // --- O'QUVCHILAR (TALABALAR) ---
  { slug: 'students.view', name: "O'quvchilar ro'yxatini ko'rish", category: "O'quvchilar (Talabalar)" },
  { slug: 'students.create', name: "Yangi o'quvchi qo'shish", category: "O'quvchilar (Talabalar)" },
  { slug: 'students.update', name: "O'quvchi ma'lumotlarini tahrirlash", category: "O'quvchilar (Talabalar)" },
  { slug: 'students.delete', name: "O'quvchini tizimdan o'chirish", category: "O'quvchilar (Talabalar)" },
  { slug: 'students.archive', name: "O'quvchini arxivga o'tkazish", category: "O'quvchilar (Talabalar)" },
  { slug: 'students.restore', name: "O'quvchini arxivdan qaytarish", category: "O'quvchilar (Talabalar)" },

  // --- MOLIYA - TO'LOVLAR ---
  { slug: 'payments.view', name: "To'lovlar ro'yxatini ko'rish", category: "Moliya - To'lovlar" },
  { slug: 'payments.create', name: "O'quvchidan to'lov qabul qilish (yaratish)", category: "Moliya - To'lovlar" },
  { slug: 'payments.delete', name: "To'lovni bekor qilish (o'chirish)", category: "Moliya - To'lovlar" },

  // --- MOLIYA - QO'SHIMCHA DAROMADLAR ---
  { slug: 'incomes.view', name: "Qo'shimcha daromadlarni ko'rish", category: "Moliya - Qo'shimcha Daromadlar" },
  { slug: 'incomes.create', name: "Qo'shimcha daromad kiritish", category: "Moliya - Qo'shimcha Daromadlar" },
  { slug: 'incomes.delete', name: "Qo'shimcha daromadni o'chirish", category: "Moliya - Qo'shimcha Daromadlar" },

  // --- MOLIYA - XARAJATLAR ---
  { slug: 'expenses.view', name: "Xarajatlar ro'yxatini ko'rish", category: "Moliya - Xarajatlar" },
  { slug: 'expenses.create', name: "Xarajat kiritish", category: "Moliya - Xarajatlar" },
  { slug: 'expenses.delete', name: "Xarajatni o'chirish", category: "Moliya - Xarajatlar" },

  // --- MOLIYA - KASSA ---
  { slug: 'cashbox.view', name: "Kassa holati va balanslarini ko'rish", category: "Moliya - Kassa" },
  { slug: 'cashbox.transfer', name: "Kassalararo pul o'tkazmalarini amalga oshirish", category: "Moliya - Kassa" },

  // --- MOLIYA - OYLIK MAOSHLAR ---
  { slug: 'salaries.view', name: "Xodimlar oyliklarini ko'rish", category: "Moliya - Oylik maoshlar" },
  { slug: 'salaries.calculate', name: "Xodimlarga oylik hisoblash", category: "Moliya - Oylik maoshlar" },
  { slug: 'salaries.pay', name: "Xodimlarga oylik to'lash", category: "Moliya - Oylik maoshlar" },

  // --- XODIMLAR (STAFF) ---
  { slug: 'staff.view', name: "Xodimlar ro'yxatini ko'rish", category: "Xodimlar (Staff)" },
  { slug: 'staff.create', name: "Yangi xodim qo'shish", category: "Xodimlar (Staff)" },
  { slug: 'staff.update', name: "Xodim ma'lumotlarini tahrirlash", category: "Xodimlar (Staff)" },
  { slug: 'staff.delete', name: "Xodimni o'chirish (bloklash)", category: "Xodimlar (Staff)" },
  { slug: 'staff_attendance.view', name: "Xodimlarning davomatini ko'rish", category: "Xodimlar (Staff)" },
  { slug: 'staff_attendance.mark', name: "Xodimlar davomatini belgilash", category: "Xodimlar (Staff)" },
  { slug: 'staff_attendance.stats', name: "Xodimlarning davomati bo'yicha statistika ko'rish", category: "Xodimlar (Staff)" },

  // --- O'QITUVCHILAR ---
  { slug: 'teachers.view', name: "O'qituvchilar ro'yxatini ko'rish", category: "O'qituvchilar" },
  { slug: 'teachers.create', name: "Yangi o'qituvchi qo'shish", category: "O'qituvchilar" },
  { slug: 'teachers.update', name: "O'qituvchi ma'lumotlarini tahrirlash", category: "O'qituvchilar" },
  { slug: 'teachers.delete', name: "O'qituvchini o'chirish", category: "O'qituvchilar" },

  // --- LAVOZIMLAR (ROLLAR VA HUQUQLAR) ---
  { slug: 'roles.view', name: "Lavozimlar ro'yxatini ko'rish", category: "Lavozimlar (Rollar va Huquqlar)" },
  { slug: 'roles.create', name: "Yangi lavozim yaratish", category: "Lavozimlar (Rollar va Huquqlar)" },
  { slug: 'roles.update', name: "Lavozim huquqlarini (permissions) tahrirlash", category: "Lavozimlar (Rollar va Huquqlar)" },
  { slug: 'roles.delete', name: "Lavozimni o'chirish", category: "Lavozimlar (Rollar va Huquqlar)" },

  // --- SMS VA ALOQA ---
  { slug: 'sms.send', name: "Xabar jo'natish (qo'lda)", category: "SMS va Aloqa" },
  { slug: 'sms.templates.view', name: "SMS shablonlarini ko'rish", category: "SMS va Aloqa" },
  { slug: 'sms.templates.create', name: "SMS shablon yaratish", category: "SMS va Aloqa" },
  { slug: 'sms.templates.update', name: "SMS shablonini tahrirlash", category: "SMS va Aloqa" },
  { slug: 'sms.templates.delete', name: "SMS shablonini o'chirish", category: "SMS va Aloqa" },
  { slug: 'sms.logs', name: "SMS yuborish tarixini (logs) ko'rish", category: "SMS va Aloqa" },
  { slug: 'sms.reports', name: "SMS yuborish hisobotlari", category: "SMS va Aloqa" },

  // --- CALL CENTER (ALOQA MARKAZI) ---
  { slug: 'callcenter.debtors', name: "Qarzdorlar ro'yxatini ko'rish", category: "Call Center (Aloqa markazi)" },
  { slug: 'callcenter.new_leads', name: "Yangi kelgan lidlarni ko'rish", category: "Call Center (Aloqa markazi)" },
  { slug: 'callcenter.absentees', name: "Dars qoldirgan o'quvchilar ro'yxatini ko'rish", category: "Call Center (Aloqa markazi)" },
  { slug: 'callcenter.leads', name: "CRM lidlar ro'yxatini ko'rish (aloqa uchun)", category: "Call Center (Aloqa markazi)" },
  { slug: 'callcenter.interaction', name: "Mijozlar bilan qilingan aloqalar tarixini yozish", category: "Call Center (Aloqa markazi)" },
  { slug: 'callcenter.resolve', name: "Call-center vazifalarini 'Bajarildi' deb belgilash", category: "Call Center (Aloqa markazi)" },
  
  // --- TARG'IBOT (PROMOTION) ---
  { slug: 'promotions.view', name: "Targ'ibot tadbirlarini ko'rish", category: "Targ'ibot (Promotion)" },
  { slug: 'promotions.create', name: "Yangi targ'ibot tadbiri qo'shish", category: "Targ'ibot (Promotion)" },
  { slug: 'promotions.update', name: "Targ'ibot ma'lumotlarini tahrirlash", category: "Targ'ibot (Promotion)" },

  // --- CHEGIRMALAR (DISCOUNTS) ---
  { slug: 'discounts.analytics', name: "Chegirmalar statistikasini va tahlilini ko'rish", category: "Chegirmalar (Discounts)" },
  { slug: 'discounts.view', name: "Chegirmalar ro'yxatini ko'rish", category: "Chegirmalar (Discounts)" },
  { slug: 'discounts.create', name: "Yangi chegirma turi yaratish", category: "Chegirmalar (Discounts)" },
  { slug: 'discounts.delete', name: "Chegirma turini tizimdan o'chirish", category: "Chegirmalar (Discounts)" },
  { slug: 'discounts.assign', name: "O'quvchiga chegirmani biriktirish", category: "Chegirmalar (Discounts)" },
  { slug: 'discounts.revoke', name: "O'quvchidan chegirmani bekor qilish", category: "Chegirmalar (Discounts)" },

  // --- OMBORXONA (INVENTORY) ---
  { slug: 'inventory.categories.view', name: "Omborxona kategoriyalari ro'yxatini ko'rish", category: "Omborxona (Inventory)" },
  { slug: 'inventory.categories.create', name: "Omborxonaga yangi kategoriya qo'shish", category: "Omborxona (Inventory)" },
  { slug: 'inventory.categories.update', name: "Omborxona kategoriyasini tahrirlash", category: "Omborxona (Inventory)" },
  { slug: 'inventory.categories.delete', name: "Omborxona kategoriyasini o'chirish", category: "Omborxona (Inventory)" },
  { slug: 'inventory.products.view', name: "Omborxonadagi mahsulotlar ro'yxatini ko'rish", category: "Omborxona (Inventory)" },
  { slug: 'inventory.products.create', name: "Omborxonaga yangi mahsulot qo'shish", category: "Omborxona (Inventory)" },
  { slug: 'inventory.products.update', name: "Mahsulot ma'lumotlarini tahrirlash", category: "Omborxona (Inventory)" },
  { slug: 'inventory.products.delete', name: "Mahsulotni omborxonadan o'chirish", category: "Omborxona (Inventory)" },

  // --- TASHQI MIJOZLAR (EXTERNAL CUSTOMERS) ---
  { slug: 'customers.view', name: "Tashqi mijozlar ro'yxatini ko'rish", category: "Tashqi Mijozlar (External Customers)" },
  { slug: 'customers.create', name: "Yangi tashqi mijoz qo'shish", category: "Tashqi Mijozlar (External Customers)" },
  { slug: 'customers.update', name: "Tashqi mijoz ma'lumotlarini tahrirlash", category: "Tashqi Mijozlar (External Customers)" },
  { slug: 'customers.delete', name: "Tashqi mijozni o'chirish", category: "Tashqi Mijozlar (External Customers)" },

  // --- KVITANSIYA SHABLONLARI (RECEIPT TEMPLATES) ---
  { slug: 'receipts.view', name: "Kvitansiya shablonlarini ko'rish", category: "Kvitansiya Shablonlari" },
  { slug: 'receipts.create', name: "Yangi kvitansiya shablonini saqlash", category: "Kvitansiya Shablonlari" },
  { slug: 'receipts.delete', name: "Kvitansiya shablonini o'chirish", category: "Kvitansiya Shablonlari" },

  // --- BILDIRISHNOMALAR (NOTIFICATIONS) ---
  { slug: 'notifications.view', name: "Bildirishnomalar ro'yxatini ko'rish", category: "Bildirishnomalar" },
  { slug: 'notifications.read', name: "Bildirishnomani o'qilgan deb belgilash", category: "Bildirishnomalar" },

  // --- TIZIM VA OFIS SOZLAMALARI ---
  { slug: 'settings.integrations', name: "Tashqi integratsiyalarni sozlash", category: "Tizim va Ofis Sozlamalari" },
  { slug: 'branches.view', name: "Filiallar ro'yxatini ko'rish", category: "Tizim va Ofis Sozlamalari" },
  { slug: 'branches.create', name: "Yangi filial qo'shish", category: "Tizim va Ofis Sozlamalari" },
  { slug: 'branches.update', name: "Filial ma'lumotlarini tahrirlash", category: "Tizim va Ofis Sozlamalari" },
  { slug: 'branches.delete', name: "Filialni o'chirish", category: "Tizim va Ofis Sozlamalari" },
  { slug: 'settings.attendance_penalty_amount', name: "Tizim davomat jarimasi miqdorini tahrirlash", category: "Tizim va Ofis Sozlamalari" },
  { slug: 'settings.attendance_penalty_time', name: "Tizim davomat jarimasi kutish vaqtini tahrirlash", category: "Tizim va Ofis Sozlamalari" },
  { slug: 'settings.passwords', name: "Xodimlarning tizim hisobi parol va xavfsizlik sozlamalarini boshqarish", category: "Tizim va Ofis Sozlamalari" },
  { slug: 'settings.office', name: "Umumiy ofis sozlamalari (markaz sozlamalari)", category: "Tizim va Ofis Sozlamalari" },
  { slug: 'payments.settings', name: "To'lov sozlamalari (turlari va kvitansiyalar)", category: "Moliya - To'lovlar" },

  // --- TIZIM (AVTOMATIK) ---
  { slug: 'PROFILE', name: "Talaba profili huquqi", category: "Tizim (Avtomatik)" },
  { slug: 'LMS', name: "O'qituvchi LMS huquqi", category: "Tizim (Avtomatik)" },
];
