// Shared geometry is kept pure so distances, coverage and large coordinates can be verified.
function heaters475Geometry(houses, heaters) {
  const positions = [...new Set([...houses,...heaters])].sort((a,b) => a-b);
  const spacing = Math.max(57,...positions.map(p => String(p).length*6.5+18));
  const width = Math.max(600,positions.length * spacing + 100), start = 45, end = width-45;
  const low = positions[0], high = positions.at(-1), span = high-low;
  const proportional = positions.length < 2 || positions.slice(1).every((p,i) => (p-positions[i]) / span * (end-start) >= spacing);
  function x(value) {
    if (positions.length === 1) return Math.max(start,Math.min(end,width/2 + Math.sign(value-low)*90));
    if (proportional) return Math.max(20,Math.min(width-20,start + (value-low)/span*(end-start)));
    const gap = (end-start)/(positions.length-1);
    if (value <= low) return Math.max(20,start+(value-low)/(positions[1]-low)*gap);
    if (value >= high) return Math.min(width-20,end+(value-high)/(high-positions.at(-2))*gap);
    let i = 0; while (positions[i+1] < value) i++;
    return start + (i+(value-positions[i])/(positions[i+1]-positions[i]))*gap;
  }
  return {positions,width,proportional,x};
}
function renderHeaters475Pictures(step, previewRadius = null) {
  const v = step.heaters475View, t = (vi,en) => lang === 'vi' ? vi : en, esc = value => escapeHtml(String(value));
  const bisect = v.approach === 2;
  const final = Boolean(step.final), summary = v.mode === 'summary', radius = previewRadius === null ? v.radius : previewRadius;
  const fmt = value => value === null || value === undefined ? '—' : value === 1000000000 ? '∞' : value;
  const geo = heaters475Geometry(v.houses,v.heaters), {width,x} = geo;
  const covered = house => radius !== null && v.heaters.some(heater => Math.abs(heater-house) <= radius);
  const uniqueHeaters = [...new Set(v.heaters)], uniqueHouses = [...new Set(v.houses)].sort((a,b) => a-b);
  const bands = radius === null ? '' : uniqueHeaters.map(heater => `<rect class="h475-warmth" x="${x(heater-radius)}" y="91" width="${Math.max(2,x(heater+radius)-x(heater-radius))}" height="70" rx="8"><title>[${heater-radius}, ${heater+radius}]</title></rect>`).join('');
  const heaterIcons = uniqueHeaters.map(heater => {
    const indices = v.heaters.flatMap((value,i) => value === heater ? [i] : []), isMid = indices.includes(v.mid), chosen = indices.includes(v.chosen);
    return `<g class="h475-heater${isMid ? ' mid' : ''}${chosen ? ' chosen' : ''}" transform="translate(${x(heater)},0)"><title>${t('Máy sưởi', 'Heater')} ${indices.map(i => '#'+i).join(', ')} · ${heater}</title><text class="h475-machine-id" y="29" text-anchor="middle">${isMid ? 'mid · ' : ''}#${indices.join(',#')}</text><rect x="-15" y="42" width="30" height="35" rx="6"/>${[-8,0,8].map(dx => `<path d="M${dx},49 v21"/>`).join('')}<path class="h475-heat" d="M-6,86 q-3,5 0,9 M6,86 q3,5 0,9"/>${chosen ? '<text class="h475-chosen" y="15" text-anchor="middle">✓</text>' : ''}</g>`;
  }).join('');
  const houseIcons = uniqueHouses.map(house => {
    const indices = v.houses.flatMap((value,i) => value === house ? [i] : []), active = !final && indices.includes(v.houseIndex), warm = covered(house);
    return `<g class="h475-house ${radius === null ? 'pending' : warm ? 'warm' : 'cold'}${active ? ' active' : ''}" transform="translate(${x(house)},0)"><title>${t('Nhà', 'House')} ${indices.map(i => '#'+i).join(', ')} · ${house} · ${radius === null ? '?' : warm ? '✓' : '✕'}</title>${active ? '<circle class="h475-halo" cy="188" r="28"/>' : ''}<path class="h475-house-body" d="M-15,186 L0,173 L15,186 V207 H-15 Z"/><path class="h475-door" d="M-4,207 V195 H4 V207"/><text class="h475-house-id" y="230" text-anchor="middle">${indices.length > 1 ? '×'+indices.length+' · ' : ''}${radius === null ? '?' : warm ? '✓' : '✕'}${active ? ' · h' : ''}</text></g>`;
  }).join('');
  const ruler = geo.positions.map(value => `<path class="h475-tick" d="M${x(value)},130 v10"/><text class="h475-coordinate" x="${x(value)}" y="155" text-anchor="middle">${value}</text>`).join('');
  const connection = !summary && !final && v.chosen !== null && v.house !== null ? `<path class="h475-distance" d="M${x(v.heaters[v.chosen])},103 V113 H${x(v.house)} V123"/><text class="h475-distance-label" x="${(x(v.house)+x(v.heaters[v.chosen]))/2}" y="108" text-anchor="middle">d = ${Math.abs(v.house-v.heaters[v.chosen])}</text>` : '';
  const houseText = v.house === null ? '—' : `${v.house} (#${v.houseIndex})`;
  const neighborsKnown = ['position','reset','has-left','left-distance','has-right','right-distance','radius','loop-end'].includes(v.event);
  function neighbor(side) {
    const index = neighborsKnown ? side === 'left' ? v.left-1 : v.left : null;
    const exists = index !== null && index >= 0 && index < v.heaters.length;
    const distance = v.distances[side], chosen = index !== null && index === v.chosen;
    return `<div class="h475-neighbor${chosen ? ' chosen' : ''}"><small>${bisect ? side === 'left' ? 'pos−1 · ' : 'pos · ' : ''}${side === 'left' ? t('Máy bên trái','Left heater') : t('Máy bên phải','Right heater')}</small><div><b>♨ ${exists ? v.heaters[index] : neighborsKnown ? '∅' : '?'}</b><span>→</span><b>⌂ ${v.house ?? '?'}</b></div><code>${distance !== null ? `|${v.heaters[index]} − ${v.house}| = ${distance}` : neighborsKnown && !exists ? t('Không có máy','No heater') : t('Chưa tính','Not computed')}</code></div>`;
  }
  function searchPicture() {
    if (summary || final || v.left === null) return '';
    const caption = bisect ? t('bisect_left → pos · máy đầu tiên ≥ nhà', 'bisect_left → pos · first heater ≥ house') : t('Máy đã sắp xếp · khoảng tìm kiếm [left, right)', 'Sorted heaters · search range [left, right)');
    const cells = v.heaters.map((heater,i) => {
      const state = bisect ? i === v.pos ? 'insert' : 'outside' : `${i >= v.left && i < v.right ? 'in-range' : 'outside'}${i === v.mid ? ' mid' : ''}`;
      const label = bisect ? i === v.pos ? 'pos' : '·' : [i === v.left ? 'left' : '',i === v.right ? 'right' : '',i === v.mid ? 'mid' : ''].filter(Boolean).join(' · ') || '·';
      return `<span class="${state}"><small>#${i}</small><b>${heater}</b><em>${label}</em></span>`;
    }).join('');
    const endLabel = bisect ? v.pos === v.heaters.length ? 'pos' : '·' : [v.left === v.heaters.length ? 'left' : '',v.right === v.heaters.length ? 'right' : ''].filter(Boolean).join(' · ') || '·';
    return `<div class="h475-search"><small>${caption}</small><div>${cells}<span class="h475-end${v.left === v.heaters.length ? ' insert' : ''}"><small>#${v.heaters.length}</small><b>END</b><em>${endLabel}</em></span></div></div>`;
  }
  const search = searchPicture();
  const update = v.update ? `<div class="h475-update"><code>${v.update.name} = ${v.update.operator}(${fmt(v.update.before)}, ${fmt(v.update.candidate)}) = <b>${v.update.after}</b></code></div>` : '';
  const history = v.history.length ? `<div class="h475-history"><small>${t('Nhà đã xét → khoảng cách tới máy gần nhất','Processed house → nearest heater distance')}</small><div>${v.history.map(row => `<span class="${v.bottleneck?.index === row.index ? 'bottleneck' : ''}"><small>⌂ ${row.house}</small><b>${row.nearest}</b><small>♨ ${row.heater}</small></span>`).join('')}<i>→ max = ${v.radius}</i></div></div>` : '';
  const proof = final ? `<div class="h475-proof"><strong>r = ${v.radius}</strong><span>⌂ ${v.bottleneck.house} → ♨ ${v.bottleneck.heaterPosition} · d = ${v.bottleneck.nearest}</span><small>${t('Nhà này bắt buộc r ≥','This house requires r ≥')} ${v.radius}</small></div>` : '';
  const uncovered = !summary && radius !== null ? v.houses.filter(house => !covered(house)).length : null;
  $('treeView').innerHTML = `<section class="h475-viz" aria-label="475 · Heaters">
    <header><strong>475 · ${bisect ? 'bisect_left' : t('Sưởi ấm tất cả nhà','Warm every house')}</strong><button type="button" data-h475-next ${final ? 'disabled' : ''}>${t('Nhà tiếp','Next house')} ⏭</button><button type="button" data-h475-result>${t('Kết quả','Result')}</button></header>
    ${summary ? `<div class="h475-summary">${v.totalHouses} ${t('nhà','houses')} · ${v.totalHeaters} ${t('máy · đã tính đủ. Hình chỉ xem trước 12 nhà và 12 máy; có thể có máy ngoài hình phủ nhà. Debug từng dòng với ≤12 mỗi loại.','heaters · fully computed. Picture previews 12 of each; off-screen heaters may cover houses. Line debug for ≤12 of each.')}</div>` : `<div class="h475-line"><b>L${v.line}</b><code>${esc(v.source)}</code></div>`}
    <div class="h475-metrics"><span><small>⌂ ${t('Nhà đang xét','Current house')}</small><b>${houseText}</b></span><span><small>min · ${t('máy gần nhất','nearest heater')}</small><b>${final ? '—' : fmt(v.nearest)}</b></span><span><small>${previewRadius === null ? 'max · radius' : t('Bán kính thử','Preview radius')}</small><b>r = ${radius ?? '—'}</b></span></div>
    <div class="h475-road"><svg viewBox="0 0 ${width} 243" style="width:${width}px;height:243px" role="img" aria-label="${t('Nhà, máy sưởi và vùng phủ với bán kính','Houses, heaters and coverage at radius')} ${radius ?? '?'}">${bands}<path class="h475-axis" d="M20,134 H${width-20}"/>${ruler}${connection}${heaterIcons}${houseIcons}</svg></div>
    <div class="h475-legend"><span>♨ ${t('máy sưởi','heater')}</span><span>⌂ ${t('nhà','house')}</span><span>▰ ${t('vùng phủ','coverage')}</span>${!geo.proportional ? `<small>${t('Mốc được giãn · không theo tỉ lệ; tính khoảng cách bằng số','Marks spaced for clarity · not to scale; distances use numbers')}</small>` : ''}</div>
    ${!final ? `${search}${v.house !== null ? `<div class="h475-neighbors">${neighbor('left')}${neighbor('right')}</div>` : ''}${update}${v.nearest === 1000000000 ? `<small class="h475-bound">∞ = 10⁹ · ${t('chưa tính khoảng cách','distance not computed yet')}</small>` : ''}` : proof}
    ${uncovered === null ? '' : `<div class="h475-coverage${uncovered ? ' cold' : ''}">r = ${radius} · ${uncovered ? `${uncovered} ${t('nhà chưa được phủ','houses uncovered')} ✕` : t('Tất cả nhà được phủ ✓','All houses covered ✓')}</div>`}
    ${final && !summary ? `<div class="h475-try"><small>${t('Thử bán kính','Try radius')}</small>${[-1,0,1].map(delta => `<button type="button" data-h475-radius="${v.radius+delta}" ${v.radius+delta < 0 ? 'disabled' : ''}>r = ${v.radius+delta}${delta === 0 ? ' ✓' : ''}</button>`).join('')}</div>` : ''}
    ${history}<div class="h475-examples">${[t('Một máy','One heater'),t('Hai máy','Two heaters'),t('Nhà xa','Distant house'),t('Trùng vị trí','Same positions')].map((label,i) => `<button type="button" data-h475-example="${i}">${label}</button>`).join('')}</div>
  </section>`;
  const host = $('treeView');
  host.querySelector('[data-h475-result]').addEventListener('click',() => {stopPlay();stepIndex = steps.length-1;renderStep();});
  host.querySelector('[data-h475-next]').addEventListener('click',() => {const index = steps.findIndex((s,i) => i > stepIndex && s.heaters475View?.event === 'house');stopPlay();stepIndex = index < 0 ? steps.length-1 : index;renderStep();});
  host.querySelectorAll('[data-h475-radius]').forEach(button => button.addEventListener('click',() => renderHeaters475Pictures(step,Number(button.dataset.h475Radius))));
  host.querySelectorAll('[data-h475-example]').forEach(button => button.addEventListener('click',() => {const [houses,heaters] = [['1,2,3','2'],['1,2,3,4','1,4'],['1,2,3,5,15','2,9'],['4,4,8','8,4']][Number(button.dataset.h475Example)];$('arrInput').value = houses;$('param-heaters').value = heaters;runViz();}));
  const road = host.querySelector('.h475-road');
  if (road && v.house !== null) road.scrollLeft = Math.max(0,x(v.house)-road.clientWidth/2);
}
