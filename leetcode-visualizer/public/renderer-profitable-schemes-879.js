function renderProfitableSchemes879View(step) {
  const view = step.profitableSchemes879View;
  const vi = lang === "vi";
  const text = (vietnamese, english) => vi ? vietnamese : english;
  const selected = view.activeCrime === null ? null : view.crimes[view.activeCrime];
  const updates = new Map(view.updates.map((update) => [`${update.members},${update.profit}`, update]));
  const renderCrime = (crime) => {
    const current = crime.index === view.activeCrime;
    const done = view.final || view.activeCrime !== null && crime.index < view.activeCrime;
    const shownPeople = Math.min(Math.max(crime.members, 0), 8);
    const people = Array.from({ length: shownPeople }, () => '<i class="ps879-person">●</i>').join("");
    return `<div class="ps879-crime${current ? " active" : ""}${done ? " done" : ""}">
      <small>#${crime.index + 1}</small>
      <div class="ps879-people">${people}${crime.members > shownPeople ? `<b>+${crime.members - shownPeople}</b>` : ""}</div>
      <strong><span>👥 ${crime.members}</span><span>💰 ${crime.gain}</span></strong>
    </div>`;
  };
  const renderGrid = (values, title, changed = false) => {
    if (!values) return "";
    const headings = `<div class="ps879-grid-row ps879-head"><b>${text("👥 / 💰", "👥 / 💰")}</b>${Array.from(
      { length: view.minProfit + 1 },
      (_, profit) => `<b>${profit === view.minProfit ? `≥${profit}` : profit}</b>`,
    ).join("")}</div>`;
    const body = values.map((row, members) =>
      `<div class="ps879-grid-row"><b class="ps879-members">👥${members}</b>${row.map((ways, profit) => {
        const update = changed ? updates.get(`${members},${profit}`) : null;
        const target = members === view.members && profit === view.minProfit;
        return `<span class="ps879-count${target ? " target" : ""}${update?.added ? " increased" : ""}">
          <strong>${ways}</strong>${update?.added ? `<small>+${update.added}</small>` : ""}
        </span>`;
      }).join("")}</div>`,
    ).join("");
    return `<section class="ps879-grid-card">
      <header><strong>${title}</strong>${changed ? '<span class="ps879-delta-key">✨ + nuevos planes</span>' : ""}</header>
      <div class="ps879-grid-scroll"><div class="ps879-grid">${headings}${body}</div></div>
    </section>`;
  };
  const mainGrid = view.phase === "crime"
    ? `<div class="ps879-comparison">
        ${renderGrid(view.beforeDp, text("ANTES", "BEFORE"))}
        <div class="ps879-shift" aria-hidden="true">➜</div>
        ${renderGrid(view.dp, text("SAU KHI THÊM", "AFTER ADDING"), true)}
      </div>`
    : renderGrid(view.dp, text(view.final ? "KẾ HOẠCH ĐẠT MỤC TIÊU" : "BẢNG KẾ HOẠCH", view.final ? "PROFITABLE PLANS" : "SCHEME COUNTS"));

  $("treeView").innerHTML = `<section class="ps879-viz" role="region" aria-label="${text("Hình minh họa các kế hoạch có lãi", "Profitable Schemes visual explanation")}">
    <header class="ps879-header">
      <div><small>#879 · ${text("CHỌN CÁC PHI VỤ", "PICK CRIMES")}</small><h3>${text("Nhóm thành viên & túi lợi nhuận", "Crew and profit meter")}</h3></div>
      <strong class="ps879-answer">${view.final ? view.answer : "?"}</strong>
    </header>
    <div class="ps879-goal">
      <div class="ps879-crew"><span>👥</span><strong>${view.members}</strong><small>${text("người tối đa", "members max")}</small></div>
      <div class="ps879-meter"><span>💰</span><div>${Array.from({ length: view.minProfit }, (_, index) =>
        `<i class="${index < view.minProfit ? "filled" : ""}"></i>`,
      ).join("") || '<i class="filled"></i>'}</div><strong>≥${view.minProfit}</strong></div>
    </div>
    <section class="ps879-crime-board">
      <header><strong>${text("PHI VỤ", "CRIMES")}</strong><span>${view.crimes.length}</span></header>
      <div class="ps879-crimes">${view.crimes.map(renderCrime).join("") || `<span class="ps879-none">∅</span>`}</div>
      ${selected ? `<div class="ps879-selected">${text("Đang thử", "TRYING")} <b>👥 ${selected.members}</b> <span>＋</span> <b>💰 ${selected.gain}</b></div>` : ""}
    </section>
    ${mainGrid}
    ${view.phase === "crime" ? `<div class="ps879-rule"><span>↙</span><b>dp[${selected.members}][j] += dp[${view.members}−${selected.members}][max(0, j−${selected.gain})]</b></div>` : ""}
    ${view.final ? `<div class="ps879-result">${text("KẾ HOẠCH ĐẠT MỤC TIÊU", "PROFITABLE PLANS")} <strong>${view.answer}</strong></div>` : ""}
  </section>`;
}
