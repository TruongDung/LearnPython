"use strict";

const bi = (vi, en) => ({ vi, en });

const CODE = [
  "class Solution:",
  "    def paintWalls(self, cost, time):",
  "        n = len(cost)",
  "        INF = float('inf')",
  "        dp = [INF] * (n + 1)",
  "        dp[0] = 0",
  "        for i in range(n):",
  "            cover = time[i] + 1",
  "            for painted in range(n, -1, -1):",
  "                if dp[painted] == INF:",
  "                    continue",
  "                nxt = min(n, painted + cover)",
  "                dp[nxt] = min(dp[nxt], dp[painted] + cost[i])",
  "        return dp[n]",
];

function parseInput(costInput, params = {}) {
  const cost = Array.isArray(costInput) ? [...costInput]
    : typeof costInput === "string" ? costInput.trim().split(/[\s,;]+/).filter(Boolean).map(Number) : [];
  const rawTime = params.time;
  const time = Array.isArray(rawTime) ? [...rawTime]
    : typeof rawTime === "string" ? rawTime.trim().split(/[\s,;]+/).filter(Boolean).map(Number) : [];
  if (!cost.length || cost.length > 8 || cost.length !== time.length
    || cost.some((value) => !Number.isInteger(value) || value < 1 || value > 20)
    || time.some((value) => !Number.isInteger(value) || value < 1 || value > 8)) {
    throw new RangeError("2742: cost/time must have 1–8 matching values; cost 1–20, time 1–8 / cost và time cần cùng 1–8 phần tử; cost 1–20, time 1–8.");
  }
  return { cost, time };
}

function buildSteps(costInput, params = {}) {
  const { cost, time } = parseInput(costInput, params);
  const n = cost.length;
  const INF = Number.POSITIVE_INFINITY;
  const dp = Array.from({ length: n + 1 }, () => ({ cost: INF, mask: 0 }));
  const steps = [];
  let currentIndex = null;
  let cover = null;
  let painted = null;
  let next = null;
  let answer = null;
  let before = [...dp];
  let after = [...dp];
  let selectedMask = 0;
  let mural = [];

  const costLabel = (value) => Number.isFinite(value) ? value : "∞";
  const titleFor = (event) => ({
    start: bi("Bắt đầu", "Start"),
    size: bi(`Có ${n} bức tường`, `${n} walls`),
    infinity: bi("Đặt chi phí vô hạn", "Set unreachable cost"),
    init: bi("Tạo bảng DP", "Create the DP row"),
    seed: bi("0 tường cần 0 đồng", "0 walls cost 0"),
    job: bi(`Chọn tường ${currentIndex + 1}`, `Choose wall ${currentIndex + 1}`),
    capacity: bi(`Thợ phủ ${cover} tường`, `Painters cover ${cover} walls`),
    scan: bi(`Xét ${painted} tường`, `Check ${painted} covered`),
    reachable: bi(Number.isFinite(before[painted]?.cost) ? "Có thể tới đây" : "Chưa tới được" , Number.isFinite(before[painted]?.cost) ? "Reachable" : "Unreachable"),
    skip: bi("Bỏ qua ô DP này", "Skip this DP cell"),
    destination: bi(`${painted} → ${next}`, `${painted} → ${next}`),
    update: bi(`dp[${next}] = ${costLabel(after[next]?.cost)}`, `dp[${next}] = ${costLabel(after[next]?.cost)}`),
    done: bi(`Chi phí tối thiểu: ${answer}`, `Minimum cost: ${answer}`),
  }[event]);

  function buildMural(mask) {
    const slots = Array.from({ length: n }, () => null);
    let slot = 0;
    for (let index = 0; index < n && slot < n; index++) {
      if (!(mask & (1 << index))) continue;
      slots[slot++] = { painter: "paid", wall: index };
      for (let count = 0; count < time[index] && slot < n; count++) {
        slots[slot++] = { painter: "free", wall: index };
      }
    }
    return slots;
  }

  function emit(line, event, options = {}) {
    const dpBefore = before.map((state) => costLabel(state.cost));
    const dpAfter = after.map((state) => costLabel(state.cost));
    steps.push({
      title: titleFor(event),
      note: bi("", ""),
      arr: [...cost],
      highlight: Number.isInteger(currentIndex) ? [currentIndex] : [],
      mark: selectedMask ? cost.map((_, index) => selectedMask & (1 << index) ? index : -1).filter((index) => index >= 0) : [],
      codeLines: [line],
      final: event === "done",
      vars: [
        { name: "cost", value: `[${cost.join(",")}]` },
        { name: "time", value: `[${time.join(",")}]` },
        { name: "i", value: currentIndex === null ? "—" : currentIndex },
        { name: "cover", value: cover ?? "—" },
        { name: "painted", value: painted ?? "—" },
        { name: "next", value: next ?? "—" },
        { name: "dp", value: `[${dpAfter.join(",")}]` },
      ],
      paintingWalls2742View: {
        event, n, cost: [...cost], time: [...time], currentIndex, cover, painted, next,
        before: dpBefore, after: dpAfter, beforeCost: Number.isInteger(painted) ? costLabel(before[painted]?.cost) : null,
        candidateCost: Number.isInteger(painted) && Number.isInteger(currentIndex) && Number.isFinite(before[painted]?.cost)
          ? before[painted].cost + cost[currentIndex] : null,
        processedCount: currentIndex === null ? 0 : currentIndex + 1,
        selectedMask, mural: [...mural], answer, reachable: options.reachable ?? null,
      },
    });
  }

  emit(2, "start");
  before = [...dp]; after = [...dp]; emit(3, "size");
  before = [...dp]; after = [...dp]; emit(4, "infinity");
  before = [...dp]; after = [...dp]; emit(5, "init");
  before = [...dp]; dp[0] = { cost: 0, mask: 0 }; after = [...dp]; emit(6, "seed");

  for (currentIndex = 0; currentIndex < n; currentIndex++) {
    cover = time[currentIndex] + 1;
    painted = null; next = null;
    before = [...dp]; after = [...dp]; emit(7, "job");
    before = [...dp]; after = [...dp]; emit(8, "capacity");

    for (painted = n; painted >= 0; painted--) {
      next = null;
      before = [...dp]; after = [...dp];
      emit(9, "scan");

      before = [...dp]; after = [...dp];
      emit(10, "reachable", { reachable: Number.isFinite(dp[painted].cost) });
      if (!Number.isFinite(dp[painted].cost)) {
        before = [...dp]; after = [...dp]; emit(11, "skip");
        continue;
      }

      next = Math.min(n, painted + cover);
      before = [...dp]; after = [...dp];
      emit(12, "destination");

      const candidateCost = dp[painted].cost + cost[currentIndex];
      const candidateMask = dp[painted].mask | (1 << currentIndex);
      before = [...dp];
      if (candidateCost < dp[next].cost) dp[next] = { cost: candidateCost, mask: candidateMask };
      after = [...dp];
      emit(13, "update");
    }
  }

  answer = dp[n].cost;
  selectedMask = dp[n].mask;
  mural = buildMural(selectedMask);
  currentIndex = null; cover = null; painted = null; next = null;
  before = [...dp]; after = [...dp];
  emit(14, "done");
  return { original: [...cost], answer, steps };
}

