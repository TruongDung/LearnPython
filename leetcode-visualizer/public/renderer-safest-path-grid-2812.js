"use strict";

class SafestPath2812Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) {
    this.host = host;
    this.language = language;
    this.escape = escape;
  }

  t(vi, en) { return this.language === "vi" ? vi : en; }

  coord(cell) { return cell ? `(${cell[0]},${cell[1]})` : "—"; }

  phase(v) {
    if (v.final) return 2;
    return v.mode === "path" ? 2 : ["size", "distance-init", "queue-init", "scan-row", "scan-cell", "find-thief", "mark-thief", "seed-thief"].includes(v.phase) ? 0 : 1;
  }

  grid(v) {
    const pathKey = new Set(v.path.map(([r, c]) => `${r}:${c}`));
    const pathNext = new Map(v.path.slice(0, -1).map(([r, c], index) => [`${r}:${c}`, v.path[index + 1]]));
    const currentKey = v.current ? `${v.current[0]}:${v.current[1]}` : "";
    const probeKey = v.probe?.inside ? `${v.probe.r}:${v.probe.c}` : "";
    const arrow = (cell) => {
      const next = pathNext.get(`${cell.r}:${cell.c}`);
      if (!next) return "";
      if (next[0] > cell.r) return "↓";
      if (next[0] < cell.r) return "↑";
      return next[1] > cell.c ? "→" : "←";
    };
    const cells = v.cells.flatMap((row) => row.map((cell) => {
      const key = `${cell.r}:${cell.c}`;
      const onPath = pathKey.has(key);
      const bottleneck = onPath && cell.distance === v.answer;
      const endpoint = cell.r === 0 && cell.c === 0
        ? v.size === 1 ? "S/T" : "S"
        : cell.r === v.size - 1 && cell.c === v.size - 1 ? "T" : "";
      const classes = [
        "sp2812-cell",
        cell.thief ? "thief" : "",
        cell.distance === -1 || cell.distance === null ? "unknown" : "known",
        cell.queued ? "queued" : "",
        cell.inHeap ? "in-heap" : "",
        cell.settled ? "settled" : "",
        key === currentKey && !v.final ? "current" : "",
        key === probeKey && !v.final ? "probe" : "",
        onPath ? "path" : "",
        bottleneck ? "bottleneck" : "",
      ].filter(Boolean).join(" ");
      const best = cell.best === null || cell.best === -1 ? "" : `<small>🛡${this.escape(String(cell.best))}</small>`;
      const picture = cell.thief ? '<span class="sp2812-thief" aria-hidden="true">🥷</span>' : `<strong>${cell.distance === -1 || cell.distance === null ? "·" : this.escape(String(cell.distance))}</strong>`;
      return `<div class="${classes}" style="--level:${Math.max(0, Number(cell.distance) || 0)}" aria-label="(${cell.r},${cell.c}), ${cell.thief ? this.t("tên trộm", "thief") : `${this.t("khoảng cách", "distance")} ${cell.distance}`}, best ${cell.best}">
        ${endpoint ? `<b class="sp2812-endpoint">${endpoint}</b>` : ""}
        ${picture}${v.mode === "path" && !v.final ? best : ""}
        ${onPath ? `<i class="sp2812-arrow">${arrow(cell)}</i>` : ""}
      </div>`;
    })).join("");
    return `<div class="sp2812-board-wrap">
      <div class="sp2812-board" style="--n:${v.cols.length}" role="img" aria-label="${this.t("Bản đồ khoảng cách tới tên trộm và đường an toàn", "Distance-to-thief map and safest path")}">${cells}</div>
      ${v.cropped ? `<small class="sp2812-cropped">${this.t("… lưới đã rút gọn", "… condensed grid")}</small>` : ""}
    </div>`;
  }

  action(v) {
    if (v.final) {
      return `<div class="sp2812-result"><span>🛡️</span><b>${v.answer}</b><div><strong>S → T</strong><small>${this.t("đường an toàn nhất", "safest route")}</small></div></div>`;
    }
    if (v.mode === "distance") {
      const distance = v.current ? v.cells.flat().find((cell) => cell.r === v.current[0] && cell.c === v.current[1])?.distance : null;
      return `<div class="sp2812-action wave"><span>🌊</span><div><b>${distance ?? "—"}</b><small>${this.t("lớp BFS", "BFS layer")}</small></div><i>→</i><div><b>${v.queueSize}</b><small>queue</small></div></div>`;
    }
    const nextDistance = v.probe?.inside ? v.probe.distance : null;
    return `<div class="sp2812-action route"><span>🛡️</span><div><b>${v.safe ?? "—"}</b><small>safe</small></div><i>min</i><div><b>${nextDistance ?? "—"}</b><small>next</small></div><i>=</i><div class="candidate"><b>${v.candidate ?? v.probe?.candidate ?? "—"}</b><small>candidate</small></div></div>`;
  }

  frontier(v) {
    if (v.mode !== "path" || v.final) return "";
    const entries = [...v.heap].sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
    return `<div class="sp2812-frontier" aria-label="Max heap frontier"><b>MAX-HEAP</b>${entries.slice(0, 6).map(([negative, r, c], index) => `<span class="${index === 0 ? "top" : ""}"><i>🛡</i><strong>${-negative}</strong><small>(${r},${c})</small></span>`).join("") || "<em>∅</em>"}</div>`;
  }

  proof(v) {
    if (!v.final) return "";
    return `<div class="sp2812-proof"><span class="yes"><b>🛡 ≥ ${v.answer}</b><i>S → T ✓</i></span><span class="no"><b>🛡 ≥ ${v.answer + 1}</b><i>S ↛ T ✕</i></span></div>`;
  }

  render(step) {
    const v = step.safest2812View;
    if (!v) return;
    const active = this.phase(v);
    const labels = ["THIEVES", "DISTANCE WAVES", "SAFEST PATH"];
    const phases = labels.map((label, index) => `<span class="${index < active ? "done" : index === active ? "active" : ""}"><i>${index < active ? "✓" : index + 1}</i><b>${label}</b></span>`).join("");
    const note = v.trace?.truncated ? `<div class="sp2812-notice">⋯ ${v.trace.omitted} ${this.t("bước đã lược", "steps omitted")}</div>` : "";
    this.host.innerHTML = `<section class="sp2812-viz ${v.final ? "is-final" : ""}" aria-label="2812 Find the Safest Path in a Grid">
      <div class="sp2812-phases">${phases}</div>
      ${note}
      ${this.grid(v)}
      ${this.action(v)}
      ${this.frontier(v)}
      ${this.proof(v)}
      <div class="sp2812-rule"><span>🥷</span><i>→</i><span>🌊 distance</span><i>→</i><span>🛡 maximin</span><b>O(n² log n)</b></div>
    </section>`;
  }
}

function renderSafestPath2812View(step) {
  new SafestPath2812Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step);
}
