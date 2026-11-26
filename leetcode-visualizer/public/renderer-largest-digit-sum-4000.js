'use strict';
function digitSum4000Step(direction){
 if(typeof steps==='undefined'||typeof renderStep!=='function')return;
 if(typeof stopPlay==='function')stopPlay();
 stepIndex=Math.max(0,Math.min(steps.length-1,stepIndex+direction));renderStep();
}
function renderLargestDigitSum4000(step){
 const v=step.digitSum4000View,host=$('treeView');if(!v||!host)return;
 const t=(vi,en)=>lang==='vi'?vi:en,esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const used=v.target-v.remaining,selected=v.transfer?.amount??0;
 const tokens=Array.from({length:v.target},(_,i)=>`<i class="ds4000-dot ${i<used?'used':i<used+selected?'picked':''} ${i>=v.capacity?'overflow':''}" aria-hidden="true"></i>`).join('');
 const slots=Array.from({length:v.n},(_,i)=>{
  const committed=i<v.digits.length,pending=!committed&&v.transfer?.position===i,digit=committed?v.digits[i]:pending?v.transfer.amount:null;
  return `<article class="ds4000-slot ${v.position===i?'active':''} ${committed?'committed':''} ${pending?'pending':''}" data-digit-position="${i}" data-committed="${committed}"><small>×${10**(v.n-i-1)}</small><strong>${digit===null?'·':digit}</strong><div class="ds4000-nine" aria-label="${esc(t('Tối đa 9','At most 9'))}">${Array.from({length:9},(_,j)=>`<i class="${digit!==null&&j<digit?'filled':''}"></i>`).join('')}</div></article>`;
 }).join('');
 const expression=v.change?`${v.change.before} ${v.change.kind==='append'?'× 10 +':'−'} ${v.change.digit} = ${v.change.after}`:v.line===7?`min(9, ${v.remaining}) = ${v.transfer.amount}`:v.line===3?`${v.target} ${v.branch?'>':'≤'} 9 × ${v.n}`:'';
 const code=typeof problemData!=='undefined'&&Array.isArray(problemData.code)?problemData.code:[];
 const source=(code.length?code.map((text,i)=>({text,line:i+1})):[{text:v.source,line:v.line}]).map(({text,line})=>`<div class="${line===v.line?'active':''}" data-code-line="${line}" ${line===v.line?'aria-current="step"':''}><span>${line}</span><code>${esc(text)}</code></div>`).join('');
 host.innerHTML=`<section class="ds4000-viz" data-digit-sum="4000"><header class="ds4000-head"><b>#4000</b><span><small>n</small><strong>${v.n}</strong></span><span><small>Σ</small><strong>${v.target}</strong></span><span class="ds4000-remaining"><small>${t('Còn','Left')} · s</small><strong>${v.remaining}</strong></span></header>
  <section class="ds4000-budget"><header><b>${t('Tổng cần chia','Digit-sum budget')}</b><span>Σ ≤ ${v.capacity}</span></header><div class="ds4000-pool" aria-label="${esc(t('Các đơn vị của tổng chữ số','Digit-sum units'))}">${tokens||'<strong class="ds4000-zero">0</strong>'}</div><footer><span><i class="ds4000-dot"></i>${t('Còn','Left')}</span><span><i class="ds4000-dot picked"></i>${t('Chọn','Picked')}</span><span><i class="ds4000-dot used"></i>${t('Đã dùng','Used')}</span></footer></section>
  <section class="ds4000-number"><header><b>← ${t('Ưu tiên bên trái','Leftmost first')}</b><span>${v.currentAnswer!==null?`answer = ${v.currentAnswer}`:''}</span></header><div class="ds4000-slots">${slots||'<span class="ds4000-zero">∅</span>'}</div></section>
  ${expression?`<div class="ds4000-equation ${v.line===9?'subtract':''}">${esc(expression)}</div>`:''}
  ${v.final?`<section class="ds4000-result ${v.result===-1?'impossible':''}" data-result="${v.result}"><span>${v.result===-1?'✕':'✓'} ${v.result===-1?t('Không thể','Impossible'):t('Số lớn nhất','Largest integer')}</span><strong>${v.result}</strong>${v.result!==-1?`<small>${v.digits.length?v.digits.join(' + '):'0'} = ${v.target}</small>`:''}</section>`:''}
  <section class="ds4000-debug"><header><b>${t('Dòng','Line')} ${v.line}</b><nav><button type="button" data-ds4000-step="-1" aria-label="${esc(t('Lùi một dòng','Previous line'))}">←</button><button type="button" data-ds4000-step="1" aria-label="${esc(t('Tiến một dòng','Next line'))}">→</button></nav></header><div class="ds4000-source">${source}</div></section></section>`;
 host.querySelectorAll?.('[data-ds4000-step]').forEach(button=>button.addEventListener('click',()=>digitSum4000Step(Number(button.dataset.ds4000Step))));
}
