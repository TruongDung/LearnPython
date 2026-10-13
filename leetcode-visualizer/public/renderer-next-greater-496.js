function renderNextGreater496View(step) {
  const view = step.nextGreater496View;
  const t = (vi, en) => lang === "vi" ? vi : en;
  const lookup = view.phase === "lookup" || view.phase === "answer";
  const line = step.codeLines.length === 1 ? step.codeLines[0] : null;
  const target = view.resolved;
  const compared = view.compareIndex >= 0 ? view.nums2[view.compareIndex] : null;
  const queryIndex = lookup ? view.nums2.indexOf(view.lookupValue) : -1;
  const queryMapping = view.nextGreater.find(({ from }) => from === view.lookupValue);
  const mapped = target && view.nextGreater.some(({ from }) => from === target.value);
  const fromIndex = lookup ? queryIndex : target?.index ?? (compared !== null && view.value > compared ? view.compareIndex : -1);
  const toIndex = lookup ? (queryMapping ? view.nums2.indexOf(queryMapping.to) : -1) : view.index;
  // An arrow is prospective during comparison/pop and solid only after the map write.
  const connected = fromIndex >= 0 && toIndex > fromIndex;
  const pending = !lookup && !mapped;
  const noGreater = lookup && queryIndex >= 0 && !queryMapping;
  const active = lookup ? queryIndex : view.index;
  const width = Math.max(300, view.nums2.length * 62 + 44);
  const spacing = (width - 44) / Math.max(1, view.nums2.length);
  const x = (i) => 22 + spacing * (i + 0.5);
  const low = Math.min(...view.nums2);
  const high = Math.max(...view.nums2);
  const barHeight = (value) => 30 + (high === low ? 35 : (value - low) / (high - low) * 54);
  const bars = view.nums2.map((value, i) => {
    const state = i === active ? "current" : i === fromIndex || (!lookup && i === view.compareIndex) ? "candidate" : i === toIndex && connected ? "found" : "";
    const waiting = !lookup && view.stack.some((item) => item.index === i);
    const height = barHeight(value);
    return `<g class="nge496-token ${state}" data-index="${i}">
      <title>nums2[${i}] = ${value}</title>
      <rect x="${x(i) - 21}" y="${158 - height}" width="42" height="${height}" rx="8" />
      <text class="nge496-value" x="${x(i)}" y="${158 - height / 2 + 5}">${value}</text>
      <text class="nge496-index" x="${x(i)}" y="177">${i}</text>
      ${i === active ? `<path class="nge496-cursor" d="M ${x(i) - 5} 190 L ${x(i) + 5} 190 L ${x(i)} 183 Z" />` : ""}
      ${waiting ? `<circle class="nge496-wait-dot" cx="${x(i)}" cy="${148 - height}" r="3" />` : ""}
    </g>`;
  }).join("");
  let arc = "";
  if (connected) {
    const middle = (x(fromIndex) + x(toIndex)) / 2;
    arc = `<g class="nge496-link${pending ? " pending" : ""}" data-from="${fromIndex}" data-to="${toIndex}">
      <path d="M ${x(fromIndex)} ${148 - barHeight(view.nums2[fromIndex])} V 49 Q ${x(fromIndex)} 38 ${x(fromIndex) + 11} 38 H ${x(toIndex) - 11} Q ${x(toIndex)} 38 ${x(toIndex)} 49 V ${144 - barHeight(view.nums2[toIndex])}" marker-end="url(#nge496-arrow)" />
      <text x="${middle}" y="24">${t("Lớn hơn đầu tiên →", "First greater →")}</text>
    </g>`;
  } else if (noGreater) {
    arc = `<g class="nge496-link missing"><path d="M ${x(queryIndex)} ${148 - barHeight(view.lookupValue)} V 49 Q ${x(queryIndex)} 38 ${x(queryIndex) + 11} 38 H ${width - 12}" /><text x="${Math.min(width - 65, (x(queryIndex) + width - 12) / 2)}" y="24">${t("Không có → −1", "None → −1")}</text></g>`;
  }
  const operation = view.final ? t("Hoàn tất", "Done")
    : lookup ? t("Tra đáp án", "Lookup")
    : line === 7 ? "POP ↑" : line === 8 ? t("Lưu đáp án", "Save pair")
    : line === 9 ? "PUSH ↓" : line === 6 ? (compared === null ? "STACK ∅" : t("So sánh", "Compare"))
    : line === 5 ? t("Quét →", "Scan →") : t("Bắt đầu", "Start");
  const relation = view.final ? `<b class="green">✓</b>` : target ? `<b class="blue">${target.value}</b><span>→</span><b class="green">${view.value}</b>`
    : lookup && queryIndex >= 0 ? `<b class="blue">${view.lookupValue}</b><span>→</span><b class="${queryMapping ? "green" : "red"}">${queryMapping?.to ?? "−1"}</b>`
    : compared !== null ? `<b class="blue">${compared}</b><span>${compared < view.value ? "<" : "≥"}</span><b class="orange">${view.value}</b>`
    : view.index >= 0 ? `<b class="orange">${view.value}</b><span>${line === 9 ? "↓" : "→"}</span>` : `<span>∅</span>`;
  const stackItems = [...view.stack].reverse().map((item, i) => `<div class="nge496-stack-item${i === 0 ? " top" : ""}${line === 9 && item.index === view.index ? " pushed" : ""}"><small>[${item.index}]</small><strong>${item.value}</strong>${i === 0 ? `<em>← ${t("đỉnh", "top")}</em>` : ""}</div>`).join("");
  const mappings = view.nextGreater.map(({ from, to }) => `<span class="nge496-pair${(target?.value === from || (lookup && view.lookupValue === from)) ? " active" : ""}"><b>${from}</b><i>→</i><b>${to}</b></span>`).join("");
  const answers = view.nums1.map((value, i) => `<span class="nge496-answer${lookup && i === view.lookupIndex ? " active" : ""}${view.result[i] !== null ? " filled" : ""}${view.result[i] === -1 ? " missing" : ""}"><small>${value}</small><i>↓</i><strong>${view.result[i] === null ? "?" : view.result[i]}</strong></span>`).join("");
  $("treeView").innerHTML = `<section class="nge496-viz">
    <header class="nge496-heading"><strong>496 · ${t("Số lớn hơn kế tiếp", "Next Greater Element")}</strong><span class="nge496-badge">${lookup ? "② nums1" : "① nums2"}</span></header>
    <section class="nge496-card nge496-array-card">
      <header><strong>nums2</strong><span>${t("Chỉ tìm bên phải →", "Look to the right →")}</span></header>
      <div class="nge496-array"><svg viewBox="0 0 ${width} 198" style="min-width:${view.nums2.length <= 5 ? 0 : width}px" role="img" aria-label="${escapeHtml(t("Các số trong nums2; mũi tên nối tới số lớn hơn đầu tiên bên phải", "nums2 values; arrow to the first greater value to the right"))}"><defs><marker id="nge496-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" /></marker></defs>${bars}${arc}</svg></div>
      <div class="nge496-operation"><span>${operation}</span><div>${relation}</div>${pending && connected ? `<small>${t("chưa ghi map", "not saved yet")}</small>` : ""}</div>
    </section>
    <div class="nge496-flow">
      <section class="nge496-card nge496-stack"><header><strong>STACK</strong><span>${t("● đang chờ", "● waiting")}</span></header>
        ${target ? `<div class="nge496-popped"><strong>${target.value}</strong><span>↑ POP</span></div>` : ""}
        <div class="nge496-stack-items">${stackItems || `<span class="nge496-empty">∅</span>`}</div>
      </section>
      <div class="nge496-flow-arrow${target ? " active" : ""}" aria-hidden="true">→</div>
      <section class="nge496-card nge496-map"><header><strong>MAP</strong><span>${t("đã tìm thấy", "resolved")}</span></header><div class="nge496-pairs">${mappings || `<span class="nge496-empty">∅</span>`}</div></section>
    </div>
    <section class="nge496-card nge496-results"><header><strong>nums1 ↓ result</strong><span>${view.result.filter((v) => v !== null).length}/${view.nums1.length}</span></header><div>${answers}</div></section>
  </section>`;
}
