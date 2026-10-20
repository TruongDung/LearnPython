function renderWordDictionary211View(step) {
  const v = step.wordDictionary211View;
  const t = (vi, en) => lang === "vi" ? vi : en;
  const esc = value => escapeHtml(String(value));
  const searching = v.phase === "search";
  const active = new Set(v.path), failed = new Set(v.failed), matched = new Set(v.matched);
  const positions = new Map();
  let leaf = 0;
  const byId = new Map(v.nodes.map(node => [node.id, node]));
  function layout(id, depth) {
    const node = byId.get(id);
    const xs = node.children.map(child => layout(child, depth + 1));
    const x = xs.length ? (xs[0] + xs.at(-1)) / 2 : leaf++;
    positions.set(id, { x, y: depth });
    return x;
  }
  if (v.nodes.length) layout(v.nodes[0].id, 0);
  const depth = Math.max(0, ...v.nodes.map(node => node.prefix.length));
  const width = Math.max(280, leaf * 95), height = Math.max(180, (depth + 1) * 72 + 12);
  const xy = id => {
    const p = positions.get(id);
    return { x: leaf <= 1 ? width / 2 : 45 + p.x * (width - 90) / (leaf - 1), y: 40 + p.y * 72 };
  };
  const edges = v.nodes.filter(node => node.parent !== null).map(node => {
    const a = xy(node.parent), b = xy(node.id);
    const state = matched.has(node.id) ? " matched" : active.has(node.id) ? " active" : failed.has(node.id) ? " failed" : "";
    return `<path class="w211-edge${state}" d="M${a.x},${a.y + 20} L${b.x},${b.y - 22}"/>`;
  }).join("");
  const circles = v.nodes.map(node => {
    const p = xy(node.id);
    const state = node.id === v.current && !step.final ? " current" : matched.has(node.id) ? " matched" : failed.has(node.id) ? " failed" : active.has(node.id) ? " active" : "";
    return `<g class="w211-node${state}" transform="translate(${p.x},${p.y})"><title>${esc(node.prefix || "root")}${node.isWord ? " · " + t("cuối từ", "word end") : ""}</title><circle r="22"/>${node.isWord ? '<circle class="w211-terminal" r="27"/><text class="w211-star" x="22" y="-24">★</text>' : ""}<text class="w211-letter" text-anchor="middle" y="5">${esc(node.ch)}</text>${node.isWord ? `<text class="w211-prefix" text-anchor="middle" y="42">${esc(node.prefix)}</text>` : ""}</g>`;
  }).join("");
  const searchIndex = step.final ? v.pattern.length : v.i;
  const word = searching ? v.pattern : v.words[v.wordIndex] || "";
  const addNode = byId.get(v.current);
  const addIndex = v.pending ? Math.max(0, v.pending.prefix.length - 1) : addNode?.prefix.length ?? 0;
  const tokenIndex = searching ? searchIndex : ["add-char", "add-check", "create", "children-init", "end-init"].includes(v.event) ? addIndex : Math.max(0, addIndex - 1);
  const tokens = [...word].map((ch, index) => `<span class="w211-token${ch === "." ? " wildcard" : ""}${index === tokenIndex && !step.final ? " current" : index < tokenIndex || step.final ? " consumed" : ""}"><small>${index}</small><b>${ch}</b>${ch === "." ? '<em>?</em>' : ""}</span>`).join("");
  const branchItems = v.branches.length ? v.branches : step.final ? v.branchLog : [];
  const branches = branchItems.map(branch => `<span class="w211-branch${branch.result === true ? " success" : branch.result === false ? " failure" : branch.active ? " current" : ""}"><b>${esc(branch.ch)}</b><small>${branch.result === true ? "✓" : branch.result === false ? "×" : branch.active ? "↓" : "○"}</small></span>`).join("");
  const stack = v.stack.map((frame, index) => `<span class="${index === v.stack.length - 1 ? "current" : ""}"><code>${esc(frame.node)}</code><b>i=${frame.i}</b></span>`).join('<span class="w211-stack-arrow">→</span>');
  const wordList = v.words.map((word, index) => `<span class="${index < v.completed || searching ? "done" : index === v.wordIndex ? "current" : ""}">${esc(word)}${index < v.completed || searching || index === v.wordIndex && v.event === "mark-end" ? " ★" : ""}</span>`).join("");
  const result = step.final ? `<div class="w211-result ${v.answer ? "success" : "failure"}" role="status"><b>${v.answer ? "✓ True" : "× False"}</b>${v.answer ? `<code>${esc(v.nodes.filter(node => matched.has(node.id)).sort((a, b) => a.prefix.length - b.prefix.length).at(-1)?.prefix || "")}</code>` : ""}</div>` : v.result !== null ? `<div class="w211-return ${v.result ? "success" : "failure"}">${v.result ? "✓ True" : "× False"}${v.event === "backtrack" ? " ↩ " + t("thử nhánh kế", "next branch") : ""}</div>` : "";
  $("treeView").innerHTML = `<section class="w211-viz" aria-label="${t("211 · Thêm và tìm từ trong Trie", "211 · Trie word dictionary")}">
    <header><button type="button" data-w211-jump="build" class="${searching ? "" : "active"}">1 · addWord</button><button type="button" data-w211-jump="search" class="${searching && !step.final ? "active" : ""}">2 · search</button><button type="button" data-w211-jump="result" class="${step.final ? "active" : ""}">3 · ${t("Kết quả", "Result")}</button></header>
    <div class="w211-line"><b>L${v.line}</b><code>${esc(v.source)}</code><small>${esc(v.scope)}</small></div>
    <div class="w211-word-list">${wordList}</div>
    <div class="w211-task"><code>${esc(v.operation)}</code><div class="w211-tokens">${tokens || '<span class="w211-empty">∅</span>'}</div>${searching ? `<small><b>.</b> → ${t("đúng 1 ký tự", "exactly 1 letter")}</small>` : ""}</div>
    <div class="w211-graph" aria-label="Trie"><svg viewBox="0 0 ${width} ${height}" style="width:${width}px" role="img" aria-label="${t("Cây Trie hiện tại", "Current Trie")}">${edges}${circles}${v.nodes.length ? "" : `<text x="${width / 2}" y="85" text-anchor="middle" class="w211-empty">∅</text>`}</svg>${v.pending ? `<div class="w211-pending"><span>◌ ${esc(v.pending.ch)}</span><small>${t("đang khởi tạo", "initializing")}</small></div>` : ""}</div>
    <div class="w211-legend"><span class="current">● ${t("đang xét", "current")}</span><span class="success">◎ ★ ${t("cuối từ", "word end")}</span><span class="failure">× ${t("nhánh sai", "failed branch")}</span></div>
    ${branches ? `<div class="w211-branch-list"><b>.</b><span>→</span>${branches}</div>` : ""}
    ${searching ? `<div class="w211-stack"><small>DFS</small><div>${stack || '<span class="w211-empty">∅</span>'}</div></div>` : ""}
    ${result}
    <div class="w211-examples"><button type="button" data-w211-example="backtrack">↩ ${t("Thử nhánh sai", "Failed branch")}</button><button type="button" data-w211-example="prefix">★ ${t("Prefix chưa đủ", "Prefix is not enough")}</button><button type="button" data-w211-example="dots">. .</button></div>
  </section>`;
  $("treeView").querySelectorAll("[data-w211-example]").forEach(button => button.addEventListener("click", () => {
    const kind = button.dataset.w211Example;
    $("arrInput").value = kind === "backtrack" ? "bat,dad,mad" : kind === "prefix" ? "bad" : "bad,dad,mad";
    document.querySelector('[data-param="search"]').value = kind === "prefix" ? "ba" : kind === "dots" ? "b.." : ".ad";
    runViz();
  }));
  $("treeView").querySelectorAll("[data-w211-jump]").forEach(button => button.addEventListener("click", () => {
    const phase = button.dataset.w211Jump;
    const index = phase === "result" ? steps.length - 1 : steps.findIndex(item => item.wordDictionary211View?.phase === phase);
    if (index < 0) return;
    stopPlay(); stepIndex = index; renderStep();
  }));
}
