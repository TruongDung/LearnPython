'use strict';
function renderPrefixRegion304Pictures(step) {
  const v = step.prefix2DView, host = $('treeView'); if (!v || !host) return;
  const t = wsText, esc = wsEscape, matrix = v.matrix, rows = matrix.length, cols = matrix[0].length;
  const key = JSON.stringify([matrix, v.query]), final = Boolean(step.final), same = host.dataset?.pr304Key === key && host.dataset?.pr304Final === String(final);
  const original = v.region || v.query;
  let region = final && same && host.dataset.pr304Region ? JSON.parse(host.dataset.pr304Region) : { ...original };
  const anchor = final && same && host.dataset.pr304Anchor ? JSON.parse(host.dataset.pr304Anchor) : null;
  const sameStep = same && host.dataset?.pr304Line === String(step.codeLines[0]);
  const query = Boolean(v.region), termIndex = query && sameStep ? Number(host.dataset.pr304TermState ?? -1) : query && !final ? v.terms.length - 1 : -1;
  if (host.dataset) { host.dataset.pr304Key = key; host.dataset.pr304Final = String(final); host.dataset.pr304Line = String(step.codeLines[0]); host.dataset.pr304Region = JSON.stringify(region); host.dataset.pr304TermState = String(termIndex); if (!same) host.dataset.pr304Anchor = ''; }
  const { row1, col1, row2, col2 } = region;
  const terms = [
    { name: 'A', sign: '+', r: row2 + 1, c: col2 + 1, tone: 'add' },
    { name: 'B', sign: '−', r: row1, c: col2 + 1, tone: 'subtract' },
    { name: 'C', sign: '−', r: row2 + 1, c: col1, tone: 'subtract' },
    { name: 'D', sign: '+', r: row1, c: col1, tone: 'overlap' },
  ];
  terms.forEach(term => { term.value = v.prefix[term.r][term.c]; });
  const ready = new Set(v.ready), selectedTerm = terms[termIndex];
  const top = query ? selectedTerm ? [selectedTerm.r, selectedTerm.c] : null : v.prefixCell;
  const covered = (r, c) => top && r < top[0] && c < top[1];
  const matrixGrid = `<div class="pr304-grid-scroll"><div class="pr304-grid" style="--cols:${cols + 1}"><i></i>${matrix[0].map((_, c) => `<small>${c}</small>`).join('')}${matrix.map((row, r) => `<small>${r}</small>${row.map((value, c) => {
    const inside = query && r >= row1 && r <= row2 && c >= col1 && c <= col2;
    return `<${final ? 'button type="button"' : 'span'} class="pr304-cell ${inside ? 'region' : ''} ${covered(r, c) ? 'covered ' + (selectedTerm?.tone || 'add') : ''} ${v.matrixCell?.[0] === r && v.matrixCell?.[1] === c ? 'focus' : ''} ${anchor?.[0] === r && anchor?.[1] === c ? 'anchor' : ''}" ${final ? `data-pr304-cell="${r},${c}" aria-label="[${r},${c}] = ${value}"` : ''} data-pr304-matrix="${r},${c}" data-value="${value}" data-inside="${Boolean(inside)}">${value}</${final ? 'button' : 'span'}>`;
  }).join('')}`).join('')}</div></div>`;
  const prefixGrid = `<div class="pr304-grid-scroll"><div class="pr304-grid" style="--cols:${cols + 2}"><i></i>${v.prefix[0].map((_, c) => `<small>${c}</small>`).join('')}${v.prefix.map((row, r) => `<small>${r}</small>${row.map((value, c) => {
    const matching = query ? terms.filter(term => term.r === r && term.c === c) : [];
    const source = !query && v.terms.find(term => term.row === r && term.col === c);
    const known = r === 0 || c === 0 || ready.has(`${r},${c}`);
    return `<span class="pr304-cell ${!r || !c ? 'padding' : ''} ${matching.length ? 'corner ' + (matching.some(term => term.sign === '+') ? 'add' : 'subtract') : ''} ${source ? source.kind === 'add' ? 'add covered' : 'subtract covered' : ''} ${v.prefixCell?.[0] === r && v.prefixCell?.[1] === c ? 'focus' : ''}" data-pr304-prefix="${r},${c}" data-value="${known ? value : ''}"><b>${known ? value : '·'}</b>${matching.length ? `<small>${matching.map(term => term.sign + term.name).join(' ')}</small>` : ''}</span>`;
  }).join('')}`).join('')}</div></div>`;
  const miniature = term => `<svg viewBox="0 0 ${cols * 15 + 2} ${rows * 15 + 2}" role="img" aria-label="${term.sign}${term.name}: [0,0] → [${term.r - 1},${term.c - 1}]">${matrix.map((row, r) => row.map((_, c) => `<rect class="${r < term.r && c < term.c ? 'filled' : ''}" x="${c * 15 + 1}" y="${r * 15 + 1}" width="13" height="13" rx="2"/>`).join('')).join('')}</svg>`;
  let math;
  if (query) {
    const visibleTerms = final ? terms : terms.slice(0, v.terms.length);
    const sum = terms[0].value - terms[1].value - terms[2].value + terms[3].value;
    math = `<div class="pr304-terms">${visibleTerms.map(term => `<button type="button" class="pr304-term ${term.tone} ${terms.indexOf(term) === termIndex ? 'selected' : ''}" data-pr304-term="${terms.indexOf(term)}"><header><b>${term.sign}${term.name}</b><small>P[${term.r},${term.c}]</small></header>${miniature(term)}<strong>${term.value}</strong></button>`).join('')}</div><div class="pr304-equation" data-pr304-answer="${sum}">${visibleTerms.map((term, i) => `<span class="${term.tone}">${i ? term.sign : ''} ${term.value < 0 ? '(' + term.value + ')' : term.value}</span>`).join('')}${visibleTerms.length === 4 ? `<i>=</i><strong>${sum}</strong>` : '<i>…</i>'}</div>`;
  } else if (v.matrixCell) {
    const [r, c] = v.prefixCell, value = matrix[r - 1][c - 1];
    math = `<div class="pr304-equation"><span>${value}</span><span class="add">+ ${v.prefix[r - 1][c]}</span><span class="add">+ ${v.prefix[r][c - 1]}</span><span class="subtract">− (${v.prefix[r - 1][c - 1]})</span><i>=</i><strong>${v.prefix[r][c]}</strong></div>`;
  } else math = `<div class="pr304-padding-note">0 ＋ ${t('một hàng và một cột', 'one extra row and column')}</div>`;
  const title = final ? anchor ? t('Chọn ô thứ hai', 'Choose the second corner') : t('Bấm hai ô để thử một vùng khác', 'Choose two cells to try another rectangle') : query ? t('Cộng lớn − trên − trái + phần giao', 'Large − top − left + overlap') : v.prefixCell ? t('Mỗi ô prefix = tổng vùng từ góc trên trái', 'Each prefix cell sums a rectangle from the top left') : t('Thêm viền 0 quanh bảng prefix', 'Pad the prefix table with zeros');
  host.innerHTML = `<section class="ws-viz pr304-viz"><header class="ws-heading"><strong>${title}</strong><small>#304 · L${step.codeLines[0]}</small></header>${wsCard(`<b>matrix</b><small>${query ? `(${row1},${col1}) → (${row2},${col2})` : t('Màu = vùng được cộng', 'Color = included rectangle')}</small>`, matrixGrid)}${query ? math : ''}${wsCard(`<b>prefix P</b><small>${query ? '+A −B −C +D' : 'P[r,c] = Σ matrix[0:r, 0:c]'}</small>`, prefixGrid)}${!query ? math : ''}${final ? `<nav class="ws-examples"><button type="button" data-pr304-all>${t('Xem vùng cần tính', 'Show query rectangle')}</button><button type="button" data-pr304-reset>${t('Vùng ban đầu', 'Original rectangle')}</button></nav>` : ''}<nav class="ws-examples"><button type="button" data-pr304-jump="build">${t('Tạo prefix', 'Build prefix')} →</button><button type="button" data-pr304-jump="query">${t('Bốn góc', 'Four corners')} →</button><button type="button" data-pr304-jump="result">🏁</button></nav></section>`;
  const stop = () => { if (typeof stopPlay === 'function') stopPlay(); };
  const redraw = selector => { renderPrefixRegion304Pictures(step); host.querySelector(selector)?.focus({ preventScroll: true }); };
  host.querySelectorAll?.('button').forEach(button => button.addEventListener('keydown', event => { if (event.key === ' ' || event.key === 'Enter') event.stopPropagation(); }));
  host.querySelectorAll?.('[data-pr304-term]').forEach(button => button.addEventListener('click', () => { stop(); host.dataset.pr304TermState = button.dataset.pr304Term; redraw(`[data-pr304-term="${button.dataset.pr304Term}"]`); }));
  host.querySelectorAll?.('[data-pr304-cell]').forEach(button => button.addEventListener('click', () => {
    stop(); const cell = button.dataset.pr304Cell.split(',').map(Number);
    if (!anchor) host.dataset.pr304Anchor = JSON.stringify(cell);
    else { host.dataset.pr304Anchor = ''; host.dataset.pr304Region = JSON.stringify({ row1: Math.min(anchor[0], cell[0]), col1: Math.min(anchor[1], cell[1]), row2: Math.max(anchor[0], cell[0]), col2: Math.max(anchor[1], cell[1]) }); host.dataset.pr304TermState = '-1'; }
    redraw(`[data-pr304-cell="${button.dataset.pr304Cell}"]`);
  }));
  host.querySelector?.('[data-pr304-all]')?.addEventListener('click', () => { stop(); host.dataset.pr304TermState = '-1'; redraw('[data-pr304-all]'); });
  host.querySelector?.('[data-pr304-reset]')?.addEventListener('click', () => { stop(); host.dataset.pr304Region = JSON.stringify(original); host.dataset.pr304Anchor = ''; host.dataset.pr304TermState = '-1'; redraw('[data-pr304-reset]'); });
  host.querySelectorAll?.('[data-pr304-jump]').forEach(button => button.addEventListener('click', () => { stop(); if (typeof steps === 'undefined') return; const target = steps.findIndex(s => button.dataset.pr304Jump === 'result' ? s.final : button.dataset.pr304Jump === 'build' ? s.prefix2DView?.matrixCell : s.prefix2DView?.region); if (target >= 0) { stepIndex = target; renderStep(); } }));
}
