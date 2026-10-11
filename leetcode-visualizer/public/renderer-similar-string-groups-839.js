function renderSimilarStringGroups839View(step) {
  const view = step.similar839View;
  const vi = lang === "vi";
  const t = (vietnamese, english) => vi ? vietnamese : english;
  const phase = {
    intro: t("Ý tưởng", "Idea"),
    initialize: t("Khởi tạo DSU", "Initialize DSU"),
    compare: t("So sánh cặp", "Compare pair"),
    union: t("Gộp nhóm", "Merge groups"),
    done: t("Hoàn tất", "Complete"),
  }[view.phase] || view.phase;
  const statusLabel = {
    checking: t("đang xét", "checking"),
    different: t("khác nhau", "not similar"),
    merged: t("đã gộp", "merged"),
    connected: t("đã cùng nhóm", "already connected"),
  };
  const active = view.activePair;
  const activeKey = active ? `${active[0]}-${active[1]}` : "";
  const activeComparison = view.comparisons.find((pair) => `${pair.i}-${pair.j}` === activeKey);
  const compared = view.comparisons.filter((pair) => pair.status !== "checking").length;
  const totalPairs = view.strings.length * (view.strings.length - 1) / 2;
  const rootByNode = new Map(view.components.flatMap((component) => component.members.map((member) => [member, component.root])));
  const words = view.strings.map((word, index) => {
    const activeWord = active && active.includes(index);
    const counterpart = active ? active[active[0] === index ? 1 : 0] : -1;
    const otherWord = counterpart >= 0 ? view.strings[counterpart] : "";
    const letters = [...word].map((character, position) => {
      const mismatch = activeWord
        && view.mismatch.includes(position)
        && otherWord[position] !== undefined;
      return `<span class="${mismatch ? "mismatch" : ""}">${escapeHtml(character)}</span>`;
    }).join("");
    return `<article class="ssg839-word${activeWord ? " active" : ""}">
      <small>strs[${index}]</small><strong>${letters}</strong>
      <em>${t("root", "root")} ${rootByNode.get(index)}</em>
    </article>`;
  }).join("");
  const components = view.components.map((component, index) => `<article class="ssg839-component c${index % 5}">
    <header><small>${t("GRUPO", "GROUP")} ${index + 1}</small><strong>${component.size}</strong></header>
    <div>${component.members.map((member) => `<span class="${member === component.root ? "root" : ""}"><small>${member}</small><b>${escapeHtml(view.strings[member])}</b></span>`).join("")}</div>
    <footer>${t("đại diện DSU", "DSU root")}: ${component.root}</footer>
  </article>`).join("");
  const pairs = view.comparisons.map((pair) => `<article class="ssg839-pair ${pair.status}${`${pair.i}-${pair.j}` === activeKey ? " active" : ""}">
    <small>#${pair.i} ↔ #${pair.j}</small><code>${escapeHtml(view.strings[pair.i])} · ${escapeHtml(view.strings[pair.j])}</code>
    <strong>${statusLabel[pair.status] || pair.status}</strong>
  </article>`).join("");
  const mismatchText = activeComparison
    ? activeComparison.mismatch.length
      ? activeComparison.mismatch.map((index) => `${index}: ${view.strings[active[0]][index]} ↔ ${view.strings[active[1]][index]}`).join(" · ")
      : t("không có vị trí khác nhau", "no mismatched positions")
    : t("chọn một cặp để bắt đầu", "select a pair to begin");
  const answer = view.answer === null ? "—" : String(view.answer);
  $("treeView").innerHTML = `<section class="ssg839-viz">
    <header class="ssg839-heading">
      <div><small>839 · ${escapeHtml(phase)}</small><h3>${t("Các nhóm chuỗi tương tự", "Similar string groups")}</h3></div>
      <div class="ssg839-result"><small>${t("SỐ NHÓM", "GROUPS")}</small><strong>${answer}</strong></div>
    </header>
    <section class="ssg839-action"><small>${t("BƯỚC HIỆN TẠI", "CURRENT STEP")}</small><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></section>
    <section class="ssg839-words"><header><strong>strs</strong><span>${view.strings.length} ${t("từ", "words")}</span></header><div>${words}</div></section>
    <section class="ssg839-check">
      <header><strong>${t("CẶP ĐANG XÉT", "CURRENT PAIR")}</strong><span>${compared}/${totalPairs} ${t("cặp đã xử lý", "pairs processed")}</span></header>
      <div class="ssg839-active-pair">${active ? `<code>#${active[0]} ${escapeHtml(view.strings[active[0]])}</code><b>↔</b><code>#${active[1]} ${escapeHtml(view.strings[active[1]])}</code>` : `<span>${t("Đang chuẩn bị các cặp", "Preparing the pairs")}</span>`}</div>
      <p>${escapeHtml(mismatchText)}</p>
      ${view.activeRoots.length ? `<strong class="ssg839-roots">root ${view.activeRoots[0]} ↔ ${view.activeRoots[1]}</strong>` : ""}
    </section>
    <section class="ssg839-groups"><header><strong>${t("THÀNH PHẦN LIÊN THÔNG", "CONNECTED COMPONENTS")}</strong><span>${view.components.length} ${t("nhóm", "groups")}</span></header><div>${components}</div></section>
    <details class="ssg839-pairs"><summary>${t("Lịch sử kiểm tra cặp", "Pair-check history")} · ${view.comparisons.length}/${totalPairs}</summary><div>${pairs || `<p>${t("Chưa có cặp nào.", "No pairs checked yet.")}</p>`}</div></details>
    <details class="ssg839-parent"><summary>parent / size</summary><div>${view.parent.map((root, index) => `<span><small>${index}: ${escapeHtml(view.strings[index])}</small><b>parent → ${root}</b><em>size ${view.size[index]}</em></span>`).join("")}</div></details>
  </section>`;
}
