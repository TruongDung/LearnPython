function renderTiling1240Pictures(step) {
 const v=step.tiling1240View,host=$('treeView');if(!host||!v)return;
 const t=(vi,en)=>lang==='vi'?vi:en,color=i=>`var(--t-c${i%8})`,s=v.locals;
 const boardWidth=Math.max(220,Math.min(510,(host.clientWidth||550)-24)),cell=Math.max(26,Math.min(74,(boardWidth-48)/v.m,330/v.n));
 const layout=step.final?v.bestLayout:v.placed,heights=step.final?Array(v.m).fill(v.n):v.heights;
 const w=v.m*cell+48,h=v.n*cell+(step.final?48:82);
 let background='',pieces='',outlines='';
 for(let r=0;r<=v.n;r++)background+=`<text class="t1240-axis" x="13" y="${24+(v.n-r)*cell+4}" text-anchor="middle">${r}</text>`;
 for(let c=0;c<v.m;c++)background+=`<text class="t1240-axis" x="${24+(c+.5)*cell}" y="15" text-anchor="middle">${c}</text>`;
 for(const [i,[row,col,size]] of layout.entries()){
  const x=24+col*cell,y=24+(v.n-row-size)*cell,side=size*cell;
  const fills=Array.from({length:size},(_,j)=>Math.max(0,Math.min(size,heights[col+j]-row))),full=fills.every(height=>height===size);
  fills.forEach((filled,j)=>{if(filled)pieces+=`<rect class="t1240-fill" x="${x+j*cell}" y="${24+(v.n-row-filled)*cell}" width="${cell}" height="${filled*cell}" style="--t-tone:${color(i)}"/>`;});
  outlines+=`<g class="t1240-piece ${full?'full':'partial'}" data-square="${row},${col},${size}" data-full="${full}" style="--t-tone:${color(i)}"><rect x="${x+1.5}" y="${y+1.5}" width="${side-3}" height="${side-3}" rx="3"/><text x="${x+side/2}" y="${y+side/2+5}" text-anchor="middle" style="font-size:${Math.min(23,cell*.48+size*2)}px">${size===1?'1':`${size}×${size}`}</text></g>`;
 }
 let units='';
 for(let r=0;r<v.n;r++)for(let c=0;c<v.m;c++)units+=`<rect class="t1240-unit" x="${24+c*cell}" y="${24+r*cell}" width="${cell}" height="${cell}"/>`;
 let ghost='';
 const preview=!step.final&&v.action==='size'&&v.condition?.result?[s.low,s.col,s.size]:v.change?.kind==='pop'?v.change.square:null;
 if(preview){const [row,col,size]=preview;ghost=`<rect class="t1240-ghost ${v.action==='pop'?'undo':''}" x="${25+col*cell}" y="${25+(v.n-row-size)*cell}" width="${size*cell-2}" height="${size*cell-2}" rx="4"/>`;}
 let plateau='';
 if(!step.final&&Number.isInteger(s.low)&&Number.isInteger(s.col)&&s.run>0)plateau=`<path class="t1240-plateau" d="M${24+s.col*cell},${24+(v.n-s.low)*cell}h${s.run*cell}"/>`;
 const bars=step.final?'':v.heights.map((height,c)=>`<g class="t1240-height ${v.change?.col===c?'active':''}" data-height-col="${c}" data-height="${height}"><rect x="${26+c*cell}" y="${32+v.n*cell}" width="${cell-4}" height="24" rx="4"/><text x="${24+(c+.5)*cell}" y="${49+v.n*cell}" text-anchor="middle">${height}</text></g>`).join('');
 const scene=`<div class="t1240-board-scroll"><svg class="t1240-board" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${t('Các hình vuông và chiều cao đã lấp của từng cột','Square placements and filled column heights')}"><rect class="t1240-frame" x="24" y="24" width="${v.m*cell}" height="${v.n*cell}"/>${pieces}${units}${background}${outlines}${plateau}${ghost}${bars}</svg></div>`;
 let operation='';
 if(v.change?.kind==='height')operation=`<code>heights[${v.change.col}]</code><b>${v.change.from}</b><strong>${v.action==='undo'?'↶':'→'}</strong><b>${v.change.to}</b>`;
 else if(v.change?.kind==='best')operation=`<code>best</code><b>${v.change.from}</b><strong>→</strong><b class="t1240-yes">${v.change.to} ✓</b>`;
 else if(v.action==='save')operation=`<code>placed[:]</code><strong>→</strong><b class="t1240-yes">best_layout ✓</b>`;
 else if(v.change?.square){const [row,col,size]=v.change.square;operation=`<strong>${v.action==='pop'?'↶':'+'}</strong><b>${size}×${size}</b><code>(${row},${col})</code>`;}
 else if(v.action==='limit')operation=`<code>min(run, n − low)</code><b>min(${s.run}, ${v.n-s.low}) = ${s.limit}</b>`;
 else if(step.final)operation=`<b class="t1240-yes">${v.best} ${t('hình vuông','squares')} ✓</b>`;
 const cut=v.action==='reject'||v.action==='prune'&&v.condition?.result;
 const prune=cut?`<div class="t1240-pruned"><b>${v.count} ≥ ${v.best}</b><strong>×</strong><small>${t('không thể tốt hơn best','cannot beat best')}</small></div>`:'';
 const condition=v.condition?`<div class="t1240-condition"><code>${v.condition.expression}</code><b class="${v.condition.result?'t1240-yes':'t1240-no'}">${v.condition.result?'True':'False'}</b></div>`:'';
 const sizes=Number.isInteger(s.limit)?Array.from({length:s.limit},(_,i)=>s.limit-i).map(size=>`<span class="t1240-size ${s.size===size&&!(v.action==='size'&&v.condition?.result===false)?'active':''}"><i style="width:${Math.max(16,size*7)}px;height:${Math.max(16,size*7)}px">${size}</i></span>`).join(''):'';
 const choices=sizes?`<section class="t1240-sizes"><small>size ↓</small><div>${sizes}</div></section>`:'';
 const mini=v.bestLayout.map(([row,col,size],i)=>`<rect x="${2+col*10}" y="${2+(v.n-row-size)*10}" width="${size*10}" height="${size*10}" style="--t-tone:${color(i)}"/>`).join('');
 const best=!step.final&&v.bestLayout.length?`<section class="t1240-best"><header><b>best_layout</b><small>${v.bestLayout.length} ${t('hình','squares')}${v.bestLayout.length!==v.best?' →':''}</small></header><svg viewBox="0 0 ${v.m*10+4} ${v.n*10+4}" role="img" aria-label="${t('Cách lát tốt nhất đã lưu','Saved best tiling')}">${mini}</svg></section>`:'';
 const filled=heights.reduce((a,b)=>a+b,0),metrics=`<div class="t1240-metrics"><span><small>${step.final?'best_layout':'placed'}</small><b>${layout.length}</b></span>${v.count!==null?`<span><small>count</small><b>${v.count}</b></span>`:''}<span><small>best</small><b class="t1240-yes">${s.best??'—'}</b></span><span><small>${t('diện tích','area')}</small><b>${filled}/${v.n*v.m}</b></span></div>`;
 const stack=v.stack.slice(-5).map(frame=>`<span>${frame.count}</span>`).join('<i>→</i>');
 const timeline=typeof steps==='undefined'?[]:steps,index=typeof stepIndex==='undefined'?-1:stepIndex;
 const jumps=[['append','+ □'],['undo','↶'],['reject','×'],['save','✓']].map(([action,label])=>{
  const target=timeline.findIndex((candidate,i)=>i>index&&candidate.tiling1240View?.action===action);
  return `<button type="button" data-t1240-jump="${action}" ${target<0?'disabled':''} aria-label="${t('Tới bước tiếp theo: ','Jump to next: ')}${action}" title="${action}">${label}</button>`;
 }).join('');
 host.innerHTML=`<section class="t1240-viz"><header><strong>${v.n}×${v.m} · ${t('ít hình vuông nhất','fewest squares')}</strong><small>${t('sau dòng','after line')} ${v.source.line}</small></header>${metrics}${step.final?`<div class="t1240-proof">best_layout · ${t('lát kín, không chồng lấn','fully covered, no overlap')} ✓</div>`:'<small class="t1240-caption">heights ↑</small>'}${scene}${operation?`<div class="t1240-operation">${operation}</div>`:''}${prune}${condition}${choices}${stack?`<div class="t1240-stack"><small>dfs(count)</small>${v.stack.length>5?'<i>…</i>':''}${stack}</div>`:''}${best}${!step.final?`<nav class="t1240-jumps"><small>${t('Tới bước','Jump to')}</small>${jumps}</nav>`:''}${v.omitted?`<small>${t('Đã thu gọn','Omitted')} ${v.omitted} ${t('bước · kết quả đầy đủ','steps · full result')}</small>`:''}</section>`;
 host.querySelectorAll?.('[data-t1240-jump]').forEach(button=>button.addEventListener('click',()=>{
  const target=steps.findIndex((candidate,i)=>i>stepIndex&&candidate.tiling1240View?.action===button.dataset.t1240Jump);
  if(target>=0){stepIndex=target;renderStep();}
 }));
}
