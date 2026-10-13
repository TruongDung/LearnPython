"use strict";

const bi = (vi, en) => ({ vi, en });
const MAX_FLOWERS_2251 = 12;
const MAX_PEOPLE_2251 = 8;
const MAX_TIME_2251 = 1_000_000_000;

const SOURCE_2251 = [
  "from typing import List",
  "",
  "class Solution:",
  "    def fullBloomFlowers(self, flowers: List[List[int]], people: List[int]) -> List[int]:",
  "        starts = sorted(start for start, end in flowers)",
  "        ends = sorted(end for start, end in flowers)",
  "        answer = []",
  "        for time in people:",
  "            blooming = 0",
  "            lo, hi = 0, len(starts)",
  "            while lo < hi:",
  "                mid = (lo + hi) // 2",
  "                if starts[mid] <= time:",
  "                    lo = mid + 1",
  "                else:",
  "                    hi = mid",
  "            blooming += lo",
  "            lo, hi = 0, len(ends)",
  "            while lo < hi:",
  "                mid = (lo + hi) // 2",
  "                if ends[mid] < time:",
  "                    lo = mid + 1",
  "                else:",
  "                    hi = mid",
  "            answer.append(blooming - lo)",
  "        return answer",
];
const BISECT_SOURCE_2251 = [
  "from typing import List",
  "from bisect import bisect_left, bisect_right",
  "",
  "class Solution:",
  "    def fullBloomFlowers(self, flowers: List[List[int]], people: List[int]) -> List[int]:",
  "        starts = sorted(start for start, end in flowers)",
  "        ends = sorted(end for start, end in flowers)",
  "        answer = []",
  "        for time in people:",
  "            started = bisect_right(starts, time)",
  "            ended = bisect_left(ends, time)",
  "            answer.append(started - ended)",
  "        return answer",
];

function parseFullBloomInput2251(input) {
  let data = input;
  if (typeof input === "string") {
    try {
      data = JSON.parse(input);
    } catch (_error) {
      throw new Error('2251: enter JSON like {"flowers":[[1,6],[3,7]],"people":[2,3]}.');
    }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("2251: input must be an object with flowers and people arrays.");
  }
  const { flowers, people } = data;
  if (!Array.isArray(flowers) || flowers.length < 1 || flowers.length > MAX_FLOWERS_2251) {
    throw new Error(`2251: enter 1–${MAX_FLOWERS_2251} flower intervals.`);
  }
  if (!Array.isArray(people) || people.length < 1 || people.length > MAX_PEOPLE_2251) {
    throw new Error(`2251: enter 1–${MAX_PEOPLE_2251} people times.`);
  }
  const parsedFlowers = flowers.map((interval, index) => {
    if (!Array.isArray(interval) || interval.length !== 2
      || interval.some((time) => !Number.isSafeInteger(time) || time < 0 || time > MAX_TIME_2251)
      || interval[0] > interval[1]) {
      throw new Error(`2251: flower ${index + 1} must be [start, end] with 0 ≤ start ≤ end ≤ ${MAX_TIME_2251}.`);
    }
    return [...interval];
  });
  if (people.some((time) => !Number.isSafeInteger(time) || time < 0 || time > MAX_TIME_2251)) {
    throw new Error(`2251: each person's time must be an integer from 0 to ${MAX_TIME_2251}.`);
  }
  return { flowers: parsedFlowers, people: [...people] };
}

