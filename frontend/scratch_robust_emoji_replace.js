const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');
const path = require('path');

const emojiMap = {
  '❤': 'Heart', '🪐': 'Globe', '🌿': 'Leaf', '⚙': 'Settings', '🔮': 'Sparkles',
  '✨': 'Sparkles', '🚀': 'Rocket', '😢': 'Frown', '👓': 'Glasses', '🎨': 'Palette',
  '⚡': 'Zap', '🛑': 'Octagon', '🌪': 'CloudLightning', '📺': 'Tv', '🦖': 'Bug',
  '📚': 'BookOpen', '🧪': 'FlaskConical', '🌍': 'Globe', '📁': 'Folder', '🗂': 'Archive',
  '✕': 'X', '📈': 'TrendingUp', '📅': 'Calendar', '📝': 'Edit', '⚠': 'AlertTriangle',
  '🎯': 'Target', '📋': 'Clipboard', '📢': 'Megaphone', '📌': 'Pin', '🎈': 'PartyPopper',
  '🎂': 'Cake', '🎵': 'Music', '🎉': 'PartyPopper', '🌟': 'Star', '🧑': 'User',
  '🤝': 'Handshake', '🥽': 'Eye', '💥': 'Flame', '🫧': 'Droplets', '🔥': 'Flame',
  '📍': 'MapPin', '🔍': 'Search', '🔬': 'Microscope', '👥': 'Users', '🏷': 'Tag',
  '⏰': 'Clock', '🩺': 'Stethoscope', '🎓': 'GraduationCap', '🚪': 'DoorOpen',
  '🏥': 'Building', '🏛': 'Landmark', '🏦': 'Landmark', '🛡': 'Shield', '⚖': 'Scale',
  '📖': 'Book', '👩': 'User', '🏆': 'Trophy', '🌐': 'Globe', '✏': 'Pencil',
  '🗑': 'Trash', '💻': 'Laptop', '⏳': 'Hourglass', '📑': 'FileText', '🐛': 'Bug',
  '🔧': 'Wrench', '🎮': 'Gamepad2', '🎭': 'Ticket', '🎫': 'Ticket', '🎒': 'Briefcase',
  '🎪': 'Tent', '📄': 'File', '🎬': 'Clapperboard', '📊': 'BarChart', '👁': 'Eye',
  '📂': 'FolderOpen', '☰': 'Menu', '📦': 'Package', '🔄': 'RefreshCw', '🪄': 'Wand2',
  '➕': 'Plus', '💾': 'Save', '🖼': 'Image', '🔔': 'Bell', '✓': 'Check',
  '⏹': 'Square', '😊': 'Smile', '🎙': 'Mic', '⭐': 'Star', '🙌': 'ThumbsUp',
  '👍': 'ThumbsUp', '🚌': 'Bus', '💼': 'Briefcase', '🗣': 'MessageSquare', '🦁': 'Cat',
  '🤖': 'Bot', '👤': 'User', '★': 'Star', '🖥': 'Monitor', '📓': 'Book',
  '⏱': 'Timer', '🎥': 'Video', '✍': 'PenTool', '🧬': 'Activity', '🖨': 'Printer',
  '🔑': 'Key', '❌': 'X', '📥': 'Inbox', '🏢': 'Building2', '❓': 'HelpCircle',
  '🔴': 'Circle', '🟡': 'Circle', '📬': 'Mail', '💡': 'Lightbulb', '👨': 'User',
  '💰': 'Coins', '📰': 'Newspaper', '🟦': 'Square', '🔤': 'Type', '🛠': 'Wrench',
  '🚧': 'Construction', '🔢': 'Hash', '⚽': 'Activity', '🏀': 'Activity', '☄': 'Flame',
  '🫀': 'Heart', '🤸': 'Activity', '♂': 'User', '💪': 'Activity', '🚑': 'Ambulance',
  '🏃': 'Activity', '🏐': 'Activity', '🤼': 'Users', '📏': 'Ruler', '🧘': 'User',
  '⚪': 'Circle', '💬': 'MessageCircle', '🏅': 'Medal', '☀': 'Sun', '🌙': 'Moon',
  '🧩': 'Puzzle', '📭': 'Mailbox', '🔁': 'Repeat', '🇬': 'Flag', '🇧': 'Flag',
  '🇮': 'Flag', '🇳': 'Flag', '🧠': 'Brain', '🦋': 'Bug', '🧸': 'Smile', '🐾': 'Activity',
  '🏫': 'Building2', '✅': 'CheckCircle', '☀️': 'Sun'
};

