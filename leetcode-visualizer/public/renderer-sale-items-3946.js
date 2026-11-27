"use strict";

// Read actual executed snapshots. Sparse tables retain their full length and implicit zeroes.
function renderSaleItems3946(v,language){
 const x=v.locals||{},vi=language==='vi',t=(a,b)=>vi?a:b;
 const items=v.args[0],budget=v.args[1],lines=typeof problemData!=='undefined'&&Array.isArray(problemData.code)?problemData.code:[];
 const lineOf=text=>lines.findIndex(line=>line.trim().startsWith(text))+1;
 const gainStart=lineOf('for f in range')||11,baseStart=lineOf('dp = [b // mn')||14;
 const update=lineOf('dp[b] = max')||19;
 const phase=v.final?'result':v.line<gainStart?'count':v.line<baseStart?'gain':v.line===baseStart?'base':'dp';
 const entries=table=>table?.__sparse__?table.entries:Array.isArray(table)?table.flatMap((n,i)=>n?[[i,n]]:[]):[];
 const cnt=new Map(entries(x.cnt)),gain=new Map(entries(x.gain));
 const icon=(i,gift=false)=>`<svg class="si3946-box type-${i%6} ${gift?'gift':''}" viewBox="0 0 32 32" aria-hidden="true"><path d="M5 11h22v17H5zM3 7h26v6H3zM16 7v21"/>${gift?'<path d="M16 7C5 7 9-3 16 7c7-10 11 0 0 0"/>':''}<text x="16" y="24" text-anchor="middle">${i}</text></svg>`;
 const completeF=phase==='count'?0:phase==='gain'?x.f-(v.source.trim().startsWith('gain[f] =')||v.branch===false?0:1):x.m;
 const active=phase==='count'||phase==='dp'?x.f:null;
 const cards=items.map(([f,p],i)=>{
  const known=Number.isInteger(completeF)&&f<=completeF;
  return `<article class="si3946-item ${!v.final&&f===active?'current':''}" data-item="${i}"><header>${icon(i)}<b>#${i}</b><span class="si3946-price">◉ ${p}</span></header><div class="si3946-factor">${t('Hệ số','Factor')} <b>${f}</b></div><div class="si3946-gift-rule"><span>cnt[${f}]</span><b>${cnt.get(f)||0}</b></div><div class="si3946-gift-rule"><span>gain[${f}]</span><b>${known?gain.get(f)||0:'·'}</b></div></article>`;
 }).join('');
 const phases=[['count',t('Đếm','Count')],['gain',t('Các bội','Multiples')],['base',t('Mua rẻ','Baseline')],['dp',t('DP ←','DP ←')]];
 const title={count:t('Gom các loại có cùng hệ số','Count item types sharing a factor'),gain:t('Cộng cnt ở các bội của f','Sum cnt at multiples of f'),base:t('Mỗi b ◉ mua được b // mn bản rẻ nhất','Each b ◉ buys b // mn cheapest copies'),dp:t('← Mỗi loại chỉ cộng gain một lần','← Add each type’s gain only once'),result:t('Kết quả tại đúng ngân sách','Result at the requested budget')};
 let table='';
 if(phase==='count'){
  table=`<section class="si3946-section"><header><b>cnt[f]</b><span>${t('Chỉ vẽ ô khác 0','Only nonzero cells shown')}</span></header><div class="si3946-sparse">${[...cnt].map(([f,n])=>`<div class="${f===x.f?'current':''}" data-factor="${f}"><small>f = ${f}</small><b>${n}</b><span>${items.flatMap(([factor],i)=>factor===f?icon(i):[]).join('')}</span></div>`).join('')||'<span>∅</span>'}</div></section>`;
 }else if(phase==='gain'){
  const f=x.f||1,multiples=[...cnt].filter(([j])=>j%f===0),computed=v.source.trim().startsWith('gain[f] =');
  table=`<section class="si3946-section"><header><b>f = ${f}</b><span>${f} / ${x.m} · ${t('Các ô còn lại = 0','Other cells = 0')}</span></header><div class="si3946-equation si3946-multiples">${multiples.map(([j,n])=>`<span class="si3946-multiple" data-multiple="${j}"><small>cnt[${j}]</small><b>${n}</b></span>`).join('<b>+</b>')||'<b>0</b>'}<b>→</b><span>gain[${f}] = <b data-gain-current="${f}">${computed?gain.get(f)||0:'?'}</b></span></div><div class="si3946-progress"><i style="width:${Math.min(100,Math.max(0,completeF)/1500*100)}%"></i></div><small class="si3946-caption">${f}, ${2*f}, ${3*f}, … ≤ 1500</small></section>`;
 }
 let dp='';
 if(Array.isArray(x.dp)){
  const current=phase==='dp'&&v.line>=update-1&&v.line<=update&&!(v.line===update-1&&v.branch===false)?x.b:null;
  const from=current===null?null:current-x.p,old=v.oldValues?.dp;
  const cells=x.dp.map((n,b)=>`<div class="si3946-dp-cell ${b===current?'current':''} ${b===from?'source':''} ${Array.isArray(old)&&old[b]!==n?'changed':''} ${v.final&&b===budget?'answer':''}" data-capacity="${b}" data-value="${n}"><small>≤ ${b} ◉</small><strong>${n}</strong></div>`).join('');
  const applied=v.line===update&&Array.isArray(old);
  const equation=applied?`<div class="si3946-equation" data-dp-updated="${x.b}"><span>max(${old[x.b]},</span><span class="si3946-dependency">dp[${x.b-x.p}] = ${old[x.b-x.p]}</span><b>+ ${x.g})</b><b>= ${x.dp[x.b]}</b></div>`:phase==='base'?`<div class="si3946-equation"><span>mn = ${x.mn} ◉</span><b>→</b><span>dp[b] = b // ${x.mn}</span></div>`:'';
  dp=`${equation}<section class="si3946-section"><header><b>dp[b] · ${t('Tổng số bản tối đa','Maximum total copies')}</b><span>${phase==='base'?t('Quà chưa cộng','Gifts not counted yet'):phase==='dp'?`f=${x.f} · p=${x.p} · g=${x.g??'·'}`:''}</span></header><div class="si3946-dp">${cells}</div></section>`;
 }
 const result=v.final?`<section class="si3946-section si3946-total" data-sale-result="${v.result}"><b>✓ dp[${budget}] = ${v.result}</b><div>${Array.from({length:Math.min(v.result,12)},()=>'<svg class="si3946-box" viewBox="0 0 32 32" aria-hidden="true"><path d="M5 11h22v17H5zM3 7h26v6H3zM16 7v21"/></svg>').join('')}${v.result>12?'<b>×'+v.result+'</b>':''}</div><small>${t('Bản mua + quà','Paid copies + gifts')}</small></section>`:'';
 let next='';
 if(typeof steps!=='undefined'&&typeof stepIndex!=='undefined'&&!v.final){
  const nextLine=phase==='count'?gainStart:phase==='gain'?baseStart:phase==='base'?update-3:lines.length;
  const index=steps.findIndex((step,i)=>i>stepIndex&&step.codeLines?.[0]>=nextLine);
  if(index>stepIndex)next=`<button type="button" data-iv-step="${index-stepIndex}" class="si3946-next-phase">${t('Pha tiếp theo','Next phase')} ↓</button>`;
 }
 return `<section class="iv-scene si3946" data-guided-id="3946" data-sale-phase="${phase}"><header class="si3946-head"><b>#3946 · m = ${x.m??1500}</b><span>◉ ${t('Ngân sách','Budget')} <strong>${budget}</strong></span></header><nav class="si3946-phases">${phases.map(([key,label])=>`<span class="${key===phase?'current':''}">${label}</span>`).join('')}</nav><p class="si3946-hint">${title[phase]}</p><div class="si3946-items">${cards}</div>${table}${dp}${result}${next}</section>`;
}
