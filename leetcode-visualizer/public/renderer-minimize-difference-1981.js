function renderMinimizeDifference1981View(step) {
  const view = step.minimizeDifference1981View;
  if (!view) return;
  const host = $("treeView");
  const vi = lang === "vi";
  const text = (vn, en) => vi ? vn : en;
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);

  if (!document.getElementById("minDiff1981Styles")) {
    const style = document.createElement("style");
    style.id = "minDiff1981Styles";
    style.textContent = `
      .md1981{--m1:#3186c5;--m2:#8a9cac;--m3:#e58b32;--m4:#2f9b69;color:var(--ink,#203449);display:grid;gap:12px;padding:14px;border:1px solid var(--line,#d9e4ec);border-radius:16px;background:var(--paper,#f8fbfd);font-family:inherit}
      .md1981 *{box-sizing:border-box}.md1981-head,.md1981-stats{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
      .md1981-head strong{font-size:1.03rem}.md1981-target{display:flex;align-items:center;gap:7px;padding:7px 11px;border-radius:999px;background:#fff0dc;color:#8c5319;font-weight:800}
      .md1981-target b{font-size:1.1rem}.md1981-matrix{display:grid;gap:5px}.md1981-mrow{display:flex;align-items:center;gap:5px;flex-wrap:wrap;padding:3px 5px;border-radius:10px;transition:background .15s}
      .md1981-mrow.is-active{background:#e8f3fb}.md1981-mrow.is-done{background:#edf8f1}.md1981-rowmark{width:22px;color:#728697;font-size:.7rem;text-align:center}
      .md1981-cell{display:grid;place-items:center;width:34px;height:31px;border-radius:9px;background:#e9eff4;color:#344d62;font-weight:700}
      .md1981-cell.is-pick{background:#d9f0e3;color:#17663f;box-shadow:inset 0 0 0 2px #83c99f}.md1981-mrow.is-active .md1981-cell{background:#fff}
      .md1981-mrow.is-active .md1981-cell.is-pick{background:#d9f0e3}.md1981-canvas{width:100%;min-width:0}.md1981-plot{display:block;width:100%;height:auto;overflow:visible}
      .md1981-plot text{font-size:12px;font-family:inherit;fill:currentColor}.md1981-dot-before{fill:var(--m2);opacity:.56}.md1981-dot-after{fill:var(--m1);opacity:.78}.md1981-dot-best{fill:var(--m4);stroke:#fff;stroke-width:1.5}.md1981-target-line{stroke:var(--m3);stroke-width:2}.md1981-axis{stroke:#a8b7c3;stroke-width:1}.md1981-tick{stroke:#a8b7c3;stroke-width:1}
      .md1981-key{display:flex;gap:14px;flex-wrap:wrap;color:#617586;font-size:.76rem}.md1981-key span{display:flex;align-items:center;gap:5px}.md1981-swatch{width:9px;height:9px;border-radius:50%;background:var(--m1)}.md1981-swatch.before{background:var(--m2)}.md1981-swatch.target{width:2px;height:12px;border-radius:0;background:var(--m3)}
      .md1981-math{display:flex;align-items:center;justify-content:center;gap:9px;flex-wrap:wrap;padding:8px;color:#53697b}.md1981-chip{display:grid;place-items:center;min-width:42px;height:38px;padding:0 10px;border-radius:11px;background:#e8f3fb;color:#21648f;font-size:1.05rem;font-weight:800}.md1981-chip.pick{background:#d9f0e3;color:#17663f}.md1981-op{font-size:1.1rem;font-weight:700}.md1981-answer{display:flex;align-items:center;justify-content:center;gap:9px;padding-top:2px}.md1981-answer b{font-size:1.45rem;color:#17663f}
      @media(max-width:480px){.md1981{padding:10px;gap:9px}.md1981-cell{width:29px;height:29px}.md1981-rowmark{width:18px}}
    `;
    document.head.appendChild(style);
  }

  const viewRows = view.matrix.map((row, index) => {
    const active = view.phase === "row" && index === view.rowIndex;
    const complete = view.phase === "done" || index < view.rowIndex;
    const illustrated = complete || active;
    const pick = view.path?.[index];
    return `<div class="md1981-mrow${active ? " is-active" : ""}${complete ? " is-done" : ""}"><span class="md1981-rowmark">${index + 1}</span>${row.map((value) => `<span class="md1981-cell${illustrated && value === pick ? " is-pick" : ""}">${value}</span>`).join("")}</div>`;
  }).join("");

  const domainMax = Math.max(view.target, ...view.after, ...view.before, 1);
  const plotWidth = 680;
  const left = 24;
  const right = 656;
  const x = (value) => left + (value / domainMax) * (right - left);
  const pickDots = (values) => {
    const sorted = [...new Set(values)].sort((a, b) => a - b);
    if (sorted.length <= 150) return sorted;
    const keep = new Set([sorted[0], sorted.at(-1), ...sorted.slice().sort((a, b) => Math.abs(a - view.target) - Math.abs(b - view.target)).slice(0, 30)]);
    for (let i = 0; i < 120; i++) keep.add(sorted[Math.round(i * (sorted.length - 1) / 119)]);
    return [...keep].sort((a, b) => a - b);
  };
  const prevDots = pickDots(view.before).map((value) => `<circle class="md1981-dot-before" cx="${x(value)}" cy="64" r="3.2"><title>${value}</title></circle>`).join("");
  const nextDots = pickDots(view.after).map((value) => `<circle class="${value === view.best ? "md1981-dot-best" : "md1981-dot-after"}" cx="${x(value)}" cy="42" r="3.8"><title>${value}</title></circle>`).join("");
  const ticks = [...new Set([0, Math.round(domainMax / 2), domainMax])].map((value) => `<g><line class="md1981-tick" x1="${x(value)}" x2="${x(value)}" y1="83" y2="89"/><text x="${x(value)}" y="108" text-anchor="middle">${value}</text></g>`).join("");
  const targetX = x(view.target);
  const targetMarker = `<line class="md1981-target-line" x1="${targetX}" x2="${targetX}" y1="18" y2="84"/><text x="${Math.min(right - 20, Math.max(left + 20, targetX))}" y="15" text-anchor="middle" fill="var(--m3)">🎯 ${view.target}</text>`;

  const shownPath = view.path || [];
  const prevTotal = shownPath.slice(0, -1).reduce((sum, value) => sum + value, 0);
  const chosen = shownPath.at(-1);
  const math = view.phase === "init"
    ? `<span class="md1981-chip">0</span>`
    : view.phase === "done"
      ? `<span class="md1981-chip">${view.best}</span><span class="md1981-op">−</span><span class="md1981-chip">${view.target}</span><span class="md1981-op">=</span><span class="md1981-chip pick">${view.answer}</span>`
      : `<span class="md1981-chip">${prevTotal}</span><span class="md1981-op">+</span><span class="md1981-chip pick">${chosen}</span><span class="md1981-op">→</span><span class="md1981-chip">${prevTotal + chosen}</span>`;
  const nearest = view.best === null ? null : Math.abs(view.best - view.target);
  const answer = view.phase === "done"
    ? `<div class="md1981-answer"><span>${text("Khoảng cách", "Gap")}</span><b>${view.answer}</b></div>`
    : `<div class="md1981-answer"><span>${text("Gần target nhất", "Closest")}</span><b>${view.best}</b><span>· Δ ${nearest}</span></div>`;

  host.innerHTML = `<section class="md1981" aria-label="${text("Trực quan hóa bài 1981", "Problem 1981 visualization")}" aria-live="polite">
    <header class="md1981-head"><strong>#1981 · ${text("Mỗi hàng chọn 1 số", "Pick 1 per row")}</strong><span class="md1981-target">🎯 <span>target</span><b>${view.target}</b></span></header>
    <div class="md1981-matrix" role="img" aria-label="${text("Ma trận; hàng hiện tại được tô xanh dương, lựa chọn minh họa tô xanh lá", "Matrix; current row is blue and example picks are green")}">${viewRows}</div>
    <div class="md1981-key"><span>Σ</span><span><i class="md1981-swatch before"></i>${text("Trước", "Before")}</span><span><i class="md1981-swatch"></i>${text("Sau", "After")}</span><span><i class="md1981-swatch target"></i>target</span></div>
    <div class="md1981-canvas"><svg class="md1981-plot" viewBox="0 0 ${plotWidth} 116" role="img" aria-label="${text("Các tổng có thể tạo trên trục số", "Reachable sums on a number line")}">${targetMarker}<line class="md1981-axis" x1="${left}" x2="${right}" y1="84" y2="84"/>${prevDots}${nextDots}${ticks}</svg></div>
    <div class="md1981-math" aria-label="${text("Ví dụ cộng một lựa chọn vào tổng trước", "Example adding one choice to a previous sum")}">${math}</div>
    ${answer}
  </section>`;
}
