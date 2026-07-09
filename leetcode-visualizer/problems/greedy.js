// Auto-generated: do not edit headers manually.
// Module of LeetCode Visualizer — category-specific builders and problem entries.

/**
 * Generate steps for LeetCode 1846:
 * Maximum Element After Decreasing and Rearranging.
 *
 * Algorithm:
 *  1. Sort the array in ascending order.
 *  2. arr[0] = 1.
 *  3. For each i: arr[i] = min(arr[i], arr[i-1] + 1).
 *  4. The answer is the last (largest) element.
 */
function buildSteps1846(input) {
  const original = [...input];
  const sorted = [...input].sort((a, b) => a - b);
  const steps = [];

  // Initialization step: original array
  steps.push({
    title: { vi: "Mảng ban đầu", en: "Initial array" },
    arr: [...original],
    highlight: [],
    codeLines: [2],
    vars: [
      { name: "n", value: original.length },
      { name: "arr", value: [...original] },
    ],
    note: {
      vi: `Mảng đầu vào: [${original.join(", ")}]. Ta được phép giảm bất kỳ phần tử nào và sắp xếp lại.`,
      en: `Input array: [${original.join(", ")}]. We may decrease any element and rearrange freely.`,
    },
  });

  // Sorting step
  steps.push({
    title: { vi: "Bước 1: Sắp xếp tăng dần", en: "Step 1: Sort ascending" },
    arr: [...sorted],
    highlight: sorted.map((_, i) => i),
    codeLines: [3],
    vars: [{ name: "arr", value: [...sorted] }],
    note: {
      vi: `Sắp xếp giúp mỗi phần tử chỉ cần lớn hơn phần tử trước tối đa 1 đơn vị: [${sorted.join(", ")}].`,
      en: `Sorting lets each element exceed the previous one by at most 1: [${sorted.join(", ")}].`,
    },
  });

  const work = [...sorted];

  // Set first element = 1
  const before0 = work[0];
  work[0] = 1;
  steps.push({
    title: { vi: "Bước 2: Ép arr[0] = 1", en: "Step 2: Force arr[0] = 1" },
    arr: [...work],
    highlight: [0],
    codeLines: [4],
    vars: [
      { name: "before", value: before0 },
      { name: "arr[0]", value: 1 },
      { name: "arr", value: [...work] },
    ],
    note: {
      vi: `Theo yêu cầu arr[0] phải bằng 1, nên giảm ${before0} → 1.`,
      en: `The constraint requires arr[0] = 1, so decrease ${before0} → 1.`,
    },
  });

  // Loop: assign arr[i] = min(arr[i], arr[i-1] + 1)
  for (let i = 1; i < work.length; i++) {
    const cur = work[i];
    const cap = work[i - 1] + 1;
    const next = Math.min(cur, cap);
    work[i] = next;

    let note;
    if (next < cur) {
      note = {
        vi: `i=${i}: arr[i]=${cur} > arr[i-1]+1=${cap}, nên giảm xuống ${next} để giữ |arr[i]-arr[i-1]| ≤ 1.`,
        en: `i=${i}: arr[i]=${cur} > arr[i-1]+1=${cap}, so decrease to ${next} to keep |arr[i]-arr[i-1]| ≤ 1.`,
      };
    } else {
      note = {
        vi: `i=${i}: arr[i]=${cur} ≤ arr[i-1]+1=${cap}, giữ nguyên ${next}.`,
        en: `i=${i}: arr[i]=${cur} ≤ arr[i-1]+1=${cap}, keep it as ${next}.`,
      };
    }

    steps.push({
      title: { vi: `Bước 3.${i}: Xét vị trí i=${i}`, en: `Step 3.${i}: Inspect index i=${i}` },
      arr: [...work],
      highlight: [i - 1, i],
      codeLines: [5, 6],
      vars: [
        { name: "i", value: i },
        { name: "arr[i-1]", value: work[i - 1] },
        { name: "arr[i] (old)", value: cur },
        { name: "cap = arr[i-1]+1", value: cap },
        { name: "arr[i] (new)", value: next },
        { name: "arr", value: [...work] },
      ],
      note,
    });
  }

  const answer = work[work.length - 1];
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...work],
    highlight: [],
    mark: [work.length - 1],
    final: true,
    codeLines: [7],
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `Phần tử cuối cùng là giá trị lớn nhất có thể đạt được = ${answer}.`,
      en: `The last element is the maximum achievable value = ${answer}.`,
    },
  });

  return { original, sorted, answer, steps };
}

