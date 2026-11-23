function renderPossibleBipartition886View(step) { renderGraphColoringLesson(step.partition886View); }
function renderFlowerGardens1042View(step) { renderGraphColoringLesson(step.garden1042View); }

function renderGraphColoringLesson(v) {
  const host = $('treeView'), vi = lang === 'vi', gardens = v.id === 1042;
  const t = (vn, en) => vi ? vn : en;
  const people = Array.from({ length: v.n }, (_, i) => i + 1);
  const assigned = person => gardens ? v.colors[person - 1] > 0 : v.colors[person - 1] >= 0;
  const tone = person => assigned(person) ? `c${gardens ? v.colors[person - 1] : v.colors[person - 1] + 1}` : 'none';
  const group = person => v.colors[person - 1] === -1 ? t('chưa xếp', 'unassigned') : v.colors[person - 1] === 0 ? t('nhóm A', 'group A') : t('nhóm B', 'group B');
  const conflict = v.conflict, pair = conflict || v.active;
  const edgeIs = (u, w, edge) => edge && ((u === edge[0] && w === edge[1]) || (u === edge[1] && w === edge[0]));
  const cycleEdges = v.cycle.slice(1).map((node, i) => [v.cycle[i], node]);
  const positions = {}, teams = [people.filter(node => v.colors[node - 1] === 0), people.filter(node => v.colors[node - 1] === 1)];
  let width = gardens ? v.n > 8 ? 480 : 360 : 440, height = gardens ? width : 290, backgrounds = '';
  if (!gardens && people.some(assigned)) {
    height = Math.max(240, 76 + Math.max(...teams.map(team => team.length)) * 58);
    backgrounds = teams.map((team, index) => {
      const x = index ? 276 : 16;
      team.forEach((node, row) => { positions[node] = { x: x + 74, y: 80 + row * 58 }; });
      return `<g class="gc-lesson-team c${index + 1}"><rect x="${x}" y="43" width="148" height="${height - 54}" rx="12"/><text x="${x + 74}" y="26" text-anchor="middle">${t('NHÓM', 'GROUP')} ${index ? 'B' : 'A'}</text></g>`;
    }).join('');
  } else {
    const radius = v.n === 1 ? 0 : gardens ? width / 2 - 65 : 112;
    people.forEach((node, i) => {
      const angle = -Math.PI / 2 + i * Math.PI * 2 / v.n;
      positions[node] = { x: width / 2 + radius * Math.cos(angle), y: height / 2 + radius * Math.sin(angle) };
    });
  }
  const focused = node => gardens ? node === v.garden : pair ? pair.includes(node) : node === v.node && !v.final;
  const neighbor = node => gardens && v.garden !== null && v.graph[v.garden].includes(node);
  const svgEdges = v.edges.filter(([u, w]) => positions[u] && positions[w]).map(([u, w]) => {
    const p = positions[u], q = positions[w], bad = cycleEdges.some(e => edgeIs(u, w, e));
    const active = gardens ? u === v.garden || w === v.garden : edgeIs(u, w, pair);
    const attrs = `class="gc-lesson-edge${bad ? ' bad' : active ? ' active' : ''}${edgeIs(u, w, conflict) ? ' conflict' : ''}" data-edge="${u}-${w}"`;
    const title = `<title>${u} — ${w}${bad ? t(' · chu trình lẻ', ' · odd cycle') : ''}</title>`;
    return !gardens && backgrounds && p.x === q.x
      ? `<path ${attrs} d="M ${p.x} ${p.y} C ${p.x + 65} ${p.y}, ${q.x + 65} ${q.y}, ${q.x} ${q.y}">${title}</path>`
      : `<line ${attrs} x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}">${title}</line>`;
  }).join('');
  const svgNodes = Object.entries(positions).map(([key, p]) => {
    const node = Number(key);
    return `<g class="gc-lesson-node ${tone(node)}${focused(node) ? ' active' : ''}${neighbor(node) ? ' neighbor' : ''}${conflict?.includes(node) ? ' bad' : ''}" data-node="${node}" data-color="${v.colors[node - 1]}" transform="translate(${p.x},${p.y})"><title>${t(gardens ? 'Vườn' : 'Người', gardens ? 'Garden' : 'Person')} ${node}: ${gardens ? assigned(node) ? t(`hoa loại ${v.colors[node - 1]}`, `flower type ${v.colors[node - 1]}`) : t('chưa trồng', 'unplanted') : group(node)}</title><circle class="gc-lesson-ring" r="29"/><circle class="gc-lesson-disc" r="23"/><text class="gc-lesson-node-id" text-anchor="middle" y="${gardens ? '0' : '6'}">${node}</text>${gardens ? `<text class="gc-lesson-node-sub" text-anchor="middle" y="15">${assigned(node) ? t(`hoa ${v.colors[node - 1]}`, `type ${v.colors[node - 1]}`) : '?'}</text>` : ''}</g>`;
  }).join('');
  const diagram = `<div class="gc-lesson-graph"><svg class="gc-lesson-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${gardens ? t('Đồ thị vườn: số lớn là vườn, số nhỏ là loại hoa', 'Garden graph: large numbers identify gardens, small numbers identify flower types') : t('Hai nhóm A và B; mỗi cạnh là một cặp không thích nhau', 'Groups A and B; each edge is a dislike pair')}"><title>${gardens ? t('Vườn kề nhau phải trồng khác loại hoa', 'Adjacent gardens must have different flower types') : t('Mọi cạnh phải bắc qua giữa hai nhóm', 'Every edge must cross between the groups')}</title>${backgrounds}${svgEdges}${svgNodes}</svg></div>`;
  const chip = node => `<b class="gc-lesson-chip ${tone(node)}">${node}</b>`;
  const pending = people.filter(node => !assigned(node));
  const pendingHtml = !gardens && pending.length ? `<div class="gc-lesson-pending"><span>${t('Chưa xếp', 'Unassigned')}</span>${pending.map(chip).join('')}</div>` : '';
  let action, details;
  if (gardens) {
    action = v.final ? t('Xong: mỗi đường nối đều có hai loại hoa khác nhau', 'Done: every path joins different flower types')
      : v.garden === null ? t('4 loại hoa − tối đa 3 màu bị chặn → luôn còn màu', '4 flower types − at most 3 blocked colors → a choice always remains')
      : v.event === 'plant' ? t(`Vườn ${v.garden} chọn hoa loại ${v.candidate}`, `Garden ${v.garden} chooses flower type ${v.candidate}`)
      : t(`Vườn ${v.garden}: nhìn hàng xóm → loại màu trùng → chọn màu còn lại`, `Garden ${v.garden}: inspect neighbors → block their colors → choose a free color`);
    const neighbors = v.garden === null ? [] : v.graph[v.garden];
    const available = [1,2,3,4].filter(c => !v.used.includes(c));
    details = v.final ? `<div class="gc-lesson-answer"><small>${t('Kết quả theo vườn 1 → n', 'Answer for gardens 1 → n')}</small><strong>[${v.answer.join(', ')}]</strong><div>${people.map(node => `<span>${t('Vườn', 'Garden')} ${node} → <b class="c${v.colors[node - 1]}">${v.colors[node - 1]}</b></span>`).join('')}</div></div>` : `<section class="gc-lesson-choice"><header><b>${v.garden === null ? t('Bốn loại hoa', 'Four flower types') : t(`Hàng xóm của vườn ${v.garden}`, `Neighbors of garden ${v.garden}`)}</b></header><div class="gc-lesson-neighbors">${neighbors.length ? neighbors.map(node => `<span>${t('Vườn', 'Garden')} ${node} ${chip(node)}<small>${assigned(node) ? t(`hoa ${v.colors[node - 1]}`, `type ${v.colors[node - 1]}`) : t('chưa trồng', 'unplanted')}</small></span>`).join('') : `<em>${t('Chưa có màu hàng xóm nào cần tránh', 'No neighbor colors to avoid yet')}</em>`}</div><div class="gc-lesson-palette">${[1,2,3,4].map(c => `<div class="c${c}${v.used.includes(c) ? ' blocked' : ''}${v.garden !== null && v.colors[v.garden - 1] === c ? ' chosen' : ''}" data-flower="${c}"><b>${c}</b><small>${v.used.includes(c) ? t('✕ bị chặn', '✕ blocked') : v.garden !== null && v.colors[v.garden - 1] === c ? t('✓ đã chọn', '✓ chosen') : t('còn dùng', 'available')}</small></div>`).join('')}</div><p>${v.garden === null ? t('Mỗi vườn có tối đa 3 hàng xóm.', 'Each garden has at most 3 neighbors.') : t(`Màu bị chặn: {${v.used.join(', ') || '∅'}} → còn ${available.join(', ')}.`, `Blocked colors: {${v.used.join(', ') || '∅'}} → available: ${available.join(', ')}.`)}</p></section>`;
  } else {
    action = conflict ? t(`Người ${conflict[0]} và ${conflict[1]} không thích nhau nhưng cùng ${group(conflict[0])} → False`, `People ${conflict[0]} and ${conflict[1]} dislike each other but share ${group(conflict[0])} → False`)
      : v.final ? t('Chia được: không có cặp không thích nhau nào chung nhóm', 'Possible: no dislike pair shares a group')
      : pair ? t(`Người ${pair[0]} ở ${group(pair[0])} → người ${pair[1]} phải ở nhóm ngược lại`, `Person ${pair[0]} is in ${group(pair[0])} → person ${pair[1]} must be opposite`)
      : t('Không thích nhau → đặt khác nhóm', 'Dislike each other → put them in opposite groups');
    details = conflict ? `<div class="gc-lesson-cycle"><b>${t('Chu trình lẻ: không thể tô xen kẽ hai nhóm', 'Odd cycle: two alternating groups cannot close the loop')}</b><strong>${v.cycle.join(' → ')}</strong><span>${v.cycle.length - 1} ${t('cạnh · đi hết vòng sẽ buộc hai người cùng nhóm', 'edges · closing the loop forces a same-group pair')}</span></div>`
      : `<div class="gc-lesson-rule"><span>${t('Nhóm A', 'Group A')} <b>${teams[0].length}</b></span><strong>↔</strong><span>${t('Nhóm B', 'Group B')} <b>${teams[1].length}</b></span><small>${t('Mỗi cạnh phải đi từ nhóm này sang nhóm kia.', 'Every edge must cross from one group to the other.')}</small></div>`;
  }
  const examples = gardens ? {
    simple: { n:3, edges:[[1,2],[2,3],[1,3]], label:t('Tam giác · 3 loại', 'Triangle · 3 types') },
    full: { n:4, edges:[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]], label:t('Cần cả 4 loại', 'All 4 types needed') },
    split: { n:4, edges:[[1,2],[3,4]], label:t('Vườn rời nhau', 'Disconnected gardens') },
  } : {
    simple: { n:4, edges:[[1,2],[1,3],[2,4]], label:t('Chia được', 'Possible') },
    full: { n:3, edges:[[1,2],[1,3],[2,3]], label:t('Tam giác → False', 'Triangle → False') },
    split: { n:6, edges:[[1,2],[3,4]], label:t('Có người đứng riêng', 'Includes isolated people') },
  };
  host.innerHTML = `<section class="gc-lesson-viz" aria-label="${v.id} · ${gardens ? 'Flower Planting' : 'Possible Bipartition'}"><header class="gc-lesson-title"><div><small>${v.id} · ${gardens ? 'Greedy' : 'BFS'}</small><h3>${gardens ? t('Vườn kề nhau → khác loại hoa', 'Adjacent gardens → different flowers') : t('Không thích nhau → khác nhóm', 'Dislike each other → opposite groups')}</h3></div><b class="gc-lesson-status${conflict ? ' bad' : v.final ? ' good' : ''}">${conflict ? 'False' : v.final ? gardens ? t('Hợp lệ ✓', 'Valid ✓') : 'True' : t('Đang xét', 'Checking')}</b></header><div class="gc-lesson-examples">${Object.entries(examples).map(([key, e]) => `<button data-gc-example="${key}">${e.label}</button>`).join('')}${!v.final ? `${gardens ? `<button data-gc-next>${t('Trồng vườn tiếp →', 'Plant next garden →')}</button>` : ''}<button data-gc-result>${t('Xem kết quả', 'See result')}</button>` : ''}</div><div class="gc-lesson-action${conflict ? ' bad' : ''}"><strong>${escapeHtml(action)}</strong></div>${gardens ? `<div class="gc-lesson-layout">${diagram}${details}</div>` : `${diagram}${pendingHtml}${details}`}${!gardens && !v.final ? `<div class="gc-lesson-queue"><b>queue</b><small>${t('Đầu → cuối', 'Front → back')}</small>${v.queue.map(chip).join('') || `<em>${t('rỗng', 'empty')}</em>`}</div>` : ''}${gardens ? `<div class="gc-lesson-guarantee"><b>4 − 3 ≥ 1</b><span>${t('4 loại hoa · ≤ 3 hàng xóm · luôn còn ≥ 1 loại hợp lệ', '4 flower types · ≤ 3 neighbors · always ≥ 1 valid choice')}</span></div>` : ''}</section>`;
  host.querySelectorAll?.('[data-gc-example]').forEach(button => button.addEventListener('click', () => {
    const example = examples[button.dataset.gcExample];
    $('arrInput').value = JSON.stringify(example.edges); $('param-n').value = example.n; $('runBtn').click();
  }));
  host.querySelector?.('[data-gc-result]')?.addEventListener('click', () => $('lastBtn').click());
  host.querySelector?.('[data-gc-next]')?.addEventListener('click', () => {
    const next = steps.findIndex((s, i) => i > stepIndex && (s.garden1042View?.event === 'plant' || s.final));
    if (next >= 0) { stopPlay(); stepIndex = next; renderStep(); }
  });
}
