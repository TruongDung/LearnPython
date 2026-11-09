'use strict';
const LD_CASES={707:[
  ['addAtHead 1 | addAtTail 3 | addAtIndex 1 2 | get 1 | deleteAtIndex 1 | get 1','Ví dụ · chèn rồi xóa','Example · insert then delete'],
  ['get 0 | deleteAtIndex 0 | addAtIndex 1 9 | addAtIndex 0 7 | get 0','Index không hợp lệ','Invalid indices'],
  ['addAtHead 5 | addAtTail 5 | addAtIndex 1 5 | deleteAtIndex 1 | get 1','Giá trị trùng · ID riêng','Equal values · unique IDs'],
  ['addAtTail 0 | deleteAtIndex 0 | addAtHead 8 | get 0','Xóa nút cuối · thêm lại','Empty the list · insert again'],
],2296:[['[["addText","leetcode"],["deleteText",4],["addText","practice"],["cursorRight",3],["cursorLeft",8],["deleteText",10],["cursorLeft",2],["cursorRight",6]]','Ví dụ · cursor và backspace','Cursor and backspace'],['[["addText","aaaa"],["cursorLeft",2],["addText","xy"],["deleteText",1],["cursorRight",40]]','Chèn giữa các chữ trùng','Insert between equal characters']],146:[
  ['put 1 1 | put 2 2 | get 1 | put 3 3 | get 2 | put 4 4 | get 1 | get 3 | get 4',2,'Ví dụ · chọn nút LRU','Example · evict LRU'],
  ['put 1 5 | put 2 5 | put 1 9 | get 1 | put 3 5 | get 2',2,'Cập nhật key cũ','Update an existing key'],
  ['put 0 0 | get 0 | put 1 1 | get 0 | get 1',1,'Capacity 1 · key 0','Capacity 1 · key zero'],
  ['get 9 | put 1 10 | get 2 | get 1',2,'Cache miss không đổi thứ tự','A miss keeps recency order'],
]};
function ldEsc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function ldFmt(v){return v===undefined?'—':v===null?'None':typeof v==='object'?JSON.stringify(v):String(v);}
function ldName(v,id){if(id===null)return 'None';if(id===undefined)return '—';const sentinel=v.sentinels.indexOf(id);return sentinel<0?'N'+id.split(':').at(-1):v.id===1206?'H':v.id!==146?'D':sentinel===0?'L':'R';}
function ldCard(title,body,hint=''){return `<section class="tr-card"><header><b>${title}</b><small>${hint}</small></header>${body}</section>`;}
function ldScroll(name,body,cls=''){return `<div class="ld-scroll ${cls}" data-ld-scroll="${name}" tabindex="0">${body}</div>`;}
function ldStat(name,value){return `<span class="ld-stat"><code>${name}</code><b>${ldEsc(ldFmt(value))}</b></span>`;}
function ldGraph(v,vi,selected){
  if(!v.nodes.length)return ldCard(vi?'Các node và con trỏ thật':'Actual nodes and pointers','<div class="ld-empty">∅</div>');
  const top=[...new Set([...v.chain,...v.sentinels])],detached=v.nodes.filter(n=>!top.includes(n.id)).map(n=>n.id),w=Math.max(350,Math.max(top.length,detached.length)*104+70),h=detached.length?355:205;
  const positions=new Map([...top.map((id,i)=>[id,{x:54+i*104,y:104}]),...detached.map((id,i)=>[id,{x:54+i*104,y:268}])]);
  const links=v.nodes.flatMap(node=>['next',...(v.doubly?['prev']:[])].flatMap(field=>{
    const target=node.fields[field]?.id;if(!target||!positions.has(target))return [];
    const a=positions.get(node.id),b=positions.get(target),same=a.y===b.y,span=Math.abs(a.x-b.x),sign=b.x>=a.x?1:-1;
    let d;
    if(same&&span===104){const y=a.y+(field==='next'?-10:10);d=`M${a.x+sign*29},${y}H${b.x-sign*29}`;}
    else if(same){const y=a.y+(field==='next'?-27:27),control=a.y+(field==='next'?-86:86);d=`M${a.x},${y}Q${(a.x+b.x)/2},${control} ${b.x},${y}`;}
    else{const signY=b.y>a.y?1:-1;d=`M${a.x},${a.y+signY*27}C${a.x},${a.y+signY*83} ${b.x},${b.y-signY*83} ${b.x},${b.y-signY*27}`;}
    const written=v.change?.kind==='link'&&v.change.node===node.id&&v.change.field===field;
    return [`<g class="ld-edge is-${field} ${written?'is-written':''}" data-pointer-from="${node.id}" data-pointer-field="${field}" data-pointer-to="${target}"><path d="${d}" marker-end="url(#ld-${field}-arrow)"/>${same&&span===104?`<text x="${(a.x+b.x)/2}" y="${a.y+(field==='next'?-16:27)}">${field}</text>`:''}</g>`];
  })).join('');
  const nodes=v.nodes.map(n=>{const p=positions.get(n.id),sentinel=v.sentinels.includes(n.id),member=v.items.includes(n.id),index=v.items.indexOf(n.id),bound=Object.values(v.bindings).includes(n.id);
    const value=v.id!==146?ldFmt(n.fields.val):`${ldFmt(n.fields.key)}:${ldFmt(n.fields.value)}`;
    return `<g class="ld-node ${sentinel?'is-sentinel':''} ${!top.includes(n.id)?'is-detached':''} ${bound?'is-bound':''} ${n.id===selected?'is-selected':''}" data-ld-node="${n.id}" data-node-id="${n.id}" data-node-fields="${ldEsc(JSON.stringify(n.fields))}" role="button" tabindex="0" aria-label="${ldName(v,n.id)}, ${value}"><circle cx="${p.x}" cy="${p.y}" r="27"/><text x="${p.x}" y="${p.y+5}" style="font-size:${value.length>7?9:14}px">${sentinel?ldName(v,n.id):ldEsc(value)}</text><text class="ld-small" x="${p.x}" y="${p.y+46}">${ldName(v,n.id)}${v.id===707&&member?' · i='+index:''}</text>${n.id===selected?`<circle class="ld-node-ring" cx="${p.x}" cy="${p.y}" r="32"/>`:''}</g>`;
  }).join('');
  return ldCard(vi?'Danh sách · con trỏ sau dòng này':'List · pointers after this line',ldScroll('graph',`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" ${v.nodes.length<=5?'style="width:100%;max-width:${w}px;min-width:350px;height:auto"':''} role="group"><defs>${['next','prev'].map(name=>`<marker id="ld-${name}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10Z"/></marker>`).join('')}</defs>${links}${nodes}${detached.length?`<text class="ld-small" x="80" y="204">${vi?'Chưa nối / đã tách':'Unlinked / detached'}</text>`:''}</svg>`,'ld-canvas')+`<div class="ld-legend"><span class="is-next">→ next</span>${v.doubly?'<span class="is-prev">← prev</span>':''}<span class="is-amber">→ ${vi?'vừa gán':'just assigned'}</span><span>${v.id!==146?'D = dummy':'L / R = sentinel'}</span></div>`,v.cycle?vi?'Đang nối · next tạm tạo vòng':'Rewiring · next temporarily forms a cycle':vi?'Chọn node → xem con trỏ · ↔':'Select a node → inspect pointers · ↔');
}
function ldInspector(v,vi,selected){
  const node=v.nodes.find(n=>n.id===selected);if(!node)return '';
  return ldCard(ldName(v,node.id),`<div class="ld-stats" data-inspect-node="${node.id}">${Object.entries(node.fields).map(([field,value])=>Array.isArray(value)?ldScroll('inspect-'+field,value.map((ref,i)=>`<button type="button" data-ld-inspect="${ref?.id??node.id}"><small>${field}[${i}]</small><b>${ldName(v,ref?.id??null)}</b></button>`).join(''),'ld-values'):ldStat(field,value&&value.id?ldName(v,value.id):value)).join('')}</div>`,vi?'ID của node giữ nguyên, kể cả khi trùng giá trị':'Node IDs remain stable, including equal values');
}
function ldOperationList(v,vi){
  return ldCard(vi?'Các thao tác':'Operations',ldScroll('operations',v.operations.map((op,i)=>{const done=v.history.find(r=>r.index===i);return `<button type="button" class="ld-operation ${v.operationIndex===i?'is-current':''} ${done?'is-done':''}" data-ld-operation="${i}" data-operation-index="${i}" data-operation-result="${done?ldEsc(JSON.stringify(done.result)):''}"><small>#${i}</small><code>${ldEsc(op.label)}</code><b>${done?ldEsc(ldFmt(done.result)):'…'}</b></button>`;}).join(''),'ld-operations'),vi?'Chọn thao tác để phát từng dòng':'Select an operation to replay its source');
}
function ldState(v,vi){
  const byId=new Map(v.nodes.map(n=>[n.id,n])),bound=Object.entries(v.bindings);
  const pointers=ldCard(vi?'Biến đang trỏ tới đâu?':'Where do variables point?',`<div class="ld-stats">${bound.map(([name,id])=>`<button type="button" class="ld-binding" data-ld-inspect="${id}"><code>${name}</code><b>${ldName(v,id)}</b></button>`).join('')||'—'}</div>`);
  if(v.id===2296){const cursor=v.state.cursor?.id,position=cursor===v.sentinels[0]?0:v.items.indexOf(cursor)+1;return pointers+ldCard('Text · cursor |',ldScroll('text',Array.from({length:v.items.length+1},(_,i)=>`${i===position?'<strong class="ld-text-cursor">|</strong>':''}${i<v.items.length?`<button type="button" data-ld-inspect="${v.items[i]}"><b>${ldEsc(ldFmt(byId.get(v.items[i]).fields.val))}</b></button>`:''}`).join(''),'ld-values'));}
  if(v.id===707)return `<div class="ld-stats">${ldStat('self.size',v.size)}${ldStat(vi?'số node đã nối':'linked nodes',v.physicalSize)}</div>`+pointers+
    ldCard('dummy.next → '+(vi?'phần tử đầu':'first item'),ldScroll('values',v.items.map(id=>`<button type="button" data-ld-inspect="${id}"><small>${ldName(v,id)}</small><b>${ldEsc(ldFmt(byId.get(id).fields.val))}</b></button>`).join('')||'∅','ld-values'),v.size!==null&&v.size!==v.physicalSize?vi?'Con trỏ đã đổi · size chưa cập nhật':'Pointers changed · size not updated yet':'');
  const map=ldCard('cache · key → node',ldScroll('cache',v.cache.map(([key,node])=>`<button type="button" data-ld-inspect="${node.id}" data-cache-key="${key}" data-cache-node="${node.id}"><small>key ${key}</small><b>→ ${ldName(v,node.id)}</b><code>${ldEsc(ldFmt(byId.get(node.id)?.fields.value))}</code></button>`).join('')||'∅','ld-cache'));
  const stable=v.sentinels.length===2&&v.chain.at(-1)===v.sentinels[1]&&!v.cycle&&v.items.length===v.cache.length&&v.cache.every(([,node])=>v.items.includes(node.id))&&v.chain.slice(1).every((id,i)=>byId.get(id)?.fields.prev?.id===v.chain[i]);
  return `<div class="ld-stats">${ldStat('len(cache)',v.cache.length)}${ldStat('capacity',v.capacity)}</div>`+map+pointers+
    ldCard(stable?'LRU → MRU':vi?'next hiện tại · đang nối':'Current next links · rewiring',ldScroll('recency',v.items.map((id,i)=>`<button type="button" data-ld-inspect="${id}" data-recency-node="${id}"><small>${stable?(i===0?'LRU':i===v.items.length-1?'MRU':''):ldName(v,id)}</small><b>${ldEsc(ldFmt(byId.get(id).fields.key))}</b></button>`).join('')||'∅','ld-values'),v.cache.length>v.capacity&&v.capacity!==null?vi?'Vượt capacity · chuẩn bị loại LRU':'Over capacity · preparing LRU eviction':'');
}
function ldNext(kind){if(typeof steps==='undefined')return -1;return steps.findIndex((s,i)=>i>stepIndex&&s.linkedDesignView&&(kind==='line'||kind==='link'&&s.linkedDesignView.change?.kind==='link'||kind==='create'&&s.linkedDesignView.change?.kind==='create'||kind==='return'&&s.linkedDesignView.history.at(-1)?.step===i||kind==='result'&&s.final));}
function ldGo(index){if(index<0||typeof steps==='undefined')return;if(typeof stopPlay==='function')stopPlay();stepIndex=index;renderStep();}
function ldBind(host){
  const bind=(selector,fn)=>host.querySelectorAll(selector).forEach(el=>{el.addEventListener('click',()=>fn(el));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();fn(el);}});});
  host.querySelectorAll('summary').forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')e.stopPropagation();}));
  bind('[data-ld-jump]',el=>ldGo(ldNext(el.dataset.ldJump)));
  bind('[data-ld-step]',el=>ldGo(Number(el.dataset.ldStep)));
  const inspect=id=>{if(typeof stopPlay==='function')stopPlay();renderLinkedDesign(steps[stepIndex],{selected:id});};
  bind('[data-ld-node]',el=>inspect(el.dataset.ldNode));bind('[data-ld-inspect]',el=>inspect(el.dataset.ldInspect));
  bind('[data-ld-operation]',el=>ldGo(steps.findIndex(s=>s.linkedDesignView.operationIndex===Number(el.dataset.ldOperation))));
  bind('[data-ld-case]',el=>{const id=steps[stepIndex].linkedDesignView.id,c=LD_CASES[id][Number(el.dataset.ldCase)];document.getElementById('arrInput').value=c[0];if(id===146)document.getElementById('param-capacity').value=c[1];if(typeof runViz==='function')runViz();});
}
function renderLinkedDesign(step,options={}){
  const v=step.linkedDesignView,host=document.getElementById('treeView');if(!v||!host)return;
  const vi=typeof lang!=='undefined'&&lang==='vi',open=host.querySelector('.ld-native')?.open??false,scrolls=new Map([...host.querySelectorAll('[data-ld-scroll]')].map(el=>[el.dataset.ldScroll,{x:el.scrollLeft,y:el.scrollTop}]));
  const selected=options.selected??v.change?.node??v.bindings.node??v.bindings.current??v.bindings.prev??v.items[0]??v.sentinels[0]??v.nodes.at(-1)?.id;
  const c=v.change,write=c?.kind==='link'?ldCard(`${ldName(v,c.node)}.${c.field}`,`<div class="ld-equation">${ldStat(vi?'trước':'before',ldName(v,c.before))}<i>→</i>${ldStat(vi?'sau':'after',ldName(v,c.after))}</div>`):'';
  const jumps=[['line',vi?'Dòng →':'Line →'],['create',vi?'Tạo →':'Create →'],['link',vi?'Nối →':'Link →'],['return',vi?'Return →':'Return →'],['result',vi?'Kết quả ↠':'Result ↠']];
  host.innerHTML=`<article class="tr-viz ld-viz" data-problem-id="${v.id}" data-source-line="${v.source.line}" role="region" aria-label="LeetCode ${v.id}"><header class="tr-header"><div><small>LEETCODE ${v.id} · LINKED LIST</small><h2>${v.id===707?vi?'Thêm · tìm · xóa từng node':'Insert · find · delete nodes':v.id===2296?vi?'Text Editor · cursor trên DLL':'Text Editor · a DLL cursor':vi?'LRU Cache · nối lại từng con trỏ':'LRU Cache · rewire each pointer'}</h2></div><code>${ldEsc(v.operation?.label??(v.id===707?'MyLinkedList()':v.id===2296?'TextEditor()':'LRUCache('+v.constructorArgs[0]+')'))}</code></header><nav class="tr-presets" aria-label="Examples">${LD_CASES[v.id].map((c,i)=>`<button type="button" data-ld-case="${i}">${c[v.id!==146?(vi?1:2):(vi?2:3)]}</button>`).join('')}</nav><div class="tr-source"><span>${vi?'Sau dòng':'After line'} <b>L${v.source.line}</b></span><code>${ldEsc(v.source.text)}</code>${v.branch===null?'':`<strong class="${v.branch?'is-good':'is-muted'}">${v.branch?'True ✓':'False ×'}</strong>`}</div><div class="ld-work">${ldGraph(v,vi,selected)}${write}${ldState(v,vi)}${ldInspector(v,vi,selected)}${ldOperationList(v,vi)}</div><details class="tr-native ld-native"><summary>${vi?'Biến Python · từng frame':'Python locals · every frame'}</summary>${v.frames.map(f=>`<div class="ld-frame"><code>${ldEsc(f.name)}</code><pre>${ldEsc(JSON.stringify(f.locals,null,2))}</pre></div>`).join('')}<pre>${ldEsc(JSON.stringify(v.objects,null,2))}</pre></details>${v.result===null?'':`<output class="tr-answer" data-answer="${ldEsc(JSON.stringify(v.result))}"><small>${vi?'Kết quả từng thao tác · constructor riêng':'Operation results · constructor separate'}</small><strong>${ldEsc(JSON.stringify(v.result))}</strong></output>`}<footer class="tr-footer"><div>${jumps.map(([kind,label])=>`<button type="button" data-ld-jump="${kind}" ${ldNext(kind)<0?'disabled':''}>${label}</button>`).join('')}</div></footer></article>`;
  const details=host.querySelector('.ld-native');if(details)details.open=open;
  for(const el of host.querySelectorAll('[data-ld-scroll]')){const saved=scrolls.get(el.dataset.ldScroll);if(saved){el.scrollLeft=saved.x;el.scrollTop=saved.y;}const active=el.querySelector('.is-selected')??el.querySelector('.is-current');if(active){const a=el.getBoundingClientRect(),b=active.getBoundingClientRect();if(b.left<a.left+5)el.scrollLeft-=a.left+5-b.left;if(b.right>a.right-5)el.scrollLeft+=b.right-a.right+5;if(b.top<a.top+5)el.scrollTop-=a.top+5-b.top;if(b.bottom>a.bottom-5)el.scrollTop+=b.bottom-a.bottom+5;}}
  ldBind(host);
}
