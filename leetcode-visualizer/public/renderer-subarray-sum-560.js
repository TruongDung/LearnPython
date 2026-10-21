function subarray560Geometry(v) {
  const gap = v.nums.length <= 6 ? 90 : 64;
  const lanes = Math.min(6, v.lookup?.positions.length || 0);
  return { gap, width: Math.max(680, v.nums.length * gap + 230), height: 225 + lanes * 27 };
}
function renderSubarray560Pictures(step) {
  const v = step.subarray560View, t = (vi, en) => lang === "vi" ? vi : en, esc = value => escapeHtml(String(value));
  const summary = v.mode === "summary", final = Boolean(step.final), { gap, width, height } = subarray560Geometry(v);
  const read = v.prefixes.length - 1, active = !final && v.event !== "loop-end", end = v.i === null ? null : v.i + 1;
  const stored = new Set(v.entries.flatMap(entry => entry.positions)), matching = new Set(v.lookup?.positions || []);
  let dots = "", cells = "", ranges = "";
  if (!summary) for (let b = 0; b <= v.nums.length; b++) {
    const x = 40 + b * gap, known = b < v.prefixes.length;
    const classes = ["s560-prefix", known ? "known" : "pending", stored.has(b) ? "stored" : "", matching.has(b) ? "match" : "", active && end === b && known ? "current" : ""].filter(Boolean).join(" ");
    dots += `<g class="${classes}"><text class="prefix-id" x="${x}" y="14" text-anchor="middle">P[${b}]</text><circle cx="${x}" cy="43" r="20"/><text class="prefix-value" x="${x}" y="48" text-anchor="middle" style="font-size:${known && String(v.prefixes[b]).length > 4 ? 10 : 13}px">${known ? v.prefixes[b] : "?"}</text>${stored.has(b) ? `<text class="stored-tick" x="${x + 15}" y="64">✓</text>` : ""}</g>`;
  }
  v.nums.forEach((value, i) => {
    const x = 40 + i * gap + 7, current = active && i === v.i;
    cells += `<g class="s560-num${i < read && !summary ? " read" : ""}${current ? " current" : ""}"><rect x="${x}" y="98" width="${gap - 14}" height="45" rx="7"/><text class="num-value" x="${x + (gap - 14) / 2}" y="127" text-anchor="middle">${value}</text><text class="num-index" x="${x + (gap - 14) / 2}" y="164" text-anchor="middle">${current ? "i = " : ""}${i}</text>${current ? `<path class="pointer" d="M${x + gap / 2 - 20},80 h12 l-6,10 Z"/>` : ""}</g>`;
  });
  const shown = (v.lookup?.positions || []).slice(0, 6);
  shown.forEach((start, row) => {
    const x1 = 40 + start * gap, x2 = 40 + end * gap, y = 202 + row * 27;
    ranges += `<g class="s560-range"><path class="boundary" d="M${x1},65 V${y} M${x2},65 V${y}"/><path class="bracket" d="M${x1 + 3},${y - 6} v8 H${x2 - 3} v-8"/><text x="${x2 + 15}" y="${y + 5}">[${start}..${v.i}] · Σ = ${v.k}</text></g>`;
  });
  if (v.lookup && v.lookup.positions.length > shown.length) ranges += `<text class="s560-caption" x="40" y="${height - 8}">+${v.lookup.positions.length - shown.length} ${t("đoạn nữa", "more ranges")}</text>`;
  if (!shown.length) ranges += `<text class="s560-caption" x="40" y="203">${summary ? `${t("Chỉ xem", "Preview")} ${v.nums.length}/${v.total} ${t("số đầu", "leading numbers")}` : final ? `${t("Đã duyệt đủ", "Processed all")} ${v.total} ${t("số", "numbers")}` : v.lookup ? t("0 mốc khớp → thêm 0 đoạn", "No matching prefix → add 0 ranges") : v.need !== null ? `P[b] = ${v.need} ?` : "P[b] = prefix − k"}</text>`;
  const phase = v.line === 7 || v.line === 6 ? 0 : v.line === 8 || v.line === 9 ? 1 : v.line === 10 ? 2 : v.line === 11 ? 3 : -1;
  const phases = [t("Cộng số", "Add number"), t("Tra mốc cũ", "Find old prefix"), t("Đếm đoạn", "Count ranges"), t("Lưu mốc mới", "Store new prefix")].map((label, i) => `<span class="${i === phase && !final ? "active" : ""}"><b>${i + 1}</b>${label}</span>`).join("");
  const entries = v.entries.map(entry => {
    const updated = v.store?.sum === entry.sum, match = v.need === entry.sum;
    return `<div class="s560-entry${match ? " match" : ""}${updated ? " updated" : ""}"><small>${t("tổng", "sum")} <b>${entry.sum}</b></small><strong>${updated ? `<s>${v.store.before}</s> → ` : ""}${entry.frequency}<em> ${t("lần", "times")}</em></strong><code>${entry.positions.slice(0, 6).map(b => `P[${b}]`).join(" · ")}${entry.positions.length > 6 ? ` · +${entry.positions.length - 6}` : ""}</code></div>`;
  }).join("");
  const addition = v.addition;
  const math = summary ? "" : `<div class="s560-math"><div><small>need = prefix − k</small><strong>${v.need === null ? "—" : `${v.prefix} − (${v.k}) = ${v.need}`}</strong></div><span>→</span><div><small>${t("Mốc cũ khớp · hits", "Earlier matches · hits")}</small><strong class="hits">${v.lookup ? v.lookup.hits : "?"}</strong></div><span>→</span><div><small>res</small><strong>${v.res ?? "—"}</strong>${addition ? `<code>${addition.before} + ${addition.hits} = ${addition.after}</code>` : ""}</div></div>`;
  const recent = final && !summary ? v.found.slice(-8) : [];
  const history = recent.length ? `<div class="s560-found"><small>${v.found.length <= 8 ? t("Các đoạn đã đếm", "Counted ranges") : t("8 đoạn gần nhất", "8 most recent ranges")} · ${v.found.length} ${t("tổng cộng", "in total")}</small><div>${recent.map(range => `<div class="s560-found-range" data-start="${range.start}" data-end="${range.end}"><code>[${range.start}..${range.end}]</code><div class="s560-mini">${v.nums.map((value, i) => `<i class="${i >= range.start && i <= range.end ? "inside" : ""}" title="nums[${i}] = ${value}">${v.nums.length <= 8 ? value : ""}</i>`).join("")}</div><b>Σ=${v.k}</b></div>`).join("")}</div></div>` : "";
  const host = $("treeView");
  host.innerHTML = `<section class="s560-viz" aria-label="560 · Subarray Sum Equals K">
    <header><strong>560 · ${t("Đếm đoạn tổng k", "Count ranges summing to k")}</strong><button type="button" data-s560-next ${final ? "disabled" : ""}>${t("Xong lượt", "Finish round")} ⏭</button><button type="button" data-s560-result>${t("Kết quả", "Result")}</button></header>
    ${summary ? `<div class="s560-summary">${t("Đã đếm đủ", "Counted all")} ${v.total} ${t("số · hình xem trước 12 số. Debug từng dòng với ≤30 số.", "numbers · picture previews 12 numbers. Line debug for ≤30 numbers.")}</div>` : `<div class="s560-phases">${phases}</div><div class="s560-line"><b>L${v.line}</b><code>${esc(v.source)}</code></div>`}
    ${math}
    <div class="s560-diagram"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="width:${width}px;height:${height}px" role="img" aria-label="${esc(t("Mốc tổng tiền tố và các đoạn khớp. P[b] là tổng b số đầu.", "Prefix boundaries and matching ranges. P[b] is the sum of the first b numbers."))}">${ranges}${dots}${cells}</svg></div>
    ${summary ? "" : `<div class="s560-legend"><span>P[b] = sum(nums[:b])</span><span class="match">● ${t("mốc khớp", "matching prefix")}</span><span class="current">◯ ${t("prefix hiện tại", "current prefix")}</span><span>✓ ${t("đã lưu", "stored")}</span></div><div class="s560-map"><small>count · ${t("tổng → số lần xuất hiện", "sum → frequency")}${v.store ? ` · ${t("lưu sau khi đếm", "store after counting")}` : ""}</small><div>${entries}</div></div>`}
    ${final ? `<div class="s560-answer"><span>${t("Số đoạn", "Range count")}</span><strong>return ${v.res}</strong><code>k = ${v.k}</code></div>` : ""}${history}
    <div class="s560-examples">${[t("Ví dụ", "Example"), t("Số âm", "Negatives"), t("Toàn 0", "All zeros"), "k = 3", "k = −1", t("Không khớp", "No matches")].map((text, i) => `<button type="button" data-s560-example="${i}">${text}</button>`).join("")}</div>
  </section>`;
  host.querySelector("[data-s560-result]").addEventListener("click", () => { stopPlay(); stepIndex = steps.length - 1; renderStep(); });
  host.querySelector("[data-s560-next]").addEventListener("click", () => {
    const target = steps.findIndex((s, i) => i > stepIndex && s.subarray560View?.event === "store");
    stopPlay(); stepIndex = target < 0 ? steps.length - 1 : target; renderStep();
  });
  host.querySelectorAll("[data-s560-example]").forEach(button => button.addEventListener("click", () => {
    const [nums, k] = [[[1,1,1],2], [[1,-1,0],0], [[0,0,0],0], [[1,2,3],3], [[-1,-1,1],-1], [[1,2],9]][Number(button.dataset.s560Example)];
    $("arrInput").value = nums.join(","); $("extraParams").querySelector('[data-param="k"]').value = k; runViz();
  }));
  const diagram = host.querySelector(".s560-diagram");
  if (diagram && active && end !== null && width > diagram.clientWidth) diagram.scrollLeft = Math.max(0, 40 + end * gap - diagram.clientWidth * .65);
}
