// #2162 — Minimum Cost to Set Cooking Time
// A target has at most two useful mm:ss forms: the normal divmod form and the
// form obtained by borrowing one minute and adding 60 seconds.

const CODE2162 = [
  "class Solution:",
  "    def minCostSetTime(self, startAt: int, moveCost: int, pushCost: int, targetSeconds: int) -> int:",
  "        def cost(minutes, seconds):",
  "            if not (0 <= minutes <= 99 and 0 <= seconds <= 99):",
  "                return float('inf')",
  "",
  "            digits = f'{minutes:02d}{seconds:02d}'.lstrip('0') or '0'",
  "            total = 0",
  "            finger = startAt",
  "",
  "            for ch in digits:",
  "                digit = int(ch)",
  "                if digit != finger:",
  "                    total += moveCost",
  "                total += pushCost",
  "                finger = digit",
  "",
  "            return total",
  "",
  "        minutes, seconds = divmod(targetSeconds, 60)",
  "        normal = cost(minutes, seconds)",
  "        borrowed = cost(minutes - 1, seconds + 60)",
  "        return min(normal, borrowed)",
];

function parseInput2162(input) {
  const parts = Array.isArray(input)
    ? input.map(Number)
    : String(input ?? "").replace(/[\[\]]/g, "").split(",").map((value) => Number(value.trim()));
  if (parts.length !== 4 || parts.some((value) => !Number.isInteger(value))) {
    throw new Error("Nhập đúng 4 số nguyên: startAt,moveCost,pushCost,targetSeconds");
  }
  const [startAt, moveCost, pushCost, targetSeconds] = parts;
  if (startAt < 0 || startAt > 9) throw new Error("startAt phải nằm trong 0..9");
  if (moveCost < 1 || moveCost > 100000 || pushCost < 1 || pushCost > 100000) {
    throw new Error("moveCost và pushCost phải nằm trong 1..100000");
  }
  if (targetSeconds < 1 || targetSeconds > 6039) throw new Error("targetSeconds phải nằm trong 1..6039");
  return { startAt, moveCost, pushCost, targetSeconds };
}

