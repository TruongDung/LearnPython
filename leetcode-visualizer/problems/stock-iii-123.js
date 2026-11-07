"use strict";

const base = require("./greedy")[123];
const { runTrace } = require("./wasm-picture-trace");
const bi = (vi, en) => ({ vi, en });
const CODE = [...base.code], FIELDS = ["buy1", "sell1", "buy2", "sell2"];
const copyPath = path => path?.map(action => ({ ...action })) ?? null;
function parse(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 100
    || !Array.from(input).every(price => Number.isInteger(price) && price >= 0 && price <= 100000)) {
    throw new RangeError("#123: prices gồm 1–100 số nguyên 0–100000 / prices must contain 1–100 integers from 0 to 100000.");
  }
  return [...input];
}

function builder(input) {
  const prices = parse(input), trace = runTrace({ code: CODE.join("\n"), method: "maxProfit", args: [prices] });
  const paths = { buy1: null, sell1: null, buy2: null, sell2: null }, ledger = [];
  let previous = {}, day = 0;
  const steps = trace.events.map(record => {
    const { line, locals: x } = record;
    if (line === 3) {
      paths.buy1 = [{ kind: "buy", day: 0, price: prices[0] }]; paths.buy2 = copyPath(paths.buy1);
      ledger.push({ day: 0, price: prices[0], values: { buy1: x.buy1, sell1: null, buy2: x.buy2, sell2: null }, done: false });
    }
    if (line === 4) {
      paths.sell1 = []; paths.sell2 = [];
      Object.assign(ledger[0].values, { sell1: x.sell1, sell2: x.sell2 }); ledger[0].done = true;
    }
    if (line === 5 && record.branch) {
      day = x.i; ledger.push({ day, price: prices[day], values: Object.fromEntries(FIELDS.map(name => [name, null])), done: false });
    }
    let operation = null;
    if (line >= 6 && line <= 9) {
      const index = line - 6, target = FIELDS[index], source = index ? FIELDS[index - 1] : null;
      const price = prices[x.i], sourceValue = source ? x[source] : 0, before = previous[target];
      const kind = index % 2 ? "sell" : "buy", candidate = kind === "buy" ? sourceValue - price : sourceValue + price;
      const improved = candidate > before;
      // These paths illustrate one optimal history consistent with the real
      // scalar updates. They are never inserted into the Python locals. Keep
      // the older history on ties; a skipped transaction stays skipped.
      if (improved) paths[target] = [...copyPath(source ? paths[source] : []), { kind, day: x.i, price }];
      operation = { target, source, sourceValue, kind, price, before, candidate, after: x[target], improved, tie: candidate === before };
      ledger[day].values[target] = x[target]; if (line === 9) ledger[day].done = true;
    }
    const active = line === 3 ? ["buy1", "buy2"] : line === 4 ? ["sell1", "sell2"] : operation ? [operation.target] : [];
    const focus = operation?.target ?? (x.sell2 === undefined ? "buy1" : "sell2");
    const focusPath = copyPath(paths[focus]) ?? [], transactions = [];
    for (let i = 0; i + 1 < focusPath.length; i += 2) {
      const buy = focusPath[i], sell = focusPath[i + 1];
      transactions.push({ buy: buy.day, sell: sell.day, buyPrice: buy.price, sellPrice: sell.price, profit: sell.price - buy.price });
    }
    const phase = line === 3 ? bi("Khởi tạo trạng thái mua", "Initialize the buy states")
      : line === 4 ? bi("Khởi tạo trạng thái bán", "Initialize the sell states")
        : line === 5 ? record.branch ? bi(`Ngày ${day} · giá ${prices[day]}`, `Day ${day} · price ${prices[day]}`) : bi("Đã duyệt hết giá", "All prices processed")
          : line === 10 ? bi("Trả lợi nhuận tối đa", "Return the maximum profit")
            : bi(`${operation.target} ${operation.improved ? "→" : "giữ"} ${operation.after}`, `${operation.target} ${operation.improved ? "→" : "keeps"} ${operation.after}`);
    const view = {
      prices, day, price: prices[day], cursorBound: x.i !== undefined,
      values: Object.fromEntries(FIELDS.map(name => [name, x[name] ?? null])), active, focus, operation,
      paths: Object.fromEntries(FIELDS.map(name => [name, copyPath(paths[name])])), focusPath, transactions,
      ledger: ledger.map(row => ({ ...row, values: { ...row.values } })),
      answer: record.returning ? trace.answer : null,
      source: { line, text: CODE[line - 1].trim(), timing: "after" }, phase,
      locals: x, outer: record.outer, frames: record.frames, scope: record.scope,
      branch: record.branch, returning: record.returning, returned: record.returned, trace: trace.trace,
    };
    previous = x;
    return { arr: [], highlight: [], mark: [], codeBlock: 1, codeLines: [line], final: record.returning,
      title: bi(`L${line} · ${phase.vi}`, `L${line} · ${phase.en}`), note: bi("", ""),
      vars: ["i", ...FIELDS].map(name => ({ name, value: x[name] ?? "—", rawValue: x[name] ?? null })), stock123View: view };
  });
  return { original: prices, answer: trace.answer, steps };
}

module.exports = { 123: {
  ...base, builder, code: CODE, debugMode: "line-by-line", inputKind: "nonneg", maxInput: 100000,
  titleVi: bi("Mua bán cổ phiếu · tối đa hai giao dịch", "Stock trading · at most two transactions"),
  statement: bi("Chọn tối đa hai lần mua rồi bán để có tổng lợi nhuận lớn nhất. Mỗi lúc chỉ giữ tối đa một cổ phiếu; có thể bỏ qua giao dịch.",
    "Complete at most two buy-then-sell transactions for maximum total profit. Hold at most one share at a time; transactions are optional."),
  inputLabel: bi("prices · 1–100 ngày · giá 0–100000", "prices · 1–100 days · prices 0–100000"), extraParams: [],
  approach: [bi("Cập nhật lần lượt buy1 → sell1 → buy2 → sell2. Mỗi biến giữ phương án tốt nhất ở trạng thái đó; đáp án là sell2.",
    "Update buy1 → sell1 → buy2 → sell2. Each variable represents the best plan in that state; return sell2.")],
  complexity: { time: "O(n)", space: "O(1)", note: bi("Một lượt duyệt, bốn biến trạng thái. Đường mua/bán chỉ dùng để minh họa.", "One pass and four state variables. Trade histories are illustration data.") },
  codeLabel: bi("Bốn trạng thái · từng dòng Python", "Four states · Python line by line"),
  visualizationLimits: { maxDays: 100, completeTrace: true }, liveArgs: input => [parse(input)],
} };
