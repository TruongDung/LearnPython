"use strict";

function renderKSum2386View(step) {
  const view = step.kSum2386View;
  if (!view) return;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const show = (value) => value === null || value === undefined ? "—" : escapeHtml(value);
  const stage = view.phase === "maximum" ? 0 : view.phase === "normalize" ? 1
    : view.phase === "seed" ? 2 : 3;
  const stages = [
    ["1. Maximum gốc", "1. Base maximum"],
    ["2. Sort |nums|", "2. Sort |nums|"],
    ["3. Seed loss heap", "3. Seed loss heap"],
    ["4. Pop + sinh 2 nhánh", "4. Pop + create 2 branches"],
  ];
  const stageHtml = stages.map((labels, index) => `<span class="${index === stage ? "active" : ""}${index < stage ? " done" : ""}">${text(...labels)}</span>`).join("");

  const numberHtml = view.numbers.map((item) => `<div class="ks2386-number ${item.baseSelected ? "base" : ""} ${item.selected ? "selected" : ""} ${item.flipped ? "flipped" : ""}"><small>nums[${item.index}]</small><b>${show(item.value)}</b><span>${item.flipped ? text("FLIP", "FLIP") : item.baseSelected ? text("lấy ở maximum", "in maximum") : text("bỏ ở maximum", "out of maximum")}</span></div>`).join("");
  const normalizedHtml = view.normalized.map((item) => `<div class="ks2386-absolute ${item.chosen ? "chosen" : ""} ${item.active ? "active" : ""} ${item.next ? "next" : ""}"><small>a[${item.sortedIndex}] · nums[${item.originalIndex}]</small><b>${show(item.value)}</b><span>|${show(item.originalValue)}|</span></div>`).join("");

  const historyRows = view.history.map((entry) => `<tr class="${entry.rank === view.rank ? "active" : ""}"><td>${entry.rank}</td><td>${show(entry.loss)}</td><td>${show(view.maximum)} − ${show(entry.loss)}</td><td><b>${show(entry.sum)}</b></td><td>${entry.chosen.length ? `{${entry.chosen.join(", ")}}` : "∅"}</td></tr>`).join("");
  const frontierHtml = view.frontier.length ? view.frontier.map((entry) => `<div class="ks2386-state ${entry.position === 0 ? "root" : ""}"><small>${entry.position === 0 ? "MIN ROOT" : `heap[${entry.position}]`} · ${escapeHtml(entry.origin)}</small><b>loss ${show(entry.loss)}</b><span>i=${entry.index} · flip {${entry.chosen.join(", ")}}</span><em>sum ${show(view.maximum - entry.loss)}</em></div>`).join("") : `<p class="ks2386-empty">${text("Heap rỗng", "Heap is empty")}</p>`;

  const branch = view.branch;
  const branchPanel = branch ? `<section class="ks2386-branch ${branch.type}"><header><strong>${branch.type === "add" ? "ADD" : branch.type === "replace" ? "REPLACE" : "SEED"}</strong><span>${branch.type === "add" ? text("giữ state cũ + thêm next", "keep old state + add next") : branch.type === "replace" ? text("bỏ flip cuối + dùng next", "drop last flip + use next") : text("flip phần tử nhỏ nhất", "flip the smallest item")}</span></header><div class="ks2386-branch-flow">${branch.parent ? `<article><small>PARENT</small><b>${show(branch.parent.loss)}</b><span>{${branch.parent.chosen.join(", ")}}</span></article><i>→</i>` : ""}<article class="child"><small>CHILD</small><b>${show(branch.child.loss)}</b><span>{${branch.child.chosen.join(", ")}}</span></article></div></section>` : `<section class="ks2386-branch idle"><header><strong>${text("HAI NHÁNH SINH STATE", "TWO STATE BRANCHES")}</strong></header><div class="ks2386-rules"><code>ADD: loss + a[i+1]</code><code>REPLACE: loss − a[i] + a[i+1]</code></div></section>`;

  const selectedExpression = view.witnessTruncated
    ? text("Đã rút gọn cho input lớn", "Condensed for large input")
    : view.selectedValues.length ? view.selectedValues.map((value) => value < 0 ? `(${value})` : value).join(" + ") : "∅ = 0";
  const currentChoices = view.current?.chosenValues?.length ? view.current.chosenValues.join(" + ") : "0";

  $("treeView").innerHTML = `<section class="ks2386-viz" aria-label="${text("Mô phỏng Find the K-Sum of an Array", "Find the K-Sum of an Array simulation")}">
    <header class="ks2386-heading"><div><small>#2386 · HARD · BEST-FIRST HEAP ENUMERATION</small><h3>${text("K-th largest sum = maximum − k-th smallest loss", "K-th largest sum = maximum − k-th smallest loss")}</h3></div><div class="ks2386-answer"><small>RANK ${view.rank} / ${view.k}</small><b>${show(view.candidate)}</b><span>${text("candidate hiện tại", "current candidate")}</span></div></header>
    <nav class="ks2386-stages">${stageHtml}</nav>
    <div class="ks2386-action"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <section class="ks2386-transform"><header><strong>${text("Bước 1 · Chọn maximum và biến mọi thay đổi thành loss", "Step 1 · Choose maximum and turn every change into a loss")}</strong><code>${show(view.maximum)} − ${show(view.loss)} = ${show(view.candidate)}</code></header><div class="ks2386-numbers">${numberHtml}</div><footer><span class="base">${text("viền tím: thuộc maximum", "purple: in maximum")}</span><span class="selected">${text("nền xanh: subsequence của state", "green: state's subsequence")}</span><span class="flipped">${text("gạch đỏ: quyết định bị flip", "red strike: flipped decision")}</span>${view.numbersTruncated ? `<em>${text("Đang hiện 60 số đầu", "Showing the first 60 values")}</em>` : ""}</footer></section>
    <section class="ks2386-normalized"><header><div><strong>${text("Bước 2 · Trục loss đã sort", "Step 2 · Sorted loss axis")}</strong><span>a = sorted(abs(nums))</span></div><div><i class="chosen"></i>${text("đang flip", "flipped")}<i class="active"></i>i<i class="next"></i>i+1</div></header><div>${normalizedHtml}</div>${view.normalizedTruncated ? `<p>${text("Danh sách lớn đã rút gọn quanh state đang xét.", "The large list is condensed around the active state.")}</p>` : ""}</section>
    <div class="ks2386-engine">
      <section class="ks2386-frontier"><header><strong>${text("Bước 3 · Min-heap frontier", "Step 3 · Min-heap frontier")}</strong><span>${view.frontierSize} states</span></header><div>${frontierHtml}</div><footer>${text("Root có loss nhỏ nhất → tạo subsequence sum lớn nhất chưa xuất ra.", "The minimum-loss root gives the largest unseen subsequence sum.")}</footer></section>
      ${branchPanel}
    </div>
    <div class="ks2386-proof-grid">
      <section class="ks2386-ranks"><header><strong>${text("Thứ tự được pop", "Pop order")}</strong><span>${text("tổng trùng vẫn giữ rank riêng", "duplicate sums keep separate ranks")}</span></header><div><table><thead><tr><th>rank</th><th>loss</th><th>maximum − loss</th><th>k-sum</th><th>${text("flip indexes", "flip indexes")}</th></tr></thead><tbody>${historyRows}</tbody></table></div></section>
      <section class="ks2386-witness"><header><strong>${text("Subsequence làm chứng", "Witness subsequence")}</strong><span>flip loss = ${currentChoices}</span></header><div><code>${escapeHtml(selectedExpression)}</code><b>${view.witnessTruncated ? "" : `= ${show(view.candidate)}`}</b></div><p>${view.witnessTruncated ? text("Input có hơn 200 phần tử: chỉ rút gọn danh sách witness để giữ animation nhẹ; loss và đáp án vẫn được tính đầy đủ.", "For inputs over 200 values, the witness list is condensed to keep animation light; the loss and answer are still computed in full.") : text("Với số dương: flip nghĩa là bỏ khỏi maximum. Với số âm hoặc 0: flip nghĩa là thêm vào subsequence.", "For a positive value, flip removes it from maximum. For a negative value or zero, flip adds it to the subsequence.")}</p></section>
    </div>
    <details class="ks2386-proof"${view.phase === "done" ? " open" : ""}><summary>${text("Vì sao đúng hai nhánh ADD / REPLACE là đủ?", "Why are exactly two ADD / REPLACE branches enough?")}</summary><p>${text("Mỗi state lưu index lớn nhất i đã dùng. Mọi state con có index lớn nhất i+1 hoặc giữ toàn bộ lựa chọn cũ rồi thêm i+1 (ADD), hoặc bỏ i và thay bằng i+1 (REPLACE). Hai nhóm rời nhau và bao phủ mọi subset loss đúng một lần; min-heap vì thế liệt kê loss theo thứ tự tăng.", "Each state stores its largest used index i. Every child whose largest index is i+1 either keeps all old choices and adds i+1 (ADD), or removes i and replaces it with i+1 (REPLACE). These disjoint groups cover every loss subset exactly once, so the min-heap enumerates losses in ascending order.")}</p></details>
  </section>`;
}
