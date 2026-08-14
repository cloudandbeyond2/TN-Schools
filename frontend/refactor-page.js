const fs = require('fs');

const path = 'd:/tnschools/TN-Schools/frontend/src/app/teacher/ai-lesson-creator/page.tsx';
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

// 3. Find where renderNeonTheme starts and where the return block begins
const renderNeonStart = content.indexOf('  const renderNeonTheme = () => (');
const returnStart = content.indexOf('  return (');

if (renderNeonStart !== -1 && returnStart !== -1) {
  content = content.substring(0, renderNeonStart) + content.substring(returnStart);
}

// 4. In the return block, remove the view mode selector and the active theme renderer, replace with InfographicRenderer
// First, find the start of {/* View Mode Selector */}
const viewModeSelectorStart = content.indexOf('{/* View Mode Selector */}');
// Find the end of the relative div
const activeThemeEnd = content.indexOf('</div>', content.indexOf('{/* Render the active theme */}')) + 6;

if (viewModeSelectorStart !== -1 && activeThemeEnd !== -1) {
  const replacement = '<InfographicRenderer data={infographicData} focus={selectedFocus} />';
  // Need to find the exact end. Let's just use string replacement on the chunk
  const oldChunk = content.substring(viewModeSelectorStart, content.indexOf('</div>\n        </div>\n      </PortalLayout>', viewModeSelectorStart));
  
  content = content.replace(oldChunk, replacement + '\n');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Update page.tsx successful!');
