"use strict";

class SubarrayOr3171Visualizer {
  constructor({ host, language = "en" }) {
    this.host = host;
    this.language = language;
  }

  t(vi, en) {
    return this.language === "vi" ? vi : en;
  }

  bits(value, target, width) {
    return Array.from({ length: width }, (_, index) => {
      const bit = width - index - 1;
      const on = (value & (1 << bit)) !== 0;
      const targetOn = (target & (1 << bit)) !== 0;
      return `<span class="sor3171-bit${on ? " on" : ""}${targetOn ? " target" : ""}" title="bit ${bit}">${on ? "1" : "0"}</span>`;
    }).join("");
  }

  render(step) {
    const view = step.subarrayOr3171View;
    if (!view) return;
    const maxValue = Math.max(view.k, ...view.nums);
    const width = Math.max(1, maxValue.toString(2).length);
    const values = view.nums.map((value, index) => {
      const state = index === view.right ? " current" : index < view.right ? " past" : " future";
      return `<span class="sor3171-number${state}" data-index="${index}"><small>${index}</small><b>${value}</b></span>`;
    }).join("");
    const windows = view.candidates.map((candidate) => {
      const cells = view.nums.map((value, index) => {
        const inside = index >= candidate.left && index <= view.right;
        return `<span class="${inside ? "inside" : ""}${index === view.right ? " end" : ""}">${inside ? value : "·"}</span>`;
      }).join("");
      const bestClass = candidate.isRoundBest ? " round-best" : "";
      const globalClass = candidate.left === view.bestWindow.left
        && candidate.right === view.bestWindow.right
        && candidate.value === view.bestWindow.value ? " global-best" : "";
      return `<article class="sor3171-candidate${bestClass}${globalClass}">
        <div class="sor3171-window">${cells}</div>
        <div class="sor3171-or"><div class="sor3171-bits">${this.bits(candidate.value, view.k, width)}</div><b>${candidate.value}</b></div>
        <div class="sor3171-math"><span>${candidate.value} ${this.t("gần", "vs")} ${view.k}</span><strong>${candidate.difference}</strong></div>
      </article>`;
    }).join("");
    const best = view.bestWindow;
    this.host.innerHTML = `<section class="sor3171-viz" aria-label="3171 ${this.t("OR của subarray", "Subarray OR")}">
      <header class="sor3171-heading"><strong>3171 · ${this.t("OR gần k nhất", "Closest OR to k")}</strong><span>${view.right + 1} / ${view.nums.length}</span></header>
      <div class="sor3171-array">${values}</div>
      <div class="sor3171-target"><span>k</span><div class="sor3171-bits">${this.bits(view.k, view.k, width)}</div><b>${view.k}</b></div>
      <div class="sor3171-candidates">${windows}</div>
      <footer class="sor3171-result"><span>${this.t("Tốt nhất", "Best")}</span><b>[${best.left}…${best.right}]</b><span>OR = ${best.value}</span><strong>${view.best}</strong>${view.final ? `<i>${this.t("ĐÁP ÁN", "ANSWER")}</i>` : ""}</footer>
    </section>`;
  }
}

function renderSubarrayOr3171View(step) {
  new SubarrayOr3171Visualizer({ host: $("treeView"), language: lang }).render(step);
}
