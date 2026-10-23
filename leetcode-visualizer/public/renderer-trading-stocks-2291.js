function renderTradingStocks2291View(step) {
  const v = step.tradingStocks2291View;
  const vi = lang === "vi";
  const t = (vn, en) => vi ? vn : en;
  const esc = (value) => escapeHtml(String(value ?? ""));
  const final = v.mode === "summary" || step.final;
  const profitMax = Math.max(1, ...v.dp);
  const selectedStockIndexes = v.n <= 12
    ? Array.from({ length: v.n }, (_, index) => index)
    : [...Array.from({ length: 6 }, (_, index) => index), v.n - 2, v.n - 1].filter((index, position, all) => index >= 0 && all.indexOf(index) === position);
  const cards = selectedStockIndexes.map((i) => {
    const profit = v.future[i] - v.present[i];
    const active = !final && i === v.stockIndex;
    return `<article class="t2291-stock${active ? " active" : ""}${profit <= 0 ? " flat" : ""}">
      <small>#${i}</small><div class="t2291-price"><span>💵 ${v.present[i]}</span><b>→</b><span>📈 ${v.future[i]}</span></div>
      <strong>${profit > 0 ? "+" : ""}${profit}</strong>
    </article>`;
  }).join("");
  const omittedStocks = v.n - selectedStockIndexes.length;
  const trade = v.trade;
  const decision = !final && trade && trade.affordable !== false ? `<section class="t2291-decision">
    <div class="t2291-choice ${trade.picked ? "" : "winner"}"><small>${t("BỎ QUA", "SKIP")}</small><b>dp[${v.money}]</b><strong>${trade.skip}</strong></div>
    <span class="t2291-or">${t("hoặc", "or")}</span>
    <div class="t2291-choice ${trade.picked ? "winner" : ""}"><small>${t("MUA", "BUY")}</small><b>dp[${trade.sourceBudget}] + ${v.profit}</b><strong>${trade.buy}</strong></div>
    <span class="t2291-arrow">→</span><div class="t2291-picked"><small>dp[${v.money}]</small><strong>${trade.result}</strong></div>
  </section>` : !final && trade?.affordable === false ? `<div class="t2291-unavailable">🚫 ${t("Giá mua vượt ngân sách", "Purchase price is over budget")}</div>` : "";

  const visibleCapacities = new Set();
  const stride = Math.max(1, Math.ceil(v.dp.length / 61));
  for (let money = 0; money < v.dp.length; money += stride) visibleCapacities.add(money);
  visibleCapacities.add(v.budget);
  if (Number.isInteger(v.money)) visibleCapacities.add(v.money);
  if (Number.isInteger(trade?.sourceBudget)) visibleCapacities.add(trade.sourceBudget);
  const cells = [...visibleCapacities].sort((a, b) => a - b).map((money) => {
    const isTarget = money === v.money;
    const isSource = money === trade?.sourceBudget;
    const isAnswer = final && money === v.budget;
    const height = Math.max(4, Math.round(v.dp[money] / profitMax * 42));
    return `<div class="t2291-cell${isTarget ? " target" : ""}${isSource ? " source" : ""}${isAnswer ? " answer" : ""}" title="budget ${money}: profit ${v.dp[money]}">
      <strong>${v.dp[money]}</strong><i style="height:${height}px"></i><small>${money}</small>
    </div>`;
  }).join("");
  const stage = final
    ? t("Lãi tối đa", "Maximum profit")
    : `${v.stockIndex === null ? "" : `#${v.stockIndex} · `}${v.money === null ? t("chọn cổ phiếu", "choose stock") : `💰 ${v.money}`}`;
  const line = Number.isInteger(v.line) ? `<div class="t2291-code-line"><b>L${v.line}</b><code>${esc(v.source)}</code></div>` : "";
  const message = !v.detailed ? `<div class="t2291-summary">${t("Đã tính đủ mọi cổ phiếu · trace rút gọn", "All stocks computed · condensed trace")}</div>` : "";
  const exampleButtons = [t("Ví dụ 1", "Example 1"), t("Ví dụ 2", "Example 2"), t("Ví dụ 3", "Example 3")]
    .map((label, index) => `<button type="button" data-t2291-example="${index}">${label}</button>`).join("");

  $("treeView").innerHTML = `<section class="t2291-viz" aria-label="2291 · Maximum Profit From Trading Stocks">
    <header class="t2291-head"><strong>2291 <span>📈</span> ${t("Chọn cổ phiếu", "Pick stocks")}</strong><div class="t2291-budget">💰 ${t("Ngân sách", "Budget")} <b>${v.budget}</b></div><div class="t2291-stage">${stage}</div></header>
    ${message}${line}
    <section class="t2291-stocks" aria-label="${t("Các cổ phiếu", "Stocks")}">${cards}${omittedStocks > 0 ? `<small class="t2291-more">+${omittedStocks}</small>` : ""}</section>
    ${decision}
    <section class="t2291-wallet"><header><strong>🪙 dp[x] · ${t("lãi tốt nhất với tối đa x tiền", "best profit with up to x")}</strong><small>↓ ${t("duyệt từ lớn xuống nhỏ", "scan downward")}</small></header>
      <div class="t2291-cells">${cells}</div>
      ${stride > 1 ? `<small class="t2291-condensed">${t("Mỗi ô cách", "One cell every")} ${stride} ${t("đơn vị", "units")}</small>` : ""}
    </section>
    ${final ? `<div class="t2291-result"><span>🏆</span><small>${t("Lợi nhuận tối đa", "Maximum profit")}</small><strong>${v.answer}</strong></div>` : ""}
    <footer class="t2291-legend"><span><i class="current"></i>${t("đang xét", "current")}</span><span><i class="source"></i>${t("ngân sách nguồn", "source budget")}</span><span>${t("mỗi cổ phiếu chỉ mua 1 lần", "each stock is used once")}</span></footer>
    <nav class="t2291-examples">${exampleButtons}</nav>
  </section>`;

  $("treeView").querySelectorAll("[data-t2291-example]").forEach((button) => button.addEventListener("click", () => {
    const examples = [
      ["5,4,6,2,3;8,5,4,3,5", 10],
      ["2,2,5;3,4,10", 6],
      ["3,3,12;0,3,15", 10],
    ];
    const [input, budget] = examples[Number(button.dataset.t2291Example)];
    $("arrInput").value = input;
    $("extraParams").querySelector('[data-param="budget"]').value = budget;
    runViz();
  }));
}
