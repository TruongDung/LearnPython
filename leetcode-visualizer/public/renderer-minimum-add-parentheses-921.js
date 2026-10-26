function parentheses921Input(v) {
  const esc = escapeHtml, waiting = new Set(v.stack || []), matched = new Set(), fixed = new Set();
  for (const pair of v.pairs) {
    if (pair.kind === "original") { matched.add(pair.left); matched.add(pair.right); }
    if (pair.kind === "insert-open") fixed.add(pair.right);
  }
  if (!v.s.length) return '<div class="pa921-empty">∅</div>';
  const focus = v.index ?? Math.max(0, v.processed - 1);
  const start = Math.max(0, Math.min(focus - 8, v.s.length - 18));
  const end = Math.min(v.s.length, start + 18), count = end - start, width = count * 36 + 24;
  const x = index => 30 + (index - start) * 36;
  const arcs = v.pairs.filter(pair => pair.kind === "original" && pair.left >= start && pair.right < end)
    .map(pair => `<path class="pa921-arc" d="M${x(pair.left)},62 Q${(x(pair.left) + x(pair.right)) / 2},${Math.max(4, 48 - (pair.right - pair.left) * 4)} ${x(pair.right)},62"/>`).join("");
  const cells = Array.from({ length: count }, (_, offset) => {
    const index = start + offset, active = index === v.index;
    const missing = active && v.phase === "stack-check" && !v.condition;
    const cls = ["pa921-input-token", matched.has(index) ? "matched" : fixed.has(index) ? "fixed" : waiting.has(index) ? "waiting" : index < v.processed ? "processed" : "future", active ? "active" : "", missing ? "missing" : ""].filter(Boolean).join(" ");
    const badge = active ? "i ↑" : fixed.has(index) ? "+(" : waiting.has(index) ? "+)" : "";
    return `<g class="${cls}"><title>s[${index}] = ${esc(v.s[index])}</title><rect x="${x(index) - 15}" y="67" width="30" height="38" rx="7"/><text class="letter" x="${x(index)}" y="94">${esc(v.s[index])}</text><text class="index" x="${x(index)}" y="120">${index}</text>${badge ? `<text class="badge" x="${x(index)}" y="140">${esc(badge)}</text>` : ""}</g>`;
  }).join("");
  return `<svg class="pa921-input" viewBox="0 20 ${width} 130" style="max-width:${Math.round(width * 1.1)}px" aria-hidden="true">${arcs}${cells}</svg>${v.s.length > 18 ? `<small class="pa921-window">${start ? `… +${start} · ` : ""}s[${start}..${end - 1}] / ${v.s.length}${end < v.s.length ? ` · +${v.s.length - end} …` : ""}</small>` : ""}`;
}

