'use strict';

function leastOps964Next(kind) {
  if (typeof steps === 'undefined' || typeof stepIndex === 'undefined') return -1;
  for (let i = stepIndex + 1; i < steps.length; i++) {
    const v = steps[i].leastOps964View;
    if (v && (kind === 'line' || (kind === 'result' ? steps[i].final : v.phaseIndex === 5 && v.remaining > 1))) return i;
  }
  return -1;
}

function renderLeastOps964View(step) {
  const v = step.leastOps964View, final = step.final;
  const t = (vi, en) => lang === 'vi' ? vi : en;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const n = value => Number(value).toLocaleString('en-US');
  const power = v.x ** v.position, bigger = power * v.x;
  const q = v.quotient ?? Math.floor(v.remaining / v.x), r = v.remainder ?? v.remaining % v.x;
  const cost = v.position === 0 ? 2 : v.position;
  const unit = v.position === 0 ? `${v.x}/${v.x}` : Array(v.position).fill(v.x).join('×');
  const host = document.getElementById('treeView');
  const block = (count, value, negative = false) => `<div class="o964-block ${negative ? 'negative' : ''}"><div class="o964-bricks">${count?Array.from({length:Math.min(4,count)},()=>`<span>${n(value)}</span>`).join('')+(count>4?`<small>+${n(count-4)}</small>`:''):'∅'}</div><strong>${n(count)} × ${n(value)}</strong></div>`;
  function lane(carry) {
    const amount = carry ? v.x-r : r, rest = carry ? q+1 : q;
    const value = carry ? v.carryCost : v.lowCost;
    const chosen = carry ? v.choice === 'carry' : ['low','exact'].includes(v.choice);
    return `<article class="o964-lane ${carry ? 'carry' : 'low'} ${chosen ? 'chosen' : ''}">
      <header><b>${carry ? t('B · Bù lên rồi trừ','B · Overshoot, then subtract') : t('A · Cộng phần dư','A · Add the remainder')}</b><span>${chosen ? '✓ '+t('Chọn','Chosen') : value === null ? t('Đang chờ','Pending') : t('Đã tính','Computed')}</span></header>
      <div class="o964-equation">${block(rest,bigger)}<b>${carry ? '−' : '+'}</b>${block(amount,power,carry)}<b>=</b><strong>${n(v.remaining*power)}</strong></div>
      <footer><span>${t('Chi phí có dấu','Signed cost')}: <code>${amount} × ${cost} + F(${v.position+1}, ${rest})</code></span><strong>${value === null ? '?' : value}</strong></footer>
    </article>`;
  }
  const witness = v.witness;
  const expression = witness ? `<div class="o964-expression" aria-label="${t('Biểu thức tối ưu; mỗi ô màu là một phép toán','Optimal expression; each colored box is one operator')}">${witness.tokens.map(token => `<span class="${token.type}">${esc(token.value === '*' ? '×' : token.value === '/' ? '÷' : token.value === '-' ? '−' : token.value)}</span>`).join('')}<span>= ${n(v.target)}</span></div>` : '';
  const result = witness ? `<section class="o964-result"><div class="o964-values">${witness.terms.map((term,index) => `${index ? `<b>${term.coefficient < 0 ? '−' : '+'}</b>` : ''}${block(Math.abs(term.coefficient), v.x**term.position, term.coefficient < 0)}`).join('')}<b>= ${n(v.target)}</b></div>
    <p>${t('Thay mỗi khối bằng phép nhân / chia chỉ dùng x:','Replace each block with multiplication / division using only x:')}</p>
    ${witness.operatorCount > 32 ? `<details><summary>${t('Mở biểu thức đầy đủ','Show the full expression')} · ${witness.operatorCount} ${t('phép toán','operators')}</summary>${expression}</details>` : expression}
    <p><b>${witness.operatorCount}</b> ${t('ô phép toán = đáp án. Không cần dấu + ở đầu.','operator boxes = the answer. No leading + is needed.')}</p></section>` : '';
  const base = v.remaining <= 1 ? `<div class="o964-base"><strong>${v.remaining === 0 ? t('Hết phần cần ghép → chi phí 0','Nothing left → cost 0') : `${n(power)} = ${unit}`}</strong><p>${v.remaining === 0 ? t('Trả về 0 cho lời gọi cha.','Return 0 to the caller.') : t(`Chỉ cần 1 khối. Tính cả dấu + phía trước: chi phí ${cost}.`,`One block is enough. Including its leading +: cost ${cost}.`)}</p></div>` : '';
  const initial = v.phaseIndex === 0;
  host.innerHTML = `<section class="o964-viz" aria-label="964 · ${t('Ghép số bằng các khối x','Build a number from blocks of x')}">
    <header class="o964-head"><div><small>964 · LEAST OPERATORS</small><h2>${t('Ghép đúng số, dùng ít dấu nhất','Build the target with the fewest operators')}</h2><p>${t('Chỉ dùng số','Use only')} <b>${v.x}</b> ${t('và','and')} <b>+ − × ÷</b> → ${t('tạo ra','make')} <b>${n(v.target)}</b></p></div><div class="o964-answer"><strong>${final ? witness.operatorCount : '?'}</strong><span>${t('phép toán ít nhất','minimum operators')}</span></div></header>
    <div class="o964-insight o964-block-key">${[[1,`${v.x}÷${v.x}`],[v.x,String(v.x)],[v.x*v.x,`${v.x}×${v.x}`]].map(([value,expression])=>`<span><b>${n(value)}</b><small>${expression}</small></span>`).join('<i>·</i>')}</div>
    <section class="o964-line" aria-label="${t('Debug từng dòng','Line-by-line debug')}"><header><b>▶ L${v.line}</b><span>${v.timing==='return'?t('Đã trả về','Returned'):t('Sắp chạy','Before execution')}</span><button type="button" data-o964-jump="line"${leastOps964Next('line')<0?' disabled':''}>${t('Dòng →','Line →')} F10</button></header><code>${esc(v.source.trim())}</code>${v.pending?`<div><small>${v.pending.kind==='condition'?t('Kiểm tra','Test'):v.pending.kind==='call'?t('Gọi DFS','Call DFS'):v.pending.kind==='return'?t('Trả về','Return'):t('Sắp ghi','Next write')}</small><code>${esc(v.pending.target)}</code><b>${v.pending.formula?esc(v.pending.formula):`${v.pending.before??'—'} → ${typeof v.pending.after==='boolean'?v.pending.after?'True':'False':esc(v.pending.after??'?')}`}</b></div>`:''}<nav class="o964-stack-path">${v.stack.slice(-4).map(frame=>`<span>F(${frame.position}, ${n(frame.remaining)})</span>`).join(' → ')}</nav></section>
    ${v.cacheReads.length?`<div class="o964-cache-hit">✓ Cache ${v.cacheReads.map(item=>`F(${item.key.replace(':',', ')}) = ${item.cost}`).join(' · ')}</div>`:''}
    ${result}
    ${!final ? `<section class="o964-state"><header><div><small>${initial ? t('Xem hai cách ghép','Two ways to build it') : t('Lời gọi hiện tại','Current call')} · F(${v.position}, ${n(v.remaining)})</small><h3>${t('Cần ghép','Build')} ${n(v.remaining*power)} <span>${t('từ khối','using blocks')} ${n(power)} ${t('trở lên','and larger')}</span></h3></div><b>${v.remaining} × ${v.x}<sup>${v.position}</sup></b></header>
      ${base || `<p class="o964-division">${v.remaining} = ${q} × ${v.x} + <b>${r}</b> · ${t('phần dư','remainder')} ${r}</p><div class="o964-lanes">${lane(false)}${r ? lane(true) : `<div class="o964-exact">✓ ${t('Chia hết: không cần bù lên.','Exact division: no carry needed.')}</div>`}</div>`}
      ${!base ? `<p class="o964-division">${t('Đếm cả dấu trước khối → cuối cùng trừ 1.','Count each leading sign → subtract 1 at the end.')}</p>` : ''}
      ${v.lowCost !== null && v.carryCost !== null ? `<p class="o964-compare">${t('So sánh chi phí','Compare costs')}: <b>${v.lowCost} ${v.lowCost <= v.carryCost ? '≤' : '>'} ${v.carryCost}</b> → ${t('chọn','choose')} <b>${v.lowCost <= v.carryCost ? 'A' : 'B'}</b></p>` : ''}
    </section>` : ''}
    <details class="o964-details"><summary>${t('Vì sao chi phí như vậy? · DFS + cache','Why these costs? · DFS + cache')}</summary><p>${t('F tính cả dấu + hoặc − trước mỗi khối. Ví dụ +x tốn 1 dấu; +x×x tốn 2; +x÷x (khối 1) tốn 2. Khi xong, bỏ dấu + đầu tiên: đáp án = F(0, target) − 1.','F includes the + or − before each block. For example, +x costs 1; +x×x costs 2; +x÷x (block 1) costs 2. At the end, remove the first +: answer = F(0, target) − 1.')}</p><p>${t('DFS thử hai cách ở mỗi hàng lũy thừa. Cache lưu F(vị trí, phần còn lại) để không tính lại.','DFS tries both options at each power. Cache stores F(position, remaining) to avoid repeated work.')}</p><div class="o964-cache"><b>${t('Ngăn xếp','Stack')}</b><code>${esc(v.stack.map(frame=>`F(${frame.position}, ${frame.remaining})`).join(' → ') || '—')}</code><b>Cache · ${v.memoSize}</b><code>${esc(v.memo.map(item=>`F(${item.key.replace(':',', ')}) = ${item.cost}`).join(' · ') || '—')}</code></div></details>
    ${v.traceTruncated ? `<small>${t('Trace được rút gọn; kết quả và biểu thức vẫn được tính đầy đủ.','The trace is shortened; the full answer and expression are still computed.')}</small>` : ''}
    <nav class="o964-controls"><button type="button" data-o964-jump="decision"${leastOps964Next('decision') < 0 ? ' disabled' : ''}>${t('Lần chọn tiếp →','Next decision →')}</button><button type="button" data-o964-jump="result"${leastOps964Next('result') < 0 ? ' disabled' : ''}>${t('Xem biểu thức ↠','See expression ↠')}</button><span>${t('Thử:','Try:')}</span>${[[3,19],[5,501],[3,2],[100,100000000]].map(([x,target])=>`<button type="button" data-o964-example="${x}:${target}">${x} → ${n(target)}</button>`).join('')}</nav>
  </section>`;
  host.querySelectorAll('[data-o964-jump]').forEach(button=>button.addEventListener('click',()=>{
    const next=leastOps964Next(button.dataset.o964Jump); if(next<0)return;
    if(typeof stopPlay==='function')stopPlay(); stepIndex=next; renderStep();
  }));
  host.querySelectorAll('[data-o964-example]').forEach(button=>button.addEventListener('click',()=>{
    const [x,target]=button.dataset.o964Example.split(':');
    document.getElementById('arrInput').value=x; document.getElementById('param-target').value=target; runViz();
  }));
}
