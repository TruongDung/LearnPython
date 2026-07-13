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
