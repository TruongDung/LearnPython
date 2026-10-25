function palindrome680Diagram(v) {
  const esc = escapeHtml, width = v.chars.length * 40 + 24, y = 84;
  const x = index => 32 + index * 40;
  const success = v.answer === true;
  const kept = v.chars.map((_, index) => index).filter(index => index !== v.removedIndex);
  const pairs = success ? kept.slice(0, Math.floor(kept.length / 2)).map((index, i) => [index, kept[kept.length - 1 - i]]) : v.pairs;
  const links = new Map(pairs.map(pair => [pair.join(","), { pair, kind: "matched" }]));
  if (!success && Number.isInteger(v.left) && v.left < v.right) {
    const pair = [v.left, v.right];
    links.set(pair.join(","), { pair, kind: v.failedPair ? "bad" : v.phase === "match" ? "matched" : "comparing" });
  }
  const arcs = [...links.values()].map(({ pair: [left, right], kind }) =>
    `<path class="vp680-arc ${kind}" d="M ${x(left)} ${y - 21} Q ${(x(left) + x(right)) / 2} ${Math.max(4, 55 - (right - left) * 6)} ${x(right)} ${y - 21}"/>`).join("");
  const matched = new Set(pairs.flat());
  const cells = v.chars.map((char, index) => {
    const deleted = index === v.removedIndex;
    const left = v.answer === null && index === v.left, right = v.answer === null && index === v.right;
    const bad = v.failedPair?.includes(index) && !success;
    const cls = ["vp680-node", matched.has(index) ? "matched" : "", left ? "left" : "", right ? "right" : "", bad ? "bad" : "", deleted ? "deleted" : ""].filter(Boolean).join(" ");
    return `<g class="${cls}"><title>s[${index}] = ${esc(char)}${deleted ? " · ✂" : ""}</title>
      <circle cx="${x(index)}" cy="${y}" r="17"/>
      <text class="letter" x="${x(index)}" y="${y + 6}" text-anchor="middle">${esc(char)}</text>
      ${deleted ? `<path class="vp680-cross" d="M ${x(index) - 14} ${y + 14} L ${x(index) + 14} ${y - 14}"/>` : ""}
      <text class="index" x="${x(index)}" y="116" text-anchor="middle">${index}</text>
      ${left || right ? `<text class="pointer" x="${x(index)}" y="138" text-anchor="middle">${left && right ? "L=R" : left ? "left ↑" : "right ↑"}</text>` : ""}
    </g>`;
  }).join("");
  return `<svg class="vp680-string" viewBox="0 0 ${width} 150" style="max-width:${Math.round(width * 1.2)}px" aria-hidden="true">${arcs}${cells}</svg>`;
}

function renderPalindrome680View(step) {
  const v = step.palindrome680View, esc = escapeHtml, t = (vi, en) => lang === "vi" ? vi : en;
  const done = v.answer !== null;
  const status = branch => branch.status === "pending" ? t("Chưa xét", "Not checked")
    : branch.status === "skipped" ? t("Không cần xét", "Not needed")
      : branch.status === "checking" ? "⋯"
        : `${branch.result ? "✓ True" : "× False"}${branch.status === "returned" ? " ↩" : ""}`;
  const branches = v.branches.map(branch => {
    const active = v.activeSide === branch.side;
    const checked = new Set(branch.pairs.flat());
    const cells = v.chars.map((char, index) => {
      const cls = ["vp680-mini", index === branch.index ? "cut" : "", checked.has(index) ? "matched" : "",
        branch.failedPair?.includes(index) ? "bad" : "", active && (index === branch.left || index === branch.right) ? "pointer" : ""].filter(Boolean).join(" ");
      return `<span class="${cls}" title="s[${index}]"><b>${esc(char)}</b><small>${index === branch.index ? "✂" : index}</small></span>`;
    }).join("");
    return `<article class="vp680-branch ${branch.status}${active ? " active" : ""}${branch.result === true ? " passed" : branch.result === false ? " failed" : ""}">
      <header><b>✂ ${t(branch.side === "left" ? "Bỏ trái" : "Bỏ phải", branch.side === "left" ? "Skip left" : "Skip right")}</b><span>s[${branch.index}]</span></header>
      <div class="vp680-mini-string">${cells}</div>
      <code>is_palindrome(${branch.from}, ${branch.to})</code>
      <strong class="vp680-branch-status">${status(branch)}</strong></article>`;
  }).join("");
  const frame = v.method === "is_palindrome"
    ? `<span>validPalindrome</span><i>→</i><b>is_palindrome</b><small>${t("biến của lượt thử", "trial variables")}</small>`
    : `<b>validPalindrome</b><small>${t("biến của hàm chính", "main variables")}</small>`;
  const title = typeof step.title === "object" ? step.title[lang === "vi" ? "vi" : "en"] : step.title;
  $("treeView").innerHTML = `<section class="vp680-viz" aria-label="${esc(t("Palindrome sau tối đa một lần xóa", "Palindrome after at most one deletion"))}">
    <header class="vp680-heading"><b>680 · ← palindrome →</b><span>${t("Dòng", "Line")} ${v.source.line}</span></header>
    <div class="vp680-frame">${frame}</div>
    <section class="vp680-map"><header><code>s = "${esc(v.s)}"</code><span>✂ ≤ 1</span></header>
      ${palindrome680Diagram(v)}
      <div class="vp680-legend"><span>↔ ${t("cặp đối xứng", "mirrored pair")}</span><span>✂ ${t("bỏ 1 ký tự", "skip 1 character")}</span></div></section>
    ${done ? "" : `<div class="vp680-action${v.phase === "mismatch" || v.phase === "helper-fail" ? " bad" : ""}"><small>${esc(title)}</small><code>${esc(v.equation)}</code></div>`}
    ${branches ? `<div class="vp680-fork" aria-hidden="true">↙ <small>OR</small> ↘</div><div class="vp680-branches">${branches}</div>` : ""}
    ${done ? `<div class="vp680-result ${v.answer ? "passed" : "failed"}"><strong>${v.answer ? "✓ True" : "× False"}</strong>${v.answer ? `<div class="vp680-witness">${esc(v.witness)}</div><small>${v.deletedIndex === null ? t("0 lần xóa", "0 deletions") : `✂ s[${v.deletedIndex}] = '${esc(v.s[v.deletedIndex])}'`}</small>` : `<small>${t("Cả hai lượt thử đều thất bại", "Both trials failed")}</small>`}</div>` : ""}
  </section>`;
}
