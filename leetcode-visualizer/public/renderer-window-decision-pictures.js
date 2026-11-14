'use strict';
function wdText(vi,en){return typeof lang!=='undefined'&&lang==='vi'?vi:en;}
function wdEscape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function wdFormat(value){return value===null||value===undefined?'—':Array.isArray(value)?value.join(', '):String(value);}
function wdRead(step){
  if(step?.windowDecisionView)return step.windowDecisionView;
  if(step?.sameTreeView)return {id:100,kind:'trees',...step.sameTreeView,final:Boolean(step.final)};
  if(step?.equalSubarrays3505View){const v=step.equalSubarrays3505View;return {id:3505,kind:'equal',...v,items:v.nums,right:v.start===null?-1:v.start+v.x-1,left:v.start??0,final:Boolean(step.final)};}
  if(step?.vowelSubstrings3306View){const v=step.vowelSubstrings3306View;return {id:3306,kind:'vowels',...v,items:[...v.word],right:v.right??-1,left:v.left??0,final:Boolean(step.final)};}
  if(step?.occurrenceLookupView){const v=step.occurrenceLookupView;return {id:3159,kind:'lookup',...v,items:v.nums,right:v.currentIndex,final:Boolean(step.final)};}
  if(step?.randomPickView)return {id:528,kind:'weighted',...step.randomPickView,final:Boolean(step.final)};
  return null;
}
function wdCard(title,body,cls=''){return `<section class="wd-card ${cls}"><header>${title}</header>${body}</section>`;}
function wdMetric(label,value,cls=''){return `<span class="${cls}"><small>${label}</small><b>${wdEscape(wdFormat(value))}</b></span>`;}
function wdTape(v,range=null,options={}){
  const left=range?.[0]??v.left??0,right=range?.[1]??v.right??-1,items=options.items||v.items||[],colors=[...new Set(items)];
  return `<div class="wd-scroll wd-main-scroll" tabindex="0" role="region" aria-label="${wdText('Dãy và cửa sổ','Sequence and window')}"><div class="wd-tape">${items.map((n,i)=>{
    const inside=i>=left&&i<=right,member=v.members?.includes(i),zero=v.kind==='moves'&&n===0;
    const counter=['frequency','distinct-sum','replacement'].includes(v.kind),pending=counter&&i===v.pending,removed=i===v.removed,buffered=counter&&member&&!inside;
    let icon=i===left&&i===right?'L/R':i===left?'L':i===right?'R':'';
    if(v.kind==='grumpy')icon=v.grumpy[i]?(inside?'☀':'☁'):'☀';
    if(v.kind==='moves')icon=i===v.write&&i===v.right?'write / i':i===v.write?'write':i===v.right?'i':'';
    if(pending)icon+=' ＋';if(removed)icon+=' ×';if(buffered)icon+=' −';
    return `<span class="wd-cell color${colors.indexOf(n)%6} ${inside&&!pending&&!removed?'inside':''} ${pending||buffered?'pending':''} ${removed?'removed':''} ${zero?'zero':''} ${v.kind==='grumpy'?(v.grumpy[i]?(inside?'rescued':'lost'):'always'):''} ${i===v.right?'focus':''} ${options.indices?.includes(i)?'chosen':''}" data-wd-index="${i}" data-value="${wdEscape(n)}" data-member="${Boolean(member)}"><small>${i}</small><b>${wdEscape(n===' '?'␠':n)}</b>${v.kind==='grumpy'?`<div class="wd-people">${Array.from({length:Math.min(6,n)},()=>'<i>●</i>').join('')}${n>6?'<em>…</em>':''}</div>`:''}<em>${icon||'　'}</em></span>`;
  }).join('')||'<span class="wd-empty">∅</span>'}</div></div>`;
}
function wdBins(freq,required=[],limit=null){
  const keys=[...new Set([...required.map(String),...Object.keys(freq||{})])];
  return `<div class="wd-bins">${keys.map((key,i)=>{const n=freq?.[key]??0,over=limit!==null&&n>limit;return `<article class="wd-bin color${i%6} ${over?'bad':n?'good':'missing'}" data-wd-key="${wdEscape(key)}" data-count="${n}"><b>${wdEscape(key)}</b><div class="wd-dots">${Array.from({length:Math.min(12,Math.max(n,Math.min(limit??1,4)))},(_,j)=>`<i class="${j<n?'filled':''} ${limit!==null&&j>=limit?'extra':''}"></i>`).join('')}${n>12?'<em>…</em>':''}</div><strong>${n}${limit!==null?' / '+limit:''}</strong></article>`;}).join('')||'<i class="wd-empty">∅</i>'}</div>`;
}
function wdBudget(used,limit){return `<div class="wd-budget ${used>limit?'bad':'good'}"><span>${wdText('Ngân sách','Budget')}</span><div><i style="width:${limit===0?(used?100:0):Math.min(100,used/limit*100)}%"></i></div><b>${used} / ${limit} ${used>limit?'×':'✓'}</b></div>`;}
function wdBest(v){
  const best=v.best||[],range=best.length===2&&['budget','grumpy','prefix','points'].includes(v.kind)?best:best.length?[best[0],best.at(-1)]:[0,-1];
  return wdCard(`🏆 ${wdText('Tốt nhất đã tìm thấy','Best so far')} <strong class="wd-answer" data-wd-answer="${wdEscape(wdFormat(v.answer))}">${wdEscape(wdFormat(v.answer))}</strong>`,range[1]>=range[0]?wdTape({...v,members:undefined,pending:null,removed:null},range,{indices:Array.from({length:range[1]-range[0]+1},(_,i)=>range[0]+i)}):'<div class="wd-empty">∅</div>','wd-best');
}
function wdGrumpy(v){
  const saved=v.items.slice(v.left,v.right+1).reduce((sum,n,j)=>sum+(v.grumpy[v.left+j]?n:0),0);
  return `<div class="wd-metrics">${wdMetric('☀ '+wdText('Luôn hài lòng','Always happy'),v.baseline,'good')}${wdMetric(wdText('Cứu thêm · extra','Rescued · extra'),v.extra,'gold')}${wdMetric('minutes',v.k)}</div>`+
    wdCard(`<span class="good">☀ ${wdText('hài lòng','happy')}</span>　<span class="bad">☁ ${wdText('mất khách','lost')}</span>　<span class="gold">▣ ${wdText('kỹ thuật bí mật','secret technique')}</span>`,wdTape(v))+
    wdCard(wdText('Chỉ cứu thêm ở phút grumpy = 1','Only grumpy = 1 adds extra customers'),`<div class="wd-equation"><span>${v.baseline}<small>baseline</small></span><i>＋</i><span>${v.bestExtra}<small>bestExtra</small></span><i>＝</i><b>${v.answer}</b></div>`)+
    (v.extra!==saved&&!v.final?`<div class="wd-callout">extra: ${v.extra} → ${saved} <small>${wdText('đang thêm / bỏ phút','adding / removing a minute')}</small></div>`:'')+
    wdBest({...v,answer:v.baseline+v.bestExtra});
}
function wdCost(v){
  const left=v.left,right=v.right;
  const pairs=`<div class="wd-scroll"><div class="wd-cost-pairs">${v.items.map((cost,i)=>`<article class="${i>=left&&i<=right?'inside':''}" data-cost-index="${i}" data-cost="${cost}"><small>${i}</small><b>${wdEscape(v.s[i])}</b><i>↓</i><b>${wdEscape(v.t[i])}</b><strong>${cost}</strong><div class="wd-dots">${Array.from({length:Math.min(6,cost)},()=>'<i class="filled"></i>').join('')}${cost>6?'<em>…</em>':''}</div></article>`).join('')}</div></div>`;
  return wdCard('s → t · |ord(s[i]) − ord(t[i])|',pairs)+wdBudget(v.sum,v.k)+wdBest(v);
}
function wdFrequency(v){
  let freq=v.freq,used=v.sum,range=null;
  if(v.final&&v.best?.length){range=[v.best[0],v.best.at(-1)];freq={};for(const n of v.items.slice(range[0],range[1]+1))freq[n]=(freq[n]||0)+1;used=v.items.slice(range[0],range[1]+1).reduce((a,b)=>typeof b==='number'?a+b:a,0);}
  const currentRange=range||[v.left,v.right],slice=v.items.slice(currentRange[0],currentRange[1]+1),most=Object.entries(freq).sort((a,b)=>b[1]-a[1])[0],target=most?.[0]??'',need=slice.filter(n=>String(n)!==target).length;
  const scene=range?{...v,members:undefined,pending:null,removed:null}:v;
  let body=wdCard(v.final?wdText('🏆 Cửa sổ tốt nhất','🏆 Best window'):wdText('Cửa sổ hiện tại','Current window'),wdTape(scene,currentRange));
  if(v.kind==='replacement')body+=wdBudget(need,v.k)+wdCard(`${wdText('Đổi thành','Turn into')} ${wdEscape(target)}`,`<div class="wd-convert">${slice.map(n=>`<span class="${String(n)!==target?'changed':''}"><b>${wdEscape(n)}</b>${String(n)!==target?`<i>→</i><strong>${wdEscape(target)}</strong>`:'<i>✓</i>'}</span>`).join('')||'<i>∅</i>'}</div>`);
  else body+=wdCard(v.kind==='distinct-sum'?`freq · ${wdText('cần k loại khác nhau','need k distinct values')}`:`freq[value] ≤ ${v.k}`,wdBins(freq,[],v.kind==='distinct-sum'?1:v.k));
  if(v.kind==='distinct-sum')body+=`<div class="wd-metrics">${wdMetric('Σ',used)}${wdMetric(wdText('Số loại','Distinct'),Object.values(freq).filter(n=>n>0).length)}${wdMetric('k',v.k)}</div>`;
  body+=wdBest(v);return body;
}
function wdCredited(v){
  const credited=new Set();
  for(const group of v.groups||[])for(let i=group.from;i<=group.to;i++)credited.add(group.direction==='ends'?`${group.fixed}:${i}`:`${i}:${group.fixed}`);
  return credited;
}
function wdCounting(v,selection){
  const credited=wdCredited(v),n=v.items.length,base=Math.max(0,Math.min(Math.max(0,v.right-12),n-24)),size=Math.min(24,n),g=v.candidate||v.groups?.at(-1);
  const selected=selection&&credited.has(selection)?selection:g?g.direction==='ends'?`${g.fixed}:${g.from}`:`${g.from}:${g.fixed}`:null;
  const chosen=selected?.split(':').map(Number);
  const grid=`<div class="wd-scroll"><div class="wd-matrix" style="--wd-cols:${size+1}"><small>start ↓<br>end →</small>${Array.from({length:size},(_,i)=>`<small>${base+i}</small>`).join('')}${Array.from({length:size},(_,row)=>`<small>${base+row}</small>${Array.from({length:size},(_,col)=>{const a=base+row,b=base+col,key=`${a}:${b}`,valid=credited.has(key),current=g&&(g.direction==='ends'?a===g.fixed&&b>=g.from&&b<=g.to:b===g.fixed&&a>=g.from&&a<=g.to);return a>b?'<span class="void"></span>':`<button type="button" data-wd-range="${key}" class="${valid?'counted':''} ${current?'new':''} ${selected===key?'selected':''}" ${valid?'':'disabled'} aria-label="[${a}, ${b}]">${valid?'✓':'·'}</button>`;}).join('')}`).join('')}</div></div>`;
  let counters=v.id===2962?wdBins(v.freq,[v.target],null):v.id===1358&&v.approach===2?`<div class="wd-last">${Object.entries(v.last||{}).map(([ch,index])=>`<span><b>${ch}</b><i>→</i><strong>${index}</strong></span>`).join('')}</div>`:wdBins(v.freq,v.required||[],null);
  const fan=g?`<div>${Array.from({length:Math.min(18,g.to-g.from+1)},(_,i)=>`<span>${g.from+i}</span>`).join('')}${g.to-g.from+1>18?'<span>…</span>':''}</div>`:'';
  const addition=g?`<div class="wd-count-fan">${g.direction==='ends'?`<b>${g.fixed}</b><i>→</i>${fan}`:`${fan}<i>→</i><b>${g.fixed}</b>`}<strong>＋${g.to-g.from+1}</strong></div>`:'<div class="wd-empty">∅</div>';
  return `<div class="wd-metrics">${wdMetric(wdText('Đã đếm','Counted'),v.answer,'good')}${wdMetric(v.id===2962?`max = ${v.target} · ≥ k`:'required',v.id===2962?v.k:(v.required||['a','b','c']).length)}</div>`+
    wdCard(wdText('Cửa sổ và bộ đếm hiện tại','Current window and counters'),wdTape(v)+counters)+
    wdCard(v.id===1358&&v.approach===2?wdText('Nhiều start → cùng end','Several starts → one end'):wdText('Cùng start → nhiều end','One start → several ends'),addition)+
    wdCard(`${wdText('Mỗi ô xanh = một đoạn đã đếm','Each green cell = one counted range')} · ${base}…${base+size-1}`,grid)+
    (chosen?wdCard(`[${chosen.join(', ')}]`,wdTape(v,chosen,{indices:Array.from({length:chosen[1]-chosen[0]+1},(_,i)=>chosen[0]+i)}),'wd-witness'):'');
}
function wdDeque(v){
  const label=i=>v.kind==='prefix'?v.prefix[i]:v.points[i][1]-v.points[i][0];
  const q=`<div class="wd-scroll"><div class="wd-deque"><small>front</small>${v.deque.map((i,j)=>`<span class="${j===0?'front':''}" data-deque-index="${i}" data-deque-value="${label(i)}"><small>${v.kind==='prefix'?'P':'y−x'}[${i}]</small><b>${label(i)}</b></span>`).join('<i>→</i>')||'<b>∅</b>'}<small>back</small></div></div>`;
  const removed=v.removed!==null?`<div class="wd-pop"><span>${v.phase==='pop-back'?'back':'front'}</span><b>× ${v.removed}</b><i>→</i><strong>${v.phase==='pop-back'?wdText('ứng viên mới tốt hơn','new candidate dominates'):v.kind==='points'?wdText('quá xa','too far'):wdText('đã tìm được đoạn','valid range found')}</strong></div>`:'';
  return wdCard(v.kind==='prefix'?'deque · P[j] ↑':'deque · yᵢ − xᵢ ↓',q+removed);
}
function wdPlot(v){
  const isPrefix=v.kind==='prefix',points=isPrefix?v.prefix.map((p,i)=>[i,p]):v.points,width=Math.max(420,points.length*42+100),height=220;
  const minX=Math.min(...points.map(p=>p[0])),maxX=Math.max(...points.map(p=>p[0])),minY=Math.min(0,...points.map(p=>p[1])),maxY=Math.max(1,...points.map(p=>p[1]));
  const x=n=>48+(n-minX)/(maxX-minX||1)*(width-110),y=n=>175-(n-minY)/(maxY-minY||1)*130,current=points[v.right];
  const band=!isPrefix&&current?`<rect class="wd-plot-band" x="${x(Math.max(minX,current[0]-v.k))}" y="20" width="${Math.max(2,x(current[0])-x(Math.max(minX,current[0]-v.k)))}" height="165"/><text class="wd-plot-label" x="${x(current[0])}" y="210" text-anchor="end">xⱼ − xᵢ ≤ ${v.k}</text>`:'';
  return `<div class="wd-scroll wd-plot-scroll"><svg class="wd-plot" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${isPrefix?'Prefix sums':'Points and allowed x distance'}">${band}<path class="wd-axis" d="M35 ${y(0)} H${width-30}"/>${isPrefix?`<path class="wd-prefix-line" d="${points.map((p,i)=>`${i?'L':'M'}${x(p[0])} ${y(p[1])}`).join(' ')}"/>`:''}${points.map((p,i)=>`<g class="${i===v.right?'current':v.deque.includes(i)?'queued':'dim'}"><circle cx="${x(p[0])}" cy="${y(p[1])}" r="${i===v.right?8:5}"/><text x="${x(p[0])}" y="${y(p[1])-13}" text-anchor="middle">${isPrefix?p[1]:`(${p[0]},${p[1]})`}</text><text class="wd-plot-index" x="${x(p[0])}" y="195" text-anchor="middle">${i}</text></g>`).join('')}</svg></div>`;
}
function wdMonotonic(v){
  const c=v.candidate,chosen=c?[c.left,c.right]:v.final&&v.best.length?v.best:null;
  let equation='';
  if(c&&v.kind==='prefix')equation=`P[${c.right+1}] − P[${c.left}] = ${v.prefix[c.right+1]} − (${v.prefix[c.left]}) = ${c.sum} ≥ ${v.k}`;
  if(c&&v.kind==='points'){const [x,y]=v.points[c.right],[a,b]=v.points[c.left];equation=`(${y} + ${x}) + (${b} − ${a}) = ${c.sum}`;}
  return `<div class="wd-metrics">${wdMetric(v.kind==='prefix'?'sum ≥ k':'Δx ≤ k',v.k)}${wdMetric(v.kind==='prefix'?wdText('Ngắn nhất','Shortest'):wdText('Lớn nhất','Maximum'),v.answer,'good')}</div>`+
    wdCard(v.kind==='prefix'?'P[i] − P[j] = sum(nums[j…i−1])':'yᵢ + yⱼ + |xᵢ − xⱼ| = (yⱼ + xⱼ) + (yᵢ − xᵢ)',wdPlot(v))+
    wdDeque(v)+(equation?wdCard(wdText('Cặp đang xét','Current pair'),`<div class="wd-formula">${wdEscape(equation)}</div>${v.kind==='prefix'?`<div class="wd-equation"><small>length</small><b>${c.right-c.left+1}</b></div>`:''}`):'')+
    (v.kind==='prefix'?wdCard(chosen?`nums[${chosen[0]}…${chosen[1]}]`:'nums',wdTape({...v,left:chosen?.[0]??0,right:chosen?.[1]??-1,removed:null,pending:null})):v.best.length?wdCard('🏆 '+wdText('Cặp tốt nhất','Best pair'),`<div class="wd-equation"><span>${wdEscape(v.items[v.best[0]])}</span><i>↔</i><span>${wdEscape(v.items[v.best[1]])}</span><b>${wdFormat(v.answer)}</b></div>`):'');
}
function wdBeautiful(v){
  const c=v.candidate?.text??'',b=v.bestText??'',sameLength=c&&b&&c.length===b.length,diff=sameLength?[...c].findIndex((ch,i)=>ch!==b[i]):-1;
  const bits=(s,cls)=>`<div class="wd-bits ${cls}">${[...s].map((ch,i)=>`<span class="${i===diff?'difference':''}">${ch}</span>`).join('')||'<i>∅</i>'}</div>`;
  return wdCard(v.approach===2?`k = ${v.k} · ${v.positions.length} ${wdText('vị trí bit 1','1-bit positions')}`:`1s: ${v.ones??0} / ${v.k}`,wdTape(v))+
    (v.approach===2?wdCard(wdText('Vị trí bit 1','Positions of 1-bits'),`<div class="wd-rounds">${v.positions.map(i=>`<span class="${v.candidate&&i>=v.candidate.left&&i<=v.candidate.right?'good':''}">${i}</span>`).join('')}</div>`):'')+
    wdCard(wdText('① ngắn hơn　② từ điển nhỏ hơn','① shorter　② lexicographically smaller'),`<div class="wd-compare"><small>candidate · ${c.length}</small>${bits(c,'candidate')}<small>best · ${b.length}</small>${bits(b,'best')}</div>${sameLength?`<div class="wd-formula">${wdEscape(c)} ${c===b?'=':c<b?'<':'>'} ${wdEscape(b)}</div>`:''}`)+
    `<div class="wd-equation"><small>best</small><b data-wd-answer="${wdEscape(v.answer)}">${wdEscape(v.answer||'∅')}</b></div>`;
}
function wdCarpet(v){
  const lo=Math.min(...v.tiles.map(t=>t[0]),v.carpet?.[0]??Infinity),hi=Math.max(...v.tiles.map(t=>t[1]+1),v.carpet?.[1]+1||-Infinity),width=700,x=n=>35+(n-lo)/(hi-lo||1)*630;
  const start=v.carpet?.[0],end=v.carpet?.[1],overlap=(a,b)=>start===undefined?0:Math.max(0,Math.min(b,end)-Math.max(a,start)+1);
  const picture=`<div class="wd-scroll"><svg class="wd-carpet" width="700" height="180" viewBox="0 0 700 180" role="img" aria-label="White tile intervals and carpet">${start!==undefined?`<rect class="wd-carpet-band" x="${x(start)}" y="35" width="${x(end+1)-x(start)}" height="85" rx="10"/><text x="${x(start)}" y="23">${start}</text><text x="${x(end+1)}" y="23" text-anchor="end">${end}</text>`:''}${v.tiles.map(([a,b])=>`<g><rect class="wd-tile" x="${x(a)}" y="68" width="${x(b+1)-x(a)}" height="30" rx="4"/><text x="${x(a)}" y="145">${a}</text><text x="${x(b+1)}" y="160" text-anchor="end">${b}</text>${overlap(a,b)?`<rect class="wd-tile-covered" x="${x(Math.max(a,start))}" y="68" width="${x(Math.min(b,end)+1)-x(Math.max(a,start))}" height="30" rx="4"/>`:''}</g>`).join('')}</svg></div>`;
  return `<div class="wd-metrics">${wdMetric('carpetLen',v.k)}${wdMetric(wdText('Đang phủ','Covered now'),v.tiles.reduce((sum,[a,b])=>sum+overlap(a,b),0),'gold')}${wdMetric('🏆',v.answer,'good')}</div>`+wdCard(wdText('Thảm vàng · đoạn trắng · phần phủ xanh','Gold carpet · white intervals · green coverage'),picture)+wdCard(wdText('Đếm phần giao, không đếm khoảng trống','Count intersections, skip gaps'),`<div class="wd-rounds">${v.tiles.map(([a,b])=>`<span><small>[${a},${b}]</small><b>${overlap(a,b)}</b></span>`).join('')}</div>`);
}
function wdMoves(v){
  return wdCard(wdText('Giữ nguyên thứ tự số khác 0','Keep the nonzero order'),wdTape({...v,left:0,right:v.right},null,{indices:Array.from({length:v.write},(_,i)=>i)}))+
    `<div class="wd-metrics">${wdMetric('write',v.write,'good')}${wdMetric('i',v.right)}${wdMetric(wdText('Đã giữ','Kept'),v.write)}</div>`+
    (v.phase==='swap'?wdCard(`nums[${v.swap.left}] ⇄ nums[${v.swap.right}]`,`<div class="wd-equation"><span>${v.before[v.swap.left]}<small>[${v.swap.left}]</small></span><i>⇄</i><span>${v.before[v.swap.right]}<small>[${v.swap.right}]</small></span></div>`):'')+
    (v.final?wdCard('result',`<div class="wd-stable">${v.items.map(n=>`<b class="${n===0?'zero':''}">${n}</b>`).join('')}</div>`):'');
}
function wdLookup(v,selection){
  const q=v.final?Math.min(v.queries.length-1,Math.max(0,Number(selection)||0)):v.queryIndex,occ=v.queries[q],position=v.positions[occ-1],result=q>=0?(position??-1):null;
  const tape=wdTape({...v,left:0,right:-1},null,{indices:v.positions});
  const map=`<div class="wd-scroll"><div class="wd-lookup-map">${v.positions.map((index,rank)=>`<span class="${rank+1===occ?'selected':''}" data-occurrence="${rank+1}" data-position="${index}"><small>#${rank+1}</small><b>${index}</b><small>nums[${index}] = ${v.x}</small></span>`).join('')||'<i>∅</i>'}</div></div>`;
  return wdCard(`x = ${v.x}`,tape)+wdCard(wdText('Lần xuất hiện # → index','Occurrence # → index'),map)+
    (result!==null?wdCard(wdText('Query là 1-based','Query is one-based'),`<div class="wd-equation"><span>${occ}<small>query</small></span><i>→</i><span>positions[${occ-1}]</span><i>→</i><b class="${result===-1?'bad':'good'}">${result}</b></div>`):'')+
    `<nav class="wd-rounds">${v.queries.map((n,i)=>`<button type="button" data-wd-query="${i}" class="${i===q?'selected':''}" ${!v.final&&i>=v.answer.length?'disabled':''}><small>q${i+1} · #${n}</small><b>${v.answer[i]??'…'}</b></button>`).join('')}</nav>`;
}
function wdWeighted(v){
  if(v.method===3)return wdAlias(v);
  const colors=['var(--wd-blue)','var(--wd-green)','var(--wd-purple)','var(--wd-gold)','var(--wd-red)'];
  const width=700,x=n=>25+n/v.total*650;let before=0;
  const bands=v.w.map((weight,i)=>{const start=before;before+=weight;return `<g><rect x="${x(start)}" y="28" width="${x(before)-x(start)}" height="45" fill="${colors[i%colors.length]}" opacity=".4"/><text x="${x(start)}" y="97">${start+1}</text><text x="${x(before)}" y="114" text-anchor="end">${before}</text></g>`;}).join('');
  const target=v.target===null?'':`<path class="wd-ticket-pointer" d="M${x(v.target-.5)},10 V78"/><path class="wd-ticket-pointer-fill" d="M${x(v.target-.5)-6},5 H${x(v.target-.5)+6} L${x(v.target-.5)},16 Z"/>`;
  const legend=`<div class="wd-weight-legend">${v.w.map((weight,i)=>`<span style="--weight-color:${colors[i%colors.length]}"><small>index ${i}</small><b>${weight}/${v.total}</b><em>${Number((100*weight/v.total).toPrecision(3))}%</em></span>`).join('')}</div>`;
  const prefix=`<div class="wd-scroll"><div class="wd-weight-prefix">${v.w.map((_,i)=>`<span class="${v.lo!==null&&i>=v.lo&&i<=v.hi?'inside':''} ${i===v.mid?'mid':''} ${i===v.result?'resolved':''}" data-weight-index="${i}" data-prefix-value="${v.prefix[i]??''}"><small>${i}${i===v.lo&&i===v.hi?' · L/R':i===v.lo?' · L':i===v.hi?' · R':''}</small><b>${v.prefix[i]??'…'}</b><em>${i===v.mid?'mid':'　'}</em></span>`).join('')}</div></div>`;
  const comparison=v.mid!==null&&v.target!==null&&v.prefix[v.mid]!==undefined?`<div class="wd-formula">prefix[${v.mid}] = ${v.prefix[v.mid]} ${v.prefix[v.mid]<v.target?'&lt;':'≥'} ${v.target} → ${v.prefix[v.mid]<v.target?'lo = mid + 1':'hi = mid'}</div>`:'';
  const linear=v.method===2?`<div class="wd-scroll"><div class="wd-weight-prefix">${v.w.map((weight,i)=>`<span class="${i<=v.scanIndex?'inside':''} ${i===v.scanIndex?'mid':''} ${i===v.result?'resolved':''}"><small>w[${i}]</small><b>${weight}</b><em>${i===v.scanIndex?'i':'　'}</em></span>`).join('')}</div></div><div class="wd-equation"><small>cumulative</small><b>${v.cumulative}</b>${v.target!==null?`<i>${v.cumulative>=v.target?'≥':'&lt;'}</i><span>${v.target}<small>target</small></span>`:''}</div>`:'';
  return `<div class="wd-metrics">${wdMetric('Σ weights',v.total)}${wdMetric(wdText('target · mô phỏng','target · simulated'),v.target,'gold')}${wdMetric('pickIndex →',v.result,'good')}</div>`+
    wdCard(wdText('Dải vé 1…total · độ rộng tỉ lệ với trọng số','Tickets 1…total · width is proportional to weight'),`<div class="wd-scroll"><svg class="wd-weight-bar" width="700" height="130" viewBox="0 0 700 130" role="img" aria-label="Weighted ticket intervals">${bands}${target}</svg></div>`+legend)+
    wdCard(v.method===2?wdText('Cộng từng trọng số đến khi ≥ target','Accumulate weights until ≥ target'):wdText('Tìm prefix đầu tiên ≥ target','Find the first prefix ≥ target'),v.method===2?linear:prefix+comparison)+
    `<nav class="wd-rounds">${v.targets.map((t,i)=>`<button type="button" data-wd-pick="${i+1}" class="${v.pickNumber===i+1?'selected':''}"><small>target ${t}</small><b>${v.picks[i]?.index??'…'}</b></button>`).join('')}</nav>`;
}
function wdAlias(v){
  const colors=['var(--wd-blue)','var(--wd-green)','var(--wd-purple)','var(--wd-gold)','var(--wd-red)'];
  const columns=`<div class="wd-scroll wd-alias-scroll"><div class="wd-alias-columns">${v.w.map((_,i)=>{
    const cut=v.cut[i],alias=v.alias[i],ready=cut!==undefined,ratio=ready?100*cut/v.total:0;
    return `<article class="${i===v.column?'selected':''} ${i===v.s||i===v.l?'active':''}" data-alias-column="${i}" data-alias-cut="${cut??''}" data-alias-owner="${alias??''}"><small>column ${i}</small><div class="wd-alias-cup"><div class="wd-alias-own" style="height:${ratio}%;background:${colors[i%colors.length]}">${ready&&cut?i:''}</div>${ready&&cut<v.total?`<div class="wd-alias-other" style="height:${100-ratio}%;background:${colors[(alias??0)%colors.length]}">${alias??'…'}</div>`:''}${i===v.column&&v.roll!==null?`<i class="wd-alias-roll" style="bottom:${100*(v.roll-.5)/v.total}%"><b>${v.roll}</b></i>`:''}</div><b>cut ${cut??'…'}</b><em>alias → ${alias??'…'}</em></article>`;
  }).join('')}</div></div>`;
  const math=v.column!==null&&v.roll!==null?`<div class="wd-equation"><span>${v.column}<small>column · ${wdText('mô phỏng','simulated')}</small></span><i>→</i><span>${v.roll} ${v.roll<=v.cut[v.column]?'≤':'>'} ${v.cut[v.column]}<small>roll / cut</small></span><i>→</i><b>${v.result??'…'}</b></div>`:'';
  const mass=v.phase==='build'?wdCard('scaled = n × w · small ↔ large',`<div class="wd-alias-mass">${v.scaled.map((mass,i)=>`<span class="${v.small.includes(i)?'small':v.large.includes(i)?'large':''}"><small>${i}</small><b>${mass}</b></span>`).join('')}</div><div class="wd-rounds"><span><small>small</small><b>${v.small.join(', ')||'∅'}</b></span><i>↔</i><span><small>large</small><b>${v.large.join(', ')||'∅'}</b></span></div>`):'';
  return `<div class="wd-metrics">${wdMetric('1 / n',`1/${v.n}`)}${wdMetric('roll · 1…'+v.total,v.roll,'gold')}${wdMetric('pickIndex →',v.result,'good')}</div>`+
    wdCard(wdText('Các cột có cùng diện tích · màu = index được chọn','Equal-area columns · color = selected index'),columns)+mass+math+
    wdCard('P(index i) = w[i] / total',`<div class="wd-weight-legend">${v.w.map((weight,i)=>`<span style="--weight-color:${colors[i%colors.length]}"><small>index ${i}</small><b>${weight}/${v.total}</b></span>`).join('')}</div>`)+
    `<nav class="wd-rounds">${v.targets.map((roll,i)=>`<button type="button" data-wd-pick="${i+1}" class="${v.pickNumber===i+1?'selected':''}"><small>c=${v.columns[i]} · roll=${roll}</small><b>${v.picks[i]?.index??'…'}</b></button>`).join('')}</nav>`;
}
function wdTreeLayout(v,path){
  const all=new Set([...(v.pTopology||[]),...(v.qTopology||[])].map(n=>n.path));
  if(path&&path!=='done')all.add(path);
  if(!all.size)all.add('root');
  const positions=new Map();let next=0;
  function walk(p,depth){if(!all.has(p))return;walk(p+'.left',depth+1);positions.set(p,{x:40+next++*65,y:45+depth*83});walk(p+'.right',depth+1);}
  walk('root',0);return {positions,width:Math.max(220,next*65+15),height:Math.max(115,...[...positions.values()].map(p=>p.y+44))};
}
function wdTrees(v,step,timeline,zoom=false){
  const mismatch=timeline.map(s=>s.sameTreeView).find(a=>a?.status==='mismatch'&&a.path!=='done');
  const scene=v.final&&!v.result&&mismatch?mismatch:v,path=scene.path==='done'?null:scene.path,{positions,width,height}=wdTreeLayout(scene,path),relation=v.final?(v.result?'=':'≠'):scene.pValue===scene.qValue?'=':'≠';
  const panel=side=>{const nodes=scene[side+'Topology']||[],byPath=new Map(nodes.map(n=>[n.path,n])),matched=new Set(scene[side+'Tree'].nodes.filter(n=>n.isWord).map(n=>n.id));
    const visible=[...nodes];if(path&&!byPath.has(path))visible.push({path,value:'∅',id:null});if(!visible.length)visible.push({path:'root',value:'∅',id:null});
    return wdCard(`<b>${side}</b>`,`<div class="wd-scroll wd-tree-scroll"><svg class="wd-tree" viewBox="0 0 ${width} ${height}" role="img" aria-label="${side}">${visible.flatMap(n=>{const p=positions.get(n.path),parent=positions.get(n.path.slice(0,n.path.lastIndexOf('.')));return parent&&p?`<path class="wd-tree-edge" d="M${parent.x} ${parent.y+20} L${p.x} ${p.y-20}"/>`:'';}).join('')}${visible.map(n=>{const p=positions.get(n.path);if(!p)return'';return `<g class="wd-tree-node ${n.path===path?'active':''} ${matched.has(n.id)?'matched':''} ${scene.status==='mismatch'&&n.path===path?'mismatch':''} ${n.id===null?'null':''}" data-tree-side="${side}" data-tree-path="${n.path}" data-node-value="${wdEscape(n.value)}"><circle cx="${p.x}" cy="${p.y}" r="22"/><text x="${p.x}" y="${p.y+6}" text-anchor="middle">${wdEscape(n.value)}</text></g>`;}).join('')}</svg></div>`,'wd-tree-panel');};
  const pv=v.final&&v.result?'p':scene.pValue,qv=v.final&&v.result?'q':scene.qValue;
  const pairs=[];timeline.forEach((s,i)=>{const a=s.sameTreeView;if(a&&s.codeLines?.includes(2))pairs.push({index:i,path:a.path});});
  return `<div class="wd-equation wd-tree-pair ${relation==='≠'?'bad':'good'}"><span>${wdEscape(wdFormat(pv))}</span><i>${relation}</i><span>${wdEscape(wdFormat(qv))}</span>${typeof v.result==='boolean'?`<b>${v.result?'True ✓':'False ×'}</b>`:''}</div>`+
    `<button type="button" class="wd-tree-zoom" data-wd-tree-zoom aria-pressed="${zoom}">${zoom?'−':'＋'} ${wdText(zoom?'Thu gọn cây':'Phóng to cây',zoom?'Fit trees':'Enlarge trees')}</button><div class="wd-trees ${zoom?'zoom':''}">${panel('p')}${panel('q')}</div>`+
    `<div class="wd-tree-path">${wdEscape((path||'root').replaceAll('.left',' → L').replaceAll('.right',' → R'))}</div>`+
    wdCard(wdText('Cặp cùng vị trí · bấm để xem','Pairs at the same position · click to inspect'),`<div class="wd-rounds">${pairs.map(p=>`<button type="button" data-wd-go="${p.index}" data-wd-control="pair-${p.index}" class="${p.path===path?'selected':''}">${wdEscape(p.path.replace('root','●').replaceAll('.left','L').replaceAll('.right','R'))}</button>`).join('')}</div>`);
}
function wdVowels(v){
  const active=v.phase!=='initialize'&&v.right>=0,left=v.left+(v.removedPending?1:0),word=[...v.word],freq=v.freq;
  const totals=[0,1].map(pass=>v.totals[pass]??(v.pass===pass&&active?v.total:null));
  const exact=[];v.perRight[0].forEach((first,end)=>{const second=v.perRight[1][end];if(first!==null&&second!==null)for(let start=second;start<first&&exact.length<8;start++)exact.push([start,end]);});
  const columns=`<div class="wd-scroll"><div class="wd-vowel-columns"><div class="wd-vowel-column labels"><small>end</small><b>word</b><span>F(${v.k})</span><span>F(${v.k+1})</span><strong>−</strong></div>${word.map((ch,i)=>{const a=v.perRight[0][i],b=v.perRight[1][i];return `<div class="wd-vowel-column ${i===v.right?'current':''}"><small>${i}</small><b>${ch}</b><span>${a??'—'}</span><span>${b??'—'}</span><strong class="${a!==null&&b!==null&&a-b?'good':''}">${a!==null&&b!==null?a-b:'—'}</strong></div>`;}).join('')}</div></div>`;
  return `<div class="wd-equation wd-set-equation"><span class="${v.pass===0?'selected':''}">${wdFormat(totals[0])}<small>F(${v.k}) · ≥ ${v.k}</small></span><i>−</i><span class="${v.pass===1?'selected':''}">${wdFormat(totals[1])}<small>F(${v.k+1}) · ≥ ${v.k+1}</small></span><i>＝</i><b>${v.answer??'…'}<small>${wdText('đúng','exactly')} ${v.k}</small></b></div>`+
    wdCard(wdText('Cửa sổ còn trong bộ đếm','Window still represented in the counters'),wdTape({...v,left:active?left:0,right:active?v.right:-1})+wdBins(freq,[...'aeiou']))+
    `<div class="wd-metrics">${wdMetric(wdText('Phụ âm','Consonants'),v.consonants)}${wdMetric('≥ minimum',v.minimum)}${wdMetric(wdText('Start hợp lệ','Valid starts'),active?v.left:0,'good')}</div>`+
    wdCard(wdText('Các start 0…left−1 → cùng right','Starts 0…left−1 → the same right'),`<div class="wd-rounds">${Array.from({length:Math.min(24,active?v.left:0)},(_,i)=>`<span class="good">${i}</span>`).join('')||'<i>∅</i>'}<i>→</i><b>${active?v.right:'—'}</b></div>`)+
    wdCard(wdText('Đếm theo end · hàng cuối = hiệu hai lượt','Counts by end · last row = the difference'),columns)+
    (v.final?wdCard(wdText('Ví dụ đúng k phụ âm','Examples with exactly k consonants'),`<div class="wd-exact-examples">${exact.map(([a,b])=>`<span><small>[${a},${b}]</small><b>${wdEscape(v.word.slice(a,b+1))}</b></span>`).join('')||'<i>∅</i>'}</div>`):'');
}
function wdEqual(v){
  const groups=v.certificate?.groups||v.path.map(start=>({start,end:start+v.x-1})),chosen=groups.flatMap(g=>Array.from({length:g.end-g.start+1},(_,i)=>g.start+i));
  const before=wdTape(v,null,{indices:chosen}),after=v.certificate?wdTape({...v,items:v.certificate.after},[0,-1],{indices:chosen}):'';
  let body=`<div class="wd-metrics">${wdMetric('x',v.x)}${wdMetric('k',v.k)}${wdMetric('±1 ops',v.answer??v.best,'good')}</div>`+wdCard('nums',before+(after?'<div class="wd-down">↓</div>'+after:''));
  if(v.start!==null){const values=v.nums.slice(v.start,v.start+v.x);body+=wdCard(`[${v.start},${v.start+v.x-1}] → median ${wdFormat(v.median)}`,`<div class="wd-median-pairs">${values.map((n,i)=>`<span><small>${v.start+i}</small><b>${n}</b><i>↓</i><strong>${wdFormat(v.median)}</strong><em>${v.median===null?'…':Math.abs(n-v.median)}</em></span>`).join('')}</div><div class="wd-equation"><small>Σ |value − median|</small><b>${wdFormat(v.current)}</b></div>`);}
  if(v.cost)body+=wdCard('cost[start]',`<div class="wd-scroll"><div class="wd-costs">${v.cost.map((cost,i)=>`<button type="button" data-wd-cost="${i}" class="${i===v.start?'selected':''}" ${cost===null?'disabled':''}><small>${i}…${i+v.x-1}</small><b>${wdFormat(cost)}</b></button>`).join('')}</div></div>`);
  if(v.decision){const d=v.decision;body+=wdCard(wdText('Hai lựa chọn không chồng lấn','Two choices without overlap'),`<div class="wd-dp-choice"><span><small>${wdText('Bỏ','Skip')}</small><b>${wdFormat(d.skip)}</b></span><i>↔</i><span><small>${wdText('Chọn','Take')} [${d.start??'—'},…]</small><b>${wdFormat(d.base)} ＋ ${wdFormat(d.cost)}</b><strong>${wdFormat(d.take)}</strong></span><i>→</i><strong>${wdFormat(d.result)}</strong></div>`);}
  if(v.certificate)body+=wdCard('✓ '+wdText('k nhóm không chồng lấn','k non-overlapping groups'),`<div class="wd-groups">${groups.map((g,i)=>`<span data-group-start="${g.start}" data-group-end="${g.end}" data-group-cost="${g.cost}"><small>G${i+1} · ${g.start}…${g.end}</small><b>${g.median}</b><strong>＋${g.cost}</strong></span>`).join('')}<b>＝ ${v.answer}</b></div>`);
  return body;
}
const WD_PRESETS={
  1052:[[[1,0,1,2,1,1,7,5],{grumpy:'0,1,0,1,0,1,0,1',minutes:3}],[[4,1,8,2],{grumpy:'1,0,1,0',minutes:2}],[[2,3,1],{grumpy:'0,0,0',minutes:3}]],
  862:[[[2,-1,2],{k:3}],[[84,-37,32,40,95],{k:167}],[[1,2],{k:4}]],
  1208:[['abcd',{t:'bcdf',maxCost:3}],['abcd',{t:'cdef',maxCost:1}],['abcd',{t:'acde',maxCost:0}]],
  1358:[['abcabc',{}],['aaacb',{}],['aaaa',{}]],
  1499:[['1,3;2,0;5,10;6,-10',{k:1}],['0,0;1,5;2,6;4,1',{k:2}],['0,-5;2,-3;5,-8',{k:5}]],
  2461:[[[1,5,4,2,9,9,9],{k:3}],[[4,4,4],{k:3}],[[5,1,9],{k:1}]],
  2799:[[[1,3,1,2,2],{}],[[5,5,5],{}],[[1,2,3,4],{}]],
  2904:[['100011001',{k:3}],['101101',{k:2}],['0000',{k:1}]],
  3090:[['bcbbbcba',{}],['aaaa',{}],['abacbc',{}]],
  2958:[[[1,2,3,1,2,3,1,2],{k:2}],[[4,4,4,4],{k:1}],[[1,2,1,2],{k:3}]],
  2962:[[[1,3,2,3,3],{k:2}],[[3,3,3],{k:1}],[[1,2,3],{k:2}]],
  2271:[['1,5;10,11;12,18;20,25;30,32',{carpetLen:10}],['1,100;200,205',{carpetLen:5}],['1,2;5,6;10,12',{carpetLen:4}]],
  2024:[['TTFF',{k:2}],['TFFT',{k:1}],['TTFTTFTT',{k:1}]],
  283:[[[0,1,0,3,12],{}],[[0,0,0],{}],[[1,0,1,2,0],{}]],
  100:[['1,2,3',{q:'1,2,3'}],['1,2',{q:'1,null,2'}],['1,2,3',{q:'1,2,4'}],['null',{q:'null'}]],
  3159:[[[1,3,1,7,1,2],{x:1,queries:'1,3,2,4'}],[[2,2,2],{x:2,queries:'1,3,4'}],[[1,2,3],{x:9,queries:'1,2'}]],
  3306:[['ieaouqqieaouqq',{k:1}],['aeiou',{k:0}],['aeioqq',{k:1}]],
  3505:[['5,-2,1,3,7,3,6,4,-1',{x:3,k:2}],['0,4,4,4,4,8',{x:3,k:2}],['2,2,2,2,2,2',{x:2,k:3}]],
  528:[['1,3,2',{targets:'1,2,4,5,6',columns:''}],['2,3,1',{targets:'2,3,5,6',columns:''}],['7',{targets:'1,7',columns:''}]],
};
function renderWindowDecisionPictures(step){
  const host=$('treeView'),v=wdRead(step);if(!host||!v)return;
  const timeline=typeof steps!=='undefined'?steps:[step],index=typeof stepIndex==='number'?stepIndex:0;
  const wasOpen=host.querySelector?.('.wd-details')?.open;
  const key=JSON.stringify([v.id,v.items,v.word,v.k,v.s,v.t,v.pTopology,v.qTopology]);
  if(host.dataset.wdProblemState!==key){host.dataset.wdProblemState=key;delete host.dataset.wdRangeState;delete host.dataset.wdQueryState;delete host.dataset.wdTreeZoomState;}
  const titles={grumpy:['Cứu thêm khách trong khung vàng','Rescue customers inside the gold window'],prefix:['Hai prefix → một tổng đoạn','Two prefixes → one subarray sum'],budget:['Đổi ký tự trong ngân sách','Convert characters within budget'],count:['Một lần cộng → nhiều đoạn','One addition → many substrings'],points:['Khoảng cách x & ứng viên tốt nhất','X distance & the best candidate'], 'distinct-sum':['Đủ k số khác nhau → so tổng','k distinct values → compare sums'],beautiful:['Đủ bit 1 · ngắn nhất · nhỏ nhất','Enough 1-bits · shortest · smallest'],frequency:['Mỗi loại có giới hạn riêng','Each value has its own limit'],carpet:['Trượt thảm qua các đoạn trắng','Slide the carpet over white intervals'],replacement:['Đổi ít ký tự → một dãy đồng nhất','A few replacements → one uniform run'],moves:['Gặp số khác 0 → đưa về write','Move each nonzero to write'],trees:['Cùng vị trí · cùng giá trị','Same position · same value'],lookup:['Lần xuất hiện → chỉ số','Occurrence → index'],vowels:['Đúng k = ít nhất k − ít nhất k+1','Exactly k = at least k − at least k+1'],equal:['Đưa về median → chọn k đoạn','Move to the median → choose k windows'],weighted:['Trọng số → dải vé → chỉ số','Weights → tickets → index']};
  const phase=({visit:['Đọc bên phải','Read right'],add:['Thêm vào bộ đếm','Add to counters'],shrink:['Bỏ bên trái','Remove left'],best:['Kỷ lục mới','New record'],count:['Đếm các đoạn','Count ranges'],'pop-front':['Bỏ đầu deque','Pop deque front'],'pop-back':['Bỏ cuối deque','Pop deque back'],found:['Tìm được cặp','Found a pair'],push:['Thêm cuối deque','Append to deque'],result:['Kết quả','Result'],swap:['Đổi chỗ','Swap']})[v.phase];
  const button=(at,role,label,icon)=>`<button type="button" data-wd-go="${at}" data-wd-control="${role}" aria-label="${label}" ${at<0||at>=timeline.length||at===index?'disabled':''}>${icon}</button>`;
  const controls=`<nav class="wd-play">${button(0,'first',wdText('Về đầu','First step'),'↤')}${button(index-1,'previous',wdText('Bước trước','Previous step'),'←')}<span>${index+1} / ${timeline.length}</span>${button(index+1,'next',wdText('Bước tiếp','Next step'),'→')}${button(timeline.length-1,'last',wdText('Tới cuối','Last step'),'↦')}</nav>`;
  const builders={grumpy:()=>wdGrumpy(v),budget:()=>wdCost(v),frequency:()=>wdFrequency(v),'distinct-sum':()=>wdFrequency(v),replacement:()=>wdFrequency(v),count:()=>wdCounting(v,host.dataset.wdRangeState),prefix:()=>wdMonotonic(v),points:()=>wdMonotonic(v),beautiful:()=>wdBeautiful(v),carpet:()=>wdCarpet(v),moves:()=>wdMoves(v),lookup:()=>wdLookup(v,host.dataset.wdQueryState),trees:()=>wdTrees(v,step,timeline,host.dataset.wdTreeZoomState==='1'),vowels:()=>wdVowels(v),equal:()=>wdEqual(v),weighted:()=>wdWeighted(v)};
  let native=null;
  if(v.id===3505&&typeof renderEqualSubarrays3505View==='function'&&host.appendChild){renderEqualSubarrays3505View(step);native=host.firstElementChild;}
  const source=v.source??step.title?.[typeof lang!=='undefined'?lang:'en']??'';
  const methodNames=v.id===3505?['Sort','Sorted list','2 heaps','Fenwick','Memo','Rolling DP','DFS']:v.id===528?[wdText('Prefix + nhị phân','Prefix + binary'),wdText('Quét tuyến tính','Linear scan'),'Alias · O(1)']:[];
  const methods=methodNames.length?`<nav class="wd-methods">${methodNames.map((name,i)=>`<button type="button" data-wd-method="${i+1}" class="${v.method===i+1?'selected':''}">${i+1} ${name}</button>`).join('')}</nav>`:'';
  host.innerHTML=`<section class="wd-viz" data-wd-problem="${v.id}"><header class="wd-heading"><strong>${wdText(...titles[v.kind])}</strong><small>#${v.id}</small></header>${controls}${methods}${phase?`<div class="wd-phase">${wdText(...phase)}</div>`:''}${builders[v.kind]()}<details class="wd-details" ${wasOpen?'open':''}><summary>${wdText('Chi tiết bước / cấu trúc phụ','Step details / helper structures')}</summary><code>L${(step.codeLines||[]).join(', ')||'—'} · ${wdEscape(source)}</code><div class="wd-native-slot"></div></details><nav class="wd-presets">${(WD_PRESETS[v.id]||[]).map((p,i)=>`<button type="button" data-wd-preset="${i}">${wdText('Ví dụ','Example')} ${i+1}</button>`).join('')}</nav></section>`;
  if(native)host.querySelector('.wd-native-slot').appendChild(native);
  const stop=()=>{if(typeof stopPlay==='function')stopPlay();};
  const go=(at,selector)=>{if(at<0||at>=timeline.length)return;stop();stepIndex=at;renderStep();(host.querySelector(selector+':not(:disabled)')||host.querySelector('[data-wd-control="next"]'))?.focus({preventScroll:true});};
  host.querySelectorAll?.('button,summary').forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')e.stopPropagation();}));
  host.querySelectorAll?.('[data-wd-go]').forEach(el=>el.addEventListener('click',()=>go(Number(el.dataset.wdGo),`[data-wd-control="${el.dataset.wdControl}"]`)));
  host.querySelectorAll?.('[data-wd-range]').forEach(el=>el.addEventListener('click',()=>{stop();host.dataset.wdRangeState=el.dataset.wdRange;renderWindowDecisionPictures(step);host.querySelector(`[data-wd-range="${el.dataset.wdRange}"]`)?.focus({preventScroll:true});}));
  host.querySelectorAll?.('[data-wd-query]').forEach(el=>el.addEventListener('click',()=>{const q=Number(el.dataset.wdQuery);if(v.final){stop();host.dataset.wdQueryState=String(q);renderWindowDecisionPictures(step);host.querySelector(`[data-wd-query="${q}"]`)?.focus({preventScroll:true});}else go(timeline.findIndex(s=>s.occurrenceLookupView?.queryIndex===q&&s.occurrenceLookupView.answer.length>q),`[data-wd-query="${q}"]`);}));
  host.querySelector?.('[data-wd-tree-zoom]')?.addEventListener('click',()=>{stop();host.dataset.wdTreeZoomState=host.dataset.wdTreeZoomState==='1'?'0':'1';renderWindowDecisionPictures(step);host.querySelector('[data-wd-tree-zoom]')?.focus({preventScroll:true});});
  host.querySelectorAll?.('[data-wd-cost]').forEach(el=>el.addEventListener('click',()=>go(timeline.findIndex(s=>s.equalSubarrays3505View?.event==='cost'&&s.equalSubarrays3505View.start===Number(el.dataset.wdCost)),`[data-wd-cost="${el.dataset.wdCost}"]`)));
  host.querySelectorAll?.('[data-wd-pick]').forEach(el=>el.addEventListener('click',()=>go(timeline.findIndex(s=>s.randomPickView?.pickNumber===Number(el.dataset.wdPick)&&s.randomPickView.decision==='resolved'),`[data-wd-pick="${el.dataset.wdPick}"]`)));
  host.querySelectorAll?.('[data-wd-method]').forEach(el=>el.addEventListener('click',async()=>{stop();$('param-approach').value=el.dataset.wdMethod;await runViz();}));
  host.querySelectorAll?.('[data-wd-preset]').forEach(el=>el.addEventListener('click',async()=>{stop();const p=WD_PRESETS[v.id][Number(el.dataset.wdPreset)];$('arrInput').value=Array.isArray(p[0])?p[0].join(','):p[0];for(const [key,value]of Object.entries(p[1]))if($('param-'+key))$('param-'+key).value=value;await runViz();}));
  const scroll=host.querySelector?.('.wd-main-scroll'),focus=scroll?.querySelector('.focus');if(scroll&&focus){const a=scroll.getBoundingClientRect(),b=focus.getBoundingClientRect();scroll.scrollLeft+=b.left-a.left-(a.width-b.width)/2;}
  host.querySelectorAll?.('.wd-tree-scroll').forEach(scroll=>{const focus=scroll.querySelector('.active')||scroll.querySelector('[data-tree-path="root"]');if(focus){const a=scroll.getBoundingClientRect(),b=focus.getBoundingClientRect();scroll.scrollLeft+=b.left-a.left-(a.width-b.width)/2;}});
  const aliasScroll=host.querySelector?.('.wd-alias-scroll'),column=aliasScroll?.querySelector('.selected');if(column){const a=aliasScroll.getBoundingClientRect(),b=column.getBoundingClientRect();aliasScroll.scrollLeft+=b.left-a.left-(a.width-b.width)/2;}
  for(const selector of ['.wd-plot-scroll g.current','.wd-vowel-column.current','.wd-weight-prefix .mid','.wd-lookup-map .selected']){const focus=host.querySelector?.(selector),scroll=focus?.closest('.wd-scroll');if(scroll){const a=scroll.getBoundingClientRect(),b=focus.getBoundingClientRect();scroll.scrollLeft+=b.left-a.left-(a.width-b.width)/2;}}
}
