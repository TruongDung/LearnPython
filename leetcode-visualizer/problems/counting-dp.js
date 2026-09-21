function validate1621Input(input, params = {}) {
  const n = Array.isArray(input) ? Number(input[0]) : Number(input);
  const k = Number(params.k);
  if (!Number.isInteger(n) || n < 2 || n > 10) {
    throw new Error("n must be an integer between 2 and 10 for this visualization.");
  }
  if (!Number.isInteger(k) || k < 1 || k >= n) {
    throw new Error("k must be an integer between 1 and n - 1.");
  }
  return { n, k };
}

function buildSteps1621(input, params = {}) {
  const { n, k } = validate1621Input(input, params);
  const MOD = 1000000007;
  const ways = Array.from({ length: n + 1 }, () => Array(k + 1).fill(0));
  const prefix = Array.from({ length: n + 1 }, () => Array(k + 1).fill(0));
  const computed = Array.from({ length: n + 1 }, () => Array(k + 1).fill(false));
  const prefixComputed = Array.from({ length: n + 1 }, () => Array(k + 1).fill(false));
  const steps = [];

  const snapshot = ({ phase, operation, codeLine, title, note, points = 0, segments = 0,
    skip = null, endHere = null, candidates = [], final = false }) => {
    steps.push({
      title,
      codeLines: [codeLine],
      lineSegments1621View: {
        n,
        k,
        phase,
        operation,
        ways: ways.map((row) => [...row]),
        prefix: prefix.map((row) => [...row]),
        computed: computed.map((row) => [...row]),
        prefixComputed: prefixComputed.map((row) => [...row]),
        points,
        segments,
        skip,
        endHere,
        candidates: candidates.map((candidate) => ({ ...candidate })),
        answer: final ? ways[n][k] : null,
        final,
      },
      vars: [
        { name: "n", value: n },
        { name: "k", value: k },
        ...(points > 0 ? [{ name: "points", value: points }, { name: "segments", value: segments }] : []),
        ...(skip != null ? [{ name: "skip", value: skip }] : []),
        ...(endHere != null ? [{ name: "end_here", value: endHere }] : []),
      ],
      note,
      final,
    });
  };

  ways[0][0] = 1;
  for (let segments = 0; segments <= k; segments += 1) {
    computed[0][segments] = true;
    prefixComputed[0][segments] = true;
  }
  snapshot({
    phase: "init",
    operation: "init",
    codeLine: 6,
    title: { vi: "Khởi tạo trạng thái không có điểm", en: "Initialize the zero-point states" },
    note: {
      vi: "Với 0 điểm, chỉ có một cách vẽ 0 đoạn. prefix[0][*] bằng 0 vì tổng prefix chỉ bắt đầu từ ít nhất 1 điểm.",
      en: "With 0 points there is one way to draw 0 segments. prefix[0][*] is zero because its running sum starts at one point.",
    },
  });

  for (let points = 1; points <= n; points += 1) {
    ways[points][0] = 1;
    computed[points][0] = true;
    snapshot({
      phase: "base",
      operation: "base-ways",
      codeLine: 8,
      points,
      segments: 0,
      title: { vi: `Gán ways[${points}][0] = 1`, en: `Set ways[${points}][0] = 1` },
      note: {
        vi: `Dùng ${points} điểm nhưng vẽ 0 đoạn luôn có đúng một cách: không chọn đoạn nào.`,
        en: `Using ${points} points and drawing 0 segments has exactly one configuration: choose nothing.`,
      },
    });

    prefix[points][0] = points;
    prefixComputed[points][0] = true;
    snapshot({
      phase: "base",
      operation: "base-prefix",
      codeLine: 9,
      points,
      segments: 0,
      title: { vi: `Gán prefix[${points}][0] = ${points}`, en: `Set prefix[${points}][0] = ${points}` },
      note: {
        vi: `prefix[${points}][0] = ways[1][0] + ··· + ways[${points}][0] = ${points}.`,
        en: `prefix[${points}][0] = ways[1][0] + ··· + ways[${points}][0] = ${points}.`,
      },
    });

    for (let segments = 1; segments <= k; segments += 1) {
      const skip = ways[points - 1][segments];
      snapshot({
        phase: "fill",
        operation: "read-skip",
        codeLine: 11,
        points,
        segments,
        skip,
        title: { vi: `Đọc nhánh bỏ điểm cuối: ${skip}`, en: `Read the skip branch: ${skip}` },
        note: {
          vi: `Không dùng điểm ${points - 1}; sao chép ways[${points - 1}][${segments}] = ${skip}.`,
          en: `Do not use point ${points - 1}; copy ways[${points - 1}][${segments}] = ${skip}.`,
        },
      });

      const candidates = [];
      for (let q = 1; q <= points - 1; q += 1) {
        candidates.push({
          start: q - 1,
          end: points - 1,
          priorPoints: q,
          priorWays: ways[q][segments - 1],
        });
      }
      const endHere = prefix[points - 1][segments - 1];
      snapshot({
        phase: "fill",
        operation: "read-prefix",
        codeLine: 12,
        points,
        segments,
        skip,
        endHere,
        candidates,
        title: { vi: `Đọc nhánh kết thúc tại ${points - 1}: ${endHere}`, en: `Read the end-here branch: ${endHere}` },
        note: {
          vi: `prefix[${points - 1}][${segments - 1}] = ${endHere} gom mọi vị trí có thể bắt đầu đoạn cuối.`,
          en: `prefix[${points - 1}][${segments - 1}] = ${endHere} aggregates every possible start of the final segment.`,
        },
      });

      ways[points][segments] = (skip + endHere) % MOD;
      computed[points][segments] = true;
      snapshot({
        phase: "fill",
        operation: "write-ways",
        codeLine: 13,
        points,
        segments,
        skip,
        endHere,
        candidates,
        title: {
          vi: `ways[${points}][${segments}] = ${ways[points][segments]}`,
          en: `ways[${points}][${segments}] = ${ways[points][segments]}`,
        },
        note: {
          vi: `Cộng hai nhánh: ${skip} + ${endHere} = ${ways[points][segments]}. Ô ways hiện tại được ghi ở bước này.`,
          en: `Add both branches: ${skip} + ${endHere} = ${ways[points][segments]}. This step writes the current ways cell.`,
        },
      });

      prefix[points][segments] = (prefix[points - 1][segments] + ways[points][segments]) % MOD;
      prefixComputed[points][segments] = true;
      snapshot({
        phase: "fill",
        operation: "write-prefix",
        codeLine: 14,
        points,
        segments,
        skip,
        endHere,
        candidates,
        title: { vi: `Cập nhật prefix[${points}][${segments}] = ${prefix[points][segments]}`, en: `Update prefix[${points}][${segments}] = ${prefix[points][segments]}` },
        note: {
          vi: `prefix[${points - 1}][${segments}] + ways[${points}][${segments}] = ${prefix[points - 1][segments]} + ${ways[points][segments]} = ${prefix[points][segments]}.`,
          en: `prefix[${points - 1}][${segments}] + ways[${points}][${segments}] = ${prefix[points - 1][segments]} + ${ways[points][segments]} = ${prefix[points][segments]}.`,
        },
      });
    }
  }

  snapshot({
    phase: "done",
    operation: "return",
    codeLine: 15,
    points: n,
    segments: k,
    final: true,
    title: { vi: `Kết quả: ${ways[n][k]}`, en: `Result: ${ways[n][k]}` },
    note: {
      vi: `ways[${n}][${k}] đếm mọi tập gồm đúng ${k} đoạn không chồng lấn; các đoạn có thể chung đầu mút.`,
      en: `ways[${n}][${k}] counts every set of exactly ${k} non-overlapping segments; segments may share endpoints.`,
    },
  });

  return { answer: ways[n][k], steps };
}

