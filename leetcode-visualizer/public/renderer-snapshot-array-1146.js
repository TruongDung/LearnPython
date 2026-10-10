"use strict";

function renderSnapshotArray1146View(step) {
  const view = step.snapshotArray1146View;
  if (!view) return;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const phaseNumber = ["init", "set-update", "set-append", "snap", "get-start", "search-right", "search-left", "get-done", "done"].includes(view.phase)
    ? view.phase === "init" ? 0 : view.phase.startsWith("set") ? 1 : view.phase === "snap" ? 2 : 3
    : 0;
  const phases = [
    ["1. Khởi tạo", "1. Initialize"],
    ["2. Ghi thay đổi", "2. Store change"],
    ["3. Chụp snapshot", "3. Take snapshot"],
    ["4. Đọc bằng bisect", "4. Read with bisect"],
  ];
  const phaseHtml = phases.map((labels, index) => `<span class="${index === phaseNumber ? "active" : ""}${index < phaseNumber ? " done" : ""}">${text(...labels)}</span>`).join("");
  const binary = view.binary;
  const querySnapId = binary?.querySnapId;
  const histories = view.histories.map((records, index) => {
    const recordHtml = records.map(([recordSnapId, value], position) => {
      const isMid = binary && index === view.activeIndex && binary.mid === position;
      const isResult = binary && index === view.activeIndex && binary.resultPosition === position;
      const valid = binary && index === view.activeIndex && recordSnapId <= querySnapId;
      const classes = [isMid ? "mid" : "", isResult ? "result" : "", valid ? "valid" : ""].filter(Boolean).join(" ");
      const pointers = binary && index === view.activeIndex
        ? `${binary.low === position ? "<i>lo</i>" : ""}${binary.mid === position ? "<i>mid</i>" : ""}${binary.high === position ? "<i>hi</i>" : ""}`
        : "";
      return `<div class="sa1146-record ${classes}">${pointers}<small>snap ${recordSnapId}</small><b>${value}</b></div>`;
    }).join("");
    const highAtEnd = binary && index === view.activeIndex && binary.high === records.length ? `<i class="sa1146-end-pointer">hi</i>` : "";
    return `<div class="sa1146-history-row ${index === view.activeIndex ? "active" : ""}"><header><span>index</span><b>${index}</b></header><div class="sa1146-track">${recordHtml}${highAtEnd}</div></div>`;
  }).join("");

  const storedRecords = view.histories.reduce((sum, records) => sum + records.length, 0);
  const conceptualCells = view.length * Math.max(1, view.snapId + 1);
  const binaryPanel = binary ? `<section class="sa1146-bisect ${binary.decision}">
    <header><strong>bisect_right(records, (${querySnapId}, ∞))</strong><span>index ${view.activeIndex}</span></header>
    <div class="sa1146-bounds"><span><small>lo</small><b>${binary.low}</b></span><span><small>mid</small><b>${binary.mid ?? "—"}</b></span><span><small>hi</small><b>${binary.high}</b></span></div>
    <p>${binary.decision === "right"
      ? text("snap(mid) ≤ query → giữ mid làm ứng viên, đi phải", "snap(mid) ≤ query → keep mid as a candidate, move right")
      : binary.decision === "left"
        ? text("snap(mid) > query → record thuộc tương lai, đi trái", "snap(mid) > query → the record is in the future, move left")
        : binary.decision === "found"
          ? text(`Vị trí = lo − 1 = ${binary.resultPosition}; trả value ${binary.record?.[1]}`, `Position = lo − 1 = ${binary.resultPosition}; return value ${binary.record?.[1]}`)
          : text("Tìm record ngoài cùng bên phải có snap_id ≤ query", "Find the rightmost record with snap_id ≤ query")}</p>
  </section>` : `<section class="sa1146-bisect empty"><strong>${text("Binary search chỉ chạy khi get", "Binary search runs only for get")}</strong><p>${text("set lưu thay đổi; snap chỉ tăng ID.", "set stores changes; snap only increments the ID.")}</p></section>`;

  const historyHtml = view.operationHistory.length
    ? view.operationHistory.slice(-8).map((entry) => `<li><span>#${entry.index}</span><code>${escapeHtml(entry.label)}</code><b>${entry.result === null ? "—" : entry.result}</b></li>`).join("")
    : `<li><span>—</span><em>${text("Chưa có thao tác", "No operations yet")}</em><b>—</b></li>`;
  const latestOutput = view.outputs.length ? view.outputs.at(-1) : "—";

  $("treeView").innerHTML = `<section class="sa1146-viz" aria-label="${text("Mô phỏng Snapshot Array", "Snapshot Array simulation")}">
    <header class="sa1146-heading"><div><small>#1146 · MEDIUM · DESIGN + BINARY SEARCH</small><h3>${text("Lịch sử thưa theo từng index", "Sparse history per index")}</h3></div><div class="sa1146-snap-id"><small>${text("snap_id đang ghi", "current snap_id")}</small><b>${view.snapId}</b></div></header>
    <nav class="sa1146-phases" aria-label="${text("Các bước thuật toán", "Algorithm stages")}">${phaseHtml}</nav>
    <div class="sa1146-action"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <div class="sa1146-layout">
      <section class="sa1146-store"><header><strong>${text("History[index]", "History[index]")}</strong><span>${storedRecords} ${text("records đã lưu", "stored records")}</span></header><div class="sa1146-histories">${histories}</div><footer><span class="initial">(0, 0) ${text("mặc định", "default")}</span><span class="valid">snap ≤ query</span><span class="mid">mid</span><span class="result">${text("kết quả", "result")}</span></footer></section>
      <aside class="sa1146-side">
        ${binaryPanel}
        <section class="sa1146-history"><header><strong>${text("Lịch sử thao tác", "Operation log")}</strong><span>${view.operationIndex === null ? view.operationCount : Math.min(view.operationIndex + 1, view.operationCount)}/${view.operationCount}</span></header><ol>${historyHtml}</ol></section>
      </aside>
    </div>
    <section class="sa1146-memory"><div><small>${text("Nếu copy toàn mảng", "If copying whole arrays")}</small><b>${conceptualCells}</b><span>${text("ô khái niệm", "conceptual cells")}</span></div><i>vs</i><div class="sparse"><small>${text("Lịch sử thưa thực tế", "Actual sparse history")}</small><b>${storedRecords}</b><span>${text("records", "records")}</span></div><p>${text("Mỗi set chỉ chạm một index. Nhiều set trước cùng một snap được gộp thành một record.", "Each set touches one index. Repeated sets before the same snap are coalesced into one record.")}</p><output>${text("output mới nhất", "latest output")}: <b>${latestOutput === null ? "None" : latestOutput}</b></output></section>
    <details class="sa1146-proof"${view.phase === "done" ? " open" : ""}><summary>${text("Vì sao bisect_right rồi trừ 1?", "Why bisect_right, then subtract 1?")}</summary><p>${text("Các record đã tăng dần theo snap_id. bisect_right((query, ∞)) trả vị trí ngay sau mọi record có snap_id ≤ query; vì vậy lo − 1 chính là phiên bản mới nhất không thuộc tương lai.", "Records are ordered by snap_id. bisect_right((query, ∞)) returns the position after every record with snap_id ≤ query, so lo − 1 is the newest version that is not in the future.")}</p></details>
  </section>`;
}
