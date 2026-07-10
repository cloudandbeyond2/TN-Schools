import sys
import re

file_path = r'e:\BalaWork\school\TN-Schools\frontend\src\app\student\academics\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix the fetch URL
for i, line in enumerate(lines):
    if "const res = await fetch(/api/centralized-content/academics-dashboard?class=&studentId=);" in line:
        lines[i] = '        const res = await fetch(`/api/centralized-content/academics-dashboard?class=${classNum}&studentId=${studentId}`);\n'
    if 'description: content.description || Learning material for ,' in line:
        lines[i] = '                    description: content.description || `Learning material for ${topic.name}`,\n'
    if 'unit: Unit ,' in line:
        lines[i] = '                unit: `Unit ${unit.unitNumber}`,\n'
    if 'subjects.find((s) => s.name === name) || buildSubjectInfo(name, 0);' in line:
        lines[i] = """    subjects.find((s) => s.name === name) || {
      name,
      ...(SUBJECT_THEMES[name] || { color: "#64748b", gradient: "from-slate-500 to-slate-600", icon: "📚" }),
      teacher: DEFAULT_TEACHERS[name] || "Class Teacher",
      progress: 0,
      units: 0,
      unitsDone: 0,
    };
"""

# Add loading check
loading_check_added = False
for i, line in enumerate(lines):
    if line.startswith("  return (") and not loading_check_added:
        lines.insert(i, '  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>;\n\n')
        loading_check_added = True
        break

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
