'use strict';
const MT654_CASES = [
  [[3,2,1,6,0,5],'Ví dụ · pop nhiều nút','Example · several pops'],
  [[1,2,3,4,5],'Lớn dần → nối trái','Increasing → attach left'],
  [[5,4,3,2,1],'Nhỏ dần → nối phải','Decreasing → attach right'],
  [[3,1,2],'Thay con phải cũ','Replace an old right child'],
  [[2,7,1,4,3,6,0],'Nhiều nhánh','Several branches'],
  [[0],'Một nút có giá trị 0','One node with value 0'],
];
function mt654Esc(value) { return String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function mt654Card(title, body, hint='') { return `<section class="tr-card"><header><b>${title}</b><small>${hint}</small></header>${body}</section>`; }
function mt654Chip(v,id,label='') { return `<span class="mt654-chip"><small>${label || (id===null?'None':'#'+id)}</small><b>${id===null?'∅':v.values[id]}</b></span>`; }
function mt654Scroll(key,body,cls='') { return `<div class="mt654-scroll ${cls}" data-mt654-scroll="${key}" tabindex="0">${body}</div>`; }
function mt654Tree(v,vi,selected) {
  if (!v.nodes.length) return mt654Card(vi?'Cây đang dựng':'Tree under construction','<div class="mt654-empty">∅</div>');
  const w=Math.max(350,v.values.length*74+65),h=Math.max(145,Math.max(...v.nodes.map(n=>n.depth))*84+112);
  const byId=new Map(v.nodes.map(n=>[n.id,n])),point=n=>({x:51+n.id*74,y:49+n.depth*84});
  const edges=v.nodes.flatMap(node=>['left','right'].filter(side=>node[side]!==null).map(side=>{
    const from=point(node),to=point(byId.get(node[side])),dx=to.x-from.x,dy=to.y-from.y,len=Math.hypot(dx,dy),ox=dx/len*25,oy=dy/len*25;
    const changed=v.change?.kind==='link'&&v.change.from===node.id&&v.change.side===side;
    return `<g class="mt654-edge is-${side} ${changed?'is-written':''}" data-edge-from="${node.id}" data-edge-to="${node[side]}" data-edge-side="${side}"><path d="M${from.x+ox},${from.y+oy}L${to.x-ox},${to.y-oy}" marker-end="url(#mt654-${side}-arrow)"/><text x="${(from.x+to.x)/2+(side==='left'?-9:9)}" y="${(from.y+to.y)/2-2}">${side==='left'?'L':'R'}</text></g>`;
  })).join('');
  const active=v.constructing??v.node;
  const nodes=v.nodes.map(node=>{const p=point(node);return `<g class="mt654-node ${v.stack?.includes(node.id)?'is-stacked':''} ${active===node.id?'is-active':''} ${node.id===selected?'is-selected':''} ${v.held===node.id?'is-held':''} ${v.root===node.id?'is-root':''}" data-mt654-node="${node.id}" data-node-id="${node.id}" data-node-value="${node.value}" data-node-left="${node.left??''}" data-node-right="${node.right??''}" role="button" tabindex="0" aria-label="Node ${node.value}, input index ${node.id}"><circle cx="${p.x}" cy="${p.y}" r="23"/><circle class="mt654-ring" cx="${p.x}" cy="${p.y}" r="28"/><text x="${p.x}" y="${p.y+5}">${node.value}</text><text class="mt654-small" x="${p.x}" y="${p.y+43}">#${node.id}${node.incoming>1?' · ×'+node.incoming:''}</text></g>`;}).join('');
  return mt654Card(vi?'Cây · con trỏ đang lưu thật':'Tree · actual stored pointers',mt654Scroll('tree',`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" ${v.values.length<=7?'style="width:100%;min-width:350px;height:auto"':''} role="group"><defs><marker id="mt654-left-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10Z"/></marker><marker id="mt654-right-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10Z"/></marker></defs>${edges}${nodes}</svg>`,'mt654-map')+`<div class="mt654-legend"><span class="is-left">L · left</span><span class="is-right">R · right</span><span class="is-gold">→ ${vi?'vừa đổi con trỏ':'pointer just changed'}</span></div>`,v.nodes.some(n=>n.incoming>1)?vi?'×2: hai con trỏ tạm trỏ cùng nút':'×2: two pointers temporarily reference one node':vi?'Vị trí ngang theo index đầu vào · chọn nút để xem con':'Horizontal position follows input index · select a node to inspect children');
}
function mt654Stack(v,vi) {
  return mt654Card(vi?'Stack giảm dần · TOP ↑':'Decreasing stack · TOP ↑',mt654Scroll('stack',`<div data-native-stack="stack" data-stack-values="${mt654Esc(JSON.stringify(v.stack))}">${v.stack?[...v.stack].reverse().map((id,k)=>`<button type="button" data-mt654-inspect="${id}" class="mt654-stack-item ${k?'':'is-top'}"><small>#${id}</small><b>${v.values[id]}</b><code>${k?'':'TOP'}</code></button>`).join('')||'∅':'—'}</div>`,'mt654-stack'));
}
function mt654Inspector(v,vi,selected) {
  const node=v.nodes.find(n=>n.id===selected);
  return mt654Card(vi?'Xem con trỏ của một nút':'Inspect a node’s pointers',node?`<div class="mt654-inspect" data-inspect-id="${node.id}" data-inspect-left="${node.left??''}" data-inspect-right="${node.right??''}">${mt654Chip(v,node.id)}<div class="mt654-children"><div><code>left</code>${mt654Chip(v,node.left)}</div><div><code>right</code>${mt654Chip(v,node.right)}</div></div></div>`:'<span>—</span>');
}
function mt654Next(kind) {
  if(typeof steps==='undefined')return -1;
  return steps.findIndex((s,i)=>i>stepIndex&&s.maximumTreeView&&(kind==='line'||kind==='create'&&s.maximumTreeView.change?.kind==='create'||kind==='pop'&&s.maximumTreeView.change?.kind==='pop'||kind==='link'&&s.maximumTreeView.change?.kind==='link'||kind==='result'&&s.final));
}
function mt654Go(index) { if(index<0||typeof steps==='undefined')return;if(typeof stopPlay==='function')stopPlay();stepIndex=index;renderStep(); }
function mt654Bind(host) {
  const bind=(selector,fn)=>host.querySelectorAll(selector).forEach(el=>{el.addEventListener('click',()=>fn(el));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();fn(el);}});});
  host.querySelectorAll('summary').forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')e.stopPropagation();}));
  bind('[data-mt654-jump]',el=>mt654Go(mt654Next(el.dataset.mt654Jump)));
  bind('[data-mt654-step]',el=>mt654Go(Number(el.dataset.mt654Step)));
  bind('[data-mt654-input]',el=>{const id=Number(el.dataset.mt654Input);mt654Go(steps.findIndex(s=>s.maximumTreeView.change?.kind==='create'&&s.maximumTreeView.change.index===id));});
  const inspect=id=>{if(typeof stopPlay==='function')stopPlay();renderMaximumTree654(steps[stepIndex],{selected:id});};
  bind('[data-mt654-node]',el=>inspect(Number(el.dataset.mt654Node)));
  bind('[data-mt654-inspect]',el=>inspect(Number(el.dataset.mt654Inspect)));
  bind('[data-mt654-case]',el=>{document.getElementById('arrInput').value=MT654_CASES[Number(el.dataset.mt654Case)][0].join(',');if(typeof runViz==='function')runViz();});
}
function renderMaximumTree654(step,options={}) {
  const v=step.maximumTreeView,host=document.getElementById('treeView');if(!v||!host)return;
  const vi=typeof lang!=='undefined'&&lang==='vi',open=host.querySelector('.mt654-native')?.open??false,historyOpen=host.querySelector('.mt654-history')?.open??false;
  const scrolls=new Map([...host.querySelectorAll('[data-mt654-scroll]')].map(el=>[el.dataset.mt654Scroll,{x:el.scrollLeft,y:el.scrollTop}]));
  const selected=options.selected??v.root??v.change?.from??v.constructing??v.node??v.roots[0]??null,c=v.comparison;
  const input=mt654Card('nums',mt654Scroll('input',v.values.map((value,i)=>`<button type="button" data-mt654-input="${i}" class="mt654-input ${i===v.current?'is-active':''} ${v.nodes.some(n=>n.id===i)?'is-created':''}"><small>[${i}]</small><b>${value}</b></button>`).join(''),'mt654-lane'),vi?'Chọn số → dòng tạo nút':'Select a value → its node creation line');
  const comparison=c&&(v.source.text.startsWith('while ')||v.change?.kind==='pop')?mt654Card('stack[-1].val < value',`<div class="mt654-equation">${c.top===null?'<b>∅ → STOP</b>':`${mt654Chip(v,c.top,'TOP')}<i>&lt;</i><span class="mt654-chip"><small>value</small><b>${c.right}</b></span><strong class="${c.pass?'is-gold':''}">${c.pass?'True ✓':'False ×'}</strong>`}</div>`):'';
  const write=v.change?.kind==='link'?mt654Card(`${v.values[v.change.from]}.${v.change.side}`,`<div class="mt654-equation" data-pointer-write-from="${v.change.from}" data-pointer-write-side="${v.change.side}" data-pointer-write-to="${v.change.to}">${mt654Chip(v,v.change.before,vi?'trước':'before')}<i>→</i>${mt654Chip(v,v.change.to,vi?'sau':'after')}</div>`):'';
  const jumps=[['line',vi?'Dòng →':'Line →'],['create',vi?'Tạo nút →':'Create →'],['pop','POP →'],['link',vi?'Nối →':'Link →'],['result',vi?'Kết quả ↠':'Result ↠']];
  host.innerHTML=`<article class="tr-viz mt654-viz" data-problem-id="654" data-source-line="${v.source.line}" role="region" aria-label="LeetCode 654 Maximum Binary Tree"><header class="tr-header"><div><small>LEETCODE 654 · MONOTONIC STACK</small><h2>${vi?'Mảng → Maximum Binary Tree':'Array → Maximum Binary Tree'}</h2></div><code>O(n)</code></header><nav class="tr-presets" aria-label="Examples">${MT654_CASES.map((c,i)=>`<button type="button" data-mt654-case="${i}">${c[vi?1:2]}</button>`).join('')}</nav><div class="tr-source"><span>${vi?'Sau dòng':'After line'} <b>L${v.source.line}</b></span><code>${mt654Esc(v.source.text)}</code>${v.branch===null?'':`<strong class="${v.branch?'is-good':'is-muted'}">${v.branch?'True ✓':'False ×'}</strong>`}</div><div class="mt654-work">${input}${mt654Tree(v,vi,selected)}${write}<div class="mt654-two">${mt654Stack(v,vi)}${mt654Card(vi?'Các biến đang trỏ tới đâu?':'Where do the variables point?',`<div class="mt654-pointers">${mt654Chip(v,v.node,'node')}${v.constructing===null?'':mt654Chip(v,v.constructing,'self · new')}${mt654Chip(v,v.popped,'popped')}${mt654Chip(v,v.result!==null?v.root:v.stack?.[0]??null,v.result!==null?'return':'stack[0]')}</div>`)}</div>${comparison}${mt654Inspector(v,vi,selected)}${v.inorder.length?mt654Card(vi?'Đọc cây: Trái → Gốc → Phải':'Read the tree: Left → Root → Right',mt654Scroll('inorder',v.inorder.map(value=>`<span>${value}</span>`).join(''),'mt654-inorder')+`<span class="mt654-hidden" data-inorder="${mt654Esc(JSON.stringify(v.inorder))}"></span>`,vi?'Khớp prefix của nums đã tạo':'Matches the created prefix of nums'):''}</div><details class="tr-native mt654-history"><summary>${vi?'Lịch sử nối nhánh':'Pointer assignment history'} · ${v.ledger.length}</summary><div class="mt654-ledger">${v.ledger.map(row=>`<button type="button" data-mt654-step="${row.step}"><small>${v.values[row.from]}.${row.side}</small><b>→ ${v.values[row.to]}</b></button>`).join('')||'∅'}</div></details><details class="tr-native mt654-native"><summary>${vi?'Biến Python · từng frame':'Python locals · every frame'}</summary>${v.frames.map(f=>`<div class="mt654-frame"><code>${mt654Esc(f.name)}</code><pre>${mt654Esc(JSON.stringify(f.locals,null,2))}</pre></div>`).join('')}</details>${v.result===null?'':`<output class="tr-answer" data-answer="${mt654Esc(JSON.stringify(v.result))}"><small>LeetCode · level-order</small><strong>${mt654Esc(JSON.stringify(v.result))}</strong></output>`}<footer class="tr-footer"><div>${jumps.map(([kind,label])=>`<button type="button" data-mt654-jump="${kind}" ${mt654Next(kind)<0?'disabled':''}>${label}</button>`).join('')}</div></footer></article>`;
  const details=host.querySelector('.mt654-native'),history=host.querySelector('.mt654-history');if(details)details.open=open;if(history)history.open=historyOpen;
  for(const el of host.querySelectorAll('[data-mt654-scroll]')){const saved=scrolls.get(el.dataset.mt654Scroll);if(saved){el.scrollLeft=saved.x;el.scrollTop=saved.y;}const active=el.querySelector('.is-selected')??el.querySelector('.is-active');if(active){const a=el.getBoundingClientRect(),b=active.getBoundingClientRect();if(b.left<a.left+5)el.scrollLeft-=a.left+5-b.left;if(b.right>a.right-5)el.scrollLeft+=b.right-a.right+5;if(b.top<a.top+5)el.scrollTop-=a.top+5-b.top;if(b.bottom>a.bottom-5)el.scrollTop+=b.bottom-a.bottom+5;}}
  mt654Bind(host);
}
