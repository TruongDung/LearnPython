'use strict';
function renderPrefixSuffix3045View(step) {
  const v=step.prefixSuffix3045View,host=$('treeView'),t=(vi,en)=>lang==='vi'?vi:en;
  const presets=[['a','aba','ababa','aa'],['a','a','a'],['ab','abc'],['ab','cab'],['abab','ab']];
  const labels=[t('Cơ bản','Basic'),t('Trùng từ','Duplicates'),t('Chỉ prefix','Prefix only'),t('Chỉ suffix','Suffix only'),t('Thứ tự i < j','Order i < j')];
  const added=v.add;
  const cols=v.pairs.map((p,index)=>`${index&&p.depth-v.pairs[index-1].depth>1?'<span class="ps3045-gap">…</span>':''}<div class="ps3045-pair${p.depth===v.d?' current':''}${p.depth<v.d?' visited':''}"><small>${p.depth}</small><b class="front">${p.left}</b><span class="ps3045-link">↕</span><b class="back">${p.right}</b><small>${v.wordLength-1-p.depth}</small></div>`).join('');
  const proof=v.matches.slice(-10).map(m=>`<span class="ps3045-match${added?.indices.includes(m.i)&&m.j===v.j?' fresh':''}"><small>(${m.i}, ${m.j})</small><b>${escapeHtml(m.word)}</b><span>✓ ${t('đầu + cuối','front + back')}</span></span>`).join('');
  const focus=added?`<span class="ps3045-sum"><small>answer</small><strong>${added.before} + <b>${added.count}</b> = ${added.after}</strong></span><span class="ps3045-terminal"><small>terminal[${v.node}]</small><strong>${added.count}</strong></span>`
    :v.phase==='missing'?`<b class="tp-bad">× ${t('Không có cạnh','Missing edge')}</b><span>${t('Hỏi xong, bắt đầu chèn','Query ends; insert next')}</span>`
    :v.phase==='terminal'?`<b class="tp-good">★ terminal[${v.node}] = ${v.nodes.find(n=>n.id===v.node)?.terminal??'—'}</b><span>${t('Từ này chỉ được đếm ở lượt sau','This word is counted by later queries')}</span>`
    :v.phase==='done'?`<b class="tp-good">✓ ${v.answer} ${t('cặp (i, j)','pairs (i, j)')}</b><span>i &lt; j</span>`
    :`<code>${v.pair?`(${v.pair.join(', ')})`:'∅'}</code><span>${v.mode==='insert'?t('Chèn sau khi hỏi','Insert after querying'):t('Chỉ hỏi các từ trước','Query earlier words only')}</span>`;
  host.innerHTML=`<section class="tp-viz ps3045-viz" aria-label="${t('3045 · Trie cặp đầu và cuối','3045 · Front/back paired trie')}">
    <header class="tp-head"><div><small>3045 · PAIRED TRIE</small><h2>${t('Đọc từ hai đầu','Read from both ends')}</h2></div><div class="tp-total"><strong>${v.answer}</strong><span>${t('cặp','pairs')}</span></div></header>
    <nav class="tp-words" aria-label="words">${v.words.map(w=>`<button type="button" data-ps3045-word="${w.step}"${w.step<0?' disabled':''} class="${w.index===v.j?'current':''}${w.inserted?' inserted':''}"><small>${w.index}</small>${escapeHtml(w.text)}${w.inserted?' ★':''}</button>`).join('')}${v.totalWords>v.words.length?`<span>+${v.totalWords-v.words.length}</span>`:''}</nav>
    <div class="ps3045-word"><header><code>${v.j===null?'words':`words[${v.j}] = "${escapeHtml(v.word)}"`}</code><span>${t('trên: đầu · dưới: cuối','top: front · bottom: back')}</span></header><div class="ps3045-pairs">${cols||'<span>∅</span>'}</div></div>
    <div class="tp-phases"><span class="${v.mode==='query'?'active':''}">1 · ${t('Hỏi','Query')}</span><span class="${v.mode==='insert'?'active':''}">2 · ${t('Chèn','Insert')}</span><span>★ ${t('số từ kết thúc','word endings')}</span></div>
    <div class="tp-trie-head"><b>Trie · ${v.totalNodes} node</b><span>${t('Số trong node = terminal','Number inside node = terminal')}</span></div>
    ${triePictureGraph(v.nodes,v.node,v.path,v.created,true)}
    ${v.totalNodes>v.nodes.length?`<small class="tp-muted">+${v.totalNodes-v.nodes.length} ${t('node ngoài khung','nodes outside the preview')}</small>`:''}
    <div class="tp-focus" aria-live="polite">${focus}</div>
    <div class="ps3045-matches"><header><b>${t('Các cặp đã đếm','Counted pairs')}</b><span>${v.answer}</span></header><div>${proof||'<span class="tp-muted">∅</span>'}</div>${v.answer>Math.min(v.matches.length,10)?`<small>+${v.answer-Math.min(v.matches.length,10)} ${t('cặp khác','other pairs')}</small>`:''}</div>
    <div class="tp-debug"><header><b>${t('Dòng','Line')} ${v.line}</b><span>j = ${v.j??'—'} · d = ${v.d??'—'} · node = ${v.node??'—'}</span></header><div><code>${escapeHtml(v.source)}</code>${v.condition!==null?`<b>${v.condition?'True':'False'}</b>`:''}</div></div>
    ${!v.detailed?`<p class="tp-summary">${t('Trace rút gọn; tính đủ mọi từ. Debug đầy đủ: ≤12 từ, tổng ≤80 chữ, mỗi từ ≤24.','Sampled trace; all words computed. Full debug: ≤12 words, ≤80 total letters, ≤24 per word.')}</p>`:''}
    <nav class="tp-actions">${[['reset',t('Làm lại','Restart')],['line',t('Dòng tiếp','Next line')+' <kbd>F10</kbd>'],['add',t('Lần cộng tiếp','Next addition')],['last',t('Kết quả','Result')]].map(([a,label])=>`<button type="button" data-ps3045-nav="${a}"${(a==='reset'?stepIndex===0:stepIndex>=steps.length-1)?' disabled':''}>${label}</button>`).join('')}</nav>
    <nav class="tp-presets">${presets.map((_,i)=>`<button type="button" data-ps3045-preset="${i}">${labels[i]}</button>`).join('')}</nav>
  </section>`;
  centerTriePictureGraph(host,v.node);
  const col=host.querySelector('.ps3045-pair.current'),strip=host.querySelector('.ps3045-pairs');if(col)strip.scrollLeft=Math.max(0,col.offsetLeft-strip.clientWidth/2);
  const go=index=>{stopPlay();stepIndex=index;renderStep();};
  host.querySelectorAll('[data-ps3045-nav]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.ps3045Nav;if(a==='reset')return go(0);if(a==='last')return go(steps.length-1);if(a==='line')return go(Math.min(stepIndex+1,steps.length-1));const idx=steps.findIndex((s,i)=>i>stepIndex&&s.prefixSuffix3045View?.add?.count>0);go(idx<0?steps.length-1:idx);}));
  host.querySelectorAll('[data-ps3045-word]').forEach(b=>b.addEventListener('click',()=>{if(Number(b.dataset.ps3045Word)>=0)go(Number(b.dataset.ps3045Word));}));
  host.querySelectorAll('[data-ps3045-preset]').forEach(b=>b.addEventListener('click',()=>{stopPlay();$('arrInput').value=JSON.stringify(presets[Number(b.dataset.ps3045Preset)]);runViz();}));
}
