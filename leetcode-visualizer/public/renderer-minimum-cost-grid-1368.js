'use strict';

const ARROW1368_NAMES = ['DFS + Backtracking', 'Dijkstra + Min Heap', '0-1 BFS + Deque', 'BFS + DFS · Layered expansion', 'Bellman-Ford'];
const ARROW1368_TIMES = ['Exponential', 'O(MN log(MN))', 'O(MN)', 'O(MN)', 'O((MN)²)'];
const ARROW1368_DIRECTIONS = [[0,1],[0,-1],[1,0],[-1,0]];
const ARROW1368_GLYPHS = ['→','←','↓','↑'];

function arrow1368Grid(v, availableWidth) {
  const width = Math.max(150, Math.min(420, availableWidth)), pad = 25;
  const pitch = (width-pad*2)/v.cols.length, size = Math.min(pitch-12,100);
  const height = pad*2+pitch*v.rows.length;
  const key = p => p.join(',');
  const same = (a,b) => a && b && a[0]===b[0] && a[1]===b[1];
  const direction = (a,b) => ARROW1368_DIRECTIONS.findIndex(([dr,dc]) => a[0]+dr===b[0] && a[1]+dc===b[1]);
  const center = p => [pad+pitch*(v.cols.indexOf(p[1])+.5),pad+pitch*(v.rows.indexOf(p[0])+.5)];
  const visible = p => v.rows.includes(p[0]) && v.cols.includes(p[1]);
  const route = v.final ? v.route : v.method===1 ? v.path : [];
  const next = new Map(route.slice(0,-1).map((p,i) => [key(p),route[i+1]]));
  const routeSet = new Set(route.map(key));
  const arrow = (x,y,dir,css) => {
    const length=Math.min(13,Math.max(6,(size-34)/2)), head=length*.55, side=length*.4;
    const [dy,dx]=ARROW1368_DIRECTIONS[dir], tipX=x+dx*length,tipY=y+dy*length,baseX=tipX-dx*head,baseY=tipY-dy*head;
    return `<path class="ag1368-arrow ${css}" d="M${x-dx*length},${y-dy*length}L${tipX},${tipY}M${baseX-dy*side},${baseY+dx*side}L${tipX},${tipY}L${baseX+dy*side},${baseY-dx*side}"/>`;
  };
  let marks = v.cols.map((c,i) => `<text class="ag1368-axis" x="${pad+pitch*(i+.5)}" y="14" text-anchor="middle">${i && c>v.cols[i-1]+1?'… ':''}${c}</text>`).join('');
  marks += v.rows.map((r,i) => `<text class="ag1368-axis" x="10" y="${pad+pitch*(i+.5)+4}" text-anchor="middle">${i && r>v.rows[i-1]+1?'…':''}${r}</text>`).join('');
  for (let i=1;i<route.length;i++) {
    const a=route[i-1],b=route[i];
    if (!visible(a)||!visible(b)) continue;
    const [x1,y1]=center(a),[x2,y2]=center(b),[dr,dc]=ARROW1368_DIRECTIONS[direction(a,b)];
    const cell=v.cells.flat().find(c=>c.r===a[0]&&c.c===a[1]);
    const paid=cell.arrow!==direction(a,b)+1;
    marks+=`<path class="ag1368-route ${paid?'paid':''}" d="M${x1+dc*size/2},${y1+dr*size/2}L${x2-dc*size/2},${y2-dr*size/2}"/>`;
  }
  for (const cell of v.cells.flat()) {
    const p=[cell.r,cell.c], [x,y]=center(p), destination=next.get(key(p));
    const changed=v.final && destination && direction(p,destination)+1!==cell.arrow;
    const current=!v.final&&same(p,v.current),probe=!v.final&&same(p,v.probe?.to);
    const css=['ag1368-cell',cell.distance!=='∞'?'known':'',routeSet.has(key(p))?'route':'',current?'current':'',probe?'probe':'',changed?'changed':''].join(' ');
    const endpoint=cell.r===0&&cell.c===0?(v.height*v.width===1?'S/T':'S'):cell.r===v.height-1&&cell.c===v.width-1?'T':'';
    const distance=v.method===1?'g':'d';
    const label=changed?(size<64?'+1':`${ARROW1368_GLYPHS[cell.arrow-1]}⇒${ARROW1368_GLYPHS[direction(p,destination)]} +1`):`${distance}=${cell.distance}`;
    marks+=`<g class="${css}" data-cell="${cell.r},${cell.c}" data-distance="${cell.distance}"><title>(${cell.r},${cell.c}) · ${ARROW1368_GLYPHS[cell.arrow-1]} · ${distance}=${cell.distance}${changed?' · +1':''}</title><rect x="${x-size/2}" y="${y-size/2}" width="${size}" height="${size}" rx="11"/><text x="${x-size/2+7}" y="${y-size/2+15}">${endpoint}</text><text x="${x+size/2-8}" y="${y-size/2+15}" text-anchor="end">${current?'u':probe?'v':''}</text>${arrow(x,y-6,changed?direction(p,destination):cell.arrow-1,changed?'paid':routeSet.has(key(p))?'free':'')}<text x="${x}" y="${y+size/2-8}" text-anchor="middle">${label}</text></g>`;
  }
  const edge=v.probe;
  if (!v.final&&edge?.direction&&visible(edge.from)&&visible(edge.to)) {
    const [x1,y1]=center(edge.from),[x2,y2]=center(edge.to),[dr,dc]=ARROW1368_DIRECTIONS[edge.direction-1];
    const x=(x1+x2)/2,y=(y1+y2)/2;
    marks+=`<path class="ag1368-edge ${edge.weight?'paid':''}" d="M${x1+dc*(size/2-2)},${y1+dr*(size/2-2)}L${x2-dc*(size/2-2)},${y2-dr*(size/2-2)}"/><rect class="ag1368-edge-label" x="${x-10}" y="${y-10}" width="20" height="20" rx="4"/><text x="${x}" y="${y+4}" text-anchor="middle">${edge.weight?'+1':'0'}</text>`;
  }
  return `<svg class="ag1368-grid" viewBox="0 0 ${width} ${height}" role="img" aria-label="1368 arrow grid, ${v.height} rows, ${v.width} columns. S to T. u: current cell; v: next cell. ${v.final?'Minimum cost '+v.answer:''}">${marks}</svg>`;
}

