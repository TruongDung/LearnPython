'use strict';
function superstring943Next(kind){
  if(typeof steps==='undefined'||typeof stepIndex==='undefined')return -1;
  for(let i=stepIndex+1;i<steps.length;i++){const v=steps[i].shortest943PictureView;if(v&&(kind==='line'||kind==='overlap'&&v.line===11||kind==='write'&&v.line===26||kind==='result'&&steps[i].final))return i;}return -1;
}
function renderShortest943Pictures(step){
  const v=step.shortest943PictureView,p=v.pythonLocals,final=step.final;
  const t=(vi,en)=>lang==='vi'?vi:en,esc=value=>String(value??'—').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const host=document.getElementById('treeView');let inspected=null;
  const ids=mask=>v.words.map((_,i)=>mask&(1<<i)?`#${i}`:null).filter(Boolean).join(' ');
  const overlap=(a,b)=>{for(let k=Math.min(a.length,b.length);k>=0;k--)if(a.endsWith(b.slice(0,k)))return k;return 0;};
  const letters=(text,shared=0,side='prefix',failed=false,added=false)=>[...text].map((char,i)=>`<span class="${(side==='prefix'?i<shared:i>=text.length-shared)?failed?'mismatch':'shared':added?'added':''}">${esc(char)}</span>`).join('');
  function ribbon(label,text,start=0,shared=0,side='prefix',failed=false,added=false){return `<div class="s943-ribbon"><small>${esc(label)}</small><i style="width:calc(var(--s943-cell) * ${start})"></i>${letters(text,shared,side,failed,added)}</div>`;}
  function pairPicture(prefix,word,k,matched,a,b,label){
    return `<section class="s943-join"><header><b>${esc(label)}</b><span>k = ${k} · ${matched?'✓':'✕'}</span></header><div class="s943-ribbons">${ribbon(a,prefix,0,k,'suffix',!matched)}${ribbon(b,word,prefix.length-k,k,'prefix',!matched,true)}${matched?`<div class="s943-ribbon"><small>=</small>${letters(prefix)}${letters(word.slice(k),0,'prefix',false,true)}</div>`:''}</div></section>`;
  }
  function draw(){
    let picture='';
    if(final){picture=`<section class="s943-join result"><header><b>✓ ${t('Chỉ đếm phần thêm','Count only the new letters')}</b><span>${v.answer.length} ${t('ký tự','characters')}</span></header><div class="s943-ribbons">${v.placements.map(item=>ribbon(`#${item.index}`,item.word,item.start,item.overlap,'prefix',false,true)).join('')}${ribbon('=',v.answer)}</div><div class="s943-length">${v.placements.map(item=>item.word.length-item.overlap).join(' + ')} = <b>${v.answer.length}</b></div></section>`;}
    else if(v.merge){const m=v.merge;picture=pairPicture(m.prefix,v.words[m.b],m.k,true,'DP',`#${m.b}`,t('Thử ghép','Try a merge'));}
    else if(v.probe){const q=v.probe;picture=pairPicture(v.words[q.a],v.words[q.b],q.k,q.matched,`#${q.a}`,`#${q.b}`,t('Đuôi = đầu?','Suffix = prefix?'));}
    else if(v.phase==='init'&&v.n>1){const k=overlap(v.words[0],v.words[1]);picture=pairPicture(v.words[0],v.words[1],k,true,'#0','#1',t('Minh họa ghép từ','Merge illustration'));}
    else if(v.phase==='seed'){const index=p.last??0;picture=`<div class="s943-ribbons">${ribbon(`#${index}`,v.words[index])}</div>`;}
    else if(v.phase==='dp'){picture=v.prefix===null?`<div class="s943-empty">∅ · ${t('Chưa có chuỗi cho trạng thái này','No string in this state yet')}</div>`:`<div class="s943-ribbons">${ribbon('DP',v.prefix)}</div>`;}
    else picture=`<div class="s943-ribbons">${ribbon('#0',v.words[0])}</div>`;
    const m=v.merge;
    const compare=m?`<div class="s943-compare"><article class="${m.status==='kept'?'winner':''}"><small>${t('Đang lưu','Stored')}</small><code>${m.old===null?'∅':esc(m.old)}</code><b>${m.old?.length??'—'}</b></article><span>vs</span><article class="${m.status==='written'?'winner':''}"><small>${t('Ứng viên','Candidate')}</small><code>${esc(m.candidate)}</code><b>${m.candidate.length}</b></article></div><div class="s943-flow"><span>{ ${ids(m.fromMask)} } · ${t('cuối','last')} #${m.a}</span> + #${m.b} → <b>{ ${ids(m.toMask)} } · ${t('cuối','last')} #${m.b}</b>${m.status==='written'?' ✓':m.status==='kept'?` · ${t('giữ cũ','keep stored')}`:''}</div>`:'';
    const pending=v.pending;
    const effect=pending?`<div class="s943-effect"><small>${pending.kind==='condition'?t('Kiểm tra','Test'):pending.kind==='return'?t('Trả về','Return'):t('Sắp ghi','Next write')}</small><code>${esc(pending.target)}</code>${pending.kind==='condition'?`<b>${pending.after?'True':'False'}</b>`:`${pending.before!==undefined?`<span>${esc(pending.before)}</span> → `:''}<b>${esc(pending.after)}</b>`}${pending.row!==undefined?`<small>${t('hàng','row')} ${pending.row+1}/${pending.totalRows}</small>`:''}</div>`:'';
    const matrix=v.overlap?`<div class="s943-matrix"><table><thead><tr><th>→</th>${v.words.map((_,i)=>`<th>#${i}</th>`).join('')}</tr></thead><tbody>${v.overlap.map((row,a)=>`<tr><th>#${a}</th>${row.map((size,b)=>`<td><button type="button" data-s943-pair="${a}:${b}"${a===b||!v.row.length?' disabled':''} class="${size?'match':''}" title="${esc(v.words[a])} → ${esc(v.words[b])}">${a===b?'—':size}</button></td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
    const inspect=inspected?pairPicture(v.words[inspected.a],v.words[inspected.b],v.overlap[inspected.a][inspected.b],true,`#${inspected.a}`,`#${inspected.b}`,t('Xem overlap','Inspect overlap')):'';
    host.innerHTML=`<section class="s943-viz" aria-label="943 · Shortest Superstring"><header class="s943-head"><div><small>943 · SHORTEST SUPERSTRING</small><h2>${t('Chồng phần trùng, thêm phần mới','Overlap the match, append the rest')}</h2></div><output><strong>${final?v.answer.length:v.n}</strong><span>${final?t('ký tự','characters'):t('từ','words')}</span></output></header>
      <section class="s943-debug"><header><b>▶ L${v.line}</b><span>${t('Sắp chạy','Before execution')}</span><button type="button" data-s943-jump="line"${superstring943Next('line')<0?' disabled':''}>${t('Dòng →','Line →')} F10</button></header><code>${esc(v.source.trim())}</code>${effect}</section>
      ${!v.detailed?`<small class="s943-caption">${t('Trace rút gọn · ≤ 3 từ để debug đủ từng dòng.','Shortened trace · use ≤ 3 words to debug every line.')}</small>`:''}
      <div class="s943-words">${v.words.map((word,i)=>`<span class="${v.rowMask&(1<<i)?'used':''} ${(final?v.placements.at(-1).index:p.last)===i?'last':''}"><small>#${i}</small><b>${esc(word)}</b></span>`).join('')}</div>
      ${v.rawWords.length>v.words.length?`<small class="s943-caption">${t(`Bỏ ${v.rawWords.length-v.words.length} từ trùng / đã nằm trong từ khác.`,`Removed ${v.rawWords.length-v.words.length} duplicate / contained words.`)}</small>`:''}
      ${picture}<div class="s943-legend"><span class="shared">▧ ${t('phần trùng','overlap')}</span><span class="added">▧ ${t('phần thêm','new letters')}</span></div>${compare}
      ${v.row.length?`<section class="s943-memory"><header>DP { ${ids(v.rowMask)} } <small>${t('Cùng tập + cùng từ cuối → giữ ngắn hơn','Same set + same last word → keep shorter')}</small></header><div>${v.row.map(item=>`<article class="${m?.b===item.last?'focus':''}"><small>${t('cuối','last')} #${item.last}</small><code title="${esc(item.text)}">${item.text===null?'∅':esc(item.text.length>22?item.text.slice(0,19)+'…':item.text)}</code><b>${item.length??'—'}</b></article>`).join('')}</div></section>`:''}
      <details class="s943-overlap"${inspected?' open':''}><summary>${t('Bảng overlap · chạm ô để xem hình','Overlap table · tap a cell to inspect')}</summary>${matrix}${inspect}</details>
      <details class="s943-details"><summary>${t('Biến & bitmask','Variables & bitmask')}</summary><div>${Object.entries(p).filter(([key])=>!['words','dp','overlap'].includes(key)).map(([key,value])=>`<span><small>${key}</small><b>${esc(value)}</b></span>`).join('')}</div></details>
      <nav class="s943-controls">${[['overlap',t('Overlap →','Overlap →')],['write',t('Ghi DP →','Next DP write →')],['result',t('Kết quả ↠','Result ↠')]].map(([kind,title])=>`<button type="button" data-s943-jump="${kind}"${superstring943Next(kind)<0?' disabled':''}>${title}</button>`).join('')}</nav>
      <nav class="s943-examples">${[t('cat → atg → tgc','cat → atg → tgc'),t('Ví dụ 5 từ','5-word example'),t('Không trùng','No overlap'),t('Một từ','One word'),'ab, ba'].map((title,index)=>`<button type="button" data-s943-example="${index}">${title}</button>`).join('')}</nav></section>`;
    host.querySelectorAll('[data-s943-pair]').forEach(button=>button.addEventListener('click',()=>{const [a,b]=button.dataset.s943Pair.split(':').map(Number);inspected={a,b};draw();}));
    host.querySelectorAll('[data-s943-jump]').forEach(button=>button.addEventListener('click',()=>{const next=superstring943Next(button.dataset.s943Jump);if(next<0)return;if(typeof stopPlay==='function')stopPlay();stepIndex=next;renderStep();}));
    host.querySelectorAll('[data-s943-example]').forEach(button=>button.addEventListener('click',()=>{document.getElementById('arrInput').value=['cat,atg,tgc','catg,ctaagt,gcta,ttca,atgcatc','alex,loves,leetcode','abc','ab,ba'][Number(button.dataset.s943Example)];runViz();}));
  }draw();
}
