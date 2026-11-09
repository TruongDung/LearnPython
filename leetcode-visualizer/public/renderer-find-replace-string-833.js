'use strict';
const FR833_CASES=[
  ['abcd',[0,2],['a','cd'],['eee','ffff'],'Target dài hơn source','Longer targets'],
  ['abcd',[0,2],['ab','ec'],['eee','ffff'],'Một source không khớp','One source does not match'],
  ['abcdxyz',[4,0],['xyz','ab'],['q','long'],'Indices không theo thứ tự','Unsorted indices'],
  ['abcdef',[0,2,4],['ab','cd','ef'],['x','y','z'],'Các đoạn liền kề','Adjacent replacements'],
  ['abc',[0,2],['z','cde'],['x','tail'],'Không khớp / vượt cuối','Mismatch / past the end'],
  ['a',[0],['a'],['z'],'Một ký tự','One character'],
];
function fr833Esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fr833Card(title,body,hint=''){return `<section class="tr-card"><header><b>${title}</b><small>${hint}</small></header>${body}</section>`;}
function fr833Scroll(name,body,cls=''){return `<div class="fr833-scroll ${cls}" data-fr833-scroll="${name}" tabindex="0">${body}</div>`;}
function fr833Stat(name,value){return `<span class="fr833-stat"><code>${name}</code><b>${fr833Esc(value===null||value===undefined?'—':value)}</b></span>`;}
function fr833Letters(word,cls=''){return [...word].map(letter=>`<span class="fr833-letter ${cls}">${fr833Esc(letter)}</span>`).join('');}
function fr833Original(v,vi){
  const accepted=v.operations.filter(op=>op.status==='accepted');
  return fr833Card('s · '+(vi?'chuỗi gốc giữ nguyên':'original string stays unchanged'),fr833Scroll('original',[...v.s].map((letter,i)=>{
    const owner=accepted.find(op=>i>=op.index&&i<op.index+op.source.length),active=v.activeRange.includes(i);
    return `<button type="button" class="fr833-char ${owner?'is-accepted':''} ${active?'is-active':''} ${v.cursor===i?'is-current':''} ${v.cursor!==null&&i<v.cursor?'is-consumed':''}" data-fr833-char="${i}" data-input-index="${i}" data-input-char="${letter}"><small>[${i}]</small><b>${letter}</b><em>${v.cursor===i?'i ↑':owner?'R'+(owner.order+1):'·'}</em></button>`;
  }).join('')+`<span class="fr833-char fr833-end ${v.cursor===v.s.length?'is-current':''}"><small>[${v.s.length}]</small><b>∅</b><em>${v.cursor===v.s.length?'i ↑':'end'}</em></span>`,'fr833-lane')+`<div class="fr833-legend"><span class="is-green">□ ${vi?'đã lưu replacement':'stored replacement'}</span><span class="is-purple">↑ i</span><span>${vi?'Index luôn thuộc s gốc':'Indices always refer to original s'}</span></div>`);
}
function fr833Operations(v,vi){
  return fr833Card(vi?'Phép thay thế':'Replacements',`<div class="fr833-operations">${v.operations.map(op=>`<button type="button" class="fr833-operation is-${op.status} ${op.order===v.activeOperation?'is-active':''}" data-fr833-operation="${op.order}" data-operation-status="${op.status}"><small>R${op.order+1} · @${op.index}</small><code>${fr833Esc(op.source)}</code><i>→</i><code>${fr833Esc(op.target)}</code><strong>${op.status==='accepted'?'✓':op.status==='rejected'?'×':op.status==='matched'?'✓ …':'?'}</strong></button>`).join('')}</div>`,vi?'Chọn R → dòng kiểm tra source':'Select R → its source check line');
}
function fr833Comparison(v,vi){
  const op=v.activeOperation===null?null:v.operations[v.activeOperation];if(!op)return '';
  const checked=op.checkStep!==null;
  const columns=[...op.source].map((letter,i)=>{const actual=v.s[op.index+i]??null,pass=actual===letter;return `<span class="fr833-pair ${checked?pass?'is-match':'is-mismatch':''}" data-compare-offset="${i}"><small>@${op.index+i}</small><b>${actual??'∅'}</b><i>${checked?pass?'=':'≠':'?'}</i><b>${letter}</b></span>`;}).join('');
  return fr833Card('s.startswith(source, index)',`<div class="fr833-comparison-label"><code>↑ s[index:…] · ↓ source</code></div>${fr833Scroll('comparison',columns,'fr833-compare-lane')}<div class="fr833-verdict" data-checked="${checked}" data-check-result="${checked?op.status!=='rejected':''}">${checked?op.status==='rejected'?'False ×':'True ✓':'?'}</div>`,op.status==='matched'?vi?'Khớp · chưa ghi vào replacements':'Matched · not stored in replacements yet':op.status==='accepted'?vi?'Đã ghi vào replacements':'Stored in replacements':vi?'Đối chiếu từng ký tự':'Compare character by character');
}
function fr833Map(v,vi){
  return fr833Card('replacements',fr833Scroll('map',v.replacements.map(([index,[source,target]])=>`<span class="fr833-map-entry"><small>@${index}</small><code>${fr833Esc(source)}</code><i>→</i><code>${fr833Esc(target)}</code></span>`).join('')||'∅','fr833-map')+`<span class="fr833-hidden" data-native-map="${fr833Esc(JSON.stringify(v.locals.replacements??null))}"></span>`,vi?'Chỉ hiện sau dòng gán vào dict':'Appears only after the dictionary assignment');
}
function fr833Transfer(v,vi){
  const part=v.segment;if(!part)return '';
  const appended=part.step!==undefined;
  return fr833Card(part.kind==='replace'?vi?'Lấy source → thêm target':'Consume source → append target':vi?'Giữ ký tự gốc':'Copy an original character',`<div class="fr833-transfer"><div><small>s[${part.start}:${part.end}]</small>${fr833Scroll('take-source',fr833Letters(part.source),'fr833-word')}</div><i>→</i><div><small>${part.kind==='replace'?'target':'s[i]'}</small>${fr833Scroll('take-target',fr833Letters(part.text,appended?'is-appended':'is-waiting'),'fr833-word')}</div></div><div class="fr833-equation">${fr833Stat('i',v.cursor)}<small>${v.phase==='advance'?vi?'đã tăng i':'i advanced':appended?vi?'đã append · i chưa tăng':'appended · i has not advanced':vi?'chưa append':'not appended yet'}</small></div>`,vi?'Các dòng append và tăng i được phát riêng':'Append and index advancement replay separately');
}
function fr833Output(v,vi){
  let position=0;
  const chunks=v.chunks.map((part,k)=>{const start=position;position+=part.text.length;return `<button type="button" class="fr833-chunk is-${part.kind} ${v.change?.kind==='append'&&v.change.chunk===k?'is-written':''}" data-fr833-step="${part.step}" data-chunk-index="${k}" data-chunk-text="${fr833Esc(part.text)}" data-chunk-source-start="${part.start}" data-chunk-source-end="${part.end}"><small>s[${part.start}:${part.end}]</small><b>${fr833Esc(part.text)}</b><small>out[${start}:${position}]</small></button>`;}).join('');
  return fr833Card('answer · '+(vi?'các phần đã append':'appended chunks'),fr833Scroll('chunks',chunks||'∅','fr833-chunks')+`<div class="fr833-preview" data-native-preview="${fr833Esc(v.preview)}">${fr833Esc(v.preview||'∅')}</div><span class="fr833-hidden" data-native-answer="${fr833Esc(JSON.stringify(v.parts))}"></span>`,vi?'Xanh lá: thay thế · xanh dương: sao chép':'Green: replace · blue: copy');
}
function fr833Next(kind){if(typeof steps==='undefined')return -1;return steps.findIndex((s,i)=>i>stepIndex&&s.findReplace833View&&(kind==='line'||kind==='check'&&s.findReplace833View.change?.kind==='check'||kind==='append'&&s.findReplace833View.change?.kind==='append'||kind==='advance'&&s.findReplace833View.change?.kind==='advance'||kind==='result'&&s.final));}
function fr833Go(index){if(index<0||typeof steps==='undefined')return;if(typeof stopPlay==='function')stopPlay();stepIndex=index;renderStep();}
function fr833Bind(host){
  const bind=(selector,fn)=>host.querySelectorAll(selector).forEach(el=>{el.addEventListener('click',()=>fn(el));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();fn(el);}});});
  host.querySelectorAll('summary').forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')e.stopPropagation();}));
  bind('[data-fr833-jump]',el=>fr833Go(fr833Next(el.dataset.fr833Jump)));
  bind('[data-fr833-step]',el=>fr833Go(Number(el.dataset.fr833Step)));
  bind('[data-fr833-operation]',el=>{const order=Number(el.dataset.fr833Operation);fr833Go(steps.findIndex(s=>s.findReplace833View.change?.kind==='check'&&s.findReplace833View.change.order===order));});
  bind('[data-fr833-char]',el=>{const index=Number(el.dataset.fr833Char),chunk=steps.at(-1).findReplace833View.chunks.find(c=>index>=c.start&&index<c.end);fr833Go(chunk?.step??-1);});
  bind('[data-fr833-case]',el=>{const [s,indices,sources,targets]=FR833_CASES[Number(el.dataset.fr833Case)];document.getElementById('arrInput').value=s;for(const [key,value]of Object.entries({indices,sources,targets}))document.getElementById('param-'+key).value=JSON.stringify(value);if(typeof runViz==='function')runViz();});
}
function renderFindReplace833View(step){
  const v=step.findReplace833View,host=document.getElementById('treeView');if(!v||!host)return;
  const vi=typeof lang!=='undefined'&&lang==='vi',open=host.querySelector('.fr833-native')?.open??false;
  const scrolls=new Map([...host.querySelectorAll('[data-fr833-scroll]')].map(el=>[el.dataset.fr833Scroll,{x:el.scrollLeft,y:el.scrollTop}]));
  const scanning=v.locals.answer!==undefined;
  const jumps=[['line',vi?'Dòng →':'Line →'],['check',vi?'Kiểm tra →':'Check →'],['append','Append →'],['advance','i →'],['result',vi?'Kết quả ↠':'Result ↠']];
  host.innerHTML=`<article class="tr-viz fr833-viz" data-problem-id="833" data-source-line="${v.source.line}" role="region" aria-label="LeetCode 833"><header class="tr-header"><div><small>LEETCODE 833 · STRING</small><h2>${vi?'Khớp trên chuỗi gốc → ghép kết quả':'Match the original → build the result'}</h2></div><code>validate → scan → join</code></header><nav class="tr-presets" aria-label="Examples">${FR833_CASES.map((c,i)=>`<button type="button" data-fr833-case="${i}">${c[vi?4:5]}</button>`).join('')}</nav><div class="tr-source"><span>${vi?'Sau dòng':'After line'} <b>L${v.source.line}</b></span><code>${fr833Esc(v.source.text)}</code>${v.branch===null?'':`<strong class="${v.branch?'is-good':'is-muted'}">${v.branch?'True ✓':'False ×'}</strong>`}</div><div class="fr833-phases"><span class="${scanning?'':'is-current'}">① ${vi?'Khớp trên s gốc':'Match original s'}</span><i>→</i><span class="${scanning?'is-current':''}">② ${vi?'Ghép output':'Build output'}</span></div><div class="fr833-work">${fr833Original(v,vi)}${fr833Comparison(v,vi)}${fr833Transfer(v,vi)}${fr833Output(v,vi)}${fr833Operations(v,vi)}${fr833Map(v,vi)}</div><details class="tr-native fr833-native"><summary>${vi?'Biến Python · từng frame':'Python locals · every frame'}</summary>${v.frames.map(f=>`<div class="fr833-frame"><code>${fr833Esc(f.name)}</code><pre>${fr833Esc(JSON.stringify(f.locals,null,2))}</pre></div>`).join('')}</details>${v.answer===null?'':`<output class="tr-answer" data-answer="${fr833Esc(JSON.stringify(v.answer))}"><small>${vi?'Kết quả':'Result'}</small><strong>${fr833Esc(v.answer)}</strong></output>`}<footer class="tr-footer"><div>${jumps.map(([kind,label])=>`<button type="button" data-fr833-jump="${kind}" ${fr833Next(kind)<0?'disabled':''}>${label}</button>`).join('')}</div></footer></article>`;
  const details=host.querySelector('.fr833-native');if(details)details.open=open;
  for(const el of host.querySelectorAll('[data-fr833-scroll]')){const saved=scrolls.get(el.dataset.fr833Scroll);if(saved){el.scrollLeft=saved.x;el.scrollTop=saved.y;}const active=el.querySelector('.is-current')??el.querySelector('.is-written')??el.querySelector('.is-active');if(active){const a=el.getBoundingClientRect(),b=active.getBoundingClientRect();if(b.left<a.left+5)el.scrollLeft-=a.left+5-b.left;if(b.right>a.right-5)el.scrollLeft+=b.right-a.right+5;}}
  fr833Bind(host);
}