function binomial1621(n, r) {
  const choose = Math.min(r, n - r);
  let value = 1n;
  for (let i = 1; i <= choose; i += 1) {
    value = value * BigInt(n - choose + i) / BigInt(i);
  }
  return value;
}

function buildCombinationSteps1621(input, params = {}) {
  const { n, k } = validate1621Input(input, params);
  const totalDistance = n - 1;
  const remaining = totalDistance - k;
  const variables = 2 * k + 1;
  const bars = variables - 1;
  const totalSlots = remaining + bars;
  const answer = Number(binomial1621(totalSlots, bars) % 1000000007n);
  const parts = [];
  const shiftedParts = [];

  for (let index = 0; index <= k; index += 1) {
    parts.push({ kind: "gap", label: `g${index}`, minimum: 0 });
    shiftedParts.push({ kind: "gap", label: `g${index}`, minimum: 0 });
    if (index < k) {
      parts.push({ kind: "segment", label: `s${index + 1}`, minimum: 1 });
      shiftedParts.push({ kind: "segment", label: `t${index + 1}`, minimum: 0 });
    }
  }

  const values = {
    distance: totalDistance,
    mandatory_edges: k,
    remaining,
    variables,
    dividers: bars,
    total_slots: totalSlots,
  };
  const makeStep = ({ phase, operation, codeLine, title, note, visibleVars = [], final = false }) => ({
    title,
    codeBlock: 2,
    codeLines: [codeLine],
    lineSegments1621View: {
      approach: 2,
      phase,
      operation,
      n,
      k,
      totalDistance,
      remaining,
      variables,
      bars,
      totalSlots,
      parts: parts.map((part) => ({ ...part })),
      shiftedParts: shiftedParts.map((part) => ({ ...part })),
      revealed: Object.fromEntries(visibleVars.map((name) => [name, true])),
      answer: final ? answer : null,
      final,
    },
    vars: [
      { name: "n", value: n },
      { name: "k", value: k },
      ...visibleVars.map((name) => ({ name, value: values[name] })),
    ],
    note,
    final,
  });

  const steps = [
    makeStep({
      phase: "encode",
      operation: "distance",
      codeLine: 6,
      visibleVars: ["distance"],
      title: { vi: `Khoảng cách tổng = n − 1 = ${totalDistance}`, en: `Total distance = n − 1 = ${totalDistance}` },
      note: {
        vi: `Có ${k} độ dài đoạn sᵢ ≥ 1 và ${k + 1} khoảng trống gᵢ ≥ 0. Tổng của chúng bằng khoảng cách từ điểm 0 đến ${n - 1}: ${totalDistance}.`,
        en: `There are ${k} segment lengths sᵢ ≥ 1 and ${k + 1} gaps gᵢ ≥ 0. Their sum is the distance from point 0 to ${n - 1}: ${totalDistance}.`,
      },
    }),
    makeStep({
      phase: "encode",
      operation: "mandatory",
      codeLine: 7,
      visibleVars: ["distance", "mandatory_edges"],
      title: { vi: `${k} đoạn cần ${k} cạnh bắt buộc`, en: `${k} segments need ${k} mandatory edges` },
      note: {
        vi: `Mỗi đoạn phải nối ít nhất hai điểm nên dùng ít nhất một cạnh. Tổng phần bắt buộc là k = ${k}.`,
        en: `Every segment must connect at least two points, so it consumes at least one edge. The mandatory total is k = ${k}.`,
      },
    }),
    makeStep({
      phase: "shift",
      operation: "remaining",
      codeLine: 8,
      visibleVars: ["distance", "mandatory_edges", "remaining"],
      title: {
        vi: `Còn lại ${remaining} cạnh để phân phối`,
        en: `${remaining} ${remaining === 1 ? "edge remains" : "edges remain"} to distribute`,
      },
      note: {
        vi: `Đặt tᵢ = sᵢ − 1. Tất cả ${variables} biến mới đều không âm và tổng còn lại là ${totalDistance} − ${k} = ${remaining}.`,
        en: `Set tᵢ = sᵢ − 1. All ${variables} new variables are non-negative and their remaining sum is ${totalDistance} − ${k} = ${remaining}.`,
      },
    }),
    makeStep({
      phase: "stars",
      operation: "variables",
      codeLine: 9,
      visibleVars: ["distance", "mandatory_edges", "remaining", "variables"],
      title: { vi: `Có ${variables} biến không âm`, en: `There are ${variables} non-negative variables` },
      note: {
        vi: `${k + 1} biến khoảng trống g và ${k} biến phần mở rộng t tạo tổng cộng 2k + 1 = ${variables} ô.`,
        en: `${k + 1} gap variables g and ${k} extension variables t create 2k + 1 = ${variables} boxes.`,
      },
    }),
    makeStep({
      phase: "stars",
      operation: "dividers",
      codeLine: 10,
      visibleVars: ["distance", "mandatory_edges", "remaining", "variables", "dividers"],
      title: { vi: `${variables} ô cần ${bars} vạch ngăn`, en: `${variables} boxes need ${bars} dividers` },
      note: {
        vi: `Stars and Bars dùng số vạch bằng số ô trừ một: ${variables} − 1 = ${bars}.`,
        en: `Stars and bars uses one fewer divider than boxes: ${variables} − 1 = ${bars}.`,
      },
    }),
    makeStep({
      phase: "stars",
      operation: "total-slots",
      codeLine: 11,
      visibleVars: ["distance", "mandatory_edges", "remaining", "variables", "dividers", "total_slots"],
      title: { vi: `Tổng cộng ${totalSlots} vị trí`, en: `${totalSlots} total slots` },
      note: {
        vi: `${remaining} ngôi sao + ${bars} vạch = ${totalSlots} vị trí; chọn ${bars} vị trí cho các vạch.`,
        en: `${remaining} stars + ${bars} dividers = ${totalSlots} slots; choose ${bars} divider positions.`,
      },
    }),
    makeStep({
      phase: "done",
      operation: "return",
      codeLine: 12,
      visibleVars: ["distance", "mandatory_edges", "remaining", "variables", "dividers", "total_slots"],
      final: true,
      title: { vi: `Kết quả: C(${totalSlots}, ${bars}) = ${answer}`, en: `Result: C(${totalSlots}, ${bars}) = ${answer}` },
      note: {
        vi: `C(n + k − 1, 2k) = C(${totalSlots}, ${bars}) = ${answer}.`,
        en: `C(n + k − 1, 2k) = C(${totalSlots}, ${bars}) = ${answer}.`,
      },
    }),
  ];

  return { answer, steps };
}

