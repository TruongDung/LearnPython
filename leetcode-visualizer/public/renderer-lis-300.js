function renderLis300View(step) {
  const v = step.lis300View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const hashMode = v.approach === 4 || v.approach === 5;
  const dpMode = v.approach !== 2;
  const indexMode = v.approach === 3 || v.approach === 5;
  const unitStep = hashMode;
  const relation = unitStep ? "nums[j] + 1 = nums[i]" : "nums[j] &lt; nums[i]";
  const final = Boolean(step.final);
  const activeJ = dpMode && ["inner", "compare", "improve-check", "update", "parent"].includes(v.event) ? v.j : null;
  const activeI = final ? null : v.reconstructing ? (v.cursor >= 0 ? v.cursor : null) : hashMode ? v.index : dpMode ? v.i : v.k;
  const witnessSet = new Set(v.witness);
  const minimum = Math.min(...v.nums), maximum = Math.max(...v.nums);
  const columns = v.nums.map((value, index) => {
    const current = index === activeI, source = index === activeJ;
    const future = !final && !v.reconstructing && activeI !== null && index > activeI;
    const marker = current ? (v.reconstructing ? `end=${index} ↓` : hashMode ? "x ↓" : dpMode ? `i=${index} ↓` : "num ↓") : source ? `j=${index} ↓` : "";
    const height = maximum === minimum ? 55 : 20 + (value - minimum) / (maximum - minimum) * 65;
    return `<div class="l300-number${current ? " current" : ""}${source ? " source" : ""}${witnessSet.has(index) ? " in-chain" : ""}${future ? " future" : ""}" data-index="${index}"><small class="l300-pointer">${marker || "&nbsp;"}</small><span class="l300-pillar" style="height:${height}px" aria-hidden="true"></span><strong>${value}</strong><small>[${index}]</small>${dpMode && !hashMode ? `<span class="l300-dp"><small>dp</small><b>${v.dp[index] ?? "—"}</b></span>` : ""}${indexMode && v.parent ? `<span class="l300-parent"><small>parent</small><b>${v.parent[index]}</b></span>` : ""}</div>`;
  }).join("");

  function chain(label, indices, candidate = false) {
    return `<div class="l300-chain${candidate ? " candidate" : ""}${indexMode ? " index-mode" : ""}"><small>${label}</small><div>${indices.length ? indices.map((index, i) => `${i ? `<span class="l300-arrow" aria-hidden="true">${unitStep ? "+1 →" : "→"}</span>` : ""}<span class="l300-chain-node" style="--rise:${Math.min(i * 6, 30)}px"><b>${indexMode ? `[${index}]` : v.nums[index]}</b><small>${indexMode ? `nums=${v.nums[index]}` : `[${index}]`}</small></span>`).join("") : '<span class="l300-empty">∅</span>'}</div>${indices.length ? `<b class="l300-length">${text("dài", "length")} ${indices.length}</b>` : ""}${indexMode && indices.length ? `<div class="l300-index-values"><code>index = [${indices.join(", ")}]</code><code>${text("giá trị", "values")} = [${indices.map(index => v.nums[index]).join(", ")}]</code></div>` : ""}</div>`;
  }

  let work = "";
  if (hashMode) {
    const entries = Object.entries(v.mapDp).sort((a, b) => Number(a[0]) - Number(b[0]));
    work = `<div class="l300-tail-heading"><strong>dp</strong><span>${text("độ dài tốt nhất kết thúc bằng giá trị", "best length ending at value")}</span></div><div class="l300-tails">${entries.length ? entries.map(([value, length]) => `<div class="l300-tail${Number(value) === v.x ? " current" : ""}"><small>dp[${value}]</small><b>${length}</b></div>`).join("") : '<span class="l300-empty">∅</span>'}</div>`;
    if (indexMode) {
      const endings = Object.entries(v.endMap || {}).sort((a, b) => Number(a[0]) - Number(b[0]));
      work += `<div class="l300-tail-heading"><strong>end_at</strong><span>${text("giá trị → index mới nhất", "value → latest index")}</span></div><div class="l300-tails">${endings.length ? endings.map(([value, index]) => `<div class="l300-tail${Number(value) === v.x ? " current" : ""}"><small>${value}</small><b>[${index}]</b></div>`).join("") : '<span class="l300-empty">∅</span>'}</div>`;
    }
    if (v.transition) work += `<div class="l300-update"><span>dp.get(${v.transition.value - 1}, 0): <b>${v.transition.previousLength}</b></span><span>+ 1</span><strong>→ dp[${v.transition.value}] = ${v.transition.after}</strong></div>`;
  } else if (dpMode) {
    if (activeJ !== null) work = `<div class="l300-compare${v.comparison === false ? " rejected" : v.comparison === true ? " accepted" : ""}"><span><small>${unitStep ? "nums[j] + 1" : "nums[j]"}</small><b>${v.nums[v.j]}${unitStep ? " + 1" : ""}</b></span><strong>${unitStep ? "=" : "&lt;"}</strong><span><small>nums[i]</small><b>${v.nums[v.i]}</b></span><strong>${v.comparison === null ? "?" : v.comparison ? "✓" : "×"}</strong>${v.comparison === false ? `<small>${text(`Bỏ qua dòng ${v.line + 1}`, `Skip line ${v.line + 1}`)}</small>` : ""}</div>`;
    if (v.transition) work += `<div class="l300-update"><span>dp[${v.i}]: <b>${v.transition.before}</b></span><span>max</span><span>dp[${v.j}]+1: <b>${v.transition.candidate}</b></span><strong>→ ${v.transition.after}</strong></div>`;
  } else {
    const searching = ["bounds", "while", "middle", "compare", "left", "right"].includes(v.event);
    const showMid = ["middle", "compare", "left", "right"].includes(v.event);
    work = `<div class="l300-tail-heading"><strong>tails</strong><span>${searching ? `[lo, hi) = [${v.lo}, ${v.hi})` : text("Đuôi nhỏ nhất theo độ dài", "Smallest tail for each length")}</span></div><div class="l300-tails">${v.tails.length ? v.tails.map((value, index) => `<div class="l300-tail${searching && (index < v.lo || index >= v.hi) ? " outside" : ""}${showMid && index === v.mid ? " source" : ""}${v.transition?.index === index ? " current" : ""}"><small>${showMid && index === v.mid ? "mid ↓" : `ℓ=${index + 1}`}</small><b>${value}</b><small>[${index}]</small></div>`).join("") : '<span class="l300-empty">∅</span>'}</div>`;
    if (v.event === "compare") work += `<div class="l300-compare${v.comparison ? " accepted" : " rejected"}"><span><small>tails[mid]</small><b>${v.tails[v.mid]}</b></span><strong>&lt;</strong><span><small>num</small><b>${v.num}</b></span><strong>${v.comparison ? "True →" : "False ←"}</strong></div>`;
    if (v.transition) work += `<div class="l300-update"><span>tails[${v.transition.index}]</span><b>${v.transition.before ?? "∅"}</b><strong>→ ${v.transition.after}</strong><small>${v.event === "append" ? text("Dài thêm 1", "Length +1") : v.transition.before === v.transition.after ? text("Trùng giá trị · giữ độ dài", "Equal value · same length") : text("Đuôi nhỏ hơn · giữ độ dài", "Smaller tail · same length")}</small></div>`;
  }

  let indexLists = "";
  if (indexMode && !hashMode && v.end >= 0 && (final || v.i !== null)) {
    const end = final ? v.end : v.i ?? v.end;
    const eligible = v.eligibleByEnd[end];
    indexLists = `<section class="l300-index-list" aria-label="${text("Danh sách j hợp lệ đã xét", "Eligible j indices checked so far")}"><header><strong>j &lt; i · ${relation}</strong><small>${final ? text("Cuối dãy: ", "Ending at: ") : ""}i=${end} · ${v.checkedByEnd[end]}/${end} ${text("đã xét", "checked")}</small></header><div>${eligible.length ? eligible.map(index => `<span class="l300-eligible${index === activeJ ? " source" : ""}${witnessSet.has(index) ? " chosen" : ""}"><b>[${index}]</b><small>nums=${v.nums[index]}</small></span>`).join("") : '<span class="l300-empty">∅</span>'}</div><code>${text("j hợp lệ", "eligible j")} = [${eligible.join(", ")}]</code></section>`;
  }
  const indexHistory = indexMode && !hashMode && final ? `<details class="l300-index-history"><summary>${text("j hợp lệ theo từng i", "Eligible j indices for each i")}</summary><table><thead><tr><th scope="col">i</th><th scope="col">nums[i]</th><th scope="col">j: ${relation}</th><th scope="col">dp[i]</th></tr></thead><tbody>${v.nums.map((value, i) => `<tr><th scope="row">${i}</th><td>${value}</td><td><code>[${v.eligibleByEnd[i].join(", ")}]</code></td><td>${v.dp[i]}</td></tr>`).join("")}</tbody></table></details>` : "";
  const reconstruction = indexMode && v.reconstructing && !final ? `<section class="l300-reconstruction" aria-label="${text("Lần ngược parent", "Backtrack parent links")}"><header><strong>${["reverse"].includes(v.event) ? text("Đảo lại → thứ tự gốc", "Reverse → original order") : text("Lần ngược parent ←", "Follow parent links ←")}</strong><code>end = ${v.cursor}</code></header><div>${v.indices?.length ? v.indices.map(index => `<b>[${index}]</b>`).join('<span>→</span>') : '<span class="l300-empty">∅</span>'}</div><code>indices = [${(v.indices || []).join(", ")}]</code></section>` : "";
  const witnessLabel = final ? (unitStep ? (indexMode ? text("Index của dãy +1 dài nhất", "Indices of a longest +1 subsequence") : text("Dãy +1 dài nhất", "A longest +1 subsequence")) : indexMode ? text("Index của một LIS", "Indices of one LIS") : text("Một LIS thực sự", "One actual LIS")) : dpMode ? text(`${indexMode ? "Index tốt nhất" : "Dãy tốt nhất"} kết thúc ở [${v.end}]`, `Best ${indexMode ? "indices" : "subsequence"} ending at [${v.end}]`) : text("Một dãy tăng đã tìm được", "An increasing subsequence found so far");
  const differs = dpMode && v.candidate.length && v.candidate.join(",") !== v.witness.join(",");
  const stage = final || v.reconstructing ? 2 : ["length", "initialize", "parents", "validate", "max-initialize"].includes(v.event) ? 0 : 1;
  $("treeView").innerHTML = `<section class="l300-viz" aria-label="${text("300 · Dãy con tăng dài nhất", "300 · Longest increasing subsequence")}">
    <div class="l300-stages">${[text("1 · Khởi tạo", "1 · Initialize"), hashMode ? "2 · dp[num]" : dpMode ? (unitStep ? "2 · j +1 → i" : "2 · j → i") : text("2 · Tìm & cập nhật", "2 · Search & update"), unitStep ? text("3 · Dãy +1", "3 · +1 subsequence") : "3 · LIS"].map((label, index) => `<span class="${index === stage ? "active" : ""}">${label}</span>`).join("")}</div>
    <div class="l300-line"><b>L${v.line}</b><code>${escapeHtml(v.source)}</code></div>
    <div class="l300-meaning">${hashMode ? text("dp[num] = độ dài dãy +1 kết thúc bằng num", "dp[num] = +1 subsequence length ending at num") : dpMode ? text("dp[i] = dài nhất kết thúc tại i", "dp[i] = longest length ending at i") : text("Giữ thứ tự gốc · được bỏ qua số", "Keep original order · skipping is allowed")}</div>
    ${unitStep ? `<div class="l300-unit-rule"><strong>+1</strong><code>${hashMode ? "dp[num] = dp.get(num - 1, 0) + 1" : "nums[j] + 1 = nums[i]"}</code><small>${text("Giữ thứ tự · được bỏ qua phần tử", "Keep order · skipping is allowed")}</small></div>` : ""}
    <div class="l300-array" aria-label="nums${dpMode && !hashMode ? " / dp" : ""}">${columns}</div>
    ${work}
    ${reconstruction}
    ${indexLists}
    ${v.witness.length ? chain(witnessLabel, v.witness) : ""}
    ${differs ? chain(text("Thử nối j → i", "Try extending j → i"), v.candidate, true) : ""}
    ${indexHistory}
    ${!dpMode ? `<small class="l300-note">${text("tails không nhất thiết là một dãy con của nums.", "tails is not necessarily a subsequence of nums.")}</small>` : ""}
    ${final ? `<div class="l300-result" role="status" aria-live="polite">${indexMode ? text("Trả về index", "Return indices") : hashMode ? "max_len =" : unitStep ? "max(dp) =" : text("Độ dài LIS", "LIS length")} <strong>${indexMode ? `[${v.answer.join(", ")}]` : v.answer}</strong> ✓</div>` : `<div class="l300-legend"><span>↓ ${v.reconstructing ? text("end: lần ngược", "end: backtracking") : hashMode ? "x" : dpMode ? text("i: đang xét", "i: current") : text("num: đang thêm", "num: current input")}</span>${dpMode && !v.reconstructing && !hashMode ? `<span class="source">● j: ${text("thử nối", "candidate")}</span>` : ""}<span class="chain">● ${text("Dãy đã chọn", "Chosen subsequence")}</span></div>`}
  </section>`;
}
