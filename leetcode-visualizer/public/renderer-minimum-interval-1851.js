function renderMinimumInterval1851View(step) {
  const view = step.minimumInterval1851View;
  if (!view) return;
  const host = $("treeView");
  const tr = (vi, en) => lang === "vi" ? vi : en;
  const current = view.queryOrderIndex === null ? null : view.orderedQueries[view.queryOrderIndex];
  const query = current?.query ?? null;
  const heapIds = new Set(view.heap.map((interval) => interval.id));
  const rootId = view.heap[0]?.id ?? null;
  const values = [...new Set([
    ...view.intervals.flatMap((interval) => [interval.left, interval.right]),
    ...view.queries,
  ])].sort((first, second) => first - second);
  const column = (value) => values.indexOf(value) + 1;
  const phaseIndex = ({ sort: 0, query: 1, eligible: 1, push: 1, expired: 2, pop: 2, answer: 3, empty: 3, done: 4 })[view.event] ?? 0;
  const phases = [
    tr("① Xếp", "① Sort"),
    tr("② Nạp ≤ q", "② Add ≤ q"),
    tr("③ Bỏ quá hạn", "③ Drop expired"),
    tr("④ Lấy min", "④ Take min"),
  ];

  const lanes = view.intervals.map((interval, sortedIndex) => {
    const added = sortedIndex < view.intervalIndex;
    const expired = added && !heapIds.has(interval.id) && query !== null && interval.right < query;
    const covers = query !== null && interval.left <= query && query <= interval.right;
    const state = interval.id === rootId && covers ? "best"
      : interval.id === view.poppedIntervalId ? "popping"
        : interval.id === view.activeIntervalId ? "loading"
          : heapIds.has(interval.id) ? "candidate"
            : expired ? "expired" : "waiting";
    const needle = query === null ? "" : `<i class="mi1851-needle ${covers ? "hit" : "miss"}" style="grid-column:${column(query)}" aria-hidden="true"></i>`;
    return `<div class="mi1851-lane" data-interval="${interval.id}" data-state="${state}"><small>I${interval.id}</small><div class="mi1851-track" style="--mi-cols:${values.length}">${needle}<span class="mi1851-bar ${state}" style="grid-column:${column(interval.left)} / ${column(interval.right) + 1}"><b>${interval.left}</b><em>${interval.length}</em><b>${interval.right}</b></span></div></div>`;
  }).join("");
  const axis = `<div class="mi1851-axis"><span></span><div style="--mi-cols:${values.length}">${values.map((value) => `<b class="${value === query ? "active" : ""}">${value}</b>`).join("")}</div></div>`;

  const maxLength = Math.max(1, ...view.intervals.map((interval) => interval.length));
  const heap = view.heap.length ? view.heap.map((interval, index) => `<article class="mi1851-heap-card ${index === 0 ? "root" : ""}" data-interval="${interval.id}"><div class="mi1851-size"><i style="--mi-size:${interval.length / maxLength}"></i></div><span>[${interval.left}, ${interval.right}]</span><b>${interval.length}</b>${index === 0 ? `<small>${tr("NHỎ NHẤT", "SHORTEST")}</small>` : ""}</article>`).join("") : `<div class="mi1851-empty">∅</div>`;

  const queryCards = view.queries.map((value, index) => {
    const answer = view.answers[index];
    const isCurrent = current?.originalIndex === index;
    return `<article class="mi1851-query ${isCurrent ? "current" : ""} ${answer !== null ? "answered" : ""}" data-query="${index}"><small>q${index}</small><b>${value}</b><i>↓</i><strong>${answer ?? "?"}</strong></article>`;
  }).join("");

  const verdict = view.final
    ? `<div class="mi1851-final"><span>${view.queries.map((value) => `q=${value}`).join(" · ")}</span><strong>[${view.answer.join(", ")}]</strong></div>`
    : `<div class="mi1851-verdict ${view.event}"><span>${query === null ? "q = ?" : `q = ${query}`}</span><b>${view.event === "answer" ? view.heap[0].length : view.event === "empty" ? -1 : "?"}</b></div>`;

  host.innerHTML = `<section class="mi1851-viz"><header class="mi1851-head"><span>#1851</span><strong>${tr("Đoạn ngắn nhất", "Minimum interval")}</strong><em>${query === null ? "q = —" : `q = ${query}`}</em></header><nav class="mi1851-phases" aria-label="Algorithm phases">${phases.map((phase, index) => `<span class="${index === Math.min(phaseIndex, 3) ? "active" : index < phaseIndex ? "done" : ""}">${phase}</span>`).join("<i>→</i>")}</nav><section class="mi1851-road" aria-label="${tr("Các khoảng và vị trí query", "Intervals and query position")}">${lanes}${axis}</section><section class="mi1851-lower"><div class="mi1851-heap"><header><span>MIN-HEAP</span><b>${view.heap.length}</b></header><div>${heap}</div></div><div class="mi1851-queries">${queryCards}</div></section>${verdict}<footer><span class="candidate">● ${tr("trong heap", "in heap")}</span><span class="best">★ ${tr("ngắn nhất", "shortest")}</span><span class="expired">× ${tr("quá hạn", "expired")}</span></footer></section>`;
}
