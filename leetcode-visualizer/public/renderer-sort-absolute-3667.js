'use strict';

const a3667Text = (vi,en) => lang === 'vi' ? vi : en;
const a3667Value = value => value === null || value === undefined ? '—' : String(value);
const a3667Sign = value => value < 0 ? 'negative' : value > 0 ? 'positive' : 'zero';

function a3667Strip(values, view, original=false) {
  const placeholder = !values, list = values ?? view.nums.map(() => null);
  const cards = list.map((value,index) => {
    const key = original && view.block === 2 ? view.keys[index] : value === null ? null : Math.abs(value);
    const selected = original ? index === (view.block === 1 ? view.round : view.keyCursor)
      : index === view.cursor && view.cursor !== null;
    const gap = !original && view.gap === index;
    const placed = !original && view.move?.to === index;
    const ready = !original && index < view.prefix && !gap;
    return `<div class="a3667-cell ${a3667Sign(value)} ${selected?'selected':''} ${gap?'gap':''} ${ready?'ready':''} ${placed?'placed':''}" data-slot="${index}" data-value="${value??''}"><small>${index}</small><b>${a3667Value(value)}</b><span class="a3667-key">|x| = ${a3667Value(key)}</span><em>${gap?'□':placed?'↓':ready?'✓':selected?'↑':'·'}</em></div>`;
  }).join('');
  const movement = !original && view.move ? `<svg class="a3667-move" width="${list.length*64}" height="34" aria-label="${view.move.from} → ${view.move.to}" role="img"><defs><marker id="a3667-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5Z"/></marker></defs>${view.move.from==='held'?`<path d="M${view.move.to*64+31},2 V27"/>`:`<path d="M${view.move.from*64+31},27 Q${(view.move.from+view.move.to)*32+31},0 ${view.move.to*64+31},27"/>`}</svg>` : '';
  return `<div class="a3667-strip ${placeholder?'empty':''}" data-array="${original?'nums':'result'}"><div class="a3667-strip-inner">${movement}<div class="a3667-cards">${cards}</div></div></div>`;
}

function a3667Axis(view) {
  const x = {...view.outer,...view.locals}, compare = view.comparison;
  const candidate = view.block === 1 && view.held !== null && view.cursor !== null && view.cursor >= 0 && view.result ? view.result[view.cursor] : null;
  const held = view.held, max = Math.max(1,...view.nums.map(Math.abs));
  const scale = value => 225 + value/max*174;
  const ticks = [-max,0,max].map(value => `<path d="M${scale(value)},112 v9"/><text x="${scale(value)}" y="138">${value}</text>`).join('');
  const lane = (value,y,label) => value === null ? '' : `<g class="${a3667Sign(value)}"><path class="a3667-distance" d="M225,${y} H${scale(value)}"/><path class="a3667-stem" d="M${scale(value)},${y} V112"/><circle cx="${scale(value)}" cy="${y}" r="6"/><text class="a3667-axis-label" x="${Math.max(65,Math.min(385,(225+scale(value))/2))}" y="${y-13}">${label}: ${value} → |${value}|=${Math.abs(value)}</text></g>`;
  const fold = held !== null && held < 0 ? `<path class="a3667-fold" d="M${scale(held)},47 Q225,4 ${scale(-held)},47"/><circle class="a3667-mirror" cx="${scale(-held)}" cy="47" r="6"/>` : '';
  return `<svg class="a3667-axis" viewBox="0 0 450 150" role="img" aria-label="${a3667Text('Khoảng cách tới 0','Distance from zero')}"><path class="a3667-zero" d="M225,13 V123"/><path class="a3667-number-line" d="M35,116 H415"/>${ticks}${fold}${lane(held,48,'value')}${lane(candidate,91,'result[j]')}</svg>${compare ? `<div class="a3667-comparison ${compare.shift?'shift':'keep'}">${compare.j<0?'<code>j &lt; 0</code><strong>□ ← value</strong>':`<code>|${compare.left}| &gt; ${compare.key}</code><strong>${Math.abs(compare.left)} ${compare.shift?'&gt;':'≤'} ${compare.key} ${compare.shift?'→':'✓'}</strong>`}</div>` : `<div class="a3667-comparison"><code>|x| = ${a3667Text('khoảng cách tới 0','distance from zero')}</code></div>`}`;
}

function a3667Bars(view) {
  const values = view.result, max = Math.max(1,...view.nums.map(Math.abs));
  return `<div class="a3667-bars-scroll"><div class="a3667-bars">${(values??view.nums.map(()=>null)).map((value,index)=>`<div class="${a3667Sign(value)} ${index<view.prefix&&index!==view.gap?'ready':''} ${index===view.gap?'gap':''}" data-bar="${index}" data-height="${value===null?'':Math.abs(value)}"><span>${value===null?'·':Math.abs(value)}</span><i style="height:${value===null?0:Math.abs(value)/max*76}px"></i><b>${a3667Value(value)}</b></div>`).join('')}</div></div>`;
}

