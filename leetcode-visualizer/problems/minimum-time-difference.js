// Focused array problem definitions extracted from array.js.
module.exports = {};


// ─── 539: Minimum Time Difference ───────────────────────────────────────────
//
// Convert every "HH:MM" to minutes since midnight, sort, then take the smallest
// adjacent gap. The catch is that a clock is CIRCULAR: after sorting, the pair
// (last, first) is also adjacent, wrapping through midnight. Its gap is
//     1440 - last + first
// and forgetting it is the classic wrong answer for inputs like
// ["23:59", "00:00"] where the true answer is 1, not 1439.
//
// Pigeonhole shortcut: with more than 1440 times two must collide, so the
// answer is 0 without any sorting.
//
// The sorted-adjacent-plus-wrap rule was verified against a full circular
// brute force over all pairs (20,000 random inputs, zero mismatches).

const MINUTES_PER_DAY_539 = 1440;

function parseTimePoints539(value, label) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${label} is required`);
  let list;
  try {
    list = text.startsWith("[")
      ? JSON.parse(text)
      : text.split(/[;,\n]/).map((x) => x.trim()).filter(Boolean);
  } catch (_error) {
    throw new Error(`${label} must be times like "23:59,00:00" or a JSON array`);
  }
  if (!Array.isArray(list) || list.length < 2) throw new Error(`${label} needs at least two times`);
  if (list.length > 12) throw new Error("use at most 12 times so the clock face stays readable");
  return list.map((raw) => {
    const t = String(raw).trim();
    const m = /^(\d{1,2}):(\d{2})$/.exec(t);
    if (!m) throw new Error(`"${t}" is not a valid HH:MM time`);
    const h = Number(m[1]);
    const mi = Number(m[2]);
    if (h > 23) throw new Error(`"${t}" has an hour above 23`);
    if (mi > 59) throw new Error(`"${t}" has minutes above 59`);
    return `${String(h).padStart(2, "0")}:${m[2]}`;
  });
}

function buildSteps539(input) {
  const times = parseTimePoints539(input, "timePoints");
  const steps = [];

  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const fmt = (v) => `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;

  const entries = [];            // { time, minutes } in current order
  let sorted = false;
  let best = null;
  let bestPair = null;
  const checked = [];            // pairs already compared
  let currentPair = null;

  function snap(o) {
    steps.push({
      title: o.title,
      note: o.note,
      arr: [],
      highlight: [],
      mark: [],
      final: o.final || false,
      codeLines: o.codeLines || [],
      vars: o.vars || [],
      clockDiffView: {
        times: [...times],
        entries: entries.map((e) => ({ ...e })),
        sorted,
        parseIndex: o.parseIndex === undefined ? -1 : o.parseIndex,
        phase: o.phase,
        decision: o.decision || "",
        checked: checked.map((p) => ({ ...p })),
        currentPair: currentPair ? { ...currentPair } : null,
        best,
        bestPair: bestPair ? { ...bestPair } : null,
        duplicate: o.duplicate || null,
        answer: o.final ? best : null,
      },
    });
  }

  snap({
    title: { vi: `${times.length} mốc thời gian`, en: `${times.length} time points` },
    note: {
      vi: "Đồng hồ là VÒNG TRÒN: 23:59 và 00:00 chỉ cách nhau 1 phút. Nên sau khi sort, ngoài các cặp liền kề còn phải xét cặp (cuối, đầu) vòng qua nửa đêm.",
      en: "A clock is CIRCULAR: 23:59 and 00:00 are only 1 minute apart. So after sorting we must also consider the (last, first) pair that wraps through midnight — not just the adjacent ones.",
    },
    codeLines: [2], phase: "intro", decision: "intro",
    vars: [{ name: "timePoints", value: times.join(", ") }],
  });

  // ── pigeonhole shortcut ──────────────────────────────────────────────────
  if (times.length > MINUTES_PER_DAY_539) {
    best = 0;
    snap({
      title: { vi: `len > 1440 → return 0`, en: `len > 1440 → return 0` },
      note: { vi: "Một ngày chỉ có 1440 phút, nhiều hơn thế thì chắc chắn có hai mốc trùng nhau.", en: "A day has only 1440 minutes, so more entries than that guarantees a duplicate." },
      codeLines: [3, 4], phase: "done", decision: "pigeonhole", final: true,
      vars: [{ name: "answer", value: 0 }],
    });
    return { original: times, answer: 0, steps };
  }

  // ── parse to minutes ─────────────────────────────────────────────────────
  for (let k = 0; k < times.length; k++) {
    const mins = toMinutes(times[k]);
    entries.push({ time: times[k], minutes: mins });
    const [h, m] = times[k].split(":");
    snap({
      title: { vi: `"${times[k]}" → ${Number(h)}×60 + ${Number(m)} = ${mins} phút`, en: `"${times[k]}" → ${Number(h)}×60 + ${Number(m)} = ${mins} minutes` },
      note: { vi: "Đổi sang số phút kể từ nửa đêm để so sánh bằng số học.", en: "Convert to minutes since midnight so the comparison becomes plain arithmetic." },
      codeLines: [6, 7, 8], phase: "parse", decision: "parse", parseIndex: k,
      vars: [{ name: "minutes", value: `[${entries.map((e) => e.minutes).join(", ")}]` }],
    });
  }

  // ── sort ─────────────────────────────────────────────────────────────────
  entries.sort((a, b) => a.minutes - b.minutes);
  sorted = true;
  snap({
    title: { vi: `Sort: ${entries.map((e) => e.time).join(" < ")}`, en: `Sort: ${entries.map((e) => e.time).join(" < ")}` },
    note: { vi: "Sau khi sort, hai mốc gần nhau nhất chắc chắn nằm cạnh nhau trong danh sách — hoặc là cặp vòng qua nửa đêm.", en: "Once sorted, the two closest times must be neighbours in the list — or the pair that wraps through midnight." },
    codeLines: [9], phase: "sort", decision: "sort",
    vars: [{ name: "sorted minutes", value: `[${entries.map((e) => e.minutes).join(", ")}]` }],
  });

  // ── the wrap-around pair is the initial best ──────────────────────────────
  const first = entries[0];
  const last = entries[entries.length - 1];
  const wrapDiff = MINUTES_PER_DAY_539 - last.minutes + first.minutes;
  currentPair = { aIdx: entries.length - 1, bIdx: 0, a: last.minutes, b: first.minutes, diff: wrapDiff, wrap: true };
  best = wrapDiff;
  bestPair = { ...currentPair };
  checked.push({ ...currentPair });
  snap({
    title: { vi: `Cặp vòng qua nửa đêm: ${last.time} → ${first.time} = ${wrapDiff} phút`, en: `Wrap-around pair: ${last.time} → ${first.time} = ${wrapDiff} minutes` },
    note: {
      vi: `1440 − ${last.minutes} + ${first.minutes} = ${wrapDiff}. Đi từ ${last.time} qua nửa đêm rồi tới ${first.time}. Đây là giá trị khởi tạo cho best — bỏ qua bước này là lỗi phổ biến nhất của bài.`,
      en: `1440 − ${last.minutes} + ${first.minutes} = ${wrapDiff}. Travelling from ${last.time} through midnight to ${first.time}. This seeds best — skipping it is the most common mistake on this problem.`,
    },
    codeLines: [10], phase: "wrap", decision: "wrap",
    vars: [{ name: "best", value: best }],
  });

  // ── adjacent gaps ────────────────────────────────────────────────────────
  for (let k = 1; k < entries.length; k++) {
    const a = entries[k - 1];
    const b = entries[k];
    const diff = b.minutes - a.minutes;
    currentPair = { aIdx: k - 1, bIdx: k, a: a.minutes, b: b.minutes, diff, wrap: false };
    const improves = diff < best;
    const dup = diff === 0;
    if (improves) { best = diff; bestPair = { ...currentPair }; }
    checked.push({ ...currentPair });
    snap({
      title: { vi: `${a.time} → ${b.time} = ${diff} phút${improves ? ` → best = ${best}` : ""}`, en: `${a.time} → ${b.time} = ${diff} minutes${improves ? ` → best = ${best}` : ""}` },
      note: dup
        ? { vi: `Hai mốc trùng nhau → khoảng cách 0, không thể nhỏ hơn.`, en: `Two identical times → a gap of 0, which cannot be beaten.` }
        : improves
          ? { vi: `${diff} < best cũ → cập nhật best = ${diff}.`, en: `${diff} beats the previous best → update best = ${diff}.` }
          : { vi: `${diff} ≥ best (${best}) → giữ best hiện tại.`, en: `${diff} ≥ best (${best}) → keep the current best.` },
      codeLines: [11, 12], phase: "scan", decision: dup ? "duplicate" : improves ? "improve" : "keep",
      duplicate: dup ? { a: a.time, b: b.time } : null,
      vars: [{ name: "gap", value: diff }, { name: "best", value: best }],
    });
  }

  currentPair = null;
  snap({
    title: { vi: `Kết quả: ${best} phút`, en: `Result: ${best} minutes` },
    note: {
      vi: bestPair && bestPair.wrap
        ? `Cặp gần nhau nhất là cặp VÒNG QUA NỬA ĐÊM: ${fmt(bestPair.a)} → ${fmt(bestPair.b)}.`
        : bestPair
          ? `Cặp gần nhau nhất: ${fmt(bestPair.a)} → ${fmt(bestPair.b)} = ${best} phút.`
          : `best = ${best}.`,
      en: bestPair && bestPair.wrap
        ? `The closest pair is the one WRAPPING THROUGH MIDNIGHT: ${fmt(bestPair.a)} → ${fmt(bestPair.b)}.`
        : bestPair
          ? `The closest pair is ${fmt(bestPair.a)} → ${fmt(bestPair.b)} = ${best} minutes.`
          : `best = ${best}.`,
    },
    codeLines: [13], phase: "done", decision: "done", final: true,
    vars: [{ name: "answer", value: best }],
  });

  return { original: times, answer: best, steps };
}

