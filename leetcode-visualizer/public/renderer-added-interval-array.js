'use strict';
function addedPictureText(vi, en) { return lang === 'vi' ? vi : en; }
function addedPictureEscape(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function addedPictureCard(label, content) { return `<section class="ap-card"><header>${label}</header>${content}</section>`; }
function addedPictureStop() { if (typeof stopPlay === 'function') stopPlay(); }
function addedPictureKeys(host) {
  host.querySelectorAll?.('button,select').forEach(control => control.addEventListener('keydown', event => { if (control.tagName === 'SELECT' || event.key === ' ' || event.key === 'Enter') event.stopPropagation(); }));
}

function free9031Timeline(v, day) {
  const t = addedPictureText, esc = addedPictureEscape;
  const people = [...new Set(v.blocks.map(block => String(block[0])))];
  const ticks = [...new Set([0, ...v.blocks.flatMap(block => block.slice(1))])].sort((a, b) => a - b);
  const width = Math.max(540, ticks.length * 72 + 130), left = 84, finiteRight = width - 90, farRight = width - 25;
  const maximum = Math.max(1, ...ticks), gap = Math.min(...ticks.slice(1).map((value, i) => value - ticks[i]));
  const compressed = gap / maximum * (finiteRight - left) < 28;
  const x = value => value === '∞' ? farRight : compressed ? left + ticks.indexOf(value) / Math.max(1, ticks.length - 1) * (finiteRight - left) : left + value / maximum * (finiteRight - left);
  const height = 76 + (people.length + 2) * 54;
  const bar = (interval, row, cls, index = '') => {
    const a = x(interval[0]), b = x(interval[1]), y = 52 + row * 54;
    return `<g class="ap-interval ${cls}" data-range="${esc(interval.join(','))}" ${index !== '' ? `data-free-index="${index}"` : ''}><rect x="${a}" y="${y - 10}" width="${Math.max(1, b - a)}" height="20" rx="4"/><circle cx="${a}" cy="${y}" r="3"/><circle class="open-end" cx="${b}" cy="${y}" r="3"/><title>[${esc(interval[0])},${esc(interval[1])})</title></g>`;
  };
  let drawing = ticks.map(value => `<path class="ap-axis" d="M${x(value)},30 V${height - 24}"/><text class="ap-tick" x="${x(value)}" y="19" text-anchor="middle">${value}</text>`).join('');
  drawing += `<text class="ap-tick" x="${farRight}" y="19" text-anchor="middle">∞</text>`;
  people.forEach((person, row) => {
    drawing += `<text class="ap-lane-label" x="9" y="${57 + row * 54}">P${esc(person)}</text>`;
    v.blocks.filter(block => String(block[0]) === person).forEach(block => {
      const active = v.current && block[1] === v.current[0] && block[2] === v.current[1];
      drawing += bar(block.slice(1), row, `person color${row % 4} ${active ? 'active' : ''}`);
    });
  });
  drawing += `<text class="ap-lane-label" x="9" y="${57 + people.length * 54}">${t('Bận', 'Busy')}</text>`;
  v.merged.forEach(interval => drawing += bar(interval, people.length, 'busy'));
  drawing += `<text class="ap-lane-label" x="9" y="${111 + people.length * 54}">${t('Rảnh', 'Free')}</text>`;
  v.free.forEach((interval, i) => drawing += bar(interval, people.length + 1, 'free', i));
  drawing += `<path class="ap-cursor" d="M${x(day)},27 V${height - 23}"/>`;
  return `<div class="ap-timeline-scroll"><svg class="ap-timeline" style="width:${width}px" viewBox="0 0 ${width} ${height}" role="img" aria-label="${t('Lịch bận từng người, hợp lịch bận và các khoảng rảnh chung', 'Individual busy schedules, their union and common free intervals')}">${drawing}</svg></div>${compressed ? `<small>${t('Trục nén theo các mốc ngày', 'Axis compressed at day boundaries')}</small>` : ''}`;
}

function renderCommonFree9031Pictures(step) {
  const v = step.commonFree9031View, host = $('treeView'); if (!host || !v) return;
  const t = addedPictureText, esc = addedPictureEscape, card = addedPictureCard;
  const key = JSON.stringify(v.blocks), same = host.dataset?.free9031Key === key && host.dataset?.free9031Final === String(v.final);
  const defaultDay = v.final ? v.free.find(interval => interval[0] > 0)?.[0] ?? 0 : v.end;
  const day = v.final && same ? Number(host.dataset.free9031Day ?? defaultDay) : defaultDay;
  if (host.dataset) { host.dataset.free9031Key = key; host.dataset.free9031Final = String(v.final); host.dataset.free9031Day = String(day); }
  const busy = new Set(v.blocks.filter(([, start, end]) => start <= day && day < end).map(block => String(block[0])));
  const names = { sort: t('Xếp các lịch bận theo ngày', 'Sort busy blocks by start'), scan: t('Đọc lịch bận tiếp theo', 'Read the next busy block'), overlap: t('Giao nhau → gộp lịch bận', 'Overlap → merge busy time'), gap: t('Có khoảng trống → cùng rảnh', 'A gap → everyone is free'), free: t('Giữ khoảng rảnh này', 'Keep this free interval'), merge: t('Kéo dài vùng bận', 'Extend busy coverage'), tail: t('Sau lịch bận cuối → rảnh đến ∞', 'After the last block → free to ∞'), result: t('Các khoảng mọi người cùng rảnh', 'Intervals when everyone is free') };
  const intervals = `<div class="ap-ranges">${v.free.map(interval => `<span class="ap-free-chip">[${esc(interval[0])}, ${esc(interval[1])})</span>`).join('') || '<span class="ap-muted">∅</span>'}</div>`;
  const ticks = [...new Set([0, ...v.blocks.flatMap(block => block.slice(1))])].sort((a, b) => a - b);
  const status = v.final ? card(t('Bấm mốc ngày để kiểm tra', 'Choose a day boundary to inspect'), `<div class="ap-days">${ticks.map(value => `<button type="button" data-free9031-day="${value}" class="${day === value ? 'selected' : ''}">${value}</button>`).join('')}</div><div class="ap-day-status ${busy.size ? 'busy' : 'free'}" data-busy-count="${busy.size}"><b>${day}</b><span>${busy.size ? `${busy.size} ${t('người bận', 'people busy')}` : '✓ ' + t('Tất cả cùng rảnh', 'Everyone is free')}</span></div>`) : v.current ? card(t('Phần bận đã phủ tới', 'Busy coverage reaches'), `<div class="ap-math"><span>end = ${v.end}</span><i>·</i><span>[${v.current[0]}, ${v.current[1]})</span></div>`) : '';
  const examples = [
    { label: t('Ảnh mẫu', 'Photo example'), blocks: [[1, 2, 6], [1, 9, 10], [2, 2, 7]] },
    { label: t('Chạm đầu mút', 'Touching ends'), blocks: [[1, 0, 3], [2, 3, 6], [1, 8, 10]] },
    { label: t('Không lịch bận', 'No busy blocks'), blocks: [] },
  ];
  host.innerHTML = `<section class="ap-viz free9031-viz"><header class="ap-heading"><strong>${names[v.event] || t('Gộp lịch bận, lấy khoảng trống', 'Merge busy time, keep the gaps')}</strong><small>#9031 · L${v.line}</small></header>${card('<b>[start, end)</b><small>' + t('Ngày kết thúc không bị chặn', 'The end day is excluded') + '</small>', free9031Timeline(v, day))}${card(t('Rảnh chung trên [0,∞)', 'Common free time on [0,∞)'), intervals)}${status}<nav class="ap-examples">${examples.map((example, i) => `<button type="button" data-free9031-example="${i}">${example.label}</button>`).join('')}</nav></section>`;
  addedPictureKeys(host);
  host.querySelectorAll?.('[data-free9031-day]').forEach(button => button.addEventListener('click', () => {
    addedPictureStop(); host.dataset.free9031Day = button.dataset.free9031Day; renderCommonFree9031Pictures(step); host.querySelector(`[data-free9031-day="${button.dataset.free9031Day}"]`)?.focus({ preventScroll: true });
  }));
  host.querySelectorAll?.('[data-free9031-example]').forEach(button => button.addEventListener('click', async () => { addedPictureStop(); $('arrInput').value = JSON.stringify(examples[Number(button.dataset.free9031Example)].blocks); await runViz(); }));
}

function positive3364Window(nums, l, r) { return { sum: nums.slice(l, r + 1).reduce((sum, n) => sum + n, 0), values: nums.slice(l, r + 1), left: l, right: r }; }
function positive3364Graph(v, window) {
  const width = Math.max(280, v.nums.length * 60 + 16), height = 230, zero = 112, max = Math.max(1, ...v.nums.map(Math.abs));
  let picture = `<path class="ap-zero" d="M10,${zero} H${width - 10}"/>`;
  if (window) picture += `<rect class="ap-window-bg" x="${13 + window[0] * 60}" y="25" width="${(window[1] - window[0]) * 60 + 50}" height="174" rx="10"/>`;
  picture += v.nums.map((value, i) => {
    const x = 38 + i * 60, h = Math.max(3, Math.abs(value) / max * 65), inside = window && i >= window[0] && i <= window[1];
    return `<g class="ap-number ${value < 0 ? 'negative' : 'positive'} ${inside ? 'inside' : ''}" data-mp3364-index="${i}" data-value="${value}" ${v.final ? `role="button" tabindex="0" aria-label="${addedPictureText('Bắt đầu ở', 'Start at')} ${i}"` : ''}><rect x="${x - 16}" y="${value < 0 ? zero : zero - h}" width="32" height="${h}" rx="5"/><text class="ap-number-value" x="${x}" y="${value < 0 ? zero + h + 18 : zero - h - 9}" text-anchor="middle">${value}</text><text class="ap-index" x="${x}" y="218" text-anchor="middle">${i}</text></g>`;
  }).join('');
  return `<div class="ap-array-scroll"><svg class="ap-array" style="width:${width}px" viewBox="0 0 ${width} ${height}" role="group" aria-label="${addedPictureText('Số dương hướng lên, số âm hướng xuống; khung là đoạn đang xét', 'Positive values point up, negatives down; the frame marks the current window')}">${picture}</svg></div>`;
}
function renderMinPositive3364Pictures(step) {
  const v = step.minPositive3364View, host = $('treeView'); if (!v || !host) return;
  const t = addedPictureText, esc = addedPictureEscape, card = addedPictureCard;
  const key = JSON.stringify([v.nums, v.l, v.r]), same = host.dataset?.mp3364Key === key && host.dataset?.mp3364Final === String(v.final);
  const size = v.final ? same ? Number(host.dataset.mp3364TrialSize) : v.bestWindow ? v.bestWindow[1] - v.bestWindow[0] + 1 : v.l : v.size;
  const start = v.final ? same ? Math.min(v.nums.length - size, Number(host.dataset.mp3364TrialStart)) : v.bestWindow?.[0] ?? 0 : v.window?.[0];
  const window = v.final ? [start, start + size - 1] : v.window;
  const current = window ? positive3364Window(v.nums, ...window) : null, sum = v.final ? current.sum : v.total;
  if (host.dataset) { host.dataset.mp3364Key = key; host.dataset.mp3364Final = String(v.final); host.dataset.mp3364TrialSize = String(size); host.dataset.mp3364TrialStart = String(start); }
  const names = { size: t('Chọn một độ dài', 'Choose a window length'), slide: t('Bỏ trái, thêm phải', 'Remove left, add right'), nonpositive: t('Tổng ≤ 0 → không nhận', 'Sum ≤ 0 → reject'), improve: t('Dương và nhỏ hơn → giữ lại', 'Positive and smaller → keep it'), best: t('Đoạn dương tốt nhất mới', 'A new best positive window'), keep: t('Đã có tổng dương nhỏ hơn', 'A smaller positive sum is known'), result: t('Tổng dương nhỏ nhất', 'Minimum positive sum') };
  const best = v.final ? v.answer : v.best;
  const candidate = current ? card(`${window[0]} → ${window[1]} <small>${t('độ dài', 'length')} ${current.values.length}</small>`, `<div class="ap-window-sum" data-mp3364-sum="${sum}">${current.values.map((value, i) => `${i ? '<i>+</i>' : ''}<span class="${value < 0 ? 'negative' : 'positive'}">${value < 0 ? '(' + value + ')' : value}</span>`).join('')}<i>=</i><strong class="${sum > 0 ? 'positive' : 'negative'}">${sum ?? '?'}</strong><b>${sum === null ? '?' : sum > 0 ? '✓ > 0' : '× ≤ 0'}</b></div>`) : '';
  const change = v.change ? card(t('Một lần trượt', 'One slide'), `<div class="ap-math"><span>${v.change.before}</span><i>−</i><span>${v.change.out < 0 ? '(' + v.change.out + ')' : v.change.out}</span><i>+</i><span>${v.change.in < 0 ? '(' + v.change.in + ')' : v.change.in}</span><i>=</i><strong>${v.total}</strong></div>`) : '';
  const bestPicture = card(`<b>🏆 ${t('Tốt nhất', 'Best')}</b><strong class="ap-best" data-mp3364-answer="${v.final ? v.answer : v.best}">${esc(best)}</strong>`, `<div class="ap-best-values">${v.bestWindow ? v.nums.slice(v.bestWindow[0], v.bestWindow[1] + 1).map(value => `<span>${value}</span>`).join('') : `<small>${t('Chưa có đoạn tổng > 0', 'No positive-sum window yet')}</small>`}</div>`);
  const controls = v.final ? `<nav class="ap-trial"><label>${t('Độ dài', 'Length')} <select data-mp3364-size>${Array.from({ length: v.r - v.l + 1 }, (_, i) => `<option value="${v.l + i}" ${size === v.l + i ? 'selected' : ''}>${v.l + i}</option>`).join('')}</select></label><button type="button" data-mp3364-shift="-1" ${start === 0 ? 'disabled' : ''}>←</button><button type="button" data-mp3364-shift="1" ${start + size === v.nums.length ? 'disabled' : ''}>${t('Dịch', 'Slide')} →</button></nav>` : `<div class="ap-length">${v.l} ≤ ${t('độ dài', 'length')} ≤ ${v.r}</div>`;
  const examples = [
    { label: t('Ví dụ 1', 'Example 1'), nums: [3, -2, 1, 4], l: 2, r: 3 },
    { label: t('Không có', 'No solution'), nums: [-2, 2, -3, 1], l: 2, r: 3 },
    { label: t('Toàn dương', 'All positive'), nums: [1, 2, 3, 4], l: 2, r: 4 },
  ];
  host.innerHTML = `<section class="ap-viz positive3364-viz"><header class="ap-heading"><strong>${names[v.event] || t('Thử các đoạn từ l đến r', 'Try lengths l through r')}</strong><small>#3364 · L${v.line}</small></header>${controls}${card('<b>nums</b><small>' + t('Trên 0: dương · dưới 0: âm', 'Above 0: positive · below 0: negative') + '</small>', positive3364Graph(v, window))}${candidate}${change}${bestPicture}<nav class="ap-examples">${examples.map((example, i) => `<button type="button" data-mp3364-example="${i}">${example.label}</button>`).join('')}</nav></section>`;
  addedPictureKeys(host);
  const redraw = selector => { renderMinPositive3364Pictures(step); host.querySelector(selector)?.focus({ preventScroll: true }); };
  host.querySelector?.('[data-mp3364-size]')?.addEventListener('change', event => { addedPictureStop(); host.dataset.mp3364TrialSize = event.target.value; host.dataset.mp3364TrialStart = '0'; redraw('[data-mp3364-size]'); });
  host.querySelectorAll?.('[data-mp3364-shift]').forEach(button => button.addEventListener('click', () => { addedPictureStop(); host.dataset.mp3364TrialStart = String(start + Number(button.dataset.mp3364Shift)); redraw(`[data-mp3364-shift="${button.dataset.mp3364Shift}"]`); }));
  if (v.final) host.querySelectorAll?.('[data-mp3364-index]').forEach(node => {
    const select = () => { addedPictureStop(); host.dataset.mp3364TrialStart = String(Math.min(Number(node.dataset.mp3364Index), v.nums.length - size)); redraw(`[data-mp3364-index="${node.dataset.mp3364Index}"]`); };
    node.addEventListener('click', select); node.addEventListener('keydown', event => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); select(); } });
  });
  host.querySelectorAll?.('[data-mp3364-example]').forEach(button => button.addEventListener('click', async () => { addedPictureStop(); const example = examples[Number(button.dataset.mp3364Example)]; $('arrInput').value = JSON.stringify(example.nums); $('param-l').value = example.l; $('param-r').value = example.r; await runViz(); }));
  const scroll = host.querySelector?.('.ap-array-scroll');
  if (scroll && window) scroll.scrollLeft = Math.max(0, (window[0] + window[1]) / 2 * 60 + 38 - scroll.clientWidth / 2);
}

