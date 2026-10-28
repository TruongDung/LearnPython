function renderDistanceCycle2204Pictures(step){
 const host=$('treeView'),v=step.distanceCycle2204View;if(!host||!v)return;
 const t=(vi,en)=>lang==='vi'?vi:en,esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const final=Boolean(step.final),treeKey=JSON.stringify([v.n,v.edges]),frameKey=treeKey+':'+v.frame,same=host.dataset?.d2204Frame===frameKey;
 const defaultSelected=final?v.dist.indexOf(Math.max(...v.dist)):-1;
 const selected=final&&same?Math.max(0,Math.min(v.n-1,Number(host.dataset.d2204Selected??defaultSelected))):defaultSelected;
 const oldSelected=Number(host.dataset?.d2204RenderedSelected??-1),oldScroll=host.dataset?.d2204Tree===treeKey?host.querySelector?.('.d2204-graph-wrap')?.scrollLeft||0:0;
 if(host.dataset){host.dataset.d2204Tree=treeKey;host.dataset.d2204Frame=frameKey;host.dataset.d2204Selected=String(selected);host.dataset.d2204RenderedSelected=String(selected);}
 const color=d=>d>=0?'d'+Math.min(d,5):'unknown',num=d=>d===undefined||d<0?'?':d;
 const card=(label,html,cls='')=>`<section class="d2204-card ${cls}"><header>${label}</header>${html}</section>`;
 const tile=(id,cls='',small='')=>`<span class="d2204-tile ${cls}"><b>${id}</b>${small!==''?`<small>${small}</small>`:''}</span>`;
 const row=(nodes,distances=false)=>`<div class="d2204-row">${nodes.map(u=>tile(u,distances?color(v.dist[u]):'leaf',distances?'d = '+num(v.dist[u]):'')).join('')||'<span class="d2204-empty">∅</span>'}</div>`;
 const phase=v.phase==='build'?-1:v.phase==='peel'?0:1,route=final?v.analysis.paths[selected]:[];
 const phases=`<div class="d2204-phases"><span class="${phase===0?'active':phase>0?'done':''}"><b>✂</b><small>${t('Gọt lá → lộ vòng','Peel leaves → reveal cycle')}</small></span><span class="${phase===1?'active':''}"><b>◎ →</b><small>${t('BFS từ mọi đỉnh trên vòng','BFS from every cycle node')}</small></span></div>`;

 function graph(){
  const g=Array.from({length:v.n},()=>[]);v.edges.forEach(([u,w])=>{g[u].push(w);g[w].push(u);});
  // This input-only layout places the ring left and attached trees right.
  // The picture reveals cycle membership only when the Python line binds cycle.
  const degree=g.map(a=>a.length),leaves=[],gone=Array(v.n).fill(false);degree.forEach((d,u)=>{if(d===1)leaves.push(u);});
  for(let h=0;h<leaves.length;h++){const u=leaves[h];gone[u]=true;for(const w of g[u])if(!gone[w]){degree[w]--;if(degree[w]===1)leaves.push(w);}}
  const ring=Array.from({length:v.n},(_,u)=>u).filter(u=>!gone[u]),ringSet=new Set(ring),order=[ring[0]];
  let parent=-1,u=ring[0];do{const next=g[u].find(w=>ringSet.has(w)&&w!==parent);parent=u;u=next;if(u!==order[0])order.push(u);}while(u!==order[0]);
  const depth=Array(v.n).fill(-1),q=[...ring];ring.forEach(u=>depth[u]=0);for(let h=0;h<q.length;h++)for(const w of g[q[h]])if(depth[w]<0){depth[w]=depth[q[h]]+1;q.push(w);}
  const levels=[];depth.forEach((d,u)=>{if(d>0)(levels[d]??=[]).push(u);});
  const radius=Math.max(54,ring.length*13),maxDepth=Math.max(...depth),maxRows=Math.max(0,...levels.filter(Boolean).map(a=>a.length));
  const height=Math.max(280,2*radius+160,(maxRows+1)*78),cx=radius+95,cy=height/2,first=2*radius+210;
  const width=maxDepth?first+(maxDepth-1)*100+60:2*radius+190,pos=[];
  order.forEach((u,i)=>{const angle=i*2*Math.PI/order.length;pos[u]={x:cx+radius*Math.cos(angle),y:cy+radius*Math.sin(angle)};});
  levels.forEach((nodes,d)=>nodes?.forEach((u,i)=>pos[u]={x:first+(d-1)*100,y:(i+1)*height/(nodes.length+1)}));
  let svg='<defs><marker id="d2204-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10Z" style="fill:context-stroke;stroke:none"/></marker></defs>';
  function line(a,b,cls,arrow=false){
   const p=pos[a],r=pos[b],dx=r.x-p.x,dy=r.y-p.y,length=Math.hypot(dx,dy),x1=p.x+dx/length*25,y1=p.y+dy/length*25,x2=r.x-dx/length*28,y2=r.y-dy/length*28;
   let d=`M${x1},${y1} L${x2},${y2}`;
   if(ringSet.has(a)!==ringSet.has(b)){
    const root=ringSet.has(a)?a:b,branch=root===a?b:a,c=pos[root],e=pos[branch],sx=e.x-c.x,sy=e.y-c.y,den=sx*sx+sy*sy;
    const blocked=ring.some(u=>{if(u===root)return false;const at=pos[u],f=Math.max(0,Math.min(1,((at.x-c.x)*sx+(at.y-c.y)*sy)/den));return Math.hypot(at.x-c.x-f*sx,at.y-c.y-f*sy)<33;});
    if(blocked){const sign=c.y<cy?-1:1,lane=cy+sign*(radius+50),start={x:c.x,y:c.y+sign*25},end={x:e.x-28,y:e.y};
     d=root===a?`M${start.x},${start.y} C${c.x},${lane} ${e.x-45},${lane} ${end.x},${end.y}`:`M${end.x},${end.y} C${e.x-45},${lane} ${c.x},${lane} ${start.x},${start.y}`;
    }
   }
   return `<path class="d2204-edge ${cls}" d="${d}" ${arrow?'marker-end="url(#d2204-arrow)"':''} data-edge="${a},${b}"/>`;
  }
  v.edges.forEach(([u,w])=>{const cycle=v.cycle.includes(u)&&v.cycle.includes(w),active=!final&&v.activeEdge&&((v.activeEdge[0]===u&&v.activeEdge[1]===w)||(v.activeEdge[1]===u&&v.activeEdge[0]===w));
   svg+=line(u,w,active?'active':cycle?'d0':phase===0&&(v.removed[u]||v.removed[w])?'cut':v.dist[u]>=0&&v.dist[w]>=0?'known':'');
  });
  if(final)route.slice(0,-1).forEach((u,i)=>svg+=line(u,route[i+1],'witness',true));
  for(let u=0;u<v.n;u++){
   const p=pos[u],onCycle=v.cycle.includes(u),active=!final&&v.active===u,cls=final&&selected===u?'selected':active?'active':v.dist.length?color(v.dist[u]):phase===0&&v.removed[u]?'cut-node':'unknown';
   svg+=`<g class="d2204-node ${cls}" transform="translate(${p.x},${p.y})" data-node="${u}" ${final?`data-d2204-select="${u}" role="button" tabindex="0" aria-label="${esc(t('Đỉnh','Node'))} ${u}, d = ${v.dist[u]}"`:''}>${onCycle?'<circle class="d2204-ring" r="29"/>':''}<circle class="d2204-disc" r="24"/><text class="d2204-id" y="${v.dist.length?'-2':'6'}" text-anchor="middle">${u}</text>${v.dist.length?`<text class="d2204-distance" y="16" text-anchor="middle">d = ${num(v.dist[u])}</text>`:phase===0?`<text class="d2204-degree" y="44" text-anchor="middle">${v.removed[u]?'×':'deg '+(v.degree[u]??'?')}</text>`:''}</g>`;
  }
  const minWidth=Math.min(width,Math.max(320,ring.length*35+maxDepth*85)),available=(host.clientWidth||560)-48;
  const legend=v.dist.length?[...new Set(v.dist.filter(d=>d>0))].sort((a,b)=>a-b):[1,2];
  return `<div class="d2204-graph-wrap"><svg class="d2204-graph" style="min-width:${minWidth}px;max-width:${width}px;margin:auto" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(t('Chu trình và khoảng cách trên các nhánh','Cycle and branch distances'))}">${svg}</svg></div>${minWidth>available?`<small>↔ ${t('Kéo ngang để xem','Scroll sideways to explore')}</small>`:''}<div class="d2204-legend"><span class="d0">◎ ${t('trên vòng','on cycle')} · 0</span>${legend.map(d=>`<span class="${color(d)}">● ${d}</span>`).join('')}</div>`;
 }

 const heading=final?'✓ '+t('Khoảng cách tới vòng','Distances to the cycle'):phase<0?t('Đọc đồ thị','Read the graph'):phase===0?'✂ '+t('Lá không nằm trên vòng','Leaves are outside the cycle'):'◎ '+t('Lan từ khoảng cách 0','Spread from distance 0');
 let body=phases+card(phase===0?t('Gọt lá, giữ nguyên vòng','Peel leaves, retain the ring'):phase<0?t('Đồ thị ban đầu','Input graph'):t('BFS trên toàn bộ đồ thị gốc','BFS on the full original graph'),graph());
 if(!final&&phase>=0)body+=card(phase===0?'queue · '+t('các lá','leaves'):'queue · BFS',row(v.queue,phase===1));
 if(phase===0)body+=card(t('Đã gọt','Pruned'),row(v.pruned));
 if(v.cycle.length)body+=card('◎ '+t('Nguồn BFS · mọi đỉnh trên vòng','BFS sources · every cycle node'),row(v.cycle,true),'d0');
 if(v.change)body+=card('dist[v] = dist[u] + 1',`<div class="d2204-equation">d[${v.change.node}] = ${v.change.base} + 1 <strong>→ ${v.change.to}</strong></div><div class="d2204-row">${tile(v.change.parent,color(v.change.base),'d = '+v.change.base)}<b>→</b>${tile(v.change.node,color(v.change.to),'d = '+v.change.to)}</div>`);
 if(v.condition&&!final)body+=`<div class="d2204-condition"><code>${esc(v.condition.expression)}</code><b class="${v.condition.result?'yes':'no'}">${v.condition.result?'True':'False'}</b></div>`;
 if(v.dist.length)body+=card('dist · '+t('đỉnh ở trên, khoảng cách ở dưới','node above, distance below'),`<div class="d2204-array">${Array.from({length:v.n},(_,u)=>`<${final?'button type="button"':'span'} class="d2204-value ${color(v.dist[u])} ${final&&selected===u?'selected':''}" ${final?`data-d2204-select="${u}"`:''}><small>${u}</small><b>${num(v.dist[u])}</b></${final?'button':'span'}>`).join('')}</div>`);
 if(final)body+=card(t('Bấm một đỉnh → xem đường về vòng','Choose a node → see its path to the cycle'),`<div class="d2204-route">${route.map((u,i)=>`${i?'<b>→</b>':''}${tile(u,color(v.dist[u]),'d = '+v.dist[u])}`).join('')}</div><div class="d2204-equation"><strong>${v.dist[selected]}</strong> ${t('cạnh','edges')} ${v.dist[selected]===0?'· ◎':''}</div>`);
 const timeline=typeof steps==='undefined'?[]:steps,at=typeof stepIndex==='undefined'?-1:stepIndex;
 const jumps=[['prune','✂'],['cycle','◎'],['assign','+1 dist'],['result','🏁']].filter(([event])=>timeline.some((s,i)=>i>at&&s.distanceCycle2204View?.event===event));
 host.innerHTML=`<div class="d2204-viz"><header class="d2204-heading"><strong>${heading}</strong><small>L${step.codeLines[0]} · #${v.frame}</small></header>${body}<nav class="d2204-nav">${jumps.map(([event,label])=>`<button type="button" data-d2204-jump="${event}">${label} →</button>`).join('')}</nav><nav class="d2204-presets"><small>${t('Ví dụ','Examples')}</small><button type="button" data-d2204-example="branch">${t('Có nhánh','Branches')}</button><button type="button" data-d2204-example="double">${t('Hai phía','Two sides')}</button><button type="button" data-d2204-example="ring">${t('Toàn vòng','All cycle')}</button></nav></div>`;
 const wrap=host.querySelector?.('.d2204-graph-wrap');if(wrap){wrap.scrollLeft=oldScroll;if(final&&same&&oldSelected!==selected){const node=wrap.querySelector(`[data-node="${selected}"]`);if(node){const a=wrap.getBoundingClientRect(),b=node.getBoundingClientRect();wrap.scrollLeft+=b.left+b.width/2-a.left-a.width/2;}}}
 host.querySelectorAll?.('[data-d2204-select]').forEach(button=>{const select=()=>{host.dataset.d2204Selected=button.dataset.d2204Select;renderDistanceCycle2204Pictures(step);};button.addEventListener('click',select);if(button.tagName.toLowerCase()==='g')button.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select();}});});
 host.querySelectorAll?.('[data-d2204-jump]').forEach(button=>button.addEventListener('click',()=>{const index=timeline.findIndex((s,i)=>i>at&&s.distanceCycle2204View?.event===button.dataset.d2204Jump);if(index>=0){stepIndex=index;renderStep();}}));
 host.querySelectorAll?.('[data-d2204-example]').forEach(button=>button.addEventListener('click',async()=>{const presets={branch:{n:7,edges:'1-2,2-4,4-3,3-1,0-1,5-2,6-5'},double:{n:9,edges:'0-1,1-2,0-2,2-6,6-7,6-8,0-3,3-4,3-5'},ring:{n:5,edges:'0-1,1-2,2-3,3-4,4-0'}};const p=presets[button.dataset.d2204Example];$('arrInput').value=p.edges;$('param-n').value=p.n;await runViz();}));
}
