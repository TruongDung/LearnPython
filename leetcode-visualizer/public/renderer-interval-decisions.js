'use strict';
function ipText(vi, en) { return typeof lang !== 'undefined' && lang === 'vi' ? vi : en; }
function ipEscape(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function ipCard(label, content, cls = '') { return `<section class="ip-card ${cls}"><header>${label}</header>${content}</section>`; }
function ipKeys(host) { host.querySelectorAll?.('button').forEach(button => button.addEventListener('keydown', event => { if (event.key === ' ' || event.key === 'Enter') event.stopPropagation(); })); }
function ipStop() { if (typeof stopPlay === 'function') stopPlay(); }
function ipState(host, key, final) {
  const same = host.dataset?.ipKey === key && host.dataset?.ipFinal === String(final);
  if (host.dataset && !same) {
    host.dataset.ipKey = key; host.dataset.ipFinal = String(final); host.dataset.ipReplayCount = '0'; host.dataset.ipTrialSplit = ''; host.dataset.ipTrialSide = ''; host.dataset.ipModeState = 'replay'; host.dataset.ipConfigIndex = '0'; host.dataset.ipBranchState = 'all'; host.dataset.ipMaskState = ''; host.dataset.ipCustomerFocus = '';
  }
  return same;
}
function ipRedraw(host, render, step, selector) {
  render(step);
  (host.querySelector?.(`${selector}:not(:disabled)`) || host.querySelector?.('.ip-replay-strip .selected') || host.querySelector?.('.ip-play button:not(:disabled)'))?.focus({ preventScroll: true });
}
function ipScrollSelected(host) {
  const strip = host.querySelector?.('.ip-replay-strip'), selected = strip?.querySelector('.selected');
  if (selected) { const a = strip.getBoundingClientRect(), b = selected.getBoundingClientRect(); strip.scrollLeft += b.left - a.left - (a.width - b.width) / 2; }
}
function ipReplayControls(count, total, label) {
  return `<nav class="ip-play"><button type="button" data-ip-control="reset" data-ip-count="0" ${count === 0 ? 'disabled' : ''}>↺</button><button type="button" data-ip-control="prev" data-ip-count="${count - 1}" aria-label="${ipText('Bước trước', 'Previous step')}" ${count === 0 ? 'disabled' : ''}>←</button><span>${count} / ${total}</span><button type="button" data-ip-control="next" data-ip-count="${count + 1}" ${count >= total ? 'disabled' : ''}>${label} →</button></nav>`;
}
function ipBindReplay(host, render, step, total) {
  host.querySelectorAll?.('[data-ip-count]').forEach(button => button.addEventListener('click', () => { ipStop(); host.dataset.ipReplayCount = String(Math.max(0, Math.min(total, Number(button.dataset.ipCount)))); ipRedraw(host, render, step, button.dataset.ipControl ? `[data-ip-control="${button.dataset.ipControl}"]` : `.ip-replay-strip [data-ip-count="${button.dataset.ipCount}"]`); }));
  host.querySelectorAll?.('[data-ip-mode]').forEach(button => button.addEventListener('click', () => { ipStop(); host.dataset.ipModeState = button.dataset.ipMode; ipRedraw(host, render, step, `[data-ip-mode="${button.dataset.ipMode}"]`); }));
}

function ipCutPlan(points, choices) {
  const plan = []; let total = 0;
  function walk(left, right, depth) {
    const split = choices[left]?.[right]; if (!Number.isInteger(split) || split <= left || split >= right) return;
    const cost = points[right] - points[left]; total += cost;
    plan.push({ left, right, split, cut: points[split], cost, total, depth });
    walk(left, split, depth + 1); walk(split, right, depth + 1);
  }
  walk(0, points.length - 1, 0); return plan;
}
function ipStickSvg(v, left, right, split, applied = []) {
  const p = v.points, pitch = Math.max(60, ...p.map(n => String(n).length * 8 + 20)), width = Math.max(340, p.length * pitch), height = 145;
  const proportional = (p[1] - p[0]) / v.n * (width - 40) >= 30 && p.every((point, i) => !i || (point - p[i - 1]) / v.n * (width - 40) >= 30);
  const x = index => 20 + (proportional ? p[index] / v.n : index / (p.length - 1)) * (width - 40);
  const boundaries = [0, ...applied.map(item => item.split).sort((a, b) => a - b), p.length - 1];
  let draw = boundaries.slice(1).map((end, i) => `<rect class="ip-stick-piece" x="${x(boundaries[i]) + (i ? 4 : 0)}" y="49" width="${Math.max(1, x(end) - x(boundaries[i]) - (i ? 4 : 0) - (i < boundaries.length - 2 ? 4 : 0))}" height="29" rx="5"/>`).join('');
  if (right > left) {
    draw += `<rect class="ip-stick-active" x="${x(left)}" y="46" width="${x(right) - x(left)}" height="35" rx="6"/>`;
    if (Number.isInteger(split) && split > left && split < right) draw += `<rect class="ip-stick-left" x="${x(left) + 2}" y="49" width="${Math.max(1, x(split) - x(left) - 2)}" height="29" rx="4"/><rect class="ip-stick-right" x="${x(split)}" y="49" width="${Math.max(1, x(right) - x(split) - 2)}" height="29" rx="4"/><path class="ip-cut-line" d="M${x(split)},29 V93"/><text class="ip-scissors" x="${x(split)}" y="22" text-anchor="middle">✂</text>`;
    draw += `<path class="ip-bracket" d="M${x(left)},105 v8 H${x(right)} v-8"/><text class="ip-cost-label" x="${(x(left) + x(right)) / 2}" y="136" text-anchor="middle">${p[right]} − ${p[left]} = ${p[right] - p[left]}</text>`;
  }
  draw += p.map((point, i) => `<g data-cut1547-point="${i}" data-value="${point}"><path class="ip-tick" d="M${x(i)},79 v6"/><text class="ip-point-label" x="${x(i)}" y="100" text-anchor="middle">${point}</text></g>`).join('');
  return `<div class="ip-scroll"><svg class="ip-stick-svg" style="width:${width}px;min-width:${Math.min(width, 340)}px" viewBox="0 0 ${width} ${height}" role="img" aria-label="${ipText('Đoạn đang cắt và chi phí bằng độ dài của nó', 'The current piece and its length-based cutting cost')}">${draw}</svg></div>${proportional ? '' : `<small class="ip-center">${ipText('Trục giãn tại các điểm cắt', 'Axis spaced at cut positions')}</small>`}`;
}
function renderCutStick1547Pictures(step) {
  const v = step.cutStick1547View, host = $('treeView'); if (!v || !host) return;
  const t = ipText, final = Boolean(step.final), plan = ipCutPlan(v.points, v.choice);
  ipState(host, JSON.stringify([1547, v.points, v.interval]), final);
  const replay = final && host.dataset?.ipModeState !== 'trial', count = Math.min(plan.length, Number(host.dataset?.ipReplayCount || 0));
  const current = replay ? plan[count] : null, [left, right] = current ? [current.left, current.right] : v.interval;
  const choices = [];
  if (v.phase !== 'setup') for (let split = left + 1; split < right; split++) choices.push({ split, cut: v.points[split], left: v.dp[left][split], right: v.dp[split][right], length: v.points[right] - v.points[left], cost: v.dp[left][split] + v.dp[split][right] + v.points[right] - v.points[left] });
  const trial = host.dataset?.ipTrialSplit === '' || host.dataset?.ipTrialSplit === undefined ? v.choice[left]?.[right] : Number(host.dataset.ipTrialSplit);
  const option = choices.find(item => item.split === trial) || choices.find(item => item.split === v.choice[left]?.[right]) || null;
  const split = replay ? current?.split ?? null : option?.split ?? null;
  const paid = count ? plan[count - 1].total : 0, best = v.computed[left]?.[right] ? v.dp[left][right] : null;
  const title = final ? replay ? count === plan.length ? t('Đã cắt xong cây gậy', 'Every cut is complete') : t('Cắt tiếp để xem chi phí cộng dồn', 'Make the next cut to see the running cost') : t('Thử vị trí cắt đầu tiên', 'Try a first cut') : v.phase === 'setup' ? t('Cắt một đoạn → trả tiền theo độ dài', 'Cut a piece → pay its length') : t('Thử điểm cắt đầu tiên của đoạn này', 'Try the first cut within this piece');
  let body = final ? `<nav class="ip-tabs"><button type="button" data-ip-mode="replay" class="${replay ? 'selected' : ''}">${t('Thứ tự cắt', 'Cut order')}</button><button type="button" data-ip-mode="trial" class="${!replay ? 'selected' : ''}">${t('Thử điểm cắt', 'Compare cuts')}</button></nav>` : '';
  body += ipCard(`<b>[${v.points[left]}, ${v.points[right]}]</b><small>${t('Một nhát cắt = độ dài đoạn đang cắt', 'One cut costs the length of its current piece')}</small>`, ipStickSvg(v, replay && !current ? 0 : left, replay && !current ? 0 : right, split, replay ? plan.slice(0, count) : []));
  if (replay) {
    body += `<div class="ip-score"><span>${t('Đã trả', 'Paid so far')}</span><strong data-cut1547-paid="${paid}">${paid}</strong>${current ? `<i>＋</i><b>${current.cost}</b><small>${t('nhát tiếp theo', 'next cut')}</small>` : '<b>✓</b>'}</div>`;
    body += ipReplayControls(count, plan.length, t('Cắt tiếp', 'Cut next'));
    body += ipCard(`<b>✂ ${t('Một thứ tự tối ưu', 'One optimal order')}</b><strong class="ip-green" data-cut1547-answer="${v.answer}">${v.answer}</strong>`, `<div class="ip-replay-strip">${plan.map((item, i) => `<button type="button" data-ip-count="${i + 1}" class="${count === i + 1 ? 'selected' : ''}"><small>${i + 1}</small><b>✂ ${item.cut}</b><small>+${item.cost} → ${item.total}</small></button>`).join('') || '<i>∅</i>'}</div>`);
  } else if (option) {
    body += `<div class="ip-options">${choices.map(item => `<button type="button" data-cut1547-split="${item.split}" class="${split === item.split ? 'selected' : ''}"><b>✂ ${item.cut}</b><small>${item.cost}${item.cost === best ? ' ★' : ''}</small></button>`).join('')}</div>`;
    body += ipCard(t('Nhát đầu + cắt phần trái + cắt phần phải', 'First cut + finish the left + finish the right'), `<div class="ip-formula" data-cut1547-trial="${option.cost}"><span class="gold"><small>✂ [${v.points[left]},${v.points[right]}]</small><b>${option.length}</b></span><i>+</i><span class="blue"><small>[${v.points[left]},${option.cut}]</small><b>${option.left}</b></span><i>+</i><span class="purple"><small>[${option.cut},${v.points[right]}]</small><b>${option.right}</b></span><i>=</i><strong>${option.cost}</strong></div>`);
    body += `<div class="ip-score"><span>min</span><strong data-cut1547-best="${best}">${best}</strong><b>${option.cost === best ? '✓' : '↓'}</b></div>`;
  }
  const presets = [{ cuts: [1, 3, 4, 5], n: 7 }, { cuts: [5, 6, 1, 4, 2], n: 9 }, { cuts: [3], n: 8 }, { cuts: [1, 2, 8, 9], n: 10 }];
  host.innerHTML = `<section class="ip-viz cut1547-viz"><header class="ip-heading"><strong>${title}</strong><small>#1547 · L${step.codeLines?.[0]}</small></header>${body}<nav class="ip-examples">${presets.map((preset, i) => `<button type="button" data-cut1547-example="${i}">${t('Ví dụ', 'Example')} ${i + 1} · n=${preset.n}</button>`).join('')}</nav></section>`;
  ipKeys(host); ipBindReplay(host, renderCutStick1547Pictures, step, plan.length); ipScrollSelected(host);
  host.querySelectorAll?.('[data-cut1547-split]').forEach(button => button.addEventListener('click', () => { ipStop(); host.dataset.ipTrialSplit = button.dataset.cut1547Split; ipRedraw(host, renderCutStick1547Pictures, step, `[data-cut1547-split="${button.dataset.cut1547Split}"]`); }));
  host.querySelectorAll?.('[data-cut1547-example]').forEach(button => button.addEventListener('click', async () => { ipStop(); const preset = presets[Number(button.dataset.cut1547Example)]; $('arrInput').value = preset.cuts.join(','); $('param-n').value = preset.n; await runViz(); }));
}

const IP_SEGMENT_CACHE = new Map();
function ipSegmentConfigs(n, k) {
  const key = `${n},${k}`; if (IP_SEGMENT_CACHE.has(key)) return IP_SEGMENT_CACHE.get(key);
  const configs = [];
  function visit(start, remaining, current) {
    if (!remaining) { configs.push(current.map(segment => [...segment])); return; }
    for (let left = start; left < n - 1; left++) for (let right = left + 1; right <= n - remaining; right++) { current.push([left, right]); visit(right, remaining - 1, current); current.pop(); }
  }
  visit(0, k, []); IP_SEGMENT_CACHE.set(key, configs); return configs;
}
function ipSegmentParts(n, config) {
  const parts = []; let previous = 0;
  config.forEach(([left, right], i) => { parts.push({ kind: 'gap', label: `g${i}`, value: left - previous }); parts.push({ kind: 'segment', label: `s${i + 1}`, value: right - left }); previous = right; });
  parts.push({ kind: 'gap', label: `g${config.length}`, value: n - 1 - previous }); return parts;
}
function ipSegmentSvg(n, config, available = n, thumbnail = false) {
  const width = Math.max(170, (n - 1) * 55 + 40), x = i => 20 + i * (width - 40) / Math.max(1, n - 1), height = 90;
  let drawing = `<path class="ip-line-axis" d="M20,39 H${width - 20}"/>`;
  drawing += config.map(([left, right], i) => `<g class="ip-line-segment color${i % 5}" data-seg1621-segment="${left},${right}"><path d="M${x(left)},39 H${x(right)}"/><circle cx="${x(left)}" cy="39" r="5"/><circle cx="${x(right)}" cy="39" r="5"/></g>`).join('');
  drawing += Array.from({ length: n }, (_, i) => `<g class="ip-line-point ${i >= available ? 'future' : ''}" data-seg1621-point="${i}"><circle cx="${x(i)}" cy="39" r="3"/><text x="${x(i)}" y="69" text-anchor="middle">${i}</text></g>`).join('');
  const shared = config.slice(1).filter((segment, i) => segment[0] === config[i][1]).map(segment => segment[0]);
  drawing += shared.map(i => `<circle class="ip-shared-end" cx="${x(i)}" cy="39" r="8"/><text class="ip-shared-label" x="${x(i)}" y="17" text-anchor="middle">✓</text>`).join('');
  return `<svg class="ip-segment-svg ${thumbnail ? 'thumbnail' : ''}" style="${thumbnail ? '' : `width:${width}px;min-width:${Math.min(width, 330)}px`}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${config.map(segment => '[' + segment.join(',') + ']').join(' ') || ipText('Không có đoạn', 'No segments')}">${drawing}</svg>`;
}
function renderSegments1621Pictures(step) {
  const v = step.lineSegments1621View, host = $('treeView'); if (!v || !host) return;
  const t = ipText, final = Boolean(step.final || v.final), combination = Number(v.approach) === 2;
  ipState(host, JSON.stringify([1621, v.n, v.k, combination, v.points, v.segments, v.operation]), final);
  const n = v.n, k = combination || final ? v.k : v.segments, points = combination || final ? n : v.points;
  const all = ipSegmentConfigs(points, k), skip = all.filter(config => !config.length || config.at(-1)[1] < points - 1), end = all.filter(config => config.length && config.at(-1)[1] === points - 1);
  const branch = final && !combination ? host.dataset?.ipBranchState || 'all' : v.operation === 'read-skip' ? 'skip' : v.operation === 'read-prefix' ? 'end' : 'all';
  const configs = branch === 'skip' ? skip : branch === 'end' ? end : all;
  const selected = Math.max(0, Math.min(configs.length - 1, Number(host.dataset?.ipConfigIndex || 0))), config = configs[selected] || [];
  const start = Math.floor(selected / 6) * 6;
  const names = { init: t('Chưa vẽ đoạn nào', 'No segment yet'), 'base-ways': t('Không chọn đoạn → một cách', 'Choose no segments → one way'), 'base-prefix': t('Gom các trạng thái nhỏ hơn', 'Collect the smaller states'), 'read-skip': t('Không dùng điểm cuối', 'Leave the last point unused'), 'read-prefix': t('Đoạn cuối kết thúc tại điểm mới', 'End the final segment at the new point'), 'write-ways': t('Hai nhóm hình → cộng số cách', 'Two groups of drawings → add their counts'), 'write-prefix': t('Gom số cách cho lần tính tiếp theo', 'Accumulate counts for the next state') };
  const title = final ? t('Mỗi hình là một cách chọn đoạn', 'Each drawing is one segment set') : combination ? t('Một hình ↔ một cách xếp sao và vạch', 'One drawing ↔ one stars-and-bars arrangement') : names[v.operation] || t('Chọn các đoạn không chồng lấn', 'Choose non-overlapping segments');
  let body = ipCard(`<b>${points} ${t('điểm', 'points')} · ${k} ${t('đoạn', 'segments')}</b><small>${t('Vòng vàng: chung đầu mút ✓', 'Gold ring: shared endpoint ✓')}</small>`, configs.length ? `<div class="ip-scroll">${ipSegmentSvg(n, config, points)}</div>` : `<div class="ip-scroll">${ipSegmentSvg(n, [], points)}</div><p class="ip-no-configuration">${t('Không có cấu hình phù hợp', 'No matching configuration')}</p>`);
  if (combination && configs.length) {
    const shifted = v.phase !== 'encode', parts = ipSegmentParts(n, config);
    const values = parts.map(part => ({ ...part, label: shifted && part.kind === 'segment' ? part.label.replace('s', 't') : part.label, value: part.value - (shifted && part.kind === 'segment' ? 1 : 0) }));
    body += ipCard(shifted ? t('Mỗi đoạn đã lấy sẵn 1 cạnh', 'Reserve one edge for each segment') : t('Khoảng trống + độ dài đoạn', 'Gaps + segment lengths'), `<div class="ip-part-bins">${values.map(part => `<span class="${part.kind}"><small>${part.label}</small><div>${Array.from({ length: part.value }, () => '<i></i>').join('') || '<em>∅</em>'}</div><b>${part.value}</b></span>`).join('')}</div><div class="ip-small-equation">${values.map(part => part.value).join(' + ')} = ${shifted ? v.remaining : v.totalDistance}</div>`);
    if (v.revealed?.dividers) {
      const tokens = values.map((part, i) => `${i ? '<b class="bar">│</b>' : ''}${Array.from({ length: part.value }, () => '<b class="star">★</b>').join('')}`).join('');
      body += ipCard(`<b>${v.remaining} ★ + ${v.bars} │</b><small>${v.totalSlots} ${t('vị trí', 'slots')}</small>`, `<div class="ip-stars" data-seg1621-stars="${v.remaining}" data-seg1621-bars="${v.bars}">${tokens}</div>${v.revealed?.total_slots ? `<div class="ip-small-equation">C(${v.totalSlots}, ${v.bars})${final ? ' = ' + v.answer : ''}</div>` : ''}`);
    }
  } else if (!combination && v.phase === 'fill') {
    const readEnd = v.endHere !== null;
    body += `<div class="ip-segment-branches"><article class="${branch === 'skip' ? 'selected' : ''}"><small>${t('Bỏ điểm cuối', 'Skip the last point')}</small>${ipSegmentSvg(n, skip[0] || [], points, true)}<b>${v.skip ?? '…'}</b></article><i>+</i><article class="${branch === 'end' ? 'selected' : ''}"><small>${t('Kết thúc tại', 'End at')} ${points - 1}</small>${ipSegmentSvg(n, readEnd ? end[0] || [] : [], points, true)}<b>${readEnd ? v.endHere : '…'}</b></article><i>=</i><strong>${v.computed[points]?.[k] ? v.ways[points][k] : '…'}</strong></div>`;
    if (v.operation === 'write-prefix') body += ipCard('Σ prefix', `<div class="ip-small-equation">${v.prefix[points - 1][k]} + ${v.ways[points][k]} = <b>${v.prefix[points][k]}</b></div>`);
  }
  if (final && !combination) body += `<nav class="ip-tabs">${[['all', t('Tất cả', 'All'), all.length], ['skip', t('Bỏ điểm cuối', 'Skip last'), skip.length], ['end', t('Dùng điểm cuối', 'Use last'), end.length]].map(([name, label, amount]) => `<button type="button" data-seg1621-branch="${name}" class="${name === branch ? 'selected' : ''}">${label} · ${amount}</button>`).join('')}</nav>`;
  if (configs.length) body += ipCard(`<b>${t('Bấm một hình để xem', 'Choose a drawing')}</b><small>${selected + 1}${!combination || final ? ' / ' + configs.length : ''}</small>`, `<div class="ip-config-gallery">${configs.slice(start, start + 6).map((drawing, i) => `<button type="button" data-seg1621-config="${start + i}" class="${start + i === selected ? 'selected' : ''}">${ipSegmentSvg(n, drawing, points, true)}<small>${start + i + 1}</small></button>`).join('')}</div><nav class="ip-play"><button type="button" data-seg1621-page="${Math.max(0, start - 6)}" ${start === 0 ? 'disabled' : ''}>←</button><button type="button" data-seg1621-page="${start + 6}" ${start + 6 >= configs.length ? 'disabled' : ''}>${t('Xem thêm', 'More drawings')} →</button></nav>`);
  if (final) body += `<div class="ip-score"><span>${t('Tổng số cách', 'Total ways')}</span><strong data-seg1621-answer="${v.answer}">${v.answer}</strong></div>`;
  const presets = [{ n: 4, k: 2 }, { n: 3, k: 1 }, { n: 5, k: 4 }, { n: 7, k: 3 }];
  host.innerHTML = `<section class="ip-viz segments1621-viz"><header class="ip-heading"><strong>${title}</strong><small>#1621 · ${combination ? 'C' : 'DP'} · L${step.codeLines?.[0]}</small></header>${body}<nav class="ip-examples">${presets.map((preset, i) => `<button type="button" data-seg1621-example="${i}">n=${preset.n}, k=${preset.k}</button>`).join('')}</nav></section>`;
  ipKeys(host);
  const select = (value, selector) => { ipStop(); host.dataset.ipConfigIndex = String(value); ipRedraw(host, renderSegments1621Pictures, step, selector); };
  host.querySelectorAll?.('[data-seg1621-config]').forEach(button => button.addEventListener('click', () => select(Number(button.dataset.seg1621Config), `[data-seg1621-config="${button.dataset.seg1621Config}"]`)));
  host.querySelectorAll?.('[data-seg1621-page]').forEach(button => button.addEventListener('click', () => select(Number(button.dataset.seg1621Page), `[data-seg1621-config="${button.dataset.seg1621Page}"]`)));
  host.querySelectorAll?.('[data-seg1621-branch]').forEach(button => button.addEventListener('click', () => { ipStop(); host.dataset.ipBranchState = button.dataset.seg1621Branch; host.dataset.ipConfigIndex = '0'; ipRedraw(host, renderSegments1621Pictures, step, `[data-seg1621-branch="${button.dataset.seg1621Branch}"]`); }));
  host.querySelectorAll?.('[data-seg1621-example]').forEach(button => button.addEventListener('click', async () => { ipStop(); const preset = presets[Number(button.dataset.seg1621Example)]; $('arrInput').value = preset.n; $('param-k').value = preset.k; await runViz(); }));
}

function ipDistributionScene(step, selectedMask = null) {
  const bt = Boolean(step.distribute1655BacktrackView), v = step.distribute1655BacktrackView || step.distribute1655View;
  if (!v) return null;
  const groups = bt ? v.bucketLabels.map((value, i) => ({ value, count: v.initialCounts[i] })) : v.groups;
  let assignments;
  if (bt) assignments = v.path.map(entry => ({ customer: entry.customer, bucket: entry.bucket }));
  else {
    const edges = step.final ? (v.reachableAssignments.find(entry => entry.mask === selectedMask)?.assignments || v.assignments) : v.stateAssignments;
    assignments = (edges || []).flatMap(edge => edge.customerSlots.map(customer => ({ customer, bucket: edge.bucketIndex })));
  }
  const used = groups.map((_, i) => assignments.filter(entry => entry.bucket === i).reduce((sum, entry) => sum + v.quantity[entry.customer], 0));
  return { ...v, bt, groups, assignments, used, remaining: groups.map((group, i) => group.count - used[i]), order: v.requestOrder || v.quantity.map((_, i) => i) };
}
function renderDistribute1655Pictures(step) {
  const host = $('treeView'), raw = step.distribute1655View || step.distribute1655BacktrackView; if (!host || !raw) return;
  const t = ipText, esc = ipEscape, final = Boolean(step.final), bt = Boolean(step.distribute1655BacktrackView);
  ipState(host, JSON.stringify([1655, bt, raw.quantity, raw.groups || raw.bucketLabels, raw.initialCounts]), final);
  const popcount = mask => mask.toString(2).replace(/0/g, '').length;
  const defaultMask = !bt && final ? raw.answer ? raw.fullMask : [...raw.reachable].sort((a, b) => popcount(b) - popcount(a))[0] : null;
  const selectedMask = host.dataset?.ipMaskState === '' || host.dataset?.ipMaskState === undefined ? defaultMask : Number(host.dataset.ipMaskState);
  const v = ipDistributionScene(step, selectedMask), currentBucket = bt ? v.activeBucket : v.bucketIndex;
  const proposal = bt ? ['loop-bucket', 'consider', 'skip-seen', 'skip-short', 'seen-add', 'assign', 'recurse', 'success'].includes(v.phase) && v.idx < v.quantity.length ? [v.idx] : [] : v.addMask === null ? [] : v.quantity.flatMap((_, i) => v.addMask & 1 << i ? [i] : []);
  const needed = proposal.reduce((sum, i) => sum + v.quantity[i], 0), assignedProposal = proposal.length > 0 && proposal.every(customer => v.assignments.some(entry => entry.customer === customer && entry.bucket === currentBucket));
  const capacity = currentBucket >= 0 && currentBucket !== null ? bt ? v.remaining[currentBucket] + (assignedProposal ? needed : 0) : v.groups[currentBucket].count : null;
  const title = final ? v.answer && !bt && selectedMask !== v.fullMask ? t('Một phương án cho nhóm khách đang chọn', 'One assignment for the selected customer set') : v.answer ? t('Mỗi khách nhận đủ một loại số ✓', 'Every customer gets enough of one value ✓') : t('Không thể đáp ứng tất cả khách', 'All requests cannot be fulfilled') : v.phase === 'undo' ? t('Nhánh này thất bại → trả hàng về kho', 'This branch fails → return stock') : ['too-large', 'skip-short'].includes(v.phase) ? t('Kho không đủ → thử lựa chọn khác', 'Insufficient stock → try another choice') : v.phase === 'skip-seen' ? t('Cùng số dư → bỏ nhánh trùng', 'Same remainder → skip the duplicate branch') : ['assign', 'transition'].includes(v.phase) ? t('Cấp cùng một loại số cho khách', 'Give one equal value to each customer') : t('Thử chia kho cho các khách', 'Try distributing stock to customers');
  const customer = i => v.assignments.find(entry => entry.customer === i);
  const stock = `<div class="ip-stocks">${v.groups.map((group, bucket) => {
    const owners = v.assignments.filter(entry => entry.bucket === bucket).flatMap(entry => Array(v.quantity[entry.customer]).fill(entry.customer));
    return `<article class="ip-stock ${currentBucket === bucket ? 'active' : ''}" data-dis1655-bucket="${bucket}" data-capacity="${group.count}" data-remaining="${v.remaining[bucket]}"><header><b>${group.value}</b><span>${v.remaining[bucket]} / ${group.count}</span></header><div>${Array.from({ length: group.count }, (_, i) => `<span class="ip-stock-unit ${i < owners.length ? 'used color' + owners[i] % 5 : ''}" data-stock-unit="${bucket},${i}" data-customer="${i < owners.length ? v.order[owners[i]] : ''}">${i < owners.length ? 'C' + v.order[owners[i]] : esc(group.value)}</span>`).join('')}</div></article>`;
  }).join('')}</div>`;
  const customers = `<div class="ip-customers">${v.quantity.map((need, i) => {
    const owner = customer(i), proposed = proposal.includes(i), invalid = proposed && capacity !== null && needed > capacity;
    return `<button type="button" class="ip-customer color${i % 5} ${owner ? 'served' : ''} ${proposed ? 'proposed' : ''} ${invalid ? 'invalid' : ''}" data-dis1655-customer="${i}" data-original-customer="${v.order[i]}" data-need="${need}" data-bucket="${owner?.bucket ?? ''}"><header><svg viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="8" r="5"/><path d="M6,29 V23 a9,9 0 0 1 18,0 V29"/></svg><b>C${v.order[i]}</b><small>×${need}</small></header><div>${Array.from({ length: need }, () => `<i class="${owner ? 'filled' : ''}">${owner ? esc(v.groups[owner.bucket].value) : ''}</i>`).join('')}</div><small>${owner ? '✓ ' + v.groups[owner.bucket].value : proposed ? '?' : '○'}</small></button>`;
  }).join('')}</div>`;
  let body = ipCard(`<b>${t('Kho', 'Stock')}</b><small>${t('Ô C: đã cấp · ô số: còn lại', 'C tile: assigned · number tile: available')}</small>`, stock);
  if (capacity !== null && proposal.length) body += `<div class="ip-distribution-arrow ${needed > capacity ? 'over' : ''}"><span>${v.groups[currentBucket].value}</span><i>→</i><b>${proposal.map(i => 'C' + v.order[i]).join(' + ')}</b><strong>${assignedProposal ? `${capacity} − ${needed} = ${capacity - needed}` : `${needed} ${needed <= capacity ? '≤' : '>'} ${capacity}`}</strong><em>${needed <= capacity ? '✓' : '×'}</em></div>`;
  body += ipCard(`<b>${t('Khách', 'Customers')}</b><small>${v.assignments.length} / ${v.quantity.length} ✓</small>`, customers);
  if (bt) body += ipCard(t('Đang xét một nhánh', 'One branch at a time'), `<div class="ip-assign-path">${v.path.map(entry => `<span class="color${entry.customer % 5}">C${v.order[entry.customer]} <i>→</i> ${v.bucketLabels[entry.bucket]} ×${entry.need}</span>`).join('') || '<i>∅</i>'}</div>`);
  else body += ipCard(`<b>${t('Những nhóm khách có thể phục vụ', 'Customer sets that can be served')}</b><small>${v.reachable.length}</small>`, `<div class="ip-masks">${v.reachable.map(mask => `<${final ? 'button type="button"' : 'span'} class="ip-mask ${mask === selectedMask || !final && mask === (v.phase === 'transition' ? v.newMask : v.fromMask ?? 0) ? 'selected' : ''}" ${final ? `data-dis1655-mask="${mask}"` : ''} aria-label="${v.quantity.flatMap((_, i) => mask & 1 << i ? ['C' + v.order[i]] : []).join(', ') || '∅'}">${v.quantity.map((_, i) => `<i class="color${i % 5} ${mask & 1 << i ? 'on' : ''}">${v.order[i]}</i>`).join('')}</${final ? 'button' : 'span'}>`).join('')}</div>`);
  if (final) body += `<div class="ip-score ${v.answer ? '' : 'failure'}"><span>result</span><strong data-dis1655-answer="${v.answer}">${v.answer ? 'True ✓' : 'False ×'}</strong></div>`;
  if (v.traceTruncated) body += `<small class="ip-center">${t('Lược bớt bước lặp; kết quả và phương án cuối vẫn đầy đủ.', 'Repeated steps were omitted; the final result and assignment are complete.')}</small>`;
  const presets = [{ nums: '1,1,2,2,3,3,3', quantity: '2,3,1' }, { nums: '1,1,1,1,2,2,2', quantity: '3,2,2' }, { nums: '1,1,2,2,3,3', quantity: '3,3' }, { nums: '1,1,1,2,2,2,3,3', quantity: '2,2,2,2' }];
  const timeline = typeof steps === 'undefined' ? [] : steps, at = typeof stepIndex === 'undefined' ? -1 : stepIndex;
  const phases = bt ? [['assign', t('Cấp hàng', 'Assign')], ['undo', t('Quay lui', 'Undo')], ['done', '🏁']] : [['fit', t('Vừa kho', 'Fits')], ['too-large', t('Không đủ', 'Too large')], ['transition', '✓'], ['done', '🏁']];
  const jumps = !final ? `<nav class="ip-examples">${phases.filter(([phase]) => timeline.some((s, i) => i > at && (s.distribute1655View || s.distribute1655BacktrackView)?.phase === phase)).map(([phase, label]) => `<button type="button" data-dis1655-jump="${phase}">${label} →</button>`).join('')}</nav>` : '';
  host.innerHTML = `<section class="ip-viz distribute1655-viz"><header class="ip-heading"><strong>${title}</strong><small>#1655 · ${bt ? 'BT' : 'DP'} · L${step.codeLines?.[0]}</small></header>${body}${jumps}<nav class="ip-examples">${presets.map((_, i) => `<button type="button" data-dis1655-example="${i}">${t('Ví dụ', 'Example')} ${i + 1}</button>`).join('')}</nav></section>`;
  ipKeys(host);
  host.querySelectorAll?.('[data-dis1655-mask]').forEach(button => button.addEventListener('click', () => { ipStop(); host.dataset.ipMaskState = button.dataset.dis1655Mask; ipRedraw(host, renderDistribute1655Pictures, step, `[data-dis1655-mask="${button.dataset.dis1655Mask}"]`); }));
  host.querySelectorAll?.('[data-dis1655-customer]').forEach(button => button.addEventListener('click', () => { ipStop(); const owner = customer(Number(button.dataset.dis1655Customer)); host.querySelectorAll('[data-dis1655-bucket]').forEach(bucket => bucket.classList.toggle('inspect', owner && Number(bucket.dataset.dis1655Bucket) === owner.bucket)); }));
  host.querySelectorAll?.('[data-dis1655-jump]').forEach(button => button.addEventListener('click', () => { ipStop(); const target = timeline.findIndex((s, i) => i > at && (s.distribute1655View || s.distribute1655BacktrackView)?.phase === button.dataset.dis1655Jump); if (target >= 0) { stepIndex = target; renderStep(); } }));
  host.querySelectorAll?.('[data-dis1655-example]').forEach(button => button.addEventListener('click', async () => { ipStop(); const preset = presets[Number(button.dataset.dis1655Example)]; $('arrInput').value = preset.nums; $('param-quantity').value = preset.quantity; await runViz(); }));
}

function ipStoneOptions(v, left, right) {
  const options = [], sum = (a, b) => v.stones.slice(a, b + 1).reduce((total, n) => total + n, 0);
  for (let split = left; split < right; split++) {
    const leftSum = sum(left, split), rightSum = sum(split + 1, right), leftFuture = v.dp[left][split], rightFuture = v.dp[split + 1][right];
    const side = leftSum < rightSum ? 'left' : rightSum < leftSum ? 'right' : leftFuture >= rightFuture ? 'left' : 'right';
    options.push({ split, leftSum, rightSum, leftFuture, rightFuture, side, score: side === 'left' ? leftSum + leftFuture : rightSum + rightFuture });
  }
  return options;
}
function ipStonePlan(v) {
  const plan = []; let left = 0, right = v.stones.length - 1, total = 0;
  while (left < right) {
    const choice = v.choice[left]?.[right]; if (!choice || choice.split < left || choice.split >= right) break;
    const option = ipStoneOptions(v, left, right).find(item => item.split === choice.split), kept = choice.side;
    const gain = kept === 'left' ? option.leftSum : option.rightSum; total += gain;
    const next = kept === 'left' ? [left, choice.split] : [choice.split + 1, right];
    plan.push({ left, right, ...option, side: kept, gain, next, total }); [left, right] = next;
  }
  return plan;
}
function ipStoneRow(v, left, right, split, side) {
  return `<div class="ip-scroll"><div class="ip-stones">${v.stones.map((value, i) => {
    const inside = i >= left && i <= right, part = i <= split ? 'left' : 'right', decision = inside && split !== null ? part === side ? 'keep' : 'drop' : '';
    return `<span class="ip-stone ${inside ? 'inside' : 'past'} ${decision} ${i === split && inside && split < right ? 'split-after' : ''}" data-stone1563-index="${i}" data-value="${value}" data-in-play="${inside}" data-decision="${decision}"><small>${i}</small><span class="ip-rock"><b>${value}</b></span><em>${decision === 'keep' ? '✓' : decision === 'drop' ? '×' : '·'}</em></span>`;
  }).join('')}</div></div>`;
}
function renderStoneSplit1563Pictures(step) {
  const v = step.stoneSplit1563View, host = $('treeView'); if (!v || !host) return;
  const t = ipText, final = Boolean(step.final), plan = ipStonePlan(v);
  ipState(host, JSON.stringify([1563, v.stones, v.interval]), final);
  const replay = final && host.dataset?.ipModeState !== 'trial', count = Math.min(plan.length, Number(host.dataset?.ipReplayCount || 0));
  const current = replay ? plan[count] : null;
  const interval = replay ? current ? [current.left, current.right] : plan.length ? plan.at(-1).next : v.interval : v.interval;
  const [left, right] = interval, options = v.phase === 'setup' ? [] : ipStoneOptions(v, left, right);
  const trial = host.dataset?.ipTrialSplit ? Number(host.dataset.ipTrialSplit) : v.choice[left]?.[right]?.split;
  const option = current || options.find(item => item.split === trial) || options[0] || null;
  const tied = option && option.leftSum === option.rightSum;
  const side = tied && !replay && host.dataset?.ipTrialSide ? host.dataset.ipTrialSide : option?.side;
  const gain = option ? side === 'left' ? option.leftSum : option.rightSum : 0, future = option ? side === 'left' ? option.leftFuture : option.rightFuture : 0;
  const paid = count ? plan[count - 1].total : 0, best = v.computed[left]?.[right] ? v.dp[left][right] : null;
  const title = final && replay ? count === plan.length ? t('Còn một viên → kết thúc', 'One stone remains → finish') : t('Giữ phần nhỏ hơn, cộng tổng phần đó', 'Keep the smaller side and score its sum') : v.phase === 'setup' ? t('Chia đôi → bỏ bên có tổng lớn hơn', 'Split → discard the larger sum') : t('Thử chỗ chia và xem điểm về sau', 'Try a split and inspect its future score');
  let body = final ? `<nav class="ip-tabs"><button type="button" data-ip-mode="replay" class="${replay ? 'selected' : ''}">${t('Chơi tối ưu', 'Optimal play')}</button><button type="button" data-ip-mode="trial" class="${!replay ? 'selected' : ''}">${t('Thử chỗ chia', 'Compare splits')}</button></nav>` : '';
  body += ipCard(`<b>stones[${left}…${right}]</b><small><span class="ip-green">✓ ${t('giữ', 'keep')}</span> · <span class="ip-red">× ${t('bỏ', 'discard')}</span></small>`, ipStoneRow(v, left, right, option?.split ?? null, side));
  if (option) {
    if (!replay) body += `<div class="ip-options">${options.map(item => `<button type="button" data-stone1563-split="${item.split}" class="${item.split === option.split ? 'selected' : ''}"><small>${item.split} │ ${item.split + 1}</small><b>${item.score}${item.score === best ? ' ★' : ''}</b></button>`).join('')}</div>`;
    body += `<div class="ip-balance"><span class="${side === 'left' ? 'keep' : 'drop'}"><small>Σ ${t('trái', 'left')}</small><b>${option.leftSum}</b><em>${side === 'left' ? '✓' : '×'}</em></span><i>${option.leftSum < option.rightSum ? '<' : option.leftSum > option.rightSum ? '>' : '='}</i><span class="${side === 'right' ? 'keep' : 'drop'}"><small>Σ ${t('phải', 'right')}</small><b>${option.rightSum}</b><em>${side === 'right' ? '✓' : '×'}</em></span></div>`;
    if (tied) body += `<div class="ip-tie"><small>${t('Bằng nhau → được chọn', 'Tie → choose either side')}</small>${['left', 'right'].map(part => `<button type="button" data-stone1563-side="${part}" ${replay ? 'disabled' : ''} class="${side === part ? 'selected' : ''}">${part === 'left' ? '←' : '→'} ${part === 'left' ? option.leftSum + option.leftFuture : option.rightSum + option.rightFuture}</button>`).join('')}</div>`;
    body += ipCard(t('Điểm lượt này + điểm tối đa về sau', 'Score now + best future score'), `<div class="ip-formula" data-stone1563-gain="${gain}" data-stone1563-trial="${gain + future}"><span class="green"><small>＋ ${t('giữ lại', 'kept sum')}</small><b>${gain}</b></span><i>+</i><span class="blue"><small>${t('chơi tiếp', 'continue')}</small><b>${future}</b></span><i>=</i><strong>${gain + future}</strong></div>`);
  }
  if (replay) {
    body += `<div class="ip-score"><span>${t('Đã nhận', 'Scored so far')}</span><strong data-stone1563-paid="${paid}">${paid}</strong>${current ? `<i>＋</i><b>${gain}</b><small>${t('lượt tiếp theo', 'next turn')}</small>` : '<b>✓</b>'}</div>${ipReplayControls(count, plan.length, t('Chia tiếp', 'Split next'))}`;
    body += ipCard(`<b>🏆 ${t('Tối đa', 'Maximum')}</b><strong class="ip-green" data-stone1563-answer="${v.answer}">${v.answer}</strong>`, `<div class="ip-replay-strip">${plan.map((item, i) => `<button type="button" data-ip-count="${i + 1}" class="${count === i + 1 ? 'selected' : ''}"><small>${i + 1} · ${item.left}…${item.right}</small><b>+${item.gain}</b><small>→ ${item.total}</small></button>`).join('') || '<b>0</b>'}</div>`);
  } else if (best !== null) body += `<div class="ip-score"><span>max</span><strong data-stone1563-best="${best}">${best}</strong></div>`;
  const presets = [[6, 2, 3, 4, 5, 5], [7, 7, 7, 7], [2, 1, 1, 2], [9]];
  host.innerHTML = `<section class="ip-viz stone1563-viz"><header class="ip-heading"><strong>${title}</strong><small>#1563 · L${step.codeLines?.[0]}</small></header>${body}<nav class="ip-examples">${presets.map((_, i) => `<button type="button" data-stone1563-example="${i}">${t('Ví dụ', 'Example')} ${i + 1}</button>`).join('')}</nav></section>`;
  ipKeys(host); ipBindReplay(host, renderStoneSplit1563Pictures, step, plan.length); ipScrollSelected(host);
  host.querySelectorAll?.('[data-stone1563-split]').forEach(button => button.addEventListener('click', () => { ipStop(); host.dataset.ipTrialSplit = button.dataset.stone1563Split; host.dataset.ipTrialSide = ''; ipRedraw(host, renderStoneSplit1563Pictures, step, `[data-stone1563-split="${button.dataset.stone1563Split}"]`); }));
  host.querySelectorAll?.('[data-stone1563-side]').forEach(button => button.addEventListener('click', () => { ipStop(); host.dataset.ipTrialSide = button.dataset.stone1563Side; ipRedraw(host, renderStoneSplit1563Pictures, step, `[data-stone1563-side="${button.dataset.stone1563Side}"]`); }));
  host.querySelectorAll?.('[data-stone1563-example]').forEach(button => button.addEventListener('click', async () => { ipStop(); $('arrInput').value = presets[Number(button.dataset.stone1563Example)].join(','); await runViz(); }));
  const scroll = host.querySelector?.('.ip-stones')?.parentElement, focus = host.querySelector?.(`[data-stone1563-index="${left}"]`);
  if (scroll && focus) { const a = scroll.getBoundingClientRect(), b = focus.getBoundingClientRect(); scroll.scrollLeft += b.left - a.left - 10; }
}
