// LeetCode 2218: group knapsack over pile-prefix choices.

const label = (vi, en) => ({ vi, en });
const MAX_PILES = 15;
const MAX_TOTAL_COINS = 120;
const MAX_K = 40;
const MAX_TRACE_STEPS = 260;

function parsePiles2218(input) {
  let piles;
  if (Array.isArray(input)) {
    piles = input;
  } else {
    const raw = String(input ?? "").trim();
    try {
      if (raw.startsWith("[")) {
        piles = JSON.parse(raw);
      } else {
        piles = raw.split(";").map((pile) => {
          const values = pile.split(",").map((value) => value.trim());
          if (!values.length || values.some((value) => value === "")) throw new Error("empty coin");
          return values.map(Number);
        });
      }
    } catch (_error) {
      throw new Error("piles phải là JSON như [[1,100,3],[7,8,9]] hoặc các pile ngăn bởi dấu chấm phẩy");
    }
  }

  const totalCoins = Array.isArray(piles)
    ? piles.reduce((total, pile) => total + (Array.isArray(pile) ? pile.length : 0), 0)
    : 0;
  if (!Array.isArray(piles) || piles.length < 1 || piles.length > MAX_PILES
    || totalCoins > MAX_TOTAL_COINS
    || piles.some((pile) => !Array.isArray(pile) || pile.length < 1
      || pile.some((coin) => !Number.isInteger(coin) || coin < 1 || coin > 100000))) {
    throw new Error(`piles cần 1–${MAX_PILES} pile không rỗng, tối đa ${MAX_TOTAL_COINS} coin; mỗi coin là số nguyên trong [1, 100000]`);
  }
  return piles.map((pile) => [...pile]);
}

