function renderSeatManager1845Pictures(step) {
  const v = step.seatManager1845View, host = $('treeView'), t = (vi,en) => lang === 'vi' ? vi : en, esc = escapeHtml;
  const c = v.current, free = new Set(v.free), minimum = v.heap[0] ?? null;
  const result = value => value === null ? 'None' : String(value);
  const chairs = Array.from({length:v.n}, (_,i) => {
    const seat = i+1, available = free.has(seat), changed = c?.seat === seat;
    return `<div class="sm1845-seat ${available ? 'free' : 'reserved'} ${seat === minimum ? 'minimum' : ''} ${changed ? 'changed' : ''}" data-seat-number="${seat}" data-seat-state="${available ? 'free' : 'reserved'}"><small>${seat === minimum ? '★ MIN' : changed ? c.name === 'reserve' ? '✓' : '↩' : ' '}</small><svg viewBox="0 0 48 52" role="img" aria-label="${t('Ghế','Seat')} ${seat} · ${available ? t('trống','free') : t('đã đặt','reserved')}"><rect class="sm1845-back" x="11" y="5" width="26" height="28" rx="6"/><path d="M7 22V39H41V22M11 40V48M37 40V48M12 32H36"/><text x="24" y="26" text-anchor="middle">${seat}</text></svg></div>`;
  }).join('');
  const operations = v.operations.map((op,i) => `<span class="sm1845-op ${i === c?.index ? 'active' : ''}"><small>${i+1}</small><code>${esc(op.label)}</code>${i < v.outputs.length ? `<b>${result(v.outputs[i])}</b>` : ''}</span>`).join('');
  const cards = c ? `<div class="sm1845-comparison"><div><small>${t('MIN trước','Previous MIN')}</small><b data-min-before="${v.beforeHeap[0] ?? 'empty'}">${v.beforeHeap[0] ?? '∅'}</b></div><div class="result"><small>return</small><b data-seat-return="${c.result}">${result(c.result)}</b></div><div class="after"><small>${t('MIN mới','New MIN')}</small><b data-min-after="${minimum ?? 'empty'}">${minimum ?? '∅'}</b></div></div>` : '';
  const levels = v.heap.length ? Math.floor(Math.log2(v.heap.length))+1 : 1;
  const width = Math.max(280,(host.clientWidth || 600)-52,2**(levels-1)*36);
  const xy = i => { const depth = Math.floor(Math.log2(i+1)), slot = i-(2**depth-1);return {x:(slot+.5)*width/2**depth,y:32+depth*64}; };
  const edges = v.heap.slice(1).map((_,offset)=>{
    const child=offset+1,parent=Math.floor((child-1)/2),a=xy(parent),b=xy(child);
    return `<path class="sm1845-edge" data-heap-edge="${parent},${child}" d="M${a.x} ${a.y+17}L${b.x} ${b.y-17}"/>`;
  }).join('');
  const nodes = v.heap.map((seat,i)=>{
    const p=xy(i), changed=!!c&&v.beforeHeap[i]!==seat;
    return `<g class="sm1845-node ${i===0?'root':''} ${changed?'changed':''} ${c?.name==='unreserve'&&c.seat===seat?'returned':''}" data-heap-index="${i}" data-heap-value="${seat}"><circle cx="${p.x}" cy="${p.y}" r="17"/><text class="sm1845-node-value" x="${p.x}" y="${p.y+6}" text-anchor="middle">${seat}</text><text class="sm1845-node-index" x="${p.x}" y="${p.y+31}" text-anchor="middle">[${i}]</text>${i===0?`<text class="sm1845-root-label" x="${p.x}" y="${p.y-24}" text-anchor="middle">★ MIN</text>`:''}</g>`;
  }).join('');
  const tree = !v.heapReady ? `<div class="sm1845-pending">list → heapify</div>` : v.heap.length ? `<div class="sm1845-tree-scroll" tabindex="0" role="region" aria-label="${t('Cây min-heap','Min-heap tree')}"><svg class="sm1845-tree" style="width:${width}px" viewBox="0 0 ${width} ${32+(levels-1)*64+38}" role="img" aria-label="${esc(`self.available = ${JSON.stringify(v.heap)}`)}">${edges}${nodes}</svg></div>` : `<div class="sm1845-empty">∅ <small>${t('Hết ghế trống','No free seats')}</small></div>`;
  const array = (values,name) => `<div class="sm1845-array-row"><small>${name}</small><div class="sm1845-array" tabindex="0" role="region" aria-label="${name}">${values.length ? values.map((seat,i)=>`<span class="${name===t('Trước','Before')&&c?.name==='reserve'&&c.seat===seat?'removed':''} ${name==='self.available'&&c?.name==='unreserve'&&c.seat===seat?'inserted':''}" data-array-row="${name===t('Trước','Before')?'before':'now'}" data-array-index="${i}" data-array-value="${seat}"><small>[${i}]</small><b>${seat}</b></span>`).join('') : '<i>∅</i>'}</div></div>`;
  const presets = [
    {label:t('Ưu tiên số nhỏ','Smallest first'),n:5,ops:[['reserve'],['reserve'],['reserve'],['unreserve',3],['unreserve',1],['reserve'],['reserve']]},
    {label:t('Hết ghế','All reserved'),n:3,ops:[['reserve'],['reserve'],['reserve']]},
    {label:t('Một ghế','One seat'),n:1,ops:[['reserve'],['unreserve',1],['reserve']]},
  ];
  host.innerHTML = `<section class="sm1845-viz" aria-label="Seat Manager #1845"><header class="sm1845-heading"><b>▣ #1845 · Seat Manager</b><small>${t('Dòng','Line')} ${v.line}${step.final?' · ✓':''}</small></header><div class="sm1845-presets">${presets.map((preset,i)=>`<button type="button" data-seat-preset="${i}">${esc(preset.label)}</button>`).join('')}</div><div class="sm1845-ops" tabindex="0" role="region" aria-label="${t('Các lệnh','Operations')}">${operations}</div><header class="sm1845-current"><code>${esc(c?.label??`SeatManager(${v.n})`)}</code>${c?`<span>→</span><strong>${result(c.result)}</strong>`:''}</header><div class="sm1845-counts"><span class="free">○ ${v.free.length} ${t('trống','free')}</span><span class="reserved">● ${v.reserved.length} ${t('đã đặt','reserved')}</span><span class="minimum">★ ${minimum??'∅'}</span></div><div class="sm1845-seats" style="--sm-cols:${Math.min(v.n,8)};--sm-mobile-cols:${Math.min(v.n,5)}">${chairs}</div>${cards}<section class="sm1845-heap"><header><b>${v.heapReady?'Min-heap':'list'}</b><small>${t('Cha ≤ con','Parent ≤ child')}</small></header>${tree}${c?array(v.beforeHeap,t('Trước','Before')):''}${array(v.heap,'self.available')}<code class="sm1845-source">${esc(v.source.trim())}</code></section><details class="sm1845-why"><summary>${t('Vì sao?','Why?')}</summary><div>${esc(pick(v.explanation))}</div></details></section>`;
  const rail = host.querySelector?.('.sm1845-ops'), active = rail?.querySelector('.active');
  if(active)rail.scrollLeft=Math.max(0,active.offsetLeft-rail.offsetLeft-rail.clientWidth/2+active.clientWidth/2);
  const plot=host.querySelector?.('.sm1845-tree-scroll');
  if(plot)plot.scrollLeft=Math.max(0,width/2-plot.clientWidth/2);
  host.querySelectorAll?.('[data-seat-preset]').forEach(button=>{
    button.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter')event.stopPropagation();});
    button.addEventListener('click',()=>{const preset=presets[Number(button.dataset.seatPreset)];$('arrInput').value=JSON.stringify(preset.ops);document.querySelector('[data-param="n"]').value=preset.n;runViz();});
  });
  host._seatManager1845Step=step;host._seatManager1845Width=host.clientWidth;
  if(typeof ResizeObserver!=='undefined'&&!host._seatManager1845Observer){
    host._seatManager1845Observer=new ResizeObserver(()=>{if(host.querySelector('.sm1845-viz')&&host.clientWidth!==host._seatManager1845Width)renderSeatManager1845Pictures(host._seatManager1845Step);});
    host._seatManager1845Observer.observe(host);
  }
}