function renderArrowGrid1368View(step) {
  const v=step.arrow1368View,host=$('treeView'),t=(vi,en)=>lang==='vi'?vi:en,esc=escapeHtml;
  const coord=p=>p?`(${p[0]},${p[1]})`:'—';
  const ratings=[t('Không tối ưu','Not optimal'),t('Tốt','Good'),t('Tối ưu','Optimal'),t('Tối ưu','Optimal'),t('Không khuyến nghị','Not recommended')];
  const edge=v.probe;
  let transition=`<div class="ag1368-hint">S → T<br><span>1 → &nbsp; 2 ← &nbsp; 3 ↓ &nbsp; 4 ↑</span></div>`;
  if(edge) {
    transition=edge.direction?`<div class="ag1368-transition ${edge.weight?'paid':'free'}"><div><small>${coord(edge.from)}</small><b>${ARROW1368_GLYPHS[edge.original-1]}</b></div><span>⇒</span><div><small>${t('Đi tới','Go to')} ${coord(edge.to)}</small><b>${ARROW1368_GLYPHS[edge.direction-1]}</b></div><strong>${edge.weight?'+1':'0'}</strong></div>`:`<div class="ag1368-outside">${coord(edge.from)} ↛ ${coord(edge.to)}<br>${t('Ngoài lưới','Out of bounds')}</div>`;
  }
  if(v.final) transition=`<div class="ag1368-answer" data-answer="${v.answer}"><b>${v.answer}</b><span>${t('mũi tên cần đổi','arrow changes')} · S → T ✓</span></div>`;
  let entries=v.method===1?v.stack:v.queue;
  const coordinates=v.queueFormat==='coordinates';
  let heading=['STACK · đáy → đỉnh','MIN-HEAP · ưu tiên → pop','DEQUE · đầu ← 0 | 1 → cuối',`BFS · lớp ${v.locals.cost??0}`,`Bellman-Ford · lượt ${(v.locals.turn??0)+1}`][v.method-1];
  if(lang!=='vi') heading=['STACK · bottom → top','MIN-HEAP · priority → pop','DEQUE · front ← 0 | 1 → back',`BFS · layer ${v.locals.cost??0}`,`Bellman-Ford · pass ${(v.locals.turn??0)+1}`][v.method-1];
  if(coordinates)heading+=' · (r,c)';
  let frontier;
  if(v.method===5) {
    frontier=`<div class="ag1368-sweep">${v.rows.map(r=>v.cols.map(c=>`<span class="${v.current?.[0]===r&&v.current?.[1]===c?'active':''}">${coord([r,c])}</span>`).join('')).join('')}<span>→</span></div>`;
  } else {
    frontier=`<div class="ag1368-queue">${entries.map((entry,i)=>{const[cost,r,c]=coordinates?[null,...entry]:entry;return`<div class="${(v.method===1?i===entries.length-1:i===0)?'active':''}" data-queue-cell="${r},${c}"><span>${coord([r,c])}</span>${coordinates?'':`<b>${cost}</b>`}</div>`;}).join('')||'<span class="ag1368-empty">∅</span>'}${v.queueSize>entries.length&&v.method!==1?`<span>+${v.queueSize-entries.length}</span>`:''}</div>`;
  }
  const stack=v.method===4?`<div class="ag1368-dfs"><span>DFS · ${t('theo cạnh 0','follow 0-edges')}</span><b>${v.floodStack.length?v.floodStack.map(coord).join(' → '):'∅'}</b></div>`:'';
  const best=v.method===1?`<div class="ag1368-dfs"><span>best</span><b>${esc(v.locals.best??'∞')}</b><span>↶ ${t('quay lui','backtrack')}</span></div>`:'';
  const changes=v.final?`<div class="ag1368-changes">${(v.changes??[]).slice(0,10).map(change=>`<div><span>${coord(change.cell)}</span><b>${ARROW1368_GLYPHS[change.from-1]} ⇒ ${ARROW1368_GLYPHS[change.to-1]}</b><span>+1</span></div>`).join('')||`<span>✓ ${t('Giữ nguyên mọi mũi tên','Keep every arrow')}</span>`}${v.changes?.length>10?`<span>+${v.changes.length-10}</span>`:''}</div>`:'';
  const comparison=`<details class="ag1368-comparison"><summary>${t('So sánh 5 cách giải','Compare 5 approaches')}</summary><div><table><thead><tr><th>#</th><th>${t('Phương pháp','Method')}</th><th>Time</th><th>Space</th><th>${t('Đánh giá','Assessment')}</th></tr></thead><tbody>${ARROW1368_NAMES.map((name,i)=>`<tr class="${i+1===v.method?'selected':''}"><td>${i+1}</td><td>${name}</td><td>${ARROW1368_TIMES[i]}</td><td>O(MN)</td><td>${ratings[i]}</td></tr>`).join('')}</tbody></table></div></details>`;
  const limitNote=v.trace.truncated?`<small class="ag1368-notice">${v.trace.omitted} ${t('sự kiện đã lược · đáp án tính đầy đủ','events omitted · complete answer computed')}</small>`:'';
  host.innerHTML=`<section class="ag1368-viz" data-method="${v.method}"><header><b>${ARROW1368_NAMES[v.method-1]}</b><span>${t(v.final?'Trả về':'Trước dòng',v.final?'Return':'Before line')} ${v.source.line} · ${v.source.scope}()</span></header><code class="ag1368-source">${esc(v.source.text.trim())}</code><div class="ag1368-stage"><div class="ag1368-map" style="max-width:${Math.min(420,v.cols.length*112+50)}px">${arrow1368Grid(v,Math.max(280,(host.clientWidth||600)-28))}</div><div class="ag1368-operations">${transition}<section class="ag1368-frontier"><header><b>${heading}</b>${v.method!==1&&v.method!==5?`<small>${v.queueSize}</small>`:''}</header>${frontier}${stack}${best}</section>${changes}</div></div><div class="ag1368-legend"><span class="free">━ ${t('thuận hướng','follow arrow')} · 0</span><span class="paid">┄ ${t('đổi tại ô rời','change at departure')} · +1</span><span>u: ${t('đang xét','current')} · v: ${t('ô kế','next')}</span><span>${v.method===1?'g':'d'}: ${t(v.method===1?'chi phí nhánh':'chi phí tốt nhất',v.method===1?'branch cost':'best cost')}</span></div>${v.cropped?`<small>${t('Lưới rút gọn · tọa độ gốc · … là khoảng ẩn','Condensed grid · original coordinates · … marks hidden spans')}</small>`:''}${limitNote}${comparison}</section>`;
  const redraw=()=>{
    const map=host.querySelector?.('.ag1368-map');
    if(map) map.innerHTML=arrow1368Grid(host.arrow1368Current,map.clientWidth||280);
  };
  host.arrow1368Current=v;
  redraw();
  if(typeof ResizeObserver!=='undefined'&&!host.arrow1368Observer) {
    host.arrow1368Observer=new ResizeObserver(redraw);
    host.arrow1368Observer.observe(host);
  }
}
