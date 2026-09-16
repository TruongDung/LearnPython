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
