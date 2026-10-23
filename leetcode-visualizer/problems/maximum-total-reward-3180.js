"use strict";

const bi = (vi, en) => ({ vi, en });

const CODE = [
  "class Solution:",
  "    def maxTotalReward(self, rewardValues):",
  "        rewards = sorted(rewardValues)",
  "        limit = 2 * rewards[-1]",
  "        dp = [False] * limit",
  "        dp[0] = True",
  "        for reward in rewards:",
  "            for total in range(reward - 1, -1, -1):",
  "                if dp[total]:",
  "                    dp[total + reward] = True",
  "        return max(i for i, can in enumerate(dp) if can)",
];

function parseRewards(input) {
  let rewards = input;
  if (typeof input === "string") rewards = input.trim().split(/[\s,;]+/).filter(Boolean).map(Number);
  if (input && !Array.isArray(input) && typeof input === "object") rewards = input.rewardValues;
  if (!Array.isArray(rewards) || rewards.length < 1 || rewards.length > 8
    || rewards.some((value) => !Number.isInteger(value) || value < 1 || value > 12)) {
    throw new RangeError("3180: Use 1–8 rewards from 1 to 12 / Nhập 1–8 giá trị thưởng từ 1 đến 12.");
  }
  return [...rewards];
}

function buildSteps(input) {
  const original = parseRewards(input);
  const sortedEntries = original.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const rewards = sortedEntries.map((entry) => entry.value);
  const limit = 2 * rewards[rewards.length - 1];
  const dp = Array(limit).fill(false);
  const paths = Array(limit).fill(null);
  const steps = [];
  let rewardIndex = null;
  let reward = null;
  let total = null;
  let destination = null;
  let answer = null;

  const title = (event) => ({
    start: bi("Bắt đầu", "Start"), sort: bi("Xếp thưởng", "Sort rewards"),
    bound: bi(`Trục 0…${limit - 1}`, `Track 0…${limit - 1}`),
    row: bi("Tạo trạng thái", "Create states"), seed: bi("Bắt đầu ở 0", "Start at 0"),
    reward: bi(`Thưởng ${reward}`, `Reward ${reward}`), check: bi(`Thử tổng ${total}`, `Try total ${total}`),
    gate: bi(dp[total] ? "Tổng này sáng" : "Tổng này chưa tới được", dp[total] ? "Reachable total" : "Unreachable total"),
    add: bi(`${total} + ${reward} = ${destination}`, `${total} + ${reward} = ${destination}`),
    done: bi(`Tổng lớn nhất ${answer}`, `Maximum total ${answer}`),
  }[event]);

  function emit(line, event, changed = null, prior = null) {
    const before = prior ? [...prior] : [...dp];
    const after = [...dp];
    steps.push({
      title: title(event), note: bi("", ""), arr: [...original],
      highlight: Number.isInteger(rewardIndex) ? [sortedEntries[rewardIndex].index] : [],
      mark: [], codeLines: [line], final: event === "done",
      vars: [
        { name: "reward", value: reward ?? "—" }, { name: "total", value: total ?? "—" },
        { name: "next", value: destination ?? "—" }, { name: "dp", value: `{${after.map((can, sum) => can ? sum : null).filter((sum) => sum !== null).join(",")}}` },
      ],
      reward3180View: {
        event, original: [...original], rewards: [...rewards], limit, rewardIndex, reward,
        total, destination, before, after, changed, answer, reachable: Number.isInteger(total) ? dp[total] : null,
        processedCount: event === "done" ? rewards.length : rewardIndex === null ? 0 : rewardIndex + 1,
        witness: answer === null ? [] : [...(paths[answer] || [])],
      },
    });
  }

  emit(2, "start");
  emit(3, "sort");
  emit(4, "bound");
  emit(5, "row");
  dp[0] = true; paths[0] = [];
  emit(6, "seed", 0);

  rewards.forEach((value, index) => {
    rewardIndex = index; reward = value; total = null; destination = null;
    emit(7, "reward");
    for (total = reward - 1; total >= 0; total--) {
      destination = null;
      emit(8, "check");
      emit(9, "gate");
      if (dp[total]) {
        destination = total + reward;
        const prior = [...dp];
        if (!dp[destination]) paths[destination] = [...paths[total], reward];
        dp[destination] = true;
        emit(10, "add", destination, prior);
      }
    }
  });

  answer = dp.reduce((best, reachable, sum) => reachable ? sum : best, 0);
  rewardIndex = null; reward = null; total = null; destination = answer;
  emit(11, "done", answer);
  return { original, answer, steps };
}

module.exports = {
  3180: {
    id: 3180,
    slug: "maximum-total-reward-using-operations-i",
    difficulty: "medium",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "knapsack", vi: "Balo 0/1", en: "0/1 knapsack" },
    ],
    title: bi("Maximum Total Reward I", "Maximum Total Reward I"),
    titleVi: bi("Tổng thưởng lớn nhất", "Maximum total reward"),
    statement: bi("Cộng thưởng r chỉ khi tổng hiện tại nhỏ hơn r. Tìm tổng lớn nhất.", "Add reward r only when the current total is less than r. Find the maximum total."),
    defaultInput: [1, 6, 4, 3, 2],
    inputKind: "positive",
    inputLabel: bi("rewardValues · tiền thưởng", "rewardValues · rewards"),
    debugMode: "line-by-line",
    approach: [
      bi("Mỗi tổng đạt được là một điểm sáng trên trục.", "Each reachable total lights up a point on the track."),
      bi("Nếu tổng < thưởng: nhảy thêm thưởng.", "If total < reward: jump forward by the reward."),
    ],
    complexity: { time: "O(n · max(reward))", space: "O(max(reward))", note: bi("Hình minh họa giới hạn n ≤ 8, thưởng ≤ 12.", "Visualization is limited to n ≤ 8, rewards ≤ 12.") },
    code: CODE,
    builder: buildSteps,
    liveArgs: (input) => [parseRewards(input)],
  },
};
