'use strict';

function network743Graph(v,availableWidth) {
  const width=Math.max(220,Math.min(400,availableWidth)),height=v.nodes.length<=2?180:Math.max(250,Math.min(350,width));
  const ids=[v.k,...v.nodes.filter(id=>id!==v.k)],r=22,cx=width/2,cy=height/2;
  const positions=new Map(ids.map((id,i)=>{const angle=Math.PI+i*2*Math.PI/ids.length;return[id,ids.length===1?{x:cx,y:cy}:{x:cx+Math.cos(angle)*(width/2-36),y:cy+Math.sin(angle)*(height/2-54)}];}));
  const parent=new Map(v.parents),settled=new Set(v.settled),last=new Set(v.slowest);
  let marks='<defs>'+['base','active','tree'].map(type=>`<marker id="nd743-arrow-${type}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path class="nd743-marker ${type}" d="M0,0L10,5L0,10Z"/></marker>`).join('')+'</defs>';
  for(const[u,wNode,weight]of v.edges) {
    const a=positions.get(u),b=positions.get(wNode);if(!a||!b)continue;
    const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
    const reciprocal=v.edges.some(edge=>edge[0]===wNode&&edge[1]===u),curve=reciprocal?17:0;
    const x1=a.x+dx/len*(r+1),y1=a.y+dy/len*(r+1),x2=b.x-dx/len*(r+5),y2=b.y-dy/len*(r+5),qx=(a.x+b.x)/2+nx*curve,qy=(a.y+b.y)/2+ny*curve;
    const active=v.activeEdge?.u===u&&v.activeEdge?.v===wNode,tree=parent.get(wNode)===u&&(v.final||settled.has(wNode));
    const type=active?'active':tree?'tree':'base',x=(x1+2*qx+x2)/4,y=(y1+2*qy+y2)/4,labelWidth=Math.max(23,String(weight).length*7+10);
    marks+=`<g class="nd743-edge ${type}" data-edge="${u},${wNode}" data-weight="${weight}"><title>${u} → ${wNode} · ${weight}</title><path d="M${x1},${y1}Q${qx},${qy} ${x2},${y2}" marker-end="url(#nd743-arrow-${type})"/><rect x="${x-labelWidth/2}" y="${y-10}" width="${labelWidth}" height="20" rx="5"/><text x="${x}" y="${y+4}" text-anchor="middle">${weight}</text></g>`;
  }
  for(const id of ids) {
    const p=positions.get(id),distance=v.distances[id-1].value,current=!v.final&&v.currentNode===id;
    const css=['nd743-node',settled.has(id)?'settled':'',id===v.k?'source':'',current?'current':'',v.final&&distance==='∞'?'unreachable':'',last.has(id)?'last':'',v.changed.some(change=>change.node===id)?'updated':''].join(' ');
    marks+=`<g class="${css}" data-node="${id}" data-distance="${distance}" transform="translate(${p.x},${p.y})"><title>node ${id} · dist ${distance}${id===v.k?' · source k':''}</title>${id===v.k?`<circle class="source-ring" r="${r+4}"/>`:''}<circle r="${r}"/><text class="nd743-id" y="-4" text-anchor="middle">${id}</text><text class="nd743-time" y="14" text-anchor="middle">${String(distance).length>2?distance:'d'+distance}</text>${id===v.k?`<text class="nd743-k" y="${-r-10}" text-anchor="middle">k</text>`:''}</g>`;
  }
  return `<svg class="nd743-network-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Directed network. Source k=${v.k}. Arrow labels are travel times; d labels are best arrival times. ${v.final?'Network delay '+v.answer:''}">${marks}</svg>`;
}

