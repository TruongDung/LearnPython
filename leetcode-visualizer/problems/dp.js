// Auto-generated: do not edit headers manually.
// Module of LeetCode Visualizer — category-specific builders and problem entries.

/**
 * Generate steps for LeetCode 746: Min Cost Climbing Stairs.
 *
 * Dynamic programming:
 *  - dp[i] = minimum cost to reach step i (0-indexed, with "top" = n).
 *  - dp[0] = dp[1] = 0 (allowed to start at step 0 or 1).
 *  - dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2]).
 *  - The answer is dp[n].
 */
function buildSteps304(input, params) {
  const fallback = [[3, 0, 1, 4, 2], [5, 6, 3, 2, 1], [1, 2, 0, 1, 5], [4, 1, 0, 1, 7], [1, 0, 3, 0, 5]];
  let matrix;
  try {
    const raw = String(input ?? "").trim();
    matrix = raw.startsWith("[")
      ? JSON.parse(raw)
      : raw.split(";").map((row) => row.split(",").map((value) => Number(value.trim())));
  } catch (_error) {
    matrix = fallback;
  }

  const valid = Array.isArray(matrix)
    && matrix.length > 0
    && Array.isArray(matrix[0])
    && matrix[0].length > 0
    && matrix.every((row) => row.length === matrix[0].length && row.every(Number.isFinite));
  if (!valid) matrix = fallback;

  const rows = matrix.length;
  const cols = matrix[0].length;
  const clamp = (value, max) => Math.max(0, Math.min(max, Number.parseInt(value, 10) || 0));
  const firstRow = clamp(params && params.row1, rows - 1);
  const firstCol = clamp(params && params.col1, cols - 1);
  const secondRow = clamp(params && params.row2, rows - 1);
  const secondCol = clamp(params && params.col2, cols - 1);
  const row1 = Math.min(firstRow, secondRow);
  const col1 = Math.min(firstCol, secondCol);
  const row2 = Math.max(firstRow, secondRow);
  const col2 = Math.max(firstCol, secondCol);
  const prefix = Array.from({ length: rows + 1 }, () => Array(cols + 1).fill(0));
  const steps = [];

  const view = ({ matrixCell = null, prefixCell = null, region = null, terms = [], status = [] } = {}) => ({
    matrix: matrix.map((row) => [...row]),
    prefix: prefix.map((row) => [...row]),
    matrixCell,
    prefixCell,
    region,
    terms,
    status,
  });

  steps.push({
    title: { vi: "Khoi tao bang prefix co vien 0", en: "Initialize a zero-padded prefix table" },
    codeLines: [4],
    prefix2DView: view({
      status: [
        { label: "matrix", value: `${rows} x ${cols}` },
        { label: "prefix", value: `${rows + 1} x ${cols + 1}` },
      ],
    }),
    vars: [{ name: "m", value: rows }, { name: "n", value: cols }, { name: "prefix", value: JSON.stringify(prefix) }],
    note: {
      vi: "Them mot hang va mot cot 0 de moi cong thuc deu dung, ke ca o nam tren bien.",
      en: "The extra zero row and column keep the same formula valid at every boundary.",
    },
  });

  for (let row = 1; row <= rows; row += 1) {
    for (let col = 1; col <= cols; col += 1) {
      const value = matrix[row - 1][col - 1];
      const up = prefix[row - 1][col];
      const left = prefix[row][col - 1];
      const overlap = prefix[row - 1][col - 1];
      prefix[row][col] = value + up + left - overlap;
      steps.push({
        title: { vi: `prefix[${row}][${col}] = ${prefix[row][col]}`, en: `prefix[${row}][${col}] = ${prefix[row][col]}` },
        codeLines: [7],
        prefix2DView: view({
          matrixCell: [row - 1, col - 1],
          prefixCell: [row, col],
          terms: [
            { row: row - 1, col, label: "+UP", kind: "add" },
            { row, col: col - 1, label: "+LEFT", kind: "add" },
            { row: row - 1, col: col - 1, label: "-DIAG", kind: "subtract" },
          ],
          status: [
            { label: "matrix cell", value },
            { label: "formula", value: `${value} + ${up} + ${left} - ${overlap}` },
            { label: "prefix value", value: prefix[row][col] },
          ],
        }),
        vars: [
          { name: "row", value: row },
          { name: "col", value: col },
          { name: `matrix[${row - 1}][${col - 1}]`, value },
          { name: `prefix[${row}][${col}]`, value: prefix[row][col] },
        ],
        note: {
          vi: `${value} + tren ${up} + trai ${left} - phan giao ${overlap} = ${prefix[row][col]}.`,
          en: `${value} + up ${up} + left ${left} - overlap ${overlap} = ${prefix[row][col]}.`,
        },
      });
    }
  }

  const region = { row1, col1, row2, col2 };
  const queryTerms = [
    { row: row2 + 1, col: col2 + 1, label: "+BR", kind: "add" },
    { row: row1, col: col2 + 1, label: "-TOP", kind: "subtract" },
    { row: row2 + 1, col: col1, label: "-LEFT", kind: "subtract" },
    { row: row1, col: col1, label: "+OVR", kind: "add" },
  ];
  const bottomRight = prefix[row2 + 1][col2 + 1];
  const above = prefix[row1][col2 + 1];
  const left = prefix[row2 + 1][col1];
  const overlap = prefix[row1][col1];
  const answer = bottomRight - above - left + overlap;
  const queryVars = [
    { name: "row1", value: row1 }, { name: "col1", value: col1 },
    { name: "row2", value: row2 }, { name: "col2", value: col2 },
  ];

  [
    { line: 15, title: "bottom_right", value: bottomRight },
    { line: 16, title: "above", value: above },
    { line: 17, title: "left", value: left },
    { line: 18, title: "overlap", value: overlap },
  ].forEach((item, index) => {
    steps.push({
      title: { vi: `${item.title} = ${item.value}`, en: `${item.title} = ${item.value}` },
      codeLines: [item.line],
      prefix2DView: view({
        region,
        terms: queryTerms.slice(0, index + 1),
        status: [
          { label: "query", value: `(${row1},${col1}) -> (${row2},${col2})` },
          { label: item.title, value: item.value },
        ],
      }),
      vars: [...queryVars, { name: item.title, value: item.value }],
      note: {
        vi: "Moi goc cua bang prefix them hoac bot mot hinh chu nhat lon.",
        en: "Each prefix-table corner adds or removes one larger rectangle.",
      },
    });
  });

  steps.push({
    title: { vi: `Ket qua sumRegion = ${answer}`, en: `sumRegion result = ${answer}` },
    codeLines: [19],
    prefix2DView: view({
      region,
      terms: queryTerms,
      status: [
        { label: "region", value: `(${row1},${col1}) -> (${row2},${col2})` },
        { label: "formula", value: `${bottomRight} - ${above} - ${left} + ${overlap}` },
        { label: "result", value: answer },
      ],
    }),
    vars: [...queryVars, { name: "result", value: answer }],
    note: {
      vi: `Lay ${bottomRight} - ${above} - ${left} + ${overlap} = ${answer}. Truy van chi can 4 o prefix nen la O(1).`,
      en: `${bottomRight} - ${above} - ${left} + ${overlap} = ${answer}. The query reads four prefix cells, so it is O(1).`,
    },
    final: true,
  });

  return { steps, answer };
}

function buildSteps746(cost, params) {
  const approach = (params && params.approach) || 1;
  if (approach === 2) return buildSteps746B(cost);

  const n = cost.length;
  const dp = new Array(n + 1).fill(0);
  const steps = [];

  // Line 3: dp = [0] * (n+1)
  steps.push({
    title: { vi: "dp = [0] * (n+1)", en: "dp = [0] * (n+1)" },
    arr: [...dp],
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [{ name: "n", value: n }, { name: "cost", value: `[${cost.join(",")}]` }, { name: "dp", value: `[${dp.join(",")}]` }],
    note: { vi: `dp[0]=dp[1]=0 vì được phép bắt đầu ở bậc 0 hoặc 1 miễn phí.`, en: `dp[0]=dp[1]=0 since you may start at step 0 or 1 for free.` },
  });

  // Line 4: dp[0] = dp[1] = 0 (already 0, just show)
  steps.push({
    title: { vi: "dp[0] = dp[1] = 0 (bắt đầu miễn phí)", en: "dp[0] = dp[1] = 0 (start free)" },
    arr: [...dp],
    highlight: [0, 1],
    mark: [],
    codeLines: [4],
    vars: [{ name: "dp[0]", value: 0 }, { name: "dp[1]", value: 0 }],
    note: { vi: `Được phép bắt đầu ở bậc 0 hoặc 1 → chi phí = 0.`, en: `May start at step 0 or 1 → cost = 0.` },
  });

  for (let i = 2; i <= n; i++) {
    const optA = dp[i - 1] + cost[i - 1];
    const optB = dp[i - 2] + cost[i - 2];

    // Line 5: for i in range(2, n+1)
    steps.push({
      title: { vi: `Vòng lặp i=${i}`, en: `Loop i=${i}` },
      arr: [...dp],
      highlight: [i],
      mark: [],
      codeLines: [5],
      vars: [{ name: "i", value: i }, { name: "dp[i-1]", value: dp[i-1] }, { name: "cost[i-1]", value: cost[i-1] }, { name: "dp[i-2]", value: dp[i-2] }, { name: "cost[i-2]", value: cost[i-2] }],
      note: { vi: `Tính dp[${i}]: từ bậc ${i-1} (cost ${cost[i-1]}) hoặc bậc ${i-2} (cost ${cost[i-2]}).`, en: `Compute dp[${i}]: from step ${i-1} (cost ${cost[i-1]}) or step ${i-2} (cost ${cost[i-2]}).` },
    });

    // Line 6: dp[i] = min(dp[i-1]+cost[i-1], dp[i-2]+cost[i-2])
    dp[i] = Math.min(optA, optB);
    steps.push({
      title: { vi: `dp[${i}] = min(${optA}, ${optB}) = ${dp[i]}`, en: `dp[${i}] = min(${optA}, ${optB}) = ${dp[i]}` },
      arr: [...dp],
      highlight: [i - 2, i - 1, i],
      mark: [i],
      codeLines: [6],
      vars: [
        { name: "dp[i-1]+cost[i-1]", value: `${dp[i-1]}+${cost[i-1]} = ${optA}` },
        { name: "dp[i-2]+cost[i-2]", value: `${dp[i-2]}+${cost[i-2]} = ${optB}` },
        { name: `dp[${i}] = min(${optA},${optB})`, value: dp[i] },
        { name: "dp", value: `[${dp.join(",")}]` },
      ],
      note: { vi: `dp[${i}] = min(${optA}, ${optB}) = ${dp[i]}.`, en: `dp[${i}] = min(${optA}, ${optB}) = ${dp[i]}.` },
    });
  }

  // Line 7: return dp[n]
  steps.push({
    title: { vi: `Kết quả: dp[${n}] = ${dp[n]}`, en: `Result: dp[${n}] = ${dp[n]}` },
    arr: [...dp],
    highlight: [],
    mark: [n],
    final: true,
    codeLines: [7],
    vars: [{ name: "answer", value: dp[n] }, { name: "dp", value: `[${dp.join(",")}]` }],
    note: { vi: `Chi phí nhỏ nhất = dp[${n}] = ${dp[n]}.`, en: `Minimum cost = dp[${n}] = ${dp[n]}.` },
  });

  return { cost: [...cost], answer: dp[n], steps };
}

/**
 * LeetCode 746 — Approach 2: Optimized O(1) space.
 * Track only prev2 = cost to land on i-2, prev1 = cost to land on i-1.
 * curr = cost[i] + min(prev1, prev2); shift prev2 = prev1, prev1 = curr.
 * Answer = min(prev1, prev2).
 */
function buildSteps746B(cost) {
  const n = cost.length;
  const steps = [];

  const history = [cost[0], cost[1]];
  let prev2 = cost[0];
  let prev1 = cost[1];

  // Line 3: prev2 = cost[0]
  steps.push({
    title: { vi: `prev2 = cost[0] = ${prev2}`, en: `prev2 = cost[0] = ${prev2}` },
    arr: [...history],
    sub: ["prev2", "·"],
    highlight: [0],
    mark: [],
    codeBlock: 2,
    codeLines: [3],
    vars: [{ name: "n", value: n }, { name: "prev2", value: prev2 }],
    note: { vi: `prev2 = cost[0] = ${prev2} (chi phí đứng trên bậc 0).`, en: `prev2 = cost[0] = ${prev2} (cost to stand on stair 0).` },
  });

  // Line 4: prev1 = cost[1]
  steps.push({
    title: { vi: `prev1 = cost[1] = ${prev1}`, en: `prev1 = cost[1] = ${prev1}` },
    arr: [...history],
    sub: ["prev2", "prev1"],
    highlight: [1],
    mark: [],
    codeBlock: 2,
    codeLines: [4],
    vars: [{ name: "prev2", value: prev2 }, { name: "prev1", value: prev1 }],
    note: { vi: `prev1 = cost[1] = ${prev1} (chi phí đứng trên bậc 1).`, en: `prev1 = cost[1] = ${prev1} (cost to stand on stair 1).` },
  });

  for (let i = 2; i < n; i++) {
    const curr = cost[i] + Math.min(prev1, prev2);
    history.push(curr);

    // Line 6: for i in range(2, n)
    steps.push({
      title: { vi: `Vòng lặp i=${i}`, en: `Loop i=${i}` },
      arr: [...history].slice(0, -1),
      sub: history.slice(0, -1).map((_, idx) => { if (idx === i - 2) return "prev2"; if (idx === i - 1) return "prev1"; return `c[${idx}]`; }),
      highlight: [i - 2, i - 1],
      mark: [],
      codeBlock: 2,
      codeLines: [6],
      vars: [{ name: "i", value: i }, { name: "cost[i]", value: cost[i] }, { name: "prev2", value: prev2 }, { name: "prev1", value: prev1 }],
      note: { vi: `Xét bậc ${i}: cost[${i}]=${cost[i]}.`, en: `Consider stair ${i}: cost[${i}]=${cost[i]}.` },
    });

    // Line 7: curr = cost[i] + min(prev1, prev2)
    const subLabels = history.map((_, idx) => { if (idx === i - 2) return "prev2"; if (idx === i - 1) return "prev1"; if (idx === i) return "curr"; return `c[${idx}]`; });
    steps.push({
      title: { vi: `curr = ${cost[i]} + min(${prev1},${prev2}) = ${curr}`, en: `curr = ${cost[i]} + min(${prev1},${prev2}) = ${curr}` },
      arr: [...history],
      sub: subLabels,
      highlight: [i - 2, i - 1, i],
      mark: [i],
      codeBlock: 2,
      codeLines: [7],
      vars: [{ name: "curr = cost[i]+min(prev1,prev2)", value: `${cost[i]} + min(${prev1},${prev2}) = ${cost[i]} + ${Math.min(prev1,prev2)} = ${curr}` }],
      note: { vi: `curr = cost[${i}] + min(prev1, prev2) = ${cost[i]} + ${Math.min(prev1,prev2)} = ${curr}.`, en: `curr = cost[${i}] + min(prev1, prev2) = ${cost[i]} + ${Math.min(prev1,prev2)} = ${curr}.` },
    });

    // Line 8: prev2 = prev1
    prev2 = prev1;
    steps.push({
      title: { vi: `prev2 = ${prev2}`, en: `prev2 = ${prev2}` },
      arr: [...history],
      sub: history.map((_, idx) => { if (idx === i - 1) return "prev2"; if (idx === i) return "curr"; return `c[${idx}]`; }),
      highlight: [i - 1],
      mark: [],
      codeBlock: 2,
      codeLines: [8],
      vars: [{ name: "prev2", value: prev2 }],
      note: { vi: `prev2 ← ${prev2}.`, en: `prev2 ← ${prev2}.` },
    });

    // Line 9: prev1 = curr
    prev1 = curr;
    steps.push({
      title: { vi: `prev1 = ${prev1}`, en: `prev1 = ${prev1}` },
      arr: [...history],
      sub: history.map((_, idx) => { if (idx === i - 1) return "prev2"; if (idx === i) return "prev1"; return `c[${idx}]`; }),
      highlight: [i],
      mark: [],
      codeBlock: 2,
      codeLines: [9],
      vars: [{ name: "prev1", value: prev1 }],
      note: { vi: `prev1 ← ${prev1}.`, en: `prev1 ← ${prev1}.` },
    });
  }

  const answer = Math.min(prev1, prev2);

  // Line 11: return min(prev1, prev2)
  steps.push({
    title: { vi: `Kết quả: min(${prev1},${prev2}) = ${answer}`, en: `Result: min(${prev1},${prev2}) = ${answer}` },
    arr: [...history],
    sub: history.map((_, idx) => { if (idx === n - 2) return "prev2"; if (idx === n - 1) return "prev1"; return `c[${idx}]`; }),
    highlight: [],
    mark: [n - 2, n - 1],
    final: true,
    codeBlock: 2,
    codeLines: [11],
    vars: [{ name: "answer", value: `min(${prev1}, ${prev2}) = ${answer}` }],
    note: { vi: `min(prev1, prev2) = min(${prev1}, ${prev2}) = ${answer}. O(1) bộ nhớ.`, en: `min(prev1, prev2) = min(${prev1}, ${prev2}) = ${answer}. O(1) memory.` },
  });

  return { cost: [...cost], answer, steps };
}

/**
 * Generate steps for LeetCode 152: Maximum Product Subarray.
 *
 * Since a negative number can turn the smallest product into the largest, track both:
 *  - curMax: largest product of subarray ending at i.
 *  - curMin: smallest product of subarray ending at i.
 *  - result: the largest answer seen so far.
 */
function buildSteps152Swap(nums) {
  if (!Array.isArray(nums) || nums.length === 0) {
    throw new Error("nums must contain at least one integer.");
  }

  const steps = [];
  const n = nums.length;
  let curMax = nums[0];
  let curMin = nums[0];
  let best = nums[0];
  let maxStart = 0;
  let minStart = 0;
  let maxEnd = 0;
  let minEnd = 0;
  let bestStart = 0;
  let bestEnd = 0;
  let i = 0;
  let x = nums[0];
  let phase = "init";
  let prevMax = null;
  let prevMin = null;
  let prevMaxStart = 0;
  let prevMinStart = 0;
  let maxBase = null;
  let minBase = null;
  let maxBaseStart = 0;
  let minBaseStart = 0;
  let extendMax = null;
  let extendMin = null;
  let maxSource = "init";
  let minSource = "init";
  let swapped = false;
  let zeroReset = nums[0] === 0;
  let oldBest = best;
  let bestUpdated = true;
  const maxHistory = Array(n).fill(null);
  const minHistory = Array(n).fill(null);
  const bestHistory = Array(n).fill(null);
  maxHistory[0] = curMax;
  minHistory[0] = curMin;
  bestHistory[0] = best;

  const indices = (start, end) => (
    Number.isInteger(start) && Number.isInteger(end) && start <= end
      ? Array.from({ length: end - start + 1 }, (_, offset) => start + offset)
      : []
  );
  const rangeValues = (start, end) => indices(start, end).map((index) => nums[index]);
  const nextNegativeIndex = (from) => {
    for (let j = from; j < n; j++) if (nums[j] < 0) return j;
    return null;
  };
  const snapshot = () => {
    const upcomingNegative = phase === "done" ? null : nextNegativeIndex(i + 1);
    return {
      approach: 1,
      nums: [...nums],
      phase,
      i,
      x,
      prevMax,
      prevMin,
      prevMaxStart,
      prevMinStart,
      maxBase,
      minBase,
      maxBaseStart,
      minBaseStart,
      extendMax,
      extendMin,
      curMax,
      curMin,
      oldBest,
      best,
      maxStart,
      maxEnd,
      minStart,
      minEnd,
      bestStart,
      bestEnd,
      maxSource,
      minSource,
      maxPick: maxSource === "pending" ? null : maxSource === "restart" ? "restart" : "extend",
      minPick: minSource === "pending" ? null : minSource === "restart" ? "restart" : "extend",
      maxValues: rangeValues(maxStart, maxEnd),
      minValues: rangeValues(minStart, minEnd),
      bestValues: rangeValues(bestStart, bestEnd),
      prevMaxValues: rangeValues(prevMaxStart, i - 1),
      prevMinValues: rangeValues(prevMinStart, i - 1),
      upcomingNegativeIndex: upcomingNegative,
      upcomingNegativeValue: upcomingNegative === null ? null : nums[upcomingNegative],
      minFlipPreview: upcomingNegative === null ? null : curMin * nums[upcomingNegative],
      maxFlipPreview: upcomingNegative === null ? null : curMax * nums[upcomingNegative],
      swapped,
      zeroReset,
      bestUpdated,
      maxHistory: [...maxHistory],
      minHistory: [...minHistory],
      bestHistory: [...bestHistory],
    };
  };
  const addStep = ({ title, note, codeLine, vars = [], final = false }) => {
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      final,
      arr: [...nums],
      highlight: Number.isInteger(i) ? [i] : [],
      mark: indices(bestStart, bestEnd),
      vars: [
        { name: "i", value: i },
        { name: "x", value: x },
        { name: "cur_max", value: curMax },
        { name: "cur_min", value: curMin },
        { name: "result", value: best },
        ...vars,
      ],
      maxProductView: snapshot(),
    });
  };

  addStep({
    title: { vi: `Khởi tạo bằng nums[0] = ${x}`, en: `Initialize from nums[0] = ${x}` },
    note: {
      vi: "Mọi subarray kết thúc tại index 0 chỉ có một lựa chọn. Vì vậy cur_max, cur_min và result đều bằng nums[0].",
      en: "Every subarray ending at index 0 has one choice, so cur_max, cur_min, and result all equal nums[0].",
    },
    codeLine: 3,
    vars: [{ name: "range", value: "[0..0]" }],
  });

  for (i = 1; i < n; i++) {
    x = nums[i];
    prevMax = curMax;
    prevMin = curMin;
    prevMaxStart = maxStart;
    prevMinStart = minStart;
    maxBase = prevMax;
    minBase = prevMin;
    maxBaseStart = prevMaxStart;
    minBaseStart = prevMinStart;
    extendMax = null;
    extendMin = null;
    maxSource = "pending";
    minSource = "pending";
    swapped = false;
    zeroReset = x === 0;
    oldBest = best;
    bestUpdated = false;
    phase = "loop";

    addStep({
      title: { vi: `Vòng lặp chuyển tới index ${i}`, en: `Loop advances to index ${i}` },
      note: {
        vi: `Dòng 4 bắt đầu xử lý mọi subarray phải kết thúc tại index ${i}.`,
        en: `Line 4 starts processing every subarray that must end at index ${i}.`,
      },
      codeLine: 4,
      vars: [{ name: "previous max/min", value: `${prevMax} / ${prevMin}` }],
    });

    phase = "read";
    addStep({
      title: { vi: `Đọc x = nums[${i}] = ${x}`, en: `Read x = nums[${i}] = ${x}` },
      note: zeroReset
        ? { vi: "x = 0 sẽ chặn mọi tích trước đó: cả max và min kết thúc tại đây đều trở thành 0.", en: "x = 0 blocks every earlier product: both ending max and ending min become 0 here." }
        : { vi: `Ta có thể bắt đầu lại từ ${x}, hoặc nối ${x} vào một tích kết thúc tại index ${i - 1}.`, en: `We can restart from ${x}, or append ${x} to a product ending at index ${i - 1}.` },
      codeLine: 5,
    });

    phase = "sign";
    addStep({
      title: x < 0
        ? { vi: `${x} < 0: max và min sắp đổi vai trò`, en: `${x} < 0: max and min will trade roles` }
        : { vi: `${x} không âm: không cần đổi vai trò`, en: `${x} is nonnegative: no role swap` },
      note: x < 0
        ? { vi: "Nhân với số âm đảo thứ tự: tích nhỏ nhất có thể trở thành lớn nhất, và tích lớn nhất có thể trở thành nhỏ nhất.", en: "Multiplying by a negative reverses order: the smallest product can become the largest, and vice versa." }
        : zeroReset
          ? { vi: "0 không cần swap; bước cập nhật tiếp theo sẽ reset cả hai trạng thái về 0.", en: "Zero needs no swap; the next updates reset both states to 0." }
          : { vi: "Với số dương, nhánh max tiếp tục từ max và nhánh min tiếp tục từ min.", en: "With a positive value, the max lane extends max and the min lane extends min." },
      codeLine: 6,
      vars: [{ name: "x < 0", value: x < 0 }],
    });

    if (x < 0) {
      [maxBase, minBase] = [prevMin, prevMax];
      [maxBaseStart, minBaseStart] = [prevMinStart, prevMaxStart];
      swapped = true;
      phase = "swap";
      addStep({
        title: { vi: `Swap: max-base=${maxBase}, min-base=${minBase}`, en: `Swap: max-base=${maxBase}, min-base=${minBase}` },
        note: {
          vi: `Dòng 7 đổi vai trò. Nhánh max nhận cur_min cũ ${prevMin}; nhánh min nhận cur_max cũ ${prevMax}.`,
          en: `Line 7 swaps roles. The max lane receives old cur_min ${prevMin}; the min lane receives old cur_max ${prevMax}.`,
        },
        codeLine: 7,
        vars: [{ name: "max base ← old min", value: maxBase }, { name: "min base ← old max", value: minBase }],
      });
    }

    extendMax = maxBase * x;
    const restartMax = x >= extendMax;
    curMax = restartMax ? x : extendMax;
    maxStart = restartMax ? i : maxBaseStart;
    maxEnd = i;
    maxSource = restartMax ? "restart" : swapped ? "previous-min" : "previous-max";
    maxHistory[i] = curMax;
    phase = "max";
    addStep({
      title: { vi: `cur_max = max(${x}, ${maxBase}×${x}) = ${curMax}`, en: `cur_max = max(${x}, ${maxBase}×${x}) = ${curMax}` },
      note: restartMax
        ? { vi: `Bắt đầu subarray mới tại index ${i} vì ${x} ≥ ${extendMax}.`, en: `Restart at index ${i} because ${x} ≥ ${extendMax}.` }
        : { vi: `Mở rộng range [${maxBaseStart}..${i - 1}] vì ${extendMax} lớn hơn ${x}.`, en: `Extend range [${maxBaseStart}..${i - 1}] because ${extendMax} is larger than ${x}.` },
      codeLine: 8,
      vars: [{ name: "restart", value: x }, { name: "extend", value: `${maxBase} × ${x} = ${extendMax}` }, { name: "max range", value: `[${maxStart}..${maxEnd}]` }],
    });

    extendMin = minBase * x;
    const restartMin = x <= extendMin;
    curMin = restartMin ? x : extendMin;
    minStart = restartMin ? i : minBaseStart;
    minEnd = i;
    minSource = restartMin ? "restart" : swapped ? "previous-max" : "previous-min";
    minHistory[i] = curMin;
    phase = "min";
    addStep({
      title: { vi: `cur_min = min(${x}, ${minBase}×${x}) = ${curMin}`, en: `cur_min = min(${x}, ${minBase}×${x}) = ${curMin}` },
      note: {
        vi: `Giữ tích nhỏ nhất ${curMin} kết thúc tại i=${i}; một số âm phía sau có thể biến nó thành max lớn nhất.`,
        en: `Keep the smallest product ${curMin} ending at i=${i}; a later negative can turn it into the largest max.`,
      },
      codeLine: 9,
      vars: [{ name: "restart", value: x }, { name: "extend", value: `${minBase} × ${x} = ${extendMin}` }, { name: "min range", value: `[${minStart}..${minEnd}]` }],
    });

    oldBest = best;
    if (curMax > best) {
      best = curMax;
      bestStart = maxStart;
      bestEnd = i;
      bestUpdated = true;
    }
    bestHistory[i] = best;
    phase = "best";
    addStep({
      title: { vi: `result = max(${oldBest}, ${curMax}) = ${best}${bestUpdated ? " ✓" : ""}`, en: `result = max(${oldBest}, ${curMax}) = ${best}${bestUpdated ? " ✓" : ""}` },
      note: bestUpdated
        ? { vi: `Tìm thấy best mới: nums[${bestStart}..${bestEnd}] có tích ${best}.`, en: `Found a new best: nums[${bestStart}..${bestEnd}] has product ${best}.` }
        : { vi: `cur_max=${curMax} không vượt result cũ ${oldBest}, nên giữ best range [${bestStart}..${bestEnd}].`, en: `cur_max=${curMax} does not beat old result ${oldBest}, so keep best range [${bestStart}..${bestEnd}].` },
      codeLine: 10,
      vars: [{ name: "old result", value: oldBest }, { name: "updated", value: bestUpdated }, { name: "best range", value: `[${bestStart}..${bestEnd}]` }],
    });
  }

  phase = "done";
  i = n - 1;
  x = nums[i];
  bestUpdated = false;
  addStep({
    title: { vi: `Kết quả: ${best}`, en: `Result: ${best}` },
    note: {
      vi: `Maximum product subarray là nums[${bestStart}..${bestEnd}] = [${nums.slice(bestStart, bestEnd + 1).join(", ")}], tích = ${best}.`,
      en: `The maximum product subarray is nums[${bestStart}..${bestEnd}] = [${nums.slice(bestStart, bestEnd + 1).join(", ")}], product = ${best}.`,
    },
    codeLine: 11,
    vars: [{ name: "best subarray", value: `[${nums.slice(bestStart, bestEnd + 1).join(", ")}]` }],
    final: true,
  });

  return { original: [...nums], answer: best, steps };
}

/**
 * LeetCode 152, approach 2: compare the three candidates that can end at i.
 * Every product ending at i is either nums[i] alone, the previous maximum
 * times nums[i], or the previous minimum times nums[i]. Computing the tuple
 * before assigning removes the classic bug where max_prev is overwritten
 * before min_prev is derived, so no sign-based swap is needed.
 */
function buildSteps152Candidates(nums) {
  if (!Array.isArray(nums) || nums.length === 0) {
    throw new Error("nums must contain at least one integer.");
  }

  const steps = [];
  const n = nums.length;
  let maxPrev = nums[0];
  let minPrev = nums[0];
  let answer = nums[0];
  let maxStart = 0;
  let minStart = 0;
  let bestStart = 0;
  let bestEnd = 0;
  let i = 0;
  let x = nums[0];
  let phase = "init";
  let candidates = null;
  let maxPickIndex = null;
  let minPickIndex = null;
  let prevMax = null;
  let prevMin = null;
  let oldAnswer = answer;
  let answerUpdated = true;
  const maxHistory = Array(n).fill(null);
  const minHistory = Array(n).fill(null);
  maxHistory[0] = maxPrev;
  minHistory[0] = minPrev;

  const indices = (start, end) => (
    Number.isInteger(start) && Number.isInteger(end) && start <= end
      ? Array.from({ length: end - start + 1 }, (_, offset) => start + offset)
      : []
  );
  const rangeValues = (start, end) => indices(start, end).map((index) => nums[index]);
  const nextNegativeIndex = (from) => {
    for (let j = from; j < n; j++) if (nums[j] < 0) return j;
    return null;
  };
  const addStep = ({ title, note, codeLine, vars = [], final = false }) => {
    const upcoming = phase === "done" ? null : nextNegativeIndex(i + 1);
    // Before the assignment line, max_prev/min_prev still describe index i-1.
    const stateEnd = ["loop", "read", "candidates", "max", "min"].includes(phase) ? i - 1 : i;
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      codeBlock: 2,
      final,
      arr: [...nums],
      highlight: Number.isInteger(i) ? [i] : [],
      mark: indices(bestStart, bestEnd),
      vars: [
        { name: "i", value: i },
        { name: "n (nums[i])", value: x },
        { name: "max_prev", value: maxPrev },
        { name: "min_prev", value: minPrev },
        { name: "ans", value: answer },
        ...vars,
      ],
      maxProductView: {
        approach: 2,
        nums: [...nums],
        phase,
        i,
        x,
        prevMax,
        prevMin,
        candidates,
        maxPickIndex,
        minPickIndex,
        curMax: maxPrev,
        curMin: minPrev,
        best: answer,
        oldBest: oldAnswer,
        bestUpdated: answerUpdated,
        maxStart,
        maxEnd: stateEnd,
        minStart,
        minEnd: stateEnd,
        bestStart,
        bestEnd,
        maxValues: rangeValues(maxStart, stateEnd),
        minValues: rangeValues(minStart, stateEnd),
        bestValues: rangeValues(bestStart, bestEnd),
        upcomingNegativeIndex: upcoming,
        upcomingNegativeValue: upcoming === null ? null : nums[upcoming],
        minFlipPreview: upcoming === null ? null : minPrev * nums[upcoming],
        maxFlipPreview: upcoming === null ? null : maxPrev * nums[upcoming],
        zeroReset: x === 0,
        maxHistory: [...maxHistory],
        minHistory: [...minHistory],
      },
    });
  };

  addStep({
    title: { vi: `max_prev = min_prev = ans = nums[0] = ${x}`, en: `max_prev = min_prev = ans = nums[0] = ${x}` },
    note: {
      vi: "Chỉ có một subarray kết thúc tại index 0, nên cả ba biến đều bằng nums[0].",
      en: "Only one subarray ends at index 0, so all three variables equal nums[0].",
    },
    codeLine: 3,
  });

  for (i = 1; i < n; i++) {
    x = nums[i];
    prevMax = maxPrev;
    prevMin = minPrev;
    const prevMaxStart = maxStart;
    const prevMinStart = minStart;
    candidates = null;
    maxPickIndex = null;
    minPickIndex = null;
    oldAnswer = answer;
    answerUpdated = false;

    phase = "loop";
    addStep({
      title: { vi: `Vòng lặp tới index ${i}`, en: `Loop advances to index ${i}` },
      note: {
        vi: `Xử lý mọi subarray bắt buộc kết thúc tại index ${i}.`,
        en: `Process every subarray that must end at index ${i}.`,
      },
      codeLine: 4,
    });

    phase = "read";
    addStep({
      title: { vi: `n = nums[${i}] = ${x}`, en: `n = nums[${i}] = ${x}` },
      note: {
        vi: `Giá trị mới sẽ được nhân vào hai trạng thái cũ: max_prev=${prevMax}, min_prev=${prevMin}.`,
        en: `The new value multiplies both previous states: max_prev=${prevMax}, min_prev=${prevMin}.`,
      },
      codeLine: 5,
    });

    const values = [x, prevMax * x, prevMin * x];
    const starts = [i, prevMaxStart, prevMinStart];
    // Python's max/min keep the first extreme element, so ties resolve left to right.
    let maxIndex = 0;
    let minIndex = 0;
    for (let k = 1; k < 3; k++) {
      if (values[k] > values[maxIndex]) maxIndex = k;
      if (values[k] < values[minIndex]) minIndex = k;
    }
    candidates = [
      { key: "alone", label: "n", expression: `${x}`, value: values[0] },
      { key: "max-prev", label: "max_prev × n", expression: `${prevMax} × ${x}`, value: values[1] },
      { key: "min-prev", label: "min_prev × n", expression: `${prevMin} × ${x}`, value: values[2] },
    ];

    phase = "candidates";
    addStep({
      title: { vi: `candidates = (${values.join(", ")})`, en: `candidates = (${values.join(", ")})` },
      note: {
        vi: "Tính cả ba ứng viên TRƯỚC khi gán, nên max_prev cũ không bị ghi đè khi tính min.",
        en: "All three candidates are computed BEFORE assignment, so the old max_prev is not overwritten while deriving min.",
      },
      codeLine: 6,
      vars: [{ name: "candidates", value: `(${values.join(", ")})` }],
    });

    maxPickIndex = maxIndex;
    const maxCurr = values[maxIndex];
    const maxCurrStart = starts[maxIndex];
    phase = "max";
    addStep({
      title: { vi: `max_curr = max(candidates) = ${maxCurr}`, en: `max_curr = max(candidates) = ${maxCurr}` },
      note: {
        vi: `Ứng viên thắng là ${candidates[maxIndex].label}; subarray tương ứng là nums[${maxCurrStart}..${i}].`,
        en: `The winning candidate is ${candidates[maxIndex].label}; its subarray is nums[${maxCurrStart}..${i}].`,
      },
      codeLine: 7,
      vars: [{ name: "max_curr", value: maxCurr }, { name: "source", value: candidates[maxIndex].label }],
    });

    minPickIndex = minIndex;
    const minCurr = values[minIndex];
    const minCurrStart = starts[minIndex];
    phase = "min";
    addStep({
      title: { vi: `min_curr = min(candidates) = ${minCurr}`, en: `min_curr = min(candidates) = ${minCurr}` },
      note: {
        vi: `min_curr dùng cùng bộ ba, lấy từ ${candidates[minIndex].label}; giữ lại để lật dấu khi gặp số âm sau.`,
        en: `min_curr uses the same tuple, taken from ${candidates[minIndex].label}; it is kept to flip sign at a later negative.`,
      },
      codeLine: 8,
      vars: [{ name: "min_curr", value: minCurr }, { name: "source", value: candidates[minIndex].label }],
    });

    maxPrev = maxCurr;
    minPrev = minCurr;
    maxStart = maxCurrStart;
    minStart = minCurrStart;
    maxHistory[i] = maxPrev;
    minHistory[i] = minPrev;
    phase = "assign";
    addStep({
      title: { vi: `max_prev = ${maxPrev}, min_prev = ${minPrev}`, en: `max_prev = ${maxPrev}, min_prev = ${minPrev}` },
      note: {
        vi: "Chỉ gán sau khi đã lấy cả max và min, đây là điểm giúp cách này không cần swap.",
        en: "Assignment happens only after both max and min are taken, which is why this approach needs no swap.",
      },
      codeLine: 9,
    });

    oldAnswer = answer;
    if (maxPrev > answer) {
      answer = maxPrev;
      bestStart = maxStart;
      bestEnd = i;
      answerUpdated = true;
    }
    phase = "best";
    addStep({
      title: { vi: `ans = max(${oldAnswer}, ${maxPrev}) = ${answer}${answerUpdated ? " ✓" : ""}`, en: `ans = max(${oldAnswer}, ${maxPrev}) = ${answer}${answerUpdated ? " ✓" : ""}` },
      note: answerUpdated
        ? { vi: `Best mới: nums[${bestStart}..${bestEnd}] có tích ${answer}.`, en: `New best: nums[${bestStart}..${bestEnd}] has product ${answer}.` }
        : { vi: `max_curr=${maxPrev} không vượt ans=${answer}, giữ nguyên best.`, en: `max_curr=${maxPrev} does not beat ans=${answer}, so best is unchanged.` },
      codeLine: 10,
    });
  }

  phase = "done";
  i = n - 1;
  x = nums[i];
  answerUpdated = false;
  candidates = null;
  maxPickIndex = null;
  minPickIndex = null;
  addStep({
    title: { vi: `return ans = ${answer}`, en: `return ans = ${answer}` },
    note: {
      vi: `Kết quả là nums[${bestStart}..${bestEnd}] = [${nums.slice(bestStart, bestEnd + 1).join(", ")}], tích = ${answer}.`,
      en: `The answer is nums[${bestStart}..${bestEnd}] = [${nums.slice(bestStart, bestEnd + 1).join(", ")}], product = ${answer}.`,
    },
    codeLine: 11,
    final: true,
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 152, approach 3: the same recurrence written as explicit DP tables.
 * max_dp[i] and min_dp[i] store the best and worst products ending at i, which
 * makes the O(n) memory cost visible before optimizing it away.
 */
function buildSteps152DP(nums) {
  if (!Array.isArray(nums) || nums.length === 0) {
    throw new Error("nums must contain at least one integer.");
  }

  const steps = [];
  const n = nums.length;
  const maxDp = Array(n).fill(null);
  const minDp = Array(n).fill(null);
  const maxStarts = Array(n).fill(0);
  const minStarts = Array(n).fill(0);
  let i = 0;
  let x = nums[0];
  let phase = "init";
  let candidates = null;
  let maxPickIndex = null;
  let minPickIndex = null;
  let answer = nums[0];
  let bestStart = 0;
  let bestEnd = 0;
  let bestIndex = 0;

  const indices = (start, end) => (
    Number.isInteger(start) && Number.isInteger(end) && start <= end
      ? Array.from({ length: end - start + 1 }, (_, offset) => start + offset)
      : []
  );
  const rangeValues = (start, end) => indices(start, end).map((index) => nums[index]);
  const addStep = ({ title, note, codeLine, vars = [], final = false }) => {
    const maxStart = maxStarts[i] ?? 0;
    const minStart = minStarts[i] ?? 0;
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      codeBlock: 3,
      final,
      arr: [...nums],
      highlight: Number.isInteger(i) ? [i] : [],
      mark: indices(bestStart, bestEnd),
      vars: [
        { name: "i", value: i },
        { name: "x", value: x },
        { name: "max_dp", value: `[${maxDp.map((value) => value === null ? "·" : value).join(", ")}]` },
        { name: "min_dp", value: `[${minDp.map((value) => value === null ? "·" : value).join(", ")}]` },
        ...vars,
      ],
      maxProductView: {
        approach: 3,
        nums: [...nums],
        phase,
        i,
        x,
        candidates,
        maxPickIndex,
        minPickIndex,
        curMax: maxDp[i],
        curMin: minDp[i],
        prevMax: i > 0 ? maxDp[i - 1] : null,
        prevMin: i > 0 ? minDp[i - 1] : null,
        best: answer,
        bestIndex,
        bestStart,
        bestEnd,
        maxStart,
        maxEnd: i,
        minStart,
        minEnd: i,
        maxValues: maxDp[i] === null ? [] : rangeValues(maxStart, i),
        minValues: minDp[i] === null ? [] : rangeValues(minStart, i),
        bestValues: rangeValues(bestStart, bestEnd),
        maxDp: [...maxDp],
        minDp: [...minDp],
        maxHistory: [...maxDp],
        minHistory: [...minDp],
        zeroReset: x === 0,
      },
    });
  };

  phase = "table";
  addStep({
    title: { vi: `n = len(nums) = ${n}`, en: `n = len(nums) = ${n}` },
    note: {
      vi: "Cách này lưu toàn bộ bảng DP thay vì hai biến, nên bộ nhớ là O(n).",
      en: "This version stores full DP tables instead of two variables, so memory is O(n).",
    },
    codeLine: 3,
  });
  addStep({
    title: { vi: "max_dp = [0] * n", en: "max_dp = [0] * n" },
    note: {
      vi: "max_dp[i] = tích LỚN NHẤT của một subarray kết thúc đúng tại i.",
      en: "max_dp[i] = LARGEST product of a subarray ending exactly at i.",
    },
    codeLine: 4,
  });
  addStep({
    title: { vi: "min_dp = [0] * n", en: "min_dp = [0] * n" },
    note: {
      vi: "min_dp[i] = tích NHỎ NHẤT kết thúc tại i, cần cho trường hợp nhân số âm.",
      en: "min_dp[i] = SMALLEST product ending at i, needed when multiplying by a negative.",
    },
    codeLine: 5,
  });

  maxDp[0] = nums[0];
  minDp[0] = nums[0];
  phase = "base";
  addStep({
    title: { vi: `max_dp[0] = min_dp[0] = ${nums[0]}`, en: `max_dp[0] = min_dp[0] = ${nums[0]}` },
    note: {
      vi: "Base case: chỉ có một subarray kết thúc tại index 0.",
      en: "Base case: only one subarray ends at index 0.",
    },
    codeLine: 6,
  });

  for (i = 1; i < n; i++) {
    x = nums[i];
    candidates = null;
    maxPickIndex = null;
    minPickIndex = null;
    phase = "loop";
    addStep({
      title: { vi: `i = ${i}`, en: `i = ${i}` },
      note: {
        vi: `Tính ô max_dp[${i}] và min_dp[${i}] từ hai ô liền trước.`,
        en: `Fill max_dp[${i}] and min_dp[${i}] from the two previous cells.`,
      },
      codeLine: 7,
    });

    phase = "read";
    addStep({
      title: { vi: `x = nums[${i}] = ${x}`, en: `x = nums[${i}] = ${x}` },
      note: {
        vi: `Ba ứng viên sẽ là x, max_dp[${i - 1}]×x và min_dp[${i - 1}]×x.`,
        en: `The three candidates will be x, max_dp[${i - 1}]×x, and min_dp[${i - 1}]×x.`,
      },
      codeLine: 8,
    });

    const values = [x, maxDp[i - 1] * x, minDp[i - 1] * x];
    const starts = [i, maxStarts[i - 1], minStarts[i - 1]];
    let maxIndex = 0;
    let minIndex = 0;
    for (let k = 1; k < 3; k++) {
      if (values[k] > values[maxIndex]) maxIndex = k;
      if (values[k] < values[minIndex]) minIndex = k;
    }
    candidates = [
      { key: "alone", label: "x", expression: `${x}`, value: values[0] },
      { key: "max-prev", label: `max_dp[${i - 1}] × x`, expression: `${maxDp[i - 1]} × ${x}`, value: values[1] },
      { key: "min-prev", label: `min_dp[${i - 1}] × x`, expression: `${minDp[i - 1]} × ${x}`, value: values[2] },
    ];

    maxDp[i] = values[maxIndex];
    maxStarts[i] = starts[maxIndex];
    maxPickIndex = maxIndex;
    phase = "max";
    addStep({
      title: { vi: `max_dp[${i}] = ${maxDp[i]}`, en: `max_dp[${i}] = ${maxDp[i]}` },
      note: {
        vi: `Lấy từ ${candidates[maxIndex].label}, tương ứng nums[${maxStarts[i]}..${i}].`,
        en: `Taken from ${candidates[maxIndex].label}, i.e. nums[${maxStarts[i]}..${i}].`,
      },
      codeLine: 9,
    });

    minDp[i] = values[minIndex];
    minStarts[i] = starts[minIndex];
    minPickIndex = minIndex;
    phase = "min";
    addStep({
      title: { vi: `min_dp[${i}] = ${minDp[i]}`, en: `min_dp[${i}] = ${minDp[i]}` },
      note: {
        vi: `Lấy từ ${candidates[minIndex].label}; ô này là "dự trữ" cho số âm phía sau.`,
        en: `Taken from ${candidates[minIndex].label}; this cell is the reserve for a later negative.`,
      },
      codeLine: 10,
    });

    if (maxDp[i] > answer) {
      answer = maxDp[i];
      bestIndex = i;
      bestStart = maxStarts[i];
      bestEnd = i;
    }
  }

  phase = "done";
  i = n - 1;
  x = nums[i];
  candidates = null;
  maxPickIndex = null;
  minPickIndex = null;
  addStep({
    title: { vi: `return max(max_dp) = ${answer}`, en: `return max(max_dp) = ${answer}` },
    note: {
      vi: `Đáp án là ô lớn nhất của max_dp: max_dp[${bestIndex}] = ${answer}, ứng với nums[${bestStart}..${bestEnd}].`,
      en: `The answer is the largest cell of max_dp: max_dp[${bestIndex}] = ${answer}, matching nums[${bestStart}..${bestEnd}].`,
    },
    codeLine: 11,
    vars: [{ name: "answer", value: answer }, { name: "argmax index", value: bestIndex }],
    final: true,
  });

  return { original: [...nums], answer, steps };
}

function buildSteps152(nums, params) {
  const approach = Number(params && params.approach) || 1;
  if (approach === 2) return buildSteps152Candidates(nums);
  if (approach === 3) return buildSteps152DP(nums);
  return buildSteps152Swap(nums);
}

/**
 * Generate steps for LeetCode 70: Climbing Stairs.
 *
 * Fibonacci-style dynamic programming:
 *  - dp[i] = number of ways to reach step i.
 *  - dp[0] = dp[1] = 1.
 *  - dp[i] = dp[i-1] + dp[i-2].
 *  - The answer is dp[n].
 */
function makeClimbingStairsView(n, approach, values, options = {}) {
  const sources = options.sources || [];
  const target = Number.isInteger(options.target) ? options.target : null;
  return {
    n,
    approach,
    phase: options.phase || "setup",
    target,
    sources,
    formula: options.formula || null,
    rolling: options.rolling || null,
    stairs: values.map((ways, step) => ({
      step,
      ways,
      state: step === target ? "target" : sources.includes(step) ? "source" : ways === null ? "future" : "known",
    })),
  };
}

function buildSteps70(input, params) {
  const n = input[0];
  const approach = Number(params && params.approach) || 1;
  if (approach === 2) return buildSteps70Optimized(n);

  const values = new Array(n + 1).fill(null);
  const steps = [];
  const addStep = (step) => steps.push({
    ...step,
    arr: values.map((value) => value ?? 0),
    climbingStairsView: makeClimbingStairsView(n, 1, values, step.view),
  });

  addStep({
    title: { vi: "Tạo bảng ways(0…n)", en: "Create the ways(0…n) table" },
    highlight: [], mark: [], codeLines: [3],
    vars: [{ name: "n", value: n }],
    view: { phase: "setup" },
    note: { vi: "ways(i) nghĩa là số cách đứng đúng ở bậc i. Các ô ? chưa được tính.", en: "ways(i) means the number of ways to stand exactly on step i. ? cells are not computed yet." },
  });

  values[0] = 1;
  addStep({
    title: { vi: "Base case: ways(0) = 1", en: "Base case: ways(0) = 1" },
    highlight: [0], mark: [0], codeLines: [4],
    vars: [{ name: "ways(0)", value: 1 }],
    view: { phase: "base", target: 0 },
    note: { vi: "Có đúng 1 cách ở bậc 0: chưa leo bước nào. Giá trị này là nền cho công thức.", en: "There is exactly 1 way to be at step 0: take no steps. It is the recurrence base." },
  });

  values[1] = 1;
  addStep({
    title: { vi: "Base case: ways(1) = 1", en: "Base case: ways(1) = 1" },
    highlight: [1], mark: [1], codeLines: [5],
    vars: [{ name: "ways(1)", value: 1 }],
    view: { phase: "base", target: 1 },
    note: { vi: "Để tới bậc 1 chỉ có một lựa chọn: leo 1 bậc.", en: "There is only one way to reach step 1: take one step." },
  });

  for (let i = 2; i <= n; i++) {
    const fromOneStep = values[i - 1];
    const fromTwoSteps = values[i - 2];
    values[i] = fromOneStep + fromTwoSteps;
    addStep({
      title: { vi: `Tính ways(${i}) = ${fromOneStep} + ${fromTwoSteps} = ${values[i]}`, en: `Compute ways(${i}) = ${fromOneStep} + ${fromTwoSteps} = ${values[i]}` },
      highlight: [i - 2, i - 1, i], mark: [i], codeLines: [7],
      vars: [
        { name: "i", value: i },
        { name: "from ways(i−1)", value: fromOneStep },
        { name: "from ways(i−2)", value: fromTwoSteps },
        { name: `ways(${i})`, value: values[i] },
      ],
      view: {
        phase: "calculate", target: i, sources: [i - 2, i - 1],
        formula: { target: i, oneStep: i - 1, twoSteps: i - 2, oneValue: fromOneStep, twoValue: fromTwoSteps, result: values[i] },
      },
      note: { vi: `Muốn đứng ở bậc ${i}, bước cuối hoặc đi từ bậc ${i - 1} bằng 1 bước, hoặc từ bậc ${i - 2} bằng 2 bước. Hai nhóm cách không trùng nhau nên cộng lại.`, en: `To stand on step ${i}, the last move comes from step ${i - 1} with 1 step or from step ${i - 2} with 2 steps. These groups do not overlap, so add them.` },
    });
  }

  addStep({
    title: { vi: `Kết quả: ways(${n}) = ${values[n]}`, en: `Result: ways(${n}) = ${values[n]}` },
    highlight: [n], mark: [n], final: true, codeLines: [8],
    vars: [{ name: "answer", value: values[n] }],
    view: { phase: "done", target: n },
    note: { vi: `Ô cuối cùng chính là đáp án: có ${values[n]} cách leo tới bậc ${n}.`, en: `The final cell is the answer: there are ${values[n]} ways to reach step ${n}.` },
  });

  return { n, answer: values[n], steps };
}

/**
 * Generate steps for LeetCode 70 Approach 2: Optimized O(1) space.
 * Climbing stairs is Fibonacci-like: ways(n) = ways(n-1) + ways(n-2).
 */
function buildSteps70Optimized(n) {
  const values = new Array(n + 1).fill(null);
  const steps = [];
  const addStep = (step) => steps.push({
    ...step,
    arr: values.map((value) => value ?? 0),
    climbingStairsView: makeClimbingStairsView(n, 2, values, step.view),
  });

  if (n <= 2) {
    values[n] = n;
    addStep({
      title: { vi: `n = ${n} ≤ 2 → trả về ${n}`, en: `n = ${n} ≤ 2 → return ${n}` },
      highlight: [n], mark: [n], final: true, codeBlock: 2, codeLines: [5],
      vars: [{ name: "n", value: n }, { name: "answer", value: n }],
      view: { phase: "done", target: n },
      note: { vi: `Với ${n} bậc, đáp án là ${n}: chỉ có thể bắt đầu bằng 1 bước, hoặc (khi n=2) một bước 2 bậc.`, en: `For ${n} steps, the answer is ${n}: start with a 1-step move, or (when n=2) take one 2-step move.` },
    });
    return { n, answer: n, steps };
  }

  let prev2 = 1;
  let prev1 = 2;
  values[1] = prev2;
  values[2] = prev1;
  addStep({
    title: { vi: "Giữ 2 kết quả gần nhất", en: "Keep the 2 latest results" },
    highlight: [1, 2], mark: [1, 2], codeBlock: 2, codeLines: [6],
    vars: [{ name: "prev2 = ways(1)", value: prev2 }, { name: "prev1 = ways(2)", value: prev1 }],
    view: { phase: "base", sources: [1, 2], rolling: { prev2: { step: 1, value: prev2 }, prev1: { step: 2, value: prev1 }, curr: null } },
    note: { vi: "Không cần giữ cả bảng: công thức chỉ dùng hai kết quả ngay trước đó.", en: "The full table is unnecessary: the recurrence uses only the two immediately previous results." },
  });

  for (let i = 3; i <= n; i++) {
    const oldPrev2 = prev2;
    const oldPrev1 = prev1;
    const curr = oldPrev1 + oldPrev2;
    values[i] = curr;
    addStep({
      title: { vi: `curr = ${oldPrev1} + ${oldPrev2} = ${curr}`, en: `curr = ${oldPrev1} + ${oldPrev2} = ${curr}` },
      highlight: [i - 2, i - 1, i], mark: [i], codeBlock: 2, codeLines: [8],
      vars: [{ name: "i", value: i }, { name: "curr", value: curr }],
      view: {
        phase: "calculate", target: i, sources: [i - 2, i - 1],
        formula: { target: i, oneStep: i - 1, twoSteps: i - 2, oneValue: oldPrev1, twoValue: oldPrev2, result: curr },
        rolling: { prev2: { step: i - 2, value: oldPrev2 }, prev1: { step: i - 1, value: oldPrev1 }, curr: { step: i, value: curr } },
      },
      note: { vi: `Tính ways(${i}) từ hai biến đang giữ: ${oldPrev1} + ${oldPrev2} = ${curr}.`, en: `Compute ways(${i}) from the two stored values: ${oldPrev1} + ${oldPrev2} = ${curr}.` },
    });

    prev2 = oldPrev1;
    addStep({
      title: { vi: `Dịch prev2 ← ${prev2}`, en: `Shift prev2 ← ${prev2}` },
      highlight: [i - 1], mark: [], codeBlock: 2, codeLines: [9],
      vars: [{ name: "prev2", value: prev2 }],
      view: { phase: "shift-prev2", sources: [i - 1], rolling: { prev2: { step: i - 1, value: prev2 }, prev1: { step: i - 1, value: oldPrev1 }, curr: { step: i, value: curr } } },
      note: { vi: "Dịch cửa sổ sang phải: prev2 nhận giá trị cũ của prev1.", en: "Slide the window right: prev2 receives the old prev1 value." },
    });

    prev1 = curr;
    addStep({
      title: { vi: `Dịch prev1 ← ${prev1}`, en: `Shift prev1 ← ${prev1}` },
      highlight: [i], mark: [], codeBlock: 2, codeLines: [10],
      vars: [{ name: "prev1", value: prev1 }],
      view: { phase: "shift-prev1", sources: [i], rolling: { prev2: { step: i - 1, value: prev2 }, prev1: { step: i, value: prev1 }, curr: null } },
      note: { vi: "prev1 nhận kết quả mới. Lần lặp sau chỉ cần prev2 và prev1 này.", en: "prev1 receives the new result. The next iteration needs only this prev2 and prev1 pair." },
    });
  }

  addStep({
    title: { vi: `Kết quả: ways(${n}) = ${prev1}`, en: `Result: ways(${n}) = ${prev1}` },
    highlight: [n], mark: [n], final: true, codeBlock: 2, codeLines: [11],
    vars: [{ name: "answer", value: prev1 }],
    view: { phase: "done", target: n, rolling: { prev2: { step: n - 1, value: prev2 }, prev1: { step: n, value: prev1 }, curr: null } },
    note: { vi: `ways(${n}) = ${prev1}. Ta chỉ dùng hai biến nên bộ nhớ phụ là O(1).`, en: `ways(${n}) = ${prev1}. Only two variables are used, so auxiliary space is O(1).` },
  });

  return { n, answer: prev1, steps };
}

/**
 * Generate steps for LeetCode 300: Longest Increasing Subsequence (DP O(n^2) version).
 *
 *  - dp[i] = length of the longest increasing subsequence ending at i.
 *  - dp[i] = 1 + max(dp[j]) for all j < i where nums[j] < nums[i].
 *  - The answer is max(dp).
 */
function buildSteps300(nums, params) {
  const approach = (params && Number(params.approach)) || 1;
  if (approach === 2) return buildSteps300BinarySearch(nums);
  // ── Approach 1: O(n²) DP — line-by-line debug ──
  const n = nums.length;
  const dp = new Array(n).fill(1);
  const prev = new Array(n).fill(-1);
  const steps = [];

  // Line 3: n = len(nums)
  steps.push({
    title: { vi: "n = len(nums)", en: "n = len(nums)" },
    arr: [...nums],
    sub: [...dp],
    highlight: [], mark: [],
    codeLines: [3], codeBlock: 1,
    vars: [
      { name: "n", value: n },
    ],
    note: {
      en: `n = ${n}. Array has ${n} elements.`,
      vi: `n = ${n}. Mảng có ${n} phần tử.`,
    },
  });

  // Line 4: dp = [1] * n
  steps.push({
    title: { vi: "dp = [1] * n", en: "dp = [1] * n" },
    arr: [...nums],
    sub: [...dp],
    highlight: [], mark: [],
    codeLines: [4], codeBlock: 1,
    vars: [
      { name: "dp", value: [...dp] },
    ],
    note: {
      en: `Initialize dp = [${dp.join(", ")}]. Each element alone is a subsequence of length 1.`,
      vi: `Khởi tạo dp = [${dp.join(", ")}]. Mỗi phần tử tự nó là dãy con dài 1.`,
    },
  });

  for (let i = 1; i < n; i++) {
    let bestJ = -1;

    // Line 5: for i in range(1, n) — entering iteration i
    steps.push({
      title: { vi: `for i = ${i}`, en: `for i = ${i}` },
      arr: [...nums],
      sub: [...dp],
      highlight: [i], mark: [],
      codeLines: [5], codeBlock: 1,
      vars: [
        { name: "i", value: i },
        { name: "nums[i]", value: nums[i] },
        { name: "dp[i]", value: dp[i] },
        { name: "dp", value: [...dp] },
      ],
      note: {
        en: `Start outer loop: i = ${i}, nums[i] = ${nums[i]}.`,
        vi: `Bắt đầu vòng ngoài: i = ${i}, nums[i] = ${nums[i]}.`,
      },
    });

    for (let j = 0; j < i; j++) {
      // Line 6: for j in range(i)
      steps.push({
        title: { vi: `for j = ${j}`, en: `for j = ${j}` },
        arr: [...nums],
        sub: [...dp],
        highlight: [j, i], mark: [],
        codeLines: [6], codeBlock: 1,
        vars: [
          { name: "i", value: i },
          { name: "j", value: j },
          { name: "nums[j]", value: nums[j] },
          { name: "nums[i]", value: nums[i] },
          { name: "dp", value: [...dp] },
        ],
        note: {
          en: `Inner loop: j = ${j}. Compare nums[${j}] = ${nums[j]} with nums[${i}] = ${nums[i]}.`,
          vi: `Vòng trong: j = ${j}. So sánh nums[${j}] = ${nums[j]} với nums[${i}] = ${nums[i]}.`,
        },
      });

      // Line 7: if nums[j] < nums[i]
      const canExtend = nums[j] < nums[i];
      steps.push({
        title: { vi: `if nums[${j}] < nums[${i}]`, en: `if nums[${j}] < nums[${i}]` },
        arr: [...nums],
        sub: [...dp],
        highlight: [j, i], mark: [],
        codeLines: [7], codeBlock: 1,
        vars: [
          { name: "i", value: i },
          { name: "j", value: j },
          { name: `nums[${j}] < nums[${i}]`, value: `${nums[j]} < ${nums[i]} → ${canExtend}` },
          { name: "dp", value: [...dp] },
        ],
        note: canExtend
          ? { en: `${nums[j]} < ${nums[i]} → True. Can extend subsequence ending at j=${j}.`, vi: `${nums[j]} < ${nums[i]} → True. Có thể nối dãy con kết thúc tại j=${j}.` }
          : { en: `${nums[j]} < ${nums[i]} → False. Cannot extend. Skip.`, vi: `${nums[j]} < ${nums[i]} → False. Không nối được. Bỏ qua.` },
      });

      // Line 8: dp[i] = max(dp[i], dp[j] + 1) — only if canExtend
      if (canExtend) {
        const oldDpi = dp[i];
        const candidate = dp[j] + 1;
        let updated = false;
        if (candidate > dp[i]) {
          dp[i] = candidate;
          bestJ = j;
          updated = true;
        }
        steps.push({
          title: { vi: `dp[${i}] = max(dp[${i}], dp[${j}] + 1)`, en: `dp[${i}] = max(dp[${i}], dp[${j}] + 1)` },
          arr: [...nums],
          sub: [...dp],
          highlight: [j, i], mark: updated ? [i] : [],
          codeLines: [8], codeBlock: 1,
          vars: [
            { name: "i", value: i },
            { name: "j", value: j },
            { name: "dp[j] + 1", value: candidate },
            { name: "dp[i] (before)", value: oldDpi },
            { name: "dp[i] (after)", value: dp[i] },
            { name: "updated?", value: updated ? "YES" : "no (not better)" },
            { name: "dp", value: [...dp] },
          ],
          note: updated
            ? { en: `dp[${i}] = max(${oldDpi}, ${dp[j]}+1) = ${dp[i]}. Updated!`, vi: `dp[${i}] = max(${oldDpi}, ${dp[j]}+1) = ${dp[i]}. Cập nhật!` }
            : { en: `dp[${i}] = max(${oldDpi}, ${candidate}) = ${dp[i]}. No improvement.`, vi: `dp[${i}] = max(${oldDpi}, ${candidate}) = ${dp[i]}. Không cải thiện.` },
        });
      }
    }
    prev[i] = bestJ;
  }

  // Line 9: return max(dp)
  let answer = 0, argmax = 0;
  for (let i = 0; i < n; i++) { if (dp[i] > answer) { answer = dp[i]; argmax = i; } }
  const chain = []; for (let i = argmax; i !== -1; i = prev[i]) chain.push(i); chain.reverse();
  const chainValues = chain.map((i) => nums[i]);

  steps.push({
    title: { vi: "return max(dp)", en: "return max(dp)" },
    arr: [...nums],
    sub: [...dp],
    highlight: [], mark: chain,
    final: true,
    codeLines: [9], codeBlock: 1,
    vars: [
      { name: "max(dp)", value: answer },
      { name: "LIS", value: `[${chainValues.join(", ")}]` },
      { name: "dp", value: [...dp] },
    ],
    note: {
      en: `LIS length = ${answer}. One such subsequence: [${chainValues.join(", ")}].`,
      vi: `Độ dài LIS = ${answer}. Một dãy con đạt được: [${chainValues.join(", ")}].`,
    },
  });

  return { original: [...nums], answer, chain, steps };
}

// ── Approach 2: Patience Sorting — O(n log n) ──
function buildSteps300BinarySearch(nums) {
  const n = nums.length;
  const tails = []; // tails[i] = smallest tail of all IS of length i+1
  const steps = [];

  // Line 5: tails = []
  steps.push({
    title: { vi: "tails = []", en: "tails = []" },
    arr: [...nums], sub: Array(n).fill(-1),
    highlight: [], mark: [],
    codeLines: [5], codeBlock: 2,
    vars: [{ name: "tails", value: "[]" }],
    note: {
      en: `Initialize tails = []. tails[i] = smallest tail of any increasing subsequence of length i+1. Answer = len(tails).`,
      vi: `Khởi tạo tails = []. tails[i] = đuôi nhỏ nhất của mọi dãy tăng dài i+1. Đáp án = len(tails).`,
    },
  });

  for (let k = 0; k < n; k++) {
    const num = nums[k];

    // Line 6: for num in nums
    const sub6 = Array(n).fill(-1);
    tails.forEach((v, idx) => { sub6[idx] = v; });
    steps.push({
      title: { vi: `for num = ${num}`, en: `for num = ${num}` },
      arr: [...nums], sub: sub6,
      highlight: [k], mark: [],
      codeLines: [6], codeBlock: 2,
      vars: [
        { name: "num", value: num },
        { name: "tails", value: `[${tails.join(", ")}]` },
      ],
      note: {
        en: `Next element: num = nums[${k}] = ${num}.`,
        vi: `Phần tử tiếp theo: num = nums[${k}] = ${num}.`,
      },
    });

    // Binary search: find leftmost index where tails[idx] >= num
    let lo = 0, hi = tails.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (tails[mid] < num) lo = mid + 1; else hi = mid; }
    const pos = lo;
    const extended = pos === tails.length;
    const tailsBefore = [...tails];

    // Line 7: i = bisect_left(tails, num)
    const sub7 = Array(n).fill(-1);
    tails.forEach((v, idx) => { sub7[idx] = v; });
    steps.push({
      title: { vi: `i = bisect_left(tails, ${num}) = ${pos}`, en: `i = bisect_left(tails, ${num}) = ${pos}` },
      arr: [...nums], sub: sub7,
      highlight: [k], mark: [],
      codeLines: [7], codeBlock: 2,
      vars: [
        { name: "num", value: num },
        { name: "tails", value: `[${tails.join(", ")}]` },
        { name: "i", value: pos },
        { name: "meaning", value: extended ? `i == len(tails) → num > all tails` : `tails[${pos}] = ${tails[pos]} ≥ ${num}` },
      ],
      note: extended
        ? { en: `bisect_left finds pos=${pos} which equals len(tails)=${tails.length}. num=${num} is larger than all current tails.`, vi: `bisect_left tìm pos=${pos} bằng len(tails)=${tails.length}. num=${num} lớn hơn mọi đuôi hiện tại.` }
        : { en: `bisect_left finds pos=${pos}. tails[${pos}]=${tails[pos]} ≥ ${num}.`, vi: `bisect_left tìm pos=${pos}. tails[${pos}]=${tails[pos]} ≥ ${num}.` },
    });

    // Line 8: if i == len(tails)
    const sub8 = Array(n).fill(-1);
    tails.forEach((v, idx) => { sub8[idx] = v; });
    steps.push({
      title: { vi: `if ${pos} == len(tails)=${tails.length}`, en: `if ${pos} == len(tails)=${tails.length}` },
      arr: [...nums], sub: sub8,
      highlight: [k], mark: [],
      codeLines: [8], codeBlock: 2,
      vars: [
        { name: "i", value: pos },
        { name: "len(tails)", value: tails.length },
        { name: `i == len(tails)`, value: extended },
      ],
      note: extended
        ? { en: `${pos} == ${tails.length} → True. Will append num to tails.`, vi: `${pos} == ${tails.length} → True. Sẽ thêm num vào cuối tails.` }
        : { en: `${pos} == ${tails.length} → False. Will replace tails[${pos}].`, vi: `${pos} == ${tails.length} → False. Sẽ thay thế tails[${pos}].` },
    });

    // Line 9 or 11: tails.append(num) or tails[i] = num
    if (extended) {
      tails.push(num);
      const sub9 = Array(n).fill(-1);
      tails.forEach((v, idx) => { sub9[idx] = v; });
      steps.push({
        title: { vi: `tails.append(${num})`, en: `tails.append(${num})` },
        arr: [...nums], sub: sub9,
        highlight: [k], mark: [],
        codeLines: [9], codeBlock: 2,
        vars: [
          { name: "num", value: num },
          { name: "tails (after)", value: `[${tails.join(", ")}]` },
          { name: "LIS length", value: tails.length },
        ],
        note: {
          en: `Append ${num} to tails. LIS length grows to ${tails.length}.`,
          vi: `Thêm ${num} vào cuối tails. Độ dài LIS tăng lên ${tails.length}.`,
        },
      });
    } else {
      const oldVal = tails[pos];
      tails[pos] = num;
      const sub11 = Array(n).fill(-1);
      tails.forEach((v, idx) => { sub11[idx] = v; });
      steps.push({
        title: { vi: `tails[${pos}] = ${num}`, en: `tails[${pos}] = ${num}` },
        arr: [...nums], sub: sub11,
        highlight: [k], mark: [],
        codeLines: [11], codeBlock: 2,
        vars: [
          { name: "i", value: pos },
          { name: `tails[${pos}] (before)`, value: oldVal },
          { name: `tails[${pos}] (after)`, value: num },
          { name: "tails", value: `[${tails.join(", ")}]` },
          { name: "LIS length", value: tails.length },
        ],
        note: {
          en: `Replace tails[${pos}]: ${oldVal} → ${num}. Smaller tail = more room to grow. LIS length stays ${tails.length}.`,
          vi: `Thay tails[${pos}]: ${oldVal} → ${num}. Đuôi nhỏ hơn → dễ mở rộng. Độ dài LIS vẫn = ${tails.length}.`,
        },
      });
    }
  }

  // Line 12: return len(tails)
  const answer = tails.length;
  const subFinal = Array(n).fill(-1);
  tails.forEach((v, i) => { subFinal[i] = v; });
  steps.push({
    title: { vi: `return len(tails) = ${answer}`, en: `return len(tails) = ${answer}` },
    arr: [...nums], sub: subFinal,
    highlight: [], mark: Array.from({ length: answer }, (_, i) => i),
    final: true,
    codeLines: [12], codeBlock: 2,
    vars: [
      { name: "len(tails)", value: answer },
      { name: "tails", value: `[${tails.join(", ")}]` },
    ],
    note: {
      en: `LIS length = len(tails) = ${answer}. Note: tails[] is not the actual LIS, just a counting tool.`,
      vi: `Độ dài LIS = len(tails) = ${answer}. Lưu ý: tails[] không phải LIS thực sự, chỉ là công cụ đếm.`,
    },
  });

  return { original: [...nums], answer, chain: [], steps };
}

function attachFibonacciViews(n, approach, steps) {
  return steps.map((step) => {
    const line = (step.codeLines || [])[0];
    const variableI = (step.vars || []).find((item) => item.name === "i");
    let index = variableI ? Number(variableI.value) : n;
    let knownThrough = 0;
    let target = null;
    let phase = "setup";

    if (approach === 1) {
      if (line === 3) {
        knownThrough = 0;
        phase = "base";
        target = 0;
      } else if (line === 5) {
        knownThrough = 1;
        phase = "base";
        target = 1;
      } else if (line === 6) {
        knownThrough = index - 1;
        phase = "preview";
        target = index;
      } else if (line === 7) {
        knownThrough = index;
        phase = "calculate";
        target = index;
      } else {
        knownThrough = n;
        phase = "done";
        target = n;
      }
    } else if (n <= 1) {
      knownThrough = n;
      phase = "done";
      target = n;
    } else {
      if (line === 6) {
        knownThrough = 1;
        phase = "base";
      } else if (line === 7) {
        index = step.arr.length;
        knownThrough = index - 1;
        phase = "preview";
        target = index;
      } else if (line === 8) {
        index = step.arr.length - 1;
        knownThrough = index;
        phase = "calculate";
        target = index;
      } else if (line === 9 || line === 10) {
        index = step.arr.length - 1;
        knownThrough = index;
        phase = line === 9 ? "shift-prev2" : "shift-prev1";
      } else {
        knownThrough = n;
        phase = "done";
        target = n;
      }
    }

    let values = Array.from({ length: n + 1 }, (_, i) => (i <= knownThrough ? step.arr[i] : null));
    if (approach === 2 && n <= 1) {
      values = n === 0 ? [0] : [0, 1];
    }
    const sources = ["preview", "calculate"].includes(phase) ? [index - 2, index - 1] : [];
    const formula = phase === "calculate" ? {
      target: index,
      oneStep: index - 1,
      twoSteps: index - 2,
      oneValue: values[index - 1],
      twoValue: values[index - 2],
      result: values[index],
    } : null;
    let rolling = null;
    if (approach === 2 && n > 1) {
      if (phase === "base") rolling = { prev2: { step: 0, value: 0 }, prev1: { step: 1, value: 1 }, curr: null };
      else if (phase === "preview" || phase === "calculate") rolling = {
        prev2: { step: index - 2, value: values[index - 2] },
        prev1: { step: index - 1, value: values[index - 1] },
        curr: phase === "calculate" ? { step: index, value: values[index] } : null,
      };
      else if (phase === "shift-prev2") rolling = { prev2: { step: index - 1, value: values[index - 1] }, prev1: { step: index - 1, value: values[index - 1] }, curr: { step: index, value: values[index] } };
      else if (phase === "shift-prev1" || phase === "done") rolling = { prev2: { step: index - 1, value: values[index - 1] }, prev1: { step: index, value: values[index] }, curr: null };
    }

    return {
      ...step,
      fibonacciView: {
        kind: "fibonacci",
        symbol: "F",
        n,
        approach,
        phase,
        target,
        sources,
        formula,
        rolling,
        stairs: values.map((ways, stepIndex) => ({
          step: stepIndex,
          ways,
          state: stepIndex === target ? "target" : sources.includes(stepIndex) ? "source" : ways === null ? "future" : "known",
        })),
      },
    };
  });
}

/**
 * Generate steps for LeetCode 509: Fibonacci Number.
 *
 *  - F(0) = 0, F(1) = 1.
 *  - F(n) = F(n-1) + F(n-2).
 */
function buildSteps509(input, params) {
  const n = input[0];
  const approach = (params && params.approach) || 1;

  if (approach === 2) {
    return buildSteps509Optimized(n);
  }

  const dp = new Array(n + 1).fill(0);
  const steps = [];

  if (n >= 1) dp[1] = 1;

  steps.push({
    title: { vi: "Khởi tạo bảng dp", en: "Initialize dp table" },
    arr: [...dp],
    highlight: n >= 1 ? [0, 1] : [0],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "n", value: n },
      { name: "dp[0]", value: 0 },
      { name: "dp", value: `[${dp.join(",")}]` },
    ],
    note: {
      vi: `Approach 1: DP array. n = ${n}. Khởi tạo dp = [0] * (n+1).`,
      en: `Approach 1: DP array. n = ${n}. Initialize dp = [0] * (n+1).`,
    },
  });

  if (n >= 1) {
    steps.push({
      title: { vi: "Base case: dp[1] = 1", en: "Base case: dp[1] = 1" },
      arr: [...dp],
      highlight: [0, 1],
      mark: [],
      codeLines: [5],
      vars: [
        { name: "dp[0]", value: 0 },
        { name: "dp[1]", value: 1 },
        { name: "dp", value: `[${dp.join(",")}]` },
      ],
      note: {
        vi: `F(0) = 0, F(1) = 1 là hai giá trị cơ sở.`,
        en: `F(0) = 0, F(1) = 1 are the two base cases.`,
      },
    });
  }

  for (let i = 2; i <= n; i++) {
    // Step: for i → enter loop
    steps.push({
      title: { vi: `Vòng lặp i=${i}`, en: `Loop i=${i}` },
      arr: [...dp],
      highlight: [i],
      mark: [],
      codeLines: [6],
      vars: [
        { name: "i", value: i },
        { name: "dp[i-1]", value: dp[i - 1] },
        { name: "dp[i-2]", value: dp[i - 2] },
        { name: "dp", value: `[${dp.join(",")}]` },
      ],
      note: {
        vi: `Bắt đầu tính F(${i}). Cần F(${i-1})=${dp[i-1]} và F(${i-2})=${dp[i-2]}.`,
        en: `Start computing F(${i}). Need F(${i-1})=${dp[i-1]} and F(${i-2})=${dp[i-2]}.`,
      },
    });

    // Step: dp[i] = dp[i-1] + dp[i-2]
    dp[i] = dp[i - 1] + dp[i - 2];
    steps.push({
      title: { vi: `dp[${i}] = ${dp[i-1]} + ${dp[i-2]} = ${dp[i]}`, en: `dp[${i}] = ${dp[i-1]} + ${dp[i-2]} = ${dp[i]}` },
      arr: [...dp],
      highlight: [i - 2, i - 1, i],
      mark: [i],
      codeLines: [7],
      vars: [
        { name: "i", value: i },
        { name: "dp[i] = dp[i-1]+dp[i-2]", value: `${dp[i-1]} + ${dp[i-2]} = ${dp[i]}` },
        { name: "dp", value: `[${dp.join(",")}]` },
      ],
      note: {
        vi: `F(${i}) = F(${i-1}) + F(${i-2}) = ${dp[i-1]} + ${dp[i-2]} = ${dp[i]}.`,
        en: `F(${i}) = F(${i-1}) + F(${i-2}) = ${dp[i-1]} + ${dp[i-2]} = ${dp[i]}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...dp],
    highlight: [],
    mark: [n],
    final: true,
    codeLines: [8],
    vars: [{ name: "answer", value: dp[n] }, { name: "dp", value: `[${dp.join(",")}]` }],
    note: {
      vi: `F(${n}) = ${dp[n]}.`,
      en: `F(${n}) = ${dp[n]}.`,
    },
  });

  return { n, answer: dp[n], steps: attachFibonacciViews(n, 1, steps) };
}

/**
 * Generate steps for LeetCode 509 Approach 2: Optimized O(1) space.
 * Only track prev2, prev1, curr.
 */
function buildSteps509Optimized(n) {
  const steps = [];

  if (n <= 1) {
    steps.push({
      title: { vi: `n=${n} ≤ 1 → return ${n}`, en: `n=${n} ≤ 1 → return ${n}` },
      arr: [n],
      highlight: [0],
      mark: [0],
      final: true,
      codeBlock: 2,
      codeLines: [5],
      vars: [
        { name: "n", value: n },
        { name: "answer", value: n },
      ],
      note: {
        vi: `n=${n} ≤ 1 → trả về ${n} trực tiếp.`,
        en: `n=${n} ≤ 1 → return ${n} directly.`,
      },
    });
    return { n, answer: n, steps: attachFibonacciViews(n, 2, steps) };
  }

  let prev2 = 0;
  let prev1 = 1;

  // Track history for bar visualization
  const history = [0, 1];

  // Line 6: prev2, prev1 = 0, 1
  steps.push({
    title: { vi: "prev2, prev1 = 0, 1", en: "prev2, prev1 = 0, 1" },
    arr: [...history],
    sub: ["prev2", "prev1"],
    highlight: [0, 1],
    mark: [],
    codeBlock: 2,
    codeLines: [6],
    vars: [
      { name: "n", value: n },
      { name: "prev2", value: 0 },
      { name: "prev1", value: 1 },
    ],
    note: {
      vi: `O(1) space: chỉ dùng 2 biến. prev2 = F(0) = 0, prev1 = F(1) = 1.`,
      en: `O(1) space: only 2 variables. prev2 = F(0) = 0, prev1 = F(1) = 1.`,
    },
  });

  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    history.push(curr);

    // Build sub labels
    const subLabels = history.map((_, idx) => {
      const labels = [];
      if (idx === i - 2) labels.push("prev2");
      if (idx === i - 1) labels.push("prev1");
      if (idx === i) labels.push("curr");
      return labels.length > 0 ? labels.join(",") : `F(${idx})`;
    });

    // Line 7: for i in range(2, n+1)
    steps.push({
      title: { vi: `Vòng lặp i=${i}`, en: `Loop i=${i}` },
      arr: [...history].slice(0, -1),
      sub: history.slice(0, -1).map((_, idx) => {
        if (idx === i - 2) return "prev2";
        if (idx === i - 1) return "prev1";
        return `F(${idx})`;
      }),
      highlight: [i - 2, i - 1],
      mark: [],
      codeBlock: 2,
      codeLines: [7],
      vars: [
        { name: "i", value: i },
        { name: "prev2", value: prev2 },
        { name: "prev1", value: prev1 },
      ],
      note: {
        vi: `Bắt đầu tính F(${i}). prev2=${prev2}, prev1=${prev1}.`,
        en: `Start computing F(${i}). prev2=${prev2}, prev1=${prev1}.`,
      },
    });

    // Line 8: curr = prev1 + prev2
    steps.push({
      title: { vi: `curr = ${prev1} + ${prev2} = ${curr}`, en: `curr = ${prev1} + ${prev2} = ${curr}` },
      arr: [...history],
      sub: subLabels,
      highlight: [i - 2, i - 1, i],
      mark: [i],
      codeBlock: 2,
      codeLines: [8],
      vars: [
        { name: "curr = prev1+prev2", value: `${prev1} + ${prev2} = ${curr}` },
      ],
      note: {
        vi: `F(${i}) = prev1 + prev2 = ${prev1} + ${prev2} = ${curr}.`,
        en: `F(${i}) = prev1 + prev2 = ${prev1} + ${prev2} = ${curr}.`,
      },
    });

    // Line 9: prev2 = prev1
    prev2 = prev1;
    steps.push({
      title: { vi: `prev2 = prev1 = ${prev2}`, en: `prev2 = prev1 = ${prev2}` },
      arr: [...history],
      sub: history.map((_, idx) => {
        if (idx === i - 1) return "prev2";
        if (idx === i) return "curr";
        return `F(${idx})`;
      }),
      highlight: [i - 1],
      mark: [],
      codeBlock: 2,
      codeLines: [9],
      vars: [
        { name: "prev2", value: prev2 },
      ],
      note: {
        vi: `Dời prev2 sang phải: prev2 = ${prev2}.`,
        en: `Shift prev2 right: prev2 = ${prev2}.`,
      },
    });

    // Line 10: prev1 = curr
    prev1 = curr;
    steps.push({
      title: { vi: `prev1 = curr = ${prev1}`, en: `prev1 = curr = ${prev1}` },
      arr: [...history],
      sub: history.map((_, idx) => {
        if (idx === i - 1) return "prev2";
        if (idx === i) return "prev1";
        return `F(${idx})`;
      }),
      highlight: [i],
      mark: [],
      codeBlock: 2,
      codeLines: [10],
      vars: [
        { name: "prev1", value: prev1 },
      ],
      note: {
        vi: `Dời prev1 sang phải: prev1 = ${prev1}.`,
        en: `Shift prev1 right: prev1 = ${prev1}.`,
      },
    });
  }

  // Build final sub labels
  const finalLabels = history.map((_, idx) => {
    if (idx === n - 1) return "prev2";
    if (idx === n) return "prev1";
    return `F(${idx})`;
  });

  steps.push({
    title: { vi: `Kết quả: F(${n}) = ${prev1}`, en: `Result: F(${n}) = ${prev1}` },
    arr: [...history],
    sub: finalLabels,
    highlight: [],
    mark: [n],
    final: true,
    codeBlock: 2,
    codeLines: [11],
    vars: [
      { name: "answer", value: prev1 },
      { name: "space used", value: "O(1) — only prev2, prev1" },
    ],
    note: {
      vi: `F(${n}) = ${prev1}. Chỉ dùng O(1) bộ nhớ (2 biến) thay vì mảng dp dài ${n + 1}.`,
      en: `F(${n}) = ${prev1}. Used only O(1) memory (2 variables) instead of a dp array of size ${n + 1}.`,
    },
  });

  return { n, answer: prev1, steps: attachFibonacciViews(n, 2, steps) };
}

/**
 * Generate steps for LeetCode 1137: N-th Tribonacci Number.
 *
 *  - T(0) = 0, T(1) = 1, T(2) = 1.
 *  - T(n) = T(n-1) + T(n-2) + T(n-3).
 */
function buildSteps1137(input, params) {
  const n = input[0];
  const approach = (params && params.approach) || 1;
  if (approach === 2) return buildSteps1137Rolling(n);

  const dp = new Array(Math.max(n + 1, 3)).fill(0);
  dp[1] = 1;
  dp[2] = 1;
  const steps = [];

  steps.push({
    title: { vi: "Khởi tạo bảng dp", en: "Initialize dp table" },
    arr: dp.slice(0, Math.max(n + 1, 3)),
    highlight: [0, 1, 2],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "n", value: n },
      { name: "T(0)", value: 0 },
      { name: "T(1)", value: 1 },
      { name: "T(2)", value: 1 },
      { name: "dp", value: `[${dp.slice(0, Math.max(n + 1, 3)).join(",")}]` },
    ],
    note: {
      vi: `Tribonacci: T(0)=0, T(1)=1, T(2)=1. Với n ≥ 3: T(n) = T(n-1) + T(n-2) + T(n-3).\nn = ${n}.`,
      en: `Tribonacci: T(0)=0, T(1)=1, T(2)=1. For n ≥ 3: T(n) = T(n-1) + T(n-2) + T(n-3).\nn = ${n}.`,
    },
  });

  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2] + dp[i - 3];
    steps.push({
      title: { vi: `Tính T(${i})`, en: `Compute T(${i})` },
      arr: dp.slice(0, n + 1),
      highlight: [i - 3, i - 2, i - 1, i],
      mark: [],
      codeLines: [6, 7],
      vars: [
        { name: "i", value: i },
        { name: "T(i-1)", value: dp[i - 1] },
        { name: "T(i-2)", value: dp[i - 2] },
        { name: "T(i-3)", value: dp[i - 3] },
        { name: "T(i) = T(i-1)+T(i-2)+T(i-3)", value: `${dp[i-1]} + ${dp[i-2]} + ${dp[i-3]} = ${dp[i]}` },
        { name: "dp", value: `[${dp.slice(0, n + 1).join(",")}]` },
      ],
      note: {
        vi: `T(${i}) = T(${i-1}) + T(${i-2}) + T(${i-3}) = ${dp[i-1]} + ${dp[i-2]} + ${dp[i-3]} = ${dp[i]}.`,
        en: `T(${i}) = T(${i-1}) + T(${i-2}) + T(${i-3}) = ${dp[i-1]} + ${dp[i-2]} + ${dp[i-3]} = ${dp[i]}.`,
      },
    });
  }

  const answer = dp[n];
  steps.push({
    title: { vi: `Kết quả: T(${n}) = ${answer}`, en: `Result: T(${n}) = ${answer}` },
    arr: dp.slice(0, n + 1),
    highlight: [],
    mark: [n],
    final: true,
    codeLines: [8],
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `T(${n}) = ${answer}.`,
      en: `T(${n}) = ${answer}.`,
    },
  });

  return { n, answer, steps };
}

/**
 * LeetCode 1137 Approach 2: O(1) space rolling.
 * Keep a, b, c = T(i-3), T(i-2), T(i-1).
 */
function buildSteps1137Rolling(n) {
  const steps = [];

  if (n === 0) {
    steps.push({ title: { vi: "n=0 → T(0)=0", en: "n=0 → T(0)=0" }, arr: [0], highlight: [0], mark: [0], final: true, codeBlock: 2, codeLines: [3, 4], vars: [{ name: "answer", value: 0 }], note: { vi: "Base case: T(0)=0.", en: "Base case: T(0)=0." } });
    return { n, answer: 0, steps };
  }
  if (n === 1 || n === 2) {
    steps.push({ title: { vi: `n=${n} → T(${n})=1`, en: `n=${n} → T(${n})=1` }, arr: n === 1 ? [0, 1] : [0, 1, 1], highlight: [n], mark: [n], final: true, codeBlock: 2, codeLines: [3, 4], vars: [{ name: "answer", value: 1 }], note: { vi: `Base case: T(${n})=1.`, en: `Base case: T(${n})=1.` } });
    return { n, answer: 1, steps };
  }

  let a = 0, b = 1, c = 1;
  const history = [0, 1, 1];

  steps.push({
    title: { vi: "Khởi tạo a=0, b=1, c=1", en: "Initialize a=0, b=1, c=1" },
    arr: [...history],
    sub: ["a", "b", "c"],
    highlight: [0, 1, 2],
    mark: [],
    codeBlock: 2,
    codeLines: [3, 4, 5],
    vars: [
      { name: "n", value: n },
      { name: "a (T0)", value: 0 },
      { name: "b (T1)", value: 1 },
      { name: "c (T2)", value: 1 },
    ],
    note: {
      vi: `O(1) space: chỉ dùng 3 biến a, b, c = T(i-3), T(i-2), T(i-1).\nnext = a + b + c. Sau đó: a←b, b←c, c←next.`,
      en: `O(1) space: only 3 variables a, b, c = T(i-3), T(i-2), T(i-1).\nnext = a + b + c. Then: a←b, b←c, c←next.`,
    },
  });

  for (let i = 3; i <= n; i++) {
    const next = a + b + c;
    history.push(next);

    const subLabels = history.map((_, idx) => {
      const labels = [];
      if (idx === i - 2) labels.push("a");
      if (idx === i - 1) labels.push("b");
      if (idx === i) labels.push("c");
      return labels.length > 0 ? labels.join(",") : `T(${idx})`;
    });

    steps.push({
      title: { vi: `T(${i}) = ${a}+${b}+${c} = ${next}`, en: `T(${i}) = ${a}+${b}+${c} = ${next}` },
      arr: [...history],
      sub: subLabels,
      highlight: [i - 3, i - 2, i - 1, i],
      mark: [i],
      codeBlock: 2,
      codeLines: [6, 7, 8, 9],
      vars: [
        { name: "i", value: i },
        { name: "next = a+b+c", value: `${a} + ${b} + ${c} = ${next}` },
        { name: "a ← b", value: `← ${b}` },
        { name: "b ← c", value: `← ${c}` },
        { name: "c ← next", value: `← ${next}` },
      ],
      note: {
        vi: `T(${i}) = a+b+c = ${a}+${b}+${c} = ${next}. Dời: a←b, b←c, c←next.`,
        en: `T(${i}) = a+b+c = ${a}+${b}+${c} = ${next}. Shift: a←b, b←c, c←next.`,
      },
    });

    a = b;
    b = c;
    c = next;
  }

  const finalLabels = history.map((_, idx) => {
    if (idx === n - 2) return "a";
    if (idx === n - 1) return "b";
    if (idx === n) return "c";
    return `T(${idx})`;
  });

  steps.push({
    title: { vi: `Kết quả: T(${n}) = ${c}`, en: `Result: T(${n}) = ${c}` },
    arr: [...history],
    sub: finalLabels,
    highlight: [],
    mark: [n],
    final: true,
    codeBlock: 2,
    codeLines: [10],
    vars: [
      { name: "answer", value: c },
      { name: "space", value: "O(1) — chỉ 3 biến" },
    ],
    note: {
      vi: `T(${n}) = ${c}. O(1) bộ nhớ (3 biến) thay vì mảng dp dài ${n + 1}.`,
      en: `T(${n}) = ${c}. O(1) memory (3 variables) instead of a dp array of size ${n + 1}.`,
    },
  });

  return { n, answer: c, steps };
}

/** LeetCode 1749: Maximum Absolute Sum of Any Subarray. */
function buildSteps1749(nums) {
  if (!Array.isArray(nums) || nums.length === 0 || nums.some((value) => !Number.isInteger(value))) {
    throw new Error("nums must contain at least one integer.");
  }

  const steps = [];
  const n = nums.length;
  let phase = "init-ending";
  let event = "init";
  let i = 0;
  let x = nums[0];
  let maxEnding = 0;
  let minEnding = 0;
  let maxSum = 0;
  let minSum = 0;
  let maxEndingL = null;
  let minEndingL = null;
  let maxL = null;
  let maxR = null;
  let minL = null;
  let minR = null;
  let prevMaxEnding = null;
  let prevMinEnding = null;
  let extendMax = null;
  let extendMin = null;
  let maxReset = false;
  let minReset = false;
  let maxUpdated = false;
  let minUpdated = false;
  let answer = null;
  let winner = null;
  const maxHistory = Array(n).fill(null);
  const minHistory = Array(n).fill(null);

  const range = (left, right) => Number.isInteger(left) && Number.isInteger(right) && left <= right
    ? Array.from({ length: right - left + 1 }, (_, offset) => left + offset) : [];
  const selectedRange = () => {
    if (winner === "positive") return [maxL, maxR];
    if (winner === "negative") return [minL, minR];
    return [null, null];
  };
  const snapshot = () => {
    const [selectedL, selectedR] = selectedRange();
    return {
      nums: [...nums], phase, event, i, x,
      prevMaxEnding, prevMinEnding, extendMax, extendMin,
      maxEnding, minEnding, maxSum, minSum,
      maxEndingL, maxEndingR: maxEndingL === null ? null : i,
      minEndingL, minEndingR: minEndingL === null ? null : i,
      maxL, maxR, minL, minR,
      maxReset, minReset, maxUpdated, minUpdated,
      maxHistory: [...maxHistory], minHistory: [...minHistory],
      positiveCandidate: maxSum, negativeCandidate: -minSum,
      winner, answer, selectedL, selectedR,
    };
  };
  const push = ({ title, note, line, vars = [], final = false }) => {
    const [selectedL, selectedR] = selectedRange();
    const marked = winner ? range(selectedL, selectedR) : [];
    steps.push({
      title, note, codeLines: [line], final,
      arr: [...nums], highlight: final ? [] : [i], mark: marked,
      vars: [
        { name: "i", value: i }, { name: "x", value: x },
        { name: "max_ending", value: maxEnding }, { name: "max_sum", value: maxSum },
        { name: "min_ending", value: minEnding }, { name: "min_sum", value: minSum }, ...vars,
      ],
      absoluteSubarrayView: snapshot(),
    });
  };

  push({
    title: { vi: "Khởi tạo max_ending = min_ending = 0", en: "Initialize max_ending = min_ending = 0" },
    note: { vi: "0 đại diện subarray rỗng. MAX không giữ tổng âm; MIN không giữ tổng dương.", en: "Zero represents the empty subarray. MAX never keeps a negative sum; MIN never keeps a positive sum." },
    line: 3,
  });
  phase = "init-global";
  push({
    title: { vi: "Khởi tạo max_sum = min_sum = 0", en: "Initialize max_sum = min_sum = 0" },
    note: { vi: "Hai global best bắt đầu từ 0 vì đề cho phép subarray rỗng.", en: "Both global best values start at zero because an empty subarray is allowed." },
    line: 4,
  });

  for (i = 0; i < n; i++) {
    x = nums[i];
    prevMaxEnding = maxEnding;
    prevMinEnding = minEnding;
    extendMax = prevMaxEnding + x;
    extendMin = prevMinEnding + x;
    maxReset = false;
    minReset = false;
    maxUpdated = false;
    minUpdated = false;
    phase = "scan";
    event = "read";
    push({
      title: { vi: `i=${i}, x=nums[${i}]=${x}`, en: `i=${i}, x=nums[${i}]=${x}` },
      note: { vi: "Cả hai lane thử nối x vào subarray đang kết thúc ở i-1.", en: "Both lanes try extending their subarray ending at i-1 with x." },
      line: 5,
      vars: [{ name: "MAX extend", value: extendMax }, { name: "MIN extend", value: extendMin }],
    });

    if (extendMax > 0) {
      maxEnding = extendMax;
      if (prevMaxEnding === 0) maxEndingL = i;
    } else {
      maxEnding = 0;
      maxEndingL = null;
      maxReset = true;
    }
    maxHistory[i] = maxEnding;
    phase = "max-ending";
    event = maxReset ? "reset-max" : "extend-max";
    push({
      title: { vi: `max_ending = max(0, ${extendMax}) = ${maxEnding}`, en: `max_ending = max(0, ${extendMax}) = ${maxEnding}` },
      note: maxReset
        ? { vi: `${extendMax} không dương → bỏ đoạn cũ và trở về subarray rỗng.`, en: `${extendMax} is not positive → discard the old segment and reset to the empty subarray.` }
        : { vi: `Giữ đoạn dương [${maxEndingL}..${i}] có tổng ${maxEnding}.`, en: `Keep positive range [${maxEndingL}..${i}] with sum ${maxEnding}.` },
      line: 6,
    });

    const oldMaxSum = maxSum;
    if (maxEnding > maxSum) {
      maxSum = maxEnding;
      maxL = maxEndingL;
      maxR = i;
      maxUpdated = true;
    }
    phase = "max-best";
    event = maxUpdated ? "new-max-best" : "keep-max-best";
    push({
      title: { vi: `max_sum = max(${oldMaxSum}, ${maxEnding}) = ${maxSum}${maxUpdated ? " ✓" : ""}`, en: `max_sum = max(${oldMaxSum}, ${maxEnding}) = ${maxSum}${maxUpdated ? " ✓" : ""}` },
      note: maxUpdated
        ? { vi: `Global MAX mới: [${maxL}..${maxR}] = ${maxSum}.`, en: `New global MAX: [${maxL}..${maxR}] = ${maxSum}.` }
        : { vi: `Giữ global MAX = ${maxSum}${maxL === null ? " (rỗng)" : ` tại [${maxL}..${maxR}]`}.`, en: `Keep global MAX = ${maxSum}${maxL === null ? " (empty)" : ` at [${maxL}..${maxR}]`}.` },
      line: 7,
    });

    if (extendMin < 0) {
      minEnding = extendMin;
      if (prevMinEnding === 0) minEndingL = i;
    } else {
      minEnding = 0;
      minEndingL = null;
      minReset = true;
    }
    minHistory[i] = minEnding;
    phase = "min-ending";
    event = minReset ? "reset-min" : "extend-min";
    push({
      title: { vi: `min_ending = min(0, ${extendMin}) = ${minEnding}`, en: `min_ending = min(0, ${extendMin}) = ${minEnding}` },
      note: minReset
        ? { vi: `${extendMin} không âm → bỏ đoạn cũ và trở về subarray rỗng.`, en: `${extendMin} is not negative → discard the old segment and reset to the empty subarray.` }
        : { vi: `Giữ đoạn âm [${minEndingL}..${i}] có tổng ${minEnding}.`, en: `Keep negative range [${minEndingL}..${i}] with sum ${minEnding}.` },
      line: 8,
    });

    const oldMinSum = minSum;
    if (minEnding < minSum) {
      minSum = minEnding;
      minL = minEndingL;
      minR = i;
      minUpdated = true;
    }
    phase = "min-best";
    event = minUpdated ? "new-min-best" : "keep-min-best";
    push({
      title: { vi: `min_sum = min(${oldMinSum}, ${minEnding}) = ${minSum}${minUpdated ? " ✓" : ""}`, en: `min_sum = min(${oldMinSum}, ${minEnding}) = ${minSum}${minUpdated ? " ✓" : ""}` },
      note: minUpdated
        ? { vi: `Global MIN mới: [${minL}..${minR}] = ${minSum}; trị tuyệt đối ${-minSum}.`, en: `New global MIN: [${minL}..${minR}] = ${minSum}; absolute value ${-minSum}.` }
        : { vi: `Giữ global MIN = ${minSum}${minL === null ? " (rỗng)" : ` tại [${minL}..${minR}]`}.`, en: `Keep global MIN = ${minSum}${minL === null ? " (empty)" : ` at [${minL}..${minR}]`}.` },
      line: 9,
    });
  }

  i = n - 1;
  x = nums[i];
  answer = Math.max(maxSum, -minSum);
  winner = answer === 0 ? "zero" : maxSum >= -minSum ? "positive" : "negative";
  phase = "done";
  event = "compare";
  const [selectedL, selectedR] = selectedRange();
  const selectedValues = selectedL === null ? [] : nums.slice(selectedL, selectedR + 1);
  const selectedSum = selectedValues.reduce((sum, value) => sum + value, 0);
  push({
    title: { vi: `max(${maxSum}, |${minSum}|) = ${answer}`, en: `max(${maxSum}, |${minSum}|) = ${answer}` },
    note: winner === "zero"
      ? { vi: "Mọi lựa chọn tốt nhất có trị tuyệt đối 0; chọn subarray rỗng.", en: "The best absolute value is zero; choose the empty subarray." }
      : { vi: `Chọn [${selectedL}..${selectedR}] = [${selectedValues.join(", ")}], tổng ${selectedSum}, trị tuyệt đối ${answer}.`, en: `Choose [${selectedL}..${selectedR}] = [${selectedValues.join(", ")}], sum ${selectedSum}, absolute value ${answer}.` },
    line: 10,
    vars: [{ name: "positive candidate", value: maxSum }, { name: "negative candidate", value: -minSum }, { name: "answer", value: answer }],
    final: true,
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 918: Maximum Sum Circular Subarray.
 * Run max-Kadane and min-Kadane together. A wrapping answer keeps the two
 * edge segments and removes one contiguous minimum-sum segment in the middle.
 */
function buildSteps918(nums) {
  if (!Array.isArray(nums) || nums.length === 0 || nums.some((value) => !Number.isInteger(value))) {
    throw new Error("nums must contain at least one integer.");
  }

  const n = nums.length;
  const steps = [];
  let i = 0;
  let x = nums[0];
  let phase = "init-max";
  let event = "init";
  let total = nums[0];
  let curMax = nums[0];
  let curMin = nums[0];
  let maxSum = nums[0];
  let minSum = nums[0];
  let curMaxStart = 0;
  let curMinStart = 0;
  let maxL = 0;
  let maxR = 0;
  let minL = 0;
  let minR = 0;
  let prevCurMax = null;
  let prevCurMin = null;
  let restartMax = null;
  let extendMax = null;
  let restartMin = null;
  let extendMin = null;
  let maxUpdated = false;
  let minUpdated = false;
  let allNegative = false;
  let circularSum = null;
  let wrapEmpty = false;
  let winner = null;
  let answer = null;
  const maxHistory = Array(n).fill(null);
  const minHistory = Array(n).fill(null);
  const totalHistory = Array(n).fill(null);
  maxHistory[0] = curMax;
  minHistory[0] = curMin;
  totalHistory[0] = total;

  const range = (left, right) => (
    Number.isInteger(left) && Number.isInteger(right) && left <= right
      ? Array.from({ length: right - left + 1 }, (_, offset) => left + offset)
      : []
  );
  const wrapRanges = () => [
    minL > 0 ? [0, minL - 1] : null,
    minR < n - 1 ? [minR + 1, n - 1] : null,
  ].filter(Boolean);
  const selectedRanges = () => {
    if (winner === "wrap") return wrapRanges();
    if (winner === "normal" || winner === "all-negative") return [[maxL, maxR]];
    return [];
  };
  const snapshot = () => ({
    nums: [...nums], phase, event, i, x, total, curMax, curMin, maxSum, minSum,
    prevCurMax, prevCurMin, restartMax, extendMax, restartMin, extendMin,
    curMaxStart, curMaxEnd: i, curMinStart, curMinEnd: i,
    normalL: maxL, normalR: maxR, minL, minR,
    maxUpdated, minUpdated, allNegative, circularSum, wrapEmpty, winner, answer,
    wrapRanges: wrapRanges().map((item) => [...item]),
    selectedRanges: selectedRanges().map((item) => [...item]),
    maxHistory: [...maxHistory], minHistory: [...minHistory], totalHistory: [...totalHistory],
  });
  const push = ({ title, note, line, vars = [], final = false }) => {
    steps.push({
      title, note, codeLines: [line], final,
      arr: [...nums],
      highlight: Number.isInteger(i) ? [i] : [],
      mark: winner ? selectedRanges().flatMap(([left, right]) => range(left, right)) : range(maxL, maxR),
      vars: [
        { name: "i", value: i }, { name: "x", value: x },
        { name: "total", value: total }, { name: "cur_max", value: curMax },
        { name: "max_sum", value: maxSum }, { name: "cur_min", value: curMin },
        { name: "min_sum", value: minSum }, ...vars,
      ],
      circularSubarrayView: snapshot(),
    });
  };

  push({
    title: { vi: `Khởi tạo total, cur_max, max_sum = ${nums[0]}`, en: `Initialize total, cur_max, max_sum = ${nums[0]}` },
    note: {
      vi: "Nhánh MAX là Kadane bình thường: tìm subarray liên tiếp tốt nhất không đi qua điểm nối cuối → đầu.",
      en: "The MAX lane is ordinary Kadane: find the best contiguous subarray that does not cross the end-to-start seam.",
    },
    line: 3,
    vars: [{ name: "normal range", value: "[0..0]" }],
  });

  phase = "init-min";
  push({
    title: { vi: `Khởi tạo cur_min, min_sum = ${nums[0]}`, en: `Initialize cur_min, min_sum = ${nums[0]}` },
    note: {
      vi: "Nhánh MIN tìm đoạn tệ nhất để loại bỏ. Phần còn lại ở hai đầu chính là một circular subarray.",
      en: "The MIN lane finds the worst segment to remove. What remains at both edges is one circular subarray.",
    },
    line: 4,
    vars: [{ name: "excluded range", value: "[0..0]" }],
  });

  for (i = 1; i < n; i++) {
    x = nums[i];
    prevCurMax = curMax;
    prevCurMin = curMin;
    restartMax = x;
    extendMax = prevCurMax + x;
    restartMin = x;
    extendMin = prevCurMin + x;
    maxUpdated = false;
    minUpdated = false;
    phase = "loop";
    event = "loop";
    push({
      title: { vi: `Vòng lặp tới index ${i}`, en: `Loop advances to index ${i}` },
      note: { vi: `Chuẩn bị xử lý nums[${i}] và cập nhật đồng thời nhánh MAX lẫn MIN.`, en: `Prepare nums[${i}] and update both the MAX and MIN lanes.` },
      line: 5,
    });

    phase = "scan";
    event = "read";
    push({
      title: { vi: `x = nums[${i}] = ${x}`, en: `x = nums[${i}] = ${x}` },
      note: { vi: "Mỗi nhánh có hai lựa chọn: bắt đầu lại từ x hoặc nối x vào đoạn trước.", en: "Each lane has two choices: restart from x or extend the previous segment with x." },
      line: 6,
      vars: [{ name: "max choices", value: `${restartMax} / ${extendMax}` }, { name: "min choices", value: `${restartMin} / ${extendMin}` }],
    });

    const oldMaxStart = curMaxStart;
    if (restartMax > extendMax) {
      curMax = restartMax;
      curMaxStart = i;
      event = "restart-max";
    } else {
      curMax = extendMax;
      curMaxStart = oldMaxStart;
      event = "extend-max";
    }
    maxHistory[i] = curMax;
    phase = "max-ending";
    push({
      title: { vi: `cur_max = max(${restartMax}, ${extendMax}) = ${curMax}`, en: `cur_max = max(${restartMax}, ${extendMax}) = ${curMax}` },
      note: event === "restart-max"
        ? { vi: `Bắt đầu MAX mới tại ${i}; nối tiếp chỉ được ${extendMax}.`, en: `Restart MAX at ${i}; extending gives only ${extendMax}.` }
        : { vi: `Mở rộng MAX từ [${curMaxStart}..${i - 1}] tới ${i}.`, en: `Extend MAX from [${curMaxStart}..${i - 1}] through ${i}.` },
      line: 7,
      vars: [{ name: "max ending range", value: `[${curMaxStart}..${i}]` }],
    });

    const oldMaxSum = maxSum;
    if (curMax > maxSum) {
      maxSum = curMax;
      maxL = curMaxStart;
      maxR = i;
      maxUpdated = true;
    }
    phase = "max-best";
    event = maxUpdated ? "new-normal-best" : "keep-normal-best";
    push({
      title: { vi: `max_sum = max(${oldMaxSum}, ${curMax}) = ${maxSum}${maxUpdated ? " ✓" : ""}`, en: `max_sum = max(${oldMaxSum}, ${curMax}) = ${maxSum}${maxUpdated ? " ✓" : ""}` },
      note: maxUpdated
        ? { vi: `Normal best mới là nums[${maxL}..${maxR}], tổng ${maxSum}.`, en: `The new normal best is nums[${maxL}..${maxR}], sum ${maxSum}.` }
        : { vi: `Giữ normal best [${maxL}..${maxR}] = ${maxSum}.`, en: `Keep normal best [${maxL}..${maxR}] = ${maxSum}.` },
      line: 8,
    });

    const oldMinStart = curMinStart;
    if (restartMin < extendMin) {
      curMin = restartMin;
      curMinStart = i;
      event = "restart-min";
    } else {
      curMin = extendMin;
      curMinStart = oldMinStart;
      event = "extend-min";
    }
    minHistory[i] = curMin;
    phase = "min-ending";
    push({
      title: { vi: `cur_min = min(${restartMin}, ${extendMin}) = ${curMin}`, en: `cur_min = min(${restartMin}, ${extendMin}) = ${curMin}` },
      note: event === "restart-min"
        ? { vi: `Bắt đầu MIN mới tại ${i}.`, en: `Restart MIN at ${i}.` }
        : { vi: `Mở rộng MIN từ [${curMinStart}..${i - 1}] tới ${i}.`, en: `Extend MIN from [${curMinStart}..${i - 1}] through ${i}.` },
      line: 9,
      vars: [{ name: "min ending range", value: `[${curMinStart}..${i}]` }],
    });

    const oldMinSum = minSum;
    if (curMin < minSum) {
      minSum = curMin;
      minL = curMinStart;
      minR = i;
      minUpdated = true;
    }
    phase = "min-best";
    event = minUpdated ? "new-min-best" : "keep-min-best";
    push({
      title: { vi: `min_sum = min(${oldMinSum}, ${curMin}) = ${minSum}${minUpdated ? " ✓" : ""}`, en: `min_sum = min(${oldMinSum}, ${curMin}) = ${minSum}${minUpdated ? " ✓" : ""}` },
      note: minUpdated
        ? { vi: `Đoạn sẽ loại tốt nhất hiện tại: nums[${minL}..${minR}], tổng ${minSum}.`, en: `Current best segment to exclude: nums[${minL}..${minR}], sum ${minSum}.` }
        : { vi: `Giữ đoạn MIN [${minL}..${minR}] = ${minSum}.`, en: `Keep MIN segment [${minL}..${minR}] = ${minSum}.` },
      line: 10,
    });

    total += x;
    totalHistory[i] = total;
    phase = "total";
    event = "add-total";
    push({
      title: { vi: `total += ${x} → ${total}`, en: `total += ${x} → ${total}` },
      note: { vi: "total là tổng toàn bộ vòng tròn; sau cùng circular = total - min_sum.", en: "total is the whole circle sum; finally circular = total - min_sum." },
      line: 11,
    });
  }

  // The for-loop exits with i === n. Keep post-scan visualization anchored
  // to the last real element so cur_max/cur_min ranges end at n - 1.
  i = n - 1;
  x = nums[i];
  allNegative = maxSum < 0;
  wrapEmpty = minL === 0 && minR === n - 1;
  phase = "guard";
  event = allNegative ? "all-negative" : "guard-pass";
  push({
    title: allNegative
      ? { vi: `max_sum=${maxSum} < 0: mảng toàn số âm`, en: `max_sum=${maxSum} < 0: all values are negative` }
      : { vi: `max_sum=${maxSum} ≥ 0: được phép xét circular`, en: `max_sum=${maxSum} ≥ 0: circular candidate is allowed` },
    note: allNegative
      ? { vi: "Không dùng total - min_sum: MIN là cả mảng, phần bù sẽ rỗng và cho 0 sai. Phải trả về phần tử âm lớn nhất.", en: "Do not use total - min_sum: MIN is the whole array, so its complement is empty and the resulting 0 is illegal. Return the largest negative element." }
      : { vi: "Có ít nhất một giá trị không âm, tiếp tục tính ứng viên đi qua điểm nối cuối → đầu.", en: "At least one value is nonnegative, so compute the candidate crossing the end-to-start seam." },
    line: 12,
    vars: [{ name: "all_negative", value: allNegative }, { name: "normal best", value: maxSum }],
  });

  if (allNegative) {
    winner = "all-negative";
    answer = maxSum;
    phase = "done";
    event = "return-all-negative";
    push({
      title: { vi: `Trả về max_sum = ${answer}`, en: `Return max_sum = ${answer}` },
      note: { vi: `Chọn nums[${maxL}..${maxR}] = [${nums.slice(maxL, maxR + 1).join(", ")}].`, en: `Choose nums[${maxL}..${maxR}] = [${nums.slice(maxL, maxR + 1).join(", ")}].` },
      line: 13,
      vars: [{ name: "answer", value: answer }],
      final: true,
    });
    return { original: [...nums], answer, steps };
  }

  circularSum = total - minSum;
  phase = "circular";
  event = wrapEmpty ? "empty-complement" : "build-wrap";
  push({
    title: { vi: `circular_sum = ${total} - (${minSum}) = ${circularSum}`, en: `circular_sum = ${total} - (${minSum}) = ${circularSum}` },
    note: wrapEmpty
      ? { vi: "MIN phủ cả mảng nên phần bù rỗng; circular candidate này không được chọn.", en: "MIN covers the entire array, so the complement is empty; this circular candidate cannot be selected." }
      : { vi: `Loại nums[${minL}..${minR}]; nối đoạn cuối với đoạn đầu để được tổng ${circularSum}.`, en: `Exclude nums[${minL}..${minR}]; join the ending and starting segments for sum ${circularSum}.` },
    line: 14,
    vars: [{ name: "excluded", value: `[${minL}..${minR}]` }, { name: "wrap ranges", value: wrapRanges().map(([l, r]) => `[${l}..${r}]`).join(" + ") || "empty" }],
  });

  winner = !wrapEmpty && circularSum > maxSum ? "wrap" : "normal";
  answer = winner === "wrap" ? circularSum : maxSum;
  phase = "done";
  event = "compare";
  push({
    title: { vi: `max(${maxSum}, ${circularSum}) = ${answer} → ${winner === "wrap" ? "CIRCULAR" : "NORMAL"}`, en: `max(${maxSum}, ${circularSum}) = ${answer} → ${winner === "wrap" ? "CIRCULAR" : "NORMAL"}` },
    note: winner === "wrap"
      ? { vi: `Chọn hai đoạn biên ${wrapRanges().map(([l, r]) => `[${l}..${r}]`).join(" + ")} với tổng ${answer}.`, en: `Choose edge ranges ${wrapRanges().map(([l, r]) => `[${l}..${r}]`).join(" + ")} with sum ${answer}.` }
      : { vi: `Chọn normal range [${maxL}..${maxR}] với tổng ${answer}.`, en: `Choose normal range [${maxL}..${maxR}] with sum ${answer}.` },
    line: 15,
    vars: [{ name: "normal", value: maxSum }, { name: "circular", value: circularSum }, { name: "winner", value: winner }, { name: "answer", value: answer }],
    final: true,
  });

  return { original: [...nums], answer, steps };
}

/**
 * Generate steps for LeetCode 53: Maximum Subarray (Kadane's algorithm).
 *  - cur = max(nums[i], cur + nums[i])  (extend current subarray or start fresh).
 *  - best = max(best, cur).
 */
function buildSteps53(nums, params) {
  const approach = (params && params.approach) || 1;
  if (approach === 2) return buildSteps53DP(nums);

  const steps = [];
  const inRange = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, x) => lo + x);

  let cur = nums[0];
  let best = nums[0];
  let curStart = 0;
  let bestL = 0;
  let bestR = 0;
  const curHistory = new Array(nums.length).fill(null);
  curHistory[0] = cur;

  function push53(opts) {
    steps.push({
      title: opts.title,
      note: opts.note,
      arr: [...nums],
      sub: curHistory.map((v) => (v === null ? "·" : String(v))),
      highlight: opts.highlight || [],
      mark: opts.mark || [],
      codeBlock: 2,
      codeLines: opts.codeLines,
      vars: opts.vars || [],
      final: opts.final || false,
      maximumSubarrayView: {
        approach: "kadane",
        phase: opts.phase,
        event: opts.event,
        nums: [...nums],
        curHistory: [...curHistory],
        i: opts.i !== undefined ? opts.i : null,
        curStart,
        curEnd: opts.curEnd !== undefined ? opts.curEnd : (opts.i !== undefined ? opts.i : 0),
        cur,
        best,
        bestL,
        bestR,
        decision: opts.decision || null,
        extendSum: opts.extendSum !== undefined ? opts.extendSum : null,
        prevBest: opts.prevBest !== undefined ? opts.prevBest : null,
        bestUpdated: opts.bestUpdated || false,
      },
    });
  }

  push53({
    title: { vi: "cur = nums[0]", en: "cur = nums[0]" },
    note: { vi: `Kadane: cur = tổng subarray kết thúc tại i.\ncur = nums[0] = ${cur}.`, en: `Kadane: cur = max subarray sum ending at i.\ncur = nums[0] = ${cur}.` },
    codeLines: [4], phase: "init", event: "init-cur",
    highlight: [0], curEnd: 0,
    vars: [{ name: "cur", value: cur }, { name: "nums[0]", value: nums[0] }],
  });

  push53({
    title: { vi: `best = nums[0] = ${best}`, en: `best = nums[0] = ${best}` },
    note: { vi: `best lưu kết quả tốt nhất. Ban đầu = ${best}.`, en: `best tracks the global best. Initially = ${best}.` },
    codeLines: [5], phase: "init", event: "init-best",
    highlight: [0], curEnd: 0,
    vars: [{ name: "cur", value: cur }, { name: "best", value: best }],
  });

  for (let i = 1; i < nums.length; i++) {
    const num = nums[i];
    const extendSum = cur + num;
    const restart = extendSum < num;

    push53({
      title: { vi: `i=${i}: nums[${i}]=${num}`, en: `i=${i}: nums[${i}]=${num}` },
      note: { vi: `Bắt đầu xét nums[${i}]=${num}. cur hiện tại=${cur}.`, en: `Start considering nums[${i}]=${num}. Current cur=${cur}.` },
      codeLines: [6], phase: "loop", event: "scan",
      highlight: [i], curEnd: i, i,
      vars: [{ name: "i", value: i }, { name: "nums[i]", value: num }, { name: "cur", value: cur }, { name: "best", value: best }],
    });

    if (restart) { cur = num; curStart = i; } else { cur = extendSum; }
    curHistory[i] = cur;

    push53({
      title: { vi: `cur = max(${num}, ${extendSum}) = ${cur}`, en: `cur = max(${num}, ${extendSum}) = ${cur}` },
      note: {
        vi: restart ? `${extendSum} < ${num} → BẮT ĐẦU MỚI tại i=${i}. cur=${cur}.` : `${extendSum} ≥ ${num} → MỞ RỘNG. cur=${cur}.`,
        en: restart ? `${extendSum} < ${num} → START FRESH at i=${i}. cur=${cur}.` : `${extendSum} ≥ ${num} → EXTEND. cur=${cur}.`,
      },
      codeLines: [7], phase: "update-cur", event: restart ? "start-fresh" : "extend",
      highlight: inRange(curStart, i), curEnd: i, i,
      decision: restart ? "start-fresh" : "extend", extendSum,
      vars: [{ name: `max(${num}, ${extendSum})`, value: cur }, { name: "decision", value: restart ? "start fresh" : "extend" }],
    });

    const prevBest = best;
    let bestUpdated = false;
    if (cur > best) { best = cur; bestL = curStart; bestR = i; bestUpdated = true; }

    push53({
      title: { vi: `best = max(${prevBest}, ${cur}) = ${best}${bestUpdated ? " 📈" : ""}`, en: `best = max(${prevBest}, ${cur}) = ${best}${bestUpdated ? " 📈" : ""}` },
      note: { vi: bestUpdated ? `Cập nhật best = ${best}! 📈` : `best = ${best} không đổi.`, en: bestUpdated ? `Update best = ${best}! 📈` : `best = ${best} unchanged.` },
      codeLines: [8], phase: "update-best", event: bestUpdated ? "new-best" : "keep-best",
      highlight: inRange(curStart, i), mark: inRange(bestL, bestR), curEnd: i, i,
      prevBest, bestUpdated,
      vars: [{ name: `max(${prevBest}, ${cur})`, value: `${best}${bestUpdated ? " 📈" : ""}` }],
    });
  }

  push53({
    title: { vi: `Kết quả: ${best}`, en: `Result: ${best}` },
    note: { vi: `Tổng lớn nhất = ${best}. Subarray: [${nums.slice(bestL, bestR + 1).join(",")}] (vị trí ${bestL}..${bestR}).`, en: `Maximum sum = ${best}. Subarray: [${nums.slice(bestL, bestR + 1).join(",")}] (indices ${bestL}..${bestR}).` },
    codeLines: [9], phase: "done", event: "done",
    highlight: [], mark: inRange(bestL, bestR), curEnd: bestR, final: true,
    vars: [{ name: "best", value: best }, { name: "subarray", value: `[${nums.slice(bestL, bestR + 1).join(",")}]` }, { name: "indices", value: `${bestL}..${bestR}` }],
  });

  return { original: [...nums], answer: best, steps };
}

/**
 * Generate steps for LeetCode 53 Approach 2: DP array version.
 * dp[i] = max subarray sum ending at i = max(dp[i-1] + nums[i], nums[i]).
 */
function buildSteps53DP(nums) {
  const n = nums.length;
  const dp = new Array(n).fill(null);
  const steps = [];
  // starts[i] = index where the subarray represented by dp[i] begins, so the
  // visualization can highlight the real range instead of a single cell.
  const starts = new Array(n).fill(0);
  let maxSum = null;
  let bestIdx = 0;

  function push53dp(opts) {
    const i = opts.i !== undefined ? opts.i : null;
    const curEnd = opts.curEnd !== undefined ? opts.curEnd : i;
    steps.push({
      title: opts.title,
      note: opts.note,
      arr: dp.map((v) => (v === null ? 0 : v)),
      sub: nums.map((v) => String(v)),
      highlight: opts.highlight || [],
      mark: opts.mark || [],
      codeBlock: 1,
      codeLines: opts.codeLines,
      vars: opts.vars || [],
      final: opts.final || false,
      maximumSubarrayView: {
        approach: "dp",
        phase: opts.phase,
        event: opts.event,
        nums: [...nums],
        dp: dp.map((v) => (v === null ? null : v)),
        i,
        curStart: curEnd === null ? 0 : starts[curEnd],
        curEnd: curEnd === null ? 0 : curEnd,
        maxSum: maxSum !== null ? maxSum : null,
        bestIdx,
        bestL: starts[bestIdx],
        bestR: bestIdx,
        best: maxSum !== null ? maxSum : null,
        decision: opts.decision || null,
        extend: opts.extend !== undefined ? opts.extend : null,
        oldMax: opts.oldMax !== undefined ? opts.oldMax : null,
        maxUpdated: opts.maxUpdated || false,
      },
    });
  }

  push53dp({
    title: { vi: "n = len(nums)", en: "n = len(nums)" },
    note: { vi: `n = ${n}. dp[i] = tổng subarray lớn nhất kết thúc tại i.`, en: `n = ${n}. dp[i] = max subarray sum ending at i.` },
    codeLines: [3], phase: "init", event: "n",
    vars: [{ name: "n", value: n }, { name: "nums", value: `[${nums.join(",")}]` }],
  });

  push53dp({
    title: { vi: "dp = [0] * n", en: "dp = [0] * n" },
    note: { vi: "Khởi tạo mảng dp, mỗi ô sẽ được điền trong vòng lặp.", en: "Initialize the dp array; each cell will be filled in the loop." },
    codeLines: [4], phase: "init", event: "init-dp",
    vars: [{ name: "dp", value: `[${nums.map(() => 0).join(",")}]` }],
  });

  dp[0] = nums[0];
  push53dp({
    title: { vi: `dp[0] = nums[0] = ${dp[0]}`, en: `dp[0] = nums[0] = ${dp[0]}` },
    note: { vi: `dp[0] = ${dp[0]}: subarray chỉ gồm nums[0].`, en: `dp[0] = ${dp[0]}: subarray containing only nums[0].` },
    codeLines: [5], phase: "init", event: "base",
    highlight: [0], vars: [{ name: "dp[0]", value: dp[0] }],
  });

  maxSum = dp[0];
  push53dp({
    title: { vi: `max_sum = dp[0] = ${maxSum}`, en: `max_sum = dp[0] = ${maxSum}` },
    note: { vi: `max_sum = ${maxSum}: kết quả tốt nhất hiện tại.`, en: `max_sum = ${maxSum}: best result so far.` },
    codeLines: [6], phase: "init", event: "init-max",
    highlight: [0], vars: [{ name: "max_sum", value: maxSum }],
  });

  for (let i = 1; i < n; i++) {
    const extend = dp[i - 1] + nums[i];
    const restart = extend < nums[i];

    push53dp({
      title: { vi: `i=${i}: nums[${i}]=${nums[i]}, dp[${i - 1}]=${dp[i - 1]}`, en: `i=${i}: nums[${i}]=${nums[i]}, dp[${i - 1}]=${dp[i - 1]}` },
      note: { vi: `Xét vị trí ${i}. Có hai lựa chọn: nối tiếp (${dp[i-1]}+${nums[i]}=${extend}) hoặc bắt đầu mới (${nums[i]}).`, en: `Consider index ${i}. Two options: extend (${dp[i-1]}+${nums[i]}=${extend}) or start fresh (${nums[i]}).` },
      codeLines: [7], phase: "loop", event: "scan", i,
      highlight: [i], vars: [{ name: "i", value: i }, { name: "nums[i]", value: nums[i] }, { name: "dp[i-1]", value: dp[i - 1] }],
    });

    dp[i] = Math.max(extend, nums[i]);
    starts[i] = restart ? i : starts[i - 1];
    push53dp({
      title: { vi: `dp[${i}] = max(${extend}, ${nums[i]}) = ${dp[i]}`, en: `dp[${i}] = max(${extend}, ${nums[i]}) = ${dp[i]}` },
      note: {
        vi: restart
          ? `${extend} < ${nums[i]} → BẮT ĐẦU SUBARRAY MỚI tại ${i}. dp[${i}]=${dp[i]}.`
          : `${extend} ≥ ${nums[i]} → NỐI TIẾP subarray từ ${starts[i]}. dp[${i}]=${dp[i]}.`,
        en: restart
          ? `${extend} < ${nums[i]} → START NEW SUBARRAY at ${i}. dp[${i}]=${dp[i]}.`
          : `${extend} ≥ ${nums[i]} → EXTEND the subarray from ${starts[i]}. dp[${i}]=${dp[i]}.`,
      },
      codeLines: [8], phase: "update-dp", event: restart ? "start-fresh" : "extend", i,
      highlight: [i - 1, i], mark: [i],
      decision: restart ? "start-fresh" : "extend", extend,
      vars: [
        { name: `dp[${i-1}]+nums[${i}]`, value: extend },
        { name: `nums[${i}]`, value: nums[i] },
        { name: `dp[${i}]`, value: dp[i] },
        { name: "decision", value: restart ? "start fresh" : "extend" },
        { name: "subarray", value: `[${starts[i]}..${i}]` },
      ],
    });

    const oldMax = maxSum;
    const maxUpdated = dp[i] > maxSum;
    if (maxUpdated) { maxSum = dp[i]; bestIdx = i; }
    push53dp({
      title: { vi: `max_sum = max(${dp[i]}, ${oldMax}) = ${maxSum}${maxUpdated ? " 📈" : ""}`, en: `max_sum = max(${dp[i]}, ${oldMax}) = ${maxSum}${maxUpdated ? " 📈" : ""}` },
      note: { vi: maxUpdated ? `dp[${i}]=${dp[i]} > ${oldMax} → max_sum mới = ${maxSum}! 📈` : `dp[${i}]=${dp[i]} ≤ max_sum = ${maxSum} → giữ nguyên.`, en: maxUpdated ? `dp[${i}]=${dp[i]} > ${oldMax} → new max_sum = ${maxSum}! 📈` : `dp[${i}]=${dp[i]} ≤ max_sum = ${maxSum} → no change.` },
      codeLines: [9], phase: "update-max", event: maxUpdated ? "new-best" : "keep-best", i,
      highlight: [i], mark: maxUpdated ? [i] : [],
      oldMax, maxUpdated,
      vars: [{ name: `max(dp[${i}], max_sum)`, value: `${maxSum}${maxUpdated ? " 📈" : ""}` }],
    });
  }

  const bestStart = starts[bestIdx];
  push53dp({
    title: { vi: `Kết quả: max_sum = ${maxSum}`, en: `Result: max_sum = ${maxSum}` },
    note: {
      vi: `Tổng lớn nhất = max(dp) = ${maxSum}, đạt tại dp[${bestIdx}]. Subarray: [${nums.slice(bestStart, bestIdx + 1).join(",")}] (vị trí ${bestStart}..${bestIdx}).`,
      en: `Maximum sum = max(dp) = ${maxSum}, reached at dp[${bestIdx}]. Subarray: [${nums.slice(bestStart, bestIdx + 1).join(",")}] (indices ${bestStart}..${bestIdx}).`,
    },
    codeLines: [10], phase: "done", event: "done",
    mark: Array.from({ length: bestIdx - bestStart + 1 }, (_, x) => bestStart + x),
    curEnd: bestIdx, final: true,
    vars: [
      { name: "max_sum", value: maxSum },
      { name: "subarray", value: `[${nums.slice(bestStart, bestIdx + 1).join(",")}]` },
      { name: "indices", value: `${bestStart}..${bestIdx}` },
    ],
  });

  return { original: [...nums], answer: maxSum, steps };
}

/**
 * Generate steps for LeetCode 198: House Robber.
 *
 * dp[i] = maximum money robbed from houses 0..i.
 *  - dp[0] = nums[0]
 *  - dp[1] = max(nums[0], nums[1])
 *  - dp[i] = max(dp[i-1], dp[i-2] + nums[i])  (skip house i or rob house i)
 */
function buildSteps198(nums, params) {
  const approach = (params && Number(params.approach)) || 1;
  if (approach === 2) return buildSteps198B(nums);

  const n = nums.length;
  const dp = new Array(n).fill(0);
  const steps = [];

  steps.push({
    title: { vi: `n = len(nums) = ${n}`, en: `n = len(nums) = ${n}` },
    arr: [...nums],
    sub: nums.map((_, i) => `[${i}]`),
    highlight: [], mark: [],
    codeLines: [3],
    vars: [{ name: "nums", value: `[${nums.join(",")}]` }, { name: "rule", value: "không cướp 2 nhà liền kề" }],
    note: {
      vi:
        `🏠 Bạn là tên trộm. Dãy nhà: [${nums.join(", ")}] (tiền mỗi nhà).\n` +
        `⚠️ Luật: KHÔNG ĐƯỢC cướp 2 nhà LIỀN KỀ (hệ thống báo động).\n\n` +
        `💡 Ý tưởng DP:\n` +
        `dp[i] = tiền TỐI ĐA cướp được tính đến nhà i.\n` +
        `Tại nhà i, có 2 lựa chọn:\n` +
        `  ① BỎ QUA nhà i → dp[i] = dp[i-1] (giữ nguyên tiền cũ)\n` +
        `  ② CƯỚP nhà i → dp[i] = dp[i-2] + nums[i] (tiền trước đó 2 nhà + nhà này)\n` +
        `dp[i] = max(①, ②)`,
      en:
        `🏠 You are a robber. Houses: [${nums.join(", ")}] (money in each).\n` +
        `⚠️ Rule: CANNOT rob 2 ADJACENT houses (alarm system).\n\n` +
        `💡 DP Idea:\n` +
        `dp[i] = MAXIMUM money robbed up to house i.\n` +
        `At house i, 2 choices:\n` +
        `  ① SKIP house i → dp[i] = dp[i-1] (keep previous best)\n` +
        `  ② ROB house i → dp[i] = dp[i-2] + nums[i] (best before prev + this house)\n` +
        `dp[i] = max(①, ②)`,
    },
  });

  steps.push({
    title: { vi: `if n == 1: ${n === 1}`, en: `if n == 1: ${n === 1}` },
    arr: [...nums],
    sub: nums.map((_, i) => `[${i}]`),
    highlight: n === 1 ? [0] : [],
    mark: [],
    codeLines: [4],
    vars: [
      { name: "n", value: n },
      { name: "n == 1", value: n === 1 },
    ],
    note: {
      vi: n === 1 ? `Chỉ có một nhà, đáp án là nums[0].` : `Có nhiều hơn một nhà, tiếp tục tạo bảng dp.`,
      en: n === 1 ? `There is only one house, so the answer is nums[0].` : `There is more than one house, continue with the dp table.`,
    },
  });

  if (n === 1) {
    steps.push({
      title: { vi: `return nums[0] = ${nums[0]}`, en: `return nums[0] = ${nums[0]}` },
      arr: [...nums],
      sub: [`${nums[0]}`],
      highlight: [0],
      mark: [0],
      final: true,
      codeLines: [5],
      vars: [{ name: "answer", value: nums[0] }],
      note: {
        vi: `Không có nhà liền kề để so sánh, cướp nhà duy nhất.`,
        en: `No adjacent choice exists, rob the only house.`,
      },
    });
    return { original: [...nums], answer: nums[0], steps };
  }

  steps.push({
    title: { vi: "dp = [0] * len(nums)", en: "dp = [0] * len(nums)" },
    arr: [...nums],
    sub: dp.map(() => "0"),
    highlight: [],
    mark: [],
    codeLines: [6],
    vars: [
      { name: "dp", value: `[${dp.join(",")}]` },
    ],
    note: {
      vi: `Tạo dp, trong đó dp[i] là số tiền tối đa có thể cướp từ nhà 0 đến nhà i.`,
      en: `Create dp, where dp[i] is the maximum loot from house 0 through house i.`,
    },
  });

  dp[0] = nums[0];
  steps.push({
    title: { vi: `dp[0] = nums[0] = ${dp[0]}`, en: `dp[0] = nums[0] = ${dp[0]}` },
    arr: [...nums],
    sub: dp.map((v) => v || "·"),
    highlight: [0],
    mark: [],
    codeLines: [7],
    vars: [
      { name: "dp[0]", value: `nums[0] = ${dp[0]} (chỉ có 1 nhà → cướp nó)` },
      { name: "dp", value: `[${dp.join(",")}]` },
    ],
    note: {
      vi: `Nếu chỉ xét nhà 0, tốt nhất là cướp nhà đó: dp[0] = ${nums[0]}.`,
      en: `Considering only house 0, the best choice is to rob it: dp[0] = ${nums[0]}.`,
    },
  });

  dp[1] = Math.max(nums[0], nums[1]);
  steps.push({
    title: { vi: `dp[1] = max(${nums[0]}, ${nums[1]}) = ${dp[1]}`, en: `dp[1] = max(${nums[0]}, ${nums[1]}) = ${dp[1]}` },
    arr: [...nums],
    sub: dp.map((v) => v || "·"),
    highlight: [0, 1],
    mark: [nums[1] > nums[0] ? 1 : 0],
    codeLines: [8],
    vars: [
      { name: "dp[1]", value: `max(nums[0], nums[1]) = max(${nums[0]}, ${nums[1]}) = ${dp[1]}` },
      { name: "dp", value: `[${dp.join(",")}]` },
    ],
    note: {
      vi: `Trong hai nhà đầu, không được cướp cả hai, nên chọn nhà có tiền lớn hơn.`,
      en: `Among the first two houses, both cannot be robbed, so choose the richer one.`,
    },
  });

  // Fill DP.
  for (let i = 2; i < n; i++) {
    const skip = dp[i - 1];
    const rob = dp[i - 2] + nums[i];
    steps.push({
      title: { vi: `for i = ${i}`, en: `for i = ${i}` },
      arr: [...nums],
      sub: dp.map((v, idx) => idx < i ? String(v) : "·"),
      highlight: [i],
      mark: [],
      codeLines: [9],
      vars: [
        { name: "i", value: i },
        { name: "nums[i]", value: `${nums[i]}$` },
        { name: "skip = dp[i-1]", value: skip },
        { name: "rob = dp[i-2] + nums[i]", value: `${dp[i-2]} + ${nums[i]} = ${rob}` },
      ],
      note: {
        vi: `Xét nhà ${i}. Nếu bỏ: dp[${i-1}] = ${skip}. Nếu cướp: dp[${i-2}] + nums[${i}] = ${rob}.`,
        en: `Consider house ${i}. If skipped: dp[${i-1}] = ${skip}. If robbed: dp[${i-2}] + nums[${i}] = ${rob}.`,
      },
    });

    dp[i] = Math.max(skip, rob);
    const robbed = dp[i] === rob;
    steps.push({
      title: { vi: `dp[${i}] = max(${skip}, ${rob}) = ${dp[i]} → ${robbed ? "CƯỚP 💰" : "BỎ ✗"}`, en: `dp[${i}] = max(${skip}, ${rob}) = ${dp[i]} → ${robbed ? "ROB 💰" : "SKIP ✗"}` },
      arr: [...nums],
      sub: dp.map((v, idx) => idx <= i ? (idx === i ? (robbed ? `💰${v}` : `✗${v}`) : String(v)) : "·"),
      highlight: [i],
      mark: robbed ? [i - 2, i] : [i - 1],
      codeLines: [10],
      vars: [
        { name: "skip", value: skip },
        { name: "rob", value: rob },
        { name: "dp[i] = max(skip, rob)", value: dp[i] },
        { name: "decision", value: robbed ? "ROB 💰" : "SKIP ✗" },
        { name: "dp", value: `[${dp.join(",")}]` },
      ],
      note: {
        vi: `dp[${i}] = max(①=${skip}, ②=${rob}) = ${dp[i]}. → ${robbed ? `CƯỚP nhà ${i}! 💰` : `Bỏ qua nhà ${i} (giữ tiền cũ tốt hơn).`}`,
        en: `dp[${i}] = max(①=${skip}, ②=${rob}) = ${dp[i]}. → ${robbed ? `ROB house ${i}! 💰` : `SKIP house ${i} (keeping old loot is better).`}`,
      },
    });
  }

  // Trace back
  const robbedHouses = [];
  let idx = n - 1;
  while (idx >= 0) {
    if (idx === 0 || dp[idx] !== dp[idx - 1]) { robbedHouses.push(idx); idx -= 2; }
    else { idx -= 1; }
  }
  robbedHouses.reverse();
  const robbedSet = new Set(robbedHouses);

  const answer = dp[n - 1];
  steps.push({
    title: { vi: `Kết quả: ${answer}$ 💰`, en: `Result: $${answer} 💰` },
    arr: [...nums],
    sub: dp.map((v, i) => robbedSet.has(i) ? `💰${v}` : `✗ ${v}`),
    highlight: [],
    mark: robbedHouses,
    final: true,
    codeLines: [11],
    vars: [
      { name: "answer", value: `${answer}$` },
      { name: "robbed", value: `[${robbedHouses.join(",")}] = [${robbedHouses.map((j) => nums[j]).join("+")}] = ${answer}` },
      { name: "dp", value: `[${dp.join(",")}]` },
    ],
    note: {
      vi: `🎉 Tối đa = ${answer}$. Cướp các nhà [${robbedHouses.join(", ")}] (giá trị ${robbedHouses.map((j) => nums[j]).join(" + ")} = ${answer}).\n💰 = đã cướp, ✗ = bỏ qua.`,
      en: `🎉 Maximum = $${answer}. Rob houses [${robbedHouses.join(", ")}] (values ${robbedHouses.map((j) => nums[j]).join(" + ")} = ${answer}).\n💰 = robbed, ✗ = skipped.`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 198 — Approach 2: Rolling variables (O(1) space).
 *
 * Instead of storing the whole dp[] array, keep only the last two values:
 *   max_rob  = best loot up to the current house
 *   prev_rob = best loot up to the house before that
 *
 * For each house `current`:
 *   temp = max(max_rob,             # skip this house
 *              prev_rob + current)  # rob this house (plus best before previous)
 *   prev_rob, max_rob = max_rob, temp
 *
 * Answer = max_rob after the loop.
 */
function buildSteps198B(nums) {
  const steps = [];
  let prevRob = 0;
  let maxRob = 0;

  // Track which houses got robbed for a final highlight (approximate: whenever
  // maxRob strictly increased and the "rob" branch won, we mark that house).
  const robbedFlags = new Array(nums.length).fill(false);

  steps.push({
    title: { vi: "Khởi tạo (O(1) space)", en: "Initialize (O(1) space)" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [3],
    codeBlock: 2,
    vars: [
      { name: "prev_rob", value: prevRob },
      { name: "max_rob", value: maxRob },
    ],
    note: {
      vi:
        `Cách 2 chỉ dùng 2 biến thay cho cả bảng dp:\n` +
        `  max_rob  = tiền lớn nhất cướp được tới nhà hiện tại\n` +
        `  prev_rob = tiền lớn nhất cướp được tới nhà TRƯỚC đó\n` +
        `Với mỗi nhà current: temp = max(max_rob, prev_rob + current), rồi dời (prev_rob, max_rob) ← (max_rob, temp).`,
      en:
        `Approach 2 keeps only 2 variables instead of the whole dp array:\n` +
        `  max_rob  = best loot up to the current house\n` +
        `  prev_rob = best loot up to the house BEFORE that\n` +
        `For each house current: temp = max(max_rob, prev_rob + current), then shift (prev_rob, max_rob) ← (max_rob, temp).`,
    },
  });

  for (let i = 0; i < nums.length; i++) {
    const current = nums[i];
    const skipVal = maxRob;
    const robVal = prevRob + current;
    const temp = Math.max(skipVal, robVal);
    const chose = robVal > skipVal ? "rob" : (robVal === skipVal ? "rob=skip" : "skip");

    // Track for the final visualization: if strictly robbing this house is
    // better than skipping, mark it as robbed.
    if (robVal > skipVal) robbedFlags[i] = true;

    // 1) show the comparison BEFORE the shift
    steps.push({
      title: { vi: `Xét nhà ${i} (tiền = ${current})`, en: `House ${i} (money = ${current})` },
      arr: [...nums],
      highlight: [i],
      mark: [],
      codeLines: [5, 6],
      codeBlock: 2,
      vars: [
        { name: "i", value: i },
        { name: "current", value: current },
        { name: "prev_rob", value: prevRob },
        { name: "max_rob", value: maxRob },
        { name: "prev_rob + current", value: robVal },
        { name: "temp = max(...)", value: temp },
        { name: "decision", value: chose },
      ],
      note: {
        vi: `temp = max(max_rob=${maxRob}, prev_rob+current=${prevRob}+${current}=${robVal}) = ${temp}. Quyết định: ${chose === "skip" ? "bỏ nhà" : chose === "rob" ? "cướp nhà" : "cướp (bằng bỏ)"} ${i}.`,
        en: `temp = max(max_rob=${maxRob}, prev_rob+current=${prevRob}+${current}=${robVal}) = ${temp}. Decision: ${chose === "skip" ? "skip" : chose === "rob" ? "rob" : "rob (tie)"} house ${i}.`,
      },
    });

    // 2) apply the shift
    prevRob = maxRob;
    maxRob = temp;

    steps.push({
      title: { vi: `Dời (prev_rob, max_rob)`, en: `Shift (prev_rob, max_rob)` },
      arr: [...nums],
      highlight: [i],
      mark: robbedFlags.map((v, k) => (v ? k : -1)).filter((k) => k >= 0),
      codeLines: [7],
      codeBlock: 2,
      vars: [
        { name: "i", value: i },
        { name: "prev_rob", value: prevRob },
        { name: "max_rob", value: maxRob },
      ],
      note: {
        vi: `Sau lần dời: prev_rob = ${prevRob}, max_rob = ${maxRob} (giá trị mới sau khi xử lý nhà ${i}).`,
        en: `After the shift: prev_rob = ${prevRob}, max_rob = ${maxRob} (new value after processing house ${i}).`,
      },
    });
  }

  const answer = maxRob;
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: robbedFlags.map((v, k) => (v ? k : -1)).filter((k) => k >= 0),
    final: true,
    codeLines: [8],
    codeBlock: 2,
    vars: [
      { name: "prev_rob", value: prevRob },
      { name: "max_rob", value: maxRob },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Sau khi duyệt xong: max_rob = ${answer}. Chỉ dùng O(1) bộ nhớ so với O(n) của cách 1.`,
      en: `After the loop: max_rob = ${answer}. Uses O(1) memory vs O(n) in approach 1.`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * Generate steps for LeetCode 213: House Robber II.
 *
 * Houses arranged in a circle → cannot rob both the first and last house.
 * Run House-Robber on two subarrays:
 *   Pass A: nums[0..n-2] (includes first, excludes last)
 *   Pass B: nums[1..n-1] (excludes first, includes last)
 * Answer = max(A, B).
 */
function buildSteps213(nums) {
  const n = nums.length;
  const steps = [];

  if (n === 1) {
    steps.push({
      title: { vi: "Một nhà duy nhất", en: "Only one house" },
      arr: [...nums],
      highlight: [0],
      mark: [0],
      final: true,
      codeLines: [3],
      vars: [{ name: "answer", value: nums[0] }],
      note: { vi: `Chỉ có 1 nhà → cướp nó = ${nums[0]}.`, en: `Only 1 house → rob it = ${nums[0]}.` },
    });
    return { original: [...nums], answer: nums[0], steps };
  }

  // Step 1: Explain the circular problem
  steps.push({
    title: { vi: "Vấn đề: Nhà xếp vòng tròn", en: "Problem: Houses in a circle" },
    arr: [...nums],
    highlight: [0, n - 1],
    mark: [],
    codeLines: [2, 3],
    vars: [
      { name: "n", value: n },
      { name: "nums", value: `[${nums.join(", ")}]` },
      { name: "constraint", value: `house[0] & house[${n - 1}] are adjacent` },
    ],
    note: {
      vi:
        `Nhà 0 và nhà ${n - 1} LIỀN KỀ nhau (vòng tròn) → không thể cướp cả hai.\n` +
        `Giống bài 198 House Robber nhưng thêm ràng buộc vòng.\n\n` +
        `→ Mẹo: CHIA THÀNH 2 BÀI House Robber riêng biệt:\n` +
        `  Pass A: xét nhà [0..${n - 2}] (bỏ nhà cuối)\n` +
        `  Pass B: xét nhà [1..${n - 1}] (bỏ nhà đầu)\n` +
        `  Đáp án = max(A, B)`,
      en:
        `House 0 and house ${n - 1} are ADJACENT (circle) → cannot rob both.\n` +
        `Same as 198 House Robber but with a circular constraint.\n\n` +
        `→ Trick: SPLIT into 2 separate House Robber problems:\n` +
        `  Pass A: houses [0..${n - 2}] (exclude last)\n` +
        `  Pass B: houses [1..${n - 1}] (exclude first)\n` +
        `  Answer = max(A, B)`,
    },
  });

  function robRange(lo, hi, passLabel) {
    const len = hi - lo + 1;
    const dp = new Array(len).fill(0);
    dp[0] = nums[lo];
    if (len >= 2) dp[1] = Math.max(nums[lo], nums[lo + 1]);

    // Sub-labels: show dp values at each position, blank outside range
    const subOf = () => {
      const sub = new Array(n).fill("");
      for (let i = 0; i < len; i++) sub[lo + i] = String(dp[i]);
      return sub;
    };

    steps.push({
      title: { vi: `${passLabel}: nums[${lo}..${hi}]`, en: `${passLabel}: nums[${lo}..${hi}]` },
      arr: [...nums],
      sub: subOf(),
      highlight: len >= 2 ? [lo, lo + 1] : [lo],
      mark: [],
      codeLines: [7, 8, 9],
      vars: [
        { name: "range", value: `nhà [${lo}..${hi}]` },
        { name: "dp[0]", value: `nums[${lo}] = ${dp[0]}` },
        { name: "dp[1]", value: len >= 2 ? `max(nums[${lo}], nums[${lo + 1}]) = max(${nums[lo]}, ${nums[lo + 1]}) = ${dp[1]}` : "-" },
      ],
      note: {
        vi:
          `${passLabel}: chạy House Robber trên nums[${lo}..${hi}].\n` +
          `dp[i] = max(dp[i-1], dp[i-2] + nums[i])\n` +
          `dp[0] = ${dp[0]}, dp[1] = ${len >= 2 ? dp[1] : "-"}`,
        en:
          `${passLabel}: run House Robber on nums[${lo}..${hi}].\n` +
          `dp[i] = max(dp[i-1], dp[i-2] + nums[i])\n` +
          `dp[0] = ${dp[0]}, dp[1] = ${len >= 2 ? dp[1] : "-"}`,
      },
    });

    for (let j = 2; j < len; j++) {
      const idx = lo + j;
      const skip = dp[j - 1];
      const rob = dp[j - 2] + nums[idx];
      dp[j] = Math.max(skip, rob);
      const robbed = dp[j] === rob;

      steps.push({
        title: { vi: `${passLabel}: nhà ${idx} → ${robbed ? "cướp" : "bỏ"}`, en: `${passLabel}: house ${idx} → ${robbed ? "rob" : "skip"}` },
        arr: [...nums],
        sub: subOf(),
        highlight: [idx],
        mark: robbed ? [idx] : [],
        codeLines: [10, 11],
        vars: [
          { name: "house", value: idx },
          { name: "nums[i]", value: nums[idx] },
          { name: "skip (dp[i-1])", value: skip },
          { name: "rob (dp[i-2]+nums[i])", value: `${dp[j - 2]} + ${nums[idx]} = ${rob}` },
          { name: "dp[i]", value: `max(${skip}, ${rob}) = ${dp[j]}` },
          { name: "decision", value: robbed ? "ROB ✓" : "SKIP" },
        ],
        note: {
          vi:
            `Nhà ${idx} (giá trị ${nums[idx]}):\n` +
            `  Bỏ qua: dp[${j - 1}] = ${skip}\n` +
            `  Cướp: dp[${j - 2}] + nums[${idx}] = ${dp[j - 2]} + ${nums[idx]} = ${rob}\n` +
            `  → dp[${j}] = max(${skip}, ${rob}) = ${dp[j]} (${robbed ? "CƯỚP" : "BỎ"})`,
          en:
            `House ${idx} (value ${nums[idx]}):\n` +
            `  Skip: dp[${j - 1}] = ${skip}\n` +
            `  Rob: dp[${j - 2}] + nums[${idx}] = ${dp[j - 2]} + ${nums[idx]} = ${rob}\n` +
            `  → dp[${j}] = max(${skip}, ${rob}) = ${dp[j]} (${robbed ? "ROB" : "SKIP"})`,
        },
      });
    }

    const result = dp[len - 1];

    // Trace back which houses
    const robbedHouses = [];
    let k = len - 1;
    while (k >= 0) {
      if (k === 0 || dp[k] !== dp[k - 1]) {
        robbedHouses.push(lo + k);
        k -= 2;
      } else {
        k -= 1;
      }
    }
    robbedHouses.reverse();

    return { result, robbed: robbedHouses, dp };
  }

  const passA = robRange(0, n - 2, "Pass A");
  steps.push({
    title: { vi: `Pass A xong: ${passA.result}`, en: `Pass A done: ${passA.result}` },
    arr: [...nums],
    highlight: [],
    mark: passA.robbed,
    codeLines: [12],
    vars: [
      { name: "pass A range", value: `nhà [0..${n - 2}]` },
      { name: "pass A max", value: passA.result },
      { name: "houses robbed", value: `[${passA.robbed.join(", ")}] = [${passA.robbed.map((j) => nums[j]).join(", ")}]` },
    ],
    note: {
      vi: `Pass A (bỏ nhà cuối ${n - 1}): tối đa = ${passA.result}.\nCướp nhà [${passA.robbed.join(", ")}] → tổng [${passA.robbed.map((j) => nums[j]).join(" + ")}] = ${passA.result}.`,
      en: `Pass A (exclude last house ${n - 1}): max = ${passA.result}.\nRob houses [${passA.robbed.join(", ")}] → sum [${passA.robbed.map((j) => nums[j]).join(" + ")}] = ${passA.result}.`,
    },
  });

  const passB = robRange(1, n - 1, "Pass B");
  steps.push({
    title: { vi: `Pass B xong: ${passB.result}`, en: `Pass B done: ${passB.result}` },
    arr: [...nums],
    highlight: [],
    mark: passB.robbed,
    codeLines: [12],
    vars: [
      { name: "pass B range", value: `nhà [1..${n - 1}]` },
      { name: "pass B max", value: passB.result },
      { name: "houses robbed", value: `[${passB.robbed.join(", ")}] = [${passB.robbed.map((j) => nums[j]).join(", ")}]` },
    ],
    note: {
      vi: `Pass B (bỏ nhà đầu 0): tối đa = ${passB.result}.\nCướp nhà [${passB.robbed.join(", ")}] → tổng [${passB.robbed.map((j) => nums[j]).join(" + ")}] = ${passB.result}.`,
      en: `Pass B (exclude first house 0): max = ${passB.result}.\nRob houses [${passB.robbed.join(", ")}] → sum [${passB.robbed.map((j) => nums[j]).join(" + ")}] = ${passB.result}.`,
    },
  });

  const answer = Math.max(passA.result, passB.result);
  const bestRobbed = passA.result >= passB.result ? passA.robbed : passB.robbed;
  const bestPass = passA.result >= passB.result ? "A" : "B";
  steps.push({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: [...nums],
    highlight: [],
    mark: bestRobbed,
    final: true,
    codeLines: [13],
    vars: [
      { name: "pass A", value: passA.result },
      { name: "pass B", value: passB.result },
      { name: "answer", value: `max(${passA.result}, ${passB.result}) = ${answer}` },
      { name: "best pass", value: bestPass },
      { name: "rob houses", value: `[${bestRobbed.join(", ")}] = [${bestRobbed.map((j) => nums[j]).join(", ")}]` },
    ],
    note: {
      vi:
        `Đáp án = max(Pass A, Pass B) = max(${passA.result}, ${passB.result}) = ${answer}.\n` +
        `Chọn Pass ${bestPass}: cướp nhà [${bestRobbed.join(", ")}] → [${bestRobbed.map((j) => nums[j]).join(" + ")}] = ${answer}.`,
      en:
        `Answer = max(Pass A, Pass B) = max(${passA.result}, ${passB.result}) = ${answer}.\n` +
        `Pick Pass ${bestPass}: rob houses [${bestRobbed.join(", ")}] → [${bestRobbed.map((j) => nums[j]).join(" + ")}] = ${answer}.`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 276: Paint Fence.
 * dp[i] = number of ways to paint i posts with k colors, with no more than two
 * adjacent posts having the same color.
 *  - same = ways where post i has same color as post i-1
 *  - diff = ways where post i has different color than post i-1
 *  - same[i] = diff[i-1]
 *  - diff[i] = (same[i-1] + diff[i-1]) * (k-1)
 */
function buildSteps276(input, params) {
  const n = input[0] || 0;
  const k = params.k !== undefined ? params.k : 3;
  const steps = [];

  steps.push({
    title: { vi: "Dau vao: n, k", en: "Input: n, k" },
    arr: [n, k],
    sub: ["n", "k"],
    highlight: [0, 1],
    mark: [],
    codeLines: [2],
    vars: [
      { name: "n", value: n },
      { name: "k", value: k },
    ],
    note: {
      vi: `Co ${n} cot rao va ${k} mau. Moi cot duoc son mot mau, toi da 2 cot lien nhau cung mau.`,
      en: `There are ${n} posts and ${k} colors. Paint each post so no more than two adjacent posts share the same color.`,
    },
  });

  if (n === 0) {
    const answer = 0;
    steps.push({
      title: { vi: "Truong hop n = 0", en: "Case n = 0" },
      arr: [],
      sub: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [3],
      vars: [
        { name: "answer", value: answer },
      ],
      note: {
        vi: "Khong co cot nao thi co 0 cach son.",
        en: "No posts means 0 ways to paint.",
      },
    });
    return { original: { n, k }, answer, steps };
  }

  if (n === 1) {
    const answer = k;
    steps.push({
      title: { vi: "Truong hop n = 1", en: "Case n = 1" },
      arr: [k],
      sub: ["ways"],
      highlight: [0],
      mark: [],
      final: true,
      codeLines: [4],
      vars: [
        { name: "answer", value: answer },
      ],
      note: {
        vi: `Chi co 1 cot nen co ${k} cach son.`,
        en: `With 1 post there are ${k} ways to paint it.`,
      },
    });
    return { original: { n, k }, answer, steps };
  }

  let same = k;
  steps.push({
    title: { vi: "Khoi tao same", en: "Initialize same" },
    arr: [same, ""],
    sub: ["same", "diff"],
    highlight: [0],
    mark: [],
    codeLines: [5],
    vars: [
      { name: "same", value: same },
    ],
    note: {
      vi: `Voi 2 cot dau, same = ${same}: hai cot dau cung mau.`,
      en: `For the first 2 posts, same = ${same}: the two posts use the same color.`,
    },
  });

  let diff = k * (k - 1);
  steps.push({
    title: { vi: "Khoi tao diff", en: "Initialize diff" },
    arr: [same, diff],
    sub: ["same", "diff"],
    highlight: [1],
    mark: [],
    codeLines: [6],
    vars: [
      { name: "same", value: same },
      { name: "diff", value: diff },
      { name: "total", value: same + diff },
    ],
    note: {
      vi: `diff = ${k} * (${k} - 1) = ${diff}: hai cot dau khac mau. Tong = ${same + diff}.`,
      en: `diff = ${k} * (${k} - 1) = ${diff}: the two posts use different colors. Total = ${same + diff}.`,
    },
  });

  for (let i = 3; i <= n; i++) {
    steps.push({
      title: { vi: `Vong lap i = ${i}`, en: `Loop i = ${i}` },
      arr: [same, diff],
      sub: ["same", "diff"],
      highlight: [0, 1],
      mark: [],
      codeLines: [7],
      vars: [
        { name: "i", value: i },
        { name: "same", value: same },
        { name: "diff", value: diff },
      ],
      note: {
        vi: `Xu ly cot ${i}. Trang thai truoc do: same = ${same}, diff = ${diff}.`,
        en: `Process post ${i}. Previous state: same = ${same}, diff = ${diff}.`,
      },
    });

    const nextSame = diff;
    steps.push({
      title: { vi: `nextSame cho i = ${i}`, en: `nextSame for i = ${i}` },
      arr: [same, diff, nextSame],
      sub: ["same", "diff", "nextSame"],
      highlight: [2],
      mark: [1],
      codeLines: [8],
      vars: [
        { name: "i", value: i },
        { name: "diff", value: diff },
        { name: "nextSame", value: nextSame },
      ],
      note: {
        vi: `De cot ${i} cung mau voi cot ${i - 1}, cot ${i - 1} phai khac mau voi cot ${i - 2}: nextSame = diff = ${nextSame}.`,
        en: `For post ${i} to match post ${i - 1}, post ${i - 1} must differ from post ${i - 2}: nextSame = diff = ${nextSame}.`,
      },
    });

    const nextDiff = (same + diff) * (k - 1);
    steps.push({
      title: { vi: `nextDiff cho i = ${i}`, en: `nextDiff for i = ${i}` },
      arr: [same, diff, nextSame, nextDiff],
      sub: ["same", "diff", "nextSame", "nextDiff"],
      highlight: [3],
      mark: [0, 1],
      codeLines: [9],
      vars: [
        { name: "i", value: i },
        { name: "same", value: same },
        { name: "diff", value: diff },
        { name: "k - 1", value: k - 1 },
        { name: "nextDiff", value: nextDiff },
      ],
      note: {
        vi: `Neu cot ${i} khac mau voi cot ${i - 1}: nextDiff = (${same} + ${diff}) * (${k} - 1) = ${nextDiff}.`,
        en: `If post ${i} differs from post ${i - 1}: nextDiff = (${same} + ${diff}) * (${k} - 1) = ${nextDiff}.`,
      },
    });

    same = nextSame;
    steps.push({
      title: { vi: `Gan same cho i = ${i}`, en: `Set same for i = ${i}` },
      arr: [same, diff, nextSame, nextDiff],
      sub: ["same", "diff", "nextSame", "nextDiff"],
      highlight: [0],
      mark: [2],
      codeLines: [10],
      vars: [
        { name: "same", value: same },
        { name: "diff", value: diff },
        { name: "nextSame", value: nextSame },
        { name: "nextDiff", value: nextDiff },
      ],
      note: {
        vi: `Cap nhat same = nextSame = ${same}. diff van la gia tri cu cho toi dong tiep theo.`,
        en: `Update same = nextSame = ${same}. diff still has the previous value until the next line.`,
      },
    });

    diff = nextDiff;
    steps.push({
      title: { vi: `Gan diff cho i = ${i}`, en: `Set diff for i = ${i}` },
      arr: [same, diff],
      sub: ["same", "diff"],
      highlight: [1],
      mark: [],
      codeLines: [11],
      vars: [
        { name: "same", value: same },
        { name: "diff", value: diff },
        { name: "total", value: same + diff },
      ],
      note: {
        vi: `Cap nhat diff = nextDiff = ${diff}. Tong cach son toi cot ${i} = ${same + diff}.`,
        en: `Update diff = nextDiff = ${diff}. Total ways up to post ${i} = ${same + diff}.`,
      },
    });
  }

  const answer = same + diff;
  steps.push({
    title: { vi: "Ket qua", en: "Result" },
    arr: [same, diff],
    sub: ["same", "diff"],
    highlight: [],
    mark: [],
    final: true,
    codeLines: [12],
    vars: [
      { name: "same", value: same },
      { name: "diff", value: diff },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Tong so cach son ${n} cot = ${answer}.`,
      en: `Total ways to paint ${n} posts = ${answer}.`,
    },
  });

  return { original: { n, k }, answer, steps };
}

/**
 * Generate steps for LeetCode 115: Distinct Subsequences.
 *
 * dp[i][j] = number of ways to form t[0..j-1] from s[0..i-1].
 *  - Empty target: dp[i][0] = 1 for every i.
 *  - If s[i-1] == t[j-1]: use or skip s[i-1].
 *  - Otherwise: skip s[i-1].
 */
function buildSteps115(input, params) {
  const s = String(input).trim();
  const t = String(params.t || "").trim();
  const m = s.length;
  const n = t.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const steps = [];

  function gridSnap(opts) {
    const hasActiveCell = Array.isArray(opts.hlCell);
    const currentVars = [];
    if (hasActiveCell) {
      currentVars.push({ name: "i", value: opts.hlCell[0] });
      currentVars.push({ name: "j", value: opts.hlCell[1] });
    }
    for (const item of opts.vars || []) {
      if ((item.name === "i" || item.name === "j") && hasActiveCell) continue;
      currentVars.push(item);
    }
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: dp.map((row) => [...row]),
        text1: s,
        text2: t,
        largeCells: true,
        hlCell: opts.hlCell || null,
        pathCells: opts.pathCells || [],
        cellLabels: opts.cellLabels || {},
        showIndices: true,
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: currentVars,
      note: opts.note,
      final: opts.final || false,
    });
  }

  gridSnap({
    title: { vi: "Read lengths", en: "Read lengths" },
    codeLines: [3],
    vars: [
      { name: "s", value: s },
      { name: "t", value: t },
      { name: "m", value: m },
      { name: "n", value: n },
    ],
    note: {
      vi: `m = len(s) = ${m}, n = len(t) = ${n}.`,
      en: `m = len(s) = ${m}, n = len(t) = ${n}.`,
    },
  });

  gridSnap({
    title: { vi: "Initialize DP table", en: "Initialize DP table" },
    codeLines: [5],
    vars: [
      { name: "dp size", value: `${m + 1} x ${n + 1}` },
      { name: "meaning", value: "dp[i][j] counts t[:j] from s[:i]" },
    ],
    note: {
      vi: "Create the DP table filled with 0.",
      en: "Create the DP table filled with 0.",
    },
  });

  for (let i = 0; i <= m; i++) {
    dp[i][0] = 1;
    gridSnap({
      title: { vi: `Base case: dp[${i}][0] = 1`, en: `Base case: dp[${i}][0] = 1` },
      codeLines: [5, 6],
      hlCell: [i, 0],
      cellLabels: { [`${i},0`]: "empty\ntarget" },
      vars: [
        { name: "i", value: i },
        { name: "s[:i]", value: i === 0 ? '""' : s.slice(0, i) },
        { name: "t[:0]", value: '""' },
        { name: `dp[${i}][0]`, value: 1 },
      ],
      note: {
        vi: "t[:0] is the empty string. There is exactly 1 way to form it: choose nothing from s[:i].",
        en: "t[:0] is the empty string. There is exactly 1 way to form it: choose nothing from s[:i].",
      },
    });
  }

  for (let i = 1; i <= m; i++) {
    gridSnap({
      title: { vi: `Outer loop i=${i}`, en: `Outer loop i=${i}` },
      codeLines: [7],
      hlCell: [i, 0],
      vars: [
        { name: "i", value: i },
        { name: `s[${i - 1}]`, value: s[i - 1] },
        { name: "s[:i]", value: s.slice(0, i) },
      ],
      note: {
        vi: `Consider source prefix s[:${i}] = "${s.slice(0, i)}".`,
        en: `Consider source prefix s[:${i}] = "${s.slice(0, i)}".`,
      },
    });

    for (let j = 1; j <= n; j++) {
      gridSnap({
        title: { vi: `Inner loop j=${j}`, en: `Inner loop j=${j}` },
        codeLines: [8],
        hlCell: [i, j],
        pathCells: [[i - 1, j], [i - 1, j - 1]],
        cellLabels: {
          [`${i - 1},${j}`]: "dp[i-1]\n[j]",
          [`${i - 1},${j - 1}`]: "dp[i-1]\n[j-1]",
        },
        vars: [
          { name: "j", value: j },
          { name: `t[${j - 1}]`, value: t[j - 1] },
          { name: "t[:j]", value: t.slice(0, j) },
        ],
        note: {
          vi: `Compute dp[${i}][${j}]: ways to form "${t.slice(0, j)}" from "${s.slice(0, i)}".`,
          en: `Compute dp[${i}][${j}]: ways to form "${t.slice(0, j)}" from "${s.slice(0, i)}".`,
        },
      });

      const match = s[i - 1] === t[j - 1];
      gridSnap({
        title: {
          vi: `Compare '${s[i - 1]}' and '${t[j - 1]}'`,
          en: `Compare '${s[i - 1]}' and '${t[j - 1]}'`,
        },
        codeLines: [9],
        hlCell: [i, j],
        pathCells: match ? [[i - 1, j], [i - 1, j - 1]] : [[i - 1, j]],
        cellLabels: match
          ? { [`${i - 1},${j}`]: "skip", [`${i - 1},${j - 1}`]: "use" }
          : { [`${i - 1},${j}`]: "skip" },
        vars: [
          { name: `s[${i - 1}]`, value: s[i - 1] },
          { name: `t[${j - 1}]`, value: t[j - 1] },
          { name: "match", value: match },
        ],
        note: {
          vi: match
            ? "Characters match: add ways that use this character and ways that skip it."
            : "Characters differ: this source character cannot finish t[:j], so skip it.",
          en: match
            ? "Characters match: add ways that use this character and ways that skip it."
            : "Characters differ: this source character cannot finish t[:j], so skip it.",
        },
      });

      const skip = dp[i - 1][j];
      const use = match ? dp[i - 1][j - 1] : 0;
      if (match) {
        dp[i][j] = use + skip;
        gridSnap({
          title: { vi: `dp[${i}][${j}] = ${use} + ${skip} = ${dp[i][j]}`, en: `dp[${i}][${j}] = ${use} + ${skip} = ${dp[i][j]}` },
          codeLines: [10],
          hlCell: [i, j],
          pathCells: [[i - 1, j - 1], [i - 1, j]],
          cellLabels: {
            [`${i - 1},${j - 1}`]: "use",
            [`${i - 1},${j}`]: "skip",
          },
          vars: [
            { name: "dp[i-1][j-1]", value: `dp[${i - 1}][${j - 1}] = ${use}` },
            { name: "dp[i-1][j]", value: `dp[${i - 1}][${j}] = ${skip}` },
            { name: `dp[${i}][${j}]`, value: dp[i][j] },
          ],
          note: {
            vi: `Use '${s[i - 1]}' to match '${t[j - 1]}' (${use}) plus skip it (${skip}).`,
            en: `Use '${s[i - 1]}' to match '${t[j - 1]}' (${use}) plus skip it (${skip}).`,
          },
        });
      } else {
        dp[i][j] = skip;
        gridSnap({
          title: { vi: `dp[${i}][${j}] = ${skip}`, en: `dp[${i}][${j}] = ${skip}` },
          codeLines: [12],
          hlCell: [i, j],
          pathCells: [[i - 1, j]],
          cellLabels: { [`${i - 1},${j}`]: "skip" },
          vars: [
            { name: "dp[i-1][j]", value: `dp[${i - 1}][${j}] = ${skip}` },
            { name: `dp[${i}][${j}]`, value: dp[i][j] },
          ],
          note: {
            vi: `Skip '${s[i - 1]}', so dp[${i}][${j}] = dp[${i - 1}][${j}] = ${skip}.`,
            en: `Skip '${s[i - 1]}', so dp[${i}][${j}] = dp[${i - 1}][${j}] = ${skip}.`,
          },
        });
      }
    }
  }

  const answer = dp[m][n];
  gridSnap({
    title: { vi: `return dp[m][n] = ${answer}`, en: `return dp[m][n] = ${answer}` },
    codeLines: [13],
    hlCell: [m, n],
    vars: [
      { name: `dp[${m}][${n}]`, value: answer },
      { name: "return", value: answer },
    ],
    note: {
      vi: `There are ${answer} distinct subsequences of s that equal t.`,
      en: `There are ${answer} distinct subsequences of s that equal t.`,
    },
    final: true,
  });

  return { s, t, answer, steps };
}

/**
 * Generate steps for LeetCode 1143: Longest Common Subsequence.
 *
 * dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1].
 *  - If text1[i-1] == text2[j-1]: dp[i][j] = dp[i-1][j-1] + 1
 *  - Otherwise: dp[i][j] = max(dp[i-1][j], dp[i][j-1])
 */
function buildSteps1143(input, params) {
  const text1 = String(input).trim();
  const text2 = String(params.text2 || "").trim();
  const m = text1.length;
  const n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const steps = [];

  function gridSnap(opts) {
    const currentVars = [];
    const hasActiveCell = Array.isArray(opts.hlCell);
    if (hasActiveCell) {
      currentVars.push({ name: "i", value: opts.hlCell[0] });
      currentVars.push({ name: "j", value: opts.hlCell[1] });
    }
    for (const item of opts.vars || []) {
      if ((item.name === "i" || item.name === "j") && hasActiveCell) continue;
      currentVars.push(item);
    }
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: dp.map((row) => [...row]),
        text1,
        text2,
        largeCells: true,
        hlCell: opts.hlCell || null,
        pathCells: opts.pathCells || [],
        cellLabels: opts.cellLabels || {},
        showIndices: true,
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: currentVars,
      note: opts.note,
    });
  }

  gridSnap({
    title: { vi: "Đọc m, n", en: "Read m, n" },
    codeLines: [3],
    hlCell: null,
    vars: [
      { name: "text1", value: text1 },
      { name: "text2", value: text2 },
      { name: "m", value: m },
      { name: "n", value: n },
    ],
    note: {
      vi: `m = len(text1) = ${m}, n = len(text2) = ${n}.`,
      en: `m = len(text1) = ${m}, n = len(text2) = ${n}.`,
    },
  });

  gridSnap({
    title: { vi: "Khởi tạo bảng DP", en: "Initialize DP table" },
    codeLines: [4],
    hlCell: null,
    vars: [
      { name: "dp size", value: `${m + 1} x ${n + 1}` },
      { name: "initial value", value: 0 },
    ],
    note: {
      vi: `Tạo bảng (${m + 1})×(${n + 1}) toàn 0. dp[i][j] = LCS của text1[0..i-1] và text2[0..j-1].`,
      en: `Create a (${m + 1})×(${n + 1}) table of zeros. dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1].`,
    },
  });

  for (let i = 1; i <= m; i++) {
    gridSnap({
      title: { vi: `Vòng ngoài i=${i}`, en: `Outer loop i=${i}` },
      codeLines: [5],
      hlCell: [i, 0],
      vars: [
        { name: "i", value: i },
        { name: `text1[${i - 1}]`, value: text1[i - 1] },
      ],
      note: {
        vi: `Xét prefix text1[0:${i}] = "${text1.slice(0, i)}".`,
        en: `Consider prefix text1[0:${i}] = "${text1.slice(0, i)}".`,
      },
    });

    for (let j = 1; j <= n; j++) {
      gridSnap({
        title: { vi: `Vòng trong j=${j}`, en: `Inner loop j=${j}` },
        codeLines: [6],
        hlCell: [i, j],
        pathCells: [[i - 1, j], [i, j - 1], [i - 1, j - 1]],
        cellLabels: { [`${i - 1},${j - 1}`]: "dp[i-1]\n[j-1]" },
        vars: [
          { name: "i", value: i },
          { name: "j", value: j },
          { name: `text2[${j - 1}]`, value: text2[j - 1] },
        ],
        note: {
          vi: `Chuẩn bị tính dp[${i}][${j}] cho "${text1.slice(0, i)}" và "${text2.slice(0, j)}".`,
          en: `Prepare to compute dp[${i}][${j}] for "${text1.slice(0, i)}" and "${text2.slice(0, j)}".`,
        },
      });

      const match = text1[i - 1] === text2[j - 1];
      gridSnap({
        title: {
          vi: `So sánh '${text1[i - 1]}' và '${text2[j - 1]}'`,
          en: `Compare '${text1[i - 1]}' and '${text2[j - 1]}'`,
        },
        codeLines: [7],
        hlCell: [i, j],
        pathCells: [[i - 1, j - 1]],
        cellLabels: { [`${i - 1},${j - 1}`]: "dp[i-1]\n[j-1]" },
        vars: [
          { name: "i", value: i },
          { name: "j", value: j },
          { name: `text1[${i - 1}]`, value: text1[i - 1] },
          { name: `text2[${j - 1}]`, value: text2[j - 1] },
          { name: "match", value: match },
        ],
        note: {
          vi: match
            ? `Hai ký tự bằng nhau, đi theo nhánh if.`
            : `Hai ký tự khác nhau, đi sang nhánh else.`,
          en: match
            ? `The characters match, so take the if branch.`
            : `The characters differ, so take the else branch.`,
        },
      });

      if (match) {
        const diag = dp[i - 1][j - 1];
        dp[i][j] = dp[i - 1][j - 1] + 1;
        gridSnap({
          title: { vi: `dp[${i}][${j}] = ${dp[i][j]}`, en: `dp[${i}][${j}] = ${dp[i][j]}` },
          codeLines: [8],
          hlCell: [i, j],
          pathCells: [[i - 1, j - 1]],
          cellLabels: { [`${i - 1},${j - 1}`]: "dp[i-1]\n[j-1]" },
          vars: [
            { name: "i", value: i },
            { name: "j", value: j },
            { name: `dp[${i - 1}][${j - 1}]`, value: diag },
            { name: `dp[${i}][${j}]`, value: dp[i][j] },
          ],
          note: {
            vi: `'${text1[i - 1]}' == '${text2[j - 1]}', nên dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${diag} + 1 = ${dp[i][j]}.`,
            en: `'${text1[i - 1]}' == '${text2[j - 1]}', so dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${diag} + 1 = ${dp[i][j]}.`,
          },
        });
      } else {
        gridSnap({
          title: { vi: "Nhánh else", en: "Else branch" },
          codeLines: [9],
          hlCell: [i, j],
          pathCells: [[i - 1, j], [i, j - 1]],
          vars: [
            { name: "i", value: i },
            { name: "j", value: j },
            { name: "dp[i-1][j]", value: `dp[${i}-1][${j}] = dp[${i - 1}][${j}] = ${dp[i - 1][j]}` },
            { name: "dp[i][j-1]", value: `dp[${i}][${j}-1] = dp[${i}][${j - 1}] = ${dp[i][j - 1]}` },
          ],
          note: {
            vi: `Ký tự khác nhau, nên chọn LCS tốt hơn từ ô trên hoặc ô trái.`,
            en: `Characters differ, so choose the better LCS from the top or left cell.`,
          },
        });

        const top = dp[i - 1][j];
        const left = dp[i][j - 1];
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        gridSnap({
          title: { vi: `dp[${i}][${j}] = ${dp[i][j]}`, en: `dp[${i}][${j}] = ${dp[i][j]}` },
          codeLines: [10],
          hlCell: [i, j],
          pathCells: [[i - 1, j], [i, j - 1]],
          vars: [
            { name: "i", value: i },
            { name: "j", value: j },
            { name: "dp[i-1][j]", value: `dp[${i}-1][${j}] = dp[${i - 1}][${j}] = ${top}` },
            { name: "dp[i][j-1]", value: `dp[${i}][${j}-1] = dp[${i}][${j - 1}] = ${left}` },
            { name: `dp[${i}][${j}]`, value: dp[i][j] },
          ],
          note: {
            vi: `dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = max(${top}, ${left}) = ${dp[i][j]}.`,
            en: `dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = max(${top}, ${left}) = ${dp[i][j]}.`,
          },
        });
      }
    }
  }

  // Trace back the LCS path.
  const pathCells = [];
  let lcs = "";
  let pi = m;
  let pj = n;
  while (pi > 0 && pj > 0) {
    if (text1[pi - 1] === text2[pj - 1]) {
      pathCells.push([pi, pj]);
      lcs = text1[pi - 1] + lcs;
      pi--;
      pj--;
    } else if (dp[pi - 1][pj] >= dp[pi][pj - 1]) {
      pi--;
    } else {
      pj--;
    }
  }
  pathCells.reverse();

  const answer = dp[m][n];
  gridSnap({
    title: { vi: "Kết quả", en: "Result" },
    codeLines: [11],
    hlCell: [m, n],
    pathCells,
    vars: [
      { name: "LCS length", value: answer },
      { name: "LCS", value: lcs },
    ],
    note: {
      vi: `Dãy con chung dài nhất = "${lcs}" (độ dài ${answer}). Ô xanh = đường truy vết.`,
      en: `Longest common subsequence = "${lcs}" (length ${answer}). Green cells = traceback path.`,
    },
  });

  if (steps.length) steps[steps.length - 1].final = true;
  return { text1, text2, answer, lcs, steps };
}

/**
 * LeetCode 1092: Shortest Common Supersequence.
 * Build the LCS table, then trace backward to merge both strings with minimum length.
 */
function buildSteps1092(input, params) {
  const str1 = String(input).trim();
  const str2 = String(params.str2 || "").trim();
  const m = str1.length;
  const n = str2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const steps = [];

  function gridSnap(opts) {
    const hasActiveCell = Array.isArray(opts.hlCell);
    const currentVars = [];
    if (hasActiveCell) {
      currentVars.push({ name: "i", value: opts.hlCell[0] });
      currentVars.push({ name: "j", value: opts.hlCell[1] });
    }
    for (const item of opts.vars || []) {
      if ((item.name === "i" || item.name === "j") && hasActiveCell) continue;
      currentVars.push(item);
    }
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: dp.map((row) => [...row]),
        text1: str1,
        text2: str2,
        largeCells: true,
        hlCell: opts.hlCell || null,
        pathCells: opts.pathCells || [],
        cellLabels: opts.cellLabels || {},
        showIndices: true,
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: currentVars,
      note: opts.note,
      final: opts.final || false,
    });
  }

  gridSnap({
    title: { vi: "Read m, n", en: "Read m, n" },
    codeLines: [3],
    vars: [
      { name: "str1", value: str1 },
      { name: "str2", value: str2 },
      { name: "m", value: m },
      { name: "n", value: n },
    ],
    note: { vi: `m = ${m}, n = ${n}.`, en: `m = ${m}, n = ${n}.` },
  });

  gridSnap({
    title: { vi: "Build LCS table", en: "Build LCS table" },
    codeLines: [4],
    vars: [
      { name: "dp size", value: `${m + 1} x ${n + 1}` },
      { name: "meaning", value: "dp[i][j] = LCS length of prefixes" },
    ],
    note: {
      vi: "First compute LCS lengths. The traceback uses this table to build the shortest common supersequence.",
      en: "First compute LCS lengths. The traceback uses this table to build the shortest common supersequence.",
    },
  });

  for (let i = 1; i <= m; i++) {
    gridSnap({
      title: { vi: `Outer loop i=${i}`, en: `Outer loop i=${i}` },
      codeLines: [5, 6],
      hlCell: [i, 0],
      vars: [{ name: `str1[${i - 1}]`, value: str1[i - 1] }],
      note: { vi: `Consider str1[:${i}] = "${str1.slice(0, i)}".`, en: `Consider str1[:${i}] = "${str1.slice(0, i)}".` },
    });

    for (let j = 1; j <= n; j++) {
      gridSnap({
        title: { vi: `Inner loop j=${j}`, en: `Inner loop j=${j}` },
        codeLines: [6],
        hlCell: [i, j],
        pathCells: [[i - 1, j - 1], [i - 1, j], [i, j - 1]],
        cellLabels: { [`${i - 1},${j - 1}`]: "diag", [`${i - 1},${j}`]: "up", [`${i},${j - 1}`]: "left" },
        vars: [
          { name: `str1[${i - 1}]`, value: str1[i - 1] },
          { name: `str2[${j - 1}]`, value: str2[j - 1] },
        ],
        note: { vi: `Compute LCS length for "${str1.slice(0, i)}" and "${str2.slice(0, j)}".`, en: `Compute LCS length for "${str1.slice(0, i)}" and "${str2.slice(0, j)}".` },
      });

      const same = str1[i - 1] === str2[j - 1];
      gridSnap({
        title: { vi: `Compare '${str1[i - 1]}' and '${str2[j - 1]}'`, en: `Compare '${str1[i - 1]}' and '${str2[j - 1]}'` },
        codeLines: [7],
        hlCell: [i, j],
        pathCells: same ? [[i - 1, j - 1]] : [[i - 1, j], [i, j - 1]],
        vars: [
          { name: `str1[${i - 1}]`, value: str1[i - 1] },
          { name: `str2[${j - 1}]`, value: str2[j - 1] },
          { name: "same", value: same },
        ],
        note: {
          vi: same ? "Characters match, extend the LCS from diagonal." : "Characters differ, take the better LCS from up or left.",
          en: same ? "Characters match, extend the LCS from diagonal." : "Characters differ, take the better LCS from up or left.",
        },
      });

      if (same) {
        const diag = dp[i - 1][j - 1];
        dp[i][j] = diag + 1;
        gridSnap({
          title: { vi: `dp[${i}][${j}] = ${dp[i][j]}`, en: `dp[${i}][${j}] = ${dp[i][j]}` },
          codeLines: [8],
          hlCell: [i, j],
          pathCells: [[i - 1, j - 1]],
          cellLabels: { [`${i - 1},${j - 1}`]: "dp[i-1]\n[j-1]" },
          vars: [
            { name: `dp[${i - 1}][${j - 1}]`, value: diag },
            { name: `dp[${i}][${j}]`, value: `${diag} + 1 = ${dp[i][j]}` },
          ],
          note: { vi: `Match '${str1[i - 1]}': dp[${i}][${j}] = ${diag} + 1.`, en: `Match '${str1[i - 1]}': dp[${i}][${j}] = ${diag} + 1.` },
        });
      } else {
        const up = dp[i - 1][j];
        const left = dp[i][j - 1];
        dp[i][j] = Math.max(up, left);
        gridSnap({
          title: { vi: `dp[${i}][${j}] = max(${up}, ${left}) = ${dp[i][j]}`, en: `dp[${i}][${j}] = max(${up}, ${left}) = ${dp[i][j]}` },
          codeLines: [10],
          hlCell: [i, j],
          pathCells: [[i - 1, j], [i, j - 1]],
          cellLabels: { [`${i - 1},${j}`]: "up", [`${i},${j - 1}`]: "left" },
          vars: [
            { name: "dp[i-1][j]", value: `dp[${i - 1}][${j}] = ${up}` },
            { name: "dp[i][j-1]", value: `dp[${i}][${j - 1}] = ${left}` },
            { name: `dp[${i}][${j}]`, value: dp[i][j] },
          ],
          note: { vi: "Keep the longer LCS prefix; this later tells traceback which character to append.", en: "Keep the longer LCS prefix; this later tells traceback which character to append." },
        });
      }
    }
  }

  let i = m;
  let j = n;
  const res = [];
  const traceCells = [];

  gridSnap({
    title: { vi: "Start traceback", en: "Start traceback" },
    codeLines: [11, 12],
    hlCell: [i, j],
    pathCells: [[i, j]],
    vars: [
      { name: "i", value: i },
      { name: "j", value: j },
      { name: "res", value: "[]" },
    ],
    note: { vi: "Walk backward from dp[m][n]. res is built in reverse order.", en: "Walk backward from dp[m][n]. res is built in reverse order." },
  });

  while (i > 0 && j > 0) {
    traceCells.push([i, j]);
    const same = str1[i - 1] === str2[j - 1];
    if (same) {
      res.push(str1[i - 1]);
      gridSnap({
        title: { vi: `Match: append '${str1[i - 1]}'`, en: `Match: append '${str1[i - 1]}'` },
        codeLines: [13, 14, 15],
        hlCell: [i, j],
        pathCells: [...traceCells],
        vars: [
          { name: `str1[${i - 1}]`, value: str1[i - 1] },
          { name: `str2[${j - 1}]`, value: str2[j - 1] },
          { name: "res reversed", value: res.join("") },
        ],
        note: { vi: "Same character appears in both strings, append it once and move diagonally.", en: "Same character appears in both strings, append it once and move diagonally." },
      });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      res.push(str1[i - 1]);
      gridSnap({
        title: { vi: `Take str1 char '${str1[i - 1]}'`, en: `Take str1 char '${str1[i - 1]}'` },
        codeLines: [16, 17],
        hlCell: [i, j],
        pathCells: [...traceCells, [i - 1, j]],
        cellLabels: { [`${i - 1},${j}`]: "go up" },
        vars: [
          { name: "dp[i-1][j]", value: `dp[${i - 1}][${j}] = ${dp[i - 1][j]}` },
          { name: "dp[i][j-1]", value: `dp[${i}][${j - 1}] = ${dp[i][j - 1]}` },
          { name: "res reversed", value: res.join("") },
        ],
        note: { vi: "Move up, so append the current str1 character to keep str1 as a subsequence.", en: "Move up, so append the current str1 character to keep str1 as a subsequence." },
      });
      i--;
    } else {
      res.push(str2[j - 1]);
      gridSnap({
        title: { vi: `Take str2 char '${str2[j - 1]}'`, en: `Take str2 char '${str2[j - 1]}'` },
        codeLines: [18, 19],
        hlCell: [i, j],
        pathCells: [...traceCells, [i, j - 1]],
        cellLabels: { [`${i},${j - 1}`]: "go left" },
        vars: [
          { name: "dp[i-1][j]", value: `dp[${i - 1}][${j}] = ${dp[i - 1][j]}` },
          { name: "dp[i][j-1]", value: `dp[${i}][${j - 1}] = ${dp[i][j - 1]}` },
          { name: "res reversed", value: res.join("") },
        ],
        note: { vi: "Move left, so append the current str2 character to keep str2 as a subsequence.", en: "Move left, so append the current str2 character to keep str2 as a subsequence." },
      });
      j--;
    }
  }

  while (i > 0) {
    res.push(str1[i - 1]);
    traceCells.push([i, 0]);
    gridSnap({
      title: { vi: `Append remaining str1 '${str1[i - 1]}'`, en: `Append remaining str1 '${str1[i - 1]}'` },
      codeLines: [20, 21],
      hlCell: [i, 0],
      pathCells: [...traceCells],
      vars: [{ name: "res reversed", value: res.join("") }],
      note: { vi: "str2 is exhausted, append the remaining str1 characters.", en: "str2 is exhausted, append the remaining str1 characters." },
    });
    i--;
  }

  while (j > 0) {
    res.push(str2[j - 1]);
    traceCells.push([0, j]);
    gridSnap({
      title: { vi: `Append remaining str2 '${str2[j - 1]}'`, en: `Append remaining str2 '${str2[j - 1]}'` },
      codeLines: [22, 23],
      hlCell: [0, j],
      pathCells: [...traceCells],
      vars: [{ name: "res reversed", value: res.join("") }],
      note: { vi: "str1 is exhausted, append the remaining str2 characters.", en: "str1 is exhausted, append the remaining str2 characters." },
    });
    j--;
  }

  const answer = res.slice().reverse().join("");
  gridSnap({
    title: { vi: `return "${answer}"`, en: `return "${answer}"` },
    codeLines: [24],
    hlCell: [m, n],
    pathCells: traceCells,
    vars: [
      { name: "reversed(res)", value: answer },
      { name: "length", value: answer.length },
      { name: "return", value: answer },
    ],
    note: { vi: `"${answer}" contains both str1 and str2 as subsequences with minimum length.`, en: `"${answer}" contains both str1 and str2 as subsequences with minimum length.` },
    final: true,
  });

  return { str1, str2, answer, steps };
}

/**
 * LeetCode 583: Delete Operation for Two Strings.
 * dp[i][j] = minimum deletions to make word1[0..i-1] and word2[0..j-1] equal.
 */
function buildSteps583(input, params) {
  const word1 = String(input).trim();
  const word2 = String(params.word2 || "").trim();
  const m = word1.length;
  const n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const steps = [];

  function gridSnap(opts) {
    const hasActiveCell = Array.isArray(opts.hlCell);
    const currentVars = [];
    if (hasActiveCell) {
      currentVars.push({ name: "i", value: opts.hlCell[0] });
      currentVars.push({ name: "j", value: opts.hlCell[1] });
    }
    for (const item of opts.vars || []) {
      if ((item.name === "i" || item.name === "j") && hasActiveCell) continue;
      currentVars.push(item);
    }
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: dp.map((row) => [...row]),
        text1: word1,
        text2: word2,
        hlCell: opts.hlCell || null,
        pathCells: opts.pathCells || [],
        cellLabels: opts.cellLabels || {},
        showIndices: true,
        largeCells: true,
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: currentVars,
      note: opts.note,
    });
  }

  gridSnap({
    title: { vi: "Doc m, n", en: "Read m, n" },
    codeLines: [3],
    vars: [
      { name: "word1", value: word1 },
      { name: "word2", value: word2 },
      { name: "m", value: m },
      { name: "n", value: n },
    ],
    note: { vi: `m = ${m}, n = ${n}.`, en: `m = ${m}, n = ${n}.` },
  });

  gridSnap({
    title: { vi: "Tao bang dp", en: "Create dp table" },
    codeLines: [4],
    vars: [
      { name: "dp size", value: `${m + 1} x ${n + 1}` },
      { name: "meaning", value: "min deletions" },
    ],
    note: {
      vi: "dp[i][j] = so lan xoa it nhat de word1[:i] va word2[:j] giong nhau.",
      en: "dp[i][j] = minimum deletions needed to make word1[:i] and word2[:j] equal.",
    },
  });

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
    gridSnap({
      title: { vi: `Base dp[${i}][0] = ${i}`, en: `Base dp[${i}][0] = ${i}` },
      codeLines: [5, 6],
      hlCell: [i, 0],
      vars: [
        { name: "word1 prefix", value: `"${word1.slice(0, i)}"` },
        { name: `dp[${i}][0]`, value: i },
      ],
      note: {
        vi: `De bien "${word1.slice(0, i)}" thanh chuoi rong, can xoa ${i} ky tu.`,
        en: `To make "${word1.slice(0, i)}" equal to empty string, delete ${i} character(s).`,
      },
    });
  }

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
    gridSnap({
      title: { vi: `Base dp[0][${j}] = ${j}`, en: `Base dp[0][${j}] = ${j}` },
      codeLines: [7, 8],
      hlCell: [0, j],
      vars: [
        { name: "word2 prefix", value: `"${word2.slice(0, j)}"` },
        { name: `dp[0][${j}]`, value: j },
      ],
      note: {
        vi: `De khop voi chuoi rong, can xoa ${j} ky tu tu word2.`,
        en: `To match the empty string, delete ${j} character(s) from word2.`,
      },
    });
  }

  for (let i = 1; i <= m; i++) {
    gridSnap({
      title: { vi: `Vong ngoai i=${i}`, en: `Outer loop i=${i}` },
      codeLines: [9],
      hlCell: [i, 0],
      vars: [{ name: `word1[${i - 1}]`, value: word1[i - 1] }],
      note: {
        vi: `Xet prefix word1[:${i}] = "${word1.slice(0, i)}".`,
        en: `Consider prefix word1[:${i}] = "${word1.slice(0, i)}".`,
      },
    });

    for (let j = 1; j <= n; j++) {
      gridSnap({
        title: { vi: `Vong trong j=${j}`, en: `Inner loop j=${j}` },
        codeLines: [10],
        hlCell: [i, j],
        pathCells: [[i - 1, j - 1], [i - 1, j], [i, j - 1]],
        vars: [
          { name: `word1[${i - 1}]`, value: word1[i - 1] },
          { name: `word2[${j - 1}]`, value: word2[j - 1] },
        ],
        note: {
          vi: `Chuan bi tinh dp[${i}][${j}] cho "${word1.slice(0, i)}" va "${word2.slice(0, j)}".`,
          en: `Prepare to compute dp[${i}][${j}] for "${word1.slice(0, i)}" and "${word2.slice(0, j)}".`,
        },
      });

      const same = word1[i - 1] === word2[j - 1];
      gridSnap({
        title: { vi: `So sanh '${word1[i - 1]}' va '${word2[j - 1]}'`, en: `Compare '${word1[i - 1]}' and '${word2[j - 1]}'` },
        codeLines: [11],
        hlCell: [i, j],
        pathCells: same ? [[i - 1, j - 1]] : [[i - 1, j], [i, j - 1]],
        vars: [
          { name: `word1[${i - 1}]`, value: word1[i - 1] },
          { name: `word2[${j - 1}]`, value: word2[j - 1] },
          { name: "same", value: same },
        ],
        note: {
          vi: same ? "Hai ky tu giong nhau, giu ca hai." : "Hai ky tu khac nhau, xoa mot ky tu tu word1 hoac word2.",
          en: same ? "The characters match, keep both." : "The characters differ, delete one character from word1 or word2.",
        },
      });

      if (same) {
        dp[i][j] = dp[i - 1][j - 1];
        gridSnap({
          title: { vi: `dp[${i}][${j}] = ${dp[i][j]}`, en: `dp[${i}][${j}] = ${dp[i][j]}` },
          codeLines: [12],
          hlCell: [i, j],
          pathCells: [[i - 1, j - 1]],
          cellLabels: { [`${i - 1},${j - 1}`]: "dp[i-1][j-1]" },
          vars: [
            { name: `dp[${i - 1}][${j - 1}]`, value: dp[i - 1][j - 1] },
            { name: `dp[${i}][${j}]`, value: dp[i][j] },
          ],
          note: {
            vi: `'${word1[i - 1]}' == '${word2[j - 1]}', nen dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${dp[i][j]}.`,
            en: `'${word1[i - 1]}' == '${word2[j - 1]}', so dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${dp[i][j]}.`,
          },
        });
      } else {
        const del1 = dp[i - 1][j];
        const del2 = dp[i][j - 1];
        gridSnap({
          title: { vi: "Nhanh else", en: "Else branch" },
          codeLines: [13],
          hlCell: [i, j],
          pathCells: [[i - 1, j], [i, j - 1]],
          vars: [
            { name: "delete from word1", value: `dp[${i - 1}][${j}] = ${del1}` },
            { name: "delete from word2", value: `dp[${i}][${j - 1}] = ${del2}` },
          ],
          note: {
            vi: "Chon xoa 1 ky tu tu word1 hoac word2, roi cong them 1 thao tac.",
            en: "Choose deleting one character from word1 or word2, then add one operation.",
          },
        });

        dp[i][j] = 1 + Math.min(del1, del2);
        gridSnap({
          title: { vi: `dp[${i}][${j}] = ${dp[i][j]}`, en: `dp[${i}][${j}] = ${dp[i][j]}` },
          codeLines: [14],
          hlCell: [i, j],
          pathCells: [[i - 1, j], [i, j - 1]],
          vars: [
            { name: `dp[${i - 1}][${j}]`, value: del1 },
            { name: `dp[${i}][${j - 1}]`, value: del2 },
            { name: `dp[${i}][${j}]`, value: `1 + min(${del1}, ${del2}) = ${dp[i][j]}` },
          ],
          note: {
            vi: `dp[${i}][${j}] = 1 + min(${del1}, ${del2}) = ${dp[i][j]}.`,
            en: `dp[${i}][${j}] = 1 + min(${del1}, ${del2}) = ${dp[i][j]}.`,
          },
        });
      }
    }
  }

  const answer = dp[m][n];
  gridSnap({
    title: { vi: `Ket qua: ${answer}`, en: `Result: ${answer}` },
    codeLines: [15],
    hlCell: [m, n],
    vars: [
      { name: "answer", value: answer },
      { name: `dp[${m}][${n}]`, value: answer },
    ],
    note: {
      vi: `Can it nhat ${answer} thao tac xoa de "${word1}" va "${word2}" giong nhau.`,
      en: `Minimum ${answer} deletion operation(s) are needed to make "${word1}" and "${word2}" equal.`,
    },
  });
  steps[steps.length - 1].final = true;
  return { word1, word2, answer, steps };
}

/**
 * LeetCode 712: Minimum ASCII Delete Sum for Two Strings.
 * dp[i][j] = minimum ASCII delete sum to make s1[0..i-1] and s2[0..j-1] equal.
 */
function buildSteps712(input, params) {
  const s1 = String(input).trim();
  const s2 = String(params.s2 || "").trim();
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const steps = [];
  const ascii = (ch) => ch.charCodeAt(0);

  function gridSnap(opts) {
    const hasActiveCell = Array.isArray(opts.hlCell);
    const currentVars = [];
    if (hasActiveCell) {
      currentVars.push({ name: "i", value: opts.hlCell[0] });
      currentVars.push({ name: "j", value: opts.hlCell[1] });
    }
    for (const item of opts.vars || []) {
      if ((item.name === "i" || item.name === "j") && hasActiveCell) continue;
      currentVars.push(item);
    }
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: dp.map((row) => [...row]),
        text1: s1,
        text2: s2,
        largeCells: true,
        hlCell: opts.hlCell || null,
        pathCells: opts.pathCells || [],
        cellLabels: opts.cellLabels || {},
        showIndices: true,
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: currentVars,
      note: opts.note,
      final: opts.final || false,
    });
  }

  gridSnap({
    title: { vi: "Read m, n", en: "Read m, n" },
    codeLines: [3],
    vars: [
      { name: "s1", value: s1 },
      { name: "s2", value: s2 },
      { name: "m", value: m },
      { name: "n", value: n },
    ],
    note: { vi: `m = ${m}, n = ${n}.`, en: `m = ${m}, n = ${n}.` },
  });

  gridSnap({
    title: { vi: "Create dp table", en: "Create dp table" },
    codeLines: [4],
    vars: [
      { name: "dp size", value: `${m + 1} x ${n + 1}` },
      { name: "meaning", value: "minimum ASCII delete sum" },
    ],
    note: {
      vi: "dp[i][j] = minimum ASCII delete sum to make s1[:i] and s2[:j] equal.",
      en: "dp[i][j] = minimum ASCII delete sum to make s1[:i] and s2[:j] equal.",
    },
  });

  for (let i = 1; i <= m; i++) {
    const cost = ascii(s1[i - 1]);
    dp[i][0] = dp[i - 1][0] + cost;
    gridSnap({
      title: { vi: `Base dp[${i}][0] = ${dp[i][0]}`, en: `Base dp[${i}][0] = ${dp[i][0]}` },
      codeLines: [5, 6],
      hlCell: [i, 0],
      pathCells: [[i - 1, 0]],
      cellLabels: { [`${i - 1},0`]: "prev" },
      vars: [
        { name: `s1[${i - 1}]`, value: s1[i - 1] },
        { name: `ord('${s1[i - 1]}')`, value: cost },
        { name: `dp[${i - 1}][0]`, value: dp[i - 1][0] },
        { name: `dp[${i}][0]`, value: `${dp[i - 1][0]} + ${cost} = ${dp[i][0]}` },
      ],
      note: {
        vi: `To match empty s2, delete "${s1.slice(0, i)}" from s1. Add ASCII '${s1[i - 1]}' = ${cost}.`,
        en: `To match empty s2, delete "${s1.slice(0, i)}" from s1. Add ASCII '${s1[i - 1]}' = ${cost}.`,
      },
    });
  }

  for (let j = 1; j <= n; j++) {
    const cost = ascii(s2[j - 1]);
    dp[0][j] = dp[0][j - 1] + cost;
    gridSnap({
      title: { vi: `Base dp[0][${j}] = ${dp[0][j]}`, en: `Base dp[0][${j}] = ${dp[0][j]}` },
      codeLines: [7, 8],
      hlCell: [0, j],
      pathCells: [[0, j - 1]],
      cellLabels: { [`0,${j - 1}`]: "prev" },
      vars: [
        { name: `s2[${j - 1}]`, value: s2[j - 1] },
        { name: `ord('${s2[j - 1]}')`, value: cost },
        { name: `dp[0][${j - 1}]`, value: dp[0][j - 1] },
        { name: `dp[0][${j}]`, value: `${dp[0][j - 1]} + ${cost} = ${dp[0][j]}` },
      ],
      note: {
        vi: `To match empty s1, delete "${s2.slice(0, j)}" from s2. Add ASCII '${s2[j - 1]}' = ${cost}.`,
        en: `To match empty s1, delete "${s2.slice(0, j)}" from s2. Add ASCII '${s2[j - 1]}' = ${cost}.`,
      },
    });
  }

  for (let i = 1; i <= m; i++) {
    gridSnap({
      title: { vi: `Outer loop i=${i}`, en: `Outer loop i=${i}` },
      codeLines: [9],
      hlCell: [i, 0],
      vars: [
        { name: `s1[${i - 1}]`, value: s1[i - 1] },
        { name: `ord('${s1[i - 1]}')`, value: ascii(s1[i - 1]) },
      ],
      note: { vi: `Consider s1[:${i}] = "${s1.slice(0, i)}".`, en: `Consider s1[:${i}] = "${s1.slice(0, i)}".` },
    });

    for (let j = 1; j <= n; j++) {
      gridSnap({
        title: { vi: `Inner loop j=${j}`, en: `Inner loop j=${j}` },
        codeLines: [10],
        hlCell: [i, j],
        pathCells: [[i - 1, j - 1], [i - 1, j], [i, j - 1]],
        cellLabels: {
          [`${i - 1},${j - 1}`]: "diag",
          [`${i - 1},${j}`]: "del s1",
          [`${i},${j - 1}`]: "del s2",
        },
        vars: [
          { name: `s1[${i - 1}]`, value: s1[i - 1] },
          { name: `s2[${j - 1}]`, value: s2[j - 1] },
        ],
        note: { vi: `Compute dp[${i}][${j}] for "${s1.slice(0, i)}" and "${s2.slice(0, j)}".`, en: `Compute dp[${i}][${j}] for "${s1.slice(0, i)}" and "${s2.slice(0, j)}".` },
      });

      const same = s1[i - 1] === s2[j - 1];
      gridSnap({
        title: { vi: `Compare '${s1[i - 1]}' and '${s2[j - 1]}'`, en: `Compare '${s1[i - 1]}' and '${s2[j - 1]}'` },
        codeLines: [11],
        hlCell: [i, j],
        pathCells: same ? [[i - 1, j - 1]] : [[i - 1, j], [i, j - 1]],
        cellLabels: same ? { [`${i - 1},${j - 1}`]: "keep" } : { [`${i - 1},${j}`]: "delete s1", [`${i},${j - 1}`]: "delete s2" },
        vars: [
          { name: `s1[${i - 1}]`, value: s1[i - 1] },
          { name: `s2[${j - 1}]`, value: s2[j - 1] },
          { name: "same", value: same },
        ],
        note: {
          vi: same ? "Characters match, keep both with no delete cost." : "Characters differ, choose the cheaper delete.",
          en: same ? "Characters match, keep both with no delete cost." : "Characters differ, choose the cheaper delete.",
        },
      });

      if (same) {
        dp[i][j] = dp[i - 1][j - 1];
        gridSnap({
          title: { vi: `dp[${i}][${j}] = ${dp[i][j]}`, en: `dp[${i}][${j}] = ${dp[i][j]}` },
          codeLines: [12],
          hlCell: [i, j],
          pathCells: [[i - 1, j - 1]],
          cellLabels: { [`${i - 1},${j - 1}`]: "dp[i-1]\n[j-1]" },
          vars: [
            { name: `dp[${i - 1}][${j - 1}]`, value: dp[i - 1][j - 1] },
            { name: `dp[${i}][${j}]`, value: dp[i][j] },
          ],
          note: { vi: `'${s1[i - 1]}' == '${s2[j - 1]}', so keep both characters.`, en: `'${s1[i - 1]}' == '${s2[j - 1]}', so keep both characters.` },
        });
      } else {
        const cost1 = ascii(s1[i - 1]);
        const cost2 = ascii(s2[j - 1]);
        const delS1 = cost1 + dp[i - 1][j];
        const delS2 = cost2 + dp[i][j - 1];
        gridSnap({
          title: { vi: `min(${delS1}, ${delS2})`, en: `min(${delS1}, ${delS2})` },
          codeLines: [14],
          hlCell: [i, j],
          pathCells: [[i - 1, j], [i, j - 1]],
          cellLabels: { [`${i - 1},${j}`]: "delete s1", [`${i},${j - 1}`]: "delete s2" },
          vars: [
            { name: "delete s1[i-1]", value: `ord('${s1[i - 1]}') + dp[${i - 1}][${j}] = ${cost1} + ${dp[i - 1][j]} = ${delS1}` },
            { name: "delete s2[j-1]", value: `ord('${s2[j - 1]}') + dp[${i}][${j - 1}] = ${cost2} + ${dp[i][j - 1]} = ${delS2}` },
          ],
          note: { vi: "Try deleting the current char from either string, then choose lower ASCII cost.", en: "Try deleting the current char from either string, then choose lower ASCII cost." },
        });

        dp[i][j] = Math.min(delS1, delS2);
        gridSnap({
          title: { vi: `dp[${i}][${j}] = ${dp[i][j]}`, en: `dp[${i}][${j}] = ${dp[i][j]}` },
          codeLines: [14],
          hlCell: [i, j],
          pathCells: delS1 <= delS2 ? [[i - 1, j]] : [[i, j - 1]],
          vars: [
            { name: `dp[${i}][${j}]`, value: `min(${delS1}, ${delS2}) = ${dp[i][j]}` },
          ],
          note: { vi: `Choose minimum delete sum = ${dp[i][j]}.`, en: `Choose minimum delete sum = ${dp[i][j]}.` },
        });
      }
    }
  }

  const answer = dp[m][n];
  gridSnap({
    title: { vi: `return dp[m][n] = ${answer}`, en: `return dp[m][n] = ${answer}` },
    codeLines: [18],
    hlCell: [m, n],
    vars: [
      { name: `dp[${m}][${n}]`, value: answer },
      { name: "return", value: answer },
    ],
    note: { vi: `Minimum ASCII delete sum = ${answer}.`, en: `Minimum ASCII delete sum = ${answer}.` },
    final: true,
  });

  return { s1, s2, answer, steps };
}

/**
 * Generate steps for LeetCode 688: Knight Probability in Chessboard.
 * DP: dp[r][c] = probability of being at (r,c) after current number of steps.
 */
function buildSteps688(input, params) {
  const n = input[0];
  const k = params.k || 2;
  const startRow = params.row || 0;
  const startCol = params.col || 0;
  const steps = [];

  const knightMoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];

  let dp = Array.from({ length: n }, () => new Array(n).fill(0));
  dp[startRow][startCol] = 1.0;

  function fmt(v) {
    return v > 0 ? v.toFixed(3) : ".";
  }

  function makeGrid(hlCell, pathCells = [], matrix = dp, cellLabels = {}) {
    return {
      dp: matrix.map((row) => row.map(fmt)),
      text1: Array.from({ length: n }, (_, i) => String(i)),
      text2: Array.from({ length: n }, (_, i) => String(i)),
      largeCells: true,
      hlCell: hlCell || null,
      pathCells,
      cellLabels,
      showIndices: true,
    };
  }

  function totalProb(matrix = dp) {
    let sum = 0;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) sum += matrix[r][c];
    }
    return sum;
  }

  steps.push({
    title: { vi: "Initialize dp", en: "Initialize dp" },
    arr: [],
    grid: makeGrid([startRow, startCol]),
    highlight: [],
    mark: [],
    codeLines: [5, 6],
    vars: [
      { name: "n", value: n },
      { name: "k", value: k },
      { name: "start", value: `(${startRow}, ${startCol})` },
      { name: "dp[row][col]", value: "1.000" },
      { name: "total on board", value: "1.000" },
    ],
    note: {
      vi: `Knight starts at (${startRow},${startCol}) with probability 1. Every move splits probability equally into 8 directions; off-board moves are lost.`,
      en: `Knight starts at (${startRow},${startCol}) with probability 1. Every move splits probability equally into 8 directions; off-board moves are lost.`,
    },
  });

  for (let step = 0; step < k; step++) {
    const oldDp = dp;
    const newDp = Array.from({ length: n }, () => new Array(n).fill(0));

    steps.push({
      title: { vi: `Move ${step + 1}: start new_dp`, en: `Move ${step + 1}: start new_dp` },
      arr: [],
      grid: makeGrid(null, [], oldDp),
      highlight: [],
      mark: [],
      codeLines: [7, 8],
      vars: [
        { name: "move", value: `${step + 1}/${k}` },
        { name: "current total", value: totalProb(oldDp).toFixed(6) },
        { name: "new_dp", value: "all zeros" },
      ],
      note: {
        vi: "For this move, read probabilities from dp and write the next probabilities into a fresh new_dp table.",
        en: "For this move, read probabilities from dp and write the next probabilities into a fresh new_dp table.",
      },
    });

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const p = oldDp[r][c];
        if (p <= 0) continue;

        const valid = [];
        const offBoard = [];
        for (const [dr, dc] of knightMoves) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < n && nc >= 0 && nc < n) valid.push([nr, nc]);
          else offBoard.push([nr, nc]);
        }
        const share = p / 8;
        const labels = Object.fromEntries(valid.map(([nr, nc]) => [`${nr},${nc}`, `+${share.toFixed(3)}`]));

        steps.push({
          title: { vi: `From (${r},${c}): split ${p.toFixed(3)} / 8`, en: `From (${r},${c}): split ${p.toFixed(3)} / 8` },
          arr: [],
          grid: makeGrid([r, c], valid, oldDp, labels),
          highlight: [],
          mark: [],
          codeLines: [9, 10, 11, 12, 13, 14],
          vars: [
            { name: "move", value: `${step + 1}/${k}` },
            { name: `dp[${r}][${c}]`, value: p.toFixed(6) },
            { name: "each move gets", value: `${p.toFixed(6)} / 8 = ${share.toFixed(6)}` },
            { name: "valid moves", value: valid.map(([nr, nc]) => `(${nr},${nc})`).join(", ") || "none" },
            { name: "off-board moves", value: offBoard.length },
          ],
          note: {
            vi: `${valid.length} valid destination(s) receive ${share.toFixed(6)} each. ${offBoard.length} move(s) fall off the board and disappear.`,
            en: `${valid.length} valid destination(s) receive ${share.toFixed(6)} each. ${offBoard.length} move(s) fall off the board and disappear.`,
          },
        });

        for (const [nr, nc] of valid) newDp[nr][nc] += share;

        steps.push({
          title: { vi: `Update new_dp from (${r},${c})`, en: `Update new_dp from (${r},${c})` },
          arr: [],
          grid: makeGrid(null, valid, newDp, labels),
          highlight: [],
          mark: [],
          codeLines: [15],
          vars: [
            { name: "added to each valid cell", value: share.toFixed(6) },
            { name: "new_dp total so far", value: totalProb(newDp).toFixed(6) },
          ],
          note: {
            vi: "new_dp now shows the accumulated probabilities for the next move.",
            en: "new_dp now shows the accumulated probabilities for the next move.",
          },
        });
      }
    }

    dp = newDp;
    const prob = totalProb();

    steps.push({
      title: { vi: `After move ${step + 1}: on board = ${prob.toFixed(4)}`, en: `After move ${step + 1}: on board = ${prob.toFixed(4)}` },
      arr: [],
      grid: makeGrid(),
      highlight: [],
      mark: [],
      codeLines: [16],
      vars: [
        { name: "move", value: step + 1 },
        { name: "total on board", value: prob.toFixed(6) },
        { name: "lost this/previous moves", value: (1 - prob).toFixed(6) },
      ],
      note: {
        vi: `End of move ${step + 1}. Sum every cell in dp: ${prob.toFixed(6)} is still on board.`,
        en: `End of move ${step + 1}. Sum every cell in dp: ${prob.toFixed(6)} is still on board.`,
      },
    });
  }

  const answer = totalProb();
  steps.push({
    title: { vi: `return ${answer.toFixed(5)}`, en: `return ${answer.toFixed(5)}` },
    arr: [],
    grid: makeGrid(),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [17],
    vars: [
      { name: "answer", value: answer.toFixed(6) },
      { name: "sum(dp)", value: answer.toFixed(6) },
    ],
    note: {
      vi: `Final answer is the sum of all probabilities left on the board after ${k} move(s).`,
      en: `Final answer is the sum of all probabilities left on the board after ${k} move(s).`,
    },
  });

  return { n, k, answer: +answer.toFixed(5), steps };
}

/**
 * LeetCode 2140: Solving Questions With Brainpower.
 * Backward DP: solving question i earns points[i] but locks the next brainpower[i]
 * questions, so the next reachable question is i + brainpower[i] + 1.
 * dp[i] = max(dp[i+1], points[i] + dp[min(i + brainpower[i] + 1, n)]); answer = dp[0].
 */
function parseQuestions2140(raw) {
  let rows = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) throw new Error("questions must not be empty.");
    if (trimmed.startsWith("[")) {
      rows = JSON.parse(trimmed);
    } else {
      rows = trimmed.split(/[;\n]/).map((part) => part.split(",").map((value) => Number(value.trim())));
    }
  }
  if (!Array.isArray(rows) || rows.length === 0) throw new Error("questions must contain at least one pair.");
  const questions = rows.map((row) => {
    if (!Array.isArray(row) || row.length !== 2 || row.some((value) => !Number.isInteger(value) || value < 1)) {
      throw new Error("each question must be [points, brainpower] with positive integers.");
    }
    return [row[0], row[1]];
  });
  return questions;
}

function buildSteps2140(input) {
  const questions = parseQuestions2140(input);
  const n = questions.length;
  const steps = [];
  const dp = new Array(n + 1).fill(null);
  const decisions = new Array(n).fill(null); // "solve" | "skip"

  let phase = "init";
  let i = null;
  let points = null;
  let brainpower = null;
  let skip = null;
  let solve = null;
  let jumpTarget = null;
  let decision = null;
  let answer = null;
  let chosen = [];

  const reconstruct = () => {
    const picked = [];
    let k = 0;
    while (k < n) {
      if (decisions[k] === "solve") {
        picked.push(k);
        k += questions[k][1] + 1;
      } else {
        k += 1;
      }
    }
    return picked;
  };

  const snapshot = () => ({
    questions: questions.map((q) => [...q]),
    n,
    dp: [...dp],
    decisions: [...decisions],
    phase,
    i,
    points,
    brainpower,
    skip,
    solve,
    jumpTarget,
    lockedStart: phase === "compare" || phase === "write" ? (Number.isInteger(i) ? i + 1 : null) : null,
    lockedEnd: (phase === "compare" || phase === "write") && Number.isInteger(jumpTarget) ? jumpTarget - 1 : null,
    decision,
    chosen: [...chosen],
    answer,
  });

  const push = ({ title, note, line, final = false, vars = [] }) => {
    steps.push({
      title,
      note,
      codeLines: [line],
      final,
      arr: [],
      highlight: [],
      mark: [],
      vars,
      brainpower2140View: snapshot(),
    });
  };

  push({
    title: { vi: `n = len(questions) = ${n}`, en: `n = len(questions) = ${n}` },
    note: {
      vi: "Mỗi câu hỏi i cho points[i] điểm nhưng khóa brainpower[i] câu ngay sau nó.",
      en: "Each question i gives points[i] but locks the next brainpower[i] questions.",
    },
    line: 3,
    vars: [{ name: "n", value: n }],
  });

  dp[n] = 0;
  push({
    title: { vi: `dp = [0] * (n + 1)`, en: `dp = [0] * (n + 1)` },
    note: {
      vi: "dp[i] = điểm tối đa nếu bắt đầu xét từ câu i tới hết. dp[n] = 0 (không còn câu nào).",
      en: "dp[i] = best points achievable starting from question i onward. dp[n] = 0 (no questions left).",
    },
    line: 4,
    vars: [{ name: "dp", value: `[${dp.map((x) => (x === null ? "·" : x)).join(",")}]` }],
  });

  for (i = n - 1; i >= 0; i--) {
    points = questions[i][0];
    brainpower = questions[i][1];
    jumpTarget = Math.min(i + brainpower + 1, n);
    decision = null;
    phase = "scan";
    push({
      title: { vi: `i = ${i} (duyệt ngược)`, en: `i = ${i} (scan backward)` },
      note: {
        vi: "Đi từ phải sang trái vì dp[i] cần dp của các câu PHÍA SAU (đã tính xong).",
        en: "We go right to left because dp[i] depends on later questions that are already computed.",
      },
      line: 5,
      vars: [{ name: "i", value: i }],
    });

    phase = "read";
    push({
      title: { vi: `points=${points}, brainpower=${brainpower}`, en: `points=${points}, brainpower=${brainpower}` },
      note: {
        vi: `Nếu giải câu ${i}: +${points} điểm nhưng bỏ qua ${brainpower} câu kế → câu tiếp theo có thể làm là ${jumpTarget === n ? "hết mảng" : jumpTarget}.`,
        en: `Solving question ${i}: +${points} points but skip the next ${brainpower} → the next doable question is ${jumpTarget === n ? "end of array" : jumpTarget}.`,
      },
      line: 6,
      vars: [{ name: "points", value: points }, { name: "brainpower", value: brainpower }],
    });

    skip = dp[i + 1];
    phase = "skip";
    push({
      title: { vi: `skip = dp[${i + 1}] = ${skip}`, en: `skip = dp[${i + 1}] = ${skip}` },
      note: {
        vi: `BỎ câu ${i}: chuyển thẳng sang câu ${i + 1}, giữ điểm dp[${i + 1}] = ${skip}.`,
        en: `SKIP question ${i}: move straight to question ${i + 1}, keeping dp[${i + 1}] = ${skip}.`,
      },
      line: 7,
      vars: [{ name: "skip = dp[i+1]", value: skip }],
    });

    solve = points + dp[jumpTarget];
    phase = "solve";
    push({
      title: { vi: `solve = ${points} + dp[${jumpTarget}] = ${solve}`, en: `solve = ${points} + dp[${jumpTarget}] = ${solve}` },
      note: {
        vi: `GIẢI câu ${i}: cộng ${points} rồi nhảy tới dp[min(${i}+${brainpower}+1, ${n})] = dp[${jumpTarget}] = ${dp[jumpTarget]}.`,
        en: `SOLVE question ${i}: add ${points} then jump to dp[min(${i}+${brainpower}+1, ${n})] = dp[${jumpTarget}] = ${dp[jumpTarget]}.`,
      },
      line: 8,
      vars: [{ name: "solve = points + dp[jump]", value: solve }, { name: "jump target", value: jumpTarget }],
    });

    phase = "compare";
    push({
      title: { vi: `So sánh: skip=${skip} vs solve=${solve}`, en: `Compare: skip=${skip} vs solve=${solve}` },
      note: {
        vi: `Nếu GIẢI, các câu ${i + 1}${jumpTarget - 1 >= i + 1 ? `..${jumpTarget - 1}` : ""} bị khóa (tô đỏ). Chọn phương án cho điểm cao hơn.`,
        en: `If we SOLVE, questions ${i + 1}${jumpTarget - 1 >= i + 1 ? `..${jumpTarget - 1}` : ""} get locked (red). Pick the higher-scoring option.`,
      },
      line: 8,
      vars: [{ name: "skip", value: skip }, { name: "solve", value: solve }],
    });

    dp[i] = Math.max(skip, solve);
    decision = solve > skip ? "solve" : "skip";
    decisions[i] = decision;
    phase = "write";
    push({
      title: { vi: `dp[${i}] = max(${skip}, ${solve}) = ${dp[i]}`, en: `dp[${i}] = max(${skip}, ${solve}) = ${dp[i]}` },
      note: decision === "solve"
        ? {
          vi: `GIẢI câu ${i}: dp[${i}] = ${dp[i]}. Đường đi tối ưu từ đây gồm câu ${i} rồi nhảy tới câu ${jumpTarget === n ? "(hết)" : jumpTarget}.`,
          en: `SOLVE question ${i}: dp[${i}] = ${dp[i]}. The optimal path from here takes question ${i} then jumps to ${jumpTarget === n ? "the end" : `question ${jumpTarget}`}.`,
        }
        : {
          vi: `BỎ câu ${i}: dp[${i}] = ${dp[i]} lấy từ dp[${i + 1}].`,
          en: `SKIP question ${i}: dp[${i}] = ${dp[i]} taken from dp[${i + 1}].`,
        },
      line: 9,
      vars: [{ name: "dp[i]", value: dp[i] }, { name: "decision", value: decision === "solve" ? `SOLVE ${i}` : `SKIP ${i}` }],
    });
  }

  phase = "done";
  i = 0;
  answer = dp[0];
  chosen = reconstruct();
  const chosenPoints = chosen.map((q) => `${questions[q][0]}`).join(" + ") || "0";
  push({
    title: { vi: `return dp[0] = ${answer}`, en: `return dp[0] = ${answer}` },
    note: {
      vi: chosen.length
        ? `Điểm tối đa = ${answer}. Chuỗi câu được giải: {${chosen.join(", ")}} → ${chosenPoints} = ${answer}.`
        : `Điểm tối đa = ${answer}.`,
      en: chosen.length
        ? `Maximum points = ${answer}. Solved questions: {${chosen.join(", ")}} → ${chosenPoints} = ${answer}.`
        : `Maximum points = ${answer}.`,
    },
    line: 10,
    final: true,
    vars: [{ name: "answer", value: answer }, { name: "solved", value: `{${chosen.join(", ")}}` }],
  });

  return { original: questions, answer, steps };
}

/**
 * LeetCode 740: Delete and Earn.
 * Reduce to House Robber: build earn[v] = v * count(v), then dp on earn[0..maxVal].
 * dp[i] = max(dp[i-1], dp[i-2] + earn[i]) — can't take adjacent values.
 */
function buildSteps740(nums) {
  if (!Array.isArray(nums) || nums.length === 0 || nums.some((value) => !Number.isInteger(value) || value < 1)) {
    throw new Error("nums must contain at least one positive integer.");
  }

  const steps = [];
  const n = nums.length;
  const maxVal = Math.max(...nums);
  const counts = new Array(maxVal + 1).fill(0);
  const earn = new Array(maxVal + 1).fill(0);
  const dp = new Array(maxVal + 1).fill(null);
  const decisions = new Array(maxVal + 1).fill(null); // "take" | "skip" per dp index

  let phase = "aggregate";
  let activeNumIndex = null; // index into nums during bucket building
  let activeValue = null; // current value/index on the earn line
  let i = null; // current dp index
  let take = null;
  let skip = null;
  let decision = null;
  let answer = null;
  let chosen = [];

  const distinctValues = () => {
    const set = [];
    for (let v = 0; v <= maxVal; v++) if (counts[v] > 0) set.push(v);
    return set;
  };
  // Reconstruct which values were actually taken by walking dp backwards.
  const reconstruct = () => {
    const picked = [];
    let k = maxVal;
    while (k >= 0) {
      if (k === 0) {
        if (earn[0] > 0 && (dp[0] || 0) > 0) picked.push(0);
        break;
      }
      const prev = k >= 2 ? (dp[k - 2] || 0) : 0;
      if (dp[k] !== null && earn[k] > 0 && dp[k] === prev + earn[k] && dp[k] !== (dp[k - 1] || 0)) {
        picked.push(k);
        k -= 2;
      } else {
        k -= 1;
      }
    }
    return picked.reverse();
  };

  const snapshot = () => ({
    nums: [...nums],
    maxVal,
    counts: [...counts],
    earn: [...earn],
    dp: [...dp],
    decisions: [...decisions],
    phase,
    activeNumIndex,
    activeValue,
    i,
    take,
    skip,
    decision,
    chosen: [...chosen],
    answer,
    conflictLeft: phase === "dp-compute" && Number.isInteger(i) ? i - 1 : null,
    baseIndex: phase === "dp-compute" && Number.isInteger(i) ? i - 2 : null,
  });

  const push = ({ title, note, line, final = false, vars = [] }) => {
    steps.push({
      title,
      note,
      codeLines: [line],
      final,
      arr: [...nums],
      highlight: [],
      mark: [],
      vars,
      deleteEarn740View: snapshot(),
    });
  };

  // ---- Phase 1: aggregate nums into earn[] by value ----
  push({
    title: { vi: `max_val = max(nums) = ${maxVal}`, en: `max_val = max(nums) = ${maxVal}` },
    note: {
      vi: "Giá trị lớn nhất quyết định độ dài của earn[] và dp[]. Ta sẽ làm việc trên trục GIÁ TRỊ chứ không phải trục vị trí.",
      en: "The largest value sizes earn[] and dp[]. We work on the VALUE axis, not the position axis.",
    },
    line: 3,
    vars: [{ name: "nums", value: `[${nums.join(",")}]` }, { name: "max_val", value: maxVal }],
  });
  push({
    title: { vi: `earn = [0] * ${maxVal + 1}`, en: `earn = [0] * ${maxVal + 1}` },
    note: {
      vi: "earn[v] sẽ là TỔNG điểm nếu ta lấy tất cả phần tử bằng v. Vì lấy một v là lấy hết mọi v (chúng không xung đột nhau).",
      en: "earn[v] will be the TOTAL points from taking every element equal to v. Taking one v means taking all v (they never conflict).",
    },
    line: 4,
    vars: [{ name: "earn", value: `[${earn.join(",")}]` }],
  });

  phase = "aggregate-loop";
  for (let k = 0; k < n; k++) {
    activeNumIndex = k;
    activeValue = nums[k];
    push({
      title: { vi: `num = nums[${k}] = ${nums[k]}`, en: `num = nums[${k}] = ${nums[k]}` },
      note: {
        vi: `Bỏ ${nums[k]} vào "thùng" giá trị ${nums[k]}.`,
        en: `Drop ${nums[k]} into the bucket for value ${nums[k]}.`,
      },
      line: 5,
      vars: [{ name: "num", value: nums[k] }],
    });
    counts[nums[k]] += 1;
    earn[nums[k]] += nums[k];
    push({
      title: { vi: `earn[${nums[k]}] += ${nums[k]} → ${earn[nums[k]]}`, en: `earn[${nums[k]}] += ${nums[k]} → ${earn[nums[k]]}` },
      note: {
        vi: `Thùng ${nums[k]} giờ có ${counts[nums[k]]} phần tử, tổng điểm earn[${nums[k]}] = ${nums[k]} × ${counts[nums[k]]} = ${earn[nums[k]]}.`,
        en: `Bucket ${nums[k]} now holds ${counts[nums[k]]} elements, so earn[${nums[k]}] = ${nums[k]} × ${counts[nums[k]]} = ${earn[nums[k]]}.`,
      },
      line: 6,
      vars: [{ name: `earn[${nums[k]}]`, value: earn[nums[k]] }, { name: "count", value: counts[nums[k]] }],
    });
  }
  activeNumIndex = null;

  // Bridge frame: explain the House Robber reduction on the value line.
  phase = "reduce";
  activeValue = null;
  const distinct = distinctValues();
  const adjacentPair = distinct.find((v) => distinct.includes(v + 1));
  push({
    title: { vi: "Ý tưởng: House Robber trên trục giá trị", en: "Idea: House Robber on the value axis" },
    note: adjacentPair !== undefined
      ? {
        vi: `Lấy giá trị v sẽ xóa v-1 và v+1. Ví dụ ${adjacentPair} và ${adjacentPair + 1} là hai giá trị liền kề → không thể lấy cả hai. Đây đúng là House Robber: không lấy hai ô cạnh nhau trên earn[].`,
        en: `Taking value v deletes v-1 and v+1. For example ${adjacentPair} and ${adjacentPair + 1} are adjacent → cannot take both. That is exactly House Robber: no two neighboring cells of earn[].`,
      }
      : {
        vi: "Lấy giá trị v sẽ xóa v-1 và v+1. Bài toán trở thành House Robber trên earn[]: không lấy hai ô cạnh nhau.",
        en: "Taking value v deletes v-1 and v+1. This becomes House Robber on earn[]: never take two neighboring cells.",
      },
    line: 6,
    vars: [{ name: "earn", value: `[${earn.join(",")}]` }],
  });

  // ---- Phase 2: DP over earn[] ----
  phase = "dp-init";
  push({
    title: { vi: `dp = [0] * ${maxVal + 1}`, en: `dp = [0] * ${maxVal + 1}` },
    note: {
      vi: "dp[v] = điểm tối đa khi chỉ xét các giá trị từ 0 đến v.",
      en: "dp[v] = the best points using only values from 0 to v.",
    },
    line: 7,
    vars: [{ name: "dp", value: `[${dp.map((x) => (x === null ? 0 : x)).join(",")}]` }],
  });

  dp[0] = earn[0];
  decisions[0] = earn[0] > 0 ? "take" : "skip";
  i = 0;
  push({
    title: { vi: `dp[0] = earn[0] = ${earn[0]}`, en: `dp[0] = earn[0] = ${earn[0]}` },
    note: {
      vi: "Chỉ có giá trị 0, nên cứ lấy hết điểm của nó (0 không tồn tại trong nums dương nên thường bằng 0).",
      en: "With only value 0 available, take all of its points (value 0 never appears for positive nums, so this is usually 0).",
    },
    line: 8,
    vars: [{ name: "dp[0]", value: dp[0] }],
  });

  if (maxVal >= 1) {
    dp[1] = Math.max(earn[0], earn[1]);
    decisions[1] = earn[1] >= earn[0] ? "take" : "skip";
    i = 1;
    push({
      title: { vi: `dp[1] = max(earn[0], earn[1]) = max(${earn[0]}, ${earn[1]}) = ${dp[1]}`, en: `dp[1] = max(earn[0], earn[1]) = max(${earn[0]}, ${earn[1]}) = ${dp[1]}` },
      note: {
        vi: "Giá trị 0 và 1 liền kề nên chỉ được chọn một; lấy cái có điểm cao hơn.",
        en: "Values 0 and 1 are adjacent, so pick only the higher-scoring one.",
      },
      line: 9,
      vars: [{ name: "dp[1]", value: dp[1] }, { name: "earn[0]", value: earn[0] }, { name: "earn[1]", value: earn[1] }],
    });
  }

  for (i = 2; i <= maxVal; i++) {
    phase = "dp-loop";
    skip = dp[i - 1];
    take = dp[i - 2] + earn[i];
    decision = null;
    push({
      title: { vi: `i = ${i}: xét giá trị ${i}`, en: `i = ${i}: consider value ${i}` },
      note: {
        vi: `Hai lựa chọn: BỎ giá trị ${i} (giữ dp[${i - 1}]=${skip}) hoặc LẤY giá trị ${i} (dp[${i - 2}]=${dp[i - 2]} + earn[${i}]=${earn[i]} = ${take}).`,
        en: `Two options: SKIP value ${i} (keep dp[${i - 1}]=${skip}) or TAKE value ${i} (dp[${i - 2}]=${dp[i - 2]} + earn[${i}]=${earn[i]} = ${take}).`,
      },
      line: 10,
      vars: [
        { name: "i", value: i },
        { name: "skip = dp[i-1]", value: skip },
        { name: "take = dp[i-2]+earn[i]", value: take },
      ],
    });

    phase = "dp-compute";
    dp[i] = Math.max(skip, take);
    decision = take > skip ? "take" : "skip";
    decisions[i] = decision;
    push({
      title: { vi: `dp[${i}] = max(${skip}, ${take}) = ${dp[i]}`, en: `dp[${i}] = max(${skip}, ${take}) = ${dp[i]}` },
      note: decision === "take"
        ? {
          vi: `LẤY giá trị ${i}: cộng earn[${i}]=${earn[i]} vào dp[${i - 2}]=${dp[i - 2]}. Chú ý phải bỏ qua giá trị ${i - 1} liền kề (đó là lý do dùng dp[${i - 2}] chứ không phải dp[${i - 1}]).`,
          en: `TAKE value ${i}: add earn[${i}]=${earn[i]} to dp[${i - 2}]=${dp[i - 2]}. Note we must skip the adjacent value ${i - 1} (that is why we use dp[${i - 2}], not dp[${i - 1}]).`,
        }
        : {
          vi: `BỎ giá trị ${i}: giữ nguyên dp[${i - 1}]=${skip} vì lấy ${i} không có lợi.`,
          en: `SKIP value ${i}: keep dp[${i - 1}]=${skip} because taking ${i} is not worth it.`,
        },
      line: 11,
      vars: [
        { name: "dp[i]", value: dp[i] },
        { name: "decision", value: decision === "take" ? (`TAKE ${i}`) : (`SKIP ${i}`) },
      ],
    });
  }

  phase = "done";
  i = maxVal;
  answer = dp[maxVal];
  chosen = reconstruct();
  const chosenPoints = chosen.map((v) => `earn[${v}]=${earn[v]}`).join(" + ") || "0";
  push({
    title: { vi: `return dp[${maxVal}] = ${answer}`, en: `return dp[${maxVal}] = ${answer}` },
    note: {
      vi: chosen.length
        ? `Điểm tối đa = ${answer}. Các giá trị được chọn: {${chosen.join(", ")}} → ${chosenPoints} = ${answer}. Không có hai giá trị nào liền kề.`
        : `Điểm tối đa = ${answer}.`,
      en: chosen.length
        ? `Maximum points = ${answer}. Chosen values: {${chosen.join(", ")}} → ${chosenPoints} = ${answer}. No two chosen values are adjacent.`
        : `Maximum points = ${answer}.`,
    },
    line: 12,
    final: true,
    vars: [{ name: "answer", value: answer }, { name: "chosen values", value: `{${chosen.join(", ")}}` }],
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 1510: Stone Game IV.
 * Boolean game DP: dp[i] is true if the current player has a move taking
 * a perfect square that leaves a losing state for the opponent.
 */
function buildSteps1510(input) {
  const raw = Array.isArray(input) ? input[0] : input;
  const n = Math.max(0, Math.min(60, Number.parseInt(raw, 10) || 7));
  const dp = new Array(n + 1).fill(false);
  const known = new Array(n + 1).fill(false);
  const steps = [];
  const squares = [];
  for (let move = 1; move * move <= n; move += 1) squares.push(move * move);

  let phase = "intro";
  let activeI = null;
  let activeMove = null;
  let activeSquare = null;
  let activeRemain = null;
  let options = [];

  function makeView() {
    return {
      n,
      phase,
      activeI,
      activeMove,
      activeSquare,
      activeRemain,
      squares: squares.map((square, index) => ({ move: index + 1, square })),
      dp: dp.map((value, index) => ({
        index,
        value: known[index] ? value : null,
        known: known[index],
        active: index === activeI,
        remain: index === activeRemain,
      })),
      options: options.map((option) => ({ ...option })),
    };
  }

  function dpText() {
    return `[${dp.map((value, index) => (known[index] ? (value ? "T" : "F") : index === activeI ? "?" : "·")).join(", ")}]`;
  }

  function push({ title, codeLines, vars = [], note, final = false }) {
    steps.push({
      title,
      arr: dp.map((value, index) => (known[index] ? (value ? 1 : 0) : 0)),
      sub: dp.map((_, index) => String(index)),
      highlight: Number.isInteger(activeI) ? [activeI] : [],
      mark: Number.isInteger(activeRemain) ? [activeRemain] : [],
      stoneGameIVView: makeView(),
      codeLines,
      vars: [{ name: "dp", value: dpText() }, ...vars],
      note,
      final,
    });
  }

  push({
    title: { vi: "Ý tưởng: win/lose DP", en: "Idea: win/lose DP" },
    codeLines: [2],
    vars: [{ name: "n", value: n }, { name: "perfect squares", value: `[${squares.join(", ")}]` }],
    note: {
      vi: "dp[i] = True nếu người đang chơi có thể lấy một số chính phương và để lại trạng thái thua cho đối thủ.",
      en: "dp[i] is True if the current player can take a perfect square and leave a losing state for the opponent.",
    },
  });

  phase = "init";
  known[0] = true;
  push({
    title: { vi: "Khởi tạo dp[0] = False", en: "Initialize dp[0] = False" },
    codeLines: [3],
    vars: [{ name: "dp[0]", value: false }],
    note: {
      vi: "Không còn đá thì người tới lượt không lấy được gì, nên đó là trạng thái thua.",
      en: "With no stones left, the current player cannot move, so this is a losing state.",
    },
  });

  for (let i = 1; i <= n; i += 1) {
    phase = "state";
    activeI = i;
    activeMove = null;
    activeSquare = null;
    activeRemain = null;
    options = [];
    push({
      title: { vi: `Tính dp[${i}]`, en: `Compute dp[${i}]` },
      codeLines: [4],
      vars: [{ name: "i", value: i }],
      note: {
        vi: `Xét trạng thái còn ${i} viên đá. Mặc định dp[${i}] = False cho tới khi tìm được nước thắng.`,
        en: `Consider ${i} stones remaining. dp[${i}] stays False until a winning move is found.`,
      },
    });

    let foundWinningMove = false;
    for (let move = 1; move * move <= i; move += 1) {
      const square = move * move;
      const remain = i - square;
      activeMove = move;
      activeSquare = square;
      activeRemain = remain;

      phase = "try";
      push({
        title: { vi: `Thử lấy ${move}² = ${square}`, en: `Try taking ${move}² = ${square}` },
        codeLines: [6, 7],
        vars: [{ name: "move", value: move }, { name: "square", value: square }, { name: "i - square", value: remain }],
        note: {
          vi: `Nếu lấy ${square} viên từ ${i}, đối thủ sẽ nhận trạng thái còn ${remain} viên.`,
          en: `If we take ${square} from ${i}, the opponent receives the state with ${remain} stones.`,
        },
      });

      const opponentLoses = !dp[remain];
      options.push({ move, square, remain, remainValue: dp[remain], winning: opponentLoses });
      phase = "check";
      push({
        title: {
          vi: `not dp[${remain}]? ${opponentLoses ? "True" : "False"}`,
          en: `not dp[${remain}]? ${opponentLoses ? "True" : "False"}`,
        },
        codeLines: [8],
        vars: [{ name: `dp[${remain}]`, value: dp[remain] }, { name: "winning move?", value: opponentLoses }],
        note: opponentLoses
          ? {
              vi: `dp[${remain}] là False, nghĩa là đối thủ thua ở phần còn lại. Vậy lấy ${square} là nước thắng.`,
              en: `dp[${remain}] is False, so the opponent loses on the remaining state. Taking ${square} is a winning move.`,
            }
          : {
              vi: `dp[${remain}] là True, đối thủ có thể thắng từ phần còn lại. Nước này không đủ tốt.`,
              en: `dp[${remain}] is True, so the opponent can win from the remaining state. This move is not good enough.`,
            },
      });

      if (opponentLoses) {
        dp[i] = true;
        known[i] = true;
        foundWinningMove = true;
        phase = "win";
        push({
          title: { vi: `dp[${i}] = True`, en: `dp[${i}] = True` },
          codeLines: [9, 10],
          vars: [{ name: `dp[${i}]`, value: true }, { name: "best square", value: square }],
          note: {
            vi: `Chỉ cần một nước đi tới losing state là đủ. Dừng thử các square khác cho i=${i}.`,
            en: `One move to a losing state is enough. Stop trying other squares for i=${i}.`,
          },
        });
        break;
      }

      phase = "next";
      push({
        title: { vi: "move += 1", en: "move += 1" },
        codeLines: [11],
        vars: [{ name: "next move", value: move + 1 }],
        note: {
          vi: "Nước vừa thử không thắng, nên thử số chính phương kế tiếp.",
          en: "The tried move is not winning, so try the next perfect square.",
        },
      });
    }

    known[i] = true;
    if (!foundWinningMove) {
      activeMove = null;
      activeSquare = null;
      activeRemain = null;
      phase = "lose";
      push({
        title: { vi: `dp[${i}] vẫn False`, en: `dp[${i}] remains False` },
        codeLines: [6],
        vars: [{ name: `dp[${i}]`, value: false }],
        note: {
          vi: `Không có số chính phương nào đưa đối thủ vào trạng thái thua, nên ${i} là losing state.`,
          en: `No perfect square leaves the opponent in a losing state, so ${i} is a losing state.`,
        },
      });
    }
  }

  activeI = n;
  activeMove = null;
  activeSquare = null;
  activeRemain = null;
  phase = "result";
  push({
    title: { vi: `return dp[${n}]`, en: `return dp[${n}]` },
    codeLines: [12],
    vars: [{ name: "answer", value: dp[n] }],
    note: {
      vi: dp[n]
        ? `dp[${n}] = True, Alice có nước đi thắng khi cả hai chơi tối ưu.`
        : `dp[${n}] = False, Alice không có nước thắng nếu Bob chơi tối ưu.`,
      en: dp[n]
        ? `dp[${n}] = True, so Alice has a winning move under optimal play.`
        : `dp[${n}] = False, so Alice has no winning move if Bob plays optimally.`,
    },
    final: true,
  });

  return { original: n, answer: dp[n], steps };
}

/**
 * LeetCode 1406: Stone Game III.
 * Suffix game DP with a line-by-line view of every 1-3 stone choice.
 */
function buildSteps1406(stones) {
  const n = stones.length;
  const dp = new Array(n + 1).fill(0);
  const steps = [];
  const labels = Array.from({ length: n + 1 }, (_, i) => String(i));
  const dpKnown = new Array(n + 1).fill(false);
  let dpInitialized = false;
  let phase = "setup";
  let activeI = null;
  let activeK = null;
  let selectedCount = 0;
  let take = null;
  let currentNext = null;
  let currentCandidate = null;
  let currentValid = null;
  let bestCount = null;
  let optionRows = [];
  let winner = null;

  function visibleDp() {
    return dp.map((v) => (Number.isFinite(v) ? v : 0));
  }

  function formatDp() {
    return `[${dp.map((v) => (Number.isFinite(v) ? v : "-inf")).join(", ")}]`;
  }

  function range(start, count) {
    return Array.from({ length: count }, (_, offset) => start + offset);
  }

  function step(opts) {
    const vars = [...(opts.vars || [])];
    if (!vars.some((item) => item.name === "dp")) {
      vars.push({ name: "dp", value: formatDp() });
    }
    if (!vars.some((item) => item.name === "stones")) {
      vars.push({ name: "stones", value: `[${stones.join(", ")}]` });
    }
    steps.push({
      title: opts.title,
      arr: visibleDp(),
      sub: labels,
      stoneGameView: {
        phase,
        stones: stones.map((value, index) => ({ index, value })),
        dp: dp.map((value, index) => ({
          index,
          value: dpInitialized && (dpKnown[index] || (index === activeI && value === -Infinity))
            ? (Number.isFinite(value) ? value : "-inf")
            : null,
          known: dpKnown[index],
          base: index === n,
        })),
        i: activeI,
        k: activeK,
        selectedCount,
        take,
        next: currentNext,
        candidate: currentCandidate,
        valid: currentValid,
        best: activeI === null || !dpInitialized
          ? null
          : (Number.isFinite(dp[activeI]) ? dp[activeI] : "-inf"),
        bestCount,
        options: optionRows.map((option) => ({ ...option, indices: [...option.indices] })),
        winner,
      },
      highlight: opts.highlight || [],
      mark: opts.mark || [],
      codeLines: [opts.codeLine],
      vars,
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  step({
    title: { vi: "Đọc n", en: "Read n" },
    codeLine: 3,
    vars: [
      { name: "n", value: n },
      { name: "stones", value: `[${stones.join(", ")}]` },
    ],
    note: {
      vi: `Có ${n} viên đá trong mảng.`,
      en: `There are ${n} stones.`,
    },
  });

  dpInitialized = true;
  dpKnown[n] = true;
  phase = "initialize";
  step({
    title: { vi: "Khởi tạo dp", en: "Initialize dp" },
    codeLine: 4,
    vars: [
      { name: "dp", value: formatDp() },
    ],
    note: {
      vi: `dp[i] là lợi thế điểm tốt nhất trên suffix stones[i...]. dp[${n}] = 0 vì không còn viên đá nào.`,
      en: `dp[i] = best score difference from stones[i...]. dp[${n}] = 0 because no stones remain.`,
    },
  });

  for (let i = n - 1; i >= 0; i--) {
    activeI = i;
    activeK = null;
    selectedCount = 0;
    take = null;
    currentNext = null;
    currentCandidate = null;
    currentValid = null;
    bestCount = null;
    optionRows = [];
    phase = "index";
    step({
      title: { vi: `Bắt đầu i = ${i}`, en: `Start i = ${i}` },
      codeLine: 5,
      highlight: [i],
      vars: [
        { name: "i", value: i },
        { name: `stones[${i}]`, value: stones[i] },
      ],
      note: {
        vi: `Tính dp[${i}] từ phải sang trái để mọi dp[next] cần dùng đều đã biết.`,
        en: `Compute dp[${i}] from right to left so dp[next] values are already known.`,
      },
    });

    take = 0;
    phase = "take-reset";
    step({
      title: { vi: "Đặt lại take", en: "Reset take" },
      codeLine: 6,
      highlight: [i],
      vars: [
        { name: "i", value: i },
        { name: "take", value: take },
      ],
      note: {
        vi: "take cộng dồn điểm của các viên được lấy trong lượt hiện tại.",
        en: "take accumulates the stones chosen on this turn.",
      },
    });

    dp[i] = -Infinity;
    phase = "best-reset";
    step({
      title: { vi: `Gán dp[${i}] = -inf`, en: `Set dp[${i}] = -inf` },
      codeLine: 7,
      highlight: [i],
      vars: [
        { name: `dp[${i}]`, value: "-inf" },
        { name: "dp", value: formatDp() },
      ],
      note: {
        vi: "Bắt đầu bằng giá trị nhỏ nhất, sau đó lấy max giữa các lựa chọn lấy 1, 2 hoặc 3 viên.",
        en: "Start with the worst value, then maximize over taking 1, 2, or 3 stones.",
      },
    });

    for (let k = 0; k < 3; k++) {
      activeK = k;
      selectedCount = 0;
      currentNext = null;
      currentCandidate = null;
      currentValid = null;
      phase = "choice";
      const valid = i + k < n;
      step({
        title: { vi: `Vòng lặp k = ${k}`, en: `Loop k = ${k}` },
        codeLine: 8,
        highlight: [i],
        vars: [
          { name: "i", value: i },
          { name: "k", value: k },
        ],
        note: {
          vi: "Thử một trong ba kích thước nước đi: lấy 1, 2 hoặc 3 viên.",
          en: "Try one of the three possible move sizes: take 1, 2, or 3 stones.",
        },
      });

      currentValid = valid;
      selectedCount = valid ? k + 1 : 0;
      phase = "bounds-check";
      step({
        title: { vi: `Kiểm tra k = ${k}`, en: `Check k = ${k}` },
        codeLine: 9,
        highlight: valid ? range(i, k + 1) : [i],
        vars: [
          { name: "i", value: i },
          { name: "k", value: k },
          { name: "i + k < n", value: `${i + k} < ${n} => ${valid}` },
        ],
        note: {
          vi: valid
            ? `Có thể lấy ${k + 1} viên vì i + k vẫn nằm trong mảng.`
            : `Index ${i + k} nằm ngoài mảng nên bỏ qua k này.`,
          en: valid
            ? `Taking ${k + 1} stone(s) is allowed.`
            : `Index ${i + k} is outside the array, so skip this k.`,
        },
      });

      if (!valid) continue;

      take += stones[i + k];
      currentNext = i + k + 1;
      phase = "accumulate";
      step({
        title: { vi: `Cộng stones[${i + k}]`, en: `Add stones[${i + k}]` },
        codeLine: 10,
        highlight: range(i, k + 1),
        vars: [
          { name: `stones[${i + k}]`, value: stones[i + k] },
          { name: "take", value: take },
        ],
        note: {
          vi: `Sau khi lấy ${k + 1} viên, tổng điểm đang lấy là take = ${take}.`,
          en: `After taking ${k + 1} stone(s), take = ${take}.`,
        },
      });

      const next = i + k + 1;
      const candidate = take - dp[next];
      const before = dp[i];
      dp[i] = Math.max(dp[i], candidate);
      currentCandidate = candidate;
      if (candidate > before) bestCount = k + 1;
      optionRows.push({
        count: k + 1,
        indices: range(i, k + 1),
        take,
        next,
        opponent: dp[next],
        candidate,
      });
      dpKnown[i] = true;
      phase = "compare";
      step({
        title: { vi: `Cập nhật dp[${i}]`, en: `Update dp[${i}]` },
        codeLine: 11,
        highlight: range(i, k + 1),
        mark: [i],
        vars: [
          { name: "next", value: next },
          { name: "take", value: take },
          { name: `dp[${next}]`, value: dp[next] },
          { name: "candidate", value: `${take} - ${dp[next]} = ${candidate}` },
          { name: "old dp[i]", value: Number.isFinite(before) ? before : "-inf" },
          { name: `dp[${i}]`, value: dp[i] },
        ],
        note: {
          vi: `Candidate = điểm vừa lấy trừ lợi thế tốt nhất của đối thủ từ index ${next}. Giữ candidate lớn nhất.`,
          en: `Candidate = current score taken minus the opponent's best difference from index ${next}. Keep the maximum.`,
        },
      });
    }

    activeK = null;
    selectedCount = bestCount || 0;
    currentNext = bestCount === null ? null : i + bestCount;
    currentCandidate = dp[i];
    currentValid = true;
    phase = "commit";
    step({
      title: { vi: `Chốt dp[${i}] = ${dp[i]}`, en: `Commit dp[${i}] = ${dp[i]}` },
      codeLine: 5,
      highlight: [i],
      mark: [i],
      vars: [
        { name: "i", value: i },
        { name: "best move", value: `take ${bestCount}` },
        { name: `dp[${i}]`, value: dp[i] },
      ],
      note: {
        vi: `Trong các lựa chọn hợp lệ, lấy ${bestCount} viên cho lợi thế lớn nhất ${dp[i]}. dp[${i}] giờ sẵn sàng cho suffix bên trái.`,
        en: `Among the valid choices, taking ${bestCount} stone(s) gives the largest advantage ${dp[i]}. dp[${i}] is now ready for the suffix to its left.`,
      },
    });
  }

  const diff = dp[0];
  const answer = diff > 0 ? "Alice" : diff < 0 ? "Bob" : "Tie";
  activeI = 0;
  activeK = null;
  selectedCount = bestCount || 0;
  currentNext = bestCount;
  currentCandidate = diff;
  currentValid = true;
  winner = answer;
  phase = "result";
  step({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    codeLine: diff > 0 ? 12 : diff < 0 ? 13 : 14,
    mark: [0],
    final: true,
    vars: [
      { name: "dp[0]", value: diff },
      { name: "winner", value: answer },
    ],
    note: {
      vi: `dp[0] = ${diff}. Dương nghĩa là Alice thắng, âm nghĩa là Bob thắng, bằng 0 nghĩa là hòa.`,
      en: `dp[0] = ${diff}. Positive means Alice wins, negative means Bob wins, zero means Tie.`,
    },
  });

  return { stones: [...stones], answer, steps };
}

/**
 * LeetCode 877: Stone Game.
 * Interval DP on score difference:
 *   dp[i][j] = best difference current player can force from piles[i..j].
 * Transition:
 *   dp[i][j] = max(piles[i] - dp[i+1][j], piles[j] - dp[i][j-1])
 */
function buildSteps877(piles) {
  const n = piles.length;
  const steps = [];
  const dp = Array.from({ length: n }, () => Array(n).fill(0));

  function makeGrid(hlCell = null) {
    const gridDp = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(""));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        gridDp[r + 1][c + 1] = dp[r][c];
      }
    }
    return {
      dp: gridDp,
      text1: Array.from({ length: n }, (_, i) => String(i)).join(""),
      text2: Array.from({ length: n }, (_, i) => String(i)).join(""),
      hlCell,
      pathCells: [],
    };
  }

  steps.push({
    title: { vi: "Khởi tạo bảng dp", en: "Initialize dp table" },
    arr: [...piles],
    sub: piles.map((_, i) => String(i)),
    grid: makeGrid(),
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "n", value: n },
      { name: "dp", value: "n x n table" },
    ],
    note: {
      vi: `Ta dùng dp[i][j] = chênh lệch điểm tốt nhất người chơi hiện tại có thể ép được từ đoạn piles[i..j].`,
      en: `We use dp[i][j] = the best score difference the current player can force from piles[i..j].`,
    },
  });

  for (let i = 0; i < n; i++) {
    dp[i][i] = piles[i];
    steps.push({
      title: { vi: `Đáy: dp[${i}][${i}]`, en: `Base case: dp[${i}][${i}]` },
      arr: [...piles],
      sub: piles.map((_, idx) => String(idx)),
      grid: makeGrid([i + 1, i + 1]),
      highlight: [i],
      mark: [i],
      codeLines: [3, 4, 5, 6],
      vars: [
        { name: "i", value: i },
        { name: "dp[i][i]", value: dp[i][i] },
      ],
      note: {
        vi: `Đoạn chỉ có 1 đống nên dp[${i}][${i}] = piles[${i}] = ${piles[i]}.`,
        en: `A single pile means dp[${i}][${i}] = piles[${i}] = ${piles[i]}.`,
      },
    });
  }

  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      const takeLeft = piles[i] - dp[i + 1][j];
      const takeRight = piles[j] - dp[i][j - 1];
      dp[i][j] = Math.max(takeLeft, takeRight);

      steps.push({
        title: { vi: `Tính dp[${i}][${j}]`, en: `Compute dp[${i}][${j}]` },
        arr: [...piles],
        sub: piles.map((_, idx) => String(idx)),
        grid: makeGrid([i + 1, j + 1]),
        highlight: [i, j],
        mark: [i, j],
        codeLines: [7, 8, 9],
        vars: [
          { name: "len", value: len },
          { name: "i", value: i },
          { name: "j", value: j },
          { name: "takeLeft", value: takeLeft },
          { name: "takeRight", value: takeRight },
          { name: "dp[i][j]", value: dp[i][j] },
        ],
        note: {
          vi: `dp[${i}][${j}] = max(piles[${i}] - dp[${i + 1}][${j}] = ${takeLeft}, piles[${j}] - dp[${i}][${j - 1}] = ${takeRight}) = ${dp[i][j]}.`,
          en: `dp[${i}][${j}] = max(piles[${i}] - dp[${i + 1}][${j}] = ${takeLeft}, piles[${j}] - dp[${i}][${j - 1}] = ${takeRight}) = ${dp[i][j]}.`,
        },
      });
    }
  }

  const answer = dp[0][n - 1] > 0;
  steps.push({
    title: { vi: answer ? "Alice thắng" : "Alice thua", en: answer ? "Alice wins" : "Alice loses" },
    arr: [...piles],
    sub: piles.map((_, i) => String(i)),
    grid: makeGrid([1, n]),
    highlight: [],
    mark: [0, n - 1],
    final: true,
    codeLines: [10, 11],
    vars: [
      { name: "dp[0][n-1]", value: dp[0][n - 1] },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `dp[0][${n - 1}] = ${dp[0][n - 1]}. Nếu chênh lệch dương thì Alice thắng; ở bài này kết quả luôn dương với input chuẩn. Alice thắng.`,
      en: `dp[0][${n - 1}] = ${dp[0][n - 1]}. A positive difference means Alice wins; for the standard problem this is always positive. Alice wins.`,
    },
  });

  return { piles: [...piles], answer, steps };
}

/**
 * LeetCode 1140: Stone Game II.
 * dp[i][m] = max stones the current player can obtain from piles[i...]
 * when the current M value is m.
 *
 * Transition:
 *   if 2m >= remaining, take all suffix stones.
 *   otherwise choose x in [1, 2m] and maximize suffixSum[i] - dp[i+x][max(m, x)].
 */
function buildSteps1140(piles) {
  const n = piles.length;
  const steps = [];
  const suffix = new Array(n + 1).fill(0);
  const suffixKnown = new Array(n + 1).fill(false);
  const dp = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
  const dpKnown = Array.from({ length: n + 1 }, () => Array(n + 1).fill(false));
  const choice = Array.from({ length: n + 1 }, () => Array(n + 1).fill(null));
  let phase = "setup";
  let event = "enter";
  let activeI = null;
  let activeM = null;
  let activeX = null;
  let remaining = null;
  let maxTake = null;
  let nextI = null;
  let nextM = null;
  let immediate = null;
  let opponent = null;
  let candidate = null;
  let best = null;
  let bestX = null;
  let takeAll = false;
  let options = [];

  function suffixLabel() {
    return `[${suffix.map((value, index) => suffixKnown[index] ? value : "_").join(", ")}]`;
  }

  function dpLabel(i, m) {
    return Number.isInteger(i) && Number.isInteger(m) && dpKnown[i][m] ? dp[i][m] : "?";
  }

  function makeView(overrides = {}) {
    return {
      phase,
      event,
      piles: piles.map((value, index) => ({ index, value })),
      suffix: suffix.map((value, index) => ({ index, value, known: suffixKnown[index] })),
      dp: dp.map((row, i) => row.slice(1).map((value, offset) => ({
        i,
        m: offset + 1,
        value: dpKnown[i][offset + 1] ? value : null,
        known: dpKnown[i][offset + 1],
      }))),
      n,
      i: activeI,
      m: activeM,
      x: activeX,
      remaining,
      maxTake,
      nextI,
      nextM,
      immediate,
      opponent,
      candidate,
      best,
      bestX,
      takeAll,
      options: options.map((option) => ({ ...option, indices: [...option.indices] })),
      total: suffixKnown[0] ? suffix[0] : piles.reduce((sum, value) => sum + value, 0),
      ...overrides,
    };
  }

  function pushStep({ title, line, note, vars = [], final = false, view = {} }) {
    const baseVars = [
      { name: "suffix", value: suffixLabel() },
      { name: "i", value: activeI === null ? "not set" : activeI },
      { name: "M", value: activeM === null ? "not set" : activeM },
      { name: "X", value: activeX === null ? "not set" : activeX },
    ];
    steps.push({
      title,
      arr: [...piles],
      sub: piles.map((_, index) => String(index)),
      highlight: Number.isInteger(activeI) && activeI < n ? [activeI] : [],
      mark: Number.isInteger(activeI) && Number.isInteger(activeX)
        ? Array.from({ length: Math.min(activeX, n - activeI) }, (_, offset) => activeI + offset)
        : [],
      stoneGameIIView: makeView(view),
      codeLines: [line],
      vars: [...baseVars, ...vars],
      note,
      final,
    });
  }

  pushStep({
    title: { vi: "Bắt đầu stoneGameII", en: "Enter stoneGameII" },
    line: 2,
    vars: [{ name: "piles", value: `[${piles.join(", ")}]` }],
    note: {
      vi: "Alice bắt đầu với i=0 và M=1. Mỗi lượt được lấy X đống liên tiếp, 1 <= X <= 2M.",
      en: "Alice starts at i=0 with M=1. Each turn takes X consecutive piles where 1 <= X <= 2M.",
    },
  });

  event = "read-n";
  pushStep({
    title: { vi: `n = ${n}`, en: `n = ${n}` },
    line: 3,
    vars: [{ name: "n", value: n }],
    note: {
      vi: `Có ${n} đống đá. Trạng thái dp[i][M] bắt đầu tại đống i với giới hạn hiện tại M.`,
      en: `There are ${n} piles. State dp[i][M] starts at pile i with the current limit M.`,
    },
  });

  suffixKnown[n] = true;
  phase = "suffix";
  event = "init-suffix";
  pushStep({
    title: { vi: "Khởi tạo suffix", en: "Initialize suffix" },
    line: 4,
    vars: [{ name: `suffix[${n}]`, value: 0 }],
    note: {
      vi: `suffix[${n}] = 0 vì sau đống cuối không còn viên đá nào.`,
      en: `suffix[${n}] = 0 because no stones remain after the last pile.`,
    },
  });

  for (let i = n - 1; i >= 0; i--) {
    activeI = i;
    event = "suffix-loop";
    pushStep({
      title: { vi: `Dựng suffix tại i=${i}`, en: `Build suffix at i=${i}` },
      line: 5,
      vars: [{ name: "i", value: i }],
      note: {
        vi: `Cộng piles[${i}] vào tổng đã biết ở suffix[${i + 1}].`,
        en: `Add piles[${i}] to the known total at suffix[${i + 1}].`,
      },
    });

    suffix[i] = suffix[i + 1] + piles[i];
    suffixKnown[i] = true;
    event = "suffix-save";
    pushStep({
      title: { vi: `suffix[${i}] = ${suffix[i]}`, en: `suffix[${i}] = ${suffix[i]}` },
      line: 6,
      vars: [
        { name: `piles[${i}]`, value: piles[i] },
        { name: `suffix[${i + 1}]`, value: suffix[i + 1] },
        { name: `suffix[${i}]`, value: `${piles[i]} + ${suffix[i + 1]} = ${suffix[i]}` },
      ],
      note: {
        vi: `Từ đống ${i} đến cuối có tổng ${suffix[i]} viên đá.`,
        en: `Piles ${i} through the end contain ${suffix[i]} stones in total.`,
      },
    });
  }

  phase = "dp-init";
  event = "init-dp";
  activeI = null;
  for (let m = 1; m <= n; m++) dpKnown[n][m] = true;
  pushStep({
    title: { vi: "Khởi tạo bảng dp", en: "Initialize the dp table" },
    line: 7,
    vars: [{ name: "dp shape", value: `${n + 1} x ${n + 1}` }],
    note: {
      vi: `dp[i][M] là số đá tối đa người đang tới lượt lấy được từ suffix i. Hàng dp[${n}][M] = 0 vì không còn đống nào.`,
      en: `dp[i][M] is the maximum stones the current player can secure from suffix i. Row dp[${n}][M] = 0 because no piles remain.`,
    },
  });

  phase = "dp";
  for (let i = n - 1; i >= 0; i--) {
    activeI = i;
    activeM = null;
    activeX = null;
    event = "outer-loop";
    pushStep({
      title: { vi: `Bắt đầu hàng i=${i}`, en: `Start row i=${i}` },
      line: 8,
      vars: [{ name: "remaining piles", value: n - i }, { name: `suffix[${i}]`, value: suffix[i] }],
      note: {
        vi: `Đi từ phải sang trái để mọi trạng thái đối thủ dp[i+X][...] đã được tính trước.`,
        en: `Move right to left so every opponent state dp[i+X][...] is already available.`,
      },
    });

    for (let m = 1; m <= n; m++) {
      activeM = m;
      activeX = null;
      remaining = n - i;
      maxTake = Math.min(2 * m, remaining);
      nextI = null;
      nextM = null;
      immediate = null;
      opponent = null;
      candidate = null;
      best = null;
      bestX = null;
      takeAll = false;
      options = [];
      event = "inner-loop";
      pushStep({
        title: { vi: `Xét trạng thái dp[${i}][${m}]`, en: `Visit state dp[${i}][${m}]` },
        line: 9,
        vars: [
          { name: "i", value: i },
          { name: "M", value: m },
          { name: "allowed X", value: `1..${maxTake}` },
        ],
        note: {
          vi: `Còn ${remaining} đống; với M=${m}, lượt này được lấy tối đa min(2M, remaining) = ${maxTake} đống.`,
          en: `${remaining} piles remain; with M=${m}, this turn may take at most min(2M, remaining) = ${maxTake} piles.`,
        },
      });

      takeAll = 2 * m >= remaining;
      event = "take-all-check";
      pushStep({
        title: takeAll
          ? { vi: `${2 * m} >= ${remaining}: có thể lấy hết`, en: `${2 * m} >= ${remaining}: can take all` }
          : { vi: `${2 * m} < ${remaining}: phải thử từng X`, en: `${2 * m} < ${remaining}: try each X` },
        line: 10,
        vars: [
          { name: "2 * M", value: 2 * m },
          { name: "n - i", value: remaining },
          { name: "condition", value: takeAll },
        ],
        note: takeAll
          ? { vi: "Tất cả đống còn lại nằm trong giới hạn 2M, nên lấy hết là tối ưu.", en: "Every remaining pile fits within 2M, so taking all is optimal." }
          : { vi: "Chưa thể kết thúc game trong lượt này; cần để đối thủ chơi trên suffix còn lại.", en: "The game cannot end this turn; the opponent must play on the remaining suffix." },
      });

      if (takeAll) {
        activeX = remaining;
        immediate = suffix[i];
        nextI = n;
        nextM = Math.max(m, remaining);
        opponent = 0;
        candidate = suffix[i];
        best = suffix[i];
        bestX = remaining;
        options = [{
          x: remaining,
          indices: Array.from({ length: remaining }, (_, offset) => i + offset),
          immediate,
          nextI,
          nextM,
          opponent,
          candidate,
          best: true,
        }];
        dp[i][m] = suffix[i];
        dpKnown[i][m] = true;
        choice[i][m] = remaining;
        event = "take-all";
        pushStep({
          title: { vi: `dp[${i}][${m}] = ${suffix[i]}`, en: `dp[${i}][${m}] = ${suffix[i]}` },
          line: 11,
          vars: [
            { name: `suffix[${i}]`, value: suffix[i] },
            { name: `dp[${i}][${m}]`, value: dp[i][m] },
          ],
          note: {
            vi: `Lấy cả ${remaining} đống còn lại, nhận toàn bộ ${suffix[i]} viên; đối thủ nhận 0.`,
            en: `Take all ${remaining} remaining piles, secure all ${suffix[i]} stones, and leave 0 for the opponent.`,
          },
        });
        continue;
      }

      event = "else-branch";
      pushStep({
        title: { vi: "Đi vào nhánh thử lựa chọn", en: "Enter the choice branch" },
        line: 12,
        note: {
          vi: `Phải so sánh mọi X từ 1 đến ${2 * m}.`,
          en: `Every X from 1 through ${2 * m} must be compared.`,
        },
      });

      best = 0;
      event = "reset-best";
      pushStep({
        title: { vi: "best = 0", en: "best = 0" },
        line: 13,
        vars: [{ name: "best", value: best }],
        note: {
          vi: "best giữ số đá lớn nhất người hiện tại có thể đảm bảo sau các lựa chọn đã thử.",
          en: "best stores the largest total the current player can guarantee among tried choices.",
        },
      });

      for (let x = 1; x <= 2 * m; x++) {
        activeX = x;
        nextI = i + x;
        nextM = Math.max(m, x);
        immediate = suffix[i] - suffix[nextI];
        opponent = dp[nextI][nextM];
        candidate = null;
        event = "option-loop";
        pushStep({
          title: { vi: `Thử X=${x}`, en: `Try X=${x}` },
          line: 14,
          vars: [
            { name: "X", value: x },
            { name: "taken now", value: immediate },
            { name: "next state", value: `dp[${nextI}][${nextM}]` },
          ],
          note: {
            vi: `Lấy các đống [${i}..${nextI - 1}] được ${immediate} viên. Đối thủ bắt đầu tại i=${nextI}, M=max(${m}, ${x})=${nextM}.`,
            en: `Take piles [${i}..${nextI - 1}] for ${immediate} stones. The opponent starts at i=${nextI}, M=max(${m}, ${x})=${nextM}.`,
          },
        });

        candidate = suffix[i] - opponent;
        const becomesBest = candidate > best;
        if (becomesBest) {
          best = candidate;
          bestX = x;
        }
        options.push({
          x,
          indices: Array.from({ length: x }, (_, offset) => i + offset),
          immediate,
          nextI,
          nextM,
          opponent,
          candidate,
          best: becomesBest,
        });
        event = "evaluate-option";
        pushStep({
          title: becomesBest
            ? { vi: `X=${x} tạo best mới ${best}`, en: `X=${x} sets new best ${best}` }
            : { vi: `X=${x} cho ${candidate}, giữ best=${best}`, en: `X=${x} gives ${candidate}; keep best=${best}` },
          line: 15,
          vars: [
            { name: `dp[${nextI}][${nextM}]`, value: opponent },
            { name: "candidate", value: `${suffix[i]} - ${opponent} = ${candidate}` },
            { name: "best", value: best },
          ],
          note: {
            vi: `Trong tổng ${suffix[i]} viên còn lại, đối thủ tối ưu lấy ${opponent}; người hiện tại đảm bảo ${candidate}. ${becomesBest ? `Đây là lựa chọn tốt nhất mới.` : `Nó không vượt best hiện tại ${best}.`}`,
            en: `Of the ${suffix[i]} remaining stones, the optimal opponent secures ${opponent}; the current player guarantees ${candidate}. ${becomesBest ? "This is the new best choice." : `It does not beat the current best ${best}.`}`,
          },
        });
      }

      dp[i][m] = best;
      dpKnown[i][m] = true;
      choice[i][m] = bestX;
      activeX = bestX;
      const chosen = options.find((option) => option.x === bestX);
      if (chosen) {
        nextI = chosen.nextI;
        nextM = chosen.nextM;
        immediate = chosen.immediate;
        opponent = chosen.opponent;
        candidate = chosen.candidate;
      }
      event = "commit";
      pushStep({
        title: { vi: `Chốt dp[${i}][${m}] = ${best}`, en: `Commit dp[${i}][${m}] = ${best}` },
        line: 16,
        vars: [
          { name: "best X", value: bestX },
          { name: `dp[${i}][${m}]`, value: best },
        ],
        note: {
          vi: `Trong trạng thái (i=${i}, M=${m}), lấy X=${bestX} giúp người hiện tại đảm bảo nhiều nhất ${best} viên.`,
          en: `At state (i=${i}, M=${m}), taking X=${bestX} lets the current player guarantee the maximum ${best} stones.`,
        },
      });
    }
  }

  const answer = dp[0][1];
  const bob = suffix[0] - answer;
  const firstX = choice[0][1];
  phase = "result";
  event = "return";
  activeI = 0;
  activeM = 1;
  activeX = firstX;
  remaining = n;
  maxTake = Math.min(2, n);
  nextI = firstX;
  nextM = Math.max(1, firstX);
  immediate = suffix[0] - suffix[firstX];
  opponent = dp[nextI][nextM];
  candidate = answer;
  best = answer;
  bestX = firstX;
  takeAll = false;
  options = [{
    x: firstX,
    indices: Array.from({ length: firstX }, (_, offset) => offset),
    immediate,
    nextI,
    nextM,
    opponent,
    candidate: answer,
    best: true,
  }];
  pushStep({
    title: { vi: `Trả về ${answer}`, en: `Return ${answer}` },
    line: 17,
    vars: [
      { name: "dp[0][1]", value: answer },
      { name: "Alice", value: answer },
      { name: "Bob", value: bob },
    ],
    note: {
      vi: `Từ trạng thái đầu (i=0, M=1), Alice có thể đảm bảo tối đa ${answer}/${suffix[0]} viên; Bob nhận ${bob} viên còn lại.`,
      en: `From the initial state (i=0, M=1), Alice can guarantee at most ${answer}/${suffix[0]} stones; Bob receives the remaining ${bob}.`,
    },
    final: true,
    view: { answer, alice: answer, bob },
  });

  return { piles: [...piles], answer, steps };
}

/**
 * LeetCode 322: Coin Change.
 * dp[i] = min coins to make amount i.
 * dp[0] = 0, dp[i] = min(dp[i - coin] + 1) for each coin.
 */
function buildSteps322(nums, params) {
  const coins = [...nums].sort((a, b) => a - b);
  const amount = params.amount || 11;
  const steps = [];
  const INF = amount + 1;
  const dp = new Array(amount + 1).fill(INF);

  // Line 3: dp = [float('inf')] * (amount + 1)
  steps.push({
    title: { vi: "dp = [inf] * (amount + 1)", en: "dp = [inf] * (amount + 1)" },
    arr: dp.map((v) => (v >= INF ? 0 : v)),
    sub: dp.map((v) => (v >= INF ? "∞" : String(v))),
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "coins", value: `[${coins.join(", ")}]` },
      { name: "amount", value: amount },
      { name: "dp", value: `[∞] × ${amount + 1}` },
    ],
    note: {
      en: `Idea: dp[i] = fewest coins to make amount i. We fill dp from 0 up to ${amount}. Start with ∞ everywhere (∞ = "not reachable yet").`,
      vi: `Ý tưởng: dp[i] = số xu ít nhất để tạo số tiền i. Ta điền dp từ 0 đến ${amount}. Ban đầu để ∞ ở mọi ô (∞ = "chưa tạo được").`,
    },
  });

  // Line 4: dp[0] = 0
  dp[0] = 0;
  steps.push({
    title: { vi: "dp[0] = 0", en: "dp[0] = 0" },
    arr: dp.map((v) => (v >= INF ? 0 : v)),
    sub: dp.map((v) => (v >= INF ? "∞" : String(v))),
    highlight: [0],
    mark: [],
    codeLines: [4],
    vars: [
      { name: "dp[0]", value: 0 },
    ],
    note: {
      en: `Base case: making amount 0 needs 0 coins. Every other dp[i] will be built from this starting point.`,
      vi: `Trường hợp cơ sở: tạo số tiền 0 cần 0 xu. Mọi dp[i] khác sẽ được xây dựng từ điểm khởi đầu này.`,
    },
  });

  for (let i = 1; i <= amount; i++) {
    // Line 5: for i in range(1, amount + 1)
    steps.push({
      title: { vi: `Tính dp[${i}] (số tiền = ${i})`, en: `Compute dp[${i}] (amount = ${i})` },
      arr: dp.slice(0, i + 1).map((v) => (v >= INF ? 0 : v)),
      sub: dp.slice(0, i + 1).map((v) => (v >= INF ? "∞" : String(v))),
      highlight: [i],
      mark: [],
      codeLines: [5],
      vars: [
        { name: "i", value: i },
        { name: "dp[i]", value: dp[i] >= INF ? "∞" : dp[i] },
      ],
      note: {
        en: `Now compute dp[${i}] = fewest coins to make amount ${i}. We will try every coin and pick the best.`,
        vi: `Bây giờ tính dp[${i}] = số xu ít nhất để tạo số tiền ${i}. Ta sẽ thử từng loại xu và chọn cách tốt nhất.`,
      },
    });

    for (const coin of coins) {
      // Lines 6-7: for coin in coins → if coin <= i (merged into one clear step)
      const canUse = coin <= i;
      steps.push({
        title: canUse
          ? { vi: `Thử xu ${coin} (≤ ${i} ✓)`, en: `Try coin ${coin} (≤ ${i} ✓)` }
          : { vi: `Thử xu ${coin} (> ${i}, bỏ qua)`, en: `Try coin ${coin} (> ${i}, skip)` },
        arr: dp.slice(0, i + 1).map((v) => (v >= INF ? 0 : v)),
        sub: dp.slice(0, i + 1).map((v) => (v >= INF ? "∞" : String(v))),
        highlight: [i],
        mark: canUse ? [i - coin] : [],
        codeLines: [6, 7],
        vars: [
          { name: "i (đang tính)", value: i },
          { name: "coin (đang thử)", value: coin },
          { name: "coin ≤ i ?", value: `${coin} ≤ ${i} → ${canUse ? "Đúng" : "Sai"}` },
        ],
        note: canUse
          ? {
              en: `Try coin ${coin}. Since ${coin} ≤ ${i}, we can use one ${coin}-coin, then add the best way to make the leftover ${i} − ${coin} = ${i - coin}. Source cell 📍 dp[${i - coin}], target cell 👉 dp[${i}].`,
              vi: `Thử xu ${coin}. Vì ${coin} ≤ ${i}, ta có thể dùng 1 đồng xu ${coin}, rồi cộng thêm cách tốt nhất để tạo phần còn lại ${i} − ${coin} = ${i - coin}. Ô nguồn 📍 dp[${i - coin}], ô đích 👉 dp[${i}].`,
            }
          : {
              en: `Try coin ${coin}. Since ${coin} > ${i}, this coin is bigger than the amount we need — skip it.`,
              vi: `Thử xu ${coin}. Vì ${coin} > ${i}, xu này lớn hơn số tiền cần tạo — bỏ qua.`,
            },
      });

      // Line 8: dp[i] = min(dp[i], dp[i-coin]+1) — only if canUse
      if (canUse) {
        const oldDpi = dp[i];
        const candidate = dp[i - coin] + 1;
        let updated = false;
        if (candidate < dp[i]) {
          dp[i] = candidate;
          updated = true;
        }
        const srcTxt = dp[i - coin] >= INF ? "∞" : String(dp[i - coin]);
        const candTxt = candidate >= INF ? "∞" : String(candidate);
        const oldTxt = oldDpi >= INF ? "∞" : String(oldDpi);
        const newTxt = dp[i] >= INF ? "∞" : String(dp[i]);
        steps.push({
          title: updated
            ? { vi: `Cập nhật dp[${i}] = ${newTxt} ✓`, en: `Update dp[${i}] = ${newTxt} ✓` }
            : { vi: `Giữ nguyên dp[${i}] = ${newTxt}`, en: `Keep dp[${i}] = ${newTxt}` },
          arr: dp.slice(0, i + 1).map((v) => (v >= INF ? 0 : v)),
          sub: dp.slice(0, i + 1).map((v) => (v >= INF ? "∞" : String(v))),
          highlight: [i],
          mark: [i - coin],
          codeLines: [8],
          vars: [
            { name: "công thức", value: `dp[${i - coin}] + 1 xu` },
            { name: `📍 dp[${i - coin}] (nguồn)`, value: srcTxt },
            { name: "candidate = nguồn + 1", value: candTxt },
            { name: `👉 dp[${i}] cũ`, value: oldTxt },
            { name: `👉 dp[${i}] mới`, value: newTxt },
            { name: "tốt hơn?", value: updated ? "CÓ → cập nhật" : "không" },
          ],
          note: updated
            ? {
                en: `Candidate = dp[${i - coin}] + 1 = ${srcTxt} + 1 = ${candTxt}. That beats the old dp[${i}] = ${oldTxt}, so dp[${i}] becomes ${newTxt}.`,
                vi: `Ứng viên = dp[${i - coin}] + 1 = ${srcTxt} + 1 = ${candTxt}. Nhỏ hơn dp[${i}] cũ = ${oldTxt}, nên dp[${i}] = ${newTxt}.`,
              }
            : {
                en: `Candidate = dp[${i - coin}] + 1 = ${srcTxt} + 1 = ${candTxt}. It is not better than the current dp[${i}] = ${oldTxt}, so keep dp[${i}] = ${newTxt}.`,
                vi: `Ứng viên = dp[${i - coin}] + 1 = ${srcTxt} + 1 = ${candTxt}. Không nhỏ hơn dp[${i}] hiện tại = ${oldTxt}, nên giữ nguyên dp[${i}] = ${newTxt}.`,
              },
        });
      }
    }
  }

  // Line 9: return dp[amount] if dp[amount] != float('inf') else -1
  const answer = dp[amount] >= INF ? -1 : dp[amount];

  // Trace back coins used
  const coinsUsed = [];
  if (answer >= 0) {
    let rem = amount;
    while (rem > 0) {
      for (const coin of coins) {
        if (coin <= rem && dp[rem - coin] + 1 === dp[rem]) {
          coinsUsed.push(coin);
          rem -= coin;
          break;
        }
      }
    }
  }

  steps.push({
    title: { vi: "return dp[amount]", en: "return dp[amount]" },
    arr: dp.map((v) => (v >= INF ? 0 : v)),
    sub: dp.map((v) => (v >= INF ? "∞" : String(v))),
    highlight: [],
    mark: [amount],
    final: true,
    codeLines: [9],
    vars: [
      { name: "dp[amount]", value: answer },
      { name: "coins used", value: answer >= 0 ? `[${coinsUsed.join(", ")}]` : "impossible" },
    ],
    note: {
      en: answer >= 0
        ? `Answer = dp[${amount}] = ${answer}. The fewest coins to make ${amount} is ${answer}, e.g. [${coinsUsed.join(", ")}] (sum = ${amount}).`
        : `dp[${amount}] is still ∞, so amount ${amount} cannot be made from coins [${coins.join(", ")}] → return -1.`,
      vi: answer >= 0
        ? `Đáp án = dp[${amount}] = ${answer}. Số xu ít nhất để tạo ${amount} là ${answer}, ví dụ [${coinsUsed.join(", ")}] (tổng = ${amount}).`
        : `dp[${amount}] vẫn là ∞, nên không thể tạo số tiền ${amount} từ các xu [${coins.join(", ")}] → trả về -1.`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 518: Coin Change II.
 * Count number of combinations (not permutations) to make amount.
 * dp[i] = number of ways to make amount i.
 * For each coin: for i = coin..amount: dp[i] += dp[i - coin].
 * Outer loop on coins avoids counting permutations.
 */
function buildSteps518(nums, params) {
  const coins = [...nums].sort((a, b) => a - b);
  const amount = params.amount || 5;
  const steps = [];
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;

  steps.push({
    title: { vi: "Khởi tạo DP", en: "Initialize DP" },
    arr: dp.slice(),
    sub: dp.map((v) => String(v)),
    highlight: [0],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "coins", value: `[${coins.join(",")}]` },
      { name: "amount", value: amount },
      { name: "dp[0]", value: 1 },
    ],
    note: {
      vi: `dp[i] = số cách tạo amount i.\ndp[0] = 1 (1 cách: không dùng xu nào).\nVòng ngoài trên coin (tránh đếm hoán vị):\n  for coin in coins:\n    for i in range(coin, amount+1):\n      dp[i] += dp[i - coin]`,
      en: `dp[i] = number of ways to make amount i.\ndp[0] = 1 (one way: use no coins).\nOuter loop on coins (avoids counting permutations):\n  for coin in coins:\n    for i in range(coin, amount+1):\n      dp[i] += dp[i - coin]`,
    },
  });

  for (const coin of coins) {
    steps.push({
      title: { vi: `Bắt đầu xu ${coin}`, en: `Start coin ${coin}` },
      arr: dp.slice(),
      sub: dp.map((v) => String(v)),
      highlight: [0],
      mark: [],
      codeLines: [5],
      vars: [
        { name: "coin", value: coin },
        { name: "dp (before)", value: `[${dp.join(",")}]` },
      ],
      note: {
        vi: `Xử lý xu ${coin} bằng cách cộng số cách tạo i-${coin} vào dp[i] cho i = ${coin}..${amount}.`,
        en: `Process coin ${coin} by adding ways to make i-${coin} into dp[i] for i = ${coin}..${amount}.`,
      },
    });

    for (let i = coin; i <= amount; i++) {
      const beforeValue = dp[i];
      const addWays = dp[i - coin];
      steps.push({
        title: { vi: `Xét i=${i}`, en: `Consider i=${i}` },
        arr: dp.slice(),
        sub: dp.map((v) => String(v)),
        highlight: [i, i - coin],
        mark: [i - coin],
        codeLines: [6],
        vars: [
          { name: "coin", value: coin },
          { name: "i", value: i },
          { name: `dp[${i - coin}]`, value: addWays },
          { name: `dp[${i}] (before)`, value: beforeValue },
        ],
        note: {
          vi: addWays > 0
            ? `Có ${addWays} cách tạo ${i - coin}, nên dp[${i}] sẽ tăng.`
            : `Không có cách tạo ${i - coin} hiện tại nên dp[${i}] không đổi.`,
          en: addWays > 0
            ? `${addWays} ways to make ${i - coin}, so dp[${i}] will increase.`
            : `No ways to make ${i - coin} yet, so dp[${i}] stays unchanged.`,
        },
      });

      dp[i] += addWays;
      steps.push({
        title: { vi: `dp[${i}] += dp[${i - coin}]`, en: `dp[${i}] += dp[${i - coin}]` },
        arr: dp.slice(),
        sub: dp.map((v) => String(v)),
        highlight: [i, i - coin],
        mark: [i],
        codeLines: [7],
        vars: [
          { name: `dp[${i}] (before)`, value: beforeValue },
          { name: `dp[${i - coin}]`, value: addWays },
          { name: `dp[${i}] (after)`, value: dp[i] },
        ],
        note: {
          vi: `Cập nhật dp[${i}] từ ${beforeValue} thành ${dp[i]} bằng cách cộng ${addWays}.`, 
          en: `Update dp[${i}] from ${beforeValue} to ${dp[i]} by adding ${addWays}.`, 
        },
      });
    }

    steps.push({
      title: { vi: `Sau xu ${coin}`, en: `After coin ${coin}` },
      arr: dp.slice(),
      sub: dp.map((v) => String(v)),
      highlight: Array.from({ length: amount - coin + 1 }, (_, x) => x + coin),
      mark: [],
      codeLines: [5, 6, 7],
      vars: [
        { name: "coin", value: coin },
        { name: "dp (after)", value: `[${dp.join(",")}]` },
      ],
      note: {
        vi: `Kết thúc xử lý xu ${coin}. dp hiện tại = [${dp.join(",")}].`, 
        en: `Finished processing coin ${coin}. Current dp = [${dp.join(",")}].`, 
      },
    });
  }
  const answer = dp[amount];
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: dp.slice(),
    sub: dp.map((v) => String(v)),
    highlight: [],
    mark: [amount],
    final: true,
    codeLines: [8],
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `Số cách tạo ${amount} từ xu [${coins.join(",")}] = dp[${amount}] = ${answer}.`,
      en: `Number of ways to make ${amount} from coins [${coins.join(",")}] = dp[${amount}] = ${answer}.`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 279: Perfect Squares.
 * dp[i] = min perfect squares summing to i.
 * dp[i] = min(dp[i - j*j] + 1) for all j where j*j <= i.
 * Same pattern as Coin Change with coins = [1,4,9,16,...].
 */
function buildSteps279(input) {
  const n = input[0] || 12;
  const steps = [];
  const dp = new Array(n + 1).fill(Infinity);
  dp[0] = 0;

  const squares = [];
  for (let j = 1; j * j <= n; j++) squares.push(j * j);

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: dp.map((v) => (v === Infinity ? 0 : v)),
    sub: dp.map((v) => (v === Infinity ? "∞" : String(v))),
    highlight: [0],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "n", value: n },
      { name: "squares", value: `[${squares.join(",")}]` },
      { name: "dp[0]", value: 0 },
    ],
    note: {
      vi: `dp[i] = số bình phương hoàn hảo ít nhất có tổng = i.\nCác bình phương ≤ ${n}: [${squares.join(", ")}].\ndp[i] = min(dp[i - j²] + 1) với j² ≤ i.`,
      en: `dp[i] = min perfect squares summing to i.\nSquares ≤ ${n}: [${squares.join(", ")}].\ndp[i] = min(dp[i - j²] + 1) for j² ≤ i.`,
    },
  });

  for (let i = 1; i <= n; i++) {
    let bestSq = -1;
    let bestValue = dp[i];
    steps.push({
      title: { vi: `Bắt đầu dp[${i}]`, en: `Start dp[${i}]` },
      arr: dp.slice(0, i + 1).map((v) => (v === Infinity ? 0 : v)),
      sub: dp.slice(0, i + 1).map((v) => (v === Infinity ? "∞" : String(v))),
      highlight: [i],
      mark: [],
      codeLines: [5, 6],
      vars: [
        { name: "i", value: i },
        { name: "dp[i] (initial)", value: bestValue === Infinity ? "∞" : String(bestValue) },
      ],
      note: {
        vi: `Tìm dp[${i}] bằng cách thử các bình phương ≤ ${i}.`,
        en: `Compute dp[${i}] by testing squares ≤ ${i}.`,
      },
    });

    for (const sq of squares) {
      if (sq > i) break;
      const candidate = dp[i - sq] + 1;
      const improved = candidate < bestValue;
      if (improved) {
        bestValue = candidate;
        bestSq = sq;
      }

      steps.push({
        title: { vi: `Thử ${sq} (${Math.sqrt(sq)}²)`, en: `Try ${sq} (${Math.sqrt(sq)}²)` },
        arr: dp.slice(0, i + 1).map((v) => (v === Infinity ? 0 : v)),
        sub: dp.slice(0, i + 1).map((v) => (v === Infinity ? "∞" : String(v))),
        highlight: [i, i - sq],
        mark: improved ? [i] : [],
        codeLines: [7, 8],
        vars: [
          { name: "square", value: sq },
          { name: `dp[${i - sq}]`, value: dp[i - sq] },
          { name: "candidate", value: candidate },
          { name: "bestValue", value: bestValue === Infinity ? "∞" : String(bestValue) },
        ],
        note: {
          vi: improved
            ? `dp[${i}] cập nhật: min(∞, dp[${i - sq}] + 1) = ${candidate}.`
            : `dp[${i}] không thay đổi. dp[${i - sq}] + 1 = ${candidate}.`,
          en: improved
            ? `Update dp[${i}]: min(∞, dp[${i - sq}] + 1) = ${candidate}.`
            : `dp[${i}] unchanged. dp[${i - sq}] + 1 = ${candidate}.`,
        },
      });
    }

    dp[i] = bestValue;
    steps.push({
      title: { vi: `Kết thúc dp[${i}]`, en: `Finish dp[${i}]` },
      arr: dp.slice(0, i + 1).map((v) => (v === Infinity ? 0 : v)),
      sub: dp.slice(0, i + 1).map((v) => (v === Infinity ? "∞" : String(v))),
      highlight: [i],
      mark: bestSq > 0 ? [i - bestSq] : [],
      codeLines: [5, 6, 7, 8],
      vars: [
        { name: "i", value: i },
        { name: "dp[i]", value: dp[i] },
        { name: "best square", value: bestSq > 0 ? `${bestSq} (${Math.sqrt(bestSq)}²)` : "none" },
      ],
      note: {
        vi: bestSq > 0
          ? `dp[${i}] = ${dp[i]} bằng cách dùng ${bestSq} = ${Math.sqrt(bestSq)}².`
          : `Không có cách cải thiện dp[${i}] với các bình phương hiện có.`,
        en: bestSq > 0
          ? `dp[${i}] = ${dp[i]} by using ${bestSq} = ${Math.sqrt(bestSq)}².`
          : `No improvement found for dp[${i}] with available squares.`,
      },
    });
  }

  const used = [];
  let rem = n;
  while (rem > 0) {
    for (const sq of squares) {
      if (sq <= rem && dp[rem - sq] + 1 === dp[rem]) {
        used.push(sq);
        rem -= sq;
        break;
      }
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: dp.map((v) => (v === Infinity ? 0 : v)),
    sub: dp.map((v) => (v === Infinity ? "∞" : String(v))),
    highlight: [],
    mark: [n],
    final: true,
    codeLines: [10],
    vars: [
      { name: "answer", value: dp[n] },
      { name: "decomposition", value: `[${used.map((sq) => Math.sqrt(sq) + "²").join(" + ")}] = ${n}` },
    ],
    note: {
      vi: `Số bình phương ít nhất = ${dp[n]}. Phân tích: ${used.map((sq) => Math.sqrt(sq) + "²=" + sq).join(" + ")} = ${n}.`,
      en: `Minimum perfect squares = ${dp[n]}. Decomposition: ${used.map((sq) => Math.sqrt(sq) + "²=" + sq).join(" + ")} = ${n}.`,
    },
  });

  return { original: n, answer: dp[n], steps };
}

/**
 * LeetCode 1639: Number of Ways to Form a Target String Given a Dictionary.
 * Count column character frequencies, then update dp backwards.
 * dp[i] = number of ways to form target[:i] using processed columns.
 */
function buildSteps1639(input, params) {
  const MOD = 1_000_000_007;
  const words = String(input || "")
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);
  const target = String((params && params.target) || "").trim();
  const cols = words.length ? words[0].length : 0;
  const t = target.length;
  const steps = [];

  const valid = words.length > 0 && target.length > 0 && words.every((w) => w.length === cols);
  if (!valid) {
    steps.push({
      title: { vi: "Input khong hop le", en: "Invalid input" },
      arr: [],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "Nhap words cung do dai, cach nhau boi dau phay, va target khong rong. Vi du: acca,bbbb,caca + target=aba",
        en: "Enter same-length words separated by commas and a non-empty target. Example: acca,bbbb,caca + target=aba",
      },
      final: true,
    });
    return { words, target, answer: 0, steps };
  }

  const freq = Array.from({ length: cols }, () => ({}));
  const dp = Array(t + 1).fill(0);
  dp[0] = 1;

  function freqGrid(activeCol = null, activeChar = null) {
    const chars = Array.from(new Set(target.split(""))).sort();
    const matrix = [["char", ...Array.from({ length: cols }, (_, c) => `c${c}`)]];
    for (const ch of chars) {
      matrix.push([ch, ...Array.from({ length: cols }, (_, c) => freq[c][ch] || 0)]);
    }
    const labels = {};
    let hlCell = null;
    if (activeCol !== null && activeChar !== null) {
      const row = chars.indexOf(activeChar) + 1;
      if (row > 0) {
        hlCell = [row, activeCol + 1];
        labels[`${row},${activeCol + 1}`] = "freq";
      }
    }
    return { matrix, chars, hlCell, labels };
  }

  function pushFreqStep(opts) {
    const g = freqGrid(opts.col ?? null, opts.ch ?? null);
    steps.push({
      title: opts.title,
      arr: dp.map((v) => v),
      sub: ["empty", ...target.split("").map((ch, i) => `${i + 1}:${ch}`)],
      highlight: opts.i === undefined ? [] : [opts.i],
      mark: [],
      grid: {
        dp: g.matrix,
        rowLabels: g.matrix.slice(1).map((row) => ({ index: row[0], char: "" })),
        colLabels: Array.from({ length: cols + 1 }, (_, idx) => ({ index: idx === 0 ? "" : `col=${idx - 1}`, char: "" })),
        largeCells: true,
        hlCell: g.hlCell,
        cellLabels: g.labels,
      },
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
      final: opts.final || false,
    });
  }

  function pushDpStep(opts) {
    steps.push({
      title: opts.title,
      arr: dp.map((v) => v),
      sub: ["empty", ...target.split("").map((ch, i) => `${i + 1}:${ch}`)],
      highlight: opts.i === undefined ? [] : [opts.i],
      mark: opts.mark || [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
      final: opts.final || false,
    });
  }

  pushDpStep({
    title: { vi: "Khoi tao dp[0] = 1", en: "Initialize dp[0] = 1" },
    codeLines: [3, 4, 5, 6, 7],
    highlight: 0,
    vars: [
      { name: "words", value: `[${words.join(", ")}]` },
      { name: "target", value: target },
      { name: "columns", value: cols },
    ],
    note: {
      vi: "dp[i] la so cach tao target[:i] bang cac cot da xu ly. dp[0]=1 vi chuoi rong tao duoc bang cach khong chon gi.",
      en: "dp[i] is the number of ways to form target[:i] using processed columns. dp[0]=1 because the empty prefix can be formed by choosing nothing.",
    },
  });

  for (let c = 0; c < cols; c++) {
    for (const word of words) {
      const ch = word[c];
      freq[c][ch] = (freq[c][ch] || 0) + 1;
    }
    pushFreqStep({
      title: { vi: `Dem tan suat cot ${c}`, en: `Count frequencies for column ${c}` },
      col: c,
      ch: target.includes(words[0][c]) ? words[0][c] : target[0],
      codeLines: [5],
      vars: [
        { name: "col", value: c },
        { name: "column chars", value: words.map((w) => w[c]).join(",") },
        { name: "freq used by target", value: target.split("").map((ch) => `${ch}:${freq[c][ch] || 0}`).join(", ") },
      ],
      note: {
        vi: `Cot ${c} co cac ky tu [${words.map((w) => w[c]).join(", ")}]. Chi tan suat cac ky tu trong target moi anh huong dp.`,
        en: `Column ${c} has characters [${words.map((w) => w[c]).join(", ")}]. Only frequencies of target characters affect dp.`,
      },
    });
  }

  for (let c = 0; c < cols; c++) {
    pushDpStep({
      title: { vi: `Xu ly cot ${c}`, en: `Process column ${c}` },
      codeLines: [9],
      vars: [{ name: "col", value: c }],
      note: {
        vi: "Duyet target nguoc de moi cot chi duoc dung mot lan.",
        en: "Iterate target backwards so each column is used at most once.",
      },
    });

    for (let i = t - 1; i >= 0; i--) {
      const ch = target[i];
      const count = freq[c][ch] || 0;
      const before = dp[i + 1];
      const add = (dp[i] * count) % MOD;
      pushFreqStep({
        title: { vi: `Cot ${c}: thu tao target[${i}]='${ch}'`, en: `Column ${c}: try target[${i}]='${ch}'` },
        col: c,
        ch,
        i: i + 1,
        codeLines: [10, 11],
        vars: [
          { name: `target[${i}]`, value: ch },
          { name: `freq[${c}]['${ch}']`, value: count },
          { name: `dp[${i}]`, value: dp[i] },
          { name: "add", value: `${dp[i]} * ${count} = ${add}` },
        ],
        note: {
          vi: count > 0
            ? `Co ${count} word co ky tu '${ch}' o cot ${c}. Moi cach tao target[:${i}] sinh them ${count} cach tao target[:${i + 1}].`
            : `Khong co ky tu '${ch}' o cot ${c}, nen khong them cach nao.`,
          en: count > 0
            ? `${count} word(s) have '${ch}' at column ${c}. Each way to form target[:${i}] creates ${count} way(s) to form target[:${i + 1}].`
            : `No '${ch}' at column ${c}, so this adds no ways.`,
        },
      });

      dp[i + 1] = (dp[i + 1] + add) % MOD;
      pushDpStep({
        title: { vi: `dp[${i + 1}] = ${dp[i + 1]}`, en: `dp[${i + 1}] = ${dp[i + 1]}` },
        i: i + 1,
        mark: [i],
        codeLines: [11],
        vars: [
          { name: "before", value: before },
          { name: "add", value: add },
          { name: `dp[${i + 1}]`, value: dp[i + 1] },
        ],
        note: {
          vi: `dp[${i + 1}] = (${before} + ${add}) mod MOD = ${dp[i + 1]}.`,
          en: `dp[${i + 1}] = (${before} + ${add}) mod MOD = ${dp[i + 1]}.`,
        },
      });
    }
  }

  const answer = dp[t];
  pushDpStep({
    title: { vi: `return ${answer}`, en: `return ${answer}` },
    i: t,
    codeLines: [13],
    vars: [
      { name: `dp[${t}]`, value: answer },
      { name: "return", value: answer },
    ],
    note: {
      vi: `So cach tao target "${target}" la ${answer}.`,
      en: `The number of ways to form target "${target}" is ${answer}.`,
    },
    final: true,
  });

  return { words, target, answer, steps };
}

/**
 * LeetCode 139: Word Break.
 * dp[i] = True if s[0..i-1] can be segmented into dictionary words.
 * dp[0] = True (empty string).
 * dp[i] = any(dp[j] and s[j:i] in wordDict) for j in 0..i-1.
 */
function buildSteps139(input, params) {
  const s = typeof input === "string" ? input : String(input);
  const wordDict = (params.wordDict || "").split(",").map((w) => w.trim()).filter(Boolean);
  const n = s.length;
  const steps = [];
  const wordSet = new Set(wordDict);
  const dp = new Array(n + 1).fill(false);
  dp[0] = true;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: dp.map((v) => (v ? 1 : 0)),
    sub: ["ε", ...s.split("")],
    highlight: [0],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "s", value: s },
      { name: "wordDict", value: `[${wordDict.join(", ")}]` },
      { name: "dp[0]", value: true },
    ],
    note: {
      vi: `dp[i] = True nếu s[0..i-1] tách được thành từ.\ndp[0] = True (chuỗi rỗng).\ndp[i] = ∃ j: dp[j] = True ∧ s[j:i] ∈ wordDict.`,
      en: `dp[i] = True if s[0..i-1] can be segmented.\ndp[0] = True (empty string).\ndp[i] = ∃ j: dp[j] = True ∧ s[j:i] ∈ wordDict.`,
    },
  });

  for (let i = 1; i <= n; i++) {
    let matchWord = "";
    let matchJ = -1;
    for (let j = 0; j < i; j++) {
      const word = s.slice(j, i);
      if (dp[j] && wordSet.has(word)) {
        dp[i] = true;
        matchWord = word;
        matchJ = j;
        break;
      }
    }

    steps.push({
      title: { vi: `dp[${i}]: s[0..${i - 1}]="${s.slice(0, i)}"`, en: `dp[${i}]: s[0..${i - 1}]="${s.slice(0, i)}"` },
      arr: dp.map((v) => (v ? 1 : 0)),
      sub: ["ε", ...s.split("")],
      highlight: [i],
      mark: dp[i] && matchJ >= 0 ? [matchJ] : [],
      codeLines: [6, 7, 8, 9],
      vars: [
        { name: "i", value: i },
        { name: "dp[i]", value: dp[i] },
        { name: "match", value: dp[i] ? `dp[${matchJ}]=T ∧ "${matchWord}" ∈ dict` : "none" },
      ],
      note: dp[i]
        ? {
            vi: `dp[${matchJ}]=True ∧ s[${matchJ}:${i}]="${matchWord}" ∈ dict → dp[${i}]=True.`,
            en: `dp[${matchJ}]=True ∧ s[${matchJ}:${i}]="${matchWord}" ∈ dict → dp[${i}]=True.`,
          }
        : {
            vi: `Không tìm được j thỏa dp[j]=True ∧ s[j:${i}] ∈ dict → dp[${i}]=False.`,
            en: `No j found where dp[j]=True ∧ s[j:${i}] ∈ dict → dp[${i}]=False.`,
          },
    });
  }

  // Trace back segmentation
  const words = [];
  if (dp[n]) {
    let i = n;
    while (i > 0) {
      for (let j = 0; j < i; j++) {
        const w = s.slice(j, i);
        if (dp[j] && wordSet.has(w)) {
          words.unshift(w);
          i = j;
          break;
        }
      }
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: dp.map((v) => (v ? 1 : 0)),
    sub: ["ε", ...s.split("")],
    highlight: [],
    mark: dp[n] ? dp.map((v, idx) => (v ? idx : -1)).filter((v) => v >= 0) : [],
    final: true,
    codeLines: [10],
    vars: [
      { name: "answer", value: dp[n] },
      { name: "segmentation", value: dp[n] ? words.join(" | ") : "impossible" },
    ],
    note: dp[n]
      ? { vi: `Có thể tách: "${words.join('" + "')}". dp[${n}]=True.`, en: `Can segment: "${words.join('" + "')}". dp[${n}]=True.` }
      : { vi: `Không thể tách "${s}" bằng từ điển. dp[${n}]=False.`, en: `Cannot segment "${s}" using the dictionary. dp[${n}]=False.` },
  });

  return { original: s, answer: dp[n], steps };
}

/**
 * LeetCode 132: Palindrome Partitioning II.
 * dp[i] = minimum cuts needed for s[0..i-1] to be split into all palindromes.
 * isPalin[j][i] = true if s[j..i] is a palindrome.
 * Transition: dp[i] = min(dp[j] + 1) for all j where s[j..i-1] is palindrome.
 */
function buildSteps132(input) {
  const s = typeof input === "string" ? input : String(input);
  const n = s.length;
  const steps = [];
  const chars = s.split("");
  const rowLabels = Array.from({ length: n }, (_, idx) => String(idx));
  const indices = Array.from({ length: n + 1 }, (_, idx) => idx);
  const dpLabels = ["dp[0]", ...chars.map((ch, idx) => `dp[${idx + 1}]\n${ch}`)];
  const sliceHighlight = (start, end) =>
    start <= end ? Array.from({ length: end - start + 1 }, (_, k) => start + k) : [];
  const dpSliceHighlight = (start, end) =>
    start <= end ? Array.from({ length: end - start + 1 }, (_, k) => start + 1 + k) : [];

  steps.push({
    title: { vi: `n = ${n}`, en: `n = ${n}` },
    arr: indices,
    sub: dpLabels,
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "s", value: s },
      { name: "n", value: n },
    ],
    note: {
      vi: `Doc do dai chuoi: n = len("${s}") = ${n}.`,
      en: `Read the string length: n = len("${s}") = ${n}.`,
    },
  });

  const isPalin = Array.from({ length: n }, () => new Array(n).fill(false));
  steps.push({
    title: { vi: "Tao bang isPalin", en: "Create isPalin table" },
    matrix: isPalin.map(row => [...row]),
    rowLabels,
    colLabels: rowLabels,
    highlight: [],
    mark: [],
    codeLines: [5],
    vars: [
      { name: "isPalin size", value: `${n} x ${n}` },
      { name: "default", value: "False" },
    ],
    note: {
      vi: "Khoi tao isPalin[i][j] = False cho moi substring s[i..j].",
      en: "Initialize isPalin[i][j] = False for every substring s[i..j].",
    },
  });

  for (let i = n - 1; i >= 0; i--) {
    steps.push({
      title: { vi: `Vong ngoai i = ${i}`, en: `Outer loop i = ${i}` },
      arr: chars,
      sub: rowLabels,
      highlight: [i],
      mark: [],
      codeLines: [6],
      vars: [
        { name: "i", value: i },
        { name: "s[i]", value: s[i] ?? "" },
      ],
      note: {
        vi: `Bat dau tinh cac palindrome co diem bat dau i = ${i}.`,
        en: `Start computing palindromes that begin at i = ${i}.`,
      },
    });

    for (let j = i; j < n; j++) {
      steps.push({
        title: { vi: `Vong trong j = ${j}`, en: `Inner loop j = ${j}` },
        arr: chars,
        sub: rowLabels,
        highlight: sliceHighlight(i, j),
        mark: [i, j],
        codeLines: [7],
        vars: [
          { name: "i", value: i },
          { name: "j", value: j },
          { name: "s[i..j]", value: s.slice(i, j + 1) },
        ],
        note: {
          vi: `Dang xet substring s[${i}..${j}] = "${s.slice(i, j + 1)}".`,
          en: `Checking substring s[${i}..${j}] = "${s.slice(i, j + 1)}".`,
        },
      });

      const sameEnds = s[i] === s[j];
      const shortEnough = j - i <= 2;
      const innerValue = shortEnough ? true : isPalin[i + 1][j - 1];
      const pal = sameEnds && innerValue;
      steps.push({
        title: { vi: pal ? "Dieu kien dung" : "Dieu kien sai", en: pal ? "Condition true" : "Condition false" },
        matrix: isPalin.map(row => [...row]),
        rowLabels,
        colLabels: rowLabels,
        activeCell: [i, j],
        highlight: [[i, j]],
        mark: pal ? [[i, j]] : [],
        codeLines: [8],
        vars: [
          { name: "i", value: i },
          { name: "j", value: j },
          { name: "s[i] == s[j]", value: `${JSON.stringify(s[i])} == ${JSON.stringify(s[j])} -> ${sameEnds}` },
          { name: "j - i <= 2", value: shortEnough },
          { name: shortEnough ? "inner check" : `isPalin[${i + 1}][${j - 1}]`, value: innerValue },
          { name: `isPalin[${i}][${j}]`, value: pal },
        ],
        note: {
          vi: `Kiem tra s[${i}] == s[${j}] va phan ben trong co palindrome khong. Ket qua: ${pal}.`,
          en: `Check matching ends and whether the inside is a palindrome. Result: ${pal}.`,
        },
      });

      if (pal) {
        isPalin[i][j] = true;
        steps.push({
          title: { vi: `isPalin[${i}][${j}] = True`, en: `isPalin[${i}][${j}] = True` },
          matrix: isPalin.map(row => [...row]),
          rowLabels,
          colLabels: rowLabels,
          activeCell: [i, j],
          highlight: [[i, j]],
          mark: [[i, j]],
          codeLines: [9],
          vars: [
            { name: `s[${i}..${j}]`, value: s.slice(i, j + 1) },
            { name: `isPalin[${i}][${j}]`, value: true },
          ],
          note: {
            vi: `Danh dau "${s.slice(i, j + 1)}" la palindrome.`,
            en: `Mark "${s.slice(i, j + 1)}" as a palindrome.`,
          },
        });
      }
    }
  }

  const dp = Array.from({ length: n + 1 }, (_, idx) => idx - 1);
  steps.push({
    title: { vi: "Khoi tao dp", en: "Initialize dp" },
    arr: [...dp],
    sub: dpLabels,
    highlight: [],
    mark: [0],
    codeLines: [11],
    vars: [
      { name: "dp", value: `[${dp.join(", ")}]` },
      { name: "dp[0]", value: -1 },
    ],
    note: {
      vi: "dp[i] = so lan cat toi thieu cho s[0..i-1]. Gia tri ban dau la worst case: dp[i] = i - 1.",
      en: "dp[i] = minimum cuts for s[0..i-1]. Initial values are the worst case: dp[i] = i - 1.",
    },
  });

  for (let i = 1; i <= n; i++) {
    steps.push({
      title: { vi: `Vong DP i = ${i}`, en: `DP outer loop i = ${i}` },
      arr: [...dp],
      sub: dpLabels,
      highlight: dpSliceHighlight(0, i - 1),
      mark: [i],
      codeLines: [12],
      vars: [
        { name: "i", value: i },
        { name: "s[0..i-1]", value: s.slice(0, i) },
        { name: `dp[${i}]`, value: dp[i] },
      ],
      note: {
        vi: `Tinh dp[${i}] cho prefix "${s.slice(0, i)}".`,
        en: `Compute dp[${i}] for prefix "${s.slice(0, i)}".`,
      },
    });

    for (let j = 0; j < i; j++) {
      const fragment = s.slice(j, i);
      steps.push({
        title: { vi: `Thu j = ${j}`, en: `Try j = ${j}` },
        arr: [...dp],
        sub: dpLabels,
        highlight: dpSliceHighlight(j, i - 1),
        mark: [j, i],
        codeLines: [13],
        vars: [
          { name: "i", value: i },
          { name: "j", value: j },
          { name: `s[${j}..${i - 1}]`, value: fragment },
          { name: `dp[${i}] before`, value: dp[i] },
        ],
        note: {
          vi: `Thu cat truoc vi tri ${j}; doan cuoi la "${fragment}".`,
          en: `Try cutting before index ${j}; the last segment is "${fragment}".`,
        },
      });

      const pal = isPalin[j][i - 1];
      const candidate = dp[j] + 1;
      steps.push({
        title: { vi: pal ? "Substring la palindrome" : "Substring khong palindrome", en: pal ? "Substring is palindrome" : "Substring is not palindrome" },
        matrix: isPalin.map(row => [...row]),
        rowLabels,
        colLabels: rowLabels,
        activeCell: [j, i - 1],
        highlight: [[j, i - 1]],
        mark: pal ? [[j, i - 1]] : [],
        codeLines: [14],
        vars: [
          { name: "i", value: i },
          { name: "j", value: j },
          { name: `isPalin[${j}][${i - 1}]`, value: pal },
          { name: pal ? `dp[${j}] + 1` : "candidate", value: pal ? `${dp[j]} + 1 = ${candidate}` : "skip" },
        ],
        note: {
          vi: pal
            ? `"${fragment}" la palindrome, co the cap nhat bang dp[${j}] + 1.`
            : `"${fragment}" khong phai palindrome, bo qua j = ${j}.`,
          en: pal
            ? `"${fragment}" is a palindrome, so dp[${j}] + 1 can update the answer.`
            : `"${fragment}" is not a palindrome, so skip j = ${j}.`,
        },
      });

      if (pal) {
        const before = dp[i];
        dp[i] = Math.min(dp[i], candidate);
        steps.push({
          title: { vi: `dp[${i}] = ${dp[i]}`, en: `dp[${i}] = ${dp[i]}` },
          arr: [...dp],
          sub: dpLabels,
          highlight: dpSliceHighlight(j, i - 1),
          mark: [j, i],
          codeLines: [15],
          vars: [
            { name: `dp[${i}] before`, value: before },
            { name: `dp[${j}] + 1`, value: `${dp[j]} + 1 = ${candidate}` },
            { name: `dp[${i}] after`, value: dp[i] },
          ],
          note: {
            vi: `Cap nhat dp[${i}] = min(${before}, ${candidate}) = ${dp[i]}.`,
            en: `Update dp[${i}] = min(${before}, ${candidate}) = ${dp[i]}.`,
          },
        });
      }
    }
  }

  const answer = dp[n];
  steps.push({
    title: { vi: `Ket qua: ${answer} cat`, en: `Result: ${answer} cut(s)` },
    arr: [...dp],
    sub: dpLabels,
    highlight: [],
    mark: [n],
    final: true,
    codeLines: [16],
    vars: [
      { name: "answer", value: answer },
      { name: `dp[${n}]`, value: answer },
      { name: "dp", value: `[${dp.join(", ")}]` },
    ],
    note: {
      vi: `return dp[${n}] = ${answer}.`,
      en: `return dp[${n}] = ${answer}.`,
    },
  });

  return { input: s, answer, steps };
}

/**
 * LeetCode 91: Decode Ways.
 * dp[i] = number of ways to decode s[0..i-1].
 * Single digit s[i-1] != '0': dp[i] += dp[i-1].
 * Two digits s[i-2:i] in 10..26: dp[i] += dp[i-2].
 */
function buildSteps91(input) {
  const s = typeof input === "string" ? input : String(input);
  const params = arguments[1] || {};
  const approach = Number(params.approach) || 1;
  if (approach === 2) return buildSteps91B(s);
  const n = s.length;
  const steps = [];
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;

  // Intro step — explain the problem clearly
  steps.push({
    title: { vi: "Ý tưởng: mỗi vị trí có 1-2 cách giải mã", en: "Idea: each position has 1-2 decode options" },
    arr: dp.slice(),
    sub: ["ε", ...s.split("")],
    highlight: [], mark: [],
    codeLines: [2, 3],
    vars: [{ name: "s", value: `"${s}"` }, { name: "mapping", value: "A=1, B=2, ..., Z=26" }],
    note: {
      vi:
        `🔤 Giải mã chuỗi số "${s}" thành chữ cái (A=1, B=2, ..., Z=26).\n` +
        `💡 dp[i] = số cách giải mã s[0..i-1].\n\n` +
        `Tại mỗi vị trí i, tối đa 2 lựa chọn:\n` +
        `  ① 1 chữ số: s[i-1] ≠ '0' → decode thành 1 ký tự → dp[i] += dp[i-1]\n` +
        `  ② 2 chữ số: s[i-2:i] ∈ [10..26] → decode thành 1 ký tự → dp[i] += dp[i-2]\n\n` +
        `dp[0] = 1 (chuỗi rỗng "ε" = 1 cách).`,
      en:
        `🔤 Decode number string "${s}" into letters (A=1, B=2, ..., Z=26).\n` +
        `💡 dp[i] = number of ways to decode s[0..i-1].\n\n` +
        `At each position i, up to 2 options:\n` +
        `  ① Single digit: s[i-1] ≠ '0' → decode as 1 letter → dp[i] += dp[i-1]\n` +
        `  ② Two digits: s[i-2:i] ∈ [10..26] → decode as 1 letter → dp[i] += dp[i-2]\n\n` +
        `dp[0] = 1 (empty string "ε" = 1 way).`,
    },
  });

  for (let i = 1; i <= n; i++) {
    const oneDigit = s[i - 1];
    const oneChar = oneDigit !== "0" ? String.fromCharCode(64 + parseInt(oneDigit)) : "✗";
    const twoDigit = i >= 2 ? s.slice(i - 2, i) : "";
    const twoVal = twoDigit ? parseInt(twoDigit, 10) : 0;
    const twoChar = (i >= 2 && twoVal >= 10 && twoVal <= 26) ? String.fromCharCode(64 + twoVal) : "✗";

    // Step: for i in range → enter loop
    steps.push({
      title: { vi: `Vòng lặp i=${i}`, en: `Loop i=${i}` },
      arr: dp.slice(),
      sub: ["ε", ...s.split("").map((c, idx) => idx < i ? `${c}` : "·")],
      highlight: [i],
      mark: [],
      codeLines: [6],
      vars: [
        { name: "i", value: i },
        { name: "s[i-1]", value: `'${oneDigit}'` },
        { name: "dp", value: `[${dp.join(",")}]` },
      ],
      note: {
        vi: `Bắt đầu xét vị trí i=${i}, s[${i-1}]='${oneDigit}'.`,
        en: `Start processing position i=${i}, s[${i-1}]='${oneDigit}'.`,
      },
    });

    // Step: check single digit condition
    const singleValid = oneDigit !== "0";
    steps.push({
      title: { vi: `Kiểm tra s[${i-1}]='${oneDigit}' ≠ '0'? ${singleValid ? "✓" : "✗"}`, en: `Check s[${i-1}]='${oneDigit}' ≠ '0'? ${singleValid ? "✓" : "✗"}` },
      arr: dp.slice(),
      sub: ["ε", ...s.split("").map((c, idx) => idx < i ? `${c}` : "·")],
      highlight: [i],
      mark: singleValid ? [i - 1] : [],
      codeLines: [7],
      vars: [
        { name: "i", value: i },
        { name: `s[i-1]='${oneDigit}' → ${oneChar}`, value: singleValid ? "✓ decode được" : "✗ số 0" },
        { name: "dp", value: `[${dp.join(",")}]` },
      ],
      note: {
        vi: singleValid
          ? `'${oneDigit}' ≠ '0' → decode thành '${oneChar}' (chữ số ${oneDigit} → ký tự thứ ${oneDigit} trong bảng chữ). Sẽ cộng dp[${i-1}].`
          : `'${oneDigit}' = '0' → không thể decode 1 chữ số '0' đơn lẻ. Bỏ qua.`,
        en: singleValid
          ? `'${oneDigit}' ≠ '0' → decode as '${oneChar}' (digit ${oneDigit} → ${oneDigit}th letter). Will add dp[${i-1}].`
          : `'${oneDigit}' = '0' → cannot decode single '0'. Skip.`,
      },
    });

    // Step: dp[i] += dp[i-1] (if valid)
    if (singleValid) {
      dp[i] += dp[i - 1];
      steps.push({
        title: { vi: `dp[${i}] += dp[${i-1}] = ${dp[i-1]} → dp[${i}]=${dp[i]}`, en: `dp[${i}] += dp[${i-1}] = ${dp[i-1]} → dp[${i}]=${dp[i]}` },
        arr: dp.slice(),
        sub: ["ε", ...s.split("").map((c, idx) => idx < i ? `${c}` : "·")],
        highlight: [i],
        mark: [i - 1, i],
        codeLines: [8],
        vars: [
          { name: "i", value: i },
          { name: `dp[${i}] += dp[${i-1}]`, value: `+= ${dp[i-1]} → dp[${i}] = ${dp[i]}` },
          { name: "dp", value: `[${dp.join(",")}]` },
        ],
        note: {
          vi: `dp[${i}] += dp[${i-1}] = ${dp[i-1]}. Hiện dp[${i}] = ${dp[i]}.`,
          en: `dp[${i}] += dp[${i-1}] = ${dp[i-1]}. Now dp[${i}] = ${dp[i]}.`,
        },
      });
    }

    // Step: check two-digit condition
    if (i >= 2) {
      const twoValid = twoVal >= 10 && twoVal <= 26;
      steps.push({
        title: { vi: `Kiểm tra '${twoDigit}' ∈ [10..26]? ${twoValid ? "✓" : "✗"}`, en: `Check '${twoDigit}' ∈ [10..26]? ${twoValid ? "✓" : "✗"}` },
        arr: dp.slice(),
        sub: ["ε", ...s.split("").map((c, idx) => idx < i ? `${c}` : "·")],
        highlight: [i],
        mark: twoValid ? [i - 2] : [],
        codeLines: [9],
        vars: [
          { name: "i", value: i },
          { name: `s[${i-2}:${i}]='${twoDigit}' → ${twoChar}`, value: twoValid ? `${twoVal} ∈ [10..26] ✓` : `${twoVal} ∉ [10..26] ✗` },
          { name: "dp", value: `[${dp.join(",")}]` },
        ],
        note: {
          vi: twoValid
            ? `'${twoDigit}' = ${twoVal} nằm trong [10..26] → decode thành '${twoChar}'. Sẽ cộng dp[${i-2}].`
            : `'${twoDigit}' = ${twoVal} nằm ngoài [10..26] → không decode được 2 chữ số. Bỏ qua.`,
          en: twoValid
            ? `'${twoDigit}' = ${twoVal} is in [10..26] → decode as '${twoChar}'. Will add dp[${i-2}].`
            : `'${twoDigit}' = ${twoVal} is NOT in [10..26] → cannot decode 2 digits. Skip.`,
        },
      });

      // Step: dp[i] += dp[i-2] (if valid)
      if (twoValid) {
        dp[i] += dp[i - 2];
        steps.push({
          title: { vi: `dp[${i}] += dp[${i-2}] = ${dp[i-2]} → dp[${i}]=${dp[i]}`, en: `dp[${i}] += dp[${i-2}] = ${dp[i-2]} → dp[${i}]=${dp[i]}` },
          arr: dp.slice(),
          sub: ["ε", ...s.split("").map((c, idx) => idx < i ? `${c}` : "·")],
          highlight: [i],
          mark: [i - 2, i],
          codeLines: [10],
          vars: [
            { name: "i", value: i },
            { name: `dp[${i}] += dp[${i-2}]`, value: `+= ${dp[i-2]} → dp[${i}] = ${dp[i]}` },
            { name: "dp", value: `[${dp.join(",")}]` },
          ],
          note: {
            vi: `dp[${i}] += dp[${i-2}] = ${dp[i-2]}. Hiện dp[${i}] = ${dp[i]}.`,
            en: `dp[${i}] += dp[${i-2}] = ${dp[i-2]}. Now dp[${i}] = ${dp[i]}.`,
          },
        });
      }
    }
  }

  steps.push({
    title: { vi: `Kết quả: ${dp[n]} cách`, en: `Result: ${dp[n]} ways` },
    arr: dp.slice(),
    sub: ["ε", ...s.split("")],
    highlight: [], mark: [n], final: true,
    codeLines: [9],
    vars: [{ name: "answer", value: dp[n] }, { name: "dp", value: `[${dp.join(",")}]` }],
    note: {
      vi: `🎉 "${s}" có ${dp[n]} cách giải mã. dp[${n}] = ${dp[n]}.`,
      en: `🎉 "${s}" has ${dp[n]} decode ways. dp[${n}] = ${dp[n]}.`,
    },
  });

  return { original: s, answer: dp[n], steps };
}

// ─── 91 Approach 2: O(1) space rolling variables ───
function buildSteps91B(s) {
  const n = s.length;
  const steps = [];
  if (s[0] === "0") {
    steps.push({ title: { vi: "s[0]='0' → 0", en: "s[0]='0' → 0" }, arr: [0], sub: [s[0]], highlight: [], mark: [], final: true, codeLines: [3, 4], codeBlock: 2, vars: [{ name: "answer", value: 0 }], note: { vi: "Bắt đầu bằng '0' → không decode được.", en: "Starts with '0' → cannot decode." } });
    return { original: s, answer: 0, steps };
  }

  let prev2 = 1, prev1 = 1;
  const sArr = s.split("");

  steps.push({
    title: { vi: "O(1) space: chỉ dùng prev2, prev1", en: "O(1) space: only prev2, prev1" },
    arr: sArr.map(() => 0), sub: sArr,
    highlight: [0], mark: [], codeLines: [3, 4, 5, 6], codeBlock: 2,
    vars: [{ name: "s", value: `"${s}"` }, { name: "prev2 (dp[i-2])", value: prev2 }, { name: "prev1 (dp[i-1])", value: prev1 }],
    note: {
      vi: `Không cần mảng dp[]. Chỉ cần 2 biến:\n  prev2 = dp[i-2] = 1\n  prev1 = dp[i-1] = 1\nMỗi bước tính cur, rồi roll: prev2=prev1, prev1=cur.`,
      en: `No dp[] array needed. Just 2 variables:\n  prev2 = dp[i-2] = 1\n  prev1 = dp[i-1] = 1\nEach step compute cur, then roll: prev2=prev1, prev1=cur.`,
    },
  });

  for (let i = 1; i < n; i++) {
    let cur = 0;
    const oneDigit = s[i];
    const oneChar = oneDigit !== "0" ? String.fromCharCode(64 + parseInt(oneDigit)) : "✗";
    const twoDigit = s.slice(i - 1, i + 1);
    const twoVal = parseInt(twoDigit, 10);
    const twoChar = twoVal >= 10 && twoVal <= 26 ? String.fromCharCode(64 + twoVal) : "✗";

    const addSingle = oneDigit !== "0";
    const addDouble = twoVal >= 10 && twoVal <= 26;
    if (addSingle) cur += prev1;
    if (addDouble) cur += prev2;

    steps.push({
      title: { vi: `i=${i}: cur=${cur}`, en: `i=${i}: cur=${cur}` },
      arr: sArr.map((_, idx) => idx <= i ? 1 : 0), sub: sArr,
      highlight: [i], mark: [], codeLines: [7, 8, 9, 10, 11], codeBlock: 2,
      vars: [
        { name: "i", value: i },
        { name: `① '${oneDigit}'→${oneChar}`, value: addSingle ? `+prev1=${prev1} ✓` : "✗" },
        { name: `② '${twoDigit}'→${twoChar}`, value: addDouble ? `+prev2=${prev2} ✓` : "✗" },
        { name: "cur", value: cur },
        { name: "roll", value: `prev2=${prev1}, prev1=${cur}` },
      ],
      note: {
        vi: `cur = ${addSingle ? `prev1(${prev1})` : "0"}${addDouble ? ` + prev2(${prev2})` : ""} = ${cur}.\nRoll: prev2 ← ${prev1}, prev1 ← ${cur}.`,
        en: `cur = ${addSingle ? `prev1(${prev1})` : "0"}${addDouble ? ` + prev2(${prev2})` : ""} = ${cur}.\nRoll: prev2 ← ${prev1}, prev1 ← ${cur}.`,
      },
    });

    prev2 = prev1;
    prev1 = cur;
  }

  const fs = {
    title: { vi: `Kết quả: ${prev1} cách`, en: `Result: ${prev1} ways` },
    arr: sArr.map(() => 1), sub: sArr,
    highlight: [], mark: sArr.map((_, i) => i), final: true, codeLines: [12], codeBlock: 2,
    vars: [{ name: "answer", value: prev1 }],
    note: { vi: `🎉 "${s}" có ${prev1} cách decode. O(1) space!`, en: `🎉 "${s}" has ${prev1} decode ways. O(1) space!` },
  };
  steps.push(fs);
  return { original: s, answer: prev1, steps };
}

/**
 * LeetCode 62: Unique Paths.
 * dp[r][c] = number of paths from (0,0) to (r,c).
 * dp[r][c] = dp[r-1][c] + dp[r][c-1]. First row/col = 1.
 * Uses the grid renderer (like LCS) to show the 2D table filling.
 */
function buildSteps62(input, params) {
  const m = params.m || 3;
  const n = params.n || 7;
  const steps = [];
  const dp = Array.from({ length: m }, () => new Array(n).fill(0));

  // Fill first row and col with 1
  for (let r = 0; r < m; r++) dp[r][0] = 1;
  for (let c = 0; c < n; c++) dp[0][c] = 1;

  function gridSnap(opts) {
    const colHeaders = Array.from({ length: n }, (_, c) => String(c));
    const rowLabels = Array.from({ length: m }, (_, r) => String(r));
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: dp.map((row) => [...row]),
        text1: rowLabels.join(""),
        text2: colHeaders.join(""),
        hlCell: opts.hlCell || null,
        pathCells: opts.pathCells || [],
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  gridSnap({
    title: { vi: "Khởi tạo", en: "Initialize" },
    codeLines: [3, 4, 5],
    vars: [{ name: "m", value: m }, { name: "n", value: n }],
    note: {
      vi: `Lưới ${m}×${n}. dp[r][c] = số đường từ (0,0) đến (r,c).\nHàng đầu = cột đầu = 1 (chỉ đi phải/xuống).\ndp[r][c] = dp[r-1][c] + dp[r][c-1].`,
      en: `Grid ${m}×${n}. dp[r][c] = paths from (0,0) to (r,c).\nFirst row = first col = 1 (only right/down).\ndp[r][c] = dp[r-1][c] + dp[r][c-1].`,
    },
  });

  // Fill the rest
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      dp[r][c] = dp[r - 1][c] + dp[r][c - 1];

      // Show selected steps to keep manageable
      if (m * n <= 30 || r === m - 1 && c === n - 1 || (r + c) % 2 === 0) {
        gridSnap({
          title: { vi: `dp[${r}][${c}]`, en: `dp[${r}][${c}]` },
          hlCell: [r, c],
          codeLines: [6, 7],
          vars: [
            { name: "r", value: r },
            { name: "c", value: c },
            { name: "dp[r-1][c]", value: dp[r - 1][c] },
            { name: "dp[r][c-1]", value: dp[r][c - 1] },
            { name: "dp[r][c]", value: dp[r][c] },
          ],
          note: {
            vi: `dp[${r}][${c}] = dp[${r - 1}][${c}] + dp[${r}][${c - 1}] = ${dp[r - 1][c]} + ${dp[r][c - 1]} = ${dp[r][c]}.`,
            en: `dp[${r}][${c}] = dp[${r - 1}][${c}] + dp[${r}][${c - 1}] = ${dp[r - 1][c]} + ${dp[r][c - 1]} = ${dp[r][c]}.`,
          },
        });
      }
    }
  }

  const answer = dp[m - 1][n - 1];
  gridSnap({
    title: { vi: "Kết quả", en: "Result" },
    hlCell: [m - 1, n - 1],
    codeLines: [7],
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `Số đường đi duy nhất từ (0,0) đến (${m - 1},${n - 1}) = ${answer}.`,
      en: `Unique paths from (0,0) to (${m - 1},${n - 1}) = ${answer}.`,
    },
  });
  steps[steps.length - 1].final = true;

  return { original: { m, n }, answer, steps };
}

/**
 * LeetCode 63: Unique Paths II.
 * Same grid DP as #62, but blocked cells contribute 0 paths.
 * obstacleGrid[r][c] = 1 means blocked, 0 means open.
 */
function buildSteps63(input) {
  const obstacleGrid = typeof input === "string"
    ? input.split("|").map((row) => row.split(",").map((s) => Number(s.trim())))
    : [[0, 0, 0], [0, 1, 0], [0, 0, 0]];
  const m = obstacleGrid.length;
  const n = obstacleGrid[0].length;
  const dp = Array.from({ length: m }, () => new Array(n).fill(0));
  const steps = [];

  function makeDisplay() {
    const display = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(""));
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        display[r + 1][c + 1] = obstacleGrid[r][c] === 1 ? "X" : dp[r][c];
      }
    }
    return display;
  }

  function shiftCell(cell) {
    return cell ? [cell[0] + 1, cell[1] + 1] : null;
  }

  function gridSnap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: makeDisplay(),
        text1: Array.from({ length: m }, (_, r) => String(r)).join(""),
        text2: Array.from({ length: n }, (_, c) => String(c)).join(""),
        hlCell: shiftCell(opts.hlCell || null),
        pathCells: (opts.pathCells || []).map(shiftCell).filter(Boolean),
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  gridSnap({
    title: { vi: "Khởi tạo lưới có vật cản", en: "Initialize obstacle grid" },
    codeLines: [3, 4],
    vars: [
      { name: "m", value: m },
      { name: "n", value: n },
      { name: "obstacle", value: "1 = blocked, 0 = open" },
    ],
    note: {
      vi: `Lưới ${m}x${n}. Ô có giá trị 1 là vật cản nên số đường đi tới ô đó luôn bằng 0.`,
      en: `Grid ${m}x${n}. A cell with value 1 is blocked, so paths to that cell are always 0.`,
    },
  });

  if (obstacleGrid[0][0] === 1) {
    gridSnap({
      title: { vi: "Kiểm tra ô bắt đầu", en: "Check start cell" },
      hlCell: [0, 0],
      codeLines: [5],
      vars: [{ name: "obstacleGrid[0][0]", value: 1 }],
      note: {
        vi: "Dòng 5 kiểm tra ô bắt đầu có phải vật cản không.",
        en: "Line 5 checks whether the start cell is blocked.",
      },
    });
    gridSnap({
      title: { vi: "Start bị chặn", en: "Start is blocked" },
      hlCell: [0, 0],
      codeLines: [6],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "Ô bắt đầu (0,0) là vật cản, robot không thể xuất phát. Trả về 0.",
        en: "The start cell (0,0) is blocked, so the robot cannot start. Return 0.",
      },
    });
    steps[steps.length - 1].final = true;
    return { original: obstacleGrid, answer: 0, steps };
  }

  gridSnap({
    title: { vi: "Kiểm tra ô bắt đầu", en: "Check start cell" },
    hlCell: [0, 0],
    codeLines: [5],
    vars: [{ name: "obstacleGrid[0][0]", value: 0 }],
    note: {
      vi: "Ô bắt đầu không bị chặn, tiếp tục khởi tạo dp[0][0].",
      en: "The start cell is open, so continue to initialize dp[0][0].",
    },
  });

  dp[0][0] = 1;
  gridSnap({
    title: { vi: "Base: dp[0][0] = 1", en: "Base: dp[0][0] = 1" },
    hlCell: [0, 0],
    codeLines: [7],
    vars: [{ name: "dp[0][0]", value: 1 }],
    note: {
      vi: "Ô bắt đầu không bị chặn, có đúng 1 cách đứng tại đây.",
      en: "The start cell is open, so there is exactly 1 way to stand here.",
    },
  });

  for (let c = 1; c < n; c++) {
    gridSnap({
      title: { vi: `Vòng lặp hàng đầu c=${c}`, en: `First-row loop c=${c}` },
      hlCell: [0, c],
      codeLines: [8],
      vars: [{ name: "c", value: c }],
      note: {
        vi: `Đang xử lý hàng đầu tại ô (0,${c}). Hàng đầu chỉ có thể nhận đường đi từ ô bên trái.`,
        en: `Processing first-row cell (0,${c}). The first row can only receive paths from the left.`,
      },
    });

    const blocked = obstacleGrid[0][c] === 1;
    dp[0][c] = blocked ? 0 : dp[0][c - 1];
    gridSnap({
      title: { vi: `Hàng đầu: dp[0][${c}] = ${dp[0][c]}`, en: `First row: dp[0][${c}] = ${dp[0][c]}` },
      hlCell: [0, c],
      pathCells: [[0, c - 1]],
      codeLines: [9],
      vars: [
        { name: "blocked?", value: blocked },
        { name: `dp[0][${c - 1}]`, value: dp[0][c - 1] },
        { name: `dp[0][${c}]`, value: dp[0][c] },
      ],
      note: {
        vi: blocked
          ? `Ô (0,${c}) bị chặn nên dp[0][${c}] = 0.`
          : `Hàng đầu chỉ có thể đi từ trái sang: dp[0][${c}] = dp[0][${c - 1}] = ${dp[0][c]}.`,
        en: blocked
          ? `Cell (0,${c}) is blocked, so dp[0][${c}] = 0.`
          : `First row can only come from the left: dp[0][${c}] = dp[0][${c - 1}] = ${dp[0][c]}.`,
      },
    });
  }

  for (let r = 1; r < m; r++) {
    gridSnap({
      title: { vi: `Vòng lặp cột đầu r=${r}`, en: `First-column loop r=${r}` },
      hlCell: [r, 0],
      codeLines: [10],
      vars: [{ name: "r", value: r }],
      note: {
        vi: `Đang xử lý cột đầu tại ô (${r},0). Cột đầu chỉ có thể nhận đường đi từ ô phía trên.`,
        en: `Processing first-column cell (${r},0). The first column can only receive paths from above.`,
      },
    });

    const blocked = obstacleGrid[r][0] === 1;
    dp[r][0] = blocked ? 0 : dp[r - 1][0];
    gridSnap({
      title: { vi: `Cột đầu: dp[${r}][0] = ${dp[r][0]}`, en: `First column: dp[${r}][0] = ${dp[r][0]}` },
      hlCell: [r, 0],
      pathCells: [[r - 1, 0]],
      codeLines: [11],
      vars: [
        { name: "blocked?", value: blocked },
        { name: `dp[${r - 1}][0]`, value: dp[r - 1][0] },
        { name: `dp[${r}][0]`, value: dp[r][0] },
      ],
      note: {
        vi: blocked
          ? `Ô (${r},0) bị chặn nên dp[${r}][0] = 0.`
          : `Cột đầu chỉ có thể đi từ trên xuống: dp[${r}][0] = dp[${r - 1}][0] = ${dp[r][0]}.`,
        en: blocked
          ? `Cell (${r},0) is blocked, so dp[${r}][0] = 0.`
          : `First column can only come from above: dp[${r}][0] = dp[${r - 1}][0] = ${dp[r][0]}.`,
      },
    });
  }

  for (let r = 1; r < m; r++) {
    gridSnap({
      title: { vi: `Vòng ngoài r=${r}`, en: `Outer loop r=${r}` },
      hlCell: [r, 1],
      codeLines: [12],
      vars: [{ name: "r", value: r }],
      note: {
        vi: `Bắt đầu xử lý các ô bên trong ở hàng ${r}.`,
        en: `Start processing inner cells in row ${r}.`,
      },
    });

    for (let c = 1; c < n; c++) {
      gridSnap({
        title: { vi: `Vòng trong c=${c}`, en: `Inner loop c=${c}` },
        hlCell: [r, c],
        pathCells: [[r - 1, c], [r, c - 1]],
        codeLines: [13],
        vars: [
          { name: "r", value: r },
          { name: "c", value: c },
        ],
        note: {
          vi: `Chuẩn bị tính dp[${r}][${c}] từ ô trên và ô trái, trừ khi ô này là vật cản.`,
          en: `Prepare to compute dp[${r}][${c}] from top and left, unless this cell is blocked.`,
        },
      });

      const blocked = obstacleGrid[r][c] === 1;
      const fromTop = dp[r - 1][c];
      const fromLeft = dp[r][c - 1];
      gridSnap({
        title: { vi: `Kiểm tra obstacle tại (${r},${c})`, en: `Check obstacle at (${r},${c})` },
        hlCell: [r, c],
        codeLines: [14],
        vars: [
          { name: `obstacleGrid[${r}][${c}]`, value: obstacleGrid[r][c] },
          { name: "blocked?", value: blocked },
        ],
        note: {
          vi: blocked
            ? `Ô (${r},${c}) là vật cản, đi vào nhánh if.`
            : `Ô (${r},${c}) không bị chặn, đi vào nhánh else.`,
          en: blocked
            ? `Cell (${r},${c}) is an obstacle, take the if branch.`
            : `Cell (${r},${c}) is open, take the else branch.`,
        },
      });

      if (blocked) {
        dp[r][c] = 0;
        gridSnap({
          title: { vi: `dp[${r}][${c}] = 0`, en: `dp[${r}][${c}] = 0` },
          hlCell: [r, c],
          codeLines: [15],
          vars: [
            { name: "blocked?", value: true },
            { name: `dp[${r}][${c}]`, value: 0 },
          ],
          note: {
            vi: `Vật cản không thể đi qua, nên dp[${r}][${c}] = 0.`,
            en: `An obstacle cannot be crossed, so dp[${r}][${c}] = 0.`,
          },
        });
      } else {
        gridSnap({
          title: { vi: "Nhánh else", en: "Else branch" },
          hlCell: [r, c],
          pathCells: [[r - 1, c], [r, c - 1]],
          codeLines: [16],
          vars: [
            { name: "from top", value: fromTop },
            { name: "from left", value: fromLeft },
          ],
          note: {
            vi: "Ô trống nên cộng số đường đi từ trên và từ trái.",
            en: "The cell is open, so add paths from above and from the left.",
          },
        });

        dp[r][c] = fromTop + fromLeft;
        gridSnap({
          title: { vi: `dp[${r}][${c}] = ${dp[r][c]}`, en: `dp[${r}][${c}] = ${dp[r][c]}` },
          hlCell: [r, c],
          pathCells: [[r - 1, c], [r, c - 1]],
          codeLines: [17],
          vars: [
            { name: "from top", value: fromTop },
            { name: "from left", value: fromLeft },
            { name: `dp[${r}][${c}]`, value: dp[r][c] },
          ],
          note: {
            vi: `dp[${r}][${c}] = dp[${r - 1}][${c}] + dp[${r}][${c - 1}] = ${fromTop} + ${fromLeft} = ${dp[r][c]}.`,
            en: `dp[${r}][${c}] = dp[${r - 1}][${c}] + dp[${r}][${c - 1}] = ${fromTop} + ${fromLeft} = ${dp[r][c]}.`,
          },
        });
      }
    }
  }

  const answer = dp[m - 1][n - 1];
  gridSnap({
    title: { vi: "Kết quả", en: "Result" },
    hlCell: [m - 1, n - 1],
    codeLines: [18],
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `Số đường đi hợp lệ từ (0,0) đến (${m - 1},${n - 1}) = ${answer}.`,
      en: `Valid paths from (0,0) to (${m - 1},${n - 1}) = ${answer}.`,
    },
  });
  steps[steps.length - 1].final = true;

  return { original: obstacleGrid, answer, steps };
}

/**
 * LeetCode 64: Minimum Path Sum.
 * dp[r][c] = min cost to reach (r,c) from (0,0), only moving right or down.
 * dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1]).
 */
function buildSteps64(input, params) {
  // Parse grid: input is string "1,3,1|1,5,1|4,2,1" or flat array with rows/cols
  let grid;
  if (typeof input === "string") {
    grid = input.split("|").map((row) => row.split(",").map(Number));
  } else {
    const rows = params.rows || 3;
    const cols = params.cols || Math.ceil(input.length / rows);
    grid = [];
    for (let r = 0; r < rows; r++) grid.push(input.slice(r * cols, (r + 1) * cols));
  }
  const m = grid.length;
  const n = grid[0].length;
  const dp = Array.from({ length: m }, () => new Array(n).fill(0));
  const steps = [];

  function makeDisplay() {
    const display = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(""));
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) display[r + 1][c + 1] = dp[r][c];
    }
    return display;
  }

  function shiftCell(cell) {
    return cell ? [cell[0] + 1, cell[1] + 1] : null;
  }

  function gridSnap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: makeDisplay(),
        text1: Array.from({ length: m }, (_, r) => String(r)).join(""),
        text2: Array.from({ length: n }, (_, c) => String(c)).join(""),
        hlCell: shiftCell(opts.hlCell || null),
        pathCells: (opts.pathCells || []).map(shiftCell).filter(Boolean),
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  gridSnap({
    title: { vi: "Lay kich thuoc m, n", en: "Read sizes m, n" },
    codeLines: [3],
    vars: [{ name: "m", value: m }, { name: "n", value: n }],
    note: {
      vi: `Grid ${m}x${n}. dp[r][c] = chi phi nho nhat de di tu (0,0) den (r,c).`,
      en: `Grid ${m}x${n}. dp[r][c] = minimum cost to move from (0,0) to (r,c).`,
    },
  });

  gridSnap({
    title: { vi: "Tao bang dp toan 0", en: "Create zero-filled dp table" },
    codeLines: [4],
    vars: [{ name: "dp size", value: `${m} x ${n}` }],
    note: {
      vi: "Khoi tao dp bang 0, roi dien base, hang dau, cot dau va phan con lai.",
      en: "Initialize dp with 0, then fill the base cell, first row, first column, and remaining cells.",
    },
  });

  dp[0][0] = grid[0][0];
  gridSnap({
    title: { vi: `dp[0][0] = grid[0][0] = ${dp[0][0]}`, en: `dp[0][0] = grid[0][0] = ${dp[0][0]}` },
    hlCell: [0, 0],
    codeLines: [5],
    vars: [
      { name: "grid[0][0]", value: grid[0][0] },
      { name: "dp[0][0]", value: dp[0][0] },
    ],
    note: {
      vi: "O bat dau chi co chi phi cua chinh no.",
      en: "The start cell has only its own cost.",
    },
  });

  for (let c = 1; c < n; c++) {
    dp[0][c] = dp[0][c - 1] + grid[0][c];
    gridSnap({
      title: { vi: `Hang dau: dp[0][${c}] = ${dp[0][c]}`, en: `First row: dp[0][${c}] = ${dp[0][c]}` },
      hlCell: [0, c],
      pathCells: [[0, c - 1]],
      codeLines: [6],
      vars: [
        { name: "c", value: c },
        { name: `dp[0][${c - 1}]`, value: dp[0][c - 1] },
        { name: `grid[0][${c}]`, value: grid[0][c] },
        { name: `dp[0][${c}]`, value: dp[0][c] },
      ],
      note: {
        vi: `Hang dau chi di tu trai sang: dp[0][${c}] = dp[0][${c - 1}] + grid[0][${c}] = ${dp[0][c - 1]} + ${grid[0][c]} = ${dp[0][c]}.`,
        en: `The first row can only come from the left: dp[0][${c}] = dp[0][${c - 1}] + grid[0][${c}] = ${dp[0][c - 1]} + ${grid[0][c]} = ${dp[0][c]}.`,
      },
    });
  }

  for (let r = 1; r < m; r++) {
    dp[r][0] = dp[r - 1][0] + grid[r][0];
    gridSnap({
      title: { vi: `Cot dau: dp[${r}][0] = ${dp[r][0]}`, en: `First column: dp[${r}][0] = ${dp[r][0]}` },
      hlCell: [r, 0],
      pathCells: [[r - 1, 0]],
      codeLines: [7],
      vars: [
        { name: "r", value: r },
        { name: `dp[${r - 1}][0]`, value: dp[r - 1][0] },
        { name: `grid[${r}][0]`, value: grid[r][0] },
        { name: `dp[${r}][0]`, value: dp[r][0] },
      ],
      note: {
        vi: `Cot dau chi di tu tren xuong: dp[${r}][0] = dp[${r - 1}][0] + grid[${r}][0] = ${dp[r - 1][0]} + ${grid[r][0]} = ${dp[r][0]}.`,
        en: `The first column can only come from above: dp[${r}][0] = dp[${r - 1}][0] + grid[${r}][0] = ${dp[r - 1][0]} + ${grid[r][0]} = ${dp[r][0]}.`,
      },
    });
  }

  for (let r = 1; r < m; r++) {
    gridSnap({
      title: { vi: `Vong ngoai r=${r}`, en: `Outer loop r=${r}` },
      hlCell: [r, 1],
      codeLines: [8],
      vars: [{ name: "r", value: r }],
      note: {
        vi: `Bat dau xu ly cac o ben trong o hang ${r}.`,
        en: `Start processing inner cells in row ${r}.`,
      },
    });

    for (let c = 1; c < n; c++) {
      gridSnap({
        title: { vi: `Vong trong c=${c}`, en: `Inner loop c=${c}` },
        hlCell: [r, c],
        pathCells: [[r - 1, c], [r, c - 1]],
        codeLines: [9],
        vars: [
          { name: "r", value: r },
          { name: "c", value: c },
        ],
        note: {
          vi: `Chuan bi tinh dp[${r}][${c}] tu o tren va o trai.`,
          en: `Prepare to compute dp[${r}][${c}] from the top and left cells.`,
        },
      });

      const fromTop = dp[r - 1][c];
      const fromLeft = dp[r][c - 1];
      dp[r][c] = grid[r][c] + Math.min(fromTop, fromLeft);
      const dir = fromTop <= fromLeft ? "top" : "left";

      gridSnap({
        title: { vi: `dp[${r}][${c}]`, en: `dp[${r}][${c}]` },
        hlCell: [r, c],
        pathCells: [[r - 1, c], [r, c - 1]],
        codeLines: [10],
        vars: [
          { name: "r", value: r },
          { name: "c", value: c },
          { name: "grid[r][c]", value: grid[r][c] },
          { name: "from top", value: fromTop },
          { name: "from left", value: fromLeft },
          { name: "dp[r][c]", value: dp[r][c] },
          { name: "direction", value: dir },
        ],
        note: {
          vi: `dp[${r}][${c}] = grid[${r}][${c}] + min(dp[${r - 1}][${c}], dp[${r}][${c - 1}]) = ${grid[r][c]} + min(${fromTop}, ${fromLeft}) = ${dp[r][c]} (tu ${dir === "top" ? "tren" : "trai"}).`,
          en: `dp[${r}][${c}] = grid[${r}][${c}] + min(dp[${r - 1}][${c}], dp[${r}][${c - 1}]) = ${grid[r][c]} + min(${fromTop}, ${fromLeft}) = ${dp[r][c]} (from ${dir}).`,
        },
      });
    }
  }

  const pathCells = [[m - 1, n - 1]];
  let r = m - 1, c = n - 1;
  while (r > 0 || c > 0) {
    if (r === 0) { c--; }
    else if (c === 0) { r--; }
    else if (dp[r - 1][c] <= dp[r][c - 1]) { r--; }
    else { c--; }
    pathCells.push([r, c]);
  }
  pathCells.reverse();

  const answer = dp[m - 1][n - 1];
  gridSnap({
    title: { vi: "Ket qua", en: "Result" },
    hlCell: [m - 1, n - 1],
    pathCells,
    codeLines: [11],
    vars: [
      { name: "answer", value: answer },
      { name: "path", value: pathCells.map(([r, c]) => `(${r},${c})`).join("->") },
    ],
    note: {
      vi: `Chi phi nho nhat = ${answer}. Duong di: ${pathCells.map(([r, c]) => grid[r][c]).join("+")} = ${answer}.`,
      en: `Minimum path sum = ${answer}. Path: ${pathCells.map(([r, c]) => grid[r][c]).join("+")} = ${answer}.`,
    },
  });
  steps[steps.length - 1].final = true;

  return { original: grid, answer, steps };
}
/**
 * LeetCode 120: Triangle.
 * Bottom-up DP: dp[r][c] = triangle[r][c] + min(dp[r+1][c], dp[r+1][c+1]).
 * Start from the bottom row, work up to dp[0][0].
 * Uses grid view to show the triangle filling from bottom.
 */
function buildSteps120(input) {
  // Parse triangle: "2|3,4|6,5,7|4,1,8,3" (rows separated by |)
  let triangle;
  if (typeof input === "string") {
    triangle = input.split("|").map((row) => row.split(",").map(Number));
  } else {
    triangle = [[input[0] || 2], [3, 4], [6, 5, 7], [4, 1, 8, 3]];
  }
  const n = triangle.length;
  const steps = [];

  // Pad to make rectangular grid for display
  const maxCols = triangle[n - 1].length;
  const dp = triangle.map((row) => [...row]);

  function gridSnap(opts) {
    // Build a padded grid for display
    const displayDp = [];
    for (let r = 0; r < n; r++) {
      const row = new Array(maxCols).fill(null);
      for (let c = 0; c < dp[r].length; c++) row[c] = dp[r][c];
      displayDp.push(row.map((v) => (v === null ? "" : v)));
    }
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: displayDp,
        text1: Array.from({ length: n }, (_, r) => String(r)).join(""),
        text2: Array.from({ length: maxCols }, (_, c) => String(c)).join(""),
        hlCell: opts.hlCell || null,
        pathCells: opts.pathCells || [],
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  gridSnap({
    title: { vi: "Tam giác ban đầu", en: "Initial triangle" },
    codeLines: [3],
    vars: [{ name: "rows", value: n }],
    note: {
      vi: `Tam giác ${n} hàng. DP bottom-up:\ndp[r][c] = triangle[r][c] + min(dp[r+1][c], dp[r+1][c+1]).\nBắt đầu từ hàng cuối (đã là chính nó), lên hàng 0.`,
      en: `Triangle with ${n} rows. Bottom-up DP:\ndp[r][c] = triangle[r][c] + min(dp[r+1][c], dp[r+1][c+1]).\nStart from bottom row (unchanged), work up to row 0.`,
    },
  });

  // Bottom-up: from row n-2 up to 0
  for (let r = n - 2; r >= 0; r--) {
    gridSnap({
      title: { vi: `Hang r=${r}`, en: `Row r=${r}` },
      hlCell: [r, 0],
      codeLines: [4],
      vars: [{ name: "r", value: r }],
      note: {
        vi: `Bat dau xu ly hang ${r}. Moi o se lay min cua 2 o ke ben duoi.`,
        en: `Start processing row ${r}. Each cell will use the minimum of the two adjacent cells below.`,
      },
    });

    for (let c = 0; c <= r; c++) {
      const below = dp[r + 1][c];
      const belowRight = dp[r + 1][c + 1];
      gridSnap({
        title: { vi: `Chon o c=${c}`, en: `Choose cell c=${c}` },
        hlCell: [r, c],
        pathCells: [[r + 1, c], [r + 1, c + 1]],
        codeLines: [5],
        vars: [
          { name: "r", value: r },
          { name: "c", value: c },
          { name: "tri[r][c]", value: triangle[r][c] },
          { name: "dp[r+1][c]", value: below },
          { name: "dp[r+1][c+1]", value: belowRight },
        ],
        note: {
          vi: `Chuan bi tinh dp[${r}][${c}] tu 2 o ben duoi: ${below} va ${belowRight}.`,
          en: `Prepare to compute dp[${r}][${c}] from the two cells below: ${below} and ${belowRight}.`,
        },
      });

      dp[r][c] = triangle[r][c] + Math.min(below, belowRight);
      const dir = below <= belowRight ? "↓" : "↘";

      gridSnap({
        title: { vi: `dp[${r}][${c}]`, en: `dp[${r}][${c}]` },
        hlCell: [r, c],
        pathCells: [[r + 1, c], [r + 1, c + 1]],
        codeLines: [6],
        vars: [
          { name: "r", value: r },
          { name: "c", value: c },
          { name: "tri[r][c]", value: triangle[r][c] },
          { name: "dp[r+1][c]", value: below },
          { name: "dp[r+1][c+1]", value: belowRight },
          { name: "dp[r][c]", value: dp[r][c] },
        ],
        note: {
          vi: `dp[${r}][${c}] = ${triangle[r][c]} + min(${below}, ${belowRight}) = ${triangle[r][c]} + ${Math.min(below, belowRight)} = ${dp[r][c]} (${dir}).`,
          en: `dp[${r}][${c}] = ${triangle[r][c]} + min(${below}, ${belowRight}) = ${triangle[r][c]} + ${Math.min(below, belowRight)} = ${dp[r][c]} (${dir}).`,
        },
      });
    }
  }

  // Trace path from top
  const pathCells = [[0, 0]];
  let pc = 0;
  for (let r = 0; r < n - 1; r++) {
    if (dp[r + 1][pc] <= dp[r + 1][pc + 1]) {
      pathCells.push([r + 1, pc]);
    } else {
      pc++;
      pathCells.push([r + 1, pc]);
    }
  }

  const answer = dp[0][0];
  gridSnap({
    title: { vi: "Kết quả", en: "Result" },
    hlCell: [0, 0],
    pathCells,
    codeLines: [7],
    vars: [
      { name: "answer", value: answer },
      { name: "path", value: pathCells.map(([r, c]) => triangle[r][c]).join(" → ") },
    ],
    note: {
      vi: `Tổng nhỏ nhất = ${answer}. Đường: ${pathCells.map(([r, c]) => triangle[r][c]).join(" + ")} = ${answer}.`,
      en: `Minimum path sum = ${answer}. Path: ${pathCells.map(([r, c]) => triangle[r][c]).join(" + ")} = ${answer}.`,
    },
  });
  steps[steps.length - 1].final = true;

  return { original: triangle, answer, steps };
}

/**
 * LeetCode 741: Cherry Pickup.
 * Two simultaneous walkers from (0,0) to (n-1,n-1).
 * State dp[c1][c2] for step t = r1+c1 = r2+c2 (r1 = t-c1, r2 = t-c2).
 * Visualization shows the grid + the two walker positions at each step.
 */
function buildSteps741(input) {
  // Parse grid: "0,1,-1|1,0,-1|1,1,1" → [[0,1,-1],[1,0,-1],[1,1,1]]
  const grid = String(input).split("|").map((row) => row.trim().split(",").map(Number));
  const n = grid.length;
  const steps = [];
  const NEG = -Infinity;

  const cellLabel = (v) => (v === -1 ? "✗" : v === 1 ? "🍒" : "·");

  function makeGrid(hlCells, pathCells) {
    return {
      dp: grid.map((row) => row.map((v) => cellLabel(v))),
      text1: Array.from({ length: n }, (_, i) => `r${i}`),
      text2: Array.from({ length: n }, (_, i) => `c${i}`),
      hlCell: null,
      pathCells: hlCells || [],
      // reuse pathCells for highlighting both walkers
      _extraPath: pathCells || [],
    };
  }

  // Intro
  steps.push({
    title: { vi: "Đề bài", en: "Problem" },
    arr: [],
    grid: makeGrid([]),
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "n", value: n },
      { name: "cells", value: "🍒=cherry(1), ✗=thorn(-1), ·=empty(0)" },
    ],
    note: {
      vi:
        `Lưới ${n}×${n}: 1=anh đào 🍒, 0=trống, -1=gai (không đi được).\n` +
        `Đi từ (0,0) → (n-1,n-1) (chỉ phải/xuống), nhặt anh đào (ô thành 0), rồi quay về (0,0) (chỉ trái/lên).\n` +
        `Tối đa hóa số anh đào nhặt được.`,
      en:
        `Grid ${n}×${n}: 1=cherry 🍒, 0=empty, -1=thorn (blocked).\n` +
        `Go (0,0) → (n-1,n-1) (right/down only), pick cherries (cell becomes 0), then return to (0,0) (left/up).\n` +
        `Maximize cherries collected.`,
    },
  });

  // Key trick step
  steps.push({
    title: { vi: "Mẹo: 2 người cùng đi", en: "Trick: two simultaneous walkers" },
    arr: [],
    grid: makeGrid([[0, 0]]),
    highlight: [],
    mark: [],
    codeLines: [6],
    vars: [
      { name: "walker A", value: "(r1, c1)" },
      { name: "walker B", value: "(r2, c2)" },
      { name: "constraint", value: "r1+c1 == r2+c2 == t" },
    ],
    note: {
      vi:
        `Thay vì đi-rồi-về, coi như HAI người cùng xuất phát (0,0) → (n-1,n-1).\n` +
        `Cả hai đi cùng số bước t = r+c. Nên r1+c1 = r2+c2 = t → chỉ cần 3 biến (t, c1, c2).\n` +
        `Nếu hai người ở cùng ô → chỉ tính anh đào 1 lần.`,
      en:
        `Instead of go-then-return, treat as TWO walkers both going (0,0) → (n-1,n-1).\n` +
        `Both take t = r+c steps. So r1+c1 = r2+c2 = t → only 3 vars needed (t, c1, c2).\n` +
        `If both on the same cell → count its cherry once.`,
    },
  });

  // DP with memoization
  const memo = new Map();
  const key = (r1, c1, c2) => `${r1},${c1},${c2}`;

  function dfs(r1, c1, c2) {
    const r2 = r1 + c1 - c2;
    // Out of bounds or thorn
    if (r1 >= n || c1 >= n || r2 >= n || c2 >= n || grid[r1][c1] === -1 || grid[r2][c2] === -1) {
      return NEG;
    }
    // Reached destination
    if (r1 === n - 1 && c1 === n - 1) {
      return grid[r1][c1];
    }
    const k = key(r1, c1, c2);
    if (memo.has(k)) return memo.get(k);

    // Cherries at current positions
    let cherries = grid[r1][c1];
    if (c1 !== c2) cherries += grid[r2][c2];

    // Two walkers each move right or down: 4 combinations
    const best = Math.max(
      dfs(r1, c1 + 1, c2 + 1), // both right
      dfs(r1 + 1, c1, c2 + 1), // A down, B right
      dfs(r1, c1 + 1, c2),     // A right, B down
      dfs(r1 + 1, c1, c2),     // both down
    );

    const result = best === NEG ? NEG : cherries + best;
    memo.set(k, result);
    return result;
  }

  const raw = dfs(0, 0, 0);
  const answer = Math.max(0, raw === NEG ? 0 : raw);

  // Reconstruct the two paths for visualization
  const pathA = [];
  const pathB = [];
  if (answer > 0 || raw !== NEG) {
    let r1 = 0, c1 = 0, c2 = 0;
    while (true) {
      pathA.push([r1, c1]);
      const r2 = r1 + c1 - c2;
      pathB.push([r2, c2]);
      if (r1 === n - 1 && c1 === n - 1) break;
      // Choose the move that matches the optimal value
      const moves = [
        [r1, c1 + 1, c2 + 1],
        [r1 + 1, c1, c2 + 1],
        [r1, c1 + 1, c2],
        [r1 + 1, c1, c2],
      ];
      let chosen = null;
      let bestVal = NEG;
      for (const [nr1, nc1, nc2] of moves) {
        const nr2 = nr1 + nc1 - nc2;
        if (nr1 >= n || nc1 >= n || nr2 >= n || nc2 >= n) continue;
        if (grid[nr1][nc1] === -1 || grid[nr2][nc2] === -1) continue;
        const v = memo.has(key(nr1, nc1, nc2)) ? memo.get(key(nr1, nc1, nc2)) : dfs(nr1, nc1, nc2);
        if (v > bestVal) { bestVal = v; chosen = [nr1, nc1, nc2]; }
      }
      if (!chosen) break;
      [r1, c1, c2] = chosen;
    }
  }

  // Show a few key path steps
  const totalT = 2 * (n - 1);
  const shown = Math.min(pathA.length, 6);
  for (let idx = 0; idx < pathA.length; idx++) {
    // Only show a handful of evenly-spaced steps to keep it concise
    if (pathA.length > 6 && idx % Math.ceil(pathA.length / 6) !== 0 && idx !== pathA.length - 1) continue;
    const [ar, ac] = pathA[idx];
    const [br, bc] = pathB[idx];
    const t = ar + ac;
    const hl = ac === bc ? [[ar, ac]] : [[ar, ac], [br, bc]];

    // Line 7: r2 = r1 + c1 - c2
    steps.push({
      title: { vi: `t=${t}: r2 = ${ar}+${ac}-${bc} = ${br}`, en: `t=${t}: r2 = ${ar}+${ac}-${bc} = ${br}` },
      arr: [],
      grid: makeGrid(hl, pathA.slice(0, idx + 1)),
      highlight: [],
      mark: [],
      codeLines: [7],
      vars: [
        { name: "t", value: t },
        { name: "r1, c1", value: `(${ar}, ${ac})` },
        { name: "c2", value: bc },
        { name: "r2 = r1+c1-c2", value: `${ar}+${ac}-${bc} = ${br}` },
      ],
      note: {
        vi: `Bước t=${t}: A ở (${ar},${ac}). Từ c2=${bc} → r2 = ${ar}+${ac}-${bc} = ${br}. B ở (${br},${bc}).`,
        en: `Step t=${t}: A at (${ar},${ac}). From c2=${bc} → r2 = ${ar}+${ac}-${bc} = ${br}. B at (${br},${bc}).`,
      },
    });

    // Line 13: cherries = grid[r1][c1]
    const cherriesA = grid[ar][ac] === 1 ? 1 : 0;
    const cherriesB = (ac !== bc && grid[br][bc] === 1) ? 1 : 0;
    const totalCherries = cherriesA + cherriesB;

    steps.push({
      title: { vi: `cherries = ${cherriesA}${ac !== bc ? ` + ${cherriesB} = ${totalCherries}` : " (cùng ô)"}`, en: `cherries = ${cherriesA}${ac !== bc ? ` + ${cherriesB} = ${totalCherries}` : " (same cell)"}` },
      arr: [],
      grid: makeGrid(hl, pathA.slice(0, idx + 1)),
      highlight: [],
      mark: [],
      codeLines: [13],
      vars: [
        { name: "grid[r1][c1]", value: grid[ar][ac] },
        { name: "same cell?", value: ac === bc },
        { name: "cherries", value: totalCherries },
      ],
      note: {
        vi: ac === bc
          ? `Cùng ô → chỉ tính 1 lần: cherries = ${cherriesA}.`
          : `Khác ô → cộng cả hai: grid[${ar}][${ac}]=${grid[ar][ac]}, grid[${br}][${bc}]=${grid[br][bc]}. Tổng = ${totalCherries}.`,
        en: ac === bc
          ? `Same cell → count once: cherries = ${cherriesA}.`
          : `Different cells → add both: grid[${ar}][${ac}]=${grid[ar][ac]}, grid[${br}][${bc}]=${grid[br][bc]}. Total = ${totalCherries}.`,
      },
    });

    // Line 15: cherries += max(4 transitions)
    if (idx < pathA.length - 1) {
      steps.push({
        title: { vi: `Chọn best trong 4 hướng`, en: `Pick best from 4 directions` },
        arr: [],
        grid: makeGrid(hl, pathA.slice(0, idx + 1)),
        highlight: [],
        mark: [],
        codeLines: [15],
        vars: [
          { name: "transitions", value: "RR, DR, RD, DD" },
          { name: "next A", value: `(${pathA[idx+1][0]}, ${pathA[idx+1][1]})` },
          { name: "next B", value: `(${pathB[idx+1][0]}, ${pathB[idx+1][1]})` },
        ],
        note: {
          vi: `4 tổ hợp: A↓B↓, A↓B→, A→B↓, A→B→. Chọn tổ hợp cho giá trị dp lớn nhất.`,
          en: `4 combinations: A↓B↓, A↓B→, A→B↓, A→B→. Choose combination with max dp value.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: [],
    grid: makeGrid([], pathA),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [18],
    vars: [
      { name: "answer", value: answer },
      { name: "states memoized", value: memo.size },
    ],
    note: {
      vi:
        `Số anh đào tối đa nhặt được = ${answer}.\n` +
        (raw === NEG ? "(Không có đường đi hợp lệ → 0)" : `Đã memo ${memo.size} trạng thái.`),
      en:
        `Maximum cherries collected = ${answer}.\n` +
        (raw === NEG ? "(No valid path → 0)" : `Memoized ${memo.size} states.`),
    },
  });

  return { original: grid, answer, steps };
}

/**
 * LeetCode 931: Minimum Falling Path Sum.
 * dp[r][c] = matrix[r][c] + min(dp[r-1][c-1], dp[r-1][c], dp[r-1][c+1]).
 * First row = matrix first row. Answer = min of last row.
 */
function buildSteps931(input) {
  let matrix;
  if (typeof input === "string") {
    matrix = input.split("|").map((row) => row.split(",").map(Number));
  } else {
    return { original: input, answer: 0, steps: [] };
  }
  const m = matrix.length;
  const n = matrix[0].length;
  const dp = matrix.map((row) => [...row]);
  const steps = [];

  function gridSnap(opts) {
    steps.push({
      title: opts.title, arr: [],
      grid: { dp: dp.map((r) => [...r]), text1: Array.from({length: m}, (_, i) => String(i)).join(""), text2: Array.from({length: n}, (_, i) => String(i)).join(""), hlCell: opts.hlCell || null, pathCells: opts.pathCells || [] },
      highlight: [], mark: [], codeLines: opts.codeLines || [], vars: opts.vars || [], note: opts.note,
    });
  }

  gridSnap({
    title: { vi: "Khởi tạo (hàng đầu)", en: "Initialize (first row)" },
    codeLines: [3, 4],
    vars: [{ name: "m", value: m }, { name: "n", value: n }],
    note: { vi: `Lưới ${m}×${n}. Hàng đầu giữ nguyên.\ndp[r][c] = matrix[r][c] + min(dp[r-1][c-1], dp[r-1][c], dp[r-1][c+1]).\nĐáp án = min(hàng cuối).`, en: `Grid ${m}×${n}. First row unchanged.\ndp[r][c] = matrix[r][c] + min(dp[r-1][c-1], dp[r-1][c], dp[r-1][c+1]).\nAnswer = min(last row).` },
  });

  for (let r = 1; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const candidates = [];
      if (c > 0) candidates.push(dp[r - 1][c - 1]);
      candidates.push(dp[r - 1][c]);
      if (c < n - 1) candidates.push(dp[r - 1][c + 1]);
      dp[r][c] = matrix[r][c] + Math.min(...candidates);

      if (m * n <= 25 || c === 0 || c === n - 1 || (r === m - 1)) {
        gridSnap({
          title: { vi: `dp[${r}][${c}]`, en: `dp[${r}][${c}]` },
          hlCell: [r, c], codeLines: [5, 6, 7],
          vars: [{ name: "r", value: r }, { name: "c", value: c }, { name: "matrix[r][c]", value: matrix[r][c] }, { name: "min above", value: Math.min(...candidates) }, { name: "dp[r][c]", value: dp[r][c] }],
          note: { vi: `dp[${r}][${c}] = ${matrix[r][c]} + min(${candidates.join(",")}) = ${dp[r][c]}.`, en: `dp[${r}][${c}] = ${matrix[r][c]} + min(${candidates.join(",")}) = ${dp[r][c]}.` },
        });
      }
    }
  }

  const lastRow = dp[m - 1];
  const answer = Math.min(...lastRow);
  const bestCol = lastRow.indexOf(answer);
  // Trace back
  const pathCells = [[m - 1, bestCol]];
  let pc = bestCol;
  for (let r = m - 1; r > 0; r--) {
    const cands = [];
    if (pc > 0) cands.push([dp[r - 1][pc - 1], pc - 1]);
    cands.push([dp[r - 1][pc], pc]);
    if (pc < n - 1) cands.push([dp[r - 1][pc + 1], pc + 1]);
    cands.sort((a, b) => a[0] - b[0]);
    pc = cands[0][1];
    pathCells.push([r - 1, pc]);
  }
  pathCells.reverse();

  gridSnap({
    title: { vi: "Kết quả", en: "Result" }, hlCell: null, pathCells, codeLines: [8],
    vars: [{ name: "answer", value: answer }, { name: "path", value: pathCells.map(([r, c]) => matrix[r][c]).join("+") + "=" + answer }],
    note: { vi: `Min falling path = ${answer}. Đường: ${pathCells.map(([r, c]) => matrix[r][c]).join("+")} = ${answer}.`, en: `Min falling path = ${answer}. Path: ${pathCells.map(([r, c]) => matrix[r][c]).join("+")} = ${answer}.` },
  });
  steps[steps.length - 1].final = true;
  return { original: matrix, answer, steps };
}

/**
 * LeetCode 1937: Maximum Number of Points with Cost.
 * prev[c] = best score ending at column c on the previous row.
 * Transition:
 *   curr[c] = points[r][c] + max(prev[k] - abs(k-c)).
 * Optimize the max with two passes:
 *   left[c]  = max(prev[k] - (c-k)) for k <= c
 *   right[c] = max(prev[k] - (k-c)) for k >= c
 */
function buildSteps1937(input) {
  let points;
  if (typeof input === "string") {
    points = input
      .split("|")
      .map((row) => row.trim())
      .filter(Boolean)
      .map((row) => row.split(",").map((x) => Number(x.trim())));
  } else {
    return { original: input, answer: 0, steps: [] };
  }

  const m = points.length;
  const n = m > 0 ? points[0].length : 0;
  const valid = m > 0 && n > 0 && points.every((row) => row.length === n && row.every(Number.isFinite));
  const steps = [];

  if (!valid) {
    steps.push({
      title: { vi: "Input khong hop le", en: "Invalid input" },
      arr: [],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "Nhap matrix bang cac hang cach nhau boi |, so cach nhau boi dau phay. Vi du: 1,2,3|1,5,1|3,1,1",
        en: "Enter a matrix with rows separated by | and numbers separated by commas. Example: 1,2,3|1,5,1|3,1,1",
      },
      final: true,
    });
    return { original: points, answer: 0, steps };
  }

  let prev = [...points[0]];
  let left = Array(n).fill("");
  let right = Array(n).fill("");
  let curr = Array(n).fill("");

  function rowLabels(r) {
    return [
      { index: `points[${r}]`, char: "row" },
      { index: "prev", char: "dp" },
      { index: "left", char: "L" },
      { index: "right", char: "R" },
      { index: "curr", char: "new" },
    ];
  }

  function gridSnap(opts) {
    const r = opts.r === undefined ? 0 : opts.r;
    steps.push({
      title: opts.title,
      arr: points[r] ? [...points[r]] : [],
      sub: Array.from({ length: n }, (_, c) => `col ${c}`),
      highlight: opts.c === undefined ? [] : [opts.c],
      mark: opts.mark || [],
      grid: {
        dp: [
          [...points[r]],
          [...prev],
          [...left],
          [...right],
          [...curr],
        ],
        rowLabels: rowLabels(r),
        colLabels: Array.from({ length: n }, (_, c) => ({ index: `c=${c}`, char: "" })),
        largeCells: true,
        hlCell: opts.hlCell || null,
        pathCells: opts.pathCells || [],
        cellLabels: opts.cellLabels || {},
      },
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
      final: opts.final || false,
    });
  }

  gridSnap({
    title: { vi: "Khoi tao prev = points[0]", en: "Initialize prev = points[0]" },
    r: 0,
    codeLines: [3],
    pathCells: Array.from({ length: n }, (_, c) => [1, c]),
    vars: [
      { name: "m", value: m },
      { name: "n", value: n },
      { name: "prev", value: `[${prev.join(", ")}]` },
    ],
    note: {
      vi: "Hang dau tien khong co cost tu hang truoc, nen prev bang points[0].",
      en: "The first row has no transition cost, so prev is just points[0].",
    },
  });

  for (let r = 1; r < m; r++) {
    left = Array(n).fill("");
    right = Array(n).fill("");
    curr = Array(n).fill("");

    gridSnap({
      title: { vi: `Xu ly row ${r}`, en: `Process row ${r}` },
      r,
      codeLines: [4],
      vars: [
        { name: "row", value: r },
        { name: "points[row]", value: `[${points[r].join(", ")}]` },
        { name: "prev", value: `[${prev.join(", ")}]` },
      ],
      note: {
        vi: "Can tinh max(prev[k] - abs(k-c)) cho moi cot c.",
        en: "For each column c, compute max(prev[k] - abs(k-c)).",
      },
    });

    left[0] = prev[0];
    gridSnap({
      title: { vi: `left[0] = prev[0] = ${left[0]}`, en: `left[0] = prev[0] = ${left[0]}` },
      r,
      c: 0,
      codeLines: [5],
      hlCell: [2, 0],
      pathCells: [[1, 0]],
      cellLabels: { "1,0": "prev[0]" },
      vars: [{ name: "left[0]", value: left[0] }],
      note: {
        vi: "Tu ben trai, cot 0 chi co the lay prev[0].",
        en: "From the left pass, column 0 can only use prev[0].",
      },
    });

    for (let c = 1; c < n; c++) {
      const carry = Number(left[c - 1]) - 1;
      left[c] = Math.max(carry, prev[c]);
      gridSnap({
        title: { vi: `left[${c}] = ${left[c]}`, en: `left[${c}] = ${left[c]}` },
        r,
        c,
        codeLines: [7, 8],
        hlCell: [2, c],
        pathCells: [[2, c - 1], [1, c]],
        cellLabels: { [`2,${c - 1}`]: "left[c-1]-1", [`1,${c}`]: "prev[c]" },
        vars: [
          { name: `left[${c - 1}] - 1`, value: carry },
          { name: `prev[${c}]`, value: prev[c] },
          { name: `left[${c}]`, value: left[c] },
        ],
        note: {
          vi: `left[${c}] = max(left[${c - 1}] - 1, prev[${c}]) = max(${carry}, ${prev[c]}) = ${left[c]}.`,
          en: `left[${c}] = max(left[${c - 1}] - 1, prev[${c}]) = max(${carry}, ${prev[c]}) = ${left[c]}.`,
        },
      });
    }

    right[n - 1] = prev[n - 1];
    gridSnap({
      title: { vi: `right[${n - 1}] = prev[${n - 1}] = ${right[n - 1]}`, en: `right[${n - 1}] = prev[${n - 1}] = ${right[n - 1]}` },
      r,
      c: n - 1,
      codeLines: [9, 10],
      hlCell: [3, n - 1],
      pathCells: [[1, n - 1]],
      cellLabels: { [`1,${n - 1}`]: `prev[${n - 1}]` },
      vars: [{ name: `right[${n - 1}]`, value: right[n - 1] }],
      note: {
        vi: "Tu ben phai, cot cuoi chi co the lay prev[cot cuoi].",
        en: "From the right pass, the last column can only use the last prev value.",
      },
    });

    for (let c = n - 2; c >= 0; c--) {
      const carry = Number(right[c + 1]) - 1;
      right[c] = Math.max(carry, prev[c]);
      gridSnap({
        title: { vi: `right[${c}] = ${right[c]}`, en: `right[${c}] = ${right[c]}` },
        r,
        c,
        codeLines: [11, 12],
        hlCell: [3, c],
        pathCells: [[3, c + 1], [1, c]],
        cellLabels: { [`3,${c + 1}`]: "right[c+1]-1", [`1,${c}`]: "prev[c]" },
        vars: [
          { name: `right[${c + 1}] - 1`, value: carry },
          { name: `prev[${c}]`, value: prev[c] },
          { name: `right[${c}]`, value: right[c] },
        ],
        note: {
          vi: `right[${c}] = max(right[${c + 1}] - 1, prev[${c}]) = max(${carry}, ${prev[c]}) = ${right[c]}.`,
          en: `right[${c}] = max(right[${c + 1}] - 1, prev[${c}]) = max(${carry}, ${prev[c]}) = ${right[c]}.`,
        },
      });
    }

    for (let c = 0; c < n; c++) {
      const bestPrev = Math.max(Number(left[c]), Number(right[c]));
      curr[c] = points[r][c] + bestPrev;
      gridSnap({
        title: { vi: `curr[${c}] = ${curr[c]}`, en: `curr[${c}] = ${curr[c]}` },
        r,
        c,
        codeLines: [13, 14, 15],
        hlCell: [4, c],
        pathCells: [[0, c], [2, c], [3, c]],
        cellLabels: { [`0,${c}`]: "points", [`2,${c}`]: "left", [`3,${c}`]: "right" },
        vars: [
          { name: `points[${r}][${c}]`, value: points[r][c] },
          { name: `max(left[${c}], right[${c}])`, value: bestPrev },
          { name: `curr[${c}]`, value: curr[c] },
        ],
        note: {
          vi: `curr[${c}] = points[${r}][${c}] + max(left[${c}], right[${c}]) = ${points[r][c]} + ${bestPrev} = ${curr[c]}.`,
          en: `curr[${c}] = points[${r}][${c}] + max(left[${c}], right[${c}]) = ${points[r][c]} + ${bestPrev} = ${curr[c]}.`,
        },
      });
    }

    prev = [...curr];
    gridSnap({
      title: { vi: `prev = curr sau row ${r}`, en: `prev = curr after row ${r}` },
      r,
      codeLines: [16],
      pathCells: Array.from({ length: n }, (_, c) => [4, c]),
      vars: [{ name: "prev", value: `[${prev.join(", ")}]` }],
      note: {
        vi: "Ket qua row hien tai tro thanh prev cho row tiep theo.",
        en: "The current row result becomes prev for the next row.",
      },
    });
  }

  const answer = Math.max(...prev);
  const bestCol = prev.indexOf(answer);
  gridSnap({
    title: { vi: `return ${answer}`, en: `return ${answer}` },
    r: m - 1,
    codeLines: [17],
    hlCell: [1, bestCol],
    pathCells: [[1, bestCol]],
    cellLabels: { [`1,${bestCol}`]: "max" },
    vars: [
      { name: "prev", value: `[${prev.join(", ")}]` },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Diem cao nhat o hang cuoi la max(prev) = ${answer}.`,
      en: `The best final score is max(prev) = ${answer}.`,
    },
    final: true,
  });

  return { original: points, answer, steps };
}

/**
 * LeetCode 72: Edit Distance (Levenshtein).
 * dp[i][j] = min operations to convert word1[0..i-1] to word2[0..j-1].
 * If word1[i-1] == word2[j-1]: dp[i][j] = dp[i-1][j-1] (no op).
 * Else: dp[i][j] = 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]).
 */
function buildSteps72Table(input, params) {
  const word1 = typeof input === "string" ? input : String(input);
  const word2 = (params.word2 || "").trim();
  const m = word1.length;
  const n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const steps = [];
  const charValue = (ch) => `'${ch}'`;
  const word1IndexValue = (i) => `word1[${i} - 1] = ${charValue(word1[i - 1])}`;
  const word2IndexValue = (j) => `word2[${j} - 1] = ${charValue(word2[j - 1])}`;

  function gridSnap(opts) {
    const hasActiveCell = Array.isArray(opts.hlCell);
    const currentVars = [];
    if (hasActiveCell) {
      currentVars.push({ name: "i", value: opts.hlCell[0] });
      currentVars.push({ name: "j", value: opts.hlCell[1] });
      if (opts.hlCell[0] > 0) {
        currentVars.push({ name: "word1[i - 1]", value: word1IndexValue(opts.hlCell[0]) });
      }
    }
    for (const item of opts.vars || []) {
      if ((item.name === "i" || item.name === "j") && hasActiveCell) continue;
      currentVars.push(item);
    }
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: dp.map((r) => [...r]),
        text1: word1,
        text2: word2,
        largeCells: true,
        rowLabels: Array.from({ length: m }, (_, idx) => ({ index: `i=${idx + 1}`, char: word1[idx] })),
        colLabels: Array.from({ length: n }, (_, idx) => ({ index: `j=${idx + 1}`, char: word2[idx] })),
        hlCell: opts.hlCell || null,
        pathCells: opts.pathCells || [],
        cellLabels: opts.cellLabels || {},
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: currentVars,
      note: opts.note,
    });
  }

  gridSnap({
    title: { vi: `m=${m}, n=${n}`, en: `m=${m}, n=${n}` },
    codeLines: [3],
    vars: [
      { name: "word1", value: word1 },
      { name: "word2", value: word2 },
      { name: "m", value: m },
      { name: "n", value: n },
    ],
    note: {
      vi: `m = len(word1) = ${m}, n = len(word2) = ${n}.`,
      en: `m = len(word1) = ${m}, n = len(word2) = ${n}.`,
    },
  });

  gridSnap({
    title: { vi: "Tao bang dp", en: "Create dp table" },
    codeLines: [6],
    vars: [
      { name: "dp size", value: `${m + 1} x ${n + 1}` },
      { name: "initial value", value: 0 },
    ],
    note: {
      vi: "dp[i][j] = so buoc it nhat de bien word1[:i] thanh word2[:j].",
      en: "dp[i][j] = minimum steps to convert word1[:i] into word2[:j].",
    },
  });

  for (let j = 0; j <= n; j++) {
    gridSnap({
      title: { vi: `Base word2 j=${j}`, en: `Base word2 j=${j}` },
      codeLines: [9],
      hlCell: [0, j],
      vars: [
        { name: "word2 prefix", value: `"${word2.slice(0, j)}"` },
      ],
      note: {
        vi: `Bien chuoi rong thanh "${word2.slice(0, j)}" can chen ${j} ky tu.`,
        en: `Converting empty string to "${word2.slice(0, j)}" needs ${j} insertion(s).`,
      },
    });
    dp[0][j] = j;
    gridSnap({
      title: { vi: `dp[0][${j}] = ${j}`, en: `dp[0][${j}] = ${j}` },
      codeLines: [10],
      hlCell: [0, j],
      vars: [{ name: `dp[0][${j}]`, value: dp[0][j] }],
      note: {
        vi: `Gan dp[0][${j}] = ${j}.`,
        en: `Set dp[0][${j}] = ${j}.`,
      },
    });
  }

  for (let i = 0; i <= m; i++) {
    gridSnap({
      title: { vi: `Base word1 i=${i}`, en: `Base word1 i=${i}` },
      codeLines: [13],
      hlCell: [i, 0],
      vars: [
        { name: "word1 prefix", value: `"${word1.slice(0, i)}"` },
      ],
      note: {
        vi: `Bien "${word1.slice(0, i)}" thanh chuoi rong can xoa ${i} ky tu.`,
        en: `Converting "${word1.slice(0, i)}" to empty string needs ${i} deletion(s).`,
      },
    });
    dp[i][0] = i;
    gridSnap({
      title: { vi: `dp[${i}][0] = ${i}`, en: `dp[${i}][0] = ${i}` },
      codeLines: [14],
      hlCell: [i, 0],
      vars: [{ name: `dp[${i}][0]`, value: dp[i][0] }],
      note: {
        vi: `Gan dp[${i}][0] = ${i}.`,
        en: `Set dp[${i}][0] = ${i}.`,
      },
    });
  }

  for (let i = 1; i <= m; i++) {
    gridSnap({
      title: { vi: `Vong ngoai i=${i}`, en: `Outer loop i=${i}` },
      codeLines: [16],
      hlCell: [i, 0],
      vars: [{ name: `word1[${i - 1}]`, value: charValue(word1[i - 1]) }],
      note: {
        vi: `Xet word1[:${i}] = "${word1.slice(0, i)}".`,
        en: `Consider word1[:${i}] = "${word1.slice(0, i)}".`,
      },
    });

    for (let j = 1; j <= n; j++) {
      gridSnap({
        title: { vi: `Vong trong j=${j}`, en: `Inner loop j=${j}` },
        codeLines: [17],
        hlCell: [i, j],
        pathCells: [[i - 1, j - 1], [i, j - 1], [i - 1, j]],
        cellLabels: { [`${i - 1},${j - 1}`]: "dp[i-1][j-1]" },
        vars: [
          { name: `word1[${i - 1}]`, value: charValue(word1[i - 1]) },
          { name: `word2[${j - 1}]`, value: word2IndexValue(j) },
        ],
        note: {
          vi: `Chuan bi tinh dp[${i}][${j}] cho "${word1.slice(0, i)}" -> "${word2.slice(0, j)}".`,
          en: `Prepare to compute dp[${i}][${j}] for "${word1.slice(0, i)}" -> "${word2.slice(0, j)}".`,
        },
      });

      const match = word1[i - 1] === word2[j - 1];
      gridSnap({
        title: { vi: `So sanh '${word1[i - 1]}' va '${word2[j - 1]}'`, en: `Compare '${word1[i - 1]}' and '${word2[j - 1]}'` },
        codeLines: [18],
        hlCell: [i, j],
        pathCells: [[i - 1, j - 1]],
        cellLabels: { [`${i - 1},${j - 1}`]: "dp[i-1][j-1]" },
        vars: [
          { name: `word1[${i - 1}]`, value: charValue(word1[i - 1]) },
          { name: `word2[${j - 1}]`, value: word2IndexValue(j) },
          { name: "match", value: match },
        ],
        note: {
          vi: match ? "Ky tu giong nhau, khong can thao tac them." : "Ky tu khac nhau, tinh min cua xoa/chen/thay the.",
          en: match ? "Characters match, no extra operation needed." : "Characters differ, take the minimum of delete/insert/replace.",
        },
      });

      if (match) {
        dp[i][j] = dp[i - 1][j - 1];
        gridSnap({
          title: { vi: `dp[${i}][${j}] = ${dp[i][j]}`, en: `dp[${i}][${j}] = ${dp[i][j]}` },
          codeLines: [20],
          hlCell: [i, j],
          pathCells: [[i - 1, j - 1]],
          cellLabels: { [`${i - 1},${j - 1}`]: "dp[i-1][j-1]" },
          vars: [
            { name: `dp[${i - 1}][${j - 1}]`, value: dp[i - 1][j - 1] },
            { name: `dp[${i}][${j}]`, value: dp[i][j] },
          ],
          note: {
            vi: `Khong can thao tac: dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${dp[i][j]}.`,
            en: `No operation needed: dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${dp[i][j]}.`,
          },
        });
      } else {
        const deleteCost = dp[i - 1][j] + 1;
        const insertCost = dp[i][j - 1] + 1;
        const replaceCost = dp[i - 1][j - 1] + 1;
        dp[i][j] = Math.min(deleteCost, insertCost, replaceCost);
        gridSnap({
          title: { vi: `dp[${i}][${j}] = ${dp[i][j]}`, en: `dp[${i}][${j}] = ${dp[i][j]}` },
          codeLines: [22, 23, 24, 25, 26],
          hlCell: [i, j],
          pathCells: [[i - 1, j], [i, j - 1], [i - 1, j - 1]],
          cellLabels: { [`${i - 1},${j - 1}`]: "dp[i-1][j-1]" },
          vars: [
            { name: "delete", value: `dp[${i - 1}][${j}] + 1 = ${deleteCost}` },
            { name: "insert", value: `dp[${i}][${j - 1}] + 1 = ${insertCost}` },
            { name: "replace", value: `dp[${i - 1}][${j - 1}] + 1 = ${replaceCost}` },
            { name: `dp[${i}][${j}]`, value: dp[i][j] },
          ],
          note: {
            vi: `dp[${i}][${j}] = min(${deleteCost}, ${insertCost}, ${replaceCost}) = ${dp[i][j]}.`,
            en: `dp[${i}][${j}] = min(${deleteCost}, ${insertCost}, ${replaceCost}) = ${dp[i][j]}.`,
          },
        });
      }
    }
  }

  const answer = dp[m][n];
  gridSnap({
    title: { vi: "Ket qua", en: "Result" },
    hlCell: [m, n],
    codeLines: [28],
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `Edit distance("${word1}", "${word2}") = ${answer} thao tac.`,
      en: `Edit distance("${word1}", "${word2}") = ${answer} operation(s).`,
    },
  });
  steps[steps.length - 1].final = true;
  return { word1, word2, answer, steps };
}
function buildSteps72(input, params) {
  const approach = String(params && params.approach ? params.approach : "1");
  if (approach === "2") return buildSteps72Rolling(input, params);
  return buildSteps72Table(input, params);
}

function buildSteps72Rolling(input, params) {
  const word1 = typeof input === "string" ? input : String(input);
  const word2 = (params.word2 || "").trim();
  const m = word1.length;
  const n = word2.length;
  const steps = [];
  let prev = Array.from({ length: n + 1 }, (_, idx) => idx);
  let curr = null;
  const blankRow = () => Array(n + 1).fill("");
  const charValue = (ch) => `'${ch}'`;
  const word1IndexValue = (i) => `word1[${i} - 1] = ${charValue(word1[i - 1])}`;
  const word2IndexValue = (j) => `word2[${j} - 1] = ${charValue(word2[j - 1])}`;
  const colLabels = Array.from({ length: n }, (_, idx) => ({
    index: `j=${idx + 1}`,
    char: word2[idx],
  }));

  function rowSnap(opts) {
    const vars = [];
    if (opts.i !== undefined) vars.push({ name: "i", value: opts.i });
    if (opts.j !== undefined) vars.push({ name: "j", value: opts.j });
    const explicitVars = opts.vars || [];
    if (
      opts.i !== undefined &&
      opts.i > 0 &&
      !explicitVars.some((item) => item.name === "word1[i - 1]")
    ) {
      vars.push({ name: "word1[i - 1]", value: word1IndexValue(opts.i) });
    }
    for (const item of explicitVars) vars.push(item);
    const activeRow = opts.activeRow === undefined ? null : opts.activeRow;
    const activeCol = opts.activeCol === undefined ? 0 : opts.activeCol;
    const currRow = curr ? [...curr] : blankRow();
    steps.push({
      title: opts.title,
      grid: {
        dp: [blankRow(), [...prev], currRow],
        text1: "pc",
        text2: word2,
        largeCells: true,
        rowLabels: [
          { index: "prev", char: opts.prevLabel || (opts.i === undefined ? "i=0" : `i-1=${Math.max(0, opts.i - 1)}`) },
          { index: "curr", char: opts.currLabel || (opts.i === undefined ? "not started" : `i=${opts.i}`) },
        ],
        colLabels,
        hlCell: activeRow === null ? null : [activeRow, activeCol],
        pathCells: opts.pathCells || [],
        cellLabels: opts.cellLabels || {},
      },
      codeLines: opts.codeLines || [],
      codeBlock: 2,
      vars,
      note: opts.note,
    });
  }

  rowSnap({
    title: { vi: `m=${m}, n=${n}`, en: `m=${m}, n=${n}` },
    arr: [],
    codeLines: [3],
    activeRow: 1,
    activeCol: 0,
    vars: [
      { name: "word1", value: word1 },
      { name: "word2", value: word2 },
      { name: "m", value: m },
      { name: "n", value: n },
    ],
    note: {
      vi: `m = ${m}, n = ${n}. Grid nay chi co 2 hang: prev la hang i-1, curr la hang i dang tinh.`,
      en: `m = ${m}, n = ${n}. This grid has only 2 rows: prev is row i-1, curr is the row being computed.`,
    },
  });

  rowSnap({
    title: { vi: `prev = [0..${n}]`, en: `prev = [0..${n}]` },
    arr: [...prev],
    highlight: [],
    codeLines: [4],
    activeRow: 1,
    activeCol: 0,
    vars: [{ name: "prev", value: `[${prev.join(", ")}]` }],
    note: {
      vi: "prev bieu dien hang dp cua i-1. Ban dau i=0, can chen j ky tu de tao word2[:j].",
      en: "prev represents row i-1. Initially i=0, inserting j characters creates word2[:j].",
    },
  });

  for (let i = 1; i <= m; i++) {
    rowSnap({
      title: { vi: `Vong ngoai i=${i}`, en: `Outer loop i=${i}` },
      arr: [...prev],
      highlight: [],
      codeLines: [6],
      i,
      activeRow: 1,
      activeCol: 0,
      vars: [
        { name: `word1[${i - 1}]`, value: charValue(word1[i - 1]) },
        { name: "prev", value: `[${prev.join(", ")}]` },
      ],
      note: {
        vi: `Xu ly word1[:${i}] = "${word1.slice(0, i)}". prev la hang i-1.`,
        en: `Process word1[:${i}] = "${word1.slice(0, i)}". prev is row i-1.`,
      },
    });

    curr = [i, ...Array(n).fill(0)];
    rowSnap({
      title: { vi: `curr = [${i}, 0...]`, en: `curr = [${i}, 0...]` },
      arr: [...curr],
      highlight: [0],
      codeLines: [7],
      i,
      j: 0,
      activeRow: 2,
      activeCol: 0,
      vars: [{ name: "curr[0]", value: i }],
      note: {
        vi: `curr[0] = ${i}: xoa ${i} ky tu de bien word1[:${i}] thanh chuoi rong.`,
        en: `curr[0] = ${i}: delete ${i} character(s) to convert word1[:${i}] to empty string.`,
      },
    });

    for (let j = 1; j <= n; j++) {
      const same = word1[i - 1] === word2[j - 1];
      rowSnap({
        title: { vi: `So sanh '${word1[i - 1]}' va '${word2[j - 1]}'`, en: `Compare '${word1[i - 1]}' and '${word2[j - 1]}'` },
        arr: [...curr],
        highlight: [j],
        codeLines: [8, 9],
        i,
        j,
        activeRow: 2,
        activeCol: j,
        pathCells: same ? [[1, j - 1]] : [[1, j], [2, j - 1], [1, j - 1]],
        cellLabels: same
          ? { [`1,${j - 1}`]: "prev[j-1]\ndp[i-1][j-1]" }
          : { [`1,${j}`]: "prev[j]", [`2,${j - 1}`]: "curr[j-1]", [`1,${j - 1}`]: "prev[j-1]\ndp[i-1][j-1]" },
        vars: [
          { name: `word1[${i - 1}]`, value: charValue(word1[i - 1]) },
          { name: `word2[${j - 1}]`, value: word2IndexValue(j) },
          { name: "same", value: same },
        ],
        note: {
          vi: same ? "Hai ky tu giong nhau, lay prev[j-1]." : "Hai ky tu khac nhau, tinh min cua xoa/chen/thay the.",
          en: same ? "Characters match, take prev[j-1]." : "Characters differ, take min of delete/insert/replace.",
        },
      });

      if (same) {
        curr[j] = prev[j - 1];
        rowSnap({
          title: { vi: `curr[${j}] = ${curr[j]}`, en: `curr[${j}] = ${curr[j]}` },
          arr: [...curr],
          highlight: [j],
          mark: [j - 1],
          codeLines: [10],
          i,
          j,
          activeRow: 2,
          activeCol: j,
          pathCells: [[1, j - 1]],
          cellLabels: { [`1,${j - 1}`]: "prev[j-1]\ndp[i-1][j-1]" },
          vars: [
            { name: `prev[${j - 1}]`, value: prev[j - 1] },
            { name: `curr[${j}]`, value: curr[j] },
          ],
          note: {
            vi: `curr[${j}] = prev[${j - 1}] = ${curr[j]}.`,
            en: `curr[${j}] = prev[${j - 1}] = ${curr[j]}.`,
          },
        });
      } else {
        const del = prev[j];
        const ins = curr[j - 1];
        const rep = prev[j - 1];
        curr[j] = 1 + Math.min(del, ins, rep);
        rowSnap({
          title: { vi: `curr[${j}] = ${curr[j]}`, en: `curr[${j}] = ${curr[j]}` },
          arr: [...curr],
          highlight: [j],
          mark: [j - 1],
          codeLines: [12],
          i,
          j,
          activeRow: 2,
          activeCol: j,
          pathCells: [[1, j], [2, j - 1], [1, j - 1]],
          cellLabels: {
            [`1,${j}`]: "prev[j]",
            [`2,${j - 1}`]: "curr[j-1]",
            [`1,${j - 1}`]: "prev[j-1]\ndp[i-1][j-1]",
          },
          vars: [
            { name: "delete", value: `prev[${j}] = ${del}` },
            { name: "insert", value: `curr[${j - 1}] = ${ins}` },
            { name: "replace", value: `prev[${j - 1}] = ${rep}` },
            { name: `curr[${j}]`, value: `1 + min(${del}, ${ins}, ${rep}) = ${curr[j]}` },
          ],
          note: {
            vi: `curr[${j}] = 1 + min(${del}, ${ins}, ${rep}) = ${curr[j]}.`,
            en: `curr[${j}] = 1 + min(${del}, ${ins}, ${rep}) = ${curr[j]}.`,
          },
        });
      }
    }

    prev = curr;
    rowSnap({
      title: { vi: "prev = curr", en: "prev = curr" },
      arr: [...prev],
      highlight: [],
      codeLines: [13],
      i,
      activeRow: 1,
      activeCol: 0,
      currLabel: "copied",
      vars: [{ name: "prev", value: `[${prev.join(", ")}]` }],
      note: {
        vi: `Ket thuc hang i=${i}, gan prev = curr de xu ly hang tiep theo.`,
        en: `Finish row i=${i}; assign prev = curr for the next row.`,
      },
    });
  }

  const answer = prev[n];
  rowSnap({
    title: { vi: `Ket qua: ${answer}`, en: `Result: ${answer}` },
    arr: [...prev],
    highlight: [n],
    final: true,
    codeLines: [15],
    activeRow: 1,
    activeCol: n,
    vars: [
      { name: "answer", value: answer },
      { name: `prev[${n}]`, value: answer },
    ],
    note: {
      vi: `Edit distance("${word1}", "${word2}") = prev[${n}] = ${answer}.`,
      en: `Edit distance("${word1}", "${word2}") = prev[${n}] = ${answer}.`,
    },
  });
  steps[steps.length - 1].final = true;
  return { word1, word2, answer, steps };
}


/**
 * LeetCode 416: Partition Equal Subset Sum.
 * Can we split nums into two subsets with equal sum?
 * Equivalent to: can we find a subset summing to totalSum/2?
 * dp[j] = True if sum j is achievable using some subset.
 * For each num: for j = target..num: dp[j] |= dp[j - num].
 */
function buildSteps416(nums) {
  const steps = [];
  const total = nums.reduce((a, b) => a + b, 0);

  steps.push({
    title: { vi: `total = sum(nums) = ${total}`, en: `total = sum(nums) = ${total}` },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "nums", value: `[${nums.join(",")}]` },
      { name: "total", value: total },
    ],
    note: {
      vi: `Tính tổng mảng trước. Muốn chia đều thì tổng phải là số chẵn.`,
      en: `Compute the total first. Equal partition is possible only when the total is even.`,
    },
  });

  if (total % 2 !== 0) {
    steps.push({
      title: { vi: "Tổng lẻ → False", en: "Odd sum → False" },
      arr: [...nums], highlight: [], mark: [], final: true, codeLines: [4],
      vars: [{ name: "sum", value: total }, { name: "answer", value: false }],
      note: { vi: `Tổng = ${total} (lẻ) → không thể chia đều. False.`, en: `Sum = ${total} (odd) → cannot partition equally. False.` },
    });
    return { original: [...nums], answer: false, steps };
  }

  const target = total / 2;
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;

  steps.push({
    title: { vi: `target = ${target}`, en: `target = ${target}` },
    arr: dp.map((v) => (v ? 1 : 0)),
    sub: dp.map((_, i) => String(i)),
    highlight: [],
    mark: [],
    codeLines: [5],
    vars: [
      { name: "total", value: total },
      { name: "target", value: target },
    ],
    note: {
      vi: `Nếu tồn tại subset có tổng ${target}, phần còn lại cũng có tổng ${target}.`,
      en: `If a subset sums to ${target}, the remaining subset also sums to ${target}.`,
    },
  });

  steps.push({
    title: { vi: "Tạo bảng dp toàn False", en: "Create all-False dp table" },
    arr: new Array(target + 1).fill(0),
    sub: dp.map((_, i) => String(i)),
    highlight: [],
    mark: [],
    codeLines: [6],
    vars: [
      { name: "target", value: target },
      { name: "dp", value: `[${new Array(target + 1).fill(".").join("")}]` },
    ],
    note: {
      vi: `dp[j] = True nghĩa là tạo được tổng j từ các số đã xét.`,
      en: `dp[j] = True means sum j is reachable using numbers processed so far.`,
    },
  });

  steps.push({
    title: { vi: "dp[0] = True", en: "dp[0] = True" },
    arr: dp.map((v) => (v ? 1 : 0)),
    sub: dp.map((_, i) => String(i)),
    highlight: [0],
    mark: [0],
    codeLines: [7],
    vars: [
      { name: "dp[0]", value: true },
      { name: "dp", value: `[${dp.map((v) => v ? "T" : ".").join("")}]` },
    ],
    note: {
      vi: `Tổng 0 luôn tạo được bằng cách không chọn phần tử nào.`,
      en: `Sum 0 is always reachable by choosing no elements.`,
    },
  });

  for (const num of nums) {
    steps.push({
      title: { vi: `for num in nums: num = ${num}`, en: `for num in nums: num = ${num}` },
      arr: dp.map((v) => (v ? 1 : 0)),
      sub: dp.map((_, i) => String(i)),
      highlight: [],
      mark: dp[target] ? [target] : [],
      codeLines: [8],
      vars: [
        { name: "num", value: num },
        { name: "dp[target]", value: dp[target] },
      ],
      note: {
        vi: `Bắt đầu xét số ${num}. Duyệt j giảm để mỗi số chỉ được dùng một lần.`,
        en: `Start processing ${num}. Iterate j backwards so each number is used at most once.`,
      },
    });

    for (let j = target; j >= num; j--) {
      const beforeJ = dp[j];
      const source = dp[j - num];

      steps.push({
        title: { vi: `for j: j = ${j}`, en: `for j: j = ${j}` },
        arr: dp.map((v) => (v ? 1 : 0)),
        sub: dp.map((_, i) => String(i)),
        highlight: [j, j - num],
        mark: dp[target] ? [target] : [],
        codeLines: [9],
        vars: [
          { name: "num", value: num },
          { name: "j", value: j },
          { name: "dp[j]", value: beforeJ },
          { name: "dp[j-num]", value: source },
        ],
        note: {
          vi: `Kiểm tra có thể tạo tổng ${j} bằng cách thêm ${num} vào tổng ${j - num} không.`,
          en: `Check whether sum ${j} can be reached by adding ${num} to sum ${j - num}.`,
        },
      });

      dp[j] = dp[j] || dp[j - num];
      steps.push({
        title: { vi: `dp[${j}] = ${beforeJ} or ${source} → ${dp[j]}`, en: `dp[${j}] = ${beforeJ} or ${source} → ${dp[j]}` },
        arr: dp.map((v) => (v ? 1 : 0)),
        sub: dp.map((_, i) => String(i)),
        highlight: [j, j - num],
        mark: dp[j] && !beforeJ ? [j] : (dp[target] ? [target] : []),
        codeLines: [10],
        vars: [
          { name: "num", value: num },
          { name: "j", value: j },
          { name: `old dp[${j}]`, value: beforeJ },
          { name: `dp[${j - num}]`, value: source },
          { name: `new dp[${j}]`, value: dp[j] },
          { name: "dp[target]", value: dp[target] },
        ],
        note: {
          vi: beforeJ === dp[j]
            ? `Giá trị dp[${j}] không đổi.`
            : `Tạo được tổng ${j}: lấy một subset tổng ${j - num}, rồi thêm ${num}.`,
          en: beforeJ === dp[j]
            ? `dp[${j}] stays unchanged.`
            : `Sum ${j} is now reachable: take a subset summing to ${j - num}, then add ${num}.`,
        },
      });
    }
  }

  const answer = dp[target];
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: dp.map((v) => (v ? 1 : 0)),
    sub: dp.map((_, i) => String(i)),
    highlight: [], mark: answer ? [target] : [], final: true, codeLines: [10],
    vars: [{ name: "answer", value: answer }, { name: "target", value: target }, { name: "dp", value: `[${dp.map((v) => v ? "T" : ".").join("")}]` }],
    note: {
      vi: answer ? `dp[${target}] = True → có thể chia thành 2 tập bằng nhau (mỗi tập tổng ${target}).` : `dp[${target}] = False → không thể chia đều.`,
      en: answer ? `dp[${target}] = True → can partition into two equal subsets (each sum ${target}).` : `dp[${target}] = False → cannot partition equally.`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 1301: Number of Paths with Max Score.
 *
 * Grid characters:
 *   'S' = start (bottom-right, does NOT contribute to score)
 *   'E' = end   (top-left, does NOT contribute to score)
 *   'X' = obstacle (unreachable)
 *   '0'..'9' = digit added to the score when you step on that cell
 *
 * You move from S toward E going UP, LEFT, or UP-LEFT (diagonally). Both the
 * max total score and the number of paths that achieve it must be reported
 * (mod 1e9+7). If E is unreachable, return [0, 0].
 *
 * DP filled bottom-right → top-left:
 *   dp[r][c]  = max score to reach (r, c) starting from S
 *   cnt[r][c] = number of ways to reach (r, c) achieving dp[r][c]
 * From cell (r, c) you can come from (r+1, c), (r, c+1), or (r+1, c+1).
 */
function buildSteps1301(input) {
  const MOD = 1_000_000_007;
  // Parse: rows separated by |, cells run together ("E23|2X2|12S") or
  // separated by commas ("E,2,3|2,X,2|1,2,S"). Trim whitespace.
  const rawRows = String(input || "").split("|").map((r) => r.trim()).filter(Boolean);
  const board = rawRows.map((row) => {
    const cells = row.includes(",") ? row.split(",").map((s) => s.trim()) : row.split("");
    return cells.map((s) => s.replace(/^["']|["']$/g, ""));
  });

  const steps = [];

  const rows = board.length;
  const cols = rows > 0 ? board[0].length : 0;

  function invalid() {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true,
      codeLines: [3, 4, 5],
      vars: [{ name: "answer", value: [0, 0] }],
      note: {
        vi: "Grid phải là hình chữ nhật, có đúng 1 ô 'E' (trên-trái) và 1 ô 'S' (dưới-phải). Ví dụ: E23|2X2|12S",
        en: "Grid must be rectangular with exactly one 'E' (top-left) and one 'S' (bottom-right). Example: E23|2X2|12S",
      },
    });
    return { original: board, answer: [0, 0], steps };
  }

  if (rows === 0 || cols === 0 || board.some((row) => row.length !== cols)) return invalid();
  if (board[0][0] !== "E" || board[rows - 1][cols - 1] !== "S") return invalid();

  // dp[r][c]/cnt[r][c] — dp = -1 means unreachable.
  const dp = Array.from({ length: rows }, () => Array(cols).fill(-1));
  const cnt = Array.from({ length: rows }, () => Array(cols).fill(0));
  dp[rows - 1][cols - 1] = 0;
  cnt[rows - 1][cols - 1] = 1;

  function cellLabel(r, c) {
    const raw = board[r][c];
    if (raw === "X") return "■";
    const s = dp[r][c];
    const k = cnt[r][c];
    if (s < 0) return raw; // unreached
    return `${raw}\n${s}|${k}`;
  }

  function cellClass(r, c, currentR, currentC, hlPreds) {
    const raw = board[r][c];
    if (raw === "X") return "wall";
    if (r === currentR && c === currentC) return "current";
    if (hlPreds && hlPreds.some(([pr, pc]) => pr === r && pc === c)) return "queued";
    if (raw === "S") return "start";
    if (raw === "E") return "end";
    if (dp[r][c] >= 0) return "visited";
    return "empty";
  }

  function pushStep({ title, currentR, currentC, hlPreds, codeLines, vars, note, final }) {
    const cells = board.map((row, r) =>
      row.map((_, c) => ({ label: cellLabel(r, c), cls: cellClass(r, c, currentR, currentC, hlPreds) }))
    );
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows, cols, cells },
      highlight: [],
      mark: [],
      final: !!final,
      codeLines: codeLines || [],
      vars: vars || [],
      note,
    });
  }

  pushStep({
    title: { vi: "Khởi tạo (S = 0, 1 cách)", en: "Initialize (S = 0 score, 1 way)" },
    currentR: rows - 1, currentC: cols - 1,
    codeLines: [3, 4, 5, 6, 7, 8],
    vars: [
      { name: "start (S)", value: `(${rows - 1},${cols - 1})` },
      { name: "end (E)", value: "(0,0)" },
      { name: "dp[S]", value: 0 },
      { name: "cnt[S]", value: 1 },
    ],
    note: {
      vi:
        `Bắt đầu ở S=(${rows - 1},${cols - 1}) với dp=0, cnt=1. Điền bảng theo thứ tự ngược ` +
        `(dưới-phải → trên-trái). Từ mỗi ô (r,c), ba tiền nhiệm khả dĩ là (r+1,c), (r,c+1), (r+1,c+1). ` +
        `dp[r][c] = max các dp tiền nhiệm + digit tại (r,c); cnt = tổng cnt của tiền nhiệm đạt max đó.`,
      en:
        `Start at S=(${rows - 1},${cols - 1}) with dp=0, cnt=1. Fill the table in reverse order ` +
        `(bottom-right → top-left). For each cell (r,c) the three possible predecessors are (r+1,c), (r,c+1), (r+1,c+1). ` +
        `dp[r][c] = max of predecessor dp + digit at (r,c); cnt = sum of cnts of predecessors achieving that max.`,
    },
  });

  // Walk cells in reverse row-major order (skip S itself).
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = cols - 1; c >= 0; c--) {
      if (r === rows - 1 && c === cols - 1) continue;
      const raw = board[r][c];
      if (raw === "X") continue;

      const preds = [];
      if (r + 1 < rows) preds.push([r + 1, c, "↓"]);
      if (c + 1 < cols) preds.push([r, c + 1, "→"]);
      if (r + 1 < rows && c + 1 < cols) preds.push([r + 1, c + 1, "↘"]);

      let best = -1;
      let ways = 0;
      const contribs = []; // {pr,pc,arrow,score,count,used}

      for (const [pr, pc, arrow] of preds) {
        const s = dp[pr][pc];
        const k = cnt[pr][pc];
        contribs.push({ pr, pc, arrow, score: s, count: k, used: false });
        if (s < 0) continue;
        if (s > best) {
          best = s;
          ways = k;
        } else if (s === best) {
          ways = (ways + k) % MOD;
        }
      }
      contribs.forEach((c2) => {
        c2.used = c2.score === best && best >= 0;
      });

      if (best < 0) {
        // Unreachable from S
        pushStep({
          title: { vi: `(${r},${c}): không đến được`, en: `(${r},${c}): unreachable` },
          currentR: r, currentC: c,
          hlPreds: preds.map(([pr, pc]) => [pr, pc]),
          codeLines: [14, 15, 16, 17, 22, 23],
          vars: [
            { name: "cell", value: `(${r},${c})` },
            { name: "char", value: raw },
            { name: "predecessors", value: contribs.map((x) => `${x.arrow}(${x.pr},${x.pc})=${x.score}|${x.count}`).join(" ") },
            { name: "dp[r][c]", value: -1 },
            { name: "cnt[r][c]", value: 0 },
          ],
          note: {
            vi: `Không có tiền nhiệm nào đến được (tất cả đều -1). (${r},${c}) không đạt được từ S.`,
            en: `No predecessor is reachable (all -1). (${r},${c}) is unreachable from S.`,
          },
        });
        continue;
      }

      const digit = /^[0-9]$/.test(raw) ? Number(raw) : 0;
      dp[r][c] = best + digit;
      cnt[r][c] = ways;

      pushStep({
        title: { vi: `dp[${r}][${c}] = ${dp[r][c]}, cnt = ${cnt[r][c]}`, en: `dp[${r}][${c}] = ${dp[r][c]}, cnt = ${cnt[r][c]}` },
        currentR: r, currentC: c,
        hlPreds: preds.map(([pr, pc]) => [pr, pc]),
        codeLines: [13, 14, 15, 16, 17, 18, 19, 20, 21, 24, 25],
        vars: [
          { name: "cell", value: `(${r},${c})` },
          { name: "char", value: raw },
          { name: "digit", value: digit },
          { name: "predecessors (score|cnt)", value: contribs.map((x) => `${x.arrow}${x.score < 0 ? "×" : ""}${x.score}|${x.count}${x.used ? "*" : ""}`).join(" ") },
          { name: "max predecessor score", value: best },
          { name: "combined cnt", value: ways },
          { name: "dp[r][c]", value: dp[r][c] },
          { name: "cnt[r][c]", value: cnt[r][c] },
        ],
        note: {
          vi:
            `Ký tự '${raw}' (digit=${digit}). Xét ${preds.length} tiền nhiệm: ` +
            contribs.map((x) => `${x.arrow}(${x.pr},${x.pc})=score ${x.score}${x.score < 0 ? " (bỏ)" : ""}, cnt ${x.count}`).join("; ") +
            `. Max score tiền nhiệm = ${best}, tổng cnt đạt max = ${ways}. ` +
            `Vậy dp[${r}][${c}] = ${best} + ${digit} = ${dp[r][c]}, cnt = ${ways}.`,
          en:
            `Char '${raw}' (digit=${digit}). ${preds.length} predecessors: ` +
            contribs.map((x) => `${x.arrow}(${x.pr},${x.pc})=score ${x.score}${x.score < 0 ? " (skip)" : ""}, cnt ${x.count}`).join("; ") +
            `. Max predecessor score = ${best}, combined cnt = ${ways}. ` +
            `So dp[${r}][${c}] = ${best} + ${digit} = ${dp[r][c]}, cnt = ${ways}.`,
        },
      });
    }
  }

  const finalScore = dp[0][0];
  const finalCnt = cnt[0][0];
  const reachable = finalScore >= 0 && finalCnt > 0;
  const answer = reachable ? [finalScore, finalCnt] : [0, 0];

  pushStep({
    title: { vi: "Kết quả", en: "Result" },
    currentR: 0, currentC: 0,
    codeLines: reachable ? [28] : [26, 27],
    vars: [
      { name: "dp[0][0]", value: finalScore },
      { name: "cnt[0][0]", value: finalCnt },
      { name: "answer", value: `[${answer[0]}, ${answer[1]}]` },
    ],
    note: {
      vi: reachable
        ? `E đến được với điểm tối đa = ${finalScore}, số đường đạt điểm đó = ${finalCnt} (mod 1e9+7).`
        : `E không đến được từ S → trả về [0, 0].`,
      en: reachable
        ? `E is reachable with max score = ${finalScore}, number of paths = ${finalCnt} (mod 1e9+7).`
        : `E is unreachable from S → return [0, 0].`,
    },
    final: true,
  });

  return { original: board, answer, steps };
}

/**
 * LeetCode 2320: Count Number of Ways to Place Houses.
 * One side of the street is a "no two adjacent" placement count = Fibonacci:
 *   dp[i] = dp[i-1] (plot i empty) + dp[i-2] (plot i has a house → i-1 empty),
 *   dp[0] = 1, dp[1] = 2.
 * The two sides are independent, so the answer is dp[n]^2 (mod 1e9+7).
 */
function buildSteps2320(input) {
  const n = Array.isArray(input) ? Number(input[0]) : Number(input);
  if (!Number.isInteger(n) || n < 1 || n > 46) {
    throw new Error("n must be an integer between 1 and 46.");
  }

  const MOD = 1000000007;
  const steps = [];
  const dp = new Array(n + 1).fill(null);

  let phase = "intro";
  let i = null;
  let emptyWays = null;
  let houseWays = null;
  let oneSide = null;
  let answer = null;

  const snapshot = () => ({
    n,
    dp: [...dp],
    phase,
    i,
    emptyWays,
    houseWays,
    oneSide,
    answer,
  });
  const push = ({ title, note, line, final = false, vars = [] }) => {
    steps.push({
      title,
      note,
      codeLines: [line],
      final,
      arr: [],
      highlight: [],
      mark: [],
      vars,
      houses2320View: snapshot(),
    });
  };

  push({
    title: { vi: `n = ${n} ô mỗi bên đường`, en: `n = ${n} plots on each side` },
    note: {
      vi: "Hai bên đường độc lập nhau. Trên MỖI bên, không được đặt nhà ở hai ô liền kề. Đếm số cách một bên rồi bình phương.",
      en: "The two sides are independent. On EACH side, no two houses may sit on adjacent plots. Count one side, then square it.",
    },
    line: 3,
    vars: [{ name: "n", value: n }, { name: "MOD", value: "1e9+7" }],
  });

  dp[0] = 1;
  i = 0;
  phase = "init";
  push({
    title: { vi: "dp[0] = 1", en: "dp[0] = 1" },
    note: {
      vi: "dp[i] = số cách đặt nhà trên i ô đầu (một bên). Với 0 ô: đúng 1 cách (không đặt gì).",
      en: "dp[i] = ways to place houses on the first i plots (one side). With 0 plots there is exactly 1 way (place nothing).",
    },
    line: 5,
    vars: [{ name: "dp[0]", value: 1 }],
  });

  if (n >= 1) {
    dp[1] = 2;
    i = 1;
    push({
      title: { vi: "dp[1] = 2", en: "dp[1] = 2" },
      note: {
        vi: "Với 1 ô: hoặc để trống, hoặc đặt một nhà → 2 cách.",
        en: "With 1 plot: leave it empty or place one house → 2 ways.",
      },
      line: 6,
      vars: [{ name: "dp[1]", value: 2 }],
    });
  }

  for (i = 2; i <= n; i++) {
    emptyWays = dp[i - 1];
    houseWays = dp[i - 2];
    dp[i] = (emptyWays + houseWays) % MOD;
    phase = "step";
    push({
      title: { vi: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${emptyWays} + ${houseWays} = ${dp[i]}`, en: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${emptyWays} + ${houseWays} = ${dp[i]}` },
      note: {
        vi: `Ô thứ ${i}: nếu ĐỂ TRỐNG thì còn dp[${i - 1}]=${emptyWays} cách; nếu ĐẶT NHÀ thì ô ${i - 1} phải trống nên còn dp[${i - 2}]=${houseWays} cách. Cộng lại = ${dp[i]}.`,
        en: `Plot ${i}: if EMPTY there are dp[${i - 1}]=${emptyWays} ways; if a HOUSE then plot ${i - 1} must be empty so dp[${i - 2}]=${houseWays} ways. Sum = ${dp[i]}.`,
      },
      line: 8,
      vars: [
        { name: "i", value: i },
        { name: "empty → dp[i-1]", value: emptyWays },
        { name: "house → dp[i-2]", value: houseWays },
        { name: "dp[i]", value: dp[i] },
      ],
    });
  }

  emptyWays = null;
  houseWays = null;
  oneSide = dp[n];
  // oneSide can be up to ~1e9, so oneSide*oneSide (~1e18) exceeds Number's safe
  // integer range; use BigInt for the modular square to stay exact.
  answer = Number((BigInt(oneSide) * BigInt(oneSide)) % BigInt(MOD));
  i = n;
  phase = "square";
  push({
    title: { vi: `Một bên: dp[${n}] = ${oneSide}`, en: `One side: dp[${n}] = ${oneSide}` },
    note: {
      vi: `Một bên đường có ${oneSide} cách. Hai bên độc lập nên tổng số cách = ${oneSide} × ${oneSide}.`,
      en: `One side has ${oneSide} ways. The two sides are independent, so the total = ${oneSide} × ${oneSide}.`,
    },
    line: 9,
    vars: [{ name: "one side", value: oneSide }],
  });

  phase = "done";
  push({
    title: { vi: `return ${oneSide}² mod (1e9+7) = ${answer}`, en: `return ${oneSide}² mod (1e9+7) = ${answer}` },
    note: {
      vi: `Đáp án = dp[${n}]² mod (10⁹+7) = ${answer}.`,
      en: `Answer = dp[${n}]² mod (1e9+7) = ${answer}.`,
    },
    line: 9,
    final: true,
    vars: [{ name: "answer", value: answer }],
  });

  return { original: [n], answer, steps };
}

/**
 * LeetCode 1690: Stone Game VII.
 * Interval DP on the score difference. dp[i][j] = best (currentPlayer - opponent)
 * difference achievable on stones[i..j]. Removing an end earns the sum of the
 * remaining stones, then the opponent plays the smaller interval optimally:
 *   dp[i][j] = max(sum(i+1,j) - dp[i+1][j], sum(i,j-1) - dp[i][j-1]).
 * Answer = dp[0][n-1].
 */
function buildSteps1690(stones) {
  if (!Array.isArray(stones) || stones.length < 1 || stones.some((v) => !Number.isInteger(v))) {
    throw new Error("stones must be a non-empty integer array.");
  }

  const n = stones.length;
  const steps = [];
  const prefix = new Array(n + 1).fill(0);
  const dp = Array.from({ length: n }, () => new Array(n).fill(null));

  let phase = "prefix";
  let i = null;
  let j = null;
  let length = null;
  let sumLeft = null; // sum of stones[i+1..j]
  let sumRight = null; // sum of stones[i..j-1]
  let takeLeft = null;
  let takeRight = null;
  let decision = null;
  let prefixK = null;
  let answer = null;

  const cloneDp = () => dp.map((row) => row.slice());
  const snapshot = () => ({
    stones: [...stones],
    n,
    prefix: [...prefix],
    dp: cloneDp(),
    phase,
    i,
    j,
    length,
    prefixK,
    sumLeft,
    sumRight,
    takeLeft,
    takeRight,
    decision,
    answer,
  });
  const push = ({ title, note, line, final = false, vars = [] }) => {
    steps.push({
      title,
      note,
      codeLines: [line],
      final,
      arr: [...stones],
      highlight: Number.isInteger(i) && Number.isInteger(j) ? Array.from({ length: j - i + 1 }, (_, k) => i + k) : [],
      mark: [],
      vars,
      stoneGame1690View: snapshot(),
    });
  };

  const sum = (lo, hi) => prefix[hi + 1] - prefix[lo]; // inclusive stones[lo..hi]

  push({
    title: { vi: `n = ${n}`, en: `n = ${n}` },
    note: {
      vi: "Alice và Bob thay phiên bỏ một viên ở HAI ĐẦU. Người bỏ được cộng điểm bằng TỔNG các viên CÒN LẠI. Cả hai chơi tối ưu để tối đa hóa hiệu điểm của mình.",
      en: "Alice and Bob alternately remove a stone from either END. The remover earns points equal to the SUM of the REMAINING stones. Both play optimally to maximize their score difference.",
    },
    line: 3,
    vars: [{ name: "stones", value: `[${stones.join(",")}]` }],
  });

  phase = "prefix";
  for (let k = 0; k < n; k++) {
    prefix[k + 1] = prefix[k] + stones[k];
    prefixK = k + 1;
    push({
      title: { vi: `prefix[${k + 1}] = ${prefix[k + 1]}`, en: `prefix[${k + 1}] = ${prefix[k + 1]}` },
      note: {
        vi: `Tổng tiền tố để tính nhanh tổng một đoạn: sum(l..r) = prefix[r+1] − prefix[l].`,
        en: `Prefix sums let us compute any interval sum fast: sum(l..r) = prefix[r+1] − prefix[l].`,
      },
      line: 6,
      vars: [{ name: "prefix", value: `[${prefix.join(",")}]` }],
    });
  }
  prefixK = null;

  // Base case: single stones have difference 0.
  for (let d = 0; d < n; d++) dp[d][d] = 0;
  i = null;
  j = null;
  phase = "base";
  push({
    title: { vi: "dp[i][i] = 0", en: "dp[i][i] = 0" },
    note: {
      vi: "Đoạn chỉ còn một viên: người tới lượt bỏ nó đi và chỉ nhận tổng phần còn lại (bằng 0), nên hiệu = 0.",
      en: "A single-stone interval: the player removes it and earns the remaining sum (0), so the difference is 0.",
    },
    line: 7,
    vars: [],
  });

  const cellCap = 120;
  let pushed = 0;
  for (length = 2; length <= n; length++) {
    for (i = 0; i + length - 1 < n; i++) {
      j = i + length - 1;
      sumLeft = sum(i + 1, j); // remove stones[i], remaining stones[i+1..j]
      sumRight = sum(i, j - 1); // remove stones[j], remaining stones[i..j-1]
      takeLeft = sumLeft - dp[i + 1][j];
      takeRight = sumRight - dp[i][j - 1];
      dp[i][j] = Math.max(takeLeft, takeRight);
      decision = takeLeft >= takeRight ? "left" : "right";
      if (pushed < cellCap) {
        phase = "cell";
        push({
          title: { vi: `dp[${i}][${j}] = ${dp[i][j]}`, en: `dp[${i}][${j}] = ${dp[i][j]}` },
          note: decision === "left"
            ? {
              vi: `Bỏ viên TRÁI #${i} (${stones[i]}): nhận tổng còn lại sum(${i + 1}..${j})=${sumLeft}, rồi trừ đi dp[${i + 1}][${j}]=${dp[i + 1][j]} (đối thủ chơi tối ưu) → ${takeLeft}. Lớn hơn hoặc bằng phương án phải (${takeRight}).`,
              en: `Remove LEFT #${i} (${stones[i]}): earn remaining sum(${i + 1}..${j})=${sumLeft}, then subtract dp[${i + 1}][${j}]=${dp[i + 1][j]} (opponent plays optimally) → ${takeLeft}. ≥ the right option (${takeRight}).`,
            }
            : {
              vi: `Bỏ viên PHẢI #${j} (${stones[j]}): nhận tổng còn lại sum(${i}..${j - 1})=${sumRight}, rồi trừ dp[${i}][${j - 1}]=${dp[i][j - 1]} → ${takeRight}. Lớn hơn phương án trái (${takeLeft}).`,
              en: `Remove RIGHT #${j} (${stones[j]}): earn remaining sum(${i}..${j - 1})=${sumRight}, then subtract dp[${i}][${j - 1}]=${dp[i][j - 1]} → ${takeRight}. > the left option (${takeLeft}).`,
            },
          line: 13,
          vars: [
            { name: "i", value: i }, { name: "j", value: j },
            { name: "take_left", value: takeLeft }, { name: "take_right", value: takeRight },
            { name: "dp[i][j]", value: dp[i][j] },
          ],
        });
        pushed += 1;
      }
    }
  }

  i = 0;
  j = n - 1;
  length = n;
  answer = dp[0][n - 1];
  decision = null;
  phase = "done";
  push({
    title: { vi: `return dp[0][${n - 1}] = ${answer}`, en: `return dp[0][${n - 1}] = ${answer}` },
    note: {
      vi: `Hiệu điểm tối ưu (Alice − Bob) trên toàn dãy là ${answer}.`,
      en: `The optimal score difference (Alice − Bob) over the whole array is ${answer}.`,
    },
    line: 14,
    final: true,
    vars: [{ name: "answer", value: answer }],
  });

  return { original: [...stones], answer, steps };
}

/**
 * LeetCode 1388: Pizza With 3n Slices.
 *
 * You have a circular pizza with 3n slices. Each round:
 *   1. You pick any remaining slice.
 *   2. Alice takes the slice next to yours in anti-clockwise direction.
 *   3. Bob takes the slice next to yours in clockwise direction.
 *   4. Repeat until nothing left. You get n slices total.
 *
 * KEY INSIGHT: the greedy "you pick, they pick neighbours" rule means the n
 * slices you end up with must all be non-adjacent in the original circle.
 * So the problem is:
 *   Pick n non-adjacent slices from a circular array of 3n to maximise sum.
 *
 * Circular → the standard trick: run the linear version twice
 *   maxPick(slices[0..3n-2], n)  // consider first, drop last
 *   maxPick(slices[1..3n-1], n)  // drop first, consider last
 * and take the max, so we never pick both endpoints of the original circle.
 *
 * Linear DP:
 *   dp[i][j] = max sum choosing j non-adjacent elements from arr[0..i]
 *   dp[i][j] = max(dp[i-1][j],                 # skip arr[i]
 *                  dp[i-2][j-1] + arr[i])      # take arr[i]
 * Base: dp[-1][*] = 0, dp[*][0] = 0.
 * Answer of one pass = dp[len(arr)-1][n].
 */
function buildSteps1388(slices) {
  if (!Array.isArray(slices) || slices.length === 0 || slices.length % 3 !== 0 || slices.some((v) => !Number.isInteger(v) || v < 0)) {
    throw new Error("slices count must be a positive multiple of 3 with non-negative integers.");
  }

  const total = slices.length;
  const n = Math.floor(total / 3);
  const steps = [];

  // Shared view state, refreshed on every frame.
  let phase = "intro";
  let pass = null; // "A" | "B"
  let passLabel = null;
  let droppedIndex = null;
  let offset = 0;
  let subArr = [];
  let dpSnap = [];
  let ci = null;
  let cj = null;
  let curVal = null;
  let skip = null;
  let take = null;
  let decision = null;
  let picks = []; // original indices currently highlighted
  let passABest = null;
  let passBBest = null;
  let answer = null;
  let winner = null;

  const cloneDp = (dp) => dp.map((row) => row.slice());
  const snapshot = () => ({
    slices: [...slices],
    total,
    n,
    phase,
    pass,
    passLabel,
    droppedIndex,
    offset,
    subLen: subArr.length,
    dp: cloneDp(dpSnap),
    i: ci,
    j: cj,
    val: curVal,
    skip,
    take: take === -Infinity ? null : take,
    decision,
    picks: [...picks],
    passABest,
    passBBest,
    answer,
    winner,
  });
  const push = ({ title, note, line, final = false, vars = [] }) => {
    steps.push({
      title,
      note,
      codeLines: [line],
      final,
      arr: [...slices],
      highlight: [],
      mark: [...picks],
      vars,
      pizza1388View: snapshot(),
    });
  };

  push({
    title: { vi: `n = ${total} / 3 = ${n}`, en: `n = ${total} / 3 = ${n}` },
    note: {
      vi: `Bạn chỉ ăn được ${n} trong ${total} miếng. Vì Alice/Bob luôn ăn hai miếng kề miếng bạn chọn, ${n} miếng của bạn PHẢI không kề nhau trên vòng tròn.`,
      en: `You eat only ${n} of ${total} slices. Since Alice/Bob always take the two neighbours, your ${n} slices MUST be non-adjacent on the circle.`,
    },
    line: 4,
    vars: [{ name: "total", value: total }, { name: "n", value: n }],
  });

  phase = "reduce";
  push({
    title: { vi: "Quy về: chọn n miếng không kề trên vòng tròn", en: "Reduce: pick n non-adjacent on a circle" },
    note: {
      vi: "Vì là vòng tròn, miếng đầu và miếng cuối cũng kề nhau. Mẹo: chạy 2 lần trên mảng thẳng — Lượt A bỏ miếng cuối, Lượt B bỏ miếng đầu — rồi lấy max. Như vậy không bao giờ chọn cả đầu lẫn cuối.",
      en: "On a circle the first and last slices are also neighbours. Trick: run two linear passes — Pass A drops the last slice, Pass B drops the first — then take the max. This prevents choosing both ends.",
    },
    line: 16,
    vars: [],
  });

  // Linear DP pass on a subarray; returns { best, picks(original indices) }.
  function linearPass(passId, label, dropped, arr, off) {
    pass = passId;
    passLabel = label;
    droppedIndex = dropped;
    offset = off;
    subArr = arr;
    const m = arr.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    dpSnap = dp;
    ci = null;
    cj = null;
    curVal = null;
    skip = null;
    take = null;
    decision = null;

    phase = "pass-init";
    push({
      title: { vi: `${label}: bỏ miếng #${dropped}`, en: `${label}: drop slice #${dropped}` },
      note: {
        vi: `Xét mảng con dài ${m} (đã bỏ miếng #${dropped}). dp[i][j] = tổng lớn nhất khi chọn j miếng không kề từ ${m} miếng đầu.`,
        en: `Work on a subarray of length ${m} (slice #${dropped} removed). dp[i][j] = best sum picking j non-adjacent from the first i slices.`,
      },
      line: 8,
      vars: [{ name: "pass", value: label }, { name: "sub length", value: m }, { name: "pick n", value: n }],
    });

    const cellCap = 70;
    let pushed = 0;
    for (let i = 1; i <= m; i++) {
      const val = arr[i - 1];
      for (let j = 1; j <= n; j++) {
        const skipVal = dp[i - 1][j];
        const takeVal = i >= 2 ? dp[i - 2][j - 1] + val : (j === 1 ? val : -Infinity);
        dp[i][j] = Math.max(skipVal, takeVal);
        const chose = takeVal >= skipVal && Number.isFinite(takeVal) ? "take" : "skip";
        if (pushed < cellCap) {
          ci = i;
          cj = j;
          curVal = val;
          skip = skipVal;
          take = takeVal;
          decision = chose;
          dpSnap = dp;
          phase = "cell";
          push({
            title: { vi: `${label}: dp[${i}][${j}] = ${dp[i][j]}`, en: `${label}: dp[${i}][${j}] = ${dp[i][j]}` },
            note: chose === "take"
              ? {
                vi: `LẤY miếng #${i - 1 + off} (giá trị ${val}): take = dp[${i - 2}][${j - 1}] + ${val} = ${Number.isFinite(takeVal) ? takeVal : "-∞"} ≥ skip = ${skipVal}. Vì lấy miếng này nên phải bỏ miếng liền trước → dùng dp[i-2].`,
                en: `TAKE slice #${i - 1 + off} (value ${val}): take = dp[${i - 2}][${j - 1}] + ${val} = ${Number.isFinite(takeVal) ? takeVal : "-∞"} ≥ skip = ${skipVal}. Taking it forbids the previous slice → use dp[i-2].`,
              }
              : {
                vi: `BỎ miếng #${i - 1 + off}: skip = dp[${i - 1}][${j}] = ${skipVal} > take = ${Number.isFinite(takeVal) ? takeVal : "-∞"}.`,
                en: `SKIP slice #${i - 1 + off}: skip = dp[${i - 1}][${j}] = ${skipVal} > take = ${Number.isFinite(takeVal) ? takeVal : "-∞"}.`,
              },
            line: chose === "take" ? 12 : 11,
            vars: [
              { name: "i", value: i }, { name: "j", value: j }, { name: "arr[i-1]", value: val },
              { name: "skip", value: skipVal }, { name: "take", value: Number.isFinite(takeVal) ? takeVal : "-∞" },
              { name: "dp[i][j]", value: dp[i][j] },
            ],
          });
          pushed += 1;
        }
      }
    }

    const best = dp[m][n];
    // Trace back the picked indices.
    const chosen = [];
    let ti = m;
    let tj = n;
    while (ti > 0 && tj > 0) {
      const skipVal = dp[ti - 1][tj];
      const takeVal = ti >= 2 ? dp[ti - 2][tj - 1] + arr[ti - 1] : (tj === 1 ? arr[ti - 1] : -Infinity);
      if (Number.isFinite(takeVal) && takeVal >= skipVal) {
        chosen.push(ti - 1);
        ti -= 2;
        tj -= 1;
      } else {
        ti -= 1;
      }
    }
    chosen.reverse();
    const originalPicks = chosen.map((k) => k + off);

    ci = m;
    cj = n;
    picks = originalPicks;
    if (passId === "A") passABest = best; else passBBest = best;
    phase = "pass-result";
    push({
      title: { vi: `${label}: tổng = ${best}`, en: `${label}: sum = ${best}` },
      note: {
        vi: `${label} chọn ${chosen.length} miếng tại vị trí gốc [${originalPicks.join(", ")}], tổng = ${best}. dp[${m}][${n}] chính là ô góc dưới-phải.`,
        en: `${label} picks ${chosen.length} slices at original indices [${originalPicks.join(", ")}], sum = ${best}. dp[${m}][${n}] is the bottom-right cell.`,
      },
      line: 14,
      vars: [{ name: "pass", value: label }, { name: "picks", value: `[${originalPicks.join(", ")}]` }, { name: "best", value: best }],
    });

    return { best, picks: originalPicks };
  }

  const passA = linearPass("A", "Pass A", total - 1, slices.slice(0, total - 1), 0);
  const passB = linearPass("B", "Pass B", 0, slices.slice(1), 1);

  answer = Math.max(passA.best, passB.best);
  winner = passA.best >= passB.best ? "A" : "B";
  picks = winner === "A" ? passA.picks : passB.picks;
  pass = null;
  droppedIndex = null;
  ci = null;
  cj = null;
  phase = "final";
  push({
    title: { vi: `Đáp án = max(${passA.best}, ${passB.best}) = ${answer}`, en: `Answer = max(${passA.best}, ${passB.best}) = ${answer}` },
    note: {
      vi: `Chọn kết quả tốt hơn giữa hai lượt: Lượt ${winner} thắng với tổng ${answer}, các miếng bạn ăn ở vị trí [${picks.join(", ")}].`,
      en: `Take the better of the two passes: Pass ${winner} wins with sum ${answer}; you eat slices at [${picks.join(", ")}].`,
    },
    line: 16,
    final: true,
    vars: [{ name: "pass A", value: passA.best }, { name: "pass B", value: passB.best }, { name: "answer", value: answer }],
  });

  return { original: [...slices], answer, steps };
}

/**
 * LeetCode 474: Ones and Zeroes.
 * 0/1 knapsack with two capacities: zeros (m) and ones (n).
 * dp[z][o] = maximum number of strings using at most z zeroes and o ones.
 */
function buildSteps474(strs, params) {
  const m = Number.isFinite(Number(params.m)) ? Number(params.m) : 5;
  const n = Number.isFinite(Number(params.n)) ? Number(params.n) : 3;
  const clean = strs.map((s) => String(s));
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  const steps = [];

  function count01(str) {
    let zeros = 0;
    let ones = 0;
    for (const ch of str) {
      if (ch === "0") zeros += 1;
      else if (ch === "1") ones += 1;
    }
    return { zeros, ones };
  }

  function gridSnap(opts) {
    const vars = [];
    if (opts.idx !== undefined) vars.push({ name: "idx", value: opts.idx });
    if (opts.z !== undefined) vars.push({ name: "z", value: opts.z });
    if (opts.o !== undefined) vars.push({ name: "o", value: opts.o });
    for (const item of opts.vars || []) vars.push(item);
    steps.push({
      title: opts.title,
      arr: clean.map((s) => s.length),
      sub: clean.map((s, idx) => `${idx}: ${s}`),
      highlight: opts.idx === undefined ? [] : [opts.idx],
      mark: opts.mark || [],
      grid: {
        dp: dp.map((row) => [...row]),
        rowLabels: Array.from({ length: m + 1 }, (_, z) => ({ index: `z=${z}`, char: "0s" })),
        colLabels: Array.from({ length: n + 1 }, (_, o) => ({ index: `o=${o}`, char: "1s" })),
        largeCells: true,
        hlCell: opts.hlCell || null,
        pathCells: opts.pathCells || [],
        cellLabels: opts.cellLabels || {},
        showIndices: true,
      },
      codeLines: opts.codeLines || [],
      vars,
      note: opts.note,
      final: opts.final || false,
    });
  }

  gridSnap({
    title: { vi: `m=${m}, n=${n}`, en: `m=${m}, n=${n}` },
    codeLines: [3],
    vars: [
      { name: "strs", value: `[${clean.map((s) => `"${s}"`).join(", ")}]` },
      { name: "m", value: m },
      { name: "n", value: n },
    ],
    note: {
      vi: "dp[z][o] luu so chuoi nhieu nhat co the chon voi toi da z so 0 va o so 1.",
      en: "dp[z][o] stores the maximum number of strings using at most z zeroes and o ones.",
    },
  });

  gridSnap({
    title: { vi: "Khoi tao bang DP", en: "Initialize DP table" },
    codeLines: [5],
    vars: [{ name: "dp size", value: `${m + 1} x ${n + 1}` }],
    note: {
      vi: "Ban dau chua chon chuoi nao, moi o bang 0.",
      en: "Before choosing any string, every capacity has value 0.",
    },
  });

  clean.forEach((str, idx) => {
    const { zeros, ones } = count01(str);
    gridSnap({
      title: { vi: `Xet strs[${idx}] = "${str}"`, en: `Process strs[${idx}] = "${str}"` },
    codeLines: [5, 6, 7],
      idx,
      vars: [
        { name: "string", value: str },
        { name: "zeros", value: zeros },
        { name: "ones", value: ones },
      ],
      note: {
        vi: `"${str}" co ${zeros} so 0 va ${ones} so 1. Cap nhat nguoc de moi chuoi chi duoc dung mot lan.`,
        en: `"${str}" has ${zeros} zeroes and ${ones} ones. Iterate backward so this string is used at most once.`,
      },
    });

    if (zeros > m || ones > n) {
      gridSnap({
        title: { vi: "Bo qua: vuot capacity", en: "Skip: exceeds capacity" },
        codeLines: [9],
        idx,
        vars: [
          { name: "zeros", value: zeros },
          { name: "ones", value: ones },
          { name: "capacity", value: `m=${m}, n=${n}` },
        ],
        note: {
          vi: "Chuoi nay tu no da vuot qua so 0 hoac so 1 cho phep, nen khong cap nhat o nao.",
          en: "This string alone exceeds the allowed zero/one capacity, so no cell can be updated.",
        },
      });
      return;
    }

    for (let z = m; z >= zeros; z--) {
      gridSnap({
        title: { vi: `Loop z=${z}`, en: `Loop z=${z}` },
        codeLines: [9],
        idx,
        z,
        vars: [
          { name: "zeros", value: zeros },
          { name: "ones", value: ones },
        ],
        note: {
          vi: "Duyet z giam dan de tranh dung lai cung mot chuoi trong lan cap nhat nay.",
          en: "Scan z downward to avoid reusing the same string during this update.",
        },
      });

      for (let o = n; o >= ones; o--) {
        const skip = dp[z][o];
        const takeFrom = dp[z - zeros][o - ones];
        const take = takeFrom + 1;
        gridSnap({
          title: { vi: `Thu dat "${str}" vao dp[${z}][${o}]`, en: `Try taking "${str}" for dp[${z}][${o}]` },
          codeLines: [10, 11, 12, 13],
          idx,
          z,
          o,
          hlCell: [z, o],
          pathCells: [[z - zeros, o - ones]],
          cellLabels: { [`${z - zeros},${o - ones}`]: "take from" },
          vars: [
            { name: "skip", value: `dp[${z}][${o}] = ${skip}` },
            { name: "take", value: `dp[${z - zeros}][${o - ones}] + 1 = ${takeFrom} + 1 = ${take}` },
          ],
          note: {
            vi: `So sanh khong lay chuoi (${skip}) voi lay chuoi (${take}).`,
            en: `Compare skipping the string (${skip}) vs taking it (${take}).`,
          },
        });

        dp[z][o] = Math.max(skip, take);
        gridSnap({
          title: { vi: `dp[${z}][${o}] = ${dp[z][o]}`, en: `dp[${z}][${o}] = ${dp[z][o]}` },
          codeLines: [11, 12, 13, 14],
          idx,
          z,
          o,
          hlCell: [z, o],
          pathCells: [[z - zeros, o - ones]],
          cellLabels: { [`${z - zeros},${o - ones}`]: "take from" },
          vars: [
            { name: "skip", value: skip },
            { name: "take", value: take },
            { name: `dp[${z}][${o}]`, value: dp[z][o] },
          ],
          note: {
            vi: `Lay max(${skip}, ${take}) = ${dp[z][o]}.`,
            en: `Take max(${skip}, ${take}) = ${dp[z][o]}.`,
          },
        });
      }
    }
  });

  const answer = dp[m][n];
  gridSnap({
    title: { vi: `return dp[${m}][${n}] = ${answer}`, en: `return dp[${m}][${n}] = ${answer}` },
    codeLines: [16],
    hlCell: [m, n],
    vars: [
      { name: `dp[${m}][${n}]`, value: answer },
      { name: "return", value: answer },
    ],
    note: {
      vi: `Ket qua la ${answer} chuoi nhieu nhat co the chon.`,
      en: `The result is the maximum ${answer} strings that can be selected.`,
    },
    final: true,
  });

  return { strs: clean, m, n, answer, steps };
}

/**
 * LeetCode 494: Target Sum.
 *
 * Assign '+' or '−' to each element of nums so the signed sum equals target.
 * Return the count of such assignments.
 *
 * REDUCTION → subset sum:
 *   Let P = subset chosen with '+' sign, N = subset chosen with '−' sign.
 *   P + N = total = sum(nums)  and  P − N = target
 *   ⇒ P = (total + target) / 2
 *
 * Answer = number of subsets of nums summing to P.
 * Feasibility: (total + target) must be non-negative and even,
 *              and |target| ≤ total.
 *
 * 1D DP (same shape as bài 416 / 518):
 *   dp[j] = number of subsets summing to j
 *   dp[0] = 1
 *   for num in nums:
 *       for j in range(P, num-1, -1):     # iterate DOWN to reuse dp[j-num]
 *           dp[j] += dp[j - num]
 */
function buildSteps494(nums, params) {
  const target = params && Number.isFinite(Number(params.target)) ? Number(params.target) : 3;
  const steps = [];
  const total = nums.reduce((a, b) => a + b, 0);

  // ── Feasibility check ───────────────────────────────────
  if (Math.abs(target) > total || ((total + target) % 2 !== 0)) {
    const reason = Math.abs(target) > total
      ? `|target| = ${Math.abs(target)} > total = ${total}`
      : `(total + target) = ${total + target} là số lẻ, không chia đôi được`;
    steps.push({
      title: { vi: "Không khả thi", en: "Infeasible" },
      arr: [...nums],
      highlight: [], mark: [],
      final: true, codeLines: [3, 4],
      vars: [
        { name: "total", value: total },
        { name: "target", value: target },
        { name: "answer", value: 0 },
      ],
      note: {
        vi: `${reason}. Không tồn tại cách gán → 0.`,
        en: `${reason.replace("là số lẻ, không chia đôi được", "is odd, cannot be halved")}. No assignment exists → 0.`,
      },
    });
    return { original: [...nums], answer: 0, steps };
  }

  const P = (total + target) / 2;

  // ── Intro / reduction ───────────────────────────────────
  steps.push({
    title: { vi: "Tính tổng nums", en: "Compute total" },
    arr: [...nums],
    highlight: [], mark: [],
    codeLines: [3],
    vars: [
      { name: "nums", value: `[${nums.join(",")}]` },
      { name: "total", value: total },
    ],
    note: {
      vi: `Tổng các phần tử nums = ${total}.`, 
      en: `The sum of nums = ${total}.`, 
    },
  });

  steps.push({
    title: { vi: "Kiểm tra khả thi", en: "Check feasibility" },
    arr: [...nums],
    highlight: [], mark: [],
    codeLines: [4, 5, 6],
    vars: [
      { name: "target", value: target },
      { name: "total", value: total },
      { name: "P formula", value: `(total + target) / 2` },
    ],
    note: {
      vi: `Kiểm tra điều kiện: |target| ≤ total và (total + target) chẵn.`, 
      en: `Check condition: |target| ≤ total and (total + target) is even.`, 
    },
  });

  steps.push({
    title: { vi: "Tính P", en: "Compute P" },
    arr: [...nums],
    highlight: [], mark: [],
    codeLines: [7],
    vars: [
      { name: "P", value: P },
      { name: "total", value: total },
      { name: "target", value: target },
    ],
    note: {
      vi: `P = (total + target) / 2 = ${P}. Giờ bài trở thành subset sum với tổng ${P}.`, 
      en: `P = (total + target) / 2 = ${P}. The problem becomes subset sum to ${P}.`, 
    },
  });

  // ── DP init ─────────────────────────────────────────────
  // ── DP init ─────────────────────────────────────────────
  const dp = new Array(P + 1).fill(0);
  dp[0] = 1;

  steps.push({
    title: { vi: "Khởi tạo DP", en: "Initialize DP" },
    arr: dp.slice(),
    sub: dp.map((_, i) => String(i)),
    highlight: [0], mark: [],
    codeLines: [7, 8],
    vars: [
      { name: "P", value: P },
      { name: "dp[0]", value: 1 },
      { name: "dp", value: `[${dp.join(",")}]` },
    ],
    note: {
      vi:
        `dp[j] = số subset của các phần tử đã xét có tổng = j.\n` +
        `dp[0] = 1 (subset rỗng có tổng 0).\n` +
        `Với mỗi num, duyệt j từ P xuống num: dp[j] += dp[j - num] (0/1 knapsack: mỗi phần tử dùng ≤ 1 lần).`,
      en:
        `dp[j] = number of subsets (of elements processed so far) summing to j.\n` +
        `dp[0] = 1 (the empty subset sums to 0).\n` +
        `For each num, iterate j from P down to num: dp[j] += dp[j - num] (0/1 knapsack — each element used at most once).`,
    },
  });

  // ── Process each num ────────────────────────────────────
  for (const num of nums) {
    steps.push({
      title: { vi: `Bắt đầu num = ${num}`, en: `Start num = ${num}` },
      arr: dp.slice(),
      sub: dp.map((_, i) => String(i)),
      highlight: [],
      mark: [],
      codeLines: [9],
      vars: [
        { name: "num", value: num },
        { name: "dp (before)", value: `[${dp.join(",")}]` },
      ],
      note: {
        vi: `Xử lý num = ${num}. Duyệt j từ ${P} xuống ${num}: dp[j] += dp[j - ${num}].`,
        en: `Process num = ${num}. Iterate j from ${P} down to ${num}: dp[j] += dp[j - ${num}].`,
      },
    });

    for (let j = P; j >= num; j--) {
      const beforeValue = dp[j];
      const addWays = dp[j - num];
      const updated = addWays > 0;

      steps.push({
        title: { vi: `Xét j = ${j}`, en: `Consider j = ${j}` },
        arr: dp.slice(),
        sub: dp.map((_, i) => String(i)),
        highlight: [j, j - num],
        mark: [j - num],
        codeLines: [10],
        vars: [
          { name: "num", value: num },
          { name: "j", value: j },
          { name: `dp[${j - num}]`, value: addWays },
          { name: `dp[${j}] (before)`, value: beforeValue },
        ],
        note: updated
          ? {
              vi: `dp[${j - num}] = ${addWays} → dp[${j}] sẽ tăng từ ${beforeValue}.`, 
              en: `dp[${j - num}] = ${addWays} → dp[${j}] will increase from ${beforeValue}.`, 
            }
          : {
              vi: `dp[${j - num}] = 0 → dp[${j}] không thay đổi.`, 
              en: `dp[${j - num}] = 0 → dp[${j}] stays unchanged.`, 
            },
      });

      dp[j] += addWays;
      steps.push({
        title: { vi: `dp[${j}] += dp[${j - num}]`, en: `dp[${j}] += dp[${j - num}]` },
        arr: dp.slice(),
        sub: dp.map((_, i) => String(i)),
        highlight: [j],
        mark: [j - num],
        codeLines: [11],
        vars: [
          { name: `dp[${j}] (before)`, value: beforeValue },
          { name: `dp[${j - num}]`, value: addWays },
          { name: `dp[${j}] (after)`, value: dp[j] },
        ],
        note: updated
          ? {
              vi: `Cập nhật dp[${j}] từ ${beforeValue} thành ${dp[j]}.`, 
              en: `Updated dp[${j}] from ${beforeValue} to ${dp[j]}.`, 
            }
          : {
              vi: `dp[${j}] vẫn là ${dp[j]}.`, 
              en: `dp[${j}] remains ${dp[j]}.`, 
            },
      });
    }

    steps.push({
      title: { vi: `Sau num = ${num}`, en: `After num = ${num}` },
      arr: dp.slice(),
      sub: dp.map((_, i) => String(i)),
      highlight: Array.from({ length: P - num + 1 }, (_, x) => x + num),
      mark: [],
      codeLines: [9, 10, 11],
      vars: [
        { name: "num", value: num },
        { name: "dp (after)", value: `[${dp.join(",")}]` },
      ],
      note: {
        vi: `Hoàn tất xử lý num = ${num}. dp hiện tại = [${dp.join(",")}].`, 
        en: `Finished processing num = ${num}. Current dp = [${dp.join(",")}].`, 
      },
    });
  }
  const answer = dp[P];
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: dp.slice(),
    sub: dp.map((_, i) => String(i)),
    highlight: [], mark: [P], final: true, codeLines: [13],
    vars: [
      { name: "dp", value: `[${dp.join(",")}]` },
      { name: "dp[P]", value: answer },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Số subset có tổng = ${P} = dp[${P}] = ${answer}. Đó cũng là số cách gán dấu ± để tổng = ${target}.`,
      en: `Number of subsets summing to ${P} = dp[${P}] = ${answer}. This equals the number of ± assignments totalling ${target}.`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 1463: Cherry Pickup II.
 * 2 robots on a grid. Robot1 starts at (0,0), Robot2 at (0,cols-1).
 * Move row-by-row (down-left, down, down-right). Maximize total cherries.
 * dp[r][c1][c2] = max cherries collected starting from row r with positions (c1, c2).
 */
function buildSteps1463(input) {
  const grid = String(input).split(";").map((row) => row.split(",").map((s) => Number(s.trim())));
  const rows = grid.length, cols = grid[0].length;
  const steps = [];

  // DP bottom-up: dp[c1][c2] = max cherries from current row down
  let dp = Array.from({ length: cols }, () => new Array(cols).fill(0));
  let prev = Array.from({ length: cols }, () => new Array(cols).fill(0));

  // Grid snapshot for renderGrid
  function gridSnap(title, note, r, c1, c2, path1, path2, vars, codeLines) {
    // Build dp 2D as grid.dp for display, with column headers as indices
    const gDp = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        row.push(grid[i][j]);
      }
      gDp.push(row);
    }
    const text1 = Array.from({ length: rows }, (_, i) => String(i));
    const text2 = Array.from({ length: cols }, (_, j) => String(j));
    const hlCells = [];
    if (r >= 0) { hlCells.push([r, c1]); if (c1 !== c2) hlCells.push([r, c2]); }
    const pathCells = [];
    path1.forEach((p) => pathCells.push(p));
    path2.forEach((p) => pathCells.push(p));

    return {
      title,
      arr: [],
      grid: { dp: gDp, text1, text2, hlCell: hlCells.length > 0 ? hlCells[0] : null, pathCells },
      highlight: [], mark: [],
      codeLines: codeLines || [],
      vars: vars || [],
      note,
    };
  }

  // Intro step
  const gridStr = grid.map((r) => `[${r.join(",")}]`).join(" ");
  steps.push(gridSnap(
    { vi: "Cherry Pickup II: 2 robots trên grid", en: "Cherry Pickup II: 2 robots on grid" },
    {
      vi:
        `Grid ${rows}×${cols}. Robot 1 bắt đầu tại (0, 0), Robot 2 tại (0, ${cols - 1}).\n` +
        `Cả 2 di chuyển ĐỒNG THỜI xuống mỗi bước (↙, ↓, ↘). Thu cherry tại ô đi qua.\n` +
        `Nếu cùng ô thì chỉ thu 1 lần.\n\n` +
        `DP 3D: dp[r][c1][c2] = max cherry từ hàng r trở xuống khi robot ở (c1, c2).\n` +
        `Tính bottom-up (từ hàng cuối lên).`,
      en:
        `Grid ${rows}×${cols}. Robot 1 starts at (0, 0), Robot 2 at (0, ${cols - 1}).\n` +
        `Both move SIMULTANEOUSLY down one row per step (↙, ↓, ↘). Collect cherries at visited cells.\n` +
        `If both visit the same cell, only collect once.\n\n` +
        `3D DP: dp[r][c1][c2] = max cherries from row r down when robots are at columns (c1, c2).\n` +
        `Computed bottom-up (from the last row upward).`,
    },
    -1, -1, -1, [], [],
    [{ name: "rows", value: rows }, { name: "cols", value: cols }, { name: "grid", value: gridStr }],
    [2, 3, 4]
  ));

  // Bottom-up DP
  for (let r = rows - 1; r >= 0; r--) {
    const cur = Array.from({ length: cols }, () => new Array(cols).fill(0));
    for (let c1 = 0; c1 < cols; c1++) {
      for (let c2 = c1; c2 < cols; c2++) {
        const cherries = c1 === c2 ? grid[r][c1] : grid[r][c1] + grid[r][c2];
        let best = 0;
        if (r < rows - 1) {
          for (const dc1 of [-1, 0, 1]) {
            for (const dc2 of [-1, 0, 1]) {
              const nc1 = c1 + dc1, nc2 = c2 + dc2;
              if (nc1 >= 0 && nc1 < cols && nc2 >= 0 && nc2 < cols) {
                best = Math.max(best, prev[nc1][nc2]);
              }
            }
          }
        }
        cur[c1][c2] = cherries + best;
        cur[c2][c1] = cur[c1][c2]; // symmetric
      }
    }
    prev = cur;
    dp = cur;

    // Only show a step for a few key rows to keep it concise
    if (r === rows - 1 || r === 0 || r === Math.floor(rows / 2)) {
      steps.push(gridSnap(
        { vi: `Hàng ${r}: dp tính xong`, en: `Row ${r}: dp computed` },
        {
          vi:
            `Hàng ${r}: với mỗi cặp (c1, c2), tính dp[${r}][c1][c2] = grid[${r}][c1] + grid[${r}][c2] + max(dp[${r + 1}][...]).\n` +
            `dp[${r}][0][${cols - 1}] = ${cur[0][cols - 1]}` +
            (r === 0 ? ` ← đây chính là đáp án (robot bắt đầu ở col 0 và col ${cols - 1}).` : `.`),
          en:
            `Row ${r}: for each (c1, c2) pair, dp[${r}][c1][c2] = grid[${r}][c1] + grid[${r}][c2] + max(dp[${r + 1}][...]).\n` +
            `dp[${r}][0][${cols - 1}] = ${cur[0][cols - 1]}` +
            (r === 0 ? ` ← this is the answer (robots start at col 0 and col ${cols - 1}).` : `.`),
        },
        r, 0, cols - 1, [], [],
        [{ name: "row", value: r }, { name: "dp[r][0][cols-1]", value: cur[0][cols - 1] }],
        [6, 7, 8, 9, 10]
      ));
    }
  }

  // Reconstruct path (greedy forward from dp)
  const path1 = [[0, 0]], path2 = [[0, cols - 1]];
  let pc1 = 0, pc2 = cols - 1;

  // Rebuild dp from scratch for path reconstruction
  const fullDp = Array.from({ length: rows }, () => Array.from({ length: cols }, () => new Array(cols).fill(-1)));
  // Fill fullDp bottom-up
  for (let r = rows - 1; r >= 0; r--) {
    for (let c1 = 0; c1 < cols; c1++) {
      for (let c2 = c1; c2 < cols; c2++) {
        const ch = c1 === c2 ? grid[r][c1] : grid[r][c1] + grid[r][c2];
        let best = 0;
        if (r < rows - 1) {
          for (const dc1 of [-1, 0, 1]) for (const dc2 of [-1, 0, 1]) {
            const nc1 = c1 + dc1, nc2 = c2 + dc2;
            if (nc1 >= 0 && nc1 < cols && nc2 >= 0 && nc2 < cols) best = Math.max(best, fullDp[r + 1][nc1][nc2]);
          }
        }
        fullDp[r][c1][c2] = ch + best;
        fullDp[r][c2][c1] = fullDp[r][c1][c2];
      }
    }
  }

  for (let r = 0; r < rows - 1; r++) {
    let bestVal = -1, bc1 = pc1, bc2 = pc2;
    for (const dc1 of [-1, 0, 1]) for (const dc2 of [-1, 0, 1]) {
      const nc1 = pc1 + dc1, nc2 = pc2 + dc2;
      if (nc1 >= 0 && nc1 < cols && nc2 >= 0 && nc2 < cols && fullDp[r + 1][nc1][nc2] > bestVal) {
        bestVal = fullDp[r + 1][nc1][nc2]; bc1 = nc1; bc2 = nc2;
      }
    }
    pc1 = bc1; pc2 = bc2;
    path1.push([r + 1, pc1]); path2.push([r + 1, pc2]);
  }

  const answer = fullDp[0][0][cols - 1];
  const allPath = [...path1, ...path2];
  const fs = gridSnap(
    { vi: `Kết quả: ${answer} cherry`, en: `Result: ${answer} cherries` },
    {
      vi:
        `Max cherry = dp[0][0][${cols - 1}] = ${answer}.\n` +
        `Đường đi Robot 1: ${path1.map((p) => `(${p.join(",")})`).join("→")}\n` +
        `Đường đi Robot 2: ${path2.map((p) => `(${p.join(",")})`).join("→")}`,
      en:
        `Max cherries = dp[0][0][${cols - 1}] = ${answer}.\n` +
        `Robot 1 path: ${path1.map((p) => `(${p.join(",")})`).join("→")}\n` +
        `Robot 2 path: ${path2.map((p) => `(${p.join(",")})`).join("→")}`,
    },
    -1, -1, -1, path1, path2,
    [{ name: "answer", value: answer }],
    [11]
  );
  fs.final = true;
  steps.push(fs);

  return { input, answer, steps };
}

/**
 * LeetCode 174: Dungeon Game.
 * dp[i][j] = minimum HP needed to enter cell (i,j) and still reach (m-1,n-1) alive.
 * Fill bottom-right → top-left: dp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) - dungeon[i][j]).
 */
function buildSteps174(input) {
  const grid = String(input).split(";").map((row) => row.split(",").map((s) => Number(s.trim())));
  const m = grid.length, n = grid[0].length;
  const steps = [];

  // dp[i][j] = min HP needed when entering (i,j)
  const dp = Array.from({ length: m }, () => new Array(n).fill(Infinity));

  // Base: bottom-right corner
  dp[m - 1][n - 1] = Math.max(1, 1 - grid[m - 1][n - 1]);

  // Fill last row (right→left)
  for (let j = n - 2; j >= 0; j--) dp[m - 1][j] = Math.max(1, dp[m - 1][j + 1] - grid[m - 1][j]);
  // Fill last column (bottom→up)
  for (let i = m - 2; i >= 0; i--) dp[i][n - 1] = Math.max(1, dp[i + 1][n - 1] - grid[i][n - 1]);
  // Fill rest
  for (let i = m - 2; i >= 0; i--)
    for (let j = n - 2; j >= 0; j--)
      dp[i][j] = Math.max(1, Math.min(dp[i + 1][j], dp[i][j + 1]) - grid[i][j]);

  function gridSnap(title, note, hlCell, pathCells, vars, codeLines) {
    return {
      title,
      arr: [],
      grid: { dp, text1: Array.from({ length: m }, (_, i) => String(i)), text2: Array.from({ length: n }, (_, j) => String(j)), hlCell, pathCells: pathCells || [] },
      highlight: [], mark: [],
      codeLines: codeLines || [],
      vars: vars || [],
      note,
    };
  }

  const gridStr = grid.map((r) => `[${r.join(",")}]`).join(" ");

  steps.push(gridSnap(
    { vi: "Dungeon Game: DP ngược", en: "Dungeon Game: Reverse DP" },
    {
      vi:
        `Grid ${m}×${n}: ${gridStr}\n` +
        `Hiệp sĩ đi từ (0,0) → (${m - 1},${n - 1}), chỉ đi phải hoặc xuống.\n` +
        `HP phải luôn ≥ 1 tại MỌI ô (bao gồm cả ô cuối).\n\n` +
        `Ý tưởng: DP NGƯỢC từ góc dưới-phải → trên-trái.\n` +
        `dp[i][j] = HP TỐI THIỂU cần có KHI VÀO ô (i,j) để sống tới đích.\n` +
        `dp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) − grid[i][j]).\n` +
        `Đáp án = dp[0][0].`,
      en:
        `Grid ${m}×${n}: ${gridStr}\n` +
        `Knight goes from (0,0) → (${m - 1},${n - 1}), can only move right or down.\n` +
        `HP must stay ≥ 1 at EVERY cell (including the last one).\n\n` +
        `Idea: REVERSE DP from bottom-right → top-left.\n` +
        `dp[i][j] = minimum HP required UPON ENTERING cell (i,j) to survive to the goal.\n` +
        `dp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) − grid[i][j]).\n` +
        `Answer = dp[0][0].`,
    },
    null, [],
    [{ name: "rows", value: m }, { name: "cols", value: n }, { name: "dungeon", value: gridStr }],
    [2, 3, 4]
  ));

  // Show dp filled step by step for a few key cells
  steps.push(gridSnap(
    { vi: `dp[${m-1}][${n-1}] = ${dp[m-1][n-1]}`, en: `dp[${m-1}][${n-1}] = ${dp[m-1][n-1]}` },
    {
      vi: `Ô đích (${m-1},${n-1}): dungeon=${grid[m-1][n-1]}. Cần HP ≥ 1 SAU khi chịu damage.\ndp = max(1, 1 − ${grid[m-1][n-1]}) = ${dp[m-1][n-1]}.`,
      en: `Goal cell (${m-1},${n-1}): dungeon=${grid[m-1][n-1]}. Need HP ≥ 1 AFTER taking damage.\ndp = max(1, 1 − ${grid[m-1][n-1]}) = ${dp[m-1][n-1]}.`,
    },
    [m-1, n-1], [],
    [{ name: "cell", value: `(${m-1},${n-1})` }, { name: "dungeon", value: grid[m-1][n-1] }, { name: "dp", value: dp[m-1][n-1] }],
    [5, 6]
  ));

  // Show last row and last column
  steps.push(gridSnap(
    { vi: "Điền hàng cuối & cột cuối", en: "Fill last row & last column" },
    {
      vi: `Hàng cuối (chỉ đi phải): dp[${m-1}][j] = max(1, dp[${m-1}][j+1] − grid[${m-1}][j]).\nCột cuối (chỉ đi xuống): dp[i][${n-1}] = max(1, dp[i+1][${n-1}] − grid[i][${n-1}]).`,
      en: `Last row (can only go right): dp[${m-1}][j] = max(1, dp[${m-1}][j+1] − grid[${m-1}][j]).\nLast col (can only go down): dp[i][${n-1}] = max(1, dp[i+1][${n-1}] − grid[i][${n-1}]).`,
    },
    null, [],
    [{ name: "dp last row", value: `[${dp[m-1].join(",")}]` }, { name: "dp last col", value: `[${dp.map((r) => r[n-1]).join(",")}]` }],
    [7, 8]
  ));

  // Show remaining cells
  steps.push(gridSnap(
    { vi: "Điền phần còn lại (bottom-right → top-left)", en: "Fill remaining cells (bottom-right → top-left)" },
    {
      vi: `Với mỗi ô (i,j) từ (${m-2},${n-2}) lên (0,0):\ndp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) − grid[i][j]).\nĐi theo hướng nào cần ít HP hơn.`,
      en: `For each cell (i,j) from (${m-2},${n-2}) to (0,0):\ndp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) − grid[i][j]).\nGo in the direction requiring less HP.`,
    },
    [0, 0], [],
    [{ name: "dp[0][0]", value: dp[0][0] }],
    [9, 10, 11]
  ));

  // Reconstruct path
  const path = [[0, 0]];
  let ci = 0, cj = 0;
  while (ci < m - 1 || cj < n - 1) {
    if (ci === m - 1) { cj++; }
    else if (cj === n - 1) { ci++; }
    else { if (dp[ci + 1][cj] <= dp[ci][cj + 1]) ci++; else cj++; }
    path.push([ci, cj]);
  }

  const answer = dp[0][0];
  const fs = gridSnap(
    { vi: `Đáp án: HP tối thiểu = ${answer}`, en: `Answer: minimum HP = ${answer}` },
    {
      vi: `dp[0][0] = ${answer}. Hiệp sĩ cần BẮT ĐẦU với ít nhất ${answer} HP để sống qua mọi ô.\nĐường đi: ${path.map((p) => `(${p.join(",")})`).join("→")}.`,
      en: `dp[0][0] = ${answer}. Knight must START with at least ${answer} HP to survive every cell.\nPath: ${path.map((p) => `(${p.join(",")})`).join("→")}.`,
    },
    null, path,
    [{ name: "answer", value: answer }, { name: "path", value: path.map((p) => `(${p.join(",")})`).join("→") }],
    [12]
  );
  fs.final = true;
  steps.push(fs);

  return { input, answer, steps };
}

/**
 * LeetCode 1049: Last Stone Weight II.
 * Equivalent to partitioning stones into 2 groups to minimize |sum1 - sum2|.
 * Same as 416 but find the closest-to-half subset sum.
 * dp[j] = true if we can achieve total weight j with a subset of stones.
 */
function buildSteps1049(nums) {
  const steps = [];
  const total = nums.reduce((a, b) => a + b, 0);
  const target = Math.floor(total / 2);
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;

  const trueIndices = () => dp.map((v, i) => v ? i : null).filter(x => x !== null);

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: dp.map((v) => (v ? 1 : 0)),
    sub: dp.map((_, i) => String(i)),
    highlight: [0], mark: [], codeLines: [3, 4, 5, 6],
    vars: [
      { name: "stones", value: `[${nums.join(",")}]` },
      { name: "sum", value: total },
      { name: "target", value: `floor(${total}/2) = ${target}` },
      { name: "dp (true)", value: `{${trueIndices().join(", ")}}` },
    ],
    note: {
      vi:
        `Bài toán tương đương: chia đá thành 2 nhóm sao cho |sum1 - sum2| TỐI THIỂU.\n` +
        `= Tìm subset có tổng GẦN total/2 nhất (0/1 Knapsack).\n` +
        `dp[j] = True nếu tổng j đạt được. target = floor(${total}/2) = ${target}.\n` +
        `Đáp án = total - 2 * (tổng lớn nhất đạt được ≤ target).`,
      en:
        `Equivalent: partition stones into 2 groups minimizing |sum1 - sum2|.\n` +
        `= Find a subset sum as CLOSE to total/2 as possible (0/1 Knapsack).\n` +
        `dp[j] = True if sum j is achievable. target = floor(${total}/2) = ${target}.\n` +
        `Answer = total - 2 * (largest achievable sum ≤ target).`,
    },
  });

  for (const stone of nums) {
    const changed = [];
    for (let j = target; j >= stone; j--) {
      if (!dp[j] && dp[j - stone]) {
        dp[j] = true;
        changed.push(j);
      }
    }

    steps.push({
      title: { vi: `Thêm đá ${stone}`, en: `Add stone ${stone}` },
      arr: dp.map((v) => (v ? 1 : 0)),
      sub: dp.map((_, i) => String(i)),
      highlight: changed,
      mark: [],
      codeLines: [7, 8, 9],
      vars: [
        { name: "stone", value: stone },
        { name: "new sums", value: changed.length > 0 ? `[${changed.join(",")}]` : "none" },
        { name: "dp (true)", value: `{${trueIndices().join(", ")}}` },
      ],
      note: {
        vi: `Xử lý stone=${stone}: tổng mới đạt được = [${changed.join(",")}].`,
        en: `Process stone=${stone}: newly reachable sums = [${changed.join(",")}].`,
      },
    });
  }

  // Find largest j where dp[j] is true
  let bestJ = 0;
  for (let j = target; j >= 0; j--) {
    if (dp[j]) { bestJ = j; break; }
  }
  const answer = total - 2 * bestJ;

  const fs = {
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: dp.map((v) => (v ? 1 : 0)),
    sub: dp.map((_, i) => String(i)),
    highlight: [bestJ], mark: [bestJ], final: true, codeLines: [10],
    vars: [
      { name: "best subset sum", value: bestJ },
      { name: "answer", value: `${total} - 2×${bestJ} = ${answer}` },
      { name: "dp (true)", value: `{${trueIndices().join(", ")}}` },
    ],
    note: {
      vi: `Tổng lớn nhất đạt được ≤ ${target} là ${bestJ}.\nĐáp án = ${total} - 2×${bestJ} = ${answer}.\n(Nhóm 1 nặng ${bestJ}, nhóm 2 nặng ${total - bestJ}, hiệu = ${answer}.)`,
      en: `Largest achievable sum ≤ ${target} is ${bestJ}.\nAnswer = ${total} - 2×${bestJ} = ${answer}.\n(Group 1 weighs ${bestJ}, group 2 weighs ${total - bestJ}, difference = ${answer}.)`,
    },
  };
  steps.push(fs);

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 5: Longest Palindromic Substring.
 * Expand around every possible center. Odd center: (c, c), even center: (c, c+1).
 */
function buildSteps5(input) {
  const s = typeof input === "string" ? input.trim() : String(input);
  const steps = [];
  let bestStart = 0;
  let bestEnd = 0;
  const n = s.length;

  function charsGrid(opts = {}) {
    const labels = {};
    if (opts.center !== undefined && opts.center >= 0 && opts.center < n) labels[`0,${opts.center + 1}`] = "center";
    if (opts.left !== undefined && opts.left >= 0 && opts.left < n) labels[`0,${opts.left + 1}`] = "L";
    if (opts.right !== undefined && opts.right >= 0 && opts.right < n) labels[`0,${opts.right + 1}`] = labels[`0,${opts.right + 1}`] ? "L/R" : "R";
    const pathCells = [];
    if (opts.range) {
      for (let k = opts.range[0]; k <= opts.range[1]; k++) {
        if (k >= 0 && k < n) pathCells.push([0, k + 1]);
      }
    }
    const bestCells = n > 0
      ? [[0, bestStart + 1], [0, bestEnd + 1]]
      : [];
    return {
      dp: [["", ...s.split("")]],
      text1: "",
      text2: s,
      colLabels: s.split("").map((ch, idx) => ({ index: `idx=${idx}`, char: ch })),
      hlCell: opts.left !== undefined && opts.left >= 0 && opts.left < n ? [0, opts.left + 1] : null,
      pathCells,
      bestCells,
      cellLabels: labels,
      largeCells: true,
    };
  }

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      grid: charsGrid(opts),
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: [
        ...(opts.center !== undefined ? [{ name: "center", value: opts.center }] : []),
        ...(opts.left !== undefined ? [{ name: "left", value: opts.left }] : []),
        ...(opts.right !== undefined ? [{ name: "right", value: opts.right }] : []),
        { name: "best", value: n ? `"${s.slice(bestStart, bestEnd + 1)}"` : '""' },
        { name: "best_start", value: n ? bestStart : "" },
        { name: "best_end", value: n ? bestEnd : "" },
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: opts.final || false,
    });
  }

  snap({
    title: { vi: "Khoi tao best", en: "Initialize best" },
    codeLines: [3],
    vars: [{ name: "s", value: `"${s}"` }, { name: "n", value: n }],
    note: {
      vi: "Ta se thu moi vi tri lam tam palindrome, gom ca tam le va tam chan.",
      en: "Try every position as a palindrome center, including odd and even centers.",
    },
  });

  if (n === 0) {
    snap({
      title: { vi: "Chuoi rong", en: "Empty string" },
      codeLines: [17],
      vars: [{ name: "return", value: '""' }],
      note: { vi: "Chuoi rong tra ve chuoi rong.", en: "Empty string returns an empty string." },
      final: true,
    });
    return { s, answer: "", steps };
  }

  function expand(left, right, center, kind) {
    snap({
      title: { vi: `${kind}: start left=${left}, right=${right}`, en: `${kind}: start left=${left}, right=${right}` },
      codeLines: kind === "Odd" ? [14] : [15],
      center,
      left,
      right,
      range: [Math.max(0, left), Math.min(n - 1, right)],
      vars: [{ name: "kind", value: kind }],
      note: {
        vi: kind === "Odd" ? "Tam le bat dau tu cung mot ky tu." : "Tam chan bat dau giua hai ky tu lien tiep.",
        en: kind === "Odd" ? "Odd center starts from one character." : "Even center starts between two adjacent characters.",
      },
    });

    while (left >= 0 && right < n && s[left] === s[right]) {
      snap({
        title: { vi: `Match '${s[left]}' va '${s[right]}'`, en: `Match '${s[left]}' and '${s[right]}'` },
        codeLines: [7],
        center,
        left,
        right,
        range: [left, right],
        vars: [{ name: "current palindrome", value: `"${s.slice(left, right + 1)}"` }],
        note: {
          vi: `s[${left}] == s[${right}], doan "${s.slice(left, right + 1)}" la palindrome.`,
          en: `s[${left}] == s[${right}], so "${s.slice(left, right + 1)}" is a palindrome.`,
        },
      });

      const shouldUpdateBest = right - left > bestEnd - bestStart;
      snap({
        title: { vi: `Kiem tra co cap nhat best`, en: `Check whether to update best` },
        codeLines: [8],
        center,
        left,
        right,
        range: [left, right],
        vars: [
          { name: "current length", value: right - left + 1 },
          { name: "best length", value: bestEnd - bestStart + 1 },
          { name: "condition", value: shouldUpdateBest },
        ],
        note: shouldUpdateBest
          ? {
              vi: "Palindrome hien tai dai hon best cu, nen dong tiep theo se cap nhat best.",
              en: "The current palindrome is longer than the previous best, so the next line updates best.",
            }
          : {
              vi: "Palindrome hien tai khong dai hon best cu, nen giu nguyen best.",
              en: "The current palindrome is not longer than the previous best, so keep best unchanged.",
            },
      });

      if (shouldUpdateBest) {

        bestStart = left;
        bestEnd = right;
        snap({
          title: { vi: `Cap nhat best = "${s.slice(bestStart, bestEnd + 1)}"`, en: `Update best = "${s.slice(bestStart, bestEnd + 1)}"` },
          codeLines: [9],
          center,
          left,
          right,
          range: [left, right],
          vars: [
            { name: "new length", value: right - left + 1 },
          ],
          note: {
            vi: "Palindrome hien tai dai hon best cu, nen luu lai range nay.",
            en: "The current palindrome is longer than the previous best, so save this range.",
          },
        });
      }

      left -= 1;
      right += 1;
      snap({
        title: { vi: "left -= 1", en: "left -= 1" },
        codeLines: [10],
        center,
        left,
        right: right - 1,
        range: [Math.max(0, left + 1), Math.min(n - 1, right - 1)],
        note: {
          vi: "Giam left de chuan bi thu palindrome lon hon.",
          en: "Move left down to prepare for a larger palindrome.",
        },
      });
      snap({
        title: { vi: "right += 1", en: "right += 1" },
        codeLines: [11],
        center,
        left,
        right,
        range: [Math.max(0, left + 1), Math.min(n - 1, right - 1)],
        note: {
          vi: "Tang right; lan lap tiep theo se kiem tra bien va so sanh hai dau.",
          en: "Move right up; the next loop iteration checks bounds and compares both ends.",
        },
      });
    }

    const reason = left < 0
      ? "left < 0"
      : right >= n
        ? "right >= len(s)"
        : `s[${left}] != s[${right}]`;
    snap({
      title: { vi: `Dung expand: ${reason}`, en: `Stop expanding: ${reason}` },
      codeLines: [7],
      center,
      left,
      right,
      range: [Math.max(0, left + 1), Math.min(n - 1, right - 1)],
      vars: [{ name: "stop reason", value: reason }],
      note: {
        vi: "Khong the mo rong palindrome nay them nua.",
        en: "This palindrome cannot be expanded any further.",
      },
    });
  }

  for (let center = 0; center < n; center++) {
    snap({
      title: { vi: `for center = ${center}`, en: `for center = ${center}` },
      codeLines: [13],
      center,
      left: center,
      right: center,
      range: [center, center],
      note: {
        vi: `Thu tam tai index ${center}, ky tu '${s[center]}'.`,
        en: `Try center at index ${center}, character '${s[center]}'.`,
      },
    });
    expand(center, center, center, "Odd");
    expand(center, center + 1, center, "Even");
  }

  const answer = s.slice(bestStart, bestEnd + 1);
  snap({
    title: { vi: `return "${answer}"`, en: `return "${answer}"` },
    codeLines: [17],
    range: [bestStart, bestEnd],
    vars: [{ name: "return", value: `"${answer}"` }],
    note: {
      vi: `Longest palindromic substring la "${answer}".`,
      en: `The longest palindromic substring is "${answer}".`,
    },
    final: true,
  });

  return { s, answer, steps };
}

/**
 * LeetCode 5 — Approach 2: 2D DP table.
 * dp[i][j] = True if s[i..j] is a palindrome.
 * Base cases: dp[i][i] = True (length 1), dp[i][i+1] = (s[i]==s[i+1]) (length 2).
 * Recurrence: dp[i][j] = (s[i]==s[j]) and dp[i+1][j-1], processed by increasing length
 * so the shorter inner interval dp[i+1][j-1] is already known.
 */
function buildSteps5DP(input) {
  const s = typeof input === "string" ? input.trim() : String(input);
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(false));
  const steps = [];
  let bestStart = 0;
  let bestEnd = 0;
  let bestInitialized = false;

  const axisLabels = Array.from({ length: n }, (_, idx) => s[idx]);

  function makeGrid(hl = null, deps = []) {
    // display[i+1][j+1] = dp[i][j]. In Python every cell is False (dp is a full
    // n×n matrix), but only i<=j is ever USED. Lower triangle (j<i) is shown
    // muted so it's clear it holds False yet is never accessed.
    const display = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(""));
    const mutedCells = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        display[i + 1][j + 1] = dp[i][j] ? "T" : "F";
        if (j < i) mutedCells.push([i + 1, j + 1]); // unused lower triangle
      }
    }
    const shift = (cell) => (cell ? [cell[0] + 1, cell[1] + 1] : null);
    const bestShifted = bestInitialized && n > 0 && dp[bestStart][bestEnd]
      ? shift([bestStart, bestEnd])
      : null;
    return {
      dp: display,
      text1: s,
      text2: s,
      rowLabels: axisLabels.map((char, idx) => ({ index: `i=${idx}`, char })),
      colLabels: axisLabels.map((char, idx) => ({ index: `j=${idx}`, char })),
      hlCell: shift(hl),
      pathCells: deps.map(shift).filter(Boolean),
      bestCell: bestShifted,
      mutedCells,
    };
  }

  function gridSnap(opts) {
    const hasActiveCell = Array.isArray(opts.hlCell);
    const currentVars = [];
    if (hasActiveCell) {
      const [i, j] = opts.hlCell;
      currentVars.push({ name: "i", value: i });
      currentVars.push({ name: "j", value: j });
      currentVars.push({ name: "length", value: j - i + 1 });
      currentVars.push({ name: "substring", value: `"${s.slice(i, j + 1)}"` });
    }
    for (const item of opts.vars || []) {
      if (["i", "j", "length", "substring"].includes(item.name) && hasActiveCell) continue;
      currentVars.push(item);
    }
    if (bestInitialized) {
      if (!currentVars.some((item) => item.name === "best")) {
        currentVars.push({ name: "best", value: `"${s.slice(bestStart, bestEnd + 1)}"` });
      }
      if (!currentVars.some((item) => item.name === "best_start")) {
        currentVars.push({ name: "best_start", value: bestStart });
      }
      if (!currentVars.some((item) => item.name === "best_end")) {
        currentVars.push({ name: "best_end", value: bestEnd });
      }
    }
    steps.push({
      title: opts.title,
      arr: [],
      grid: makeGrid(opts.hlCell || null, opts.pathCells || []),
      highlight: [],
      mark: [],
      codeBlock: 2,
      codeLines: opts.codeLines || [],
      vars: currentVars,
      note: opts.note,
      final: opts.final || false,
    });
  }

  // Line 3: n = len(s)
  gridSnap({
    title: { vi: "n = len(s)", en: "n = len(s)" },
    codeLines: [3],
    vars: [{ name: "s", value: `"${s}"` }, { name: "n", value: n }],
    note: {
      vi: `Chuỗi "${s}" có độ dài n=${n}.`,
      en: `String "${s}" has length n=${n}.`,
    },
  });

  // Line 4: dp = [[False]*n for _ in range(n)]
  gridSnap({
    title: { vi: "dp = bảng n×n toàn False", en: "dp = n×n table of False" },
    codeLines: [4],
    vars: [{ name: "dp size", value: `${n} x ${n}` }],
    note: {
      vi: `dp[i][j] = True nếu s[i..j] là palindrome. Khởi tạo toàn False.`,
      en: `dp[i][j] = True if s[i..j] is a palindrome. Initialize all False.`,
    },
  });

  // Line 5: best_start, best_end = 0, 0
  bestInitialized = true;
  gridSnap({
    title: { vi: "best_start, best_end = 0, 0", en: "best_start, best_end = 0, 0" },
    codeLines: [5],
    vars: [{ name: "best_start", value: 0 }, { name: "best_end", value: 0 }],
    note: n > 0
      ? {
          vi: `Mặc định palindrome tốt nhất ban đầu là s[0] (độ dài 1).`,
          en: `Default best palindrome initially is s[0] (length 1).`,
        }
      : {
          vi: "Hai index vẫn được khởi tạo bằng 0; lát cắt trên chuỗi rỗng sẽ trả về chuỗi rỗng.",
          en: "Both indices are still initialized to 0; slicing the empty string will return an empty string.",
        },
  });

  if (n === 0) {
    gridSnap({
      title: { vi: "return chuỗi rỗng", en: "return empty string" },
      codeLines: [22],
      vars: [{ name: "answer", value: '""' }],
      note: { vi: "Các vòng lặp không chạy; lát cắt s[0:1] vẫn là chuỗi rỗng.", en: "The loops do not run; the slice s[0:1] is still an empty string." },
      final: true,
    });
    return { s, answer: "", steps };
  }

  // Line 7-8: base case length 1
  for (let i = 0; i < n; i++) {
    // Line 7: for i in range(n)
    gridSnap({
      title: { vi: `for i=${i}`, en: `for i=${i}` },
      codeLines: [7],
      hlCell: [i, i],
      vars: [{ name: "i", value: i }],
      note: {
        vi: `Xét vị trí i=${i}.`,
        en: `Consider position i=${i}.`,
      },
    });

    // Line 8: dp[i][i] = True
    dp[i][i] = true;
    gridSnap({
      title: { vi: `dp[${i}][${i}] = True`, en: `dp[${i}][${i}] = True` },
      codeLines: [8],
      hlCell: [i, i],
      vars: [{ name: `s[${i}]`, value: s[i] }, { name: `dp[${i}][${i}]`, value: true }],
      note: {
        vi: `Một ký tự luôn là palindrome. dp[${i}][${i}] = True.`,
        en: `A single character is always a palindrome. dp[${i}][${i}] = True.`,
      },
    });
  }

  // Line 10-12: base case length 2
  for (let i = 0; i < n - 1; i++) {
    // Line 10: for i in range(n - 1)
    gridSnap({
      title: { vi: `for i=${i} (độ dài 2)`, en: `for i=${i} (length 2)` },
      codeLines: [10],
      hlCell: [i, i + 1],
      vars: [{ name: "i", value: i }, { name: `s[${i}]`, value: s[i] }, { name: `s[${i + 1}]`, value: s[i + 1] }],
      note: {
        vi: `Xét đoạn 2 ký tự s[${i}..${i + 1}] = "${s.slice(i, i + 2)}".`,
        en: `Consider 2-character substring s[${i}..${i + 1}] = "${s.slice(i, i + 2)}".`,
      },
    });

    const match2 = s[i] === s[i + 1];
    // Line 11: if s[i] == s[i+1]
    gridSnap({
      title: { vi: `if s[${i}]==s[${i + 1}] → ${match2}`, en: `if s[${i}]==s[${i + 1}] → ${match2}` },
      codeLines: [11],
      hlCell: [i, i + 1],
      vars: [
        { name: `s[${i}]`, value: s[i] },
        { name: `s[${i + 1}]`, value: s[i + 1] },
        { name: "match?", value: match2 },
      ],
      note: match2
        ? { vi: `'${s[i]}' == '${s[i + 1]}' → True. "${s.slice(i, i + 2)}" là palindrome.`, en: `'${s[i]}' == '${s[i + 1]}' → True. "${s.slice(i, i + 2)}" is a palindrome.` }
        : { vi: `'${s[i]}' ≠ '${s[i + 1]}' → False. Bỏ qua.`, en: `'${s[i]}' ≠ '${s[i + 1]}' → False. Skip.` },
    });

    if (match2) {
      // Line 12-13: dp[i][i+1] = True; best_start, best_end = i, i+1
      dp[i][i + 1] = true;
      gridSnap({
        title: { vi: `dp[${i}][${i + 1}] = True`, en: `dp[${i}][${i + 1}] = True` },
        codeLines: [12],
        hlCell: [i, i + 1],
        vars: [{ name: `dp[${i}][${i + 1}]`, value: true }],
        note: {
          vi: `Đánh dấu "${s.slice(i, i + 2)}" là palindrome độ dài 2.`,
          en: `Mark "${s.slice(i, i + 2)}" as a length-2 palindrome.`,
        },
      });

      bestStart = i;
      bestEnd = i + 1;
      gridSnap({
        title: { vi: `best = "${s.slice(i, i + 2)}"`, en: `best = "${s.slice(i, i + 2)}"` },
        codeLines: [13],
        hlCell: [i, i + 1],
        vars: [{ name: "best_start, best_end", value: `${i}, ${i + 1}` }],
        note: {
          vi: `Cập nhật best = "${s.slice(i, i + 2)}".`,
          en: `Update best = "${s.slice(i, i + 2)}".`,
        },
      });
    }
  }

  // Lines 15-19: length >= 3
  for (let length = 3; length <= n; length++) {
    // Line 15: for length in range(3, n+1)
    gridSnap({
      title: { vi: `for length=${length}`, en: `for length=${length}` },
      codeLines: [15],
      vars: [{ name: "length", value: length }],
      note: {
        vi: `Xét mọi đoạn con có độ dài ${length}.`,
        en: `Consider every substring of length ${length}.`,
      },
    });

    for (let i = 0; i <= n - length; i++) {
      const j = i + length - 1;

      // Line 16-17: for i, compute j
      gridSnap({
        title: { vi: `for i=${i}`, en: `for i=${i}` },
        codeLines: [16],
        vars: [
          { name: "i", value: i },
          { name: "length", value: length },
        ],
        note: {
          vi: `Bắt đầu lượt i=${i} cho độ dài ${length}.`,
          en: `Start the i=${i} iteration for length ${length}.`,
        },
      });

      gridSnap({
        title: { vi: `j = ${j}`, en: `j = ${j}` },
        codeLines: [17],
        hlCell: [i, j],
        vars: [
          { name: "i", value: i },
          { name: "j = i+length-1", value: j },
          { name: "substring", value: `"${s.slice(i, j + 1)}"` },
        ],
        note: {
          vi: `Tính j=${j}; chuẩn bị xét dp[${i}][${j}] cho đoạn "${s.slice(i, j + 1)}".`,
          en: `Compute j=${j}; prepare to check dp[${i}][${j}] for substring "${s.slice(i, j + 1)}".`,
        },
      });

      const endsMatch = s[i] === s[j];
      const innerOk = dp[i + 1][j - 1];
      const isPalin = endsMatch && innerOk;

      // Line 18: if s[i]==s[j] and dp[i+1][j-1]
      gridSnap({
        title: {
          vi: `if s[${i}]==s[${j}] và dp[${i + 1}][${j - 1}] → ${isPalin}`,
          en: `if s[${i}]==s[${j}] and dp[${i + 1}][${j - 1}] → ${isPalin}`,
        },
        codeLines: [18],
        hlCell: [i, j],
        pathCells: endsMatch ? [[i + 1, j - 1]] : [],
        vars: [
          { name: `s[${i}]`, value: s[i] },
          { name: `s[${j}]`, value: s[j] },
          { name: "ends match?", value: endsMatch },
          { name: `dp[${i + 1}][${j - 1}]`, value: endsMatch ? innerOk : "skipped" },
          { name: "inner substring", value: endsMatch ? `"${s.slice(i + 1, j)}"` : "not read" },
          { name: "condition", value: isPalin },
        ],
        note: isPalin
          ? { vi: `'${s[i]}'=='${s[j]}' và dp[${i + 1}][${j - 1}]=True → "${s.slice(i, j + 1)}" là palindrome!`, en: `'${s[i]}'=='${s[j]}' and dp[${i + 1}][${j - 1}]=True → "${s.slice(i, j + 1)}" is a palindrome!` }
          : { vi: !endsMatch ? `'${s[i]}' ≠ '${s[j]}' → không phải palindrome.` : `Đầu khớp nhưng dp[${i + 1}][${j - 1}]=False → không phải palindrome.`, en: !endsMatch ? `'${s[i]}' ≠ '${s[j]}' → not a palindrome.` : `Ends match but dp[${i + 1}][${j - 1}]=False → not a palindrome.` },
      });

      if (isPalin) {
        // Line 19-20: dp[i][j] = True; best_start, best_end = i, j
        dp[i][j] = true;
        gridSnap({
          title: { vi: `dp[${i}][${j}] = True`, en: `dp[${i}][${j}] = True` },
          codeLines: [19],
          hlCell: [i, j],
          pathCells: [[i + 1, j - 1]],
          vars: [{ name: `dp[${i}][${j}]`, value: true }],
          note: {
            vi: `Đánh dấu "${s.slice(i, j + 1)}" là palindrome.`,
            en: `Mark "${s.slice(i, j + 1)}" as a palindrome.`,
          },
        });

        bestStart = i;
        bestEnd = j;
        gridSnap({
          title: { vi: `best = "${s.slice(i, j + 1)}"`, en: `best = "${s.slice(i, j + 1)}"` },
          codeLines: [20],
          hlCell: [i, j],
          pathCells: [[i + 1, j - 1]],
          vars: [{ name: "best_start, best_end", value: `${i}, ${j}` }],
          note: {
            vi: `Cập nhật best = "${s.slice(i, j + 1)}" (độ dài ${length}).`,
            en: `Update best = "${s.slice(i, j + 1)}" (length ${length}).`,
          },
        });
      }
    }
  }

  const answer = s.slice(bestStart, bestEnd + 1);
  // Line 22: return s[best_start:best_end+1]
  gridSnap({
    title: { vi: `return "${answer}"`, en: `return "${answer}"` },
    codeLines: [22],
    hlCell: [bestStart, bestEnd],
    vars: [{ name: "best_start", value: bestStart }, { name: "best_end", value: bestEnd }, { name: "answer", value: `"${answer}"` }],
    note: {
      vi: `Longest palindromic substring = "${answer}".`,
      en: `Longest palindromic substring = "${answer}".`,
    },
    final: true,
  });

  return { s, answer, steps };
}

/**
 * LeetCode 516: Longest Palindromic Subsequence.
 * Interval DP:
 *   dp[i][j] = length of the longest palindromic subsequence inside s[i..j].
 *   dp[i][i] = 1.
 *   if s[i] == s[j]: dp[i][j] = dp[i+1][j-1] + 2
 *   else: dp[i][j] = max(dp[i+1][j], dp[i][j-1])
 */
function buildSteps516(input) {
  const s = typeof input === "string" ? input.trim() : String(input);
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  const steps = [];
  const axisLabels = Array.from({ length: n }, (_, idx) => ({
    index: `i/j=${idx}`,
    char: s[idx],
  }));

  function makeGrid(hl = null, deps = []) {
    const display = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(""));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        display[i + 1][j + 1] = i <= j ? dp[i][j] : "";
      }
    }
    const shift = (cell) => cell ? [cell[0] + 1, cell[1] + 1] : null;
    return {
      dp: display,
      text1: s,
      text2: s,
      rowLabels: axisLabels.map(({ char }, idx) => ({ index: `i=${idx}`, char })),
      colLabels: axisLabels.map(({ char }, idx) => ({ index: `j=${idx}`, char })),
      hlCell: shift(hl),
      pathCells: deps.map(shift).filter(Boolean),
    };
  }

  function gridSnap(opts) {
    const hasActiveCell = Array.isArray(opts.hlCell);
    const currentVars = [];
    if (hasActiveCell) {
      currentVars.push({ name: "i", value: opts.hlCell[0] });
      currentVars.push({ name: "j", value: opts.hlCell[1] });
    }
    for (const item of opts.vars || []) {
      if ((item.name === "i" || item.name === "j") && hasActiveCell) continue;
      currentVars.push(item);
    }
    steps.push({
      title: opts.title,
      arr: [],
      grid: makeGrid(opts.hlCell || null, opts.pathCells || []),
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: currentVars,
      note: opts.note,
    });
  }

  gridSnap({
    title: { vi: "n = len(s)", en: "n = len(s)" },
    codeLines: [3],
    vars: [
      { name: "s", value: `"${s}"` },
      { name: "n", value: n },
    ],
    note: {
      vi: `Chuỗi "${s}" có độ dài n=${n}.`,
      en: `String "${s}" has length n=${n}.`,
    },
  });

  gridSnap({
    title: { vi: "Tạo bảng dp", en: "Create dp table" },
    codeLines: [4],
    vars: [
      { name: "dp size", value: `${n} x ${n}` },
      { name: "initial value", value: 0 },
    ],
    note: {
      vi: "dp[i][j] = độ dài palindromic subsequence dài nhất trong đoạn s[i..j].",
      en: "dp[i][j] = length of the longest palindromic subsequence inside s[i..j].",
    },
  });

  if (n === 0) {
    gridSnap({
      title: { vi: "Chuỗi rỗng", en: "Empty string" },
      codeLines: [11],
      vars: [{ name: "answer", value: 0 }],
      note: { vi: "Chuỗi rỗng có đáp án 0.", en: "An empty string has answer 0." },
    });
    steps[steps.length - 1].final = true;
    return { s, answer: 0, steps };
  }

  for (let i = n - 1; i >= 0; i--) {
    gridSnap({
      title: { vi: `Vòng ngoài i=${i}`, en: `Outer loop i=${i}` },
      codeLines: [5],
      hlCell: [i, i],
      vars: [
        { name: "i", value: i },
        { name: `s[${i}]`, value: s[i] },
      ],
      note: {
        vi: `Đi từ phải sang trái để các đoạn con ngắn hơn đã có sẵn khi tính dp[i][j].`,
        en: `Move right-to-left so shorter intervals are already known when computing dp[i][j].`,
      },
    });

    dp[i][i] = 1;
    gridSnap({
      title: { vi: `Base: dp[${i}][${i}] = 1`, en: `Base: dp[${i}][${i}] = 1` },
      codeLines: [6],
      hlCell: [i, i],
      vars: [
        { name: `s[${i}]`, value: s[i] },
        { name: `dp[${i}][${i}]`, value: 1 },
      ],
      note: {
        vi: `Một ký tự luôn là palindrome độ dài 1.`,
        en: `A single character is always a palindrome of length 1.`,
      },
    });

    for (let j = i + 1; j < n; j++) {
      gridSnap({
        title: { vi: `Vòng trong j=${j}`, en: `Inner loop j=${j}` },
        codeLines: [7],
        hlCell: [i, j],
        pathCells: [[i + 1, j - 1], [i + 1, j], [i, j - 1]].filter(([r, c]) => r < n && c >= 0 && r <= c),
        vars: [
          { name: "i", value: i },
          { name: "j", value: j },
          { name: "substring", value: `"${s.slice(i, j + 1)}"` },
        ],
        note: {
          vi: `Chuẩn bị tính dp[${i}][${j}] cho đoạn "${s.slice(i, j + 1)}".`,
          en: `Prepare to compute dp[${i}][${j}] for substring "${s.slice(i, j + 1)}".`,
        },
      });

      const same = s[i] === s[j];
      gridSnap({
        title: {
          vi: `So sánh s[${i}]='${s[i]}' và s[${j}]='${s[j]}'`,
          en: `Compare s[${i}]='${s[i]}' and s[${j}]='${s[j]}'`,
        },
        codeLines: [8],
        hlCell: [i, j],
        pathCells: i + 1 <= j - 1 ? [[i + 1, j - 1]] : [],
        vars: [
          { name: `s[${i}]`, value: s[i] },
          { name: `s[${j}]`, value: s[j] },
          { name: "same", value: same },
        ],
        note: {
          vi: same
            ? "Hai đầu giống nhau, có thể bọc palindrome ở giữa bằng 2 ký tự này."
            : "Hai đầu khác nhau, bỏ một trong hai đầu và lấy kết quả tốt hơn.",
          en: same
            ? "The ends match, so they can wrap the middle palindrome."
            : "The ends differ, so drop one end and keep the better result.",
        },
      });

      if (same) {
        const middle = i + 1 <= j - 1 ? dp[i + 1][j - 1] : 0;
        dp[i][j] = middle + 2;
        gridSnap({
          title: { vi: `dp[${i}][${j}] = ${dp[i][j]}`, en: `dp[${i}][${j}] = ${dp[i][j]}` },
          codeLines: [9],
          hlCell: [i, j],
          pathCells: i + 1 <= j - 1 ? [[i + 1, j - 1]] : [],
          vars: [
            { name: "middle", value: middle },
            { name: `dp[${i}][${j}]`, value: `${middle} + 2 = ${dp[i][j]}` },
          ],
          note: {
            vi: i + 1 <= j - 1
              ? `s[${i}] == s[${j}], nên dp[${i}][${j}] = dp[${i + 1}][${j - 1}] + 2 = ${middle} + 2 = ${dp[i][j]}.`
              : `s[${i}] == s[${j}] và đoạn giữa rỗng, nên dp[${i}][${j}] = 0 + 2 = ${dp[i][j]}.`,
            en: i + 1 <= j - 1
              ? `s[${i}] == s[${j}], so dp[${i}][${j}] = dp[${i + 1}][${j - 1}] + 2 = ${middle} + 2 = ${dp[i][j]}.`
              : `s[${i}] == s[${j}] and the middle is empty, so dp[${i}][${j}] = 0 + 2 = ${dp[i][j]}.`,
          },
        });
      } else {
        gridSnap({
          title: { vi: "Nhánh else", en: "Else branch" },
          codeLines: [10],
          hlCell: [i, j],
          pathCells: [[i + 1, j], [i, j - 1]],
          vars: [
            { name: `dp[${i + 1}][${j}]`, value: dp[i + 1][j] },
            { name: `dp[${i}][${j - 1}]`, value: dp[i][j - 1] },
          ],
          note: {
            vi: `Không thể dùng cả hai đầu cùng lúc, so sánh bỏ trái với bỏ phải.`,
            en: `Cannot use both ends together, compare dropping left vs dropping right.`,
          },
        });

        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
        gridSnap({
          title: { vi: `dp[${i}][${j}] = ${dp[i][j]}`, en: `dp[${i}][${j}] = ${dp[i][j]}` },
          codeLines: [11],
          hlCell: [i, j],
          pathCells: [[i + 1, j], [i, j - 1]],
          vars: [
            { name: `dp[${i + 1}][${j}]`, value: dp[i + 1][j] },
            { name: `dp[${i}][${j - 1}]`, value: dp[i][j - 1] },
            { name: `dp[${i}][${j}]`, value: dp[i][j] },
          ],
          note: {
            vi: `dp[${i}][${j}] = max(${dp[i + 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}.`,
            en: `dp[${i}][${j}] = max(${dp[i + 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}.`,
          },
        });
      }
    }
  }

  const answer = dp[0][n - 1];
  gridSnap({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    codeLines: [12],
    hlCell: [0, n - 1],
    vars: [
      { name: "answer", value: answer },
      { name: `dp[0][${n - 1}]`, value: answer },
    ],
    note: {
      vi: `Longest palindromic subsequence của "${s}" có độ dài ${answer}.`,
      en: `The longest palindromic subsequence of "${s}" has length ${answer}.`,
    },
  });
  steps[steps.length - 1].final = true;

  return { s, answer, steps };
}

/**
 * LeetCode 1682: Longest Palindromic Subsequence II.
 * Top-down interval DP:
 *   dfs(i, j, prev) = best good palindrome inside s[i..j],
 *   where the next outer pair cannot use character prev.
 */
function buildSteps1682(input) {
  const s = typeof input === "string" ? input.trim() : String(input);
  const n = s.length;
  const steps = [];
  const memo = new Map();
  const chars = Array.from(new Set(s.split(""))).sort();
  const ROOT = "{none}";
  const MAX_RECORDED_STEPS = 180;

  function key(i, j, prev) {
    return `${i},${j},${prev}`;
  }

  function prevLabelOf(prev) {
    return prev === ROOT ? "none" : prev;
  }

  function makeGrid(hl = null, deps = [], prev = ROOT) {
    const display = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(""));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        display[i + 1][j + 1] = i <= j && memo.has(key(i, j, prev))
          ? memo.get(key(i, j, prev))
          : "";
      }
    }
    const shift = (cell) => cell ? [cell[0] + 1, cell[1] + 1] : null;
    return {
      dp: display,
      text1: s,
      text2: s,
      rowLabels: Array.from({ length: n }, (_, idx) => ({ index: `i=${idx}`, char: s[idx] })),
      colLabels: Array.from({ length: n }, (_, idx) => ({ index: `j=${idx}`, char: s[idx] })),
      hlCell: shift(hl),
      pathCells: deps.map(shift).filter(Boolean),
      caption: `DP layer: prev = ${prevLabelOf(prev)}`,
    };
  }

  function snap(opts) {
    if (steps.length >= MAX_RECORDED_STEPS && !opts.final) return;
    const prev = opts.prev === undefined ? ROOT : opts.prev;
    steps.push({
      title: opts.title,
      arr: s.split(""),
      grid: makeGrid(opts.hlCell || null, opts.pathCells || [], prev),
      highlight: opts.highlight || [],
      mark: opts.mark || [],
      codeLines: opts.codeLines || [],
      vars: [
        { name: "layer prev", value: prevLabelOf(prev) },
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  snap({
    title: { vi: "Good palindromic subsequence", en: "Good palindromic subsequence" },
    codeLines: [5],
    vars: [
      { name: "s", value: `"${s}"` },
      { name: "chars", value: `[${chars.join(", ")}]` },
    ],
    note: {
      vi: "Can tim palindrome co do dai chan, va khong co 2 ky tu ke nhau bang nhau, tru cap o giua.",
      en: "Find an even-length palindrome with no equal adjacent characters, except the middle pair.",
    },
  });

  function dfs(i, j, prev, depth = 0) {
    const stateKey = key(i, j, prev);
    const prevLabel = prevLabelOf(prev);

    snap({
      title: { vi: `dfs(${i}, ${j}, prev=${prevLabel})`, en: `dfs(${i}, ${j}, prev=${prevLabel})` },
      codeLines: [8],
      prev,
      hlCell: i <= j ? [i, j] : null,
      highlight: Array.from({ length: Math.max(0, j - i + 1) }, (_, idx) => i + idx),
      vars: [
        { name: "i", value: i },
        { name: "j", value: j },
        { name: "prev", value: prevLabel },
        { name: "substring", value: i <= j ? `"${s.slice(i, j + 1)}"` : "\"\"" },
      ],
      note: {
        vi: `State nay tim ket qua tot nhat trong s[${i}..${j}], nhung cap boc ngoai ke tiep khong duoc dung '${prevLabel}'.`,
        en: `This state searches s[${i}..${j}], but the next outer pair may not use '${prevLabel}'.`,
      },
    });

    if (i >= j) {
      snap({
        title: { vi: "if i >= j", en: "if i >= j" },
        codeLines: [9],
        prev,
        vars: [
          { name: "i", value: i },
          { name: "j", value: j },
          { name: "condition", value: true },
        ],
        note: {
          vi: "Khong con du 2 ky tu de tao cap doi xung.",
          en: "Fewer than two characters remain, so no pair can be added.",
        },
      });
      memo.set(stateKey, 0);
      snap({
        title: { vi: "return 0", en: "return 0" },
        codeLines: [10],
        prev,
        vars: [{ name: `dfs(${i},${j},${prevLabel})`, value: 0 }],
        note: {
          vi: "State nay tra ve 0 va duoc cache cho layer prev hien tai.",
          en: "This state returns 0 and is cached for the current prev layer.",
        },
      });
      return 0;
    }

    if (memo.has(stateKey)) {
      const cached = memo.get(stateKey);
      snap({
        title: { vi: `Memo hit = ${cached}`, en: `Memo hit = ${cached}` },
        codeLines: [7],
        prev,
        hlCell: [i, j],
        vars: [{ name: `memo[${i},${j},${prevLabel}]`, value: cached }],
        note: {
          vi: "State nay da tinh roi, dung lai ket qua trong memo.",
          en: "This state was already computed, reuse the memo value.",
        },
      });
      return cached;
    }

    let ans = 0;
    const candidates = [];
    snap({
      title: { vi: "ans = 0", en: "ans = 0" },
      codeLines: [12],
      prev,
      hlCell: [i, j],
      vars: [{ name: "ans", value: ans }],
      note: {
        vi: "Khoi tao dap an tot nhat cho state nay.",
        en: "Initialize the best answer for this state.",
      },
    });

    for (const ch of chars) {
      snap({
        title: { vi: `for ch = '${ch}'`, en: `for ch = '${ch}'` },
        codeLines: [13],
        prev,
        hlCell: [i, j],
        vars: [
          { name: "ch", value: ch },
          { name: "ans", value: ans },
        ],
        note: {
          vi: `Thu dung '${ch}' lam cap doi xung tiep theo.`,
          en: `Try using '${ch}' as the next symmetric pair.`,
        },
      });

      const left = s.indexOf(ch, i);
      snap({
        title: { vi: `left = ${left}`, en: `left = ${left}` },
        codeLines: [14],
        prev,
        hlCell: i <= j ? [i, j] : null,
        highlight: left >= 0 ? [left] : [],
        vars: [
          { name: "ch", value: ch },
          { name: "left", value: left },
        ],
        note: {
          vi: `Tim vi tri dau tien cua '${ch}' trong s[${i}..${j}].`,
          en: `Find the first '${ch}' inside s[${i}..${j}].`,
        },
      });

      const right = s.lastIndexOf(ch, j);
      snap({
        title: { vi: `right = ${right}`, en: `right = ${right}` },
        codeLines: [15],
        prev,
        hlCell: i <= j ? [i, j] : null,
        pathCells: left >= 0 && right >= 0 ? [[left, right]] : [],
        highlight: [left, right].filter((idx) => idx >= 0),
        vars: [
          { name: "ch", value: ch },
          { name: "left", value: left },
          { name: "right", value: right },
        ],
        note: {
          vi: `Tim vi tri cuoi cung cua '${ch}' trong s[${i}..${j}].`,
          en: `Find the last '${ch}' inside s[${i}..${j}].`,
        },
      });

      const usable = ch !== prev && left !== -1 && right !== -1 && left < right;

      snap({
        title: { vi: `if '${ch}' usable -> ${usable}`, en: `if '${ch}' usable -> ${usable}` },
        codeLines: [16],
        prev,
        hlCell: i <= j ? [i, j] : null,
        pathCells: usable ? [[left, right]] : [],
        highlight: usable ? [left, right] : [],
        vars: [
          { name: "ch", value: ch },
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "usable", value: usable },
        ],
        note: {
          vi: usable
            ? `Co the boc bang '${ch}' tai ${left} va ${right}, vi '${ch}' khac prev='${prevLabel}'.`
            : `Bo qua '${ch}': can 2 vi tri khac nhau va khong duoc bang prev='${prevLabel}'.`,
          en: usable
            ? `Can wrap with '${ch}' at ${left} and ${right}, because it differs from prev='${prevLabel}'.`
            : `Skip '${ch}': need two positions and it must differ from prev='${prevLabel}'.`,
        },
      });

      if (!usable) continue;
      const inner = dfs(left + 1, right - 1, ch, depth + 1);
      const value = inner + 2;
      candidates.push(`${ch}:${value}`);
      const newAns = Math.max(ans, value);

      snap({
        title: { vi: `ans = max(${ans}, ${value}) = ${newAns}`, en: `ans = max(${ans}, ${value}) = ${newAns}` },
        codeLines: [17],
        prev,
        hlCell: [i, j],
        pathCells: [[left, right], [left + 1, right - 1]].filter(([r, c]) => r <= c),
        highlight: [left, right],
        mark: [left, right],
        vars: [
          { name: "inner", value: inner },
          { name: "candidate", value: `${inner} + 2 = ${value}` },
          { name: "ans", value: newAns },
        ],
        note: {
          vi: `Them cap '${ch}' vao hai dau. Ben trong phai tranh lap '${ch}' ngay sat cap nay.`,
          en: `Add '${ch}' on both ends. The inside must avoid placing '${ch}' immediately next to this pair.`,
        },
      });

      ans = newAns;
    }

    memo.set(stateKey, ans);

    snap({
      title: { vi: `return ans = ${ans}`, en: `return ans = ${ans}` },
      codeLines: [18],
      prev,
      hlCell: [i, j],
      vars: [
        { name: `memo[${i},${j},${prevLabel}]`, value: ans },
        { name: "candidates", value: candidates.length ? candidates.join(", ") : "none" },
      ],
      note: {
        vi: `Ket qua tot nhat cho state nay la ${ans}.`,
        en: `The best result for this state is ${ans}.`,
      },
    });

    return ans;
  }

  const answer = dfs(0, n - 1, ROOT);
  if (steps.length >= MAX_RECORDED_STEPS) {
    snap({
      title: { vi: "Da rut gon buoc hien thi", en: "Display steps were capped" },
      codeLines: [18],
      vars: [{ name: "recorded steps", value: MAX_RECORDED_STEPS }],
      note: {
        vi: "Mot so state memo tuong tu duoc tinh nhung khong hien het de visualizer gon hon.",
        en: "Some similar memo states were computed but not all were shown to keep the visualizer compact.",
      },
    });
  }
  snap({
    title: { vi: `Ket qua: ${answer}`, en: `Result: ${answer}` },
    codeLines: [20],
    prev: ROOT,
    hlCell: [0, n - 1],
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `Longest good palindromic subsequence cua "${s}" co do dai ${answer}.`,
      en: `The longest good palindromic subsequence of "${s}" has length ${answer}.`,
    },
    final: true,
  });

  return { s, answer, steps };
}

/**
 * LeetCode 1312: Minimum Insertion Steps to Make a String Palindrome.
 * Interval DP:
 *   dp[i][j] = minimum insertions needed to make s[i..j] a palindrome.
 *   if s[i] == s[j]: dp[i][j] = dp[i+1][j-1]
 *   else: dp[i][j] = 1 + min(dp[i+1][j], dp[i][j-1])
 */
function buildSteps1312(input) {
  const s = typeof input === "string" ? input.trim() : String(input);
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  const steps = [];
  const axisLabels = Array.from({ length: n }, (_, idx) => ({ char: s[idx] }));

  function makeGrid(hl = null, deps = []) {
    const display = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(""));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        display[i + 1][j + 1] = i <= j ? dp[i][j] : "";
      }
    }
    const shift = (cell) => cell ? [cell[0] + 1, cell[1] + 1] : null;
    return {
      dp: display,
      text1: s,
      text2: s,
      rowLabels: axisLabels.map(({ char }, idx) => ({ index: `i=${idx}`, char })),
      colLabels: axisLabels.map(({ char }, idx) => ({ index: `j=${idx}`, char })),
      hlCell: shift(hl),
      pathCells: deps.map(shift).filter(Boolean),
    };
  }

  function gridSnap(opts) {
    const hasActiveCell = Array.isArray(opts.hlCell);
    const currentVars = [];
    if (hasActiveCell) {
      currentVars.push({ name: "i", value: opts.hlCell[0] });
      currentVars.push({ name: "j", value: opts.hlCell[1] });
    }
    for (const item of opts.vars || []) {
      if ((item.name === "i" || item.name === "j") && hasActiveCell) continue;
      currentVars.push(item);
    }
    steps.push({
      title: opts.title,
      arr: [],
      grid: makeGrid(opts.hlCell || null, opts.pathCells || []),
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: currentVars,
      note: opts.note,
    });
  }

  gridSnap({
    title: { vi: "n = len(s)", en: "n = len(s)" },
    codeLines: [3],
    vars: [
      { name: "s", value: `"${s}"` },
      { name: "n", value: n },
    ],
    note: {
      vi: `String "${s}" co do dai n = ${n}.`,
      en: `String "${s}" has length n = ${n}.`,
    },
  });

  gridSnap({
    title: { vi: "Tao bang dp", en: "Create dp table" },
    codeLines: [4],
    vars: [
      { name: "dp size", value: `${n} x ${n}` },
      { name: "initial value", value: 0 },
    ],
    note: {
      vi: "dp[i][j] = so lan chen it nhat de s[i..j] thanh palindrome.",
      en: "dp[i][j] = minimum insertions needed to make s[i..j] a palindrome.",
    },
  });

  if (n === 0) {
    gridSnap({
      title: { vi: "Chuoi rong", en: "Empty string" },
      codeLines: [11],
      vars: [{ name: "answer", value: 0 }],
      note: { vi: "Chuoi rong da la palindrome, can 0 lan chen.", en: "An empty string is already a palindrome, so it needs 0 insertions." },
    });
    steps[steps.length - 1].final = true;
    return { s, answer: 0, steps };
  }

  for (let i = n - 1; i >= 0; i--) {
    gridSnap({
      title: { vi: `Vong ngoai i=${i}`, en: `Outer loop i=${i}` },
      codeLines: [5],
      hlCell: [i, i],
      vars: [
        { name: `s[${i}]`, value: s[i] },
        { name: `dp[${i}][${i}]`, value: 0 },
      ],
      note: {
        vi: `Mot ky tu "${s[i]}" da la palindrome, nen dp[${i}][${i}] = 0.`,
        en: `One character "${s[i]}" is already a palindrome, so dp[${i}][${i}] = 0.`,
      },
    });

    for (let j = i + 1; j < n; j++) {
      gridSnap({
        title: { vi: `Vong trong j=${j}`, en: `Inner loop j=${j}` },
        codeLines: [6],
        hlCell: [i, j],
        pathCells: [[i + 1, j - 1], [i + 1, j], [i, j - 1]].filter(([r, c]) => r < n && c >= 0 && r <= c),
        vars: [
          { name: "substring", value: `"${s.slice(i, j + 1)}"` },
        ],
        note: {
          vi: `Chuan bi tinh dp[${i}][${j}] cho substring "${s.slice(i, j + 1)}".`,
          en: `Prepare to compute dp[${i}][${j}] for substring "${s.slice(i, j + 1)}".`,
        },
      });

      const same = s[i] === s[j];
      gridSnap({
        title: {
          vi: `So sanh s[${i}]='${s[i]}' va s[${j}]='${s[j]}'`,
          en: `Compare s[${i}]='${s[i]}' and s[${j}]='${s[j]}'`,
        },
        codeLines: [7],
        hlCell: [i, j],
        pathCells: i + 1 <= j - 1 ? [[i + 1, j - 1]] : [],
        vars: [
          { name: `s[${i}]`, value: s[i] },
          { name: `s[${j}]`, value: s[j] },
          { name: "same", value: same },
        ],
        note: {
          vi: same
            ? "Hai dau giong nhau, khong can chen them o hai dau; lay bai toan ben trong."
            : "Hai dau khac nhau, phai chen 1 ky tu de khop mot trong hai dau.",
          en: same
            ? "The two ends match, so no extra insertion is needed at the ends; use the inside interval."
            : "The two ends differ, so insert 1 character to match one of the two ends.",
        },
      });

      if (same) {
        const middle = i + 1 <= j - 1 ? dp[i + 1][j - 1] : 0;
        dp[i][j] = middle;
        gridSnap({
          title: { vi: `dp[${i}][${j}] = ${dp[i][j]}`, en: `dp[${i}][${j}] = ${dp[i][j]}` },
          codeLines: [8],
          hlCell: [i, j],
          pathCells: i + 1 <= j - 1 ? [[i + 1, j - 1]] : [],
          vars: [
            { name: "middle", value: middle },
            { name: `dp[${i}][${j}]`, value: middle },
          ],
          note: {
            vi: i + 1 <= j - 1
              ? `s[${i}] == s[${j}], nen dp[${i}][${j}] = dp[${i + 1}][${j - 1}] = ${middle}.`
              : `s[${i}] == s[${j}] va doan giua rong, nen dp[${i}][${j}] = 0.`,
            en: i + 1 <= j - 1
              ? `s[${i}] == s[${j}], so dp[${i}][${j}] = dp[${i + 1}][${j - 1}] = ${middle}.`
              : `s[${i}] == s[${j}] and the inside is empty, so dp[${i}][${j}] = 0.`,
          },
        });
      } else {
        gridSnap({
          title: { vi: "Nhanh else", en: "Else branch" },
          codeLines: [9],
          hlCell: [i, j],
          pathCells: [[i + 1, j], [i, j - 1]],
          vars: [
            { name: `dp[${i + 1}][${j}]`, value: dp[i + 1][j] },
            { name: `dp[${i}][${j - 1}]`, value: dp[i][j - 1] },
          ],
          note: {
            vi: `Thu chen de khop dau trai hoac dau phai, roi lay cach it hon.`,
            en: `Try inserting to match either the left or right end, then take the cheaper option.`,
          },
        });

        dp[i][j] = 1 + Math.min(dp[i + 1][j], dp[i][j - 1]);
        gridSnap({
          title: { vi: `dp[${i}][${j}] = ${dp[i][j]}`, en: `dp[${i}][${j}] = ${dp[i][j]}` },
          codeLines: [10],
          hlCell: [i, j],
          pathCells: [[i + 1, j], [i, j - 1]],
          vars: [
            { name: `dp[${i + 1}][${j}]`, value: dp[i + 1][j] },
            { name: `dp[${i}][${j - 1}]`, value: dp[i][j - 1] },
            { name: `dp[${i}][${j}]`, value: `1 + min(${dp[i + 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}` },
          ],
          note: {
            vi: `dp[${i}][${j}] = 1 + min(${dp[i + 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}.`,
            en: `dp[${i}][${j}] = 1 + min(${dp[i + 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}.`,
          },
        });
      }
    }
  }

  const answer = dp[0][n - 1];
  gridSnap({
    title: { vi: `Ket qua: ${answer}`, en: `Result: ${answer}` },
    codeLines: [11],
    hlCell: [0, n - 1],
    vars: [
      { name: "answer", value: answer },
      { name: `dp[0][${n - 1}]`, value: answer },
    ],
    note: {
      vi: `Can it nhat ${answer} lan chen de bien "${s}" thanh palindrome.`,
      en: `Minimum ${answer} insertion(s) are needed to make "${s}" a palindrome.`,
    },
  });
  steps[steps.length - 1].final = true;

  return { s, answer, steps };
}

/**
 * LeetCode 97: Interleaving String.
 * DP[i][j] = True if s3[0:i+j] is an interleaving of s1[0:i] and s2[0:j].
 * dp[i][j] = (dp[i-1][j] && s1[i-1] == s3[i+j-1]) || (dp[i][j-1] && s2[j-1] == s3[i+j-1])
 */
function buildSteps97(input) {
  // Parse input: s1,s2,s3
  const parts = input.split(",").map(s => s.trim());
  const [s1, s2, s3] = parts.length >= 3 ? parts : ["ab", "ca", "aabca"];
  const steps = [];
  const m = s1.length;
  const n = s2.length;

  const makeGrid = (dp, hlCell = null, pathCells = []) => ({
    dp: dp.map((row) => row.map((v) => (v ? "T" : "F"))),
    text1: s1,
    text2: s2,
    hlCell,
    pathCells,
  });

  steps.push({
    title: { vi: "Láº¥y kÃ­ch thÆ°á»›c m, n", en: "Read sizes m, n" },
    arr: [],
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "s1", value: `"${s1}"` },
      { name: "s2", value: `"${s2}"` },
      { name: "s3", value: `"${s3}"` },
      { name: "m", value: m },
      { name: "n", value: n },
    ],
    note: {
      vi: `m=${m}, n=${n}. Báº£ng DP sáº½ cÃ³ kÃ­ch thÆ°á»›c ${m + 1}Ã—${n + 1}.`,
      en: `m=${m}, n=${n}. The DP table will have size ${m + 1}Ã—${n + 1}.`,
    },
  });

  steps.push({
    title: { vi: "Kiểm tra độ dài", en: "Check lengths" },
    arr: [],
    highlight: [],
    mark: [],
    codeLines: [5],
    vars: [
      { name: "len(s1)", value: s1.length },
      { name: "len(s2)", value: s2.length },
      { name: "len(s3)", value: s3.length },
      { name: "len(s1)+len(s2) != len(s3)", value: s1.length + s2.length !== s3.length },
    ],
    note: {
      vi: `Cần len(s1)+len(s2)=len(s3). Ở đây ${s1.length}+${s2.length}=${s1.length + s2.length}, len(s3)=${s3.length}.`,
      en: `Need len(s1)+len(s2)=len(s3). Here ${s1.length}+${s2.length}=${s1.length + s2.length}, len(s3)=${s3.length}.`,
    },
  });
  
  if (s1.length + s2.length !== s3.length) {
    steps.push({
      title: { vi: "Return False", en: "Return False" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [6],
      vars: [{ name: "answer", value: false }],
      note: { vi: "Độ dài không khớp, nên không thể ghép xen kẽ.", en: "Lengths do not match, so interleaving is impossible." },
    });
    return {
      s1, s2, s3,
      answer: false,
      steps,
    };
  }

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));


  steps.push({
    title: { vi: "Tạo bảng dp toàn False", en: "Create all-False dp table" },
    arr: [],
    grid: makeGrid(dp),
    highlight: [],
    mark: [],
    codeLines: [9],
    vars: [{ name: "dp size", value: `${m + 1} x ${n + 1}` }],
    note: {
      vi: "dp[i][j] = True nếu s3[0:i+j] có thể tạo từ s1[0:i] và s2[0:j].",
      en: "dp[i][j] = True if s3[0:i+j] can be formed from s1[0:i] and s2[0:j].",
    },
  });

  dp[0][0] = true;
  steps.push({
    title: { vi: "Base: dp[0][0] = True", en: "Base: dp[0][0] = True" },
    arr: [],
    grid: makeGrid(dp, [0, 0]),
    highlight: [],
    mark: [],
    codeLines: [10],
    vars: [{ name: "dp[0][0]", value: true }],
    note: {
      vi: "Chuỗi rỗng của s1 và chuỗi rỗng của s2 tạo được chuỗi rỗng của s3.",
      en: "Empty s1 and empty s2 can form empty s3.",
    },
  });

  // Fill first row (using only s2)
  for (let j = 1; j <= n; j++) {
    steps.push({
      title: { vi: `Vòng lặp j=${j}`, en: `Loop j=${j}` },
      arr: [],
      grid: makeGrid(dp, [0, j], [[0, j - 1]]),
      highlight: [],
      mark: [],
      codeLines: [13],
      vars: [{ name: "j", value: j }],
      note: {
        vi: `Đang xử lý hàng 0: chỉ dùng prefix của s2 để khớp s3[0:${j}].`,
        en: `Processing row 0: only a prefix of s2 is used to match s3[0:${j}].`,
      },
    });

    const prev = dp[0][j - 1];
    const match = s2[j - 1] === s3[j - 1];
    dp[0][j] = prev && match;
    steps.push({
      title: { vi: `dp[0][${j}] = ${dp[0][j]}`, en: `dp[0][${j}] = ${dp[0][j]}` },
      arr: [],
      grid: makeGrid(dp, [0, j], [[0, j - 1]]),
      highlight: [],
      mark: [],
      codeLines: [14],
      vars: [
        { name: `dp[0][${j - 1}]`, value: prev },
        { name: `s2[${j - 1}]`, value: `"${s2[j - 1]}"` },
        { name: `s3[${j - 1}]`, value: `"${s3[j - 1]}"` },
        { name: "chars match", value: match },
        { name: `dp[0][${j}]`, value: dp[0][j] },
      ],
      note: {
        vi: `dp[0][${j}] = dp[0][${j - 1}] AND s2[${j - 1}] == s3[${j - 1}] = ${prev} AND ${match} = ${dp[0][j]}.`,
        en: `dp[0][${j}] = dp[0][${j - 1}] AND s2[${j - 1}] == s3[${j - 1}] = ${prev} AND ${match} = ${dp[0][j]}.`,
      },
    });
  }

  // Fill first column (using only s1)
  for (let i = 1; i <= m; i++) {
    steps.push({
      title: { vi: `Vòng lặp i=${i}`, en: `Loop i=${i}` },
      arr: [],
      grid: makeGrid(dp, [i, 0], [[i - 1, 0]]),
      highlight: [],
      mark: [],
      codeLines: [17],
      vars: [{ name: "i", value: i }],
      note: {
        vi: `Đang xử lý cột 0: chỉ dùng prefix của s1 để khớp s3[0:${i}].`,
        en: `Processing column 0: only a prefix of s1 is used to match s3[0:${i}].`,
      },
    });

    const prev = dp[i - 1][0];
    const match = s1[i - 1] === s3[i - 1];
    dp[i][0] = prev && match;
    steps.push({
      title: { vi: `dp[${i}][0] = ${dp[i][0]}`, en: `dp[${i}][0] = ${dp[i][0]}` },
      arr: [],
      grid: makeGrid(dp, [i, 0], [[i - 1, 0]]),
      highlight: [],
      mark: [],
      codeLines: [18],
      vars: [
        { name: `dp[${i - 1}][0]`, value: prev },
        { name: `s1[${i - 1}]`, value: `"${s1[i - 1]}"` },
        { name: `s3[${i - 1}]`, value: `"${s3[i - 1]}"` },
        { name: "chars match", value: match },
        { name: `dp[${i}][0]`, value: dp[i][0] },
      ],
      note: {
        vi: `dp[${i}][0] = dp[${i - 1}][0] AND s1[${i - 1}] == s3[${i - 1}] = ${prev} AND ${match} = ${dp[i][0]}.`,
        en: `dp[${i}][0] = dp[${i - 1}][0] AND s1[${i - 1}] == s3[${i - 1}] = ${prev} AND ${match} = ${dp[i][0]}.`,
      },
    });
  }

  // Fill the rest
  for (let i = 1; i <= m; i++) {
    steps.push({
      title: { vi: `Vòng ngoài i=${i}`, en: `Outer loop i=${i}` },
      arr: [],
      grid: makeGrid(dp, [i, 1]),
      highlight: [],
      mark: [],
      codeLines: [21],
      vars: [{ name: "i", value: i }, { name: `s1[${i - 1}]`, value: `"${s1[i - 1]}"` }],
      note: {
        vi: `Bắt đầu xét các ô dùng s1[0:${i}] và từng prefix của s2.`,
        en: `Start checking cells that use s1[0:${i}] and each prefix of s2.`,
      },
    });

    for (let j = 1; j <= n; j++) {
      steps.push({
        title: { vi: `Vòng trong j=${j}`, en: `Inner loop j=${j}` },
        arr: [],
        grid: makeGrid(dp, [i, j], [[i - 1, j], [i, j - 1]]),
        highlight: [],
        mark: [],
        codeLines: [22],
        vars: [
          { name: "i", value: i },
          { name: "j", value: j },
          { name: `s3[${i + j - 1}]`, value: `"${s3[i + j - 1]}"` },
        ],
        note: {
          vi: `Ô dp[${i}][${j}] quyết định ký tự s3[${i + j - 1}] = "${s3[i + j - 1]}" đến từ s1 hay s2.`,
          en: `Cell dp[${i}][${j}] decides whether s3[${i + j - 1}] = "${s3[i + j - 1]}" comes from s1 or s2.`,
        },
      });

      const fromUp = dp[i - 1][j] && s1[i - 1] === s3[i + j - 1];
      steps.push({
        title: { vi: `from_s1 = ${fromUp}`, en: `from_s1 = ${fromUp}` },
        arr: [],
        grid: makeGrid(dp, [i, j], [[i - 1, j]]),
        highlight: [],
        mark: [],
        codeLines: [23],
        vars: [
          { name: `dp[${i - 1}][${j}]`, value: dp[i - 1][j] },
          { name: `s1[${i - 1}]`, value: `"${s1[i - 1]}"` },
          { name: `s3[${i + j - 1}]`, value: `"${s3[i + j - 1]}"` },
          { name: "from_s1", value: fromUp },
        ],
        note: {
          vi: `Nếu lấy ký tự kế tiếp từ s1: cần dp[${i - 1}][${j}] True và s1[${i - 1}] == s3[${i + j - 1}].`,
          en: `If the next character comes from s1: need dp[${i - 1}][${j}] True and s1[${i - 1}] == s3[${i + j - 1}].`,
        },
      });

      const fromLeft = dp[i][j - 1] && s2[j - 1] === s3[i + j - 1];
      steps.push({
        title: { vi: `from_s2 = ${fromLeft}`, en: `from_s2 = ${fromLeft}` },
        arr: [],
        grid: makeGrid(dp, [i, j], [[i, j - 1]]),
        highlight: [],
        mark: [],
        codeLines: [24],
        vars: [
          { name: `dp[${i}][${j - 1}]`, value: dp[i][j - 1] },
          { name: `s2[${j - 1}]`, value: `"${s2[j - 1]}"` },
          { name: `s3[${i + j - 1}]`, value: `"${s3[i + j - 1]}"` },
          { name: "from_s2", value: fromLeft },
        ],
        note: {
          vi: `Nếu lấy ký tự kế tiếp từ s2: cần dp[${i}][${j - 1}] True và s2[${j - 1}] == s3[${i + j - 1}].`,
          en: `If the next character comes from s2: need dp[${i}][${j - 1}] True and s2[${j - 1}] == s3[${i + j - 1}].`,
        },
      });

      dp[i][j] = fromUp || fromLeft;

      steps.push({
        title: { vi: `dp[${i}][${j}] = ${dp[i][j]}`, en: `dp[${i}][${j}] = ${dp[i][j]}` },
        arr: [],
        grid: makeGrid(dp, [i, j], [[i - 1, j], [i, j - 1]]),
        highlight: [],
        mark: [],
        codeLines: [23, 24],
        vars: [
          { name: "from_s1", value: fromUp },
          { name: "from_s2", value: fromLeft },
          { name: `dp[${i}][${j}]`, value: dp[i][j] },
        ],
        note: {
          vi: `dp[${i}][${j}] = from_s1 OR from_s2 = ${fromUp} OR ${fromLeft} = ${dp[i][j]}.`,
          en: `dp[${i}][${j}] = from_s1 OR from_s2 = ${fromUp} OR ${fromLeft} = ${dp[i][j]}.`,
        },
      });
    }
  }

  // Final answer
  const answer = dp[m][n];
  steps.push({
    title: { vi: `Kết quả: dp[${m}][${n}] = ${answer}`, en: `Result: dp[${m}][${n}] = ${answer}` },
    arr: [],
    grid: makeGrid(dp, [m, n]),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [26],
    vars: [
      { name: "answer", value: answer },
      { name: `dp[${m}][${n}]`, value: answer },
    ],
    note: {
      vi: `${answer ? `✓ "${s3}" là xen kẽ của "${s1}" và "${s2}".` : `✗ "${s3}" không phải xen kẽ của "${s1}" và "${s2}".`}`,
      en: `${answer ? `✓ "${s3}" is an interleaving of "${s1}" and "${s2}".` : `✗ "${s3}" is not an interleaving of "${s1}" and "${s2}".`}`,
    },
  });

  return { s1, s2, s3, answer, steps };
}

/**
 * LeetCode 3336: Find the Number of Subsequences With Equal GCD.
 *
 * dp[g1][g2] = number of ways to build two disjoint subsequences where
 * seq1 has gcd g1 and seq2 has gcd g2. gcd 0 means that subsequence is empty.
 */
function buildSteps3336(nums) {
  const MOD = 1000000007;
  const maxG = Math.max(...nums);
  const steps = [];
  const maxDetailedTransitions = 120;
  let detailedTransitions = 0;

  function gcd(a, b) {
    while (b !== 0) {
      const t = a % b;
      a = b;
      b = t;
    }
    return Math.abs(a);
  }

  function nextGcd(oldG, x) {
    return oldG === 0 ? x : gcd(oldG, x);
  }

  function blankGrid() {
    return Array.from({ length: maxG + 1 }, () => Array(maxG + 1).fill(0));
  }

  function cloneGrid(grid) {
    return grid.map((row) => [...row]);
  }

  function gridSnap(opts) {
    steps.push({
      title: opts.title,
      grid: {
        dp: cloneGrid(opts.dp),
        text1: "g",
        text2: "g",
        showIndices: false,
        rowLabels: Array.from({ length: maxG }, (_, idx) => ({
          index: `g1=${idx + 1}`,
          char: "",
        })),
        colLabels: Array.from({ length: maxG }, (_, idx) => ({
          index: `g2=${idx + 1}`,
          char: "",
        })),
        hlCell: opts.hlCell || null,
        pathCells: opts.pathCells || [],
        cellLabels: opts.cellLabels || {},
      },
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
      final: opts.final || false,
    });
  }

  let dp = blankGrid();
  dp[0][0] = 1;
  gridSnap({
    title: { vi: "Khoi tao dp[0][0] = 1", en: "Initialize dp[0][0] = 1" },
    dp,
    hlCell: [0, 0],
    codeLines: [5, 6, 7, 8],
    vars: [
      { name: "nums", value: `[${nums.join(", ")}]` },
      { name: "max_g", value: maxG },
      { name: "dp[0][0]", value: 1 },
    ],
    note: {
      vi: "gcd = 0 nghia la subsequence rong. Ban dau ca seq1 va seq2 deu rong.",
      en: "gcd = 0 means the subsequence is empty. Initially both seq1 and seq2 are empty.",
    },
  });

  nums.forEach((x, idx) => {
    const ndp = cloneGrid(dp);
    gridSnap({
      title: { vi: `Xu ly nums[${idx}] = ${x}`, en: `Process nums[${idx}] = ${x}` },
      dp,
      hlCell: [0, 0],
      codeLines: [10, 11],
      vars: [
        { name: "i", value: idx },
        { name: "x", value: x },
        { name: "choices", value: "skip / seq1 / seq2" },
      ],
      note: {
        vi: `Voi moi state hien co, so ${x} co 3 lua chon: bo qua, dua vao seq1, hoac dua vao seq2.`,
        en: `For each existing state, ${x} has 3 choices: skip, put into seq1, or put into seq2.`,
      },
    });

    for (let g1 = 0; g1 <= maxG; g1++) {
      for (let g2 = 0; g2 <= maxG; g2++) {
        const count = dp[g1][g2];
        if (count === 0) continue;
        const ng1 = nextGcd(g1, x);
        const ng2 = nextGcd(g2, x);

        ndp[ng1][g2] = (ndp[ng1][g2] + count) % MOD;
        if (detailedTransitions < maxDetailedTransitions) {
          detailedTransitions++;
          gridSnap({
            title: { vi: `Them ${x} vao seq1`, en: `Put ${x} into seq1` },
            dp: ndp,
            hlCell: [ng1, g2],
            pathCells: [[g1, g2]],
            cellLabels: { [`${g1},${g2}`]: "from", [`${ng1},${g2}`]: "seq1" },
            codeLines: [17, 18],
            vars: [
              { name: "from", value: `dp[${g1}][${g2}] = ${count}` },
              { name: "new_g1", value: `gcd(${g1 || "empty"}, ${x}) = ${ng1}` },
              { name: `ndp[${ng1}][${g2}]`, value: ndp[ng1][g2] },
            ],
            note: {
              vi: `Dua ${x} vao seq1: g1 moi = ${ng1}, g2 giu nguyen = ${g2}.`,
              en: `Put ${x} into seq1: new g1 = ${ng1}, g2 stays ${g2}.`,
            },
          });
        }

        ndp[g1][ng2] = (ndp[g1][ng2] + count) % MOD;
        if (detailedTransitions < maxDetailedTransitions) {
          detailedTransitions++;
          gridSnap({
            title: { vi: `Them ${x} vao seq2`, en: `Put ${x} into seq2` },
            dp: ndp,
            hlCell: [g1, ng2],
            pathCells: [[g1, g2]],
            cellLabels: { [`${g1},${g2}`]: "from", [`${g1},${ng2}`]: "seq2" },
            codeLines: [19, 20],
            vars: [
              { name: "from", value: `dp[${g1}][${g2}] = ${count}` },
              { name: "new_g2", value: `gcd(${g2 || "empty"}, ${x}) = ${ng2}` },
              { name: `ndp[${g1}][${ng2}]`, value: ndp[g1][ng2] },
            ],
            note: {
              vi: `Dua ${x} vao seq2: g1 giu nguyen = ${g1}, g2 moi = ${ng2}.`,
              en: `Put ${x} into seq2: g1 stays ${g1}, new g2 = ${ng2}.`,
            },
          });
        }
      }
    }

    dp = ndp;
    gridSnap({
      title: { vi: `Ket thuc nums[${idx}] = ${x}`, en: `Finish nums[${idx}] = ${x}` },
      dp,
      codeLines: [21],
      vars: [{ name: "processed", value: `[${nums.slice(0, idx + 1).join(", ")}]` }],
      note: {
        vi: "Gan dp = ndp de chuyen sang so tiep theo.",
        en: "Assign dp = ndp before moving to the next number.",
      },
    });
  });

  let answer = 0;
  const diagonal = [];
  for (let g = 1; g <= maxG; g++) {
    if (dp[g][g] > 0) diagonal.push([g, dp[g][g]]);
    answer = (answer + dp[g][g]) % MOD;
  }

  gridSnap({
    title: { vi: `Ket qua = ${answer}`, en: `Result = ${answer}` },
    dp,
    pathCells: diagonal.map(([g]) => [g, g]),
    codeLines: [23],
    vars: [
      { name: "answer", value: answer },
      { name: "diagonal", value: diagonal.map(([g, v]) => `dp[${g}][${g}]=${v}`).join(", ") || "empty" },
    ],
    note: {
      vi: "Cong cac o duong cheo dp[g][g] voi g > 0, vi ca hai subsequence phai khong rong va co GCD bang nhau.",
      en: "Sum diagonal cells dp[g][g] for g > 0, because both subsequences must be non-empty and have equal GCD.",
    },
    final: true,
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 10: Regular Expression Matching.
 * dp[i][j] = whether s[:i] matches p[:j]. Pattern supports "." and "*".
 */
function buildSteps10(input, params) {
  const s = String(input).trim();
  const p = String(params.p || "").trim();
  const m = s.length;
  const n = p.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
  const steps = [];

  function gridSnap(opts) {
    const hasActiveCell = Array.isArray(opts.hlCell);
    const currentVars = [];
    if (hasActiveCell) {
      currentVars.push({ name: "i", value: opts.hlCell[0] });
      currentVars.push({ name: "j", value: opts.hlCell[1] });
    }
    for (const item of opts.vars || []) {
      if ((item.name === "i" || item.name === "j") && hasActiveCell) continue;
      currentVars.push(item);
    }
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: dp.map((row) => row.map((v) => (v ? "T" : "F"))),
        text1: s,
        text2: p,
        largeCells: true,
        hlCell: opts.hlCell || null,
        pathCells: opts.pathCells || [],
        cellLabels: opts.cellLabels || {},
        showIndices: true,
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: currentVars,
      note: opts.note,
      final: opts.final || false,
    });
  }

  gridSnap({
    title: { vi: `m=${m}, n=${n}`, en: `m=${m}, n=${n}` },
    codeLines: [3],
    vars: [
      { name: "s", value: `"${s}"` },
      { name: "p", value: `"${p}"` },
      { name: "m", value: m },
      { name: "n", value: n },
    ],
    note: {
      vi: `m là độ dài chuỗi s, n là độ dài pattern p.`,
      en: `m is the length of s, n is the length of p.`,
    },
  });

  gridSnap({
    title: { vi: "Khởi tạo bảng dp", en: "Initialize dp table" },
    codeLines: [4],
    vars: [{ name: "dp size", value: `${m + 1} x ${n + 1}` }],
    note: {
      vi: "dp[i][j] cho biết s[:i] có khớp p[:j] hay không. Ban đầu toàn False.",
      en: "dp[i][j] means whether s[:i] matches p[:j]. Initially every cell is False.",
    },
  });

  dp[0][0] = true;
  gridSnap({
    title: { vi: "Base: dp[0][0] = True", en: "Base: dp[0][0] = True" },
    codeLines: [5],
    hlCell: [0, 0],
    vars: [
      { name: "s[:0]", value: '""' },
      { name: "p[:0]", value: '""' },
      { name: "dp[0][0]", value: true },
    ],
    note: { vi: "Empty string matches empty pattern.", en: "Empty string matches empty pattern." },
  });

  for (let j = 2; j <= n; j++) {
    gridSnap({
      title: { vi: `for j=${j}`, en: `for j=${j}` },
      codeLines: [6],
      hlCell: [0, j],
      vars: [
        { name: "j", value: j },
        { name: "p[:j]", value: `"${p.slice(0, j)}"` },
      ],
      note: {
        vi: `Kiểm tra pattern prefix "${p.slice(0, j)}" có thể match chuỗi rỗng không.`,
        en: `Check whether pattern prefix "${p.slice(0, j)}" can match the empty string.`,
      },
    });

    const emptyStar = p[j - 1] === "*";
    gridSnap({
      title: { vi: `if p[${j - 1}] == '*' -> ${emptyStar}`, en: `if p[${j - 1}] == '*' -> ${emptyStar}` },
      codeLines: [7],
      hlCell: [0, j],
      vars: [
        { name: `p[${j - 1}]`, value: p[j - 1] || "" },
        { name: "condition", value: emptyStar },
      ],
      note: emptyStar
        ? {
            vi: `"${p.slice(j - 2, j)}" có thể dùng 0 lần để tiếp tục match chuỗi rỗng.`,
            en: `"${p.slice(j - 2, j)}" can be used zero times to keep matching the empty string.`,
          }
        : {
            vi: "Không phải '*', nên dp[0][j] giữ False.",
            en: "This token is not '*', so dp[0][j] stays False.",
          },
    });

    if (!emptyStar) continue;
    dp[0][j] = dp[0][j - 2];
    gridSnap({
      title: { vi: `Empty s: dp[0][${j}] = ${dp[0][j]}`, en: `Empty s: dp[0][${j}] = ${dp[0][j]}` },
      codeLines: [8],
      hlCell: [0, j],
      pathCells: [[0, j - 2]],
      cellLabels: { [`0,${j - 2}`]: "drop x*" },
      vars: [
        { name: `p[${j - 2}:${j}]`, value: p.slice(j - 2, j) },
        { name: `dp[0][${j - 2}]`, value: dp[0][j - 2] },
        { name: `dp[0][${j}]`, value: dp[0][j] },
      ],
      note: {
        vi: `Pattern "${p.slice(0, j)}" matches empty only if "${p.slice(j - 2, j)}" is used zero times.`,
        en: `Pattern "${p.slice(0, j)}" matches empty only if "${p.slice(j - 2, j)}" is used zero times.`,
      },
    });
  }

  for (let i = 1; i <= m; i++) {
    gridSnap({
      title: { vi: `Outer loop i=${i}`, en: `Outer loop i=${i}` },
      codeLines: [9],
      hlCell: [i, 0],
      vars: [
        { name: `s[${i - 1}]`, value: s[i - 1] },
        { name: "s[:i]", value: s.slice(0, i) },
      ],
      note: { vi: `Compute row for s[:${i}] = "${s.slice(0, i)}".`, en: `Compute row for s[:${i}] = "${s.slice(0, i)}".` },
    });

    for (let j = 1; j <= n; j++) {
      gridSnap({
        title: { vi: `Inner loop j=${j}`, en: `Inner loop j=${j}` },
        codeLines: [10],
        hlCell: [i, j],
        vars: [
          { name: `s[${i - 1}]`, value: s[i - 1] },
          { name: `p[${j - 1}]`, value: p[j - 1] },
          { name: "p[:j]", value: p.slice(0, j) },
        ],
        note: { vi: `Decide if "${s.slice(0, i)}" matches pattern "${p.slice(0, j)}".`, en: `Decide if "${s.slice(0, i)}" matches pattern "${p.slice(0, j)}".` },
      });

      const pc = p[j - 1];
      const directMatch = pc === "." || pc === s[i - 1];
      gridSnap({
        title: { vi: `if single token matches -> ${directMatch}`, en: `if single token matches -> ${directMatch}` },
        codeLines: [11],
        hlCell: [i, j],
        vars: [
          { name: `s[${i - 1}]`, value: s[i - 1] },
          { name: `p[${j - 1}]`, value: pc },
          { name: "condition", value: directMatch },
        ],
        note: directMatch
          ? {
              vi: pc === "." ? "'.' khớp đúng một ký tự." : "Hai ký tự giống nhau.",
              en: pc === "." ? "'.' matches exactly one character." : "The two characters are equal.",
            }
          : {
              vi: "Không khớp trực tiếp; nếu token là '*' thì xét case '*' ở dòng tiếp theo.",
              en: "No direct match; if the token is '*', check the star case next.",
            },
      });

      if (directMatch) {
        const prev = dp[i - 1][j - 1];
        dp[i][j] = prev;
        gridSnap({
          title: { vi: `Direct match -> ${dp[i][j]}`, en: `Direct match -> ${dp[i][j]}` },
          codeLines: [12],
          hlCell: [i, j],
          pathCells: [[i - 1, j - 1]],
          cellLabels: { [`${i - 1},${j - 1}`]: "diag" },
          vars: [
            { name: "char matches", value: true },
            { name: `dp[${i - 1}][${j - 1}]`, value: prev },
            { name: `dp[${i}][${j}]`, value: dp[i][j] },
          ],
          note: {
            vi: pc === "." ? "'.' matches exactly one character, so use dp[i-1][j-1]." : "Characters are equal, so use dp[i-1][j-1].",
            en: pc === "." ? "'.' matches exactly one character, so use dp[i-1][j-1]." : "Characters are equal, so use dp[i-1][j-1].",
          },
        });
        continue;
      }

      const starCase = pc === "*";
      gridSnap({
        title: { vi: `elif p[${j - 1}] == '*' -> ${starCase}`, en: `elif p[${j - 1}] == '*' -> ${starCase}` },
        codeLines: [13],
        hlCell: [i, j],
        vars: [
          { name: `p[${j - 1}]`, value: pc },
          { name: "condition", value: starCase },
        ],
        note: starCase
          ? {
              vi: "'*' có thể match 0 hoặc nhiều lần token đứng trước.",
              en: "'*' can match zero or more copies of the previous token.",
            }
          : {
              vi: "Không phải '*', nên ô này giữ False.",
              en: "This token is not '*', so this cell stays False.",
            },
      });

      if (starCase) {
        const prevChar = p[j - 2];
        const zero = j >= 2 ? dp[i][j - 2] : false;
        dp[i][j] = Boolean(zero);
        gridSnap({
          title: { vi: `Zero copies -> ${dp[i][j]}`, en: `Zero copies -> ${dp[i][j]}` },
          codeLines: [14],
          hlCell: [i, j],
          pathCells: j >= 2 ? [[i, j - 2]] : [],
          cellLabels: {
            ...(j >= 2 ? { [`${i},${j - 2}`]: "zero" } : {}),
          },
          vars: [
            { name: "previous token", value: prevChar || "" },
            { name: "zero copies", value: `dp[${i}][${j - 2}] = ${zero}` },
            { name: `dp[${i}][${j}]`, value: dp[i][j] },
          ],
          note: {
            vi: "Trước hết thử dùng 0 lần token trước '*': bỏ đoạn x* bằng dp[i][j-2].",
            en: "First try zero copies of the token before '*': drop x* using dp[i][j-2].",
          },
        });

        const canUseStar = j >= 2 && (prevChar === "." || prevChar === s[i - 1]);
        gridSnap({
          title: { vi: `Can consume one more -> ${canUseStar}`, en: `Can consume one more -> ${canUseStar}` },
          codeLines: [15],
          hlCell: [i, j],
          pathCells: [[i - 1, j]],
          cellLabels: { [`${i - 1},${j}`]: "more" },
          vars: [
            { name: "previous token", value: prevChar || "" },
            { name: `s[${i - 1}]`, value: s[i - 1] },
            { name: "condition", value: canUseStar },
          ],
          note: canUseStar
            ? {
                vi: "Token trước '*' khớp s[i-1], nên có thể tiêu thụ thêm một ký tự.",
                en: "The token before '*' matches s[i-1], so '*' may consume one more character.",
              }
            : {
                vi: "Token trước '*' không khớp s[i-1], nên không thể dùng nhánh tiêu thụ thêm.",
                en: "The token before '*' does not match s[i-1], so the consume-more branch cannot be used.",
              },
        });

        if (canUseStar) {
          const oneMore = dp[i - 1][j];
          dp[i][j] = Boolean(dp[i][j] || oneMore);
          gridSnap({
            title: { vi: `Consume more -> ${dp[i][j]}`, en: `Consume more -> ${dp[i][j]}` },
            codeLines: [16],
            hlCell: [i, j],
            pathCells: [[i - 1, j]],
            cellLabels: { [`${i - 1},${j}`]: "more" },
            vars: [
              { name: "one more char", value: `dp[${i - 1}][${j}] = ${oneMore}` },
              { name: `dp[${i}][${j}]`, value: dp[i][j] },
            ],
            note: {
              vi: "Nếu p[:j] đã match s[:i-1], '*' có thể ăn thêm s[i-1].",
              en: "If p[:j] already matched s[:i-1], '*' can consume s[i-1] too.",
            },
          });
        }
      } else {
        dp[i][j] = false;
      }
    }
  }

  const answer = dp[m][n];
  gridSnap({
    title: { vi: `return ${answer}`, en: `return ${answer}` },
    codeLines: [17],
    hlCell: [m, n],
    vars: [
      { name: `dp[${m}][${n}]`, value: answer },
      { name: "return", value: answer },
    ],
    note: { vi: `Full string "${s}" ${answer ? "matches" : "does not match"} pattern "${p}".`, en: `Full string "${s}" ${answer ? "matches" : "does not match"} pattern "${p}".` },
    final: true,
  });

  return { s, p, answer, steps };
}

/**
 * LeetCode 44: Wildcard Matching.
 * dp[i][j] = whether s[:i] matches p[:j]. Pattern supports "?" and "*".
 */
function buildSteps44Table(input, params) {
  const s = String(input).trim();
  const p = String(params.p || "").trim();
  const m = s.length;
  const n = p.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
  const steps = [];

  function gridSnap(opts) {
    const hasActiveCell = Array.isArray(opts.hlCell);
    const currentVars = [];
    if (hasActiveCell) {
      currentVars.push({ name: "i", value: opts.hlCell[0] });
      currentVars.push({ name: "j", value: opts.hlCell[1] });
    }
    for (const item of opts.vars || []) {
      if ((item.name === "i" || item.name === "j") && hasActiveCell) continue;
      currentVars.push(item);
    }
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: dp.map((row) => row.map((v) => (v ? "T" : "F"))),
        text1: s,
        text2: p,
        largeCells: true,
        hlCell: opts.hlCell || null,
        pathCells: opts.pathCells || [],
        cellLabels: opts.cellLabels || {},
        showIndices: true,
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: currentVars,
      note: opts.note,
      final: opts.final || false,
    });
  }

  gridSnap({
    title: { vi: `m=${m}, n=${n}`, en: `m=${m}, n=${n}` },
    codeLines: [3],
    vars: [
      { name: "s", value: `"${s}"` },
      { name: "p", value: `"${p}"` },
      { name: "m", value: m },
      { name: "n", value: n },
    ],
    note: {
      vi: "m là độ dài chuỗi s, n là độ dài pattern p.",
      en: "m is the length of s, n is the length of p.",
    },
  });

  gridSnap({
    title: { vi: "Khởi tạo bảng dp", en: "Initialize dp table" },
    codeLines: [4],
    vars: [{ name: "dp size", value: `${m + 1} x ${n + 1}` }],
    note: {
      vi: "dp[i][j] cho biết s[:i] có khớp p[:j] hay không. Ban đầu toàn False.",
      en: "dp[i][j] means whether s[:i] matches p[:j]. Initially every cell is False.",
    },
  });

  dp[0][0] = true;
  gridSnap({
    title: { vi: "Base: dp[0][0] = True", en: "Base: dp[0][0] = True" },
    codeLines: [5],
    hlCell: [0, 0],
    vars: [
      { name: "s[:0]", value: '""' },
      { name: "p[:0]", value: '""' },
      { name: "dp[0][0]", value: true },
    ],
    note: { vi: "Empty string matches empty pattern.", en: "Empty string matches empty pattern." },
  });

  for (let j = 1; j <= n; j++) {
    gridSnap({
      title: { vi: `for j=${j}`, en: `for j=${j}` },
      codeLines: [6],
      hlCell: [0, j],
      vars: [
        { name: "j", value: j },
        { name: "p[:j]", value: `"${p.slice(0, j)}"` },
      ],
      note: {
        vi: "Khởi tạo hàng chuỗi rỗng: chỉ các '*' liên tiếp ở đầu pattern mới match được rỗng.",
        en: "Initialize the empty-string row: only leading '*' tokens can match empty.",
      },
    });

    const leadingStar = p[j - 1] === "*";
    gridSnap({
      title: { vi: `if p[${j - 1}] == '*' -> ${leadingStar}`, en: `if p[${j - 1}] == '*' -> ${leadingStar}` },
      codeLines: [7],
      hlCell: [0, j],
      vars: [
        { name: `p[${j - 1}]`, value: p[j - 1] || "" },
        { name: "condition", value: leadingStar },
      ],
      note: leadingStar
        ? {
            vi: "'*' ở đầu có thể match chuỗi rỗng.",
            en: "A leading '*' can match the empty string.",
          }
        : {
            vi: "Gặp token không phải '*', phần còn lại của hàng empty sẽ không match.",
            en: "Once a non-'*' token appears, the rest of the empty row cannot match.",
          },
    });

    if (!leadingStar) {
      gridSnap({
        title: { vi: "break", en: "break" },
        codeLines: [10],
        hlCell: [0, j],
        vars: [{ name: "stop empty-row init", value: true }],
        note: {
          vi: "Dừng khởi tạo hàng empty vì pattern prefix đã cần ít nhất một ký tự thật.",
          en: "Stop initializing the empty row because this pattern prefix now needs at least one real character.",
        },
      });
      break;
    }

    dp[0][j] = dp[0][j - 1];
    gridSnap({
      title: { vi: `Empty s: leading '*' -> ${dp[0][j]}`, en: `Empty s: leading '*' -> ${dp[0][j]}` },
      codeLines: [8],
      hlCell: [0, j],
      pathCells: [[0, j - 1]],
      cellLabels: { [`0,${j - 1}`]: "empty" },
      vars: [
        { name: `p[${j - 1}]`, value: "*" },
        { name: `dp[0][${j - 1}]`, value: dp[0][j - 1] },
        { name: `dp[0][${j}]`, value: dp[0][j] },
      ],
      note: { vi: "A leading '*' can match the empty string.", en: "A leading '*' can match the empty string." },
    });
  }

  for (let i = 1; i <= m; i++) {
    gridSnap({
      title: { vi: `Outer loop i=${i}`, en: `Outer loop i=${i}` },
      codeLines: [11],
      hlCell: [i, 0],
      vars: [
        { name: `s[${i - 1}]`, value: s[i - 1] },
        { name: "s[:i]", value: s.slice(0, i) },
      ],
      note: { vi: `Compute row for s[:${i}] = "${s.slice(0, i)}".`, en: `Compute row for s[:${i}] = "${s.slice(0, i)}".` },
    });

    for (let j = 1; j <= n; j++) {
      gridSnap({
        title: { vi: `Inner loop j=${j}`, en: `Inner loop j=${j}` },
        codeLines: [12],
        hlCell: [i, j],
        vars: [
          { name: `s[${i - 1}]`, value: s[i - 1] },
          { name: `p[${j - 1}]`, value: p[j - 1] },
          { name: "p[:j]", value: p.slice(0, j) },
        ],
        note: { vi: `Decide if "${s.slice(0, i)}" matches pattern "${p.slice(0, j)}".`, en: `Decide if "${s.slice(0, i)}" matches pattern "${p.slice(0, j)}".` },
      });

      const pc = p[j - 1];
      const singleMatch = pc === "?" || pc === s[i - 1];
      gridSnap({
        title: { vi: `if single token matches -> ${singleMatch}`, en: `if single token matches -> ${singleMatch}` },
        codeLines: [13],
        hlCell: [i, j],
        vars: [
          { name: `s[${i - 1}]`, value: s[i - 1] },
          { name: `p[${j - 1}]`, value: pc },
          { name: "condition", value: singleMatch },
        ],
        note: singleMatch
          ? {
              vi: pc === "?" ? "'?' khớp đúng một ký tự." : "Hai ký tự giống nhau.",
              en: pc === "?" ? "'?' matches exactly one character." : "The two characters are equal.",
            }
          : {
              vi: "Không khớp dạng một ký tự; nếu token là '*' thì xét nhánh wildcard.",
              en: "No single-character match; if the token is '*', check the wildcard branch.",
            },
      });

      if (singleMatch) {
        const prev = dp[i - 1][j - 1];
        dp[i][j] = prev;
        gridSnap({
          title: { vi: `Single-char match -> ${dp[i][j]}`, en: `Single-char match -> ${dp[i][j]}` },
          codeLines: [14],
          hlCell: [i, j],
          pathCells: [[i - 1, j - 1]],
          cellLabels: { [`${i - 1},${j - 1}`]: "diag" },
          vars: [
            { name: "token matches one char", value: true },
            { name: `dp[${i - 1}][${j - 1}]`, value: prev },
            { name: `dp[${i}][${j}]`, value: dp[i][j] },
          ],
          note: { vi: pc === "?" ? "'?' matches exactly one character, so use dp[i-1][j-1]." : "Characters are equal, so use dp[i-1][j-1].", en: pc === "?" ? "'?' matches exactly one character, so use dp[i-1][j-1]." : "Characters are equal, so use dp[i-1][j-1]." },
        });
        continue;
      }

      const starCase = pc === "*";
      gridSnap({
        title: { vi: `elif p[${j - 1}] == '*' -> ${starCase}`, en: `elif p[${j - 1}] == '*' -> ${starCase}` },
        codeLines: [15],
        hlCell: [i, j],
        vars: [
          { name: `p[${j - 1}]`, value: pc },
          { name: "condition", value: starCase },
        ],
        note: starCase
          ? {
              vi: "'*' có thể match rỗng hoặc ăn thêm một ký tự của s.",
              en: "'*' can match empty or consume one more character from s.",
            }
          : {
              vi: "Không phải '*', nên ô này sẽ là False.",
              en: "This token is not '*', so this cell will be False.",
            },
      });

      if (starCase) {
        const empty = dp[i][j - 1];
        const consume = dp[i - 1][j];
        dp[i][j] = Boolean(empty || consume);
        gridSnap({
          title: { vi: `'*' wildcard -> ${dp[i][j]}`, en: `'*' wildcard -> ${dp[i][j]}` },
          codeLines: [16],
          hlCell: [i, j],
          pathCells: [[i, j - 1], [i - 1, j]],
          cellLabels: { [`${i},${j - 1}`]: "empty", [`${i - 1},${j}`]: "consume" },
          vars: [
            { name: "empty string", value: `dp[${i}][${j - 1}] = ${empty}` },
            { name: "consume s[i-1]", value: `dp[${i - 1}][${j}] = ${consume}` },
            { name: `dp[${i}][${j}]`, value: dp[i][j] },
          ],
          note: { vi: "Wildcard '*' has two choices: match empty (left cell), or consume one more char from s (top cell).", en: "Wildcard '*' has two choices: match empty (left cell), or consume one more char from s (top cell)." },
        });
      } else {
        dp[i][j] = false;
        gridSnap({
          title: { vi: "No match -> False", en: "No match -> False" },
          codeLines: [18],
          hlCell: [i, j],
          vars: [
            { name: `s[${i - 1}]`, value: s[i - 1] },
            { name: `p[${j - 1}]`, value: pc },
            { name: `dp[${i}][${j}]`, value: false },
          ],
          note: { vi: "Characters differ and pattern token is not '?' or '*'.", en: "Characters differ and pattern token is not '?' or '*'." },
        });
      }
    }
  }

  const answer = dp[m][n];
  gridSnap({
    title: { vi: `return ${answer}`, en: `return ${answer}` },
    codeLines: [19],
    hlCell: [m, n],
    vars: [
      { name: `dp[${m}][${n}]`, value: answer },
      { name: "return", value: answer },
    ],
    note: { vi: `Full string "${s}" ${answer ? "matches" : "does not match"} wildcard pattern "${p}".`, en: `Full string "${s}" ${answer ? "matches" : "does not match"} wildcard pattern "${p}".` },
    final: true,
  });

  return { s, p, answer, steps };
}

function buildSteps44Greedy(input, params) {
  const s = String(input).trim();
  const p = String(params.p || "").trim();
  const steps = [];
  const width = Math.max(s.length, p.length, 1);
  const sCells = Array.from({ length: width }, (_, idx) => s[idx] || "");
  const pCells = Array.from({ length: width }, (_, idx) => p[idx] || "");
  const colLabels = Array.from({ length: width }, (_, idx) => ({ index: idx, char: "" }));
  let i = 0;
  let j = 0;
  let star = -1;
  let match = 0;

  function pointerCell(row, idx) {
    return idx >= 0 && idx < width ? [row, idx] : null;
  }

  function snap(opts) {
    const pathCells = [];
    if (star >= 0 && star < width) pathCells.push([1, star]);
    if (match >= 0 && match < width) pathCells.push([0, match]);
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: [sCells, pCells],
        rowLabels: [
          { index: "s", char: "" },
          { index: "p", char: "" },
        ],
        colLabels,
        largeCells: true,
        hlCell: opts.hlCell || pointerCell(0, i),
        pathCells: opts.pathCells || pathCells,
        cellLabels: opts.cellLabels || {},
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      codeBlock: 2,
      vars: [
        { name: "i", value: i },
        { name: "j", value: j },
        { name: "star", value: star },
        { name: "match", value: match },
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: opts.final || false,
    });
  }

  snap({
    title: { vi: "i = j = 0", en: "i = j = 0" },
    codeLines: [3],
    vars: [
      { name: "s", value: s },
      { name: "p", value: p },
      { name: "i", value: i },
      { name: "j", value: j },
    ],
    note: {
      vi: "i doc chuoi s, j doc pattern p.",
      en: "i scans s, j scans p.",
    },
  });
  snap({
    title: { vi: "star = -1", en: "star = -1" },
    codeLines: [4],
    vars: [{ name: "star", value: star }],
    note: {
      vi: "Chua co checkpoint '*' nao.",
      en: "No '*' checkpoint has been seen yet.",
    },
  });
  snap({
    title: { vi: "match = 0", en: "match = 0" },
    codeLines: [5],
    vars: [{ name: "match", value: match }],
    note: {
      vi: "match luu vi tri s dang thu cho '*' gan nhat.",
      en: "match stores the s position currently assigned to the latest '*'.",
    },
  });

  while (i < s.length) {
    snap({
      title: { vi: `while i < len(s): i=${i}`, en: `while i < len(s): i=${i}` },
      codeLines: [7],
      hlCell: pointerCell(0, i),
      pathCells: j < p.length ? [[1, j]] : [],
      cellLabels: j < p.length ? { [`1,${j}`]: "j" } : {},
      vars: [
        { name: `s[${i}]`, value: s[i] },
        { name: j < p.length ? `p[${j}]` : "p[j]", value: j < p.length ? p[j] : "END" },
      ],
      note: { vi: "So sanh ky tu hien tai cua s voi token hien tai cua p.", en: "Compare the current s character with the current p token." },
    });

    const direct = j < p.length && (p[j] === s[i] || p[j] === "?");
    snap({
      title: { vi: `if direct match -> ${direct}`, en: `if direct match -> ${direct}` },
      codeLines: [8],
      hlCell: pointerCell(0, i),
      pathCells: j < p.length ? [[1, j]] : [],
      cellLabels: j < p.length ? { [`0,${i}`]: "i", [`1,${j}`]: "j" } : { [`0,${i}`]: "i" },
      vars: [
        { name: `s[${i}]`, value: s[i] },
        { name: j < p.length ? `p[${j}]` : "p[j]", value: j < p.length ? p[j] : "END" },
        { name: "condition", value: direct },
      ],
      note: direct
        ? {
            vi: "Ky tu bang nhau, hoac '?' khop dung mot ky tu.",
            en: "Characters are equal, or '?' matches exactly one character.",
          }
        : {
            vi: "Khong khop truc tiep; thu xem p[j] co phai '*' khong.",
            en: "No direct match; next check whether p[j] is '*'.",
          },
    });

    if (direct) {
      const oldI = i;
      const oldJ = j;
      i += 1;
      snap({
        title: { vi: "i += 1", en: "i += 1" },
        codeLines: [9],
        hlCell: pointerCell(0, oldI),
        pathCells: [[1, oldJ]],
        cellLabels: { [`0,${oldI}`]: "i", [`1,${oldJ}`]: "j" },
        vars: [
          { name: "match token", value: p[oldJ] },
          { name: "next i", value: i },
          { name: "j", value: j },
        ],
        note: { vi: "Da khop s[old i], nen tang i.", en: "s[old i] matched, so advance i." },
      });
      j += 1;
      snap({
        title: { vi: "j += 1", en: "j += 1" },
        codeLines: [10],
        hlCell: pointerCell(1, oldJ),
        pathCells: [[0, oldI]],
        cellLabels: { [`0,${oldI}`]: "i", [`1,${oldJ}`]: "j" },
        vars: [
          { name: "i", value: i },
          { name: "next j", value: j },
        ],
        note: { vi: "Da khop p[old j], nen tang j.", en: "p[old j] matched, so advance j." },
      });
    } else {
      const isStar = j < p.length && p[j] === "*";
      snap({
        title: { vi: `elif p[j] == '*' -> ${isStar}`, en: `elif p[j] == '*' -> ${isStar}` },
        codeLines: [12],
        hlCell: j < p.length ? pointerCell(1, j) : pointerCell(0, i),
        pathCells: [[0, i]].filter(Boolean),
        vars: [
          { name: j < p.length ? `p[${j}]` : "p[j]", value: j < p.length ? p[j] : "END" },
          { name: "condition", value: isStar },
        ],
        note: isStar
          ? {
              vi: "Gap '*', luu checkpoint de co the backtrack.",
              en: "Found '*', save a checkpoint for possible backtracking.",
            }
          : {
              vi: "Khong phai '*'; neu da co checkpoint thi backtrack, neu khong thi fail.",
              en: "Not '*'; backtrack if a checkpoint exists, otherwise fail.",
            },
      });

      if (isStar) {
      const oldJ = j;
      star = j;
      snap({
        title: { vi: "star = j", en: "star = j" },
        codeLines: [13],
        hlCell: pointerCell(1, oldJ),
        pathCells: [[0, i]],
        cellLabels: { [`1,${star}`]: "star" },
        vars: [{ name: "star", value: star }],
        note: { vi: "Luu vi tri '*' gan nhat.", en: "Store the latest '*' position." },
      });
      match = i;
      snap({
        title: { vi: "match = i", en: "match = i" },
        codeLines: [14],
        hlCell: pointerCell(0, i),
        pathCells: [[1, star]],
        cellLabels: { [`1,${star}`]: "star", [`0,${match}`]: "match" },
        vars: [{ name: "match", value: match }],
        note: { vi: "Ban dau cho '*' khop chuoi rong tai vi tri i hien tai.", en: "Initially let '*' match empty at the current i position." },
      });
      j += 1;
      snap({
        title: { vi: "j += 1", en: "j += 1" },
        codeLines: [15],
        hlCell: pointerCell(1, oldJ),
        pathCells: [[0, match], [1, star]],
        cellLabels: { [`1,${star}`]: "star", [`0,${match}`]: "match" },
        vars: [
          { name: "saved star", value: star },
          { name: "saved match", value: match },
          { name: "next j", value: j },
        ],
        note: { vi: "'*' co the khop chuoi rong truoc; neu sau nay bi mismatch, ta quay lai va cho '*' an them ky tu.", en: "'*' first tries to match empty; if a later mismatch happens, we return here and let '*' consume more characters." },
      });
      } else {
      const canBacktrack = star !== -1;
      snap({
        title: { vi: `elif star != -1 -> ${canBacktrack}`, en: `elif star != -1 -> ${canBacktrack}` },
        codeLines: [17],
        hlCell: pointerCell(0, i),
        pathCells: star >= 0 ? [[1, star]] : [],
        cellLabels: star >= 0 ? { [`1,${star}`]: "star" } : {},
        vars: [
          { name: "star", value: star },
          { name: "condition", value: canBacktrack },
        ],
        note: canBacktrack
          ? {
              vi: "Da tung gap '*', cho '*' an them mot ky tu va thu lai.",
              en: "A previous '*' exists; let it consume one more character and retry.",
            }
          : {
              vi: "Khong co '*' nao de quay lai.",
              en: "There is no previous '*' to backtrack to.",
            },
      });

      if (canBacktrack) {
      const oldI = i;
      const oldJ = j;
      j = star + 1;
      snap({
        title: { vi: "j = star + 1", en: "j = star + 1" },
        codeLines: [18],
        hlCell: pointerCell(0, oldI),
        pathCells: [[1, star]],
        cellLabels: { [`1,${star}`]: "star" },
        vars: [
          { name: "old j", value: oldJ },
          { name: "new j", value: j },
        ],
        note: { vi: "Quay pattern ve ngay sau '*'.", en: "Move the pattern pointer back to just after '*'." },
      });
      match += 1;
      snap({
        title: { vi: "match += 1", en: "match += 1" },
        codeLines: [19],
        hlCell: pointerCell(0, oldI),
        pathCells: [[1, star], [0, match]],
        cellLabels: { [`1,${star}`]: "star", [`0,${match}`]: "new match" },
        vars: [{ name: "match", value: match }],
        note: { vi: "Cho '*' khop them mot ky tu cua s.", en: "Let '*' consume one more character from s." },
      });
      i = match;
      snap({
        title: { vi: "i = match", en: "i = match" },
        codeLines: [20],
        hlCell: pointerCell(0, oldI),
        pathCells: [[1, star], [0, match]],
        cellLabels: { [`1,${star}`]: "star", [`0,${match}`]: "new match" },
        vars: [
          { name: "old i", value: oldI },
          { name: "old j", value: oldJ },
          { name: "new i", value: i },
          { name: "new j", value: j },
        ],
        note: { vi: "Da tung gap '*', nen cho '*' khop them mot ky tu cua s va thu lai pattern sau '*'.", en: "Because we have seen a '*', let it consume one more s character and retry the pattern after '*'." },
      });
      } else {
      snap({
        title: { vi: "else", en: "else" },
        codeLines: [22],
        hlCell: pointerCell(0, i),
        pathCells: j < p.length ? [[1, j]] : [],
        vars: [{ name: "no available branch", value: true }],
        note: { vi: "Khong khop truc tiep, khong phai '*', va khong co checkpoint.", en: "No direct match, no '*', and no checkpoint exists." },
      });
      snap({
        title: { vi: "return False", en: "return False" },
        codeLines: [23],
        hlCell: pointerCell(0, i),
        pathCells: j < p.length ? [[1, j]] : [],
        vars: [{ name: "return", value: false }],
        note: { vi: "Khong co checkpoint '*' de backtrack, nen tra ve False.", en: "There is no previous '*' checkpoint to backtrack to, so return False." },
        final: true,
      });
      return { s, p, answer: false, steps };
      }
      }
    }
  }

  snap({
    title: { vi: "Da doc het s", en: "Finished scanning s" },
    codeLines: [25],
    hlCell: j < p.length ? pointerCell(1, j) : null,
    vars: [{ name: "remaining pattern", value: p.slice(j) || '""' }],
    note: { vi: "Sau khi het s, pattern con lai chi duoc phep la cac dau '*'.", en: "After s is consumed, the remaining pattern may contain only '*' tokens." },
  });

  while (j < p.length && p[j] === "*") {
    snap({
      title: { vi: `while trailing '*' -> true`, en: `while trailing '*' -> true` },
      codeLines: [25],
      hlCell: pointerCell(1, j),
      vars: [
        { name: "j", value: j },
        { name: `p[${j}]`, value: p[j] },
      ],
      note: { vi: "Pattern con lai la '*', co the khop rong.", en: "The remaining pattern token is '*', which can match empty." },
    });
    const oldJ = j;
    j += 1;
    snap({
      title: { vi: "Bo qua trailing '*'", en: "Skip trailing '*'" },
      codeLines: [26],
      hlCell: pointerCell(1, oldJ),
      pathCells: [[1, oldJ]],
      cellLabels: { [`1,${oldJ}`]: "*" },
      vars: [{ name: "next j", value: j }],
      note: { vi: "'*' o cuoi co the khop chuoi rong.", en: "A trailing '*' can match the empty string." },
    });
  }

  const answer = j === p.length;
  snap({
    title: { vi: `return ${answer}`, en: `return ${answer}` },
    codeLines: [28],
    hlCell: j < p.length ? pointerCell(1, j) : null,
    vars: [
      { name: "j == len(p)", value: answer },
      { name: "return", value: answer },
    ],
    note: {
      vi: answer ? "Da dung het pattern, nen s khop p." : "Pattern van con token khong phai '*', nen khong khop.",
      en: answer ? "The whole pattern is consumed, so s matches p." : "The pattern still has a non-'*' token, so it does not match.",
    },
    final: true,
  });

  return { s, p, answer, steps };
}

function buildSteps44(input, params) {
  const approach = String(params && params.approach ? params.approach : "1");
  if (approach === "2") return buildSteps44Greedy(input, params);
  return buildSteps44Table(input, params);
}

/** LeetCode 264: Ugly Number II — DP with three monotonic pointers. */
function buildSteps264DP(input) {
  const n = Array.isArray(input) ? Number(input[0]) : Number(input);
  const steps = [];

  if (!Number.isInteger(n) || n < 1 || n > 1690) {
    steps.push({
      title: { vi: "n không hợp lệ", en: "Invalid n" },
      arr: [], highlight: [], mark: [], final: true, codeLines: [2],
      vars: [{ name: "n", value: n }],
      note: { vi: "n phải nằm trong khoảng 1..1690.", en: "n must be between 1 and 1690." },
    });
    return { original: [n], answer: null, steps };
  }

  const ugly = Array(n).fill(1);
  let p2 = 0;
  let p3 = 0;
  let p5 = 0;
  let recordSteps = true;

  const pointerLabels = (start, length) => Array.from({ length: length - start }, (_, localIndex) => {
    const index = start + localIndex;
    const labels = [];
    if (index === p2) labels.push("p2");
    if (index === p3) labels.push("p3");
    if (index === p5) labels.push("p5");
    return [`i=${index}`, ...labels].join(" · ");
  });

  const snapshot = ({ title, codeLine, length, highlight = [], mark = [], vars = [], note, final = false }) => {
    if (!recordSteps) return;
    const start = Math.max(0, length - 60);
    steps.push({
      title,
      arr: ugly.slice(start, length),
      sub: pointerLabels(start, length),
      highlight: highlight.filter((index) => index >= start && index < length).map((index) => index - start),
      mark: mark.filter((index) => index >= start && index < length).map((index) => index - start),
      codeLines: [codeLine],
      vars,
      note,
      final,
    });
  };

  snapshot({
    title: { vi: "Khởi tạo dãy ugly với số 1", en: "Initialize the ugly sequence with 1" },
    codeLine: 3,
    length: 1,
    mark: [0],
    vars: [{ name: "ugly", value: "[1]" }, { name: "n", value: n }],
    note: {
      vi: "1 được quy ước là ugly number đầu tiên. Mảng DP sẽ được xây theo thứ tự tăng dần.",
      en: "By definition, 1 is the first ugly number. The DP array is built in ascending order.",
    },
  });

  snapshot({
    title: { vi: "Đặt p2 = p3 = p5 = 0", en: "Set p2 = p3 = p5 = 0" },
    codeLine: 4,
    length: 1,
    highlight: [0],
    vars: [{ name: "p2", value: 0 }, { name: "p3", value: 0 }, { name: "p5", value: 0 }],
    note: {
      vi: "Ba con trỏ lần lượt tạo ứng viên tiếp theo bằng cách nhân 2, 3 và 5.",
      en: "The three pointers generate the next candidates by multiplying by 2, 3, and 5.",
    },
  });

  for (let i = 1; i < n; i++) {
    if (n > 100 && i === 30) recordSteps = false;
    if (n > 100 && i === n - 1) {
      recordSteps = true;
      snapshot({
        title: { vi: `Tua nhanh đến i = ${i}`, en: `Fast-forward to i = ${i}` },
        codeLine: 5,
        length: i,
        highlight: [...new Set([p2, p3, p5])],
        vars: [{ name: "iterations summarized", value: `30..${i - 1}` }, { name: "generated", value: i }],
        note: {
          vi: "Với n lớn, visualization tóm tắt các vòng giữa để giao diện vẫn nhẹ; thuật toán vẫn tính đầy đủ mọi giá trị.",
          en: "For large n, middle iterations are summarized to keep the visualization responsive; every value is still computed.",
        },
      });
    }
    snapshot({
      title: { vi: `Vòng lặp i = ${i}`, en: `Loop i = ${i}` },
      codeLine: 5,
      length: i,
      highlight: [...new Set([p2, p3, p5])],
      vars: [{ name: "i", value: i }, { name: "ugly so far", value: `[${ugly.slice(0, i).join(", ")}]` }],
      note: { vi: `Tìm ugly number thứ ${i + 1}.`, en: `Find ugly number #${i + 1}.` },
    });

    const next2 = ugly[p2] * 2;
    snapshot({
      title: { vi: `next2 = ugly[${p2}] × 2 = ${next2}`, en: `next2 = ugly[${p2}] × 2 = ${next2}` },
      codeLine: 6,
      length: i,
      highlight: [p2],
      vars: [{ name: "p2", value: p2 }, { name: `ugly[${p2}]`, value: ugly[p2] }, { name: "next2", value: next2 }],
      note: { vi: `Nhánh ×2 đang đề xuất ${next2}.`, en: `The ×2 stream proposes ${next2}.` },
    });

    const next3 = ugly[p3] * 3;
    snapshot({
      title: { vi: `next3 = ugly[${p3}] × 3 = ${next3}`, en: `next3 = ugly[${p3}] × 3 = ${next3}` },
      codeLine: 7,
      length: i,
      highlight: [p3],
      vars: [{ name: "next2", value: next2 }, { name: "p3", value: p3 }, { name: "next3", value: next3 }],
      note: { vi: `Nhánh ×3 đang đề xuất ${next3}.`, en: `The ×3 stream proposes ${next3}.` },
    });

    const next5 = ugly[p5] * 5;
    snapshot({
      title: { vi: `next5 = ugly[${p5}] × 5 = ${next5}`, en: `next5 = ugly[${p5}] × 5 = ${next5}` },
      codeLine: 8,
      length: i,
      highlight: [p5],
      vars: [{ name: "next2", value: next2 }, { name: "next3", value: next3 }, { name: "next5", value: next5 }],
      note: { vi: `Nhánh ×5 đang đề xuất ${next5}.`, en: `The ×5 stream proposes ${next5}.` },
    });

    const next = Math.min(next2, next3, next5);
    ugly[i] = next;
    snapshot({
      title: { vi: `ugly[${i}] = min(${next2}, ${next3}, ${next5}) = ${next}`, en: `ugly[${i}] = min(${next2}, ${next3}, ${next5}) = ${next}` },
      codeLine: 9,
      length: i + 1,
      highlight: [...new Set([p2, p3, p5])],
      mark: [i],
      vars: [{ name: "next2", value: next2 }, { name: "next3", value: next3 }, { name: "next5", value: next5 }, { name: `ugly[${i}]`, value: next }],
      note: {
        vi: `Chọn ứng viên nhỏ nhất ${next} để giữ dãy tăng dần và không bỏ sót ugly number nào.`,
        en: `Choose the smallest candidate ${next} to preserve order without skipping any ugly number.`,
      },
    });

    const match2 = next === next2;
    snapshot({
      title: { vi: `ugly[${i}] == next2? ${match2}`, en: `ugly[${i}] == next2? ${match2}` },
      codeLine: 10,
      length: i + 1,
      highlight: [p2], mark: [i],
      vars: [{ name: `ugly[${i}]`, value: next }, { name: "next2", value: next2 }, { name: "match", value: match2 }],
      note: match2
        ? { vi: "Ứng viên ×2 đã được dùng nên phải tiến p2.", en: "The ×2 candidate was consumed, so advance p2." }
        : { vi: "Ứng viên ×2 chưa được dùng; giữ nguyên p2.", en: "The ×2 candidate was not consumed; keep p2." },
    });
    if (match2) {
      p2++;
      snapshot({
        title: { vi: `p2 → ${p2}`, en: `p2 → ${p2}` }, codeLine: 11, length: i + 1,
        highlight: [p2], mark: [i], vars: [{ name: "p2", value: p2 }, { name: "next ×2", value: ugly[p2] * 2 }],
        note: { vi: "p2 chuyển tới ugly number chưa dùng tiếp theo của nhánh ×2.", en: "p2 moves to the next unused value in the ×2 stream." },
      });
    }

    const match3 = next === next3;
    snapshot({
      title: { vi: `ugly[${i}] == next3? ${match3}`, en: `ugly[${i}] == next3? ${match3}` },
      codeLine: 12, length: i + 1, highlight: [p3], mark: [i],
      vars: [{ name: `ugly[${i}]`, value: next }, { name: "next3", value: next3 }, { name: "match", value: match3 }],
      note: match3
        ? { vi: "Ứng viên ×3 đã được dùng nên phải tiến p3.", en: "The ×3 candidate was consumed, so advance p3." }
        : { vi: "Ứng viên ×3 chưa được dùng; giữ nguyên p3.", en: "The ×3 candidate was not consumed; keep p3." },
    });
    if (match3) {
      p3++;
      snapshot({
        title: { vi: `p3 → ${p3}`, en: `p3 → ${p3}` }, codeLine: 13, length: i + 1,
        highlight: [p3], mark: [i], vars: [{ name: "p3", value: p3 }, { name: "next ×3", value: ugly[p3] * 3 }],
        note: { vi: "p3 chuyển tới giá trị chưa dùng tiếp theo của nhánh ×3.", en: "p3 moves to the next unused value in the ×3 stream." },
      });
    }

    const match5 = next === next5;
    snapshot({
      title: { vi: `ugly[${i}] == next5? ${match5}`, en: `ugly[${i}] == next5? ${match5}` },
      codeLine: 14, length: i + 1, highlight: [p5], mark: [i],
      vars: [{ name: `ugly[${i}]`, value: next }, { name: "next5", value: next5 }, { name: "match", value: match5 }],
      note: match5
        ? { vi: "Ứng viên ×5 đã được dùng nên phải tiến p5.", en: "The ×5 candidate was consumed, so advance p5." }
        : { vi: "Ứng viên ×5 chưa được dùng; giữ nguyên p5.", en: "The ×5 candidate was not consumed; keep p5." },
    });
    if (match5) {
      p5++;
      snapshot({
        title: { vi: `p5 → ${p5}`, en: `p5 → ${p5}` }, codeLine: 15, length: i + 1,
        highlight: [p5], mark: [i], vars: [{ name: "p5", value: p5 }, { name: "next ×5", value: ugly[p5] * 5 }],
        note: { vi: "p5 chuyển tới giá trị chưa dùng tiếp theo của nhánh ×5.", en: "p5 moves to the next unused value in the ×5 stream." },
      });
    }
  }

  const answer = ugly[n - 1];
  const uglyText = n <= 50
    ? `[${ugly.join(", ")}]`
    : `[${ugly.slice(0, 10).join(", ")}, …, ${ugly.slice(-10).join(", ")}]`;
  snapshot({
    title: { vi: `Ugly number thứ ${n} là ${answer}`, en: `Ugly number #${n} is ${answer}` },
    codeLine: 16,
    length: n,
    mark: [n - 1],
    vars: [{ name: "ugly", value: uglyText }, { name: "answer", value: answer }],
    note: { vi: `Phần tử cuối ugly[${n - 1}] là đáp án.`, en: `The final element ugly[${n - 1}] is the answer.` },
    final: true,
  });

  return { original: [n], answer, steps };
}

function buildSteps264Heap(input) {
  const n = Array.isArray(input) ? Number(input[0]) : Number(input);
  const steps = [];
  if (!Number.isInteger(n) || n < 1 || n > 1690) {
    steps.push({
      title: { vi: "n không hợp lệ", en: "Invalid n" },
      tree: { nodes: [] }, final: true, codeLines: [3], codeBlock: 2,
      vars: [{ name: "n", value: n }],
      note: { vi: "n phải nằm trong khoảng 1..1690.", en: "n must be between 1 and 1690." },
    });
    return { original: [n], answer: null, steps };
  }

  const heap = [1];
  const seen = new Set([1]);
  let ugly = 1;
  let recordSteps = true;

  const heapNodes = (highlight = new Set(), marked = new Set()) => {
    const visible = heap.slice(0, 63);
    const nodes = [];
    let nextX = 0;
    function visit(index, depth) {
      if (index >= visible.length) return;
      visit(index * 2 + 1, depth + 1);
      nodes.push({
        id: index,
        label: String(visible[index]),
        x: nextX++,
        y: depth,
        parentId: index === 0 ? null : Math.floor((index - 1) / 2),
        hl: highlight.has(index),
        isWord: marked.has(index),
      });
      visit(index * 2 + 2, depth + 1);
    }
    visit(0, 0);
    return nodes;
  };

  const heapText = () => {
    const shown = heap.slice(0, 20).join(", ");
    return heap.length <= 20 ? `[${shown}]` : `[${shown}, …]`;
  };
  const snapshot = ({ title, codeLine, highlight = [], mark = [], vars = [], note, final = false }) => {
    if (!recordSteps) return;
    steps.push({
      title,
      tree: { nodes: heapNodes(new Set(highlight), new Set(mark)) },
      codeLines: [codeLine],
      codeBlock: 2,
      vars,
      note,
      final,
    });
  };

  function pushHeap(value) {
    heap.push(value);
    let child = heap.length - 1;
    while (child > 0) {
      const parent = Math.floor((child - 1) / 2);
      if (heap[parent] <= heap[child]) break;
      [heap[parent], heap[child]] = [heap[child], heap[parent]];
      child = parent;
    }
    return child;
  }

  function popHeap() {
    const root = heap[0];
    const last = heap.pop();
    if (heap.length > 0) {
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

  snapshot({
    title: { vi: "Khởi tạo min-heap với 1", en: "Initialize the min-heap with 1" },
    codeLine: 4, highlight: [0],
    vars: [{ name: "heap", value: "[1]" }],
    note: { vi: "Heap luôn đặt ugly number nhỏ nhất chưa xử lý ở node gốc.", en: "The heap keeps the smallest unprocessed ugly number at its root." },
  });
  snapshot({
    title: { vi: "Khởi tạo seen = {1}", en: "Initialize seen = {1}" },
    codeLine: 5, mark: [0],
    vars: [{ name: "seen", value: "{1}" }, { name: "seen size", value: 1 }],
    note: { vi: "Set seen ngăn cùng một số được push nhiều lần.", en: "The seen set prevents the same value from being pushed more than once." },
  });

  for (let count = 0; count < n; count++) {
    if (n > 100 && count === 30) recordSteps = false;
    if (n > 100 && count === n - 1) {
      recordSteps = true;
      snapshot({
        title: { vi: `Tua nhanh đến lần pop ${n}`, en: `Fast-forward to pop #${n}` },
        codeLine: 6, highlight: heap.length ? [0] : [],
        vars: [{ name: "pops summarized", value: `31..${n - 1}` }, { name: "heap size", value: heap.length }],
        note: {
          vi: "Các lần pop ở giữa được tóm tắt để visualization nhẹ hơn; heap và seen vẫn được cập nhật đầy đủ.",
          en: "Middle pops are summarized to keep the visualization responsive; heap and seen are still fully updated.",
        },
      });
    }

    snapshot({
      title: { vi: `Lần lặp ${count + 1}/${n}`, en: `Iteration ${count + 1}/${n}` },
      codeLine: 6, highlight: heap.length ? [0] : [],
      vars: [{ name: "iteration", value: `${count + 1}/${n}` }, { name: "heap root", value: heap[0] }, { name: "heap size", value: heap.length }],
      note: { vi: "Node gốc là ugly number nhỏ nhất tiếp theo.", en: "The root is the next smallest ugly number." },
    });

    ugly = popHeap();
    snapshot({
      title: { vi: `heappop → ${ugly}`, en: `heappop → ${ugly}` },
      codeLine: 7, highlight: heap.length ? [0] : [],
      vars: [{ name: "ugly", value: ugly }, { name: "pop number", value: count + 1 }, { name: "heap", value: heapText() }],
      note: { vi: `${ugly} là ugly number thứ ${count + 1}.`, en: `${ugly} is ugly number #${count + 1}.` },
    });

    for (const factor of [2, 3, 5]) {
      snapshot({
        title: { vi: `Xét factor = ${factor}`, en: `Inspect factor = ${factor}` },
        codeLine: 8,
        vars: [{ name: "ugly", value: ugly }, { name: "factor", value: factor }],
        note: { vi: `Nhân ${ugly} với ${factor}.`, en: `Multiply ${ugly} by ${factor}.` },
      });

      const candidate = ugly * factor;
      snapshot({
        title: { vi: `candidate = ${ugly} × ${factor} = ${candidate}`, en: `candidate = ${ugly} × ${factor} = ${candidate}` },
        codeLine: 9,
        vars: [{ name: "ugly", value: ugly }, { name: "factor", value: factor }, { name: "candidate", value: candidate }],
        note: { vi: `${candidate} chỉ có thêm thừa số 2, 3 hoặc 5 nên vẫn là ugly number.`, en: `${candidate} only gains a factor of 2, 3, or 5, so it remains ugly.` },
      });

      const duplicate = seen.has(candidate);
      snapshot({
        title: { vi: `candidate not in seen? ${!duplicate}`, en: `candidate not in seen? ${!duplicate}` },
        codeLine: 10,
        vars: [{ name: "candidate", value: candidate }, { name: "already seen", value: duplicate }, { name: "seen size", value: seen.size }],
        note: duplicate
          ? { vi: `${candidate} đã tồn tại nên bỏ qua, không push trùng.`, en: `${candidate} already exists, so skip the duplicate push.` }
          : { vi: `${candidate} là giá trị mới; thêm vào seen và heap.`, en: `${candidate} is new; add it to seen and the heap.` },
      });
      if (duplicate) continue;

      seen.add(candidate);
      snapshot({
        title: { vi: `seen.add(${candidate})`, en: `seen.add(${candidate})` },
        codeLine: 11,
        vars: [{ name: "candidate", value: candidate }, { name: "seen size", value: seen.size }],
        note: { vi: "Đánh dấu trước khi push để các đường sinh khác không tạo bản sao.", en: "Mark it before pushing so other generation paths cannot create a duplicate." },
      });

      const finalIndex = pushHeap(candidate);
      snapshot({
        title: { vi: `heappush(${candidate})`, en: `heappush(${candidate})` },
        codeLine: 12, highlight: [finalIndex],
        vars: [{ name: "pushed", value: candidate }, { name: "heap", value: heapText() }, { name: "heap size", value: heap.length }],
        note: { vi: `Push ${candidate} rồi sift-up để khôi phục min-heap.`, en: `Push ${candidate}, then sift up to restore the min-heap.` },
      });
    }
  }

  snapshot({
    title: { vi: `Ugly number thứ ${n} là ${ugly}`, en: `Ugly number #${n} is ${ugly}` },
    codeLine: 13, final: true,
    vars: [{ name: "answer", value: ugly }, { name: "seen size", value: seen.size }, { name: "heap size", value: heap.length }],
    note: { vi: `Giá trị được pop lần thứ ${n} chính là đáp án.`, en: `The value popped for the ${n}th time is the answer.` },
  });
  return { original: [n], answer: ugly, steps };
}

function buildSteps264(input, params) {
  const approach = Number(params && params.approach) || 1;
  return approach === 2 ? buildSteps264Heap(input) : buildSteps264DP(input);
}

/**
 * LeetCode 312: Burst Balloons — interval DP.
 * balloons = [1] + nums + [1]. dp[left][right] = max coins from bursting all
 * balloons strictly inside the open interval (left, right). k = the LAST
 * balloon burst in that interval.
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def maxCoins(self, nums):
 *  3          balloons = [1] + nums + [1]
 *  4          n = len(balloons)
 *  5          dp = [[0]*n for _ in range(n)]
 *  6          for length in range(2, n):
 *  7              for left in range(n - length):
 *  8                  right = left + length
 *  9                  for k in range(left + 1, right):
 * 10                      coins = balloons[left]*balloons[k]*balloons[right]
 * 11                      coins += dp[left][k] + dp[k][right]
 * 12                      dp[left][right] = max(dp[left][right], coins)
 * 13          return dp[0][n-1]
 */
function buildSteps312(inputNums) {
  const nums = Array.isArray(inputNums)
    ? [...inputNums]
    : String(inputNums).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x));
  const balloons = [1, ...nums, 1];
  const n = balloons.length;
  const dp = Array.from({ length: n }, () => Array(n).fill(0));
  const steps = [];

  // Column/row headers show the padded balloon values
  const headers = balloons.map((b, i) => `${i}:${b}`);

  function gridSnap(opts) {
    // Build display grid with header row + header col
    const display = [["", ...headers]];
    for (let r = 0; r < n; r++) {
      display.push([headers[r], ...dp[r].map((v) => (v === 0 ? "·" : String(v)))]);
    }
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: display,
        text1: "",
        text2: "",
        hlCell: opts.hlCell || null,      // [row+1, col+1] in display coords
        pathCells: opts.pathCells || [],
        largeCells: true,
      },
      highlight: [],
      mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  if (nums.length === 0) {
    gridSnap({
      title: { vi: "Mảng rỗng → 0", en: "Empty array → 0" },
      final: true, codeLines: [13], vars: [{ name: "answer", value: 0 }],
      note: { vi: "Không có bóng.", en: "No balloons." },
    });
    return { original: nums, answer: 0, steps };
  }

  gridSnap({
    title: { vi: "balloons = [1] + nums + [1]", en: "balloons = [1] + nums + [1]" },
    codeLines: [3, 4, 5],
    vars: [
      { name: "nums", value: `[${nums.join(", ")}]` },
      { name: "balloons", value: `[${balloons.join(", ")}]` },
      { name: "n", value: n },
    ],
    note: {
      vi:
        `Đệm 1 vào hai đầu: balloons = [${balloons.join(", ")}].\n` +
        `dp[left][right] = số coin tối đa khi làm nổ hết bóng NẰM GIỮA khoảng mở (left, right).\n` +
        `Đường chéo (khoảng không có bóng bên trong) = 0.`,
      en:
        `Pad with 1 on both ends: balloons = [${balloons.join(", ")}].\n` +
        `dp[left][right] = max coins from bursting every balloon strictly inside open interval (left, right).\n` +
        `The diagonal (empty interior) is 0.`,
    },
  });

  // Interval DP
  for (let length = 2; length < n; length++) {
    for (let left = 0; left + length < n; left++) {
      const right = left + length;
      let best = 0;
      let bestK = -1;

      gridSnap({
        title: { vi: `Khoảng (left=${left}, right=${right}), length=${length}`, en: `Interval (left=${left}, right=${right}), length=${length}` },
        codeLines: [6, 7, 8],
        hlCell: [left + 1, right + 1],
        vars: [
          { name: "length", value: length },
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "balloons[left]", value: balloons[left] },
          { name: "balloons[right]", value: balloons[right] },
        ],
        note: {
          vi: `Xét khoảng mở (${left}, ${right}). Thử từng bóng k giữa hai đầu làm bóng nổ CUỐI CÙNG.`,
          en: `Consider open interval (${left}, ${right}). Try each balloon k inside as the LAST to burst.`,
        },
      });

      for (let k = left + 1; k < right; k++) {
        const gain = balloons[left] * balloons[k] * balloons[right];
        const coins = gain + dp[left][k] + dp[k][right];
        const improved = coins > best;
        if (improved) { best = coins; bestK = k; }
        dp[left][right] = best;

        gridSnap({
          title: { vi: `k=${k}: coins = ${balloons[left]}·${balloons[k]}·${balloons[right]} + dp[${left}][${k}] + dp[${k}][${right}] = ${coins}`, en: `k=${k}: coins = ${balloons[left]}·${balloons[k]}·${balloons[right]} + dp[${left}][${k}] + dp[${k}][${right}] = ${coins}` },
          codeLines: [9, 10, 11, 12],
          hlCell: [left + 1, right + 1],
          pathCells: [[left + 1, k + 1], [k + 1, right + 1]],
          vars: [
            { name: "left, right", value: `${left}, ${right}` },
            { name: "k (last burst)", value: k },
            { name: "gain (l·k·r)", value: gain },
            { name: `dp[${left}][${k}]`, value: dp[left][k] },
            { name: `dp[${k}][${right}]`, value: dp[k][right] },
            { name: "coins", value: coins },
            { name: `dp[${left}][${right}]`, value: dp[left][right] },
          ],
          note: {
            vi:
              `Nếu k=${k} nổ CUỐI trong (${left}, ${right}): lúc đó chỉ còn bóng ${left} và ${right} bên cạnh k.\n` +
              `coins = balloons[${left}]·balloons[${k}]·balloons[${right}] + dp[${left}][${k}] + dp[${k}][${right}] = ${gain} + ${dp[left][k]} + ${dp[k][right]} = ${coins}.\n` +
              (improved ? `Tốt hơn → dp[${left}][${right}] = ${best}.` : `Không tốt hơn ${best}.`),
            en:
              `If k=${k} bursts LAST in (${left}, ${right}): only balloons ${left} and ${right} remain beside k.\n` +
              `coins = balloons[${left}]·balloons[${k}]·balloons[${right}] + dp[${left}][${k}] + dp[${k}][${right}] = ${gain} + ${dp[left][k]} + ${dp[k][right]} = ${coins}.\n` +
              (improved ? `Better → dp[${left}][${right}] = ${best}.` : `Not better than ${best}.`),
          },
        });
      }
    }
  }

  gridSnap({
    title: { vi: `return dp[0][${n - 1}] = ${dp[0][n - 1]}`, en: `return dp[0][${n - 1}] = ${dp[0][n - 1]}` },
    final: true,
    codeLines: [13],
    hlCell: [1, n],
    vars: [{ name: "answer", value: dp[0][n - 1] }],
    note: {
      vi: `Đáp án = dp[0][${n - 1}] = ${dp[0][n - 1]} coin — làm nổ mọi bóng thật trong khoảng (0, ${n - 1}).`,
      en: `Answer = dp[0][${n - 1}] = ${dp[0][n - 1]} coins — bursting every real balloon inside (0, ${n - 1}).`,
    },
  });

  return { original: nums, answer: dp[0][n - 1], steps };
}

/**
 * LeetCode 1473: Paint House III — DP over (house i, color, neighborhoods).
 * dp(i, prev_color, groups) = min cost to paint houses i..m-1 forming exactly
 * `target` neighborhoods total, given the previous house's color.
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def minCost(self, houses, cost, m, n, target):
 *  3          @lru_cache(None)
 *  4          def dp(i, prev, groups):
 *  5              if groups > target: return INF
 *  6              if i == m: return 0 if groups == target else INF
 *  7              if houses[i] != 0:
 *  8                  g = groups + (1 if houses[i] != prev else 0)
 *  9                  return dp(i+1, houses[i], g)
 * 10              best = INF
 * 11              for color in 1..n:
 * 12                  g = groups + (1 if color != prev else 0)
 * 13                  best = min(best, cost[i][color-1] + dp(i+1, color, g))
 * 14              return best
 * 15          ans = dp(0, 0, 0)
 * 16          return ans if ans != INF else -1
 */
function buildSteps1473(inputHouses, params) {
  const houses = Array.isArray(inputHouses)
    ? [...inputHouses]
    : String(inputHouses).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x));
  const m = houses.length;
  const n = params && params.n !== undefined ? Number(params.n) : 2;
  const target = params && params.target !== undefined ? Number(params.target) : 3;
  // cost: "c11 c12;c21 c22;..." rows separated by ';', colors by ','
  const costRaw = String(params && params.cost || "1,10;10,1;10,1;1,10;5,1");
  const cost = costRaw.split(";").map((row) => row.split(",").map((v) => Number(v.trim())));

  const steps = [];
  const INF = Infinity;
  const fmt = (v) => (v === INF ? "∞" : String(v));

  // Grid display: rows = houses, cols = colors; show cost or fixed color
  function makeGrid(curHouse, chosen) {
    const display = [["house\\color", ...Array.from({ length: n }, (_, c) => `c${c + 1}`)]];
    for (let i = 0; i < m; i++) {
      const row = [`h${i}${houses[i] ? `=c${houses[i]}` : ""}`];
      for (let c = 0; c < n; c++) {
        if (houses[i] !== 0) row.push(houses[i] === c + 1 ? "FIX" : "·");
        else row.push(String(cost[i][c]));
      }
      display.push(row);
    }
    const pathCells = [];
    (chosen || []).forEach(([hi, col]) => pathCells.push([hi + 1, col]));
    return {
      dp: display,
      text1: "", text2: "",
      hlCell: curHouse != null ? [curHouse + 1, 0] : null,
      pathCells,
      largeCells: true,
    };
  }

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      grid: makeGrid(opts.curHouse, opts.chosen),
      highlight: [], mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  snap({
    title: { vi: "Khởi tạo DP đệ quy có nhớ", en: "Initialize memoized DP" },
    codeLines: [2, 3, 4],
    vars: [
      { name: "m (houses)", value: m },
      { name: "n (colors)", value: n },
      { name: "target", value: target },
      { name: "houses", value: `[${houses.join(", ")}]` },
    ],
    note: {
      vi:
        `dp(i, prev, groups) = chi phí NHỎ NHẤT sơn nhà i..m-1 để tạo đúng target=${target} khu phố, biết nhà trước màu prev.\n` +
        `Khu phố = dãy nhà liền nhau CÙNG MÀU. Nhà đã sơn (houses[i]≠0) thì màu cố định (FIX), miễn phí.\n` +
        `Bảng: hàng = nhà, cột = màu; ô = chi phí sơn (hoặc FIX nếu đã sơn).`,
      en:
        `dp(i, prev, groups) = MIN cost to paint houses i..m-1 forming exactly target=${target} neighborhoods, given the previous color prev.\n` +
        `A neighborhood = a maximal run of adjacent SAME-colored houses. Already-painted houses (houses[i]≠0) are FIXed and free.\n` +
        `Table: rows = houses, cols = colors; cell = paint cost (or FIX if already painted).`,
    },
  });

  const memo = new Map();
  let calls = 0;
  const chosenPath = [];

  function dp(i, prev, groups, depth) {
    calls += 1;
    const key = `${i},${prev},${groups}`;

    if (groups > target) {
      if (calls <= 60) {
        snap({
          title: { vi: `dp(${i},${prev},${groups}): groups>${target} → ∞`, en: `dp(${i},${prev},${groups}): groups>${target} → ∞` },
          curHouse: i < m ? i : null,
          codeLines: [5],
          vars: [{ name: "i", value: i }, { name: "prev", value: prev }, { name: "groups", value: groups }, { name: "target", value: target }],
          note: { vi: `Đã có ${groups} khu phố > target=${target} → không hợp lệ → trả ∞.`, en: `Already ${groups} neighborhoods > target=${target} → invalid → return ∞.` },
        });
      }
      return INF;
    }

    if (i === m) {
      const res = groups === target ? 0 : INF;
      snap({
        title: { vi: `dp(${m},…,${groups}): hết nhà → ${fmt(res)}`, en: `dp(${m},…,${groups}): no more houses → ${fmt(res)}` },
        curHouse: null,
        codeLines: [6],
        vars: [{ name: "groups", value: groups }, { name: "target", value: target }, { name: "returns", value: fmt(res) }],
        note: {
          vi: groups === target
            ? `Sơn hết ${m} nhà và tạo đúng ${target} khu phố → chi phí thêm 0.`
            : `Sơn hết nhà nhưng có ${groups}≠${target} khu phố → không hợp lệ → ∞.`,
          en: groups === target
            ? `Painted all ${m} houses with exactly ${target} neighborhoods → 0 extra cost.`
            : `All houses painted but ${groups}≠${target} neighborhoods → invalid → ∞.`,
        },
      });
      return res;
    }

    if (memo.has(key)) return memo.get(key);

    let result;
    if (houses[i] !== 0) {
      const g = groups + (houses[i] !== prev ? 1 : 0);
      if (calls <= 60) {
        snap({
          title: { vi: `Nhà ${i} đã sơn màu ${houses[i]} (cố định)`, en: `House ${i} already color ${houses[i]} (fixed)` },
          curHouse: i,
          chosen: [[i, houses[i]]],
          codeLines: [7, 8, 9],
          vars: [
            { name: "i", value: i }, { name: "houses[i]", value: houses[i] }, { name: "prev", value: prev },
            { name: "new groups", value: g },
          ],
          note: {
            vi: `Nhà ${i} đã sơn màu ${houses[i]} → không tốn tiền. ${houses[i] !== prev ? `Khác màu nhà trước (${prev}) → khu phố mới, groups=${g}.` : `Cùng màu nhà trước → groups giữ = ${g}.`} Đệ quy dp(${i + 1}, ${houses[i]}, ${g}).`,
            en: `House ${i} is fixed to color ${houses[i]} → no cost. ${houses[i] !== prev ? `Different from prev (${prev}) → new neighborhood, groups=${g}.` : `Same as prev → groups stays ${g}.`} Recurse dp(${i + 1}, ${houses[i]}, ${g}).`,
          },
        });
      }
      result = dp(i + 1, houses[i], g, depth + 1);
    } else {
      let best = INF;
      let bestColor = -1;
      for (let color = 1; color <= n; color++) {
        const g = groups + (color !== prev ? 1 : 0);
        const sub = dp(i + 1, color, g, depth + 1);
        const totalCost = sub === INF ? INF : cost[i][color - 1] + sub;
        if (totalCost < best) { best = totalCost; bestColor = color; }
      }
      if (calls <= 60) {
        snap({
          title: { vi: `Nhà ${i} chưa sơn → thử ${n} màu, tốt nhất=${fmt(best)}`, en: `House ${i} unpainted → try ${n} colors, best=${fmt(best)}` },
          curHouse: i,
          chosen: bestColor > 0 ? [[i, bestColor]] : [],
          codeLines: [10, 11, 12, 13, 14],
          vars: [
            { name: "i", value: i }, { name: "prev", value: prev }, { name: "groups", value: groups },
            { name: "best color", value: bestColor > 0 ? bestColor : "none" },
            { name: "best cost", value: fmt(best) },
          ],
          note: {
            vi: `Nhà ${i} chưa sơn: thử từng màu 1..${n}. Với mỗi màu: chi phí = cost[${i}][màu] + dp(nhà kế). Chọn nhỏ nhất = ${fmt(best)} (màu ${bestColor > 0 ? bestColor : "-"}).`,
            en: `House ${i} unpainted: try each color 1..${n}. For each: cost = cost[${i}][color] + dp(next). Take the minimum = ${fmt(best)} (color ${bestColor > 0 ? bestColor : "-"}).`,
          },
        });
      }
      result = best;
    }

    memo.set(key, result);
    return result;
  }

  const answer = dp(0, 0, 0, 0);
  const final = answer === INF ? -1 : answer;

  snap({
    title: { vi: `Kết quả: ${final}`, en: `Result: ${final}` },
    curHouse: null,
    final: true,
    codeLines: [15, 16],
    vars: [
      { name: "dp(0,0,0)", value: fmt(answer) },
      { name: "answer", value: final },
    ],
    note: {
      vi: final === -1
        ? `Không thể sơn để tạo đúng ${target} khu phố → -1.`
        : `Chi phí nhỏ nhất để sơn hết nhà tạo đúng ${target} khu phố = ${final}.`,
      en: final === -1
        ? `Impossible to form exactly ${target} neighborhoods → -1.`
        : `Minimum cost to paint all houses forming exactly ${target} neighborhoods = ${final}.`,
    },
  });

  return { original: houses, answer: final, steps };
}

/**
 * LeetCode 188: Best Time to Buy and Sell Stock IV — DP with k transactions.
 * buy[j]  = max profit having made at most j buys and currently HOLDING.
 * sell[j] = max profit having made at most j completed sells (not holding).
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def maxProfit(self, k, prices):
 *  3          if k >= n // 2: return sum of all upward diffs   (unlimited)
 *  4          buy = [-inf]*(k+1); sell = [0]*(k+1)
 *  5          for price in prices:
 *  6              for j in range(1, k+1):
 *  7                  buy[j] = max(buy[j], sell[j-1] - price)
 *  8                  sell[j] = max(sell[j], buy[j] + price)
 *  9          return sell[k]
 */
function buildSteps188(inputPrices, params) {
  const prices = Array.isArray(inputPrices)
    ? [...inputPrices]
    : String(inputPrices).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x));
  const k = params && params.k !== undefined ? Number(params.k) : 2;
  const n = prices.length;
  const steps = [];
  const fmt = (v) => (v === -Infinity ? "-∞" : String(v));

  if (n === 0 || k === 0) {
    steps.push({
      title: { vi: "Không giao dịch được → 0", en: "No transactions possible → 0" },
      arr: [...prices], highlight: [], mark: [], final: true, codeLines: [2],
      vars: [{ name: "answer", value: 0 }],
      note: { vi: "Mảng rỗng hoặc k=0.", en: "Empty array or k=0." },
    });
    return { original: prices, answer: 0, steps };
  }

  // Unlimited case
  if (k >= Math.floor(n / 2)) {
    let profit = 0;
    const gains = [];
    for (let i = 1; i < n; i++) {
      if (prices[i] > prices[i - 1]) { profit += prices[i] - prices[i - 1]; gains.push(i); }
    }
    steps.push({
      title: { vi: `k ≥ n/2 → giao dịch không giới hạn`, en: `k ≥ n/2 → unlimited transactions` },
      arr: [...prices],
      sub: prices.map((_, i) => `[${i}]`),
      highlight: gains,
      mark: gains,
      final: true,
      codeLines: [3],
      vars: [{ name: "k", value: k }, { name: "n", value: n }, { name: "answer", value: profit }],
      note: {
        vi: `k=${k} ≥ n/2=${Math.floor(n / 2)} → có thể giao dịch bao nhiêu lần tùy ý. Cộng mọi đoạn tăng giá: tổng lời = ${profit}.`,
        en: `k=${k} ≥ n/2=${Math.floor(n / 2)} → effectively unlimited trades. Sum every upward move: total profit = ${profit}.`,
      },
    });
    return { original: prices, answer: profit, steps };
  }

  const buy = new Array(k + 1).fill(-Infinity);
  const sell = new Array(k + 1).fill(0);
  const buyStr = () => `[${buy.map(fmt).join(", ")}]`;
  const sellStr = () => `[${sell.map((v) => String(v)).join(", ")}]`;

  steps.push({
    title: { vi: "buy = [-∞]·(k+1), sell = [0]·(k+1)", en: "buy = [-∞]·(k+1), sell = [0]·(k+1)" },
    arr: [...prices],
    sub: prices.map((_, i) => `[${i}]`),
    highlight: [], mark: [],
    codeLines: [4],
    vars: [
      { name: "k", value: k },
      { name: "prices", value: `[${prices.join(", ")}]` },
      { name: "buy", value: buyStr() },
      { name: "sell", value: sellStr() },
    ],
    note: {
      vi:
        `buy[j] = lời tối đa khi đã MUA tối đa j lần và ĐANG GIỮ cổ phiếu.\n` +
        `sell[j] = lời tối đa khi đã BÁN xong tối đa j lần (không giữ).\n` +
        `buy khởi tạo -∞ (chưa thể giữ khi chưa mua); sell = 0 (chưa giao dịch).`,
      en:
        `buy[j] = max profit having BOUGHT at most j times and currently HOLDING.\n` +
        `sell[j] = max profit having completed at most j SELLS (not holding).\n` +
        `buy starts at -∞ (can't hold before buying); sell = 0 (no trades yet).`,
    },
  });

  for (let p = 0; p < n; p++) {
    const price = prices[p];
    for (let j = 1; j <= k; j++) {
      const oldBuy = buy[j];
      buy[j] = Math.max(buy[j], sell[j - 1] - price);
      const oldSell = sell[j];
      sell[j] = Math.max(sell[j], buy[j] + price);

      // Only emit a step per (price) for j==k progression to limit volume, but
      // to be thorough, emit for each j when array is small.
      if (n * k <= 40 || j === k) {
        steps.push({
          title: { vi: `giá[${p}]=${price}, j=${j}: buy[${j}]=${fmt(buy[j])}, sell[${j}]=${sell[j]}`, en: `price[${p}]=${price}, j=${j}: buy[${j}]=${fmt(buy[j])}, sell[${j}]=${sell[j]}` },
          arr: [...prices],
          sub: prices.map((_, i) => `[${i}]`),
          highlight: [p],
          mark: [],
          codeLines: [5, 6, 7, 8],
          vars: [
            { name: "price", value: `prices[${p}]=${price}` },
            { name: "j", value: j },
            { name: `buy[${j}]`, value: `${fmt(oldBuy)} → ${fmt(buy[j])}` },
            { name: `sell[${j}]`, value: `${oldSell} → ${sell[j]}` },
            { name: "buy", value: buyStr() },
            { name: "sell", value: sellStr() },
          ],
          note: {
            vi:
              `Tại giá ${price}, giao dịch thứ ${j}:\n` +
              `buy[${j}] = max(giữ cũ ${fmt(oldBuy)}, mua bây giờ: sell[${j - 1}]-${price}=${fmt(sell[j - 1] - price)}) = ${fmt(buy[j])}.\n` +
              `sell[${j}] = max(giữ cũ ${oldSell}, bán bây giờ: buy[${j}]+${price}=${fmt(buy[j] + price)}) = ${sell[j]}.`,
            en:
              `At price ${price}, transaction #${j}:\n` +
              `buy[${j}] = max(keep ${fmt(oldBuy)}, buy now: sell[${j - 1}]-${price}=${fmt(sell[j - 1] - price)}) = ${fmt(buy[j])}.\n` +
              `sell[${j}] = max(keep ${oldSell}, sell now: buy[${j}]+${price}=${fmt(buy[j] + price)}) = ${sell[j]}.`,
          },
        });
      }
    }
  }

  steps.push({
    title: { vi: `return sell[${k}] = ${sell[k]}`, en: `return sell[${k}] = ${sell[k]}` },
    arr: [...prices],
    sub: prices.map((_, i) => `[${i}]`),
    highlight: [], mark: [],
    final: true,
    codeLines: [9],
    vars: [
      { name: "buy", value: buyStr() },
      { name: "sell", value: sellStr() },
      { name: "answer", value: sell[k] },
    ],
    note: {
      vi: `Lời lớn nhất với tối đa ${k} giao dịch = sell[${k}] = ${sell[k]}.`,
      en: `Maximum profit with at most ${k} transactions = sell[${k}] = ${sell[k]}.`,
    },
  });

  return { original: prices, answer: sell[k], steps };
}

/**
 * LeetCode 1216: Valid Palindrome III — longest palindromic subsequence DP.
 * s can become a palindrome by deleting at most k chars iff
 * n - LPS(s) <= k, where LPS = longest palindromic subsequence length.
 * dp[i][j] = LPS of s[i..j].
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def isValidPalindrome(self, s, k):
 *  3          n = len(s); dp = [[0]*n for _ in range(n)]
 *  4          for i in range(n-1, -1, -1):
 *  5              dp[i][i] = 1
 *  6              for j in range(i+1, n):
 *  7                  if s[i] == s[j]: dp[i][j] = dp[i+1][j-1] + 2
 *  8                  else: dp[i][j] = max(dp[i+1][j], dp[i][j-1])
 *  9          return n - dp[0][n-1] <= k
 */
function buildSteps1216(input, params) {
  const s = String(input);
  const n = s.length;
  const k = params && params.k !== undefined ? Number(params.k) : 2;
  const chars = s.split("");
  const steps = [];
  const dp = Array.from({ length: n }, () => Array(n).fill(0));

  function gridSnap(opts) {
    // display: header row = chars, header col = chars
    const display = [["i\\j", ...chars.map((c, j) => `${j}:${c}`)]];
    for (let i = 0; i < n; i++) {
      const row = [`${i}:${chars[i]}`];
      for (let j = 0; j < n; j++) {
        row.push(j < i ? "" : String(dp[i][j]));
      }
      display.push(row);
    }
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: display,
        text1: "", text2: "",
        hlCell: opts.hlCell || null,
        pathCells: opts.pathCells || [],
        largeCells: true,
      },
      highlight: [], mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  if (n === 0) {
    gridSnap({ title: { vi: "Chuỗi rỗng → true", en: "Empty → true" }, final: true, codeLines: [3], vars: [{ name: "answer", value: true }], note: { vi: "", en: "" } });
    return { original: s, answer: true, steps };
  }

  gridSnap({
    title: { vi: "Khởi tạo dp; dp[i][i]=1", en: "Initialize dp; dp[i][i]=1" },
    codeLines: [3, 4, 5],
    vars: [{ name: "s", value: `"${s}"` }, { name: "n", value: n }, { name: "k", value: k }],
    note: {
      vi:
        `dp[i][j] = độ dài DÃY CON ĐỐI XỨNG dài nhất (LPS) trong s[i..j]. Mỗi ký tự đơn là palindrome độ dài 1.\n` +
        `s biến thành palindrome bằng cách xóa ≤ k ký tự ⟺ n - LPS(s) ≤ k.\n` +
        `Điền bảng từ dưới lên (i giảm), trái sang phải (j tăng).`,
      en:
        `dp[i][j] = length of the LONGEST PALINDROMIC SUBSEQUENCE (LPS) in s[i..j]. Each single char is a palindrome of length 1.\n` +
        `s becomes a palindrome by deleting ≤ k chars ⟺ n - LPS(s) ≤ k.\n` +
        `Fill the table bottom-up (i decreasing), left to right (j increasing).`,
    },
  });

  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      const match = chars[i] === chars[j];
      if (match) dp[i][j] = dp[i + 1][j - 1] + 2;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);

      gridSnap({
        title: { vi: `dp[${i}][${j}] ('${chars[i]}','${chars[j]}') = ${dp[i][j]}`, en: `dp[${i}][${j}] ('${chars[i]}','${chars[j]}') = ${dp[i][j]}` },
        hlCell: [i + 1, j + 1],
        pathCells: match ? [[i + 2, j]] : [[i + 2, j + 1], [i + 1, j]],
        codeLines: match ? [6, 7] : [6, 8],
        vars: [
          { name: "i,j", value: `${i},${j}` },
          { name: "s[i],s[j]", value: `'${chars[i]}','${chars[j]}'` },
          { name: "match?", value: match },
          { name: "dp[i][j]", value: dp[i][j] },
        ],
        note: {
          vi: match
            ? `s[${i}]='${chars[i]}' == s[${j}]='${chars[j]}' → dp[${i}][${j}] = dp[${i + 1}][${j - 1}] + 2 = ${dp[i][j]}.`
            : `s[${i}]='${chars[i]}' ≠ s[${j}]='${chars[j]}' → dp[${i}][${j}] = max(dp[${i + 1}][${j}]=${dp[i + 1][j]}, dp[${i}][${j - 1}]=${dp[i][j - 1]}) = ${dp[i][j]}.`,
          en: match
            ? `s[${i}]='${chars[i]}' == s[${j}]='${chars[j]}' → dp[${i}][${j}] = dp[${i + 1}][${j - 1}] + 2 = ${dp[i][j]}.`
            : `s[${i}]='${chars[i]}' ≠ s[${j}]='${chars[j]}' → dp[${i}][${j}] = max(dp[${i + 1}][${j}]=${dp[i + 1][j]}, dp[${i}][${j - 1}]=${dp[i][j - 1]}) = ${dp[i][j]}.`,
        },
      });
    }
  }

  const lps = dp[0][n - 1];
  const deletions = n - lps;
  const answer = deletions <= k;

  gridSnap({
    title: { vi: `n - LPS = ${n} - ${lps} = ${deletions} ${answer ? "≤" : ">"} k=${k} → ${answer}`, en: `n - LPS = ${n} - ${lps} = ${deletions} ${answer ? "≤" : ">"} k=${k} → ${answer}` },
    hlCell: [1, n],
    final: true,
    codeLines: [9],
    vars: [
      { name: "LPS = dp[0][n-1]", value: lps },
      { name: "deletions = n - LPS", value: deletions },
      { name: "k", value: k },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `LPS dài nhất = ${lps}. Cần xóa n - LPS = ${deletions} ký tự để còn lại palindrome. ${answer ? `${deletions} ≤ k=${k} → true.` : `${deletions} > k=${k} → false.`}`,
      en: `Longest LPS = ${lps}. Need to delete n - LPS = ${deletions} chars to leave a palindrome. ${answer ? `${deletions} ≤ k=${k} → true.` : `${deletions} > k=${k} → false.`}`,
    },
  });

  return { original: s, answer, steps };
}

/** LeetCode 118: Pascal's Triangle. */
function buildSteps118(input) {
  const parsedRows = Number(Array.isArray(input) ? input[0] : String(input).trim());
  const numRows = Number.isInteger(parsedRows) && parsedRows >= 0 ? parsedRows : 5;
  const steps = [];
  const triangle = [];

  function snapshot({ title, codeLine, phase, workingRow = null, active = null, parents = [], formula = null, final = false, vars = [], note }) {
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      final,
      codeLines: [codeLine],
      vars,
      note,
      pascalTriangleView: {
        numRows,
        phase,
        rows: triangle.map((row) => [...row]),
        workingRow: workingRow ? [...workingRow] : null,
        active,
        parents,
        formula,
      },
    });
  }

  snapshot({
    title: { vi: "Khởi tạo tam giác rỗng", en: "Initialize an empty triangle" },
    codeLine: 3,
    phase: "setup",
    vars: [{ name: "numRows", value: numRows }, { name: "triangle", value: "[]" }],
    note: { vi: "Tam giác được xây từ trên xuống. Hai cạnh luôn là 1; ô ở giữa bằng tổng của hai ô cha ngay phía trên.", en: "Build the triangle from top to bottom. Both edges are always 1; an inner cell is the sum of its two parents directly above." },
  });

  for (let row = 0; row < numRows; row++) {
    let current = new Array(row + 1).fill(null);
    snapshot({
      title: { vi: `Bắt đầu hàng ${row}`, en: `Start row ${row}` },
      codeLine: 4,
      phase: "start-row",
      workingRow: current,
      active: { row, col: null },
      vars: [{ name: "row", value: row }],
      note: { vi: `Tạo vị trí cho ${row + 1} ô của hàng ${row}.`, en: `Create slots for the ${row + 1} cells in row ${row}.` },
    });

    current[0] = 1;
    if (row > 0) current[row] = 1;
    snapshot({
      title: { vi: `Đặt hai biên hàng ${row} = 1`, en: `Set row ${row} edges to 1` },
      codeLine: 5,
      phase: "seed-edges",
      workingRow: current,
      active: { row, col: row === 0 ? 0 : null },
      vars: [{ name: "current", value: `[${current.map((value) => value ?? "?").join(", ")}]` }],
      note: row === 0
        ? { vi: "Hàng đầu chỉ có một ô: 1.", en: "The first row has a single cell: 1." }
        : { vi: "Ô đầu và ô cuối luôn bằng 1, vì chỉ có một đường đi tới cạnh của tam giác.", en: "The first and last cells are always 1 because there is only one path to either edge." },
    });

    for (let col = 1; col < row; col++) {
      const leftParent = triangle[row - 1][col - 1];
      const rightParent = triangle[row - 1][col];
      current[col] = leftParent + rightParent;
      snapshot({
        title: { vi: `Ô (${row}, ${col}) = ${leftParent} + ${rightParent} = ${current[col]}`, en: `Cell (${row}, ${col}) = ${leftParent} + ${rightParent} = ${current[col]}` },
        codeLine: 7,
        phase: "sum-parents",
        workingRow: current,
        active: { row, col },
        parents: [{ row: row - 1, col: col - 1 }, { row: row - 1, col }],
        formula: { row, col, leftParent, rightParent, result: current[col] },
        vars: [
          { name: "left parent", value: `triangle[${row - 1}][${col - 1}] = ${leftParent}` },
          { name: "right parent", value: `triangle[${row - 1}][${col}] = ${rightParent}` },
          { name: `current[${col}]`, value: current[col] },
        ],
        note: { vi: `Hai ô tím ở hàng ${row - 1} là cha trái và cha phải. Cộng chúng để tạo ô vàng ở hàng ${row}.`, en: `The two purple cells in row ${row - 1} are the left and right parents. Add them to create the yellow cell in row ${row}.` },
      });
    }

    triangle.push([...current]);
    snapshot({
      title: { vi: `Chốt hàng ${row}: [${current.join(", ")}]`, en: `Commit row ${row}: [${current.join(", ")}]` },
      codeLine: 8,
      phase: "commit-row",
      active: { row, col: null },
      vars: [{ name: "triangle", value: JSON.stringify(triangle) }],
      note: { vi: `Hàng ${row} hoàn chỉnh; giờ nó có thể làm hàng cha cho hàng kế tiếp.`, en: `Row ${row} is complete and can now be the parent row for the next one.` },
    });
  }

  snapshot({
    title: { vi: `Kết quả: ${numRows} hàng Pascal`, en: `Result: ${numRows} Pascal rows` },
    codeLine: 9,
    phase: "done",
    final: true,
    vars: [{ name: "answer", value: JSON.stringify(triangle) }],
    note: { vi: `Trả về toàn bộ tam giác gồm ${numRows} hàng.`, en: `Return the complete triangle with ${numRows} rows.` },
  });
  return { original: numRows, answer: triangle, steps };
}

/** LeetCode 338: Counting Bits — dp[i] = dp[i>>1] + (i&1). */
function buildSteps338(input) {
  const n = Number(Array.isArray(input) ? input[0] : String(input).trim()) || 5;
  const steps = [];
  const dp = new Array(n + 1).fill(0);
  const bin = (v) => v.toString(2);
  steps.push({
    title: { vi: "dp[0] = 0", en: "dp[0] = 0" },
    arr: [...dp], sub: dp.map((_, i) => `${i}=${bin(i)}`), highlight: [0], mark: [],
    codeLines: [3],
    vars: [{ name: "n", value: n }, { name: "dp", value: `[${dp.join(", ")}]` }],
    note: {
      vi: `dp[i] = số bit 1 của i. Công thức: dp[i] = dp[i>>1] + (i&1) — bỏ bit cuối (i>>1) rồi cộng lại nếu bit cuối là 1.`,
      en: `dp[i] = number of 1-bits in i. Formula: dp[i] = dp[i>>1] + (i&1) — drop the last bit (i>>1) then add it back if it was 1.`,
    },
  });
  for (let i = 1; i <= n; i++) {
    dp[i] = dp[i >> 1] + (i & 1);
    steps.push({
      title: { vi: `dp[${i}] = dp[${i >> 1}] + ${i & 1} = ${dp[i]}`, en: `dp[${i}] = dp[${i >> 1}] + ${i & 1} = ${dp[i]}` },
      arr: [...dp], sub: dp.map((_, x) => `${x}=${bin(x)}`), highlight: [i], mark: [i >> 1],
      codeLines: [4, 5],
      vars: [{ name: "i", value: `${i} (${bin(i)})` }, { name: "i>>1", value: `${i >> 1} (${bin(i >> 1)})` }, { name: "i&1", value: i & 1 }, { name: `dp[${i}]`, value: dp[i] }],
      note: { vi: `${i} = ${bin(i)}. Bỏ bit cuối → ${i >> 1} = ${bin(i >> 1)} có dp=${dp[i >> 1]} bit. Bit cuối = ${i & 1}. Tổng = ${dp[i]}.`, en: `${i} = ${bin(i)}. Drop last bit → ${i >> 1} = ${bin(i >> 1)} with dp=${dp[i >> 1]} bits. Last bit = ${i & 1}. Total = ${dp[i]}.` },
    });
  }
  steps.push({ title: { vi: `Kết quả: [${dp.join(", ")}]`, en: `Result: [${dp.join(", ")}]` }, arr: [...dp], sub: dp.map((_, i) => `${i}=${bin(i)}`), highlight: [], mark: [], final: true, codeLines: [6], vars: [{ name: "answer", value: `[${dp.join(", ")}]` }], note: { vi: `Số bit 1 của 0..${n}.`, en: `1-bit counts for 0..${n}.` } });
  return { original: n, answer: dp, steps };
}

/**
 * LeetCode 486: Predict the Winner.
 * dp[i][j] = max score advantage (current player − opponent) on nums[i..j].
 *   dp[i][i] = nums[i]
 *   dp[i][j] = max(nums[i] − dp[i+1][j],   ← take left
 *                  nums[j] − dp[i][j−1])    ← take right
 * Player 1 wins ⟺ dp[0][n−1] ≥ 0.
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def PredictTheWinner(self, nums):
 *  3          n = len(nums)
 *  4          dp = [[0]*n for _ in range(n)]
 *  5          for i in range(n): dp[i][i] = nums[i]
 *  6          for length in range(2, n+1):
 *  7              for i in range(n-length+1):
 *  8                  j = i + length - 1
 *  9                  take_left  = nums[i] - dp[i+1][j]
 * 10                  take_right = nums[j] - dp[i][j-1]
 * 11                  dp[i][j] = max(take_left, take_right)
 * 12          return dp[0][n-1] >= 0
 */
function buildSteps486(inputNums) {
  const nums = Array.isArray(inputNums)
    ? inputNums.map(Number).filter(Number.isFinite)
    : String(inputNums).split(",").map((value) => Number(value.trim())).filter(Number.isFinite);
  const n = nums.length;
  const steps = [];
  const dp = Array.from({ length: n }, () => Array(n).fill(null));

  function addStep({
    title,
    codeLine,
    phase,
    length = null,
    i = null,
    j = null,
    takeLeft = null,
    takeRight = null,
    picked = null,
    final = false,
    vars = [],
    note,
  }) {
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      final,
      codeLines: [codeLine],
      vars,
      note,
      predictWinnerView: {
        phase,
        nums: [...nums],
        dp: dp.map((row) => [...row]),
        length,
        i,
        j,
        takeLeft,
        takeRight,
        picked,
        advantage: n && dp[0][n - 1] !== null ? dp[0][n - 1] : null,
        winner: final ? dp[0][n - 1] >= 0 : null,
      },
    });
  }

  if (n === 0) {
    steps.push({
      title: { vi: "nums không được rỗng", en: "nums cannot be empty" },
      arr: [], highlight: [], mark: [], final: true, codeLines: [3],
      vars: [{ name: "nums", value: "[]" }],
      note: { vi: "Bài toán yêu cầu ít nhất một số.", en: "The problem requires at least one number." },
    });
    return { original: nums, answer: false, steps };
  }

  addStep({
    title: { vi: `n = len(nums) = ${n}`, en: `n = len(nums) = ${n}` },
    codeLine: 3,
    phase: "init",
    vars: [{ name: "nums", value: `[${nums.join(", ")}]` }, { name: "n", value: n }],
    note: {
      vi: "Mỗi lượt chỉ được lấy số ngoài cùng bên trái hoặc bên phải.",
      en: "Each turn may take only the leftmost or rightmost number.",
    },
  });
  addStep({
    title: { vi: `Tạo bảng dp ${n}×${n}`, en: `Create a ${n}×${n} dp table` },
    codeLine: 4,
    phase: "init",
    vars: [{ name: "dp", value: `${n}×${n} zeros` }],
    note: {
      vi: "dp[i][j] sẽ lưu lợi thế điểm tối đa của người sắp chơi trên đoạn nums[i..j].",
      en: "dp[i][j] stores the maximum score advantage for the player about to move on nums[i..j].",
    },
  });

  for (let i = 0; i < n; i++) {
    dp[i][i] = nums[i];
    addStep({
      title: { vi: `dp[${i}][${i}] = ${nums[i]}`, en: `dp[${i}][${i}] = ${nums[i]}` },
      codeLine: 5,
      phase: "base",
      length: 1,
      i,
      j: i,
      picked: "only",
      vars: [{ name: "i", value: i }, { name: `dp[${i}][${i}]`, value: nums[i] }],
      note: {
        vi: `Đoạn chỉ có ${nums[i]}; người hiện tại lấy số đó nên lợi thế bằng ${nums[i]}.`,
        en: `The interval contains only ${nums[i]}; the current player takes it, so the advantage is ${nums[i]}.`,
      },
    });
  }

  for (let length = 2; length <= n; length++) {
    addStep({
      title: { vi: `length = ${length}`, en: `length = ${length}` },
      codeLine: 6,
      phase: "length",
      length,
      vars: [{ name: "length", value: length }],
      note: {
        vi: `Bắt đầu tính mọi đoạn dài ${length}; các đoạn ngắn hơn đã có kết quả.`,
        en: `Start every interval of length ${length}; all shorter intervals are already known.`,
      },
    });

    for (let i = 0; i <= n - length; i++) {
      addStep({
        title: { vi: `i = ${i}`, en: `i = ${i}` },
        codeLine: 7,
        phase: "interval-start",
        length,
        i,
        vars: [{ name: "length", value: length }, { name: "i", value: i }],
        note: {
          vi: `Chọn đầu trái i=${i}; dòng kế tiếp tính đầu phải j.`,
          en: `Choose left endpoint i=${i}; the next line computes right endpoint j.`,
        },
      });

      const j = i + length - 1;
      addStep({
        title: { vi: `j = ${i} + ${length} - 1 = ${j}`, en: `j = ${i} + ${length} - 1 = ${j}` },
        codeLine: 8,
        phase: "interval",
        length,
        i,
        j,
        vars: [{ name: "i", value: i }, { name: "j", value: j }, { name: "interval", value: `[${nums.slice(i, j + 1).join(", ")}]` }],
        note: {
          vi: `Đoạn đang chơi là nums[${i}..${j}]; chỉ ${nums[i]} và ${nums[j]} có thể được lấy.`,
          en: `The current game is nums[${i}..${j}]; only ${nums[i]} and ${nums[j]} may be taken.`,
        },
      });

      const leftOpponent = dp[i + 1][j];
      const takeLeft = nums[i] - leftOpponent;
      addStep({
        title: { vi: `take_left = ${nums[i]} - ${leftOpponent} = ${takeLeft}`, en: `take_left = ${nums[i]} - ${leftOpponent} = ${takeLeft}` },
        codeLine: 9,
        phase: "take-left",
        length,
        i,
        j,
        takeLeft,
        vars: [
          { name: "nums[i]", value: nums[i] },
          { name: `dp[${i + 1}][${j}]`, value: leftOpponent },
          { name: "take_left", value: takeLeft },
        ],
        note: {
          vi: `Lấy trái được ${nums[i]}, nhưng đối thủ kế tiếp có lợi thế ${leftOpponent}; lợi thế ròng là ${takeLeft}.`,
          en: `Taking left scores ${nums[i]}, but the opponent then has advantage ${leftOpponent}; net advantage is ${takeLeft}.`,
        },
      });

      const rightOpponent = dp[i][j - 1];
      const takeRight = nums[j] - rightOpponent;
      addStep({
        title: { vi: `take_right = ${nums[j]} - ${rightOpponent} = ${takeRight}`, en: `take_right = ${nums[j]} - ${rightOpponent} = ${takeRight}` },
        codeLine: 10,
        phase: "take-right",
        length,
        i,
        j,
        takeLeft,
        takeRight,
        vars: [
          { name: "nums[j]", value: nums[j] },
          { name: `dp[${i}][${j - 1}]`, value: rightOpponent },
          { name: "take_right", value: takeRight },
        ],
        note: {
          vi: `Lấy phải được ${nums[j]}, trừ lợi thế ${rightOpponent} của đối thủ; lợi thế ròng là ${takeRight}.`,
          en: `Taking right scores ${nums[j]}, minus the opponent's advantage ${rightOpponent}; net advantage is ${takeRight}.`,
        },
      });

      const picked = takeLeft >= takeRight ? "left" : "right";
      dp[i][j] = Math.max(takeLeft, takeRight);
      addStep({
        title: {
          vi: `dp[${i}][${j}] = max(${takeLeft}, ${takeRight}) = ${dp[i][j]}`,
          en: `dp[${i}][${j}] = max(${takeLeft}, ${takeRight}) = ${dp[i][j]}`,
        },
        codeLine: 11,
        phase: "choose",
        length,
        i,
        j,
        takeLeft,
        takeRight,
        picked,
        vars: [
          { name: "take_left", value: takeLeft },
          { name: "take_right", value: takeRight },
          { name: "best choice", value: picked },
          { name: `dp[${i}][${j}]`, value: dp[i][j] },
        ],
        note: {
          vi: `Chọn ${picked === "left" ? "TRÁI" : "PHẢI"} vì tạo lợi thế lớn hơn cho người hiện tại.`,
          en: `Choose ${picked.toUpperCase()} because it gives the current player the larger advantage.`,
        },
      });
    }
  }

  const advantage = dp[0][n - 1];
  const winner = advantage >= 0;
  const finalTakeLeft = n === 1 ? nums[0] : nums[0] - dp[1][n - 1];
  const finalTakeRight = n === 1 ? nums[0] : nums[n - 1] - dp[0][n - 2];
  const finalPicked = finalTakeLeft >= finalTakeRight ? "left" : "right";
  addStep({
    title: {
      vi: `dp[0][${n - 1}] = ${advantage} → ${winner}`,
      en: `dp[0][${n - 1}] = ${advantage} → ${winner}`,
    },
    codeLine: 12,
    phase: "done",
    length: n,
    i: 0,
    j: n - 1,
    takeLeft: finalTakeLeft,
    takeRight: finalTakeRight,
    picked: finalPicked,
    final: true,
    vars: [
      { name: "Player 1 advantage", value: advantage },
      { name: "advantage >= 0", value: winner },
      { name: "answer", value: winner },
    ],
    note: winner
      ? {
          vi: `Lợi thế ${advantage} ≥ 0, nên Player 1 có thể đảm bảo điểm không thấp hơn Player 2.`,
          en: `Advantage ${advantage} ≥ 0, so Player 1 can guarantee a score at least as high as Player 2's.`,
        }
      : {
          vi: `Lợi thế ${advantage} < 0, nên Player 1 không thể tránh thua nếu Player 2 chơi tối ưu.`,
          en: `Advantage ${advantage} < 0, so Player 1 cannot avoid losing against optimal play.`,
        },
  });

  return { original: nums, answer: winner, steps };
}

function parseRequests4027(raw) {
  let requests = raw;
  if (typeof raw === "string") {
    const text = raw.trim();
    if (!text) throw new Error("requests must not be empty.");
    if (text.startsWith("[")) {
      try {
        requests = JSON.parse(text);
      } catch (error) {
        throw new Error("requests must be JSON or arrival,floor;arrival,floor.");
      }
    } else {
      requests = text.split(";").map((part) => part.split(",").map((value) => Number(value.trim())));
    }
  }
  if (!Array.isArray(requests) || requests.length === 0 || requests.length > 16) {
    throw new Error("requests must contain between 1 and 16 pairs.");
  }
  const parsed = requests.map((request) => {
    if (!Array.isArray(request) || request.length !== 2 || request.some((value) => !Number.isInteger(value))) {
      throw new Error("Each request must be [arrival, floor].");
    }
    return [request[0], request[1]];
  });
  return parsed;
}

/** LeetCode 4027: Elevator Requests III — bitmask DP. */
function buildSteps4027(input, params = {}) {
  if (!Array.isArray(input) || input.length !== 2 || input.some((value) => !Number.isInteger(value))) {
    throw new Error("Enter n,start as exactly two integers.");
  }
  const [n, start] = input;
  const requests = parseRequests4027(params.requests);
  if (n < 1 || n > 1_000_000_000) throw new Error("n must be between 1 and 1,000,000,000.");
  if (start < 0 || start >= n) throw new Error("start must be a valid floor from 0 to n - 1.");
  requests.forEach(([arrival, floor]) => {
    if (arrival < 0 || arrival > 1_000_000_000) throw new Error("Every arrival must be between 0 and 1,000,000,000.");
    if (floor < 0 || floor >= n) throw new Error("Every requested floor must be from 0 to n - 1.");
  });

  const m = requests.length;
  const stateCount = 1 << m;
  const full = stateCount - 1;
  const INF = Number.POSITIVE_INFINITY;
  const dp = new Float64Array(stateCount * m);
  dp.fill(INF);
  const parent = new Int16Array(stateCount * m);
  parent.fill(-1);
  const steps = [];
  const rows = new Map();
  const recentKeys = [];
  const frameLimit = m <= 6 ? 900 : 350;
  const detailed = m <= 6;
  const at = (mask, last) => mask * m + last;
  const bits = (mask) => mask.toString(2).padStart(m, "0");
  const servedIds = (mask) => Array.from({ length: m }, (_, index) => index).filter((index) => (mask & (1 << index)) !== 0);
  const touchRow = (mask, last) => {
    const key = `${mask}:${last}`;
    rows.set(key, {
      mask, maskBits: bits(mask), served: servedIds(mask), last,
      floor: requests[last][1], time: dp[at(mask, last)], parent: parent[at(mask, last)],
    });
    const old = recentKeys.indexOf(key);
    if (old >= 0) recentKeys.splice(old, 1);
    recentKeys.push(key);
    while (recentKeys.length > 80) {
      const dropped = recentKeys.shift();
      rows.delete(dropped);
    }
  };
  const routeFor = (mask, last) => {
    const reversed = [];
    let guard = 0;
    while (last >= 0 && mask > 0 && guard <= m) {
      reversed.push({ request: last, floor: requests[last][1], arrival: requests[last][0], time: dp[at(mask, last)] });
      const previous = parent[at(mask, last)];
      mask ^= 1 << last;
      last = previous;
      guard++;
    }
    return reversed.reverse();
  };
  const visibleRows = (activeMask, activeLast) => {
    const keys = rows.size <= 36 ? [...rows.keys()] : recentKeys.slice(-35);
    const activeKey = Number.isInteger(activeMask) && Number.isInteger(activeLast) ? `${activeMask}:${activeLast}` : null;
    if (activeKey && rows.has(activeKey) && !keys.includes(activeKey)) keys.push(activeKey);
    return keys.map((key) => ({ ...rows.get(key) })).sort((a, b) => a.mask - b.mask || a.last - b.last);
  };

  let phase = "setup";
  let event = "read-input";
  let mask = 0;
  let last = -1;
  let next = -1;
  let newMask = 0;
  let currentTime = 0;
  let fromFloor = start;
  let targetFloor = null;
  let arrival = null;
  let travel = null;
  let reachedAt = null;
  let wait = null;
  let candidateTime = null;
  let previousBest = null;
  let improved = null;
  let bestLast = -1;
  let answer = null;
  let finalRoute = [];
  let truncated = false;

  const snapshot = () => ({
    n, start, requests: requests.map((request, id) => ({ id, arrival: request[0], floor: request[1] })),
    phase, event, m, full, mask, maskBits: bits(mask), served: servedIds(mask), last, next,
    newMask, newMaskBits: bits(newMask), currentTime, fromFloor, targetFloor, arrival,
    travel, reachedAt, wait, candidateTime, previousBest, improved, bestLast, answer,
    route: last >= 0 && mask ? routeFor(mask, last) : [],
    candidateRoute: next >= 0 && newMask && Number.isFinite(dp[at(newMask, next)]) ? routeFor(newMask, next) : [],
    finalRoute: finalRoute.map((item) => ({ ...item })),
    dpRows: visibleRows(mask, last), truncated,
  });
  const push = ({ title, note, line, vars = [], final = false, force = false }) => {
    if (!force && steps.length >= frameLimit - 1) {
      truncated = true;
      return;
    }
    steps.push({
      title, note, codeLines: [line], final,
      arr: requests.map((request) => request[1]), highlight: next >= 0 ? [next] : last >= 0 ? [last] : [], mark: servedIds(mask),
      vars: [
        { name: "mask", value: bits(mask) }, { name: "last", value: last },
        { name: "next", value: next }, { name: "time", value: currentTime }, ...vars,
      ],
      elevator4027View: snapshot(),
    });
  };

  push({
    title: { vi: `Có ${m} request → ${stateCount} bitmask`, en: `${m} requests → ${stateCount} bitmasks` },
    note: { vi: "Bit i bằng 1 nghĩa là request i đã được phục vụ.", en: "Bit i is 1 when request i has been served." },
    line: 3,
    vars: [{ name: "m", value: m }],
  });
  event = "set-infinity";
  push({
    title: { vi: "Đặt giá trị chưa đạt tới là ∞", en: "Use ∞ for unreachable states" },
    note: { vi: "Mỗi trạng thái sẽ giữ thời gian nhỏ nhất, vì vậy khởi tạo bằng vô cực.", en: "Each state keeps its earliest time, so initialize it to infinity." },
    line: 4,
  });
  event = "allocate-dp";
  push({
    title: { vi: `Tạo dp[${stateCount}][${m}]`, en: `Allocate dp[${stateCount}][${m}]` },
    note: { vi: "dp[mask][last] = thời gian sớm nhất phục vụ mask và dừng tại last.", en: "dp[mask][last] = earliest time to serve mask and stop at last." },
    line: 5,
  });
  event = "allocate-parent";
  push({
    title: { vi: "Tạo parent để dựng lại route", en: "Allocate parent to reconstruct the route" },
    note: { vi: "parent lưu request đứng ngay trước last trên route tốt nhất.", en: "parent stores the request immediately before last on the best route." },
    line: 6,
  });

  phase = "initialize";
  for (let i = 0; i < m; i++) {
    mask = 1 << i;
    last = i;
    next = i;
    newMask = mask;
    fromFloor = start;
    targetFloor = requests[i][1];
    arrival = requests[i][0];
    travel = Math.abs(start - targetFloor);
    reachedAt = travel;
    wait = Math.max(0, arrival - reachedAt);
    candidateTime = Math.max(reachedAt, arrival);
    currentTime = candidateTime;
    previousBest = INF;
    improved = true;
    event = "init-loop";
    if (detailed) push({
      title: { vi: `Khởi tạo singleton cho request #${i}`, en: `Initialize singleton for request #${i}` },
      note: { vi: `Đi trực tiếp từ tầng ${start} tới tầng ${targetFloor}.`, en: `Travel directly from floor ${start} to floor ${targetFloor}.` },
      line: 7,
    });
    dp[at(mask, i)] = candidateTime;
    touchRow(mask, i);
    event = "init-state";
    push({
      title: { vi: `dp[${bits(mask)}][${i}] = max(${travel}, ${arrival}) = ${candidateTime}`, en: `dp[${bits(mask)}][${i}] = max(${travel}, ${arrival}) = ${candidateTime}` },
      note: wait > 0
        ? { vi: `Đến tầng ${targetFloor} lúc ${reachedAt}, chờ ${wait} giây tới lúc request xuất hiện.`, en: `Reach floor ${targetFloor} at ${reachedAt}, then wait ${wait} second(s) for the request.` }
        : { vi: `Request đã xuất hiện khi thang máy tới tầng ${targetFloor}.`, en: `The request has already arrived when the elevator reaches floor ${targetFloor}.` },
      line: 8,
      vars: [{ name: "arrival", value: arrival }, { name: "floor", value: targetFloor }],
    });
  }

  phase = "subset";
  for (let currentMask = 1; currentMask < stateCount; currentMask++) {
    const hasReachable = Array.from({ length: m }, (_, index) => dp[at(currentMask, index)]).some(Number.isFinite);
    if (!hasReachable) continue;
    mask = currentMask;
    next = -1;
    newMask = mask;
    event = "mask-loop";
    if (detailed) push({
      title: { vi: `Xét mask ${bits(mask)}`, en: `Process mask ${bits(mask)}` },
      note: { vi: `Đã phục vụ: ${servedIds(mask).map((id) => `#${id}`).join(", ") || "chưa có"}.`, en: `Served: ${servedIds(mask).map((id) => `#${id}`).join(", ") || "none"}.` },
      line: 9,
    });
    for (let currentLast = 0; currentLast < m; currentLast++) {
      const timeAtState = dp[at(mask, currentLast)];
      if (!Number.isFinite(timeAtState)) continue;
      last = currentLast;
      currentTime = timeAtState;
      fromFloor = requests[last][1];
      event = "last-loop";
      if (detailed) push({
        title: { vi: `State dp[${bits(mask)}][${last}] = ${currentTime}`, en: `State dp[${bits(mask)}][${last}] = ${currentTime}` },
        note: { vi: `Thang máy đang ở tầng ${fromFloor} sau khi phục vụ request #${last}.`, en: `The elevator is at floor ${fromFloor} after serving request #${last}.` },
        line: 10,
      });
      event = "reachable";
      if (detailed) push({
        title: { vi: "State đạt tới được, tiếp tục mở rộng", en: "The state is reachable; expand it" },
        note: { vi: "Chỉ state có thời gian hữu hạn mới sinh transition.", en: "Only finite-time states generate transitions." },
        line: 11,
      });
      for (let candidate = 0; candidate < m; candidate++) {
        next = candidate;
        targetFloor = requests[next][1];
        arrival = requests[next][0];
        newMask = mask | (1 << next);
        event = "next-loop";
        if (detailed) push({
          title: { vi: `Thử request kế tiếp #${next}`, en: `Try request #${next} next` },
          note: { vi: `Request #${next}: đến lúc ${arrival}, tầng ${targetFloor}.`, en: `Request #${next}: arrives at ${arrival}, floor ${targetFloor}.` },
          line: 12,
        });
        if ((mask & (1 << next)) !== 0) {
          event = "already-served";
          if (detailed) push({
            title: { vi: `Bỏ qua #${next}: bit đã là 1`, en: `Skip #${next}: its bit is already 1` },
            note: { vi: "Không phục vụ lại request đã nằm trong mask.", en: "Do not serve a request already included in the mask." },
            line: 13,
          });
          continue;
        }
        event = "guard-pass";
        if (detailed) push({
          title: { vi: `#${next} chưa được phục vụ`, en: `#${next} has not been served` },
          note: { vi: "Tính thời gian di chuyển tới request này.", en: "Compute the travel time to this request." },
          line: 13,
        });
        travel = Math.abs(fromFloor - targetFloor);
        reachedAt = currentTime + travel;
        wait = Math.max(0, arrival - reachedAt);
        event = "travel";
        if (detailed) push({
          title: { vi: `travel = |${fromFloor} - ${targetFloor}| = ${travel}`, en: `travel = |${fromFloor} - ${targetFloor}| = ${travel}` },
          note: { vi: `Rời lúc ${currentTime}, có thể tới tầng ${targetFloor} lúc ${reachedAt}.`, en: `Leave at ${currentTime}; the elevator can reach floor ${targetFloor} at ${reachedAt}.` },
          line: 14,
        });
        candidateTime = Math.max(reachedAt, arrival);
        event = wait > 0 ? "wait" : "arrive";
        push({
          title: { vi: `time = max(${reachedAt}, arrival ${arrival}) = ${candidateTime}`, en: `time = max(${reachedAt}, arrival ${arrival}) = ${candidateTime}` },
          note: wait > 0
            ? { vi: `Tới sớm nên phải chờ ${wait} giây.`, en: `Arrival is early, so wait ${wait} second(s).` }
            : { vi: "Không phải chờ; request được phục vụ ngay khi tới.", en: "No waiting; the request is served immediately on arrival." },
          line: 15,
          vars: [{ name: "travel", value: travel }, { name: "arrival", value: arrival }, { name: "wait", value: wait }],
        });
        newMask = mask | (1 << next);
        event = "merge-mask";
        if (detailed) push({
          title: { vi: `${bits(mask)} OR bit ${next} → ${bits(newMask)}`, en: `${bits(mask)} OR bit ${next} → ${bits(newMask)}` },
          note: { vi: `Đánh dấu request #${next} đã được phục vụ.`, en: `Mark request #${next} as served.` },
          line: 16,
        });
        previousBest = dp[at(newMask, next)];
        improved = candidateTime < previousBest;
        event = improved ? "improve" : "reject";
        push({
          title: improved
            ? { vi: `${candidateTime} < ${Number.isFinite(previousBest) ? previousBest : "∞"}: cập nhật`, en: `${candidateTime} < ${Number.isFinite(previousBest) ? previousBest : "∞"}: update` }
            : { vi: `${candidateTime} ≥ ${previousBest}: giữ state cũ`, en: `${candidateTime} ≥ ${previousBest}: keep the old state` },
          note: improved
            ? { vi: `Tìm được cách sớm hơn để tới dp[${bits(newMask)}][${next}].`, en: `Found an earlier way to reach dp[${bits(newMask)}][${next}].` }
            : { vi: "Transition này không cải thiện thời gian tốt nhất.", en: "This transition does not improve the best time." },
          line: 17,
        });
        if (!improved) continue;
        dp[at(newMask, next)] = candidateTime;
        touchRow(newMask, next);
        event = "write-dp";
        push({
          title: { vi: `Ghi dp[${bits(newMask)}][${next}] = ${candidateTime}`, en: `Write dp[${bits(newMask)}][${next}] = ${candidateTime}` },
          note: { vi: "Bảng bitmask nhận thời gian tốt hơn.", en: "The bitmask table receives the improved time." },
          line: 18,
        });
        parent[at(newMask, next)] = last;
        touchRow(newMask, next);
        event = "write-parent";
        push({
          title: { vi: `parent[${bits(newMask)}][${next}] = ${last}`, en: `parent[${bits(newMask)}][${next}] = ${last}` },
          note: { vi: `Route tốt nhất tới #${next} đi ngay sau #${last}.`, en: `The best route to #${next} comes immediately after #${last}.` },
          line: 19,
        });
      }
    }
  }

  phase = "finish";
  mask = full;
  next = -1;
  newMask = full;
  event = "full-mask";
  push({
    title: { vi: `full = ${bits(full)}: mọi request đã xong`, en: `full = ${bits(full)}: every request is served` },
    note: { vi: "Chỉ xét các state có toàn bộ bit bằng 1.", en: "Only states with every bit equal to 1 are final." },
    line: 20,
  });
  bestLast = 0;
  for (let i = 1; i < m; i++) {
    if (dp[at(full, i)] < dp[at(full, bestLast)]) bestLast = i;
  }
  last = bestLast;
  currentTime = dp[at(full, bestLast)];
  answer = currentTime;
  finalRoute = routeFor(full, bestLast);
  fromFloor = requests[bestLast][1];
  event = "best-last";
  push({
    title: { vi: `Request cuối tốt nhất là #${bestLast}`, en: `The best final request is #${bestLast}` },
    note: { vi: `Trong hàng full mask, cột #${bestLast} có thời gian nhỏ nhất ${answer}.`, en: `In the full-mask row, column #${bestLast} has the minimum time ${answer}.` },
    line: 21,
    vars: [{ name: "best_last", value: bestLast }],
  });
  event = "return";
  push({
    title: { vi: `Kết quả: ${answer} giây`, en: `Result: ${answer} seconds` },
    note: truncated
      ? { vi: `Đã rút gọn frame trung gian; route tối ưu vẫn được tính đầy đủ.`, en: `Intermediate frames were capped; the optimal route was still computed in full.` }
      : { vi: `Route: tầng ${start} → ${finalRoute.map((item) => `${item.floor}@t${item.time}`).join(" → ")}.`, en: `Route: floor ${start} → ${finalRoute.map((item) => `${item.floor}@t${item.time}`).join(" → ")}.` },
    line: 22,
    vars: [{ name: "answer", value: answer }],
    final: true,
    force: true,
  });

  return { original: { n, start, requests: requests.map((request) => [...request]) }, answer, steps };
}

module.exports = {
  486: {
    id: 486,
    difficulty: "medium",
    slug: "predict-the-winner",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Predict the Winner", en: "Predict the Winner" },
    titleVi: { vi: "Dự đoán người thắng (interval DP)", en: "Predict the winner (interval DP)" },
    statement: {
      vi: "Hai người chơi lần lượt chọn số ở đầu hoặc cuối mảng. Player 1 thắng nếu điểm ≥ Player 2. Nhập nums cách nhau dấu phẩy.",
      en: "Two players alternate picking from either end of the array. Player 1 wins if their score ≥ Player 2. Enter nums comma-separated.",
    },
    defaultInput: [1, 5, 2],
    inputKind: "integer",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [],
    approach: [
      { vi: "dp[i][j] = lợi thế điểm số tối đa (người hiện tại − đối thủ) trên nums[i..j].", en: "dp[i][j] = max score advantage (current player − opponent) on nums[i..j]." },
      { vi: "Base: dp[i][i] = nums[i] (người hiện tại lấy hết).", en: "Base: dp[i][i] = nums[i] (current player takes it)." },
      { vi: "dp[i][j] = max(nums[i] − dp[i+1][j], nums[j] − dp[i][j-1]).", en: "dp[i][j] = max(nums[i] − dp[i+1][j], nums[j] − dp[i][j-1])." },
      { vi: "Player 1 thắng ⟺ dp[0][n-1] ≥ 0.", en: "Player 1 wins ⟺ dp[0][n-1] ≥ 0." },
    ],
    complexity: {
      time: "O(n²)",
      space: "O(n²)",
      note: { vi: "Điền bảng n×n theo đường chéo.", en: "Fill the n×n table diagonally." },
    },
    code: [
      "class Solution:",
      "    def PredictTheWinner(self, nums):",
      "        n = len(nums)",
      "        dp = [[0]*n for _ in range(n)]",
      "        for i in range(n): dp[i][i] = nums[i]",
      "        for length in range(2, n+1):",
      "            for i in range(n-length+1):",
      "                j = i + length - 1",
      "                take_left  = nums[i] - dp[i+1][j]",
      "                take_right = nums[j] - dp[i][j-1]",
      "                dp[i][j] = max(take_left, take_right)",
      "        return dp[0][n-1] >= 0",
    ],
    builder: buildSteps486,
  },
  118: {
    id: 118,
    difficulty: "easy",
    slug: "pascals-triangle",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Pascal's Triangle", en: "Pascal's Triangle" },
    titleVi: { vi: "Tam giác Pascal", en: "Pascal's triangle" },
    statement: { vi: "Sinh numRows hàng đầu của tam giác Pascal. Nhập numRows.", en: "Generate the first numRows of Pascal's triangle. Enter numRows." },
    defaultInput: [5],
    inputKind: "integer", inputLabel: { vi: "numRows", en: "numRows" }, extraParams: [],
    approach: [
      { vi: "Mỗi hàng bắt đầu và kết thúc bằng 1.", en: "Each row starts and ends with 1." },
      { vi: "Ô trong = tổng 2 ô ngay trên nó (hàng trước).", en: "Interior cell = sum of the two cells directly above (previous row)." },
    ],
    complexity: { time: "O(numRows²)", space: "O(numRows²)", note: { vi: "Sinh từng ô một lần.", en: "Generate each cell once." } },
    code: ["class Solution:", "    def generate(self, numRows):", "        triangle = []", "        for row in range(numRows):", "            current = [1]*(row+1)", "            for col in range(1, row):", "                current[col] = triangle[row-1][col-1] + triangle[row-1][col]", "            triangle.append(current)", "        return triangle"],
    builder: buildSteps118,
  },
  338: {
    id: 338,
    difficulty: "easy",
    slug: "counting-bits",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Counting Bits", en: "Counting Bits" },
    titleVi: { vi: "Đếm bit 1 (Bit DP)", en: "Count 1-bits (Bit DP)" },
    statement: { vi: "Cho n, trả về mảng ans độ dài n+1 với ans[i] = số bit 1 của i. Nhập n.", en: "Given n, return an array ans of length n+1 where ans[i] = number of 1-bits in i. Enter n." },
    defaultInput: [5],
    inputKind: "integer", inputLabel: { vi: "n", en: "n" }, extraParams: [],
    approach: [
      { vi: "dp[i] = dp[i>>1] + (i&1).", en: "dp[i] = dp[i>>1] + (i&1)." },
      { vi: "i>>1 bỏ bit cuối; (i&1) là bit cuối.", en: "i>>1 drops the last bit; (i&1) is the last bit." },
      { vi: "dp[i>>1] đã tính trước → O(1) mỗi số.", en: "dp[i>>1] is already computed → O(1) per number." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Mỗi số tính từ số nhỏ hơn.", en: "Each number derived from a smaller one." } },
    code: ["class Solution:", "    def countBits(self, n):", "        dp = [0]*(n+1)", "        for i in range(1, n+1):", "            dp[i] = dp[i >> 1] + (i & 1)", "        return dp"],
    builder: buildSteps338,
  },
  1216: {
    id: 1216,
    difficulty: "hard",
    slug: "valid-palindrome-iii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Valid Palindrome III", en: "Valid Palindrome III" },
    titleVi: { vi: "Palindrome hợp lệ III (LPS DP)", en: "Valid Palindrome III (LPS DP)" },
    statement: {
      vi:
        "Cho chuỗi s và số k. Hỏi s có thể trở thành palindrome bằng cách XÓA tối đa k ký tự hay không. " +
        "Nhập s; k trong tham số.",
      en:
        "Given a string s and integer k, decide whether s can become a palindrome by DELETING at most k characters. " +
        "Enter s; k as a parameter.",
    },
    defaultInput: "abcdeca",
    inputKind: "string",
    inputLabel: { vi: "s", en: "s" },
    extraParams: [
      { key: "k", label: { vi: "k (số ký tự được xóa)", en: "k (deletions allowed)" }, default: 2 },
    ],
    approach: [
      { vi: "dp[i][j] = độ dài dãy con đối xứng dài nhất (LPS) của s[i..j].", en: "dp[i][j] = length of the longest palindromic subsequence (LPS) of s[i..j]." },
      { vi: "Nếu s[i]==s[j]: dp = dp[i+1][j-1] + 2; ngược lại dp = max(dp[i+1][j], dp[i][j-1]).", en: "If s[i]==s[j]: dp = dp[i+1][j-1] + 2; else dp = max(dp[i+1][j], dp[i][j-1])." },
      { vi: "Số ký tự cần xóa = n - LPS. Điền bảng từ dưới lên.", en: "Deletions needed = n - LPS. Fill the table bottom-up." },
      { vi: "Hợp lệ ⟺ n - LPS(toàn chuỗi) ≤ k.", en: "Valid ⟺ n - LPS(whole string) ≤ k." },
    ],
    complexity: {
      time: "O(n²)",
      space: "O(n²)",
      note: {
        vi: "Bảng dp n×n; mỗi ô tính O(1).",
        en: "An n×n dp table; each cell is O(1).",
      },
    },
    code: [
      "class Solution:",
      "    def isValidPalindrome(self, s, k):",
      "        n = len(s); dp = [[0]*n for _ in range(n)]",
      "        for i in range(n-1, -1, -1):",
      "            dp[i][i] = 1",
      "            for j in range(i+1, n):",
      "                if s[i] == s[j]: dp[i][j] = dp[i+1][j-1] + 2",
      "                else: dp[i][j] = max(dp[i+1][j], dp[i][j-1])",
      "        return n - dp[0][n-1] <= k",
    ],
    builder: buildSteps1216,
  },
  188: {
    id: 188,
    difficulty: "hard",
    slug: "best-time-to-buy-and-sell-stock-iv",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Best Time to Buy and Sell Stock IV", en: "Best Time to Buy and Sell Stock IV" },
    titleVi: { vi: "Mua bán cổ phiếu IV (tối đa k giao dịch)", en: "Stock trading IV (at most k transactions)" },
    statement: {
      vi:
        "Cho mảng prices và số k. Tìm lợi nhuận LỚN NHẤT với tối đa k giao dịch (mua rồi bán là 1 giao dịch, " +
        "không được giữ >1 cổ phiếu cùng lúc). Nhập prices cách nhau dấu phẩy; k trong tham số.",
      en:
        "Given prices and integer k, find the MAX profit with at most k transactions (a buy then sell is one, " +
        "you can't hold more than one share at a time). Enter prices comma-separated; k as a parameter.",
    },
    defaultInput: [3, 2, 6, 5, 0, 3],
    inputKind: "integer",
    inputLabel: { vi: "prices", en: "prices" },
    extraParams: [
      { key: "k", label: { vi: "k (số giao dịch tối đa)", en: "k (max transactions)" }, default: 2 },
    ],
    approach: [
      { vi: "buy[j] = lời tối đa khi đã mua ≤ j lần và đang giữ; sell[j] = đã bán ≤ j lần, không giữ.", en: "buy[j] = max profit with ≤ j buys while holding; sell[j] = with ≤ j sells while not holding." },
      { vi: "Với mỗi giá: buy[j] = max(buy[j], sell[j-1] - price); sell[j] = max(sell[j], buy[j] + price).", en: "For each price: buy[j] = max(buy[j], sell[j-1] - price); sell[j] = max(sell[j], buy[j] + price)." },
      { vi: "Nếu k ≥ n/2 → giao dịch không giới hạn: cộng mọi đoạn tăng giá.", en: "If k ≥ n/2 → unlimited transactions: sum every upward move." },
      { vi: "Đáp án = sell[k].", en: "Answer = sell[k]." },
    ],
    complexity: {
      time: "O(n·k)",
      space: "O(k)",
      note: {
        vi: "Hai mảng buy/sell kích thước k+1, cập nhật cho từng giá.",
        en: "Two arrays buy/sell of size k+1, updated for each price.",
      },
    },
    code: [
      "class Solution:",
      "    def maxProfit(self, k, prices):",
      "        if k >= len(prices)//2: return sum(max(0, prices[i]-prices[i-1]) for i in range(1,len(prices)))",
      "        buy = [-inf]*(k+1); sell = [0]*(k+1)",
      "        for price in prices:",
      "            for j in range(1, k+1):",
      "                buy[j] = max(buy[j], sell[j-1] - price)",
      "                sell[j] = max(sell[j], buy[j] + price)",
      "        return sell[k]",
    ],
    builder: buildSteps188,
  },
  1473: {
    id: 1473,
    difficulty: "hard",
    slug: "paint-house-iii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Paint House III", en: "Paint House III" },
    titleVi: { vi: "Sơn nhà III (DP 3 chiều)", en: "Paint House III (3D DP)" },
    statement: {
      vi:
        "Có m nhà, n màu. houses[i]=0 nghĩa là chưa sơn; ≠0 là đã sơn màu đó. cost[i][c] là chi phí sơn nhà i màu c+1. " +
        "Một 'khu phố' là dãy nhà liền nhau cùng màu. Sơn các nhà chưa sơn sao cho có ĐÚNG target khu phố với chi phí NHỎ NHẤT (hoặc -1). " +
        "Nhập houses cách nhau dấu phẩy; cost/n/target trong tham số.",
      en:
        "There are m houses, n colors. houses[i]=0 means unpainted; ≠0 means already that color. cost[i][c] is the cost to paint house i color c+1. " +
        "A 'neighborhood' is a maximal run of adjacent same-color houses. Paint the unpainted houses to form EXACTLY target neighborhoods at MINIMUM cost (or -1). " +
        "Enter houses comma-separated; cost/n/target as parameters.",
    },
    defaultInput: [0, 0, 0, 0, 0],
    inputKind: "integer",
    inputLabel: { vi: "houses (0 = chưa sơn)", en: "houses (0 = unpainted)" },
    extraParams: [
      { key: "cost", label: { vi: "cost (hàng cách ;, màu cách ,)", en: "cost (rows ;, colors ,)" }, default: "1,10;10,1;10,1;1,10;5,1" },
      { key: "n", label: { vi: "n (số màu)", en: "n (colors)" }, default: 2 },
      { key: "target", label: { vi: "target (số khu phố)", en: "target (neighborhoods)" }, default: 3 },
    ],
    approach: [
      { vi: "dp(i, prev, groups) = chi phí nhỏ nhất sơn nhà i..m-1 tạo đúng target khu phố.", en: "dp(i, prev, groups) = min cost to paint houses i..m-1 forming exactly target neighborhoods." },
      { vi: "Nếu nhà đã sơn: màu cố định, chỉ cập nhật groups.", en: "If a house is already painted: color is fixed, just update groups." },
      { vi: "Nếu chưa sơn: thử mọi màu, cộng cost[i][màu] + dp(nhà kế).", en: "If unpainted: try every color, add cost[i][color] + dp(next house)." },
      { vi: "groups tăng khi màu khác nhà trước. Cắt tỉa khi groups > target.", en: "groups increases when color differs from the previous. Prune when groups > target." },
    ],
    complexity: {
      time: "O(m·target·n²)",
      space: "O(m·target·n)",
      note: {
        vi: "Trạng thái (i, prev, groups) = m·n·target; mỗi trạng thái thử n màu.",
        en: "States (i, prev, groups) = m·n·target; each tries n colors.",
      },
    },
    code: [
      "class Solution:",
      "    def minCost(self, houses, cost, m, n, target):",
      "        @lru_cache(None)",
      "        def dp(i, prev, groups):",
      "            if groups > target: return INF",
      "            if i == m: return 0 if groups == target else INF",
      "            if houses[i] != 0:",
      "                g = groups + (1 if houses[i] != prev else 0)",
      "                return dp(i+1, houses[i], g)",
      "            best = INF",
      "            for color in range(1, n+1):",
      "                g = groups + (1 if color != prev else 0)",
      "                best = min(best, cost[i][color-1] + dp(i+1, color, g))",
      "            return best",
      "        ans = dp(0, 0, 0)",
      "        return ans if ans != INF else -1",
    ],
    builder: buildSteps1473,
  },
  312: {
    id: 312,
    difficulty: "hard",
    slug: "burst-balloons",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Burst Balloons", en: "Burst Balloons" },
    titleVi: { vi: "Làm nổ bóng bay (Interval DP)", en: "Burst balloons (Interval DP)" },
    statement: {
      vi:
        "Cho mảng nums là giá trị các quả bóng. Làm nổ từng quả để được nums[i-1]·nums[i]·nums[i+1] coin " +
        "(bóng ngoài biên coi như 1). Tìm số coin TỐI ĐA. Nhập nums cách nhau dấu phẩy.",
      en:
        "Given nums representing balloon values, bursting balloon i earns nums[i-1]·nums[i]·nums[i+1] coins " +
        "(out-of-bound balloons count as 1). Find the MAXIMUM coins. Enter nums comma-separated.",
    },
    defaultInput: [3, 1, 5, 8],
    inputKind: "integer",
    inputLabel: { vi: "nums (bóng)", en: "nums (balloons)" },
    extraParams: [],
    approach: [
      { vi: "Đệm 1 vào hai đầu để tránh xử lý biên. dp[left][right] = coin tối đa trong khoảng mở (left, right).", en: "Pad with 1 on both ends to avoid boundary cases. dp[left][right] = max coins in open interval (left, right)." },
      { vi: "Chọn k là bóng nổ CUỐI CÙNG trong khoảng → khi đó nó chỉ còn cạnh balloons[left] và balloons[right].", en: "Pick k as the LAST balloon to burst in the interval → then it only touches balloons[left] and balloons[right]." },
      { vi: "coins = balloons[left]·balloons[k]·balloons[right] + dp[left][k] + dp[k][right].", en: "coins = balloons[left]·balloons[k]·balloons[right] + dp[left][k] + dp[k][right]." },
      { vi: "Duyệt theo độ dài khoảng tăng dần để dp con luôn sẵn sàng.", en: "Iterate by increasing interval length so sub-intervals are ready." },
    ],
    complexity: {
      time: "O(n³)",
      space: "O(n²)",
      note: {
        vi: "n² khoảng, mỗi khoảng thử n điểm k → O(n³).",
        en: "n² intervals, each trying n choices of k → O(n³).",
      },
    },
    code: [
      "class Solution:",
      "    def maxCoins(self, nums):",
      "        balloons = [1] + nums + [1]",
      "        n = len(balloons)",
      "        dp = [[0]*n for _ in range(n)]",
      "        for length in range(2, n):",
      "            for left in range(n - length):",
      "                right = left + length",
      "                for k in range(left + 1, right):",
      "                    coins = balloons[left]*balloons[k]*balloons[right]",
      "                    coins += dp[left][k] + dp[k][right]",
      "                    dp[left][right] = max(dp[left][right], coins)",
      "        return dp[0][n-1]",
    ],
    builder: buildSteps312,
  },
  // Category metadata: recommended learning order + detailed guide.
  // Picked up by problems/index.js and exposed to server.js via CATEGORY_ORDER.
  __meta: {
    order: [509, 70, 118, 338, 746, 198, 213, 256, 264, 740, 2140, 1406, 53, 918, 1749, 152, 300, 322, 518, 279, 139, 91, 1639, 62, 63, 64, 120, 931, 1937, 1143, 583, 5, 516, 1682, 1312, 72, 416, 474, 494, 1301, 1388, 1690, 2320, 3336, 188, 312, 1216, 1473],
    label: {
      vi: "Thứ tự học được khuyến nghị",
      en: "Recommended learning order",
    },
    extraCategories: {
      kadane: {
        order: [53, 918, 1749, 152],
        label: {
          vi: "Thứ tự học Kadane được khuyến nghị",
          en: "Recommended Kadane learning order",
        },
      },
    },
    guide: {
      vi: {
        intro:
          "Nếu mục tiêu là phỏng vấn Software Engineer, đây là 20 bài LeetCode DP quan trọng nhất, sắp xếp từ dễ → khó. Sau khi nắm hết, bạn sẽ giải được khoảng 80–90% bài DP trong các cuộc phỏng vấn.",
        patterns: [
          { id: 70, name: "Climbing Stairs", pattern: "Fibonacci DP" },
          { id: 746, name: "Min Cost Climbing Stairs", pattern: "Fibonacci + Cost" },
          { id: 198, name: "House Robber", pattern: "Linear DP" },
          { id: 213, name: "House Robber II", pattern: "Linear DP + Circle" },
          { id: 276, name: "Paint Fence", pattern: "Same/Diff DP" },
          { id: 740, name: "Delete and Earn", pattern: "House Robber Transform" },
          { id: 1406, name: "Stone Game III", pattern: "Suffix DP / Game DP" },
          { id: 53, name: "Maximum Subarray", pattern: "Kadane DP" },
          { id: 918, name: "Maximum Sum Circular Subarray", pattern: "Kadane DP + circular complement" },
          { id: 1749, name: "Maximum Absolute Sum of Any Subarray", pattern: "Dual Kadane / absolute sum" },
          { id: 152, name: "Maximum Product Subarray", pattern: "DP (max/min state)" },
          { id: 300, name: "Longest Increasing Subsequence", pattern: "1D DP / Binary Search" },
          { id: 322, name: "Coin Change", pattern: "Unbounded Knapsack" },
          { id: 518, name: "Coin Change II", pattern: "Counting DP" },
          { id: 279, name: "Perfect Squares", pattern: "Complete Knapsack" },
          { id: 139, name: "Word Break", pattern: "String DP" },
          { id: 91, name: "Decode Ways", pattern: "String DP" },
          { id: 62, name: "Unique Paths", pattern: "Grid DP" },
          { id: 63, name: "Unique Paths II", pattern: "Grid DP + Obstacles" },
          { id: 64, name: "Minimum Path Sum", pattern: "Grid DP" },
          { id: 120, name: "Triangle", pattern: "Grid DP" },
          { id: 931, name: "Minimum Falling Path Sum", pattern: "Matrix DP" },
          { id: 1143, name: "Longest Common Subsequence", pattern: "2D DP" },
          { id: 516, name: "Longest Palindromic Subsequence", pattern: "Interval DP" },
          { id: 1682, name: "Longest Palindromic Subsequence II", pattern: "Interval DP + last char state" },
          { id: 72, name: "Edit Distance", pattern: "2D DP" },
          { id: 416, name: "Partition Equal Subset Sum", pattern: "0/1 Knapsack" },
        ],
        stages: [
          {
            title: "Giai đoạn 1 — DP cơ bản (phải thuộc)",
            description: "Những bài xây nền tảng. Hiểu DP là gì, công thức truy hồi, lựa chọn Take / Skip.",
            problems: [70, 746, 198, 213, 276, 740],
          },
          {
            title: "Giai đoạn 2 — DP trên mảng",
            description: "Học Kadane, phần bù trên mảng tròn và pattern theo dõi cả max/min. LIS dùng 1D DP, sau đó nâng cấp O(n log n).",
            problems: [1406, 53, 918, 1749, 152, 300],
          },
          {
            title: "Giai đoạn 3 — Knapsack",
            description: "Nhóm cực kỳ quan trọng: Unbounded Knapsack, Counting DP, 0/1 Knapsack kinh điển.",
            problems: [322, 518, 279, 416],
          },
          {
            title: "Giai đoạn 4 — String DP",
            description: "dp[i] = cắt được tới i / số cách giải mã. Trên chuỗi 1 chiều.",
            problems: [139, 91],
          },
          {
            title: "Giai đoạn 5 — Grid DP",
            description: "dp[i][j] phụ thuộc ô trên + ô trái. Bottom-up. Mở rộng cho path 3 hướng.",
            problems: [62, 63, 64, 120, 931],
          },
          {
            title: "Giai đoạn 6 — 2D DP",
            description: "Hai chuỗi/hai chiều: LCS (so khớp), Edit Distance (3 thao tác: insert/delete/replace).",
            problems: [1143, 72],
          },
        ],
        conclusion:
          "Đây là lộ trình phổ biến cho phỏng vấn tại các công ty công nghệ. Sau khi thành thạo 20 bài, bạn sẽ nắm các pattern cốt lõi: Fibonacci, Take/Skip, Kadane, LIS, Knapsack, String DP, Grid DP và 2D DP. Tiếp theo có thể học pattern nâng cao: Bitmask DP, Interval DP, Tree DP, Digit DP.",
      },
      en: {
        intro:
          "If your goal is Software Engineer interviews, these are the 20 most important LeetCode DP problems, ordered from easy to hard. Mastering them lets you solve ~80–90% of DP interview questions.",
        patterns: [
          { id: 70, name: "Climbing Stairs", pattern: "Fibonacci DP" },
          { id: 746, name: "Min Cost Climbing Stairs", pattern: "Fibonacci + Cost" },
          { id: 198, name: "House Robber", pattern: "Linear DP" },
          { id: 213, name: "House Robber II", pattern: "Linear DP + Circle" },
          { id: 276, name: "Paint Fence", pattern: "Same/Diff DP" },
          { id: 740, name: "Delete and Earn", pattern: "House Robber Transform" },
          { id: 1406, name: "Stone Game III", pattern: "Suffix DP / Game DP" },
          { id: 53, name: "Maximum Subarray", pattern: "Kadane DP" },
          { id: 918, name: "Maximum Sum Circular Subarray", pattern: "Kadane DP + circular complement" },
          { id: 1749, name: "Maximum Absolute Sum of Any Subarray", pattern: "Dual Kadane / absolute sum" },
          { id: 152, name: "Maximum Product Subarray", pattern: "DP (max/min state)" },
          { id: 300, name: "Longest Increasing Subsequence", pattern: "1D DP / Binary Search" },
          { id: 322, name: "Coin Change", pattern: "Unbounded Knapsack" },
          { id: 518, name: "Coin Change II", pattern: "Counting DP" },
          { id: 279, name: "Perfect Squares", pattern: "Complete Knapsack" },
          { id: 139, name: "Word Break", pattern: "String DP" },
          { id: 91, name: "Decode Ways", pattern: "String DP" },
          { id: 62, name: "Unique Paths", pattern: "Grid DP" },
          { id: 63, name: "Unique Paths II", pattern: "Grid DP + Obstacles" },
          { id: 64, name: "Minimum Path Sum", pattern: "Grid DP" },
          { id: 120, name: "Triangle", pattern: "Grid DP" },
          { id: 931, name: "Minimum Falling Path Sum", pattern: "Matrix DP" },
          { id: 1143, name: "Longest Common Subsequence", pattern: "2D DP" },
          { id: 72, name: "Edit Distance", pattern: "2D DP" },
          { id: 416, name: "Partition Equal Subset Sum", pattern: "0/1 Knapsack" },
        ],
        stages: [
          {
            title: "Stage 1 — DP Basics (must know)",
            description: "Foundation problems. Understand what DP is, recurrence, Take / Skip choice.",
            problems: [70, 746, 198, 213, 276, 740],
          },
          {
            title: "Stage 2 — Array DP",
            description: "Learn Kadane, the circular-complement trick, and tracking both max/min state. LIS in 1D, then upgrade to O(n log n).",
            problems: [1406, 53, 918, 1749, 152, 300],
          },
          {
            title: "Stage 3 — Knapsack",
            description: "Critical group: Unbounded Knapsack, Counting DP, classic 0/1 Knapsack.",
            problems: [322, 518, 279, 416],
          },
          {
            title: "Stage 4 — String DP",
            description: "dp[i] = can split up to i / number of decodings. On 1D string.",
            problems: [139, 91],
          },
          {
            title: "Stage 5 — Grid DP",
            description: "dp[i][j] depends on top + left. Bottom-up. Extend to 3-way paths.",
            problems: [62, 63, 64, 120, 931],
          },
          {
            title: "Stage 6 — 2D DP",
            description: "Two strings/dimensions: LCS (matching), Edit Distance (insert/delete/replace).",
            problems: [1143, 72],
          },
        ],
        conclusion:
          "This is a popular path for tech interviews. After mastering these 20, you'll know the core patterns: Fibonacci, Take/Skip, Kadane, LIS, Knapsack, String DP, Grid DP and 2D DP. Next, advanced patterns: Bitmask DP, Interval DP, Tree DP, Digit DP.",
      },
    },
  },

  264: {
    id: 264,
    difficulty: "medium",
    slug: "ugly-number-ii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Ugly Number II", en: "Ugly Number II" },
    titleVi: { vi: "Tìm ugly number thứ n", en: "Find the nth ugly number" },
    statement: {
      vi: "Ugly number là số nguyên dương chỉ có các thừa số nguyên tố 2, 3 và 5. Cho n, trả về ugly number thứ n; số 1 được tính là ugly number đầu tiên.",
      en: "An ugly number is a positive integer whose prime factors are limited to 2, 3, and 5. Given n, return the nth ugly number; 1 is the first ugly number.",
    },
    defaultInput: [10],
    inputKind: "positive",
    inputLabel: { vi: "n (1..1690)", en: "n (1..1690)" },
    singleInput: true,
    maxInput: 1690,
    extraParams: [
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Ba con trỏ O(n)", en: "Approach 1: Three pointers O(n)" } },
          { value: "2", label: { vi: "Cách 2: Min-Heap + Set", en: "Approach 2: Min-Heap + Set" } },
        ],
      },
    ],
    approach: [
      {
        vi: "Duy trì dãy ugly tăng dần và ba con trỏ p2, p3, p5 cho ba luồng ứng viên ugly[p] × 2, × 3, × 5.",
        en: "Maintain the increasing ugly sequence and pointers p2, p3, p5 for the candidate streams ugly[p] × 2, × 3, and × 5.",
      },
      {
        vi: "Mỗi bước chọn ứng viên nhỏ nhất làm ugly number tiếp theo.",
        en: "At each step, choose the smallest candidate as the next ugly number.",
      },
      {
        vi: "Tăng tất cả con trỏ tạo ra giá trị vừa chọn để loại số trùng, ví dụ 6 = 2×3 = 3×2.",
        en: "Advance every pointer that produced the chosen value to remove duplicates, such as 6 = 2×3 = 3×2.",
      },
      {
        vi: "Cách 2 dùng min-heap lấy số nhỏ nhất, sinh x×2, x×3, x×5 và dùng seen để không push trùng.",
        en: "Approach 2 pops the smallest value from a min-heap, generates x×2, x×3, x×5, and uses seen to avoid duplicate pushes.",
      },
    ],
    complexity: {
      time: "O(n) / O(n log n)",
      space: "O(n)",
      note: {
        vi: "Cách 1: O(n) với ba con trỏ. Cách 2: O(n log n) do mỗi heappush/heappop tốn O(log n).",
        en: "Approach 1 is O(n) with three pointers. Approach 2 is O(n log n) because each heap push/pop costs O(log n).",
      },
    },
    code: [
      "class Solution:",
      "    def nthUglyNumber(self, n: int) -> int:",
      "        ugly = [1] * n",
      "        p2 = p3 = p5 = 0",
      "        for i in range(1, n):",
      "            next2 = ugly[p2] * 2",
      "            next3 = ugly[p3] * 3",
      "            next5 = ugly[p5] * 5",
      "            ugly[i] = min(next2, next3, next5)",
      "            if ugly[i] == next2:",
      "                p2 += 1",
      "            if ugly[i] == next3:",
      "                p3 += 1",
      "            if ugly[i] == next5:",
      "                p5 += 1",
      "        return ugly[-1]",
    ],
    code2: [
      "import heapq",
      "class Solution:",
      "    def nthUglyNumber(self, n: int) -> int:",
      "        heap = [1]",
      "        seen = {1}",
      "        for _ in range(n):",
      "            ugly = heapq.heappop(heap)",
      "            for factor in (2, 3, 5):",
      "                candidate = ugly * factor",
      "                if candidate not in seen:",
      "                    seen.add(candidate)",
      "                    heapq.heappush(heap, candidate)",
      "        return ugly",
    ],
    codeLabel: { vi: "Cách 1: Ba con trỏ", en: "Approach 1: Three pointers" },
    code2Label: { vi: "Cách 2: Min-Heap + Set", en: "Approach 2: Min-Heap + Set" },
    builder: buildSteps264,
  },

  304: {
    id: 304,
    difficulty: "medium",
    slug: "range-sum-query-2d-immutable",
    category: { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
    title: { vi: "Range Sum Query 2D - Immutable", en: "Range Sum Query 2D - Immutable" },
    titleVi: { vi: "Tong vung 2D bat bien", en: "Immutable 2D range sums" },
    statement: {
      vi: "Cho ma tran 2D khong thay doi. Thiet ke NumMatrix de tra ve tong cac phan tu trong hinh chu nhat tu (row1, col1) den (row2, col2).",
      en: "Given an immutable 2D matrix, design NumMatrix to return the sum inside the rectangle from (row1, col1) to (row2, col2).",
    },
    defaultInput: "[[3,0,1,4,2],[5,6,3,2,1],[1,2,0,1,5],[4,1,0,1,7],[1,0,3,0,5]]",
    inputKind: "string",
    inputLabel: { vi: "matrix (JSON hoac cac hang cach nhau bang ;)", en: "matrix (JSON or semicolon-separated rows)" },
    extraParams: [
      { key: "row1", type: "number", label: { vi: "row1", en: "row1" }, default: 2 },
      { key: "col1", type: "number", label: { vi: "col1", en: "col1" }, default: 1 },
      { key: "row2", type: "number", label: { vi: "row2", en: "row2" }, default: 4 },
      { key: "col2", type: "number", label: { vi: "col2", en: "col2" }, default: 3 },
    ],
    approach: [
      { vi: "Tao bang prefix co them mot hang va mot cot 0.", en: "Build a prefix table with one extra zero row and column." },
      { vi: "prefix[r][c] la tong hinh chu nhat tu goc (0,0) den matrix[r-1][c-1].", en: "prefix[r][c] stores the rectangle sum from (0,0) through matrix[r-1][c-1]." },
      { vi: "sumRegion = goc duoi-phai - phia tren - ben trai + phan giao bi tru hai lan.", en: "sumRegion = bottom-right - above - left + the overlap subtracted twice." },
    ],
    complexity: {
      time: "O(m*n) build, O(1) query",
      space: "O(m*n)",
      note: { vi: "Moi truy van chi doc bon o trong bang prefix.", en: "Each query reads exactly four prefix-table cells." },
    },
    code: [
      "class NumMatrix:",
      "    def __init__(self, matrix):",
      "        m, n = len(matrix), len(matrix[0])",
      "        self.prefix = [[0] * (n + 1) for _ in range(m + 1)]",
      "        for row in range(1, m + 1):",
      "            for col in range(1, n + 1):",
      "                self.prefix[row][col] = (",
      "                    matrix[row - 1][col - 1]",
      "                    + self.prefix[row - 1][col]",
      "                    + self.prefix[row][col - 1]",
      "                    - self.prefix[row - 1][col - 1]",
      "                )",
      "",
      "    def sumRegion(self, row1: int, col1: int, row2: int, col2: int) -> int:",
      "        bottom_right = self.prefix[row2 + 1][col2 + 1]",
      "        above = self.prefix[row1][col2 + 1]",
      "        left = self.prefix[row2 + 1][col1]",
      "        overlap = self.prefix[row1][col1]",
      "        return bottom_right - above - left + overlap",
    ],
    builder: buildSteps304,
  },

  10: {
    id: 10,
    difficulty: "hard",
    slug: "regular-expression-matching",
    category: { key: "dp", vi: "Quy hoach dong", en: "Dynamic Programming" },
    title: { vi: "Regular Expression Matching", en: "Regular Expression Matching" },
    titleVi: { vi: "So khop bieu thuc chinh quy", en: "Regular expression matching" },
    statement: {
      vi: "Cho chuoi s va pattern p. Pattern ho tro '.' khop mot ky tu bat ky va '*' khop 0 hoac nhieu lan ky tu dung truoc no. Kiem tra toan bo s co khop p khong.",
      en: "Given a string s and a pattern p. The pattern supports '.' to match any single character and '*' to match zero or more of the previous token. Return whether the entire string matches the pattern.",
    },
    defaultInput: "aab",
    inputKind: "string",
    inputLabel: { vi: "s", en: "s" },
    extraParams: [{ key: "p", type: "string", label: { vi: "p", en: "p" }, default: "c*a*b" }],
    approach: [
      { vi: "dp[i][j] = s[:i] co khop p[:j] hay khong.", en: "dp[i][j] = whether s[:i] matches p[:j]." },
      { vi: "Neu p[j-1] la ky tu thuong hoac '.', lay duong cheo dp[i-1][j-1].", en: "If p[j-1] is a normal char or '.', use diagonal dp[i-1][j-1]." },
      { vi: "Neu p[j-1] la '*', co 2 cach: dung 0 lan token truoc do, hoac an them 1 ky tu neu token truoc do khop.", en: "If p[j-1] is '*', there are 2 choices: use zero copies of the previous token, or consume one more character if the previous token matches." },
    ],
    complexity: {
      time: "O(m*n)",
      space: "O(m*n)",
      note: { vi: "Dien bang (m+1) x (n+1).", en: "Fill a (m+1) x (n+1) table." },
    },
    code: [
      "class Solution:",
      "    def isMatch(self, s: str, p: str) -> bool:",
      "        m, n = len(s), len(p)",
      "        dp = [[False] * (n + 1) for _ in range(m + 1)]",
      "        dp[0][0] = True",
      "        for j in range(2, n + 1):",
      "            if p[j - 1] == '*':",
      "                dp[0][j] = dp[0][j - 2]",
      "        for i in range(1, m + 1):",
      "            for j in range(1, n + 1):",
      "                if p[j - 1] == '.' or p[j - 1] == s[i - 1]:",
      "                    dp[i][j] = dp[i - 1][j - 1]",
      "                elif p[j - 1] == '*':",
      "                    dp[i][j] = dp[i][j - 2]",
      "                    if p[j - 2] == '.' or p[j - 2] == s[i - 1]:",
      "                        dp[i][j] = dp[i][j] or dp[i - 1][j]",
      "        return dp[m][n]",
    ],
    builder: buildSteps10,
  },
  44: {
    id: 44,
    difficulty: "hard",
    slug: "wildcard-matching",
    category: { key: "dp", vi: "Quy hoach dong", en: "Dynamic Programming" },
    title: { vi: "Wildcard Matching", en: "Wildcard Matching" },
    titleVi: { vi: "So khop wildcard", en: "Wildcard matching" },
    statement: {
      vi: "Cho chuoi s va pattern p. Pattern ho tro '?' khop dung mot ky tu va '*' khop bat ky chuoi nao ke ca rong. Kiem tra toan bo s co khop p khong.",
      en: "Given a string s and a pattern p. The pattern supports '?' to match exactly one character and '*' to match any sequence including empty. Return whether the entire string matches the pattern.",
    },
    defaultInput: "adceb",
    inputKind: "string",
    inputLabel: { vi: "s", en: "s" },
    extraParams: [
      { key: "p", type: "string", label: { vi: "p", en: "p" }, default: "*a*b" },
      { key: "approach", label: { vi: "Cach giai", en: "Approach" }, type: "select", default: "1", options: [
        { value: "1", label: { vi: "Approach 1: DP table O(m*n)", en: "Approach 1: DP table O(m*n)" } },
        { value: "2", label: { vi: "Approach 2: Greedy O(1)", en: "Approach 2: Greedy O(1)" } },
      ] },
    ],
    approach: [
      { vi: "Approach 1: DP table, dp[i][j] = s[:i] co khop p[:j] hay khong.", en: "Approach 1: DP table, dp[i][j] = whether s[:i] matches p[:j]." },
      { vi: "Approach 2: Greedy hai con tro. Luu vi tri '*' gan nhat va quay lai do khi mismatch.", en: "Approach 2: two-pointer greedy. Store the latest '*' position and backtrack there on mismatch." },
      { vi: "Greedy toi uu hon: time O(m+n), space O(1), trong khi DP dung O(m*n) space.", en: "Greedy is more optimal: O(m+n) time and O(1) space, while DP uses O(m*n) space." },
    ],
    complexity: {
      time: "O(m*n) / O(m+n)",
      space: "O(m*n) / O(1)",
      note: { vi: "Approach 1 dien bang DP. Approach 2 dung greedy voi i, j, star, match.", en: "Approach 1 fills a DP table. Approach 2 uses greedy pointers i, j, star, match." },
    },
    codeLabel: { vi: "Approach 1: DP table", en: "Approach 1: DP table" },
    code: [
      "class Solution:",
      "    def isMatch(self, s: str, p: str) -> bool:",
      "        m, n = len(s), len(p)",
      "        dp = [[False] * (n + 1) for _ in range(m + 1)]",
      "        dp[0][0] = True",
      "        for j in range(1, n + 1):",
      "            if p[j - 1] == '*':",
      "                dp[0][j] = dp[0][j - 1]",
      "            else:",
      "                break",
      "        for i in range(1, m + 1):",
      "            for j in range(1, n + 1):",
      "                if p[j - 1] == '?' or p[j - 1] == s[i - 1]:",
      "                    dp[i][j] = dp[i - 1][j - 1]",
      "                elif p[j - 1] == '*':",
      "                    dp[i][j] = dp[i][j - 1] or dp[i - 1][j]",
      "                else:",
      "                    dp[i][j] = False",
      "        return dp[m][n]",
    ],
    code2Label: { vi: "Approach 2: Greedy O(1)", en: "Approach 2: Greedy O(1)" },
    code2: [
      "class Solution:",
      "    def isMatch(self, s: str, p: str) -> bool:",
      "        i = j = 0",
      "        star = -1",
      "        match = 0",
      "",
      "        while i < len(s):",
      "            if j < len(p) and (p[j] == s[i] or p[j] == '?'):",
      "                i += 1",
      "                j += 1",
      "",
      "            elif j < len(p) and p[j] == '*':",
      "                star = j",
      "                match = i",
      "                j += 1",
      "",
      "            elif star != -1:",
      "                j = star + 1",
      "                match += 1",
      "                i = match",
      "",
      "            else:",
      "                return False",
      "",
      "        while j < len(p) and p[j] == '*':",
      "            j += 1",
      "",
      "        return j == len(p)",
    ],
    builder: buildSteps44,
  },
  416: {
    id: 416, difficulty: "medium", slug: "partition-equal-subset-sum",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Partition Equal Subset Sum", en: "Partition Equal Subset Sum" },
    titleVi: { vi: "Chia tập bằng nhau (0/1 Knapsack)", en: "Equal partition (0/1 Knapsack)" },
    statement: { vi: "Cho mảng nums. Có thể chia thành 2 tập con có tổng bằng nhau không?", en: "Given nums, can you partition it into two subsets with equal sum?" },
    defaultInput: [1, 5, 11, 5],
    inputKind: "positive",
    extraParams: [],
    complexity: { time: "O(n × sum/2)", space: "O(sum/2)", note: { vi: "n phần tử × target ô DP.", en: "n elements × target DP cells." } },
    code: [
      "class Solution:",
      "    def canPartition(self, nums):",
      "        total = sum(nums)",
      "        if total % 2 != 0: return False",
      "        target = total // 2",
      "        dp = [False] * (target + 1)",
      "        dp[0] = True",
      "        for num in nums:",
      "            for j in range(target, num-1, -1):",
      "                dp[j] = dp[j] or dp[j-num]",
      "        return dp[target]",
    ],
    builder: buildSteps416,
  },
  474: {
    id: 474,
    difficulty: "medium",
    slug: "ones-and-zeroes",
    category: { key: "dp", vi: "Quy hoach dong", en: "Dynamic Programming" },
    title: { vi: "Ones and Zeroes", en: "Ones and Zeroes" },
    titleVi: { vi: "So luong chuoi 0/1 toi da", en: "Maximum binary strings" },
    statement: {
      vi: "Cho mang chuoi nhi phan strs va hai so m, n. Chon nhieu chuoi nhat sao cho tong so 0 khong vuot m va tong so 1 khong vuot n.",
      en: "Given binary strings strs and integers m, n. Pick the maximum number of strings using at most m zeroes and n ones.",
    },
    defaultInput: ["10", "0001", "111001", "1", "0"],
    inputKind: "stringArray",
    inputLabel: { vi: "strs", en: "strs" },
    extraParams: [
      { key: "m", type: "number", label: { vi: "m (so 0)", en: "m (zeroes)" }, default: 5 },
      { key: "n", type: "number", label: { vi: "n (so 1)", en: "n (ones)" }, default: 3 },
    ],
    approach: [
      { vi: "Day la 0/1 knapsack voi 2 capacity: so 0 va so 1.", en: "This is 0/1 knapsack with two capacities: zeroes and ones." },
      { vi: "dp[z][o] = so chuoi nhieu nhat co the chon voi toi da z so 0 va o so 1.", en: "dp[z][o] = max strings that can be picked using at most z zeroes and o ones." },
      { vi: "Voi moi chuoi, dem zeros/ones roi duyet z va o giam dan de moi chuoi chi duoc dung mot lan.", en: "For each string, count zeroes/ones, then scan z and o downward so each string is used at most once." },
    ],
    complexity: {
      time: "O(len(strs)*m*n)",
      space: "O(m*n)",
      note: { vi: "Bang DP co (m+1)*(n+1) o, moi chuoi cap nhat mot lan.", en: "The DP table has (m+1)*(n+1) cells, and each string updates it once." },
    },
    code: [
      "class Solution:",
      "    def findMaxForm(self, strs: List[str], m: int, n: int) -> int:",
      "        dp = [[0] * (n + 1) for _ in range(m + 1)]",
      "",
      "        for s in strs:",
      "            zeros = s.count('0')",
      "            ones = s.count('1')",
      "",
      "            for z in range(m, zeros - 1, -1):",
      "                for o in range(n, ones - 1, -1):",
      "                    dp[z][o] = max(",
      "                        dp[z][o],",
      "                        dp[z - zeros][o - ones] + 1",
      "                    )",
      "",
      "        return dp[m][n]",
    ],
    builder: buildSteps474,
  },
  72: {
    id: 72, difficulty: "medium", slug: "edit-distance",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Edit Distance", en: "Edit Distance" },
    titleVi: { vi: "Khoảng cách chỉnh sửa (Levenshtein)", en: "Edit distance (Levenshtein)" },
    statement: { vi: "Cho hai chuỗi word1, word2. Trả về số thao tác (chèn/xóa/thay) ít nhất để chuyển word1 thành word2.", en: "Given two strings word1 and word2, return the minimum number of operations (insert/delete/replace) to convert word1 into word2." },
    defaultInput: "horse", inputKind: "string", inputLabel: { vi: "word1", en: "word1" },
    extraParams: [
      { key: "word2", type: "string", label: { vi: "word2", en: "word2" }, default: "ros" },
      { key: "approach", label: { vi: "Cach giai", en: "Approach" }, type: "select", default: "1", options: [
        { value: "1", label: { vi: "Cach 1: DP bang O(m*n)", en: "Approach 1: DP table O(m*n)" } },
        { value: "2", label: { vi: "Cach 2: Rolling array O(n)", en: "Approach 2: Rolling array O(n)" } },
      ] },
    ],
    complexity: { time: "O(m×n)", space: "O(m×n)", note: { vi: "Bảng (m+1)×(n+1) → O(m×n).", en: "Table (m+1)×(n+1) → O(m×n)." } },
    code: [
      "class Solution:",
      "    def minDistance(self, word1: str, word2: str) -> int:",
      "        m, n = len(word1), len(word2)",
      "        ",
      "        # dp[i][j] = số bước ít nhất để biến word1[:i] thành word2[:j]",
      "        dp = [[0] * (n + 1) for _ in range(m + 1)]",
      "        ",
      "        # Base case: biến chuỗi rỗng thành word2[:j] cần j bước chèn",
      "        for j in range(n + 1):",
      "            dp[0][j] = j",
      "        ",
      "        # Base case: biến word1[:i] thành chuỗi rỗng cần i bước xóa",
      "        for i in range(m + 1):",
      "            dp[i][0] = i",
      "        ",
      "        for i in range(1, m + 1):",
      "            for j in range(1, n + 1):",
      "                if word1[i - 1] == word2[j - 1]:",
      "                    # Ký tự giống nhau, không cần thao tác gì thêm",
      "                    dp[i][j] = dp[i - 1][j - 1]",
      "                else:",
      "                    dp[i][j] = 1 + min(",
      "                        dp[i - 1][j],     # Xóa ký tự word1[i-1]",
      "                        dp[i][j - 1],     # Chèn ký tự word2[j-1]",
      "                        dp[i - 1][j - 1]  # Thay thế word1[i-1] bằng word2[j-1]",
      "                    )",
      "        ",
      "        return dp[m][n]",
    ],
    codeEn: [
      "class Solution:",
      "    def minDistance(self, word1: str, word2: str) -> int:",
      "        m, n = len(word1), len(word2)",
      "        ",
      "        # dp[i][j] = minimum steps to convert word1[:i] into word2[:j]",
      "        dp = [[0] * (n + 1) for _ in range(m + 1)]",
      "        ",
      "        # Base case: converting empty string to word2[:j] needs j insertions",
      "        for j in range(n + 1):",
      "            dp[0][j] = j",
      "        ",
      "        # Base case: converting word1[:i] to empty string needs i deletions",
      "        for i in range(m + 1):",
      "            dp[i][0] = i",
      "        ",
      "        for i in range(1, m + 1):",
      "            for j in range(1, n + 1):",
      "                if word1[i - 1] == word2[j - 1]:",
      "                    # Same character, no extra operation needed",
      "                    dp[i][j] = dp[i - 1][j - 1]",
      "                else:",
      "                    dp[i][j] = 1 + min(",
      "                        dp[i - 1][j],     # Delete word1[i-1]",
      "                        dp[i][j - 1],     # Insert word2[j-1]",
      "                        dp[i - 1][j - 1]  # Replace word1[i-1] with word2[j-1]",
      "                    )",
      "        ",
      "        return dp[m][n]",
    ],
    code2: [
      "class Solution:",
      "    def minDistance(self, word1: str, word2: str) -> int:",
      "        m, n = len(word1), len(word2)",
      "        prev = list(range(n + 1))",
      "        ",
      "        for i in range(1, m + 1):",
      "            curr = [i] + [0] * n",
      "            for j in range(1, n + 1):",
      "                if word1[i - 1] == word2[j - 1]:",
      "                    curr[j] = prev[j - 1]",
      "                else:",
      "                    curr[j] = 1 + min(prev[j], curr[j - 1], prev[j - 1])",
      "            prev = curr",
      "        ",
      "        return prev[n]",
    ],
    code2Label: { vi: "Cach 2: Rolling array O(n)", en: "Approach 2: Rolling array O(n)" },
    builder: buildSteps72,
  },
  931: {
    id: 931,
    difficulty: "medium",
    slug: "minimum-falling-path-sum",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Minimum Falling Path Sum", en: "Minimum Falling Path Sum" },
    titleVi: { vi: "Tổng đường rơi nhỏ nhất (DP 2D)", en: "Min falling path sum (2D DP)" },
    statement: {
      vi: "Cho ma trận vuông n×n. Tìm tổng nhỏ nhất của đường đi từ hàng đầu xuống hàng cuối (mỗi bước đi xuống-trái, xuống, hoặc xuống-phải).",
      en: "Given an n×n square matrix, find the minimum sum of a falling path (each step moves to the cell directly below, below-left, or below-right).",
    },
    defaultInput: "2,1,3|6,5,4|7,8,9",
    inputKind: "string",
    inputLabel: { vi: "Matrix (hàng cách bởi |)", en: "Matrix (rows separated by |)" },
    extraParams: [],
    complexity: {
      time: "O(n²)",
      space: "O(n²)",
      note: {
        vi: "Điền n×n bảng → O(n²). Có thể tối ưu O(n) bằng 1 hàng.",
        en: "Fill n×n table → O(n²). Optimizable to O(n) with one row.",
      },
    },
    code: [
      "class Solution:",
      "    def minFallingPathSum(self, matrix):",
      "        n = len(matrix)",
      "        dp = [row[:] for row in matrix]",
      "        for r in range(1, n):",
      "            for c in range(n):",
      "                above = [dp[r-1][c]]",
      "                if c>0: above.append(dp[r-1][c-1])",
      "                if c<n-1: above.append(dp[r-1][c+1])",
      "                dp[r][c] = matrix[r][c] + min(above)",
      "        return min(dp[n-1])",
    ],
    builder: buildSteps931,
  },
  1937: {
    id: 1937,
    difficulty: "medium",
    slug: "maximum-number-of-points-with-cost",
    category: { key: "dp", vi: "Quy hoach dong", en: "Dynamic Programming" },
    title: { vi: "Maximum Number of Points with Cost", en: "Maximum Number of Points with Cost" },
    titleVi: { vi: "Diem toi da co tru chi phi", en: "Maximum points with cost" },
    statement: {
      vi: "Cho ma tran points. Moi hang chon dung mot o. Neu hang truoc chon cot c1 va hang sau chon cot c2 thi bi tru |c1-c2| diem. Tra ve diem toi da.",
      en: "Given a points matrix. Pick exactly one cell from each row. Moving from column c1 to c2 between adjacent rows costs |c1-c2| points. Return the maximum score.",
    },
    defaultInput: "1,2,3|1,5,1|3,1,1",
    inputKind: "string",
    inputLabel: { vi: "points (hang cach |, so cach ,)", en: "points (rows by |, numbers by ,)" },
    extraParams: [],
    approach: [
      { vi: "dp hang truoc: prev[c] = diem tot nhat neu ket thuc o cot c cua hang truoc.", en: "Previous-row DP: prev[c] = best score ending at column c of the previous row." },
      { vi: "Cong thuc truc tiep curr[c] = points[r][c] + max(prev[k] - abs(k-c)) se la O(n^2) moi hang.", en: "Direct transition curr[c] = points[r][c] + max(prev[k] - abs(k-c)) would be O(n^2) per row." },
      { vi: "Toi uu bang 2 pass: left[c]=max(left[c-1]-1, prev[c]), right[c]=max(right[c+1]-1, prev[c]).", en: "Optimize with 2 passes: left[c]=max(left[c-1]-1, prev[c]), right[c]=max(right[c+1]-1, prev[c])." },
    ],
    complexity: {
      time: "O(m*n)",
      space: "O(n)",
      note: { vi: "Moi hang quet trai, quet phai, roi tinh curr: 3 lan O(n).", en: "Each row does a left pass, right pass, then curr pass: three O(n) scans." },
    },
    code: [
      "class Solution:",
      "    def maxPoints(self, points: List[List[int]]) -> int:",
      "        prev = points[0]",
      "        for r in range(1, len(points)):",
      "            left = [0] * len(prev)",
      "            left[0] = prev[0]",
      "            for c in range(1, len(prev)):",
      "                left[c] = max(left[c - 1] - 1, prev[c])",
      "            right = [0] * len(prev)",
      "            right[-1] = prev[-1]",
      "            for c in range(len(prev) - 2, -1, -1):",
      "                right[c] = max(right[c + 1] - 1, prev[c])",
      "            curr = [0] * len(prev)",
      "            for c in range(len(prev)):",
      "                curr[c] = points[r][c] + max(left[c], right[c])",
      "            prev = curr",
      "        return max(prev)",
    ],
    builder: buildSteps1937,
  },
  741: {
    id: 741,
    difficulty: "hard",
    slug: "cherry-pickup",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Cherry Pickup", en: "Cherry Pickup" },
    titleVi: { vi: "Nhặt anh đào (DP 3 chiều)", en: "Cherry pickup (3D DP)" },
    statement: {
      vi:
        "Lưới n×n: 1=anh đào, 0=trống, -1=gai (chặn). Đi từ (0,0) đến (n-1,n-1) chỉ phải/xuống (nhặt anh đào, ô thành 0), " +
        "rồi quay về (0,0) chỉ trái/lên. Tối đa hóa số anh đào nhặt được. Nếu không có đường đi → 0. " +
        "Nhập lưới: hàng cách bởi '|', giá trị cách bởi ','.",
      en:
        "Grid n×n: 1=cherry, 0=empty, -1=thorn (blocked). Go from (0,0) to (n-1,n-1) moving right/down (pick cherries, cell becomes 0), " +
        "then return to (0,0) moving left/up. Maximize cherries collected. If no valid path → 0. " +
        "Enter grid: rows separated by '|', values by ','.",
    },
    defaultInput: "0,1,-1|1,0,-1|1,1,1",
    inputKind: "string",
    inputLabel: { vi: "Lưới (hàng cách '|')", en: "Grid (rows separated by '|')" },
    extraParams: [],
    approach: [
      { vi: "Đi-rồi-về khó tối ưu trực tiếp. Mẹo: coi như 2 người CÙNG đi từ (0,0) → (n-1,n-1).", en: "Go-then-return is hard to optimize directly. Trick: treat as 2 walkers BOTH going (0,0) → (n-1,n-1)." },
      { vi: "Hai người đi cùng số bước t = r+c. Nên r1+c1 = r2+c2 → state chỉ cần (t, c1, c2) hoặc (r1, c1, c2).", en: "Both take t = r+c steps. So r1+c1 = r2+c2 → state only needs (t, c1, c2) or (r1, c1, c2)." },
      { vi: "Mỗi bước, mỗi người chọn phải hoặc xuống → 4 tổ hợp chuyển trạng thái.", en: "Each step, each walker chooses right or down → 4 transition combinations." },
      { vi: "Nếu hai người ở CÙNG ô → chỉ tính anh đào 1 lần (tránh đếm trùng).", en: "If both on the SAME cell → count its cherry only once (avoid double-counting)." },
      { vi: "Đáp án = max(0, dp(0,0,0)). Nếu mọi đường bị gai chặn → 0.", en: "Answer = max(0, dp(0,0,0)). If all paths are blocked by thorns → 0." },
    ],
    complexity: {
      time: "O(n³)",
      space: "O(n³)",
      note: {
        vi: "State (r1, c1, c2) có O(n³) khả năng, mỗi state O(1). Memo O(n³).",
        en: "State (r1, c1, c2) has O(n³) possibilities, each O(1). Memo O(n³).",
      },
    },
    code: [
      "class Solution:",
      "    def cherryPickup(self, grid):",
      "        n = len(grid)",
      "        from functools import lru_cache",
      "        @lru_cache(None)",
      "        def dp(r1, c1, c2):",
      "            r2 = r1 + c1 - c2",
      "            if (r1>=n or c1>=n or r2>=n or c2>=n",
      "                    or grid[r1][c1]==-1 or grid[r2][c2]==-1):",
      "                return float('-inf')",
      "            if r1==n-1 and c1==n-1:",
      "                return grid[r1][c1]",
      "            cherries = grid[r1][c1]",
      "            if c1 != c2: cherries += grid[r2][c2]",
      "            cherries += max(dp(r1,c1+1,c2+1), dp(r1+1,c1,c2+1),",
      "                            dp(r1,c1+1,c2),   dp(r1+1,c1,c2))",
      "            return cherries",
      "        return max(0, dp(0, 0, 0))",
    ],
    builder: buildSteps741,
  },
  120: {
    id: 120,
    difficulty: "medium",
    slug: "triangle",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Triangle", en: "Triangle" },
    titleVi: { vi: "Tam giác (DP bottom-up)", en: "Triangle (bottom-up DP)" },
    statement: {
      vi: "Cho tam giác số. Tìm tổng nhỏ nhất của đường đi từ đỉnh xuống đáy (mỗi bước đi xuống hoặc xuống-phải).",
      en: "Given a triangle array, find the minimum path sum from top to bottom (each step moves to adjacent numbers on the row below).",
    },
    defaultInput: "2|3,4|6,5,7|4,1,8,3",
    inputKind: "string",
    inputLabel: { vi: "Triangle (hàng cách bởi |)", en: "Triangle (rows separated by |)" },
    extraParams: [],
    complexity: {
      time: "O(n²)",
      space: "O(n)",
      note: {
        vi: "n hàng, tổng n(n+1)/2 phần tử → O(n²). Có thể tối ưu O(n) bộ nhớ bằng 1 mảng.",
        en: "n rows, n(n+1)/2 elements → O(n²). Optimizable to O(n) memory with one array.",
      },
    },
    code: [
      "class Solution:",
      "    def minimumTotal(self, triangle):",
      "        dp = [row[:] for row in triangle]",
      "        for r in range(len(dp)-2, -1, -1):",
      "            for c in range(r+1):",
      "                dp[r][c] = triangle[r][c] + min(dp[r+1][c], dp[r+1][c+1])",
      "        return dp[0][0]",
    ],
    builder: buildSteps120,
  },
  64: {
    id: 64,
    difficulty: "medium",
    slug: "minimum-path-sum",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Minimum Path Sum", en: "Minimum Path Sum" },
    titleVi: { vi: "Tổng đường đi nhỏ nhất (DP 2D)", en: "Min path sum (2D grid DP)" },
    statement: {
      vi: "Cho lưới m×n chứa số không âm. Tìm đường từ trái-trên đến phải-dưới (chỉ đi phải/xuống) có tổng nhỏ nhất.",
      en: "Given an m×n grid of non-negative numbers, find a path from top-left to bottom-right (only right/down) that minimizes the sum.",
    },
    defaultInput: "1,3,1|1,5,1|4,2,1",
    inputKind: "string",
    inputLabel: { vi: "Grid (hàng cách bởi |)", en: "Grid (rows separated by |)" },
    extraParams: [],
    complexity: {
      time: "O(m×n)",
      space: "O(m×n)",
      note: {
        vi: "Điền bảng m×n → O(m×n). Có thể tối ưu O(n) bằng 1 hàng.",
        en: "Fill m×n table → O(m×n). Optimizable to O(n) with one row.",
      },
    },
    approach: [
      { vi: "dp[r][c] = chi phí nhỏ nhất để đến (r,c) từ (0,0) chỉ đi phải/xuống.", en: "dp[r][c] = minimum cost to reach (r,c) from (0,0) moving only right/down." },
      { vi: "Khởi tạo: dp[0][0] = grid[0][0]; hàng đầu cộng dồn từ trái; cột đầu cộng dồn từ trên.", en: "Base: dp[0][0] = grid[0][0]; first row accumulates left→right; first column top→bottom." },
      { vi: "dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1]).", en: "dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1])." },
      { vi: "Đáp án = dp[m-1][n-1].", en: "Answer = dp[m-1][n-1]." },
    ],
    code: [
      "class Solution:",
      "    def minPathSum(self, grid):",
      "        m, n = len(grid), len(grid[0])",
      "        dp = [[0]*n for _ in range(m)]",
      "        dp[0][0] = grid[0][0]",
      "        for c in range(1,n): dp[0][c] = dp[0][c-1]+grid[0][c]",
      "        for r in range(1,m): dp[r][0] = dp[r-1][0]+grid[r][0]",
      "        for r in range(1, m):",
      "            for c in range(1, n):",
      "                dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1])",
      "        return dp[m-1][n-1]",
    ],
    builder: buildSteps64,
  },
  62: {
    id: 62,
    difficulty: "medium",
    slug: "unique-paths",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Unique Paths", en: "Unique Paths" },
    titleVi: { vi: "Số đường đi duy nhất (DP 2D)", en: "Unique paths (2D grid DP)" },
    statement: {
      vi: "Robot ở góc trái trên lưới m×n. Chỉ đi phải hoặc xuống. Đếm số đường đi đến góc phải dưới.",
      en: "A robot at the top-left of an m×n grid can only move right or down. Count paths to the bottom-right corner.",
    },
    defaultInput: [3],
    inputKind: "positive",
    inputLabel: { vi: "m (số hàng)", en: "m (rows)" },
    singleInput: true,
    maxInput: 8,
    extraParams: [
      { key: "m", label: { vi: "m (hàng)", en: "m (rows)" }, default: 3 },
      { key: "n", label: { vi: "n (cột)", en: "n (cols)" }, default: 7 },
    ],
    complexity: {
      time: "O(m×n)",
      space: "O(m×n)",
      note: {
        vi: "Điền bảng m×n một lần → O(m×n). Có thể tối ưu xuống O(n) bằng 1 hàng.",
        en: "Fill m×n table once → O(m×n). Optimizable to O(n) with a single row.",
      },
    },
    code: [
      "class Solution:",
      "    def uniquePaths(self, m, n):",
      "        dp = [[1]*n for _ in range(m)]",
      "        for r in range(1, m):",
      "            for c in range(1, n):",
      "                dp[r][c] = dp[r-1][c] + dp[r][c-1]",
      "        return dp[m-1][n-1]",
    ],
    builder: buildSteps62,
  },
  63: {
    id: 63,
    difficulty: "medium",
    slug: "unique-paths-ii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Unique Paths II", en: "Unique Paths II" },
    titleVi: { vi: "Số đường đi có vật cản (DP 2D)", en: "Unique paths with obstacles (2D grid DP)" },
    statement: {
      vi: "Robot ở góc trái trên lưới m x n và chỉ đi phải hoặc xuống. Một số ô có vật cản (1). Đếm số đường đi đến góc phải dưới mà không đi qua vật cản. Nhập grid: hàng cách bởi '|', giá trị cách bởi ','.",
      en: "A robot starts at the top-left of an m x n grid and can only move right or down. Some cells contain obstacles (1). Count paths to the bottom-right without stepping on obstacles. Enter grid: rows separated by '|', values by ','.",
    },
    defaultInput: "0,0,0|0,1,0|0,0,0",
    inputKind: "string",
    inputLabel: { vi: "Obstacle grid (0/1, hàng cách '|')", en: "Obstacle grid (0/1, rows separated by '|')" },
    extraParams: [],
    approach: [
      { vi: "DP 2D: dp[r][c] = số đường hợp lệ đến ô (r,c).", en: "2D DP: dp[r][c] = number of valid paths to cell (r,c)." },
      { vi: "Nếu obstacleGrid[r][c] == 1 thì dp[r][c] = 0.", en: "If obstacleGrid[r][c] == 1, then dp[r][c] = 0." },
      { vi: "Nếu ô trống: dp[r][c] = dp[r-1][c] + dp[r][c-1].", en: "If the cell is open: dp[r][c] = dp[r-1][c] + dp[r][c-1]." },
      { vi: "Đáp án = dp[m-1][n-1].", en: "Answer = dp[m-1][n-1]." },
    ],
    complexity: {
      time: "O(m x n)",
      space: "O(m x n)",
      note: {
        vi: "Điền mỗi ô đúng một lần. Có thể tối ưu bộ nhớ xuống O(n) bằng một hàng dp.",
        en: "Each cell is filled once. Memory can be optimized to O(n) with one dp row.",
      },
    },
    code: [
      "class Solution:",
      "    def uniquePathsWithObstacles(self, obstacleGrid):",
      "        m, n = len(obstacleGrid), len(obstacleGrid[0])",
      "        dp = [[0] * n for _ in range(m)]",
      "        if obstacleGrid[0][0] == 1:",
      "            return 0",
      "        dp[0][0] = 1",
      "        for c in range(1, n):",
      "            dp[0][c] = 0 if obstacleGrid[0][c] else dp[0][c-1]",
      "        for r in range(1, m):",
      "            dp[r][0] = 0 if obstacleGrid[r][0] else dp[r-1][0]",
      "        for r in range(1, m):",
      "            for c in range(1, n):",
      "                if obstacleGrid[r][c] == 1:",
      "                    dp[r][c] = 0",
      "                else:",
      "                    dp[r][c] = dp[r-1][c] + dp[r][c-1]",
      "        return dp[m-1][n-1]",
    ],
    builder: buildSteps63,
  },
  1639: {
    id: 1639,
    difficulty: "hard",
    slug: "number-of-ways-to-form-a-target-string-given-a-dictionary",
    category: { key: "dp", vi: "Quy hoach dong", en: "Dynamic Programming" },
    title: { vi: "Number of Ways to Form Target String", en: "Number of Ways to Form Target String" },
    titleVi: { vi: "So cach tao chuoi target", en: "Number of ways to form target" },
    statement: {
      vi: "Cho danh sach words co cung do dai va target. Moi buoc chon mot ky tu tu mot cot chua dung, cac cot phai tang dan trai sang phai. Dem so cach tao target.",
      en: "Given same-length words and a target. At each step choose a character from an unused column, and chosen columns must increase left to right. Count ways to form target.",
    },
    defaultInput: "acca,bbbb,caca",
    inputKind: "string",
    inputLabel: { vi: "words (phay ngan)", en: "words (comma separated)" },
    extraParams: [
      { key: "target", type: "string", label: { vi: "target", en: "target" }, default: "aba" },
    ],
    approach: [
      { vi: "Dem tan suat moi ky tu trong tung cot cua words.", en: "Count character frequencies in each column of words." },
      { vi: "dp[i] = so cach tao target[:i] bang cac cot da xu ly.", en: "dp[i] = number of ways to form target[:i] using processed columns." },
      { vi: "Voi moi cot, duyet i nguoc: dp[i+1] += dp[i] * freq[col][target[i]].", en: "For each column, iterate i backward: dp[i+1] += dp[i] * freq[col][target[i]]." },
    ],
    complexity: {
      time: "O(words*cols + cols*target)",
      space: "O(cols*alphabet + target)",
      note: { vi: "Dem tan suat theo cot, sau do moi cot cap nhat mang dp mot chieu.", en: "Count column frequencies, then each column updates a one-dimensional dp array." },
    },
    code: [
      "class Solution:",
      "    def numWays(self, words: List[str], target: str) -> int:",
      "        MOD = 10**9 + 7",
      "        cols = len(words[0])",
      "        freq = [Counter(word[c] for word in words) for c in range(cols)]",
      "        dp = [0] * (len(target) + 1)",
      "        dp[0] = 1",
      "",
      "        for c in range(cols):",
      "            for i in range(len(target) - 1, -1, -1):",
      "                dp[i + 1] = (dp[i + 1] + dp[i] * freq[c][target[i]]) % MOD",
      "",
      "        return dp[len(target)]",
    ],
    builder: buildSteps1639,
  },
  91: {
    id: 91,
    difficulty: "medium",
    slug: "decode-ways",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Decode Ways", en: "Decode Ways" },
    titleVi: { vi: "Số cách giải mã (DP trên chuỗi)", en: "Decode ways (string DP)" },
    statement: {
      vi: "Cho chuỗi s chứa chữ số. A=1, B=2, ..., Z=26. Trả về số cách decode s thành chữ cái.",
      en: "Given a string s of digits. A=1, B=2, ..., Z=26. Return the number of ways to decode s into letters.",
    },
    defaultInput: "226",
    inputKind: "string",
    inputLabel: { vi: "s (chuỗi chữ số)", en: "s (digit string)" },
    extraParams: [
      { key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1", options: [
        { value: "1", label: { vi: "Cách 1: DP Array O(n)", en: "Approach 1: DP Array O(n)" } },
        { value: "2", label: { vi: "Cách 2: Rolling O(1) space", en: "Approach 2: Rolling O(1) space" } },
      ] },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n) / O(1)",
      note: {
        vi: "Cách 1: O(n) space (mảng dp). Cách 2: O(1) space (2 biến prev2, prev1).",
        en: "Approach 1: O(n) space (dp array). Approach 2: O(1) space (2 rolling vars).",
      },
    },
    code: [
      "class Solution:",
      "    def numDecodings(self, s):",
      "        n = len(s)",
      "        dp = [0] * (n + 1)",
      "        dp[0] = 1",
      "        for i in range(1, n + 1):",
      "            if s[i-1] != '0':",
      "                dp[i] += dp[i-1]",
      "            if i>=2 and 10<=int(s[i-2:i])<=26:",
      "                dp[i] += dp[i-2]",
      "        return dp[n]",
    ],
    code2: [
      "class Solution:",
      "    def numDecodings(self, s):",
      "        if s[0] == '0': return 0",
      "        prev2, prev1 = 1, 1",
      "        for i in range(1, len(s)):",
      "            cur = 0",
      "            if s[i] != '0':",
      "                cur += prev1",
      "            two = int(s[i-1:i+1])",
      "            if 10 <= two <= 26:",
      "                cur += prev2",
      "            prev2, prev1 = prev1, cur",
      "        return prev1",
    ],
    codeLabel: { vi: "Cách 1: DP Array O(n)", en: "Approach 1: DP Array O(n)" },
    code2Label: { vi: "Cách 2: Rolling O(1) space", en: "Approach 2: Rolling O(1) space" },
    builder: buildSteps91,
  },
  132: {
    id: 132,
    difficulty: "hard",
    slug: "palindrome-partitioning-ii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Palindrome Partitioning II", en: "Palindrome Partitioning II" },
    titleVi: { vi: "Số cắt tối thiểu (palindrome)", en: "Min cuts for palindrome partitioning" },
    statement: {
      vi: "Cho chuỗi s, trả về SỐ CẮT TỐI THIỂU để chia s thành các đoạn con đều là palindrome. Nhập chuỗi chữ thường.",
      en: "Given a string s, return the MINIMUM number of cuts so every substring in the partition is a palindrome. Enter a lowercase string.",
    },
    defaultInput: "aab",
    inputKind: "string",
    inputLabel: { vi: "Chuỗi s", en: "String s" },
    extraParams: [],
    approach: [
      { vi: "Tiền xử lý isPalin[i][j] = s[i..j] có phải palindrome không (DP 2D O(n²)).", en: "Precompute isPalin[i][j] = whether s[i..j] is a palindrome (2D DP O(n²))." },
      { vi: "dp[i] = số cắt tối thiểu cho s[0..i-1]. dp[0] = -1 (base). dp[i] = min(dp[j]+1) với mọi j mà s[j..i-1] palindrome.", en: "dp[i] = min cuts for s[0..i-1]. dp[0] = -1 (base). dp[i] = min(dp[j]+1) for all j where s[j..i-1] is a palindrome." },
      { vi: "Đáp án = dp[n].", en: "Answer = dp[n]." },
    ],
    complexity: { time: "O(n²)", space: "O(n²)", note: { vi: "n² cho isPalin + n² cho dp fill.", en: "n² for isPalin + n² for dp fill." } },
    code: [
      "class Solution:",
      "    def minCut(self, s):",
      "        n = len(s)",
      "        # Precompute isPalin[i][j]",
      "        isPalin = [[False]*n for _ in range(n)]",
      "        for i in range(n-1, -1, -1):",
      "            for j in range(i, n):",
      "                if s[i]==s[j] and (j-i<=2 or isPalin[i+1][j-1]):",
      "                    isPalin[i][j] = True",
      "        # DP",
      "        dp = list(range(-1, n))  # dp[0]=-1, dp[1]=0,...",
      "        for i in range(1, n+1):",
      "            for j in range(i):",
      "                if isPalin[j][i-1]:",
      "                    dp[i] = min(dp[i], dp[j] + 1)",
      "        return dp[n]",
    ],
    builder: buildSteps132,
  },
  139: {
    id: 139,
    difficulty: "medium",
    slug: "word-break",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Word Break", en: "Word Break" },
    titleVi: { vi: "Tách từ (DP trên chuỗi)", en: "Word break (string DP)" },
    statement: {
      vi: "Cho chuỗi s và từ điển wordDict. Trả về True nếu s có thể tách thành một hay nhiều từ trong wordDict (mỗi từ dùng nhiều lần được).",
      en: "Given a string s and a dictionary wordDict, return True if s can be segmented into one or more dictionary words (words may be reused).",
    },
    defaultInput: "leetcode",
    inputKind: "string",
    inputLabel: { vi: "s", en: "s" },
    extraParams: [
      { key: "wordDict", type: "string", label: { vi: "wordDict (phẩy ngăn)", en: "wordDict (comma separated)" }, default: "leet,code" },
    ],
    complexity: {
      time: "O(n² · L)",
      space: "O(n)",
      note: {
        vi: "Hai vòng lặp lồng O(n²), mỗi lần cắt chuỗi O(L). Bảng dp O(n).",
        en: "Two nested loops O(n²), each substring O(L). DP table O(n).",
      },
    },
    code: [
      "class Solution:",
      "    def wordBreak(self, s, wordDict):",
      "        n = len(s)",
      "        word_set = set(wordDict)",
      "        dp = [False] * (n + 1)",
      "        dp[0] = True",
      "        for i in range(1, n + 1):",
      "            for j in range(i):",
      "                if dp[j] and s[j:i] in word_set:",
      "                    dp[i] = True; break",
      "        return dp[n]",
    ],
    builder: buildSteps139,
  },
  279: {
    id: 279,
    difficulty: "medium",
    slug: "perfect-squares",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Perfect Squares", en: "Perfect Squares" },
    titleVi: { vi: "Số bình phương hoàn hảo ít nhất", en: "Least number of perfect squares" },
    statement: {
      vi: "Cho n, trả về số lượng bình phương hoàn hảo ít nhất có tổng bằng n. Ví dụ: 12 = 4+4+4 → 3.",
      en: "Given n, return the least number of perfect square numbers that sum to n. E.g. 12 = 4+4+4 → 3.",
    },
    defaultInput: [12],
    inputKind: "positive",
    inputLabel: { vi: "n", en: "n" },
    singleInput: true,
    maxInput: 50,
    extraParams: [],
    complexity: {
      time: "O(n√n)",
      space: "O(n)",
      note: {
        vi: "Với mỗi i từ 1..n, thử √n bình phương → O(n√n). Bảng dp O(n).",
        en: "For each i from 1..n, try √n squares → O(n√n). DP table O(n).",
      },
    },
    code: [
      "class Solution:",
      "    def numSquares(self, n):",
      "        dp = [float('inf')] * (n + 1)",
      "        dp[0] = 0",
      "        for i in range(1, n + 1):",
      "            j = 1",
      "            while j * j <= i:",
      "                dp[i] = min(dp[i], dp[i-j*j]+1)",
      "                j += 1",
      "        return dp[n]",
    ],
    builder: buildSteps279,
  },
  518: {
    id: 518,
    difficulty: "medium",
    slug: "coin-change-ii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Coin Change II", en: "Coin Change II" },
    titleVi: { vi: "Đổi xu II (đếm số cách)", en: "Coin change II (count combinations)" },
    statement: {
      vi: "Cho coins và amount. Trả về số cách (tổ hợp, không phải hoán vị) để tạo amount bằng các xu. Mỗi xu dùng không giới hạn.",
      en: "Given coins and an amount, return the number of combinations (not permutations) to make the amount. Each coin can be used unlimited times.",
    },
    defaultInput: [1, 2, 5],
    inputKind: "positive",
    inputLabel: { vi: "coins", en: "coins" },
    extraParams: [
      { key: "amount", label: { vi: "amount", en: "amount" }, default: 5 },
    ],
    complexity: {
      time: "O(amount × n)",
      space: "O(amount)",
      note: {
        vi: "Vòng ngoài n coins, vòng trong amount ô → O(amount × n). Bảng dp 1D O(amount).",
        en: "Outer loop n coins, inner loop amount cells → O(amount × n). 1D dp table O(amount).",
      },
    },
    code: [
      "class Solution:",
      "    def change(self, amount, coins):",
      "        dp = [0] * (amount + 1)",
      "        dp[0] = 1",
      "        for coin in coins:",
      "            for i in range(coin, amount + 1):",
      "                dp[i] += dp[i - coin]",
      "        return dp[amount]",
    ],
    builder: buildSteps518,
  },
  322: {
    id: 322,
    difficulty: "medium",
    slug: "coin-change",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Coin Change", en: "Coin Change" },
    titleVi: { vi: "Đổi xu (DP unbounded knapsack)", en: "Coin change (unbounded knapsack DP)" },
    statement: {
      vi: "Cho mảng coins (mệnh giá xu, dùng không giới hạn) và amount. Trả về số xu ít nhất để tạo amount. Nếu không được, trả -1.",
      en: "Given coins (denominations, unlimited supply) and an amount, return the fewest coins to make that amount. If impossible, return -1.",
    },
    defaultInput: [1, 5, 10, 25],
    inputKind: "positive",
    inputLabel: { vi: "coins (mệnh giá)", en: "coins (denominations)" },
    extraParams: [
      { key: "amount", label: { vi: "amount", en: "amount" }, default: 11 },
    ],
    complexity: {
      time: "O(amount × n)",
      space: "O(amount)",
      note: {
        vi: "Với mỗi amount từ 1..amount, thử n coin → O(amount × n). Bảng dp O(amount).",
        en: "For each amount 1..amount, try n coins → O(amount × n). DP table O(amount).",
      },
    },
    code: [
      "class Solution:",
      "    def coinChange(self, coins, amount):",
      "        dp = [float('inf')] * (amount + 1)",
      "        dp[0] = 0",
      "        for i in range(1, amount + 1):",
      "            for coin in coins:",
      "                if coin <= i:",
      "                    dp[i] = min(dp[i], dp[i-coin]+1)",
      "        return dp[amount] if dp[amount] != float('inf') else -1",
    ],
    builder: buildSteps322,
  },
  740: {
    id: 740,
    difficulty: "medium",
    slug: "delete-and-earn",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Delete and Earn", en: "Delete and Earn" },
    titleVi: { vi: "Xóa và kiếm điểm (House Robber biến thể)", en: "Delete and earn (House Robber variant)" },
    statement: {
      vi: "Cho mảng nums. Khi chọn nums[i], bạn kiếm nums[i] điểm và xóa mọi phần tử bằng nums[i]-1 và nums[i]+1. Trả về điểm tối đa.",
      en: "Given nums, when you pick nums[i], you earn nums[i] points and must delete every element equal to nums[i]-1 and nums[i]+1. Return the max points.",
    },
    defaultInput: [3, 4, 2],
    inputKind: "positive",
    extraParams: [],
    complexity: {
      time: "O(n + max)",
      space: "O(max)",
      note: {
        vi: "Xây earn[] O(n), DP trên earn[] O(max). Bộ nhớ O(max).",
        en: "Build earn[] in O(n), DP on earn[] in O(max). Memory O(max).",
      },
    },
    code: [
      "class Solution:",
      "    def deleteAndEarn(self, nums):",
      "        max_val = max(nums)",
      "        earn = [0] * (max_val + 1)",
      "        for num in nums:",
      "            earn[num] += num",
      "        dp = [0] * (max_val + 1)",
      "        dp[0] = earn[0]",
      "        dp[1] = max(earn[0], earn[1])",
      "        for i in range(2, max_val + 1):",
      "            dp[i] = max(dp[i-1], dp[i-2] + earn[i])",
      "        return dp[max_val]",
    ],
    approach: [
      {
        vi: "Chuyển mảng nums thành earn[] với earn[v] = v × count(v).",
        en: "Transform nums into earn[] where earn[v] = v × count(v).",
      },
      {
        vi: "Bài toán trở thành House Robber trên earn[]: chọn earn[i] nghĩa là bỏ i-1 và i+1.",
        en: "The problem becomes House Robber on earn[]: taking earn[i] means skipping i-1 and i+1.",
      },
      {
        vi: "Dùng dp[i] = max(dp[i-1], dp[i-2] + earn[i]) và trả về dp[max_val] .",
        en: "Use dp[i] = max(dp[i-1], dp[i-2] + earn[i]) and return dp[max_val].",
      },
    ],
    builder: buildSteps740,
  },
  2140: {
    id: 2140,
    difficulty: "medium",
    slug: "solving-questions-with-brainpower",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Solving Questions With Brainpower", en: "Solving Questions With Brainpower" },
    titleVi: { vi: "Giải câu hỏi với brainpower", en: "Solving questions with brainpower" },
    statement: {
      vi: "Cho questions[i] = [points_i, brainpower_i]. Giải câu i được points_i điểm nhưng phải bỏ qua brainpower_i câu ngay sau đó. Trả về số điểm tối đa.",
      en: "Given questions[i] = [points_i, brainpower_i]. Solving question i earns points_i but forces you to skip the next brainpower_i questions. Return the maximum points.",
    },
    defaultInput: "3,2;4,3;4,4;2,5",
    inputKind: "string",
    inputLabel: { vi: "questions (mỗi câu points,brainpower; cách nhau bởi ;)", en: "questions (points,brainpower pairs separated by ;)" },
    extraParams: [],
    approach: [
      {
        vi: "Duyệt ngược từ câu cuối: dp[i] = điểm tối đa nếu bắt đầu từ câu i. dp[n] = 0.",
        en: "Scan backward from the last question: dp[i] = best points starting at question i. dp[n] = 0.",
      },
      {
        vi: "Giải câu i thì nhảy tới câu i + brainpower_i + 1; bỏ câu i thì sang câu i + 1.",
        en: "Solving question i jumps to question i + brainpower_i + 1; skipping goes to question i + 1.",
      },
      {
        vi: "dp[i] = max(dp[i+1], points_i + dp[min(i + brainpower_i + 1, n)]); đáp án là dp[0].",
        en: "dp[i] = max(dp[i+1], points_i + dp[min(i + brainpower_i + 1, n)]); the answer is dp[0].",
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Mỗi câu hỏi được xử lý đúng một lần theo thứ tự ngược; mảng dp dài n+1.",
        en: "Each question is processed once in reverse order; the dp array has length n+1.",
      },
    },
    code: [
      "class Solution:",
      "    def mostPoints(self, questions):",
      "        n = len(questions)",
      "        dp = [0] * (n + 1)",
      "        for i in range(n - 1, -1, -1):",
      "            points, brainpower = questions[i]",
      "            skip = dp[i + 1]",
      "            solve = points + dp[min(i + brainpower + 1, n)]",
      "            dp[i] = max(skip, solve)",
      "        return dp[0]",
    ],
    builder: buildSteps2140,
  },
  276: {
    id: 276,
    difficulty: "medium",
    slug: "paint-fence",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Paint Fence", en: "Paint Fence" },
    titleVi: { vi: "Sơn hàng rào", en: "Paint fence" },
    statement: {
      vi: "Cho n cột rào và k màu. Sơn mỗi cột một màu sao cho không có nhiều hơn hai cột liền nhau cùng màu.",
      en: "Given n posts and k colors, paint each post so that no more than two adjacent posts have the same color.",
    },
    defaultInput: [3],
    inputKind: "positive",
    inputLabel: { vi: "n (posts)", en: "n (posts)" },
    singleInput: true,
    maxInput: 12,
    extraParams: [
      { key: "k", label: { vi: "k (colors)", en: "k (colors)" }, default: 3 },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Chỉ dùng hai biến same và diff để theo dõi số cách.", en: "Only two variables same and diff are needed." } },
    code: [
      "class Solution:",
      "    def numWays(self, n, k):",
      "        if n == 0: return 0",
      "        if n == 1: return k",
      "        same = k",
      "        diff = k * (k - 1)",
      "        for i in range(3, n + 1):",
      "            nextSame = diff",
      "            nextDiff = (same + diff) * (k - 1)",
      "            same = nextSame",
      "            diff = nextDiff",
      "        return same + diff",
    ],
    builder: buildSteps276,
  },
  1140: {
    id: 1140,
    difficulty: "medium",
    slug: "stone-game-ii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Stone Game II", en: "Stone Game II" },
    titleVi: { vi: "Trò chơi đá II", en: "Stone Game II (suffix + M DP)" },
    statement: {
      vi: "Cho mảng piles. Hai người chơi lần lượt lấy x đống đá từ đầu dãy, với 1 <= x <= 2M. Sau khi lấy x, M = max(M, x). Trả về số đá tối đa Alice có thể lấy được nếu cả hai chơi tối ưu.",
      en: "Given an array piles, two players take x piles from the front where 1 <= x <= 2M. After taking x, M becomes max(M, x). Return the maximum stones Alice can obtain with optimal play.",
    },
    defaultInput: [2, 7, 9, 4, 4],
    inputKind: "positive",
    inputLabel: { vi: "piles", en: "piles" },
    extraParams: [],
    approach: [
      {
        vi: "Dựng suffix[i] để biết tổng số đá còn lại từ đống i đến cuối.",
        en: "Build suffix[i] to know the total stones remaining from pile i onward.",
      },
      {
        vi: "dp[i][M] là số đá tối đa người đang tới lượt có thể đảm bảo khi bắt đầu tại i với giới hạn M.",
        en: "dp[i][M] is the maximum stones the current player can guarantee when starting at i with limit M.",
      },
      {
        vi: "Với mỗi X trong [1, 2M], phần người hiện tại nhận là suffix[i] - dp[i+X][max(M,X)]; chọn giá trị lớn nhất.",
        en: "For each X in [1, 2M], the current player gets suffix[i] - dp[i+X][max(M,X)]; keep the maximum.",
      },
    ],
    complexity: {
      time: "O(n^3)",
      space: "O(n^2)",
      note: {
        vi: "Có O(n^2) trạng thái dp[i][M], mỗi trạng thái thử tối đa 2M lựa chọn nên xấu nhất là O(n^3).",
        en: "There are O(n^2) dp[i][M] states, and each state tries up to 2M choices, giving worst-case O(n^3) time.",
      },
    },
    code: [
      "class Solution:",
      "    def stoneGameII(self, piles):",
      "        n = len(piles)",
      "        suffix = [0] * (n + 1)",
      "        for i in range(n - 1, -1, -1):",
      "            suffix[i] = suffix[i + 1] + piles[i]",
      "        dp = [[0] * (n + 1) for _ in range(n + 1)]",
      "        for i in range(n - 1, -1, -1):",
      "            for m in range(1, n + 1):",
      "                if 2 * m >= n - i:",
      "                    dp[i][m] = suffix[i]",
      "                else:",
      "                    best = 0",
      "                    for x in range(1, 2 * m + 1):",
      "                        best = max(best, suffix[i] - dp[i + x][max(m, x)])",
      "                    dp[i][m] = best",
      "        return dp[0][1]",
    ],
    builder: buildSteps1140,
  },
  877: {
    id: 877,
    difficulty: "medium",
    slug: "stone-game",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Stone Game", en: "Stone Game" },
    titleVi: { vi: "Trò chơi đá", en: "Stone Game" },
    statement: {
      vi: "Cho mảng piles có số lượng đá ở mỗi đống. Hai người chơi luân phiên lấy cả đống từ đầu hoặc cuối. Trả về true nếu Alice có thể thắng khi cả hai chơi tối ưu.",
      en: "Given an array piles of stone counts, two players take an entire pile from either the start or end on each turn. Return true if Alice can win with optimal play.",
    },
    defaultInput: [5, 3, 4, 5],
    inputKind: "positive",
    inputLabel: { vi: "piles", en: "piles" },
    extraParams: [],
    complexity: {
      time: "O(n²)",
      space: "O(n²)",
      note: {
        vi:
          "Bảng dp[i][j] kích thước n×n; mỗi ô O(1) → O(n²) thời gian và bộ nhớ.\n" +
          "Mẹo O(1): với số đống chẵn và tổng lẻ, Alice luôn thắng nên `return True` là đủ — nhưng ở đây ta trực quan hoá DP để hiểu bản chất.",
        en:
          "The dp[i][j] table has n×n cells; each is O(1) → O(n²) time and space.\n" +
          "O(1) trick: with an even number of piles and odd total, Alice always wins so `return True` suffices — but we visualize the DP here to understand the mechanics.",
      },
    },
    code: [
      "class Solution:",
      "    def stoneGame(self, piles):",
      "        n = len(piles)",
      "        # dp[i][j] = max score difference the current player",
      "        # can force on the subarray piles[i..j].",
      "        dp = [[0] * n for _ in range(n)]",
      "        for i in range(n):",
      "            dp[i][i] = piles[i]",
      "        for length in range(2, n + 1):",
      "            for i in range(n - length + 1):",
      "                j = i + length - 1",
      "                take_left  = piles[i] - dp[i + 1][j]",
      "                take_right = piles[j] - dp[i][j - 1]",
      "                dp[i][j] = max(take_left, take_right)",
      "        return dp[0][n - 1] > 0",
      "",
      "# O(1) trick: with n even and odd total, Alice always wins.",
      "#     return True",
    ],
    builder: buildSteps877,
  },
  1510: {
    id: 1510,
    difficulty: "hard",
    slug: "stone-game-iv",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Stone Game IV", en: "Stone Game IV" },
    titleVi: { vi: "Trò chơi đá IV (square DP)", en: "Stone Game IV (square DP)" },
    statement: {
      vi: "Có n viên đá. Hai người chơi luân phiên lấy đi một số viên là số chính phương khác 0 (1, 4, 9, ...). Người không thể đi sẽ thua. Trả về true nếu Alice thắng khi cả hai chơi tối ưu.",
      en: "There are n stones. Players alternate taking a non-zero square number of stones (1, 4, 9, ...). A player who cannot move loses. Return true if Alice wins with optimal play.",
    },
    defaultInput: [7],
    inputKind: "positive",
    inputLabel: { vi: "n", en: "n" },
    singleInput: true,
    maxInput: 60,
    extraParams: [],
    approach: [
      {
        vi: "dp[i] = True nếu người đang tới lượt có thể thắng khi còn i viên đá.",
        en: "dp[i] = True if the current player can win with i stones remaining.",
      },
      {
        vi: "Từ i, thử lấy từng số chính phương square <= i. Sau khi lấy, đối thủ nhận trạng thái i - square.",
        en: "From i, try each square <= i. After taking it, the opponent receives state i - square.",
      },
      {
        vi: "Nếu tồn tại square sao cho dp[i - square] == False, thì dp[i] = True vì ta đẩy đối thủ vào losing state.",
        en: "If any square has dp[i - square] == False, then dp[i] = True because we hand the opponent a losing state.",
      },
    ],
    complexity: {
      time: "O(n√n)",
      space: "O(n)",
      note: {
        vi: "Có n trạng thái; mỗi trạng thái thử tối đa √i số chính phương.",
        en: "There are n states; each state tries up to √i perfect squares.",
      },
    },
    code: [
      "class Solution:",
      "    def winnerSquareGame(self, n):",
      "        dp = [False] * (n + 1)",
      "        for i in range(1, n + 1):",
      "            move = 1",
      "            while move * move <= i:",
      "                square = move * move",
      "                if not dp[i - square]:",
      "                    dp[i] = True",
      "                    break",
      "                move += 1",
      "        return dp[n]",
    ],
    builder: buildSteps1510,
  },
  1406: {
    id: 1406,
    difficulty: "hard",
    slug: "stone-game-iii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Stone Game III", en: "Stone Game III" },
    titleVi: { vi: "Trò chơi đá III (suffix DP)", en: "Stone Game III (suffix DP)" },
    statement: {
      vi: "Cho mảng stones. Hai người chơi lần lượt lấy 1 đến 3 viên đá từ đầu mảng. Mỗi viên đá có điểm số tương ứng. Trả về Alice, Bob hoặc Tie tùy theo ai có tổng điểm cao hơn.",
      en: "Given an array stones, two players take 1 to 3 stones from the start of the array on each turn. Each stone has a score. Return Alice, Bob, or Tie depending on who ends with the higher total.",
    },
    defaultInput: [1, 2, 3, 7],
    inputKind: "integer",
    inputLabel: { vi: "stones", en: "stones" },
    extraParams: [],
    approach: [
      {
        vi: "dp[i] là lợi thế điểm lớn nhất của người sắp chơi trên suffix stones[i...]: điểm của mình trừ điểm của đối thủ.",
        en: "dp[i] is the largest score advantage for the player about to move on stones[i...]: current player's score minus the opponent's score.",
      },
      {
        vi: "Tại i, thử lấy 1, 2 hoặc 3 viên. Mỗi lựa chọn có candidate = tổng vừa lấy - dp[next].",
        en: "At i, try taking 1, 2, or 3 stones. Each choice has candidate = taken sum - dp[next].",
      },
      {
        vi: "Tính từ phải sang trái để dp[next] luôn có sẵn; dấu của dp[0] quyết định Alice, Bob hay Tie.",
        en: "Compute right to left so dp[next] is already known; the sign of dp[0] determines Alice, Bob, or Tie.",
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Mỗi vị trí i thử tối đa 3 lựa chọn, nên thời gian O(n). Dùng mảng dp kích thước n+1.",
        en: "Each index i tries at most 3 choices, so time is O(n). Uses a dp array of size n+1.",
      },
    },
    code: [
      "class Solution:",
      "    def stoneGameIII(self, stones):",
      "        n = len(stones)",
      "        dp = [0] * (n + 1)",
      "        for i in range(n - 1, -1, -1):",
      "            take = 0",
      "            dp[i] = float('-inf')",
      "            for k in range(3):",
      "                if i + k < n:",
      "                    take += stones[i + k]",
      "                    dp[i] = max(dp[i], take - dp[i + k + 1])",
      "        if dp[0] > 0: return 'Alice'",
      "        if dp[0] < 0: return 'Bob'",
      "        return 'Tie'",
    ],
    builder: buildSteps1406,
  },
  115: {
    id: 115,
    difficulty: "hard",
    slug: "distinct-subsequences",
    category: { key: "dp", vi: "Quy hoach dong", en: "Dynamic Programming" },
    title: { vi: "Distinct Subsequences", en: "Distinct Subsequences" },
    titleVi: { vi: "Dem so subsequence khac nhau", en: "Count distinct subsequences" },
    statement: {
      vi: "Cho hai chuoi s va t, dem so subsequence khac nhau cua s bang t.",
      en: "Given two strings s and t, count how many distinct subsequences of s equal t.",
    },
    defaultInput: "rabbbit",
    inputKind: "string",
    inputLabel: { vi: "s", en: "s" },
    extraParams: [
      {
        key: "t",
        type: "string",
        label: { vi: "t", en: "t" },
        default: "rabbit",
      },
    ],
    complexity: {
      time: "O(m*n)",
      space: "O(m*n)",
      note: {
        vi: "Duyet bang DP kich thuoc (m+1)*(n+1).",
        en: "Fill a DP table of size (m+1)*(n+1).",
      },
    },
    code: [
      "class Solution:",
      "    def numDistinct(self, s: str, t: str) -> int:",
      "        m, n = len(s), len(t)",
      "        dp = [[0] * (n + 1) for _ in range(m + 1)]",
      "        for i in range(m + 1):",
      "            dp[i][0] = 1",
      "        for i in range(1, m + 1):",
      "            for j in range(1, n + 1):",
      "                if s[i - 1] == t[j - 1]:",
      "                    dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j]",
      "                else:",
      "                    dp[i][j] = dp[i - 1][j]",
      "        return dp[m][n]",
    ],
    builder: buildSteps115,
  },
  1143: {
    id: 1143,
    difficulty: "medium",
    slug: "longest-common-subsequence",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Longest Common Subsequence", en: "Longest Common Subsequence" },
    titleVi: { vi: "Dãy con chung dài nhất", en: "Longest common subsequence" },
    statement: {
      vi:
        "Cho hai chuỗi text1 và text2, trả về độ dài dãy con chung dài nhất. " +
        "Dãy con là chuỗi thu được bằng cách xóa một số ký tự mà giữ nguyên thứ tự.",
      en:
        "Given two strings text1 and text2, return the length of their longest common subsequence. " +
        "A subsequence is a string derived by deleting some characters without changing the order.",
    },
    defaultInput: "abcde",
    inputKind: "string",
    inputLabel: { vi: "text1", en: "text1" },
    extraParams: [
      {
        key: "text2",
        type: "string",
        label: { vi: "text2", en: "text2" },
        default: "ace",
      },
    ],
    complexity: {
      time: "O(m·n)",
      space: "O(m·n)",
      note: {
        vi: "Hai vòng lặp lồng nhau duyệt bảng (m+1)×(n+1) nên O(m·n). Bảng dp cùng kích thước nên O(m·n) bộ nhớ.",
        en: "Two nested loops fill the (m+1)×(n+1) table, giving O(m·n) time and space.",
      },
    },
    code: [
      "class Solution:",
      "    def longestCommonSubsequence(self, text1, text2):",
      "        m, n = len(text1), len(text2)",
      "        dp = [[0]*(n+1) for _ in range(m+1)]",
      "        for i in range(1, m+1):",
      "            for j in range(1, n+1):",
      "                if text1[i-1] == text2[j-1]:",
      "                    dp[i][j] = dp[i-1][j-1] + 1",
      "                else:",
      "                    dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
      "        return dp[m][n]",
    ],
    builder: buildSteps1143,
  },
  1092: {
    id: 1092,
    difficulty: "hard",
    slug: "shortest-common-supersequence",
    category: { key: "dp", vi: "Quy hoach dong", en: "Dynamic Programming" },
    title: { vi: "Shortest Common Supersequence", en: "Shortest Common Supersequence" },
    titleVi: { vi: "Chuoi cha chung ngan nhat", en: "Shortest common supersequence" },
    statement: {
      vi: "Cho hai chuoi str1 va str2, tra ve chuoi ngan nhat co ca str1 va str2 la subsequence.",
      en: "Given two strings str1 and str2, return the shortest string that has both str1 and str2 as subsequences.",
    },
    defaultInput: "abac",
    inputKind: "string",
    inputLabel: { vi: "str1", en: "str1" },
    extraParams: [{ key: "str2", type: "string", label: { vi: "str2", en: "str2" }, default: "cab" }],
    approach: [
      { vi: "Tinh bang LCS dp[i][j] cho str1[:i] va str2[:j].", en: "Build the LCS table dp[i][j] for str1[:i] and str2[:j]." },
      { vi: "Traceback tu dp[m][n]: ky tu giong nhau thi them mot lan, khac nhau thi di theo huong LCS tot hon.", en: "Trace back from dp[m][n]: matching chars are appended once, otherwise follow the better LCS direction." },
      { vi: "res duoc tao nguoc, nen cuoi cung return reversed(res).", en: "res is built backward, so return reversed(res)." },
    ],
    complexity: {
      time: "O(m*n)",
      space: "O(m*n)",
      note: { vi: "Dien bang LCS kich thuoc (m+1) x (n+1), sau do traceback O(m+n).", en: "Fill an LCS table of size (m+1) x (n+1), then trace back in O(m+n)." },
    },
    code: [
      "class Solution:",
      "    def shortestCommonSupersequence(self, str1: str, str2: str) -> str:",
      "        m, n = len(str1), len(str2)",
      "        dp = [[0] * (n + 1) for _ in range(m + 1)]",
      "        for i in range(1, m + 1):",
      "            for j in range(1, n + 1):",
      "                if str1[i - 1] == str2[j - 1]:",
      "                    dp[i][j] = dp[i - 1][j - 1] + 1",
      "                else:",
      "                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])",
      "        i, j = m, n",
      "        res = []",
      "        while i > 0 and j > 0:",
      "            if str1[i - 1] == str2[j - 1]:",
      "                res.append(str1[i - 1]); i -= 1; j -= 1",
      "            elif dp[i - 1][j] >= dp[i][j - 1]:",
      "                res.append(str1[i - 1]); i -= 1",
      "            else:",
      "                res.append(str2[j - 1]); j -= 1",
      "        while i > 0:",
      "            res.append(str1[i - 1]); i -= 1",
      "        while j > 0:",
      "            res.append(str2[j - 1]); j -= 1",
      "        return ''.join(reversed(res))",
    ],
    builder: buildSteps1092,
  },
  583: {
    id: 583,
    difficulty: "medium",
    slug: "delete-operation-for-two-strings",
    category: { key: "dp", vi: "Quy hoach dong", en: "Dynamic Programming" },
    title: { vi: "Delete Operation for Two Strings", en: "Delete Operation for Two Strings" },
    titleVi: { vi: "Xoa ky tu de hai chuoi bang nhau", en: "Delete characters to make strings equal" },
    statement: {
      vi: "Cho hai chuoi word1 va word2. Moi buoc duoc xoa mot ky tu trong mot trong hai chuoi. Tra ve so buoc xoa it nhat de hai chuoi bang nhau.",
      en: "Given two strings word1 and word2. In one step you can delete one character in either string. Return the minimum number of deletions required to make the two strings equal.",
    },
    defaultInput: "sea",
    inputKind: "string",
    inputLabel: { vi: "word1", en: "word1" },
    extraParams: [{ key: "word2", type: "string", label: { vi: "word2", en: "word2" }, default: "eat" }],
    approach: [
      { vi: "dp[i][j] = so lan xoa it nhat de word1[:i] va word2[:j] bang nhau.", en: "dp[i][j] = minimum deletions needed to make word1[:i] and word2[:j] equal." },
      { vi: "Neu word1[i-1] == word2[j-1], giu ca hai: dp[i][j] = dp[i-1][j-1].", en: "If word1[i-1] == word2[j-1], keep both: dp[i][j] = dp[i-1][j-1]." },
      { vi: "Neu khac nhau, xoa tu mot chuoi: dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1]).", en: "If they differ, delete from one string: dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1])." },
    ],
    complexity: {
      time: "O(m*n)",
      space: "O(m*n)",
      note: { vi: "Dien bang (m+1) x (n+1).", en: "Fill a (m+1) x (n+1) table." },
    },
    code: [
      "class Solution:",
      "    def minDistance(self, word1: str, word2: str) -> int:",
      "        m, n = len(word1), len(word2)",
      "        dp = [[0] * (n + 1) for _ in range(m + 1)]",
      "        for i in range(m + 1):",
      "            dp[i][0] = i",
      "        for j in range(n + 1):",
      "            dp[0][j] = j",
      "        for i in range(1, m + 1):",
      "            for j in range(1, n + 1):",
      "                if word1[i - 1] == word2[j - 1]:",
      "                    dp[i][j] = dp[i - 1][j - 1]",
      "                else:",
      "                    dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1])",
      "        return dp[m][n]",
    ],
    builder: buildSteps583,
  },
  712: {
    id: 712,
    difficulty: "medium",
    slug: "minimum-ascii-delete-sum-for-two-strings",
    category: { key: "dp", vi: "Quy hoach dong", en: "Dynamic Programming" },
    title: { vi: "Minimum ASCII Delete Sum for Two Strings", en: "Minimum ASCII Delete Sum for Two Strings" },
    titleVi: { vi: "Tong ASCII xoa nho nhat", en: "Minimum ASCII delete sum" },
    statement: {
      vi: "Cho hai chuoi s1 va s2. Moi lan co the xoa mot ky tu, chi phi bang ma ASCII cua ky tu do. Tra ve tong chi phi xoa nho nhat de hai chuoi bang nhau.",
      en: "Given two strings s1 and s2. You can delete characters, paying the ASCII value of each deleted character. Return the minimum delete sum needed to make the strings equal.",
    },
    defaultInput: "sea",
    inputKind: "string",
    inputLabel: { vi: "s1", en: "s1" },
    extraParams: [{ key: "s2", type: "string", label: { vi: "s2", en: "s2" }, default: "eat" }],
    approach: [
      { vi: "dp[i][j] = tong ASCII xoa nho nhat de s1[:i] va s2[:j] bang nhau.", en: "dp[i][j] = minimum ASCII delete sum to make s1[:i] and s2[:j] equal." },
      { vi: "Neu ky tu bang nhau, giu ca hai: dp[i][j] = dp[i-1][j-1].", en: "If characters match, keep both: dp[i][j] = dp[i-1][j-1]." },
      { vi: "Neu khac nhau, xoa ky tu tu s1 hoac s2 va cong ASCII cost.", en: "If they differ, delete from s1 or s2 and add the ASCII cost." },
    ],
    complexity: {
      time: "O(m*n)",
      space: "O(m*n)",
      note: { vi: "Dien bang (m+1) x (n+1).", en: "Fill a (m+1) x (n+1) table." },
    },
    code: [
      "class Solution:",
      "    def minimumDeleteSum(self, s1: str, s2: str) -> int:",
      "        m, n = len(s1), len(s2)",
      "        dp = [[0] * (n + 1) for _ in range(m + 1)]",
      "        for i in range(1, m + 1):",
      "            dp[i][0] = dp[i - 1][0] + ord(s1[i - 1])",
      "        for j in range(1, n + 1):",
      "            dp[0][j] = dp[0][j - 1] + ord(s2[j - 1])",
      "        for i in range(1, m + 1):",
      "            for j in range(1, n + 1):",
      "                if s1[i - 1] == s2[j - 1]:",
      "                    dp[i][j] = dp[i - 1][j - 1]",
      "                else:",
      "                    dp[i][j] = min(",
      "                        ord(s1[i - 1]) + dp[i - 1][j],",
      "                        ord(s2[j - 1]) + dp[i][j - 1]",
      "                    )",
      "        return dp[m][n]",
    ],
    builder: buildSteps712,
  },
  213: {
    id: 213,
    difficulty: "medium",
    slug: "house-robber-ii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "House Robber II", en: "House Robber II" },
    titleVi: { vi: "Tên cướp nhà II (vòng tròn)", en: "House robber II (circular)" },
    statement: {
      vi:
        "Giống bài House Robber, nhưng các nhà xếp thành vòng tròn " +
        "(nhà đầu và nhà cuối liền kề nhau). " +
        "Không được cướp hai nhà liền kề. Trả về số tiền lớn nhất có thể.",
      en:
        "Same as House Robber, but the houses are arranged in a circle " +
        "(the first and last house are adjacent). " +
        "You cannot rob two adjacent houses. Return the maximum amount you can rob.",
    },
    defaultInput: [2, 3, 2],
    inputKind: "nonneg",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Chạy House-Robber hai lần (mỗi lần O(n)) nên tổng vẫn O(n). Bộ nhớ O(n) cho dp (có thể O(1)).",
        en: "Run House-Robber twice (each O(n)), total is still O(n). O(n) memory for dp (optimizable to O(1)).",
      },
    },
    code: [
      "class Solution:",
      "    def rob(self, nums):",
      "        if len(nums) == 1:",
      "            return nums[0]",
      "        return max(self._rob(nums[:-1]),",
      "                   self._rob(nums[1:]))",
      "    def _rob(self, nums):",
      "        dp = [0] * len(nums)",
      "        dp[0] = nums[0]",
      "        dp[1] = max(nums[0], nums[1])",
      "        for i in range(2, len(nums)):",
      "            dp[i] = max(dp[i-1], dp[i-2]+nums[i])",
      "        return dp[-1]",
    ],
    builder: buildSteps213,
  },
  198: {
    id: 198,
    difficulty: "medium",
    slug: "house-robber",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "House Robber", en: "House Robber" },
    titleVi: { vi: "Tên cướp nhà", en: "House robber" },
    statement: {
      vi:
        "Cho mảng nums[i] là số tiền trong nhà i, các nhà sắp dọc một đường. " +
        "Nếu cướp hai nhà liền kề thì bị phát hiện. " +
        "Trả về số tiền lớn nhất có thể cướp mà không bị phát hiện.",
      en:
        "Given an array nums[i] representing the amount of money in house i, houses are along a street. " +
        "Robbing two adjacent houses triggers an alarm. " +
        "Return the maximum amount you can rob without alerting the police.",
    },
    defaultInput: [2, 7, 9, 3, 1],
    inputKind: "nonneg",
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Chọn Approach", en: "Select Approach" },
        default: 1,
        options: [
          { value: 1, label: { vi: "DP Array O(n) — dp[i] = tiền tối đa tới nhà i", en: "DP Array O(n) — dp[i] = max loot up to house i" } },
          { value: 2, label: { vi: "Tối ưu O(1) — 2 biến prev_rob & max_rob", en: "Optimized O(1) — 2 vars prev_rob & max_rob" } },
        ],
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n) / O(1)",
      note: {
        vi: "Cách 1: O(n) thời gian + O(n) bộ nhớ (bảng dp). Cách 2: O(n) thời gian + O(1) bộ nhớ (2 biến prev_rob, max_rob).",
        en: "Approach 1: O(n) time + O(n) memory (dp table). Approach 2: O(n) time + O(1) memory (2 variables prev_rob, max_rob).",
      },
    },
    code: [
      "class Solution:",
      "    def rob(self, nums):",
      "        n = len(nums)",
      "        if n == 1:",
      "            return nums[0]",
      "        dp = [0] * len(nums)",
      "        dp[0] = nums[0]",
      "        dp[1] = max(nums[0], nums[1])",
      "        for i in range(2, len(nums)):",
      "            dp[i] = max(dp[i-1], dp[i-2] + nums[i])",
      "        return dp[n-1]",
    ],
    code2: [
      "# Optimized O(1) space",
      "class Solution:",
      "    def rob(self, nums: List[int]) -> int:",
      "        prev_rob, max_rob = 0, 0",
      "        for current in nums:",
      "            temp = max(max_rob, prev_rob + current)",
      "            prev_rob, max_rob = max_rob, temp",
      "        return max_rob",
    ],
    codeLabel: { vi: "Cách 1: DP Array O(n) space", en: "Approach 1: DP Array O(n) space" },
    code2Label: { vi: "Cách 2: Tối ưu O(1) space", en: "Approach 2: Optimized O(1) space" },
    builder: buildSteps198,
  },
  53: {
    id: 53,
    difficulty: "medium",
    slug: "maximum-subarray",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [{ key: "kadane", vi: "Kadane", en: "Kadane" }],
    title: { vi: "Maximum Subarray", en: "Maximum Subarray" },
    titleVi: { vi: "Dãy con liên tiếp có tổng lớn nhất", en: "Maximum contiguous subarray sum" },
    statement: {
      vi: "Cho mảng số nguyên nums, tìm dãy con liên tiếp (gồm ít nhất một phần tử) có tổng lớn nhất và trả về tổng đó.",
      en: "Given an integer array nums, find the contiguous subarray (containing at least one element) with the largest sum and return its sum.",
    },
    defaultInput: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
    inputKind: "integer", // cho phép số âm
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Chọn Approach", en: "Select Approach" },
        default: 2,
        options: [
          { value: 2, label: { vi: "DP Array O(n)", en: "DP Array O(n)" } },
          { value: 1, label: { vi: "Kadane O(1) space", en: "Kadane O(1) space" } },
        ],
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n) / O(1)",
      note: {
        vi: "Approach 1 (mặc định): DP array O(n) time, O(n) space. Approach 2: Kadane O(n) time, O(1) space.",
        en: "Approach 1 (default): DP array O(n) time, O(n) space. Approach 2: Kadane O(n) time, O(1) space.",
      },
    },
    code: [
      "class Solution:",
      "    def maxSubArray(self, nums: List[int]) -> int:",
      "        n = len(nums)",
      "        dp = [0] * n",
      "        dp[0] = nums[0]",
      "        max_sum = dp[0]",
      "        for i in range(1, n):",
      "            dp[i] = max(dp[i-1] + nums[i], nums[i])",
      "            max_sum = max(dp[i], max_sum)",
      "        return max_sum",
    ],
    code2: [
      "# Kadane O(1) space",
      "class Solution:",
      "    def maxSubArray(self, nums):",
      "        cur = nums[0]",
      "        best = nums[0]",
      "        for i in range(1, len(nums)):",
      "            cur = max(nums[i], cur + nums[i])",
      "            best = max(best, cur)",
      "        return best",
    ],
    codeLabel: { vi: "Cách 1: DP Array O(n) space", en: "Approach 1: DP Array O(n) space" },
    code2Label: { vi: "Cách 2: Kadane O(1) space", en: "Approach 2: Kadane O(1) space" },
    builder: buildSteps53,
  },
  918: {
    id: 918,
    difficulty: "medium",
    slug: "maximum-sum-circular-subarray",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [{ key: "kadane", vi: "Kadane", en: "Kadane" }],
    title: { vi: "Maximum Sum Circular Subarray", en: "Maximum Sum Circular Subarray" },
    titleVi: { vi: "Dãy con vòng tròn có tổng lớn nhất", en: "Maximum-sum circular contiguous subarray" },
    statement: {
      vi: "Cho mảng số nguyên dạng vòng tròn nums, trả về tổng lớn nhất của một dãy con không rỗng. Dãy con có thể nối từ cuối mảng về đầu mảng, nhưng mỗi phần tử chỉ được dùng tối đa một lần.",
      en: "Given a circular integer array nums, return the maximum possible sum of a non-empty subarray. The subarray may wrap from the end to the beginning, but each element can be used at most once.",
    },
    defaultInput: [5, -3, 5],
    inputKind: "integer",
    extraParams: [],
    approach: [
      { vi: "Chạy Kadane MAX để tìm đáp án bình thường không qua điểm nối cuối → đầu.", en: "Run MAX Kadane for the ordinary answer that does not cross the end-to-start seam." },
      { vi: "Chạy Kadane MIN để tìm đoạn cần loại; phần bù ở hai đầu có tổng total - min_sum.", en: "Run MIN Kadane to find the segment to exclude; the two edge pieces sum to total - min_sum." },
      { vi: "Nếu toàn số âm, phần bù của cả mảng là rỗng nên phải trả về max_sum thay vì 0.", en: "If every value is negative, excluding the whole array creates an illegal empty subarray, so return max_sum instead of 0." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Một lần quét cập nhật đồng thời tổng, Kadane lớn nhất và Kadane nhỏ nhất; chỉ dùng số biến cố định.",
        en: "One scan updates the total, maximum Kadane state, and minimum Kadane state using only constant extra variables.",
      },
    },
    code: [
      "class Solution:",
      "    def maxSubarraySumCircular(self, nums):",
      "        total = cur_max = max_sum = nums[0]",
      "        cur_min = min_sum = nums[0]",
      "        for i in range(1, len(nums)):",
      "            x = nums[i]",
      "            cur_max = max(x, cur_max + x)",
      "            max_sum = max(max_sum, cur_max)",
      "            cur_min = min(x, cur_min + x)",
      "            min_sum = min(min_sum, cur_min)",
      "            total += x",
      "        if max_sum < 0:",
      "            return max_sum",
      "        circular_sum = total - min_sum",
      "        return max(max_sum, circular_sum)",
    ],
    builder: buildSteps918,
  },
  1749: {
    id: 1749,
    difficulty: "medium",
    slug: "maximum-absolute-sum-of-any-subarray",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [{ key: "kadane", vi: "Kadane", en: "Kadane" }],
    title: { vi: "Maximum Absolute Sum of Any Subarray", en: "Maximum Absolute Sum of Any Subarray" },
    titleVi: { vi: "Trị tuyệt đối lớn nhất của tổng dãy con", en: "Maximum absolute subarray sum" },
    statement: {
      vi: "Cho mảng số nguyên nums. Trả về trị tuyệt đối lớn nhất của tổng một dãy con liên tiếp; dãy con rỗng có tổng 0 cũng được phép.",
      en: "Given an integer array nums, return the maximum absolute value of the sum of a contiguous subarray; the empty subarray with sum 0 is also allowed.",
    },
    defaultInput: [2, -5, 1, -4, 3, -2],
    inputKind: "integer",
    extraParams: [],
    approach: [
      { vi: "Chạy hai Kadane song song: max_ending tìm tổng dương lớn nhất kết thúc tại i, min_ending tìm tổng âm nhỏ nhất kết thúc tại i.", en: "Run two Kadane lanes: max_ending finds the largest positive sum ending at i, while min_ending finds the smallest negative sum ending at i." },
      { vi: "Baseline 0 biểu diễn subarray rỗng: max_ending = max(0, max_ending + x), min_ending = min(0, min_ending + x).", en: "The zero baseline represents the empty subarray: max_ending = max(0, max_ending + x), min_ending = min(0, min_ending + x)." },
      { vi: "Đáp án là max(max_sum, abs(min_sum)); lưu range của cả hai phía để chỉ ra dãy con thắng.", en: "The answer is max(max_sum, abs(min_sum)); track both ranges to identify the winning subarray." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt nums một lần và chỉ giữ bốn trạng thái tổng; range bổ sung cũng chỉ dùng số biến cố định.",
        en: "Scan nums once while keeping four sum states; range tracking also uses only constant extra variables.",
      },
    },
    code: [
      "class Solution:",
      "    def maxAbsoluteSum(self, nums):",
      "        max_ending = min_ending = 0",
      "        max_sum = min_sum = 0",
      "        for i, x in enumerate(nums):",
      "            max_ending = max(0, max_ending + x)",
      "            max_sum = max(max_sum, max_ending)",
      "            min_ending = min(0, min_ending + x)",
      "            min_sum = min(min_sum, min_ending)",
      "        return max(max_sum, -min_sum)",
    ],
    builder: buildSteps1749,
  },
  4027: {
    id: 4027,
    difficulty: "hard",
    slug: "elevator-requests-iii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Elevator Requests III", en: "Elevator Requests III" },
    titleVi: { vi: "Yêu cầu thang máy III", en: "Elevator Requests III" },
    statement: {
      vi: "Tòa nhà có n tầng đánh số 0..n-1. Thang máy bắt đầu ở tầng start lúc t=0. Mỗi request [arrival, floor] chỉ được phục vụ từ thời điểm arrival trở đi và được hoàn thành ngay khi thang máy có mặt tại floor. Mỗi giây thang máy đi lên, đi xuống một tầng hoặc đứng yên. Tìm thời gian nhỏ nhất để phục vụ tất cả request.",
      en: "A building has floors 0..n-1. The elevator starts at floor start at time 0. Each request [arrival, floor] can only be served at or after arrival and is completed instantly whenever the elevator is on floor. Each second the elevator moves one floor up or down, or waits. Return the minimum time needed to serve every request.",
    },
    defaultInput: [9, 0],
    inputKind: "nonneg",
    inputLabel: { vi: "n, start — số tầng và tầng bắt đầu", en: "n, start — floor count and starting floor" },
    extraParams: [
      {
        key: "requests",
        type: "string",
        label: { vi: "requests — arrival,floor;... hoặc JSON", en: "requests — arrival,floor;... or JSON" },
        default: "0,8;6,5",
      },
    ],
    approach: [
      { vi: "Vì chỉ có tối đa 16 request, dùng bitmask: bit i = 1 nghĩa là request i đã được phục vụ.", en: "There are at most 16 requests, so use a bitmask where bit i = 1 means request i has been served." },
      { vi: "dp[mask][last] là thời gian sớm nhất phục vụ toàn bộ mask và kết thúc tại request last.", en: "dp[mask][last] is the earliest time that serves mask and ends at request last." },
      { vi: "Chuyển tới next tại thời gian max(dp + khoảng cách tầng, arrival[next]); phép max biểu diễn việc phải chờ nếu tới quá sớm.", en: "Transition to next at max(dp + floor distance, arrival[next]); the max accounts for waiting when the elevator arrives early." },
      { vi: "Lưu parent cho mỗi state để dựng lại thứ tự phục vụ tối ưu.", en: "Store a parent for every state to reconstruct the optimal service order." },
    ],
    complexity: {
      time: "O(2^m · m²)",
      space: "O(2^m · m)",
      note: {
        vi: "m là số request (m ≤ 16). Có 2^m mask, m vị trí cuối và tối đa m transition cho mỗi state.",
        en: "m is the request count (m ≤ 16). There are 2^m masks, m possible final requests, and up to m transitions per state.",
      },
    },
    code: [
      "class Solution:",
      "    def elevatorRequests(self, n, start, requests):",
      "        m = len(requests)",
      "        inf = float('inf')",
      "        dp = [[inf] * m for _ in range(1 << m)]",
      "        parent = [[-1] * m for _ in range(1 << m)]",
      "        for i, (arrival, floor) in enumerate(requests):",
      "            dp[1 << i][i] = max(abs(start - floor), arrival)",
      "        for mask in range(1 << m):",
      "            for last in range(m):",
      "                if dp[mask][last] == inf: continue",
      "                for nxt, (arrival, floor) in enumerate(requests):",
      "                    if mask >> nxt & 1: continue",
      "                    travel = abs(requests[last][1] - floor)",
      "                    time = max(dp[mask][last] + travel, arrival)",
      "                    new_mask = mask | (1 << nxt)",
      "                    if time < dp[new_mask][nxt]:",
      "                        dp[new_mask][nxt] = time",
      "                        parent[new_mask][nxt] = last",
      "        full = (1 << m) - 1",
      "        best_last = min(range(m), key=lambda i: dp[full][i])",
      "        return dp[full][best_last]",
    ],
    liveArgs: (input, params = {}) => [input[0], input[1], parseRequests4027(params.requests)],
    builder: buildSteps4027,
  },
  746: {
    id: 746,
    difficulty: "easy",
    slug: "min-cost-climbing-stairs",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Min Cost Climbing Stairs", en: "Min Cost Climbing Stairs" },
    titleVi: { vi: "Chi phí leo cầu thang nhỏ nhất", en: "Minimum cost to climb stairs" },
    statement: {
      vi: "Cho mảng cost, cost[i] là chi phí của bậc i. Sau khi trả phí, bạn có thể leo 1 hoặc 2 bậc. Bắt đầu từ bậc 0 hoặc 1. Trả về chi phí nhỏ nhất để lên tới đỉnh cầu thang.",
      en: "Given an array cost where cost[i] is the cost of step i. After paying, you may climb 1 or 2 steps. Start from step 0 or 1. Return the minimum cost to reach the top.",
    },
    defaultInput: [1, 100, 1, 1, 1, 100, 1, 1, 100, 1],
    inputKind: "nonneg",
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Chọn Approach", en: "Select Approach" },
        default: 1,
        options: [
          { value: 1, label: { vi: "DP Array O(n) — dp[i] = chi phí tới bậc i", en: "DP Array O(n) — dp[i] = cost to reach step i" } },
          { value: 2, label: { vi: "Optimized O(1) — chỉ 2 biến", en: "Optimized O(1) — only 2 variables" } },
        ],
      },
    ],
    approach: [
      { vi: "Có 2 cách hiểu dp: dp[i] = chi phí tới bậc i (cách 1) hoặc dp[i] = chi phí đứng trên bậc i (cách 2).", en: "Two interpretations: dp[i] = cost to REACH step i (approach 1) or dp[i] = cost to STAND ON step i (approach 2)." },
      { vi: "Cách 1: dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2]). Đáp án = dp[n].", en: "Approach 1: dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2]). Answer = dp[n]." },
      { vi: "Cách 2 (tối ưu): chỉ cần 2 biến prev2, prev1. curr = cost[i] + min(prev1, prev2), rồi dời pointers.", en: "Approach 2 (optimized): only need 2 vars prev2, prev1. curr = cost[i] + min(prev1, prev2), then shift pointers." },
      { vi: "Cách 2 đáp án = min(prev1, prev2) — nhảy tới đỉnh từ bậc n-1 hoặc n-2.", en: "Approach 2 answer = min(prev1, prev2) — jump to top from step n-1 or n-2." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n) / O(1)",
      note: {
        vi: "Approach 1: O(n) time, O(n) space (bảng dp). Approach 2: O(n) time, O(1) space (2 biến).",
        en: "Approach 1: O(n) time, O(n) space (dp table). Approach 2: O(n) time, O(1) space (2 variables).",
      },
    },
    code: [
      "class Solution:",
      "    def minCostClimbingStairs(self, cost):",
      "        n = len(cost)",
      "        dp = [0] * (n + 1)",
      "        for i in range(2, n + 1):",
      "            dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2])",
      "        return dp[n]",
    ],
    code2: [
      "# Optimized O(1) space",
      "class Solution:",
      "    def minCostClimbingStairs(self, cost: List[int]) -> int:",
      "        prev2 = cost[0]",
      "        prev1 = cost[1]",
      "        for i in range(2, len(cost)):",
      "            curr = cost[i] + min(prev1, prev2)",
      "            prev2 = prev1",
      "            prev1 = curr",
      "        return min(prev1, prev2)",
    ],
    codeLabel: { vi: "Cách 1: DP Array O(n) space", en: "Approach 1: DP Array O(n) space" },
    code2Label: { vi: "Cách 2: Tối ưu O(1) space", en: "Approach 2: Optimized O(1) space" },
    builder: buildSteps746,
  },
  152: {
    id: 152,
    difficulty: "medium",
    slug: "maximum-product-subarray",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [{ key: "kadane", vi: "Kadane", en: "Kadane" }],
    title: { vi: "Maximum Product Subarray", en: "Maximum Product Subarray" },
    titleVi: { vi: "Tích lớn nhất của dãy con liên tiếp", en: "Largest product of a contiguous subarray" },
    statement: {
      vi: "Cho mảng số nguyên nums, tìm một dãy con liên tiếp (chứa ít nhất một số) có tích lớn nhất, và trả về tích đó. Mảng có thể chứa số âm và số 0.",
      en: "Given an integer array nums, find a contiguous subarray (containing at least one number) that has the largest product, and return that product. The array may contain negative numbers and zeros.",
    },
    defaultInput: [2, 3, -2, 4],
    inputKind: "integer", // số nguyên bất kỳ (cho phép âm và 0)
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Cách giải", en: "Approach" },
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Swap khi gặp số âm", en: "Approach 1: Swap on negative" } },
          { value: "2", label: { vi: "Cách 2: So 3 ứng viên", en: "Approach 2: Three candidates" } },
          { value: "3", label: { vi: "Cách 3: Bảng DP O(n)", en: "Approach 3: DP tables O(n)" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1 hoán đổi cur_max và cur_min khi x < 0, vì nhân số âm đảo thứ tự lớn/nhỏ.", en: "Approach 1 swaps cur_max and cur_min when x < 0, because multiplying by a negative reverses the order." },
      { vi: "Cách 2 so trực tiếp ba ứng viên (n, max_prev×n, min_prev×n); tính tuple trước khi gán nên không cần swap và tránh lỗi ghi đè max_prev.", en: "Approach 2 compares the three candidates (n, max_prev×n, min_prev×n); computing the tuple before assigning avoids the swap and the classic overwrite bug." },
      { vi: "Cách 3 viết cùng công thức truy hồi thành bảng max_dp/min_dp để thấy rõ đây là DP, đáp án là max(max_dp).", en: "Approach 3 writes the same recurrence as max_dp/min_dp tables to expose the DP structure; the answer is max(max_dp)." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1) / O(n)",
      note: {
        vi: "Cả ba cách đều O(n) thời gian. Cách 1 và 2 dùng O(1) bộ nhớ; cách 3 dùng O(n) vì lưu hai bảng DP.",
        en: "All three approaches run in O(n) time. Approaches 1 and 2 use O(1) memory; approach 3 uses O(n) for the two DP tables.",
      },
    },
    codeLabel: { vi: "Cách 1: Swap khi gặp số âm · O(1)", en: "Approach 1: Swap on negative · O(1)" },
    code2Label: { vi: "Cách 2: So 3 ứng viên · O(1)", en: "Approach 2: Three candidates · O(1)" },
    code3Label: { vi: "Cách 3: Bảng DP max_dp/min_dp · O(n)", en: "Approach 3: max_dp/min_dp tables · O(n)" },
    code: [
      "class Solution:",
      "    def maxProduct(self, nums):",
      "        cur_max = cur_min = result = nums[0]",
      "        for i in range(1, len(nums)):",
      "            x = nums[i]",
      "            if x < 0:",
      "                cur_max, cur_min = cur_min, cur_max",
      "            cur_max = max(x, cur_max * x)",
      "            cur_min = min(x, cur_min * x)",
      "            result = max(result, cur_max)",
      "        return result",
    ],
    code2: [
      "class Solution:",
      "    def maxProduct(self, nums: List[int]) -> int:",
      "        max_prev = min_prev = ans = nums[0]",
      "        for i in range(1, len(nums)):",
      "            n = nums[i]",
      "            candidates = (n, max_prev * n, min_prev * n)",
      "            max_curr = max(candidates)",
      "            min_curr = min(candidates)",
      "            max_prev, min_prev = max_curr, min_curr",
      "            ans = max(ans, max_curr)",
      "        return ans",
    ],
    code3: [
      "class Solution:",
      "    def maxProduct(self, nums: List[int]) -> int:",
      "        n = len(nums)",
      "        max_dp = [0] * n",
      "        min_dp = [0] * n",
      "        max_dp[0] = min_dp[0] = nums[0]",
      "        for i in range(1, n):",
      "            x = nums[i]",
      "            max_dp[i] = max(x, max_dp[i-1] * x, min_dp[i-1] * x)",
      "            min_dp[i] = min(x, max_dp[i-1] * x, min_dp[i-1] * x)",
      "        return max(max_dp)",
    ],
    builder: buildSteps152,
  },
  70: {
    id: 70,
    difficulty: "easy",
    slug: "climbing-stairs",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Climbing Stairs", en: "Climbing Stairs" },
    titleVi: { vi: "Leo cầu thang", en: "Climbing stairs" },
    statement: {
      vi: "Bạn đang leo một cầu thang có n bậc để lên đỉnh. Mỗi lần bạn được leo 1 hoặc 2 bậc. Hỏi có bao nhiêu cách khác nhau để leo lên tới đỉnh?",
      en: "You are climbing a staircase. It takes n steps to reach the top. Each time you can climb either 1 or 2 steps. In how many distinct ways can you climb to the top?",
    },
    defaultInput: [5],
    inputKind: "positive",
    inputLabel: { vi: "n (số bậc thang)", en: "n (number of steps)" },
    singleInput: true,
    maxInput: 45,
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Chọn Approach", en: "Select Approach" },
        default: 1,
        options: [
          { value: 1, label: { vi: "1 — DP Array O(n)", en: "1 — DP Array O(n)" } },
          { value: 2, label: { vi: "2 — Optimized O(1) space", en: "2 — Optimized O(1) space" } },
        ],
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n) / O(1)",
      note: {
        vi: "Approach 1: O(n) time, O(n) space (bảng dp). Approach 2: O(n) time, O(1) space (2 biến).",
        en: "Approach 1: O(n) time, O(n) space (dp table). Approach 2: O(n) time, O(1) space (2 variables).",
      },
    },
    code: [
      "class Solution:",
      "    def climbStairs(self, n):",
      "        dp = [0] * (n + 1)",
      "        dp[0] = 1",
      "        dp[1] = 1",
      "        for i in range(2, n + 1):",
      "            dp[i] = dp[i-1] + dp[i-2]",
      "        return dp[n]",
    ],
    code2: [
      "# Optimized O(1) space",
      "class Solution:",
      "    def climbStairs(self, n: int) -> int:",
      "        if n <= 2:",
      "            return n",
      "        prev2, prev1 = 1, 2",
      "        for i in range(3, n + 1):",
      "            curr = prev1 + prev2",
      "            prev2 = prev1",
      "            prev1 = curr",
      "        return prev1",
    ],
    codeLabel: { vi: "Cách 1: DP Array O(n) space", en: "Approach 1: DP Array O(n) space" },
    code2Label: { vi: "Cách 2: Tối ưu O(1) space", en: "Approach 2: Optimized O(1) space" },
    builder: buildSteps70,
  },
  300: {
    id: 300,
    difficulty: "medium",
    slug: "longest-increasing-subsequence",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Longest Increasing Subsequence", en: "Longest Increasing Subsequence" },
    titleVi: { vi: "Dãy con tăng dài nhất", en: "Longest increasing subsequence" },
    statement: {
      vi: "Cho mảng số nguyên nums, trả về độ dài của dãy con tăng nghiêm ngặt dài nhất. Dãy con được tạo bằng cách xóa một số phần tử (có thể không xóa) mà giữ nguyên thứ tự các phần tử còn lại.",
      en: "Given an integer array nums, return the length of the longest strictly increasing subsequence. A subsequence is derived by deleting some or no elements without changing the order of the remaining elements.",
    },
    defaultInput: [10, 9, 2, 5, 3, 7, 101, 18],
    inputKind: "integer",
    extraParams: [
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: DP O(n²)", en: "Approach 1: DP O(n²)" } },
          { value: "2", label: { vi: "Cách 2: Patience Sort O(n log n)", en: "Approach 2: Patience Sort O(n log n)" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1 (O(n²)): dp[i] = độ dài LIS kết thúc tại i. dp[i] = 1 + max(dp[j]) với j<i và nums[j]<nums[i].", en: "Approach 1 (O(n²)): dp[i] = LIS length ending at i. dp[i] = 1 + max(dp[j]) for j<i and nums[j]<nums[i]." },
      { vi: "Cách 2 (O(n log n)): Patience Sorting. Duy trì tails[]: tails[k] = đuôi nhỏ nhất của mọi IS dài k+1. Binary search để tìm vị trí chèn.", en: "Approach 2 (O(n log n)): Patience Sorting. Maintain tails[]: tails[k] = smallest tail of any IS of length k+1. Binary search to find insertion position." },
    ],
    complexity: {
      time: "O(n²) / O(n log n)",
      space: "O(n)",
      note: {
        vi: "Cách 1: 2 vòng lặp lồng → O(n²). Cách 2: Patience Sorting với binary search → O(n log n).",
        en: "Approach 1: two nested loops → O(n²). Approach 2: Patience Sorting with binary search → O(n log n).",
      },
    },
    code: [
      "class Solution:",
      "    def lengthOfLIS(self, nums):",
      "        n = len(nums)",
      "        dp = [1] * n",
      "        for i in range(1, n):",
      "            for j in range(i):",
      "                if nums[j] < nums[i]:",
      "                    dp[i] = max(dp[i], dp[j] + 1)",
      "        return max(dp)",
    ],
    code2: [
      "from bisect import bisect_left",
      "",
      "class Solution:",
      "    def lengthOfLIS(self, nums):",
      "        tails = []",
      "        for num in nums:",
      "            i = bisect_left(tails, num)",
      "            if i == len(tails):",
      "                tails.append(num)",
      "            else:",
      "                tails[i] = num",
      "        return len(tails)",
    ],
    codeLabel: { vi: "Cách 1: DP O(n²)", en: "Approach 1: DP O(n²)" },
    code2Label: { vi: "Cách 2: Binary Search O(n log n)", en: "Approach 2: Binary Search O(n log n)" },
    builder: buildSteps300,
  },
  509: {
    id: 509,
    difficulty: "easy",
    slug: "fibonacci-number",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Fibonacci Number", en: "Fibonacci Number" },
    titleVi: { vi: "Số Fibonacci", en: "Fibonacci number" },
    statement: {
      vi: "Dãy Fibonacci F(n) được định nghĩa: F(0) = 0, F(1) = 1, và F(n) = F(n-1) + F(n-2) với n > 1. Cho n, trả về F(n).",
      en: "The Fibonacci numbers F(n) are defined as: F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2) for n > 1. Given n, return F(n).",
    },
    defaultInput: [10],
    inputKind: "nonneg",
    inputLabel: { vi: "n", en: "n" },
    singleInput: true,
    maxInput: 30,
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Chọn Approach", en: "Select Approach" },
        default: 1,
        options: [
          { value: 1, label: { vi: "1 — DP Array O(n)", en: "1 — DP Array O(n)" } },
          { value: 2, label: { vi: "2 — Optimized O(1) space", en: "2 — Optimized O(1) space" } },
        ],
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n) / O(1)",
      note: {
        vi: "Approach 1: O(n) time, O(n) space (bảng dp). Approach 2: O(n) time, O(1) space (2 biến).",
        en: "Approach 1: O(n) time, O(n) space (dp table). Approach 2: O(n) time, O(1) space (2 variables).",
      },
    },
    code: [
      "class Solution:",
      "    def fib(self, n):",
      "        dp = [0] * (n + 1)",
      "        if n >= 1:",
      "            dp[1] = 1",
      "        for i in range(2, n + 1):",
      "            dp[i] = dp[i-1] + dp[i-2]",
      "        return dp[n]",
    ],
    code2: [
      "# Optimized O(1) space",
      "class Solution:",
      "    def fib(self, n: int) -> int:",
      "        if n <= 1:",
      "            return n",
      "        prev2, prev1 = 0, 1",
      "        for i in range(2, n + 1):",
      "            curr = prev1 + prev2",
      "            prev2 = prev1",
      "            prev1 = curr",
      "        return prev1",
    ],
    codeLabel: { vi: "Cách 1: DP Array O(n) space", en: "Approach 1: DP Array O(n) space" },
    code2Label: { vi: "Cách 2: Tối ưu O(1) space", en: "Approach 2: Optimized O(1) space" },
    builder: buildSteps509,
  },
  1137: {
    id: 1137,
    difficulty: "easy",
    slug: "n-th-tribonacci-number",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "N-th Tribonacci Number", en: "N-th Tribonacci Number" },
    titleVi: { vi: "Số Tribonacci thứ N", en: "N-th Tribonacci number" },
    statement: {
      vi: "Dãy Tribonacci: T(0)=0, T(1)=1, T(2)=1, và T(n) = T(n-1) + T(n-2) + T(n-3) với n ≥ 3. Cho n, trả về T(n).",
      en: "The Tribonacci sequence: T(0)=0, T(1)=1, T(2)=1, and T(n) = T(n-1) + T(n-2) + T(n-3) for n ≥ 3. Given n, return T(n).",
    },
    defaultInput: [10],
    inputKind: "nonneg",
    inputLabel: { vi: "n", en: "n" },
    singleInput: true,
    maxInput: 37,
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Chọn Approach", en: "Select Approach" },
        default: 1,
        options: [
          { value: 1, label: { vi: "1 — DP Array O(n)", en: "1 — DP Array O(n)" } },
          { value: 2, label: { vi: "2 — Rolling O(1) space", en: "2 — Rolling O(1) space" } },
        ],
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n) / O(1)",
      note: {
        vi: "Approach 1: O(n) time, O(n) space (bảng dp). Approach 2: O(n) time, O(1) space (3 biến).",
        en: "Approach 1: O(n) time, O(n) space (dp table). Approach 2: O(n) time, O(1) space (3 variables).",
      },
    },
    code: [
      "class Solution:",
      "    def tribonacci(self, n):",
      "        dp = [0] * max(n + 1, 3)",
      "        dp[1] = 1",
      "        dp[2] = 1",
      "        for i in range(3, n + 1):",
      "            dp[i] = dp[i-1] + dp[i-2] + dp[i-3]",
      "        return dp[n]",
    ],
    code2: [
      "# Rolling O(1) space",
      "class Solution:",
      "    def tribonacci(self, n):",
      "        if n == 0: return 0",
      "        if n <= 2: return 1",
      "        a, b, c = 0, 1, 1",
      "        for i in range(3, n + 1):",
      "            a, b, c = b, c, a + b + c",
      "            # next = a+b+c; shift a←b, b←c, c←next",
      "        return c",
    ],
    codeLabel: { vi: "Cách 1: DP Array O(n) space", en: "Approach 1: DP Array O(n) space" },
    code2Label: { vi: "Cách 2: Rolling O(1) space", en: "Approach 2: Rolling O(1) space" },
    builder: buildSteps1137,
  },
  688: {
    id: 688,
    difficulty: "medium",
    slug: "knight-probability-in-chessboard",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Knight Probability in Chessboard", en: "Knight Probability in Chessboard" },
    titleVi: { vi: "Xác suất mã ở trên bàn cờ", en: "Knight probability on board" },
    statement: {
      vi:
        "Trên bàn cờ n×n, quân mã bắt đầu tại (row, col). Sau đúng k bước di chuyển (mỗi bước chọn ngẫu nhiên 1 trong 8 hướng L), " +
        "trả về xác suất mã vẫn còn trên bàn cờ. Dùng DP.",
      en:
        "On an n×n chessboard, a knight starts at (row, col). After exactly k moves (each move randomly chosen from 8 L-directions), " +
        "return the probability the knight remains on the board. Uses DP.",
    },
    defaultInput: [3],
    inputKind: "positive",
    inputLabel: { vi: "n (kích thước bàn cờ)", en: "n (board size)" },
    singleInput: true,
    maxInput: 8,
    extraParams: [
      { key: "k", label: { vi: "k (số bước)", en: "k (moves)" }, default: 2 },
      { key: "row", label: { vi: "row (hàng bắt đầu)", en: "row (start row)" }, default: 0 },
      { key: "col", label: { vi: "col (cột bắt đầu)", en: "col (start col)" }, default: 0 },
    ],
    complexity: {
      time: "O(k·n²)",
      space: "O(n²)",
      note: {
        vi: "Mỗi bước duyệt n² ô, lặp k lần → O(k·n²). Lưu 2 bảng n×n → O(n²) bộ nhớ.",
        en: "Each step iterates n² cells, repeat k times → O(k·n²). Store 2 n×n tables → O(n²) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def knightProbability(self, n, k, row, col):",
      "        moves = [(-2,-1),(-2,1),(-1,-2),(-1,2),",
      "                 (1,-2),(1,2),(2,-1),(2,1)]",
      "        dp = [[0]*n for _ in range(n)]",
      "        dp[row][col] = 1.0",
      "        for step in range(k):",
      "            new_dp = [[0]*n for _ in range(n)]",
      "            for r in range(n):",
      "                for c in range(n):",
      "                    if dp[r][c] > 0:",
      "                        for dr, dc in moves:",
      "                            nr, nc = r+dr, c+dc",
      "                            if 0<=nr<n and 0<=nc<n:",
      "                                new_dp[nr][nc] += dp[r][c]/8",
      "            dp = new_dp",
      "        return sum(dp[r][c] for r in range(n) for c in range(n))",
    ],
    builder: buildSteps688,
  },
  1301: {
    id: 1301,
    difficulty: "hard",
    slug: "number-of-paths-with-max-score",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Number of Paths with Max Score", en: "Number of Paths with Max Score" },
    titleVi: { vi: "Số đường đi đạt điểm cao nhất", en: "Number of paths achieving max score" },
    statement: {
      vi:
        "Cho bảng chữ (E ở góc trên-trái, S ở góc dưới-phải, các số 0..9 là điểm cộng khi bước lên, 'X' là chướng ngại). " +
        "Từ S đi về E, mỗi bước có thể lên/trái/lên-trái theo đường chéo. Trả về [điểm cao nhất, số đường đạt điểm đó mod 1e9+7]. " +
        "Nếu không đến được E, trả về [0, 0].",
      en:
        "You are given a square board with 'E' at the top-left, 'S' at the bottom-right, digits 0..9 that add to your score when stepped on, and 'X' for obstacles. " +
        "From S you move up, left, or diagonally up-left toward E. Return [max score, number of paths achieving it mod 1e9+7]. " +
        "If E is unreachable, return [0, 0].",
    },
    defaultInput: "E23|2X2|12S",
    inputKind: "string",
    inputLabel: { vi: "board (hàng cách bởi |; chữ liền nhau hoặc cách bởi dấu phẩy)", en: "board (rows split by |; chars run together or comma-separated)" },
    extraParams: [],
    complexity: {
      time: "O(m·n)",
      space: "O(m·n)",
      note: {
        vi: "Điền bảng dp/cnt kích thước m×n, mỗi ô O(1) → O(m·n).",
        en: "Fill an m×n dp/cnt table, O(1) per cell → O(m·n).",
      },
    },
    code: [
      "class Solution:",
      "    def pathsWithMaxScore(self, board):",
      "        MOD = 10**9 + 7",
      "        m, n = len(board), len(board[0])",
      "        # dp[r][c] = max score, cnt[r][c] = # paths",
      "        dp = [[-1]*n for _ in range(m)]",
      "        cnt = [[0]*n for _ in range(m)]",
      "        dp[m-1][n-1], cnt[m-1][n-1] = 0, 1",
      "        for r in range(m-1, -1, -1):",
      "            for c in range(n-1, -1, -1):",
      "                if (r, c) == (m-1, n-1) or board[r][c] == 'X':",
      "                    continue",
      "                best, ways = -1, 0",
      "                for dr, dc in ((1,0),(0,1),(1,1)):",
      "                    pr, pc = r+dr, c+dc",
      "                    if pr >= m or pc >= n or dp[pr][pc] < 0:",
      "                        continue",
      "                    if dp[pr][pc] > best:",
      "                        best, ways = dp[pr][pc], cnt[pr][pc]",
      "                    elif dp[pr][pc] == best:",
      "                        ways = (ways + cnt[pr][pc]) % MOD",
      "                if best < 0:",
      "                    continue",
      "                digit = int(board[r][c]) if board[r][c].isdigit() else 0",
      "                dp[r][c], cnt[r][c] = best + digit, ways",
      "        if dp[0][0] < 0:",
      "            return [0, 0]",
      "        return [dp[0][0], cnt[0][0]]",
    ],
    builder: buildSteps1301,
  },
  1388: {
    id: 1388,
    difficulty: "hard",
    slug: "pizza-with-3n-slices",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Pizza With 3n Slices", en: "Pizza With 3n Slices" },
    titleVi: { vi: "Chia bánh 3n miếng (House Robber circular tổng quát)", en: "Pizza with 3n slices" },
    statement: {
      vi:
        "Có 3n miếng pizza xếp thành vòng tròn. Mỗi lượt: bạn chọn một miếng bất kỳ; Alice ăn miếng kề bên trái theo chiều ngược kim đồng hồ; Bob ăn miếng kề bên phải theo chiều kim đồng hồ. Lặp cho đến hết. " +
        "Trả về tổng lớn nhất bạn có thể ăn.",
      en:
        "You have a pizza with 3n slices arranged in a circle. Each round: you pick any slice; Alice picks the neighbour anti-clockwise; Bob picks the neighbour clockwise. Repeat until all slices are gone. " +
        "Return the maximum total size of slices you can pick.",
    },
    defaultInput: [1, 2, 3, 4, 5, 6],
    inputKind: "nonneg",
    inputLabel: { vi: "slices (3n miếng)", en: "slices (3n slices)" },
    extraParams: [],
    complexity: {
      time: "O(n²)",
      space: "O(n²)",
      note: {
        vi:
          "Bài quy về: chọn n phần tử KHÔNG KỀ NHAU từ mảng vòng tròn 3n để tổng lớn nhất. " +
          "Vòng tròn → chạy 2 lần tuyến tính (bỏ đầu / bỏ cuối). " +
          "Mỗi lần dùng DP 2D dp[i][j] với i ≤ 3n, j ≤ n → O(n²) thời gian và bộ nhớ.",
        en:
          "Reduces to: pick n NON-ADJACENT elements from a circular array of 3n to maximise sum. " +
          "Circular → run two linear DPs (drop first / drop last). " +
          "Each pass is a 2D DP dp[i][j] with i ≤ 3n, j ≤ n → O(n²) time and space.",
      },
    },
    code: [
      "class Solution:",
      "    def maxSizeSlices(self, slices):",
      "        # Reduce to: pick n non-adjacent from circular array of 3n.",
      "        n = len(slices) // 3",
      "        def pick(arr):",
      "            m = len(arr)",
      "            # dp[i][j] = max sum picking j non-adjacent from arr[0..i-1]",
      "            dp = [[0]*(n+1) for _ in range(m+1)]",
      "            for i in range(1, m+1):",
      "                for j in range(1, n+1):",
      "                    skip = dp[i-1][j]",
      "                    take = (dp[i-2][j-1] + arr[i-1]) if i >= 2 else (arr[i-1] if j == 1 else -10**9)",
      "                    dp[i][j] = max(skip, take)",
      "            return dp[m][n]",
      "        # Circular trick: drop first or drop last, take max.",
      "        return max(pick(slices[:-1]), pick(slices[1:]))",
    ],
    builder: buildSteps1388,
  },
  1690: {
    id: 1690,
    difficulty: "medium",
    slug: "stone-game-vii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Stone Game VII", en: "Stone Game VII" },
    titleVi: { vi: "Trò chơi đá VII (interval DP hiệu điểm)", en: "Stone Game VII" },
    statement: {
      vi:
        "Có dãy stones. Alice và Bob thay phiên (Alice trước) bỏ một viên ở đầu hoặc cuối; người bỏ được cộng điểm bằng TỔNG các viên còn lại. Cả hai chơi tối ưu để tối đa hóa hiệu điểm của mình. Trả về hiệu Alice − Bob.",
      en:
        "Given stones, Alice and Bob alternate (Alice first) removing a stone from either end; the remover earns the SUM of the remaining stones. Both play optimally to maximize their score difference. Return the Alice − Bob difference.",
    },
    defaultInput: [5, 3, 1, 4, 2],
    inputKind: "integer",
    inputLabel: { vi: "stones", en: "stones" },
    extraParams: [],
    approach: [
      { vi: "dp[i][j] = hiệu điểm tốt nhất người tới lượt đạt được trên đoạn stones[i..j].", en: "dp[i][j] = best score difference the player to move can achieve on stones[i..j]." },
      { vi: "Bỏ một đầu thì được cộng tổng phần còn lại, rồi đối thủ chơi tối ưu trên đoạn nhỏ hơn nên trừ đi dp của đoạn đó.", en: "Removing an end earns the remaining sum, then the opponent plays the smaller interval optimally, so subtract that dp." },
      { vi: "dp[i][j] = max(sum(i+1,j) − dp[i+1][j], sum(i,j-1) − dp[i][j-1]); đáp án là dp[0][n-1].", en: "dp[i][j] = max(sum(i+1,j) − dp[i+1][j], sum(i,j-1) − dp[i][j-1]); the answer is dp[0][n-1]." },
    ],
    complexity: {
      time: "O(n²)",
      space: "O(n²)",
      note: {
        vi: "Điền bảng DP theo độ dài đoạn tăng dần; mỗi ô O(1) nhờ prefix sum.",
        en: "Fill the DP table by increasing interval length; each cell is O(1) thanks to prefix sums.",
      },
    },
    code: [
      "class Solution:",
      "    def stoneGameVII(self, stones):",
      "        n = len(stones)",
      "        prefix = [0] * (n + 1)",
      "        for k in range(n):",
      "            prefix[k + 1] = prefix[k] + stones[k]",
      "        dp = [[0] * n for _ in range(n)]",
      "        for length in range(2, n + 1):",
      "            for i in range(n - length + 1):",
      "                j = i + length - 1",
      "                take_left = prefix[j+1]-prefix[i+1] - dp[i+1][j]",
      "                take_right = prefix[j]-prefix[i] - dp[i][j-1]",
      "                dp[i][j] = max(take_left, take_right)",
      "        return dp[0][n-1]",
    ],
    builder: buildSteps1690,
  },
  2320: {
    id: 2320,
    difficulty: "medium",
    slug: "count-number-of-ways-to-place-houses",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Count Number of Ways to Place Houses", en: "Count Number of Ways to Place Houses" },
    titleVi: { vi: "Đếm số cách đặt nhà (Fibonacci² )", en: "Count ways to place houses" },
    statement: {
      vi:
        "Một con đường có n ô ở mỗi bên. Không được đặt nhà trên hai ô liền kề CÙNG một bên; hai bên độc lập. Trả về số cách đặt nhà, chia lấy dư 10⁹+7.",
      en:
        "A street has n plots on each side. No two houses may be on adjacent plots on the SAME side; the two sides are independent. Return the number of ways to place houses, modulo 1e9+7.",
    },
    defaultInput: [4],
    inputKind: "positive",
    inputLabel: { vi: "n (1..46)", en: "n (1..46)" },
    singleInput: true,
    maxInput: 46,
    extraParams: [],
    approach: [
      { vi: "Trên một bên, số cách đặt nhà không kề nhau trên i ô là dãy Fibonacci: dp[i] = dp[i-1] + dp[i-2].", en: "On one side, the count of no-two-adjacent placements over i plots is Fibonacci: dp[i] = dp[i-1] + dp[i-2]." },
      { vi: "dp[i-1]: ô i để trống; dp[i-2]: ô i đặt nhà nên ô i-1 phải trống. Base: dp[0]=1, dp[1]=2.", en: "dp[i-1]: plot i empty; dp[i-2]: plot i has a house so plot i-1 is empty. Base: dp[0]=1, dp[1]=2." },
      { vi: "Hai bên độc lập nên đáp án là dp[n]² mod (10⁹+7).", en: "The two sides are independent, so the answer is dp[n]² mod 1e9+7." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Điền dãy Fibonacci một lần rồi bình phương; có thể tối ưu O(1) bộ nhớ bằng hai biến.",
        en: "Fill the Fibonacci sequence once, then square; memory can be reduced to O(1) with two rolling variables.",
      },
    },
    code: [
      "class Solution:",
      "    def countHousePlacements(self, n):",
      "        MOD = 10**9 + 7",
      "        dp = [0] * (n + 1)",
      "        dp[0] = 1",
      "        dp[1] = 2",
      "        for i in range(2, n + 1):",
      "            dp[i] = (dp[i-1] + dp[i-2]) % MOD",
      "        return (dp[n] * dp[n]) % MOD",
    ],
    builder: buildSteps2320,
  },
  494: {
    id: 494,
    difficulty: "medium",
    slug: "target-sum",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Target Sum", en: "Target Sum" },
    titleVi: { vi: "Gán ± cho tổng bằng target (subset sum)", en: "Assign ± to reach target (subset sum)" },
    statement: {
      vi:
        "Cho mảng số nguyên không âm nums và số nguyên target. Gán '+' hoặc '−' cho mỗi phần tử " +
        "để tổng có dấu bằng target. Trả về SỐ CÁCH gán.",
      en:
        "Given a non-negative integer array nums and an integer target, assign '+' or '−' to each element " +
        "so the signed sum equals target. Return the number of such assignments.",
    },
    defaultInput: [1, 1, 1, 1, 1],
    inputKind: "nonneg",
    extraParams: [
      {
        key: "target",
        type: "number",
        label: { vi: "target", en: "target" },
        default: 3,
        allowNegative: true,
      },
    ],
    complexity: {
      time: "O(n · P)",
      space: "O(P)",
      note: {
        vi:
          "Sau khi quy về subset sum, P = (sum+target)/2. Bảng dp dài P+1, mỗi num duyệt xuống một lần → O(n·P) thời gian, O(P) bộ nhớ.",
        en:
          "After reducing to subset sum, P = (sum+target)/2. A dp array of length P+1 with one downward pass per num → O(n·P) time and O(P) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def findTargetSumWays(self, nums, target):",
      "        total = sum(nums)",
      "        # Feasibility: (total+target) even AND |target| <= total",
      "        if abs(target) > total or (total + target) % 2 != 0:",
      "            return 0",
      "        P = (total + target) // 2",
      "        # dp[j] = number of subsets summing to j",
      "        dp = [0] * (P + 1)",
      "        dp[0] = 1",
      "        for num in nums:",
      "            for j in range(P, num - 1, -1):",
      "                dp[j] += dp[j - num]",
      "        return dp[P]",
    ],
    builder: buildSteps494,
  },
  1463: {
    id: 1463,
    difficulty: "hard",
    slug: "cherry-pickup-ii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Cherry Pickup II", en: "Cherry Pickup II" },
    titleVi: { vi: "Thu cherry (2 robots trên grid)", en: "2 robots collect max cherries" },
    statement: {
      vi: "Grid rows×cols, mỗi ô chứa cherry. Robot1 tại (0,0), Robot2 tại (0,cols-1). Cả 2 cùng đi xuống (↙/↓/↘). Nếu cùng ô thì chỉ thu 1 lần. Tìm tổng cherry TỐI ĐA. Nhập grid: hàng cách ';', giá trị cách ','.",
      en: "Grid rows×cols, each cell has cherries. Robot1 at (0,0), Robot2 at (0,cols-1). Both move down (↙/↓/↘). If same cell, only collect once. Find MAX total cherries. Enter grid: rows by ';', values by ','.",
    },
    defaultInput: "3,1,1;2,5,1;1,5,5;2,1,1",
    inputKind: "string",
    inputLabel: { vi: "Grid (hàng cách ';')", en: "Grid (rows by ';')" },
    extraParams: [],
    approach: [
      { vi: "DP 3D: dp[r][c1][c2] = max cherry từ hàng r trở xuống khi robots ở cột c1 và c2.", en: "3D DP: dp[r][c1][c2] = max cherries from row r downward with robots at columns c1 and c2." },
      { vi: "Base: hàng cuối, dp = grid[r][c1] + grid[r][c2] (hoặc chỉ 1 lần nếu c1==c2).", en: "Base: last row, dp = grid[r][c1] + grid[r][c2] (or once if c1==c2)." },
      { vi: "Transition: dp[r][c1][c2] = cherries + max(dp[r+1][c1±1/0][c2±1/0]) — 9 tổ hợp.", en: "Transition: dp[r][c1][c2] = cherries + max(dp[r+1][c1±1/0][c2±1/0]) — 9 combinations." },
      { vi: "Đáp án = dp[0][0][cols-1].", en: "Answer = dp[0][0][cols-1]." },
    ],
    complexity: { time: "O(rows · cols² · 9)", space: "O(cols²)", note: { vi: "Mỗi hàng xét cols² cặp × 9 di chuyển. Bộ nhớ: 2 lớp cols².", en: "Each row checks cols² pairs × 9 moves. Memory: two cols² layers." } },
    code: [
      "class Solution:",
      "    def cherryPickup(self, grid):",
      "        rows, cols = len(grid), len(grid[0])",
      "        dp = [[-1]*cols for _ in range(cols)]",
      "        dp[0][cols-1] = grid[0][0] + grid[0][cols-1]",
      "        for r in range(1, rows):",
      "            ndp = [[-1]*cols for _ in range(cols)]",
      "            for c1 in range(min(r+1, cols)):",
      "                for c2 in range(max(0, cols-1-r), cols):",
      "                    for dc1 in (-1, 0, 1):",
      "                        for dc2 in (-1, 0, 1):",
      "                            pc1, pc2 = c1-dc1, c2-dc2",
      "                            if 0<=pc1<cols and 0<=pc2<cols and dp[pc1][pc2]>=0:",
      "                                val = grid[r][c1]+(grid[r][c2] if c1!=c2 else 0)",
      "                                ndp[c1][c2] = max(ndp[c1][c2], dp[pc1][pc2]+val)",
      "            dp = ndp",
      "        return max(max(row) for row in dp)",
    ],
    builder: buildSteps1463,
  },
  174: {
    id: 174,
    difficulty: "hard",
    slug: "dungeon-game",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Dungeon Game", en: "Dungeon Game" },
    titleVi: { vi: "HP tối thiểu qua dungeon", en: "Min initial HP to survive" },
    statement: {
      vi: "Hiệp sĩ đi từ (0,0) đến (m-1,n-1), chỉ được đi PHẢI hoặc XUỐNG. Mỗi ô có giá trị (âm=mất HP, dương=hồi HP). HP phải luôn ≥ 1. Tìm HP KHỞI ĐẦU tối thiểu. Nhập grid: hàng cách ';', giá trị cách ','.",
      en: "Knight goes from (0,0) to (m-1,n-1), can only move RIGHT or DOWN. Each cell has a value (negative=damage, positive=heal). HP must always ≥ 1. Find the minimum INITIAL HP. Enter grid: rows by ';', values by ','.",
    },
    defaultInput: "-2,-3,3;-5,-10,1;10,30,-5",
    inputKind: "string",
    inputLabel: { vi: "Grid (hàng cách ';')", en: "Grid (rows by ';')" },
    extraParams: [],
    approach: [
      { vi: "DP NGƯỢC (bottom-right → top-left): dp[i][j] = HP tối thiểu khi VÀO ô (i,j) để sống tới đích.", en: "REVERSE DP (bottom-right → top-left): dp[i][j] = min HP when ENTERING cell (i,j) to survive to the goal." },
      { vi: "dp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) − grid[i][j]).", en: "dp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) − grid[i][j])." },
      { vi: "max(1,...) vì HP không được rớt dưới 1 tại bất kỳ ô nào.", en: "max(1,...) because HP cannot drop below 1 at any cell." },
      { vi: "Đáp án = dp[0][0]. Không thể dùng DP xuôi vì path tối ưu phụ thuộc cả tương lai.", en: "Answer = dp[0][0]. Cannot use forward DP because the optimal path depends on future cells." },
    ],
    complexity: { time: "O(m·n)", space: "O(m·n)", note: { vi: "1 lần fill bảng m×n.", en: "Single pass to fill the m×n table." } },
    code: [
      "class Solution:",
      "    def calculateMinimumHP(self, dungeon):",
      "        m, n = len(dungeon), len(dungeon[0])",
      "        dp = [[0]*n for _ in range(m)]",
      "        dp[m-1][n-1] = max(1, 1 - dungeon[m-1][n-1])",
      "        # Last row",
      "        for j in range(n-2, -1, -1):",
      "            dp[m-1][j] = max(1, dp[m-1][j+1] - dungeon[m-1][j])",
      "        # Last col",
      "        for i in range(m-2, -1, -1):",
      "            dp[i][n-1] = max(1, dp[i+1][n-1] - dungeon[i][n-1])",
      "        # Rest",
      "        for i in range(m-2, -1, -1):",
      "            for j in range(n-2, -1, -1):",
      "                dp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) - dungeon[i][j])",
      "        return dp[0][0]",
    ],
    builder: buildSteps174,
  },
  1049: {
    id: 1049,
    difficulty: "medium",
    slug: "last-stone-weight-ii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Last Stone Weight II", en: "Last Stone Weight II" },
    titleVi: { vi: "Trọng lượng đá cuối (DP)", en: "Min last stone weight (DP knapsack)" },
    statement: {
      vi: "Mỗi lần lấy 2 hòn đá x, y đập nhau → còn |x-y|. Tìm trọng lượng NHỎ NHẤT có thể còn lại. Nhập mảng số nguyên dương.",
      en: "Each turn take two stones x, y and smash → |x-y| remains. Find the minimum possible weight of the last stone. Enter positive integer array.",
    },
    defaultInput: [2, 7, 4, 1, 8, 1],
    inputKind: "positive",
    inputLabel: { vi: "Trọng lượng đá (dấu phẩy)", en: "Stone weights (comma-sep)" },
    extraParams: [],
    approach: [
      { vi: "Tương đương: chia đá thành 2 nhóm sao cho |sum1 - sum2| TỐI THIỂU.", en: "Equivalent: partition stones into 2 groups minimizing |sum1 - sum2|." },
      { vi: "0/1 Knapsack: dp[j] = True nếu subset tổng j đạt được. target = floor(total/2).", en: "0/1 Knapsack: dp[j] = True if subset sum j is achievable. target = floor(total/2)." },
      { vi: "Đáp án = total - 2 × (tổng lớn nhất ≤ target đạt được).", en: "Answer = total - 2 × (largest achievable sum ≤ target)." },
    ],
    complexity: { time: "O(n · S)", space: "O(S)", note: { vi: "S = total/2. Mỗi đá duyệt S ô.", en: "S = total/2. Each stone iterates S cells." } },
    code: [
      "class Solution:",
      "    def lastStoneWeightII(self, stones):",
      "        total = sum(stones)",
      "        target = total // 2",
      "        dp = [False] * (target + 1)",
      "        dp[0] = True",
      "        for s in stones:",
      "            for j in range(target, s - 1, -1):",
      "                dp[j] = dp[j] or dp[j - s]",
      "        for j in range(target, -1, -1):",
      "            if dp[j]:",
      "                return total - 2 * j",
    ],
    builder: buildSteps1049,
  },
  5: {
    id: 5,
    difficulty: "medium",
    slug: "longest-palindromic-substring",
    category: { key: "dp", vi: "Quy hoach dong", en: "Dynamic Programming" },
    title: { vi: "Longest Palindromic Substring", en: "Longest Palindromic Substring" },
    titleVi: { vi: "Chuoi con doi xung dai nhat", en: "Longest palindromic substring" },
    statement: {
      vi: "Cho chuoi s, tra ve chuoi con lien tiep dai nhat la palindrome.",
      en: "Given a string s, return the longest contiguous substring that is a palindrome.",
    },
    defaultInput: "babad",
    inputKind: "string",
    inputLabel: { vi: "s", en: "s" },
    extraParams: [
      {
        key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Expand Around Center", en: "Approach 1: Expand Around Center" } },
          { value: "2", label: { vi: "Cách 2: DP bảng 2D", en: "Approach 2: 2D DP table" } },
        ],
      },
    ],
    approach: [
      { vi: "Palindrome substring co tam o mot ky tu (le) hoac giua hai ky tu (chan).", en: "A palindromic substring has a center at one character (odd) or between two characters (even)." },
      { vi: "Cách 1: mở rộng left/right khi s[left] == s[right]. O(1) bộ nhớ.", en: "Approach 1: expand left/right while s[left] == s[right]. O(1) space." },
      { vi: "Cách 2: dp[i][j] = True nếu s[i..j] là palindrome. Xét theo độ dài tăng dần.", en: "Approach 2: dp[i][j] = True if s[i..j] is a palindrome. Process by increasing length." },
    ],
    complexity: {
      time: "O(n^2)",
      space: "O(1) / O(n^2)",
      note: { vi: "Cách 1: O(n²) time, O(1) space. Cách 2: O(n²) time, O(n²) space (bảng dp).", en: "Approach 1: O(n²) time, O(1) space. Approach 2: O(n²) time, O(n²) space (dp table)." },
    },
    code: [
      "class Solution:",
      "    def longestPalindrome(self, s: str) -> str:",
      "        best_start = best_end = 0",
      "",
      "        def expand(left: int, right: int):",
      "            nonlocal best_start, best_end",
      "            while left >= 0 and right < len(s) and s[left] == s[right]:",
      "                if right - left > best_end - best_start:",
      "                    best_start, best_end = left, right",
      "                left -= 1",
      "                right += 1",
      "",
      "        for center in range(len(s)):",
      "            expand(center, center)",
      "            expand(center, center + 1)",
      "",
      "        return s[best_start:best_end + 1]",
    ],
    code2: [
      "class Solution:",
      "    def longestPalindrome(self, s: str) -> str:",
      "        n = len(s)",
      "        dp = [[False] * n for _ in range(n)]",
      "        best_start, best_end = 0, 0",
      "",
      "        for i in range(n):",
      "            dp[i][i] = True",
      "",
      "        for i in range(n - 1):",
      "            if s[i] == s[i + 1]:",
      "                dp[i][i + 1] = True",
      "                best_start, best_end = i, i + 1",
      "",
      "        for length in range(3, n + 1):",
      "            for i in range(n - length + 1):",
      "                j = i + length - 1",
      "                if s[i] == s[j] and dp[i + 1][j - 1]:",
      "                    dp[i][j] = True",
      "                    best_start, best_end = i, j",
      "",
      "        return s[best_start:best_end + 1]",
    ],
    codeLabel: { vi: "Cách 1: Expand Around Center", en: "Approach 1: Expand Around Center" },
    code2Label: { vi: "Cách 2: DP bảng 2D", en: "Approach 2: 2D DP table" },
    builder: (input, params) => {
      const approach = Number(params && params.approach) || 1;
      return approach === 2 ? buildSteps5DP(input) : buildSteps5(input);
    },
  },
  516: {
    id: 516,
    difficulty: "medium",
    slug: "longest-palindromic-subsequence",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Longest Palindromic Subsequence", en: "Longest Palindromic Subsequence" },
    titleVi: { vi: "Dãy con đối xứng dài nhất", en: "Longest palindromic subsequence" },
    statement: {
      vi:
        "Cho chuỗi s, trả về độ dài dãy con đối xứng dài nhất. " +
        "Dãy con giữ nguyên thứ tự ký tự nhưng có thể xóa một số ký tự.",
      en:
        "Given a string s, return the length of the longest palindromic subsequence. " +
        "A subsequence keeps character order while allowing deletions.",
    },
    defaultInput: "bbbab",
    inputKind: "string",
    inputLabel: { vi: "Chuỗi s", en: "String s" },
    extraParams: [],
    approach: [
      { vi: "Interval DP: dp[i][j] = độ dài LPS trong đoạn s[i..j].", en: "Interval DP: dp[i][j] = LPS length inside s[i..j]." },
      { vi: "Base: dp[i][i] = 1 vì một ký tự là palindrome.", en: "Base: dp[i][i] = 1 because one character is a palindrome." },
      { vi: "Nếu s[i] == s[j], lấy cả hai đầu: dp[i][j] = dp[i+1][j-1] + 2.", en: "If s[i] == s[j], take both ends: dp[i][j] = dp[i+1][j-1] + 2." },
      { vi: "Nếu khác nhau, bỏ một đầu: max(dp[i+1][j], dp[i][j-1]).", en: "If different, drop one end: max(dp[i+1][j], dp[i][j-1])." },
    ],
    complexity: {
      time: "O(n²)",
      space: "O(n²)",
      note: {
        vi: "Có O(n²) đoạn con (i,j), mỗi đoạn tính O(1). Bảng dp kích thước n×n.",
        en: "There are O(n²) intervals (i,j), each computed in O(1). The dp table is n×n.",
      },
    },
    code: [
      "class Solution:",
      "    def longestPalindromeSubseq(self, s: str) -> int:",
      "        n = len(s)",
      "        dp = [[0] * n for _ in range(n)]",
      "        for i in range(n - 1, -1, -1):",
      "            dp[i][i] = 1",
      "            for j in range(i + 1, n):",
      "                if s[i] == s[j]:",
      "                    dp[i][j] = dp[i + 1][j - 1] + 2",
      "                else:",
      "                    dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])",
      "        return dp[0][n - 1]",
    ],
    builder: buildSteps516,
  },
  1682: {
    id: 1682,
    difficulty: "medium",
    premium: true,
    slug: "longest-palindromic-subsequence-ii",
    category: { key: "dp", vi: "Quy hoach dong", en: "Dynamic Programming" },
    title: { vi: "Longest Palindromic Subsequence II", en: "Longest Palindromic Subsequence II" },
    titleVi: { vi: "Day con palindrome tot dai nhat II", en: "Longest good palindromic subsequence" },
    statement: {
      vi: "Cho chuoi s, tim do dai day con palindrome tot dai nhat. Good palindrome phai co do dai chan va khong co 2 ky tu ke nhau bang nhau, ngoai tru cap o giua.",
      en: "Given a string s, return the length of the longest good palindromic subsequence. A good palindrome has even length and no two consecutive characters are equal, except the two middle ones.",
    },
    defaultInput: "abcabcabb",
    inputKind: "string",
    inputLabel: { vi: "Chuoi s", en: "String s" },
    extraParams: [],
    approach: [
      { vi: "State: dfs(i,j,prev) = ket qua tot nhat trong s[i..j], khi cap boc ngoai tiep theo khong duoc dung prev.", en: "State: dfs(i,j,prev) = best answer inside s[i..j], where the next wrapping pair may not use prev." },
      { vi: "Thu moi ky tu ch: tim vi tri trai/phai dau-cuoi cua ch trong interval. Neu co 2 vi tri va ch != prev, co the lay 2 + dfs(left+1,right-1,ch).", en: "Try each character ch: find the first/last ch in the interval. If there are two positions and ch != prev, take 2 + dfs(left+1,right-1,ch)." },
      { vi: "Dieu kien ch != prev ngan 2 ky tu ke nhau bang nhau o canh cap vua them; cap giua van duoc phep giong nhau.", en: "The ch != prev rule prevents equal adjacent characters next to the pair just added; the middle pair is still allowed to be equal." },
      { vi: "Dung memo de tranh tinh lai cung state.", en: "Use memoization to avoid recomputing the same state." },
    ],
    complexity: {
      time: "O(n^2 * C^2)",
      space: "O(n^2 * C)",
      note: {
        vi: "Co O(n^2*C) state dfs(i,j,prev). Moi state thu toi da C ky tu; C=26 voi chu cai thuong.",
        en: "There are O(n^2*C) states dfs(i,j,prev). Each state tries up to C characters; C=26 for lowercase letters.",
      },
    },
    code: [
      "from functools import cache",
      "",
      "class Solution:",
      "    def longestPalindromeSubseq(self, s: str) -> int:",
      "        chars = sorted(set(s))",
      "",
      "        @cache",
      "        def dfs(i: int, j: int, prev: str) -> int:",
      "            if i >= j:",
      "                return 0",
      "",
      "            ans = 0",
      "            for ch in chars:",
      "                left = s.find(ch, i, j + 1)",
      "                right = s.rfind(ch, i, j + 1)",
      "                if ch != prev and left != -1 and left < right:",
      "                    ans = max(ans, 2 + dfs(left + 1, right - 1, ch))",
      "            return ans",
      "",
      "        return dfs(0, len(s) - 1, \"\")",
    ],
    builder: buildSteps1682,
  },
  1312: {
    id: 1312,
    difficulty: "hard",
    slug: "minimum-insertion-steps-to-make-a-string-palindrome",
    category: { key: "dp", vi: "Quy hoach dong", en: "Dynamic Programming" },
    title: { vi: "Minimum Insertion Steps to Make a String Palindrome", en: "Minimum Insertion Steps to Make a String Palindrome" },
    titleVi: { vi: "Chen it nhat de thanh palindrome", en: "Minimum insertions to make palindrome" },
    statement: {
      vi: "Cho chuoi s, moi buoc duoc chen mot ky tu bat ky vao vi tri bat ky. Tra ve so buoc chen it nhat de bien s thanh palindrome.",
      en: "Given a string s, in one step you may insert any character at any position. Return the minimum number of insertion steps to make s a palindrome.",
    },
    defaultInput: "mbadm",
    inputKind: "string",
    inputLabel: { vi: "Chuoi s", en: "String s" },
    extraParams: [],
    approach: [
      { vi: "Interval DP: dp[i][j] = so lan chen it nhat de s[i..j] thanh palindrome.", en: "Interval DP: dp[i][j] = minimum insertions needed to make s[i..j] a palindrome." },
      { vi: "Neu s[i] == s[j], hai dau da khop: dp[i][j] = dp[i+1][j-1].", en: "If s[i] == s[j], the ends already match: dp[i][j] = dp[i+1][j-1]." },
      { vi: "Neu khac nhau, chen 1 ky tu de khop mot dau: dp[i][j] = 1 + min(dp[i+1][j], dp[i][j-1]).", en: "If they differ, insert one character to match one end: dp[i][j] = 1 + min(dp[i+1][j], dp[i][j-1])." },
    ],
    complexity: {
      time: "O(n^2)",
      space: "O(n^2)",
      note: {
        vi: "Co O(n^2) interval (i,j), moi interval tinh O(1).",
        en: "There are O(n^2) intervals (i,j), each computed in O(1).",
      },
    },
    code: [
      "class Solution:",
      "    def minInsertions(self, s: str) -> int:",
      "        n = len(s)",
      "        dp = [[0] * n for _ in range(n)]",
      "        for i in range(n - 1, -1, -1):",
      "            for j in range(i + 1, n):",
      "                if s[i] == s[j]:",
      "                    dp[i][j] = dp[i + 1][j - 1]",
      "                else:",
      "                    dp[i][j] = 1 + min(dp[i + 1][j], dp[i][j - 1])",
      "        return dp[0][n - 1]",
    ],
    builder: buildSteps1312,
  },
  3336: {
    id: 3336,
    difficulty: "hard",
    slug: "find-the-number-of-subsequences-with-equal-gcd",
    category: { key: "dp", vi: "Quy hoach dong", en: "Dynamic Programming" },
    title: { vi: "Find the Number of Subsequences With Equal GCD", en: "Find the Number of Subsequences With Equal GCD" },
    titleVi: { vi: "Dem cap subsequence co GCD bang nhau", en: "Count subsequence pairs with equal GCD" },
    statement: {
      vi: "Cho nums, dem so cap subsequence khong rong, roi nhau (moi phan tu chi vao toi da mot subsequence) sao cho GCD cua hai subsequence bang nhau.",
      en: "Given nums, count pairs of non-empty disjoint subsequences where the GCD of the first subsequence equals the GCD of the second subsequence.",
    },
    defaultInput: [1, 2, 3, 4],
    inputKind: "integer",
    inputLabel: { vi: "nums (so nguyen duong, dau phay)", en: "nums (positive integers, comma-sep)" },
    extraParams: [],
    approach: [
      { vi: "State: dp[g1][g2] = so cach sau prefix hien tai, voi GCD(seq1)=g1 va GCD(seq2)=g2.", en: "State: dp[g1][g2] = number of ways after the current prefix, with GCD(seq1)=g1 and GCD(seq2)=g2." },
      { vi: "g = 0 nghia la subsequence rong. Ban dau dp[0][0] = 1.", en: "g = 0 means the subsequence is empty. Initially dp[0][0] = 1." },
      { vi: "Moi so x co 3 lua chon: bo qua, them vao seq1, hoac them vao seq2.", en: "Each number x has 3 choices: skip it, put it into seq1, or put it into seq2." },
      { vi: "Dap an = tong dp[g][g] voi g > 0.", en: "Answer = sum dp[g][g] for g > 0." },
    ],
    complexity: {
      time: "O(n * max(nums)^2 * log max(nums))",
      space: "O(max(nums)^2)",
      note: {
        vi: "Moi phan tu duyet tat ca cap (g1,g2). Moi update tinh gcd.",
        en: "For each number, iterate all (g1,g2) states. Each update computes a gcd.",
      },
    },
    code: [
      "from math import gcd",
      "",
      "class Solution:",
      "    def subsequencePairCount(self, nums: List[int]) -> int:",
      "        MOD = 10**9 + 7",
      "        mx = max(nums)",
      "        dp = [[0] * (mx + 1) for _ in range(mx + 1)]",
      "        dp[0][0] = 1",
      "",
      "        for x in nums:",
      "            ndp = [row[:] for row in dp]",
      "            for g1 in range(mx + 1):",
      "                for g2 in range(mx + 1):",
      "                    cnt = dp[g1][g2]",
      "                    if cnt == 0:",
      "                        continue",
      "                    ng1 = x if g1 == 0 else gcd(g1, x)",
      "                    ndp[ng1][g2] = (ndp[ng1][g2] + cnt) % MOD",
      "                    ng2 = x if g2 == 0 else gcd(g2, x)",
      "                    ndp[g1][ng2] = (ndp[g1][ng2] + cnt) % MOD",
      "            dp = ndp",
      "",
      "        return sum(dp[g][g] for g in range(1, mx + 1)) % MOD",
    ],
    builder: buildSteps3336,
  },
  97: {
    id: 97,
    difficulty: "medium",
    slug: "interleaving-string",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Interleaving String", en: "Interleaving String" },
    titleVi: { vi: "Xen kẽ chuỗi", en: "Check if s3 interleaves s1 and s2" },
    statement: {
      vi: "Cho 3 chuỗi s1, s2, s3. Kiểm tra s3 có phải là xen kẽ của s1 và s2 không? Xen kẽ: duyệt s1 và s2 từ đầu đến cuối, chọn từ s1 hoặc s2 để ghép thành s3. Nhập 3 chuỗi cách dấu phẩy.",
      en: "Given three strings s1, s2, s3. Check if s3 is an interleaving of s1 and s2. Interleaving: traverse s1 and s2 from start to end, pick from s1 or s2 to form s3. Enter 3 strings comma-separated.",
    },
    defaultInput: "aabcc,dbbca,aadbbcbcac",
    inputKind: "string",
    inputLabel: { vi: "s1, s2, s3 (dấu phẩy)", en: "s1, s2, s3 (comma-sep)" },
    extraParams: [],
    approach: [
      { vi: "DP 2D: dp[i][j] = True nếu s3[0:i+j] là xen kẽ của s1[0:i] và s2[0:j].", en: "2D DP: dp[i][j] = True if s3[0:i+j] is an interleaving of s1[0:i] and s2[0:j]." },
      { vi: "dp[0][0] = True (chuỗi rỗng xen kẽ với chuỗi rỗng).", en: "dp[0][0] = True (empty strings interleave to empty)." },
      { vi: "dp[i][j] = (dp[i-1][j] ∧ s1[i-1]==s3[i+j-1]) ∨ (dp[i][j-1] ∧ s2[j-1]==s3[i+j-1]).", en: "dp[i][j] = (dp[i-1][j] ∧ s1[i-1]==s3[i+j-1]) ∨ (dp[i][j-1] ∧ s2[j-1]==s3[i+j-1])." },
      { vi: "Đáp án = dp[len(s1)][len(s2)].", en: "Answer = dp[len(s1)][len(s2)]." },
    ],
    complexity: { time: "O(m·n)", space: "O(m·n)", note: { vi: "m=len(s1), n=len(s2). Bảng m+1 × n+1.", en: "m=len(s1), n=len(s2). Table (m+1) × (n+1)." } },
    code: [
      "class Solution:",
      "    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:",
      "        m, n = len(s1), len(s2)",
      "",
      "        if m + n != len(s3):",
      "            return False",
      "",
      "        # dp[i][j] = True nếu s3[:i+j] có thể tạo thành từ s1[:i] và s2[:j]",
      "        dp = [[False] * (n + 1) for _ in range(m + 1)]",
      "        dp[0][0] = True",
      "",
      "        # Khởi tạo hàng đầu tiên (chỉ dùng s2)",
      "        for j in range(1, n + 1):",
      "            dp[0][j] = dp[0][j - 1] and s2[j - 1] == s3[j - 1]",
      "",
      "        # Khởi tạo cột đầu tiên (chỉ dùng s1)",
      "        for i in range(1, m + 1):",
      "            dp[i][0] = dp[i - 1][0] and s1[i - 1] == s3[i - 1]",
      "",
      "        # Điền bảng DP",
      "        for i in range(1, m + 1):",
      "            for j in range(1, n + 1):",
      "                dp[i][j] = (dp[i - 1][j] and s1[i - 1] == s3[i + j - 1]) or \\",
      "                           (dp[i][j - 1] and s2[j - 1] == s3[i + j - 1])",
      "",
      "        return dp[m][n]",
    ],
    builder: buildSteps97,
  },
};
