function renderUniqueCategories2782View(step) {
  const view = step.categories2782View;
  const t = (vi, en) => lang === "vi" ? vi : en;
  const esc = value => escapeHtml(String(value));
  const shapes = ["●", "◆", "▲", "■", "✚", "✿"];
  const symbol = group => group < 0 ? "?" : shapes[group % shapes.length];
  const comparing = ["ask", "reply", "joined", "decide"].includes(view.phase);
  const tile = (index, role = "") => {
    const group = view.owners[index];
    const known = group >= 0;
    const active = !step.final && index === view.i;
    return `<div class="uc2782-item${active ? " current" : ""}${index === view.rep && !step.final && comparing ? " representative" : ""}${known ? ` known tone-${group % 6}` : " unknown"}" title="${esc(t("Phần tử", "Item"))} ${index}${known ? ` · ${esc(t("nhóm", "group"))} ${group + 1}` : ""}">
      ${role ? `<span class="uc2782-role">${esc(role)}</span>` : ""}
      <div class="uc2782-box" aria-hidden="true"><i></i><b>${symbol(group)}</b></div>
      <small>#${index}${view.reps.includes(index) ? " ★" : ""}</small>
    </div>`;
  };
  const limit = 18;
  const start = view.n <= limit ? 0 : Math.max(0, Math.min((view.i ?? 0) - 8, view.n - limit));
  const items = Array.from({ length: Math.min(view.n, limit) }, (_, offset) => tile(start + offset)).join("");
  const outcome = view.phase === "new" || view.phase === "count" ? "new" : comparing && view.feedback !== null ? (view.feedback ? "same" : "different") : "waiting";
  const labels = { same: t("Cùng nhóm", "Same category"), different: t("Khác nhóm", "Different categories"), new: t("Nhóm mới", "New category"), waiting: t("Cùng nhóm?", "Same category?") };
  const result = { same: "=", different: "≠", new: "+", waiting: "?" }[outcome];
  const comparison = step.final
    ? `<div class="uc2782-complete" aria-live="polite"><span aria-hidden="true">${shapes.slice(0, Math.min(6, view.groups.length)).join(" ")}</span><strong>${view.count}</strong><small>${t("nhóm khác nhau", "distinct categories")}</small></div>`
    : `<div class="uc2782-comparison is-${outcome}" aria-label="${esc(labels[outcome])}">
        ${view.i === null ? `<div class="uc2782-ghost" aria-hidden="true">?</div>` : tile(view.i, "i")}
        <div class="uc2782-oracle"><small>haveSameCategory</small><div class="uc2782-link" aria-hidden="true"><i></i><b>${result}</b><i></i></div><span aria-live="polite">${labels[outcome]}</span></div>
        ${view.rep === null || outcome === "new" ? `<div class="uc2782-ghost" aria-hidden="true">${outcome === "new" ? "+" : "?"}</div>` : tile(view.rep, "rep")}
      </div>`;
  const activeGroup = view.i === null ? -1 : view.owners[view.i];
  const visibleGroupIds = view.groups.length <= 8 ? view.groups.map((_, id) => id)
    : [...new Set([0, 1, 2, 3, 4, 5, 6, Math.max(7, activeGroup)])].filter(id => id < view.groups.length);
  const groups = visibleGroupIds.map(id => {
    const group = view.groups[id], selected = !step.final && ((comparing && view.rep === group.representative) || activeGroup === id);
    return `<div class="uc2782-group tone-${id % 6}${selected ? " selected" : ""}"><header><b aria-hidden="true">${symbol(id)}</b><strong>${t("Nhóm", "Group")} ${id + 1}</strong><small>★ #${group.representative}</small></header><div class="uc2782-members">${group.members.slice(0, 12).map(index => `<span${index === view.i && !step.final ? ' class="just-added"' : ""}>#${index}</span>`).join("")}${group.members.length > 12 ? `<span>+${group.members.length - 12}</span>` : ""}</div><div class="uc2782-tray" aria-hidden="true"></div></div>`;
  }).join("");
  $("treeView").innerHTML = `<section class="uc2782-viz" aria-label="${esc(t("Phân các hộp bí mật vào nhóm bằng cách hỏi API", "Group mystery boxes using only pairwise API comparisons"))}">
    <div class="uc2782-strip-label"><span>${t("Các hộp bí mật", "Mystery boxes")}</span><small>${view.processed}/${view.n}</small></div>
    <div class="uc2782-items" aria-label="${esc(t("Phần tử; dấu sao là đại diện", "Items; a star marks a representative"))}">${items}</div>
    ${view.n > limit ? `<small class="uc2782-crop">#${start}–#${start + limit - 1} / ${view.n}</small>` : ""}
    ${comparison}
    <div class="uc2782-group-label"><span>${t("Nhóm đã tìm thấy", "Discovered groups")}</span><small>★ ${t("đại diện", "representative")}</small></div>
    <div class="uc2782-groups">${groups || `<div class="uc2782-empty" aria-label="${esc(t("Chưa có nhóm", "No groups yet"))}"><span aria-hidden="true">＋</span></div>`}</div>
    ${view.groups.length > visibleGroupIds.length ? `<small class="uc2782-crop">+${view.groups.length - visibleGroupIds.length} ${t("nhóm khác", "other groups")}</small>` : ""}
    ${!view.detailed ? `<small class="uc2782-crop">${t("Rút gọn theo từng hộp · đã tính đủ mọi lần hỏi", "One frame per action · all comparisons computed")}</small>` : ""}
  </section>`;
}
