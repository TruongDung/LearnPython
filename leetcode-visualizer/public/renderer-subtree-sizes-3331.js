'use strict';

const subtree3331Text = (vi, en) => lang === 'vi' ? vi : en;

function subtree3331Positions(parent) {
  const children = parent.map(() => []);
  for (let x=1;x<parent.length;x++) children[parent[x]].push(x);
  const positions=[];
  let leaves=0, depth=0;
  function place(x,level) {
    depth=Math.max(depth,level);
    const xs=children[x].map(child=>place(child,level+1));
    const left=xs.length?(xs[0]+xs.at(-1))/2:35+leaves++*60;
    positions[x]=[left,40+level*78];
    return left;
  }
  place(0,0);
  const rawWidth=70+(leaves-1)*60, width=Math.max(150,rawWidth);
  positions.forEach(p=>{p[0]+=(width-rawWidth)/2;});
  return {positions,width,height:95+depth*78};
}

function subtree3331Tree(v, updated, layout) {
  const parents=updated?v.newParent:v.parent;
  const {positions,width,height}=layout;
  const frame=v.frames.at(-1);
  const path=new Set(v.frames.map(f=>f.x));
  const finished=new Set(v.finished);
  const edges=parents.slice(1).map((p,index)=>{
    const x=index+1, [x1,y1]=positions[p], [x2,y2]=positions[x];
    const changed=v.parent[x]!==v.newParent[x];
    const transfer=updated && v.transfer?.from===x;
    const type=transfer?'transfer':changed?(updated?'added':'removed'):!updated&&path.has(x)?'path':'';
    const faded=x>v.built?' pending':'';
    const mid=(y1+y2)/2;
    // Route a skipped-level edge around intermediate nodes, keeping its
    // destination visually distinct from the original parent.
    const rail=x2<=x1?8:width-8;
    const curve=changed&&updated
      ? transfer?`M${x2} ${y2-22} C${rail} ${y2-40} ${rail} ${y1+40} ${x1} ${y1+22}`:`M${x1} ${y1+22} C${rail} ${y1+40} ${rail} ${y2-40} ${x2} ${y2-22}`
      : transfer?`M${x2} ${y2-22} C${x2} ${mid} ${x1} ${mid} ${x1} ${y1+22}`:`M${x1} ${y1+22} C${x1} ${mid} ${x2} ${mid} ${x2} ${y2-22}`;
    return `<path class="s3331-edge ${type}${faded}" d="${curve}"${transfer?' marker-end="url(#s3331-transfer-arrow)"':''}/>`;
  }).join('');
  const nodes=positions.map(([left,top],x)=>{
    const state=x===v.current?'current':x===frame?.new_parent?'target':path.has(x)?'on-path':'';
    return `<g class="s3331-node ${state}${finished.has(x)?' finished':''}" transform="translate(${left} ${top})" data-s3331-node="${x}" role="button" tabindex="0" aria-label="${subtree3331Text('Xem node','Inspect node')} #${x} · ${v.s[x]}"><title>#${x} · ${v.s[x]}${v.size?' · size = '+v.size[x]:''}</title><text class="s3331-index" y="-27">#${x}</text><circle r="21"/><text y="6">${v.s[x]}</text>${updated&&v.size?`<text class="s3331-size" y="44">${v.size[x]}${finished.has(x)?' ✓':''}</text>`:''}</g>`;
  }).join('');
  const title=updated?subtree3331Text('Cha mới · size','New parents · size'):subtree3331Text('Cây gốc · DFS','Original tree · DFS');
  return `<section class="s3331-card"><h4>${title}</h4><div class="s3331-scroll"><svg viewBox="0 0 ${width} ${height}" style="width:${width}px;min-width:${width}px" role="img" aria-label="${title}">${updated?'<defs><marker id="s3331-transfer-arrow" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8Z"/></marker></defs>':''}${edges}${nodes}</svg></div></section>`;
}

