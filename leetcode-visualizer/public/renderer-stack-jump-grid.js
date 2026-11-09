'use strict';
const JG_CASES={
  3221:[['4,5,2,8,9,1,3','Gom thành 2 bước nhảy','Group into 2 hops'],['1,5,8','Nhảy thẳng','One long hop'],['9,8,7,6','Nhảy từng ô','Hop one by one'],['5,5,5,5','Bằng nhau','Equal values'],['100000,1,1,1','Giá trị đầu không tính','Start value adds no score'],['1,100000','Hai vị trí','Two positions']],
  2617:[['3,4,2,1;4,2,3,1;2,1,0,0;2,4,0,0','4 ô ghé qua','4 visited cells'],['3,4,2,1;4,2,1,1;2,1,1,0;3,4,1,0','3 ô ghé qua','3 visited cells'],['2,1,0;1,0,0','Không tới đích','Unreachable'],['0','Đã ở đích','Already at the goal'],['3,0,0,0','Nhảy qua ô 0','Jump over zeroes'],['0,0;0,0','Bị kẹt ở đầu','Stuck at the start']],
  2104:[['1,2,3','Tăng dần','Increasing'],['1,3,3','Trùng cực trị','Repeated extrema'],['4,-2,-3,4,1','Có số âm','Negative values'],['5,5,5','Range luôn bằng 0','Every range is zero'],['7','Một phần tử','One element']],
  1475:[['8,4,6,2,3','Giảm giá đầu tiên','First discount'],['1,2,3,4,5','Không được giảm','No discounts'],['5,5,5','Bằng nhau cũng giảm','Equals also discount'],['10,1,1,6','Chọn món đầu tiên','Pick the first item'],['7','Một món','One item']],
  1504:[['1,0,1;1,1,0;1,1,0','Histogram từng hàng','Row histograms'],['0,1,1,0;0,1,1,1;1,1,1,0','Gộp nhiều chiều cao','Merge heights'],['1,1;1,1','9 hình chữ nhật','9 rectangles'],['0,0;0,0','Toàn số 0','All zeroes'],['1,0,1,1','Một hàng','One row'],['1','Một ô','One cell']],
};
const JG_TITLES={3221:['Gom đoạn nhỏ → bước nhảy dài','Unit segments → long hops'],2617:['Nhảy trên lưới · đếm ô ghé','Grid jumps · count visited cells'],2104:['Tổng max − tổng min','Sum of maxima − sum of minima'],1475:['Món đầu tiên ≤ giá hiện tại','First item with a price ≤ current'],1504:['Histogram → hình chữ nhật toàn 1','Histogram → all-one rectangles']};
function jgEsc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function jgFmt(value){return value===null||value===undefined?'—':Array.isArray(value)?'['+value.join(', ')+']':String(value);}
function jgCard(title,body,hint=''){return `<section class="tr-card"><header><b>${title}</b><small>${hint}</small></header>${body}</section>`;}
function jgStat(name,value){return `<span class="jg-stat"><code>${name}</code><b>${jgEsc(jgFmt(value))}</b></span>`;}
function jgScroll(name,body,cls=''){return `<div class="jg-scroll ${cls}" data-jg-scroll="${name}" tabindex="0">${body}</div>`;}
function jgStack(v,vi){
  const a=v.locals.stack,tuple=v.id===1504;
  return jgCard(tuple?vi?'Nhóm (chiều cao, bề rộng)':'Groups (height, width)':vi?'Stack · TOP ở trên':'Stack · TOP at the top',jgScroll('stack',a?[...a].reverse().map((item,k)=>`<div class="jg-stack-item ${k?'':'is-top'}"><small>${tuple?'h × w':'#'+item}</small><b>${tuple?item[0]+' × '+item[1]:v.model[item]}</b>${k?'':'<code>TOP ↑</code>'}</div>`).join('')||'∅':'—','jg-stack')+`<span class="jg-hidden" data-native-stack="stack" data-stack-values="${jgEsc(JSON.stringify(a??null))}"></span>`);
}
function jgComparison(v,vi){
  const c=v.comparison;if(!c||v.id===3221||!(v.source.text.startsWith('while ')||v.change?.kind==='pop'))return '';
  return jgCard(vi?'So sánh TOP':'Compare TOP',`<div class="jg-equation">${c.top===null?'<b>∅ → STOP</b>':`${jgStat('TOP',c.left)}<i>${jgEsc(c.op)}</i>${jgStat('current',c.right)}<strong class="${c.pass?'is-gold':''}">${c.pass?'True ✓':'False ×'}</strong>`}</div>`);
}
function jgBars(v,options={}){
  const a=v.model,n=a.length,w=Math.max(350,n*80+60),px=i=>55+i*80,max=Math.max(1,...a.map(Math.abs)),negative=a.some(x=>x<0),base=negative?165:220,py=value=>base-value/max*(negative?90:130),labelY=negative?286:247,svgHeight=v.id===3221?310:negative?305:265;
  const current=v.current,chosen=options.chosen,range=options.range,links=options.links??[];
  const arrows=links.map((e,k)=>`<path class="jg-arrow ${e.cls??''}" d="M${px(e.from)},53Q${(px(e.from)+px(e.to))/2},${12+k%2*12} ${px(e.to)},53" marker-end="url(#jg-array-arrow)"/>`).join('');
  const bars=a.map((value,i)=>`<g class="jg-bar ${i===current?'is-current':''} ${i===chosen?'is-chosen':''} ${range&&i>=range[0]&&i<=range[1]?'is-range':''}" data-jg-item="${i}" data-bar-index="${i}" data-bar-value="${value}" role="button" tabindex="0" aria-label="Index ${i}, value ${value}"><rect x="${px(i)-23}" y="${Math.min(base,py(value))}" width="46" height="${Math.max(2,Math.abs(py(value)-base))}" rx="5"/><text x="${px(i)}" y="${value>=0?py(value)-9:py(value)+18}" style="font-size:${String(value).length>7?9:13}px">${value}</text><text class="jg-small" x="${px(i)}" y="${labelY}">[${i}]</text></g>`).join('');
  const suffix=v.id===3221&&v.examinedFrom!==null?`<path class="jg-suffix" d="M${px(v.examinedFrom)-28},265V273H${px(n-1)+28}V265"/><text class="jg-small" x="${(px(v.examinedFrom)+px(n-1))/2}" y="294">suffix · max = ${v.locals.suffix_max}</text>`:'';
  return jgScroll('bars',`<svg width="${w}" height="${svgHeight}" ${n<=8?'style="width:100%;min-width:350px;height:auto"':''} viewBox="0 0 ${w} ${svgHeight}" role="group"><defs><marker id="jg-array-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10Z"/></marker></defs><path class="jg-axis" d="M25,${base}H${w-15}"/>${arrows}${bars}${suffix}</svg>`,'jg-canvas');
}
function jgHops(v,vi){
  const c=v.comparison,known=new Map(v.units.map(u=>[u.index,u]));
  return jgCard('nums · '+(vi?'quét từ phải sang trái':'scan right to left'),jgBars(v,{chosen:v.owner,range:v.examinedFrom===null?null:[v.examinedFrom,v.model.length-1],links:v.groups.map(g=>({from:g.from,to:g.to,cls:'is-green'}))}),vi?'Điểm dùng giá trị tại nơi đáp':'Score uses the landing value')+
    (c?jgCard('suffix_max = max(suffix_max, nums[i])',`<div class="jg-equation">${jgStat('before',c.before)}<i>vs</i>${jgStat('nums[i]',c.input)}<i>→</i>${jgStat('suffix_max',c.after)}<small>#${c.owner} ${vi?'là điểm đáp':'is the landing'}</small></div>`):'')+
    jgCard(vi?'Mỗi đoạn đơn vị nhận một suffix max':'Each unit segment gets a suffix maximum',jgScroll('units',Array.from({length:v.model.length-1},(_,k)=>{const i=k+1,u=known.get(i);return `<button type="button" ${u?`data-jg-step="${u.step}"`:''} data-unit-index="${i}" data-unit-points="${u?.points??''}" class="jg-unit ${u?'is-green':'is-pending'}"><small>${i-1} → ${i}</small><b>${u?.points??'?'}</b><small>${u?'↗ #'+u.owner:'…'}</small></button>`;}).join(''),'jg-lane'))+
    jgCard(vi?'Gom các đoạn cùng điểm đáp':'Group segments with the same landing',`<div class="jg-hop-list">${v.groups.map(g=>`<div data-hop-from="${g.from}" data-hop-to="${g.to}" data-hop-score="${g.points}"><span>#${g.from} → #${g.to}</span><code>${g.to-g.from} × ${v.model[g.owner]}</code><b>+${g.points}</b></div>`).join('')||'—'}</div><div class="jg-stats">${jgStat('answer',v.locals.answer)}</div>`,vi?'Khoảng cách × giá trị nơi đáp':'Distance × landing value');
}
function jgPrices(v,vi){
  const selected=v.change?.kind==='write'?v.discounts.at(-1):null;
  return jgCard('prices',jgBars(v,{chosen:selected?.index??v.scratch.i,links:v.discounts.map(d=>({from:d.index,to:d.to,cls:'is-green'}))}),vi?'Mũi tên tới món giảm giá đầu tiên':'Arrows point to the first discount')+
    jgCard(vi?'Giá cuối cùng':'Final prices',jgScroll('answer',v.locals.answer?v.locals.answer.map((price,i)=>{const d=v.discounts.find(d=>d.index===i);return `<button type="button" data-jg-item="${i}" data-price-index="${i}" data-price-value="${price}" class="jg-price ${selected?.index===i?'is-written':''}"><small>#${i}</small>${d?`<s>${v.model[i]}</s>`:`<span class="jg-original">${v.model[i]}</span>`}<b>${price}</b><small>${d?'−'+d.discount+' · #'+d.to:v.result!==null?vi?'không giảm':'no discount':vi?'chờ…':'waiting…'}</small></button>`;}).join(''):'—','jg-lane')+`<span class="jg-hidden" data-native-array="answer" data-array-values="${jgEsc(JSON.stringify(v.locals.answer??null))}"></span>`)+
    (selected?jgCard('answer[i] -= price',`<div class="jg-equation">${jgStat('#'+selected.index,selected.before)}<i>−</i>${jgStat('#'+selected.to,selected.discount)}<i>=</i>${jgStat('answer[i]',selected.after)}</div>`):'')+jgStack(v,vi)+jgComparison(v,vi);
}
function jgRanges(v,vi,selection){
  const s=v.scratch,ready=s.count!==undefined,mid=s.mid,right=s.right,lo=s.left===undefined?null:s.left+1,hi=right===undefined?null:right-1;
  const chosen=selection&&ready&&selection[0]>=lo&&selection[0]<=mid&&selection[1]>=mid&&selection[1]<=hi?selection:null;
  let pairs='';
  if(ready){const cells=[];for(let l=lo;l<=mid;l++){let row='';for(let r=mid;r<=hi;r++)row+=`<button type="button" data-jg-pair="${l}:${r}" class="${chosen?.[0]===l&&chosen?.[1]===r?'is-written':''}" aria-label="Subarray ${l} through ${r}">[${l}…${r}]</button>`;cells.push(`<div>${row}</div>`);}pairs=jgCard(vi?'Một cách chọn đầu × một cách chọn cuối':'One start choice × one end choice',jgScroll('pairs',cells.join(''),'jg-pairs'),vi?'Chọn ô để tô đoạn con':'Select a cell to highlight its subarray');}
  return `<div class="jg-phases"><span class="${v.phase==='max'?'is-active':''}">MAX ${jgFmt(v.totals.max)}</span><i>−</i><span class="${v.phase==='min'?'is-active':''}">MIN ${jgFmt(v.totals.min)}</span></div>`+
    jgCard('nums · '+(v.phase==='min'?'MIN':'MAX'),jgBars(v,{chosen:mid,range:chosen??(ready?[lo,hi]:null)}),vi?'Khi trùng, cực trị bên phải sở hữu đoạn':'On ties, the rightmost extremum owns the subarray')+
    jgCard(vi?'Số đoạn do mid sở hữu':'Subarrays owned by mid',`<div class="jg-equation">${jgStat('mid',mid)}${jgStat('left_choices',s.left_choices)}<i>×</i>${jgStat('right_choices',s.right_choices)}<i>=</i>${jgStat('count',s.count)}</div><div class="jg-equation">${jgStat('nums[mid]',mid===undefined?null:v.model[mid])}<i>×</i>${jgStat('count',s.count)}<i>=</i>${jgStat('value',s.value)}</div>`)+pairs+jgStack(v,vi)+jgComparison(v,vi)+
    jgCard('Σ MAX − Σ MIN',`<div class="jg-equation">${jgStat('max',v.outer.max_sum)}<i>−</i>${jgStat('min',v.outer.min_sum)}<i>=</i>${jgStat('return',v.result)}</div>`);
}
function jgGrid(v,vi,rectangle){
  const grid=v.model,rows=grid.length,cols=grid[0].length,size=76,w=Math.max(260,cols*size+48),h=rows*size+65,px=c=>(w-cols*size+14)/2+c*size,py=r=>38+r*size;
  const cur=v.current,pathSet=new Set(v.path.map(p=>p.join(','))),proposal=v.proposal;
  const reachable=(r,c)=>v.id===2617&&cur&&(r===cur[0]&&c>cur[1]&&c<=cur[1]+grid[cur[0]][cur[1]]||c===cur[1]&&r>cur[0]&&r<=cur[0]+grid[cur[0]][cur[1]]);
  const nodes=grid.map((row,r)=>row.map((value,c)=>{
    const counted=v.ledger.find(row=>row.cell?.[0]===r&&row.cell?.[1]===c),active=cur?.[0]===r&&cur?.[1]===c,inRect=rectangle&&r>=rectangle.top&&r<=rectangle.bottom&&c>=rectangle.left&&c<=rectangle.right;
    return `<g class="jg-grid-cell ${value?'is-one':'is-zero'} ${active?'is-current':''} ${reachable(r,c)?'is-reachable':''} ${pathSet.has(r+','+c)?'is-route':''} ${inRect?'is-rectangle':''}" data-grid-r="${r}" data-grid-c="${c}" data-grid-value="${value}" data-grid-dp="${v.locals.dp?.[r]?.[c]??''}" data-jg-cell="${r}:${c}" role="button" tabindex="0" aria-label="Cell ${r}, ${c}, value ${value}"><rect x="${px(c)}" y="${py(r)}" width="62" height="62" rx="10"/><text class="jg-cell-value" x="${px(c)+31}" y="${py(r)+27}">${value}</text><text class="jg-small" x="${px(c)+31}" y="${py(r)+48}">${v.id===2617?'d '+(v.locals.dp?.[r]?.[c]??'—'):counted?'+'+counted.count:`${r},${c}`}</text></g>`;
  }).join('')).join('');
  const arrow=(from,to,cls)=>{const horizontal=from[0]===to[0];return `<path class="jg-grid-arrow ${cls}" d="M${px(from[1])+(horizontal?64:11)},${py(from[0])+(horizontal?11:64)}L${px(to[1])+(horizontal?-3:11)},${py(to[0])+(horizontal?11:-3)}" marker-end="url(#jg-grid-arrow)"/>`;};
  const arrows=v.path.slice(1).map((p,k)=>arrow(v.path[k],p,'is-route')).join('')+(proposal?arrow(proposal.from,proposal.to,'is-proposal'):'');
  return jgCard(v.id===2617?'grid · '+(vi?'giá trị / số ô đã ghé':'jump capacity / visited count'):'mat · '+(vi?'chọn một hình chữ nhật':'select a rectangle'),jgScroll('grid',`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="group"><defs><marker id="jg-grid-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10Z"/></marker></defs>${nodes}${arrows}</svg>`,'jg-canvas')+`<div class="jg-legend"><span class="is-purple">□ ${vi?'đang xét':'current'}</span><span class="is-green">□ ${v.id===2617?vi?'có thể nhảy tới':'can jump here':vi?'toàn số 1 · +k: số hình kết thúc ở ô':'all ones · +k: rectangles ending here'}</span>${v.id===2617?`<span class="is-gold">→ ${vi?'ứng viên đang xét':'current proposal'}</span>`:''}</div>`);
}
function jgHeap(v,kind,vi){
  const cur=v.current,name=kind==='row'?'row_heaps':'col_heaps',index=cur?cur[kind==='row'?0:1]:null,heap=index===null?null:v.locals[name]?.[index],position=cur?cur[kind==='row'?1:0]:null;
  const w=Math.max(280,(heap?.length??0)*90),depth=heap?.length?Math.floor(Math.log2(heap.length)):0,h=Math.max(90,(depth+1)*82+15);
  const point=k=>{const level=Math.floor(Math.log2(k+1)),offset=k-(2**level-1);return {x:(offset+.5)*w/(2**level),y:32+level*82};};
  const content=heap?heap.map((entry,k)=>{const p=point(k),parent=k?point(Math.floor((k-1)/2)):null,expired=entry[1]<position;return `${parent?`<path class="jg-heap-link" d="M${parent.x},${parent.y+17}L${p.x},${p.y-17}"/>`:''}<g class="jg-heap-node ${k===0?'is-current':''} ${expired?'is-expired':''}" data-heap-index="${k}"><rect x="${p.x-39}" y="${p.y-21}" width="78" height="45" rx="8"/><text x="${p.x}" y="${p.y-3}">d ${entry[0]} · #${entry[2]}</text><text class="jg-small" x="${p.x}" y="${p.y+14}">≤ ${entry[1]} ${expired?'×':''}</text></g>`;}).join(''):'';
  return jgCard(`${kind==='row'?vi?'Heap hàng':'Row heap':vi?'Heap cột':'Column heap'} ${index??'—'}`,jgScroll(name,`<div data-native-heap="${name}" data-heap-values="${jgEsc(JSON.stringify(heap??null))}">${heap?.length?`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="group">${content}</svg>`:heap?'∅':'—'}</div>`,'jg-canvas'),vi?'Ưu tiên d nhỏ · × đã hết tầm với':'Smallest d first · × out of reach');
}
function jgVisited(v,vi){
  const p=v.proposal;
  return jgGrid(v,vi)+
    (v.change?.kind==='pop'?jgCard(vi?'Lấy ứng viên hết tầm với ra khỏi heap':'Pop an out-of-reach candidate',`<div class="jg-equation">${jgStat('origin',v.change.entry[2])}${jgStat('reach',v.change.entry[1])}<i>&lt;</i>${jgStat(v.change.heap==='row'?'c':'r',v.locals[v.change.heap==='row'?'c':'r'])}<strong>×</strong></div>`):'')+
    (p?jgCard(vi?'Ứng viên từ heap':'Heap candidate',`<div class="jg-equation">${jgStat('from',p.from)}${jgStat('d',p.steps)}<i>+ 1 →</i>${jgStat('to',p.to)}${jgStat('dp',v.locals.dp[p.to[0]][p.to[1]])}<strong class="${p.accepted?'is-green':''}">${p.accepted===null?'?':p.accepted?'↓ ✓':'≥ STOP'}</strong></div>`,v.pendingParent?vi?'dp vừa đổi · chờ dòng gán parent':'dp just changed · waiting for parent assignment':''):'')+
    jgCard(vi?'Đường theo parent hiện tại':'Route from current parent pointers',jgScroll('path',v.path.map((p,k)=>`${k?'<i>→</i>':''}<span><small>[${p}]</small><b>${k+1}</b></span>`).join('')||'—','jg-path')+`<span class="jg-hidden" data-route="${jgEsc(JSON.stringify(v.path))}"></span>`,vi?'Đếm ô, gồm ô xuất phát · không phải số lần nhảy':'Count cells, including the start · not jumps')+
    `<div class="jg-two">${jgHeap(v,'row',vi)}${jgHeap(v,'col',vi)}</div>`;
}
function jgHistogram(v,vi,selection){
  const x=v.locals,latest=v.ledger.at(-1),cur=v.current??(v.result!==null?latest?.cell:null),stable=latest&&cur&&latest.cell.join(',')===cur.join(',');
  const rectangles=[];
  if(stable){let min=Infinity;for(let l=cur[1];l>=0;l--){min=Math.min(min,latest.heights[l]);for(let height=1;height<=min;height++)rectangles.push({top:cur[0]-height+1,bottom:cur[0],left:l,right:cur[1],height});}}
  const chosen=selection&&rectangles.find(p=>p.left===selection[0]&&p.height===selection[1])||rectangles.at(-1);
  const a=x.heights,w=Math.max(280,v.model[0].length*74+50),px=i=>45+i*74,base=150,scale=110/v.model.length;
  const bars=a?a.map((height,i)=>`<g class="jg-bar ${cur?.[1]===i?'is-current':''} ${v.heightColumns.includes(i)?'':'is-pending'}"><rect x="${px(i)-22}" y="${base-height*scale}" width="44" height="${Math.max(2,height*scale)}" rx="5"/><text x="${px(i)}" y="${base-height*scale-8}">${height}</text><text class="jg-small" x="${px(i)}" y="176">[${i}]</text></g>`).join(''):'';
  return jgGrid(v,vi,chosen)+jgCard('heights',jgScroll('histogram',`<svg width="${w}" height="195" viewBox="0 0 ${w} 195" role="group">${bars}</svg><span class="jg-hidden" data-native-array="heights" data-array-values="${jgEsc(JSON.stringify(a??null))}"></span>`,'jg-canvas'),vi?'Mờ: chưa cập nhật ở hàng này · giá trị heights thật':'Dimmed: not updated in this row · actual heights values')+
    jgCard(vi?'Các hình vừa được cộng':'Rectangles just counted',`<div class="jg-rectangles" data-rectangle-count="${stable?rectangles.length:''}">${rectangles.map(p=>`<button type="button" data-jg-rectangle="${p.left}:${p.height}" class="${p===chosen?'is-written':''}" aria-label="${p.height} rows by ${p.right-p.left+1} columns"><span style="--rect-w:${p.right-p.left+1};--rect-h:${p.height}"></span><small>${p.height} × ${p.right-p.left+1}</small></button>`).join('')||'—'}</div><div class="jg-stats">${jgStat('row_sum',x.row_sum)}${jgStat('answer',x.answer)}${jgStat('width',v.scratch.width)}</div>`,vi?'Chung góc phải dưới (r,c) · chọn hình để tô trên lưới':'Share bottom-right (r,c) · select a rectangle to highlight it')+jgStack(v,vi)+jgComparison(v,vi)+
    (v.change?.kind==='pop'?jgCard('POP',`<div class="jg-equation">${jgStat('old_height',x.old_height)}<i>×</i>${jgStat('old_width',x.old_width)}</div>`):'')+
    (v.change?.kind==='subtract'||v.change?.kind==='row'?jgCard('row_sum',`<div class="jg-equation"><strong>${v.change.kind==='subtract'?'−':'+'}${v.change.amount}</strong><i>→</i>${jgStat('row_sum',x.row_sum)}</div>`):'');
}
function jgNext(kind){if(typeof steps==='undefined')return -1;return steps.findIndex((s,i)=>i>stepIndex&&s.stackJumpGridView&&(kind==='line'||kind==='pop'&&s.stackJumpGridView.change?.kind==='pop'||kind==='write'&&s.stackJumpGridView.change?.kind==='write'||kind==='result'&&s.final));}
function jgGo(index){if(index<0||typeof steps==='undefined')return;if(typeof stopPlay==='function')stopPlay();stepIndex=index;renderStep();}
function jgBind(host){
  const bind=(selector,fn)=>host.querySelectorAll(selector).forEach(el=>{el.addEventListener('click',()=>fn(el));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();fn(el);}});});
  host.querySelectorAll('summary').forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')e.stopPropagation();}));
  bind('[data-jg-jump]',el=>jgGo(jgNext(el.dataset.jgJump)));
  bind('[data-jg-step]',el=>jgGo(Number(el.dataset.jgStep)));
  bind('[data-jg-case]',el=>{const id=steps[stepIndex].stackJumpGridView.id;document.getElementById('arrInput').value=JG_CASES[id][Number(el.dataset.jgCase)][0];if(typeof runViz==='function')runViz();});
  bind('[data-jg-item]',el=>{const index=Number(el.dataset.jgItem),target=steps.findIndex(s=>s.stackJumpGridView.change?.kind==='write'&&s.stackJumpGridView.change.index===index);jgGo(target<0?steps.length-1:target);});
  bind('[data-jg-cell]',el=>{const cell=el.dataset.jgCell.split(':').map(Number),target=steps.findLastIndex(s=>s.stackJumpGridView.change?.kind==='write'&&s.stackJumpGridView.change.cell?.join(',')===cell.join(','));jgGo(target<0?steps.length-1:target);});
  bind('[data-jg-pair]',el=>{if(typeof stopPlay==='function')stopPlay();renderStackJumpGrid(steps[stepIndex],{pair:el.dataset.jgPair.split(':').map(Number)});});
  bind('[data-jg-rectangle]',el=>{if(typeof stopPlay==='function')stopPlay();renderStackJumpGrid(steps[stepIndex],{rectangle:el.dataset.jgRectangle.split(':').map(Number)});});
}
function renderStackJumpGrid(step,options={}){
  const v=step.stackJumpGridView,host=document.getElementById('treeView');if(!v||!host)return;
  const vi=typeof lang!=='undefined'&&lang==='vi',open=host.querySelector('.jg-native')?.open??false,historyOpen=host.querySelector('.jg-history')?.open??false;
  const scrolls=new Map([...host.querySelectorAll('[data-jg-scroll]')].map(el=>[el.dataset.jgScroll,{x:el.scrollLeft,y:el.scrollTop}]));
  const main=v.id===3221?jgHops(v,vi):v.id===1475?jgPrices(v,vi):v.id===2104?jgRanges(v,vi,options.pair):v.id===2617?jgVisited(v,vi):jgHistogram(v,vi,options.rectangle);
  const jumps=[['line',vi?'Dòng →':'Line →'],...(v.id===3221?[]:[['pop','POP →']]),['write',v.id===1475?vi?'Giảm →':'Discount →':vi?'Cộng / ghi →':'Add / write →'],['result',vi?'Kết quả ↠':'Result ↠']];
  host.innerHTML=`<article class="tr-viz jg-viz" data-problem-id="${v.displayId??v.id}" data-source-line="${v.source.line}" role="region" aria-label="LeetCode ${v.displayId??v.id}"><header class="tr-header"><div><small>LEETCODE ${v.displayId??v.id}</small><h2>${JG_TITLES[v.id][vi?0:1]}</h2></div><code>${v.id===2617?'ROW + COLUMN HEAPS':v.id===3221?'SUFFIX MAX':'MONOTONIC STACK'}</code></header><nav class="tr-presets" aria-label="Examples">${JG_CASES[v.id].map((c,i)=>`<button type="button" data-jg-case="${i}">${c[vi?1:2]}</button>`).join('')}</nav><div class="tr-source"><span>${vi?'Sau dòng':'After line'} <b>L${v.source.line}</b></span><code>${jgEsc(v.source.text)}</code>${v.branch===null?'':`<strong class="${v.branch?'is-good':'is-muted'}">${v.branch?'True ✓':'False ×'}</strong>`}</div><div class="jg-work">${main}</div><details class="tr-native jg-history"><summary>${vi?'Các lần cập nhật':'Recorded updates'} · ${v.ledger.length}</summary><div class="jg-ledger">${v.ledger.map(row=>`<button type="button" data-jg-step="${row.step}"><small>${row.cell?'['+row.cell+']':row.phase?row.phase+' #'+row.index:'#'+row.index}</small><b>${jgEsc(jgFmt(row.total??row.after))}</b></button>`).join('')||'∅'}</div></details><details class="tr-native jg-native"><summary>${vi?'Biến Python · từng frame':'Python locals · every frame'}</summary>${v.frames.map(f=>`<div class="jg-frame"><code>${jgEsc(f.name)}</code><pre>${jgEsc(JSON.stringify(f.locals,null,2))}</pre></div>`).join('')}</details>${v.result===null?'':`<output class="tr-answer" data-answer="${jgEsc(JSON.stringify(v.result))}"><small>${vi?'Kết quả':'Result'}</small><strong>${jgEsc(jgFmt(v.result))}</strong></output>`}<footer class="tr-footer"><div>${jumps.map(([kind,label])=>`<button type="button" data-jg-jump="${kind}" ${jgNext(kind)<0?'disabled':''}>${label}</button>`).join('')}</div></footer></article>`;
  const details=host.querySelector('.jg-native'),history=host.querySelector('.jg-history');if(details)details.open=open;if(history)history.open=historyOpen;
  for(const el of host.querySelectorAll('[data-jg-scroll]')){const saved=scrolls.get(el.dataset.jgScroll);if(saved){el.scrollLeft=saved.x;el.scrollTop=saved.y;}const active=el.querySelector('.is-current');if(active){const a=el.getBoundingClientRect(),b=active.getBoundingClientRect();if(b.left<a.left+5)el.scrollLeft-=a.left+5-b.left;if(b.right>a.right-5)el.scrollLeft+=b.right-a.right+5;}}
  jgBind(host);
}
