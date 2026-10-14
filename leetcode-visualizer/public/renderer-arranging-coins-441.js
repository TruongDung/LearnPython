class ArrangingCoins441Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) {
    this.host = host; this.language = language; this.escape = escape;
  }
  t(vi, en) { return this.language === "vi" ? vi : en; }
  coin(x, y, filled) {
    return `<g class="ac441-coin ${filled ? "filled" : "empty"}" transform="translate(${x} ${y})"><circle r="9"/>${filled ? '<circle class="ac441-inner" r="5.5"/><path d="M0 -4 V4"/>' : '<path d="M-3 -3 L3 3 M3 -3 L-3 3"/>'}</g>`;
  }
  staircase(v) {
    if (v.candidateRows === null) {
      return `<div class="ac441-loose" role="img" aria-label="${v.n} ${this.t("đồng xu", "coins")}">${Array.from({ length: Math.min(v.n, 16) }, () => '<span class="ac441-loose-coin" aria-hidden="true"></span>').join("")}${v.n > 16 ? '<span>…</span>' : ""}</div>`;
    }
    const largest = Math.max(...v.picture.map(p => p.row));
    const left = largest >= 1000000 ? 100 : largest >= 1000 ? 95 : largest >= 100 ? 65 : 38;
    const slots = largest <= 12 ? largest : 9;
    const width = left + slots * 25 + 35;
    let y = 24, previous = 0;
    const rows = v.picture.map(p => {
      const gap = previous && p.row > previous + 1;
      let gapMark = "";
      if (gap) { gapMark = `<text class="ac441-gap" x="${left + 25}" y="${y}">⋮</text>`; y += 27; }
      previous = p.row;
      const indices = p.row <= 12 ? Array.from({ length: p.row }, (_, i) => i) : [0, 1, 2, 3, p.row - 4, p.row - 3, p.row - 2, p.row - 1];
      let slot = 0, last = -1;
      const marks = indices.map(i => {
        let omission = "";
        if (last >= 0 && i > last + 1) { omission = `<text class="ac441-gap" x="${left + slot * 25}" y="${y + 4}">…</text>`; slot++; }
        last = i;
        return omission + this.coin(left + slot++ * 25, y, i < p.filled);
      }).join("");
      const row = `<g class="ac441-row${p.missing ? " missing" : " complete"}${p.incomplete ? " next-row" : ""}" data-row="${p.row}" data-filled="${p.filled}" data-missing="${p.missing}"><text class="ac441-row-number" x="${left - 22}" y="${y + 4}" text-anchor="end">${p.row}</text>${marks}<text class="ac441-row-state" x="${width - 15}" y="${y + 4}">${p.missing ? "✕" : "✓"}</text></g>`;
      y += 37;
      return gapMark + row;
    }).join("");
    const summary = this.t("Xu vàng đã xếp; vòng rỗng là xu còn thiếu. Số bên trái là số thứ tự hàng.", "Gold coins are placed; empty circles are missing coins. Left labels are row numbers.");
    return `<svg class="ac441-staircase" width="${width}" height="${y}" viewBox="0 0 ${width} ${y}" role="img" aria-label="${summary}">${rows}</svg>${v.cropped ? `<small>${this.t("Hàng lớn rút gọn · số đếm giữ nguyên", "Large rows condensed · counts remain exact")}</small>` : ""}`;
  }
  range(v) {
    const values = v.n <= 16 ? Array.from({ length: v.n + 1 }, (_, i) => i) : [...new Set([0, v.lo, v.hi, v.mid, v.lo === null ? null : v.lo - 1, v.hi === null ? null : v.hi + 1, v.n])].filter(k => Number.isInteger(k) && k >= 0 && k <= v.n).sort((a, b) => a - b);
    let previous = -1;
    const boxes = values.map(k => {
      const gap = previous >= 0 && k > previous + 1 ? '<span class="ac441-range-gap">…</span>' : ""; previous = k;
      const state = v.final ? k <= v.answer ? "fits" : "over" : v.lo !== null && k < v.lo ? "fits" : v.hi !== null && k > v.hi ? "over" : "unknown";
      const active = v.final ? k === v.answer : k === v.mid;
      const label = v.final && k === v.answer ? "✓" : k === v.mid ? "mid" : k === v.lo && k === v.hi ? "lo=hi" : k === v.lo ? "lo" : k === v.hi ? "hi" : "·";
      return `${gap}<div class="ac441-count ${state}${active ? " selected" : ""}" data-rows="${k}"><small>${label}</small><b>${k}</b><span>${state === "fits" ? "✓" : state === "over" ? "✕" : "?"}</span></div>`;
    }).join("");
    return `<section class="ac441-card"><header><strong>${this.t("Tìm số hàng lớn nhất", "Find the largest row count")}</strong><small>[${v.lo ?? "?"}, ${v.hi ?? "?"}]</small></header><div class="ac441-range">${boxes}</div>${v.nextLo !== undefined ? `<div class="ac441-shrink">[${v.lo}, ${v.hi}] → <b>[${v.nextLo}, ${v.nextHi}]</b> · ${v.phase === "keep" ? this.t("giữ mid", "keep mid") : this.t("bỏ mid", "discard mid")}</div>` : ""}${v.phase === "mid" ? `<small class="ac441-mid-hint">${this.t("mid làm tròn lên ↑", "mid rounds upward ↑")}</small>` : ""}</section>`;
  }
  render(step) {
    const v = step.arrangingCoins441View; if (!v) return;
    const phases = { init: this.t("Bắt đầu", "Start"), while: this.t("Kiểm tra khoảng", "Check the range"), mid: this.t("Chọn số hàng", "Choose a row count"), calculate: this.t("Tính số xu cần", "Count coins needed"), compare: this.t("Đủ xu không?", "Enough coins?"), keep: this.t("Thử nhiều hàng hơn", "Try more rows"), discard: this.t("Thử ít hàng hơn", "Try fewer rows"), result: this.t("Các hàng đầy đủ", "Complete rows") };
    const needed = v.final ? v.used : v.needed;
    const count = needed !== null ? `<div class="ac441-budget"><span>${this.t("Cần", "Need")}<b>${needed}</b></span><strong>${v.final || v.feasible ? "≤" : ">"}</strong><span>${this.t("Có", "Have")}<b>${v.n}</b></span><strong class="${v.final || v.feasible ? "good" : "bad"}">${v.final || v.feasible ? "✓" : "✕"}</strong></div>` : "";
    const proof = v.final ? `<div class="ac441-proof"><div class="good"><b>${v.answer} ${this.t("hàng", "rows")}</b><span>${v.used} ≤ ${v.n} ✓</span></div><div class="bad"><b>${v.answer + 1} ${this.t("hàng", "rows")}</b><span>${v.nextNeeded} > ${v.n} ✕</span></div></div><div class="ac441-remainder">${this.t("Còn", "Remaining")} <b>${v.remaining}</b> ${this.t("xu · hàng kế cần", "coins · next row needs")} <b>${v.answer + 1}</b> → ${this.t("thiếu", "missing")} <b>${v.missingNext}</b></div>` : "";
    const detail = !v.final && v.needed !== null ? `<div class="ac441-difference">${v.feasible ? this.t("Còn", "Remaining") : this.t("Thiếu", "Missing")} ${v.feasible ? v.difference : v.difference.slice(1)} ${this.t("xu", "coins")}</div>` : "";
    this.host.innerHTML = `<section class="ac441-viz" aria-label="441 Arranging Coins"><header><strong>441 · ${phases[v.phase]}</strong><span>${this.t("Trước dòng", "Before line")} ${v.source.line}</span></header><div class="ac441-source"><code>${this.escape(v.source.text.trim())}</code></div>${this.range(v)}<section class="ac441-card ac441-picture"><header><strong>${v.candidateRows === null ? `n = ${v.n}` : `${v.final ? "✓ " : ""}${v.candidateRows} ${this.t("hàng", "rows")}`}</strong><small>${v.final ? this.t("Hàng thiếu không tính", "Incomplete row does not count") : `n = ${v.n}`}</small></header>${this.staircase(v)}${count}${detail}</section>${proof}</section>`;
  }
}
function renderArrangingCoins441View(step) {
  new ArrangingCoins441Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step);
}
