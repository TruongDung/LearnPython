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

  // Intro line 2: min_price = inf
  steps.push({
    title: { vi: "Khởi tạo min_price = ∞", en: "Initialize min_price = ∞" },
    arr: [...prices],
    sub: prices.map((_, i) => `day ${i}`),
    highlight: [], mark: [],
    codeLines: [3],
    vars: [
      { name: "prices", value: `[${prices.join(",")}]` },
      { name: "min_price", value: "∞" },
      { name: "max_profit", value: maxProfit },
    ],
    note: {
      vi: `📈 Giá cổ phiếu: [${prices.join(", ")}]. Khởi tạo min_price = ∞ (giá mua thấp nhất).`,
      en: `📈 Stock prices: [${prices.join(", ")}]. Initialize min_price = ∞ (lowest buy price).`,
    },
  });

  // Intro line 3: max_profit = 0
  steps.push({
    title: { vi: "Khởi tạo max_profit = 0", en: "Initialize max_profit = 0" },
    arr: [...prices],
    sub: prices.map((_, i) => `day ${i}`),
    highlight: [], mark: [],
    codeLines: [4],
    vars: [{ name: "min_price", value: "∞" }, { name: "max_profit", value: 0 }],
    note: {
      vi: `max_profit = 0 (lợi nhuận tối đa ban đầu).`,
      en: `max_profit = 0 (initial maximum profit).`,
    },
  });

  for (let i = 0; i < n; i++) {
    const price = prices[i];
    const oldMin = minPrice;
    const oldProfit = maxProfit;

    // Step: for price in prices (line 5)
    steps.push({
      title: { vi: `Vòng lặp: price = prices[${i}] = ${price}`, en: `Loop: price = prices[${i}] = ${price}` },
      arr: [...prices],
      sub: prices.map((_, idx) => idx === buyDay && minPrice !== Infinity ? "📉buy" : idx === sellDay && maxProfit > 0 ? "📈sell" : `day ${idx}`),
      highlight: [i],
      mark: maxProfit > 0 ? [buyDay, sellDay] : (minPrice !== Infinity ? [buyDay] : []),
      codeLines: [5],
      vars: [
        { name: "price", value: price },
        { name: "min_price", value: oldMin === Infinity ? "∞" : oldMin },
        { name: "max_profit", value: oldProfit },
      ],
      note: {
        vi: `Xét ngày ${i}: price = ${price}.`,
        en: `Consider day ${i}: price = ${price}.`,
      },
    });

    if (price < minPrice) {
      // Step: if price < min_price (line 6) → True
      steps.push({
        title: { vi: `${price} < ${oldMin === Infinity ? "∞" : oldMin}? ✓ → cập nhật min_price`, en: `${price} < ${oldMin === Infinity ? "∞" : oldMin}? ✓ → update min_price` },
        arr: [...prices],
        sub: prices.map((_, idx) => idx === i ? "📉buy" : idx === sellDay && maxProfit > 0 ? "📈sell" : `day ${idx}`),
        highlight: [i],
        mark: [i],
        codeLines: [6],
        vars: [
          { name: "price", value: price },
          { name: "min_price", value: oldMin === Infinity ? "∞" : oldMin },
          { name: "max_profit", value: maxProfit },
          { name: `price < min_price?`, value: `${price} < ${oldMin === Infinity ? "∞" : oldMin} → True` },
        ],
        note: {
          vi: `price ${price} < min_price ${oldMin === Infinity ? "∞" : oldMin} → điều kiện ĐÚNG.`,
          en: `price ${price} < min_price ${oldMin === Infinity ? "∞" : oldMin} → condition TRUE.`,
        },
      });

      minPrice = price;
      buyDay = i;

      // Step: min_price = price (line 7)
      steps.push({
        title: { vi: `min_price = ${price} 📉`, en: `min_price = ${price} 📉` },
        arr: [...prices],
        sub: prices.map((_, idx) => idx === buyDay ? "📉buy" : idx === sellDay && maxProfit > 0 ? "📈sell" : `day ${idx}`),
        highlight: [i],
        mark: [buyDay],
        codeLines: [7],
        vars: [
          { name: "min_price", value: minPrice },
          { name: "max_profit", value: maxProfit },
        ],
        note: {
          vi: `Cập nhật min_price = ${price}. Ngày mua tiềm năng mới!`,
          en: `Update min_price = ${price}. New potential buy day!`,
        },
      });
    } else {
      // Step: if price < min_price (line 6) → False → else
      const profit = price - minPrice;

      steps.push({
        title: { vi: `${price} < ${minPrice}? ✗ → else`, en: `${price} < ${minPrice}? ✗ → else` },
        arr: [...prices],
        sub: prices.map((_, idx) => idx === buyDay ? "📉buy" : idx === sellDay && maxProfit > 0 ? "📈sell" : `day ${idx}`),
        highlight: [i],
        mark: maxProfit > 0 ? [buyDay, sellDay] : [buyDay],
        codeLines: [8],
        vars: [
          { name: "price", value: price },
          { name: "min_price", value: minPrice },
          { name: "max_profit", value: maxProfit },
          { name: `price < min_price?`, value: `${price} < ${minPrice} → False` },
        ],
        note: {
          vi: `price ${price} ≥ min_price ${minPrice} → vào nhánh else: tính profit.`,
          en: `price ${price} ≥ min_price ${minPrice} → enter else branch: compute profit.`,
        },
      });

      // Step: max_profit = max(max_profit, price - min_price) (line 9)
      if (profit > maxProfit) {
        maxProfit = profit;
        sellDay = i;
      }

      steps.push({
        title: { vi: `max_profit = max(${oldProfit}, ${price}-${minPrice}) = max(${oldProfit}, ${profit}) = ${maxProfit}`, en: `max_profit = max(${oldProfit}, ${price}-${minPrice}) = max(${oldProfit}, ${profit}) = ${maxProfit}` },
        arr: [...prices],
        sub: prices.map((_, idx) => idx === buyDay ? "📉buy" : idx === sellDay && maxProfit > 0 ? "📈sell" : `day ${idx}`),
        highlight: [i],
        mark: maxProfit > 0 ? [buyDay, sellDay] : [buyDay],
        codeLines: [9],
        vars: [
          { name: "price - min_price", value: `${price} - ${minPrice} = ${profit}` },
          { name: "min_price", value: minPrice },
          { name: "max_profit", value: `max(${oldProfit}, ${profit}) = ${maxProfit}${profit > oldProfit ? " 📈" : ""}` },
        ],
        note: {
          vi: profit > oldProfit
            ? `profit = ${profit} > max_profit cũ ${oldProfit} → cập nhật max_profit = ${maxProfit}! 🎉`
            : `profit = ${profit} ≤ max_profit ${maxProfit} → giữ nguyên.`,
          en: profit > oldProfit
            ? `profit = ${profit} > old max_profit ${oldProfit} → update max_profit = ${maxProfit}! 🎉`
            : `profit = ${profit} ≤ max_profit ${maxProfit} → no change.`,
        },
      });
    }
  }

  // Final: return max_profit (line 10)
  steps.push({
    title: { vi: `Kết quả: max_profit = ${maxProfit} 💰`, en: `Result: max_profit = ${maxProfit} 💰` },
    arr: [...prices],
    sub: prices.map((_, idx) => idx === buyDay ? "📉BUY" : idx === sellDay && maxProfit > 0 ? "📈SELL" : `day ${idx}`),
    highlight: [], mark: maxProfit > 0 ? [buyDay, sellDay] : [],
    final: true, codeLines: [10],
    vars: [
      { name: "min_price", value: minPrice === Infinity ? "∞" : minPrice },
      { name: "max_profit", value: maxProfit },
      { name: "buy day", value: maxProfit > 0 ? `day ${buyDay} (price ${prices[buyDay]})` : "n/a" },
      { name: "sell day", value: maxProfit > 0 ? `day ${sellDay} (price ${prices[sellDay]})` : "n/a" },
    ],
    note: {
      vi: maxProfit > 0
        ? `💰 Mua ngày ${buyDay} (giá ${prices[buyDay]}), bán ngày ${sellDay} (giá ${prices[sellDay]}). Lợi nhuận = ${maxProfit}.`
        : `Giá giảm liên tục → profit = 0.`,
      en: maxProfit > 0
        ? `💰 Buy day ${buyDay} (price ${prices[buyDay]}), sell day ${sellDay} (price ${prices[sellDay]}). Profit = ${maxProfit}.`
        : `Prices only decrease → profit = 0.`,
    },
  });
  return { original: [...prices], answer: maxProfit, steps };
}

// ─── 121 Approach 2: DP Array ───
function buildSteps121DP(nums) {
  const prices = nums;
  const n = prices.length;
  const steps = [];
  const dp = new Array(n).fill(0);
  let minPrice = prices[0];

  // Line 3: dp = [0] * n
  steps.push({
    title: { vi: "Khởi tạo dp = [0] * n", en: "Initialize dp = [0] * n" },
    arr: [...prices], sub: dp.map(String),
    highlight: [], mark: [], codeLines: [3], codeBlock: 2,
    vars: [{ name: "n", value: n }, { name: "dp", value: `[${dp.join(",")}]` }],
    note: {
      vi: `dp[i] = max profit nếu bán vào hoặc trước ngày i. Khởi tạo tất cả = 0.`,
      en: `dp[i] = max profit selling on or before day i. Initialize all to 0.`,
    },
  });

  // Line 4: dp[0] = 0 (implicit)
  steps.push({
    title: { vi: "dp[0] = 0 (ngày đầu không bán được)", en: "dp[0] = 0 (can't sell on first day)" },
    arr: [...prices], sub: dp.map(String),
    highlight: [0], mark: [], codeLines: [4], codeBlock: 2,
    vars: [{ name: "dp[0]", value: 0 }],
    note: {
      vi: `dp[0] = 0 vì ngày đầu tiên không thể bán (chưa mua).`,
      en: `dp[0] = 0 since you can't sell on the first day (haven't bought yet).`,
    },
  });

  // Line 5: min_price = prices[0]
  steps.push({
    title: { vi: `min_price = prices[0] = ${prices[0]}`, en: `min_price = prices[0] = ${prices[0]}` },
    arr: [...prices], sub: dp.map(String),
    highlight: [0], mark: [], codeLines: [5], codeBlock: 2,
    vars: [{ name: "min_price", value: prices[0] }, { name: "dp", value: `[${dp.join(",")}]` }],
    note: {
      vi: `min_price = ${prices[0]} (giá mua thấp nhất tới hiện tại).`,
      en: `min_price = ${prices[0]} (lowest buy price so far).`,
    },
  });

  for (let i = 1; i < n; i++) {
    const skipProfit = dp[i - 1];
    const sellProfit = prices[i] - minPrice;

    // Line 6: for i in range(1, n)
    steps.push({
      title: { vi: `Vòng lặp i=${i}`, en: `Loop i=${i}` },
      arr: [...prices], sub: dp.map((v, idx) => idx <= i ? String(v) : "·"),
      highlight: [i], mark: [], codeLines: [6], codeBlock: 2,
      vars: [
        { name: "i", value: i },
        { name: "prices[i]", value: prices[i] },
        { name: "min_price", value: minPrice },
        { name: "dp[i-1]", value: skipProfit },
        { name: "dp", value: `[${dp.join(",")}]` },
      ],
      note: {
        vi: `Xét ngày i=${i}: prices[${i}]=${prices[i]}, min_price=${minPrice}.`,
        en: `Consider day i=${i}: prices[${i}]=${prices[i]}, min_price=${minPrice}.`,
      },
    });

    // Line 7: dp[i] = max(dp[i-1], prices[i] - min_price)
    dp[i] = Math.max(skipProfit, sellProfit);
    const sold = dp[i] === sellProfit && sellProfit > skipProfit;

    steps.push({
      title: { vi: `dp[${i}] = max(${skipProfit}, ${sellProfit}) = ${dp[i]}${sold ? " 📈" : ""}`, en: `dp[${i}] = max(${skipProfit}, ${sellProfit}) = ${dp[i]}${sold ? " 📈" : ""}` },
      arr: [...prices], sub: dp.map((v, idx) => idx <= i ? String(v) : "·"),
      highlight: [i], mark: [i], codeLines: [7], codeBlock: 2,
      vars: [
        { name: "dp[i-1] (keep)", value: skipProfit },
        { name: "prices[i]-min_price (sell)", value: `${prices[i]}-${minPrice} = ${sellProfit}` },
        { name: "dp[i] = max(①,②)", value: `max(${skipProfit}, ${sellProfit}) = ${dp[i]}` },
        { name: "dp", value: `[${dp.join(",")}]` },
      ],
      note: {
        vi: `dp[${i}] = max(dp[${i-1}]=${skipProfit}, ${prices[i]}-${minPrice}=${sellProfit}) = ${dp[i]}${sold ? " 📈 profit mới!" : ""}`,
        en: `dp[${i}] = max(dp[${i-1}]=${skipProfit}, ${prices[i]}-${minPrice}=${sellProfit}) = ${dp[i]}${sold ? " 📈 new max!" : ""}`,
      },
    });

    // Line 8: min_price = min(min_price, prices[i])
    const oldMin = minPrice;
    minPrice = Math.min(minPrice, prices[i]);
    steps.push({
      title: { vi: `min_price = min(${oldMin}, ${prices[i]}) = ${minPrice}`, en: `min_price = min(${oldMin}, ${prices[i]}) = ${minPrice}` },
      arr: [...prices], sub: dp.map((v, idx) => idx <= i ? String(v) : "·"),
      highlight: [i], mark: [], codeLines: [8], codeBlock: 2,
      vars: [
        { name: "min_price", value: `min(${oldMin}, ${prices[i]}) = ${minPrice}${minPrice < oldMin ? " 📉" : ""}` },
        { name: "dp", value: `[${dp.join(",")}]` },
      ],
      note: {
        vi: `Cập nhật min_price = min(${oldMin}, ${prices[i]}) = ${minPrice}${minPrice < oldMin ? " (giá mua mới!)" : ""}.`,
        en: `Update min_price = min(${oldMin}, ${prices[i]}) = ${minPrice}${minPrice < oldMin ? " (new buy price!)" : ""}.`,
      },
    });
  }

  const answer = dp[n - 1];
  steps.push({
    title: { vi: `Kết quả: dp[${n-1}] = ${answer} 💰`, en: `Result: dp[${n-1}] = ${answer} 💰` },
    arr: [...prices], sub: dp.map(String),
    highlight: [], mark: [n - 1], final: true, codeLines: [9], codeBlock: 2,
    vars: [{ name: "answer", value: answer }, { name: "dp", value: `[${dp.join(",")}]` }],
    note: { vi: `Max profit = dp[${n-1}] = ${answer}.`, en: `Max profit = dp[${n-1}] = ${answer}.` },
  });
  return { original: [...prices], answer, steps };
}

