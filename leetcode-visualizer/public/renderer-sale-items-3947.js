'use strict';
function renderSaleItems3947(v,language){
 const vi=language==='vi',t=(a,b)=>vi?a:b,x=v.locals||{},s=v.sale3947,{phase,batches,offer}=s,items=v.args[0],initial=v.args[1],balance=x.budget??initial;
 const esc=value=>String(value??'·').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const box=(i,gift=false)=>`<svg class="s7-box tone-${(i??0)%6} ${gift?'gift':''}" viewBox="0 0 40 40" role="img" aria-label="${i===null?t('Quà hợp lệ','Eligible gift'):t(gift?'Quà loại':'Mua loại',gift?'Gift type':'Purchased type')+' '+i}"><path d="M7 15h26v20H7zM4 10h32v7H4zM20 10v25"/>${gift?'<path d="M20 10C4 10 13-5 20 10c7-15 16 0 0 0"/>':''}<text x="20" y="30" text-anchor="middle">${i??'?'}</text></svg>`;
 const panel=(title,html)=>`<section class="s7-panel"><h4>${title}</h4>${html}</section>`;
 const group=(i,n,gift=false)=>`<span class="s7-group">${box(i,gift)}<b>× ${n}</b></span>`;
 const limits=new Map((x.boosted||[]).map(([price,limit,index])=>[index,limit]));
 const active=phase==='shop'&&!(v.line===19&&v.branch===false)&&Number.isInteger(x.index)?x.index:null;
 const paid=batches.reduce((n,b)=>n+b.count,0),free=batches.reduce((n,b)=>n+b.gifts.length,0);
 const titles={count:t('Đếm hệ số','Count factors'),gain:t('Gom các bội','Count multiples'),sort:t('Xếp lượt có quà theo giá','Sort gift-bearing slots by price'),shop:t('Mua lượt có quà rẻ trước','Buy cheaper gift-bearing slots first'),regular:t('Tiền dư → món rẻ nhất','Remainder → cheapest item'),result:t('Giỏ hàng tối ưu','An optimal basket')};
 let body=`<header class="s7-head"><b>${titles[phase]}</b><div class="s7-wallet"><small>◉ ${t('Còn','Left')}</small><strong data-sale-balance="${balance}">${balance}</strong><span>/ ${initial}</span></div></header><div class="s7-money" role="progressbar" aria-label="${t('Ngân sách còn lại','Remaining budget')}" aria-valuemin="0" aria-valuemax="${initial}" aria-valuenow="${balance}"><i style="width:${balance/initial*100}%"></i></div>`;
 body+=`<nav class="s7-phases">${[['count','①',t('Đếm','Count')],['gain','②',t('Bội','Multiples')],['sort','③',t('Xếp giá','Sort')],['shop','④',t('Mua','Buy')]].map(([key,icon,label])=>`<span class="${key===phase?'active':''}">${icon} ${label}</span>`).join('')}</nav>`;
 body+=`<div class="s7-items">${items.map(([f,p],i)=>`<article class="s7-item ${i===active||phase==='count'&&f===x.factor||phase==='gain'&&x.d&&f%x.d===0?'active':''}" data-sale-item="${i}"><header>${box(i)}<b>#${i}</b><span>◉ ${p}</span></header><div><small>${t('Hệ số','Factor')}</small><b>${f}</b></div><footer><small>${t('Lượt có quà','Gift slots')}</small><b data-slot-limit="${i}">${esc(limits.get(i))}</b></footer></article>`).join('')}</div>`;
 if(phase==='count'&&Array.isArray(x.freq)){
  body+=panel('freq[f]',`<div class="s7-frequencies">${x.freq.slice(1).map((n,i)=>`<div class="${i+1===x.factor?'active':''}" data-factor="${i+1}"><small>f = ${i+1}</small><strong>${n}</strong>${items.flatMap(([f],j)=>f===i+1?box(j):[]).join('')}</div>`).join('')}</div>`);
 }
 if(phase==='gain'&&x.d){
  const d=x.d,currentM=(v.line===10&&v.branch!==false||v.line===11)?x.m:null,old=v.oldValues?.multiples?.[d];
  body+=panel(`d = ${d} → ${d}, ${2*d}, ${3*d}, …`, `<div class="s7-multiples">${Array.from({length:Math.floor(x.max_factor/d)},(_,k)=>(k+1)*d).map(m=>`<div class="${m===currentM?'active':''}" data-multiple="${m}"><small>freq[${m}]</small><strong>${x.freq[m]}</strong></div>`).join('<b>+</b>')}<b>→</b><div><small>multiples[${d}]</small><strong data-multiple-total="${d}">${x.multiples[d]}</strong></div></div>${old!==undefined?`<div class="s7-equation">${old} + ${x.freq[x.m]} = <b>${x.multiples[d]}</b></div>`:''}<p class="s7-caption">${t('Trừ chính mình 1 loại → số lượt có quà','Subtract the item itself → number of gift-bearing slots')}</p>`);
 }
 if(['sort','shop'].includes(phase)&&Array.isArray(x.boosted)){
  const sorted=v.line>=16;
  body+=panel(sorted?t('Giá tăng dần →','Ascending price →'):t('Gom các lượt có quà','Build gift-bearing slots'),`<div class="s7-order">${x.boosted.map(([p,limit,i])=>`<div class="${i===active?'active':''}" data-sorted-item="${i}"><strong>◉ ${p}</strong><span>${box(i)}<b>+</b>${box(null,true)}</span><small>× ${limit} ${t('lượt','slots')}</small></div>`).join('')}</div>`);
 }
 if(active!==null){
  const factor=items[active][0],eligible=items.flatMap(([f],j)=>j!==active&&f%factor===0?[j]:[]);
  body+=panel(t('1 bản mua → tối đa 1 quà','1 purchased copy → at most 1 gift'),`<div class="s7-rule"><div>${box(active)}<b>f = ${factor}</b></div><strong aria-hidden="true">→</strong><div class="s7-targets">${items.map(([f],j)=>`<span class="${eligible.includes(j)?'eligible':'ineligible'}" data-eligible-target="${j}">${box(j,true)}<small>f = ${f}</small><b>${eligible.includes(j)?'✓':'×'}</b></span>`).join('')}</div></div><p class="s7-caption">${t('Khác loại · hệ số chia hết · mỗi cặp dùng 1 lần','Different type · divisible factor · each ordered pair once')}</p>`);
  if(x.cheapest!==undefined){
   const cheap=items.findIndex(([,p])=>p===x.cheapest),stop=x.price>=2*x.cheapest;
   body+=`<div class="s7-compare ${stop?'stop':''}"><span>${box(active)} + ${box(null,true)}<b>◉ ${x.price}</b></span><strong>${stop?'≥':'&lt;'}</strong><span>${box(cheap)} ${box(cheap)}<b>◉ ${2*x.cheapest}</b></span></div>`;
   if(stop&&v.line>=20)body+=`<p class="s7-caption">${t('Mua 2 món thường có giá rẻ hơn hoặc bằng → dừng','Two regular copies cost no more → stop')}</p>`;
  }
  if(offer)body+=`<div class="s7-take" data-offer-take="${offer.take}"><span>min(${offer.limit}, ⌊${offer.budget} / ${offer.price}⌋)</span><b>→ ${offer.take}</b><small>${t('lượt mua + quà','purchase + gift slots')}</small></div>`;
 }
 if(phase==='regular'&&x.extra!==undefined){
  const cheap=items.findIndex(([,p])=>p===x.cheapest);
  body+=panel(t('Mua thêm món rẻ nhất','Buy extra cheapest copies'),`<div class="s7-regular">${group(cheap,x.extra)}<span>◉ ${x.cheapest} / ${t('bản','copy')}</span></div>`);
 }
 body+=`<div class="s7-totals"><div><small>${t('Bản mua','Purchased')}</small><strong data-sale-paid="${paid}">${paid}</strong></div><b>+</b><div><small>${t('Quà','Gifts')}</small><strong data-sale-free="${free}">${free}</strong></div><b>=</b><div><small>total</small><strong>${esc(x.total)}</strong></div></div>`;
 if(batches.length){
  body+=panel(t('Giỏ hàng · quà không sinh thêm quà','Basket · gifts earn no more gifts'),`<div class="s7-basket">${batches.map((batch,k)=>`<div class="s7-batch ${s.pending&&k===batches.length-1?'pending':''}" data-batch="${k}"><div>${group(batch.index,batch.count)}<small>◉ ${batch.price*batch.count}</small></div>${batch.gifts.length?`<b aria-hidden="true">→</b><div class="s7-gifts">${batch.gifts.map(j=>`<span data-gift-pair="${batch.index}-${j}">${box(j,true)}<small>${t('Miễn phí','Free')}</small></span>`).join('')}</div>`:`<small>${t('Mua thường','Regular purchase')}</small>`}</div>`).join('')}</div>${s.pending?`<p class="s7-pending">◷ ${t('Đã đếm món · dòng kế trừ tiền','Copies counted · next line deducts payment')}</p>`:''}`);
 }
 if(v.final)body+=`<footer class="s7-result" data-sale-result="${v.result}"><small>✓ ${t('Tổng số món tối đa','Maximum total copies')}</small><strong>${v.result}</strong><span>${paid} ${t('mua','paid')} + ${free} ${t('quà','gifts')} · ◉ ${initial-balance} / ${initial}</span></footer>`;
 if(typeof steps!=='undefined'&&typeof stepIndex!=='undefined'&&!v.final){
  const next=steps.findIndex((step,i)=>i>stepIndex&&step.catalogLessonView?.sale3947?.phase!==phase);
  if(next>stepIndex)body+=`<button type="button" data-iv-step="${next-stepIndex}" class="s7-next">${t('Pha tiếp theo','Next phase')} ↓</button>`;
 }
 return `<section class="iv-scene si3947" data-guided-id="3947" data-sale-phase="${phase}">${body}</section>`;
}