function renderAbsolute3667Pictures(step) {
  const view = step.absolute3667View;
  if (!view) return;
  const count = view.nums.length, block = view.block;
  const labels = {copy:['Sao chép','Copy'],select:['Chọn ô','Select'],pick:['Nhấc value','Pick value'],key:['Tính |value|','Compute |value|'],compare:['So sánh','Compare'],shift:['Dịch phải','Shift right'],place:['Chèn value','Insert value'],sort:['Sort theo key','Sort by key'],'save-key':['Lưu key','Save key'],'return-key':['Trả key','Return key'],return:['Kết quả','Result'],step:['Thực thi','Execute']};
  const label = labels[view.event] ?? labels.step;
  const progress = block===1 ? `${view.prefix}/${count}` : `${view.keys.length}/${count}`;
  const held = `<div class="a3667-held ${a3667Sign(view.held)}"><small>value</small><strong>${a3667Value(view.held)}</strong><span>key = ${a3667Value(view.heldKey)}</span></div>`;
  const source = escapeHtml(view.source.text);
  $('treeView').innerHTML = `<div class="a3667-viz" data-event="${view.event}" data-method="${block}">
    <header class="a3667-heading"><code>#3667 · |x| ↑</code><b>L${view.source.line} ✓</b><small>${view.scope} · ${a3667Text('sau dòng','after line')}</small></header>
    <section class="a3667-action"><strong>${view.done?'✓':view.event==='shift'?'→':view.event==='place'?'↓':view.event==='compare'?'?':'|x|'}</strong><b>${a3667Text(...label)}</b><nav><button id="a3667NextCompare">${block===1?'|a| ? |b|':'|x|'} ↪</button><button id="a3667NextShift">${block===1?'→':'sort'} ↪</button><button id="a3667NextPlace">↓ ↪</button></nav></section>
    <section class="a3667-card"><header><code>nums</code><small>${count}</small></header>${a3667Strip(view.nums,view,true)}</section>
    <div class="a3667-workspace"><section class="a3667-card a3667-distance-card"><header><code>${a3667Text('Trục số','Number line')}</code><span>← − · 0 · + →</span></header>${a3667Axis(view)}</section><section class="a3667-card a3667-held-card">${held}<div class="a3667-progress"><small>${block===1?a3667Text('đã chèn','inserted'):a3667Text('keys đã lưu','saved keys')}</small><strong>${progress}</strong><span style="--a3667-progress:${(block===1?view.prefix:view.keys.length)/count*100}%"></span></div></section></div>
    <section class="a3667-card"><header><code>result</code><span>${view.move?`${view.move.from} → ${view.move.to}`:view.done?'✓':'·'}</span></header>${a3667Strip(view.result,view)}<div class="a3667-legend"><span>✓ ${a3667Text('đoạn đã chèn','inserted prefix')}</span><span>□ ${a3667Text('vị trí chèn','insertion slot')}</span><span>↓ ${a3667Text('vừa ghi','just written')}</span></div></section>
    <section class="a3667-card"><header><code>|result[i]|</code><small>${view.done?'≤ ≤ ≤':a3667Text('chiều cao = khoảng cách tới 0','height = distance from zero')}</small></header>${a3667Bars(view)}</section>
    <footer class="a3667-footer"><code title="${source}">${source}</code>${block===1?`<span>? ${view.checks} · → ${view.shifts}</span>`:`<span>${a3667Text('sorted thực hiện sắp xếp ở một dòng','sorted reorders in one statement')}</span>`}</footer>
    ${view.frames.length>1?`<div class="a3667-callstack">${view.frames.map(frame=>`<code>${escapeHtml(frame.name)}()</code>`).join('<b>→</b>')}</div>`:''}
    ${view.done?`<div class="a3667-answer"><span>return</span><code data-result="true">[${view.answer.join(', ')}]</code><strong>✓</strong></div>`:''}
  </div>`;
  function jump(kind) {
    if (typeof steps === 'undefined' || typeof stepIndex === 'undefined') return;
    stopPlay();
    const events = kind==='compare' ? (block===1?['compare']:['key']) : kind==='shift' ? ['shift','sort'] : ['place','sort'];
    const next = steps.findIndex((item,index)=>index>stepIndex && item.absolute3667View && (events.includes(item.absolute3667View.event)||item.final));
    stepIndex = next < 0 ? steps.length-1 : next;
    renderStep();
  }
  for (const [id,kind] of [['a3667NextCompare','compare'],['a3667NextShift','shift'],['a3667NextPlace','place']]) {
    $('treeView').querySelector('#'+id)?.addEventListener('click',()=>jump(kind));
  }
}