module.exports = {
  2742: {
    id: 2742,
    slug: "painting-the-walls",
    difficulty: "hard",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "knapsack", vi: "Balo 0/1", en: "0/1 knapsack" },
    ],
    title: bi("Painting the Walls", "Painting the Walls"),
    titleVi: bi("Sơn tất cả bức tường", "Paint all the walls"),
    statement: bi("Mỗi tường i có giá cost[i]. Thợ trả phí sơn tường đó; trong lúc ấy, thợ miễn phí sơn thêm time[i] tường. Tìm chi phí thấp nhất để sơn tất cả.", "Paid painter i costs cost[i] and works for time[i]; while they work, the free painter paints time[i] other walls. Find the minimum cost to paint all walls."),
    defaultInput: [1, 2, 3, 2],
    inputKind: "positive",
    inputLabel: bi("cost · giá sơn từng tường", "cost · price per wall"),
    extraParams: [{ key: "time", type: "string", label: bi("time · dấu phẩy", "time · comma-separated"), default: "1,2,3,2" }],
    debugMode: "line-by-line",
    approach: [
      bi("Trả phí 1 tường: thợ miễn phí sơn thêm time tường.", "Pay for 1 wall: the free painter adds time more."),
      bi("dp[j] = giá thấp nhất để phủ j tường.", "dp[j] = lowest cost to cover j walls."),
    ],
    complexity: { time: "O(n²)", space: "O(n)", note: bi("Hình minh họa giới hạn n ≤ 8.", "Visualization is limited to n ≤ 8.") },
    code: CODE,
    builder: buildSteps,
    liveArgs: (input, params) => {
      const { cost: costs, time: times } = parseInput(input, params);
      return [costs, times];
    },
  },
};
