'use strict';
const ffpText=(vi,en)=>lang==='vi'?vi:en;
const ffpEsc=value=>escapeHtml(String(value));
const ffpSame=(a,b)=>a&&b&&a[0]===b[0]&&a[1]===b[1];
function ffpPalette(v){return [...new Set([...v.original.flat(),...(v.id===733?[v.color]:[])])].sort((a,b)=>Number(a)-Number(b));}
function ffpSwatch(value,v){return `<b class="ffp-swatch p${ffpPalette(v).indexOf(value)%8}">${value===null?'—':ffpEsc(value)}</b>`;}
function ffpBoard(v,mini=false){
  const image=mini?v.original:v.image,rows=image.length,cols=image[0].length,size=38,w=cols*size+64,h=rows*size+64;
  const islandGrid=v.id===200||v.id===695;
  const palette=ffpPalette(v),work=new Set((v.mode==='recursive'?v.frames.map(f=>[f.r,f.c]):v.work||[]).map(p=>p.join(',')));
  const pos=p=>[32+(p[1]+.5)*size,32+(p[0]+.5)*size];
  let shapes='';
  image.forEach((row,r)=>row.forEach((value,c)=>{
    const owner=mini?0:v.owners[r][c],changed=!mini&&v.image[r][c]!==v.original[r][c],active=!mini&&ffpSame(v.active,[r,c]),neighbor=!mini&&ffpSame(v.neighbor,[r,c]);
    const queued=!mini&&work.has(`${r},${c}`),paint=!mini&&v.paint?.r===r&&v.paint?.c===c,land=islandGrid&&(owner||Number(value)===1),x=32+c*size,y=32+r*size;
    const attrs=mini?'':`data-cell="${r},${c}" data-value="${ffpEsc(value)}" data-owner="${owner}" data-active="${Boolean(active)}" data-neighbor="${Boolean(neighbor)}" data-queued="${queued}"`;
    shapes+=`<g class="ffp-cell ${islandGrid?'island':'pixel'} p${islandGrid?owner?1+(owner-1)%7:0:palette.indexOf(value)%8} ${changed?'changed':''} ${active?'active':''} ${neighbor?'neighbor':''} ${neighbor&&v.guard?.allowed===false?'blocked':''} ${paint?'painted':''} ${v.id===695&&owner===v.bestOwner&&owner?'ff695-best':''}" ${attrs} transform="translate(${x},${y})"><title>(${r},${c}) = ${ffpEsc(value)}${owner?` · ${ffpText('đảo','island')} #${owner} ✓`:''}</title><rect class="tile" x="1" y="1" width="36" height="36" rx="5"/>${land?`<path class="land" d="M5,19 Q3,10 12,9 Q17,1 25,8 Q36,7 33,19 Q38,28 26,30 Q18,37 11,29 Q1,30 5,19Z"/>`:islandGrid?'<path class="water" d="M7,16 Q11,12 15,16 T23,16 T31,16 M8,23 Q12,19 16,23 T24,23"/>':''}${v.id===695&&owner?`<text class="ff695-unit-label" x="19" y="22" data-counted="${Boolean(v.counted[r][c])}">${v.counted[r][c]?'+1':'·'}</text><text class="actual" x="29" y="32">0</text>`:v.id===200&&owner?`<text class="owner" x="19" y="21">#${owner}</text><text class="actual" x="29" y="32">0</text>`:`<text class="value" x="19" y="24">${ffpEsc(value)}</text>`}${queued?'<circle class="queued" cx="30" cy="7" r="3"/>':''}${!mini&&ffpSame(v.start,[r,c])?'<path class="start" d="M6,4 L8,8 L12,8 L9,11 L10,15 L6,13 L3,15 L4,11 L1,8 L5,8Z"/>':''}${paint?'<path class="check" d="M5,29 L10,33 L17,26"/>':''}</g>`;
  }));
  const indexes=Array.from({length:cols},(_,c)=>`<text class="index" x="${32+(c+.5)*size}" y="22">${c}</text>`).join('')+Array.from({length:rows},(_,r)=>`<text class="index" x="19" y="${36+(r+.5)*size}">${r}</text>`).join('');
  let arrow='';
  if(!mini){let a=v.active,b=v.neighbor;
    if(!b&&v.mode==='recursive'&&v.frames.length>1){const parent=v.frames.at(-2);a=[parent.r,parent.c];b=v.active;}
    if(a&&b&&!ffpSame(a,b)){if(v.phase==='resume')[a,b]=[b,a];const [x1,y1]=pos(a),[x2,y2]=pos(b),dx=x2-x1,dy=y2-y1,scale=Math.hypot(dx,dy),ux=dx/scale,uy=dy/scale;
      arrow=`<path class="ffp-arrow ${v.guard?.allowed===false||v.phase==='return-outside'?'blocked':''}" d="M${x1+ux*10},${y1+uy*10} L${x2-ux*8},${y2-uy*8}" marker-end="url(#ffp-head-${v.id})"/>`;}
  }
  return `<div class="ffp-board-scroll ${mini?'mini':''}"><svg class="ffp-board" viewBox="0 0 ${w} ${h}" style="min-width:${Math.max(180,cols*30+40)}px" role="img" aria-label="${mini?'original':v.id===733?'image':'grid'} ${rows} × ${cols}">${!mini?`<defs><marker id="ffp-head-${v.id}" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L5,3 L0,6" fill="context-stroke"/></marker></defs>`:''}${indexes}${shapes}${arrow}</svg></div>`;
}
function ffpWork(v){
  const work=v.work,recursive=v.mode==='recursive',queue=v.mode==='queue',name=recursive?'call stack':queue?'queue':'stack';
  return `<section class="ffp-card"><header><code>${name}</code><span>${work===null?'—':work.length}</span></header><div class="ffp-work">${work===null?'<span class="ffp-empty">—</span>':!work.length?'<span class="ffp-empty">∅</span>':work.map((p,j)=>{const pair=recursive?[p.r,p.c]:p;return `<div class="ffp-work-cell ${j===(queue?0:work.length-1)?'next':''}" data-work="${pair.join(',')}"><small>${recursive?'dfs':queue?j===0?'FRONT':j===work.length-1?'BACK':'·':j===work.length-1?'TOP':'·'}</small><b>(${pair.join(', ')})</b></div>`;}).join('')}</div><footer>${queue?'← popleft() · append() ←':recursive?'dfs() → ↩':'pop() ← TOP · append()'}</footer></section>`;
}
function ffpCompass(v){
  let from=v.active,to=v.neighbor,direction=v.direction;
  if(!to&&v.mode==='recursive'&&v.frames.length>1){const parent=v.frames.at(-2);from=[parent.r,parent.c];to=v.active;direction=[to[0]-from[0],to[1]-from[1]];}
  const dirs=[[1,0,'↓','down'],[-1,0,'↑','up'],[0,1,'→','right'],[0,-1,'←','left']];
  const glyph=value=>value===null||value===undefined?'—':value?'✓':'×';
  return `<section class="ffp-card"><header><code>${ffpText('4 ô cạnh','4 edge neighbors')}</code><span>↖ × ↗</span></header><div class="ffp-compass">${dirs.map(([dr,dc,icon,position])=>`<span class="${position} ${ffpSame(direction,[dr,dc])?'selected':''}"><b>${icon}</b><small>${dr},${dc}</small></span>`).join('')}<b class="center">${from?`(${from.join(',')})`:'·'}</b></div><div class="ffp-coordinates"><code>${from?`(${from.join(', ')})`:'—'}</code><b>${v.phase==='resume'?'←':'→'}</b><code>${to?`(${to.join(', ')})`:'—'}</code></div>${v.guard?`<div class="ffp-guards">${[['r',v.guard.row],['c',v.guard.col],[v.id===200?"= '1'":(v.id===695||v.id===1020)?'= 1':'= old',v.guard.match]].map(([label,result])=>`<span class="${result===false?'bad':result===true?'good':''}"><small>${label}</small><b>${glyph(result)}</b></span>`).join('')}</div>`:''}</section>`;
}
function renderFloodPictures(step){
  const v=step.floodPicturesView;if(!v)return;
  const label=v.id===200?'Number of Islands':v.mode==='recursive'?'DFS · recursion':v.mode==='queue'?'BFS · queue':'DFS · stack';
  const action=v.paint?`${ffpSwatch(v.paint.from,v)}<strong>→</strong>${ffpSwatch(v.paint.to,v)}<code>(${v.paint.r}, ${v.paint.c}) ✓</code>`:v.phase==='same'?`${ffpSwatch(v.old,v)}<strong>=</strong>${ffpSwatch(v.color,v)}<code>${ffpText('Dừng ngay','Return now')}</code>`:v.phase==='island'?`<strong class="good">+1</strong><code>islands += 1</code>`:v.guard?`<strong class="${v.guard.allowed===false?'bad':'good'}">${v.guard.allowed===null?'?':v.guard.allowed?'✓':'×'}</strong><code>${v.phase==='return-outside'?ffpText('Ngoài biên','Out of bounds'):v.guard.allowed===false?ffpText('Dừng nhánh này','Stop this branch'):ffpText('Kiểm tra ô cạnh','Check neighbor')}</code>`:v.phase==='done'?`<strong class="good">✓</strong><code>${v.id===200?'return islands':'return image'}</code>`:v.phase==='resume'?'<strong>↩</strong><code>dfs() → return</code>':`<strong>${v.phase==='take'?'↥':'→'}</strong><code>${ffpText('Lan theo 4 cạnh','Spread along 4 edges')}</code>`;
  $('treeView').innerHTML=`<div class="ffp-viz" data-problem="${v.id}" data-mode="${v.mode}"><header class="ffp-heading"><code>#${v.id} · ${label}</code><b>L${v.source.line} ✓</b><small>${v.scope} · ${ffpText('sau dòng','after line')}</small></header>
    <div class="ffp-top">${v.id===200?`<section class="ffp-counter ${v.increment?'increment':''}" data-count="${v.count??''}"><small>islands</small><div>${v.increment?`<span>${v.increment.from} →</span>`:''}<strong>${v.count??'—'}</strong></div></section>`:`<section class="ffp-color-key"><small>old → color</small><div>${ffpSwatch(v.old,v)}<b>→</b>${ffpSwatch(v.color,v)}</div></section>`}<div class="ffp-action">${action}<button id="ffpNextEvent" title="${v.id===200?ffpText('Đến đảo mới kế tiếp','Next new island'):ffpText('Đến lần tô tiếp theo','Next painted cell')}">${v.id===200?'+1 ↪':'↪'}</button></div></div>
    <div class="ffp-workspace"><section class="ffp-card ffp-image"><header><code>${v.id===200?"grid · 1 → 0 ✓":'image'}</code><span>${v.filled} ${ffpText(v.id===200?'ô đã thăm':'ô đã tô',v.id===200?'visited':'painted')}</span></header>${ffpBoard(v)}<div class="ffp-legend">${v.id===733?'<span>★ start</span>':`<span>≈ ${ffpText('nước','water')}</span><span>1 ${ffpText('đất','land')}</span><span># ${ffpText('đảo đã thăm','visited island')}</span>`}<span>● ${ffpText('đang chờ','pending')}</span><span>□ ${ffpText('ô hiện tại','current')}</span></div></section><div class="ffp-side">${ffpCompass(v)}${ffpWork(v)}</div></div>
    <details class="ffp-card ffp-original"><summary>${ffpText('Ảnh gốc','Original')} <small>${v.original.length} × ${v.original[0].length}</small></summary>${ffpBoard(v,true)}</details>
  </div>`;
  $('treeView').querySelector('#ffpNextEvent')?.addEventListener('click',()=>{if(typeof steps==='undefined'||typeof stepIndex==='undefined')return;stopPlay();const next=steps.findIndex((s,j)=>j>stepIndex&&(v.id===200?s.floodPicturesView?.phase==='island':s.floodPicturesView?.phase==='paint'));stepIndex=next<0?steps.length-1:next;renderStep();});
}
