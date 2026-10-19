function renderLis300View(step) {
  const v = step.lis300View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const dpMode = v.approach === 1;
  const final = Boolean(step.final);
  const activeJ = dpMode && ["inner", "compare", "update"].includes(v.event) ? v.j : null;
  const activeI = final ? null : dpMode ? v.i : v.k;
  const witnessSet = new Set(v.witness);
  const minimum = Math.min(...v.nums), maximum = Math.max(...v.nums);
  const columns = v.nums.map((value, index) => {
    const current = index === activeI, source = index === activeJ;
    const future = !final && activeI !== null && index > activeI;
    const marker = current ? (dpMode ? `i=${index} ↓` : "num ↓") : source ? `j=${index} ↓` : "";
    const height = maximum === minimum ? 55 : 20 + (value - minimum) / (maximum - minimum) * 65;
    return `<div class="l300-number${current ? " current" : ""}${source ? " source" : ""}${witnessSet.has(index) ? " in-chain" : ""}${future ? " future" : ""}" data-index="${index}"><small class="l300-pointer">${marker || "&nbsp;"}</small><span class="l300-pillar" style="height:${height}px" aria-hidden="true"></span><strong>${value}</strong><small>[${index}]</small>${dpMode ? `<span class="l300-dp"><small>dp</small><b>${v.dp[index] ?? "—"}</b></span>` : ""}</div>`;
  }).join("");

  function chain(label, indices, candidate = false) {
    return `<div class="l300-chain${candidate ? " candidate" : ""}"><small>${label}</small><div>${indices.length ? indices.map((index, i) => `${i ? '<span class="l300-arrow" aria-hidden="true">→</span>' : ""}<span class="l300-chain-node" style="--rise:${Math.min(i * 6, 30)}px"><b>${v.nums[index]}</b><small>[${index}]</small></span>`).join("") : '<span class="l300-empty">∅</span>'}</div>${indices.length ? `<b class="l300-length">${text("dài", "length")} ${indices.length}</b>` : ""}</div>`;
  }

  let work = "";
  if (dpMode) {
    if (activeJ !== null) work = `<div class="l300-compare${v.comparison === false ? " rejected" : v.comparison === true ? " accepted" : ""}"><span><small>nums[j]</small><b>${v.nums[v.j]}</b></span><strong>&lt;</strong><span><small>nums[i]</small><b>${v.nums[v.i]}</b></span><strong>${v.comparison === null ? "?" : v.comparison ? "✓" : "×"}</strong>${v.comparison === false ? `<small>${text("Bỏ qua dòng 8", "Skip line 8")}</small>` : ""}</div>`;
    if (v.transition) work += `<div class="l300-update"><span>dp[${v.i}]: <b>${v.transition.before}</b></span><span>max</span><span>dp[${v.j}]+1: <b>${v.transition.candidate}</b></span><strong>→ ${v.transition.after}</strong></div>`;
  } else {
    const searching = ["bounds", "while", "middle", "compare", "left", "right"].includes(v.event);
    const showMid = ["middle", "compare", "left", "right"].includes(v.event);
    work = `<div class="l300-tail-heading"><strong>tails</strong><span>${searching ? `[lo, hi) = [${v.lo}, ${v.hi})` : text("Đuôi nhỏ nhất theo độ dài", "Smallest tail for each length")}</span></div><div class="l300-tails">${v.tails.length ? v.tails.map((value, index) => `<div class="l300-tail${searching && (index < v.lo || index >= v.hi) ? " outside" : ""}${showMid && index === v.mid ? " source" : ""}${v.transition?.index === index ? " current" : ""}"><small>${showMid && index === v.mid ? "mid ↓" : `ℓ=${index + 1}`}</small><b>${value}</b><small>[${index}]</small></div>`).join("") : '<span class="l300-empty">∅</span>'}</div>`;
    if (v.event === "compare") work += `<div class="l300-compare${v.comparison ? " accepted" : " rejected"}"><span><small>tails[mid]</small><b>${v.tails[v.mid]}</b></span><strong>&lt;</strong><span><small>num</small><b>${v.num}</b></span><strong>${v.comparison ? "True →" : "False ←"}</strong></div>`;
    if (v.transition) work += `<div class="l300-update"><span>tails[${v.transition.index}]</span><b>${v.transition.before ?? "∅"}</b><strong>→ ${v.transition.after}</strong><small>${v.event === "append" ? text("Dài thêm 1", "Length +1") : v.transition.before === v.transition.after ? text("Trùng giá trị · giữ độ dài", "Equal value · same length") : text("Đuôi nhỏ hơn · giữ độ dài", "Smaller tail · same length")}</small></div>`;
  }

  const witnessLabel = final ? text("Một LIS thực sự", "One actual LIS") : dpMode ? text(`Dãy tốt nhất kết thúc ở [${v.end}]`, `Best subsequence ending at [${v.end}]`) : text("Một dãy tăng đã tìm được", "An increasing subsequence found so far");
  const differs = dpMode && v.candidate.length && v.candidate.join(",") !== v.witness.join(",");
  const stage = final ? 2 : ["length", "initialize"].includes(v.event) ? 0 : 1;
  $("treeView").innerHTML = `<section class="l300-viz" aria-label="${text("300 · Dãy con tăng dài nhất", "300 · Longest increasing subsequence")}">
    <div class="l300-stages">${[text("1 · Khởi tạo", "1 · Initialize"), dpMode ? "2 · j → i" : text("2 · Tìm & cập nhật", "2 · Search & update"), text("3 · LIS", "3 · LIS")].map((label, index) => `<span class="${index === stage ? "active" : ""}">${label}</span>`).join("")}</div>
    <div class="l300-line"><b>L${v.line}</b><code>${escapeHtml(v.source)}</code></div>
    <div class="l300-meaning">${dpMode ? text("dp[i] = dài nhất kết thúc tại i", "dp[i] = longest length ending at i") : text("Giữ thứ tự gốc · được bỏ qua số", "Keep original order · skipping is allowed")}</div>
    <div class="l300-array" aria-label="nums${dpMode ? " / dp" : ""}">${columns}</div>
    ${work}
    ${v.witness.length ? chain(witnessLabel, v.witness) : ""}
    ${differs ? chain(text("Thử nối j → i", "Try extending j → i"), v.candidate, true) : ""}
    ${!dpMode ? `<small class="l300-note">${text("tails không nhất thiết là một dãy con của nums.", "tails is not necessarily a subsequence of nums.")}</small>` : ""}
    ${final ? `<div class="l300-result" role="status" aria-live="polite">${text("Độ dài LIS", "LIS length")} <strong>${v.answer}</strong> ✓</div>` : `<div class="l300-legend"><span>↓ ${dpMode ? text("i: đang xét", "i: current") : text("num: đang thêm", "num: current input")}</span>${dpMode ? `<span class="source">● j: ${text("thử nối", "candidate")}</span>` : ""}<span class="chain">● ${text("Dãy đã chọn", "Chosen subsequence")}</span></div>`}
  </section>`;
}
