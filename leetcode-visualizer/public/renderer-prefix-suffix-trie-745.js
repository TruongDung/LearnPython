function renderPrefixSuffix745TrieView(step) {
  const v = step.prefixSuffix745TrieView;
  const t = (vi, en) => lang === "vi" ? vi : en;
  const q = v.query;
  const pathString = q ? q.key : v.combined;
  const separator = pathString?.indexOf("{") ?? -1;
  const letters = pathString ? [...pathString].map((ch, i) => `<span class="ps745-trie-letter ${i < separator ? "prefix" : i === separator ? "separator" : "reverse"}${i === v.position ? " current" : ""}"><b>${escapeHtml(ch)}</b></span>`).join("") : "";
  const target = pathString?.[v.position] ?? null;
  const choosing = ["character", "check-edge", "create-node", "query-character", "query-check"].includes(v.event);
  const missing = v.exists === false && !v.created && (choosing || q?.result === -1);
  const current = v.path.at(-1);
  const parent = v.path.at(-2);
  const beforeNode = v.beforeVars.find(entry => entry.name === "node")?.value;
  const write = v.event === "write-index" ? `<div class="ps745-key"><span>node.index</span><div class="ps745-register"><b>${beforeNode?.index ?? -1} → ${current.index}</b></div><span class="ps745-written">✓</span></div>` : "";
  // Draw actual ancestors and direct children only. Other branches stay folded.
  const trail = v.path.map((node, i) => `<span class="ps745-trail-node${v.cursorAssigned && node.id === v.cursor ? " cursor" : ""}" data-node="${node.id}"><small>${i === 0 ? "root" : escapeHtml(node.ch)}</small><b>${node.index}</b></span>`).join('<span class="ps745-trail-arrow">→</span>');
  const children = v.children.map(child => ({ ...child, missing: false }));
  if (missing) children.push({ ch: target, id: null, index: null, missing: true });
  const columns = Math.min(5, Math.max(1, children.length));
  const height = 165 + Math.ceil(children.length / columns) * 75;
  const nodeSvg = (node, x, y, cursor = false, created = false) => `<g class="ps745-tree-node${cursor ? " cursor" : ""}${created ? " created" : ""}${node.missing ? " missing" : ""}"${node.id !== null ? ` data-tree-id="${node.id}"` : ""}><rect x="${x - 23}" y="${y - 21}" width="46" height="42" rx="12"/><text x="${x}" y="${y - 5}" class="ps745-node-id">${node.missing ? "∅" : node.id === 0 ? "root" : `#${node.id}`}</text><text x="${x}" y="${y + 12}" class="ps745-node-index">${node.missing ? "×" : node.index}</text>${cursor ? `<path class="ps745-pointer" d="M${x + 30} ${y - 7} l-8 7 8 7Z"/>` : ""}</g>`;
  const branches = children.map((child, i) => {
    const row = Math.floor(i / columns);
    const rowSize = Math.min(columns, children.length - row * columns);
    const x = 28 + (i % columns + .5) * (244 / rowSize);
    const y = 193 + row * 75;
    const edge = row === 0 ? `M150 127 V${y - 39} H${x} V${y - 21}` : `M150 127 V140 H15 V${y - 39} H${x} V${y - 21}`;
    return `<g class="ps745-branch${choosing && child.ch === target ? " chosen" : ""}${child.missing ? " missing" : ""}"><path d="${edge}"/><text x="${x}" y="${y - 27}" class="ps745-edge-char">${escapeHtml(child.ch)}</text>${nodeSvg(child, x, y, false, child.id === v.created?.id)}</g>`;
  }).join("");
  const tree = `<section class="ps745-trie-path"><header><strong>${t("Nhánh hiện tại", "Current branch")}</strong><span>${v.nodeCount} ${t("nút", "nodes")}</span></header><div class="ps745-trail" aria-label="${t("Đường từ root · số = index", "Path from root · number = index")}">${trail}</div><svg class="ps745-tree" viewBox="0 0 300 ${height}" role="img" aria-label="${t("Con trỏ node và các cạnh con", "Node pointer and child edges")}">${parent ? `<path class="ps745-parent-edge" d="M150 54 V85"/><text x="169" y="76" class="ps745-edge-char">${escapeHtml(current.ch)}</text>${nodeSvg(parent, 150, 32)}` : ""}${branches}${nodeSvg(current, 150, 106, v.cursorAssigned)}<text x="198" y="110" class="ps745-pointer-label">${v.cursorAssigned ? "node" : "root"}</text>${children.length === 0 ? '<text x="150" y="161" class="ps745-node-id">∅</text>' : ""}</svg><div class="ps745-branch-key">${missing ? `<span class="ps745-miss">${escapeHtml(target)} → ∅${q?.result === -1 ? " → -1" : ""}</span>` : v.created ? `<span>＋ ${escapeHtml(v.created.ch)} · index = -1</span>` : `<span>${t("Số = index · nhánh khác thu gọn", "Number = index · other branches folded")}</span>`}<span class="ps745-pointer-label">◀ node</span></div>${write}</section>`;
  const input = pathString ? `<section class="ps745-trie-input"><header><strong>${q ? `f('${q.pref}','${q.suff}')` : `${t("Chèn", "Insert")} · #${v.wordIndex}`}</strong><span>${q ? `f #${q.index + 1}` : `p = ${v.p}`}</span></header><div class="ps745-reversal"><span class="ps745-prefix">${q ? q.pref : v.word.slice(0, v.p)}</span><b>＋ { ＋</b><span class="ps745-suffix">${q ? q.suff : v.word} ↶ ${(q ? q.suff : v.word).split("").reverse().join("")}</span></div><div class="ps745-trie-input-scroll">${letters}${v.position === pathString.length ? '<span class="ps745-trie-end">✓</span>' : ""}</div></section>` : "";
  const words = v.words.map((word, i) => {
    const revealed = q && q.result !== null;
    const a = q && word.startsWith(q.pref);
    const b = q && word.endsWith(q.suff);
    const tiles = [...word].map((ch, j) => `<span class="ps745-letter${a && j < q.pref.length && b && j >= word.length - q.suff.length ? " both" : a && j < q.pref.length ? " prefix" : b && j >= word.length - q.suff.length ? " suffix" : ""}"><b>${ch}</b></span>`).join("");
    return `<article class="ps745-word${i === v.wordIndex ? " current" : ""}${q?.result === i ? " selected" : ""}${revealed && a && b ? " match" : ""}" data-index="${i}"><small>#${i}${q?.result === i ? " ★" : ""}</small><div class="ps745-mini-letters">${tiles}</div>${revealed ? `<span class="ps745-checks"><i class="ps745-prefix">${a ? "✓" : "×"}</i><i class="ps745-suffix">${b ? "✓" : "×"}</i></span>` : ""}</article>`;
  }).join("");
  const result = q ? `<div class="ps745-key ps745-result"><span>f #${q.index + 1}</span><span>→</span><div class="ps745-register${q.result === -1 ? " missing" : ""}"><small>${q.result === null ? "index" : q.result === -1 ? "∅" : t("index lớn nhất", "largest index")}</small><b>${q.result ?? "?"}</b></div></div>` : "";
  const outputs = v.outputs.map((value, i) => `<span><small>${i === 0 ? "init" : `f #${i}`}</small><b>${value === null ? "null" : value}</b></span>`).join("");
  $("treeView").innerHTML = `<section class="ps745-viz ps745-trie-viz" data-line="${v.line}" aria-label="${t("Mô phỏng Trie 745", "745 Trie simulation")}"><header class="ps745-heading"><h3>#745 · Trie</h3><span>${t("Dòng", "Line")} ${v.line}</span></header><div class="ps745-legend"><span class="ps745-prefix">▰ prefix</span><span class="ps745-suffix">▰ ${t("suffix đảo", "reversed suffix")}</span><span>★ ${t("index lớn nhất", "largest index")}</span></div>${input}${tree}${result}<div class="ps745-words">${words}</div>${outputs ? `<section class="ps745-output"><header>${t("Kết quả", "Results")}</header><div>${outputs}</div></section>` : ""}<details class="ps745-details"><summary>${t("Chi tiết bước", "Step details")}</summary><code>${escapeHtml(v.source.trim())}</code><p>${escapeHtml(pick(step.note))}</p></details></section>`;
}
