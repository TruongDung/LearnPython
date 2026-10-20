function renderMapSum677Pictures(step) {
  const v = step.mapSum677View;
  const t = (vi, en) => lang === "vi" ? vi : en;
  const esc = value => escapeHtml(String(value));
  const summary = v.mode === "summary", final = Boolean(step.final), op = v.op;
  const inserting = op?.name === "insert", target = op?.args[0] || "";
  const byId = new Map(v.nodes.map(node => [node.id, node])), positions = new Map();
  let leaves = 0;
  function layout(id, depth) {
    const ys = byId.get(id).children.filter(id => byId.has(id)).map(child => layout(child, depth + 1));
    const y = ys.length ? (ys[0] + ys.at(-1)) / 2 : leaves++;
    positions.set(id, { y, depth }); return y;
  }
  if (v.nodes.length) layout(v.nodes[0].id, 0);
  const depth = Math.max(0, ...v.nodes.map(node => node.prefix.length));
  const width = Math.max(360, 95 + depth * 82), height = Math.max(165, leaves * 90);
  const xy = id => { const p = positions.get(id); return { x: 40 + p.depth * 82, y: leaves <= 1 ? height / 2 : 45 + p.y * (height - 90) / (leaves - 1) }; };
  const path = new Set(final ? [] : v.path), updated = new Set(final ? [] : v.updated);
  const currentNode = byId.get(v.current);
  const missing = !inserting && target && ["sum-check", "missing-return"].includes(v.event)
    && currentNode && !currentNode.children.some(id => byId.get(id)?.ch === target[v.position]);
  const edges = v.nodes.filter(node => node.parent !== null && byId.has(node.parent)).map(node => {
    const a = xy(node.parent), b = xy(node.id);
    return `<path class="m677-edge${path.has(node.id) ? " active" : ""}${updated.has(node.id) ? " updated" : ""}" d="M${a.x + 22},${a.y} L${b.x - 23},${b.y}"/>`;
  }).join("");
  const nodeHtml = v.nodes.map(node => {
    const p = xy(node.id), current = !final && v.current === node.id;
    return `<g class="m677-node${current ? " current" : ""}${updated.has(node.id) ? " updated" : ""}${v.change?.id === node.id ? " changed" : ""}" transform="translate(${p.x},${p.y})"><title>${esc(node.prefix || "root")} · Σ=${node.score}</title><circle r="22"/>${node.isKey ? '<circle class="m677-terminal" r="26"/>' : ""}<text class="m677-letter" text-anchor="middle" y="5">${esc(node.ch)}</text>${node.parent !== null ? `<rect class="m677-badge" x="8" y="-38" width="46" height="22" rx="8"/><text class="m677-score" text-anchor="middle" x="31" y="-23">Σ${node.score}</text><text class="m677-prefix" text-anchor="middle" y="43">${esc(node.prefix)}</text>` : ""}</g>`;
  }).join("");
  const brokenEdge = missing ? (() => { const p = xy(v.current); return `<path class="m677-missing-edge" d="M${p.x + 23},${p.y} L${p.x + 60},${p.y - 22}"/><text class="m677-missing-letter" x="${p.x + 61}" y="${p.y - 25}">${esc(target[v.position])} ×</text>`; })() : "";
  const operationCards = v.operations.map((operation, index) => {
    const result = v.outputs.find(output => output.opIndex === index);
    return `<button type="button" data-m677-op="${index}" ${summary ? "disabled" : ""} class="${index === v.opIndex ? "current" : ""}${index < v.opIndex ? " done" : ""}" aria-label="${t("Lệnh", "Operation")} ${index + 1}: ${esc(operation.label)}"><small>${index + 1}</small><code>${esc(operation.label)}</code>${result ? `<b>${result.value}</b>` : ""}</button>`;
  }).join("");
  const tokens = [...target].map((char, index) => `<span class="${index === v.position ? "current" : index < v.position ? "done" : ""}${index === v.position && missing ? "missing" : ""}"><small>${index}</small><b>${char}</b></span>`).join("");
  const delta = inserting && v.delta !== null ? `<div class="m677-delta"><code>delta</code><div><span><small>${t("mới", "new")}</small><b>${op.args[1]}</b></span><i>−</i><span><small>${t("cũ", "old")}</small><b>${v.oldValue}</b></span><i>=</i><strong>${v.delta > 0 ? "+" : ""}${v.delta}</strong></div><small>${v.delta < 0 ? t("Giảm dọc key", "Decrease along key") : v.delta === 0 ? t("Tổng giữ nguyên", "Sums stay unchanged") : t("Tăng dọc key", "Increase along key")}</small></div>` : "";
  const change = v.change ? `<div class="m677-change"><code>Σ(${esc(currentNode?.prefix || "")})</code><b>${v.change.before}</b><span>${v.delta >= 0 ? "+" : "−"} ${Math.abs(v.delta)}</span><i>=</i><strong>${v.change.after}</strong></div>` : "";
  const matches = new Set(v.matches.map(entry => entry.key));
  const valueCards = v.values.map(entry => `<div class="${inserting && target === entry.key ? "current" : matches.has(entry.key) ? "matched" : ""}"><code>${esc(entry.key)}</code><b>${entry.value}</b></div>`).join("");
  const queryResult = op?.name === "sum" && v.result !== null ? `<div class="m677-query-result"><small>${missing ? t("Thiếu cạnh", "Missing edge") : t("Đọc Σ đã lưu", "Read cached Σ")}</small><code>sum(${esc(JSON.stringify(target))})</code><span>${v.matches.length ? v.matches.map(entry => entry.value).join(" + ") + " = " : ""}</span><b>${v.result}</b></div>` : "";
  const outputs = v.outputs.map(output => `<span><code>${esc(output.prefix)}</code><b>${output.value}</b></span>`).join("");
  $("treeView").innerHTML = `<section class="m677-viz${v.delta < 0 ? " decreasing" : ""}" aria-label="${t("677 · MapSum trên Trie", "677 · MapSum Trie")}">
    <header><strong>677 · MapSum</strong><button type="button" data-m677-finish ${!op || summary ? "disabled" : ""}>${t("Xong lệnh", "Finish operation")} ⏭</button><button type="button" data-m677-result>${t("Kết quả", "Results")}</button></header>
    ${summary ? `<div class="m677-summary">${t("Đã tính đủ kết quả; cây chỉ xem trước. Debug từng dòng với ≤12 lệnh và tổng ≤100 ký tự key/prefix.", "All results computed; tree is a preview. Full debug for ≤12 commands and ≤100 key/prefix characters.")}</div>` : v.line === null ? "" : `<div class="m677-line"><b>L${v.line}</b><code>${esc(v.source)}</code><small>${esc(v.scope)}</small></div>`}
    <div class="m677-operations">${operationCards}</div>
    ${target ? `<div class="m677-target"><code>${esc(op.label)}</code><div>${tokens}</div></div>` : ""}
    ${delta}
    <div class="m677-tree" aria-label="Trie"><svg viewBox="0 0 ${width} ${height}" style="width:${width}px;min-width:${width}px" role="img" aria-label="${t("Trie lưu tổng Σ trên từng prefix", "Trie caching Σ at each prefix")}">${edges}${nodeHtml}${brokenEdge}${v.nodes.length ? "" : `<text class="m677-empty" x="${width / 2}" y="${height / 2}" text-anchor="middle">∅</text>`}</svg>${v.pending ? `<div class="m677-pending">◌ ${esc(v.pending.prefix || "root")}<small>${t("đang tạo", "initializing")}</small></div>` : ""}</div>
    <div class="m677-legend"><span>◎ ${t("key đã gán", "assigned key")}</span><span>Σ = ${t("tổng theo prefix", "prefix total")}</span></div>
    ${change}
    <div class="m677-values"><small>self.values</small><div>${valueCards || '<span class="m677-empty">∅</span>'}</div></div>
    ${queryResult}
    <div class="m677-outputs"><small>sum →</small><div>${outputs || '<span class="m677-empty">∅</span>'}</div></div>
    ${final ? `<div class="m677-answer" role="status">sum = <b>[${v.answer.join(", ")}]</b> ✓</div>` : ""}
    <div class="m677-examples"><button type="button" data-m677-example="sample">${t("Ghi đè", "Overwrite")}</button><button type="button" data-m677-example="missing">${t("Prefix thiếu", "Missing prefix")}</button><button type="button" data-m677-example="zero">delta = 0</button></div>
  </section>`;
  const jump = index => { if (index >= 0) { stopPlay(); stepIndex = index; renderStep(); } };
  $("treeView").querySelectorAll("[data-m677-op]").forEach(button => button.addEventListener("click", () => jump(steps.findIndex(step => step.mapSum677View?.opIndex === Number(button.dataset.m677Op)))));
  $("treeView").querySelectorAll("[data-m677-finish]").forEach(button => button.addEventListener("click", () => jump(steps.findIndex(step => step.mapSum677View?.opIndex === v.opIndex && ["insert-end", "sum-return", "missing-return"].includes(step.mapSum677View.event)))));
  $("treeView").querySelectorAll("[data-m677-result]").forEach(button => button.addEventListener("click", () => jump(steps.length - 1)));
  $("treeView").querySelectorAll("[data-m677-example]").forEach(button => button.addEventListener("click", () => {
    const kind = button.dataset.m677Example;
    $("arrInput").value = kind === "missing" ? "insert(apple,3);sum(az)" : kind === "zero" ? "insert(apple,3);insert(apple,3);sum(ap)" : "insert(apple,3);sum(ap);insert(app,2);sum(ap);insert(apple,2);sum(ap)";
    runViz();
  }));
  const graph = $("treeView").querySelector(".m677-tree");
  if (graph && positions.has(v.current) && !final) { const p = xy(v.current); graph.scrollLeft = Math.max(0, p.x - graph.clientWidth / 2); graph.scrollTop = Math.max(0, p.y - graph.clientHeight / 2); }
  const rail = $("treeView").querySelector(".m677-operations"), selected = rail?.querySelector(".current");
  if (selected) rail.scrollLeft = Math.max(0, selected.offsetLeft - rail.clientWidth / 2 + selected.clientWidth / 2);
}
