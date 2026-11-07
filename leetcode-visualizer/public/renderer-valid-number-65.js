"use strict";

function num65Escape(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function num65Glyph(char) { return ({ " ": "␣", "\t": "⇥", "\n": "↵", "\r": "↵" })[char] ?? char; }
function num65Text() {
  const vi = typeof lang !== "undefined" && lang === "vi";
  return { locale: vi ? "vi" : "en", region: vi ? "Máy kiểm tra số hợp lệ" : "Number validator",
    after: vi ? "Sau dòng" : "After line", ready: vi ? "Hợp lệ" : "Valid", invalid: vi ? "Không hợp lệ" : "Invalid",
    running: vi ? "Đang đọc" : "Reading", next: vi ? "Ký tự tiếp →" : "Next character →",
    move: vi ? "Chuyển trạng thái →" : "Next transition →", result: vi ? "Kết quả ↠" : "Result ↠",
    graph: vi ? "Bản đồ trạng thái DFA" : "DFA state map", active: vi ? "Hiện tại" : "Current",
    accept: vi ? "Có thể dừng" : "May finish", edge: vi ? "Đang chuyển" : "Transition",
    states: vi ? ["Bắt đầu", "Sau dấu", "Số nguyên", "Chờ số sau .", "Thập phân", "Sau e/E", "Dấu số mũ", "Số mũ"]
      : ["Start", "After sign", "Integer", "Digit after .", "Decimal", "After e/E", "Exponent sign", "Exponent"],
    types: vi ? ["Số", "Dấu", "Chấm", "Mũ", "Khác"] : ["Digit", "Sign", "Dot", "Exp", "Other"],
    blocked: vi ? "Không có cạnh cho ký tự này" : "No edge for this character",
    incomplete: vi ? "Hết chuỗi, nhưng số chưa hoàn chỉnh" : "End of input, but the number is incomplete",
    complete: vi ? "Đã đọc hết · số hoàn chỉnh" : "Entire input read · complete number",
    before: vi ? "Trước" : "Before",
  };
}

function num65Tape(v) {
  const items = v.chars.map((char, index) => {
    const active = index === v.cursor, role = v.consumed[index];
    return `<span class="num65-char ${active ? "is-active" : ""} ${role ? `is-read is-${role}` : ""} ${index === v.errorIndex ? "is-error" : ""}" data-char-index="${index}" data-char-value="${num65Escape(char)}" data-consumed="${role ?? "pending"}"><small>${active ? `i=${index}` : index}</small><b>${num65Escape(num65Glyph(char))}</b></span>`;
  }).join("");
  return `<div class="num65-tape" role="list" aria-label="s"><span class="num65-input-label">s</span>${items}<span class="num65-char num65-eof ${v.cursor === v.chars.length ? "is-active" : ""}" data-char-index="${v.chars.length}"><small>END</small><b>∅</b></span></div>`;
}

function num65Graph(v, t) {
  const points = [[60, 75], [60, 185], [225, 75], [60, 295], [225, 295], [390, 75], [390, 185], [390, 295]];
  const labelPositions = { "0:1": [78, 135], "0:2": [142, 59], "0:3": [12, 189], "1:2": [151, 142],
    "1:3": [78, 243], "2:2": [225, 17], "2:4": [241, 189], "2:5": [307, 59], "3:4": [142, 279],
    "4:4": [225, 366], "4:5": [307, 189], "5:6": [409, 135], "5:7": [468, 189], "6:7": [413, 243], "7:7": [390, 366] };
  const groupLabels = { digit: "0–9", sign: "±", dot: ".", e: "e/E" };
  function path(from, to) {
    const [x, y] = points[from], [tx, ty] = points[to];
    if (from === to) {
      const sign = from === 2 ? -1 : 1;
      return `M${x - 18},${y + 20 * sign} C${x - 40},${y + 65 * sign} ${x + 40},${y + 65 * sign} ${x + 18},${y + 20 * sign}`;
    }
    if (from === 0 && to === 3) return "M37,92 C0,105 0,265 37,278";
    if (from === 5 && to === 7) return "M413,92 C470,105 470,265 413,278";
    const dx = tx - x, dy = ty - y, length = Math.hypot(dx, dy);
    return `M${x + dx / length * 26},${y + dy / length * 26} L${tx - dx / length * 33},${ty - dy / length * 33}`;
  }
  const edges = v.machine.flatMap((row, from) => Object.entries(row).map(([group, to]) => {
    const key = `${from}:${to}`, [x, y] = labelPositions[key];
    const moved = v.move?.from === from && v.move?.to === to && v.move?.group === group;
    const checking = !v.move && v.lookup?.allowed && v.lookup.from === from && v.lookup.to === to && v.lookup.group === group;
    const visited = v.trail.some(item => item.from === from && item.to === to && item.group === group);
    const kind = moved ? "move" : checking ? "check" : visited ? "visited" : "normal";
    const labelWidth = group === "digit" ? 34 : group === "e" ? 28 : 16;
    return `<g class="num65-edge is-${kind}" data-edge-from="${from}" data-edge-to="${to}" data-edge-group="${group}" data-edge-active="${moved ? "move" : checking ? "check" : "none"}"><path d="${path(from, to)}" marker-end="url(#num65-arrow-${kind})"/><rect x="${x - labelWidth / 2}" y="${y - 11}" width="${labelWidth}" height="16" rx="4"/><text x="${x}" y="${y}">${groupLabels[group]}</text></g>`;
  })).join("");
  const icons = ["▷", "±", "12", ".", ".5", "e", "±", "12"];
  const nodes = points.map(([x, y], id) => {
    const accepting = v.accepting.includes(id), current = v.state === id;
    const blocked = current && v.lookup && !v.lookup.allowed;
    return `<g class="num65-state ${current ? "is-current" : ""} ${accepting ? "is-accepting" : ""} ${blocked ? "is-blocked" : ""}" data-state-id="${id}" data-state-current="${current}" data-state-accepting="${accepting}"><title>S${id} · ${t.states[id]}${accepting ? ` · ${t.accept}` : ""}</title>${accepting ? `<circle class="num65-accept-ring" cx="${x}" cy="${y}" r="30"/>` : ""}<circle class="num65-state-circle" cx="${x}" cy="${y}" r="25"/><text class="num65-state-id" x="${x}" y="${y - 3}">S${id}</text><text class="num65-state-icon" x="${x}" y="${y + 15}">${icons[id]}</text><rect class="num65-state-label-bg" x="${x - 57}" y="${y + 33}" width="114" height="20" rx="5"/><text class="num65-state-label" x="${x}" y="${y + 47}">${t.states[id]}</text></g>`;
  }).join("");
  return `<div class="num65-graph-scroll" tabindex="0" role="region" aria-label="${t.graph}"><svg class="num65-graph ${v.machineReady ? "" : "is-building"}" width="490" height="382" viewBox="0 0 490 382" role="img" aria-label="${t.graph}"><title>${t.graph}</title><defs>${["normal", "visited", "check", "move"].map(kind => `<marker id="num65-arrow-${kind}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z"/></marker>`).join("")}</defs>${edges}${nodes}</svg></div>`;
}

function num65Focus(v, t) {
  const eof = v.cursor === v.chars.length, arrow = v.move ?? v.lookup;
  const from = arrow?.from ?? v.state;
  const rejected = v.lookup && !v.lookup.allowed;
  const to = eof ? v.answer === null ? "?" : v.answer ? "✓" : "×"
    : arrow?.to === null ? "×" : arrow?.to === undefined ? "?" : `S${arrow.to}`;
  const char = eof ? "END" : v.cursor === null ? "…" : num65Glyph(v.chars[v.cursor]);
  const hint = v.reason === "blocked" ? t.blocked : v.reason === "incomplete" ? t.incomplete : v.reason === "valid" ? t.complete : "";
  return `<div class="num65-focus ${rejected || v.answer === false ? "is-error" : v.move || v.answer === true ? "is-moved" : ""}" data-focus-from="${from}" data-focus-to="${eof ? "end" : arrow?.to ?? "unknown"}"><span class="num65-room"><small>${v.move ? t.before : "state"}</small><b>${from === null ? "—" : `S${from}`}</b></span><span class="num65-pass"><b>${num65Escape(char)}</b><i>${v.move ? "━━▶" : "┄┄▶"}</i><small>${num65Escape(v.classified ?? (eof ? "END" : "g = ?"))}</small></span><span class="num65-room num65-target"><small>${v.move ? "state" : "?"}</small><b>${to}</b></span>${hint ? `<p class="num65-hint">${hint}</p>` : ""}</div>`;
}

function num65Jump(kind) {
  if (typeof steps === "undefined" || typeof renderStep !== "function") return;
  if (typeof stopPlay === "function") stopPlay();
  const next = steps.findIndex((s, index) => {
    const v = s.validNumber65View;
    return index > stepIndex && v && (kind === "result" ? v.answer !== null
      : kind === "char" ? v.source.line === 15 && v.branch === true : v.source.line === 28 || v.answer !== null);
  });
  stepIndex = next < 0 ? steps.length - 1 : next; renderStep();
}

function num65Bind(host) {
  const bind = (selector, action) => host.querySelectorAll(selector).forEach(node => {
    node.addEventListener("click", () => action(node));
    node.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); action(node); }
    });
  });
  bind("[data-num65-jump]", node => num65Jump(node.dataset.num65Jump));
  bind("[data-num65-case]", node => {
    if (typeof runViz !== "function") return;
    const cases = ["+3.14e-2", "-.9", "4.", "1e", "99e2.5", "--6", "abc", ""];
    document.getElementById("arrInput").value = cases[Number(node.dataset.num65Case)]; runViz();
  });
}

