"use strict";

function gp22Escape(value) { return escapeHtml(String(value ?? "")); }

function gp22PairPicture(path, width, small = false) {
  const pending = [], pairs = [], colors = [], bad = [];
  [...path].forEach((char, i) => {
    if (char === "(") { pending.push(i); colors[i] = i % 5; }
    else if (pending.length) { const open = pending.pop(); colors[i] = colors[open]; pairs.push([open, i]); }
    else { colors[i] = 5; bad.push(i); }
  });
  const w = width * 48 + 16, y = 78;
  const arcs = pairs.map(([a, b]) => {
    const x1 = 32 + 48 * a, x2 = 32 + 48 * b, top = y - 16 - 8 * (b - a);
    return `<path class="gp22-pair gp22-c${colors[a]}" data-pair="${a}-${b}" d="M${x1},${y} C${x1},${top} ${x2},${top} ${x2},${y}"/>`;
  }).join("");
  const slots = Array.from({ length: width }, (_, i) => `<g class="gp22-cell ${i < path.length ? `filled gp22-c${colors[i]}` : ""} ${bad.includes(i) ? "invalid" : ""}" data-position="${i}" data-char="${gp22Escape(path[i] || "")}">
    <rect x="${12 + 48 * i}" y="83" width="40" height="42" rx="9"/><text x="${32 + 48 * i}" y="113">${gp22Escape(path[i] || "·")}</text>${small ? "" : `<text class="gp22-index" x="${32 + 48 * i}" y="141">${i}</text>`}</g>`).join("");
  const unmatched = pending.map(i => `<circle class="gp22-unmatched gp22-c${colors[i]}" cx="${32 + i * 48}" cy="75" r="4"/>`).join("");
  return `<svg class="gp22-pairs" viewBox="0 ${small ? 5 : 0} ${w} ${small ? 125 : 148}" role="img" aria-label="${gp22Escape(path || "∅")}"><title>${gp22Escape(path || "∅")}</title>${arcs}${unmatched}${slots}</svg>`;
}

function gp22BalancePicture(path, n, vi) {
  const w = 360, left = 24, dx = 312 / (2 * n), dy = 60 / n, base = 82;
  let balance = 0;
  const points = [{ x: left, y: base, value: 0 }];
  [...path].forEach((char, i) => { balance += char === "(" ? 1 : -1; points.push({ x: left + (i + 1) * dx, y: base - balance * dy, value: balance }); });
  const segments = points.slice(1).map((p, i) => `<path class="gp22-walk ${p.value < 0 ? "invalid" : path[i] === "(" ? "up" : "down"}" d="M${points[i].x},${points[i].y} L${p.x},${p.y}"/><circle class="gp22-walk-dot" cx="${p.x}" cy="${p.y}" r="3"/>`).join("");
  const p = points.at(-1);
  return `<div class="gp22-balance-picture"><header><span>${vi ? "Chưa ghép · Σ path" : "Unmatched · Σ path"}</span><strong class="${balance < 0 ? "bad" : ""}">${balance}</strong></header><svg viewBox="0 0 ${w} 116" role="img" aria-label="${gp22Escape(vi ? 'Đường cân bằng của path' : 'Path balance walk')}"><path class="gp22-zero" d="M${left},${base} H342"/><text class="gp22-axis" x="9" y="86">0</text><text class="gp22-axis" x="9" y="25">${n}</text><path class="gp22-grid" d="M${left},22 H342"/>${segments}<circle class="gp22-tip ${balance < 0 ? "invalid" : ""}" cx="${p.x}" cy="${p.y}" r="6"/>${Array.from({ length: 2 * n }, (_, i) => `<text class="gp22-axis" x="${left + (i + 1) * dx}" y="110">${gp22Escape(path[i] || "·")}</text>`).join("")}</svg><footer><span class="up">( ↗ +1</span><span class="down">) ↘ −1</span><span>${vi ? "Không xuống dưới 0" : "Stay above 0"}</span></footer></div>`;
}

