function restricted1786PictureLayout(view,available=500){
 const width=Math.max(260,view.n*48+40,Math.min(520,available)),dp=['orient','dp','done'].includes(view.phase),positions=[];
 const values=[...new Set(view.distances.map(item=>item.value))].sort((a,b)=>a==='∞'?1:b==='∞'?-1:Number(a)-Number(b));
 const radius=Math.min(125,(width-110)/2),height=dp?340:radius*2+112;
 for(let node=1;node<=view.n;node++){
  const angle=(node-1)*2*Math.PI/view.n-Math.PI/2;
  positions[node]=dp?{x:44+(node-1)*(width-88)/(view.n-1),y:270-values.indexOf(view.distances[node-1].value)*210/Math.max(1,values.length-1)}:{x:width/2+radius*Math.cos(angle),y:height/2+radius*Math.sin(angle)};
 }
 return{width,height,positions,dp};
}
function renderRestrictedPaths1786Pictures(step){
 const host=$('treeView'),v=step.restricted1786View;if(!host||!v)return;
 const t=(vi,en)=>lang==='vi'?vi:en,{width,height,positions,dp}=restricted1786PictureLayout(v,(host.clientWidth||550)-24);
 const distance=node=>v.distances[node-1]?.value??'—',ways=node=>v.ways[node-1]?.value??'—';
 const sameFrame=host.dataset?.r1786Frame===String(v.frame),preview=step.final&&v.witnessPaths.length?Math.max(0,Math.min(v.witnessPaths.length-1,sameFrame?Number(host.dataset.r1786Path)||0:0)):null;
 if(host.dataset){host.dataset.r1786Frame=String(v.frame);host.dataset.r1786Path=String(preview??0);}
 const witness=preview===null?[]:v.witnessPaths[preview],witnessEdges=new Set(witness.slice(1).map((node,i)=>`${witness[i]},${node}`));
 const restricted=new Map(v.restrictedEdges.map(edge=>[edge.index,edge]));
 const edgeHtml=v.edges.map(edge=>{
  const slope=restricted.get(edge.index),from=dp&&slope?slope.from:edge.u,to=dp&&slope?slope.to:edge.v,a=positions[from],b=positions[to];
  const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy),sx=a.x+dx/length*20,sy=a.y+dy/length*20,ex=b.x-dx/length*23,ey=b.y-dy/length*23;
  const active=v.activeEdge&&(v.activeEdge.u===edge.u&&v.activeEdge.v===edge.v||v.activeEdge.u===edge.v&&v.activeEdge.v===edge.u);
  const denied=active&&(v.improves===false||v.event==='dp-skip'),chosen=witnessEdges.has(`${from},${to}`);
  const bend=dp&&Math.abs(edge.u-edge.v)>1?(edge.index%2?25:-25):0;
  const d=bend?`M${sx},${sy}Q${(sx+ex)/2+bend},${(sy+ey)/2} ${ex},${ey}`:`M${sx},${sy}L${ex},${ey}`;
  const marker=dp&&slope?` marker-end="url(#r1786-arrow-${chosen?'chosen':denied?'no':active?'active':'downhill'})"`:'';
  const weightWidth=String(edge.w).length*7+12;
  return `<g class="r1786-edge ${dp?slope?'downhill':'equal':'road'} ${active?'active':''} ${denied?'denied':''} ${chosen?'chosen':''} ${preview!==null&&!chosen?'dim':''}" data-edge="${edge.u},${edge.v}" data-from="${from}" data-to="${to}"><path d="${d}"${marker}/>${!dp?`<rect x="${(sx+ex)/2-weightWidth/2}" y="${(sy+ey)/2-10}" width="${weightWidth}" height="18" rx="4"/><text x="${(sx+ex)/2}" y="${(sy+ey)/2+3}" text-anchor="middle">${edge.w}</text>`:!slope?`<text x="${(sx+ex)/2}" y="${(sy+ey)/2-4}" text-anchor="middle">= ×</text>`:''}</g>`;
 }).join('');
 const focus=['pop','settle','stale','dijkstra-edge','candidate','relax-test','relax-skip','relax-improve','heap-push','dp-node','dp-edge','dp-test','dp-skip','dp-update'].includes(v.event)?v.currentNode:null;
 const nodes=v.distances.map(item=>{const p=positions[item.node];return `<g class="r1786-node ${item.settled?'settled':''} ${item.node===focus?'focus':''} ${item.node===v.n?'target':''} ${witness.includes(item.node)?'witness':''}" data-node="${item.node}" data-distance="${item.value}" data-ways="${ways(item.node)}"><circle cx="${p.x}" cy="${p.y}" r="18"/><text class="r1786-node-id" x="${p.x}" y="${p.y+6}" text-anchor="middle">${item.node}</text><text class="r1786-distance" x="${p.x}" y="${p.y-28}" text-anchor="middle">d=${item.value}</text>${dp?`<text class="r1786-way" x="${p.x}" y="${p.y+37}" text-anchor="middle">×${ways(item.node)}</text>`:item.settled?`<text class="r1786-tick" x="${p.x+14}" y="${p.y+21}">✓</text>`:''}</g>`;}).join('');
 const graph=`<div class="r1786-board-scroll"><svg class="r1786-graph" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${dp?t('Mũi tên đi từ khoảng cách lớn tới nhỏ','Arrows go from higher to lower distance'):t('Đồ thị vô hướng và khoảng cách tới đích','Weighted graph and distances to the target')}"><defs>${['downhill','active','no','chosen'].map(tone=>`<marker id="r1786-arrow-${tone}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path class="${tone}" d="M0,0L6,3L0,6Z"/></marker>`).join('')}</defs>${edgeHtml}${nodes}</svg></div>`;
 let operation='';
 if(['candidate','relax-test','relax-skip','relax-improve','heap-push'].includes(v.event)&&v.activeEdge){
  const old=v.oldDistance??distance(v.activeEdge.v);
  operation=`<div class="r1786-calc"><span><small>distance + weight</small><b>${v.locals.distance} + ${v.activeEdge.w}</b></span><i>=</i><b>${v.candidate}</b>${v.oldDistance!==null?`<i>${v.improves?'<':'≥'}</i><span><small>${v.event==='relax-improve'?t('dist cũ','old dist'):'dist[v]'}</small><b>${old}</b></span><strong class="${v.improves?'yes':'no'}">${v.improves?'✓':'×'}</strong>`:''}</div>`;
 }else if(v.event==='dp-update')operation=`<div class="r1786-calc"><span><small>ways[${v.dpTarget}]</small><b>${v.beforeWays}</b></span><i>+</i><span><small>ways[${v.dpSource}]</small><b>${v.contribution}</b></span><i>=</i><span class="yes"><small>ways[${v.dpTarget}]</small><b>${ways(v.dpTarget)}</b></span></div>`;
 else if(['dp-test','dp-skip'].includes(v.event)&&v.activeEdge)operation=`<div class="r1786-descent ${v.condition.result?'yes':'no'}"><b>${v.activeEdge.u} → ${v.activeEdge.v}</b><span>${distance(v.activeEdge.u)} ${distance(v.activeEdge.u)===distance(v.activeEdge.v)?'=':v.condition.result?'>':'<'} ${distance(v.activeEdge.v)} ${v.condition.result?'✓':'×'}</span></div>`;
 else if(['stale','skip-stale'].includes(v.event))operation=`<div class="r1786-descent no"><b>(${v.locals.distance},${v.locals.u}) ×</b><span>dist[${v.locals.u}] = ${distance(v.locals.u)}</span></div>`;
 else if(v.change?.kind==='pop')operation=`<div class="r1786-descent"><code>heappop()</code><b>→ (${v.change.distance},${v.change.node})</b></div>`;
 else if(v.event==='dp-seed')operation=`<div class="r1786-descent yes"><code>ways[${v.n}] =</code><b>1 ✓</b></div>`;
 const condition=v.condition?`<div class="r1786-condition"><code>${v.condition.expression}</code><b class="${v.condition.result?'yes':'no'}">${v.condition.result?'True':'False'}</b></div>`:'';
 const heap=v.phase==='dijkstra'?`<section class="r1786-heap"><header><b>heap</b><small>(distance, node) · heap[0] = min</small></header><div>${v.heap.map(item=>`<span class="${item.index===0?'root':''}" data-heap-index="${item.index}" data-pair="${item.distance},${item.node}"><small>[${item.index}]</small><code>(${item.distance},${item.node})</code></span>`).join('')||'<span class="r1786-empty">∅</span>'}</div></section>`:'';
 const order=v.order.length?`<section class="r1786-order"><small>order · dist ↑</small><div>${v.order.map(node=>`<span class="${v.phase==='dp'&&node===v.currentNode?'active':''}"><b>${node}</b><small>${distance(node)}</small></span>`).join('<i>→</i>')}</div></section>`:'';
 const pageSize=6,page=preview===null?0:Math.floor(preview/pageSize),pages=Math.max(1,Math.ceil(v.witnessPaths.length/pageSize));
 const pathCards=step.final&&v.witnessPaths.length?`<section class="r1786-paths"><header><b>1 → ${v.n}</b><small>${v.witnessPaths.length} ${t('đường hợp lệ','valid paths')}</small></header><div>${v.witnessPaths.slice(page*pageSize,(page+1)*pageSize).map((path,i)=>{const index=page*pageSize+i;return `<button type="button" class="r1786-path ${preview===index?'selected':''}" data-r1786-path="${index}"><div>${path.map(node=>`<b>${node}</b>`).join('<i>→</i>')}</div><small>${path.map(distance).join(' > ')} ✓</small></button>`;}).join('')}</div>${pages>1?`<nav class="r1786-pages"><button type="button" data-r1786-path="${(page-1)*pageSize}" ${page===0?'disabled':''}>←</button><small>${page+1}/${pages}</small><button type="button" data-r1786-path="${(page+1)*pageSize}" ${page===pages-1?'disabled':''}>→</button></nav>`:''}</section>`:'';
 const timeline=typeof steps==='undefined'?[]:steps,current=typeof stepIndex==='undefined'?-1:stepIndex;
 const jumps=[['pop','heap ↓'],['orient','dist ✓'],['dp-update','ways +']].map(([event,label])=>`<button type="button" data-r1786-jump="${event}" ${timeline.some((item,i)=>i>current&&item.restricted1786View?.event===event)?'':'disabled'}>${label}</button>`).join('');
 host.innerHTML=`<section class="r1786-viz"><header><strong>1 → ${v.n} · d ↓</strong><small>${t('sau dòng','after line')} ${v.source.line}</small></header><div class="r1786-stages"><span class="${!dp?'active':'done'}">1 · Dijkstra ← ${v.n}</span><i>→</i><span class="${dp?'active':''}">2 · ways</span><b>ways[1] = ${v.locals.ways?v.answer:'—'}</b></div>${graph}<div class="r1786-legend"><span>d = ${t('khoảng cách tới','distance to')} ${v.n}</span>${dp?`<span class="yes">→ d ${t('giảm','decreases')}</span><span>× ways</span>`:`<span class="yes">✓ ${t('đã chốt','settled')}</span>`}</div>${operation}${condition}${heap}${order}${step.final?`<div class="r1786-result ${v.answer?'yes':'no'}">${v.answer} ${t('đường','paths')} ${v.answer?'✓':''}</div>`:''}${pathCards}${!step.final?`<nav class="r1786-jumps">${jumps}</nav>`:''}</section>`;
 if(step.final)host.querySelectorAll?.('button[data-r1786-path]').forEach(button=>button.addEventListener('click',()=>{host.dataset.r1786Path=button.dataset.r1786Path;renderRestrictedPaths1786Pictures(step);}));
 host.querySelectorAll?.('[data-r1786-jump]').forEach(button=>button.addEventListener('click',()=>{const index=steps.findIndex((item,i)=>i>stepIndex&&item.restricted1786View?.event===button.dataset.r1786Jump);if(index>=0){stepIndex=index;renderStep();}}));
 const viewport=host.querySelector?.('.r1786-board-scroll'),target=step.final?1:focus??v.n;
 if(viewport&&positions[target])viewport.scrollLeft=Math.max(0,positions[target].x-viewport.clientWidth/2);
}
