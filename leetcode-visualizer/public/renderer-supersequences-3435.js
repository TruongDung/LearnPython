function renderSupersequences3435Pictures(step) {
  const host=$('treeView'),v=step.supersequences3435View;if(!host||!v)return;
  const t=(vi,en)=>lang==='vi'?vi:en,esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const letters=v.letters,n=letters.length,full=(1<<n)-1,final=!!step.final,counts=v.phase==='counts'||final;
  const frameKey=`${v.frame}:${v.words.join(',')}`,same=host.dataset?.ss3435Frame===frameKey;
  let selected=final&&same?Number(host.dataset.ss3435Selected||0):Math.max(0,v.masks.indexOf(v.repeat));
  selected=Math.max(0,Math.min(selected,v.masks.length-1));
  let focus=same?Number(host.dataset?.ss3435Focus??-1):-1;
  if(host.dataset){host.dataset.ss3435Frame=frameKey;host.dataset.ss3435Selected=String(selected);host.dataset.ss3435Focus=String(focus);}
  const repeat=counts?v.masks[selected]??0:v.repeat??0,keep=full^repeat,probe=!counts?v.probe:null;
  const cycle=!counts?v.cycle:[],cycleEdges=new Set(cycle.slice(0,-1).map((u,i)=>`${u},${cycle[i+1]}`));
  const queue=probe?.queue??[],processed=probe?.processed??[],active=['pop','visit','neighbor','kept-neighbor','indegree-drop','ready','enqueue'].includes(v.event)?probe?.u:null;
  const card=(label,html,cls='')=>`<section class="ss3435-card ${cls}"><header>${label}</header>${html}</section>`;
  const tile=(ch,cls='',small='')=>`<span class="ss3435-tile ${cls}"><b>${esc(ch)}</b>${small?`<small>${esc(small)}</small>`:''}</span>`;
  const row=(items,cls='')=>`<div class="ss3435-row">${items.map(x=>tile(x,cls)).join('')||'<span class="ss3435-empty">∅</span>'}</div>`;
  const duplicated=letters.filter((_,i)=>repeat&(1<<i));
  const timeline=typeof steps==='undefined'?[]:steps,at=typeof stepIndex==='undefined'?-1:stepIndex;
  const input=v.words.map((word,i)=>`<button type="button" class="ss3435-word ${i===focus?'active':''}" data-ss3435-word="${i}" aria-pressed="${i===focus}">${esc(word[0])}<span>→</span>${esc(word[1])}</button>`).join('');
  const heading=final?`✓ ${v.masks.length} ${t('bảng tần suất','frequency vectors')}`:counts?'🔢 '+t('Đếm từng chữ','Count each letter'):v.repeat===null?'🔗 a → b':cycle.length?'↻ '+t('Còn chu trình','Cycle remains'):probe?.ok===true?'✓ DAG':t('Thử chữ cần lặp','Try repeated letters');
  const cost=duplicated.length,best=v.best!==null&&v.best<=n?v.best:'—';

  function graph() {
    const radius=Math.max(92,n*15),width=radius*2+210,height=n<=2?220:radius*2+210,cx=width/2,cy=height/2,pos=[];
    letters.forEach((_,i)=>{const angle=n===2?Math.PI+i*Math.PI:-Math.PI/2+i*2*Math.PI/n;pos.push(n===1?{x:cx,y:cy}:{x:cx+radius*Math.cos(angle),y:cy+radius*Math.sin(angle)});});
    let content='<defs><marker id="ss3435-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10Z" style="fill:context-stroke;stroke:none"/></marker></defs>';
    v.words.forEach((word,i)=>{
      const u=letters.indexOf(word[0]),w=letters.indexOf(word[1]),p=pos[u],q=pos[w],inside=(keep&(1<<u))&&(keep&(1<<w));
      const cls=focus>=0&&focus!==i?'dim':focus===i?'active':cycleEdges.has(`${u},${w}`)?'cycle':!inside?'cut':processed.includes(u)?'done':'';
      let path;
      if(u===w)path=`M${p.x-16},${p.y-20} C${p.x-85},${p.y-108} ${p.x+85},${p.y-108} ${p.x+16},${p.y-20}`;
      else{const dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len,bend=n===2?42:24;path=`M${p.x+dx/len*26},${p.y+dy/len*26} Q${(p.x+q.x)/2+nx*bend},${(p.y+q.y)/2+ny*bend} ${q.x-dx/len*31},${q.y-dy/len*31}`;}
      content+=`<path class="ss3435-edge ${cls}" d="${path}" marker-end="url(#ss3435-arrow)" data-word="${esc(word)}"/>`;
    });
    letters.forEach((ch,i)=>{
      const p=pos[i],double=repeat&(1<<i),cls=double?'double':active===i?'active':cycle.includes(i)?'cycle':processed.includes(i)?'done':queue.includes(i)?'ready':'';
      content+=`<g class="ss3435-node ${cls}" transform="translate(${p.x},${p.y})" data-letter="${ch}">${double?'<circle cx="8" cy="-5" r="25"/>':''}<circle r="25"/><text text-anchor="middle" y="7">${ch}</text><text class="ss3435-node-label" text-anchor="middle" y="49">${double?'×2':probe?`×1 · in ${probe.indegree?.[i]??'—'}`:'×1'}</text></g>`;
    });
    return `<div class="ss3435-graph-wrap"><svg class="ss3435-graph" style="min-width:${Math.max(320,n*35)}px;max-height:${n<=2?220:430}px" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(t('Đồ thị thứ tự giữa các chữ','Letter precedence graph'))}">${content}</svg></div><div class="ss3435-legend"><span class="single">● ×1</span><span class="double">◉ ×2</span><span class="cycle">↻ ${t('chu trình','cycle')}</span></div>`;
  }
  function witness(mask) {
    const keep=full^mask,degree=Array(n).fill(0),graph=Array.from({length:n},()=>[]),queue=[];
    v.words.forEach(word=>{const u=letters.indexOf(word[0]),w=letters.indexOf(word[1]);if((keep&(1<<u))&&(keep&(1<<w))){graph[u].push(w);degree[w]++;}});
    letters.forEach((_,u)=>{if((keep&(1<<u))&&!degree[u])queue.push(u);});
    for(let head=0;head<queue.length;head++)for(const to of graph[queue[head]])if(!--degree[to])queue.push(to);
    const twice=letters.filter((_,i)=>mask&(1<<i)),order=[...twice,...queue.map(i=>letters[i]),...twice];
    return{twice,order,frequency:Array.from({length:26},(_,i)=>{const at=letters.indexOf(String.fromCharCode(97+i));return at<0?0:mask&(1<<at)?2:1;})};
  }

  const phaseIndex=counts?2:v.phase==='input'?0:1;
  const phases=[['a → b',t('Thứ tự','Order')],['↻ → ×2',t('Phá vòng','Break cycles')],['▥',t('Đếm chữ','Count letters')]];
  let body=`<div class="ss3435-phases">${phases.map(([icon,label],i)=>`<span class="${i===phaseIndex?'active':i<phaseIndex?'done':''}"><b>${icon}</b><small>${label}</small></span>`).join('')}</div>`+card(t('Mỗi từ = một mũi tên','Each word = one arrow'),`<div class="ss3435-words">${input}</div>`);
  if(!counts){
    body+=card(t('×1: không được có vòng','×1: no cycles allowed'),graph());
    body+=`<div class="ss3435-choice">${card('×2 · '+t('lặp','repeat'),row(duplicated,'double'))}${card('×1 · '+t('giữ','keep'),row(letters.filter((_,i)=>keep&(1<<i)),'single'))}</div>`;
    if(probe)body+=card('queue → '+t('thứ tự topo','topological order'),`<div class="ss3435-topo"><div><small>queue</small>${row(queue.map(i=>letters[i]),'ready')}</div><b>→</b><div><small>${t('đã lấy','popped')}</small>${row(processed.map(i=>letters[i]),'done')}</div></div>`);
    if(cycle.length){const trials=[...new Set(cycle)].map(u=>{const target=repeat|(1<<u),index=timeline.findIndex((row,i)=>i>at&&row.supersequences3435View?.event==='keep'&&row.supersequences3435View.repeat===target);return `<button type="button" data-ss3435-try="${index}" ${index<0?'disabled':''}>${letters[u]} ×2 →</button>`;}).join('');body+=card('↻ '+t('Lặp một chữ để phá vòng','Repeat a letter to break the cycle'),`<div class="ss3435-row">${cycle.map((u,i)=>`${i?'<strong>→</strong>':''}${tile(letters[u],'cycle')}`).join('')}</div><div class="ss3435-trials">${trials}</div>`,'cycle');}
    else if(probe?.ok===true){const example=witness(repeat);body+=card('✓ '+t('Một chuỗi hợp lệ','One valid supersequence'),`<div class="ss3435-sequence">${example.order.map(ch=>tile(ch,example.twice.includes(ch)?'double':'single')).join('')}</div>`,'done');}
    body+=`<div class="ss3435-stats"><span><small>${t('số chữ lặp','repeated letters')}</small><b>${cost}</b></span><span><small>${t('ít nhất đã tìm được','best found')}</small><b>${best}</b></span><span><small>${t('độ dài đang thử','candidate length')}</small><b>${n} + ${cost}</b></span></div>`;
  } else {
    const proof=witness(repeat),choices=v.masks.slice(Math.max(0,selected-2),Math.max(0,selected-2)+5);
    const picker=choices.map(mask=>{const idx=v.masks.indexOf(mask),label=letters.map((ch,i)=>`${ch}${mask&(1<<i)?'²':'¹'}`).join(' '),p=witness(mask),preview=n<=4?`<span class="ss3435-mini-sequence">${p.order.map(ch=>`<b class="${p.twice.includes(ch)?'double':'single'}">${ch}</b>`).join('')}</span><small>${esc(label)}</small>`:esc(label);return `<button type="button" data-ss3435-select="${idx}" class="${idx===selected?'selected':''}" ${!final?'disabled':''}>${preview}</button>`;}).join('');
    body+=card('✓ '+t('Mọi cách ngắn nhất','All shortest choices'),`<nav class="ss3435-solutions">${picker}</nav><div class="ss3435-paging"><button type="button" data-ss3435-select="${selected-1}" ${!final||selected===0?'disabled':''}>←</button><small>${selected+1} / ${v.masks.length}</small><button type="button" data-ss3435-select="${selected+1}" ${!final||selected===v.masks.length-1?'disabled':''}>→</button></div>`);
    const pattern=focus>=0?v.words[focus]:null,first=pattern?proof.order.indexOf(pattern[0]):-1,second=pattern?proof.order.indexOf(pattern[1],first+1):-1;
    const sequence=proof.order.map((ch,i)=>tile(ch,i===first||i===second?'active':proof.twice.includes(ch)?'double':'single',String(i))).join('');
    body+=card(t('Một chuỗi ví dụ','One example supersequence'),`<div class="ss3435-sequence">${sequence}</div><div class="ss3435-equation">${t('Độ dài','Length')} <strong>${proof.order.length}</strong> = ${n} + ${v.best}</div>${pattern?`<div class="ss3435-match">${esc(pattern)}: ${first} → ${second} ✓</div>`:''}`);
    if(final)body+=card('✓ '+t('Khớp từng dãy con','Match each subsequence'),`<div class="ss3435-checks">${v.words.map((word,i)=>{const a=proof.order.indexOf(word[0]),b=proof.order.indexOf(word[1],a+1);return `<button type="button" class="ss3435-check ${focus===i?'active':''}" data-ss3435-word="${i}" aria-pressed="${focus===i}"><span><b>${word[0]}</b><small>${a}</small></span><strong>→</strong><span><b>${word[1]}</b><small>${b}</small></span><em>✓</em></button>`;}).join('')}</div>`);
    const frequency=final?proof.frequency:step.locals?.freq;
    const freqCells=letters.map(ch=>{const value=frequency?.[ch.charCodeAt(0)-97]??0,active=['char','assign'].includes(v.event)&&v.currentLetter===ch;return `<div class="ss3435-frequency ${active?'active':''}"><b>${ch}</b><div>${Array.from({length:value},()=>'<i></i>').join('')||'·'}</div><strong>${value}</strong></div>`;}).join('');
    body+=card(final?'freq[26]':t('Đang điền freq[26]','Filling freq[26]'),`<div class="ss3435-frequencies">${freqCells}</div><small>${t('Các chữ khác = 0','Other letters = 0')}</small>${frequency?`<details><summary>${t('Xem đủ 26 ô','Show all 26 entries')}</summary><code>${esc(JSON.stringify(frequency))}</code></details>`:''}`);
  }
  const jumps=[['dag-result','↻ / ✓'],['save',t('Giữ cách này','Keep choice')],['result','🏁']].filter(([tag])=>timeline.some((step,i)=>i>at&&step.supersequences3435View?.event===tag));
  const omitted=v.omitted?`<div class="ss3435-trace-limit">${t('Đã rút gọn','Omitted')} ${v.omitted.toLocaleString()} ${t('bước · đáp án đầy đủ','steps · complete answer')}</div>`:'';
  host.innerHTML=`<div class="ss3435-viz"><header class="ss3435-heading"><strong>${heading}</strong><small>L${step.codeLines[0]} · #${v.frame}</small></header>${body}${omitted}<nav class="ss3435-nav">${jumps.map(([event,label])=>`<button type="button" data-ss3435-jump="${event}">${label} →</button>`).join('')}</nav><nav class="ss3435-presets"><small>${t('Ví dụ','Examples')}</small><button type="button" data-ss3435-example="pair">ab ↔ ba</button><button type="button" data-ss3435-example="self">aa · ac</button><button type="button" data-ss3435-example="triangle">ab · bc · ca</button></nav></div>`;
  host.querySelectorAll?.('[data-ss3435-select]').forEach(button=>button.addEventListener('click',()=>{host.dataset.ss3435Selected=button.dataset.ss3435Select;renderSupersequences3435Pictures(step);}));
  host.querySelectorAll?.('[data-ss3435-word]').forEach(button=>button.addEventListener('click',()=>{const index=Number(button.dataset.ss3435Word);host.dataset.ss3435Focus=String(index===focus?-1:index);renderSupersequences3435Pictures(step);}));
  host.querySelectorAll?.('[data-ss3435-jump]').forEach(button=>button.addEventListener('click',()=>{const index=timeline.findIndex((row,i)=>i>at&&row.supersequences3435View?.event===button.dataset.ss3435Jump);if(index>=0){stepIndex=index;renderStep();}}));
  host.querySelectorAll?.('[data-ss3435-try]').forEach(button=>button.addEventListener('click',()=>{const index=Number(button.dataset.ss3435Try);if(index>=0){stepIndex=index;renderStep();}}));
  host.querySelectorAll?.('[data-ss3435-example]').forEach(button=>button.addEventListener('click',async()=>{$('arrInput').value={pair:'ab,ba',self:'aa,ac',triangle:'ab,bc,ca'}[button.dataset.ss3435Example];await runViz();}));
}
