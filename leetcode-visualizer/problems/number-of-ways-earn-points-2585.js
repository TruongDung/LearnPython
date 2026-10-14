"use strict";

const MOD = 1000000007;
const MAX_TRACE = 600;
const bi = (vi, en) => ({ vi, en });

const CODE = Object.freeze([
  "class Solution:",
  "    def waysToReachTarget(self, target, types):",
  "        MOD = 10**9 + 7",
  "",
  "        dp = [0] * (target + 1)",
  "        dp[0] = 1",
  "",
  "        for count, points in types:",
  "            next_dp = [0] * (target + 1)",
  "",
  "            for score in range(target + 1):",
  "                next_dp[score] = dp[score]",
  "",
  "                if score >= points:",
  "                    next_dp[score] += next_dp[score - points]",
  "",
  "                if score >= (count + 1) * points:",
  "                    next_dp[score] -= dp[score - (count + 1) * points]",
  "",
  "                next_dp[score] %= MOD",
  "",
  "            dp = next_dp",
  "",
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
        { name: "count", value: count ?? "—" },
        { name: "points", value: points ?? "—" },
      ],
      waysToEarnPoints2585View: {
        target,
        types: types.map(([typeCount, typePoints]) => ({ count: typeCount, points: typePoints })),
        typeIndex,
        activeType,
        score,
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
  record("allocate-dp", 5);
  dp[0] = 1;
  record("seed-empty-choice", 6);

  for (typeIndex = 0; typeIndex < types.length; typeIndex += 1) {
    [count, points] = types[typeIndex];
    score = null;
    transition = null;
    record("select-type", 8);
    nextDp = Array(target + 1).fill(0);
    record("allocate-next", 9);
    for (score = 0; score <= target; score += 1) {
      transition = null;
      record("select-score", 11);

      const copiedWays = dp[score];
      nextDp[score] = copiedWays;
      transition = { operation: "copy", score, source: score, ways: copiedWays, before: 0, after: copiedWays };
      record("copy-current", 12);

      const canInclude = score >= points;
      transition = { operation: "include-check", score, points, canApply: canInclude };
      record("check-include", 14);
      if (canInclude) {
        const source = score - points;
        const before = nextDp[score];
        const ways = nextDp[source];
        const after = before + ways;
        transition = { operation: "include", score, source, ways, before, after };
        nextDp[score] = after;
        record("include-previous", 15);
      }

      const canExpire = score >= (count + 1) * points;
      transition = { operation: "expire-check", score, points, count, canApply: canExpire };
      record("check-expire", 17);
      if (canExpire) {
        const source = score - (count + 1) * points;
        const before = nextDp[score];
        const ways = dp[source];
        const after = before - ways;
        transition = { operation: "expire", score, source, ways, before, after };
        nextDp[score] = after;
        record("subtract-expired", 18);
      }

      const beforeModulo = nextDp[score];
      const afterModulo = ((beforeModulo % MOD) + MOD) % MOD;
      transition = { operation: "modulo", score, before: beforeModulo, after: afterModulo };
      nextDp[score] = afterModulo;
      record("normalize-modulo", 20);
    }
    dp = nextDp;
    score = null;
    transition = null;
    record("commit-type", 22);
  }

  answer = dp[target];
  score = target;
  record("return-answer", 24, true);
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
      bi("Quét điểm tăng dần để cộng cách dùng thêm một câu vào next_dp.", "Scan scores upward to add ways that use one more question from this type."),
      bi("Trừ cách đã vượt count câu; lấy modulo sau mỗi điểm.", "Subtract ways that exceed count questions; apply modulo at each score."),
    ],
    complexity: {
      time: "O(target × types)",
      space: "O(target)",
      note: bi("Cửa sổ trượt giới hạn số câu cho mỗi loại.", "A sliding window bounds the number of questions used per type."),
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
