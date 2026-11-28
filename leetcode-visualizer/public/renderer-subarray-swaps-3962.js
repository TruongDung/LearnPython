'use strict';
function renderSubarraySwaps3962(v,language){
 const vi=language==='vi',t=(a,b)=>vi?a:b,x=v.locals||{},p=v.swap3962,nums=v.args[0],k=v.args[1],best=p.best;
 const esc=n=>String(n??'·').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const panel=(title,html)=>`<section class="sw-panel"><h4>${title}</h4>${html}</section>`;
 const swaps=v.final?(best?.swaps||[]):v.line>=6&&v.line<=13?p.swaps:[],left=v.final?best?.left:x.left,right=v.final?best?.right:x.right;
 const windowReady=v.final||v.line>=5&&v.line<=13&&!(v.line===5&&v.branch===false)&&Number.isInteger(left)&&Number.isInteger(right)&&left<=right;
 const after=[...nums];for(const pair of swaps)[after[pair.inside],after[pair.outside]]=[after[pair.outside],after[pair.inside]];
 const comparing=!v.final&&[9,10,11,12].includes(v.line)&&!(v.line===9&&v.branch===false)&&Number.isInteger(x.i)&&p.insideIndices[x.i]!==undefined&&p.outsideIndices[x.i]!==undefined;
 const currentPair=comparing?{inside:p.insideIndices[x.i],outside:p.outsideIndices[x.i]}:null;
 const width=Math.max(280,nums.length*52+36),unit=(width-36)/nums.length,peak=Math.max(1,...nums.map(Math.abs)),baseline=115;
 const bars=after.map((value,i)=>{
  const height=Math.abs(value)/peak*68,pos=18+i*unit+unit/2,inside=windowReady&&i>=left&&i<=right,active=currentPair&&(i===currentPair.inside||i===currentPair.outside);
  return `<g class="sw-bar ${inside?'inside':'outside'} ${active?'focus':''}" data-bar-index="${i}" data-bar-value="${value}"><rect x="${pos-17}" y="${value>=0?baseline-height:baseline}" width="34" height="${Math.max(2,height)}" rx="4"/><text x="${pos}" y="${value>=0?baseline-height-8:baseline+height+16}">${value}</text><text class="sw-index" x="${pos}" y="218">${i}</text></g>`;
 }).join('');
 let arrow='';if(currentPair){const a=18+(currentPair.inside+.5)*unit,b=18+(currentPair.outside+.5)*unit;arrow=`<path class="sw-arrow" d="M${a} 31 Q${(a+b)/2} 0 ${b} 31"/>`;}
 let body=`<header class="sw-head"><b>${v.final?t('Một phương án đạt tổng lớn nhất','A maximum-sum witness'):t('Chọn đoạn · đổi số nhỏ lấy số lớn','Choose a window · replace small with large')}</b><span>${swaps.length} / ${k} ${t('lần đổi','swaps')}</span></header>`;
 const chart=`<div class="sw-chart-scroll"><svg class="sw-chart" viewBox="0 0 ${width} 235" style="min-width:${width}px" role="img" aria-label="${t('Mảng sau các lần đổi đã thực hiện','Array after committed swaps')}"><defs><marker id="sw3962-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="currentColor"/></marker></defs>${windowReady?`<rect class="sw-window" x="${18+left*unit-3}" y="38" width="${(right-left+1)*unit+6}" height="165" rx="9"/>`:''}<path class="sw-zero" d="M10 ${baseline}H${width-10}"/>${bars}${arrow}</svg></div>`;
 body+=panel(windowReady?`${t('Đoạn','Window')} [${left}…${right}] · ${t('Tím: bên trong · xám: bên ngoài','Purple: inside · gray: outside')}`:t('Thử các đoạn liên tiếp không rỗng','Try nonempty contiguous windows'),chart);
 const scoreReady=v.final||v.line>=8&&v.line<=13;
 body+=`<div class="sw-scores"><div><small>${t('Tổng đoạn đang xét','Current window sum')}</small><strong data-window-score="${scoreReady?(v.final?best.score:x.score):'pending'}">${scoreReady?(v.final?best.score:x.score):'·'}</strong></div><div><small>answer · ${t('Tốt nhất đã chốt','Best committed')}</small><strong data-best-score="${esc(x.answer)}">${esc(x.answer)}</strong></div></div>`;
 const pile=(values,indices,label,cls)=>panel(label,`<div class="sw-pile ${cls}">${values.map((n,i)=>`<div class="${i<swaps.length?'used':''} ${comparing&&i===x.i?'focus':''}"><b>${esc(n)}</b><small>#${indices[i]}</small><span>${i<swaps.length?'✓':i===0?'↓':''}</span></div>`).join('')||'<span>∅</span>'}</div>`);
 if(!v.final&&v.line>=6&&v.line<=13){
  body+=`<div class="sw-piles">${pile(x.inside,p.insideIndices,t('Trong đoạn · nhỏ trước ↑','Inside · smallest first ↑'),'inside')}${v.line>=7?pile(x.outside,p.outsideIndices,t('Ngoài đoạn · lớn trước ↓','Outside · largest first ↓'),'outside'):panel(t('Ngoài đoạn','Outside'),'…')}</div>`;
 }
 if(comparing){
  const low=x.inside[x.i],high=x.outside[x.i],gain=high-low,applied=v.line===12,stopped=[10,11].includes(v.line)&&gain<=0;
  body+=`<div class="sw-comparison ${stopped?'stop':''}" data-swap-gain="${gain}"><span><small>${t('Ra ngoài','Move out')}</small><b>${low}</b><em>#${currentPair.inside}</em></span><strong>⇄</strong><span><small>${t('Vào đoạn','Move in')}</small><b>${high}</b><em>#${currentPair.outside}</em></span></div>`;
  body+=`<div class="sw-equation">Δ = ${high} − (${low}) = <b>${gain>0?'+':''}${gain}</b></div>`;
  if(applied)body+=`<p class="sw-caption applied">✓ ${esc(v.oldValues?.score??x.score-gain)} + ${gain} = ${x.score}</p>`;
  else if(stopped)body+=`<p class="sw-caption">${t('Không tăng tổng → dừng đổi cho đoạn này','No improvement → stop swapping this window')}</p>`;
  else body+=`<p class="sw-caption">${t('Đang xét · chưa đổi','Considering · not swapped yet')}</p>`;
 }
 if(best){
  body+=`<div class="sw-best"><span>★ [${best.left}…${best.right}]</span><b>${best.score}</b><small>${best.swaps.length} / ${k} ${t('lần đổi','swaps')}</small></div>`;
 }
 if(v.final){
  body+=panel(t('Các lần đổi của phương án này','Swaps in this witness'),swaps.length?`<div class="sw-plan">${swaps.map((pair,i)=>`<div data-witness-swap="${i}"><span>#${pair.inside} <b>${nums[pair.inside]}</b></span><strong>⇄</strong><span>#${pair.outside} <b>${nums[pair.outside]}</b></span><em>+${pair.gain}</em></div>`).join('')}</div>`:`<p class="sw-caption">✓ ${t('Không cần đổi','No swaps needed')}</p>`);
  body+=`<div class="sw-sum">${after.slice(left,right+1).map(n=>`<b>${n<0?'('+n+')':n}</b>`).join('<span>+</span>')}<span>=</span><strong>${v.result}</strong></div><footer class="sw-result" data-swap-result="${v.result}"><small>✓ ${t('Tổng lớn nhất','Maximum subarray sum')}</small><strong>${v.result}</strong></footer>`;
 }
 if(typeof steps!=='undefined'&&typeof stepIndex!=='undefined'&&!v.final){
  const next=steps.findIndex((step,i)=>i>stepIndex&&step.catalogLessonView?.line===13);
  if(next>stepIndex)body+=`<button type="button" class="sw-next" data-iv-step="${next-stepIndex}">${t('Tới lúc chốt đoạn','Finish this window')} ↓</button>`;
 }
 return `<section class="iv-scene swaps3962" data-guided-id="3962" data-swap-phase="${v.final?'result':comparing?'compare':'window'}">${body}</section>`;
}
