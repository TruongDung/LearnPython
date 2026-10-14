class RestoreArray1416Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) {
    this.host = host;
    this.language = language;
    this.escape = escape;
  }
  t(vi, en) { return this.language === "vi" ? vi : en; }
  chips(parts, lastActive = false) {
    if (!parts.length) return '<span class="ra1416-empty">∅</span>';
    return parts.map((part, i) => `${i ? '<span class="ra1416-cut" aria-hidden="true">│</span>' : ""}<span class="ra1416-number${lastActive && i === parts.length - 1 ? " candidate" : ""}">${this.escape(part)}</span>`).join("");
  }
  digits(v) {
    const left = Math.max(0, Math.min(v.start - 3, v.s.length - 18));
    const right = Math.min(v.s.length, left + 18);
    const blocked = v.phase === 4;
    const row = Array.from({ length: right - left }, (_, offset) => {
      const i = left + offset;
      const candidate = v.end !== null && i >= v.start && i <= v.end;
      const state = candidate ? (blocked || v.value > v.k ? " rejected" : " candidate") : i < v.start ? " consumed" : "";
      return `<div class="ra1416-digit${state}${v.end === null && i === v.start ? " next" : ""}${i === v.start ? " cut-before" : ""}${i === v.end ? " cut-after" : ""}" data-index="${i}"><small>${i}</small><b>${v.s[i]}</b></div>`;
    }).join("");
    let status = this.t("Chọn chỗ cắt → ghép số tiếp theo", "Choose a cut → build the next number");
    if (v.end !== null) status = `${v.value} ${v.value > v.k ? ">" : "≤"} ${v.k} ${v.value > v.k ? "✕" : "✓"}`;
    else if (v.phase === 4) status = v.s[v.start] === "0" ? this.t("✕ Số mới không được bắt đầu bằng 0", "✕ A new number cannot start with 0") : this.t("✕ Chưa có cách tách đến đây", "✕ No split reaches this position");
    else if (v.phase === 0) status = this.t("∅ → 1 cách bắt đầu", "∅ → 1 way to begin");
    else if (v.final) status = `${v.answer} ${this.t("cách tách", "splits")}`;
    return `<section class="ra1416-string"><div class="ra1416-digits" role="img" aria-label="${this.escape(this.t("Chuỗi chữ số; đoạn tô màu là số đang ghép", "Digit string; highlighted digits form the current number"))}">${left ? '<span>…</span>' : ""}${row}${right < v.s.length ? '<span>…</span>' : ""}</div><div class="ra1416-status${blocked || v.value > v.k ? " rejected" : ""}">${status}</div></section>`;
  }
  transfer(v) {
    const target = v.end + 1;
    const canAdd = v.value <= v.k && v.phase !== 4;
    const source = v.sourceExamples.slice(0, 3);
    const rows = source.map(parts => `<div class="ra1416-append"><div class="ra1416-parts">${this.chips(parts)}</div><span class="ra1416-plus">+</span><span class="ra1416-number ${canAdd ? "candidate" : "rejected"}">${this.escape(v.s.slice(v.start, target))}</span><span class="ra1416-arrow">${canAdd ? "→" : "✕"}</span><div class="ra1416-parts ${canAdd ? "" : "rejected"}">${canAdd ? this.chips([...parts, v.s.slice(v.start, target)], true) : this.t("Vượt k", "Over k")}</div></div>`).join("");
    const before = v.before ?? v.cells.find(cell => cell.index === target)?.count ?? 0;
    return `<section class="ra1416-card"><header><strong>${this.t("Nối thêm một số", "Append one number")}</strong><span>${canAdd ? `+${v.sourceWays} ${this.t("cách", "ways")}` : this.t("Dừng nhánh này", "Stop this branch")}</span></header><div class="ra1416-flow"><div class="ra1416-count source"><small>dp[${v.start}]</small><b>${v.sourceWays}</b></div><div class="ra1416-flow-arrow"><span class="ra1416-number ${canAdd ? "candidate" : "rejected"}">${this.escape(v.s.slice(v.start, target))}</span><span>${canAdd ? "⟶" : "✕"}</span></div><div class="ra1416-count target"><small>dp[${target}]</small><b>${v.updated ? `${before} + ${v.sourceWays} → ${v.after}` : before}</b></div></div><div class="ra1416-witnesses">${rows}</div>${source.length < v.sourceExamples.length ? `<small>${this.t("Ví dụ minh họa", "Illustrative examples")}</small>` : ""}</section>`;
  }
  dp(v) {
    let previous = -1;
    const cells = v.cells.map(cell => {
      const gap = cell.index > previous + 1 ? '<span>…</span>' : "";
      previous = cell.index;
      const state = v.final && cell.index === v.s.length ? " answer" : cell.index === v.start ? " source" : v.end !== null && cell.index === v.end + 1 ? " target" : "";
      const dots = Array.from({ length: Math.min(cell.count, 8) }, () => '<i></i>').join("");
      return `${gap}<div class="ra1416-cell${state}" data-prefix="${cell.index}" data-count="${cell.count}"><small>dp[${cell.index}]</small><b>${cell.count}</b><span class="ra1416-dots" aria-hidden="true">${dots}${cell.count > 8 ? "+" : ""}</span></div>`;
    }).join("");
    return `<section class="ra1416-card"><header><strong>${this.t("Số cách đến mỗi chỗ cắt", "Ways to reach each cut")}</strong><span>dp[p] = ${this.t("tách p chữ số đầu", "split the first p digits")}</span></header><div class="ra1416-cells">${cells}</div></section>`;
  }
  gallery(v) {
    const samples = v.targetExamples;
    return `<section class="ra1416-card"><header><strong>${this.t("Các mảng khôi phục", "Restored arrays")}</strong><span>${samples.length === 8 ? this.t("Tối đa 8 ví dụ", "Up to 8 examples") : `✓ 1 … ${v.k}`}</span></header><div class="ra1416-gallery">${samples.map(parts => `<div class="ra1416-result"><span>✓</span><div class="ra1416-parts">${this.chips(parts)}</div></div>`).join("") || `<div class="ra1416-no-result">∅ · ${this.t("Không có cách hợp lệ", "No valid split")}</div>`}</div></section>`;
  }
  render(step) {
    const v = step.restoreArray1416View;
    if (!v) return;
    const phases = [this.t("Bắt đầu", "Start"), this.t("Chọn chỗ cắt", "Choose a cut"), this.t("Ghép số", "Build a number"), this.t("Cộng số cách", "Add ways"), this.t("Loại nhánh", "Reject branch"), this.t("Kết quả", "Result")];
    const source = v.end === null && !v.final ? `<div class="ra1416-source-example"><span>${this.t("Đã tách", "Already split")} · ${v.sourceWays} ${this.t("cách", "ways")}</span><div class="ra1416-parts">${v.sourceExamples.length ? this.chips(v.sourceExamples[0]) : "∅"}</div></div>` : "";
    this.host.innerHTML = `<section class="ra1416-viz" aria-label="1416 Restore The Array"><header><strong>1416 · ${phases[v.phase]}</strong><span>1 ≤ ${this.t("mỗi số", "each number")} ≤ ${v.k} · ${this.t("không 0 đầu", "no leading 0")}</span></header>${this.digits(v)}${v.end !== null ? this.transfer(v) : source}${this.dp(v)}${v.final ? this.gallery(v) : ""}${v.final ? `<small class="ra1416-mod">mod 1 000 000 007</small>` : ""}${v.traceTruncated ? `<small>${this.t("Các bước đã rút gọn · đáp án tính toàn bộ chuỗi", "Steps shortened · answer uses the full string")}</small>` : ""}</section>`;
  }
}
function renderRestoreArray1416View(step) {
  new RestoreArray1416Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step);
}
