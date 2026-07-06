const fs = require('fs');
const path = require('path');

const OLD_TERM = /Gemini AI/gi;
const OLD_TERM_SHORT = /\bGemini\b/gi;
const NEW_TERM = 'Smart Assistant';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Do not replace in node_modules, git, or build folders
  if (filePath.includes('node_modules') || filePath.includes('.git') || filePath.includes('.next')) {
    return;
  }

  // First replace "Gemini AI" to avoid double replacements
  content = content.replace(OLD_TERM, NEW_TERM);
  
  // Then replace standalone "Gemini", but be careful NOT to replace env variable names like GEMINI_API_KEY
  content = content.replace(OLD_TERM_SHORT, (match, offset, string) => {
    // Check surrounding characters to avoid renaming GEMINI_API_KEY
    const precedingChar = offset > 0 ? string[offset - 1] : '';
    const succeedingChar = offset + match.length < string.length ? string[offset + match.length] : '';
    
    // If it's part of an underscore separated variable like GEMINI_API_KEY, ignore it
    if (precedingChar === '_' || succeedingChar === '_') {
      return match; 
    }
    return NEW_TERM;
  });
  
  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    
    // Skip heavy/binary directories
    if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'package-lock.json') {
      continue;
    }
    
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (
      fullPath.endsWith('.ts') || 
      fullPath.endsWith('.tsx') || 
      fullPath.endsWith('.md') || 
      fullPath.endsWith('.js')
    ) {
      replaceInFile(fullPath);
    }
  }
}

console.log('Starting replacement...');
walk('.');
console.log('Done!');
