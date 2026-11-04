function renderClosestPoints973View(step){
  const v=step.closestPoints973View,host=$('treeView'),t=(vi,en)=>lang==='vi'?vi:en,esc=escapeHtml;
  const names=['Max-heap k','Sort','Min-heap','nsmallest','Quickselect','3-way select','Radius BS'];
  const selected=new Set(v.selected),heapIds=new Set(v.heap.map(entry=>entry.id)),seen=new Set(v.seen),inside=new Set(v.inside),tested=new Set(v.tested);
  const status=id=>selected.has(id)?'selected':v.final?'rejected':heapIds.has(id)||inside.has(id)?'kept':v.evicted.includes(id)||tested.has(id)?'rejected':'pending';
  const signature=JSON.stringify(v.points);
  if(host._closest973View?.signature!==signature)host._closest973View={signature,mode:'all'};
  const radiusExtent=host._closest973View.mode==='near'?Math.sqrt(Math.min(...v.distances.filter(value=>value>0))) : Math.sqrt(Math.max(...v.distances));
  const maxRadius=Number.isFinite(radiusExtent)?Math.max(1,radiusExtent):1,power=10**Math.floor(Math.log10(maxRadius)),bound=Math.ceil(maxRadius/power)*power,scale=150/bound;
  const offscreen=v.points.filter(([x,y])=>Math.abs(x)>bound||Math.abs(y)>bound).length;
  const xy=([x,y])=>({x:200+x*scale,y:200-y*scale});
  const ticks=[-bound,-bound/2,0,bound/2,bound];
  const grid=ticks.map(value=>{const x=200+value*scale,y=200-value*scale;return `<path class="kp973-gridline" d="M${x} 50V350M50 ${y}H350"/>${value?`<text class="kp973-tick" x="${x}" y="216" text-anchor="middle">${value}</text><text class="kp973-tick" x="190" y="${y-5}" text-anchor="end">${value}</text>`:''}`;}).join('');
  const radius=v.ring?`<circle class="kp973-radius" data-radius2="${v.ring.d2}" data-radius-pixels="${Math.sqrt(v.ring.d2)*scale}" cx="200" cy="200" r="${Math.sqrt(v.ring.d2)*scale}"/>`:'';
  let triangle='';
  if(v.active!==null&&v.active>=0){const p=xy(v.points[v.active]);triangle=`<path class="kp973-legs" d="M200 200H${p.x}V${p.y}"/><path class="kp973-hypotenuse" d="M200 200L${p.x} ${p.y}"/>`;}
  const labels=[],groups=new Map();
  v.points.forEach((point,id)=>{const key=point.join(',');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(id);});
  const dots=v.points.map((point,id)=>{
    const p=xy(point),copies=groups.get(point.join(',')),rank=copies.indexOf(id);
    return `<circle class="kp973-dot ${status(id)} ${id===v.active?'active':''} ${rank?'duplicate-ring':''}" data-point-id="${id}" data-point-x="${point[0]}" data-point-y="${point[1]}" data-point-status="${status(id)}" cx="${p.x}" cy="${p.y}" r="${5+rank*2}"><title>P${id} (${point.join(', ')}) · d²=${v.distances[id]}</title></circle>`;
  }).join('');
  const pointLabels=[...groups.values()].map(ids=>{
    const p=xy(v.points[ids[0]]),text=ids.length===1?`P${ids[0]}`:`P${ids[0]} +${ids.length-1}`,w=text.length*6+4;
    const offsets=[[9,-10],[9,19],[-w-7,-10],[-w-7,19],[4,-24],[-w-4,-24],[4,31]];
    const overlap=(x,y)=>labels.some(box=>x<box.x+box.w&&x+w>box.x&&y-10<box.y+4&&y+4>box.y-10);
    const offset=offsets.find(([dx,dy])=>p.x+dx>=8&&p.x+dx+w<395&&p.y+dy>=15&&p.y+dy<395&&!overlap(p.x+dx,p.y+dy))??offsets[0];
    const x=p.x+offset[0],y=p.y+offset[1];labels.push({x,y,w});return `<text class="kp973-point-label" x="${x}" y="${y}">${text}</text>`;
  }).join('');
  const plot=`<section class="kp973-panel"><header><b>(x, y) → (0, 0)</b><small>${v.ring?`${v.ring.label} = ${v.ring.d2}`:''}</small></header><div class="kp973-presets"><button type="button" data-points-zoom="all" aria-pressed="${host._closest973View.mode==='all'}">Fit</button><button type="button" data-points-zoom="near" aria-pressed="${host._closest973View.mode==='near'}">${t('Gần gốc','Near origin')}</button>${offscreen?`<small data-offscreen="${offscreen}">${offscreen} ${t('điểm ngoài khung','off-screen points')}</small>`:''}</div><svg class="kp973-plane" viewBox="0 0 400 400" role="img" aria-label="${t('Mặt phẳng tọa độ và các điểm','Coordinate plane and points')}" data-unit-scale="${scale}">${grid}<path class="kp973-axes" d="M35 200H370M200 365V30M364 195L370 200L364 205M195 36L200 30L205 36"/><text class="kp973-axis-label" x="380" y="204">x</text><text class="kp973-axis-label" x="205" y="24">y</text><text class="kp973-tick" x="207" y="233">O (0,0)</text>${radius}${triangle}${dots}${pointLabels}</svg><div class="kp973-legend"><span class="selected">● ${t('kết quả','answer')}</span><span class="kept">● ${t('đang giữ/xét','held/tested')}</span><span class="rejected">× ${t('đã bỏ/ngoài','dropped/outside')}</span><span class="active">○ ${t('đang xét','active')}</span></div></section>`;
  const active=v.active!==null&&v.active>=0?v.points[v.active]:null;
  const math=active?`<div class="kp973-distance"><small>P${v.active} · (${active.join(', ')})</small><b>(${active[0]})² + (${active[1]})² = <strong data-active-distance="${seen.has(v.active)?v.distances[v.active]:'pending'}">${seen.has(v.active)?v.distances[v.active]:'…'}</strong></b></div>`:'';
  const cards=v.points.map((point,id)=>`<span class="kp973-point-card ${status(id)} ${id===v.active?'active':''}" data-card-id="${id}"><b>P${id}</b><code>(${point.join(', ')})</code><small>d² ${seen.has(id)?v.distances[id]:'…'}</small></span>`).join('');
  const pointList=`<div class="kp973-point-list">${cards}</div>`;
  let structures='';
  if(v.method===1||v.method===3){
    const max=v.method===1,levels=v.heap.length?Math.floor(Math.log2(v.heap.length))+1:1,box=104,treeWidth=Math.max(280,(host.clientWidth||600)-52,2**(levels-1)*(box+6));
    const pos=i=>{const depth=Math.floor(Math.log2(i+1));return{x:(i-(2**depth-1)+.5)*treeWidth/2**depth,y:34+depth*72};};
    const nodes=v.heap.map((entry,i)=>{const p=pos(i);return `<g class="kp973-heap-node ${i===0?'root':''}" data-heap-index="${i}" data-heap-point="${entry.id}" data-heap-key="${entry.key}" data-heap-distance="${entry.d2}"><rect x="${p.x-box/2}" y="${p.y-23}" width="${box}" height="46" rx="8"/><text x="${p.x}" y="${p.y-7}" text-anchor="middle">P${entry.id} · ${entry.d2}</text><text class="key" x="${p.x}" y="${p.y+11}" text-anchor="middle">${max?'−d²':'d²'}: ${entry.key}</text><text class="index" x="${p.x}" y="${p.y+37}" text-anchor="middle">[${i}]</text></g>`;}).join('');
    const edges=v.heap.slice(1).map((_,j)=>{const i=j+1,a=pos(Math.floor((i-1)/2)),b=pos(i);return `<path class="kp973-heap-edge" d="M${a.x} ${a.y+23}L${b.x} ${b.y-23}"/>`;}).join('');
    const heapBody=!v.heap.length?'<div class="kp973-empty">∅</div>':v.heapReady?`<div class="kp973-heap-scroll" tabindex="0" role="region" aria-label="heap"><svg style="width:${treeWidth}px" viewBox="0 0 ${treeWidth} ${levels*72}" role="img" aria-label="Heap">${edges}${nodes}</svg></div>`:`<div class="kp973-order">${v.heap.map((entry,i)=>`<span data-heap-index="${i}" data-heap-point="${entry.id}" data-heap-key="${entry.key}" data-heap-distance="${entry.d2}"><small>[${i}]</small><b>P${entry.id}</b><strong>${entry.d2}</strong></span>`).join('')}</div>`;
    structures=`<section class="kp973-panel"><header><b>${max?'MAX d² · key = −d²':v.heapReady?'MIN d²':'list → heapify'}</b><small>size ${v.heap.length}${max?` / k ${v.k}`:''}</small></header>${heapBody}${max&&v.heap.length>v.k?`<b class="kp973-drop">${v.heap.length} &gt; ${v.k} → ${t('bỏ gốc xa nhất','drop farthest root')}</b>`:''}${v.removed!==null?`<b class="kp973-drop">− P${v.removed}</b>`:''}</section>`;
  }
  if(v.entries.length){
    structures+=`<section class="kp973-panel"><header><b>entries · d²</b><small>${v.method===2?t('Sắp xếp','Sort'):v.method===5||v.method===6?'Partition':''}</small></header><div class="kp973-order" tabindex="0" role="region" aria-label="entries">${v.entries.map((entry,i)=>`<span class="${selected.has(entry.id)?'selected':''} ${i===v.scan?'scan':''}" data-order-index="${i}" data-order-id="${entry.id}" data-order-distance="${entry.d2}"><small>[${i}]</small><b>P${entry.id}</b><strong>${entry.d2}</strong><i>${[['lo',v.lo],['hi',v.hi],['s',v.scan],['store',v.store],['lt',v.less],['gt',v.greater]].filter(([,pos])=>pos===i).map(([name])=>name).join(' · ')||' '}</i></span>`).join('')}</div>${v.pivot!==null?`<div class="kp973-pivot">pivot d² = <b>${v.pivot}</b> · k−1 = ${v.target}<div class="kp973-zones"><span>&lt; ${v.pivot}</span><span>= ${v.pivot}</span><span>&gt; ${v.pivot}</span></div></div>`:''}</section>`;
  }
  if(v.method===7){structures+=`<section class="kp973-panel"><header><b>Binary search · d²</b><small>≤ R²</small></header><div class="kp973-bounds">${[['low',v.low],['mid',v.mid],['high',v.high]].map(([label,value])=>`<div><small>${label}</small><b>${value??'…'}</b></div>`).join('')}</div><code>count @mid = ${v.count??'…'} · k = ${v.k}</code>${v.threshold!==null?`<strong class="kp973-threshold">threshold = ${v.threshold}</strong>`:''}</section>`;}
  const answer=`<section class="kp973-answer"><header><b>${v.final?t('ĐÁP ÁN','ANSWER'):'answer'}</b><small>${v.selected.length} / ${v.k}</small></header><div data-selected-ids="${v.selected.join(',')}">${v.selected.map(id=>`<span data-answer-id="${id}"><b>P${id}</b><code>(${v.points[id].join(', ')})</code></span>`).join('')||'<i>…</i>'}</div></section>`;
  const presets=[{label:t('Ví dụ','Example'),points:[[1,3],[-2,2],[5,8],[0,1]],k:2},{label:t('Bằng khoảng cách','Equal distance'),points:[[1,0],[0,1],[-1,0],[0,-1],[0,0]],k:3},{label:t('Điểm trùng','Duplicate points'),points:[[0,0],[0,0],[2,-2],[10000,-10000]],k:2}];
  host.innerHTML=`<section class="kp973-viz" data-method="${v.method}" aria-label="973 K closest points"><header class="kp973-heading"><b>#973 · ${names[v.method-1]}</b><small>${t('Dòng','Line')} ${v.line} · k=${v.k}</small></header><div class="kp973-methods">${names.map((name,i)=>`<button type="button" data-points-method="${i+1}" aria-pressed="${v.method===i+1}">${i+1} ${name}</button>`).join('')}</div><div class="kp973-presets">${presets.map((preset,i)=>`<button type="button" data-points-preset="${i}">${preset.label}</button>`).join('')}<button type="button" data-points-change>${t('Đổi tiếp','Next change')}</button></div>${plot}${math}${answer}${pointList}${structures}<code class="kp973-source">${esc(v.source)}</code>${v.frames.length>1?`<small class="kp973-scope">${v.frames.map(esc).join(' → ')}</small>`:''}</section>`;
  const tree=host.querySelector?.('.kp973-heap-scroll');if(tree)tree.scrollLeft=Math.max(0,(tree.scrollWidth-tree.clientWidth)/2);
  host.querySelectorAll?.('button').forEach(button=>button.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter')event.stopPropagation();}));
  host.querySelectorAll?.('[data-points-method]').forEach(button=>button.addEventListener('click',()=>{document.querySelector('[data-param="approach"]').value=button.dataset.pointsMethod;runViz();}));
  host.querySelectorAll?.('[data-points-preset]').forEach(button=>button.addEventListener('click',()=>{const preset=presets[Number(button.dataset.pointsPreset)];$('arrInput').value=JSON.stringify(preset.points);document.querySelector('[data-param="k"]').value=preset.k;runViz();}));
  host.querySelectorAll?.('[data-points-change]').forEach(button=>button.addEventListener('click',()=>{const next=steps.findIndex((s,i)=>i>stepIndex&&['push','pop','sort','swap','probe','select'].includes(s.closestPoints973View?.event));stepIndex=next>=0?next:steps.length-1;renderStep();}));
  host.querySelectorAll?.('[data-points-zoom]').forEach(button=>button.addEventListener('click',()=>{host._closest973View.mode=button.dataset.pointsZoom;renderClosestPoints973View(step);}));
  host._closest973Step=step;host._closest973Width=host.clientWidth;
  if(typeof ResizeObserver!=='undefined'&&!host._closest973Observer){host._closest973Observer=new ResizeObserver(()=>{if(host.querySelector('.kp973-viz')&&host.clientWidth!==host._closest973Width)renderClosestPoints973View(host._closest973Step);});host._closest973Observer.observe(host);}
}
