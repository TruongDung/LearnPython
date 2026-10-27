function renderWordSearch79Pictures(step) {
 const host=$('treeView'),v=step.wordSearchView;
 if(!host||!v)return;
 const t=(vi,en)=>lang==='vi'?vi:en;
 const esc=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const same=(a,b)=>a&&b&&a.r===b.r&&a.c===b.c;
 const success=v.winningPath.length>0,path=success?v.winningPath:v.activePath;
 const width=Math.min(470,Math.max(220,(host.clientWidth||550)-24));
 const cell=Math.min(66,(width-48)/v.cols),w=v.cols*cell+48,h=v.rows*cell+48;
 const center=p=>({x:24+(p.c+.5)*cell,y:24+(p.r+.5)*cell});
 const inside=p=>p&&p.r>=0&&p.r<v.rows&&p.c>=0&&p.c<v.cols;
 const pointList=path.map(p=>{const c=center(p);return `${c.x},${c.y}`;}).join(' ');
 let grid='';
 for(let c=0;c<v.cols;c++)grid+=`<text class="ws79-axis" x="${24+(c+.5)*cell}" y="15" text-anchor="middle">${c}</text>`;
 for(let r=0;r<v.rows;r++){
  grid+=`<text class="ws79-axis" x="13" y="${24+(r+.5)*cell+4}" text-anchor="middle">${r}</text>`;
  for(let c=0;c<v.cols;c++){
   const p={r,c},order=path.findIndex(q=>same(p,q)),marked=v.board[r][c]==='#';
   const current=same(p,v.current)&&!step.final,rejected=current&&['mismatch','reused'].includes(v.reason),restored=same(p,v.restored);
   const cls=[order>=0?'matched':'',marked?'marked':'',current?'current':'',rejected?'rejected':'',restored?'restored':''].join(' ');
   grid+=`<g class="ws79-cell ${cls}" data-cell="${r},${c}" data-value="${esc(v.board[r][c])}"><rect x="${24+c*cell+3}" y="${24+r*cell+3}" width="${cell-6}" height="${cell-6}" rx="8"/><text class="ws79-letter" x="${24+(c+.5)*cell}" y="${24+(r+.5)*cell+7}" text-anchor="middle" style="font-size:${Math.min(26,cell*.48)}px">${esc(v.board[r][c])}</text>${order>=0?`<text class="ws79-order" x="${24+c*cell+8}" y="${24+r*cell+14}">${order+1}</text>`:''}${marked?`<text class="ws79-original" x="${24+(c+1)*cell-9}" y="${24+(r+1)*cell-8}" text-anchor="end">${esc(v.original[r][c])}</text>`:''}</g>`;
  }
 }
 let arrow='';
 const liveDirection=v.action==='direction'&&v.condition?.result!==false&&inside(v.current);
 const to=liveDirection?{r:v.current.r+v.locals.dr,c:v.current.c+v.locals.dc}:null;
 if(to){const a=center(v.current),b=center(to);b.x=Math.max(8,Math.min(w-8,b.x));b.y=Math.max(8,Math.min(h-8,b.y));arrow=`<path class="ws79-arrow" d="M${a.x},${a.y}L${b.x},${b.y}" marker-end="url(#ws79-arrow-head)"/>`;}
 const out=v.reason==='outside'?`<text class="ws79-out" x="${w/2}" y="${h-4}" text-anchor="middle">(${v.current.r}, ${v.current.c}) × ${t('ngoài bảng','outside')}</text>`:'';
 const progress=success?v.word.length:v.activePath.length;
 const chips=[...v.word].map((ch,i)=>`<span class="ws79-chip ${i<progress?'done':''} ${!success&&v.stack.length&&i===v.index?'target':''} ${v.missing[ch]?'missing':''}"><small>${i}</small><b>${esc(ch)}</b>${i<progress?'<em>✓</em>':''}</span>`).join('');
 let operation='';
 if(v.change)operation=`<small>board[${v.change.r}][${v.change.c}]</small><b>${esc(v.change.from)}</b><span>${v.action==='restore'?'↶':'→'}</span><b>${esc(v.change.to)}</b>`;
 else if((v.action==='check-letter'||v.action==='reject')&&inside(v.current)&&v.index<v.word.length){const actual=v.board[v.current.r][v.current.c],expected=v.word[v.index];operation=`<b>${esc(actual)}</b><span>${actual===expected?'=':'≠'}</span><b>${esc(expected)}</b><strong>${actual===expected?'✓':'×'}</strong>${actual==='#'?`<small>${t('ô đã dùng','already used')}</small>`:''}`;}
 else if(v.action==='save')operation=`<small>saved =</small><b>${esc(v.locals.saved)}</b>`;
 else if(liveDirection)operation=`<b>${v.locals.dr===1?'↓':v.locals.dr===-1?'↑':v.locals.dc===1?'→':'←'}</b><span>(${v.current.r},${v.current.c}) → (${to.r},${to.c})</span>`;
 else if(v.action==='child-result'||v.action==='check-found')operation=`<small>found =</small><b class="${v.locals.found?'yes':'no'}">${v.locals.found?'True ✓':'False ×'}</b>`;
 else if(step.final)operation=`<b class="${v.result?'yes':'no'}">${v.result?'True ✓':'False ×'}</b>`;
 const counts=['count-board','count-word','check-counts'].includes(v.action)||v.reason==='count';
 const countCards=counts&&v.available?Object.keys(v.needed||v.available).map(ch=>`<span class="${v.missing[ch]?'missing':''}"><b>${ch}</b><small>${v.needed?`${v.needed[ch]||0} / `:''}${v.available[ch]||0}</small>${v.missing[ch]?'×':''}</span>`).join(''):'';
 const condition=v.condition?`<div class="ws79-condition"><code>${esc(v.condition.expression)}</code><b class="${v.condition.result?'yes':'no'}">${v.condition.result?'True':'False'}</b></div>`:'';
 const stack=v.stack.slice(-4).map(frame=>`<span>(${frame.r},${frame.c},${frame.i})</span>`).join('<i>→</i>');
 host.innerHTML=`<section class="ws79-viz"><header><strong>${esc(step.title[lang]||step.title.en)}</strong><span>${v.source.scope} · ${t('sau dòng','after line')} ${v.source.line}</span></header><div class="ws79-word"><small>word</small><div>${chips}</div></div><figure><svg class="ws79-board" viewBox="0 0 ${w} ${h}" role="img" aria-label="${t('Bàn cờ và đường đi tìm từ','Word search board and path')}"><defs><marker id="ws79-arrow-head" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0L5,2.5L0,5Z"/></marker></defs>${grid}<polyline class="ws79-route" points="${pointList}"/>${arrow}${out}</svg><figcaption><span class="yes">● ${t('đường đi','path')}</span><span class="ws79-blue">▣ ${t('ô đang xét','current cell')}</span><span># ${t('đang dùng','in use')}</span><span>↶ ${t('khôi phục','restore')}</span></figcaption></figure>${operation?`<div class="ws79-operation">${operation}</div>`:''}${countCards?`<div class="ws79-counts"><small>${t('cần / có','need / have')}</small><div>${countCards}</div></div>`:''}${condition}${stack?`<div class="ws79-stack"><small>dfs(r,c,i)</small>${v.stack.length>4?'<i>…</i>':''}${stack}</div>`:''}${step.final&&success?`<div class="ws79-complete">${t('Đủ chữ · bảng đã khôi phục','Word complete · board restored')} ✓</div>`:''}${v.omitted?`<small class="ws79-truncated">${t('Đã thu gọn','Omitted')} ${v.omitted} ${t('bước · kết quả đầy đủ','steps · full result')}</small>`:''}</section>`;
}
