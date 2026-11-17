"use strict";

function semi2911NextIndex(kind) {
  if (typeof steps === 'undefined' || typeof stepIndex === 'undefined') return -1;
  for (let i = stepIndex + 1; i < steps.length; i++) {
    const view = steps[i].semi2911View;
    if (!view) continue;
    if (kind === 'line' || kind === 'pair' && view.line === 14
      || kind === 'state' && (view.phase === 'partition' || ['enter-call', 'cache-hit', 'return-call'].includes(view.operation))
      || kind === 'result' && steps[i].final) return i;
  }
  return -1;
}

function renderSemi2911View(step) {
  const v = step.semi2911View;
  const vi = lang === 'vi', t = (a, b) => vi ? a : b;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const final = step.final;
  const host = document.getElementById('treeView');
  let selected = 0, divisor = v.focus?.d ?? 1;
  const dfs = v.approach === 2;
  const inspect = (segment, d) => {
    const chars = segment.original.split(''), groups = [];
    let cost = 0;
    for (let offset = 0; offset < d; offset++) {
      const indices = [], pairs = [];
      for (let i = segment.start + offset; i < segment.end; i += d) indices.push(i);
      for (let a = 0, b = indices.length - 1; a < b; a++, b--) {
        const left = indices[a], right = indices[b], mismatch = v.s[left] !== v.s[right];
        pairs.push({ left, right, mismatch });
        if (mismatch) { cost++; chars[right - segment.start] = v.s[left]; }
      }
      groups.push({ indices, pairs });
    }
    return { ...segment, d, groups, cost, repaired: chars.join('') };
  };
  const tiles = (text, start, focus = false) => `<div class="s2911-letters${focus ? ' focus' : ''}">${text.split('').map((ch, i) => `<span><small>${start + i}</small><b>${esc(ch)}</b></span>`).join('')}</div>`;
  const part = (segment, index, clickable) => {
    const inner = `<small>${t('Đoạn', 'Part')} ${index + 1} · [${segment.start}, ${segment.end})</small><strong>${esc(segment.original)}</strong><span>${segment.cost ? `${esc(segment.repaired)} · ${segment.cost} ${t('sửa', 'changes')}` : `✓ ${t('Giữ nguyên', 'Unchanged')}`}</span>`;
    return clickable ? `<button type="button" class="s2911-part" data-segment="${index}" aria-pressed="${index === selected}">${inner}</button>` : `<div class="s2911-part">${inner}</div>`;
  };
  function draw() {
    const base = final ? v.selected[selected] : v.focus;
    const f = base ? divisor === base.d ? base : inspect(base, divisor) : null;
    const length = f ? f.end - f.start : 0;
    const divisors = f ? Array.from({ length: length - 1 }, (_, i) => i + 1).filter(d => length % d === 0 || d === f.d) : [];
    const lanes = (f?.groups || []).map((group, row) => {
      const bad = new Map(group.pairs.filter(pair => pair.mismatch).map(pair => [pair.right, v.s[pair.left]]));
      const mismatch = new Set(group.pairs.filter(pair => pair.mismatch).flatMap(pair => [pair.left, pair.right]));
      const changes = group.pairs.filter(pair => pair.mismatch);
      const complete = group.pairs.length === Math.floor(group.indices.length / 2);
      return `<div class="s2911-lane"><div class="s2911-lane-name">${t('Nhóm', 'Group')} ${row + 1}<small>+${f.d} ${t('vị trí', 'positions')}</small></div><div class="s2911-lane-content"><div class="s2911-letters">${group.indices.map(i => `<span data-index="${i}" class="${mismatch.has(i) ? 'mismatch' : 'match'}${!final && v.activePair && [v.activePair.left,v.activePair.right].includes(i) ? ' pointer' : ''}"><small>${i}${!final && v.activePair?.left === i ? ' · a' : !final && v.activePair?.right === i ? ' · b' : ''}</small><b>${esc(v.s[i])}</b><em>${bad.has(i) ? `→ ${esc(bad.get(i))}` : '·'}</em></span>`).join('')}</div><div class="s2911-pairs">${changes.length ? changes.slice(0,8).map(pair => `<span>${esc(v.s[pair.left])}<sub>${pair.left}</sub> ≠ ${esc(v.s[pair.right])}<sub>${pair.right}</sub> <b>→ ${t('sửa', 'change')} ${pair.right}</b></span>`).join('') + (changes.length > 8 ? `<span>+${changes.length - 8} ${t('cặp lệch', 'unequal pairs')}</span>` : '') : `<span>${complete ? '✓ ' + t('Đọc xuôi = đọc ngược', 'Reads the same both ways') : t('Chưa so sánh hết', 'Comparisons pending')}</span>`}</div></div><b class="s2911-lane-cost">${changes.length} ${t('sửa', 'changes')}</b></div>`;
    }).join('');
    const intro = v.phase === 'setup';
    const phase = final ? 2 : ['partition','dp','dfs'].includes(v.phase) ? 1 : 0;
    const stages = [t('1 · Tính phí từng đoạn', '1 · Price each substring'), dfs ? '2 · DFS + cache' : t('2 · Thử chỗ cắt', '2 · Try the cuts'), t('3 · Cách chia tốt nhất', '3 · Best partition')];
    const partition = final ? `<div class="s2911-partition" aria-label="${t('Cách chia tối ưu; chọn một đoạn để xem', 'Optimal partition; choose a part to inspect')}">${v.selected.map((segment, i) => part(segment, i, true)).join('')}</div>` : v.phase === 'partition' ? v.reachable === false ? `<p class="s2911-verdict">${t(`Nguồn dp[${v.parts-1}][${v.cut}] chưa đạt (n = ${v.n}); ô đích vẫn là ${v.best}.`, `Source dp[${v.parts-1}][${v.cut}] is unreachable (n = ${v.n}); destination stays ${v.best}.`)}</p>` : `<div class="s2911-partition">${v.prefix.map((segment, i) => part(segment, i, false)).join('')}${part(v.focus, v.parts - 1, false)}</div><div class="s2911-transition"><div><small>${t('Các đoạn trước', 'Earlier parts')}</small><b>${v.previous}</b></div><span>+</span><div><small>${t('Đoạn mới', 'New part')}</small><b>${v.gain}</b></div><span>=</span><div><small>${t('Đang thử', 'Trial cost')}</small><b>${v.total}</b></div><span>→</span><div class="best"><small>${t('Ít sửa nhất hiện tại', 'Fewest so far')}</small><b>${v.best}</b></div></div><p class="s2911-verdict">${v.updated ? t('✓ Ít hơn → giữ cách cắt này.', '✓ Lower cost → keep this cut.') : t('Giữ cách cắt tốt nhất trước đó.', 'Keep the earlier best cut.')}</p>` : '';
    const candidates = v.candidates?.length > 1 ? `<details class="s2911-details"><summary>${t('So sánh các chỗ cắt đã thử', 'Compare cuts tried so far')}</summary><div class="s2911-candidates">${v.candidates.map(c => `<div class="${c.cut === v.bestCut ? 'best' : ''}"><span>${t('Cắt tại', 'Cut at')} ${c.cut}</span><span>${c.previous} + ${c.gain} = <b>${c.total}</b></span><span>${c.cut === v.bestCut ? '✓' : ''}</span></div>`).join('')}</div></details>` : '';
    const table = v.table ? `<details class="s2911-details"${['dp','partition'].includes(v.phase) ? ' open' : ''}><summary>${t('Bảng DP & công thức', 'DP table & recurrence')}</summary><p>dp[p][end] = min(dp[p−1][cut] + cost[cut][end])</p><small>${t(`—: chưa đạt (giá trị n = ${v.n})`, `—: unreachable (sentinel n = ${v.n})`)}</small><div class="s2911-table-scroll"><table><thead><tr><th>p / end</th>${v.table[0].map((_, i) => `<th>${i}</th>`).join('')}</tr></thead><tbody>${v.table.map((row, p) => `<tr><th>${p}</th>${row.map((value, end) => `<td class="${(final ? p === v.k && end === v.n : p === v.parts && end === v.end) ? 'current' : p === v.parts-1 && end === v.cut ? 'source' : ''}">${value ?? '—'}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>` : '';
    const costTable = v.costTable ? `<details class="s2911-details"><summary>${t('Bảng cost[left][right]', 'Substring cost[left][right]')}</summary><div class="s2911-table-scroll"><table><thead><tr><th>left / right</th>${v.costTable[0].map((_, i) => `<th>${i}</th>`).join('')}</tr></thead><tbody>${v.costTable.map((row, left) => `<tr><th>${left}</th>${row.map((value, right) => `<td class="${f && left === f.start && right === f.end ? 'current' : ''}">${value ?? '—'}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>` : '';
    const cache = dfs && phase > 0 ? `<section class="s2911-dfs"><header><b>DFS(start, parts)</b><small>${v.cacheSize} ${t('trạng thái đã lưu', 'cached states')} · ${v.hits} cache hit</small></header><small>${t('Ngăn xếp gọi · gốc → lời gọi hiện tại', 'Call stack · root → current call')}</small><div class="s2911-stack">${v.stack.map((frame, i) => `<div class="${i === v.stack.length-1 ? 'active' : ''}"><b>dfs(${frame.start}, ${frame.parts})</b><span>best = ${frame.best ?? '—'}${frame.end !== undefined ? ` · end = ${frame.end}` : ''}</span></div>`).join('') || `<span>${final ? t('Đã trả về', 'Returned') : t('Chưa gọi DFS', 'DFS not called yet')}</span>`}</div><small>${t(`n = ${v.n} biểu thị trạng thái không hợp lệ`, `n = ${v.n} marks an invalid state`)}</small><div class="s2911-memo">${v.memo.map(entry => `<div class="${entry.key === v.cacheKey ? v.operation === 'cache-hit' ? 'hit' : 'active' : ''}" data-cache-key="${entry.key}"><span>(${entry.key})</span><b>${entry.value}</b></div>`).join('') || `<small>${t('Cache trống', 'Cache empty')}</small>`}</div>${v.childValue !== undefined ? `<p>cost = ${v.gain ?? '—'} · ${t('Kết quả con', 'Child result')} = ${v.childValue ?? '—'} · candidate = ${v.candidate}</p>` : ''}</section>` : '';
    const debug = `<section class="s2911-debug" aria-live="polite"><header><b>L${v.line}</b><span>${esc(t(v.event.vi,v.event.en))}</span>${typeof v.condition === 'boolean' ? `<strong class="${v.condition ? 'true' : 'false'}">${v.condition ? 'True' : 'False'}</strong>` : ''}</header><code>${esc(v.source.trim())}</code>${v.comparison ? `<p>s[${v.comparison.a}] = “${esc(v.s[v.comparison.a])}” ${v.comparison.mismatch ? '≠' : '='} s[${v.comparison.b}] = “${esc(v.s[v.comparison.b])}” → changes: ${v.comparison.before} → <b>${v.comparison.after}</b></p>` : ''}</section>`;
    const jumpButtons = [['line',t('Dòng →','Line →')],['pair',t('Cặp ký tự →','Letter pair →')],['state',dfs?t('Lời gọi / cache →','Call / cache →'):'DP →'],['result',t('Kết quả ↠','Result ↠')]].map(([kind,label]) => `<button type="button" data-jump="${kind}"${semi2911NextIndex(kind) < 0 ? ' disabled' : ''}>${label}</button>`).join('');
    host.innerHTML = `<section class="s2911-viz" data-method="${dfs ? 2 : 1}" aria-label="${t('2911 · Chia chuỗi với ít lần sửa nhất', '2911 · Partition with fewest letter changes')}">
      <header class="s2911-head"><div><small>2911 · SEMI-PALINDROMES</small><h2>${t(`Đúng ${v.k} đoạn · sửa ít nhất`, `Exactly ${v.k} parts · fewest changes`)}</h2></div>${final ? `<div class="s2911-answer"><strong>${v.answer}</strong><span>${t('ký tự cần sửa', 'letter changes')}</span></div>` : ''}</header>
      <div class="s2911-stages">${stages.map((label, i) => `<span class="${i === phase ? 'active' : ''}">${label}</span>`).join('')}</div>
      ${debug}<nav class="s2911-jumps" aria-label="${t('Debug từng bước', 'Step-by-step debug')}">${jumpButtons}</nav>
      ${intro ? `<p>${t('Mỗi đoạn dài ≥ 2. Chọn d chia hết độ dài; mỗi hàng dưới đây phải đối xứng.', 'Each part has length ≥ 2. Choose d dividing its length; every row below must be a palindrome.')}</p>` : ''}
      ${partition}${cache}
      ${f ? `<section class="s2911-focus"><header><div><small>${final ? t('Chọn đoạn ở trên để xem cách sửa', 'Choose a part above to inspect its repair') : t('Đoạn đang xét', 'Current substring')}</small><h3>“${esc(f.original)}” <span>[${f.start}, ${f.end})</span></h3></div><b>${length} ${t('ký tự', 'letters')}</b></header>
      <div class="s2911-divisors"><span>${t('Bước nhảy', 'Stride')} d:</span>${divisors.map(d => `<button type="button" data-divisor="${d}" aria-pressed="${d === divisor}"${final ? '' : ' disabled'}>${d}</button>`).join('')}<small>${final ? t('Có thể đổi d để khám phá', 'Change d to explore') : t('d theo dòng code đang chạy', 'd follows the current code line')}</small></div>
      <div class="s2911-original">${tiles(f.original, f.start)}<small>${f.valid === false ? t('d không hợp lệ cho đoạn này', 'Invalid stride for this substring') : '↓ ' + t(`Tách thành ${f.d} nhóm, mỗi nhóm nhảy ${f.d} vị trí`, `Split into ${f.d} groups, stepping ${f.d} positions`)}</small></div>
      ${f.valid === false ? `<p>${t(`Độ dài ${length} không chia hết cho d = ${f.d} → bỏ qua.`, `Length ${length} is not divisible by d = ${f.d} → skip.`)}</p>` : `<div class="s2911-lanes">${lanes}</div>
      <div class="s2911-repair" aria-live="polite"><div><small>${f.complete === false ? t('Sau các cặp đã so sánh', 'After comparisons so far') : t('Sau khi sửa', 'After repair')}</small><strong>${esc(f.repaired)}</strong></div><span>${f.cost ? `${f.cost} ${t('cặp lệch', 'unequal pairs')} = ` : f.complete === false ? '' : '✓ ' }<b>${f.cost} ${t('lần sửa', 'changes')}</b></span></div>`}
      <p class="s2911-rule">${t('Mỗi cặp lệch chỉ đổi 1 ký tự. d = 1 chính là palindrome thông thường.', 'Change one letter per unequal pair. d = 1 is an ordinary palindrome.')}</p>
      ${typeof v.bestCost === 'number' ? `<p class="s2911-verdict">${t(`Tốt nhất đã thử cho đoạn này: ${v.bestCost} lần sửa, d = ${v.bestD}.`, `Best tried for this substring: ${v.bestCost} changes, d = ${v.bestD}.`)}</p>` : ''}
      </section>` : `<div class="s2911-original">${tiles(v.s,0)}<small>${t('Mỗi đoạn dài ≥ 2 · theo dõi biến trong bảng debug', 'Each part has length ≥ 2 · follow variables in the debug panel')}</small></div>`}${candidates}${table}${costTable}
      ${v.omitted ? `<small class="s2911-muted">${t('Chuỗi dài: hiển thị phần khởi tạo và kết quả đầy đủ. Dùng n ≤ 12 để debug từng dòng.', 'Long string: initialization and full result shown. Use n ≤ 12 for line-by-line debug.')}</small>` : ''}
      <nav class="s2911-examples" aria-label="${t('Ví dụ', 'Examples')}"><span>${t('Thử nhanh:', 'Try:')}</span>${[['abcac',2,'ab | cac'],['abcabc',1,'d = 3 → 0'],['abcdef',2,'2 '+t('lần sửa','changes')],['aabbaa',3,'aa | bb | aa']].map(([s,k,label],i) => `<button type="button" data-example="${i}">${esc(label)}</button>`).join('')}</nav>
    </section>`;
    host.querySelectorAll('[data-divisor]').forEach(button => button.addEventListener('click', () => { divisor = Number(button.dataset.divisor); draw(); }));
    host.querySelectorAll('[data-segment]').forEach(button => button.addEventListener('click', () => { selected = Number(button.dataset.segment); divisor = v.selected[selected].d; draw(); }));
    host.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {
      const [s,k] = [['abcac',2],['abcabc',1],['abcdef',2],['aabbaa',3]][Number(button.dataset.example)];
      document.getElementById('arrInput').value = s;
      document.getElementById('extraParams').querySelector('[data-param="k"]').value = k;
      runViz();
    }));
    host.querySelectorAll('[data-jump]').forEach(button => button.addEventListener('click', () => {
      const next = semi2911NextIndex(button.dataset.jump);
      if (next < 0) return;
      if (typeof stopPlay === 'function') stopPlay();
      stepIndex = next;
      renderStep();
    }));
  }
  draw();
}
