class MaximumProduct628Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) {
    this.host = host;
    this.language = language;
    this.escape = escape;
  }

  t(vi, en) { return this.language === "vi" ? vi : en; }
  number(value) { return Number.isFinite(value) ? this.escape(String(value)) : "∅"; }
  slot(view, key) { return view.slots.find(slot => slot.key === key); }
  values(view, keys) { return keys.map(key => this.slot(view, key)?.value); }

  // Matching by index preserves separate occurrences of equal values.
  selectedIndices(nums, values) {
    const used = new Set();
    for (const value of values) {
      const index = nums.findIndex((num, i) => num === value && !used.has(i));
      if (index >= 0) used.add(index);
    }
    return used;
  }

  chart(view, final) {
    const nums = view.values;
    const a = this.values(view, ["first", "second", "third"]);
    const b = this.values(view, ["minFirst", "minSecond", "first"]);
    const product = values => values.reduce((total, value) => total * value, 1);
    const selected = final ? this.selectedIndices(nums, product(b) > product(a) ? b : a) : new Set();
    const width = Math.max(310, nums.length * 56 + 36);
    const spacing = (width - 36) / Math.max(1, nums.length);
    const peak = Math.max(1, ...nums.map(Math.abs));
    const bars = nums.map((num, i) => {
      const x = 18 + spacing * (i + 0.5);
      const height = Math.max(3, Math.abs(num) / peak * 65);
      const y = num >= 0 ? 88 - height : 88;
      const state = i === view.current ? " current" : selected.has(i) ? " selected" : view.visited[i] ? " visited" : "";
      return `<g class="m628-bar ${num < 0 ? "negative" : "positive"}${state}" data-index="${i}"><title>nums[${i}] = ${this.number(num)}</title><rect x="${x - 18}" y="${y}" width="36" height="${height}" rx="5"/><text class="m628-value" x="${x}" y="${num >= 0 ? y - 9 : y + height + 18}" style="font-size:${String(num).length > 5 ? 10 : 16}px">${this.number(num)}</text><text class="m628-index" x="${x}" y="190">${i}</text>${i === view.current ? `<path class="m628-cursor" d="M ${x - 4} 201 L ${x + 4} 201 L ${x} 195 Z"/>` : ""}${selected.has(i) ? `<text class="m628-selected-check" x="${x}" y="211">✓</text>` : ""}</g>`;
    }).join("");
    return `<section class="m628-card"><header><strong>nums</strong><span>${final ? this.t("✓ chọn 3 vị trí", "✓ choose 3 indices") : this.t("Quét →", "Scan →")}</span></header><div class="m628-chart"><svg viewBox="0 0 ${width} 222" style="min-width:${nums.length > 6 ? width : 0}px" role="img" aria-label="${this.t("Số dương phía trên mốc 0, số âm phía dưới; ba vị trí được chọn có dấu tích", "Positive numbers above zero, negatives below; selected indices have check marks")}"><path class="m628-zero" d="M 7 88 H ${width - 7}"/><text class="m628-zero-label" x="8" y="80">0</text>${bars}</svg></div></section>`;
  }

  podium(view, group) {
    const keys = group === "top" ? ["first", "second", "third"] : ["minFirst", "minSecond"];
    const xs = group === "top" ? [54, 154, 254] : [104, 204];
    const rows = keys.map((key, i) => {
      const slot = this.slot(view, key);
      const height = group === "top" ? [59, 44, 29][i] : [44, 29][i];
      const y = 98 - height;
      const x = xs[i];
      return `<g class="m628-slot${slot?.bump ? " updated" : ""}${!Number.isFinite(slot?.value) ? " empty" : ""}" data-slot="${key}" data-value="${Number.isFinite(slot?.value) ? slot.value : "empty"}"><title>${key}: ${this.number(slot?.value)}</title><rect x="${x - 32}" y="${y}" width="64" height="${height}" rx="6"/><text class="m628-slot-value" x="${x}" y="${y - 11}" style="font-size:${String(slot?.value).length > 5 && Number.isFinite(slot?.value) ? 12 : 22}px">${this.number(slot?.value)}</text><text class="m628-rank" x="${x}" y="${y + 20}">${i + 1}</text><text class="m628-variable" x="${x}" y="117">${key}</text>${slot?.bump ? `<text class="m628-slot-check" x="${x + 22}" y="${y - 10}">✓</text>` : ""}</g>`;
    }).join("");
    return `<section class="m628-card m628-podium ${group}"><header><strong>${group === "top" ? this.t("↑ 3 lớn nhất", "↑ 3 largest") : this.t("↓ 2 nhỏ nhất", "↓ 2 smallest")}</strong><span>${group === "top" ? "≥ ≥" : "≤"}</span></header><svg viewBox="0 0 308 127" role="img" aria-label="${group === "top" ? this.t("Ba số lớn nhất đã gặp", "Three largest values seen") : this.t("Hai số nhỏ nhất đã gặp", "Two smallest values seen")}">${rows}</svg></section>`;
  }

  action(step, view) {
    const compare = { 6: ["first", ">"], 8: ["second", ">"], 10: ["third", ">"], 12: ["minFirst", "<"], 14: ["minSecond", "<"] }[step.codeLines[0]];
    const digit = view.values[view.current];
    if (compare) {
      const [key, operator] = compare;
      const raw = this.slot(view, key)?.value;
      const value = Number.isFinite(raw) ? this.number(raw) : key.startsWith("min") ? "+∞" : "−∞";
      const accepted = !Number.isFinite(raw) || (operator === ">" ? digit > raw : digit < raw);
      return `<div class="m628-action"><b>${this.number(digit)}</b><i>${operator === "<" ? "&lt;" : "&gt;"}</i><span><small>${key}</small><b>${value}</b></span><strong>${accepted ? "✓" : "×"}</strong></div>`;
    }
    const updated = view.slots.filter(slot => slot.bump);
    if (updated.length) {
      const moves = { 7: "digit → first → second → third", 9: "digit → second → third", 11: "digit → third", 13: "digit → minFirst → minSecond", 15: "digit → minSecond" }[step.codeLines[0]];
      return `<div class="m628-action update"><b>${this.number(digit)}</b><span>${moves || "↓"}</span><strong>✓</strong></div>`;
    }
    return view.current >= 0 ? `<div class="m628-action"><b>${this.number(digit)}</b><i>↓</i><span>${this.t("xét cả hai nhóm", "check both groups")}</span></div>` : "";
  }

  factors(values) {
    return values.map((value, i) => `${i ? '<i>×</i>' : ""}<span class="m628-factor ${value < 0 ? "negative" : "positive"}">${this.number(value)}</span>`).join("");
  }

  candidates(view) {
    const a = this.values(view, ["first", "second", "third"]);
    const b = this.values(view, ["minFirst", "minSecond", "first"]);
    const productA = a.reduce((product, num) => product * num, 1);
    const productB = b.reduce((product, num) => product * num, 1);
    const best = Math.max(productA, productB);
    const negativePair = b[0] < 0 && b[1] < 0;
    const card = (name, factors, product, extra = "") => `<section class="m628-card m628-candidate${product === best ? " winner" : ""}" data-candidate="${name}" data-product="${product}"><header><strong>${name === "A" ? this.t("A · 3 lớn nhất", "A · 3 largest") : this.t("B · 2 nhỏ nhất + 1 lớn nhất", "B · 2 smallest + largest")}</strong>${product === best ? '<span class="m628-win">✓</span>' : ""}</header><div class="m628-factors">${this.factors(factors)}</div>${extra}<output>${this.number(product)}</output></section>`;
    const pair = negativePair ? `<div class="m628-negative-pair"><span>− × − → +</span><b>${this.number(b[0] * b[1])}</b></div>` : "";
    return `<div class="m628-candidates">${card("A", a, productA)}${card("B", b, productB, pair)}</div><div class="m628-answer"><span>${this.t("Tích lớn nhất", "Maximum product")}</span><strong>${this.number(best)}</strong></div>`;
  }

  render(step) {
    const view = step.multiSlotPodiumView;
    if (!view) return;
    this.host.innerHTML = `<section class="m628-viz"><header class="m628-heading"><strong>628 · ${this.t("Tích của 3 số", "Product of 3")}</strong><span>${step.final ? "✓" : `${view.visited.filter(Boolean).length}/${view.values.length}`}</span></header>${this.chart(view, step.final)}${step.final ? this.candidates(view) : `${this.action(step, view)}<div class="m628-groups">${this.podium(view, "top")}${this.podium(view, "bottom")}</div>`}</section>`;
  }
}

function renderMaximumProduct628View(step) {
  new MaximumProduct628Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step);
}