function gp22Tree(view, vi) {
  const nodes = view.nodes || [], positions = new Map(), children = new Map(); let leaf = 0;
  nodes.forEach(node => { if (!children.has(node.parentId)) children.set(node.parentId, []); children.get(node.parentId).push(node); });
  function place(node) {
    const kids = children.get(node.id) || [], xs = kids.map(place);
    const x = xs.length ? (xs[0] + xs.at(-1)) / 2 : 44 + leaf++ * 79;
    positions.set(node.id, { x, y: 25 + node.depth * 48 }); return x;
  }
  if (nodes.length) place(nodes[0]);
  const w = Math.max(300, leaf * 79 + 9), h = Math.max(80, ...nodes.map(node => 55 + node.depth * 48));
  const links = nodes.filter(node => node.parentId !== null).map(node => {
    const a = positions.get(node.parentId), b = positions.get(node.id);
    return `<path class="gp22-edge ${node.state === "ancestor" || node.state === "current" ? "active" : ""}" d="M${a.x},${a.y + 11} L${b.x},${b.y - 11}"/><text class="gp22-edge-label" x="${(a.x + b.x) / 2 + 6}" y="${(a.y + b.y) / 2}">${gp22Escape(node.choice)}</text>`;
  }).join("");
  const dots = nodes.map(node => { const p = positions.get(node.id); return `<g class="gp22-node ${node.state}" data-node-id="${node.id}" transform="translate(${p.x},${p.y})"><title>${gp22Escape(node.path || '∅')} · opened=${node.opened}, closed=${node.closed}</title><rect x="-35" y="-12" width="70" height="24" rx="7"/><text y="4">${gp22Escape(node.path || "∅")}</text></g>`; }).join("");
  const current = positions.get(view.currentNodeId);
  return `<section class="gp22-card"><header><span>${vi ? "Cây đã thăm" : "Visited tree"}</span><small><i class="gp22-legend current"></i>${vi ? "hiện tại" : "current"} <i class="gp22-legend solution"></i>✓</small></header><div class="gp22-tree" data-focus-x="${current?.x ?? 0}" data-focus-y="${current?.y ?? 0}">${nodes.length ? `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${gp22Escape(vi ? 'Cây quay lui với cạnh ( và )' : 'Backtracking tree with ( and ) edges')}">${links}${dots}</svg>` : '<span class="gp22-empty">∅</span>'}</div></section>`;
}

