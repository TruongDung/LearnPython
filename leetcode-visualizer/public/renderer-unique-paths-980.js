function renderUniquePaths980Pictures(step) {
 const host=$('treeView'),v=step.uniquePaths980View;if(!host||!v)return;
 const t=(vi,en)=>lang==='vi'?vi:en;
 const same=(a,b)=>a&&b&&a[0]===b[0]&&a[1]===b[1];
 const inside=p=>p&&p[0]>=0&&p[0]<v.rows&&p[1]>=0&&p[1]<v.cols;
 const oldFrame=host.dataset?.u980Frame===String(v.frame);
 const preview=step.final&&v.solutions.length?Math.max(0,Math.min(v.solutions.length-1,oldFrame?Number(host.dataset.u980Path)||0:0)):null;
 if(host.dataset){host.dataset.u980Frame=String(v.frame);host.dataset.u980Path=String(preview??0);}
 const path=preview===null?v.path:v.solutions[preview],seen=new Set(v.visited.map(cell=>cell.join(',')));
 const width=Math.max(220,Math.min(500,(host.clientWidth||550)-24));
 const cell=Math.max(34,Math.min(70,(width-48)/v.cols)),w=v.cols*cell+48,h=v.rows*cell+48;
 const point=p=>({x:24+(p[1]+.5)*cell,y:24+(p[0]+.5)*cell});
 let cells='';
 for(let c=0;c<v.cols;c++)cells+=`<text class="u980-axis" x="${24+(c+.5)*cell}" y="15" text-anchor="middle">${c}</text>`;
 for(let r=0;r<v.rows;r++){
  cells+=`<text class="u980-axis" x="13" y="${24+(r+.5)*cell+4}" text-anchor="middle">${r}</text>`;
  for(let c=0;c<v.cols;c++){
   const p=[r,c],value=v.grid[r][c],order=path.findIndex(q=>same(p,q)),visited=seen.has(`${r},${c}`),current=same(p,v.current),rejected=current&&['wall','visited'].includes(v.reason);
   const cls=[value===-1?'wall':'',order>=0?'in-path':'',visited?'visited':'',current?'current':'',rejected?'rejected':'',v.reason==='early'&&value!==-1&&!visited?'missed':'',v.change?.kind==='unvisit'&&same(p,v.change.cell)?'restored':''].join(' ');
   const label=value===1?'S':value===2?'E':value===-1?'×':'';
   cells+=`<g class="u980-cell ${cls}" data-cell="${r},${c}" data-visited="${visited}" data-order="${order}"><rect x="${24+c*cell+3}" y="${24+r*cell+3}" width="${cell-6}" height="${cell-6}" rx="7"/><text class="u980-label" x="${24+(c+.5)*cell}" y="${24+(r+.5)*cell+7}" text-anchor="middle" style="font-size:${Math.min(26,cell*.5)}px">${label}</text>${order>=0?`<text class="u980-order" x="${24+c*cell+7}" y="${24+r*cell+14}">${order+1}</text>`:''}${visited?`<circle class="u980-visited-dot" cx="${24+(c+1)*cell-10}" cy="${24+(r+1)*cell-10}" r="3"/>`:''}</g>`;
  }
 }
 const route=path.map(p=>{const q=point(p);return `${q.x},${q.y}`;}).join(' ');
 let arrow='';
 if(v.action==='direction'&&v.condition?.result!==false&&inside(v.current)){
  const frame=v.stack.at(-1),a=point(v.current),b=point([v.current[0]+frame.dr,v.current[1]+frame.dc]);
  b.x=Math.max(8,Math.min(w-8,b.x));b.y=Math.max(8,Math.min(h-8,b.y));
  arrow=`<path class="u980-arrow" d="M${a.x},${a.y}L${b.x},${b.y}" marker-end="url(#u980-arrow)"/>`;
 }
 const outside=v.reason==='outside'?`<text class="u980-outside" x="${w/2}" y="${h-4}" text-anchor="middle">(${v.current[0]},${v.current[1]}) × ${t('ngoài bảng','outside')}</text>`:'';
 const scene=`<div class="u980-board-scroll"><svg class="u980-board" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${t('Bàn cờ, đường đi và các ô đã đánh dấu','Grid, current path and visited cells')}"><defs><marker id="u980-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0L5,2.5L0,5Z"/></marker></defs>${cells}<polyline class="u980-route" points="${route}"/>${arrow}${outside}</svg></div>`;
 let operation='';
 if(v.change?.kind==='remain')operation=`<code>remain</code><b>${v.change.from}</b><strong>→</strong><b>${v.change.to}</b>`;
 else if(['visit','unvisit','append','pop'].includes(v.change?.kind))operation=`<code>${{visit:'visited.add',unvisit:'visited.remove',append:'path.append',pop:'path.pop'}[v.change.kind]}</code><strong>${['unvisit','pop'].includes(v.change.kind)?'↶':'+'}</strong><b>(${v.change.cell.join(',')})</b>`;
 else if(v.action==='save')operation=`<code>answer</code><b>${v.answer-1} → <span class="u980-yes">${v.answer} ✓</span></b>`;
 else if(v.reason==='early')operation=`<b class="u980-no">E ×</b><span>${v.remain} ${t('ô chưa đi','cells still unvisited')}</span>`;
 else if(v.reason==='wall'||v.reason==='visited')operation=`<b class="u980-no">×</b><span>${v.reason==='wall'?t('ô bị chặn','wall'):t('ô đã đi qua','already visited')}</span>`;
 const condition=v.condition?`<div class="u980-condition"><code>${v.condition.expression}</code><b class="${v.condition.result?'u980-yes':'u980-no'}">${v.condition.result?'True':'False'}</b></div>`:'';
 const timeline=typeof steps==='undefined'?[]:steps,currentIndex=typeof stepIndex==='undefined'?-1:stepIndex;
 const jumps=[['append','+ '+t('ô','cell')],['pop','↶'],['complete','E'],['save','✓']].map(([action,label])=>{
  const index=timeline.findIndex((candidate,i)=>i>currentIndex&&candidate.uniquePaths980View?.action===action);
  return `<button type="button" data-u980-jump="${action}" ${index<0?'disabled':''} title="${t('Tới bước tiếp theo: ','Jump to next: ')}${action}" aria-label="${t('Tới bước tiếp theo: ','Jump to next: ')}${action}">${label}</button>`;
 }).join('');
 const count=path.length,coverage=Array.from({length:v.total},(_,i)=>`<i class="${i<count?'filled':''}"></i>`).join('');
 const metrics=`<div class="u980-metrics"><span><small>${t('đã đi','covered')}</small><b>${count}/${v.total}</b></span><span><small>${t('chưa đi','unvisited')}</small><b>${v.total-count}</b></span>${v.remain!==null?`<span><small>remain</small><b>${v.remain}</b></span>`:''}<span class="u980-answer"><small>answer</small><b>${v.answer}</b></span></div><div class="u980-coverage">${coverage}</div>`;
 const mini=(route)=>{
  const scale=10,mw=v.cols*scale+8,mh=v.rows*scale+8;
  const walls=v.grid.flatMap((row,r)=>row.map((value,c)=>value===-1?`<rect x="${4+c*scale}" y="${4+r*scale}" width="${scale}" height="${scale}"/>`:'')).join('');
  const points=route.map(([r,c])=>`${4+(c+.5)*scale},${4+(r+.5)*scale}`).join(' ');
  const first=route[0],last=route.at(-1);
  return `<svg class="u980-mini" viewBox="0 0 ${mw} ${mh}" role="img" aria-label="${t('Đường đã đi đủ mọi ô','Complete saved path')}">${walls}<polyline points="${points}"/><circle cx="${4+(first[1]+.5)*scale}" cy="${4+(first[0]+.5)*scale}" r="2"/><circle class="end" cx="${4+(last[1]+.5)*scale}" cy="${4+(last[0]+.5)*scale}" r="2"/></svg>`;
 };
 const pageSize=8,page=preview===null?Math.max(0,Math.ceil(v.solutions.length/pageSize)-1):Math.floor(preview/pageSize),pages=Math.max(1,Math.ceil(v.solutions.length/pageSize));
 const gallery=v.solutions.slice(page*pageSize,(page+1)*pageSize).map((path,i)=>{
  const index=page*pageSize+i,tag=step.final?'button':'article';
  return `<${tag} ${step.final?'type="button"':''} class="u980-solution ${preview===index?'selected':''}" data-u980-path="${index}"><small>#${index+1} ✓</small>${mini(path)}</${tag}>`;
 }).join('');
 const pagesUI=step.final&&pages>1?`<nav class="u980-pages"><button type="button" data-u980-path="${(page-1)*pageSize}" ${page===0?'disabled':''} aria-label="${t('Trang trước','Previous page')}">←</button><small>${page+1}/${pages}</small><button type="button" data-u980-path="${(page+1)*pageSize}" ${page===pages-1?'disabled':''} aria-label="${t('Trang sau','Next page')}">→</button></nav>`:'';
 const saved=gallery?`<section class="u980-solutions"><header><b>${t('Đường đã lưu','Saved paths')}</b><small>${v.solutions.length} ✓</small></header><div>${gallery}</div>${pagesUI}</section>`:'';
 const stack=v.stack.slice(-3).map(frame=>`<span>(${frame.r},${frame.c},${frame.remain})</span>`).join('<i>→</i>');
 host.innerHTML=`<section class="u980-viz"><header><strong>S → E · ${t('qua mọi ô đúng 1 lần','every cell exactly once')}</strong><small>${t('sau dòng','after line')} ${v.source.line}</small></header>${metrics}${preview!==null?`<div class="u980-preview">${t('Đường đã lưu','Saved path')} #${preview+1} · ${v.total}/${v.total} ✓</div>`:''}${scene}<div class="u980-legend"><span>S ${t('bắt đầu','start')}</span><span>E ${t('đích','end')}</span><span>× ${t('chặn','wall')}</span><span class="u980-yes">● visited</span></div>${operation?`<div class="u980-operation">${operation}</div>`:''}${condition}${stack?`<div class="u980-stack"><small>dfs(r,c,remain)</small>${v.stack.length>3?'<i>…</i>':''}${stack}</div>`:''}${step.final&&!v.answer?`<div class="u980-zero">0 ${t('đường hợp lệ','valid paths')}</div>`:''}${saved}${!step.final?`<nav class="u980-jumps"><small>${t('Tới bước','Jump to')}</small>${jumps}</nav>`:''}${v.omitted?`<small>${t('Đã thu gọn','Omitted')} ${v.omitted} ${t('bước · kết quả đầy đủ','steps · full result')}</small>`:''}</section>`;
 host.querySelectorAll?.('[data-u980-jump]').forEach(button=>button.addEventListener('click',()=>{
  const index=steps.findIndex((candidate,i)=>i>stepIndex&&candidate.uniquePaths980View?.action===button.dataset.u980Jump);
  if(index>=0){stepIndex=index;renderStep();}
 }));
 if(step.final)host.querySelectorAll?.('button[data-u980-path]').forEach(button=>button.addEventListener('click',()=>{host.dataset.u980Path=button.dataset.u980Path;renderUniquePaths980Pictures(step);}));
 const viewport=host.querySelector?.('.u980-board-scroll'),focus=inside(v.current)?v.current:preview!==null?path[0]:null;
 if(viewport&&focus){const p=point(focus);viewport.scrollLeft=Math.max(0,p.x-viewport.clientWidth/2);viewport.scrollTop=Math.max(0,p.y-viewport.clientHeight/2);}
}
