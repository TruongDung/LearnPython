"use strict";

function palindrome1278Next(kind) {
  if (typeof steps === 'undefined' || typeof stepIndex === 'undefined') return -1;
  for (let i = stepIndex + 1; i < steps.length; i++) {
    const v = steps[i].palindrome1278View;
    if (!v) continue;
    if (kind === 'line' || kind === 'pair' && v.phase === 'cost' && v.line === 9
      || kind === 'state' && (v.phase === 'partition' || ['enter-call','cache-hit','return-call'].includes(v.operation))
      || kind === 'result' && steps[i].final) return i;
  }
  return -1;
}

function renderPalindrome1278View(step) {
  const v = step.palindrome1278View, final = step.final, dfs = v.approach === 2;
  const t = (a,b) => lang === 'vi' ? a : b;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const host = document.getElementById('treeView');
  let selected = 0;
  const part = (f, index, clickable) => {
    const content = `<small>${t('Đoạn','Part')} ${index+1} · [${f.start}, ${f.end})</small><strong>${esc(f.original)}</strong><span>${f.changes ? `→ ${esc(f.repaired)} · ${f.changes} ${t('sửa','changes')}` : `✓ ${t('Giữ nguyên','Unchanged')}`}</span>`;
    return clickable ? `<button type="button" class="p1278-part" data-p1278-segment="${index}" aria-pressed="${index===selected}">${content}</button>` : `<div class="p1278-part">${content}</div>`;
  };
  function matrix(rows, label, kind, current, source, known) {
    if (!rows) return '';
    const open = kind === 'dp' && ['dp','partition'].includes(v.phase);
    return `<details class="p1278-details"${open ? ' open' : ''}><summary>${label}</summary>
      <small>${kind === 'cost' ? t('Hàng left, cột right · ·: chưa tính (giá trị đang là 0)','Rows: left, columns: right · ·: not computed yet (currently zero)') : t(`Hàng: số đoạn · Cột: số ký tự · —: chưa đạt (n = ${v.n})`,`Rows: parts · Columns: letters · —: unreachable (n = ${v.n})`)}</small>
      <div class="p1278-table-scroll"><table><thead><tr><th>${kind==='cost'?'l / r':'p / end'}</th>${rows[0].map((_,i)=>`<th>${i}</th>`).join('')}</tr></thead><tbody>${rows.map((row,a)=>`<tr><th>${a}</th>${row.map((value,b)=>`<td class="${current && current[0]===a && current[1]===b ? 'current' : source && source[0]===a && source[1]===b ? 'source' : ''}">${kind==='cost' && a>b ? '—' : known && !known[a][b] ? '·' : value ?? '—'}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>`;
  }
  function draw() {
    const f = final ? v.selected[selected] : v.focus;
    const repairs = new Map((f?.pairs || []).filter(pair=>pair.mismatch).map(pair=>[pair.b,v.s[pair.a]]));
    const bad = new Set((f?.pairs || []).filter(pair=>pair.mismatch).flatMap(pair=>[pair.a,pair.b]));
    const letters = v.s.split('').map((ch,i)=>{
      const inFocus = !f || i>=f.start && i<f.end;
      const pointer = v.outer && [v.outer.a,v.outer.b].includes(i);
      return `<span data-p1278-index="${i}" class="${inFocus?'':'muted'} ${bad.has(i)?'mismatch':''} ${pointer?'pointer':''}"><small>${i}</small><b>${esc(ch)}</b>${repairs.has(i)?`<em>→ ${esc(repairs.get(i))}</em>`:''}</span>`;
    }).join('');
    const pairs = f ? f.pairs.map((pair,i)=>`<div class="p1278-pair${i===0 && v.outer?' active':''}"><span>${esc(v.s[pair.a])}<small>[${pair.a}]</small></span><b>${pair.known ? pair.mismatch ? '≠' : '=' : '?'}</b><span>${esc(v.s[pair.b])}<small>[${pair.b}]</small></span><span class="p1278-pair-result">${pair.known ? pair.mismatch ? `${esc(v.s[pair.b])} → ${esc(v.s[pair.a])} · +1` : '✓ +0' : t('Chưa so sánh','Not compared yet')}</span></div>`).join('') : '';
    const focus = f ? `<section class="p1278-focus"><header><div><small>${final?t('Chọn một đoạn ở trên để xem','Choose a part above to inspect'):t('Đoạn đang xét','Current substring')}</small><h3>“${esc(f.original)}” <small>[${f.start}, ${f.end})</small></h3></div><b>${f.end-f.start} ${t('ký tự','letters')}</b></header>
      ${f.pairs.length ? `<div class="p1278-pairs">${pairs}</div>` : `<p class="p1278-single">✓ ${t('Một ký tự đã đối xứng → 0 lần sửa','One letter is a palindrome → zero changes')}</p>`}
      ${v.phase==='cost' ? `<div class="p1278-cost-equation"><div><small>${t('Phần giữa','Inner substring')}</small><b>${v.inner ?? '?'}</b></div><span>+</span><div><small>${t('Cặp hai đầu','Outer pair')}</small><b>${v.mismatch ?? '?'}</b></div><span>=</span><div><small>cost[${f.start}][${f.end-1}]</small><b>${v.written ?? t('chưa ghi','pending')}</b></div></div>` : ''}
      <div class="p1278-repair"><div><small>${f.complete?t('Một cách sửa hợp lệ','One valid repair'):t('Các cặp đã biết','Known pairs so far')}</small><strong>${esc(f.repaired)}</strong></div><span>${f.changes} ${t('cặp lệch =','unequal pairs =')} <b>${f.changes} ${t('lần sửa','changes')}</b></span></div></section>` : '';
    let partition = '';
    if (final) partition = `<div class="p1278-partition" aria-label="${t('Cách chia tối ưu','Optimal partition')}">${v.selected.map((segment,i)=>part(segment,i,true)).join('')}</div>`;
    else if (v.phase==='partition') {
      partition = v.reachable ? `<div class="p1278-partition">${v.prefix.map((segment,i)=>part(segment,i,false)).join('')}${part(v.focus,v.parts-1,false)}</div><div class="p1278-transition"><div><small>${t('Các đoạn trước','Earlier parts')}</small><b>${v.previous}</b></div><span>+</span><div><small>${t('Đoạn mới','New part')}</small><b>${v.gain}</b></div><span>=</span><div><small>${t('Đang thử','Trial total')}</small><b>${v.total}</b></div><span>→</span><div class="best"><small>${t('Ít sửa nhất','Fewest so far')}</small><b>${v.best}</b></div></div>` : `<p class="p1278-note">${t(`Nguồn dp[${v.parts-1}][${v.cut}] chưa đạt → giữ nguyên ô đích.`,`Source dp[${v.parts-1}][${v.cut}] is unreachable → keep the destination.`)}</p>`;
      partition += `<p class="p1278-note">${v.updated ? t('✓ Tổng nhỏ hơn → giữ chỗ cắt này.','✓ Lower total → keep this cut.') : t('Giữ phương án tốt nhất trước đó.','Keep the earlier best.')}</p>`;
    }
    const cache = dfs && (v.phase==='dfs' || final) ? `<section class="p1278-dfs"><header><b>DFS(start, parts)</b><small>${v.cacheSize} ${t('trạng thái đã lưu','cached states')} · ${v.hits} cache hit</small></header><small>${t('Call stack · gốc → lời gọi hiện tại','Call stack · root → current call')}</small><div class="p1278-stack">${v.stack.map((frame,i)=>`<div class="${i===v.stack.length-1?'active':''}"><b>dfs(${frame.start}, ${frame.parts})</b><span>best = ${frame.best ?? '—'}${frame.end!==undefined?` · end = ${frame.end}`:''}</span></div>`).join('') || `<span>${final?t('Đã trả về','Returned'):t('Chưa gọi DFS','DFS not called yet')}</span>`}</div><small>${t(`n = ${v.n}: trạng thái không hợp lệ`,`n = ${v.n}: invalid state`)}</small><div class="p1278-cache">${v.memo.map(entry=>`<div data-p1278-cache="${entry.key}" class="${entry.key===v.cacheKey ? v.operation==='cache-hit'?'hit':'active':''}"><span>(${entry.key})</span><b>${entry.value}</b></div>`).join('') || `<small>${t('Cache trống','Cache empty')}</small>`}</div>${v.childValue!==undefined ? `<p>cost = ${v.gain} + dfs = ${v.childValue} → candidate = ${v.candidate}</p>`:''}</section>` : '';
    const dpTable = matrix(v.dp,t('Bảng DP & công thức','DP table & recurrence'),'dp', final?[v.k,v.n]:Number.isInteger(v.end)?[v.parts,v.end]:null,Number.isInteger(v.cut)?[v.parts-1,v.cut]:null);
    const costTable = matrix(v.costs,t('Bảng cost[left][right]','Substring cost[left][right]'),'cost',v.phase==='cost' && f?[f.start,f.end-1]:null,v.innerCell,v.known);
    const candidates = v.candidates?.length>1 ? `<details class="p1278-details"><summary>${t('Các chỗ cắt đã thử','Cuts tried so far')}</summary><div class="p1278-candidates">${v.candidates.map(c=>`<div class="${c.cut===v.bestCut?'best':''}"><span>${t('Cắt tại','Cut at')} ${c.cut}</span><span>${c.previous} + ${c.gain} = <b>${c.total}</b></span><span>${c.cut===v.bestCut?'✓':''}</span></div>`).join('')}</div></details>` : '';
    const stage = final?2:['dp','partition','dfs'].includes(v.phase)?1:0;
    const stages = [t('1 · Phí sửa từng đoạn','1 · Substring costs'),dfs?'2 · DFS + cache':t('2 · Thử chỗ cắt','2 · Try the cuts'),t('3 · Cách chia tối ưu','3 · Best partition')];
    const jump = [['line',t('Dòng →','Line →')],['pair',t('So sánh →','Compare →')],['state',dfs?t('Lời gọi / cache →','Call / cache →'):'DP →'],['result',t('Kết quả ↠','Result ↠')]].map(([kind,label])=>`<button type="button" data-p1278-jump="${kind}"${palindrome1278Next(kind)<0?' disabled':''}>${label}</button>`).join('');
    host.innerHTML = `<section class="p1278-viz" data-method="${v.approach}" aria-label="${t('1278 · Chia chuỗi đối xứng với ít lần sửa nhất','1278 · Partition into palindromes with fewest changes')}">
      <header class="p1278-head"><div><small>1278 · PALINDROME PARTITIONING III</small><h2>${t(`Đúng ${v.k} đoạn · sửa ít nhất`,`Exactly ${v.k} parts · fewest changes`)}</h2></div>${final?`<div class="p1278-answer"><strong>${v.answer}</strong><span>${t('ký tự cần sửa','letter changes')}</span></div>`:''}</header>
      <div class="p1278-stages">${stages.map((label,i)=>`<span class="${i===stage?'active':''}">${label}</span>`).join('')}</div>
      <section class="p1278-debug" aria-live="polite"><header><b>L${v.line}</b><span>${esc(t(v.event.vi,v.event.en))}</span>${typeof v.condition==='boolean'?`<strong class="${v.condition?'true':'false'}">${v.condition?'True':'False'}</strong>`:''}</header><code>${esc(v.source.trim())}</code></section>
      <nav class="p1278-jumps" aria-label="${t('Debug từng dòng','Line-by-line debug')}">${jump}</nav>
      ${partition}${cache}<div class="p1278-letters" aria-label="${t('Chuỗi ban đầu; chỉ số bắt đầu từ 0','Original string; zero-based indices')}">${letters}</div>${focus}
      <p class="p1278-rule">${t('Một cặp lệch = 1 lần sửa. Đoạn một ký tự luôn tốn 0.','One unequal mirrored pair = one change. A single letter always costs zero.')}</p>
      ${candidates}${dpTable}${costTable}
      ${!v.detailed?`<small>${t('Debug đầy đủ với n ≤ 12. Chuỗi dài hơn vẫn tính đủ kết quả.','Full debug for n ≤ 12. Longer strings still compute the full result.')}</small>`:''}
      <nav class="p1278-examples" aria-label="${t('Ví dụ','Examples')}"><span>${t('Thử nhanh:','Try:')}</span>${[t('abc · 2 đoạn','abc · 2 parts'),t('aabbc · 3 đoạn','aabbc · 3 parts'),t('leetcode · 8 đoạn','leetcode · 8 parts'),t('abcba · 1 đoạn','abcba · 1 part')].map((label,i)=>`<button type="button" data-p1278-example="${i}">${label}</button>`).join('')}</nav>
    </section>`;
    host.querySelectorAll('[data-p1278-segment]').forEach(button=>button.addEventListener('click',()=>{ selected=Number(button.dataset.p1278Segment); draw(); }));
    host.querySelectorAll('[data-p1278-jump]').forEach(button=>button.addEventListener('click',()=>{
      const next=palindrome1278Next(button.dataset.p1278Jump);
      if(next<0)return;
      if(typeof stopPlay==='function')stopPlay();
      stepIndex=next;renderStep();
    }));
    host.querySelectorAll('[data-p1278-example]').forEach(button=>button.addEventListener('click',()=>{
      const [s,k]=[['abc',2],['aabbc',3],['leetcode',8],['abcba',1]][Number(button.dataset.p1278Example)];
      document.getElementById('arrInput').value=s;
      document.getElementById('extraParams').querySelector('[data-param="k"]').value=k;
      runViz();
    }));
  }
  draw();
}
