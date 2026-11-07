"use strict";

function regex10Escape(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function regex10Copy() {
  const vi = typeof lang !== "undefined" && lang === "vi";
  return {
    locale: vi ? "vi" : "en", region: vi ? "So khớp từng bước" : "Matching step by step",
    after: vi ? "Sau dòng" : "After line", presets: vi ? "Thử nhanh" : "Try a case",
    empty: vi ? "Rỗng" : "Empty", source: vi ? "Chuỗi" : "String", pattern: vi ? "Mẫu" : "Pattern",
    match: vi ? "KHỚP TOÀN BỘ" : "FULL MATCH", fail: vi ? "KHÔNG KHỚP" : "NO MATCH",
    pending: vi ? "Đang chạy" : "Running", nextCell: vi ? "Ô tiếp →" : "Next cell →",
    nextStar: vi ? "Nhánh * →" : "Next star →", result: vi ? "Kết quả ↠" : "Result ↠",
    diagonal: vi ? "Khớp 1 ký tự" : "Match one", skip: vi ? "Bỏ x* · 0 lần" : "Skip x* · zero",
    repeat: vi ? "Lặp x* · thêm 1" : "Repeat x* · one more", base: vi ? "Rỗng ↔ rỗng" : "Empty ↔ empty",
    table: vi ? "Bảng DP · độ dài tiền tố" : "DP table · prefix lengths",
    true: vi ? "Khớp" : "Match", false: vi ? "False" : "False", current: vi ? "Ô đang xét" : "Current cell",
    reads: vi ? "Đọc" : "Read", write: vi ? "Ghi" : "Write", notReady: vi ? "Chưa tạo bảng" : "Table not created yet",
    witness: vi ? "Một cách ghép hoàn chỉnh" : "One complete matching",
    short: vi ? "True → bỏ qua vế phải của or" : "True → skip the right side of or",
    jump: vi ? "Đến bước tính ô" : "Jump to the cell's computation",
    emptyDemo: vi ? "∅ · a* (cơ sở rỗng)" : "∅ · a* (empty base)",
  };
}

function regex10Strip(v, kind, t) {
  const pattern = kind === "p", text = pattern ? v.p : v.s;
  const cursor = pattern ? v.cursor.j : v.cursor.i;
  const groups = [];
  for (let index = 0; index < text.length; index++) {
    const start = index;
    if (pattern && text[index + 1] === "*") index++;
    groups.push({ start, end: index + 1, text: text.slice(start, index + 1) });
  }
  const tokens = groups.map(g => {
    const active = cursor > g.start && cursor <= g.end;
    const cls = active ? "is-active" : cursor !== null && g.end <= cursor ? "is-consumed" : "";
    const chars = [...g.text].map((char, offset) => `<span class="${cursor !== null && g.start + offset >= cursor ? "rx10-future" : ""}">${regex10Escape(char)}</span>`).join("");
    return `<span class="rx10-token ${cls}" data-token-start="${g.start}" data-token-end="${g.end}"><small>${g.start}${g.end - g.start > 1 ? `…${g.end - 1}` : ""}</small><b>${chars}</b></span>`;
  }).join("");
  return `<div class="rx10-strip"><span class="rx10-strip-label"><b>${kind}</b><small>${pattern ? t.pattern : t.source}</small></span><div class="rx10-tokens"><span class="rx10-token rx10-empty ${cursor === 0 ? "is-active" : ""}"><small>0</small><b>∅</b></span>${tokens}</div><code>${cursor === null ? "—" : `${kind}[:${cursor}]`}</code></div>`;
}

function regex10Board(v, t) {
  if (!v.dp) return `<div class="rx10-no-table"><span>▦</span>${t.notReady}</div>`;
  const cell = 40, margin = 36, width = margin + (v.n + 1) * cell + 8, height = margin + (v.m + 1) * cell + 8;
  const xy = (i, j) => [margin + j * cell + cell / 2, margin + i * cell + cell / 2];
  let cells = "", labels = "", arrows = "";
  for (let j = 0; j <= v.n; j++) {
    labels += `<text x="${xy(0, j)[0]}" y="15" class="rx10-axis">${j}</text><text x="${xy(0, j)[0]}" y="30" class="rx10-axis-char">${regex10Escape(j ? v.p[j - 1] : "∅")}</text>`;
  }
  for (let i = 0; i <= v.m; i++) {
    labels += `<text x="10" y="${xy(i, 0)[1] - 7}" class="rx10-axis">${i}</text><text x="10" y="${xy(i, 0)[1] + 9}" class="rx10-axis-char">${regex10Escape(i ? v.s[i - 1] : "∅")}</text>`;
    for (let j = 0; j <= v.n; j++) {
      const [x, y] = xy(i, j), value = v.dp[i][j];
      const active = i === v.cursor.i && j === v.cursor.j;
      const read = v.reads.find(r => r.i === i && r.j === j);
      const write = v.write?.i === i && v.write?.j === j;
      cells += `<g class="rx10-cell ${value ? "is-true" : "is-false"} ${active ? "is-active" : ""} ${write ? "is-write" : ""} ${read ? `is-read is-${read.role}` : ""}" data-rx-cell="${i},${j}" data-dp-value="${value}" role="button" tabindex="0" aria-label="dp[${i}][${j}] = ${value ? "True" : "False"}. ${t.jump}"><rect x="${x - 17}" y="${y - 17}" width="34" height="34" rx="8"/><text x="${x}" y="${y + 5}">${value ? "✓" : "×"}</text></g>`;
    }
  }
  if (v.cursor.i !== null && v.cursor.j !== null) {
    const [tx, ty] = xy(v.cursor.i, v.cursor.j);
    for (const read of v.reads.filter(r => r.i !== v.cursor.i || r.j !== v.cursor.j)) {
      const [sx, sy] = xy(read.i, read.j), dx = tx - sx, dy = ty - sy, length = Math.hypot(dx, dy);
      const x1 = sx + dx / length * 10, y1 = sy + dy / length * 10;
      const x2 = tx - dx / length * 14, y2 = ty - dy / length * 14;
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      arrows += `<g class="rx10-arrow is-${read.role}" data-read-from="${read.i},${read.j}" data-read-to="${v.cursor.i},${v.cursor.j}"><path d="M${x1},${y1} L${x2},${y2}"/><path d="M-7,-4 L0,0 L-7,4" transform="translate(${x2},${y2}) rotate(${angle})"/></g>`;
    }
  }
  return `<div class="rx10-board-scroll" tabindex="0" role="region" aria-label="${t.table}"><svg class="rx10-board" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-label="${t.table}" role="group"><title>${t.table}: dp[i][j] = s[:i] ↔ p[:j]</title>${labels}${cells}${arrows}</svg></div>`;
}

function regex10Rules(v, t) {
  const atom = v.cursor.j > 1 && v.p[v.cursor.j - 1] === "*" ? v.p[v.cursor.j - 2] : "x";
  const character = v.cursor.i > 0 ? v.s[v.cursor.i - 1] : "x";
  const rules = [
    { key: "diagonal", icon: "↘", label: t.diagonal, diagram: `${regex10Escape(character)} <i>↔</i> ${regex10Escape(v.cursor.j > 0 && v.p[v.cursor.j - 1] !== "*" ? v.p[v.cursor.j - 1] : "x / .")}`, formula: "dp[i−1][j−1]", on: v.reads.some(r => r.role === "diagonal") },
    { key: "skip", icon: "→", label: t.skip, diagram: `<s>${regex10Escape(atom)}*</s> <i>↦</i> ∅`, formula: "dp[i][j−2]", on: v.reads.some(r => r.role === "skip") },
    { key: "repeat", icon: "↓", label: t.repeat, diagram: `${regex10Escape(atom)}* <i>↦</i> ${regex10Escape(character)} <i>↻</i>`, formula: "dp[i−1][j]", on: v.reads.some(r => r.role === "repeat") },
  ];
  const ruleCards = rules.map(r => `<div class="rx10-rule is-${r.key} ${r.on ? "is-on" : ""}" data-rule="${r.key}" data-rule-active="${r.on}"><span class="rx10-rule-icon">${r.icon}</span><div><b>${r.label}</b><span class="rx10-rule-diagram">${r.diagram}</span></div><code>${r.formula}</code></div>`).join("");
  const reads = v.reads.map(r => `<span class="rx10-read is-${r.role}"><code>[${r.i}][${r.j}]</code><b>${r.value ? "✓" : "×"}</b></span>`).join("");
  const update = v.write ? `<div class="rx10-update" data-write="${v.write.i},${v.write.j}"><small>${t.write} dp[${v.write.i}][${v.write.j}]</small><b>${v.write.before ? "True" : "False"} <i>→</i> <strong>${v.write.after ? "True ✓" : "False ×"}</strong></b></div>` : "";
  return `<aside class="rx10-rules">${ruleCards}<div class="rx10-read-row"><small>${t.reads}</small>${reads || "—"}</div>${update}${v.shortCircuit ? `<small class="rx10-short">${t.short}</small>` : ""}</aside>`;
}

function regex10Witness(v, t) {
  if (!v.witness) return "";
  return `<section class="rx10-witness"><small>${t.witness}</small><div>${v.witness.length ? v.witness.map(g => `<span class="rx10-pair" data-witness-pattern="${regex10Escape(g.pattern)}" data-witness-text="${regex10Escape(g.text)}"><b>${regex10Escape(g.pattern)}</b><i>↓</i><strong>${regex10Escape(g.text || "∅")}</strong></span>`).join("") : `<span class="rx10-pair"><b>∅</b><i>↔</i><strong>∅</strong></span>`}</div></section>`;
}

function regex10Jump(predicate) {
  if (typeof steps === "undefined" || typeof stepIndex === "undefined" || typeof renderStep !== "function") return;
  if (typeof stopPlay === "function") stopPlay();
  let next = steps.findIndex((s, index) => index > stepIndex && s.regexMatch10View && predicate(s.regexMatch10View));
  if (next < 0) next = steps.length - 1;
  stepIndex = next;
  renderStep();
}

function regex10Bind(host) {
  const bind = (selector, action) => host.querySelectorAll(selector).forEach(node => {
    node.addEventListener("click", () => action(node));
    node.addEventListener("keydown", event => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault(); event.stopPropagation();
        action(node);
      }
    });
  });
  bind("[data-rx-jump]", node => {
    const kind = node.dataset.rxJump;
    regex10Jump(v => kind === "result" ? v.answer !== null : kind === "star" ? v.source.line === 14 || v.source.line === 8 : Boolean(v.write));
  });
  bind("[data-rx-case]", node => {
    if (typeof runViz !== "function") return;
    const cases = [["aab", "c*a*b"], ["aa", "a"], ["ab", ".*"], ["mississippi", "mis*is*p*."], ["", "a*"]];
    const [s, p] = cases[Number(node.dataset.rxCase)];
    document.getElementById("arrInput").value = s;
    const field = document.querySelector('[data-param="p"]');
    if (field) field.value = p;
    runViz();
  });
  bind("[data-rx-cell]", node => {
    if (typeof steps === "undefined" || typeof renderStep !== "function") return;
    const [i, j] = node.dataset.rxCell.split(",").map(Number);
    let index = steps.findIndex(s => s.regexMatch10View?.write?.i === i && s.regexMatch10View?.write?.j === j);
    if (index < 0) index = steps.findIndex(s => s.regexMatch10View?.cursor.i === i && s.regexMatch10View?.cursor.j === j);
    // Some False cells keep their initialized value without an assignment.
    if (index < 0) index = steps.findIndex(s => s.regexMatch10View?.source.line === 4);
    if (index < 0) return;
    if (typeof stopPlay === "function") stopPlay();
    stepIndex = index; renderStep();
  });
}

