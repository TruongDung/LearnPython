let treeDfsResizeObserver = null;
let treeDfsFit = { id: null, enabled: false };
function renderTreeDfsPicture(step) {
  treeDfsResizeObserver?.disconnect();
  const v = step.treeDfsPicture, host = $('treeView');
  if (treeDfsFit.id !== v.id) treeDfsFit = { id: v.id, enabled: v.nodes.length <= 9 };
  const t = (vi, en) => lang === 'vi' ? vi : en;
  const esc = value => escapeHtml(String(value ?? '—'));
  const byId = new Map(v.nodes.map(node => [node.id, node]));
  const val = id => id === null ? '∅' : byId.get(id)?.value ?? '—';
  const eventNames = { visit: t('Thăm nút', 'Visit'), empty: '∅', check: t('So sánh', 'Compare'),
    extend: t('Nối nhánh', 'Extend'), reset: t('Bắt đầu tại nút', 'Start here'), best: t('Cập nhật best', 'Update best'),
    combine: t('Ghép kết quả', 'Combine'), flow: t('Xu qua cạnh', 'Coins across edges'), count: 'count + 1', return: '↩ return', done: t('Kết quả', 'Result') };
  const presets = v.id === 250 ? [
    [t('Ví dụ mẫu', 'Example'), '5,1,5,5,5,null,5'],
    [t('Toàn cây giống nhau', 'All equal'), '1,1,1,1,1,1,1'],
    [t('Khác ở hậu duệ', 'Deep mismatch'), '1,1,1,1,2'],
    [t('Một nút', 'One node'), '7'],
  ] : v.id === 687 ? [
    [t('Ví dụ mẫu', 'Example'), '5,4,5,1,1,null,5'],
    [t('Ghép hai nhánh', 'Join two arms'), '1,1,1,1,1,1,1'],
    [t('Tốt nhất ở dưới', 'Best below root'), '9,1,8,1,1'],
    [t('Một nút = 0 cạnh', 'One node = 0 edges'), '7'],
  ] : v.id === 979 ? [
    [t('Gửi từ gốc', 'Send from root'), '3,0,0'],
    [t('Xu đi qua gốc', 'Coins cross root'), '0,3,0'],
    [t('Đi qua nhiều cạnh', 'Multiple edges'), '1,0,0,null,3'],
    [t('Đã cân bằng', 'Already balanced'), '1,1,1'],
  ] : v.id === 1372 ? [
    [t('ZigZag dài', 'Long ZigZag'), '1,2,3,null,4,7,null,5,null,null,null,null,6'],
    [t('Cùng hướng', 'Same direction'), '1,2,null,3,null,4'],
    [t('Giá trị không ảnh hưởng', 'Values do not matter'), '1,1,null,null,1,1,null,null,1'],
    [t('Một nút = 0 cạnh', 'One node = 0 edges'), '7'],
  ] : v.id === 298 ? [
    [t('Nối +1', 'Extend +1'), '1,null,3,2,4,null,null,null,5'],
    [t('Ngắt chuỗi', 'Restart'), '1,2,9,3,8,10,11,4'],
    [t('Số âm', 'Negative'), '-2,-1,5,0'],
  ] : v.id === 333 ? [
    [t('BST một nhánh', 'BST in a branch'), '10,5,15,1,8,null,7'],
    [t('Toàn cây là BST', 'Whole tree is BST'), '4,2,6,1,3,5,7'],
    [t('Sai ở hậu duệ', 'Deep violation'), '10,5,15,1,12'],
    [t('Trùng giá trị', 'Duplicates'), '2,2,3'],
  ] : [
    [t('Ghép qua gốc', 'Join at root'), '3,2,4,1,null,null,5'],
    [t('Cùng tăng', 'Both increase'), '2,3,3,4,null,null,4'],
    [t('Ngắt nhánh', 'Broken edge'), '2,1,4'],
  ];
  presets.push([t('Cây rỗng', 'Empty tree'), '[]']);
  const later = event => steps.findIndex((candidate, index) => index > stepIndex && candidate.treeDfsPicture?.event === event);
  const jumps = v.id === 250 ? ['check', 'count', 'return'] : v.id === 979 ? ['flow', 'return'] : v.id === 1372 ? ['extend', 'best', 'return']
    : v.id === 687 ? ['check', 'extend', 'combine', 'return'] : v.id === 298 ? ['check', 'extend', 'reset', 'best'] : v.id === 333 ? ['check', 'combine', 'return'] : ['check', 'extend', 'combine'];
  const heading = { 250: '✓ subtree', 298: '↓ +1', 333: 'BST', 549: '↗ +1 ↘', 687: '= ↔ =', 979: '● → ●', 1372: '↙ ↘ ↙' }[v.id];
  const controls = `<header><b>#${v.id} · ${heading}</b><span>${t('Dòng', 'Line')} ${v.line} · ${eventNames[v.event]}</span></header>
    <div class="tdp-buttons">${presets.map(([label], index) => `<button type="button" data-tdp-preset="${index}">${label}</button>`).join('')}</div>
    <div class="tdp-buttons tdp-jumps">${jumps.map(event => `<button type="button" data-tdp-event="${event}"${later(event) < 0 ? ' disabled' : ''}>${eventNames[event]} →</button>`).join('')}${v.nodes.length > 1 ? `<button type="button" data-tdp-fit aria-pressed="${treeDfsFit.enabled}">${treeDfsFit.enabled ? '1:1' : `⊡ ${t('Vừa khung', 'Fit tree')}`}</button>` : ''}</div>`;
  const path = (ids, kind = '') => `<div class="tdp-path ${kind}">${ids.length ? ids.map(id => `<b data-tdp-path-node="${id}">${esc(val(id))}</b>`).join('<i>→</i>') : '<span>∅</span>'}</div>`;
  const zigPath = ids => `<div class="tdp-path">${ids.map((id, index) => `${index ? `<i class="${byId.get(ids[index - 1]).left === id ? 'inc' : 'dec'}">${byId.get(ids[index - 1]).left === id ? '↙ L' : 'R ↘'}</i>` : ''}<b>${esc(val(id))}</b>`).join('') || '∅'}</div>`;
  const signed = value => value === null ? '—' : value > 0 ? `+${value}` : String(value);
  const stat = (label, value, kind = '') => `<div class="tdp-stat ${kind}"><small>${label}</small><b>${esc(value)}</b></div>`;
  const summary = (state, side) => {
    if (!state) return `<article class="tdp-child"><small>${side}</small><b>…</b></article>`;
    if (v.id === 250) return `<article class="tdp-child ${state.uni ? 'good' : 'bad'}"><small>${side}</small><b>↩ ${state.uni ? 'True ✓' : 'False ✕'}</b></article>`;
    if (v.id === 687 || v.id === 979) return `<article class="tdp-child"><small>${side}</small>${stat(v.id === 979 ? 'balance' : 'gain', v.id === 979 ? signed(state.gain) : state.gain, 'inc')}</article>`;
    if (v.id === 1372) return `<article class="tdp-child"><small>${side}</small><div>${stat('↙ L', state.goLeft, 'inc')}${stat('R ↘', state.goRight, 'dec')}</div></article>`;
    return `<article class="tdp-child ${state.bst === false ? 'bad' : 'good'}"><small>${side}</small>${v.id === 333
      ? `<b>${state.bst ? '✓ BST' : '✕ BST'}</b>${state.bst ? `<div>${stat('min', state.min)}${stat('max', state.max)}${stat('size', state.size)}</div>` : '<small>↩ False</small>'}`
      : `<div>${stat('inc ↓ +1', state.inc, 'inc')}${stat('dec ↓ −1', state.dec, 'dec')}</div>`}</article>`;
  };
  let focus = '';
  if (v.id === 250) {
    const c = v.check;
    const status = value => value === null || value === undefined ? '…' : value ? '✓' : '✕';
    focus = `<section class="tdp-focus"><div class="tdp-children">${summary(v.left, t('Cây con trái', 'Left subtree'))}<b class="tdp-center">${esc(val(v.current))}</b>${summary(v.right, t('Cây con phải', 'Right subtree'))}</div>
      <div class="tdp-stats">${stat(t('Trái = nút', 'Left = node'), status(v.leftMatches), v.leftMatches === false ? 'bad' : 'good')}${stat(t('Phải = nút', 'Right = node'), status(v.rightMatches), v.rightMatches === false ? 'bad' : 'good')}</div>
      <div class="tdp-equation ${v.isUni ? 'good' : v.isUni === false ? 'bad' : ''}"><b>${v.isUni === null ? '…' : v.isUni ? '✓' : '✕'}</b><span>${t('Cả cây con cùng giá trị', 'One value in the entire subtree')}</span></div>
      <div class="tdp-stats">${stat('count', v.best, 'good')}</div>
      <small>${t('Các gốc đã đếm', 'Counted roots')}</small><div class="tdp-counted">${v.counted.map(id => `<span data-tdp-counted="${id}">✓ <b>${esc(val(id))}</b></span>`).join('') || '∅'}</div></section>`;
  } else if (v.id === 687) {
    const c = v.check, through = v.leftArrow === null || v.rightArrow === null ? null : v.leftArrow + v.rightArrow;
    focus = `<section class="tdp-focus"><div class="tdp-children">${summary(v.left, '↙ dfs(left)')}<b class="tdp-center">${esc(val(v.current))}</b>${summary(v.right, 'dfs(right) ↘')}</div>
      ${c ? `<div class="tdp-equation ${c.passed ? 'good' : 'bad'}"><b>${esc(c.parentValue)}</b><span>${c.passed ? '=' : '≠'}</span><b>${c.child === null ? '∅' : esc(c.value)}</b><span>${c.passed ? '✓ +1' : '→ 0'}</span></div>` : ''}
      <div class="tdp-branches"><article><small class="inc">left_arrow = ${esc(v.leftArrow)}</small>${path(v.leftPath, 'inc')}</article><article><small class="dec">right_arrow = ${esc(v.rightArrow)}</small>${path(v.rightPath, 'dec')}</article></div>
      <div class="tdp-equation"><b class="inc">${esc(v.leftArrow)}</b><span>+</span><b class="dec">${esc(v.rightArrow)}</b><span>=</span><b>${esc(through)}</b><small>${t('cạnh qua nút', 'edges through node')}</small></div>
      <small>↩ max(left_arrow, right_arrow) = ${through === null ? '—' : Math.max(v.leftArrow, v.rightArrow)}</small>${path(v.returnPath)}
      <small>${t('Trả một nhánh lên cha', 'Return one arm to the parent')}</small></section>`;
  } else if (v.id === 1372) {
    focus = `<section class="tdp-focus"><div class="tdp-children">${summary(v.left, '↙ dfs(left)')}<b class="tdp-center">${esc(val(v.current))}</b>${summary(v.right, 'dfs(right) ↘')}</div>
      <article class="tdp-zig-rule inc"><b>↙ L → R ↘</b><code>go_left = 1 + left_r</code><strong>${v.left === null ? '—' : `1 + (${v.left.goRight}) = ${esc(v.goLeft)}`}</strong>${zigPath(v.leftPath)}</article>
      <article class="tdp-zig-rule dec"><b>R ↘ → ↙ L</b><code>go_right = 1 + right_l</code><strong>${v.right === null ? '—' : `1 + (${v.right.goLeft}) = ${esc(v.goRight)}`}</strong>${zigPath(v.rightPath)}</article>
      <small>${t('Lá: 0 cạnh · ∅ trả (−1, −1)', 'Leaf: 0 edges · ∅ returns (−1, −1)')}</small></section>`;
  } else if (v.id === 979) {
    const left = v.left?.gain ?? null, right = v.right?.gain ?? null;
    const flow = (balance, side) => `<article class="tdp-flow-arm ${balance > 0 ? 'inc' : 'dec'}"><small>${side}</small><b>${balance === null ? '…' : balance === 0 ? '= 0' : `${balance > 0 ? '↑' : '↓'} ${Math.abs(balance)} 🟡`}</b><small>${balance === null ? '' : balance > 0 ? t('dư → gửi lên', 'surplus → send up') : balance < 0 ? t('thiếu → nhận xuống', 'deficit → receive down') : t('đủ xu', 'balanced')}</small></article>`;
    focus = `<section class="tdp-focus"><small>${t('Xu cần đi qua mỗi cạnh', 'Coins that must cross each edge')}</small><div class="tdp-flow-arms">${flow(left, '↙ left')}${flow(right, 'right ↘')}</div>
      <div class="tdp-equation"><span>|${esc(left)}| + |${esc(right)}| =</span><b>${left === null || right === null ? '—' : Math.abs(left) + Math.abs(right)}</b><small>${t('lượt', 'moves')}</small></div>
      <div class="tdp-stats">${stat('moves', v.best, 'good')}${v.added !== null ? stat(t('Vừa cộng', 'Added'), `+${v.added}`) : ''}</div>
      ${v.current !== null ? `<div class="tdp-equation"><b>${esc(val(v.current))}</b><span>+ (${signed(left)}) + (${signed(right)}) − 1</span></div><small>${t('Giữ 1 xu; trả phần dư/thiếu lên cha', 'Keep 1 coin; return the surplus or deficit')}</small>` : ''}
      ${v.returned !== null ? stat('↩ balance', signed(v.returned), 'inc') : ''}
      <div class="tdp-coin-goal">${[0, 1, 2].map(() => '<span>🟡</span>').join('')}<small>${t('Đích: 1 xu mỗi nút', 'Goal: 1 coin per node')}</small></div></section>`;
  } else if (v.id === 298) {
    const c = v.check;
    focus = `<section class="tdp-focus"><div class="tdp-equation ${c ? c.passed ? 'good' : 'bad' : ''}">${c
      ? c.parent === null ? `<b>${esc(c.value)}</b><span>→</span><b>1</b><small>root</small>`
        : `<b>${esc(c.parentValue)}</b><span>+ 1 ${c.passed ? '=' : '≠'}</span><b>${esc(c.value)}</b><span>${c.passed ? '✓' : '↺ 1'}</span>`
      : `<b>${v.current === null ? '∅' : esc(val(v.current))}</b><span>↓</span>`}</div>
      <div class="tdp-stats">${stat('length', v.length)}${stat('longest', v.best, 'good')}</div>
      <small>${t('Chuỗi hiện tại', 'Current chain')}</small>${path(v.chain, 'inc')}</section>`;
  } else if (v.id === 333) {
    const c = v.check;
    const leftOk = c && (v.left.size === 0 || Number(c.leftMax) < c.value);
    const rightOk = c && (v.right.size === 0 || c.value < Number(c.rightMin));
    focus = `<section class="tdp-focus"><div class="tdp-children">${summary(v.left, t('Trái ↩', 'Left ↩'))}<b class="tdp-center">${esc(val(v.current))}</b>${summary(v.right, t('Phải ↩', 'Right ↩'))}</div>
      <div class="tdp-equation">${c ? c.leftBst && c.rightBst ? `<b class="${leftOk ? 'good' : 'bad'}">${esc(c.leftMax)}</b><span>&lt;</span><b>${esc(c.value)}</b><span>&lt;</span><b class="${rightOk ? 'good' : 'bad'}">${esc(c.rightMin)}</b><span class="${c.passed ? 'good' : 'bad'}">${c.passed ? '✓' : '✕'}</span>`
        : `<span class="${c.leftBst ? 'good' : 'bad'}">BST(L) ${c.leftBst ? '✓' : '✕'}</span><span class="${c.rightBst ? 'good' : 'bad'}">BST(R) ${c.rightBst ? '✓' : '✕'}</span>`
      : '<span>max(L) &lt; node &lt; min(R)</span>'}</div>
      ${c && !c.passed ? `<small class="bad">${!c.leftBst || !c.rightBst ? t('Cây con không phải BST', 'A child subtree is not a BST') : t('Sai thứ tự giá trị', 'Values are out of order')}</small>` : ''}
      ${v.size !== null ? `<div class="tdp-equation"><b>${v.left.size}</b><span>+ 1 +</span><b>${v.right.size}</b><span>=</span><b>${v.size}</b></div>` : ''}
      <div class="tdp-stats">${stat('best', v.best, 'good')}${stat(t('Gốc BST tốt nhất', 'Best BST root'), val(v.bestRoot))}</div></section>`;
  } else {
    const c = v.check;
    focus = `<section class="tdp-focus"><div class="tdp-children">${summary(v.left, t('Trái ↩', 'Left ↩'))}<b class="tdp-center">${esc(val(v.current))}</b>${summary(v.right, t('Phải ↩', 'Right ↩'))}</div>
      ${c ? `<div class="tdp-equation ${c.passed ? 'good' : 'bad'}"><b>${esc(c.parentValue)}</b><span>${c.direction === 'inc' ? '+ 1' : '− 1'} ${c.passed ? '=' : '≠'}</span><b>${esc(c.value)}</b><span>${c.passed ? '✓' : '✕'}</span></div>` : ''}
      <div class="tdp-branches"><article><small class="inc">inc ↓ +1</small>${path(v.incChain, 'inc')}</article><article><small class="dec">dec ↓ −1</small>${path(v.decChain, 'dec')}</article></div>
      <div class="tdp-equation"><b class="inc">${esc(v.inc)}</b><span>+</span><b class="dec">${esc(v.dec)}</b><span>− 1 =</span><b>${v.inc === null ? '—' : v.inc + v.dec - 1}</b></div>
      <small>${t('Nút giữa chỉ đếm 1 lần', 'Count the joining node once')}</small>${path(v.chain)}
      <div class="tdp-stats">${stat('best', v.best, 'good')}</div></section>`;
  }
  const active = new Set(v.frames.map(frame => frame.node));
  const witnesses = new Map();
  if (v.id === 333 && v.check && !v.check.passed) {
    const current = byId.get(v.current);
    for (const [side, bound, label, invalid] of [
      ['left', v.check.leftMax, 'max(L)', v.left.bst && v.left.size > 0 && v.check.leftMax >= current.value],
      ['right', v.check.rightMin, 'min(R)', v.right.bst && v.right.size > 0 && v.check.rightMin <= current.value],
    ]) {
      if (!invalid) continue;
      const queue = [current[side]];
      for (let i = 0; i < queue.length; i++) {
        const node = byId.get(queue[i]);
        if (node.value === bound) witnesses.set(node.id, label);
        queue.push(...[node.left, node.right].filter(id => id !== null));
      }
    }
  }
  const best = new Set(v.bestIds), chain = new Set(v.chain), inc = new Set(v.id === 687 ? v.leftPath : v.incChain), dec = new Set(v.id === 687 ? v.rightPath : v.decChain);
  const counted = new Set(v.counted), spacing = v.id === 979 ? 100 : 88;
  const width = Math.max(280, v.nodes.length * 62 + 20), height = Math.max(150, (Math.max(0, ...v.nodes.map(node => node.depth)) + 1) * spacing + 12);
  const positions = new Map(v.nodes.map(node => [node.id, { x: 10 + (node.rank + .5) * (width - 20) / v.nodes.length, y: node.depth * spacing + 30 }]));
  const edges = v.nodes.flatMap(node => [node.left, node.right].filter(id => id !== null).map(id => {
    const a = positions.get(node.id), b = positions.get(id);
    const zig = v.id === 1372 && (chain.has(node.id) && chain.has(id) || best.has(node.id) && best.has(id));
    const color = zig ? node.left === id ? 'inc' : 'dec' : inc.has(node.id) && inc.has(id) ? 'inc' : dec.has(node.id) && dec.has(id) ? 'dec'
      : chain.has(node.id) && chain.has(id) && v.id === 298 ? 'inc' : chain.has(node.id) && chain.has(id) && v.id === 250 ? 'good' : best.has(node.id) && best.has(id) ? 'good' : '';
    const broken = v.check?.passed === false && (v.id === 298 && v.current === id ||
      v.id === 549 && v.check.child === id && Math.abs(v.check.value - v.check.parentValue) !== 1 || v.id === 687 && v.check.child === id);
    const flow = v.id === 979 ? v.flows.find(item => item.child === id) : null;
    if (flow && flow.coins) {
      const start = flow.balance > 0 ? { x: b.x, y: b.y - 25 } : { x: a.x, y: a.y + 25 };
      const end = flow.balance > 0 ? { x: a.x, y: a.y + 25 } : { x: b.x, y: b.y - 25 };
      return `<g data-tdp-flow="${id}" class="${flow.parent === v.current && v.event === 'flow' ? 'tdp-flow-active' : ''}"><path class="tdp-flow-line" marker-end="url(#tdp-flow-head)" d="M${start.x} ${start.y}L${end.x} ${end.y}"/><text class="tdp-flow-label" x="${(a.x + b.x) / 2 + 8}" y="${(a.y + b.y) / 2}" text-anchor="middle">${flow.coins} ●</text></g>`;
    }
    return `<path class="${broken ? 'bad dashed' : color}" d="M${a.x} ${a.y + 22}L${b.x} ${b.y - 22}"/>${v.id === 1372 ? `<text class="tdp-edge-label ${node.left === id ? 'inc' : 'dec'}" x="${(a.x + b.x) / 2 + (node.left === id ? -8 : 8)}" y="${(a.y + b.y) / 2}" text-anchor="middle">${node.left === id ? 'L' : 'R'}</text>` : ''}`;
  })).join('');
  const tree = v.nodes.length ? `<div class="tdp-scroll ${treeDfsFit.enabled ? 'fitted' : ''}" tabindex="0" role="region" aria-label="${t('Cây minh họa', 'Tree diagram')}"><svg viewBox="0 0 ${width} ${height}" style="width:${width}px;height:${treeDfsFit.enabled ? 'auto' : `${height}px`}" role="img" aria-label="${t('Nút hiện tại, stack và kết quả tốt nhất', 'Current node, stack, and best result')}"><defs><marker id="tdp-flow-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path class="tdp-flow-tip" d="M0 0L10 5L0 10Z"/></marker></defs>${edges}${v.nodes.map(node => {
    const p = positions.get(node.id), s = v.summaries[node.id];
    const badge = witnesses.get(node.id) || (s ? v.id === 250 ? s.uni ? '✓' : '✕' : v.id === 333 ? s.bst ? `✓ ${s.size}` : '✕ BST' : v.id === 549 ? `i:${s.inc} d:${s.dec}`
      : v.id === 687 ? `↩ ${s.gain}` : v.id === 979 ? `↩ ${signed(s.balance)}` : v.id === 1372 ? `L:${s.goLeft} R:${s.goRight}` : `len ${s.length}` : '');
    const coins = v.id === 979 ? `<g class="tdp-coins">${Array.from({ length: Math.min(node.value, 5) }, (_, i) => `<circle cx="${(i - (Math.min(node.value, 5) - 1) / 2) * 9}" cy="33" r="3.5"/>`).join('')}${node.value > 5 ? '<text text-anchor="middle" y="39">…</text>' : ''}</g>` : '';
    return `<g data-tdp-node="${node.id}" class="${best.has(node.id) || counted.has(node.id) ? 'best' : ''} ${active.has(node.id) ? 'waiting' : ''} ${node.id === v.current ? 'current' : ''} ${s?.bst === false || s?.uni === false || witnesses.has(node.id) ? 'invalid' : ''}" transform="translate(${p.x} ${p.y})"><title>${esc(node.value)} · ${node.id}</title><circle r="22"/><text text-anchor="middle" y="5"${String(node.value).length > 3 ? ` style="font-size:${String(node.value).length > 6 ? 7 : 10}px"` : ''}>${esc(node.value)}</text>${coins}<text class="tdp-badge" text-anchor="middle" y="${v.id === 979 ? 53 : 42}">${badge}</text></g>`;
  }).join('')}</svg></div>` : `<div class="tdp-empty">∅</div>`;
  const pythonValue = value => value === true ? 'True' : value === false ? 'False' : value;
  const returnValue = Array.isArray(v.returned) ? `(${v.returned.map(pythonValue).join(', ')})` : pythonValue(v.returned);
  const returned = v.returned !== null ? `<div class="tdp-return"><b>↩</b><code>${esc(returnValue)}</code>${v.id === 333 ? '<small>(BST, min, max, size)</small>' : v.id === 549 ? '<small>(inc, dec)</small>' : v.id === 1372 ? '<small>(go_left, go_right)</small>' : ''}</div>` : v.event === 'return' ? '<div class="tdp-return">↩ None</div>' : '';
  const stack = `<div class="tdp-stack"><small>DFS stack</small>${v.frames.map((frame, index) => `<span class="${index === v.frames.length - 1 ? 'current' : ''}">dfs(${esc(frame.value === null ? '∅' : frame.value)})${v.id === 298 ? `<small>len ${esc(frame.length)}</small>` : ''}</span>`).join('<i>→</i>')}</div>`;
  const unit = v.id === 250 ? t('cây con đồng giá trị', 'univalue subtrees') : v.id === 979 ? t('lượt di chuyển', 'moves') : [687, 1372].includes(v.id) ? t('cạnh', 'edges') : v.id === 333 ? t('BST lớn nhất', 'Largest BST') : t('Chuỗi dài nhất', 'Longest chain');
  const answerPicture = v.id === 333 ? `<span>root = ${esc(val(v.bestRoot))}</span>` : v.id === 250 || v.id === 979 ? '' : v.id === 1372 ? zigPath(v.bestIds) : path(v.bestIds, 'good');
  host.innerHTML = `<section class="tdp-viz" data-tdp-id="${v.id}">${controls}<div class="tdp-legend"><span class="current">● ${t('Đang xét', 'Current')}</span>${v.id !== 979 ? `<span class="good">● ${v.id === 250 ? t('Đã đếm', 'Counted') : t('Tốt nhất', 'Best')}</span><span class="bad">┄ ${t('Không hợp lệ', 'Invalid')}</span>` : `<span>${t('Giá trị nút = xu ban đầu', 'Node value = initial coins')}</span>`}</div><div class="tdp-layout"><section class="tdp-panel">${tree}</section>${focus}</div>${returned}${stack}<section class="tdp-answer"><b>${v.final ? '✓' : '★'} ${v.best}</b><small>${unit}</small>${answerPicture}</section><code class="tdp-source">${esc(v.source)}</code></section>`;
  const jump = index => { if (index >= 0) { stepIndex = index; renderStep(); } };
  host.querySelectorAll?.('button').forEach(button => button.addEventListener('keydown', event => {
    if (event.key === ' ' || event.key === 'Enter') event.stopPropagation();
  }));
  host.querySelectorAll?.('[data-tdp-preset]').forEach(button => button.addEventListener('click', () => {
    $('arrInput').value = presets[Number(button.dataset.tdpPreset)][1]; runViz();
  }));
  host.querySelectorAll?.('[data-tdp-event]').forEach(button => button.addEventListener('click', () => jump(later(button.dataset.tdpEvent))));
  host.querySelector?.('[data-tdp-fit]')?.addEventListener('click', () => { treeDfsFit.enabled = !treeDfsFit.enabled; renderStep(); });
  const box = host.querySelector?.('.tdp-scroll'), current = box?.querySelector(`[data-tdp-node="${v.current}"]`);
  const centerCurrent = () => {
    if (!current) return;
    const rect = current.getBoundingClientRect(), bounds = box.getBoundingClientRect();
    if (rect.left < bounds.left || rect.right > bounds.right) box.scrollLeft += rect.left - bounds.left - (bounds.width - rect.width) / 2;
    if (rect.top < bounds.top || rect.bottom > bounds.bottom) box.scrollTop += rect.top - bounds.top - (bounds.height - rect.height) / 2;
  };
  centerCurrent();
  if (box && typeof ResizeObserver !== 'undefined') {
    treeDfsResizeObserver = new ResizeObserver(centerCurrent);
    treeDfsResizeObserver.observe(box);
  }
}
