"use strict";

function cooking2162PictureModel(step, selectedPlan = null, selectedPress = null) {
  const view = step.cookingTime2162View;
  const final = view.phase === 'answer';
  const best = view.plans.findIndex(plan => plan.valid && plan.cost === view.answer);
  const planIndex = final && Number.isInteger(selectedPlan) && view.plans[selectedPlan]?.valid
    ? selectedPlan : final ? best : view.activePlan ?? view.plans.findIndex(plan => plan.valid);
  const plan = view.plans[planIndex];
  const pressIndex = final && Number.isInteger(selectedPress) && plan.events[selectedPress]
    ? selectedPress : view.pressIndex ?? (plan.events.length ? plan.events.length - 1 : null);
  const event = plan.events[pressIndex] ?? null;
  const typed = event ? plan.digits.slice(0, event.index + 1) : '';
  const padded = typed.padStart(4, '0');
  const display = plan.valid ? `${padded.slice(0,2)}:${padded.slice(2)}` : '—:—';
  return {view, final, planIndex, plan, pressIndex, event, typed, display,
    finger:event?.after ?? view.startAt, running:event?.total ?? 0};
}

function renderCookingTime2162View(step) {
  const host = $('treeView');
  if(!step.cookingTime2162View || !host) return;
  const t = (vi,en) => lang === 'vi' ? vi : en;
  const view = step.cookingTime2162View;
  const key = `${view.startAt}:${view.moveCost}:${view.pushCost}:${view.targetSeconds}:${view.phase}:${view.activePlan}:${view.pressIndex}`;
  if(host._micro2162Key !== key) {host._micro2162Plan = null;host._micro2162Press = null;}
  const model = cooking2162PictureModel(step, host._micro2162Plan, host._micro2162Press);
  const {final, planIndex, plan, pressIndex, event, display, finger, running} = model;
  const width = Math.max(220,(host.clientWidth || 550)-24);
  const controlX = width * .57, panelWidth = width - controlX - 14;
  const keySize = Math.min(34,(panelWidth-12)/3), stride = keySize+6;
  const keyX = controlX + (panelWidth - (3*keySize+12))/2;
  const keyY = 70;
  const point = digit => ({x:keyX + ((digit===0?1:(digit-1)%3)+.5)*stride-3, y:keyY + (digit===0?3:Math.floor((digit-1)/3))*stride + keySize/2});
  const keypad = Array.from({length:10},(_,digit) => {
    const p=point(digit),active=digit===finger;
    return `<g class="mc2162-key ${active?'finger':''} ${event&&digit===event.digit?'pressed':''}" data-digit="${digit}" transform="translate(${p.x-keySize/2},${p.y-keySize/2})"><rect width="${keySize}" height="${keySize}" rx="4"/><text x="${keySize/2}" y="${keySize/2+5}" text-anchor="middle">${digit}</text>${active?`<circle class="micro2162-finger" cx="${keySize-3}" cy="${keySize-3}" r="4"/>`:''}</g>`;
  }).join('');
  let movement='';
  if(event?.moved) {
    const a=point(event.before),b=point(event.digit),dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
    const inset=Math.min(18,keySize*.55),ux=dx/length,uy=dy/length;
    movement=`<circle class="micro2162-origin" cx="${a.x}" cy="${a.y}" r="${keySize*.4}"/><path class="micro2162-movement" d="M${a.x+ux*inset},${a.y+uy*inset} Q${(a.x+b.x)/2+12},${(a.y+b.y)/2} ${b.x-ux*inset},${b.y-uy*inset}" marker-end="url(#micro2162-arrow)"/>`;
  }
  const doorWidth = width*.51-16, doorX=14, doorY=39;
  const center=doorX+doorWidth/2;
  const height=Math.max(228,keyY+4*stride+5);
  const appliance=`<svg class="micro2162-appliance" viewBox="0 0 ${width} ${height}" role="img" aria-label="${t('Màn hình','Display')} ${display}, ${t('ngón tay tại','finger at')} ${finger}${event?`, ${event.before} → ${event.digit}, +${event.moveCharge} +${event.pushCharge} = ${event.total}`:''}"><defs><marker id="micro2162-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker></defs><rect class="micro2162-body" x="2" y="10" width="${width-4}" height="${height-15}" rx="12"/><rect class="micro2162-door" x="${doorX}" y="${doorY}" width="${doorWidth}" height="${height-70}" rx="7"/><path class="micro2162-handle" d="M${doorX+doorWidth+6},${height*.4} V${height*.7}"/><ellipse class="micro2162-plate" cx="${center}" cy="${height-83}" rx="${doorWidth*.34}" ry="10"/><path class="micro2162-bowl" d="M${center-doorWidth*.24},${height-108} Q${center},${height-63} ${center+doorWidth*.24},${height-108} Z"/><path class="micro2162-steam" d="M${center-12},${height-117} q-8,-10 0,-19 m12,19 q-8,-10 0,-19 m12,19 q-8,-10 0,-19"/><text class="micro2162-target" x="${center}" y="${doorY+28}" text-anchor="middle">${view.targetSeconds} s</text><rect class="micro2162-display" x="${controlX}" y="24" width="${panelWidth}" height="31" rx="4"/><text class="micro2162-clock" x="${controlX+panelWidth/2}" y="46" text-anchor="middle">${display}</text>${keypad}${movement}</svg>`;
  const plans = view.plans.map((item,index) => {
    const best=final&&item.valid&&item.cost===view.answer;
    return `<button class="micro2162-plan ${!item.valid?'invalid':''} ${index===planIndex?'active':''} ${best?'best':''}" type="button" data-micro2162-plan="${index}" ${!final||!item.valid?'disabled':''} aria-pressed="${index===planIndex}"><strong>${item.minutes}:${String(item.seconds).padStart(2,'0')}</strong><span>${item.valid?`${t('bấm','type')} ${item.digits}`:t('× ngoài 0…99','× outside 0…99')}</span><b>${item.valid?item.cost??'?':'×'}${best?' ✓':''}</b></button>`;
  }).join('<span class="micro2162-equal">=</span>');
  const sequence=plan.valid?[...plan.digits].map((digit,index)=>`<button class="micro2162-press ${index===pressIndex?'active':index<(pressIndex??-1)?'done':''}" type="button" data-micro2162-press="${index}" ${!final?'disabled':''} aria-pressed="${index===pressIndex}" aria-label="${t('Lần bấm','Press')} ${index+1}: ${digit}"><small>${index+1}</small><b>${digit}</b></button>`).join('<span class="micro2162-next" aria-hidden="true">→</span>'):'';
  const receipt=event?`<section class="micro2162-receipt" aria-live="polite"><header><strong>${event.before}${event.moved?' → ':' = '}${event.digit}</strong><span>${event.moved?t('di rồi bấm','move, then press'):t('giữ nguyên, chỉ bấm','stay, just press')}</span></header><div><span><small>${t('trước đó','before')}</small><b>${event.total-event.moveCharge-event.pushCharge}</b></span><em>+</em><span class="move"><small>${t('di phím','move')}</small><b>${event.moveCharge}</b></span><em>+</em><span class="push"><small>${t('bấm','press')}</small><b>${event.pushCharge}</b></span><em>=</em><span class="sum"><small>${t('tổng','total')}</small><b>${running}</b></span></div></section>`:`<small class="micro2162-hint">${plan.valid?t(`Bắt đầu ở phím ${view.startAt}.`,`Start at key ${view.startAt}.`):t('Phút và giây đều phải trong 0…99.','Both minutes and seconds must be within 0…99.')}</small>`;
  host.innerHTML=`<section class="micro2162-viz"><header><strong>${view.targetSeconds} ${t('giây','seconds')}</strong><span>${final?t(`Nhỏ nhất: ${view.answer}`,`Minimum: ${view.answer}`):t('Thử hai cách nhập','Try two representations')}</span></header><div class="micro2162-plans">${plans}</div>${appliance}<div class="micro2162-rates"><span>${t('Di phím','Move')} <b>+${view.moveCost}</b></span><span>${t('Bấm','Press')} <b>+${view.pushCost}</b></span></div><div class="micro2162-sequence">${sequence}</div>${receipt}${final?`<small class="micro2162-hint">${t('Bấm từng chữ số để xem lại chi phí.','Select each digit to replay its cost.')}</small>`:''}<details class="micro2162-proof"><summary>${t('Vì sao chỉ có 2 cách?','Why are there only two candidates?')}</summary><div><span>m : s</span><b>↔</b><span>(m−1) : (s+60)</span></div><small>${t('Cùng tổng giây · bỏ các số 0 ở đầu.','Same total seconds · omit leading zeroes.')}</small></details></section>`;
  host._micro2162Key=key;host._micro2162Step=step;host._micro2162Width=host.clientWidth;
  const refocus=(selector,name)=>host.querySelector(`${selector}="${name}"]`)?.focus({preventScroll:true});
  host.querySelectorAll?.('[data-micro2162-plan]').forEach(button=>button.addEventListener('click',()=>{
    host._micro2162Plan=Number(button.dataset.micro2162Plan);host._micro2162Press=null;
    renderCookingTime2162View(host._micro2162Step);refocus('[data-micro2162-plan',button.dataset.micro2162Plan);
  }));
  host.querySelectorAll?.('[data-micro2162-press]').forEach(button=>button.addEventListener('click',()=>{
    host._micro2162Press=Number(button.dataset.micro2162Press);
    renderCookingTime2162View(host._micro2162Step);refocus('[data-micro2162-press',button.dataset.micro2162Press);
  }));
  if(typeof ResizeObserver!=='undefined'&&!host._micro2162Observer){
    host._micro2162Observer=new ResizeObserver(()=>{if(host.querySelector('.micro2162-viz')&&host.clientWidth!==host._micro2162Width)renderCookingTime2162View(host._micro2162Step);});
    host._micro2162Observer.observe(host);
  }
}
