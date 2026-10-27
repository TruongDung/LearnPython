"use strict";
function p46Escape(value){return escapeHtml(String(value??""));}
function p46Glyph(value,index,extra=""){return `<b class="p46-number p46-c${index%6} ${extra}">${p46Escape(value)}</b>`;}
function p46Word(values,nums){return `<span class="p46-word">${values.map((value,i)=>`${i?'<i>→</i>':''}${p46Glyph(value,nums.indexOf(value))}`).join('')||'<span class="p46-empty">∅</span>'}</span>`;}
function p46Diagram(v,vi){
  const x=v.locals,current=x.current||[],used=x.used||[],i=x.i,n=v.nums.length,chosen=new Set(v.indices);
  const longest=Math.max(...v.nums.map(value=>String(value).length)),pitch=Math.max(64,longest*17+16),w=Math.max(360,pitch*n+72),cx=j=>54+(j+.5)*(w-72)/n;
  const preview=['allow','reserve'].includes(v.phase)&&i!==undefined&&current.length<n;
  const defs=v.nums.map((_,j)=>`<marker id="p46-arrow-${j}" class="p46-c${j%6}" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z"/></marker>`).join('');
  const links=v.indices.map((index,position)=>`<path class="p46-connection p46-c${index%6}" data-link="${index}-${position}" d="M${cx(index)},123 C${cx(index)},145 ${cx(position)},153 ${cx(position)},184" marker-end="url(#p46-arrow-${index})"/>`).join('');
  const previewLink=preview?`<path class="p46-connection preview p46-c${i%6}" d="M${cx(i)},123 C${cx(i)},145 ${cx(current.length)},153 ${cx(current.length)},184" marker-end="url(#p46-arrow-${i})"/>`:'';
  const pool=v.nums.map((value,index)=>{const held=Boolean(used[index])&&!chosen.has(index),active=index===i;
    return `<g class="p46-source p46-c${index%6} ${used[index]?'used':''} ${held?'held':''} ${active?'active':''} ${active&&v.phase==='blocked'?'blocked':''}" data-pool-index="${index}" data-used="${v.usedReady?used[index]:'pending'}" data-in-current="${chosen.has(index)}"><title>nums[${index}]=${value}; used[${index}]=${v.usedReady?used[index]:'—'}</title><text class="p46-index" x="${cx(index)}" y="28">[${index}]${active?' · i':''}</text><rect class="p46-token" x="${cx(index)-pitch/2+8}" y="38" width="${pitch-16}" height="53" rx="10"/><text class="p46-value" x="${cx(index)}" y="73">${value}</text><rect class="p46-flag ${used[index]?'on':'off'}" x="${cx(index)-14}" y="100" width="28" height="19" rx="6"/><text class="p46-flag-text" x="${cx(index)}" y="114">${v.usedReady?used[index]?'T':'F':'—'}</text>${active&&v.phase==='blocked'?`<path class="p46-cross" d="M${cx(index)+pitch/2-23},44 l9,9 m0,-9 l-9,9"/>`:''}</g>`;
  }).join('');
  const slots=v.nums.map((_,position)=>{
    const index=v.indices[position],filled=position<current.length,ghost=preview&&position===current.length;
    return `<g class="p46-slot ${filled?'filled':ghost?'preview':'empty'} p46-c${(index??i??0)%6}" data-current-slot="${position}" data-current-value="${filled?current[position]:''}" data-preview="${ghost}"><text class="p46-index" x="${cx(position)}" y="253">[${position}]</text><rect x="${cx(position)-pitch/2+8}" y="187" width="${pitch-16}" height="53" rx="10"/><text class="p46-value" x="${cx(position)}" y="222">${filled?current[position]:ghost?v.nums[i]:'·'}</text></g>`;
  }).join('');
  return `<section class="p46-card"><header><span>nums → current</span><strong>${v.currentReady?current.length:'—'} / ${n}</strong></header><div class="p46-diagram-scroll"><svg class="p46-diagram" style="${longest>5?`min-width:${w}px;`:''}" viewBox="0 0 ${w} 264" role="img" aria-label="${p46Escape(vi?'Nối từng số với vị trí trong current; T là khoá, F là mở':'Map each number into current; T is locked, F is free')}"><defs>${defs}</defs><text class="p46-caption" x="8" y="71">nums</text><text class="p46-caption" x="8" y="114">used</text>${links}${previewLink}${pool}<text class="p46-caption" x="8" y="220">current</text>${slots}</svg></div><footer class="p46-legend"><span class="used">T · ${vi?'khoá':'locked'}</span><span class="free">F · ${vi?'mở':'free'}</span><span>⋯ ${vi?'chuẩn bị thêm':'pending append'}</span></footer></section>`;
}
function p46Tree(v,vi){
  const nodes=v.tree,ids=new Set(nodes.map(node=>node.id)),children=new Map(),positions=new Map();let leaf=0;
  const minDepth=nodes.length?Math.min(...nodes.map(node=>node.depth)):0;
  for(const node of nodes){if(!children.has(node.parentId))children.set(node.parentId,[]);children.get(node.parentId).push(node);}
  function place(node){const xs=(children.get(node.id)||[]).map(place),x=xs.length?(xs[0]+xs.at(-1))/2:36+leaf++*74;positions.set(node.id,{x,y:25+(node.depth-minDepth)*57});return x;}
  for(const node of nodes)if(!ids.has(node.parentId))place(node);
  const w=Math.max(290,leaf*74),h=Math.max(75,...nodes.map(node=>54+(node.depth-minDepth)*57));for(const p of positions.values())p.x+=(w-leaf*74)/2;
  const links=nodes.filter(node=>ids.has(node.parentId)).map(node=>{const a=positions.get(node.parentId),b=positions.get(node.id);return `<path class="p46-edge p46-c${node.via%6} ${['current','ancestor'].includes(node.state)?'active':''}" d="M${a.x},${a.y+14} L${b.x},${b.y-14}"/>`;}).join('');
  const dots=nodes.map(node=>{const p=positions.get(node.id),value=node.via===null?'∅':v.nums[node.via],long=String(value).length>4;return `<g class="p46-node p46-c${(node.via??0)%6} ${node.state} ${node.status}" data-node="${node.id}" transform="translate(${p.x},${p.y})"><title>${p46Escape(node.path.map(i=>v.nums[i]).join(' → ')||'∅')}</title><rect x="-29" y="-14" width="58" height="28" rx="8"/><text y="5" ${long?'textLength="50" lengthAdjust="spacingAndGlyphs"':''}>${value}</text></g>`;}).join('');
  const p=positions.get(v.currentId);
  return `<section class="p46-card"><header><span>${vi?'Nhánh đang xem':'Branch view'}</span><small>${nodes.length}/${v.visitedCount} ${vi?'nút':'nodes'}</small></header><div class="p46-tree" data-focus-x="${p?.x??0}" data-focus-y="${p?.y??0}">${nodes.length?`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${p46Escape(vi?'Cây lựa chọn các số chưa dùng':'Tree of unused-number choices')}">${links}${dots}</svg>`:'<span class="p46-empty">∅</span>'}</div><footer class="p46-tree-legend"><span class="current">● ${vi?'hiện tại':'current'}</span><span class="saved">● ${vi?'đã lưu':'saved'}</span></footer></section>`;
}
function renderPermutations46Pictures(step){
  const v=step.permutations46View,vi=lang==='vi',x=v.locals,i=x.i,current=x.current||[],value=i===undefined?null:v.nums[i];
  const label=(a,b)=>vi?a:b,glyph=(n,extra='')=>p46Glyph(n,v.nums.indexOf(n),extra),flag=(on)=>`<span class="p46-status ${on?'on':'off'}">${on?'T':'F'}</span>`;
  let operation;
  if(v.phase==='choose')operation=`${glyph(value,'preview')}<strong>?</strong><code>used[${i}]</code>${flag(x.used[i])}`;
  else if(v.phase==='allow'||v.phase==='blocked')operation=`${glyph(value)}<strong class="${v.phase==='allow'?'p46-good':'p46-bad'}">${v.phase==='allow'?'✓':'✕'}</strong>${flag(x.used[i])}<code>${v.phase==='allow'?'not used[i]':label('Đã khoá','Locked')}</code>`;
  else if(v.phase==='reserve'||v.phase==='release')operation=`${glyph(value)}<strong>→</strong>${flag(v.phase==='reserve')}<code>used[${i}] = ${v.phase==='reserve'?'True':'False'}</code>`;
  else if(v.phase==='append')operation=`${glyph(value)}<strong>↓</strong><code>current[${current.length-1}]</code>`;
  else if(v.phase==='pop')operation=`${glyph(v.removed,'removed')}<strong>↩</strong><code>pop()</code>${flag(x.used[v.removedIndex])}`;
  else if(v.phase==='save')operation=`${p46Word(current,v.nums)}<strong>→</strong><b class="p46-good">result[${v.resultCount-1}] ✓</b>`;
  else if(v.phase==='complete-check')operation=`<code>len(current) = n</code><strong class="${current.length===v.nums.length?'p46-good':''}">${current.length===v.nums.length?'✓':'…'}</strong>`;
  else if(v.phase==='done')operation=`<strong class="p46-good">${v.resultCount} ✓</strong><code>return result</code>`;
  else if(['resume','return-solution','root-return','exhausted'].includes(v.phase))operation=`<strong>↩</strong><code>backtrack()</code>`;
  else operation=`<code>${{ 'result-init':'result = []','current-init':'current = []','used-init':'used = [False] × n',define:'def backtrack()' }[v.phase]}</code>`;
  const output=`<section class="p46-card p46-results-card"><header><span>result</span><strong class="p46-good">${v.resultCount} / ${v.total}</strong></header><div class="p46-progress"><i style="width:${100*v.resultCount/v.total}%"></i></div><div class="p46-results" style="--p46-min:${v.nums.length>4?250:175}px">${v.results.map((row,j)=>`<article data-permutation="${row.join(',')}"><small>#${v.shownFrom+j+1}</small>${p46Word(row,v.nums)}</article>`).join('')||'<span class="p46-empty">∅</span>'}</div>${v.shownFrom?`<small>+${v.shownFrom} ${label('hoán vị trước','earlier permutations')}</small>`:''}</section>`;
  const frames=v.stack.map((frame,j)=>`${j?'<span class="p46-stack-arrow">→</span>':''}<span class="p46-frame ${j===v.stack.length-1?'active':''}" data-frame="${frame.id}"><small>#${j}</small><b>i ${frame.i??'—'}</b></span>`).join('')||'<span class="p46-empty">∅</span>';
  $('treeView').innerHTML=`<div class="p46-viz"><header class="p46-heading"><span>#46 · Permutations</span><b>L${v.source.line} ✓</b><span>${label('Sau dòng','After line')} ${v.source.line}</span></header><div class="p46-operation">${operation}</div>${step.final?output:`${p46Diagram(v,vi)}${output}`}<section class="p46-card"><header><span>Call stack</span><small>${label('Chung current và used','Shared current and used')}</small></header><div class="p46-stack">${frames}</div></section>${p46Tree(v,vi)}</div>`;
  const root=$('treeView'),tree=root.querySelector?.('.p46-tree'),pane=root.querySelector?.('.p46-stack');
  if(tree&&v.currentId!==null){tree.scrollLeft=Math.max(0,Number(tree.dataset.focusX)-tree.clientWidth/2);tree.scrollTop=Math.max(0,Number(tree.dataset.focusY)-tree.clientHeight/2);}
  if(pane)pane.scrollLeft=pane.scrollWidth;
}
