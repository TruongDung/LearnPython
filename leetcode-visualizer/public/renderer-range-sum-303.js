class RangeSum303Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) {
    this.host = host;
    this.language = language;
    this.escape = escape;
  }

  t(vi, en) { return this.language === "vi" ? vi : en; }
  value(value) { return value === null || value === undefined ? "?" : this.escape(String(value)); }
  rank(query) { return { "select-range": 0, "right-prefix": 1, "left-prefix": 2, subtract: 3 }[query?.phase] ?? -1; }

  diagram(view) {
    const { nums, prefix, current, prefixIndex, query } = view;
    const width = Math.max(310, nums.length * 56 + 54);
    const spacing = (width - 54) / Math.max(1, nums.length);
    const x = i => 27 + i * spacing;
    const font = value => String(value).length > 5 ? 10 : String(value).length > 3 ? 13 : 18;
    const ready = this.rank(query);
    const inputs = nums.map((value, i) => {
      const state = query ? (i < query.left ? "drop" : i <= query.right ? "keep" : "muted") : i === current ? "current" : "";
      return `<g class="ps303-num ${state}" data-index="${i}"><title>nums[${i}] = ${this.value(value)}</title>
        <text class="ps303-index" x="${x(i + 0.5)}" y="42">${i}</text>
        <rect x="${x(i + 0.5) - 22}" y="48" width="44" height="42" rx="8"/>
        <text class="ps303-value" x="${x(i + 0.5)}" y="75" style="font-size:${font(value)}px">${this.value(value)}</text>
        ${query && i < query.left && ready >= 2 ? `<path class="ps303-strike" d="M ${x(i + 0.5) - 16} 81 L ${x(i + 0.5) + 16} 57"/>` : ""}</g>`;
    }).join("");
    const sums = prefix.map((value, i) => {
      const state = query ? (i === query.right + 1 ? "take" : i === query.left ? "drop" : "") : i === prefixIndex ? "current" : "";
      return `<g class="ps303-prefix ${state}${value === null ? " unknown" : ""}" data-prefix-index="${i}">
        <title>prefix[${i}] · ${i === 0 ? "∅" : `nums[0..${i - 1}]`}</title>
        <text class="ps303-index" x="${x(i)}" y="216">p[${i}]</text>
        <rect x="${x(i) - 23}" y="160" width="46" height="42" rx="8"/>
        <text class="ps303-value" x="${x(i)}" y="187" style="font-size:${font(value)}px">${this.value(value)}</text>
      </g>`;
    }).join("");
    let arrows = "";
    if (!query && current >= 0) {
      const committed = prefix[current + 1] !== null;
      arrows = `<g class="ps303-build-link${committed ? " committed" : " pending"}">
        <path d="M ${x(current)} 157 V 133 Q ${x(current)} 125 ${x(current) + 8} 125 H ${x(current + 1) - 8} Q ${x(current + 1)} 125 ${x(current + 1)} 133 V 155" marker-end="url(#ps303-arrow)"/>
        <path d="M ${x(current + 0.5)} 95 V 118" marker-end="url(#ps303-arrow)"/>
        <text x="${x(current + 0.5) + 14}" y="112">+</text></g>`;
    } else if (query) {
      arrows = `<path class="ps303-range" d="M ${x(query.left)} 31 V 23 H ${x(query.right + 1)} V 31"/>
        <text class="ps303-range-label" x="${(x(query.left) + x(query.right + 1)) / 2}" y="14">[${query.left} … ${query.right}]</text>
        <path class="ps303-boundary take" d="M ${x(query.right + 1)} 96 V 153" marker-end="url(#ps303-green-arrow)"/>
        <text class="ps303-edge-label take" x="${x(query.right + 1) - 5}" y="116">right+1</text>
        <path class="ps303-boundary drop" d="M ${x(query.left)} 96 V 153" marker-end="url(#ps303-red-arrow)"/>
        <text class="ps303-edge-label drop" x="${x(query.left) + 5}" y="133">left</text>`;
    }
    return `<div class="ps303-diagram"><svg viewBox="0 0 ${width} 228" style="min-width:${nums.length > 6 ? width : 0}px" role="img" aria-label="${this.t("Ô nums ở giữa hai mốc prefix; mũi tên cộng dồn hoặc chỉ hai mốc truy vấn", "Each nums cell sits between prefix boundaries; arrows show addition or the query boundaries")}">
      <defs>${[["ps303-arrow", "orange"], ["ps303-green-arrow", "green"], ["ps303-red-arrow", "red"]].map(([id, color]) => `<marker id="${id}" class="${color}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker>`).join("")}</defs>
      ${inputs}${sums}${arrows}</svg></div>`;
  }

  build(view) {
    if (view.current < 0) return `<div class="ps303-equation"><span class="ps303-operand blue"><small>p[0]</small><b>0</b></span><span>← ∅</span></div>`;
    const i = view.current;
    const committed = view.prefix[i + 1] !== null;
    return `<div class="ps303-equation"><span class="ps303-operand blue"><small>p[${i}]</small><b>${this.value(view.prefix[i])}</b></span><i>+</i><span class="ps303-operand orange"><small>nums[${i}]</small><b>${this.value(view.nums[i])}</b></span><i>=</i><span class="ps303-operand ${committed ? "green" : "pending"}"><small>p[${i + 1}]</small><b>${this.value(view.prefix[i + 1])}</b></span></div>`;
  }

  chips(nums, start, end, state, split = -1) {
    return nums.slice(start, end).map((value, offset) => `<span class="ps303-chip ${start + offset < split ? "drop" : state}" title="nums[${start + offset}]"><b>${this.value(value)}</b></span>`).join("") || '<span class="ps303-empty">∅</span>';
  }

  proof(view) {
    const q = view.query;
    const rank = this.rank(q);
    const whole = rank >= 1 ? (q.rightPrefixValue ?? view.prefix[q.right + 1]) : null;
    const before = rank >= 2 ? (q.leftPrefixValue ?? view.prefix[q.left]) : null;
    const answer = rank >= 3 ? q.answer : null;
    return `<section class="ps303-proof">
      <div class="ps303-proof-row take${rank === 1 ? " active" : ""}"><span class="ps303-symbol">①</span><div class="ps303-chips">${this.chips(view.nums, 0, q.right + 1, "keep", q.left)}</div><span class="ps303-operand green"><small>p[${q.right + 1}]</small><b>${this.value(whole)}</b></span></div>
      <div class="ps303-proof-row drop${rank === 2 ? " active" : ""}"><span class="ps303-symbol">−</span><div class="ps303-chips">${this.chips(view.nums, 0, q.left, "drop")}</div><span class="ps303-operand red"><small>p[${q.left}]</small><b>${this.value(before)}</b></span></div>
      <div class="ps303-proof-row keep${rank === 3 ? " active" : ""}"><span class="ps303-symbol">=</span><div class="ps303-chips">${this.chips(view.nums, q.left, q.right + 1, "keep")}</div><span class="ps303-operand green" data-answer="${answer === null ? "pending" : "ready"}"><small>${this.t("Tổng", "Sum")}</small><b>${this.value(answer)}</b></span></div>
      <div class="ps303-legend"><span class="green">■ ${this.t("giữ lại", "keep")}</span><span class="red">■ ${this.t("bỏ phần đầu", "remove prefix")}</span></div>
    </section>`;
  }

  render(step) {
    const view = step.prefix1DView;
    if (!view || view.kind !== "range-sum-immutable") return;
    const query = view.query;
    this.host.innerHTML = `<section class="ps303-viz"><header><strong>303 · ${this.t("Tổng một đoạn", "Range sum")}</strong><span>${query ? `sumRange(${query.left}, ${query.right})` : this.t("Cộng dồn →", "Build prefix →")}</span></header><section class="ps303-card"><header><strong>nums ↓ prefix</strong><small>${query ? "p[right+1] − p[left]" : "p[i+1] = p[i] + nums[i]"}</small></header>${this.diagram(view)}</section>${query ? this.proof(view) : this.build(view)}</section>`;
  }
}

function renderRangeSum303View(step) {
  new RangeSum303Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step);
}
