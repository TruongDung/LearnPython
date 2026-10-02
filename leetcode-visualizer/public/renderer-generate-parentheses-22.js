"use strict";

function gp22Escape(value) {
  return escapeHtml(String(value ?? ""));
}

function renderGenerateParentheses22Bitmask(step, view, vi) {
  const n = Number.isInteger(view.n) ? view.n : 0;
  const width = Number.isInteger(view.width) ? view.width : n * 2;
  const totalMasks = Number.isInteger(view.totalMasks) ? view.totalMasks : 1 << width;
  const mask = Number.isInteger(view.mask) ? view.mask : null;
  const path = view.path || "";
  const balance = Number.isInteger(view.balance) ? view.balance : 0;
  const currentIndex = Number.isInteger(view.index) ? view.index : null;
  const phaseIndex = view.phase === "setup" || view.phase === "scan" ? 0
    : view.phase === "decode" ? 1
      : view.phase === "validate" || view.phase === "reject" ? 2 : 3;
  const phases = vi
    ? ["Chọn mask", "Giải mã từng bit", "Kiểm tra prefix", "Lưu đáp án"]
    : ["Choose a mask", "Decode each bit", "Validate prefixes", "Collect answers"];
  const phaseStrip = phases.map((label, index) => `<div class="gp22-phase ${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><span>${index < phaseIndex ? "✓" : index + 1}</span><b>${gp22Escape(label)}</b></div>`).join("");
  const binary = mask === null ? "".padStart(width, "0") : mask.toString(2).padStart(width, "0");

  const slots = Array.from({ length: width }, (_, index) => {
    const bit = mask === null ? 0 : (mask >> index) & 1;
    const char = path[index] || "·";
    const kind = char === "(" ? "open" : char === ")" ? "close" : "empty";
    const active = currentIndex === index ? " active-bit" : "";
    return `<span class="gp22-slot gp22-bit-slot ${kind}${active}"><small>i=${index}</small><b>${gp22Escape(char)}</b><em>bit ${bit}</em></span>`;
  }).join("");

  const prefixState = !view.valid
    ? { css: "rejected", label: vi ? "PREFIX SAI" : "INVALID PREFIX" }
    : balance < 0
      ? { css: "rejected", label: vi ? "BALANCE ÂM" : "NEGATIVE BALANCE" }
      : { css: "valid", label: vi ? "PREFIX HỢP LỆ" : "VALID PREFIX" };
  const candidateStatus = view.phase === "accept"
    ? { css: "accepted", label: vi ? "NHẬN" : "ACCEPT" }
    : view.phase === "reject"
      ? { css: "rejected", label: vi ? "LOẠI" : "REJECT" }
      : { css: "pending", label: vi ? "ĐANG XÉT" : "CHECKING" };

  const inspected = (view.inspected || []).length
    ? view.inspected.map((candidate) => {
      const state = candidate.accepted ? "accepted" : "rejected";
      const verdict = candidate.accepted ? (vi ? "nhận" : "accept") : (vi ? "loại" : "reject");
      return `<span class="gp22-mask-row ${state}"><code>${gp22Escape(candidate.bits)}</code><b>${gp22Escape(candidate.path || "∅")}</b><em>${gp22Escape(verdict)}</em></span>`;
    }).join("")
    : `<div class="gp22-empty">${vi ? "Chưa hoàn tất mask nào" : "No completed mask yet"}</div>`;
  const results = (view.results || []).length
    ? view.results.map((value, index) => `<span><small>#${index + 1}</small><b>${gp22Escape(value)}</b></span>`).join("")
    : `<div class="gp22-empty">${vi ? "Chưa có ứng viên hợp lệ" : "No valid candidate yet"}</div>`;
  const note = step.note ? pick(step.note) : "";
  const eventLabel = String(view.event || view.phase || "step").replaceAll("-", " ").toUpperCase();
  const progress = mask === null
    ? (view.phase === "done" ? totalMasks : 0)
    : Math.min(totalMasks, mask + 1);

  $("treeView").innerHTML = `<div class="gp22-viz gp22-bitmask-viz" role="img" aria-label="${gp22Escape(vi ? "Duyệt bitmask để sinh ngoặc hợp lệ" : "Bitmask enumeration for generating valid parentheses")}">
    <header class="gp22-header gp22-bitmask-header">
      <div><span>LEETCODE 22 · BITMASK</span><h2>${gp22Escape(step.title ? pick(step.title) : "Generate Parentheses")}</h2></div>
      <div class="gp22-progress"><small>${vi ? "mask đã xét" : "masks scanned"}</small><strong>${progress}/${totalMasks}</strong></div>
    </header>
    <div class="gp22-phases">${phaseStrip}</div>
    <section class="gp22-builder-card">
      <div class="gp22-card-heading"><div><small>${eventLabel}</small><h3>${vi ? "Giải mã ứng viên" : "Decode candidate"}</h3></div><code>${mask === null ? "—" : `${mask} = ${binary}₂`}</code></div>
      <div class="gp22-slots gp22-bit-slots">${slots}</div>
      <div class="gp22-counts gp22-bit-counts">
        <span class="open"><small>${vi ? "vị trí đang đọc" : "current index"}</small><b>${currentIndex === null ? "—" : currentIndex}</b><i style="--gp22-fill:${width && currentIndex !== null ? ((currentIndex + 1) / width) * 100 : 0}%"></i></span>
        <span class="balance"><small>balance</small><b>${balance}</b><i style="--gp22-fill:${n ? (Math.abs(balance) / n) * 100 : 0}%"></i></span>
        <span class="close"><small>${vi ? "kết quả" : "answers"}</small><b>${(view.results || []).length}</b><i style="--gp22-fill:${n ? ((view.results || []).length / Math.max(1, n)) * 30 : 0}%"></i></span>
      </div>
    </section>
    <div class="gp22-bit-rules">
      <article><strong>1</strong><b>(</b><span>balance + 1</span></article>
      <article><strong>0</strong><b>)</b><span>balance − 1</span></article>
      <article class="${prefixState.css}"><strong>prefix</strong><b>${balance}</b><span>${gp22Escape(prefixState.label)}</span></article>
      <article class="${candidateStatus.css}"><strong>candidate</strong><b>${path.length}/${width}</b><span>${gp22Escape(candidateStatus.label)}</span></article>
    </div>
    <div class="gp22-workspace gp22-bit-workspace">
      <section class="gp22-card"><div class="gp22-card-heading"><div><small>MASK WINDOW</small><h3>${vi ? "10 mask vừa hoàn tất" : "Last 10 completed masks"}</h3></div><code>${mask === null ? 0 : mask}/${totalMasks - 1}</code></div><div class="gp22-mask-window">${inspected}</div></section>
      <section class="gp22-card gp22-bit-legend"><div class="gp22-card-heading"><div><small>VALIDATION</small><h3>${vi ? "Điều kiện nhận" : "Acceptance rule"}</h3></div></div><ol><li>${vi ? "Không prefix nào có balance < 0" : "No prefix has balance < 0"}</li><li>${vi ? "Balance cuối cùng bằng 0" : "The final balance equals 0"}</li><li>${vi ? "Độ dài luôn bằng 2n" : "The length is always 2n"}</li></ol></section>
    </div>
    <section class="gp22-card gp22-results-card"><div class="gp22-card-heading"><div><small>CATALAN OUTPUT</small><h3>${vi ? "Kết quả đã tìm thấy" : "Completed results"}</h3></div><code>${(view.results || []).length}</code></div><div class="gp22-results">${results}</div></section>
    <aside class="gp22-note"><b>${vi ? "Tại sao bước này quan trọng" : "Why this frame matters"}</b><span>${gp22Escape(note)}</span></aside>
  </div>`;
}