function renderSubtreeSizes3331(step) {
  const v=step.subtree3331View, text=subtree3331Text, host=$('treeView');
  const frame=v.frames.at(-1), layout=subtree3331Positions(v.parent);
  const badge=x=>x===-1?'<span class="s3331-badge">∅</span>':`<span class="s3331-badge"><small>#${x}</small><b>${v.s[x]}</b></span>`;
  const arrow='<svg class="s3331-flow-arrow" viewBox="0 0 66 24" aria-hidden="true"><path d="M2 12H60M49 2l11 10-11 10"/></svg>';
  let focus=`<span>${text('DFS luôn đi trên cây gốc','DFS always follows the original tree')}</span>`;
  if(v.phase==='done') focus=`<b>✓ ${text('Hoàn tất','Complete')}</b><code>[${v.size.join(', ')}]</code>`;
  else if(v.transfer) {
    const t=v.transfer;
    focus=`${badge(t.from)}${arrow}${badge(t.to)}<div><small>size[${t.to}] += size[${t.from}]</small><strong>${t.before} + ${t.amount} = ${t.after}</strong></div>`;
  } else if(frame) {
    const known=Object.hasOwn(frame,'new_parent');
    focus=`${badge(frame.x)}${arrow}${known?badge(frame.new_parent):'<span class="s3331-badge">?</span>'}<div><small>new_parent</small><strong>${!known?text('Đang tìm','Finding'):frame.new_parent===-1?text('Gốc','Root'):v.s[frame.new_parent]===frame.c?text('Cùng chữ gần nhất','Nearest same letter'):text('Giữ cha gốc','Keep original parent')}</strong></div>`;
  }
  const phases=[['enter',text('Vào node','Enter')],['find',text('Tìm cha','Find parent')],['restore',text('Quay lui','Backtrack')],['add',text('Cộng size','Add size')]];
  const phase=v.phase.startsWith('restore')?'restore':v.phase.startsWith('add')?'add':['find','save','push'].includes(v.phase)?'find':'enter';
  const entries=Object.entries(v.last||{}).sort(([a],[b])=>a.localeCompare(b));
  const presets=[{parent:'[-1,0,0,1,1,1]',s:'abaabc'},{parent:'[-1,0,1,2,3]',s:'ababa'},{parent:'[-1,0,0,1]',s:'abaa'},{parent:'[-1,0,0,1]',s:'aaaa'}];
  host.innerHTML=`<section class="s3331-viz" aria-label="${text('3331 · DFS, last và size','3331 · DFS, last and size')}">
    <header class="s3331-header"><div><small>3331 · DFS + BACKTRACKING</small><h2>${text('Tìm cha, rồi cộng size','Find parent, then add size')}</h2></div><code>L${v.line}</code></header>
    <div class="s3331-phases">${phases.map(([key,label])=>`<span${phase===key&&v.frames.length?' aria-current="step"':''}>${label}</span>`).join('<i>·</i>')}</div>
    <div class="s3331-trees">${subtree3331Tree(v,false,layout)}${subtree3331Tree(v,true,layout)}</div>
    <div class="s3331-legend"><span><i class="removed"></i>${text('Cạnh cũ','Old edge')}</span><span><i class="added"></i>${text('Cạnh mới','New edge')}</span><span><i class="transfer"></i>${text('Cộng về cha','Add to parent')}</span><span>✓ ${text('size đã xong','size complete')}</span></div>
    <div class="s3331-focus${v.transfer?' transfer':''}" aria-live="polite">${focus}</div>
    <div class="s3331-state"><div><header><b>${text('Đường DFS','DFS path')}</b><small>${text('cây gốc','original tree')}</small></header><div class="s3331-stack">${v.frames.map(f=>`<span class="${f.x===v.current?'current':''}">#${f.x}<b>${v.s[f.x]}</b></span>`).join('<i>›</i>')||'<span>∅</span>'}</div></div><div><header><b>last</b>${frame&&Object.hasOwn(frame,'prev')?`<small>prev = ${frame.prev===null?'None':frame.prev}</small>`:''}</header><div class="s3331-last">${entries.map(([c,x])=>`<span class="${c===frame?.c?'active':''}"><b>${c}</b><i>:</i>#${x}</span>`).join('')||'<span>∅</span>'}</div></div></div>
    ${v.size?`<div class="s3331-strip"><code>size</code><div>${v.size.map((size,x)=>`<button type="button" data-s3331-node="${x}" class="${x===v.transfer?.to?'target':''}${v.finished.includes(x)?' finished':''}" aria-label="size[${x}] = ${size}"><small>${x}</small><strong>${size}</strong></button>`).join('')}</div></div>`:''}
    <div class="s3331-debug"><header><b>${text('Dòng','Line')} ${v.line}</b><span>${frame?`x = ${frame.x} · c = '${frame.c}'`:v.phase==='done'?'return size':'graph'}</span></header><div><code>${escapeHtml(v.source)}</code>${v.condition!==null?`<strong>${v.condition?'True':'False'}</strong>`:''}</div></div>
    <nav class="s3331-actions" aria-label="${text('Debug từng dòng','Line-by-line debug')}">${[['reset',text('Làm lại','Restart')],['line',text('Dòng tiếp','Next line')+' <kbd>F10</kbd>'],['node',text('Node tiếp','Next node')],['sum',text('Lần cộng tiếp','Next addition')],['last',text('Kết quả','Result')]].map(([action,label])=>`<button type="button" data-s3331-nav="${action}"${(action==='reset'?stepIndex===0:stepIndex>=steps.length-1)?' disabled':''}>${label}</button>`).join('')}</nav>
    <nav class="s3331-presets" aria-label="${text('Ví dụ nhanh','Quick examples')}"><span>${text('Thử','Try')}</span>${presets.map((p,i)=>`<button type="button" data-s3331-preset="${i}">${p.s}</button>`).join('')}</nav>
  </section>`;
  const go=index=>{stopPlay();stepIndex=index;renderStep();};
  host.querySelectorAll('[data-s3331-nav]').forEach(button=>button.addEventListener('click',()=>{
    const action=button.dataset.s3331Nav;
    if(action==='reset') return go(0);
    if(action==='last') return go(steps.length-1);
    if(action==='line') return go(Math.min(stepIndex+1,steps.length-1));
    const next=steps.findIndex((s,i)=>i>stepIndex&&s.subtree3331View?.phase===(action==='node'?'find':'add'));
    go(next<0?steps.length-1:next);
  }));
  host.querySelectorAll('[data-s3331-node]').forEach(node=>{
    const jump=()=>{const target=steps.findIndex(s=>s.subtree3331View?.phase==='find'&&s.subtree3331View.current===Number(node.dataset.s3331Node));if(target>=0)go(target);};
    node.addEventListener('click',jump);
    if(node.tagName.toLowerCase()==='g') node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();jump();}});
  });
  host.querySelectorAll('[data-s3331-preset]').forEach(button=>button.addEventListener('click',()=>{
    stopPlay();const p=presets[Number(button.dataset.s3331Preset)];$('arrInput').value=p.parent;document.querySelector('#extraParams [data-param="s"]').value=p.s;runViz();
  }));
  host.querySelectorAll('.s3331-scroll').forEach(scroll=>{
    if(v.current===null)return;
    const [left,top]=layout.positions[v.current];
    const scale=scroll.querySelector('svg').getBoundingClientRect().width/layout.width;
    scroll.scrollLeft=Math.max(0,left*scale-scroll.clientWidth/2);
    scroll.scrollTop=Math.max(0,top*scale-scroll.clientHeight/2);
  });
}

function setupSubtree3331CodeTheme() {
  const oldToolbar = document.getElementById('s3331CodeTheme');
  const panel = $('codePanel');
  if (Number(problemData?.id) !== 3331) {
    oldToolbar?.remove(); delete panel.dataset.s3331Theme; return;
  }
  const text = (vi, en) => lang === 'vi' ? vi : en;
  let saved = null;
  try { saved = localStorage.getItem('s3331CodeTheme'); } catch (_) { /* Optional preference. */ }
  const selected = ['light', 'dark'].includes(saved) ? saved : document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  const toolbar = oldToolbar || document.createElement('div');
  toolbar.id = 's3331CodeTheme'; toolbar.className = 's3331-code-theme';
  toolbar.setAttribute('role', 'group'); toolbar.setAttribute('aria-label', text('Theme code', 'Code theme'));
  toolbar.innerHTML = `<button type="button" data-s3331-theme="light" title="${text('Nền code sáng', 'Light code theme')}" aria-label="${text('Nền code sáng', 'Light code theme')}"><span aria-hidden="true">☀</span></button><button type="button" data-s3331-theme="dark" title="${text('Nền code tối', 'Dark code theme')}" aria-label="${text('Nền code tối', 'Dark code theme')}"><span aria-hidden="true">☾</span></button>`;
  panel.parentElement.querySelector('.code-mode-bar').appendChild(toolbar);
  const apply = theme => {
    panel.dataset.s3331Theme = theme;
    toolbar.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.s3331Theme === theme)));
  };
  toolbar.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    apply(button.dataset.s3331Theme);
    try { localStorage.setItem('s3331CodeTheme', button.dataset.s3331Theme); } catch (_) { /* Optional preference. */ }
  }));
  apply(selected);
}
