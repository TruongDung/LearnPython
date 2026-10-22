function renderPictureLesson(step, selection = {}) {
  const v=step.pictureView||step.daily739View, id=v.id||739, final=Boolean(step.final), summary=v.mode==='summary';
  const t=(vi,en)=>lang==='vi'?vi:en, esc=x=>escapeHtml(String(x)), host=$('treeView');
  const names={739:['Ngày ấm hơn','Next warmer day'],173:['BST Iterator','BST Iterator'],3170:['Xóa sao','Remove stars'],2444:['Đoạn có đủ hai biên','Ranges containing both bounds'],2242:['Đường 4 đỉnh','Four-node path'],864:['Nhặt đủ chìa khóa','Collect all keys']};
  const chips=(items,css='')=>`<div class="pl-chips ${css}">${items.map(x=>`<span>${x}</span>`).join('')||'<code>∅</code>'}</div>`;
  const svg=(body,w=680,h=260)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" style="width:${w}px;height:${h}px" role="img" aria-label="${esc(t(...names[id]))}">${body}</svg>`;
  const box=(x,y,value,cls='',small='')=>`<g class="pl-box ${cls}"><rect x="${x}" y="${y}" width="49" height="45" rx="8"/><text x="${x+24.5}" y="${y+29}" text-anchor="middle">${esc(value)}</text><text class="pl-small" x="${x+24.5}" y="${y+64}" text-anchor="middle">${esc(small)}</text></g>`;
  let picture='', panels='', badge='', replay='';
  const legends={739:[['pl-good','đã ghi','written'],['pl-blue','đang chờ','waiting'],['pl-current','ngày i','day i'],['pl-focus','top / prev','top / prev']],173:[['pl-good','đã trả về','returned'],['pl-blue','trong stack','in stack'],['pl-current','đang xét','current'],['pl-focus','TOP','TOP']],3170:[['pl-bad','đã xóa','removed'],['pl-focus','index được pop','popped index'],['pl-current','con trỏ','cursor']],2444:[['pl-bad','ngoài biên','out of bounds'],['pl-good','đoạn hợp lệ','valid range'],['pl-current','index i','index i']],2242:[['pl-good','đường đang xét','selected path'],['pl-current','cạnh giữa','middle edge'],['pl-bad','index lặp','repeated index']],864:[['pl-good','cửa mở / đường đi','open door / route'],['pl-bad','cửa khóa','locked door'],['pl-current','chìa khóa','key'],['pl-blue','@ vị trí hiện tại','@ current position']]};
  const legend=legends[id].map(([css,vi,en])=>`<span class="${css}">● ${t(vi,en)}</span>`).join('');
  if(id===739){
    const temps=v.temperatures, gap=64, w=Math.max(650,temps.length*gap+110), answer=v.answer, next=v.nextWarmer;
    const low=Math.min(...temps), high=Math.max(...temps), height=x=>high===low?82:35+(x-low)/(high-low)*100;
    const day=final?(selection.day??answer.reduce((best,wait,i)=>wait>answer[best]?i:best,0)):null;
    const link=final&&next[day]!==null?{from:day,to:next[day],days:answer[day],recorded:true}:v.connection;
    const focus=link?.from??(final?day:v.compare?.top), current=final?link?.to:v.i;
    let body=`<text class="pl-caption" x="20" y="16">${low}°…${high}° · ${t('phóng to chiều cao','height zoom')}</text>`;
    if(link){const a=60+link.from*gap,b=60+Math.min(link.to,temps.length)*gap;
      body+=`<path class="pl-arrow ${link.recorded?'':'pending'}" d="M${a},70 C${a},35 ${b},35 ${b},70 l-5,-8 m5,8 5,-8"/><text class="pl-good" x="${(a+b)/2}" y="33" text-anchor="middle">+${link.days} ${t('ngày','days')}${link.recorded?' ✓':''}</text>`;
      if(link.to>=temps.length)body+=`<text class="pl-caption" x="${b}" y="95" text-anchor="middle">i=${link.to}</text>`;
    }
    temps.forEach((temp,i)=>{const x=60+i*gap,y=235-height(temp),solved=next[i]!==null,cls=`${solved?'good':i<=(v.i??-1)?'waiting':''} ${i===current?'current':''} ${i===focus?'focus':''}`;
      body+=`<g class="pl-bar ${cls}"><rect x="${x-20}" y="${y}" width="40" height="${height(temp)}" rx="7"/><text x="${x}" y="${y-9}" text-anchor="middle">${temp}°</text><text class="pl-small" x="${x}" y="258" text-anchor="middle">${i===current&&!final?'i=':''}${i}</text><g${final?` class="pl-day-pick" data-day="${i}" role="button" tabindex="0" aria-label="${t('Ngày','Day')} ${i}: ${answer[i]}"`:''}><rect class="wait" x="${x-22}" y="298" width="44" height="33" rx="6"/><text x="${x}" y="320" text-anchor="middle">${answer[i]}</text></g></g>`;
    });body+=`<text class="pl-caption" x="20" y="283">answer · ${final?t('bấm ô để xem mũi tên','select a cell for its arrow'):t('0 có thể vẫn đang chờ','0 may still be waiting')}</text>`;
    picture=svg(body,w,350);
    if(v.compare){const c=v.compare;badge=c.top===null?'stack = ∅':`${c.topTemp}° < ${c.currentTemp}° ${c.warmer?'✓ pop':'✕ '+t('giữ lại','keep')}`;}
    else if(link)badge=`${link.recorded?'answer['+link.from+'] = ':'prev = '+link.from+' · '}${link.to} − ${link.from} = ${link.days}${link.recorded?'':' · '+t('chưa ghi','not written yet')}`;
    else badge=final?`${t('Ngày','Day')} ${day}: 0 → ${t('không có ngày ấm hơn','no warmer day')}`:v.event;
    if(!summary)panels=`<div class="pl-panel"><small>stack · index · ${t('đáy → đỉnh','bottom → top')}</small>${v.stack===null?'<code>—</code>':chips((v.stack||[]).map((i,k)=>`<small>${k===v.stack.length-1?'TOP':'index'}</small><b>${i}</b><small>${temps[i]}°</small>`))}${v.connection?`<div class="pl-pop">pop → prev = ${v.connection.from} · ${temps[v.connection.from]}°</div>`:''}</div>`;
  } else if(id===3170){
    let body='';const chars=[...v.s],w=Math.max(650,chars.length*62+60);
    chars.forEach((ch,i)=>{body+=box(25+i*62,65,ch,`${v.removed[i]?'removed':''} ${i===v.i?'current':''} ${i===v.chosen?'focus':''}`,i);if(v.removed[i])body+=`<path class="pl-cut" d="M${31+i*62},103 l36,-31"/>`;});
    if(v.chosen!==null&&v.i!==null&&v.phase==='scan')body+=`<path class="pl-arrow" d="M${49+v.chosen*62},53 Q${49+(v.chosen+v.i)*31},8 ${49+v.i*62},53"/>`;
    picture=svg(body,w,150);badge=v.chosen===null?t('Chữ nhỏ nhất · nếu trùng thì lấy index phải nhất','Smallest letter · rightmost index breaks ties'):`${v.s[v.chosen]} · index ${v.chosen} ${v.removed[v.chosen]?'✕':t('đã pop, chờ xóa','popped, awaiting removal')}`;
    panels=`<div class="pl-panel"><small>a → z · ${t('mỗi chữ là một stack index','one index stack per letter')}</small>${chips(v.buckets.map(b=>`<b>${b.letter}</b><code>${b.indices.join(' → ')}</code><small>TOP: ${b.indices.at(-1)}</small>`))}</div><div class="pl-result">${esc(v.result||'∅')}${v.resultLength>v.result.length?'…':''}</div>`;
  } else if(id===2444){
    let body='';const w=Math.max(650,v.nums.length*62+160),end=v.i;
    v.nums.forEach((value,i)=>{const labels=[i===v.bad?'bad':'',i===v.min_pos?'min_pos':'',i===v.max_pos?'max_pos':''].filter(Boolean).join('/');body+=box(25+i*62,50,value,`${value<v.minK||value>v.maxK?'bad':''} ${i===end?'current':''}`,i);body+=`<text class="pl-caption" x="${49+i*62}" y="34" text-anchor="middle">${labels}</text>`;});
    const limit=Math.min(v.min_pos??-1,v.max_pos??-1),first=(v.bad??-1)+1;
    if(v.count!==null&&v.count>0)for(let start=first;start<=Math.min(limit,first+5);start++){const y=154+(start-first)*25;body+=`<path class="pl-bracket" d="M${27+start*62},${y} v7 H${73+end*62} v-7"/><text class="pl-good" x="${90+end*62}" y="${y+7}">[${start}..${end}]</text>`;}
    picture=svg(body,w,v.count>0?190+Math.min(v.count,6)*25:150);
    badge=`minK=${v.minK} · maxK=${v.maxK} · ${v.bad??'—'} < start ≤ ${limit}`;
    panels=chips([`bad: <b>${v.bad??'—'}</b>`,`min_pos: <b>${v.min_pos??'—'}</b>`,`max_pos: <b>${v.max_pos??'—'}</b>`,`+${v.count??'?'} ${t('đoạn','ranges')}`,`res = <b>${v.res}</b>`]);
    if(final&&v.found.length)panels+=`<div class="pl-panel"><small>${t('Các đoạn gần nhất đã đếm','Most recently counted ranges')} · ${v.found.length}</small>${chips(v.found.slice(-6).map(r=>`[${r.start}..${r.end}] · ${v.nums.slice(r.start,r.end+1).join(' + ')}`))}</div>`;
  } else if(id===173){
    const byId=new Map(v.nodes.map(n=>[n.id,n])),positions=new Map();let order=0,maxDepth=0;
    const visit=(id,depth)=>{if(id===null||!byId.has(id))return;const n=byId.get(id);visit(n.left,depth+1);positions.set(id,{x:45+order++*76,y:58+depth*75});maxDepth=Math.max(maxDepth,depth);visit(n.right,depth+1);};visit(0,0);
    let body='';v.nodes.forEach(n=>{const a=positions.get(n.id);if(!a)return;for(const side of ['left','right']){const b=positions.get(n[side]);if(b)body+=`<path class="pl-edge" d="M${a.x},${a.y+23} L${b.x},${b.y-26}"/>`;}});
    v.nodes.forEach(n=>{const p=positions.get(n.id);if(!p)return;const cls=`${v.returned.includes(n.id)?'good':''} ${v.stack.includes(n.id)?'waiting':''} ${v.stack.at(-1)===n.id?'focus':''} ${v.current===n.id?'current':''}`;body+=`<g class="pl-node ${cls}"><circle cx="${p.x}" cy="${p.y}" r="26"/><text x="${p.x}" y="${p.y+5}" text-anchor="middle" style="font-size:${n.value>999?10:16}px">${n.value}</text><text class="pl-small" x="${p.x}" y="${p.y+43}" text-anchor="middle">#${n.id}${v.stack.at(-1)===n.id?' TOP':''}</text></g>`;});
    picture=svg(body,Math.max(650,order*76+45),maxDepth*75+125);badge=`${v.op<0?'BSTIterator(root)':v.operations[v.op]||'done'} · ${v.method}`;
    panels=`<div class="pl-panel"><small>stack · ${t('đáy → đỉnh','bottom → top')}</small>${chips(v.stack.map(id=>`#${id}<b>${byId.get(id)?.value??'…'}</b>`))}</div><div class="pl-panel"><small>${t('Đã trả về','Outputs')} · ${v.outputTotal}</small>${chips(v.outputs.map(x=>esc(JSON.stringify(x))))}</div><div class="pl-ops">${v.operations.map((op,i)=>`<span class="${i===v.op?'active':''}">${op}()</span>`).join('')}</div>`;
  } else if(id===2242){
    const path=v.candidate||v.best||[],middle=final&&v.best?v.best.slice(1,3):v.middle,byId=new Map(v.nodes.map(n=>[n.id,n])),points=new Map(v.nodes.map((n,i)=>[n.id,{x:235+175*Math.cos(i*2*Math.PI/v.nodes.length-Math.PI/2),y:185+135*Math.sin(i*2*Math.PI/v.nodes.length-Math.PI/2)}]));
    let body='';v.edges.forEach(([a,b])=>{const p=points.get(a),q=points.get(b);if(!p||!q)return;const on=path.some((x,i)=>i>0&&(x===a&&path[i-1]===b||x===b&&path[i-1]===a));body+=`<path class="pl-edge ${on?'on':''}" d="M${p.x},${p.y} L${q.x},${q.y}"/>`;});
    v.nodes.forEach(n=>{const p=points.get(n.id);body+=`<g class="pl-node ${path.includes(n.id)?v.valid===false?'bad':'good':''} ${middle?.includes(n.id)?'current':''}"><circle cx="${p.x}" cy="${p.y}" r="25"/><text x="${p.x}" y="${p.y+5}" text-anchor="middle">${n.id}</text><text class="pl-small" x="${p.x}" y="${p.y+43}" text-anchor="middle">${n.value} pts</text></g>`;});
    picture=svg(body,500,380);badge=`${v.valid===false?'✕ '+t('trùng index','repeated index'):path.length?'✓ '+t('4 index khác nhau','4 distinct indices'):'top-3'} · best = ${v.answer??'—'}`;
    panels=path.length?`<div class="pl-path">${path.map((n,i)=>`<span class="${v.valid===false?'bad':''}"><small>${'abcd'[i]}</small><b>#${n}</b><code>${byId.get(n)?.value??'…'}</code></span>`).join('<b>→</b>')}</div>`:'';
    panels+=`<div class="pl-panel"><small>top · ${t('index hàng xóm theo điểm','neighbor indices by score')}</small>${chips(v.top.map(n=>`#${n.id}<code>[${n.neighbors.join(', ')}]</code>`))}</div>`;
    if(v.totalScore!==null)panels+=`<div class="pl-result">Σ = ${v.totalScore}</div>`;
  } else if(id===864){
    const path=v.path||[],replayIndex=final&&path.length?Math.min(path.length-1,Math.max(0,selection.path??path.length-1)):null;
    const activeState=replayIndex===null?null:path[replayIndex],current=activeState?activeState.slice(0,2):v.current,mask=activeState?activeState[2]:v.mask;
    const trail=replayIndex===null?path:path.slice(0,replayIndex+1),counts=new Map();v.visited.forEach(([r,c])=>counts.set(`${r},${c}`,(counts.get(`${r},${c}`)||0)+1));
    const w=Math.max(240,v.grid[0].length*52+30),h=v.grid.length*52+40;let back='',front='';
    v.grid.forEach((row,r)=>[...row].forEach((ch,c)=>{const x=15+c*52,y=15+r*52,isDoor=/[A-F]/.test(ch),hasKey=isDoor&&Boolean(mask&(1<<(ch.charCodeAt(0)-65))),isKey=/[a-f]/.test(ch),here=current?.[0]===r&&current?.[1]===c,candidate=v.neighbor?.[0]===r&&v.neighbor?.[1]===c;
      back+=`<rect class="pl-grid-cell ${ch==='#'?'wall':isDoor?(hasKey?'open':'locked'):isKey?'key':''} ${candidate&&!final?'current':''}" x="${x}" y="${y}" width="46" height="46" rx="7"/>`;
      const count=counts.get(`${r},${c}`)||0;
      front+=`<text class="pl-grid-char" x="${x+23}" y="${y+29}" text-anchor="middle">${ch==='.'?'·':ch}</text>${count>1?`<text class="pl-visit-count" x="${x+38}" y="${y+11}" text-anchor="middle">${count}</text>`:''}${here?`<circle class="pl-agent" cx="${x+23}" cy="${y+23}" r="19"/><text class="pl-agent-text" x="${x+23}" y="${y+29}" text-anchor="middle">@</text>`:''}`;
    }));
    const line=trail.length>1?`<polyline class="pl-route" points="${trail.map(([r,c])=>`${38+c*52},${38+r*52}`).join(' ')}"/>`:'';
    picture=svg(back+line+front,w,h);const keyNames=Array.from({length:6},(_,i)=>String.fromCharCode(97+i));
    badge=final&&v.answer===-1?t('Không có đường · queue = ∅','No route · queue = ∅'):`${replayIndex===null?(t('BFS · bước ','BFS · distance ')+v.dist):t('Phát lại đường tối ưu · bước ','Replay optimal path · step ')+replayIndex} · mask=${mask.toString(2).padStart(6,'0')}`;
    panels=chips(keyNames.filter((_,i)=>v.target&(1<<i)).map((key,i)=>`<b class="${mask&(1<<(key.charCodeAt(0)-97))?'pl-good':'pl-muted'}">${mask&(1<<(key.charCodeAt(0)-97))?'✓ ':''}${key}</b>`));
    if(!final&&v.nextMask!==null)panels+=`<div class="pl-badge">${t('Trạng thái thử','Candidate state')} (${v.neighbor.join(',')}) · ${v.mask.toString(2).padStart(6,'0')} → ${v.nextMask.toString(2).padStart(6,'0')}</div>`;
    panels+=`<div class="pl-panel"><small>queue · ${v.queueTotal} ${t('trạng thái','states')}</small>${chips(v.queue.slice(0,6).map(([r,c,k,d])=>`(${r},${c})<code>${k.toString(2).padStart(6,'0')}</code><small>d=${d}</small>`))}</div><small class="pl-hint">${t('Số nhỏ trên ô = số bộ chìa khác nhau đã tới ô đó.','Small cell badges count the different key sets seen at that cell.')}</small>`;
    if(replayIndex!==null&&path.length>1)replay=`<label class="pl-replay">${t('Đường tối ưu','Optimal route')} ${replayIndex}/${path.length-1}<input aria-label="${t('Phát lại đường đi','Replay path')}" type="range" min="0" max="${path.length-1}" value="${replayIndex}" data-pl-path /></label>`;
  }
  const result=id===739?v.answer:id===173?v.outputs:id===3170?v.result:id===2444?v.res:id===2242?v.answer:v.answer;
  host.innerHTML=`<section class="pl-viz" data-lesson="${id}"><header><strong>${id} · ${t(...names[id])}</strong><button type="button" data-pl-next ${final?'disabled':''}>${t('Lượt tiếp','Next round')} ⏭</button><button type="button" data-pl-result>${t('Kết quả','Result')}</button></header>${summary?`<div class="pl-summary">${t('Đã xử lý đủ đầu vào · hình xem trước. Debug từng dòng dùng ví dụ nhỏ.','Entire input processed · picture preview. Use a small input for line debugging.')}</div>`:`<div class="pl-line"><b>L${v.line}</b><code>${esc(v.source)}</code></div>`}<div class="pl-badge">${esc(badge)}</div>${replay}<div class="pl-picture">${picture}</div><div class="pl-legend">${legend}</div>${panels}${final?`<div class="pl-final">${esc(JSON.stringify(result))}${summary?' …':''}</div>`:''}<div class="pl-examples">${[t('Ví dụ','Example'),t('Trường hợp 2','Case 2'),t('Trường hợp 3','Case 3')].map((text,i)=>`<button type="button" data-pl-example="${i}">${text}</button>`).join('')}</div></section>`;
  host.querySelector('[data-pl-result]').addEventListener('click',()=>{stopPlay();stepIndex=steps.length-1;renderStep();});
  host.querySelector('[data-pl-next]').addEventListener('click',()=>{const target=steps.findIndex((s,i)=>{if(i<=stepIndex)return false;const p=s.pictureView||s.daily739View;if(!p)return false;return id===739?p.event==='push':id===173?p.op>v.op:id===3170?p.event==='remove letter'||p.event==='push index':id===2444?p.event==='res += count':id===2242?p.event==='max':p.event==='dequeue';});stopPlay();stepIndex=target<0?steps.length-1:target;renderStep();});
  host.querySelectorAll('.pl-day-pick').forEach(cell=>{const choose=()=>{stopPlay();renderPictureLesson(step,{day:Number(cell.dataset.day)});};cell.addEventListener('click',choose);cell.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}});});
  host.querySelector('[data-pl-path]')?.addEventListener('input',e=>{stopPlay();renderPictureLesson(step,{path:Number(e.target.value)});});
  const examples={739:[['73,74,75,71,69,72,76,73',{}],['70,70,71',{}],['80,70,60,90',{}]],173:[['7,3,15,null,null,9,20',{operations:'next();next();hasNext();next();next();next();hasNext()'}],['3,2,null,1',{operations:'next();next();next();hasNext()'}],['1,null,2,null,3',{operations:'next();hasNext();next();next();hasNext()'}]],3170:[['aaba*',{}],['aba*',{}],['bbac**',{}]],2444:[['1,3,5,2,7,5',{minK:1,maxK:5}],['1,1,1,1',{minK:1,maxK:1}],['1,5,7,1,5',{minK:1,maxK:5}]],2242:[['5,2,9,8,4',{edges:'[[0,1],[1,2],[2,3],[0,2],[1,3],[2,4]]'}],['1,2,3,4',{edges:'[[0,1],[1,2],[2,3]]'}],['9,9,9,9',{edges:'[[0,1],[1,2],[2,0]]'}]],864:[['@.a..;###.#;b.A.B',{}],['@..aA;..B#.;....b',{}],['@Aa',{}]]};
  host.querySelectorAll('[data-pl-example]').forEach(button=>button.addEventListener('click',()=>{const [input,params]=examples[id][Number(button.dataset.plExample)];$('arrInput').value=input;for(const [key,value]of Object.entries(params)){const field=$('extraParams').querySelector(`[data-param="${key}"]`);if(field)field.value=value;}runViz();}));
  const viewport=host.querySelector('.pl-picture');if(viewport&&id===739&&v.i!==null)viewport.scrollLeft=Math.max(0,(v.connection?(v.connection.from+v.connection.to)/2:v.i)*64-viewport.clientWidth/2);
}