function buildSteps2251(input) {
  const { flowers, people } = parseFullBloomInput2251(input);
  const starts = flowers.map(([start]) => start).sort((a, b) => a - b);
  const ends = flowers.map(([, end]) => end).sort((a, b) => a - b);
  const answers = Array(people.length).fill(null);
  const steps = [];
  let activePerson = null;
  let search = null;
  let bounds = { starts: null, ends: null };

  function emit(event, title, note, codeLines, { final = false } = {}) {
    steps.push({
      title,
      note,
      codeLines,
      final,
      arr: [...starts],
      sub: [...ends],
      highlight: search && search.mid !== null ? [search.mid] : [],
      mark: activePerson === null ? [] : [activePerson],
      vars: [
        { name: "time", value: activePerson === null ? "—" : people[activePerson] },
        { name: "lo / hi", value: search ? `${search.lo} / ${search.hi}` : "—" },
        { name: "starts ≤ time", value: search?.phase === "starts" ? search.count : "—" },
        { name: "ends < time", value: search?.phase === "ends" ? search.count : "—" },
        { name: "answer", value: final ? JSON.stringify(answers) : answers.map((answer) => answer === null ? "—" : answer).join(", ") },
      ],
      fullBloomFlowers2251View: {
        event,
        flowers: flowers.map((flower) => [...flower]),
        starts: [...starts],
        ends: [...ends],
        people: [...people],
        answers: [...answers],
        activePerson,
        search: search ? { ...search } : null,
        bounds: { ...bounds },
        final,
        answer: final ? [...answers] : null,
      },
    });
  }

  emit(
    "intro",
    bi("Tách số hoa đang nở thành hai phép đếm", "Split blooming flowers into two counts"),
    bi(
      `${flowers.length} khoảng nở và ${people.length} thời điểm. Hoa nở trong khoảng đóng [bắt đầu, kết thúc].`,
      `${flowers.length} bloom intervals and ${people.length} visit times. Bloom intervals are inclusive at both ends.`,
    ),
    [4, 5, 6, 8, 24],
  );
  emit(
    "sorted",
    bi("Sắp xếp riêng giờ bắt đầu và kết thúc", "Sort start and end times independently"),
    bi(
      `starts = [${starts.join(", ")}]; ends = [${ends.join(", ")}]. Với thời điểm t, đáp án là số starts ≤ t trừ số ends < t.`,
      `starts = [${starts.join(", ")}]; ends = [${ends.join(", ")}]. At time t, count starts ≤ t minus ends < t.`,
    ),
    [5, 6],
  );

  people.forEach((time, personIndex) => {
    activePerson = personIndex;
    bounds = { starts: null, ends: null };
    let low = 0;
    let high = starts.length;
    search = { phase: "starts", target: time, lo: low, hi: high, mid: null, count: null, comparison: null };
    emit(
      "person",
      bi(`Xét người ${personIndex} tại thời điểm ${time}`, `Process person ${personIndex} at time ${time}`),
      bi("Tìm upper bound của time trong starts: số giờ bắt đầu không lớn hơn thời điểm này.", "Find the upper bound of time in starts: how many flowers have started by this visit."),
      [8, 9, 10],
    );
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const started = starts[mid] <= time;
      search = { phase: "starts", target: time, lo: low, hi: high, mid, count: null, comparison: `${starts[mid]} <= ${time} → ${started}` };
      emit(
        "search-starts",
        bi(`starts[${mid}] = ${starts[mid]} ≤ ${time}? ${started}`, `starts[${mid}] = ${starts[mid]} ≤ ${time}? ${started}`),
        started
          ? bi("Hoa này đã bắt đầu nở; upper bound nằm bên phải mid.", "This flower has started blooming; move the upper-bound search right.")
          : bi("Hoa này chưa bắt đầu; upper bound nằm tại mid hoặc bên trái.", "This flower has not started yet; keep the upper bound at mid or to the left."),
        [11, 12, 13, 14],
      );
      if (started) low = mid + 1;
      else high = mid;
    }
    const startedCount = low;
    bounds.starts = startedCount;
    search = { phase: "starts", target: time, lo: low, hi: high, mid: null, count: startedCount, comparison: null };
    emit(
      "starts-count",
      bi(`${startedCount} hoa đã bắt đầu nở tại ${time}`, `${startedCount} flowers have started by ${time}`),
      bi(`upper_bound(starts, ${time}) = ${startedCount}. Bây giờ đếm số hoa đã kết thúc trước thời điểm này.`, `upper_bound(starts, ${time}) = ${startedCount}. Now count flowers that ended before this time.`),
      [16, 17],
    );

    low = 0;
    high = ends.length;
    search = { phase: "ends", target: time, lo: low, hi: high, mid: null, count: null, comparison: null };
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const ended = ends[mid] < time;
      search = { phase: "ends", target: time, lo: low, hi: high, mid, count: null, comparison: `${ends[mid]} < ${time} → ${ended}` };
      emit(
        "search-ends",
        bi(`ends[${mid}] = ${ends[mid]} < ${time}? ${ended}`, `ends[${mid}] = ${ends[mid]} < ${time}? ${ended}`),
        ended
          ? bi("Hoa đã tàn trước time; lower bound nằm bên phải mid.", "This flower ended before time; move the lower-bound search right.")
          : bi("Hoa vẫn nở tại time hoặc kết thúc sau đó; giữ mid ở nửa phải ứng viên.", "This flower is still blooming at time or ends later; keep mid in the candidate range."),
        [18, 19, 20, 21],
      );
      if (ended) low = mid + 1;
      else high = mid;
    }
    const endedCount = low;
    bounds.ends = endedCount;
    answers[personIndex] = startedCount - endedCount;
    search = { phase: "result", target: time, lo: low, hi: high, mid: null, count: endedCount, startedCount, comparison: null };
    emit(
      "result",
      bi(`${startedCount} − ${endedCount} = ${answers[personIndex]} hoa`, `${startedCount} − ${endedCount} = ${answers[personIndex]} flowers`),
      bi(
        `Có ${startedCount} hoa đã bắt đầu và ${endedCount} hoa kết thúc trước ${time}; hoa kết thúc đúng lúc ${time} vẫn được tính.`,
        `${startedCount} flowers have started and ${endedCount} ended before ${time}; flowers ending exactly at ${time} are still counted.`,
      ),
      [25],
    );
  });

  activePerson = null;
  search = null;
  bounds = { starts: null, ends: null };
  emit(
    "done",
    bi("Hoàn tất số hoa nở cho mọi người", "Bloom counts for everyone are complete"),
    bi(`Kết quả theo thứ tự people: [${answers.join(", ")}].`, `Answers in people order: [${answers.join(", ")}].`),
    [25, 26],
    { final: true },
  );
  return { original: { flowers, people }, answer: answers, steps };
}

