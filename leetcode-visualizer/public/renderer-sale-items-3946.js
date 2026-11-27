"use strict";

// Each picture reads immutable native-Python snapshots, including the purchase witness.
function renderSaleItems3946(v, language) {
  const x=v.locals||{},vi=language==='vi',t=(a,b)=>vi?a:b;
  const esc=a=>String(a??'·').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const items=v.args[0],budget=v.args[1],phase=x.phase||'gifts',active=x.item;
  const icon=(index,gift=false)=>`<svg class="si3946-box ${gift?'gift':''} type-${index%6}" viewBox="0 0 32 32" aria-hidden="true"><path d="M5 11h22v17H5zM3 7h26v6H3zM16 7v21"/>${gift?'<path d="M16 7C5 7 9-3 16 7c7-10 11 0 0 0"/>':''}<text x="16" y="24" text-anchor="middle">${index}</text></svg>`;
  const pile=(index,count,gift=false)=>`<div class="si3946-pile" data-count="${count}">${count?Array.from({length:Math.min(count,8)},()=>icon(index,gift)).join(''):'<span class="si3946-empty">·</span>'}${count>8?'<b>×'+count+'</b>':''}</div>`;
  const titles={gifts:t('Mua lần đầu → mở quà','First purchase → unlock gifts'),dp:t('← Ngân sách giảm: mỗi loại chỉ mở một lần','← Descending budgets: unlock each type once'),fill:t('Tiền dư → mua bản rẻ nhất','Leftover money → cheapest copies'),cart:t('Xếp giỏ: trả tiền + quà','Build the cart: paid + free')};
  const phases=[['gifts','♧',t('Quà','Gifts')],['dp','▦',t('Chọn','Choose')],['fill','◉',t('Mua thêm','Repeat')],['cart','▱',t('Giỏ','Cart')]];
  const cards=items.map(([factor,price],i)=>{
    const collecting=phase==='gifts'&&active===i&&v.line>=12&&v.line<=16;
    const gifts=collecting?(x.free||[]):x.gifts?.[i];
    const current=!v.final&&phase!=='fill'&&active===i;
    return `<article class="si3946-item ${current?'current':''} ${phase==='fill'&&x.cheapest===i?'cheapest':''}" data-item="${i}"><header>${icon(i)}<strong>#${i}</strong><span class="si3946-price">◉ ${price}</span></header><div class="si3946-factor">${t('Hệ số','Factor')} <b>${factor}</b></div><div class="si3946-gift-rule"><span>1 ${t('mua','paid')}</span><b>→</b><span>${gifts===undefined?'?':gifts.length} ${t('quà','free')}</span></div><div class="si3946-gifts" aria-label="${esc(t('Các quà đã tìm','Discovered gifts'))}">${gifts===undefined?'<span>· · ·</span>':gifts.length?gifts.map(j=>`<span class="si3946-mini" data-gift="${j}">${icon(j,true)}</span>`).join(''):'<span>∅</span>'}</div></article>`;
  }).join('');
  let equation='';
  if(phase==='gifts'&&v.line>=14&&v.line<=16&&Number.isInteger(x.other)){
    const self=x.other===active;
    equation=`<div class="si3946-equation" data-remainder="${esc(x.remainder)}">${icon(active)}<span>→</span>${icon(x.other,true)}<b>${items[x.other][0]} % ${items[active][0]} = ${esc(x.remainder)}</b><span>${self?t('Cùng loại: bản trả tiền','Same type: paid copy'):v.line>=15?(x.remainder===0?'✓ '+t('Quà','Gift'):'✕'):''}</span></div>`;
  }
  let dp='';
  if(Array.isArray(x.dp)){
    const current=phase==='dp'&&v.line>=24&&v.line<=31&&!(v.line===24&&v.branch===false)?x.capacity:null;
    const from=current===null?null:current-items[active][1],old=v.oldValues?.dp;
    const cells=x.dp.map((count,j)=>`<div class="si3946-dp-cell ${j===current?'current':''} ${j===from?'source':''} ${Array.isArray(old)&&old[j]!==count?'changed':''} ${phase==='fill'&&j===x.capacity?'current':''}" data-capacity="${j}" data-value="${count}"><small>≤ ${j} ◉</small><strong>${count}</strong></div>`).join('');
    dp=`<section class="si3946-section"><header><b>${t('Số bản tối đa · mua lần đầu','Maximum copies · first purchases')}</b><span>dp[≤ ◉]</span></header><div class="si3946-dp">${cells}</div></section>`;
    if(phase==='dp'&&v.line>=27&&v.line<=31){
      const decided=v.line>=28;
      equation=`<div class="si3946-equation" data-take="${decided?x.take:'pending'}"><span class="si3946-dependency">dp[${from}] <b>${x.base}</b></span><span>+</span><span>${icon(active)}<b>${x.gain[active]}</b></span><b>= ${x.candidate}</b>${decided?`<span class="${x.take?'accepted':'rejected'}">${x.take?' > ':' ≤ '}${x.kept} ${x.take?'✓':'−'}</span>`:''}</div>`;
    }
  }
  let fill='';
  if(phase==='fill'&&x.best_path!==undefined){
    const current=v.line>=38&&v.line<=42;
    fill=`<section class="si3946-section"><header><b>${t('Một lần mở quà + các bản mua thêm','First-purchase bundles + repeat copies')}</b><span>${t('Đang giữ','Best kept')}: ${x.best}</span></header>${current?`<div class="si3946-equation"><span>dp[${x.capacity}] = ${x.dp[x.capacity]}</span><b>+</b><span>(${budget} − ${x.capacity}) ÷ ${items[x.cheapest][1]} = ${x.extra}</span></div>`:''}<div class="si3946-choice"><div>${(x.best_path||[]).map(i=>icon(i,true)).join('')||'∅'}<small>${t('Các loại đã chọn','Chosen types')}</small></div><b>+</b><div>${pile(x.cheapest,x.best_extra||0)}<small>${t('Bản rẻ nhất · không mở quà lại','Cheapest repeats · no new gift unlocks')}</small></div></div></section>`;
  }
  let cart='';
  if(phase==='cart'){
    const paid=x.paid_counts||[],free=x.free_counts||[],paidTotal=paid.reduce((a,b)=>a+b,0),freeTotal=free.reduce((a,b)=>a+b,0);
    cart=`<section class="si3946-section si3946-cart" data-sale-cart="${v.final?'final':'building'}"><header><b>${t('Giỏ hàng','Shopping cart')}</b><span>${v.final?'✓ '+t('Tối đa','Maximum'):t('Đang xếp','Building')}</span></header><div class="si3946-cart-head"><b>#</b><b>◉ ${t('Mua','Paid')}</b><b>♧ ${t('Quà','Free')}</b></div>${items.map((_,i)=>`<div class="si3946-cart-row" data-cart-item="${i}"><b>${i}</b>${pile(i,paid[i]||0)}${pile(i,free[i]||0,true)}</div>`).join('')}<footer><b>${paidTotal} ${t('mua','paid')} + ${freeTotal} ${t('quà','free')} = ${paidTotal+freeTotal}</b>${x.remaining!==undefined?`<span>◉ ${x.spent} / ${budget} · ${t('Còn','Left')} ${x.remaining}</span>`:''}</footer></section>`;
  }
  if(phase==='cart'&&dp)dp=`<details class="si3946-history"><summary>▦ ${t('Bảng ngân sách','Budget table')}</summary>${dp}</details>`;
  const lines=typeof problemData!=='undefined'&&Array.isArray(problemData.code)?problemData.code:[],start=Math.max(0,v.line-4);
  const source=(lines.length?lines.slice(start,v.line+3).map((line,i)=>({line,number:start+i+1})):[{line:v.source,number:v.line}]).map(({line,number})=>`<div class="${number===v.line?'current':''}" data-code-line="${number}" ${number===v.line?'aria-current="step"':''}><span>${number}</span><code>${esc(line)}</code></div>`).join('');
  return `<section class="iv-scene si3946" data-guided-id="3946" data-sale-phase="${esc(phase)}"><header class="si3946-head"><b>#3946</b><span>◉ ${t('Ngân sách','Budget')} <strong>${budget}</strong></span></header><nav class="si3946-phases">${phases.map(([key,icon,label])=>`<span class="${phase===key?'current':''}">${icon} ${label}</span>`).join('')}</nav><p class="si3946-hint">${titles[phase]}</p><div class="si3946-items">${cards}</div>${equation}${dp}${fill}${cart}<section class="iv-debug"><header><strong>${t('Dòng','Line')} ${v.line}</strong><nav><button type="button" data-iv-step="-1" aria-label="${esc(t('Lùi một dòng','Previous line'))}">←</button><button type="button" data-iv-step="1" aria-label="${esc(t('Tiến một dòng','Next line'))}">→</button></nav></header><div class="iv-source">${source}</div></section></section>`;
}
