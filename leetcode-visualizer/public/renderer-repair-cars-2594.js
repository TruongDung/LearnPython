class RepairCars2594Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) { this.host = host; this.language = language; this.escape = escape; }
  t(vi, en) { return this.language === "vi" ? vi : en; }
  car(css = "") {
    return `<svg class="rc2594-car ${css}" viewBox="0 0 40 24" aria-hidden="true"><path d="M5 12 10 3h20l5 9 3 2v6H2v-6Zm7-6-3 6h22l-3-6Z" fill="currentColor"/><circle cx="10" cy="20" r="4"/><circle cx="30" cy="20" r="4"/></svg>`;
  }
  range(v) {
    const low = v.lo ?? 0, high = v.hi ?? v.initialHi;
    const marker = v.mid === null ? 50 : high === low ? 50 : Math.max(0, Math.min(100, 100 * (v.mid - low) / (high - low)));
    return `<section class="rc2594-card"><header><strong>${this.t("Thời gian ít nhất?", "Minimum time?")}</strong><small>${this.t("phút", "minutes")}</small></header><div class="rc2594-axis"><span class="rc2594-marker" style="left:${marker}%">${v.final ? "✓" : "mid"}</span></div><div class="rc2594-bounds"><span>lo <b>${low}</b></span><span>${v.final ? "T =" : "mid"} <b>${v.final ? v.answer : v.mid ?? "?"}</b></span><span>hi <b>${high}</b></span></div>${v.nextLo !== undefined ? `<div class="rc2594-shrink"><span>[${low}, ${high}]</span><b>→</b><strong>[${v.nextLo}, ${v.nextHi}]</strong><small>${this.t("sau dòng này", "after this line")}</small></div>` : ""}</section>`;
  }
  garage(g, v) {
    const capacity = g.capacity ?? g.preview;
    const tiles = capacity === null ? '<span class="rc2594-unknown">?</span>' : capacity === 0 ? '<span class="rc2594-zero">0</span>' : Array.from({ length: Math.min(6, capacity) }, () => this.car(g.done ? "done" : "preview")).join("") + (capacity > 6 ? `<b class="rc2594-extra">+${capacity - 6}</b>` : "");
    const status = g.done ? "✓" : g.active ? "→" : "…";
    const total = capacity === null ? "?" : capacity * g.count;
    const detailed = g.active && !g.done;
    const boundary = capacity !== null && v.time !== null ? `<div class="rc2594-formula"><span>${g.rank} × ${capacity}² = ${g.rank * capacity * capacity} ≤ ${v.time} <b>✓</b></span>${detailed ? `<span>${g.rank} × ${capacity + 1}² = ${g.rank * (capacity + 1) ** 2} > ${v.time} <b>✕</b></span>` : ""}</div>` : "";
    const contribution = g.count > 1 || detailed ? `<div class="rc2594-contribution">${capacity ?? "?"} × ${g.count} = <b>${total}</b> ${this.t("xe", "cars")}${detailed ? `<span>${this.t("Sẽ cộng sau dòng này", "Add after this line")}</span>` : ""}</div>` : "";
    return `<article class="rc2594-garage${g.active ? " active" : ""}${g.done ? " counted" : ""}" data-rank="${g.rank}" data-count="${g.count}" data-done="${g.done}"><header><span>🔧 <b>rank ${g.rank}</b></span><strong>× ${g.count} ${this.t("thợ", "mechanics")}</strong><span class="rc2594-group-status">${status}</span></header><div class="rc2594-bay">${tiles}</div><div class="rc2594-per-person"><b>${capacity ?? "?"}</b> ${this.t("xe / thợ", "cars / mechanic")}</div>${boundary}${contribution}</article>`;
  }
  fleet(v) {
    const garages = v.groups.map(g => this.garage(g, v)).join("");
    return `<section class="rc2594-parallel"><header><div class="rc2594-clock"><span>◷</span><div><b>T = ${v.time ?? "?"}</b><small>${v.final ? this.t("Kiểm chứng đáp án tại lo", "Verify the answer at lo") : this.t("phút · tất cả cùng làm", "minutes · all work together")}</small></div></div><small>${v.mechanics} ${this.t("thợ", "mechanics")} · ${v.groupCount} ${this.t("nhóm rank", "rank groups")}</small></header><div class="rc2594-parallel-line" aria-hidden="true"></div><div class="rc2594-garages">${garages}</div>${v.cropped ? `<small>${this.t("Hình rút gọn · tổng tính đủ mọi nhóm", "Picture condensed · total includes every group")}</small>` : ""}</section>`;
  }
  total(v) {
    const amount = v.repaired, ready = v.complete && amount !== null, good = ready && amount >= v.cars;
    const done = amount === null ? 0 : Math.min(v.cars, amount);
    const ids = Array.from({ length: Math.min(12, v.cars) }, (_, i) => i);
    const cars = ids.map(i => this.car(i < done ? "done" : "waiting")).join("");
    return `<section class="rc2594-card rc2594-total${ready ? good ? " good" : " bad" : ""}"><header><strong>${ready ? this.t("Có thể sửa", "Can repair") : this.t("Đang cộng khả năng sửa", "Adding repair capacity")}</strong><span class="rc2594-verdict">${ready ? good ? "✓" : "✕" : "…"}</span></header><div class="rc2594-total-number"><b>${amount ?? "?"}</b><span>/ ${v.cars} ${this.t("xe cần sửa", "cars needed")}</span></div><div class="rc2594-progress" role="progressbar" aria-label="${this.t("Số xe có thể sửa", "Repair capacity")}" aria-valuemin="0" aria-valuemax="${v.cars}" aria-valuenow="${done}"><span style="width:${100 * done / v.cars}%"></span></div><div class="rc2594-target-cars">${cars}${v.cars > 12 ? `<small>+${v.cars - 12}</small>` : ""}</div><small>${v.final ? this.t("Tối thiểu · bớt 1 phút sẽ thiếu xe", "Minimum · one minute less is insufficient") : ready ? good ? this.t("Đủ xe → thử ít thời gian hơn", "Enough cars → try less time") : `${this.t("Thiếu", "Missing")} ${v.cars - amount} ${this.t("xe → cần thêm thời gian", "cars → need more time")}` : `${v.processed} / ${v.groupCount} ${this.t("nhóm đã cộng", "groups counted")}`}</small></section>`;
  }
  proof(v) {
    if (!v.final) return "";
    return `<div class="rc2594-proof"><div class="good"><b>T = ${v.answer}</b><span>${v.repaired} ≥ ${v.cars} ${this.t("xe", "cars")} ✓</span></div><div class="bad"><b>T = ${v.proofTime}</b><span>${v.previousCapacity} < ${v.cars} ${this.t("xe", "cars")} ✕</span></div></div>`;
  }
  render(step) {
    const v = step.repairCars2594View; if (!v) return;
    const phases = { group: this.t("Gộp thợ cùng rank", "Group equal ranks"), bounds: this.t("Chọn khoảng thời gian", "Set time bounds"), while: this.t("Kiểm tra khoảng", "Check range"), mid: this.t("Thử thời gian giữa", "Try the midpoint"), reset: this.t("Bắt đầu đếm xe", "Start counting cars"), "next-group": this.t("Xét nhóm thợ tiếp theo", "Next mechanic group"), add: this.t("Cộng xe nhóm này sửa được", "Add this group's capacity"), check: this.t("Đã đủ xe?", "Enough cars?"), keep: this.t("Giữ mid · thử ít phút hơn", "Keep mid · try less time"), discard: this.t("Bỏ mid · cần thêm phút", "Discard mid · need more time"), result: this.t("Thời gian tối thiểu", "Minimum time") };
    this.host.innerHTML = `<section class="rc2594-viz" aria-label="2594 Minimum Time to Repair Cars"><header><strong>2594 · ${phases[v.phase]}</strong><span>${this.t("Trước dòng", "Before line")} ${v.source.line}</span></header><div class="rc2594-source"><code>${this.escape(v.source.text.trim())}</code></div>${this.range(v)}${this.fleet(v)}${this.total(v)}${this.proof(v)}</section>`;
  }
}
function renderRepairCars2594View(step) {
  new RepairCars2594Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step);
}
