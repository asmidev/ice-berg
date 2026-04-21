import sys

file_path = r'c:\Users\asmi\Desktop\ICE-BERG\Ice-admin\apps\admin\src\app\(dashboard)\lms\groups\[id]\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if 'stdAtnd?.attendances?.find((a: any) => new Date(a.date).getDate() === d.day)' in line:
        line = line.replace('new Date(a.date).getDate() === d.day', "a.date?.split('T')[0] === d.dateStr")
    
    if '<CheckCircle2 size={15} />' in line:
        line = line.replace('<CheckCircle2 size={15} />', '{hasAttendance?.score ? <span className="text-[10px] font-black">{hasAttendance.score}</span> : <CheckCircle2 size={14} />}')
    
    if 'shadow-sm">' in line and '<CheckCircle2' in line:
         line = line.replace('shadow-sm">', 'shadow-sm relative overflow-hidden">')

    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
