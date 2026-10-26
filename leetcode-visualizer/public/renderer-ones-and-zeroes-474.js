function renderOnesAndZeroes474View(step) {
  const v = step.onesZeros474View, host = $("treeView"), vi = lang === "vi", esc = escapeHtml, t = v.transition;
  const bits = text => text ? [...text].map(bit => `<i class="ozp-bit ${bit === "0" ? "zero" : "one"}">${bit}</i>`).join("") : '<i class="ozp-empty">∅</i>';
  const chosen = new Set(v.witness || []), shown = v.strings.length <= 12 ? v.strings.map(s => s.index) : (() => {
    const set = new Set([0, 1, v.strings.length - 2, v.strings.length - 1]);
    if (v.activeIndex !== null) for (let d = -2; d <= 2; d++) if (v.activeIndex + d >= 0 && v.activeIndex + d < v.strings.length) set.add(v.activeIndex + d);
    return [...set].sort((a, b) => a - b);
  })();
  const cards = shown.map((index, position) => {
    const item = v.strings[index], selected = v.final && chosen.has(index);
    return `${position && index > shown[position - 1] + 1 ? '<span class="ozp-gap">…</span>' : ""}<article class="ozp-string ${index === v.activeIndex && index >= v.processed ? "active" : ""} ${selected ? "selected" : ""} ${index < v.processed && !selected ? "done" : ""}" data-item-index="${index}" title="${item.text || "∅"}"><small>[${index}] ${selected ? "✓" : ""}</small><div class="ozp-bits">${bits(item.text)}</div><span><b class="zero">0 × ${item.zeros}</b><b class="one">1 × ${item.ones}</b></span></article>`;
  }).join("");
  const costsKnown = v.final ? v.witness !== null : !["intro", "initialize", "choose-string", "count-zero"].includes(v.phase);
  const used = v.final && v.witness !== null ? v.witness.reduce((a, i) => [a[0] + v.strings[i].zeros, a[1] + v.strings[i].ones], [0, 0]) : [v.zeros, v.ones];
  const pocket = (bit, limit, cost) => `<div class="ozp-pocket ${bit ? "one" : "zero"}"><header><b>${bit} · ${bit ? "n" : "m"} = ${limit}</b><strong>${costsKnown ? cost : "—"} / ${limit}</strong></header><div>${Array.from({ length: Math.min(limit, 14) }, (_, i) => `<i class="${costsKnown && i < cost ? "filled" : ""}">${bit}</i>`).join("")}${limit > 14 ? '<span>…</span>' : !limit ? '<span>∅</span>' : ""}${costsKnown && cost > limit ? `<b class="ozp-over">+${cost - limit} ×</b>` : ""}</div></div>`;
  const axis = (limit, centers) => {
    if (limit <= 12) return Array.from({ length: limit + 1 }, (_, i) => i);
    const set = new Set([0, 1, limit - 1, limit]);
    for (const center of centers) if (center !== null && center !== undefined) for (let d = -1; d <= 1; d++) if (center + d >= 0 && center + d <= limit) set.add(center + d);
    const sorted = [...set].sort((a, b) => a - b), expanded = [];
    sorted.forEach((value, i) => { if (i && value > sorted[i - 1] + 1) expanded.push(null); expanded.push(value); });
    return expanded;
  };
  const zs = axis(v.m, [t?.z, t?.sourceZ]), os = axis(v.n, [t?.o, t?.sourceO]), dest = v.final ? [v.m, v.n] : t ? [t.z, t.o] : null;
  const columns = `<b class="ozp-axis-key">0 ↓<br>1 →</b>${os.map(o => `<b class="ozp-col">${o ?? "…"}</b>`).join("")}`;
  const cells = v.dp.length ? zs.map(z => `<b class="ozp-row">${z ?? "…"}</b>${os.map(o => {
    if (z === null || o === null) return '<span class="ozp-cell-gap">…</span>';
    const value = v.dp[z][o], source = t?.sourceZ === z && t?.sourceO === o, destination = dest?.[0] === z && dest[1] === o;
    return `<span class="ozp-cell ${source ? "source" : ""} ${destination ? "destination" : ""}" data-cell="${z},${o}" style="--ozp-level:${Math.min(30, value * 7)}%" title="dp[${z}][${o}] = ${value}"><b>${value}</b></span>`;
  }).join("")}`).join("") : "";
  const table = v.dp.length ? `<div class="ozp-table-scroll"><div class="ozp-table" style="grid-template-columns:32px repeat(${os.length},32px)">${columns}${cells}</div></div>` : '<div class="ozp-empty">dp = —</div>';
  let action;
  if (t) action = `<div class="ozp-candidate"><small>${vi ? "Bỏ" : "Skip"} · (${t.z},${t.o})</small><strong>${t.skip}</strong></div><div class="ozp-candidate take"><small>${vi ? "Lấy" : "Take"} · (${t.sourceZ},${t.sourceO})</small><strong>${t.takeFrom ?? "?"} + 1 = ${t.take ?? "?"}</strong></div><div class="ozp-max">MAX ↓ <b>${t.result ?? "?"}</b></div>`;
  else if (v.final) action = `<div class="ozp-answer">✓ <b>${v.answer}</b></div>${v.witness === null ? "" : `<div class="ozp-witness">${v.witness.map(i => `<span><small>[${i}]</small><b>${esc(v.strings[i].text || "∅")}</b></span>`).join("") || "∅"}</div>`}`;
  else if (v.phase === "skip-string") action = `<div class="ozp-answer bad">×</div><small>${vi ? "Vượt một ngăn" : "A pocket is too small"}</small>`;
  else action = `<div class="ozp-direction">↖</div><code>${costsKnown ? `0 × ${v.zeros} · 1 × ${v.ones}` : "dp[z][o]"}</code>`;
  const history = v.history.slice(-8).map(record => `<b><small>[${record.index}]</small>${record.value}</b>`).join("");
  host.innerHTML = `<section class="ozp-viz" aria-label="Ones and Zeroes 474"><header class="ozp-heading"><b>#474 · ONES AND ZEROES</b><small>${v.detailed ? "" : vi ? "Theo từng chuỗi · " : "Per string · "}${vi ? "Dòng" : "Line"} ${v.line}</small></header><div class="ozp-strings">${cards || "∅"}</div><div class="ozp-pockets">${pocket(0, v.m, used[0])}${pocket(1, v.n, used[1])}</div><div class="ozp-work"><section class="ozp-dp"><header><b>dp[z][o]</b><small>↖ ${vi ? "duyệt giảm" : "sweep down"}</small></header>${table}</section><section class="ozp-action">${action}</section></div><div class="ozp-history"><small>dp[m][n]</small>${v.history.length > 8 ? '<span>…</span>' : ""}${history || "—"}</div></section>`;
  const scroll = host.querySelector(".ozp-table-scroll"), current = scroll?.querySelector(".destination");
  if (current) { scroll.scrollLeft = Math.max(0, current.offsetLeft - scroll.clientWidth / 2); scroll.scrollTop = Math.max(0, current.offsetTop - scroll.clientHeight / 2); }
  const rail = host.querySelector(".ozp-strings"), active = rail?.querySelector(".active"); if (active) rail.scrollLeft = Math.max(0, active.offsetLeft - rail.clientWidth / 2);
}
