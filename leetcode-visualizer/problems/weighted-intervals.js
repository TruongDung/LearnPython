// LeetCode 3414 — Maximum Score of Non-overlapping Intervals.
// Weighted interval scheduling with a four-column DP and lexicographic ties.

const DP_CATEGORY = { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" };
const DP_TAG = { key: "dynamic-programming", vi: "Quy hoạch động", en: "Dynamic Programming" };
const BINARY_SEARCH_TAG = { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" };
const SORTING_TAG = { key: "sorting", vi: "Sắp xếp", en: "Sorting" };
const INTERVAL_TAG = { key: "interval", vi: "Đoạn", en: "Interval" };
const HEAP_CATEGORY = { key: "heap", vi: "Heap / Hàng đợi ưu tiên", en: "Heap / Priority Queue" };
const HEAP_TAG = { key: "heap", vi: "Heap", en: "Heap" };

function parseEvents2054(input) {
  const message = "Enter 2–12 events as start,end,value; start,end,value or as a JSON array [[start,end,value],...].";
  let events = input;
  if (!Array.isArray(events)) {
    const raw = String(input ?? "").trim();
    if (!raw) throw new Error(message);
    if (raw.startsWith("[")) {
      try {
        events = JSON.parse(raw);
      } catch (_error) {
        throw new Error(message);
      }
    } else {
      events = raw.split(";").map((part) => part.split(",").map((value) => Number(value.trim())));
    }
  }
  if (!Array.isArray(events) || events.length < 2 || events.length > 12
      || events.some((event) => !Array.isArray(event) || event.length !== 3
        || event.some((value) => !Number.isInteger(Number(value)))
        || Number(event[0]) < 1 || Number(event[0]) > Number(event[1])
        || Number(event[1]) > 1000000000
        || Number(event[2]) < 1 || Number(event[2]) > 1000000)) {
    throw new Error(message);
  }
  return events.map((event) => event.map(Number));
}

function lexCompare2054(left, right) {
  const size = Math.min(left.length, right.length);
  for (let index = 0; index < size; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return left.length - right.length;
}

function buildSteps2054(input) {
  const original = parseEvents2054(input);
  const sorted = original
    .map(([start, end, value], id) => ({ id, start, end, value }))
    .sort((left, right) => left.start - right.start || left.end - right.end || left.id - right.id);
  const heap = [];
  const releasedIds = new Set();
  const processed = [];
  const steps = [];
  let bestPast = null;
  let answer = { score: 0, picks: [] };
  let candidate = null;

  const stages = [
    { vi: "Sort theo start", en: "Sort by start" },
    { vi: "Pop event đã kết thúc", en: "Release ended events" },
    { vi: "Ghép tối đa 2 event", en: "Combine at most 2" },
    { vi: "Push event hiện tại", en: "Push current event" },
  ];
  const cloneEvent = (event) => event ? { ...event } : null;
  const cloneScore = (score) => score ? { score: score.score, picks: [...score.picks] } : null;
  const stageFor = (phase) => {
    if (phase === "sort") return 0;
    if (["scan", "release", "past"].includes(phase)) return 1;
    if (["combine", "answer"].includes(phase)) return 2;
    return 3;
  };
  const pushStep = ({
    phase, event, line, title, note, currentIndex = null, heapTop = null,
    popped = null, compatible = null, answerChanged = false, final = false,
  }) => {
    const current = Number.isInteger(currentIndex) ? sorted[currentIndex] : null;
    steps.push({
      title,
      note,
      codeLines: [line],
      final,
      arr: sorted.map((item) => item.value),
      highlight: current ? [currentIndex] : [],
      mark: [],
      vars: [
        { name: "current", value: current ? `#${current.id} [${current.start},${current.end}]` : "—" },
        { name: "heap top end", value: heap.length ? heap[0].end : "—" },
        { name: "best_ended", value: bestPast ? bestPast.value : 0 },
        { name: "candidate", value: candidate ? candidate.score : "—" },
        { name: "answer", value: answer.score },
      ],
      twoEvents2054View: {
        problemId: 2054,
        stages,
        stage: stageFor(phase),
        phase,
        event,
        original: original.map((item) => [...item]),
        events: sorted.map(cloneEvent),
        currentIndex,
        heap: heap.map(cloneEvent),
        heapTop: cloneEvent(heapTop),
        popped: cloneEvent(popped),
        compatible,
        releasedIds: [...releasedIds],
        bestPast: cloneEvent(bestPast),
        candidate: cloneScore(candidate),
        answer: cloneScore(answer),
        answerChanged,
        processed: processed.map((item) => ({ ...item, picks: [...item.picks] })),
      },
    });
  };
  const pushHeap = (event) => {
    heap.push(event);
    heap.sort((left, right) => left.end - right.end || left.start - right.start || left.id - right.id);
  };
  const isBetterPast = (event) => !bestPast || event.value > bestPast.value
    || (event.value === bestPast.value && event.id < bestPast.id);
  const isBetterAnswer = (next) => next.score > answer.score
    || (next.score === answer.score && lexCompare2054(next.picks, answer.picks) < 0);

  pushStep({
    phase: "sort", event: "sort", line: 4,
    title: { vi: "Sort event theo start tăng dần", en: "Sort events by increasing start" },
    note: {
      vi: `Sau sort: ${sorted.map((item) => `#${item.id}[${item.start},${item.end}]`).join(" · ")}. Dấu # luôn là index gốc.`,
      en: `Sorted order: ${sorted.map((item) => `#${item.id}[${item.start},${item.end}]`).join(" · ")}. Each # remains the original index.`,
    },
  });

  for (let index = 0; index < sorted.length; index += 1) {
    const current = sorted[index];
    candidate = null;
    pushStep({
      phase: "scan", event: "scan", line: 7, currentIndex: index,
      title: { vi: `Xét #${current.id} = [${current.start}, ${current.end}], value ${current.value}`, en: `Visit #${current.id} = [${current.start}, ${current.end}], value ${current.value}` },
      note: { vi: `Trước khi ghép, pop mọi event có end < start=${current.start}.`, en: `Before combining, pop every event whose end is < start=${current.start}.` },
    });

    while (heap.length && heap[0].end < current.start) {
      const top = heap[0];
      pushStep({
        phase: "release", event: "check-compatible", line: 8, currentIndex: index,
        heapTop: top, compatible: true,
        title: { vi: `${top.end} < ${current.start} ✓ · #${top.id} đã kết thúc`, en: `${top.end} < ${current.start} ✓ · #${top.id} has ended` },
        note: { vi: `#${top.id} không overlap #${current.id}, nên có thể trở thành event thứ nhất.`, en: `#${top.id} does not overlap #${current.id}, so it may become the first event.` },
      });
      const popped = heap.shift();
      releasedIds.add(popped.id);
      pushStep({
        phase: "release", event: "pop-ended", line: 9, currentIndex: index,
        heapTop: popped, popped, compatible: true,
        title: { vi: `Pop #${popped.id} khỏi min-heap`, en: `Pop #${popped.id} from the min-heap` },
        note: { vi: `Heap chỉ giữ các event chưa kết thúc trước start=${current.start}.`, en: `The heap now keeps only events that have not ended before start=${current.start}.` },
      });
      const changed = isBetterPast(popped);
      if (changed) bestPast = popped;
      pushStep({
        phase: "past", event: changed ? "new-best-past" : "keep-best-past", line: 10,
        currentIndex: index, popped, compatible: true,
        title: changed
          ? { vi: `best_ended = ${popped.value} từ #${popped.id}`, en: `best_ended = ${popped.value} from #${popped.id}` }
          : { vi: `Giữ best_ended = ${bestPast.value} từ #${bestPast.id}`, en: `Keep best_ended = ${bestPast.value} from #${bestPast.id}` },
        note: changed
          ? { vi: `Trong các event đã kết thúc, #${popped.id} có value tốt nhất hiện tại.`, en: `Among ended events, #${popped.id} now has the best value.` }
          : { vi: `#${popped.id} có value ${popped.value}, không vượt best_ended=${bestPast.value}.`, en: `#${popped.id} has value ${popped.value}, which does not beat best_ended=${bestPast.value}.` },
      });
    }

    if (heap.length) {
      const top = heap[0];
      pushStep({
        phase: "release", event: "stop-overlap", line: 8, currentIndex: index,
        heapTop: top, compatible: false,
        title: { vi: `${top.end} < ${current.start} ✗ · dừng pop`, en: `${top.end} < ${current.start} ✗ · stop popping` },
        note: {
          vi: `#${top.id} kết thúc tại ${top.end}; vì thời gian là inclusive, end = start cũng vẫn overlap.`,
          en: `#${top.id} ends at ${top.end}; because endpoints are inclusive, end = start still overlaps.`,
        },
      });
    } else {
      pushStep({
        phase: "release", event: "heap-clear", line: 8, currentIndex: index,
        compatible: null,
        title: { vi: "Heap không còn event cần kiểm tra", en: "No heap event remains to check" },
        note: { vi: "Tất cả event trước đó đã được giải phóng, hoặc đây là event đầu tiên.", en: "All earlier events have been released, or this is the first event." },
      });
    }

    const picks = [bestPast && bestPast.id, current.id].filter(Number.isInteger).sort((left, right) => left - right);
    candidate = { score: (bestPast ? bestPast.value : 0) + current.value, picks };
    pushStep({
      phase: "combine", event: "combine", line: 11, currentIndex: index,
      title: { vi: `${bestPast ? bestPast.value : 0} + ${current.value} = ${candidate.score}`, en: `${bestPast ? bestPast.value : 0} + ${current.value} = ${candidate.score}` },
      note: bestPast
        ? { vi: `Ghép #${bestPast.id} đã kết thúc với #${current.id} hiện tại.`, en: `Combine ended event #${bestPast.id} with current event #${current.id}.` }
        : { vi: `Chưa có event tương thích phía trước, nên phương án chỉ chọn #${current.id}.`, en: `No compatible earlier event exists, so this candidate takes only #${current.id}.` },
    });

    const changed = isBetterAnswer(candidate);
    if (changed) answer = cloneScore(candidate);
    processed.push({
      id: current.id,
      pastId: bestPast ? bestPast.id : null,
      pastValue: bestPast ? bestPast.value : 0,
      currentValue: current.value,
      candidate: candidate.score,
      answer: answer.score,
      picks: [...answer.picks],
    });
    pushStep({
      phase: "answer", event: changed ? "new-answer" : "keep-answer", line: 11,
      currentIndex: index, answerChanged: changed,
      title: changed
        ? { vi: `Cập nhật answer = ${answer.score}`, en: `Update answer = ${answer.score}` }
        : { vi: `Giữ answer = ${answer.score}`, en: `Keep answer = ${answer.score}` },
      note: changed
        ? { vi: `Phương án [${answer.picks.map((id) => `#${id}`).join(" + ")}] tốt nhất cho tới lúc này.`, en: `Choice [${answer.picks.map((id) => `#${id}`).join(" + ")}] is the best seen so far.` }
        : { vi: `Candidate ${candidate.score} không vượt đáp án ${answer.score}.`, en: `Candidate ${candidate.score} does not beat answer ${answer.score}.` },
    });

    pushHeap(current);
    pushStep({
      phase: "push", event: "push", line: 12, currentIndex: index,
      title: { vi: `Push #${current.id} với end=${current.end}`, en: `Push #${current.id} with end=${current.end}` },
      note: { vi: "Min-heap sắp theo end; event kết thúc sớm nhất luôn ở TOP.", en: "The min-heap is ordered by end, so the earliest ending event stays at TOP." },
    });
  }

  candidate = null;
  pushStep({
    phase: "done", event: "done", line: 13, final: true,
    title: { vi: `Đáp án lớn nhất = ${answer.score}`, en: `Maximum value = ${answer.score}` },
    note: {
      vi: `Chọn ${answer.picks.map((id) => `#${id}`).join(" + ")}; mỗi candidate luôn gồm nhiều nhất một event đã kết thúc và event hiện tại.`,
      en: `Choose ${answer.picks.map((id) => `#${id}`).join(" + ")}; every candidate contains at most one ended event plus the current event.`,
    },
  });
  return { input, original, answer: answer.score, picks: [...answer.picks], steps };
}

function parseIntervals3414(input) {
  const message = "Enter 1–12 intervals as l,r,w; l,r,w or as a JSON array [[l,r,w],...].";
  let intervals = input;
  if (!Array.isArray(intervals)) {
    const raw = String(input ?? "").trim();
    if (!raw) throw new Error(message);
    if (raw.startsWith("[")) {
      try {
        intervals = JSON.parse(raw);
      } catch (_error) {
        throw new Error(message);
      }
    } else {
      intervals = raw.split(";").map((part) => part.split(",").map((value) => Number(value.trim())));
    }
  }
  if (!Array.isArray(intervals) || intervals.length < 1 || intervals.length > 12
      || intervals.some((interval) => !Array.isArray(interval) || interval.length !== 3
        || interval.some((value) => !Number.isInteger(Number(value)))
        || Number(interval[0]) < 1 || Number(interval[0]) > Number(interval[1])
        || Number(interval[2]) < 1)) {
    throw new Error(message);
  }
  return intervals.map((interval) => interval.map(Number));
}

function lexCompare(left, right) {
  const size = Math.min(left.length, right.length);
  for (let index = 0; index < size; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return left.length - right.length;
}

function better3414(left, right) {
  if (left.score !== right.score) return left.score > right.score ? left : right;
  return lexCompare(left.picks, right.picks) <= 0 ? left : right;
}

function buildSteps3414(input) {
  const original = parseIntervals3414(input);
  const sorted = original
    .map(([start, end, weight], id) => ({ id, start, end, weight, prev: null }))
    .sort((a, b) => a.end - b.end || a.start - b.start || a.weight - b.weight || a.id - b.id);
  const ends = sorted.map((interval) => interval.end);
  const predecessors = new Array(sorted.length).fill(null);
  const dp = Array.from({ length: sorted.length + 1 }, () => Array(5).fill(null));
  for (let capacity = 0; capacity <= 4; capacity += 1) dp[0][capacity] = { score: 0, picks: [] };
  for (let row = 1; row <= sorted.length; row += 1) dp[row][0] = { score: 0, picks: [] };
  const steps = [];
  const stages = [
    { vi: "Sort theo end", en: "Sort by end" },
    { vi: "Tìm prev", en: "Find prev" },
    { vi: "DP Take / Skip", en: "DP Take / Skip" },
    { vi: "Trả đáp án", en: "Return answer" },
  ];

  const cloneCandidate = (candidate) => candidate ? { score: candidate.score, picks: [...candidate.picks] } : null;
  const snapshot = ({
    phase, stage, event, codeLines, title, note, activeRow = null, prevRow = null,
    activeCapacity = null, decision = null, final = false,
  }) => {
    const answer = dp[sorted.length][4];
    const completedCells = dp.slice(1).reduce((count, row) => (
      count + row.slice(1).filter(Boolean).length
    ), 0);
    steps.push({
      title, note, codeLines, final,
      arr: sorted.map((interval) => interval.weight),
      highlight: Number.isInteger(activeRow) ? [activeRow] : [],
      mark: [],
      vars: [
        { name: "i", value: Number.isInteger(activeRow) ? activeRow : "—" },
        { name: "k", value: Number.isInteger(activeCapacity) ? activeCapacity : "—" },
        { name: "prev[i]", value: Number.isInteger(activeRow) ? (predecessors[activeRow] ?? "—") : "—" },
        { name: "skip", value: decision?.skip?.score ?? "—" },
        { name: "base", value: decision?.base?.score ?? "—" },
        { name: "take", value: decision?.take?.score ?? "—" },
        { name: "best score", value: decision?.winner?.score ?? answer?.score ?? 0 },
        { name: "indices", value: decision?.winner ? [...decision.winner.picks] : answer ? [...answer.picks] : [] },
      ],
      weightedIntervals3414View: {
        stages,
        stage,
        phase,
        event,
        original: original.map((interval) => [...interval]),
        intervals: sorted.map((interval, row) => ({ ...interval, prev: predecessors[row] })),
        predecessors: [...predecessors],
        dp: dp.map((dpRow) => dpRow.map(cloneCandidate)),
        activeRow,
        prevRow,
        activeCapacity,
        decision: decision ? {
          skip: cloneCandidate(decision.skip),
          base: cloneCandidate(decision.base),
          take: cloneCandidate(decision.take),
          winner: cloneCandidate(decision.winner),
          choice: decision.choice || null,
          reason: decision.reason || null,
          step: decision.step,
        } : null,
        completedCells,
        totalCells: sorted.length * 4,
        answer: final && answer ? [...answer.picks] : null,
        answerScore: final && answer ? answer.score : null,
      },
    });
  };

  snapshot({
    phase: "sort", stage: 0, event: "sort", codeLines: [4],
    title: { vi: "Sort các interval theo điểm kết thúc", en: "Sort intervals by ending point" },
    note: {
      vi: `Nhãn # giữ index gốc. Sau sort: ${sorted.map((interval) => `#${interval.id}[${interval.start},${interval.end}]`).join(" · ")}.`,
      en: `The # labels retain original indices. Sorted order: ${sorted.map((interval) => `#${interval.id}[${interval.start},${interval.end}]`).join(" · ")}.`,
    },
  });

  snapshot({
    phase: "sort", stage: 0, event: "build-ends", codeLines: [5],
    title: { vi: `Tách mảng ends = [${ends.join(", ")}]`, en: `Build ends = [${ends.join(", ")}]` },
    note: {
      vi: "Mảng end đã tăng dần, nên mỗi prev[i] có thể tìm nhanh bằng binary search.",
      en: "The end points are sorted, so every prev[i] can be found quickly with binary search.",
    },
  });

  for (let index = 0; index < sorted.length; index += 1) {
    const interval = sorted[index];
    let low = 0;
    let high = index;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (ends[middle] < interval.start) low = middle + 1;
      else high = middle;
    }
    const predecessor = low - 1;
    predecessors[index] = predecessor;
    sorted[index].prev = predecessor;
    snapshot({
      phase: "predecessor", stage: 1, event: "find-prev", codeLines: [6], activeRow: index,
      prevRow: predecessor >= 0 ? predecessor : null,
      title: predecessor >= 0
        ? { vi: `prev[${index}] = ${predecessor}`, en: `prev[${index}] = ${predecessor}` }
        : { vi: `prev[${index}] = −1`, en: `prev[${index}] = −1` },
      note: predecessor >= 0
        ? {
          vi: `#${sorted[predecessor].id} kết thúc ở ${sorted[predecessor].end} < ${interval.start}, nên là interval tương thích gần nhất trước #${interval.id}.`,
          en: `#${sorted[predecessor].id} ends at ${sorted[predecessor].end} < ${interval.start}, so it is the nearest compatible interval before #${interval.id}.`,
        }
        : {
          vi: `Không có end < ${interval.start}. Dùng dấu < nghiêm ngặt vì hai interval chạm biên vẫn bị xem là overlap.`,
          en: `No ending point is < ${interval.start}. The strict < matters because intervals touching at a boundary still overlap.`,
        },
    });
  }

  snapshot({
    phase: "initialize", stage: 2, event: "init-dp", codeLines: [7],
    title: { vi: "Khởi tạo hàng DP rỗng", en: "Initialize the empty DP row" },
    note: {
      vi: "dp[i][k] lưu lựa chọn tốt nhất khi chỉ dùng i interval đầu trong thứ tự đã sort và được chọn tối đa k interval.",
      en: "dp[i][k] stores the best choice using only the first i intervals in sorted order and selecting at most k intervals.",
    },
  });

  for (let index = 0; index < sorted.length; index += 1) {
    const interval = sorted[index];
    for (let capacity = 1; capacity <= 4; capacity += 1) {
      const skip = dp[index][capacity];
      snapshot({
        phase: "dp", stage: 2, event: "read-skip", codeLines: [16],
        activeRow: index, prevRow: predecessors[index] >= 0 ? predecessors[index] : null,
        activeCapacity: capacity, decision: { skip, step: "skip" },
        title: { vi: `Ô dp[${index + 1}][${capacity}] · tính phương án SKIP`, en: `Cell dp[${index + 1}][${capacity}] · compute SKIP` },
        note: {
          vi: `Nếu bỏ #${interval.id}, giữ nguyên dp[${index}][${capacity}] = score ${skip.score}, indices [${skip.picks.join(", ")}].`,
          en: `If #${interval.id} is skipped, keep dp[${index}][${capacity}] = score ${skip.score}, indices [${skip.picks.join(", ")}].`,
        },
      });

      const base = dp[predecessors[index] + 1][capacity - 1];
      snapshot({
        phase: "dp", stage: 2, event: "read-take-base", codeLines: [17],
        activeRow: index, prevRow: predecessors[index] >= 0 ? predecessors[index] : null,
        activeCapacity: capacity, decision: { skip, base, step: "base" },
        title: { vi: `TAKE bắt đầu từ dp[${predecessors[index] + 1}][${capacity - 1}]`, en: `TAKE starts from dp[${predecessors[index] + 1}][${capacity - 1}]` },
        note: predecessors[index] >= 0
          ? {
            vi: `Hàng ${predecessors[index] + 1} chỉ chứa các interval kết thúc trước #${interval.id}; còn ${capacity - 1} lượt chọn trước khi thêm nó.`,
            en: `Row ${predecessors[index] + 1} contains only intervals ending before #${interval.id}; ${capacity - 1} pick(s) remain before adding it.`,
          }
          : {
            vi: `Không có interval tương thích phía trước, nên TAKE dùng hàng 0 rỗng với score ${base.score}.`,
            en: `There is no compatible earlier interval, so TAKE uses empty row 0 with score ${base.score}.`,
          },
      });

      const take = {
        score: base.score + interval.weight,
        picks: [...base.picks, interval.id].sort((a, b) => a - b),
      };
      snapshot({
        phase: "dp", stage: 2, event: "build-take", codeLines: [18],
        activeRow: index, prevRow: predecessors[index] >= 0 ? predecessors[index] : null,
        activeCapacity: capacity, decision: { skip, base, take, step: "take" },
        title: { vi: `Cộng weight ${interval.weight} → TAKE score ${take.score}`, en: `Add weight ${interval.weight} → TAKE score ${take.score}` },
        note: {
          vi: `TAKE = score gốc ${base.score} + ${interval.weight}; indices trở thành [${take.picks.join(", ")}].`,
          en: `TAKE = base score ${base.score} + ${interval.weight}; indices become [${take.picks.join(", ")}].`,
        },
      });

      const winner = better3414(skip, take);
      const choice = winner === take ? "take" : "skip";
      let reason;
      if (skip.score !== take.score) reason = choice === "take" ? "higher-score" : "lower-score";
      else reason = choice === "take" ? "lexicographically-smaller-take" : "lexicographically-smaller-skip";
      dp[index + 1][capacity] = cloneCandidate(winner);
      snapshot({
        phase: "dp", stage: 2, event: choice, codeLines: [19],
        activeRow: index, prevRow: predecessors[index] >= 0 ? predecessors[index] : null,
        activeCapacity: capacity, decision: { skip, base, take, winner, choice, reason, step: "winner" },
        title: choice === "take"
          ? { vi: `dp[${index + 1}][${capacity}]: TAKE #${interval.id}`, en: `dp[${index + 1}][${capacity}]: TAKE #${interval.id}` }
          : { vi: `dp[${index + 1}][${capacity}]: SKIP #${interval.id}`, en: `dp[${index + 1}][${capacity}]: SKIP #${interval.id}` },
        note: skip.score === take.score
          ? {
            vi: `Cùng score ${skip.score}; so [${skip.picks.join(",")}] với [${take.picks.join(",")}], giữ mảng index nhỏ hơn theo thứ tự từ điển.`,
            en: `Both score ${skip.score}; compare [${skip.picks.join(",")}] with [${take.picks.join(",")}], keeping the lexicographically smaller index array.`,
          }
          : {
            vi: `SKIP được ${skip.score}; TAKE lấy dp[${predecessors[index] + 1}][${capacity - 1}] + ${interval.weight} = ${take.score}. Chọn score lớn hơn.`,
            en: `SKIP scores ${skip.score}; TAKE uses dp[${predecessors[index] + 1}][${capacity - 1}] + ${interval.weight} = ${take.score}. Keep the larger score.`,
          },
      });
    }
  }

  const result = dp[sorted.length][4];
  snapshot({
    phase: "done", stage: 3, event: "done", codeLines: [20], final: true,
    title: { vi: `Đáp án [${result.picks.join(", ")}] · score ${result.score}`, en: `Answer [${result.picks.join(", ")}] · score ${result.score}` },
    note: {
      vi: "Các index được trả theo thứ tự tăng dần; nếu nhiều lựa chọn cùng tổng trọng số, DP đã giữ mảng nhỏ nhất theo thứ tự từ điển.",
      en: "Returned indices are sorted increasingly; whenever total weights tied, the DP retained the lexicographically smallest array.",
    },
  });
  return { input, original, answer: [...result.picks], score: result.score, steps };
}

module.exports = {
  2054: {
    id: 2054,
    difficulty: "medium",
    slug: "two-best-non-overlapping-events",
    category: HEAP_CATEGORY,
    tags: [HEAP_TAG, SORTING_TAG, INTERVAL_TAG],
    title: { vi: "Two Best Non-Overlapping Events", en: "Two Best Non-Overlapping Events" },
    titleVi: { vi: "Hai sự kiện không chồng nhau có tổng lớn nhất", en: "Two best non-overlapping events" },
    statement: {
      vi: "Cho events[i] = [startᵢ, endᵢ, valueᵢ]. Chọn nhiều nhất hai event không chồng nhau để tổng value lớn nhất. Hai đầu mút là inclusive, nên event tiếp theo phải bắt đầu sau end của event trước.",
      en: "Given events[i] = [startᵢ, endᵢ, valueᵢ], choose at most two non-overlapping events with maximum total value. Endpoints are inclusive, so the next event must start after the previous event ends.",
    },
    defaultInput: "1,3,2;4,5,2;2,4,3",
    inputKind: "string",
    inputLabel: { vi: "events: start,end,value; …", en: "events: start,end,value; …" },
    extraParams: [],
    approach: [
      { vi: "Sort event theo start tăng dần; min-heap giữ các event trước theo end.", en: "Sort events by increasing start; a min-heap keeps earlier events ordered by end." },
      { vi: "Trước mỗi event hiện tại, pop mọi event có end < start. Dấu < nghiêm ngặt vì thời gian inclusive.", en: "Before each current event, pop every event with end < start. The strict < is required because times are inclusive." },
      { vi: "best_ended lưu value lớn nhất của đúng một event đã kết thúc; candidate = best_ended + value hiện tại.", en: "best_ended stores the largest value of one ended event; candidate = best_ended + the current value." },
      { vi: "Cập nhật answer rồi push event hiện tại vào heap để dùng cho các event sau.", en: "Update the answer, then push the current event into the heap for later events." },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: { vi: "Mỗi event được push và pop khỏi heap đúng một lần.", en: "Each event is pushed to and popped from the heap once." },
    },
    code: [
      "import heapq",
      "class Solution:",
      "    def maxTwoEvents(self, events):",
      "        events.sort()",
      "        heap = []",
      "        best_ended = answer = 0",
      "        for start, end, value in events:",
      "            while heap and heap[0][0] < start:",
      "                _, ended_value = heapq.heappop(heap)",
      "                best_ended = max(best_ended, ended_value)",
      "            answer = max(answer, best_ended + value)",
      "            heapq.heappush(heap, (end, value))",
      "        return answer",
    ],
    liveArgs: (input) => [parseEvents2054(input)],
    builder: buildSteps2054,
  },
  3414: {
    id: 3414,
    difficulty: "hard",
    slug: "maximum-score-of-non-overlapping-intervals",
    category: DP_CATEGORY,
    tags: [DP_TAG, BINARY_SEARCH_TAG, SORTING_TAG, INTERVAL_TAG],
    title: { vi: "Maximum Score of Non-overlapping Intervals", en: "Maximum Score of Non-overlapping Intervals" },
    titleVi: { vi: "Tổng điểm lớn nhất của các interval không chồng nhau", en: "Maximum score from non-overlapping intervals" },
    statement: {
      vi: "Cho intervals[i] = [lᵢ, rᵢ, weightᵢ]. Chọn tối đa 4 interval không chồng nhau để tổng weight lớn nhất; nếu hòa, trả mảng index nhỏ nhất theo thứ tự từ điển. Hai interval chạm chung một điểm vẫn overlap.",
      en: "Given intervals[i] = [lᵢ, rᵢ, weightᵢ], choose at most four non-overlapping intervals with maximum total weight; on ties, return the lexicographically smallest index array. Intervals sharing a point still overlap.",
    },
    defaultInput: "1,3,2;4,5,2;1,5,5;6,9,3;6,7,1;8,9,1",
    inputKind: "string",
    inputLabel: { vi: "intervals: l,r,weight; …", en: "intervals: l,r,weight; …" },
    extraParams: [],
    approach: [
      { vi: "Gắn index gốc rồi sort interval theo end tăng dần.", en: "Attach original indices, then sort intervals by increasing end." },
      { vi: "Dùng binary search tìm prev[i]: interval cuối có end < start[i].", en: "Use binary search to find prev[i], the last interval with end < start[i]." },
      { vi: "DP với k = 1..4: SKIP interval i hoặc TAKE nó sau trạng thái prev[i].", en: "For k = 1..4, DP either SKIPs interval i or TAKEs it after state prev[i]." },
      { vi: "So sánh theo score trước, rồi theo mảng index tăng dần để xử lý tie-break.", en: "Compare by score first, then by the sorted index array for lexicographic tie-breaking." },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: { vi: "Sort và n lần binary search chi phối; bảng DP chỉ có 5 cột.", en: "Sorting and n binary searches dominate; the DP table has only five columns." },
    },
    code: [
      "from bisect import bisect_left",
      "class Solution:",
      "    def maximumWeight(self, intervals):",
      "        items = sorted((r, l, w, i) for i, (l, r, w) in enumerate(intervals))",
      "        ends = [r for r, l, w, i in items]",
      "        prev = [bisect_left(ends, l) - 1 for r, l, w, i in items]",
      "        dp = [[(0, []) for _ in range(5)] for _ in range(len(items) + 1)]",
      "",
      "        def better(a, b):",
      "            if a[0] != b[0]:",
      "                return a if a[0] > b[0] else b",
      "            return a if a[1] < b[1] else b",
      "",
      "        for i, (r, l, w, original_i) in enumerate(items):",
      "            for k in range(1, 5):",
      "                skip = dp[i][k]",
      "                score, picked = dp[prev[i] + 1][k - 1]",
      "                take = (score + w, sorted(picked + [original_i]))",
      "                dp[i + 1][k] = better(skip, take)",
      "        return dp[len(items)][4][1]",
    ],
    liveArgs: (input) => [parseIntervals3414(input)],
    builder: buildSteps3414,
  },
};
