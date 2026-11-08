'use strict';

const SL1519_CASES = [
  [7,[[0,1],[0,2],[1,4],[1,5],[2,3],[2,6]],'abaedcd','Ví dụ','Example'],
  [4,[[0,1],[1,2],[0,3]],'bbbb','Cùng nhãn','Same label'],
  [5,[[0,1],[0,2],[1,3],[2,4]],'aabaa','Khác nhánh','Other branch'],
  [8,[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]],'abacabaa','Cây dạng chuỗi','Chain'],
  [1,[],'z','Một nút','One node'],
  [3,[[0,1],[0,2]],'zaz','Nhãn a và z','Labels a and z'],
];
function sl1519Esc(value) {
  return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function sl1519Color(letter) { return ['blue','purple','amber','red','green'][ (letter.charCodeAt(0)-97)%5 ]; }
function sl1519Fmt(value) { return value===null||value===undefined?'—':Array.isArray(value)?JSON.stringify(value):String(value); }
function sl1519IsMerging(v) {
  return v.merge&&v.scope==='dfs'&&['child_count = dfs(child, node)','for i in range(26):','count[i] += child_count[i]'].includes(v.source.text);
}
function sl1519Card(title,body,hint='',cls='') {
  return `<section class="tr-card ${cls}"><header><b>${title}</b><small>${hint}</small></header>${body}</section>`;
}
function sl1519Stat(name,value,cls='') {
  return `<div class="sl-stat ${cls}"><code>${name}</code><strong>${sl1519Esc(sl1519Fmt(value))}</strong></div>`;
}
function sl1519Tree(v,proofNode,letter,fit,vi) {
  const selected=v.nodes[proofNode],subtree=new Set(selected.descendants),matches=new Set(v.witnesses[proofNode][letter.charCodeAt(0)-97]);
  const waiting=new Set(v.path),known=new Set(v.completed),returning=v.change?.kind==='return',merge=v.merge;
  let flow=null;
  if(returning&&v.change.parent>=0)flow={from:v.change.node,to:v.change.parent};
  else if(sl1519IsMerging(v))flow={from:merge.child,to:merge.parent};
  const edges=v.nodes.filter(node=>node.parent>=0).map(node=>{
    const p=v.nodes[node.parent],built=v.graph?.[p.id]?.includes(node.id)&&v.graph?.[node.id]?.includes(p.id),active=flow?.from===node.id&&flow?.to===p.id;
    return `<path class="sl-edge ${built?'':'is-unbuilt'} ${subtree.has(node.id)&&subtree.has(p.id)?'is-subtree':''}" d="M${p.x},${p.y+24}L${node.x},${node.y-24}"/>${active?`<path class="sl-flow-edge" marker-end="url(#sl1519-arrow)" d="M${node.x},${node.y-26}L${p.x},${p.y+27}"/>`:''}`;
  }).join('');
  const marks=v.nodes.map(node=>`<g class="sl-node ${subtree.has(node.id)?'is-subtree':''} ${matches.has(node.id)?'is-matched':''} ${waiting.has(node.id)?'is-waiting':''} ${v.current===node.id?'is-current':''} ${node.id===proofNode?'is-proof-root':''}" data-sl-node="${node.id}" data-matched="${matches.has(node.id)}" role="button" tabindex="0" aria-label="Node ${node.id}, label ${node.label}" style="--sl-label:var(--tr-${sl1519Color(node.label)})" transform="translate(${node.x},${node.y})"><title>${node.id} · ${node.label}</title><circle class="sl-halo" r="29"/><circle class="sl-disc" r="23"/><text class="sl-label" y="6">${node.label}</text><text class="sl-id" y="40">#${node.id}</text>${known.has(node.id)?`<g class="sl-node-answer" transform="translate(21,-21)"><circle r="11"/><text y="4">${v.answer[node.id]}</text></g>`:''}</g>`).join('');
  return sl1519Card(vi?'Cây con · gốc 0':'Subtrees · root 0',`<div class="sl-tree-scroll ${fit?'is-fit':''}" data-sl-scroll="tree" tabindex="0"><svg class="sl-tree" width="${v.width}" height="${v.height}" viewBox="0 0 ${v.width} ${v.height}" role="group"><defs><marker id="sl1519-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10Z"/></marker></defs>${edges}${marks}</svg></div><div class="sl-legend"><span class="is-current">◉ ${vi?'đang chạy':'executing'}</span><span class="is-subtree">□ ${vi?'cây con đang xem':'subtree in view'}</span><span class="is-matched">● ${vi?'cùng nhãn đã cộng':'equal labels added'}</span></div><button type="button" class="sl-fit" data-sl-fit aria-pressed="${fit}">${fit?'1:1':vi?'⊡ Vừa chiều rộng':'⊡ Fit width'}</button>`,vi?'Chọn nút → dòng ghi answer của nút đó':'Select a node → its answer assignment');
}
function sl1519Frequency(v,name,count,node,letter,vi) {
  const focus=letter.charCodeAt(0)-97,indices=[...new Set([...v.labels].map(c=>c.charCodeAt(0)-97).concat(focus))].sort((a,b)=>a-b);
  const cell=i=>`<button type="button" class="sl-frequency ${i===focus?'is-selected':''} ${count[i]===0?'is-zero':''} ${node===v.current&&v.change?.index===i?'is-written':''}" data-sl-letter="${i}" data-frequency-index="${i}" data-frequency-value="${count[i]}" style="--sl-label:var(--tr-${sl1519Color(String.fromCharCode(97+i))})"><b>${String.fromCharCode(97+i)}</b><span class="sl-bar-track"><i style="height:${count[i]/v.n*56+3}px"></i></span><strong>${count[i]}</strong><small>[${i}]</small></button>`;
  return sl1519Card(sl1519Esc(name),`<div data-count-name="${sl1519Esc(name)}" data-native-count="${sl1519Esc(JSON.stringify(count))}">${count?`<div class="sl-frequencies" data-sl-scroll="${sl1519Esc(name)}" tabindex="0">${indices.map(cell).join('')}</div><details class="sl-alphabet" data-sl-details="${sl1519Esc(name)}"><summary>${vi?'Xem đủ 26 nhãn':'Show all 26 labels'}</summary><div class="sl-all-letters">${Array.from({length:26},(_,i)=>cell(i)).join('')}</div></details>`:`<div class="sl-placeholder">${vi?'Chưa có bảng đếm':'No count table yet'}</div>`}</div>`,node===null?'':`#${node} · ${v.labels[node]}`);
}
function sl1519Proof(v,node,letter,vi) {
  const index=letter.charCodeAt(0)-97,matches=v.witnesses[node][index],count=v.counts[node]?.[index],done=v.completed.includes(node);
  return sl1519Card(`${vi?'Đang nhìn':'Viewing'} #${node} · '${letter}'`,
    `<div class="sl-proof" data-proof-node="${node}" data-proof-letter="${letter}" data-match-ids="${matches.join(',')}"><span class="sl-letter-disc" style="--sl-label:var(--tr-${sl1519Color(letter)})">${letter}</span><div class="sl-match-nodes">${matches.map(id=>`<span><small>#${id}</small><b>${v.labels[id]}</b></span>`).join('')||'<i>∅</i>'}</div><strong>× ${sl1519Fmt(count)}</strong></div><div class="sl-proof-foot"><code>count['${letter}']</code><span>${done?'✓':vi?'Đang tích luỹ':'Accumulating'}</span></div>`,vi?'Chỉ các nút đã được cộng trong cây con này':'Only nodes already added within this subtree');
}
function sl1519Flow(v,vi) {
  const change=v.change,merge=v.merge;
  if(change?.kind==='return')return sl1519Card('↩ return count',`<div class="sl-return"><span>#${change.node}</span><i>↥</i><span>${change.parent>=0?'#'+change.parent:vi?'Hàm chính':'Main method'}</span></div>`,vi?'Cha sẽ cộng sau khi nhận child_count':'The parent merges after receiving child_count');
  if(change?.kind==='self')return sl1519Card(vi?'Cộng chính nút này':'Include this node',`<div class="sl-merge-equation"><code>count['${change.letter}']</code><span>${change.before}</span><i>+</i><b>1 · #${change.node}</b><i>=</i><strong>${change.after}</strong></div>`);
  if(!sl1519IsMerging(v))return '';
  const i=merge.cursor,pending=merge.after===null;
  return sl1519Card(vi?'Con → cha':'Child → parent',`<div class="sl-return"><span>#${merge.child}</span><i>↥</i><span>#${merge.parent}</span><small>${merge.progress} / 26</small></div><div class="sl-merge-progress"><i style="width:${merge.progress/26*100}%"></i></div>${i===null?`<div class="sl-merge-equation">${merge.progress===26?'✓ 26 / 26':vi?'Chuẩn bị gộp nhãn a':'Ready to merge label a'}</div>`:`<div class="sl-merge-equation" data-merge-letter="${i}"><code>${String.fromCharCode(97+i)} · [${i}]</code><span>${merge.before}</span><i>+</i><b>${merge.childCount[i]}</b><i>=</i><strong>${pending?'…':merge.after}</strong></div>`}`,vi?'Cộng từng ô của child_count vào count':'Add each child_count cell into count');
}
function sl1519Stack(v,vi) {
  const frames=v.frames.filter(f=>f.name==='dfs');
  return sl1519Card('DFS stack',`<div class="sl-stack" data-sl-scroll="stack" tabindex="0">${frames.map((f,i)=>`<button type="button" data-sl-entry="${f.locals.node}" class="${i===frames.length-1?'is-current':''}"><small>#${f.locals.node} · parent ${f.locals.parent}</small><b>${v.labels[f.locals.node]}</b></button>`).join('<i>→</i>')||'<span>∅</span>'}</div>${v.check?`<div class="sl-parent-check"><code>child ${v.check.child} == parent ${v.check.parent}</code><b>${v.check.skip?'True → continue':'False → dfs'}</b></div>`:''}`,vi?'Cha chờ con trả bảng đếm':'The parent waits for its child’s counts');
}
function sl1519Answer(v,vi) {
  return sl1519Card('answer',`<div class="sl-answer-array" data-native-answer="${sl1519Esc(JSON.stringify(v.answer))}" data-sl-scroll="answer" tabindex="0">${v.answer?v.answer.map((value,i)=>`<button type="button" data-sl-node="${i}" class="${v.completed.includes(i)?'is-complete':'is-pending'} ${v.current===i?'is-current':''}" data-answer-node="${i}" data-answer-value="${value}" data-committed="${v.completed.includes(i)}"><small>#${i} · ${v.labels[i]}</small><b>${value}</b><span>${v.completed.includes(i)?'✓':'…'}</span></button>`).join(''):'—'}</div>`,vi?'✓ = đã chạy dòng answer[node] = count[index]':'✓ = answer[node] = count[index] has executed');
}
function sl1519Graph(v,vi) {
  return sl1519Card(vi?'Dựng graph vô hướng':'Build the undirected graph',`<div class="sl-adjacency" data-native-graph="${sl1519Esc(JSON.stringify(v.graph))}">${v.graph?v.graph.map((neighbors,node)=>`<div><code>#${node}</code><span>${neighbors.map(id=>`<b>${id}</b>`).join('')||'[]'}</span></div>`).join(''):'—'}</div>`,'graph[u].append(v) · graph[v].append(u)');
}
function sl1519Next(kind) {
  if(typeof steps==='undefined')return -1;
  return steps.findIndex((s,index)=>index>stepIndex&&s.sameLabel1519View&&(kind==='line'||kind==='merge'&&s.sameLabel1519View.change?.kind==='merge'&&s.sameLabel1519View.change.addend>0||kind==='answer'&&s.sameLabel1519View.change?.kind==='answer'||kind==='return'&&s.sameLabel1519View.change?.kind==='return'||kind==='result'&&s.final));
}
function sl1519Go(index) {
  if(index<0||typeof steps==='undefined')return;
  if(typeof stopPlay==='function')stopPlay();
  stepIndex=index;renderStep();
}
function sl1519Bind(host,options) {
  host.querySelectorAll('summary').forEach(el=>el.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' ')e.stopPropagation();
  }));
  const bind=(selector,fn)=>host.querySelectorAll(selector).forEach(el=>{
    el.addEventListener('click',()=>fn(el));
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();fn(el);}});
  });
  bind('[data-sl-jump]',el=>sl1519Go(sl1519Next(el.dataset.slJump)));
  bind('[data-sl-node]',el=>sl1519Go(steps.findIndex(s=>s.sameLabel1519View?.change?.kind==='answer'&&s.sameLabel1519View.current===Number(el.dataset.slNode))));
  bind('[data-sl-entry]',el=>sl1519Go(steps.findIndex(s=>s.sameLabel1519View?.change?.kind==='enter'&&s.sameLabel1519View.current===Number(el.dataset.slEntry))));
  bind('[data-sl-letter]',el=>{if(typeof stopPlay==='function')stopPlay();renderSameLabel1519(steps[stepIndex],{...options,letter:Number(el.dataset.slLetter)});});
  bind('[data-sl-fit]',()=>{if(typeof stopPlay==='function')stopPlay();renderSameLabel1519(steps[stepIndex],{...options,fit:!options.fit});});
  bind('[data-sl-case]',el=>{
    const [n,edges,labels]=SL1519_CASES[Number(el.dataset.slCase)];
    document.getElementById('arrInput').value=n;
    document.getElementById('param-edges').value=JSON.stringify(edges);
    document.getElementById('param-labels').value=labels;
    if(typeof runViz==='function')runViz();
  });
}
function renderSameLabel1519(step,options={}) {
  const v=step.sameLabel1519View,host=document.getElementById('treeView');if(!v||!host)return;
  const vi=typeof lang!=='undefined'&&lang==='vi',proofNode=v.current??0;
  const fit=options.fit??host.querySelector('.sl-viz')?.dataset.fit==='true';
  const scrolls=new Map([...host.querySelectorAll('[data-sl-scroll]')].map(el=>[el.dataset.slScroll,{x:el.scrollLeft,y:el.scrollTop}]));
  const expanded=new Set([...host.querySelectorAll('[data-sl-details]')].filter(el=>el.open).map(el=>el.dataset.slDetails));
  const letter=String.fromCharCode(97+(options.letter??v.focusIndex)),count=v.counts[proofNode]??null;
  const phase=v.phase==='graph'?vi?'Dựng cây':'Build graph':v.phase==='done'?vi?'Hoàn tất':'Done':v.current===null?'countSubTrees':`dfs(${v.current}, ${v.locals.parent})`;
  const letterHint=options.letter===undefined?'':` · ${vi?'đang nhìn':'viewing'} '${letter}'`;
  const right=v.phase==='graph'?sl1519Graph(v,vi):sl1519Frequency(v,`count · #${proofNode}`,count,proofNode,letter,vi)+
    (sl1519IsMerging(v)?sl1519Frequency(v,`child_count · #${v.merge.child}`,v.childCount,v.merge.child,letter,vi):'')+sl1519Flow(v,vi);
  host.innerHTML=`<article class="tr-viz sl-viz" data-fit="${fit}" data-problem-id="1519" data-source-line="${v.source.line}" role="region" aria-label="LeetCode 1519"><header class="tr-header"><div><small>LEETCODE 1519 · POSTORDER DFS</small><h2>${vi?'Con đếm → cha gộp':'Child counts → parent merges'}</h2></div><code>${phase}</code></header><nav class="tr-presets" aria-label="Examples">${SL1519_CASES.map((c,i)=>`<button type="button" data-sl-case="${i}">${c[vi?3:4]}</button>`).join('')}</nav><div class="tr-source"><span>${vi?'Sau dòng':'After line'} <b>L${v.source.line}</b></span><code>${sl1519Esc(v.source.text)}</code>${v.branch===null?'':`<strong class="${v.branch?'is-good':'is-muted'}">${v.branch?'True ✓':'False ×'}</strong>`}</div><div class="sl-layout"><div class="sl-main">${sl1519Tree(v,proofNode,letter,fit,vi)}${sl1519Proof(v,proofNode,letter,vi)}${sl1519Stack(v,vi)}</div><div class="sl-side">${right}${sl1519Answer(v,vi)}</div></div><div class="sl-view-hint"><code>${v.scope}${letterHint}</code><small>${vi?'Gộp → chỉ nhảy tới phép cộng khác 0; Dòng → vẫn giữ mọi vòng lặp.':'Merge → jumps to a nonzero addition; Line → retains every loop iteration.'}</small></div><details class="tr-native sl-native" data-sl-details="native"><summary>${vi?'Biến Python · từng frame':'Python locals · each frame'}</summary>${v.frames.map(f=>`<div class="sl-frame"><code>${sl1519Esc(f.name)}</code><pre>${sl1519Esc(JSON.stringify(f.locals,null,2))}</pre></div>`).join('')}</details>${v.result===null?'':`<output class="tr-answer" data-answer="${sl1519Esc(JSON.stringify(v.result))}"><small>${vi?'Kết quả':'Result'}</small><strong>${JSON.stringify(v.result)}</strong></output>`}<footer class="tr-footer"><div>${[['line',vi?'Dòng →':'Line →'],['merge',vi?'Gộp →':'Merge →'],['answer','answer →'],['return','↩ return →'],['result',vi?'Kết quả ↠':'Result ↠']].map(([key,label])=>`<button type="button" data-sl-jump="${key}" ${sl1519Next(key)<0?'disabled':''}>${label}</button>`).join('')}</div></footer></article>`;
  for(const el of host.querySelectorAll('[data-sl-details]'))el.open=expanded.has(el.dataset.slDetails);
  for(const el of host.querySelectorAll('[data-sl-scroll]')){
    const saved=scrolls.get(el.dataset.slScroll);if(saved){el.scrollLeft=saved.x;el.scrollTop=saved.y;}
    const selected=el.classList.contains('sl-frequencies')?el.querySelector('.is-selected'):el.querySelector('button.is-current');
    if(selected){const a=el.getBoundingClientRect(),b=selected.getBoundingClientRect();if(b.left<a.left+4)el.scrollLeft-=a.left+4-b.left;if(b.right>a.right-4)el.scrollLeft+=b.right-a.right+4;}
  }
  const tree=host.querySelector('.sl-tree-scroll'),current=tree?.querySelector(`.sl-node[data-sl-node="${v.current}"]`);
  if(tree&&current){const a=tree.getBoundingClientRect(),b=current.getBoundingClientRect();if(b.left<a.left+12)tree.scrollLeft-=a.left+12-b.left;if(b.right>a.right-12)tree.scrollLeft+=b.right-a.right+12;if(b.top<a.top+12)tree.scrollTop-=a.top+12-b.top;if(b.bottom>a.bottom-12)tree.scrollTop+=b.bottom-a.bottom+12;}
  sl1519Bind(host,{...options,fit});
}
