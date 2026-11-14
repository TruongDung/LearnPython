'use strict';

function matrix308Coverage(i, j) { return [i - (i & -i), j - (j & -j), i - 1, j - 1]; }
function matrix308Sum(matrix, rect) {
  let total = 0;
  if (!rect) return total;
  for (let r = Math.max(0, rect[0]); r <= rect[2] && r < matrix.length; r++)
    for (let c = Math.max(0, rect[1]); c <= rect[3] && c < matrix[r].length; c++) total += matrix[r][c];
  return total;
}
function matrix308Corners(matrix, rect) {
  const [r1, c1, r2, c2] = rect;
  const corners = [[r2, c2], [r1 - 1, c2], [r2, c1 - 1], [r1 - 1, c1 - 1]];
  const rectangles = corners.map(([r, c]) => r < 0 || c < 0 ? null : [0, 0, r, c]);
  const values = rectangles.map(region => matrix308Sum(matrix, region));
  return { corners, rectangles, values, sum: values[0] - values[1] - values[2] + values[3] };
}
function matrix308Mini(rows, cols, rect, tone) {
  const width = 116, height = Math.max(40, Math.min(96, rows / cols * 96)), x = 8, y = 5, w = 100, h = height - 10;
  const fill = rect ? `<rect class="m308-mini-fill ${tone}" x="${x + rect[1] / cols * w}" y="${y + rect[0] / rows * h}" width="${(rect[3] - rect[1] + 1) / cols * w}" height="${(rect[2] - rect[0] + 1) / rows * h}"/>` : '';
  const lines = Array.from({ length: rows + 1 }, (_, r) => `<path d="M${x},${y + r * h / rows} H${x + w}"/>`).join('')
    + Array.from({ length: cols + 1 }, (_, c) => `<path d="M${x + c * w / cols},${y} V${y + h}"/>`).join('');
  return `<svg class="m308-mini" viewBox="0 0 ${width} ${height}" aria-hidden="true">${fill}${lines}${rect ? '' : `<text x="58" y="${height / 2 + 5}" text-anchor="middle">∅</text>`}</svg>`;
}

