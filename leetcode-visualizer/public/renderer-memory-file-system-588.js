'use strict';
let fs588Inspection={run:null,id:null};
function renderMemoryFileSystem588View(step) {
  const v=step.memoryFileSystem588View,host=$('treeView'),t=(vi,en)=>lang==='vi'?vi:en,esc=value=>escapeHtml(String(value));
  if(fs588Inspection.run!==steps)fs588Inspection={run:steps,id:null};
  const byId=new Map(v.nodes.map(node=>[node.id,node]));
  if(fs588Inspection.id!==null&&!byId.has(fs588Inspection.id))fs588Inspection.id=null;
  const manual=fs588Inspection.id!==null,inspect=manual?byId.get(fs588Inspection.id):v.active;
  const folder='<svg class="fs588-icon folder" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h7l2 3h9v11H3Z"/><path d="M3 10h18"/></svg>';
  const file='<svg class="fs588-icon file" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h9l5 5v13H5Z"/><path d="M14 3v6h5M8 13h8M8 17h6"/></svg>';
  const icon=node=>typeof node?.content==='string'?file:folder;
  const value=result=>result===null?'None':JSON.stringify(result);
  const visited=new Set(v.visited),ordered=[];
  function order(node){ordered.push(node);v.nodes.filter(child=>child.parent===node.id).sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0).forEach(order);}
  v.nodes.filter(node=>node.parent===null).forEach(order);
  const rows=ordered.map(node=>`<button type="button" data-fs588-inspect="${node.id}" class="fs588-entry${node.id===v.current?' current':''}${node.id===v.created?' created':''}${visited.has(node.id)?' visited':''}${node.id===fs588Inspection.id?' inspected':''}" style="--depth:${node.depth}" title="${esc(node.path)}" aria-label="${esc(node.path)} · ${typeof node.content==='string'?t('file','file'):t('thư mục','directory')}"><span class="fs588-twig">${node.parent===null?'':'└'}</span>${icon(node)}<span class="fs588-name">${esc(node.name)}</span><small>${typeof node.content==='string'?[...node.content].length:node.children.length}</small><b>${node.id===v.created?'+':node.id===v.current?'●':''}</b></button>`).join('');
  const op=v.operation;
  const parts=op?.parts??[];
  let partPath='';
  const breadcrumb=`<span class="${v.active?.path==='/'?'current':''}">/</span>${parts.map((part,index)=>{partPath+='/'+part;return `<i>›</i><span class="${partPath===v.active?.path?'current':''}${index===v.segmentIndex?' segment':''}">${esc(part)}</span>`;}).join('')}`;
  const pointer=inspect?(manual?t('Đang xem','Inspecting'):v.pointerName==='context'?t('Vừa duyệt','Last visited'):v.pointerName):'node';
  const children=inspect?.children??[];
  const inspector=inspect?`<header><b>${icon(inspect)} ${pointer}</b><span class="fs588-kind">${!inspect.contentInitialized?t('Đang tạo','Initializing'):typeof inspect.content==='string'?'FILE':'FOLDER'}</span></header><code class="fs588-inspect-path">${esc(inspect.path)}</code><div class="fs588-field"><code>children</code><div>${children.map(name=>`<span>${esc(name)}</span>`).join('')||'<span class="tp-muted">∅</span>'}</div></div><div class="fs588-field"><code>content</code>${!inspect.contentInitialized?'<span class="tp-muted">…</span>':inspect.content===null?'<strong class="fs588-none">None</strong>':`<pre class="fs588-content">${esc(JSON.stringify(inspect.content))}</pre>`}</div>${typeof inspect.content==='string'?`<small class="tp-muted">${[...inspect.content].length} ${t('ký tự','characters')}</small>`:''}${v.pending&&!manual?`<div class="fs588-pending">◌ ${t('Chưa nối vào cây','Not attached to the tree yet')}</div>`:''}`:`<header><b>${folder} node</b></header><span class="tp-muted">∅</span>`;
  let outcome='<span class="tp-muted">return · …</span>';
  if(v.append){const a=v.append;outcome=`<div class="fs588-append"><div><small>${t('cũ','before')}</small><code>${esc(JSON.stringify(a.before))}</code></div><b>+</b><div><small>${t('thêm','append')}</small><code>${esc(JSON.stringify(a.added))}</code></div><b>=</b><div class="after"><small>${t('mới','after')}</small><code>${esc(JSON.stringify(a.after))}</code></div></div>`;}
  else if(v.outputReady){
    if(Array.isArray(v.result))outcome=`<div class="fs588-output-head"><b>return</b><span>${v.event==='list-directory'?'A–Z':t('Tên file','File name')}</span></div><div class="fs588-listing">${v.result.map(name=>`<span>${v.event==='list-file'?file:icon(v.nodes.find(node=>node.parent===v.active?.id&&node.name===name))}${esc(name)}</span>`).join('')||'<b>[ ]</b>'}</div>`;
    else outcome=`<div class="fs588-output-head"><b>return</b>${v.result===null?'<strong class="tp-good">None ✓</strong>':''}</div>${v.result===null?'':`<pre class="fs588-read-value">${esc(JSON.stringify(v.result))}</pre>`}`;
  }else if(v.event==='navigate-return')outcome=`<span class="tp-good">✓ ${t('Tìm thấy node','Node found')}</span><code>${esc(v.active?.path??'/')}</code>`;
  const presets=[
    'ls(/);mkdir(/a/b/c);add(/a/b/c/d,"hello");add(/a/b/c/d," world");ls(/a/b/c);ls(/a/b/c/d);read(/a/b/c/d)',
    'mkdir(/zeta);mkdir(/alpha);mkdir(/beta);ls(/)',
    'mkdir(/docs);add(/docs/readme,"hello");add(/docs/todo,"work");ls(/docs);ls(/docs/readme);read(/docs/readme)',
    'mkdir(/a/b);mkdir(/a/b);add(/a/b/f,"");add(/a/b/f,"one");add(/a/b/f," two");read(/a/b/f)',
  ];
  const presetLabels=[t('Nối nội dung','Append content'),t('Sắp xếp A–Z','Sort A–Z'),t('ls file / folder','ls file / folder'),t('Dùng lại node','Reuse nodes')];
  const shortName=name=>({mkdir:'+ dir',addContentToFile:'+ file',readContentFromFile:'read',ls:'ls'})[name];
  host.innerHTML=`<section class="tp-viz fs588-viz" aria-label="${t('588 · Hệ thống file trong bộ nhớ','588 · In-memory file system')}">
    <header class="tp-head"><div><small>588 · IN-MEMORY FILE SYSTEM</small><h2>${t('Thư mục, file và nội dung','Folders, files and content')}</h2></div><span class="fs588-header-icon">${folder}${file}</span></header>
    <nav class="tp-words fs588-operations" aria-label="${t('Các lệnh','Operations')}"><button type="button" data-fs588-operation="-1" class="${v.opIndex<0?'current':''}">FS()</button>${v.operations.map(operation=>`<button type="button" data-fs588-operation="${operation.index}" title="${esc(operation.raw)}" class="${operation.index===v.opIndex?'current':''}${operation.index<v.outputs.length?' inserted':''}"><small>${operation.index+1}</small>${shortName(operation.name)}</button>`).join('')}</nav>
    <div class="fs588-call"><code>${op?esc(op.name):'FileSystem'}()</code><div class="fs588-breadcrumb">${breadcrumb}</div></div>
    <div class="fs588-layout"><section class="fs588-directory"><header><b>${folder}${t('Cây thư mục','Directory tree')}</b><span>${v.nodes.length}</span></header><div class="fs588-tree" role="group" aria-label="${t('Cây thư mục và file','Folders and files')}">${rows||`<div class="fs588-empty-tree">${folder}<span>∅</span></div>`}</div></section><section class="fs588-inspector${manual?' manual':''}" aria-label="${t('Node đang xem','Inspected node')}">${inspector}${manual?`<button type="button" class="fs588-follow" data-fs588-follow>${t('Theo bước chạy','Follow execution')}</button>`:''}</section></div>
    <div class="fs588-outcome" aria-live="polite">${outcome}</div>
    <div class="tp-debug"><header><b>${t('Dòng','Line')} ${v.line}</b><span>${v.scope}</span></header><div><code>${esc(v.source)}</code>${v.condition!==null?`<b>${v.condition?'True':'False'}</b>`:''}</div><div class="fs588-stack">${v.stack.map(scope=>`<span>${esc(scope)}</span>`).join('<i>›</i>')}</div></div>
    <nav class="tp-actions">${[['reset',t('Làm lại','Restart')],['line',t('Dòng tiếp','Next line')+' <kbd>F10</kbd>'],['operation',t('Lệnh tiếp','Next operation')],['last',t('Kết quả','Result')]].map(([action,label])=>`<button type="button" data-fs588-nav="${action}"${(action==='reset'?stepIndex===0:stepIndex>=steps.length-1)?' disabled':''}>${label}</button>`).join('')}</nav>
    <details class="fs588-history"><summary>${t('Kết quả từng lệnh','Operation results')} · ${v.outputs.length} / ${v.operations.length}</summary><div>${v.outputs.map(output=>`<button type="button" data-fs588-result="${output.index}"><small>${output.index+1}</small><code>${esc(output.name)}(${esc(output.path)})</code><b>${esc(value(output.value))}</b></button>`).join('')||'<span>∅</span>'}</div></details>
    <nav class="tp-presets">${presets.map((_,index)=>`<button type="button" data-fs588-preset="${index}">${presetLabels[index]}</button>`).join('')}</nav>
  </section>`;
  const go=index=>{stopPlay();fs588Inspection.id=null;stepIndex=index;renderStep();};
  host.querySelectorAll('[data-fs588-operation]').forEach(button=>button.addEventListener('click',()=>{const index=steps.findIndex(frame=>frame.memoryFileSystem588View?.opIndex===Number(button.dataset.fs588Operation));if(index>=0)go(index);}));
  host.querySelectorAll('[data-fs588-nav]').forEach(button=>button.addEventListener('click',()=>{const action=button.dataset.fs588Nav;if(action==='reset')return go(0);if(action==='last')return go(steps.length-1);if(action==='line')return go(Math.min(stepIndex+1,steps.length-1));const index=steps.findIndex((frame,i)=>i>stepIndex&&frame.memoryFileSystem588View?.opIndex>v.opIndex);go(index<0?steps.length-1:index);}));
  host.querySelectorAll('[data-fs588-inspect]').forEach(button=>button.addEventListener('click',()=>{stopPlay();fs588Inspection.id=Number(button.dataset.fs588Inspect);renderMemoryFileSystem588View(step);}));
  host.querySelectorAll('[data-fs588-follow]').forEach(button=>button.addEventListener('click',()=>{fs588Inspection.id=null;renderMemoryFileSystem588View(step);}));
  host.querySelectorAll('[data-fs588-result]').forEach(button=>button.addEventListener('click',()=>{const index=steps.findIndex(frame=>frame.memoryFileSystem588View?.opIndex===Number(button.dataset.fs588Result)&&frame.memoryFileSystem588View.outputReady);if(index>=0)go(index);}));
  host.querySelectorAll('[data-fs588-preset]').forEach(button=>button.addEventListener('click',()=>{stopPlay();$('arrInput').value=presets[Number(button.dataset.fs588Preset)];runViz();}));
  const tree=host.querySelector('.fs588-tree'),current=tree?.querySelector(manual?'.inspected':'.current');
  if(current)tree.scrollTop=Math.max(0,current.offsetTop-tree.clientHeight/2);
}