/**
 * LeetCode 1288: Remove Covered Intervals.
 *
 * Interval [a, b] is covered by [c, d] iff c <= a AND b <= d.
 *
 * Strategy:
 *   1) Sort intervals by start ASC; when starts tie, by end DESC. This way if
 *      two intervals share the same start, the longer one appears first, so
 *      the shorter one is guaranteed to be covered.
 *   2) Walk through sorted intervals, tracking the max end seen so far.
 *      - If current end <= max_end → this interval is covered, skip it.
 *      - Otherwise → keep it, update max_end.
 *   3) Answer = number of kept intervals.
 */
function buildSteps1288(input) {
  const steps = [];

  // ── Parse input ─────────────────────────────────────────
  // Accept "1,4;3,6;2,8" style: intervals separated by ';', bounds by ','.
  const raw = String(input || "").trim();
  const parsed = raw
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.split(",").map((x) => Number(x.trim())));

  if (parsed.length === 0 || parsed.some((iv) => iv.length !== 2 || !Number.isFinite(iv[0]) || !Number.isFinite(iv[1]) || iv[0] > iv[1])) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      highlight: [], mark: [],
      final: true, codeLines: [3],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: `Định dạng: "l,r;l,r;..." với l ≤ r. Ví dụ: 1,4;3,6;2,8.`,
        en: `Format: "l,r;l,r;..." with l ≤ r. Example: 1,4;3,6;2,8.`,
      },
    });
    return { original: [], answer: 0, steps };
  }

  const original = parsed.map((iv) => [...iv]);
  const n = original.length;

  // For the bar chart, use the interval width as bar height and put "[l, r]"
  // in the sub-label so users see both the length and the bounds.
  const widths = original.map(([l, r]) => Math.max(1, r - l + 1));
  const subLabels = original.map(([l, r]) => `[${l},${r}]`);

  steps.push({
    title: { vi: "Mảng ban đầu", en: "Original intervals" },
    arr: [...widths],
    sub: [...subLabels],
    highlight: [], mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "n", value: n },
      { name: "intervals", value: subLabels.join(" ") },
    ],
    note: {
      vi:
        `Có ${n} đoạn. Một đoạn [a,b] bị bao bởi [c,d] khi c ≤ a và b ≤ d.\n` +
        `Chiến lược: sắp xếp theo start tăng dần, nếu trùng start thì end giảm dần (để đoạn dài hơn đứng trước). ` +
        `Sau đó quét, giữ lại các đoạn có end > max_end đã thấy.`,
      en:
        `${n} intervals. [a,b] is covered by [c,d] iff c ≤ a and b ≤ d.\n` +
        `Strategy: sort by start ASC, tie-break by end DESC (longer intervals first when starts match). ` +
        `Then scan; keep any interval whose end > max_end seen so far.`,
    },
  });

  // ── Sort intervals ──────────────────────────────────────
  const indexed = original.map(([l, r], i) => ({ l, r, origIdx: i }));
  indexed.sort((a, b) => (a.l - b.l) || (b.r - a.r));

  // Re-order the display arrays to match the sort so highlights align.
  const sortedWidths = indexed.map((iv) => Math.max(1, iv.r - iv.l + 1));
  const sortedLabels = indexed.map((iv) => `[${iv.l},${iv.r}]`);

  steps.push({
    title: { vi: "Sắp xếp", en: "Sort" },
    arr: [...sortedWidths],
    sub: [...sortedLabels],
    highlight: indexed.map((_, i) => i),
    mark: [],
    codeLines: [5, 6],
    vars: [
      { name: "sorted", value: sortedLabels.join(" ") },
      { name: "rule", value: "start ASC, end DESC" },
    ],
    note: {
      vi:
        `Sau khi sắp xếp: ${sortedLabels.join(" ")}.\n` +
        `Nhờ tie-break end DESC, nếu 2 đoạn cùng start thì đoạn dài hơn đứng trước → đoạn ngắn hơn chắc chắn bị bao.`,
      en:
        `After sorting: ${sortedLabels.join(" ")}.\n` +
        `Thanks to the end-DESC tie-break, when two intervals share a start the longer comes first, so the shorter is guaranteed covered.`,
    },
  });

  // ── Scan and mark ───────────────────────────────────────
  let maxEnd = -Infinity;
  let kept = 0;
  const keptIdx = [];    // indices in the SORTED array
  const covered = new Set(); // indices in the SORTED array

  for (let i = 0; i < indexed.length; i++) {
    const { l, r } = indexed[i];
    const isCovered = r <= maxEnd;
    if (isCovered) {
      covered.add(i);
      steps.push({
        title: { vi: `[${l},${r}] bị bao (bỏ)`, en: `[${l},${r}] is covered (drop)` },
        arr: [...sortedWidths],
        sub: [...sortedLabels],
        highlight: [i],
        mark: keptIdx.slice(),
        codeLines: [8, 9, 10],
        vars: [
          { name: "i (sorted)", value: i },
          { name: "current", value: `[${l},${r}]` },
          { name: "max_end so far", value: maxEnd },
          { name: "r <= max_end?", value: true },
          { name: "kept", value: kept },
        ],
        note: {
          vi: `end ${r} ≤ max_end ${maxEnd} → đoạn này nằm trọn trong đoạn kept trước đó. Bỏ.`,
          en: `end ${r} ≤ max_end ${maxEnd} → this interval fits inside a previously kept one. Drop it.`,
        },
      });
    } else {
      kept += 1;
      keptIdx.push(i);
      const oldMax = maxEnd;
      maxEnd = r;
      steps.push({
        title: { vi: `Giữ [${l},${r}]`, en: `Keep [${l},${r}]` },
        arr: [...sortedWidths],
        sub: [...sortedLabels],
        highlight: [i],
        mark: keptIdx.slice(),
        codeLines: [11, 12, 13],
        vars: [
          { name: "i (sorted)", value: i },
          { name: "current", value: `[${l},${r}]` },
          { name: "max_end (old)", value: oldMax === -Infinity ? "-∞" : oldMax },
          { name: "max_end (new)", value: maxEnd },
          { name: "kept", value: kept },
        ],
        note: {
          vi: `end ${r} > max_end cũ (${oldMax === -Infinity ? "-∞" : oldMax}) → giữ đoạn này. max_end ← ${maxEnd}. Đã giữ: ${kept}.`,
          en: `end ${r} > old max_end (${oldMax === -Infinity ? "-∞" : oldMax}) → keep it. max_end ← ${maxEnd}. Kept so far: ${kept}.`,
        },
      });
    }
  }

  // ── Final ───────────────────────────────────────────────
  const droppedList = indexed
    .map((iv, i) => (covered.has(i) ? `[${iv.l},${iv.r}]` : null))
    .filter(Boolean);
  const keptList = keptIdx.map((i) => `[${indexed[i].l},${indexed[i].r}]`);

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...sortedWidths],
    sub: [...sortedLabels],
    highlight: [],
    mark: keptIdx.slice(),
    final: true,
    codeLines: [14],
    vars: [
      { name: "kept intervals", value: keptList.join(" ") || "(none)" },
      { name: "dropped intervals", value: droppedList.join(" ") || "(none)" },
      { name: "answer", value: kept },
    ],
    note: {
      vi: `Sau khi bỏ ${droppedList.length} đoạn bị bao, còn lại ${kept}: ${keptList.join(" ")}.`,
      en: `After dropping ${droppedList.length} covered interval(s), ${kept} remain: ${keptList.join(" ")}.`,
    },
  });

  return { original, answer: kept, steps };
}

