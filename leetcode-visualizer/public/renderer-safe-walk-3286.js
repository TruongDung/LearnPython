'use strict';

function safeWalk3286Grid(v,availableWidth) {
  const width=Math.max(150,Math.min(450,availableWidth)),left=25,right=14,top=25;
  const pitch=(width-left-right)/v.cols.length,size=Math.min(90,pitch-10),height=top+pitch*v.rows.length+12;
  const key=p=>`${p[0]},${p[1]}`,same=(a,b)=>a&&b&&a[0]===b[0]&&a[1]===b[1];
  const visible=p=>v.rows.includes(p[0])&&v.cols.includes(p[1]);
  const center=p=>[left+pitch*(v.cols.indexOf(p[1])+.5),top+pitch*(v.rows.indexOf(p[0])+.5)];
  const route=new Map(v.routeStates.map(([r,c,hp])=>[key([r,c]),hp]));
  const updated=new Set(v.updated.map(update=>key(update.cell)));
  let marks=v.cols.map((c,i)=>`<text class="sw3286-axis" x="${left+pitch*(i+.5)}" y="14" text-anchor="middle">${i&&c>v.cols[i-1]+1?'… ':''}${c}</text>`).join('');
  marks+=v.rows.map((r,i)=>`<text class="sw3286-axis" x="${left-8}" y="${top+pitch*(i+.5)+4}" text-anchor="end">${i&&r>v.rows[i-1]+1?'…':''}${r}</text>`).join('');
  for(let i=1;i<v.route.length;i++) {
    const a=v.route[i-1],b=v.route[i];if(!visible(a)||!visible(b))continue;
    const[x1,y1]=center(a),[x2,y2]=center(b),dr=b[0]-a[0],dc=b[1]-a[1];
    marks+=`<path class="sw3286-route-link" d="M${x1+dc*size/2},${y1+dr*size/2}L${x2-dc*size/2},${y2-dr*size/2}"/>`;
  }
  for(const cell of v.cells.flat()) {
    const p=[cell.r,cell.c],[x,y]=center(p),onRoute=route.has(key(p));
    const current=!v.final&&same(p,v.current),probe=!v.final&&same(p,v.probe?.to);
    const target=cell.r===v.height-1&&cell.c===v.width-1,start=cell.r===0&&cell.c===0;
    const failed=v.final&&!v.answer&&(v.failure==='start'?start:target);
    const css=['sw3286-cell',cell.value?'danger':'safe',onRoute?'route':'',current?'current':'',probe?'probe':'',updated.has(key(p))?'updated':'',failed?'failed':''].join(' ');
    const label=onRoute?`hp ${route.get(key(p))}`:`B ${cell.bestHp===null||cell.bestHp<0?'·':cell.bestHp}`;
    const symbol=cell.value?`<text class="sw3286-damage" x="${x}" y="${y-3}" text-anchor="middle">−1</text>`:`<circle class="sw3286-safe-dot" cx="${x}" cy="${y-8}" r="${Math.min(7,size*.12)}"/>`;
    marks+=`<g class="${css}" data-cell="${cell.r},${cell.c}" data-value="${cell.value}" data-best="${cell.bestHp??''}"><title>(${cell.r},${cell.c}) · damage ${cell.value} · best HP ${cell.bestHp??'—'}${onRoute?' · route HP '+route.get(key(p)):''}</title><rect x="${x-size/2}" y="${y-size/2}" width="${size}" height="${size}" rx="10"/><text x="${x-size/2+7}" y="${y-size/2+14}">${start?(target?'S/T':'S'):target?'T':''}</text><text x="${x+size/2-7}" y="${y-size/2+14}" text-anchor="end">${current?'u':probe?'v':''}</text>${symbol}<text class="sw3286-best" x="${x}" y="${y+size/2-7}" text-anchor="middle">${label}</text></g>`;
  }
  const edge=v.probe;
  if(edge?.inside&&!v.final&&visible(edge.from)&&visible(edge.to)) {
    const[x1,y1]=center(edge.from),[x2,y2]=center(edge.to),dr=edge.to[0]-edge.from[0],dc=edge.to[1]-edge.from[1],x=(x1+x2)/2,y=(y1+y2)/2;
    marks+=`<path class="sw3286-edge ${edge.cost?'hurt':''}" d="M${x1+dc*(size/2-2)},${y1+dr*(size/2-2)}L${x2-dc*(size/2-2)},${y2-dr*(size/2-2)}"/><rect class="sw3286-edge-label" x="${x-11}" y="${y-10}" width="22" height="20" rx="4"/><text x="${x}" y="${y+4}" text-anchor="middle">${edge.cost?'−1':'0'}</text>`;
  }
  return `<svg class="sw3286-grid" viewBox="0 0 ${width} ${height}" role="img" aria-label="Health grid, ${v.height} rows and ${v.width} columns. Red cells cost one health, including S and T. B: most health seen. u: current; v: next. ${v.final?'Safe walk: '+v.answer:''}">${marks}</svg>`;
}

