function renderCoins2603Pictures(step){
 const host=$('treeView'),v=step.coins2603View;if(!host||!v)return;
 const t=(vi,en)=>lang==='vi'?vi:en,final=Boolean(step.final),treeKey=JSON.stringify([v.coins,v.edges]),key=JSON.stringify([v.coins,v.edges,v.frame]),same=host.dataset?.coins2603Frame===key;
 const oldPosition=Number(host.dataset?.coins2603RenderedPosition||0),position=final&&same?Math.max(0,Math.min(Number(host.dataset.coins2603Position||0),v.analysis.walk.length-1)):0;
 const resetScroll=host.dataset?.coins2603ResetScroll==='1',sameTree=host.dataset?.coins2603TreeKey===treeKey;
 const oldScroll=sameTree&&!resetScroll?host.querySelector?.('.c2603-graph-wrap')?.scrollLeft||0:0;
 if(host.dataset){host.dataset.coins2603Frame=key;host.dataset.coins2603TreeKey=treeKey;host.dataset.coins2603Position=String(position);host.dataset.coins2603RenderedPosition=String(position);host.dataset.coins2603ResetScroll='0';}
 const collected=new Set(),walk=v.analysis?.walk??[],here=final?walk[position]:null;
 if(final)for(const u of walk.slice(0,position+1))v.coins.forEach((coin,w)=>{if(coin&&v.analysis.distances[u][w]<=2)collected.add(w);});
 const within=final?v.analysis.distances[here].map(d=>d<=2):Array(v.n).fill(false),coinNodes=v.coins.flatMap((coin,u)=>coin?[u]:[]);
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tile=(u,cls='',label='')=>`<span class="c2603-tile ${cls}"><b>${esc(u)}</b>${label?`<small>${esc(label)}</small>`:''}</span>`;
 const row=(nodes,cls='')=>`<div class="c2603-row">${nodes.map(u=>tile(u,cls)).join('')||'<span class="c2603-empty">∅</span>'}</div>`;
 const card=(label,html,cls='')=>`<section class="c2603-card ${cls}"><header>${label}</header>${html}</section>`;
 const phase=v.phase==='build'?-1:v.phase==='empty'?0:v.phase==='layers'?1:2;
 const phaseNames=[['✂',t('Lá không coin','Coinless leaves')],['②',t('Đúng 2 lớp lá','Exactly 2 layers')],['↔',t('Đi và về','Out and back')]];
 const phases=`<div class="c2603-phases">${phaseNames.map(([icon,label],i)=>`<span class="${phase===i?'active':phase>i?'core':''}"><b>${icon}</b><small>${label}</small></span>`).join('')}</div>`;
 const title=final?`✓ ${v.remaining*2} ${t('bước tối thiểu','minimum moves')}`:v.phase==='empty'?'✂ '+t('Bỏ nhánh không cần đi','Prune unnecessary branches'):v.phase==='layers'?`② ${t('Lớp','Layer')} ${v.round??'—'} / 2`:v.phase==='count'?t('Phần cây cần đi qua','The tree to traverse'):t('Cây và các coin','Tree and coins');

 function graph(){
  const g=Array.from({length:v.n},()=>[]);v.edges.forEach(([u,w])=>{g[u].push(w);g[w].push(u);});
  const path=g.every(neighbors=>neighbors.length<=2),pos=[];let width,height;
  if(path){const order=[],start=g.findIndex(neighbors=>neighbors.length<=1);let u=start,parent=-1;while(u!==undefined){order.push(u);const next=g[u].find(w=>w!==parent);parent=u;u=next;}width=Math.max(300,60+78*(v.n-1));height=175;order.forEach((u,i)=>pos[u]={x:v.n===1?width/2:30+i*(width-60)/Math.max(1,v.n-1),y:85});}
  else{
   const distances=Array.from({length:v.n},(_,start)=>{const d=Array(v.n).fill(-1),q=[start];d[start]=0;for(let h=0;h<q.length;h++)for(const w of g[q[h]])if(d[w]<0){d[w]=d[q[h]]+1;q.push(w);}return d;});
   let root=0;for(let u=1;u<v.n;u++)if(Math.max(...distances[u])<Math.max(...distances[root]))root=u;
   const levels=[];distances[root].forEach((d,u)=>(levels[d]??=[]).push(u));width=Math.max(330,Math.max(...levels.map(a=>a.length))*72+50);height=levels.length*100+35;
   levels.forEach((nodes,depth)=>nodes.forEach((u,i)=>pos[u]={x:(i+1)*width/(nodes.length+1),y:55+depth*100}));
  }
  const available=(host.clientWidth||560)-48,minWidth=v.n<=4?0:Math.min(width,Math.max(300,path?v.n*56:Math.max(...g.map(a=>a.length))*48));
  let svg='<defs><marker id="c2603-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10Z" style="fill:context-stroke;stroke:none"/></marker></defs>';
  const edge=(u,w,cls,arrow=false)=>{const p=pos[u],q=pos[w],dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy)||1;return `<path class="c2603-edge ${cls}" d="M${p.x+dx/len*20},${p.y+dy/len*20} L${q.x-dx/len*23},${q.y-dy/len*23}" ${arrow?'marker-end="url(#c2603-arrow)"':''}/>`;};
  v.edges.forEach(([u,w])=>{
   if(final&&within[u]&&within[w])svg+=edge(u,w,'range');
   const cut=v.removed[u]||v.removed[w],active=!final&&v.activeEdge&&((v.activeEdge[0]===u&&v.activeEdge[1]===w)||(v.activeEdge[0]===w&&v.activeEdge[1]===u));
   svg+=edge(u,w,active?'active':cut?'cut':'core');
  });
  if(final&&position>0)svg+=edge(walk[position-1],here,'walking',true);
  for(let u=0;u<v.n;u++){
   const p=pos[u],reason=v.reason[u],cls=final&&u===here?'walker':!final&&u===v.active?'active':reason==='empty'?'empty-node':reason===0?'layer1':reason===1?'layer2':'core';
   svg+=`<g class="c2603-node ${cls}" data-node="${u}" transform="translate(${p.x},${p.y})">${within[u]?'<circle class="c2603-halo" r="28"/>':''}<circle class="c2603-node-circle" r="19"/><text y="6" text-anchor="middle">${u}</text>${v.coins[u]?`<g class="c2603-coin ${collected.has(u)?'collected':''}" transform="translate(12,-23)"><circle r="9"/><text text-anchor="middle" y="4">${collected.has(u)?'✓':'¢'}</text></g>`:''}${!final&&reason==='empty'?'<text class="c2603-cross" y="37" text-anchor="middle">×</text>':''}</g>`;
  }
  return `<div class="c2603-graph-wrap"><svg class="c2603-graph" style="min-width:${minWidth}px;max-width:${width}px;margin:auto" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(t('Cây, các coin và phần cần đi qua','Tree, coins and remaining core'))}">${svg}</svg></div>${minWidth>available?`<small>↔ ${t('Kéo ngang để xem cây','Scroll sideways to explore')}</small>`:''}<div class="c2603-legend"><span class="layer1">● ${t('lớp 1','layer 1')}</span><span class="layer2">● ${t('lớp 2','layer 2')}</span><span class="core">● ${t('giữ lại','keep')}</span><span class="gold">¢ coin</span></div>`;
 }

 let body=phases+card(final?`🪙 ${t('Nhặt trong phạm vi ≤2 cạnh','Collect within ≤2 edges')}`:t('Gọt lá, giữ đường đi cần thiết','Prune leaves, retain the necessary path'),graph());
 if(v.phase==='empty')body+=card('queue · '+t('lá không coin','coinless leaves'),row(v.queue,'empty-node'));
 if(v.phase==='layers'){
  if(['leaf-queue','layer'].includes(v.event)&&!v.layersFinished)body+=card('queue',row(v.queue,'layer'+(v.round??1)));
  else if(!v.layersFinished)body+=`<div class="c2603-pair">${card(t('Chờ trong lớp này','Pending in this layer'),row(v.pending,'layer'+v.round))}${card(t('Để lại lớp sau','Leave for next layer'),row(v.next,'next'))}</div>`;
  body+=`<div class="c2603-rounds">${tile(1,'layer1',t('lớp','layer'))}<b>→</b>${tile(2,'layer2',t('lớp','layer'))}<strong>${v.layersFinished?t('DỪNG','STOP'):v.round?`${v.round}/2`:'2'}</strong></div>`;
 }
 if(v.phase==='count'||final)body+=card(t('Mỗi cạnh còn lại: đi + về','Each remaining edge: out + back'),`<div class="c2603-equation"><span>${v.remaining}</span> × <span>2</span> = <strong>${v.remaining*2}</strong></div>`,'core');
 else body+=`<div class="c2603-stats">${tile(v.removed.filter(Boolean).length,'',t('đỉnh đã gọt','pruned nodes'))}${tile(v.remaining,'core',t('cạnh đang giữ','retained edges'))}</div>`;
 if(final){
  body+=card(t('Thử đường đi tối ưu · trở về điểm đầu','Try an optimal walk · return to the start'),`<div class="c2603-walk">${walk.map((u,i)=>`${i?'<b>→</b>':''}<button type="button" class="${i===position?'selected':''}" data-c2603-position="${i}">${u}</button>`).join('')}</div><div class="c2603-progress"><span>${t('Đã đi','Moved')} <b>${position}/${walk.length-1}</b></span><span>🪙 <b>${collected.size}/${coinNodes.length}</b></span></div>`);
  body+=card('🪙 '+t('Coin đã nhặt','Collected coins'),`<div class="c2603-row">${coinNodes.map(u=>tile(u,collected.has(u)?'collected':'gold',collected.has(u)?'✓':'?')).join('')||'<span class="c2603-empty">∅</span>'}</div>`);
  body+=`<nav class="c2603-play"><button type="button" data-c2603-position="0">↺</button><button type="button" data-c2603-position="${position-1}" ${position===0?'disabled':''}>←</button><button type="button" data-c2603-position="${position+1}" ${position===walk.length-1?'disabled':''}>${t('Đi tiếp','Next move')} →</button></nav>`;
 }
 const timeline=typeof steps==='undefined'?[]:steps,at=typeof stepIndex==='undefined'?-1:stepIndex;
 const jumps=[['empty-remove','✂'],['size','② '+t('Lớp lá tiếp','Next leaf layer')],['result','🏁']].filter(([tag])=>timeline.some((s,i)=>i>at&&s.coins2603View?.event===tag));
 host.innerHTML=`<div class="c2603-viz"><header class="c2603-heading"><strong>${title}</strong><small>L${step.codeLines[0]} · #${v.frame}</small></header>${body}<nav class="c2603-nav">${jumps.map(([event,label])=>`<button type="button" data-c2603-jump="${event}">${label} →</button>`).join('')}</nav><nav class="c2603-presets"><small>${t('Ví dụ','Examples')}</small><button type="button" data-c2603-example="path">${t('Đường thẳng','Path')}</button><button type="button" data-c2603-example="branch">${t('Phân nhánh','Branches')}</button><button type="button" data-c2603-example="zero">0 ${t('bước','moves')}</button></nav></div>`;
 const wrap=host.querySelector?.('.c2603-graph-wrap');if(wrap){wrap.scrollLeft=oldScroll;if(final&&same&&!resetScroll&&oldPosition!==position){const svg=wrap.querySelector('svg'),node=svg.querySelector(`[data-node="${here}"]`);if(node){const a=wrap.getBoundingClientRect(),b=node.getBoundingClientRect();wrap.scrollLeft+=b.left+b.width/2-a.left-a.width/2;}}}
 host.querySelectorAll?.('[data-c2603-position]').forEach(button=>button.addEventListener('click',()=>{host.dataset.coins2603Position=button.dataset.c2603Position;if(button.dataset.c2603Position==='0')host.dataset.coins2603ResetScroll='1';renderCoins2603Pictures(step);}));
 host.querySelectorAll?.('[data-c2603-jump]').forEach(button=>button.addEventListener('click',()=>{const index=timeline.findIndex((s,i)=>i>at&&s.coins2603View?.event===button.dataset.c2603Jump);if(index>=0){stepIndex=index;renderStep();}}));
 host.querySelectorAll?.('[data-c2603-example]').forEach(button=>button.addEventListener('click',async()=>{const presets={path:{coins:'1,0,0,0,0,1',edges:'0-1,1-2,2-3,3-4,4-5'},branch:{coins:'0,0,0,1,1,0,0,1',edges:'0-1,0-2,1-3,1-4,2-5,5-6,5-7'},zero:{coins:'1,0,0,0,1',edges:'0-1,1-2,2-3,3-4'}};const p=presets[button.dataset.c2603Example];$('arrInput').value=p.coins;$('param-edges').value=p.edges;await runViz();}));
}
