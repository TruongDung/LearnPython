'use strict';
function wsText(vi, en) { return typeof lang !== 'undefined' && lang === 'vi' ? vi : en; }
function wsEscape(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function wsDisplay(value) { return value === ' ' ? '␠' : value === '\n' ? '↵' : value === '\t' ? '⇥' : String(value ?? '—'); }
function wsCounts(items) { const map = new Map(); items.forEach(item => map.set(item, (map.get(item) || 0) + 1)); return Object.fromEntries(map); }
function wsCard(label, content, cls = '') { return `<section class="ws-card ${cls}"><header>${label}</header>${content}</section>`; }
function wsRead(step) {
  if (step?.windowStudyView) return { ...step.windowStudyView, final: Boolean(step.final || step.windowStudyView.final) };
  const v = step?.anagram438View; if (!v) return null;
  const event = v.event;
  return { id: 438, kind: 'match', items: [...v.s], pattern: [...v.p], k: v.p.length,
    count: { ...v.window }, need: { ...v.need }, left: v.left, right: Math.min(v.right, v.s.length - 1),
    answers: [...v.answers], answer: [...v.answers], line: step.codeLines?.[0], event,
    phase: ['read', 'window-index'].includes(event) ? 'visit' : event === 'window-count' ? 'add' : event === 'remove-char' ? 'remove' : event === 'move-left' ? 'shrink' : ['match', 'save'].includes(event) ? 'found' : ['done', 'short'].includes(event) ? 'result' : v.right < 0 ? 'setup' : 'check',
    pending: ['read', 'window-index'].includes(event) ? v.right : null,
    removed: event === 'remove-char' ? v.left : event === 'move-left' ? v.left - 1 : null,
    final: Boolean(step.final || v.final),
  };
}

function wsScene(original, selected) {
  const v = { ...original };
  if (!v.final) return v;
  v.pending = null; v.removed = null;
  if (v.kind === 'median' && v.history.length) Object.assign(v, v.history[Math.max(0, Math.min(selected, v.history.length - 1))]);
  if (v.kind === 'match') {
    v.left = Math.max(0, Math.min(selected, Math.max(0, v.items.length - v.k)));
    v.right = Math.min(v.items.length - 1, v.left + v.k - 1);
    v.count = wsCounts(v.items.slice(v.left, v.right + 1)); v.need = wsCounts(v.pattern);
  }
  if (v.kind === 'range' && v.history.length) Object.assign(v, { current: v.history[selected]?.range || v.bestRange, selected: v.history[selected]?.selected || v.selected });
  return v;
}

function wsStrip(v, target = null) {
  const colors = [...new Set(v.items)];
  return `<div class="ws-scroll ws-main-scroll" tabindex="0" role="region" aria-label="${wsText('Chuỗi hoặc mảng với cửa sổ hiện tại', 'Sequence and current window')}"><div class="ws-strip">${v.items.map((item, i) => {
    const inside = i >= v.left && i <= v.right && i !== v.removed && i !== v.pending;
    const change = inside && target !== null && item !== target;
    return `<span class="${v.id === 438 ? 'ana438-cell ' : ''}ws-cell color${colors.indexOf(item) % 6} ${inside ? 'inside' : ''} ${change ? 'change' : ''} ${i === v.pending ? 'pending' : ''} ${i === v.removed ? 'removed' : ''} ${i === (v.focus ?? v.right) ? 'focus' : ''}" data-ws-index="${i}" data-value="${wsEscape(item)}" data-inside="${inside}"><small>${i}</small><b>${wsEscape(wsDisplay(item))}</b><em>${i === v.pending ? '＋' : i === v.removed ? '×' : i === v.left && i === v.right ? 'L/R' : i === v.left ? 'L' : i === v.right ? 'R' : change ? '↗' : ''}</em></span>`;
  }).join('') || '<i class="ws-muted">∅</i>'}</div></div>`;
}

function wsBins(v, matching = false) {
  const keys = [...new Set([...Object.keys(v.need || {}), ...Object.keys(v.count || {})])];
  return `<div class="ws-bins">${keys.map((key, i) => {
    const have = v.count[key] || 0, need = v.need?.[key] || 0, status = matching ? have === need ? 'matched' : have > need ? 'excess' : 'missing' : have ? '' : 'empty';
    const dots = (number, required = number) => Array.from({ length: Math.min(14, Math.max(number, required)) }, (_, n) => `<i class="${n < number ? 'filled' : ''} ${n >= required ? 'extra' : ''}"></i>`).join('') + (Math.max(number, required) > 14 ? '<small>…</small>' : '');
    return `<article class="${v.id === 438 ? 'ana438-counter ' : ''}ws-bin color${i % 6} ${status}" data-ws-key="${wsEscape(key)}" data-have="${have}" data-need="${matching ? need : ''}"><b>${wsEscape(wsDisplay(key))}</b>${matching ? `<div><small>${wsText('cần', 'need')}</small><span class="ws-dots need">${dots(need)}</span><strong>${need}</strong></div>` : ''}<div><small>${matching ? wsText('có', 'have') : '×'}</small><span class="ws-dots">${dots(have, matching ? need : have)}</span><strong>${have}</strong></div>${matching ? `<em>${have === need ? '✓' : have > need ? `+${have - need}` : `−${need - have}`}</em>` : ''}</article>`;
  }).join('') || '<i class="ws-muted">∅</i>'}</div>`;
}

function wsBudget(used, limit, label) {
  const over = used > limit;
  return `<div class="ws-budget ${over ? 'over' : ''}" data-ws-used="${used}" data-ws-limit="${limit}"><span>${label}</span><div class="ws-budget-dots">${Array.from({ length: Math.min(14, Math.max(used, Math.min(limit, 6))) }, (_, i) => `<i class="${i < used ? 'filled' : ''} ${i >= limit ? 'extra' : ''}"></i>`).join('')}${Math.max(used, limit) > 14 ? '<small>…</small>' : ''}</div><b>${used} ${over ? '>' : '≤'} ${limit}</b><strong>${over ? '×' : '✓'}</strong></div>`;
}

function wsBest(v, target = null) {
  if (!v.best) return '';
  const inside = v.items.slice(v.best[0], v.best[1] + 1);
  const actualTarget = v.kind === 'binary' ? 1 : target;
  return wsCard(`<b>🏆 ${wsText('Dài nhất', 'Longest')}</b><strong class="ws-best" data-ws-answer="${v.answer}">${v.answer}</strong>`, `<div class="ws-best-strip" data-ws-best-left="${v.best[0]}" data-ws-best-right="${v.best[1]}">${inside.map(item => `<span class="${actualTarget !== null && item !== actualTarget ? 'change' : ''}">${wsEscape(wsDisplay(item))}</span>`).join('') || '<i>∅</i>'}</div>${inside.length ? `<small class="ws-center">[${v.best[0]}…${v.best[1]}]</small>` : ''}`);
}

function wsRangePicture(v) {
  const ticks = [...new Set(v.lists.flat())].sort((a, b) => a - b);
  const pitch = Math.max(64, ...ticks.map(n => String(n).length * 8 + 18)), width = Math.max(360, 90 + pitch * ticks.length), height = 64 + v.lists.length * 58;
  const x = value => 70 + ticks.indexOf(value) * pitch, [lo, hi] = v.current;
  let picture = `<rect class="ws-range-band" x="${x(lo) - 23}" y="29" width="${x(hi) - x(lo) + 46}" height="${height - 40}" rx="10"/>`;
  picture += ticks.map(value => `<text class="ws-axis-label" x="${x(value)}" y="17" text-anchor="middle">${value}</text>`).join('');
  v.lists.forEach((list, row) => {
    const y = 56 + row * 58;
    picture += `<text class="ws-row-label" x="6" y="${y + 4}">L${row}</text><path class="ws-axis" d="M50,${y} H${width - 15}"/>`;
    const byValue = new Map(); list.forEach((value, col) => { const entries = byValue.get(value) || []; entries.push(col); byValue.set(value, entries); });
    for (const [value, indices] of byValue) {
      const witness = indices.includes(v.selected[row]), inside = value >= lo && value <= hi;
      picture += `<g class="ws-range-node color${row % 6} ${inside ? 'inside' : ''} ${witness ? 'witness' : ''}" data-ws-row="${row}" data-ws-cols="${indices.join(',')}" data-value="${value}" data-selected="${witness}"><circle cx="${x(value)}" cy="${y}" r="15"/><text x="${x(value)}" y="${y + 4}" text-anchor="middle">${indices.length > 1 ? '×' + indices.length : '●'}</text><title>L${row}: ${value} · [${indices.join(',')}]</title></g>`;
    }
  });
  return `<div class="ws-scroll ws-range-scroll" tabindex="0" role="region" aria-label="${wsText('Khoảng hiện tại phủ các danh sách', 'Current range across the lists')}"><svg class="ws-range-svg" style="width:${width}px" viewBox="0 0 ${width} ${height}" role="img" aria-label="[${lo}, ${hi}]">${picture}</svg></div><small class="ws-center">${wsText('Mốc số được giãn đều · vòng đậm = ứng viên mỗi hàng', 'Value ticks are evenly spaced · ring = each row’s candidate')}</small>`;
}

function renderWindowStudyPictures(step) {
  const host = $('treeView'), original = wsRead(step); if (!host || !original) return;
  const t = wsText, esc = wsEscape;
  const key = JSON.stringify([original.id, original.items, original.pattern, original.k, original.lists]);
  const same = host.dataset?.wsKey === key && host.dataset?.wsFinal === String(original.final);
  let defaultSelection = original.kind === 'match' ? original.answers?.[0] ?? 0 : 0;
  if (original.kind === 'range') defaultSelection = Math.max(0, original.history.findIndex(entry => JSON.stringify(entry.range) === JSON.stringify(original.bestRange)));
  const maxSelection = original.kind === 'match' ? Math.max(0, original.items.length - original.k) : original.kind === 'median' ? original.history.length - 1 : original.kind === 'range' ? original.history.length - 1 : 0;
  const selected = original.final && same ? Math.max(0, Math.min(maxSelection, Number(host.dataset.wsSelected || 0))) : defaultSelection;
  const v = wsScene(original, selected);
  const preview = same && host.dataset?.wsPreviewState === '1';
  if (host.dataset) { host.dataset.wsKey = key; host.dataset.wsFinal = String(original.final); host.dataset.wsSelected = String(selected); }
  const inside = (v.items || []).slice(v.left, v.right + 1).filter((_, offset) => v.left + offset !== v.pending && v.left + offset !== v.removed);
  const count = wsCounts(inside), most = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
  let target = v.kind === 'binary' ? 1 : v.kind === 'replacement' ? most?.[0] ?? null : null;
  let title = {
    setup: t('Chuẩn bị cửa sổ', 'Prepare the window'), visit: t('Đọc ký tự mới →', 'Read the next character →'), add: t('Thêm bên phải →', 'Add on the right →'),
    check: t('Kiểm tra cửa sổ', 'Check the window'), remove: t('Bỏ ký tự khỏi bộ đếm', 'Remove from the counter'), shrink: t('Thu hẹp cạnh trái →', 'Shrink the left edge →'),
    best: t('🏆 Cửa sổ dài nhất mới', '🏆 New longest window'), keep: t('Giữ kỷ lục hiện tại', 'Keep the current record'), found: t('Khớp đủ ký tự ✓', 'Every character matches ✓'),
    emit: t('Lấy phần tử ở giữa', 'Read the middle'), pop: t('Lấy minimum, giữ maximum', 'Take the minimum, keep the maximum'), advance: t('Tiến trong hàng giữ minimum →', 'Advance the minimum’s row →'), stop: t('Một hàng đã hết → dừng', 'One row is exhausted → stop'),
    result: t('Kết quả', 'Result'),
  }[v.phase] || t('Kiểm tra cửa sổ', 'Check the window');
  let body = '';
  const trial = (max, label) => `<nav class="ws-trial"><button type="button" data-ws-shift="-1" aria-label="${t('Cửa sổ trước', 'Previous window')}" ${selected <= 0 ? 'disabled' : ''}>←</button><span>${label}</span><button type="button" data-ws-shift="1" ${selected >= max ? 'disabled' : ''}>${t('Trượt', 'Slide')} →</button></nav>`;
  if (v.kind === 'range') {
    title = v.final ? t('Chọn một khoảng để xem nó phủ các hàng', 'Choose a range to inspect its coverage') : title;
    const covers = v.lists.map(list => list.some(n => n >= v.current[0] && n <= v.current[1]));
    body = wsCard(`<b>[${v.current.join(', ')}]</b><small>${t('Độ rộng', 'Width')} ${Number((v.current[1] - v.current[0]).toPrecision(12))}</small>`, wsRangePicture(v)) +
      wsCard(t('Mỗi hàng phải có ít nhất một số', 'At least one value from each row'), `<div class="ws-candidates">${v.lists.map((list, row) => `<span class="color${row % 6}"><small>L${row}</small><b>${list[v.selected[row]]}</b><em>${covers[row] ? '✓' : '×'}</em></span>`).join('')}</div>`) +
      wsCard(`<b>🏆 ${t('Hẹp nhất', 'Narrowest')}</b><strong class="ws-best" data-ws-range-answer="${v.bestRange?.join(',') || ''}">${v.bestRange ? '[' + v.bestRange.join(', ') + ']' : '—'}</strong>`, `<div class="ws-results">${v.history.map((entry, i) => `<button type="button" data-ws-select="${i}" class="${selected === i && v.final ? 'selected' : ''} ${entry.improved ? 'record' : ''}"><b>${entry.range[0]}…${entry.range[1]}</b><small>↔ ${Number((entry.range[1] - entry.range[0]).toPrecision(12))}${entry.improved ? ' ★' : ''}</small></button>`).join('') || '<i>∅</i>'}</div>`);
  } else {
    body = wsCard(`<b>${v.id === 567 ? 's2' : v.id === 480 || v.id === 487 ? 'nums' : 's'}</b><small>${t('Khung: cửa sổ · ＋ chưa đếm · × đã bỏ', 'Frame: window · ＋ not counted yet · × removed')}</small>`, wsStrip(v, target));
    if (v.kind === 'distinct') {
      const distinct = Object.values(v.count).filter(n => n > 0).length;
      body += wsBudget(distinct, v.k, t('Số loại', 'Distinct types')) + wsCard(t('Một ô cho mỗi loại ký tự', 'One bin per character type'), wsBins(v));
      body += wsBest(v);
    } else if (v.kind === 'replacement' || v.kind === 'binary') {
      const needed = inside.filter(item => item !== target).length, actualMax = inside.length - needed;
      body += wsBudget(needed, v.k, t('Cần đổi', 'Changes needed'));
      body += wsCard(`<b>${t('Đổi thành', 'Turn into')} ${esc(wsDisplay(target))}</b><button type="button" data-ws-preview aria-pressed="${preview}">${preview ? t('Xem gốc', 'Show original') : t('Xem sau đổi', 'Show converted')}</button>`, `<div class="ws-conversion ${needed > v.k ? 'over' : ''}" data-ws-needed="${needed}">${inside.map(item => `<span class="${item !== target ? 'change' : ''}" data-original="${esc(item)}" data-converted="${esc(target)}">${preview && item !== target ? `<s>${esc(wsDisplay(item))}</s><b>${esc(wsDisplay(target))}</b>` : `<b>${esc(wsDisplay(item))}</b>${item !== target ? `<small>→ ${esc(wsDisplay(target))}</small>` : '<small>✓</small>'}`}</span>`).join('') || '<i>∅</i>'}</div><small class="ws-center">${inside.length} − ${actualMax} = ${needed}${needed > v.k ? ' > ' : ' ≤ '}${v.k}</small>`);
      if (v.kind === 'replacement' && !v.final && v.maxFreq !== actualMax) body += `<aside class="ws-history-bound"><span>${t('max_freq giữ kỷ lục', 'max_freq keeps its record')} <b>${v.maxFreq}</b></span><span>${inside.length} − ${v.maxFreq} = ${inside.length - v.maxFreq} ${inside.length - v.maxFreq > v.k ? '>' : '≤'} k</span></aside>`;
      const bestCount = wsCounts(v.items.slice(v.best[0], v.best[1] + 1));
      const bestTarget = Object.entries(bestCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      body += wsBest(v, bestTarget);
    } else if (v.kind === 'median') {
      const middle = v.middle || [], full = v.sorted.length === v.k;
      body += `<div class="ws-sort-arrow">↓ ${t('Sắp xếp', 'Sort')} ↓</div>` + wsCard(`<b>${t('Nhỏ → lớn', 'Small → large')}</b><small>${v.sorted.length} / ${v.k}</small>`, `<div class="ws-scroll"><div class="ws-sorted">${v.sorted.map((entry, i) => `<span class="ws-sort-cell ${full && middle.includes(i) ? 'middle' : ''} ${entry.index === v.focus ? 'new' : ''}" data-ws-sorted-index="${entry.index}" data-value="${entry.value}" data-middle="${full && middle.includes(i)}"><small>${i}</small><b>${entry.value}</b><em>[${entry.index}]</em></span>`).join('') || '<i>∅</i>'}</div></div>`);
      if (full && middle.length) body += `<div class="ws-median" data-ws-median="${v.median}">${middle.length === 2 ? `(${v.sorted[middle[0]].value} + ${v.sorted[middle[1]].value}) / 2` : v.sorted[middle[0]].value}<i>→</i><strong>${v.median}</strong></div>`;
      body += wsCard(`<b>result</b><small>${t('Bấm để xem cửa sổ', 'Choose a window')}</small>`, `<div class="ws-results">${v.history.map((entry, i) => `<button type="button" data-ws-select="${i}" class="${v.final && i === selected || !v.final && i === v.history.length - 1 ? 'selected' : ''}"><small>${entry.left}…${entry.right}</small><b>${entry.median}</b></button>`).join('') || '<i>∅</i>'}</div>${v.final ? trial(v.history.length - 1, `${selected + 1} / ${v.history.length}`) : ''}`);
    } else if (v.kind === 'match') {
      const pattern = `<div class="ws-pattern">${v.pattern.map(ch => `<b>${esc(wsDisplay(ch))}</b>`).join('')}</div>`;
      const equal = inside.length === v.k && [...new Set([...Object.keys(v.need), ...Object.keys(v.count)])].every(ch => (v.count[ch] || 0) === (v.need[ch] || 0));
      body = wsCard(`<b>${v.id === 567 ? 's1' : 'p'}</b><small>${t('Đổi thứ tự được, giữ đúng số lượng', 'Order may change; counts must stay equal')}</small>`, pattern) + body;
      body += wsCard(`<b>${t('có / cần', 'have / need')}</b><strong class="${equal ? 'ws-green' : 'ws-muted'}">${inside.length} / ${v.k} ${equal ? '✓' : '≠'}</strong>`, wsBins(v, true));
      const known = v.answers || [];
      body += wsCard(`<b>${v.id === 567 ? 'result' : 'ans'}</b>${v.id === 567 && v.final ? `<strong class="${v.answer ? 'ws-green' : 'ws-red'}" data-ws-answer="${v.answer}">${v.answer ? 'True ✓' : 'False ×'}</strong>` : ''}`, `<div class="ws-results">${known.map(start => `<button type="button" data-ws-select="${start}" class="${v.final && start === selected ? 'selected' : ''}"><b>${start}</b><small>${esc(v.items.slice(start, start + v.k).join(''))}</small></button>`).join('') || `<i class="ws-muted">${v.final ? t('Không có vị trí khớp', 'No matching start') : '∅'}</i>`}</div>${v.final && v.items.length >= v.k ? trial(maxSelection, `[${v.left}…${v.right}] ${equal ? '✓' : '×'}`) : ''}`);
    }
  }
  const presets = {
    340: [{ input: 'eceba', k: 2 }, { input: 'aaabbcc', k: 1 }, { input: 'abaccc', k: 2 }, { input: 'abc', k: 0 }],
    424: [{ input: 'AABABBA', k: 1 }, { input: 'ABAB', k: 2 }, { input: 'ABCDE', k: 0 }, { input: 'AAAA', k: 1 }],
    438: [{ input: 'cbaebabacd', p: 'abc' }, { input: 'abab', p: 'ab' }, { input: 'baa', p: 'aa' }, { input: 'abcdef', p: 'zz' }],
    480: [{ input: '1,3,-1,-3,5,3,6,7', k: 3 }, { input: '1,4,2,3', k: 2 }, { input: '2,2,2,2', k: 3 }, { input: '-5,-1,-3,-2', k: 2 }],
    487: [{ input: '1,0,1,1,0' }, { input: '1,1,1,1' }, { input: '0,0,0' }, { input: '1,0,1,1,0,1,1,1' }],
    567: [{ input: 'eidbaooo', s1: 'ab' }, { input: 'eidboaoo', s1: 'ab' }, { input: 'aaab', s1: 'aab' }, { input: 'ab', s1: 'abcd' }],
    632: [{ input: '4,10,15,24,26|0,9,12,20|5,18,22,30' }, { input: '1,2,3|1,2,3|1,2,3' }, { input: '-5,-1|0,3|-2,4' }],
  }[v.id] || [];
  const timeline = typeof steps !== 'undefined' ? steps : [], at = typeof stepIndex !== 'undefined' ? stepIndex : -1;
  const jumps = !v.final ? `<nav class="ws-jumps">${[['shrink', t('Co cửa sổ', 'Shrink')], ['best', '🏆'], ['result', '🏁']].filter(([phase]) => timeline.some((s, i) => i > at && wsRead(s)?.phase === phase)).map(([phase, label]) => `<button type="button" data-ws-jump="${phase}">${label} →</button>`).join('')}</nav>` : '';
  host.innerHTML = `<section class="ws-viz" data-ws-problem="${v.id}"><header class="ws-heading"><strong>${title}</strong><small>#${v.id} · L${v.line ?? '—'}</small></header>${body}${jumps}<nav class="ws-examples">${presets.map((preset, i) => `<button type="button" data-ws-example="${i}">${t('Ví dụ', 'Example')} ${i + 1}${preset.k !== undefined ? ' · k=' + preset.k : preset.p || preset.s1 ? ' · ' + esc(preset.p || preset.s1) : ''}</button>`).join('')}</nav></section>`;
  const stop = () => { if (typeof stopPlay === 'function') stopPlay(); };
  const redraw = selector => { renderWindowStudyPictures(step); (host.querySelector(`${selector}:not(:disabled)`) || host.querySelector('.ws-trial button:not(:disabled)'))?.focus({ preventScroll: true }); };
  host.querySelectorAll?.('button').forEach(button => button.addEventListener('keydown', event => { if (event.key === ' ' || event.key === 'Enter') event.stopPropagation(); }));
  const select = (index, selector) => {
    stop();
    if (v.final) { host.dataset.wsSelected = String(index); redraw(selector); }
    else {
      const targetStep = timeline.findIndex(s => { const candidate = wsRead(s); return candidate && (v.kind === 'median' ? candidate.phase === 'emit' && candidate.history.length === index + 1 : v.kind === 'range' ? candidate.history.length === index + 1 && ['best', 'keep'].includes(candidate.phase) : candidate.phase === 'found' && candidate.left === index); });
      if (targetStep >= 0) { stepIndex = targetStep; renderStep(); }
    }
  };
  host.querySelectorAll?.('[data-ws-select]').forEach(button => button.addEventListener('click', () => select(Number(button.dataset.wsSelect), `[data-ws-select="${button.dataset.wsSelect}"]`)));
  host.querySelectorAll?.('[data-ws-shift]').forEach(button => button.addEventListener('click', () => select(selected + Number(button.dataset.wsShift), `[data-ws-shift="${button.dataset.wsShift}"]`)));
  host.querySelector?.('[data-ws-preview]')?.addEventListener('click', () => { stop(); host.dataset.wsPreviewState = preview ? '0' : '1'; redraw('[data-ws-preview]'); });
  host.querySelectorAll?.('[data-ws-jump]').forEach(button => button.addEventListener('click', () => { stop(); const targetStep = timeline.findIndex((s, i) => i > at && wsRead(s)?.phase === button.dataset.wsJump); if (targetStep >= 0) { stepIndex = targetStep; renderStep(); } }));
  host.querySelectorAll?.('[data-ws-example]').forEach(button => button.addEventListener('click', async () => { stop(); const preset = presets[Number(button.dataset.wsExample)]; $('arrInput').value = preset.input; for (const param of ['k', 'p', 's1']) if (preset[param] !== undefined) $('param-' + param).value = preset[param]; await runViz(); }));
  const scroll = host.querySelector?.('.ws-main-scroll'), focus = host.querySelector?.(`[data-ws-index="${v.focus ?? v.right}"]`);
  if (scroll && focus) { const a = scroll.getBoundingClientRect(), b = focus.getBoundingClientRect(); scroll.scrollLeft += b.left + b.width / 2 - a.left - a.width / 2; }
  const results = host.querySelector?.('.ws-results'), active = results?.querySelector?.('.selected');
  if (active) { const a = results.getBoundingClientRect(), b = active.getBoundingClientRect(); results.scrollLeft += b.left - a.left - (a.width - b.width) / 2; }
  const rangeScroll = host.querySelector?.('.ws-range-scroll');
  if (rangeScroll) { const lo = [...new Set(v.lists.flat())].sort((a, b) => a - b).indexOf(v.current[0]); const svg = rangeScroll.querySelector('svg'); rangeScroll.scrollLeft = Math.max(0, lo * (svg.viewBox.baseVal.width - 90) / new Set(v.lists.flat()).size + 70 - rangeScroll.clientWidth / 3); }
}
