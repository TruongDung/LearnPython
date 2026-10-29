'use strict';
const td1245Text=(vi,en)=>lang==='vi'?vi:en;
const td1245Value=value=>value===null||value===undefined?'—':String(value);
const td1245Edge=(a,b)=>[Math.min(a,b),Math.max(a,b)].join(',');

function td1245Layout(view) {
  const adj=Array.from({length:view.n},()=>[]);
  view.edges.forEach(([a,b])=>{adj[a].push(b);adj[b].push(a);});
  const points=[],depths=[];let leaf=0;
  function place(node,parent,depth) {
    depths[node]=depth;
    const children=adj[node].filter(id=>id!==parent),xs=children.map(id=>place(id,node,depth+1));
    const x=xs.length?(xs[0]+xs.at(-1))/2:leaf++*76;
    points[node]=[x,48+depth*84];return x;
  }
  place(0,-1,0);
  const min=Math.min(...points.map(p=>p[0])),max=Math.max(...points.map(p=>p[0]));
  const centeredWidth=Math.max(230,max-min+112);
  points.forEach(point=>point[0]+=(centeredWidth-(max-min))/2-min);
  return {points,width:Math.max(230,max-min+112),height:Math.max(180,Math.max(...points.map(p=>p[1]))+64)};
}

function td1245Tree(view) {
  const layout=td1245Layout(view),{points,width,height}=layout,pass=view.passes.at(-1);
  const visited=new Set(pass?.visited??[]),settled=new Set(pass?.settled??[]),queued=new Set((pass?.queue??[]).map(item=>item[0]));
  const path=view.finalPath.length?view.finalPath:pass?.bestPath??[],pathEdges=new Set(path.slice(1).map((node,index)=>td1245Edge(path[index],node)));
  const edges=view.edges.map(([a,b])=>{
    const built=(view.graph[a]?.includes(b)?1:0)+(view.graph[b]?.includes(a)?1:0),selected=td1245Edge(a,b)===td1245Edge(view.active,view.neighbor)&&view.active!==null&&view.neighbor!==null;
    const changed=view.event==='arc'&&td1245Edge(a,b)===td1245Edge(view.change.from,view.change.to),onPath=pathEdges.has(td1245Edge(a,b));
    return `<path class="td1245-edge ${built===2?'built':built===1?'half':'ghost'} ${selected||changed?'selected':''} ${onPath?'path':''} ${onPath&&view.finalPath.length?'proved':''}" data-edge="${a},${b}" data-built="${built}" d="M${points[a]} L${points[b]}"/>`;
  }).join('');
  const nodes=points.map(([x,y],id)=>{
    const distance=pass?.distances[id]??null,far=pass?.farNode===id,current=view.active===id,neighbor=view.neighbor===id;
    const tone=['#93baf3','#bda1ed','#8ad3b7','#e9c487','#dfa0bd','#8cced7'][(distance??0)%6];
    return `<g class="td1245-node ${visited.has(id)?'visited':''} ${settled.has(id)?'settled':''} ${queued.has(id)?'queued':''} ${current?'current':''} ${neighbor?'neighbor':''} ${far?'far':''} ${view.finalPath.includes(id)?'proved':''}" data-node="${id}" data-distance="${distance??''}" data-visited="${visited.has(id)}" data-settled="${settled.has(id)}" transform="translate(${x},${y})" style="--td1245-tone:${tone}"><title>node ${id} · d=${td1245Value(distance)}</title>${far?'<circle class="far-ring" r="26"/>':''}<circle class="body" r="18"/><text class="id" y="5">${id}</text><rect class="distance-bg" x="-19" y="24" width="38" height="15" rx="4"/><text class="distance" y="35">d=${td1245Value(distance)}</text>${queued.has(id)?'<circle class="queue-dot" cx="15" cy="-15" r="4"/>':''}${settled.has(id)?'<text class="pop-check" x="-23" y="-18">✓</text>':''}${id===view.a?'<g class="endpoint"><circle cx="24" cy="-23" r="10"/><text x="24" y="-19">A</text></g>':''}${id===view.b?'<g class="endpoint"><circle cx="-24" cy="-23" r="10"/><text x="-24" y="-19">B</text></g>':''}</g>`;
  }).join('');
  const large=width>560||height>390;
  return `<div class="td1245-tree-scroll" data-large="${large}"><svg class="td1245-tree" viewBox="0 0 ${width} ${height}" ${large?`style="width:${width}px;min-width:100%;height:${height}px;max-height:none"`:''} role="img" aria-label="${td1245Text('Cây và khoảng cách BFS','Tree and BFS distances')}">${edges}${nodes}</svg></div>`;
}

