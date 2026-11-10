function renderFrog1377View(step) {
  const view = step.frog1377View;
  const host = $('treeView');
  const t = (vi, en) => lang === 'vi' ? vi : en;
  const esc = value => escapeHtml(String(value ?? '—'));
  const fraction = (probability, denominator) => denominator
    ? `${Math.round(probability * denominator)}/${denominator}`
    : probability === null || probability === undefined ? '—' : String(probability);
  const adjacency = Array.from({ length: view.n + 1 }, () => []);
  for (const [u, v] of view.edges) {
    adjacency[u].push(v);
    adjacency[v].push(u);
  }

  const positions = new Map();
  let leafIndex = 0, maxDepth = 0;
  function layout(node, parent, depth) {
    maxDepth = Math.max(maxDepth, depth);
    const children = adjacency[node].filter(next => next !== parent);
    let x;
    if (!children.length) {
      x = leafIndex++;
    } else {
      const childX = children.map(child => layout(child, node, depth + 1));
      x = (childX[0] + childX.at(-1)) / 2;
    }
    positions.set(node, { x, y: depth });
    return x;
  }
  layout(1, 0, 0);

  const nodeGap = 104, left = 56;
  const width = Math.max(520, (leafIndex - 1) * nodeGap + left * 2);
  const treeWidth = (leafIndex - 1) * nodeGap;
  const offset = (width - treeWidth) / 2;
  const height = Math.max(180, maxDepth * 104 + 116);
  const point = id => ({ x: offset + positions.get(id).x * nodeGap, y: 58 + positions.get(id).y * 104 });
  const pathEdges = new Set(view.path.slice(1).map((id, index) => `${view.path[index]}-${id}`));
  const flowEdge = view.flow ? `${view.flow.from}-${view.flow.to}` : null;
  const edges = [];
  for (let node = 1; node <= view.n; node++) {
    for (const child of adjacency[node]) {
      if (point(child).y <= point(node).y) continue;
      const from = point(node), to = point(child);
      const key = `${node}-${child}`;
      const probability = view.arrivals[child];
      edges.push(`<g class="frog-edge ${pathEdges.has(key) ? 'on-path' : ''} ${flowEdge === key ? 'active-flow' : ''}">
        <line x1="${from.x}" y1="${from.y + 25}" x2="${to.x}" y2="${to.y - 27}"/>
        ${flowEdge === key && probability ? `<text x="${(from.x + to.x) / 2 + 8}" y="${(from.y + to.y) / 2}">${esc(fraction(probability.probability, probability.denominator))}</text>` : ''}
      </g>`);
    }
  }
  const popped = new Set(view.popped.map(item => item.node));
  const nodes = Array.from({ length: view.n }, (_, index) => index + 1).map(node => {
    const at = point(node), arrival = view.arrivals[node];
    const status = view.current === node ? 'current' : popped.has(node) ? 'processed' : arrival ? 'reached' : 'unreached';
    const isTarget = node === view.target;
    const probability = arrival ? fraction(arrival.probability, arrival.denominator) : '—';
    const seconds = arrival ? `t=${arrival.elapsed}` : t('chưa đến', 'not reached');
    return `<g class="frog-node ${status} ${isTarget ? 'target' : ''}" transform="translate(${at.x} ${at.y})" aria-label="${t(`Đỉnh ${node}, xác suất ${probability}`, `Node ${node}, probability ${probability}`)}">
      <title>${t(`Đỉnh ${node} · ${seconds} · P=${probability}${isTarget ? ' · target' : ''}`, `Node ${node} · ${seconds} · P=${probability}${isTarget ? ' · target' : ''}`)}</title>
      <circle r="24"/>
      <text class="frog-node-id" y="5">${node}</text>
      <text class="frog-node-prob" y="43">${esc(probability)}</text>
    </g>`;
  }).join('');
  const queue = Array.isArray(view.locals.queue) ? view.locals.queue : [];
  const queueCards = queue.map(([node, parent, elapsed, probability]) => {
    const arrival = view.arrivals[node];
    return `<span><b>${esc(node)}</b><small>${t('giây', 'sec')} ${esc(elapsed)} · P=${esc(fraction(probability, arrival?.denominator))}</small></span>`;
  }).join('');
  const currentArrival = view.current === null ? null : view.arrivals[view.current];
  const currentProbability = currentArrival
    ? fraction(currentArrival.probability, currentArrival.denominator)
    : view.current === 1 ? '1/1' : '—';
  const share = view.share === null ? null : fraction(view.share, view.shareDenominator);
  const stopped = view.decision?.terminal;
  const summary = view.reason === 'leaf-stay'
    ? t('Ếch đã ở lá nên đứng yên; xác suất được giữ nguyên.', 'The frog is at a leaf, so it stays and keeps its probability.')
    : view.reason === 'must-leave'
      ? t('Đỉnh đích còn con, nên ếch buộc phải nhảy khỏi đó.', 'The target has children, so the frog must leave it.')
      : view.reason === 'too-far'
        ? t('Đỉnh đích không thể đến trong số giây đã cho.', 'The target cannot be reached in the given time.')
        : stopped
          ? view.decision.atTime
            ? t('Dừng nhánh: đã đủ số giây.', 'Stop this branch: the time limit is reached.')
            : t('Dừng nhánh: đây là lá, ếch sẽ đứng yên.', 'Stop this branch: it is a leaf, so the frog stays.')
          : t('Nếu còn con, chia đều xác suất; không bao giờ nhảy ngược về cha.', 'Split probability evenly among children; never jump back to the parent.');
  const result = step.final
    ? `<section class="frog1377-result"><small>P(${t('đỉnh', 'node')} ${view.target} ${t('sau', 'after')} ${view.t}s)</small><b>${esc(view.result === 0 ? '0' : fraction(view.result, view.resultDenominator))}</b><span>${esc(Number(view.result).toFixed(6))}</span></section>`
    : '';
  const choices = view.children?.length
    ? view.children.map(node => `<span>${t('đỉnh', 'node')} <b>${node}</b></span>`).join('')
    : `<span>${t('không có · đứng yên nếu đã tới lá', 'none · stays if already at a leaf')}</span>`;

  host.innerHTML = `<section class="frog1377-viz">
    <header class="frog1377-heading"><b>#1377 · ${t('Ếch nhảy và xác suất', 'Frog jumps & probability')}</b>
      <span>${t('Bước', 'Step')} ${stepIndex + 1}/${steps.length}</span></header>
    <div class="frog1377-stats">
      <article><small>${t('Thời gian', 'Time')}</small><b>${view.elapsed === null ? '—' : `${view.elapsed}/${view.t}`}s</b></article>
      <article><small>${t('Đỉnh đang xét', 'Current node')}</small><b>${view.current ?? '—'}</b></article>
      <article><small>${t('Xác suất tại đỉnh', 'Probability here')}</small><b>${esc(currentProbability)}</b></article>
      <article class="target-stat"><small>target</small><b>${view.target}</b></article>
    </div>
    <div class="frog1377-layout">
      <section class="frog1377-panel frog1377-tree-panel">
        <header><b>${t('Cây gốc tại đỉnh 1', 'Tree rooted at node 1')}</b><small>${t('Nhãn dưới mỗi nút = xác suất', 'Label under each node = probability')}</small></header>
        <div class="frog1377-tree-scroll"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${t('Cây xác suất của các bước nhảy', 'Probability tree of possible jumps')}">${edges.join('')}${nodes}</svg></div>
        <div class="frog1377-legend"><span class="reached">● ${t('đã đến', 'reached')}</span><span class="current">● ${t('đang xét', 'current')}</span><span class="target">◎ target</span><span>${t('— chưa đến', '— not reached')}</span></div>
      </section>
      <section class="frog1377-panel frog1377-explanation">
        <div class="frog1377-action"><small>${t('Đang làm gì?', 'What is happening?')}</small><b>${esc(step.title?.[lang] ?? step.title?.en ?? '')}</b><p>${esc(step.note?.[lang] ?? step.note?.en ?? '')}</p></div>
        <div><small>${t('Các đỉnh con có thể chọn', 'Available children')}</small><div class="frog1377-chips">${choices}</div></div>
        ${view.share !== null ? `<div class="frog1377-equation"><small>${t('Chia đều xác suất', 'Equal probability split')}</small><b>${esc(fraction(currentArrival?.probability, currentArrival?.denominator))} ÷ ${view.children.length} = ${esc(share)}</b></div>` : ''}
        <div class="frog1377-rule"><b>${t('Quy tắc dừng', 'Stopping rule')}</b><span>${esc(summary)}</span></div>
        <div><small>${t('Hàng đợi BFS · xử lý theo từng nhánh', 'BFS queue · process one path at a time')}</small>
          <div class="frog1377-queue">${queueCards || `<span class="empty">${t('Hàng đợi trống', 'Queue is empty')}</span>`}</div></div>
        ${result}
      </section>
    </div>
    <p class="frog1377-hint">${t('Đọc nhãn P trên cây: xác suất được chia tại mỗi lần nhảy. Lá giữ nguyên xác suất, còn nút chưa phải lá thì phải tiếp tục nhảy.', 'Read P labels on the tree: probability is split at every jump. A leaf keeps its probability; a non-leaf must keep moving.')}</p>
  </section>`;
}
