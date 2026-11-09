'use strict';
const DR_CASES={1206:[['[["add",1],["add",2],["add",3],["search",0],["add",4],["search",1],["erase",0],["erase",1],["search",1]]','Ví dụ Skiplist','Skiplist example'],['[["add",5],["add",5],["erase",5],["search",5],["erase",5],["search",5]]','Xóa một giá trị trùng','Erase one duplicate']],1823:[[5,2,'5 người · k = 2','5 players · k = 2'],[6,5,'Quấn nhiều vòng','Count across the circle'],[1,1,'Một người','One player']]};
function drGraph(v,vi,selected){
  const byId=new Map(v.nodes.map(n=>[n.id,n]));
  if(v.kind==='skip'){
    const order=n=>v.chain.includes(n.id)?v.chain.indexOf(n.id):v.chain.length+Number(n.id.split(':')[1]);
    const sorted=[...v.nodes].sort((a,b)=>(a.fields.val??-1)-(b.fields.val??-1)||order(a)-order(b));
    const rank=new Map(sorted.map((n,i)=>[n.id,i]));
    const levels=Math.max(1,v.state.height??1,...v.nodes.filter(n=>n.id!==v.sentinels[0]).map(n=>n.fields.forward?.length??1));
    const w=Math.max(350,sorted.length*83+100),h=levels*65+65;
    const px=id=>80+rank.get(id)*83,py=level=>32+(levels-1-level)*65;
    const rows=Array.from({length:levels},(_,level)=>`<text class="ld-small" x="23" y="${py(level)+4}">L${level}</text>`).join('');
    const edges=v.nodes.flatMap(n=>(n.fields.forward??[]).flatMap((ref,level)=>{
      if(!ref||level>=levels)return [];
      const changed=v.change?.node===n.id&&v.change?.level===level,sign=px(ref.id)>=px(n.id)?1:-1;
      return `<path class="dr-forward ${changed?'is-written':''}" data-forward-from="${n.id}" data-forward-level="${level}" data-forward-to="${ref.id}" d="M${px(n.id)+sign*23},${py(level)}H${px(ref.id)-sign*24}" marker-end="url(#dr-arrow)"/>`;
    })).join('');
    const towers=sorted.map(n=>`<path class="dr-tower" d="M${px(n.id)},${py(0)}V${py(Math.min(levels,n.fields.forward?.length??1)-1)}"/>`).join('');
    const nodes=sorted.flatMap(n=>Array.from({length:Math.min(levels,n.fields.forward?.length??1)},(_,level)=>{
      const active=v.bindings.node===n.id&&(v.locals.level===undefined||v.locals.level===level);
      return `<g class="dr-skip-node ${n.id===selected?'is-selected':''} ${active?'is-active':''} ${!v.chain.includes(n.id)?'is-unlinked':''}" data-ld-node="${n.id}" data-node-id="${n.id}" data-node-fields="${ldEsc(JSON.stringify(n.fields))}" role="button" tabindex="0" aria-label="${n.fields.val??'pending'}, level ${level}"><rect x="${px(n.id)-21}" y="${py(level)-18}" width="42" height="36" rx="6"/><text x="${px(n.id)}" y="${py(level)+5}">${n.id===v.sentinels[0]?'H':n.fields.val??'?'}</text><text class="ld-small" x="${px(n.id)}" y="${py(level)+32}">N${n.id.split(':')[1]}</text></g>`;
    })).join('');
    const bindings=`<div class="ld-stats">${ldStat('level',v.locals.level)}${ldStat('node',ldName(v,v.bindings.node))}${ldStat('height',v.state.height)}</div>`;
    return ldCard('Skiplist · forward[level]',ldScroll('skip',`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="group"><defs><marker id="dr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10Z"/></marker></defs>${rows}${towers}${edges}${nodes}</svg>`,'ld-canvas')+bindings,vi?'Tím: node + tầng đang xét · mờ: chưa nối / đã xóa':'Purple: current node + level · faded: unlinked / erased');
  }
  const n=v.locals.n??v.outer.n??v.nodes.length,w=420,h=405;
  const pos=id=>{const node=byId.get(id),angle=-Math.PI/2+((node.fields.val??1)-1)*Math.PI*2/n;return {x:210+Math.cos(angle)*140,y:192+Math.sin(angle)*140};};
  const edges=v.nodes.flatMap(node=>['next','prev'].flatMap(field=>{
    const to=node.fields[field]?.id;if(!to)return [];
    const a=pos(node.id),b=pos(to),dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
    let d;
    if(len<1){const offset=field==='next'?-1:1;d=`M${a.x-16},${a.y}C${a.x-65},${a.y+offset*50} ${a.x+65},${a.y+offset*50} ${a.x+16},${a.y}`;}
    else{const mx=(a.x+b.x)/2,my=(a.y+b.y)/2,scale=field==='next'?1.4:1.1;
      const cx=210+(mx-210)*scale,cy=192+(my-192)*scale;
      d=`M${a.x+dx/len*24},${a.y+dy/len*24}Q${cx},${cy} ${b.x-dx/len*27},${b.y-dy/len*27}`;
    }
    const changed=v.change?.node===node.id&&v.change?.field===field;
    return `<path class="dr-forward is-${field} ${changed?'is-written':''} ${!v.chain.includes(node.id)&&v.locals.remaining!==undefined?'is-unlinked':''}" data-circle-from="${node.id}" data-circle-field="${field}" data-circle-to="${to}" d="${d}" marker-end="url(#dr-${field})"/>`;
  })).join('');
  const nodes=v.nodes.map(node=>{const p=pos(node.id),active=v.bindings.current===node.id,removed=!v.chain.includes(node.id)&&v.locals.remaining!==undefined;return `<g class="dr-circle-node ${node.id===selected?'is-selected':''} ${active?'is-active':''} ${removed?'is-unlinked':''}" data-ld-node="${node.id}" data-node-id="${node.id}" data-node-fields="${ldEsc(JSON.stringify(node.fields))}" role="button" tabindex="0" aria-label="Player ${node.fields.val}"><circle cx="${p.x}" cy="${p.y}" r="22"/><text x="${p.x}" y="${p.y+5}">${node.fields.val??'?'}</text></g>`;}).join('');
  const defs=['next','prev'].map(field=>`<marker id="dr-${field}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10Z"/></marker>`).join('');
  const counters=`<div class="ld-stats">${ldStat('k',v.locals.k??v.outer.k)}${ldStat('remaining',v.locals.remaining)}${ldStat('current',byId.get(v.bindings.current)?.fields.val)}</div>`;
  return ldCard(vi?'Đếm theo vòng · nối bỏ node':'Count around the circle · unlink a node',ldScroll('circle',`<svg width="${w}" height="${h}" style="width:100%;max-width:420px;height:auto" viewBox="0 0 ${w} ${h}" role="group"><defs>${defs}</defs>${edges}${nodes}</svg>`,'ld-canvas')+counters+`<div class="ld-legend"><span class="is-next">→ next</span><span class="is-prev">← prev</span><span class="is-amber">→ ${vi?'vừa gán':'just assigned'}</span></div>`,vi?'Tím: current · mờ: ngoài đường next từ current':'Purple: current · faded: outside the next walk from current');
}
function renderDllRoadmap(step,options={}){
  const v=step.dllRoadmapView,host=document.getElementById('treeView');if(!v||!host)return;const vi=typeof lang!=='undefined'&&lang==='vi',open=host.querySelector('.ld-native')?.open??false,scrolls=new Map([...host.querySelectorAll('[data-ld-scroll]')].map(el=>[el.dataset.ldScroll,{x:el.scrollLeft,y:el.scrollTop}]));
  const selected=options.selected??v.change?.node??v.bindings.node??v.bindings.current??v.nodes.at(-1)?.id;
  host.innerHTML=`<article class="tr-viz ld-viz dr-viz" data-problem-id="${v.id}" data-source-line="${v.source.line}" role="region" aria-label="LeetCode ${v.id}"><header class="tr-header"><div><small>LEETCODE ${v.id}</small><h2>${v.id===1206?'Skiplist · linked nodes':vi?'Trò chơi vòng tròn · DLL':'Circular game · DLL'}</h2></div></header><nav class="tr-presets">${DR_CASES[v.id].map((c,i)=>`<button type="button" data-dr-case="${i}">${c[v.id===1206?(vi?1:2):(vi?2:3)]}</button>`).join('')}</nav><div class="tr-source"><span>${vi?'Sau dòng':'After line'} <b>L${v.source.line}</b></span><code>${ldEsc(v.source.text)}</code>${v.branch===null?'':`<strong>${v.branch?'True ✓':'False ×'}</strong>`}</div><div class="ld-work">${drGraph(v,vi,selected)}${ldInspector(v,vi,selected)}${v.id===1206?ldOperationList(v,vi):''}</div><details class="tr-native ld-native"><summary>${vi?'Biến Python và con trỏ':'Python locals and pointers'}</summary><pre>${ldEsc(JSON.stringify({frames:v.frames,objects:v.objects},null,2))}</pre></details>${v.result===null?'':`<output class="tr-answer" data-answer="${ldEsc(JSON.stringify(v.result))}"><small>${vi?'Kết quả':'Result'}</small><strong>${ldEsc(JSON.stringify(v.result))}</strong></output>`}<footer class="tr-footer"><div>${[['line',vi?'Dòng →':'Line →'],['link',vi?'Nối →':'Link →'],['result',vi?'Kết quả ↠':'Result ↠']].map(([kind,label])=>`<button type="button" data-dr-jump="${kind}" ${drNext(kind)<0?'disabled':''}>${label}</button>`).join('')}</div></footer></article>`;
  const details=host.querySelector('.ld-native');if(details)details.open=open;
  for(const el of host.querySelectorAll('[data-ld-scroll]')){const saved=scrolls.get(el.dataset.ldScroll);if(saved){el.scrollLeft=saved.x;el.scrollTop=saved.y;}const active=el.querySelector('.is-active')??el.querySelector('.is-selected')??el.querySelector('.is-current');if(active){const a=el.getBoundingClientRect(),b=active.getBoundingClientRect();if(b.left<a.left)el.scrollLeft-=a.left-b.left;if(b.right>a.right)el.scrollLeft+=b.right-a.right;if(b.top<a.top)el.scrollTop-=a.top-b.top;if(b.bottom>a.bottom)el.scrollTop+=b.bottom-a.bottom;}}
  const bind=(sel,fn)=>host.querySelectorAll(sel).forEach(el=>{el.addEventListener('click',()=>fn(el));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();fn(el);}});});
  host.querySelectorAll('summary').forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')e.stopPropagation();}));
  bind('[data-dr-jump]',el=>ldGo(drNext(el.dataset.drJump)));
  bind('[data-ld-node]',el=>{if(typeof stopPlay==='function')stopPlay();renderDllRoadmap(steps[stepIndex],{selected:el.dataset.ldNode});});
  bind('[data-ld-inspect]',el=>{if(typeof stopPlay==='function')stopPlay();renderDllRoadmap(steps[stepIndex],{selected:el.dataset.ldInspect});});
  bind('[data-ld-operation]',el=>ldGo(steps.findIndex(s=>s.dllRoadmapView.operationIndex===Number(el.dataset.ldOperation))));
  bind('[data-dr-case]',el=>{const c=DR_CASES[v.id][Number(el.dataset.drCase)];document.getElementById('arrInput').value=c[0];if(v.id===1823)document.getElementById('param-k').value=c[1];if(typeof runViz==='function')runViz();});
}
function drNext(kind){if(typeof steps==='undefined')return -1;return steps.findIndex((s,i)=>i>stepIndex&&s.dllRoadmapView&&(kind==='line'||kind==='link'&&s.dllRoadmapView.change?.kind==='link'||kind==='result'&&s.final));}