function renderRegexMatch10View(step) {
  const host = document.getElementById("treeView"), v = step.regexMatch10View, t = regex10Copy();
  if (!host || !v) return;
  const scroll = host.querySelector(".rx10-board-scroll");
  const oldScroll = scroll ? [scroll.scrollLeft, scroll.scrollTop] : [0, 0];
  const labels = ["aab · c*a*b", "aa · a", "ab · .*", "mississippi · mis*is*p*.", t.emptyDemo];
  const state = v.answer === null ? "pending" : v.answer ? "match" : "fail";
  const status = v.answer === null ? t.pending : v.answer ? t.match : t.fail;
  host.innerHTML = `<article class="rx10-viz" role="region" aria-label="${t.region}" data-source-line="${v.source.line}">
    <header class="rx10-header"><div><small>LEETCODE 10 · DP</small><h2>${regex10Escape(v.phase[t.locale])}</h2></div><span class="rx10-status is-${state}">${v.answer === null ? "◌" : v.answer ? "✓" : "×"} ${status}</span></header>
    <nav class="rx10-presets" aria-label="${t.presets}">${labels.map((label, i) => `<button type="button" data-rx-case="${i}">${label}</button>`).join("")}</nav>
    <div class="rx10-inputs">${regex10Strip(v, "s", t)}${regex10Strip(v, "p", t)}</div>
    <div class="rx10-debug"><span>${t.after} <b>L${v.source.line}</b></span><code>${regex10Escape(v.source.text)}</code>${v.condition !== null ? `<strong class="${v.condition ? "is-true" : "is-false"}" data-branch="${v.condition}">${v.condition ? "True ✓" : "False ×"}</strong>` : ""}</div>
    <div class="rx10-work"><section class="rx10-matrix"><div class="rx10-matrix-heading"><b>dp[i][j] = s[:i] ↔ p[:j]</b><span><i class="is-true">✓</i> ${t.true} <i>×</i> False</span></div>${regex10Board(v, t)}</section>${regex10Rules(v, t)}</div>
    ${regex10Witness(v, t)}
    <footer class="rx10-footer"><div><button type="button" data-rx-jump="cell">${t.nextCell}</button><button type="button" data-rx-jump="star">${t.nextStar}</button><button type="button" data-rx-jump="result">${t.result}</button></div><small>O(mn) time · O(mn) space</small></footer>
  </article>`;
  const board = host.querySelector(".rx10-board-scroll");
  if (board) { board.scrollLeft = oldScroll[0]; board.scrollTop = oldScroll[1]; }
  // Pan the local diagrams, keeping the current token/cell visible on phones
  // without scrolling the document or interrupting the code debugger.
  const reveal = (scroller, item) => {
    if (!scroller || !item) return;
    const box = scroller.getBoundingClientRect(), target = item.getBoundingClientRect(), pad = 8;
    if (target.left < box.left + pad) scroller.scrollLeft -= box.left + pad - target.left;
    if (target.right > box.right - pad) scroller.scrollLeft += target.right - box.right + pad;
    if (target.top < box.top + pad) scroller.scrollTop -= box.top + pad - target.top;
    if (target.bottom > box.bottom - pad) scroller.scrollTop += target.bottom - box.bottom + pad;
  };
  reveal(board, host.querySelector(`.rx10-cell[data-rx-cell="${v.cursor.i},${v.cursor.j}"]`));
  host.querySelectorAll(".rx10-tokens").forEach(strip => reveal(strip, strip.querySelector(".is-active")));
  regex10Bind(host);
}