function renderSafeWalk3286View(step) {
  const v=step.safeWalk3286View,host=$('treeView'),t=(vi,en)=>lang==='vi'?vi:en,esc=escapeHtml;
  const coord=p=>`(${p[0]},${p[1]})`,edge=v.probe,hp=v.remainingHp;
  const hpLabel=v.locals.start_hp===undefined?t('HP ban đầu','Initial HP'):v.final&&v.answer?t('HP tại T','HP at T'):v.failure==='start'?t('HP tại S','HP at S'):v.final?t('HP ô cuối','HP at last cell'):v.locals.hp===undefined?t('HP tại S','HP at S'):t('HP tại u','HP at u');
  const hearts=v.health<=12?`<div class="sw3286-hearts" aria-hidden="true">${Array.from({length:v.health},(_,i)=>`<span class="${i<hp?'full':'lost'}">${i<hp?'♥':'♡'}</span>`).join('')}</div>`:'';
  const meter=`<section class="sw3286-health ${hp<=0?'dead':''}"><header><span>${hpLabel}</span><strong>♥ ${hp} / ${v.health}</strong></header>${hearts}<div class="sw3286-hp-track" role="meter" aria-label="${hpLabel}" aria-valuemin="0" aria-valuemax="${v.health}" aria-valuenow="${hp}"><div style="width:${Math.max(0,Math.min(100,hp/v.health*100))}%"></div></div><small>${hp>0?'hp > 0 ✓':'hp = 0 ×'}</small></section>`;
  const equation=(from,cost,to,label)=>`<section class="sw3286-calc"><header><b>${label}</b></header><div class="sw3286-equation"><div><small>hp</small><b>${from}</b></div><span>−</span><div class="damage"><small>grid</small><b>${cost}</b></div><span>=</span><div class="${to===0?'dead':''}"><small>nhp</small><b>${to??'?'}</b></div></div></section>`;
  let operation=v.locals.hp===undefined?equation(v.health,v.cells[0][0].value,v.locals.start_hp,t('Vào ô S','Enter S')):`<div class="sw3286-location">u ${coord(v.current)} <b>♥ ${hp}</b><span>→ T</span></div>`;
  if(edge?.inside) {
    operation=equation(v.locals.hp,edge.cost,edge.nextHp,`${coord(edge.from)} → ${coord(edge.to)}`);
    if(edge.nextHp!==null)operation+=`<div class="sw3286-check ${edge.nextHp>0?'good':'bad'}">${edge.nextHp} > 0 <b>${edge.nextHp>0?'✓':'×'}</b></div>`;
    if(['improve','dominated'].includes(v.phase))operation+=`<div class="sw3286-check ${edge.nextHp>edge.bestHp?'good':'bad'}">${edge.nextHp} > best${coord(edge.to)} = ${edge.bestHp} <b>${edge.nextHp>edge.bestHp?'✓':'×'}</b></div>`;
  } else if(edge)operation=`<div class="sw3286-location bad">${coord(edge.from)} ↛ ${coord(edge.to)}<span>${t('Ngoài lưới','Out of bounds')}</span></div>`;
  if(['stale','stale-skip'].includes(v.phase)) {
    const best=v.cells.flat().find(cell=>cell.r===v.current[0]&&cell.c===v.current[1])?.bestHp;
    operation=`<div class="sw3286-check">hp ${hp} &lt; best ${best} <b>${hp<best?'× '+t('bỏ qua','skip'):'✓'}</b></div>`;
  }
  if(v.final)operation=`<div class="sw3286-answer ${v.answer?'yes':'no'}" data-answer="${v.answer}"><b>${v.answer?'✓ True':'× False'}</b><span>${v.answer?`T · hp ${hp} > 0`:v.failure==='start'?t('S: không đủ máu','S: no health left'):t('Queue ∅ · T chưa tới','Queue ∅ · T not reached')}</span></div>`;
  const update=!v.final&&v.updated.length?`<div class="sw3286-update">${v.updated.filter(change=>change.after!==null&&change.after>=0).map(change=>`<span>best${coord(change.cell)}: ${change.before===null||change.before<0?'·':change.before} → <b>${change.after}</b></span>`).join('')}</div>`:'';
  const queue=`<section class="sw3286-queue"><header><b>QUEUE · (r,c,hp)</b><small>${v.queueSize}</small></header><div class="sw3286-ends"><span>${t('ĐẦU → pop','FRONT → pop')}</span><span>${t('push → CUỐI','push → BACK')}</span></div><ol aria-label="BFS queue: row, column, remaining health">${v.queue.map(([r,c,health],i)=>`<li class="${i===0?'front':''} ${health<v.queueBest[i]?'stale':''}" data-queue-cell="${r},${c}" data-hp="${health}"><span>${coord([r,c])}</span><b>♥ ${health}${health<v.queueBest[i]?' ×':''}</b></li>`).join('')||'<li class="empty">∅</li>'}${v.queueSize>v.queue.length?`<li class="more">+${v.queueSize-v.queue.length}</li>`:''}</ol></section>`;
  const hits=v.final&&v.answer?`<section class="sw3286-hits"><header><b>${t('Máu trên đường đi','Health along the route')}</b></header><div><span><small>H</small><b>♥ ${v.health}</b></span>${v.hits.slice(0,8).map(hit=>`<i>→</i><span class="hurt"><small>${coord(hit.cell)}${hit.cell[0]===0&&hit.cell[1]===0?' · S':hit.cell[0]===v.height-1&&hit.cell[1]===v.width-1?' · T':''}</small><b>${hit.before} − 1 = ${hit.after}</b></span>`).join('')}${v.hits.length>8?`<i>… +${v.hits.length-8}</i>`:''}<i>→</i><span><small>T</small><b>♥ ${hp}</b></span></div></section>`:'';
  const presets=[{health:1,input:'0,1,0,0,0|0,1,0,1,0|0,0,0,1,0',label:t('♥ 1 · đường trống','♥ 1 · safe cells')},{health:5,input:'1,1,1|1,0,1|1,1,1',label:t('♥ 5 · đủ máu','♥ 5 · enough')},{health:4,input:'1,1,1|1,0,1|1,1,1',label:t('♥ 4 · thiếu máu','♥ 4 · too little')}];
  host.innerHTML=`<section class="sw3286-viz"><header><b>3286 · BFS + best HP</b><span>${t(v.final?'Trả về · dòng':'Trước dòng',v.final?'Returned · line':'Before line')} ${v.source.line}</span></header><div class="sw3286-presets">${presets.map((preset,i)=>`<button type="button" data-sw3286-preset="${i}">${preset.label}</button>`).join('')}</div><code class="sw3286-source">${esc(v.source.text.trim())}</code><div class="sw3286-stage"><div class="sw3286-map" style="max-width:${Math.min(450,v.cols.length*108+40)}px">${safeWalk3286Grid(v,Math.max(280,(host.clientWidth||600)-28))}</div><div class="sw3286-operations">${meter}${operation}${update}${queue}${hits}</div></div><div class="sw3286-legend"><span>● 0 · ${t('an toàn','safe')}</span><span class="bad">−1 · ${t('ô 1, kể cả S/T','cell 1, including S/T')}</span><span>B: ${t('max HP đã tới','most HP seen')}</span><span>u: ${t('đang xét','current')} · v: ${t('ô kế','next')}</span></div>${v.cropped?`<small>${t('Lưới rút gọn · tọa độ gốc · … là khoảng ẩn','Condensed grid · original coordinates · … marks hidden spans')}</small>`:''}${v.trace.truncated?`<small class="sw3286-notice">${v.trace.omitted} ${t('sự kiện đã lược · tìm kiếm vẫn chạy đến hết','events omitted · search completed in full')}</small>`:''}</section>`;
  host.safeWalk3286Current=v;
  const redraw=()=>{const map=host.querySelector?.('.sw3286-map');if(map)map.innerHTML=safeWalk3286Grid(host.safeWalk3286Current,map.clientWidth||280);};
  redraw();
  if(typeof ResizeObserver!=='undefined'&&!host.safeWalk3286Observer) {host.safeWalk3286Observer=new ResizeObserver(redraw);host.safeWalk3286Observer.observe(host);}
  host.querySelectorAll?.('[data-sw3286-preset]').forEach(button=>{
    button.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter')event.stopPropagation();});
    button.addEventListener('click',()=>{const preset=presets[Number(button.dataset.sw3286Preset)];$('arrInput').value=preset.input;document.querySelector('[data-param="health"]').value=String(preset.health);runViz();});
  });
}
