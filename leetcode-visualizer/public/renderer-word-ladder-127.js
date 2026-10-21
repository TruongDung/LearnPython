function wordLadder127Layout(graph,length) {
  const adjacent=new Map(graph.nodes.map(w=>[w,[]]));
  graph.edges.forEach(([a,b])=>{adjacent.get(a).push(b);adjacent.get(b).push(a);});
  const depths=new Map([[graph.nodes[0],0]]), queue=[graph.nodes[0]];
  for(let head=0;head<queue.length;head++) for(const next of adjacent.get(queue[head])) if(!depths.has(next)){depths.set(next,depths.get(queue[head])+1);queue.push(next);}
  const unreachable=1+Math.max(...depths.values()), groups=new Map();
  for(const word of graph.nodes){const column=depths.get(word)??unreachable;if(!groups.has(column))groups.set(column,[]);groups.get(column).push(word);}
  const nodeWidth=Math.max(74,length*11+28), gap=nodeWidth+38, width=Math.max(560,groups.size*gap+38), rows=Math.max(...[...groups.values()].map(g=>g.length)), height=Math.max(230,rows*78+58), positions=new Map();
  for(const [column,words] of groups) words.forEach((word,row)=>positions.set(word,{x:38+nodeWidth/2+column*gap,y:(height-(words.length-1)*78)/2+row*78}));
  return {width,height,nodeWidth,positions};
}
function renderWordLadder127Pictures(step) {
  const v=step.ladder127View,t=(vi,en)=>lang==='vi'?vi:en,esc=x=>escapeHtml(String(x)),final=Boolean(step.final),summary=v.mode==='summary',two=v.approach===2;
  const layout=wordLadder127Layout(v.graph,v.begin.length),{positions,nodeWidth,width,height}=layout;
  const pathSet=new Set(v.path), seen=new Set(v.seen), queueSet=new Set(two?[...v.front,...v.back,...v.following]:v.queue.map(item=>item[0]));
  const focus=final?null:v.word??v.buildingWord;
  const pairKey=(a,b)=>[a,b].sort().join('|'), pathEdges=new Set(v.path.slice(1).map((word,i)=>pairKey(v.path[i],word)));
  const edges=v.graph.edges.map(([a,b])=>{
    const p=positions.get(a),q=positions.get(b),treeStart=v.treeStart[a]===b||v.treeStart[b]===a,treeEnd=v.treeEnd[a]===b||v.treeEnd[b]===a;
    const current=!final && (v.word===a&&v.candidate===b||v.word===b&&v.candidate===a);
    return `<path class="l127-edge${pathEdges.has(pairKey(a,b))?' path':treeStart?' start':treeEnd?' end':''}${current?' checking':''}" d="M${p.x},${p.y} L${q.x},${q.y}"/>`;
  }).join('');
  const letters=(word,changed)=>[...word].map((letter,i)=>`<span class="${changed?.has(i)?'changed':''}">${esc(letter)}</span>`).join('');
  const nodeHtml=v.graph.nodes.map(word=>{
    const p=positions.get(word),a=v.distStart[word],b=v.distEnd[word],known=a!==undefined||seen.has(word);
    const state=final&&pathSet.has(word)?'path':b!==undefined?'end':known?'start':'';
    return `<g class="l127-node ${state}${queueSet.has(word)&&!final?' queued':''}${focus===word?' current':''}${!final&&v.candidate===word?' candidate':''}${word===v.end&&v.graph.missingEnd?' missing':''}" transform="translate(${p.x},${p.y})"><title>${esc(word)}${a!==undefined?' · '+t('từ đầu','from start')+': '+a:''}${b!==undefined?' · '+t('từ cuối','from end')+': '+b:''}</title><rect x="${-nodeWidth/2}" y="-22" width="${nodeWidth}" height="44" rx="11"/><text class="l127-word" text-anchor="middle" y="6">${esc(word)}</text>${a!==undefined||b!==undefined?`<text class="l127-depth" text-anchor="middle" y="-31">${a!==undefined?'↦ '+a:'↤ '+b}</text>`:''}${word===v.begin||word===v.end?`<text class="l127-endpoint" text-anchor="middle" y="39">${word===v.begin?'begin':'end'}${word===v.end&&v.graph.missingEnd?' ✕':''}</text>`:''}</g>`;
  }).join('');
  const comparison=v.word&&v.candidate?(()=>{
    const differences=new Set([...v.word].flatMap((ch,i)=>ch!==v.candidate[i]?[i]:[]));
    const status=v.event==='meet-check'?(v.check?t('Gặp phía kia ✓','Meets other search ✓'):t('Chưa gặp phía kia','Not in other search')):v.check===false?t('Đã thăm ↩','Already visited ↩'):v.check===true||['discover','enqueue','distance'].includes(v.event)?t('Từ mới ✓','New word ✓'):'';
    return `<div class="l127-compare"><div class="l127-letter-word">${letters(v.word,differences)}</div><b>→</b><div class="l127-letter-word">${letters(v.candidate,differences)}</div><small>${differences.size} ${t('chữ khác','letters differ')} · ${status}</small></div>`;
  })():'';
  const bucket=v.pattern?`<div class="l127-bucket"><small>${t('Nhóm chung mẫu','Pattern group')}</small><code>${esc(v.pattern)}</code><span>→</span><div>${v.bucket.length?v.bucket.map(word=>`<b>${esc(word)}</b>`).join(''):'<i>∅</i>'}</div></div>`:'';
  const chip=(word,depth)=>`<span class="l127-chip${word===v.end?' target':''}"><b>${esc(word)}</b>${depth!==undefined?`<small>${depth} ${t('từ','words')}</small>`:''}</span>`;
  const frontier=(label,words,origin)=>`<div class="l127-frontier ${origin}"><small>${label} · ${origin==='start'?t('từ đầu','from start'):t('từ cuối','from end')}</small><div>${words.map(word=>chip(word,(origin==='start'?v.distStart:v.distEnd)[word])).join('')||'<i>∅</i>'}</div></div>`;
  const queues=v.phase==='search'&&!summary?(two?`<div class="l127-two-fronts">${frontier('front',v.front,v.frontOrigin)}${frontier('back',v.back,v.frontOrigin==='start'?'end':'start')}</div>${v.following.length||v.event==='following'?frontier(t('Tầng mới','Next layer'),v.following,v.frontOrigin):''}`:`<div class="l127-queue"><small>Queue · ${t('lấy bên trái → thêm bên phải','pop left → append right')}</small><div>${v.queue.map(([word,depth])=>chip(word,depth)).join('<i>→</i>')||'<i>∅</i>'}</div></div>`):'';
  function pathPicture() {
    if(!v.answer) return `<div class="l127-no-path">${v.graph.missingEnd?`${esc(v.end)} ∉ wordList`:t('Hai đầu không nối được','The two ends are disconnected')} → <b>0</b></div>`;
    const shown=v.path.length<=16?v.path:v.path.slice(0,8).concat(null,v.path.slice(-8));
    return `<div class="l127-answer"><strong>${v.answer}</strong><span>${t('từ trong đường ngắn nhất','words in the shortest path')}</span><small>${v.answer-1} ${t('lần đổi chữ','letter changes')}</small></div><div class="l127-path">${shown.map((word,i)=>word===null?`<i>… ${v.path.length-16} ${t('từ','words')} …</i>`:`${i>0&&shown[i-1]!==null?'<i>→</i>':''}<span><small>${v.path.length<=16?i+1:i<8?i+1:v.path.length-(shown.length-1-i)}</small><b>${esc(word)}</b></span>`).join('')}</div>`;
  }
  $('treeView').innerHTML=`<section class="l127-viz" aria-label="127 · Word Ladder">
    <header><strong>127 · ${two?'BFS ↔ BFS':'BFS →'}</strong><button type="button" data-l127-next ${final?'disabled':''}>${v.phase==='search'?t('Từ tiếp','Next word'):t('Vào BFS','Start BFS')} ⏭</button><button type="button" data-l127-result>${t('Kết quả','Result')}</button></header>
    ${summary?`<div class="l127-summary">${t('Đã tính đủ từ điển · hình xem trước','Full dictionary computed · picture previews')} ${v.graph.nodes.length}/${v.graph.total} ${t('từ. Debug từng dòng với ≤12 từ và ≤5 chữ/từ.','words. Full line debug for ≤12 words and ≤5 letters per word.')}</div>`:`<div class="l127-line"><b>L${v.line}</b><code>${esc(v.source)}</code></div>`}
    <div class="l127-endpoints"><code>${esc(v.begin)}</code><span>→ ${t('đổi 1 chữ mỗi cạnh','change 1 letter per edge')} →</span><code>${esc(v.end)}</code></div>
    <div class="l127-graph"><svg viewBox="0 0 ${width} ${height}" style="width:${width}px;height:${height}px" role="img" aria-label="${t('Đồ thị các từ; mỗi cạnh khác đúng một chữ','Word graph; each edge changes exactly one letter')}">${edges}${nodeHtml}</svg></div>
    <div class="l127-legend"><span class="start">● ${t('từ đầu','from start')}</span>${two?`<span class="end">● ${t('từ cuối','from end')}</span>`:''}<span class="queued">▱ ${t('đang chờ','waiting')}</span><span class="current">◎ ${t('đang xét','current')}</span></div>
    ${final?pathPicture():`${comparison}${bucket}`}${queues}
    <div class="l127-examples">${[t('hit → cog','hit → cog'),t('Thiếu từ đích','Missing target'),t('Có đích, không có đường','Target disconnected'),t('Một lần đổi chữ','One letter change')].map((label,i)=>`<button type="button" data-l127-example="${i}">${label}</button>`).join('')}</div>
  </section>`;
  const host=$('treeView');
  host.querySelector('[data-l127-result]').addEventListener('click',()=>{stopPlay();stepIndex=steps.length-1;renderStep();});
  host.querySelector('[data-l127-next]').addEventListener('click',()=>{const target=steps.findIndex((s,i)=>i>stepIndex&&['pop','expand-word'].includes(s.ladder127View?.event));stopPlay();stepIndex=target<0?steps.length-1:target;renderStep();});
  host.querySelectorAll('[data-l127-example]').forEach(button=>button.addEventListener('click',()=>{
    const [words,begin,end]=[['hot,dot,dog,lot,log,cog','hit','cog'],['hot,dot,dog,lot,log','hit','cog'],['hot,dot,cog','hit','cog'],['a,b,c','a','c']][Number(button.dataset.l127Example)];
    $('arrInput').value=words;$('param-beginWord').value=begin;$('param-endWord').value=end;runViz();
  }));
  const graph=host.querySelector('.l127-graph');if(graph&&focus&&positions.has(focus))graph.scrollLeft=Math.max(0,positions.get(focus).x-graph.clientWidth/2);
}
