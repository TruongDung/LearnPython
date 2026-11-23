'use strict';

function triePictureGraph(nodes, current, path = [], created = null, paired = false) {
  const byId=new Map(nodes.map(n=>[n.id,n])), children=new Map(nodes.map(n=>[n.id,[]]));
  nodes.forEach(n=>{if(byId.has(n.parent))children.get(n.parent).push(n.id);});
  const positions=new Map();let leaves=0,maxDepth=0;
  function place(id,depth) {
    maxDepth=Math.max(depth,maxDepth);
    const ys=children.get(id).map(child=>place(child,depth+1));
    const y=ys.length?(ys[0]+ys.at(-1))/2:42+leaves++*78;
    positions.set(id,[42+depth*92,y]);return y;
  }
  nodes.filter(n=>!byId.has(n.parent)).forEach(n=>place(n.id,0));
  const width=Math.max(250,90+maxDepth*92),height=Math.max(110,84+(leaves-1)*78);
  const active=new Set(path);
  const edges=nodes.filter(n=>byId.has(n.parent)).map(n=>{
    const [x,y]=positions.get(n.parent),[xx,yy]=positions.get(n.id),mid=(x+xx)/2;
    const label=paired?`(${n.pair?.join(',')??'?'})`:n.ch;
    return `<g class="tp-edge${active.has(n.id)?' active':''}${n.id===created?' created':''}"><path d="M${x+22} ${y} C${mid} ${y} ${mid} ${yy} ${xx-22} ${yy}"/><text x="${mid}" y="${(y+yy)/2-9}">${escapeHtml(label)}</text></g>`;
  }).join('');
  const circles=nodes.map(n=>{
    const [x,y]=positions.get(n.id),end=paired?n.terminal>0:n.isWord;
    return `<g class="tp-node${n.id===current?' current':''}${active.has(n.id)?' active':''}${end?' terminal':''}${n.id===created?' created':''}" data-tp-node="${n.id}" data-x="${x}" data-y="${y}" transform="translate(${x} ${y})"><title>#${n.id}${paired?' · terminal = '+(n.terminal??'—'):' · '+(n.prefix||'root')}${end?' · ★':''}</title><circle r="22"/>${end?'<circle class="tp-end-ring" r="27"/>':''}<text class="tp-node-label" y="6">${paired?n.terminal??'—':n.id===0?'•':escapeHtml(n.ch)}</text><text class="tp-node-id" y="-31">${n.id===0?'root':'#'+n.id}${end?' ★':''}</text></g>`;
  }).join('');
  return `<div class="tp-graph"><svg role="img" aria-label="${paired?'Paired-character trie':'Trie'}" viewBox="0 0 ${width} ${height}" style="width:${width}px;height:${height}px">${edges}${circles}${nodes.length?'':`<text class="tp-empty" x="125" y="60">∅</text>`}</svg></div>`;
}
function centerTriePictureGraph(host,current) {
  const graph=host.querySelector('.tp-graph'),node=graph?.querySelector(`[data-tp-node="${current}"]`);
  if(node){graph.scrollLeft=Math.max(0,Number(node.dataset.x)-graph.clientWidth/2);graph.scrollTop=Math.max(0,Number(node.dataset.y)-graph.clientHeight/2);}
}
function setupTriePictureCodeTheme(problemId) {
  const old=document.getElementById('triePictureCodeTheme'),panel=$('codePanel');
  if(![208,588,1224,1352,1504,1526,2354,2832,3045,3212].includes(Number(problemId))){old?.remove();delete panel.dataset.triePictureTheme;return;}
  const t=(vi,en)=>lang==='vi'?vi:en,key=`triePictureCodeTheme${problemId}`;
  let saved=null;try{saved=localStorage.getItem(key);}catch(_){}
  const selected=['light','dark'].includes(saved)?saved:document.documentElement.dataset.theme==='light'?'light':'dark';
  const bar=old||document.createElement('div');bar.id='triePictureCodeTheme';bar.className='tp-code-theme';
  bar.setAttribute('role','group');bar.setAttribute('aria-label',t('Theme code','Code theme'));
  bar.innerHTML=`<span>Code</span><button type="button" data-tp-theme="light">☀ ${t('Sáng','Light')}</button><button type="button" data-tp-theme="dark">☾ ${t('Tối','Dark')}</button>`;
  panel.parentElement.querySelector('.code-mode-bar').appendChild(bar);
  const apply=theme=>{panel.dataset.triePictureTheme=theme;bar.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tpTheme===theme)));};
  bar.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{apply(b.dataset.tpTheme);try{localStorage.setItem(key,b.dataset.tpTheme);}catch(_){}}));apply(selected);
}
