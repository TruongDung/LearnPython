class GuessNumber374Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) { this.host = host; this.language = language; this.escape = escape; }
  t(vi, en) { return this.language === "vi" ? vi : en; }
  arrow(feedback) { return feedback === -1 ? "←" : feedback === 1 ? "→" : feedback === 0 ? "✓" : "…"; }
  feedbackValue(feedback) { return feedback === 1 ? "+1" : feedback ?? "?"; }
  range(v) {
    const ids = v.n <= 20 ? Array.from({ length: v.n }, (_, i) => i + 1)
      : [...new Set([1, v.lo, v.mid, v.hi, v.lo === null ? null : v.lo - 1, v.hi === null ? null : v.hi + 1, v.n])].filter(i => Number.isInteger(i) && i >= 1 && i <= v.n).sort((a, b) => a - b);
    let previous = null;
    const cells = ids.map(number => {
      const gap = previous !== null && number > previous + 1 ? '<span class="gn374-gap">…</span>' : ""; previous = number;
      const removed = v.lo !== null && (number < v.lo || number > v.hi);
      const correct = v.feedback === 0 && number === v.mid;
      const active = number === v.mid;
      const label = correct ? "✓" : active ? "mid" : number === v.lo && number === v.hi ? "lo=hi" : number === v.lo ? "lo" : number === v.hi ? "hi" : "·";
      return `${gap}<div class="gn374-number${removed ? " removed" : ""}${active ? " active" : ""}${correct ? " correct" : ""}" data-number="${number}" data-removed="${removed}"><small>${label}</small><b>${number}</b><span>${removed ? "✕" : correct ? "✓" : "?"}</span></div>`;
    }).join("");
    return `<section class="gn374-card"><header><strong>${this.t("Các số còn có thể đúng", "Remaining candidates")}</strong><small>[${v.lo ?? "?"}, ${v.hi ?? "?"}]</small></header><div class="gn374-numbers">${cells}</div>${v.nextLo !== undefined ? `<div class="gn374-shrink">[${v.lo}, ${v.hi}] → <b>[${v.nextLo}, ${v.nextHi}]</b><small>${this.t("sau dòng này", "after this line")}</small></div>` : ""}</section>`;
  }
  oracle(v) {
    const feedback = v.feedback;
    const label = feedback === -1 ? this.t("Đoán quá cao", "Guess too high") : feedback === 1 ? this.t("Đoán quá thấp", "Guess too low") : feedback === 0 ? this.t("Đúng số!", "Correct!") : this.t("Chờ phản hồi", "Awaiting reply");
    const secret = feedback === 0 ? v.mid : "?";
    return `<section class="gn374-card"><div class="gn374-api"><div class="gn374-guess"><small>guess(${v.mid ?? "mid"})</small><b>${v.mid ?? "?"}</b><span>${this.t("Số đang đoán", "Current guess")}</span></div><div class="gn374-reply${feedback === 0 ? " correct" : ""}"><small>API</small><div><b>${this.feedbackValue(feedback)}</b><strong>${this.arrow(feedback)}</strong></div><span>${label}</span></div><div class="gn374-secret${feedback === 0 ? " revealed" : ""}"><small>${this.t("Số bí mật", "Hidden number")}</small><b>${secret}</b><span>${feedback === 0 ? "✓" : "● ● ●"}</span></div></div></section>`;
  }
  halves(v) {
    if (v.feedback !== -1 && v.feedback !== 1) return "";
    const last = v.history.at(-1);
    const higher = v.feedback === 1;
    const left = { lo: last.lo, hi: higher ? last.number : last.number - 1, keep: !higher };
    const right = { lo: higher ? last.number + 1 : last.number, hi: last.hi, keep: higher };
    const tile = half => `<div class="gn374-half ${half.keep ? "keep" : "discard"}" data-start="${half.lo}" data-end="${half.hi}"><span class="gn374-half-symbol">${half.keep ? higher ? "→" : "←" : "✕"}</span><b>[${half.lo}, ${half.hi}]</b><span>${half.keep ? this.t("Giữ", "Keep") : this.t("Loại", "Remove")} · ${Math.max(0, half.hi - half.lo + 1)} ${this.t("số", "numbers")}</span></div>`;
    return `<div class="gn374-halves" aria-label="${this.t("API chỉ hướng cần tìm", "The API points to the correct half")}">${tile(left)}${tile(right)}</div>`;
  }
  history(v) {
    if (!v.calls) return "";
    const ids = v.calls <= 8 ? v.history.map((_, i) => i) : [0, 1, ...Array.from({ length: 6 }, (_, i) => v.calls - 6 + i)];
    let previous = -1;
    const items = ids.map(i => {
      const gap = i > previous + 1 ? '<span class="gn374-gap">…</span>' : ""; previous = i;
      const call = v.history[i];
      return `${gap}<div class="gn374-history-item${call.feedback === 0 ? " correct" : ""}" data-call="${i + 1}" data-feedback="${call.feedback}"><small>#${i + 1}</small><b>${call.number}</b><span>${this.feedbackValue(call.feedback)} ${this.arrow(call.feedback)}</span></div>`;
    }).join("");
    return `<section class="gn374-card"><header><strong>${v.calls} ${this.t("lần gọi guess", "guess calls")}</strong>${v.final ? '<span class="gn374-found">✓</span>' : ""}</header><div class="gn374-history">${items}</div>${ids.length < v.calls ? `<small>${this.t("Lịch sử rút gọn · trace vẫn đầy đủ", "History condensed · full line trace preserved")}</small>` : ""}</section>`;
  }
  render(step) {
    const v = step.guessNumber374View; if (!v) return;
    const phases = { init: this.t("Bắt đầu", "Start"), while: this.t("Kiểm tra khoảng", "Check range"), mid: this.t("Chọn số giữa", "Choose the midpoint"), call: this.t("Gọi API", "Call the API"), "check-equal": this.t("Đã đoán đúng?", "Found it?"), "check-direction": this.t("Chọn hướng", "Choose a direction"), lower: this.t("Tìm số nhỏ hơn", "Search lower"), higher: this.t("Tìm số lớn hơn", "Search higher"), found: this.t("Đã tìm thấy", "Found the number") };
    this.host.innerHTML = `<section class="gn374-viz" aria-label="374 Guess Number Higher or Lower"><header><strong>374 · ${phases[v.phase]}</strong><span>${this.t("Trước dòng", "Before line")} ${v.source.line}</span></header><div class="gn374-source"><code>${this.escape(v.source.text.trim())}</code></div>${this.range(v)}${this.oracle(v)}${this.halves(v)}${this.history(v)}</section>`;
  }
}
function renderGuessNumber374View(step) {
  new GuessNumber374Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step);
}
