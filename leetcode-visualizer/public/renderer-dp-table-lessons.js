'use strict';

function dtpText(vi,en){return typeof lang!=='undefined'&&lang==='vi'?vi:en;}
function dtpEscape(value){return String(value??'…').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function dtpValue(value){return typeof value==='boolean'?value?'✓':'×':value??'…';}
function dtpRoute(v,rank=0){
 const path=[],chosen=[],pairs=[];if(!v.dp||!v.final||!v.answer||v.id===1277)return {path,chosen,pairs};
 let row=v.dp.length-1,col=v.dp[0].length-1;
 while(row>0||v.id===1035&&col>0){
  path.push([row,col]);
  if(v.id===1035){
   if(!row||!col)break;
   if(v.items[row-1]===v.second[col-1]){pairs.push([row-1,col-1]);row--;col--;}
   else if(v.dp[row-1][col]>=v.dp[row][col-1])row--;else col--;
  }else{
   const skip=v.dp[row-1][col],take=v.id===416?!skip:rank>=skip;
   if(take){if(v.id!==416)rank-=skip;chosen.push(row-1);col-=v.items[row-1];if(v.id!==518)row--;}
   else row--;
   if(v.id===518&&col===0)break;
  }
 }
 path.push([row,col]);return {path,chosen:chosen.reverse(),pairs:pairs.reverse()};
}
function dtpBoard(v,path,zoom){
 if(!v.dp)return `<div class="dtp-wait">dp = …</div>`;
 const rows=v.dp.length,cols=v.dp[0].length,w=62+cols*48,pitch=v.id===416?62:44,h=34+rows*pitch,point=([r,c])=>({x:62+c*48+24,y:34+r*pitch+pitch/2}),chosen=new Set(path.map(cell=>cell.join(':'))),active=v.active?.join(':'),deps=new Map(v.neighbors.map(n=>[n.cell.join(':'),n.role]));
 const labels=v.id===1277?Array.from({length:rows},(_,r)=>String(r)):['∅',...v.items.map((n,i)=>`${i+1} · ${n}`)];
 const columns=v.id===1035?['∅',...v.second.map(String)]:Array.from({length:cols},(_,c)=>String(c));
 const arrows=v.active&&!v.final?v.neighbors.map(n=>{const a=point(n.cell),b=point(v.active),dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(!d)return '';const shape=v.id===416?`M${a.x},${a.y+22}V${(a.y+b.y)/2}H${b.x}V${b.y-22}`:`M${a.x+dx/d*17},${a.y+dy/d*17}L${b.x-dx/d*21},${b.y-dy/d*21}`;return `<path data-dtp-edge="${n.role}" class="${n.role==='take'?'take':'skip'}" d="${shape}" marker-end="url(#dtp-arrow-${n.role==='take'?'take':'skip'})"/>`;}).join(''):'';
 const cells=v.dp.flatMap((values,r)=>values.map((value,c)=>{const p=point([r,c]),key=`${r}:${c}`,role=deps.get(key);return `<button type="button" class="dtp-cell ${value===true||typeof value==='number'&&value>0?'positive':''} ${v.completed[r][c]?'settled':'initial'} ${key===active?'active':''} ${role?'dependency '+role:''} ${chosen.has(key)?'route':''}" style="left:${p.x/w*100}%;top:${p.y/h*100}%;width:${4000/w}%;height:${3600/h}%" data-dtp-cell="${key}" data-dtp-value="${value}" data-dtp-settled="${v.completed[r][c]}" aria-label="dp[${r}][${c}] = ${value}">${dtpValue(value)}</button>`;})).join('');
 return `<div class="dtp-scroll" data-dtp-scroll><div class="dtp-board ${zoom?'zoom':''}" style="--dtp-width:${w}px;--dtp-min:${62+cols*33}px;aspect-ratio:${w}/${h}"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${dtpText('Mũi tên từ ô nguồn tới ô đang tính','Arrows from source cells to the current cell')}"><defs>${['take','skip'].map(type=>`<marker id="dtp-arrow-${type}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z"/></marker>`).join('')}</defs>${arrows}</svg><span class="dtp-axis-corner">${v.id===1277?'r/c':v.id===1035?'nums1 / nums2':dtpText('đã xét / tổng','prefix / sum')}</span>${columns.map((label,c)=>`<span class="dtp-col-label" style="left:${point([0,c]).x/w*100}%" title="col=${c}">${label}</span>`).join('')}${labels.map((label,r)=>`<span class="dtp-row-label" style="top:${point([r,0]).y/h*100}%" title="row=${r}">${label}</span>`).join('')}${cells}</div></div>`;
}
function dtpSquarePicture(v,state){
 const grid=v.grid,rows=grid.length,cols=grid[0].length;
 let anchor=v.final?state.dtpAnchorState?state.dtpAnchorState.split(':').map(Number):null:v.active;
 if(!anchor||!grid[anchor[0]]||grid[anchor[0]][anchor[1]]===undefined){anchor=[0,0];if(v.dp)for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(v.dp[r][c]>v.dp[anchor[0]][anchor[1]])anchor=[r,c];}
 const k=v.dp?.[anchor[0]][anchor[1]]??0,size=v.final?Math.min(k,Number(state.dtpSizeState)||k):k;
 const members=[];for(let r=anchor[0]-size+1;r<=anchor[0];r++)for(let c=anchor[1]-size+1;c<=anchor[1];c++)members.push(`${r}:${c}`);
 const set=new Set(members),histogram=v.final?Array.from({length:Math.max(...v.dp.flat())},(_,i)=>v.dp.flat().filter(n=>n>i).length):[];
 return `<section class="dtp-card dtp-square"><header><b>matrix · 0/1</b><small>${dtpText('Chọn góc phải dưới','Select a bottom-right corner')}</small></header><div class="dtp-input-grid" style="grid-template-columns:repeat(${cols},1fr)">${grid.flatMap((row,r)=>row.map((value,c)=>`<button type="button" data-dtp-anchor="${r}:${c}" data-dtp-square-member="${set.has(`${r}:${c}`)}" class="${value?'one':'zero'} ${set.has(`${r}:${c}`)?'inside':''} ${anchor.join(':')===`${r}:${c}`?'corner':''}"><small>[${r},${c}]</small><b>${value}</b></button>`)).join('')}</div><div class="dtp-square-count"><b>dp[${anchor.join(',')}] = ${k}</b><span>→</span>${k?Array.from({length:k},(_,i)=>`<button type="button" data-dtp-size="${i+1}" aria-pressed="${size===i+1}" ${!v.final?'disabled':''}>${i+1}×${i+1}</button>`).join(''):'<b>0 □</b>'}</div>${histogram.length?`<div class="dtp-histogram">${histogram.map((count,i)=>`<span><b>${i+1}×${i+1}</b><i style="--dtp-count:${count/Math.max(...histogram)*100}%"></i><strong data-dtp-size-count="${i+1}">${count}</strong></span>`).join('')}</div>`:''}</section>`;
}
function dtpLinePicture(v,route,conflict){
 const n=Math.max(v.items.length,v.second.length),w=Math.max(280,n*62+20),x=(i,length)=>30+(w-60)*(length===1?.5:i/(length-1));
 let crossing=null;for(let a=0;a<v.items.length&&!crossing;a++)for(let b=0;b<v.second.length&&!crossing;b++)if(v.items[a]===v.second[b])for(let c=a+1;c<v.items.length&&!crossing;c++)for(let d=0;d<b;d++)if(v.items[c]===v.second[d]){crossing=[[a,b],[c,d]];break;}
 const probe=v.active&&v.active[0]>0&&v.active[1]>0?[v.active[0]-1,v.active[1]-1]:null;
 const pairs=v.final?conflict&&crossing?crossing:route.pairs:probe&&v.match?[probe]:[];
 return `<section class="dtp-card"><header><b>${dtpText('Số bằng nhau · giữ thứ tự','Equal values · keep the order')}</b>${crossing&&v.final?`<button type="button" data-dtp-conflict aria-pressed="${conflict}">${conflict?'✓ '+dtpText('Không giao','Uncrossed'):'× '+dtpText('Thử giao nhau','Try crossing')}</button>`:''}</header><svg class="dtp-lines ${conflict?'conflict':''}" viewBox="0 0 ${w} 168" role="img" aria-label="${dtpText('Hai dãy và các đường nối','Two sequences and their connecting lines')}">${pairs.map(([a,b],i)=>`<line data-dtp-pair="${a}:${b}" class="${!v.final?'candidate':''}" x1="${x(a,v.items.length)}" y1="49" x2="${x(b,v.second.length)}" y2="119" style="--dtp-order:${i%4}"/>`).join('')}${[v.items,v.second].map((values,layer)=>values.map((value,i)=>`<g class="${probe?.[layer]===i&&!v.final?'probe':''} ${pairs.some(pair=>pair[layer]===i)?'linked':''}" transform="translate(${x(i,values.length)},${layer?137:31})"><rect x="-20" y="-18" width="40" height="36" rx="8"/><text data-dtp-node="${layer}:${i}">${value}</text><text class="index" y="${layer?29:-23}">[${i}]</text></g>`).join('')).join('')}</svg><div class="dtp-caption">${v.final?conflict&&crossing?'× 2 '+dtpText('đường giao nhau → không hợp lệ','crossing lines → invalid'):`✓ ${v.answer} ${dtpText('đường không giao nhau','uncrossed lines')}`:`${probe?v.items[probe[0]]+' '+(v.match?'=':'≠')+' '+v.second[probe[1]]:'nums1 ↔ nums2'}`}</div></section>`;
}
function dtpFormula(v){
 if(!v.active||!v.dp||v.final)return '';
 const [row,col]=v.active,result=v.phase==='write'||v.phase==='base'?v.dp[row][col]:null;
 const out=`<strong data-dtp-result="${result??''}">${dtpValue(result)}</strong>`;
 if(v.phase==='base')return `<div class="dtp-equation">∅ → dp[${row},${col}] = ${out}</div>`;
 if(v.id===1277)return `<div class="dtp-equation">${v.grid[row][col]===0?'0 →':!row||!col?'1 →':`1 + min(${v.neighbors.map(n=>n.value).join(', ')}) =`} ${out}</div>`;
 if(v.id===1035)return `<div class="dtp-equation">${v.match?`${v.neighbors[0].value} ↘ + 1 =`:`max(${v.neighbors.map(n=>n.value).join(', ')}) =`} ${out}</div>`;
 const item=v.items[row-1],source=v.neighbors.find(n=>n.role==='take');
 return `<div class="dtp-branches"><span class="skip"><small>${v.id===494?'−'+item:dtpText('Bỏ','Skip')} · [${row-1},${col}]</small><b data-dtp-operand="skip" data-dtp-operand-value="${v.skip??''}">${dtpValue(v.skip)}</b></span><i>${v.id===416?'OR':'+'}</i><span class="take"><small>${v.id===494?'+'+item:dtpText('Lấy','Take')+' '+item} · ${source?'['+source.cell.join(',')+']':'∅'}</small><b data-dtp-operand="take" data-dtp-operand-value="${v.take??''}">${dtpValue(v.take)}</b></span><i>=</i>${out}</div>`;
}
const DTP_PRESETS={
1277:[{input:'0,1,1,1;1,1,1,1;0,1,1,1',label:['Mẫu · 15','Example · 15']},{input:'1,1,1;1,1,1;1,1,1',label:['Đủ ô 1 · 14','All ones · 14']},{input:'0,0;0,0',label:['Ô 0','Zero cells']}],
1035:[{input:[1,4,2],params:{nums2:'1,2,4'},label:['Mẫu · 2','Example · 2']},{input:[2,5,1,2,5],params:{nums2:'10,5,2,1,5,2'},label:['Số trùng · 3','Duplicates · 3']},{input:[1,2],params:{nums2:'3,4'},label:['Không trùng','No matches']}],
518:[{input:[1,2,5],params:{amount:5},label:['Mẫu · 4','Example · 4']},{input:[2],params:{amount:4},label:['Dùng 2 hai lần','Use 2 twice']},{input:[2],params:{amount:3},label:['Không tạo được','Unreachable']},{input:[1,2],params:{amount:0},label:['Tổng 0','Amount 0']}],
416:[{input:[1,5,11,5],label:['Mẫu · True','Example · True']},{input:[2,6],label:['Không dùng lại số 2','Do not reuse 2']},{input:[1,2,3,5],label:['Tổng lẻ','Odd total']}],
494:[{input:[1,1,1,1,1],params:{target:3},label:['Mẫu · 5','Example · 5']},{input:[0,0,1],params:{target:1},label:['Hai dấu cho số 0','Two signs for zero']},{input:[1,2,1],params:{target:-2},label:['Target âm','Negative target']},{input:[1],params:{target:0},label:['Không có cách','No solution']}],
};
function renderDPTableLesson(step){
 const host=$('treeView'),v=step.dpTableLessonView;if(!host||!v)return;
 const state=host.dataset,key=JSON.stringify([v.id,v.grid,v.items,v.second,v.target]);
 if(state.dtpKeyState!==key){state.dtpKeyState=key;for(const name of ['dtpRankState','dtpZoomState','dtpAnchorState','dtpSizeState','dtpConflictState'])delete state[name];}
 const timeline=typeof steps!=='undefined'?steps:[step],at=typeof stepIndex==='number'?stepIndex:0;
 const rank=v.final?Math.max(0,Math.min(Number(v.answer)-1,Number(state.dtpRankState)||0)):0,route=dtpRoute(v,rank),zoom=state.dtpZoomState==='1',open=host.querySelector?.('.dtp-source')?.open??false;
 const heading=v.id===1277?dtpText('Mỗi góc · đếm mọi cỡ vuông','Each corner · count every square size'):v.id===1035?dtpText('Nối số bằng nhau · không giao nhau','Connect equal numbers · no crossings'):v.id===518?dtpText('Bỏ xu ↓ · lấy xu → dùng lại','Skip ↓ · take → reuse a coin'):v.id===416?dtpText('Bỏ hoặc lấy · chia hai nhóm bằng nhau','Skip or take · split into equal groups'):dtpText('Chọn dấu + / − · đếm số cách','Choose + / − · count assignments');
 const chips=[1277,1035].includes(v.id)?'':`<div class="dtp-chips">${v.items.map((item,i)=>`<span class="${v.active?.[0]===i+1?'active':''}"><small>[${i}]</small><b>${v.id===518?'◉ ':''}${item}</b></span>`).join('')}</div>`;
 const reduction=v.id===494?`<div class="dtp-balance"><span>Σ ${v.total??'…'}</span><span>🎯 ${v.target}</span><b>P = ${v.positive??'…'}</b><small>P − (Σ − P) = target</small></div>`:v.id===416?`<div class="dtp-balance"><span>Σ ${v.total??'…'}</span><b>½ → ${v.target??'…'}</b></div>`:v.id===518?`<div class="dtp-balance"><b>🎯 ${v.target}</b><span>◉ × ∞</span></div>`:'';
 let proof='';
 if(v.final&&v.id!==1277&&v.id!==1035){
  if(!v.answer)proof=`<div class="dtp-caption">× ${dtpText('Không có cách thỏa mãn','No valid solution')}</div>`;
  else if(v.id===494){const set=new Set(route.chosen);proof=`<div class="dtp-witness">${v.items.map((n,i)=>`<b class="${set.has(i)?'take':'skip'}" data-dtp-sign="${set.has(i)?1:-1}">${set.has(i)?'+':'−'}${n}</b>`).join('')}<strong>= ${v.target}</strong></div>`;}
  else if(v.id===416){const set=new Set(route.chosen);proof=`<div class="dtp-witness"><span class="take">${route.chosen.map(i=>v.items[i]).join(' + ')} = ${v.target}</span><span class="skip">${v.items.filter((_,i)=>!set.has(i)).join(' + ')} = ${v.target}</span></div>`;}
  else proof=`<div class="dtp-witness">${route.chosen.length?route.chosen.map(i=>`<b class="dtp-coin" data-dtp-coin="${v.items[i]}">${v.items[i]}</b>`).join('<i>+</i>'):'∅'}<strong>= ${v.target}</strong></div>`;
  if(v.id!==416&&v.answer>1)proof+=`<nav class="dtp-rank"><button type="button" data-dtp-rank="${rank-1}" ${rank===0?'disabled':''}>←</button><input type="range" data-dtp-rank-range min="0" max="${v.answer-1}" value="${rank}" aria-label="${dtpText('Chọn cách tạo kết quả','Select a solution')}"><span>${rank+1}/${v.answer}</span><button type="button" data-dtp-rank="${rank+1}" ${rank===v.answer-1?'disabled':''}>→</button></nav>`;
 }
 const guards=v.final&&!v.dp?`<div class="dtp-equation dtp-infeasible">${v.id===416?`${v.total} % 2 = 1`:Math.abs(v.target)>v.total?`|${v.target}| &gt; ${v.total}`:`(${v.total} + ${v.target}) % 2 = 1`} → ×</div>`:'';
 const graph=v.id===1277?dtpSquarePicture(v,state):v.id===1035?dtpLinePicture(v,route,state.dtpConflictState==='1'):'';
 host.innerHTML=`<article class="dtp-viz" data-dtp-id="${v.id}" data-dtp-method="${v.method}" data-dtp-line="${v.line}"><header class="dtp-heading"><strong>${heading}</strong><small>#${v.id} · ${at+1}/${timeline.length}</small></header>${chips}${reduction}${guards}<div class="dtp-metrics"><span>${v.id===1277?'Σ '+dtpText('đã cộng','counted'):dtpText('Ô đã tính','Settled cells')} <b data-dtp-progress>${v.id===1277?v.total??'…':v.completed.flat().filter(Boolean).length}</b></span>${v.final?`<span>${dtpText('Kết quả','Answer')} <b data-dtp-answer="${v.answer}">${dtpValue(v.answer)}</b></span>`:''}</div>${v.id===1277?'<div class="dtp-grid-pair">':''}${graph}<section class="dtp-card"><header><b>dp[row][col]</b><small>${v.id===1277?dtpText('Cạnh lớn nhất · góc phải dưới','Largest side · bottom-right corner'):v.id===1035?dtpText('Số nối tốt nhất giữa hai prefix','Best lines between two prefixes'):dtpText('Hàng: số đã xét · cột: tổng','Row: processed items · column: sum')}</small><button type="button" data-dtp-zoom aria-pressed="${zoom}" aria-label="${dtpText('Phóng to / thu gọn','Enlarge / fit')}">${zoom?'−':'＋'}</button></header>${dtpBoard(v,route.path,zoom)}<div class="dtp-legend"><span class="skip">↘ ${v.id===1277||v.id===1035?dtpText('Ô nguồn','Source'):dtpText('Bỏ · hàng trước','Skip · previous row')}</span>${![1277,1035].includes(v.id)?`<span class="take">↗ ${v.id===518?dtpText('Lấy · cùng hàng','Take · same row'):dtpText('Lấy · hàng trước','Take · previous row')}</span>`:''}</div></section>${v.id===1277?'</div>':''}${dtpFormula(v)}${proof?`<section class="dtp-card">${proof}</section>`:''}<nav class="dtp-controls"><button type="button" data-dtp-control="first" ${at===0?'disabled':''}>↶</button><button type="button" data-dtp-control="previous" ${at===0?'disabled':''}>←</button><button type="button" data-dtp-control="line" ${v.final?'disabled':''}>${dtpText('Từng dòng','Next line')} →</button><button type="button" data-dtp-control="cell" ${v.final?'disabled':''}>${dtpText('Xong một ô','Finish cell')} ▣</button><button type="button" data-dtp-control="last" ${v.final?'disabled':''}>${dtpText('Kết quả','Result')} ⇥</button></nav><details class="dtp-source" ${open?'open':''}><summary>${dtpText('Công thức / code / biến','Formula / code / variables')}</summary><code>L${v.line} · ${dtpEscape(v.source)}</code><div>${step.vars.map(variable=>`<span>${variable.name} = <b>${dtpEscape(variable.value)}</b></span>`).join('')}</div></details><nav class="dtp-presets">${DTP_PRESETS[v.id].map((preset,i)=>`<button type="button" data-dtp-preset="${i}">${dtpText(...preset.label)}</button>`).join('')}</nav></article>`;
 const stop=()=>{if(typeof stopPlay==='function')stopPlay();},go=index=>{if(index<0||index>=timeline.length)return;stop();stepIndex=index;renderStep();},redraw=()=>{stop();renderDPTableLesson(step);};
 host.querySelectorAll?.('[data-dtp-control]').forEach(el=>el.addEventListener('click',()=>{const action=el.dataset.dtpControl;if(action==='first')return go(0);if(action==='previous')return go(at-1);if(action==='line')return go(at+1);if(action==='last')return go(timeline.length-1);const index=timeline.findIndex((s,i)=>i>at&&['write','base'].includes(s.dpTableLessonView?.phase));go(index<0?timeline.length-1:index);}));
 host.querySelectorAll?.('[data-dtp-cell]').forEach(el=>el.addEventListener('click',()=>{const [row,col]=el.dataset.dtpCell.split(':').map(Number),write=v.writes.find(w=>w.cell[0]===row&&w.cell[1]===col)??timeline.at(-1).dpTableLessonView.writes.find(w=>w.cell[0]===row&&w.cell[1]===col);go(write?.step??timeline.findIndex(s=>s.dpTableLessonView.phase==='allocate'));}));
 host.querySelectorAll?.('[data-dtp-anchor]').forEach(el=>el.addEventListener('click',()=>{state.dtpAnchorState=el.dataset.dtpAnchor;delete state.dtpSizeState;if(v.final)return redraw();const [row,col]=el.dataset.dtpAnchor.split(':').map(Number),index=timeline.findIndex(s=>s.dpTableLessonView.phase==='write'&&s.dpTableLessonView.active[0]===row&&s.dpTableLessonView.active[1]===col);go(index);}));
 host.querySelectorAll?.('[data-dtp-size]').forEach(el=>el.addEventListener('click',()=>{const size=+el.dataset.dtpSize;state.dtpSizeState=String(size);redraw();}));
 host.querySelector?.('[data-dtp-conflict]')?.addEventListener('click',()=>{state.dtpConflictState=state.dtpConflictState==='1'?'0':'1';redraw();});
 host.querySelector?.('[data-dtp-zoom]')?.addEventListener('click',()=>{state.dtpZoomState=zoom?'0':'1';redraw();});
 host.querySelectorAll?.('[data-dtp-rank]').forEach(el=>el.addEventListener('click',()=>{state.dtpRankState=el.dataset.dtpRank;redraw();}));
 host.querySelector?.('[data-dtp-rank-range]')?.addEventListener('input',e=>{state.dtpRankState=e.target.value;redraw();host.querySelector?.('[data-dtp-rank-range]')?.focus({preventScroll:true});});
 host.querySelectorAll?.('[data-dtp-preset]').forEach(el=>el.addEventListener('click',async()=>{stop();const preset=DTP_PRESETS[v.id][+el.dataset.dtpPreset];$('arrInput').value=Array.isArray(preset.input)?preset.input.join(','):preset.input;for(const [name,value] of Object.entries(preset.params??{}))$('param-'+name).value=value;await runViz();stop();}));
 host.querySelectorAll?.('button,input,summary').forEach(el=>el.addEventListener('keydown',event=>{if(['Enter',' ','ArrowLeft','ArrowRight'].includes(event.key))event.stopPropagation();}));
 const pane=host.querySelector?.('[data-dtp-scroll]'),cell=pane?.querySelector?.('.dtp-cell.active');if(pane&&cell)pane.scrollLeft=Math.max(0,cell.offsetLeft-pane.clientWidth/2+cell.clientWidth/2);
}