function buildSteps2162(input) {
  const config = parseInput2162(input);
  const { startAt, moveCost, pushCost, targetSeconds } = config;
  const baseMinutes = Math.floor(targetSeconds / 60);
  const baseSeconds = targetSeconds % 60;
  const rawPlans = [
    { kind: "normal", minutes: baseMinutes, seconds: baseSeconds },
    { kind: "borrowed", minutes: baseMinutes - 1, seconds: baseSeconds + 60 },
  ];
  const plans = rawPlans.map((plan) => {
    const valid = plan.minutes >= 0 && plan.minutes <= 99 && plan.seconds >= 0 && plan.seconds <= 99;
    const padded = valid ? `${String(plan.minutes).padStart(2, "0")}${String(plan.seconds).padStart(2, "0")}` : null;
    const digits = valid ? padded.replace(/^0+/, "") || "0" : null;
    return { ...plan, valid, padded, digits, cost: null, events: [] };
  });
  const steps = [];

  const snapshot = ({ phase, title, note, codeLines, activePlan = null, pressIndex = null, finger = startAt, event = null, final = false }) => {
    steps.push({
      title,
      arr: plans.map((plan) => plan.cost ?? 0),
      sub: plans.map((plan) => plan.valid ? `${plan.minutes}:${String(plan.seconds).padStart(2, "0")}` : "invalid"),
      highlight: activePlan === null ? [] : [activePlan],
      mark: plans.map((plan, index) => plan.cost !== null ? index : -1).filter((index) => index >= 0),
      final,
      codeLines,
      vars: [
        { name: "targetSeconds", value: targetSeconds },
        { name: "finger", value: finger },
        { name: "moveCost", value: moveCost },
        { name: "pushCost", value: pushCost },
        ...(event ? [{ name: "running cost", value: event.total }] : []),
      ],
      note,
      cookingTime2162View: {
        phase,
        ...config,
        baseMinutes,
        baseSeconds,
        plans: plans.map((plan) => ({ ...plan, events: plan.events.map((item) => ({ ...item })) })),
        activePlan,
        pressIndex,
        finger,
        event: event ? { ...event } : null,
        answer: final ? Math.min(...plans.filter((plan) => plan.valid).map((plan) => plan.cost)) : null,
      },
    });
  };

  snapshot({
    phase: "intro",
    title: { vi: `Cần đặt ${targetSeconds} giây`, en: `Set ${targetSeconds} seconds` },
    codeLines: [20],
    note: {
      vi: `divmod cho ${baseMinutes}:${String(baseSeconds).padStart(2, "0")}. Ta còn phải thử mượn 1 phút: ${baseMinutes - 1}:${String(baseSeconds + 60).padStart(2, "0")}.`,
      en: `divmod gives ${baseMinutes}:${String(baseSeconds).padStart(2, "0")}. Also try borrowing one minute: ${baseMinutes - 1}:${String(baseSeconds + 60).padStart(2, "0")}.`,
    },
  });

  for (let planIndex = 0; planIndex < plans.length; planIndex++) {
    const plan = plans[planIndex];
    if (!plan.valid) {
      snapshot({
        phase: "invalid",
        activePlan: planIndex,
        title: { vi: `${plan.minutes}:${plan.seconds} không hợp lệ`, en: `${plan.minutes}:${plan.seconds} is invalid` },
        codeLines: [3, 4, 5],
        note: {
          vi: "Microwave chỉ nhận 0..99 phút và 0..99 giây, nên bỏ ứng viên này.",
          en: "The microwave accepts only 0..99 minutes and 0..99 seconds, so discard this candidate.",
        },
      });
      continue;
    }

    snapshot({
      phase: "candidate",
      activePlan: planIndex,
      title: { vi: `Thử ${plan.minutes}:${String(plan.seconds).padStart(2, "0")} → bấm "${plan.digits}"`, en: `Try ${plan.minutes}:${String(plan.seconds).padStart(2, "0")} → type "${plan.digits}"` },
      codeLines: [3, 4, 7, 8, 9],
      note: {
        vi: `Chuỗi 4 số là ${plan.padded}; bỏ zero đầu vì bấm thêm luôn tốn chi phí và không đổi thời gian.`,
        en: `The four-digit display is ${plan.padded}; omit leading zeroes because extra presses cost money without changing the time.`,
      },
    });

    let finger = startAt;
    let total = 0;
    for (let pressIndex = 0; pressIndex < plan.digits.length; pressIndex++) {
      const digit = Number(plan.digits[pressIndex]);
      const before = finger;
      const moved = digit !== finger;
      const moveCharge = moved ? moveCost : 0;
      total += moveCharge + pushCost;
      finger = digit;
      const event = { index: pressIndex, digit, before, after: finger, moved, moveCharge, pushCharge: pushCost, total };
      plan.events.push(event);
      snapshot({
        phase: "press",
        activePlan: planIndex,
        pressIndex,
        finger,
        event,
        title: moved
          ? { vi: `Di ${before} → ${digit}, rồi bấm · +${moveCharge + pushCost}`, en: `Move ${before} → ${digit}, then push · +${moveCharge + pushCost}` }
          : { vi: `Giữ tại ${digit}, chỉ bấm · +${pushCost}`, en: `Stay on ${digit}, push only · +${pushCost}` },
        codeLines: moved ? [11, 12, 13, 14, 15, 16] : [11, 12, 13, 15, 16],
        note: moved
          ? { vi: `Khác vị trí ngón tay nên trả moveCost ${moveCost}, rồi luôn trả pushCost ${pushCost}. Tổng hiện tại = ${total}.`, en: `The finger changes position, costing moveCost ${moveCost}; every press also costs pushCost ${pushCost}. Running total = ${total}.` }
          : { vi: `Ngón tay đã ở phím ${digit}, không trả moveCost; chỉ cộng pushCost ${pushCost}. Tổng hiện tại = ${total}.`, en: `The finger is already on ${digit}, so there is no move cost; add only pushCost ${pushCost}. Running total = ${total}.` },
      });
    }
    plan.cost = total;
    snapshot({
      phase: "candidate-done",
      activePlan: planIndex,
      finger,
      title: { vi: `Chi phí bấm "${plan.digits}" = ${total}`, en: `Cost to type "${plan.digits}" = ${total}` },
      codeLines: [18],
      note: {
        vi: `Ứng viên ${plan.minutes}:${String(plan.seconds).padStart(2, "0")} hợp lệ và có tổng chi phí ${total}.`,
        en: `Candidate ${plan.minutes}:${String(plan.seconds).padStart(2, "0")} is valid and costs ${total}.`,
      },
    });
  }

  const validPlans = plans.filter((plan) => plan.valid);
  const answer = Math.min(...validPlans.map((plan) => plan.cost));
  snapshot({
    phase: "answer",
    final: true,
    title: { vi: `Chi phí nhỏ nhất = ${answer}`, en: `Minimum cost = ${answer}` },
    codeLines: [21, 22, 23],
    note: {
      vi: "Chỉ có hai cách biểu diễn đáng xét: divmod bình thường, hoặc mượn đúng một phút để cộng 60 giây.",
      en: "Only two representations matter: the normal divmod form, or borrowing exactly one minute to add 60 seconds.",
    },
  });
  return { original: config, answer, steps };
}