// ─── 121: Best Time to Buy and Sell Stock ───
function buildSteps121(nums, params) {
  const approach = Number(params && params.approach) || 1;
  if (approach === 2) return buildSteps121DP(nums);
  if (approach === 3) return buildSteps121Rolling(nums);
  return buildSteps121Greedy(nums);
}

function buildSteps121Greedy(nums) {
  const prices = nums;
  const n = prices.length;
  const steps = [];

  let minPrice = Infinity;
  let maxProfit = 0;
  let buyDay = 0, sellDay = 0;

  // Intro
  steps.push({
    title: { vi: "Ý tưởng: tìm ngày mua rẻ nhất, bán đắt nhất SAU đó", en: "Idea: find cheapest buy day, most expensive sell day AFTER it" },
    arr: [...prices],
    sub: prices.map((_, i) => `day ${i}`),
    highlight: [], mark: [],
    codeLines: [2, 3, 4],
    vars: [{ name: "prices", value: `[${prices.join(",")}]` }, { name: "min_price", value: "∞" }, { name: "max_profit", value: 0 }],
    note: {
      vi:
        `📈 Giá cổ phiếu: [${prices.join(", ")}].\n` +
        `💡 Duyệt 1 lần, track:\n` +
        `  • min_price = giá MUA thấp nhất tới hiện tại\n` +
        `  • max_profit = lợi nhuận TỐI ĐA = max(price - min_price)\n\n` +
        `Mỗi ngày: "nếu bán hôm nay, lời bao nhiêu?" → so với max_profit.`,
      en:
        `📈 Stock prices: [${prices.join(", ")}].\n` +
        `💡 Single pass, track:\n` +
        `  • min_price = lowest BUY price so far\n` +
        `  • max_profit = MAXIMUM profit = max(price - min_price)\n\n` +
        `Each day: "if I sell today, what's my profit?" → compare with max_profit.`,
    },
  });

  for (let i = 0; i < n; i++) {
    const price = prices[i];
    const oldMin = minPrice;
    const oldProfit = maxProfit;
    let action = "";

    if (price < minPrice) {
      minPrice = price;
      buyDay = i;
      action = "new min";
    } else {
      const profit = price - minPrice;
      if (profit > maxProfit) {
        maxProfit = profit;
        sellDay = i;
        action = "new max profit";
      } else {
        action = "no change";
      }
    }

    const profit = price - minPrice;
    steps.push({
      title: { vi: `Day ${i}: price=${price}${action === "new min" ? " 📉 min mới!" : action === "new max profit" ? " 📈 profit mới!" : ""}`, en: `Day ${i}: price=${price}${action === "new min" ? " 📉 new min!" : action === "new max profit" ? " 📈 new max profit!" : ""}` },
      arr: [...prices],
      sub: prices.map((_, idx) => idx === buyDay ? "📉buy" : idx === sellDay && maxProfit > 0 ? "📈sell" : `day ${idx}`),
      highlight: [i],
      mark: maxProfit > 0 ? [buyDay, sellDay] : [buyDay],
      codeLines: action === "new min" ? [7] : [9],
      vars: [
        { name: "day", value: i },
        { name: "price", value: price },
        { name: "min_price", value: `${oldMin === Infinity ? "∞" : oldMin}${action === "new min" ? ` → ${minPrice} 📉` : ` = ${minPrice}`}` },
        { name: "profit today", value: `${price} - ${minPrice} = ${profit}` },
        { name: "max_profit", value: `${oldProfit}${action === "new max profit" ? ` → ${maxProfit} 📈` : ` (unchanged)`}` },
      ],
      note: {
        vi: action === "new min"
          ? `price ${price} < min_price ${oldMin === Infinity ? "∞" : oldMin} → cập nhật min_price = ${price}. Đây là ngày mua tiềm năng mới!`
          : action === "new max profit"
            ? `Nếu bán hôm nay: profit = ${price} - ${minPrice} = ${profit} > max_profit ${oldProfit} → cập nhật max_profit = ${maxProfit}! 🎉`
            : `profit = ${price} - ${minPrice} = ${profit} ≤ max_profit ${maxProfit} → giữ nguyên.`,
        en: action === "new min"
          ? `price ${price} < min_price ${oldMin === Infinity ? "∞" : oldMin} → update min_price = ${price}. New potential buy day!`
          : action === "new max profit"
            ? `If sell today: profit = ${price} - ${minPrice} = ${profit} > max_profit ${oldProfit} → update max_profit = ${maxProfit}! 🎉`
            : `profit = ${price} - ${minPrice} = ${profit} ≤ max_profit ${maxProfit} → no change.`,
      },
    });
  }

  // Final
  const fs = {
    title: { vi: `Kết quả: max profit = ${maxProfit} 💰`, en: `Result: max profit = ${maxProfit} 💰` },
    arr: [...prices],
    sub: prices.map((_, idx) => idx === buyDay ? "📉BUY" : idx === sellDay && maxProfit > 0 ? "📈SELL" : `day ${idx}`),
    highlight: [], mark: maxProfit > 0 ? [buyDay, sellDay] : [],
    final: true, codeLines: [9],
    vars: [
      { name: "max_profit", value: maxProfit },
      { name: "buy day", value: maxProfit > 0 ? `day ${buyDay} (price ${prices[buyDay]})` : "n/a" },
      { name: "sell day", value: maxProfit > 0 ? `day ${sellDay} (price ${prices[sellDay]})` : "n/a" },
    ],
    note: {
      vi: maxProfit > 0
        ? `💰 Mua ngày ${buyDay} (giá ${prices[buyDay]}), bán ngày ${sellDay} (giá ${prices[sellDay]}). Lợi nhuận = ${prices[sellDay]} - ${prices[buyDay]} = ${maxProfit}.`
        : `Giá giảm liên tục → không có ngày bán lời → profit = 0.`,
      en: maxProfit > 0
        ? `💰 Buy day ${buyDay} (price ${prices[buyDay]}), sell day ${sellDay} (price ${prices[sellDay]}). Profit = ${prices[sellDay]} - ${prices[buyDay]} = ${maxProfit}.`
        : `Prices only decrease → no profitable trade → profit = 0.`,
    },
  };
  steps.push(fs);
  return { original: [...prices], answer: maxProfit, steps };
}

