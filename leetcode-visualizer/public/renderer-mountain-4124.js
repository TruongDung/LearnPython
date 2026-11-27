"use strict";

// Input, heap, trial peak and reconstructed mountain all come from executed snapshots.
function renderMountain4124(v,language){
 const vi=language==='vi',t=(a,b)=>vi?a:b,x=v.locals||{},nums=v.args[0],n=nums.length,phase=x.phase||'left';
 const esc=value=>String(value??'·').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const value=number=>typeof number==='number'?number.toLocaleString(vi?'vi-VN':'en-US'):esc(number);
 const card=(label,number,cls='')=>`<div class="mt4124-number ${cls}"><small>${label}</small><strong>${value(number)}</strong></div>`;
 const panel=(title,body)=>`<section class="mt4124-panel"><header>${title}</header>${body}</section>`;
 const side=x.side||phase,at=Number.isInteger(x.i)?side==='right'?n-1-x.i:x.i:null;
 const adjusted=Array.isArray(x.adjusted)?x.adjusted:null;
 const source=v.source.trim();
 const trial=phase==='peaks'&&Number.isInteger(x.peak)&&Number.isFinite(x.target_peak)&&['target_peak =','raise_cost =','candidate =','if candidate','best =','best_peak ='].some(s=>source.startsWith(s));
 const width=Math.max(440,n*55),height=290,values=[...nums,...(adjusted||[]),...(trial?[x.target_peak]:[])];
 const rawMin=values.length?Math.min(...values):0,rawMax=values.length?Math.max(...values):1,pad=Math.max(1,(rawMax-rawMin)*.18),low=rawMin-pad,high=rawMax+pad;
 const px=i=>n<=1?width/2:40+i*(width-80)/(n-1),py=a=>240-(a-low)/(high-low)*205;
 const active=phase==='peaks'?x.peak:at;
 const points=array=>array.map((a,i)=>`${px(i)},${py(a)}`).join(' ');
 const zero=low<=0&&high>=0?`<path class="mt4124-zero" d="M25 ${py(0)}H${width-20}"/><text class="mt4124-zero-label" x="9" y="${py(0)+4}">0</text>`:'';
 const original=nums.map((a,i)=>`<g class="${i===active?'current':''}"><circle class="mt4124-original-dot" cx="${px(i)}" cy="${py(a)}" r="6"/><text class="mt4124-original-label" x="${px(i)}" y="${py(a)-12}" text-anchor="middle">${a}</text><text class="mt4124-index" x="${px(i)}" y="275" text-anchor="middle">${i}</text></g>`).join('');
 const fitted=adjusted?`<polyline class="mt4124-target" points="${points(adjusted)}"/>${adjusted.map((a,i)=>`${a!==nums[i]?`<path class="mt4124-adjustment" d="M${px(i)} ${py(nums[i])}V${py(a)}" marker-end="url(#mt4124-arrow)"/>`:''}<circle class="mt4124-target-dot" cx="${px(i)}" cy="${py(a)}" r="5"/>${a!==nums[i]?`<text class="mt4124-target-label" x="${px(i)}" y="${py(a)+20}" text-anchor="middle">${a}</text>`:''}`).join('')}`:'';
 const peak=trial?`<path class="mt4124-trial" d="M${px(x.peak)-8} ${py(x.target_peak)+6}L${px(x.peak)} ${py(x.target_peak)-10}L${px(x.peak)+8} ${py(x.target_peak)+6}Z"/><path class="mt4124-trial-line" d="M${px(x.peak)} ${py(nums[x.peak])}V${py(x.target_peak)}"/><text class="mt4124-trial-label" x="${px(x.peak)+12}" y="${py(x.target_peak)-8}">${x.target_peak}</text>`:'';
 let body=panel(v.final&&adjusted?t('Một phương án tối ưu','One optimal mountain'):phase==='build'?t('Dựng đường núi','Constructing the mountain'):t('Đường đi của các giá trị','Array profile'),`<div class="mt4124-legend"><span>◌ ${t('Gốc','Original')}</span>${adjusted?`<span class="target">● ${t('Đã dựng','Constructed')}</span>`:''}${trial?`<span class="trial">▲ ${t('Đỉnh đang thử','Trial peak')}</span>`:''}<span>0 / −1 ✓</span></div><div class="mt4124-scroll"><svg class="mt4124-chart" viewBox="0 0 ${width} ${height}" style="min-width:${n>10?n*36:0}px" role="img" aria-label="${t('Giá trị gốc và đường núi đang dựng','Original values and reconstructed mountain')}"><defs><marker id="mt4124-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z"/></marker></defs>${zero}<polyline class="mt4124-original" points="${points(nums)}"/>${fitted}${original}${peak}</svg></div>`);
 if(Array.isArray(x.heap)){
  const heap=x.heap.slice(0,31).map(a=>-a),coords=heap.map((_,i)=>{const depth=Math.floor(Math.log2(i+1)),slot=i-(2**depth-1);return{x:440*(slot+1)/(2**depth+1),y:30+depth*64};});
  const lines=heap.map((_,i)=>{if(!i)return'';const a=coords[Math.floor((i-1)/2)],b=coords[i];return`<path d="M${a.x} ${a.y}L${b.x} ${b.y}"/>`;}).join('');
  const nodes=heap.map((a,i)=>`<g class="${!i?'top':''}"><circle cx="${coords[i].x}" cy="${coords[i].y}" r="21"/><text x="${coords[i].x}" y="${coords[i].y+5}" text-anchor="middle">${a}</text></g>`).join('');
  const formula=Number.isInteger(x.i)&&Number.isFinite(x.transformed)&&!source.startsWith('for i, value')?`<div class="mt4124-equation">${x.value} − ${x.i} = <b>${x.transformed}</b></div>`:'';
  body+=panel((side==='right'?'← ':'→ ')+t('Max-heap · lớn nhất ở gốc','Max-heap · largest value at the root'),`${formula}<svg class="mt4124-heap" viewBox="0 0 440 ${Math.max(80,...coords.map(p=>p.y+30))}" role="img" aria-label="${t('Max-heap của các giá trị đã đổi','Max-heap of transformed values')}">${lines}${nodes}</svg>${x.heap.length>31?'<small>31 / '+x.heap.length+'</small>':''}<div class="mt4124-numbers">${card(t('Chi phí phía này','Cost on this side'),x.cost)}</div>`);
  if(v.oldValues.cost!==undefined&&source==='cost += largest - transformed')body+=`<div class="mt4124-equation">${v.oldValues.cost} + (${x.largest} − ${x.transformed}) = <b>${x.cost}</b></div>`;
 }
 if(phase==='peaks'){
  const currentCandidate=['candidate =','if candidate','best =','best_peak ='].some(s=>source.startsWith(s))&&Number.isInteger(x.peak);
  body+=panel(t('Chi phí tại đỉnh đang thử','Cost of the current trial peak'),`<div class="mt4124-numbers">${card(t('Trái','Left'),x.left_part)}${card(t('Phải','Right'),x.right_part)}${card(t('Tăng đỉnh','Raise peak'),trial&&['raise_cost =','candidate =','if candidate','best =','best_peak ='].some(prefix=>source.startsWith(prefix))?x.raise_cost:null)}</div><div class="mt4124-equation">${currentCandidate?`${x.left_part} + ${x.right_part} + ${x.raise_cost} = <b>${x.candidate}</b>`:'·'}</div>`);
  body+=`<div class="mt4124-numbers">${card(t('Tốt nhất đã thấy','Best seen'),x.best,'good')}${card(t('Đỉnh được giữ','Retained peak'),x.best_peak>=0?x.best_peak:null)}</div>`;
 }
 if(adjusted){body+=panel(t('Mỗi ô cần bao nhiêu bước?','How many unit edits per cell?'),`<div class="mt4124-edits">${nums.map((before,i)=>{const change=x.changes?.[i];return`<div class="${i===x.best_peak?'peak':''}" data-edit-index="${i}" data-adjusted="${adjusted[i]}"><small>#${i}</small><span>${before} → <b>${adjusted[i]}</b></span><strong>${change===undefined?'·':change>0?'+'+change:String(change)}</strong><small>${change===undefined?'':Math.abs(change)+' '+t('bước','edits')}</small></div>`;}).join('')}</div>`);}
 if(v.final)body+=`<footer class="mt4124-result ${v.result===-1?'impossible':''}" data-mountain-result="${v.result}"><small>${v.result===-1?'✕ '+t('Cần ít nhất 3 ô để có đỉnh trong','At least 3 values are needed for an internal peak'):'✓ '+t('Ít bước nhất','Minimum operations')}</small><strong>${v.result}</strong>${Array.isArray(x.changes)?`<span>${x.changes.map(a=>Math.abs(a)).join(' + ')} = ${v.result}</span>`:''}</footer>`;
 let jump='';
 if(typeof steps!=='undefined'&&typeof stepIndex!=='undefined'&&!v.final){const next=steps.findIndex((s,i)=>i>stepIndex&&s.catalogLessonView?.locals.phase&&s.catalogLessonView.locals.phase!==phase);if(next>stepIndex)jump=`<button class="mt4124-jump" type="button" data-iv-step="${next-stepIndex}">${t('Pha tiếp theo','Next phase')} ↓</button>`;}
 const phases=[['left','→ '+t('Trái','Left')],['right','← '+t('Phải','Right')],['peaks','▲ '+t('Thử đỉnh','Try peaks')],['build','✓ '+t('Dựng núi','Build')]];
 return `<section class="mt4124" data-mountain-id="4124" data-mountain-phase="${phase}"><header class="mt4124-heading"><b>#4124</b><span>${t('Giá trị 0 và âm được phép','Zero and negative values are allowed')}</span></header><nav class="mt4124-phases">${phases.map(([key,name])=>`<span class="${key===phase?'active':''}">${name}</span>`).join('')}</nav>${body}${jump}</section>`;
}