module.exports = {
  1621: {
    id: 1621,
    difficulty: "medium",
    slug: "number-of-sets-of-k-non-overlapping-line-segments",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
      { key: "combinatorics", vi: "Tổ hợp", en: "Combinatorics" },
    ],
    title: { vi: "Number of Sets of K Non-Overlapping Line Segments", en: "Number of Sets of K Non-Overlapping Line Segments" },
    titleVi: { vi: "Số cách chọn K đoạn thẳng không chồng lấn", en: "Number of sets of K non-overlapping line segments" },
    statement: {
      vi: "Có n điểm 0..n-1 trên một đường thẳng. Đếm số cách vẽ đúng k đoạn không chồng lấn, mỗi đoạn phủ ít nhất hai điểm. Các đoạn được phép chung đầu mút. Trả kết quả modulo 10^9+7.",
      en: "Given n points numbered 0 through n-1 on a line, count the ways to draw exactly k non-overlapping segments, each covering at least two points. Segments may share endpoints. Return the count modulo 1e9+7.",
    },
    defaultInput: [4],
    inputKind: "positive",
    inputLabel: { vi: "n (2..10 để trực quan hóa)", en: "n (2..10 for visualization)" },
    singleInput: true,
    maxInput: 10,
    extraParams: [
      { key: "k", type: "number", label: { vi: "k (số đoạn)", en: "k (segments)" }, default: 2, min: 1, max: 9 },
      {
        key: "approach",
        type: "select",
        label: { vi: "Cách giải", en: "Approach" },
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: DP + prefix sum", en: "Approach 1: DP + prefix sum" } },
          { value: "2", label: { vi: "Cách 2: Tổ hợp (Stars and Bars)", en: "Approach 2: Combinatorics (Stars and Bars)" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1 — DP: ways[p][s] = ways[p-1][s] + prefix[p-1][s-1].", en: "Approach 1 — DP: ways[p][s] = ways[p-1][s] + prefix[p-1][s-1]." },
      { vi: "Cách 2 — Tổ hợp: biểu diễn cấu hình bằng k độ dài đoạn sᵢ ≥ 1 và k+1 khoảng trống gᵢ ≥ 0; tổng bằng n−1.", en: "Approach 2 — Combinatorics: encode a drawing with k segment lengths sᵢ ≥ 1 and k+1 gaps gᵢ ≥ 0; their sum is n−1." },
      { vi: "Đặt tᵢ = sᵢ−1. Có 2k+1 biến không âm với tổng n−1−k; Stars and Bars cho C(n+k−1, 2k).", en: "Set tᵢ = sᵢ−1. There are 2k+1 non-negative variables summing to n−1−k; stars and bars gives C(n+k−1, 2k)." },
    ],
    complexity: {
      time: "O(nk) / O(k)",
      space: "O(nk) / O(1)",
      note: {
        vi: "Cách 1 dùng bảng DP. Cách 2 tính trực tiếp một hệ số tổ hợp; O(k) bước số học với cách tính nhân/chia chuẩn.",
        en: "Approach 1 uses a DP table. Approach 2 evaluates one binomial coefficient in O(k) arithmetic steps with the standard multiplicative method.",
      },
    },
    debugMode: "semantic",
    codeLabel: { vi: "Cách 1: DP + prefix sum", en: "Approach 1: DP + prefix sum" },
    code2Label: { vi: "Cách 2: Tổ hợp (Stars and Bars)", en: "Approach 2: Combinatorics (Stars and Bars)" },
    code: [
      "class Solution:",
      "    def numberOfSets(self, n: int, k: int) -> int:",
      "        MOD = 10**9 + 7",
      "        ways = [[0] * (k + 1) for _ in range(n + 1)]",
      "        prefix = [[0] * (k + 1) for _ in range(n + 1)]",
      "        ways[0][0] = 1",
      "        for points in range(1, n + 1):",
      "            ways[points][0] = 1",
      "            prefix[points][0] = points",
      "            for segments in range(1, k + 1):",
      "                skip = ways[points - 1][segments]",
      "                end_here = prefix[points - 1][segments - 1]",
      "                ways[points][segments] = (skip + end_here) % MOD",
      "                prefix[points][segments] = (prefix[points - 1][segments] + ways[points][segments]) % MOD",
      "        return ways[n][k]",
    ],
    code2: [
      "import math",
      "",
      "class Solution:",
      "    def numberOfSets(self, n: int, k: int) -> int:",
      "        MOD = 10**9 + 7",
      "        distance = n - 1",
      "        mandatory_edges = k",
      "        remaining = distance - mandatory_edges",
      "        variables = 2 * k + 1",
      "        dividers = variables - 1",
      "        total_slots = remaining + dividers",
      "        return math.comb(total_slots, dividers) % MOD",
    ],
    liveArgs: (input, params) => {
      const parsed = validate1621Input(input, params);
      return [parsed.n, parsed.k];
    },
    builder: (input, params = {}) => Number(params.approach) === 2
      ? buildCombinationSteps1621(input, params)
      : buildSteps1621(input, params),
  },
};

// ─── 3524: Find X Value of Array I ───
// Removing a prefix and a suffix and keeping something non-empty is exactly
// "pick a non-empty contiguous subarray", so result[x] counts the subarrays
// whose product ≡ x (mod k). Since k ≤ 5, a DP keyed by the remainder of the
// subarrays ENDING at the current index runs in O(n·k) instead of O(n²).
function parseFindXValue3524Input(input, params = {}) {
  const raw = Array.isArray(input)
    ? input
    : String(input ?? "").trim().replace(/^\[|\]$/g, "").split(",");
  const nums = raw.map((item) => Number(String(item).trim()));
  if (!nums.length || !nums.every(Number.isInteger)) {
    throw new Error("nums must be a comma-separated list of integers.");
  }
  if (!nums.every((value) => value >= 1 && value <= 1000000000)) {
    throw new Error("nums values must be integers from 1 to 1,000,000,000.");
  }
  // The triangle of subarrays is drawn in full, so n is capped for the picture.
  if (nums.length > 10) throw new Error("Visualization supports up to 10 numbers.");
  const k = Number(params.k);
  if (!Number.isInteger(k) || k < 1 || k > 5) throw new Error("k must be an integer from 1 to 5.");
  return { nums, k };
}

function buildSteps3524(input, params = {}) {
  const { nums, k } = parseFindXValue3524Input(input, params);
  const n = nums.length;
  const steps = [];
  const stages = [
    { vi: "Khởi tạo ans và dp", en: "Initialize ans and dp" },
    { vi: "Mở rộng subarray kết thúc tại i", en: "Extend the subarrays ending at i" },
    { vi: "Cộng dồn vào ans", en: "Accumulate into ans" },
    { vi: "Trả về ans", en: "Return ans" },
  ];

  // Ground truth for the picture: the product remainder of every subarray.
  // grid[start][offset] describes the subarray nums[start .. start + offset].
  const grid = [];
  for (let start = 0; start < n; start += 1) {
    const row = [];
    let product = 1;
    for (let end = start; end < n; end += 1) {
      product = (product * (nums[end] % k)) % k;
      row.push({
        start,
        end,
        mod: product,
        // The remainder this subarray was extended from, i.e. nums[start..end-1].
        fromMod: end === start ? null : row[row.length - 1].mod,
      });
    }
    grid.push(row);
  }

  let index = -1;
  let num = null;
  let numMod = null;
  let dp = null;
  let newDp = null;
  let ans = null;
  let r = -1;
  let targetR = -1;
  let delta = null;
  let answer = null;

  const snap = ({ stage, phase, event, title, note, codeLine, final = false }) => {
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      final,
      vars: [
        { name: "num", value: num === null ? "—" : num },
        { name: "num_mod", value: numMod === null ? "—" : numMod },
        { name: "dp", value: dp ? `[${dp.join(",")}]` : "—" },
        { name: "new_dp", value: newDp ? `[${newDp.join(",")}]` : "—" },
        { name: "ans", value: ans ? `[${ans.join(",")}]` : "—" },
      ],
      findXValue3524View: {
        problemId: 3524,
        nums: [...nums],
        n,
        k,
        stages,
        stage,
        phase,
        event,
        index,
        num,
        numMod,
        dp: dp ? [...dp] : null,
        newDp: newDp ? [...newDp] : null,
        ans: ans ? [...ans] : null,
        r,
        targetR,
        delta,
        grid: grid.map((row) => row.map((cell) => ({ ...cell }))),
        answer: answer ? [...answer] : null,
        final,
      },
    });
  };

  const total = (n * (n + 1)) / 2;
  snap({
    stage: 0,
    phase: "intro",
    event: "rule",
    codeLine: 1,
    title: { vi: `Đếm ${total} subarray theo product % ${k}`, en: `Bucket all ${total} subarrays by product % ${k}` },
    note: {
      vi: `Bỏ một prefix và một suffix mà vẫn còn phần tử nghĩa là chọn đúng một subarray liên tiếp khác rỗng. Mảng có ${n} phần tử nên có ${n}·${n + 1}/2 = ${total} cách, và result[x] là số cách cho product % ${k} = x.`,
      en: `Removing a prefix and a suffix while leaving something behind is exactly picking one non-empty contiguous subarray. With ${n} elements there are ${n}·${n + 1}/2 = ${total} choices, and result[x] counts those whose product % ${k} equals x.`,
    },
  });

  ans = Array(k).fill(0);
  snap({
    stage: 0,
    phase: "init",
    event: "init-ans",
    codeLine: 2,
    title: { vi: `ans = [${ans.join(",")}]`, en: `ans = [${ans.join(",")}]` },
    note: {
      vi: `Một ô đếm cho mỗi số dư 0..${k - 1}. Vì k ≤ 5, bảng này luôn rất nhỏ.`,
      en: `One counter per remainder 0..${k - 1}. Because k ≤ 5 this table is always tiny.`,
    },
  });

  dp = Array(k).fill(0);
  snap({
    stage: 0,
    phase: "init",
    event: "init-dp",
    codeLine: 3,
    title: { vi: `dp = [${dp.join(",")}]`, en: `dp = [${dp.join(",")}]` },
    note: {
      vi: "dp[r] = số subarray KẾT THÚC tại vị trí vừa xử lý và có product % k = r. Đây là mấu chốt: chỉ cần giữ k con số, không cần duyệt lại mọi subarray.",
      en: "dp[r] = how many subarrays ENDING at the position just processed have product % k = r. That is the key: only k numbers are needed, never a re-scan of every subarray.",
    },
  });

  for (let i = 0; i < n; i += 1) {
    index = i;
    num = nums[i];
    numMod = null;
    newDp = null;
    r = -1;
    targetR = -1;
    delta = null;
    snap({
      stage: 1,
      phase: "element",
      event: "take-num",
      codeLine: 4,
      title: { vi: `num = nums[${i}] = ${num}`, en: `num = nums[${i}] = ${num}` },
      note: {
        vi: `Giờ xét mọi subarray kết thúc tại vị trí ${i}. Có đúng ${i + 1} subarray như vậy.`,
        en: `Now handle every subarray that ends at index ${i}. There are exactly ${i + 1} of them.`,
      },
    });

    newDp = Array(k).fill(0);
    snap({
      stage: 1,
      phase: "element",
      event: "reset-newdp",
      codeLine: 5,
      title: { vi: `new_dp = [${newDp.join(",")}]`, en: `new_dp = [${newDp.join(",")}]` },
      note: {
        vi: "new_dp sẽ đếm các subarray kết thúc tại vị trí hiện tại, dựng từ dp của vị trí trước.",
        en: "new_dp will count the subarrays ending at the current index, built from the previous index's dp.",
      },
    });

    numMod = num % k;
    snap({
      stage: 1,
      phase: "element",
      event: "num-mod",
      codeLine: 6,
      title: { vi: `num_mod = ${num} % ${k} = ${numMod}`, en: `num_mod = ${num} % ${k} = ${numMod}` },
      note: {
        vi: `Chỉ số dư của ${num} là quan trọng. Nhân thêm ${num} vào một subarray tương đương nhân số dư của nó với ${numMod} rồi lấy mod ${k}.`,
        en: `Only the remainder of ${num} matters. Appending ${num} to a subarray multiplies that subarray's remainder by ${numMod} modulo ${k}.`,
      },
    });

    newDp[numMod] = 1;
    snap({
      stage: 1,
      phase: "seed",
      event: "seed-single",
      codeLine: 7,
      title: { vi: `new_dp[${numMod}] = 1`, en: `new_dp[${numMod}] = 1` },
      note: {
        vi: `Subarray chỉ gồm một phần tử [${num}] có product % ${k} = ${numMod}. Đây là subarray duy nhất kết thúc tại ${i} mà không mở rộng từ subarray nào.`,
        en: `The single-element subarray [${num}] has product % ${k} = ${numMod}. It is the only subarray ending at ${i} that extends nothing.`,
      },
    });

    snap({
      stage: 1,
      phase: "extend",
      event: "extend-loop",
      codeLine: 8,
      title: { vi: `Mở rộng mọi subarray của dp`, en: `Extend every subarray recorded in dp` },
      note: {
        vi: `Mỗi subarray kết thúc tại ${i - 1} với số dư r, khi thêm ${num} vào cuối sẽ thành subarray kết thúc tại ${i} với số dư (r × ${numMod}) % ${k}.`,
        en: `Each subarray ending at ${i - 1} with remainder r becomes, after appending ${num}, a subarray ending at ${i} with remainder (r × ${numMod}) % ${k}.`,
      },
    });

    for (let rr = 0; rr < k; rr += 1) {
      r = rr;
      targetR = (rr * numMod) % k;
      delta = dp[rr];
      newDp[targetR] += delta;
      snap({
        stage: 1,
        phase: "extend",
        event: "extend",
        codeLine: 9,
        title: delta === 0
          ? { vi: `r = ${rr}: dp[${rr}] = 0, không có gì để mở rộng`, en: `r = ${rr}: dp[${rr}] = 0, nothing to extend` }
          : { vi: `r = ${rr}: (${rr} × ${numMod}) % ${k} = ${targetR}, new_dp[${targetR}] += ${delta}`, en: `r = ${rr}: (${rr} × ${numMod}) % ${k} = ${targetR}, new_dp[${targetR}] += ${delta}` },
        note: delta === 0
          ? { vi: `Không có subarray nào kết thúc tại ${i - 1} có số dư ${rr}, nên dòng này cộng 0.`, en: `No subarray ending at ${i - 1} has remainder ${rr}, so this line adds 0.` }
          : { vi: `${delta} subarray có số dư ${rr} chuyển hết sang số dư ${targetR}. Nhiều r khác nhau có thể dồn vào cùng một ô — đó là lý do phải cộng dồn chứ không gán.`, en: `${delta} subarrays with remainder ${rr} all move to remainder ${targetR}. Different r values can land in the same bucket, which is why this adds instead of assigns.` },
      });
    }

    r = -1;
    targetR = -1;
    delta = null;
    snap({
      stage: 2,
      phase: "accumulate",
      event: "accumulate-loop",
      codeLine: 10,
      title: { vi: `Cộng new_dp vào ans`, en: `Add new_dp into ans` },
      note: {
        vi: `new_dp = [${newDp.join(",")}] đã đếm đủ ${i + 1} subarray kết thúc tại ${i}; giờ dồn vào tổng chung.`,
        en: `new_dp = [${newDp.join(",")}] now accounts for all ${i + 1} subarrays ending at ${i}; fold it into the global totals.`,
      },
    });

    for (let rr = 0; rr < k; rr += 1) {
      r = rr;
      delta = newDp[rr];
      ans[rr] += delta;
      snap({
        stage: 2,
        phase: "accumulate",
        event: "accumulate",
        codeLine: 11,
        title: { vi: `ans[${rr}] += ${delta} → ${ans[rr]}`, en: `ans[${rr}] += ${delta} → ${ans[rr]}` },
        note: delta === 0
          ? { vi: `Không có subarray kết thúc tại ${i} nào cho số dư ${rr}.`, en: `No subarray ending at ${i} gives remainder ${rr}.` }
          : { vi: `Thêm ${delta} subarray kết thúc tại ${i} có số dư ${rr}; tổng cho số dư này là ${ans[rr]}.`, en: `Add ${delta} subarrays ending at ${i} with remainder ${rr}; the running total for that remainder is ${ans[rr]}.` },
      });
    }

    r = -1;
    delta = null;
    dp = [...newDp];
    snap({
      stage: 2,
      phase: "roll",
      event: "roll-dp",
      codeLine: 12,
      title: { vi: `dp = new_dp = [${dp.join(",")}]`, en: `dp = new_dp = [${dp.join(",")}]` },
      note: {
        vi: "Chỉ giữ lại một hàng duy nhất; vị trí trước đó không cần nữa nên bộ nhớ là O(k).",
        en: "Only one row is ever kept; the previous index is no longer needed, so memory stays O(k).",
      },
    });
  }

  index = n;
  num = null;
  numMod = null;
  newDp = null;
  r = -1;
  targetR = -1;
  delta = null;
  answer = [...ans];
  snap({
    stage: 3,
    phase: "done",
    event: "return",
    codeLine: 13,
    title: { vi: `Trả về [${answer.join(",")}]`, en: `Return [${answer.join(",")}]` },
    note: {
      vi: `Tổng các ô là ${answer.reduce((sum, value) => sum + value, 0)} = ${total}, đúng bằng số subarray khác rỗng — một phép kiểm tra nhanh rất hữu ích. Thời gian O(n·k), bộ nhớ O(k).`,
      en: `The buckets sum to ${answer.reduce((sum, value) => sum + value, 0)} = ${total}, exactly the number of non-empty subarrays — a handy sanity check. Time O(n·k), space O(k).`,
    },
    final: true,
  });

  return { input: nums, original: nums, answer, steps };
}

