class DirectorySize9023Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) {
    this.host = host;
    this.language = language;
    this.escape = escape;
  }

  t(vi, en) { return this.language === "vi" ? vi : en; }
  pathName(path) { return path === "fo://" ? path : path.slice(5).split("/").at(-1); }
  canonical(path) { return path?.replace(/\/+$/, "") ?? null; }

  icon(kind, extraClass = "") {
    const shapes = {
      folder: '<path d="M3 6h6l3 3h9v11H3Z"/><path d="M3 10h18"/>',
      file: '<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v5h4M9 12h6M9 16h6"/>',
      video: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 8 6 4-6 4Z"/>',
      audio: '<path d="M10 17V5l10-2v12M10 9l10-2"/><ellipse cx="7" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>',
      search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
    };
    return '<svg class="ds9023-icon ' + extraClass + '" viewBox="0 0 24 24" aria-hidden="true">' + (shapes[kind] || shapes.file) + '</svg>';
  }

  fileKind(path) {
    return /\.(mp4|mkv|mov|webm)$/i.test(path) ? "video" : /\.(mp3|wav|ogg)$/i.test(path) ? "audio" : "file";
  }

  // Reserve positions from the input paths so building the Trie never shifts existing nodes.
  layout(view) {
    const planned = new Map([["fo://", { path: "fo://", parent: null, depth: 0 }]]);
    const include = (path) => {
      let parent = "fo://";
      path.slice(5).split("/").forEach((part, i) => {
        const current = parent === "fo://" ? parent + part : parent + "/" + part;
        if (!planned.has(current)) planned.set(current, { path: current, parent, depth: i + 1 });
        parent = current;
      });
    };
    view.files.forEach(([, path]) => include(path));
    view.nodes.filter((node) => node.path !== "fo://").forEach((node) => include(node.path));
    if (view.missing) include(view.missing);
    const children = new Map();
    planned.forEach((node) => {
      if (!children.has(node.parent)) children.set(node.parent, []);
      children.get(node.parent).push(node);
    });
    let leaf = 0;
    const place = (node) => {
      const branches = (children.get(node.path) || []).sort((a, b) => a.path.localeCompare(b.path));
      branches.forEach(place);
      node.x = branches.length ? (branches[0].x + branches.at(-1).x) / 2 : 64 + leaf++ * 126;
      node.y = 12 + node.depth * 94;
    };
    place(planned.get("fo://"));
    const width = Math.max(280, leaf * 126 + 2);
    const offset = (width - (leaf * 126 + 2)) / 2;
    planned.forEach((node) => { node.x += offset; });
    return { nodes: planned, width, height: 88 + Math.max(...[...planned.values()].map((node) => node.depth)) * 94 };
  }

  breadcrumbs(path, visited = []) {
    if (!path || path === "fo://") return '<span class="ds9023-crumb">fo://</span>';
    let current = "fo://";
    return path.slice(5).split("/").map((part, i) => {
      current = i === 0 ? current + part : current + "/" + part;
      return '<span class="ds9023-crumb ' + (visited.includes(current) ? "visited" : "") + '" title="' + this.escape(current) + '">' + this.escape(part) + '</span>';
    }).join('<i aria-hidden="true">›</i>');
  }

  tree(view, query) {
    const plan = this.layout(view);
    const entries = view.nodes.map((node) => ({ ...node }));
    if (view.missing) entries.push({ path: view.missing, name: this.pathName(view.missing), parent: view.current, total: 0, fileIndex: null, ghost: true });
    const present = new Set(entries.map((node) => node.path));
    const matched = new Set(view.matched);
    const visited = new Set(view.visited);
    const links = entries.filter((node) => node.parent && present.has(node.parent)).map((node) => {
      const point = plan.nodes.get(node.path);
      const parent = plan.nodes.get(node.parent);
      const state = node.ghost ? "missing" : node.path === view.current && !view.final ? "current" : view.method === 2 && visited.has(node.path) && !view.final ? "visited" : matched.has(node.fileIndex) ? "matched" : "";
      const mid = (parent.y + 66 + point.y) / 2;
      return '<path class="ds9023-edge ' + state + '" d="M ' + parent.x + ' ' + (parent.y + 66) + ' V ' + mid + ' H ' + point.x + ' V ' + point.y + '" />';
    }).join("");
    const cards = entries.map((node) => {
      const point = plan.nodes.get(node.path);
      const isFile = node.fileIndex !== null;
      const active = node.path === view.current && !view.final;
      const hit = isFile && matched.has(node.fileIndex);
      const rejected = view.method === 1 && node.fileIndex === view.fileIndex && view.match === false;
      const isQuery = node.path === query;
      const size = view.method === 1 && isQuery ? view.total : node.total;
      const status = node.ghost || rejected ? "×" : hit ? "✓" : active ? "●" : "";
      const sizeLabel = size === null || size === undefined ? (isFile ? "?" : "—") : String(size);
      const label = node.name.length > 15 ? node.name.slice(0, 13) + "…" : node.name;
      const amount = view.phase === "build" && active ? view.files[view.fileIndex][0] : null;
      return '<g class="ds9023-node ' + (isFile ? "file" : "folder") + (active ? " current" : "") + (hit ? " matched" : "") + (isQuery ? " queried" : "") + (view.method === 2 && visited.has(node.path) && !view.final ? " visited" : "") + (node.ghost || rejected ? " missing" : "") + '" data-path="' + this.escape(node.path) + '" transform="translate(' + (point.x - 54) + ' ' + point.y + ')" role="listitem" aria-label="' + this.escape(node.path + ": " + sizeLabel) + '">'
        + '<title>' + this.escape(node.path) + (size !== null && size !== undefined ? " · " + size : "") + '</title><rect class="ds9023-node-bg" width="108" height="66" rx="10"/>'
        + '<svg class="ds9023-node-icon" x="7" y="6" width="23" height="23" viewBox="0 0 24 24" aria-hidden="true">' + this.icon(isFile ? this.fileKind(node.path) : "folder").replace(/^.*?<svg[^>]*>|<\/svg>$/g, "") + '</svg>'
        + '<text class="ds9023-name" x="54" y="38">' + this.escape(label) + '</text><text class="ds9023-size" x="54" y="56" style="font-size:' + (sizeLabel.length > 10 ? "10" : sizeLabel.length > 7 ? "12" : "17") + 'px">' + sizeLabel + '</text>'
        + '<text class="ds9023-status" x="92" y="22">' + status + '</text>'
        + (amount !== null ? '<g class="ds9023-delta"><rect x="30" y="-8" width="76" height="22" rx="11"/><text x="68" y="7" style="font-size:' + (String(amount).length > 9 ? "9" : "12") + 'px">↑ +' + amount + '</text></g>' : "")
        + '</g>';
    }).join("");
    return '<div class="ds9023-tree" role="list"><svg class="ds9023-tree-svg" viewBox="0 0 ' + plan.width + " " + plan.height + '" style="min-width:' + (plan.width > 400 ? plan.width : 0) + 'px" role="img" aria-label="' + this.t("Cây thư mục và dung lượng ở bước hiện tại", "Directory tree and sizes at this step") + '">' + links + cards + '</svg></div>';
  }

  flow(view, query) {
    const inputFile = view.fileIndex === null ? null : view.files[view.fileIndex];
    if (view.phase === "build") {
      const size = inputFile[0];
      return '<div class="ds9023-flow ds9023-build">' + this.icon(this.fileKind(inputFile[1])) + '<span class="ds9023-flow-file" title="' + this.escape(inputFile[1]) + '">' + this.escape(this.pathName(inputFile[1])) + '</span><strong>+' + size + '</strong><i>→</i>' + this.icon("folder") + '<span class="ds9023-equation"><span>' + (view.total - size) + '</span><i>+</i><span>' + size + '</span><i>=</i><b>' + view.total + '</b></span></div>';
    }
    if (view.method === 1 && inputFile && view.phase === "scan") {
      return '<div class="ds9023-flow ' + (view.match ? "hit" : "miss") + '">' + this.icon(this.fileKind(inputFile[1])) + '<span class="ds9023-flow-file" title="' + this.escape(inputFile[1]) + '">' + this.escape(this.pathName(inputFile[1])) + '</span><strong>' + (view.match ? "✓" : "×") + '</strong><i>→</i><b>' + (view.match ? "+" + inputFile[0] : "+0") + '</b></div>';
    }
    if (view.method === 1 && query) {
      return '<div class="ds9023-equation ds9023-sum">' + (view.matched.map((index, i) => (i ? '<i>+</i>' : "") + '<span title="' + this.escape(view.files[index][1]) + '">' + this.icon(this.fileKind(view.files[index][1])) + '<b>' + view.files[index][0] + '</b></span>').join("") || "<span>0</span>") + '<i>=</i><output>' + view.total + '</output></div>';
    }
    if (view.method === 2 && view.phase === "result") {
      return '<div class="ds9023-read ' + (view.missing ? "miss" : "hit") + '">' + this.icon(view.missing ? "search" : "folder") + '<span title="' + this.escape(view.missing || view.current) + '">' + this.escape(this.pathName(view.missing || view.current)) + '</span><i>→</i><b>' + view.total + '</b>' + (view.missing ? '<small>× → 0</small>' : '<small>' + this.t("đọc cache", "read cache") + '</small>') + '</div>';
    }
    return "";
  }

  results(view) {
    return '<section class="ds9023-results"><header>' + this.t("Kết quả", "Results") + '</header><ol>' + view.queries.map((path, i) => {
      const amount = view.answers[i];
      const file = view.files.some(([, filePath]) => filePath === this.canonical(path));
      return '<li class="' + (i === view.queryIndex ? "active" : "") + (amount === 0 ? " zero" : "") + '" title="' + this.escape(path) + '">' + this.icon(file ? this.fileKind(path) : "folder") + '<code>' + this.escape(this.pathName(this.canonical(path))) + '</code><b>' + (amount ?? "?") + '</b></li>';
    }).join("") + '</ol></section>';
  }

  render(step) {
    const view = step.directorySize9023View;
    if (!view) return;
    const query = view.queryIndex === null ? null : this.canonical(view.queries[view.queryIndex]);
    const build = view.phase === "build";
    const focus = build ? view.files[view.fileIndex][1] : query;
    const badge = build ? this.t("↑ Lưu tổng", "↑ Cache totals") : view.final ? "✓" : view.method === 1 ? this.t("Quét file", "Scan files") : this.t("Đi theo path", "Walk path");
    this.host.innerHTML = '<section class="ds9023-viz" aria-label="' + this.t("Mô phỏng tính dung lượng file và thư mục", "File and directory size simulation") + '">'
      + '<header class="ds9023-heading"><strong>#9023 · ' + this.t("Dung lượng thư mục", "Directory size") + '</strong><span>' + (view.method === 1 ? "SCAN" : "TRIE") + '</span></header>'
      + '<div class="ds9023-query">' + this.icon(build ? this.fileKind(focus) : "search") + '<div class="ds9023-breadcrumbs">' + this.breadcrumbs(focus, view.method === 2 ? view.visited : []) + '</div></div>'
      + '<div class="ds9023-counter"><span>' + badge + '</span><output>' + (build ? "+" + view.files[view.fileIndex][0] : view.final ? "✓" : view.total ?? "?") + '</output>' + (view.method === 1 && view.fileIndex !== null ? '<small>' + (view.fileIndex + 1) + "/" + view.files.length + '</small>' : "") + '</div>'
      + this.tree(view, query) + this.flow(view, query) + this.results(view) + '</section>';
    const tree = this.host.querySelector?.(".ds9023-tree");
    const active = tree?.querySelector(".ds9023-node.missing") || tree?.querySelector(".current");
    if (active) {
      const box = active.getBoundingClientRect();
      const viewport = tree.getBoundingClientRect();
      if (box.top < viewport.top || box.bottom > viewport.bottom) tree.scrollTop += box.top - viewport.top - tree.clientHeight / 2 + box.height / 2;
      if (box.left < viewport.left || box.right > viewport.right) tree.scrollLeft += box.left - viewport.left - tree.clientWidth / 2 + box.width / 2;
    }
  }
}

// Keep the shared renderer registry independent from this problem's implementation.
function renderDirectorySize9023View(step) {
  new DirectorySize9023Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step);
}
