function renderAutocomplete642View(step) {
  const view = step.autocompleteView;
  if (!view) return;
  const host = $("treeView");
  const t = (vi, en) => lang === "vi" ? vi : en;
  const show = (value) => String(value ?? "").replace(/ /g, "␠");
  const build = view.phase === "init";
  const commit = view.phase === "commit";
  const pending = view.stage === "read-char";
  const delivered = view.stage === "return-hot" || view.stage === "done" && Boolean(view.prefix);
  const history = view.history || [];
  // Reconstruct only the visual topology from this snapshot, not future input.
  const topology = new Map([["", { prefix: "", char: "⌂", children: [] }]]);
  history.forEach(({ sentence }) => {
    let prefix = "";
    for (const char of sentence) {
      const next = prefix + char;
      if (!topology.has(next)) {
        topology.set(next, { prefix: next, char, children: [] });
        topology.get(prefix).children.push(next);
      }
      prefix = next;
    }
  });
  const width = Math.max(220, (host.clientWidth || 506) - 26);
  const maxColumns = Math.max(3, Math.min(7, Math.floor(width / 64)));
  const fullPath = view.triePath || [{ prefix: "", char: "ROOT", found: true }];
  const path = fullPath.length > 6
    ? [...fullPath.slice(0, 2), { fold: true, char: "⋯", prefix: null, hidden: fullPath.length - 5 }, ...fullPath.slice(-3)]
    : fullPath;
  const levels = [];
  const edges = [];
  const changed = new Set((view.cacheUpdates || []).filter((update) => update.changed).map((update) => update.prefix));
  let previous = null;
  const addLevel = (items, parent) => {
    const positioned = items.map((item, index) => ({ ...item, x: width * (index + 1) / (items.length + 1), y: 32 + levels.length * 66 }));
    if (parent) positioned.forEach((item) => edges.push({ from: parent, to: item }));
    levels.push(positioned);
    return positioned;
  };
  const siblings = (prefix, selected) => {
    const children = [...(topology.get(prefix)?.children || [])].sort();
    if (selected !== undefined && !children.includes(selected)) children.push(selected);
    const visible = children.slice(0, maxColumns);
    if (selected !== undefined && !visible.includes(selected)) visible[visible.length - 1] = selected;
    // Omitted siblings stay explicit without shrinking the node labels.
    if (children.length > maxColumns) {
      if (visible.at(-1) === selected) visible[visible.length - 2] = null;
      else visible[visible.length - 1] = null;
    }
    return visible.map((value) => value === null
      ? { fold: true, char: `+${children.length - maxColumns + 1}`, prefix: null }
      : { prefix: value, char: [...value].at(-1), found: topology.has(value) });
  };
  path.forEach((item, index) => {
    let items = [item];
    if (index > 0 && !item.fold && !path[index - 1].fold) items = siblings(path[index - 1].prefix, item.prefix);
    items = items.map((candidate) => ({ ...candidate, active: candidate.prefix === item.prefix && !candidate.fold, current: index === path.length - 1 && candidate.prefix === item.prefix && !candidate.fold }));
    const row = addLevel(items, previous);
    previous = row.find((node) => node.active) || row[0];
  });
  const lastPrefix = path.at(-1)?.prefix ?? "";
  const target = pending ? lastPrefix + view.inputChar : undefined;
  const children = siblings(lastPrefix, target).map((node) => ({ ...node, pending: pending && node.prefix === target }));
  if (children.length) addLevel(children, previous);
  const height = levels.length * 66 + 14;
  const graph = `<svg class="ac642-diagram" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(t("Trie: đường prefix được tô màu; dấu × là cạnh không tồn tại", "Trie: highlighted prefix path; × marks a missing edge"))}">
    ${edges.map(({ from, to }) => `<path class="ac642-link ${to.pending ? "pending" : to.found === false ? "missing" : to.active ? "walked" : ""}${from.fold || to.fold ? " folded" : ""}" d="M${from.x},${from.y + 19} C${from.x},${from.y + 38} ${to.x},${to.y - 38} ${to.x},${to.y - 19}"/>`).join("")}
    ${levels.flat().map((node) => {
      const hotSize = node.fold || node.found === false ? 0 : Math.min(3, history.filter(({ sentence }) => sentence.startsWith(node.prefix)).length);
      return `<g class="ac642-dot ${node.fold ? "fold" : ""} ${node.active ? "walked" : ""} ${node.current ? "current" : ""} ${node.pending ? "pending" : ""} ${node.found === false ? "missing" : ""} ${changed.has(node.prefix) ? "updated" : ""}" transform="translate(${node.x},${node.y})" data-prefix="${escapeHtml(node.prefix ?? "")}"><title>${escapeHtml(node.fold ? node.hidden ? `${node.hidden} ${t("node ẩn", "hidden nodes")}` : node.char : node.prefix || "root")}</title><circle r="19"/><text text-anchor="middle" dominant-baseline="central">${escapeHtml(node.char === "ROOT" ? "⌂" : show(node.char))}</text>${node.found === false && !node.pending ? '<text class="ac642-cross" x="23" y="-13">×</text>' : ""}${node.current && node.found !== false ? '<path class="ac642-pointer" d="M-5,-30 L5,-30 L0,-24Z"/>' : ""}${!node.fold && node.found !== false ? Array.from({ length: 3 }, (_, i) => `<rect class="ac642-hot-dot ${i < hotSize ? "filled" : ""}" x="${-12 + i * 9}" y="25" width="6" height="4" rx="1"/>`).join("") : ""}</g>`;
    }).join("")}
  </svg>`;
  const stream = view.typedChars || [];
  const start = Math.max(0, view.charIndex - 4);
  const end = Math.min(stream.length, Math.max(9, view.charIndex + 5));
  const keys = `${start ? '<span class="ac642-key">⋯</span>' : ""}${stream.slice(start, end).map((char, offset) => {
    const index = start + offset;
    return `<span class="ac642-key ${index < view.charIndex || view.phase === "done" ? "done" : ""} ${index === view.charIndex ? "active" : ""} ${char === "#" ? "commit" : ""}" aria-label="${escapeHtml(`${index}: ${show(char)}`)}">${escapeHtml(show(char))}</span>`;
  }).join("")}${end < stream.length ? '<span class="ac642-key">⋯</span>' : ""}`;
  const prefix = build ? view.sentenceBeingAdded : view.prefix;
  const rankItems = build ? history.slice(0, 8) : view.stage === "done" && !view.prefix ? history.slice(0, 3) : view.candidates || [];
  const maxCount = Math.max(1, ...rankItems.map((item) => item.count));
  const rankRows = rankItems.map((item, index) => {
    const matched = !build && prefix && item.sentence.startsWith(prefix) ? prefix : "";
    const phrase = `${matched ? `<mark>${escapeHtml(matched)}</mark>` : ""}${escapeHtml(item.sentence.slice(matched.length))}`;
    return `<li class="ac642-suggestion ${delivered ? "delivered" : ""}" data-sentence="${escapeHtml(item.sentence)}"><b>${index + 1}</b><div><span>${phrase}</span><i class="ac642-meter" style="--ac642-fill:${Math.max(0, item.count / maxCount * 100)}%"></i></div><strong>${escapeHtml(item.count)}×</strong></li>`;
  }).join("");
  const save = (build && view.sentenceBeingAdded || commit) ? `<div class="ac642-save ${view.stage === "commit-detect" ? "pending" : ""}"><span>${escapeHtml(view.sentenceBeingAdded || view.committedSentence)}</span><b>${view.countBefore ?? 0}</b><i>→</i><strong>${view.stage === "commit-detect" ? "+1" : view.countAfter ?? 0}</strong>${view.stage === "commit-reset" ? '<i>↩ ⌂</i>' : ""}</div>` : "";
  const status = build ? "🌱" : commit ? "#" : pending ? "⌨" : delivered ? "✓" : "→";
  const output = commit || view.stage === "done" && !view.prefix ? "↩ []" : delivered ? view.suggestions.length ? `↩ ${view.suggestions.length}` : "↩ []" : "⏳";
  host.innerHTML = `<section class="ac642-picture" aria-label="${t("Mô phỏng Trie autocomplete", "Autocomplete Trie simulation")}">
    <header><span>#642 · TRIE</span><b>${status} ${build ? t("Dựng cây", "Build") : commit ? t("Lưu", "Save") : t("Gợi ý", "Suggest")}</b></header>
    <div class="ac642-search-picture"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></svg><strong>${escapeHtml(show(prefix)) || "∅"}</strong><span>${view.nodeFound ? "●" : "×"}</span></div>
    ${!build ? `<div class="ac642-keys" aria-label="${t("Ký tự nhập", "Input stream")}">${keys}</div>` : ""}
    ${save}
    ${graph}
    <div class="ac642-cache-arrow ${delivered ? "delivered" : ""}">${build ? "↓" : `<i class="ac642-cache-source">${view.nodeFound ? escapeHtml(show([...lastPrefix].at(-1) || "⌂")) : "×"}</i> →`} <span>${build ? t("Lịch sử", "History") : "hot[3]"}</span> <b>${build ? `${history.length}` : output}</b></div>
    <ol class="ac642-suggestions">${rankRows || `<li class="ac642-empty-picture ${view.nodeFound ? "" : "missing"}">${view.nodeFound ? "∅" : "× → []"}</li>`}</ol>
    <footer><span>● prefix</span><span>▰ hot[3]</span><span>␠ ${t("dấu cách", "space")}</span><span>×↓ · A–Z↑</span></footer>
  </section>`;
  // Redraw coordinates at the actual container width, keeping labels readable
  // after an iPhone/iPad resize instead of scaling a desktop SVG down.
  host._autocomplete642Step = step;
  host._autocomplete642Width = host.clientWidth;
  if (typeof ResizeObserver !== "undefined" && !host._autocomplete642Observer) {
    host._autocomplete642Observer = new ResizeObserver(() => {
      if (host.querySelector(".ac642-picture") && host.clientWidth !== host._autocomplete642Width) renderAutocomplete642View(host._autocomplete642Step);
    });
    host._autocomplete642Observer.observe(host);
  }
}
