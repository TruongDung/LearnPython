'use strict';

function obstacle2290Grid(v, availableWidth) {
  const width=Math.max(150,Math.min(450,availableWidth));
  const rowDigits=String(v.height-1).length;
  const left=rowDigits<3?25:rowDigits*7.3+26,right=14,top=25;
  const pitch=(width-left-right)/v.cols.length,size=Math.min(90,pitch-10);
  const height=top+pitch*v.rows.length+12;
  const key=p=>p.join(','),same=(a,b)=>a&&b&&a[0]===b[0]&&a[1]===b[1];
  const visible=p=>v.rows.includes(p[0])&&v.cols.includes(p[1]);
  const center=p=>[left+pitch*(v.cols.indexOf(p[1])+.5),top+pitch*(v.rows.indexOf(p[0])+.5)];
  const route=new Set(v.route.map(key)),removed=new Set(v.removed.map(key)),updated=new Set(v.updated.map(change=>key(change.cell)));
  let marks=v.cols.map((c,i)=>`<text class="ob2290-axis" x="${left+pitch*(i+.5)}" y="14" text-anchor="middle">${i&&c>v.cols[i-1]+1?'… ':''}${c}</text>`).join('');
  marks+=v.rows.map((r,i)=>`<text class="ob2290-axis" x="${left-9}" y="${top+pitch*(i+.5)+4}" text-anchor="end">${i&&r>v.rows[i-1]+1?'… ':''}${r}</text>`).join('');
  for(let i=1;i<v.route.length;i++) {
    const a=v.route[i-1],b=v.route[i];
    if(!visible(a)||!visible(b))continue;
    const [x1,y1]=center(a),[x2,y2]=center(b),dr=b[0]-a[0],dc=b[1]-a[1];
    marks+=`<path class="ob2290-route-link" d="M${x1+dc*size/2},${y1+dr*size/2}L${x2-dc*size/2},${y2-dr*size/2}"/>`;
  }
  for(const cell of v.cells.flat()) {
    const p=[cell.r,cell.c],[x,y]=center(p),gone=removed.has(key(p));
    const current=!v.final&&same(p,v.current),probe=!v.final&&same(p,v.probe?.to);
    const cls=['ob2290-cell',cell.value?'wall':'empty',cell.distance!=='∞'?'known':'',route.has(key(p))?'route':'',gone?'removed':'',current?'current':'',probe?'probe':'',updated.has(key(p))?'updated':''].join(' ');
    const endpoint=cell.r===0&&cell.c===0?(v.height*v.width===1?'S/T':'S'):cell.r===v.height-1&&cell.c===v.width-1?'T':'';
    const brick=Math.min(34,size*.46),brickY=y-6;
    let symbol=cell.value?`<g class="ob2290-bricks"><rect x="${x-brick/2}" y="${brickY-brick*.34}" width="${brick}" height="${brick*.68}" rx="2"/><path d="M${x-brick/2},${brickY}H${x+brick/2}M${x},${brickY-brick*.34}V${brickY}M${x-brick*.22},${brickY}V${brickY+brick*.34}"/></g>`:`<circle class="ob2290-open" cx="${x}" cy="${y-6}" r="${Math.min(8,size*.12)}"/>`;
    if(gone)symbol+=`<path class="ob2290-cross" d="M${x-brick/2-2},${brickY-brick*.4}L${x+brick/2+2},${brickY+brick*.4}M${x+brick/2+2},${brickY-brick*.4}L${x-brick/2-2},${brickY+brick*.4}"/>`;
    const distanceLabel=String(cell.distance).length>3?cell.distance:`d ${cell.distance}`;
    marks+=`<g class="${cls}" data-cell="${cell.r},${cell.c}" data-value="${cell.value}" data-distance="${cell.distance}"><title>(${cell.r},${cell.c}) · grid=${cell.value} · dist=${cell.distance}${gone?' · removed':''}</title><rect class="ob2290-tile" x="${x-size/2}" y="${y-size/2}" width="${size}" height="${size}" rx="10"/><text x="${x-size/2+7}" y="${y-size/2+14}">${endpoint}</text><text x="${x+size/2-7}" y="${y-size/2+14}" text-anchor="end">${current?'u':probe?'v':''}</text>${symbol}<text class="ob2290-distance" x="${x}" y="${y+size/2-7}" text-anchor="middle">${distanceLabel}</text></g>`;
  }
  const edge=v.probe;
  if(!v.final&&edge?.direction&&visible(edge.from)&&visible(edge.to)) {
    const [x1,y1]=center(edge.from),[x2,y2]=center(edge.to),dr=edge.to[0]-edge.from[0],dc=edge.to[1]-edge.from[1];
    const x=(x1+x2)/2,y=(y1+y2)/2;
    marks+=`<path class="ob2290-edge ${edge.weight?'paid':''}" d="M${x1+dc*(size/2-2)},${y1+dr*(size/2-2)}L${x2-dc*(size/2-2)},${y2-dr*(size/2-2)}"/><rect class="ob2290-edge-label" x="${x-10}" y="${y-10}" width="20" height="20" rx="4"/><text x="${x}" y="${y+4}" text-anchor="middle">${edge.weight?'+1':'0'}</text>`;
  }
  return `<svg class="ob2290-grid" viewBox="0 0 ${width} ${height}" role="img" aria-label="2290 obstacle grid, ${v.height} rows and ${v.width} columns. Circles: empty. Bricks: obstacles. Crosses: removed obstacles. u: current; v: next; d: best removal cost. ${v.final?'Minimum removals: '+v.answer:''}">${marks}</svg>`;
}

