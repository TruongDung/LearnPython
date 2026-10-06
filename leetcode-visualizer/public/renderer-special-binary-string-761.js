"use strict";

function renderSpecialBinary761View(step) {
  const raw = step && step.specialBinary761View && typeof step.specialBinary761View === "object"
    ? step.specialBinary761View
    : {};
  const locale = typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
  const text = (en, vi) => locale === "vi" ? vi : en;
  const escape = (value) => String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  const localized = (value, fallback = "") => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return String(value[locale] ?? value.en ?? value.vi ?? fallback);
    }
    return typeof value === "string" ? value : fallback;
  };
  const integer = (value, minimum, maximum) => Number.isSafeInteger(value)
    && value >= minimum && value <= maximum ? value : null;
  const binary = (value, maximum = 50) => typeof value === "string" && /^[01]*$/.test(value)
    ? value.slice(0, maximum)
    : "";
  const span = (value, maximum) => {
    if (!Array.isArray(value) || value.length < 2) return null;
    const left = integer(value[0], 0, maximum);
    const right = integer(value[1], -1, maximum);
    return left !== null && right !== null && left <= right + 1 ? [left, right] : null;
  };
  const component = (value, maximum) => {
    if (!value || typeof value !== "object") return null;
    const source = binary(value.source);
    const rawInner = binary(value.rawInner);
    const optimizedInner = value.optimizedInner === null ? null : binary(value.optimizedInner);
    const wrapped = value.wrapped === null ? null : binary(value.wrapped);
    return {
      discovery: integer(value.discovery, 0, 50) ?? 0,
      span: span(value.span, maximum),
      source,
      rawInner,
      optimizedInner,
      wrapped,
    };
  };

  const original = binary(raw.original) || "10";
  const n = original.length;
  const input = binary(raw.input);
  const callSpan = span(raw.callSpan, n);
  const activeSpan = span(raw.activeSpan, n);
  const absoluteIndex = integer(raw.absoluteIndex, 0, Math.max(0, n - 1));
  const componentStart = integer(raw.componentStart, 0, input.length) ?? 0;
  const balance = integer(raw.balance, 0, n) ?? 0;
  const components = Array.isArray(raw.components)
    ? raw.components.slice(0, 25).map((item) => component(item, n)).filter(Boolean)
    : [];
  const pending = component(raw.pending, n);
  const statuses = new Set(["enter", "collect", "scan", "boundary", "waiting", "child-return", "wrap", "advance", "sort", "return"]);
  const stack = Array.isArray(raw.stack) ? raw.stack.slice(0, 26).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const frameInput = binary(item.input);
    return [{
      id: integer(item.id, 1, 100) ?? 1,
      depth: integer(item.depth, 0, 25) ?? 0,
      input: frameInput,
      balance: integer(item.balance, 0, n) ?? 0,
      status: statuses.has(item.status) ? item.status : "collect",
      result: item.result === null ? null : binary(item.result),
      parts: Array.isArray(item.parts)
        ? item.parts.slice(0, 25).map((part) => component(part, n)).filter(Boolean)
        : [],
    }];
  }) : [];
  const order = (value) => Array.isArray(value)
    ? value.slice(0, 25).map((item) => binary(item)).filter((item) => item !== "")
    : null;
  const orderBefore = order(raw.orderBefore);
  const orderAfter = order(raw.orderAfter);
  const history = Array.isArray(raw.balanceHistory)
    ? raw.balanceHistory.slice(0, input.length).map((value) => integer(value, 0, n))
    : [];
  const result = raw.result === null ? null : binary(raw.result);
  const answer = raw.answer === null ? null : binary(raw.answer);
  const countersRaw = raw.counters && typeof raw.counters === "object" ? raw.counters : {};
  const counter = (key) => integer(countersRaw[key], 0, 10000) ?? 0;
  const phaseLabels = {
    decompose: text("DECOMPOSE", "PHÂN RÃ"),
    scan: text("SCAN BALANCE", "QUÉT BALANCE"),
    recurse: text("RECURSE", "ĐỆ QUY"),
    rebuild: text("REBUILD", "BỌC LẠI"),
    sort: text("SORT DESCENDING", "SẮP XẾP GIẢM"),
    return: text("RETURN", "TRẢ VỀ"),
  };
  const phase = Object.hasOwn(phaseLabels, raw.phase) ? raw.phase : "decompose";

  const completedSpans = components.map((item) => item.span).filter(Boolean);
  const bitCells = [...original].map((bit, index) => {
    const classes = ["sb761-bit", bit === "1" ? "open" : "close"];
    if (callSpan && index >= callSpan[0] && index <= callSpan[1]) classes.push("in-call");
    if (activeSpan && index >= activeSpan[0] && index <= activeSpan[1]) classes.push("active-component");
    if (completedSpans.some(([left, right]) => index >= left && index <= right)) classes.push("completed");
    if (index === absoluteIndex) classes.push("current");
    const pointer = index === absoluteIndex ? `<span class="sb761-pointer">i</span>` : "";
    return `<li class="${classes.join(" ")}" aria-label="${text("index", "chỉ số")} ${index}, bit ${bit}">
      <small>${index}</small><strong>${bit}</strong><span>${bit === "1" ? "＋" : "−"}</span>${pointer}
    </li>`;
  }).join("");

  const balanceBars = [...input].map((bit, index) => {
    const value = history[index];
    const known = value !== null && value !== undefined;
    const level = known ? Math.min(12, value) : 0;
    const isCurrent = absoluteIndex !== null && callSpan && index + callSpan[0] === absoluteIndex;
    return `<li class="${isCurrent ? "current" : ""} ${known ? "known" : "pending"}">
      <small>${index}</small><div style="--sb761-level:${level}"><span>${known ? value : "·"}</span></div><b>${bit}</b>
    </li>`;
  }).join("");

  const stackCards = stack.map((frame, index) => {
    const active = index === stack.length - 1 ? "active" : "";
    const content = frame.input || "ε";
    const parts = frame.parts.map((part) => part.wrapped || "…").join(" · ") || "—";
    return `<li class="sb761-frame ${active} ${frame.status}">
      <div><small>#${frame.id} · ${text("DEPTH", "ĐỘ SÂU")} ${frame.depth}</small><span>${escape(frame.status)}</span></div>
      <strong>${escape(content)}</strong>
      <p><span>balance ${frame.balance}</span><span>parts ${escape(parts)}</span></p>
      ${frame.result !== null ? `<em>↩ ${escape(frame.result || "ε")}</em>` : ""}
    </li>`;
  }).join("");

  const componentCards = components.map((item, index) => `<li class="sb761-component">
    <div><small>#${index + 1}${item.span ? ` · [${item.span[0]}, ${item.span[1]}]` : ""}</small><span>${escape(item.source)}</span></div>
    <div class="sb761-equation"><code>1</code><code>${escape(item.optimizedInner || "ε")}</code><code>0</code><b>→</b><strong>${escape(item.wrapped || "…")}</strong></div>
    <p>${text("interior", "phần trong")}: ${escape(item.rawInner || "ε")} → ${escape(item.optimizedInner || "ε")}</p>
  </li>`).join("");

  const chips = (items, variant) => items && items.length
    ? items.map((item, index) => `<span class="sb761-chip ${variant || ""}"><small>${index + 1}</small>${escape(item)}</span>`).join("")
    : `<em>${text("waiting", "đang chờ")}</em>`;
  const currentOrder = components.map((item) => item.wrapped).filter(Boolean);
  const before = orderBefore || currentOrder;
  const pendingPanel = pending ? `<section class="sb761-pending">
    <div><small>${text("CURRENT COMPONENT", "THÀNH PHẦN HIỆN TẠI")}</small><strong>${escape(pending.source || "ε")}</strong></div>
    <b>1&nbsp; ${escape(pending.rawInner || "ε")}&nbsp; 0</b>
    <span>${pending.optimizedInner === null ? text("waiting for recursive result", "đang chờ kết quả đệ quy") : `${escape(pending.rawInner || "ε")} → ${escape(pending.optimizedInner || "ε")}`}</span>
  </section>` : "";

  const title = localized(step && step.title, text("Special Binary String", "Chuỗi nhị phân đặc biệt"));
  const note = localized(step && step.note, text("Follow the recursive decomposition.", "Theo dõi quá trình phân rã đệ quy."));
  const host = typeof $ === "function" ? $("treeView") : null;
  if (!host) return;

  host.innerHTML = `<section class="sb761-viz" aria-label="${text("Special Binary String visualization", "Trực quan Chuỗi nhị phân đặc biệt")}">
    <header class="sb761-header">
      <div><small>LEETCODE 761 · RECURSION + GREEDY SORT</small><h2>${escape(title)}</h2></div>
      <div><strong>${phaseLabels[phase]}</strong><span>${escape(String(raw.event || "call-enter").replace(/-/g, " "))}</span><em>${text("call", "lời gọi")} #${integer(raw.callId, 1, 100) ?? 1}</em></div>
    </header>

    <div class="sb761-rule"><strong>1 = (</strong><strong>0 = )</strong><span>${text("balance 0 closes a top-level special component", "balance 0 đóng một thành phần đặc biệt cấp cao nhất")}</span><b>${text("recurse → wrap → sort ↓ → join", "đệ quy → bọc → sort ↓ → nối")}</b></div>

    <section class="sb761-panel sb761-input-panel">
      <header><div><strong>${text("ORIGINAL STRING", "CHUỖI BAN ĐẦU")}</strong><span>${text("Current call and component boundaries stay aligned to original indices.", "Lời gọi và ranh giới thành phần luôn khớp chỉ số chuỗi gốc.")}</span></div><b>${n} ${text("bits", "bit")}</b></header>
      <div class="sb761-scroll" tabindex="0"><ol class="sb761-bits">${bitCells}</ol></div>
      <div class="sb761-legend"><span class="call">${text("current call", "lời gọi hiện tại")}</span><span class="active">${text("open component", "thành phần đang mở")}</span><span class="done">${text("collected component", "thành phần đã thu")}</span><span class="cursor">${text("current bit", "bit hiện tại")}</span></div>
    </section>

    <div class="sb761-grid">
      <section class="sb761-panel">
        <header><div><strong>${text("BALANCE IN CURRENT CALL", "BALANCE TRONG LỜI GỌI")}</strong><span>${text("A return to zero creates a safe split.", "Trở về 0 tạo một điểm tách hợp lệ.")}</span></div><b>${balance}</b></header>
        <div class="sb761-balance-scroll" tabindex="0"><ol class="sb761-balance">${balanceBars || `<li class="base"><div><span>0</span></div><b>ε</b></li>`}</ol></div>
        <div class="sb761-call-summary"><span>s = <strong>${escape(input || "ε")}</strong></span><span>start = <strong>${componentStart}</strong></span><span>depth = <strong>${integer(raw.depth, 0, 25) ?? 0}</strong></span></div>
        ${pendingPanel}
      </section>

      <section class="sb761-panel">
        <header><div><strong>${text("RECURSION STACK", "NGĂN XẾP ĐỆ QUY")}</strong><span>${text("The deepest frame is active; parents wait for optimized interiors.", "Khung sâu nhất đang chạy; lời gọi cha chờ phần trong tối ưu.")}</span></div><b>${stack.length}</b></header>
        <ol class="sb761-stack">${stackCards || `<li class="sb761-empty">${text("All calls returned.", "Mọi lời gọi đã trả về.")}</li>`}</ol>
      </section>
    </div>

    <section class="sb761-panel">
      <header><div><strong>${text("OPTIMIZED COMPONENTS", "CÁC THÀNH PHẦN ĐÃ TỐI ƯU")}</strong><span>${text("Optimize each interior independently, then restore its outer 1...0.", "Tối ưu độc lập từng phần trong rồi khôi phục cặp 1...0 bên ngoài.")}</span></div><b>${components.length}</b></header>
      <ol class="sb761-components">${componentCards || `<li class="sb761-empty">${text("No complete component in this call yet.", "Lời gọi này chưa có thành phần hoàn chỉnh.")}</li>`}</ol>
    </section>

    <section class="sb761-panel sb761-sort-panel">
      <header><div><strong>${text("GREEDY DESCENDING ORDER", "THỨ TỰ GIẢM DẦN THAM LAM")}</strong><span>${text("Adjacent top-level components may be swapped, so larger strings belong first.", "Có thể đổi chỗ các thành phần cấp cao nhất kề nhau, nên chuỗi lớn hơn đứng trước.")}</span></div><b>↓ lexicographic</b></header>
      <div class="sb761-sort-lanes"><div><small>${text("DISCOVERY ORDER", "THỨ TỰ TÌM THẤY")}</small><div>${chips(before, "before")}</div></div><strong>→</strong><div><small>${text("DESCENDING ORDER", "THỨ TỰ GIẢM DẦN")}</small><div>${chips(orderAfter, "after")}</div></div></div>
      <div class="sb761-join"><span>${text("joined return value", "giá trị nối trả về")}</span><strong>${escape(result === null ? "—" : result || "ε")}</strong></div>
    </section>

    <section class="sb761-stats" aria-label="${text("operation counters", "bộ đếm thao tác")}">
      <div><small>${text("CALLS", "LỜI GỌI")}</small><strong>${counter("calls")}</strong></div><div><small>${text("BITS SCANNED", "BIT ĐÃ QUÉT")}</small><strong>${counter("scannedBits")}</strong></div><div><small>${text("ZERO BOUNDARIES", "RANH GIỚI 0")}</small><strong>${counter("boundaries")}</strong></div><div><small>${text("COMPONENTS", "THÀNH PHẦN")}</small><strong>${counter("components")}</strong></div><div><small>${text("SORTS", "LẦN SORT")}</small><strong>${counter("sorts")}</strong></div>
    </section>

    ${answer !== null ? `<section class="sb761-answer"><small>${text("LEXICOGRAPHICALLY LARGEST SPECIAL STRING", "CHUỖI ĐẶC BIỆT LỚN NHẤT")}</small><strong>${escape(answer)}</strong><span>${escape(original)} → ${escape(answer)}</span></section>` : ""}
    ${raw.shortened === true ? `<p class="sb761-short">${text("The teaching trace was capped at 600 frames; the final answer still uses the complete algorithm.", "Trace giảng dạy được giới hạn 600 frame; đáp án cuối vẫn chạy thuật toán đầy đủ.")}</p>` : ""}
    <footer class="sb761-note"><strong>${text("WHY THIS STEP", "Ý NGHĨA BƯỚC NÀY")}</strong><span>${escape(note)}</span></footer>
  </section>`;
}