function renderParentheses921View(step) {
  const v = step.parentheses921View, esc = value => escapeHtml(String(value)), t = (vi, en) => lang === "vi" ? vi : en;
  const done = step.final, stack = v.stack || [], paired = new Set(v.pairs.flatMap(pair => [pair.open, pair.close]));
  const bubble = (ch, label, cls = "") => `<span class="pa921-bubble ${cls}"><b>${esc(ch)}</b><small>${esc(label)}</small></span>`;
  const bridge = '<svg class="pa921-bridge" viewBox="0 0 64 32" aria-hidden="true"><path d="M4,26 Q32,-8 60,26"/></svg>';
  let picture;
  if (v.focusPair) {
    picture = bubble("(", v.focusPair.left === null ? "+" : `#${v.focusPair.left}`, v.focusPair.left === null ? "inserted" : "matched") + bridge + bubble(")", `#${v.focusPair.right}`, "matched");
  } else if (done) {
    picture = v.missingClose ? `<span class="pa921-suffix">${Array.from({ length: Math.min(v.missingClose, 5) }, () => bubble(")", "+", "inserted")).join("")}${v.missingClose > 5 ? `<small>+${v.missingClose - 5}</small>` : ""}</span>` : '<span class="pa921-check">✓</span>';
  } else if (v.phase === "push") {
    picture = bubble("(", `#${v.index}`, "waiting") + '<i class="pa921-to-stack">⟶</i><span class="pa921-stack-icon" aria-hidden="true"><i></i><i></i><i></i></span>';
  } else if (v.phase === "stack-check" && !v.condition) {
    picture = bubble("(", "?", "missing") + bridge + bubble(")", `#${v.index}`, "missing");
  } else {
    picture = v.index === null ? '<span class="pa921-check pending">( )</span>' : bubble(v.ch, `#${v.index}`, "current");
  }
  const stackItem = (index, offset) => `<span class="pa921-stack-item${offset === 0 ? " top" : ""}"><b>(</b><code>#${index}</code>${offset === 0 ? "<small>TOP</small>" : ""}</span>`;
  const top = [...stack].reverse();
  const stackPanel = `<section class="pa921-stack"><header><code>stack</code><small>TOP ↓</small></header><div class="pa921-stack-items">${top.length ? top.slice(0, 6).map(stackItem).join("") : '<span class="pa921-empty">[ ]</span>'}</div>${top.length > 6 ? `<details><summary>+${top.length - 6}</summary><div class="pa921-stack-items">${top.slice(6).map((index, offset) => stackItem(index, offset + 6)).join("")}</div></details>` : ""}</section>`;
  const title = typeof step.title === "object" ? step.title[lang === "vi" ? "vi" : "en"] : step.title;
  const action = `<section class="pa921-action"><small>${done ? v.missingClose ? t("Thêm ')' ở cuối", "Append ')' at the end") : t("Đã ghép đủ", "All pairs complete") : esc(title)}</small><div class="pa921-picture">${picture}</div><code>${done && v.missingClose ? `+ ')' × ${v.missingClose}` : esc(v.equation)}</code></section>`;
  const token = item => `<span class="pa921-output-token${item.inserted ? " inserted" : paired.has(item.id) ? " matched" : " waiting"}${!done && item.index === v.index ? " current" : ""}" title="${esc(item.inserted ? `${t("Chèn trước", "Insert before")} ${item.before === v.s.length ? t("cuối chuỗi", "the end") : `s[${item.before}]`}` : `s[${item.index}]`)}"><small>${item.inserted ? "+" : item.index}</small><b>${esc(item.ch)}</b></span>`;
  const hidden = Math.max(0, v.tokens.length - 24);
  $("treeView").innerHTML = `<section class="pa921-viz" aria-label="${esc(t("Ghép ngoặc và thêm các dấu còn thiếu", "Match parentheses and insert the missing characters"))}">
    <header class="pa921-heading"><b>921 · ( ↔ )</b><span>${t("Dòng", "Line")} ${v.source.line}</span></header>
    <div class="pa921-equation${done ? " done" : ""}"><span><small>+ '(' · additions</small><b>${v.missingOpen ?? "—"}</b></span><i>+</i><span><small>+ ')' · len(stack)</small><b>${v.missingClose ?? "—"}</b></span><i>=</i><strong>${v.total ?? "—"}</strong></div>
    <section class="pa921-source"><header><code>s</code><small>${v.processed}/${v.s.length} ${t("đã duyệt", "scanned")}</small></header>${parentheses921Input(v)}</section>
    <div class="pa921-work">${action}${stackPanel}</div>
    <section class="pa921-output"><header><b>${done ? t("Minh họa sau khi chèn", "Balanced insertion example") : t("Minh họa phần đã duyệt", "Processed prefix illustration")}</b>${done ? '<span class="pa921-valid">✓</span>' : ""}</header><div class="pa921-output-tokens">${hidden ? `<span class="pa921-gap">… +${hidden}</span>` : ""}${v.tokens.slice(hidden).map(token).join("") || '<span class="pa921-empty">∅</span>'}</div>${hidden ? `<details><summary>${t("Xem đầy đủ", "View all")} · ${v.tokens.length}</summary><div class="pa921-output-tokens">${v.tokens.map(token).join("")}</div></details>` : ""}<footer><span>● ${t("có sẵn", "original")}</span><span>＋ ${t("chèn thêm", "inserted")}</span></footer></section>
  </section>`;
}
