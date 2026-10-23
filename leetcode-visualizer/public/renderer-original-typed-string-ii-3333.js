class OriginalTypedString3333Visualizer {
  constructor(host, language) {
    this.host = host;
    this.vi = language === "vi";
  }

  t(vi, en) { return this.vi ? vi : en; }

  render(step) {
    const view = step.originalTypedString3333View;
    if (!view) return;
    const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]);
    const groups = view.groups.map((group, index) => {
      const active = index === view.groupIndex && view.phase === "cell";
      const done = index < view.groupIndex || view.phase === "done";
      const letters = Array.from({ length: group.length }, () => `<i>${group.char}</i>`).join("");
      return `<div class="ots3333-run${active ? " is-active" : ""}${done ? " is-done" : ""}"><div class="ots3333-letters">${letters}</div><small>${group.length}×</small></div>`;
    }).join('<span class="ots3333-run-gap">›</span>');

    const active = view.activeGroup;
    let choices = "";
    if (active && view.phase === "cell") {
      const lengths = Array.from({ length: active.length }, (_, index) => index + 1);
      const visible = lengths.length > 10 ? [...lengths.slice(0, 7), null, lengths.at(-1)] : lengths;
      choices = `<div class="ots3333-choices" aria-label="${this.t("Các độ dài có thể giữ", "Possible kept lengths")}">${visible.map((length) => length === null
        ? '<span class="ots3333-more">…</span>'
        : `<span class="ots3333-choice${length === active.length ? " is-full" : ""}">${active.char.repeat(length)}</span>`).join("")}</div>`;
    }

    const renderDpRow = (name, values, isBefore) => {
      if (!values) return "";
      const cells = values.map((ways, index) => {
        const inWindow = isBefore && view.window && index >= view.window[0] && index <= view.window[1];
        const destination = !isBefore && index === view.sumIndex;
        const changed = !isBefore && view.dpBefore && ways !== view.dpBefore[index];
        return `<div class="ots3333-cell${inWindow ? " in-window" : ""}${destination ? " is-destination" : ""}${changed ? " is-changed" : ""}"><small>${index}</small><b>${ways}</b></div>`;
      }).join("");
      return `<div class="ots3333-dp-row"><strong>${name}</strong><div class="ots3333-cells">${cells}</div></div>`;
    };
    const dpBefore = view.phase === "seed" || view.phase === "runs" ? null : view.dpBefore;
    const dpAfter = view.phase === "runs" ? null : view.dpAfter;
    const dp = dpBefore || dpAfter ? `<section class="ots3333-dp" aria-label="${this.t("Bảng số cách theo độ dài", "Ways by length table")}">
      ${dpBefore ? renderDpRow(this.t("Trước", "Before"), dpBefore, true) : ""}
      ${dpAfter ? renderDpRow(dpBefore ? this.t("Sau", "After") : "dp", dpAfter, false) : ""}
    </section>` : "";

    let window = "";
    if (view.phase === "cell" && view.window) {
      const [low, high] = view.window;
      const indices = Array.from({ length: Math.max(0, high - low + 1) }, (_, index) => low + index);
      const chosen = indices.length > 8 ? [...indices.slice(0, 3), null, ...indices.slice(-3)] : indices;
      const terms = chosen.map((index) => index === null
        ? '<span class="ots3333-dots">…</span>'
        : `<span class="ots3333-term">${view.dpBefore[index]}</span>`).join('<i class="ots3333-plus">+</i>');
      window = `<div class="ots3333-window"><small>${this.t("Cửa sổ", "Window")}</small><div>${terms}<i class="ots3333-arrow">→</i><b>${view.dpAfter[view.sumIndex]}</b></div></div>`;
    }

    let result = "";
    if (view.phase === "done" || view.phase === "early") {
      result = view.phase === "early"
        ? `<div class="ots3333-result"><span>${view.total}</span><i>→</i><b>${view.answer}</b></div>`
        : `<div class="ots3333-result"><span>${view.total}</span><i>−</i><span>${view.shortWays}</span><i>=</i><b>${view.answer}</b></div>`;
    }

    const progress = view.phase === "cell" ? `${view.sumIndex} / ${view.k - 1}` : `${view.groups.length} ${this.t("đoạn", "runs")}`;
    this.host.innerHTML = `<section class="ots3333-viz" aria-label="${this.t("Trực quan hóa bài 3333", "Problem 3333 visualization")}" aria-live="polite">
      <header class="ots3333-head"><strong>#3333 · ${this.t("Chuỗi gốc", "Original strings")}</strong><span>k = <b>${view.k}</b></span></header>
      <div class="ots3333-word" aria-label="${esc(view.word)}">${groups}</div>
      ${active ? `<div class="ots3333-choice-line"><span>${active.char}</span><i>→</i>${choices}</div>` : ""}
      ${dp}
      ${window}
      ${view.phase === "early" ? `<div class="ots3333-short-note">${this.t("Mỗi đoạn giữ ít nhất 1 ký tự", "Each run keeps at least 1 key")}</div>` : ""}
      ${result}
      ${view.phase !== "done" && view.phase !== "early" ? `<footer class="ots3333-foot"><span>${progress}</span><span>${this.t("Tổng cách", "All choices")}: ${view.total}</span></footer>` : ""}
    </section>`;
  }
}

function renderOriginalTypedString3333View(step) {
  new OriginalTypedString3333Visualizer($("treeView"), lang).render(step);
}
