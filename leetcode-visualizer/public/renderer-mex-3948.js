'use strict';
function renderMex3948(v,language){
 const vi=language==='vi',t=(a,b)=>vi?a:b,x=v.locals||{},nums=v.args[0],p=v.mex3948,{phase,cuts}=p;
 const esc=n=>String(n??'·').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const panel=(title,html)=>`<section class="mx-panel"><h4>${title}</h4>${html}</section>`;
 const collecting=phase==='collect',scanning=phase==='mex',current=collecting&&p.rightReady&&[12,13].includes(v.line)&&v.branch!==false?x.right:null;
 const visited=collecting&&p.rightReady?(v.line===13?x.right+1:x.right):p.start;
 const consumed=cuts.at(-1)?.right??0;
 const tile=(n,i,cls='',symbol='')=>`<span class="mx-tile ${cls}" data-mex-index="${i}"><small>${i}</small><b>${esc(n)}</b><em>${symbol||'&nbsp;'}</em></span>`;
 let body=`<header class="mx-head"><b>${t('MEX · số ≥ 0 nhỏ nhất còn thiếu','MEX · smallest missing number ≥ 0')}</b><span>${cuts.length} ${t('đoạn đã cắt','segments cut')}</span></header>`;
 const titles={start:t('Lấy một đoạn đầu không rỗng','Take a nonempty prefix'),next:t('Xét phần còn lại','Consider the remaining suffix'),mex:t('Tìm số nhỏ nhất còn thiếu','Find the smallest missing number'),collect:t('Thu đủ 0…MEX−1 → cắt ngay','Collect 0…MEX−1 → cut immediately'),cut:t('Cắt đoạn → ghi MEX','Cut the prefix → append its MEX'),result:t('Dãy MEX lớn nhất theo thứ tự từ điển','Lexicographically maximum MEX array')};
 body+=`<nav class="mx-stages">${[['mex','①',t('Tìm MEX','Find MEX')],['collect','②',t('Thu đủ','Collect')],['cut','③',t('Cắt','Cut')]].map(([key,icon,label])=>`<span class="${phase===key?'active':''}">${icon} ${label}</span>`).join('')}</nav>`;
 body+=panel(titles[phase],`<div class="mx-scroll"><div class="mx-array">${nums.map((n,i)=>tile(n,i,`${i<consumed?'consumed':''} ${collecting&&i>=p.start&&i<visited?'selected':''} ${i===current?'focus':''}`,i<consumed?'✓':i===current?'↓':collecting&&i>=p.start&&i<visited?'✓':'')).join('')}</div></div>${collecting&&p.rightReady?`<div class="mx-boundary">[${p.start}, ${Math.max(p.start,visited)}) ${x.mex===0?`· ${t('Không có 0 → lấy đúng 1 ô','No zero → take exactly one item')}`:''}</div>`:''}`);
 if(scanning||collecting){
  const present=new Set(x.present||[]),limit=nums.length-p.start;
  body+=panel(scanning?t('Có mặt ✓ · còn thiếu ×','Present ✓ · missing ×'):t('MEX đã chốt','MEX determined'),`<div class="mx-ladder">${Array.from({length:limit+1},(_,n)=>`<div class="${present.has(n)?'present':'missing'} ${p.mexReady&&n===x.mex?'active':''}" data-mex-value="${n}" data-present="${present.has(n)}"><b>${n}</b><span>${present.has(n)?'✓':'×'}</span></div>`).join('')}</div><div class="mx-meter">${scanning?t('Đang thử','Testing'):'MEX'} <strong data-current-mex="${p.mexReady?x.mex:'pending'}">${p.mexReady?x.mex:'?'}</strong></div>`);
 }
 if(collecting&&p.needReady){
  const need=new Set(x.need||[]);
  body+=panel(t('Cần thu đủ các số này','Collect every value below'),`<div class="mx-need" data-mex-needed="${need.size}">${Array.from({length:x.mex},(_,n)=>`<span class="${need.has(n)?'waiting':'found'}" data-needed-value="${n}"><b>${n}</b><small>${need.has(n)?'○':'✓'}</small></span>`).join('')||`<b class="mx-zero">∅ · MEX = 0</b>`}</div>${need.size===0&&x.mex>0?`<p class="mx-ready">✓ ${t('Đã đủ → cắt ngay','Complete → cut now')}</p>`:''}`);
 }
 if(cuts.length){
  body+=panel(t('Các đoạn đã chốt','Committed segments'),`<div class="mx-cuts">${cuts.map((cut,j)=>`<div class="mx-cut" data-cut="${j}" data-left="${cut.left}" data-right="${cut.right}" data-cut-mex="${cut.mex}"><div class="mx-mini">${nums.slice(cut.left,cut.right).map(n=>`<b>${esc(n)}</b>`).join('')}</div><strong aria-hidden="true">→</strong><div class="mx-output"><small>MEX</small><b>${cut.mex}</b></div></div>`).join('')}</div>`);
 }
 body+=`<div class="mx-answer"><small>${t('Đang ghép','Result so far')}</small><div>${(x.answer||[]).map(n=>`<b>${n}</b>`).join('<span>→</span>')||'<span>∅</span>'}</div></div>`;
 if(v.final)body+=`<footer class="mx-result" data-mex-result="${esc(JSON.stringify(v.result))}"><small>✓ ${t('Kết quả','Result')}</small><strong>[${v.result.join(', ')}]</strong></footer>`;
 if(typeof steps!=='undefined'&&typeof stepIndex!=='undefined'&&!v.final){
  const index=steps.findIndex((step,i)=>i>stepIndex&&step.catalogLessonView?.mex3948?.cuts.length>cuts.length);
  if(index>stepIndex)body+=`<button type="button" class="mx-next" data-iv-step="${index-stepIndex}">${t('Tới lần cắt tiếp theo','Next committed cut')} ↓</button>`;
 }
 return `<section class="iv-scene mex3948" data-guided-id="3948" data-mex-phase="${phase}">${body}</section>`;
}
