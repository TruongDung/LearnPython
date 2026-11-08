'use strict';
const SB_CASES = {
  2334: [
    [[1,3,4,3,1],6,'Tìm đoạn dài 3','Find length 3'],
    [[2,2,2],6,'Bằng threshold → loại','Equal to threshold → reject'],
    [[2,2,2],5,'Ba số bằng nhau','Three equal values'],
    [[1,2,3,4],6,'Quét tới biên ảo','Flush at the sentinel'],
    [[1,1,1],4,'Không có đáp án','No valid segment'],
    [[8],7,'Một phần tử','One element'],
    [[6,5,6,5,8],7,'Có nhiều k hợp lệ','Several valid lengths'],
  ],
  2297: [
    [[3,2,4,4,1],[3,7,6,4,2],'Hai loại bước nhảy','Two jump types'],
    [[0,1,2],[1,1,1],'Bị chặn ở giữa','Blocked in between'],
    [[4,4,4],[9,2,3],'Bằng nhau là ≥','Equality belongs to ≥'],
    [[5,5,1],[100,8,2],'Nhảy qua số bằng','Jump over an equal'],
    [[5,1,4,2],[100,1,10,1],'Đường vòng rẻ hơn','A cheaper detour'],
    [[3,1,4,2],[10,0,0,0],'Phí bằng 0','Zero landing fees'],
    [[7],[100000],'Đứng ở đích · phí 0','Already at the goal · free'],
  ],
};
function sbEsc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function sbFmt(value) { return value === undefined || value === null ? '—' : typeof value === 'boolean' ? value ? 'True' : 'False' : String(value); }
function sbCard(title, body, hint = '') { return `<section class="tr-card"><header><b>${title}</b><small>${hint}</small></header>${body}</section>`; }
function sbStat(name, value) { return `<span class="sb-stat"><code>${name}</code><b>${sbEsc(sbFmt(value))}</b></span>`; }
function sbArray(v, name, vi) {
  const a = v.locals[name];
  return sbCard(name, `<div class="sb-array" data-sb-scroll="${name}" data-native-array="${name}" data-array-values="${sbEsc(JSON.stringify(a ?? null))}" tabindex="0">${a ? a.map((x,i) => `<button type="button" data-sb-cell="${name}:${i}" class="sb-cell ${i === v.current ? 'is-current' : ''} ${(name === 'dp' && v.change?.kind === 'write' || name === 'parent' && v.change?.kind === 'parent') && v.change.to === i ? 'is-written' : ''}"><small>[${i}]</small><b>${x}</b></button>`).join('') : '—'}</div>`, vi ? 'Chọn ô → dòng Python đã ghi' : 'Select a cell → its Python assignment');
}
function sbStack(v, name, title) {
  const a = v.locals[name];
  return sbCard(title, `<div class="sb-stack" data-sb-scroll="stack-${name}" data-native-stack="${name}" data-stack-values="${sbEsc(JSON.stringify(a ?? null))}" tabindex="0">${a ? [...a].reverse().map((i,k) => `<div class="${k ? '' : 'is-top'}"><small>#${i}</small><b>${v.values[i]}</b>${k ? '' : '<code>TOP ↑</code>'}</div>`).join('') || '<span>∅</span>' : '—'}</div>`, name);
}
function sbCompare(v, vi) {
  const c = v.comparison;
  if (!c || !(v.source.text.startsWith('while ') || v.change?.kind === 'pop')) return '';
  return sbCard(`${c.stack} · ${vi ? 'so sánh TOP' : 'compare TOP'}`, `<div class="sb-comparison ${c.pass ? 'is-pass' : ''}">${c.top === null ? '<b>∅ → STOP</b>' : `<span><small>#${c.top}</small><b>${c.left}</b></span><i>${sbEsc(c.op)}</i><span><small>${vi ? 'đang xét' : 'current'}</small><b>${c.right}</b></span><strong>${c.pass ? 'True ✓' : 'False ×'}</strong>`}</div>`, `L${c.line}`);
}
function sbSegment(v, vi) {
  const a = v.values, n = a.length, s = v.scratch, w = Math.max(365, (n + 1) * 76 + 75), px = i => 64 + i * 76;
  const max = Math.max(...a), base = 235, height = value => value / max * 135;
  const ready = s.width !== undefined, start = ready ? s.left + 1 : null, end = ready ? v.locals.right - 1 : null;
  const checked = v.change?.kind === 'check' || v.returning && v.result !== -1;
  const pass = checked ? v.checks.at(-1).pass : null;
  const segment = ready && s.minimum !== undefined ? `<rect class="sb-range ${pass === true ? 'is-pass' : ''}" data-segment-start="${start}" data-segment-end="${end}" data-segment-min="${s.minimum}" x="${px(start)-29}" y="${base-height(s.minimum)}" width="${(end-start)*76+58}" height="${height(s.minimum)}" rx="5"/><path class="sb-minimum" d="M${px(start)-29},${base-height(s.minimum)}H${px(end)+29}"/>` : '';
  const bars = a.map((value,i) => `<g class="sb-bar ${i === v.current ? 'is-current' : ''} ${i === s.mid ? 'is-min' : ''} ${ready && i >= start && i <= end ? 'is-inside' : ''}" data-sb-item="${i}" data-value-index="${i}" data-value="${value}" role="button" tabindex="0" aria-label="nums ${i} = ${value}"><rect x="${px(i)-22}" y="${base-height(value)}" width="44" height="${Math.max(1,height(value))}" rx="5"/><text x="${px(i)}" y="${base-height(value)-7}" style="font-size:${String(value).length>6?9:14}px">${value}</text><text class="sb-small" x="${px(i)}" y="260">[${i}]</text>${i === s.mid ? `<text class="sb-pointer" x="${px(i)}" y="280">min ↑</text>` : ''}</g>`).join('');
  const bracket = ready ? `<path class="sb-bracket" d="M${px(start)-27},285V294H${px(end)+27}V285"/><text class="sb-width" x="${(px(start)+px(end))/2}" y="317">k = ${s.width}</text>` : '';
  const sentinel = `<g class="sb-sentinel ${v.current === n ? 'is-current' : ''}"><rect x="${px(n)-23}" y="228" width="46" height="7" rx="3"/><text x="${px(n)}" y="215">0</text><text class="sb-small" x="${px(n)}" y="260">${vi ? 'biên ảo' : 'sentinel'}</text></g>`;
  const equation = `<div class="sb-equation ${pass === true ? 'is-pass' : pass === false ? 'is-fail' : ''}" data-product="${s.product ?? ''}" data-check="${pass ?? ''}">${sbStat('min',s.minimum)}<i>×</i>${sbStat('k',s.width)}<i>=</i>${sbStat('product',s.product)}<i>&gt;</i>${sbStat('threshold',v.threshold)}${pass === null ? '' : `<strong>${pass ? '✓' : '×'}</strong>`}</div>`;
  return sbCard(vi ? 'Mở đoạn khi POP' : 'Expose a segment on POP', `<div class="sb-canvas" data-sb-scroll="bars" tabindex="0"><svg width="${w}" height="335" viewBox="0 0 ${w} 335" role="group">${segment}${bars}${sentinel}${bracket}</svg></div><div class="sb-legend"><span>■ ${vi ? 'đoạn đang xét' : 'current segment'}</span><span class="is-amber">● min</span><span>0 · ${vi ? 'biên ảo không thuộc nums' : 'sentinel is outside nums'}</span></div>`) +
    sbCard('min × k > threshold',equation,vi ? 'Dấu > nghiêm ngặt · trả k bất kỳ hợp lệ' : 'Strict > · return any valid k') +
    `<div class="sb-stats">${sbStat('mid',s.mid)}${sbStat('left',s.left)}${sbStat('right',v.locals.right)}${sbStat('width',s.width)}</div>` +
    sbStack(v,'stack',vi ? 'Stack · giá trị không giảm' : 'Stack · nondecreasing values') + sbCompare(v,vi) +
    sbCard(vi ? 'Các đoạn đã kiểm tra' : 'Tested segments',`<div class="sb-ledger" data-sb-scroll="checks" tabindex="0">${v.checks.map(c => `<button type="button" data-sb-step="${c.step}" class="${c.pass ? 'is-pass' : ''}"><small>[${c.left+1}…${c.right-1}] · k=${c.width}</small><b>${c.minimum} × ${c.width} ${c.pass ? '>' : '≤'} ${v.threshold} ${c.pass ? '✓' : '×'}</b></button>`).join('') || '∅'}</div>`);
}
function sbJump(v, vi) {
  const a=v.values,n=a.length,w=Math.max(350,n*88+55),px=i=>55+i*88,base=239,max=Math.max(1,...a),height=value=>12+value/max*98;
  const selected=v.edge,routePairs=new Set(v.path.slice(1).map((j,k)=>v.path[k]+':'+j));
  const edges=v.edges.map(e=>{
    const active=selected?.from===e.from&&selected?.to===e.to,good=routePairs.has(e.from+':'+e.to),y=e.kind==='greater'?48:73;
    return `<path class="sb-jump-edge ${good?'is-route':''} ${active?'is-selected':''}" data-edge-from="${e.from}" data-edge-to="${e.to}" data-edge-kind="${e.kind}" data-sb-step="${e.step}" role="button" tabindex="0" aria-label="Jump ${e.from} to ${e.to}" marker-end="url(#sb-jump-arrow)" d="M${px(e.from)},105C${px(e.from)},${y} ${px(e.to)},${y} ${px(e.to)},105"/>`;
  }).join('');
  const bars=a.map((value,i)=>`<g class="sb-bar ${i===v.current?'is-current':''} ${selected?.from===i?'is-min':''} ${v.path.includes(i)?'is-route':''}" data-sb-item="${i}" data-value-index="${i}" data-value="${value}" role="button" tabindex="0" aria-label="Index ${i}, value ${value}, landing fee ${v.costs[i]}"><rect x="${px(i)-23}" y="${base-height(value)}" width="46" height="${height(value)}" rx="6"/><text x="${px(i)}" y="${base-height(value)-9}">${value}</text><text class="sb-small" x="${px(i)}" y="262">[${i}]</text><text class="sb-cost" x="${px(i)}" y="285">+${i===0?'0':v.costs[i]}</text><text class="sb-small" x="${px(i)}" y="307">dp ${v.locals.dp?.[i]??'—'}</text></g>`).join('');
  let proof='';
  if(selected){
    const e=selected,up=e.kind==='greater',between=Array.from({length:e.to-e.from-1},(_,k)=>e.from+k+1);
    proof=sbCard(vi?'Vì sao nhảy được?':'Why is this jump legal?',`<div class="sb-jump-proof" data-proof-from="${e.from}" data-proof-to="${e.to}"><div class="sb-proof-end"><small>#${e.from}</small><b>${a[e.from]}</b></div><div class="sb-proof-middle"><strong>${up?'≤':'>'}</strong><span>→ #${e.to}</span></div><div class="sb-proof-end"><small>#${e.to}</small><b>${a[e.to]}</b></div></div><div class="sb-between" data-sb-scroll="between" tabindex="0">${between.map(k=>`<span data-between-index="${k}"><small>#${k}</small><b>${a[k]} ${up?'&lt;':'≥'} ${a[e.from]} ✓</b></span>`).join('')||`<span>${vi?'Liền kề · không có ô ở giữa':'Adjacent · no intermediate positions'} ✓</span>`}</div>`,up?vi?'Số đầu tiên bên phải ≥ nums[i]':'First value to the right ≥ nums[i]':vi?'Số đầu tiên bên phải < nums[i]':'First value to the right < nums[i]');
  }
  const relax=selected?sbCard('dp[j] ← min(dp[j], dp[i] + costs[j])',`<div class="sb-equation" data-candidate="${v.scratch.candidate??''}">${sbStat('dp[i]',v.scratch.fromCost)}<i>+</i>${sbStat('costs[j]',v.costs[selected.to])}<i>=</i>${sbStat('candidate',v.scratch.candidate)}<i>→</i>${sbStat(`dp[${selected.to}]`,v.locals.dp?.[selected.to])}${v.scratch.improves===undefined?'':`<strong class="${v.scratch.improves?'is-green':''}">${v.scratch.improves?'↓ ✓':'≥ STOP'}</strong>`}</div>`,v.pendingParent===null?'':vi?'dp vừa đổi · dòng kế tiếp mới gán parent':'dp just changed · parent is assigned on the next line'):'';
  const route=sbCard(vi?'Đường đi theo parent hiện tại':'Route from current parent pointers',`<div class="sb-route" data-sb-scroll="route" data-route="${v.path.join(',')}" tabindex="0">${v.path.map((i,k)=>`${k?'<i>→</i>':''}<span><small>#${i}</small><b>+${k?v.costs[i]:0}</b></span>`).join('')||'—'}${v.path.length?`<strong>= ${v.path.slice(1).reduce((sum,i)=>sum+v.costs[i],0)}</strong>`:''}</div>`,vi?'Không thu phí vị trí xuất phát':'The starting position is free');
  return sbCard(vi?'Bước nhảy · phí khi đáp xuống':'Jumps · pay on landing',`<div class="sb-canvas" data-sb-scroll="jumps" tabindex="0"><svg width="${w}" height="328" viewBox="0 0 ${w} 328" role="group"><defs><marker id="sb-jump-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10Z"/></marker></defs>${edges}${bars}</svg></div><div class="sb-legend"><span class="is-amber">→ ${vi?'cạnh vừa lấy ra':'current edge'}</span><span class="is-green">→ ${vi?'đường theo parent':'parent route'}</span><span>+ ${vi?'phí đáp xuống':'landing fee'}</span></div>`) + proof + relax + route + sbArray(v,'dp',vi) +
    `<div class="sb-stack-pair">${sbStack(v,'greater',vi?'Chờ số đầu tiên ≥':'Wait for first ≥')}${sbStack(v,'smaller',vi?'Chờ số đầu tiên <':'Wait for first <')}</div>` + sbCompare(v,vi) + sbArray(v,'parent',vi) +
    sbCard(vi?'Các lần giảm chi phí':'Cost improvements',`<div class="sb-ledger" data-sb-scroll="writes" tabindex="0">${v.writes.map(r=>`<button type="button" data-sb-step="${r.step}"><small>#${r.from} → #${r.to}</small><b>${r.before} → ${r.after}</b></button>`).join('')||'∅'}</div>`);
}
function sbNext(kind) {
  if(typeof steps==='undefined')return -1;
  return steps.findIndex((s,i)=>i>stepIndex&&s.stackBoundaryView&&(kind==='line'||kind==='pop'&&s.stackBoundaryView.change?.kind==='pop'||kind==='write'&&['check','write'].includes(s.stackBoundaryView.change?.kind)||kind==='result'&&s.final));
}
function sbGo(index) { if(index<0||typeof steps==='undefined')return;if(typeof stopPlay==='function')stopPlay();stepIndex=index;renderStep(); }
function sbBind(host) {
  const bind=(selector,fn)=>host.querySelectorAll(selector).forEach(el=>{
    el.addEventListener('click',()=>fn(el));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();fn(el);}});
  });
  host.querySelectorAll('summary').forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')e.stopPropagation();}));
  bind('[data-sb-jump]',el=>sbGo(sbNext(el.dataset.sbJump)));
  bind('[data-sb-step]',el=>sbGo(Number(el.dataset.sbStep)));
  bind('[data-sb-item]',el=>{
    const index=Number(el.dataset.sbItem),id=steps[stepIndex].stackBoundaryView.id;
    const target=steps.findIndex(s=>{const v=s.stackBoundaryView;return id===2334?v.change?.kind==='check'&&v.change.mid===index:v.change?.kind==='parent'&&v.change.to===index;});
    const fallback=steps.findIndex(s=>s.stackBoundaryView.current===index);
    sbGo(target<0?fallback:target);
  });
  bind('[data-sb-cell]',el=>{
    const [name,index]=el.dataset.sbCell.split(':'),kind=name==='dp'?'write':'parent';
    const target=steps.findLastIndex(s=>s.stackBoundaryView.change?.kind===kind&&s.stackBoundaryView.change.to===Number(index));
    const init=steps.findIndex(s=>s.stackBoundaryView.source.text===(name==='dp'?'dp[0] = 0':'parent = [-1] * n'));
    sbGo(target<0?init:target);
  });
  bind('[data-sb-case]',el=>{
    const id=steps[stepIndex].stackBoundaryView.id,c=SB_CASES[id][Number(el.dataset.sbCase)];
    document.getElementById('arrInput').value=c[0].join(',');
    document.getElementById(id===2334?'param-threshold':'param-costs').value=id===2334?c[1]:c[1].join(',');
    if(typeof runViz==='function')runViz();
  });
}
function renderStackBoundariesPaths(step) {
  const v=step.stackBoundaryView,host=document.getElementById('treeView');if(!v||!host)return;
  const vi=typeof lang!=='undefined'&&lang==='vi',open=host.querySelector('.sb-native')?.open??false;
  const scrolls=new Map([...host.querySelectorAll('[data-sb-scroll]')].map(el=>[el.dataset.sbScroll,{x:el.scrollLeft,y:el.scrollTop}]));
  const title=v.id===2334?vi?'POP → mở đoạn → kiểm tra':'POP → expose segment → test':vi?'Hai stack · một đường đi rẻ nhất':'Two stacks · one cheapest route';
  const jumps=[['line',vi?'Dòng →':'Line →'],['pop','POP →'],['write',v.id===2334?vi?'Kiểm tra →':'Test →':'dp →'],['result',vi?'Kết quả ↠':'Result ↠']];
  host.innerHTML=`<article class="tr-viz sb-viz" data-problem-id="${v.id}" data-source-line="${v.source.line}" role="region" aria-label="LeetCode ${v.id}"><header class="tr-header"><div><small>LEETCODE ${v.id} · MONOTONIC STACK</small><h2>${title}</h2></div><code>O(n)</code></header><nav class="tr-presets" aria-label="Examples">${SB_CASES[v.id].map((c,i)=>`<button type="button" data-sb-case="${i}">${c[vi?2:3]}</button>`).join('')}</nav><div class="tr-source"><span>${vi?'Sau dòng':'After line'} <b>L${v.source.line}</b></span><code>${sbEsc(v.source.text)}</code>${v.branch===null?'':`<strong class="${v.branch?'is-good':'is-muted'}">${v.branch?'True ✓':'False ×'}</strong>`}</div><div class="sb-work">${v.id===2334?sbSegment(v,vi):sbJump(v,vi)}</div><details class="tr-native sb-native"><summary>${vi?'Biến Python · từng frame':'Python locals · each frame'}</summary>${v.frames.map(f=>`<div class="sb-frame"><code>${sbEsc(f.name)}</code><pre>${sbEsc(JSON.stringify(f.locals,null,2))}</pre></div>`).join('')}</details>${v.result===null?'':`<output class="tr-answer" data-answer="${v.result}"><small>${vi?'Kết quả':'Result'}</small><strong>${v.result}</strong></output>`}<footer class="tr-footer"><div>${jumps.map(([kind,label])=>`<button type="button" data-sb-jump="${kind}" ${sbNext(kind)<0?'disabled':''}>${label}</button>`).join('')}</div></footer></article>`;
  const details=host.querySelector('.sb-native');if(details)details.open=open;
  for(const el of host.querySelectorAll('[data-sb-scroll]')){
    const saved=scrolls.get(el.dataset.sbScroll);if(saved){el.scrollLeft=saved.x;el.scrollTop=saved.y;}
    const active=el.querySelector('.is-current');if(active){const a=el.getBoundingClientRect(),b=active.getBoundingClientRect();if(b.left<a.left+5)el.scrollLeft-=a.left+5-b.left;if(b.right>a.right-5)el.scrollLeft+=b.right-a.right+5;}
  }
  sbBind(host);
}