// ─── 121 Approach 3: DP Rolling O(1) space ───
function buildSteps121Rolling(nums) {
  const prices = nums;
  const n = prices.length;
  const steps = [];
  let minPrice = prices[0];
  let prevDp = 0;

  // Line 3: min_price = prices[0]
  steps.push({
    title: { vi: `min_price = prices[0] = ${prices[0]}`, en: `min_price = prices[0] = ${prices[0]}` },
    arr: [...prices], sub: prices.map((_, i) => `day ${i}`),
    highlight: [0], mark: [], codeLines: [3], codeBlock: 3,
    vars: [{ name: "min_price", value: prices[0] }],
    note: {
      vi: `O(1) space: chỉ dùng prev_dp thay cho dp[]. Khởi tạo min_price = ${prices[0]}.`,
      en: `O(1) space: use prev_dp instead of dp[]. Initialize min_price = ${prices[0]}.`,
    },
  });

  // Line 4: prev_dp = 0
  steps.push({
    title: { vi: "prev_dp = 0", en: "prev_dp = 0" },
    arr: [...prices], sub: prices.map((_, i) => `day ${i}`),
    highlight: [0], mark: [], codeLines: [4], codeBlock: 3,
    vars: [{ name: "min_price", value: prices[0] }, { name: "prev_dp", value: 0 }],
    note: {
      vi: `prev_dp = 0 (dp[0] = 0, ngày đầu không bán được).`,
      en: `prev_dp = 0 (dp[0] = 0, can't sell on first day).`,
    },
  });

  for (let i = 1; i < n; i++) {
    const sellProfit = prices[i] - minPrice;

    // Line 5: for i in range(1, n)
    steps.push({
      title: { vi: `Vòng lặp i=${i}`, en: `Loop i=${i}` },
      arr: [...prices], sub: prices.map((_, idx) => idx === i ? `◄ day ${idx}` : `day ${idx}`),
      highlight: [i], mark: [], codeLines: [5], codeBlock: 3,
      vars: [
        { name: "i", value: i },
        { name: "prices[i]", value: prices[i] },
        { name: "min_price", value: minPrice },
        { name: "prev_dp", value: prevDp },
      ],
      note: {
        vi: `Xét ngày i=${i}: prices[${i}]=${prices[i]}.`,
        en: `Consider day i=${i}: prices[${i}]=${prices[i]}.`,
      },
    });

    // Line 6: cur_dp = max(prev_dp, prices[i] - min_price)
    const curDp = Math.max(prevDp, sellProfit);
    steps.push({
      title: { vi: `cur_dp = max(${prevDp}, ${sellProfit}) = ${curDp}`, en: `cur_dp = max(${prevDp}, ${sellProfit}) = ${curDp}` },
      arr: [...prices], sub: prices.map((_, idx) => idx === i ? `◄ day ${idx}` : `day ${idx}`),
      highlight: [i], mark: [], codeLines: [6], codeBlock: 3,
      vars: [
        { name: "cur_dp = max(prev_dp, price-min)", value: `max(${prevDp}, ${prices[i]}-${minPrice}) = max(${prevDp}, ${sellProfit}) = ${curDp}` },
      ],
      note: {
        vi: `cur_dp = max(prev_dp=${prevDp}, price-min=${sellProfit}) = ${curDp}.`,
        en: `cur_dp = max(prev_dp=${prevDp}, price-min=${sellProfit}) = ${curDp}.`,
      },
    });

    // Line 7: prev_dp = cur_dp
    prevDp = curDp;
    steps.push({
      title: { vi: `prev_dp = ${prevDp}`, en: `prev_dp = ${prevDp}` },
      arr: [...prices], sub: prices.map((_, idx) => idx === i ? `◄ day ${idx}` : `day ${idx}`),
      highlight: [i], mark: [], codeLines: [7], codeBlock: 3,
      vars: [{ name: "prev_dp", value: prevDp }],
      note: {
        vi: `Gán prev_dp = cur_dp = ${prevDp}.`,
        en: `Set prev_dp = cur_dp = ${prevDp}.`,
      },
    });

    // Line 8: min_price = min(min_price, prices[i])
    const oldMin = minPrice;
    minPrice = Math.min(minPrice, prices[i]);
    steps.push({
      title: { vi: `min_price = min(${oldMin}, ${prices[i]}) = ${minPrice}`, en: `min_price = min(${oldMin}, ${prices[i]}) = ${minPrice}` },
      arr: [...prices], sub: prices.map((_, idx) => idx === i ? `◄ day ${idx}` : `day ${idx}`),
      highlight: [i], mark: [], codeLines: [8], codeBlock: 3,
      vars: [{ name: "min_price", value: `min(${oldMin}, ${prices[i]}) = ${minPrice}` }],
      note: {
        vi: `min_price = min(${oldMin}, ${prices[i]}) = ${minPrice}${minPrice < oldMin ? " 📉" : ""}.`,
        en: `min_price = min(${oldMin}, ${prices[i]}) = ${minPrice}${minPrice < oldMin ? " 📉" : ""}.`,
      },
    });
  }

  steps.push({
    title: { vi: `Kết quả: ${prevDp} 💰 (O(1) space!)`, en: `Result: ${prevDp} 💰 (O(1) space!)` },
    arr: [...prices], sub: prices.map((_, i) => `day ${i}`),
    highlight: [], mark: [], final: true, codeLines: [9], codeBlock: 3,
    vars: [{ name: "answer", value: prevDp }],
    note: { vi: `prev_dp = ${prevDp}. O(1) bộ nhớ!`, en: `prev_dp = ${prevDp}. O(1) memory!` },
  });
  return { original: [...prices], answer: prevDp, steps };
}

// ─── 122: Best Time to Buy and Sell Stock II ───
function buildSteps122(nums, params) {
  const approach = Number(params && params.approach) || 1;
  if (approach === 2) return buildSteps122DP(nums);
  return buildSteps122Greedy(nums);
}

function buildSteps122Greedy(nums) {
  const prices = nums;
  const n = prices.length;
  const steps = [];
  let profit = 0;

  // Line 3: profit = 0
  steps.push({
    title: { vi: "Khởi tạo profit = 0", en: "Initialize profit = 0" },
    arr: [...prices],
    sub: prices.map((_, i) => `day ${i}`),
    highlight: [], mark: [],
    codeLines: [3],
    vars: [{ name: "prices", value: `[${prices.join(",")}]` }, { name: "profit", value: 0 }],
    note: {
      vi: `💡 Greedy: cộng mọi đoạn tăng liên tiếp.\nNếu prices[i] > prices[i-1] → profit += chênh lệch.\nĐây tương đương mua-bán mỗi ngày lời.`,
      en: `💡 Greedy: collect every consecutive gain.\nIf prices[i] > prices[i-1] → profit += difference.\nThis equals buying/selling on every profitable day.`,
    },
  });

  for (let i = 1; i < n; i++) {
    const diff = prices[i] - prices[i - 1];

    // Line 4: for i in range(1, n)
    steps.push({
      title: { vi: `Vòng lặp i=${i}`, en: `Loop i=${i}` },
      arr: [...prices],
      sub: prices.map((_, idx) => `day ${idx}`),
      highlight: [i - 1, i],
      mark: [],
      codeLines: [4],
      vars: [
        { name: "i", value: i },
        { name: "prices[i]", value: prices[i] },
        { name: "prices[i-1]", value: prices[i - 1] },
        { name: "profit", value: profit },
      ],
      note: {
        vi: `So sánh prices[${i}]=${prices[i]} với prices[${i-1}]=${prices[i-1]}.`,
        en: `Compare prices[${i}]=${prices[i]} with prices[${i-1}]=${prices[i-1]}.`,
      },
    });

    // Line 5: if prices[i] > prices[i-1]
    const gained = diff > 0;
    steps.push({
      title: { vi: `${prices[i]} > ${prices[i-1]}? ${gained ? "✓" : "✗"}`, en: `${prices[i]} > ${prices[i-1]}? ${gained ? "✓" : "✗"}` },
      arr: [...prices],
      sub: prices.map((_, idx) => `day ${idx}`),
      highlight: [i - 1, i],
      mark: [],
      codeLines: [5],
      vars: [
        { name: `prices[${i}] > prices[${i-1}]?`, value: `${prices[i]} > ${prices[i-1]} → ${gained}` },
      ],
      note: {
        vi: gained
          ? `${prices[i]} > ${prices[i-1]} → giá TĂNG! Có lời → sẽ cộng vào profit.`
          : `${prices[i]} ≤ ${prices[i-1]} → giá GIẢM hoặc bằng. Không lời → bỏ qua.`,
        en: gained
          ? `${prices[i]} > ${prices[i-1]} → price UP! Profitable → will add to profit.`
          : `${prices[i]} ≤ ${prices[i-1]} → price DOWN or equal. No profit → skip.`,
      },
    });

    // Line 6: profit += prices[i] - prices[i-1] (only if gained)
    if (gained) {
      profit += diff;
      steps.push({
        title: { vi: `profit += ${diff} → profit = ${profit} 📈`, en: `profit += ${diff} → profit = ${profit} 📈` },
        arr: [...prices],
        sub: prices.map((_, idx) => `day ${idx}`),
        highlight: [i - 1, i],
        mark: [i],
        codeLines: [6],
        vars: [
          { name: `profit += ${prices[i]}-${prices[i-1]}`, value: `+= ${diff} → profit = ${profit}` },
        ],
        note: {
          vi: `Cộng chênh lệch: profit += ${prices[i]} - ${prices[i-1]} = ${diff}. Tổng profit = ${profit}.`,
          en: `Add gain: profit += ${prices[i]} - ${prices[i-1]} = ${diff}. Total profit = ${profit}.`,
        },
      });
    }
  }

  // Line 7: return profit
  steps.push({
    title: { vi: `Kết quả: profit = ${profit} 💰`, en: `Result: profit = ${profit} 💰` },
    arr: [...prices],
    sub: prices.map((_, i) => `day ${i}`),
    highlight: [], mark: [],
    final: true, codeLines: [7],
    vars: [{ name: "profit", value: profit }],
    note: {
      vi: `💰 Tổng lợi nhuận = ${profit}. Cộng tất cả đoạn giá tăng liên tiếp.`,
      en: `💰 Total profit = ${profit}. Sum of all consecutive price gains.`,
    },
  });
  return { original: [...prices], answer: profit, steps };
}

function buildSteps122DP(nums) {
  const prices = nums;
  const n = prices.length;
  const steps = [];
  let hold = -prices[0];
  let cash = 0;

  // Line 5: hold = -prices[0]
  steps.push({
    title: { vi: `hold = -prices[0] = ${hold}`, en: `hold = -prices[0] = ${hold}` },
    arr: [...prices],
    sub: prices.map((_, i) => `day ${i}`),
    highlight: [0], mark: [],
    codeLines: [5], codeBlock: 2,
    vars: [{ name: "hold", value: hold }, { name: "cash", value: "chưa gán" }],
    note: {
      vi: `hold = profit tối đa khi ĐANG GIỮ stock. Mua ngày 0 → hold = -${prices[0]}.`,
      en: `hold = max profit while HOLDING stock. Buy day 0 → hold = -${prices[0]}.`,
    },
  });

  // Line 6: cash = 0
  steps.push({
    title: { vi: "cash = 0", en: "cash = 0" },
    arr: [...prices],
    sub: prices.map((_, i) => `day ${i}`),
    highlight: [0], mark: [],
    codeLines: [6], codeBlock: 2,
    vars: [{ name: "hold", value: hold }, { name: "cash", value: 0 }],
    note: {
      vi: `cash = profit tối đa khi KHÔNG GIỮ stock. Ban đầu = 0 (chưa giao dịch).`,
      en: `cash = max profit while NOT HOLDING stock. Initially = 0 (no transaction yet).`,
    },
  });

  for (let i = 1; i < n; i++) {
    const oldHold = hold;
    const oldCash = cash;

    // Line 7: for i in range(1, n)
    steps.push({
      title: { vi: `Vòng lặp i=${i}`, en: `Loop i=${i}` },
      arr: [...prices],
      sub: prices.map((_, idx) => `day ${idx}`),
      highlight: [i], mark: [],
      codeLines: [7], codeBlock: 2,
      vars: [
        { name: "i", value: i },
        { name: "prices[i]", value: prices[i] },
        { name: "hold", value: hold },
        { name: "cash", value: cash },
      ],
      note: {
        vi: `Xét ngày ${i}: prices[${i}]=${prices[i]}.`,
        en: `Consider day ${i}: prices[${i}]=${prices[i]}.`,
      },
    });

    // Line 8: hold = max(hold, cash - prices[i])
    hold = Math.max(oldHold, oldCash - prices[i]);
    steps.push({
      title: { vi: `hold = max(${oldHold}, ${oldCash}-${prices[i]}) = ${hold}`, en: `hold = max(${oldHold}, ${oldCash}-${prices[i]}) = ${hold}` },
      arr: [...prices],
      sub: prices.map((_, idx) => `day ${idx}`),
      highlight: [i], mark: [],
      codeLines: [8], codeBlock: 2,
      vars: [
        { name: "hold = max(keep, buy)", value: `max(${oldHold}, ${oldCash}-${prices[i]}) = max(${oldHold}, ${oldCash - prices[i]}) = ${hold}` },
      ],
      note: {
        vi: `hold = max(giữ nguyên=${oldHold}, mua hôm nay=cash-price=${oldCash}-${prices[i]}=${oldCash-prices[i]}) = ${hold}.`,
        en: `hold = max(keep=${oldHold}, buy today=cash-price=${oldCash}-${prices[i]}=${oldCash-prices[i]}) = ${hold}.`,
      },
    });

    // Line 9: cash = max(cash, hold + prices[i])
    cash = Math.max(oldCash, hold + prices[i]);
    steps.push({
      title: { vi: `cash = max(${oldCash}, ${hold}+${prices[i]}) = ${cash}`, en: `cash = max(${oldCash}, ${hold}+${prices[i]}) = ${cash}` },
      arr: [...prices],
      sub: prices.map((_, idx) => `day ${idx}`),
      highlight: [i], mark: [],
      codeLines: [9], codeBlock: 2,
      vars: [
        { name: "cash = max(keep, sell)", value: `max(${oldCash}, ${hold}+${prices[i]}) = max(${oldCash}, ${hold+prices[i]}) = ${cash}` },
      ],
      note: {
        vi: `cash = max(giữ nguyên=${oldCash}, bán hôm nay=hold+price=${hold}+${prices[i]}=${hold+prices[i]}) = ${cash}.`,
        en: `cash = max(keep=${oldCash}, sell today=hold+price=${hold}+${prices[i]}=${hold+prices[i]}) = ${cash}.`,
      },
    });
  }

  // Line 10: return cash
  steps.push({
    title: { vi: `Kết quả: cash = ${cash} 💰`, en: `Result: cash = ${cash} 💰` },
    arr: [...prices],
    sub: prices.map((_, i) => `day ${i}`),
    highlight: [], mark: [],
    final: true, codeLines: [10], codeBlock: 2,
    vars: [{ name: "cash", value: cash }, { name: "hold", value: hold }],
    note: {
      vi: `💰 Max profit = cash = ${cash}. Trạng thái cuối: không giữ stock.`,
      en: `💰 Max profit = cash = ${cash}. Final state: not holding any stock.`,
    },
  });
  return { original: [...prices], answer: cash, steps };
}

