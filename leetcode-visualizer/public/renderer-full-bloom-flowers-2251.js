function renderFullBloomFlowers2251View(step) {
  const view = step.fullBloomFlowers2251View;
  const vi = lang === "vi";
  const t = (vietnamese, english) => vi ? vietnamese : english;
  const search = view.search;
  const isFinal = view.final;
  const activeTime = view.activePerson === null ? null : view.people[view.activePerson];
  const activeArray = search?.phase === "starts" ? "starts" : search?.phase === "ends" ? "ends" : null;
  const renderArray = (values, name) => {
    const isActive = activeArray === name;
    return `<section class="fb2251-array ${isActive ? "searching" : ""}">
      <header><strong>${name}</strong><span>${values.length} ${t("mốc", "values")}</span></header>
      <div class="fb2251-values">${values.map((value, index) => {
        const inRange = isActive && index >= search.lo && index < search.hi;
        const isMid = isActive && search.mid === index;
        const passed = activeTime !== null && (name === "starts" ? value <= activeTime : value < activeTime);
        return `<span class="fb2251-value${inRange ? " in-range" : ""}${isMid ? " mid" : ""}${passed ? " passed" : ""}">
          <small>${index}</small><strong>${value}</strong>
        </span>`;
      }).join("")}</div>
      ${isActive ? `<footer>${t("vùng tìm", "search range")}: [${search.lo}, ${search.hi})${search.mid === null ? "" : ` · mid=${search.mid}`}</footer>` : ""}
    </section>`;
  };
  const flowers = view.flowers.map(([start, end], index) => {
    const blooming = activeTime !== null && start <= activeTime && activeTime <= end;
    return `<span class="fb2251-flower${blooming ? " blooming" : ""}">
      <small>F${index}</small><strong>[${start}, ${end}]</strong><em>${blooming ? t("đang nở", "blooming") : t("khoảng nở", "interval")}</em>
    </span>`;
  }).join("");
  const visitors = view.people.map((time, index) => `<span class="fb2251-visitor${index === view.activePerson ? " active" : ""}${view.answers[index] !== null ? " done" : ""}">
    <small>P${index}</small><strong>t=${time}</strong><b>${view.answers[index] === null ? "—" : view.answers[index]}</b>
  </span>`).join("");
  const phase = search?.phase === "starts"
    ? t("upper bound: bắt đầu ≤ t", "upper bound: starts ≤ t")
    : search?.phase === "ends"
      ? t("lower bound: kết thúc < t", "lower bound: ends < t")
      : t("Đếm hoa đang nở", "Count blooming flowers");
  const result = isFinal ? `[${view.answer.join(", ")}]` : t("đang tính", "computing");

  $("treeView").innerHTML = `<section class="fb2251-viz">
    <header class="fb2251-heading">
      <div><small>2251 · ${phase}</small><h3>${t("Số hoa đang nở", "Number of Flowers in Full Bloom")}</h3>
        <p>${t("Khoảng [bắt đầu, kết thúc] đóng ở cả hai đầu mút.", "Each [start, end] interval is inclusive at both endpoints.")}</p></div>
      <div class="fb2251-answer"><small>${t("KẾT QUẢ", "ANSWERS")}</small><strong>${result}</strong></div>
    </header>
    <section class="fb2251-action"><small>${t("BƯỚC HIỆN TẠI", "CURRENT STEP")}</small><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></section>
    <section class="fb2251-card"><header><strong>${t("CÁC KHOẢNG NỞ", "BLOOM INTERVALS")}</strong><span>${view.flowers.length} ${t("bông hoa", "flowers")}${activeTime === null ? "" : ` · t=${activeTime}`}</span></header>
      <div class="fb2251-flowers">${flowers}</div>
    </section>
    <section class="fb2251-card"><header><strong>${t("TÌM KIẾM NHỊ PHÂN", "BINARY SEARCH")}</strong><span>${search?.phase === "ends" ? t("đã bắt đầu − đã kết thúc", "started − ended") : t("Tìm cận trên / cận dưới", "Find upper / lower bounds")}</span></header>
      ${renderArray(view.starts, "starts")}
      ${renderArray(view.ends, "ends")}
      ${search?.comparison ? `<div class="fb2251-comparison"><strong>${escapeHtml(search.comparison)}</strong><span>${t("lo / hi", "lo / hi")}: ${search.lo} / ${search.hi}</span></div>` : ""}
    </section>
    <section class="fb2251-card"><header><strong>${t("KẾT QUẢ THEO NGƯỜI", "ANSWERS BY VISITOR")}</strong><span>${view.answers.filter((answer) => answer !== null).length}/${view.people.length}</span></header>
      <div class="fb2251-visitors">${visitors}</div>
    </section>
    <footer>${t("Hoa bắt đầu đúng lúc t đã nở; hoa kết thúc đúng lúc t vẫn đang nở.", "A flower starting at t is blooming; one ending at t is still blooming.")}</footer>
  </section>`;
}
