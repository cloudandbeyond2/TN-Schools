const fs = require('fs');
const path = require('path');

// Renames the user-facing product name only. Case-sensitive on purpose:
//   "Gemini" / "Gemini AI"  -> prose & UI copy, safe to rename
//   "gemini-2.5-flash"      -> API model id, MUST NOT be renamed
//   "GEMINI" / GEMINI_API_KEY -> provider enum / env var, MUST NOT be renamed
const OLD_TERM = /Gemini AI/g;
const OLD_TERM_SHORT = /\bGemini\b/g;
const NEW_TERM = 'Smart Assistant';

const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'coverage', '_preview']);
const EXTENSIONS = ['.ts', '.tsx', '.md', '.js'];
const SELF = path.resolve(__filename);

// Only apply changes when explicitly asked; otherwise just report.
const WRITE = process.argv.includes('--write');

function replaceInFile(filePath) {
  // Never rewrite this script: it contains the search terms itself.
  if (path.resolve(filePath) === SELF) {
    return;
  }

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.warn(`Skipped (unreadable): ${filePath} - ${err.message}`);
    return;
  }
  const original = content;

  // First replace "Gemini AI" to avoid double replacements.
  content = content.replace(OLD_TERM, NEW_TERM);

  // Then standalone "Gemini". \b already protects identifiers (callGemini,
  // GEMINI_API_KEY); the guard below protects URL path segments such as
  // ".../models/Gemini-2.5-flash".
  content = content.replace(OLD_TERM_SHORT, (match, offset, string) => {
    const precedingChar = offset > 0 ? string[offset - 1] : '';
    const succeedingChar = offset + match.length < string.length ? string[offset + match.length] : '';

    if (precedingChar === '_' || succeedingChar === '_' ||
        precedingChar === '/' || succeedingChar === '/') {
      return match;
    }
    return NEW_TERM;
  });

  if (original !== content) {
    if (WRITE) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    } else {
      console.log(`Would update: ${filePath}`);
    }
  }
}

function walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    console.warn(`Skipped (unreadable dir): ${dir} - ${err.message}`);
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) {
        continue;
      }
      walk(fullPath);
    } else if (entry.isFile() && EXTENSIONS.includes(path.extname(entry.name))) {
      replaceInFile(fullPath);
    }
  }
}

console.log(WRITE ? 'Starting replacement...' : 'Dry run (pass --write to apply)...');
walk('.');
console.log('Done!');
