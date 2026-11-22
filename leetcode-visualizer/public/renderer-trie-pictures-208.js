'use strict';
function renderTrie208View(step) {
  const v=step.trie208View,host=$('treeView'),t=(vi,en)=>lang==='vi'?vi:en;
  const op=v.operations[v.opIndex],active=v.nodes.find(n=>n.id===v.current),at=v.pending?.prefix??active?.prefix??'';
  const token=v.target.split('').map((ch,i)=>`<span class="t208-token${i===v.index?' current':''}${v.missing&&i===v.index?' missing':''}${i<(active?.prefix.length??0)?' consumed':''}"><small>${i}</small><b>${ch}</b></span>`).join('');
  const search=v.operations.find(o=>o.method==='search'),prefix=v.operations.find(o=>o.method==='startsWith');
  const test=(entry,star)=>`<article class="t208-test${entry.method===op.method?' active':''}"><code>${entry.method}("${entry.word}")</code><strong class="${entry.result===true?'tp-good':entry.result===false?'tp-bad':''}">${entry.result===null?'?':entry.result?'✓ True':'× False'}</strong><small>${star?t('Đủ đường + ★','Full path + ★'):t('Đủ đường','Full path')}</small></article>`;
  let focus=`<span class="t208-node-ref"><small>node</small><b>${at||'root'}</b></span><span class="t208-end${v.terminal?' yes':''}">${v.block===2?"'$' in node":'is_word'} = ${v.terminal?'True':'False'} ${v.terminal?'★':'○'}</span>`;
  if(v.pending)focus=`<span class="t208-pending">◌ <b>${v.pending.ch}</b></span><span>${t('Đang tạo node, chưa nối vào cây','Initializing; not attached to the tree yet')}</span>`;
  else if(v.missing)focus=`<span class="t208-node-ref"><small>${at||'root'}</small><b>× ${v.target[v.index]}</b></span><b class="tp-bad">${t('Không có nhánh','Missing branch')}</b>`;
  else if(v.event==='return'&&v.phase==='prefix')focus=`<b class="tp-good">✓ ${t('Đủ đường → True','Path exists → True')}</b><span>${t('Không cần ★ ở node cuối','No ★ required at the last node')}</span>`;
  const presets=[{words:'apple,apply',search:'app',prefix:'app'},{words:'apple,app',search:'app',prefix:'app'},{words:'cat,car',search:'cap',prefix:'ca'},{words:'a,ab,abc',search:'ab',prefix:'abc'},{words:'apple,apple',search:'apple',prefix:'appl'}];
  const labels=[t('Prefix chưa là từ','Prefix is not a word'),t('Đã đánh dấu ★','Word marked ★'),t('Thiếu nhánh','Missing branch'),t('Chung tiền tố','Shared prefix'),t('Chèn trùng','Duplicate insert')];
  host.innerHTML=`<section class="tp-viz t208-viz" aria-label="${t('208 · Trie, từ và tiền tố','208 · Trie, words and prefixes')}">
    <header class="tp-head"><div><small>208 · TRIE ${v.block===2?"· DICTIONARY + '$'":'· TRIENODE'}</small><h2>${t('Có đường đi, đã là từ?','A path, or a complete word?')}</h2></div><span class="t208-star">★</span></header>
    <nav class="tp-words" aria-label="${t('Thao tác Trie','Trie operations')}">${v.operations.map((operation,i)=>`<button type="button" data-t208-operation="${operation.step}"${operation.step<0?' disabled':''} class="${i===v.opIndex?'current':''}${operation.done?' inserted':''}">${operation.method==='Trie'?'Trie()':operation.method==='insert'?`+ ${operation.word}`:operation.method}${operation.done?(operation.result===false?' ×':' ✓'):''}</button>`).join('')}</nav>
    <div class="t208-task"><code>${op.method}(${op.word?'"'+op.word+'"':''})</code><div>${token||'<span class="tp-muted">∅</span>'}</div></div>
    <div class="tp-trie-head"><b>Trie · ${v.nodes.length} node</b><span>★ ${t('đã chèn đủ từ','complete word inserted')}</span></div>
    ${triePictureGraph(v.nodes,v.current,v.path,v.created,false)}
    <div class="tp-focus" aria-live="polite">${focus}</div>
    <div class="t208-tests">${test(search,true)}${test(prefix,false)}</div>
    <div class="tp-debug"><header><b>${t('Dòng','Line')} ${v.line}</b><span>${v.scope}</span></header><div><code>${escapeHtml(v.source)}</code>${v.condition!==null?`<b>${v.condition?'True':'False'}</b>`:v.result!==null?`<b>${v.result?'True':'False'}</b>`:''}</div></div>
    <nav class="tp-actions">${[['reset',t('Làm lại','Restart')],['line',t('Dòng tiếp','Next line')+' <kbd>F10</kbd>'],['operation',t('Thao tác tiếp','Next operation')],['last',t('Kết quả','Result')]].map(([a,label])=>`<button type="button" data-t208-nav="${a}"${(a==='reset'?stepIndex===0:stepIndex>=steps.length-1)?' disabled':''}>${label}</button>`).join('')}</nav>
    <nav class="tp-presets">${presets.map((_,i)=>`<button type="button" data-t208-preset="${i}">${labels[i]}</button>`).join('')}</nav>
  </section>`;
  centerTriePictureGraph(host,v.current);
  const go=index=>{stopPlay();stepIndex=index;renderStep();};
  host.querySelectorAll('[data-t208-operation]').forEach(b=>b.addEventListener('click',()=>{const index=Number(b.dataset.t208Operation);if(index>=0)go(index);}));
  host.querySelectorAll('[data-t208-nav]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.t208Nav;if(a==='reset')return go(0);if(a==='last')return go(steps.length-1);if(a==='line')return go(Math.min(stepIndex+1,steps.length-1));const next=steps.findIndex((s,i)=>i>stepIndex&&s.trie208View?.opIndex>v.opIndex);go(next<0?steps.length-1:next);}));
  host.querySelectorAll('[data-t208-preset]').forEach(b=>b.addEventListener('click',()=>{stopPlay();const p=presets[Number(b.dataset.t208Preset)];$('arrInput').value=p.words;document.querySelector('[data-param="search"]').value=p.search;document.querySelector('[data-param="prefix"]').value=p.prefix;runViz();}));
}