function network743Heap(v,availableWidth) {
  const width=Math.max(220,availableWidth),entries=v.heap.slice(0,7),levels=entries.length>3?3:entries.length>1?2:1,height=levels*49+9;
  const position=i=>{const level=Math.floor(Math.log2(i+1));return{x:(i-2**level+1.5)*width/2**level,y:24+level*49};};
  let marks='';
  entries.forEach(([time,node],i)=>{
    const p=position(i),stale=time>v.distances[node-1].value;
    if(i){const parent=position((i-1)>>1);marks+=`<path class="nd743-heap-link" d="M${parent.x},${parent.y+17}L${p.x},${p.y-17}"/>`;}
    marks+=`<g class="nd743-heap-node ${i===0?'root':''} ${stale?'stale':''}" data-heap-index="${i}"><title>(${time},${node})${stale?' · stale':''}</title><rect x="${p.x-25}" y="${p.y-18}" width="50" height="36" rx="7"/><text class="time" x="${p.x}" y="${p.y-1}" text-anchor="middle">${time}${stale?' ×':''}</text><text x="${p.x}" y="${p.y+12}" text-anchor="middle">#${node}</text></g>`;
  });
  if(!entries.length)marks='<text x="10" y="30">∅</text>';
  return `<svg class="nd743-heap-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Actual min-heap tree, ${v.heapSize} entries. Each box shows time above node. Crossed entries are stale.">${marks}</svg>${v.heapSize>entries.length?`<small>+${v.heapSize-entries.length}</small>`:''}`;
}

function network743Timeline(v,availableWidth) {
  const width=Math.max(220,availableWidth),left=43,right=40,rows=v.n<=8?v.distances:v.nodes.map(id=>v.distances[id-1]);
  const finite=v.distances.filter(item=>item.value!=='∞'),max=Math.max(0,...finite.map(item=>item.value)),scale=value=>left+value/Math.max(1,max)*(width-left-right);
  const height=25+rows.length*28;
  let marks=`<text x="${left}" y="12" text-anchor="middle">0</text>${max?`<text x="${width-right}" y="12" text-anchor="middle">${max}</text>`:''}`;
  rows.forEach((item,i)=>{
    const y=30+i*28,known=item.value!=='∞',settled=v.settled.includes(item.node),last=v.slowest.includes(item.node),x=known?scale(item.value):width-right;
    marks+=`<g class="nd743-arrival ${settled?'settled':''} ${last?'last':''} ${v.final&&!known?'unreachable':''}" data-arrival-node="${item.node}"><text x="${left-12}" y="${y+4}" text-anchor="end">#${item.node}</text><path d="M${left},${y}H${x}"/>${known?`<circle cx="${x}" cy="${y}" r="4"/>`:''}<text x="${Math.min(width-9,x+11)}" y="${y+4}">${item.value}</text></g>`;
  });
  return `<svg class="nd743-timeline-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Arrival times. Dotted bars are tentative, solid bars are settled. ${v.final?'Final maximum '+v.answer:''}">${marks}</svg>`;
}

