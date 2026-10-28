function renderCatMouse1728Pictures(step){
 const host=$('treeView'),v=step.catMouse1728View;if(!host||!v)return;
 const t=(vi,en)=>lang==='vi'?vi:en,icon=turn=>turn===0?'🐭':'🐱',key=state=>state.join(','),pointId=id=>({r:Math.floor(id/v.cols),c:id%v.cols});
 const final=step.final,sameFrame=host.dataset?.cat1728Frame===String(v.frame);
 let game=[v.mouse,v.cat,0],history=[];
 if(final&&sameFrame&&host.dataset.cat1728State){try{game=JSON.parse(host.dataset.cat1728State);history=JSON.parse(host.dataset.cat1728History||'[]');}catch(_){game=[v.mouse,v.cat,0];history=[];}}
 if(host.dataset){host.dataset.cat1728Frame=String(v.frame);if(final){host.dataset.cat1728State=JSON.stringify(game);host.dataset.cat1728History=JSON.stringify(history);}}
 const wins=final?new Map(v.analysis.wins.map(([m,c,turn,rank])=>[`${m},${c},${turn}`,rank])):null;
 const helper=v.helper,active=final?game:v.active,turn=helper?v.owner:active[2],actor=helper?helper.p:active[turn],mouse=helper?v.owner===0?helper.p:null:active[0],cat=helper?v.owner===1?helper.p:null:active[1];
 const catTerminal=active[0]===active[1]||active[1]===v.food,mouseTerminal=!catTerminal&&active[0]===v.food,timeout=final&&history.length>=1000&&!mouseTerminal;
 const remaining=final?Math.max(0,1000-history.length):1000,stopped=final&&(catTerminal||mouseTerminal||timeout),rank=final?wins.get(key(active))??null:v.rank;
 const canWin=rank!==null&&rank<=remaining;
 let choices=final?stopped?[]:(turn===0?v.analysis.mouseMoves[active[0]]:v.analysis.catMoves[active[1]]).map(to=>{const state=turn===0?[to,active[1],1]:[active[0],to,0];return{to,state,rank:wins.get(key(state))??null,catTerminal:state[0]===state[1]||state[1]===v.food};}):v.choices;
 choices=choices.map(choice=>({...choice,canMouseWin:choice.rank!==null&&choice.rank<remaining,tooLate:choice.rank!==null&&choice.rank>=remaining}));
 if(!helper&&(catTerminal||mouseTerminal||timeout))choices=[];
 const legal=helper?v.legal:choices.map(choice=>choice.to),choiceById=new Map(choices.map(choice=>[choice.to,choice]));
 const size=Math.max(34,Math.min(62,(Math.max(220,(host.clientWidth||550)-24)-48)/v.cols,320/v.rows)),width=48+v.cols*size,height=48+v.rows*size;
 const center=id=>{const p=pointId(id);return{x:24+(p.c+.5)*size,y:24+(p.r+.5)*size};};
 let cells='';
 for(let c=0;c<v.cols;c++)cells+=`<text class="cm1728-axis" x="${24+(c+.5)*size}" y="15" text-anchor="middle">${c}</text>`;
 for(let r=0;r<v.rows;r++){
  cells+=`<text class="cm1728-axis" x="13" y="${24+(r+.5)*size+4}" text-anchor="middle">${r}</text>`;
  for(let c=0;c<v.cols;c++){
   const id=r*v.cols+c,wall=v.grid[r][c]==='#',m=id===mouse,catHere=id===cat,food=id===v.food,possible=legal.includes(id),choice=choiceById.get(id);
   const outcome=choice?.catTerminal||choice?.tooLate?'cat':choice?.canMouseWin?'mouse':final&&choice?'cat':'unknown';
   const cls=[wall?'wall':'',possible?'legal':'',possible?outcome:'',id===actor?'actor':'',helper?.nr===r&&helper?.nc===c?'probe':''].join(' ');
   const occupant=m&&catHere?'🐱':m?'🐭':catHere?'🐱':food?'🧀':wall?'▧':'';
   cells+=`<g class="cm1728-cell ${cls}" data-cell="${id}" ${final&&possible?`data-cm1728-move="${id}" role="button" tabindex="0" aria-label="${icon(turn)} → (${r},${c})"`:''}><rect x="${27+c*size}" y="${27+r*size}" width="${size-6}" height="${size-6}" rx="7"/>${!wall?`<text class="cm1728-id" x="${30+c*size}" y="${37+r*size}">${id}</text>`:''}<text class="cm1728-token" x="${24+(c+.5)*size}" y="${24+(r+.5)*size+size*.17}" text-anchor="middle" style="font-size:${Math.min(30,size*.62)}px">${occupant}</text>${food&&(m||catHere)?`<text class="cm1728-food" x="${24+(c+1)*size-9}" y="${24+(r+1)*size-7}" text-anchor="end">🧀</text>`:''}${m&&catHere?`<text class="cm1728-food" x="${29+c*size}" y="${24+(r+1)*size-7}">🐭</text>`:''}${possible&&id===actor?`<text class="cm1728-stay" x="${24+(c+1)*size-8}" y="${35+r*size}" text-anchor="end">↺</text>`:''}</g>`;
  }
 }
 let arrow='';
 const parent=final?null:v.parent,child=final?null:v.child;
 const parentFocused=parent&&key(parent)===key(active)&&v.phase==='solve';
 let target=parentFocused&&child?child[turn]:null;
 if(helper&&Number.isInteger(helper.nr))target=helper.nr>=0&&helper.nr<v.rows&&helper.nc>=0&&helper.nc<v.cols?helper.nr*v.cols+helper.nc:null;
 if(target!==null&&target!==actor){const a=center(actor),b=center(target);arrow=`<path class="cm1728-arrow ${helper&&v.condition?.result&&v.event==='wall'?'blocked':''}" d="M${a.x},${a.y}L${b.x},${b.y}" marker-end="url(#cm1728-arrow)"/>`;}
 const board=`<div class="cm1728-board-scroll"><svg class="cm1728-board" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${t('Bàn cờ mèo, chuột, thức ăn và ô có thể nhảy','Cat, mouse, food and legal jump destinations')}"><defs><marker id="cm1728-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0L5,2.5L0,5Z"/></marker></defs>${cells}${arrow}</svg></div>`;
 const phaseLabel=final?t('Thử nước · kết quả code ở dòng 51','Try moves · code result stays on line 51'):helper?t('Dựng nước nhảy','Build legal jumps'):v.phase==='seed'?t('Chuột ở F → trạng thái đã thắng','Mouse at F → known win'):v.phase==='solve'?t('BFS ngược: trạng thái trước → sau','Reverse BFS: predecessor → successor'):t('Chuẩn bị bàn cờ','Prepare board');
 const knownLabel=helper?'':catTerminal||timeout?`<b class="cat">🐱 ✓</b>`:mouseTerminal?'<b class="mouse">🐭 ✓ · F</b>':canWin?`<b class="mouse">🐭 ✓ · ≤${rank} ${t('lượt','turns')}</b>`:final?`<b class="cat">🐱 ${t('ngăn được chuột tới F','can prevent Mouse from winning')}</b>`:'<b>?</b>';
 const initial=final?`<div class="cm1728-initial ${v.answer?'mouse':'cat'}">${t('Ban đầu, chơi tối ưu','Initial optimal-play result')}: ${v.answer?'True · 🐭 ✓':'False · 🐱 ✓'}</div>`:'';
 const heading=`<div class="cm1728-turn"><strong>${!helper&&(catTerminal||mouseTerminal||timeout)?'🏁 '+t('kết thúc','finished'):icon(turn)+' '+(helper?t('bước nhảy','jumps'):t('tới lượt','to move'))}</strong><span>🐭 ${v.mouseJump} · 🐱 ${v.catJump}</span></div><div class="cm1728-status">${knownLabel}${final?`<small>${history.length} / 1000 ${t('lượt','turns')}</small>`:''}</div>`;
 const choiceCards=helper?'':choices.map(choice=>`<${final?'button type="button"':'span'} class="cm1728-choice ${choice.catTerminal||choice.tooLate?'cat':choice.canMouseWin?'mouse':final?'cat':'unknown'} ${choice.eliminated?'eliminated':''}" ${final?`data-cm1728-move="${choice.to}"`:''} data-option="${choice.to}"><b>${choice.to===actor?'↺':choice.to}</b><small>${choice.catTerminal||choice.tooLate?'🐱✓':choice.canMouseWin?'🐭✓':final?'🐱✓':'?'}</small></${final?'button':'span'}>`).join('');
 const rule=!helper&&choices.length?`<section class="cm1728-rule"><header><b>${turn===0?'🐭 · '+t('một nước thắng là đủ','one winning choice suffices'):'🐱 · '+t('mọi nước đều phải thua','all choices must lose')}</b>${parentFocused&&turn===1?`<small>degree = ${v.projection.parentDegree} · ${t('chưa loại','not eliminated')}</small>`:''}</header><div>${choiceCards}</div></section>`:'';
 const condition=v.condition&&!final?`<div class="cm1728-condition"><code>${v.condition.expression}</code><b class="${v.condition.result?'mouse':'cat'}">${v.condition.result?'True':'False'}</b></div>`:'';
 let operation='';
 if(v.change?.kind==='degree'&&!final)operation=`<div class="cm1728-operation"><code>degree</code><b>${v.change.from} → ${v.change.to}</b></div>`;
 if(v.change?.kind==='win'&&!final)operation=`<div class="cm1728-operation mouse"><b>🐭 ✓</b><code>win[${v.change.state.join(',')}] = ${v.change.rank}</code></div>`;
 const stateBadge=state=>`<span>🐭${state[0]} 🐱${state[1]} <b>${icon(state[2])}</b></span>`;
 const transition=parentFocused&&child?`<div class="cm1728-transition">${stateBadge(parent)}<strong>→</strong>${stateBadge(child)}<b class="mouse">✓</b></div>`:'';
 const queue=!final&&v.projection.queueLength!==null?`<section class="cm1728-queue"><header><b>queue</b><small>${v.projection.queueLength} ${v.projection.queueLength>6?'· '+t('xem 6 đầu','first 6'):''}</small></header><div>${v.projection.queueHead.map(stateBadge).join('')||'∅'}</div></section>`:'';
 const stats=!final&&v.projection.winCount!==null?`<div class="cm1728-progress"><small>win · 🐭</small><b>${v.projection.winCount}/${2*v.cells.length**2}</b></div>`:'';
 const controls=final?`<nav class="cm1728-controls"><button type="button" data-cm1728-auto ${stopped?'disabled':''}>${t('Đi tối ưu →','Optimal move →')}</button><button type="button" data-cm1728-undo ${history.length?'':'disabled'}>↶</button><button type="button" data-cm1728-reset>↺</button></nav>`:'';
 const timeline=typeof steps==='undefined'?[]:steps,current=typeof stepIndex==='undefined'?-1:stepIndex;
 const jumps=[['pop','BFS →'],['mouse-win','🐭 ✓'],['result',t('Kết quả','Result')]].map(([event,label])=>`<button type="button" data-cm1728-jump="${event}" ${timeline.some((item,i)=>i>current&&item.catMouse1728View?.event===event)?'':'disabled'}>${label}</button>`).join('');
 const repeat=final&&history.some(state=>key(state)===key(game))&&!stopped?`<small class="cat">↻ ${t('trạng thái lặp · vẫn áp dụng mốc 1000 lượt','repeated state · the 1000-turn limit still applies')}</small>`:'';
 host.innerHTML=`<section class="cm1728-viz"><header><strong>🐭 → 🧀 · 🐱</strong><small>${t('sau dòng','after line')} ${v.source.line} · ${v.source.scope}</small></header>${initial}<small class="cm1728-phase">${phaseLabel}</small>${heading}${board}<div class="cm1728-legend"><span class="mouse">● 🐭✓</span><span class="cat">● 🐱✓</span><span>? ${t('chưa giải','unresolved')}</span><span>↺ ${t('đứng yên','stay')}</span></div>${transition}${operation}${condition}${rule}${controls}${repeat}${stats}${queue}${!final?`<nav class="cm1728-controls">${jumps}</nav>`:''}${v.omitted?`<small>${t('Đã thu gọn','Omitted')} ${v.omitted} ${t('bước · lời giải được tính đầy đủ','steps · full solution computed')}</small>`:''}</section>`;
 function play(to){
  if(!final||stopped||!legal.includes(to))return;
  history.push([...game]);game=turn===0?[to,game[1],1]:[game[0],to,0];host.dataset.cat1728State=JSON.stringify(game);host.dataset.cat1728History=JSON.stringify(history);renderCatMouse1728Pictures(step);
 }
 host.querySelectorAll?.('[data-cm1728-move]').forEach(element=>{element.addEventListener('click',()=>play(Number(element.dataset.cm1728Move)));if(element.tagName?.toLowerCase()==='g')element.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();play(Number(element.dataset.cm1728Move));}});});
 host.querySelector?.('[data-cm1728-auto]')?.addEventListener('click',()=>{
  const candidates=[...choices];candidates.sort((a,b)=>{
   if(canWin){if(turn===0)return(a.rank??Infinity)-(b.rank??Infinity);return(b.rank??-1)-(a.rank??-1);}
   if(turn===1){if(a.catTerminal!==b.catTerminal)return a.catTerminal?-1:1;if(a.canMouseWin!==b.canMouseWin)return a.canMouseWin?1:-1;}
   const pa=pointId(a.to),pb=pointId(b.to),goal=pointId(turn===0?v.food:game[0]);
   return Math.abs(pa.r-goal.r)+Math.abs(pa.c-goal.c)-Math.abs(pb.r-goal.r)-Math.abs(pb.c-goal.c);
  });if(candidates.length)play(candidates[0].to);
 });
 host.querySelector?.('[data-cm1728-undo]')?.addEventListener('click',()=>{if(history.length){host.dataset.cat1728State=JSON.stringify(history.pop());host.dataset.cat1728History=JSON.stringify(history);renderCatMouse1728Pictures(step);}});
 host.querySelector?.('[data-cm1728-reset]')?.addEventListener('click',()=>{host.dataset.cat1728State=JSON.stringify([v.mouse,v.cat,0]);host.dataset.cat1728History='[]';renderCatMouse1728Pictures(step);});
 host.querySelectorAll?.('[data-cm1728-jump]').forEach(button=>button.addEventListener('click',()=>{const index=steps.findIndex((item,i)=>i>stepIndex&&item.catMouse1728View?.event===button.dataset.cm1728Jump);if(index>=0){stepIndex=index;renderStep();}}));
 const viewport=host.querySelector?.('.cm1728-board-scroll');if(viewport){const p=center(actor);viewport.scrollLeft=Math.max(0,p.x-viewport.clientWidth/2);}
}
