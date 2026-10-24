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
      "make-prices": this.t("Mở hàng giá", "Open price row"),
      "make-prefix": this.t("Mở hàng prefix", "Open prefix row"),
      "prefix-item": this.t("Món kế tiếp", "Next item"),
      "prefix-best": this.t("Nâng prefix max", "Raise prefix max"),
      "append-price": this.t("Ghim giá", "Pin price"),
      "append-prefix": this.t("Ghim kỷ lục", "Pin record"),
      "make-answer": this.t("Mở ô kết quả", "Open answers"),
      "pick-query-bs": this.t("Query mới", "New query"),
      "init-search": this.t("Khoanh cả dãy", "Full search range"),
      "check-search": this.t("Còn khoảng tìm", "Search continues"),
      "pick-mid": this.t("Chọn điểm giữa", "Pick midpoint"),
      "compare-mid": this.t("So giá với query", "Compare price"),
      "move-right": this.t("Tìm bên phải", "Search right"),
      "move-left": this.t("Thu về bên trái", "Shrink left"),
      "search-done": this.t("Chốt giá cuối", "Lock last price"),
      "place-answer-bs": this.t("Lấy prefix max", "Read prefix max"),
      "return-answer-bs": this.t("Hoàn tất", "Done"),
      "seed-prefix": this.t("Prefix đầu", "First prefix"),
      "pick-query-bisect": this.t("Query mới", "New query"),
      "init-bisect": this.t("Tìm vị trí chèn", "Find insertion point"),
      "bisect-mid": this.t("Chọn giữa", "Pick midpoint"),
      "bisect-compare": this.t("So giá", "Compare price"),
      "bisect-right": this.t("Dịch phải", "Move right"),
      "bisect-left": this.t("Dịch trái", "Move left"),
      "bisect-done": this.t("Chốt idx", "Lock idx"),
      "place-answer-bisect": this.t("Lấy prefix max", "Read prefix max"),
      "no-affordable-item": this.t("Không có món phù hợp", "No affordable item"),
      "return-answer-bisect": this.t("Hoàn tất", "Done"),
    })[event] || "";
  }

  queryLine(v) {
    const list = v.queriesSorted
      ? v.orderedQueries
      : v.queries.map((value, originalIndex) => ({ value, originalIndex }));
    return list.map((query, orderIndex) => {
      const active = Boolean(v.activeQuery) && orderIndex === v.queryOrderIndex;
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
    const changed = (v.event === "raise-best" || v.event === "prefix-best") && v.best > v.previousBest;
    return `<div class="mbi2070-record${changed ? " is-new" : ""}">
      <span aria-hidden="true">🏆</span><small>MAX</small><b>◆${v.best}</b>
      ${changed ? `<i>${v.previousBest} → ${v.best}</i>` : ""}
    </div>`;
  }

  prefixRecord(v) {
    const searching = Boolean(v.activeQuery);
    const ready = Number.isInteger(v.selectedIndex);
    const value = ready ? (v.selectedIndex >= 0 ? v.prefix[v.selectedIndex] : 0) : searching ? "?" : v.best;
    return `<div class="mbi2070-record${ready ? " is-new" : ""}">
      <span aria-hidden="true">🏆</span><small>PREFIX</small><b>${value === "?" ? "?" : `◆${value}`}</b>
    </div>`;
  }

  answers(v) {
    return `<div class="mbi2070-answers" aria-label="${this.t("Kết quả theo thứ tự ban đầu", "Answers in original order")}">${v.queries.map((query, index) => `<div class="mbi2070-answer${v.resolved[index] ? " is-ready" : ""}">
      <small>$${query}</small><b>${v.resolved[index] ? `◆${v.answers[index]}` : "?"}</b><i>q${index}</i>
    </div>`).join("")}</div>`;
  }

  prefixMarket(v) {
    const hasRange = Number.isInteger(v.lo) && Number.isInteger(v.hi);
    const searched = new Set(Array.isArray(v.searchPath) ? v.searchPath : []);
    return v.sortedItems.map((item, index) => {
      const classes = ["mbi2070-prefix-item"];
      if (index < v.prefix.length) classes.push("is-built");
      if (index === v.activeItemIndex) classes.push("is-current");
      if (hasRange && index >= v.lo && index < v.hi) classes.push("is-range");
      if (index === v.mid && v.activeQuery) classes.push("is-mid");
      if (searched.has(index)) classes.push("is-searched");
      if (index === v.selectedIndex) classes.push("is-selected");
      const prefixValue = index < v.prefix.length ? `◆${v.prefix[index]}` : "·";
      return `<div class="${classes.join(" ")}" data-price="${item.price}" data-beauty="${item.beauty}">
        <div class="mbi2070-prefix-cap"><small>MAX</small><b>${prefixValue}</b></div>
        <div class="mbi2070-prefix-gem"><span>◆</span><b>${item.beauty}</b></div>
        <strong>$${item.price}</strong>
        ${index === v.mid && v.activeQuery ? '<i aria-hidden="true">⌕</i>' : ""}
      </div>`;
    }).join("");
  }

  binaryEquation(v) {
    if (v.comparison) {
      return `<div class="mbi2070-equation ${v.comparison.allowed ? "is-yes" : "is-no"}">
        <span>$${v.comparison.price}</span><i>≤</i><b>$${v.comparison.query}</b><strong>${v.comparison.allowed ? "✓" : "✕"}</strong>
      </div>`;
    }
    if (Number.isInteger(v.selectedIndex)) {
      const price = v.selectedIndex >= 0 ? `$${v.prices[v.selectedIndex]}` : "∅";
      const beauty = v.selectedIndex >= 0 ? v.prefix[v.selectedIndex] : 0;
      return `<div class="mbi2070-bs-result"><span>${price}</span><i>→</i><b>◆${beauty}</b></div>`;
    }
    return `<div class="mbi2070-idle mbi2070-bs-idle"><span>↕</span><i>→</i><b>MAX</b><i>→</i><strong>⌕</strong></div>`;
  }

  searchStatus(v) {
    const lo = Number.isInteger(v.lo) ? v.lo : "·";
    const hi = Number.isInteger(v.hi) ? v.hi : "·";
    const mid = Number.isInteger(v.mid) ? v.mid : "·";
    return `<div class="mbi2070-search-status" aria-label="Binary search bounds">
      <span><small>lo</small><b>${lo}</b></span><i>···</i><span class="is-mid"><small>mid</small><b>${mid}</b></span><i>···</i><span><small>hi</small><b>${hi}</b></span>
    </div>`;
  }

  renderPrefixBinary(v) {
    const method = v.approach === 3 ? "BISECT RIGHT" : "BINARY SEARCH";
    this.host.innerHTML = `<section class="mbi2070-viz mbi2070-prefix-viz" role="region" aria-label="2070 Sort Prefix Max Binary Search">
      <header class="mbi2070-heading">
        <span>#2070 · PREFIX + ${method}</span><strong>${this.eventLabel(v.event)}</strong>
        <b>${v.activeQuery ? `$${v.activeQuery.value}` : "⌕"}</b>
      </header>
      <div class="mbi2070-pipeline" aria-label="Sort then Prefix Max then ${method}"><b>SORT</b><i>→</i><b>PREFIX MAX</b><i>→</i><b>${method}</b></div>
      <div class="mbi2070-queries">${this.queryLine(v)}</div>
      <main class="mbi2070-stage mbi2070-prefix-stage">
        ${this.searchStatus(v)}
        <div class="mbi2070-prefix-market" style="--mbi-prefix-count:${v.sortedItems.length}">${this.prefixMarket(v)}</div>
        <div class="mbi2070-check">${this.binaryEquation(v)}${this.prefixRecord(v)}</div>
      </main>
      ${this.answers(v)}
    </section>`;
  }

  render(step) {
    const v = step.mostBeautifulItem2070View;
    if (!v) return;
    if (v.approach === 2 || v.approach === 3) {
      this.renderPrefixBinary(v);
      return;
    }
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
