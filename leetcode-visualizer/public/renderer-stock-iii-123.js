"use strict";

function st123Escape(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function st123Copy() {
  const vi = typeof lang !== "undefined" && lang === "vi";
  return { locale: vi ? "vi" : "en", region: vi ? "Hai giao dịch cổ phiếu" : "Two stock transactions",
    after: vi ? "Sau dòng" : "After line", day: vi ? "Ngày" : "Day", price: vi ? "Giá" : "Price",
    states: vi ? "Bốn phương án DP" : "Four DP alternatives", hold: vi ? "Giữ" : "Hold", cash: vi ? "Tiền" : "Cash", trades: vi ? "lượt" : "trades",
    keep: vi ? "Giữ cũ" : "Keep", today: vi ? "Thử hôm nay" : "Try today", tie: vi ? "Bằng nhau → giữ cũ" : "Tie → keep the older plan",
    chart: vi ? "Giá và phương án" : "Prices and plan", buy: vi ? "Mua" : "Buy", sell: vi ? "Bán" : "Sell", buyMark: vi ? "M" : "B", sellMark: vi ? "B" : "S",
    witness: vi ? "Một cách đạt giá trị này" : "One way to attain this value", noTrade: vi ? "Không cần giao dịch" : "No transaction needed",
    holding: vi ? "Đang giữ từ ngày" : "Holding from day", log: vi ? "Nhật ký cập nhật theo ngày" : "Daily update log",
    result: vi ? "Kết quả ↠" : "Result ↠", nextDay: vi ? "Ngày tiếp →" : "Next day →", nextUpdate: vi ? "Giá trị mới →" : "Next improvement →",
    answer: vi ? "Lợi nhuận tối đa" : "Maximum profit", presets: vi ? ["Hai lượt", "Tăng", "Giảm", "Đi ngang", "Giá 0", "Một ngày"]
      : ["Two trades", "Rising", "Falling", "Flat", "Zero prices", "One day"],
  };
}

function st123States(v, t) {
  return `<section class="st123-states"><header>${t.states}</header><div>${["buy1", "sell1", "buy2", "sell2"].map((name, index) => {
    const hold = index % 2 === 0, limit = index < 2 ? 1 : 2, value = v.values[name];
    return `<div class="st123-state ${hold ? "is-hold" : "is-cash"} ${v.active.includes(name) ? "is-active" : ""}" data-state-name="${name}" data-state-value="${value}"><header><code>${name}</code><small>${index + 1}</small></header><b>${value ?? "—"}</b><span>${hold ? "▣" : "○"} ${hold ? t.hold : t.cash} · ≤${limit} ${t.trades}</span></div>`;
  }).join("")}</div></section>`;
}

function st123Operation(v, t) {
  const o = v.operation; if (!o) return "";
  const formula = o.source ? `${o.source} (${o.sourceValue}) ${o.kind === "buy" ? "−" : "+"} ${o.price}` : `−${o.price}`;
  return `<section class="st123-operation" data-operation="${o.target}" data-improved="${o.improved}"><header><code>${o.target} = max(…)</code>${o.tie ? `<small>${t.tie}</small>` : ""}</header><div class="st123-choices"><span class="${!o.improved ? "is-chosen" : ""}"><small>${t.keep}</small><b data-keep>${o.before}</b></span><i>↔</i><span class="${o.improved ? "is-chosen" : ""}"><small>${t.today}</small><code>${formula}</code><b data-candidate>${o.candidate}</b></span></div><div class="st123-selected"><code>${o.target}</code><i>→</i><b data-selected>${o.after}</b></div></section>`;
}

function st123Chart(v, t) {
  const width = Math.max(460, 128 + (v.prices.length - 1) * 52), max = Math.max(1, ...v.prices), top = 56, bottom = 190;
  const x = index => v.prices.length === 1 ? width / 2 : 64 + index * (width - 128) / (v.prices.length - 1);
  const y = price => bottom - price / max * (bottom - top);
  const grid = [...new Set([0, Math.round(max / 2), max])].map(price => `<g class="st123-grid"><path d="M64,${y(price)} H${width - 64}"/><text x="51" y="${y(price) + 4}" text-anchor="end">${price}</text></g>`).join("");
  const lines = v.prices.slice(1).map((price, index) => `<path class="st123-price-line ${index + 1 > v.day ? "is-future" : ""}" d="M${x(index)},${y(v.prices[index])} L${x(index + 1)},${y(price)}"/>`).join("");
  const gains = v.transactions.map((trade, index) => {
    const midX = (x(trade.buy) + x(trade.sell)) / 2, midY = Math.max(30, (y(trade.buyPrice) + y(trade.sellPrice)) / 2 - 14);
    return `<g class="st123-trade-line is-${index % 2}" data-trade-buy="${trade.buy}" data-trade-sell="${trade.sell}" data-trade-profit="${trade.profit}"><path d="M${x(trade.buy)},${y(trade.buyPrice)} L${x(trade.sell)},${y(trade.sellPrice)}"/><text x="${midX}" y="${midY}">+${trade.profit}</text></g>`;
  }).join("");
  const actionDays = new Set(v.focusPath.map(a => a.day));
  const points = v.prices.map((price, index) => `<g class="st123-day ${index === v.day ? "is-current" : ""} ${index > v.day ? "is-future" : ""}" data-st123-day="${index}" data-point-price="${price}" role="button" tabindex="0" aria-label="${t.day} ${index}: ${price}"><rect class="st123-hit" x="${x(index) - 22}" y="26" width="44" height="216" fill="transparent" pointer-events="all"/><circle cx="${x(index)}" cy="${y(price)}" r="${index === v.day ? 6 : 4}"/>${actionDays.has(index) ? "" : `<text class="st123-point-value" x="${x(index)}" y="${y(price) - 11}">${price}</text>`}<text class="st123-day-index" x="${x(index)}" y="233">${index}</text></g>`).join("");
  let number = 0;
  const actions = v.focusPath.map(action => {
    if (action.kind === "buy") number++;
    const label = `${action.kind === "buy" ? t.buyMark : t.sellMark}${number} · ${action.price}`;
    return `<g class="st123-action is-${(number - 1) % 2}" data-action-kind="${action.kind}" data-action-day="${action.day}"><circle cx="${x(action.day)}" cy="${y(action.price)}" r="8"/><text x="${x(action.day)}" y="${y(action.price) + (action.kind === "buy" ? 28 : -21)}">${label}</text></g>`;
  }).join("");
  const bands = v.prices.map((_, day) => {
    const trade = v.transactions.findIndex(t => day >= t.buy && day <= t.sell);
    return `<span class="${day === v.day ? "is-current" : ""} ${trade < 0 ? "" : `is-trade-${trade}`}" title="${t.day} ${day}"></span>`;
  }).join("");
  return `<section class="st123-chart"><header><b>${t.chart} · <code>${v.focus}</code></b><span>${v.cursorBound ? `i=${v.day}` : "prices[0]"} · ${v.price}</span></header><div class="st123-chart-scroll" tabindex="0" role="region" aria-label="${t.chart}"><svg class="st123-svg" width="${width}" height="252" viewBox="0 0 ${width} 252" role="group" aria-label="${t.chart}"><title>${t.chart}</title>${grid}${lines}<path class="st123-cursor" d="M${x(v.day)},30 V204"/>${gains}${points}${actions}<text class="st123-axis-caption" x="${width / 2}" y="248">i</text></svg></div><div class="st123-overview">${bands}</div><div class="st123-chart-legend"><span>${t.buyMark} = ${t.buy}</span><span>${t.sellMark} = ${t.sell}</span><span>┄ ${v.focus}</span></div></section>`;
}

function st123Trades(v, t) {
  if (!v.focusPath.length && v.answer === null) return "";
  const open = v.focusPath.at(-1)?.kind === "buy" ? v.focusPath.at(-1) : null;
  return `<section class="st123-trades"><header>${t.witness} · <code>${v.focus}</code></header>${v.transactions.map((trade, index) => `<div class="st123-trade is-${index}"><small>${index + 1}</small><span><b>${t.buy} ${trade.buyPrice}</b><small>i=${trade.buy}</small></span><i>→</i><span><b>${t.sell} ${trade.sellPrice}</b><small>i=${trade.sell}</small></span><strong>+${trade.profit}</strong></div>`).join("")}${open ? `<div class="st123-open">▣ ${t.holding} ${open.day} · ${open.price}</div>` : ""}${!v.focusPath.length ? `<div class="st123-no-trade">∅ ${t.noTrade}</div>` : ""}</section>`;
}

function st123Ledger(v, t) {
  const fields = ["buy1", "sell1", "buy2", "sell2"];
  return `<section class="st123-log"><header><b>${t.log}</b><small>${v.ledger.length}/${v.prices.length}</small></header><div class="st123-ledger-scroll" tabindex="0"><table><thead><tr><th>i</th><th>${t.price}</th>${fields.map(name => `<th>${name}</th>`).join("")}</tr></thead><tbody>${v.ledger.map(row => `<tr class="${row.day === v.day ? "is-current" : ""}" data-st123-day="${row.day}" data-ledger-done="${row.done}" tabindex="0" role="button"><th>${row.day}</th><td>${row.price}</td>${fields.map(name => `<td class="${row.day === v.day && v.active.includes(name) ? "is-active" : ""}" data-ledger-day="${row.day}" data-ledger-field="${name}" data-ledger-value="${row.values[name]}">${row.values[name] ?? "·"}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>`;
}

function st123Jump(kind) {
  if (typeof steps === "undefined" || typeof renderStep !== "function") return;
  if (typeof stopPlay === "function") stopPlay();
  const next = steps.findIndex((s, index) => {
    const v = s.stock123View; return index > stepIndex && v && (kind === "result" ? v.answer !== null : kind === "day" ? v.source.line === 5 && v.branch : v.operation?.improved);
  });
  stepIndex = next < 0 ? steps.length - 1 : next; renderStep();
}

function st123Bind(host) {
  const bind = (selector, action) => host.querySelectorAll(selector).forEach(node => {
    node.addEventListener("click", () => action(node));
    node.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); action(node); } });
  });
  bind("[data-st123-jump]", node => st123Jump(node.dataset.st123Jump));
  bind("[data-st123-day]", node => {
    if (typeof steps === "undefined" || typeof renderStep !== "function") return;
    const day = Number(node.dataset.st123Day), index = steps.findIndex(s => s.stock123View?.day === day && (day === 0 ? s.codeLines[0] === 3 : s.codeLines[0] === 5 && s.stock123View.branch));
    if (index < 0) return; if (typeof stopPlay === "function") stopPlay(); stepIndex = index; renderStep();
  });
  bind("[data-st123-case]", node => {
    if (typeof runViz !== "function") return;
    const cases = [[3, 3, 5, 0, 0, 3, 1, 4], [1, 2, 3, 4, 5], [7, 6, 4, 3, 1], [3, 3, 3, 3], [0, 100000, 0, 100000], [5]];
    document.getElementById("arrInput").value = cases[Number(node.dataset.st123Case)].join(","); runViz();
  });
}

