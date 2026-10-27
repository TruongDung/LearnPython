function square9013PictureModel(step) {
  const view=step.square9013View;
  let pair=null;
  const liveTry=(['candidate-loop','child-result','child-check'].includes(view.operation)||view.operation==='return-true'&&view.reason==='child-success')&&view.condition?.result!==false;
  if(view.probe)pair=[view.probe.a,view.probe.b];
  else if(liveTry&&Number.isInteger(view.focus)&&Number.isInteger(view.attempted))pair=[view.focus,view.attempted];
  else if(view.operation==='path-pop'&&view.path.length)pair=[view.path.at(-1),view.focus];
  else if(view.path.length>1)pair=view.path.slice(-2);
  else if(view.operation==='build-candidates'&&view.candidates.length)pair=[view.focus,view.candidates[0]];
  if(pair&&!pair.every(Number.isInteger))pair=null;
  return {view,pair,root:pair?Math.ceil(Math.sqrt(pair[0]+pair[1])):null,isSquare:pair?Number.isInteger(Math.sqrt(pair[0]+pair[1])):null,distinct:pair?pair[0]!==pair[1]:null};
}

function renderSquareArrangement9013View(step) {
  const host=$('treeView');
  if(!step.square9013View||!host)return;
  const {view:v,pair,root,isSquare,distinct}=square9013PictureModel(step),t=(vi,en)=>lang==='vi'?vi:en;
  const width=Math.max(220,(host.clientWidth||550)-24),n=v.n,path=v.path,used=v.used;
  const columns=Math.max(3,Math.min(6,Math.floor((width-16)/68))),stride=(width-48)/(columns-1);
  const point=index=>{const row=Math.floor(index/columns),col=row%2?columns-1-index%columns:index%columns;return {x:24+col*stride,y:34+row*78};};
  const ghost=v.operation==='path-pop'?v.focus:null;
  const positions=path.map((_,i)=>point(i));
  const count=path.length+(ghost!==null?1:0),height=Math.max(76,Math.ceil(count/columns)*78);
  const links=path.slice(1).map((value,i)=>{
    const a=positions[i],b=positions[i+1],sum=path[i]+value,r=Math.sqrt(sum);
    const vertical=a.x===b.x;
    const active=pair&&pair.includes(path[i])&&pair.includes(value);
    return `<g class="sq9013-link ${active?'current':''}"><path d="M${a.x},${a.y}L${b.x},${b.y}"/><text x="${vertical?a.x+(a.x>width/2?-28:28):(a.x+b.x)/2}" y="${vertical?(a.y+b.y)/2+4:a.y-16}" text-anchor="middle">${vertical?r+'²':sum+'='+r+'²'}</text></g>`;
  }).join('');
  const nodes=path.map((value,i)=>{
    const p=positions[i],pending=!used?.includes(value),current=v.phase!=='done'&&value===v.focus;
    return `<g class="sq9013-chain-node ${pending?'pending':'used'} ${current?'current':''}" data-value="${value}"><circle cx="${p.x}" cy="${p.y}" r="18"/><text x="${p.x}" y="${p.y+6}" text-anchor="middle">${value}</text></g>`;
  }).join('');
  const g=ghost!==null?point(path.length):null;
  const removed=g?`<g class="sq9013-ghost"><circle cx="${g.x}" cy="${g.y}" r="18"/><text x="${g.x}" y="${g.y+6}" text-anchor="middle">${ghost}</text><path d="M${g.x-15},${g.y-15}L${g.x+15},${g.y+15}"/></g>`:'';
  const chain=`<section class="sq9013-chain"><header><span>path</span><b>${path.length}/${n}</b></header><svg class="sq9013-scene" viewBox="0 0 ${width} ${height}" role="img" aria-label="path: ${path.join(' → ')||'[]'}">${links}${nodes}${removed}${!count?`<text class="sq9013-empty-text" x="${width/2}" y="43" text-anchor="middle">${v.pathReady?'[]':'—'}</text>`:''}</svg></section>`;
  const proof=pair?`<section class="sq9013-proof" aria-label="${pair[0]} + ${pair[1]} = ${pair[0]+pair[1]} ${isSquare?'=':'≠'} ${root}²${!distinct?', a = b ×':''}"><div class="sq9013-equation"><b class="one">${pair[0]}</b><span>+</span><b class="two">${pair[1]}</b><span>=</span><strong>${pair[0]+pair[1]}</strong></div><div class="sq9013-square ${isSquare&&distinct?'valid':'invalid'}"><div style="--sq-side:${root}">${Array.from({length:root*root},(_,i)=>`<i class="${i>=pair[0]+pair[1]?'empty':i<pair[0]?'one':'two'}"></i>`).join('')}</div><small>${!distinct?'a = b ×':isSquare?`${root} × ${root} ✓`:`≠ ${root}² ×`}</small></div></section>`:'';
  const pool=used===null?'<span class="sq9013-muted">—</span>':v.nodes.map(node=>`<span class="sq9013-value ${used.includes(node.value)?'used':'free'} ${node.value===v.focus?'current':''}" data-pool-value="${node.value}" aria-label="${node.value}: ${used.includes(node.value)?'used':'free'}"><b>${node.value}</b><small>${used.includes(node.value)?'✓':'·'}</small></span>`).join('');
  const candidates=v.candidates.map(value=>`<span class="sq9013-candidate ${used?.includes(value)?'used':''} ${v.tried?.includes(value)?'tried':''} ${v.attempted===value?'current':''}"><b>${value}</b>${v.tried?.includes(value)?'<small>×</small>':''}</span>`).join('');
  const stack=v.stack.slice(-4).map(frame=>`<span>${frame.value}</span>`).join('<small>→</small>');
  const titles={
    'define-is-square':t('a + b = □²','a + b = □²'),'build-values':t('Các số cần xếp','Numbers to arrange'),
    'build-graph':t('Nối các cặp hợp lệ','Connect valid pairs'),'path-init':'path = []','used-init':'used = set()',
    'graph-row':t('Chọn số a','Select a'),'graph-row-init':'graph[a] = []','graph-pair':t('Thử cặp a + b','Try a + b'),
    'graph-check':t('Có nối được không?','Can they connect?'),'graph-add':t('Nối cạnh mới ✓','Connect a new edge ✓'),
    'define-dfs':t('Bắt đầu tìm chuỗi','Prepare DFS'),'sort-starts':t('Điểm ít cạnh trước','Lower-degree starts first'),
    'start-loop':t('Thử điểm bắt đầu','Try a start'),'path-append':`path.append(${v.focus})`,
    'mark-used':`used.add(${v.focus})`,'complete-check':t('Đủ n số?','All n numbers?'),
    'build-candidates':t('Số có thể đi tiếp','Available neighbors'),'candidate-loop':v.condition?.result===false?t('Hết lựa chọn ↶','No choices left ↶'):t('Thử nối tiếp','Try the next link'),
    'child-result':`child_ok = ${v.locals.child_ok?'True':'False'}`,'child-check':t('Nhánh con thành công?','Child succeeded?'),
    'unmark-used':`used.remove(${v.focus})`,'path-pop':`path.pop() ↶ ${v.focus}`,
    'return-true':'return True ✓','return-false':'return False ↶','dfs-result':`found = ${v.locals.found?'True':'False'}`,
    'found-check':t('Tìm được chuỗi?','Found a path?'),'return-path':t('Chuỗi hợp lệ ✓','Valid arrangement ✓'),
    'return-empty':t('Không có cách xếp','No arrangement'),
  };
  // An optional complete graph keeps the main step focused on the current chain.
  const graphColumns=Math.max(1,Math.min(5,Math.floor(width/56))),graphStride=width/graphColumns;
  const graphPoint=i=>({x:graphStride*(i%graphColumns+.5),y:Math.floor(i/graphColumns)*58+26});
  const graphPoints=new Map(v.nodes.map((node,i)=>[node.value,graphPoint(i)]));
  const graphSVG=`<svg class="sq9013-scene" viewBox="0 0 ${width} ${Math.max(58,Math.ceil(v.nodes.length/graphColumns)*58)}" role="img" aria-label="${t('Đồ thị tổng chính phương','Square-sum graph')}">${v.edges.map(edge=>{const a=graphPoints.get(edge.u),b=graphPoints.get(edge.v);const corridor=a.x+(a.x+graphStride/2<width?graphStride/2:-graphStride/2);const route=a.y===b.y?`M${a.x},${a.y} C${a.x},${a.y+40} ${b.x},${b.y+40} ${b.x},${b.y}`:`M${a.x},${a.y} V${a.y+28} H${corridor} V${b.y-28} H${b.x} V${b.y}`;return `<path class="sq9013-net-edge ${edge.inPath?'in-path':''} ${edge.current?'current':''}" d="${route}"/>`;}).join('')}${v.nodes.map(node=>{const p=graphPoints.get(node.value);return `<g class="sq9013-net-node ${path.includes(node.value)?'in-path':''} ${v.focus===node.value?'focus':''} ${v.probe?.a===node.value?'probe-one':''} ${v.probe?.b===node.value?'probe-two':''}"><circle cx="${p.x}" cy="${p.y}" r="16"/><text x="${p.x}" y="${p.y+5}" text-anchor="middle">${node.value}</text></g>`;}).join('')}</svg>`;
  const graph=`<details class="sq9013-graph"><summary>${t('Đồ thị','Graph')} · ${v.nodes.length} / ${v.edges.length}</summary>${graphSVG}</details>`;
  const building=v.phase==='graph';
  host.innerHTML=`<section class="sq9013-viz"><header><strong>${titles[v.operation]??v.operation}</strong><span>${t('Dòng','Line')} ${v.source.line} · ${v.source.scope}</span></header>${v.condition?`<div class="sq9013-condition ${v.condition.result?'yes':'no'}"><code>${v.condition.expression}</code><b>${v.condition.result?'True ✓':'False ×'}</b></div>`:''}${building?`${graphSVG}<button class="sq9013-skip" type="button" data-sq9013-skip>${t('Tới DFS →','Jump to DFS →')}</button>`:v.phase==='done'&&!v.solution?`<div class="sq9013-no-solution">[] <span>×</span></div>`:chain}${proof}${v.phase!=='done'&&!building?`<section class="sq9013-pool"><header><span>used</span><b>${used?.length??'—'}/${n}</b></header><div>${pool}</div></section>${'candidates' in v.locals||v.source.scope==='arrange'&&'starts' in v.locals?`<section class="sq9013-candidates"><header><span>${v.source.scope==='dfs'?'candidates':'starts'}</span><b>${v.candidates.length? '':'∅ ↶'}</b></header><div>${candidates}</div></section>`:''}${stack?`<div class="sq9013-stack"><small>DFS</small>${v.stack.length>4?'<small>…</small>':''}${stack}</div>`:''}`:''}${!building?graph:''}</section>`;
  host.querySelector?.('[data-sq9013-skip]')?.addEventListener('click',()=>{
    const next=steps.findIndex(item=>item.square9013View?.operation==='sort-starts');
    if(next>=0){stopPlay();stepIndex=next;renderStep();}
  });
  host._sq9013Step=step;host._sq9013Width=host.clientWidth;
  if(typeof ResizeObserver!=='undefined'&&!host._sq9013Observer){
    host._sq9013Observer=new ResizeObserver(()=>{if(host.querySelector('.sq9013-viz')&&host.clientWidth!==host._sq9013Width)renderSquareArrangement9013View(host._sq9013Step);});
    host._sq9013Observer.observe(host);
  }
}
