"use strict";

class WaysToExpressPowers2787Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) {
    this.host = host;
    this.language = language;
    this.escape = escape;
  }

  t(vi, en) { return this.language === "vi" ? vi : en; }
  value(value) { return this.escape(String(value)); }

  eventLabel(event) {
    return ({
      "bind-class": this.t("Lớp", "Class"),
      "enter-method": this.t("Bắt đầu", "Start"),
      "set-modulo": "MOD",
      "create-powers": this.t("Giỏ rỗng", "Empty shelf"),
      "set-base": this.t("Bắt đầu từ 1", "Start at 1"),
      "check-power": this.t("Thử mảnh", "Try piece"),
      "add-power": this.t("Thêm mảnh", "Add piece"),
      "next-base": this.t("Mảnh kế", "Next piece"),
      "finish-powers": this.t("Đủ mảnh", "Shelf ready"),
      "allocate-dp": this.t("Mở bản đồ", "Open map"),
      "seed-zero": this.t("Đứng ở 0", "Stand at 0"),
      "pick-power": this.t("Chọn mảnh", "Pick piece"),
      "aim-total": this.t("Ngắm đích", "Aim"),
      "move-ways": this.t("Chuyển cách", "Move ways"),
      "return-answer": this.t("Về đích", "Finish"),
    })[event] || "";
  }

  shelf(v) {
    let items = v.powers.map((item, index) => ({ item, index }));
    if (items.length > 14) {
      const current = Math.max(0, Math.min(v.powerIndex, items.length - 1));
      const indexes = new Set([0, 1, 2, items.length - 3, items.length - 2, items.length - 1]);
      for (let offset = -3; offset <= 3; offset += 1) indexes.add(current + offset);
      items = items.filter(({ index }) => indexes.has(index));
    }
    const cards = [];
    let previous = -1;
    for (const { item, index } of items) {
      if (previous >= 0 && index > previous + 1) cards.push('<span class="wsp2787-gap">•••</span>');
      const status = index === v.powerIndex ? "is-current" : index < v.powerIndex ? "is-used" : "";
      cards.push(`<div class="wsp2787-power ${status}" data-base="${item.base}">
        <span>${item.base}<sup>${v.x}</sup></span><b>${item.value}</b>
      </div>`);
      previous = index;
    }
    if (!cards.length) {
      const candidate = v.base ** v.x;
      cards.push(`<div class="wsp2787-power is-ghost"><span>${v.base}<sup>${v.x}</sup></span><b>${candidate}</b></div>`);
    }
    return cards.join("");
  }

  map(v) {
    const active = v.transition?.destination ?? v.total;
    const source = v.transition?.source;
    return v.cells.map((cell, index) => {
      const classes = [
        "wsp2787-stop",
        cell.total === 0 ? "is-start" : "",
        cell.total === v.n ? "is-target" : "",
        cell.total === source ? "is-source" : "",
        cell.total === active ? "is-active" : "",
        cell.ways > 0 ? "is-reached" : "",
      ].filter(Boolean).join(" ");
      const gap = index > 0 && cell.total > v.cells[index - 1].total + 1
        ? '<i class="wsp2787-map-gap">•••</i>' : "";
      return `${gap}<div class="${classes}" data-total="${cell.total}">
        <small>${cell.total}</small><b>${cell.ways > 0 ? this.value(cell.ways) : "·"}</b>
      </div>`;
    }).join("");
  }

  jump(v) {
    const tr = v.transition;
    if (!tr) {
      return `<div class="wsp2787-idle" aria-hidden="true">
        <span>0</span><i>➜</i><strong>${v.n}</strong>
      </div>`;
    }
    const preview = v.event === "aim-total";
    const after = preview ? "?" : tr.after;
    const addClass = tr.added > 0 ? "has-ways" : "no-ways";
    return `<div class="wsp2787-jump ${addClass}">
      <div class="wsp2787-jump-node is-from"><small>dp[${tr.source}]</small><b>${this.value(tr.added)}</b></div>
      <div class="wsp2787-jump-piece"><span>${tr.base}<sup>${v.x}</sup></span><b>+${tr.power}</b></div>
      <div class="wsp2787-flight"><span>➜</span><small>${tr.before} + ${tr.added}</small></div>
      <div class="wsp2787-jump-node is-to"><small>dp[${tr.destination}]</small><b>${this.value(after)}</b></div>
    </div>`;
  }

  result(v) {
    if (v.answer === null) return "";
    const equation = v.witness?.length
      ? v.witness.map((item, index) => `${index ? '<i>+</i>' : ""}<span><b>${item.base}<sup>${v.x}</sup></b><small>${item.value}</small></span>`).join("")
      : `<span class="is-empty">${this.t("Không có tổ hợp", "No combination")}</span>`;
    return `<section class="wsp2787-result ${v.answer > 0 ? "has-answer" : "no-answer"}">
      <div class="wsp2787-equation">${equation}<i>=</i><strong>${v.n}</strong></div>
      <div class="wsp2787-answer"><small>${this.t("SỐ CÁCH", "WAYS")}</small><b>${this.value(v.answer)}</b></div>
    </section>`;
  }

  render(step) {
    const v = step.waysToExpressPowers2787View;
    if (!v) return;
    const activePower = v.currentPower ? `${v.currentPower.base}^${v.x}` : `${v.base}^${v.x}`;
    this.host.innerHTML = `<section class="wsp2787-viz" role="region" aria-label="2787 Ways to Express an Integer as Sum of Powers">
      <header class="wsp2787-heading">
        <span>2787 · 0/1 DP</span><strong>${this.eventLabel(v.event)}</strong>
        <div class="wsp2787-target"><small>n</small><b>${v.n}</b><i>x=${v.x}</i></div>
      </header>
      <section class="wsp2787-shelf" aria-label="${this.t("Các lũy thừa", "Power pieces")}">
        <div class="wsp2787-shelf-icon" aria-hidden="true">▰</div>
        <div class="wsp2787-powers">${this.shelf(v)}</div>
      </section>
      <main class="wsp2787-stage">
        <div class="wsp2787-route">
          <div class="wsp2787-route-top"><span>dp[t]</span><b>${activePower}</b></div>
          <div class="wsp2787-map">${this.map(v)}</div>
          ${v.cropped ? `<small class="wsp2787-crop">⋯ ${this.t("gần bước đang chạy", "near the current move")} ⋯</small>` : ""}
        </div>
        ${this.jump(v)}
      </main>
      ${this.result(v)}
      ${v.truncated ? `<small class="wsp2787-truncated">${this.t("Trace rút gọn · đáp án vẫn chính xác", "Short trace · exact answer")}</small>` : ""}
    </section>`;
  }
}

function renderWaysToExpressPowers2787View(step) {
  new WaysToExpressPowers2787Visualizer({
    host: $("treeView"),
    language: lang,
    escape: escapeHtml,
  }).render(step);
}