function renderCharWindow3Pictures(step) {
  const v = step.charWindow3View, host = $('treeView'); if (!v || !host) return;
  const t = addedPictureText, esc = addedPictureEscape, card = addedPictureCard;
  const inside = v.chars.slice(v.left, v.right + 1), counts = new Map();
  inside.forEach(ch => counts.set(ch, (counts.get(ch) || 0) + 1));
  const repeated = new Set([...counts].filter(([, count]) => count > 1).map(([ch]) => ch));
  const display = ch => ch === ' ' ? '␠' : ch === '\n' ? '↵' : ch === '\t' ? '⇥' : ch;
  const tiles = `<div class="ap-char-scroll"><div class="ap-chars">${v.chars.map((ch, i) => {
    const active = i >= v.left && i <= v.right, duplicate = active && repeated.has(ch);
    return `<span class="ap-char ${active ? 'in-window' : ''} ${duplicate ? 'duplicate' : ''} ${i === v.removing ? 'removed' : ''} ${i === v.focus ? 'focus' : ''}" data-char3-index="${i}" data-char="${esc(ch)}"><small>${i}</small><b>${esc(display(ch))}</b><em>${i === v.left && i === v.right ? 'L/R' : i === v.left ? 'L' : i === v.right ? 'R' : ''}</em></span>`;
  }).join('') || '<span class="ap-muted">∅</span>'}</div></div>`;
  const bestChars = v.chars.slice(v.bestWindow[0], v.bestWindow[1] + 1);
  const current = card(t('Cửa sổ hiện tại', 'Current window'), `<div class="ap-current-window ${repeated.size ? 'invalid' : ''}">${inside.map(ch => `<span class="${repeated.has(ch) ? 'duplicate' : ''}">${esc(display(ch))}</span>`).join('') || '<i>∅</i>'}<strong>${inside.length}</strong><b>${repeated.size ? '×' : '✓'}</b></div>`);
  const memory = v.approach === 1 ? Object.entries(v.lastSeen).map(([ch, index]) => `<span><b>${esc(display(ch))}</b><small>${index}</small></span>`).join('') : v.charSet.map(ch => `<span><b>${esc(display(ch))}</b></span>`).join('');
  const duplicateAction = repeated.size ? `<div class="ap-duplicate-action">${[...repeated].map(ch => `<span>${esc(display(ch))}</span><i>…</i><span>${esc(display(ch))}</span>`).join('')}<b>→ L</b></div>` : v.removing !== null ? `<div class="ap-duplicate-action"><s>${esc(display(v.chars[v.removing]))}</s><b>↷ L</b></div>` : '';
  const title = step.final ? t('Đoạn không lặp dài nhất', 'Longest duplicate-free substring') : repeated.size ? t('Trùng ký tự → dời cạnh trái', 'Duplicate → move the left edge') : v.removing !== null ? t('Bỏ ký tự bên trái', 'Remove the left character') : t('Mở rộng cửa sổ sang phải', 'Extend the window to the right');
  const presets = ['abcabcbb', 'bbbbb', 'pwwkew', 'abba'];
  host.innerHTML = `<section class="ap-viz char3-viz"><header class="ap-heading"><strong>${title}</strong><small>#3 · L${v.line}</small></header>${card(`<b>s</b><small>${t('Khung xanh: đang giữ · đỏ: trùng', 'Green frame: current · red: duplicate')}</small>`, tiles)}${current}${duplicateAction}${card(`<b>🏆 best</b><strong class="ap-best" data-char3-best="${v.best}">${v.best}</strong>`, `<div class="ap-best-values">${bestChars.map(ch => `<span>${esc(display(ch))}</span>`).join('') || '<i>∅</i>'}</div>`)}${!step.final ? card(v.approach === 1 ? 'last_seen' : 'char_set', `<div class="ap-memory">${memory || '<i>∅</i>'}</div>`) : ''}<nav class="ap-examples">${presets.map((s, i) => `<button type="button" data-char3-example="${i}">${s}</button>`).join('')}</nav></section>`;
  addedPictureKeys(host);
  host.querySelectorAll?.('[data-char3-example]').forEach(button => button.addEventListener('click', async () => { addedPictureStop(); $('arrInput').value = presets[Number(button.dataset.char3Example)]; await runViz(); }));
  const scroll = host.querySelector?.('.ap-char-scroll'), focus = host.querySelector?.(`[data-char3-index="${v.focus ?? v.right}"]`);
  if (scroll && focus) { const a = scroll.getBoundingClientRect(), b = focus.getBoundingClientRect(); scroll.scrollLeft += b.left + b.width / 2 - a.left - a.width / 2; }
}

