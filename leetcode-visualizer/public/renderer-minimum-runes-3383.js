function renderRunes3383Pictures(step){
 const host=$('treeView'),v=step.runes3383View;if(!host||!v)return;
 const t=(vi,en)=>lang==='vi'?vi:en,esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const key=JSON.stringify([v.n,v.crystals,v.edges,v.frame]),same=host.dataset?.runes3383Frame===key,final=Boolean(step.final);
 let replay=final&&same?Number(host.dataset.runes3383Replay??v.added.length):v.added.length;
 replay=Math.max(0,Math.min(v.added.length,replay));
 if(host.dataset){host.dataset.runes3383Frame=key;host.dataset.runes3383Replay=String(replay);}
 function coverage(count){const graph=Array.from({length:v.n},()=>[]);for(const[u,w]of[...v.edges,...v.added.slice(0,count)])graph[u].push(w);const lit=Array(v.n).fill(false),queue=[...v.crystals];for(let h=0;h<queue.length;h++){const u=queue[h];if(lit[u])continue;lit[u]=true;queue.push(...graph[u]);}return lit;}
 const powered=final?coverage(replay):v.powered,initial=v.initialPowered,lit=powered.filter(Boolean).length;
 const active=final&&replay>0?v.added[replay-1][1]:final?null:v.active;
 const card=(label,html,cls='')=>`<section class="r3383-card ${cls}"><header>${label}</header>${html}</section>`;
 const tile=(value,cls='',small='')=>`<span class="r3383-tile ${cls}"><b>${esc(value)}</b>${small?`<small>${esc(small)}</small>`:''}</span>`;
 const row=(nodes,cls='')=>`<div class="r3383-row">${nodes.map(u=>tile(u,cls)).join('')||'<span class="r3383-empty">∅</span>'}</div>`;
 const phases=[['initial','💎',t('Lan từ nguồn','Spread from sources')],['finish','↶',t('DFS phần tối','DFS dark nodes')],['add','＋',t('Nối và lan tiếp','Connect and spread')]];
 const at=v.phase==='graph'?-1:v.phase==='done'?3:phases.findIndex(([key])=>key===v.phase);
 const strip=`<div class="r3383-phases">${phases.map(([key,icon,label],i)=>`<span class="${i===at?'active':i<at?'lit':''}"><b>${icon}</b><small>${label}</small></span>`).join('')}</div>`;

 function graph(){
  // Mutual reachability is used only to keep cycles together in the picture.
  const reach=Array.from({length:v.n},(_,u)=>Array.from({length:v.n},(_,w)=>u===w));
  v.edges.forEach(([u,w])=>reach[u][w]=true);for(let k=0;k<v.n;k++)for(let u=0;u<v.n;u++)for(let w=0;w<v.n;w++)reach[u][w] ||=reach[u][k]&&reach[k][w];
  const assigned=new Set(),groups=[];
  for(let u=0;u<v.n;u++)if(!assigned.has(u)){const members=[];for(let w=0;w<v.n;w++)if(!assigned.has(w)&&reach[u][w]&&reach[w][u]){members.push(w);assigned.add(w);}groups.push(members);}
  const maxGroup=Math.max(...groups.map(g=>g.length)),maxRadius=maxGroup===1?0:Math.max(40,maxGroup*9);
  const available=(host.clientWidth||560)-48,narrow=available<420,compact=groups.length<=6||maxGroup>3;
  const cols=Math.min(narrow&&compact?2:3,groups.length),cellW=Math.max(180,2*maxRadius+80),cellH=Math.max(175,2*maxRadius+100),width=cols*cellW+60,height=Math.ceil(groups.length/cols)*cellH+50,pos=[];
  const minWidth=narrow&&compact?0:Math.max(310,cols*155);
  let svg='<defs><marker id="r3383-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10Z" style="fill:context-stroke;stroke:none"/></marker></defs>';
  groups.forEach((members,i)=>{const cx=30+cellW*(i%cols+.5),cy=25+cellH*(Math.floor(i/cols)+.5),radius=members.length===1?0:Math.max(40,members.length*9);
   if(members.length>1)svg+=`<rect class="r3383-cycle" x="${cx-radius-27}" y="${cy-radius-27}" width="${2*radius+54}" height="${2*radius+68}" rx="17"/>`;
   members.forEach((u,j)=>{const angle=-Math.PI/2+2*Math.PI*j/members.length;pos[u]={x:cx+radius*Math.cos(angle),y:cy+radius*Math.sin(angle)};});
  });
  function arrow(u,w,cls,newEdge=false){const p=pos[u],q=pos[w],dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
   const x1=p.x+dx/len*23,y1=p.y+dy/len*23,x2=q.x-dx/len*27,y2=q.y-dy/len*27;
   const bend=newEdge?Math.min(90,Math.max(35,len*.22)):v.edges.some(([a,b])=>a===w&&b===u)?20:0;
   return `<path class="r3383-edge ${cls}" d="M${x1},${y1} Q${(p.x+q.x)/2+nx*bend},${(p.y+q.y)/2+ny*bend} ${x2},${y2}" marker-end="url(#r3383-arrow)" data-edge="${u},${w}"/>`;
  }
  v.edges.forEach(([u,w])=>{const selected=!final&&v.activeEdge?.[0]===u&&v.activeEdge?.[1]===w;svg+=arrow(u,w,selected?'active':powered[u]&&powered[w]?'lit':'');});
  v.added.slice(0,final?replay:v.added.length).forEach(([u,w],i)=>svg+=arrow(u,w,'new '+(final&&i===replay-1?'pulse':''),true));
  for(let u=0;u<v.n;u++){const p=pos[u],crystal=v.crystals.includes(u),cls=u===active?'active':powered[u]?'lit':v.phase==='finish'&&v.seen[u]?'seen':'dark';
   svg+=`<g class="r3383-node ${cls}" data-node="${u}" transform="translate(${p.x},${p.y})"><circle r="21"/>${crystal?'<path class="r3383-crystal" d="M0 -35 L8 -27 L0 -19 L-8 -27Z"/>':''}<text y="6" text-anchor="middle">${u}</text>${powered[u]?'<text class="r3383-status" y="39" text-anchor="middle">✓</text>':''}</g>`;
  }
  return `<div class="r3383-graph-wrap"><svg class="r3383-graph" style="min-width:${minWidth}px;max-height:none" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(t('Luồng năng lượng và rune mới','Energy flow and added runes'))}">${svg}</svg></div>${minWidth>available?`<small>↔ ${t('Kéo ngang để xem','Scroll sideways to explore')}</small>`:''}<div class="r3383-legend"><span>◆ ${t('tinh thể','crystal')}</span><span class="lit">● ${t('có năng lượng','powered')}</span><span class="new">＋ ${t('rune mới','new rune')}</span></div>`;
 }

 const title=final?`✓ ${v.added.length} ${t('rune mới','new runes')}`:v.phase==='graph'?t('Tạo đường truyền','Build the paths'):v.phase==='initial'?'💎 '+t('Năng lượng lan theo mũi tên','Energy follows the arrows'):v.phase==='finish'?'↶ '+t('Ghi thứ tự kết thúc','Record finish order'):'＋ '+t('Nối tới đỉnh còn tối','Connect a still-dark node');
 const energy=`<div class="r3383-energy"><div><b>⚡ ${lit}/${v.n}</b><small>${t('đỉnh có năng lượng','powered nodes')}</small></div><div class="r3383-meter"><i style="width:${lit/v.n*100}%"></i></div></div>`;
 let body=strip+card(final&&replay<v.added.length?t('Xem lại kết quả','Replay the result'):t('Tinh thể → đường truyền → các đỉnh','Crystals → runes → nodes'),graph()+energy);
 if(v.scope==='spread'&&!final)body+=card('BFS · queue',row(v.queue,'queue'));
 if(v.phase==='finish'){
  if(v.scope==='finish')body+=card('DFS · stack',`<div class="r3383-stack">${v.stack.map(([u,done])=>tile(u,done?'exit':'seen',done?'↑ '+t('ra','exit'):'↓ '+t('vào','enter'))).join('')||'∅'}</div>`);
  body+=card('order · '+t('kết thúc trước → ghi trước','first finished → first recorded'),row(v.order,'seen'));
 }
 if(v.phase==='add')body+=card(t('Đảo order → xét từ trái sang phải','Reverse order → inspect left to right'),`<div class="r3383-row">${[...v.order].reverse().map(u=>tile(u,u===v.active?'active':powered[u]?'lit':'dark')).join('')||'∅'}</div>`);
 if(v.phase==='add'||final){
  const visible=final?replay:v.added.length;
  body+=card('＋ '+t('Các rune đã thêm','Added runes'),`<div class="r3383-runes">${v.added.slice(0,visible).map(([u,w],i)=>`<span class="r3383-rune">${tile(u,'source')}<strong>→</strong>${tile(w,'new')}<small>+${i+1}</small></span>`).join('')||'<span class="r3383-empty">∅</span>'}</div>`);
 }
 if(final){
  body+=`<div class="r3383-summary">${tile(initial.filter(Boolean).length,'',t('ban đầu','initially'))}<b>→</b>${tile(lit,'lit',t('đang sáng','powered'))}${tile(v.added.length,'new',t('rune tối thiểu','minimum runes'))}</div>`;
  body+=`<nav class="r3383-replay"><button type="button" data-r3383-replay="0">↺ ${t('Xem lại','Replay')}</button><button type="button" data-r3383-replay="${replay+1}" ${replay>=v.added.length?'disabled':''}>＋ ${t('Thêm rune','Add rune')} →</button><small>${replay}/${v.added.length}</small></nav>`;
 }
 const timeline=typeof steps==='undefined'?[]:steps,current=typeof stepIndex==='undefined'?-1:stepIndex;
 const jumps=[['light','⚡'],['finish-node','↶ order'],['new-rune','＋ rune'],['result','🏁']].filter(([event])=>timeline.some((s,i)=>i>current&&s.runes3383View?.event===event));
 const presets=[['cycle',t('Vòng tối','Dark cycle')],['islands',t('Đỉnh rời','Isolated nodes')],['ready','0 rune']];
 host.innerHTML=`<div class="r3383-viz"><header class="r3383-heading"><strong>${title}</strong><small>L${step.codeLines[0]} · #${v.frame}</small></header>${body}<nav class="r3383-nav">${jumps.map(([event,label])=>`<button type="button" data-r3383-jump="${event}">${label} →</button>`).join('')}</nav><nav class="r3383-presets"><small>${t('Ví dụ','Examples')}</small>${presets.map(([key,label])=>`<button type="button" data-r3383-example="${key}">${label}</button>`).join('')}</nav></div>`;
 host.querySelectorAll?.('[data-r3383-replay]').forEach(button=>button.addEventListener('click',()=>{host.dataset.runes3383Replay=button.dataset.r3383Replay;renderRunes3383Pictures(step);}));
 host.querySelectorAll?.('[data-r3383-jump]').forEach(button=>button.addEventListener('click',()=>{const index=timeline.findIndex((s,i)=>i>current&&s.runes3383View?.event===button.dataset.r3383Jump);if(index>=0){stepIndex=index;renderStep();}}));
 host.querySelectorAll?.('[data-r3383-example]').forEach(button=>button.addEventListener('click',async()=>{const examples={cycle:{n:7,crystals:'[3,5]',edges:'0-1,1-2,2-0,3-4,5-6'},islands:{n:6,crystals:'[0]',edges:'0-1,1-2,2-3,3-0'},ready:{n:4,crystals:'[0]',edges:'0-1,1-2,2-3'}};const preset=examples[button.dataset.r3383Example];$('arrInput').value=preset.edges;$('param-n').value=preset.n;$('param-crystals').value=preset.crystals;await runViz();}));
}
