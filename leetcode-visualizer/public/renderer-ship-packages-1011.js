class ShipPackages1011Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) { this.host = host; this.language = language; this.escape = escape; }
  t(vi, en) { return this.language === "vi" ? vi : en; }
  crate(pkg, classes = "") {
    return `<span class="s1011-crate ${classes}" data-index="${pkg.index}" data-weight="${pkg.weight}"><small>#${pkg.index}</small><b>${pkg.weight}</b></span>`;
  }
  range(v) {
    const values = v.initialHi - v.initialLo <= 16 ? Array.from({ length: v.initialHi - v.initialLo + 1 }, (_, i) => v.initialLo + i)
      : [...new Set([v.initialLo, v.lo, v.mid, v.hi, v.lo === null ? null : v.lo - 1, v.hi === null ? null : v.hi + 1, v.initialHi])].filter(k => Number.isInteger(k) && k >= v.initialLo && k <= v.initialHi).sort((a, b) => a - b);
    let previous = null;
    const cells = values.map(k => {
      const gap = previous !== null && k > previous + 1 ? '<span class="s1011-gap">…</span>' : ""; previous = k;
      const state = v.final ? k < v.answer ? "small" : "fits" : v.lo !== null && k < v.lo ? "small" : v.hi !== null && k > v.hi ? "fits" : "unknown";
      const active = v.final ? k === v.answer : k === v.mid;
      const label = v.final && k === v.answer ? "✓" : k === v.mid ? "mid" : k === v.lo && k === v.hi ? "lo=hi" : k === v.lo ? "lo" : k === v.hi ? "hi" : "·";
      return `${gap}<span class="s1011-capacity ${state}${active ? " active" : ""}"><small>${label}</small><b>${k}</b><span>${state === "small" ? "✕" : state === "fits" ? "✓" : "?"}</span></span>`;
    }).join("");
    return `<section class="s1011-card"><header><strong>${this.t("Sức chứa nhỏ nhất?", "Smallest capacity?")}</strong><small>[${v.lo ?? "?"}, ${v.hi ?? "?"}]</small></header><div class="s1011-capacities">${cells}</div>${v.nextLo !== undefined ? `<div class="s1011-shrink">[${v.lo}, ${v.hi}] → <b>[${v.nextLo}, ${v.nextHi}]</b> · ${v.phase === "keep" ? this.t("giữ mid", "keep mid") : this.t("bỏ mid", "discard mid")}</div>` : ""}</section>`;
  }
  queue(v) {
    let previous = -1;
    const boxes = v.queue.map(pkg => {
      const gap = previous >= 0 && pkg.index > previous + 1 ? '<span class="s1011-gap">…</span>' : ""; previous = pkg.index;
      return gap + this.crate(pkg, `${pkg.loaded ? "loaded" : "waiting"}${pkg.active && !pkg.loaded ? " active" : ""}`);
    }).join('<span class="s1011-order-arrow" aria-hidden="true">→</span>');
    return `<section class="s1011-card"><header><strong>${this.t("Giữ đúng thứ tự", "Keep the original order")}</strong><small>${v.processed} / ${v.n} ${this.t("kiện đã xếp", "packages loaded")}</small></header><div class="s1011-queue">${boxes}</div></section>`;
  }
  boat(ship, v) {
    let previous = null;
    const boxes = ship.packages.map(pkg => {
      const gap = previous !== null && pkg.index > previous + 1 ? '<span class="s1011-gap">…</span>' : ""; previous = pkg.index;
      return gap + this.crate(pkg);
    }).join("");
    const label = `${this.t("Ngày", "Day")} ${ship.day}`;
    return `<article class="s1011-ship${ship.active ? " active" : ""}" data-day="${ship.day}" data-load="${ship.load}" data-count="${ship.count}" data-first="${ship.first ?? ""}" data-last="${ship.last ?? ""}"><header><strong>${label}</strong><small>${ship.count} ${this.t("kiện", "packages")}</small></header><div class="s1011-cargo">${boxes || '<span class="s1011-empty">∅</span>'}</div><svg class="s1011-hull" viewBox="0 0 280 50" role="img" aria-label="${this.t("Tàu chở hàng", "Cargo ship")}"><path class="boat" d="M12 5 H268 L244 36 H36 Z"/><path class="water" d="M0 43 Q12 36 24 43 T48 43 T72 43 T96 43 T120 43 T144 43 T168 43 T192 43 T216 43 T240 43 T264 43 T288 43"/><circle cx="54" cy="19" r="4"/><circle cx="76" cy="19" r="4"/></svg><div class="s1011-load-track"><span style="width:${v.capacity ? Math.min(100, ship.load / v.capacity * 100) : 0}%"></span></div><div class="s1011-load">${ship.load} / ${v.capacity ?? "?"}</div></article>`;
  }
  fleet(v) {
    const boats = v.schedule.map((ship, i) => `${i && ship.day > v.schedule[i - 1].day + 1 ? '<span class="s1011-day-gap">…</span>' : ""}${this.boat(ship, v)}`).join("");
    const attempt = v.attempt;
    let detail = "";
    if (attempt && ["check-load", "new-day"].includes(v.phase)) {
      detail = `<div class="s1011-attempt ${attempt.fits ? "good" : "bad"}"><span>${attempt.load} + 📦 ${attempt.weight}</span><b>${attempt.fits ? "≤" : ">"} ${v.capacity}</b><span>${attempt.fits ? this.t("còn chỗ ✓", "fits ✓") : this.t("sang ngày mới →", "new day →")}</span></div>`;
    } else if (attempt && v.phase === "load-package") {
      detail = `<div class="s1011-attempt"><span>load: ${attempt.load} + ${attempt.weight} → <b>${attempt.total}</b></span><small>${this.t("sau dòng này", "after this line")}</small></div>`;
    } else if (v.phase === "reset-load") {
      detail = `<div class="s1011-attempt"><span>load: ${v.locals.load} → <b>0</b></span><small>${this.t("sau dòng này", "after this line")}</small></div>`;
    }
    return `<section class="s1011-card"><header><strong>⛴ ${this.t("Sức chứa", "Capacity")} ${v.capacity ?? "?"}</strong><small>${this.t("Tải / sức chứa", "Load / capacity")}</small></header><div class="s1011-fleet">${boats || `<div class="s1011-wait">${this.t("Chưa xếp hàng", "No cargo loaded yet")}</div>`}</div>${detail}</section>`;
  }
  render(step) {
    const v = step.shipPackages1011View; if (!v) return;
    const phases = { "define-helper": this.t("Hàm đếm ngày", "Day-count helper"), bounds: this.t("Chọn khoảng", "Set bounds"), while: this.t("Kiểm tra khoảng", "Check range"), mid: this.t("Thử sức chứa", "Try capacity"), "call-helper": this.t("Bắt đầu xếp hàng", "Start loading"), "start-day": this.t("Ngày đầu tiên", "First day"), "next-package": this.t("Kiện tiếp theo", "Next package"), "check-load": this.t("Còn vừa tàu không?", "Does it fit?"), "new-day": this.t("Sang ngày mới", "Start a new day"), "reset-load": this.t("Tàu mới · tải = 0", "New ship · load = 0"), "load-package": this.t("Xếp kiện lên tàu", "Load the package"), "return-days": this.t("Đã xếp hết hàng", "All packages loaded"), "check-days": this.t("Có kịp ngày?", "Within the deadline?"), keep: this.t("Thử tàu nhỏ hơn", "Try a smaller ship"), discard: this.t("Cần tàu lớn hơn", "Need a larger ship"), result: this.t("Sức chứa tối thiểu", "Minimum capacity") };
    const ready = v.complete || v.phase === "return-days";
    const count = v.neededDays ?? v.currentDays;
    const status = count !== null ? `<div class="s1011-deadline${ready ? count <= v.days ? " good" : " bad" : ""}"><strong>${count} ${this.t("ngày", "days")} ${ready ? count <= v.days ? "≤" : ">" : "/"} ${v.days}</strong><span>${ready ? count <= v.days ? "✓" : "✕" : "…"}</span><small>${ready ? this.t("Đã kiểm tra hết kiện", "All packages checked") : this.t("Đang xếp", "Loading")}</small></div>` : "";
    const proof = v.final ? `<div class="s1011-proof"><div class="good"><b>C = ${v.answer}</b><span>${v.neededDays} ≤ ${v.days} ${this.t("ngày", "days")} ✓</span></div><div class="bad"><b>C = ${v.answer - 1}</b><span>${v.minimumPackageBound ? `< ${this.t("kiện nặng nhất", "heaviest package")} (${v.initialLo}) ✕` : `${v.smallerDays} > ${v.days} ${this.t("ngày", "days")} ✕`}</span></div></div>` : "";
    this.host.innerHTML = `<section class="s1011-viz" aria-label="1011 Capacity To Ship Packages Within D Days"><header><strong>1011 · ${phases[v.phase]}</strong><span>${this.t("Trước dòng", "Before line")} ${v.source.line}</span></header><div class="s1011-source"><code>${this.escape(v.source.text.trim())}</code><small>${v.source.scope}</small></div>${this.range(v)}${this.queue(v)}${this.fleet(v)}${status}${proof}${v.cropped ? `<small>${this.t("Hình rút gọn · giữ nguyên chỉ số và số kiện", "Picture condensed · original indices and counts preserved")}</small>` : ""}${v.truncated ? `<small>${this.t("Trace đã rút gọn · đáp án tính toàn bộ input", "Trace shortened · answer uses the complete input")}</small>` : ""}</section>`;
  }
}
function renderShipPackages1011View(step) {
  new ShipPackages1011Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step);
}