Object.assign(module.exports, {
  3524: {
    id: 3524,
    difficulty: "medium",
    slug: "find-x-value-of-array-i",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
      { key: "math", vi: "Toán học", en: "Math" },
      { key: "counting", vi: "Đếm", en: "Counting" },
    ],
    title: { vi: "Find X Value of Array I", en: "Find X Value of Array I" },
    titleVi: { vi: "Đếm subarray theo product % k", en: "Bucket subarrays by product % k" },
    statement: {
      vi: "Cho mảng số nguyên dương nums và số nguyên dương k. Được thực hiện đúng một lần phép toán: bỏ một prefix và một suffix không chồng nhau sao cho nums vẫn còn phần tử. x-value của nums là số cách thực hiện phép toán để product của phần còn lại chia k dư x. Trả về mảng result kích thước k với result[x] là x-value, 0 ≤ x ≤ k − 1.",
      en: "Given an array of positive integers nums and a positive integer k, you may perform one operation: remove a non-overlapping prefix and suffix so that nums stays non-empty. The x-value of nums is the number of ways to do this such that the product of what remains leaves remainder x modulo k. Return an array result of size k where result[x] is that x-value for 0 ≤ x ≤ k − 1.",
    },
    defaultInput: [1, 2, 3, 4, 5],
    inputKind: "positive",
    inputLabel: { vi: "nums (số nguyên dương, tối đa 10 số)", en: "nums (positive integers, at most 10)" },
    extraParams: [
      { key: "k", type: "number", label: { vi: "k (1..5)", en: "k (1..5)" }, default: 3, min: 1, max: 5 },
    ],
    approach: [
      { vi: "Bước đầu là đọc lại đề: bỏ một prefix và một suffix mà vẫn còn phần tử thì phần còn lại luôn là một subarray liên tiếp khác rỗng, và mỗi subarray ứng với đúng một cách bỏ. Vậy result[x] chỉ là số subarray có product % k = x, tổng các ô bằng n(n+1)/2.", en: "The first move is re-reading the statement: removing a prefix and a suffix while leaving something behind always leaves one non-empty contiguous subarray, and each subarray corresponds to exactly one removal. So result[x] is just the number of subarrays whose product % k equals x, and the buckets must sum to n(n+1)/2." },
      { vi: "Duyệt mọi subarray là O(n²), quá chậm với n tới 10⁵. Nhưng k ≤ 5, nên thay vì nhớ từng subarray chỉ cần nhớ ĐẾM theo số dư.", en: "Enumerating every subarray is O(n²), too slow for n up to 10⁵. But k ≤ 5, so instead of remembering individual subarrays it is enough to remember COUNTS per remainder." },
      { vi: "Đặt dp[r] = số subarray kết thúc tại vị trí i có product % k = r. Khi sang i+1 với num_mod = nums[i+1] % k: mọi subarray số dư r trở thành số dư (r × num_mod) % k, cộng thêm subarray một phần tử có số dư num_mod.", en: "Let dp[r] = the number of subarrays ending at index i whose product % k is r. Moving to i+1 with num_mod = nums[i+1] % k: every subarray with remainder r becomes remainder (r × num_mod) % k, plus the new single-element subarray with remainder num_mod." },
      { vi: "Nhiều số dư r khác nhau có thể ánh xạ vào cùng một ô (ví dụ num_mod = 0 gom tất cả về 0), nên phải CỘNG DỒN vào new_dp chứ không gán.", en: "Several remainders can map into the same bucket (num_mod = 0 collapses everything to 0), so new_dp must be ACCUMULATED into rather than assigned." },
      { vi: "Sau mỗi vị trí, cộng cả new_dp vào ans vì mọi subarray đều kết thúc tại đúng một vị trí — không đếm trùng, không sót. Tổng cộng O(n·k) thời gian và O(k) bộ nhớ.", en: "After each index, add all of new_dp into ans: every subarray ends at exactly one index, so nothing is double counted and nothing is missed. In total O(n·k) time and O(k) space." },
    ],
    complexity: {
      time: "O(n·k)",
      space: "O(k)",
      note: {
        vi: "Mỗi vị trí làm O(k) việc để dựng new_dp và O(k) việc để cộng vào ans; với k ≤ 5 thì thực tế là tuyến tính. Chỉ giữ hai hàng dài k nên bộ nhớ là O(k).",
        en: "Each index does O(k) work to build new_dp and O(k) to fold it into ans; with k ≤ 5 that is effectively linear. Only two rows of length k are kept, so space is O(k).",
      },
    },
    debugMode: "line-by-line",
    code: [
      "class Solution:",
      "    def resultArray(self, nums: List[int], k: int) -> List[int]:",
      "        ans = [0] * k",
      "        dp = [0] * k",
      "        for num in nums:",
      "            new_dp = [0] * k",
      "            num_mod = num % k",
      "            new_dp[num_mod] = 1",
      "            for r in range(k):",
      "                new_dp[(r * num_mod) % k] += dp[r]",
      "            for r in range(k):",
      "                ans[r] += new_dp[r]",
      "            dp = new_dp",
      "        return ans",
    ],
    liveArgs: (input, params) => {
      const { nums, k } = parseFindXValue3524Input(input, params);
      return [nums, k];
    },
    builder: buildSteps3524,
  },
});
