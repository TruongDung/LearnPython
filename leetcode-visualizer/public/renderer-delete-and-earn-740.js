'use strict';

function earn740Next(kind) {
  if(typeof steps==='undefined'||typeof stepIndex==='undefined')return -1;
  for(let i=stepIndex+1;i<steps.length;i++){
    const v=steps[i].earn740PictureView;
    if(v&&(kind==='line'||(kind==='result'?steps[i].final:kind==='group'?v.phase==='ready':v.phase==='choose')))return i;
  }
  return -1;
}

function renderEarn740Pictures(step) {
  const v=step.earn740PictureView, final=step.final;
  const t=(vi,en)=>lang==='vi'?vi:en;
  const host=document.getElementById('treeView');
  const n=value=>value===null?'?':Number(value).toLocaleString('en-US');
  const esc=value=>String(value??'—').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const grouping=['setup','read','group','group-end','ready'].includes(v.phase);
  let focus=final?v.buckets.find(b=>b.selected)?.value:v.current&&v.buckets.some(b=>b.value===v.current)?v.current:
    v.buckets.reduce((best,b)=>!best||b.totalCount>best.totalCount?b:best,null)?.value;
  const coin=(value,extra='')=>`<span class="s740-coin ${extra}">${value}</span>`;
  const plan=selection=>selection.values.length?selection.values.map((item,index)=>`${index?'<b>+</b>':''}<span class="s740-mini">${coin(item.value)}<small>+${n(item.points)}</small></span>`).join('')+(selection.omitted?`<span>… +${n(selection.omitted)}</span>`:''):'<span class="s740-zero">0</span>';
  function draw(){
    const rule=focus===undefined?'':`<div class="s740-rule" aria-label="${t(`Thử lấy ${focus}: xóa mọi ${focus-1} và ${focus+1}`,`Try taking ${focus}: delete all ${focus-1}s and ${focus+1}s`)}"><small>${t('Thử lấy','Try taking')}</small><span class="blocked"><b>✕</b>${coin(focus-1)}<small>${t('xóa hết','delete all')}</small></span><span>←</span><span class="picked"><b>✓</b>${coin(focus)}<small>${t('lấy hết','take all')}</small></span><span>→</span><span class="blocked"><b>✕</b>${coin(focus+1)}<small>${t('xóa hết','delete all')}</small></span></div>`;
    const columns=v.buckets.map((bucket,index)=>{
      const previous=v.buckets[index-1], omitted=previous&&bucket.rank-previous.rank>1;
      const adjacent=previous&&bucket.value-previous.value===1;
      const connector=index?`<span class="s740-link ${adjacent?'conflict':'gap'}" title="${omitted?t('Có cột đã ẩn','Some columns are hidden'):adjacent?t('Chênh 1: không lấy cả hai','Difference 1: cannot take both'):t('Không kề giá trị: có thể cùng lấy','Nonconsecutive values: may take both')}">${omitted?'…':adjacent?'<svg viewBox="0 0 32 22" aria-hidden="true"><path d="M0 11H32M12 6L20 16M20 6L12 16"/></svg>':'⋯'}<small>${omitted?'…':adjacent?'Δ1':`Δ${bucket.value-previous.value}`}</small></span>`:'';
      const state=bucket.selected?'picked':bucket.blocked&&!grouping?'blocked':'neutral';
      const ghost=bucket.count===null, incoming=v.pending?.kind==='points'&&v.pending.value===bucket.value;
      return `${connector}<button type="button" class="s740-column ${state} ${ghost?'ghost':''} ${bucket.value===v.current&&!final?'current':''} ${bucket.value===focus?'focus':''} ${incoming?'dropping':''}" data-s740-value="${bucket.value}" data-state="${state}" aria-pressed="${bucket.value===focus}" aria-label="${t('Giá trị','Value')} ${bucket.value} · ${ghost?t('chưa tạo points','points not allocated'):`${bucket.count} × ${bucket.value} = ${bucket.points}`}">
        <span class="s740-status">${incoming?`<span class="s740-incoming">+${bucket.value} ↓</span>`:bucket.selected?'✓':bucket.blocked&&!grouping?'✕':bucket.value===v.current?'▼':'·'}</span><div class="s740-stack">${Array.from({length:Math.min(5,ghost?bucket.totalCount:bucket.count)},()=>coin(bucket.value)).join('')||'<span class="s740-empty">○</span>'}</div>
        <strong class="s740-points">${ghost?'?':`+${n(bucket.points)}`}</strong><small>${ghost?t('xem trước','preview'):`${bucket.count} × ${bucket.value}`}</small><b class="s740-value">${bucket.value}</b><span class="s740-dp">${bucket.dp===null?'·':`${t('tốt nhất','best')} ${n(bucket.dp)}`}</span></button>`;
    }).join('');
    const candidates=v.candidates?`<section class="s740-choices" aria-label="${t('So sánh bỏ và lấy','Compare skip and take')}">${['skip','take'].map(kind=>{
      const take=kind==='take',chosen=v.choice===kind;
      return `<article class="s740-choice ${take?'take':'skip'} ${chosen?'winner':''}" data-choice="${kind}"><header><b>${take?t('Lấy','Take'):t('Bỏ','Skip')} ${v.current}</b><span>${chosen?'✓':''}</span></header><div class="s740-plan">${plan(v.candidates[kind])}</div><div class="s740-math">${take?`<small>${v.candidates.blocked?`✕ ${v.candidates.blocked} · `:''}${n(v.candidates.base)} + ${n(v.candidates.gain)}</small>`:`<small>✕ ${v.current}</small>`}<strong>${n(v[kind])}</strong></div></article>`;
    }).join('<span class="s740-versus">max</span>')}<div class="s740-flow">↘ <b>${v.choice?n(v.best):'?'}</b> ↙</div></section>`:'';
    const source=grouping?`<div class="s740-input" aria-label="nums">${v.input.map((value,index)=>`<span class="${index===(v.nextIndex??v.activeIndex)?'active':index<v.processed?'done':''}">${value}</span>`).join('')}${v.omittedInput?`<small>… +${n(v.omittedInput)}</small>`:''}</div><div class="s740-down">↓ <small>${t('gom cùng số','group equal values')} · ${v.processed}/${n(v.n)}</small> ↓</div>`:'';
    const effect=v.pending?`<div class="s740-effect"><small>${t('Sắp ghi','Next write')}</small><code>${esc(v.pending.target)}</code><b>${esc(v.pending.before)}</b><span>→</span><b class="pending">${esc(v.pending.after)}</b></div>`:`<small class="s740-line-event">${esc(t(v.event.vi,v.event.en))}</small>`;
    host.innerHTML=`<section class="s740-viz" aria-label="740 · Delete and Earn"><header class="s740-head"><div><small>740 · DELETE & EARN</small><h2>${t('Gom số → chọn cột','Group numbers → pick columns')}</h2></div><output><strong>${v.current===null?'?':n(v.best)}</strong><span>${final?t('điểm tối đa','max points'):v.current?t(`tới giá trị ${v.settled}`,`through value ${v.settled}`):t('điểm tối đa','max points')}</span></output></header>
      <nav class="s740-stages" aria-label="${t('Các giai đoạn','Stages')}"><span class="${grouping?'active':'done'}">① ${t('Gom','Group')}</span><b>→</b><span class="${!grouping&&!final?'active':final?'done':''}">② ${t('Chọn / bỏ','Take / skip')}</span><b>→</b><span class="${final?'active':''}">③ ${t('Thu điểm','Collect')}</span></nav>
      <section class="s740-line" aria-label="${t('Debug từng dòng','Line-by-line debug')}"><header><b>▶ L${v.line}</b><span>${final?t('Trả về','Return'):t('Sắp chạy','Before execution')}</span>${v.pythonLocals.value!==null?`<code class="s740-current-value">value = ${v.pythonLocals.value}</code>`:''}<button type="button" data-s740-jump="line"${earn740Next('line')<0?' disabled':''}>${t('Dòng →','Line →')} <kbd>F10</kbd></button></header><code>${esc(v.source.trim())}</code>${effect}</section>
      ${!v.detailed?`<small class="s740-caption">${t('Trace rút gọn · dùng n ≤ 40, max ≤ 40 để debug đủ từng dòng.','Shortened trace · use n ≤ 40, max ≤ 40 to debug every line.')}</small>`:''}
      ${source}<div class="s740-board" aria-label="${t('Các cột theo giá trị; mỗi đồng xu là một phần tử','Columns by value; each coin is an input element')}">${columns}</div>
      ${v.omittedBuckets?`<small class="s740-caption">${t(`Hiện ${v.buckets.length}/${n(v.totalBuckets)} cột · đã tính đủ`,`Showing ${v.buckets.length}/${n(v.totalBuckets)} columns · all computed`)}</small>`:''}
      <div class="s740-legend"><span class="picked">✓ ${t('lấy','take')}</span><span class="blocked">✕ ${t('mất hàng xóm','lose neighbors')}</span><span>Δ1 = ${t('xung đột','conflict')}</span><span>${t('Chạm cột để thử ↓','Tap a column to try ↓')}</span></div>
      ${rule}${candidates}
      ${final?`<div class="s740-loot"><div class="s740-plan">${plan(v.selected)}</div><output>= ${n(v.answer)}</output></div>`:''}
      <details class="s740-debug"><summary>${t('Biến & công thức','Variables & formula')}</summary><div class="s740-registers">${['largest','value','skip','take'].map(key=>`<span><small>${key}</small><b>${esc(v.pythonLocals[key])}</b></span>`).join('')}</div>${v.detailed?['points','dp'].map(key=>`<p><code>${key} = ${v.pythonLocals[key]===null?'—':`[${v.pythonLocals[key].join(', ')}]`}</code></p>`).join(''):''}<p>dp[v] = max(dp[v−1], dp[v−2] + points[v])</p><p>${t('Bỏ v: giữ dp[v−1]. Lấy v: bỏ v−1, cộng vào dp[v−2].','Skip v: keep dp[v−1]. Take v: skip v−1, add to dp[v−2].')}</p></details>
      <nav class="s740-controls">${[['group',t('Gom xong ↠','Grouped ↠')],['decision',t('Chọn tiếp →','Next choice →')],['result',t('Kết quả ↠','Result ↠')]].map(([kind,label])=>`<button type="button" data-s740-jump="${kind}"${earn740Next(kind)<0?' disabled':''}>${label}</button>`).join('')}</nav>
      <nav class="s740-examples"><small>${t('Thử:','Try:')}</small>${[[3,4,2],[2,2,3,3,3,4],[1,1,4,4],[1]].map((nums,index)=>`<button type="button" data-s740-example="${index}">[${nums.join(',')}]</button>`).join('')}</nav></section>`;
    host.querySelectorAll('[data-s740-value]').forEach(button=>button.addEventListener('click',()=>{focus=Number(button.dataset.s740Value);draw();}));
    host.querySelectorAll('[data-s740-jump]').forEach(button=>button.addEventListener('click',()=>{
      const next=earn740Next(button.dataset.s740Jump);if(next<0)return;
      if(typeof stopPlay==='function')stopPlay();stepIndex=next;renderStep();
    }));
    host.querySelectorAll('[data-s740-example]').forEach(button=>button.addEventListener('click',()=>{
      document.getElementById('arrInput').value=[[3,4,2],[2,2,3,3,3,4],[1,1,4,4],[1]][Number(button.dataset.s740Example)].join(',');runViz();
    }));
  }
  draw();
}
