# Asosiy Ishchi Qoida (Core Development Rule)

**Qoida qabul qilingan vaqt:** 2026-yil 22-aprel.
**Bajarilishi majburiy bo'lgan shartlar:**

Kelajakda tizimning qaysi moduliga (UI yoki API) teginib, uni o'zgartirsak yoki yangidan dasturlasak, **avtomatik ravishda (eslatmasiz)** quyidagi ishlarni bajarish qat'iy talab etiladi:

1. **Ruxsatlar ro'yxatini tekshirish:** Yangi yaratilgan amallar yoki o'zgartirilgan imkoniyatlar darhol backend'dagi `permissions.constants.ts` ga yozilishi/tekshirilishi shart.
2. **Controller himoyasi (`@SetPermissions`):** Tahrirlangan API qismi darhol mos keluvchi `@SetPermissions(...)` dekoratori orqali yopilishi shart.
3. **Mukammal Xatolik boshqaruvi (`try/catch`):** API va UI funksiyalari doimo tizim uzluksizligini saqlovchi barcha holatdagi `try/catch` himoya qobiqlariga o'ralishi va to'xtab qolishlarning mutlaq oldini olishi kafolatlanishi kerak.

> Men o'z xotiram va tizim bilimlarim bazasining Asosiy Direktivalari safiga shu qoidani mixlab qo'ydim. Endi har safar yangi funksionallik qo'shish jarayonida avtomatik ravishda bu 3 qadam doimiy nazoratda bo'ladi!
