function renderFullBloomFlowers2251View(step) {
  const view = step.fullBloomFlowers2251View;
  const vi = lang === "vi";
  const t = (vietnamese, english) => vi ? vietnamese : english;
  const search = view.search;
  const bisect = view.method === 2;
  const isFinal = view.final;
  const activeTime = view.activePerson === null ? null : view.people[view.activePerson];
  const activeArray = search?.phase === "starts" ? "starts" : search?.phase === "ends" ? "ends" : null;
  const renderArray = (values, name) => {
    const isActive = activeArray === name;
    const boundary = bisect ? view.bounds[name] : null;
    const call = name === "starts" ? "bisect_right" : "bisect_left";
    const marker = `<span class="fb2251-cut" role="img" aria-label="${call}: ${t("vị trí chèn", "insertion index")} ${boundary}"><b>↓</b><small>i=${boundary}</small></span>`;
    return `<section class="fb2251-array ${isActive ? "searching" : ""}">
      <header><strong>${name}</strong><span>${bisect ? `${call} · ${name === "starts" ? "≤ t" : "< t"}` : `${values.length} ${t("mốc", "values")}`}</span></header>
      <div class="fb2251-values">${values.map((value, index) => {
        const inRange = isActive && index >= search.lo && index < search.hi;
        const isMid = isActive && search.mid === index;
        const passed = bisect ? boundary !== null && index < boundary : activeTime !== null && (name === "starts" ? value <= activeTime : value < activeTime);
        const cell = `<span class="fb2251-value${inRange ? " in-range" : ""}${isMid ? " mid" : ""}${passed ? " passed" : ""}${bisect && passed ? " counted" : ""}">
          <small>${index}</small><strong>${value}</strong>
        </span>`;
        return bisect ? `<span class="fb2251-slot">${index === boundary ? marker : ""}${cell}</span>` : cell;
      }).join("")}${bisect && boundary === values.length ? marker : ""}</div>
      ${bisect ? boundary === null ? "" : `<footer>${call}(${name}, ${activeTime}) = <b>${boundary}</b></footer>` : isActive ? `<footer>${t("vùng tìm", "search range")}: [${search.lo}, ${search.hi})${search.mid === null ? "" : ` · mid=${search.mid}`}</footer>` : ""}
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

  $("treeView").innerHTML = `<section class="fb2251-viz${bisect ? " fb2251-bisect" : ""}">
    <header class="fb2251-heading">
      <div><small>2251 · ${bisect ? "BISECT" : phase}</small><h3>${t("Số hoa đang nở", "Number of Flowers in Full Bloom")}</h3>
        ${bisect ? "" : `<p>${t("Khoảng [bắt đầu, kết thúc] đóng ở cả hai đầu mút.", "Each [start, end] interval is inclusive at both endpoints.")}</p>`}</div>
      <div class="fb2251-answer"><small>${t("KẾT QUẢ", "ANSWERS")}</small><strong>${result}</strong></div>
    </header>
    <section class="fb2251-action"><small>${t("BƯỚC HIỆN TẠI", "CURRENT STEP")}</small><strong>${escapeHtml(pick(step.title))}</strong>${bisect ? "" : `<p>${escapeHtml(pick(step.note))}</p>`}</section>
    <section class="fb2251-card"><header><strong>${t("CÁC KHOẢNG NỞ", "BLOOM INTERVALS")}</strong><span>${view.flowers.length} ${t("bông hoa", "flowers")}${activeTime === null ? "" : ` · t=${activeTime}`}</span></header>
      <div class="fb2251-flowers">${flowers}</div>
    </section>
    <section class="fb2251-card"><header><strong>${t("TÌM KIẾM NHỊ PHÂN", "BINARY SEARCH")}</strong><span>${search?.phase === "ends" ? t("đã bắt đầu − đã kết thúc", "started − ended") : t("Tìm cận trên / cận dưới", "Find upper / lower bounds")}</span></header>
      ${renderArray(view.starts, "starts")}
      ${renderArray(view.ends, "ends")}
      ${bisect ? `<div class="fb2251-counts" aria-label="${t("Đã bắt đầu trừ đã kết thúc", "Started minus ended")}"><span><small>start ≤ t</small><b>${view.bounds.starts ?? "—"}</b></span><i>−</i><span><small>end &lt; t</small><b>${view.bounds.ends ?? "—"}</b></span><i>=</i><span><small>${t("đang nở", "blooming")}</small><b>${view.activePerson === null ? "—" : view.answers[view.activePerson] ?? "—"}</b></span></div>` : ""}
      ${search?.comparison ? `<div class="fb2251-comparison"><strong>${escapeHtml(search.comparison)}</strong><span>${t("lo / hi", "lo / hi")}: ${search.lo} / ${search.hi}</span></div>` : ""}
    </section>
    <section class="fb2251-card"><header><strong>${t("KẾT QUẢ THEO NGƯỜI", "ANSWERS BY VISITOR")}</strong><span>${view.answers.filter((answer) => answer !== null).length}/${view.people.length}</span></header>
      <div class="fb2251-visitors">${visitors}</div>
    </section>
    <footer>${bisect ? "start = t ✓ · end = t ✓" : t("Hoa bắt đầu đúng lúc t đã nở; hoa kết thúc đúng lúc t vẫn đang nở.", "A flower starting at t is blooming; one ending at t is still blooming.")}</footer>
  </section>`;
}
