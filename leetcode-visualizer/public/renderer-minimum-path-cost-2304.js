'use strict';
function mp2304Text(vi,en){return typeof lang!=='undefined'&&lang==='vi'?vi:en;}
function mp2304Escape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function mp2304Cost(value){return value===null||value===undefined?'∞':String(value);}
function mp2304Path(parent,row,col){const out=[];for(let r=row,c=col;r>=0;r--){out.unshift([r,c]);if(r===0)break;const p=parent?.[r]?.[c];if(!Number.isInteger(p)||p<0)return[];c=p;}return out;}
function mp2304Sum(v,path){return path.reduce((sum,[r,c],i)=>sum+v.grid[r][c]+(i?v.moveCost[v.grid[path[i-1][0]][path[i-1][1]]][c]:0),0);}
function mp2304Card(label,body,cls=''){return `<section class="mp2304-card ${cls}"><header>${label}</header>${body}</section>`;}
function mp2304Scene(v,end){
  const selectedEnd=v.final&&Number.isInteger(end)&&end>=0&&end<v.cols?end:v.bestEnd;
  const path=v.final?mp2304Path(v.parent,v.rows-1,selectedEnd):v.candidatePath.length?v.candidatePath:v.prefixPath;
  const source=v.final?path.at(-2)??null:v.source,target=v.final?path.at(-1)??null:v.target;
  return {selectedEnd,path,source,target,routeCost:path.length?mp2304Sum(v,path):null};
}
function mp2304Diagram(v,scene,zoom){
  const width=Math.max(360,140+(v.cols-1)*130),height=140+(v.rows-1)*155;
  const point=([r,c])=>({x:70+c*(width-140)/(v.cols-1),y:70+r*155});
  const key=cell=>cell.join(':'),route=new Set(scene.path.map(key));
  const edge=(from,to,cls,label=null)=>{
    const a=point(from),b=point(to),mid=(a.y+b.y)/2,x=(a.x+b.x)/2;
    return `<path class="mp2304-edge ${cls}" d="M${a.x},${a.y+33} C${a.x},${mid} ${b.x},${mid} ${b.x},${b.y-39}" marker-end="url(#mp2304-${cls.includes('route')?'route':cls.includes('active')?'active':'arrow'})"/>${label===null?'':`<g class="mp2304-edge-label ${cls}"><rect x="${x-16}" y="${mid-12}" width="32" height="24" rx="8"/><text x="${x}" y="${mid+5}" text-anchor="middle">${label}</text></g>`}`;
  };
  let backdrop='';
  if(v.cols<=3)for(let r=0;r<v.rows-1;r++)for(let c=0;c<v.cols;c++)for(let next=0;next<v.cols;next++)backdrop+=edge([r,c],[r+1,next],'possible');
  let parents='';if(v.parent)for(let r=1;r<v.rows;r++)for(let c=0;c<v.cols;c++)if(v.parent[r][c]>=0)parents+=edge([r-1,v.parent[r][c]],[r,c],'parent');
  let fan='';if(scene.source){const [r,c]=scene.source;for(let j=0;j<v.cols;j++){const active=scene.target?.[1]===j;fan+=edge([r,c],[r+1,j],active?v.final?'route':'active':'fan',v.moveCost[v.grid[r][c]][j]);}}
  const routeEdges=scene.path.slice(1).map((to,i)=>edge(scene.path[i],to,!v.final&&v.candidate!==null&&v.phase!=='accept'&&i===scene.path.length-2?'active':'route',v.final?v.moveCost[v.grid[scene.path[i][0]][scene.path[i][1]]][to[1]]:null)).join('');
  const nodes=v.grid.flatMap((row,r)=>row.map((value,c)=>{
    const p=point([r,c]),source=scene.source?.[0]===r&&scene.source?.[1]===c,target=scene.target?.[0]===r&&scene.target?.[1]===c;
    const cost=v.dp?v.dp[r][c]:'—',pending=v.pendingParent&&v.target?.[0]===r&&v.target?.[1]===c;
    return `<button type="button" class="mp2304-cell ${route.has(key([r,c]))?'route':''} ${source?'source':''} ${target?'target':''} ${r<=v.readyRows?'settled':''} ${pending?'pending':''}" style="left:${100*p.x/width}%;top:${100*p.y/height}%;width:${100*68/width}%;height:${100*66/height}%" data-mp2304-cell="${r}:${c}" data-row="${r}" data-col="${c}" data-value="${value}" data-dp="${cost??'inf'}" aria-label="grid[${r},${c}] = ${value}; dp = ${mp2304Cost(cost)}"><small>[${r},${c}]</small><b>${value}</b><em>dp ${mp2304Cost(cost)}</em></button>`;
  })).join('');
  return `<div class="mp2304-scroll mp2304-board-scroll"><div class="mp2304-board ${zoom?'zoom':''}" style="--mp2304-native-width:${width}px;aspect-ratio:${width}/${height}"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${mp2304Text('Đi từ một hàng tới hàng kế tiếp','Move from one row to the next')}"><defs>${['arrow','active','route'].map(name=>`<marker id="mp2304-${name}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path class="${name}" d="M0,0 L10,5 L0,10 Z"/></marker>`).join('')}</defs>${v.grid.map((_,r)=>`<rect class="mp2304-row-band ${r<=v.readyRows?'ready':''}" x="8" y="${point([r,0]).y-45}" width="${width-16}" height="90" rx="16"/><text class="mp2304-row-label" x="15" y="${point([r,0]).y-28}">r${r}</text>`).join('')}${backdrop}${parents}${routeEdges}${fan}</svg><div class="mp2304-node-layer">${nodes}</div></div></div>`;
}
function mp2304Lookup(v,scene){
  if(!scene.source)return '';
  const [r,c]=scene.source,value=v.grid[r][c];
  return mp2304Card(`<b>moveCost[${value}][${scene.target?.[1]??'…'}]</b>`,
    `<div class="mp2304-lookup"><div class="mp2304-source-value"><small>${mp2304Text('giá trị ô đi','source cell value')}</small><b>${value}</b><small>grid[${r},${c}]</small></div><i>→</i><div class="mp2304-scroll"><div class="mp2304-move-row">${v.moveCost[value].map((cost,j)=>`<button type="button" data-mp2304-target="${j}" class="${scene.target?.[1]===j?'selected':''}" data-source-value="${value}" data-move-cost="${cost}"><small>${mp2304Text('cột','col')} ${j}</small><b>${cost}</b><span>↓ ${v.grid[r+1][j]}</span></button>`).join('')}</div></div></div>`);
}
function mp2304Equation(v){
  if(v.candidate===null||!v.source||!v.target)return '';
  const [r,c]=v.source,[nr,nc]=v.target,old=v.before;
  const term=(label,value,cls)=>`<span class="${cls}"><b>${value}</b><small>${label}</small></span>`;
  return mp2304Card(`[${r},${c}] → [${nr},${nc}]`,
    `<div class="mp2304-equation">${term('dp',v.dp[r][c],'blue')}<i>＋</i>${term('move',v.moveCost[v.grid[r][c]][nc],'gold')}<i>＋</i>${term('grid',v.grid[nr][nc],'purple')}<i>＝</i>${term(mp2304Text('ứng viên','candidate'),v.candidate,'result')}</div>`+
    `<div class="mp2304-decision"><span>${mp2304Cost(old)}<small>${mp2304Text('tốt nhất trước đó','previous best')}</small></span><i>vs</i><span>${v.candidate}<small>${mp2304Text('ứng viên','candidate')}</small></span><b class="${v.phase==='keep'?'keep':'improve'}">${v.phase==='keep'?'↶':v.phase==='accept'?'✓':'↓'}</b></div>`);
}
function mp2304Ledger(v,scene){
  if(!scene.path.length)return '';
  const path=scene.path,label=v.final?`${mp2304Text('Đường tới cột','Path to column')} ${scene.selectedEnd}`:v.candidate===null?mp2304Text('Đường tới ô đi','Path to the source'):mp2304Text('Đường ứng viên','Candidate path');
  return mp2304Card(label,`<div class="mp2304-scroll"><div class="mp2304-ledger">${path.map(([r,c],i)=>`${i?`<span class="mp2304-move-charge"><b>${v.moveCost[v.grid[path[i-1][0]][path[i-1][1]]][c]}</b><i>→</i></span>`:''}<span class="mp2304-path-cell" data-path-row="${r}" data-path-col="${c}" data-path-value="${v.grid[r][c]}"><small>[${r},${c}]</small><b>${v.grid[r][c]}</b></span>`).join('')}<i>＝</i><strong data-route-total="${scene.routeCost}">${scene.routeCost}</strong></div></div>`,'mp2304-route-card');
}
const MP2304_PRESETS=[
  {grid:[[5,3],[4,0],[2,1]],moveCost:[[9,8],[1,5],[10,12],[18,6],[2,4],[14,3]],label:['Ví dụ 17','Example 17']},
  {grid:[[5,1,2],[4,0,3]],moveCost:[[12,10,15],[20,23,8],[21,7,1],[8,1,13],[9,10,25],[5,3,2]],label:['Ví dụ 6','Example 6']},
  {grid:[[0,1],[2,3]],moveCost:[[50,50],[1,2],[100,100],[100,100]],label:['Ô nhỏ chưa chắc rẻ','Small cells can cost more']},
];
function renderMinimumPathCost2304(step){
  const host=$('treeView'),v=step.minPathCost2304View;if(!host||!v)return;
  const timeline=typeof steps!=='undefined'?steps:[step],index=typeof stepIndex==='number'?stepIndex:0,key=JSON.stringify([v.grid,v.moveCost]);
  const open=host.querySelector?.('.mp2304-details')?.open;
  if(host.dataset.mp2304KeyState!==key){host.dataset.mp2304KeyState=key;delete host.dataset.mp2304EndState;delete host.dataset.mp2304ZoomState;}
  const selected=host.dataset.mp2304EndState===undefined?v.bestEnd:Number(host.dataset.mp2304EndState),scene=mp2304Scene(v,selected),zoom=host.dataset.mp2304ZoomState==='1';
  const phases={setup:['Khởi tạo chi phí ô đầu','Initialize starting cell costs'],row:['Sang hàng kế tiếp','Advance to the next row'],source:['Chọn ô đi','Choose a source cell'],edge:['Chọn cột đến','Choose a destination column'],lookup:['Tra phí di chuyển','Look up the move cost'],candidate:['Cộng ba khoản chi phí','Add the three costs'],improve:['Ứng viên rẻ hơn','A cheaper candidate'],keep:['Giữ phương án cũ','Keep the previous route'],write:['Cập nhật dp','Update dp'],accept:['Lưu đường đi tốt hơn','Save the cheaper route'],'row-done':['Hàng này đã xong','This row is complete'],'rows-done':['Đã tới hàng cuối','Reached the final row'],result:['Chọn tổng nhỏ nhất ở hàng cuối','Choose the minimum in the last row']};
  const goButton=(at,role,icon,label)=>`<button type="button" data-mp2304-go="${at}" data-mp2304-control="${role}" aria-label="${label}" ${at<0||at>=timeline.length||at===index?'disabled':''}>${icon}</button>`;
  const controls=`<nav class="mp2304-play">${goButton(0,'first','↤',mp2304Text('Về đầu','First step'))}${goButton(index-1,'previous','←',mp2304Text('Bước trước','Previous step'))}<span>${index+1} / ${timeline.length}</span>${goButton(index+1,'next','→',mp2304Text('Bước tiếp','Next step'))}${goButton(timeline.length-1,'last','↦',mp2304Text('Tới cuối','Last step'))}</nav>`;
  const rows=`<nav class="mp2304-rows">${v.grid.map((_,r)=>`<button type="button" data-mp2304-row="${r}" class="${r<=v.readyRows?'ready':''}"><small>row ${r}</small><b>${r<=v.readyRows?'✓':'·'}</b></button>`).join('<i>→</i>')}</nav>`;
  const endChoices=v.final?mp2304Card(`<b>min = <strong class="mp2304-answer" data-min-answer="${v.answer}">${v.answer}</strong></b>`, `<nav class="mp2304-endings">${v.dp.at(-1).map((cost,j)=>`<button type="button" data-mp2304-end="${j}" class="${j===scene.selectedEnd?'selected':''} ${cost===v.answer?'best':''}"><small>${mp2304Text('cột','column')} ${j}</small><b>${cost}</b><em>${cost===v.answer?'🏆':'　'}</em></button>`).join('')}</nav>`):'';
  const table=`<div class="mp2304-scroll"><table class="mp2304-cost-table"><thead><tr><th>value ↓ / col →</th>${Array.from({length:v.cols},(_,j)=>`<th>${j}</th>`).join('')}</tr></thead><tbody>${v.moveCost.map((row,i)=>`<tr class="${scene.source&&v.grid[scene.source[0]][scene.source[1]]===i?'active':''}"><th>${i}</th>${row.map((cost,j)=>`<td>${cost}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  host.innerHTML=`<section class="mp2304-viz"><header class="mp2304-heading"><strong>${mp2304Text('Mỗi hàng chọn một ô','Choose one cell in each row')}</strong><small>#2304</small></header>${controls}${rows}<div class="mp2304-phase">${mp2304Text(...(phases[v.phase]||phases.source))}</div>${endChoices}${mp2304Card(`<b>grid</b><small>${mp2304Text('ô / dp: tổng tới ô','cell / dp: cost to reach it')}</small><button type="button" data-mp2304-zoom aria-pressed="${zoom}" aria-label="${mp2304Text(zoom?'Thu gọn sơ đồ':'Phóng to sơ đồ',zoom?'Fit diagram':'Enlarge diagram')}">${zoom?'−':'＋'}</button>`,mp2304Diagram(v,scene,zoom))}${mp2304Lookup(v,scene)}${mp2304Equation(v)}${mp2304Ledger(v,scene)}<details class="mp2304-details" ${open?'open':''}><summary>${mp2304Text('Bảng moveCost & dòng đang chạy','Full moveCost table & current line')}</summary><code>L${v.line} · ${mp2304Escape(v.sourceText)}</code>${table}</details><nav class="mp2304-presets">${MP2304_PRESETS.map((p,i)=>`<button type="button" data-mp2304-preset="${i}">${mp2304Text(...p.label)}</button>`).join('')}</nav></section>`;
  const stop=()=>{if(typeof stopPlay==='function')stopPlay();};
  const go=(at,selector)=>{if(at<0||at>=timeline.length)return;stop();stepIndex=at;renderStep();(host.querySelector(selector+':not(:disabled)')||host.querySelector('[data-mp2304-control="next"]'))?.focus({preventScroll:true});};
  host.querySelectorAll?.('button,summary').forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')e.stopPropagation();}));
  host.querySelectorAll?.('[data-mp2304-go]').forEach(el=>el.addEventListener('click',()=>go(Number(el.dataset.mp2304Go),`[data-mp2304-control="${el.dataset.mp2304Control}"]`)));
  host.querySelectorAll?.('[data-mp2304-row]').forEach(el=>el.addEventListener('click',()=>go(timeline.findIndex(s=>s.minPathCost2304View?.readyRows>=Number(el.dataset.mp2304Row)),`[data-mp2304-row="${el.dataset.mp2304Row}"]`)));
  const selectEnd=j=>{stop();host.dataset.mp2304EndState=String(j);stepIndex=timeline.length-1;renderStep();host.querySelector(`[data-mp2304-end="${j}"]`)?.focus({preventScroll:true});};
  host.querySelectorAll?.('[data-mp2304-end]').forEach(el=>el.addEventListener('click',()=>selectEnd(Number(el.dataset.mp2304End))));
  host.querySelectorAll?.('[data-mp2304-cell]').forEach(el=>el.addEventListener('click',()=>{const r=Number(el.dataset.row),c=Number(el.dataset.col);if(r===v.rows-1)selectEnd(c);else go(timeline.findIndex(s=>{const a=s.minPathCost2304View;return a?.line===8&&a.source?.[0]===r&&a.source?.[1]===c;}),`[data-mp2304-cell="${r}:${c}"]`);}));
  host.querySelectorAll?.('[data-mp2304-target]').forEach(el=>el.addEventListener('click',()=>go(timeline.findIndex(s=>{const a=s.minPathCost2304View;return a?.line===11&&a.source?.[0]===scene.source[0]&&a.source?.[1]===scene.source[1]&&a.target?.[1]===Number(el.dataset.mp2304Target);}),`[data-mp2304-target="${el.dataset.mp2304Target}"]`)));
  host.querySelector?.('[data-mp2304-zoom]')?.addEventListener('click',()=>{stop();host.dataset.mp2304ZoomState=zoom?'0':'1';renderMinimumPathCost2304(step);host.querySelector('[data-mp2304-zoom]')?.focus({preventScroll:true});});
  host.querySelectorAll?.('[data-mp2304-preset]').forEach(el=>el.addEventListener('click',async()=>{stop();const p=MP2304_PRESETS[Number(el.dataset.mp2304Preset)];$('arrInput').value=JSON.stringify(p.grid);$('param-moveCost').value=JSON.stringify(p.moveCost);await runViz();}));
  const lookup=host.querySelector?.('.mp2304-move-row .selected'),scroll=lookup?.closest('.mp2304-scroll');if(scroll){const a=scroll.getBoundingClientRect(),b=lookup.getBoundingClientRect();scroll.scrollLeft+=b.left-a.left-(a.width-b.width)/2;}
}
