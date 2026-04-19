const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'asmi', 'Desktop', 'ICE-BERG', 'Ice-admin', 'apps', 'admin', 'src', 'app', '(dashboard)', 'lms', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace List View buttons
const oldListButtons = `                     <div className="col-span-2 flex justify-end gap-2 pr-4">
                        <Button onClick={() => openEditModal(group)} variant="ghost" size="icon" className="h-9 w-9 rounded-lg font-bold text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 shadow-none p-0 shrink-0">
                           <Edit2 className="w-4 h-4" />
                        </Button>`;

const newListButtons = `                     <div className="col-span-2 flex justify-end gap-2 pr-4">
                        <Button onClick={() => openEnrollmentModal(group)} variant="ghost" size="icon" className="h-9 w-9 rounded-lg font-bold text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 shadow-none p-0 shrink-0" title="Talaba qo'shish">
                           <UserPlus className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => openEditModal(group)} variant="ghost" size="icon" className="h-9 w-9 rounded-lg font-bold text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 shadow-none p-0 shrink-0" title="Tahrirlash">
                           <Edit2 className="w-4 h-4" />
                        </Button>`;

if (content.includes(oldListButtons.trim())) {
    console.log("Found List View buttons, replacing...");
    // We use a more loose matching if exact fails, but let's try direct first.
    content = content.replace(oldListButtons.trim(), newListButtons.trim());
} else {
    console.log("Could not find List View buttons exactly. Trying alternative match...");
    // Fallback: search for unique line
    content = content.replace(
        '<Button onClick={() => openEditModal(group)} variant="ghost" size="icon" className="h-9 w-9 rounded-lg font-bold text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 shadow-none p-0 shrink-0">',
        '<Button onClick={() => openEnrollmentModal(group)} variant="ghost" size="icon" className="h-9 w-9 rounded-lg font-bold text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 shadow-none p-0 shrink-0" title="Talaba qo\'shish"><UserPlus className="w-4 h-4" /></Button>\n                        <Button onClick={() => openEditModal(group)} variant="ghost" size="icon" className="h-9 w-9 rounded-lg font-bold text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 shadow-none p-0 shrink-0" title="Tahrirlash">'
    );
}

// Replace Schedule View buttons
const oldScheduleButtons = `{group.schedules?.length > 0 && (
                   <Button onClick={() => { setSelectedGroup(group); setIsScheduleModalOpen(true); }} variant="outline" className="w-full mt-8 rounded-xl border-zinc-100 font-bold h-12 text-zinc-700 bg-white hover:bg-zinc-50 shadow-sm text-sm">
                     <CalendarDays className="w-4 h-4 mr-2 text-zinc-400" /> Jadvalni Yangilash
                   </Button>
                )}`;

const newScheduleButtons = `<div className="mt-8 flex gap-3">
                    <Button onClick={() => openEnrollmentModal(group)} className="h-12 w-12 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-xl flex items-center justify-center border border-zinc-100 shrink-0" title="Talaba qo'shish">
                      <UserPlus className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => { setSelectedGroup(group); setIsScheduleModalOpen(true); }} variant="outline" className="flex-1 rounded-xl border-zinc-100 font-bold h-12 text-zinc-700 bg-white hover:bg-zinc-50 shadow-sm text-sm">
                      <CalendarDays className="w-4 h-4 mr-2 text-zinc-400" /> Jadvalni Yangilash
                    </Button>
                 </div>`;

content = content.replace(oldScheduleButtons.trim(), newScheduleButtons.trim());

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully updated page.tsx");