function renderMatrixRegions308Pictures(step) {
  const v = step.segmentTreeView, host = $('treeView');
  if (!host || v?.variant !== 'range-sum-2d-308') return;
  const t = (vi, en) => lang === 'vi' ? vi : en;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  if (v.phase === 'error') { host.innerHTML = `<section class="m308-viz"><strong>${t('Kiểm tra ma trận và thao tác', 'Check the matrix and operations')}</strong><small>update r c value | sumRegion r1 c1 r2 c2</small></section>`; return; }
  const rows = v.matrix.length, cols = v.matrix[0].length, final = Boolean(step.final), line = step.codeLines[0];
  const key = JSON.stringify([v.matrix, v.bit, v.operationIndex, line, v.total, v.cornerValues]);
  const same = host.dataset?.m308Frame === key;
  const defaultRect = v.queryRect || [0, 0, rows - 1, cols - 1];
  const rect = final && same && host.dataset.m308Explore ? JSON.parse(host.dataset.m308Explore) : defaultRect;
  const hasQuery = Boolean(v.queryRect) || final, corners = hasQuery ? matrix308Corners(v.matrix, rect) : null;
  let activeTerm = -1;
  if (v.prefixRect && v.queryRect) activeTerm = corners.rectangles.findIndex(region => JSON.stringify(region) === JSON.stringify(v.prefixRect));
  if (activeTerm < 0 && v.phase === 'query') activeTerm = v.cornerValues.findIndex(value => value === null);
  const term = same && host.dataset.m308SelectedTerm !== undefined ? Number(host.dataset.m308SelectedTerm) : final ? -1 : activeTerm;
  const activeBit = v.activeBit.filter(([i, j]) => i > 0 && j > 0 && i <= rows && j <= cols);
  const selectedBit = same && host.dataset.m308SelectedBlock ? JSON.parse(host.dataset.m308SelectedBlock) : activeBit[0] || null;
  const coverage = selectedBit ? matrix308Coverage(...selectedBit) : null;
  const prefix = hasQuery && term >= 0 ? corners.rectangles[term] : null;
  if (host.dataset) {
    host.dataset.m308Frame = key;
    if (!same) { delete host.dataset.m308SelectedTerm; delete host.dataset.m308SelectedBlock; delete host.dataset.m308Explore; delete host.dataset.m308Anchor; }
  }
  const inRect = (r, c, region) => Boolean(region && r >= region[0] && c >= region[1] && r <= region[2] && c <= region[3]);
  const pairKey = point => point.join(',');
  const sourceActive = new Set(v.activeMatrix.map(pairKey)), touched = new Set(v.visitedBit.map(pairKey));
  const active = new Set(activeBit.map(pairKey));
  const card = (label, body, cls = '') => `<section class="m308-card ${cls}"><header>${label}</header>${body}</section>`;
  const matrix = `<div class="m308-grid-scroll"><div class="m308-grid" style="--m308-cols:${cols}">${v.matrix.map((row, r) => row.map((value, c) => {
    const cls = [sourceActive.has(`${r},${c}`) ? 'source' : '', hasQuery && inRect(r, c, rect) ? 'query' : '', prefix && inRect(r, c, prefix) ? 'prefix tone' + term : '', inRect(r, c, coverage) ? 'coverage' : ''].join(' ');
    return `<${final ? 'button type="button"' : 'span'} class="m308-cell ${cls}" data-m308-cell="${r},${c}" data-value="${value}" ${final ? `aria-label="${t('Chọn góc', 'Choose corner')} (${r},${c}), ${value}"` : ''}><small>${r},${c}</small><b>${esc(value)}</b></${final ? 'button' : 'span'}>`;
  }).join('')).join('')}</div></div>`;
  const bit = `<div class="m308-grid-scroll"><div class="m308-grid" style="--m308-cols:${cols}">${v.bit.slice(1).map((row, ri) => row.slice(1).map((value, ci) => {
    const i = ri + 1, j = ci + 1, selected = selectedBit && selectedBit[0] === i && selectedBit[1] === j;
    return `<button type="button" class="m308-cell bit ${active.has(`${i},${j}`) ? 'source' : ''} ${touched.has(`${i},${j}`) ? 'touched' : ''} ${selected ? 'selected' : ''}" data-m308-bit="${i},${j}" data-value="${value}" aria-pressed="${Boolean(selected)}" aria-label="BIT (${i},${j}), ${value}"><small>${i},${j}</small><b>${esc(value)}</b><i>${i & -i}×${j & -j}</i></button>`;
  }).join('')).join('')}</div></div>`;
  const boards = `<div class="m308-boards">${card(`<b>▦ ${t('Ma trận', 'Matrix')}</b><small>${final ? t('Chọn 2 góc', 'Choose 2 corners') : '0-based'}</small>`, matrix)}${card('<b>▧ BIT 2D</b><small>' + t('Bấm ô → xem vùng', 'Choose cell → see region') + '</small>', bit)}</div>`;
  const headings = { build: t('Gom các ô vào khối chữ nhật', 'Group cells into rectangles'), update: t('Một ô đổi → cộng δ vào các khối', 'One cell changes → add δ to its blocks'), query: t('Gom các khối, ghép bốn góc', 'Collect blocks, combine four corners'), answer: v.queryRect ? t('Giữ đúng vùng cần tính', 'Keep exactly the requested region') : t('Cập nhật xong', 'Update complete') };
  const operations = `<nav class="m308-ops"><button type="button" data-m308-jump="-1" class="${v.operationIndex < 0 ? 'selected' : ''}">▦</button>${v.operations.map((op, i) => `<button type="button" class="${i === v.operationIndex ? 'selected' : ''}" data-m308-jump="${i}"><b>${op.name === 'update' ? '↻' : 'Σ'} ${i + 1}</b>${i < v.outputs.length ? `<span>${v.outputs[i] === null ? '✓' : v.outputs[i]}</span>` : ''}</button>`).join('')}</nav>`;
  let detail = '';
  if (v.phase === 'update' || v.delta !== null && v.activeMatrix.length && !hasQuery) {
    const [r, c] = v.activeMatrix[0] || [0, 0], value = v.matrix[r][c];
    const old = v.phase === 'build' ? 0 : line < 12 ? value : value - v.delta;
    const next = v.phase === 'build' ? value : line < 12 ? value + v.delta : value;
    detail += card(`↻ (${r},${c})`, `<div class="m308-change"><span>${esc(old)}</span><i>→</i><strong>${esc(next)}</strong><b class="m308-delta">δ ${v.delta >= 0 ? '+' : ''}${v.delta}</b></div>`);
  }
  if (coverage) {
    const [i, j] = selectedBit, expected = matrix308Sum(v.matrix, coverage), stored = v.bit[i][j];
    detail += card(`<b>BIT[${i},${j}]</b><small>(${coverage[0]},${coverage[1]}) → (${coverage[2]},${coverage[3]})</small>`, `<div class="m308-block-meaning">${matrix308Mini(rows, cols, coverage, 'block-outline')}<div><strong data-m308-stored="${stored}">${esc(stored)}</strong><small>${(i & -i)} × ${(j & -j)} ${t('ô', 'cells')}</small>${stored !== expected ? `<span class="m308-pending">${t('Chờ cộng', 'Pending')} ${expected - stored >= 0 ? '+' : ''}${expected - stored}</span>` : '<span class="m308-check">✓</span>'}</div></div>`, 'block');
  }
  if (hasQuery) {
    const values = final ? corners.values : v.cornerValues;
    const labels = [t('Cộng khung lớn', 'Add large prefix'), t('Trừ dải trên', 'Subtract top strip'), t('Trừ dải trái', 'Subtract left strip'), t('Cộng lại phần giao', 'Add overlap back')];
    detail += card(t('Bốn hình → một vùng', 'Four pictures → one region'), `<div class="m308-prefixes">${corners.rectangles.map((region, index) => `<button type="button" class="m308-prefix-card tone${index} ${term === index ? 'selected' : ''}" data-m308-term="${index}" aria-pressed="${term === index}"><header><b>${['+', '−', '−', '+'][index]}</b><small>${labels[index]}</small></header>${matrix308Mini(rows, cols, region, 'tone' + index)}<strong>${values[index] === null || values[index] === undefined ? '?' : esc(values[index])}</strong></button>`).join('')}</div><div class="m308-equation">${[0, 1, 2, 3].map((i) => `${i ? `<i>${i === 3 ? '+' : '−'}</i>` : ''}<span class="tone${i}">${values[i] === null || values[i] === undefined ? '?' : esc(values[i])}</span>`).join('')}<i>=</i><button type="button" data-m308-term="-1" class="m308-result" data-m308-sum="${final ? corners.sum : v.answer ?? '?'}">${final ? esc(corners.sum) : v.answer === null ? '?' : esc(v.answer)}</button></div>`);
  }
  if (v.phase === 'query' && v.visitedBit.length) detail += card(t('Các khối đã lấy', 'Collected blocks'), `<div class="m308-collected">${v.visitedBit.map(([i, j], index) => `${index ? '<i>+</i>' : ''}<button type="button" data-m308-bit="${i},${j}"><small>${i},${j}</small><b>${v.bit[i][j]}</b></button>`).join('')}<i>=</i><strong>${v.total}</strong></div>`);
  const examples = [
    { label: t('Ví dụ 8 → 10', 'Example 8 → 10'), matrix: [[3, 0, 1, 4, 2], [5, 6, 3, 2, 1], [1, 2, 0, 1, 5], [4, 1, 0, 1, 7], [1, 0, 3, 0, 5]], operations: 'sumRegion 2 1 4 3 | update 3 2 2 | sumRegion 2 1 4 3' },
    { label: '3×3', matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]], operations: 'sumRegion 1 1 2 2 | update 1 1 10 | sumRegion 1 1 2 2' },
    { label: t('Số âm', 'Negatives'), matrix: [[2, -3], [-1, 4]], operations: 'sumRegion 0 0 1 1 | update 0 1 3 | sumRegion 0 0 1 1' },
  ];
  host.innerHTML = `<section class="m308-viz"><header class="m308-heading"><strong>${headings[v.phase] || ''}</strong><small>#308 · L${line}</small></header>${operations}${final ? `<div class="m308-hint">${host.dataset?.m308Anchor ? t('Chọn góc thứ hai', 'Choose the second corner') : t('Bấm hai ô để thử vùng mới', 'Choose two cells to try a new region')}</div>` : ''}${boards}${detail}<nav class="m308-presets">${examples.map((example, i) => `<button type="button" data-m308-example="${i}">${example.label}</button>`).join('')}</nav></section>`;
  const stop = () => { if (typeof stopPlay === 'function') stopPlay(); };
  host.querySelectorAll?.('button').forEach(button => button.addEventListener('keydown', event => { if (event.key === ' ' || event.key === 'Enter') event.stopPropagation(); }));
  const draw = selector => { renderMatrixRegions308Pictures(step); host.querySelector(selector)?.focus({ preventScroll: true }); };
  host.querySelectorAll?.('[data-m308-term]').forEach(button => button.addEventListener('click', () => {
    stop(); host.dataset.m308SelectedTerm = button.dataset.m308Term; delete host.dataset.m308SelectedBlock; draw(`[data-m308-term="${button.dataset.m308Term}"]`);
  }));
  host.querySelectorAll?.('[data-m308-bit]').forEach(button => button.addEventListener('click', () => {
    stop(); host.dataset.m308SelectedBlock = JSON.stringify(button.dataset.m308Bit.split(',').map(Number)); draw(`.m308-grid [data-m308-bit="${button.dataset.m308Bit}"]`);
  }));
  if (final) host.querySelectorAll?.('[data-m308-cell]').forEach(button => button.addEventListener('click', () => {
    stop(); const p = button.dataset.m308Cell.split(',').map(Number), anchor = host.dataset.m308Anchor ? JSON.parse(host.dataset.m308Anchor) : null;
    host.dataset.m308Explore = JSON.stringify(anchor ? [Math.min(anchor[0], p[0]), Math.min(anchor[1], p[1]), Math.max(anchor[0], p[0]), Math.max(anchor[1], p[1])] : [...p, ...p]);
    if (anchor) delete host.dataset.m308Anchor; else host.dataset.m308Anchor = JSON.stringify(p);
    host.dataset.m308SelectedTerm = '-1'; delete host.dataset.m308SelectedBlock; draw(`[data-m308-cell="${button.dataset.m308Cell}"]`);
  }));
  host.querySelectorAll?.('[data-m308-jump]').forEach(button => button.addEventListener('click', () => {
    stop(); const operation = Number(button.dataset.m308Jump), index = steps.findIndex(s => s.segmentTreeView?.operationIndex === operation);
    if (index >= 0) { stepIndex = index; renderStep(); }
  }));
  host.querySelectorAll?.('[data-m308-example]').forEach(button => button.addEventListener('click', async () => {
    stop(); const example = examples[Number(button.dataset.m308Example)]; $('arrInput').value = JSON.stringify(example.matrix); $('param-operations').value = example.operations; await runViz();
  }));
}