// ─── 714: Best Time to Buy and Sell Stock with Transaction Fee ───
function buildSteps714(nums, params) {
  const prices = nums;
  const fee = Number(params && params.fee !== undefined ? params.fee : 2);
  const steps = [];

  if (!prices.length) {
    steps.push({
      title: { vi: "Khong co ngay giao dich", en: "No trading days" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [3],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "Khong co gia co phieu nao, loi nhuan toi da la 0.",
        en: "No prices are provided, so the maximum profit is 0.",
      },
    });
    return { original: [], answer: 0, steps };
  }

  let hold = -prices[0];
  let cash = 0;

  steps.push({
    title: { vi: `hold = -prices[0] = ${hold}`, en: `hold = -prices[0] = ${hold}` },
    arr: [...prices],
    sub: prices.map((_, i) => `day ${i}`),
    highlight: [0],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "fee", value: fee },
      { name: "hold", value: hold },
      { name: "cash", value: cash },
    ],
    note: {
      vi: `hold la loi nhuan tot nhat khi dang giu co phieu. Mua ngay 0: hold = -${prices[0]}.`,
      en: `hold is the best profit while holding a stock. Buy on day 0: hold = -${prices[0]}.`,
    },
  });

  steps.push({
    title: { vi: "cash = 0", en: "cash = 0" },
    arr: [...prices],
    sub: prices.map((_, i) => `day ${i}`),
    highlight: [0],
    mark: [],
    codeLines: [4],
    vars: [
      { name: "fee", value: fee },
      { name: "hold", value: hold },
      { name: "cash", value: cash },
    ],
    note: {
      vi: "cash la loi nhuan tot nhat khi khong giu co phieu. Ban dau chua giao dich nen bang 0.",
      en: "cash is the best profit while not holding a stock. Initially it is 0.",
    },
  });

  for (let i = 1; i < prices.length; i++) {
    const price = prices[i];
    const oldHold = hold;
    const oldCash = cash;

    steps.push({
      title: { vi: `Ngay ${i}: price = ${price}`, en: `Day ${i}: price = ${price}` },
      arr: [...prices],
      sub: prices.map((_, idx) => `day ${idx}`),
      highlight: [i],
      mark: [],
      codeLines: [5],
      vars: [
        { name: "i", value: i },
        { name: "price", value: price },
        { name: "hold", value: oldHold },
        { name: "cash", value: oldCash },
        { name: "fee", value: fee },
      ],
      note: {
        vi: `Xet ngay ${i}. Co 2 trang thai: giu co phieu (hold) hoac khong giu (cash).`,
        en: `Consider day ${i}. There are two states: holding stock (hold) or not holding (cash).`,
      },
    });

    const buyCandidate = oldCash - price;
    hold = Math.max(oldHold, buyCandidate);
    steps.push({
      title: { vi: `hold = max(${oldHold}, ${oldCash}-${price}) = ${hold}`, en: `hold = max(${oldHold}, ${oldCash}-${price}) = ${hold}` },
      arr: [...prices],
      sub: prices.map((_, idx) => `day ${idx}`),
      highlight: [i],
      mark: hold === buyCandidate && buyCandidate > oldHold ? [i] : [],
      codeLines: [6],
      vars: [
        { name: "keep holding", value: oldHold },
        { name: "buy today", value: `${oldCash} - ${price} = ${buyCandidate}` },
        { name: "hold", value: hold },
      ],
      note: {
        vi: `Chon tot hon giua giu trang thai cu (${oldHold}) va mua hom nay (${buyCandidate}).`,
        en: `Choose the better of keeping the old hold (${oldHold}) and buying today (${buyCandidate}).`,
      },
    });

    const sellCandidate = oldHold + price - fee;
    cash = Math.max(oldCash, sellCandidate);
    steps.push({
      title: { vi: `cash = max(${oldCash}, ${oldHold}+${price}-${fee}) = ${cash}`, en: `cash = max(${oldCash}, ${oldHold}+${price}-${fee}) = ${cash}` },
      arr: [...prices],
      sub: prices.map((_, idx) => `day ${idx}`),
      highlight: [i],
      mark: cash === sellCandidate && sellCandidate > oldCash ? [i] : [],
      codeLines: [7],
      vars: [
        { name: "keep cash", value: oldCash },
        { name: "sell today", value: `${oldHold} + ${price} - ${fee} = ${sellCandidate}` },
        { name: "cash", value: cash },
      ],
      note: {
        vi: `Khi ban phai tru phi ${fee}. Chon tot hon giua khong ban (${oldCash}) va ban hom nay (${sellCandidate}).`,
        en: `Selling pays the fee ${fee}. Choose the better of not selling (${oldCash}) and selling today (${sellCandidate}).`,
      },
    });
  }

  steps.push({
    title: { vi: `Ket qua: cash = ${cash}`, en: `Result: cash = ${cash}` },
    arr: [...prices],
    sub: prices.map((_, i) => `day ${i}`),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [8],
    vars: [
      { name: "answer", value: cash },
      { name: "hold", value: hold },
      { name: "cash", value: cash },
    ],
    note: {
      vi: `Ket thuc nen khong giu co phieu. Loi nhuan toi da = cash = ${cash}.`,
      en: `We finish without holding stock. Maximum profit = cash = ${cash}.`,
    },
  });

  return { original: [...prices], answer: cash, steps };
}

// ─── 123: Best Time to Buy and Sell Stock III ───
function buildSteps123(nums) {
  const prices = nums;
  const steps = [];
  const labels = prices.map((_, i) => `day ${i}`);

  if (!prices.length) {
    steps.push({
      title: { vi: "Khong co ngay giao dich", en: "No trading days" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [3],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "Khong co gia co phieu nao, loi nhuan toi da la 0.",
        en: "No prices are provided, so the maximum profit is 0.",
      },
    });
    return { original: [], answer: 0, steps };
  }

  let buy1 = -prices[0];
  let sell1 = 0;
  let buy2 = -prices[0];
  let sell2 = 0;

  steps.push({
    title: { vi: `buy1 = buy2 = -prices[0] = ${buy1}`, en: `buy1 = buy2 = -prices[0] = ${buy1}` },
    arr: [...prices],
    sub: labels,
    highlight: [0],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "price", value: prices[0] },
      { name: "buy1", value: buy1 },
      { name: "sell1", value: sell1 },
      { name: "buy2", value: buy2 },
      { name: "sell2", value: sell2 },
    ],
    note: {
      vi: `Sau ngay 0, neu mua lan 1 thi buy1 = -${prices[0]}. Trang thai buy2 cung khoi tao bang -${prices[0]} de cong thuc chay gon.`,
      en: `After day 0, buying the first stock gives buy1 = -${prices[0]}. buy2 is initialized the same way so the rolling formulas stay compact.`,
    },
  });

  steps.push({
    title: { vi: "sell1 = sell2 = 0", en: "sell1 = sell2 = 0" },
    arr: [...prices],
    sub: labels,
    highlight: [0],
    mark: [],
    codeLines: [4],
    vars: [
      { name: "buy1", value: buy1 },
      { name: "sell1", value: sell1 },
      { name: "buy2", value: buy2 },
      { name: "sell2", value: sell2 },
    ],
    note: {
      vi: "Ban dau chua ban lan nao nen loi nhuan sau lan ban 1 va ban 2 deu la 0.",
      en: "Initially no sale has happened, so profit after the first and second sale is 0.",
    },
  });

  for (let i = 1; i < prices.length; i++) {
    const price = prices[i];

    steps.push({
      title: { vi: `Ngay ${i}: price = ${price}`, en: `Day ${i}: price = ${price}` },
      arr: [...prices],
      sub: labels,
      highlight: [i],
      mark: [],
      codeLines: [5],
      vars: [
        { name: "i", value: i },
        { name: "price", value: price },
        { name: "buy1", value: buy1 },
        { name: "sell1", value: sell1 },
        { name: "buy2", value: buy2 },
        { name: "sell2", value: sell2 },
      ],
      note: {
        vi: `Xet ngay ${i}. Moi ngay cap nhat 4 trang thai theo thu tu: mua 1, ban 1, mua 2, ban 2.`,
        en: `Consider day ${i}. Update four states in order: first buy, first sell, second buy, second sell.`,
      },
    });

    const oldBuy1 = buy1;
    const buy1Candidate = -price;
    buy1 = Math.max(buy1, buy1Candidate);
    steps.push({
      title: { vi: `buy1 = max(${oldBuy1}, -${price}) = ${buy1}`, en: `buy1 = max(${oldBuy1}, -${price}) = ${buy1}` },
      arr: [...prices],
      sub: labels,
      highlight: [i],
      mark: buy1 === buy1Candidate && buy1Candidate > oldBuy1 ? [i] : [],
      codeLines: [6],
      vars: [
        { name: "keep buy1", value: oldBuy1 },
        { name: "buy first today", value: `-${price} = ${buy1Candidate}` },
        { name: "buy1", value: buy1 },
      ],
      note: {
        vi: `Trang thai sau khi mua lan 1: giu gia tri cu ${oldBuy1} hoac mua hom nay thanh ${buy1Candidate}.`,
        en: `State after the first buy: keep ${oldBuy1} or buy today for ${buy1Candidate}.`,
      },
    });

    const oldSell1 = sell1;
    const sell1Candidate = buy1 + price;
    sell1 = Math.max(sell1, sell1Candidate);
    steps.push({
      title: { vi: `sell1 = max(${oldSell1}, ${buy1}+${price}) = ${sell1}`, en: `sell1 = max(${oldSell1}, ${buy1}+${price}) = ${sell1}` },
      arr: [...prices],
      sub: labels,
      highlight: [i],
      mark: sell1 === sell1Candidate && sell1Candidate > oldSell1 ? [i] : [],
      codeLines: [7],
      vars: [
        { name: "keep sell1", value: oldSell1 },
        { name: "sell first today", value: `${buy1} + ${price} = ${sell1Candidate}` },
        { name: "sell1", value: sell1 },
      ],
      note: {
        vi: `Trang thai sau khi ban lan 1: giu loi nhuan cu ${oldSell1} hoac ban hom nay duoc ${sell1Candidate}.`,
        en: `State after the first sale: keep ${oldSell1} or sell today for ${sell1Candidate}.`,
      },
    });

    const oldBuy2 = buy2;
    const buy2Candidate = sell1 - price;
    buy2 = Math.max(buy2, buy2Candidate);
    steps.push({
      title: { vi: `buy2 = max(${oldBuy2}, ${sell1}-${price}) = ${buy2}`, en: `buy2 = max(${oldBuy2}, ${sell1}-${price}) = ${buy2}` },
      arr: [...prices],
      sub: labels,
      highlight: [i],
      mark: buy2 === buy2Candidate && buy2Candidate > oldBuy2 ? [i] : [],
      codeLines: [8],
      vars: [
        { name: "keep buy2", value: oldBuy2 },
        { name: "buy second today", value: `${sell1} - ${price} = ${buy2Candidate}` },
        { name: "buy2", value: buy2 },
      ],
      note: {
        vi: `Mua lan 2 dung loi nhuan da co sau lan ban 1: sell1 - price = ${sell1} - ${price}.`,
        en: `The second buy uses profit already earned after the first sale: sell1 - price = ${sell1} - ${price}.`,
      },
    });

    const oldSell2 = sell2;
    const sell2Candidate = buy2 + price;
    sell2 = Math.max(sell2, sell2Candidate);
    steps.push({
      title: { vi: `sell2 = max(${oldSell2}, ${buy2}+${price}) = ${sell2}`, en: `sell2 = max(${oldSell2}, ${buy2}+${price}) = ${sell2}` },
      arr: [...prices],
      sub: labels,
      highlight: [i],
      mark: sell2 === sell2Candidate && sell2Candidate > oldSell2 ? [i] : [],
      codeLines: [9],
      vars: [
        { name: "keep sell2", value: oldSell2 },
        { name: "sell second today", value: `${buy2} + ${price} = ${sell2Candidate}` },
        { name: "sell2", value: sell2 },
      ],
      note: {
        vi: `Trang thai sau khi ban lan 2: day la loi nhuan tot nhat voi toi da 2 giao dich.`,
        en: `State after the second sale: this is the best profit with at most two transactions.`,
      },
    });
  }

  steps.push({
    title: { vi: `Ket qua: sell2 = ${sell2}`, en: `Result: sell2 = ${sell2}` },
    arr: [...prices],
    sub: labels,
    highlight: [],
    mark: [],
    final: true,
    codeLines: [10],
    vars: [
      { name: "buy1", value: buy1 },
      { name: "sell1", value: sell1 },
      { name: "buy2", value: buy2 },
      { name: "sell2", value: sell2 },
      { name: "answer", value: sell2 },
    ],
    note: {
      vi: `Ket thuc khong giu co phieu. Loi nhuan toi da voi toi da 2 giao dich la sell2 = ${sell2}.`,
      en: `We finish without holding stock. Maximum profit with at most two transactions is sell2 = ${sell2}.`,
    },
  });

  return { original: [...prices], answer: sell2, steps };
}

/** LeetCode 3947: Maximum Number of Items From Sale II. */
// LeetCode 252: Meeting Rooms.
// Sort by start time, then only adjacent meetings can reveal an overlap.
function buildSteps252(input) {
  const rawParts = String(input || "").split(";").map((part) => part.trim()).filter(Boolean);
  const parsed = rawParts.map((part) => part.split(",").map((value) => Number(value.trim())));
  const valid = parsed.every((interval) => (
    interval.length === 2
    && Number.isFinite(interval[0])
    && Number.isFinite(interval[1])
    && interval[0] < interval[1]
  ));
  const original = valid ? parsed.map((interval) => [...interval]) : [];
  const steps = [];
  const display = (intervals) => intervals.map(([start, end]) => `[${start},${end}]`);
  const timeline = (intervals, active = [], processed = [], comparison = null, sorted = true) => ({
    intervals: intervals.map(([start, end], index) => ({ start, end, index })),
    active,
    processed,
    comparison,
    sorted,
  });

  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: rawParts,
      highlight: [],
      mark: [],
      codeLines: [2],
      vars: [{ name: "input", value: String(input || "") }],
      note: {
        vi: "Mỗi cuộc họp phải có dạng start,end với start < end; các cuộc họp cách nhau bởi dấu ';'.",
        en: "Each meeting must be start,end with start < end; separate meetings with ';'.",
      },
      final: true,
    });
    return { original, answer: null, steps };
  }

  steps.push({
    title: { vi: "Danh sách cuộc họp ban đầu", en: "Original meeting schedule" },
    arr: display(original),
    meetingTimelineView: timeline(original, [], [], null, false),
    highlight: [],
    mark: [],
    codeLines: [2],
    vars: [{ name: "intervals", value: display(original).join(" ") }, { name: "n", value: original.length }],
    note: {
      vi: "Mục tiêu: kiểm tra một người có thể tham dự toàn bộ cuộc họp mà không bị trùng giờ hay không.",
      en: "Goal: determine whether one person can attend every meeting without a time conflict.",
    },
  });

  const intervals = original.map((interval) => [...interval]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  steps.push({
    title: { vi: "Sắp xếp theo thời gian bắt đầu", en: "Sort by start time" },
    arr: display(intervals),
    meetingTimelineView: timeline(intervals, intervals.map((_, index) => index)),
    highlight: intervals.map((_, index) => index),
    mark: [],
    codeLines: [3],
    vars: [{ name: "intervals", value: display(intervals).join(" ") }],
    note: {
      vi: "Sau khi sắp xếp, chỉ cần so sánh thời điểm bắt đầu hiện tại với thời điểm kết thúc ngay trước đó.",
      en: "After sorting, compare each start time only with the immediately preceding end time.",
    },
  });

  for (let i = 1; i < intervals.length; i++) {
    const previous = intervals[i - 1];
    const current = intervals[i];
    const marks = Array.from({ length: i - 1 }, (_, index) => index);
    steps.push({
      title: { vi: `Xét cặp cuộc họp ${i} và ${i + 1}`, en: `Inspect meetings ${i} and ${i + 1}` },
      arr: display(intervals),
      meetingTimelineView: timeline(intervals, [i - 1, i], marks, {
        previousIndex: i - 1, currentIndex: i, previousEnd: previous[1], currentStart: current[0], overlap: null,
      }),
      highlight: [i - 1, i],
      mark: marks,
      codeLines: [4],
      vars: [{ name: "i", value: i }, { name: "previous", value: `[${previous}]` }, { name: "current", value: `[${current}]` }],
      note: {
        vi: `So sánh [${previous}] với [${current}].`,
        en: `Compare [${previous}] with [${current}].`,
      },
    });
    steps.push({
      title: { vi: `prev_end = ${previous[1]}`, en: `prev_end = ${previous[1]}` },
      arr: display(intervals),
      meetingTimelineView: timeline(intervals, [i - 1], marks, {
        previousIndex: i - 1, currentIndex: i, previousEnd: previous[1], currentStart: current[0], overlap: null,
      }),
      highlight: [i - 1],
      mark: marks,
      codeLines: [5],
      vars: [{ name: "prev_end", value: previous[1] }],
      note: { vi: "Lấy thời điểm kết thúc của cuộc họp trước.", en: "Read the previous meeting's end time." },
    });
    steps.push({
      title: { vi: `current_start = ${current[0]}`, en: `current_start = ${current[0]}` },
      arr: display(intervals),
      meetingTimelineView: timeline(intervals, [i], marks, {
        previousIndex: i - 1, currentIndex: i, previousEnd: previous[1], currentStart: current[0], overlap: null,
      }),
      highlight: [i],
      mark: marks,
      codeLines: [6],
      vars: [{ name: "current_start", value: current[0] }, { name: "prev_end", value: previous[1] }],
      note: { vi: "Lấy thời điểm bắt đầu của cuộc họp hiện tại.", en: "Read the current meeting's start time." },
    });

    const overlap = current[0] < previous[1];
    steps.push({
      title: {
        vi: `${current[0]} < ${previous[1]}? ${overlap ? "Đúng — bị trùng" : "Sai — không trùng"}`,
        en: `${current[0]} < ${previous[1]}? ${overlap ? "True — conflict" : "False — no conflict"}`,
      },
      arr: display(intervals),
      meetingTimelineView: timeline(intervals, [i - 1, i], marks, {
        previousIndex: i - 1, currentIndex: i, previousEnd: previous[1], currentStart: current[0], overlap,
      }),
      highlight: [i - 1, i],
      mark: marks,
      codeLines: [7],
      vars: [{ name: "overlap", value: overlap }, { name: "current_start", value: current[0] }, { name: "prev_end", value: previous[1] }],
      note: overlap
        ? { vi: "Cuộc họp hiện tại bắt đầu trước khi cuộc họp trước kết thúc, nên không thể tham dự cả hai.", en: "The current meeting starts before the previous one ends, so both cannot be attended." }
        : { vi: "Cuộc họp trước đã kết thúc khi cuộc họp hiện tại bắt đầu; tiếp tục kiểm tra.", en: "The previous meeting has ended by the current start time; continue checking." },
    });

    if (overlap) {
      steps.push({
        title: { vi: "Kết quả: false", en: "Result: false" },
        arr: display(intervals),
        meetingTimelineView: timeline(intervals, [i - 1, i], marks, {
          previousIndex: i - 1, currentIndex: i, previousEnd: previous[1], currentStart: current[0], overlap: true,
        }),
        highlight: [i - 1, i],
        mark: marks,
        codeLines: [8],
        vars: [{ name: "answer", value: false }, { name: "conflict", value: `[${previous}] ↔ [${current}]` }],
        note: { vi: "Đã tìm thấy một cặp trùng giờ, có thể dừng ngay.", en: "A conflicting pair was found, so the scan can stop immediately." },
        final: true,
      });
      return { original, answer: false, steps };
    }
  }

  steps.push({
    title: { vi: "Kết quả: true", en: "Result: true" },
    arr: display(intervals),
    meetingTimelineView: timeline(intervals, [], intervals.map((_, index) => index)),
    highlight: [],
    mark: intervals.map((_, index) => index),
    codeLines: [9],
    vars: [{ name: "answer", value: true }],
    note: { vi: "Không có hai cuộc họp nào chồng nhau, nên có thể tham dự tất cả.", en: "No meetings overlap, so every meeting can be attended." },
    final: true,
  });
  return { original, answer: true, steps };
}

