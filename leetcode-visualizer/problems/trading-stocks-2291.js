"use strict";

const { trace, bi } = require("./picture-trace");

const CODE = [
  "class Solution:",
  "    def maximumProfit(self, present, future, budget):",
  "        dp = [0] * (budget + 1)",
  "        for i in range(len(present)):",
  "            cost = present[i]",
  "            profit = future[i] - cost",
  "            for money in range(budget, cost - 1, -1):",
  "                dp[money] = max(dp[money], dp[money - cost] + profit)",
  "        return dp[budget]",
];

function parseInput(input, params = {}) {
  let present;
  let future;
  let inputBudget;
  if (typeof input === "string") {
    const raw = input.trim();
    if (raw.startsWith("[") || raw.startsWith("{")) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) [present, future] = parsed;
        else ({ present, future, budget: inputBudget } = parsed);
      } catch {
        throw new Error("2291: JSON cần dạng [[present...], [future...]] / Use [[present...], [future...]].");
      }
    } else {
      const parts = raw.split(";");
      if (parts.length !== 2) {
        throw new Error("2291: Nhập present;future, ví dụ 5,4,6;8,5,4 / Enter present;future.");
      }
      [present, future] = parts.map((part) => part.split(",").map((value) => value.trim() === "" ? NaN : Number(value.trim())));
    }
  } else if (Array.isArray(input) && input.length === 2) {
    [present, future] = input;
  } else if (input && typeof input === "object") {
    ({ present, future, budget: inputBudget } = input);
  }

  const rawBudget = params.budget !== undefined && params.budget !== ""
    ? params.budget
    : inputBudget !== undefined ? inputBudget : 10;
  const budget = Number(rawBudget);
  const validPrices = (prices) => Array.isArray(prices)
    && prices.length >= 1
    && prices.length <= 1000
    && prices.every((price) => Number.isInteger(price) && price >= 0 && price <= 100);
  if (!validPrices(present) || !validPrices(future) || present.length !== future.length
    || !Number.isInteger(budget) || budget < 0 || budget > 1000) {
    throw new Error("2291: present/future cần cùng 1–1000 giá nguyên trong [0,100]; budget trong [0,1000]. / Use equally sized price arrays (1–1000 values in [0,100]) and budget [0,1000].");
  }
  return { present: [...present], future: [...future], budget };
}

function buildSteps(input, params = {}) {
  const { present, future, budget } = parseInput(input, params);
  const n = present.length;
  const detailed = n <= 16 && budget <= 30;
  const run = trace(2291, CODE, detailed);
  const dp = Array(budget + 1).fill(0);
  const locals = { self: {}, present, future, budget, dp };
  let trade = null;

  const picture = () => ({
    n,
    budget,
    present,
    future,
    dp: [...dp],
    stockIndex: Number.isInteger(locals.i) ? locals.i : null,
    cost: Number.isInteger(locals.cost) ? locals.cost : null,
    profit: Number.isInteger(locals.profit) ? locals.profit : null,
    money: Number.isInteger(locals.money) ? locals.money : null,
    trade,
    answer: dp[budget],
    detailed,
  });
  const emit = (line, event) => run.emit(line, event, locals, picture);

  emit(1, "Solution");
  emit(2, "maximumProfit");
  emit(3, "dp = [0] · mọi mức tiền");
  for (let i = 0; i < n; i++) {
    locals.i = i;
    locals.money = null;
    trade = null;
    emit(4, `cổ phiếu ${i + 1}/${n}`);
    locals.cost = present[i];
    emit(5, `mua $${locals.cost}`);
    locals.profit = future[i] - locals.cost;
    emit(6, `lời $${locals.profit}`);

    let tried = false;
    for (let money = budget; money >= locals.cost; money--) {
      tried = true;
      locals.money = money;
      trade = null;
      emit(7, `ngân sách ↓ $${money}`);
      const skip = dp[money];
      const sourceBudget = money - locals.cost;
      const sourceProfit = dp[sourceBudget];
      const buy = sourceProfit + locals.profit;
      const result = Math.max(skip, buy);
      trade = { skip, sourceBudget, sourceProfit, buy, result, picked: buy > skip, changed: result !== skip };
      dp[money] = result;
      emit(8, `bỏ qua ${skip} · mua ${sourceProfit}+${locals.profit}=${buy} → ${result}`);
    }
    if (!tried) {
      locals.money = null;
      trade = { affordable: false };
      emit(7, "giá mua vượt ngân sách");
    }
    trade = null;
  }

  locals.money = null;
  emit(9, "return dp[budget]");
  const answer = dp[budget];
  const result = run.finish(answer, picture, { present, future, budget });
  for (const step of result.steps) {
    step.tradingStocks2291View = step.pictureView;
    delete step.pictureView;
  }
  return result;
}

module.exports = {
  2291: {
    id: 2291,
    slug: "maximum-profit-from-trading-stocks",
    difficulty: "medium",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "knapsack", vi: "Balo 0/1", en: "0/1 Knapsack" },
    ],
    title: bi("Maximum Profit From Trading Stocks", "Maximum Profit From Trading Stocks"),
    titleVi: bi("Lợi nhuận tối đa từ cổ phiếu", "Maximum profit from trading stocks"),
    statement: bi(
      "Mỗi cổ phiếu chỉ mua tối đa một lần. Chọn các cổ phiếu sao cho tổng giá mua không quá budget và lợi nhuận (giá tương lai − giá mua) lớn nhất.",
      "Buy each stock at most once. Keep the total purchase cost within budget and maximize total profit (future price − purchase price).",
    ),
    defaultInput: "5,4,6,2,3;8,5,4,3,5",
    inputKind: "string",
    inputLabel: bi("present ; future", "present ; future"),
    extraParams: [{ key: "budget", label: bi("Ngân sách", "Budget"), default: 10, min: 0, max: 1000 }],
    debugMode: "line-by-line",
    code: CODE,
    builder: buildSteps,
    liveArgs: (input, params) => {
      const { present, future, budget } = parseInput(input, params);
      return [present, future, budget];
    },
    approach: [
      bi("Một cổ phiếu = một món: giá mua là cost, lãi là future − present.", "One stock is one item: its cost is present and its value is future − present."),
      bi("dp[money] giữ lãi lớn nhất với ngân sách tối đa money.", "dp[money] keeps the best profit with at most money to spend."),
      bi("Duyệt tiền từ lớn xuống nhỏ để một cổ phiếu không bị dùng hai lần.", "Scan money downward so the same stock cannot be used twice."),
    ],
    complexity: {
      time: "O(n × budget)",
      space: "O(budget)",
      note: bi("Trace từng dòng với tối đa 16 cổ phiếu và budget 30; dữ liệu lớn vẫn tính đủ, phần trace được rút gọn.", "Line-by-line trace for up to 16 stocks and budget 30; larger inputs are fully computed with a condensed trace."),
    },
    examples: [
      { input: "5,4,6,2,3;8,5,4,3,5", budget: 10, answer: 6 },
      { input: "2,2,5;3,4,10", budget: 6, answer: 5 },
      { input: "3,3,12;0,3,15", budget: 10, answer: 0 },
    ],
    parseInput,
  },
};
