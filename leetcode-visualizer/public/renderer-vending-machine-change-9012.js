"use strict";

const VM9012_COPY = Object.freeze({
  en: Object.freeze({
    kicker: "DESIGN 9012 · MIN-COIN DP",
    title: "Vending machine change",
    setup: "Set up",
    initialize: "Initialize DP",
    fill: "Fill DP",
    reconstruct: "Reconstruct",
    done: "Done",
    price: "Price",
    paid: "Paid",
    change: "Change due",
    denominations: "Accepted denominations",
    activeCoin: "coin under test",
    noActiveCoin: "No coin selected",
    action: "Current instruction",
    dpTable: "Minimum coins by amount",
    dpHelp: "dp[x] is the fewest coins needed for amount x; pick[x] stores its final coin.",
    amount: "amount",
    minCoins: "min coins",
    lastCoin: "last coin",
    unreachable: "unreachable",
    source: "source",
    current: "current",
    target: "target",
    formula: "Transition",
    waiting: "The transition appears when an amount and coin are being evaluated.",
    improve: "IMPROVE",
    keep: "KEEP",
    tooLarge: "TOO LARGE",
    candidate: "candidate",
    incumbent: "current dp",
    witness: "Change tray",
    witnessHelp: "pick[] is followed backward from change to zero.",
    remaining: "remaining",
    selected: "selected coins",
    empty: "No coin has been placed in the tray yet.",
    exact: "EXACT CHANGE",
    impossible: "EXACT CHANGE IMPOSSIBLE",
    pending: "CALCULATING",
    coins: "coins",
    total: "total",
    omitted: "amounts hidden",
  }),
  vi: Object.freeze({
    kicker: "THIẾT KẾ 9012 · DP ÍT COIN NHẤT",
    title: "Máy bán hàng trả tiền thừa",
    setup: "Thiết lập",
    initialize: "Khởi tạo DP",
    fill: "Điền DP",
    reconstruct: "Dựng đáp án",
    done: "Hoàn tất",
    price: "Giá",
    paid: "Đã trả",
    change: "Tiền thừa",
    denominations: "Mệnh giá chấp nhận",
    activeCoin: "coin đang xét",
    noActiveCoin: "Chưa chọn coin",
    action: "Lệnh hiện tại",
    dpTable: "Số coin tối thiểu theo amount",
    dpHelp: "dp[x] là số coin ít nhất để tạo amount x; pick[x] lưu coin cuối.",
    amount: "amount",
    minCoins: "ít coin nhất",
    lastCoin: "coin cuối",
    unreachable: "chưa tới được",
    source: "nguồn",
    current: "đang xét",
    target: "đích",
    formula: "Chuyển trạng thái",
    waiting: "Công thức xuất hiện khi đang đánh giá một amount và coin.",
    improve: "CẬP NHẬT",
    keep: "GIỮ NGUYÊN",
    tooLarge: "COIN QUÁ LỚN",
    candidate: "ứng viên",
    incumbent: "dp hiện tại",
    witness: "Khay tiền thừa",
    witnessHelp: "Đi ngược pick[] từ change về 0.",
    remaining: "còn lại",
    selected: "coin đã chọn",
    empty: "Chưa có coin nào được đưa vào khay.",
    exact: "TRẢ ĐÚNG TIỀN",
    impossible: "KHÔNG THỂ TRẢ ĐÚNG",
    pending: "ĐANG TÍNH",
    coins: "coin",
    total: "tổng",
    omitted: "amount bị ẩn",
  }),
});

function vm9012Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function vm9012Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function vm9012Localized(value, locale) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return String(value[locale] ?? value.en ?? value.vi ?? "");
  }
  return String(value ?? "");
}

