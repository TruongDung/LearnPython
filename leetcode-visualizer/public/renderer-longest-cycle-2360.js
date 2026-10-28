function cycle2360PictureLayout(edges,available=500) {
 const n=edges.length,order=[],seen=new Set();
 for(let start=0;start<n;start++)for(let node=start;node!==-1&&!seen.has(node);node=edges[node]){seen.add(node);order.push(node);}
 const width=Math.max(n>8?420:Math.max(220,128+n*18),Math.min(500,available)),radius=Math.min(152,(width-128)/2),height=n===1?160:radius*2+144,cx=width/2,cy=n===1?80:radius+72;
 const positions=Array(n);
 order.forEach((node,i)=>{const angle=i*2*Math.PI/n-Math.PI/2;positions[node]=n===1?{x:cx,y:cy,nx:0,ny:-1}:{x:cx+radius*Math.cos(angle),y:cy+radius*Math.sin(angle),nx:Math.cos(angle),ny:Math.sin(angle)};});
 return{width,height,positions};
}
function renderLongestCycle2360Pictures(step) {
 const host=$('treeView'),v=step.cycle2360View;if(!host||!v)return;
 const t=(vi,en)=>lang==='vi'?vi:en,{width,height,positions}=cycle2360PictureLayout(v.edges,(host.clientWidth||550)-24);
 const n=v.edges.length,pathDepth=new Map(v.path.map(item=>[item.node,item.depth])),cycle=step.final?v.bestCycle:v.cycle,inCycle=new Set(cycle);
 const cycleEdges=new Set(cycle.map((node,i)=>`${node},${cycle[(i+1)%cycle.length]}`));
 const pathEdges=new Set(v.path.slice(1).map((item,i)=>`${v.path[i].node},${item.node}`));
 const scan=['start','check-start','skip'].includes(v.event);
 const graphEdges=v.edges.map((target,node)=>{
  if(target===-1)return'';
  const a=positions[node],b=positions[target],key=`${node},${target}`,loop=node===target;
  let d;
  if(loop){const tx=-a.ny,ty=a.nx;d=`M${a.x+a.nx*10+tx*13},${a.y+a.ny*10+ty*13}C${a.x+a.nx*53+tx*35},${a.y+a.ny*53+ty*35} ${a.x+a.nx*53-tx*35},${a.y+a.ny*53-ty*35} ${a.x+a.nx*10-tx*13},${a.y+a.ny*10-ty*13}`;}
  else{
   const distance=Math.hypot(b.x-a.x,b.y-a.y),dx=(b.x-a.x)/distance,dy=(b.y-a.y)/distance;
   const start={x:a.x+dx*21,y:a.y+dy*21},end={x:b.x-dx*23,y:b.y-dy*23};
   d=v.edges[target]===node?`M${start.x},${start.y}Q${(a.x+b.x)/2-dy*24},${(a.y+b.y)/2+dx*24} ${end.x},${end.y}`:`M${start.x},${start.y}L${end.x},${end.y}`;
  }
  const closed=cycleEdges.has(key),moving=v.move?.from===node&&v.move?.to===target,walk=pathEdges.has(key),tone=closed?'cycle':moving||walk?'walk':'base';
  return `<path class="c2360-edge ${tone} ${moving?'moving':''}" data-edge="${key}" d="${d}" marker-end="url(#c2360-arrow-${tone})"/>`;
 }).join('');
 const graphNodes=v.edges.map((target,node)=>{
  const p=positions[node],depth=pathDepth.get(node),focus=!step.final&&!scan&&v.current===node,candidate=scan&&v.start===node;
  const cls=[v.visited[node]?'seen':'',!step.final&&pathDepth.has(node)?'on-walk':'',inCycle.has(node)?'in-cycle':'',focus?'focus':'',candidate?'candidate':''].join(' ');
  return `<g class="c2360-node ${cls}" data-node="${node}"><circle cx="${p.x}" cy="${p.y}" r="18"/><text class="c2360-node-id" x="${p.x}" y="${p.y+6}" text-anchor="middle">${node}</text>${v.visited[node]?`<text class="c2360-tick" x="${p.x+14}" y="${p.y+20}">✓</text>`:''}${depth!==undefined&&!step.final?`<text class="c2360-position" x="${p.x+p.nx*33}" y="${p.y+p.ny*33+4}" text-anchor="middle">p=${depth}</text>`:''}${target===-1?`<text class="c2360-sink" x="${p.x+17}" y="${p.y-14}">⊥</text>`:''}</g>`;
 }).join('');
 const graph=`<div class="c2360-board-scroll"><svg class="c2360-graph" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${t('Đồ thị có hướng, đường đang đi và chu trình','Directed graph, current walk and cycle')}"><defs>${['base','walk','cycle'].map(tone=>`<marker id="c2360-arrow-${tone}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path class="${tone}" d="M0,0L6,3L0,6Z"/></marker>`).join('')}</defs>${graphEdges}${graphNodes}</svg></div>`;
 const finalPath=step.final?v.bestCycle.map((node,depth)=>({node,depth})):v.path;
 let pathChips=finalPath.map((item,i)=>`${i?'<i>→</i>':''}<span class="c2360-path-node ${inCycle.has(item.node)?'in-cycle':''} ${cycle.length&&!inCycle.has(item.node)?'prefix':''}" data-path-node="${item.node}"><b>${item.node}</b>${!step.final?`<small>p=${item.depth}</small>`:''}</span>`).join('')||'<span class="c2360-empty">∅</span>';
 const walkEvents=['follow','inspect','check-cycle','cycle','stop'];
 if(!step.final&&v.path.length&&walkEvents.includes(v.event)&&v.current!==null){
  const repeated=pathDepth.has(v.current),pending=v.current===-1||!repeated||v.path.at(-1).node!==v.current||v.event==='check-cycle'||v.event==='cycle';
  if(pending)pathChips+=`<i>→</i><span class="c2360-next ${repeated?'repeat':''}"><b>${v.current}</b><small>${repeated?'↶ p='+pathDepth.get(v.current):v.current===-1?'⊥':'?'}</small></span>`;
 }
 const loopCaption=cycle.length&&(step.final||['check-cycle','cycle'].includes(v.event))?`<div class="c2360-loop">↶ ${cycle[0]}${step.final?'':' · position = '+v.repeatAt}</div>`:'';
 const path=`<section class="c2360-path"><header><b>${step.final?t('Chu trình dài nhất','Longest cycle'):'position'}</b><small>${step.final?v.longest>0?v.longest+' ✓':'−1':v.path.length}</small></header><div>${pathChips}</div>${loopCaption}</section>`;
 const formula=['check-cycle','cycle'].includes(v.event)?`<div class="c2360-formula"><span><small>len(position)</small><b>${v.path.length}</b></span><i>−</i><span><small>position[node]</small><b>${v.repeatAt}</b></span><i>=</i><span class="answer"><small>${t('độ dài','length')}</small><b>${v.cycleLength}</b></span></div>`:'';
 let operation='';
 if(v.move)operation=`<code>node</code><b>${v.move.from}</b><strong>→</strong><b class="${v.move.to===-1?'no':''}">${v.move.to}</b>`;
 else if(v.change?.kind==='visited')operation=`<code>visited[${v.change.node}]</code><b class="yes">✓</b>`;
 else if(v.change?.kind==='position')operation=`<code>position[${v.change.node}] =</code><b>${v.change.index}</b>`;
 else if(v.change?.kind==='longest')operation=`<code>longest</code><b>${v.change.from}</b><strong>→</strong><b class="yes">${v.change.to}</b>`;
 else if(v.reason==='old-walk')operation=`<b>${v.current}</b><span>visited ✓</span><span class="no">position ×</span>`;
 else if(v.reason==='dead-end')operation=`<b>−1 ⊥</b><span>${t('hết đường','dead end')}</span>`;
 else if(v.event==='skip')operation=`<code>visited[${v.start}] ✓</code><b>↷</b>`;
 const condition=v.condition?`<div class="c2360-condition"><code>${v.condition.expression}</code><b class="${v.condition.result?'yes':'no'}">${v.condition.result?'True':'False'}</b></div>`:'';
 const memory=`<section class="c2360-memory"><div style="--c2360-n:${n}"><small>node</small>${v.edges.map((_,node)=>`<b>${node}</b>`).join('')}<small>visited</small>${v.visited.map((seen,node)=>`<span class="${seen?'seen':''}" data-visited-node="${node}" data-value="${seen}">${seen?'✓':'·'}</span>`).join('')}<small>position</small>${v.edges.map((_,node)=>`<span class="${pathDepth.has(node)?'in-path':''}" data-position-node="${node}" data-value="${pathDepth.has(node)?pathDepth.get(node):'-'}">${pathDepth.has(node)?pathDepth.get(node):'—'}</span>`).join('')}</div></section>`;
 const edgeStrip=v.edges.map((target,node)=>`<span>${node}<i>→</i>${target}</span>`).join('');
 const metrics=`<div class="c2360-metrics"><span><small>start</small><b>${v.start??'—'}</b></span><span><small>node</small><b>${v.current??'—'}</b></span><span><small>longest</small><b class="${v.longest>0?'yes':''}">${v.locals.longest??'—'}</b></span></div>`;
 host.innerHTML=`<section class="c2360-viz"><header><strong>→ ${t('đi tiếp','walk')} · ↶ ${t('chu trình','cycle')}</strong><small>${t('sau dòng','after line')} ${v.source.line}</small></header>${metrics}${graph}<div class="c2360-legend"><span class="blue">● ${t('đường đang đi','current walk')}</span><span class="yes">● ${t('chu trình','cycle')}</span><span>✓ visited · ⊥ −1</span></div>${operation?`<div class="c2360-operation">${operation}</div>`:''}${condition}${formula}${path}${memory}<div class="c2360-edges"><small>edges</small><div>${edgeStrip}</div></div>${step.final?`<div class="c2360-result ${v.longest<0?'none':''}">${v.longest>0?v.longest+' ✓':'−1 · '+t('không có chu trình','no cycle')}</div>`:''}</section>`;
}