// ─── 121 Approach 2: DP Array ───
function buildSteps121DP(nums) {
  const prices = nums;
  const n = prices.length;
  const steps = [];
  const dp = new Array(n).fill(0);
  let minPrice = prices[0];

  steps.push({
    title: { vi: "DP Array: dp[i] = max profit tới ngày i", en: "DP Array: dp[i] = max profit up to day i" },
    arr: [...prices], sub: dp.map(String),
    highlight: [0], mark: [], codeLines: [3, 4, 5], codeBlock: 2,
    vars: [{ name: "prices", value: `[${prices.join(",")}]` }, { name: "min_price", value: prices[0] }, { name: "dp[0]", value: 0 }],
    note: {
      vi: `dp[i] = max profit nếu bán vào hoặc trước ngày i.\ndp[0] = 0 (ngày đầu không bán được).\nmin_price = ${prices[0]} (giá mua thấp nhất tới hiện tại).`,
      en: `dp[i] = max profit selling on or before day i.\ndp[0] = 0 (can't sell on first day).\nmin_price = ${prices[0]} (lowest buy price so far).`,
    },
  });

  for (let i = 1; i < n; i++) {
    const skipProfit = dp[i - 1];
    const sellProfit = prices[i] - minPrice;
    dp[i] = Math.max(skipProfit, sellProfit);
    const sold = dp[i] === sellProfit && sellProfit > skipProfit;

    steps.push({
      title: { vi: `dp[${i}]: max(dp[${i-1}], price-min) = max(${skipProfit}, ${sellProfit}) = ${dp[i]}`, en: `dp[${i}]: max(dp[${i-1}], price-min) = max(${skipProfit}, ${sellProfit}) = ${dp[i]}` },
      arr: [...prices], sub: dp.map((v, idx) => idx <= i ? String(v) : "·"),
      highlight: [i], mark: [], codeLines: [7], codeBlock: 2,
      vars: [
        { name: "i", value: i },
        { name: "prices[i]", value: prices[i] },
        { name: "min_price", value: minPrice },
        { name: "① keep (dp[i-1])", value: skipProfit },
        { name: "② sell (price-min)", value: `${prices[i]}-${minPrice} = ${sellProfit}` },
        { name: "dp[i] = max(①,②)", value: `max(${skipProfit}, ${sellProfit}) = ${dp[i]}` },
        { name: "dp", value: `[${dp.join(",")}]` },
      ],
      note: {
        vi: `① Giữ profit cũ: dp[${i-1}] = ${skipProfit}\n② Bán hôm nay: ${prices[i]} - ${minPrice} = ${sellProfit}\n→ dp[${i}] = max(${skipProfit}, ${sellProfit}) = ${dp[i]}${sold ? " 📈" : ""}`,
        en: `① Keep old profit: dp[${i-1}] = ${skipProfit}\n② Sell today: ${prices[i]} - ${minPrice} = ${sellProfit}\n→ dp[${i}] = max(${skipProfit}, ${sellProfit}) = ${dp[i]}${sold ? " 📈" : ""}`,
      },
    });

    minPrice = Math.min(minPrice, prices[i]);
  }

  const answer = dp[n - 1];
  const fs = {
    title: { vi: `Kết quả: dp[${n-1}] = ${answer} 💰`, en: `Result: dp[${n-1}] = ${answer} 💰` },
    arr: [...prices], sub: dp.map(String),
    highlight: [], mark: [n - 1], final: true, codeLines: [9], codeBlock: 2,
    vars: [{ name: "answer", value: answer }, { name: "dp", value: `[${dp.join(",")}]` }],
    note: { vi: `Max profit = dp[${n-1}] = ${answer}.`, en: `Max profit = dp[${n-1}] = ${answer}.` },
  };
  steps.push(fs);
  return { original: [...prices], answer, steps };
}

