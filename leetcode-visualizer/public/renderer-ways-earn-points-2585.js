"use strict";

class WaysToEarnPoints2585Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) {
    this.host = host;
    this.language = language;
    this.escape = escape;
  }

  t(vi, en) { return this.language === "vi" ? vi : en; }
  value(value) { return this.escape(String(value)); }

  types(v) {
    return v.types.map((type, index) => {
      const active = index === v.typeIndex;
      const icons = Array.from({ length: Math.min(type.count, 8) }, (_, i) => {
        const used = active && v.used !== null && i < v.used;
        return `<i class="${used ? "used" : ""}">+${type.points}</i>`;
      }).join("");
      return `<div class="wep2585-type${active ? " active" : ""}"><header><b>${this.t("Loại", "Type")} ${index + 1}</b><strong>${type.count} × ${type.points}</strong></header><div class="wep2585-questions">${icons}${type.count > 8 ? `<small>×${type.count}</small>` : ""}</div></div>`;
    }).join("");
  }

  scoreCells(v) {
    const activeScore = v.transition?.score ?? v.score;
    return v.cells.map(cell => {
      const classes = [
        "wep2585-cell",
        cell.score === activeScore ? "active" : "",
        cell.score === v.transition?.source ? "source" : "",
      ].filter(Boolean).join(" ");
      return `<div class="${classes}" data-score="${cell.score}"><small>${cell.score}</small><b>${this.value(cell.ways)}</b>${cell.nextWays !== cell.ways ? `<span>${this.value(cell.nextWays)}</span>` : ""}</div>`;
    }).join("");
  }

  transfer(v) {
    const tr = v.transition;
    if (!tr) {
      const active = v.activeType;
      return `<div class="wep2585-hint">${active
        ? `${this.t("Tối đa", "Up to")} <b>${active.count}</b> × <b>+${active.points}</b>`
        : this.t("Bắt đầu từ 0 điểm", "Start at zero points")}</div>`;
    }
    return `<div class="wep2585-transfer"><div><small>dp[${tr.source}]</small><strong>${this.value(tr.ways)}</strong></div><i>× ${tr.used} · +${tr.used * v.activeType.points}</i><b>→</b><div class="destination"><small>next_dp[${tr.score}]</small><strong>${this.value(tr.after)}</strong></div><span>${this.t("Đã dùng", "used")} ${tr.used}/${tr.maxQuestions} ${this.t("câu", "questions")}</span></div>`;
  }

  render(step) {
    const v = step.waysToEarnPoints2585View;
    if (!v) return;
    const final = v.answer !== null;
    const label = {
      "bind-class": this.t("Lớp", "Class"),
      "enter-method": this.t("Bắt đầu", "Start"),
      "set-modulo": "MOD",
      "allocate-dp": "dp",
      "seed-empty-choice": this.t("Cách rỗng", "Empty choice"),
      "select-type": this.t("Loại câu", "Question type"),
      "allocate-next": "next_dp",
      "select-score": this.t("Điểm", "Score"),
      "limit-questions": this.t("Giới hạn", "Limit"),
      "select-quantity": this.t("Số câu dùng", "Questions used"),
      "add-choice": this.t("Cộng cách", "Add ways"),
      "commit-type": this.t("Chốt loại", "Commit type"),
      "return-answer": this.t("Kết quả", "Answer"),
    }[v.event] || "";
    const scoreLabel = v.transition ? `${v.transition.source} → ${v.transition.score}` : `target ${v.target}`;
    this.host.innerHTML = `<section class="wep2585-viz" role="region" aria-label="2585 Number of Ways to Earn Points">
      <header class="wep2585-heading"><strong>2585 · ${label}</strong><span>${scoreLabel}</span></header>
      <div class="wep2585-target"><small>${this.t("Mục tiêu","TARGET")}</small><strong>${v.target}</strong><span>${this.t("điểm","points")}</span><b>${final ? this.value(v.answer) : "?"}</b></div>
      <div class="wep2585-types">${this.types(v)}</div>
      <section class="wep2585-dp"><header><strong>dp</strong><span>${this.t("đã xử lý","processed")} · ${v.typeIndex < 0 ? 0 : v.typeIndex} / ${v.types.length}</span></header><div class="wep2585-cells">${this.scoreCells(v)}</div>${v.cropped ? `<small>${this.t("Hiển thị các điểm gần bước hiện tại","Showing scores near the current step")}</small>` : ""}</section>
      ${this.transfer(v)}
      ${final ? `<footer class="wep2585-answer"><span>dp[${v.target}]</span><b>${this.value(v.answer)}</b><small>mod 10⁹ + 7</small></footer>` : ""}
      ${v.truncated ? `<small class="wep2585-truncated">${this.t("Trace rút gọn · DP tính đầy đủ","Trace shortened · full DP computed")}</small>` : ""}
    </section>`;
  }
}

function renderWaysToEarnPoints2585View(step) {
  new WaysToEarnPoints2585Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step);
}
