"use strict";
function renderCombination40Pictures(step) {
  const v=step.combination40View,vi=lang==='vi',f=v.stack.at(-1),x=v.locals,i=f?.i,current=x.current||[],used=new Set(v.indices),esc=cs39Escape;
  const label=(a,b)=>vi?a:b, glyph=(value,index,extra='')=>cs39Glyph(value,index,extra);
  const indexed=(value,index,extra='')=>`<span class="cs40-indexed"><small>[${index}]</small>${glyph(value,index,extra)}</span>`;
  const word=(values,positions)=>`<span class="cs39-word">${values.map((value,j)=>`${j?'<i>＋</i>':''}${positions?indexed(value,positions[j]):glyph(value,v.candidates.indexOf(value))}`).join('')||'<span class="cs39-empty">∅</span>'}</span>`;
  const focus=i??(f?.remain===0?v.indices.at(-1):f?.start);
  const pool=v.candidates.map((value,j)=>{
    const selected=used.has(j),locked=f&&j<f.start&&!selected,skipped=v.skipped.includes(j),cut=v.tooLarge===true&&i!==undefined&&j>=i;
    const compare=v.duplicate&&!v.duplicate.first&&j===i-1;
    const pips=Array.from({length:value},(_,k)=>`<circle cx="${12+k%8*7}" cy="${49+Math.floor(k/8)*5}" r="1.7"/>`).join('');
    return `<article class="cs40-candidate cs39-c${j%5} ${selected?'used':''} ${locked?'locked':''} ${skipped?'skipped':''} ${cut?'cut':''} ${j===i?'active':''} ${compare?'compare':''}" data-candidate-index="${j}" data-used="${selected}" data-skipped="${skipped}" data-cut="${cut}"><header>[${j}] ${j===f?.start?'↓':''}</header><svg viewBox="0 0 74 90" role="img" aria-label="${esc(`[${j}] = ${value}${selected?' ✓':''}`)}"><rect x="4" y="3" width="66" height="82" rx="11"/><text x="37" y="34">${value}</text>${pips}${skipped?'<path class="cs40-skip-mark" d="M12,72 L62,15"/>':''}</svg><footer>${selected?'✓':skipped?'↷':cut?'✕':locked?'×':j===i?'i ↑':'1×'}</footer></article>`;
  }).join('');
  let operation;
  if(v.phase==='sort')operation=`<code>sort()</code><strong>↑</strong><code>${label('Nhỏ → lớn','Small → large')}</code>`;
  else if(v.phase==='skip-duplicate')operation=`${indexed(v.candidates[i-1],i-1)}<strong>=</strong>${indexed(v.candidates[i],i,'removed')}<strong class="cs39-bad">↷</strong><code>${label('Cùng cấp','Same level')}</code>`;
  else if(v.phase==='allow')operation=v.duplicate.first?`<code>i = start</code><strong class="cs39-good">✓</strong>${indexed(v.candidates[i],i)}`:`${indexed(v.candidates[i-1],i-1)}<strong>≠</strong>${indexed(v.candidates[i],i)}<strong class="cs39-good">✓</strong>`;
  else if(['prune-check','return-pruned'].includes(v.phase))operation=`${indexed(v.candidates[i],i)}<strong>${v.tooLarge?'&gt;':'≤'}</strong><span class="cs40-remain"><small>remain</small><b>${f.remain}</b></span><strong class="${v.tooLarge?'cs39-bad':'cs39-good'}">${v.tooLarge?'↩':'✓'}</strong>`;
  else if(v.phase==='choose')operation=`${indexed(v.candidates[i],i,'preview')}<strong>→</strong><span class="cs39-slot">·</span>`;
  else if(v.phase==='append')operation=`<code>append</code><strong>＋</strong>${indexed(v.candidates[i],i)}`;
  else if(v.phase==='pop')operation=`${indexed(v.removed,v.removedIndex,'removed')}<strong>↩</strong><code>pop()</code>`;
  else if(v.phase==='save')operation=`${word(current)}<strong>→</strong><b class="cs39-good">result[${v.resultCount-1}] ✓</b>`;
  else if(v.phase==='zero-check')operation=`<code>remain == 0</code><strong class="${f.remain===0?'cs39-good':''}">${f.remain===0?'✓':'…'}</strong><b>${f.remain}</b>`;
  else if(v.phase==='done')operation=`<strong class="cs39-good">${v.resultCount} ✓</strong><code>return result</code>`;
  else if(['resume','return-solution','root-return','exhausted'].includes(v.phase))operation=`<strong>↩</strong><code>${f?`start=${f.start} · remain=${f.remain}`:label('Mọi nhánh hoàn tất','All branches returned')}</code>`;
  else operation=`<code>${v.phase==='define'?'def backtrack(start, remain)':v.phase==='current-init'?'current = []':'result = []'}</code>`;
  const sign=b=>b===null||b===undefined?'—':b?'✓':'✕';
  const gate=f&&i!==undefined?`<div class="cs40-gate"><code>i = start</code><b>${sign(v.duplicate?.first)}</b><strong>∨</strong><code>[i] ≠ [i−1]</code><b>${sign(v.duplicate?.different)}</b><strong class="${v.duplicate?.allowed===false?'cs39-bad':'cs39-good'}">→ ${v.duplicate? v.duplicate.allowed?'✓':'↷':'?'}</strong></div>`:'';
  const output=`<section class="cs39-card cs39-results-card"><header><span>result</span><strong class="cs39-good">${v.resultCount??'—'} ${v.resultReady?'✓':''}</strong></header><div class="cs39-results">${v.results.map((values,j)=>`<article data-combination="${values.join(',')}"><small>#${v.shownFrom+j+1}</small>${word(values)}<b>= ${v.target} ✓</b></article>`).join('')||`<span class="cs39-empty">${v.resultReady?'∅':'—'}</span>`}</div>${v.shownFrom?`<small>+${v.shownFrom} ${label('tổ hợp trước','earlier combinations')}</small>`:''}</section>`;
  const frames=v.stack.map((frame,j)=>`${j?'<span class="cs39-stack-arrow">→</span>':''}<span class="cs39-frame ${j===v.stack.length-1?'active':''}" data-frame="${frame.id}"><small>start ${frame.start}</small><b>${frame.remain}</b></span>`).join('')||'<span class="cs39-empty">∅</span>';
  const original=v.phase==='sort'?`<div class="cs40-original">${v.original.map((value,j)=>`<span><small>[${j}]</small><b>${value}</b></span>`).join('')}<strong>↓ sort</strong></div>`:'';
  $('treeView').innerHTML=`<div class="cs39-viz cs40-viz"><header class="cs39-heading"><span>#40 · Combination Sum II</span><b>L${v.source.line} ✓</b><span>${label('Sau dòng','After line')} ${v.source.line}</span></header><div class="cs39-operation">${operation}</div>${step.final?output:`<section class="cs39-card"><header><span>candidates ↑</span><small>i → i + 1 · 1× / ${label('vị trí','index')}</small></header>${original}<div class="cs40-pool">${pool}</div>${gate}</section>${v.currentReady?`<section class="cs39-card"><header><span>current</span><small>${label('Chỉ số tăng dần','Increasing indices')}</small></header><div class="cs39-current">${word(current,v.indices)}</div>${cs39SumPicture(v,vi)}</section>`:''}${output}`}<section class="cs39-card"><header><span>Call stack · remain</span><small>${label('Chung một current','One shared current')}</small></header><div class="cs39-stack">${frames}</div></section>${cs39Tree(v,vi,{prune:true})}</div>`;
  const root=$('treeView'),tree=root.querySelector?.('.cs39-tree'),pane=root.querySelector?.('.cs39-stack'),poolPane=root.querySelector?.('.cs40-pool'),focusCard=root.querySelector?.(`[data-candidate-index="${focus}"]`);
  if(tree&&v.currentId!==null){tree.scrollLeft=Math.max(0,Number(tree.dataset.focusX)-tree.clientWidth/2);tree.scrollTop=Math.max(0,Number(tree.dataset.focusY)-tree.clientHeight/2);}
  if(pane)pane.scrollLeft=pane.scrollWidth;
  if(poolPane&&focusCard){const a=focusCard.getBoundingClientRect(),b=poolPane.getBoundingClientRect();poolPane.scrollLeft+=a.x-b.x-poolPane.clientWidth/2+a.width/2;}
}