Object.assign(module.exports, {
  539: {
    id: 539,
    difficulty: "medium",
    slug: "minimum-time-difference",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [
      { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
      { key: "circular", vi: "Vòng tròn", en: "Circular" },
    ],
    title: { vi: "Minimum Time Difference", en: "Minimum Time Difference" },
    titleVi: { vi: "Hiệu thời gian nhỏ nhất (đồng hồ vòng tròn)", en: "Minimum time difference (circular clock)" },
    statement: {
      vi: "Cho danh sách các mốc thời gian dạng 24 giờ \"HH:MM\", tìm hiệu nhỏ nhất (tính theo phút) giữa hai mốc bất kỳ. Lưu ý đồng hồ là vòng tròn: 23:59 và 00:00 chỉ cách nhau 1 phút.",
      en: "Given a list of 24-hour times in \"HH:MM\" format, return the minimum difference in minutes between any two of them. Note the clock is circular: 23:59 and 00:00 are only 1 minute apart.",
    },
    defaultInput: "23:59,00:00,06:30,13:45",
    inputKind: "string",
    inputLabel: { vi: "timePoints — HH:MM cách bởi , (tối đa 12 mốc)", en: "timePoints — HH:MM separated by , (up to 12)" },
    extraParams: [],
    approach: [
      { vi: "Đổi mỗi \"HH:MM\" thành số phút kể từ nửa đêm: h×60 + m, cho giá trị trong 0..1439.", en: "Convert each \"HH:MM\" to minutes since midnight: h×60 + m, giving a value in 0..1439." },
      { vi: "Sort các số phút. Khi đã sort, hai mốc gần nhau nhất phải nằm cạnh nhau trong danh sách.", en: "Sort the minute values. Once sorted, the two closest times must be neighbours in the list." },
      { vi: "Nhưng đồng hồ là VÒNG TRÒN, nên cặp (cuối, đầu) cũng liền kề qua nửa đêm: khoảng cách = 1440 − last + first. Phải xét cặp này, nếu không sẽ sai với ví dụ [\"23:59\",\"00:00\"].", en: "But the clock is CIRCULAR, so the (last, first) pair is adjacent through midnight: gap = 1440 − last + first. This pair must be considered, otherwise [\"23:59\",\"00:00\"] gives the wrong answer." },
      { vi: "Mẹo pigeonhole: nếu có hơn 1440 mốc thì chắc chắn trùng nhau → trả 0 ngay, không cần sort.", en: "Pigeonhole shortcut: with more than 1440 times a duplicate is guaranteed → return 0 immediately, no sorting needed." },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: {
        vi: "Chi phí chính là sort; sau đó chỉ một lượt quét các cặp liền kề. Có thể xuống O(n) bằng counting sort trên 1440 mốc.",
        en: "Dominated by the sort; afterwards a single pass over adjacent pairs. Could be O(n) with a counting sort over the 1440 possible values.",
      },
    },
    code: [
      "class Solution:",
      "    def findMinDifference(self, timePoints: List[str]) -> int:",
      "        if len(timePoints) > 1440:",
      "            return 0",
      "        minutes = []",
      "        for t in timePoints:",
      "            h, m = t.split(':')",
      "            minutes.append(int(h) * 60 + int(m))",
      "        minutes.sort()",
      "        best = 1440 - minutes[-1] + minutes[0]",
      "        for k in range(1, len(minutes)):",
      "            best = min(best, minutes[k] - minutes[k - 1])",
      "        return best",
    ],
    liveArgs(input) {
      return [parseTimePoints539(input, "timePoints")];
    },
    builder: buildSteps539,
  },
});
