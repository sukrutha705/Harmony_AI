const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/pages/ModeratorDashboard.jsx');

const replacements = [
  { from: /(?<!dark:)text-white/g, to: 'text-slate-900 dark:text-white' },
  { from: /(?<!dark:)bg-dark-800\/40/g, to: 'bg-white dark:bg-dark-800/40' },
  { from: /(?<!dark:)bg-dark-800\/20/g, to: 'bg-white dark:bg-dark-800/20' },
  { from: /(?<!dark:)bg-dark-800\/50/g, to: 'bg-slate-50 dark:bg-dark-800/50' },
  { from: /(?<!dark:)bg-dark-800/g, to: 'bg-white dark:bg-dark-800' },
  { from: /(?<!dark:)bg-dark-900\/80/g, to: 'bg-white/80 dark:bg-dark-900/80' },
  { from: /(?<!dark:)bg-dark-900\/90/g, to: 'bg-white/90 dark:bg-dark-900/90' },
  { from: /(?<!dark:)bg-dark-900/g, to: 'bg-slate-50 dark:bg-dark-900' },
  { from: /(?<!dark:)bg-dark-950\/80/g, to: 'bg-slate-200/80 dark:bg-dark-950/80' },
  { from: /(?<!dark:)bg-dark-950/g, to: 'bg-white dark:bg-dark-950' },
  { from: /(?<!dark:)text-slate-300/g, to: 'text-slate-700 dark:text-slate-300' },
  { from: /(?<!dark:)text-slate-400/g, to: 'text-slate-500 dark:text-slate-400' },
  { from: /(?<!dark:)border-white\/5/g, to: 'border-slate-200 dark:border-white/5' },
  { from: /(?<!dark:)border-white\/10/g, to: 'border-slate-300 dark:border-white/10' },
  { from: /(?<!dark:)bg-white\/5/g, to: 'bg-slate-100 dark:bg-white/5' },
  { from: /(?<!dark:)divide-white\/5/g, to: 'divide-slate-200 dark:divide-white/5' }
];

if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  
  replacements.forEach(r => {
    content = content.replace(r.from, r.to);
  });
  
  fs.writeFileSync(file, content, 'utf8');
  console.log(`✅ Updated ${file}`);
} else {
  console.error(`❌ File not found: ${file}`);
}
