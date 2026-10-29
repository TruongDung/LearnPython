function renderPhoneDirectory379Pictures(step) {
  const v = step.phoneDirectory379View, host = $('treeView'), t = (vi,en) => lang === 'vi' ? vi : en, esc = escapeHtml;
  const c = v.current, queue = new Set(v.available), free = v.free === null ? null : new Set(v.free);
  const result = value => value === null ? 'None' : typeof value === 'boolean' ? value ? '✓ True' : '× False' : String(value);
  const phone = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3L4 5C2 9 10 21 16 21L20 18L16 13L13 15C10 13 9 11 8 9L10 7Z"/></svg>';
  const candidate = c?.name === 'get' && c.number === null ? v.available[0] : null;
  const tiles = Array.from({length:v.maxNumbers}, (_,number) => {
    const state = !free ? 'uninitialized' : free.has(number) !== queue.has(number) ? 'moving' : free.has(number) ? 'free' : 'assigned';
    const focused = c?.number === number, next = candidate === number;
    return `<div class="pd379-phone ${state} ${focused || next ? 'focus' : ''}" data-phone-number="${number}" data-phone-state="${state}" data-phone-focus="${focused ? 'active' : next ? 'candidate' : 'none'}">${phone}<b>${number}</b><small>${state === 'free' ? '○' : state === 'assigned' ? '●' : state === 'moving' ? '↔' : '…'}</small></div>`;
  }).join('');
  const operations = v.operations.map((op,i) => `<span class="pd379-op ${i === c?.index ? 'active' : ''}"><small>${i+1}</small><code>${esc(op.label)}</code>${i < v.outputs.length ? `<b class="${v.outputs[i] === false || v.outputs[i] === -1 ? 'no' : 'yes'}">${esc(result(v.outputs[i]))}</b>` : ''}</span>`).join('');
  const node = (x,value,label,cls='') => `<g class="pd379-node ${cls}" transform="translate(${x},18)"><rect width="80" height="65" rx="13"/><text class="pd379-node-value" x="40" y="41" text-anchor="middle">${esc(value)}</text><text class="pd379-node-label" x="40" y="86" text-anchor="middle">${esc(label)}</text></g>`;
  const arrow = (x,active=false) => `<path class="pd379-arrow ${active ? 'active' : ''}" d="M${x} 51H${x+25}M${x+18} 45L${x+25} 51L${x+18} 57"/>`;
  let flow = '', condition = '';
  if (!c) {
    flow = node(5,v.available.length,'deque','free') + node(215,v.free?.length ?? '…','set',free ? 'free' : '') + '<text class="pd379-node-value" x="150" y="59" text-anchor="middle">'+(free ? '=' : '…')+'</text>';
  } else if (c.name === 'get' && v.event === 'exhausted') {
    flow = node(5,'∅','deque','empty') + arrow(91,true) + node(110,'−1','return','empty');
  } else if (c.name === 'get') {
    flow = node(5,v.before.available[0] ?? '∅',t('đầu queue trước','previous front'),'free') + arrow(89,c.number !== null) + node(110,c.number ?? '?','number',c.number !== null ? 'moving' : '') + arrow(194,v.line >= 12) + node(215,c.resultReady ? c.result : '…','return',c.resultReady ? 'assigned' : '');
    if(v.line === 9) condition = `<code>not self.available → ${v.available.length ? 'False' : 'True'}</code>`;
  } else if (c.name === 'check') {
    flow = node(5,c.number,'number') + arrow(89,true) + node(110,free.has(c.number) ? '✓' : '×','self.free',free.has(c.number) ? 'free' : 'empty') + arrow(194,true) + node(215,c.result ? 'True' : 'False','return',c.result ? 'free' : 'empty');
    condition = `<code>${c.number} ∈ self.free</code><small>${t('chỉ đọc','read only')}</small>`;
  } else if (free.has(c.number) && v.before.free.includes(c.number)) {
    flow = node(5,c.number,t('đã rảnh','already free'),'free') + '<text class="pd379-stop" x="150" y="61" text-anchor="middle">↻ ×</text>' + node(215,'=','queue','free');
    condition = `<code>${t('Không thêm trùng','No duplicate enqueue')}</code>`;
  } else {
    flow = node(5,c.number,'number','assigned') + arrow(89,free.has(c.number)) + node(110,free.has(c.number) ? '✓' : '…','self.free',free.has(c.number) ? 'free' : '') + arrow(194,v.line === 22) + node(215,v.line === 22 ? c.number : '…',t('cuối queue','queue back'),v.line === 22 ? 'free' : '');
    if(v.line === 19) condition = `<code>${c.number} in self.free → False</code>`;
  }
  const queueChips = v.available.map((number,i) => `<span class="pd379-queue-number ${i === 0 ? 'front' : ''} ${v.line === 22 && number === c.number ? 'appended' : ''}" data-queue-number="${number}"><small>[${i}]</small><b>${number}</b></span>`).join('');
  const setChips = v.free === null ? '<i>…</i>' : v.free.length ? v.free.map(number=>`<span class="pd379-set-number ${c?.number === number ? 'focus' : ''}" data-set-number="${number}">${number}</span>`).join('') : '<i>∅</i>';
  const presets = [
    {label:t('Hết số','Exhaust'),n:2,ops:[['get'],['get'],['get']]},
    {label:t('Cấp lại','Recycle'),n:3,ops:[['get'],['get'],['release',0],['get'],['get']]},
    {label:t('Release lặp','Release twice'),n:2,ops:[['get'],['release',0],['release',0],['get'],['get'],['get']]},
  ];
  host.innerHTML = `<section class="pd379-viz" aria-label="Phone Directory #379"><header class="pd379-heading"><b>☎ #379 · Phone Directory</b><small>${t('Dòng','Line')} ${v.line}${step.final ? ' · ✓' : ''}</small></header><div class="pd379-presets">${presets.map((preset,i)=>`<button type="button" data-phone-preset="${i}">${esc(preset.label)}</button>`).join('')}</div><div class="pd379-ops" tabindex="0" role="region" aria-label="${t('Các lệnh','Operations')}">${operations}</div><header class="pd379-current"><code>${esc(c?.label ?? `PhoneDirectory(${v.maxNumbers})`)}</code><strong class="${c?.result === false || c?.result === -1 ? 'no' : 'yes'}">${c?.resultReady ? esc(result(c.result)) : '…'}</strong></header><div class="pd379-grid">${tiles}</div><div class="pd379-legend"><span class="yes">○ ${t('rảnh','free')}</span><span>● ${t('đã cấp','assigned')}</span><span class="moving">↔ ${t('đang chuyển','in transit')}</span></div><section class="pd379-flow"><svg viewBox="0 0 300 118" role="img" aria-label="${esc(v.source.trim())}">${flow}</svg><div class="pd379-condition">${condition}</div><code class="pd379-source">${esc(v.source.trim())}</code></section><section class="pd379-queue"><header><b>self.available <small>· FIFO</small></b><strong>${v.available.length}</strong></header><div class="pd379-queue-labels"><span>get ← FRONT</span><span>BACK ← release</span></div><div class="pd379-queue-track" tabindex="0" role="region" aria-label="self.available">${queueChips || '<i>∅</i>'}</div></section><section class="pd379-set"><header><b>self.free</b><strong>${v.free?.length ?? '…'}</strong></header><div class="pd379-set-values">${setChips}</div></section><details class="pd379-why"><summary>${t('Vì sao?','Why?')}</summary><div>${esc(pick(v.explanation))}</div></details></section>`;
  const rail = host.querySelector?.('.pd379-ops'), active = rail?.querySelector('.active');
  if (active) rail.scrollLeft = Math.max(0, active.offsetLeft - rail.offsetLeft - rail.clientWidth / 2 + active.clientWidth / 2);
  const track = host.querySelector?.('.pd379-queue-track');
  if (track && v.line === 22) track.scrollLeft = track.scrollWidth;
  host.querySelectorAll?.('[data-phone-preset]').forEach(button=>{
    button.addEventListener('keydown',event=>{if(event.key === ' ' || event.key === 'Enter')event.stopPropagation();});
    button.addEventListener('click',()=>{
      const preset = presets[Number(button.dataset.phonePreset)];
      $('arrInput').value = JSON.stringify(preset.ops);
      document.querySelector('[data-param="maxNumbers"]').value = preset.n;
      runViz();
    });
  });
}
