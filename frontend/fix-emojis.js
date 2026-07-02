const fs = require('fs');
const path = 'e:/BalaWork/school/TN-Schools/frontend/src/lib/navConfig.ts';
let content = fs.readFileSync(path, 'utf8');

const emojiMap = {
  '🎓': 'GraduationCap', '👨‍👩‍👧': 'Users', '📚': 'Book', '🏫': 'Building',
  '🏢': 'Building2', '🗺️': 'Map', '⚖️': 'Scale', '🏛️': 'Building2',
  '🛠️': 'Settings', '🏠': 'Home', '🤖': 'Bot', '📖': 'BookOpen',
  '🧭': 'Compass', '📝': 'Edit3', '⚡': 'Zap', '🏅': 'Award',
  '🎮': 'Gamepad2', '🎁': 'Gift', '➗': 'Calculator', '📢': 'Megaphone',
  '🧪': 'FlaskConical', '🗂️': 'FolderOpen', '🧬': 'Microscope', '🏆': 'Trophy',
  '🎭': 'Smile', '⚽': 'Activity', '🏥': 'HeartPulse', '📄': 'FileText',
  '💚': 'Smile', '💻': 'Monitor', '🔬': 'Microscope', '🗣️': 'MessageSquare',
  '⚗️': 'FlaskConical', '🐸': 'Target', '🧊': 'Box', '🎉': 'PartyPopper',
  '📰': 'Newspaper', '🎯': 'Target', '🚀': 'Rocket', '📜': 'ScrollText',
  '👨‍👩‍👦': 'Users', '⚠️': 'ShieldAlert', '📊': 'Activity', '🗓️': 'Calendar',
  '✍️': 'Edit3', '👤': 'User', '📋': 'FileText', '🏗️': 'Building', '📦': 'Box',
  '👨‍🎓': 'GraduationCap', '👩‍🏫': 'User', '🤝': 'Users', '👨🎓': 'GraduationCap', '👩🏫': 'User',
  '👪': 'Users', '🍛': 'Utensils', '🥳': 'PartyPopper',
  '🖼️': 'Image', '📉': 'TrendingDown', '💰': 'Banknote', '📡': 'Radio',
  '🔴': 'Circle', '📈': 'TrendingUp', '💡': 'Lightbulb', '👥': 'Users',
  '🔐': 'Lock', '🔄': 'RefreshCw', '⚙️': 'Settings', '❓': 'HelpCircle',
  '✅': 'CheckCircle', '✔️': 'Check', '📅': 'Calendar'
};

// Also handle icon: \"emoji\" format
Object.keys(emojiMap).forEach(emoji => {
  // Replace all occurrences of the emoji inside quotes
  content = content.split('\"' + emoji + '\"').join('\"' + emojiMap[emoji] + '\"');
});

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed navConfig.ts emojis successfully');
