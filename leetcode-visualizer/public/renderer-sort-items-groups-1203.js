function renderSortItemsGroups1203View(step) {
  const v = step.sortItemsGroups1203View;
  if (!v) return;
  const vi = lang === "vi", t = (a, b) => vi ? a : b, host = $("treeView");
  const itemW = 44, itemH = 34, gap = 9, laneW = Math.max(74, v.n * (itemW + gap) + 18), width = Math.max(440, laneW + 30), height = Math.max(220, v.members.length * 45 + 22);
  const active = v.activeEdge;
  const laneBacks = v.members.map((members, g) => {
    const y = 20 + g * 45;
    return `<g class="lane ${v.activeGroup === g ? "active" : v.order.includes(g) && v.layer === "group" ? "done" : ""}"><rect x="8" y="${y}" width="${width - 16}" height="42" rx="12"/><text class="lane-label" x="22" y="${y + 25}">G${g}</text>${members.length ? "" : `<text class="empty" x="118" y="${y + 26}">${t("trống", "empty")}</text>`}</g>`;
  }).join("");
  const itemCards = v.members.map((members, g) => {
    const y = 20 + g * 45;
    return members.map((item, j) => {
      const x = 112 + j * (itemW + gap), hot = v.lineItem === item;
      const bg = v.result.includes(item) ? "placed" : hot ? "hot" : "item";
      return `<g class="item ${bg}"><rect x="${x}" y="${y + 9}" width="${itemW}" height="${itemH}" rx="10"/><text x="${x + itemW / 2}" y="${y + 24}">${item}</text></g>`;
    }).join("");
  }).join("");
  const nodePos = [];
  v.members.forEach((members, g) => members.forEach((item, j) => nodePos[item] = { x: 112 + j * (itemW + gap) + itemW / 2, y: 20 + g * 45 + 26 }));
  const itemArrows = v.edges.map((edge) => {
    const a = nodePos[edge.from], b = nodePos[edge.to];
    if (!a || !b) return "";
    const curve = a.y === b.y ? `M${a.x + 13},${a.y - 13} C${a.x + 24},${a.y - 42} ${b.x - 24},${b.y - 42} ${b.x - 13},${b.y - 13}` : `M${a.x},${a.y + 12} C${a.x},${a.y + 32} ${b.x},${b.y - 25} ${b.x},${b.y - 13}`;
    const hot = active?.from === edge.from && active?.to === edge.to;
    return `<path class="arrow ${hot ? "hot" : edge.status}" d="${curve}" marker-end="url(#s1203-arrow)"/>`;
  }).join("");
  const groups = v.members.map((_, g) => ({ x: 52, y: 20 + g * 45 + 21 }));
  const groupArrows = v.groupEdges.map((edge) => {
    const a = groups[edge.from], b = groups[edge.to]; if (!a || !b) return "";
    const bend = a.y < b.y ? 16 : -16;
    return `<path class="g-arrow ${v.activeGroup === edge.from ? "hot" : ""}" d="M${a.x},${a.y + 7} C${a.x + bend},${a.y + 25} ${b.x + bend},${b.y - 25} ${b.x},${b.y - 7}" marker-end="url(#s1203-arrow)"/>`;
  }).join("");
  const orderedGroup = v.groupOrder.length ? v.groupOrder : v.layer === "group" ? v.order : [];
  const output = v.answer === null ? v.result : v.answer;
  const summary = v.failed ? t("Có chu trình · không xếp được", "Cycle found · no valid order") : v.answer ? t("Xếp xong ✓", "Sorted ✓") : t("Nhóm → món", "Groups → items");
  host.innerHTML = `<section class="s1203-viz">
    <header><div><span>1203</span><b>${t("Nhóm trước · món sau", "Groups first · items next")}</b></div><strong>${summary}</strong></header>
    <div class="mini-head"><span>① ${t("XẾP NHÓM", "GROUP ORDER")}</span><span>② ${t("XẾP MÓN TRONG NHÓM", "ITEM ORDER WITHIN GROUP")}</span></div>
    <svg class="board" viewBox="0 0 ${width} ${height}" role="img" aria-label="${t("Đồ thị nhóm và các món phụ thuộc", "Group graph and dependent items")}">
      <defs><marker id="s1203-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z"/></marker></defs>
      ${laneBacks}${groupArrows}${itemArrows}${itemCards}
    </svg>
    <div class="queues"><div><small>${t("HÀNG ĐỢI", "READY")}</small><div>${(v.queue.length ? v.queue : []).map((x) => `<b>${v.layer === "group" ? `G${x}` : x}</b>`).join("") || `<i>∅</i>`}</div></div><div><small>${t("NHÓM ĐƯỢC XẾP", "GROUP ORDER")}</small><div>${(orderedGroup || []).map((x) => `<b>G${x}</b>`).join("") || `<i>· · ·</i>`}</div></div></div>
    <footer class="${v.failed ? "bad" : v.answer ? "good" : ""}"><small>${t("THỨ TỰ CUỐI", "FINAL ORDER")}</small><div>${output?.length ? output.map((x) => `<b>${x}</b>`).join("") : `<i>${v.failed ? "∅" : "…"}</i>`}</div></footer>
    <aside>${t("Mũi tên = phải xếp trước", "Arrow = must come first")} · <em>−1 → ${t("nhóm riêng", "own group")}</em></aside>
  </section>`;
}
