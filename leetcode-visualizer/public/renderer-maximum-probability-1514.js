'use strict';

function probability1514Number(value) {
  return value===null||value===undefined?'—':String(Number(value.toPrecision(4)));
}
function probability1514Percent(value) {
  if(value===null||value===undefined)return '—';
  const percent=value*100,text=String(Number(percent.toPrecision(3)));
  return (text.length>6?percent.toExponential(1).replace('.0e','e'):text)+'%';
}

function probability1514Graph(v,availableWidth) {
  const width=Math.max(220,Math.min(420,availableWidth)),height=v.nodes.length<=2?190:Math.max(260,Math.min(350,width));
  const ids=[v.start,...v.nodes.filter(id=>id!==v.start)],r=25,cx=width/2,cy=height/2;
  const positions=new Map(ids.map((id,i)=>{const angle=Math.PI+i*2*Math.PI/ids.length;return[id,{x:cx+Math.cos(angle)*(width/2-36),y:cy+Math.sin(angle)*(height/2-49)}];}));
  const best=new Map(v.best.map(item=>[item.node,item.value])),settled=new Set(v.settled);
  const pathEdge=(a,b)=>v.pathEdges.some(([u,w])=>u===a&&w===b||u===b&&w===a);
  let marks='';
  for(const[a,b,p]of v.edges) {
    const from=positions.get(a),to=positions.get(b),dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy),x=(from.x+to.x)/2,y=(from.y+to.y)/2;
    const active=v.activeEdge&&(v.activeEdge.u===a&&v.activeEdge.v===b||v.activeEdge.u===b&&v.activeEdge.v===a);
    const label=probability1514Percent(p),labelWidth=Math.max(36,label.length*7+12),css=active?'active':pathEdge(a,b)?'route':'';
    marks+=`<g class="mp1514-edge ${css}" data-edge="${a},${b}"><title>${a} ↔ ${b} · p=${p}</title><path d="M${from.x+dx/length*r},${from.y+dy/length*r}L${to.x-dx/length*r},${to.y-dy/length*r}"/><rect x="${x-labelWidth/2}" y="${y-11}" width="${labelWidth}" height="22" rx="6"/><text x="${x}" y="${y+4}" text-anchor="middle">${label}</text></g>`;
  }
  for(const id of ids) {
    const p=positions.get(id),value=best.get(id),current=!v.final&&v.currentNode===id;
    const css=['mp1514-node',settled.has(id)?'settled':'',id===v.start?'source':'',id===v.end?'target':'',current?'current':'',v.path.includes(id)?'route':'',v.final&&id===v.end&&v.answer===0?'zero':'',v.changed.some(item=>item.node===id)?'updated':''].join(' ');
    const role=id===v.start?'S':id===v.end?'T':'';
    marks+=`<g class="${css}" data-node="${id}" data-best="${value}" transform="translate(${p.x},${p.y})"><title>node ${id} · best=${value??'not initialized'}${role?' · '+role:''}</title>${role?`<circle class="role-ring" r="${r+4}"/>`:''}<circle r="${r}"/><text class="mp1514-id" y="-5" text-anchor="middle">${id}</text><text class="mp1514-prob" y="15" text-anchor="middle">${probability1514Percent(value)}</text>${role?`<text class="mp1514-role" y="${-r-11}" text-anchor="middle">${role}</text>`:''}</g>`;
  }
  return `<svg class="mp1514-graph-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Undirected probability graph. S=${v.start}, T=${v.end}. Edge labels: success probability; node labels: best probability so far.">${marks}</svg>`;
}

