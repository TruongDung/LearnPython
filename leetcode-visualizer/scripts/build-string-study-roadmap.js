// Publish the existing Markdown document as a readable static page and download.
// Run from any directory: node leetcode-visualizer/scripts/build-string-study-roadmap.js
const fs = require('node:fs');
const path = require('node:path');
const { translate, translateMarkdown } = require('./string-study-roadmap-translations');

const sourcePath = path.join(__dirname, '..', '..', 'docs', 'leetcode-string-study-roadmap.md');
const publicPath = path.join(__dirname, '..', 'public');
const markdown = fs.readFileSync(sourcePath, 'utf8');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

// The source uses headings, paragraphs, ordered lists, bold text, links and tables.
// Escape text first and allow only HTTPS URLs; raw HTML is never interpreted.
function inline(value) {
  return escape(value).replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}
function bilingual(tag, value, attributes = '', english = translate(value)) {
  const vi = inline(value), en = inline(english);
  const translations = vi === en ? '' : ` data-vi="${escape(vi)}" data-en="${escape(en)}"`;
  return `<${tag}${attributes}${translations}>${vi}</${tag}>`;
}
const lines = markdown.replace(/^\uFEFF/, '').split(/\r?\n/);
const chunks = [], headings = [];
let i = 0, nextHeading = 0;
while (i < lines.length) {
  const line = lines[i];
  if (!line.trim()) { i++; continue; }
  const heading = /^(#{1,3})\s+(.+)$/.exec(line);
  if (heading) {
    const level = heading[1].length, id = 'section-' + nextHeading++;
    chunks.push(bilingual('h' + level, heading[2], ` id="${id}"`));
    if (level === 2) headings.push({ id, title: heading[2] });
    i++; continue;
  }
  if (line.startsWith('|')) {
    const tableLines = [];
    while (i < lines.length && lines[i].startsWith('|')) tableLines.push(lines[i++]);
    const cells = row => row.replace(/^\|\s*/, '').replace(/\s*\|$/, '').split(/(?<!\\)\|/).map(cell => cell.trim().replaceAll('\\|', '|'));
    const header = cells(tableLines[0]);
    const rows = tableLines.slice(2).map(cells);
    chunks.push(`<div class="table-wrap"><table><thead><tr>${header.map(cell => bilingual('th', cell, ' scope="col"')).join('')}</tr></thead><tbody>${rows.map(row => '<tr>' + row.map(cell => bilingual('td', cell)).join('') + '</tr>').join('')}</tbody></table></div>`);
    continue;
  }
  if (/^\d+\.\s/.test(line)) {
    const items = [];
    while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
      const item = lines[i++];
      items.push({ vi: item.replace(/^\d+\.\s/, ''), en: translate(item).replace(/^\d+\.\s/, '') });
    }
    chunks.push('<ol>' + items.map(item => bilingual('li', item.vi, '', item.en)).join('') + '</ol>');
    continue;
  }
  const paragraph = [];
  while (i < lines.length && lines[i].trim() && !/^(?:#{1,3}\s|\||\d+\.\s)/.test(lines[i])) paragraph.push(lines[i++]);
  chunks.push(bilingual('p', paragraph.join(' ')));
}
const problemCount = lines.filter(line => /^\| \d+ \| \[\d+\./.test(line)).length;
const html = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>Lộ trình học String — LeetCode Visualizer</title>
  <style>
    :root { color-scheme:light dark; --bg:#f1f5f9; --card:#fff; --text:#0f172a; --muted:#475569; --border:#cbd5e1; --accent:#4338ca; --stripe:#f8fafc; }
    @media (prefers-color-scheme:dark) { :root { --bg:#0b1220; --card:#111c2e; --text:#e2e8f0; --muted:#94a3b8; --border:#334155; --accent:#a5b4fc; --stripe:#172338; } }
    * { box-sizing:border-box; }
    html { scroll-behavior:smooth; }
    body { margin:0; background:var(--bg); color:var(--text); font:15px/1.7 system-ui,sans-serif; }
    main { max-width:1150px; margin:auto; padding:28px 20px 60px; }
    a { color:var(--accent); text-underline-offset:3px; }
    a:hover { text-decoration-thickness:2px; }
    a:focus-visible, button:focus-visible, summary:focus-visible { outline:3px solid var(--accent); outline-offset:3px; }
    .toolbar { position:sticky; top:0; z-index:10; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; padding:10px 0; margin-bottom:20px; background:var(--bg); }
    .toolbar a { display:inline-block; padding:9px 14px; background:var(--card); border:1px solid var(--border); border-radius:9px; font-size:13px; text-decoration:none; }
    .toolbar-actions { display:flex; align-items:center; flex-wrap:wrap; gap:10px; }
    .language-switch { display:flex; padding:3px; border:1px solid var(--border); border-radius:9px; background:var(--card); }
    .language-switch button { border:0; border-radius:6px; padding:8px 12px; font:700 12px system-ui,sans-serif; cursor:pointer; background:transparent; color:var(--muted); }
    .language-switch button[aria-pressed="true"] { background:var(--accent); color:var(--card); }
    .eyebrow { color:var(--accent); font-weight:800; font-size:11px; letter-spacing:1.5px; }
    article { padding:26px; background:var(--card); border:1px solid var(--border); border-radius:14px; min-width:0; }
    h1 { font-size:clamp(24px,4vw,34px); line-height:1.3; margin:0 0 20px; }
    h2 { font-size:24px; border-top:1px solid var(--border); padding-top:25px; margin:35px 0 12px; }
    h3 { font-size:18px; margin:28px 0 8px; }
    h1,h2,h3 { scroll-margin-top:85px; }
    p { color:var(--muted); overflow-wrap:anywhere; }
    li { padding:3px 0; }
    strong { color:var(--text); }
    details { padding:13px 18px; background:var(--card); border:1px solid var(--border); border-radius:10px; margin-bottom:18px; }
    summary { cursor:pointer; font-weight:700; }
    nav { display:flex; flex-wrap:wrap; gap:8px 20px; padding-top:10px; }
    nav a { font-size:13px; }
    .table-wrap { overflow-x:auto; max-width:100%; margin:18px 0; border:1px solid var(--border); border-radius:9px; }
    table { border-collapse:collapse; width:100%; min-width:670px; text-align:left; font-size:13px; }
    th { color:var(--muted); background:var(--stripe); font-size:11px; }
    th,td { padding:10px 12px; border-bottom:1px solid var(--border); vertical-align:top; }
    th:first-child,td:first-child { width:70px; font-variant-numeric:tabular-nums; }
    tbody tr:nth-child(even) { background:var(--stripe); }
    tbody tr:last-child td { border-bottom:0; }
    footer { color:var(--muted); font-size:12px; margin-top:20px; }
    @media(max-width:600px) { main { padding:18px 10px 40px; } article { padding:17px 12px; } h2 { font-size:21px; } h1,h2,h3 { scroll-margin-top:135px; } }
    @media(prefers-reduced-motion:reduce) { html { scroll-behavior:auto; } }
  </style>
</head>
<body>
  <main>
    <div class="toolbar"><span class="eyebrow">LEETCODE VISUALIZER · STRING</span><div class="toolbar-actions"><div class="language-switch" role="group" aria-label="Ngôn ngữ"><button type="button" id="roadmapVi" data-lang="vi" aria-pressed="true" aria-label="Tiếng Việt">VI</button><button type="button" id="roadmapEn" data-lang="en" aria-pressed="false" aria-label="English">EN</button></div>${bilingual('a', 'Tải file Markdown (.md)', ' id="markdownDownload" href="study-guides/leetcode-string-study-roadmap.md" download', 'Download Markdown (.md)')}</div></div>
    <details open>${bilingual('summary', 'Đi tới phần học', '', 'Jump to a study section')}<nav id="roadmapContents" aria-label="Mục lục lộ trình String">${headings.map(item => bilingual('a', item.title, ` href="#${item.id}"`)).join('')}</nav></details>
    <article>${chunks.join('\n')}</article>
    ${bilingual('footer', `${problemCount} bài · Nội dung từ leetcode-string-study-roadmap.md · Dùng Ctrl+F để tìm số bài hoặc tên bài.`, '', `${problemCount} problems · Based on leetcode-string-study-roadmap.md · Use Ctrl+F to find a problem by number or name.`)}
  </main>
  <script>
    (() => {
      const preferenceKey = 'leetcode-string-roadmap-lang';
      const buttons = [...document.querySelectorAll('.language-switch button')];
      function setLanguage(language) {
        const selected = language === 'en' ? 'en' : 'vi';
        document.documentElement.lang = selected;
        document.title = selected === 'en' ? 'String study roadmap — LeetCode Visualizer' : 'Lộ trình học String — LeetCode Visualizer';
        document.querySelectorAll('[data-vi][data-en]').forEach(element => { element.innerHTML = element.dataset[selected]; });
        buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === selected)));
        document.querySelector('.language-switch').setAttribute('aria-label', selected === 'en' ? 'Language' : 'Ngôn ngữ');
        document.getElementById('roadmapContents').setAttribute('aria-label', selected === 'en' ? 'String roadmap contents' : 'Mục lục lộ trình String');
        const filename = 'leetcode-string-study-roadmap' + (selected === 'en' ? '.en' : '') + '.md';
        const download = document.getElementById('markdownDownload');
        download.href = 'study-guides/' + filename;
        download.download = filename;
        try { localStorage.setItem(preferenceKey, selected); } catch (_) { /* The switch works even without storage. */ }
        const url = new URL(location.href);
        url.searchParams.set('lang', selected);
        history.replaceState(null, '', url.pathname + url.search + url.hash);
      }
      buttons.forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
      let saved = 'vi';
      try { saved = localStorage.getItem(preferenceKey) || saved; } catch (_) { /* Use the default. */ }
      setLanguage(new URLSearchParams(location.search).get('lang') || saved);
    })();
  </script>
</body>
</html>
`;
fs.mkdirSync(path.join(publicPath, 'study-guides'), { recursive: true });
fs.writeFileSync(path.join(publicPath, 'study-guides', 'leetcode-string-study-roadmap.md'), markdown);
const englishMarkdown = translateMarkdown(markdown);
fs.writeFileSync(path.join(path.dirname(sourcePath), 'leetcode-string-study-roadmap.en.md'), englishMarkdown);
fs.writeFileSync(path.join(publicPath, 'study-guides', 'leetcode-string-study-roadmap.en.md'), englishMarkdown);
fs.writeFileSync(path.join(publicPath, 'string-study-roadmap.html'), html);
console.log(`Published String roadmap: ${problemCount} problems.`);
