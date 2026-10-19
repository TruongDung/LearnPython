function renderQueue406View(step, selectedId) {
  const v = step.queue406View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const host = $("treeView");
  const done = v.phase === "done";
  const preview = v.phase === "place";
  const inserting = preview || v.phase === "insert";
  const initial = v.phase === "input" || v.phase === "sort";
  const focus = done ? v.queue.find(p => p.id === selectedId) || v.current : v.current;
  const before = inserting ? v.queue.filter(p => p.id !== focus.id) : [];
  const row = initial ? (v.phase === "input" ? v.original : v.sorted) : [...v.queue];
  if (preview) row.splice(focus.k, 0, focus);
  const focusIndex = focus ? row.findIndex(p => p.id === focus.id) : -1;
  const counted = focus ? row.filter((p, i) => i < focusIndex && p.h >= focus.h) : [];
  const countIds = new Set(counted.map(p => p.id));
  const stage = initial ? 0 : done ? 2 : 1;

  // Capture stable people before updating the markup for sorting/insertion motion.
  const origins = new Map();
  for (const element of host.querySelectorAll("[data-q406-move]")) {
    if (typeof element.getBoundingClientRect !== "function") continue;
    const id = Number(element.dataset.q406Move);
    if (!origins.has(id) || element.classList.contains("q406-person")) origins.set(id, element.getBoundingClientRect());
  }

  function figure(p) {
    const height = 32 + (v.maxHeight ? p.h / v.maxHeight : 0) * 64;
    return `<span class="q406-figure" style="--q406-height:${height}px" aria-hidden="true"><svg width="42" height="${height}" viewBox="0 0 42 100" preserveAspectRatio="none"><circle cx="21" cy="12" r="10"/><path d="M12 28 Q21 24 30 28 L38 55 Q40 63 33 62 L28 45 L28 94 Q27 100 22 97 L21 69 L20 97 Q15 100 14 94 L14 45 L9 62 Q2 63 4 55 Z"/></svg></span>`;
  }

  function mini(p, index, type) {
    const active = p.id === focus?.id;
    return `<span class="q406-mini${active ? " is-current" : ""}"${type === "waiting" ? ` data-q406-move="${p.id}"` : ""} aria-label="${text("Chiều cao", "Height")} ${p.h}, k=${p.k}">${figure(p)}<b>[${p.h}<small>,${p.k}</small>]</b>${type === "before" ? `<small>[${index}]</small>` : ""}</span>`;
  }

  function person(p, index) {
    const active = focus?.id === p.id;
    const counts = countIds.has(p.id);
    const shorter = focus && index < focusIndex && !counts;
    const oldIndex = inserting ? before.findIndex(old => old.id === p.id) : -1;
    const shifted = oldIndex !== -1 && oldIndex !== index;
    const classes = ["q406-person", active ? "is-current" : "", counts ? "is-counted" : "", shorter ? "is-shorter" : "", preview && active ? "is-slot" : "", shifted ? "is-shifted" : ""].filter(Boolean).join(" ");
    const label = `${text("Chiều cao", "Height")} ${p.h}, k=${p.k}${initial ? "" : `, ${text("vị trí", "index")} ${index}`}${counts ? `, ${text("được tính", "counted")}` : ""}`;
    const badge = active ? "↓" : counts ? `<span class="q406-count-dot">${counted.findIndex(x => x.id === p.id) + 1}</span>` : shorter ? "−" : "";
    const position = initial ? "" : shifted ? `<span class="q406-shift">[${oldIndex}] → [${index}]</span>` : `[${index}]`;
    const body = `<span class="q406-marker">${badge || "&nbsp;"}</span>${figure(p)}<b class="q406-height">${p.h}</b><span class="q406-k">k=${p.k}</span><span class="q406-index">${position}</span>`;
    return done
      ? `<button type="button" class="${classes}" data-q406-id="${p.id}" aria-pressed="${active}" data-q406-move="${p.id}" aria-label="${label}">${body}</button>`
      : `<div class="${classes}" data-q406-move="${p.id}" role="img" aria-label="${label}">${body}</div>`;
  }

  const waiting = initial || done || !v.remaining.length ? "" : `<div class="q406-waiting"><small>${text("Chờ", "Next")}</small><div>${v.remaining.map((p, i) => mini(p, i, "waiting")).join("")}</div></div>`;
  const comparison = inserting ? `<div class="q406-before"><small>${text("Trước", "Before")}</small><div>${before.length ? before.map((p, i) => mini(p, i, "before")).join("") : `<span class="q406-empty-mini">∅</span>`}</div><span class="q406-incoming">${mini(focus, -1, "incoming")}<b>↓ [${focus.k}]</b></span></div><div class="q406-row-label">${preview ? text("Chuẩn bị chèn ↓", "Insert here ↓") : text("Sau khi chèn ↓", "After insertion ↓")}</div>` : "";
  const status = initial
    ? (v.phase === "input" ? `<span><b>h</b> = ${text("chiều cao", "height")}</span><span><b>k</b> = ${text("số người cao ≥ h đứng trước", "people of height ≥ h ahead")}</span>` : `<b>h ↓</b><span>· ${text("cùng h", "equal h")}: <b>k ↑</b></span>`)
    : focus ? `<span class="q406-tally" aria-hidden="true">${counted.length ? counted.slice(0, 10).map(() => '<i></i>').join("") + (counted.length > 10 ? `<small>+${counted.length - 10}</small>` : "") : "∅"}</span><strong>${counted.length} / k=${focus.k} ${counted.length === focus.k ? "✓" : ""}</strong>` : `<span>${text("Hàng trống · bắt đầu từ [0]", "Empty queue · start at [0]")}</span>`;
  const heading = initial ? (v.phase === "input" ? text("Mỗi hình là một người", "One figure per person") : text("Cao trước · k nhỏ trước", "Tallest first · smaller k first"))
    : done ? text("Bấm một người để đếm", "Select a person to count") : focus ? `<span class="q406-focus-pair">[${focus.h}, ${focus.k}]</span> <span>→ [${focus.k}]</span>` : "";
  host.innerHTML = `<section class="q406-viz" aria-label="${text("406 · Xếp hàng theo chiều cao", "406 · Queue reconstruction by height")}">
    <div class="q406-stages">${[text("1 · Xếp cao trước", "1 · Tallest first"), text("2 · Chèn tại k", "2 · Insert at k"), text("3 · Đếm lại", "3 · Count again")].map((label, i) => `<span class="${i === stage ? "active" : ""}">${label}</span>`).join("")}</div>
    ${waiting}
    <header class="q406-action"><strong>${heading}</strong><span>${!initial && !done ? `${v.queue.length}/${v.original.length}` : ""}</span></header>
    ${comparison}
    <div class="q406-direction">${text("ĐẦU HÀNG", "FRONT")} <span>→</span> ${text("CUỐI HÀNG", "BACK")}</div>
    <div class="q406-row" aria-label="${text("Hàng người, đọc từ trái sang phải", "Queue, read from left to right")}">${row.length ? row.map(person).join("") : `<div class="q406-empty">[0]<br>↓</div>`}</div>
    <div class="q406-status" role="status" aria-live="polite" aria-label="${focus ? text(`Có ${counted.length} người cao hơn hoặc bằng ${focus.h} đứng trước, cần ${focus.k}.`, `${counted.length} people of height at least ${focus.h} ahead; requires ${focus.k}.`) : text("Nhãn h và k", "Height and k labels")}">${status}</div>
    ${focus ? `<div class="q406-legend"><span class="current">↓ ${text("Đang xét", "Selected")}</span><span class="counted">● ${text("Cao ≥ h: tính", "Height ≥ h: count")}</span><span>− ${text("Thấp hơn: bỏ qua", "Shorter: skip")}</span>${inserting && before.some((p, i) => i >= focus.k) ? `<span>→ ${text("Dịch phải", "Shift right")}</span>` : ""}</div>` : ""}
    ${!initial ? `<details class="q406-proof"><summary>${text("Vì sao cao trước?", "Why tallest first?")}</summary><div><span class="q406-proof-pair"><i class="tall"></i><i class="tall target"></i><b>k=1</b></span><b>→</b><span class="q406-proof-pair"><i class="tall"></i><i class="short"></i><i class="tall target"></i><b>k=1 ✓</b></span></div><p>${text("Chèn người thấp: số người cao phía trước giữ nguyên.", "Insert someone shorter: the number of taller people ahead stays the same.")}</p></details>` : ""}
  </section>`;
  host.querySelectorAll("[data-q406-id]").forEach(button => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.q406Id);
      renderQueue406View(step, id);
      host.querySelector(`[data-q406-id="${id}"]`).focus();
    });
  });
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!reduced) for (const element of host.querySelectorAll(".q406-row > [data-q406-move]")) {
    if (typeof element.animate !== "function") continue;
    const origin = origins.get(Number(element.dataset.q406Move));
    if (!origin || !origin.width || !origin.height) continue;
    const target = element.getBoundingClientRect();
    if (!target.width || !target.height) continue;
    const dx = origin.left - target.left;
    const dy = origin.top - target.top;
    if (Math.abs(dy) > 600 || Math.abs(dx) > 1200 || Math.abs(dx) + Math.abs(dy) < 2) continue;
    element.animate([
      { transform: `translate(${dx}px, ${dy}px) scale(${origin.width / target.width}, ${origin.height / target.height})`, transformOrigin: "top left" },
      { transform: "translate(0, 0) scale(1, 1)", transformOrigin: "top left" },
    ], { duration: 650, easing: "cubic-bezier(.2,.7,.2,1)" });
  }
}
