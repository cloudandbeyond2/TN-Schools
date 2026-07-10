import sys

file_path = r'e:\BalaWork\school\TN-Schools\frontend\src\app\student\academics\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove dummy data (lines 92 to 333 - but let's just find indices)
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if line.startswith('function subjectsForClass(cls: number): string[] {'):
        start_idx = i
    if line.startswith('/* ────────────────────────────────────────────────────────────') and start_idx != -1 and end_idx == -1:
        if 'Category metadata for tabs & overview cards' in lines[i+1]:
            end_idx = i

if start_idx != -1 and end_idx != -1:
    del lines[start_idx:end_idx]

# Replace state initialization inside AcademicsHubPage
# find "  const subjects = useMemo("
subj_idx = -1
for i, line in enumerate(lines):
    if "const subjects = useMemo(" in line:
        subj_idx = i
        break

if subj_idx != -1:
    # remove the 8 lines of useMemo for subjects and resources
    del lines[subj_idx:subj_idx+8]
    
    # insert the new state and effect
    new_code = """
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [syllabusData, setSyllabusData] = useState<Record<string, SyllabusUnit[]>>({});
  const [loading, setLoading] = useState(true);

  const studentId = String((session?.user as any)?.id || "");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(/api/centralized-content/academics-dashboard?class=&studentId=);
        const json = await res.json();
        
        if (json.success && Array.isArray(json.data)) {
          const fetchedSubjects: SubjectInfo[] = [];
          const fetchedResources: Resource[] = [];
          const fetchedSyllabus: Record<string, SyllabusUnit[]> = {};
          
          json.data.forEach((sub: any) => {
            const subName = sub.name;
            const theme = SUBJECT_THEMES[subName] || { color: "#64748b", gradient: "from-slate-500 to-slate-600", icon: "📚" };
            
            let unitsCount = 0;
            const syllabus: SyllabusUnit[] = [];
            
            (sub.units || []).forEach((unit: any) => {
              unitsCount++;
              const topicsList: string[] = [];
              
              (unit.topics || []).forEach((topic: any) => {
                topicsList.push(topic.name);
                
                (topic.contents || []).forEach((content: any) => {
                  let category: CategoryKey = "materials";
                  let type = "PDF";
                  if (content.contentType === 'video') { category = "videos"; type = "Video"; }
                  else if (content.contentType === 'document') { category = "materials"; type = "PDF"; }
                  else if (content.contentType === 'interactive') { category = "digital"; type = "Interactive"; }
                  
                  fetchedResources.push({
                    id: content.id,
                    title: content.title,
                    subject: subName,
                    category: category as any,
                    type: type as any,
                    meta: content.fileSize || "10 MB",
                    description: content.description || Learning material for ,
                    url: content.fileUrl,
                    isNew: false,
                    popular: false
                  });
                });
              });
              
              syllabus.push({
                unit: Unit ,
                title: unit.name,
                topics: topicsList,
                status: "completed", 
                term: unit.unitNumber < 4 ? "Term I" : "Term II"
              });
            });
            
            fetchedSyllabus[subName] = syllabus;
            
            fetchedSubjects.push({
              name: subName,
              ...theme,
              teacher: DEFAULT_TEACHERS[subName] || "Class Teacher",
              progress: 0,
              units: unitsCount,
              unitsDone: 0
            });
          });
          
          setSubjects(fetchedSubjects);
          setResources(fetchedResources);
          setSyllabusData(fetchedSyllabus);
        }
      } catch (err) {
        console.error("Failed to fetch academics data", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (classNum) {
      fetchData();
    }
  }, [classNum, studentId]);

"""
    lines.insert(subj_idx, new_code)

# find syllabus usage const units = buildSyllabus(s.name);
for i, line in enumerate(lines):
    if "const units = buildSyllabus(s.name);" in line:
        lines[i] = line.replace("const units = buildSyllabus(s.name);", "const units = syllabusData[s.name] || [];")


# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
