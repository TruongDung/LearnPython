function renderTargetSum494View(step) {
  const v = step.targetSum494View, host = $("treeView"), vi = lang === "vi";
  const P = v.subsetTarget, t = v.transition, final = v.final, dpReady = v.dp.length > 0;
  const indices = P === null ? [] : P <= 24 ? Array.from({ length: P + 1 }, (_, i) => i) : (() => {
    const sums = new Set([0, 1, 2, P - 2, P - 1, P]);
    for (const center of [t?.source, t?.destination]) if (center !== undefined) for (let delta = -2; delta <= 2; delta++) if (center + delta >= 0 && center + delta <= P) sums.add(center + delta);
    return [...sums].sort((a, b) => a - b);
  })();
  const chips = v.nums.map((num, i) => `<span class="ts494p-num ${i === v.activeNumIndex && v.processed <= i ? "active" : ""} ${i < v.processed ? "done" : ""}"><small>[${i}]</small><b>${num}</b></span>`).join("");
  const cell = (row, sum, before) => {
    const count = row[sum], source = t?.source === sum && before, dest = t?.destination === sum && !before;
    return `<span class="ts494p-cell ${source ? "source" : ""} ${dest ? "dest" : ""} ${before && t?.destination === sum ? "skip" : ""} ${sum === P ? "target" : ""}" data-sum="${sum}" title="${before ? "previous" : "dp"}[${sum}] = ${count}"><small>${sum}</small><b>${count}</b><i>${count <= 5 ? "●".repeat(count) : "● × " + count}</i></span>`;
  };
  const row = (values, before = false) => values.length ? indices.map((sum, i) => `${i && sum > indices[i - 1] + 1 ? '<span class="ts494p-gap">…</span>' : ""}${cell(values, sum, before)}`).join("") : '<span class="ts494p-empty">—</span>';
  const feasible = v.checks.range !== false && v.checks.even !== false;
  const reduction = P === null ? `<div class="ts494p-guards"><span>|target| ${Math.abs(v.target)} ≤ Σ ${v.total}<b>${v.checks.range === null ? "?" : v.checks.range ? "✓" : "×"}</b></span><span>(Σ + target) % 2<b>${v.checks.even === null ? "?" : v.checks.even ? "0 ✓" : "1 ×"}</b></span></div>`
    : `<div class="ts494p-balance"><b class="plus" title="+ group">P ${P}</b><strong>−</strong><b class="minus" title="− group">N ${v.total - P}</b><strong>=</strong><b>🎯 ${v.target}</b><small>Σ ${v.total} · P = (${v.total} + ${v.target}) / 2</small></div>`;
  let operation;
  if (t) {
    operation = `<div class="ts494p-route minus"><b>−${v.num}</b><span>dp[${t.destination}]</span><strong>${t.before}</strong></div><strong>+</strong><div class="ts494p-route plus"><b>+${v.num}</b><span>dp[${t.source}]</span><strong>${t.sourceWays}</strong></div><strong>→</strong><b class="ts494p-count">${t.after ?? "?"}</b>`;
  } else if (final) operation = `<strong>${feasible ? "✓" : "×"}</strong><b class="ts494p-count">${v.answer}</b>`;
  else if (v.phase === "choose-signs") operation = `<b class="minus">−${v.num}</b><strong>↘</strong><b class="plus">+${v.num}</b><strong>↙</strong><span>j: ${P} ← ${v.num}</span>`;
  else if (v.phase === "initialize") operation = `<span>∅</span><strong>→</strong><span>dp[0] = 1</span>`;
  else operation = `<span>${v.phase === "sum-end" ? "✓" : "Σ"}</span><b>${v.phase === "intro" ? v.total : v.phase === "reduction" ? `P = ${P}` : v.phase === "sum-end" ? `${v.processed} / ${v.nums.length}` : "←"}</b>`;
  const dp = dpReady ? `<section class="ts494p-dp">${final ? "" : `<header><b>${vi ? "Trước số đang xét" : "Before this value"}</b><small>${v.previous.length ? `i = ${v.activeNumIndex}` : "—"}</small></header><div class="ts494p-row previous">${row(v.previous, true)}</div>`}<header><b>dp</b><small>← j · ${vi ? "tổng ở trên, số cách ở dưới" : "sum above, ways below"}</small></header><div class="ts494p-row current">${row(v.dp)}</div></section>` : '<section class="ts494p-dp"><div class="ts494p-empty">dp = —</div></section>';
  const solutions = v.sampleAssignments.map(signs => `<div class="ts494p-expression">${signs.length ? signs.map((sign, i) => `<b class="${sign > 0 ? "plus" : "minus"}" title="nums[${i}]"><small>[${i}]</small>${sign > 0 ? "+" : "−"}${v.nums[i]}</b>`).join("") : '<b class="ts494p-empty">∅</b>'}<strong>= ${v.target}</strong></div>`).join("");
  const history = v.history.map(record => `<span class="ts494p-history-item"><small>[${record.itemIndex}] ±${record.num}</small><b>${record.ways}</b></span>`).join("");
  host.innerHTML = `<section class="ts494p-viz" aria-label="Target Sum 494"><header class="ts494p-heading"><b>#494 · ± TARGET SUM</b><small>${v.detailed ? "" : vi ? "Theo từng số · " : "Per value · "}${vi ? "Dòng" : "Line"} ${v.line}</small></header><div class="ts494p-input">${chips || "∅"}<strong>🎯 ${v.target}</strong></div>${reduction}<div class="ts494p-operation">${operation}</div>${dp}${solutions ? `<section class="ts494p-solutions"><header><b>± → 🎯</b><small>${v.sampleAssignments.length} / ${v.answer}</small></header><div class="ts494p-sample-grid">${solutions}</div></section>` : `<div class="ts494p-history"><small>dp[P]</small>${history || '<span class="ts494p-empty">—</span>'}</div>`}</section>`;
  for (const container of host.querySelectorAll(".ts494p-row")) {
    const current = container.querySelector(".source, .dest"); if (current) container.scrollLeft = Math.max(0, current.offsetLeft - container.clientWidth / 2 + current.clientWidth / 2);
  }
  const historyPane = host.querySelector(".ts494p-history"); if (historyPane) historyPane.scrollLeft = historyPane.scrollWidth;
}
