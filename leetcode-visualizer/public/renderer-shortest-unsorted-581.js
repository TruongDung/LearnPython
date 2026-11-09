'use strict';
const SU581_CASES = [
  ['2,6,4,8,10,9,15', 'Ví dụ · đoạn ở giữa', 'Example · middle segment'],
  ['1,2,3,4', 'Đã tăng', 'Already sorted'],
  ['1,3,2,2,2', 'Có số trùng', 'Duplicate values'],
  ['5,4,3,2,1', 'Giảm dần', 'Decreasing'],
  ['-1,-3,-2,0', 'Có số âm', 'Negative values'],
  ['7', 'Một phần tử', 'One element'],
];
function su581Esc(value) { return String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function su581Card(title,body,hint='') { return `<section class="tr-card"><header><b>${title}</b><small>${hint}</small></header>${body}</section>`; }
function su581Scroll(name,body,cls='') { return `<div class="su581-scroll ${cls}" data-su581-scroll="${name}" tabindex="0">${body}</div>`; }
function su581Chip(label,value) { return `<span class="su581-chip"><code>${label}</code><b>${value??'—'}</b></span>`; }
function su581Focus(v) { return v.held ?? (v.source.text.startsWith('while ') ? v.comparison?.top : null) ?? null; }

function su581Bars(v,vi) {
  const a=v.values,n=a.length,w=Math.max(340,n*72+60),px=i=>55+i*72;
  const min=Math.min(0,...a),max=Math.max(0,...a),span=max-min||1,py=value=>48+(max-value)/span*156,base=py(0);
  const focus=su581Focus(v),lo=v.window?.[0],hi=v.window?.[1];
  const range=v.window?`<rect class="su581-range" x="${px(lo)-29}" y="30" width="${(hi-lo)*72+58}" height="240" rx="10"/>`:'';
  const edge=v.inversion?`<path class="su581-inversion" data-inversion-from="${v.inversion.from}" data-inversion-to="${v.inversion.to}" d="M${px(v.inversion.from)},27Q${(px(v.inversion.from)+px(v.inversion.to))/2},5 ${px(v.inversion.to)},27" marker-end="url(#su581-inversion-arrow)"/>`:'';
  const bars=a.map((value,i)=>`<g class="su581-bar ${v.stack?.includes(i)?'is-stack':''} ${i===focus?'is-target':''} ${i===v.current?'is-current':''}" data-su581-item="${i}" data-bar-index="${i}" data-bar-value="${value}" role="button" tabindex="0" aria-label="Index ${i}, value ${value}"><rect x="${px(i)-20}" y="${Math.min(base,py(value))}" width="40" height="${Math.max(2,Math.abs(base-py(value)))}" rx="5"/><text x="${px(i)}" y="${value>=0?py(value)-10:py(value)+18}">${value}</text><text class="su581-small" x="${px(i)}" y="254">[${i}]</text></g>`).join('');
  const left=v.left!==null&&v.left<n?`<path class="su581-boundary is-left" d="M${px(v.left)},275V294"/><text class="su581-bound-label" x="${px(v.left)}" y="313">L=${v.left}</text>`:'';
  const right=v.right!==null&&v.right>0?`<path class="su581-boundary is-right" d="M${px(v.right)},275V294"/><text class="su581-bound-label" x="${px(v.right)}" y="313">R=${v.right}</text>`:'';
  return su581Card('nums · '+(v.phase==='left'?'→':'←'),su581Scroll('bars',`<svg width="${w}" height="335" viewBox="0 0 ${w} 335" style="width:100%;min-width:340px;max-width:${w}px;height:auto" role="group"><defs><marker id="su581-inversion-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10Z"/></marker></defs>${range}<path class="su581-axis" d="M20,${base}H${w-15}"/>${edge}${bars}${left}${right}</svg>`,'su581-canvas')+
    `<div class="su581-legend"><span class="is-purple">● i</span><span class="is-blue">● stack</span><span class="is-amber">● ${vi?'đối chiếu / POP':'compare / POP'}</span><span class="is-red">↷ ${vi?'sai thứ tự':'inversion'}</span></div>`,vi?'Chọn cột → dòng duyệt index đó · ↔':'Select a bar → its scan step · ↔');
}

function su581Bounds(v,vi) {
  const c=v.change;
  const effect=c?.kind==='pop'?`<div class="su581-effect is-amber" data-held-index="${c.index}"><span>stack → j</span><b>[${c.index}] = ${v.values[c.index]}</b><small>${vi?'Biên chưa cập nhật':'Boundary not updated yet'}</small></div>`:
    c?.kind==='bound'?`<div class="su581-effect is-green" data-bound-name="${c.name}" data-bound-before="${c.before}" data-bound-after="${c.after}"><span>${c.name} = ${c.name==='left'?'min':'max'}(${c.before}, ${c.index})</span><b>${c.before} → ${c.after}</b></div>`:'';
  const comparison=v.source.text.startsWith('while ')&&v.comparison?`<div class="su581-equation">${v.comparison.top===null?'<strong>∅ → STOP</strong>':`${su581Chip('TOP',v.comparison.left)}<i>${su581Esc(v.comparison.op)}</i>${su581Chip('nums[i]',v.comparison.right)}<strong>${v.comparison.pass?'True ✓':'False ×'}</strong>`}</div>`:'';
  return su581Card(v.result!==null?(vi?'Hai biên của đoạn':'Segment boundaries'):(vi?'Biên đang tìm':'Current boundaries'),`<div class="su581-equation" data-native-left="${v.left??''}" data-native-right="${v.right??''}">${su581Chip('left',v.left===v.values.length?'n = '+v.left:v.left)}${su581Chip('right',v.right)}${su581Chip('[L…R]',v.window?'['+v.window.join('…')+']':'∅')}</div>${comparison}${effect}`);
}

function su581Stack(v,vi) {
  const stack=v.stack;
  return su581Card('STACK · TOP ↑',su581Scroll('stack',stack?[...stack].reverse().map((index,k)=>`<button type="button" class="su581-stack-node ${k===0?'is-top':''}" data-su581-item="${index}" data-stack-index="${index}"><small>[${index}]</small><b>${v.values[index]}</b>${k===0?'<code>TOP</code>':''}</button>`).join('')||'<span class="su581-empty">∅</span>':'<span class="su581-empty">—</span>','su581-stack')+
    `<span hidden data-native-stack="${su581Esc(JSON.stringify(stack))}"></span>`,v.phase==='left'?'v₀ ≤ … ≤ TOP':'v₀ ≥ … ≥ TOP');
}

function su581Proof(v,vi) {
  if(!v.illustration)return '';
  const n=v.values.length,w=Math.max(340,n*72+60),px=i=>55+i*72;
  const edges=v.illustration.map((node,to)=>{
    const moved=node.index!==to;
    return `<path class="su581-sort-edge ${moved?'is-moved':''}" data-sort-from="${node.index}" data-sort-to="${to}" d="M${px(node.index)},65C${px(node.index)},100 ${px(to)},105 ${px(to)},135" ${moved?'marker-end="url(#su581-sort-arrow)"':''}/>`;
  }).join('');
  const lane=(nodes,y,output)=>nodes.map((node,i)=>`<g class="su581-proof-node ${v.window&&i>=v.left&&i<=v.right?'is-inside':''}" ${output?`data-preview-index="${i}" data-preview-value="${node.value}" data-preview-origin="${node.index}"`:''}><rect x="${px(i)-26}" y="${y}" width="52" height="45" rx="7"/><text x="${px(i)}" y="${y+20}" style="font-size:${String(node.value).length>5?10:13}px">${node.value}</text><text class="su581-small" x="${px(i)}" y="${y+35}">#${node.index}</text></g>`).join('');
  return su581Card(v.window?`${vi?'Minh họa · chỉ sắp':'Illustration · sort only'} [${v.left}…${v.right}]`:vi?'Đã tăng · giữ nguyên':'Already sorted · unchanged',su581Scroll('proof',`<svg width="${w}" height="220" viewBox="0 0 ${w} 220" style="width:100%;min-width:340px;max-width:${w}px;height:auto" role="group"><defs><marker id="su581-sort-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10Z"/></marker></defs>${edges}${lane(v.values.map((value,index)=>({value,index})),20,false)}${lane(v.illustration,140,true)}</svg>`,'su581-canvas'),vi?'# là index gốc · số trùng vẫn có ID riêng':'# is the original index · equal values keep separate IDs');
}

function su581Next(kind) {
  if(typeof steps==='undefined')return -1;
  return steps.findIndex((s,i)=>i>stepIndex&&s.shortestUnsorted581View&&(kind==='line'||kind==='result'&&s.final||s.shortestUnsorted581View.change?.kind===kind));
}
function su581Go(index) {
  if(index<0||typeof steps==='undefined')return;
  if(typeof stopPlay==='function')stopPlay();
  stepIndex=index;renderStep();
}
function renderShortestUnsorted581(step) {
  const v=step.shortestUnsorted581View,host=document.getElementById('treeView');if(!v||!host)return;
  const vi=typeof lang!=='undefined'&&lang==='vi',open=host.querySelector('.su581-native')?.open??false;
  const scrolls=new Map([...host.querySelectorAll('[data-su581-scroll]')].map(el=>[el.dataset.su581Scroll,{x:el.scrollLeft,y:el.scrollTop}]));
  const jumps=[['line',vi?'Dòng →':'Line →'],['pop','POP →'],['bound',vi?'Biên →':'Bound →'],['reset','← PASS'],['result',vi?'Kết quả ↠':'Result ↠']];
  host.innerHTML=`<article class="tr-viz su581-viz" data-problem-id="581" data-source-line="${v.source.line}" role="region" aria-label="LeetCode 581"><header class="tr-header"><div><small>LEETCODE 581 · MONOTONIC STACK</small><h2>${vi?'Đoạn nào cần sắp xếp?':'Which segment needs sorting?'}</h2></div><code>O(n)</code></header><nav class="tr-presets" aria-label="Examples">${SU581_CASES.map((c,i)=>`<button type="button" data-su581-case="${i}">${c[vi?1:2]}</button>`).join('')}</nav><div class="su581-phases"><span class="${v.phase==='left'?'is-active':''}">→ ${vi?'tìm':'find'} L</span><span class="${v.phase==='right'?'is-active':''}">← ${vi?'tìm':'find'} R</span></div><div class="tr-source"><span>${vi?'Sau dòng':'After line'} <b>L${v.source.line}</b></span><code>${su581Esc(v.source.text)}</code>${v.branch===null?'':`<strong>${v.branch?'True ✓':'False ×'}</strong>`}</div><div class="su581-work">${su581Bars(v,vi)}<div class="su581-two">${su581Bounds(v,vi)}${su581Stack(v,vi)}</div>${su581Proof(v,vi)}</div><details class="tr-native su581-native"><summary>${vi?'Biến Python · từng frame':'Python locals · every frame'}</summary><pre>${su581Esc(JSON.stringify(v.frames,null,2))}</pre></details>${v.result===null?'':`<output class="tr-answer" data-answer="${v.result}"><small>${vi?'Độ dài ngắn nhất':'Shortest length'}</small><strong>${v.result===0?(vi?'Đã tăng ✓ · 0':'Already sorted ✓ · 0'):`${v.right} − ${v.left} + 1 = ${v.result}`}</strong></output>`}<footer class="tr-footer"><div>${jumps.map(([kind,label])=>`<button type="button" data-su581-jump="${kind}" ${su581Next(kind)<0?'disabled':''}>${label}</button>`).join('')}</div></footer></article>`;
  const details=host.querySelector('.su581-native');if(details)details.open=open;
  for(const el of host.querySelectorAll('[data-su581-scroll]')){
    const saved=scrolls.get(el.dataset.su581Scroll);if(saved){el.scrollLeft=saved.x;el.scrollTop=saved.y;}
    const active=el.querySelector('.is-current');
    if(active){const a=el.getBoundingClientRect(),b=active.getBoundingClientRect();if(b.left<a.left+5)el.scrollLeft-=a.left+5-b.left;if(b.right>a.right-5)el.scrollLeft+=b.right-a.right+5;}
    const target=el.querySelector('.is-target');
    if(active&&target){const a=el.getBoundingClientRect(),b=active.getBoundingClientRect(),c=target.getBoundingClientRect(),left=Math.min(b.left,c.left),right=Math.max(b.right,c.right);if(right-left<=a.width-10){if(left<a.left+5)el.scrollLeft-=a.left+5-left;if(right>a.right-5)el.scrollLeft+=right-a.right+5;}}
  }
  const bind=(selector,fn)=>host.querySelectorAll(selector).forEach(el=>{
    el.addEventListener('click',()=>fn(el));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();fn(el);}});
  });
  host.querySelectorAll('summary').forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')e.stopPropagation();}));
  bind('[data-su581-jump]',el=>su581Go(su581Next(el.dataset.su581Jump)));
  bind('[data-su581-item]',el=>su581Go(steps.findIndex(s=>s.shortestUnsorted581View?.phase===v.phase&&s.shortestUnsorted581View.change?.kind==='visit'&&s.shortestUnsorted581View.current===Number(el.dataset.su581Item))));
  bind('[data-su581-case]',el=>{document.getElementById('arrInput').value=SU581_CASES[Number(el.dataset.su581Case)][0];if(typeof runViz==='function')runViz();});
}
