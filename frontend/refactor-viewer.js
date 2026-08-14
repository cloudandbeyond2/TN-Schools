const fs = require('fs');

const path = 'd:/tnschools/TN-Schools/frontend/src/app/teacher/ai-lesson-creator/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add import for InfographicRenderer
content = content.replace(
  'import PortalLayout from "@/components/PortalLayout";',
  'import PortalLayout from "@/components/PortalLayout";\nimport { InfographicRenderer } from "@/components/InfographicRenderer";'
);

// 2. Remove viewMode state
content = content.replace(
  /const \[viewMode, setViewMode\] = useState<"neon" \| "academic" \| "bento" \| "timeline">\("neon"\);\n/g,
  ''
);

// 3. Find where themes.txt insertion started (renderNeonTheme) and where return starts
const renderNeonStart = content.indexOf('  const renderNeonTheme = () => (');
const returnStart = content.indexOf('  return (', renderNeonStart); // Find the return AFTER the themes

if (renderNeonStart !== -1 && returnStart !== -1) {
  content = content.substring(0, renderNeonStart) + content.substring(returnStart);
}

// 4. In the return block, replace view mode selector and theme rendering
const viewModeSelectorStart = content.indexOf('{/* View Mode Selector */}');
const activeThemeEnd = content.indexOf('</div>\n        </div>\n      </div>\n    </PortalLayout>', viewModeSelectorStart);

if (viewModeSelectorStart !== -1 && activeThemeEnd !== -1) {
  const replacement = '<InfographicRenderer data={infographicData} focus={lesson.focus || "Exam point of view"} />';
  const oldChunk = content.substring(viewModeSelectorStart, activeThemeEnd);
  
  content = content.replace(oldChunk, replacement + '\n');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Update [id]/page.tsx successful!');
