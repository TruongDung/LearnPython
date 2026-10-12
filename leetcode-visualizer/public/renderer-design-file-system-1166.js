function renderFileSystem1166View(step) {
  const view = step.fileSystem1166View;
  if (!view) return;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const format = (value) => value === null ? "—" : String(value);
  const folder = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h6l3 3h9v11H3Z"/><path d="M3 10h18"/></svg>';
  const operation = view.operation;
  const nodeByPath = new Map(view.nodes.map((node) => [node.path, node]));
  const selected = new Set(view.visited);
  const visible = new Set(["/", ...view.visited]);
  // Preserve the active branch even when the directory contains many paths.
  let prefix = "";
  const parts = operation?.path.split("/").filter(Boolean) || [];
  const prefixes = parts.map((part) => { prefix += `/${part}`; if (nodeByPath.has(prefix)) visible.add(prefix); return prefix; });
  for (const node of view.nodes) { if (visible.size >= 75) break; visible.add(node.path); }
  const entries = [...visible].map((path) => ({ ...nodeByPath.get(path) }));
  const rejected = ["rejected", "not-found"].includes(view.phase);
  const placeholders = prefixes.filter((path) => !nodeByPath.has(path));
  // Only the first missing ancestor and the requested leaf are needed to show
  // why creating a deep path cannot silently create its missing parents.
  for (const path of new Set([placeholders[0], placeholders.at(-1)].filter(Boolean))) {
    entries.push({ path, parent: path.slice(0, path.lastIndexOf("/")) || "/", name: path.split("/").at(-1), depth: path.split("/").length - 1, value: operation?.name === "createPath" && path === operation.path ? operation.value : null, ghost: true });
  }
  entries.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  const rows = entries.map((node) => {
    const current = view.phase !== "done" && node.path === view.current;
    const added = view.phase === "created" && node.path === operation?.path;
    const duplicate = view.reason === "exists" && node.path === operation?.path;
    const classes = ["fs1166-node", current ? "current" : "", selected.has(node.path) ? "visited" : "", added ? "added" : "", duplicate ? "blocked" : "", node.ghost ? rejected ? "missing" : "pending" : ""].filter(Boolean).join(" ");
    const status = added ? "+" : duplicate || node.ghost && rejected ? "×" : current ? "●" : selected.has(node.path) && node.path !== "/" ? "✓" : node.ghost ? "+" : "";
    return `<article class="${classes}" style="--fs1166-depth:${node.depth}" role="listitem" title="${escapeHtml(node.path)}" aria-label="${escapeHtml(node.path)}${node.ghost ? ` · ${text("chưa có", "not stored")}` : node.value !== null ? ` = ${node.value}` : ""}"><i class="fs1166-branch" aria-hidden="true">${node.depth ? "└" : ""}</i>${folder}<strong>${escapeHtml(node.name)}</strong><b class="fs1166-value">${node.value === null ? "—" : node.value}</b><span class="fs1166-node-status">${status}</span></article>`;
  }).join("");

  const breadcrumb = `<span class="${view.current === "/" ? "active" : ""}">/</span>${parts.map((part, index) => `<i>›</i><span class="${prefixes[index] === view.current ? "active" : selected.has(prefixes[index]) ? "visited" : rejected && !nodeByPath.has(prefixes[index]) ? "missing" : ""}">${escapeHtml(part)}</span>`).join("")}`;
  const parent = operation?.path.slice(0, operation.path.lastIndexOf("/")) || "/";
  const parentExists = nodeByPath.has(parent);
  const targetNew = operation && (!nodeByPath.has(operation.path) || view.phase === "created");
  const checks = operation?.name === "createPath"
    ? `<div class="fs1166-checks"><span class="${parentExists ? "ok" : "no"}" title="${escapeHtml(parent)}">${folder}${text("Cha", "Parent")} <b>${parentExists ? "✓" : "×"}</b></span><span class="${targetNew ? "ok" : "no"}">${folder}${text("Mới", "New")} <b>${targetNew ? "+" : "×"}</b></span></div>` : "";
  const reason = {
    "missing-parent": text("Cha chưa có", "Missing parent"), "exists": text("Đã tồn tại", "Already exists"),
    "missing-path": text("Chưa tồn tại", "Missing path"), "invalid-path": text("Path không hợp lệ", "Invalid path"),
  }[view.reason] || (view.phase === "created" ? text("Đã tạo", "Created") : view.phase === "found" ? text("Giá trị", "Value") : "");
  const latest = view.outputs.at(-1) ?? null;
  const displayedResult = view.phase === "done" ? latest : view.result;
  const resultTone = displayedResult === false || displayedResult === -1 ? "no" : "ok";
  const log = view.history.map((entry) => `<li><small>${entry.index}</small><span class="fs1166-log-op">${entry.name === "createPath" ? "+" : "⌕"}</span><code title="${escapeHtml(entry.name)}(${escapeHtml(entry.path)})">${escapeHtml(entry.path || '""')}</code><b class="${entry.result === false || entry.result === -1 ? "no" : "ok"}">${format(entry.result)}</b></li>`).join("");

  $("treeView").innerHTML = `<section class="fs1166-viz" aria-label="${text("Mô phỏng Design File System", "Design File System simulation")}">
    <header class="fs1166-heading"><div><small>#1166 · TRIE</small><h3>Design File System</h3></div><output class="${resultTone}">${format(displayedResult)}</output></header>
    <nav class="fs1166-breadcrumb" aria-label="${text("Đường dẫn đang duyệt", "Active path")}">${breadcrumb}</nav>
    <div class="fs1166-layout">
      <section class="fs1166-directory"><header><strong>${folder} ${text("Cây thư mục", "Folders")}</strong><span>${view.nodes.length - 1}</span></header><div class="fs1166-tree" role="list">${rows}</div>${view.nodes.length > visible.size ? `<footer>+${view.nodes.length - visible.size} ${text("folder khác", "more folders")}</footer>` : ""}</section>
      <aside class="fs1166-side">
        <section class="fs1166-call"><header><strong>${operation?.name || (view.phase === "init" ? "FileSystem()" : text("Hoàn tất", "Complete"))}</strong><span>${view.operationIndex == null ? view.phase === "done" ? view.operationCount : 0 : view.operationIndex + 1}/${view.operationCount}</span></header><div class="fs1166-call-path">${folder}<code>${escapeHtml(operation ? operation.path || '""' : "/")}</code>${operation?.name === "createPath" ? `<b>${operation.value}</b>` : ""}</div>${checks}<div class="fs1166-result ${resultTone}"><span>${reason || "→"}</span><b>${format(view.result)}</b></div></section>
        <section class="fs1166-log"><header><strong>${text("Thao tác", "Operations")}</strong><span>+ create · ⌕ get</span></header><ol>${log || '<li class="fs1166-empty">∅</li>'}</ol></section>
      </aside>
    </div>
    <footer class="fs1166-legend"><span><i class="current"></i>${text("Đang duyệt", "Walking")}</span><span><i class="added"></i>+</span><span><i class="missing"></i>×</span>${view.omittedSteps ? `<small>${text("Trace rút gọn; kết quả đầy đủ", "Compact trace; complete results")}</small>` : ""}</footer>
  </section>`;
  const tree = $("treeView").querySelector?.(".fs1166-tree");
  const focus = tree && (tree.querySelector(".added") || tree.querySelector(".blocked") || tree.querySelector(".missing") || tree.querySelector(".current"));
  if (focus && (focus.offsetTop < tree.scrollTop || focus.offsetTop + focus.offsetHeight > tree.scrollTop + tree.clientHeight)) {
    // Follow a deep folder inside the tree without scrolling the page.
    tree.scrollTop = Math.max(0, focus.offsetTop - (tree.clientHeight - focus.offsetHeight) / 2);
  }
}