function buildSteps2218(input, params = {}) {
  const piles = parsePiles2218(input);
  const k = Number(params.k);
  const totalCoins = piles.reduce((total, pile) => total + pile.length, 0);
  if (!Number.isInteger(k) || k < 1 || k > MAX_K || k > totalCoins) {
    throw new Error(`k phải là số nguyên trong [1, min(${MAX_K}, tổng số coin=${totalCoins})]`);
  }

  const n = piles.length;
  const prefixes = piles.map((pile) => {
    const prefix = [0];
    for (const coin of pile) prefix.push(prefix[prefix.length - 1] + coin);
    return prefix;
  });
  const dp = Array.from({ length: n + 1 }, () => Array(k + 1).fill(Number.NEGATIVE_INFINITY));
  const choice = Array.from({ length: n + 1 }, () => Array(k + 1).fill(-1));
  dp[0][0] = 0;
  choice[0][0] = 0;

  const steps = [];
  let omitted = false;
  const displayDp = () => dp.map((row) => row.map((value) => Number.isFinite(value) ? value : "·"));
  const pileData = () => piles.map((coins, index) => ({
    index,
    coins: [...coins],
    prefix: [...prefixes[index]],
  }));

  function record(options) {
    if (steps.length >= MAX_TRACE_STEPS && !options.final) {
      omitted = true;
      return;
    }
    const candidates = (options.candidates || []).map((candidate) => ({
      ...candidate,
      coins: [...candidate.coins],
    }));
    const selectedCounts = options.selectedCounts ? [...options.selectedCounts] : null;
    steps.push({
      title: options.title,
      arr: [],
      highlight: [],
      mark: [],
      final: Boolean(options.final),
      codeLines: options.codeLines || [],
      vars: options.vars || [],
      note: options.note,
      coins2218View: {
        phase: options.phase,
        n,
        k,
        totalCoins,
        piles: pileData(),
        pileIndex: options.pileIndex ?? null,
        used: options.used ?? null,
        candidates,
        bestTake: options.bestTake ?? null,
        bestValue: options.bestValue ?? null,
        dp: displayDp(),
        selectedCounts,
        answer: options.final ? dp[n][k] : null,
        omitted,
      },
    });
  }

  record({
    phase: "init",
    title: label("Định nghĩa trạng thái DP", "Define the DP state"),
    codeLines: [4, 5],
    vars: [
      { name: "piles", value: n },
      { name: "total coins", value: totalCoins },
      { name: "k", value: k },
      { name: "dp[0][0]", value: 0 },
    ],
    note: label(
      "Mỗi pile chỉ được lấy một prefix từ trên xuống. dp[i][j] lưu giá trị tốt nhất khi lấy đúng j coin từ i pile đầu; chỉ dp[0][0] khả thi lúc đầu.",
      "Each pile contributes only a top prefix. dp[i][j] is the best value using exactly j coins from the first i piles; initially only dp[0][0] is reachable.",
    ),
  });

  for (let pileIndex = 0; pileIndex < n; pileIndex++) {
    const pile = piles[pileIndex];
    record({
      phase: "pile",
      pileIndex,
      title: label(`Pile ${pileIndex + 1}: tính prefix sum`, `Pile ${pileIndex + 1}: build prefix sums`),
      codeLines: [7, 8],
      vars: [
        { name: "pile", value: `[${pile.join(", ")}]` },
        { name: "prefix", value: `[${prefixes[pileIndex].join(", ")}]` },
      ],
      note: label(
        `prefix[t] là tổng của t coin trên cùng. Với pile này: [${prefixes[pileIndex].join(", ")}]. Nhờ đó mỗi lựa chọn take được tính O(1).`,
        `prefix[t] is the value of the top t coins. For this pile: [${prefixes[pileIndex].join(", ")}]. Each take choice is then O(1).`,
      ),
    });

    for (let used = 0; used <= k; used++) {
      const candidates = [];
      let bestValue = Number.NEGATIVE_INFINITY;
      let bestTake = -1;
      const maxTake = Math.min(pile.length, used);
      for (let take = 0; take <= maxTake; take++) {
        const sourceCoins = used - take;
        const previous = dp[pileIndex][sourceCoins];
        if (!Number.isFinite(previous)) continue;
        const pileValue = prefixes[pileIndex][take];
        const total = previous + pileValue;
        candidates.push({
          take,
          sourceCoins,
          previous,
          pileValue,
          total,
          coins: pile.slice(0, take),
          winner: false,
        });
        if (total > bestValue) {
          bestValue = total;
          bestTake = take;
        }
      }
      if (bestTake >= 0) {
        dp[pileIndex + 1][used] = bestValue;
        choice[pileIndex + 1][used] = bestTake;
        const winner = candidates.find((candidate) => candidate.take === bestTake);
        if (winner) winner.winner = true;
      }

      const formula = candidates.length
        ? candidates.map((candidate) => `t=${candidate.take}: ${candidate.previous}+${candidate.pileValue}=${candidate.total}`).join("; ")
        : "không có trạng thái nguồn khả thi";
      record({
        phase: "state",
        pileIndex,
        used,
        candidates,
        bestTake,
        bestValue: Number.isFinite(bestValue) ? bestValue : null,
        title: Number.isFinite(bestValue)
          ? label(`dp[${pileIndex + 1}][${used}] = ${bestValue}`, `dp[${pileIndex + 1}][${used}] = ${bestValue}`)
          : label(`dp[${pileIndex + 1}][${used}] không khả thi`, `dp[${pileIndex + 1}][${used}] is unreachable`),
        codeLines: [9, 10, 11, 12],
        vars: [
          { name: "pile i", value: pileIndex + 1 },
          { name: "j (coins total)", value: used },
          { name: "take", value: bestTake >= 0 ? bestTake : "—" },
          { name: `dp[${pileIndex + 1}][${used}]`, value: Number.isFinite(bestValue) ? bestValue : "−∞" },
        ],
        note: Number.isFinite(bestValue)
          ? label(
            `Thử lấy t = 0..${maxTake} coin trên pile ${pileIndex + 1}. ${formula}. Tốt nhất là t=${bestTake}, nên ghi ${bestValue} vào ô đích.`,
            `Try t = 0..${maxTake} top coins from pile ${pileIndex + 1}. ${formula}. The best is t=${bestTake}, so write ${bestValue} to the destination cell.`,
          )
          : label(
            "Không thể lấy đúng số coin này từ các pile đã xét; ô giữ trạng thái không khả thi.",
            "This exact coin count cannot be formed from the processed piles, so the state remains unreachable.",
          ),
      });
    }
  }

  const selectedCounts = Array(n).fill(0);
  let remaining = k;
  for (let i = n; i >= 1; i--) {
    const take = choice[i][remaining];
    if (take < 0) throw new Error("Không thể dựng lại lựa chọn tối ưu cho input này");
    selectedCounts[i - 1] = take;
    remaining -= take;
  }

  const selectionText = selectedCounts
    .map((take, index) => `P${index + 1}: ${take}`)
    .join(", ");
  record({
    phase: "done",
    pileIndex: n - 1,
    used: k,
    selectedCounts,
    title: label(`Đáp án = ${dp[n][k]}`, `Answer = ${dp[n][k]}`),
    codeLines: [13],
    vars: [
      { name: "answer", value: dp[n][k] },
      { name: "take per pile", value: `[${selectedCounts.join(", ")}]` },
      { name: "coins taken", value: selectedCounts.reduce((sum, take) => sum + take, 0) },
    ],
    note: omitted
      ? label(
        `Trace dài đã được rút gọn, nhưng toàn bộ DP vẫn được tính. Truy vết một phương án tối ưu (${selectionText}) cho đúng ${k} coin, tổng giá trị ${dp[n][k]}.`,
        `The long trace was shortened, but the full DP was computed. One optimal reconstruction (${selectionText}) takes exactly ${k} coins for value ${dp[n][k]}.`,
      )
      : label(
        `Truy vết lựa chọn tốt nhất ở từng hàng: ${selectionText}. Tổng số coin là ${k}, tổng giá trị là ${dp[n][k]}.`,
        `Backtrack the best choice in each row: ${selectionText}. The selection uses ${k} coins with total value ${dp[n][k]}.`,
      ),
    final: true,
  });

  return { original: piles, k, selectedCounts, answer: dp[n][k], steps };
}

