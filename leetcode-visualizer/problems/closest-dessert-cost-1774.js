"use strict";

const bi = (vi, en) => ({ vi, en });

const SOURCE = [
  "class Solution:",
  "    def closestCost(self, baseCosts, toppingCosts, target):",
  "        best = float(\"inf\")",
  "",
  "        def update(cost):",
  "            nonlocal best",
  "",
  "            if (abs(cost - target), cost) < (abs(best - target), best):",
  "                best = cost",
  "",
  "        def dfs(i, cost):",
  "            update(cost)",
  "",
  "            if i == len(toppingCosts):",
  "                return",
  "",
  "            # Pruning: adding toppings only increases cost",
  "            if cost >= target:",
  "                return",
  "",
  "            for count in range(3):",
  "                dfs(i + 1, cost + count * toppingCosts[i])",
  "",
  "        for base in baseCosts:",
  "            dfs(0, base)",
  "",
  "        return best",
];

const MAX_TRACE_STEPS = 4500;

function parseInput(input, params = {}) {
  let baseCosts;
  let toppingCosts;
  if (typeof input === "string") {
    const text = input.trim();
    if (text.startsWith("[")) {
      try {
        [baseCosts, toppingCosts] = JSON.parse(text);
      } catch {
        throw new Error("1774: Invalid JSON input / JSON đầu vào không hợp lệ.");
      }
    } else {
      const lists = text.split(/[;|]/);
      if (lists.length !== 2) {
        throw new Error("1774: Enter baseCosts;toppingCosts / Nhập baseCosts;toppingCosts.");
      }
      [baseCosts, toppingCosts] = lists.map((list) => list.split(",").map((value) => Number(value.trim())));
    }
  } else if (Array.isArray(input) && input.length === 2) {
    [baseCosts, toppingCosts] = input;
  } else if (input && typeof input === "object") {
    ({ baseCosts, toppingCosts } = input);
  }

  const target = Number(params.target ?? 10);
  const validCosts = (values, maxLength, maxValue) => Array.isArray(values)
    && values.length >= 1
    && values.length <= maxLength
    && values.every((value) => Number.isInteger(value) && value >= 1 && value <= maxValue);
  if (!validCosts(baseCosts, 10, 10000)
    || !validCosts(toppingCosts, 10, 1000)
    || !Number.isInteger(target)
    || target < 1
    || target > 10000) {
    throw new Error("1774: Use 1–10 positive base/topping costs and target 1–10000 / Cần 1–10 giá dương và target 1–10000.");
  }
  return {
    baseCosts: [...baseCosts],
    toppingCosts: [...toppingCosts],
    target,
  };
}