function probability1514Heap(v,availableWidth) {
  const width=Math.max(220,availableWidth),entries=v.heap.slice(0,7),levels=entries.length>3?3:entries.length>1?2:1,height=levels*54+9;
  const position=i=>{const level=Math.floor(Math.log2(i+1));return{x:(i-2**level+1.5)*width/2**level,y:26+level*54};};
  let marks='';
  entries.forEach((entry,i)=>{
    const[negative,node]=entry.raw,p=position(i),stale=-negative<entry.best;
    if(i){const parent=position((i-1)>>1);marks+=`<path class="mp1514-heap-link" d="M${parent.x},${parent.y+19}L${p.x},${p.y-19}"/>`;}
    marks+=`<g class="mp1514-heap-node ${i===0?'root':''} ${stale?'stale':''}" data-heap-index="${i}" data-raw="${negative},${node}"><title>heap[${i}]=(${negative},${node}) · probability=${-negative}${stale?' · stale':''}</title><rect x="${p.x-26}" y="${p.y-20}" width="52" height="40" rx="7"/><text class="prob" x="${p.x}" y="${p.y-3}" text-anchor="middle">${probability1514Percent(-negative)}</text><text x="${p.x}" y="${p.y+12}" text-anchor="middle">#${node}${stale?' ×':''}</text></g>`;
  });
  if(!entries.length)marks='<text x="10" y="30">∅</text>';
  const root=entries[0];
  return `<svg class="mp1514-heap-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Actual Python heap tree, ${v.heapSize} entries. Largest probability at root; Python stores negative probabilities. Crossed entries are stale.">${marks}</svg>${root?`<div class="mp1514-raw">heap[0] = (${probability1514Number(root.raw[0])}, ${root.raw[1]})</div>`:''}${v.heapSize>entries.length?`<small>+${v.heapSize-entries.length} ${lang==='vi'?'bản ghi':'entries'}</small>`:''}`;
}

function probability1514Bars(v,availableWidth) {
  const width=Math.max(220,availableWidth),left=43,right=65,scale=p=>left+p*(width-left-right),height=25+v.best.length*29;
  let marks=`<text x="${left}" y="12">0%</text><text x="${width-right}" y="12" text-anchor="end">100%</text>`;
  v.best.forEach((item,i)=>{
    const y=32+i*29,x=scale(item.value??0),settled=v.settled.includes(item.node),route=v.path.includes(item.node);
    marks+=`<g class="mp1514-bar ${settled?'settled':''} ${route?'route':''}" data-bar-node="${item.node}"><text x="${left-12}" y="${y+4}" text-anchor="end">#${item.node}</text><path class="track" d="M${left},${y}H${width-right}"/><path class="value" d="M${left},${y}H${x}"/><circle cx="${x}" cy="${y}" r="3"/><text x="${width-right+9}" y="${y+4}">${probability1514Percent(item.value)}</text></g>`;
  });
  return `<svg class="mp1514-bars-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Best probabilities from 0 to 100 percent. Dotted bars are tentative; solid bars are settled.">${marks}</svg>`;
}

function probability1514Route(v) {
  const t=(vi,en)=>lang==='vi'?vi:en;
  if(!v.answer)return `<div class="mp1514-zero">S #${v.start} <span>⋯ × ⋯</span> T #${v.end}</div><small>${t('Không có đường xác suất > 0','No positive-probability route')}</small>`;
  const edges=new Map(v.pathEdges.map(([a,b,p])=>[[Math.min(a,b),Math.max(a,b)].join(','),p]));
  let cumulative=1;
  const path=v.path.slice(0,12).map((node,i)=>{
    const p=i?edges.get([Math.min(node,v.path[i-1]),Math.max(node,v.path[i-1])].join(',')):null;
    if(i)cumulative*=p;
    return `${i?`<span class="mp1514-route-edge">× ${probability1514Number(p)}<span>→</span></span>`:''}<span class="mp1514-route-node"><b>#${node}</b><small>${probability1514Percent(cumulative)}</small></span>`;
  }).join('');
  return `<div class="mp1514-route-strip" aria-label="Winning path with cumulative success probabilities">${path}${v.path.length>12?`<span>… #${v.end}</span>`:''}</div>`;
}

