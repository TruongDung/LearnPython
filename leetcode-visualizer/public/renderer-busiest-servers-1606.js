'use strict';
const BS1606_CASES=[
  [3,[1,2,3,4,5],[5,2,3,3,3],'Ví dụ · có request bị bỏ','Example · a dropped request'],
  [3,[1,2,3,4],[1,2,1,2],'Xong đúng lúc request tới','Finish exactly at arrival'],
  [3,[1,2,3],[10,12,11],'Ba server đồng hạng','Three tied winners'],
  [3,[1,2,3,4,5,6],[8,1,8,1,1,1],'Quấn vòng qua server 0','Wrap past server 0'],
  [2,[1,2,3,4],[10,10,10,10],'Tất cả đang bận','All servers busy'],
  [1,[1,2,3],[1,1,1],'Một server · trả rồi nhận','One server · release then assign'],
];
const BS1606_STATES={free:['Rảnh','Free'],busy:['Bận','Busy'],ready:['Chờ lấy ra','Awaiting release'],returning:['Chờ vào free','Returning to free'],reserved:['Đang gán','Assigning'],unknown:['…','…']};
function bs1606Esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function bs1606Fmt(v){return v===null||v===undefined?'—':Array.isArray(v)?'['+v.join(', ')+']':String(v);}
function bs1606Card(title,body,hint=''){return `<section class="tr-card"><header><b>${title}</b><small>${hint}</small></header>${body}</section>`;}
function bs1606Scroll(key,body,cls=''){return `<div class="bs1606-scroll ${cls}" data-bs1606-scroll="${key}" tabindex="0">${body}</div>`;}
function bs1606Stat(name,value){return `<span class="bs1606-stat"><code>${name}</code><b>${bs1606Esc(bs1606Fmt(value))}</b></span>`;}
function bs1606Ring(v,vi){
  const n=v.servers.length,w=360,h=345,cx=180,cy=166,radius=106,pos=id=>{const angle=-Math.PI/2+id*2*Math.PI/n;return {x:cx+Math.cos(angle)*radius,y:cy+Math.sin(angle)*radius};};
  const nodes=v.servers.map(s=>{const p=pos(s.id);return `<g class="bs1606-server is-${s.state} ${v.preferred===s.id?'is-preferred':''} ${v.server===s.id?'is-chosen':''} ${v.result?.includes(s.id)?'is-winner':''}" data-bs1606-server="${s.id}" data-server-state="${s.state}" data-server-count="${s.count??''}" role="button" tabindex="0" aria-label="Server ${s.id}, ${BS1606_STATES[s.state][vi?0:1]}"><circle cx="${p.x}" cy="${p.y}" r="25"/><circle class="bs1606-preference" cx="${p.x}" cy="${p.y}" r="31"/><text x="${p.x}" y="${p.y+5}">S${s.id}</text><text class="bs1606-small" x="${p.x}" y="${p.y+45}">${v.result?.includes(s.id)?'★ ':''}× ${s.count??'—'}</text></g>`;}).join('');
  let arc='';
  if(v.preferred!==null&&v.server!==null&&v.k<=8){const distance=(v.server-v.preferred+v.k)%v.k;if(distance){const a=-Math.PI/2+v.preferred*2*Math.PI/v.k,b=a+distance*2*Math.PI/v.k,r=74;arc=`<path class="bs1606-cyclic" data-cyclic-from="${v.preferred}" data-cyclic-to="${v.server}" d="M${cx+Math.cos(a)*r},${cy+Math.sin(a)*r}A${r},${r},0,${distance>v.k/2?1:0},1,${cx+Math.cos(b)*r},${cy+Math.sin(b)*r}" marker-end="url(#bs1606-choice)"/>`;}}
  const center=`<rect class="bs1606-request-box" x="140" y="135" width="80" height="64" rx="11"/><text x="180" y="160">${v.result!==null?'✓':v.i===null?'…':'#'+v.i}</text><text class="bs1606-small" x="180" y="184">t = ${v.clock??'—'}</text>`;
  const ring=v.k<=8?bs1606Scroll('ring',`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="width:100%;max-width:360px;height:auto" role="group"><defs><marker id="bs1606-choice" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10Z"/></marker></defs>${arc}${nodes}${center}</svg>`,'bs1606-canvas'):
    bs1606Scroll('servers',v.servers.map(s=>`<button type="button" class="bs1606-preview-server is-${s.state}" data-bs1606-server="${s.id}" data-server-state="${s.state}" data-server-count="${s.count??''}"><small>S${s.id}</small><b>${s.count??'—'}</b><small>${BS1606_STATES[s.state][vi?0:1]}</small></button>`).join(''),'bs1606-lane');
  return bs1606Card(vi?'Chọn server theo chiều vòng tròn':'Choose a server cyclically',ring+`<div class="bs1606-legend"><span class="is-free">● ${vi?'rảnh':'free'}</span><span class="is-busy">● ${vi?'bận':'busy'}</span><span class="is-ready">● ${vi?'chờ trả':'returning'}</span><span class="is-preferred">◯ i % k</span><span>× ${vi?'số request đã nhận':'handled requests'}</span></div>`,v.k>8?`${v.servers.length}/${v.k} servers`:vi?'Chọn server để xem chi tiết':'Select a server to inspect it');
}
function bs1606Heap(v,name,vi){
  const a=v[name],count=v[name+'Count'],n=a?.length??0,depth=n?Math.floor(Math.log2(n)):0,w=Math.max(280,2**depth*82+80),h=n?(depth+1)*79+15:75;
  const p=k=>{const level=Math.floor(Math.log2(k+1)),offset=k-(2**level-1);return {x:40+(offset+.5)*(w-80)/2**level,y:33+level*79};};
  const nodes=a?a.map((entry,k)=>{const xy=p(k),parent=k?p(Math.floor((k-1)/2)):null,server=name==='free'?entry%v.k:entry[1],label=name==='free'?'slot '+entry:'t '+entry[0];return `${parent?`<path class="bs1606-heap-link" d="M${parent.x},${parent.y+20}L${xy.x},${xy.y-22}"/>`:''}<g class="bs1606-heap-node ${k===0?'is-top':''}" data-heap-index="${k}"><rect x="${xy.x-37}" y="${xy.y-23}" width="74" height="47" rx="8"/><text x="${xy.x}" y="${xy.y-3}" style="font-size:${label.length>11?8:10}px">${label}</text><text class="bs1606-small" x="${xy.x}" y="${xy.y+15}">S${server}</text></g>`;}).join(''):'';
  return bs1606Card(name==='free'?vi?'free · vị trí ảo':'free · virtual slots':vi?'busy · thời điểm xong':'busy · finish times',bs1606Scroll(name,`<div data-native-heap="${name}" data-heap-values="${bs1606Esc(JSON.stringify(a))}" data-heap-count="${count??''}">${n?`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="group">${nodes}</svg>`:a?'∅':'—'}</div>`,'bs1606-canvas'),`${n}/${count??'—'} · ${vi?'gốc nhỏ nhất · ↔':'minimum at root · ↔'}`);
}
function bs1606Timeline(v,vi){
  const shown=v.servers.length,w=640,left=88,right=602,top=27,gap=47;
  const dropped=v.requests.filter(r=>r.state==='dropped'),laneEnds=[],dropLane=new Map();
  for(const request of dropped){let lane=laneEnds.findIndex(end=>end<=request.time);if(lane<0)lane=laneEnds.length;laneEnds[lane]=request.time+request.duration;dropLane.set(request.index,lane);}
  const dropRows=Math.max(1,laneEnds.length),axis=top+(shown+dropRows-1)*gap+35,h=axis+47;
  const low=v.arrival[0],high=Math.max(low+1,...v.arrival.map((t,i)=>t+v.load[i]),...v.jobs.map(j=>j.end),...dropped.map(r=>r.time+r.duration),v.clock??low);
  const x=t=>left+(t-low)/(high-low)*(right-left),row=id=>top+(shown+dropRows-1-id)*gap;
  const ticks=high-low<=10?Array.from({length:high-low+1},(_,i)=>low+i):Array.from({length:5},(_,i)=>Math.round(low+(high-low)*i/4));
  const grid=ticks.map(t=>`<path class="bs1606-ref-grid" d="M${x(t)},${top-17}V${axis}"/><path class="bs1606-ref-tick-mark" d="M${x(t)},${axis}v5"/><text class="bs1606-small" data-time-axis-tick="${t}" x="${x(t)}" y="${axis+20}">${t}</text>`).join('');
  const rows=v.servers.map(s=>`<text class="bs1606-small" data-timeline-server="${s.id}" x="35" y="${row(s.id)+4}">S${s.id}</text><path class="bs1606-track" d="M${left},${row(s.id)}H${right}"/>`).join('');
  const colors=['--tr-blue','--tr-green','--tr-amber','--tr-purple','--tr-red'];
  const bar=(index,start,end,y,load,attributes,isDropped)=>{
    const px=x(start),endX=x(end),width=Math.max(1,endX-px),label=`R${index}: Load = ${load}`;
    const font=Math.min(11,(width-10)/Math.max(1,label.length)*1.65);
    const text=font>=8?label:width>=22?'R'+index:'';
    return `<g class="bs1606-ref-request ${isDropped?'is-dropped':''} ${v.change?.index===index&&(v.change.kind==='assign'||v.change.kind==='drop')?'is-written':''}" style="--bs1606-request-color:var(${colors[index%colors.length]})" ${attributes} role="button" tabindex="0" aria-label="Request ${index}, load ${load}, ${start} to ${end}${isDropped?', dropped':''}"><title>R${index} · Load = ${load} · [${start}, ${end})${isDropped?vi?' · bị bỏ, không được xử lý':' · dropped, never processed':''}</title><rect class="bs1606-job ${isDropped?'bs1606-dropped-job':''}" x="${px}" y="${y-13}" width="${width}" height="26" rx="2"/>${text?`<text class="bs1606-job-label" x="${(px+endX)/2}" y="${y+4}" style="font-size:${text===label?font:10}px">${text}</text>`:''}</g>`;
  };
  const jobs=v.jobs.filter(j=>j.server<shown).map(j=>bar(j.index,j.start,j.end,row(j.server),j.end-j.start,`data-bs1606-job="${j.index}" data-job-server="${j.server}" data-job-start="${j.start}" data-job-end="${j.end}" data-request-duration="${j.end-j.start}" data-bs1606-step="${j.step}"`,false)).join('');
  const dropBars=dropped.map(r=>{
    const step=v.ledger.find(entry=>entry.kind==='drop'&&entry.index===r.index).step;
    const y=top+(dropRows-1-dropLane.get(r.index))*gap;
    return bar(r.index,r.time,r.time+r.duration,y,r.duration,`data-dropped-request="${r.index}" data-drop-start="${r.time}" data-drop-end="${r.time+r.duration}" data-request-duration="${r.duration}" data-bs1606-step="${step}"`,true);
  }).join('');
  const clock=v.clock===null?'':`<path class="bs1606-now" d="M${x(v.clock)},${top-20}V${axis}"/><text class="bs1606-small" x="${Math.max(left+20,Math.min(right-18,x(v.clock)))}" y="9">t = ${v.clock}</text>`;
  return bs1606Card(vi?'Timeline · request và thời gian xử lý':'Timeline · requests and processing time',
    bs1606Scroll('timeline',`<svg class="bs1606-reference-timeline" width="${w}" height="${h}" style="width:100%;min-width:420px;height:auto" viewBox="0 0 ${w} ${h}" data-reference-timeline data-time-low="${low}" data-time-high="${high}" role="group" aria-label="Request load timeline">${Array.from({length:dropRows},(_,i)=>`<text class="bs1606-small" x="35" y="${top+i*gap+4}">${dropRows===1?vi?'Bị bỏ':'Dropped':'DROP '+(i+1)}</text>`).join('')}${grid}${rows}${jobs}${dropBars}${clock}<path class="bs1606-ref-axis" d="M${left},${axis}H${right+11}"/><path class="bs1606-ref-axis" d="M${right+5},${axis-4}L${right+11},${axis}L${right+5},${axis+4}"/><text class="bs1606-small" x="${(left+right)/2}" y="${h-6}">${vi?'Thời gian →':'Time →'}</text></svg>`,'bs1606-canvas bs1606-reference-scroll')+
    `<div class="bs1606-legend"><span>R = request</span><span class="bs1606-dropped-key">┄ ${vi?'bị bỏ · không xử lý':'dropped · not processed'}</span><span>↔ ${vi?'bấm thanh để debug':'select a bar to debug'}</span></div>`,vi?'Mỗi request một màu · S0 ở hàng dưới':'One color per request · S0 at the bottom');
}
function bs1606Requests(v,vi){
  return bs1606Card(vi?'Request · đến / thời gian xử lý':'Requests · arrival / duration',bs1606Scroll('requests',v.arrival.map((time,i)=>{const r=v.requests.find(r=>r.index===i),state=r?.state??'pending';return `<button type="button" ${r?`data-bs1606-step="${r.step}"`:''} class="bs1606-request is-${state} ${v.i===i?'is-current':''}" data-request-index="${i}" data-request-state="${state}"><small>#${i} · t ${time}</small><b>${v.load[i]}</b><small>${state==='dropped'?'× DROP':r?.server!==null&&r?.server!==undefined?'→ S'+r.server:state==='pending'?'…':'?'}</small></button>`;}).join(''),'bs1606-lane'),v.requestCount>16?`16/${v.requestCount}`:vi?'Số lớn là thời gian xử lý':'Large number = processing duration');
}
function bs1606Formula(v,vi){
  const c=v.change;
  if(c?.kind==='release')return bs1606Card(vi?'Lấy server đã xong ra khỏi busy':'Pop a finished server from busy',`<div class="bs1606-equation">${bs1606Stat('server',c.server)}${bs1606Stat('finished',c.finished)}<i>≤</i>${bs1606Stat('time',v.clock)}</div>`);
  if(c?.kind==='requeue')return bs1606Card('free ← i + (server − i) % k',`<div class="bs1606-equation">${bs1606Stat('i',v.i)}<i>+</i>${bs1606Stat('(server − i) % k',c.slot-v.i)}<i>=</i>${bs1606Stat('virtual slot',c.slot)}<i>→</i>${bs1606Stat('server',c.server)}</div>`);
  if(v.reserved!==null)return bs1606Card('server = slot % k',`<div class="bs1606-equation">${bs1606Stat('slot',v.reserved)}<i>%</i>${bs1606Stat('k',v.k)}<i>=</i>${bs1606Stat('server',v.phase==='pick-slot'?null:v.server)}</div>`);
  if(v.dropped)return bs1606Card('DROP',`<div class="bs1606-equation"><strong class="is-busy">× #${v.i}</strong><code>free = []</code></div>`);
  const q=v.comparison;
  if(q&&v.source.text.startsWith('while '))return bs1606Card('busy[0][0] ≤ time',`<div class="bs1606-equation">${q.finish===null?'<b>∅ → STOP</b>':`${bs1606Stat('finish',q.finish)}<i>≤</i>${bs1606Stat('time',q.time)}<strong>${q.pass?'True ✓':'False ×'}</strong>`}</div>`);
  return '';
}
function bs1606Next(kind){if(typeof steps==='undefined')return -1;return steps.findIndex((s,i)=>i>stepIndex&&s.serverSchedulingView&&(kind==='line'||kind==='release'&&s.serverSchedulingView.change?.kind==='release'||kind==='assign'&&s.serverSchedulingView.change?.kind==='assign'||kind==='drop'&&s.serverSchedulingView.change?.kind==='drop'||kind==='result'&&s.final));}
function bs1606Go(index){if(index<0||typeof steps==='undefined')return;if(typeof stopPlay==='function')stopPlay();stepIndex=index;renderStep();}
function bs1606Bind(host){
  const bind=(selector,fn)=>host.querySelectorAll(selector).forEach(el=>{el.addEventListener('click',()=>fn(el));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();fn(el);}});});
  host.querySelectorAll('summary').forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')e.stopPropagation();}));
  bind('[data-bs1606-jump]',el=>bs1606Go(bs1606Next(el.dataset.bs1606Jump)));
  bind('[data-bs1606-step]',el=>bs1606Go(Number(el.dataset.bs1606Step)));
  bind('[data-bs1606-server]',el=>{if(typeof stopPlay==='function')stopPlay();renderBusiestServers1606(steps[stepIndex],{selected:Number(el.dataset.bs1606Server)});});
  bind('[data-bs1606-case]',el=>{const [k,arrival,load]=BS1606_CASES[Number(el.dataset.bs1606Case)];document.getElementById('arrInput').value=arrival.join(',');document.getElementById('param-k').value=k;document.getElementById('param-load').value=load.join(',');if(typeof runViz==='function')runViz();});
}
function renderBusiestServers1606(step,options={}){
  const v=step.serverSchedulingView,host=document.getElementById('treeView');if(!v||!host)return;
  const vi=typeof lang!=='undefined'&&lang==='vi',open=host.querySelector('.bs1606-native')?.open??false;
  const scrolls=new Map([...host.querySelectorAll('[data-bs1606-scroll]')].map(el=>[el.dataset.bs1606Scroll,{x:el.scrollLeft,y:el.scrollTop}]));
  const selected=v.servers.find(s=>s.id===(options.selected??v.result?.[0]??v.server??v.preferred??0)),inspect=selected?bs1606Card('S'+selected.id,`<div class="bs1606-equation" data-inspect-server="${selected.id}">${bs1606Stat(vi?'trạng thái':'state',BS1606_STATES[selected.state][vi?0:1])}${bs1606Stat('handled',selected.count)}${bs1606Stat('finish',selected.until)}</div>`):'';
  const jumps=[['line',vi?'Dòng →':'Line →'],['release',vi?'Trả server →':'Release →'],['assign',vi?'Giao request →':'Assign →'],['drop','DROP →'],['result',vi?'Kết quả ↠':'Result ↠']];
  host.innerHTML=`<article class="tr-viz bs1606-viz" data-problem-id="1606" data-source-line="${v.source.line}" role="region" aria-label="LeetCode 1606"><header class="tr-header"><div><small>LEETCODE 1606 · TWO HEAPS</small><h2>${vi?'Request → chọn server → xử lý':'Request → choose server → process'}</h2></div><code>i % k → ↻</code></header><nav class="tr-presets" aria-label="Examples">${BS1606_CASES.map((c,i)=>`<button type="button" data-bs1606-case="${i}">${c[vi?3:4]}</button>`).join('')}</nav><div class="tr-source"><span>${vi?'Sau dòng':'After line'} <b>L${v.source.line}</b></span><code>${bs1606Esc(v.source.text)}</code>${v.branch===null?'':`<strong class="${v.branch?'is-good':'is-muted'}">${v.branch?'True ✓':'False ×'}</strong>`}</div>${v.preview?`<p class="bs1606-preview">${vi?'Hình hiển thị tối đa 8 server, 16 request; kết quả tính đầy đủ.':'Pictures show up to 8 servers and 16 requests; the result is complete.'}${v.omitted?vi?' Replay rút gọn.':' Replay shortened.':''}</p>`:''}<div class="bs1606-work"><div class="bs1606-stats">${bs1606Stat('i',v.i)}${bs1606Stat('i % k',v.preferred)}${bs1606Stat('time',v.clock)}${bs1606Stat('dropped',v.droppedCount)}</div>${bs1606Ring(v,vi)}${bs1606Formula(v,vi)}${bs1606Requests(v,vi)}${bs1606Timeline(v,vi)}<div class="bs1606-two">${bs1606Heap(v,'free',vi)}${bs1606Heap(v,'busy',vi)}</div>${inspect}${bs1606Card('handled',bs1606Scroll('handled',(v.handled??[]).slice(0,8).map((count,id)=>`<button type="button" data-bs1606-server="${id}" class="bs1606-count ${v.result?.includes(id)?'is-winner':''}"><small>S${id}</small><b>${count}</b></button>`).join('')||'—','bs1606-lane')+`<span class="bs1606-hidden" data-native-handled="${bs1606Esc(JSON.stringify(v.handled))}"></span>`,v.best===null?'':'max = '+v.best)}</div><details class="tr-native bs1606-native"><summary>${vi?'Biến Python · từng frame':'Python locals · every frame'}</summary>${v.frames.map(f=>`<div class="bs1606-frame"><code>${bs1606Esc(f.name)}</code><pre>${bs1606Esc(JSON.stringify(f.locals,null,2))}</pre></div>`).join('')}</details>${v.result===null?'':`<output class="tr-answer" data-answer="${bs1606Esc(JSON.stringify(v.result))}"><small>${vi?'Server nhận nhiều request nhất':'Servers handling the most requests'} · max ${v.best}</small><strong>${bs1606Esc(bs1606Fmt(v.result.slice(0,16)))}${v.result.length>16?' … ('+v.result.length+')':''}</strong></output>`}<footer class="tr-footer"><div>${jumps.map(([kind,label])=>`<button type="button" data-bs1606-jump="${kind}" ${bs1606Next(kind)<0?'disabled':''}>${label}</button>`).join('')}</div></footer></article>`;
  const details=host.querySelector('.bs1606-native');if(details)details.open=open;
  for(const el of host.querySelectorAll('[data-bs1606-scroll]')){const saved=scrolls.get(el.dataset.bs1606Scroll);if(saved){el.scrollLeft=saved.x;el.scrollTop=saved.y;}const active=el.querySelector('.is-current')??el.querySelector('.is-top')??el.querySelector('.is-written');if(active){const a=el.getBoundingClientRect(),b=active.getBoundingClientRect();if(b.left<a.left+5)el.scrollLeft-=a.left+5-b.left;if(b.right>a.right-5)el.scrollLeft+=b.right-a.right+5;if(b.top<a.top+5)el.scrollTop-=a.top+5-b.top;if(b.bottom>a.bottom-5)el.scrollTop+=b.bottom-a.bottom+5;}}
  bs1606Bind(host);
}
