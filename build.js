// build.js — bundles source files into a single shareable HTML file
// 
// This script reads index.html and inlines all CSS and JavaScript files.
// It works with the consolidated grail-data.js file (created by consolidate-data.js).
//
// Usage: npm run build
//
const fs = require('fs');
const path = require('path');

// Read version from package.json
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = pkg.version;

const SRC = '.';
const DIST = 'standalone';
const OUT = path.join(DIST, `pd2-grail-tracker-v${version}.html`);

// Create standalone folder if it doesn't exist
if (!fs.existsSync(DIST)) {
  fs.mkdirSync(DIST);
}

// Read the index.html
let html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');

// 1. Inline the CSS (replace <link rel="stylesheet" href="styles.css?v=...">)
html = html.replace(/<link rel="stylesheet" href="styles\.css[^"]*">/g, () => {
  const css = fs.readFileSync(path.join(SRC, 'styles.css'), 'utf8');
  return `<style>\n${css}\n</style>`;
});

// 2. Inline all <script src="..."> tags in order
html = html.replace(/<script src="([^"]+)"><\/script>/g, (match, src) => {
  const filePath = path.join(SRC, src.split('?')[0]);
  if (fs.existsSync(filePath)) {
    const js = fs.readFileSync(filePath, 'utf8');
    return `<script>\n${js}\n</script>`;
  }
  console.warn(`  WARNING: could not find ${filePath}`);
  return match;
});

// 3. Remove Google Fonts network request and embed a fallback stack
html = html.replace(
  /<link[^>]*fonts\.googleapis\.com[^>]*>/g,
  '<!-- Google Fonts removed for offline use -->'
);
// Patch font-family fallback so it still looks good without the font
html = html.replace(
  /'DM Sans',system-ui,sans-serif/g,
  "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif"
);

fs.writeFileSync(OUT, html, 'utf8');

const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
console.log(`Built: ${OUT} (${kb} KB)`);
