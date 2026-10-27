"use strict";
const rp301Text = (vi,en) => lang === 'vi' ? vi : en;
const rp301Esc = value => escapeHtml(String(value));
function rp301Tokens(text, active = null, removed = null, processed = text.length) {
  if (!text.length) return '<span class="rp301-empty">""</span>';
  return [...text].map((ch,index)=>`<span class="rp301-token ${ch==='('?'open':ch===')'?'close':'letter'} ${index===active?'active':''} ${index===removed?'removed':''} ${index>=processed?'unread':''}" data-index="${index}"><small>${index}</small><b>${rp301Esc(ch)}</b></span>`).join('');
}
function rp301Pairs(text, processed = text.length) {
  const stack=[],pairs=[];
  [...text.slice(0,processed)].forEach((ch,i)=>{if(ch==='(')stack.push(i);else if(ch===')'&&stack.length)pairs.push([stack.pop(),i]);});
  const dx=360/Math.max(1,text.length),x=i=>30+(i+.5)*dx;
  return `<svg class="rp301-pairs" viewBox="0 0 420 62" aria-hidden="true">${pairs.map(([a,b])=>`<path d="M${x(a)},57 Q${(x(a)+x(b))/2},${Math.max(0,42-(b-a)*6)} ${x(b)},57"/>`).join('')}</svg>`;
}
function rp301Curve(scan) {
  const text=scan.text,dx=360/Math.max(1,text.length),unit=60/Math.max(3,[...text].filter(c=>c==='(').length);
  let value=0,segments='';
  for(let i=0;i<scan.processed;i++) {
    const before=value; value+=text[i]==='('?1:text[i]===')'?-1:0;
    segments+=`<path class="${value<0?'negative':text[i]==='('?'open':text[i]===')'?'close':'letter'}" data-prefix="${i+1}" data-balance="${value}" d="M${30+i*dx},${90-before*unit} L${30+(i+1)*dx},${90-value*unit}"/>`;
  }
  const x=30+scan.processed*dx,y=90-value*unit;
  return `<svg class="rp301-curve" viewBox="0 0 420 132" role="img" aria-label="${rp301Esc(`balance = ${scan.balance}; ${scan.processed}/${text.length}`)}"><path class="baseline" d="M26,90 H398"/><text x="7" y="94">0</text>${segments}<circle cx="${x}" cy="${y}" r="5"/><text class="current ${value<0?'negative':''}" x="${Math.min(390,Math.max(35,x))}" y="${y-12}">${scan.balance}</text><text x="30" y="126">( +1</text><text x="330" y="126">) −1</text></svg>`;
}
function rp301Lane(v, next = false) {
  const lane=next?v.next:v.current;
  const items=lane.items.map((item,j)=>{
    const text=next?item:item.text,status=next?'pending':item.status;
    return `<div class="rp301-candidate ${status} ${!next&&text===v.focus?'focus':''}" data-candidate="${rp301Esc(text)}" data-status="${status}"><small>${lane.start+j+1}</small><code>${rp301Esc(text || '""')}</code><b>${{valid:'✓',invalid:'×',scanning:'◉',pending:'·'}[status]}</b></div>`;
  }).join('');
  return `<section class="rp301-card"><header><code>${next?'next_level':'level'}</code><span>${lane.total} ${rp301Text('chuỗi','strings')}</span></header><div class="rp301-frontier">${items || '<span class="rp301-empty">∅</span>'}</div>${lane.total>lane.items.length?`<footer>${lane.start+1}–${lane.start+lane.items.length} / ${lane.total}</footer>`:''}</section>`;
}
function rp301Action(v) {
  if(v.removal) return [v.removal.duplicate?'↺':'−1',v.removal.duplicate?rp301Text('set giữ một bản','set keeps one copy'):'next_level.add(…)'];
  if(v.phase==='letter')return ['a → a',rp301Text('Giữ chữ cái','Keep letters')];
  if(v.phase==='open-add')return ['↗ +1',`balance = ${v.scan.balance}`];
  if(v.phase==='close-sub')return ['↘ −1',`balance = ${v.scan.balance}`];
  if(v.phase==='invalid')return ['✕',v.scan.balance<0?'balance < 0':'balance ≠ 0'];
  if(v.phase==='valid'||v.phase==='collect')return ['✓',v.phase==='collect'?'valid.append(text)':'balance == 0'];
  if(v.minimum)return [`✓ −${v.depth}`,rp301Text('Số lần xóa ít nhất','Minimum removals')];
  return [v.generation?'−1 ?':'( ↗ ↘ )',rp301Text(v.generation?'Thử xóa một ngoặc':'Mở +1 · đóng −1',v.generation?'Try one deletion':'Open +1 · close −1')];
}
function renderRemoveInvalidParentheses301View(step) {
  const v=step.removeInvalid301View;if(!v)return;
  const scan=v.scan,text=scan?scan.text:v.focus??v.input,action=rp301Action(v);
  const deletion=v.removal,active=v.generation&&!/end$/.test(v.phase)?v.locals.i??null:scan?.active??null;
  const picture=v.generation?`<div class="rp301-delete"><div class="rp301-tokens">${rp301Tokens(text,active,deletion?.index??null)}</div>${deletion?`<div class="rp301-flow ${deletion.duplicate?'duplicate':''}"><strong>↓ ${deletion.duplicate?'↺':'−1'}</strong><div class="rp301-tokens" data-child="${rp301Esc(deletion.child)}">${rp301Tokens(deletion.child)}</div><span>${deletion.duplicate?rp301Text('Đã có trong set','Already in set'):rp301Text('Thêm vào set','Added to set')}</span></div>`:''}</div>`:`${rp301Pairs(text,scan?.processed??0)}<div class="rp301-tokens">${rp301Tokens(text,scan?.active??null,null,scan?.processed??0)}</div>${scan?rp301Curve(scan):'<div class="rp301-wait">( ↗ &nbsp; 0 &nbsp; ↘ )</div>'}`;
  $('treeView').innerHTML=`<div class="rp301-viz" data-phase="${v.phase}" data-scope="${v.scope}">
    <header class="rp301-heading"><code>#301 · ${v.scope}</code><b>L${v.source.line} ✓</b><small>${rp301Text('Sau dòng','After line')} ${v.source.line}</small></header>
    <div class="rp301-layers">${v.history.map((row,j)=>`${j?'<span>→</span>':''}<div class="rp301-layer ${row.status}" data-depth="${row.depth}" data-level-status="${row.status}"><b>−${row.depth}</b><small>${row.checked}/${row.total}</small><strong>${row.status==='minimum'?'✓':row.status==='rejected'?'×':'◉'}</strong></div>`).join('')}</div>
    <div class="rp301-action"><strong>${action[0]}</strong><code>${action[1]}</code><button id="rp301NextEvent" title="${rp301Text('Đến lần xóa hoặc kết quả kế tiếp','Next deletion or valid result')}">↪</button></div>
    ${step.final?'':`<section class="rp301-card rp301-inspect"><header><code>${v.generation?rp301Text('Xóa 1 ngoặc','Delete 1 parenthesis'):'is_valid(text)'}</code><span>${scan&&!v.generation?`balance = <b class="${scan.balance<0?'bad':''}">${scan.balance}</b>`:v.generation?`${v.attempts} → ${v.next.total} · ↺ ${v.duplicates}`:''}</span></header><div class="rp301-strip">${picture}</div></section>`}
    <div class="rp301-lanes">${rp301Lane(v)}${v.generation?rp301Lane(v,true):''}</div>
    <section class="rp301-card rp301-results ${v.minimum?'complete':''}"><header><code>${step.final?'return valid':'valid'}</code><span>${v.results.length}${v.minimum?` · −${v.depth} ✓`:''}</span></header><div class="rp301-gallery">${v.results.map(value=>`<figure data-result="${rp301Esc(value)}"><div class="rp301-strip">${rp301Pairs(value)}<div class="rp301-tokens">${rp301Tokens(value)}</div></div><figcaption>✓ ${rp301Esc(value||'""')}</figcaption></figure>`).join('')||'<span class="rp301-empty">∅</span>'}</div></section>
  </div>`;
  $('treeView').querySelector('#rp301NextEvent')?.addEventListener('click',()=>{
    if(typeof steps==='undefined'||typeof stepIndex==='undefined')return;
    stopPlay(); const next=steps.findIndex((item,index)=>index>stepIndex&&['delete','duplicate','collect','done'].includes(item.removeInvalid301View?.phase));
    stepIndex=next<0?steps.length-1:next;renderStep();
  });
}