function buildSteps3947(input, params) {
  const steps = [];
  const initialBudget = Number(params && params.budget);
  const parsed = String(input || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split(",").map((value) => Number(value.trim())));
  const valid = Number.isInteger(initialBudget) && initialBudget > 0 && parsed.length > 0 &&
    parsed.every((item) => item.length === 2 && item.every(Number.isInteger) &&
      item[0] >= 1 && item[0] <= parsed.length && item[1] >= 1);

  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [], highlight: [], mark: [], final: true, codeLines: [2],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "Dùng định dạng factor,price;factor,price;... Factor thuộc [1,n], price và budget phải dương.",
        en: "Use factor,price;factor,price;... Factor must be in [1,n], and price and budget must be positive.",
      },
    });
    return { original: [], answer: 0, steps };
  }

  const items = parsed.map(([factor, price], index) => ({ index, factor, price, gain: 0 }));
  const n = items.length;
  const maxFactor = Math.max(...items.map((item) => item.factor));
  const chart = (list, highlight = [], mark = []) => ({
    arr: list.map((item) => item.price),
    sub: list.map((item) => `#${item.index} f=${item.factor} · g=${item.gain}`),
    highlight,
    mark,
  });
  const push = (title, codeLine, list, highlight, mark, vars, note) => steps.push({
    title, codeLines: [codeLine], ...chart(list, highlight, mark), vars, note,
  });

  push(
    { vi: `n = ${n}`, en: `n = ${n}` }, 3, items, [], [],
    [{ name: "n", value: n }, { name: "budget", value: initialBudget }],
    { vi: "Mỗi cột là một loại hàng; chiều cao là price, nhãn f là factor.", en: "Each bar is an item type; height is price and f is its factor." }
  );
  push(
    { vi: `max_factor = ${maxFactor}`, en: `max_factor = ${maxFactor}` }, 4, items,
    items.map((_, i) => i), [], [{ name: "max_factor", value: maxFactor }],
    { vi: "Ta chỉ cần sàng đến factor lớn nhất.", en: "The sieve only needs to reach the largest factor." }
  );

  const freq = Array(maxFactor + 1).fill(0);
  push(
    { vi: "Tạo bảng tần suất", en: "Create the frequency table" }, 5, items, [], [],
    [{ name: "freq", value: `[${freq.join(", ")}]` }],
    { vi: "freq[x] đếm số loại hàng có factor bằng x.", en: "freq[x] counts item types with factor x." }
  );
  for (let i = 0; i < n; i++) {
    const item = items[i];
    push(
      { vi: `Đọc item #${i}: factor=${item.factor}`, en: `Read item #${i}: factor=${item.factor}` },
      6, items, [i], [], [{ name: "factor", value: item.factor }, { name: "price", value: item.price }],
      { vi: "Lấy factor và price của item hiện tại.", en: "Read the current item's factor and price." }
    );
    freq[item.factor]++;
    push(
      { vi: `freq[${item.factor}] = ${freq[item.factor]}`, en: `freq[${item.factor}] = ${freq[item.factor]}` },
      7, items, [i], [], [{ name: "freq", value: `[${freq.join(", ")}]` }],
      { vi: `Đã thấy ${freq[item.factor]} item có factor ${item.factor}.`, en: `${freq[item.factor]} item type(s) now have factor ${item.factor}.` }
    );
  }

  const multiples = Array(maxFactor + 1).fill(0);
  push(
    { vi: "Tạo bảng multiples", en: "Create the multiples table" }, 8, items, [], [],
    [{ name: "multiples", value: `[${multiples.join(", ")}]` }],
    { vi: "multiples[d] sẽ đếm các item có factor là bội của d.", en: "multiples[d] will count items whose factor is a multiple of d." }
  );
  for (let d = 1; d <= maxFactor; d++) {
    const divisibleIndexes = items.map((item, i) => item.factor % d === 0 ? i : -1).filter((i) => i >= 0);
    push(
      { vi: `Xét divisor d=${d}`, en: `Inspect divisor d=${d}` }, 9, items, divisibleIndexes, [],
      [{ name: "d", value: d }],
      { vi: `Các cột sáng có factor chia hết cho ${d}.`, en: `Highlighted bars have factors divisible by ${d}.` }
    );
    for (let m = d; m <= maxFactor; m += d) {
      const sameFactor = items.map((item, i) => item.factor === m ? i : -1).filter((i) => i >= 0);
      push(
        { vi: `Đọc bội m=${m}`, en: `Read multiple m=${m}` }, 10, items, sameFactor, [],
        [{ name: "d", value: d }, { name: "m", value: m }, { name: `freq[${m}]`, value: freq[m] }],
        { vi: `${m} là một bội của ${d}.`, en: `${m} is a multiple of ${d}.` }
      );
      multiples[d] += freq[m];
      push(
        { vi: `multiples[${d}] = ${multiples[d]}`, en: `multiples[${d}] = ${multiples[d]}` },
        11, items, sameFactor, [], [{ name: "multiples", value: `[${multiples.join(", ")}]` }],
        { vi: `Cộng freq[${m}]=${freq[m]} vào bộ đếm của ${d}.`, en: `Add freq[${m}]=${freq[m]} to the count for ${d}.` }
      );
    }
  }

  for (const item of items) item.gain = multiples[item.factor] - 1;
  push(
    { vi: "Tính gain của từng item", en: "Compute every item's gain" }, 12, items,
    items.map((_, i) => i), [], items.map((item) => ({ name: `gain[${item.index}]`, value: item.gain })),
    {
      vi: "Trừ chính item i. Mua c bản item i nhận tối đa min(c, gain[i]) bản miễn phí.",
      en: "Exclude item i itself. Buying c copies of i earns at most min(c, gain[i]) free copies.",
    }
  );

  const boosted = items.map((item) => ({ ...item })).sort((a, b) => a.price - b.price || a.index - b.index);
  push(
    { vi: "Sắp xếp các lượt nhân đôi theo price", en: "Sort boosted purchases by price" }, 13, boosted,
    boosted.map((_, i) => i), [], [{ name: "order", value: boosted.map((item) => `#${item.index}`).join(" → ") }],
    {
      vi: "Mỗi lượt trong gain cho 1 món mua + 1 món miễn phí, nên ưu tiên price thấp.",
      en: "Each gain slot yields one purchased plus one free copy, so lower prices come first.",
    }
  );

  const cheapest = Math.min(...items.map((item) => item.price));
  push(
    { vi: `cheapest = ${cheapest}`, en: `cheapest = ${cheapest}` }, 14, boosted,
    boosted.map((item, i) => item.price === cheapest ? i : -1).filter((i) => i >= 0), [],
    [{ name: "cheapest", value: cheapest }, { name: "boost cutoff", value: `< ${2 * cheapest}` }],
    {
      vi: `Lượt nhân đôi giá ≥ ${2 * cheapest} không tốt hơn mua 2 món thường giá ${cheapest}.`,
      en: `A boosted slot costing ≥ ${2 * cheapest} cannot beat two regular copies at ${cheapest}.`,
    }
  );

  let budget = initialBudget;
  let total = 0;
  let boostedBought = 0;
  const chosen = new Set();
  push(
    { vi: "Khởi tạo total = 0", en: "Initialize total = 0" }, 15, boosted, [], [],
    [{ name: "total", value: total }, { name: "budget", value: budget }],
    { vi: "total sẽ đếm cả bản mua và bản miễn phí từ các lượt nhân đôi.", en: "total counts purchased and free copies from boosted slots." }
  );

  for (let i = 0; i < boosted.length; i++) {
    const item = boosted[i];
    const marks = () => [...chosen];
    push(
      { vi: `Xét #${item.index}: price=${item.price}, limit=${item.gain}`, en: `Inspect #${item.index}: price=${item.price}, limit=${item.gain}` },
      16, boosted, [i], marks(),
      [{ name: "price", value: item.price }, { name: "limit", value: item.gain }, { name: "budget", value: budget }],
      { vi: `Item này có ${item.gain} lượt mua được nhân đôi.`, en: `This item has ${item.gain} boosted purchase slot(s).` }
    );
    const stopByPrice = item.price >= 2 * cheapest;
    push(
      { vi: `price >= 2 × cheapest? ${stopByPrice}`, en: `price >= 2 × cheapest? ${stopByPrice}` },
      17, boosted, [i], marks(),
      [{ name: "price", value: item.price }, { name: "2 × cheapest", value: 2 * cheapest }, { name: "stop", value: stopByPrice }],
      stopByPrice
        ? { vi: "Dừng: các lượt sau không rẻ hơn 2 món thường.", en: "Stop: later slots are no cheaper than two regular copies." }
        : { vi: "Lượt này có lợi nếu còn budget và gain.", en: "This slot is useful while budget and gain remain." }
    );
    if (stopByPrice) break;

    const affordable = Math.floor(budget / item.price);
    const take = Math.min(item.gain, affordable);
    push(
      { vi: `take = min(${item.gain}, ${affordable}) = ${take}`, en: `take = min(${item.gain}, ${affordable}) = ${take}` },
      18, boosted, [i], marks(),
      [{ name: "limit", value: item.gain }, { name: "affordable", value: affordable }, { name: "take", value: take }],
      { vi: `Chọn ${take} lượt nhân đôi từ item #${item.index}.`, en: `Take ${take} boosted slot(s) from item #${item.index}.` }
    );
    total += 2 * take;
    boostedBought += take;
    if (take > 0) chosen.add(i);
    push(
      { vi: `total += 2 × ${take} → ${total}`, en: `total += 2 × ${take} → ${total}` },
      19, boosted, [i], marks(),
      [{ name: "purchased", value: boostedBought }, { name: "free", value: boostedBought }, { name: "total", value: total }],
      { vi: `${take} lượt tạo ${take} món mua và ${take} món miễn phí.`, en: `${take} slots create ${take} purchased and ${take} free copies.` }
    );
    const spent = take * item.price;
    budget -= spent;
    push(
      { vi: `budget -= ${spent} → ${budget}`, en: `budget -= ${spent} → ${budget}` },
      20, boosted, [i], marks(),
      [{ name: "spent", value: spent }, { name: "budget", value: budget }],
      { vi: `Còn ${budget} ngân sách.`, en: `${budget} budget remains.` }
    );
    const partial = take < item.gain;
    push(
      { vi: `take < limit? ${partial}`, en: `take < limit? ${partial}` }, 21, boosted, [i], marks(),
      [{ name: "take", value: take }, { name: "limit", value: item.gain }, { name: "stop", value: partial }],
      partial
        ? { vi: "Không đủ tiền mua hết batch; các batch sau đắt hơn nên dừng.", en: "This batch cannot be completed; later batches cost more, so stop." }
        : { vi: "Đã dùng hết gain của item này; xét item kế tiếp.", en: "This item's gain is exhausted; inspect the next item." }
    );
    if (partial) break;
  }

  const regular = Math.floor(budget / cheapest);
  const answer = total + regular;
  steps.push({
    title: { vi: `Kết quả: ${total} + ${regular} = ${answer}`, en: `Result: ${total} + ${regular} = ${answer}` },
    codeLines: [22], ...chart(boosted, [], [...chosen]), final: true,
    vars: [
      { name: "boosted copies", value: total },
      { name: "regular copies", value: `${budget} // ${cheapest} = ${regular}` },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Dùng tiền còn lại mua ${regular} bản của món rẻ nhất. Tổng tối đa là ${answer}.`,
      en: `Use the remainder for ${regular} copies of the cheapest item. The maximum total is ${answer}.`,
    },
  });
  return { original: parsed.map((item) => [...item]), answer, steps };
}

/** LeetCode 4000: Largest Integer With Given Digit Sum. */
function buildSteps4000(input, params) {
  const n = Number(Array.isArray(input) ? input[0] : input);
  const targetSum = Number(params.s);
  const steps = [];
  const emptyDigits = Array(n).fill("·");

  steps.push({
    title: { vi: "Kiểm tra giới hạn tổng chữ số", en: "Check the digit-sum limit" },
    arr: [...emptyDigits],
    highlight: [],
    codeLines: [3],
    vars: [
      { name: "n", value: n },
      { name: "s", value: targetSum },
      { name: "maximum sum = 9 * n", value: 9 * n },
    ],
    note: {
      vi: `Mỗi chữ số lớn nhất là 9, nên ${n} chữ số có tổng tối đa ${9 * n}. Trước tiên kiểm tra s=${targetSum} có khả thi không.`,
      en: `Each digit is at most 9, so ${n} digits can sum to at most ${9 * n}. First check whether s=${targetSum} is feasible.`,
    },
  });

  if (targetSum > 9 * n) {
    steps.push({
      title: { vi: "Không thể tạo số hợp lệ", en: "No valid integer exists" },
      arr: [...emptyDigits],
      highlight: [],
      codeLines: [4],
      final: true,
      vars: [
        { name: "s", value: targetSum },
        { name: "9 * n", value: 9 * n },
        { name: "answer", value: -1 },
      ],
      note: {
        vi: `${targetSum} > ${9 * n}, vì vậy không có số gồm tối đa ${n} chữ số nào đạt tổng này. Trả về -1.`,
        en: `${targetSum} > ${9 * n}, so no integer with at most ${n} digits can have this digit sum. Return -1.`,
      },
    });
    return { original: { n, s: targetSum }, answer: -1, steps };
  }

  let remaining = targetSum;
  let answer = 0;
  const digits = [];

  steps.push({
    title: { vi: "Khởi tạo kết quả", en: "Initialize the result" },
    arr: [...emptyDigits],
    highlight: [],
    codeLines: [5],
    vars: [
      { name: "answer", value: answer },
      { name: "remaining sum", value: remaining },
      { name: "digits", value: [] },
    ],
    note: {
      vi: "Xây số từ trái sang phải. Chữ số bên trái có trọng số lớn hơn, nên luôn lấy chữ số lớn nhất có thể trước.",
      en: "Build the number from left to right. Earlier digits have greater place value, so always take the largest possible digit first.",
    },
  });

  for (let position = 0; position < n; position++) {
    steps.push({
      title: { vi: `Vị trí ${position}: bắt đầu vòng lặp`, en: `Position ${position}: enter the loop` },
      arr: [...digits, ...Array(n - digits.length).fill("·")],
      highlight: [position],
      codeLines: [6],
      vars: [
        { name: "position", value: position },
        { name: "answer", value: answer },
        { name: "remaining sum", value: remaining },
      ],
      note: {
        vi: `Đang chọn chữ số cho vị trí ${position} từ trái sang phải.`,
        en: `Choose the digit for position ${position}, scanning from left to right.`,
      },
    });

    const digit = Math.min(9, remaining);
    steps.push({
      title: { vi: `Chọn digit = ${digit}`, en: `Choose digit = ${digit}` },
      arr: [...digits, digit, ...Array(n - digits.length - 1).fill("·")],
      highlight: [position],
      codeLines: [7],
      vars: [
        { name: "remaining sum", value: remaining },
        { name: "digit = min(9, s)", value: digit },
      ],
      note: {
        vi: `Lấy min(9, ${remaining}) = ${digit}. Đây là chữ số lớn nhất có thể đặt ở vị trí quan trọng nhất còn lại.`,
        en: `Take min(9, ${remaining}) = ${digit}. This is the largest possible digit for the most significant remaining position.`,
      },
    });

    const answerBefore = answer;
    answer = answer * 10 + digit;
    digits.push(digit);
    steps.push({
      title: { vi: `Ghép ${digit} vào answer`, en: `Append ${digit} to answer` },
      arr: [...digits, ...Array(n - digits.length).fill("·")],
      highlight: [position],
      codeLines: [8],
      vars: [
        { name: "answer before", value: answerBefore },
        { name: "digit", value: digit },
        { name: "answer = answer * 10 + digit", value: answer },
      ],
      note: {
        vi: `${answerBefore} × 10 + ${digit} = ${answer}.`,
        en: `${answerBefore} × 10 + ${digit} = ${answer}.`,
      },
    });

    const remainingBefore = remaining;
    remaining -= digit;
    steps.push({
      title: { vi: "Trừ phần tổng đã sử dụng", en: "Subtract the used digit sum" },
      arr: [...digits, ...Array(n - digits.length).fill("·")],
      highlight: [position],
      codeLines: [9],
      vars: [
        { name: "s before", value: remainingBefore },
        { name: "digit", value: digit },
        { name: "s after", value: remaining },
        { name: "answer", value: answer },
      ],
      note: {
        vi: `Tổng còn lại: ${remainingBefore} - ${digit} = ${remaining}.`,
        en: `Remaining sum: ${remainingBefore} - ${digit} = ${remaining}.`,
      },
    });
  }

  steps.push({
    title: { vi: `Kết quả lớn nhất: ${answer}`, en: `Largest result: ${answer}` },
    arr: [...digits],
    highlight: digits.map((_, index) => index),
    codeLines: [10],
    final: true,
    vars: [
      { name: "digits", value: [...digits] },
      { name: "remaining sum", value: remaining },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Các chữ số lớn nhất đã được dồn về bên trái: [${digits.join(", ")}]. Tổng chữ số là ${targetSum}, đáp án là ${answer}.`,
      en: `The largest digits are packed to the left: [${digits.join(", ")}]. Their sum is ${targetSum}, so the answer is ${answer}.`,
    },
  });

  return { original: { n, s: targetSum }, answer, steps };
}