function renderObstacleRemoval2290View(step) {
  const v=step.obstacle2290View,host=$('treeView'),t=(vi,en)=>lang==='vi'?vi:en,esc=escapeHtml;
  const coord=p=>`(${p[0]},${p[1]})`,source=v.source.text.trim(),edge=v.probe;
  const distance=p=>v.cells.flat().find(cell=>cell.r===p[0]&&cell.c===p[1])?.distance;
  const candidatesReady=/^(if nd|dist\[nr|parent\[\(nr|if w|dq\.append)/.test(source);
  const front=source.startsWith('dq.appendleft'),back=source.startsWith('dq.append(');
  let operation=`<div class="ob2290-intro"><span>S</span><b>→</b><span>T</span><small>0 → ${t('đầu','front')} · 1 → ${t('cuối','back')}</small></div>`;
  if(edge?.direction) {
    const candidate=candidatesReady?v.locals.nd:'?';
    operation=`<section class="ob2290-calc ${edge.weight?'paid':'free'}"><header><span>${coord(edge.from)} → ${coord(edge.to)}</span><b>${edge.weight?t('Vào vật cản','Enter obstacle'):t('Vào ô trống','Enter empty cell')}</b></header><div class="ob2290-equation"><div><small>cost</small><b>${v.locals.cost??'?'}</b></div><span>+</span><div class="ob2290-weight"><small>grid${coord(edge.to)}</small><b>${edge.weight}</b></div><span>=</span><div><small>nd</small><b>${candidate}</b></div></div>${source.startsWith('if nd')?`<div class="ob2290-compare">${candidate} &lt; d${coord(edge.to)} = ${distance(edge.to)} <b>${distance(edge.to)==='∞'||candidate<distance(edge.to)?'✓':'×'}</b></div>`:''}</section>`;
  } else if(edge&&!edge.inside) operation=`<div class="ob2290-outside">${coord(edge.from)} ↛ ${coord(edge.to)}<span>${t('Ngoài lưới','Out of bounds')}</span></div>`;
  else if(v.current&&v.locals.cost!==undefined&&distance(v.current)!==undefined&&v.locals.cost!==distance(v.current)&&/^(if cost|continue)/.test(source)) operation=`<div class="ob2290-outside">${v.locals.cost} ≠ d${coord(v.current)} = ${distance(v.current)}<span>${t('Bỏ bản ghi cũ ×','Skip stale entry ×')}</span></div>`;
  if(v.final) operation=`<div class="ob2290-answer" data-answer="${v.answer}"><b>${v.answer}</b><span>${t('vật cản cần xóa','obstacles to remove')} · S → T ✓</span></div>`;
  const queue=`<section class="ob2290-deque"><header><b>DEQUE</b><small>${v.queueSize} ${t('phần tử','entries')}</small></header><div class="ob2290-ends"><span class="${front?'pending':''}">0 ⇢ ${t('ĐẦU','FRONT')}</span><span class="${back?'pending paid':''}">${t('CUỐI','BACK')} ⇠ 1</span></div><ol aria-label="${t('Deque theo thứ tự từ đầu tới cuối; mỗi ô hiển thị tọa độ và chi phí','Deque from front to back; each entry shows coordinates and cost')}">${v.queue.map(([cost,r,c],i)=>`<li class="${i===0?'first':''}" data-queue-cell="${r},${c}"><span>${coord([r,c])}</span><b>${cost}</b></li>`).join('')||'<li class="empty">∅</li>'}${v.queueSize>v.queue.length?`<li class="more">+${v.queueSize-v.queue.length}</li>`:''}</ol><small>${t('Số lớn = số vật cản đã xóa','Large number = removal cost')}</small></section>`;
  const update=!v.final&&v.updated.length?`<div class="ob2290-update">${v.updated.map(change=>`<span>d${coord(change.cell)}: <s>${change.before}</s> → <b>${change.after}</b></span>`).join('')}</div>`:'';
  const removed=v.final?`<section class="ob2290-removed-list"><header><b>${v.answer?t('Đã xóa','Removed'):t('Không cần xóa ✓','No removals needed ✓')}</b></header><div>${v.removed.slice(0,8).map(cell=>`<span><b>▧ ×</b>${coord(cell)}</span>`).join('')}${v.removed.length>8?`<span>+${v.removed.length-8}</span>`:''}</div></section>`:'';
  const presets=[{input:'0,1,1|1,1,0|1,1,0',label:t('Ví dụ: xóa 2','Example: remove 2')},{input:'0,1,0,0,0|0,1,0,1,0|0,0,0,1,0',label:t('Ví dụ: xóa 0','Example: remove 0')}];
  host.innerHTML=`<section class="ob2290-viz"><header><b>2290 · 0-1 BFS</b><span>${t(v.final?'Trả về · dòng':'Trước dòng',v.final?'Returned · line':'Before line')} ${v.source.line} · ${v.source.scope}()</span></header><div class="ob2290-presets">${presets.map((preset,i)=>`<button type="button" data-ob2290-preset="${i}">${preset.label}</button>`).join('')}</div><code class="ob2290-source">${esc(source)}</code><div class="ob2290-stage"><div class="ob2290-map" style="max-width:${Math.min(450,v.cols.length*108+Math.max(40,String(v.height-1).length*7.3+24))}px">${obstacle2290Grid(v,Math.max(280,(host.clientWidth||600)-28))}</div><div class="ob2290-operations">${operation}${update}${queue}${removed}</div></div><div class="ob2290-legend"><span><i class="open"></i>0 · ${t('trống','empty')}</span><span><i class="wall"></i>1 · ${t('vật cản','obstacle')}</span><span>× · ${t('đã xóa','removed')}</span><span>u: ${t('đang xét','current')} · v: ${t('ô kế','next')}</span><span>d: ${t('ít lần xóa nhất','fewest removals')}</span></div>${v.cropped?`<small>${t('Lưới rút gọn · tọa độ gốc · … là khoảng ẩn','Condensed grid · original coordinates · … marks hidden spans')}</small>`:''}${v.trace.truncated?`<small class="ob2290-notice">${v.trace.omitted} ${t('sự kiện đã lược · đáp án và đường đi tính đầy đủ','events omitted · answer and route fully computed')}</small>`:''}</section>`;
  host.obstacle2290Current=v;
  const redraw=()=>{
    const map=host.querySelector?.('.ob2290-map');
    if(map) map.innerHTML=obstacle2290Grid(host.obstacle2290Current,map.clientWidth||280);
  };
  redraw();
  if(typeof ResizeObserver!=='undefined'&&!host.obstacle2290Observer) {
    host.obstacle2290Observer=new ResizeObserver(redraw);
    host.obstacle2290Observer.observe(host);
  }
  host.querySelectorAll?.('[data-ob2290-preset]').forEach(button=>{
    button.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter')event.stopPropagation();});
    button.addEventListener('click',()=>{$('arrInput').value=presets[Number(button.dataset.ob2290Preset)].input;runViz();});
  });
}