// ─── 121 Approach 3: DP Rolling O(1) space ───
function buildSteps121Rolling(nums) {
  const prices = nums;
  const n = prices.length;
  const steps = [];
  let minPrice = prices[0];
  let prevDp = 0;

  steps.push({
    title: { vi: "DP Rolling O(1): prev_dp thay cho dp[]", en: "DP Rolling O(1): prev_dp replaces dp[]" },
    arr: [...prices], sub: prices.map((_, i) => `day ${i}`),
    highlight: [0], mark: [], codeLines: [3, 4], codeBlock: 2,
    vars: [{ name: "min_price", value: prices[0] }, { name: "prev_dp", value: 0 }],
    note: {
      vi: `Giống DP Array nhưng dp[i] chỉ phụ thuộc dp[i-1] → không cần mảng!\nChỉ giữ 1 biến prev_dp = dp[i-1].\ncur_dp = max(prev_dp, price - min_price)\nSau đó: prev_dp = cur_dp, min_price = min(min_price, price).`,
      en: `Same as DP Array but dp[i] only depends on dp[i-1] → no array needed!\nJust keep prev_dp = dp[i-1].\ncur_dp = max(prev_dp, price - min_price)\nThen: prev_dp = cur_dp, min_price = min(min_price, price).`,
    },
  });

  for (let i = 1; i < n; i++) {
    const curDp = Math.max(prevDp, prices[i] - minPrice);
    const sellProfit = prices[i] - minPrice;

    steps.push({
      title: { vi: `Day ${i}: cur_dp = max(${prevDp}, ${sellProfit}) = ${curDp}`, en: `Day ${i}: cur_dp = max(${prevDp}, ${sellProfit}) = ${curDp}` },
      arr: [...prices], sub: prices.map((_, idx) => idx === i ? `◄ day ${idx}` : `day ${idx}`),
      highlight: [i], mark: [], codeLines: [6], codeBlock: 2,
      vars: [
        { name: "i", value: i },
        { name: "price", value: prices[i] },
        { name: "min_price", value: minPrice },
        { name: "prev_dp", value: prevDp },
        { name: "cur_dp = max(prev_dp, price-min)", value: `max(${prevDp}, ${prices[i]}-${minPrice}) = max(${prevDp}, ${sellProfit}) = ${curDp}` },
      ],
      note: {
        vi: `cur_dp = max(prev_dp=${prevDp}, price-min=${sellProfit}) = ${curDp}.\nSau: prev_dp ← ${curDp}, min_price ← min(${minPrice}, ${prices[i]}) = ${Math.min(minPrice, prices[i])}.`,
        en: `cur_dp = max(prev_dp=${prevDp}, price-min=${sellProfit}) = ${curDp}.\nThen: prev_dp ← ${curDp}, min_price ← min(${minPrice}, ${prices[i]}) = ${Math.min(minPrice, prices[i])}.`,
      },
    });

    minPrice = Math.min(minPrice, prices[i]);
    prevDp = curDp;
  }

  const fs = {
    title: { vi: `Kết quả: ${prevDp} 💰 (O(1) space!)`, en: `Result: ${prevDp} 💰 (O(1) space!)` },
    arr: [...prices], sub: prices.map((_, i) => `day ${i}`),
    highlight: [], mark: [], final: true, codeLines: [9], codeBlock: 2,
    vars: [{ name: "answer", value: prevDp }],
    note: { vi: `prev_dp = ${prevDp}. Cùng kết quả với DP Array nhưng O(1) bộ nhớ!`, en: `prev_dp = ${prevDp}. Same result as DP Array but O(1) memory!` },
  };
  steps.push(fs);
  return { original: [...prices], answer: prevDp, steps };
}

