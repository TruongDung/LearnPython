function renderCourseSchedule207View(step) {
  const v = step.courseSchedule207View;
  if (!v) return;
  const vi = lang === "vi";
  const t = (a, b) => vi ? a : b;
  const host = $("treeView");
  const outgoing = Array.from({ length: v.n }, () => []);
  const degree = Array(v.n).fill(0);
  v.edges.forEach((edge) => {
    outgoing[edge.from].push(edge.to);
    degree[edge.to] += 1;
  });

  const levels = Array(v.n).fill(null);
  let frontier = [];
  degree.forEach((count, course) => {
    if (count === 0) frontier.push(course);
  });
  let level = 0;
  while (frontier.length) {
    const next = [];
    frontier.forEach((course) => {
      levels[course] = level;
      outgoing[course].forEach((nextCourse) => {
        degree[nextCourse] -= 1;
        if (degree[nextCourse] === 0) next.push(nextCourse);
      });
    });
    frontier = next;
    level += 1;
  }
  const fallback = Math.max(0, level);
  levels.forEach((value, course) => {
    if (value === null) levels[course] = fallback;
  });
  const layerCount = Math.max(...levels) + 1;
  const groups = Array.from({ length: layerCount }, () => []);
  levels.forEach((layer, course) => groups[layer].push(course));
  const maxGroup = Math.max(...groups.map((group) => group.length));
  const width = 520;
  const height = Math.max(200, maxGroup * 56 + 48);
  const positions = {};
  groups.forEach((group, layer) => {
    group.forEach((course, index) => {
      positions[course] = {
        x: layerCount === 1 ? width / 2 : 52 + (layer * (width - 104) / (layerCount - 1)),
        y: height * (index + 1) / (group.length + 1),
      };
    });
  });

  const completed = new Set(v.completed);
  const ready = new Set(v.queue);
  const blocked = new Set(v.blocked || []);
  const active = v.activeEdge || null;
  const edgeState = (edge) => {
    if (active && active.from === edge.from && active.to === edge.to) return "active";
    return edge.status || "waiting";
  };
  const arrows = v.edges.map((edge) => {
    const start = positions[edge.from];
    const end = positions[edge.to];
    const state = edgeState(edge);
    const dx = Math.max(24, Math.abs(end.x - start.x) * 0.34);
    const dir = end.x >= start.x ? 1 : -1;
    return '<path class="edge ' + state + '" d="M ' + (start.x + 22 * dir) + ' ' + start.y
      + ' C ' + (start.x + dx * dir) + ' ' + start.y + ', ' + (end.x - dx * dir) + ' ' + end.y
      + ', ' + (end.x - 22 * dir) + ' ' + end.y + '" marker-end="url(#cs207-arrow-' + state + ')"/>';
  }).join("");
  const nodes = Array.from({ length: v.n }, (_, course) => {
    const point = positions[course];
    let state = "locked";
    if (completed.has(course)) state = "done";
    else if (v.activeCourse === course) state = "active";
    else if (ready.has(course)) state = "ready";
    else if (v.answer === false && blocked.has(course)) state = "blocked";
    return '<g class="course ' + state + '"><rect x="' + (point.x - 25) + '" y="' + (point.y - 18)
      + '" width="50" height="36" rx="10"/><path d="M ' + (point.x - 16) + ' ' + (point.y - 8)
      + ' h 4 M ' + (point.x - 16) + ' ' + (point.y - 2) + ' h 4"/><text class="name" x="' + point.x
      + '" y="' + (point.y + 3) + '">C' + course + '</text><circle cx="' + (point.x + 18)
      + '" cy="' + (point.y - 14) + '" r="9"/><text class="degree" x="' + (point.x + 18)
      + '" y="' + (point.y - 13) + '">' + v.indegree[course] + '</text></g>';
  }).join("");
  const tokens = (items, kind) => items.length
    ? items.map((course) => '<b class="token ' + kind + '">C' + course + '</b>').join("")
    : '<span class="empty">—</span>';
  const finish = v.answer === null ? "" : v.answer
    ? '<footer class="yes"><span>✓</span><b>' + t("Học hết", "All unlocked") + '</b><em>' + v.completed.length + " / " + v.n + '</em></footer>'
    : '<footer class="no"><span>⟳</span><b>' + t("Vòng chờ", "Waiting cycle") + '</b><em>' + tokens(v.blocked || [], "blocked") + '</em></footer>';

  host.innerHTML = '<section class="cs207-viz" aria-label="' + t("Lịch học theo hàng đợi", "Course schedule queue") + '" aria-live="polite">'
    + '<header><div><span>207</span><b>📚 ' + t("Học → mở", "Learn → unlock") + '</b></div><strong>' + v.completed.length + "/" + v.n + '</strong></header>'
    + '<svg class="cs207-graph" viewBox="0 0 ' + width + " " + height + '" role="img" aria-label="' + t("Đồ thị môn học", "Course graph") + '"><defs>'
    + '<marker id="cs207-arrow-waiting" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path class="waiting" d="M 0 0 L 10 5 L 0 10 z"/></marker>'
    + '<marker id="cs207-arrow-built" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path class="built" d="M 0 0 L 10 5 L 0 10 z"/></marker>'
    + '<marker id="cs207-arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path class="active" d="M 0 0 L 10 5 L 0 10 z"/></marker>'
    + '<marker id="cs207-arrow-released" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path class="released" d="M 0 0 L 10 5 L 0 10 z"/></marker>'
    + '</defs>' + arrows + nodes + '</svg>'
    + '<div class="cs207-lanes"><div><small>⚡ ' + t("SẴN SÀNG", "READY") + '</small><span>' + tokens(v.queue, "ready") + '</span></div>'
    + '<div><small>🎓 ' + t("ĐÃ HỌC", "DONE") + '</small><span>' + tokens(v.completed, "done") + '</span></div></div>'
    + finish + '</section>';
}
