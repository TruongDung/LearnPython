function renderPrefixScores2416Pictures(step) {
  const v = step.prefixScore2416View;
  const t = (vi, en) => lang === "vi" ? vi : en;
  const esc = value => escapeHtml(String(value));
  const summary = v.mode === "summary", final = Boolean(step.final), scoring = v.phase !== "build";
  const byId = new Map(v.nodes.map(node => [node.id, node]));
  const path = new Set(v.path), summed = new Set(v.terms.map(term => term.id));
  const positions = new Map();
  let leaves = 0;
  function layout(id, depth) {
    const children = byId.get(id).children.filter(child => byId.has(child));
    const xs = children.map(child => layout(child, depth + 1));
    const x = xs.length ? (xs[0] + xs.at(-1)) / 2 : leaves++;
    positions.set(id, { x, depth }); return x;
  }
  if (v.nodes.length) layout(v.nodes[0].id, 0);
  const width = Math.max(320, leaves * 110), depth = Math.max(0, ...v.nodes.map(node => node.prefix.length));
  const height = Math.max(180, 85 + depth * 80);
  const xy = id => { const p = positions.get(id); return { x: leaves <= 1 ? width / 2 : 48 + p.x * (width - 96) / (leaves - 1), y: 40 + p.depth * 80 }; };
  const edges = v.nodes.filter(node => node.parent !== null && byId.has(node.parent)).map(node => {
    const a = xy(node.parent), b = xy(node.id);
    return `<path class="p2416-edge${path.has(node.id) && !final ? " active" : ""}${summed.has(node.id) && !final ? " summed" : ""}" d="M${a.x},${a.y + 22} L${b.x},${b.y - 23}"/>`;
  }).join("");
  const nodes = v.nodes.map(node => {
    const p = xy(node.id), current = !final && v.current === node.id;
    return `<g class="p2416-node${current ? " current" : ""}${path.has(node.id) && !final ? " path" : ""}${summed.has(node.id) && !final ? " summed" : ""}${v.transition?.id === node.id ? " changed" : ""}" transform="translate(${p.x},${p.y})"><title>${esc(node.prefix || "root")} · ${node.parent === null ? t("không cộng", "not scored") : `count = ${node.count}`}</title><circle r="23"/><text class="p2416-char" text-anchor="middle" y="6">${esc(node.ch)}</text>${node.parent !== null ? `<circle class="p2416-badge" cx="20" cy="-20" r="12"/><text class="p2416-count" text-anchor="middle" x="20" y="-16">${node.count ?? "—"}</text><text class="p2416-prefix" text-anchor="middle" y="42">${esc(node.prefix)}</text>` : ""}</g>`;
  }).join("");
  const word = v.wordIndex === null ? null : v.words[v.wordIndex];
  const currentNode = byId.get(v.current);
  const prefixes = word ? [...word].map((_, index) => {
    const prefix = word.slice(0, index + 1), node = v.nodes.find(node => node.prefix === prefix);
    return `<div class="p2416-prefix-card${node?.id === v.current ? " current" : ""}${node && summed.has(node.id) ? " summed" : ""}"><code>${esc(prefix)}</code><b>${node?.count ?? "—"}</b><small>${node && summed.has(node.id) ? "✓" : ""}</small></div>`;
  }).join('<span class="p2416-plus">+</span>') : "";
  const wordCards = v.words.map((word, index) => `<button type="button" data-p2416-word="${index}" ${summary ? "disabled" : ""} aria-label="${t("Xem điểm", "Inspect score")} ${esc(word)} · #${index}" class="${index === v.wordIndex ? "current" : ""}${index < v.answer.length ? " scored" : ""}"><small>#${index}</small><code>${esc(word)}</code><b>${v.answer[index] ?? "—"}</b></button>`).join("");
  let work = "";
  if (!final && v.phase === "build" && currentNode && currentNode.parent !== null) {
    const transition = v.transition?.id === currentNode.id;
    work = `<div class="p2416-counter"><div><code>${esc(currentNode.prefix)}</code><span>count</span><b>${transition ? `${v.transition.before} → ` : ""}${currentNode.count}</b></div><div class="p2416-members">${currentNode.members.map(index => `<span><small>#${index}</small>${esc(v.words[index])}</span>`).join("") || '<span class="p2416-empty">∅</span>'}</div></div>`;
  } else if (!final && scoring && word) {
    const waiting = ["score-word", "score-root"].includes(v.event);
    work = `<div class="p2416-prefix-strip">${prefixes}</div><div class="p2416-total"><code>total</code><span>${v.terms.length ? v.terms.map(term => term.count).join(" + ") : "0"}</span><span>=</span><b>${waiting ? "…" : v.total ?? "…"}</b></div>`;
    if (currentNode?.prefix && currentNode.members.length) work += `<div class="p2416-sharing"><code>${esc(currentNode.prefix)}</code><span>←</span>${currentNode.members.map(index => `<span>#${index} ${esc(v.words[index])}</span>`).join("")}</div>`;
  }
  const results = final && !summary ? `<div class="p2416-results">${v.wordResults.map((result, index) => `<div><code>${esc(result.word)}</code><div>${result.terms.map(term => `<span><small>${esc(term.prefix)}</small><b>${term.count}</b></span>`).join('<i>+</i>')}<i>=</i><strong>${result.total}</strong></div><small>#${index}</small></div>`).join("")}</div>` : "";
  $("treeView").innerHTML = `<section class="p2416-viz" aria-label="${t("2416 · Điểm prefix trên Trie", "2416 · Prefix scores on a Trie")}">
    <header><button type="button" data-p2416-phase="build" ${summary ? "disabled" : ""} class="${!scoring ? "active" : ""}">1 · count +1</button><button type="button" data-p2416-phase="score" ${summary ? "disabled" : ""} class="${scoring && !final ? "active" : ""}">2 · ${t("Cộng điểm", "Sum scores")}</button><button type="button" data-p2416-phase="done" class="${final ? "active" : ""}">3 · ${t("Kết quả", "Result")}</button></header>
    ${summary ? `<div class="p2416-summary">${t("Dữ liệu lớn: đã tính đầy đủ kết quả. Cây chỉ xem trước. Dùng ≤8 từ và tổng ≤40 ký tự để debug từng dòng.", "Large input: all results computed; tree is a preview. Use ≤8 words and ≤40 total characters for line-by-line debug.")}</div>` : `<div class="p2416-line"><b>L${v.line}</b><code>${esc(v.source)}</code><small>${esc(v.scope)}</small></div>`}
    <div class="p2416-words">${wordCards}</div>
    <div class="p2416-tree" aria-label="Trie"><svg viewBox="0 0 ${width} ${height}" style="width:${width}px;min-width:${Math.min(width, 650)}px" role="img" aria-label="${t("Trie với số từ dùng chung mỗi prefix", "Trie counting words sharing each prefix")}">${edges}${nodes}${v.nodes.length ? "" : `<text class="p2416-empty" text-anchor="middle" x="${width / 2}" y="90">∅</text>`}</svg>${v.pending ? `<div class="p2416-pending">◌ ${esc(v.pending.prefix || "root")}<small>${t("đang tạo", "initializing")}</small></div>` : ""}</div>
    <div class="p2416-legend"><span><b class="p2416-count-dot">2</b> ${t("2 từ dùng chung prefix", "2 words share this prefix")}</span><span>root · ${t("không cộng", "not scored")}</span></div>
    ${work}${results}
    ${final ? `<div class="p2416-answer" role="status">answer = <strong>[${v.answer.slice(0, 8).join(", ")}${v.answer.length > 8 ? ", …" : ""}]</strong> ✓</div>` : ""}
    <div class="p2416-examples"><button type="button" data-p2416-example="sample">${t("Mẫu", "Sample")}</button><button type="button" data-p2416-example="duplicates">${t("Từ trùng", "Duplicate words")}</button><button type="button" data-p2416-example="single">${t("Một từ", "One word")}</button></div>
  </section>`;
  const jump = index => { if (index >= 0) { stopPlay(); stepIndex = index; renderStep(); } };
  $("treeView").querySelectorAll("[data-p2416-phase]").forEach(button => button.addEventListener("click", () => {
    const phase = button.dataset.p2416Phase;
    jump(phase === "done" ? steps.length - 1 : steps.findIndex(step => step.prefixScore2416View?.phase === phase));
  }));
  $("treeView").querySelectorAll("[data-p2416-word]").forEach(button => button.addEventListener("click", () => {
    jump(steps.findIndex(step => step.prefixScore2416View?.event === "append" && step.prefixScore2416View.wordIndex === Number(button.dataset.p2416Word)));
  }));
  $("treeView").querySelectorAll("[data-p2416-example]").forEach(button => button.addEventListener("click", () => {
    const kind = button.dataset.p2416Example;
    $("arrInput").value = JSON.stringify(kind === "duplicates" ? ["ab", "ab", "a"] : kind === "single" ? ["abcd"] : ["abc", "ab", "bc", "b"]);
    runViz();
  }));
}
