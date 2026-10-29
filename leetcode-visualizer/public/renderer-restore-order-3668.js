'use strict';

const r3668Text=(vi,en)=>lang==='vi'?vi:en;
const r3668Tone=id=>`var(--r3668-c${(id-1)%6})`;

function r3668Avatar(id,friend=false) {
  return `<svg class="r3668-runner ${id===null?'empty':''}" viewBox="0 0 60 70" role="img" aria-label="${id===null?'?':'ID '+id}" style="--r3668-tone:${id===null?'var(--r3668-muted)':r3668Tone(id)}"><circle class="head" cx="30" cy="9" r="6"/><path class="body" d="M21,18 L15,21 L9,34 L16,38 L20,30 V48 H40 V30 L44,38 L51,34 L45,21 L39,18Z"/><path class="limbs" d="M25,49 L20,64 M35,49 L40,64"/><text class="bib" x="30" y="39">${id??'?'}</text>${friend?'<text class="star" x="49" y="15">★</text>':''}</svg>`;
}

function r3668Card(id,index,view,result=false) {
  const checked=result?null:view.checked.find(item=>item.position===index);
  const selected=!result&&index===view.active,added=!result&&view.added.includes(index);
  const just=result&&view.move?.to===index;
  const sourceRank=result&&id!==null?view.added[index]+1:null;
  return `<figure class="r3668-card-runner ${selected?'active':''} ${added||result&&id!==null?'added':''} ${checked&&!checked.isFriend?'skipped':''} ${id===null?'empty':''} ${just?'just':''}" data-${result?'result':'order'}-slot="${index}" data-runner="${id??''}" style="--r3668-tone:${id===null?'var(--r3668-muted)':r3668Tone(id)}"><small>${index+1}</small>${r3668Avatar(id,id!==null&&view.friends.includes(id))}<span title="${sourceRank===null?'':r3668Text('Hạng trong toàn cuộc đua','Overall finishing rank')}">${sourceRank!==null?'🏁 '+sourceRank:added?'✓':checked&&!checked.isFriend?'×':selected?'↑':'·'}</span></figure>`;
}

function r3668Gate(view) {
  const runner=view.active===null?null:view.order[view.active],verdict=view.verdict;
  const count=view.result===null?null:view.result.length;
  const accepted=verdict===true,rejected=verdict===false;
  return `<div class="r3668-gate"><div class="r3668-current"><small>runner</small>${view.done?'<span class="r3668-flag">🏁</span>':r3668Avatar(runner,runner!==null&&view.friends.includes(runner))}<b>${runner===null?'—':runner}</b></div><svg class="r3668-fork" viewBox="0 0 230 140" role="img" aria-label="${r3668Text('Lọc theo friend_set','Filter through friend_set')}"><defs><marker id="r3668-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5Z"/></marker></defs><path class="entry" d="M4,70 H49"/><path class="diamond ${accepted?'yes':rejected?'no':''}" d="M80,42 L108,70 L80,98 L52,70Z"/><text class="gate-symbol ${accepted?'yes':rejected?'no':''}" x="80" y="77">${verdict===null?'?':verdict?'✓':'×'}</text><text class="caption" x="80" y="24">∈ friend_set</text><path class="route accept ${accepted?'selected':''} ${view.move?'written':''}" d="M109,70 Q139,70 139,35 H201"/><path class="route reject ${rejected?'selected':''} ${view.event==='skip'?'written':''}" d="M109,70 Q139,70 139,111 H201"/><circle class="exit ${view.move?'written':''}" cx="215" cy="35" r="12"/><text class="exit-id" x="215" y="39">${view.move?view.move.runner:'·'}</text><text class="caption yes" x="183" y="13">+ result</text><text class="skip-mark ${rejected?'selected':''}" x="215" y="117">×</text><text class="caption" x="178" y="136">${r3668Text('bỏ qua','skip')}</text></svg><div class="r3668-count"><small>result</small><strong data-counter="result">${count??'—'}</strong><span>/ ${view.friends.length}</span><div class="r3668-dots">${view.friends.map((_,index)=>`<i class="${count!==null&&index<count?'filled':''}"></i>`).join('')}</div></div></div>`;
}

