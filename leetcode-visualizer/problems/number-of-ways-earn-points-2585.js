"use strict";

const MOD = 1000000007;
const MAX_TRACE = 600;
const bi = (vi, en) => ({ vi, en });

const CODE = Object.freeze([
  "class Solution:",
  "    def waysToReachTarget(self, target, types):",
  "        MOD = 10**9 + 7",
  "        dp = [0] * (target + 1)",
  "        dp[0] = 1",
  "        for count, points in types:",
  "            next_dp = [0] * (target + 1)",
  "            for score in range(target + 1):",
  "                max_questions = min(count, score // points)",
  "                for used in range(max_questions + 1):",
  "                    next_dp[score] = (next_dp[score] + dp[score - used * points]) % MOD",
  "            dp = next_dp",
  "        return dp[target]",
]);

function parse2585Types(raw) {
  let types = raw;
  if (typeof raw === "string") {
    const value = raw.trim();
    if (!value) throw new TypeError("2585: types cannot be empty.");
    try {
      types = value.startsWith("[")
        ? JSON.parse(value)
        : value.split(";").map((pair) => pair.split(",").map((part) => Number(part.trim())));
    } catch (_error) {
      throw new TypeError("2585: types must be JSON pairs or count,points pairs separated by semicolons.");
    }
  }
  if (!Array.isArray(types) || types.length < 1 || types.length > 50
    || types.some((type) => !Array.isArray(type) || type.length !== 2
      || !Number.isInteger(type[0]) || type[0] < 1 || type[0] > 50
      || !Number.isInteger(type[1]) || type[1] < 1 || type[1] > 1000)) {
    throw new RangeError("2585: types must contain 1–50 [count, points] pairs with count in [1, 50] and points in [1, 1000].");
  }
  return types.map(([count, points]) => [count, points]);
}

function parse2585Input(input, params = {}) {
  const target = Number(input);
  if (!Number.isInteger(target) || target < 1 || target > 1000) {
    throw new RangeError("2585: target must be an integer in [1, 1000].");
  }
  return { target, types: parse2585Types(params.types) };
}

function buildSteps2585(input, params = {}) {
  const { target, types } = parse2585Input(input, params);
  let dp = Array(target + 1).fill(0);
  const steps = [];
  let nextDp = Array(target + 1).fill(0);
  let typeIndex = -1;
  let count = null;
  let points = null;
  let score = null;
  let used = null;
  let transition = null;
  let answer = null;
  let truncated = false;

  function record(event, line, final = false) {
    if (!final && steps.length >= MAX_TRACE) {
      truncated = true;
      return;
    }
    const visible = new Set([0, 1, 2, target - 2, target - 1, target]);
    for (const center of [score, transition?.source, transition?.score]) {
      if (!Number.isInteger(center)) continue;
      for (let offset = -2; offset <= 2; offset += 1) {
        if (center + offset >= 0 && center + offset <= target) visible.add(center + offset);
      }
    }
    const cells = [...visible]
      .filter((value) => value >= 0 && value <= target)
      .sort((a, b) => a - b)
      .map((value) => ({ score: value, ways: dp[value], nextWays: nextDp[value] }));
    const activeType = typeIndex >= 0 ? { count, points } : null;
    steps.push({
      arr: [],
      highlight: [],
      mark: [],
      title: bi("Đếm cách đạt đúng target", "Count ways to reach target"),
      note: bi("", ""),
      codeLines: [line],
      final,
      vars: [
        { name: "type", value: typeIndex < 0 ? "—" : typeIndex },
        { name: "score", value: score ?? "—" },
        { name: "used", value: used ?? "—" },
      ],
      waysToEarnPoints2585View: {
        target,
        types: types.map(([typeCount, typePoints]) => ({ count: typeCount, points: typePoints })),
        typeIndex,
        activeType,
        score,
        used,
        event,
        transition: transition ? { ...transition } : null,
        cells,
        cropped: cells.length < target + 1,
        answer,
        modulo: MOD,
        truncated,
      },
    });
  }

  record("bind-class", 1);
  record("enter-method", 2);
  record("set-modulo", 3);
  record("allocate-dp", 4);
  dp[0] = 1;
  record("seed-empty-choice", 5);

  for (typeIndex = 0; typeIndex < types.length; typeIndex += 1) {
    [count, points] = types[typeIndex];
    score = null;
    used = null;
    transition = null;
    record("select-type", 6);
    nextDp = Array(target + 1).fill(0);
    record("allocate-next", 7);
    for (score = 0; score <= target; score += 1) {
      used = null;
      transition = null;
      record("select-score", 8);
      const maxQuestions = Math.min(count, Math.floor(score / points));
      record("limit-questions", 9);
      for (used = 0; used <= maxQuestions; used += 1) {
        const source = score - used * points;
        const ways = dp[source];
        const before = nextDp[score];
        transition = { score, used, source, ways, before, after: null, maxQuestions };
        record("select-quantity", 10);
        const after = (before + ways) % MOD;
        nextDp[score] = after;
        transition.after = after;
        record("add-choice", 11);
      }
    }
    dp = nextDp;
    score = null;
    used = null;
    transition = null;
    record("commit-type", 12);
  }

  answer = dp[target];
  score = target;
  record("return-answer", 13, true);
  return { original: target, types, answer, steps };
}

module.exports = {
  2585: {
    id: 2585,
    difficulty: "hard",
    slug: "number-of-ways-to-earn-points",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "0-1-knapsack", vi: "Balo 0/1", en: "0/1 Knapsack" },
      { key: "counting", vi: "Đếm số cách", en: "Counting" },
    ],
    title: bi("Number of Ways to Earn Points", "Number of Ways to Earn Points"),
    titleVi: bi("Đếm cách đạt tổng điểm", "Count ways to reach a target score"),
    statement: bi(
      "Mỗi loại câu hỏi có số lượng giới hạn và số điểm cố định. Đếm số cách chọn câu để đạt đúng target điểm, lấy modulo 10⁹ + 7.",
      "Each question type has a limited count and a fixed score. Count ways to earn exactly target points, modulo 10⁹ + 7.",
    ),
    defaultInput: 6,
    inputKind: "positive",
    singleInput: true,
    inputLabel: bi("target (điểm cần đạt)", "target (score to reach)"),
    extraParams: [
      {
        key: "types",
        type: "string",
        label: bi("types (số câu, điểm mỗi câu)", "types (count, points per question)"),
        default: "6,1;3,2;2,3",
      },
    ],
    debugMode: "line-by-line",
    approach: [
      bi("dp[s] = số cách đạt s điểm sau các loại đã xử lý.", "dp[s] = ways to make score s using processed types."),
      bi("Mỗi loại thử dùng 0..count câu; next_dp tách lớp mới để không dùng quá giới hạn.", "For each type, try 0..count questions; next_dp keeps the new layer separate to enforce the limit."),
      bi("Cộng số cách từ dp[score − used × points], modulo 10⁹ + 7.", "Add ways from dp[score − used × points], modulo 10⁹ + 7."),
    ],
    complexity: {
      time: "O(target × Σ min(count, target / points))",
      space: "O(target)",
      note: bi("Duyệt số câu dùng được trong từng loại; mỗi loại ghi vào mảng kế tiếp.", "Enumerate how many questions to use per type; each type writes to a separate next array."),
    },
    code: CODE,
    liveArgs: (input, params) => {
      const parsed = parse2585Input(input, params);
      return [parsed.target, parsed.types];
    },
    parseInput: parse2585Input,
    builder: buildSteps2585,
  },
};