function buildSteps(input, params = {}) {
  const parsed = parseInput(input, params);
  const { baseCosts, toppingCosts, target } = parsed;
  const steps = [];
  const frames = [];
  let best = Infinity;
  let visited = 0;
  let omitted = 0;
  const maxCost = Math.max(target, ...baseCosts.map((base) => base + 2 * toppingCosts.reduce((sum, topping) => sum + topping, 0)));

  function emit(line, phase, title, note, extra = {}) {
    if (steps.length >= MAX_TRACE_STEPS && phase !== "done") {
      omitted++;
      return;
    }
    const current = frames.at(-1) || null;
    const topping = current && current.i < toppingCosts.length ? toppingCosts[current.i] : null;
    const cost = extra.cost ?? current?.cost ?? null;
    const boundedBest = Number.isFinite(best) ? best : null;
    steps.push({
      arr: [],
      codeLines: [line],
      title: bi(title.vi, title.en),
      note: bi(note.vi, note.en),
      final: phase === "done",
      vars: [
        { name: "target", value: target },
        { name: "cost", value: cost ?? "—" },
        { name: "best", value: boundedBest ?? "∞" },
        { name: "i", value: current?.i ?? "—" },
      ],
      dessert1774View: {
        phase,
        line,
        baseCosts: [...baseCosts],
        toppingCosts: [...toppingCosts],
        target,
        maxCost,
        base: current?.base ?? extra.base ?? null,
        cost,
        best: boundedBest,
        bestBefore: extra.bestBefore ?? null,
        improved: extra.improved ?? null,
        i: current?.i ?? null,
        path: current ? [...current.path] : [],
        stack: frames.map((frame) => ({
          i: frame.i,
          cost: frame.cost,
          base: frame.base,
          path: [...frame.path],
        })),
        topping,
        choice: extra.choice ?? null,
        candidateCost: extra.candidateCost ?? null,
        visited,
        omitted,
        answer: phase === "done" ? best : null,
      },
    });
  }

  emit(3, "initialize", { vi: "best bắt đầu vô cực", en: "Initialize best to infinity" }, {
    vi: "Chưa thử món tráng miệng nào.",
    en: "No dessert combination has been tried yet.",
  });

  function dfs(i, cost, base, path) {
    visited++;
    const frame = { i, cost, base, path };
    frames.push(frame);

    emit(12, "update-call", { vi: `Đánh giá tổng ${cost}`, en: `Evaluate total ${cost}` }, {
      vi: "Mọi tổng trung gian đều là một ứng viên.",
      en: "Every partial total is a candidate.",
    });
    emit(6, "update-nonlocal", { vi: "update dùng chung best", en: "update shares best" }, {
      vi: "nonlocal cho phép hàm lồng nhau cập nhật biến bên ngoài.",
      en: "nonlocal lets the nested function update the outer variable.",
    });
    const bestBefore = best;
    const improves = !Number.isFinite(best)
      || (Math.abs(cost - target) < Math.abs(best - target))
      || (Math.abs(cost - target) === Math.abs(best - target) && cost < best);
    emit(8, "compare", { vi: "So sánh khoảng cách tới target", en: "Compare distance to target" }, {
      vi: "Nếu hòa khoảng cách, chọn tổng nhỏ hơn.",
      en: "If distances tie, choose the lower total.",
    }, { cost, bestBefore: Number.isFinite(bestBefore) ? bestBefore : null, improved: improves });
    if (improves) {
      best = cost;
      emit(9, "best-update", { vi: `best ← ${cost}`, en: `best ← ${cost}` }, {
        vi: "Ứng viên này gần target hơn, hoặc hòa nhưng nhỏ hơn.",
        en: "This candidate is closer to target, or tied and lower.",
      }, { cost, bestBefore: Number.isFinite(bestBefore) ? bestBefore : null, improved: true });
    }

    const reachedEnd = i === toppingCosts.length;
    emit(14, "end-check", { vi: `Còn topping nào không? i = ${i}`, en: `Any toppings left? i = ${i}` }, {
      vi: reachedEnd ? "Đã chọn xong tất cả topping." : `Topping kế tiếp có giá ${toppingCosts[i]}.`,
      en: reachedEnd ? "Every topping has been considered." : `The next topping costs ${toppingCosts[i]}.`,
    }, { cost });
    if (reachedEnd) {
      emit(15, "return-end", { vi: "Lá của cây DFS", en: "DFS leaf" }, {
        vi: "Không còn lựa chọn nào; quay lui về nhánh cha.",
        en: "No choices remain; return to the parent branch.",
      }, { cost });
      frames.pop();
      return;
    }

    const pruned = cost >= target;
    emit(18, pruned ? "prune-check" : "continue-check", {
      vi: pruned ? `Cắt nhánh tại ${cost}` : `Có thể thêm topping từ ${cost}`,
      en: pruned ? `Prune at ${cost}` : `Toppings can extend ${cost}`,
    }, {
      vi: pruned ? "Thêm topping chỉ làm giá tăng; ứng viên hiện tại đã được xét." : "Thử đúng 0, 1 hoặc 2 phần topping kế tiếp.",
      en: pruned ? "Toppings only increase cost; the current candidate was already checked." : "Try exactly 0, 1, or 2 portions of the next topping.",
    }, { cost });
    if (pruned) {
      emit(19, "pruned", { vi: "Quay lui, không mở nhánh con", en: "Return without exploring children" }, {
        vi: "Nhánh này không thể tạo kết quả tốt hơn.",
        en: "This branch cannot produce a better result.",
      }, { cost });
      frames.pop();
      return;
    }

    for (let count = 0; count < 3; count++) {
      emit(21, "choice-loop", {
        vi: `Thử ${count} phần topping`,
        en: `Try ${count} topping portions`,
      }, {
        vi: `Mỗi topping được dùng tối đa hai lần.`,
        en: `Each topping can be used at most twice.`,
      }, { cost, choice: count, candidateCost: cost + count * toppingCosts[i] });
      const nextCost = cost + count * toppingCosts[i];
      emit(22, "recursive-call", {
        vi: `${cost} + ${count} × ${toppingCosts[i]} = ${nextCost}`,
        en: `${cost} + ${count} × ${toppingCosts[i]} = ${nextCost}`,
      }, {
        vi: "Chuyển sang topping kế tiếp với tổng mới.",
        en: "Move to the next topping with the updated total.",
      }, { cost, choice: count, candidateCost: nextCost });
      dfs(i + 1, nextCost, base, [...path, count]);
    }
    frames.pop();
  }

  for (const base of baseCosts) {
    emit(24, "base-loop", { vi: `Chọn base ${base}`, en: `Choose base ${base}` }, {
      vi: "Mỗi món nền mở đầu một cây lựa chọn riêng.",
      en: "Each base dessert starts a separate choice tree.",
    }, { base, cost: base });
    emit(25, "root-call", { vi: `Bắt đầu DFS(${base})`, en: `Start DFS(${base})` }, {
      vi: "Bắt đầu với 0 topping đã xét.",
      en: "Start before considering any toppings.",
    }, { base, cost: base });
    dfs(0, base, base, []);
  }

  emit(27, "done", { vi: `Kết quả gần nhất: ${best}`, en: `Closest cost: ${best}` }, {
    vi: "Duyệt các base, thử 0/1/2 topping; hòa thì lấy tổng thấp hơn.",
    en: "Try 0/1/2 of each topping for every base; ties go to the lower total.",
  });
  return {
    original: parsed,
    answer: best,
    steps,
    visited,
    omitted,
  };
}