function renderNetwork743Pictures(step) {
  const v=step.network743View,host=$('treeView'),t=(vi,en)=>lang==='vi'?vi:en,esc=escapeHtml;
  const edge=v.activeEdge,stale=v.phase==='stale';
  let operation='';
  if(edge&&v.phase!=='build')operation=`<section class="nd743-calc"><header><b>${edge.u} → ${edge.v}</b><small>newTime</small></header><div><b>${v.locals.time}</b><span>+</span><b>${edge.w}</b><span>=</span><strong>${v.candidate??'?'}</strong></div>${v.improves!==null?`<footer>${v.candidate} &lt; ${v.oldDistance} <b class="${v.improves?'good':'bad'}">${v.improves?'✓':'×'}</b></footer>`:''}</section>`;
  else if(edge)operation=`<div class="nd743-link-preview"><b>${edge.u}</b><span>→ ${edge.w} →</span><b>${edge.v}</b></div>`;
  if(stale)operation=`<div class="nd743-stale bad">${v.locals.time} &gt; dist[${v.currentNode}] = ${v.distances[v.currentNode-1].value}<b>× ${t('bỏ bản ghi cũ','skip stale entry')}</b></div>`;
  const unreachable=v.answer===-1;
  if(v.final)operation=`<div class="nd743-answer ${unreachable?'no':'yes'}" data-answer="${v.answer}"><b>${v.answer}</b><span>${unreachable?`${v.unreachable.slice(0,8).map(id=>'#'+id).join(', ')}${v.unreachable.length>8?' …':''} · ∞ → −1`:t('tất cả nút đã nhận tín hiệu','all nodes received the signal')}</span>${unreachable?'':`<small>max dist = ${v.answer}</small>`}</div>`;
  const changed=v.changed.length&&!v.final?`<div class="nd743-change">${v.changed.map(item=>`<span>d[${item.node}]: <s>${item.before}</s> → <b>${item.after}</b></span>`).join('')}</div>`:'';
  const all=v.n>8?`<details class="nd743-all"><summary>dist · ${v.n} ${t('nút','nodes')}</summary><table><thead><tr><th>node</th><th>dist</th></tr></thead><tbody>${v.distances.map(item=>`<tr><td>#${item.node}</td><td>${item.value}</td></tr>`).join('')}</tbody></table></details>`:'';
  const presets=[{input:'2-1-1,2-3-1,3-4-1',n:4,k:2,label:t('Lan tín hiệu','Signal spread')},{input:'1-2-9,1-3-1,3-2-2',n:3,k:1,label:t('Tìm đường rẻ hơn','Improve a route')},{input:'1-2-1',n:3,k:1,label:t('Nút không tới được','Unreachable node')}];
  host.innerHTML=`<section class="nd743-viz"><header><b>743 · Dijkstra</b><span>${t('Sau dòng','After line')} ${v.source.line}</span></header><div class="nd743-presets">${presets.map((preset,i)=>`<button type="button" data-nd743-preset="${i}">${preset.label}</button>`).join('')}</div><code class="nd743-source">${esc(v.source.text.trim())}</code><div class="nd743-stage"><div class="nd743-network"><header><b>k = ${v.k}</b><small>${v.settled.length} / ${v.n} ${t('đã chốt','settled')}</small></header><div class="nd743-graph">${network743Graph(v,280)}</div><div class="nd743-legend"><span class="green">━ ${t('đường đã chốt','settled route')}</span><span class="orange">━ ${t('cạnh đang thử','active edge')}</span></div>${v.cropped?`<small>${v.nodes.length}/${v.n} ${t('nút','nodes')} · ${v.edges.length}/${v.edgeCount} ${t('cạnh · mạng rút gọn','edges · condensed network')}</small>`:''}</div><div class="nd743-state">${operation}${changed}<section><header><b>MIN-HEAP</b><small>(time, node) · ${v.heapSize}</small></header><div class="nd743-heap">${network743Heap(v,260)}</div></section><section><header><b>dist</b><small>${t('nét đứt: tạm tính','dotted: tentative')}</small></header><div class="nd743-timeline">${network743Timeline(v,260)}</div></section>${all}</div></div>${v.trace.truncated?`<small class="nd743-notice">${v.trace.omitted} ${t('sự kiện đã lược · đáp án tính đầy đủ','events omitted · complete answer computed')}</small>`:''}</section>`;
  host.network743Current=v;
  const redraw=()=>{
    for(const[selector,draw]of[['.nd743-graph',network743Graph],['.nd743-heap',network743Heap],['.nd743-timeline',network743Timeline]]) {const target=host.querySelector?.(selector);if(target)target.innerHTML=draw(host.network743Current,target.clientWidth||260);}
  };
  redraw();
  if(typeof ResizeObserver!=='undefined'&&!host.network743Observer) {
    host.network743Observer=new ResizeObserver(()=>{if(host.network743Width!==host.clientWidth){host.network743Width=host.clientWidth;redraw();}});host.network743Observer.observe(host);
  }
  host.querySelectorAll?.('[data-nd743-preset]').forEach(button=>{
    button.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter')event.stopPropagation();});
    button.addEventListener('click',()=>{const preset=presets[Number(button.dataset.nd743Preset)];$('arrInput').value=preset.input;for(const name of ['n','k'])document.querySelector(`[data-param="${name}"]`).value=String(preset[name]);runViz();});
  });
}