function renderGenerateParentheses22View(step) {
  const view = step.generateParentheses22View || {};
  const vi = lang === "vi";
  if (view.approach === 2) {
    renderGenerateParentheses22Bitmask(step, view, vi);
    return;
  }
  const n = Number.isInteger(view.n) ? view.n : 0;
  const total = n * 2;
  const path = view.previewPath ?? view.path ?? "";
  const opened = view.previewOpened ?? view.opened ?? 0;
  const closed = view.previewClosed ?? view.closed ?? 0;
  const phaseIndex = view.phase === "setup" ? 0
    : view.phase === "choose" || view.phase === "blocked" ? 1
      : view.phase === "complete" ? 2 : 3;
  const phases = vi
    ? ["Khởi tạo state", "Chọn nhánh hợp lệ", "Lưu leaf hoàn chỉnh", "Quay lui / trả kết quả"]
    : ["Initialize state", "Choose a valid branch", "Save a complete leaf", "Backtrack / return"];
  const phaseStrip = phases.map((label, index) => `<div class="gp22-phase ${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><span>${index < phaseIndex ? "✓" : index + 1}</span><b>${gp22Escape(label)}</b></div>`).join("");

  const slots = Array.from({ length: total }, (_, index) => {
    const char = path[index] || "·";
    const kind = char === "(" ? "open" : char === ")" ? "close" : "empty";
    return `<span class="gp22-slot ${kind}${index === path.length - 1 ? " latest" : ""}"><small>${index}</small><b>${gp22Escape(char)}</b></span>`;
  }).join("");

  const check = view.check || {};
  const branchCard = (type, symbol, count, limit, rule) => {
    const checking = check.type === type;
    const pending = view.pendingChoice === symbol;
    const allowed = type === "open" ? opened < n : closed < opened;
    const state = pending ? "chosen" : checking ? (check.allowed ? "allowed" : "blocked") : allowed ? "available" : "blocked";
    const verdict = pending
      ? (vi ? "ĐANG CHỌN" : "CHOOSING")
      : checking
        ? (check.allowed ? (vi ? "HỢP LỆ" : "ALLOWED") : (vi ? "BỊ CHẶN" : "BLOCKED"))
        : allowed ? (vi ? "CÓ THỂ" : "AVAILABLE") : (vi ? "BỊ CHẶN" : "BLOCKED");
    return `<article class="gp22-branch ${state}"><header><strong>${gp22Escape(symbol)}</strong><span>${gp22Escape(verdict)}</span></header><div><b>${count}</b><small>${gp22Escape(rule)} ${limit}</small></div></article>`;
  };

  const levels = Array.from({ length: total + 1 }, (_, depth) => {
    const levelNodes = (view.nodes || []).filter((node) => node.depth === depth);
    if (!levelNodes.length && depth > path.length) return "";
    const cards = levelNodes.map((node) => {
      const label = node.path || "∅";
      const choice = node.choice || "root";
      return `<span class="gp22-node ${gp22Escape(node.state || "explored")}" title="open=${node.opened}, close=${node.closed}"><small>${gp22Escape(choice)}</small><b>${gp22Escape(label)}</b><em>${node.opened}/${node.closed}</em></span>`;
    }).join("") || `<span class="gp22-level-empty">${vi ? "chưa thăm" : "not visited"}</span>`;
    return `<div class="gp22-level"><label>${depth}</label><div>${cards}</div></div>`;
  }).filter(Boolean).join("");

  const stack = (view.stack || []).length
    ? view.stack.map((frame, index) => `<span class="${index === view.stack.length - 1 ? "top" : ""}"><small>#${index}</small><b>${gp22Escape(frame.path || "∅")}</b><em>${frame.opened}/${frame.closed}</em></span>`).reverse().join("")
    : `<div class="gp22-empty">${vi ? "Stack rỗng" : "Empty stack"}</div>`;
  const results = (view.results || []).length
    ? view.results.map((value, index) => `<span><small>#${index + 1}</small><b>${gp22Escape(value)}</b></span>`).join("")
    : `<div class="gp22-empty">${vi ? "Chưa có leaf hoàn chỉnh" : "No complete leaf yet"}</div>`;
  const note = step.note ? pick(step.note) : "";
  const eventLabel = String(view.event || view.phase || "step").replaceAll("-", " ").toUpperCase();

  $("treeView").innerHTML = `<div class="gp22-viz" role="img" aria-label="${gp22Escape(vi ? "Cây quay lui sinh ngoặc hợp lệ" : "Backtracking tree for generating valid parentheses")}">
    <header class="gp22-header">
      <div><span>LEETCODE 22 · BACKTRACKING</span><h2>${gp22Escape(step.title ? pick(step.title) : "Generate Parentheses")}</h2></div>
      <div class="gp22-progress"><small>${vi ? "độ dài" : "length"}</small><strong>${path.length}/${total}</strong></div>
    </header>
    <div class="gp22-phases">${phaseStrip}</div>
    <section class="gp22-builder-card">
      <div class="gp22-card-heading"><div><small>${eventLabel}</small><h3>${vi ? "Chuỗi đang xây" : "Current builder"}</h3></div><code>${gp22Escape(path || "∅")}</code></div>
      <div class="gp22-slots">${slots}</div>
      <div class="gp22-counts">
        <span class="open"><small>${vi ? "ngoặc mở" : "opened"}</small><b>${opened}/${n}</b><i style="--gp22-fill:${n ? (opened / n) * 100 : 0}%"></i></span>
        <span class="close"><small>${vi ? "ngoặc đóng" : "closed"}</small><b>${closed}/${n}</b><i style="--gp22-fill:${n ? (closed / n) * 100 : 0}%"></i></span>
        <span class="balance"><small>${vi ? "chưa ghép" : "unmatched"}</small><b>${opened - closed}</b><i style="--gp22-fill:${n ? ((opened - closed) / n) * 100 : 0}%"></i></span>
      </div>
    </section>
    <div class="gp22-branches">
      ${branchCard("open", "(", opened, n, "opened <")}
      ${branchCard("close", ")", closed, opened, "closed <")}
    </div>
    <div class="gp22-workspace">
      <section class="gp22-card gp22-tree-card"><div class="gp22-card-heading"><div><small>${vi ? "STATE GRAPH" : "STATE GRAPH"}</small><h3>${vi ? "Cây quyết định đã thăm" : "Visited decision tree"}</h3></div><code>${(view.nodes || []).length} states</code></div><div class="gp22-tree">${levels}</div></section>
      <section class="gp22-card gp22-stack-card"><div class="gp22-card-heading"><div><small>DFS</small><h3>${vi ? "Call stack" : "Call stack"}</h3></div><code>${(view.stack || []).length}</code></div><div class="gp22-stack">${stack}</div></section>
    </div>
    <section class="gp22-card gp22-results-card"><div class="gp22-card-heading"><div><small>CATALAN OUTPUT</small><h3>${vi ? "Kết quả đã tìm thấy" : "Completed results"}</h3></div><code>${(view.results || []).length}</code></div><div class="gp22-results">${results}</div></section>
    <aside class="gp22-note"><b>${vi ? "Tại sao bước này quan trọng" : "Why this frame matters"}</b><span>${gp22Escape(note)}</span></aside>
  </div>`;
}