function renderValidNumber65Pictures(step) {
  const host = document.getElementById("treeView"), v = step.validNumber65View, t = num65Text();
  if (!host || !v) return;
  const oldScroll = host.querySelector(".num65-graph-scroll")?.scrollLeft ?? 0;
  const presets = ["+3.14e-2", "-.9", "4.", "1e", "99e2.5", "--6", "abc", "∅"];
  const groups = ["digit", "sign", "dot", "e", "invalid"].map((group, index) => `<span class="num65-kind ${v.classified === group ? "is-picked" : ""}" data-kind="${group}" data-kind-picked="${v.classified === group}"><b>${["0–9", "±", ".", "e/E", "×"][index]}</b><small>${t.types[index]}</small></span>`).join("");
  const status = v.answer === null ? t.running : v.answer ? t.ready : t.invalid;
  host.innerHTML = `<article class="num65-viz" role="region" aria-label="${t.region}" data-source-line="${v.source.line}">
    <header class="num65-header"><div><small>LEETCODE 65 · DFA</small><h2>${num65Escape(v.phase[t.locale])}</h2></div><b class="num65-status ${v.answer === null ? "is-pending" : v.answer ? "is-valid" : "is-invalid"}" data-answer="${v.answer}">${v.answer === null ? "◌" : v.answer ? "✓" : "×"} ${status}</b></header>
    <nav class="num65-presets" aria-label="Examples">${presets.map((label, index) => `<button type="button" data-num65-case="${index}">${label}</button>`).join("")}</nav>
    ${num65Tape(v)}
    <div class="num65-source"><span>${t.after} <b>L${v.source.line}</b></span><code>${num65Escape(v.source.text)}</code>${v.branch === null ? "" : `<strong class="${v.branch ? "is-true" : "is-false"}" data-branch="${v.branch}">${v.branch ? "True ✓" : "False ×"}</strong>`}</div>
    <div class="num65-kinds" aria-label="g">${groups}</div>${num65Focus(v, t)}
    <section class="num65-map">${num65Graph(v, t)}<div class="num65-legend"><span class="is-current">● ${t.active}</span><span class="is-accepting">◎ ${t.accept}</span><span class="is-move">→ ${t.edge}</span></div></section>
    <footer class="num65-footer"><div><button type="button" data-num65-jump="char">${t.next}</button><button type="button" data-num65-jump="move">${t.move}</button><button type="button" data-num65-jump="result">${t.result}</button></div><small>O(n) time · O(1) space</small></footer>
  </article>`;
  const reveal = (scroller, target) => {
    if (!scroller || !target) return;
    const box = scroller.getBoundingClientRect(), item = target.getBoundingClientRect(), pad = 10;
    if (item.left < box.left + pad) scroller.scrollLeft -= box.left + pad - item.left;
    if (item.right > box.right - pad) scroller.scrollLeft += item.right - box.right + pad;
  };
  const graph = host.querySelector(".num65-graph-scroll");
  if (graph) graph.scrollLeft = oldScroll;
  reveal(graph, host.querySelector(".num65-state.is-current"));
  reveal(host.querySelector(".num65-tape"), host.querySelector(".num65-char.is-active"));
  num65Bind(host);
}
