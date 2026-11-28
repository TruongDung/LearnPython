'use strict';
function renderArithmetic413(v,language){
 const vi=language==='vi',t=(a,b)=>vi?a:b,nums=v.args[0],x=v.locals||{},groups=v.arithmetic413.groups;
 const esc=n=>String(n??'·').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const active=!v.final&&v.line>=4&&v.line<=9&&!(v.line===4&&v.branch===false)&&Number.isInteger(x.i);
 const updated=active&&[6,8,9].includes(v.line),equal=active&&nums[x.i]-nums[x.i-1]===nums[x.i-1]-nums[x.i-2];
 const panel=(title,html)=>`<section class="ar-panel"><h4>${title}</h4>${html}</section>`;
 let body=`<header class="ar-head"><b>${t('Ít nhất 3 số · hai hiệu liên tiếp bằng nhau','At least 3 values · equal adjacent differences')}</b><span>O(n) · O(1)</span></header>`;
 body+=panel(active?`${t('Đang xét','Inspecting')} i = ${x.i}`:t('Các số và hiệu kề nhau','Values and adjacent differences'),`<div class="ar-scroll"><div class="ar-array">${nums.map((n,i)=>`${i?`<div class="ar-gap ${active&&(i===x.i||i===x.i-1)?equal?'same':'different':''}" data-difference-index="${i}"><small>Δ</small><b>${nums[i]-nums[i-1]>=0?'+':''}${nums[i]-nums[i-1]}</b><span>→</span></div>`:''}<div class="ar-cell ${active&&i>=x.i-2&&i<=x.i?'active':''} ${active&&i===x.i?'focus':''}" data-arithmetic-index="${i}"><small>${i}</small><b>${n}</b></div>`).join('')}</div></div>`);
 if(active){
  const a=nums[x.i-1]-nums[x.i-2],b=nums[x.i]-nums[x.i-1];
  body+=`<div class="ar-comparison ${equal?'same':'different'}"><b>${a}</b><strong>${equal?'=':'≠'}</strong><b>${b}</b><span>${equal?t('Nối thêm đoạn','Extend the arithmetic run'):t('Đứt chuỗi → ending = 0','Run breaks → ending = 0')}</span></div>`;
 }
 body+=`<div class="ar-counters"><div><small>ending · ${t('kết thúc tại i','ending at i')}</small><strong data-ending="${esc(x.ending)}">${esc(x.ending)}</strong></div><div><small>answer · ${t('đã cộng','committed total')}</small><strong data-arithmetic-answer="${esc(x.answer)}">${esc(x.answer)}</strong></div></div>`;
 if(active&&v.line===6)body+=`<p class="ar-equation">ending: ${v.oldValues?.ending??x.ending-1} + 1 → <b>${x.ending}</b></p>`;
 if(active&&v.line===8)body+=`<p class="ar-equation reset">ending → 0</p>`;
 if(active&&v.line===9)body+=`<p class="ar-equation">answer: ${v.oldValues?.answer??x.answer} + ${x.ending} = <b>${x.answer}</b></p>`;
 const previews=[];
 if(v.final){for(const group of groups)for(let left=group.right-2;left>=group.first&&previews.length<6;left--)previews.push({left,right:group.right});}
 else if(updated){for(let left=x.i-2;left>=x.i-x.ending-1&&previews.length<6;left--)previews.push({left,right:x.i});}
 if(previews.length){
  body+=panel(v.final?t('Các đoạn minh hoạ đã được đếm','Examples of counted slices'):t('Các đoạn kết thúc tại i','Slices ending at i'),`<div class="ar-slices">${previews.map(({left,right})=>`<div class="ar-slice" data-slice-left="${left}" data-slice-right="${right}"><small>[${left}…${right}]</small><div>${nums.slice(left,right+1).map(n=>`<b>${n}</b>`).join('<span>→</span>')}</div></div>`).join('')}</div>${!v.final&&v.line!==9?`<p class="ar-pending">${t('Đã có ending · dòng sau cộng vào answer','ending updated · next line adds it to answer')}</p>`:''}${(v.final?x.answer:x.ending)>6?`<p class="ar-note">${t('Hiển thị 6 đoạn minh hoạ','Showing 6 example slices')}</p>`:''}`);
 }
 if(groups.length){
  const maximum=Math.max(1,...groups.map(g=>g.count));
  body+=panel(t('Mỗi vị trí đóng góp bao nhiêu đoạn','Slices contributed by each ending position'),`<div class="ar-hist-scroll"><div class="ar-hist">${groups.map(g=>`<div data-ending-index="${g.right}" data-ending-count="${g.count}"><b>${g.count}</b><i style="height:${8+g.count/maximum*65}px"></i><small>i=${g.right}</small></div>`).join('')}</div></div>`);
 }
 if(v.final)body+=`<footer class="ar-result" data-arithmetic-result="${v.result}"><small>✓ ${t('Số đoạn cấp số cộng','Arithmetic subarray count')}</small><strong>${v.result}</strong>${groups.length?`<span>${groups.length<=8?groups.map(g=>g.count).join(' + ')+' = '+v.result:'Σ ending = '+v.result}</span>`:''}</footer>`;
 if(typeof steps!=='undefined'&&typeof stepIndex!=='undefined'&&!v.final){const next=steps.findIndex((step,i)=>i>stepIndex&&step.catalogLessonView?.line===9);if(next>stepIndex)body+=`<button type="button" class="ar-next" data-iv-step="${next-stepIndex}">${t('Tới lần cộng tiếp theo','Next committed contribution')} ↓</button>`;}
 return `<section class="iv-scene arithmetic413" data-guided-id="413" data-arithmetic-phase="${v.final?'result':updated?'update':'compare'}">${body}</section>`;
}