function renderProbability1514Pictures(step) {
  const v=step.probability1514View,host=$('treeView'),t=(vi,en)=>lang==='vi'?vi:en,esc=escapeHtml,number=probability1514Number;
  const edge=v.activeEdge;
  let operation='';
  if(edge&&v.phase!=='build')operation=`<section class="mp1514-calc"><header><b>#${edge.u} → #${edge.v}</b><small>new_prob</small></header><div><b>${number(v.locals.prob)}</b><span>×</span><b>${number(edge.p)}</b><span>=</span><strong>${v.candidate===null?'?':number(v.candidate)}</strong></div>${v.improves!==null?`<footer>${number(v.candidate)} &gt; ${number(v.oldBest)} <b class="${v.improves?'good':'bad'}">${v.improves?'✓':'×'}</b></footer>`:''}</section>`;
  else if(edge)operation=`<div class="mp1514-link-preview"><b>#${edge.u}</b><span>↔ ${probability1514Percent(edge.p)} ↔</span><b>#${edge.v}</b></div>`;
  else if(v.phase==='init')operation=`<div class="mp1514-link-preview"><b>S #${v.start}</b><span>→</span><b>${v.best.find(item=>item.node===v.start)?.value===1?'100%':'0%'}</b></div>`;
  if(v.phase==='stale')operation=`<div class="mp1514-stale bad">${number(v.locals.prob)} &lt; best[${v.currentNode}] = ${number(v.locals['best[u]'])}<b>× ${t('bỏ bản ghi cũ','skip stale entry')}</b></div>`;
  if(v.final)operation=`<section class="mp1514-answer ${v.answer?'yes':'no'}" data-answer="${v.answer}"><header><b>${t('Kết quả','Result')}</b><small>${number(v.answer)}</small></header><strong>${probability1514Percent(v.answer)}</strong>${probability1514Route(v)}</section>`;
  const changed=v.changed.length&&!v.final?`<div class="mp1514-change">${v.changed.map(item=>`<span>best[${item.node}]: <s>${probability1514Percent(item.before)}</s> → <b>${probability1514Percent(item.after)}</b></span>`).join('')}</div>`:'';
  const presets=[{input:'0-1-0.5,1-2-0.5,0-2-0.2',n:3,start_node:0,end_node:2,label:t('Qua trạm: 25%','Via node: 25%')},{input:'0-1-0.5,1-2-0.5,0-2-0.3',n:3,start_node:0,end_node:2,label:t('Đi thẳng: 30%','Direct: 30%')},{input:'0-1-0.5',n:3,start_node:0,end_node:2,label:t('Không tới đích','Unreachable')}];
  host.innerHTML=`<section class="mp1514-viz"><header><b>1514 · Max probability</b><span>${t('Sau dòng','After line')} ${v.source.line}</span></header><div class="mp1514-presets">${presets.map((preset,i)=>`<button type="button" data-mp1514-preset="${i}">${preset.label}</button>`).join('')}</div><code class="mp1514-source">${esc(v.source.text.trim())}</code><div class="mp1514-stage"><div class="mp1514-network"><header><b>S #${v.start} → T #${v.end}</b><small>${t('cạnh hai chiều','undirected edges')}</small></header><div class="mp1514-graph">${probability1514Graph(v,280)}</div><div class="mp1514-legend"><span class="green">━ ${t('đường kết quả','winning route')}</span><span class="orange">━ ${t('cạnh đang thử','active edge')}</span></div>${v.cropped?`<small>${v.nodes.length}/${v.n} ${t('nút','nodes')} · ${v.edges.length}/${v.edgeCount} ${t('cạnh · hình rút gọn','edges · condensed graph')}</small>`:''}</div><div class="mp1514-state">${operation}${changed}<section><header><b>MAX-HEAP</b><small>(−prob, node) · ${v.heapSize}</small></header><div class="mp1514-heap">${probability1514Heap(v,260)}</div></section><section><header><b>best</b><small>${t('nét đứt: tạm tính','dotted: tentative')}</small></header><div class="mp1514-bars">${probability1514Bars(v,260)}</div></section></div></div><small>${t('Số hiển thị làm tròn · hover để xem giá trị gốc','Display rounded · hover for original values')}</small>${v.trace.truncated?`<small class="mp1514-notice">${v.trace.omitted} ${t('sự kiện đã lược · đáp án tính đầy đủ','events omitted · complete answer computed')}</small>`:''}</section>`;
  host.probability1514Current=v;
  const redraw=()=>{
    for(const[selector,draw]of[['.mp1514-graph',probability1514Graph],['.mp1514-heap',probability1514Heap],['.mp1514-bars',probability1514Bars]]) {const target=host.querySelector?.(selector);if(target)target.innerHTML=draw(host.probability1514Current,target.clientWidth||260);}
  };
  redraw();
  if(typeof ResizeObserver!=='undefined'&&!host.probability1514Observer) {
    host.probability1514Observer=new ResizeObserver(()=>{if(host.probability1514Width!==host.clientWidth){host.probability1514Width=host.clientWidth;redraw();}});host.probability1514Observer.observe(host);
  }
  host.querySelectorAll?.('[data-mp1514-preset]').forEach(button=>{
    button.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter')event.stopPropagation();});
    button.addEventListener('click',()=>{const preset=presets[Number(button.dataset.mp1514Preset)];$('arrInput').value=preset.input;for(const name of ['n','start_node','end_node'])document.querySelector(`[data-param="${name}"]`).value=String(preset[name]);runViz();});
  });
}
