"use strict";
function cs39Escape(value) { return escapeHtml(String(value ?? "")); }
function cs39Glyph(value, index, extra = "") { return `<b class="cs39-number cs39-c${index % 5} ${extra}">${cs39Escape(value)}</b>`; }
function cs39SumPicture(v, vi) {
  const current=v.locals.current||[],sum=current.reduce((s,n)=>s+n,0),extent=v.target+Math.max(...v.candidates),unit=370/extent,left=24,goal=left+v.target*unit;
  let accumulated=0;
  const blocks=current.map((value,i)=>{
    const x=left+accumulated*unit,w=value*unit,index=v.indices[i],normal=Math.max(0,Math.min(value,v.target-accumulated));
    accumulated+=value;
    return `<g class="cs39-block cs39-c${index%5}" data-segment-value="${value}"><title>${value}</title><rect x="${x}" y="42" width="${w}" height="35" rx="3"/>${normal<value?`<rect class="cs39-overflow" x="${x+normal*unit}" y="42" width="${(value-normal)*unit}" height="35"/>`:''}${w>15?`<text x="${x+w/2}" y="65">${value}</text>`:''}</g>`;
  }).join('');
  return `<svg class="cs39-sum-picture" viewBox="0 0 420 122" role="img" aria-label="${cs39Escape(vi?`Tổng current là ${sum}, target ${v.target}`:`Current sum ${sum}, target ${v.target}`)}" data-sum="${sum}" data-goal="${v.target}"><rect class="cs39-track" x="${left}" y="42" width="370" height="35" rx="5"/>${blocks}${Array.from({length:extent+1},(_,i)=>`<path class="cs39-unit-tick" d="M${left+i*unit},80 v4"/>`).join('')}<path class="cs39-goal" d="M${goal},29 V88"/><text class="cs39-goal-label" x="${Math.max(60,goal)}" y="20">target = ${v.target}</text><text class="cs39-axis" x="${left}" y="99">0</text><text class="cs39-axis" x="394" y="99">${extent}</text><text class="cs39-total ${sum>v.target?'bad':sum===v.target?'good':''}" x="210" y="116">Σ current = ${sum}${sum===v.target?' ✓':sum>v.target?` &gt; ${v.target} ✕`:''}</text></svg>`;
}
function cs39Tree(v,vi,options={}) {
  const nodes=v.tree,ids=new Set(nodes.map(n=>n.id)),positions=new Map(),children=new Map();let leaf=0;
  const minDepth=nodes.length?Math.min(...nodes.map(n=>n.depth)):0;
  for(const node of nodes){if(!children.has(node.parentId))children.set(node.parentId,[]);children.get(node.parentId).push(node);}
  function place(node){const xs=(children.get(node.id)||[]).map(place),x=xs.length?(xs[0]+xs.at(-1))/2:32+leaf++*66;positions.set(node.id,{x,y:28+(node.depth-minDepth)*65});return x;}
  for(const node of nodes)if(!ids.has(node.parentId))place(node);
  const w=Math.max(280,leaf*66),h=Math.max(75,...nodes.map(n=>60+(n.depth-minDepth)*65));
  for(const p of positions.values())p.x+=(w-leaf*66)/2;
  const links=nodes.filter(node=>ids.has(node.parentId)).map(node=>{const a=positions.get(node.parentId),b=positions.get(node.id);return `<path class="cs39-edge ${['ancestor','current'].includes(node.state)?'active':''}" d="M${a.x},${a.y+17} L${b.x},${b.y-17}"/><text class="cs39-edge-label cs39-c${node.via%5}" x="${(a.x+b.x)/2+8}" y="${(a.y+b.y)/2+2}">−${v.candidates[node.via]}</text>`;}).join('');
  const dots=nodes.map(node=>{const p=positions.get(node.id);return `<g class="cs39-node ${node.state} ${node.status}" data-node="${node.id}" transform="translate(${p.x},${p.y})"><title>start=${node.start}, remain=${node.remain}</title><circle r="18"/><text y="5">${node.remain}</text></g>`;}).join('');
  const p=positions.get(v.currentId);
  return `<section class="cs39-card"><header><span>${vi?'Nhánh đang xem · remain':'Branch view · remain'}</span><small>${nodes.length}/${v.visitedCount} ${vi?'nút':'nodes'}</small></header><div class="cs39-tree" data-focus-x="${p?.x??0}" data-focus-y="${p?.y??0}">${nodes.length?`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${cs39Escape(vi?'Cây giảm remain theo mỗi số chọn':'Tree of remaining sums after each choice')}">${links}${dots}</svg>`:'<span class="cs39-empty">∅</span>'}</div><footer class="cs39-tree-legend"><span class="current">● ${vi?'hiện tại':'current'}</span><span class="solution">● 0 ✓</span><span class="overshoot">● ${options.prune?(vi?'cắt nhánh':'pruned'):'&lt; 0 ✕'}</span></footer></section>`;
}
function renderCombination39Pictures(step) {
  const v=step.combination39View,vi=lang==='vi',f=v.stack.at(-1),x=v.locals,current=x.current||[],i=f?.i;
  const label=(vn,en)=>vi?vn:en,esc=cs39Escape;
  const glyph=value=>cs39Glyph(value,v.candidates.indexOf(value));
  const word=values=>`<span class="cs39-word">${values.map((value,j)=>`${j?'<i>＋</i>':''}${glyph(value)}`).join('')||'<span class="cs39-empty">∅</span>'}</span>`;
  const pool=v.candidates.map((value,index)=>{
    const locked=f&&index<f.start,active=index===i;
    const pips=Array.from({length:value},(_,j)=>`<circle cx="${12+j%8*7}" cy="${50+Math.floor(j/8)*6}" r="1.8"/>`).join('');
    return `<article class="cs39-candidate cs39-c${index%5} ${locked?'locked':''} ${active?'active':''}" data-candidate-index="${index}" data-locked="${Boolean(locked)}"><header>${index===f?.start?'start ↓':`[${index}]`}</header><svg viewBox="0 0 74 88" role="img" aria-label="${esc(`${value} · ${value} ${label('chấm','dots')}`)}"><rect x="4" y="3" width="66" height="80" rx="12"/><text x="37" y="34">${value}</text>${pips}</svg><footer>${active?'i ↑':locked?'×':'↻'}</footer></article>`;
  }).join('');
  let operation;
  if(v.phase==='choose')operation=`${cs39Glyph(v.candidates[i],i,'preview')}<strong>→</strong><span class="cs39-slot">·</span>`;
  else if(v.phase==='append')operation=`<code>append</code><strong>＋</strong>${cs39Glyph(v.candidates[i],i)}`;
  else if(v.phase==='pop')operation=`${cs39Glyph(v.removed,v.candidates.indexOf(v.removed),'removed')}<strong>↩</strong><code>pop()</code>`;
  else if(v.phase==='save')operation=`${word(current)}<strong>→</strong><b class="cs39-good">result[${v.resultCount-1}] ✓</b>`;
  else if(v.phase==='zero-check')operation=`<code>remain == 0</code><strong class="${f.remain===0?'cs39-good':''}">${f.remain===0?'✓':'…'}</strong><b>${f.remain}</b>`;
  else if(v.phase==='negative-check')operation=`<code>remain &lt; 0</code><strong class="${f.remain<0?'cs39-bad':''}">${f.remain<0?'✓':'✕'}</strong><b>${f.remain}</b>`;
  else if(v.phase==='done')operation=`<strong class="cs39-good">${v.resultCount} ✓</strong><code>return result</code>`;
  else if(['resume','return-solution','return-overshoot','root-return','exhausted'].includes(v.phase))operation=`<strong>↩</strong><code>${f?`start=${f.start} · remain=${f.remain}`:label('Mọi nhánh hoàn tất','All branches returned')}</code>`;
  else operation=`<code>${v.phase==='define'?'def backtrack(start, remain)':v.phase==='current-init'?'current = []':'result = []'}</code>`;
  const output=`<section class="cs39-card cs39-results-card"><header><span>result</span><strong class="cs39-good">${v.resultCount} ✓</strong></header><div class="cs39-results">${v.results.map((values,j)=>`<article data-combination="${values.join(',')}"><small>#${v.shownFrom+j+1}</small>${word(values)}<b>= ${v.target} ✓</b></article>`).join('')||'<span class="cs39-empty">∅</span>'}</div>${v.shownFrom?`<small>+${v.shownFrom} ${label('tổ hợp trước','earlier combinations')}</small>`:''}</section>`;
  const frames=v.stack.map((frame,j)=>`${j?'<span class="cs39-stack-arrow">→</span>':''}<span class="cs39-frame ${j===v.stack.length-1?'active':''}" data-frame="${frame.id}"><small>start ${frame.start}</small><b>${frame.remain}</b></span>`).join('')||'<span class="cs39-empty">∅</span>';
  $('treeView').innerHTML=`<div class="cs39-viz"><header class="cs39-heading"><span>#39 · Combination Sum</span><b>L${v.source.line} ✓</b><span>${label('Sau dòng','After line')} ${v.source.line}</span></header><div class="cs39-operation">${operation}</div>${step.final?output:`<section class="cs39-card"><header><span>candidates</span><small>↻ ${label('Dùng lại từ start','Reuse from start')}</small></header><div class="cs39-candidates">${pool}</div></section><section class="cs39-card"><header><span>current</span><small>${v.currentReady?`${current.length} ${label('số','values')}`:'—'}</small></header><div class="cs39-current">${word(current)}</div>${cs39SumPicture(v,vi)}</section>${output}`}<section class="cs39-card"><header><span>Call stack · remain</span><small>${label('Chung một current','One shared current')}</small></header><div class="cs39-stack">${frames}</div></section>${cs39Tree(v,vi)}</div>`;
  const root=$('treeView'),tree=root.querySelector?.('.cs39-tree'),pane=root.querySelector?.('.cs39-stack');
  if(tree&&v.currentId!==null){tree.scrollLeft=Math.max(0,Number(tree.dataset.focusX)-tree.clientWidth/2);tree.scrollTop=Math.max(0,Number(tree.dataset.focusY)-tree.clientHeight/2);}
  if(pane)pane.scrollLeft=pane.scrollWidth;
}
