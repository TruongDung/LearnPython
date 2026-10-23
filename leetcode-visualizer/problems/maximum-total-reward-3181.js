"use strict";

const bi = (vi, en) => ({ vi, en });

const CODE = [
  "class Solution:",
  "    def maxTotalReward(self, rewardValues):",
  "        rewards = sorted(set(rewardValues))",
  "        bits = 1",
  "        for reward in rewards:",
  "            eligible = bits & ((1 << reward) - 1)",
  "            shifted = eligible << reward",
  "            bits |= shifted",
  "        return bits.bit_length() - 1",
];

function parseRewards(input) {
  let rewards = input;
  if (typeof input === "string") rewards = input.trim().split(/[\s,;]+/).filter(Boolean).map(Number);
  if (input && !Array.isArray(input) && typeof input === "object") rewards = input.rewardValues;
  if (!Array.isArray(rewards) || rewards.length < 1 || rewards.length > 8
    || rewards.some((value) => !Number.isInteger(value) || value < 1 || value > 12)) {
    throw new RangeError("3181: Use 1–8 rewards from 1 to 12 / Nhập 1–8 giá trị thưởng từ 1 đến 12.");
  }
  return [...rewards];
}

function buildSteps(input) {
  const original = parseRewards(input);
  const rewards = [...new Set(original)].sort((a, b) => a - b);
  const limit = 2 * Math.max(...rewards);
  const steps = [];
  const paths = new Map([[0, []]]);
  let bits = 0n;
  let rewardIndex = null;
  let reward = null;
  let eligible = [];
  let shifted = [];
  let answer = null;

  const reachableTotals = (value) => {
    const totals = [];
    for (let total = 0; total < limit; total++) {
      if (((value >> BigInt(total)) & 1n) === 1n) totals.push(total);
    }
    return totals;
  };

  const title = (event) => ({
    start: bi("Bắt đầu", "Start"),
    sort: bi("Gộp thưởng trùng", "Sort unique rewards"),
    seed: bi("Bật tổng 0", "Light up total 0"),
    reward: bi(`Thưởng ${reward}`, `Reward ${reward}`),
    mask: bi(`Giữ tổng < ${reward}`, `Keep totals < ${reward}`),
    shift: bi(`Dịch +${reward}`, `Shift by +${reward}`),
    merge: bi("Bật tổng mới", "Merge new totals"),
    done: bi(`Cao nhất: ${answer}`, `Highest: ${answer}`),
  }[event]);

  function emit(line, event, beforeBits = bits, changed = []) {
    const after = reachableTotals(bits);
    const before = reachableTotals(beforeBits);
    steps.push({
      title: title(event), note: bi("", ""), arr: [...original],
      highlight: Number.isInteger(reward) ? [original.indexOf(reward)] : [], mark: [],
      codeLines: [line], final: event === "done",
      vars: [
        { name: "reward", value: reward ?? "—" },
        { name: "eligible", value: `{${eligible.join(",")}}` },
        { name: "shifted", value: `{${shifted.join(",")}}` },
        { name: "bits", value: `{${after.join(",")}}` },
      ],
      reward3181View: {
        event, original: [...original], rewards: [...rewards], limit, rewardIndex,
        reward, eligible: [...eligible], shifted: [...shifted], before, after,
        changed: [...changed], answer,
        processedCount: event === "done" ? rewards.length : rewardIndex === null ? 0 : rewardIndex,
        witness: answer === null ? [] : [...(paths.get(answer) || [])],
      },
    });
  }

  emit(2, "start");
  emit(3, "sort");
  bits = 1n;
  emit(4, "seed", 0n, [0]);

  rewards.forEach((value, index) => {
    rewardIndex = index;
    reward = value;
    eligible = [];
    shifted = [];
    emit(5, "reward");

    const beforeBits = bits;
    const mask = (1n << BigInt(reward)) - 1n;
    const eligibleBits = bits & mask;
    eligible = reachableTotals(eligibleBits);
    emit(6, "mask");

    const shiftedBits = eligibleBits << BigInt(reward);
    shifted = reachableTotals(shiftedBits);
    emit(7, "shift");

    const priorTotals = new Set(reachableTotals(beforeBits));
    const changed = shifted.filter((total) => !priorTotals.has(total));
    changed.forEach((total) => {
      const source = total - reward;
      paths.set(total, [...(paths.get(source) || []), reward]);
    });
    bits |= shiftedBits;
    emit(8, "merge", beforeBits, changed);
  });

  answer = reachableTotals(bits).at(-1) ?? 0;
  rewardIndex = null;
  reward = null;
  eligible = [];
  shifted = [];
  emit(9, "done");
  return { original, answer, steps };
}

module.exports = {
  3181: {
    id: 3181,
    slug: "maximum-total-reward-using-operations-ii",
    difficulty: "hard",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "bitmask", vi: "Bitset", en: "Bitset" },
    ],
    title: bi("Maximum Total Reward II", "Maximum Total Reward II"),
    titleVi: bi("Tổng thưởng lớn nhất II", "Maximum total reward II"),
    statement: bi("Chỉ nhận thưởng r khi tổng hiện tại nhỏ hơn r. Tìm tổng lớn nhất.", "Add reward r only while your total is less than r. Find the maximum total."),
    defaultInput: [1, 6, 4, 3, 2],
    inputKind: "positive",
    inputLabel: bi("rewardValues · tiền thưởng", "rewardValues · rewards"),
    debugMode: "line-by-line",
    approach: [
      bi("Bit 1 = tổng đó có thể đạt.", "A set bit means that total is reachable."),
      bi("Lấy tổng < r rồi dịch lên thêm r.", "Keep totals below r, then shift them up by r."),
    ],
    complexity: { time: "O(n · max(reward) / word size)", space: "O(max(reward))", note: bi("Hình minh họa giới hạn n ≤ 8, thưởng ≤ 12.", "Visualization is limited to n ≤ 8, rewards ≤ 12.") },
    code: CODE,
    builder: buildSteps,
    liveArgs: (input) => [parseRewards(input)],
  },
};
