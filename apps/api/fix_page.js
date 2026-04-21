const fs = require('fs');
const path = 'c:/Users/asmi/Desktop/ICE-BERG/Ice-admin/apps/admin/src/app/(dashboard)/lms/groups/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix date comparison
content = content.replace(
  /new Date\(a\.date\)\.getDate\(\) === d\.day/g,
  "a.date?.split('T')[0] === d.dateStr"
);

// 2. Add score display (checking if CheckCircle2 exists in the line)
const lines = content.split('\n');
const fixedLines = lines.map(line => {
    if (line.includes('<CheckCircle2 size={15} />')) {
        return line.replace('<CheckCircle2 size={15} />', '{hasAttendance?.score ? <span className="text-[10px] font-black">{hasAttendance.score}</span> : <CheckCircle2 size={13} />}');
    }
    return line;
});

content = fixedLines.join('\n');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed page.tsx');