function vm9012Integer(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

function vm9012Normalize(step) {
  const raw = step && step.vending9012View && typeof step.vending9012View === "object"
    ? step.vending9012View
    : {};
  const price = vm9012Integer(raw.price, 0, Number.MAX_SAFE_INTEGER) ?? 0;
  const paid = vm9012Integer(raw.paid, 0, Number.MAX_SAFE_INTEGER) ?? 0;
  const change = vm9012Integer(raw.change, 0, 100000) ?? Math.max(0, paid - price);
  const coins = [...new Set((Array.isArray(raw.coins) ? raw.coins : [])
    .map((coin) => vm9012Integer(coin, 1, Number.MAX_SAFE_INTEGER))
    .filter((coin) => coin !== null))].sort((left, right) => left - right);
  const dpRaw = Array.isArray(raw.dp) ? raw.dp.slice(0, change + 1) : [];
  const pickRaw = Array.isArray(raw.pick) ? raw.pick.slice(0, change + 1) : [];
  const dp = Array.from({ length: Math.min(change + 1, dpRaw.length) }, (_unused, index) => {
    const value = dpRaw[index];
    return Number.isSafeInteger(value) && value >= -1 && value <= change + 1 ? value : -1;
  });
  const picks = Array.from({ length: Math.min(change + 1, pickRaw.length) }, (_unused, index) => {
    const value = pickRaw[index];
    return Number.isSafeInteger(value) && value >= -1 ? value : -1;
  });
  const amount = vm9012Integer(raw.amount, 0, change);
  const previousAmount = vm9012Integer(raw.previousAmount, 0, change);
  const coin = vm9012Integer(raw.coin, 1, Number.MAX_SAFE_INTEGER);
  const candidate = vm9012Integer(raw.candidate, 0, change + 2);
  const answer = Array.isArray(raw.answer)
    ? raw.answer.map((item) => vm9012Integer(item, 1, Number.MAX_SAFE_INTEGER)).filter((item) => item !== null)
    : null;
  const line = vm9012Integer(step && Array.isArray(step.codeLines) ? step.codeLines[0] : null, 1, 32) ?? 1;
  let phase = "setup";
  if (line >= 12 && line <= 15) phase = "initialize";
  if (line >= 16 && line <= 25) phase = "fill";
  if (line >= 26 && line <= 32) phase = "reconstruct";
  if (step && step.final) phase = "done";
  return {
    line,
    operation: typeof raw.operation === "string" ? raw.operation.slice(0, 160) : "",
    price,
    paid,
    change,
    coins,
    dp,
    picks,
    amount,
    previousAmount,
    coin,
    candidate,
    improved: typeof raw.improved === "boolean" ? raw.improved : null,
    reachable: typeof raw.reachable === "boolean" ? raw.reachable : null,
    answer,
    phase,
    final: Boolean(step && step.final),
    title: vm9012Localized(step && step.title, vm9012Locale()).slice(0, 300),
    note: vm9012Localized(step && step.note, vm9012Locale()).slice(0, 700),
  };
}

function vm9012VisibleAmounts(state) {
  const size = state.dp.length;
  if (size <= 46) return Array.from({ length: size }, (_unused, index) => ({ index }));
  const visible = new Set();
  const addRange = (start, end) => {
    for (let index = Math.max(0, start); index <= Math.min(size - 1, end); index++) visible.add(index);
  };
  addRange(0, 4);
  addRange(size - 5, size - 1);
  if (state.amount !== null) addRange(state.amount - 3, state.amount + 3);
  if (state.previousAmount !== null) addRange(state.previousAmount - 2, state.previousAmount + 2);
  const ordered = [...visible].sort((left, right) => left - right);
  const result = [];
  ordered.forEach((index, position) => {
    if (position > 0 && index > ordered[position - 1] + 1) {
      result.push({ gap: index - ordered[position - 1] - 1 });
    }
    result.push({ index });
  });
  return result;
}

function vm9012PhaseLabel(state, copy) {
  return copy[state.phase] || copy.setup;
}

function vm9012Payment(state, copy) {
  const paidWidth = state.paid > 0 ? Math.min(100, Math.round((state.price / state.paid) * 100)) : 0;
  return `<section class="vm9012-payment" aria-label="${vm9012Escape(copy.change)}">
    <div><small>${vm9012Escape(copy.price)}</small><strong>$${state.price}</strong></div>
    <div class="vm9012-payment-track" aria-hidden="true"><span style="width:${paidWidth}%"></span><i></i></div>
    <div><small>${vm9012Escape(copy.paid)}</small><strong>$${state.paid}</strong></div>
    <div class="vm9012-change"><small>${vm9012Escape(copy.change)}</small><strong>$${state.change}</strong></div>
  </section>`;
}

function vm9012CoinRack(state, copy) {
  const shown = state.coins.slice(0, 24);
  const coins = shown.map((coin) => `<span class="vm9012-coin${coin === state.coin ? " is-active" : ""}" aria-label="${vm9012Escape(copy.coins)} ${coin}"><b>${coin}</b></span>`).join("");
  const omitted = state.coins.length - shown.length;
  return `<section class="vm9012-coins"><header><div><strong>${vm9012Escape(copy.denominations)}</strong><span>${vm9012Escape(state.coin === null ? copy.noActiveCoin : `${copy.activeCoin}: ${state.coin}`)}</span></div></header><div class="vm9012-coin-rack">${coins || `<em>—</em>`}${omitted > 0 ? `<span class="vm9012-more">+${omitted}</span>` : ""}</div></section>`;
}

function vm9012Formula(state, copy) {
  if (state.coin !== null && state.amount !== null && state.coin > state.amount) {
    return `<div class="vm9012-formula is-too-large"><code>${state.coin} &gt; ${state.amount}</code><strong>${vm9012Escape(copy.tooLarge)}</strong></div>`;
  }
  if (state.candidate !== null && state.amount !== null && state.previousAmount !== null) {
    const incumbent = state.dp[state.amount] ?? -1;
    const verdict = state.improved === true ? copy.improve : copy.keep;
    return `<div class="vm9012-formula ${state.improved === true ? "is-improve" : "is-keep"}">
      <div><small>dp[${state.previousAmount}] + 1</small><code>${state.dp[state.previousAmount] < 0 ? "∞" : state.dp[state.previousAmount]} + 1 = ${state.candidate > state.change ? "∞" : state.candidate}</code></div>
      <span>&lt;</span>
      <div><small>${vm9012Escape(copy.incumbent)}</small><code>dp[${state.amount}] = ${incumbent < 0 ? "∞" : incumbent}</code></div>
      <strong>${vm9012Escape(verdict)}</strong>
    </div>`;
  }
  if (state.phase === "reconstruct" && state.amount !== null) {
    return `<div class="vm9012-formula is-reconstruct"><code>${vm9012Escape(copy.remaining)} = ${state.amount}${state.coin === null ? "" : ` − ${state.coin}`}</code><strong>${vm9012Escape(copy.reconstruct)}</strong></div>`;
  }
  return `<div class="vm9012-formula is-waiting"><span>${vm9012Escape(copy.waiting)}</span></div>`;
}

function vm9012Table(state, copy) {
  if (!state.dp.length) return `<div class="vm9012-table-empty">${vm9012Escape(copy.waiting)}</div>`;
  const cells = vm9012VisibleAmounts(state).map((item) => {
    if (item.gap) return `<div class="vm9012-gap"><b>…</b><small>${item.gap} ${vm9012Escape(copy.omitted)}</small></div>`;
    const index = item.index;
    const value = state.dp[index];
    const picked = state.picks[index] ?? -1;
    const classes = ["vm9012-cell"];
    if (value >= 0) classes.push("is-reachable");
    if (index === state.change) classes.push("is-target");
    if (index === state.amount) classes.push("is-current");
    if (index === state.previousAmount) classes.push("is-source");
    return `<div class="${classes.join(" ")}" data-amount="${index}">
      <small>$${index}</small>
      <strong>${value < 0 ? "∞" : value}</strong>
      <span>${picked > 0 ? `← ${picked}` : "—"}</span>
    </div>`;
  }).join("");
  return `<div class="vm9012-table-scroll" tabindex="0"><div class="vm9012-table">${cells}</div></div>
    <div class="vm9012-legend"><span class="source">${vm9012Escape(copy.source)}</span><span class="current">${vm9012Escape(copy.current)}</span><span class="target">${vm9012Escape(copy.target)}</span><span>∞ = ${vm9012Escape(copy.unreachable)}</span></div>`;
}

function vm9012Tray(state, copy) {
  const selected = state.answer || [];
  const total = selected.reduce((sum, coin) => sum + coin, 0);
  const coins = selected.map((coin, index) => `<span class="vm9012-tray-coin"><small>#${index + 1}</small><b>${coin}</b></span>`).join("");
  let verdict = copy.pending;
  let verdictClass = "is-pending";
  if (state.reachable === false) {
    verdict = copy.impossible;
    verdictClass = "is-impossible";
  } else if (state.final && state.answer !== null) {
    verdict = copy.exact;
    verdictClass = "is-exact";
  }
  const remaining = state.phase === "reconstruct" && state.amount !== null
    ? state.amount
    : Math.max(0, state.change - total);
  return `<section class="vm9012-tray ${verdictClass}">
    <header><div><strong>${vm9012Escape(copy.witness)}</strong><span>${vm9012Escape(copy.witnessHelp)}</span></div><b>${vm9012Escape(verdict)}</b></header>
    <div class="vm9012-tray-summary"><span><small>${vm9012Escape(copy.selected)}</small><b>${selected.length}</b></span><span><small>${vm9012Escape(copy.total)}</small><b>$${total}</b></span><span><small>${vm9012Escape(copy.remaining)}</small><b>$${remaining}</b></span></div>
    <div class="vm9012-tray-coins">${coins || `<em>${vm9012Escape(copy.empty)}</em>`}</div>
  </section>`;
}

function renderVendingMachine9012View(step) {
  const locale = vm9012Locale();
  const copy = VM9012_COPY[locale];
  const state = vm9012Normalize(step);
  const root = $("treeView");
  root.innerHTML = `<section class="vm9012-viz" aria-label="${vm9012Escape(copy.title)}">
    <header class="vm9012-heading">
      <div><small>${vm9012Escape(copy.kicker)}</small><h3>${vm9012Escape(copy.title)}</h3></div>
      <span class="vm9012-phase is-${state.phase}">${vm9012Escape(vm9012PhaseLabel(state, copy))}</span>
    </header>
    ${vm9012Payment(state, copy)}
    ${vm9012CoinRack(state, copy)}
    <section class="vm9012-action"><header><small>${vm9012Escape(copy.action)} · ${locale === "vi" ? "DÒNG" : "LINE"} ${state.line}</small><code>${vm9012Escape(state.operation)}</code></header><strong>${vm9012Escape(state.title)}</strong><p>${vm9012Escape(state.note)}</p></section>
    <section class="vm9012-transition"><header><strong>${vm9012Escape(copy.formula)}</strong></header>${vm9012Formula(state, copy)}</section>
    <section class="vm9012-dp"><header><div><strong>${vm9012Escape(copy.dpTable)}</strong><span>${vm9012Escape(copy.dpHelp)}</span></div></header>${vm9012Table(state, copy)}</section>
    ${vm9012Tray(state, copy)}
  </section>`;

  if (typeof root.querySelector === "function") {
    const scroll = root.querySelector(".vm9012-table-scroll");
    const active = scroll && scroll.querySelector(".is-current");
    if (active) scroll.scrollLeft = Math.max(0, active.offsetLeft - scroll.clientWidth / 2 + active.offsetWidth / 2);
  }
}