function renderFinishing3668Pictures(step) {
  const view=step.finishing3668View;
  if (!view) return;
  const events={set:['Tạo set bạn','Build the friend set'],init:['Ô kết quả trống','Empty result slots'],runner:['Người về đích kế tiếp','Next finisher'],lookup:['Có trong friend_set?','In friend_set?'],accept:['Bạn → chờ append','Friend → awaiting append'],skip:['Bỏ qua','Skip'],append:['Thêm vào result','Append to result'],exhausted:['Đã duyệt hết order','End of order'],return:['Kết quả','Result'],step:['Thực thi','Execute']};
  const label=events[view.event]??events.step;
  const icon=view.event==='append'?'+':view.event==='skip'?'×':view.event==='lookup'?'?':view.done?'✓':'→';
  const result=view.friends.map((_,index)=>view.result?.[index]??null);
  const friendSet=view.friendSet;
  $('treeView').innerHTML=`<div class="r3668-viz" data-event="${view.event}" data-active="${view.active??''}">
    <header class="r3668-heading"><code>#3668 · 🏁 → ★</code><b>L${view.source.line} ✓</b><small>${r3668Text('sau dòng','after line')}</small></header>
    <section class="r3668-action"><strong>${icon}</strong><b>${r3668Text(...label)}</b><nav><button id="r3668NextCheck" title="${r3668Text('Đến lần kiểm tra tiếp theo','Next lookup')}">? ↪</button><button id="r3668NextAdd" title="${r3668Text('Đến lần thêm bạn tiếp theo','Next append')}">+ ↪</button><button id="r3668NextSkip" title="${r3668Text('Đến lần bỏ qua tiếp theo','Next skip')}">× ↪</button></nav></section>
    <section class="r3668-card"><header><code>order · 🏁</code><span>${r3668Text('hạng 1 → n','rank 1 → n')}</span></header><div class="r3668-strip"><div class="r3668-line">${view.order.map((id,index)=>r3668Card(id,index,view)).join('')}</div></div><div class="r3668-legend"><span>★ ${r3668Text('bạn','friend')}</span><span>↑ ${r3668Text('đang xét','current')}</span><span>✓ append</span><span>× ${r3668Text('bỏ qua','skip')}</span></div></section>
    <section class="r3668-card r3668-set"><header><code>friend_set</code><span>${friendSet===null?'—':friendSet.length}</span></header><div class="r3668-friends">${(friendSet??[]).map(id=>`<span class="${view.result?.includes(id)?'added':''} ${view.active!==null&&view.order[view.active]===id?'active':''}" data-friend="${id}" style="--r3668-tone:${r3668Tone(id)}"><b>★ ${id}</b><small>${view.result?.includes(id)?'✓':'·'}</small></span>`).join('')||'—'}</div></section>
    <section class="r3668-card r3668-filter"><header><code>${r3668Text('Cổng lọc','Filter gate')}</code><span>${view.checked.length}/${view.order.length} ${r3668Text('đã kiểm tra','checked')}</span></header>${r3668Gate(view)}<div class="r3668-progress" style="--r3668-progress:${view.checked.length/view.order.length*100}%"></div></section>
    <section class="r3668-card r3668-result ${view.move?'append':''}"><header><code>result · ★</code><span>${view.move?`order[${view.move.from}] → result[${view.move.to}]`:view.done?'✓':r3668Text('giữ thứ tự về đích','preserve finishing order')}</span></header><div class="r3668-strip"><div class="r3668-line">${result.map((id,index)=>r3668Card(id,index,view,true)).join('')}</div></div><footer>${r3668Text('Áo = ID · 🏁 = hạng trong cuộc đua','Jersey = ID · 🏁 = overall finishing rank')}</footer></section>
    ${view.done?`<div class="r3668-answer"><small>return</small><code data-result="true">[${view.answer.join(', ')}]</code><strong>✓</strong></div>`:''}
  </div>`;
  function jump(kind) {
    if (typeof steps==='undefined'||typeof stepIndex==='undefined') return;
    stopPlay();
    const event=kind==='check'?'lookup':kind==='add'?'append':'skip';
    const next=steps.findIndex((item,index)=>index>stepIndex&&item.finishing3668View&&(item.finishing3668View.event===event||item.final));
    stepIndex=next<0?steps.length-1:next;renderStep();
  }
  for (const [id,kind] of [['r3668NextCheck','check'],['r3668NextAdd','add'],['r3668NextSkip','skip']]) {
    $('treeView').querySelector('#'+id)?.addEventListener('click',()=>jump(kind));
  }
}