function renderStock123Pictures(step) {
  const host = document.getElementById("treeView"), v = step.stock123View, t = st123Copy();
  if (!host || !v) return;
  const oldChart = host.querySelector(".st123-chart-scroll")?.scrollLeft ?? 0;
  const previousLog = host.querySelector(".st123-ledger-scroll"), oldLog = previousLog?.scrollTop ?? 0, oldLogX = previousLog?.scrollLeft ?? 0;
  host.innerHTML = `<article class="st123-viz" role="region" aria-label="${t.region}" data-source-line="${v.source.line}"><header class="st123-header"><div><small>LEETCODE 123 · ROLLING DP</small><h2>${st123Escape(v.phase[t.locale])}</h2></div><b class="st123-limit">≤ 2 ${t.trades}</b></header><nav class="st123-presets" aria-label="Examples">${t.presets.map((name, i) => `<button type="button" data-st123-case="${i}">${name}</button>`).join("")}</nav><div class="st123-source"><span>${t.after} <b>L${v.source.line}</b></span><code>${st123Escape(v.source.text)}</code>${v.branch === null ? "" : `<strong class="${v.branch ? "is-true" : "is-false"}">${v.branch ? "True ✓" : "False ×"}</strong>`}</div>${st123States(v, t)}${st123Operation(v, t)}${st123Chart(v, t)}${st123Trades(v, t)}${v.answer === null ? "" : `<section class="st123-result"><small>${t.answer} · sell2</small><strong data-answer="${v.answer}">${v.answer}</strong></section>`}${st123Ledger(v, t)}<footer class="st123-footer"><div><button type="button" data-st123-jump="day">${t.nextDay}</button><button type="button" data-st123-jump="update">${t.nextUpdate}</button><button type="button" data-st123-jump="result">${t.result}</button></div><small>O(n) time · O(1) space</small></footer></article>`;
  const chart = host.querySelector(".st123-chart-scroll");
  if (chart) {
    chart.scrollLeft = oldChart;
    const point = host.querySelector(`.st123-day[data-st123-day="${v.day}"]`);
    if (point) { const box = chart.getBoundingClientRect(), p = point.getBoundingClientRect(), pad = 24;
      if (p.left < box.left + pad) chart.scrollLeft -= box.left + pad - p.left;
      if (p.right > box.right - pad) chart.scrollLeft += p.right - box.right + pad;
    }
  }
  const log = host.querySelector(".st123-ledger-scroll");
  if (log) {
    log.scrollTop = oldLog; log.scrollLeft = oldLogX;
    const current = log.querySelector("tr.is-current");
    if (current) { const box = log.getBoundingClientRect(), row = current.getBoundingClientRect();
      if (row.top < box.top + 30) log.scrollTop -= box.top + 30 - row.top;
      if (row.bottom > box.bottom) log.scrollTop += row.bottom - box.bottom;
    }
    const cell = current?.querySelector(`td.is-active[data-ledger-field="${v.focus}"]`);
    if (cell) {
      const box = log.getBoundingClientRect(), field = cell.getBoundingClientRect();
      const stickyWidth = current.querySelector("th")?.getBoundingClientRect().width ?? 0;
      if (field.left < box.left + stickyWidth + 2) log.scrollLeft -= box.left + stickyWidth + 2 - field.left;
      if (field.right > box.right - 2) log.scrollLeft += field.right - box.right + 2;
    }
  }
  st123Bind(host);
}
