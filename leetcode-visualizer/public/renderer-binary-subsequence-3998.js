'use strict';

function renderBinarySubsequence3998(v,language){
 const t=(vi,en)=>language==='vi'?vi:en,esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const x=v.locals||{},[s,patterns]=v.args,line=v.line;
 const query=Number.isInteger(x.query_index)?x.query_index:-1,pattern=query>=0?patterns[query]:null;
 const answers=Array.isArray(x.answer)?x.answer:[];
 const building=!!pattern&&line>=10,checking=!!pattern&&(line>=19&&line<=24||line>=25&&x.possible===false),witness=!!pattern&&line>=25;
 const target=building&&Array.isArray(x.target)?x.target:[];
 const current=witness&&Array.isArray(x.current)?x.current:[...s];
 const cursor=Number.isInteger(x.index)&&(line>=11&&line<=24||checking||line>=28&&line<=32)?x.index:null;
 const pair=witness&&line>=30&&line<=32&&Number.isInteger(x.zero_index)?[x.index,x.zero_index]:null;
 const pending=!!pattern&&line>=13&&line<=14&&pattern[x.index]==='?'?x.index:null;
 const width=s.length*42;
 function strip(values,role){
  return `<div class="bs3998-scroll"><div class="bs3998-track" style="width:${width}px">${role==='source'&&pair?`<svg class="bs3998-move ${line===30?'pending':''}" viewBox="0 0 ${width} 32" role="img" aria-label="${esc(t('Đưa số 0 sang trái','Move the zero left'))}"><path d="M${pair[1]*42+21} 29 Q${pair[1]*42+21} 8 ${pair[1]*42+8} 8 H${pair[0]*42+21} M${pair[0]*42+21} 8 l7 -5 M${pair[0]*42+21} 8 l7 5"/></svg>`:''}<div class="bs3998-cells">${values.map((char,i)=>{
   const committed=role==='source'||i<target.length,chosen=role==='target'&&pending===i;
   const shown=chosen?x.char:char;
   return `<span class="bs3998-cell bit-${esc(shown)} ${cursor===i?'active':''} ${checking&&i<=cursor?'prefix':''} ${checking&&i===cursor?'cut':''} ${pair?.includes(i)&&role==='source'?'paired':''} ${committed?'':'planned'} ${chosen?'chosen':''}" data-index="${i}" data-role="${role}" data-resolved="${committed}"><b>${esc(shown)}</b><small>${i}</small>${chosen?'<em>?</em>':''}</span>`;
  }).join('')}</div></div></div>`;
 }
 const targetCells=[...s].map((_,i)=>i<target.length?target[i]:pattern?pattern[i]:'·');
 const compare=checking&&line>=22?`<span class="bs3998-comparison ${x.target_zeroes<x.source_zeroes?'blocked':'ok'}">${x.target_zeroes} ${x.target_zeroes<x.source_zeroes?'<':'≥'} ${x.source_zeroes} ${x.target_zeroes<x.source_zeroes?'✕':'✓'}</span>`:'';
 const tally=checking?`<section class="bs3998-prefix"><header><b>${t('Số 0 trước biên','Zeroes before the cut')}</b>${compare}</header><div><span>s</span><div>${Array.from({length:x.source_zeroes||0},()=>'<i></i>').join('')||'∅'}</div><b>${x.source_zeroes??0}</b></div><div><span>target</span><div>${Array.from({length:x.target_zeroes||0},()=>'<i></i>').join('')||'∅'}</div><b>${x.target_zeroes??0}</b></div></section>`:'';
 const need=pattern&&line>=6&&line<=15&&Number.isInteger(x.need)?`<span class="bs3998-need ${x.need<0?'blocked':''}"><b>?</b> → 0 <strong>${x.need}</strong></span>`:'';
 return `<section class="bs3998" data-binary-subsequence="3998"><nav class="bs3998-queries" aria-label="${esc(t('Các mẫu đích','Target patterns'))}">${patterns.map((p,i)=>`<span class="${query===i?'active':''} ${i<answers.length?answers[i]?'accepted':'rejected':''}" data-query="${i}"><b>${esc(p)}</b><i>${i<answers.length?answers[i]?'✓':'✕':'·'}</i></span>`).join('')}</nav>
  <div class="bs3998-conservation"><span>0 ←</span><b>Σ 0 = ${x.zeroes??s.split('0').length-1}</b>${need}</div>
  <section class="bs3998-row"><header><b>${witness?t('Đang biến đổi','Current'):t('Nguồn','Source')}</b><code>${witness?'current':'s'}</code>${pair?'<span class="bs3998-sort">[1, 0] → [0, 1]</span>':''}</header>${strip(current,'source')}</section>
  <section class="bs3998-row"><header><b>${t('Đích','Target')}</b><code>${pattern?esc(pattern):'···'}</code></header>${strip(targetCells,'target')}</section>
  ${tally}
  ${witness&&Array.isArray(x.moves)&&x.moves.length?`<div class="bs3998-moves">${x.moves.map(([left,right])=>`<span>0: ${right} → ${left}</span>`).join('')}</div>`:''}
  ${pattern&&answers.length>query?`<div class="bs3998-status ${answers[query]?'accepted':'rejected'}">${answers[query]?'✓ '+t('Biến đổi được','Reachable'):'✕ '+t('Không biến đổi được','Unreachable')}</div>`:''}
 </section>`;
}
