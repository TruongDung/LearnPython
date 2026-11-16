'use strict';

function lp329Text(vi,en){return typeof lang!=='undefined'&&lang==='vi'?vi:en;}
function lp329Escape(value){return String(value??'…').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function lp329Same(a,b){return a&&b&&a[0]===b[0]&&a[1]===b[1];}
function lp329Inside(v,cell){return cell&&Number.isInteger(cell[0])&&Number.isInteger(cell[1])&&cell[0]>=0&&cell[0]<v.matrix.length&&cell[1]>=0&&cell[1]<v.matrix[0].length;}
function lp329MemoPath(v,start){
 if(!lp329Inside(v,start)||!v.dp?.[start[0]][start[1]])return [];
 const path=[];let cell=[...start];
 while(cell){
  path.push(cell);const[r,c]=cell;cell=null;
  for(const[dr,dc]of[[1,0],[-1,0],[0,1],[0,-1]]){
   const next=[r+dr,c+dc];
   if(lp329Inside(v,next)&&v.matrix[next[0]][next[1]]>v.matrix[r][c]&&v.dp[next[0]][next[1]]===v.dp[r][c]-1){cell=next;break;}
  }
 }
 return path;
}
function lp329Scene(v,state){
 const final=v.phase==='done';
 if(v.method===2){
  if(!final)return {path:v.path.map(cell=>[...cell]),cell:v.current,choice:null};
  const choice=state.lp329PathState?.split(':').map(Number),group=choice&&v.groups[choice[0]],picked=group?.paths[choice[1]];
  const path=picked??v.groups.find(group=>group.longest)?.paths[0]??[];
  return {path:path.map(cell=>[cell.r,cell.c]),cell:path.length?[path[0].r,path[0].c]:null,choice:picked?state.lp329PathState:null};
 }
 if(!final)return {path:v.stack.map(frame=>[frame.r,frame.c]),cell:v.current??v.root,choice:null};
 const choice=state.lp329CellState?.split(':').map(Number),cell=lp329Inside(v,choice)?choice:v.path[0]??[0,0];
 return {path:lp329MemoPath(v,cell),cell,choice:null};
}
function lp329Map(v,scene,memo,zoom,cursor){
 const rows=v.matrix.length,cols=v.matrix[0].length,gap=68,pad=8,width=cols*gap+2*pad,height=rows*gap+2*pad,point=([r,c])=>[pad+(c+.5)*gap,pad+(r+.5)*gap];
 const final=v.phase==='done',focus=final?scene.path[cursor]??scene.cell:v.current??v.root,path=new Map(scene.path.map((cell,i)=>[cell.join(':'),i+1]));
 let edges='';
 if(!memo){
  for(let i=1;i<scene.path.length;i++){
   const a=point(scene.path[i-1]),b=point(scene.path[i]),dx=(b[0]-a[0])/gap,dy=(b[1]-a[1])/gap;
   edges+=`<path class="lp329-edge ${final?'route':'dfs'}" d="M${a[0]+dx*24},${a[1]+dy*24} L${b[0]-dx*26},${b[1]-dy*26}" marker-end="url(#lp329-arrow-${final?'route':'dfs'})"/>`;
  }
  if(!final&&lp329Inside(v,v.current)&&lp329Inside(v,v.neighbor)){
   const a=point(v.current),b=point(v.neighbor),dx=(b[0]-a[0])/gap,dy=(b[1]-a[1])/gap,decided=['accept','reject','call','best-update'].includes(v.phase),ok=decided&&(v.condition===true||['call','best-update'].includes(v.phase));
   edges+=`<path class="lp329-edge candidate ${decided?ok?'route':'blocked':''}" d="M${a[0]+dx*24},${a[1]+dy*24} L${b[0]-dx*26},${b[1]-dy*26}" ${ok?'marker-end="url(#lp329-arrow-route)"':''}/>`;
   if(decided&&!ok)edges+=`<text class="lp329-edge-x" x="${(a[0]+b[0])/2}" y="${(a[1]+b[1])/2+4}">×</text>`;
  }
 }
 const cells=v.matrix.map((row,r)=>`<tr>${row.map((value,c)=>{
  const cell=[r,c],key=cell.join(':'),known=Boolean(v.dp?.[r][c]),number=memo?v.dp?.[r][c]??null:value,active=lp329Same(cell,focus),neighbor=!final&&lp329Same(cell,v.neighbor),cached=memo&&known&&lp329Same(cell,v.current)&&['cache-check','cache-return'].includes(v.phase),rank=path.get(key),disabled=memo&&!known;
  return `<td class="lp329-slot"><button type="button" class="lp329-cell ${active?'current':''} ${neighbor?'neighbor':''} ${rank?'path':''} ${memo&&known?'computed':''} ${cached?'cached':''} ${memo&&!known?'unknown':''}" ${memo?'data-lp329-memo':'data-lp329-cell'}="${key}" data-lp329-value="${number??''}" aria-label="${memo?'memo':'matrix'}[${r},${c}]: ${number??lp329Text('chưa tính','unknown')}" ${disabled?'disabled':''} ${active?'aria-current="step"':''} title="[${r},${c}] = ${number??'…'}"><small>${!memo&&rank?'#'+rank:`${r},${c}`}</small><b style="--lp-number-size:${Math.min(22,Math.max(8,42/(String(number??'').length*.65)))}px">${memo&&!known?'·':number}</b></button></td>`;
 }).join('')}</tr>`).join('');
 const markers=['route','dfs'].map(kind=>`<marker id="lp329-arrow-${kind}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M1,1 L7,4 L1,7 Z" fill="var(--lp-${kind==='route'?'green':'blue'})"/></marker>`).join('');
 return `<div class="lp329-map-scroll" data-lp329-scroll="${memo?'memo':'matrix'}"><div class="lp329-map ${zoom?'zoom':''}" style="--lp-map-number-size:${2200/width}cqw;--lp-pad-x:${800/width}%;--lp-pad-y:${800/height}%;--lp-map-width:${width}px;--lp-map-min:${cols>4?cols*42+16:0}px;aspect-ratio:${width}/${height}">${memo?'':`<svg viewBox="0 0 ${width} ${height}" aria-hidden="true"><defs>${markers}</defs>${edges}</svg>`}<table class="lp329-map-table" aria-label="${memo?lp329Text('Độ dài đường tăng bắt đầu từ mỗi ô','Increasing path length starting at each cell'):lp329Text('Giá trị ô và các bước đi kề nhau','Cell values and adjacent steps')}"><tbody>${cells}</tbody></table></div></div>`;
}
function lp329Route(v,scene,cursor){
 const final=v.phase==='done';
 if(!scene.path.length)return `<div class="lp329-route-empty">↑ ↓ ← → <span>${lp329Text('Chỉ nối sang số lớn hơn','Only move to a larger number')}</span></div>`;
 const title=final?lp329Text('Đường đang xem','Selected path'):lp329Text('Nhánh DFS đang thử','Current DFS branch');
 return `<section class="${final?'lip329-witness ':''}lp329-route"><header><small>${title}</small><b data-lp329-path-length="${scene.path.length}">${scene.path.length} ${lp329Text('ô','cells')}</b></header><div>${scene.path.map(([r,c],i)=>`${i?'<i>→</i>':''}<button type="button" data-lp329-visit="${i}" ${final?'':'disabled'} aria-pressed="${final&&cursor===i}" title="[${r},${c}]"><small>#${i+1}</small><b>${v.matrix[r][c]}</b></button>`).join('')}</div></section>`;
}
function lp329Proof(v,scene){
 const cell=scene.cell;
 if(v.method!==2&&v.phase==='done'&&lp329Inside(v,cell)){
  const[r,c]=cell,options=[[1,0,'↓'],[-1,0,'↑'],[0,1,'→'],[0,-1,'←']].map(([dr,dc,arrow])=>{const next=[r+dr,c+dc],inside=lp329Inside(v,next),allowed=inside&&v.matrix[next[0]][next[1]]>v.matrix[r][c];return {arrow,inside,allowed,value:inside?v.matrix[next[0]][next[1]]:null,need:allowed?v.dp[next[0]][next[1]]:null};});
  const lengths=options.filter(o=>o.allowed).map(o=>o.need),values=lengths.length?lengths:[0];
  return `<section class="lp329-proof"><header><small>memo[${r},${c}] · ${lp329Text('độ dài từ ô','length from value')} ${v.matrix[r][c]}</small></header><div class="lp329-neighbors">${options.map(o=>`<span class="${o.allowed?'allowed':'blocked'}"><i>${o.arrow}</i><b>${o.inside?o.value:'∅'}</b><small>${o.allowed?'✓ '+o.need+' '+lp329Text('ô','cells'):o.inside?'≤ '+v.matrix[r][c]:'×'}</small></span>`).join('')}</div><div class="lp329-formula">1 + max(${values.join(', ')}) = <b data-lp329-length="${v.dp[r][c]}">${v.dp[r][c]}</b></div></section>`;
 }
 const current=v.current,neighbor=v.neighbor;
 if(lp329Inside(v,current)&&neighbor){
  const inside=lp329Inside(v,neighbor),decided=['accept','reject','call','best-update'].includes(v.phase),allowed=decided&&(v.condition===true||['call','best-update'].includes(v.phase));
  const label=!decided?lp329Text('Đang kiểm tra','Checking'):allowed?lp329Text('Được đi','May move'):lp329Text('Bỏ qua','Skip');
  return `<section class="lp329-proof"><div class="lp329-compare ${decided?allowed?'allowed':'blocked':''}"><b>${v.matrix[current[0]][current[1]]}</b><i>→</i><b>${inside?v.matrix[neighbor[0]][neighbor[1]]:'∅'}</b><span>${label}${!inside?' · '+lp329Text('ngoài biên','outside'):''}</span></div>${v.calculation&&v.phase==='best-update'?`<div class="lp329-formula">max(${v.calculation.before}, 1 + ${v.calculation.child}) = <b>${v.calculation.after}</b></div>`:''}</section>`;
 }
 if(v.method!==2&&v.current&&['cache-check','cache-return'].includes(v.phase)&&v.dp?.[v.current[0]][v.current[1]])return `<div class="lp329-cache" data-lp329-cache-value="${v.dp[v.current[0]][v.current[1]]}">↩ memo[${v.current.join(',')}] = <b>${v.dp[v.current[0]][v.current[1]]}</b><small>${lp329Text('Dùng lại ngay','Reuse immediately')}</small></div>`;
 if(v.method!==2&&v.phase==='dp-write')return `<div class="lp329-save">✓ memo[${v.current.join(',')}] = <b>${v.dp[v.current[0]][v.current[1]]}</b></div>`;
 if(v.calculation){const x=v.calculation;return `<div class="lp329-formula">res = max(${x.before}, ${x.rootLength??x.length}) = <b>${x.after}</b></div>`;}
 return '';
}
function lp329Groups(v,open){
 if(v.method!==2)return '';
 const groups=v.groups.map((group,g)=>`<article class="${group.longest?'longest':''}"><header><b>${group.length} ${lp329Text('ô','cells')} · ${group.paths.length} ${lp329Text('đường','paths')}</b>${group.longest?`<b class="lip329-longest-tag">${lp329Text('Dài nhất','Longest')}</b>`:''}</header><div class="lp329-path-options">${group.paths.map((path,p)=>`<button type="button" data-lp329-path="${g}:${p}" ${v.phase==='done'?'':'disabled'} title="${path.map(cell=>`[${cell.r},${cell.c}]`).join(' → ')}">[${path.map(cell=>cell.value).join(' → ')}]</button>`).join('')}</div><details><summary>${lp329Text('Tọa độ từng đường','Coordinates of each path')}</summary><ol>${group.paths.map(path=>`<li>${path.map(cell=>`[${cell.r},${cell.c}]`).join(' → ')}</li>`).join('')}</ol></details></article>`).join('');
 return `<details class="lp329-all" ${open?'open':''}><summary>${v.count} ${lp329Text('đường · xem danh sách','paths · show full list')}</summary><div class="lip329-output">${groups||`<small>${lp329Text('Danh sách xuất hiện khi in các nhóm.','The list appears when groups are printed.')}</small>`}</div>${v.omitted?`<small>${v.omitted} ${lp329Text('bước gộp · danh sách cuối đầy đủ','condensed steps · final list complete')}</small>`:''}</details>`;
}
function renderLongestIncreasingPath329View(step){
 const v=step.longestIncreasingPath329View;if(!v)return;
 const host=typeof document!=='undefined'?document.getElementById('treeView'):$('treeView');if(!host)return;
 const state=host.dataset??{},method=v.method??1,final=v.phase==='done',key=JSON.stringify([method,v.matrix]);
 if(state.lp329KeyState!==key){state.lp329KeyState=key;delete state.lp329CellState;delete state.lp329PathState;delete state.lp329CursorState;delete state.lp329ZoomState;}
 const scene=lp329Scene(v,state),cursor=Math.min(Math.max(0,Number(state.lp329CursorState)||0),Math.max(0,scene.path.length-1)),zoom=state.lp329ZoomState==='1',debug=host.querySelector?.('.lp329-debug')?.open??false,all=host.querySelector?.('.lp329-all')?.open??false;
 const scrolls=Array.from(host.querySelectorAll?.('[data-lp329-scroll]')??[],el=>[el.dataset.lp329Scroll,el.scrollLeft]);
 const presets=[['9,9,4;6,6,8;2,1,1','Mẫu · 4 ô','Example · 4 cells'],['1,2,3;6,5,4','Zíc zắc · 6 ô','Snake · 6 cells'],['2,2;2,2','Bằng nhau · 1 ô','Equal · 1 cell'],['1,9;8,2','Không đi chéo','No diagonals'],['7','Một ô','One cell'],['-4,-3;-1,-2','Số âm','Negative values']];
 const source=typeof problemData!=='undefined'?(method===2?problemData.code2:problemData.code)?.[step.codeLines[0]-1]:null;
 const title=typeof step.title==='object'?step.title[typeof lang!=='undefined'?lang:'en']:step.title,note=typeof step.note==='object'?step.note[typeof lang!=='undefined'?lang:'en']:step.note;
 const stack=method===1?v.stack.map(frame=>`<span class="${frame.waiting?'waiting':''}">[${frame.r},${frame.c}] <b>${frame.best??'·'}</b></span>`).join('<i>→</i>'):'';
 host.innerHTML=`<section class="lip329-viz lip329-picture" data-method="${method}" data-phase="${v.phase}"><header class="lp329-heading"><small>329 · ${method===1?'DFS + MEMO':'DFS + BACKTRACKING'}</small><h3>${lp329Text('Đi sang số lớn hơn · đếm số ô','Move to larger numbers · count cells')}</h3><div class="lp329-rules"><span>↑ ↓ ← →</span><small>${lp329Text('Không đi chéo · không nối hai số bằng nhau','No diagonals · no equal-value moves')}</small></div></header><nav class="lp329-presets">${presets.map(([input,vi,en],i)=>`<button type="button" data-lp329-preset="${i}">${lp329Text(vi,en)}</button>`).join('')}</nav><div class="lp329-metrics"><div><small>${final?lp329Text('Dài nhất','Longest'):lp329Text('Dài nhất hiện tại','Longest so far')}</small><b data-lp329-answer="${v.res??''}">${v.res??'…'} <small>${lp329Text('ô','cells')}</small></b></div><div><small>${method===1?lp329Text('Ô đã lưu memo','Memo cells saved'):lp329Text('Số đường đã tìm','Paths found')}</small><b>${method===1?`${v.writes}/${v.matrix.length*v.matrix[0].length}`:v.count}</b></div>${method===1?`<div><small>${lp329Text('Lần dùng lại','Cache hits')}</small><b>${v.cacheHits}</b></div>`:''}</div><div class="lp329-grids ${method===2?'single':''}"><section class="lp329-card"><header><b>${lp329Text('Giá trị ô','Cell values')}</b><button type="button" data-lp329-zoom aria-pressed="${zoom}" aria-label="${lp329Text('Phóng to / thu gọn grid','Enlarge / fit grids')}">${zoom?'−':'＋'}</button></header>${lp329Map(v,scene,false,zoom,cursor)}</section>${method===1?`<section class="lp329-card"><header><b>memo · ${lp329Text('độ dài từ ô','length from cell')}</b></header>${lp329Map(v,scene,true,zoom,cursor)}</section>`:''}</div><div class="lp329-legend"><span class="blue">□ DFS</span><span class="orange">□ ${lp329Text('Ô kề','Neighbor')}</span><span class="green">→ ${lp329Text('Đường tăng','Increasing path')}</span>${method===1?'<span class="purple">↩ memo</span>':''}</div>${lp329Route(v,scene,cursor)}${lp329Proof(v,scene)}${final&&method===1?`<small class="lp329-hint">${lp329Text('Bấm ô ở một trong hai grid để đổi điểm bắt đầu.','Select a cell in either grid to change the starting point.')}</small>`:''}<footer class="lp329-controls"><button type="button" data-lp329-control="first">↶ ${lp329Text('Đầu','First')}</button><button type="button" data-lp329-control="event">${lp329Text('Bước chính','Next event')} →</button>${method===1?`<button type="button" data-lp329-control="cache">↩ memo</button>`:''}<button type="button" data-lp329-control="last">${lp329Text('Kết quả','Result')} ⇥</button></footer>${lp329Groups(v,all)}<details class="lp329-debug" ${debug?'open':''}><summary>${lp329Text('Code / stack / biến đang chạy','Code / stack / live variables')}</summary><code>L${step.codeLines.join(',')} · ${lp329Escape(source??title)}</code><small>${lp329Escape(note)}</small><div class="lp329-stack">${stack}</div><div class="lp329-vars">${(step.vars??[]).map(x=>`<span>${lp329Escape(x.name)} = <b>${lp329Escape(typeof x.value==='object'?JSON.stringify(x.value):x.value)}</b></span>`).join('')}</div><button type="button" data-lp329-control="line">${lp329Text('Từng dòng','Next line')} →</button></details></section>`;
 const stop=()=>{if(typeof stopPlay==='function')stopPlay();},go=index=>{if(typeof steps==='undefined'||index<0||index>=steps.length)return;stop();stepIndex=index;renderStep();},redraw=()=>{stop();renderLongestIncreasingPath329View(step);};
 host.querySelectorAll?.('[data-lp329-control]').forEach(el=>el.addEventListener('click',()=>{
  const action=el.dataset.lp329Control;if(action==='first')return go(0);
  if(action==='last'){delete state.lp329CellState;delete state.lp329PathState;delete state.lp329CursorState;return go(steps.length-1);}
  if(action==='line')return go(Math.min(stepIndex+1,steps.length-1));
  const phases=action==='cache'?['cache-return']:method===1?['accept','reject','best-update','dp-write','cache-return']:['record','res-update','pop','call'];
  const index=steps.findIndex((s,i)=>i>stepIndex&&phases.includes(s.longestIncreasingPath329View?.phase));go(index<0?steps.length-1:index);
 }));
 host.querySelectorAll?.('[data-lp329-cell],[data-lp329-memo]').forEach(el=>el.addEventListener('click',()=>{
  const key=el.dataset.lp329Cell??el.dataset.lp329Memo,cell=key.split(':').map(Number);
  if(final&&method===1){state.lp329CellState=key;delete state.lp329CursorState;redraw();return;}
  if(final)return;
  const index=steps.findIndex(s=>{const view=s.longestIncreasingPath329View;return el.hasAttribute('data-lp329-memo')?view?.phase==='dp-write'&&lp329Same(view.current,cell):view?.phase==='root'&&lp329Same(view.root,cell);});go(index);
 }));
 host.querySelectorAll?.('[data-lp329-visit]').forEach(el=>el.addEventListener('click',()=>{state.lp329CursorState=el.dataset.lp329Visit;redraw();}));
 host.querySelectorAll?.('[data-lp329-path]').forEach(el=>el.addEventListener('click',()=>{state.lp329PathState=el.dataset.lp329Path;delete state.lp329CursorState;redraw();}));
 host.querySelector?.('[data-lp329-zoom]')?.addEventListener('click',()=>{state.lp329ZoomState=zoom?'0':'1';redraw();});
 host.querySelectorAll?.('[data-lp329-preset]').forEach(el=>el.addEventListener('click',async()=>{document.getElementById('arrInput').value=presets[Number(el.dataset.lp329Preset)][0];await runViz();stop();}));
 host.querySelectorAll?.('button,summary').forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')e.stopPropagation();}));
 for(const[key,left]of scrolls){const el=host.querySelector?.(`[data-lp329-scroll="${key}"]`);if(el)el.scrollLeft=left;}
}
function renderLongestIncreasingPaths329View(step){renderLongestIncreasingPath329View(step);}