const DEFAULT_INPUT_2251 = {
  flowers: [[1, 6], [3, 7], [9, 12], [4, 13]],
  people: [2, 3, 7, 11],
};

function buildBisectSteps2251(input) {
  const { flowers, people } = parseFullBloomInput2251(input);
  const starts = flowers.map(([start]) => start).sort((a, b) => a - b);
  const ends = flowers.map(([, end]) => end).sort((a, b) => a - b);
  const answers = Array(people.length).fill(null);
  const steps = [];
  let activePerson = null;
  let search = null;
  let bounds = { starts: null, ends: null };
  // Emulate the library's insertion indices; the trace shows each bisect call,
  // not a second copy of the manual binary-search implementation.
  const insertionIndex = (values, target, right) => {
    let lo = 0, hi = values.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (values[mid] < target || right && values[mid] === target) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  const emit = (event, title, codeLines, final = false) => {
    steps.push({
      title, note: bi("", ""), codeLines, codeBlock: 2, final,
      arr: [...starts], sub: [...ends], highlight: [], mark: activePerson === null ? [] : [activePerson],
      vars: [
        { name: "time", value: activePerson === null ? "—" : people[activePerson] },
        { name: "started", value: bounds.starts ?? "—" },
        { name: "ended", value: bounds.ends ?? "—" },
        { name: "answer", value: answers.map((value) => value === null ? "—" : value).join(", ") },
      ],
      fullBloomFlowers2251View: {
        event, method: 2, flowers: flowers.map((flower) => [...flower]), starts: [...starts], ends: [...ends],
        people: [...people], answers: [...answers], activePerson, bounds: { ...bounds }, search: search ? { ...search } : null,
        final, answer: final ? [...answers] : null,
      },
    });
  };
  emit("intro", bi("Đếm bằng bisect_left và bisect_right", "Count with bisect_left and bisect_right"), [5]);
  emit("sorted", bi("Sắp xếp starts và ends", "Sort starts and ends"), [6, 7, 8]);
  people.forEach((time, personIndex) => {
    activePerson = personIndex;
    bounds = { starts: null, ends: null };
    search = null;
    emit("person", bi(`P${personIndex} · t = ${time}`, `P${personIndex} · t = ${time}`), [9]);
    bounds.starts = insertionIndex(starts, time, true);
    search = { phase: "starts", target: time, lo: bounds.starts, hi: bounds.starts, mid: null, count: bounds.starts };
    emit("bisect-starts", bi(`bisect_right(starts, ${time}) = ${bounds.starts}`, `bisect_right(starts, ${time}) = ${bounds.starts}`), [10]);
    bounds.ends = insertionIndex(ends, time, false);
    search = { phase: "ends", target: time, lo: bounds.ends, hi: bounds.ends, mid: null, count: bounds.ends, startedCount: bounds.starts };
    emit("bisect-ends", bi(`bisect_left(ends, ${time}) = ${bounds.ends}`, `bisect_left(ends, ${time}) = ${bounds.ends}`), [11]);
    answers[personIndex] = bounds.starts - bounds.ends;
    search = { ...search, phase: "result" };
    emit("result", bi(`${bounds.starts} − ${bounds.ends} = ${answers[personIndex]} hoa`, `${bounds.starts} − ${bounds.ends} = ${answers[personIndex]} flowers`), [12]);
  });
  activePerson = null;
  search = null;
  bounds = { starts: null, ends: null };
  emit("done", bi("Kết quả theo thứ tự people", "Results in people order"), [13], true);
  return { original: { flowers, people }, answer: answers, steps };
}

module.exports = {
  2251: {
    id: 2251,
    difficulty: "hard",
    slug: "number-of-flowers-in-full-bloom",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    tags: [
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
      { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
    ],
    title: bi("Number of Flowers in Full Bloom", "Number of Flowers in Full Bloom"),
    titleVi: bi("Số lượng hoa đang nở", "Number of flowers in full bloom"),
    statement: bi(
      `Cho các khoảng nở [start, end] và thời điểm mỗi người đến thăm vườn. Với mỗi người, đếm số hoa đang nở tại thời điểm đó; hai đầu mút của khoảng đều được tính. Visualization giới hạn tối đa ${MAX_FLOWERS_2251} hoa và ${MAX_PEOPLE_2251} người.`,
      `Given flower bloom intervals [start, end] and each person's garden-visit time, count the flowers in bloom for every person. Both interval endpoints are inclusive. This visualization supports up to ${MAX_FLOWERS_2251} flowers and ${MAX_PEOPLE_2251} people.`,
    ),
    inputKind: "string",
    inputLabel: bi(
      'Dữ liệu JSON: {"flowers":[[1,6],[3,7]],"people":[2,3]}',
      'JSON input: {"flowers":[[1,6],[3,7]],"people":[2,3]}',
    ),
    defaultInput: JSON.stringify(DEFAULT_INPUT_2251),
    extraParams: [{
      key: "approach", label: bi("Cách giải", "Approach"), type: "select", default: "1",
      options: [
        { value: "1", label: bi("1 · Tự viết binary search", "1 · Manual binary search") },
        { value: "2", label: bi("2 · bisect_right và bisect_left", "2 · bisect_right and bisect_left") },
      ],
    }],
    debugMode: "line-by-line",
    approach: [
      bi("Tách mọi thời điểm bắt đầu và kết thúc thành hai mảng rồi sắp xếp độc lập.", "Extract and independently sort all start and end times."),
      bi("Với thời điểm t, upper bound trong starts đếm hoa đã bắt đầu (start ≤ t).", "For time t, upper bound in starts counts flowers that have started (start ≤ t)."),
      bi("Lower bound trong ends đếm hoa kết thúc trước t (end < t); trừ hai số để giữ tính đóng của khoảng.", "Lower bound in ends counts flowers ending before t (end < t); subtract to preserve inclusive intervals."),
      bi("Cách 2: bisect_right(starts, t) − bisect_left(ends, t). Right đứng sau mọi start = t; left đứng trước mọi end = t.", "Approach 2: bisect_right(starts, t) − bisect_left(ends, t). Right follows all starts equal to t; left precedes all ends equal to t."),
      bi("Độ phức tạp: O(m log m + n log m), với m khoảng nở và n người.", "Complexity: O(m log m + n log m), for m intervals and n people."),
    ],
    complexity: {
      time: "O(m log m + n log m)",
      space: "O(m + n)",
      note: bi("m là số khoảng hoa; n là số người đến thăm.", "m is the number of flower intervals; n is the number of visitors."),
    },
    code: SOURCE_2251,
    codeLabel: bi("Cách 1: Tự viết binary search", "Approach 1: Manual binary search"),
    builder: buildSteps2251,
    code2: BISECT_SOURCE_2251,
    code2Label: bi("Cách 2: bisect_right và bisect_left", "Approach 2: bisect_right and bisect_left"),
    builder2: buildBisectSteps2251,
    complexity2: {
      time: "O(m log m + n log m)", space: "O(m + n)",
      note: bi("m là số hoa, n là số người. Mỗi bisect chạy O(log m).", "m flowers, n visitors. Each bisect runs in O(log m)."),
    },
    liveArgs: (input) => {
      const { flowers, people } = parseFullBloomInput2251(input);
      return [flowers, people];
    },
  },
};
