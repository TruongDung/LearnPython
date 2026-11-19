'use strict';
function score2567Next(kind){
  if(typeof steps==='undefined'||typeof stepIndex==='undefined')return -1;
  for(let i=stepIndex+1;i<steps.length;i++){const v=steps[i].score2567PictureView;if(v&&(kind==='line'||kind==='case'&&v.line>=5&&v.line<=7||kind==='result'&&steps[i].final))return i;}return -1;
}
function renderScore2567Pictures(step){
  const v=step.score2567PictureView,p=v.pythonLocals,final=step.final;
  const t=(vi,en)=>lang==='vi'?vi:en,esc=value=>String(value??'—').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const num=value=>value===null?'?':Number(value).toLocaleString('en-US');
  const titles=[t('2 nhỏ nhất','2 smallest'),t('Mỗi đầu 1 số','One at each end'),t('2 lớn nhất','2 largest')];
  const host=document.getElementById('treeView');let selected=final?v.witness.caseIndex:Math.max(0,Math.min(2,v.line-5));
  const token=value=>`<span class="q2567-token">${num(value)}</span>`;
  function draw(){
    const current=v.cases?.[selected];
    const pending=v.pending;
    const effect=pending?`<div class="q2567-effect"><small>${pending.kind==='sort'?t('Sắp xếp','Sort'):pending.kind==='return'?t('Trả về','Return'):t('Sắp ghi','Next write')}</small><code>${esc(pending.target)}</code>${pending.kind==='sort'?`<b>${t(pending.before.vi,pending.before.en)} → ${t(pending.after.vi,pending.after.en)}</b>`:`${pending.before!==undefined?`<span>${esc(pending.before)}</span> → `:''}<b>${num(pending.after)}</b>${pending.formula?`<small>${esc(pending.formula)}</small>`:''}`}</div>`:'';
    const cards=Array.from({length:3},(_,index)=>{
      const item=v.cases?.[index],winner=final&&item.value===v.answer;
      return `<button type="button" data-q2567-case="${index}" aria-pressed="${v.sorted&&selected===index}"${!v.sorted?' disabled':''} class="q2567-case ${selected===index&&v.sorted?'active':''} ${winner?'winner':''}"><header><b>${'ABC'[index]} · ${titles[index]}</b><span>${winner?'✓':''}</span></header><div class="q2567-case-glyph">${index===0?'⇢⇢▰▰▰':index===1?'⇢▰▰▰⇠':'▰▰▰⇠⇠'}</div><code>${item?`${num(item.high)} − ${num(item.low)}`:'—'}</code><strong>${item?num(item.value):'?'}</strong></button>`;
    }).join('');
    const cells=v.cells.map((cell,index)=>{
      const gap=index&&cell.index-v.cells[index-1].index>1?`<span class="q2567-gap">…<small>${num(v.omitted)}</small></span>`:'';
      if(!v.sorted)return `${gap}<div class="q2567-raw"><small>${cell.index}</small><b>${num(cell.value)}</b></div>`;
      const changed=current.changed.includes(cell.index),after=changed?current.anchor:cell.value;
      return `${gap}<div class="q2567-cell ${changed?'changed':'kept'}"><small>${cell.index}</small><b class="before ${changed&&cell.value!==after?'different':''}">${num(cell.value)}</b><span class="q2567-arrow">${changed?'↓':'│'}</span><strong class="after">${num(after)}</strong><em>${changed?t('đổi','change'):'✓'}</em></div>`;
    }).join('');
    const illustration=current?`<section class="q2567-demo"><header><b>${t('Thử','Try')} ${'ABC'[selected]} · ${titles[selected]}</b><small>${t('trước ↓ sau','before ↓ after')}</small></header><div class="q2567-array">${cells}</div><div class="q2567-range">${token(current.low)}<span>⟷</span>${token(current.high)}</div><div class="q2567-moves">${current.changed.map(index=>{const cell=v.cells.find(cell=>cell.index===index);return `<span>${num(cell.value)} → <b>${num(current.anchor)}</b></span>`;}).join('')}</div></section>`:`<div class="q2567-array initial">${cells}</div>`;
    const score=current?`<section class="q2567-score"><div><small>high</small><span>${num(current.high)} − ${num(current.low)}</span><strong>${num(current.width)}</strong></div><b>+</b><div><small>low</small><span>${num(current.anchor)} − ${num(current.anchor)}</span><strong>0</strong></div><output>= ${num(current.width)}</output></section>`:`<div class="q2567-idea">${token(v.cells[0].value)}${token(v.cells[0].value)} <span>→ low = <b>0</b></span></div>`;
    host.innerHTML=`<section class="q2567-viz" aria-label="2567 · Minimum Score by Changing Two Elements"><header class="q2567-head"><div><small>2567 · CHANGE TWO ELEMENTS</small><h2>${t('Đổi 2 số, thu hẹp khoảng','Change 2 values, shrink the range')}</h2></div><output><strong>${final?num(v.answer):'?'}</strong><span>${t('điểm nhỏ nhất','minimum score')}</span></output></header>
      <section class="q2567-debug"><header><b>▶ L${v.line}</b><span>${t('Sắp chạy','Before execution')}</span><button type="button" data-q2567-jump="line"${score2567Next('line')<0?' disabled':''}>${t('Dòng →','Line →')} F10</button></header><code>${esc(v.source.trim())}</code>${effect}</section>
      <div class="q2567-cases">${cards}</div>${illustration}${score}
      ${v.omitted?`<small class="q2567-caption">${t(`Hiện ${v.cells.length}/${num(v.n)} số · đã tính đủ.`,`Showing ${v.cells.length}/${num(v.n)} values · all computed.`)}</small>`:''}
      <details class="q2567-details"><summary>${t('Biến & vì sao chỉ 3 cách?','Variables & why only 3 choices?')}</summary><div>${['n','left','middle','right'].map(key=>`<span><small>${key}</small><b>${num(p[key])}</b></span>`).join('')}</div><p>${t('Các số không đổi vẫn phải nằm giữa min và max. Bỏ qua tối đa 2 số ở hai đầu chỉ có 3 cách. Đưa hai số đó về một giá trị trong khoảng → low = 0.','Unchanged numbers stay between min and max. Skipping up to 2 extremes gives only 3 choices. Copy a value inside the retained range → low = 0.')}</p></details>
      <nav class="q2567-controls"><button type="button" data-q2567-jump="case"${score2567Next('case')<0?' disabled':''}>${t('Cách tiếp →','Next case →')}</button><button type="button" data-q2567-jump="result"${score2567Next('result')<0?' disabled':''}>${t('Kết quả ↠','Result ↠')}</button></nav>
      <nav class="q2567-examples">${[[1,5,6,7,20],[1,4,7,8,5],[1,2,98,99,100],[1,2,3,100,101],[1,4,3],[5,5,5,5]].map((nums,index)=>`<button type="button" data-q2567-example="${index}">[${nums.join(',')}]</button>`).join('')}</nav></section>`;
    host.querySelectorAll('[data-q2567-case]').forEach(button=>button.addEventListener('click',()=>{selected=Number(button.dataset.q2567Case);draw();}));
    host.querySelectorAll('[data-q2567-jump]').forEach(button=>button.addEventListener('click',()=>{const next=score2567Next(button.dataset.q2567Jump);if(next<0)return;if(typeof stopPlay==='function')stopPlay();stepIndex=next;renderStep();}));
    host.querySelectorAll('[data-q2567-example]').forEach(button=>button.addEventListener('click',()=>{document.getElementById('arrInput').value=[[1,5,6,7,20],[1,4,7,8,5],[1,2,98,99,100],[1,2,3,100,101],[1,4,3],[5,5,5,5]][Number(button.dataset.q2567Example)].join(',');runViz();}));
  }draw();
}