module.exports = {
  1774: {
    id: 1774,
    slug: "closest-dessert-cost",
    difficulty: "medium",
    category: { key: "backtracking", vi: "Quay lui", en: "Backtracking" },
    tags: [
      { key: "dfs", vi: "DFS", en: "DFS" },
      { key: "pruning", vi: "Cắt tỉa", en: "Pruning" },
    ],
    title: bi("Closest Dessert Cost", "Closest Dessert Cost"),
    titleVi: bi("Giá món tráng miệng gần target nhất", "Closest dessert cost to target"),
    statement: bi(
      "Chọn đúng một món nền và mỗi topping 0, 1 hoặc 2 lần. Tìm tổng giá gần target nhất; nếu hòa, trả tổng thấp hơn. Ví dụ base=[1,7], topping=[3,4], target=10 → 10.",
      "Choose one base and use each topping 0, 1, or 2 times. Return the cost closest to target; if tied, return the lower cost. Example base=[1,7], topping=[3,4], target=10 → 10.",
    ),
    defaultInput: "1,7;3,4",
    inputKind: "string",
    inputLabel: bi("baseCosts;toppingCosts (ngăn cách bằng ;)", "baseCosts;toppingCosts (separated by ;)"),
    extraParams: [{
      key: "target",
      label: bi("target", "target"),
      default: 10,
      min: 1,
      max: 10000,
    }],
    debugMode: "line-by-line",
    approach: [
      bi("Mỗi base là một gốc DFS độc lập.", "Each base starts an independent DFS."),
      bi("Với topping i, rẽ 3 nhánh: dùng 0, 1 hoặc 2 lần.", "For topping i, branch into 0, 1, or 2 portions."),
      bi("Cập nhật best theo (|cost − target|, cost): khoảng cách nhỏ hơn thắng; hòa thì tổng thấp hơn thắng.", "Update best by (|cost − target|, cost): smaller distance wins; ties go to the lower cost."),
      bi("Nếu cost ≥ target, cắt nhánh vì topping chỉ làm tổng tăng.", "If cost ≥ target, prune because toppings only increase the total."),
    ],
    complexity: {
      time: "O(m · 3ⁿ)",
      space: "O(n)",
      note: bi("m = số base, n = số topping. Cắt nhánh thường giảm số trạng thái; recursion sâu tối đa n + 1. Trace rút gọn sau 4,500 bước nhưng vẫn tính đủ đáp án.", "m = number of bases, n = number of toppings. Pruning usually reduces explored states; recursion depth is at most n + 1. The trace is condensed after 4,500 steps, but the answer still uses every branch."),
    },
    code: SOURCE,
    builder: buildSteps,
    liveArgs: (input, params) => {
      const { baseCosts, toppingCosts, target } = parseInput(input, params);
      return [baseCosts, toppingCosts, target];
    },
  },
};
