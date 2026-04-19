import os

path = r'c:\Users\asmi\Desktop\ICE-BERG\Ice-admin\apps\admin\src\app\(dashboard)\lms\page.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Courses
content = content.replace(
    '{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}',
    '{courses.filter(c => !newGroup.branchId || c.branch_id === newGroup.branchId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}'
)

# Replace Teachers (two occurrences)
content = content.replace(
    '{teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}',
    '{teachers.filter(t => !newGroup.branchId || t.branches?.some((b: any) => b.id === newGroup.branchId)).map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully replaced content")
