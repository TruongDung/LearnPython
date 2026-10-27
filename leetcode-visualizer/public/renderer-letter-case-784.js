function renderLetterCase784Pictures(step) {
 const host=$('treeView'),v=step.letterCase784View;if(!host||!v)return;
 const t=(vi,en)=>lang==='vi'?vi:en;
 const tone=ch=>/[0-9]/.test(ch)?'digit':ch===ch.toUpperCase()?'upper':'lower';
 const chip=(ch,extra='')=>`<b class="lc784-char ${tone(ch)} ${extra}">${ch}</b>`;
 const source=[...v.s].map((ch,i)=>`<span class="lc784-source ${i===v.i?'focus':''} ${i<v.path.length?'used':''}"><small>${i===v.i?'i ↓':i}</small>${chip(ch)}<small>${/[0-9]/.test(ch)?'＝':'⑂'}</small></span>`).join('');
 const path=Array.from({length:v.s.length},(_,i)=>`<span class="lc784-slot ${i<v.path.length?'filled':''}" data-slot="${i}"><small>${i}</small>${i<v.path.length?chip(v.path[i]):'<b class="lc784-empty">·</b>'}</span>`).join('');
 let fork='';
 if(v.ch!==null){
  const digit=/[0-9]/.test(v.ch),choices=digit?[v.ch]:[v.ch.toLowerCase(),v.ch.toUpperCase()];
  const loopDone=v.action==='choose'&&v.condition?.result===false;
  const selected=digit?v.path.length>v.i?v.ch:null:!loopDone?v.choice:null;
  const branches=choices.map((ch,index)=>{
   const x=digit?140:index?210:70,active=ch===selected,present=v.path[v.i]===ch;
   return `<g class="lc784-fork-choice ${tone(ch)} ${active?'active':''} ${active&&present?'picked':''}" data-choice="${ch}"><path d="M140,46L${x},91" marker-end="url(#lc784-arrow)"/><rect x="${x-23}" y="91" width="46" height="38" rx="9"/><text class="lc784-fork-letter" x="${x}" y="117" text-anchor="middle">${ch}</text><text class="lc784-fork-label" x="${x}" y="145" text-anchor="middle">${digit?t('giữ nguyên','unchanged'):index?'HOA / UPPER':t('thường / lower','lower')}</text></g>`;
  }).join('');
  fork=`<section class="lc784-fork"><header><small>ch = s[${v.i}]</small><span>${digit?'1':2} ${t('nhánh','branch'+(digit?'':'es'))}</span></header><svg viewBox="0 0 280 153" role="img" aria-label="${digit?t('Chữ số giữ nguyên, chỉ một nhánh','Digit unchanged, one branch'):t('Hai nhánh chữ thường và chữ hoa','Lowercase and uppercase branches')}"><defs><marker id="lc784-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0L6,3L0,6Z"/></marker></defs><circle cx="140" cy="26" r="20"/><text class="lc784-fork-letter original" x="140" y="34" text-anchor="middle">${v.ch}</text>${branches}</svg></section>`;
 }
 let operation='';
 if(v.change?.kind==='append')operation=`<strong>+</strong>${chip(v.change.value)}<strong>→</strong><code>path</code>`;
 else if(v.change?.kind==='pop')operation=`<code>pop()</code><strong>↶</strong>${chip(v.change.value,'removed')}`;
 else if(v.change?.kind==='save')operation=`<div class="lc784-copy">${[...v.change.value].map(ch=>chip(ch)).join('')}</div><strong>→</strong><b class="lc784-yes">#${v.result.length} ✓</b>`;
 else if(v.action==='return'||v.action==='child-return')operation=`<strong>↶</strong><code>${v.action==='return'?t('về nhánh cha','return to parent'):t('nhánh con đã xong','child finished')}</code>`;
 else if(step.final)operation=`<strong class="lc784-yes">${v.result.length} / ${v.total} ✓</strong>`;
 const condition=v.condition?`<div class="lc784-condition"><code>${v.condition.expression}</code><b class="${v.condition.result?'lc784-yes':'lc784-no'}">${v.condition.result?'True':'False'}</b></div>`:'';
 const pageSize=12,pages=Math.max(1,Math.ceil(v.result.length/pageSize));
 const sameFrame=host.dataset?.lc784Frame===String(v.frame);
 const page=sameFrame?Math.max(0,Math.min(pages-1,Number(host.dataset.lc784Page)||0)):pages-1;
 if(host.dataset){host.dataset.lc784Frame=String(v.frame);host.dataset.lc784Page=String(page);}
 const gallery=v.result.slice(page*pageSize,(page+1)*pageSize).map((value,i)=>{
  const index=page*pageSize+i;
  return `<article class="lc784-result ${v.change?.kind==='save'&&v.change.index===index?'new':''}" data-result-index="${index}" data-result="${value}"><small>${index+1}</small><div>${[...value].map(ch=>chip(ch)).join('')}</div></article>`;
 }).join('')||'<span class="lc784-empty">∅</span>';
 const pagination=pages>1?`<nav class="lc784-pages" aria-label="${t('Trang kết quả','Result pages')}"><button type="button" data-lc784-page="${page-1}" ${page===0?'disabled':''} aria-label="${t('Trang trước','Previous page')}">←</button><small>${page+1} / ${pages}</small><button type="button" data-lc784-page="${page+1}" ${page===pages-1?'disabled':''} aria-label="${t('Trang sau','Next page')}">→</button></nav>`:'';
 const stack=v.stack.slice(-6).map(frame=>`<span class="${frame.i===v.s.length?'leaf':''}">${frame.i}</span>`).join('<i>→</i>');
 host.innerHTML=`<section class="lc784-viz"><header><strong>${t('thường','lower')} <b class="lc784-blue">a</b> / <b class="lc784-purple">A</b> ${t('HOA','UPPER')} · <b>1</b> ${t('giữ nguyên','unchanged')}</strong><small>${t('sau dòng','after line')} ${v.source.line}</small></header><section class="lc784-input"><small>s</small><div>${source}</div></section><section class="lc784-path"><header><b>path</b><span>${v.path.length} / ${v.s.length}</span></header><div>${path}</div></section>${operation?`<div class="lc784-operation">${operation}</div>`:''}${condition}${fork}${stack?`<div class="lc784-stack"><small>backtrack(i)</small>${v.stack.length>6?'<i>…</i>':''}${stack}</div>`:''}<section class="lc784-results"><header><b>result</b><span>${v.result.length} / 2<sup>${v.letters}</sup> = ${v.total}</span></header><div class="lc784-progress"><i style="width:${v.result.length/v.total*100}%"></i></div><div class="lc784-gallery">${gallery}</div>${pagination}</section>${v.omitted?`<small class="lc784-truncated">${t('Đã thu gọn','Omitted')} ${v.omitted} ${t('bước · kết quả đầy đủ','steps · full result')}</small>`:''}</section>`;
 host.querySelectorAll?.('[data-lc784-page]').forEach(button=>button.addEventListener('click',()=>{host.dataset.lc784Page=button.dataset.lc784Page;renderLetterCase784Pictures(step);}));
 const grid=host.querySelector?.('.lc784-gallery'),saved=grid?.querySelector('.new');
 if(grid)grid.scrollTop=saved?Math.max(0,saved.offsetTop-grid.offsetTop-grid.clientHeight/2):0;
}
