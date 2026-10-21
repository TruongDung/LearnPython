"use strict";

class MostBeautifulItem2070Visualizer {
  constructor({ host, language = "en" }) {
    this.host = host;
    this.language = language;
  }

  t(vi, en) { return this.language === "vi" ? vi : en; }

  eventLabel(event) {
    return ({
      "bind-class": this.t("Gian hàng", "Market"),
      "enter-method": this.t("Bắt đầu", "Start"),
      "sort-items": this.t("Xếp theo giá", "Sort by price"),
      "sort-queries": this.t("Xếp ngân sách", "Sort budgets"),
      "allocate-answer": this.t("Mở ô kết quả", "Open answer slots"),
      "seed-best": this.t("Kỷ lục = 0", "Record = 0"),
      "seed-pointer": this.t("Cổng ở đầu", "Gate at start"),
      "pick-query": this.t("Ngân sách mới", "New budget"),
      "open-gate": this.t("Món đi qua", "Item passes"),
      "raise-best": this.t("So kỷ lục", "Check record"),
      "advance-item": this.t("Dời cổng", "Move gate"),
      "close-gate": this.t("Dừng cổng", "Stop gate"),
      "place-answer": this.t("Đặt đáp án", "Place answer"),
      "return-answer": this.t("Hoàn tất", "Done"),
    })[event] || "";
  }

  queryLine(v) {
    const list = v.queriesSorted
      ? v.orderedQueries
      : v.queries.map((value, originalIndex) => ({ value, originalIndex }));
    return list.map((query, orderIndex) => {
      const active = v.queriesSorted && orderIndex === v.queryOrderIndex;
      const done = v.resolved[query.originalIndex];
      return `<div class="mbi2070-query${active ? " is-active" : ""}${done ? " is-done" : ""}" data-query-index="${query.originalIndex}">
        <small>q${query.originalIndex}</small><b>$${query.value}</b>${done ? `<i>◆${v.answers[query.originalIndex]}</i>` : ""}
      </div>`;
    }).join("");
  }

  itemCard(item, index, v, maxBeauty) {
    const current = index === v.activeItemIndex;
    const processed = index < v.pointer;
    const locked = v.activeQuery && item.price > v.activeQuery.value && !processed;
    const classes = ["mbi2070-item", current ? "is-current" : "", processed ? "is-passed" : "", locked ? "is-locked" : ""]
      .filter(Boolean).join(" ");
    const height = Math.max(16, Math.round(item.beauty / maxBeauty * 100));
    return `<div class="${classes}" data-item-id="${item.id}" data-price="${item.price}" data-beauty="${item.beauty}">
      <div class="mbi2070-beauty" style="--mbi-beauty:${height}%"><span>◆</span><b>${item.beauty}</b></div>
      <small>$${item.price}</small>
    </div>`;
  }

  market(v) {
    const items = v.itemsSorted ? v.sortedItems : v.items;
    const maxBeauty = Math.max(...items.map((item) => item.beauty));
    const gatePosition = v.final ? -1 : Math.min(v.pointer, items.length);
    const cards = [];
    for (let index = 0; index <= items.length; index += 1) {
      if (index === gatePosition) {
        cards.push(`<div class="mbi2070-gate"><b>${v.activeQuery ? `$${v.activeQuery.value}` : "$?"}</b><i>↓</i></div>`);
      }
      if (index < items.length) cards.push(this.itemCard(items[index], index, v, maxBeauty));
    }
    return cards.join("");
  }

  equation(v) {
    if (!v.comparison) return `<div class="mbi2070-idle"><span>🏷</span><i>→</i><b>🏆 ◆${v.best}</b></div>`;
    const symbol = v.comparison.price === null ? "∅" : `$${v.comparison.price}`;
    const result = v.comparison.allowed ? "✓" : "✕";
    return `<div class="mbi2070-equation ${v.comparison.allowed ? "is-yes" : "is-no"}">
      <span>${symbol}</span><i>≤</i><b>$${v.comparison.query}</b><strong>${result}</strong>
    </div>`;
  }

  record(v) {
    const changed = v.event === "raise-best" && v.best > v.previousBest;
    return `<div class="mbi2070-record${changed ? " is-new" : ""}">
      <span aria-hidden="true">🏆</span><small>MAX</small><b>◆${v.best}</b>
      ${changed ? `<i>${v.previousBest} → ${v.best}</i>` : ""}
    </div>`;
  }

  answers(v) {
    return `<div class="mbi2070-answers" aria-label="${this.t("Kết quả theo thứ tự ban đầu", "Answers in original order")}">${v.queries.map((query, index) => `<div class="mbi2070-answer${v.resolved[index] ? " is-ready" : ""}">
      <small>$${query}</small><b>${v.resolved[index] ? `◆${v.answers[index]}` : "?"}</b><i>q${index}</i>
    </div>`).join("")}</div>`;
  }

  render(step) {
    const v = step.mostBeautifulItem2070View;
    if (!v) return;
    this.host.innerHTML = `<section class="mbi2070-viz" role="region" aria-label="2070 Most Beautiful Item for Each Query">
      <header class="mbi2070-heading">
        <span>#2070 · ${this.t("QUÉT GIÁ", "PRICE SWEEP")}</span><strong>${this.eventLabel(v.event)}</strong>
        <b>${v.activeQuery ? `$${v.activeQuery.value}` : "◆"}</b>
      </header>
      <div class="mbi2070-queries">${this.queryLine(v)}</div>
      <main class="mbi2070-stage">
        <div class="mbi2070-market" style="--mbi-count:${v.items.length + (v.final ? 0 : 1)}">${this.market(v)}</div>
        <div class="mbi2070-check">${this.equation(v)}${this.record(v)}</div>
      </main>
      ${this.answers(v)}
    </section>`;
  }
}

function renderMostBeautifulItem2070View(step) {
  new MostBeautifulItem2070Visualizer({ host: $("treeView"), language: lang }).render(step);
}
