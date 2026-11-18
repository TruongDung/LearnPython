'use strict';

function beautiful2914Next(kind) {
  if (typeof steps === 'undefined' || typeof stepIndex === 'undefined') return -1;
  for (let i=stepIndex+1;i<steps.length;i++) {
    const v=steps[i].beautiful2914View;
    if (v && (kind==='line' || kind==='pair' && v.phase==='compare' || kind==='result' && steps[i].final)) return i;
  }
  return -1;
}

function renderBeautiful2914View(step) {
  const v=step.beautiful2914View, final=step.final;
  const t=(a,b)=>lang==='vi'?a:b;
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const host=document.getElementById('treeView');
  let selected=final?null:v.currentPair;
  function draw() {
    const current=v.pairs.find(pair=>pair.index===selected);
    const cards=v.pairs.map((pair,position)=>{
      const gap=position>0 && pair.index-v.pairs[position-1].index>1 ? `<div class="b2914-gap">… ${v.omittedPairs.toLocaleString()} ${t('cặp đã ẩn','pairs omitted')} …</div>`:'';
      const state=pair.done?pair.needed?'changed':'kept':pair.compared?'tested':'pending';
      const result=pair.done?pair.output:'··';
      const content=`<small>[${pair.start}, ${pair.start+1}]</small><div class="b2914-bits"><b>${pair.original[0]}</b><b>${pair.original[1]}</b></div><span class="b2914-arrow">↓</span><div class="b2914-bits after"><b>${result[0]}</b><b class="${pair.done&&pair.needed?'flipped':''}">${result[1]}</b></div><span class="b2914-cost">${pair.done?pair.needed?`+1 · ${t('đổi','flip')}`:`✓ ${t('giữ','keep')}`:pair.compared?t('Cần 1 lần đổi','Needs one change'):t('Chưa xét','Not checked')}</span>`;
      const attrs=`class="b2914-pair ${state}${pair.index===selected?' active':''}" data-pair-index="${pair.index}" data-state="${state}"`;
      return gap+(final?`<button type="button" ${attrs} data-b2914-pair="${pair.index}" aria-pressed="${pair.index===selected}">${content}</button>`:`<div ${attrs}>${content}</div>`);
    }).join('');
    const focus=current?`<section class="b2914-focus"><header><b>${t('Cặp','Pair')} [${current.start}, ${current.start+1}]</b><span>${current.compared?current.needed?t('Hai bit khác nhau','Different bits'):t('Hai bit giống nhau','Equal bits'):t('Đọc hai bit kế tiếp','Read the next two bits')}</span></header><div class="b2914-comparison"><div><small>s[${current.start}]</small><strong>${current.original[0]}</strong></div><b>${current.compared?current.needed?'≠':'=':'?'}</b><div><small>s[${current.start+1}]</small><strong>${current.original[1]}</strong></div><span>→</span><div class="b2914-focus-cost"><small>${t('Cần đổi','Changes needed')}</small><strong>${current.needed??'?'}</strong></div></div><p>${current.compared?current.needed?t(`Đổi bit ${current.start+1}: ${current.original[1]} → ${current.original[0]}. Cặp ${current.original} thành ${current.original[0].repeat(2)}.`,`Flip bit ${current.start+1}: ${current.original[1]} → ${current.original[0]}. Pair ${current.original} becomes ${current.original[0].repeat(2)}.`):t(`Giữ cặp ${current.original}: đã cùng giá trị và dài 2.`,`Keep ${current.original}: equal values and length 2.`):t('Chưa so sánh ở dòng if.','The if comparison has not run yet.')}</p>${current.compared&&!current.done?`<small>${t('Đã biết cần đổi; changes tăng ở dòng 6.','A change is needed; changes increases on line 6.')}</small>`:''}</section>`:'';
    const output=final?`<section class="b2914-result"><header><b>${t('Một cách chia hợp lệ sau khi sửa','One valid partition after the changes')}</b><small>${t('Mỗi nhóm dưới đây dài 2','Each block below has length 2')}</small></header><div class="b2914-output">${v.pairs.map((pair,position)=>`${position>0&&pair.index-v.pairs[position-1].index>1?'<span class="b2914-ellipsis">…</span>':''}<span>${pair.output}</span>`).join('')}</div><p>${t('Đếm cặp lệch là đủ: mỗi cặp lệch bắt buộc sửa ≥ 1 bit, và sửa 1 bit là đủ.','Counting unequal pairs is enough: every unequal pair requires at least one change, and one change is sufficient.')}</p></section>`:'';
    const jumps=[['line',t('Dòng →','Line →')],['pair',t('Cặp tiếp →','Next pair →')],['result',t('Kết quả ↠','Result ↠')]].map(([kind,label])=>`<button type="button" data-b2914-jump="${kind}"${beautiful2914Next(kind)<0?' disabled':''}>${label}</button>`).join('');
    host.innerHTML=`<section class="b2914-viz" aria-label="${t('2914 · Đếm cặp bit khác nhau','2914 · Count unequal bit pairs')}">
      <header class="b2914-head"><div><small>2914 · BEAUTIFUL BINARY STRING</small><h2>${t('Cứ ghép 2 bit kề nhau','Group adjacent bits in pairs')}</h2></div><div class="b2914-total"><strong>${v.changes??'—'}</strong><span>${final?t('lần đổi ít nhất','minimum changes'):t('changes hiện tại','changes so far')}</span></div></header>
      <div class="b2914-rule"><span><b>00 · 11</b> → ${t('giữ','keep')} <strong>+0</strong></span><span><b>01 · 10</b> → ${t('đổi 1 bit','flip one bit')} <strong>+1</strong></span></div>
      <p class="b2914-progress">${t('Đã xử lý','Processed')} ${v.processed.toLocaleString()} / ${v.pairCount.toLocaleString()} ${t('cặp','pairs')}${final?' · ✓':''}</p>
      <div class="b2914-pairs" aria-label="${t('Chuỗi chia thành cặp cố định; trên là đầu vào, dưới là sau khi xử lý','Fixed pairs; input above, processed output below')}">${cards}</div>
      ${focus}${output}
      <details class="b2914-debug"${final?'':' open'}><summary>${t('Debug từng dòng','Line-by-line debug')} · L${v.line}</summary><div aria-live="polite"><header><span>${esc(t(v.event.vi,v.event.en))}</span>${typeof v.condition==='boolean'?`<b class="${v.condition?'true':'false'}">${v.condition?'True':'False'}</b>`:''}</header><code>${esc(v.source.trim())}</code><nav>${jumps}</nav></div></details>
      ${!v.detailed?`<small class="b2914-muted">${t(`Hiển thị ${v.pairs.length} cặp đại diện; đã tính đủ cả ${v.pairCount.toLocaleString()} cặp. Dùng n ≤ 80 để debug từng dòng.`,`Showing ${v.pairs.length} sample pairs; all ${v.pairCount.toLocaleString()} pairs were computed. Use n ≤ 80 for line-by-line debug.`)}</small>`:''}
      <nav class="b2914-examples" aria-label="${t('Ví dụ','Examples')}"><span>${t('Thử nhanh:','Try:')}</span>${['1001','10','0000','10010011','010101'].map((s,i)=>`<button type="button" data-b2914-example="${i}">${s}</button>`).join('')}</nav>
    </section>`;
    host.querySelectorAll('[data-b2914-pair]').forEach(button=>button.addEventListener('click',()=>{selected=Number(button.dataset.b2914Pair);draw();}));
    host.querySelectorAll('[data-b2914-jump]').forEach(button=>button.addEventListener('click',()=>{
      const next=beautiful2914Next(button.dataset.b2914Jump);if(next<0)return;
      if(typeof stopPlay==='function')stopPlay();stepIndex=next;renderStep();
    }));
    host.querySelectorAll('[data-b2914-example]').forEach(button=>button.addEventListener('click',()=>{
      document.getElementById('arrInput').value=['1001','10','0000','10010011','010101'][Number(button.dataset.b2914Example)];runViz();
    }));
  }
  draw();
}
