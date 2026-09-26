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
    codeLine: 2,
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
    codeLine: 3,
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
    codeLine: 4,
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
      codeLine: 5,
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
      codeLine: 6,
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
      codeLine: 7,
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
      codeLine: 8,
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
      codeLine: 9,
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
        codeLine: 10,
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
      codeLine: 11,
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
        codeLine: 12,
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
      codeLine: 13,
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
    codeLine: 14,
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

// ─── 3525: Find X Value of Array II ───
// Removing a suffix from nums[start..] leaves a PREFIX of that suffix, so a
// query counts the prefixes of nums[start..n-1] whose product ≡ x (mod k).
// Each segment-tree node stores prod (its whole range's product mod k) and
// cnt[r] (how many prefixes OF THAT NODE'S RANGE hit remainder r). The merge is
// the crux: prefixes inside the left child keep their remainder, while prefixes
// that swallow the left child entirely and continue into the right child get
// their remainder multiplied by left.prod.
function parseFindXValue3525Input(input, params = {}) {
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
  // The whole segment tree is drawn, so n is capped for the picture.
  if (nums.length > 8) throw new Error("Visualization supports up to 8 numbers.");
  const k = Number(params.k);
  if (!Number.isInteger(k) || k < 1 || k > 5) throw new Error("k must be an integer from 1 to 5.");

  const text = String(params.queries ?? "").trim();
  if (!text) throw new Error("Enter at least one query as index,value,start,x (separate queries with ';').");
  const groups = text.split(";").map((part) => part.trim()).filter(Boolean);
  if (groups.length > 4) throw new Error("Visualization supports up to 4 queries.");
  const queries = groups.map((group) => {
    const parts = group.split(",").map((item) => Number(item.trim()));
    if (parts.length !== 4 || !parts.every(Number.isInteger)) {
      throw new Error("Each query must be 4 integers: index,value,start,x.");
    }
    const [index, value, start, x] = parts;
    if (index < 0 || index > nums.length - 1) throw new Error(`Query index must be between 0 and ${nums.length - 1}.`);
    if (value < 1 || value > 1000000000) throw new Error("Query value must be between 1 and 1,000,000,000.");
    if (start < 0 || start > nums.length - 1) throw new Error(`Query start must be between 0 and ${nums.length - 1}.`);
    if (x < 0 || x > k - 1) throw new Error(`Query x must be between 0 and ${k - 1}.`);
    return { index, value, start, x };
  });
  return { nums, k, queries };
}

