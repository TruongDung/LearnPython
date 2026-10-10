"use strict";

function renderStockPrice2034View(step) {
  const view = step.stockPrice2034View;
  if (!view) return;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const phaseIndex = view.phase === "init" ? 0
    : ["update-start", "map-update"].includes(view.phase) ? 1
      : view.phase === "heap-push" ? 2
        : 3;
  const phases = [
    ["1. Khởi tạo", "1. Initialize"],
    ["2. Map = sự thật", "2. Map = truth"],
    ["3. Push hai heap", "3. Push both heaps"],
    ["4. Dọn root + trả lời", "4. Prune root + answer"],
  ];
  const phasesHtml = phases.map((labels, index) => `<span class="${index === phaseIndex ? "active" : ""}${index < phaseIndex ? " done" : ""}">${text(...labels)}</span>`).join("");

  const maxPrice = Math.max(1, ...view.prices.map((entry) => entry.price));
  const timelineHtml = view.prices.length ? view.prices.map((entry) => {
    const height = 24 + Math.round((entry.price / maxPrice) * 76);
    return `<div class="sp2034-tick ${entry.latest ? "latest" : ""}">
      <div class="sp2034-price" style="height:${height}px"><b>$${entry.price}</b></div>
      <span>t=${entry.timestamp}</span>
      ${entry.latest ? `<i>${text("MỚI NHẤT", "LATEST")}</i>` : ""}
    </div>`;
  }).join("") : `<p class="sp2034-empty">${text("Chưa có bản ghi", "No records yet")}</p>`;

  const renderHeap = (heap, kind) => {
    const title = kind === "max" ? "MAX-HEAP" : "MIN-HEAP";
    const hint = kind === "max" ? text("key = −price", "key = −price") : text("key = price", "key = price");
    const nodes = heap.length ? heap.slice(0, 15).map((entry, index) => `<div class="sp2034-node ${entry.valid ? "valid" : "stale"} ${entry.root ? "root" : ""}" style="--depth:${Math.floor(Math.log2(index + 1))}">
      ${entry.root ? `<small>ROOT</small>` : ""}<b>$${entry.price}</b><span>t=${entry.timestamp}</span>
    </div>`).join("") : `<p class="sp2034-empty">${text("Heap rỗng", "Empty heap")}</p>`;
    const staleCount = heap.filter((entry) => !entry.valid).length;
    return `<section class="sp2034-heap ${kind}"><header><div><strong>${title}</strong><small>${hint}</small></div><span>${heap.length} ${text("entries", "entries")} · <em>${staleCount} stale</em></span></header><div class="sp2034-nodes">${nodes}</div></section>`;
  };

  const query = view.query;
  const queryPanel = query ? `<section class="sp2034-query ${query.status}">
    <small>${text("TRUY VẤN ĐANG CHẠY", "ACTIVE QUERY")}</small>
    <strong>${query.kind}()</strong>
    <div>${query.status === "stale"
      ? text("Root sai phiên bản → phải pop", "Root has the wrong version → pop it")
      : query.status === "pruned"
        ? text(`Đã bỏ $${view.pruned?.price} tại t=${view.pruned?.timestamp}`, `Removed $${view.pruned?.price} at t=${view.pruned?.timestamp}`)
        : query.status === "answer"
          ? `<span>${text("Kết quả", "Result")}</span><b>$${query.result}</b>${query.timestamp ? `<em>t=${query.timestamp}</em>` : ""}`
          : text("So root với prices[timestamp]", "Compare the root with prices[timestamp]")}</div>
  </section>` : `<section class="sp2034-query idle"><small>${text("QUY TẮC HỢP LỆ", "VALIDITY RULE")}</small><strong>heap.price == prices[t]</strong><div>${text("Sai → stale, đúng → dùng được", "Mismatch → stale, match → valid")}</div></section>`;

  const mapRows = view.prices.length ? view.prices.map((entry) => `<tr class="${entry.latest ? "latest" : ""}"><td>${entry.timestamp}</td><td>$${entry.price}</td><td>${entry.latest ? text("current()", "current()") : "—"}</td></tr>`).join("") : `<tr><td colspan="3">${text("Map rỗng", "Empty map")}</td></tr>`;
  const historyHtml = view.history.length ? view.history.slice(-8).map((entry) => `<li><span>#${entry.index}</span><code>${escapeHtml(entry.label)}</code><b>${entry.result === null ? "—" : `$${entry.result}`}</b></li>`).join("") : `<li><span>—</span><em>${text("Chưa có thao tác", "No operations yet")}</em><b>—</b></li>`;
  const validEntries = view.minHeap.filter((entry) => entry.valid).length;
  const staleEntries = view.minHeap.length - validEntries;

  $("treeView").innerHTML = `<section class="sp2034-viz" aria-label="${text("Mô phỏng biến động giá cổ phiếu", "Stock price fluctuation simulation")}">
    <header class="sp2034-heading"><div><small>#2034 · MEDIUM · DESIGN / HEAP</small><h3>${text("Correction tức thì, xóa heap khi cần", "Instant corrections, heap cleanup on demand")}</h3></div><div class="sp2034-current"><small>current()</small><b>${view.latest ? `$${view.prices.find((entry) => entry.latest)?.price}` : "—"}</b><span>${view.latest ? `timestamp ${view.latest}` : text("chưa update", "not updated")}</span></div></header>
    <nav class="sp2034-phases">${phasesHtml}</nav>
    <div class="sp2034-action"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <div class="sp2034-main">
      <section class="sp2034-market"><header><strong>${text("Timeline — trạng thái hiện tại", "Timeline — current state")}</strong><span>${view.prices.length} timestamps</span></header><div class="sp2034-chart">${timelineHtml}</div></section>
      <aside class="sp2034-truth"><header><strong>prices[t]</strong><span>${text("nguồn sự thật", "source of truth")}</span></header><table><thead><tr><th>timestamp</th><th>price</th><th>role</th></tr></thead><tbody>${mapRows}</tbody></table></aside>
    </div>
    <div class="sp2034-heaps">${renderHeap(view.maxHeap, "max")}${renderHeap(view.minHeap, "min")}</div>
    <div class="sp2034-bottom">
      ${queryPanel}
      <section class="sp2034-ledger"><header><strong>${text("Log thao tác", "Operation log")}</strong><span>${view.operationIndex === null ? view.operationCount : Math.min(view.operationIndex + 1, view.operationCount)}/${view.operationCount}</span></header><ol>${historyHtml}</ol></section>
      <section class="sp2034-score"><div><small>${text("Bản hợp lệ", "Valid versions")}</small><b>${validEntries}</b></div><div class="stale"><small>${text("Bản stale còn chờ", "Stale versions waiting")}</small><b>${staleEntries}</b></div><p>${text("Correction chỉ đổi map và push bản mới. Stale entry vô hại cho tới khi nó chặn root; lúc đó query pop nó đúng một lần.", "A correction only changes the map and pushes a new version. A stale entry is harmless until it blocks the root; then a query pops it exactly once.")}</p></section>
    </div>
    <details class="sp2034-proof"${view.phase === "done" ? " open" : ""}><summary>${text("Vì sao lazy deletion vẫn đúng và nhanh?", "Why is lazy deletion still correct and fast?")}</summary><p>${text("Map quyết định phiên bản nào hợp lệ. Một cực trị chỉ có thể nằm ở root sau khi mọi root stale đã bị bỏ. Mỗi update tạo hai entry và mỗi entry stale chỉ bị pop một lần, nên tổng chi phí dọn heap được dàn đều qua các truy vấn.", "The map decides which version is valid. An extreme can only be at the root after all stale roots are removed. Each update creates two entries and every stale entry is popped once, so cleanup cost is amortized across queries.")}</p></details>
  </section>`;
}
