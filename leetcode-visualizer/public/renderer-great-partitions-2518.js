class GreatPartitions2518Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) {
    this.host = host; this.language = language; this.escape = escape;
  }
  t(vi, en) { return this.language === "vi" ? vi : en; }
  value(n) { return n === null ? "?" : this.escape(String(n)); }
  chips(nums, indices, active = -1) {
    return indices.slice(0, 16).map(i => `<span class="gp2518-chip${i === active ? " active" : ""}" data-index="${i}"><small>#${i}</small><b>${this.value(nums[i])}</b></span>`).join("") + (indices.length > 16 ? `<span>+${indices.length - 16}</span>` : "") || '<span class="gp2518-empty">∅</span>';
  }
  basket(v, label, indices, sum) {
    const ok = sum >= v.k;
    return `<div class="gp2518-basket ${ok ? "good" : "bad"}" data-group="${label}" data-sum="${sum}"><header><b>${label}</b><strong>${sum} ${ok ? "≥" : "<"} ${v.k} ${ok ? "✓" : "✕"}</strong></header><div class="gp2518-chips">${this.chips(v.nums, indices)}</div><div class="gp2518-meter"><span style="width:${Math.min(100, sum / v.k * 100)}%"></span></div></div>`;
  }
  partition(v, sample) {
    const chosen = new Set(sample.a);
    return `<div class="gp2518-partition">${this.basket(v, "A", sample.a, sample.sumA)}${this.basket(v, "B", v.nums.flatMap((_, i) => chosen.has(i) ? [] : [i]), sample.sumB)}</div>`;
  }
  choices(v) {
    return `<div class="gp2518-choice"><svg viewBox="0 0 400 110" role="img" aria-label="${this.t("Mỗi số chọn A hoặc B, hai lựa chọn", "Each number chooses A or B: two choices")}"><path d="M200 48 Q130 92 74 75 M200 48 Q270 92 326 75"/><rect x="169" y="5" width="62" height="43" rx="12"/><text x="200" y="33">nums[i]</text><rect class="a" x="43" y="70" width="62" height="32" rx="8"/><text x="74" y="92">A</text><rect class="b" x="295" y="70" width="62" height="32" rx="8"/><text x="326" y="92">B</text></svg><strong>2 × 2 × … × 2 = 2ⁿ</strong><span>${this.t("Đổi A ↔ B = cách khác", "Swap A ↔ B = a different partition")}</span></div>`;
  }
  dp(v) {
    const tr = v.transition;
    let previous = -1;
    const cells = v.cells.map(cell => {
      const gap = cell.sum > previous + 1 ? '<span class="gp2518-gap">…</span>' : ""; previous = cell.sum;
      const state = tr?.source === cell.sum ? " source" : tr?.destination === cell.sum ? " target" : "";
      const dots = Array.from({ length: Math.min(cell.count, 8) }, () => '<i></i>').join("");
      return `${gap}<div class="gp2518-cell${state}" data-sum="${cell.sum}" data-count="${cell.count}"><small>s = ${cell.sum}</small><b>${cell.count}</b><span class="gp2518-dots" aria-hidden="true">${dots}${cell.count > 8 ? "+" : ""}</span></div>`;
    }).join("");
    const detail = tr ? `<div class="gp2518-transfer"><span class="source">dp[${tr.source}]<b>${tr.added}</b></span><i>s + ${this.value(v.nums[v.index])} →</i><span class="target">dp[${tr.destination}]<b>${tr.before} + ${tr.added} = ${v.phase === "write" ? tr.after : "?"}</b></span></div>${tr.added > 0 && tr.indices.length ? `<div class="gp2518-witness"><span>${this.t("Một cách tạo tổng", "One way to make sum")} ${tr.destination}</span><div class="gp2518-chips">${this.chips(v.nums, tr.indices, v.index)}</div></div>` : ""}` : `<div class="gp2518-hint">${v.phase === "skip" ? this.t("Số này ≥ k → không thể thuộc nhóm thiếu tổng", "This value ≥ k → cannot belong to a group below k") : this.t("Mỗi chấm = một tập chỉ số · ∅ tạo tổng 0", "Each dot = one subset of indices · ∅ makes sum 0")}</div>`;
    return `<section class="gp2518-card"><header><strong>${this.t("Đếm nhóm có tổng < k", "Count groups with sum < k")}</strong><span>← ${this.t("duyệt giảm", "scan downward")}</span></header><div class="gp2518-cells">${cells}</div>${detail}${v.cropped ? `<small>${this.t("Đang hiển thị một phần các ô DP", "Showing selected DP cells")}</small>` : ""}</section>`;
  }
  count(v) {
    return `<div class="gp2518-count"><div><span>2ⁿ</span><b>${this.value(v.total)}</b></div><i>−</i><div class="bad"><span>A < k</span><b>${this.value(v.bad)}</b></div><i>−</i><div class="bad"><span>B < k</span><b>${this.value(v.bad)}</b></div><i>=</i><div class="good" data-answer="${v.answer === null ? "pending" : "ready"}"><span>A ≥ k · B ≥ k</span><b>${this.value(v.answer)}</b></div></div><small class="gp2518-mod">mod 1 000 000 007 · ${this.t("Tổng ≥ 2k → hai nhóm xấu không trùng nhau", "Total ≥ 2k → the two bad categories do not overlap")}</small>`;
  }
  render(step) {
    const v = step.greatPartitions2518View;
    if (!v) return;
    const indices = v.nums.length <= 20 ? v.nums.map((_, i) => i) : [...new Set([0, 1, 2, ...(v.index >= 0 ? [v.index] : []), v.nums.length - 2, v.nums.length - 1])];
    const hasDp = ["init", "seed", "item", "skip", "read", "write", "bad", "result"].includes(v.phase);
    let content;
    if (v.phase === "impossible" || (v.phase === "guard" && v.sum < 2 * v.k)) {
      content = `<div class="gp2518-impossible"><span>Σ nums = <b>${v.sum}</b></span><svg viewBox="0 0 360 90" role="img" aria-label="${this.t("Tổng không đủ cho hai nhóm", "The total cannot fill both groups")}"><rect x="20" y="15" width="135" height="55" rx="10"/><rect x="205" y="15" width="135" height="55" rx="10"/><text x="87" y="49">A ≥ ${v.k}</text><text x="272" y="49">B ≥ ${v.k}</text><text x="180" y="49">+</text></svg><strong>${v.sum} < ${2 * v.k} → ${v.answer === null ? "?" : "0"}</strong><span>${this.t("Không đủ tổng cho cả hai giỏ", "Not enough total for both baskets")}</span></div>`;
    } else content = `${hasDp ? this.dp(v) : this.choices(v)}${v.total !== null ? this.count(v) : ""}`;
    let gallery = "";
    if (v.samples && v.phase === "result") {
      gallery = `<section class="gp2518-card"><header><strong>${this.t("Ví dụ cách chia hợp lệ", "Example valid partitions")}</strong><span>✓ A ≥ ${v.k} · B ≥ ${v.k}</span></header><div class="gp2518-gallery">${v.samples.good.map(sample => this.partition(v, sample)).join("") || `<span>${this.t("Không có cách hợp lệ", "No valid partitions")}</span>`}</div></section><details class="gp2518-card"><summary>${this.t("Xem ví dụ bị loại", "See rejected examples")} ✕</summary><div class="gp2518-gallery">${[...v.samples.badA.slice(0, 2), ...v.samples.badB.slice(0, 2)].map(sample => this.partition(v, sample)).join("")}</div></details>`;
    }
    this.host.innerHTML = `<section class="gp2518-viz"><header><strong>2518 · ${this.t("Chia hai nhóm", "Two groups")}</strong><span>k = ${v.k} · Σ = ${v.sum}</span></header><div class="gp2518-chips gp2518-input">${this.chips(v.nums, indices, v.index)}${v.nums.length > 20 ? `<span>… n = ${v.nums.length}</span>` : ""}</div>${content}${gallery}${v.truncated ? `<small class="gp2518-truncated">${this.t("Trace đã rút gọn; đáp án dùng toàn bộ input", "Trace shortened; answer uses the complete input")}</small>` : ""}</section>`;
  }
}
function renderGreatPartitions2518View(step) {
  new GreatPartitions2518Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step);
}