module.exports = {
  2162: {
    id: 2162,
    difficulty: "medium",
    slug: "minimum-cost-to-set-cooking-time",
    category: { key: "math", vi: "Toán học", en: "Math" },
    tags: [
      { key: "enumeration", vi: "Liệt kê", en: "Enumeration" },
      { key: "simulation", vi: "Mô phỏng", en: "Simulation" },
      { key: "greedy", vi: "Tham lam", en: "Greedy" },
    ],
    title: { vi: "Minimum Cost to Set Cooking Time", en: "Minimum Cost to Set Cooking Time" },
    titleVi: { vi: "Chi phí nhỏ nhất để đặt thời gian nấu", en: "Minimum cost to set a cooking time" },
    statement: {
      vi: "Ngón tay bắt đầu ở startAt. Di sang phím khác tốn moveCost, bấm phím tốn pushCost. Tìm chi phí nhỏ nhất để nhập targetSeconds theo định dạng mm:ss.",
      en: "A finger starts at startAt. Moving to another key costs moveCost and pressing costs pushCost. Find the minimum cost to enter targetSeconds as mm:ss.",
    },
    defaultInput: "1,2,1,600",
    inputKind: "string",
    inputLabel: { vi: "startAt, moveCost, pushCost, targetSeconds", en: "startAt, moveCost, pushCost, targetSeconds" },
    approach: [
      { vi: "Từ targetSeconds, ứng viên đầu là divmod: minutes = t//60, seconds = t%60.", en: "The first candidate is divmod: minutes = t//60, seconds = t%60." },
      { vi: "Ứng viên duy nhất còn lại là mượn 1 phút: (minutes−1, seconds+60); loại nếu phút/giây ngoài 0..99.", en: "The only alternative borrows one minute: (minutes−1, seconds+60); reject values outside 0..99." },
      { vi: "Bỏ zero đầu, mô phỏng ngón tay và cộng moveCost khi đổi phím, pushCost cho mọi lần bấm.", en: "Drop leading zeroes, simulate the finger, add moveCost when changing keys and pushCost for every press." },
    ],
    complexity: {
      time: "O(1)",
      space: "O(1)",
      note: {
        vi: "Tối đa 2 ứng viên và mỗi ứng viên tối đa 4 chữ số.",
        en: "There are at most two candidates with at most four digits each.",
      },
    },
    code: CODE2162,
    liveArgs: (input) => {
      const { startAt, moveCost, pushCost, targetSeconds } = parseInput2162(input);
      return [startAt, moveCost, pushCost, targetSeconds];
    },
    builder: buildSteps2162,
  },
};
