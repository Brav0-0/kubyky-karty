// CI-перевірка проєкту (запускається в GitHub Actions: npm run check:js).
// 1) синтаксис усіх JS-файлів; 2) усі локальні посилання src/href у HTML ведуть на існуючі файли;
// 3) у кожній сторінці є title, meta description, lang та рівно один <h1>;
// 4) data.json — валідний JSON зі списком ігор, у кожної гри є обов'язкові поля.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const errors = [];

// 1. Синтаксис JavaScript
const jsDir = path.join(root, 'assets', 'js');
for (const file of fs.readdirSync(jsDir).filter((f) => f.endsWith('.js'))) {
  try {
    execFileSync(process.execPath, ['--check', path.join(jsDir, file)], { stdio: 'pipe' });
  } catch (err) {
    errors.push('JS-синтаксис: ' + file + '\n' + String(err.stderr));
  }
}

// 2–3. HTML-сторінки
const pages = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');

  const refs = [...html.matchAll(/\s(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|#|data:)/.test(ref)) continue;
    const clean = ref.split('#')[0].split('?')[0];
    if (clean && !fs.existsSync(path.join(root, clean))) {
      errors.push(page + ': посилання на неіснуючий файл ' + ref);
    }
  }

  if (!/<html lang="uk">/.test(html)) errors.push(page + ': немає lang="uk"');
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(page + ': немає <title>');
  if (!/<meta name="description" content="[^"]{50,}">/.test(html)) errors.push(page + ': немає meta description');
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(page + ': очікується один <h1>, знайдено ' + h1);
  if (/cdn\.tailwindcss\.com/.test(html)) errors.push(page + ': підключено Tailwind CDN замість css/tailwind.css');
}

// 4. Mock-дані data.json
try {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data.json'), 'utf8'));
  if (!Array.isArray(data.games) || data.games.length === 0) errors.push('data.json: немає масиву games');
  else data.games.forEach(function (g, i) {
    ['id', 'name', 'price', 'minAge', 'image', 'tags'].forEach(function (key) {
      if (g[key] === undefined) errors.push('data.json: у грі #' + i + ' немає поля ' + key);
    });
  });
} catch (err) {
  errors.push('data.json: ' + err.message);
}

if (errors.length) {
  console.error('Перевірку не пройдено:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log('OK: ' + pages.length + ' HTML-сторінок, JS-синтаксис і локальні посилання коректні.');
