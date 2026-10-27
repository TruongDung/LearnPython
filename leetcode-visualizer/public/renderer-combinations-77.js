function renderCombinations77Pictures(step) {
 const v=step.combinations77View,host=$('treeView');if(!host||!v)return;
 const t=(vi,en)=>lang==='vi'?vi:en,esc=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const color=value=>`var(--c77-c${(value-1)%8})`;
 const chip=(value,cls='')=>`<b class="c77-number ${cls}" style="--c77-tone:${color(value)}">${value}</b>`;
 const focus=v.condition?.expression==='for i'&&!v.condition.result?null:v.i;
 const pruned=v.action==='prune'||v.action==='check-prune'&&v.condition.result;
 const pool=Array.from({length:v.n},(_,i)=>i+1).map(value=>{
  const selected=v.current.includes(value),blocked=v.start!==null&&value<v.start&&!selected;
  return `<div class="c77-source ${selected?'selected':''} ${blocked?'blocked':''} ${focus===value?'focus':''} ${pruned&&value>=v.i?'pruned':''}" data-number="${value}"><small>${value===v.start?'start ↓':value===focus?'i ↓':'&nbsp;'}</small>${chip(value)}<small>${selected?'✓':pruned&&value>=v.i?'×':'&nbsp;'}</small></div>`;
 }).join('');
 const slots=Array.from({length:v.k},(_,i)=>`<div class="c77-slot ${i<v.current.length?'filled':''}" data-slot="${i}"><small>${i}</small>${i<v.current.length?chip(v.current[i]):'<b class="c77-empty">·</b>'}</div>`).join('');
 let operation='';
 if(v.change?.kind==='append')operation=`<strong>+</strong>${chip(v.change.value)}<strong>→</strong><code>current</code>`;
 else if(v.change?.kind==='pop')operation=`<code>pop()</code><strong>↶</strong>${chip(v.change.value,'removed')}`;
 else if(v.change?.kind==='save')operation=`<div class="c77-copy">${v.change.values.map(value=>chip(value)).join('')}</div><strong>→</strong><b class="c77-yes">#${v.result.length} ✓</b>`;
 else if(v.action==='needed')operation=`<code>needed = ${v.k} − ${v.current.length}</code><strong>${v.needed}</strong>`;
 else if(v.action==='remaining')operation=`<code>remaining = ${v.n} − ${v.i} + 1</code><strong>${v.remaining}</strong>`;
 else if(v.action==='return'||v.action==='child-return')operation=`<strong>↶</strong><code>${v.action==='return'?t('về nhánh cha','return to parent'):t('nhánh con đã xong','child finished')}</code>`;
 else if(step.final)operation=`<strong class="c77-yes">${v.result.length} / ${v.total} ✓</strong>`;
 const condition=v.condition?`<div class="c77-condition"><code>${esc(v.condition.expression)}</code><b class="${v.condition.result?'c77-yes':'c77-no'}">${v.condition.result?'True':'False'}</b></div>`:'';
 const needed=v.k-v.current.length;
 const pruning=['check-prune','prune'].includes(v.action)?`<div class="c77-pruning ${pruned?'no':''}"><header><small>${t('số còn lại → ô còn thiếu','numbers left → empty slots')}</small><b>${v.remaining} ${pruned?'<':'≥'} ${v.needed} ${pruned?'×':'✓'}</b></header><div>${Array.from({length:needed},(_,i)=>i<v.remaining?chip(v.i+i):'<b class="c77-missing">×</b>').join('')}</div>${pruned?`<small>break ↶</small>`:''}</div>`:'';
 const width=Math.max(220,Math.min(500,(host.clientWidth||550)-24));
 const columns=Math.max(2,Math.min(5,Math.floor(width/90))),height=Math.max(82,Math.ceil(v.stack.length/columns)*88);
 const position=index=>{const row=Math.floor(index/columns),col=row%2?columns-1-index%columns:index%columns;return {x:30+col*(width-60)/(columns-1),y:24+row*88};};
 const links=v.stack.slice(1).map((frame,i)=>{const a=position(i),b=position(i+1);return `<path class="c77-branch-link" d="M${a.x},${a.y}L${b.x},${b.y}"/>`;}).join('');
 const nodes=v.stack.map((frame,i)=>{const p=position(i),value=frame.path.at(-1);return `<g class="c77-branch-node ${i===v.stack.length-1?'active':''}" data-frame="${i}"><circle cx="${p.x}" cy="${p.y}" r="19" style="--c77-tone:${value?color(value):'var(--c77-muted)'}"/><text class="c77-node-value" x="${p.x}" y="${p.y+6}" text-anchor="middle">${value??'∅'}</text><text class="c77-node-start" x="${p.x}" y="${p.y+35}" text-anchor="middle">start=${frame.start}</text></g>`;}).join('');
 const branch=v.stack.length?`<div class="c77-branch"><small>backtrack(start)</small><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${t('Nhánh đệ quy đang chạy','Active recursive calls')}">${links}${nodes}</svg></div>`:'';
 const gallery=v.result.map((values,index)=>`<article class="c77-result ${v.change?.kind==='save'&&v.change.index===index?'new':''}" data-result-index="${index}"><small>${index+1}</small><div>${values.map(value=>chip(value)).join('')}</div></article>`).join('')||'<span class="c77-empty">∅</span>';
 host.innerHTML=`<section class="c77-viz"><header><strong>1…${v.n} → ${v.k} ${t('số','numbers')}</strong><small>${v.source.scope} · ${t('sau dòng','after line')} ${v.source.line}</small></header><section class="c77-pool"><header><small>${t('chỉ đi tới → không lặp','move forward → no duplicates')}</small></header><div>${pool}</div></section><section class="c77-basket"><header><b>current</b><span>${v.current.length} / ${v.k}</span></header><div>${slots}</div></section>${operation?`<div class="c77-operation">${operation}</div>`:''}${pruning}${condition}${branch}<section class="c77-results"><header><b>result</b><span>${v.result.length} / ${v.total}</span></header><div class="c77-progress"><i style="width:${v.result.length/v.total*100}%"></i></div><div class="c77-gallery">${gallery}</div></section></section>`;
 const grid=host.querySelector?.('.c77-gallery'),saved=grid?.querySelector('.new');
 if(grid)grid.scrollTop=saved?Math.max(0,saved.offsetTop-grid.offsetTop-grid.clientHeight/2):grid.scrollHeight;
}