function buildSteps3525(input, params = {}) {
  const parsed = parseFindXValue3525Input(input, params);
  const { k, queries } = parsed;
  const original = [...parsed.nums];
  const nums = [...parsed.nums];
  const n = nums.length;
  const steps = [];
  const stages = [
    { vi: "Dựng segment tree", en: "Build the segment tree" },
    { vi: "Cập nhật nums[index]", en: "Update nums[index]" },
    { vi: "Truy vấn hậu tố [start..n−1]", en: "Query the suffix [start..n−1]" },
    { vi: "Đọc cnt[x]", en: "Read cnt[x]" },
  ];

  const prod = Array(4 * n).fill(1);
  const cnt = Array.from({ length: 4 * n }, () => Array(k).fill(0));
  const range = new Map();
  const ready = new Set();

  let queryIndex = -1;
  let activeU = -1;
  let leftU = -1;
  let rightU = -1;
  let pathU = [];
  let selectedU = [];
  let mergeInfo = null;
  let runningCnt = null;
  let runningProd = null;
  const answers = [];
  let answer = null;

  // Ground truth for the picture: the running product remainder of every
  // prefix of nums[start..n-1].
  const prefixProducts = (start) => {
    if (start === null) return null;
    const out = [];
    let running = 1;
    for (let j = start; j < n; j += 1) {
      running = (running * (nums[j] % k)) % k;
      out.push({ end: j, mod: running });
    }
    return out;
  };

  const nodesState = () => [...range.entries()]
    .map(([u, info]) => ({
      u,
      lo: info.lo,
      hi: info.hi,
      depth: info.depth,
      prod: ready.has(u) ? prod[u] : null,
      cnt: ready.has(u) ? [...cnt[u]] : null,
      ready: ready.has(u),
    }))
    .sort((a, b) => (a.depth - b.depth) || (a.lo - b.lo));

  const snap = ({ stage, phase, event, title, note, codeLines, start = null, x = null, final = false }) => {
    steps.push({
      title,
      note,
      codeLines,
      final,
      vars: [
        { name: "nums", value: `[${nums.join(",")}]` },
        { name: "query", value: queryIndex < 0 ? "—" : `#${queryIndex} ${JSON.stringify([queries[queryIndex].index, queries[queryIndex].value, queries[queryIndex].start, queries[queryIndex].x])}` },
        { name: "node", value: activeU < 0 ? "—" : `u=${activeU} [${range.get(activeU).lo}..${range.get(activeU).hi}]` },
        { name: "cnt[node]", value: activeU >= 0 && ready.has(activeU) ? `[${cnt[activeU].join(",")}]` : "—" },
        { name: "query cnt", value: runningCnt ? `[${runningCnt.join(",")}]` : "—" },
        { name: "ans", value: `[${answers.join(",")}]` },
      ],
      findXValue3525View: {
        problemId: 3525,
        nums: [...nums],
        original: [...original],
        n,
        k,
        queries: queries.map((q) => ({ ...q })),
        queryIndex,
        stages,
        stage,
        phase,
        event,
        nodes: nodesState(),
        activeU,
        leftU,
        rightU,
        pathU: [...pathU],
        selectedU: [...selectedU],
        merge: mergeInfo ? { ...mergeInfo, aCnt: [...mergeInfo.aCnt], bCnt: [...mergeInfo.bCnt], result: [...mergeInfo.result], shifts: mergeInfo.shifts.map((s) => ({ ...s })) } : null,
        prefixProducts: prefixProducts(start),
        start,
        x,
        runningCnt: runningCnt ? [...runningCnt] : null,
        runningProd,
        answers: [...answers],
        answer: answer ? [...answer] : null,
        final,
      },
    });
  };

  // cnt[a..b] = cnt[a] with cnt[b] folded in, each of b's remainders shifted by
  // a.prod because those prefixes now start by consuming all of a.
  const foldRight = (aProd, aCnt, bProd, bCnt) => {
    const result = [...aCnt];
    const shifts = [];
    for (let r = 0; r < k; r += 1) {
      const to = (aProd * r) % k;
      result[to] += bCnt[r];
      shifts.push({ r, to, amount: bCnt[r] });
    }
    return { aProd, bProd, aCnt: [...aCnt], bCnt: [...bCnt], result, shifts, prod: (aProd * bProd) % k };
  };

  snap({
    stage: 0,
    phase: "intro",
    event: "rule",
    codeLines: [5, 6, 7],
    title: { vi: `Segment tree trên ${n} phần tử, mỗi node giữ prod và cnt[${k}]`, en: `Segment tree over ${n} elements, each node stores prod and cnt[${k}]` },
    note: {
      vi: `Bỏ một suffix của nums[start..] thì phần còn lại là một PREFIX của đoạn đó, nên mỗi query đếm các prefix của nums[start..${n - 1}] có product % ${k} = x. Mỗi node giữ prod (product cả đoạn) và cnt[r] = số prefix CỦA ĐOẠN ĐÓ có số dư r.`,
      en: `Removing a suffix of nums[start..] leaves a PREFIX of that range, so a query counts the prefixes of nums[start..${n - 1}] whose product % ${k} is x. Each node stores prod (its whole range's product) and cnt[r] = how many prefixes OF THAT RANGE have remainder r.`,
    },
  });

  function emitMerge({ u, stage, phase, event, codeLines, start = null, x = null }) {
    const a = u * 2;
    const b = u * 2 + 1;
    leftU = a;
    rightU = b;
    activeU = u;
    mergeInfo = foldRight(prod[a], cnt[a], prod[b], cnt[b]);
    prod[u] = mergeInfo.prod;
    cnt[u] = [...mergeInfo.result];
    ready.add(u);
    const info = range.get(u);
    const moved = mergeInfo.shifts.filter((s) => s.amount > 0);
    snap({
      stage,
      phase,
      event,
      codeLines,
      start,
      x,
      title: {
        vi: `merge(u=${u}) [${info.lo}..${info.hi}]: prod=${prod[u]}, cnt=[${cnt[u].join(",")}]`,
        en: `merge(u=${u}) [${info.lo}..${info.hi}]: prod=${prod[u]}, cnt=[${cnt[u].join(",")}]`,
      },
      note: {
        vi: `Prefix nằm hẳn trong con trái giữ nguyên số dư (copy cnt[${a}]=[${mergeInfo.aCnt.join(",")}]). Prefix ăn trọn con trái rồi lấn sang con phải thì số dư bị nhân với prod[${a}]=${mergeInfo.aProd}${moved.length ? `: ${moved.map((s) => `${s.amount} prefix ${s.r}→${s.to}`).join(", ")}` : ", nhưng con phải chưa có prefix nào khác 0"}.`,
        en: `Prefixes living entirely inside the left child keep their remainder (copy cnt[${a}]=[${mergeInfo.aCnt.join(",")}]). Prefixes that swallow the left child and continue into the right child have their remainder multiplied by prod[${a}]=${mergeInfo.aProd}${moved.length ? `: ${moved.map((s) => `${s.amount} prefix ${s.r}→${s.to}`).join(", ")}` : ", but the right child contributes nothing here"}.`,
      },
    });
    mergeInfo = null;
    leftU = -1;
    rightU = -1;
  }

  (function build(u, lo, hi, depth) {
    range.set(u, { lo, hi, depth });
    if (lo === hi) {
      const v = nums[lo] % k;
      prod[u] = v;
      cnt[u] = Array(k).fill(0);
      cnt[u][v] = 1;
      ready.add(u);
      activeU = u;
      snap({
        stage: 0,
        phase: "build",
        event: "build-leaf",
        codeLines: [17, 18, 19, 20, 21],
        title: { vi: `Lá u=${u} = nums[${lo}]=${nums[lo]} → prod=${v}, cnt=[${cnt[u].join(",")}]`, en: `Leaf u=${u} = nums[${lo}]=${nums[lo]} → prod=${v}, cnt=[${cnt[u].join(",")}]` },
        note: {
          vi: `Một đoạn dài 1 chỉ có đúng một prefix: chính nó, số dư ${nums[lo]} % ${k} = ${v}.`,
          en: `A range of length 1 has exactly one prefix — itself — with remainder ${nums[lo]} % ${k} = ${v}.`,
        },
      });
      return;
    }
    const mid = Math.floor((lo + hi) / 2);
    build(u * 2, lo, mid, depth + 1);
    build(u * 2 + 1, mid + 1, hi, depth + 1);
    emitMerge({ u, stage: 0, phase: "build", event: "build-merge", codeLines: [23, 24, 25, 26] });
  })(1, 0, n - 1, 0);

  activeU = -1;
  snap({
    stage: 0,
    phase: "built",
    event: "built",
    codeLines: [54],
    title: { vi: `Cây đã dựng: cnt[gốc] = [${cnt[1].join(",")}]`, en: `Tree built: cnt[root] = [${cnt[1].join(",")}]` },
    note: {
      vi: `cnt[gốc] đếm các prefix của cả mảng, tổng = ${n}. Dựng mất O(n·k); mỗi update và mỗi query sau đó chỉ mất O(k·log n).`,
      en: `cnt[root] counts the prefixes of the whole array and sums to ${n}. Building costs O(n·k); every later update and query costs only O(k·log n).`,
    },
  });

  for (let qi = 0; qi < queries.length; qi += 1) {
    queryIndex = qi;
    const { index, value, start, x } = queries[qi];

    nums[index] = value;
    pathU = [];
    activeU = -1;
    snap({
      stage: 1,
      phase: "assign",
      event: "assign",
      codeLines: [57],
      start,
      x,
      title: { vi: `Query #${qi}: nums[${index}] = ${value}`, en: `Query #${qi}: nums[${index}] = ${value}` },
      note: {
        vi: `Thay đổi này GIỮ LẠI cho các query sau, nên cây phải được cập nhật thật chứ không chỉ tính tạm. nums giờ là [${nums.join(",")}].`,
        en: `This edit PERSISTS for later queries, so the tree must really be updated rather than patched temporarily. nums is now [${nums.join(",")}].`,
      },
    });

    (function update(u, lo, hi) {
      pathU = [...pathU, u];
      if (lo === hi) {
        const v = value % k;
        prod[u] = v;
        cnt[u] = Array(k).fill(0);
        cnt[u][v] = 1;
        activeU = u;
        snap({
          stage: 1,
          phase: "update",
          event: "update-leaf",
          codeLines: [29, 30, 31, 32],
          start,
          x,
          title: { vi: `Lá u=${u} [${lo}] → prod=${v}, cnt=[${cnt[u].join(",")}]`, en: `Leaf u=${u} [${lo}] → prod=${v}, cnt=[${cnt[u].join(",")}]` },
          note: {
            vi: `Ghi lại số dư mới ${value} % ${k} = ${v}. Giờ phải merge ngược lên gốc để mọi tổ tiên đúng lại.`,
            en: `Record the new remainder ${value} % ${k} = ${v}. Now merge back up to the root so every ancestor is correct again.`,
          },
        });
        return;
      }
      const mid = Math.floor((lo + hi) / 2);
      activeU = u;
      snap({
        stage: 1,
        phase: "update",
        event: "descend",
        codeLines: [34, 35, index <= mid ? 36 : 38],
        start,
        x,
        title: {
          vi: `u=${u} [${lo}..${hi}], mid=${mid} → đi ${index <= mid ? "trái" : "phải"}`,
          en: `u=${u} [${lo}..${hi}], mid=${mid} → go ${index <= mid ? "left" : "right"}`,
        },
        note: {
          vi: `index ${index} ${index <= mid ? `≤ ${mid} nên nằm trong con trái [${lo}..${mid}]` : `> ${mid} nên nằm trong con phải [${mid + 1}..${hi}]`}. Chỉ một nhánh cần đi, nên đường cập nhật dài O(log n).`,
          en: `index ${index} ${index <= mid ? `≤ ${mid}, so it lives in the left child [${lo}..${mid}]` : `> ${mid}, so it lives in the right child [${mid + 1}..${hi}]`}. Only one branch is followed, so the update path is O(log n) long.`,
        },
      });
      if (index <= mid) update(u * 2, lo, mid);
      else update(u * 2 + 1, mid + 1, hi);
      emitMerge({ u, stage: 1, phase: "update", event: "update-merge", codeLines: [39, 10, 11, 12, 13, 14], start, x });
    })(1, 0, n - 1);

    pathU = [];
    activeU = -1;
    selectedU = [];
    runningCnt = null;
    runningProd = null;

    // query(u, lo, hi, start): whole node when lo >= start, otherwise split.
    const result = (function query(u, lo, hi) {
      if (lo >= start) {
        selectedU = [...selectedU, u];
        activeU = u;
        snap({
          stage: 2,
          phase: "query",
          event: "query-whole",
          codeLines: [42, 43],
          start,
          x,
          title: { vi: `u=${u} [${lo}..${hi}] nằm trọn trong [${start}..${n - 1}] → dùng cả node`, en: `u=${u} [${lo}..${hi}] sits entirely inside [${start}..${n - 1}] → take the whole node` },
          note: {
            vi: `lo=${lo} ≥ start=${start}, nên cnt[${u}]=[${cnt[u].join(",")}] dùng được nguyên vẹn mà không cần đi sâu hơn.`,
            en: `lo=${lo} ≥ start=${start}, so cnt[${u}]=[${cnt[u].join(",")}] can be used as-is without descending further.`,
          },
        });
        return { prod: prod[u], cnt: [...cnt[u]] };
      }
      const mid = Math.floor((lo + hi) / 2);
      if (start > mid) {
        activeU = u;
        snap({
          stage: 2,
          phase: "query",
          event: "query-right-only",
          codeLines: [44, 45, 46],
          start,
          x,
          title: { vi: `u=${u} [${lo}..${hi}]: start=${start} > mid=${mid} → chỉ cần con phải`, en: `u=${u} [${lo}..${hi}]: start=${start} > mid=${mid} → only the right child matters` },
          note: {
            vi: `Cả con trái [${lo}..${mid}] nằm trước start nên bị bỏ hoàn toàn; không có gì để merge.`,
            en: `The entire left child [${lo}..${mid}] lies before start and is discarded; there is nothing to merge.`,
          },
        });
        return query(u * 2 + 1, mid + 1, hi);
      }
      activeU = u;
      snap({
        stage: 2,
        phase: "query",
        event: "query-split",
        codeLines: [44, 47, 48],
        start,
        x,
        title: { vi: `u=${u} [${lo}..${hi}]: start=${start} ≤ mid=${mid} → cắt con trái, lấy trọn con phải`, en: `u=${u} [${lo}..${hi}]: start=${start} ≤ mid=${mid} → clip the left child, take all of the right` },
        note: {
          vi: `Con trái chỉ góp phần [${start}..${mid}], còn con phải [${mid + 1}..${hi}] nằm trọn sau start nên lấy nguyên. Hai kết quả sẽ được merge bằng đúng quy tắc của merge().`,
          en: `The left child contributes only [${start}..${mid}], while the right child [${mid + 1}..${hi}] lies entirely after start and is taken whole. The two results are then combined with exactly the same rule as merge().`,
        },
      });
      const left = query(u * 2, lo, mid);
      const right = query(u * 2 + 1, mid + 1, hi);
      const folded = foldRight(left.prod, left.cnt, right.prod, right.cnt);
      mergeInfo = folded;
      activeU = u;
      runningCnt = [...folded.result];
      runningProd = folded.prod;
      const moved = folded.shifts.filter((s) => s.amount > 0);
      snap({
        stage: 2,
        phase: "query",
        event: "query-merge",
        codeLines: [49, 50, 51, 52],
        start,
        x,
        title: { vi: `Ghép hai mảnh tại u=${u} → cnt=[${folded.result.join(",")}]`, en: `Combine the two pieces at u=${u} → cnt=[${folded.result.join(",")}]` },
        note: {
          vi: `Mảnh trái có prod=${folded.aProd}, nên mọi prefix của mảnh phải bị dịch số dư ×${folded.aProd}${moved.length ? `: ${moved.map((s) => `${s.amount} prefix ${s.r}→${s.to}`).join(", ")}` : ""}. Thứ tự trái-trước-phải là bắt buộc: phép ghép này KHÔNG giao hoán.`,
          en: `The left piece has prod=${folded.aProd}, so every prefix of the right piece has its remainder shifted by ×${folded.aProd}${moved.length ? `: ${moved.map((s) => `${s.amount} prefix ${s.r}→${s.to}`).join(", ")}` : ""}. Left-before-right matters: this combination is NOT commutative.`,
        },
      });
      mergeInfo = null;
      return { prod: folded.prod, cnt: folded.result };
    })(1, 0, n - 1);

    runningCnt = [...result.cnt];
    runningProd = result.prod;
    answers.push(result.cnt[x]);
    activeU = -1;
    snap({
      stage: 3,
      phase: "answer",
      event: "read",
      codeLines: [59],
      start,
      x,
      title: { vi: `cnt[${x}] = ${result.cnt[x]} → result[${qi}] = ${result.cnt[x]}`, en: `cnt[${x}] = ${result.cnt[x]} → result[${qi}] = ${result.cnt[x]}` },
      note: {
        vi: `Trong [${start}..${n - 1}] có ${result.cnt[x]} prefix cho product % ${k} = ${x}. Tổng mọi ô cnt là ${result.cnt.reduce((a, b) => a + b, 0)} = số phần tử của đoạn.`,
        en: `Inside [${start}..${n - 1}] there are ${result.cnt[x]} prefixes with product % ${k} = ${x}. The cnt buckets sum to ${result.cnt.reduce((a, b) => a + b, 0)}, the length of the range.`,
      },
    });
  }

  queryIndex = -1;
  selectedU = [];
  runningCnt = null;
  runningProd = null;
  answer = [...answers];
  snap({
    stage: 3,
    phase: "done",
    event: "return",
    codeLines: [60],
    title: { vi: `Trả về [${answer.join(",")}]`, en: `Return [${answer.join(",")}]` },
    note: {
      vi: `Khác bài 3524 (đếm mọi subarray một lần), ở đây nums bị sửa giữa các query nên phải có cấu trúc cập nhật được: segment tree cho O(k·log n) mỗi lần thay vì O(n·k) làm lại từ đầu.`,
      en: `Unlike 3524, which counts every subarray once, here nums changes between queries, so an updatable structure is required: the segment tree gives O(k·log n) per query instead of redoing O(n·k) work.`,
    },
    final: true,
  });

  return { original, answer, steps };
}