function renderWordBlocks30Pictures(step) {
  const v = step.substringConcatView, host = $('treeView'); if (!v || !host) return;
  const t = addedPictureText, esc = addedPictureEscape, card = addedPictureCard;
  if (!Number.isInteger(v.width) || v.width < 1) { host.innerHTML = `<section class="ap-viz words30-viz"><strong>${t('Các từ phải có cùng độ dài và không rỗng', 'Use nonempty words of equal length')}</strong></section>`; return; }
  const key = JSON.stringify([v.s, v.words]), final = Boolean(v.final);
  const same = host.dataset?.words30Key === key && host.dataset?.words30Final === String(final);
  const selected = final && same ? Number(host.dataset.words30Selected || 0) : 0;
  const match = final ? v.answer[selected] : null, offset = final && match !== undefined ? match % v.width : v.offset ?? 0;
  const left = final && match !== undefined ? match : v.left, right = final && match !== undefined ? match + v.totalWidth : v.right;
  const counts = final && match !== undefined ? {} : v.window;
  if (final && match !== undefined) for (let i = match; i < right; i += v.width) { const word = v.s.slice(i, i + v.width); counts[word] = (counts[word] || 0) + 1; }
  if (host.dataset) { host.dataset.words30Key = key; host.dataset.words30Final = String(final); host.dataset.words30Selected = String(selected); }
  const chunks = [];
  if (offset) chunks.push({ start: 0, end: offset, word: v.s.slice(0, offset), partial: true });
  for (let i = offset; i < v.s.length; i += v.width) chunks.push({ start: i, end: Math.min(v.s.length, i + v.width), word: v.s.slice(i, i + v.width), partial: i + v.width > v.s.length });
  const blocks = `<div class="ap-char-scroll"><div class="ap-word-blocks">${chunks.map(chunk => {
    const active = chunk.start >= left && chunk.end <= right && !chunk.partial;
    const unknown = !Object.prototype.hasOwnProperty.call(v.need, chunk.word), removed = chunk.start === v.removedStart;
    return `<span class="ap-word ${active ? 'in-window' : ''} ${unknown && active ? 'unknown' : ''} ${chunk.start === v.activeStart ? 'focus' : ''} ${removed ? 'removed' : ''} ${chunk.partial ? 'partial' : ''}" data-word30-start="${chunk.start}" data-word="${esc(chunk.word)}"><small>${chunk.start}</small><b>${esc(chunk.word)}</b><em>${chunk.start === left ? 'L' : ''}${chunk.end === right ? ' R' : ''}</em></span>`;
  }).join('') || '<i>∅</i>'}</div></div>`;
  const need = Object.entries(v.need).map(([word, required], i) => {
    const have = counts[word] || 0;
    return `<div class="ap-word-count color${i % 4} ${have > required ? 'over' : ''}" data-word30-count="${esc(word)}" data-have="${have}" data-need="${required}"><b>${esc(word)}</b><div>${Array.from({ length: Math.min(8, Math.max(required, have)) }, (_, n) => `<i class="${n < have ? 'filled' : ''} ${n >= required ? 'extra' : ''}"></i>`).join('')}</div><strong>${have} / ${required}</strong></div>`;
  }).join('');
  const reset = ['unknown-word', 'reset-clear', 'reset-left', 'reset-continue'].includes(v.event), shrinking = Boolean(v.removedWord) || ['over-count', 'remove-word', 'shrink-left'].includes(v.event);
  const title = final ? t('Các vị trí ghép đủ bộ từ', 'Starts containing every required word') : reset ? t('Từ lạ → làm rỗng cửa sổ', 'Unknown word → reset the window') : shrinking ? t('Quá số lần → bỏ từ bên trái', 'Too many copies → remove from the left') : v.event === 'save-match' ? t('Đủ bộ từ → lưu vị trí L', 'Complete set → save L') : t('Đọc từng khối từ', 'Read one word block at a time');
  const results = `<div class="ap-matches">${v.answer.map((index, i) => `<button type="button" class="${final && i === selected ? 'selected' : ''}" data-word30-match="${i}"><b>${index}</b><small>${esc(v.s.slice(index, index + v.totalWidth))}</small></button>`).join('') || '<i>∅</i>'}</div>`;
  const presets = [
    { s: 'barfoothefoobarman', words: 'foo,bar', label: t('Ví dụ 1', 'Example 1') },
    { s: 'wordgoodgoodgoodbestword', words: 'word,good,best,good', label: t('Có từ lặp', 'Repeated word') },
    { s: 'barfoofoobarthefoobarman', words: 'bar,foo,the', label: t('Nhiều đáp án', 'Many matches') },
  ];
  host.innerHTML = `<section class="ap-viz words30-viz"><header class="ap-heading"><strong>${title}</strong><small>#30 · L${step.codeLines[0]}</small></header>${card(`<b>${t('Cần đủ', 'Required')} ${v.words.length} ${t('từ', 'words')}</b><small>${v.width} ${t('ký tự / từ', 'characters / word')}</small>`, `<div class="ap-word-needs">${need}</div>`)}${card(`<b>s</b><small>L=${left} · R=${right} · ${t('độ rộng', 'width')} ${v.totalWidth}</small>`, blocks)}${v.activeWord && !final ? `<div class="ap-word-action ${reset ? 'unknown' : ''}"><b>${esc(v.activeWord)}</b><span>${reset ? '× ↺' : v.removedWord ? '← ' + esc(v.removedWord) : '→'}</span></div>` : ''}${card(`<b>✓ result</b><strong>${v.answer.length}</strong>`, results)}<nav class="ap-examples">${presets.map((example, i) => `<button type="button" data-word30-example="${i}">${example.label}</button>`).join('')}</nav></section>`;
  addedPictureKeys(host);
  if (final) host.querySelectorAll?.('[data-word30-match]').forEach(button => button.addEventListener('click', () => { addedPictureStop(); host.dataset.words30Selected = button.dataset.word30Match; renderWordBlocks30Pictures(step); host.querySelector(`[data-word30-match="${button.dataset.word30Match}"]`)?.focus({ preventScroll: true }); }));
  host.querySelectorAll?.('[data-word30-example]').forEach(button => button.addEventListener('click', async () => { addedPictureStop(); const example = presets[Number(button.dataset.word30Example)]; $('arrInput').value = example.s; $('param-words').value = example.words; await runViz(); }));
  const scroll = host.querySelector?.('.ap-char-scroll'), focus = host.querySelector?.(`[data-word30-start="${final ? match : v.activeStart ?? left}"]`);
  if (scroll && focus) { const a = scroll.getBoundingClientRect(), b = focus.getBoundingClientRect(); scroll.scrollLeft += b.left + b.width / 2 - a.left - a.width / 2; }
}