function td1245Chain(view) {
  const pass=view.passes.at(-1),path=view.finalPath.length?view.finalPath:pass?.bestPath??[];
  return `<div class="td1245-chain ${view.finalPath.length?'proved':''}">${path.length?path.map((node,index)=>`${index?'<span class="link"><small>+1</small><i>━</i></span>':''}<b data-path-node="${node}">${node}</b>`).join(''):'—'}</div>`;
}

function renderDiameter1245Pictures(step) {
  const view=step.diameter1245View;if(!view)return;
  const pass=view.passes.at(-1);
  const labels={arc:['Thêm cạnh kề','Append an adjacency'],start:['Bắt đầu BFS','Start BFS'],'enqueue-start':['Đưa start vào queue','Enqueue start'],'seed-farthest':['Mốc xa nhất ban đầu','Initial farthest'],pop:['Lấy đầu queue','Pop the queue'],neighbor:['Xét hàng xóm','Check a neighbor'],visit:['Đánh dấu visited','Mark visited'],enqueue:['Thêm vào queue','Enqueue'],farthest:['Cập nhật xa nhất','Update farthest'],'bfs-return':['BFS trả về','BFS returns'],'endpoint-a':['Chốt A','Set A'],'endpoint-b':['Chốt B và diameter','Set B and diameter'],return:['Kết quả','Result'],'distance-check':['dist > far_dist ?','dist > far_dist ?'],'visited-check':['nei ∉ visited ?','nei ∉ visited ?'],'queue-check':['queue ?','queue ?'],'empty-check':['edges ?','edges ?'],graph:['Tạo graph','Build graph'],edge:['Duyệt cạnh','Scan edges'],step:['Thực thi','Execute']};
  const label=labels[view.event]??labels.step;
  const action=view.event==='farthest'?`<strong>${td1245Value(view.locals.far_dist)}</strong>`:view.branch!==null?`<strong class="${view.branch?'yes':'no'}">${view.branch?'✓':'×'}</strong>`:view.event==='pop'?'<strong>↥</strong>':view.event==='enqueue'?'<strong>+</strong>':view.returning?'<strong>↩</strong>':'<strong>→</strong>';
  $('treeView').innerHTML=`<div class="td1245-viz" data-phase="${view.phase}" data-event="${view.event}">
    <header class="td1245-heading"><code>#1245 · BFS × 2</code><b>L${view.source.line} ✓</b><small>${view.scope} · ${td1245Text('sau dòng','after line')}</small></header>
    <div class="td1245-phases">${[0,1].map(index=>{const p=view.passes[index];return `<section class="${view.phase===index+1&&!view.done?'active':''} ${p?.complete?'complete':''}"><header><code>BFS ${index+1}</code><span>${p?.complete?'✓':p?'●':'○'}</span></header><div><b>${index===0?'0':td1245Value(view.a)}</b><i>→</i><b>${td1245Value(index===0?view.a:view.b)}</b></div><small>${index===0?'0 → A':'A → B'} · ${td1245Value(p?.farDist)} ${td1245Text('cạnh','edges')}</small></section>`;}).join('')}</div>
    <section class="td1245-action">${action}<b>${td1245Text(...label)}</b><nav><button id="td1245NextPop" title="${td1245Text('Đến lần pop kế tiếp','Next pop')}">↥ ↪</button><button id="td1245NextFar" title="${td1245Text('Đến lần cập nhật xa nhất kế tiếp','Next farthest update')}">max ↪</button><button id="td1245NextPass" title="${td1245Text('Đến lần BFS trả về kế tiếp','Next BFS return')}">A/B ↪</button></nav></section>
    <div class="td1245-metrics"><section><small>far_node</small><strong>${td1245Value(pass?.farNode)}</strong></section><section><small>far_dist</small><strong data-counter="far_dist">${td1245Value(pass?.farDist)}</strong></section><section><small>diameter</small><strong data-counter="diameter">${td1245Value(view.diameter)}</strong></section></div>
    <section class="td1245-card"><header><code>${td1245Text('Cây · d = số cạnh từ start','Tree · d = edges from start')}</code><span>${view.n} nodes · start ${td1245Value(pass?.start)}</span></header>${td1245Tree(view)}<div class="td1245-legend"><span>◎ ${td1245Text('đang xét','current')}</span><span>● queue</span><span>✓ pop</span><span class="far">◯ far_node</span><span class="proved">━ A–B</span></div></section>
    <div class="td1245-bottom"><section class="td1245-card"><header><code>queue · (node, dist)</code><span>${pass?.queue===null||!pass?'—':pass.queue.length}</span></header><div class="td1245-queue">${!pass||pass.queue===null?'—':pass.queue.length?pass.queue.map(([node,distance],index)=>`<span class="${index===0?'front':''}" data-queue-node="${node}" data-queue-distance="${distance}"><small>${index===0?'FRONT':'·'}</small><b>(${node}, ${distance})</b></span>`).join(''):'∅'}</div><div class="td1245-visited"><code>visited</code>${pass?(pass.visited.length?pass.visited.map(id=>`<span>${id}</span>`).join(''):'∅'):'—'}</div></section>
    <section class="td1245-card"><header><code>${view.finalPath.length?'A ━ B':td1245Text('Đường xa nhất hiện tại','Current farthest path')}</code><span>${td1245Value(view.finalPath.length?view.diameter:pass?.farDist)} ${td1245Text('cạnh','edges')}</span></header>${td1245Chain(view)}</section></div>
    <details class="td1245-card td1245-adj" ${view.phase===0?'open':''}><summary>graph · ${view.graph.reduce((sum,row)=>sum+row.length,0)} ${td1245Text('cung đã dựng','built arcs')}</summary><div>${view.graph.map((row,id)=>`<span class="${id===view.active?'current':''}"><b>${id}</b><i>→</i><code>[${row.join(', ')}]</code></span>`).join('')}</div></details>
    ${view.done?`<div class="td1245-answer"><small>return</small><strong data-result="true">${view.answer}</strong><span>${td1245Text('cạnh','edges')}</span></div>`:''}
  </div>`;
  const scroller=$('treeView').querySelector('.td1245-tree-scroll');
  if(scroller?.dataset?.large==='true') {
    const layout=td1245Layout(view),focus=view.active??pass?.farNode??pass?.start??0,point=layout.points[focus];
    scroller.scrollTop=Math.max(0,point[1]-scroller.clientHeight/2);
    scroller.scrollLeft=Math.max(0,point[0]-scroller.clientWidth/2);
  }
  function jump(kind) {
    if(typeof steps==='undefined'||typeof stepIndex==='undefined')return;stopPlay();
    const events=kind==='pop'?['pop']:kind==='far'?['farthest']:['bfs-return','endpoint-a','endpoint-b'];
    const next=steps.findIndex((item,index)=>index>stepIndex&&item.diameter1245View&&(events.includes(item.diameter1245View.event)||item.final));
    stepIndex=next<0?steps.length-1:next;renderStep();
  }
  for(const [id,kind]of [['td1245NextPop','pop'],['td1245NextFar','far'],['td1245NextPass','pass']])$('treeView').querySelector('#'+id)?.addEventListener('click',()=>jump(kind));
}
