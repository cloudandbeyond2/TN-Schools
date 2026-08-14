const fs = require('fs');
const path = 'd:/tnschools/TN-Schools/frontend/src/app/teacher/ai-lesson-creator/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add viewMode state
content = content.replace(
  'const [isLoading, setIsLoading] = useState(true);',
  'const [isLoading, setIsLoading] = useState(true);\n  const [viewMode, setViewMode] = useState<"neon" | "academic" | "bento" | "timeline">("neon");'
);

// 2. Change data to infographicData
content = content.replace(
  'const data = lesson.infographicData;',
  'const infographicData = lesson.infographicData;'
);

// 3. Read themes.txt
const themes = fs.readFileSync('d:/tnschools/TN-Schools/frontend/themes.txt', 'utf8');

// 4. Replace renderNeonTheme with all themes
const renderNeonStart = content.indexOf('  const renderNeonTheme = () => (');
const returnStart = content.indexOf('  return (');
content = content.substring(0, renderNeonStart) + themes + '\n\n' + content.substring(returnStart);

// 5. Replace render block with viewMode selector
const oldRender = '{renderNeonTheme()}';
const newRender = `
            {/* View Mode Selector */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-1">
                {[
                  { id: "neon", label: "Neon Infographic", icon: "fi-rr-galaxy" },
                  { id: "academic", label: "Clean Academic", icon: "fi-rr-book-alt" },
                  { id: "bento", label: "Modern Cards", icon: "fi-rr-apps" },
                  { id: "timeline", label: "Timeline Flow", icon: "fi-rr-chart-tree" }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as any)}
                    className={\`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all \${
                      viewMode === mode.id 
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-600 dark:text-white shadow-sm" 
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700"
                    }\`}
                  >
                    <i className={\`fi \${mode.icon}\`}></i>
                    <span className="hidden md:inline">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Render the active theme */}
            <div className="w-full relative">
              {viewMode === "neon" && renderNeonTheme()}
              {viewMode === "academic" && renderAcademicTheme()}
              {viewMode === "bento" && renderBentoTheme()}
              {viewMode === "timeline" && renderTimelineTheme()}
            </div>
`;
content = content.replace(oldRender, newRender);

fs.writeFileSync(path, content, 'utf8');
console.log('Update successful!');