function renderGenerateParentheses22View(step) {
  const v = step.generateParentheses22View, vi = lang === "vi", bitmask = v.approach === 2;
  const path = v.path || "", n = v.n, line = step.codeLines[0], x = v.locals;
  const label = (a, b) => vi ? a : b;
  let action = "", choices = "", extra = "";
  if (bitmask) {
    const mask = v.mask, bits = Array.from({ length: 2 * n }, (_, i) => `<span class="gp22-bit ${v.index === i && !['next-mask','path-init','balance-init','valid-init','done','masks-exhausted'].includes(v.phase) ? "active" : ""}" data-bit-index="${i}"><small>${i}</small><b>${mask === null ? '·' : (mask >> i) & 1}</b><em>${mask === null ? '·' : mask & (1 << i) ? '(' : ')'}</em></span>`).join("");
    const accepted = v.check?.type === "candidate" ? v.check.allowed : null;
    action = v.check?.type === "bit" ? `<code>mask & (1 &lt;&lt; ${v.index})</code><strong>→</strong><b>${v.check.allowed ? '1 → (' : '0 → )'}</b>`
      : v.check?.type === "prefix" ? `<code>balance ≥ 0</code><strong class="${v.check.allowed ? "good" : "bad"}">${v.check.allowed ? '✓' : '✕'}</strong><b>${v.balance}</b>`
        : accepted !== null ? `<code>valid ∧ balance = 0</code><strong class="${accepted ? "good" : "bad"}">${accepted ? '✓' : '✕'}</strong>` : `<code>${gp22Escape(v.phase === 'save-result' ? path : v.phase === 'done' ? 'return result' : '1 → (   ·   0 → )')}</code>`;
    choices = `<section class="gp22-card gp22-bitmask-viz"><header><span>mask = ${mask ?? '—'}</span><small>${label('Đọc từ bit 0 →', 'Read from bit 0 →')}</small></header><div class="gp22-bits" style="--gp22-width:${2 * n}">${bits}</div><div class="gp22-bit-rules"><span>1 → ( ↗</span><span>0 → ) ↘</span><span>valid ∧ balance = 0 → ✓</span></div></section>`;
    extra = `<section class="gp22-card"><header><span>${label('10 mask vừa xét', 'Last 10 masks')}</span><small>${v.phase === 'done' ? v.totalMasks : mask ?? 0}/${v.totalMasks}</small></header><div class="gp22-mask-window">${v.inspected.map(row => `<span class="${row.accepted ? 'accepted' : ''}"><small>${row.mask}</small><code>${gp22Escape(row.path)}</code><b class="${row.accepted ? 'good' : 'bad'}">${row.accepted ? '✓' : '✕'}</b></span>`).join('') || '<span class="gp22-empty">∅</span>'}</div></section>`;
  } else {
    const check = v.check;
    choices = `<div class="gp22-branches">${[['open','(','opened',v.opened,'n',n],['close',')','closed',v.closed,'opened',v.opened]].map(([type,symbol,a,count,b,limit]) => {
      const tested = check?.type === type, allowed = tested ? check.allowed : null;
      const selected = v.phase.endsWith(`-${type}`) && /append|resume|pop/.test(v.phase);
      return `<article class="gp22-branch ${tested ? allowed ? 'allowed' : 'blocked' : ''} ${selected ? 'chosen' : ''}" data-guard="${type}"><strong>${symbol}</strong><div><code>${a} &lt; ${b}</code><b>${count ?? '—'} &lt; ${limit ?? '—'} <em>${tested ? allowed ? '✓' : '✕' : '?'}</em></b></div></article>`;
    }).join('')}</div>`;
    const f = v.stack.at(-1);
    action = v.phase.startsWith('pop-') ? `<b class="gp22-removed">${gp22Escape(v.removed)}</b><strong>↩</strong><code>${gp22Escape(path || '∅')}</code>`
      : v.phase.startsWith('append-') ? `<code>${gp22Escape(path.slice(0,-1) || '∅')}</code><strong>＋</strong><b class="gp22-added">${gp22Escape(v.added)}</b><strong>→</strong><code>${gp22Escape(path)}</code>`
        : v.phase === 'save-result' ? `<code>${gp22Escape(path)}</code><strong>→</strong><b class="good">✓ result[${v.results.length - 1}]</b>`
          : v.phase.startsWith('resume') || v.phase === 'leaf-return' ? `<strong>↩</strong><code>${label('Về frame cha', 'Return to parent')}</code>`
            : check?.type === 'complete' ? `<code>len(path) = 2n</code><strong class="${check.allowed ? 'good' : ''}">${check.allowed ? '✓' : '…'}</strong>`
              : f ? `<code>backtrack(path, ${f.opened}, ${f.closed})</code>` : `<code>${v.phase === 'done' ? 'return result' : v.phase === 'define' ? 'def backtrack(…)' : v.phase === 'root-return' ? 'backtrack([], 0, 0) ↩' : 'result = []'}</code>`;
    extra = gp22Tree(v, vi) + `<section class="gp22-card"><header><span>Call stack</span><small>${label('Mọi frame dùng chung path', 'All frames share path')}</small></header><div class="gp22-stack">${v.stack.map((frame, i) => `${i ? '<span class="gp22-arrow">→</span>' : ''}<span class="gp22-frame ${i === v.stack.length - 1 ? 'active' : ''}" data-frame-id="${frame.id}"><small>#${i}</small><b>(${frame.opened}, ${frame.closed})</b></span>`).join('') || '<span class="gp22-empty">∅</span>'}</div></section>`;
  }
  const results = `<section class="gp22-card gp22-results-card"><header><span>result</span><strong class="good">${v.results.length} ✓</strong></header><div class="gp22-results">${v.results.map((value, i) => `<figure data-result="${gp22Escape(value)}"><figcaption>#${i + 1}</figcaption>${gp22PairPicture(value, 2 * n, true)}</figure>`).join('') || '<span class="gp22-empty">∅</span>'}</div></section>`;
  $("treeView").innerHTML = `<div class="gp22-viz"><header class="gp22-heading"><span>#22 · ${bitmask ? 'Bitmask' : 'Backtracking'}</span><b>L${line} ✓</b><span>${label('Sau dòng', 'After line')} ${line}</span></header>${step.final ? results : `<div class="gp22-operation">${action}</div><section class="gp22-card"><header><span>path</span><small>${x.path ? `${x.path.length} / ${2*n}` : label('Chưa có trong scope', 'Not in scope')}</small></header><div class="gp22-illustrations">${gp22PairPicture(path, 2*n)}${gp22BalancePicture(path, n, vi)}</div></section>${choices}${results}`}${extra}</div>`;
  const tree = $("treeView").querySelector?.('.gp22-tree');
  if (tree && v.currentNodeId !== null) {
    tree.scrollLeft = Math.max(0, Number(tree.dataset.focusX) - tree.clientWidth / 2);
    tree.scrollTop = Math.max(0, Number(tree.dataset.focusY) - tree.clientHeight / 2);
  }
}