Object.assign(module.exports, {
  3525: {
    id: 3525,
    difficulty: "hard",
    slug: "find-x-value-of-array-ii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "segment-tree", vi: "Segment Tree", en: "Segment Tree" },
      { key: "math", vi: "Toán học", en: "Math" },
      { key: "counting", vi: "Đếm", en: "Counting" },
    ],
    title: { vi: "Find X Value of Array II", en: "Find X Value of Array II" },
    titleVi: { vi: "Đếm prefix theo product % k, có cập nhật", en: "Count prefixes by product % k, with updates" },
    statement: {
      vi: "Cho mảng số nguyên dương nums, số nguyên dương k và các query [index, value, start, x]. Với mỗi query: gán nums[index] = value (thay đổi này GIỮ LẠI cho các query sau), bỏ prefix nums[0..start−1], rồi đếm số cách bỏ một suffix sao cho nums còn khác rỗng và product phần còn lại chia k dư x. Trả về mảng kết quả cho từng query.",
      en: "Given an array of positive integers nums, a positive integer k, and queries [index, value, start, x]: for each query set nums[index] = value (the edit PERSISTS for later queries), remove the prefix nums[0..start−1], then count the ways to remove a suffix leaving nums non-empty such that the product of what remains leaves remainder x modulo k. Return the answer for each query.",
    },
    defaultInput: [1, 2, 3, 4, 5],
    inputKind: "positive",
    inputLabel: { vi: "nums (số nguyên dương, tối đa 8 số)", en: "nums (positive integers, at most 8)" },
    extraParams: [
      { key: "k", type: "number", label: { vi: "k (1..5)", en: "k (1..5)" }, default: 3, min: 1, max: 5 },
      { key: "queries", type: "string", label: { vi: "queries: index,value,start,x — cách nhau bởi ';'", en: "queries: index,value,start,x — separated by ';'" }, default: "2,2,0,2;3,3,3,0;0,1,0,1" },
    ],
    approach: [
      { vi: "Đọc lại đề cho gọn: sau khi bỏ prefix tới start, bỏ một suffix nghĩa là giữ lại một PREFIX của nums[start..n−1]. Vậy mỗi query chỉ là: đếm các prefix của nums[start..n−1] có product % k = x.", en: "Simplify the statement first: after the prefix up to start is gone, removing a suffix means keeping a PREFIX of nums[start..n−1]. So each query is just: count the prefixes of nums[start..n−1] whose product % k equals x." },
      { vi: "Khác bài 3524, nums bị SỬA giữa các query và thay đổi đó giữ lại, nên không thể tiền xử lý một lần. Cần cấu trúc vừa cập nhật được vừa trả lời được trên một đoạn — segment tree.", en: "Unlike 3524, nums is MUTATED between queries and the edit persists, so a single preprocessing pass is impossible. What is needed is a structure that supports both updates and range answers — a segment tree." },
      { vi: "Mỗi node giữ hai thứ: prod = product của cả đoạn mod k, và cnt[r] = số prefix CỦA ĐOẠN ĐÓ có số dư r. Lá dài 1 có prod = nums[i] % k và đúng một prefix.", en: "Each node stores two things: prod = the product of its whole range mod k, and cnt[r] = how many prefixes OF THAT RANGE have remainder r. A length-1 leaf has prod = nums[i] % k and exactly one prefix." },
      { vi: "Mấu chốt là phép merge. Prefix nằm hẳn trong con trái giữ nguyên số dư nên cnt được copy y nguyên. Prefix ăn trọn con trái rồi lấn sang con phải thì số dư bị nhân với prod của con trái: cnt[left.prod × r % k] += right.cnt[r].", en: "The merge is the crux. A prefix living entirely inside the left child keeps its remainder, so its cnt is copied unchanged. A prefix that swallows the left child and continues into the right child has its remainder multiplied by the left child's prod: cnt[left.prod × r % k] += right.cnt[r]." },
      { vi: "Phép merge này KHÔNG giao hoán — đổi chỗ trái phải là sai, vì chỉ prefix của mảnh bên phải mới bị nhân thêm. Truy vấn [start..n−1] cũng dùng đúng quy tắc đó khi ghép các mảnh, và phải ghép theo thứ tự từ trái sang phải.", en: "This merge is NOT commutative — swapping left and right is wrong, because only the right piece's prefixes get the extra multiplication. The query over [start..n−1] combines its pieces with the very same rule, and must combine them left to right." },
      { vi: "Dựng cây O(n·k); mỗi query gồm một update O(k·log n) và một truy vấn O(k·log n), thay vì làm lại O(n·k) từ đầu sau mỗi lần sửa.", en: "Building costs O(n·k); each query is one O(k·log n) update plus one O(k·log n) range answer, instead of redoing O(n·k) work after every edit." },
    ],
    complexity: {
      time: "O(n·k + q·k·log n)",
      space: "O(n·k)",
      note: {
        vi: "Mỗi node giữ một vector dài k nên cây tốn O(n·k) bộ nhớ. Update đi một đường gốc–lá và merge lại mỗi tầng: O(k·log n). Truy vấn hậu tố cũng chỉ chạm O(log n) node.",
        en: "Each node holds a length-k vector, so the tree costs O(n·k) memory. An update walks one root-to-leaf path and re-merges at each level: O(k·log n). The suffix query touches only O(log n) nodes.",
      },
    },
    debugMode: "line-by-line",
    code: [
      "from typing import List",
      "",
      "class Solution:",
      "    def resultArray(self, nums: List[int], k: int, queries: List[List[int]]) -> List[int]:",
      "        n = len(nums)",
      "        prod = [1] * (4 * n)",
      "        cnt = [[0] * k for _ in range(4 * n)]",
      "",
      "        def merge(u):",
      "            left, right = u * 2, u * 2 + 1",
      "            prod[u] = prod[left] * prod[right] % k",
      "            cnt[u] = cnt[left][:]",
      "            for r in range(k):",
      "                cnt[u][prod[left] * r % k] += cnt[right][r]",
      "",
      "        def build(u, lo, hi):",
      "            if lo == hi:",
      "                v = nums[lo] % k",
      "                prod[u] = v",
      "                cnt[u] = [0] * k",
      "                cnt[u][v] = 1",
      "                return",
      "            mid = (lo + hi) // 2",
      "            build(u * 2, lo, mid)",
      "            build(u * 2 + 1, mid + 1, hi)",
      "            merge(u)",
      "",
      "        def update(u, lo, hi, i, v):",
      "            if lo == hi:",
      "                prod[u] = v % k",
      "                cnt[u] = [0] * k",
      "                cnt[u][v % k] = 1",
      "                return",
      "            mid = (lo + hi) // 2",
      "            if i <= mid:",
      "                update(u * 2, lo, mid, i, v)",
      "            else:",
      "                update(u * 2 + 1, mid + 1, hi, i, v)",
      "            merge(u)",
      "",
      "        def query(u, lo, hi, left):",
      "            if lo >= left:",
      "                return prod[u], cnt[u]",
      "            mid = (lo + hi) // 2",
      "            if left > mid:",
      "                return query(u * 2 + 1, mid + 1, hi, left)",
      "            lp, lc = query(u * 2, lo, mid, left)",
      "            rp, rc = query(u * 2 + 1, mid + 1, hi, left)",
      "            total = lc[:]",
      "            for r in range(k):",
      "                total[lp * r % k] += rc[r]",
      "            return lp * rp % k, total",
      "",
      "        build(1, 0, n - 1)",
      "        ans = []",
      "        for index, value, start, x in queries:",
      "            nums[index] = value",
      "            update(1, 0, n - 1, index, value)",
      "            ans.append(query(1, 0, n - 1, start)[1][x])",
      "        return ans",
    ],
    liveArgs: (input, params) => {
      const { nums, k, queries } = parseFindXValue3525Input(input, params);
      return [nums, k, queries.map((q) => [q.index, q.value, q.start, q.x])];
    },
    builder: buildSteps3525,
  },
});
