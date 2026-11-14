'use strict';
// Pictures use the recorded state, including intermediate pointer writes.
function lsText(vi, en) { return typeof lang !== 'undefined' && lang === 'vi' ? vi : en; }
function lsEscape(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function lsRef(value) { return value && typeof value === 'object' ? value.id ?? null : null; }
function lsView(step) {
  if (step?.linkedStoryView) return step.linkedStoryView;
  const raw = step?.linkedDesignView || step?.dllRoadmapView;
  if (!raw || ![707, 1823, 2296].includes(raw.id)) return null;
  return { ...raw, nodes: raw.nodes.map(n => ({ id: n.id, value: n.fields.val, next: lsRef(n.fields.next), prev: lsRef(n.fields.prev) })),
    current: raw.id === 2296 ? lsRef(raw.state.cursor) : lsRef(raw.locals.current), order: raw.items };
}
function lsTargets(timeline) {
  const operations = new Map(), starts = new Map(), milestones = [];
  let merges = 0;
  timeline.forEach((step, i) => {
    const v = lsView(step); if (!v) return;
    if (Number.isInteger(v.operationIndex)) {
      if (!starts.has(v.operationIndex)) starts.set(v.operationIndex, i);
      operations.set(v.operationIndex, i);
    }
    if (v.id === 3507 && v.merges > merges) { milestones.push({ index: i, label: String(v.merges) }); merges = v.merges; }
    if (v.id === 1823 && v.change?.kind === 'remove') milestones.push({ index: i, label: String(v.nodes.find(n => n.id === v.change.node)?.value ?? '—') });
    if (v.id === 430 && (step.codeLines || []).includes(24)) milestones.push({ index: i, label: String(milestones.length + 1) });
  });
  return { operations, starts, milestones };
}
function lsOpLabel(op) {
  if (!op) return '∅';
  if (op.label) return op.label;
  if (op.op === 'init') return op.url;
  if (op.tokenId !== undefined) return `${op.op} ${op.tokenId} · ${op.time}`;
  if (op.op === 'countunexpiredtokens') return `count · ${op.time}`;
  return `${op.op} ${op.url ?? op.steps ?? ''}`;
}
function lsCard(title, body, extra = '') { return `<section class="ls-card ${extra}"><header>${title}</header>${body}</section>`; }
function lsEmpty() { return `<div class="ls-empty">∅</div>`; }
function lsNode(node, index, selected, extra = '', label = '') {
  return `<button type="button" class="ls-node ${String(node.id) === selected ? 'selected' : ''} ${extra}" data-ls-node="${lsEscape(node.id)}" aria-label="${lsEscape(label || `${index}: ${node.value ?? '…'}`)}"><small>${lsEscape(label || index)}</small><b>${lsEscape(node.value ?? '…')}</b></button>`;
}
function lsChain(nodes, selected, bindings = {}, sentinel = null, compact = false) {
  return `<div class="ls-scroll"><div class="ls-chain ${compact ? 'compact' : ''}">${nodes.map((n, i) => {
    const labels = Object.entries(bindings).filter(([, id]) => id === n.id).map(([name]) => name).join(' · ');
    const next = nodes[i + 1];
    const position=n.id===sentinel?'dummy':sentinel!==null?i-1:i;
    return `${lsNode(n, position, selected, n.id === sentinel ? 'sentinel' : '', labels ? `${position} · ${labels}` : '')}${next ? `<span class="ls-links"><i>${n.next === next.id ? '→' : '⋯'}</i><i class="${next.prev === n.id ? '' : 'pending'}">${next.prev === n.id ? '←' : '⋯'}</i></span>` : ''}`;
  }).join('') || lsEmpty()}</div></div>`;
}
function lsTokenPicture(v, step, selected) {
  const time = v.time, entries = v.entries, op = v.operations[v.operationIndex];
  const min = Math.min(0, ...entries.map(e => e.expiry - v.ttl)), max = Math.max(1, time ?? 0, ...entries.map(e => e.expiry));
  const x = n => 30 + (n - min) / (max - min || 1) * 540;
  const live = entries.filter(e => e.expiry > time).length;
  const clock = `<div class="ls-metrics"><span><small>${lsText('Thời điểm', 'Time')}</small><b>t=${time ?? '—'}</b></span><span><small>TTL</small><b>${v.ttl}</b></span><span class="good"><small>${lsText('Còn hạn', 'Valid')} · expiry &gt; t</small><b>${time === null ? '—' : live}</b></span></div>`;
  const rows = entries.map(e => {
    const active = time !== null && e.expiry > time;
    return `<div class="ls-token ${active ? 'alive' : 'expired'}" data-token="${lsEscape(e.id)}" data-expiry="${e.expiry}"><button type="button" class="${selected === String(e.id) ? 'selected' : ''}" data-ls-node="${lsEscape(e.id)}">${lsEscape(e.id)}</button><div class="ls-scroll"><svg viewBox="0 0 600 66" preserveAspectRatio="none" role="img" aria-label="${lsEscape(e.id)}: ${e.expiry-v.ttl} → ${e.expiry}"><line class="ls-axis" x1="25" y1="30" x2="575" y2="30"/><rect class="ls-life" x="${x(e.expiry-v.ttl)}" y="21" width="${Math.max(2,x(e.expiry)-x(e.expiry-v.ttl))}" height="18" rx="9"/><circle class="ls-expiry" cx="${x(e.expiry)}" cy="30" r="6"/><text x="${x(e.expiry-v.ttl)}" y="60" text-anchor="start">${e.expiry-v.ttl}</text><text x="${x(e.expiry)}" y="14" text-anchor="end">${e.expiry}</text>${time === null ? '' : `<path class="ls-now" d="M${x(time)},4 V49"/><text class="ls-now-text" x="${Math.min(566,x(time)+6)}" y="60" text-anchor="${x(time)>540?'end':'start'}">t=${time}</text>`}</svg></div><strong><b>${e.expiry}</b><small>${active ? `+${e.expiry-time}` : lsText('Hết hạn', 'Expired')}</small></strong></div>`;
  }).join('');
  const missing = op?.tokenId && !entries.some(e => e.id === op.tokenId) ? `<div class="ls-callout">${lsEscape(op.tokenId)} → ∅</div>` : '';
  const count = step.vars?.find(x => x.name === 'answer' || x.name === 'count');
  const result = count ? `<div class="ls-equation">${lsEscape(count.name)} <i>→</i> <b>${lsEscape(count.value)}</b></div>` : '';
  const queue = v.approach === 2 ? lsCard('head → tail', `<div class="ls-scroll"><div class="ls-queue">${(v.order || []).map(id=>`<span>${lsEscape(id)}</span>`).join('<i>⇄</i>')}</div></div>`) : '';
  return clock + lsCard(lsText('Hạn của từng token · ● mốc hết hạn', 'Token lifetimes · ● expiry'), rows || lsEmpty()) + missing + result + queue;
}
function lsCircleState(v, timeline, index) {
  const removed = new Set(), history = [];
  for (let i = 0; i <= index; i++) {
    const a = lsView(timeline[i]); if (a?.id !== 1823 || a.change?.kind !== 'remove') continue;
    removed.add(a.change.node); history.push({ id: a.change.node, index: i, value: a.nodes.find(n => n.id === a.change.node)?.value });
  }
  return { removed, history };
}
function lsCirclePicture(v, step, timeline, index, selected) {
  const { removed, history } = lsCircleState(v, timeline, index), n = v.locals.n ?? v.outer.n, k = v.locals.k ?? v.outer.k;
  const byId = new Map(v.nodes.map(node => [node.id, node]));
  const point = value => { const a = -Math.PI/2 + (value-1)*Math.PI*2/n; return { x: 240+165*Math.cos(a), y: 225+165*Math.sin(a) }; };
  const edges = v.nodes.filter(node=>!removed.has(node.id)).map(node=>{
    const next=byId.get(node.next); if (!next || removed.has(next.id)) return '';
    const a=point(node.value), b=point(next.value), dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy), write=v.change?.kind==='link'&&v.change.node===node.id&&v.change.field==='next';
    if (!d) return `<path class="ls-edge ${write?'written':''}" d="M${a.x+27},${a.y-13} c55,-45 55,65 0,40" marker-end="url(#ls-arrow)"/>`;
    return `<path class="ls-edge ${write?'written':''}" d="M${a.x+dx/d*32},${a.y+dy/d*32} L${b.x-dx/d*38},${b.y-dy/d*38}" marker-end="url(#ls-arrow)"/>`;
  }).join('');
  const people=Array.from({length:n},(_,i)=>{
    const node=v.nodes.find(node=>node.value===i+1), p=point(i+1), out=node&&removed.has(node.id), current=node?.id===v.current;
    return `<g class="ls-person ${out?'removed':''} ${current?'current':''} ${!node?'unbuilt':''} ${selected===node?.id?'selected':''}"><circle cx="${p.x}" cy="${p.y}" r="29"/><text x="${p.x}" y="${p.y+7}" text-anchor="middle">${out?'×':i+1}</text>${current?`<text class="ls-current-label" x="${p.x}" y="${p.y-39}" text-anchor="middle">current</text>`:''}</g>`;
  }).join('');
  const round=v.change?.kind==='remove'?lsText('Loại', 'Out'):step.final?lsText('Người thắng','Winner'):lsText('Đang đếm','Counting');
  const focus=v.change?.kind==='remove'?byId.get(v.change.node)?.value:byId.get(v.current)?.value;
  return `<div class="ls-metrics"><span><small>n</small><b>${n}</b></span><span><small>k</small><b>${k}</b></span><span class="good"><small>${lsText('Còn lại','Remaining')}</small><b>${v.locals.remaining??'—'}</b></span></div>`+
    lsCard(lsText('Đi theo mũi tên · đếm đến k thì loại', 'Follow the arrows · every kth player leaves'), `<div class="ls-circle"><svg viewBox="0 0 480 455" role="img" aria-label="${lsText('Vòng tròn người chơi','Circle of players')}"><defs><marker id="ls-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z"/></marker></defs>${edges}<text class="ls-circle-caption" x="240" y="212" text-anchor="middle">${round}</text><text class="ls-circle-focus" x="240" y="257" text-anchor="middle">${focus??'…'}</text>${people}</svg></div>`)+
    lsCard(lsText('Thứ tự bị loại','Elimination order'), `<div class="ls-rounds">${history.map(h=>`<button type="button" data-ls-go="${h.index}" data-ls-control="round-${h.index}"><small>×</small><b>${h.value}</b></button>`).join('<i>→</i>')||lsEmpty()}${step.final?`<strong class="ls-winner">♛ ${v.result}</strong>`:''}</div>`);
}
function lsListPicture(v, step, timeline, targets, selected) {
  const byId = new Map(v.nodes.map(n=>[n.id,n])), sentinel=v.sentinels[0]??null;
  const chain=v.chain.map(id=>byId.get(id)).filter(Boolean), start=targets.starts.get(v.operationIndex), before=start===undefined?null:lsView(timeline[start]);
  const result=v.outputs.length>v.operationIndex&&v.operationIndex>=0?v.outputs[v.operationIndex]:null;
  const beforeHtml=before&&v.operationIndex>=0?lsCard(lsText('Trước lệnh','Before this call'),lsChain(before.order.map(id=>before.nodes.find(n=>n.id===id)).filter(Boolean),'',{},null,true),'ls-before'):'';
  const relevant=new Set(Object.values(v.bindings||{})); if(v.change?.node)relevant.add(v.change.node);
  const detached=v.nodes.filter(node=>!v.chain.includes(node.id)&&relevant.has(node.id));
  return `<div class="ls-metrics"><span><small>size</small><b>${v.size??'—'}</b></span><span><small>${lsText('Node đang nối','Linked nodes')}</small><b>${v.order.length}</b></span>${v.operation?.name==='get'&&v.outputs.length>v.operationIndex?`<span class="${result===-1?'bad':'good'}"><small>get →</small><b>${result}</b></span>`:''}</div>`+beforeHtml+
    lsCard(lsText('Danh sách hiện tại · index bắt đầu từ 0','Current list · index starts at 0'),lsChain(chain,selected,v.bindings,sentinel),'ls-current-chain')+
    (detached.length?lsCard(lsText('Node đang thao tác ngoài chuỗi','Node outside the current chain'),lsChain(detached,selected,v.bindings,null),'ls-detached'):'');
}
function lsHistoryPicture(v, step, timeline, targets, selected) {
  const current=v.nodes.find(n=>n.id===v.current), active=v.order.map(id=>v.nodes.find(n=>n.id===id)).filter(Boolean);
  const start=targets.starts.get(v.operationIndex), before=start===undefined?null:lsView(timeline[start]), op=v.operations[v.operationIndex];
  const oldCurrent=before?.order.indexOf(before.current)??-1;
  const dropped=op?.op==='visit'&&before?before.order.slice(oldCurrent+1).map(id=>before.nodes.find(n=>n.id===id)).filter(Boolean):[];
  const isDropping=n=>dropped.some(old=>old.id===n.id&&old.url===n.url);
  const preview=`<div class="ls-browser"><div class="ls-browser-bar"><span>● ● ●</span><b>←　→</b><code>${lsEscape(current?.url||'…')}</code></div><div class="ls-browser-page"><span>▤</span><strong>${lsEscape(current?.url||lsText('Đang khởi tạo','Initializing'))}</strong><small>${v.approach===1?'history[index]':'curr'}</small></div></div>`;
  const rail=`<div class="ls-scroll"><div class="ls-pages">${active.map((n,i)=>`<button type="button" data-ls-node="${lsEscape(n.id)}" data-page-url="${lsEscape(n.url)}" class="ls-page ${n.id===v.current?'current':''} ${isDropping(n)?'to-remove':''} ${selected===String(n.id)?'selected':''}"><small>${i} ${n.id===v.current?' · '+lsText('Bạn ở đây','You are here'):''}</small><span>▤</span><b>${lsEscape(n.url||'…')}</b></button>`).join(`<i>${v.approach===1?'→':'⇄'}</i>`)||lsEmpty()}</div></div>`;
  const extra=v.nodes.filter(n=>!v.order.includes(n.id)&&!dropped.some(old=>old.id===n.id&&old.url===n.url));
  return preview+lsCard(v.approach===1?'Array + index':'Doubly linked list',rail)+
    (dropped.length?lsCard(lsText('visit mới → bỏ lịch sử phía trước','New visit → discard forward history'),`<div class="ls-discarded">${dropped.map(n=>`<span>× ${lsEscape(n.url)}</span>`).join('')}</div>`):'')+
    (extra.length?lsCard(lsText('Node ngoài chuỗi','Nodes outside the chain'),`<div class="ls-discarded pending">${extra.map(n=>`<span>▤ ${lsEscape(n.url||'…')}</span>`).join('')}</div>`):'');
}
function lsMultilevelLayout(v) {
  const byId=new Map(v.nodes.map(n=>[n.id,n])), points=new Map(), used=new Set();
  function place(id,col,row) {
    if(id===null||!byId.has(id)||points.has(id))return;
    while(used.has(`${col}:${row}`))col++;
    points.set(id,{x:55+col*96,y:48+row*105});used.add(`${col}:${row}`);
    const n=byId.get(id);place(n.next,col+1,row);place(n.child,col,row+1);
  }
  place(v.head,0,0);
  for(const n of v.nodes)if(!points.has(n.id))place(n.id,0,Math.max(0,...[...points.values()].map(p=>Math.round((p.y-48)/105)))+1);
  return {points,width:Math.max(300,...[...points.values()].map(p=>p.x+55)),height:Math.max(110,...[...points.values()].map(p=>p.y+60))};
}
function lsMultilevelSvg(v, step, selected, mini=false) {
  const {points,width,height}=lsMultilevelLayout(v), hl=step.graph?.hlNodes||[];
  const saved=new Map();
  if(!mini)for(const frame of v.frames||[])if(frame.nxt!==null&&v.nodes.find(n=>n.id===frame.cur)?.next!==frame.nxt){
    const root=v.nodes.find(n=>n.id===frame.root)?.value;
    saved.set(frame.nxt,`nxt · dfs(${root})`);
  }
  const edges=v.nodes.flatMap(n=>['next','child'].flatMap(field=>{
    const a=points.get(n.id),b=points.get(n[field]);if(!a||!b)return[];
    const child=field==='child';
    const d=child?(b.y>a.y?`M${a.x},${a.y+25} V${b.y-34} H${b.x}`:`M${a.x},${a.y+25} C${a.x},${a.y+65} ${b.x},${b.y+65} ${b.x},${b.y+32}`):a.y===b.y&&b.x>a.x?`M${a.x+27},${a.y} H${b.x-34}`:`M${a.x+27},${a.y} C${a.x+65},${a.y} ${b.x-65},${b.y} ${b.x-34},${b.y}`;
    return `<path class="ls-edge ${child?'child':''}" data-edge-kind="${field}" d="${d}" marker-end="url(#ls-${mini?'mini-':''}${field})"/>${child?`<text class="ls-child-label" x="${a.x+8}" y="${a.y+53}">child</text>`:''}`;
  })).join('');
  return `<div class="ls-scroll"><svg class="ls-multilevel ${mini?'mini':''}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${lsText('Danh sách nhiều tầng','Multilevel list')}"><defs>${['next','child'].map(field=>`<marker id="ls-${mini?'mini-':''}${field}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path class="${field}" d="M0,0 L10,5 L0,10 Z"/></marker>`).join('')}</defs>${edges}${v.nodes.map(n=>{const p=points.get(n.id),ann=saved.get(n.id)||step.graph?.annotations?.[n.id]||'';return `<g class="ls-graph-node ${hl.includes(n.id)?'active':''} ${selected===String(n.id)?'selected':''}"><rect x="${p.x-27}" y="${p.y-25}" width="54" height="50" rx="12"/><text x="${p.x}" y="${p.y+7}" text-anchor="middle">${lsEscape(n.value)}</text><text class="ls-binding" x="${p.x}" y="${p.y-33}" text-anchor="middle">${lsEscape(ann)}</text></g>`;}).join('')}</svg></div>`;
}
function lsMultilevelPicture(v,step,timeline,selected) {
  const initial=lsView(timeline[0]), childCount=v.nodes.filter(n=>n.child!==null).length;
  return `<div class="ls-metrics"><span><small>${lsText('Node','Nodes')}</small><b>${v.nodes.length}</b></span><span class="${childCount?'':'good'}"><small>child ≠ None</small><b>${childCount}</b></span></div>`+
    (initial?`<details class="ls-details"><summary>${lsText('Cấu trúc ban đầu','Original structure')}</summary>${lsMultilevelSvg(initial,timeline[0],'',true)}</details>`:'')+
    lsCard(`<span class="good">→ next</span>　<span class="purple">↓ child</span>`,lsMultilevelSvg(v,step,selected))+
    lsCard(lsText('Chạm node để xem con trỏ','Choose a node to inspect pointers'),`<div class="ls-node-picker">${v.nodes.map(n=>`<button type="button" data-ls-node="${lsEscape(n.id)}" class="${selected===String(n.id)?'selected':''}">${lsEscape(n.value)}</button>`).join('')||lsEmpty()}</div>`);
}
function lsPairPicture(v,step,timeline,index,selected,targets) {
  const nodes=v.nodes, pairs=nodes.slice(0,-1).map((node,i)=>({left:node,right:nodes[i+1],sum:node.value+nodes[i+1].value,index:i}));
  const best=Object.entries(step.graph?.annotations||{}).find(([,label])=>label==='best')?.[0], hl=step.graph?.hlNodes||[];
  const row=`<div class="ls-scroll"><div class="ls-pair-row">${nodes.map((n,i)=>`${lsNode(n,i,selected,hl.includes(n.id)?'active':'')}${i<nodes.length-1?`<span class="ls-comparison ${n.value>nodes[i+1].value?'bad':'good'}">${n.value>nodes[i+1].value?'>':'≤'}</span>`:''}`).join('')||lsEmpty()}</div></div>`;
  const pairCards=`<div class="ls-scroll"><div class="ls-pairs">${pairs.map(p=>`<div class="ls-pair ${String(p.left.id)===best?'best':''} ${hl.includes(p.left.id)&&hl.includes(p.right.id)?'active':''}" data-pair-index="${p.index}"><small>[${p.index}, ${p.index+1}] ${String(p.left.id)===best?' · best':''}</small><span>${p.left.value} + ${p.right.value}</span><b>${p.sum}</b></div>`).join('')||lsEmpty()}</div></div>`;
  const last=targets.milestones.filter(m=>m.index<=index).at(-1);
  let merge='';
  if(last){const before=lsView(timeline[last.index-1]),after=lsView(timeline[last.index]);const left=before.nodes.find(n=>after.nodes.some(a=>a.id===n.id&&a.value!==n.value)),pos=left?before.nodes.indexOf(left):-1;
    // A zero-valued neighbour may leave the retained node's value unchanged.
    const removed=before.nodes.find(n=>!after.nodes.some(a=>a.id===n.id)),rpos=removed?before.nodes.indexOf(removed):-1,a=pos>=0?left:before.nodes[rpos-1],b=a?before.nodes[before.nodes.indexOf(a)+1]:null;
    if(a&&b)merge=lsCard(lsText('Lần gộp gần nhất','Latest merge'),`<div class="ls-equation"><span>${a.value}</span><i>+</i><span>${b.value}</span><i>→</i><b>${a.value+b.value}</b></div>`);
  }
  return `<div class="ls-metrics"><span><small>${lsText('Số lần gộp','Merges')}</small><b>${v.merges}</b></span><span class="${pairs.some(p=>p.left.value>p.right.value)?'bad':'good'}"><small>${lsText('Nghịch thế','Inversions')}</small><b>${pairs.filter(p=>p.left.value>p.right.value).length}</b></span></div>`+
    lsCard(lsText('Mảng hiện tại','Current array'),row)+lsCard(lsText('Tổng cặp kề nhau · hoà → chọn bên trái','Adjacent sums · ties → leftmost'),pairCards)+merge;
}
const LS_PRESETS = {
  1797:[['generate aaa 2 | countUnexpiredTokens 6 | generate bbb 7 | renew aaa 8 | renew bbb 10 | countUnexpiredTokens 15',{ttl:5},'Ví dụ','Example'],['generate a 1 | renew a 6 | countUnexpiredTokens 7',{ttl:5},'Đúng mốc hết hạn','At expiry'],['generate a 1 | renew a 3 | countUnexpiredTokens 7 | countUnexpiredTokens 8',{ttl:5},'Gia hạn','Renew']],
  1823:[[5,{k:2},'5 người · k=2','5 players · k=2'],[6,{k:5},'Quấn vòng','Wrap around'],[1,{k:1},'Một người','One player']],
  430:[['1,2,3,4,5,6',{children:'3:7,8,9,10;8:11,12'},'Ba tầng','Three levels'],['1,2,3',{children:'1:4,5;4:6'},'Child lồng nhau','Nested children'],['1,2,3',{children:''},'Một tầng','One level']],
  707:[['[["addAtHead",1],["addAtTail",3],["addAtIndex",1,2],["get",1],["deleteAtIndex",1],["get",1]]',{},'Ví dụ','Example'],['[["get",0],["addAtIndex",1,9],["addAtHead",7],["deleteAtIndex",0],["get",0]]',{},'Biên / rỗng','Bounds / empty'],['[["addAtTail",5],["addAtTail",5],["addAtIndex",1,0],["deleteAtIndex",2],["get",1]]',{},'Giá trị trùng','Duplicate values']],
  1472:[['leetcode.com | visit google.com | visit facebook.com | visit youtube.com | back 1 | back 1 | forward 1 | visit linkedin.com | forward 2 | back 2 | back 7',{},'Ví dụ','Example'],['home | visit a | visit b | back 2 | visit c | forward 9',{},'Cắt nhánh cũ','Discard forward'],['home | back 9 | forward 9 | visit a | back 9 | forward 9',{},'Chặn hai đầu','Clamp both ends']],
  3507:[['5,2,3,1',{},'Ví dụ','Example'],['2,1,2,1',{},'Tổng bằng nhau','Equal sums'],['-2,3,-1,0',{},'Số âm / 0','Negative / zero']],
  2296:[['[["addText","leetcode"],["deleteText",4],["addText","practice"],["cursorRight",3],["cursorLeft",8],["deleteText",10],["cursorLeft",2],["cursorRight",6]]',{},'Ví dụ','Example'],['[["addText","abcd"],["cursorLeft",2],["addText","xy"],["cursorRight",9],["deleteText",2]]',{},'Chèn giữa','Insert in middle'],['[["deleteText",5],["addText","abc"],["cursorLeft",9],["deleteText",9],["cursorRight",9]]',{},'Chặn hai đầu','Clamp both ends']],
};
function lsEditorPicture(v,step,timeline,targets,selected) {
  const nodes=v.order.map(id=>v.nodes.find(n=>n.id===id)).filter(Boolean), head=v.sentinels[0], cursorIndex=nodes.findIndex(n=>n.id===v.current), boundary=v.current===head?0:cursorIndex>=0?cursorIndex+1:null;
  const left=boundary===null?[]:nodes.slice(Math.max(0,boundary-10),boundary), context=new Set(left.map(n=>n.id));
  const caret=`<span class="ls-caret" aria-label="${lsText('Vị trí con trỏ','Cursor position')}"><i></i><small>cursor</small></span>`;
  const paper=`<div class="ls-scroll"><div class="ls-paper">${boundary===0?caret:''}${nodes.map((n,i)=>`${lsNode(n,i,selected,context.has(n.id)?'context':'')}${boundary===i+1?caret:''}`).join('')}${!nodes.length&&boundary!==0?lsEmpty():''}</div></div>`;
  const result=v.operationIndex>=0&&v.outputs.length>v.operationIndex?v.outputs[v.operationIndex]:null;
  return lsCard(lsText('Nội dung · con trỏ nằm sau node cursor','Text · caret sits after the cursor node'),paper)+
    (boundary===null&&v.current?`<div class="ls-callout">cursor → ${lsEscape(v.nodes.find(n=>n.id===v.current)?.value??'…')} · ${lsText('đang nối lại','relinking')}</div>`:'')+
    lsCard(lsText('Tối đa 10 ký tự bên trái con trỏ','Up to 10 characters left of the cursor'),`<div class="ls-context">${left.map(n=>`<span>${lsEscape(n.value)}</span>`).join('')||'<span>∅</span>'}</div>`)+
    (result!==null?`<div class="ls-equation"><small>return</small><i>→</i><b>${typeof result==='string'?`“${lsEscape(result)}”`:result}</b></div>`:'');
}
function renderLinkedStoryPictures(step) {
  const host=$('treeView'); if(!host)return;
  const v=lsView(step); if(!v)return;
  const timeline=typeof steps!=='undefined'?steps:[step], index=typeof stepIndex==='number'?stepIndex:0, targets=lsTargets(timeline), esc=lsEscape;
  const entities=v.id===1797?v.entries:v.nodes;
  const ids=entities.map(n=>String(n.id)), requested=host.dataset.lsSelectedState;
  const suggested=v.bindings?.node??v.current??step.graph?.hlNodes?.[0];
  const selected=host.dataset.lsProblemState===String(v.id)&&ids.includes(requested)?requested:ids.includes(String(suggested))?String(suggested):ids[0]??'';
  host.dataset.lsProblemState=String(v.id);
  const titles={1797:['Vé vào cửa & thời hạn','Tokens & expiry'],1823:['Đếm vòng tròn','Count around the circle'],430:['Trải phẳng từng tầng','Flatten each level'],707:['Nối & tháo node','Link & unlink nodes'],1472:['Dòng lịch sử duyệt web','Browser history trail'],3507:['Hai số → một node','Two numbers → one node'],2296:['Soạn thảo bằng con trỏ','Edit with a cursor']};
  const op=v.operations?.[v.operationIndex], title=op?lsOpLabel(op):lsText(...titles[v.id]);
  const play=`<nav class="ls-play" aria-label="${lsText('Điều khiển từng bước','Step controls')}"><button type="button" data-ls-go="0" data-ls-control="first" aria-label="${lsText('Về đầu','First step')}" ${index===0?'disabled':''}>↤</button><button type="button" data-ls-go="${index-1}" data-ls-control="previous" aria-label="${lsText('Bước trước','Previous step')}" ${index===0?'disabled':''}>←</button><span>${index+1} / ${timeline.length}</span><button type="button" data-ls-go="${index+1}" data-ls-control="next" aria-label="${lsText('Bước tiếp','Next step')}" ${index===timeline.length-1?'disabled':''}>→</button><button type="button" data-ls-go="${timeline.length-1}" data-ls-control="last" aria-label="${lsText('Tới cuối','Last step')}" ${index===timeline.length-1?'disabled':''}>↦</button></nav>`;
  const ops=v.operations?.length?`<div class="ls-scroll"><nav class="ls-operations">${v.operations.map((o,i)=>`<button type="button" data-ls-operation="${i}" class="${v.operationIndex===i?'selected':''}" aria-current="${v.operationIndex===i?'step':'false'}"><small>${i+1}</small><b>${esc(lsOpLabel(o))}</b>${v.outputs.length>i&&v.outputs[i]!==null?`<em>→ ${esc(v.outputs[i])}</em>`:''}</button>`).join('')}</nav></div>`:'';
  const builders={1797:()=>lsTokenPicture(v,step,selected),1823:()=>lsCirclePicture(v,step,timeline,index,selected),430:()=>lsMultilevelPicture(v,step,timeline,selected),707:()=>lsListPicture(v,step,timeline,targets,selected),1472:()=>lsHistoryPicture(v,step,timeline,targets,selected),3507:()=>lsPairPicture(v,step,timeline,index,selected,targets),2296:()=>lsEditorPicture(v,step,timeline,targets,selected)};
  const node=entities.find(n=>String(n.id)===selected), selectedInfo=node?`<div class="ls-inspector"><b>${esc(node.value??node.url??node.id)}</b>${v.id===1797?`<span>expiry → <strong>${node.expiry}</strong></span>`:['prev','next','child'].filter(field=>Object.hasOwn(node,field)).map(field=>`<span>${field} → <strong>${esc(node[field]===null?'None':entities.find(n=>n.id===node[field])?.value??entities.find(n=>n.id===node[field])?.url??node[field])}</strong></span>`).join('')}</div>`:'';
  const milestones=v.id!==1823&&!v.operations?.length&&targets.milestones.length?`<div class="ls-rounds">${targets.milestones.map((m,i)=>`<button type="button" data-ls-go="${m.index}" data-ls-control="milestone-${i}"><small>${v.id===430?lsText('Nối','Splice'):lsText('Gộp','Merge')}</small><b>${esc(m.label)}</b></button>`).join('')}</div>`:'';
  const source=v.source?.text||step.title?.[typeof lang==='string'?lang:'en']||step.title?.en||'', line=step.codeLines?.join(', ')||'—', presets=LS_PRESETS[v.id]||[];
  const wasOpen=host.querySelector?.('.ls-details.ls-pointer-details')?.open;
  host.innerHTML=`<section class="ls-viz" data-story-id="${v.id}"><header class="ls-heading"><strong>${esc(title)}</strong><small>#${v.id}</small></header>${play}${ops}${builders[v.id]()}${milestones}<details class="ls-details ls-pointer-details" ${wasOpen?'open':''}><summary>${lsText('Soi con trỏ / trạng thái','Inspect pointers / state')}</summary>${selectedInfo}<code>${esc(source)}</code></details><div class="ls-source"><b>L${esc(line)}</b><span>${esc(source)}</span></div><nav class="ls-presets">${presets.map((p,i)=>`<button type="button" data-ls-preset="${i}">${esc(lsText(p[2],p[3]))}</button>`).join('')}</nav></section>`;
  const stop=()=>{if(typeof stopPlay==='function')stopPlay();};
  const go=(target,selector)=>{if(target===undefined||target<0||target>=timeline.length)return;stop();stepIndex=target;renderStep();(host.querySelector(selector+':not(:disabled)')||host.querySelector('.ls-operations .selected'))?.focus({preventScroll:true});};
  host.querySelectorAll?.('button,summary').forEach(button=>button.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')event.stopPropagation();}));
  host.querySelectorAll?.('[data-ls-go]').forEach(button=>button.addEventListener('click',()=>go(Number(button.dataset.lsGo),`[data-ls-control="${button.dataset.lsControl}"]`)));
  host.querySelectorAll?.('[data-ls-operation]').forEach(button=>button.addEventListener('click',()=>go(targets.operations.get(Number(button.dataset.lsOperation)),`[data-ls-operation="${button.dataset.lsOperation}"]`)));
  host.querySelectorAll?.('[data-ls-node]').forEach(button=>button.addEventListener('click',()=>{stop();host.dataset.lsSelectedState=button.dataset.lsNode;renderLinkedStoryPictures(step);const detail=host.querySelector('.ls-pointer-details');if(detail)detail.open=true;host.querySelector(`[data-ls-node="${CSS.escape(button.dataset.lsNode)}"]`)?.focus({preventScroll:true});}));
  host.querySelectorAll?.('[data-ls-preset]').forEach(button=>button.addEventListener('click',async()=>{stop();const p=presets[Number(button.dataset.lsPreset)];$('arrInput').value=p[0];for(const [key,value]of Object.entries(p[1]))if($('param-'+key))$('param-'+key).value=value;delete host.dataset.lsSelectedState;await runViz();}));
  const track=host.querySelector?.('.ls-operations'), active=track?.querySelector('.selected');
  if(active){const a=track.parentElement.getBoundingClientRect(),b=active.getBoundingClientRect();track.parentElement.scrollLeft+=b.left-a.left-(a.width-b.width)/2;}
  for(const selector of ['.ls-pages .current','.ls-paper .ls-caret','.ls-current-chain .ls-node.selected']){
    const focus=host.querySelector?.(selector),scroller=focus?.closest('.ls-scroll');
    if(scroller){const a=scroller.getBoundingClientRect(),b=focus.getBoundingClientRect();scroller.scrollLeft+=b.left-a.left-(a.width-b.width)/2;}
  }
}