const emojiRegex = /([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{1F004}-\u{1F0CF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{200D}\u{FE0F}]+)/gu;

function getIcon(match) {
    let baseEmoji = match.replace(/[\u{FE0F}\u{200D}]/gu, '');
    if (!baseEmoji && match.length > 0) baseEmoji = match[0];
    return emojiMap[baseEmoji] || emojiMap[match] || 'Star';
}

const project = new Project({
    tsConfigFilePath: "e:/BalaWork/school/TN-Schools/frontend/tsconfig.json",
    skipAddingFilesFromTsConfig: true
});

project.addSourceFilesAtPaths("e:/BalaWork/school/TN-Schools/frontend/src/app/teacher/**/*.tsx");
// Add navConfig and portalPagesCatalog
project.addSourceFilesAtPaths("e:/BalaWork/school/TN-Schools/frontend/src/lib/navConfig.ts");
project.addSourceFilesAtPaths("e:/BalaWork/school/TN-Schools/frontend/src/lib/portalPagesCatalog.ts");

project.getSourceFiles().forEach(sourceFile => {
    let changed = false;
    let importsToAdd = new Set();
    
    // 1. Process StringLiterals
    const stringLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.StringLiteral);
    // Sort in reverse order to avoid shifting issues when replacing nodes
    stringLiterals.sort((a, b) => b.getPos() - a.getPos());
    
    for (const node of stringLiterals) {
        const text = node.getLiteralText();
        if (text.match(emojiRegex)) {
            const parent = node.getParent();
            
            // If it's the exact string of just an emoji e.g., icon: "🚀"
            if (text.trim().match(new RegExp('^' + emojiRegex.source + '$', 'u'))) {
                const iconName = getIcon(text.trim());
                importsToAdd.add(iconName);
                
                if (parent.getKind() === SyntaxKind.JsxAttribute) {
                    // It's in an attribute like placeholder="🚀"
                    // Can't put JSX directly, just strip the emoji.
                    node.replaceWithText(`"${text.replace(emojiRegex, '')}"`);
                } else if (parent.getKind() === SyntaxKind.PropertyAssignment && parent.getName() === 'icon') {
                    // icon: "🚀" -> icon: <Rocket className="w-5 h-5" />
                    node.replaceWithText(`<${iconName} className="w-5 h-5" />`);
                } else {
                    // some other place, maybe {isAll ? "📚" : "..."}
                    node.replaceWithText(`<${iconName} className="w-5 h-5 inline-block" />`);
                }
                changed = true;
            } else {
                // It's a mixed string like "Hello 🚀"
                const replaced = text.replace(emojiRegex, (match) => {
                    const iconName = getIcon(match);
                    importsToAdd.add(iconName);
                    return `</><${iconName} className="w-5 h-5 inline-block mx-1" /><>`;
                });
                
                if (parent.getKind() === SyntaxKind.JsxAttribute) {
                    node.replaceWithText(`"${text.replace(emojiRegex, '').trim()}"`);
                    changed = true;
                } else if (parent.getKind() === SyntaxKind.PropertyAssignment) {
                     // We can't really do `<>Hello<Rocket/></>` without quotes for property assignment easily unless it accepts JSX
                     node.replaceWithText(`<><>${replaced}</></>`);
                     changed = true;
                } else {
                     // Safe for normal JSX expressions
                     node.replaceWithText(`<><>${replaced}</></>`);
                     changed = true;
                }
            }
        }
    }
    
    // 2. Process JsxText
    const jsxTexts = sourceFile.getDescendantsOfKind(SyntaxKind.JsxText);
    jsxTexts.sort((a, b) => b.getPos() - a.getPos());
    
    for (const node of jsxTexts) {
        const text = node.getText();
        if (text.match(emojiRegex)) {
            const replaced = text.replace(emojiRegex, (match) => {
                const iconName = getIcon(match);
                importsToAdd.add(iconName);
                return `{<${iconName} className="w-5 h-5 inline-block mx-1" />}`;
            });
            node.replaceWithText(replaced);
            changed = true;
        }
    }
    
    if (changed) {
        // Add imports
        if (importsToAdd.size > 0) {
            const existingImport = sourceFile.getImportDeclaration(dec => dec.getModuleSpecifierValue() === "lucide-react");
            if (existingImport) {
                const existingNamed = existingImport.getNamedImports().map(ni => ni.getName());
                for (const icon of importsToAdd) {
                    if (!existingNamed.includes(icon)) {
                        existingImport.addNamedImport(icon);
                    }
                }
            } else {
                sourceFile.addImportDeclaration({
                    moduleSpecifier: "lucide-react",
                    namedImports: Array.from(importsToAdd).map(icon => ({ name: icon }))
                });
            }
        }
        sourceFile.saveSync();
        console.log(`Processed: ${sourceFile.getFilePath()}`);
    }
});