/** LeetCode 3014: assign distinct letters to the shallowest available key slots. */
function buildSteps3014Simple(input) {
  const word = String(input || "").trim().toLowerCase().replace(/[^a-z]/g, "").slice(0, 26);
  const chars = [...word];
  const steps = [];
  const assignments = [];
  let pushes = 0;

  const makeView = ({ phase, currentIndex = null, key = null, cost = null, total = pushes }) => ({
    word: chars,
    phase,
    currentIndex,
    processedCount: assignments.length,
    key,
    cost,
    pushes: total,
    assignments: assignments.map((item) => ({ ...item })),
  });

  steps.push({
    title: { vi: `Nhập word = "${word}"`, en: `Input word = "${word}"` },
    arr: [...chars],
    highlight: [],
    mark: [],
    codeLines: [2],
    vars: [{ name: "word", value: `"${word}"` }],
    keypadPushView: makeView({ phase: "input" }),
    note: {
      vi: "Có 8 phím từ 2 đến 9. Mỗi phím có các tầng 1, 2, 3, 4 lần nhấn; ta luôn dùng tầng nông nhất còn trống.",
      en: "There are eight keys from 2 to 9. Every key has 1-, 2-, 3-, and 4-push slots; always use the shallowest free layer.",
    },
  });

  steps.push({
    title: { vi: "Khởi tạo pushes = 0", en: "Initialize pushes = 0" },
    arr: [...chars],
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [{ name: "pushes", value: 0 }],
    keypadPushView: makeView({ phase: "init" }),
    note: { vi: "Chưa gõ chữ nào nên tổng số lần nhấn bằng 0.", en: "No letter has been typed, so the running total is 0." },
  });

  chars.forEach((ch, i) => {
    steps.push({
      title: { vi: `Vòng lặp gán i = ${i}`, en: `Loop assigns i = ${i}` },
      arr: [...chars],
      highlight: [i],
      mark: assignments.map((item) => item.index),
      codeLines: [5],
      vars: [
        { name: "i", value: i },
        { name: "word[i]", value: `'${ch}'` },
        { name: "pushes", value: pushes },
      ],
      keypadPushView: makeView({ phase: "loop", currentIndex: i }),
      note: {
        vi: `range(len(word)) đưa i đến ${i}. Visualization dùng word[${i}] = '${ch}' để đánh dấu ký tự đang xét.`,
        en: `range(len(word)) advances i to ${i}. The visualization marks word[${i}] = '${ch}' as the current letter.`,
      },
    });

    const key = 2 + (i % 8);
    const cost = Math.floor(i / 8) + 1;
    const before = pushes;
    pushes += cost;
    assignments.push({ ch, index: i, key, cost });
    steps.push({
      title: {
        vi: `pushes += ${i} // 8 + 1 → ${pushes}`,
        en: `pushes += ${i} // 8 + 1 → ${pushes}`,
      },
      arr: [...chars],
      highlight: [i],
      mark: assignments.map((item) => item.index),
      codeLines: [6],
      vars: [
        { name: "i", value: i },
        { name: "pushes before", value: before },
        { name: "i // 8 + 1", value: cost },
        { name: "pushes after", value: pushes },
      ],
      keypadPushView: makeView({ phase: "add", currentIndex: i, key, cost }),
      note: {
        vi: `${i} // 8 + 1 = ${cost}, nên pushes = ${before} + ${cost} = ${pushes}. Bảng phím đặt '${ch}' vào một ô tầng ${cost} để minh họa.`,
        en: `${i} // 8 + 1 = ${cost}, so pushes = ${before} + ${cost} = ${pushes}. The key map places '${ch}' in a layer-${cost} slot for illustration.`,
      },
    });
  });

  steps.push({
    title: { vi: `Trả về ${pushes}`, en: `Return ${pushes}` },
    arr: [...chars],
    highlight: [],
    mark: chars.map((_, index) => index),
    codeLines: [8],
    final: true,
    vars: [
      { name: "word", value: `"${word}"` },
      { name: "pushes", value: pushes },
    ],
    keypadPushView: makeView({ phase: "done", total: pushes }),
    note: { vi: `Tổng nhỏ nhất để gõ "${word}" là ${pushes} lần nhấn.`, en: `The minimum total for typing "${word}" is ${pushes} pushes.` },
  });

  return { original: word, answer: pushes, steps };
}

function heapPush3014(heap, value) {
  heap.push(value);
  let child = heap.length - 1;
  while (child > 0) {
    const parent = Math.floor((child - 1) / 2);
    if (heap[parent] <= heap[child]) break;
    [heap[parent], heap[child]] = [heap[child], heap[parent]];
    child = parent;
  }
}

function heapPop3014(heap) {
  const root = heap[0];
  const last = heap.pop();
  if (heap.length && last !== undefined) {
    heap[0] = last;
    let parent = 0;
    while (true) {
      const left = parent * 2 + 1;
      const right = left + 1;
      let smallest = parent;
      if (left < heap.length && heap[left] < heap[smallest]) smallest = left;
      if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
      if (smallest === parent) break;
      [heap[parent], heap[smallest]] = [heap[smallest], heap[parent]];
      parent = smallest;
    }
  }
  return root;
}

/** LeetCode 3014, approach 2: Counter + max-heap simulated with negative values. */
function buildSteps3014Heap(input) {
  const word = String(input || "").trim().toLowerCase().replace(/[^a-z]/g, "").slice(0, 26);
  const chars = [...word];
  const counts = new Map();
  chars.forEach((ch) => counts.set(ch, (counts.get(ch) || 0) + 1));
  const freqEntries = [...counts.entries()].map(([ch, count]) => ({ ch, count }));
  const steps = [];
  const maxHeap = [];
  const assignments = [];
  let ans = null;
  let index = null;

  const makeView = (overrides = {}) => ({
    word: chars,
    phase: "input",
    visibleFreqCount: 0,
    freqEntries: freqEntries.map((entry) => ({ ...entry })),
    activeFreqIndex: null,
    heap: [...maxHeap],
    frequency: null,
    presses: null,
    ans,
    index,
    assignments: assignments.map((item) => ({ ...item })),
    activeAssignmentIndex: null,
    ...overrides,
  });

  steps.push({
    title: { vi: `Nhập word = "${word}"`, en: `Input word = "${word}"` },
    arr: [...chars], highlight: [], mark: [], codeBlock: 2, codeLines: [2],
    vars: [{ name: "word", value: `"${word}"` }],
    keypadHeapView: makeView({ phase: "input" }),
    note: { vi: "Cách 2 bắt đầu bằng cách đếm số lần xuất hiện của từng chữ.", en: "Approach 2 starts by counting each letter's frequency." },
  });

  steps.push({
    title: { vi: "freq = Counter(word)", en: "freq = Counter(word)" },
    arr: [...chars], highlight: chars.map((_, i) => i), mark: [], codeBlock: 2, codeLines: [4],
    vars: [{ name: "freq", value: `{${freqEntries.map(({ ch, count }) => `'${ch}': ${count}`).join(", ")}}` }],
    keypadHeapView: makeView({ phase: "count", visibleFreqCount: freqEntries.length }),
    note: { vi: `Counter tạo ${freqEntries.length} cặp chữ → tần suất.`, en: `Counter creates ${freqEntries.length} letter → frequency entries.` },
  });

  steps.push({
    title: { vi: "Khởi tạo max_heap = []", en: "Initialize max_heap = []" },
    arr: [...chars], highlight: [], mark: [], codeBlock: 2, codeLines: [7],
    vars: [{ name: "max_heap", value: "[]" }],
    keypadHeapView: makeView({ phase: "heap-init", visibleFreqCount: freqEntries.length }),
    note: { vi: "Python heapq là min-heap, nên ta sẽ lưu -f để tần suất lớn nhất nổi lên root.", en: "Python heapq is a min-heap, so storing -f makes the largest frequency rise to the root." },
  });

  freqEntries.forEach(({ ch, count }, freqIndex) => {
    steps.push({
      title: { vi: `Vòng for lấy f = ${count}`, en: `The for loop takes f = ${count}` },
      arr: [...chars], highlight: chars.map((value, i) => value === ch ? i : -1).filter((i) => i >= 0), mark: [],
      codeBlock: 2, codeLines: [9],
      vars: [{ name: "f", value: count }, { name: "max_heap", value: `[${maxHeap.join(", ")}]` }],
      keypadHeapView: makeView({ phase: "heap-loop", visibleFreqCount: freqEntries.length, activeFreqIndex: freqIndex, frequency: count }),
      note: { vi: `freq.values() đưa f = ${count} vào vòng lặp (tần suất của '${ch}').`, en: `freq.values() yields f = ${count} (the frequency of '${ch}').` },
    });

    heapPush3014(maxHeap, -count);
    steps.push({
      title: { vi: `heappush(max_heap, -${count})`, en: `heappush(max_heap, -${count})` },
      arr: [...chars], highlight: chars.map((value, i) => value === ch ? i : -1).filter((i) => i >= 0), mark: [],
      codeBlock: 2, codeLines: [10],
      vars: [
        { name: "f", value: count },
        { name: "-f", value: -count },
        { name: "max_heap", value: `[${maxHeap.join(", ")}]` },
      ],
      keypadHeapView: makeView({ phase: "heap-push", visibleFreqCount: freqEntries.length, activeFreqIndex: freqIndex, frequency: count }),
      note: { vi: `Đẩy -${count}; root nhỏ nhất theo số âm tương ứng với tần suất thật lớn nhất.`, en: `Push -${count}; the smallest negative root represents the largest real frequency.` },
    });
  });

  ans = 0;
  steps.push({
    title: { vi: "Khởi tạo ans = 0", en: "Initialize ans = 0" },
    arr: [...chars], highlight: [], mark: [], codeBlock: 2, codeLines: [12],
    vars: [{ name: "ans", value: ans }, { name: "max_heap", value: `[${maxHeap.join(", ")}]` }],
    keypadHeapView: makeView({ phase: "ans-init", visibleFreqCount: freqEntries.length }),
    note: { vi: "ans lưu tổng số lần nhấn đã tính.", en: "ans stores the accumulated number of pushes." },
  });

  index = 0;
  steps.push({
    title: { vi: "Khởi tạo index = 0", en: "Initialize index = 0" },
    arr: [...chars], highlight: [], mark: [], codeBlock: 2, codeLines: [13],
    vars: [{ name: "ans", value: ans }, { name: "index", value: index }],
    keypadHeapView: makeView({ phase: "index-init", visibleFreqCount: freqEntries.length }),
    note: { vi: "index đếm có bao nhiêu tần suất đã được gán; mỗi nhóm 8 index dùng thêm một lần nhấn.", en: "index counts assigned frequencies; every group of eight indices costs one extra push." },
  });

  while (maxHeap.length) {
    steps.push({
      title: { vi: `max_heap còn ${maxHeap.length} phần tử`, en: `max_heap still has ${maxHeap.length} item${maxHeap.length === 1 ? "" : "s"}` },
      arr: [...chars], highlight: [], mark: assignments.map((_, i) => i), codeBlock: 2, codeLines: [16],
      vars: [{ name: "max_heap", value: `[${maxHeap.join(", ")}]` }, { name: "bool(max_heap)", value: true }, { name: "index", value: index }, { name: "ans", value: ans }],
      keypadHeapView: makeView({ phase: "while", visibleFreqCount: freqEntries.length }),
      note: { vi: "Heap chưa rỗng nên đi vào vòng while.", en: "The heap is not empty, so enter the while loop." },
    });

    const stored = heapPop3014(maxHeap);
    const frequency = -stored;
    steps.push({
      title: { vi: `frequency = -(${-frequency}) = ${frequency}`, en: `frequency = -(${-frequency}) = ${frequency}` },
      arr: [...chars], highlight: [], mark: assignments.map((_, i) => i), codeBlock: 2, codeLines: [18],
      vars: [{ name: "heappop(max_heap)", value: stored }, { name: "frequency", value: frequency }, { name: "max_heap after pop", value: `[${maxHeap.join(", ")}]` }],
      keypadHeapView: makeView({ phase: "pop", visibleFreqCount: freqEntries.length, frequency, activeAssignmentIndex: index }),
      note: { vi: `Pop root ${stored}, đổi dấu để lấy frequency = ${frequency}.`, en: `Pop root ${stored}, then negate it to recover frequency = ${frequency}.` },
    });

    const presses = Math.floor(index / 8) + 1;
    const pushWord = presses === 1 ? "push" : "pushes";
    steps.push({
      title: { vi: `presses = ${index} // 8 + 1 = ${presses}`, en: `presses = ${index} // 8 + 1 = ${presses}` },
      arr: [...chars], highlight: [], mark: assignments.map((_, i) => i), codeBlock: 2, codeLines: [20],
      vars: [{ name: "index", value: index }, { name: "presses", value: presses }, { name: "frequency", value: frequency }],
      keypadHeapView: makeView({ phase: "presses", visibleFreqCount: freqEntries.length, frequency, presses, activeAssignmentIndex: index }),
      note: { vi: `index ${index} nằm trong nhóm [${Math.floor(index / 8) * 8}..${Math.floor(index / 8) * 8 + 7}], nên mỗi lần xuất hiện cần ${presses} lần nhấn.`, en: `index ${index} is in group [${Math.floor(index / 8) * 8}..${Math.floor(index / 8) * 8 + 7}], so each occurrence costs ${presses} ${pushWord}.` },
    });

    const before = ans;
    const contribution = frequency * presses;
    ans += contribution;
    assignments.push({ index, key: 2 + (index % 8), cost: presses, frequency, contribution });
    steps.push({
      title: { vi: `ans += ${frequency} × ${presses} → ${ans}`, en: `ans += ${frequency} × ${presses} → ${ans}` },
      arr: [...chars], highlight: [], mark: assignments.map((_, i) => i), codeBlock: 2, codeLines: [22],
      vars: [{ name: "ans before", value: before }, { name: "frequency * presses", value: `${frequency} * ${presses} = ${contribution}` }, { name: "ans after", value: ans }],
      keypadHeapView: makeView({ phase: "add", visibleFreqCount: freqEntries.length, frequency, presses, activeAssignmentIndex: index }),
      note: { vi: `${frequency} lần xuất hiện × ${presses} lần nhấn = ${contribution}; ans = ${before} + ${contribution} = ${ans}.`, en: `${frequency} ${frequency === 1 ? "occurrence" : "occurrences"} × ${presses} ${pushWord} = ${contribution}; ans = ${before} + ${contribution} = ${ans}.` },
    });

    const previousIndex = index;
    index += 1;
    steps.push({
      title: { vi: `index: ${previousIndex} → ${index}`, en: `index: ${previousIndex} → ${index}` },
      arr: [...chars], highlight: [], mark: assignments.map((_, i) => i), codeBlock: 2, codeLines: [24],
      vars: [{ name: "index before", value: previousIndex }, { name: "index after", value: index }, { name: "ans", value: ans }],
      keypadHeapView: makeView({ phase: "increment", visibleFreqCount: freqEntries.length, frequency, presses, activeAssignmentIndex: previousIndex }),
      note: { vi: "Tăng index để tần suất tiếp theo nhận ô rẻ nhất còn lại.", en: "Increment index so the next frequency takes the cheapest remaining slot." },
    });
  }

  steps.push({
    title: { vi: "max_heap rỗng → thoát while", en: "max_heap is empty → exit while" },
    arr: [...chars], highlight: [], mark: assignments.map((_, i) => i), codeBlock: 2, codeLines: [16],
    vars: [{ name: "max_heap", value: "[]" }, { name: "bool(max_heap)", value: false }, { name: "index", value: index }, { name: "ans", value: ans }],
    keypadHeapView: makeView({ phase: "while-done", visibleFreqCount: freqEntries.length }),
    note: { vi: "Không còn tần suất nào trong heap, điều kiện while là False.", en: "No frequencies remain in the heap, so the while condition is False." },
  });

  steps.push({
    title: { vi: `Trả về ans = ${ans}`, en: `Return ans = ${ans}` },
    arr: [...chars], highlight: [], mark: assignments.map((_, i) => i), codeBlock: 2, codeLines: [26], final: true,
    vars: [{ name: "ans", value: ans }],
    keypadHeapView: makeView({ phase: "done", visibleFreqCount: freqEntries.length }),
    note: { vi: `Tổng nhỏ nhất là ${ans} lần nhấn.`, en: `The minimum total is ${ans} pushes.` },
  });

  return { original: word, answer: ans, steps };
}

