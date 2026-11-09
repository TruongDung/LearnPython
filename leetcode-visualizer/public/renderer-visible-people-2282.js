'use strict';
const VP2282_CASES = [
  ['3,1,4;2,5,1;6,2,3', 'Hàng + cột', 'Rows + columns'],
  ['10,6,8,5,11,9', 'Một hàng · nhiều người thấp', 'One row · shorter people'],
  ['5,3,3', 'Bằng nhau che phía sau', 'Equal heights block the far one'],
  ['3,3;3,3', 'Lưới bằng nhau', 'Equal-height grid'],
  ['1;2;3;4', 'Một cột', 'One column'],
  ['7', 'Một người', 'One person'],
];
function vp2282Esc(x) { return String(x ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
function vp2282Same(a, b) { return Boolean(a && b && a[0] === b[0] && a[1] === b[1]); }
function vp2282Name(cell) { return cell ? `(${cell[0]},${cell[1]})` : '—'; }
function vp2282Card(title, body, hint = '') { return `<section class="tr-card"><header><b>${title}</b><small>${hint}</small></header>${body}</section>`; }
function vp2282Scroll(name, body, cls = '') { return `<div class="vp2282-scroll ${cls}" data-vp2282-scroll="${name}" tabindex="0">${body}</div>`; }
function vp2282Stat(label, value) { return `<span class="vp2282-stat"><code>${label}</code><b>${value ?? '—'}</b></span>`; }
function vp2282Seen(v) { return v.ledger.filter(e => e.phase === v.phase && vp2282Same(e.cell, v.current)); }

function vp2282Grid(v, vi) {
  const rows = v.grid.length, cols = v.grid[0].length, size = 76;
  const w = cols * size + 54, h = rows * size + 54, px = c => 42 + c * size, py = r => 35 + r * size;
  const seen = vp2282Seen(v);
  const labels = v.grid[0].map((_, c) => `<text class="vp2282-small" x="${px(c)+29}" y="18">c=${c}</text>`).join('') +
    v.grid.map((_, r) => `<text class="vp2282-small" x="18" y="${py(r)+33}">${r}</text>`).join('');
  const cells = v.grid.map((row, r) => row.map((height, c) => {
    const cell = [r, c], current = vp2282Same(v.current, cell), visible = seen.some(e => vp2282Same(e.target, cell));
    const target = vp2282Same(v.focus?.target, cell), activeLine = v.phase === 'row' ? r === v.lineIndex : v.phase === 'col' && c === v.lineIndex;
    const value = v.answer?.[r]?.[c] ?? null;
    return `<g class="vp2282-cell ${activeLine?'is-line':''} ${visible?'is-seen':''} ${target?'is-target':''} ${current?'is-current':''}" data-vp2282-cell="${r},${c}" data-cell-r="${r}" data-cell-c="${c}" data-height="${height}" data-count="${value??''}" role="button" tabindex="0" aria-label="${vp2282Name(cell)}, height ${height}, count ${value??'pending'}"><rect x="${px(c)}" y="${py(r)}" width="60" height="62" rx="10"/><text class="vp2282-height" x="${px(c)+30}" y="${py(r)+27}">${height}</text><text class="vp2282-small" x="${px(c)+30}" y="${py(r)+48}">→${value===null?'·':v.right[r][c]} ↓${value===null?'·':v.down[r][c]}</text></g>`;
  }).join('')).join('');
  return vp2282Card('heights · → + ↓', vp2282Scroll('grid', `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="width:100%;min-width:${Math.min(w,310)}px;max-width:${w}px;height:auto" role="group">${labels}${cells}</svg>`, 'vp2282-canvas'), vi ? 'Chọn ô → bước xét người đó' : 'Select a cell → its scan step');
}

function vp2282Skyline(v, vi) {
  if (!v.cells.length) return '';
  const cells = v.cells, max = Math.max(...cells.map(([r,c])=>v.grid[r][c])), w = Math.max(320, cells.length * 80 + 40);
  const px = i => 55 + i * 80, py = h => 210 - h / max * 128;
  const index = cell => cells.findIndex(c => vp2282Same(c, cell)), ci = index(v.current), fi = index(v.focus?.target);
  const seen = vp2282Seen(v), complete = v.settled.some(e => e.phase === v.phase && vp2282Same(e.cell, v.current));
  const threshold = ci >= 0 && fi >= 0 ? Math.min(v.grid[v.current[0]][v.current[1]], v.grid[v.focus.target[0]][v.focus.target[1]]) : null;
  const sight = threshold === null ? '' : `<path class="vp2282-sight ${v.focus.kind==='count'?'is-counted':''}" data-sight-from="${v.current}" data-sight-to="${v.focus.target}" data-sight-height="${threshold}" d="M${px(ci)},${py(threshold)}H${px(fi)}"/>`;
  const people = cells.map(([r,c],i) => {
    const cell = [r,c], height = v.grid[r][c], visible = seen.some(e => vp2282Same(e.target,cell));
    const blocked = complete && i > ci && ci >= 0 && !visible;
    return `<g class="vp2282-person ${i===ci?'is-current':''} ${visible?'is-seen':''} ${i===fi?'is-target':''} ${blocked?'is-blocked':''}" data-vp2282-cell="${r},${c}" data-person-cell="${r},${c}" data-person-height="${height}" role="button" tabindex="0" aria-label="${vp2282Name(cell)}, height ${height}"><circle cx="${px(i)}" cy="${py(height)}" r="7"/><rect x="${px(i)-11}" y="${py(height)+10}" width="22" height="${Math.max(2,200-py(height))}" rx="5"/><text x="${px(i)}" y="${py(height)-15}">${height}</text><text class="vp2282-small" x="${px(i)}" y="247">${vp2282Name(cell)}</text>${blocked?`<text class="vp2282-cross" x="${px(i)+17}" y="${py(height)+5}">×</text>`:''}</g>`;
  }).join('');
  const title = v.phase === 'row' ? `${vi?'Hàng':'Row'} ${v.lineIndex} · ← ${vi?'quét':'scan'} / ${vi?'nhìn':'look'} →` : `${vi?'Cột':'Column'} ${v.lineIndex} · ↑ ${vi?'quét':'scan'} / ${vi?'nhìn':'look'} ↓`;
  return vp2282Card(title, vp2282Scroll('skyline', `<svg width="${w}" height="270" viewBox="0 0 ${w} 270" style="width:100%;min-width:320px;max-width:${w}px;height:auto" role="group"><path class="vp2282-axis" d="M20,224H${w-10}"/>${sight}${people}</svg>`, 'vp2282-canvas') +
    `<div class="vp2282-legend"><span class="is-purple">● ${vi?'đang xét':'current'}</span><span class="is-green">● ${vi?'đã đếm':'counted'}</span><span class="is-amber">● ${vi?'đối chiếu':'target'}</span><span>× ${vi?'bị che':'blocked'}</span></div>`, v.phase === 'col' ? vi?'Cột được trải ngang, từ trên xuống':'Column laid out left to right, from top to bottom' : '');
}

function vp2282Stack(v, vi) {
  const stack = v.stack;
  return vp2282Card('STACK · TOP ↑', vp2282Scroll('stack', stack ? [...stack].reverse().map((cell,i) => `<button type="button" class="vp2282-stack-node ${i===0?'is-top':''}" data-vp2282-cell="${cell}" data-stack-cell="${cell}"><small>${vp2282Name(cell)}</small><b>${v.grid[cell[0]][cell[1]]}</b>${i===0?'<code>TOP</code>':''}</button>`).join('') || '<span class="vp2282-empty">∅</span>' : '<span class="vp2282-empty">—</span>', 'vp2282-stack') +
    `<span hidden data-native-stack="${vp2282Esc(JSON.stringify(stack))}"></span>`, vi ? 'Bằng nhau → giữ người gần hơn' : 'Equal heights → keep the nearer person');
}

function vp2282Counter(v, vi) {
  const cell = v.current, change = v.change, c = v.comparison;
  const counts = cell ? `${vp2282Stat('→',v.right[cell[0]][cell[1]])}<i>+</i>${vp2282Stat('↓',v.down[cell[0]][cell[1]])}<i>=</i>${vp2282Stat('answer'+vp2282Name(cell),v.answer?.[cell[0]][cell[1]])}` : '';
  const equation = c && (v.source.text.startsWith('while ') || v.source.text.startsWith('if heights[')) ? `<div class="vp2282-equation">${c.target ? `${vp2282Stat('TOP',c.left)}<i>${vp2282Esc(c.op)}</i>${vp2282Stat('height',c.right)}<strong>${c.pass?'True ✓':'False ×'}</strong>` : '<strong>∅ → STOP</strong>'}</div>` : '';
  const effect = change?.kind === 'count' ? `<div class="vp2282-effect is-green" data-write-cell="${change.cell}" data-write-before="${change.before}" data-write-after="${change.after}"><span>${vp2282Name(change.cell)} → ${vp2282Name(change.target)}</span><b>${change.before} + 1 = ${change.after}</b></div>` :
    change?.kind === 'equal' ? `<div class="vp2282-effect is-amber"><span>${vi?'Bỏ người bằng chiều cao ở xa':'Drop the farther equal-height person'}</span><b>POP · +0</b></div>` :
    change?.kind === 'pop' ? `<div class="vp2282-effect is-amber"><span>POP ${vp2282Name(change.cell)}</span><b>${vi?'Chưa cộng':'Not counted yet'}</b></div>` : '';
  return vp2282Card(vi ? 'Người đang xét · số đã đếm' : 'Current person · counts so far', `<div class="vp2282-equation">${counts||'—'}</div>${equation}${effect}`);
}

function vp2282Next(kind) {
  if (typeof steps === 'undefined') return -1;
  return steps.findIndex((s,i) => i > stepIndex && s.visiblePeople2282View && (kind === 'line' ||
    kind === 'result' && s.final || s.visiblePeople2282View.change?.kind === kind));
}
function vp2282Go(index) {
  if (index < 0 || typeof steps === 'undefined') return;
  if (typeof stopPlay === 'function') stopPlay();
  stepIndex = index; renderStep();
}
function renderVisiblePeople2282(step) {
  const v = step.visiblePeople2282View, host = document.getElementById('treeView');
  if (!v || !host) return;
  const vi = typeof lang !== 'undefined' && lang === 'vi', open = host.querySelector('.vp2282-native')?.open ?? false;
  const scrolls = new Map([...host.querySelectorAll('[data-vp2282-scroll]')].map(el => [el.dataset.vp2282Scroll,{x:el.scrollLeft,y:el.scrollTop}]));
  const jumps = [['line',vi?'Dòng →':'Line →'],['pop','POP →'],['count','+1 →'],['equal','= →'],['pass',vi?'Hàng/cột →':'Row/col →'],['result',vi?'Kết quả ↠':'Result ↠']];
  host.innerHTML = `<article class="tr-viz vp2282-viz" data-problem-id="2282" data-source-line="${v.source.line}" role="region" aria-label="LeetCode 2282"><header class="tr-header"><div><small>LEETCODE 2282 · MONOTONIC STACK</small><h2>${vi?'Ai nhìn thấy ai? → ↓':'Who can see whom? → ↓'}</h2></div><code>O(mn)</code></header><nav class="tr-presets" aria-label="Examples">${VP2282_CASES.map((c,i)=>`<button type="button" data-vp2282-case="${i}">${c[vi?1:2]}</button>`).join('')}</nav><div class="vp2282-phases"><span class="${v.phase==='row'?'is-active':''}">→ ${vi?'Hàng':'Rows'}</span><span class="${v.phase==='col'?'is-active':''}">↓ ${vi?'Cột':'Columns'}</span></div><div class="tr-source"><span>${vi?'Sau dòng':'After line'} <b>L${v.source.line}</b></span><code>${vp2282Esc(v.source.text)}</code>${v.branch===null?'':`<strong>${v.branch?'True ✓':'False ×'}</strong>`}</div><div class="vp2282-work">${vp2282Grid(v,vi)}${vp2282Skyline(v,vi)}<div class="vp2282-two">${vp2282Counter(v,vi)}${vp2282Stack(v,vi)}</div></div><span hidden data-native-answer="${vp2282Esc(JSON.stringify(v.answer))}"></span><details class="tr-native vp2282-native"><summary>${vi?'Biến Python · từng frame':'Python locals · every frame'}</summary><pre>${vp2282Esc(JSON.stringify(v.frames,null,2))}</pre></details>${v.result===null?'':`<output class="tr-answer" data-answer="${vp2282Esc(JSON.stringify(v.result))}"><small>${vi?'Kết quả · ma trận':'Result · matrix'}</small><div class="vp2282-result">${v.result.map(row=>`<div>${row.map(value=>`<b>${value}</b>`).join('')}</div>`).join('')}</div></output>`}<footer class="tr-footer"><div>${jumps.map(([kind,label])=>`<button type="button" data-vp2282-jump="${kind}" ${vp2282Next(kind)<0?'disabled':''}>${label}</button>`).join('')}</div></footer></article>`;
  const details = host.querySelector('.vp2282-native'); if (details) details.open = open;
  for (const el of host.querySelectorAll('[data-vp2282-scroll]')) {
    const saved = scrolls.get(el.dataset.vp2282Scroll); if (saved) { el.scrollLeft=saved.x; el.scrollTop=saved.y; }
    const active = el.querySelector('.is-current');
    if (active) { const a=el.getBoundingClientRect(),b=active.getBoundingClientRect();
      if(b.left<a.left+5)el.scrollLeft-=a.left+5-b.left;if(b.right>a.right-5)el.scrollLeft+=b.right-a.right+5;
      if(b.top<a.top+5)el.scrollTop-=a.top+5-b.top;if(b.bottom>a.bottom-5)el.scrollTop+=b.bottom-a.bottom+5;
    }
    const target = el.querySelector('.is-target');
    if (active && target) {
      const pane=el.getBoundingClientRect(),a=active.getBoundingClientRect(),b=target.getBoundingClientRect();
      const left=Math.min(a.left,b.left),right=Math.max(a.right,b.right);
      if(right-left<=pane.width-10){if(left<pane.left+5)el.scrollLeft-=pane.left+5-left;if(right>pane.right-5)el.scrollLeft+=right-pane.right+5;}
    }
  }
  const bind = (selector,fn) => host.querySelectorAll(selector).forEach(el => {
    el.addEventListener('click',()=>fn(el));
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();fn(el);}});
  });
  host.querySelectorAll('summary').forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')e.stopPropagation();}));
  bind('[data-vp2282-jump]',el=>vp2282Go(vp2282Next(el.dataset.vp2282Jump)));
  bind('[data-vp2282-cell]',el=>{
    const cell=el.dataset.vp2282Cell.split(',').map(Number),phase=v.phase??'row';
    vp2282Go(steps.findIndex(s=>s.visiblePeople2282View?.change?.kind==='visit'&&s.visiblePeople2282View.phase===phase&&vp2282Same(s.visiblePeople2282View.current,cell)));
  });
  bind('[data-vp2282-case]',el=>{document.getElementById('arrInput').value=VP2282_CASES[Number(el.dataset.vp2282Case)][0];if(typeof runViz==='function')runViz();});
}
