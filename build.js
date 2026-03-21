// build.js — injects OPENROUTER_API_KEY from Vercel env into index.html
const fs = require('fs');
const path = require('path');

const apiKey = process.env.OPENROUTER_API_KEY || '';
const indexPath = path.join(__dirname, 'index.html');

let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace("'%%OPENROUTER_API_KEY%%'", JSON.stringify(apiKey));

// Write to dist/
fs.mkdirSync('dist', { recursive: true });

// Copy all assets to dist
const copyDir = (src, dest) => {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
};

fs.writeFileSync(path.join('dist', 'index.html'), html);
copyDir('src', path.join('dist', 'src'));
copyDir('assets', path.join('dist', 'assets'));

console.log('Build complete. API key injected:', apiKey ? '✓ (set)' : '✗ (missing!)');
