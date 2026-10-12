function renderTwoSumBst653View(step) {
  const v=step.bstTwoSum653View,t=(vi,en)=>lang==="vi"?vi:en,esc=value=>escapeHtml(String(value));
  const hash=v.method===2,done=v.phase==="done",pair=v.pair;
  const nodes=v.tree,byRank=[...nodes].sort((a,b)=>a.rank-b.rank),positions=new Map();
  const width=Math.max(360,nodes.length*55),height=Math.max(130,(Math.max(0,...nodes.map(n=>n.depth))+1)*72+22);
  byRank.forEach((n,i)=>positions.set(n.id,{x:nodes.length===1?width/2:30+i*(width-60)/(nodes.length-1),y:35+n.depth*72}));
  const svg=nodes.length?`<svg viewBox="0 0 ${width} ${height}" style="min-width:${nodes.length>15?width:0}px" role="img" aria-label="${t('Cây BST, hai màu là hai nút đang xét','BST; the colored nodes are the current candidates')}">${nodes.map(n=>{
    const p=positions.get(n.parent),c=positions.get(n.id);return p?`<line x1="${p.x}" y1="${p.y+22}" x2="${c.x}" y2="${c.y-22}"/>`:'';
  }).join('')}${nodes.map(n=>{
    const p=positions.get(n.id),badge=n.role==="left"?"L":n.role==="right"?"R":n.role==="match"?"✓":n.role==="current"?"↓":n.role==="partner"?"✓":'';
    return `<g class="${n.role} ${n.visited?'visited':''}" data-node="${n.id}"><circle cx="${p.x}" cy="${p.y}" r="22"/><text x="${p.x}" y="${p.y+5}">${esc(n.value)}</text>${badge?`<text class="badge" x="${p.x}" y="${p.y+38}">${badge}</text>`:''}</g>`;
  }).join('')}</svg>`:'<span class="bs653-empty">∅</span>';
  const cells=v.values.map((n,i)=>{
    const left=n.index===v.left,right=n.index===v.right,selected=pair?.some(p=>p.id===n.id),current=v.phase==="inorder"&&v.current?.id===n.id;
    const cls=[left?'left':'',right?'right':'',selected?'match':'',current?'current':'',v.left>=0&&(n.index<v.left||n.index>v.right)?'discarded':''].join(' ');
    return `${i&&n.index>v.values[i-1].index+1?'<em>…</em>':''}<div class="bs653-cell ${cls}" data-index="${n.index}"><small>${n.index}</small><b>${esc(n.value)}</b><span>${left&&right?'L/R':left?'L':right?'R':current?'↓':'&nbsp;'}</span></div>`;
  }).join('');
  const a=pair?.[0]?.value??v.values.find(n=>n.index===v.left)?.value,b=pair?.[1]?.value??v.values.find(n=>n.index===v.right)?.value;
  const compare=!hash&&v.left<v.right&&v.sum!==null;
  let equation='';
  if(pair)equation=`<div class="bs653-equation success"><b>${esc(pair[0].value)}</b><em>+</em><b>${esc(pair[1].value)}</b><em>=</em><strong>${v.target}</strong><span>✓</span></div>`;
  else if(compare)equation=`<div class="bs653-equation"><b class="left">${esc(a)}</b><em>+</em><b class="right">${esc(b)}</b><em>=</em><strong>${v.sum}</strong><em>${v.sum<v.target?'&lt;':'&gt;'}</em><span>k=${v.target}</span></div>`;
  else if(hash&&v.current&&!done)equation=`<div class="bs653-equation"><span>k=${v.target}</span><em>−</em><b class="left">${v.current.value}</b><em>=</em><strong class="right">${v.need}</strong><span>${v.phase==="check"?(v.checked?'✓':'×'):'?'}</span></div>`;
  const seen=hash?`<section class="bs653-seen"><header><b>seen</b><small>${v.seenSize} ${t('nút','nodes')}</small></header><div>${v.seen.map(n=>`<span class="${pair?.some(p=>p.id===n.id)?'match':v.phase==='add'&&v.current?.id===n.id?'added':''}" data-node="${n.id}">${n.value}</span>`).join('')||'<em>∅</em>'}</div>${v.seenSize>24?'<small>…</small>':''}</section>`:'';
  const guidance=v.move==="left"?`<div class="bs653-move left">L → <span>${t('Tăng tổng','Larger sum')}</span></div>`:v.move==="right"?`<div class="bs653-move right">← R <span>${t('Giảm tổng','Smaller sum')}</span></div>`:'';
  const status=done?`<div class="bs653-result ${v.answer?'yes':'no'}"><b>${v.answer?'✓ true':'× false'}</b><span>${v.answer?t('Hai nút khác nhau','Two distinct nodes'):t('Không có cặp','No pair')}</span></div>`:'';
  const title=hash?'DFS → seen':v.phase==='inorder'||v.phase==='init'?'BST → inorder':'L → ← R';
  $('treeView').innerHTML=`<section class="bs653-viz" data-method="${v.method}" data-phase="${v.phase}">
    <header class="bs653-heading"><strong>653 · ${title}</strong><span>k = <b>${v.target}</b></span></header>
    <div class="bs653-tree">${svg}</div>${nodes.length<v.total?`<small class="bs653-preview">${t('Cây hiển thị','Tree preview')}: ${nodes.length}/${v.total}</small>`:''}
    ${hash?seen:`<div class="bs653-order-label"><span>↓ inorder</span><small>${v.appended}/${v.total}</small></div><div class="bs653-array">${cells||'<em>∅</em>'}</div>`}
    ${equation}${guidance}${status}
    ${v.omitted?`<small class="bs653-preview">${t('Rút gọn','Condensed')} ${v.omitted} ${t('bước','steps')} · ✓ ${t('Đã xét toàn cây','Full tree processed')}</small>`:''}
  </section>`;
}