module.exports = {
  1288: {
    id: 1288,
    difficulty: "medium",
    slug: "remove-covered-intervals",
    category: { key: "greedy", vi: "Tham lam & Sắp xếp", en: "Greedy & Sorting" },
    title: { vi: "Remove Covered Intervals", en: "Remove Covered Intervals" },
    titleVi: { vi: "Đếm đoạn còn lại sau khi bỏ đoạn bị bao", en: "Count intervals after removing covered ones" },
    statement: {
      vi:
        "Cho danh sách intervals[i] = [l, r]. Đoạn [a, b] bị bao bởi đoạn [c, d] khi c ≤ a và b ≤ d. " +
        "Trả về số đoạn còn lại sau khi bỏ hết các đoạn bị bao.",
      en:
        "Given intervals[i] = [l, r]. Interval [a, b] is covered by [c, d] iff c ≤ a and b ≤ d. " +
        "Return the number of intervals remaining after removing all covered ones.",
    },
    defaultInput: "1,4;3,6;2,8",
    inputKind: "string",
    inputLabel: { vi: "intervals (l,r; l,r; …)", en: "intervals (l,r; l,r; …)" },
    extraParams: [],
    complexity: {
      time: "O(n log n)",
      space: "O(1)",
      note: {
        vi: "Sắp xếp O(n log n) chi phối; quét sau đó O(n). Bộ nhớ phụ O(1).",
        en: "Sort dominates at O(n log n); the pass is O(n). O(1) extra memory.",
      },
    },
    code: [
      "class Solution:",
      "    def removeCoveredIntervals(self, intervals):",
      "        # start ASC, then end DESC on ties so longer wins",
      "        intervals.sort(key=lambda iv: (iv[0], -iv[1]))",
      "        max_end = 0",
      "        kept = 0",
      "        for l, r in intervals:",
      "            if r <= max_end:",
      "                continue        # covered, drop it",
      "            kept += 1",
      "            max_end = r",
      "        return kept",
    ],
    builder: buildSteps1288,
  },
  1846: {
    id: 1846,
    difficulty: "medium",
    slug: "maximum-element-after-decreasing-and-rearranging",
    category: { key: "greedy", vi: "Tham lam & Sắp xếp", en: "Greedy & Sorting" },
    title: {
      vi: "Maximum Element After Decreasing and Rearranging",
      en: "Maximum Element After Decreasing and Rearranging",
    },
    titleVi: { vi: "Giá trị lớn nhất sau khi giảm và sắp xếp lại", en: "Maximum value after decreasing and rearranging" },
    statement: {
      vi:
        "Cho mảng số nguyên dương arr. " +
        "Bạn được phép: (1) giảm bất kỳ phần tử nào về một số nguyên dương nhỏ hơn; " +
        "(2) sắp xếp lại mảng tùy ý. " +
        "Sao cho arr[0] = 1 và |arr[i] - arr[i-1]| ≤ 1 với mọi i. " +
        "Trả về giá trị lớn nhất có thể của một phần tử trong mảng sau khi thực hiện.",
      en:
        "You are given an array of positive integers arr. " +
        "Perform some operations (possibly none) on arr so that it satisfies these conditions: " +
        "(1) The value of the first element in arr must be 1. " +
        "(2) The absolute difference between any 2 adjacent elements must be less than or equal to 1, " +
        "i.e. abs(arr[i] - arr[i-1]) <= 1 for each i where 1 <= i < arr.length (0-indexed). " +
        "There are 2 types of operations you can perform any number of times: " +
        "decrease the value of any element of arr to a smaller positive integer; " +
        "rearrange the elements of arr in any order. " +
        "Return the maximum possible value of an element in arr after performing the operations to satisfy the conditions.",
    },
    defaultInput: [2, 2, 1, 2, 1],
    inputKind: "positive", // các số nguyên dương
    extraParams: [],
    complexity: {
      time: "O(n log n)",
      space: "O(1)",
      note: {
        vi: "Chi phí chính là sắp xếp O(n log n); vòng lặp gán chỉ O(n). Sắp xếp tại chỗ nên không tốn thêm bộ nhớ đáng kể.",
        en: "Sorting dominates at O(n log n); the assignment loop is only O(n). Sorting is in-place, so no significant extra memory.",
      },
    },
    code: [
      "class Solution:",
      "    def maximumElementAfterDecrementingAndRearranging(self, arr):",
      "        arr.sort()",
      "        arr[0] = 1",
      "        for i in range(1, len(arr)):",
      "            arr[i] = min(arr[i], arr[i - 1] + 1)",
      "        return arr[-1]",
    ],
    builder: buildSteps1846,
  },
  121: {
    id: 121,
    difficulty: "easy",
    slug: "best-time-to-buy-and-sell-stock",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Best Time to Buy and Sell Stock", en: "Best Time to Buy and Sell Stock" },
    titleVi: { vi: "Mua bán cổ phiếu (1 lần)", en: "Buy and sell stock once for max profit" },
    statement: {
      vi: "Cho mảng prices[i] = giá cổ phiếu ngày i. Chọn 1 ngày mua và 1 ngày bán SAU đó để lời TỐI ĐA. Nếu không lời → trả 0. Nhập giá cách bởi dấu phẩy.",
      en: "Given prices[i] = stock price on day i. Pick one day to buy and a later day to sell for MAXIMUM profit. If no profit possible → return 0. Enter prices comma-separated.",
    },
    defaultInput: [7, 1, 5, 3, 6, 4],
    inputKind: "integer",
    inputLabel: { vi: "Giá cổ phiếu (dấu phẩy)", en: "Stock prices (comma-separated)" },
    extraParams: [],
    approach: [
      { vi: "Duyệt 1 lần: track giá MUA thấp nhất (min_price). Mỗi ngày: profit = price - min_price.", en: "Single pass: track lowest BUY price (min_price). Each day: profit = price - min_price." },
      { vi: "Cập nhật max_profit = max(max_profit, profit).", en: "Update max_profit = max(max_profit, profit)." },
    ],
    complexity: { time: "O(n)", space: "O(1) / O(n)", note: { vi: "Cách 1,3: O(1). Cách 2: O(n) dp array.", en: "Approach 1,3: O(1). Approach 2: O(n) dp array." } },
    extraParams: [
      { key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1", options: [
        { value: "1", label: { vi: "Cách 1: Greedy O(1)", en: "Approach 1: Greedy O(1)" } },
        { value: "2", label: { vi: "Cách 2: DP Array O(n)", en: "Approach 2: DP Array O(n)" } },
        { value: "3", label: { vi: "Cách 3: DP Rolling O(1) space", en: "Approach 3: DP Rolling O(1) space" } },
      ] },
    ],
    code: [
      "class Solution:",
      "    def maxProfit(self, prices):",
      "        min_price = float('inf')",
      "        max_profit = 0",
      "        for price in prices:",
      "            if price < min_price:",
      "                min_price = price",
      "            else:",
      "                max_profit = max(max_profit, price - min_price)",
      "        return max_profit",
    ],
    code2: [
      "class Solution:",
      "    def maxProfit(self, prices):",
      "        n = len(prices)",
      "        dp = [0] * n",
      "        min_price = prices[0]",
      "        for i in range(1, n):",
      "            dp[i] = max(dp[i-1], prices[i] - min_price)",
      "            min_price = min(min_price, prices[i])",
      "        return dp[n-1]",
    ],
    codeLabel: { vi: "Cách 1: Greedy O(1)", en: "Approach 1: Greedy O(1)" },
    code2Label: { vi: "Cách 2: DP Array O(n)", en: "Approach 2: DP Array O(n)" },
    builder: buildSteps121,
  },
};
