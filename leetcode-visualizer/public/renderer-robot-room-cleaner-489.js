"use strict";

function renderRobotRoomCleaner489View(step) {
  const view = step.robotRoomCleaner489View;
  if (!view) return;

  const vi = lang === "vi";
  const text = (vietnamese, english) => vi ? vietnamese : english;
  const directions = ["↑", "→", "↓", "←"];
  const currentKey = view.current ? view.current.join(",") : "";
  const pathKeys = new Map((view.path || []).map((frame, index) => [`${frame.row},${frame.col}`, index + 1]));
  const cleaned = new Set(view.cleaned || []);
  const attempt = view.attempt;
  const targetKey = attempt?.to?.join(",");
  const board = (view.grid || []).map((row, rowIndex) => row.map((cell, colIndex) => {
    const key = `${rowIndex},${colIndex}`;
    const wall = cell === 0;
    const robot = key === currentKey;
    const onPath = pathKeys.has(key);
    const target = key === targetKey;
    const classes = [
      "rrc489-cell",
      wall ? "wall" : "open",
      cleaned.has(key) ? "cleaned" : "",
      robot ? "robot" : "",
      onPath && !robot ? "on-path" : "",
      target ? "target" : "",
    ].filter(Boolean).join(" ");
    const symbol = robot ? directions[view.facing] : wall ? "▧" : cleaned.has(key) ? "✓" : "·";
    const aria = wall
      ? text(`Tường (${rowIndex},${colIndex})`, `Wall (${rowIndex},${colIndex})`)
      : text(`Ô (${rowIndex},${colIndex})${cleaned.has(key) ? ", đã lau" : ""}`, `Cell (${rowIndex},${colIndex})${cleaned.has(key) ? ", cleaned" : ""}`);
    return `<span class="${classes}" aria-label="${aria}" title="${rowIndex},${colIndex}">
      <small>${rowIndex},${colIndex}</small><b>${symbol}</b>
      ${pathKeys.has(key) ? `<i>${pathKeys.get(key)}</i>` : ""}
    </span>`;
  }).join("")).join("");

  const line = Number(step.codeLines?.[0]);
  const lineLabels = {
    3: text("Tập đã thăm", "Visited set"),
    5: text("Quay 180°", "Turn around"),
    6: text("Lùi một ô", "Move back"),
    7: text("Khôi phục hướng", "Restore facing"),
    8: text("Gọi DFS", "DFS call"),
    9: text("Lau ô", "Clean cell"),
    10: text("Thử 4 hướng", "Try 4 directions"),
    11: text("Chọn hướng", "Pick direction"),
    12: text("Tính ô kế", "Next cell"),
    13: text("Kiểm tra lối đi", "Check move"),
    14: text("Đi sâu", "Recurse"),
    15: text("Quay về", "Backtrack"),
    16: text("Rẽ phải", "Turn right"),
    17: text("Bắt đầu DFS", "Start DFS"),
  };
  const actionLabels = {
    start: text("BẮT ĐẦU", "START"),
    clean: text("LAU Ô", "CLEAN"),
    check: text("KIỂM TRA", "CHECK"),
    move: text("ĐI TỚI", "MOVE"),
    "backtrack-start": text("GỌI QUAY LẠI", "CALL BACK"),
    backtrack: text("QUAY LẠI", "BACKTRACK"),
    turn: text("XOAY", "TURN"),
    blocked: text("BỊ CHẶN", "BLOCKED"),
    visited: text("ĐÃ THĂM", "VISITED"),
    return: text("TRỞ VỀ", "RETURN"),
    done: text("XONG", "DONE"),
    scan: text("QUÉT", "SCAN"),
  };
  const outcome = attempt?.outcome;
  const outcomeIcon = outcome === "move" ? "✓" : outcome === "backtrack" || outcome === "returned" ? "↩" : outcome === "wall" ? "▧" : outcome === "visited" ? "↻" : "";
  const pathCards = (view.path || []).map((frame, index) => (
    `<span class="rrc489-frame${index === view.path.length - 1 ? " active" : ""}">
      <i>${index + 1}</i><b>${frame.row},${frame.col}</b><em>${directions[frame.facing]}</em>
    </span>`
  )).join("");

  $("treeView").innerHTML = `<section class="rrc489-viz" aria-label="${text("Trực quan hóa robot lau phòng", "Robot room cleaner visualization")}">
    <header class="rrc489-head">
      <span class="rrc489-id">#489</span>
      <div><h3>${text("Robot lau phòng", "Robot Room Cleaner")}</h3><small>${text("DFS · quay lui", "DFS · backtracking")}</small></div>
      <strong class="rrc489-cleaned">${cleaned.size}<small>✓</small></strong>
    </header>
    <div class="rrc489-debug"><span>L${Number.isInteger(line) ? line : "—"}</span><b>${lineLabels[line] || text("Đang chạy", "Running")}</b><i>${actionLabels[view.action] || actionLabels.scan}</i></div>
    <div class="rrc489-layout">
      <div class="rrc489-board" style="--rrc489-cols:${view.grid?.[0]?.length || 1}" role="img" aria-label="${text("Bản đồ phòng; số nhỏ chỉ thứ tự nhánh DFS", "Room map; small numbers show DFS path order")}">${board}</div>
      <aside class="rrc489-side">
        <section class="rrc489-position">
          <span class="rrc489-robot">${view.current ? directions[view.facing] : "✓"}</span>
          <div><small>${text("ROBOT", "ROBOT")}</small><b>${view.current ? `(${view.current.join(",")})` : text("Hoàn tất", "Done")}</b></div>
        </section>
        ${attempt ? `<section class="rrc489-move">
          <div><span>(${attempt.from.join(",")})</span><i>→</i><b>(${attempt.to.join(",")})</b></div>
          <strong class="${outcome === "wall" || outcome === "visited" ? "blocked" : "success"}">${outcomeIcon}</strong>
        </section>` : ""}
        <section class="rrc489-stack">
          <header><b>${text("Ngăn xếp DFS", "DFS stack")}</b><span>${view.path?.length || 0}</span></header>
          <div>${pathCards || `<span class="rrc489-base">∅</span>`}</div>
        </section>
        <footer class="rrc489-legend"><span><i class="robot"></i>${text("robot", "robot")}</span><span><i class="clean"></i>${text("đã lau", "cleaned")}</span><span><i class="wall"></i>${text("tường", "wall")}</span></footer>
      </aside>
    </div>
  </section>`;
}