function buildSteps3014(input, params) {
  return Number(params && params.approach) === 2
    ? buildSteps3014Heap(input)
    : buildSteps3014Simple(input);
}

/** LeetCode 55: Jump Game — track the farthest reachable index. */
function buildSteps55(input) {
  const nums = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const steps = [];
  let farthest = 0;
  steps.push({ title: { vi: "farthest = 0", en: "farthest = 0" }, arr: [...nums], sub: nums.map((_, i) => `[${i}]`), highlight: [], mark: [], codeLines: [3], vars: [{ name: "nums", value: `[${nums.join(",")}]` }, { name: "farthest", value: 0 }], note: { vi: "Duyệt; farthest = chỉ số xa nhất có thể tới. Nếu i > farthest → kẹt.", en: "Scan; farthest = the farthest reachable index. If i > farthest → stuck." } });
  let answer = true;
  for (let i = 0; i < nums.length; i++) {
    if (i > farthest) { answer = false; steps.push({ title: { vi: `i=${i} > farthest=${farthest} → kẹt → False`, en: `i=${i} > farthest=${farthest} → stuck → False` }, arr: [...nums], sub: nums.map((_, x) => `[${x}]`), highlight: [i], mark: [], final: true, codeLines: [4, 5], vars: [{ name: "i", value: i }, { name: "farthest", value: farthest }], note: { vi: `Không thể tới i=${i} → không thể tới cuối.`, en: `Cannot reach i=${i} → cannot reach the end.` } }); break; }
    farthest = Math.max(farthest, i + nums[i]);
    const done = farthest >= nums.length - 1;
    steps.push({ title: { vi: `i=${i}: farthest = max(${farthest}, ${i}+${nums[i]}) = ${farthest}`, en: `i=${i}: farthest = max → ${farthest}` }, arr: [...nums], sub: nums.map((_, x) => `[${x}]`), highlight: [i], mark: Array.from({ length: Math.min(farthest, nums.length - 1) - i + (i <= farthest ? 1 : 0) }, (_, x) => i + x), codeLines: done ? [6, 7, 8] : [6, 7], vars: [{ name: "i", value: i }, { name: "farthest", value: farthest }], note: { vi: done ? `farthest ≥ ${nums.length - 1} → tới được cuối → True!` : `Cập nhật farthest = ${farthest}.`, en: done ? `farthest ≥ ${nums.length - 1} → can reach the end → True!` : `Update farthest = ${farthest}.` } });
    if (done) { answer = true; steps[steps.length - 1].final = true; break; }
  }
  if (answer && !steps[steps.length - 1].final) steps[steps.length - 1].final = true;
  return { original: nums, answer, steps };
}

/**
 * LeetCode 134: Gas Station — greedy, line-by-line debugger.
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def canCompleteCircuit(self, gas, cost):
 *  3          if sum(gas) < sum(cost):
 *  4              return -1
 *  5          start = 0
 *  6          tank = 0
 *  7          for i in range(len(gas)):
 *  8              tank += gas[i] - cost[i]
 *  9              if tank < 0:
 * 10                  start = i + 1
 * 11                  tank = 0
 * 12          return start
 */
function buildSteps134(input, params) {
  const gas = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const cost = String(params && params.cost || "3,4,5,1,2").split(",").map((s) => Number(s.trim()));
  const n = gas.length;
  const steps = [];

  const sumGas = gas.reduce((a, b) => a + b, 0);
  const sumCost = cost.reduce((a, b) => a + b, 0);

  // Per-station settled state: "pending" | "reached" | "discarded"
  const stateAt = new Array(n).fill("pending");
  // Running tank value recorded right after processing that station (or null if not yet).
  const tankAt = new Array(n).fill(null);

  let start = 0;
  let tank = 0;

  // Build the gasStationView snapshot from the current state.
  function view(o) {
    return {
      n,
      sumGas, sumCost,
      feasible: sumGas >= sumCost,
      start,
      tank,
      currentIndex: (o.current === undefined ? null : o.current),
      phase: o.phase,
      answer: (o.answer === undefined ? null : o.answer),
      stations: gas.map((g, x) => ({
        index: x,
        gas: g,
        cost: cost[x],
        net: g - cost[x],
        tank: tankAt[x],
        state: stateAt[x],
      })),
    };
  }

  function snap(o) {
    steps.push({
      title: o.title,
      gasStationView: view(o),
      final: o.final || false,
      codeLines: o.codeLines || [],
      vars: o.vars || [],
      note: o.note,
    });
  }

  // ── Line 3: sum(gas) < sum(cost)? ──────────────────────────────────
  const insufficient = sumGas < sumCost;
  snap({
    title: { vi: `line 3: sum(gas) < sum(cost) → ${insufficient}`, en: `line 3: sum(gas) < sum(cost) → ${insufficient}` },
    codeLines: [3], phase: "check-total",
    vars: [
      { name: "gas", value: `[${gas.join(",")}]` }, { name: "cost", value: `[${cost.join(",")}]` },
      { name: "sum(gas)", value: sumGas }, { name: "sum(cost)", value: sumCost },
    ],
    note: {
      vi: insufficient
        ? `sum(gas)=${sumGas} < sum(cost)=${sumCost} → không đủ xăng cho toàn vòng → line 4 return -1.`
        : `sum(gas)=${sumGas} ≥ sum(cost)=${sumCost} → đủ xăng, tồn tại DUY NHẤT một điểm xuất phát hợp lệ.`,
      en: insufficient
        ? `sum(gas)=${sumGas} < sum(cost)=${sumCost} → not enough gas for the whole loop → line 4 return -1.`
        : `sum(gas)=${sumGas} ≥ sum(cost)=${sumCost} → enough gas, exactly ONE valid starting station exists.`,
    },
  });
  if (insufficient) {
    snap({
      title: { vi: "line 4: return -1", en: "line 4: return -1" },
      final: true, codeLines: [4], phase: "answer", answer: -1,
      vars: [{ name: "answer", value: -1 }],
      note: { vi: "Không đủ xăng để đi hết vòng, bất kể xuất phát ở đâu.", en: "Not enough gas to complete the loop, regardless of the starting point." },
    });
    return { original: gas, answer: -1, steps };
  }

  // ── Lines 5-6: start = 0; tank = 0 ─────────────────────────────────
  snap({
    title: { vi: "line 5-6: start = 0; tank = 0", en: "line 5-6: start = 0; tank = 0" },
    codeLines: [5, 6], phase: "init",
    vars: [{ name: "start", value: 0 }, { name: "tank", value: 0 }],
    note: {
      vi: "start = ứng viên điểm xuất phát hiện tại. tank = xăng còn lại trong bình khi đi từ start tới i.",
      en: "start = current candidate starting station. tank = fuel left in the tank when driving from start to i.",
    },
  });

  for (let i = 0; i < n; i++) {
    // ── Line 7 ────────────────────────────────────────────────────────
    snap({
      title: { vi: `line 7: for i in range(len(gas)) → i = ${i}`, en: `line 7: for i in range(len(gas)) → i = ${i}` },
      codeLines: [7], phase: "examine", current: i,
      vars: [{ name: "i", value: i }, { name: "start", value: start }, { name: "tank", value: tank }],
      note: { vi: `Xe đang ở station ${i}, xuất phát thử từ station ${start}.`, en: `Car is at station ${i}, tentatively started from station ${start}.` },
    });

    // ── Line 8: tank += gas[i] - cost[i] ────────────────────────────────
    const net = gas[i] - cost[i];
    tank += net;
    tankAt[i] = tank;
    snap({
      title: { vi: `line 8: tank += gas[${i}]-cost[${i}] = ${net >= 0 ? "+" : ""}${net} → tank = ${tank}`, en: `line 8: tank += gas[${i}]-cost[${i}] = ${net >= 0 ? "+" : ""}${net} → tank = ${tank}` },
      codeLines: [8], phase: "accumulate", current: i,
      vars: [{ name: "gas[i]", value: gas[i] }, { name: "cost[i]", value: cost[i] }, { name: "net", value: net }, { name: "tank", value: tank }],
      note: {
        vi: `Đổ ${gas[i]} xăng, tốn ${cost[i]} để chạy tới station kế → net = ${net >= 0 ? "+" : ""}${net}. Bình còn tank = ${tank}.`,
        en: `Add ${gas[i]} gas, spend ${cost[i]} to drive to the next station → net = ${net >= 0 ? "+" : ""}${net}. Tank now = ${tank}.`,
      },
    });

    // ── Line 9: if tank < 0 ─────────────────────────────────────────────
    const negative = tank < 0;
    snap({
      title: { vi: `line 9: tank < 0 → ${negative}`, en: `line 9: tank < 0 → ${negative}` },
      codeLines: [9], phase: "check-negative", current: i,
      vars: [{ name: "tank", value: tank }, { name: "negative?", value: negative }],
      note: {
        vi: negative
          ? `tank=${tank} âm → hết xăng giữa đường. Không station nào trong [${start}..${i}] làm điểm xuất phát được → line 10-11 chuyển start.`
          : `tank=${tank} ≥ 0 → bình vẫn còn xăng, đi tiếp, giữ nguyên start=${start}.`,
        en: negative
          ? `tank=${tank} is negative → ran out of gas mid-way. No station in [${start}..${i}] can be a valid start → lines 10-11 move start.`
          : `tank=${tank} ≥ 0 → still have fuel, keep going, keep start=${start}.`,
      },
    });
    if (negative) {
      // ── Lines 10-11: start = i + 1; tank = 0 ──────────────────────────
      const oldStart = start;
      for (let k = oldStart; k <= i; k++) stateAt[k] = "discarded";
      start = i + 1;
      tank = 0;
      snap({
        title: { vi: `line 10-11: start = ${i}+1 = ${start}; tank = 0`, en: `line 10-11: start = ${i}+1 = ${start}; tank = 0` },
        codeLines: [10, 11], phase: "move-start", current: i,
        vars: [{ name: "old start", value: oldStart }, { name: "new start", value: start }, { name: "tank (reset)", value: 0 }],
        note: {
          vi: `Loại bỏ cả đoạn [${oldStart}..${i}] khỏi danh sách ứng viên (tô xám), thử lại từ station ${start}. Bình reset về 0.`,
          en: `Discard the whole [${oldStart}..${i}] range (greyed out), retry from station ${start}. Tank resets to 0.`,
        },
      });
    } else {
      stateAt[i] = "reached";
    }
  }

  // ── Line 12: return start ────────────────────────────────────────────
  snap({
    title: { vi: `line 12: return start = ${start}`, en: `line 12: return start = ${start}` },
    final: true, codeLines: [12], phase: "answer", answer: start,
    vars: [{ name: "answer", value: start }],
    note: {
      vi: `Đã quét hết ${n} station. Điểm xuất phát duy nhất hợp lệ = station ${start} (tô xanh).`,
      en: `Finished scanning all ${n} stations. The unique valid starting station = ${start} (highlighted green).`,
    },
  });
  return { original: gas, answer: start, steps };
}

/** LeetCode 179: Largest Number — custom comparator a+b vs b+a. */
function buildSteps179(input) {
  const nums = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const strs = nums.map(String);
  const steps = [];
  steps.push({ title: { vi: "Chuyển thành chuỗi", en: "Convert to strings" }, arr: [...nums], sub: strs, highlight: [], mark: [], codeLines: [3], vars: [{ name: "strs", value: `[${strs.join(",")}]` }], note: { vi: "So sánh a,b bằng a+b so với b+a. Nếu a+b > b+a thì a đứng trước.", en: "Compare a,b by a+b versus b+a. If a+b > b+a, a comes first." } });
  // insertion-sort-like to show comparisons succinctly; just show sorted result via comparator
  const sorted = [...strs].sort((a, b) => (a + b > b + a ? -1 : a + b < b + a ? 1 : 0));
  // show a few key comparison steps
  steps.push({ title: { vi: `Sắp xếp: [${sorted.join(",")}]`, en: `Sort: [${sorted.join(",")}]` }, arr: sorted.map(Number), sub: sorted, highlight: [], mark: [], codeLines: [4, 5, 6], vars: [{ name: "sorted", value: `[${sorted.join(",")}]` }], note: { vi: `Sắp theo comparator: chuỗi ghép lớn hơn đứng trước. Vd "9">"5">"34">"3">"30".`, en: `Sort by the comparator: the concatenation that is larger comes first. e.g. "9">"5">"34">"3">"30".` } });
  const joined = sorted.join("");
  const answer = joined[0] === "0" ? "0" : joined;
  steps.push({ title: { vi: `Kết quả: "${answer}"`, en: `Result: "${answer}"` }, arr: sorted.map(Number), sub: sorted, highlight: [], mark: [], final: true, codeLines: [7, 8], vars: [{ name: "answer", value: `"${answer}"` }], note: { vi: joined[0] === "0" ? `Toàn số 0 → "0".` : `Ghép các chuỗi đã sắp → "${answer}".`, en: joined[0] === "0" ? `All zeros → "0".` : `Concatenate the sorted strings → "${answer}".` } });
  return { original: nums, answer, steps };
}

