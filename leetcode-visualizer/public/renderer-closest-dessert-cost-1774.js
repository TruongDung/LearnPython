function renderClosestDessertCost1774View(step) {
  const view = step.dessert1774View;
  if (!view) return;
  const vi = lang === "vi";
  const text = (vietnamese, english) => vi ? vietnamese : english;
  const escape = (value) => String(value ?? "")
    .replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]);

  if (!document.getElementById("closestDessert1774Styles")) {
    const style = document.createElement("style");
    style.id = "closestDessert1774Styles";
    style.textContent = `
      .cd1774{--ink:#183047;--muted:#688094;--line:#d8e5ed;--blue:#3984c5;--green:#25835d;--orange:#d67b2b;color:var(--ink);display:grid;gap:14px;padding:18px;border:1px solid var(--line);border-radius:18px;background:linear-gradient(145deg,#f8fcff,#eef7fb);font-family:inherit}
      .cd1774 *{box-sizing:border-box}.cd1774-head,.cd1774-stats,.cd1774-branch-head,.cd1774-stage{display:flex;align-items:center;justify-content:space-between;gap:12px}
      .cd1774-head h3{margin:2px 0;font-size:1.25rem}.cd1774-head small,.cd1774-label{color:var(--muted);font-size:.74rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase}
      .cd1774-line{padding:7px 10px;border:1px solid #c6d9e6;border-radius:9px;background:#fff;font:700 .82rem ui-monospace,monospace}
      .cd1774-stats{justify-content:flex-start;flex-wrap:wrap}.cd1774-stat{min-width:116px;flex:1;padding:12px 14px;border:1px solid var(--line);border-radius:13px;background:#fff;text-align:center}
      .cd1774-stat small{display:block;color:var(--muted);font-size:.75rem}.cd1774-stat strong{display:block;margin-top:3px;font-size:1.5rem}.cd1774-stat.is-target{border-color:#9cc9e8}.cd1774-stat.is-best{border-color:#9ad2b8;background:#f3fcf7}
      .cd1774-stage{justify-content:flex-start;min-height:44px;padding:9px 12px;border-radius:11px;background:#e4f1fa;font-weight:700}.cd1774-stage-icon{font-size:1.25rem}
      .cd1774-branch{padding:13px;border:1px solid var(--line);border-radius:14px;background:#fff}.cd1774-branch-head{justify-content:flex-start;margin-bottom:10px}.cd1774-branch-head strong{font-size:.9rem}
      .cd1774-path{display:flex;align-items:stretch;gap:7px;overflow-x:auto;padding:4px 1px 8px}.cd1774-node{display:grid;align-content:center;justify-items:center;gap:4px;min-width:88px;min-height:72px;padding:8px;border:1px solid #d7e4ec;border-radius:12px;background:#f8fbfd;text-align:center}
      .cd1774-node.is-base{border-color:#9cc9e8;background:#f0f8ff}.cd1774-node.is-chosen{border-color:#8ac6a8;background:#f1fbf5}.cd1774-node.is-current{border:2px solid var(--orange);background:#fff8ef}
      .cd1774-node b{font-size:1rem}.cd1774-node small{color:var(--muted);font-size:.7rem}.cd1774-arrow{align-self:center;color:#91a7b7;font-size:1.2rem}
      .cd1774-options{display:flex;gap:5px}.cd1774-option{display:grid;place-items:center;width:29px;height:29px;border:1px solid #cbd9e2;border-radius:50%;background:#fff;color:#607789;font-size:.7rem;font-weight:800}
      .cd1774-option.is-active{border-color:#df984b;background:#fff0db;color:#9b5619;box-shadow:0 0 0 2px #f9dfc2}
      .cd1774-empty{color:var(--muted);font-size:.83rem}.cd1774-foot{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;color:var(--muted);font-size:.76rem}
      @media(max-width:560px){.cd1774{padding:12px}.cd1774-head{align-items:flex-start}.cd1774-stat{min-width:85px;padding:9px}.cd1774-stat strong{font-size:1.2rem}.cd1774-node{min-width:76px}}
    `;
    document.head.appendChild(style);
  }

  const base = view.base;
  const baseNode = `<div class="cd1774-node is-base"><small>${text("MÓN NỀN", "BASE")}</small><b>${base ?? "—"}</b><small>${text("giá", "cost")}</small></div>`;
  const toppingNodes = view.toppingCosts.map((price, index) => {
    const selected = index < view.path.length;
    const current = index === view.i;
    const count = selected ? view.path[index] : null;
    const activeChoice = current ? view.choice : null;
    const options = [0, 1, 2].map((option) => (
      `<span class="cd1774-option${activeChoice === option ? " is-active" : ""}">${option}×</span>`
    )).join("");
    const content = selected
      ? `<b>${count}× ${price}</b><small>+${count * price}</small>`
      : `<div class="cd1774-options">${options}</div><small>${price} ${text("mỗi phần", "each")}</small>`;
    const classes = `cd1774-node${selected ? " is-chosen" : ""}${current ? " is-current" : ""}`;
    return `<span class="cd1774-arrow" aria-hidden="true">→</span><div class="${classes}"><small>${text("TOPPING", "TOPPING")} ${index + 1}</small>${content}</div>`;
  }).join("");
  const branches = `${baseNode}${toppingNodes}`;
  const stageIcons = {
    initialize: "◎", "update-call": "↻", "update-nonlocal": "↗", compare: "⇄",
    "best-update": "★", "end-check": "?", "return-end": "↩", "prune-check": "✂",
    "continue-check": "⑂", pruned: "↩", "choice-loop": "⑂", "recursive-call": "↓",
    "base-loop": "●", "root-call": "↓", done: "✓",
  };
  const distance = view.cost === null || view.cost === undefined ? null : Math.abs(view.cost - view.target);
  const bestDistance = view.best === null ? null : Math.abs(view.best - view.target);
  const updateBadge = view.phase === "compare" && view.improved !== null
    ? (view.improved ? text("CẬP NHẬT", "UPDATE") : text("GIỮ best", "KEEP best"))
    : "";

  $("treeView").innerHTML = `<section class="cd1774" aria-label="${text("Trực quan hóa DFS giá món tráng miệng", "Dessert cost DFS visualization")}">
    <header class="cd1774-head"><div><small>#1774 · DFS + PRUNING</small><h3>${text("Thử các lựa chọn topping", "Explore topping choices")}</h3></div><code class="cd1774-line">L${view.line}</code></header>
    <div class="cd1774-stats">
      <div class="cd1774-stat is-target"><small>🎯 ${text("Mục tiêu", "Target")}</small><strong>${view.target}</strong></div>
      <div class="cd1774-stat"><small>🍰 ${text("Đang thử", "Current")}</small><strong>${view.cost ?? "—"}</strong><small>${distance === null ? "" : `Δ ${distance}`}</small></div>
      <div class="cd1774-stat is-best"><small>⭐ best</small><strong>${view.best ?? "∞"}</strong><small>${bestDistance === null ? "" : `Δ ${bestDistance}`}</small></div>
    </div>
    <div class="cd1774-stage"><span class="cd1774-stage-icon">${stageIcons[view.phase] || "•"}</span><span>${escape(step.title?.[lang] ?? step.title?.en ?? step.title ?? "")}</span>${updateBadge ? `<small>${updateBadge}</small>` : ""}</div>
    <section class="cd1774-branch">
      <header class="cd1774-branch-head"><strong>${text("Cây lựa chọn", "Choice path")}</strong><span class="cd1774-empty">${text("Mỗi topping: 0 / 1 / 2 phần", "Each topping: 0 / 1 / 2 portions")}</span></header>
      <div class="cd1774-path">${branches}</div>
    </section>
    <footer class="cd1774-foot"><span>${text("Gốc", "Base")}: ${base ?? "—"} · i=${view.i ?? "—"}</span><span>${text("Lời gọi DFS", "DFS calls")}: ${view.visited}${view.omitted ? ` · ${text("bước rút gọn", "steps condensed")}: ${view.omitted}` : ""}</span></footer>
  </section>`;
}