module.exports = {
  2218: {
    id: 2218,
    difficulty: "hard",
    slug: "maximum-value-of-k-coins-from-piles",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
    ],
    title: label("Maximum Value of K Coins From Piles", "Maximum Value of K Coins From Piles"),
    titleVi: label("Giá trị lớn nhất khi lấy K đồng xu", "Maximum value from K coins"),
    statement: label(
      "Mỗi pile xếp từ trên xuống. Mỗi lần chỉ được lấy đồng xu trên cùng. Hãy lấy đúng k đồng xu trong tất cả các pile để tổng giá trị lớn nhất.",
      "Coins in each pile are ordered top to bottom, and only the top coin may be removed. Take exactly k coins across all piles to maximize total value.",
    ),
    defaultInput: "[[1,100,3],[7,8,9]]",
    inputKind: "string",
    inputLabel: label("piles: [[trên,...,dưới], ...]", "piles: [[top,...,bottom], ...]"),
    extraParams: [
      { key: "k", label: label("k (số coin phải lấy)", "k (exact coins to take)"), default: 2, min: 1, max: MAX_K },
    ],
    approach: [
      label("Tính prefix[t] cho mỗi pile: giá trị khi lấy đúng t coin trên cùng.", "Build prefix[t] for each pile: the value of taking exactly its top t coins."),
      label("dp[i][j] là giá trị lớn nhất khi lấy đúng j coin từ i pile đầu.", "dp[i][j] is the maximum value from exactly j coins using the first i piles."),
      label("Thử take coin ở pile hiện tại: dp[i][j] = max(dp[i−1][j−take] + prefix[take]).", "Try each take count in the current pile: dp[i][j] = max(dp[i−1][j−take] + prefix[take])."),
      label("Lưu lựa chọn tốt nhất để dựng lại số coin lấy từ từng pile.", "Store the best choice to reconstruct how many coins are taken from every pile."),
    ],
    complexity: {
      time: "O(n · k · maxPile)",
      space: "O(n · k)",
      note: label(
        "Có thể tối ưu phần tính đáp án xuống O(k); visualization giữ toàn bộ bảng để thấy chuyển trạng thái và truy vết.",
        "The computation can use O(k) space; the visualization keeps the full table to show transitions and reconstruction.",
      ),
    },
    code: [
      "class Solution:",
      "    def maxValueOfCoins(self, piles, k):",
      "        n = len(piles)",
      "        dp = [[float('-inf')] * (k + 1) for _ in range(n + 1)]",
      "        dp[0][0] = 0",
      "        for i, pile in enumerate(piles, 1):",
      "            prefix = [0]",
      "            for coin in pile: prefix.append(prefix[-1] + coin)",
      "            for used in range(k + 1):",
      "                for take in range(min(len(pile), used) + 1):",
      "                    if dp[i - 1][used - take] != float('-inf'):",
      "                        dp[i][used] = max(dp[i][used], dp[i - 1][used - take] + prefix[take])",
      "        return dp[n][k]",
    ],
    debugMode: "semantic",
    liveArgs: (input, params) => [parsePiles2218(input), Number(params.k)],
    builder: buildSteps2218,
  },
};
