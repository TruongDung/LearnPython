class StringCompression1531Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) {
    this.host = host;
    this.language = language;
    this.escape = escape;
  }

  t(vi, en) { return this.language === "vi" ? vi : en; }

  chars(v) {
    const kept = new Set(v.kept || []);
    return [...v.s].map((char, index) => {
      const action = v.final ? (kept.has(index) ? "kept" : "deleted") : v.decisions[index] || "";
      const current = !v.final && index === v.i;
      const state = action || (current ? v.action : "");
      return `<span class="sc1531-char ${state}${current ? " current" : ""}" data-index="${index}"><small>${index}</small><b>${this.escape(char)}</b>${state === "deleted" ? '<i aria-hidden="true">×</i>' : ""}${current ? '<em class="sc1531-pointer" aria-hidden="true">▲</em>' : ""}</span>`;
    }).join("");
  }

  budget(v) {
    const count = Math.min(v.kLeft, 12);
    const dots = Array.from({ length: count }, () => '<i></i>').join("");
    return `<div class="sc1531-budget" aria-label="${this.t("Lượt xóa còn lại", "Deletions left")}"><strong>k</strong><span>${dots}</span><b>${v.kLeft}</b></div>`;
  }

  run(v) {
    let nextRun = "";
    try { nextRun = JSON.parse(v.nextRun || '""'); } catch (_error) { nextRun = ""; }
    const run = v.last ? `${v.last}${v.count > 1 ? v.count : ""}` : "∅";
    const threshold = v.last && [1, 9, 99].includes(v.count) ? "+1" : "";
    return `<section class="sc1531-card sc1531-run"><header><strong>${this.t("Run", "Run")}</strong><span>${threshold}</span></header><div><b>${this.escape(run)}</b>${nextRun ? `<span class="sc1531-arrow">→</span><b class="sc1531-next-run">${this.escape(nextRun)}</b>` : ""}</div></section>`;
  }

  choices(v) {
    if (v.phase !== "compare") return "";
    const get = name => v.costs.find(item => item.name === name)?.value ?? "—";
    const value = item => item === "INF" ? "∞" : this.escape(String(item));
    return `<section class="sc1531-card sc1531-choices"><div><span>×</span><small>${this.t("xóa", "delete")}</small><b>${value(get("delete"))}</b></div><i>vs</i><div><span>✓</span><small>${this.t("giữ", "keep")}</small><b>${value(get("keep"))}</b></div><strong>${this.t("min", "min")} ${value(get("return"))}</strong></section>`;
  }

  final(v) {
    const kept = new Set(v.kept || []);
    const deleted = [...v.s].filter((_, index) => !kept.has(index)).length;
    return `<section class="sc1531-result"><div class="sc1531-kept">${[...v.s].filter((_, index) => kept.has(index)).map(char => `<b>${this.escape(char)}</b>`).join("") || "<b>∅</b>"}</div><span class="sc1531-arrow">→</span><strong>${this.escape(v.compressed || "∅")}</strong><output>${v.answer}</output><small>× ${deleted}</small></section>${v.traceTruncated ? `<small class="sc1531-truncated">${this.t("Đã rút gọn bước hiển thị", "Trace shortened for display")}</small>` : ""}`;
  }

  render(step) {
    const v = step.stringCompression1531View;
    if (!v) return;
    const window = v.action === "delete" ? "delete" : v.action === "keep" ? "keep" : "";
    this.host.innerHTML = `<section class="sc1531-viz"><header class="sc1531-heading"><strong>1531 · ${this.t("Nén chuỗi", "RLE")}</strong><span>${v.i}/${v.s.length}</span></header><section class="sc1531-card sc1531-strip"><div class="sc1531-chars ${window}">${this.chars(v)}</div></section><div class="sc1531-controls">${this.budget(v)}${this.run(v)}</div>${this.choices(v)}${v.final ? this.final(v) : ""}</section>`;
  }
}

function renderStringCompression1531View(step) {
  new StringCompression1531Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step);
}
