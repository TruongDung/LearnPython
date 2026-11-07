"use strict";

function sc87Escape(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function sc87Text() {
  const vi = typeof lang !== "undefined" && lang === "vi";
  return { locale: vi ? "vi" : "en", region: vi ? "Xáo trộn chuỗi từng bước" : "Scramble strings step by step",
    after: vi ? "Sau dòng" : "After line", keep: vi ? "Giữ thứ tự" : "Keep order", swap: vi ? "Đổi chỗ" : "Swap",
    skipped: vi ? "Bỏ qua" : "Skipped", calls: vi ? "Cây lời gọi" : "Call tree", proof: vi ? "Một cách tạo s2" : "One way to produce s2",
    cut: vi ? "Điểm cắt tiếp →" : "Next cut →", nextCall: vi ? "Lần gọi tiếp →" : "Next call →", result: vi ? "Kết quả ↠" : "Result ↠",
    counts: vi ? "Khác số lượng chữ → loại" : "Different character counts → prune",
    same: vi ? "Hai đoạn giống nhau" : "Identical substrings", cache: vi ? "Dùng lại memo ↩" : "Reuse memo ↩",
    pending: vi ? "Đang chạy" : "Running", scope: vi ? "Đang gọi" : "Call stack",
    presets: vi ? ["great → rgeat", "Không thể", "ab → ba", "Khác chữ", "Chữ lặp", "8 chữ", "a = a"]
      : ["great → rgeat", "Impossible", "ab → ba", "Different counts", "Duplicates", "8 letters", "a = a"],
  };
}

function sc87Pair(v) {
  const f = v.focus ?? { i: 0, j: 0, length: v.s1.length };
  const rows = [["s1", v.s1, f.i], ["s2", v.s2, f.j]].map(([name, value, start]) => {
    const cells = [...value.slice(start, start + f.length)].map((char, offset) => {
      const part = name === "s1" && v.split ? offset < v.split.cut ? "is-a" : "is-b" : "";
      return `<span class="sc87-letter ${part}"><small>${start + offset}</small><b>${char}</b></span>`;
    }).join("");
    return `<div class="sc87-string-row"><b>${name}</b><div>${cells}</div></div>`;
  }).join("");
  return `<section class="sc87-pair"><header><b>${v.activeId === null ? "s1 ↔ s2" : `dfs(${f.i}, ${f.j}, ${f.length})`}</b><small>length = ${f.length}</small></header><div class="sc87-string-scroll" tabindex="0">${rows}</div></section>`;
}

function sc87Split(v, branch, t) {
  const { i, j, length } = v.focus, k = v.split.cut, swapped = branch === "swap", item = v.split[branch];
  const a = v.s1.slice(i, i + k), b = v.s1.slice(i + k, i + length);
  const targetCut = swapped ? length - k : k, c = v.s2.slice(j, j + targetCut), d = v.s2.slice(j + targetCut, j + length);
  const status = side => item.children[side]?.result === true ? "✓" : item.children[side]?.result === false ? "×" : side === 1 && item.skipped ? "—" : "?";
  const target = (value, part, side) => `<span class="sc87-piece is-${part}" data-pair-side="${side}"><b>${value}</b><i class="${item.children[side]?.result === true ? "is-true" : item.children[side]?.result === false ? "is-false" : ""}">${status(side)}</i></span>`;
  const result = item.checked ? item.result ? "✓" : "×" : "?";
  return `<section class="sc87-option is-${branch} ${item.checked ? item.result ? "is-pass" : "is-fail" : ""}" data-branch-kind="${branch}" data-branch-result="${item.result}"><header><b>${swapped ? "⤨" : "↓"} ${t[branch]}</b><strong>${result}</strong></header><div class="sc87-piece-row"><span class="sc87-piece is-a"><b>${a}</b></span><span class="sc87-piece is-b"><b>${b}</b></span></div><svg class="sc87-wires" viewBox="0 0 200 36" width="200" height="36" role="img" aria-label="${t[branch]}"><path class="is-a" d="M40,3 L${swapped ? 160 : 40},30 m-4,-5 4,5 4,-5"/><path class="is-b" d="M160,3 L${swapped ? 40 : 160},30 m-4,-5 4,5 4,-5"/></svg><div class="sc87-piece-row">${target(c, swapped ? "b" : "a", swapped ? 1 : 0)}${target(d, swapped ? "a" : "b", swapped ? 0 : 1)}</div>${item.skipped ? `<small class="sc87-skipped" data-skipped="${branch}">× and … → ${t.skipped}</small>` : ""}</section>`;
}

function sc87Counts(v, t) {
  if (!v.focus?.histogramMismatch) return "";
  const f = v.focus, a = v.s1.slice(f.i, f.i + f.length), b = v.s2.slice(f.j, f.j + f.length);
  return `<section class="sc87-counts"><b>× ${t.counts}</b><div>${[...new Set(a + b)].sort().map(char => {
    const left = [...a].filter(c => c === char).length, right = [...b].filter(c => c === char).length;
    return `<span class="${left === right ? "is-equal" : "is-different"}" data-count-char="${char}" data-count-a="${left}" data-count-b="${right}"><strong>${char}</strong><code>${left} ${left === right ? "=" : "≠"} ${right}</code></span>`;
  }).join("")}</div></section>`;
}

function sc87Tree(v, t) {
  if (!v.tree.length) return "";
  return `<section class="sc87-tree"><header><b>${t.calls}</b><small>${v.tree.length}</small></header><div class="sc87-tree-scroll" tabindex="0">${v.tree.map(node => {
    const a = v.s1.slice(node.i, node.i + node.length), b = v.s2.slice(node.j, node.j + node.length);
    return `<div class="sc87-tree-indent" style="--sc87-depth:${node.depth}"><button type="button" class="sc87-call ${node.id === v.activeId ? "is-active" : ""} ${node.result === true ? "is-true" : node.result === false ? "is-false" : ""}" data-sc87-node="${node.id}" data-call-parent="${node.parent}" data-call-result="${node.result}"><small>#${node.id}</small><code>${node.memoHit ? "↩" : node.branch === "swap" ? "⤨" : "↓"} ${a} → ${b}</code><b>${node.result === null ? "◌" : node.result ? "✓" : "×"}</b></button></div>`;
  }).join("")}</div></section>`;
}

function sc87Memo(v) {
  const sameKey = (a, b) => a && b && a.join(",") === b.join(",");
  return `<section class="sc87-memo"><header><b>memo · ${v.memo.length}</b><small>↩ ${v.cacheHits}</small></header><div class="sc87-memo-scroll" role="region" tabindex="0" aria-label="memo">${v.memo.map(entry => {
    const [i, j, length] = entry.key;
    return `<div class="sc87-memo-cell ${sameKey(entry.key, v.memoChanged) ? "is-written" : ""} ${sameKey(entry.key, v.memoRead) ? "is-read" : ""}" data-memo-key="${entry.key.join(",")}" data-memo-result="${entry.result}"><small>(${entry.key.join(", ")})</small><code>${v.s1.slice(i, i + length)} ↔ ${v.s2.slice(j, j + length)}</code><b class="${entry.result ? "is-true" : "is-false"}">${entry.result ? "✓" : "×"}</b></div>`;
  }).join("") || '<span class="sc87-empty">{ }</span>'}</div></section>`;
}

function sc87Proof(node, depth = 0) {
  return `<div class="sc87-proof-row" style="--sc87-depth:${depth}" data-proof-mode="${node.mode}" data-proof-a="${node.a}" data-proof-b="${node.b}"><b>${node.a}</b><i>${node.mode === "equal" ? "=" : node.mode === "swap" ? "⤨" : "↓"}</i><strong>${node.b}</strong>${node.cut === null ? "" : `<small>k=${node.cut}</small>`}</div>${node.children.map(child => sc87Proof(child, depth + 1)).join("")}`;
}

function sc87Jump(kind) {
  if (typeof steps === "undefined" || typeof renderStep !== "function") return;
  if (typeof stopPlay === "function") stopPlay();
  const next = steps.findIndex((s, index) => {
    const v = s.scramble87View;
    return index > stepIndex && v && (kind === "result" ? v.answer !== null : kind === "cut" ? v.source.line === 19 && v.branch === true
      : kind === "memo" ? v.source.line === 9 && v.branch === true : v.activeId !== null && v.tree[v.activeId].firstStep === index);
  });
  stepIndex = next < 0 ? steps.length - 1 : next; renderStep();
}

function sc87Bind(host) {
  const bind = (selector, action) => host.querySelectorAll(selector).forEach(node => {
    node.addEventListener("click", () => action(node));
    node.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); action(node); }
    });
  });
  bind("[data-sc87-jump]", node => sc87Jump(node.dataset.sc87Jump));
  bind("[data-sc87-node]", node => {
    if (typeof steps === "undefined" || typeof renderStep !== "function") return;
    const entry = steps[stepIndex].scramble87View.tree[Number(node.dataset.sc87Node)];
    if (!entry) return;
    if (typeof stopPlay === "function") stopPlay(); stepIndex = entry.firstStep; renderStep();
  });
  bind("[data-sc87-case]", node => {
    if (typeof runViz !== "function") return;
    const cases = [["great", "rgeat"], ["abcde", "caebd"], ["ab", "ba"], ["abc", "abd"], ["aab", "aba"], ["abcdefgh", "hgfedcba"], ["a", "a"]];
    const [a, b] = cases[Number(node.dataset.sc87Case)]; document.getElementById("arrInput").value = a;
    const field = document.querySelector('[data-param="s2"]'); if (field) field.value = b;
    runViz();
  });
}

function renderScramble87Pictures(step) {
  const host = document.getElementById("treeView"), v = step.scramble87View, t = sc87Text();
  if (!host || !v) return;
  const oldScroll = host.querySelector(".sc87-tree-scroll")?.scrollTop ?? 0;
  const status = v.answer === null ? t.pending : v.answer ? "True ✓" : "False ×";
  const stack = v.stack.map(id => `<span>#${id}</span>`).join("<i>→</i>");
  const cut = v.split ? `<div class="sc87-cut">k = <b>${v.split.cut}</b><span>${v.split.cut} + ${v.focus.length - v.split.cut}</span></div><div class="sc87-options">${sc87Split(v, "keep", t)}${sc87Split(v, "swap", t)}</div>` : "";
  const terminal = v.focus?.memoHit ? `<div class="sc87-terminal is-cache">${t.cache}</div>`
    : v.focus?.same === true ? `<div class="sc87-terminal">= ${t.same}</div>` : "";
  host.innerHTML = `<article class="sc87-viz" role="region" aria-label="${t.region}" data-source-line="${v.source.line}">
    <header class="sc87-header"><div><small>LEETCODE 87 · DFS + MEMO</small><h2>${sc87Escape(v.phase[t.locale])}</h2></div><b class="sc87-status ${v.answer === true ? "is-true" : v.answer === false ? "is-false" : ""}" data-answer="${v.answer}">${status}</b></header>
    <nav class="sc87-presets" aria-label="Examples">${t.presets.map((label, index) => `<button type="button" data-sc87-case="${index}">${label}</button>`).join("")}</nav>
    <div class="sc87-source"><span>${t.after} <b>L${v.source.line}</b></span><code>${sc87Escape(v.source.text)}</code>${v.branch === null ? "" : `<strong class="${v.branch ? "is-true" : "is-false"}" data-branch="${v.branch}">${v.branch ? "True ✓" : "False ×"}</strong>`}</div>
    <div class="sc87-stack"><small>${t.scope}</small>${stack || "—"}</div>${sc87Pair(v)}${terminal}${sc87Counts(v, t)}${cut}
    ${v.witness ? `<section class="sc87-proof"><header>✓ ${t.proof}</header>${sc87Proof(v.witness)}</section>` : ""}
    <div class="sc87-state">${sc87Tree(v, t)}${sc87Memo(v)}</div>
    <footer class="sc87-footer"><div><button type="button" data-sc87-jump="call">${t.nextCall}</button><button type="button" data-sc87-jump="cut">${t.cut}</button><button type="button" data-sc87-jump="memo">Memo ↩</button><button type="button" data-sc87-jump="result">${t.result}</button></div><small>O(n⁴) time · O(n³) space</small></footer>
  </article>`;
  const tree = host.querySelector(".sc87-tree-scroll");
  if (tree) {
    tree.scrollTop = oldScroll;
    const active = host.querySelector(".sc87-call.is-active");
    if (active) {
      const box = tree.getBoundingClientRect(), row = active.getBoundingClientRect();
      if (row.top < box.top) tree.scrollTop -= box.top - row.top;
      if (row.bottom > box.bottom) tree.scrollTop += row.bottom - box.bottom;
    }
  }
  sc87Bind(host);
}
