class Maximin1102Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) {
    this.host = host; this.language = language; this.escape = escape;
  }
  t(vi, en) { return this.language === "vi" ? vi : en; }
  coord(cell) { return cell ? `(${cell[0]}, ${cell[1]})` : "?"; }
  best(value) { return value === null ? "?" : value === -1 ? "—" : value; }

  grid(v) {
    const size = 82, left = 30, top = 25;
    const path = new Set(v.path.map(([r, c]) => `${r}:${c}`));
    const cells = v.cells.flatMap((row, ri) => row.map((cell, ci) => {
      const onPath = path.has(`${cell.r}:${cell.c}`), bottleneck = onPath && cell.value === v.answer;
      const current = !v.final && v.current?.[0] === cell.r && v.current?.[1] === cell.c;
      const probe = v.probe?.inside && v.probe.r === cell.r && v.probe.c === cell.c;
      const endpoint = cell.r === 0 && cell.c === 0
        ? v.height === 1 && v.width === 1 ? "S / T" : "S"
        : cell.r === v.height - 1 && cell.c === v.width - 1 ? "T" : "";
      const classes = [v.capacity === null ? "unknown" : cell.allowed ? "allowed" : "blocked", cell.queued ? "queued" : "", cell.settled ? "settled" : "", current ? "current" : "", probe ? "probe" : "", onPath ? "path" : "", bottleneck ? "bottleneck" : ""].filter(Boolean).join(" ");
      const barWidth = v.maxValue ? Math.max(2, 54 * cell.value / v.maxValue) : 0;
      return `<g class="mm1102-cell ${classes}" transform="translate(${left + ci * size},${top + ri * size})" data-r="${cell.r}" data-c="${cell.c}" data-best="${cell.best ?? "?"}">
        <title>${this.coord([cell.r, cell.c])} · value=${cell.value} · best=${this.best(cell.best)}</title>
        <rect class="surface" x="5" y="5" width="72" height="72" rx="12"/>
        <rect class="halo" x="1" y="1" width="80" height="80" rx="15"/>
        <rect class="bar-track" x="14" y="63" width="54" height="5" rx="2"/>
        <rect class="bar" x="14" y="63" width="${barWidth}" height="5" rx="2"/>
        <text class="endpoint" x="13" y="20">${endpoint}</text>
        <text class="value ${String(cell.value).length > 6 ? "long" : ""}" x="41" y="42">${cell.value}</text>
        <text class="best" x="41" y="57">b: ${this.best(cell.best)}</text>
      </g>`;
    })).join("");
    const axes = v.cols.map((col, i) => `<text class="axis" x="${left + i * size + 41}" y="15">${i && col > v.cols[i - 1] + 1 ? "…" : ""}${col}</text>`).join("")
      + v.rows.map((row, i) => `<text class="axis" x="13" y="${top + i * size + 43}">${i && row > v.rows[i - 1] + 1 ? "…" : ""}${row}</text>`).join("");
    const links = v.path.slice(1).map((cell, i) => {
      const previous = v.path[i], r1 = v.rows.indexOf(previous[0]), c1 = v.cols.indexOf(previous[1]), r2 = v.rows.indexOf(cell[0]), c2 = v.cols.indexOf(cell[1]);
      if ([r1, c1, r2, c2].includes(-1)) return "";
      const dx = cell[1] - previous[1], dy = cell[0] - previous[0];
      return `<path class="mm1102-path-link" d="M ${left + c1 * size + 41 + dx * 34} ${top + r1 * size + 41 + dy * 34} L ${left + c2 * size + 41 - dx * 34} ${top + r2 * size + 41 - dy * 34}"/>`;
    }).join("");
    return `<section class="mm1102-card mm1102-map"><header><strong>${this.t("Tìm đường S → T", "Find a path S → T")}</strong><small>${this.t("số lớn = giá trị ô · b = best", "large number = cell value · b = best")}</small></header>
      <svg viewBox="0 0 ${left + v.cols.length * size + 7} ${top + v.rows.length * size + 7}" role="img" aria-label="${this.t("Lưới Maximin, biên heap và đường tối ưu", "Maximin grid, heap frontier and optimal path")}">${axes}${cells}${links}</svg>
      <div class="mm1102-legend"><span class="allowed">■ ≥ score</span><span class="blocked">■ &lt; score</span><span class="queued">□ heap</span><span class="settled">□ ${this.t("đã chốt", "settled")}</span><span class="current">□ ${this.t("đang xét", "current")}</span></div>
      <small>${this.t("Màu nền: đủ ngưỡng ≠ đã tới được.", "Background: meeting the threshold ≠ reached.")}${v.cropped ? ` · ${this.t("Lưới rút gọn · … là khoảng ẩn, tọa độ giữ nguyên", "Condensed grid · … marks hidden spans, coordinates preserved")}` : ""}</small></section>`;
  }

  relax(v) {
    if (!v.probe || !["bounds", "min", "compare", "update", "push"].includes(v.phase)) return "";
    const p = v.probe;
    if (!p.inside) return `<div class="mm1102-outside">${this.coord(v.current)} ↛ (${p.r}, ${p.c}) <b>✕ ${this.t("vượt biên", "out of bounds")}</b></div>`;
    const known = p.candidate !== null, improves = known && p.candidate > p.oldBest;
    return `<section class="mm1102-card"><header><strong>${this.coord(v.current)} → (${p.r}, ${p.c})</strong><small>${this.t("Nút thắt khi đi tiếp", "Bottleneck after moving")}</small></header>
      <div class="mm1102-formula"><div class="score"><small>${this.t("điểm đường hiện tại", "current path score")}</small><b>${v.capacity ?? "?"}</b><span>🛤️</span></div><strong>min</strong><div class="value"><small>${this.t("giá trị ô kế", "next cell value")}</small><b>${p.value}</b><span>▣</span></div><strong>=</strong><div class="candidate"><small>candidate</small><b>${p.candidate ?? "?"}</b><span>◆</span></div></div>
      <div class="mm1102-compare"><span>${p.candidate ?? "?"} &gt; best[${p.r}][${p.c}] = ${this.best(p.oldBest)}</span><b class="${known ? improves ? "good" : "bad" : ""}">${known ? improves ? "✓" : "✕" : "…"}</b><small>${!known ? this.t("Chờ dòng min", "Awaiting min") : !improves ? this.t("Giữ best", "Keep best") : v.phase === "push" ? this.t("best đã đổi · tiếp theo push", "best updated · push next") : this.t("Điểm tốt hơn → cập nhật", "Better score → update")}</small></div></section>`;
  }

  heap(v) {
    const sorted = v.heap.map((entry, index) => ({ entry, index })).sort((a, b) => a.entry[0] - b.entry[0] || a.entry[1] - b.entry[1] || a.entry[2] - b.entry[2]);
    return `<section class="mm1102-card"><header><strong>MAX-HEAP · ${sorted.length}</strong><small>${v.final ? this.t("Dừng tại đích", "Stopped at target") : this.t("score lớn nhất → pop", "largest score → pop")}</small></header>
      <div class="mm1102-heap">${sorted.slice(0, 8).map(({ entry: [negative, r, c], index }, i) => `<div class="${i === 0 && !v.final ? "top" : ""}" data-heap-index="${index}"><small>${i === 0 && !v.final ? "▼ POP" : "·"}</small><b>${-negative}</b><span>(${r},${c})</span></div>`).join("") || '<span class="mm1102-empty">∅</span>'}${sorted.length > 8 ? `<small>+${sorted.length - 8}</small>` : ""}</div>
      <details class="mm1102-raw"><summary>${this.t("Python heapq lưu (-score, r, c) · hình xếp theo ưu tiên", "Python heapq stores (-score, r, c) · picture ordered by priority")}</summary><code>${this.escape(JSON.stringify(v.heap))}</code></details></section>`;
  }

  proof(v) {
    if (!v.final) return "";
    const ids = v.path.length <= 16 ? v.path.map((_, i) => i) : [0, 1, 2, 3, ...Array.from({ length: 4 }, (_, i) => v.path.length - 4 + i)];
    return `<div class="mm1102-proof"><div class="good"><b>≥ ${v.answer}</b><span>S → T ✓</span></div><div class="bad"><b>≥ ${v.answer + 1}</b><span>S ↛ T ✕</span></div></div>
      <details class="mm1102-card mm1102-route" open><summary>${this.t("Đường tối ưu", "Optimal path")} · ${v.path.length} ${this.t("ô", "cells")} · min = ${v.answer}</summary><div>${ids.map((id, i) => `${i ? `<span>${id > ids[i - 1] + 1 ? "…" : "→"}</span>` : ""}<div class="${v.path[id][2] === v.answer ? "bottleneck" : ""}"><small>(${v.path[id][0]},${v.path[id][1]})</small><b>${v.path[id][2]}</b></div>`).join("")}</div><small>◆ ${this.t("Ô vàng = nút thắt của đường", "Gold cell = path bottleneck")}</small></details>`;
  }

  render(step) {
    const v = step.maximin1102View;
    if (!v) return;
    const phases = {
      size: this.t("Lấy kích thước lưới", "Read grid dimensions"), best: this.t("Khởi tạo best = -1", "Initialize best to -1"), start: this.t("Điểm xuất phát gồm cả ô S", "The starting score includes S"), seed: this.t("Đưa S vào heap", "Seed the heap with S"), directions: this.t("Chuẩn bị bốn hướng", "Prepare four directions"), while: this.t("Heap còn phần tử?", "Heap nonempty?"), pop: this.t("Lấy đường có điểm lớn nhất", "Pop the largest path score"), score: this.t("Khôi phục score từ -score", "Decode the stored negative score"), stale: this.t("Bản ghi còn khớp best?", "Does this entry match best?"), "skip-stale": this.t("Bỏ bản ghi cũ", "Skip a stale entry"), target: this.t("Đã tới đích?", "At the target?"), direction: this.t("Xét hướng tiếp theo", "Next direction"), neighbor: this.t("Tính tọa độ ô kế", "Compute next coordinates"), bounds: this.t("Ô kế nằm trong lưới?", "Is the neighbor in bounds?"), min: this.t("Đi tiếp: giữ giá trị nhỏ hơn", "Moving: keep the smaller value"), compare: this.t("Điểm mới lớn hơn best?", "Is the new score larger than best?"), update: this.t("Cập nhật best", "Update best"), push: this.t("Thêm đường tốt hơn vào heap", "Push the improved path score"), found: this.t("Nút thắt lớn nhất", "The strongest bottleneck"),
    };
    const shield = '<svg viewBox="0 0 40 44" aria-hidden="true"><path d="M20 2 36 8v13c0 10-10 17-16 21C14 38 4 31 4 21V8Z" fill="currentColor"/><path d="m12 21 6 6 11-13" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    this.host.innerHTML = `<section class="mm1102-viz" aria-label="1102 Dijkstra Maximin"><header><strong>1102 · Dijkstra MAXIMIN</strong><span>${this.t("Trước dòng", "Before line")} ${v.source.line}</span></header>
      <div class="mm1102-source"><code>${this.escape(v.source.text.trim())}</code><small>${phases[v.phase]}</small></div>
      ${v.trace.truncated ? `<div class="mm1102-notice">${this.t("Trace rút gọn", "Trace condensed")} · ${v.trace.omitted} ${this.t("dòng đã lược · đáp án tính toàn bộ", "line events omitted · complete answer computed")}</div>` : ""}
      <div class="mm1102-status"><div class="mm1102-score">${shield}<div><small>${this.t("Điểm đường đang xét", "Current path score")}</small><b>${v.capacity ?? "?"}</b></div></div><div class="mm1102-current"><small>${this.t("Ô vừa pop", "Popped cell")}</small><b>${this.coord(v.current)}</b></div></div>
      ${this.grid(v)}${this.relax(v)}${this.proof(v)}${this.heap(v)}</section>`;
  }
}

function renderMaximin1102View(step) {
  new Maximin1102Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step);
}
