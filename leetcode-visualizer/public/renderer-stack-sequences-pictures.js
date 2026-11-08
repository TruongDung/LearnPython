'use strict';
const SQ_CASES={
  2355:[[[8,5,2,7,9],'Ghép các khối sách','Join book blocks'],[[7,0,3,4,5],'Kệ trống','An empty shelf'],[[8,2,3,7,3,4,0,1,4,3],'Nhiều lần pop','Several pops'],[[1,2,3,4],'Tăng đều +1','Increase by one'],[[5,5,5,5],'Cùng sức chứa','Equal capacities'],[[0,0,0],'Không có sách','No books']],
  2454:[[[2,4,0,9,6],'Ví dụ','Example'],[[3,3],'Bằng nhau chưa đủ','Equals do not count'],[[1,2,4,3],'Theo thứ tự xuất hiện','By position order'],[[5,4,3,2,1],'Không có số lớn hơn','No greater value'],[[2,2,3,3,4],'Trùng giá trị','Repeated values']],
  2487:[[[5,2,13,3,8],'Loại rồi nối next','Remove and reconnect'],[[1,1,1,1],'Bằng nhau giữ lại','Equals stay'],[[1,2,3,4],'Chỉ giữ nút cuối','Only the last survives'],[[9,7,5,3],'Giữ toàn bộ','Keep all nodes'],[[7],'Một nút','One node']],
};
function sqEsc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function sqFmt(value){return value===null||value===undefined?'—':typeof value==='boolean'?value?'True':'False':Array.isArray(value)?JSON.stringify(value):String(value);}
function sqCard(title,body,hint=''){return `<section class="tr-card"><header><b>${title}</b><small>${hint}</small></header>${body}</section>`;}
function sqStat(name,value,cls=''){return `<div class="sq-stat ${cls}"><code>${name}</code><strong>${sqEsc(sqFmt(value))}</strong></div>`;}
function sqIndex(node){return node?Number(node.id.split(':').at(-1)):null;}
function sqArray(v,name,values,vi){return sqCard(name,`<div class="sq-array" data-sq-scroll="${name}" data-native-array="${name}" data-array-values="${sqEsc(JSON.stringify(values??null))}" tabindex="0">${values?values.map((value,i)=>`<button type="button" data-sq-item="${i}" ${v.change?.kind==='answer'&&v.change.index===i?`data-native-write-index="${i}"`:''} class="sq-tile ${v.current===i&&v.id!==2454?'is-current':''} ${v.change?.kind==='answer'&&v.change.index===i?'is-written':''} ${v.id===2355&&!v.knownDp.includes(i)?'is-pending':''}"><small>[${i}]</small><b>${value}</b>${v.id===2355?`<em>${v.knownDp.includes(i)?'✓':'…'}</em>`:''}</button>`).join(''):'—'}</div>`,vi?'Chọn ô → dòng Python ghi ô đó':'Select a cell → the Python line that wrote it');}
function sqStack(v,name,items,title,vi){
  const ids=(items??[]).map(item=>typeof item==='number'?item:sqIndex(item));
  return sqCard(title,`<div class="sq-stack" data-sq-scroll="stack-${name}" data-native-stack="${name}" data-stack-values="${sqEsc(JSON.stringify(items??null))}" tabindex="0">${items?[...ids].reverse().map((id,i)=>`<div class="${i===0?'is-top':''}" data-stack-node="${id}"><small>#${id}</small><b>${v.values[id]}</b>${v.id===2355?`<code>${v.values[id]-id}</code>`:''}</div>`).join('')||'<span>∅</span>':'—'}</div>`,`${name} · TOP ↑${v.id===2355?' · books[i] − i':''}`);
}
function sqComparison(v,vi){
  const c=v.comparison;if(!c)return '';
  const relevant=v.source.text.startsWith('while ')||['pop','pop-second','first','remove'].includes(v.change?.kind);
  if(!relevant)return '';
  return sqCard(c.kind==='books'?'books[top] − top ≥ books[i] − i':`${c.kind} · top ${c.op} current`,
    `<div class="sq-comparison ${c.pass?'is-pass':''}">${c.top===null?'<strong>∅ → STOP</strong>':`<span><small>#${c.top}</small><b>${c.left}</b></span><i>${c.op}</i><span><small>${vi?'đang xét':'current'}</small><b>${c.right}</b></span><strong>${c.pass?'True ✓':'False ×'}</strong>`}</div>`,`L${c.line}`);
}
function sqBookPlan(v){
  if(v.result!==null)return v.bestEnd===null?[]:v.plans[v.bestEnd];
  if(v.current===null)return [];
  if(v.plans[v.current])return v.plans[v.current];
  const s=v.scratch,i=v.current,prefix=s.prefix_sum===undefined||s.previous<0?[]:v.plans[s.previous]??[];
  return [...prefix,...(s.first===undefined||!s.length?[]:Array.from({length:s.length},(_,offset)=>({index:i-s.length+1+offset,take:s.first+offset,owner:i})))];
}
function sqBooks(v,vi){
  const a=v.values,plan=sqBookPlan(v),byId=new Map(plan.map(row=>[row.index,row])),n=a.length,w=Math.max(360,n*74+70),px=i=>65+i*74,max=Math.max(1,...a),base=210;
  const end=v.result!==null?(v.bestEnd??v.ledger.at(-1)?.i??null):v.current,row=v.ledger.find(row=>row.i===end),s=row?{previous:row.previous,length:row.length,first:row.first,block_sum:row.blockSum,prefix_sum:row.prefixSum}:v.scratch,limit=end===null?null:a[end];
  const bars=a.map((capacity,i)=>{const h=capacity/max*145,take=byId.get(i)?.take??0,th=take/max*145,owner=byId.get(i)?.owner;return `<g class="sq-shelf ${i===v.current?'is-current':''} ${v.locals.stack?.includes(i)?'is-stacked':''} ${v.change?.kind==='pop'&&v.change.index===i?'is-popped':''}" data-sq-item="${i}" data-book-index="${i}" data-book-capacity="${capacity}" data-book-take="${take}" role="button" tabindex="0" aria-label="Shelf ${i}, capacity ${capacity}, take ${take}"><rect class="sq-capacity" x="${px(i)-23}" y="${base-Math.max(2,h)}" width="46" height="${Math.max(2,h)}" rx="5"/>${take?`<rect class="sq-taken ${owner===end?'is-block':'is-prefix'}" x="${px(i)-23}" y="${base-th}" width="46" height="${th}" rx="5"/>`:''}${capacity<=20&&capacity>0?Array.from({length:capacity-1},(_,k)=>`<path class="sq-book-stripe" d="M${px(i)-19},${base-(k+1)*h/capacity}H${px(i)+19}"/>`).join(''):''}<text x="${px(i)}" y="${base-Math.max(2,h)-10}">${capacity}</text><text class="sq-svg-small" x="${px(i)}" y="234">[${i}]</text><text class="sq-take-value" x="${px(i)}" y="256">${take?take:'·'}</text></g>`;}).join('');
  let staircase='';
  if(plan.length){const lo=Math.min(...plan.map(p=>p.take)),hi=Math.max(...plan.map(p=>p.take)),py=value=>hi===lo?117:187-(value-lo)/(hi-lo)*125;
    const links=plan.slice(1).map((node,i)=>{const before=plan[i];return `<path class="sq-stair-link ${before.owner!==node.owner?'is-join':node.owner===end?'is-block':'is-prefix'}" d="M${px(before.index)},${py(before.take)}L${px(node.index)},${py(node.take)}"/><text class="sq-delta" x="${(px(before.index)+px(node.index))/2}" y="${(py(before.take)+py(node.take))/2-9}">+${node.take-before.take}</text>`;}).join('');
    staircase=sqCard(vi?'Số sách lấy phải tăng nghiêm ngặt':'Taken counts must strictly increase',`<div class="sq-svg-scroll" data-sq-scroll="staircase" tabindex="0"><svg class="sq-staircase" width="${w}" height="238" viewBox="0 0 ${w} 238" role="group"><path class="sq-axis" d="M40,45V201"/><text class="sq-svg-small" x="22" y="${py(lo)+4}">${lo}</text>${hi===lo?'':`<text class="sq-svg-small" x="22" y="${py(hi)+4}">${hi}</text>`}${links}${plan.map(node=>`<g class="${node.owner===end?'is-block':'is-prefix'}"><circle cx="${px(node.index)}" cy="${py(node.take)}" r="7"/><text x="${px(node.index)}" y="${py(node.take)-15}">${node.take}</text><text class="sq-svg-small" x="${px(node.index)}" y="224">[${node.index}]</text></g>`).join('')}</svg></div>`,vi?'Số trên trục là giá trị thật · màu vàng là chỗ nối hai khối':'Axis labels are actual counts · gold marks a join between blocks');
  }
  return sqCard(vi?'Kệ sách · sức chứa và số lấy':'Shelves · capacity and taken books',`<div class="sq-svg-scroll" data-sq-scroll="shelves" tabindex="0"><svg class="sq-shelves" width="${w}" height="276" viewBox="0 0 ${w} 276" role="group">${bars}</svg></div><div class="sq-legend"><span>□ ${vi?'sức chứa':'capacity'}</span><span class="is-block">■ ${vi?'khối mới':'new block'}</span><span class="is-prefix">■ dp[previous]</span></div>`)+staircase+
    sqCard(vi?'Ghép hai phần':'Join two parts',`<div class="sq-stats">${sqStat('previous',s.previous)}${sqStat('length',s.length)}${sqStat('first',s.length===0?'∅':s.first)}${sqStat('last',limit)}</div><div class="sq-block-equation"><div class="is-prefix"><code>prefix_sum</code><b>${sqFmt(s.prefix_sum)}</b></div><i>+</i><div class="is-block"><code>block_sum</code><b>${sqFmt(s.block_sum)}</b></div><i>=</i><div><code>dp[${sqFmt(end)}]</code><b>${row?row.total:'…'}</b></div></div><div class="sq-formula"><code>(first + last) × length ÷ 2</code>${s.length===0?'<b>0</b>':`<span>(${sqFmt(s.first)} + ${sqFmt(limit)}) × ${sqFmt(s.length)} ÷ 2</span>`}</div>`,v.result!==null?vi?'Phương án tốt nhất đã ghi':'Best recorded plan':vi?'Các giá trị xuất hiện sau dòng gán tương ứng':'Values appear after their assignments')+
    sqArray(v,'dp',v.locals.dp,vi)+sqStack(v,'stack',v.locals.stack,vi?'Stack chọn biên trái':'Stack selects the left boundary',vi)+sqComparison(v,vi)+
    `<div class="sq-stats">${sqStat('answer',v.locals.answer)}${sqStat('best end',v.bestEnd)}</div>`;
}
function sqGreater(v,vi,selection){
  const a=v.values,n=a.length,w=Math.max(350,n*72+60),px=i=>52+i*72,max=Math.max(1,...a),py=value=>214-12-value/max*105;
  const chosen=selection??v.change?.index??v.resolved.at(-1)?.index??v.firstGreater.at(-1)?.index??0,
    first=v.firstGreater.find(row=>row.index===chosen),second=v.resolved.find(row=>row.index===chosen);
  const arc=(to,kind)=>to===undefined?'':`<path class="sq-greater-link is-${kind}" d="M${px(chosen)},74Q${(px(chosen)+px(to))/2},${kind==='first'?20:2} ${px(to)},74"/><text class="sq-link-number" x="${(px(chosen)+px(to))/2}" y="${kind==='first'?55:27}">${kind==='first'?'①':'②'}</text>`;
  const bars=a.map((value,i)=>`<g class="sq-value-bar ${i===v.current?'is-current':''} ${i===chosen?'is-origin':''} ${first?.first===i?'is-first':''} ${second?.second===i?'is-second':''}" data-sq-item="${i}" role="button" tabindex="0" aria-label="nums ${i} = ${value}"><rect x="${px(i)-21}" y="${py(value)}" width="42" height="${214-py(value)}" rx="5"/><text x="${px(i)}" y="${py(value)-8}" style="font-size:${String(value).length>6?10:14}px">${value}</text><text class="sq-svg-small" x="${px(i)}" y="237">[${i}]</text></g>`).join('');
  const part=(label,index,cls)=>`<div class="sq-proof-part ${cls}"><small>${label}${index===undefined?'':' · #'+index}</small><b>${index===undefined?'—':a[index]}</b></div>`;
  return sqCard('nums · '+(vi?'lớn hơn lần 1 và lần 2':'first and second greater'),`<div class="sq-svg-scroll" data-sq-scroll="greater" tabindex="0"><svg class="sq-greater" width="${w}" height="257" viewBox="0 0 ${w} 257" role="group">${arc(first?.first,'first')}${arc(second?.second,'second')}${bars}</svg></div>`,vi?'① → ② theo thứ tự vị trí ở bên phải':'① → ② by position on the right')+
    sqCard(vi?'Theo dõi một phần tử':'Follow one element',`<div class="sq-greater-proof" data-proof-index="${chosen}" data-first-index="${first?.first??''}" data-second-index="${second?.second??''}">${part('nums[i]',chosen,'is-origin')}<i>→</i>${part('①',first?.first,'is-first')}<i>→</i>${part('②',second?.second,'is-second')}</div><div class="sq-formula"><code>answer[${chosen}]</code><b>${v.locals.answer?.[chosen]??'—'}</b></div>`)+
    `<div class="sq-stack-lanes">${sqStack(v,'first',v.locals.first,vi?'Chờ số lớn hơn lần 1':'Waiting for first greater',vi)}${sqStack(v,'moved',v.locals.moved,vi?'Bộ đệm đảo thứ tự':'Order-reversing buffer',vi)}${sqStack(v,'second',v.locals.second,vi?'Chờ số lớn hơn lần 2':'Waiting for second greater',vi)}</div>`+
    (v.held?sqCard('index · '+(vi?'đang cầm':'in hand'),`<div class="sq-held"><small>#${v.held.index}</small><b>${a[v.held.index]}</b><i>→</i><code>${v.held.kind==='answer'?'answer[index]':v.held.kind==='first'?'moved':'second'}</code></div>`):'')+
    sqComparison(v,vi)+sqArray(v,'answer',v.locals.answer,vi);
}
function sqLinked(v,vi,selection){
  const a=v.values,n=a.length,w=Math.max(350,n*88+85),px=i=>53+i*88,y=138,removed=new Set(v.removed),stackIds=(v.locals.stack??[]).map(sqIndex);
  const links=(v.linked??[]).map(node=>{
    const from=sqIndex(node),to=node.next===null?null:Number(node.next.split(':').at(-1)),changed=v.change?.kind==='link'&&v.change.from===from;
    const d=to===null?`M${px(from)+25},${y}H${px(from)+46}`:to===from+1?`M${px(from)+25},${y}H${px(to)-27}`:`M${px(from)+16},${y-21}Q${(px(from)+px(to))/2},36 ${px(to)-16},${y-22}`;
    return `<path class="sq-next ${removed.has(from)?'is-old':''} ${changed?'is-written':''}" data-next-from="${node.id}" data-next-to="${node.next??''}" marker-end="url(#sq2487-arrow)" d="${d}"/>${to===null?`<text class="sq-svg-small" x="${px(from)+54}" y="${y+4}">∅</text>`:''}`;
  }).join('');
  const nodes=a.map((value,i)=>`<g class="sq-list-node ${removed.has(i)?'is-removed':''} ${stackIds.includes(i)?'is-stacked':''} ${i===v.current?'is-current':''}" data-sq-item="${i}" data-list-index="${i}" role="button" tabindex="0" aria-label="Node ${i} = ${value}"><circle cx="${px(i)}" cy="${y}" r="24"/><text x="${px(i)}" y="${y+5}" style="font-size:${String(value).length>4?11:15}px">${value}</text><text class="sq-svg-small" x="${px(i)}" y="${y+44}">#${i}</text>${removed.has(i)?`<path class="sq-cross" d="M${px(i)-18},${y-18}L${px(i)+18},${y+18}"/>`:''}${i===v.current?`<text class="sq-pointer" x="${px(i)}" y="${y-38}">current ↓</text>`:''}</g>`).join('');
  const witness=v.ledger.find(row=>row.index===selection)??(v.change?.kind==='remove'?v.ledger.at(-1):null);
  const link=v.change?.kind==='link'?`<div class="sq-formula"><code>#${v.change.from}.next</code><span>${v.change.before===null?'None':'#'+Number(v.change.before.split(':').at(-1))}</span><i>→</i><b>#${v.change.to}</b></div>`:'';
  return sqCard(vi?'Danh sách · next đang lưu thật':'Linked list · actual next pointers',`<div class="sq-svg-scroll" data-sq-scroll="list" tabindex="0"><svg class="sq-list" width="${w}" height="222" viewBox="0 0 ${w} 222" role="group"><defs><marker id="sq2487-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10Z"/></marker></defs>${links}${nodes}</svg></div>${link}<div class="sq-legend"><span>× ${vi?'bỏ khỏi kết quả':'removed from result'}</span><span class="is-prefix">→ ${vi?'vừa gán next':'next just assigned'}</span><span>head ${vi?'đầu vào':'input'} = #${sqIndex(v.locals.head)}</span></div>`,vi?'Mũi tên đổi đúng lúc dòng gán next chạy':'Arrows change exactly when next is assigned')+
    sqStack(v,'stack',v.locals.stack,vi?'Các nút còn có thể giữ':'Nodes still eligible to keep',vi)+sqComparison(v,vi)+
    (witness?sqCard(vi?'Có nút lớn hơn ở bên phải':'A greater node exists on the right',`<div class="sq-greater-proof"><div class="sq-proof-part"><small>#${witness.index}</small><b>${witness.value}</b></div><i>&lt;</i><div class="sq-proof-part is-second"><small>#${witness.killer}</small><b>${witness.greater}</b></div><strong>× #${witness.index}</strong></div>`):'')+
    (v.result!==null?sqCard('return head',`<div class="sq-result-list" data-sq-scroll="result-list" data-result-ids="${v.resultIds.join(',')}" tabindex="0">${v.resultIds.map((id,i)=>`<span><small>#${id}</small><b>${a[id]}</b></span>${i<v.resultIds.length-1?'<i>→</i>':'<i>→ ∅</i>'}`).join('')}</div>`):'');
}
function sqLedger(v,vi){
  return sqCard(vi?'Các bước đã ghi':'Recorded steps',`<div class="sq-ledger" data-sq-scroll="ledger" tabindex="0">${v.ledger.map(row=>`<button type="button" data-sq-step="${row.step}"><small>${v.id===2355?'dp['+row.i+']':'#'+row.index}</small><b>${v.id===2355?row.total:v.id===2454?row.value:'× '+row.value}</b></button>`).join('')||'∅'}</div>`);
}
function sqNext(kind){if(typeof steps==='undefined')return -1;return steps.findIndex((s,i)=>{const v=s.stackSequenceView;return i>stepIndex&&v&&(kind==='line'||kind==='pop'&&['pop','pop-second','first','remove'].includes(v.change?.kind)||kind==='first'&&v.change?.kind==='first'||kind==='transfer'&&v.change?.kind==='transfer'||kind==='write'&&['dp','answer','link'].includes(v.change?.kind)||kind==='result'&&s.final);});}
function sqGo(index,options){if(index<0||typeof steps==='undefined')return;if(typeof stopPlay==='function')stopPlay();stepIndex=index;renderStep();if(options)renderStackSequences(steps[index],options);}
function sqBind(host){
  const bind=(selector,fn)=>host.querySelectorAll(selector).forEach(el=>{el.addEventListener('click',()=>fn(el));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();fn(el);}});});
  host.querySelectorAll('summary').forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')e.stopPropagation();}));
  bind('[data-sq-jump]',el=>sqGo(sqNext(el.dataset.sqJump)));
  bind('[data-sq-step]',el=>sqGo(Number(el.dataset.sqStep)));
  bind('[data-sq-item]',el=>{
    const id=steps[stepIndex].stackSequenceView.id,index=Number(el.dataset.sqItem),kind=id===2355?'dp':id===2454?'answer':'remove';
    const target=steps.findIndex(s=>s.stackSequenceView?.change?.kind===kind&&s.stackSequenceView.change.index===index);
    sqGo(target<0?steps.length-1:target,{index});
  });
  bind('[data-sq-case]',el=>{const id=steps[stepIndex].stackSequenceView.id;document.getElementById('arrInput').value=SQ_CASES[id][Number(el.dataset.sqCase)][0].join(',');if(typeof runViz==='function')runViz();});
}
function renderStackSequences(step,options={}){
  const v=step.stackSequenceView,host=document.getElementById('treeView');if(!v||!host)return;
  const vi=typeof lang!=='undefined'&&lang==='vi',scrolls=new Map([...host.querySelectorAll('[data-sq-scroll]')].map(el=>[el.dataset.sqScroll,{x:el.scrollLeft,y:el.scrollTop}])),open=host.querySelector('.sq-native')?.open??false;
  const title=v.id===2355?vi?'Xếp bậc sách · ghép DP':'Book staircases · join DP':v.id===2454?vi?'Chờ lần 1 → chờ lần 2':'Wait for first → wait for second':vi?'Gặp nút lớn hơn · loại và nối':'A larger node · remove and reconnect';
  const main=v.id===2355?sqBooks(v,vi):v.id===2454?sqGreater(v,vi,options.index):sqLinked(v,vi,options.index);
  const jumps=[['line',vi?'Dòng →':'Line →'],['pop',v.id===2487?vi?'Loại →':'Remove →':'POP →'],...(v.id===2454?[['first','① →'],['transfer',vi?'Chuyển →':'Transfer →']]:[]),['write',v.id===2355?'dp →':v.id===2487?'next →':'answer →'],['result',vi?'Kết quả ↠':'Result ↠']];
  host.innerHTML=`<article class="tr-viz sq-viz" data-problem-id="${v.id}" data-source-line="${v.source.line}" role="region" aria-label="LeetCode ${v.id}"><header class="tr-header"><div><small>LEETCODE ${v.id} · MONOTONIC STACK</small><h2>${title}</h2></div><code>${v.scope}</code></header><nav class="tr-presets" aria-label="Examples">${SQ_CASES[v.id].map((c,i)=>`<button type="button" data-sq-case="${i}">${c[vi?1:2]}</button>`).join('')}</nav><div class="tr-source"><span>${vi?'Sau dòng':'After line'} <b>L${v.source.line}</b></span><code>${sqEsc(v.source.text)}</code>${v.branch===null?'':`<strong class="${v.branch?'is-good':'is-muted'}">${v.branch?'True ✓':'False ×'}</strong>`}</div><div class="sq-work">${main}${sqLedger(v,vi)}</div><details class="tr-native sq-native"><summary>${vi?'Biến Python · từng frame':'Python locals · each frame'}</summary>${v.frames.map(f=>`<div class="sq-frame"><code>${sqEsc(f.name)}</code><pre>${sqEsc(JSON.stringify(f.locals,null,2))}</pre></div>`).join('')}</details>${v.result===null?'':`<output class="tr-answer" data-answer="${sqEsc(JSON.stringify(v.result))}"><small>${vi?'Kết quả':'Result'}</small><strong>${sqEsc(sqFmt(v.result))}</strong></output>`}<footer class="tr-footer"><div>${jumps.map(([kind,label])=>`<button type="button" data-sq-jump="${kind}" ${sqNext(kind)<0?'disabled':''}>${label}</button>`).join('')}</div></footer></article>`;
  const details=host.querySelector('.sq-native');if(details)details.open=open;
  for(const el of host.querySelectorAll('[data-sq-scroll]')){const saved=scrolls.get(el.dataset.sqScroll);if(saved){el.scrollLeft=saved.x;el.scrollTop=saved.y;}const active=el.querySelector('.is-current');if(active){const a=el.getBoundingClientRect(),b=active.getBoundingClientRect();if(b.left<a.left+5)el.scrollLeft-=a.left+5-b.left;if(b.right>a.right-5)el.scrollLeft+=b.right-a.right+5;}}
  sqBind(host);
}
