function renderDirectorySize9023View(step) {
  const view = step.directorySize9023View;
  if (!view) return;
  const t = (vi, en) => lang === "vi" ? vi : en;
  const folder = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h6l3 3h9v11H3Z"/><path d="M3 10h18"/></svg>';
  const file = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v5h4M9 12h6M9 16h6"/></svg>';
  const query = view.queryIndex === null ? null : view.queries[view.queryIndex].replace(/\/+$/, "");
  const matched = new Set(view.matched);
  const visited = new Set(view.visited);
  const entries = view.nodes.map((node) => ({ ...node }));
  if (view.missing) entries.push({ path: view.missing, name: view.missing.split("/").at(-1), parent: view.current, depth: view.missing.slice(5).split("/").length, total: 0, fileIndex: null, ghost: true });
  entries.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  const rows = entries.map((node) => {
    const isFile = node.fileIndex !== null;
    const active = node.path === view.current && !view.final;
    const hit = isFile && matched.has(node.fileIndex);
    const checked = isFile && view.method === 1 && node.fileIndex === view.fileIndex;
    const rejected = checked && view.match === false;
    const size = view.method === 1 && node.path === query ? view.total : node.total;
    const status = node.ghost || rejected ? "×" : view.phase === "build" && active ? `↑ +${view.files[view.fileIndex][0]}` : hit ? "✓" : active ? "●" : "";
    return `<article class="ds9023-node ${active ? "current" : ""} ${hit ? "matched" : ""} ${view.method === 2 && visited.has(node.path) && !view.final ? "visited" : ""} ${node.ghost || rejected ? "missing" : ""}" style="--ds-depth:${node.depth}" title="${escapeHtml(node.path)}" role="listitem"><i class="ds9023-branch" aria-hidden="true">${node.depth ? "└" : ""}</i>${isFile ? file : folder}<strong>${escapeHtml(node.name)}</strong><b>${size ?? "—"}</b>${status ? `<span>${status}</span>` : ""}</article>`;
  }).join("");
  const amount = view.total ?? "—";
  const build = view.phase === "build";
  const inputFile = view.fileIndex === null ? null : view.files[view.fileIndex];
  const equation = view.method === 1 && query ? `<div class="ds9023-equation">${view.matched.map((index, offset) => `${offset ? '<i>+</i>' : ""}<span>${view.files[index][0]}</span>`).join("") || '<span>0</span>'}<i>=</i><b>${amount}</b></div>` : "";
  const history = view.queries.map((path, index) => `<li class="${index === view.queryIndex ? "active" : ""}">${folder}<code>${escapeHtml(path)}</code><b>${view.answers[index] ?? "—"}</b></li>`).join("");
  $("treeView").innerHTML = `<section class="ds9023-viz" aria-label="${t("Mô phỏng tính dung lượng file và thư mục", "File and directory size simulation")}">
    <header><div><small>#9023 · ${view.method === 1 ? "SCAN" : "TRIE"}</small><h3>${t("Dung lượng thư mục / file", "Directory / File Size")}</h3></div><output>${build ? `+${inputFile[0]}` : view.final ? "✓" : amount}</output></header>
    <div class="ds9023-query">${build ? file : folder}<code>${escapeHtml(build ? inputFile[1] : query || "gs://")}</code><span>${build ? "↑" : view.missing ? "× → 0" : view.method === 1 && view.fileIndex !== null ? `${view.fileIndex + 1}/${view.files.length}` : "→"}</span></div>
    <div class="ds9023-tree" role="list">${rows}</div>
    ${equation}
    ${view.method === 2 && view.phase === "result" ? `<div class="ds9023-read">${folder}<code>${escapeHtml(view.missing || view.current)}</code><i>→</i><b>${amount}</b></div>` : ""}
    <section class="ds9023-results"><header>${t("Queries", "Queries")}</header><ol>${history}</ol></section>
    <footer><span>● ${view.method === 1 ? t("đang kiểm tra", "checking") : t("đang duyệt", "walking")}</span><span>✓ + size</span><span>× 0</span>${view.method === 2 ? "<span>↑ cache</span>" : ""}</footer>
  </section>`;
  const tree = $("treeView").querySelector?.(".ds9023-tree");
  const active = tree?.querySelector(".current");
  if (active && (active.offsetTop < tree.scrollTop || active.offsetTop + active.offsetHeight > tree.scrollTop + tree.clientHeight)) tree.scrollTop = Math.max(0, active.offsetTop - tree.clientHeight / 2);
}