/**
 * LeetCode 3016: Minimum Number of Pushes to Type Word II.
 * Greedy: count frequency, sort descending, assign most frequent first.
 * Keys 2-9 (8 keys), each can hold multiple letters.
 * 1st-8th letters → 1 push, 9th-16th → 2 pushes, etc.
 */
function buildSteps3016(input) {
  const word = String(input || "").trim().toLowerCase().replace(/[^a-z]/g, "");
  const steps = [];
  const freq = {};
  
  // Count frequency
  for (const ch of word) {
    freq[ch] = (freq[ch] || 0) + 1;
  }
  
  const letters = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
  const frequencies = letters.map((ch) => freq[ch]);
  const counts = letters.map((ch) => freq[ch]);
  
  steps.push({
    title: { vi: "Đếm tần suất", en: "Count frequency" },
    arr: frequencies,
    sub: letters,
    highlight: [],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "word", value: word },
      { name: "unique letters", value: letters.length },
    ],
    note: {
      vi: `Đếm tần suất các ký tự trong "${word}". Có ${letters.length} ký tự khác nhau.`,
      en: `Count frequency of characters in "${word}". Found ${letters.length} distinct characters.`,
    },
  });
  
  steps.push({
    title: { vi: "Sắp xếp giảm dần", en: "Sort descending" },
    arr: frequencies,
    sub: letters,
    highlight: [],
    mark: [],
    codeLines: [5],
    vars: [
      { name: "frequencies", value: `[${frequencies.join(", ")}]` },
    ],
    note: {
      vi: `Sắp xếp theo tần suất giảm dần. GREEDY: gán các ký tự xuất hiện nhiều nhất vào vị trí cần ít nhấn nhất (position=1).`,
      en: `Sort by frequency descending. GREEDY: assign the most frequent characters to positions that require fewer presses (position=1).`,
    },
  });
  
  let totalPushes = 0;
  const assignments = [];
  
  for (let i = 0; i < letters.length; i++) {
    const ch = letters[i];
    const count = counts[i];
    const position = Math.floor(i / 8) + 1;  // 0-7 → pos 1, 8-15 → pos 2, etc.
    const pushes = count * position;
    totalPushes += pushes;
    assignments.push({ ch, count, position, pushes });
    
    steps.push({
      title: { vi: `i=${i}: '${ch}' → position ${position}`, en: `i=${i}: '${ch}' → position ${position}` },
      arr: frequencies,
      sub: letters,
      highlight: [i],
      mark: Array.from({ length: i + 1 }, (_, k) => k),
      codeLines: [7, 8, 9, 10],
      vars: [
        { name: "i", value: i },
        { name: "letter", value: ch },
        { name: "count", value: count },
        { name: "position", value: `⌊${i}/8⌋ + 1 = ${position}` },
        { name: "pushes", value: `${count} × ${position} = ${pushes}` },
        { name: "total", value: totalPushes },
      ],
      note: {
        vi: i < 8
          ? `'${ch}' xuất hiện ${count} lần, vị trí ${position} (keys 2-9, slot 1) → ${pushes} pushes. Total = ${totalPushes}.`
          : i < 16
            ? `'${ch}' xuất hiện ${count} lần, vị trí ${position} (keys 2-9, slot 2) → ${pushes} pushes. Total = ${totalPushes}.`
            : `'${ch}' xuất hiện ${count} lần, vị trí ${position} → ${pushes} pushes. Total = ${totalPushes}.`,
        en: i < 8
          ? `'${ch}' appears ${count} times, position ${position} (keys 2-9, slot 1) → ${pushes} pushes. Total = ${totalPushes}.`
          : i < 16
            ? `'${ch}' appears ${count} times, position ${position} (keys 2-9, slot 2) → ${pushes} pushes. Total = ${totalPushes}.`
            : `'${ch}' appears ${count} times, position ${position} → ${pushes} pushes. Total = ${totalPushes}.`,
      },
    });
  }
  
  steps.push({
    title: { vi: `Kết quả: ${totalPushes} pushes`, en: `Result: ${totalPushes} pushes` },
    arr: frequencies,
    sub: letters,
    highlight: [],
    mark: Array.from({ length: letters.length }, (_, k) => k),
    final: true,
    codeLines: [11],
    vars: [
      { name: "answer", value: totalPushes },
      { name: "assignments", value: assignments.map((a) => `${a.ch}:pos${a.position}`).join(", ") },
    ],
    note: {
      vi: `Tổng số pushes tối thiểu = ${totalPushes}. Gán: ${assignments.map((a) => `'${a.ch}'→pos${a.position}(${a.pushes})`).join(", ")}.`,
      en: `Minimum total pushes = ${totalPushes}. Assignments: ${assignments.map((a) => `'${a.ch}'→pos${a.position}(${a.pushes})`).join(", ")}.`,
    },
  });
  
  return { original: word, answer: totalPushes, steps };
}

