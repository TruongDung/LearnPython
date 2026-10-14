class MinInsertionsPalindrome1312Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) {
    this.host = host;
    this.language = language;
    this.escape = escape;
  }

  t(vi, en) { return this.language === "vi" ? vi : en; }

  string(v) {
    return [...v.s].map((char, index) => {
      let state = "";
      if (v.phase !== "final" && index === v.i) state = "left";
      if (v.phase !== "final" && index === v.j) state = v.same ? "match" : "right";
      if (v.phase === "final") state = "source";
      return `<span class="mi1312-char ${state}"><small>${index}</small><b>${this.escape(char)}</b></span>`;
    }).join("");
  }

  table(step, v) {
    const n = v.s.length;
    if (n > 12 || !step.grid?.dp) {
      return `<div class="mi1312-value"><small>dp[${v.i}, ${v.j}]</small><b>${v.answer ?? step.grid?.dp?.[v.i + 1]?.[v.j + 1] ?? 0}</b></div>`;
    }
    const values = step.grid.dp;
    const head = `<tr><th></th>${[...v.s].map((char, index) => `<th>${this.escape(char)}<small>${index}</small></th>`).join("")}</tr>`;
    const rows = [...v.s].map((char, row) => `<tr><th>${this.escape(char)}<small>${row}</small></th>${[...v.s].map((_, col) => {
      const value = values[row + 1]?.[col + 1] ?? "";
      const current = row === v.i && col === v.j;
      const source = [[v.i + 1, v.j - 1], [v.i + 1, v.j], [v.i, v.j - 1]].some(([i, j]) => i === row && j === col);
      return `<td class="${row > col ? "empty" : ""}${current ? " current" : ""}${source ? " source" : ""}">${row <= col ? this.escape(String(value)) : ""}</td>`;
    }).join("")}</tr>`).join("");
    return `<div class="mi1312-table-scroll"><table class="mi1312-table" aria-label="${this.t("Bảng DP đoạn", "Interval DP table")}">${head}${rows}</table></div>`;
  }

  recurrence(v, step) {
    if (v.phase === "compare" || v.phase === "interval") {
      return `<div class="mi1312-rule">${v.same === null ? "i → ← j" : `${this.escape(v.s[v.i] || "")} ${v.same ? "=" : "≠"} ${this.escape(v.s[v.j] || "")}`}</div>`;
    }
    if (v.phase === "match") {
      return `<div class="mi1312-rule match"><span>${this.escape(v.s[v.i] || "")}</span><b>↘</b><span>dp[${v.i + 1},${v.j - 1}]</span><b>→</b><strong>${v.inside ?? 0}</strong></div>`;
    }
    if (v.phase === "choose" || v.phase === "update") {
      const chosen = v.chosen;
      const result = step.grid?.dp?.[v.i + 1]?.[v.j + 1] ?? 0;
      return `<div class="mi1312-choices"><div class="${chosen === "left" ? "chosen" : ""}"><span>＋${this.escape(v.s[v.i] || "")}</span><small>dp[${v.i + 1},${v.j}]</small><b>${v.leftOption ?? 0}</b></div><i>or</i><div class="${chosen === "right" ? "chosen" : ""}"><span>${this.escape(v.s[v.j] || "")}＋</span><small>dp[${v.i},${v.j - 1}]</small><b>${v.rightOption ?? 0}</b></div>${v.phase === "update" ? `<strong>→ ${result}</strong>` : ""}</div>`;
    }
    if (v.phase === "final") {
      const tiles = v.palindrome.map(part => `<span class="${part.inserted ? "inserted" : ""}">${this.escape(part.char)}</span>`).join("");
      return `<div class="mi1312-result"><div class="mi1312-palindrome">${tiles || "<span>∅</span>"}</div><output>${v.answer}</output></div>`;
    }
    return "";
  }

  render(step) {
    const v = step.palindrome1312View;
    if (!v) return;
    this.host.innerHTML = `<section class="mi1312-viz"><header><strong>1312 · ${this.t("Palindrome", "Palindrome")}</strong><span>${v.phase === "final" ? `✓ ${v.answer}` : v.i === null ? "" : `${v.i} ↔ ${v.j}`}</span></header><div class="mi1312-strip">${this.string(v)}</div>    <div class="mi1312-main"><section class="mi1312-card mi1312-dp"><header><strong>DP</strong><span>i → j</span></header>${this.table(step, v)}</section><section class="mi1312-card mi1312-action"><header><strong>${v.phase === "final" ? this.t("Kết quả", "Result") : this.t("Hai đầu", "Ends")}</strong>${v.same === true ? "<span>✓</span>" : v.same === false ? "<span>↔</span>" : ""}</header>${this.recurrence(v, step)}</section></div></section>`;
  }
}

function renderMinInsertionsPalindrome1312View(step) {
  new MinInsertionsPalindrome1312Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step);
}
