function renderMagnificentGroups2493View(step) {
  const v = step.magnificent2493View;
  const vi = lang === 'vi';
  const host = $('treeView');
  const t = (vn, en) => vi ? vn : en;
  const success = v.final && v.answer !== -1;
  const bad = Boolean(v.conflict);
  const component = v.components.find(c => c.id === v.component);
  const currentTrials = v.trials.filter(r => r.component === v.component);
  const winner = v.winners.find(r => r.component === v.component);
  const groupOf = {};
  if (success) {
    let offset = 1;
    for (const c of v.components) {
      const chosen = v.winners.find(r => r.component === c.id);
      for (const [node, distance] of Object.entries(chosen.distances)) groupOf[node] = offset + distance;
      offset += chosen.groups;
    }
  } else {
    for (const [node, distance] of Object.entries(v.distances)) groupOf[node] = distance + 1;
  }
  const placed = Object.keys(groupOf).map(Number);
  const totalGroups = placed.length ? Math.max(...Object.values(groupOf)) : 0;
  const visibleNodes = success ? Array.from({ length: v.n }, (_, i) => i + 1) : component?.nodes ?? Array.from({ length: v.n }, (_, i) => i + 1);
  const pending = visibleNodes.filter(node => groupOf[node] === undefined);
  const edge = v.conflict || v.active;
  const edgeIs = (a, b, pair) => pair && ((a === pair[0] && b === pair[1]) || (a === pair[1] && b === pair[0]));
  const nodeClass = node => `${!success && node === v.start ? ' root' : ''}${edge?.includes(node) ? ' focus' : ''}${v.conflict?.includes(node) ? ' bad' : ''}`;
  const positions = {};
  let width, height, lanes = '';
  if (placed.length) {
    const columns = Array.from({ length: totalGroups }, (_, i) => placed.filter(node => groupOf[node] === i + 1));
    width = Math.max(360, totalGroups * (totalGroups <= 4 ? 112 : 86) + 24);
    height = Math.max(210, Math.max(...columns.map(nodes => nodes.length)) * 63 + 80);
    const colWidth = (width - 24) / totalGroups;
    lanes = columns.map((nodes, index) => {
      const x = 12 + index * colWidth;
      nodes.forEach((node, row) => { positions[node] = { x: x + colWidth / 2, y: 80 + row * 63 }; });
      return `<g class="mg2493-lane ${index % 2 ? 'odd' : 'even'}"><rect x="${x + 4}" y="42" width="${colWidth - 8}" height="${height - 54}" rx="10"/><text x="${x + colWidth / 2}" y="25" text-anchor="middle">${t('Nhóm', 'Group')} ${index + 1}</text></g>`;
    }).join('');
  } else {
    width = 380; height = visibleNodes.length > 8 ? 390 : 300;
    const radius = visibleNodes.length === 1 ? 0 : Math.min(125, height / 2 - 40);
    visibleNodes.forEach((node, i) => {
      const angle = -Math.PI / 2 + i * 2 * Math.PI / visibleNodes.length;
      positions[node] = { x: width / 2 + radius * Math.cos(angle), y: height / 2 + radius * Math.sin(angle) };
    });
  }
  const drawnEdges = v.edges.filter(([a, b]) => positions[a] && positions[b]).sort((a, b) => Number(Boolean(edgeIs(...a, edge))) - Number(Boolean(edgeIs(...b, edge))));
  const svgEdges = drawnEdges.map(([a, b]) => {
    const p = positions[a], q = positions[b], failed = edgeIs(a, b, v.conflict), focused = edgeIs(a, b, edge);
    const cls = `mg2493-edge${failed ? ' bad' : focused ? ' focus' : ''}`;
    const attrs = `class="${cls}" data-edge="${a}-${b}"`;
    const title = `<title>${a} — ${b}${groupOf[a] !== undefined && groupOf[b] !== undefined ? `: |${groupOf[a]} − ${groupOf[b]}| = ${Math.abs(groupOf[a] - groupOf[b])}` : ''}</title>`;
    return p.x === q.x && placed.length
      ? `<path ${attrs} d="M ${p.x} ${p.y} C ${p.x + 60} ${p.y}, ${q.x + 60} ${q.y}, ${q.x} ${q.y}">${title}</path>`
      : `<line ${attrs} x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}">${title}</line>`;
  }).join('');
  const svgNodes = Object.entries(positions).map(([key, p]) => {
    const node = Number(key), group = groupOf[node];
    return `<g class="mg2493-node ${group === undefined ? 'pending' : group % 2 ? 'even' : 'odd'}${nodeClass(node)}" data-node="${node}" data-group="${group ?? ''}" transform="translate(${p.x},${p.y})"><title>${t('Đỉnh', 'Node')} ${node}${group === undefined ? '' : ` · ${t('nhóm', 'group')} ${group}`}${node === v.start && !success ? t(' · gốc BFS', ' · BFS root') : ''}</title><circle class="mg2493-ring" r="26"/><circle class="mg2493-disc" r="21"/><text text-anchor="middle" y="6">${node}</text></g>`;
  }).join('');
  const diagram = `<div class="mg2493-chart" tabindex="0" role="region" aria-label="${t('Sơ đồ nhóm, có thể cuộn ngang', 'Group diagram, horizontally scrollable')}"><svg class="mg2493-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${t('Mỗi cột là một nhóm; số trong vòng tròn là đỉnh', 'Each column is a group; numbers in circles are nodes')}"><title>${t('Các cạnh phải nối hai cột liền nhau', 'Edges must join adjacent columns')}</title>${lanes}${svgEdges}${svgNodes}</svg></div>`;

  const bothPlaced = edge && edge.every(node => groupOf[node] !== undefined);
  const edgeCheck = bothPlaced ? `<div class="mg2493-edge-check ${bad ? 'bad' : 'good'}"><span>${t('Cạnh', 'Edge')} <b>${edge[0]} — ${edge[1]}</b></span><strong>|${groupOf[edge[0]]} − ${groupOf[edge[1]]}| = ${Math.abs(groupOf[edge[0]] - groupOf[edge[1]])}</strong><b>${bad ? t('✕ Cùng nhóm → -1', '✕ Same group → -1') : t('✓ Hai nhóm liền nhau', '✓ Adjacent groups')}</b></div>` : '';
  const heading = success ? t('Cộng số nhóm tốt nhất của từng thành phần', 'Sum the best group count of each component')
    : bad ? t('Cạnh nằm trong cùng một nhóm → không thể chia', 'An edge within one group → impossible')
    : v.event === 'record' ? t(`Gốc ${v.start}: ${totalGroups} nhóm · giữ kỷ lục ${v.best[v.component]}`, `Root ${v.start}: ${totalGroups} groups · best stays ${v.best[v.component]}`)
    : v.start !== null ? t(`Thử gốc ${v.start} → mỗi tầng BFS là một nhóm`, `Try root ${v.start} → each BFS layer is a group`)
    : t('Xếp các đỉnh thành nhiều cột nhất', 'Arrange nodes into as many columns as possible');
  const subheading = success ? t('Các thành phần rời nhau được xếp nối tiếp; mọi đỉnh xuất hiện đúng một lần.', 'Disconnected components are placed consecutively; each node appears exactly once.')
    : bad ? t('Hai đỉnh cùng tầng BFS chứng tỏ có chu trình lẻ. Đổi gốc cũng không sửa được.', 'Two adjacent nodes in the same BFS layer imply an odd cycle. Changing the root cannot fix it.')
    : t('Cạnh chỉ được nối hai cột liền nhau. Thử mọi gốc để tìm cách xếp dài nhất.', 'Edges may only join adjacent columns. Try every root to find the widest arrangement.');
  const componentsHtml = v.components.map((c, index) => {
    const best = v.best[c.id], chosen = v.winners.find(r => r.component === c.id);
    const invalid = bad && c.nodes.includes(v.conflict[0]);
    return `<article class="mg2493-component${!success && c.id === v.component ? ' active' : ''}${invalid ? ' invalid' : ''}"><small>${t('Thành phần', 'Component')} ${index + 1} · {${c.nodes.join(', ')}}</small><strong>${invalid ? '✕' : best ?? '…'} <span>${invalid ? t('không thể chia', 'impossible') : t('nhóm', 'groups')}</span></strong><span>${invalid ? t('Có chu trình lẻ', 'Contains an odd cycle') : chosen ? t(`Gốc tốt nhất đã thử: ${chosen.start}`, `Best root tried: ${chosen.start}`) : t('Chưa có kết quả', 'No result yet')}</span></article>`;
  }).join('');
  const summary = `<div class="mg2493-sum${bad ? ' bad' : ''}"><small>${success || bad ? t('Đáp án', 'Answer') : t('Tổng kỷ lục đã tìm được', 'Sum of best counts found so far')}</small><b>${bad ? '-1' : `${v.components.map(c => v.best[c.id] ?? '?').join(' + ')}${v.components.length > 1 ? ` = ${v.total}${success ? '' : ' …'}` : ''}`}</b></div>`;
  const roots = component?.nodes ?? [];
  const trialsHtml = roots.map(root => {
    const trial = currentTrials.find(r => r.start === root);
    const running = root === v.start && !trial && !success;
    const bestRoot = winner?.start === root;
    return `<button type="button" class="mg2493-trial${bestRoot ? ' best' : ''}${running ? ' active' : ''}" ${trial ? `data-mg2493-step="${trial.step}"` : 'disabled'} aria-label="${trial ? t(`Xem BFS từ đỉnh ${root}: ${trial.groups} nhóm`, `View BFS from node ${root}: ${trial.groups} groups`) : t(`Đỉnh ${root} chưa thử xong`, `Root ${root} is not completed`)}"><span>${t('Gốc', 'Root')} <b>${root}</b></span><div><i style="width:${trial ? trial.groups / roots.length * 100 : 0}%"></i></div><strong>${trial ? trial.groups : running ? '…' : '—'}</strong><small>${bestRoot ? t('★ tốt nhất', '★ best') : running ? t('đang thử', 'running') : trial ? t('nhóm', 'groups') : t('chưa thử', 'untried')}</small></button>`;
  }).join('');
  const queue = v.queue.map((node, i) => `<span${i === 0 ? ' class="front"' : ''}>${node}</span>`).join('') || `<em>${t('rỗng', 'empty')}</em>`;
  host.innerHTML = `<section class="mg2493-viz" aria-label="2493 · ${t('Chia nhiều nhóm nhất', 'Maximum number of groups')}">
    <header class="mg2493-title"><div><small>2493 · BFS</small><h3>${t('Mỗi cạnh → hai nhóm liền nhau', 'Each edge → two adjacent groups')}</h3></div><strong class="mg2493-result${bad ? ' bad' : success ? ' good' : ''}">${bad ? '-1' : success ? `${v.answer} ${t('nhóm', 'groups')}` : t('Đang thử', 'Trying roots')}</strong></header>
    <div class="mg2493-examples"><span>${t('Ví dụ', 'Examples')}</span><button data-mg2493-example="valid">${t('Hợp lệ', 'Valid')}</button><button data-mg2493-example="cycle">${t('Tam giác → -1', 'Triangle → -1')}</button><button data-mg2493-example="split">${t('Rời nhau → cộng', 'Disconnected → sum')}</button></div>
    <div class="mg2493-action${bad ? ' bad' : ''}"><strong>${escapeHtml(heading)}</strong><p>${escapeHtml(subheading)}</p></div>
    ${!v.final ? `<nav class="mg2493-jumps" aria-label="${t('Xem nhanh các lần BFS', 'Jump between BFS runs')}"><button data-mg2493-next-root>${t('Xong lần BFS này →', 'Finish this BFS →')}</button><button data-mg2493-finish>${t('Xem kết quả', 'See result')}</button></nav>` : ''}
    <div class="mg2493-picture"><div class="mg2493-picture-head"><b>${success ? t('Cách chia tối ưu', 'Optimal grouping') : v.start === null ? t('Đồ thị đầu vào', 'Input graph') : t(`BFS từ đỉnh ${v.start}`, `BFS from node ${v.start}`)}</b><span>${t('Số trong vòng tròn = đỉnh', 'Number in circle = node')}${totalGroups ? ` · ${totalGroups} ${t('nhóm đang có', 'groups so far')}` : ''}</span></div>${diagram}${edgeCheck}${placed.length && pending.length ? `<div class="mg2493-pending">${t('Chưa xếp', 'Unassigned')}: ${pending.map(node => `<b>${node}</b>`).join('')}</div>` : ''}</div>
    ${!success && !bad && v.start !== null ? `<div class="mg2493-queue"><b>queue</b><small>${t('Đầu → cuối', 'Front → back')}</small>${queue}</div>` : ''}
    <div class="mg2493-components">${componentsHtml}${summary}</div>
    ${component && !bad ? `<section class="mg2493-roots"><header><strong>${t('Vì sao phải thử mọi gốc?', 'Why try every root?')}</strong><span>${t('Chọn số nhóm lớn nhất, không cộng các gốc', 'Keep the maximum, do not sum roots')}</span></header>${trialsHtml}</section>` : ''}
  </section>`;
  const examples = {
    valid: { n: 6, edges: [[1,2],[1,4],[1,5],[2,6],[2,3],[4,6]] },
    cycle: { n: 3, edges: [[1,2],[2,3],[3,1]] },
    split: { n: 6, edges: [[1,2],[2,3],[4,5]] },
  };
  host.querySelectorAll?.('[data-mg2493-example]').forEach(button => button.addEventListener('click', () => {
    const example = examples[button.dataset.mg2493Example];
    $('arrInput').value = JSON.stringify(example.edges);
    $('param-n').value = example.n;
    $('runBtn').click();
  }));
  host.querySelectorAll?.('[data-mg2493-step]').forEach(button => button.addEventListener('click', () => {
    stopPlay(); stepIndex = Number(button.dataset.mg2493Step); renderStep();
  }));
  host.querySelector?.('[data-mg2493-next-root]')?.addEventListener('click', () => {
    const next = steps.findIndex((s, i) => i > stepIndex && (s.magnificent2493View?.event === 'record' || s.final));
    if (next >= 0) { stopPlay(); stepIndex = next; renderStep(); }
  });
  host.querySelector?.('[data-mg2493-finish]')?.addEventListener('click', () => $('lastBtn').click());
}