module.exports = {
  3016: {
    id: 3016, difficulty: "medium", slug: "minimum-number-of-pushes-to-type-word-ii",
    category: { key: "greedy", vi: "Tham lam", en: "Greedy" },
    title: { vi: "Minimum Number of Pushes to Type Word II", en: "Minimum Number of Pushes to Type Word II" },
    titleVi: { vi: "Số lần nhấn tối thiểu để gõ từ II (greedy + sort)", en: "Minimum pushes to type word II (greedy + sort)" },
    statement: {
      vi: "Bàn phím điện thoại có các phím 2-9 (8 phím). Mỗi phím có thể gán nhiều chữ cái. Phím i, chữ cái thứ j → cần j lần nhấn. Tìm cách gán để tổng số nhấn tối thiểu khi gõ word. Nhập word.",
      en: "Telephone keypad has keys 2-9 (8 keys). Each key can be mapped to multiple letters. Key i, letter at position j → requires j presses. Find the optimal mapping to minimize total presses when typing word. Enter word.",
    },
    defaultInput: "abcde",
    inputKind: "string",
    inputLabel: { vi: "word (lowercase letters)", en: "word (lowercase letters)" },
    singleInput: true,
    extraParams: [],
    approach: [
      { vi: "Đếm tần suất của mỗi ký tự trong word.", en: "Count frequency of each character in word." },
      { vi: "Sắp xếp các tần suất giảm dần (greedy: gán ký tự xuất hiện nhiều vào vị trí cần ít nhấn).", en: "Sort frequencies descending (greedy: assign most frequent characters to positions needing fewer presses)." },
      { vi: "8 ký tự đầu → position 1 (1 press), 8 ký tự tiếp → position 2 (2 presses), v.v.", en: "First 8 letters → position 1 (1 press), next 8 → position 2 (2 presses), etc." },
      { vi: "Tổng pushes = Σ (frequency[i] × position[i]).", en: "Total pushes = Σ (frequency[i] × position[i])." },
    ],
    complexity: {
      time: "O(n + k log k)",
      space: "O(k)",
      note: {
        vi: "n = độ dài word, k = số ký tự khác nhau (≤ 26). Đếm O(n), sort O(k log k).",
        en: "n = word length, k = distinct chars (≤ 26). Counting O(n), sorting O(k log k).",
      },
    },
    code: [
      "from collections import Counter",
      "",
      "class Solution:",
      "    def minimumPushes(self, word: str) -> int:",
      "        freq = Counter(word)",
      "        frequencies = sorted(freq.values(), reverse=True)",
      "        total_pushes = 0",
      "        for i, count in enumerate(frequencies):",
      "            position = (i // 8) + 1",
      "            total_pushes += count * position",
      "        return total_pushes",
    ],
    builder: buildSteps3016,
  },
  55: {
    id: 55, difficulty: "medium", slug: "jump-game",
    category: { key: "greedy", vi: "Tham lam", en: "Greedy" },
    title: { vi: "Jump Game", en: "Jump Game" },
    titleVi: { vi: "Trò nhảy (greedy farthest)", en: "Jump game (greedy farthest)" },
    statement: { vi: "Mỗi phần tử là bước nhảy tối đa từ vị trí đó. Có thể tới ô cuối không? Nhập cách nhau dấu phẩy.", en: "Each element is the max jump length from that index. Can you reach the last index? Enter comma-separated." },
    defaultInput: [2, 3, 1, 1, 4], inputKind: "nonneg", inputLabel: { vi: "nums", en: "nums" }, extraParams: [],
    approach: [{ vi: "Giữ farthest = chỉ số xa nhất có thể tới.", en: "Track farthest = the farthest reachable index." }, { vi: "Nếu i vượt farthest → kẹt → False.", en: "If i exceeds farthest → stuck → False." }, { vi: "Nếu farthest ≥ cuối → True.", en: "If farthest ≥ last → True." }],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Một lượt greedy.", en: "Single greedy pass." } },
    code: ["class Solution:", "    def canJump(self, nums):", "        farthest = 0", "        for i, jump in enumerate(nums):", "            if i > farthest: return False", "            farthest = max(farthest, i + jump)", "            if farthest >= len(nums)-1: return True", "        return True"],
    builder: buildSteps55,
  },
  134: {
    id: 134, difficulty: "medium", slug: "gas-station",
    category: { key: "greedy", vi: "Tham lam", en: "Greedy" },
    title: { vi: "Gas Station", en: "Gas Station" },
    titleVi: { vi: "Trạm xăng (greedy)", en: "Gas station (greedy)" },
    statement: { vi: "gas[i] xăng nhận, cost[i] xăng đi tới trạm kế. Tìm điểm xuất phát để đi hết vòng, hoặc -1. Nhập gas; cost trong tham số.", en: "gas[i] fuel gained, cost[i] to reach the next station. Find the start to complete the loop, or -1. Enter gas; cost as a parameter." },
    defaultInput: [1, 2, 3, 4, 5], inputKind: "nonneg", inputLabel: { vi: "gas", en: "gas" },
    extraParams: [{ key: "cost", label: { vi: "cost (cách bởi ,)", en: "cost (comma separated)" }, default: "3,4,5,1,2" }],
    approach: [{ vi: "Nếu tổng gas < tổng cost → -1.", en: "If total gas < total cost → -1." }, { vi: "Cộng dồn tank = gas[i]-cost[i].", en: "Accumulate tank = gas[i]-cost[i]." }, { vi: "Khi tank < 0, không station nào trong đoạn vừa qua là start → start = i+1, reset tank.", en: "When tank < 0, no station in that stretch can be the start → start = i+1, reset tank." }],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Một lượt greedy.", en: "Single greedy pass." } },
    code: [
      "class Solution:",
      "    def canCompleteCircuit(self, gas, cost):",
      "        if sum(gas) < sum(cost):",
      "            return -1",
      "        start = 0",
      "        tank = 0",
      "        for i in range(len(gas)):",
      "            tank += gas[i] - cost[i]",
      "            if tank < 0:",
      "                start = i + 1",
      "                tank = 0",
      "        return start",
    ],
    builder: buildSteps134,
  },
  179: {
    id: 179, difficulty: "medium", slug: "largest-number",
    category: { key: "greedy", vi: "Tham lam", en: "Greedy" },
    title: { vi: "Largest Number", en: "Largest Number" },
    titleVi: { vi: "Ghép số lớn nhất (comparator tùy chỉnh)", en: "Largest number (custom comparator)" },
    statement: { vi: "Sắp xếp các số để ghép thành số LỚN NHẤT. Nhập cách nhau dấu phẩy.", en: "Arrange numbers to form the LARGEST concatenated number. Enter comma-separated." },
    defaultInput: [3, 30, 34, 5, 9], inputKind: "nonneg", inputLabel: { vi: "nums", en: "nums" }, extraParams: [],
    approach: [{ vi: "Chuyển các số thành chuỗi.", en: "Convert numbers to strings." }, { vi: "So sánh a,b: a trước b nếu a+b > b+a.", en: "Compare a,b: a before b if a+b > b+a." }, { vi: "Ghép lại; xử lý trường hợp toàn số 0.", en: "Concatenate; handle the all-zeros case." }],
    complexity: { time: "O(n log n)", space: "O(n)", note: { vi: "Sắp xếp với comparator tùy chỉnh.", en: "Sort with a custom comparator." } },
    code: ["from functools import cmp_to_key", "class Solution:", "    def largestNumber(self, nums):", "        strs = list(map(str, nums))", "        strs.sort(key=cmp_to_key(lambda a,b: (a+b < b+a) - (a+b > b+a)))", "        res = ''.join(strs)", "        return '0' if res[0]=='0' else res"],
    builder: buildSteps179,
  },
  252: {
    id: 252,
    difficulty: "easy",
    premium: true,
    slug: "meeting-rooms",
    category: { key: "greedy", vi: "Tham lam & Sắp xếp", en: "Greedy & Sorting" },
    title: { vi: "Meeting Rooms", en: "Meeting Rooms" },
    titleVi: { vi: "Có thể tham dự tất cả cuộc họp không?", en: "Can one person attend every meeting?" },
    statement: {
      vi: "Cho mảng intervals, trong đó intervals[i] = [startᵢ, endᵢ]. Trả về true nếu một người có thể tham dự tất cả cuộc họp; ngược lại trả về false.",
      en: "Given intervals where intervals[i] = [start_i, end_i], return true if one person can attend all meetings; otherwise return false.",
    },
    defaultInput: "0,30;5,10;15,20",
    inputKind: "string",
    inputLabel: { vi: "Cuộc họp (start,end; ...)", en: "Meetings (start,end; ...)" },
    extraParams: [],
    approach: [
      {
        vi: "Sắp xếp các cuộc họp theo thời gian bắt đầu. Nếu start hiện tại < end của cuộc họp trước thì hai cuộc họp bị chồng nhau.",
        en: "Sort meetings by start time. If the current start is less than the previous end, the two meetings overlap.",
      },
      {
        vi: "Nếu duyệt hết mà không có xung đột, có thể tham dự toàn bộ cuộc họp.",
        en: "If the scan finishes without a conflict, every meeting can be attended.",
      },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(1) / O(n)",
      note: {
        vi: "Sắp xếp tốn O(n log n); bộ nhớ phụ thuộc vào cách cài đặt sort.",
        en: "Sorting costs O(n log n); auxiliary space depends on the sorting implementation.",
      },
    },
    code: [
      "class Solution:",
      "    def canAttendMeetings(self, intervals):",
      "        intervals.sort(key=lambda interval: interval[0])",
      "        for i in range(1, len(intervals)):",
      "            prev_end = intervals[i - 1][1]",
      "            current_start = intervals[i][0]",
      "            if current_start < prev_end:",
      "                return False",
      "        return True",
    ],
    builder: buildSteps252,
  },
  3014: {
    id: 3014,
    difficulty: "easy",
    slug: "minimum-number-of-pushes-to-type-word-i",
    category: { key: "greedy", vi: "Tham lam", en: "Greedy" },
    title: { vi: "Minimum Number of Pushes to Type Word I", en: "Minimum Number of Pushes to Type Word I" },
    titleVi: { vi: "Số lần nhấn ít nhất để gõ từ I", en: "Minimum pushes to type a word I" },
    statement: {
      vi: "Cho word gồm các chữ cái thường khác nhau. Có thể gán lại các chữ cái vào 8 phím từ 2 đến 9. Trả về số lần nhấn ít nhất để gõ word.",
      en: "Given a word of distinct lowercase letters, remap letters onto the eight keys from 2 to 9. Return the minimum pushes needed to type word.",
    },
    defaultInput: "xycdefghij",
    inputKind: "string",
    inputLabel: { vi: "word (các chữ khác nhau)", en: "word (distinct letters)" },
    extraParams: [
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Công thức trực tiếp", en: "Approach 1: Direct formula" } },
          { value: "2", label: { vi: "Cách 2: Counter + max heap", en: "Approach 2: Counter + max heap" } },
        ],
      },
    ],
    approach: [
      { vi: "Có 8 phím, nên 8 chữ đầu tiên đều được đặt ở tầng 1 và chỉ tốn 1 lần nhấn.", en: "There are eight keys, so the first eight letters all occupy layer 1 and cost one push each." },
      { vi: "Chữ thứ 9 đến 16 nằm ở tầng 2; tổng quát cost = i // 8 + 1.", en: "Letters 9 through 16 occupy layer 2; in general, cost = i // 8 + 1." },
      { vi: "Vì mọi chữ trong word khác nhau, thứ tự gán phím không làm thay đổi tổng chi phí.", en: "Because every letter in word is distinct, the key assignment order does not change the total cost." },
      { vi: "Cách 2 dùng Counter và max heap để luôn lấy tần suất lớn nhất trước; với ràng buộc của bài I, mọi tần suất đều bằng 1.", en: "Approach 2 uses Counter and a max-heap to process the largest frequency first; under problem I's constraints, every frequency is 1." },
    ],
    complexity: {
      time: "O(n) / O(n log n)",
      space: "O(1) / O(n)",
      note: { vi: "Cách 1: O(n), O(1). Cách 2: Counter + heap có tối đa n tần suất, O(n log n) time và O(n) space.", en: "Approach 1: O(n), O(1). Approach 2: Counter + heap holds at most n frequencies, using O(n log n) time and O(n) space." },
    },
    code: [
      "class Solution:",
      "    def minimumPushes(self, word: str) -> int:",
      "        pushes = 0",
      "",
      "        for i in range(len(word)):",
      "            pushes += i // 8 + 1",
      "",
      "        return pushes",
    ],
    code2: [
      "class Solution:",
      "    def minimumPushes(self, word: str) -> int:",
      "        # Step 1: Count frequencies",
      "        freq = Counter(word)",
      "",
      "        # Step 2: Create a max heap",
      "        max_heap = []",
      "",
      "        for f in freq.values():",
      "            heapq.heappush(max_heap, -f)   # negative because heapq is a min-heap",
      "",
      "        ans = 0",
      "        index = 0",
      "",
      "        # Step 3: Process highest frequencies first",
      "        while max_heap:",
      "",
      "            frequency = -heapq.heappop(max_heap)",
      "",
      "            presses = index // 8 + 1",
      "",
      "            ans += frequency * presses",
      "",
      "            index += 1",
      "",
      "        return ans",
    ],
    codeLabel: { vi: "Cách 1: Công thức trực tiếp", en: "Approach 1: Direct formula" },
    code2Label: { vi: "Cách 2: Counter + max heap", en: "Approach 2: Counter + max heap" },
    builder: buildSteps3014,
  },
  3947: {
    id: 3947,
    difficulty: "medium",
    slug: "maximum-number-of-items-from-sale-ii",
    category: { key: "greedy", vi: "Tham lam & Sắp xếp", en: "Greedy & Sorting" },
    title: { vi: "Maximum Number of Items From Sale II", en: "Maximum Number of Items From Sale II" },
    titleVi: { vi: "Số lượng món hàng tối đa từ đợt giảm giá II", en: "Maximize purchased and free item copies" },
    statement: {
      vi:
        "Cho items[i] = [factorᵢ, priceᵢ] và budget. Có thể mua không giới hạn mỗi loại trong ngân sách. " +
        "Mỗi bản đã mua của item i có thể tặng tối đa một bản item j khác nếu factorᵢ là ước của factorⱼ; " +
        "mỗi cặp có thứ tự (i, j) chỉ được dùng một lần. Trả về tổng số bản mua và miễn phí lớn nhất.",
      en:
        "Given items[i] = [factor_i, price_i] and a budget, buy unlimited copies within budget. " +
        "Each purchased copy of item i may give one free copy of a different item j when factor_i divides factor_j; " +
        "each ordered pair (i, j) may be used at most once. Return the maximum purchased plus free copies.",
    },
    defaultInput: "1,6;2,4;3,5",
    inputKind: "string",
    inputLabel: { vi: "items (factor,price; ...)", en: "items (factor,price; ...)" },
    extraParams: [
      { key: "budget", label: { vi: "budget (ngân sách)", en: "budget" }, type: "number", min: 1, default: 19 },
    ],
    approach: [
      {
        vi: "Tính gain[i]: số item j khác có factor là bội của factor[i], bằng bảng tần suất và sàng các bội.",
        en: "Compute gain[i]: the number of other item types j whose factor is a multiple of factor[i], using frequencies and a multiples sieve.",
      },
      {
        vi: "gain[i] bản mua đầu của item i có giá trị 2 món mỗi bản; các bản sau chỉ có giá trị 1 món.",
        en: "The first gain[i] purchases of item i are worth two copies each; later purchases are worth one copy each.",
      },
      {
        vi: "Chọn lượt giá trị 2 theo price tăng dần nếu rẻ hơn hai món thường, rồi dùng tiền còn lại mua món rẻ nhất.",
        en: "Take value-2 slots by ascending price while cheaper than two regular copies, then buy the cheapest item with the remainder.",
      },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: {
        vi: "Sàng bội O(M log M), sắp xếp O(n log n), với M = max(factor) ≤ n.",
        en: "The multiples sieve costs O(M log M) and sorting costs O(n log n), where M = max(factor) ≤ n.",
      },
    },
    code: [
      "class Solution:",
      "    def maximumSaleItems(self, items, budget):",
      "        n = len(items)",
      "        max_factor = max(factor for factor, _ in items)",
      "        freq = [0] * (max_factor + 1)",
      "        for factor, price in items:",
      "            freq[factor] += 1",
      "        multiples = [0] * (max_factor + 1)",
      "        for d in range(1, max_factor + 1):",
      "            for m in range(d, max_factor + 1, d):",
      "                multiples[d] += freq[m]",
      "        boosted = [(price, multiples[factor] - 1) for factor, price in items]",
      "        boosted.sort()",
      "        cheapest = min(price for _, price in items)",
      "        total = 0",
      "        for price, limit in boosted:",
      "            if price >= 2 * cheapest: break",
      "            take = min(limit, budget // price)",
      "            total += 2 * take",
      "            budget -= take * price",
      "            if take < limit: break",
      "        return total + budget // cheapest",
    ],
    builder: buildSteps3947,
  },
  4000: {
    id: 4000,
    difficulty: "easy",
    slug: "largest-integer-with-given-digit-sum",
    category: { key: "greedy", vi: "Tham lam & Sắp xếp", en: "Greedy & Sorting" },
    title: { vi: "Largest Integer With Given Digit Sum", en: "Largest Integer With Given Digit Sum" },
    titleVi: { vi: "Số lớn nhất có tổng chữ số cho trước", en: "Largest integer with a given digit sum" },
    statement: {
      vi: "Cho hai số nguyên không âm n và s. Trả về số nguyên lớn nhất có tối đa n chữ số và có tổng các chữ số bằng s. Nếu không tồn tại, trả về -1.",
      en: "Given two non-negative integers n and s, return the largest integer with at most n digits whose digit sum is s. If no such integer exists, return -1.",
    },
    defaultInput: [2],
    inputKind: "positive",
    inputLabel: { vi: "n (số chữ số tối đa)", en: "n (maximum digits)" },
    singleInput: true,
    maxInput: 5,
    extraParams: [
      { key: "s", label: { vi: "s (tổng chữ số)", en: "s (digit sum)" }, type: "number", min: 0, max: 100, default: 9 },
    ],
    approach: [
      {
        vi: "Nếu s > 9 × n thì không thể tạo số hợp lệ, vì mỗi chữ số chỉ tối đa bằng 9.",
        en: "If s > 9 × n, no valid integer exists because every digit is at most 9.",
      },
      {
        vi: "Để số lớn nhất, ưu tiên giá trị hàng cao: tại mỗi vị trí từ trái sang phải, chọn digit = min(9, s còn lại).",
        en: "To maximize the integer, prioritize higher place values: at each position from left to right, choose digit = min(9, remaining sum).",
      },
      {
        vi: "Ghép digit vào answer rồi trừ digit khỏi tổng còn lại. Với s = 0, kết quả tự nhiên là 0.",
        en: "Append the digit to answer, then subtract it from the remaining sum. When s = 0, the result is naturally 0.",
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt tối đa n vị trí chữ số và chỉ dùng vài biến. Mảng digits chỉ phục vụ visualization.",
        en: "Scan at most n digit positions and use only a few variables. The digits array exists only for visualization.",
      },
    },
    code: [
      "class Solution:",
      "    def largestInteger(self, n: int, s: int) -> int:",
      "        if s > 9 * n:",
      "            return -1",
      "        answer = 0",
      "        for position in range(n):",
      "            digit = min(9, s)",
      "            answer = answer * 10 + digit",
      "            s -= digit",
      "        return answer",
    ],
    builder: buildSteps4000,
  },
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
    code3: [
      "class Solution:",
      "    def maxProfit(self, prices):",
      "        min_price = prices[0]",
      "        prev_dp = 0",
      "        for i in range(1, len(prices)):",
      "            cur_dp = max(prev_dp, prices[i] - min_price)",
      "            prev_dp = cur_dp",
      "            min_price = min(min_price, prices[i])",
      "        return prev_dp",
    ],
    codeLabel: { vi: "Cách 1: Greedy O(1)", en: "Approach 1: Greedy O(1)" },
    code2Label: { vi: "Cách 2: DP Array O(n)", en: "Approach 2: DP Array O(n)" },
    code3Label: { vi: "Cách 3: DP Rolling O(1) space", en: "Approach 3: DP Rolling O(1) space" },
    builder: buildSteps121,
  },
  122: {
    id: 122,
    difficulty: "medium",
    slug: "best-time-to-buy-and-sell-stock-ii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Best Time to Buy and Sell Stock II", en: "Best Time to Buy and Sell Stock II" },
    titleVi: { vi: "Mua bán cổ phiếu (nhiều lần)", en: "Buy and sell stock multiple times" },
    statement: {
      vi: "Cho mảng prices[i] = giá cổ phiếu ngày i. Được phép MUA BÁN NHIỀU LẦN (nhưng chỉ giữ tối đa 1 cổ phiếu cùng lúc). Tìm lợi nhuận TỐI ĐA.",
      en: "Given prices[i] = stock price on day i. You may BUY and SELL MULTIPLE times (hold at most 1 share at a time). Find MAXIMUM profit.",
    },
    defaultInput: [7, 1, 5, 3, 6, 4],
    inputKind: "integer",
    inputLabel: { vi: "Giá cổ phiếu (dấu phẩy)", en: "Stock prices (comma-separated)" },
    extraParams: [
      { key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1", options: [
        { value: "1", label: { vi: "Cách 1: Greedy (cộng mọi đoạn tăng)", en: "Approach 1: Greedy (collect every gain)" } },
        { value: "2", label: { vi: "Cách 2: DP (hold/not-hold)", en: "Approach 2: DP (hold/not-hold)" } },
      ] },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Cả 2 cách đều O(n) time, O(1) space.", en: "Both approaches are O(n) time, O(1) space." } },
    code: [
      "class Solution:",
      "    def maxProfit(self, prices):",
      "        profit = 0",
      "        for i in range(1, len(prices)):",
      "            if prices[i] > prices[i-1]:",
      "                profit += prices[i] - prices[i-1]",
      "        return profit",
    ],
    code2: [
      "class Solution:",
      "    def maxProfit(self, prices):",
      "        # hold = max profit khi ĐANG giữ stock",
      "        # cash = max profit khi KHÔNG giữ stock",
      "        hold = -prices[0]",
      "        cash = 0",
      "        for i in range(1, len(prices)):",
      "            hold = max(hold, cash - prices[i])",
      "            cash = max(cash, hold + prices[i])",
      "        return cash",
    ],
    codeLabel: { vi: "Cách 1: Greedy", en: "Approach 1: Greedy" },
    code2Label: { vi: "Cách 2: DP hold/cash", en: "Approach 2: DP hold/cash" },
    builder: buildSteps122,
  },
  123: {
    id: 123,
    difficulty: "hard",
    slug: "best-time-to-buy-and-sell-stock-iii",
    category: { key: "dp", vi: "Quy hoach dong", en: "Dynamic Programming" },
    title: { vi: "Best Time to Buy and Sell Stock III", en: "Best Time to Buy and Sell Stock III" },
    titleVi: { vi: "Mua ban co phieu toi da 2 lan", en: "Buy and sell stock at most twice" },
    statement: {
      vi: "Cho prices[i] la gia co phieu ngay i. Duoc thuc hien toi da 2 giao dich, moi giao dich gom mua roi ban, va khong duoc giu nhieu hon 1 co phieu cung luc. Tim loi nhuan toi da.",
      en: "Given prices[i] as the stock price on day i. You may complete at most two transactions, each transaction is one buy followed by one sell, and you may hold at most one share at a time. Find the maximum profit.",
    },
    defaultInput: [3, 3, 5, 0, 0, 3, 1, 4],
    inputKind: "integer",
    inputLabel: { vi: "Gia co phieu (dau phay)", en: "Stock prices (comma-separated)" },
    extraParams: [],
    approach: [
      { vi: "Dung 4 trang thai rolling: buy1, sell1, buy2, sell2.", en: "Use four rolling states: buy1, sell1, buy2, sell2." },
      { vi: "buy1 = loi nhuan tot nhat sau lan mua 1; sell1 = sau lan ban 1; buy2 = sau lan mua 2; sell2 = sau lan ban 2.", en: "buy1 = best profit after first buy; sell1 = after first sell; buy2 = after second buy; sell2 = after second sell." },
      { vi: "Dap an la sell2, loi nhuan tot nhat sau toi da 2 giao dich va khong giu co phieu.", en: "The answer is sell2, the best profit after at most two transactions while holding no stock." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: { vi: "Duyet prices mot lan va chi giu 4 bien trang thai.", en: "Scan prices once and keep only four state variables." },
    },
    code: [
      "class Solution:",
      "    def maxProfit(self, prices):",
      "        buy1 = buy2 = -prices[0]",
      "        sell1 = sell2 = 0",
      "        for i in range(1, len(prices)):",
      "            buy1 = max(buy1, -prices[i])",
      "            sell1 = max(sell1, buy1 + prices[i])",
      "            buy2 = max(buy2, sell1 - prices[i])",
      "            sell2 = max(sell2, buy2 + prices[i])",
      "        return sell2",
    ],
    builder: buildSteps123,
  },
  714: {
    id: 714,
    difficulty: "medium",
    slug: "best-time-to-buy-and-sell-stock-with-transaction-fee",
    category: { key: "dp", vi: "Quy hoach dong", en: "Dynamic Programming" },
    title: { vi: "Best Time to Buy and Sell Stock with Transaction Fee", en: "Best Time to Buy and Sell Stock with Transaction Fee" },
    titleVi: { vi: "Mua ban co phieu co phi giao dich", en: "Buy and sell stock with transaction fee" },
    statement: {
      vi: "Cho prices[i] la gia co phieu ngay i va phi giao dich fee. Duoc mua/ban nhieu lan, nhung moi lan ban phai tra fee va chi giu toi da 1 co phieu. Tim loi nhuan toi da.",
      en: "Given prices[i] and a transaction fee. You may buy and sell multiple times, but each sale pays fee and you may hold at most one share. Find the maximum profit.",
    },
    defaultInput: [1, 3, 2, 8, 4, 9],
    inputKind: "integer",
    inputLabel: { vi: "Gia co phieu (dau phay)", en: "Stock prices (comma-separated)" },
    extraParams: [
      { key: "fee", label: { vi: "fee (phi giao dich)", en: "fee (transaction fee)" }, type: "number", default: 2 },
    ],
    approach: [
      { vi: "Dung 2 trang thai: hold = loi nhuan tot nhat khi dang giu co phieu; cash = loi nhuan tot nhat khi khong giu.", en: "Use 2 states: hold = best profit while holding stock; cash = best profit while not holding." },
      { vi: "Mua: hold = max(hold, cash - price). Ban: cash = max(cash, hold + price - fee).", en: "Buy: hold = max(hold, cash - price). Sell: cash = max(cash, hold + price - fee)." },
      { vi: "Dap an la cash vi ket thuc toi uu la khong giu co phieu.", en: "The answer is cash because the optimal final state holds no stock." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: { vi: "Duyet prices mot lan, chi giu hai bien hold va cash.", en: "Scan prices once and keep only hold and cash." },
    },
    code: [
      "class Solution:",
      "    def maxProfit(self, prices, fee):",
      "        hold = -prices[0]",
      "        cash = 0",
      "        for i in range(1, len(prices)):",
      "            hold = max(hold, cash - prices[i])",
      "            cash = max(cash, hold + prices[i] - fee)",
      "        return cash",
    ],
    builder: buildSteps714,
  },
};
